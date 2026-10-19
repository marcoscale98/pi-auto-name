// naming.ts — style prompts, single-title LLM call, fallback chain.
import { basename } from "node:path";
import type {
  Api,
  AssistantMessage,
  Context,
  Model,
  ModelsApiStreamOptions,
} from "@earendil-works/pi-ai";
import type { ExtensionAPI, ModelRegistry } from "@earendil-works/pi-coding-agent";
import type { Config } from "./config.js";
import type { NamingContext } from "./context.js";
import { buildLocale, fill, normalizeLanguageTag, type LocaleStrings } from "./i18n.js";
import {
  buildProjectSuffixTitle,
  cleanTitle,
  sanitizeSlug,
  topicWithoutProject,
  truncateToWordBoundary,
} from "./sanitize.js";
import { debug, debugEnabled } from "./debug.js";

/**
 * The session-bound values a naming run needs from `ExtensionContext`, captured
 * up front at the top of an event handler. Passing this snapshot through the
 * (possibly deferred) flow — rather than a live `ctx` — means the flow never
 * touches a stale-guarded ctx getter after an await, so a session replacement
 * or reload cannot invalidate it mid-run.
 */
export interface NamingSession {
  modelRegistry: ModelRegistry;
  model: Model<Api> | undefined;
  signal: AbortSignal | undefined;
}

// Import pi-ai only when generating a name, and cache the import across runs.
let _piAi: Promise<typeof import("@earendil-works/pi-ai")> | undefined;
function piAi(): Promise<typeof import("@earendil-works/pi-ai")> {
  return (_piAi ??= import("@earendil-works/pi-ai"));
}

export const RETRIES = 3;
export const UI_RENAME_TIMEOUT_MS = 10_000; // fire-and-forget UI budget (§11)

/** Default title limit for every enabled Pi and terminal surface. */
export const DEFAULT_MAX_TITLE_CHARS = 30;

export function titleBudget(cfg: Config): number {
  return cfg.titleMaxLength ?? DEFAULT_MAX_TITLE_CHARS;
}

function buildTopicProjectPrompt(input: {
  projectName?: string;
  cwd: string;
  firstUserMessage?: string;
  firstAssistantMessage?: string;
  conversation?: string;
  separator: string;
  maxChars: number;
  language: string;
  locale: LocaleStrings;
}): string {
  const { locale } = input;
  return fill(locale.topicProjectPromptTemplate, {
    language: input.language,
    titleMaxChars: input.maxChars,
    projectLines: input.projectName
      ? fill(locale.projectSuffixLines, {
          separator: input.separator,
          projectName: input.projectName,
        })
      : "",
    projectLine: input.projectName ? `${locale.projectLabel} ${input.projectName}\n` : "",
    cwd: input.cwd,
    firstUserBlock: input.firstUserMessage
      ? `\n${locale.firstUserMessageLabel}\n${input.firstUserMessage}`
      : "",
    firstAssistantBlock: input.firstAssistantMessage
      ? `\n\n${locale.firstAssistantMessageLabel}\n${input.firstAssistantMessage}`
      : "",
    conversationBlock: input.conversation
      ? fill(locale.conversationSection, { conversation: input.conversation })
      : "",
  });
}

function systemPromptFor(style: Config["namingStyle"], locale: LocaleStrings, cfg: Config): string {
  const lengthVariables = { titleMaxChars: titleBudget(cfg) };
  let base: string;
  switch (style) {
    case "slug":
      base = fill(locale.slugSystemPrompt, lengthVariables);
      break;
    case "topic-project":
      base = fill(locale.topicProjectSystemPrompt, lengthVariables);
      break;
    case "natural":
      base = fill(locale.naturalSystemPrompt, lengthVariables);
      break;
  }
  // topic-project declares the language in its user template; natural/slug
  // prompts also receive an explicit directive so English-biased models honor
  // the configured output language.
  if (style === "natural" || style === "slug") {
    const directive = fill(locale.languageDirective, {
      language: normalizeLanguageTag(cfg.language),
    });
    return `${directive}\n\n${base}`;
  }
  return base;
}

/** Structural subset of pi.exec used by the anchor lookup. */
export type Exec = (
  command: string,
  args: string[],
  options?: { cwd?: string },
) => Promise<{ stdout: string; stderr: string; code: number; killed: boolean }>;

/** Uniqueness hints for the naming prompt (sibling-session distinguishability). */
export interface NamingAnchor {
  /** Working-directory basename, e.g. "pi-extensions". */
  cwd?: string;
  /** Git branch name, e.g. "feat/oauth-retry". */
  branch?: string;
}

/** The `<context>` block; `cwd:` / `branch:` are structural markers (§9.1). */
export function buildAnchorBlock(anchor: NamingAnchor | undefined): string {
  const lines: string[] = [];
  if (anchor?.cwd) lines.push(`cwd: ${anchor.cwd}`);
  if (anchor?.branch) lines.push(`branch: ${anchor.branch}`);
  return lines.length ? `<context>\n${lines.join("\n")}\n</context>\n\n` : "";
}

/**
 * Resolve the cwd basename + git branch as uniqueness hints for the naming
 * prompt. The git call runs in the session's cwd — the host exec may default
 * to a different directory (launch dir, /cd inside pi, RPC mode). Failures
 * (no git repo, no branch) silently drop the missing fields.
 */
export async function resolveNamingAnchor(exec: Exec, cwd: string): Promise<NamingAnchor> {
  const anchor: NamingAnchor = {};
  const base = basename(cwd);
  if (base) anchor.cwd = base;
  try {
    const result = await exec("git", ["branch", "--show-current"], { cwd });
    const branch = result.stdout.trim();
    if (branch) anchor.branch = branch;
  } catch {
    // not a git repository — branch hint unavailable
  }
  return anchor;
}

function renderPrompt(
  style: Config["namingStyle"],
  context: NamingContext,
  cfg: Config,
  cwd: string,
  anchor: NamingAnchor,
): string {
  const language = normalizeLanguageTag(cfg.language);
  const locale = buildLocale(language);
  const first = context.firstUserMessage;
  const recent = context.recentUserMessages.length
    ? context.recentUserMessages.map((m, i) => `${i + 1}. ${m}`).join("\n")
    : locale.noneLabel;
  const anchorBlock = buildAnchorBlock(anchor);
  const format = `\n\n${locale.responseFormat}`;

  if (style === "topic-project") {
    return (
      anchorBlock +
      buildTopicProjectPrompt({
        projectName: basename(cwd).trim() || undefined,
        cwd,
        firstUserMessage: first || undefined,
        firstAssistantMessage: context.firstAssistantMessage,
        conversation: context.fullText,
        separator: "｜",
        maxChars: titleBudget(cfg),
        language,
        locale,
      }) +
      format
    );
  }

  const base = context.fullText
    ? ""
    : fill(locale.namingContextTemplate, {
        firstUserMessageLabel: locale.firstUserMessageLabel,
        first,
        recent,
      });
  const extra = context.fullText
    ? fill(locale.conversationSection, { conversation: context.fullText })
    : "";
  const rules = fill(locale.naturalRules, { titleMaxChars: titleBudget(cfg) });

  // Reinforce the output language in the user turn too — weak models attend to
  // the user message far more than the system prompt, so repeat the directive
  // here (the natural/slug scaffolding never names the language itself).
  const directive = fill(locale.languageDirective, { language });

  return `${directive}\n\n${rules}\n\n${anchorBlock}${base}${extra}${format}`;
}

async function resolveModel(
  modelRegistry: ModelRegistry,
  currentModel: Model<Api> | undefined,
  cfg: Config,
) {
  if (cfg.namingModel) {
    const slash = cfg.namingModel.indexOf("/");
    const separator = slash >= 1 ? slash : cfg.namingModel.indexOf(":");
    if (separator >= 1) {
      const model = modelRegistry.find(
        cfg.namingModel.slice(0, separator),
        cfg.namingModel.slice(separator + 1),
      );
      if (model) return model;
    }
  }
  return currentModel; // may be undefined → missing_model
}

/** Sanitize one generated title for every enabled surface. */
export function sanitizeTitle(
  style: Config["namingStyle"],
  raw: string,
  maxChars: number,
  cwd: string,
): string | undefined {
  if (!raw.trim()) return undefined;
  if (style === "slug") {
    const title = sanitizeSlug(raw);
    return title ? truncateToWordBoundary(title, maxChars) || undefined : undefined;
  }
  if (style === "topic-project") {
    const projectName = basename(cwd).trim();
    const topic = cleanTitle(raw, Number.POSITIVE_INFINITY) ?? "";
    if (!topic && !projectName) return undefined;
    return buildProjectSuffixTitle(
      topicWithoutProject(topic, projectName, "｜"),
      projectName,
      "｜",
      maxChars,
    );
  }
  return cleanTitle(raw, maxChars) ?? undefined;
}

/** Why title generation failed. */
export type GenerateFailureReason =
  | "missing_prompt"
  | "missing_model"
  | "missing_auth"
  | "request_failed"
  | "invalid_output";

export type GenerateNamesResult =
  | { ok: true; title: string }
  | { ok: false; reason: GenerateFailureReason };

/**
 * Environmental failures never resolve mid-session (missing config/prompt) —
 * callers must latch rather than schedule temporary-title re-runs (§11).
 */
export const ENVIRONMENTAL_FAILURES: ReadonlySet<GenerateFailureReason> = new Set([
  "missing_prompt",
  "missing_model",
  "missing_auth",
]);

/**
 * Optional current and legacy labels accepted from the model. A colon or a
 * spaced dash marks a label in any case; a bare space only counts for the
 * all-caps form (`WINDOW Pi Auto Name`), so titles such as "Session Manager
 * Refactor" or "Session-Based Auth" keep their first word.
 */
const TITLE_LABEL_RE = /^(?:title|window|session)(?:\s*[:：]\s*|\s+[-–—]\s+)(.*)$/iu;
const CAPS_TITLE_LABEL_RE = /^(?:TITLE|WINDOW|SESSION)\s+(.*)$/u;
const LEADING_OUTPUT_NOISE_RE = /^[\s>*_~`"'“‘「『【（\-•]+/u;
const LEADING_OUTPUT_LIST_RE = /^\d+[.)]\s*/u;
const TRAILING_OUTPUT_NOISE_RE = /[`"'”’」』】）*_~\s.,!?;:，。！？；：、…؟]+$/u;

/**
 * Take the first usable non-empty model line and remove harmless formatting.
 * Later lines are ignored: one title is the contract, but old models may still
 * emit a second bare or legacy-labeled line.
 */
export function parseGeneratedTitle(value: string): string | undefined {
  for (const part of value.split(/\r?\n/)) {
    const line = part.trim();
    if (!line) continue;
    const withoutLeadingNoise = line
      .replace(LEADING_OUTPUT_LIST_RE, "")
      .replace(LEADING_OUTPUT_NOISE_RE, "")
      .trim();
    const labeled =
      withoutLeadingNoise.match(TITLE_LABEL_RE)?.[1] ??
      withoutLeadingNoise.match(CAPS_TITLE_LABEL_RE)?.[1] ??
      withoutLeadingNoise;
    const title = labeled
      .replace(LEADING_OUTPUT_NOISE_RE, "")
      .replace(TRAILING_OUTPUT_NOISE_RE, "")
      .trim();
    if (title) return title;
  }
  return undefined;
}

/**
 * Single naming LLM call, in order of preference:
 *
 * 1. `ctx.modelRegistry.complete` — pi-mono main exposes it (delegating to
 *    ModelRuntime.complete), routing through pi's runtime: ALL providers
 *    (built-in + custom providers) and pi's credential
 *    store. A fresh `createModels()` cannot see extension-registered providers
 *    — that was the original "Unknown provider" failure.
 * 2. Published pi builds (ModelRegistry without `complete`): stream through
 *    the runtime provider (`getProvider`) with runtime-resolved auth
 *    (`getApiKeyAndHeaders`) injected — same provider catalog and auth pi
 *    itself uses, without a separate credential store.
 *
 * Failures surface as `stopReason: "error"` messages (never thrown) per
 * pi-ai's contract; the retry/fallback loop in generateNames handles them.
 */
// The npm-published @earendil-works/pi-coding-agent types lag pi-mono source
// (ModelRegistry.complete landed after the 0.83.0 publish), so widen the facade
// type locally; pi-mono main has it at runtime.
type ModelRegistryWithComplete = ModelRegistry & {
  complete<TApi extends Api>(
    model: Model<TApi>,
    context: Context,
    options?: ModelsApiStreamOptions<TApi>,
  ): Promise<AssistantMessage>;
};

async function completeOnce(
  modelRegistry: ModelRegistry,
  model: Model<Api>,
  systemPrompt: string,
  userText: string,
  options: { timeoutMs: number; signal?: AbortSignal },
): Promise<AssistantMessage> {
  const context: Context = {
    systemPrompt,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: userText }],
        timestamp: Date.now(),
      },
    ],
  };
  const streamOptions = {
    maxTokens: 120,
    maxRetries: 0,
    cacheRetention: "none" as const,
    timeoutMs: options.timeoutMs,
    signal: options.signal,
  };

  const registry = modelRegistry as ModelRegistryWithComplete;
  if (typeof registry.complete === "function") {
    return registry.complete(model, context, streamOptions);
  }

  const { ModelsError } = await piAi();
  const provider = modelRegistry.getProvider(model.provider);
  if (!provider) throw new ModelsError("provider", `Unknown provider: ${model.provider}`);
  const auth = await modelRegistry.getApiKeyAndHeaders(model);
  if (!auth.ok) throw new ModelsError("auth", auth.error);
  const stream = provider.stream(model, context, {
    ...streamOptions,
    apiKey: auth.apiKey,
    headers: auth.headers,
    env: auth.env,
  });
  return stream.result();
}

/** The outcome of one generateNames attempt, so the retry loop stays small. */
type AttemptResult =
  | { ok: true; title: string }
  | { ok: false; kind: "missing_model" }
  | { ok: false; kind: "missing_auth" }
  | { ok: false; kind: "request_failed" }
  | { ok: false; kind: "retry" };

/**
 * Run a single naming attempt. Each risky step is wrapped in its own small
 * try/catch that logs exactly where it failed, so a failure pinpoints the
 * stage via debug instead of collapsing the whole retry iteration into one
 * opaque catch. Returns a discriminated `AttemptResult` for the caller's
 * retry loop — it never throws.
 */
async function attemptOnce(
  session: NamingSession,
  cfg: Config,
  context: NamingContext,
  titles: string[],
  cwd: string,
  pi: ExtensionAPI,
  options: { timeoutMs?: number },
  attempt: number,
  anchor: NamingAnchor,
): Promise<AttemptResult> {
  const style = cfg.namingStyle;
  const locale = buildLocale(cfg.language);

  // Step 1: resolve the model.
  let model: Model<Api> | undefined;
  try {
    model = await resolveModel(session.modelRegistry, session.model, cfg);
  } catch (error) {
    debug("generateNames: resolveModel threw", String(error));
    return { ok: false, kind: "request_failed" };
  }
  if (!model) {
    debug("generateNames: missing_model — no model resolved", {
      namingModel: cfg.namingModel,
      hasCtxModel: Boolean(session.model),
    });
    return { ok: false, kind: "missing_model" };
  }
  const modelRef = `${model.provider}/${model.id}`;

  // Step 2: (diagnostic) confirm pi's runtime sees auth for this model before
  // the call — auth failures surface as stopReason "error", not throws. Log
  // only on failure — "configured" is steady-state noise.
  if (debugEnabled) {
    try {
      const auth = await session.modelRegistry.getApiKeyAndHeaders(model);
      if (!auth.ok) {
        debug("generateNames: pi runtime auth unconfigured", {
          model: modelRef,
          error: auth.error,
        });
      }
    } catch (error) {
      debug("generateNames: pi runtime auth probe failed", String(error));
    }
  }

  // Step 3: render the naming prompt (with the dedup wrapper when titles exist).
  let fullPrompt: string;
  try {
    const prompt = renderPrompt(style, context, cfg, cwd, anchor);
    fullPrompt = titles.length
      ? `${locale.dedupIntro}\n${titles.map((t) => `- ${t}`).join("\n")}\n\n${prompt}`
      : prompt;
  } catch (error) {
    debug("generateNames: renderPrompt threw", String(error));
    return { ok: false, kind: "request_failed" };
  }

  // Step 4: the LLM call itself — the site that can throw ModelsError.
  debug("generateNames: attempt", { attempt, model: modelRef });
  const { ModelsError } = await piAi();
  let response: AssistantMessage;
  try {
    response = await completeOnce(
      session.modelRegistry,
      model,
      systemPromptFor(cfg.namingStyle, locale, cfg),
      fullPrompt,
      { timeoutMs: options.timeoutMs ?? 30_000, signal: session.signal },
    );
  } catch (error) {
    if (error instanceof ModelsError) {
      debug("generateNames: missing_auth (ModelsError)", {
        code: error.code,
        message: error.message,
      });
      return { ok: false, kind: "missing_auth" };
    }
    debug("generateNames: request_failed", String(error));
    return { ok: false, kind: "request_failed" };
  }

  // Only error/retry responses are diagnostic noise worth recording; a clean
  // "stop" is the expected path covered by the parsed-output log.
  if (response.stopReason !== "stop") {
    debug("generateNames: response (non-stop)", {
      stopReason: response.stopReason,
      errorMessage: response.errorMessage,
    });
    return { ok: false, kind: "retry" };
  }

  // Step 5: parse + sanitize the single title.
  let title: string | undefined;
  try {
    const raw = response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const parsed = parseGeneratedTitle(raw);
    title = parsed ? sanitizeTitle(style, parsed, titleBudget(cfg), cwd) : undefined;
    debug("generateNames: parsed output", {
      raw: raw.slice(0, 120),
      parsed,
      title,
    });
  } catch (error) {
    debug("generateNames: parse/sanitize threw", String(error));
    return { ok: false, kind: "request_failed" };
  }
  if (title) return { ok: true, title };
  debug("generateNames: invalid output — retrying");
  return { ok: false, kind: "retry" };
}

/**
 * Try the LLM (up to RETRIES), then the last-message fallback. Returns
 * `ok: false` only when nothing usable exists — the caller then goes to the
 * temporary-title flow, unless the reason is environmental
 * (`ENVIRONMENTAL_FAILURES`), in which case the caller latches instead (§11).
 */
export async function generateNames(
  session: NamingSession,
  cfg: Config,
  context: NamingContext,
  titles: string[],
  cwd: string,
  pi: ExtensionAPI,
  options: { timeoutMs?: number } = {},
): Promise<GenerateNamesResult> {
  const style = cfg.namingStyle;
  const seed = context.recentUserMessages.at(-1) ?? context.firstUserMessage;
  if (!seed) {
    debug("generateNames: missing_prompt — no seed (no user message yet)");
    return { ok: false, reason: "missing_prompt" };
  }
  debug("generateNames: start", {
    style,
    seed: seed.slice(0, 80),
  });

  const anchor = await resolveNamingAnchor(pi.exec, cwd);

  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const res = await attemptOnce(session, cfg, context, titles, cwd, pi, options, attempt, anchor);
    if (res.ok) return { ok: true, title: res.title };
    switch (res.kind) {
      case "missing_model":
        return { ok: false, reason: "missing_model" };
      case "missing_auth":
        return { ok: false, reason: "missing_auth" };
      case "request_failed":
        return { ok: false, reason: "request_failed" };
      case "retry":
        continue; // invalid / non-stop output → try again
    }
  }

  // Last-message fallback: apply the same single-title sanitizer and budget.
  const fallbackTitle = sanitizeTitle(style, seed, titleBudget(cfg), cwd);
  if (fallbackTitle) {
    debug("generateNames: last-message fallback", { fallbackTitle });
    return { ok: true, title: fallbackTitle };
  }
  debug("generateNames: invalid_output — fallback produced nothing usable");
  return { ok: false, reason: "invalid_output" };
}

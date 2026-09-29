// config.ts — schema, defaults, load/merge.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { Type, type Static, type TObject } from "typebox";
import { Value } from "typebox/value";
import { CONFIG_DIR_NAME, getAgentDir } from "@earendil-works/pi-coding-agent";
import { debug } from "./debug.js";

export const ConfigSchema = Type.Object({
  enabled: Type.Boolean({ default: true }),
  surfaces: Type.Object({
    renamePiSession: Type.Boolean({ default: true }),
    renameHerdrPane: Type.Boolean({ default: true }),
    renameHerdrTab: Type.Boolean({ default: true }),
    renameTmuxWindow: Type.Boolean({ default: true }),
    renameZellijPane: Type.Boolean({ default: true }),
    renameZellijTab: Type.Boolean({ default: true }),
  }),
  initialRenameTrigger: Type.Union(
    [Type.Literal("first-input"), Type.Literal("first-agent-settled")],
    {
      default: "first-input",
    },
  ),
  reRenameEveryNTurns: Type.Integer({ minimum: 0, default: 0 }),
  replaceExistingName: Type.Union([Type.Literal("always"), Type.Literal("never")], {
    default: "always",
  }),
  respectExternalRenames: Type.Boolean({ default: true }),
  namingStyle: Type.Union(
    [Type.Literal("natural"), Type.Literal("slug"), Type.Literal("topic-project")],
    { default: "natural" },
  ),
  namingContextDepth: Type.Union(
    [
      Type.Literal("first-user-message"),
      Type.Literal("recent-user-messages"),
      Type.Literal("full-conversation"),
    ],
    { default: "recent-user-messages" },
  ),
  skipSessionNameDedup: Type.Boolean({ default: false }),
  namingModel: Type.String({ default: "" }),
  // BCP-47 language tag only ("en", "zh-CN", "pt-BR")
  language: Type.String({ default: "en" }),
  // Per-name limits, override semantics: when set, windowNameMaxLength applies
  // to every window surface (herdr pane/tab, tmux window, zellij pane/tab) and
  // sessionNameMaxLength to the Pi session name and session list. Each replaces
  // a single fixed default (DEFAULT_MAX_WINDOW_NAME_CHARS / DEFAULT_MAX_SESSION_NAME_CHARS
  // in naming.ts) — tightening OR relaxing it, identically for every style.
  // These are the only two length knobs.
  windowNameMaxLength: Type.Optional(Type.Integer({ minimum: 1 })),
  sessionNameMaxLength: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type Config = Static<typeof ConfigSchema>;

/** Apply schema defaults and discard unknown keys, preserving the previous fail-soft behavior. */
export function validateConfig<T extends TObject>(schema: T, value: unknown): Static<T> {
  try {
    if (!isPlainObject(value)) return {} as Static<T>;
    const cleaned = Value.Clean(schema, Value.Clone(value));
    return {
      ...(Value.Create(schema) as Record<string, unknown>),
      ...(cleaned as Record<string, unknown>),
    } as Static<T>;
  } catch {
    return {} as Static<T>;
  }
}

function loadJsonConfig(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    const value: unknown = JSON.parse(readFileSync(path, "utf-8"));
    return isPlainObject(value) ? value : {};
  } catch (error) {
    console.warn(`pi-auto-name: invalid JSON at ${path}, using defaults — ${String(error)}`);
    return {};
  }
}

function legacyConfigPath(): string {
  const xdg = process.env.XDG_CONFIG_HOME?.trim();
  const expanded =
    xdg === "~" ? homedir() : xdg?.startsWith("~/") ? join(homedir(), xdg.slice(2)) : xdg;
  return join(
    expanded && isAbsolute(expanded) ? expanded : join(homedir(), ".config"),
    "pi-auto-name",
    "config.json",
  );
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep merge; `over` wins per field. Arrays and scalars are replaced, not merged. */
function deepMerge(
  base: Record<string, unknown>,
  over: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(over)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Load: legacy user base ← Pi user config ← project override (per-field, right wins).
 * XDG_CONFIG_HOME only selects the location of the legacy config file.
 */
export function loadConfig(cwd: string): Config {
  const legacyUserPath = legacyConfigPath();
  const userPath = join(getAgentDir(), "pi-auto-name.json");
  const projectPath = join(cwd, CONFIG_DIR_NAME, "pi-auto-name.json");
  const legacyUser = loadJsonConfig(legacyUserPath);
  const user = loadJsonConfig(userPath);
  const project = loadJsonConfig(projectPath);
  const merged = deepMerge(deepMerge(legacyUser, user), project);
  const validated = validateConfig(ConfigSchema, merged);
  // Value.Create's nested defaults need a deep merge for partial surfaces overrides.
  const fullDefaults = validateConfig(ConfigSchema, {});
  const cfg = deepMerge(fullDefaults, validated) as Config;
  debug("loadConfig", {
    legacyUserPath,
    userPath,
    projectPath,
    enabled: cfg.enabled,
    namingStyle: cfg.namingStyle,
    initialRenameTrigger: cfg.initialRenameTrigger,
    reRenameEveryNTurns: cfg.reRenameEveryNTurns,
    replaceExistingName: cfg.replaceExistingName,
    respectExternalRenames: cfg.respectExternalRenames,
    language: cfg.language,
    surfaces: cfg.surfaces,
  });
  return cfg;
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Config } from "../src/config.js";
import type { NamingContext } from "../src/context.js";
import {
  DEFAULT_MAX_TITLE_CHARS,
  ENVIRONMENTAL_FAILURES,
  RETRIES,
  generateNames,
  parseGeneratedTitle,
  sanitizeTitle,
  titleBudget,
} from "../src/naming.js";
import { LOCALE_STRINGS } from "../src/locales.js";

const { ModelsError } = vi.hoisted(() => ({
  ModelsError: class extends Error {
    code = "auth";
    constructor(code = "auth", message = "auth failed") {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock("@earendil-works/pi-ai", () => ({ ModelsError }));

function mkConfig(overrides: Partial<Config> = {}): Config {
  return {
    enabled: true,
    surfaces: {
      renamePiSession: true,
      renameHerdrPane: true,
      renameHerdrTab: true,
      renameTmuxWindow: true,
      renameZellijPane: true,
      renameZellijTab: true,
    },
    initialRenameTrigger: "first-input",
    reRenameEveryNTurns: 0,
    replaceExistingName: "always",
    respectExternalRenames: true,
    namingStyle: "natural",
    namingContextDepth: "recent-user-messages",
    skipSessionNameDedup: false,
    namingModel: "",
    language: "en",
    titleMaxLength: 30,
    ...overrides,
  };
}

function mkContext(ctx: Partial<NamingContext> = {}): NamingContext {
  return {
    firstUserMessage: "Please fix the OAuth callback",
    recentUserMessages: [],
    ...ctx,
  };
}

function mkResponse(
  text: string,
  stopReason: AssistantMessage["stopReason"] = "stop",
): AssistantMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    stopReason,
    timestamp: Date.now(),
  } as AssistantMessage;
}

function mkComplete(text = "TITLE: Fix OAuth retry") {
  return vi.fn(async (_model: unknown, _context: unknown, _options: unknown) => mkResponse(text));
}

function mkCtx(complete: ReturnType<typeof mkComplete>, overrides: Partial<ExtensionContext> = {}) {
  return {
    modelRegistry: { find: vi.fn(() => undefined), complete },
    model: { provider: "anthropic", id: "claude-test" },
    signal: undefined,
    ...overrides,
  } as unknown as ExtensionContext;
}

beforeEach(() => vi.clearAllMocks());

describe("title budget", () => {
  it("uses the single configured title limit and its default", () => {
    expect(DEFAULT_MAX_TITLE_CHARS).toBe(30);
    expect(titleBudget(mkConfig())).toBe(30);
    expect(titleBudget(mkConfig({ titleMaxLength: 42 }))).toBe(42);
    expect([...ENVIRONMENTAL_FAILURES].sort()).toEqual([
      "missing_auth",
      "missing_model",
      "missing_prompt",
    ]);
  });
});

describe("parseGeneratedTitle", () => {
  it("accepts the observed missing-colon legacy output", () => {
    expect(parseGeneratedTitle("WINDOW Pi Auto Name")).toBe("Pi Auto Name");
  });

  it("takes the first bare line when a model still emits two lines", () => {
    expect(parseGeneratedTitle("Fix OAuth callback\nRepair retry handling")).toBe(
      "Fix OAuth callback",
    );
  });

  it("strips current and legacy labels, quotes, markdown, bullets, and punctuation", () => {
    expect(parseGeneratedTitle('- **Title - "Fix OAuth".**')).toBe("Fix OAuth");
    expect(parseGeneratedTitle("SESSION: 'Fix the callback!'\nWINDOW: old")).toBe(
      "Fix the callback",
    );
  });

  it("keeps a leading label-like word that is part of a real title", () => {
    expect(parseGeneratedTitle("Session Manager Refactor")).toBe("Session Manager Refactor");
    expect(parseGeneratedTitle("Window Layout Fix")).toBe("Window Layout Fix");
    expect(parseGeneratedTitle("Session-Based Auth")).toBe("Session-Based Auth");
    expect(parseGeneratedTitle("Title Case Rules")).toBe("Title Case Rules");
  });

  it("only rejects output with no usable content", () => {
    expect(parseGeneratedTitle("\n  \n")).toBeUndefined();
    expect(parseGeneratedTitle("TITLE: ---")).toBeUndefined();
  });
});

describe("sanitizeTitle", () => {
  it("trims natural titles at a word boundary", () => {
    expect(sanitizeTitle("natural", "Fix the very long callback", 11, "/p")).toBe("Fix the");
  });

  it("hard-cuts only a single word longer than the budget", () => {
    expect(sanitizeTitle("natural", "supercalifragilistic", 5, "/p")).toBe("super");
  });

  it("uses the same budget for slug titles and treats hyphens as boundaries", () => {
    expect(sanitizeTitle("slug", "Fix the very long callback", 11, "/p")).toBe("fix-the");
  });

  it("keeps the topic-project suffix inside the same budget", () => {
    const title = sanitizeTitle("topic-project", "Fix the callback", 20, "/p/pi-auto-name");
    expect(title).toBe("Fix the｜pi-auto-name");
    expect([...title!].length).toBeLessThanOrEqual(20);
  });
});

describe("single-title prompts", () => {
  it.each(["natural", "slug", "topic-project"] as const)(
    "asks for one bounded title for %s",
    async (style) => {
      const complete = mkComplete();
      await generateNames(
        mkCtx(complete),
        mkConfig({ namingStyle: style, titleMaxLength: 24 }),
        mkContext(),
        [],
        "/p/pi-auto-name",
        { exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })) } as any,
      );
      const callContext = complete.mock.calls[0][1] as any;
      expect(callContext.systemPrompt).not.toContain("{titleMaxChars}");
      expect(callContext.systemPrompt).not.toContain("{windowMaxChars}");
      expect(callContext.systemPrompt).not.toContain("{sessionMaxChars}");
      expect(callContext.systemPrompt).toContain("24");
      expect(callContext.systemPrompt).toMatch(/one|un|um|ein|un|一|한|один|এক|หนึ่ง/i);
      const userText = callContext.messages[0].content[0].text;
      expect(userText).toContain("24");
      expect(userText).toContain("TITLE:");
      if (style === "topic-project") {
        expect(userText).toContain("pi-auto-name");
        expect(userText).toContain("Language: en");
      }
    },
  );

  it("keeps the explicit language directive for natural and slug", async () => {
    for (const namingStyle of ["natural", "slug"] as const) {
      const complete = mkComplete();
      await generateNames(
        mkCtx(complete),
        mkConfig({ namingStyle, language: "it" }),
        mkContext(),
        [],
        "/p",
        { exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })) } as any,
      );
      expect((complete.mock.calls[0][1] as any).systemPrompt).toContain("italiano (it)");
    }
  });
});

describe("generateNames", () => {
  it("returns one title from a tolerant model response", async () => {
    const result = await generateNames(
      mkCtx(mkComplete("WINDOW Pi Auto Name")),
      mkConfig({ titleMaxLength: 30 }),
      mkContext(),
      [],
      "/p",
      { exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })) } as any,
    );
    expect(result).toEqual({ ok: true, title: "Pi Auto Name" });
  });

  it("uses the last user message as a bounded fallback after invalid attempts", async () => {
    const complete = mkComplete("\n\n");
    const result = await generateNames(
      mkCtx(complete),
      mkConfig({ namingStyle: "natural", titleMaxLength: 20 }),
      mkContext({ recentUserMessages: ["Fix the very long callback now"] }),
      [],
      "/p",
      { exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })) } as any,
    );
    expect(complete).toHaveBeenCalledTimes(RETRIES);
    expect(result).toEqual({ ok: true, title: "Fix the very long" });
  });

  it("falls back when the model stops for a non-stop reason", async () => {
    const complete = vi.fn(async () => mkResponse("", "length"));
    const result = await generateNames(
      mkCtx(complete),
      mkConfig({ namingStyle: "slug", titleMaxLength: 18 }),
      mkContext({ recentUserMessages: ["Fix the authentication callback"] }),
      [],
      "/p",
      { exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })) } as any,
    );
    expect(result).toEqual({ ok: true, title: "fix-the" });
  });

  it("returns missing prompt and missing auth distinctly", async () => {
    const empty = await generateNames(
      mkCtx(mkComplete()),
      mkConfig(),
      mkContext({ firstUserMessage: "", recentUserMessages: [] }),
      [],
      "/p",
      { exec: vi.fn() } as any,
    );
    expect(empty).toEqual({ ok: false, reason: "missing_prompt" });

    const complete = vi.fn(async () => {
      throw new ModelsError();
    });
    const auth = await generateNames(mkCtx(complete), mkConfig(), mkContext(), [], "/p", {
      exec: vi.fn(),
    } as any);
    expect(auth).toEqual({ ok: false, reason: "missing_auth" });
  });
});

describe("all locale prompt contracts", () => {
  it("uses the single title placeholder and single-line contract in every locale", () => {
    for (const [key, locale] of Object.entries(LOCALE_STRINGS)) {
      for (const field of [
        "naturalSystemPrompt",
        "slugSystemPrompt",
        "topicProjectSystemPrompt",
        "naturalRules",
      ] as const) {
        expect(locale[field], `${key}.${field}`).toContain("{titleMaxChars}");
        expect(locale[field], `${key}.${field}`).not.toContain("{windowMaxChars}");
        expect(locale[field], `${key}.${field}`).not.toContain("{sessionMaxChars}");
      }
      expect(locale.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{titleMaxChars}",
      );
      expect(locale.responseFormat, `${key}.responseFormat`).toContain("TITLE:");
      expect(locale.responseFormat, `${key}.responseFormat`).not.toContain("WINDOW:");
      expect(locale.responseFormat, `${key}.responseFormat`).not.toContain("SESSION:");
      expect(locale.languageDirective, `${key}.languageDirective`).toContain("{language}");
    }
  });
});

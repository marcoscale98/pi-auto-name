import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../src/config.js";
import type { NamingContext } from "../src/context.js";

const mocks = vi.hoisted(() => ({
  loadConfig: vi.fn(),
  buildContext: vi.fn(),
  generateNames: vi.fn(),
  collectExistingSessionNames: vi.fn(),
  applySessionName: vi.fn(),
  syncSurfaces: vi.fn(),
  windowNameForSync: vi.fn(
    (_state: unknown, _name: string | undefined): string | undefined => undefined,
  ),
}));

vi.mock("../src/config.js", () => ({ loadConfig: mocks.loadConfig }));
vi.mock("../src/context.js", () => ({ buildContext: mocks.buildContext }));
vi.mock("../src/naming.js", () => ({
  generateNames: mocks.generateNames,
  UI_RENAME_TIMEOUT_MS: 10_000,
}));
vi.mock("../src/dedup.js", () => ({
  collectExistingSessionNames: mocks.collectExistingSessionNames,
}));
vi.mock("../src/surfaces.js", () => ({
  applySessionName: mocks.applySessionName,
  syncSurfaces: mocks.syncSurfaces,
  windowNameForSync: mocks.windowNameForSync,
}));

import extension from "../src/index.js";

function defaultCfg(): Config {
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
  };
}

const NAMING_CONTEXT: NamingContext = {
  firstUserMessage: "Fix the OAuth callback",
  recentUserMessages: [],
};

function setup() {
  const handlers = new Map<string, (event: any, ctx: any) => Promise<unknown>>();
  let current: string | undefined;
  const pi = {
    on: vi.fn((event: string, handler: any) => handlers.set(event, handler)),
    setSessionName: vi.fn((name: string) => {
      current = name;
    }),
    getSessionName: vi.fn(() => current),
    appendEntry: vi.fn(),
    registerEntryRenderer: vi.fn(),
    exec: vi.fn(async () => ({ stdout: "", stderr: "", code: 0, killed: false })),
  };
  const ctx = {
    cwd: "/project",
    hasUI: false,
    sessionManager: {
      getEntries: () => [],
      getSessionFile: () => "/sessions/current.md",
    },
    modelRegistry: {},
    model: undefined,
    signal: undefined,
  };
  mocks.loadConfig.mockReturnValue(defaultCfg());
  mocks.collectExistingSessionNames.mockResolvedValue([]);
  mocks.buildContext.mockReturnValue(NAMING_CONTEXT);
  mocks.generateNames.mockResolvedValue({ ok: true, title: "Fix OAuth retry" });
  extension(pi as any);
  return { pi, ctx, handlers, current: () => current };
}

beforeEach(() => vi.clearAllMocks());

describe("extension registration", () => {
  it("subscribes to the lifecycle events", () => {
    const { pi } = setup();
    const events = pi.on.mock.calls.map((call: any[]) => call[0]);
    expect(events).toEqual(
      expect.arrayContaining([
        "session_start",
        "input",
        "agent_settled",
        "session_info_changed",
        "session_shutdown",
      ]),
    );
  });
});

describe("single-title application", () => {
  it("sends the same generated title to the session and all surface sync", async () => {
    const h = setup();
    await h.handlers.get("input")!({ source: "interactive", text: "Fix OAuth" }, h.ctx);

    expect(mocks.applySessionName).toHaveBeenCalledWith(
      h.pi,
      expect.anything(),
      expect.objectContaining({ titleMaxLength: 30 }),
      "Fix OAuth retry",
    );
    expect(mocks.syncSurfaces).toHaveBeenCalledWith(
      h.pi,
      expect.objectContaining({ titleMaxLength: 30 }),
      "Fix OAuth retry",
    );
  });

  it("uses the configured title budget and ignores old config fields in the flow", async () => {
    const h = setup();
    mocks.loadConfig.mockReturnValue({ ...defaultCfg(), titleMaxLength: 18 });
    await h.handlers.get("input")!({ source: "interactive", text: "Fix OAuth" }, h.ctx);
    expect(mocks.generateNames.mock.calls[0][1]).toEqual(
      expect.objectContaining({ titleMaxLength: 18 }),
    );
    expect(mocks.generateNames.mock.calls[0][1]).not.toHaveProperty("windowNameMaxLength");
    expect(mocks.generateNames.mock.calls[0][1]).not.toHaveProperty("sessionNameMaxLength");
  });

  it("does not generate for extension input or when disabled", async () => {
    const h = setup();
    await h.handlers.get("input")!({ source: "extension", text: "injected" }, h.ctx);
    expect(mocks.generateNames).not.toHaveBeenCalled();

    const disabled = setup();
    mocks.loadConfig.mockReturnValue({ ...defaultCfg(), enabled: false });
    await disabled.handlers.get("input")!(
      { source: "interactive", text: "Fix OAuth" },
      disabled.ctx,
    );
    expect(mocks.generateNames).not.toHaveBeenCalled();
  });
});

describe("session lifecycle", () => {
  it("syncs a restored persisted title without generating a new one", async () => {
    const h = setup();
    mocks.windowNameForSync.mockReturnValue("Old title");
    await h.handlers.get("session_start")!({ reason: "resume" }, h.ctx);
    expect(mocks.generateNames).not.toHaveBeenCalled();
    expect(mocks.syncSurfaces).toHaveBeenCalledWith(h.pi, expect.anything(), "Old title");
  });

  it("does not retry after a failed generation", async () => {
    const h = setup();
    mocks.generateNames.mockResolvedValue({ ok: false, reason: "invalid_output" });
    await h.handlers.get("input")!({ source: "interactive", text: "Fix OAuth" }, h.ctx);
    await h.handlers.get("input")!({ source: "interactive", text: "More" }, h.ctx);
    expect(mocks.generateNames).toHaveBeenCalledTimes(1);
  });
});

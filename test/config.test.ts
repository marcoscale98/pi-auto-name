import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { ConfigSchema, loadConfig, validateConfig, type Config } from "../src/config.js";

vi.mock("@earendil-works/pi-coding-agent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@earendil-works/pi-coding-agent")>();
  return { ...actual, getAgentDir: vi.fn() };
});

const TOP_LEVEL_DEFAULTS: Partial<Config> = {
  enabled: true,
  initialRenameTrigger: "first-input",
  reRenameEveryNTurns: 0,
  replaceExistingName: "always",
  respectExternalRenames: true,
  namingStyle: "natural",
  namingContextDepth: "recent-user-messages",
  skipSessionNameDedup: false,
  namingModel: "",
  language: "en",
  windowNameMaxLength: undefined,
  sessionNameMaxLength: undefined,
};

let root: string;
let originalXdg: string | undefined;
const project = () => join(root, "project");
const legacy = () => join(root, "xdg", "pi-auto-name", "config.json");
const user = () => join(root, "agent", "pi-auto-name.json");
const projectConfig = () => join(project(), ".pi", "pi-auto-name.json");
function save(path: string, data: unknown) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(data));
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "pi-auto-name-config-"));
  originalXdg = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = join(root, "xdg");
  vi.mocked(getAgentDir).mockReturnValue(join(root, "agent"));
});

afterEach(() => {
  if (originalXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = originalXdg;
  rmSync(root, { recursive: true, force: true });
});

describe("ConfigSchema defaults", () => {
  it("applies every scalar default", () => {
    const cfg = validateConfig(ConfigSchema, {});
    for (const [key, value] of Object.entries(TOP_LEVEL_DEFAULTS)) {
      expect(cfg[key as keyof Config], key).toEqual(value);
    }
  });

  it("accepts valid scalar overrides", () => {
    const cfg = validateConfig(ConfigSchema, {
      namingStyle: "slug",
      language: "zh-CN",
      initialRenameTrigger: "first-agent-settled",
      reRenameEveryNTurns: 3,
      sessionNameMaxLength: 50,
      windowNameMaxLength: 25,
    });
    expect(cfg.namingStyle).toBe("slug");
    expect(cfg.language).toBe("zh-CN");
    expect(cfg.initialRenameTrigger).toBe("first-agent-settled");
    expect(cfg.reRenameEveryNTurns).toBe(3);
    expect(cfg.sessionNameMaxLength).toBe(50);
    expect(cfg.windowNameMaxLength).toBe(25);
  });

  it("strips unknown keys", () => {
    const cfg = validateConfig(ConfigSchema, { bogusKey: 1 } as any);
    expect((cfg as any).bogusKey).toBeUndefined();
    expect(cfg.namingStyle).toBe("natural");
  });
});

describe("loadConfig (nested defaults deep-merged)", () => {
  it("returns full defaults including nested surfaces", () => {
    const cfg = loadConfig(project());
    expect(cfg.surfaces).toEqual({
      renamePiSession: true,
      renameHerdrPane: true,
      renameHerdrTab: true,
      renameTmuxWindow: true,
      renameZellijPane: true,
      renameZellijTab: true,
    });
    for (const [key, value] of Object.entries(TOP_LEVEL_DEFAULTS)) {
      expect(cfg[key as keyof Config], key).toEqual(value);
    }
  });

  it("keeps untouched surfaces when a partial surfaces override is given", () => {
    save(user(), { surfaces: { renameTmuxWindow: false } });
    const cfg = loadConfig(project());
    expect(cfg.surfaces.renameTmuxWindow).toBe(false);
    expect(cfg.surfaces.renamePiSession).toBe(true);
    expect(cfg.surfaces.renameZellijTab).toBe(true);
  });

  it("loads the preferred user-global config from Pi's agent directory", () => {
    save(user(), { namingStyle: "slug" });
    expect(loadConfig(project()).namingStyle).toBe("slug");
    expect(JSON.parse(readFileSync(user(), "utf-8"))).toEqual({ namingStyle: "slug" });
  });

  it("applies legacy, preferred user, and project precedence per field", () => {
    save(legacy(), { namingStyle: "slug", language: "fr", reRenameEveryNTurns: 1 });
    save(user(), { language: "de", reRenameEveryNTurns: 2 });
    save(projectConfig(), { reRenameEveryNTurns: 3 });
    const cfg = loadConfig(project());
    expect(cfg.namingStyle).toBe("slug");
    expect(cfg.language).toBe("de");
    expect(cfg.reRenameEveryNTurns).toBe(3);
  });

  it("deep-merges nested surface objects across all config sources", () => {
    save(legacy(), { surfaces: { renameTmuxWindow: false } });
    save(user(), { surfaces: { renameZellijTab: false } });
    save(projectConfig(), { surfaces: { renamePiSession: false } });
    const cfg = loadConfig(project());
    expect(cfg.surfaces.renameTmuxWindow).toBe(false);
    expect(cfg.surfaces.renameZellijTab).toBe(false);
    expect(cfg.surfaces.renamePiSession).toBe(false);
    expect(cfg.surfaces.renameHerdrPane).toBe(true);
  });

  it("ignores missing, malformed, and non-object JSON", () => {
    save(legacy(), ["not a config"]);
    save(user(), { namingStyle: "slug" });
    mkdirSync(join(project(), ".pi"), { recursive: true });
    writeFileSync(projectConfig(), "{invalid");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(loadConfig(project()).namingStyle).toBe("slug");
      expect(warning).toHaveBeenCalledOnce();
    } finally {
      warning.mockRestore();
    }
  });
});

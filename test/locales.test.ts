import { describe, expect, it } from "vitest";
import { LOCALE_STRINGS, type LocaleStrings } from "../src/locales.js";

const REQUIRED_FIELDS: (keyof LocaleStrings)[] = [
  "naturalSystemPrompt",
  "slugSystemPrompt",
  "topicProjectSystemPrompt",
  "naturalRules",
  "topicProjectPromptTemplate",
  "namingContextTemplate",
  "conversationSection",
  "projectLabel",
  "firstUserMessageLabel",
  "firstAssistantMessageLabel",
  "noneLabel",
  "projectSuffixLines",
  "dedupIntro",
  "responseFormat",
  "languageDirective",
];

const PROMPT_FIELDS = [
  "naturalSystemPrompt",
  "slugSystemPrompt",
  "topicProjectSystemPrompt",
  "naturalRules",
] as const;

describe("LOCALE_STRINGS registry", () => {
  it("keeps English as the fallback and all tables complete", () => {
    expect(LOCALE_STRINGS.en).toBeDefined();
    for (const [key, table] of Object.entries(LOCALE_STRINGS)) {
      for (const field of REQUIRED_FIELDS) {
        expect(typeof table[field], `${key}.${field}`).toBe("string");
        expect(table[field].length, `${key}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the explicit output-language placeholder", () => {
    for (const [key, table] of Object.entries(LOCALE_STRINGS)) {
      expect(table.languageDirective, `${key}.languageDirective`).toContain("{language}");
    }
  });
});

describe("single-title prompt invariants", () => {
  it("uses one title budget in every style and locale", () => {
    for (const [key, table] of Object.entries(LOCALE_STRINGS)) {
      for (const field of PROMPT_FIELDS) {
        expect(table[field], `${key}.${field}`).toContain("{titleMaxChars}");
        expect(table[field], `${key}.${field}`).not.toContain("{windowMaxChars}");
        expect(table[field], `${key}.${field}`).not.toContain("{sessionMaxChars}");
      }
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{titleMaxChars}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{language}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{projectLines}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{projectLine}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{cwd}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{firstUserBlock}",
      );
      expect(table.topicProjectPromptTemplate, `${key}.topicProjectPromptTemplate`).toContain(
        "{firstAssistantBlock}",
      );
      expect(table.namingContextTemplate).toContain("{firstUserMessageLabel}");
      expect(table.namingContextTemplate).toContain("{first}");
      expect(table.namingContextTemplate).toContain("{recent}");
      expect(table.conversationSection).toContain("{conversation}");
      expect(table.projectSuffixLines).toContain("{separator}");
      expect(table.projectSuffixLines).toContain("{projectName}");
      expect(table.responseFormat).toContain("TITLE:");
      expect(table.responseFormat).not.toContain("WINDOW:");
      expect(table.responseFormat).not.toContain("SESSION:");
      expect(table.naturalRules.split("\n")).toHaveLength(10);
    }
  });

  it("keeps script conventions in representative locales", () => {
    expect(LOCALE_STRINGS.en.slugSystemPrompt).toContain("lowercase hyphen-separated");
    expect(LOCALE_STRINGS.zh.naturalSystemPrompt).toContain("字符");
    expect(LOCALE_STRINGS.ja.naturalSystemPrompt).toContain("文字");
    expect(LOCALE_STRINGS.ko.slugSystemPrompt).toContain("소문자");
    expect(LOCALE_STRINGS.th.naturalSystemPrompt).toContain("ตัวอักษร");
    expect(LOCALE_STRINGS.en.naturalSystemPrompt).toContain("Title Case");
  });
});

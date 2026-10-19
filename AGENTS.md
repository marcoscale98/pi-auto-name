# Locales — source of truth for pi-auto-name prompt strings

All user-facing / LLM-facing prompt scaffolding for pi-auto-name lives in
[`src/locales.ts`](./src/locales.ts) as per-locale `LocaleStrings` tables,
registered in the `LOCALE_STRINGS` map. This file documents the conventions.

## Locale table keys

| Key | Language | BCP-47 examples |
| `en` | English (scaffolding) | `en` |
| `zh` | Simplified Chinese | `zh`, `zh-CN`, `zh-Hans`, `zh-SG` |
| `zh-hant` | Traditional Chinese | `zh-Hant`, `zh-TW`, `zh-HK`, `zh-MO` |
| `ja` | Japanese | `ja`, `ja-JP` |
| `ko` | Korean | `ko`, `ko-KR` |
| `pt-br` | Brazilian Portuguese | `pt-BR`, `pt`, `pt-PT` (falls back) |
| `es` | Spanish | `es`, `es-ES`, `es-MX` |
| `de` | German | `de`, `de-DE`, `de-AT` |
| `fr` | French | `fr`, `fr-FR`, `fr-CA` |
| `id` | Indonesian | `id`, `id-ID` |
| `vi` | Vietnamese | `vi`, `vi-VN` |
| `tr` | Turkish | `tr`, `tr-TR` |
| `pl` | Polish | `pl`, `pl-PL` |
| `uk` | Ukrainian | `uk`, `uk-UA` |
| `fa` | Persian (Farsi) | `fa`, `fa-IR` |
| `ar` | Arabic | `ar`, `ar-SA` |
| `hi` | Hindi | `hi`, `hi-IN` |
| `it` | Italian | `it`, `it-IT` |
| `nl` | Dutch | `nl`, `nl-NL` |
| `th` | Thai | `th`, `th-TH` |

`en` must always be present — it is the fallback for valid BCP-47 tags without
a built-in table. Resolution lives in `src/i18n.ts` (`resolveLocaleKey`) and
runs in this order:

1. **Exact tag match** (`zh-hant`, `pt-br`).
2. **`zh` script/region disambiguation** — `zh-Hant` / `zh-TW` / `zh-HK` /
   `zh-MO` map to `zh-hant`; `zh-Hans` / `zh-CN` / `zh-SG` / bare `zh` map to
   `zh`.
3. **`pt` region** — any Portuguese tag maps to the `pt-br` table (the closest
   available), so `pt-PT` / `pt-MO` / `pt-AO` all resolve to `pt-br`.
4. **Primary-subtag lookup** for every other tag; tags without a built-in table
   fall through to `en`.

## Adding a language

1. Append a `const XX: LocaleStrings = { … }` table above the registry.
2. Register it in `LOCALE_STRINGS` (lowercase key).
3. If it needs region/script disambiguation (like `zh`), add a row in
   `resolveLocaleKey` in `src/i18n.ts`. Keep each branch pointed at a key that
   actually exists in `LOCALE_STRINGS`: a branch that returns an unregistered
   key is dead and silently falls through to `en`. `pt` is the model case — a
   single row returns `pt-br`, and every Portuguese variant (`pt-PT`, …) shares
   that table.
4. Extend `test/i18n.test.ts` (resolution) and `test/locales.test.ts`
   (per-table content) as appropriate.

## Invariants (enforced by tests)

- Every table implements **all 15 `LocaleStrings` fields** as non-empty
  strings.
- Every `{placeholder}` used by the naming templates is preserved verbatim:
  `{language} {titleMaxChars} {projectLines} {projectLine} {cwd}
{firstUserBlock} {firstAssistantBlock}` in `topicProjectPromptTemplate`,
  `{firstUserMessageLabel} {first} {recent}` in `namingContextTemplate`,
  `{conversation}` in `conversationSection`, `{separator} {projectName}` in
  `projectSuffixLines`, and `{language}` in `languageDirective`.
- **The model output contract is one ASCII-labelled title in every locale.**
  `responseFormat` asks for `TITLE: <title>` on one line. The parser accepts
  that label plus `Title -` and legacy `WINDOW:` / `SESSION:` labels, but always
  uses the first non-empty line. Only the surrounding instruction scaffolding
  is translated.
- **Lengths are parametric, not hardcoded.** Every length-bearing prompt field
  (`naturalSystemPrompt`, `slugSystemPrompt`, `topicProjectSystemPrompt`, and
  `naturalRules`) uses `{titleMaxChars}`. `naming.ts` fills it from the single
  `titleMaxLength` config value (default 30), so the model sees the enforced
  budget for every style. Prompts size titles by characters, not fixed word
  counts, and tell the model to summarize the work's topic or intent instead of
  restating or paraphrasing the request.
- `naturalRules` is newline-joined to exactly 10 lines.
- **Output language is stated explicitly, not just implied by scaffold
  language.** `languageDirective` is a localized "output in {language}"
  sentence; `naming.ts` injects it at the top of the `natural` and `slug`
  system prompts and user turns. The `topic-project` style keeps the directive
  in its user template (`Language: {language}` or its localized equivalent).

## Language-specific guidance

- **Character sizing.** Every locale sizes the single title by the
  `{titleMaxChars}` character budget. English, Portuguese, Spanish, German,
  French, Indonesian, Vietnamese, Turkish, Polish, Ukrainian, Italian and Dutch
  retain their Title Case or lowercase slug conventions. CJK, Thai, Persian,
  Arabic and Hindi keep their script-appropriate no-case conventions; CJK and
  Thai do not assume whitespace word boundaries.
- **Sanitizers are script-aware.** `sanitize.ts` word tokenizers are
  Unicode-aware (`\p{L}\p{M}\p{N}`), so letters and combining marks in every
  script — Arabic, Devanagari, Cyrillic, accented Latin, CJK, and Thai — remain
  title content. When a title exceeds the budget, whitespace or hyphen-separated
  words are removed from the end; a single word is hard-cut only when it alone
  exceeds the budget. The topic-project suffix is included in the same budget.

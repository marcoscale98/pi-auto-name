// locales.ts — LocaleStrings interface + per-locale string tables + registry.
// Source of truth for all user-facing and LLM-facing prompt strings.

export interface LocaleStrings {
  /** System prompts — one per style. */
  naturalSystemPrompt: string;
  slugSystemPrompt: string;
  topicProjectSystemPrompt: string;
  /** User-side rules block for natural and slug styles. */
  naturalRules: string;
  /** Full topic-project user prompt template. */
  topicProjectPromptTemplate: string;
  namingContextTemplate: string;
  conversationSection: string;
  projectLabel: string;
  firstUserMessageLabel: string;
  firstAssistantMessageLabel: string;
  noneLabel: string;
  projectSuffixLines: string;
  dedupIntro: string;
  /** One-line response format suffixed to every rendered prompt. */
  responseFormat: string;
  /** Explicit "output in {language}" directive for natural and slug styles. */
  languageDirective: string;
}

type LocaleCopy = Omit<LocaleStrings, "naturalRules"> & {
  naturalRules: string[];
};

function makeLocale(copy: LocaleCopy): LocaleStrings {
  return { ...copy, naturalRules: copy.naturalRules.join("\n") };
}

const EN = makeLocale({
  naturalSystemPrompt:
    "You create titles for AI coding sessions. Return exactly one title on one line.\n" +
    "TITLE: a concise Title Case title, up to {titleMaxChars} characters.\n" +
    "Anchor the title on a specific entity — a file, function, service, subsystem, or branch concern — so related sessions remain distinguishable.\n" +
    "Summarize the topic or intent of the work; do not restate or paraphrase the user's request.\n" +
    "No quotes, markdown, or trailing punctuation. Output only the title.",
  slugSystemPrompt:
    "Name this coding-agent session with exactly one title on one line.\n" +
    "Use lowercase hyphen-separated text, up to {titleMaxChars} characters.\n" +
    "Anchor the title on a specific entity and prefer an action-oriented name.\n" +
    "Summarize the topic or intent of the work; do not restate or paraphrase the user's request.\n" +
    "Use plain text with no quotes, markdown, trailing punctuation, or extra text.",
  topicProjectSystemPrompt:
    "Generate exactly one concise terminal title on one line, up to {titleMaxChars} characters.\n" +
    "Include the project suffix requested in the user prompt, and make the complete title fit the limit.\n" +
    "Anchor the title on a specific entity and foreground the work's action or intent.\n" +
    "Summarize the topic or intent of the work; do not restate or paraphrase the user's request.\n" +
    "Output only the title.",
  naturalRules: [
    "Name this session based on the conversation.",
    "Return exactly one title on one line.",
    "Use a concise Title Case title up to {titleMaxChars} characters.",
    "Anchor it on a specific entity so related sessions remain distinguishable.",
    "Summarize the topic or intent of the work; do not restate or paraphrase the user's request.",
    "For task-oriented work, foreground the action and its goal.",
    "Be concise and specific.",
    "No quotes, markdown, or trailing punctuation.",
    "If unclear, use a generic but relevant title.",
    "Reply with only the title, nothing else.",
  ],
  topicProjectPromptTemplate:
    "Generate one terminal title for this Pi conversation.\n" +
    "Language: {language}.\n" +
    "The complete title maximum is {titleMaxChars} characters.\n" +
    "Output rules:\n" +
    "- Output exactly one title on a single line.\n" +
    "- Include the project name as a suffix in the exact shape requested below.\n" +
    "- Do not use Markdown, bullets, code fences, quotes, explanations, or trailing punctuation.\n" +
    "{projectLines}\n" +
    "Context:\n" +
    "{projectLine}" +
    "Cwd: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Naming context\n\n{firstUserMessageLabel}\n{first}\n\nRecent user messages:\n{recent}",
  conversationSection: "\n\nConversation:\n{conversation}",
  projectLabel: "Project:",
  firstUserMessageLabel: "First user message:",
  firstAssistantMessageLabel: "First assistant message:",
  noneLabel: "none",
  projectSuffixLines:
    "- Include the project name as a suffix in this exact shape: <short topic>{separator}{projectName}.\n" +
    "- The complete title, including the suffix, must fit the character limit.",
  dedupIntro: "Existing session titles to avoid duplicating:",
  responseFormat: "Return exactly one line:\nTITLE: <title>\nDo not add any other text.",
  languageDirective:
    "Important: generate the title in English ({language}). Do not use any other language.",
});

const ZH = makeLocale({
  naturalSystemPrompt:
    "请为 AI 编程会话创建标题。请只返回一行标题。\n" +
    "TITLE：简洁的标题，不超过 {titleMaxChars} 个字符。\n" +
    "将标题锚定在具体对象上——文件、函数、服务、子系统或分支事项——以便区分相关会话。\n" +
    "总结工作的主题或意图，不要复述或改写用户的请求。\n" +
    "不要使用引号、标记或结尾标点，只输出标题。",
  slugSystemPrompt:
    "请为这个编程助手会话生成一个标题，只返回一行。\n" +
    "使用小写连字符格式，不超过 {titleMaxChars} 个字符。\n" +
    "标题应锚定具体对象，并优先体现正在进行的动作。\n" +
    "总结工作的主题或意图，不要复述或改写用户的请求。\n" +
    "使用纯文本，不要引号、标记、结尾标点或多余文本。",
  topicProjectSystemPrompt:
    "请生成一个简洁的终端标题，只返回一行，最多 {titleMaxChars} 个字符。\n" +
    "按用户提示加入项目后缀，并确保包含后缀的完整标题符合字符限制。\n" +
    "标题应锚定具体对象，并突出工作的动作或意图。\n" +
    "总结工作的主题或意图，不要复述或改写用户的请求。\n" +
    "只输出标题。",
  naturalRules: [
    "根据对话为会话命名。",
    "只返回一行标题。",
    "使用简洁标题，不超过 {titleMaxChars} 个字符。",
    "将标题锚定在具体对象上，以便区分相关会话。",
    "总结工作的主题或意图，不要复述或改写用户的请求。",
    "对于任务型工作，突出动作及其目标。",
    "简洁明确。",
    "不要使用引号、标记或结尾标点。",
    "如果不清楚，使用通用但相关的标题。",
    "只回复标题，不要其他内容。",
  ],
  topicProjectPromptTemplate:
    "为这次 Pi 对话生成一个终端标题。\n" +
    "语言：{language}。\n" +
    "完整标题最多 {titleMaxChars} 个字符。\n" +
    "输出规则：\n" +
    "- 只输出一行标题。\n" +
    "- 按下方要求将项目名作为后缀加入。\n" +
    "- 不要使用标记、列表、代码块、引号、解释或结尾标点。\n" +
    "{projectLines}\n" +
    "上下文：\n" +
    "{projectLine}" +
    "工作目录：{cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## 命名上下文\n\n{firstUserMessageLabel}\n{first}\n\n最近的用户消息：\n{recent}",
  conversationSection: "\n\n对话内容：\n{conversation}",
  projectLabel: "项目：",
  firstUserMessageLabel: "第一条用户消息：",
  firstAssistantMessageLabel: "第一条助手消息：",
  noneLabel: "无",
  projectSuffixLines:
    "- 以此确切形式加入项目名后缀：<短主题>{separator}{projectName}。\n" +
    "- 包含后缀的完整标题必须符合字符限制。",
  dedupIntro: "需要避免重复的现有会话标题：",
  responseFormat: "请只返回一行：\nTITLE: <title>\n不要添加其他文本。",
  languageDirective: "重要：请用简体中文生成标题（{language}）。不要使用其他语言。",
});

const ZH_HANT = makeLocale({
  naturalSystemPrompt:
    "請為 AI 程式設計會話建立標題。請只回傳一行標題。\n" +
    "TITLE：簡潔的標題，不超過 {titleMaxChars} 個字元。\n" +
    "將標題錨定在具體對象上——檔案、函式、服務、子系統或分支事項——以便區分相關會話。\n" +
    "總結工作的主題或意圖，不要複述或改寫使用者的請求。\n" +
    "不要使用引號、標記或結尾標點，只輸出標題。",
  slugSystemPrompt:
    "請為這個程式助理會話產生標題，只回傳一行。\n" +
    "使用小寫連字號格式，不超過 {titleMaxChars} 個字元。\n" +
    "標題應錨定具體對象，並優先體現正在進行的動作。\n" +
    "總結工作的主題或意圖，不要複述或改寫使用者的請求。\n" +
    "使用純文字，不要引號、標記、結尾標點或多餘文字。",
  topicProjectSystemPrompt:
    "請產生一個簡潔的終端機標題，只回傳一行，最多 {titleMaxChars} 個字元。\n" +
    "依照使用者提示加入專案後綴，並確保包含後綴的完整標題符合字元限制。\n" +
    "標題應錨定具體對象，並突出工作的動作或意圖。\n" +
    "總結工作的主題或意圖，不要複述或改寫使用者的請求。\n" +
    "只輸出標題。",
  naturalRules: [
    "根據對話為會話命名。",
    "只回傳一行標題。",
    "使用簡潔標題，不超過 {titleMaxChars} 個字元。",
    "將標題錨定在具體對象上，以便區分相關會話。",
    "總結工作的主題或意圖，不要複述或改寫使用者的請求。",
    "對於任務型工作，突出動作及其目標。",
    "簡潔明確。",
    "不要使用引號、標記或結尾標點。",
    "如果不清楚，使用通用但相關的標題。",
    "只回覆標題，不要其他內容。",
  ],
  topicProjectPromptTemplate:
    "為這次 Pi 對話產生一個終端機標題。\n" +
    "語言：{language}。\n" +
    "完整標題最多 {titleMaxChars} 個字元。\n" +
    "輸出規則：\n" +
    "- 只輸出一行標題。\n" +
    "- 依照下方要求將專案名稱作為後綴加入。\n" +
    "- 不要使用標記、清單、程式碼區塊、引號、解釋或結尾標點。\n" +
    "{projectLines}\n" +
    "上下文：\n" +
    "{projectLine}" +
    "工作目錄：{cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## 命名上下文\n\n{firstUserMessageLabel}\n{first}\n\n最近的使用者訊息：\n{recent}",
  conversationSection: "\n\n對話內容：\n{conversation}",
  projectLabel: "專案：",
  firstUserMessageLabel: "第一則使用者訊息：",
  firstAssistantMessageLabel: "第一則助理訊息：",
  noneLabel: "無",
  projectSuffixLines:
    "- 以此確切形式加入專案名稱後綴：<短主題>{separator}{projectName}。\n" +
    "- 包含後綴的完整標題必須符合字元限制。",
  dedupIntro: "需要避免重複的現有會話標題：",
  responseFormat: "請只回傳一行：\nTITLE: <title>\n不要新增其他文字。",
  languageDirective: "重要：請用繁體中文產生標題（{language}）。請勿使用其他語言。",
});

const JA = makeLocale({
  naturalSystemPrompt:
    "AIコーディングセッションのタイトルを作成してください。1行のタイトルだけを返してください。\n" +
    "TITLE：簡潔なタイトル（{titleMaxChars}文字以内）。\n" +
    "ファイル、関数、サービス、サブシステム、ブランチの課題など具体的な対象に結び付け、関連するセッションと区別できるようにしてください。\n" +
    "作業のトピックや意図を要約し、ユーザーの依頼をそのまま繰り返したり言い換えたりしないでください。\n" +
    "引用符、マークダウン、末尾の句読点は使わず、タイトルだけを出力してください。",
  slugSystemPrompt:
    "このコーディングエージェントのセッションにタイトルを付け、1行だけ返してください。\n" +
    "小文字のハイフン区切りで、{titleMaxChars}文字以内にしてください。\n" +
    "具体的な対象に結び付け、実行中の動作を優先してください。\n" +
    "作業のトピックや意図を要約し、ユーザーの依頼をそのまま繰り返したり言い換えたりしないでください。\n" +
    "引用符、マークダウン、末尾の句読点、余計な文字は使わないでください。",
  topicProjectSystemPrompt:
    "簡潔なターミナルタイトルを1行だけ生成してください（{titleMaxChars}文字以内）。\n" +
    "ユーザープロンプトの指示どおりプロジェクトの接尾辞を含め、接尾辞込みの全体を制限内にしてください。\n" +
    "具体的な対象に結び付け、作業の動作や意図を前面に出してください。\n" +
    "作業のトピックや意図を要約し、ユーザーの依頼をそのまま繰り返したり言い換えたりしないでください。\n" +
    "タイトルだけを出力してください。",
  naturalRules: [
    "会話に基づいてセッションに名前を付けてください。",
    "1行のタイトルだけを返してください。",
    "簡潔なタイトルを{titleMaxChars}文字以内で作成してください。",
    "具体的な対象に結び付け、関連するセッションと区別できるようにしてください。",
    "作業のトピックや意図を要約し、ユーザーの依頼を繰り返したり言い換えたりしないでください。",
    "作業の動作と目的を前面に出してください。",
    "簡潔かつ具体的にしてください。",
    "引用符、マークダウン、末尾の句読点は使わないでください。",
    "不明な場合は一般的だが関連性のあるタイトルにしてください。",
    "タイトルだけを返し、それ以外は何も書かないでください。",
  ],
  topicProjectPromptTemplate:
    "このPiの会話についてターミナルタイトルを1つ生成してください。\n" +
    "言語：{language}。\n" +
    "タイトル全体は{titleMaxChars}文字以内です。\n" +
    "出力ルール：\n" +
    "- 1行のタイトルだけを出力してください。\n" +
    "- 以下の指示どおりプロジェクト名を接尾辞として含めてください。\n" +
    "- マークダウン、箇条書き、コードブロック、引用符、説明、末尾の句読点は使わないでください。\n" +
    "{projectLines}\n" +
    "コンテキスト：\n" +
    "{projectLine}" +
    "作業ディレクトリ：{cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## 命名コンテキスト\n\n{firstUserMessageLabel}\n{first}\n\n最近のユーザーメッセージ：\n{recent}",
  conversationSection: "\n\n会話内容：\n{conversation}",
  projectLabel: "プロジェクト：",
  firstUserMessageLabel: "最初のユーザーメッセージ：",
  firstAssistantMessageLabel: "最初のアシスタントメッセージ：",
  noneLabel: "なし",
  projectSuffixLines:
    "- 次の形式でプロジェクト名を接尾辞として含めてください：<短いトピック>{separator}{projectName}。\n" +
    "- 接尾辞を含むタイトル全体を文字数制限内にしてください。",
  dedupIntro: "重複を避ける既存のセッションタイトル：",
  responseFormat: "1行だけ返してください：\nTITLE: <title>\n他のテキストは追加しないでください。",
  languageDirective:
    "重要：タイトルは日本語（{language}）で生成してください。他の言語は使わないでください。",
});

const KO = makeLocale({
  naturalSystemPrompt:
    "AI 코딩 세션의 제목을 만드세요. 한 줄의 제목만 반환하세요.\n" +
    "TITLE: {titleMaxChars}자 이내의 간결한 제목.\n" +
    "파일, 함수, 서비스, 하위 시스템 또는 브랜치 작업처럼 구체적인 대상에 고정해 관련 세션과 구별하세요.\n" +
    "작업의 주제나 의도를 요약하고 사용자의 요청을 그대로 반복하거나 바꾸어 말하지 마세요.\n" +
    "따옴표, 마크다운, 끝 구두점을 쓰지 말고 제목만 출력하세요.",
  slugSystemPrompt:
    "이 코딩 에이전트 세션의 제목을 한 줄만 반환하세요.\n" +
    "소문자 하이픈 형식으로 {titleMaxChars}자 이내로 만드세요.\n" +
    "구체적인 대상에 고정하고 진행 중인 행동을 우선하세요.\n" +
    "작업의 주제나 의도를 요약하고 사용자의 요청을 그대로 반복하거나 바꾸어 말하지 마세요.\n" +
    "따옴표, 마크다운, 끝 구두점 또는 추가 텍스트 없이 일반 텍스트를 사용하세요.",
  topicProjectSystemPrompt:
    "간결한 터미널 제목을 한 줄만 생성하세요({titleMaxChars}자 이내).\n" +
    "사용자 프롬프트의 지시에 따라 프로젝트 접미사를 포함하고 전체 제목을 제한 안에 맞추세요.\n" +
    "구체적인 대상에 고정하고 작업의 행동이나 의도를 앞세우세요.\n" +
    "작업의 주제나 의도를 요약하고 사용자의 요청을 그대로 반복하거나 바꾸어 말하지 마세요.\n" +
    "제목만 출력하세요.",
  naturalRules: [
    "대화에 따라 이 세션의 이름을 지으세요.",
    "한 줄의 제목만 반환하세요.",
    "간결한 제목을 {titleMaxChars}자 이내로 만드세요.",
    "구체적인 대상에 고정해 관련 세션과 구별하세요.",
    "작업의 주제나 의도를 요약하고 사용자의 요청을 반복하거나 바꾸어 말하지 마세요.",
    "작업의 행동과 목표를 앞세우세요.",
    "간결하고 구체적으로 작성하세요.",
    "따옴표, 마크다운, 끝 구두점을 쓰지 마세요.",
    "불확실하면 일반적이지만 관련 있는 제목을 사용하세요.",
    "제목만 답하고 다른 내용은 쓰지 마세요.",
  ],
  topicProjectPromptTemplate:
    "이 Pi 대화의 터미널 제목 하나를 생성하세요.\n" +
    "언어: {language}.\n" +
    "전체 제목은 {titleMaxChars}자 이내입니다.\n" +
    "출력 규칙:\n" +
    "- 한 줄의 제목만 출력하세요.\n" +
    "- 아래 지시에 따라 프로젝트 이름을 접미사로 포함하세요.\n" +
    "- 마크다운, 글머리 기호, 코드 블록, 따옴표, 설명, 끝 구두점을 사용하지 마세요.\n" +
    "{projectLines}\n" +
    "컨텍스트:\n" +
    "{projectLine}" +
    "작업 디렉터리: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## 명명 컨텍스트\n\n{firstUserMessageLabel}\n{first}\n\n최근 사용자 메시지:\n{recent}",
  conversationSection: "\n\n대화 내용:\n{conversation}",
  projectLabel: "프로젝트:",
  firstUserMessageLabel: "첫 번째 사용자 메시지:",
  firstAssistantMessageLabel: "첫 번째 도우미 메시지:",
  noneLabel: "없음",
  projectSuffixLines:
    "- 다음 형식으로 프로젝트 이름을 접미사로 포함하세요: <짧은 주제>{separator}{projectName}.\n" +
    "- 접미사를 포함한 전체 제목을 글자 수 제한 안에 맞추세요.",
  dedupIntro: "중복을 피할 기존 세션 제목:",
  responseFormat: "한 줄만 반환하세요:\nTITLE: <title>\n다른 텍스트는 추가하지 마세요.",
  languageDirective: "중요: 제목은 한국어({language})로 생성하세요. 다른 언어는 사용하지 마세요.",
});

const PT_BR = makeLocale({
  naturalSystemPrompt:
    "Crie um título para uma sessão de codificação com IA. Retorne apenas um título em uma linha.\n" +
    "TITLE: um título conciso em Title Case, com até {titleMaxChars} caracteres.\n" +
    "Ancore o título em uma entidade específica — arquivo, função, serviço, subsistema ou questão de branch — para distinguir sessões relacionadas.\n" +
    "Resuma o tópico ou a intenção do trabalho; não repita nem parafraseie o pedido do usuário.\n" +
    "Sem aspas, markdown ou pontuação final; produza somente o título.",
  slugSystemPrompt:
    "Dê um título a esta sessão de agente de codificação e retorne somente uma linha.\n" +
    "Use texto minúsculo separado por hífens, com até {titleMaxChars} caracteres.\n" +
    "Ancore o título em uma entidade específica e prefira uma ação.\n" +
    "Resuma o tópico ou a intenção do trabalho; não repita nem parafraseie o pedido do usuário.\n" +
    "Use texto simples, sem aspas, markdown, pontuação final ou texto extra.",
  topicProjectSystemPrompt:
    "Gere um único título conciso de terminal em uma linha, com até {titleMaxChars} caracteres.\n" +
    "Inclua o sufixo do projeto pedido pelo usuário e faça o título completo caber no limite.\n" +
    "Ancore o título em uma entidade específica e destaque a ação ou intenção do trabalho.\n" +
    "Resuma o tópico ou a intenção do trabalho; não repita nem parafraseie o pedido do usuário.\n" +
    "Produza somente o título.",
  naturalRules: [
    "Nomeie esta sessão com base na conversa.",
    "Retorne exatamente um título em uma linha.",
    "Use um título conciso em Title Case com até {titleMaxChars} caracteres.",
    "Ancore-o em uma entidade específica para distinguir sessões relacionadas.",
    "Resuma o tópico ou a intenção do trabalho; não repita nem parafraseie o pedido do usuário.",
    "Destaque a ação e seu objetivo.",
    "Seja conciso e específico.",
    "Sem aspas, markdown ou pontuação final.",
    "Se não tiver certeza, use um título genérico, porém relevante.",
    "Responda somente com o título, nada mais.",
  ],
  topicProjectPromptTemplate:
    "Gere um título de terminal para esta conversa do Pi.\n" +
    "Idioma: {language}.\n" +
    "O título completo tem no máximo {titleMaxChars} caracteres.\n" +
    "Regras de saída:\n" +
    "- Produza exatamente um título em uma única linha.\n" +
    "- Inclua o nome do projeto como sufixo conforme as instruções abaixo.\n" +
    "- Não use Markdown, marcadores, blocos de código, aspas, explicações ou pontuação final.\n" +
    "{projectLines}\n" +
    "Contexto:\n" +
    "{projectLine}" +
    "Diretório de trabalho: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Contexto de nomeação\n\n{firstUserMessageLabel}\n{first}\n\nMensagens recentes do usuário:\n{recent}",
  conversationSection: "\n\nConversa:\n{conversation}",
  projectLabel: "Projeto:",
  firstUserMessageLabel: "Primeira mensagem do usuário:",
  firstAssistantMessageLabel: "Primeira mensagem do assistente:",
  noneLabel: "nenhum",
  projectSuffixLines:
    "- Inclua o projeto como sufixo neste formato exato: <tópico curto>{separator}{projectName}.\n" +
    "- O título completo, com o sufixo, deve caber no limite de caracteres.",
  dedupIntro: "Títulos de sessão existentes a evitar duplicar:",
  responseFormat: "Retorne exatamente uma linha:\nTITLE: <title>\nNão adicione outro texto.",
  languageDirective: "Importante: gere o título em português ({language}). Não use outro idioma.",
});

const ES = makeLocale({
  naturalSystemPrompt:
    "Cree un título para una sesión de programación con IA. Devuelva solo un título en una línea.\n" +
    "TITLE: un título conciso en Title Case, de hasta {titleMaxChars} caracteres.\n" +
    "Ancle el título en una entidad específica — archivo, función, servicio, subsistema o asunto de rama — para distinguir sesiones relacionadas.\n" +
    "Resuma el tema o la intención del trabajo; no repita ni parafrasee la solicitud del usuario.\n" +
    "Sin comillas, markdown ni puntuación final; produzca solo el título.",
  slugSystemPrompt:
    "Ponga título a esta sesión de agente de programación y devuelva solo una línea.\n" +
    "Use texto en minúsculas separado por guiones, de hasta {titleMaxChars} caracteres.\n" +
    "Ancle el título en una entidad específica y prefiera una acción.\n" +
    "Resuma el tema o la intención del trabajo; no repita ni parafrasee la solicitud del usuario.\n" +
    "Use texto plano, sin comillas, markdown, puntuación final ni texto adicional.",
  topicProjectSystemPrompt:
    "Genere un único título conciso de terminal en una línea, de hasta {titleMaxChars} caracteres.\n" +
    "Incluya el sufijo del proyecto solicitado y haga que el título completo quepa en el límite.\n" +
    "Ancle el título en una entidad específica y destaque la acción o intención del trabajo.\n" +
    "Resuma el tema o la intención del trabajo; no repita ni parafrasee la solicitud del usuario.\n" +
    "Produzca solo el título.",
  naturalRules: [
    "Ponga nombre a esta sesión según la conversación.",
    "Devuelva exactamente un título en una línea.",
    "Use un título conciso en Title Case de hasta {titleMaxChars} caracteres.",
    "Anclelo en una entidad específica para distinguir sesiones relacionadas.",
    "Resuma el tema o la intención del trabajo; no repita ni parafrasee la solicitud del usuario.",
    "Destaque la acción y su objetivo.",
    "Sea conciso y específico.",
    "Sin comillas, markdown ni puntuación final.",
    "Si no está seguro, use un título genérico pero relevante.",
    "Responda solo con el título, nada más.",
  ],
  topicProjectPromptTemplate:
    "Genere un título de pestaña para esta conversación de Pi.\n" +
    "Idioma: {language}.\n" +
    "El título completo tiene como máximo {titleMaxChars} caracteres.\n" +
    "Reglas de salida:\n" +
    "- Produzca exactamente un título en una sola línea.\n" +
    "- Incluya el nombre del proyecto como sufijo según las instrucciones siguientes.\n" +
    "- No use Markdown, viñetas, bloques de código, comillas, explicaciones ni puntuación final.\n" +
    "{projectLines}\n" +
    "Contexto:\n" +
    "{projectLine}" +
    "Directorio de trabajo: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Contexto de nombre\n\n{firstUserMessageLabel}\n{first}\n\nMensajes recientes del usuario:\n{recent}",
  conversationSection: "\n\nConversación:\n{conversation}",
  projectLabel: "Proyecto:",
  firstUserMessageLabel: "Primer mensaje del usuario:",
  firstAssistantMessageLabel: "Primer mensaje del asistente:",
  noneLabel: "ninguno",
  projectSuffixLines:
    "- Incluya el proyecto como sufijo en esta forma exacta: <tema corto>{separator}{projectName}.\n" +
    "- El título completo, incluido el sufijo, debe caber en el límite de caracteres.",
  dedupIntro: "Títulos de sesión existentes que se deben evitar duplicar:",
  responseFormat: "Devuelva exactamente una línea:\nTITLE: <title>\nNo añada ningún otro texto.",
  languageDirective: "Importante: genere el título en español ({language}). No use otro idioma.",
});

const DE = makeLocale({
  naturalSystemPrompt:
    "Erstellen Sie einen Titel für eine KI-Programmiersitzung. Geben Sie nur einen Titel in einer Zeile zurück.\n" +
    "TITLE: ein prägnanter Titel im Title Case mit höchstens {titleMaxChars} Zeichen.\n" +
    "Verankern Sie den Titel an einer konkreten Einheit — Datei, Funktion, Dienst, Subsystem oder Branch-Anliegen — damit verwandte Sitzungen unterscheidbar bleiben.\n" +
    "Fassen Sie Thema oder Absicht der Arbeit zusammen; wiederholen oder paraphrasieren Sie die Benutzeranfrage nicht.\n" +
    "Keine Anführungszeichen, kein Markdown und keine Satzzeichen am Ende; nur den Titel ausgeben.",
  slugSystemPrompt:
    "Benennen Sie diese Programmieragent-Sitzung und geben Sie nur eine Zeile zurück.\n" +
    "Verwenden Sie kleingeschriebenen, durch Bindestriche getrennten Text mit höchstens {titleMaxChars} Zeichen.\n" +
    "Verankern Sie den Titel an einer konkreten Einheit und bevorzugen Sie eine Aktion.\n" +
    "Fassen Sie Thema oder Absicht der Arbeit zusammen; wiederholen oder paraphrasieren Sie die Benutzeranfrage nicht.\n" +
    "Klartext ohne Anführungszeichen, Markdown, Satzzeichen am Ende oder zusätzlichen Text.",
  topicProjectSystemPrompt:
    "Erstellen Sie genau einen prägnanten Terminaltitel in einer Zeile mit höchstens {titleMaxChars} Zeichen.\n" +
    "Fügen Sie das verlangte Projektsuffix hinzu und halten Sie den vollständigen Titel innerhalb des Limits.\n" +
    "Verankern Sie den Titel an einer konkreten Einheit und stellen Sie Aktion oder Absicht der Arbeit heraus.\n" +
    "Fassen Sie Thema oder Absicht der Arbeit zusammen; wiederholen oder paraphrasieren Sie die Benutzeranfrage nicht.\n" +
    "Geben Sie nur den Titel aus.",
  naturalRules: [
    "Benennen Sie diese Sitzung anhand der Konversation.",
    "Geben Sie genau einen Titel in einer Zeile zurück.",
    "Verwenden Sie einen prägnanten Titel im Title Case mit höchstens {titleMaxChars} Zeichen.",
    "Verankern Sie ihn an einer konkreten Einheit, um verwandte Sitzungen zu unterscheiden.",
    "Fassen Sie Thema oder Absicht der Arbeit zusammen; wiederholen oder paraphrasieren Sie die Benutzeranfrage nicht.",
    "Stellen Sie die Aktion und ihr Ziel heraus.",
    "Seien Sie prägnant und spezifisch.",
    "Keine Anführungszeichen, kein Markdown und keine Satzzeichen am Ende.",
    "Wenn Sie unsicher sind, verwenden Sie einen generischen, aber passenden Titel.",
    "Antworten Sie nur mit dem Titel, sonst nichts.",
  ],
  topicProjectPromptTemplate:
    "Generieren Sie einen Terminaltitel für dieses Pi-Gespräch.\n" +
    "Sprache: {language}.\n" +
    "Der vollständige Titel darf höchstens {titleMaxChars} Zeichen haben.\n" +
    "Ausgaberegeln:\n" +
    "- Geben Sie genau einen Titel in einer einzigen Zeile aus.\n" +
    "- Fügen Sie den Projektnamen gemäß den folgenden Anweisungen als Suffix ein.\n" +
    "- Kein Markdown, keine Aufzählungen, Codeblöcke, Anführungszeichen, Erklärungen oder Satzzeichen am Ende.\n" +
    "{projectLines}\n" +
    "Kontext:\n" +
    "{projectLine}" +
    "Arbeitsverzeichnis: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Benennungskontext\n\n{firstUserMessageLabel}\n{first}\n\nLetzte Benutzernachrichten:\n{recent}",
  conversationSection: "\n\nKonversation:\n{conversation}",
  projectLabel: "Projekt:",
  firstUserMessageLabel: "Erste Benutzernachricht:",
  firstAssistantMessageLabel: "Erste Assistentennachricht:",
  noneLabel: "keine",
  projectSuffixLines:
    "- Fügen Sie das Projekt in dieser exakten Form als Suffix ein: <kurzes Thema>{separator}{projectName}.\n" +
    "- Der vollständige Titel einschließlich Suffix muss in das Zeichenlimit passen.",
  dedupIntro: "Bestehende Sitzungstitel, deren Duplikation vermieden werden soll:",
  responseFormat:
    "Geben Sie genau eine Zeile zurück:\nTITLE: <title>\nFügen Sie keinen weiteren Text hinzu.",
  languageDirective:
    "Wichtig: Erstellen Sie den Titel auf Deutsch ({language}). Verwenden Sie keine andere Sprache.",
});

const FR = makeLocale({
  naturalSystemPrompt:
    "Créez un titre pour une session de programmation IA. Renvoyez uniquement un titre sur une ligne.\n" +
    "TITLE : un titre concis en Title Case, de {titleMaxChars} caractères maximum.\n" +
    "Ancrez le titre sur une entité précise — fichier, fonction, service, sous-système ou sujet de branche — pour distinguer les sessions liées.\n" +
    "Résumez le sujet ou l'intention du travail ; ne répétez pas et ne paraphrasez pas la demande de l'utilisateur.\n" +
    "Sans guillemets, markdown ni ponctuation finale ; produisez uniquement le titre.",
  slugSystemPrompt:
    "Nommez cette session d'agent de codage et renvoyez une seule ligne.\n" +
    "Utilisez du texte en minuscules séparé par des tirets, de {titleMaxChars} caractères maximum.\n" +
    "Ancrez le titre sur une entité précise et privilégiez une action.\n" +
    "Résumez le sujet ou l'intention du travail ; ne répétez pas et ne paraphrasez pas la demande de l'utilisateur.\n" +
    "Texte brut, sans guillemets, markdown, ponctuation finale ni texte supplémentaire.",
  topicProjectSystemPrompt:
    "Générez un seul titre de terminal concis sur une ligne, de {titleMaxChars} caractères maximum.\n" +
    "Incluez le suffixe du projet demandé et faites tenir le titre complet dans la limite.\n" +
    "Ancrez le titre sur une entité précise et mettez en avant l'action ou l'intention du travail.\n" +
    "Résumez le sujet ou l'intention du travail ; ne répétez pas et ne paraphrasez pas la demande de l'utilisateur.\n" +
    "Produisez uniquement le titre.",
  naturalRules: [
    "Nommez cette session selon la conversation.",
    "Renvoyez exactement un titre sur une ligne.",
    "Utilisez un titre concis en Title Case de {titleMaxChars} caractères maximum.",
    "Ancrez-le sur une entité précise pour distinguer les sessions liées.",
    "Résumez le sujet ou l'intention du travail ; ne répétez pas et ne paraphrasez pas la demande de l'utilisateur.",
    "Mettez en avant l'action et son objectif.",
    "Soyez concis et précis.",
    "Sans guillemets, markdown ni ponctuation finale.",
    "En cas de doute, utilisez un titre générique mais pertinent.",
    "Répondez uniquement avec le titre, rien d'autre.",
  ],
  topicProjectPromptTemplate:
    "Générez un titre d'onglet pour cette conversation Pi.\n" +
    "Langue : {language}.\n" +
    "Le titre complet comporte au maximum {titleMaxChars} caractères.\n" +
    "Règles de sortie :\n" +
    "- Produisez exactement un titre sur une seule ligne.\n" +
    "- Incluez le nom du projet comme suffixe selon les instructions ci-dessous.\n" +
    "- N'utilisez pas de Markdown, puces, blocs de code, guillemets, explications ni ponctuation finale.\n" +
    "{projectLines}\n" +
    "Contexte :\n" +
    "{projectLine}" +
    "Répertoire de travail : {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Contexte de nommage\n\n{firstUserMessageLabel}\n{first}\n\nMessages récents de l'utilisateur :\n{recent}",
  conversationSection: "\n\nConversation :\n{conversation}",
  projectLabel: "Projet :",
  firstUserMessageLabel: "Premier message de l'utilisateur :",
  firstAssistantMessageLabel: "Premier message de l'assistant :",
  noneLabel: "aucun",
  projectSuffixLines:
    "- Incluez le projet comme suffixe dans cette forme exacte : <sujet court>{separator}{projectName}.\n" +
    "- Le titre complet, suffixe compris, doit respecter la limite de caractères.",
  dedupIntro: "Titres de session existants à ne pas dupliquer :",
  responseFormat: "Renvoyez exactement une ligne :\nTITLE: <title>\nN'ajoutez aucun autre texte.",
  languageDirective:
    "Important : générez le titre en français ({language}). N'utilisez aucune autre langue.",
});

const ID = makeLocale({
  naturalSystemPrompt:
    "Buat judul untuk sesi pengodean AI. Kembalikan hanya satu judul dalam satu baris.\n" +
    "TITLE: judul ringkas dalam Title Case, hingga {titleMaxChars} karakter.\n" +
    "Tautkan judul ke entitas tertentu — file, fungsi, layanan, subsistem, atau urusan cabang — agar sesi terkait tetap dapat dibedakan.\n" +
    "Ringkas topik atau maksud pekerjaan; jangan mengulang atau memparafrasekan permintaan pengguna.\n" +
    "Tanpa tanda kutip, markdown, atau tanda baca akhir; keluarkan hanya judul.",
  slugSystemPrompt:
    "Beri judul pada sesi agen pengodean ini dan kembalikan hanya satu baris.\n" +
    "Gunakan teks huruf kecil yang dipisahkan tanda hubung, hingga {titleMaxChars} karakter.\n" +
    "Tautkan judul ke entitas tertentu dan utamakan tindakan.\n" +
    "Ringkas topik atau maksud pekerjaan; jangan mengulang atau memparafrasekan permintaan pengguna.\n" +
    "Gunakan teks biasa tanpa tanda kutip, markdown, tanda baca akhir, atau teks tambahan.",
  topicProjectSystemPrompt:
    "Buat satu judul terminal yang ringkas dalam satu baris, hingga {titleMaxChars} karakter.\n" +
    "Sertakan sufiks proyek yang diminta dan pastikan seluruh judul muat dalam batas.\n" +
    "Tautkan judul ke entitas tertentu dan tonjolkan tindakan atau maksud pekerjaan.\n" +
    "Ringkas topik atau maksud pekerjaan; jangan mengulang atau memparafrasekan permintaan pengguna.\n" +
    "Keluarkan hanya judul.",
  naturalRules: [
    "Beri nama sesi ini berdasarkan percakapan.",
    "Kembalikan tepat satu judul dalam satu baris.",
    "Gunakan judul ringkas dalam Title Case hingga {titleMaxChars} karakter.",
    "Tautkan judul ke entitas tertentu agar sesi terkait dapat dibedakan.",
    "Ringkas topik atau maksud pekerjaan; jangan mengulang atau memparafrasekan permintaan pengguna.",
    "Tonjolkan tindakan dan tujuannya.",
    "Ringkas dan spesifik.",
    "Tanpa tanda kutip, markdown, atau tanda baca akhir.",
    "Jika ragu, gunakan judul umum tetapi relevan.",
    "Balas hanya dengan judul, tanpa yang lain.",
  ],
  topicProjectPromptTemplate:
    "Buat satu judul terminal untuk percakapan Pi ini.\n" +
    "Bahasa: {language}.\n" +
    "Judul lengkap maksimal {titleMaxChars} karakter.\n" +
    "Aturan keluaran:\n" +
    "- Keluarkan tepat satu judul pada satu baris.\n" +
    "- Sertakan nama proyek sebagai sufiks sesuai petunjuk di bawah.\n" +
    "- Jangan gunakan Markdown, poin, blok kode, tanda kutip, penjelasan, atau tanda baca akhir.\n" +
    "{projectLines}\n" +
    "Konteks:\n" +
    "{projectLine}" +
    "Direktori kerja: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Konteks penamaan\n\n{firstUserMessageLabel}\n{first}\n\nPesan pengguna terbaru:\n{recent}",
  conversationSection: "\n\nPercakapan:\n{conversation}",
  projectLabel: "Proyek:",
  firstUserMessageLabel: "Pesan pengguna pertama:",
  firstAssistantMessageLabel: "Pesan asisten pertama:",
  noneLabel: "tidak ada",
  projectSuffixLines:
    "- Sertakan proyek sebagai sufiks dalam bentuk tepat ini: <topik singkat>{separator}{projectName}.\n" +
    "- Judul lengkap termasuk sufiks harus sesuai batas karakter.",
  dedupIntro: "Judul sesi yang ada untuk dihindari duplikasinya:",
  responseFormat: "Kembalikan tepat satu baris:\nTITLE: <title>\nJangan tambahkan teks lain.",
  languageDirective:
    "Penting: buat judul dalam bahasa Indonesia ({language}). Jangan gunakan bahasa lain.",
});

const VI = makeLocale({
  naturalSystemPrompt:
    "Hãy tạo tiêu đề cho phiên lập trình AI. Chỉ trả về một tiêu đề trên một dòng.\n" +
    "TITLE: tiêu đề ngắn gọn, tối đa {titleMaxChars} ký tự.\n" +
    "Gắn tiêu đề với một thực thể cụ thể — tệp, hàm, dịch vụ, hệ thống con hoặc vấn đề của nhánh — để phân biệt các phiên liên quan.\n" +
    "Tóm tắt chủ đề hoặc ý định của công việc; không lặp lại hay diễn giải lại yêu cầu của người dùng.\n" +
    "Không dùng dấu ngoặc kép, markdown hoặc dấu câu cuối; chỉ xuất tiêu đề.",
  slugSystemPrompt:
    "Đặt tiêu đề cho phiên tác nhân lập trình này và chỉ trả về một dòng.\n" +
    "Dùng chữ thường, phân tách bằng dấu gạch nối, tối đa {titleMaxChars} ký tự.\n" +
    "Gắn tiêu đề với thực thể cụ thể và ưu tiên hành động.\n" +
    "Tóm tắt chủ đề hoặc ý định của công việc; không lặp lại hay diễn giải lại yêu cầu của người dùng.\n" +
    "Dùng văn bản thuần, không dấu ngoặc kép, markdown, dấu câu cuối hoặc văn bản thừa.",
  topicProjectSystemPrompt:
    "Tạo đúng một tiêu đề terminal ngắn gọn trên một dòng, tối đa {titleMaxChars} ký tự.\n" +
    "Đưa hậu tố dự án được yêu cầu vào và bảo đảm toàn bộ tiêu đề nằm trong giới hạn.\n" +
    "Gắn tiêu đề với thực thể cụ thể và nêu bật hành động hoặc ý định của công việc.\n" +
    "Tóm tắt chủ đề hoặc ý định của công việc; không lặp lại hay diễn giải lại yêu cầu của người dùng.\n" +
    "Chỉ xuất tiêu đề.",
  naturalRules: [
    "Đặt tên phiên dựa trên cuộc trò chuyện.",
    "Chỉ trả về một tiêu đề trên một dòng.",
    "Dùng tiêu đề ngắn gọn, tối đa {titleMaxChars} ký tự.",
    "Gắn tiêu đề với thực thể cụ thể để phân biệt các phiên liên quan.",
    "Tóm tắt chủ đề hoặc ý định của công việc; không lặp lại hay diễn giải lại yêu cầu của người dùng.",
    "Nêu bật hành động và mục tiêu của nó.",
    "Ngắn gọn và cụ thể.",
    "Không dùng dấu ngoặc kép, markdown hoặc dấu câu cuối.",
    "Nếu không rõ, dùng tiêu đề chung nhưng phù hợp.",
    "Chỉ trả lời bằng tiêu đề, không thêm gì khác.",
  ],
  topicProjectPromptTemplate:
    "Tạo một tiêu đề terminal cho cuộc trò chuyện Pi này.\n" +
    "Ngôn ngữ: {language}.\n" +
    "Toàn bộ tiêu đề tối đa {titleMaxChars} ký tự.\n" +
    "Quy tắc đầu ra:\n" +
    "- Chỉ xuất đúng một tiêu đề trên một dòng.\n" +
    "- Thêm tên dự án làm hậu tố theo hướng dẫn bên dưới.\n" +
    "- Không dùng Markdown, gạch đầu dòng, khối mã, dấu ngoặc kép, giải thích hoặc dấu câu cuối.\n" +
    "{projectLines}\n" +
    "Bối cảnh:\n" +
    "{projectLine}" +
    "Thư mục làm việc: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Bối cảnh đặt tên\n\n{firstUserMessageLabel}\n{first}\n\nTin nhắn gần đây của người dùng:\n{recent}",
  conversationSection: "\n\nCuộc trò chuyện:\n{conversation}",
  projectLabel: "Dự án:",
  firstUserMessageLabel: "Tin nhắn đầu tiên của người dùng:",
  firstAssistantMessageLabel: "Tin nhắn đầu tiên của trợ lý:",
  noneLabel: "không có",
  projectSuffixLines:
    "- Thêm dự án làm hậu tố theo đúng dạng này: <chủ đề ngắn>{separator}{projectName}.\n" +
    "- Toàn bộ tiêu đề, gồm cả hậu tố, phải nằm trong giới hạn ký tự.",
  dedupIntro: "Các tiêu đề phiên hiện có cần tránh trùng lặp:",
  responseFormat: "Chỉ trả về một dòng:\nTITLE: <title>\nKhông thêm văn bản nào khác.",
  languageDirective:
    "Quan trọng: hãy tạo tiêu đề bằng tiếng Việt ({language}). Không dùng ngôn ngữ khác.",
});

const TR = makeLocale({
  naturalSystemPrompt:
    "Bir yapay zekâ kodlama oturumu için başlık oluşturun. Tek satırda yalnızca bir başlık döndürün.\n" +
    "TITLE: {titleMaxChars} karaktere kadar kısa ve öz bir başlık.\n" +
    "Başlığı belirli bir varlığa — dosya, işlev, hizmet, alt sistem veya dal konusu — sabitleyerek ilgili oturumları ayırt edin.\n" +
    "Çalışmanın konusunu veya amacını özetleyin; kullanıcının isteğini tekrarlamayın veya yeniden ifade etmeyin.\n" +
    "Tırnak, markdown veya sonda noktalama kullanmayın; yalnızca başlığı yazın.",
  slugSystemPrompt:
    "Bu kodlama aracısı oturumuna başlık verin ve yalnızca bir satır döndürün.\n" +
    "{titleMaxChars} karaktere kadar küçük harfli, tirelerle ayrılmış metin kullanın.\n" +
    "Başlığı belirli bir varlığa sabitleyin ve eylemi tercih edin.\n" +
    "Çalışmanın konusunu veya amacını özetleyin; kullanıcının isteğini tekrarlamayın veya yeniden ifade etmeyin.\n" +
    "Tırnak, markdown, sonda noktalama veya ek metin olmadan düz metin kullanın.",
  topicProjectSystemPrompt:
    "Tek satırda, {titleMaxChars} karaktere kadar tek ve kısa bir terminal başlığı oluşturun.\n" +
    "İstenen proje sonekini ekleyin ve sonek dahil başlığın tamamını sınıra sığdırın.\n" +
    "Başlığı belirli bir varlığa sabitleyin ve çalışmanın eylemini veya amacını öne çıkarın.\n" +
    "Çalışmanın konusunu veya amacını özetleyin; kullanıcının isteğini tekrarlamayın veya yeniden ifade etmeyin.\n" +
    "Yalnızca başlığı çıkarın.",
  naturalRules: [
    "Bu oturumu konuşmaya göre adlandırın.",
    "Tek satırda tam olarak bir başlık döndürün.",
    "{titleMaxChars} karaktere kadar kısa ve öz bir başlık kullanın.",
    "İlgili oturumları ayırt etmek için belirli bir varlığa sabitleyin.",
    "Çalışmanın konusunu veya amacını özetleyin; kullanıcının isteğini tekrarlamayın veya yeniden ifade etmeyin.",
    "Eylemi ve amacını öne çıkarın.",
    "Kısa ve belirli olun.",
    "Tırnak, markdown veya sonda noktalama kullanmayın.",
    "Belirsizse genel ama ilgili bir başlık kullanın.",
    "Yalnızca başlıkla yanıt verin, başka hiçbir şey yazmayın.",
  ],
  topicProjectPromptTemplate:
    "Bu Pi konuşması için bir terminal başlığı oluşturun.\n" +
    "Dil: {language}.\n" +
    "Tam başlık en fazla {titleMaxChars} karakterdir.\n" +
    "Çıktı kuralları:\n" +
    "- Tek bir başlığı tek satırda çıkarın.\n" +
    "- Proje adını aşağıdaki talimatlara göre sonek olarak ekleyin.\n" +
    "- Markdown, madde işareti, kod bloğu, tırnak, açıklama veya sonda noktalama kullanmayın.\n" +
    "{projectLines}\n" +
    "Bağlam:\n" +
    "{projectLine}" +
    "Çalışma dizini: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Adlandırma bağlamı\n\n{firstUserMessageLabel}\n{first}\n\nSon kullanıcı mesajları:\n{recent}",
  conversationSection: "\n\nKonuşma:\n{conversation}",
  projectLabel: "Proje:",
  firstUserMessageLabel: "İlk kullanıcı mesajı:",
  firstAssistantMessageLabel: "İlk asistan mesajı:",
  noneLabel: "yok",
  projectSuffixLines:
    "- Proje adını şu kesin biçimde sonek olarak ekleyin: <kısa konu>{separator}{projectName}.\n" +
    "- Sonek dahil tam başlık karakter sınırına sığmalıdır.",
  dedupIntro: "Yinelenmemesi gereken mevcut oturum başlıkları:",
  responseFormat: "Tam olarak bir satır döndürün:\nTITLE: <title>\nBaşka metin eklemeyin.",
  languageDirective: "Önemli: başlığı Türkçe ({language}) oluşturun. Başka dil kullanmayın.",
});

const PL = makeLocale({
  naturalSystemPrompt:
    "Utwórz tytuł dla sesji programistycznej AI. Zwróć tylko jeden tytuł w jednym wierszu.\n" +
    "TITLE: zwięzły tytuł w Title Case, do {titleMaxChars} znaków.\n" +
    "Zakotwicz tytuł na konkretnej jednostce — pliku, funkcji, usłudze, podsystemie lub kwestii gałęzi — aby odróżnić powiązane sesje.\n" +
    "Podsumuj temat lub intencję pracy; nie powtarzaj ani nie parafrazuj prośby użytkownika.\n" +
    "Bez cudzysłowów, markdownu i interpunkcji na końcu; wypisz tylko tytuł.",
  slugSystemPrompt:
    "Nadaj tytuł tej sesji agenta programistycznego i zwróć tylko jeden wiersz.\n" +
    "Użyj małych liter rozdzielonych łącznikami, do {titleMaxChars} znaków.\n" +
    "Zakotwicz tytuł na konkretnej jednostce i preferuj działanie.\n" +
    "Podsumuj temat lub intencję pracy; nie powtarzaj ani nie parafrazuj prośby użytkownika.\n" +
    "Użyj zwykłego tekstu bez cudzysłowów, markdownu, interpunkcji na końcu ani dodatkowego tekstu.",
  topicProjectSystemPrompt:
    "Wygeneruj jeden zwięzły tytuł terminala w jednym wierszu, do {titleMaxChars} znaków.\n" +
    "Dodaj wymagany przyrostek projektu i dopasuj cały tytuł do limitu.\n" +
    "Zakotwicz tytuł na konkretnej jednostce i wysuń na pierwszy plan działanie lub intencję pracy.\n" +
    "Podsumuj temat lub intencję pracy; nie powtarzaj ani nie parafrazuj prośby użytkownika.\n" +
    "Wypisz tylko tytuł.",
  naturalRules: [
    "Nadaj tej sesji nazwę na podstawie rozmowy.",
    "Zwróć dokładnie jeden tytuł w jednym wierszu.",
    "Użyj zwięzłego tytułu w Title Case do {titleMaxChars} znaków.",
    "Zakotwicz go na konkretnej jednostce, aby odróżnić powiązane sesje.",
    "Podsumuj temat lub intencję pracy; nie powtarzaj ani nie parafrazuj prośby użytkownika.",
    "Wysuń na pierwszy plan działanie i jego cel.",
    "Bądź zwięzły i konkretny.",
    "Bez cudzysłowów, markdownu i interpunkcji na końcu.",
    "W razie niepewności użyj ogólnego, ale trafnego tytułu.",
    "Odpowiedz tylko tytułem, niczym więcej.",
  ],
  topicProjectPromptTemplate:
    "Wygeneruj tytuł karty terminala dla tej rozmowy Pi.\n" +
    "Język: {language}.\n" +
    "Cały tytuł może mieć najwyżej {titleMaxChars} znaków.\n" +
    "Zasady wyjścia:\n" +
    "- Wypisz dokładnie jeden tytuł w jednym wierszu.\n" +
    "- Dodaj nazwę projektu jako przyrostek zgodnie z poniższymi instrukcjami.\n" +
    "- Nie używaj Markdownu, wypunktowań, bloków kodu, cudzysłowów, wyjaśnień ani interpunkcji na końcu.\n" +
    "{projectLines}\n" +
    "Kontekst:\n" +
    "{projectLine}" +
    "Katalog roboczy: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Kontekst nazewnictwa\n\n{firstUserMessageLabel}\n{first}\n\nOstatnie wiadomości użytkownika:\n{recent}",
  conversationSection: "\n\nRozmowa:\n{conversation}",
  projectLabel: "Projekt:",
  firstUserMessageLabel: "Pierwsza wiadomość użytkownika:",
  firstAssistantMessageLabel: "Pierwsza wiadomość asystenta:",
  noneLabel: "brak",
  projectSuffixLines:
    "- Dodaj projekt jako przyrostek w dokładnie tej formie: <krótki temat>{separator}{projectName}.\n" +
    "- Cały tytuł wraz z przyrostkiem musi zmieścić się w limicie znaków.",
  dedupIntro: "Istniejące tytuły sesji, których duplikowania należy unikać:",
  responseFormat: "Zwróć dokładnie jeden wiersz:\nTITLE: <title>\nNie dodawaj innego tekstu.",
  languageDirective: "Ważne: wygeneruj tytuł po polsku ({language}). Nie używaj innego języka.",
});

const UK = makeLocale({
  naturalSystemPrompt:
    "Створіть заголовок для сесії програмування з AI. Поверніть лише один заголовок в одному рядку.\n" +
    "TITLE: стислий заголовок, до {titleMaxChars} символів.\n" +
    "Прив’яжіть заголовок до конкретної сутності — файлу, функції, служби, підсистеми або питання гілки — щоб розрізняти пов’язані сесії.\n" +
    "Підсумуйте тему або намір роботи; не повторюйте й не перефразовуйте запит користувача.\n" +
    "Без лапок, markdown і пунктуації в кінці; виведіть лише заголовок.",
  slugSystemPrompt:
    "Дайте назву цій сесії агента програмування й поверніть лише один рядок.\n" +
    "Використовуйте нижній регістр і дефіси, до {titleMaxChars} символів.\n" +
    "Прив’яжіть заголовок до конкретної сутності та надайте перевагу дії.\n" +
    "Підсумуйте тему або намір роботи; не повторюйте й не перефразовуйте запит користувача.\n" +
    "Звичайний текст без лапок, markdown, пунктуації в кінці чи зайвого тексту.",
  topicProjectSystemPrompt:
    "Створіть один стислий заголовок термінала в одному рядку, до {titleMaxChars} символів.\n" +
    "Додайте потрібний суфікс проєкту й умістіть повний заголовок у ліміт.\n" +
    "Прив’яжіть заголовок до конкретної сутності та виділіть дію або намір роботи.\n" +
    "Підсумуйте тему або намір роботи; не повторюйте й не перефразовуйте запит користувача.\n" +
    "Виведіть лише заголовок.",
  naturalRules: [
    "Назвіть цю сесію на основі розмови.",
    "Поверніть рівно один заголовок в одному рядку.",
    "Використайте стислий заголовок до {titleMaxChars} символів.",
    "Прив’яжіть його до конкретної сутності, щоб розрізняти пов’язані сесії.",
    "Підсумуйте тему або намір роботи; не повторюйте й не перефразовуйте запит користувача.",
    "Виділіть дію та її мету.",
    "Будьте стислими й конкретними.",
    "Без лапок, markdown і пунктуації в кінці.",
    "Якщо не впевнені, використайте загальний, але доречний заголовок.",
    "Відповідайте лише заголовком, нічого більше.",
  ],
  topicProjectPromptTemplate:
    "Згенеруйте заголовок вкладки термінала для цієї розмови Pi.\n" +
    "Мова: {language}.\n" +
    "Повний заголовок має містити не більше {titleMaxChars} символів.\n" +
    "Правила виводу:\n" +
    "- Виведіть рівно один заголовок в одному рядку.\n" +
    "- Додайте назву проєкту як суфікс за наведеними нижче інструкціями.\n" +
    "- Не використовуйте Markdown, маркери, блоки коду, лапки, пояснення або пунктуацію в кінці.\n" +
    "{projectLines}\n" +
    "Контекст:\n" +
    "{projectLine}" +
    "Робочий каталог: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Контекст найменування\n\n{firstUserMessageLabel}\n{first}\n\nОстанні повідомлення користувача:\n{recent}",
  conversationSection: "\n\nРозмова:\n{conversation}",
  projectLabel: "Проєкт:",
  firstUserMessageLabel: "Перше повідомлення користувача:",
  firstAssistantMessageLabel: "Перше повідомлення асистента:",
  noneLabel: "немає",
  projectSuffixLines:
    "- Додайте проєкт як суфікс у точно такій формі: <коротка тема>{separator}{projectName}.\n" +
    "- Повний заголовок разом із суфіксом має відповідати ліміту символів.",
  dedupIntro: "Наявні назви сесій, дублювання яких слід уникати:",
  responseFormat: "Поверніть рівно один рядок:\nTITLE: <title>\nНе додавайте іншого тексту.",
  languageDirective:
    "Важливо: створіть заголовок українською мовою ({language}). Не використовуйте іншу мову.",
});

const FA = makeLocale({
  naturalSystemPrompt:
    "برای یک جلسه کدنویسی هوش مصنوعی عنوان بسازید. فقط یک عنوان در یک خط برگردانید.\n" +
    "TITLE: عنوانی کوتاه و روشن، حداکثر {titleMaxChars} کاراکتر.\n" +
    "عنوان را به یک موجودیت مشخص — فایل، تابع، سرویس، زیرسیستم یا موضوع شاخه — گره بزنید تا جلسات مرتبط متمایز بمانند.\n" +
    "موضوع یا نیت کار را خلاصه کنید؛ درخواست کاربر را تکرار یا بازنویسی نکنید.\n" +
    "بدون نقل‌قول، مارک‌داون یا نشانه‌گذاری پایانی؛ فقط عنوان را خروجی دهید.",
  slugSystemPrompt:
    "برای این جلسه عامل کدنویسی عنوان بسازید و فقط یک خط برگردانید.\n" +
    "از متن کوچک و جداشده با خط تیره، حداکثر {titleMaxChars} کاراکتر، استفاده کنید.\n" +
    "عنوان را به یک موجودیت مشخص گره بزنید و عمل را در اولویت قرار دهید.\n" +
    "موضوع یا نیت کار را خلاصه کنید؛ درخواست کاربر را تکرار یا بازنویسی نکنید.\n" +
    "متن ساده، بدون نقل‌قول، مارک‌داون، نشانه‌گذاری پایانی یا متن اضافی.",
  topicProjectSystemPrompt:
    "یک عنوان کوتاه ترمینال را در یک خط، حداکثر {titleMaxChars} کاراکتر، ایجاد کنید.\n" +
    "پسوند پروژهٔ خواسته‌شده را اضافه کنید و کل عنوان را در محدوده نگه دارید.\n" +
    "عنوان را به یک موجودیت مشخص گره بزنید و عمل یا نیت کار را برجسته کنید.\n" +
    "موضوع یا نیت کار را خلاصه کنید؛ درخواست کاربر را تکرار یا بازنویسی نکنید.\n" +
    "فقط عنوان را خروجی دهید.",
  naturalRules: [
    "بر اساس گفتگو برای این جلسه نام بسازید.",
    "دقیقاً یک عنوان در یک خط برگردانید.",
    "عنوانی کوتاه و روشن، حداکثر {titleMaxChars} کاراکتر، بنویسید.",
    "آن را به یک موجودیت مشخص گره بزنید تا جلسات مرتبط متمایز بمانند.",
    "موضوع یا نیت کار را خلاصه کنید؛ درخواست کاربر را تکرار یا بازنویسی نکنید.",
    "عمل و هدف آن را برجسته کنید.",
    "مختصر و مشخص باشید.",
    "بدون نقل‌قول، مارک‌داون یا نشانه‌گذاری پایانی.",
    "اگر مطمئن نیستید، عنوانی عمومی اما مرتبط بنویسید.",
    "فقط با عنوان پاسخ دهید، هیچ چیز دیگری ننویسید.",
  ],
  topicProjectPromptTemplate:
    "برای این گفتگوی Pi یک عنوان ترمینال بسازید.\n" +
    "زبان: {language}.\n" +
    "کل عنوان حداکثر {titleMaxChars} کاراکتر است.\n" +
    "قوانین خروجی:\n" +
    "- دقیقاً یک عنوان را در یک خط خروجی دهید.\n" +
    "- نام پروژه را طبق دستورهای زیر به‌صورت پسوند اضافه کنید.\n" +
    "- از مارک‌داون، فهرست، بلوک کد، نقل‌قول، توضیح یا نشانه‌گذاری پایانی استفاده نکنید.\n" +
    "{projectLines}\n" +
    "زمینه:\n" +
    "{projectLine}" +
    "پوشه کاری: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## زمینه نام‌گذاری\n\n{firstUserMessageLabel}\n{first}\n\nپیام‌های اخیر کاربر:\n{recent}",
  conversationSection: "\n\nگفتگو:\n{conversation}",
  projectLabel: "پروژه:",
  firstUserMessageLabel: "اولین پیام کاربر:",
  firstAssistantMessageLabel: "اولین پیام دستیار:",
  noneLabel: "هیچ",
  projectSuffixLines:
    "- پروژه را دقیقاً به این شکل به‌صورت پسوند اضافه کنید: <موضوع کوتاه>{separator}{projectName}.\n" +
    "- کل عنوان، همراه با پسوند، باید در محدودیت کاراکتر جا بگیرد.",
  dedupIntro: "عنوان‌های جلسه موجود که نباید تکرار شوند:",
  responseFormat: "دقیقاً یک خط برگردانید:\nTITLE: <title>\nمتن دیگری اضافه نکنید.",
  languageDirective: "مهم: عنوان را به فارسی ({language}) بسازید. از زبان دیگری استفاده نکنید.",
});

const AR = makeLocale({
  naturalSystemPrompt:
    "أنشئ عنوانًا لجلسة برمجة بالذكاء الاصطناعي. أعد عنوانًا واحدًا فقط في سطر واحد.\n" +
    "TITLE: عنوان موجز لا يتجاوز {titleMaxChars} حرفًا.\n" +
    "اربط العنوان بكيان محدد — ملف أو دالة أو خدمة أو نظام فرعي أو موضوع فرع — لتمييز الجلسات المرتبطة.\n" +
    "لخّص موضوع العمل أو نيته؛ لا تكرر طلب المستخدم ولا تعِد صياغته.\n" +
    "من دون اقتباسات أو ماركداون أو علامات ترقيم في النهاية؛ أخرج العنوان فقط.",
  slugSystemPrompt:
    "سمِّ جلسة وكيل البرمجة هذه وأعد سطرًا واحدًا فقط.\n" +
    "استخدم نصًا بأحرف صغيرة مفصولًا بشرطات، بحد أقصى {titleMaxChars} حرفًا.\n" +
    "اربط العنوان بكيان محدد وفضّل الفعل.\n" +
    "لخّص موضوع العمل أو نيته؛ لا تكرر طلب المستخدم ولا تعِد صياغته.\n" +
    "استخدم نصًا عاديًا بلا اقتباسات أو ماركداون أو علامات ترقيم نهائية أو نص إضافي.",
  topicProjectSystemPrompt:
    "أنشئ عنوانًا واحدًا موجزًا للطرفية في سطر واحد، بحد أقصى {titleMaxChars} حرفًا.\n" +
    "أدرج لاحقة المشروع المطلوبة واجعل العنوان كاملًا ضمن الحد.\n" +
    "اربط العنوان بكيان محدد وأبرز فعل العمل أو نيته.\n" +
    "لخّص موضوع العمل أو نيته؛ لا تكرر طلب المستخدم ولا تعِد صياغته.\n" +
    "أخرج العنوان فقط.",
  naturalRules: [
    "سمِّ هذه الجلسة بناءً على المحادثة.",
    "أعد عنوانًا واحدًا بالضبط في سطر واحد.",
    "استخدم عنوانًا موجزًا لا يتجاوز {titleMaxChars} حرفًا.",
    "اربطه بكيان محدد لتمييز الجلسات المرتبطة.",
    "لخّص موضوع العمل أو نيته؛ لا تكرر طلب المستخدم ولا تعِد صياغته.",
    "أبرز الفعل وهدفه.",
    "كن موجزًا ومحددًا.",
    "من دون اقتباسات أو ماركداون أو علامات ترقيم في النهاية.",
    "إذا لم تكن متأكدًا، استخدم عنوانًا عامًا لكنه مرتبط.",
    "أجب بالعنوان فقط، ولا شيء آخر.",
  ],
  topicProjectPromptTemplate:
    "ولّد عنوانًا واحدًا لعلامة تبويب الطرفية لهذه المحادثة في Pi.\n" +
    "اللغة: {language}.\n" +
    "العنوان كاملًا لا يتجاوز {titleMaxChars} حرفًا.\n" +
    "قواعد الإخراج:\n" +
    "- أخرج عنوانًا واحدًا بالضبط في سطر واحد.\n" +
    "- أدرج اسم المشروع كلّاحقة وفق التعليمات أدناه.\n" +
    "- لا تستخدم ماركداون أو نقاطًا أو كتل أكواد أو اقتباسات أو شرحًا أو علامات ترقيم في النهاية.\n" +
    "{projectLines}\n" +
    "السياق:\n" +
    "{projectLine}" +
    "دليل العمل: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## سياق التسمية\n\n{firstUserMessageLabel}\n{first}\n\nرسائل المستخدم الأخيرة:\n{recent}",
  conversationSection: "\n\nالمحادثة:\n{conversation}",
  projectLabel: "المشروع:",
  firstUserMessageLabel: "أول رسالة من المستخدم:",
  firstAssistantMessageLabel: "أول رسالة من المساعد:",
  noneLabel: "لا شيء",
  projectSuffixLines:
    "- أدرج المشروع كلّاحقة بهذا الشكل الدقيق: <موضوع قصير>{separator}{projectName}.\n" +
    "- يجب أن يلتزم العنوان كاملًا، مع اللاحقة، بحد الأحرف.",
  dedupIntro: "عناوين الجلسات الحالية التي يجب تجنب تكرارها:",
  responseFormat: "أعد سطرًا واحدًا بالضبط:\nTITLE: <title>\nلا تضف نصًا آخر.",
  languageDirective: "مهم: أنشئ العنوان باللغة العربية ({language}). لا تستخدم لغة أخرى.",
});

const HI = makeLocale({
  naturalSystemPrompt:
    "AI कोडिंग सत्र के लिए एक शीर्षक बनाएँ। केवल एक पंक्ति में एक शीर्षक लौटाएँ।\n" +
    "TITLE: {titleMaxChars} वर्णों तक का संक्षिप्त शीर्षक।\n" +
    "शीर्षक को किसी विशिष्ट इकाई — फ़ाइल, फ़ंक्शन, सेवा, सबसिस्टम या शाखा विषय — से जोड़ें ताकि संबंधित सत्र अलग दिखें।\n" +
    "काम के विषय या आशय का सार दें; उपयोगकर्ता के अनुरोध को दोहराएँ या अपने शब्दों में न लिखें।\n" +
    "उद्धरण, मार्कडाउन या अंत में विराम चिह्न न दें; केवल शीर्षक आउटपुट करें।",
  slugSystemPrompt:
    "इस कोडिंग एजेंट सत्र को शीर्षक दें और केवल एक पंक्ति लौटाएँ।\n" +
    "{titleMaxChars} वर्णों तक छोटे अक्षरों में हाइफ़न से अलग किया गया पाठ उपयोग करें।\n" +
    "शीर्षक को विशिष्ट इकाई से जोड़ें और क्रिया को प्राथमिकता दें।\n" +
    "काम के विषय या आशय का सार दें; उपयोगकर्ता के अनुरोध को दोहराएँ या अपने शब्दों में न लिखें।\n" +
    "उद्धरण, मार्कडाउन, अंत का विराम चिह्न या अतिरिक्त पाठ न दें।",
  topicProjectSystemPrompt:
    "एक पंक्ति में {titleMaxChars} वर्णों तक का एक संक्षिप्त टर्मिनल शीर्षक बनाएँ।\n" +
    "माँगा गया प्रोजेक्ट प्रत्यय शामिल करें और पूरा शीर्षक सीमा के भीतर रखें।\n" +
    "शीर्षक को विशिष्ट इकाई से जोड़ें और काम की क्रिया या आशय को सामने रखें।\n" +
    "काम के विषय या आशय का सार दें; उपयोगकर्ता के अनुरोध को दोहराएँ या अपने शब्दों में न लिखें।\n" +
    "केवल शीर्षक आउटपुट करें।",
  naturalRules: [
    "बातचीत के आधार पर इस सत्र का नाम रखें।",
    "एक पंक्ति में केवल एक शीर्षक लौटाएँ।",
    "{titleMaxChars} वर्णों तक का संक्षिप्त शीर्षक लिखें।",
    "संबंधित सत्रों से अलग रखने के लिए इसे विशिष्ट इकाई से जोड़ें।",
    "काम के विषय या आशय का सार दें; उपयोगकर्ता के अनुरोध को दोहराएँ या अपने शब्दों में न लिखें।",
    "क्रिया और उसके लक्ष्य को सामने रखें।",
    "संक्षिप्त और विशिष्ट रहें।",
    "उद्धरण, मार्कडाउन या अंत का विराम चिह्न न दें।",
    "अनिश्चित होने पर सामान्य लेकिन प्रासंगिक शीर्षक दें।",
    "केवल शीर्षक से उत्तर दें, और कुछ नहीं।",
  ],
  topicProjectPromptTemplate:
    "इस Pi बातचीत के लिए एक टर्मिनल शीर्षक बनाएँ।\n" +
    "भाषा: {language}।\n" +
    "पूरा शीर्षक अधिकतम {titleMaxChars} वर्णों का है।\n" +
    "आउटपुट नियम:\n" +
    "- एक ही पंक्ति में ठीक एक शीर्षक आउटपुट करें।\n" +
    "- नीचे दिए निर्देशों के अनुसार प्रोजेक्ट नाम को प्रत्यय के रूप में शामिल करें।\n" +
    "- मार्कडाउन, बुलेट, कोड ब्लॉक, उद्धरण, व्याख्या या अंत का विराम चिह्न न दें।\n" +
    "{projectLines}\n" +
    "संदर्भ:\n" +
    "{projectLine}" +
    "कार्य निर्देशिका: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## नामकरण संदर्भ\n\n{firstUserMessageLabel}\n{first}\n\nहाल के उपयोगकर्ता संदेश:\n{recent}",
  conversationSection: "\n\nबातचीत:\n{conversation}",
  projectLabel: "प्रोजेक्ट:",
  firstUserMessageLabel: "पहला उपयोगकर्ता संदेश:",
  firstAssistantMessageLabel: "पहला सहायक संदेश:",
  noneLabel: "कोई नहीं",
  projectSuffixLines:
    "- प्रोजेक्ट को इस सटीक रूप में प्रत्यय बनाएँ: <छोटा विषय>{separator}{projectName}।\n" +
    "- प्रत्यय सहित पूरा शीर्षक वर्ण सीमा में होना चाहिए।",
  dedupIntro: "दोहराव से बचने के लिए मौजूदा सत्र शीर्षक:",
  responseFormat: "ठीक एक पंक्ति लौटाएँ:\nTITLE: <title>\nकोई अन्य पाठ न जोड़ें।",
  languageDirective: "महत्वपूर्ण: शीर्षक हिंदी ({language}) में बनाएँ। कोई अन्य भाषा न प्रयोग करें।",
});

const IT = makeLocale({
  naturalSystemPrompt:
    "Crea un titolo per una sessione di programmazione IA. Restituisci solo un titolo su una riga.\n" +
    "TITLE: un titolo conciso in Title Case, fino a {titleMaxChars} caratteri.\n" +
    "Ancora il titolo a un'entità specifica — file, funzione, servizio, sottosistema o questione di ramo — per distinguere le sessioni correlate.\n" +
    "Riassumi l'argomento o l'intento del lavoro; non ripetere né parafrasare la richiesta dell'utente.\n" +
    "Niente virgolette, markdown o punteggiatura finale; produci solo il titolo.",
  slugSystemPrompt:
    "Assegna un titolo a questa sessione di agente di codifica e restituisci solo una riga.\n" +
    "Usa testo minuscolo separato da trattini, fino a {titleMaxChars} caratteri.\n" +
    "Ancora il titolo a un'entità specifica e preferisci un'azione.\n" +
    "Riassumi l'argomento o l'intento del lavoro; non ripetere né parafrasare la richiesta dell'utente.\n" +
    "Usa testo semplice, senza virgolette, markdown, punteggiatura finale o testo extra.",
  topicProjectSystemPrompt:
    "Genera un solo titolo conciso del terminale su una riga, fino a {titleMaxChars} caratteri.\n" +
    "Includi il suffisso del progetto richiesto e fai rientrare l'intero titolo nel limite.\n" +
    "Ancora il titolo a un'entità specifica e metti in evidenza l'azione o l'intento del lavoro.\n" +
    "Riassumi l'argomento o l'intento del lavoro; non ripetere né parafrasare la richiesta dell'utente.\n" +
    "Produci solo il titolo.",
  naturalRules: [
    "Nomina questa sessione in base alla conversazione.",
    "Restituisci esattamente un titolo su una riga.",
    "Usa un titolo conciso in Title Case fino a {titleMaxChars} caratteri.",
    "Ancoralo a un'entità specifica per distinguere le sessioni correlate.",
    "Riassumi l'argomento o l'intento del lavoro; non ripetere né parafrasare la richiesta dell'utente.",
    "Metti in evidenza l'azione e il suo obiettivo.",
    "Sii conciso e specifico.",
    "Niente virgolette, markdown o punteggiatura finale.",
    "Se non sei sicuro, usa un titolo generico ma pertinente.",
    "Rispondi solo con il titolo, nient'altro.",
  ],
  topicProjectPromptTemplate:
    "Genera un titolo di scheda del terminale per questa conversazione Pi.\n" +
    "Lingua: {language}.\n" +
    "Il titolo completo può contenere al massimo {titleMaxChars} caratteri.\n" +
    "Regole di output:\n" +
    "- Produci esattamente un titolo su una sola riga.\n" +
    "- Includi il nome del progetto come suffisso secondo le istruzioni seguenti.\n" +
    "- Non usare Markdown, elenchi, blocchi di codice, virgolette, spiegazioni o punteggiatura finale.\n" +
    "{projectLines}\n" +
    "Contesto:\n" +
    "{projectLine}" +
    "Directory di lavoro: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Contesto di denominazione\n\n{firstUserMessageLabel}\n{first}\n\nMessaggi recenti dell'utente:\n{recent}",
  conversationSection: "\n\nConversazione:\n{conversation}",
  projectLabel: "Progetto:",
  firstUserMessageLabel: "Primo messaggio dell'utente:",
  firstAssistantMessageLabel: "Primo messaggio dell'assistente:",
  noneLabel: "nessuno",
  projectSuffixLines:
    "- Includi il progetto come suffisso in questa forma esatta: <argomento breve>{separator}{projectName}.\n" +
    "- Il titolo completo, suffisso incluso, deve rispettare il limite di caratteri.",
  dedupIntro: "Titoli di sessione esistenti da evitare di duplicare:",
  responseFormat: "Restituisci esattamente una riga:\nTITLE: <title>\nNon aggiungere altro testo.",
  languageDirective:
    "Importante: genera il titolo in italiano ({language}). Non usare altre lingue.",
});

const NL = makeLocale({
  naturalSystemPrompt:
    "Maak een titel voor een AI-codeersessie. Geef alleen één titel op één regel terug.\n" +
    "TITLE: een beknopte titel in Title Case, maximaal {titleMaxChars} tekens.\n" +
    "Veranker de titel aan een specifieke entiteit — bestand, functie, service, subsysteem of branch-kwestie — zodat gerelateerde sessies herkenbaar blijven.\n" +
    "Vat het onderwerp of de bedoeling van het werk samen; herhaal of parafraseer het verzoek van de gebruiker niet.\n" +
    "Geen aanhalingstekens, markdown of leestekens aan het einde; geef alleen de titel.",
  slugSystemPrompt:
    "Geef deze codeeragentsessie een titel en geef slechts één regel terug.\n" +
    "Gebruik kleine letters met koppeltekens, maximaal {titleMaxChars} tekens.\n" +
    "Veranker de titel aan een specifieke entiteit en geef de voorkeur aan een actie.\n" +
    "Vat het onderwerp of de bedoeling van het werk samen; herhaal of parafraseer het verzoek van de gebruiker niet.\n" +
    "Gebruik gewone tekst zonder aanhalingstekens, markdown, leestekens aan het einde of extra tekst.",
  topicProjectSystemPrompt:
    "Genereer één beknopte terminaltitel op één regel, maximaal {titleMaxChars} tekens.\n" +
    "Neem het gevraagde projectsuffix op en laat de volledige titel binnen de limiet vallen.\n" +
    "Veranker de titel aan een specifieke entiteit en benadruk de actie of bedoeling van het werk.\n" +
    "Vat het onderwerp of de bedoeling van het werk samen; herhaal of parafraseer het verzoek van de gebruiker niet.\n" +
    "Geef alleen de titel terug.",
  naturalRules: [
    "Geef deze sessie een naam op basis van het gesprek.",
    "Geef exact één titel op één regel terug.",
    "Gebruik een beknopte titel in Title Case van maximaal {titleMaxChars} tekens.",
    "Veranker deze aan een specifieke entiteit om gerelateerde sessies te onderscheiden.",
    "Vat het onderwerp of de bedoeling van het werk samen; herhaal of parafraseer het verzoek van de gebruiker niet.",
    "Zet de actie en het doel voorop.",
    "Wees beknopt en specifiek.",
    "Geen aanhalingstekens, markdown of leestekens aan het einde.",
    "Gebruik bij twijfel een generieke maar relevante titel.",
    "Antwoord alleen met de titel, niets anders.",
  ],
  topicProjectPromptTemplate:
    "Genereer een terminaltitel voor dit Pi-gesprek.\n" +
    "Taal: {language}.\n" +
    "De volledige titel is maximaal {titleMaxChars} tekens.\n" +
    "Uitvoerregels:\n" +
    "- Geef precies één titel op één regel uit.\n" +
    "- Neem de projectnaam als suffix op volgens de onderstaande instructies.\n" +
    "- Gebruik geen Markdown, opsommingstekens, codeblokken, aanhalingstekens, uitleg of leestekens aan het einde.\n" +
    "{projectLines}\n" +
    "Context:\n" +
    "{projectLine}" +
    "Werkmap: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## Naamgevingscontext\n\n{firstUserMessageLabel}\n{first}\n\nRecente gebruikersberichten:\n{recent}",
  conversationSection: "\n\nGesprek:\n{conversation}",
  projectLabel: "Project:",
  firstUserMessageLabel: "Eerste gebruikersbericht:",
  firstAssistantMessageLabel: "Eerste assistentenbericht:",
  noneLabel: "geen",
  projectSuffixLines:
    "- Neem het project als suffix op in deze exacte vorm: <kort onderwerp>{separator}{projectName}.\n" +
    "- De volledige titel inclusief suffix moet binnen de tekenlimiet passen.",
  dedupIntro: "Bestaande sessietitels om duplicatie te vermijden:",
  responseFormat: "Geef exact één regel terug:\nTITLE: <title>\nVoeg geen andere tekst toe.",
  languageDirective:
    "Belangrijk: genereer de titel in het Nederlands ({language}). Gebruik geen andere taal.",
});

const TH = makeLocale({
  naturalSystemPrompt:
    "สร้างชื่อสำหรับเซสชันเขียนโค้ด AI โปรดส่งคืนชื่อเพียงหนึ่งบรรทัด\n" +
    "TITLE: ชื่อสั้นกระชับ ไม่เกิน {titleMaxChars} ตัวอักษร\n" +
    "ยึดชื่อกับเอนทิตีเฉพาะ เช่น ไฟล์ ฟังก์ชัน บริการ ซับซิสเต็ม หรือเรื่องของสาขา เพื่อแยกเซสชันที่เกี่ยวข้องกัน\n" +
    "สรุปหัวข้อหรือเจตนาของงาน อย่ากล่าวซ้ำหรือถอดความคำขอของผู้ใช้\n" +
    "ไม่ใช้เครื่องหมายคำพูด มาร์กดาวน์ หรือเครื่องหมายวรรคตอนท้าย และแสดงเฉพาะชื่อ",
  slugSystemPrompt:
    "ตั้งชื่อเซสชันของเอเจนต์การเขียนโค้ดนี้และส่งคืนเพียงหนึ่งบรรทัด\n" +
    "ใช้ข้อความตัวพิมพ์เล็กคั่นด้วยยัติภังค์ ไม่เกิน {titleMaxChars} ตัวอักษร\n" +
    "ยึดชื่อกับเอนทิตีเฉพาะและเน้นการกระทำ\n" +
    "สรุปหัวข้อหรือเจตนาของงาน อย่ากล่าวซ้ำหรือถอดความคำขอของผู้ใช้\n" +
    "ใช้ข้อความธรรมดา ไม่ใส่เครื่องหมายคำพูด มาร์กดาวน์ เครื่องหมายวรรคตอนท้าย หรือข้อความเพิ่มเติม",
  topicProjectSystemPrompt:
    "สร้างชื่อเทอร์มินัลสั้นกระชับเพียงหนึ่งบรรทัด ไม่เกิน {titleMaxChars} ตัวอักษร\n" +
    "ใส่คำต่อท้ายโปรเจกต์ตามที่กำหนด และทำให้ชื่อทั้งหมดอยู่ภายในขีดจำกัด\n" +
    "ยึดชื่อกับเอนทิตีเฉพาะและเน้นการกระทำหรือเจตนาของงาน\n" +
    "สรุปหัวข้อหรือเจตนาของงาน อย่ากล่าวซ้ำหรือถอดความคำขอของผู้ใช้\n" +
    "แสดงผลเฉพาะชื่อ",
  naturalRules: [
    "ตั้งชื่อเซสชันตามบทสนทนา",
    "ส่งคืนชื่อเพียงหนึ่งบรรทัด",
    "ใช้ชื่อสั้นกระชับ ไม่เกิน {titleMaxChars} ตัวอักษร",
    "ยึดชื่อกับเอนทิตีเฉพาะเพื่อแยกเซสชันที่เกี่ยวข้อง",
    "สรุปหัวข้อหรือเจตนาของงาน อย่ากล่าวซ้ำหรือถอดความคำขอของผู้ใช้",
    "เน้นการกระทำและเป้าหมาย",
    "กระชับและเฉพาะเจาะจง",
    "ไม่ใช้เครื่องหมายคำพูด มาร์กดาวน์ หรือเครื่องหมายวรรคตอนท้าย",
    "หากไม่แน่ใจ ให้ใช้ชื่อทั่วไปแต่เกี่ยวข้อง",
    "ตอบด้วยชื่อเท่านั้น ไม่ต้องมีอย่างอื่น",
  ],
  topicProjectPromptTemplate:
    "สร้างชื่อแท็บเทอร์มินัลหนึ่งชื่อสำหรับบทสนทนา Pi นี้\n" +
    "ภาษา: {language}\n" +
    "ชื่อทั้งหมดมีความยาวไม่เกิน {titleMaxChars} ตัวอักษร\n" +
    "กฎผลลัพธ์:\n" +
    "- แสดงชื่อเพียงหนึ่งบรรทัด\n" +
    "- ใส่ชื่อโปรเจกต์เป็นคำต่อท้ายตามคำแนะนำด้านล่าง\n" +
    "- ห้ามใช้มาร์กดาวน์ หัวข้อย่อย บล็อกโค้ด เครื่องหมายคำพูด คำอธิบาย หรือเครื่องหมายวรรคตอนท้าย\n" +
    "{projectLines}\n" +
    "บริบท:\n" +
    "{projectLine}" +
    "ไดเรกทอรีทำงาน: {cwd}\n" +
    "{firstUserBlock}" +
    "{firstAssistantBlock}" +
    "{conversationBlock}",
  namingContextTemplate:
    "## บริบทการตั้งชื่อ\n\n{firstUserMessageLabel}\n{first}\n\nข้อความผู้ใช้ล่าสุด:\n{recent}",
  conversationSection: "\n\nบทสนทนา:\n{conversation}",
  projectLabel: "โปรเจกต์:",
  firstUserMessageLabel: "ข้อความผู้ใช้แรก:",
  firstAssistantMessageLabel: "ข้อความผู้ช่วยแรก:",
  noneLabel: "ไม่มี",
  projectSuffixLines:
    "- รวมชื่อโปรเจกต์เป็นคำต่อท้ายในรูปแบบนี้: <หัวข้อสั้น>{separator}{projectName}\n" +
    "- ชื่อทั้งหมดรวมคำต่อท้ายต้องอยู่ภายในขีดจำกัดตัวอักษร",
  dedupIntro: "ชื่อเซสชันที่มีอยู่เพื่อหลีกเลี่ยงการซ้ำ:",
  responseFormat: "ส่งคืนเพียงหนึ่งบรรทัด:\nTITLE: <title>\nห้ามเพิ่มข้อความอื่น",
  languageDirective: "สำคัญ: สร้างชื่อเป็นภาษาไทย ({language}) ห้ามใช้ภาษาอื่น",
});

export const LOCALE_STRINGS: Record<string, LocaleStrings> = {
  en: EN,
  zh: ZH,
  "zh-hant": ZH_HANT,
  ja: JA,
  ko: KO,
  "pt-br": PT_BR,
  es: ES,
  de: DE,
  fr: FR,
  id: ID,
  vi: VI,
  tr: TR,
  pl: PL,
  uk: UK,
  fa: FA,
  ar: AR,
  hi: HI,
  it: IT,
  nl: NL,
  th: TH,
};

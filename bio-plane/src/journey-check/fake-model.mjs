/* journey-check R11: the fake model the local arm's runner (runner.mjs) speaks for, pure: no I/O, no clock. One
   conversation is a generator: it yields each tool call `{name, input}` it makes, receives that call's `tool_result`
   (`{id, content, is_error?}`), and returns its closing text. It answers as a careful model would within the contract it
   is handed, never by knowing the walk:
   - it reads first: each result the transcript holds back (`read_result`, agent-model R12) and the facts
     (`read_facts`), and, in a search sub-session, one search of its own;
   - it answers by calling the tool the conversation names as its answer ("Answer by calling …", agent-model's row and
     sub-session prompts), or, when none is named, the one tool of `ANSWERS` it is offered;
   - its answer fills that tool's `input_schema` from what it read: addresses it read are its citations, a passage it
     read is its quote, the question it was asked is its subject (`fill`).
   The run modes' judgements are `judge_<step>` (agent-model `judgeTools`, `planJudgeTools`), the sub-session's is
   `report`, the ask's `answer` (agent-worker R54, R89) after `done_reading`, the drafts' `draft`, the transcriber's
   its own tool. */

/* The answer tools a conversation may offer without naming one, in the order they are preferred. */
export const ANSWERS = Object.freeze(["answer", "report", "draft", "done_reading"]);

const text = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((b) => (b && typeof b === "object" ? (b.text ?? JSON.stringify(b)) : String(b ?? ""))).join("\n");
  return JSON.stringify(content ?? null);
};
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };

/* The answer tool a conversation names, or the one it offers. */
export function answerTool({ system = "", prompt = "", tools = [] }) {
  const names = tools.map((t) => t.name);
  for (const s of [prompt, system]) {
    const m = /Answer by calling (?:the )?`?([A-Za-z_][\w]*)`?/.exec(String(s));
    if (m && names.includes(m[1])) return m[1];
  }
  if (/then call report once/.test(system) && names.includes("report")) return "report";
  return ANSWERS.find((n) => names.includes(n)) || names.find((n) => /^judge_/.test(n)) || names[names.length - 1] || null;
}

/* What the conversation has read: every value under keys that name an address, every string long enough to be a
   passage, and the record ids it saw. */
export function gather(values) {
  const seen = { addresses: new Set(), passages: [], ids: new Set(), objects: [] };
  const visit = (v, key, depth) => {
    if (depth > 40 || v === null || v === undefined) return;
    if (typeof v === "string") {
      if (/^(?:address|url|source|href|capture_address)$/i.test(key || "") || /^https?:\/\//.test(v)) seen.addresses.add(v);
      if (/^[A-Z]{2,6}-\d{4}-[a-z0-9]+$/i.test(v)) seen.ids.add(v);
      if (v.length >= 40 && /\s/.test(v)) seen.passages.push(v);
      return;
    }
    if (Array.isArray(v)) { for (const x of v) visit(x, key, depth + 1); return; }
    if (typeof v === "object") { seen.objects.push(v); for (const [k, x] of Object.entries(v)) visit(x, k, depth + 1); }
  };
  for (const v of values) visit(v, "", 0);
  return seen;
}

/* A value for `schema` from what was read: the first enum value that does not say nothing was found, the read
   addresses as citations, a read passage as words, and each required property of an object. */
export function fill(schema, read, name = "") {
  const s = schema && typeof schema === "object" ? schema : {};
  if (Array.isArray(s.enum) && s.enum.length) {
    const prefer = s.enum.find((e) => /^(?:found|present|supports|held|answered|yes|ok)$/i.test(String(e)));
    return prefer ?? s.enum[0];
  }
  const type = Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type;
  if (type === "object" || (!type && s.properties)) {
    const out = {};
    const props = s.properties || {};
    for (const k of Object.keys(props)) {
      const required = (s.required || []).includes(k);
      const v = fill(props[k], read, k);
      if (required || (v !== undefined && !(Array.isArray(v) && !v.length) && v !== "")) out[k] = v;
    }
    return out;
  }
  if (type === "array") {
    if (/citation|source|address/i.test(name)) {
      const items = [...read.addresses].slice(0, Math.max(1, Math.min(s.maxItems || 3, 3)));
      return items.map((a) => (s.items && (s.items.type === "object" || s.items.properties) ? { ...fill(s.items, read), address: a } : a));
    }
    const n = s.minItems || 0;
    return Array.from({ length: n }, () => fill(s.items, read, name));
  }
  if (type === "boolean") return false;
  if (type === "integer" || type === "number") return s.minimum ?? 1;
  if (type === "string" || !type) {
    if (/address|url/i.test(name) && read.addresses.size) return [...read.addresses][0];
    if (/quote|passage|exact/i.test(name) && read.passages.length) return read.passages[0].slice(0, 200);
    const words = read.passages.length ? `The document read says: ${read.passages[0].slice(0, 160)}`
      : "What the record holds was read; nothing in it settles this yet.";
    return s.maxLength ? words.slice(0, s.maxLength) : words;
  }
  return undefined;
}

/* One conversation, as the runner drives it. */
export function* conversation({ system = "", prompt = "", tools = [], max_turns = 1 }) {
  const names = tools.map((t) => t.name);
  const final = answerTool({ system, prompt, tools });
  const results = [];
  let turns = 0;
  const room = () => turns < max_turns - 2;
  /* the results the transcript holds back, each read by its id */
  if (names.includes("read_result"))
    for (const m of String(prompt).matchAll(/read it with read_result \{"id": ("[^"]*")\}/g)) {
      if (!room()) break;
      turns += 1;
      const r = yield { name: "read_result", input: { id: JSON.parse(m[1]) } };
      results.push(parse(text(r && r.content)) ?? text(r && r.content));
    }
  if (names.includes("read_facts") && room()) {
    turns += 1;
    const r = yield { name: "read_facts", input: {} };
    results.push(parse(text(r && r.content)) ?? text(r && r.content));
  }
  /* a search sub-session searches once before it reports */
  if (final === "report" && names.includes("meaningrows") && room()) {
    turns += 1;
    const r = yield { name: "meaningrows", input: { rows: "leg", limit: 10 } };
    results.push(parse(text(r && r.content)) ?? text(r && r.content));
  }
  /* the ask reads before it answers: done_reading closes its reading */
  if (!final) return "There is nothing to answer with.";
  const schema = (tools.find((t) => t.name === final) || {}).input_schema || {};
  yield { name: final, input: fill(schema, gather(results)) };
  return "Answered.";
}

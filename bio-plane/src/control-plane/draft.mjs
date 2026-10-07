/* control-plane R57 (T35; N686, K1837, K1841; agent-worker R59, ai-runs R48, wizard-scripts R25, credentials R27, R35): THE
   ASSISTANT'S DRAFT, asked of agent-worker's `POST /draft` once every refusal has been answered. The Worker door forwards
   `groupdescriptiondraft` and `writinghelp` to the store as any op (the store's door resolves the assistant per act and
   answers `ASSISTANT_OFF` and the ceilings, store-door R10; the owner answers its own refusals); when the owner answers
   past them all (`ASSISTANT_DRAFT_UNAVAILABLE`), the door asks the object this function runs on, because the account's
   key is unsealed there alone (`credentials.accountFor`), as for the ask (`plane/ask.mjs`). `plane` wires it as the
   object's `draft(args)`.

   What it sends is agent-worker R59's body: `task`, `told`, `account` in R6's wire shape (never anything else of the
   key's holder), `firsthand` as the field states it, `grant` (credentials R27, minted under the member's own session)
   only when the serving account's `suggestions` switch is on and the field is not firsthand, and otherwise `pack`, the
   rendered pack the door holds (R41; K1983). What it answers: the draft checked by `wizard-scripts.checkDraft` against
   the grant's read log (none when no grant was sent), in its owner's shape, labelled machine work; and, whatever the check
   answers, the conversation's `usage` and `calls` counted to the member's day as a draft (`ai-runs` R48, `mode: "draft"`).
   It writes nothing of the record, keeps nothing of the key, and an ending agent-worker names is relayed as given. */
import { credentialsOf } from "../credentials/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { answersOf } from "../answers/index.mjs";
import { checkDraft } from "../wizard-scripts/index.mjs";

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const idOf = (m) => (typeof m === "string" && m.startsWith("member:") ? m.slice(7) : m);
/* `instance-setup` R65's and `membership` R109's limits on the two fields of the group's description. */
const FIELD_MAX = Object.freeze({ focus: 1000, purpose: 4000 });

/** The ops whose draft is asked here, and the shape each answers (`instance-setup` R65, `wizard-scripts` R27). */
export const DRAFT_OPS = Object.freeze(["groupdescriptiondraft", "writinghelp"]);

/** Whether a store answer is the owner's "past every refusal" (`ASSISTANT_DRAFT_UNAVAILABLE`), so the door asks for the
 *  draft. The owner's answer sits under `result` (the store's envelope). */
export function draftDue(op, body) {
  const r = body && typeof body === "object" ? body.result : null;
  return DRAFT_OPS.includes(op) && !!r && r.ok === false && (r.reason === "ASSISTANT_DRAFT_UNAVAILABLE" || r.code === "ASSISTANT_DRAFT_UNAVAILABLE");
}

/* The strings a grant's reads answered, the read log `checkDraft` holds a sentence against (answers' `ReadLog` indexes every
   string value of every answer it recorded). */
function readTexts(answers, grant) {
  if (!grant) return [];
  try { const log = answers.readLog(grant); return log && log.index instanceof Map ? [...log.index.keys()] : []; }
  catch { return []; }
}

/** On the object: `{op, member, session, told, act, field, firsthand, pack}`, the door's, never the caller's (`member` the
 *  session's member, `session` its token, `told` the request's `answers` or `told`, `act`/`field` the field helped,
 *  `firsthand` as the owner stated it). Answers a Response. */
export async function draftOnObject(ctx, env, { op = null, member = null, session = null, told = null, act = null, field = null,
                                               firsthand = false, pack = null } = {}) {
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return json({ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "your group's Civicsmith has no assistant bound to it. Nothing was drafted." }, 503);
  if (!DRAFT_OPS.includes(op)) return json({ ok: false, reason: "BAD_TASK", detail: "no such draft. Nothing was drafted." }, 400);
  const who = typeof member === "string" && member ? `member:${idOf(member)}` : null;
  const c = credentialsOf(ctx);
  /* the account that serves this member's act (credentials R35), unsealed for this one call */
  let ref = await c.accountFor({ member: who, act: { kind: "ask", member: who } });
  if (!ref || ref.ok !== true) return json(ref || { ok: false, reason: "NO_ACCOUNT" }, 409);
  /* that account's suggestions switch: the member's own reference's (credentials R25), else the group key's (its R37) */
  let suggestions = false;
  try {
    suggestions = ref.level === "member"
      ? c.accountReferenceState({ member: who, viewer: who })?.suggestions === true
      : c.groupKeySwitches()?.suggestions === true;
  } catch { suggestions = false; }
  const first = op === "writinghelp" && firsthand === true;
  /* DEC-153 (2), K1841 (2): the draft may read what the group holds only with the switch on and never in a firsthand field */
  let grant = null;
  if (suggestions && !first) {
    const g = await c.aiGrantMint({ member: who, by: who, session });
    if (!g || g.ok !== true) { ref = null; return json(g || { ok: false, reason: "NO_ACCOUNT" }, 403); }
    grant = g.token;
  }
  const task = op === "writinghelp" ? { op, act, field } : { op };
  const out = JSON.stringify({ task, told, account: { kind: ref.kind, level: ref.level, secret: ref.key, member: who, suggestions },
                               firsthand: first, ...(grant ? { grant } : { pack }) });
  ref = null;
  let res, got = null;
  try {
    res = await w.fetch("https://agent-worker/draft", { method: "POST", headers: { "content-type": "application/json" }, body: out });
    got = await res.json();
  } catch {
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant did not answer. Nothing was drafted and the fields are as they were." }, 502);
  }
  if (!got || typeof got !== "object" || got.ok !== true) {
    if (got && typeof got === "object" && got.ok === false) return json(got, res.status >= 400 ? res.status : 502);
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant did not answer. Nothing was drafted and the fields are as they were." }, 502);
  }
  /* the conversation's use, counted to the member's day as a draft, whatever the check answers (ai-runs R48) */
  try { aiRunsOf(ctx, env).countAskUsage({ member: who, mode: "draft", usage: got.usage ?? null, calls: got.calls }); }
  catch { /* a count that fails never changes what the member is answered */ }
  const answers = answersOf(ctx);
  const read = readTexts(answers, grant);
  const toldTexts = Array.isArray(told) ? told.map((a) => (a && typeof a === "object" ? a.text : a)) : told;
  const check = (text) => checkDraft(typeof text === "string" ? text : "", { told: toldTexts, readLog: read, firsthand: first,
                                                                            suggestions, askedBy: who });
  const draft = got.draft && typeof got.draft === "object" ? got.draft : {};
  const note = "a draft: nothing is saved until you edit it and keep it, and then the words are yours.";
  if (op === "writinghelp") {
    const k = check(draft.text);
    if (!k || k.ok !== true) return json({ ok: false, reason: k?.code ?? "WRITING_HELP_FACT_ADDED", code: k?.code ?? "WRITING_HELP_FACT_ADDED" }, 409);
    return json({ ok: true, result: { ok: true, text: k.text, label: k.label, withheld: k.withheld, note } }, 200);
  }
  const result = { ok: true, withheld: [] };
  for (const f of ["focus", "purpose"]) {
    const k = check(draft[f]);
    if (!k || k.ok !== true) return json({ ok: false, reason: k?.code ?? "WRITING_HELP_FACT_ADDED", code: k?.code ?? "WRITING_HELP_FACT_ADDED" }, 409);
    if ([...k.text].length > FIELD_MAX[f])
      return json({ ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", code: "ASSISTANT_DRAFT_UNAVAILABLE",
                    detail: `the draft's ${f} is over its limit, so nothing was drafted and the fields are as they were.` }, 409);
    result[f] = { text: k.text, label: k.label };
    result.withheld.push(...(k.withheld || []).map((x) => ({ field: f, ...x })));
  }
  result.note = "a draft: nothing is saved until you edit it and keep it, and then the words are your group's.";
  return json({ ok: true, result }, 200);
}

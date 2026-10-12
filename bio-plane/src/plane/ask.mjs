/* plane (B2, K1674, K1684; control-plane R53; agent-worker R6, R54, R56; credentials R25, R27, R35; K1755, K1798, K1806):
   `op=ask`'s handler. A member's own session (or a grant control-plane admitted, handed as `grantMember`) asks; on the
   `bio` object, where credentials live, the account that serves the member's ask and its limit are judged by
   `answers.askAccount` (R33; K2500: `credentials.accountFor`'s cascade, then `ai-use.useCheck`; no ceiling of the
   plane's own), the member's short-lived read-only grant is minted at that act, the account is unsealed for this one
   ask, the switch that governs it read, and the question goes to agent-worker's `/ask` with the grant and the account
   in agent-worker R6's shape. agent-worker's answer (its NDJSON stream, or its plain refusal) is handed back unchanged.
   The secret leaves the object only in that one call and is kept nowhere; every refusal is its owner's, in its words. */
import { credentialsOf, AI_GRANT_TTL_SECONDS } from "../credentials/index.mjs";
import { instanceSetupOf } from "../setup.mjs";
import { answersOf } from "../answers/index.mjs";
import { aiRunsOf } from "../ai-runs/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { deployedModesFor, draftKindDeployed, draftMayRead, partDeployableOn, CIVICSMITH_TEST_SET, AI_RUN_OPEN_CHECKS,
         ASK_MODE, DRAFT_MODE } from "../run-rules/index.mjs";

const json = (body, status) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const idOf = (m) => (typeof m === "string" && m.startsWith("member:") ? m.slice(7) : m);

/* F1 (K1874; admission R20): the session or grant the caller presented, read where admission read it: the
   `Authorization` header when it is exactly `Bearer <value>`, else the JSON body's `token`, else, for T35's release
   only, the query's `token`. Never anything else of the request. */
const BEARER = /^bearer ([\x21-\x7e]+)$/i;
function presentedToken(req, url, body) {
  const m = BEARER.exec(req.headers.get("authorization") || "");
  if (m) return m[1];
  if (body && typeof body === "object" && !Array.isArray(body) && typeof body.token === "string" && body.token !== "")
    return body.token;
  return url.searchParams.get("token");
}

/** The door's arm (in the Worker): admits only a member's own session or a presented grant's member, reads the body,
 *  and asks the `bio` object, which answers through `askOnObject`. */
export async function askOp({ req, url, env, viaSession, sessMember, grantMember }) {
  const member = viaSession && sessMember ? `member:${idOf(sessMember)}` : typeof grantMember === "string" && grantMember ? grantMember : null;
  if (!member)
    return json({ ok: false, reason: "ASK_NOT_A_MEMBER", detail: "an ask is a member's own act, from their own session or "
      + "the grant minted at it. Nothing was asked." }, 403);
  if (req.method !== "POST") return json({ ok: false, reason: "METHOD_NOT_ALLOWED", detail: "an ask is a POST" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ ok: false, reason: "BAD_JSON", detail: "the ask's body is not JSON" }, 400); }
  const named = url.searchParams.get("store");
  /* R33: an ask may name the project it is asked in (answers R30), carried as given; credentials judges it. */
  const project = body && typeof body.project === "string" && body.project !== "" ? body.project : null;
  const args = { member, question: body && body.question, conversation: body && body.conversation,
                 store: named ? named : null, ...(project ? { project } : {}),
                 session: viaSession ? presentedToken(req, url, body) : null,
                 grant: viaSession ? null : presentedToken(req, url, body) };
  return env.STORE.get(env.STORE.idFromName("bio")).ask(args);
}

/** R41 (T45; K2824, K2881; op-declarations R49): the two action drafts whose door the plane builds. */
export const ACTION_DRAFT_OPS = Object.freeze(["infractiondraft", "bearingdraft"]);

/** R41: the door's arm (in the Worker) for `infractiondraft` (`{matter, audience}`) and `bearingdraft` (`{action, reply}`):
 *  a member's own session only (their spec, `ownread`), the body read, the `bio` object asked through its `draft`
 *  (`draftOnObject`, which gates, judges the account, assembles the records from her reads and posts), a conversation
 *  that reached the model counted to the member's day as a draft through the store's `askusage` (ai-runs R48, as
 *  control-plane's draft path counts it), and the draft answered as `{ok: true, result}`, or its refusal at its status.
 *  The grant and the read log are never answered. */
export async function actionDraftOp({ req, url, env, op, viaSession, sessMember, sessViewer }) {
  if (!viaSession || !sessMember)
    return json({ ok: false, reason: "ASK_NOT_A_MEMBER", detail: "a draft is a member's own act, from their own session. "
      + "Nothing was drafted." }, 403);
  if (req.method !== "POST") return json({ ok: false, reason: "METHOD_NOT_ALLOWED", detail: "a draft is a POST" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ ok: false, reason: "BAD_JSON", detail: "the draft's body is not JSON" }, 400); }
  const b = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const args = op === "infractiondraft" ? { matter: b.matter ?? null, audience: b.audience ?? null }
    : { action: b.action ?? null, reply: b.reply ?? null };
  const stub = env.STORE.get(env.STORE.idFromName("bio"));
  let drafted = null, status = 502;
  try {
    const res = await stub.draft({ op, member: sessMember, session: presentedToken(req, url, b), ...args });
    status = res.status;
    drafted = await res.json();
  } catch { drafted = null; }
  if (!drafted || typeof drafted !== "object")
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the draft did not come back. Nothing was kept." }, 502);
  const { grant: _g, read: _r, ...given } = drafted;
  if (given.ok !== true) return json(given, status >= 400 ? status : 502);
  try {
    await stub.fetch(new Request(`http://do/askusage?viewer=${encodeURIComponent(sessViewer ?? "")}`, { method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "draft", usage: given.usage ?? null, calls: given.calls }) }));
  } catch { /* the count is the store's; a failed count leaves the draft as answered */ }
  return json({ ok: true, result: given }, 200);
}

/* R33 (K2500; answers R2 as R30 widens it, store-door R11): the grants this object's draft path minted, each with the
   instant it lapses, so a read made under one is recorded in its read log with `use: "draft"` (`draftUse`, read by the
   `logRead` the composition root hands store-door's frame). Held in memory only, on this storage, for at most a grant's
   life; never a table (R9). */
const DRAFT_GRANTS = new WeakMap();
const DRAFT_GRANTS_MAX = 512;
function draftGrants(ctx) {
  const k = ctx && ctx.storage ? ctx.storage : ctx;
  let m = DRAFT_GRANTS.get(k);
  if (!m) { m = new Map(); DRAFT_GRANTS.set(k, m); }
  return m;
}
function noteDraftGrant(ctx, token) {
  const m = draftGrants(ctx), now = Date.now();
  for (const [t, until] of m) if (until <= now) m.delete(t);
  m.set(token, now + AI_GRANT_TTL_SECONDS * 1000);
  while (m.size > DRAFT_GRANTS_MAX) m.delete(m.keys().next().value);
}
/** R33: the use a read under `grant` is recorded with: `draft` for a grant this object's draft path minted and still
 *  live, else null (the entry's own use, `ask` by default, stands). */
export function draftUse(ctx, grant) {
  if (typeof grant !== "string" || grant === "") return null;
  const until = draftGrants(ctx).get(grant);
  return until !== undefined && until > Date.now() ? "draft" : null;
}

/* R40 (T45; K2853; run-rules R16, R19, R21, R27; D14): THE DEPLOY GATE of the two doors. An ask, or a draft of a kind, is
   posted only while run-rules' own flag deploys it (`ask` in `deployedModesFor`; a draft's kind by `draftKindDeployed`)
   AND its test bar is held on Civicsmith's set (`partDeployableOn`, on ai-runs' R75 records, the chain empty: neither
   part is in the order). Both are run-rules' and ai-runs' answers, read here, never a second rule. The flags and the set
   are the record's; a module test alone hands its own through `assistantGateOf` before the object is built (K61, as
   `transcriberOf`'s `testSet`), never `env`. */
const GATES = new WeakMap();
/** R40: this storage's gate deps, `{flags, testSet}`: `flags` as `deployedModesFor`/`draftKindDeployed` take them (null:
 *  run-rules' own), `testSet` in place of `CIVICSMITH_TEST_SET`. Read on the first call only. */
export function assistantGateOf(ctx, deps = {}) {
  const k = ctx && ctx.storage ? ctx.storage : ctx;
  let g = GATES.get(k);
  if (!g) {
    g = Object.freeze({ flags: deps && deps.flags && typeof deps.flags === "object" ? deps.flags : null,
                        testSet: (deps && deps.testSet) || CIVICSMITH_TEST_SET });
    GATES.set(k, g);
  }
  return g;
}
/** R40: the draft kind (run-rules R22, R25, R27) each draft op is: a member's own words, a translation, or one of the
 *  action drafts. An op not named is no kind, and so never deployed (fail closed). */
export const DRAFT_KIND_OF = Object.freeze({ writinghelp: "own_words", groupdescriptiondraft: "own_words",
  translationdraft: "translation", textcheck: "textcheck", infractiondraft: "infractiondraft", bearingdraft: "bearingdraft" });
const NOT_DEPLOYED = "AI_RUN_MODE_NOT_DEPLOYED";
/* R40: the refusal, as ai-runs refuses an undeployed run mode: run-rules' row (C-109.1), read by key, with the mode. */
function notDeployed(mode, kind = null) {
  const row = AI_RUN_OPEN_CHECKS[NOT_DEPLOYED];
  return { ok: false, reason: NOT_DEPLOYED, code: NOT_DEPLOYED, check: row.check, translation: row.translation, mode,
           ...(kind !== null ? { kind } : {}) };
}
/** R40: null when `mode` (`ask`, or `draft` of `kind`) is deployed by its flag and its bar is held; else the refusal.
 *  Anything that throws refuses. */
export function deployGate(ctx, env, mode, kind = null) {
  let ok = false;
  try {
    const g = assistantGateOf(ctx);
    const flagged = mode === ASK_MODE.mode ? deployedModesFor(g.flags ?? undefined).includes(ASK_MODE.mode)
      : mode === DRAFT_MODE.mode && typeof kind === "string"
        ? draftKindDeployed({ kind, ...(g.flags ? { flags: g.flags } : {}) }) : false;
    const part = mode === ASK_MODE.mode ? ASK_MODE.mode : `draft:${kind}`;
    ok = flagged === true
      && partDeployableOn(g.testSet, part, { verifications: [], testBars: aiRunsOf(ctx, env).testBarRecords() }) === true;
  } catch { ok = false; }
  return ok ? null : notDeployed(mode, mode === ASK_MODE.mode ? null : kind);
}

/* R33: `answers.askAccount`'s account, read once into agent-worker R6's account shape. */
const accountOf = (a) => (a && a.account && typeof a.account === "object" ? a.account : {});

/** On the `bio` object: judge the account and its limit (`answers.askAccount`), mint the grant (unless one was
 *  presented), unseal the account, read the suggestions switch, and post the ask. */
export async function askOnObject(ctx, env, { member, session = null, grant = null, question, conversation, store = null,
                                              project = null }) {
  /* R40 (K2853): first, before the keep-away read, any account read or any grant: the mode deployed and its bar held. */
  const undeployed = deployGate(ctx, env, ASK_MODE.mode);
  if (undeployed) return json(undeployed, 403);
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return json({ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "your group's Civicsmith has no assistant bound to it. Nothing was asked." }, 503);
  /* K1690, N765 (instance-setup R55; credentials R35; K231, K2200 (3)): while the group keeps its material away from
     every assistant, or that setting cannot be read, every ask is refused as instance-setup's `assistantGate()` answers
     it, `credentials`' `AI_KEPT_AWAY` row as given, before any grant is minted or any account read. */
  const off = instanceSetupOf(ctx, env).assistantGate();
  if (off) return json(off, 403);
  const c = credentialsOf(ctx);
  /* R33 (K2500; answers R30): the account that serves this ask, and its limit, judged by answers for the ask's
     `project` when it names one; a refusal (NO_ACCOUNT, AI_USE_SWITCHED_OFF, AI_LIMIT_REACHED, ...) is answered as
     given, before any grant is minted or anything posted. */
  const judged = await answersOf(ctx).askAccount({ member, kind: "ask", ...(project ? { project } : {}) });
  if (!judged || judged.ok !== true) return json(judged, 409);
  let token = grant;
  if (!token) {
    const g = await c.aiGrantMint({ member, by: member, session, ...(project ? { project } : {}) });
    if (!g || g.ok !== true) return json(g, 403);
    token = g.token;
  }
  /* K1806 (agent-worker R6, R54; credentials R35; K1755, K1798): the account that serves this ask, carried as
     `{kind, level, secret, member, suggestions}`: R35's `key` named `secret`, `level` `member` for the member's own
     reference, `group` for the group's API key, `project` for a project's. The member's own switch is read from their
     reference's state (credentials R25); another account's switch has no in-plane read for a member's act (K1798), so an
     ask it serves offers no suggestion, as by default. */
  let ref = accountOf(judged);
  let suggestions = false;
  if (ref.level === "member")
    try { const st = c.accountReferenceState({ member, viewer: member }); suggestions = !!(st && st.ok === true && st.suggestions === true); }
    catch { suggestions = false; }
  const out = JSON.stringify({ question, ...(conversation !== undefined ? { conversation } : {}), ...(store ? { store } : {}),
                               grant: token, account: { kind: ref.kind, level: ref.level, secret: ref.key, member, suggestions } });
  ref = null;
  let res;
  try {
    res = await w.fetch("https://agent-worker/ask", { method: "POST", headers: { "content-type": "application/json" }, body: out });
  } catch {
    return json({ ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member did not answer. Nothing was kept." }, 502);
  }
  return new Response(res.body, { status: res.status, headers: res.headers });
}

/** plane R19 (N686; K1837, K1841, K2038, K2041, K2062; control-plane R57, agent-worker R59, credentials R27, R35, R37):
 *  on the `bio` object, the draft's account and grant, the `/draft` twin of `askOnObject`. control-plane's door, past
 *  every refusal its own and the owner's, asks it with `draftAsk`'s shape, `{op, member, session, told, act, field,
 *  firsthand, pack}`. While the group keeps its material away it is refused `AI_KEPT_AWAY` as instance-setup's
 *  `assistantGate()` answers it (its R55; credentials R35; N765); it resolves
 *  the account that serves the member's own act (`accountFor`, an `ask`-kind act: a draft is the member's own read-only
 *  ask), reads that account's `suggestions` switch (the member's own reference's, credentials R25; the group key's, its
 *  R37), mints the member's ask grant only when `suggestions` is on and the field is not firsthand (DEC-153 (2), K1841
 *  (2)), and posts `{task, told, account, grant?, pack?, firsthand?}` to agent-worker's `/draft` in its R6 wire shape,
 *  the pack the door holds sent only with no grant (agent-worker R59). (T37; K2238) A translation draft
 *  (`op: "translationdraft"`, agent-worker R68) is posted as `{task: {op, direction, language, words}, account, pack}`:
 *  no `told`, no `firsthand`, and never a grant (it reads nothing of the record, run-rules R22). It answers a Response at agent-worker's status:
 *  agent-worker's JSON as given (or the refusal that ended it first) with `grant` (null when none), `suggestions` and
 *  `read`, the strings of that grant's read log on this object (`answers.readLog`, its R1, R2; `[]` with no grant), so
 *  the door checks the draft against them (`wizard-scripts.checkDraft`) and counts its usage. The door answers the
 *  member and never the grant. The secret leaves the object only in that one call.
 *  R40 (T45; K2853): first of all, the draft's kind deployed by its flag and its bar held, else refused
 *  `AI_RUN_MODE_NOT_DEPLOYED` (403) before the keep-away read, any account read or grant.
 *  R41 (T45; K2824; agent-worker R76, run-rules R27): the three action drafts. `textcheck` (`{text}`) reads nothing of the
 *  record: no grant, the pack sent. `infractiondraft` (`{matter, audience}`) and `bearingdraft` (`{action, reply}`) read
 *  named records (`draftMayRead`): a grant is minted whatever the switch (never for a firsthand field), and the records
 *  are assembled here from the asking member's own reads (`read`, the object's route map under her viewer stamp, as
 *  `assembleRecords` says), posted beside the task; a read refused ends the draft with that refusal, nothing minted or
 *  posted. Nothing is written. */
export async function draftOnObject(ctx, env, { op = null, member = null, session = null, told = null, act = null, field = null,
                                                firsthand = false, pack = null, direction = null, language = null,
                                                words = null, text = null, matter = null, audience = null, action = null,
                                                reply = null } = {}, { read = null } = {}) {
  const who = member === null || member === undefined || member === "" ? null : `member:${idOf(member)}`;
  const readOf = (grant) => {
    if (!grant) return [];
    try { return [...answersOf(ctx).readLog(grant).index.keys()]; } catch { return []; }
  };
  const out = (status, answer, grant = null, suggestions = false) =>
    json({ ...(answer && typeof answer === "object" && !Array.isArray(answer) ? answer : { ok: false, answer }),
           grant, suggestions, read: readOf(grant) }, status);
  /* R40 (K2853): the kind deployed and its bar held, before anything else is read */
  const kind = Object.hasOwn(DRAFT_KIND_OF, op ?? "") ? DRAFT_KIND_OF[op] : null;
  const undeployed = deployGate(ctx, env, DRAFT_MODE.mode, kind);
  if (undeployed) return out(403, undeployed);
  const w = env && env.AGENT_WORKER;
  if (!w || typeof w.fetch !== "function")
    return out(503, { ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "your group's Civicsmith has no assistant bound to it. Nothing was drafted." });
  const off = instanceSetupOf(ctx, env).assistantGate();   /* N765: `AI_KEPT_AWAY`, as for an ask, before any account */
  if (off) return out(403, off);
  const c = credentialsOf(ctx);
  /* R33 (K2500, K2508; answers R30): the account and its limit judged by answers for kind `draft`; its refusal answered
     as given, before any grant is minted or anything posted. */
  const judged = await answersOf(ctx).askAccount({ member: who, kind: "draft" });
  if (!judged || judged.ok !== true) return out(409, judged);
  let ref = accountOf(judged);
  let suggestions = false;
  try {
    if (ref.level === "member") { const st = c.accountReferenceState({ member: who, viewer: who }); suggestions = !!(st && st.ok === true && st.suggestions === true); }
    else if (ref.level === "group") { const g = c.groupKeySwitches(); suggestions = !!(g && g.suggestions === true); }
  } catch { suggestions = false; }
  /* R41 (K2824): an action draft's records, from the member's own reads, before any grant is minted */
  let records = {};
  if (kind === "infractiondraft" || kind === "bearingdraft") {
    const r = assembleRecords(ctx, { kind, matter, action, reply, viewer: who, read });
    if (!r || r.ok !== true) return out(r && r.reason === "BAD_TASK" ? 400 : 409, r, null, suggestions);
    records = r.records;
  }
  /* run-rules R22, R27 (`draftMayRead`): a grant only for a draft that may read the record: a member's own words with
     the switch on and not firsthand (DEC-153 (2), K1841 (2)); the two action drafts that read named records whatever the
     switch, never for a firsthand field; never a translation (T37; K2238) or a text check. */
  let grant = null;
  if (draftMayRead({ kind, firsthand: firsthand === true, suggestions })) {
    const g = await c.aiGrantMint({ member: who, by: who, session });
    if (!g || g.ok !== true) return out(403, g, null, suggestions);
    grant = g.token;
    noteDraftGrant(ctx, grant);   /* R33: its reads are recorded with `use: "draft"` */
  }
  const task = op === "writinghelp" ? { op, act, field } : kind === "translation" ? { op, direction, language, words }
    : kind === "textcheck" ? { op, text } : kind === "infractiondraft" ? { op, matter, audience }
    : kind === "bearingdraft" ? { op, action, reply } : { op };
  const account = { kind: ref.kind, level: ref.level, secret: ref.key, member: who, suggestions };
  const actionDraft = kind === "textcheck" || kind === "infractiondraft" || kind === "bearingdraft";
  const body = JSON.stringify(kind === "translation" ? { task, account, ...(pack != null ? { pack } : {}) }
    : actionDraft ? { task, account, ...(grant ? { grant } : pack != null ? { pack } : {}), ...records }
    : { task, told, account, ...(grant ? { grant } : pack != null ? { pack } : {}), ...(firsthand === true ? { firsthand: true } : {}) });
  ref = null;
  let res;
  try {
    res = await w.fetch("https://agent-worker/draft", { method: "POST", headers: { "content-type": "application/json" }, body });
  } catch {
    return out(502, { ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member did not answer. Nothing was kept." }, grant, suggestions);
  }
  let answer;
  try { answer = await res.json(); }
  catch { return out(502, { ok: false, reason: "AGENT_WORKER_SILENT", detail: "the assistant member's answer was not JSON. Nothing was kept." }, grant, suggestions); }
  return out(res.status, answer, grant, suggestions);
}

/* R41: a draft's task the door cannot assemble records for, in agent-worker R59's code. */
const badTask = (detail) => ({ ok: false, reason: "BAD_TASK", code: "BAD_TASK", detail: `${detail}. Nothing was drafted.` });
const said = (v) => typeof v === "string" && v.trim() !== "";

/** R41 (T45; K2824; agent-worker R76; run-rules R27): the records an action draft is about, assembled ONLY from reads the
 *  asking member may make: `read(op, params)` answers the object's route map for `op` under the member's own viewer
 *  stamp (`viewer`), so each read is the one she would make, never wider. Writes nothing.
 *  - `infractiondraft`, `matter` a plan id or `{plan?, actions?}`: `record = {plan, actions, correspondence, findings}`:
 *    the plan as `action-plans` reads it for her (`op=plan`), or null when the matter names none; the plan's started
 *    options' actions and the actions the matter names, each as `actions` reads it for her (`op=action`; one she may
 *    not see is left out); each such action's recorded entries (`correspondence`); and the findings those actions' legs
 *    cite that she may see, each with its legs to records she may see (`inquiry`'s `op=basis`, through membership's
 *    sight).
 *  - `bearingdraft`, `action` an action id and `reply` the `ord` of a received entry: `action_record`, the action as she
 *    reads it (with its legs, the claims it makes), and `reply_record`, `{action, ord, entry, reading, text}`: the entry,
 *    its artifact's reading as `extraction` answers it to her (`op=reading`), and its text when that reading holds one,
 *    else `{state: "undetermined", why}`.
 *  Answers `{ok: true, records}`, or a read's own refusal as given, or `BAD_TASK`. Never throws. */
export function assembleRecords(ctx, { kind, matter = null, action = null, reply = null, viewer = null, read = null }) {
  try {
    if (typeof read !== "function") return badTask("the records this draft is about cannot be read here");
    if (!said(viewer)) return badTask("a draft that reads records is a member's own act");
    const ask = (op, params) => { const r = read(op, { ...params, viewer }); return r && typeof r === "object" ? r : { ok: false, reason: "UNDETERMINED" }; };
    const sight = membershipOf(ctx);
    if (kind === "bearingdraft") {
      if (!said(action)) return badTask("a bearing draft names the action the reply was received on");
      const a = ask("action", { id: action });
      if (a.ok !== true) return a;
      const ord = Number(reply);
      const entry = Number.isInteger(ord) ? (Array.isArray(a.correspondence) ? a.correspondence : []).find((e) => e && e.ord === ord) : null;
      if (!entry || entry.direction !== "received") return badTask("the reply named is not an entry received on this action");
      const reading = said(entry.artifact_sha) ? ask("reading", { sha256: entry.artifact_sha }) : null;
      const t = reading && reading.ok === true && reading.reading && typeof reading.reading.text === "string" ? reading.reading.text : null;
      return { ok: true, records: { action_record: a, reply_record: { action, ord, entry, reading,
        text: t ?? { state: "undetermined", why: "the reply's text is not held in a reading this member may read" } } } };
    }
    /* infractiondraft */
    const m = said(matter) ? { plan: matter } : matter && typeof matter === "object" && !Array.isArray(matter) ? matter : null;
    const named = m && Array.isArray(m.actions) ? m.actions.filter(said) : [];
    if (!m || (!said(m.plan) && !named.length)) return badTask("an infraction draft names the matter's plan or its actions");
    let plan = null;
    const ids = [];
    if (said(m.plan)) {
      plan = ask("plan", { id: m.plan });
      if (plan.ok !== true) return plan;
      for (const o of Array.isArray(plan.options) ? plan.options : []) if (o && o.action && said(o.action.id)) ids.push(o.action.id);
    }
    for (const id of named) if (!ids.includes(id)) ids.push(id);
    const actions = [], correspondence = [], findings = [], seen = new Set();
    for (const id of ids) {
      const a = ask("action", { id });
      if (a.ok !== true) continue;   /* an action she may not see is no part of her record */
      actions.push(a);
      correspondence.push({ action: id, entries: Array.isArray(a.correspondence) ? a.correspondence : [] });
      for (const l of Array.isArray(a.legs) ? a.legs : []) {
        const f = l && l.target;
        if (!said(f) || seen.has(f) || !(l.target_type === "inquiry" || /^INQ-/.test(f)) || !sight.inSight(f, viewer)) continue;
        seen.add(f);
        const b = ask("basis", { id: f });
        findings.push({ id: f, legs: (b.ok === true && Array.isArray(b.legs) ? b.legs : [])
          .filter((x) => x && said(x.target_id) && sight.inSight(x.target_id, viewer)) });
      }
    }
    return { ok: true, records: { record: { plan: said(m.plan) ? plan : null, actions, correspondence, findings } } };
  } catch (e) {
    return { ok: false, reason: "UNDETERMINED", detail: `the records this draft is about could not be read (${String((e && e.message) || e).slice(0, 120)}). Nothing was drafted.` };
  }
}

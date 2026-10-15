/* control-plane R57 (T35; N686, K1837, K1841, K2038; agent-worker R59, ai-runs R48, wizard-scripts R25): THE DOOR'S HALF OF
   THE ASSISTANT'S DRAFT. The Worker door forwards `groupdescriptiondraft` and `writinghelp` to the store as any op (the
   store's door resolves the assistant per act and answers `AI_KEPT_AWAY` and the ceilings, store-door R10; the owner
   answers its own refusals). When the owner answers past them all (`ASSISTANT_DRAFT_UNAVAILABLE`), the door asks the
   object's `draft` (plane's `draftOnObject`: the account, its switch, the grant only when suggestions are on and the field
   is not firsthand, agent-worker's `POST /draft`), counts the conversation's use to the member's day as a draft through
   the store's `askusage` (`ai-runs` R48), and checks the draft here with `wizard-scripts.checkDraft` against what the
   grant read (none when no grant was sent) before the member sees anything, answering it in its owner's shape. The grant
   itself is never answered. */
import { checkDraft } from "../wizard-scripts/index.mjs";
/* R99 (T49; K3366): the note a checked draft carries is read by key. */
import { word } from "../setup-words/index.mjs";

/** The ops whose draft is asked of the object (`instance-setup` R65, `wizard-scripts` R27; T37, N669, K2201: `instance-setup`
 *  R67's `translationdraft`, the third). */
export const DRAFT_OPS = Object.freeze(["groupdescriptiondraft", "writinghelp", "translationdraft",
  /* (T46; N920; plan-work R14) the status report: the owner answers the items directly (K2953) */ "statusreportassist"]);
/** (T37; K2201) The draft that reads nothing and is checked by its owner, not here: no `told`, no grant, no `firsthand`,
 *  no `checkDraft`; its answer is handed to the owner's store-internal `translationdraftrecord` (`instance-setup` R67). */
export const TRANSLATION_DRAFT = "translationdraft";
/** The store-internal route a translation draft's answer is handed to (`instance-setup` R67; no spec, op-declarations R6). */
export const TRANSLATION_RECORD = "translationdraftrecord";
/** (T46; N920) The op whose owner answers the items a status report is drafted from (`plan-work` R14), and the task the
 *  plane's draft door sends for it (`agent-worker` R76's fourth task, `plane` R40). Nothing is read through a grant and
 *  nothing is checked here; keeping a report is the member's own `statusreportsave`. */
export const STATUS_REPORT_ASSIST = "statusreportassist";
export const STATUS_REPORT_TASK = "statusreportdraft";
/** (T46; N917; plane R41, agent-worker R76) The draft the door asks with no owner before it: `{text}` from the body. */
export const TEXT_CHECK = "textcheck";
/** (T48; N670; plane R50, agent-worker R86) The draft the door asks with no owner before it: `{subject, language?}` from the
 *  body, translated for the asking member as she may read the subject. Nothing is read through a grant, checked here or
 *  recorded; the plane's answer, labelled, is the door's. */
export const READ_TRANSLATE = "readtranslate";
/** What the plane's draft answer carries for its own use and never for the member: the grant (never answered), the
 *  switch and the grant's read log, and the conversation's usage and call count (counted to her day by the door). */
const DRAFT_INTERNAL = Object.freeze(["ok", "grant", "suggestions", "read", "usage", "calls"]);
/* `instance-setup` R65's and `membership` R109's limits on the two fields of the group's description. */
const FIELD_MAX = Object.freeze({ focus: 1000, purpose: 4000 });

/** Whether a store answer is the owner's "past every refusal" (`ASSISTANT_DRAFT_UNAVAILABLE`, under the store's
 *  `result`), so the door asks for the draft. */
export function draftDue(op, body) {
  const r = body && typeof body === "object" ? body.result : null;
  /* (T46; K2953) the status report's owner answers its items past its own refusals, `ok: true`; a plan the viewer may
     not see is its refusal (`NO_SUCH_PLAN`), answered as given and nothing drafted */
  if (op === STATUS_REPORT_ASSIST)
    return !!r && r.ok === true && Array.isArray(r.items) && r.items.length > 0;
  return DRAFT_OPS.includes(op) && !!r && r.ok === false
    && (r.reason === "ASSISTANT_DRAFT_UNAVAILABLE" || r.code === "ASSISTANT_DRAFT_UNAVAILABLE");
}

/** What the door asks the object for, from the request's own body and the door's stamps: `told` is the administrator's
 *  `answers` or what the member typed, `act` and `field` the field helped, `firsthand` as the owner stated it. */
export function draftAsk(op, asked, { member, session, firsthand, pack, owner = null }) {
  const b = asked && typeof asked === "object" && !Array.isArray(asked) ? asked : {};
  /* (T37) a translation's task is the owner's answer past its refusals (`instance-setup` R67: its `direction`, `language`
     and `words`, R68's shape), never the caller's own list; nothing else of the request is sent */
  /* (T46; N920) the status report's task: the plan and the items the owner answered, never the caller's own list */
  if (op === STATUS_REPORT_ASSIST) {
    const o = owner && typeof owner === "object" ? owner : {};
    return { op: STATUS_REPORT_TASK, member, session, plan: typeof o.plan === "string" ? o.plan : null,
             items: Array.isArray(o.items) ? o.items : null };
  }
  if (op === TRANSLATION_DRAFT) {
    const o = owner && typeof owner === "object" ? owner : {};
    return { op, member, session, pack, direction: o.direction ?? b.direction ?? null, language: o.language ?? b.language ?? null,
             words: Array.isArray(o.words) ? o.words : null };
  }
  return { op, member, session, pack,
           told: op === "writinghelp" ? b.told ?? null : b.answers ?? null,
           act: op === "writinghelp" ? b.op ?? null : null, field: op === "writinghelp" ? b.field ?? null : null,
           firsthand: op === "writinghelp" && firsthand === true };
}

/** The draft the object answered, checked and shaped: `{status, body}`. `drafted` is plane's answer (agent-worker's,
 *  with `grant`, `suggestions` and `read`, the strings the grant's read log holds). A refusal or an ending is answered
 *  as given; `grant` is never answered. */
export function checkedDraft(ask, drafted, status, askedBy) {
  if (!drafted || typeof drafted !== "object" || drafted.ok !== true) {
    const { grant: _g, ...given } = drafted && typeof drafted === "object" ? drafted : {};
    return { status: status >= 400 ? status : 502, body: { ok: false, ...given } };
  }
  /* (T46; N897 (2); plane R40, agent-worker R79) a draft admitted on the test-instance exception carries `untested`,
     passed to the member as the plane answered it; one admitted by the bar carries none */
  const untested = untestedOf(drafted);
  /* (T46; N917, N920) a text check and a status report read nothing and are checked by no `checkDraft`: the labelled
     draft is answered as the plane's draft door gave it */
  if (ask.op === READ_TRANSLATE)
    return { status: 200, body: { ok: true, ...Object.fromEntries(Object.entries(drafted).filter(([k]) => !DRAFT_INTERNAL.includes(k))) } };
  if (ask.op === TEXT_CHECK || ask.op === STATUS_REPORT_TASK)
    return { status: 200, body: { ok: true, ...(ask.op === STATUS_REPORT_TASK ? { plan: ask.plan } : {}),
                                  draft: drafted.draft ?? null, label: drafted.label ?? null, ...untested } };
  const told = Array.isArray(ask.told) ? ask.told.map((a) => (a && typeof a === "object" ? a.text : a)) : ask.told;
  const opts = { told, readLog: Array.isArray(drafted.read) ? drafted.read : [], firsthand: ask.firsthand === true,
                 suggestions: drafted.suggestions === true, askedBy };
  const draft = drafted.draft && typeof drafted.draft === "object" ? drafted.draft : {};
  const refused = (k) => ({ status: 409, body: { ok: false, reason: k?.code ?? "WRITING_HELP_FACT_ADDED" } });
  if (ask.op === "writinghelp") {
    const k = checkDraft(typeof draft.text === "string" ? draft.text : "", opts);
    if (!k || k.ok !== true) return refused(k);
    return { status: 200, body: { ok: true, text: k.text, label: k.label, withheld: k.withheld, ...untested,
                                  note: word("draft.machine.label") } };
  }
  const out = { ok: true, withheld: [] };
  for (const f of ["focus", "purpose"]) {
    const k = checkDraft(typeof draft[f] === "string" ? draft[f] : "", opts);
    if (!k || k.ok !== true) return refused(k);
    if ([...k.text].length > FIELD_MAX[f])
      return { status: 409, body: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE",
                                    detail: `the draft's ${f} is over its limit, so nothing was drafted and the fields are as they were.` } };
    out[f] = { text: k.text, label: k.label };
    out.withheld.push(...(k.withheld || []).map((x) => ({ field: f, ...x })));
  }
  Object.assign(out, untested);
  out.note = word("draft.machine.label.group");
  return { status: 200, body: out };
}

/** (T46; N897 (2)) `{untested}` when the plane's draft answer carries the label (an object, as `run-rules`' `untestedLabel`
 *  answers it), else nothing: a draft admitted by the bar carries none, and nothing is invented here. */
export function untestedOf(drafted) {
  const u = drafted && typeof drafted === "object" ? drafted.untested : undefined;
  return u && typeof u === "object" && !Array.isArray(u) ? { untested: u } : {};
}

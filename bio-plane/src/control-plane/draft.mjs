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

/** The ops whose draft is asked of the object (`instance-setup` R65, `wizard-scripts` R27; T37, N669, K2201: `instance-setup`
 *  R67's `translationdraft`, the third). */
export const DRAFT_OPS = Object.freeze(["groupdescriptiondraft", "writinghelp", "translationdraft"]);
/** (T37; K2201) The draft that reads nothing and is checked by its owner, not here: no `told`, no grant, no `firsthand`,
 *  no `checkDraft`; its answer is handed to the owner's store-internal `translationdraftrecord` (`instance-setup` R67). */
export const TRANSLATION_DRAFT = "translationdraft";
/** The store-internal route a translation draft's answer is handed to (`instance-setup` R67; no spec, op-declarations R6). */
export const TRANSLATION_RECORD = "translationdraftrecord";
/* `instance-setup` R65's and `membership` R109's limits on the two fields of the group's description. */
const FIELD_MAX = Object.freeze({ focus: 1000, purpose: 4000 });

/** Whether a store answer is the owner's "past every refusal" (`ASSISTANT_DRAFT_UNAVAILABLE`, under the store's
 *  `result`), so the door asks for the draft. */
export function draftDue(op, body) {
  const r = body && typeof body === "object" ? body.result : null;
  return DRAFT_OPS.includes(op) && !!r && r.ok === false
    && (r.reason === "ASSISTANT_DRAFT_UNAVAILABLE" || r.code === "ASSISTANT_DRAFT_UNAVAILABLE");
}

/** What the door asks the object for, from the request's own body and the door's stamps: `told` is the administrator's
 *  `answers` or what the member typed, `act` and `field` the field helped, `firsthand` as the owner stated it. */
export function draftAsk(op, asked, { member, session, firsthand, pack, owner = null }) {
  const b = asked && typeof asked === "object" && !Array.isArray(asked) ? asked : {};
  /* (T37) a translation's task is the owner's answer past its refusals (`instance-setup` R67: its `direction`, `language`
     and `words`, R68's shape), never the caller's own list; nothing else of the request is sent */
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
  const told = Array.isArray(ask.told) ? ask.told.map((a) => (a && typeof a === "object" ? a.text : a)) : ask.told;
  const opts = { told, readLog: Array.isArray(drafted.read) ? drafted.read : [], firsthand: ask.firsthand === true,
                 suggestions: drafted.suggestions === true, askedBy };
  const draft = drafted.draft && typeof drafted.draft === "object" ? drafted.draft : {};
  const refused = (k) => ({ status: 409, body: { ok: false, reason: k?.code ?? "WRITING_HELP_FACT_ADDED" } });
  if (ask.op === "writinghelp") {
    const k = checkDraft(typeof draft.text === "string" ? draft.text : "", opts);
    if (!k || k.ok !== true) return refused(k);
    return { status: 200, body: { ok: true, text: k.text, label: k.label, withheld: k.withheld,
                                  note: "a draft: nothing is saved until you edit it and keep it, and then the words are yours." } };
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
  out.note = "a draft: nothing is saved until you edit it and keep it, and then the words are your group's.";
  return { status: 200, body: out };
}

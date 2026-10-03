/* inquiry-grammar — THE GRAMMAR OF AN INQUIRY DOCUMENT (requirements: `build/requirements/inquiry-grammar.md` R1–R5,
 * R8–R11; T19 layer 6, K766; R11 at T28, N522).
 *
 * MOVED FROM THE CHECK CATALOGUE (`checks/bio-checks.mjs`, legacy-checks) UNCHANGED: the C-2.8 entry arm and the
 * division block (`checkInquiryExtension`, `checkDividedExtension`), the recheck coverage (C-15.1,
 * `checkRecheckCoverage`), supersession and the division disclosure (C-6.1), the leg grammar with its grounds,
 * testimony, earned and inherited arms (C-2.8, C-6.3, C-21.2) and its part (C-45 through `content`), and the lead
 * checker (C-54.1). The code below is the catalogue's text line for line; what changed is the imports, this header,
 * the finding helper's comment, and one call: `checkInquiryBasis` no longer calls `basisVersionFindings` (R4), which
 * is `basis-versions`' own grammar, run at the sub-slot `./index.mjs`' C-2.8 arm offers (R6). Every finding is the
 * catalogue's, in check, severity, message, repairs and code.
 *
 * WHAT IS READ FROM ELSEWHERE, and from where (the module's Uses):
 *   - `record-grammar`: the id, type, actor and grade vocabularies;
 *   - `content`: the extent core the leg's part is judged by (`checkContentExtent`, `legExtent`,
 *     `legHasAuthoredExtent`, `CONTENT_ID_RE`, `CONTENT_EXTENT_DOCUMENT_ONLY`; its R48: the catalogue's copy, unchanged);
 *   - `text-chain`: the extent kinds the repair sentence lists (`CONTENT_EXTENT_KINDS`, its R92);
 *   - `connections`: `themeLegFindings` (C-81.1, its R46), asked of each leg before any other complaint about it;
 *   - `observation-log`: `LEAD_ID_RE`, a lead id's shape (its R14).
 *
 * Pure (R9): nothing here reads or writes the record, the clock or the network; every function never throws on a
 * document it is handed, and the facts a check needs (the published and earned registries) are handed to it. */

import { BUNDLE_ID_RE, ISO_TS_RE, OBJECT_TYPES, normalizeType, isMachineIdentity, BASIS_ROLES, BASIS_GRADES, GRADE_AXES,
  TESTIMONY_GRADE, GRADE_SOURCES, EARNED_GRADE_SOURCES } from "../record-grammar/index.mjs";
import { checkContentExtent, legExtent, legHasAuthoredExtent, CONTENT_ID_RE, CONTENT_EXTENT_DOCUMENT_ONLY }
  from "../content/extent-core.mjs";
import { CONTENT_EXTENT_KINDS } from "../textchain.mjs";
import { themeLegFindings } from "../connections/checks.mjs";
import { LEAD_ID_RE } from "../observation-log/checks.mjs";
import { LEAD_CHECKS, INQUIRY_GRAMMAR_CHECKS } from "./checks.mjs";

/** A finding, record-grammar's shape (its R11), with the optional `code` (REC-56 / D-206): a discriminator within a
 *  rule, minted at the same call site as the finding it describes. */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}

/* The subject registry's own key shape: record-core's `allocId("ENT", year)`
   yields ENT-<4-digit year>-<4-digit sequence>, with no slug (unlike a bundle
   id). Shape only — see (a) above. */
const ENTITY_ID_RE = /^ENT-\d{4}-\d{4}$/;

/** REC-16: WHAT A `supersedes` EDGE MUST CARRY.
 *
 *  Verified this pass and it is the reason this arm exists: before this item
 *  `supersedes` had ZERO occurrences in `store.mjs` and no producer at all.
 *  Membership of REL_VOCAB meant only that C-6.1 would not refuse the string —
 *  it never meant the edge was governed. So the first producer arrives together
 *  with the requirements, the way every state in the inquiry machine has
 *  arrived together with its entry requirements.
 *
 *  A REASON, because supersession is the heaviest member relation in the
 *  vocabulary: it says *this question replaced that one*, and an unexplained
 *  replacement is a change nobody can check. `links_to` is the precedent for
 *  requirements riding a rel; `sever with reason` is the precedent for the
 *  reason itself — the catalog already refuses moving an edge with no account.
 *
 *  A RESOLVABLE TARGET is the other half and is enforced in two places by
 *  construction rather than by agreement: C-6.2's resolver arm (record-grammar's references arm) catches it
 *  wherever a resolver is injected, and the store resolves it directly at the
 *  write. A supersedes edge to nothing points a reader at a question that does
 *  not exist, which is worse than no edge — it asserts a lineage. */
export function supersedesEdgeFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== 'object' || r.rel !== 'supersedes') return;
    if (typeof r.reason !== 'string' || r.reason.trim() === '') {
      findings.push(f('C-6.1', 'error', `references[${i}] is a supersedes edge with no reason: supersession says this question replaced that one, and a replacement with no account of why cannot be checked by anyone`,
        ['author the reason this supersedes its target', 'or use relates_to, which claims nothing about replacement']));
    }
    if (typeof r.target !== 'string' || !BUNDLE_ID_RE.test(r.target)) {
      findings.push(f('C-6.1', 'error', `references[${i}] is a supersedes edge whose target '${String(r.target).slice(0, 40)}' is not a canonical record id: an edge that asserts a lineage must name the thing it came from`));
    }
  });
}


/** REC-16 / R4: THE DISCLOSURE, and it is this item's point rather than a
 *  detail.
 *
 *  A child of a division records its PARENT id AND its SIBLING ids, authored in
 *  `bundle.md` and projected through the ordinary promote path — the frontmatter
 *  keys REC-14 RESERVED (`division_parent`, `division_siblings`) with no
 *  producer, so the published shape would not change under readers once cases
 *  existed. This item is the producer.
 *
 *  THE REASONING INVERTS THE ARGUMENT FOR DIVISION. Division was justified as
 *  the mechanism that stops weakest-link composition forcing a member to
 *  overclaim or stay silent. The abuse is the SAME mechanism: dividing is a
 *  cheaper way to shed a finding that cuts against you than severing it, and a
 *  published child that discloses neither parent nor siblings defeats invariant
 *  7 with a housekeeping operation. A reader who can see one half of a divided
 *  inquiry must be able to see that the other half EXISTS.
 *
 *  WHAT THIS FUNCTION CAN AND CANNOT SEE. It is pure over one document, so it
 *  holds the disclosure's SHAPE: a supersedes edge and the division keys agree
 *  with each other, the sibling list is present and non-empty, and it names
 *  neither the child itself nor its parent. Whether the list is COMPLETE — every
 *  sibling of that division and not merely one — cannot be answered from the
 *  child alone; the store answers it at the write against the parent's own
 *  `division.into`, and refuses NO_SIBLING_DISCLOSURE. Both halves are needed:
 *  this one makes an incoherent child impossible to author, and that one makes a
 *  quietly incomplete one impossible to land. */
export function divisionDisclosureFindings(fm, findings) {
  /* SCOPED TO AN INQUIRY SUPERSEDING AN INQUIRY, which is the division shape and
     today the only shape supersession has: this item is `supersedes`'s first
     producer, and division is what it produces. An information object
     superseding another information object is a different claim about a
     different kind of thing, and it is governed by the edge requirements above
     (a reason and a resolvable target) without a disclosure it has nothing to
     disclose. If a later item gives INQUIRY supersession a second producer, this
     is the arm it has to argue with rather than route around — and the escape
     that already exists is `relates_to`, which claims no replacement at all. */
  if (normalizeType(fm?.object_type) !== 'inquiry') return;
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  const supers = refs.filter((r) => r && typeof r === 'object' && r.rel === 'supersedes'
    && typeof r.target === 'string'
    && normalizeType(OBJECT_TYPES[r.target.split('-')[0]]) === 'inquiry');
  const parent = typeof fm?.division_parent === 'string' && fm.division_parent !== 'null' ? fm.division_parent : null;
  const sibsRaw = fm?.division_siblings;
  const sibs = Array.isArray(sibsRaw) ? sibsRaw.filter((x) => typeof x === 'string' && x !== '') : null;

  if (!parent && supers.length === 0) return;   // nothing to disclose, nothing claimed

  if (supers.length && !parent) {
    findings.push(f('C-6.1', 'error', `this document carries a supersedes edge to ${supers[0].target} and declares no division_parent: a question that superseded another discloses which division it came out of, so a reader who can see one half can see that the other half exists (R4)`,
      ['set division_parent to the inquiry this was divided out of', 'or sever the supersedes edge']));
  }
  if (parent && !supers.some((r) => r.target === parent)) {
    findings.push(f('C-6.1', 'error', `division_parent names ${parent} with no supersedes edge to it: the disclosure and the edge are two views of one fact and cannot disagree`,
      [`add a references[] entry {rel: supersedes, target: ${parent}} with its reason`]));
  }
  if (!parent) return;
  if (sibs === null || sibs.length === 0) {
    findings.push(f('C-6.1', 'error', `division_parent names ${parent} and division_siblings is ${sibs === null ? 'absent' : 'empty'}: a division produces at least two questions, so a child of one always has at least one sibling to name — NO_SIBLING_DISCLOSURE`,
      ['name every OTHER child of this division in division_siblings']));
    return;
  }
  for (const s of sibs) {
    if (!BUNDLE_ID_RE.test(s)) findings.push(f('C-6.1', 'error', `division_siblings names '${String(s).slice(0, 40)}', which is not a canonical record id`));
    if (s === parent) findings.push(f('C-6.1', 'error', `division_siblings names ${s}, which is this document's division_parent: the parent is disclosed as the parent, and listing it as a sibling would hide that one of the halves is missing`));
    if (typeof fm.id === 'string' && s === fm.id) findings.push(f('C-6.1', 'error', `division_siblings names this document itself: a sibling set that counts the child is a set that can look complete while a real sibling is absent`));
  }
}

/** C-15: recheck coverage on inquiries (né Focuses), all dispositions.
 *  The comparison is against 'inquiry' because normalizeType now maps both
 *  legacy spellings there — left at 'focus' this check would silently stop
 *  firing for every document, old and new. */
export function checkRecheckCoverage(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== 'inquiry') return;
  const rts = Array.isArray(ctx.fm.recheck_triggers) ? ctx.fm.recheck_triggers : [];
  if (rts.length === 0) {
    findings.push(f('C-15.1', 'error', 'every Problem, in every disposition including dismissed, carries at least one recheck trigger', ['author a trigger, dual-audience shape, dated when time-bound']));
    return;
  }
  for (let i = 0; i < rts.length; i++) {
    const t = rts[i];
    if (typeof t !== 'object' || !t?.text || !t?.description) {
      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}] lacks the dual-audience {text, description} shape`));
    } else if (t.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) {
      findings.push(f('C-15.1', 'error', `recheck_triggers[${i}].date '${t.date}' is not YYYY-MM-DD`));
    }
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* C-2.8, renamed from checkFocusExtension by REC-10. Keeps surfaced_by and
   disposition_reason exactly as the focus contract had them; REC-11 adds the
   basis[] leg grammar via checkInquiryBasis below, and REC-13 the CONCLUDED
   entry requirements. `completeness` (published) and the division fields
   arrive with REC-14/16, each with its state.
   R6 (K775 (1)): `where`, when the C-2.8 slot's arm is called through record-core's `grammars()`, carries `rest()`,
   the slot's later claimants (`basis-versions`' grammar, its R43); it runs for an inquiry only, after the entry,
   division and subject-entity findings and before the leg grammar, where the catalogue called
   `basisVersionFindings`. With no `where` this runs as the catalogue's did, synchronously; with one whose `rest()`
   answers a promise, the leg grammar runs once it settles, and the promise is answered. */
export function checkInquiryExtension(ctx, findings, where) {
  if (normalizeType(ctx.fm?.object_type) !== 'inquiry') return;
  const fm = ctx.fm;
  if (!['agent', 'human'].includes(fm.surfaced_by)) {
    findings.push(f('C-2.8', 'error', `surfaced_by '${fm.surfaced_by}' is not one of: agent, human`));
  }
  if (['deferred', 'dismissed'].includes(fm.current_state)) {
    if (typeof fm.disposition_reason !== 'string' || fm.disposition_reason.trim() === '') {
      findings.push(f('C-2.8', 'error', `${fm.current_state} state requires a non-empty disposition_reason`));
    }
  }
  /* REC-13: the `concluded` ENTRY REQUIREMENTS, modelled on C-2.7's `verified`
     arm above — the state is not a label a document may simply wear, it is a
     claim the document has to be able to carry.
     - a CONCLUSION, because `concluded` with nothing concluded is a state
       change wearing an answer's clothes;
     - a FALSIFIER, because a finding that names nothing which would overturn
       it is a narrative rather than a result, and "less narrative" is a
       constraint on US (CLAUDE.md's stance). This is the requirement the
       item's negative control removes;
     - AT LEAST ONE BASIS LEG. DEC-22 is exactly what bounds this: an `open`
       inquiry may hold a claim with ZERO legs — a STANDING OBJECTIVE, legal
       and readable and never auto-anything — so the requirement fires HERE
       and only here. A conclusion resting on nothing is the overclaim this
       repository's primary threat model is about.
     An UNDETERMINED conclusion is stated as such in the prose, never faked to
     pass this gate; what is refused is silence, not uncertainty. */
  if (fm.current_state === 'concluded') {
    if (typeof fm.conclusion !== 'string' || fm.conclusion.trim() === '') {
      /* REC-56 / D-203's SWEEP, and this one is the HARDER half of the class:
         `concluded -> open` IS a legal edge (REC-13 added it — a conclusion is
         revisable), so the state machine does not refuse this advice. THE OP
         SURFACE DOES. `REOPENABLE_FROM` is promotion R51's frozen `["deferred",
         "dismissed"]` and excludes `concluded` DELIBERATELY and BY NAME:
         `deriveActs` does not publish `reopen` on a concluded inquiry in no case,
         and promotion's `#reopen` answers NOT_SET_DOWN with the reason — a conclusion quietly reverting to open
         still wearing its conclusion records nothing, and the edition machinery
         is where that move belongs. So the old repair told an operator to do
         exactly what the plane refuses, on an edge that looks legal, which is
         why reading repair strings against `STATES` alone would not have found
         it. affordances.mjs states the principle in its own words on
         REOPENABLE_FROM: *an act the catalog permits that no caller can perform
         is the state machine lying.* This is that sentence read backwards — a
         repair the catalog advises that no caller can perform.
         The replacement names no destination, so it cannot go stale if the FROM
         set changes. */
      findings.push(f('C-2.8', 'error', 'concluded state requires a non-empty conclusion',
        ['author the conclusion where the document stands: reopening does not pick a concluded inquiry back up (op=reopen answers NOT_SET_DOWN), so there is no act that undoes the conclusion and the repair is made in place']));
    }
    /* REC-117 / BOB 2026-09-17. THE FALSIFIER REQUIREMENT BECOMES A REQUIREMENT
       TO ACCOUNT FOR THE FALSIFIER, which is not the same as dropping it.
       Bob ruled NO_FALSIFIER overridable "either temporarily or in the
       published record", and the store's conclude() opens the door; this arm is
       the OTHER half, and the two must move together. The requirement is
       enforced twice on purpose (the old conclude suite's header recorded why), so
       breaking the store alone leaves the catalog refusing the bundle
       op=conclude just wrote, and breaking the catalog alone leaves op=conclude
       refusing the call.
       THREE OUTCOMES, and the middle one is the one this item is about:
         a falsifier is stated                 -> clean, exactly as before;
         none is stated and the ABSENCE is     -> clean, and the record says in
           attributed to a member with a date     whose name and on what date;
         none is stated and nothing accounts   -> the original error, unchanged
           for it                                 in code, severity and words.
       A HALF-RECORDED OVERRIDE IS AN ERROR IN ITS OWN RIGHT, and it is the arm
       that matters most: an override missing its actor or its date is a SILENT
       override — the record has stopped requiring a falsifier and has not said
       who decided that — which is the only wrong answer this ruling admits. It
       cannot arise from op=conclude, which writes both or neither; it is
       reachable by a hand-edited document, and that is exactly what the catalog
       is for. */
    const ovBy = typeof fm.falsifier_override_by === 'string' ? fm.falsifier_override_by.trim() : '';
    const ovAt = typeof fm.falsifier_override_at === 'string' ? fm.falsifier_override_at.trim() : '';
    const falsStated = typeof fm.falsifier === 'string' && fm.falsifier.trim() !== '';
    if (!falsStated && !ovBy && !ovAt) {
      findings.push(f('C-2.8', 'error', 'concluded state requires a non-empty falsifier: a conclusion that names nothing which would overturn it cannot be checked by anyone, including its author',
        ['state what evidence would falsify this conclusion',
         'or, if none can honestly be stated, record the absence: conclude with no_falsifier=1 so the record carries who accepted it and when']));
    } else if (!falsStated && !(ovBy && ovAt)) {
      findings.push(f('C-2.8', 'error', 'concluded state has no falsifier and only a HALF-RECORDED override: an override missing its ' + (ovBy ? 'date' : 'member') + ' is a silent one, and a record that has stopped requiring a falsifier without saying who accepted that claims more than it can support',
        ['record both falsifier_override_by and falsifier_override_at, or state a falsifier']));
    } else if (falsStated && (ovBy || ovAt)) {
      findings.push(f('C-2.8', 'error', 'concluded state carries BOTH an authored falsifier and a record that none was stated: those are two contradictory claims about this finding and nothing may choose between them',
        ['remove the falsifier_override_by/at pair if the falsifier stands',
         'or clear the falsifier if the absence is what the member meant to record']));
    }
    if (!Array.isArray(fm.basis) || fm.basis.length < 1) {
      findings.push(f('C-2.8', 'error', 'concluded state requires at least one basis leg: an open inquiry may rest on nothing (a standing objective), a conclusion may not',
        ['add a basis[] leg naming what the conclusion rests on, and the same target in references[]']));
    }
  }
  /* CASE-4 / DEC-72: AND THIS IS WHERE THE `case_id` REQUIREMENT SURVIVES. The
     membership claim is the PAIR, so a document asserting a case EDITION while
     naming no case would otherwise slip past the whole ceremony by being
     half-formed — the exact hole REC-44's `case_id` arm was written to close,
     arriving through the new door. It is refused here, before the ceremony, and
     it names what is missing rather than what is present. */
  /* CASE-5b / DEC-72, 2026-09-10: THE ARM IS CORRECTED AND POINTS THE OTHER WAY
     NOW, AND THE OLD ONE IS WORTH SAYING OUT LOUD BECAUSE IT WAS RIGHT.

     WHAT IT USED TO SAY: `case_edition` with no `case_id` beside it names an
     edition of no case, so refuse it — membership was the PAIR and a half-formed
     claim would otherwise slip past the whole ceremony. That was exactly true
     while op=publish stamped both into every member.

     WHY IT IS WRONG NOW: this item removes BOTH from finding bytes. A finding's
     bytes no longer name a case at all — the case's assertions live in a case
     document a member signs (CASE-5b), which is the signature those facts had
     nowhere to move to until now. So the shape the old arm refused is no longer
     "half a membership claim", and the shape it ALLOWED — both fields present —
     is now the one that must not exist.

     IT IS A REFUSAL RATHER THAN AN ABSENCE, and that is the load-bearing part.
     If the gate merely stopped requiring these fields, a document carrying a
     stale `case_id` would sail through and every reader that still looks for one
     would find a case identity nothing in this plane wrote or checked — the
     second-authority drift D-21 names, arriving through bytes rather than
     through a table. Refused here, the deletion is a property of the FORMAT and
     not a property of op=publish remembering not to write it. */
  for (const k of ['case_id', 'case_edition', 'case_project', 'case_scope', 'case_findings', 'case_roles',
                   'bias_acknowledgement', 'required_strength']) {
    const v = fm?.[k];
    if (v === undefined || v === null || v === '' || v === 'null') continue;
    findings.push(f('C-2.8', 'error', `a finding's bytes name a case (${k}): since CASE-5b the case's own assertions — its identity, its edition, its producing project, its scope, its roster, its load-bearing partition, its bias acknowledgement and its bar — are signed ONCE, in the CASE DOCUMENT a member reviews and ratifies (op=caseratify), and not N times in N members' frontmatter. A finding is a member of a case because the case pinned its version hash, and that pin is inside the bytes the case's signer signed`,
      [`remove ${k} from this document's frontmatter`,
       'the case states these facts once, in its own signed document']));
  }
  /* REC-16: the `divided` ENTRY REQUIREMENTS, on the same principle again — a
     state is not a label a document may wear. What `divided` claims is that
     this question was two questions and that every leg it rested on now lives
     on a child, so the document has to be able to carry BOTH halves of that:
     the division itself, and the account of where every leg went. */
  if (fm.current_state === 'divided') checkDividedExtension(fm, findings);
  /* REC-18 / DATA-MODEL D1(b): THE SUBJECT ENTITY, and it is one OPTIONAL
     scalar rather than a block, a list or a table.
     - OPTIONAL because DEC-15 rules exactly what its absence costs: "an inquiry
       with no subject entity simply has no A/B/C available to it, which is
       honest." Requiring it would make the price a GATE, and a gate that
       pressures a member into naming a subject they have not established is the
       bug CLAUDE.md names about the publication fence.
     - A SCALAR, singular, because the earned grade is "the strongest resolution
       of that document's captures to THE inquiry's subject entity". With a list,
       "strongest across all subjects" would let an A earned about a tangential
       subject be laundered into a leg about the question's real one. A question
       with two subjects is two questions, and the record already has an act for
       that (op=inquirydivide, REC-16).
     - NO JUSTIFICATION FIELD, unlike entity_relations. A declared relation is
       CONSTITUTIVE — the group fixing what its own statements mean — and D-83
       requires it justified and cited. Naming what a question is about asserts
       nothing about the world and carries no grade; it is addressing. */
  if (fm.subject_entity !== undefined && fm.subject_entity !== null && fm.subject_entity !== '') {
    if (typeof fm.subject_entity !== 'string' || !ENTITY_ID_RE.test(fm.subject_entity)) {
      findings.push(f('C-2.8', 'error', `subject_entity '${String(fm.subject_entity).slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ['point subject_entity at an entry in the subject registry (op=entitycreate / op=entitybyalias), or omit it — an inquiry may name no subject, and then no leg of it earns an A/B/C connection grade (DEC-15)']));
    }
  }
  const sub = where && typeof where.rest === 'function' ? where.rest() : null;
  if (sub && typeof sub.then === 'function')
    return sub.then(() => checkInquiryBasis(fm, findings, ctx.publishedRegistry, ctx.earnedRegistry));
  checkInquiryBasis(fm, findings, ctx.publishedRegistry, ctx.earnedRegistry);
}

/** REC-16 / DEC-28 / R4: what a `divided` parent must be able to say.
 *
 *  TWO TOP-LEVEL KEYS, and the split is forced by the restricted frontmatter
 *  grammar rather than chosen: a block is a map of scalars or an array of
 *  objects, never a map holding an array of objects. So `division` is the map
 *  (the act: into, apportioned_by, at, reason) and `division_apportionment` is
 *  the array (the account: one row per leg, naming the child it went to) —
 *  exactly the shape REC-14's `completeness` / `completeness_excluded` pair
 *  takes, for exactly the same reason.
 *
 *  WHY THE APPORTIONMENT IS A GATE AND NOT MERELY AN OP BEHAVIOUR. R4's whole
 *  argument is that division and severance do not substitute, because
 *  *"every leg gets a home… Neither is not"*: severance REMOVES material from a
 *  question, division only RE-HOMES all of it. The abuse it blocks is that
 *  dividing would otherwise be a cheaper way to shed a finding that CUTS
 *  AGAINST you than severing it. That protection is worth nothing if it lives
 *  only in the op — a hand-written document could then wear `divided` while
 *  quietly dropping the inconvenient leg — so the requirement is that EVERY
 *  ORD in basis[] is accounted for. Ord, not target: duplicate targets are
 *  legal by design (D4 — one document, two legs), and keying on the target
 *  would let one row discharge two legs.
 *
 *  NO PER-LEG REASON (DEC-29). One authored reason for the whole division; the
 *  per-leg judgment is recorded per leg IN THE APPORTIONMENT ITSELF, and the
 *  counterweight to the friction asymmetry with severance is DISCLOSURE, not
 *  ceremony. Nothing here should be read as an invitation to add one. */
function checkDividedExtension(fm, findings) {
  const d = (typeof fm.division === 'object' && fm.division && !Array.isArray(fm.division)) ? fm.division : null;
  if (!d) {
    findings.push(f('C-2.8', 'error', 'divided state requires a division block: a question recorded as divided with no account of the division is a state change wearing a correction\'s clothes',
      /* REC-56 / D-203's sweep, third site: `divided` is TERMINAL — `divided:
         []` — so `divided -> open` is not an edge and C-4.2 refuses it by name,
         the same shape as `verified -> collected`. It is terminal
         STRUCTURALLY rather than by policy (the parent's legs are owned by its
         children now), so this is the one arm in the family where no state move
         exists in either direction and the honest advice says so.
         The first repair is UNCHANGED and is not a directive to run the op now
         — `op=inquirydivide` does not apply at `divided` either — it states
         where a division block legitimately comes from, which is C-20.1's
         `re-produce the creation at collected` shape exactly. */
      ['divide through op=inquirydivide, which authors the block and stamps who apportioned and when',
       'restore the division block from _history if the division was made and the block was lost',
       'otherwise raise it: the repair here is not a state move, and C-4.2 refuses any transition this machine does not carry']));
    return;
  }
  const into = Array.isArray(d.into) ? d.into.filter((x) => typeof x === 'string') : [];
  if (into.length < 2) {
    findings.push(f('C-2.8', 'error', `division.into names ${into.length} child inquir${into.length === 1 ? 'y' : 'ies'}: a division produces at least TWO questions, because one is a rename and zero is a deletion`,
      ['name every child the question was divided into']));
  }
  for (const id of into) {
    if (!BUNDLE_ID_RE.test(id)) findings.push(f('C-2.8', 'error', `division.into names '${String(id).slice(0, 40)}', which is not a canonical record id`));
  }
  if (new Set(into).size !== into.length) {
    findings.push(f('C-2.8', 'error', 'division.into names the same child twice: a leg apportioned to a child named twice has one home, not two'));
  }
  if (typeof d.reason !== 'string' || d.reason.trim() === '') {
    findings.push(f('C-2.8', 'error', 'division requires a non-empty reason: the reason belongs to the ACT (DEC-28), and a restructuring nobody accounted for is indistinguishable from one nobody should have made',
      ['author the reason the question was two questions']));
  }
  /* REC-46: one predicate, and the blank arm stays its own — absent is not
     machine, and "nobody apportioned" is a different finding from "a machine
     did". `isMachineIdentity` answers false for blank precisely so this reads
     as it always has. */
  if (typeof d.apportioned_by !== 'string' || d.apportioned_by.trim() === '' || isMachineIdentity(d.apportioned_by)) {
    findings.push(f('C-2.8', 'error', `division.apportioned_by '${d.apportioned_by}' is not a named member: apportionment is AUTHORED and never automatic, so the record carries the name of whoever decided where each leg went`));
  }
  if (!ISO_TS_RE.test(String(d.at || ''))) {
    findings.push(f('C-2.8', 'error', `division requires 'at' as an ISO timestamp (got '${d.at}')`));
  }
  /* THE ACCOUNT. Every leg the parent rested on, including — and this is the
     abuse R4 blocks — every leg whose role is `cuts_against`. */
  const legs = Array.isArray(fm.basis) ? fm.basis : [];
  const rows = Array.isArray(fm.division_apportionment) ? fm.division_apportionment : null;
  if (!rows) {
    findings.push(f('C-2.8', 'error', 'divided state requires a division_apportionment field: the parent records WHERE EVERY LEG WENT, because dividing must not be a cheaper way to shed a finding that cuts against you than severing it (R4)',
      ['author one apportionment row per basis leg, naming the child it went to']));
    return;
  }
  const homes = new Map();            // ord -> Set(child)
  rows.forEach((r, i) => {
    if (!r || typeof r !== 'object') { findings.push(f('C-2.8', 'error', `division_apportionment[${i}] is not an object`)); return; }
    if (!Number.isInteger(r.ord) || r.ord < 0 || r.ord >= legs.length) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}].ord '${r.ord}' does not name a leg of this inquiry's basis (0..${legs.length - 1}): a leg is addressed by its ORDINAL, because one document legitimately carries two legs (D4)`));
      return;
    }
    if (typeof r.to !== 'string' || !into.includes(r.to)) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}].to '${r.to}' is not one of the children named in division.into: a leg's home is a child of THIS division`));
      return;
    }
    const leg = legs[r.ord];
    if (leg && typeof leg === 'object' && typeof r.target === 'string' && r.target !== leg.target) {
      findings.push(f('C-2.8', 'error', `division_apportionment[${i}] names target '${r.target}' at ord ${r.ord}, where the basis carries '${leg.target}': the account and the basis are two views of one document and cannot disagree`));
    }
    if (!homes.has(r.ord)) homes.set(r.ord, new Set());
    homes.get(r.ord).add(r.to);
  });
  const orphans = [];
  for (let i = 0; i < legs.length; i++) if (!homes.has(i)) orphans.push(i);
  if (orphans.length) {
    const cutting = orphans.filter((i) => legs[i] && legs[i].role === 'cuts_against');
    findings.push(f('C-2.8', 'error', `basis leg${orphans.length === 1 ? '' : 's'} ${orphans.join(', ')} ${orphans.length === 1 ? 'has' : 'have'} no home in the apportionment${cutting.length ? ` (including ${cutting.length} that cut${cutting.length === 1 ? 's' : ''} AGAINST this inquiry)` : ''}: every leg gets a home on a child, because division RE-HOMES material and only severance REMOVES it (R4)`,
      ['apportion the remaining leg(s) to a child', 'or sever them with a reason, which is the act that removes material']));
  }
  const empty = into.filter((c) => ![...homes.values()].some((s) => s.has(c)));
  if (empty.length) {
    findings.push(f('C-2.8', 'error', `division.into names ${empty.join(', ')}, which received no leg of the parent's basis: a child that inherits nothing is a new question, not a half of this one`));
  }
}

/* Which axis each earned source is a source FOR. A resolution is the framework's
   §8.1 CONNECTION grade and nothing else; a capture grade is a property of an
   INFORMATION object (DEC-21) and nothing else. Stated as data rather than as
   two hand-written conditionals so the pairing has one home. */
export const EARNED_SOURCE_AXIS = { resolution: 'connection', capture: 'capture' };

/* REC-42 / DEC-32: a ground LABEL. Deliberately narrow — it is an identifier a
   member picks so two legs can say they belong together, not prose, and it
   appears inside derived sentences and inside frontmatter scalars. No quotes,
   no colons, no newlines, so nothing it names can break the block it is written
   in or smuggle punctuation into a sentence a reader trusts. */
export const GROUND_LABEL_RE = /^[a-z0-9][a-z0-9 _-]{0,47}$/i;

/* REC-11: the basis[] leg grammar, ONE function consulted by BOTH the checker
 * (via checkInquiryExtension above) and the store's op=promote write path —
 * the checkGatheringGrammar precedent — so a malformed leg never lands and the
 * two views cannot drift. Shape findings are C-2.8 (the inquiry extension);
 * the references[] subset arm is C-6.3, the rule that REPLACED the
 * elevated_into requirement (see record-grammar's `checkReferences`).
 *
 * The leg: {target, role, grade, grade_axis, grade_source, note, author, date}.
 * target is an INFO- or an inquiry-prefixed id — the inquiry target IS basis
 * recursion. role is invariant 7's storage: cuts_against is first-class. An
 * ABSENT or null grade is legal and means undetermined, STATED — never
 * invented to pass a gate. A PRESENT grade must say which axis it is on
 * (not derivable from target_type: connection grades legitimately sit on
 * INFO- legs — SB-OUTPUT 432-435) and where it came from. A hunch requires
 * its author and its date, refused BY NAME, because a hunch is only honest
 * while it announces itself; testimony is a member's signed account and is
 * grade D at no other value (DEC-15: hunch is the only authored grade
 * permitted above D). Duplicate targets are LEGAL by design — D4: a basis
 * legitimately cites one document for two legs, which is why this table has
 * an ordinal and refs could not carry it. */
/** REC-84 / IC-84 (1) — THE EXTENT GRAMMAR ON A LEG, AT BOTH LEG GRAINS.
 *
 *  A basis leg may say WHICH PART of its target it rests on. The grammar is
 *  IC-1's union flattened onto the leg (`legExtent` reads it; the restricted
 *  frontmatter grammar cannot carry a nested object, so the fields are scalars
 *  — the `completeness` / `division` precedent), plus the option of naming an
 *  already-minted part outright by its `content_id`.
 *
 *  ONE FUNCTION, TWO CHECK IDS, AND THAT PAIRING IS THE ITEM'S OWN RULE. C-2.8
 *  governs `basis[]` and C-25.10 governs `basis_version_legs[]`; they are two
 *  rules over two grains of one shape, and a second implementation of the
 *  grammar is the drift this repository has measured five times. The CHECK id is
 *  a parameter and the GRAMMAR is not.
 *
 *  IT RUNS THE CATALOGUE'S ONE CHECKER AND OWNS NO GRAMMAR OF ITS OWN.
 *  `checkContentExtent` is where an extent is judged, here and in the store
 *  alike; this function supplies the document-only context and re-labels the
 *  result. The two arms it adds on top are facts about the DOCUMENT and not
 *  about the extent — the shape of a named id, and a leg stating its referent
 *  twice.
 *
 *  WHY NAMING BOTH AN ID AND AN EXTENT IS REFUSED RATHER THAN RECONCILED. They
 *  are one fact written twice, and the record must never hold two authorities
 *  for one fact that can disagree — the `case_edition` and `refs`/`inquiry_basis`
 *  lessons, one construct down. Reconciling them would mean the plane silently
 *  preferring one, which is an authored citation moving without a member's act
 *  (Bob's 5.8). The id is the precise form and the extent is the descriptive
 *  one; a member uses whichever they have, never both.
 *
 *  AN ABSENT EXTENT IS `document` AND IS NEVER REFUSED (Bob's 5.3, no
 *  `unstated`), which is what makes every existing leg in the record promote
 *  byte-identically through this arm. */
export function checkLegExtentGrammar(leg, label, checkId, findings) {
  const bad = checkContentExtent(legExtent(leg), CONTENT_EXTENT_DOCUMENT_ONLY);
  if (bad)
    /* THE CODE TRAVELS AND THE C-NUMBER IS THE LEG GRAMMAR'S, and that pairing
       is a correction this item paid for rather than a design chosen up front.
       REC-82's arms assert that `dom` is refused BY NAME rather than as an
       unknown kind — a distinction a member meets as a different sentence and a
       machine meets as a different CODE. The first draft of this arm pushed a
       bare C-2.8 finding, the catalogue then fired BEFORE the store's own arm,
       and four of REC-82's assertions went red because the distinction had been
       flattened into one number. Carrying `f`'s fifth argument keeps both facts:
       the RULE is the leg grammar (which is what IC-84 moves), and the CODE is
       the content-extent family's, which is what carries the canned translation
       (DEC-49) and what tells `dom` from a typo. No new row and no new region:
       the code is MINTED in `checkContentExtent`'s own governed region and this
       is a RELAY of it — a relay given its own marker is the defect PL-18 was
       failed by name for. */
    findings.push(f(checkId, 'error', `${label} names an extent this record cannot evaluate: ${bad.detail}`,
      /* CORRECTED 2026-09-14 BY REC-85: this named two landed kinds because two
         were landed when REC-84 wrote it, and the other three landed the same
         day. GUIDANCE THAT NAMES A CLOSED LIST GOES STALE THE MOMENT THE LIST
         MOVES, and stale guidance is worse than none here — it tells a member
         citing a real cell that the record cannot hold the citation, which is
         false and would send them to the whole document instead. The list is
         COMPOSED FROM THE MAP rather than typed, so the next kind to land (or
         `dom`, the day CONTENT-HTML produces one) cannot leave this sentence
         behind: the same rule `describeChain` and the DEC-49 fence composer
         already follow — a sentence built from the value it describes cannot
         come to describe a different one. */
      [`name one of the landed extent kinds — ${Object.entries(CONTENT_EXTENT_KINDS)
        .filter(([, v]) => v.landed).map(([k]) => k).sort().join(', ')} — with the fields that arm takes`,
       'or drop the extent fields entirely: a citation that names no part means the WHOLE document, which is always a legal thing to cite'],
      bad.code));
  const cid = leg && typeof leg === 'object' ? leg.content_id : undefined;
  if (cid !== undefined && cid !== null && cid !== '') {
    if (typeof cid !== 'string' || !CONTENT_ID_RE.test(cid.trim()))
      findings.push(f(checkId, 'error', `${label}.content_id '${String(cid).slice(0, 40)}' is not a content id: a part of a document is named by the 64-character lowercase hexadecimal address this record mints for it, and nothing shorter or longer can be one`,
        ['copy the content id from the part as this record answers for it',
         'or describe the part instead — extent_kind and its fields — and the record will find or mint the entry']));
    else if (legHasAuthoredExtent(leg))
      findings.push(f(checkId, 'error', `${label} names BOTH a content_id and an extent: these are one fact written twice and they can disagree, which would leave the record holding two answers to what this leg rests on`,
        ['keep the content_id — it names the part exactly',
         'or keep the extent fields and drop content_id — the record finds or mints the part they describe']));
  }
}

export function checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry) {
  const legs = fm?.basis;
  /* R4 (K766, K775 (1)): the VERSION block is no longer called from here. It is `basis-versions`' own grammar (its
     R43), registered into the C-2.8 slot after this module and run at the sub-slot `checkInquiryExtension` offers
     (`rest()`, R6), exactly where this call stood: after the entry, division and subject-entity findings, before the
     grounds and the legs below. A caller that runs this function alone and wants the version rules runs
     `basis-versions`' grammar beside it. */
  /* REC-42: the grounds block is checked EVEN WITH NO BASIS. No basis is a
     legal open inquiry (DEC-22's standing objective), but a grounds[] block
     over no legs asserts independent sufficiency for nothing, and leaving it
     unchecked here would make "author the structure first" a way to leave an
     assertion in the record with nothing under it. */
  /* R11 (N522): a references[] entry naming an imported finding reference is refused, whatever the legs; such a leg's
     target is not a reference, so C-6.3 never asks it. Raised before the legs, so it holds for an inquiry with none. */
  importedReferenceFindings(fm, findings);
  if (legs === undefined || legs === null) { checkGrounds(fm, [], findings); return; }
  if (!Array.isArray(legs)) {
    findings.push(f('C-2.8', 'error', `basis is not an array`));
    return;
  }
  const refTargets = new Set((Array.isArray(fm.references) ? fm.references : [])
    .filter((r) => r && typeof r === 'object' && typeof r.target === 'string')
    .map((r) => r.target));
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (typeof leg !== 'object' || leg === null) {
      findings.push(f('C-2.8', 'error', `basis[${i}] is not an object`));
      continue;
    }
    /* MK-4 / C-54.1: a LEAD is refused BY NAME before the generic target grammar
       can answer "not a canonical record id" about it — see `leadLegFindings`. */
    if (leadLegFindings(`basis[${i}]`, leg, findings)) continue;
    /* D-162 / C-81.1: a THEME, or membership in one, is refused BY NAME at the same door (§8.4 fence 4). */
    if (themeLegFindings(`basis[${i}]`, leg, findings)) continue;
    /* R11 (N522): a leg on another group's finding is judged by its own arm IN PLACE OF the target arm below; role,
       note and grounds are asked as of any leg. The grade, axis, source, hunch, testimony, earned, inherited and
       extent arms stay silent: every field they judge is already one C-21.3 departure on such a leg, and a second
       complaint about one broken field helps nobody. */
    if (importedLegFindings(`basis[${i}]`, leg, findings)) {
      if (!BASIS_ROLES.includes(leg.role)) {
        findings.push(f('C-2.8', 'error', `basis[${i}].role '${leg.role}' is not one of: ${BASIS_ROLES.join(', ')}`));
      }
      if (leg.note !== undefined && leg.note !== null && typeof leg.note !== 'string') {
        findings.push(f('C-2.8', 'error', `basis[${i}].note is not a string`));
      }
      continue;
    }
    const t = leg.target;
    /* Hoisted out of the else below by REC-31: the capture-axis arm at the end
       of this loop asks the SAME question (what does this leg rest on), and a
       second derivation of it here would be a second answer waiting to
       disagree. Null while the target is unusable, so the arm below stays
       silent rather than adding a second complaint about one broken leg. */
    let targetType = null;
    if (typeof t !== 'string' || !BUNDLE_ID_RE.test(t)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].target '${String(t).slice(0, 40)}' is not a canonical record id`));
    } else {
      const tt = targetType = normalizeType(OBJECT_TYPES[t.split('-')[0]]);
      if (tt !== 'information' && tt !== 'inquiry') {
        findings.push(f('C-2.8', 'error', `basis[${i}].target '${t}' is a ${tt}: a leg rests on information or on another inquiry, nothing else`));
      } else if (!refTargets.has(t)) {
        /* C-6.3 (the arm that replaced elevated_into): refs and inquiry_basis
           are projections of this one document and must not disagree. */
        findings.push(f('C-6.3', 'error', `basis[${i}].target '${t}' is not in references[]: an inquiry carrying a basis leg carries the same target as a reference, so the two projections cannot disagree`,
          [`add a references[] entry for '${t}'`, 'remove the basis leg']));
      }
    }
    if (!BASIS_ROLES.includes(leg.role)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].role '${leg.role}' is not one of: ${BASIS_ROLES.join(', ')}`));
    }
    const graded = leg.grade !== undefined && leg.grade !== null;
    if (graded && !BASIS_GRADES.includes(leg.grade)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade '${leg.grade}' is not one of: ${BASIS_GRADES.join(', ')} (absent or null means undetermined, and is stated as such)`));
    }
    if (leg.grade_axis !== undefined && leg.grade_axis !== null && !GRADE_AXES.includes(leg.grade_axis)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade_axis '${leg.grade_axis}' is not one of: ${GRADE_AXES.join(', ')}`));
    }
    if (leg.grade_source !== undefined && leg.grade_source !== null && !GRADE_SOURCES.includes(leg.grade_source)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].grade_source '${leg.grade_source}' is not one of: ${GRADE_SOURCES.join(', ')}`));
    }
    if (graded) {
      if (!GRADE_AXES.includes(leg.grade_axis)) {
        /* MK-2: the axes are LISTED from the vocabulary rather than typed as a
           pair, so a third one cannot leave this sentence naming two. */
        findings.push(f('C-2.8', 'error', `basis[${i}] carries a grade with no grade_axis: the axis is not derivable from the target, so a graded leg states which axis its grade is on (${GRADE_AXES.join(', ')})`));
      }
      if (!GRADE_SOURCES.includes(leg.grade_source)) {
        findings.push(f('C-2.8', 'error', `basis[${i}] carries a grade with no grade_source: a grade with no account of where it came from is an invented one (${GRADE_SOURCES.join(', ')})`));
      }
    }
    /* REC-31, from REC-12's landing. CAPTURE RANGES OVER DOCUMENTS (DEC-21):
       it measures how directly the record holds the bytes of an information
       object. An inquiry is not a document — it has no capture, no fidelity
       and nothing to have been captured FROM — so a capture-axis grade
       authored on an INQ- leg is a grade about no referent, and the record
       must not hold a strength claim about a thing that cannot have one.
       REFUSED HERE, at the leg's own grammar, which is BOTH gates at once:
       this one function is consulted by the catalog (checkInquiryExtension)
       and by the store's op=promote write path, so a leg like this cannot
       land and cannot audit clean either. Stated as the axis being wrong
       rather than the target: a leg to another inquiry is perfectly gradable
       — on CONNECTION, which is what a leg to an inquiry is an edge of.
       Why refuse rather than derive around it: REC-12's #strengthWalk names
       such a leg not load-bearing on capture, which was the honest reading
       while nothing refused the combination, but the axis was still AUTHORED
       and the derivation was quietly deciding it meant nothing. The
       derivation KEEPS that arm (history is append-only and a replayed
       revision may carry such a row), and this refusal is what stops new
       ones. */
    /* AMENDED AT THE REC-14 MERGE, and it narrows the arm by exactly one case
       rather than softening it. REC-31 wrote this rule when every grade_source
       was an AUTHORED one (resolution, testimony, hunch), and for all three it
       is unconditional: a member asserting a capture grade about an inquiry is
       asserting fidelity for bytes that do not exist. `inherited` did not exist
       then. An INHERITED capture grade is not a claim about the inquiry at all
       — it is the capture axis THAT CASE FROZE over ITS OWN documents when the
       group signed the edition being cited, which ranges over documents exactly
       as DEC-21 requires, and C-21.2 refuses it if it is stronger than the
       frozen value. It is carried on the leg rather than re-derived because a
       leg citing edition 1 must not silently follow edition 2 (DEC-12). So the
       one case where the axis HAS a referent is admitted, and every authored
       one is refused as before. */
    if (leg.grade_axis === 'capture' && targetType === 'inquiry' && leg.grade_source !== 'inherited') {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture-axis grade on an inquiry leg: capture is a property of an information object (DEC-21) and an inquiry is not one, so this grade has no referent`,
        ['grade this leg on the connection axis — a leg to another inquiry is a connection',
         'move the capture grade onto the INFO- leg it is actually about']));
    }
    /* MK-2: THE SAME RULE FOR THE THIRD AXIS, and for REC-31's reason exactly.
       A testimony grade is a fact about an AUTHORED DOCUMENT — whose words these
       bytes are — and an inquiry is not a document, so a testimony grade
       authored on an INQ- leg has no referent. The one case with a referent is
       admitted as it is on capture: an INHERITED testimony axis, which is the
       axis a published case froze over its own documents (checkInheritedLeg). */
    if (leg.grade_axis === 'testimony' && targetType === 'inquiry' && leg.grade_source !== 'inherited') {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony-axis grade on an inquiry leg: testimony is a property of a member's authored observation, which is a document, and an inquiry is not one, so this grade has no referent`,
        ['rest this leg on the observation itself (its INFO- id)',
         'or grade this leg on the connection axis — a leg to another inquiry is a connection'],
        'testimony-axis-no-referent'));
    }
    /* REC-18: THE CAPTURE AXIS IS NEVER AUTHORED, and this arm is what closes
       it. Together with checkEarnedLeg's axis pairing (which refuses
       `resolution` here, because a resolution is a §8.1 CONNECTION grade), the
       capture axis now admits exactly two sources: `capture`, EARNED from the
       capture record, and `inherited`, taken from a published case's frozen
       capture axis. Neither is a member's assertion.
       WHY THE AUTHORED SOURCES ARE REFUSED RATHER THAN TOLERATED. A capture
       grade states HOW THE BYTES REACHED US (SB-EVIDENCE 602-607) — a fact
       about this record's own machinery, which the record holds and a member
       does not. Testimony is a member's account of a CONNECTION they can vouch
       for; a hunch is a member's provisional CONNECTION. Neither can be an
       account of a fetch. Left tolerated, the one thing this record must never
       do — claim more than it can support — was a member typing `A` beside a
       document, against the landed doctrine that grade A is not reachable at
       all here (CAPTURE-FIDELITY.md; index.mjs's own capture note). */
    if (leg.grade_axis === 'capture' && graded
        && (leg.grade_source === 'testimony' || leg.grade_source === 'hunch')) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture-axis grade with grade_source '${leg.grade_source}': a capture grade says how the BYTES REACHED US, which is a fact this record holds about its own machinery and not one a member can assert. ${leg.grade_source === 'testimony' ? 'Testimony is a member\'s account of a connection' : 'A hunch is a member\'s provisional connection'}, and neither is an account of a fetch`,
        ['use grade_source: capture — the capture axis is EARNED from the capture record, and op=earnedbasis says what it earns',
         'or move this grade onto the connection axis, where testimony and hunches belong']));
    }
    if (leg.grade_source === 'hunch') {
      if (typeof leg.author !== 'string' || leg.author.trim() === '') {
        findings.push(f('C-2.8', 'error', `basis[${i}] is a hunch with no author: a hunch is declared bias and carries the name of the member declaring it (DEC-15)`));
      }
      if (!DATE_RE.test(String(leg.date ?? ''))) {
        findings.push(f('C-2.8', 'error', `basis[${i}] is a hunch with no date: a hunch is temporary by construction and carries the date it was declared, YYYY-MM-DD (DEC-15)`));
      }
    }
    /* MK-2: SILENT ON THE TESTIMONY AXIS, where checkTestimonyLeg refuses the
       same letter BY NAME and says why in the axis's own terms — a second
       complaint about one broken leg helps nobody. The rule is unchanged: the
       letter is TESTIMONY_GRADE on every axis a testimony can sit on. */
    if (leg.grade_source === 'testimony' && graded && leg.grade !== TESTIMONY_GRADE
        && leg.grade_axis !== 'testimony') {
      findings.push(f('C-2.8', 'error', `basis[${i}] states testimony at grade ${leg.grade}: a member's testimony is grade ${TESTIMONY_GRADE} at no other value — a hunch is the only authored grade permitted above ${TESTIMONY_GRADE} (DEC-15)`));
    }
    /* REC-18, the OTHER half of the same rule and it is what makes "always D"
       mean something. The arm above refuses a testimony leg that states A/B/C;
       this one refuses a testimony leg that states NOTHING. A grade_source with
       no grade claims to account for a grade that is not there, and for
       testimony it is worse than incoherent: the leg would sit in the record
       carrying a member's name and date beside no assertion, which reads as an
       ungraded (INERT, DEC-18) leg while looking like an act. `inherited` has
       been refused for exactly this since REC-14 (checkInheritedLeg below);
       this extends the same refusal to the two sources that can stand alone.
       An honestly undetermined leg states NO grade AND NO grade_source. */
    if ((leg.grade_source === 'testimony' || EARNED_GRADE_SOURCES.includes(leg.grade_source)) && !graded) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${leg.grade_source}' with no grade: a source is an account of where a grade came from, and there is no grade here to account for`,
        ['state the grade this source produced', `or drop grade_source — an undetermined leg states neither, and is read as present and not yet load-bearing (DEC-18)`]));
    }
    if (leg.note !== undefined && leg.note !== null && typeof leg.note !== 'string') {
      findings.push(f('C-2.8', 'error', `basis[${i}].note is not a string`));
    }
    /* REC-84 / IC-84 (1): THE EXTENT, at C-2.8 and through the ONE checker. The
       bundle-id target grammar above is KEPT exactly as it was — the leg still
       names a document or another question — and this adds WHICH PART of it.
       Run unconditionally, including on a leg whose target was refused above: an
       extent is a fact about the leg's own bytes and does not need the target to
       resolve, and a member who typed `extent_kind: pdf-pge` should be told so
       in the same pass rather than on the next one. */
    checkLegExtentGrammar(leg, `basis[${i}]`, 'C-2.8', findings);
    /* MK-2: BEFORE checkEarnedLeg, so a capture letter on an authored
       observation is refused BY NAME as what it is, rather than as a generic
       undetermined capture — and checkEarnedLeg stays silent on that one case. */
    checkTestimonyLeg(leg, i, graded, targetType, earnedRegistry, findings);
    checkEarnedLeg(leg, i, graded, targetType, earnedRegistry, findings);
    checkInheritedLeg(leg, i, graded, publishedRegistry, findings);
  }
  checkGrounds(fm, legs, findings);
}

/** REC-42 / DEC-32: THE RELATIONSHIP BETWEEN LEGS, and the act that asserts it.
 *
 *  Bob ruled the arithmetic: *"sometimes the weakest is the claim's strength,
 *  and other times it's not. The difference is really whether the relationship
 *  between legs is AND or OR."* So a leg may name a GROUND, legs sharing a
 *  ground are AND-related (the ground is no stronger than its weakest leg), and
 *  the grounds are OR-related (the finding is as strong as its STRONGEST
 *  ground, because each is independently sufficient for the same conclusion).
 *
 *  THIS FUNCTION EXISTS BECAUSE OR TAKES THE MAXIMUM. Every other grammar arm
 *  in this file guards a claim that can only be as strong as what it rests on;
 *  a ground label is the one thing a member can write that makes a finding
 *  STRONGER. DEC-32's anti-gaming keystone is therefore a correctness
 *  requirement rather than a preference: **an unstructured basis stays
 *  weakest-leg, and independent sufficiency is only ever reached by an
 *  AFFIRMATIVE, ATTRIBUTED act.** Hence the `grounds[]` block — one row per
 *  label, carrying the NAME of the member who asserts that ground stands on its
 *  own and the DATE they asserted it, which is the same accountability shape as
 *  the conclusion itself. A label with no row is refused: strengthening by
 *  omission, by default, or by a member not understanding a question is exactly
 *  what must be impossible.
 *
 *  TWO TOP-LEVEL KEYS, forced by the restricted frontmatter grammar rather than
 *  chosen: `ground` is a scalar ON THE LEG (the partition) and `grounds` is an
 *  array of objects (the act), because the grammar cannot carry a map holding an
 *  array of objects. Exactly REC-14's `completeness`/`completeness_excluded` and
 *  REC-16's `division`/`division_apportionment` split, for the same reason.
 *
 *  THE PARTITION IS TOTAL OR ABSENT. If ANY leg names a ground, EVERY leg
 *  must. A half-labelled basis would leave legs nobody grouped sitting beside
 *  branches somebody did, and the honest reading of an unlabelled leg —
 *  necessary, so binding on every branch — is not what a member who labelled
 *  half a basis is likely to have meant. Refused here rather than guessed. (The
 *  derivation still treats an unlabelled leg as NECESSARY if one ever reaches it
 *  around this gate; the arithmetic's default is AND too, and the two defences
 *  are separate on purpose.)
 *
 *  WHAT IS DELIBERATELY NOT HERE. No per-ground FALSIFIER: DEC-32 is explicit
 *  that minting one per ground reads as more honest and is less — it converts
 *  one checkable compound falsifier (*every ground fails*) into several partial
 *  ones, none of which refutes the finding. No per-ground grade: a ground's
 *  strength is DERIVED from its legs and never authored. And no AND/OR
 *  vocabulary reaches any member-facing surface — that is UI-27's elicitation
 *  half, which asks the member about CONSEQUENCES and derives this structure
 *  from their answers.
 *
 *  Q14's contradiction case stays SEPARATE and UNDESIGNED: grounds AGREE on the
 *  conclusion, and two conclusions disagreeing is a different thing entirely.
 *  Nothing here should be read as modelling it. */
function checkGrounds(fm, legs, findings) {
  const rows = fm?.grounds;
  const labelled = [];        // [i, label] for every leg that names a ground
  let unlabelled = 0;
  legs.forEach((leg, i) => {
    if (!leg || typeof leg !== 'object') return;
    const g = leg.ground;
    if (g === undefined || g === null || g === '') { unlabelled++; return; }
    if (typeof g !== 'string' || !GROUND_LABEL_RE.test(g)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].ground '${String(g).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_', naming the branch of the argument this leg belongs to`));
      return;
    }
    labelled.push([i, g]);
  });
  if (rows === undefined || rows === null) {
    if (labelled.length) {
      findings.push(f('C-2.8', 'error', `basis leg${labelled.length === 1 ? '' : 's'} ${labelled.map(([i]) => i).join(', ')} name${labelled.length === 1 ? 's' : ''} a ground with no grounds[] block: grounds compose DISJUNCTIVELY, so a finding takes its STRONGEST ground rather than its weakest leg — and that is only ever reached by an affirmative, attributed act. Nothing may become stronger because a field was written and nobody signed for it`,
        ['author a grounds[] row per label, naming the member who asserts that ground is independently sufficient and the date',
         'or drop the ground labels — an unstructured basis is no stronger than its weakest leg, which is the conservative reading']));
    }
    return;
  }
  if (!Array.isArray(rows)) {
    findings.push(f('C-2.8', 'error', 'grounds is not an array'));
    return;
  }
  const declared = new Map();          // label -> row index
  rows.forEach((r, i) => {
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] is not an object`));
      return;
    }
    const label = r.ground;
    if (typeof label !== 'string' || !GROUND_LABEL_RE.test(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}].ground '${String(label).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_'`));
      return;
    }
    if (declared.has(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] declares '${label}' a second time: one ground, one assertion, one member answering for it`));
      return;
    }
    declared.set(label, i);
    /* REC-46 — THE SITE THE ITEM WAS ROUTED FOR. This asked the word list
       alone, so `token:member` (and `class:member`) reached the record here
       while `agent` was refused. It now asks the one predicate, and so does
       every other site that asks the same question.

       DEC-65's SINGLE-PART LICENCE STOPS ONE LEVEL UP, AND THIS IS A CLOSURE
       DECIDED RATHER THAN A SITE MISSED (PL-19, 2026-08-09). C-25.6 —
       `basisVersionFindings`, the identical question over a VERSION's ground
       rows — now accepts PL-17's explicit no-claim value on a version declaring
       exactly one part, because a MACHINE composes versions and would otherwise
       have to sign a member's name to one. THIS block governs the INQUIRY's own
       `grounds[]`, and it has NO machine writer to protect: `inquiry`'s
       `#ground` is the only act that writes these rows and it refuses a
       machine credential OUTRIGHT, before anything else, inside its own DEC-49
       region (`MACHINE_CANNOT_GROUND`, REC-64 / C-32.8). MEASURED at that op,
       not assumed from this file.
       So there is nothing here for the third state to keep honest, and admitting
       it would widen what the record may hold for a population that cannot
       produce it — which is the quiet widening DEC-65's own licence and PL-17's
       delegation both warn against. If a machine writer ever reaches these rows,
       THAT is when this arm earns the same treatment. */
    if (typeof r.asserted_by !== 'string' || r.asserted_by.trim() === ''
        || isMachineIdentity(r.asserted_by)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}].asserted_by '${r.asserted_by}' is not a named member: "these legs are enough on their own" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it — never a machine's`,
        ['name the member asserting that this ground is independently sufficient']));
    }
    if (!ISO_TS_RE.test(String(r.at || ''))) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] requires 'at' as an ISO timestamp (got '${r.at}'): the assertion is dated because a structure authored after a strength was seen is a different act from one authored before it (DEC-32), and only a date lets a reader tell`));
    }
    if (r.statement !== undefined && r.statement !== null && typeof r.statement !== 'string') {
      findings.push(f('C-2.8', 'error', `grounds[${i}].statement is not a string`));
    }
  });
  /* THE PARTITION IS TOTAL OR ABSENT. */
  if (labelled.length && unlabelled) {
    findings.push(f('C-2.8', 'error', `${unlabelled} basis leg${unlabelled === 1 ? '' : 's'} carr${unlabelled === 1 ? 'ies' : 'y'} no ground while ${labelled.length} do: a basis is grouped WHOLE or not at all, because a leg nobody grouped sitting beside branches somebody did is a relationship the record would have to guess at`,
      ['give every leg a ground — a leg that is needed whatever else holds belongs in every ground, so it is its own single-leg ground only if it alone can carry the conclusion',
       'or remove the grounds and let the basis read as its weakest leg']));
  }
  /* A LABEL WITH NO ASSERTION, and its mirror. */
  for (const [i, label] of labelled) {
    if (!declared.has(label)) {
      findings.push(f('C-2.8', 'error', `basis[${i}].ground '${label}' is not declared in grounds[]: a ground that nobody asserted is independently sufficient cannot be one, and the finding must not take a maximum over a branch no member signed for`,
        [`add a grounds[] row for '${label}' with asserted_by and at`]));
    }
  }
  const carried = new Set(labelled.map(([, l]) => l));
  for (const [label, i] of declared) {
    if (!carried.has(label)) {
      findings.push(f('C-2.8', 'error', `grounds[${i}] declares '${label}', which no basis leg belongs to: a ground is a partition OF THE LEGS, and an empty one asserts that nothing is sufficient on its own`,
        [`give at least one basis leg 'ground: ${label}'`, 'or remove the row']));
    }
  }
}

/** REC-18 / DATA-MODEL D1(b) / DEC-15: THE EARNED RULE, PER AXIS.
 *
 *  A grade a caller can hand us is a grade a caller can invent, and CLAUDE.md
 *  is explicit that such a thing is not evidence. So the two grades the RECORD
 *  can compute for itself are computed by the record, and a leg claiming one
 *  must state the value the record actually holds — refused otherwise, in
 *  EITHER direction. Not "no stronger than", which is `inherited`'s rule and is
 *  right there because DEC-12 gives the member a real choice (which edition to
 *  rest on) and a weaker grade can be an honest consequence of it. There is no
 *  such choice here: an earned grade is a FACT about the record at the moment
 *  of the write, and a leg stating anything else states a non-fact about how it
 *  was established, which is precisely what grade means (SB-EVIDENCE 602-607:
 *  "grade tracks how the bytes reached us, never how credible the document is").
 *
 *  THE SPLIT THIS ENFORCES, and it is the recogniser precedent moved up one
 *  layer (schema.mjs:739-743 — "the RECOGNISER never mints a D; the model holds
 *  it so a member can testify, never the machine"):
 *    - `resolution`  EARNED, connection axis, A/B/C — the strongest resolution
 *                    of that document's captures to the inquiry's SUBJECT
 *                    ENTITY. Never D: a D resolution is itself a member's
 *                    testimony (op=resolvetestify), so a leg resting on one is
 *                    testimony and says so, with its own author and date.
 *    - `capture`     EARNED, capture axis — what the record holds about how the
 *                    bytes arrived. B for a document this instance captured;
 *                    A is not reachable and is refused by name, because a
 *                    chain-of-custody web archive is out of a Worker's reach
 *                    and is not claimed (CAPTURE-FIDELITY.md, R2-e/R2-g).
 *    - `testimony`   a MEMBER'S act, always D, author and date carried.
 *    - `hunch`       a member's act, authored above D, HUNCH DEBT until cleared
 *                    (DEC-15) — and the earned path is what it is cleared INTO.
 *                    D-188: HUNCH debt, not "bias debt". Ordinary bias debt is
 *                    DISCLOSED and travels; the hunch is the kind that refuses
 *                    publication (DEC-20).
 *
 *  THE SUBJECT-ENTITY PRICE IS REAL AND IS STATED (DEC-15). An inquiry that
 *  names no subject entity has no A/B/C available to it on the connection axis.
 *  That is not a gate to be got past by inventing one: the leg states no grade,
 *  the axis suspends and names it (R1), and the case reads as what it is.
 *
 *  AN ABSENT REGISTRY IS NOT A WAY THROUGH, and the posture is checkInheritedLeg's
 *  exactly: the pure checker over a filesystem cannot see `resolutions` or
 *  `register`, so it says so rather than passing the leg. Every path a real
 *  caller has — the ratification gate and the store's own write path — injects
 *  the registry. */
/** MK-2 / D-184 / IC-142: THE TESTIMONY AXIS, AND THE §7 REFUSALS THAT FALL
 *  TO IT (`MEMBER-KNOWLEDGE-DESIGN.md` §3, §7). Every refusal carries a CODE
 *  on its C-2.8 finding — the D-206 discriminator within a rule — so each one
 *  is refused BY NAME and a caller can tell them apart without parsing prose:
 *
 *    testimony-grade-not-d        a testimony-axis grade other than
 *                                 TESTIMONY_GRADE. The ruling is that an
 *                                 observation stands on the observing member's
 *                                 trust, and nothing — a second member's
 *                                 co-signature included — makes it more.
 *    testimony-grade-unearned     a testimony letter other than the one the
 *                                 registry holds for that observation (value
 *                                 mode, resolution's precedent).
 *    testimony-axis-source        a testimony-axis grade whose source is not a
 *                                 testimony (or, on a published case, not
 *                                 inherited): a resolution, a capture or a hunch
 *                                 is an account of something else.
 *    testimony-axis-unconfirmable the checker cannot read the register, so it
 *                                 cannot confirm the target IS an observation
 *                                 (checkEarnedLeg's posture: an absent registry
 *                                 is not a way through).
 *    testimony-axis-not-authored  the target is not a member's authored
 *                                 observation. A publisher's document graded
 *                                 as testimony would be a captured source
 *                                 passing for a member's word — the other
 *                                 direction of the confusion §2 forbids.
 *    testimony-leg-capture-graded ANY capture-axis grade on a leg citing an
 *                                 authored observation, whatever its source:
 *                                 the capture axis measures reading a document
 *                                 in (DEC-21), which did not happen, and an A
 *                                 would be true of the bytes and read as
 *                                 strength the observation does not have.
 *
 *  WHAT DECIDES "AUTHORED" is the registry's `testimony` map, which
 *  `earnedBasisRegistry` builds from the REGISTER's `authored` flag — a flag
 *  only `op=testify` can set (C-53.8). Never the leg, never the document: a
 *  caller cannot make a target an observation by saying so.
 *
 *  WHAT IS DELIBERATELY NOT REFUSED: a CONNECTION-axis grade on a leg citing an
 *  observation. §7 does not list it, and §3 now RULES it (BOB #15, 2026-09-18,
 *  answering the design gap MK-2 named): a leg on an observation carries a
 *  connection grade graded exactly as any leg's, neither refused nor exempt —
 *  testimony says WHOSE WORD, connection says HOW DIRECTLY it bears, and with
 *  capture not applicable a refused connection grade would leave the leg
 *  invisible to the bar. This module's R4 test of a connection grade on an
 *  observation (`test/m/inquiry-grammar/grammar.test.mjs`) proves it. */
function checkTestimonyLeg(leg, i, graded, targetType, registry, findings) {
  if (!graded) return;
  const target = typeof leg.target === 'string' ? leg.target : null;
  const observation = registry && registry.earned && registry.earned.testimony && target
    ? registry.earned.testimony[target] || null : null;
  if (leg.grade_axis === 'capture' && targetType === 'information' && observation) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a capture grade of ${leg.grade} for ${target}, which is a member's authored observation: the capture axis measures the act of reading a document in, and nobody read these words in from anywhere — they are the member's own. Its grade is testimony, ${observation.grade}, on the testimony axis, and its capture axis is not applicable`,
      [`grade basis[${i}] on the testimony axis — grade_axis: testimony, grade: ${observation.grade}, grade_source: testimony`,
       `or state no grade on basis[${i}] — the leg stays in the basis, present and not yet load-bearing`],
      'testimony-leg-capture-graded'));
    return;
  }
  if (leg.grade_axis !== 'testimony') return;
  if (leg.grade !== TESTIMONY_GRADE) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade}: a member's firsthand observation is graded ${TESTIMONY_GRADE} on the testimony axis and at no other value. It stands on the observing member's trust, and nothing raises it — a second member agreeing with it is a co-signature, not a second observation (a second member who saw the same thing records their own, and the case then rests on two testimonies, each ${TESTIMONY_GRADE})`,
      [`state grade: ${TESTIMONY_GRADE} on basis[${i}]`],
      'testimony-grade-not-d'));
    return;
  }
  /* A published case's frozen testimony axis is inherited like any other, and
     checkInheritedLeg compares it; the no-referent arm above already refused a
     non-inherited testimony grade on an inquiry leg. */
  if (leg.grade_source === 'inherited' || targetType === 'inquiry') return;
  if (leg.grade_source !== 'testimony') {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony-axis grade with grade_source '${leg.grade_source}': a testimony grade comes from a member's own authored observation and from nothing else — a resolution, a capture or a hunch is an account of something other than whose word this is`,
      [`set grade_source: testimony on basis[${i}]`],
      'testimony-axis-source'));
    return;
  }
  if (!registry) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade for ${target}, but whether that document IS a member's authored observation is held by the register, which cannot be read here: a document is an observation because the act that records one wrote it, never because a leg says so`,
      ['run this through the ratification gate or op=promote, which read the record'],
      'testimony-axis-unconfirmable'));
    return;
  }
  if (!observation) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade for ${target}, which is not a member's authored observation: the testimony axis grades whose word a document is, and this one's bytes were captured, not authored here. Grading it as testimony would let a captured source pass for a member's own word`,
      [`grade basis[${i}] on the capture axis, which is what a captured document's grade measures`,
       'or, if this is your own firsthand knowledge, record it as an observation (op=testify) and cite that'],
      'testimony-axis-not-authored'));
    return;
  }
  /* mode 'value', on resolution's precedent: the record HOLDS the letter, so
     the leg states that letter and no other. Compared against the REGISTRY's
     answer rather than against the constant alone, so the registry is the one
     authority for what a target earns on this axis and the arm that lets an
     attestation move it is caught at the write. */
  if (leg.grade !== observation.grade) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states a testimony grade of ${leg.grade} for ${target}, but the record holds ${observation.grade} for it. ${observation.why ?? ''}`.trimEnd(),
      [`state grade: ${observation.grade} on basis[${i}]`],
      'testimony-grade-unearned'));
  }
}

function checkEarnedLeg(leg, i, graded, targetType, registry, findings) {
  const src = leg.grade_source;
  if (!EARNED_GRADE_SOURCES.includes(src)) return;
  /* The no-grade case already produced its own finding in the loop above; a
     second complaint about one broken leg helps nobody. */
  if (!graded) return;
  if (!registry) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${src}' but the record it would be earned from cannot be read here: an earned grade is computed by the record and is never taken from a caller, so it cannot be confirmed by a checker that can only see this one record`,
      ['run this through the ratification gate or op=promote, which read the record',
       'or state the grade as testimony (grade D, with an author and a date) if it is a member\'s account']));
    return;
  }
  const wantAxis = EARNED_SOURCE_AXIS[src];
  /* REC-31's arm already refuses a capture-axis grade on an inquiry leg and says
     it better (the axis has no referent, which is the deeper fault). Silent here
     rather than adding a second complaint about one broken leg — the same
     discipline the loop above takes with an unusable target. */
  if (leg.grade_axis === 'capture' && targetType === 'inquiry' && src !== 'capture') return;
  if (leg.grade_axis !== wantAxis) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source '${src}' on the ${leg.grade_axis} axis: ${src === 'resolution' ? 'a resolution IS the framework\'s §8.1 connection grade and grades nothing else' : 'a capture grade is a property of an information object and measures how the bytes arrived (DEC-21)'}, so it can only be a source for a ${wantAxis} grade`,
      [`set grade_axis: ${wantAxis} on basis[${i}]`,
       `or state where this ${leg.grade_axis}-axis grade actually came from`]));
    return;
  }
  /* A leg to another INQUIRY earns nothing: an inquiry has no captures and no
     resolutions, so there is no record fact to compute from. Stated for
     `resolution` only — the capture-axis-on-an-inquiry case already has its own
     finding above (REC-31's arm), and it says the same thing better. */
  if (src === 'resolution' && targetType === 'inquiry') {
    findings.push(f('C-2.8', 'error', `basis[${i}] claims an EARNED resolution grade on an inquiry leg: a resolution matches a captured document's reading to a registry entity, and an inquiry is not a captured document — there is nothing here for the recogniser to have graded`,
      ['rest this leg on the INFO- document that carries the reference',
       'or, if the target is a published case, inherit its frozen connection grade (grade_source: inherited)']));
    return;
  }
  if (src === 'resolution' && !registry.subject_entity) {
    findings.push(f('C-2.8', 'error', `basis[${i}] claims an EARNED resolution grade, but this inquiry names no subject_entity: an earned connection grade is the strongest resolution of the target's captures TO THE INQUIRY'S SUBJECT, and with no subject named there is nothing to have resolved to (DATA-MODEL D1(b))`,
      ['add subject_entity: ENT-YYYY-NNNN naming the registry entry this question is about',
       'or state no grade at all — an inquiry with no subject entity has no A/B/C available to it, and that is honest (DEC-15)']));
    return;
  }
  const earned = registry.earned && registry.earned[wantAxis]
    ? registry.earned[wantAxis][leg.target] : null;
  /* REC-88 / D-349 · THE UNDETERMINED BOUND, AND IT IS A DIFFERENT FACT FROM AN
     ABSENT ENTRY — which is why it is judged BEFORE the branch below.
     *
     * The capture axis is bounded by the weakest link of byte provenance and
     * transcription fidelity, with no third scale (DEC-4, framework Part II
     * Appendix A.1). A document whose text a machine derived, where no step of
     * that derivation carries a measured fidelity, has a bound of UNDETERMINED
     * — `captureBound` answers null rather than passing the byte grade through,
     * deliberately, so an unmeasured engine's output cannot ride a direct
     * capture's B.
     *
     * THE ENTRY IS PRESENT WITH A NULL GRADE AND THE BRANCH BELOW WOULD SAY THE
     * WRONG THING. Its sentence is "the record holds no registered capture for
     * that document: there are no bytes here" — false here, and falsely
     * actionable: it would send a member to go capture a document the record
     * already holds, when what is missing is a FIDELITY MEASUREMENT of a
     * transcription it already has. The record naming the wrong empty level is
     * the failure CLAUDE.md's "sparse is the normal condition at every level"
     * paragraph exists about.
     *
     * AND THE LEG IS NOT REFUSED FOR BEING UNMEASURED — it is refused for
     * CLAIMING A LETTER. An unmeasured transcription is undetermined and
     * STATED; a leg stating no capture grade at all is legal, suspends the axis
     * and names it, and never reaches this function at all (the `graded` guard
     * above returns first). That is the gate not pressuring anyone into
     * inventing an attribution. */
  /* MK-2: A MEMBER'S AUTHORED OBSERVATION IS REFUSED BY NAME IN
     checkTestimonyLeg, which runs first and says what the document IS and
     which axis its grade belongs on. Silent here, for the one cause and only
     for it — the MK-1 repair list this branch used to carry for it (no
     transcription to measure) moved with the refusal. */
  if (earned && earned.undetermined_because === 'CAPTURE_AXIS_AUTHORED') return;
  if (earned && earned.mode === 'ceiling' && earned.grade == null) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states an EARNED capture grade of ${leg.grade} for ${leg.target}, but what that document's capture can support is UNDETERMINED, not ${leg.grade}. ${earned.why ?? ''}`,
      [`state NO capture grade on basis[${i}] — an undetermined axis is stated, not filled in, and the leg stays in the basis naming what it rests on`,
       'or have the transcription measured (the MEASUREMENTS ledger, per engine, per version) and state the letter the record then earns',
       'or state this leg as testimony (grade D, with an author and a date) if it is a member\'s own account']));
    return;
  }
  if (!earned || !earned.grade) {
    findings.push(f('C-2.8', 'error', src === 'resolution'
      ? `basis[${i}] states an EARNED resolution grade of ${leg.grade} for ${leg.target}, but the record holds no A/B/C resolution of that document to ${registry.subject_entity}: nothing was earned here. The recogniser never mints a D, so a document known to concern the subject only by a member's testimony earns nothing either — that leg is testimony and says so`
      : `basis[${i}] states an EARNED capture grade of ${leg.grade} for ${leg.target}, but the record holds no registered capture for that document: there are no bytes here whose arrival this grade could be measuring`,
      src === 'resolution'
        ? ['resolve the document to the subject with op=resolve, then state the grade it earned',
           'or state this leg as testimony (grade D, with an author and a date)']
        : ['state no capture grade — an uncaptured document is undetermined on the capture axis, and undetermined is stated (CLAUDE.md)']));
    return;
  }
  /* TWO COMPARISONS, because the record holds two DIFFERENT KINDS OF FACT and
     pretending otherwise would be the laundering this rule exists to stop.
     - mode 'value' (the CONNECTION axis): `resolutions` holds the grade itself,
       so the leg must state THAT VALUE and nothing else, in either direction. A
       weaker letter is not modesty, it is a false statement about how the leg
       was established, which is exactly what a grade means.
     - mode 'ceiling' (the CAPTURE axis): the record holds whether it has bytes
       for this document and what the STRONGEST capture this plane can produce is
       worth — it does NOT hold a per-document capture grade, because no such
       column exists. So the rule is the honest half: no leg may claim MORE than
       the ceiling (which makes grade A structurally unreachable, per the
       doctrine), and a weaker grade is admitted as the member's account of a
       poorer route. The residual — that B-or-weaker is still authored — is
       stated as debt rather than hidden behind a comparison that looks stricter
       than the record can support.
     *
     * REC-88 / D-349: THE COMPARISON BELOW DID NOT CHANGE AND ITS REACH DID.
     * Until this item the ceiling was `EARNED_CAPTURE_CEILING` for every
     * document the record held bytes of, so this arm could only ever refuse a
     * grade A. The registry now bounds that ceiling by TRANSCRIPTION FIDELITY
     * (DEC-4's weakest link, computed by `captureBound` and by nothing here),
     * so the very same line now refuses a B on a document this plane OCR'd at
     * C. That is the point: the rule was always "no leg may claim more than the
     * record can earn", and what moved is what the record admits it can earn.
     * `earned.why` carries the reason and is composed where the bound is
     * computed, so the sentence a member reads names the engine's measured
     * fidelity rather than this file guessing at it. */
  if (earned.mode === 'ceiling') {
    if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(earned.grade)) {
      findings.push(f('C-2.8', 'error', `basis[${i}] states a capture grade of ${leg.grade} for ${leg.target}, which is STRONGER than the ${earned.grade} the record can earn for it. ${earned.why} ${earned.ceiling ?? ''}`,
        [`state grade: ${earned.grade} or weaker on basis[${i}] — op=earnedbasis answers what each target earns before you write it`]));
    }
    return;
  }
  if (earned.grade !== leg.grade) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states an EARNED ${wantAxis} grade of ${leg.grade} for ${leg.target}, but the record earns ${earned.grade}: an earned grade is computed by the record and a caller does not hand it to us in either direction. ${earned.why}`,
      [`state grade: ${earned.grade} on basis[${i}] — op=earnedbasis answers what each target earns before you write it`]));
  }
}

/** REC-14 / C-21.2: THE INHERITANCE RULE, PER AXIS.
 *
 *  A case built on a case cannot be stronger than the case beneath it. So a
 *  basis leg whose target is a PUBLISHED inquiry carries grade_source
 *  'inherited', NAMES THE EDITION it rests on, and carries a grade no stronger
 *  than that edition's FROZEN strength ON THE SAME AXIS — refused if stronger
 *  on either axis, and the two are compared independently.
 *
 *  PER AXIS IS THE WHOLE OF IT (RECONCILED R2-j). A single scalar comparison
 *  would let a case inherit an A CONNECTION grade from a case whose A was a
 *  CAPTURE grade — two incommensurable measurements over two different
 *  populations, laundered through one letter. The frozen pair is stamped in the
 *  published bytes as two axis OBJECTS for exactly this reason, and the axis
 *  the leg selects is its own recorded grade_axis.
 *
 *  AN UNRATED OR UNDETERMINED AXIS ADMITS NO GRADE AT ALL, and the two say
 *  different things. UNRATED means nothing on that axis was ever established —
 *  a grade inherited from it would be invented outright. UNDETERMINED means the
 *  walk could not finish, so what lies beneath is UNKNOWN rather than absent,
 *  and a grade taken from it would be a claim about material nobody has seen.
 *
 *  THE EDITION DOES NOT SILENTLY FOLLOW (DEC-12). A leg citing edition 1 keeps
 *  citing edition 1 when edition 2 appears; REC-17's re-evaluation obligation
 *  surfaces the newer edition and the MEMBER decides. Nothing recomputes a
 *  strength on their behalf, because the strength was not changed for them. */
function checkInheritedLeg(leg, i, graded, registry, findings) {
  const target = typeof leg.target === 'string' ? leg.target : null;
  /* D-598 (BOB #34, 2026-09-25 03:00Z; BIO_Publication_v0_1.md §3 rule 5): THE RULE IS OVER PUBLISHED
     INQUIRIES ONLY. A document or observation published as a case's EVIDENCE (D-431(b)) froze no strength,
     so it is not a published finding and a leg on it keeps its own grade on its own axis (C-2.8 for
     testimony, the capture grade for a document) — forcing it to `inherited` made every later finding over
     published evidence ungradeable, the record claiming LESS than it can support. An entry with NO
     object_type (a registry built before the key, or a caller's) is held to the inquiry rule: undetermined
     is not evidence. */
  const entry = registry && target ? registry[target] : null;
  const pub = entry && (entry.object_type == null || entry.object_type === 'inquiry') ? entry : null;
  if (leg.grade_source === 'inherited' && !pub) {
    findings.push(f('C-2.8', 'error', `basis[${i}] states grade_source 'inherited' but its target ${registry ? 'is not a published case' : 'cannot be checked against the published record here'}: a grade is inherited from a case the group SIGNED, at a stated edition, and from nothing else`,
      ['cite a published case and name its edition', 'or state where this grade actually came from']));
    return;
  }
  if (!pub) return;                       // not a published target: nothing to inherit
  if (!graded) {
    /* Legal and deliberately so: an ungraded leg is INERT (DEC-18) — present,
       named, not yet load-bearing. What it may not do is CLAIM inheritance,
       because inheriting nothing is not inheritance. */
    if (leg.grade_source === 'inherited') {
      findings.push(f('C-2.8', 'error', `basis[${i}] claims 'inherited' with no grade: a leg resting on a published case may state no grade at all — undetermined, stated — but it may not claim to have inherited one`));
    }
    return;
  }
  if (leg.grade_source !== 'inherited') {
    findings.push(f('C-21.2', 'error', `basis[${i}] carries a grade of its own on a PUBLISHED case (${target}): a leg resting on a published case inherits that case's frozen strength and says so with grade_source 'inherited'. A case built on a case cannot be stronger than the case beneath it`,
      [`set grade_source: inherited and target_edition on basis[${i}]`]));
    return;
  }
  const ed = leg.target_edition;
  if (!Number.isInteger(ed)) {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits from ${target} without naming an edition: every edition is a SEPARATE DOCUMENT with its own frozen strength, so an unnamed edition leaves the inheritance rule nothing fixed to compare against (DEC-12)`,
      [`add target_edition to basis[${i}]`]));
    return;
  }
  const frozen = pub.editions ? pub.editions[String(ed)] : null;
  if (!frozen) {
    findings.push(f('C-21.2', 'error', `basis[${i}] names edition ${ed} of ${target}, which is not in the published record (published editions: ${pub.editions ? Object.keys(pub.editions).join(', ') || 'none' : 'none'})`));
    return;
  }
  const axis = leg.grade_axis;
  /* MK-2: every axis in the vocabulary, not a typed pair — a testimony axis a
     published case froze is inherited on the same per-axis rule, and one an
     older edition never froze reads ABSENT below rather than passing. */
  if (!GRADE_AXES.includes(axis)) return;   // C-2.8 named it already
  const on = frozen[axis];
  if (!on || on.state !== 'graded') {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose ${axis} axis is ${on ? on.state.toUpperCase() : 'ABSENT'}: ${on && on.state === 'unrated' ? 'nothing on that axis was ever established there, so a grade taken from it would be invented outright' : 'what lies beneath is unknown rather than absent, so a grade taken from it would be a claim about material nobody has seen'}`,
      [`state no grade on basis[${i}] — undetermined, stated, is the honest answer`]));
    return;
  }
  if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(on.grade)) {
    findings.push(f('C-21.2', 'error', `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose frozen ${axis} strength is ${on.grade}: a case built on a case cannot be stronger than the case beneath it, and the comparison is PER AXIS — this leg's ${axis} grade against that edition's ${axis} grade, never against a composed letter`,
      [`set basis[${i}].grade to ${on.grade}, the frozen ${axis} strength of that edition`]));
  }
}


/** C-54.1 — ONE LEG, ASKED WHETHER IT RESTS ON A LEAD. The one checker every
 *  leg grammar consults (`checkInquiryBasis`' basis[], the version legs, the
 *  action basis), so the rule has one spelling and three doors. It asks BOTH
 *  fields a leg can name a referent through — the target and the REC-82 content
 *  id — because a lead cited through the second is still a lead cited. Returns
 *  true when it pushed a finding, so the caller skips its own target complaint
 *  about the same leg rather than answering twice with the wrong name. */
export function leadLegFindings(label, leg, findings) {
  const l = leg && typeof leg === 'object' ? leg : {};
  /* The family helper, by name: DEC-49's guard judges `refusal("CODE"` at the site. */
  const refusal = (code, message, repairs) => f(LEAD_CHECKS[code].check, 'error', message, repairs, code);
  /* DEC-49 REGION is-lead-not-evidence */
  for (const field of ['target', 'content_id']) {
    const v = typeof l[field] === 'string' ? l[field].trim() : '';
    if (v && LEAD_ID_RE.test(v)) {
      findings.push(refusal("LEAD_NOT_EVIDENCE",
        `${label}.${field} '${v}' is a LEAD, and a lead is never evidence (MEMBER-KNOWLEDGE-DESIGN.md §5, `
        + `§7): it says where to look, not what was found, so no leg can rest on it`,
        ['follow the lead and cite the document the look captured instead',
         'or, if you saw the thing yourself, author it as your own observation and cite that']));
      return true;
    }
  }
  /* END DEC-49 REGION is-lead-not-evidence */
  return false;
}


/* =====================================================================
 * R11 (N522; DEC-112 (6); DEC-96 items 1, 4) — ANOTHER GROUP'S FINDING, NAMED.
 *
 * A group's finding may rest on a finding of another group's case that the group has accepted. That finding is not a
 * bundle of this record (case-import holds it, late in the order), so it is named by a reference of its own:
 * `imported:<import>/<finding>`, the import's 64-hex id and the finding's id as the source case states it. The prefix
 * is not a bundle prefix, so a ref never collides with a local id, which BUNDLE_ID_RE alone matches.
 *
 * WHAT A LEG ON ONE MAY SAY, AND WHY SO LITTLE. It names the finding and the ONE edition it rests on, and nothing
 * else: the edition's grades stand as published (DEC-96 item 1), so the leg carries no grade of its own to disagree
 * with them, and that edition's own case file is the place its parts are checked, so the leg carries no part either.
 * Whether an acceptance of that edition is in force is not a fact this pure grammar can see: `accepted-work` asks it
 * at the write (its R3, R4). This arm judges only the form.
 * ===================================================================== */

const IMPORT_ID = '[0-9a-f]{64}';
const BUNDLE_BODY = BUNDLE_ID_RE.source.replace(/^\^/, '').replace(/\$$/, '');

/** R11: exactly `imported:<import>/<finding>`; capture 1 is the import, the last capture the finding. */
export const IMPORTED_FINDING_RE = new RegExp(`^imported:(${IMPORT_ID})/(${BUNDLE_BODY})$`);

/** R11: `{import, finding}` for a ref, else null. Never throws. */
export function parseImportedFindingRef(s) {
  if (typeof s !== 'string') return null;
  const m = IMPORTED_FINDING_RE.exec(s);
  return m ? { import: m[1], finding: m[2] } : null;
}

/** R11: the ref spelled from its two parts, or null when they would not spell one IMPORTED_FINDING_RE matches, so
 *  nothing this spells is a ref the grammar refuses. Never throws. */
export function importedFindingRef(importId, finding) {
  if (typeof importId !== 'string' || typeof finding !== 'string') return null;
  const s = `imported:${importId}/${finding}`;
  return IMPORTED_FINDING_RE.test(s) ? s : null;
}

const isRef = (v) => typeof v === 'string' && IMPORTED_FINDING_RE.test(v.trim());
const carries = (v) => v !== undefined && v !== null && v !== '';

/** R11: the leg arm. A leg whose target is a ref gains one C-21.3 error, IMPORTED_LEG_MALFORMED, for each departure,
 *  naming the leg and the field, and the answer is true; any other leg (a non-object read as an empty one) gains
 *  nothing and the answer is false, so the caller runs its own target arm. `checkId` lets a leg grammar at another
 *  grain relabel the rule, as checkLegExtentGrammar does; the code travels. Pure; never throws. */
export function importedLegFindings(label, leg, findings, checkId = INQUIRY_GRAMMAR_CHECKS.IMPORTED_LEG_MALFORMED.check) {
  const l = leg && typeof leg === 'object' ? leg : {};
  if (!isRef(l.target)) return false;
  const ref = l.target.trim();
  const refusal = (message, repairs) => importedRefusal(checkId, message, repairs);
  const ed = l.target_edition;
  if (!Number.isInteger(ed) || ed < 1) {
    findings.push(refusal(`${label}.target_edition '${String(ed).slice(0, 40)}' does not name an edition of ${ref}: a leg on another group's finding names the one edition it rests on, a positive whole number, because each edition is a separate document with its own published grades`,
      [`set ${label}.target_edition to the edition this group accepted`]));
  }
  for (const field of ['grade', 'grade_axis', 'grade_source']) {
    if (carries(l[field])) {
      findings.push(refusal(`${label}.${field} is set on a leg on another group's finding (${ref}): that finding's grades are the ones its edition published, and the leg states none of its own`,
        [`remove ${field} from ${label}`]));
    }
  }
  if (carries(l.content_id)) {
    findings.push(refusal(`${label}.content_id is set on a leg on another group's finding (${ref}): the leg names the finding, and the parts it rests on are checked in that group's own case file`,
      [`remove content_id from ${label}`]));
  }
  if (legHasAuthoredExtent(l)) {
    findings.push(refusal(`${label} names an extent on a leg on another group's finding (${ref}): the leg names the finding, and the parts it rests on are checked in that group's own case file`,
      [`remove the extent fields from ${label}`]));
  }
  if (carries(l.extent_capture)) {
    findings.push(refusal(`${label}.extent_capture is set on a leg on another group's finding (${ref}): no capture of this record holds that finding`,
      [`remove extent_capture from ${label}`]));
  }
  return true;
}

/** R11: the one site the code IMPORTED_LEG_MALFORMED is minted, for the leg arm and the references arm alike: the rule
 *  (`checkId`) is the caller's, the code and its row this module's. */
function importedRefusal(checkId, message, repairs) {
  /* The family helper, by name: DEC-49's guard judges `refusal("CODE"` at the site. */
  const refusal = (code) => f(checkId, 'error', message, repairs, code);
  /* DEC-49 REGION is-imported-leg-form */
  return refusal("IMPORTED_LEG_MALFORMED");
  /* END DEC-49 REGION is-imported-leg-form */
}

/** R11: each references[] entry naming a ref is one C-21.3 error. Such a leg is not a reference (C-6.3 does not ask
 *  it), so an entry naming one would make the published graph claim an edge into another group's case. */
function importedReferenceFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== 'object' || !isRef(r.target)) return;
    findings.push(importedRefusal(INQUIRY_GRAMMAR_CHECKS.IMPORTED_LEG_MALFORMED.check,
      `references[${i}].target names another group's finding (${r.target.trim()}): a leg on it is not a reference, so references[] does not list it`,
      [`remove references[${i}]; the basis leg alone names that finding`]));
  });
}

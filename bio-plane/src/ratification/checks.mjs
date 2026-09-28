/* ratification — the case-document catalogue, the case-member arm of C-2.8, and the refusal rows the two
 * ceremonies answer (requirements: `build/requirements/ratification.md`, R8, R9, R14). DEC-49: every refusal this module
 * answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue (`legacy-checks`, K6, K94) with their ids, texts and translations unchanged:
 * `caseEditionClaimed`, `isCaseMemberBytes` (legacy-checks keeps its own copy for C-3.1's heading rule, Decided 6),
 * `SUBJECT_POSITIONS`, `CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension`
 * (C-2.8's case-member arm), `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` (C-41.1–C-41.15),
 * `CASE_CITATION_VERSIONS`, `checkCaseDocument`; the rows C-32.12–C-32.15, C-53.10–C-53.12, C-58.1–C-58.3, C-65.1 and
 * C-92.10–C-92.12. A row's `where` names the region in this module that mints it. The case-document formats and their
 * three predicates are `publication`'s (its R20). The legacy code's comments moved with it. */

import { ISO_TS_RE, BUNDLE_ID_RE, BASIS_GRADES, GRADE_AXES, STRENGTH_STATES } from "../../checks/bio-checks.mjs";
import { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY, CASE_DOCUMENT_FORMATS_ACCEPTED,
         caseDocumentStatesMemberBlocks, caseDocumentRequiresDisclosures,
         caseDocumentRequiresV4Disclosures } from "../publication/index.mjs";

/* The catalogue's finding shape (`{check, severity, message, repairable?, repairs?, code?}`), so a finding from here
   reads exactly as one from `legacy-checks`. */
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  if (code) out.code = code;
  return out;
}

/* ===========================================================================
 * THE CASE RELATION IN A DOCUMENT'S OWN BYTES, AND THE CASE-MEMBER ARM OF C-2.8 (R9)
 * ========================================================================= */

/** CASE-4 / DEC-72: THE CASE RELATION AS A DOCUMENT'S OWN BYTES CARRY IT.
 *
 * One predicate, exported, so the catalog's several "is this published" sites
 * cannot drift apart — the same reason DISPOSITIONS and REOPENABLE_FROM live in
 * one array each. `case_id` is the field REC-44 put inside the bytes the member
 * SIGNS precisely so a stranger holding one document can read which case it
 * belongs to without contacting this instance, which is what makes it the right
 * field to ask: the relation is inside the signature, exactly as the state word
 * used to be, and nothing here reads a table.
 *
 * The `'null'` guard is not decoration: `#setOrAddScalar` writes the STRING
 * "null" for an absent value, and publishCase()'s own case-identity resolution
 * already excludes it by name at store.mjs. Two readers of one convention that
 * disagreed about it would be the drift this file exists to prevent.
 *
 * IT IS THE PAIR AND NOT `case_id` ALONE, AND THAT WAS MEASURED RATHER THAN
 * preferred. `case_id` alone is what a document carries FOREVER after its first
 * publication — `op=reopen` deliberately leaves it, so `publishCase()` can
 * re-derive which case a second edition belongs to without taking an identity
 * from a caller. Keying on it alone therefore makes a REOPENED working document
 * read as a case member and drags the entire published ceremony onto a document
 * that is back in `open` being worked — a gate firing where the record says the
 * group is allowed to be mid-thought. The pair is the assertion: `case_edition`
 * is written by `publishCase()` and CLEARED by `op=reopen`, so "these bytes
 * claim to be a member of a specific edition of a specific case" is exactly what
 * the two of them together say, and it is true of precisely the documents that
 * used to say `current_state: published`.
 *
 * WHEN CASE-5b LANDS, THIS IS THE FIELD PAIR THAT MOVES. CASE-5b removes
 * `case_id` and friends from finding bytes once there is a case-level signing
 * ceremony for those facts to move to. This predicate is where that change
 * arrives, and it is ONE function rather than six inlined field reads for that
 * reason. */
/* CASE-5b / DEC-72, 2026-09-10 — AND THIS IS THE CHANGE THE COMMENT ABOVE SAID
 * WOULD ARRIVE HERE, ARRIVING. It is ONE function and not six inlined field
 * reads for exactly this turn.
 *
 * WHY THE OLD PREDICATE WAS RIGHT AND IS NOW WRONG, stated rather than deleted.
 * It keyed on `(case_id, case_edition)` because those were the facts op=publish
 * stamped into every member's signed bytes, and because a REOPENED document
 * keeps `case_id` while losing `case_edition` — so the PAIR, and not `case_id`
 * alone, was what distinguished "these bytes claim membership of a specific
 * edition of a specific case" from "this document was published once and is
 * back in `open` being worked". Every word of that was true of the format as it
 * stood. CASE-5b deletes both fields from finding bytes: the case's own
 * assertions now live in a CASE DOCUMENT a member signs, which is where they
 * were always supposed to be and had nowhere to go until this item. A predicate
 * left keyed on `case_id` would be false for EVERY document published after
 * this item — and since it is the entry condition to the whole published
 * ceremony, the ceremony would stop being checked on every document, silently,
 * with the suite green. That is the same trap CASE-4 recorded one field
 * earlier, and it is why this is corrected rather than removed.
 *
 * THE NEW SIGNAL IS `published_strength`, AND IT IS NOT AN ARBITRARY PICK. It
 * is the FROZEN PAIR (R2/DEC-21) — both axis objects, derived at the publishing
 * act from the finding's own basis and stamped into the bytes before the sha is
 * taken. Three properties make it the right field:
 *   - op=publish is the ONLY writer. Nothing else in this plane mints it, so a
 *     document carrying it was published, which is precisely the question.
 *   - it is the FINDING's OWN fact, not the case's. That matters now: every
 *     case-level fact has left these bytes, so a predicate keyed on one would
 *     be keyed on something that is no longer here.
 *   - `op=reopen` clears it with the rest of the publication stamp, so the
 *     reopened-document hole the old pair was built to close stays closed. That
 *     is asserted rather than assumed — see the reopen arm in the suite.
 * The shape is checked, not merely the presence: an array of at least the two
 * axes R2 requires (three when a member's testimony is frozen, MK-2), which
 * checkPublishedExtension goes on to validate in detail, so a stray
 * `published_strength: []` does not drag a working document into the ceremony. */
export const caseEditionClaimed = (fm) => {
  const e = fm?.case_edition;
  return !(e === undefined || e === null || e === '' || e === 'null');
};
/* CORRECTED BY MK-2 (IC-142), never exempted, AND IT IS THE MOST DANGEROUS LINE
   IN THAT ITEM — found by its own control arm, not by reading. This read
   `s.length === 2`, which was "the frozen PAIR" while there were two axes. A case
   member resting on a member's testimony freezes THREE rows (the testimony axis
   beside capture and connection), and under the old predicate it stopped being a
   case member at all: checkPublishedExtension never ran over it and op=ratify
   would have read it as an ordinary inquiry — the ceremony silently unchecked,
   with every assertion about it passing over nothing. The measured symptom was a
   frozen block carrying an axis this record does not measure and drawing no
   finding. So the predicate asks what it always meant — a NON-TRIVIAL frozen
   array of axis objects, which a stray `published_strength: []` still is not —
   and leaves WHICH axes, and how many, to checkPublishedExtension, which refuses
   anything but capture and connection once each and testimony at most once. It
   FAILS CLOSED: a malformed frozen block is dragged into the ceremony and
   refused there, rather than let out of it. */
export const isCaseMemberBytes = (fm) => {
  const s = fm?.published_strength;
  return Array.isArray(s) && s.length >= 2
    && s.every((a) => a && typeof a === 'object' && typeof a.axis === 'string');
};

/** REC-14 / DEC-13: the group's position on putting the case to its subject.
 *  EXPORTED so op=affordances publishes it and no surface keeps a copy.
 *  The gate is that the position is declared and justified; WHICH position it
 *  is gates nothing, here or anywhere — a group facing a non-supportive body
 *  may have real cause not to give notice, and what is refused is being silent
 *  about having chosen. */
export const SUBJECT_POSITIONS = ['sought_and_answered', 'sought_no_answer', 'not_sought'];

/** CASE-2 / DEC-72 clause 4: the two designations a case member can carry.
 *  EXPORTED for SUBJECT_POSITIONS' own reason — op=affordances publishes the
 *  vocabulary and no surface keeps a copy, so CASE-6's ceremony renders the two
 *  terms the gate actually accepts rather than a third spelling of them.
 *
 *  THE SPELLING IS THE SCHEMA'S. CASE-1 fixed it on
 *  `published_case_members.role` and said in the column's own comment that it
 *  was fixed there "so CASE-2 and CASE-6 do not each invent a third". This is
 *  that spelling consumed; `store.mjs`'s `Store.MEMBER_ROLES` is the same list,
 *  and the suite asserts all three agree by PARSING the schema rather than by
 *  restating it, because a vocabulary written three times is one that drifts. */
export const CASE_MEMBER_ROLES = ['load_bearing', 'supporting'];

/** REC-14: the three ASSERTED fields of a completeness block, in one place so
 *  the gate (C-21.1), the store's own pre-flight and the frozen projection all
 *  compare the same thing.
 *
 *  `author` and `at` are deliberately NOT here. They are STAMPS: `at` is the
 *  server's clock and always differs, so comparing it is an equality that costs
 *  nothing to produce, and `author` may legitimately be the same member twice —
 *  requiring it to change would be requiring a different person to sign the
 *  next edition. `subject_position` is not here either: it is a vocabulary
 *  choice, and a group whose position has not changed must not be pushed into
 *  changing it. What must be authored FRESH is what is ASSERTED — the
 *  statement, the justification for the position, and the exclusion list. */
/** REC-47 / DEC-46 (a): the AUTHORED bias acknowledgement, read off the
 *  frontmatter exactly as completenessFields reads its three. Named once and
 *  exported so the store's pre-flight, the gate and the ratify-commit path
 *  cannot drift about which bytes are being compared — the drift hazard REC-44
 *  measured five times over. */
export function biasAcknowledgementOf(fm) {
  const v = fm && typeof fm.bias_acknowledgement === 'string' ? fm.bias_acknowledgement : null;
  return v === null || v === 'null' ? null : v;
}

export function completenessFields(fm) {
  const c = (fm && typeof fm.completeness === 'object' && fm.completeness) || {};
  const rows = Array.isArray(fm?.completeness_excluded) ? fm.completeness_excluded : [];
  return {
    statement: typeof c.statement === 'string' ? c.statement : null,
    subject_justification: typeof c.subject_justification === 'string' ? c.subject_justification : null,
    excluded: JSON.stringify(rows.map((r) => [
      r && typeof r.target === 'string' ? r.target : null,
      r && typeof r.description === 'string' ? r.description : '',
      r && typeof r.reason === 'string' ? r.reason : ''])),
  };
}

export function checkPublishedExtension(fm, findings) {
  const e = fm.edition;
  if (!Number.isInteger(e) || e < 1) {
    findings.push(f('C-2.8', 'error', `a case member requires an integer edition of 1 or more (got '${e}'): an edition is what makes a revision safe — edition 2 does not overwrite edition 1, it joins it (DEC-12)`,
      ['publish through op=publish, which stamps the edition from the published record']));
  }
  const c = (typeof fm.completeness === 'object' && fm.completeness) || null;
  if (!c) {
    findings.push(f('C-2.8', 'error', 'a case member requires a completeness block: a case that says nothing about what it does not cover is claiming to cover everything',
      /* REC-56 / D-203's sweep, fourth site, and this one had a REACHABLE act
         available that the old string did not name. `published: ['open',
         'surfaced']` — `published -> concluded` is NOT an edge, so "move the
         inquiry back to concluded" fires C-4.2. What IS reachable is the full
         ceremony the STATES table's own comment describes, and `op=reopen` DOES
         apply, precisely so a legal edge is not left with no caller. So the
         correction here names an act rather than only refusing one.
         CORRECTED AGAIN 2026-09-10 (CASE-4 / DEC-72), never exempted, AND THE
         EDGE IS WHAT MOVED — not the advice. The route was `published -> open`
         because a case member wore `published`; DEC-72 ends that state, a member
         sits at `concluded`, and the ceremony is now `concluded -> open ->
         concluded` with a new edition published from there. `op=reopen` still
         applies, for the same reason it always did: its gate is now "a
         disposition OR a case member", so a case member reopens and a concluded
         finding in no case is still refused NOT_SET_DOWN. REC-56's whole point is
         that a repair string must name a route that EXISTS, and
         `repair-reachability.test.mjs` is the instrument that catches it when one
         stops existing — which is exactly how this line was found. */
      ['author completeness.statement and the exclusion list',
       'or reopen this case for a second edition (concluded -> open, op=reopen) and carry it back through conclude and publish: an edition is not edited back into concluded, and reopening does not unpublish edition 1 (DEC-12, DEC-72)']));
  } else {
    if (typeof c.statement !== 'string' || c.statement.trim() === '') {
      findings.push(f('C-2.8', 'error', 'a case member requires a non-empty completeness.statement'));
    }
    if (typeof c.author !== 'string' || c.author.trim() === '') {
      findings.push(f('C-2.8', 'error', 'a case member requires completeness.author: the completeness assertion is a named member\'s claim about the limits of this case'));
    }
    if (!ISO_TS_RE.test(String(c.at || ''))) {
      findings.push(f('C-2.8', 'error', `a case member requires completeness.at as an ISO timestamp (got '${c.at}')`));
    }
    /* DEC-13. The gate is the DECLARATION, never the act: every position below
       passes, and nothing reads which one it is. */
    if (!SUBJECT_POSITIONS.includes(c.subject_position)) {
      findings.push(f('C-2.8', 'error', `a case member requires completeness.subject_position, one of: ${SUBJECT_POSITIONS.join(', ')} (got '${c.subject_position}'). The gate is that the position is declared and justified — never that contact happened, and never that the answer was favourable (DEC-13)`,
        ['declare the group\'s position on putting this case to its subject']));
    }
    if (typeof c.subject_justification !== 'string' || c.subject_justification.trim() === '') {
      findings.push(f('C-2.8', 'error', 'a case member requires completeness.subject_justification: a declared position with no reasoning behind it is the checkbox this gate exists to refuse. A group that sought comment says so and prints what came back; a group that deliberately did not says so and says why, and a reader weighs that justification exactly as they weigh any other declared bias (DEC-13)',
        ['justify the position — including a deliberate decision not to give notice']));
    }
  }
  /* REC-44 / DEC-44: THE CASE THIS FINDING WAS PUBLISHED IN, in the bytes the
     member signs. All three are required on `published`, and each closes a
     different hole:
       case_id        without it a published finding names no case, so C-21.1
                      has nothing to be fresh against and the container has no
                      identity to be an edition OF.
       case_scope     DEC-44 determination 2. AUTHORED and never prefilled —
                      this is the arm that fits the claim, since a scope may
                      legitimately be unchanged between editions and a
                      byte-check on it would pressure a member into inventing a
                      difference (see checkCompletenessFreshness).
       case_findings  DEC-44 determination 3. The roster is inside every
                      member's own signed bytes, so a stranger holding ONE
                      finding can see what else the case rests on, and the
                      ratify committer can refuse two members who disagree
                      about the set instead of silently reconciling them.

     REC-47 / DEC-46 (a) adds a FOURTH, `bias_acknowledgement`, and it is the
     one whose arm differs from case_scope's: it is required here AND it is
     under C-21.1's byte-check. Why, when scope beside it is not, is recorded
     once at checkCompletenessFreshness rather than twice. */
  /* CASE-4 / DEC-72, 2026-09-10: THE `case_id` ARM IS NOW THE ENTRY CONDITION
     ITSELF AND IS THEREFORE UNREACHABLE FROM HERE — SAID OUT LOUD RATHER THAN
     DELETED IN SILENCE, because "this cannot fire" and "nobody checked" look
     identical in a diff. Until this item, this function was entered on
     `current_state === 'published'` and `case_id` was one of the facts such a
     document had to carry; a published finding naming no case was a real,
     reachable shape. DEC-72 makes the case relation the condition, so
     `isCaseMemberBytes(fm)` is exactly this predicate and a document that fails
     it never arrives here — the refusal has not been lifted, it has become the
     door. The requirement is UNCHANGED and is now enforced one line earlier and
     for every document rather than only for documents wearing a state word.
     THE ONE THING THAT WOULD MAKE IT REACHABLE AGAIN is CASE-5b removing
     `case_id` from finding bytes; at that point this function's entry condition
     moves to whatever the case-level signed document offers, and this arm moves
     with it. Kept as a comment and not as dead code: an `if` that can never be
     true is a rule nobody is enforcing wearing the costume of one. */

  /* ===== CASE-5b / DEC-72: SIX ARMS LEFT THIS FUNCTION, AND THEY LEFT TOGETHER
     BECAUSE THEY ARE ONE QUESTION ASKED AT THE WRONG ALTITUDE. ================

     `case_scope`, `case_edition`, `case_project`, `case_findings`, `case_roles`
     and `bias_acknowledgement` were all required HERE, of every member, because
     every member's bytes carried them. They are not facts about a finding. They
     are facts about a CASE, and they were in a finding's gate only because a
     finding's signature was the only signature there was.

     THEY ARE NOT DELETED. Every one of them is now an arm of
     `checkCaseDocument` below, asked ONCE of the document a member actually
     signs for the case — same requirement, same refusal text where the text was
     already right, one altitude up. **Moving a check is the shape a lost check
     wears**, so the suite asserts the arms by NAME on both sides of the move
     rather than counting them.

     WHAT STAYED HERE IS WHAT IS GENUINELY THE FINDING'S: its completeness block,
     its exclusion list, its own frozen strength pair and its frozen grounds. A
     reader of these bytes is still told everything about THIS document that the
     ceremony ever told them. What they are no longer told N times is what the
     case as a whole asserted — for which they read the case document, whose
     signature covers it. ===================================================== */
  /* C-9. The FIELD may not be absent; the LIST may legitimately be empty. */
  if (!Array.isArray(fm.completeness_excluded)) {
    findings.push(f('C-2.8', 'error', 'a case member requires a completeness_excluded field: an EMPTY list is a claim (this case left nothing out) and is legal — an ABSENT field is silence, and silence about what a case excludes is what the completeness assertion exists to refuse',
      ['author completeness_excluded, empty if nothing was excluded']));
  } else {
    fm.completeness_excluded.forEach((r, i) => {
      if (!r || typeof r !== 'object') {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] is not an object`));
        return;
      }
      const named = typeof r.target === 'string' && BUNDLE_ID_RE.test(r.target);
      const prose = typeof r.description === 'string' && r.description.trim() !== '';
      /* RECONCILED C-9: target OR prose, NEVER NEITHER. An exclusion may
         legitimately name something not in the record — an outstanding records
         request has no id to point at — so a required target would force the
         member to invent a referent or to say nothing. */
      if (!named && !prose) {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] names neither a target nor a description: every exclusion row carries a target id OR prose, never neither`,
          ['name the excluded bundle by id', 'or describe what was excluded in prose']));
      }
      if (typeof r.reason !== 'string' || r.reason.trim() === '') {
        findings.push(f('C-2.8', 'error', `completeness_excluded[${i}] carries no reason: WHAT was left out and WHY are two statements and one does not stand in for the other`));
      }
    });
  }
  /* R2/DEC-21: BOTH axis objects, frozen, and never composed into one letter.
     The STATE is what keeps `unrated` (nothing on this axis is graded)
     distinguishable from `undetermined` (the walk hit its depth bound) — two
     different frozen facts that a single nullable grade could not tell apart,
     and C-21.2 compares against the right one. */
  /* MK-2 / IC-142: A THIRD AXIS, FROZEN ONLY WHEN IT CARRIES SOMETHING.
     capture and connection are REQUIRED exactly once each, as they always were.
     `testimony` is admitted at most once and is REQUIRED when a leg of this
     basis carries a testimony grade — the case then rests on a member's word
     and the frozen bytes must say at what. When nothing in the basis is
     testimony the row is ABSENT, and that is not an omission: every case
     frozen before this axis existed reads exactly that way and means exactly
     "rests on no testimony", so stamping an UNRATED testimony row on new ones
     would be a second spelling of the same fact across one corpus (D-21) — and
     would move the signed bytes of every ordinary case for no new information.
     The case's GRADED testimony axis can also arrive through a cited inquiry
     rather than a direct leg; `op=publish` freezes it from the derivation in
     that case too, and this arm checks what the document alone can see. */
  const axes = Array.isArray(fm.published_strength) ? fm.published_strength : null;
  const axisCount = (a) => (axes || []).filter((x) => x && x.axis === a).length;
  const testimonyLeg = Array.isArray(fm.basis) && fm.basis.some((l) => l && typeof l === 'object'
    && l.grade_axis === 'testimony' && l.grade !== undefined && l.grade !== null);
  if (!axes || axisCount('capture') !== 1 || axisCount('connection') !== 1
      || axisCount('testimony') > 1
      || axes.some((x) => !x || !GRADE_AXES.includes(x.axis))) {
    findings.push(f('C-2.8', 'error', `a case member requires published_strength carrying BOTH axes, capture and connection, once each, and nothing but the axes this record measures (${GRADE_AXES.join(', ')}): a case does not have "a strength", it has one per axis, and composing them into one letter is the substitution R2 forbids`,
      ['publish through op=publish, which stamps the frozen axis objects into the bytes']));
  } else if (testimonyLeg && axisCount('testimony') !== 1) {
    findings.push(f('C-2.8', 'error', 'a case member whose basis carries a testimony grade requires a published_strength row for the testimony axis: the case rests on a member\'s word, and the frozen bytes must say at what, beside the capture and connection axes and never folded into either',
      ['publish through op=publish, which freezes the testimony axis whenever it carries anything'],
      'testimony-axis-unfrozen'));
  } else {
    for (const a of axes) {
      if (!STRENGTH_STATES.includes(a.state)) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} state '${a.state}' is not one of: ${STRENGTH_STATES.join(', ')}`));
      } else if (a.state === 'graded' && !BASIS_GRADES.includes(a.grade)) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} is graded but carries no grade`));
      } else if (a.state !== 'graded' && a.grade != null) {
        findings.push(f('C-2.8', 'error', `published_strength.${a.axis} is ${a.state} and still carries grade '${a.grade}': ${a.state === 'unrated' ? 'UNRATED is not a low score, it is nothing established on this axis' : 'undetermined is what we do not know, not a grade'}`));
      }
    }
  }
  /* REC-42 / DEC-32 clause (e): IF THE BASIS WAS STRUCTURED, THE FROZEN RESULT
     IS THE STRUCTURED ONE. A published case whose legs name grounds took a
     MAXIMUM over branches to reach the grade above, and that claim is only
     checkable by a reader if the bytes say which branch reached what. Absent
     here is not silence, it is the structure being invisible under a grade the
     structure produced — so it is refused, with the same reasoning that makes
     completeness_excluded's FIELD required even when the list is empty.
     Not required when nothing was grouped: an unstructured case's two axis
     objects already are the whole truth, and a one-row restatement would be a
     second place to state one fact (D-21). */
  const grouped = Array.isArray(fm.basis)
    && fm.basis.some((l) => l && typeof l === 'object' && typeof l.ground === 'string' && l.ground !== '');
  const frozenGrounds = Array.isArray(fm.published_strength_grounds) ? fm.published_strength_grounds : null;
  if (grouped && !frozenGrounds) {
    findings.push(f('C-2.8', 'error', 'a case member requires published_strength_grounds when the basis names grounds: the grade above is the STRONGEST ground rather than the weakest leg, and "these grounds were each independently sufficient" is a claim a reader can only test if the case says which legs were in which branch and what each branch reached',
      ['publish through op=publish, which freezes the per-ground breakdown beside the pair']));
  } else if (grouped) {
    for (let i = 0; i < frozenGrounds.length; i++) {
      const g = frozenGrounds[i];
      if (!g || typeof g !== 'object') {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is not an object`));
        continue;
      }
      if (!GRADE_AXES.includes(g.axis)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}].axis '${g.axis}' is not one of: ${GRADE_AXES.join(', ')} — the branches are composed PER AXIS and both axes are frozen separately (DEC-21)`));
      }
      if (!STRENGTH_STATES.includes(g.state)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}].state '${g.state}' is not one of: ${STRENGTH_STATES.join(', ')}`));
      } else if (g.state === 'graded' && !BASIS_GRADES.includes(g.grade)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is graded but carries no grade`));
      } else if (g.state !== 'graded' && g.grade != null) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds[${i}] is ${g.state} and still carries grade '${g.grade}': a suspended ground states what is unknown, and an unrated one states that nothing on it is established — neither is a grade`));
      }
    }
    for (const label of new Set(fm.basis.filter((l) => l && typeof l.ground === 'string' && l.ground).map((l) => l.ground))) {
      if (!frozenGrounds.some((g) => g && g.ground === label)) {
        findings.push(f('C-2.8', 'error', `published_strength_grounds names no row for ground '${label}': every branch the basis carries is frozen on every axis, because a branch missing from the frozen result is one no reader can check`));
      }
    }
  }
  /* CASE-5b: A SEVENTH ARM LEFT WITH THE OTHER SIX, AND IT WAS THE LAST CASE
     FACT STILL BEING ASKED OF A FINDING. `required_strength` is the BAR, and
     DEC-72 clause 2 is unambiguous that a bar is a property of the PROJECT told
     to the publishing act — so it is the CASE's, not any member's. It was here
     because it was in a member's bytes, and it was in a member's bytes because
     that is where the signature was. The arm is `C-41.12` now, with the
     "an ABSENT bar is STATED as absent rather than shown as blank" requirement
     carried word for word, plus the per-axis grade check below it. */
}

/* ===========================================================================
 * THE CASE-DOCUMENT CATALOGUE, C-41 (R8)
 * ========================================================================= */

/* REC-96 / D-196 / IC-112 — WHERE A CASE'S `searched` SECTION GOT ITS SUBJECTS,
   AND THE VOCABULARY IS THE FENCE RATHER THAN A LABEL.

   WHAT A LIAR WOULD DO, STATED BEFORE WHAT THIS CHECKS. The cheapest way to make
   a coverage section green is not to forge a row — every row can be real and
   every number true. It is to choose the SUBJECT SET. Compute the section over
   *every subject the observation log holds a row for* and the answer is 100%
   searched BY CONSTRUCTION, and it is a statement about the log rather than about
   the case. That is D-196's own ancestor: Blair & Maron's attorneys stipulated
   they must reach 75% recall and sincerely believed they had; measured recall was
   ~20%, because what they measured was not what they claimed.

   SO THE SOURCE IS DECLARED IN THE SIGNED BYTES AND CHECKED AT THE GATE. The
   observation log is deliberately NOT a member of this object — the same
   construction that keeps `member` out of `OBSERVATION_AUTHORITY_KINDS`, where a
   provisional is enforced by a vocabulary having no value for it rather than by a
   comment asking nicely. A document declaring a source this object does not name
   is refused by C-41.10, so the fence stands over bytes a stranger hands us and
   not only over the path that wrote them.

   IT LIVES HERE AND NOT IN `airun.mjs` FOR TWO REASONS, ONE STRUCTURAL: that file
   imports THIS one, so a gate check there would be a cycle — and this is the case
   document's vocabulary rather than the observation log's, qualifying a
   provenance claim in a signed artifact, beside `CASE_DOCUMENT_FORMAT` and
   `SUBJECT_POSITIONS`. `airun.mjs` re-exports it so a reader of the
   observation-log vocabularies meets it beside the states it qualifies. */
export const SEARCHED_SUBJECT_SOURCES = {
  case_basis: "the subjects were taken from the CASE -- its members' basis legs and the content "
            + "rows those legs name -- and the observation log was consulted only to ask what "
            + "became of each. The log never supplies the subject set; a section computed the "
            + "other way round is 100% searched by construction and says nothing about the case",
};

/* THE FAMILY, DECLARED — and it is a declaration rather than twelve string
   literals for two measured reasons rather than tidiness.

   (1) `tools/mintid.mjs` READS THIS FILE FOR THE `C` NAMESPACE'S FLOOR, and its
   allocation pattern is `check: 'C-n.m'`. A family that exists only as the first
   positional argument to `f()` is INVISIBLE to that pattern, so its number reads
   as a MENTION — and `mintid.test.mjs` then fails `no live floor is driven by
   prose`, correctly, because a floor taken off a sentence is a floor a stray
   sentence can move. This is a blind spot this item TRIPPED rather than created:
   every gate check in this catalog is spelled `f('C-2.8', …)` and none of them is
   an allocation by that pattern either. What this item owes is that the family it
   MINTS is visible to the allocator that minted it, and that is what this table
   does; widening the pattern to see the other families is `tools/`' ground and is
   not taken here.

   (2) The suite asserts the six rehomed arms BY NAME on both sides of the move
   (checkPublishedExtension -> here), and a declared family is what it asserts
   against. Moving a check is the shape a lost check wears, so the move is
   checkable rather than described.

   NOT NAMED `*_CHECKS`: that suffix is RESERVED — the DEC-49 guard harvests every
   `/_CHECKS$/` export as a REFUSAL family, and these are GATE findings with no
   refusal code and no canned translation. A table named that way would grow a
   ratchet's floor falsely, which this estate has already paid for. */
export const CASE_DOCUMENT_FAMILY = {
  FORMAT:       { check: 'C-41.1',  what: 'the format token' },
  IDENTITY:     { check: 'C-41.2',  what: 'case_id, and that it is the case being ratified' },
  EDITION:      { check: 'C-41.3',  what: 'case_edition, and that it is the edition being ratified' },
  PROJECT:      { check: 'C-41.4',  what: 'case_project — whose production this is (DEC-72 clause 2)' },
  SCOPE:        { check: 'C-41.5',  what: 'case_scope — what the case is ABOUT (DEC-44 determination 2)' },
  BIAS:         { check: 'C-41.6',  what: 'bias_acknowledgement (REC-47 / DEC-46 (a))' },
  ROSTER:       { check: 'C-41.7',  what: 'case_findings — what the case rests on (DEC-44 determination 3)' },
  ROLES:        { check: 'C-41.8',  what: 'case_roles — the authored partition (DEC-72 clause 4)' },
  PINS:         { check: 'C-41.9',  what: 'the version hash per member (DEC-72 clause 3)' },
  COMPLETENESS: { check: 'C-41.10', what: 'the completeness block (REC-14)' },
  EXCLUDED:     { check: 'C-41.11', what: 'the exclusion list field (C-9)' },
  BAR:          { check: 'C-41.12', what: 'required_strength — the standard of evidence (DEC-17 as DEC-72 rehomes it)' },
  DISCLOSURES:  { check: 'C-41.13', what: 'bias_manifest, the statement\'s acknowledgement list and the statement\'s WRITER, required of a bio-case-document/3 or /4 (REC-188; the writer REC-212)' },
  /* REC-219: BOB #34 named this check C-41.13, which /3's obligation above already holds, so it takes
     the next free member of the family. */
  PENDING:      { check: 'C-41.14', what: 'the adoptions pinning a PROPOSED revision at signing, stated beside bias_manifest, required of a bio-case-document/4 (REC-219)' },
  /* REC-219 / D-579(a) (BOB #34, 2026-09-25 02:30Z): the case's citation edges, each pinned to the
     version it was made against — one more /4 obligation, riding the same bump. */
  CITATIONS:    { check: 'C-41.15', what: 'case_citations — each citation edge with the version it rests on, a pinned one naming its capture, required of a bio-case-document/4 (REC-219, D-579(a))' },
};
/* REC-219 / D-579(a): the states a case document's citation edge may carry, and which name a capture. */
export const CASE_CITATION_VERSIONS = ['pinned', 'only_capture', 'undetermined', 'no_capture', 'no_bytes'];
const CITATION_NAMES_CAPTURE = new Set(['pinned', 'only_capture']);
const C41 = Object.fromEntries(
  Object.entries(CASE_DOCUMENT_FAMILY).map(([k, v]) => [k, v.check]));

export function checkCaseDocument(fm, ctx = {}) {
  const findings = [];
  const { caseId = null, edition = null, priorCase = null, body = null, memberBasis = null } = ctx;

  /* D-442: an ACCEPTED SET, never a single value — the IC-166 precondition for the bump. */
  if (!CASE_DOCUMENT_FORMATS_ACCEPTED.includes(fm?.format)) {
    findings.push(f(C41.FORMAT, 'error', `a case document declares format '${CASE_DOCUMENT_FORMAT}' (or, authored before REC-188, '${CASE_DOCUMENT_FORMAT_V2}'; or, authored before BIO_Publication_v0_1.md §3 rule 12, '${CASE_DOCUMENT_FORMAT_LEGACY}') (got '${fm?.format}'): the format token is what lets a stranger holding these bytes know what they are reading and what rules they were made under, which is the same reason the container manifest carries one`,
      ['re-publish through op=publish, which authors the case document']));
  }
  /* THE IDENTITY AND THE EDITION, CHECKED AGAINST WHAT THE STORE IS ABOUT TO
     COMMIT THEM AS. This is the one arm that is not purely about the bytes, and
     it is the reason the ceremony is not a rubber stamp: the signature covers
     THESE bytes, so if the document's own idea of which case and which edition
     it is differs from the row being written, the plane would be committing a
     case fact at coordinates nobody signed for. #publishEdges' doctrine, at the
     one place it can still be violated. */
  if (typeof fm?.case_id !== 'string' || fm.case_id.trim() === '' || fm.case_id === 'null') {
    findings.push(f(C41.IDENTITY, 'error', 'a case document requires case_id: without it the document names no case, so C-21.1 has nothing to be fresh against and the container has no identity to be an edition OF (DEC-44)'));
  } else if (caseId && fm.case_id !== caseId) {
    findings.push(f(C41.IDENTITY, 'error', `this case document names case ${fm.case_id} and is being ratified as ${caseId}: the signature covers these bytes, so a case identity taken from the request rather than from the signed document would place a commitment where nobody made one`));
  }
  if (!Number.isInteger(fm?.case_edition) || fm.case_edition < 1) {
    findings.push(f(C41.EDITION, 'error', `a case document requires an integer case_edition of 1 or more (got '${fm?.case_edition}'): an edition is a SEPARATE DOCUMENT and answers forever, so a signature that did not cover the number would stand for every edition of this case at once`));
  } else if (Number.isInteger(edition) && fm.case_edition !== edition) {
    findings.push(f(C41.EDITION, 'error', `this case document names edition ${fm.case_edition} and is being ratified as edition ${edition}: the edition is inside the hash the member signed, exactly as DEC-12 already requires of a bundle`));
  }
  /* CASE-2 / DEC-72 clause 2 — WHOSE PRODUCTION. Text preserved from the arm
     this replaces, with 'a case member' corrected to 'a case document': the
     requirement is identical and the subject is not. */
  if (typeof fm?.case_project !== 'string' || fm.case_project.trim() === '' || fm.case_project === 'null') {
    findings.push(f(C41.PROJECT, 'error', 'a case document requires case_project: a case is a PRODUCTION OF A PROJECT (DEC-72), and the project is what supplied the standard of evidence the case was held to. A published case naming no project is one whose bar nobody declared, and a stranger holding it cannot say whose production it is',
      ['publish through op=publish with project=<project id>, which writes it into the case document you sign']));
  }
  /* DEC-44 determination 2. AUTHORED and never prefilled — and this is the arm
     that fits the claim, since a scope may legitimately be unchanged between
     editions and a byte-check on it would pressure a member into inventing a
     difference (see checkCompletenessFreshness). */
  if (typeof fm?.case_scope !== 'string' || fm.case_scope.trim() === '') {
    findings.push(f(C41.SCOPE, 'error', 'a case document requires case_scope: the case states what brought these findings together and what question it answers as a whole. It is AUTHORED by the group and never derived from the findings\' titles — a scope this plane wrote is not a scope the group made (DEC-44)',
      ['author the case scope on op=publish']));
  }
  /* REC-47 / DEC-46 (a). DEC-20 is the doctrine and it is worth stating at the
     gate rather than only in the register: a published case CARRIES the bias it
     was produced under, as a fact a reader weighs. This field is a DISCLOSURE,
     never a bar — nothing here reads WHICH bias it names, and nothing anywhere
     refuses a case for having one. The only bias that disqualifies is an
     uncleared HUNCH (HUNCH DEBT, D-188), and that refusal is
     op=publishpreflight's by name. */
  if (typeof fm?.bias_acknowledgement !== 'string' || fm.bias_acknowledgement.trim() === '') {
    findings.push(f(C41.BIAS, 'error', 'a case document requires bias_acknowledgement: a published case carries the bias it was produced under as a fact the reader weighs, and the publisher ACKNOWLEDGES it at the moment of export rather than passing a pre-flight checkbox (DEC-46). Ordinary declared bias never blocks publication and is disclosed precisely so a reader can apply or discount it (DEC-20) — what is refused here is publishing SILENTLY about the lens, not publishing under one',
      ['author the bias acknowledgement on op=publish, fresh for this edition']));
  }
  /* DEC-44 determination 3, AND CLAUSE 3'S FREEZE. The roster names every member
     AT A HASH. Reproduced from the member-side arm and then extended, because
     the member-side arm could not ask for a pin: at the moment one member signed,
     the other members' shas did not exist. */
  const roster = Array.isArray(fm?.case_findings) ? fm.case_findings : null;
  if (!roster || !roster.length) {
    findings.push(f(C41.ROSTER, 'error', 'a case document requires case_findings naming every finding in this case: a stranger holding this document must be able to see what the case rests on without contacting this instance, which is the premise the portable container exists for (DEC-44 determination 3)',
      ['publish through op=publish, which writes the roster into the case document']));
  }
  {
    const names = (roster || []).map((x) => String(x));
    const rows = Array.isArray(fm?.case_roles) ? fm.case_roles.filter((r) => r && typeof r === 'object') : null;
    if (!rows || !rows.length) {
      findings.push(f(C41.ROLES, 'error', 'a case document requires case_roles: the publisher DESIGNATES each member load_bearing or supporting, and the whole partition is signed so a stranger can see which findings were presented as carrying the case (DEC-72 clause 4). There is no default — a member designated by omission was designated by nobody',
        ['designate every member on op=publish with roles={"<finding id>": "load_bearing"|"supporting"}']));
    } else {
      const named = new Map(rows.map((r) => [String(r.target ?? ''), String(r.role ?? '')]));
      const pinned = new Map(rows.map((r) => [String(r.target ?? ''), r.version_sha]));
      for (const m of names) {
        if (!named.has(m)) {
          findings.push(f(C41.ROLES, 'error', `case_roles designates no role for ${m}, which case_findings names as a member: the partition covers the roster exactly, because a member the partition is silent about was designated by nobody (DEC-72 clause 4)`));
        } else if (!CASE_MEMBER_ROLES.includes(named.get(m))) {
          findings.push(f(C41.ROLES, 'error', `case_roles designates ${m} '${named.get(m)}', which is not one of: ${CASE_MEMBER_ROLES.join(', ')}`));
        }
        const pin = pinned.get(m);
        if (typeof pin !== 'string' || !/^[0-9a-f]{64}$/.test(pin)) {
          findings.push(f(C41.PINS, 'error', `case_roles names ${m} without a 64-hex version_sha: publication PINS VERSIONS LIKE A COMMIT (DEC-72 clause 3), so a case that names its members and not the VERSIONS of them is a claim about the present rather than a frozen edition. The pin is the member's own bundle_sha, which is the hash that member signs`,
            ['re-publish through op=publish, which pins each member at the version it prepared']));
        }
      }
      for (const [t] of named) {
        if (t && !names.includes(t)) {
          findings.push(f(C41.ROLES, 'error', `case_roles designates ${t}, which case_findings does not name as a member of this case: the partition is OVER the roster and cannot reach outside it`));
        }
      }
      if (names.length && !names.some((m) => named.get(m) === 'load_bearing')) {
        findings.push(f(C41.ROLES, 'error', 'case_roles names no LOAD-BEARING member: a case rests on at least one finding that meets the project\'s standard of evidence (DEC-72\'s second ruled default). All-supporting material asserts nothing conclusively while the completeness assertion claims coverage of a question no member conclusively answers',
          ['designate the finding the case actually rests on, or do not publish this as a case yet']));
      }
    }
  }
  /* REC-14's COMPLETENESS ASSERTION, AT THE ALTITUDE IT WAS ALWAYS ABOUT. It is
     asked of the member's own bytes too (checkPublishedExtension keeps that arm)
     and it is asked HERE as well, for the reason this act already runs C-21.1
     twice: a one-sided check is a check the other side has to catch. */
  const c = (typeof fm?.completeness === 'object' && fm.completeness) || null;
  if (!c) {
    findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires a completeness block: a case that says nothing about what it does not cover is claiming to cover everything',
      ['author completeness.statement and the exclusion list']));
  } else {
    if (typeof c.statement !== 'string' || c.statement.trim() === '')
      findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires a non-empty completeness.statement'));
    if (typeof c.author !== 'string' || c.author.trim() === '')
      findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires completeness.author: the completeness assertion is a named member\'s claim about the limits of this case'));
    if (typeof c.at !== 'string' || !ISO_TS_RE.test(c.at))
      findings.push(f(C41.COMPLETENESS, 'error', `a case document requires completeness.at as an ISO timestamp (got '${c.at}')`));
    if (!SUBJECT_POSITIONS.includes(c.subject_position))
      findings.push(f(C41.COMPLETENESS, 'error', `a case document requires completeness.subject_position, one of: ${SUBJECT_POSITIONS.join(', ')} (got '${c.subject_position}'). The gate is that the position is declared and justified — never that contact happened, and never that the answer was favourable (DEC-13)`));
    if (typeof c.subject_justification !== 'string' || c.subject_justification.trim() === '')
      findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires completeness.subject_justification: a declared position with no reasoning behind it is the checkbox this gate exists to refuse (DEC-13)'));
  }
  /* D-150 / BIO_Publication_v0_1.md §3 rule 11 — THE STATEMENT'S ACKNOWLEDGEMENTS, C-41.10's
     arm because they are the completeness block's. ABSENCE IS NOT REQUIRED AWAY: a document
     authored before acknowledgements were recorded carries no list, and it is read as saying
     nothing about them (the ratify committer commits NULL, never an empty list), so this arm
     cannot demand the key without refusing what already crossed (rule 1). What it refuses is a
     list that claims more than it can support: a row naming no acknowledger or no kind, a count
     that disagrees with the list, and the statement's own author listed as its second reader —
     the one thing rule 11 says an acknowledgement is not. Nothing here asks for a row to exist:
     none is ever required to publish.

     REC-212 / §3 rule 13 (BOB #32 ruled (b), 2026-09-24: *two acts, two names, never conflated*) —
     THE EXCLUSION READS THE STATEMENT'S WRITER, WHICH IT COULD NOT DO BEFORE. It read
     `completeness.author`, and that names the member who PREPARED AND PUBLISHED the case. Where an
     editor wrote the exclusion statement and somebody else published it, this arm admitted the
     editor's own acknowledgement of their own sentence — so a signed case document claimed a second
     reading nobody made, which is the overclaim this catalogue exists to refuse, in the artifact a
     stranger holds. `completeness.statement_by` (REC-212, carried onto the document from the draft's
     server stamp) is the writer, and THREE STATES are told apart rather than two:
       - a NAME — an acknowledgement by that member is refused, and this is the arm the row is about;
       - `null`, the plane SAYING it could not establish the writer — then EVERY participant row is
         refused, once, because any one of them may BE the writer's own and a list that cannot rule
         that out is the record claiming a reader it cannot support. A RECIPIENT row is untouched: a
         grant's holder is never the writer;
       - NO KEY — a /1 or /2 document, authored before rule 13, read IN ITS OWN SHAPE: `author` is
         the only name those bytes hold, and refusing every acknowledgement of them would refuse what
         already crossed (rule 1).
     THE PUBLISHER'S OWN STAYS REFUSED, on its own reason and in its own words. They author this block
     and date it at the act of publishing, so their acknowledgement of it is not a second reading
     either, and `op=publish` has left it out since D-150. Two exclusions, two messages: one name for
     each act is the whole content of the ruling, and a single message covering both is how the two
     came to be one field in the first place. */
  if (fm && fm.completeness_acknowledgements !== undefined) {
    const acks = fm.completeness_acknowledgements;
    if (!Array.isArray(acks)) {
      findings.push(f(C41.COMPLETENESS, 'error', 'a case document\'s completeness_acknowledgements must be a list — empty when nobody but the statement\'s author acknowledged it (BIO_Publication §3 rule 11)'));
    } else {
      const publisher = c && typeof c.author === 'string' ? c.author : null;
      const statesWriter = !!c && Object.prototype.hasOwnProperty.call(c, 'statement_by');
      const writer = statesWriter && typeof c.statement_by === 'string' && c.statement_by.trim()
        ? c.statement_by.trim() : null;
      const writerUndetermined = statesWriter && !writer;
      for (const a of acks) {
        if (!a || typeof a !== 'object' || !['participant', 'recipient'].includes(a.kind)
            || typeof a.by !== 'string' || !a.by.trim() || typeof a.at !== 'string')
          findings.push(f(C41.COMPLETENESS, 'error', `a case document lists an acknowledgement of its statement that names no acknowledger, kind (participant or recipient) or date (got ${JSON.stringify(a)}): an acknowledgement is an authored, attributed, dated act, and an unattributed one is the record claiming a second reader it cannot name`));
        else if (a.kind === 'participant' && writer && a.by === writer)
          findings.push(f(C41.COMPLETENESS, 'error', `a case document lists ${a.by}, the member who WROTE its exclusion statement (completeness.statement_by), as having acknowledged it: an acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication §3 rule 11), and the writer of the sentence has read it once. Who wrote the statement and who published the case are two acts and two names (§3 rule 13) — this is the writer, whether or not they are also completeness.author`));
        else if (a.kind === 'participant' && publisher && a.by === publisher)
          findings.push(f(C41.COMPLETENESS, 'error', `a case document lists ${a.by}, completeness.author — the member who PREPARED AND PUBLISHED this case and authored this completeness block at that act — as having acknowledged its statement: an acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication §3 rule 11), and the member who authored the block is its first reader by construction`));
      }
      if (writerUndetermined && acks.some((a) => a && typeof a === 'object' && a.kind === 'participant'))
        findings.push(f(C41.COMPLETENESS, 'error', `a case document states that who wrote its exclusion statement is UNDETERMINED (completeness.statement_by is null) and lists ${acks.filter((a) => a && typeof a === 'object' && a.kind === 'participant').length} participant acknowledgement(s) of it: an acknowledgement is a SECOND person's reading (BIO_Publication §3 rule 11), and a document that cannot say who the FIRST reader was cannot support the claim that any of these is a second. Publish the edition again from a draft whose statement carries an author, or let the list stand with its recipients alone — a recipient of a review copy is never the statement's writer`));
      if (c && c.acknowledged !== undefined && c.acknowledged !== acks.length)
        findings.push(f(C41.COMPLETENESS, 'error', `a case document's completeness.acknowledged (${c.acknowledged}) disagrees with the ${acks.length} acknowledgement(s) it lists: the count and the list are one claim`));
    }
  }
  /* REC-188 — C-41.13, THE TWO DISCLOSURES A /3 DOCUMENT MUST CARRY. The arm above cannot demand the
     acknowledgement list and C-41.6 asks only for the authored acknowledgement, because both are read
     over /2 documents authored before D-84 and D-150; the token is what lets the gate tell a document
     that was never obliged from one that left its obligation out. So under /3, and ONLY under /3:
       (a) `bias_manifest` is a MAP whose `in_force` is a boolean, with `bias_manifest_bundles` beside it
           as a list. In force, it names the hash of the effective statement set; not in force, it SAYS
           so (`stated`) — the two are different facts from a lens with nothing in it (D-84), and a
           manifest that is neither is a blank a reader would take for one.
       (b) `completeness.acknowledged` is an integer of 0 or more and `completeness_acknowledgements` is
           a list. ZERO and an EMPTY list are legal and are the common answer: they say nobody but the
           statement's author acknowledged it, and nothing anywhere requires a second reader (rule 11).
     What is refused is SILENCE about the lens or about the second readers — never an unfavourable
     value. Nothing here reads WHICH bias is named (DEC-20: a disclosure, never a bar). */
  if (caseDocumentRequiresDisclosures(fm)) {
    const bm = fm?.bias_manifest;
    if (!bm || typeof bm !== 'object' || Array.isArray(bm) || typeof bm.in_force !== 'boolean') {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires a bias_manifest map with a boolean in_force (got ${JSON.stringify(bm ?? null)}): a published case CARRIES the bias it was produced under (DEC-20), and the manifest is the lens itself — computed and stamped by the plane beside the acknowledgement the publisher authors (DEC-46). A document silent about the lens cannot be told from one produced under none`,
        ['re-publish through op=publish, which stamps the manifest in force for the case\'s project into the case document']));
    } else if (bm.in_force === true && !(typeof bm.statements_sha === 'string' && /^[0-9a-f]{64}$/.test(bm.statements_sha))) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest says a lens was in force and names no 64-hex statements_sha (got '${bm.statements_sha}'): the manifest is the (bundle, revision) pairs PLUS a hash of the effective statement set, and a lens named without its hash cannot be checked against op=biasmanifest by anyone`,
        ['re-publish through op=publish']));
    } else if (bm.in_force === false && !(typeof bm.stated === 'string' && bm.stated.trim())) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest says no lens was in force and does not SAY so (stated is empty): "no manifest was in force" is a statement, and a blank is not one`,
        ['re-publish through op=publish']));
    }
    if (bm && typeof bm === 'object' && !Array.isArray(fm?.bias_manifest_bundles)) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires bias_manifest_bundles beside bias_manifest: an EMPTY list is a claim (no bias bundle was in force) and is legal — an ABSENT field is silence about which revisions the lens was`,
        ['re-publish through op=publish']));
    }
    if (!c || !Number.isInteger(c.acknowledged) || c.acknowledged < 0) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires completeness.acknowledged, the count of second readers of its statement (got '${c ? c.acknowledged : undefined}'): ZERO is a statement — nobody but its author acknowledged it — and is legal; an absent count is silence (BIO_Publication §3 rule 11). An acknowledgement is never required to publish`,
        ['re-publish through op=publish, which lists every acknowledgement of the statement it publishes']));
    }
    if (!Array.isArray(fm?.completeness_acknowledgements)) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires completeness_acknowledgements: an EMPTY list is a claim (nobody but the statement's author acknowledged it) and is legal — an ABSENT field is silence about who else read what this case leaves out (BIO_Publication §3 rule 11)`,
        ['re-publish through op=publish, which lists every acknowledgement of the statement it publishes']));
    }
    /* REC-212 — (c) `completeness.statement_by`: WHO WROTE THE STATEMENT, told apart from
       `completeness.author`, who PREPARED AND PUBLISHED the case (§3 rule 13, BOB #32 (b), 2026-09-24).
       REQUIRED AS A KEY, /3 AND ONLY /3, for REC-188's own reason: a /1 or /2 document was never
       obliged to carry it and is read in its own shape, and the token is what tells a document that was
       never obliged from one that left its obligation out. `null` IS LEGAL AND IS A STATEMENT — the
       plane could not establish who wrote the sentence, said rather than guessed and never back-filled
       from `author`. What is refused is SILENCE: a /3 document handing a reader only the publisher's
       name leaves the two acts looking like one, which is the conflation this key exists to end. A
       document caught here is UNSIGNED — it is authored again by `op=publish`, which stamps the key —
       so nothing that already crossed is disturbed (rule 1). */
    if (!c || !Object.prototype.hasOwnProperty.call(c, 'statement_by')
        || !(c.statement_by === null || (typeof c.statement_by === 'string' && c.statement_by.trim()))) {
      findings.push(f(C41.DISCLOSURES, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires completeness.statement_by, the member who WROTE its exclusion statement — a different act, and a different name, from completeness.author, who prepared and published the case (BIO_Publication §3 rule 13). NULL is a statement (the plane could not establish who wrote the sentence) and is legal; an ABSENT key is silence, and a reader holding only the publisher's name reads two acts as one (got ${c ? JSON.stringify(c.statement_by ?? null) : undefined}${c && !Object.prototype.hasOwnProperty.call(c, 'statement_by') ? ', with no such key' : ''})`,
        ['re-publish through op=publish, which carries the draft\'s server-stamped statement_by onto the document']));
    }
  }
  /* REC-219 — C-41.14, THE ADOPTION PENDING AT SIGNING, a /4 obligation and nothing older
     (BIO_Publication_v0_1.md §3 rule 18; BOB #34, 2026-09-24 23:08Z). The frozen block states the
     scope's bias position AS IT STOOD AT SIGNING, and "no manifest was in force" is TRUE of a scope whose
     only adoption pins a PROPOSED revision — but alone it lets a later reader take "nobody declared
     anything" for "a declaration was pending". So a /4 document states, beside the manifest:
       - `bias_manifest.pins_proposed`, the COUNT of adoptions whose pinned revision stood at a state other
         than `adopted` (ZERO is a statement and the common answer);
       - `bias_manifest_pins_proposed`, one row per such adoption naming its bundle, the REVISION it
         pinned (64 hex) and the scope — the list's length the count;
       - `bias_manifest.pins_proposed_stated`, the sentence saying what the list is.
     What is refused is SILENCE, never a value: an EMPTY list with a zero count passes, and so does a
     long one. Nothing here reads WHICH revision is named, nor asks whether it will take effect — the
     ruling is that the document SAYS NOTHING about when or whether it does. A document whose manifest
     is absent or not a map is C-41.13's and is not asked twice.
     WHAT THIS CANNOT SEE: the RECORD at signing. The gate is a function of the bytes a stranger hands it,
     and the adoption table has moved since (a pin re-pins at promotion, REC-187), so "the record held
     one and the list omits it" is enforced where the record IS read — op=publish, which authors this
     list from the same op=biasmanifest answer the manifest is stamped from — and a document's own
     disagreement with itself (a count that is not its list's length) is what is refused here. */
  if (caseDocumentRequiresV4Disclosures(fm)) {
    const bm = fm?.bias_manifest;
    if (bm && typeof bm === 'object' && !Array.isArray(bm)) {
      const list = fm?.bias_manifest_pins_proposed;
      const n = bm.pins_proposed;
      if (!Number.isInteger(n) || n < 0 || !Array.isArray(list)) {
        findings.push(f(C41.PENDING, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires bias_manifest.pins_proposed (a count, zero legal) and bias_manifest_pins_proposed (a list, empty legal) beside its manifest (got count ${JSON.stringify(n ?? null)}, list ${Array.isArray(list) ? `of ${list.length}` : 'absent'}): "no manifest was in force" is true of a scope whose only adoption pins a revision the group has proposed and not accepted, and a document silent about that adoption lets a reader take "a declaration was pending" for "nobody declared anything" (BIO_Publication §3 rule 18)`,
          ['re-publish through op=publish, which states every adoption of the scope pinning a proposed revision at signing']));
      } else if (list.length !== n) {
        findings.push(f(C41.PENDING, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest.pins_proposed says ${n} and its bias_manifest_pins_proposed lists ${list.length}: the count and the list are one fact stated twice, and a document disagreeing with itself about a pending adoption states neither`,
          ['re-publish through op=publish']));
      } else {
        const bad = list.filter((x) => !(x && typeof x === 'object'
          && typeof x.bundle_id === 'string' && x.bundle_id.trim()
          && typeof x.revision === 'string' && /^[0-9a-f]{64}$/.test(x.revision)
          && (x.scope === 'instance' || x.scope === 'project')));
        if (bad.length > 0)
          findings.push(f(C41.PENDING, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest_pins_proposed has ${bad.length} row(s) not naming a bundle_id, a 64-hex revision and a scope of instance or project (first: ${JSON.stringify(bad[0])}): the ruling is that the document names the proposed revision the adoption pinned — its id — and a row without it says an adoption was pending without saying which`,
            ['re-publish through op=publish']));
        if (!(typeof bm.pins_proposed_stated === 'string' && bm.pins_proposed_stated.trim()))
          findings.push(f(C41.PENDING, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest carries no pins_proposed_stated: the list is stated in a sentence as "no manifest was in force" is, because a bare count is a blank a reader must decode`,
            ['re-publish through op=publish']));
      }
    }
  }
  /* REC-219 / D-579(a) — C-41.15, THE CITATION EDGES AND THEIR VERSIONS, a /4 obligation (BOB #34,
     2026-09-25 02:30Z: *"A published case must say which version it cited, and a pin kept outside the
     signed bytes is one a reader cannot verify"*). A /4 document carries `case_citations`, a list (EMPTY
     legal: the project cited nothing), each row a target and a `version` from CASE_CITATION_VERSIONS:
     `pinned` and `only_capture` NAME the 64-hex capture; `undetermined`, `no_capture` and `no_bytes` name
     none and say why by their value. What is refused: the list absent, a row with no target or a version
     outside the vocabulary, a row whose version says it names a capture and OMITS IT (the pin dropped),
     and a row naming a capture its version says it has not.
     WHAT THIS CANNOT SEE, as C-41.14 cannot: the RECORD. Whether the edge's bytes held a pin that this
     row calls `undetermined` is op=publish's to get right, and is driven through the op. /3 and older are
     never asked: read today their edges are "version undetermined (signed before capture pins)", which
     op=casedocument states. */
  if (caseDocumentRequiresV4Disclosures(fm)) {
    const rows = fm?.case_citations;
    if (!Array.isArray(rows)) {
      findings.push(f(C41.CITATIONS, 'error', `a ${CASE_DOCUMENT_FORMAT} case document requires case_citations, the case's citation edges each with the version it rests on (got ${JSON.stringify(rows ?? null)}): an EMPTY list is a claim (the project cited nothing) and is legal — an ABSENT field leaves a reader unable to say which version of anything the case cited (BIO_Publication §3 rule 18)`,
        ['re-publish through op=publish, which signs every cites edge of the project with its version']));
    } else {
      const bad = rows.filter((x) => !(x && typeof x === 'object' && typeof x.target === 'string' && x.target.trim()
        && CASE_CITATION_VERSIONS.includes(x.version)
        && (CITATION_NAMES_CAPTURE.has(x.version)
          ? typeof x.capture === 'string' && /^[0-9a-f]{64}$/.test(x.capture)
          : x.capture === null || x.capture === undefined)));
      if (bad.length > 0)
        findings.push(f(C41.CITATIONS, 'error', `a ${CASE_DOCUMENT_FORMAT} case document's case_citations has ${bad.length} row(s) that do not state a target and a version from {${CASE_CITATION_VERSIONS.join(', ')}}, with the 64-hex capture exactly where the version names one (first: ${JSON.stringify(bad[0])}): a citation edge that says it is pinned and omits the pin, or names a capture its version disowns, states a version nobody can verify`,
          ['re-publish through op=publish']));
    }
  }
  /* REC-96 / D-196 / IC-112 — THE `searched` SECTION, AND IT IS C-41.10's ARM
     BECAUSE IT IS THE SAME QUESTION. The completeness statement says what this
     case does not cover; this says what was looked for. A case carrying the first
     without the second is Blair & Maron's stipulation with no disclosed process
     behind it, which D-196 records as the exact claim the field considers
     worthless — so the FIELD is required here for the reason the exclusion list
     and the bar are required one arm down: what is refused is SILENCE, never an
     unfavourable value.

     EVERY HONEST ANSWER IS LEGAL AND ONE OF THEM SAYS NOBODY LOOKED. A section
     reporting `never_looked` at every level passes this gate, and so does one
     reporting `no_subjects`. That is not a hole in the check — it is the check
     working. A gate that refused those would pressure a member into publishing a
     coverage claim they could not support, which is the failure mode CLAUDE.md
     names for the publication fence: a gate that pressures someone into inventing
     an attribution is a bug in the gate. */
  const srch = (typeof fm?.searched === 'object' && fm.searched) || null;
  if (!srch) {
    findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires a searched block beside its completeness block: a completeness claim with no record of what was looked for is prose with nothing behind it, which is what the search-completeness literature identifies as the claim worth least (D-196). An empty or negative answer is legal here — SILENCE is not',
      ['publish the searched section computed from the observation log over this case\'s own subjects']));
  } else {
    if (!Object.prototype.hasOwnProperty.call(SEARCHED_SUBJECT_SOURCES, String(srch.subject_source)))
      findings.push(f(C41.COMPLETENESS, 'error', `a case document's searched.subject_source must name a source this record recognises (got '${srch.subject_source}'; known: ${Object.keys(SEARCHED_SUBJECT_SOURCES).join(', ')}). THE SUBJECT SET IS THE FENCE: a coverage section computed over the observation log's own subjects is 100% searched by construction with every row in it honest, and is a statement about the log rather than about this case`,
        ['compute the section over the case\'s own subjects — its members\' basis legs and the content rows those legs name']));
    if (!Number.isInteger(srch.subjects) || srch.subjects < 0)
      findings.push(f(C41.COMPLETENESS, 'error', `a case document's searched block requires an integer subject count (got '${srch.subjects}')`));
    if (!Array.isArray(fm?.searched_levels))
      findings.push(f(C41.COMPLETENESS, 'error', 'a case document requires a searched_levels field beside the searched block: an EMPTY list is a claim (this record could compute no level for this case) and is legal — an ABSENT field is silence about which levels were consulted',
        ['author searched_levels, empty if no level could be computed']));
  }
  /* C-9. The FIELD may not be absent; the LIST may legitimately be empty. */
  if (!Array.isArray(fm?.completeness_excluded)) {
    findings.push(f(C41.EXCLUDED, 'error', 'a case document requires a completeness_excluded field: an EMPTY list is a claim (this case left nothing out) and is legal — an ABSENT field is silence, and silence about what a case excludes is what the completeness assertion exists to refuse',
      ['author completeness_excluded, empty if nothing was excluded']));
  }
  /* DEC-17 AS DEC-72 REHOMES IT: THE BAR, IN THE SIGNED DOCUMENT. The FIELD is
     required and a DECLARED value is not, which is the whole of "an absent bar
     is not a bar of zero" written as a check. A case published where no bar was
     ever declared states that fact and claims no cleared standard — the design
     doc's own clause — so what is refused here is SILENCE about the bar, never
     the absence of one. */
  const rq = (typeof fm?.required_strength === 'object' && fm.required_strength) || null;
  if (!rq || typeof rq.declared !== 'boolean') {
    findings.push(f(C41.BAR, 'error', 'a case document requires required_strength with a declared flag: a case publishes the bar the group set for itself beside the strength each member reached, and an ABSENT bar is STATED as absent rather than shown as blank (DEC-17). An absent bar is not a bar of zero — a reader cannot tell "no bar was declared" from "nobody wrote this down"',
      ['declare the project bar with op=strengthbar, or publish with the bar stated absent']));
  } else if (rq.declared) {
    /* THE PAIR, PER R2, and the reason is the one the member-side arm carried:
       a scalar would re-collapse the two axes in the one field a reader is most
       likely to quote.
       D-450 / BIO_Publication_v0_1.md §3 rule 14 (BOB #32, 2026-09-23): AN AXIS NOBODY SET IS NULL.
       A project may declare its bar on one axis only (`op=publish` admits it: an unset axis gates
       nothing), and demanding a grade on both refused the very document `op=publish` had authored —
       a case that published and could never be signed, and a gate pressuring a member to invent a
       bar on an axis they hold no view on (CLAUDE.md §4). So `null` is ADMITTED; what stays refused
       is an OMITTED key (the pair stays a pair — silence is not "unset"), any other value, and a
       bar declared on NEITHER axis, which claims a standard no axis holds. */
    for (const axis of ['capture', 'connection']) {
      if (!Object.prototype.hasOwnProperty.call(rq, axis)) {
        findings.push(f(C41.BAR, 'error', `required_strength.${axis} is absent — the declared bar is a PAIR per R2 and both keys are always written: an axis nobody set is written null, never omitted, because a reader cannot tell an omitted key from one nobody wrote down`,
          [`write required_strength.${axis}: null if the project set no bar on the ${axis} axis`]));
      } else if (rq[axis] !== null && !BASIS_GRADES.includes(rq[axis])) {
        findings.push(f(C41.BAR, 'error', `required_strength.${axis} '${rq[axis]}' is not one of: ${BASIS_GRADES.join(', ')}, or null for an axis nobody set — the declared bar is a PAIR per R2, because a scalar would re-collapse the two axes in the one field a reader is most likely to quote`));
      }
    }
    if (rq.capture === null && rq.connection === null) {
      findings.push(f(C41.BAR, 'error', 'required_strength is declared with no bar set on either axis — a declared bar that gates nothing claims a standard no axis holds; a case with no bar states declared: false',
        ['publish with the bar stated absent (declared: false), or declare a grade on at least one axis']));
    }
  }
  /* ===== D-442 / BIO_Publication_v0_1.md §3 rule 12 (d): EVERY CHECK FOLLOWS ITS BLOCK. ========
     Under /2 op=publish writes nothing on a member, so the member-bytes arms that required a block
     there — C-2.8's entry requirements (the edition, the completeness block, the exclusion FIELD, the
     frozen pair with its testimony row, the frozen grounds) and C-3.1's `## What This Excludes`
     section — would stop firing on every new member, silently, with the suite green: the trap
     CASE-4 and CASE-5b each recorded one field earlier. They are not re-spelled here. THE SAME
     FUNCTION, `checkPublishedExtension`, runs once per roster member over the member's facts AS THIS
     DOCUMENT STATES THEM — its edition from `case_roles`, its pair and grounds from `case_strength`
     and `case_strength_grounds`, the case's completeness and exclusions — beside the member's own
     `basis` at the pinned bytes (`memberBasis`, from the store; the testimony-row and per-ground arms
     read it). Same check ids, same refusal text, prefixed with the member it is about. None is
     dropped. A /1 document is not asked: its members' own bytes carry these blocks and the member
     gate still asks them there (`isCaseMemberBytes`). */
  if (caseDocumentStatesMemberBlocks(fm)) {
    const members = Array.isArray(fm?.case_findings) ? fm.case_findings.map((x) => String(x)) : [];
    const rolesRows = Array.isArray(fm?.case_roles) ? fm.case_roles.filter((r) => r && typeof r === 'object') : [];
    const rowsFor = (key, m) => (Array.isArray(fm?.[key]) ? fm[key] : [])
      .filter((r) => r && typeof r === 'object' && String(r.target ?? '') === m)
      .map(({ target, ...rest }) => rest);
    if (!Array.isArray(fm?.case_strength)) {
      findings.push(f('C-2.8', 'error', 'a case document requires a case_strength field: since BIO_Publication_v0_1.md §3 rule 12 each member\'s FROZEN STRENGTH PAIR is stated here, once, and not in the member\'s bytes — a case document silent about what its findings reached leaves a reader with no strength at all',
        ['re-publish through op=publish, which states each member\'s frozen pair in the case document']));
    }
    if (!Array.isArray(fm?.case_strength_grounds)) {
      findings.push(f('C-2.8', 'error', 'a case document requires a case_strength_grounds field: an EMPTY list is a claim (no member\'s basis named grounds) and is legal — an ABSENT field is silence about the branches a structured grade was taken from',
        ['re-publish through op=publish, which states each member\'s frozen grounds in the case document']));
    }
    for (const m of members) {
      const row = rolesRows.find((r) => String(r.target ?? '') === m) || {};
      const basis = memberBasis && Object.prototype.hasOwnProperty.call(memberBasis, m) ? memberBasis[m] : undefined;
      const memberFm = {
        edition: row.edition,
        completeness: fm?.completeness,
        completeness_excluded: fm?.completeness_excluded,
        published_strength: rowsFor('case_strength', m),
        ...(rowsFor('case_strength_grounds', m).length
          ? { published_strength_grounds: rowsFor('case_strength_grounds', m) } : {}),
        ...(Array.isArray(basis) ? { basis } : {}),
      };
      const own = [];
      checkPublishedExtension(memberFm, own);
      for (const x of own) findings.push({ ...x, message: `case document, member ${m}: ${x.message}` });
    }
    /* C-3.1's section, which a person reads: the member carried it under `## What This Excludes`;
       the case document carries it now, and a document that does not has moved the assertion out of
       the only place a reader of prose meets it. Asked only when the caller supplies the body. */
    if (typeof body === 'string' && !/^## What This Excludes\s*$/m.test(body)) {
      findings.push(f('C-3.1', 'error', "required heading '## What This Excludes' is missing from the case document: since BIO_Publication_v0_1.md §3 rule 12 the case states what it excludes once, here, and not in any member's bytes",
        ["re-publish through op=publish, which writes the section into the case document"]));
    }
  }
  /* C-21.1 AT CASE ALTITUDE, and it is the arm that moved here WITHOUT its
     wording changing at all, because it was always a comparison between two
     CASE EDITIONS and never between two findings. A completeness claim carried
     forward unchanged is a checkbox. The scope statement is deliberately NOT in
     this comparison — the reasoning is at checkCompletenessFreshness. */
  if (priorCase && c) {
    if (typeof priorCase.statement === 'string' && priorCase.statement === (c.statement ?? null))
      findings.push(f('C-21.1', 'error', `the completeness statement is byte-identical to edition ${priorCase.edition}'s. Every edition is a separate document and states its own limits in its own words, as of its own date. If nothing about the limits changed, say THAT, as of this edition`));
    if (typeof priorCase.bias_acknowledgement === 'string'
        && priorCase.bias_acknowledgement === (fm?.bias_acknowledgement ?? null))
      findings.push(f('C-21.1', 'error', `the bias acknowledgement is byte-identical to edition ${priorCase.edition}'s. An acknowledgement of the bias a case was produced under is AUTHORED at the moment of export and never carried forward (DEC-46): reprinting the last edition's sentence is evidence nobody looked. Declaring a bias never blocks publication (DEC-20)`));
  }
  return findings;
}

/* ===========================================================================
 * THE REFUSAL ROWS THE TWO CEREMONIES ANSWER (R2–R5, R14)
 * ========================================================================= */

/* C-32.12–C-32.15: the machine and operator-token fences of `op=ratify` and `op=caseratify` (moved out of
   `MACHINE_FENCE_CHECKS`, whose other rows stay in the catalogue). */
export const RATIFY_MACHINE_FENCE_CHECKS = {
  /* REC-123 / IC-132 — THE TWO RATIFICATIONS, and they are the first of this
     family that live in the CONTROL PLANE rather than at the top of a store
     method, because both handlers do their work there: the signature is
     verified and the gate run in `index.mjs`, and the store is handed only the
     verified attestor. TRACED BY DRIVING, 2026-09-18: an `ai` credential whose
     member-authored scope named op=ratify / op=caseratify, carrying a registered
     member's VALID signature, PUBLISHED the finding and COMMITTED the case, and
     the record named the MEMBER as having done it. The scope check was the only
     thing in front of either, and a broader scope passes a scope check.
     `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4: *"No machine credential
     performs the attested act"*; both acts sit at the `attested` rung.
     WHAT THESE TWO DO NOT REFUSE: the operator's own ENV-BINDING credentials
     (ADMIN/MEMBER/PROBE tokens). REC-123 left them open as a provisional and
     raised D-421; BOB #14 DECIDED it (REFUSE), and C-32.14 / C-32.15 below are
     that ruling, landed by REC-125. */
  MACHINE_CANNOT_RATIFY: {
    check: 'C-32.12',
    where: 'src/ratification/ops.mjs ratifyOp > is-machine-ratify-bundle',
    translation: 'Ratifying puts a finding into the published record under a member\'s signature, '
      + 'and the member whose key signed it has to be the one who does it. The credential that asked '
      + 'here is an assistant\'s: it can prepare the finding and lay out what will be signed, and it '
      + 'cannot carry the signature in for you. Sign in and ratify it yourself.',
  },
  MACHINE_CANNOT_RATIFY_CASE: {
    check: 'C-32.13',
    where: 'src/ratification/ops.mjs caseRatifyOp > is-machine-ratify-case',
    translation: 'Ratifying a case commits the group\'s own assertions about it — its scope, its '
      + 'completeness, its position on the people it concerns — under a member\'s signature. The '
      + 'credential that asked here is an assistant\'s: it can assemble the case document, and it '
      + 'cannot be the one who commits it. Sign in and ratify it yourself.',
  },
  /* REC-125 / IC-137 — D-421, DECIDED by BOB #14 applying
     `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 (no new doctrine): an
     ATTESTED act is performed ONLY by a named member's OWN AUTHENTICATED
     SESSION, and the operator's bearer tokens may no longer deliver one, even
     carrying a member's valid signature. *The signature proves who AUTHORISED;
     the credential that delivers it decides WHEN the record changes, and the
     record names the actor.* ONE ROW PER ACT, like C-32.12 / C-32.13, and ONE
     ROW FOR EVERY BEARER CLASS rather than one per class: the refusal is keyed
     on how the caller ARRIVED (not through a session), so the class is named in
     the answer's `tokenClass` and the rule does not need a row per token. */
  OPERATOR_TOKEN_CANNOT_RATIFY: {
    check: 'C-32.14',
    where: 'src/ratification/ops.mjs ratifyOp > is-operator-ratify-bundle',
    translation: 'Ratifying puts a finding into the published record under a member\'s signature, '
      + 'and it is delivered by that member signed in as themselves. The credential that asked here '
      + 'is one of the operator\'s access tokens for this copy, not a person: a valid signature does '
      + 'not change that, because the credential that carries it in decides when the record changes. '
      + 'Sign in as the member whose key signed it and ratify it there.',
  },
  OPERATOR_TOKEN_CANNOT_RATIFY_CASE: {
    check: 'C-32.15',
    where: 'src/ratification/ops.mjs caseRatifyOp > is-operator-ratify-case',
    translation: 'Ratifying a case commits the group\'s own assertions about it under a member\'s '
      + 'signature, and it is delivered by that member signed in as themselves. The credential that '
      + 'asked here is one of the operator\'s access tokens for this copy, not a person, and a valid '
      + 'signature does not change that. Sign in as the member whose key signed it and ratify it there.',
  },
};

/* C-53.10–C-53.12: the publication fence (moved out of `TESTIMONY_CHECKS`, whose other rows are `provenance`'s). */
export const RATIFY_TESTIMONY_CHECKS = {
  /* MK-1 (A) — THE PUBLICATION FENCE, measured before it was built
     (`test/mk1-publish-probe.mjs`): op=ratify on an observation whose bytes were
     in the working bucket PUBLISHED its words, its provenance document and the
     observer's handle; a finding resting on one, and a case over that finding,
     ratified. MEMBER-KNOWLEDGE-DESIGN.md §4 puts WHAT a published case may show
     of a member's observation at the attesting member's chosen level.
     LIFTED BY MK-7 AS ITS OWN ACT, AND NARROWED RATHER THAN DELETED: the three
     codes now refuse only an observation that still NAMES ITS AUTHOR in its own
     files — one written before MK-6 (§4.1: "Authored bundles written before the
     change carry the member id and STAY FENCED") — and what rests on one. No
     level can hide a name the bundle itself prints, because the level lives
     outside the bundle. Every other observation crosses under C-92. The old
     sentences said the record could not YET honour the choice; since MK-7 it
     can, so they would now be false, and they are corrected, not kept. */
  TESTIMONY_UNPUBLISHABLE: {
    check: 'C-53.10',
    where: 'src/ratification/ops.mjs ratifyOp > is-testimony-publish-bundle',
    translation: 'This document is a member\'s own firsthand observation, recorded before the record stopped '
      + 'writing its author\'s name into the observation\'s own files. Publishing it would publish that name '
      + 'whatever level its author chose, so it is not published. Its author can record it again as a new '
      + 'observation, which names nobody in its files.',
  },
  TESTIMONY_CITED_UNPUBLISHABLE: {
    check: 'C-53.11',
    where: 'src/ratification/ops.mjs ratifyOp > is-testimony-publish-bundle',
    translation: 'This finding rests, directly or through another finding, on a member\'s firsthand '
      + 'observation recorded before the record stopped writing its author\'s name into the observation\'s '
      + 'own files, so it is not published. Rest the finding on a newer observation of the same thing, or '
      + 'publish it without that observation in its basis.',
  },
  TESTIMONY_CASE_UNPUBLISHABLE: {
    check: 'C-53.12',
    where: 'src/ratification/ops.mjs caseRatifyOp > is-testimony-publish-case',
    translation: 'A finding in this case rests, directly or through another finding, on a member\'s '
      + 'firsthand observation recorded before the record stopped writing its author\'s name into the '
      + 'observation\'s own files, so the case is not published: that name would be published whatever '
      + 'level its author chose. Rest the finding on a newer observation, or leave it out of this edition.',
  },
};

/* C-92.10–C-92.12: the attribution gate (MEMBER-KNOWLEDGE-DESIGN.md §4.4; moved out of `ATTRIBUTION_CHECKS`, whose
   C-92.1–C-92.9 are `publication`'s). */
export const RATIFY_ATTRIBUTION_CHECKS = {
  /* PROVISIONAL (§4.4, carried to Bob): THE NARROW VETO. An edition reaching an unchosen observation is not
     signed, so each member has a veto over the use of their own words and over nothing else: the owner's
     recourse is an edition without the finding that rests on it. */
  ATTRIBUTION_UNCHOSEN: {
    check: 'C-92.10',
    where: 'src/ratification/ops.mjs caseRatifyOp > is-attribution-gate',
    translation: 'This case edition uses a member\'s firsthand observation whose author has not yet chosen how '
      + 'it is attributed, so it cannot be signed. Publishing it at any level would be choosing for them. Ask '
      + 'the author to choose, or prepare the edition without the finding that rests on it.',
  },
  ATTRIBUTION_STATEMENT_STALE: {
    check: 'C-92.11',
    where: 'src/ratification/ops.mjs caseRatifyOp > is-attribution-gate',
    translation: 'This case document states an attribution for an observation that its author\'s choices no '
      + 'longer give. Prepare the case document again so it states what the authors chose, then sign that.',
  },
  ATTRIBUTION_UNSTATED: {
    check: 'C-92.12',
    where: 'src/ratification/ops.mjs ratifyOp > is-attribution-ratify',
    translation: 'This observation\'s words are published only beside a signed case that states whose they '
      + 'are, and no signed case does yet. Sign the case document that uses it first.',
  },
};

/* REC-167 / C-65 — A CASE DOCUMENT IS SIGNED ONLY WHILE ITS PROJECT STILL STANDS ON THE CONCLUSION
 * IT RECORDS (INVESTIGATIVE-SESSION.md §7.1 item 4: `NOT_CONCLUDED` at `op=caseratify` reads the
 * publishing project's relationship; item 9's comparison, asked of the one document being signed).
 * Measured before this existed (M-92, REC-157): a project concluded, `op=publish` prepared an edition
 * whose document recorded that conclusion, the project WITHDREW, and `op=caseratify` still committed
 * the edition — the signed record then said the project stood on a conclusion it had given up. Asked
 * in `ratifyCaseDocument`, per roster member, after the owner-signer check and the idempotent retry
 * and before any write: the question must be concluded for the document's project AND that
 * conclusion must be the one the document records. The route out is item 9's: publish again. */
export const CASE_CONCLUSION_CHECKS = {
  CASE_CONCLUSION_MOVED: {
    check: 'C-65.1',
    where: 'src/ratification/index.mjs ratifyCaseDocument > is-caseratify-conclusion-moved',
    translation: 'This case document records a conclusion its project no longer stands on: since the '
      + 'document was prepared, the project withdrew that conclusion or concluded again differently. '
      + 'Signing it would publish a conclusion nobody holds. Nothing was committed. Publish the case '
      + 'again from the project, so the document records what the project stands on now, and sign that.',
  },
};

/* REC-140 / C-58 — WHAT `op=ratify` MAY PUBLISH AT ALL (BIO_Publication_v0_1.md §3 rule 2,
 * *"Only findings that are part of a project can be published"*, as BOB #15 applied it to
 * D-429 on 2026-09-18). A PROJECT's own document is the group's thinking, not a finding: a
 * project publishes THROUGH ITS CASES (DEC-72), so the project bundle is refused by type,
 * whoever signs and whoever delivers — its owner included. Measured before this existed
 * (`test/ratify-authority.test.mjs`): an enrolled administrator with no role in a project,
 * carrying the signature of a member who was neither its owner nor a participant, PUBLISHED
 * the project's own document under that member's name. Asked AFTER sight (a caller who
 * cannot see the project is answered as for a bundle that does not exist, so this refusal is
 * said only to someone who can already see it) and BEFORE the signature is weighed. */
export const RATIFY_SCOPE_CHECKS = {
  RATIFY_PROJECT_BUNDLE: {
    check: 'C-58.1',
    where: 'src/ratification/ops.mjs ratifyOp > is-ratify-project-bundle',
    translation: 'A project\'s own document is not published. A project publishes through its cases: '
      + 'publish a case from the project, have an owner sign the case document, and then ratify the '
      + 'findings in it. Nothing was published.',
  },
  /* D-431 (2026-09-19, IC-161): `op=ratify` PUBLISHES NOTHING OUTSIDE A RATIFIED CASE
   * (BIO_Publication_v0_1.md §3 rule 2, the second note, BOB #16). REC-140 measured three
   * publications outside a case and pinned them as measured: an information bundle in no case, a
   * concluded inquiry in no case, and a finding prepared into a case whose document was not yet
   * ratified. Both codes are refused in `Store#publish`, in its transaction, before the edition
   * refusals and the retry, and ONE region carries both, because the one condition — no ratified
   * case pins this sha and none of their pinned findings rests on this bundle — is split only by
   * what the bundle IS. */
  RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE: {
    check: 'C-58.2',
    where: 'src/ratification/index.mjs publish > is-ratify-outside-a-case',
    translation: 'A finding is published only as part of a case its project has ratified, and no ratified '
      + 'case holds this version of it. Publish it into a case from its project, have an owner of the '
      + 'project sign the case document first, and then ratify this finding at the version the case '
      + 'holds. Nothing was published.',
  },
  RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE: {
    check: 'C-58.3',
    where: 'src/ratification/index.mjs publish > is-ratify-outside-a-case',
    translation: 'This is published only as evidence for a case, and no finding in any ratified case '
      + 'rests on it. Cite it from a finding, publish that finding\'s case and have an owner of the '
      + 'project sign the case document; an owner of that project can then sign this. Nothing was '
      + 'published.',
  },
};

const FAMILIES = [RATIFY_MACHINE_FENCE_CHECKS, RATIFY_TESTIMONY_CHECKS, RATIFY_ATTRIBUTION_CHECKS,
                  CASE_CONCLUSION_CHECKS, RATIFY_SCOPE_CHECKS];

/** DEC-49: a refusal code's `{code, check, translation}`, from the one row that holds it. IT THROWS RATHER THAN
 *  RETURNING A PARTIAL ROW: a code with no canned sentence behind it must not reach a member, and a throw is loud where
 *  a missing sentence is silent. */
export function rowOf(code) {
  for (const fam of FAMILIES) {
    const row = fam[code];
    if (row && typeof row.translation === "string" && row.translation)
      return { code, check: row.check, translation: row.translation };
  }
  throw new Error(`ratification: ${code} has no catalogue row with a canned translation (DEC-49).`);
}

/* ===========================================================================
 * C-2.8's CASE-MEMBER ARM, WHERE IT RUNS (R9; Decided 2)
 *
 * The catalogue's `checkInquiryExtension` no longer calls `checkPublishedExtension`, so the arm runs where this module
 * registers it: as a promotion check (promotion R39), as an audit check (record-core R59) and at `op=ratify`'s gate,
 * after the catalogue, over the same image (as `withBiasChecks` and `withRegisterChecks` do). Each asks it only of
 * bytes `isCaseMemberBytes` answers true for, which is the condition the catalogue asked it under.
 * ========================================================================= */

/** R9: the case-member findings of one document's front matter, or none when its bytes are not a case member's. */
export function caseMemberFindings(fm) {
  if (!fm || typeof fm !== "object" || !isCaseMemberBytes(fm)) return [];
  const out = [];
  checkPublishedExtension(fm, out);
  return out;
}

/** R9: the same over a gate image (`{path: text | {blobSha}}`) or an audit image (`{files: Map}`): its `bundle.md`'s
 *  front matter, parsed by the catalogue's parser. A document held as a blob, or with no readable front matter, is not
 *  asked (the catalogue refuses those itself). */
export function caseMemberImageFindings(image, parse) {
  const md = image && image.files instanceof Map ? image.files.get("bundle.md") : image ? image["bundle.md"] : null;
  const text = typeof md === "string" ? md : md instanceof Uint8Array ? new TextDecoder().decode(md) : null;
  if (text === null) return [];
  let fm = null;
  try { fm = parse(text).data; } catch { fm = null; }
  return caseMemberFindings(fm);
}

/** R9: a ratify gate's answer with the case-member arm's errors joined to its findings, `withBiasChecks`' shape. */
export function withCaseMemberChecks(image, gate, parse) {
  const errs = caseMemberImageFindings(image, parse).filter((x) => x.severity === "error")
    .map((x) => ({ check: x.check, detail: x.message, ...(x.repairs ? { repairs: x.repairs } : {}) }));
  if (!errs.length || !gate || typeof gate !== "object") return gate;
  return { ...gate, ok: false, findings: [...(Array.isArray(gate.findings) ? gate.findings : []), ...errs] };
}

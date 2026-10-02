// @ts-check
/* record-grammar: the grade vocabulary (R16–R18). Moved from the check catalogue at T18 with its comments;
   `EARNED_SOURCE_AXIS` and the arms (`checkEarnedLeg`, `checkTestimonyLeg`) that read these are inquiry-grammar's. */

/* REC-11: the basis leg vocabularies, exported so op=affordances can publish
   them the way it publishes the disposition set, and so no surface keeps a
   copy. GRADE_AXES is single-column by RECONCILED R2's own reasoning: a leg
   asserts ONE grade for ONE reason, and two grade columns would create a place
   to state two. GRADE_SOURCES carries 'hunch' per DEC-15: an authored
   connection grade with an author and a date, the only authored grade
   permitted above D, HUNCH DEBT until cleared (BIO_Declared_Bias_v0_1.md).
   D-188 / DEC-46 (d): HUNCH debt, not "bias debt" — the hunch is the ONE kind
   of declared bias that DISQUALIFIES publication (DEC-20); ordinary bias debt
   is DISCLOSED and travels with every published case. */
export const BASIS_ROLES = ['supports', 'cuts_against'];
export const BASIS_GRADES = ['A', 'B', 'C', 'D'];
/* MK-2 / D-184 / IC-142: A THIRD AXIS, `testimony` — MEMBER-KNOWLEDGE-DESIGN.md
   §3, and the reason it is an axis rather than a label is DEC-21's amendment:
   the capture axis measures THE ACT OF READING A DOCUMENT IN, and a member's
   own authored words were not read in from anywhere. Grading an observation
   "capture D" would make one axis mean two things — how faithfully we obtained
   a source's bytes, and whose word the bytes are — which is the combining
   DEC-21 exists to prevent. So a leg citing an authored bundle carries its
   grade on THIS axis, and only at TESTIMONY_GRADE, and its capture axis is not
   applicable and says so (checkTestimonyLeg below refuses the rest by name).
   APPENDED, so `connection` keeps index 1 for every reader that addressed it
   positionally. */
export const GRADE_AXES = ['capture', 'connection', 'testimony'];
/* MK-2: THE ONE LETTER A TESTIMONY IS WORTH, declared once so its readers
   compose it rather than type it. The ruling
   is Bob's, 2026-09-14 (MEMBER-KNOWLEDGE-DESIGN.md §1: "graded as testimony
   (D)") and DEC-15's ("a hunch is the only authored grade permitted above D");
   it is a VALUE and not a rank derivation, because "the weakest letter" and
   "what testimony is worth" are two facts that merely coincide today. */
export const TESTIMONY_GRADE = 'D';
/* 'inherited' joins with REC-14: a leg resting on a PUBLISHED case does not
   earn its grade and does not author it — it takes the grade that case froze
   when the group signed it, on the same axis, and says so.

   'capture' joins with REC-18, and it is the CAPTURE-axis twin of 'resolution'.
   Before it, the four sources above were all sources for a CONNECTION grade and
   the capture axis had no honest name to give — so a capture-axis grade on an
   INFO- leg was AUTHORED outright, with nothing between a member and typing A
   for bytes that arrived like any other. R2-g is the landed doctrine it now
   enforces: "Grade B is what a direct capture by this instance is worth; it is
   not Grade A and this surface will not say it is". Both EARNED sources are
   computed server-side and REFUSED when a caller's value differs from what the
   record holds — an equality a caller can hand us is one a caller can invent
   (CLAUDE.md). */
export const GRADE_SOURCES = ['resolution', 'testimony', 'hunch', 'inherited', 'capture'];

/* REC-18: the two EARNED sources, named once so no arm below spells them and
   the store's registry builder and this grammar cannot drift about which is
   which. A caller may WRITE either — what a caller may not do is write a VALUE
   the record did not earn, which is what the arms in checkEarnedLeg enforce. */
export const EARNED_GRADE_SOURCES = ['resolution', 'capture'];

/* REC-43 / DEC-39: THE CAPTURE-AXIS CEILING, AND THE LETTER ABOVE IT.
 *
 * MOVED HERE from `Store.EARNED_CAPTURE_CEILING` (src/store.mjs), and the move
 * is the only interesting thing about this item, so it is stated rather than
 * left to be inferred. The DOCTRINE is unchanged and is R2-g's: "Grade B is
 * what a direct capture by this instance is worth; it is not Grade A and this
 * surface will not say it is" (SB-EVIDENCE 908-910). Grade A needs a
 * chain-of-custody web archive, which CAPTURE-FIDELITY.md states plainly is out
 * of a Worker's reach and is NOT CLAIMED. The day a group can produce a WACZ
 * this is one arm, not a redesign.
 *
 * WHY IT LIVES HERE NOW, and the direction is the whole of REC-43's design.
 * DEC-39 rules that the plane publishes the co-attestation honesty fence with
 * the act, and that fence's two grade letters ARE this rule — so the wording
 * must be composed from this value rather than typed beside it, or the sentence
 * a member reads and the rule the gate runs can drift apart silently. The
 * wording is published from `src/affordances.mjs` (DEC-8: a surface renders
 * what it received and never composes a prompt of its own), and that module
 * could not import `store.mjs` — the legacy store, since retired, imported IT
 * (DISPOSITIONS, REOPENABLE_FROM, deriveActs), so the import would have closed a
 * cycle and evaluated a top-level object literal against bindings still in the
 * temporal dead zone. That is the same wall REC-35 hit and wrote up on VOCABULARIES.
 *
 * SO THE CONSTANT MOVES TO THE LOWEST LAYER BOTH SIDES ALREADY IMPORT, which is
 * this file — and this is not a demotion of the store's authority but a
 * promotion to where the REFUSAL is actually computed. `checkEarnedLeg`
 * (inquiry-grammar's today) is the arm that refuses a leg claiming MORE than the
 * ceiling, and the old battery's earnedbasis.test.mjs arm (c) measured (deleted at
 * T20) that it was the ONLY thing standing between the record and a capture grade
 * the record cannot support. The earned registry that arm reads, the legacy
 * store's `earnedBasisRegistry` then and inquiry's `earnedForDoc` today, IMPORTS
 * this value to build it. One value, three readers (the registry, the refusal, the
 * published fence), no copy — the DISPOSITIONS/REC-11 arrangement exactly.
 *
 * AND THE LETTER ABOVE IT IS DERIVED, NOT TYPED. "It never reaches Grade A" is
 * true because A is one rank stronger than the ceiling in the SAME array
 * `checkEarnedLeg` compares against — so it is read out of that array rather
 * than written down a second time. If a future ceiling were the strongest grade
 * there would BE no unreachable letter, and this is null rather than a lie; the
 * fence composer refuses to compose a sentence it cannot make true. */
export const EARNED_CAPTURE_CEILING = 'B';
export const UNREACHABLE_CAPTURE_GRADE =
  BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1] ?? null;

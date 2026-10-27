/* strength's refusal rows (requirements: `build/requirements/strength.md`, R7, R10, R11, R15, R24, R40). DEC-49: every
 * refusal this module answers carries its code, its catalogue row and the member's translation.
 *
 * Moved here from the check catalogue with their ids and translations unchanged (K6, R24): C-30 (the pair over a
 * version, with its default state set and the hunch roster), C-71 (independence over a partition) and C-32.9
 * (`MACHINE_CANNOT_DECLARE`, from `MACHINE_FENCE_CHECKS`). R15's new refusal, `STRENGTH_BAR_NOT_ADMIN`, is this
 * module's own family, C-107, allocated at the extraction (K107 (3), K181), and so is R15's `BAD_GRADE` (N208, K275),
 * and R15's `BAR_NO_REASON` (DEC-88; K1025, C-107.3, stamped by 1.53.0). T47 (R40; N976, K3003): a project's own bar is
 * set by a served act, refused `PROJECT_BAR_NO_REASON` (C-107.4) without its reason; `MACHINE_CANNOT_DECLARE` and
 * `BAD_GRADE` are each minted at one site, the one function both bar acts answer through (K231), so their `where`s name
 * those functions, their codes, numbers and translations unchanged. */

import { VERSION_STATES } from "../basis-versions/index.mjs";
import { word, localize } from "../setup-words/index.mjs";

const at = (fn, region) => `src/strength/index.mjs ${fn} > ${region}`;

/* ===========================================================================
 * C-30 — THE STRENGTH PAIR OVER A VERSION (PL-14 / IS-7,
 * INVESTIGATIVE-SESSION.md §12). Nine rows. PL-14 allocated them one family lower
 * and they were renumbered at integration, because PL-11 had taken that family.
 *
 * WHY A FAMILY AT ALL FOR A PURE READ. §14b.4's rule is that every refusal a
 * design promises BY NAME is a C-number in this catalogue, and this read
 * refuses six things a caller can actually do wrong — most importantly asking
 * for a pair over a reading NOBODY HAS ADOPTED, which §6.6 makes legal only by
 * WIDENING THE STATE SET rather than by making the reading current.
 *
 * TWO OF THE NINE ARE SELF-GUARDS AND THAT IS DELIBERATE (C-30.7, C-30.8).
 * PL-4 DELETED C-28.12 because the composer could not produce the condition at
 * all — an empty gate, a code nobody could ever drive. These two are the other
 * case and the difference is worth stating so the next allocator does not read
 * one as the other: **the builder CAN produce both conditions the moment an
 * edit composes the two axes or drops the state-set line**, which is precisely
 * what R2's forbidden composition and DEC-40's stripped filter line are. They
 * are DRIVEN — `test/m/strength/version.test.mjs` (R10, R24) arms each one
 * through `refusePairComposed` — so neither is a refusal nobody can prove fires.
 *
 * NO MEMBER-FACING TRANSLATION BELOW SAYS "ground", "partition", "AND" or "OR"
 * as a member-facing word (DEC-32's elicitation clause 1, D-226). The
 * vocabulary is the analyst's and a member who must learn it to read a strength
 * will read a worse strength.
 * ========================================================================= */
export const VERSION_STRENGTH_CHECKS = Object.freeze({
  VERSION_STRENGTH_NO_INQUIRY: {
    check: 'C-30.1',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_NO_INQUIRY'),
  },
  VERSION_STRENGTH_NOT_AN_INQUIRY: {
    check: 'C-30.2',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_NOT_AN_INQUIRY'),
  },
  /* THE FOUR BEATS' FIRST BEAT, one altitude down from PL-2's acts and for the
     same reason: there is no "the latest reading" and no default. A strength
     computed over a reading the caller did not mean is a number about the wrong
     thing, which is worse than being asked which was meant. */
  VERSION_STRENGTH_NO_VERSION: {
    check: 'C-30.3',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_NO_VERSION'),
  },
  VERSION_STRENGTH_NO_SUCH_VERSION: {
    check: 'C-30.4',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_NO_SUCH_VERSION'),
  },
  VERSION_STRENGTH_UNKNOWN_STATE: {
    check: 'C-30.5',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_UNKNOWN_STATE'),
  },
  /* §6 rule 6, and it is the mechanism rather than a nicety: *"Exploring an
     unaccepted version is done by CALCULATING OVER IT, never by making it
     current."* So this is not a dead end — it names the widening that turns the
     request into an honest WHAT-IF, and the what-if answer then carries its own
     state-set line (DEC-40) wherever it renders. */
  VERSION_STRENGTH_STATE_EXCLUDED: {
    check: 'C-30.6',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_STATE_EXCLUDED'),
  },
  /* DEC-44 determination 1, at the version altitude: *"A case does NOT compose a
     super-conclusion over them and MUST NOT derive a single case-level
     strength — that would be R2's forbidden composition at a new altitude, and
     it is exactly the 'one letter' the project has refused four times."* The
     same refusal one altitude DOWN, because the temptation is identical and the
     harm is identical: two measurements over two populations reported as one
     number is the record claiming something neither population supports. */
  VERSION_STRENGTH_COMPOSED: {
    check: 'C-30.7',
    where: at('refusePairComposed', 'is-pair-composed'),
    translation: word('refusal.VERSION_STRENGTH_COMPOSED'),
  },
  /* DEC-40 determination 2, and its own negative control: *"a filtered
     rendering states its filter IN DEC-34's per-page header … An unfiltered
     rendering says so too, or absence of the line becomes the ambiguity."* §12
     transplants it verbatim: *"A what-if pair carries its state-set line
     wherever it renders."* So EVERY answer carries the line, including the
     default one — an answer with no line is the shape a reader cannot tell from
     the record's own. */
  VERSION_STRENGTH_UNFILTERED: {
    check: 'C-30.8',
    where: at('refusePairComposed', 'is-pair-composed'),
    translation: word('refusal.VERSION_STRENGTH_UNFILTERED'),
  },
  VERSION_STRENGTH_TOO_MANY_STATES: {
    check: 'C-30.9',
    where: at('versionStrength', 'is-version-strength'),
    translation: word('refusal.VERSION_STRENGTH_TOO_MANY_STATES'),
  },
});

/* The state set the pair is computed over WHEN NOBODY SAYS OTHERWISE, and it is
   `accepted` alone. §12: *"The strength function takes an argument naming which
   states to factor in, defaulting to accepted. Safe by default, and it is also
   how §6.6's exploration works."* SAFE BY DEFAULT is the load-bearing half: a
   caller who says nothing gets the record's own answer over the reading a
   member adopted, never a number a machine proposed and nobody stood behind.
   DERIVED from `VERSION_STATES` rather than typed beside it, so a vocabulary
   that moves cannot leave this naming a state that no longer exists. */
export const VERSION_STRENGTH_DEFAULT_STATES =
  VERSION_STATES.filter((s) => s === 'accepted');

/* THE HUNCH RULE (R5, R9; INVESTIGATIVE-SESSION §12: *"A leg marked as a HUNCH … is visible as such and does not
   count as evidence"*). A leg whose grade source is in this roster is INERT in every pair, the live one (`strengthOf`)
   and the one over a version alike, and is NAMED as a hunch. Until K102 the live pair counted a hunch at its stated
   grade (DEC-15's "composes normally") while this altitude did not, so two strengths of one reading could differ; Bob
   ruled for §12 (K102), and both reads now take the rule from here. HUNCH DEBT still refuses publication. */
export const VERSION_STRENGTH_INERT_SOURCES = ['hunch'];

/* ===========================================================================
 * C-71 — THE INDEPENDENCE OF A PROPOSED PARTITION (REC-161,
 * INVESTIGATIVE-SESSION.md §12 clause (c), BOB #22 2026-09-21).
 *
 * `op=partitionindependence` answers D-195's question — do these parts share an
 * upstream origin — for a partition of a question's reasons that NOBODY HAS
 * WRITTEN YET, so the elicitation's read-back can name every shared origin
 * BEFORE the member's answers are written. It is gated as `op=versionstrength`
 * is and writes nothing. C-71 was minted as a family of its own (by the old
 * process's id tool, since retired) rather than taken as C-30.n: the op is a second door onto `#independenceOf`, not a second
 * strength read, and none of these refusals is a statement about a strength.
 * =========================================================================== */
export const PARTITION_INDEPENDENCE_CHECKS = Object.freeze({
  PARTITION_INDEPENDENCE_NO_INQUIRY: {
    check: 'C-71.1',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_NO_INQUIRY'),
  },
  PARTITION_INDEPENDENCE_NOT_AN_INQUIRY: {
    check: 'C-71.2',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_NOT_AN_INQUIRY'),
  },
  PARTITION_INDEPENDENCE_UNREADABLE: {
    check: 'C-71.3',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_UNREADABLE'),
  },
  PARTITION_INDEPENDENCE_UNKNOWN_LEG: {
    check: 'C-71.4',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_UNKNOWN_LEG'),
  },
  PARTITION_INDEPENDENCE_LEG_TWICE: {
    check: 'C-71.5',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_LEG_TWICE'),
  },
  PARTITION_INDEPENDENCE_NOT_TOTAL: {
    check: 'C-71.6',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_NOT_TOTAL'),
  },
  PARTITION_INDEPENDENCE_TOO_MANY_LEGS: {
    check: 'C-71.7',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_TOO_MANY_LEGS'),
  },
  /* REC-192 — THE VERSION ARM (BOB #31, 2026-09-23 22:22Z): the same read over a WRITTEN reading's
     groups, answering independence on its own with no strength beside it. Two refusals the arm owes,
     numbered on in C-71 because they are refusals of the same op and neither is a statement about a
     strength. */
  PARTITION_INDEPENDENCE_TWO_SUBJECTS: {
    check: 'C-71.8',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_TWO_SUBJECTS'),
  },
  PARTITION_INDEPENDENCE_NO_SUCH_VERSION: {
    check: 'C-71.9',
    where: at('partitionIndependence', 'is-partition-independence'),
    translation: word('refusal.PARTITION_INDEPENDENCE_NO_SUCH_VERSION'),
  },
});

/* ===========================================================================
 * The bar (R15, R40): the group's default and a project's own. C-32.9 moved from the machine fences, where it was the one of the twelve that fully
 * succeeded under a complete payload when its predicate was neutered (D-229). C-107.1 is K102's: the default a new
 * project starts from is set by an active administrator, as an organisation-wide AI key is (membership R62).
 * =========================================================================== */
export const STRENGTH_BAR_CHECKS = Object.freeze({
  MACHINE_CANNOT_DECLARE: {
    check: 'C-32.9',
    where: at('machineCannotDeclare', 'is-machine-strength-bar'),
    translation: word('refusal.MACHINE_CANNOT_DECLARE'),
  },
  STRENGTH_BAR_NOT_ADMIN: {
    check: 'C-107.1',
    where: at('strengthBarSet', 'is-admin-strength-bar'),
    translation: word('refusal.STRENGTH_BAR_NOT_ADMIN'),
  },
  /* N208 (K275): this module's own condition, a bar letter outside the grades, with its own row; intent's grade
     refusal is `CONDITION_BAD_GRADE`, another condition (K238). */
  BAD_GRADE: {
    check: 'C-107.2',
    where: at('badGrade', 'is-strength-bar-grade'),
    translation: word('refusal.BAD_GRADE'),
  },
  /* DEC-88 (K1025): the administrator's own words on why the group sets this bar, recorded with it and answered beside
     it, because a standard set for everyone's work with no reason given is one nobody can weigh or answer. */
  BAR_NO_REASON: {
    check: 'C-107.3',
    where: at('strengthBarSet', 'is-strength-bar-reason'),
    translation: word('refusal.BAR_NO_REASON'),
  },
  /* R40 (T47; N976, K3003): a project's own standard of evidence, set by a member of the project, is recorded with the
     member's own words on why, as the group's default is (C-107.3), because a bar raised or lowered with no reason given
     is one nobody can weigh. */
  PROJECT_BAR_NO_REASON: {
    check: 'C-107.4',
    where: at('projectBarSet', 'is-project-bar-reason'),
    translation: word('refusal.PROJECT_BAR_NO_REASON'),
  },
  /* R45 (T51 fix round 10; K5157): a second owner's save from a page that showed the bar before another owner changed it
     writes nothing and says so, with the bar now held. The sentence is a stand-in until the design list holds the row
     (K3930, K3943). */
  BAR_STALE: {
    check: 'C-107.5',
    where: at('projectBarSet', 'is-project-bar-fresh'),
    translation: localize('refusal.BAR_STALE',
      "This project's bar changed after you opened it, so your change was not saved. The bar it holds now is shown. Read it, then set yours again if you still mean to."),
  },
});

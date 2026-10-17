/* promotion's own refusal rows: the write door's refusals, held here, in this module (moved from the retired catalogue, T18, K647).
 *
 * Each row is `{check, translation}`, the shape of the catalogue's DEC-49 rows, so a refusal carries its check id and
 * a member-facing translation (the requirements' "Errors" for `promote`). C-86.5 to C-86.14 were written for `op=promote` by the
 * Batch30 rows D-546, D-578, D-615, D-628, D-692, D-707 and D-726 (never landed; reachable on
 * `snapshot/pre-refactor-2026-09-25`'s branches), and are carried here with their wording. `BUNDLE_ID_DISAGREES`
 * (R14, D-738) is the catalogue's C-1.1 asked at the door through record-grammar's `idDisagrees`; `BUNDLE_MD_UNREADABLE`
 * (R17, D-741) is C-2.1's, refused on any C-2.1 finding of record-grammar's parser (R38, N854).
 *
 * Each row's `where` names the marked region of `promote` that mints its code (N118; the catalogue's "WHAT A `where`
 * MEANS", REC-71), so the DEC-49 guard reads exactly that span. The four codes that name what the request must carry
 * share one region, whose every refusal is one of them.
 *
 * C-86.1–C-86.4 (`PROMOTED_TYPE_CHECKS`) and C-97 (`PROJECT_CREATION_VISIBILITY_CHECKS`), the families only this
 * module mints, moved here whole from the catalogue in T18 (K586 BOB-1, K636), each row unmoved: their notes follow.
 *
 * Each row's `translation` is its word, read by key (`refusal.<CODE>`, setup-words' `word`; N1116): the module holds no
 * member-facing English of its own for a refusal the design keyed.
 */

import { word } from "../setup-words/index.mjs";

export const PROMOTION_CHECKS = {
  STATE_MOVE_UNDECLARED: {
    check: "C-86.6",
    where: "src/promotion/index.mjs #promote > is-state-move-undeclared",
    translation: word("refusal.STATE_MOVE_UNDECLARED"),
  },
  PROMOTED_TYPE_UNSTATED: {
    check: "C-86.5",
    where: "src/promotion/index.mjs #promote > is-promoted-type-unstated",
    translation: word("refusal.PROMOTED_TYPE_UNSTATED"),
  },
  ENVELOPE_DATES_DISAGREE: {
    check: "C-86.7",
    where: "src/promotion/index.mjs #promote > is-promoted-dates-disagree",
    translation: word("refusal.ENVELOPE_DATES_DISAGREE"),
  },
  PROMOTED_FIELD_UNSTATED: {
    check: "C-86.8",
    where: "src/promotion/index.mjs #promote > is-promoted-field-unstated",
    translation: word("refusal.PROMOTED_FIELD_UNSTATED"),
  },
  REVISION_REDATES_CREATION: {
    check: "C-86.9",
    where: "src/promotion/index.mjs #promote > is-revision-redates-creation",
    translation: word("refusal.REVISION_REDATES_CREATION"),
  },
  PROMOTE_SNAP_KEY_UNSTATED: {
    check: "C-86.10",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: word("refusal.PROMOTE_SNAP_KEY_UNSTATED"),
  },
  PROMOTED_FILE_PATH_UNSTATED: {
    check: "C-86.11",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: word("refusal.PROMOTED_FILE_PATH_UNSTATED"),
  },
  PROMOTED_FILE_CONTENT_UNSTATED: {
    check: "C-86.12",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: word("refusal.PROMOTED_FILE_CONTENT_UNSTATED"),
  },
  PROMOTED_FILE_BYTES_UNSTATED: {
    check: "C-86.13",
    where: "src/promotion/index.mjs #promote > is-promote-request-named",
    translation: word("refusal.PROMOTED_FILE_BYTES_UNSTATED"),
  },
  REVISION_REGROUPS_BUNDLE: {
    check: "C-86.14",
    where: "src/promotion/index.mjs #promote > is-revision-regroups-bundle",
    translation: word("refusal.REVISION_REGROUPS_BUNDLE"),
  },
  /* R56 (K899 (3), K904, N456; Bob's form (b)): a project's stage is computed (`project-stage` R2), so a creation stating
     any other stage than `forming` or `closed` is refused; a revision's move is R15's over the declared table. */
  PROJECT_STAGE_COMPUTED: {
    check: "C-86.15",
    where: "src/promotion/index.mjs #promote > is-project-stage-computed",
    translation: word("refusal.PROJECT_STAGE_COMPUTED"),
  },
  /* R57 (T45; N892; Actions D4, v0.2 rules 15, 16): a counsel matter is never evidence. A leg or a live `cites` entry
     this promotion newly names, resting on a bundle of a project whose scope is `counsel_matter` (`project-roster`
     R23), is refused unless the citing document is of that same project. */
  COUNSEL_MATTER_NOT_EVIDENCE: {
    check: "C-86.16",
    where: "src/promotion/index.mjs #promote > is-counsel-matter-evidence",
    translation: word("refusal.COUNSEL_MATTER_NOT_EVIDENCE"),
  },
  BUNDLE_ID_DISAGREES: {
    check: "C-1.1",
    where: "src/promotion/index.mjs #promote > is-promote-bundle-id",
    translation: word("refusal.BUNDLE_ID_DISAGREES"),
  },
  BUNDLE_MD_UNREADABLE: {
    check: "C-2.1",
    where: "src/promotion/index.mjs #promote > is-promote-readable",
    translation: word("refusal.BUNDLE_MD_UNREADABLE"),
  },
};

/* D-510 / C-86 — THE PROMOTED DOCUMENT DECLARES ITS OWN TYPE (`BIO_Case_Making_v0_1.md` §2; C-2.5 already
 * pins a document's type to its id prefix). ONE refusal, and the family is one row rather than padded out,
 * because there is exactly one way for the two statements to be wrong about each other.
 * D-547 adds C-86.2 below: not a third statement, but the request against the RECORD's head.
 *
 * WHY IT IS A REFUSAL AND NOT A SILENT NORMALISATION, which was the alternative the row licensed: the
 * request carries TWO statements of what is being promoted — the document's own `object_type`, which every
 * column of the projection is already read from, and the envelope's `meta.object_type`, which `promote`
 * wrote into `bundles.object_type` and gated the action, bias and inquiry projections on. Obeying the
 * envelope filed an ACTION as information with its risk tier in the bytes and its basis and correspondence
 * never projected: a record holding an action it does not index as one. Obeying the document SILENTLY would
 * be the other half of the same defect — the caller asked for one thing and got another, and nothing said
 * so. So the record takes the DOCUMENT's word (the bytes are what it holds) and REFUSES the request that
 * contradicts it, naming both answers, before anything is written.
 *
 * THE COMPARISON GOES THROUGH `normalizeType` ON BOTH SIDES, so `focus` and `problem` — legal legacy
 * spellings of `inquiry` (REC-10) — are not disagreements. A fence tighter than its rule is not a safer
 * fence. A document that states NO type is not a disagreement either: the envelope is then all there is. */
export const PROMOTED_TYPE_CHECKS = {
  ENVELOPE_TYPE_DISAGREES: {
    check: 'C-86.1',
    where: 'src/promotion/index.mjs #promote > is-promoted-type-disagrees',
    translation: word("refusal.ENVELOPE_TYPE_DISAGREES"),
  },
  /* D-547 (2026-09-25) — the SECOND way a promotion's type can be wrong, and it is not the first one twice: C-86.1
   * compares the two statements in ONE request; this compares the request with the RECORD. A revision whose document
   * names a different type than the bundle already holds would rewrite `bundles.object_type` in place, and every
   * type-scoped fence would then ask the wrong machine. Replay is exempt, as for C-86.1. */
  REVISION_RETYPES_BUNDLE: {
    check: 'C-86.2',
    where: 'src/promotion/index.mjs #promote > is-promote-retypes-bundle',
    translation: word("refusal.REVISION_RETYPES_BUNDLE"),
  },
  /* D-563 (2026-09-25) — C-86.1's rule one field over, twice: the document states what it is CALLED and where it STANDS,
   * and a request whose label contradicts either is refused rather than obeyed. The name is what 7.1 holds unique and
   * the state decides who may move the item (7.11) and what may cite it (REC-181), so a label a caller can steer was
   * an authority over both. Only a contradiction between two statements: a label stating nothing takes the document's
   * word. Replay is exempt, as for C-86.1. */
  ENVELOPE_TITLE_DISAGREES: {
    check: 'C-86.3',
    where: 'src/promotion/index.mjs #promote > is-promoted-title-disagrees',
    translation: word("refusal.ENVELOPE_TITLE_DISAGREES"),
  },
  ENVELOPE_STATE_DISAGREES: {
    check: 'C-86.4',
    where: 'src/promotion/index.mjs #promote > is-promoted-state-disagrees',
    translation: word("refusal.ENVELOPE_STATE_DISAGREES"),
  },
};

/* REC-197 / C-97 — A CREATION CARRIES ITS SETTING, AND AN OWNERLESS CREATION CANNOT CHOOSE ONE (Membership
 * Architecture v2 §7.14, RULED by BOB #32 (b), 2026-09-23: *"create and fork take one optional field,
 * `visibility` (`discoverable` or `hidden`), and an absent one is HIDDEN. A MACHINE credential never sets it:
 * the setting is an owner's act, and an ownerless project has no owner to choose. Its creation is therefore
 * HIDDEN, and a `visibility=discoverable` it sends is refused by name."*). Its own family, minted, rather than
 * C-70.5 and on, because REC-150 (the request to join) is extending C-70 in parallel. An unknown value on a
 * creation answers C-70.3, the same row the owner's act answers, through one helper. Both codes are minted in
 * `#promote` (the store's `promote` when this note was written), before anything is written; a fork reaches them through `promote`. */
export const PROJECT_CREATION_VISIBILITY_CHECKS = {
  PROJECT_VISIBILITY_NO_OWNER: {
    check: 'C-97.1',
    where: 'src/promotion/index.mjs #promote > is-project-creation-ownerless',
    translation: word("refusal.PROJECT_VISIBILITY_NO_OWNER"),
  },
  PROJECT_VISIBILITY_NOT_A_CREATION: {
    check: 'C-97.2',
    where: 'src/promotion/index.mjs #promote > is-project-creation-visibility',
    translation: word("refusal.PROJECT_VISIBILITY_NOT_A_CREATION"),
  },
};

/* The catalogue's rows for the refusals this module mints, moved here in T19 (plan layer 2, promotion; draft-T19 §41),
 * each line unchanged, so each refusal's row is held where it is minted and the catalogue no longer holds it: from
 * `ACT_SHAPE_CHECKS` C-33.21, C-33.49, C-67.1, C-33.24 and C-33.38; from `MACHINE_FENCE_CHECKS` C-32.5; from
 * `PROJECT_ID_CHECKS` C-59.1–C-59.4 (record-core holds C-59.5); from `REGISTRATION_CHECKS` C-102.4–C-102.9 (record-core
 * holds C-102.1–C-102.3, ratification C-102.10). Their notes travel with them.
 *
 * Two rows were copies in T19, held twice until their other readers re-pointed (rule 1): C-26.12 BIAS_ILLEGAL_TRANSITION
 * (the catalogue's `BIAS_CHECKS`) and C-64.1 GROUP_UNDETERMINED (its `INSTANCE_GROUP_CHECKS`). The catalogue left at
 * T19's close, so each is held once, here (1.50.0). C-64.1 names the region of `#promote` that mints it (R13). */
export const PROMOTION_ROW_CHECKS = {
  CAS_STALE: {
    check: 'C-33.21',
    where: 'src/promotion/index.mjs #promote > is-promote-cas',
    translation: word("refusal.CAS_STALE"),
  },
  /* T4 (legacy-checks, N36), 2026-09-27: promotion R1's other half. A REVISION of a bundle the record does not
     hold, and (R20) of one the caller may not see, which answers exactly as one that does not exist. Numbered in
     this family beside CAS_STALE, R1's third answer; R1's first, EXISTS, is C-96.4. It is minted by ONE literal in
     promotion, at the one region of `#promote` that answers R1's ABSENT (`is-promote-absent`), which the `where` names.
     Two sites outside promotion mint the same code with the same meaning (a bundle by that id that the caller can
     see does not exist): ratification's `gateFacts` (op=ratify) and monitoring's op=monitor, both in `src/store.mjs`
     and `src/index.mjs` when this row was written. The translation is written to be true at all three, and says
     nothing was changed rather than written, because the monitor reads. */
  ABSENT: {
    check: 'C-33.49',
    where: 'src/promotion/index.mjs #promote > is-promote-absent',
    translation: word("refusal.ABSENT"),
  },
  /* REC-176 (the history law, BIO_State_Rules_Consistency_v1_5.md §2.4: "History is append-only; nothing in
     _history/ is ever modified or deleted"). `op=promote` wrote its manifest and history rows with INSERT OR
     REPLACE keyed (bundle_id, snap_key), so a second promotion naming a key the bundle already holds silently
     REPLACED the first promotion's rows. It now refuses that key before anything is written; a byte-identical
     re-send of the promotion that key already names answers ok and writes nothing (§2.4's own convergent rule:
     "the second detects the existing file and skips"). C-67 was minted (with `node tools/mintid.mjs C`, the old
     process's tool, retired with `tools/` in T7) rather than C-33.n, because two parallel promote items took C-33 numbers
     the same day. */
  SNAP_KEY_TAKEN: {
    check: 'C-67.1',
    where: 'src/promotion/index.mjs #promote > is-promote-snapkey',
    translation: word("refusal.SNAP_KEY_TAKEN"),
  },
  FILES_DROPPED: {
    check: 'C-33.24',
    where: 'src/promotion/index.mjs #promote > is-promote-files',
    translation: word("refusal.FILES_DROPPED"),
  },
  /* REC-175 (the Mechanical Verification Law, BIO_State_Rules_Consistency_v1_5.md §8: a stored digest is of the
     stored bytes). `op=promote` wrote the caller's `sha256` for every file, and took bundle.md's as the bundle's
     head, without computing either; it now computes each inline file's digest over its UTF-8 bytes (a blob's is
     its content address) and refuses a supplied value naming another, before anything is written. */
  FILE_DIGEST_MISMATCH: {
    check: 'C-33.38',
    where: 'src/promotion/index.mjs #promote > is-promote-digest',
    translation: word("refusal.FILE_DIGEST_MISMATCH"),
  },
  MACHINE_CANNOT_REOPEN: {
    check: 'C-32.5',
    where: 'src/promotion/index.mjs #reopen > is-machine-reopen',
    translation: word("refusal.MACHINE_CANNOT_REOPEN"),
  },
  BIAS_ILLEGAL_TRANSITION: {
    check: 'C-26.12',
    where: 'src/promotion/index.mjs #promote > bias-state-edge, reached from op=promote',
    translation: word("refusal.BIAS_ILLEGAL_TRANSITION"),
  },
  GROUP_UNDETERMINED: {
    check: 'C-64.1',
    where: 'src/promotion/index.mjs #promote > is-group-undetermined',
    translation: word("refusal.GROUP_UNDETERMINED"),
  },
};

/* REC-141 / C-59 — THE PLANE MINTS PROJECT IDS (Membership Architecture v2 §7), moved from the catalogue's
 * `PROJECT_ID_CHECKS` with its note: a caller-supplied id for a NEW project, any creation in the `PROJ-` namespace, or a
 * fork's `newId` is refused BEFORE any id is looked up, with one answer whether or not the id is taken, and the answer
 * echoes no id. The plane mints the id and writes it into the document's own `id:` before the bytes are hashed. */
export const PROJECT_MINT_CHECKS = {
  PROJECT_ID_SUPPLIED: {
    check: 'C-59.1',
    where: 'src/promotion/index.mjs #promote > is-project-id-supplied',
    translation: word("refusal.PROJECT_ID_SUPPLIED"),
  },
  PROJECT_ID_IN_BYTES: {
    check: 'C-59.2',
    where: 'src/promotion/index.mjs #promote > is-project-id-bytes',
    translation: word("refusal.PROJECT_ID_IN_BYTES"),
  },
  PROJECT_FORK_ID_SUPPLIED: {
    check: 'C-59.3',
    where: 'src/promotion/index.mjs #fork > is-project-fork-id-supplied',
    translation: word("refusal.PROJECT_FORK_ID_SUPPLIED"),
  },
  PROJECT_DOCUMENT_UNREADABLE: {
    check: 'C-59.4',
    where: 'src/promotion/index.mjs #promote > is-project-id-bytes',
    translation: word("refusal.PROJECT_DOCUMENT_UNREADABLE"),
  },
};

/* C-102.4–C-102.9, the registry's own refusals (R39, R40, R47, R33), moved from the catalogue's `REGISTRATION_CHECKS`:
 * FACT_UNAVAILABLE and FACT_FAILED at `fact`, FACT_MALFORMED and STEP_MODULE_UNNAMED at their registrations' named
 * regions, STEP_DECLARED at its one helper (K231), and CASE_CATALOGUE_FAILED at the case gate's one finding (N275). */
export const PROMOTION_REGISTRATION_CHECKS = {
  FACT_UNAVAILABLE: {
    check: 'C-102.4',
    where: 'src/promotion/index.mjs fact',
    translation: word("refusal.FACT_UNAVAILABLE"),
  },
  FACT_FAILED: {
    check: 'C-102.5',
    where: 'src/promotion/index.mjs fact',
    translation: word("refusal.FACT_FAILED"),
  },
  FACT_MALFORMED: {
    check: 'C-102.6',
    where: 'src/promotion/index.mjs registerFact > is-fact-named',
    translation: word("refusal.FACT_MALFORMED"),
  },
  STEP_MODULE_UNNAMED: {
    check: 'C-102.7',
    where: 'src/promotion/index.mjs registerStep > is-step-named',
    translation: word("refusal.STEP_MODULE_UNNAMED"),
  },
  STEP_DECLARED: {
    check: 'C-102.8',
    where: 'src/promotion/index.mjs stepDeclared',
    translation: word("refusal.STEP_DECLARED"),
  },
  CASE_CATALOGUE_FAILED: {
    check: 'C-102.9',
    where: 'src/gate.mjs caseCatalogueFailed',
    translation: word("refusal.CASE_CATALOGUE_FAILED"),
  },
};

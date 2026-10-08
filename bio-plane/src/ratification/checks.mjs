/* ratification — the refusal rows the two ceremonies and the bulk acts answer (requirements:
 * `build/requirements/ratification.md`, R14, R46, R47), and, re-exported, the case-document catalogue and C-2.8's
 * case-member arm, which are `case-catalogue`'s (its R1, R2; K1824), so every importer of these names keeps working
 * (R8, R9; this module registers both with `promotion`). DEC-49: every refusal this module answers carries its code,
 * its catalogue row and the member's translation.
 *
 * The rows moved here from the check catalogue (`legacy-checks`, K6, K94) with their ids, texts and translations
 * unchanged: C-32.12–C-32.15, C-53.10–C-53.12, C-58.1–C-58.5, C-65.1 and C-92.10–C-92.12; copied in T18 (split
 * tables), C-32.1, C-33.10–C-33.12 (the bulk release) and C-102.10; and, new in T34 (DEC-147), C-58.6–C-58.10. A row's
 * `where` names the region in this module that mints it. */

/* R8, R9 (K1824): the pure catalogue, never an index that imports store-bound code (K1317). */
export * from "../case-catalogue/checks.mjs";

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
    where: 'src/ratification/refusals.mjs machineCaseRefusal > is-machine-ratify-case',
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
  /* R47 (DEC-149, N664): "for this copy" is "for your group's Civicsmith". */
  OPERATOR_TOKEN_CANNOT_RATIFY: {
    check: 'C-32.14',
    where: 'src/ratification/ops.mjs ratifyOp > is-operator-ratify-bundle',
    translation: 'Ratifying puts a finding into the published record under a member\'s signature, '
      + 'and it is delivered by that member signed in as themselves. The credential that asked here '
      + 'is one of the operator\'s access tokens for your group\'s Civicsmith, not a person: a valid signature does '
      + 'not change that, because the credential that carries it in decides when the record changes. '
      + 'Sign in as the member whose key signed it and ratify it there.',
  },
  OPERATOR_TOKEN_CANNOT_RATIFY_CASE: {
    check: 'C-32.15',
    where: 'src/ratification/refusals.mjs operatorCaseRefusal > is-operator-ratify-case',
    translation: 'Ratifying a case commits the group\'s own assertions about it under a member\'s '
      + 'signature, and it is delivered by that member signed in as themselves. The credential that '
      + 'asked here is one of the operator\'s access tokens for your group\'s Civicsmith, not a person, and a valid '
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
    where: 'src/ratification/refusals.mjs testimonyCaseRefusal > is-testimony-publish-case',
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
    where: 'src/ratification/refusals.mjs attributionUnchosenRefusal > is-attribution-unchosen',
    /* Re-worded at T28 (N523; DEC-119 (3), K1275): awaiting the T29 stamp. */
    translation: 'This case edition uses a member\'s firsthand observation, or material from an unnamed source a '
      + 'member attests, and that member has not yet chosen how they are credited, so it cannot be signed. Publishing '
      + 'it at any level would be choosing for them. Ask that member to choose, or prepare the edition without the '
      + 'finding that rests on it.',
  },
  ATTRIBUTION_STATEMENT_STALE: {
    check: 'C-92.11',
    where: 'src/ratification/refusals.mjs attributionStaleRefusal > is-attribution-stale',
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
    where: 'src/ratification/refusals.mjs conclusionMovedRefusal > is-caseratify-conclusion-moved',
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
   * ratified. Both codes are refused in this module's `publish` (R5), in its transaction, before the edition
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
  /* DEC-97 (3), K1058: R22's contested arm. Stamped in `CATALOG_VERSION` 1.53.0 (promotion, T23 layer 2). */
  CONTESTED_IN_BATCH: {
    check: 'C-58.4',
    where: 'src/ratification/release.mjs release > is-release-contested',
    translation: 'Some of these documents are contested: a contradiction touching each is not yet resolved, and '
      + 'contested material is never released in a batch. They are named. Nothing was released.',
  },
  /* DEC-102 items 1 and 2, K1058: R35, testimony credited only to the group or the project. Stamped in 1.53.0. */
  ANONYMOUS_TESTIMONY_UNCORROBORATED: {
    check: 'C-58.5',
    where: 'src/ratification/refusals.mjs anonymousTestimonyRefusal > is-anonymous-testimony',
    /* Re-worded at T28 (N523; DEC-119 (3), K1275): awaiting the T29 stamp. */
    translation: 'This edition rests on testimony, or on material from an unnamed source attested by a member, '
      + 'credited only to the group or the project, with no independent leg corroborating it. Such testimony or '
      + 'evidence counts as an anonymous tip and supports a finding only beside an independent corroborating leg. '
      + 'Each such member, observation and document is named. Corroborate the claim with an independent leg, ask '
      + 'the author or the attesting member to choose cover or name, or drop the finding that rests on it. Nothing '
      + 'was signed.',
  },
  /* R46 (DEC-147 (3); T34-85): publishing at a set time. BOB's drafts, which the UX stream may re-word.
     C-58.6 is `op=publishat`'s (R40); C-58.7–C-58.10 are the scheduled publisher's stops (R42). */
  SCHEDULE_UNCHECKABLE: {
    check: 'C-58.6',
    where: 'src/ratification/schedule.mjs scheduleUncheckableRefusal > is-schedule-uncheckable',
    translation: 'Publishing at a set time means checking again at that time everything checked now, and part of it '
      + 'cannot be read now. It is named. Nothing was signed. You can publish now, or try again later.',
  },
  SCHEDULED_SOURCES_CHANGED: {
    check: 'C-58.7',
    where: 'src/ratification/schedule.mjs scheduledStop > is-scheduled-stop',
    translation: 'This edition was not published at its set time: a source it rests on changed since it was signed. '
      + 'It is named. Nothing was published. Prepare and sign the edition again to publish it.',
  },
  SCHEDULED_TIES_CHANGED: {
    check: 'C-58.8',
    where: 'src/ratification/schedule.mjs scheduledStop > is-scheduled-stop',
    translation: 'This edition was not published at its set time: a member who signed it has declared or withdrawn a '
      + 'tie to someone the case names since signing, so their confirmation of no undeclared tie may no longer hold. '
      + 'Nothing was published. Prepare and sign the edition again to publish it.',
  },
  SCHEDULED_HOLD_CHANGED: {
    check: 'C-58.9',
    where: 'src/ratification/schedule.mjs scheduledStop > is-scheduled-stop',
    translation: 'This edition was not published at its set time: a hold on the case or its project changed since it '
      + 'was signed. It is named. Nothing was published. Prepare and sign the edition again to publish it.',
  },
  SCHEDULED_CHECK_REFUSED: {
    check: 'C-58.10',
    where: 'src/ratification/schedule.mjs scheduledStop > is-scheduled-stop',
    translation: 'This edition was not published at its set time: a check made when it was signed no longer passes, '
      + 'or could not be made. The reason is given. Nothing was published. Prepare and sign the edition again to '
      + 'publish it.',
  },
};

/* C-32.1 and C-33.10–C-33.12: the bulk release's refusals (R20, R22; N400, K636), copied from the catalogue's
   `MACHINE_FENCE_CHECKS` and `ACT_SHAPE_CHECKS` with their ids and translations unchanged when `release` moved here
   (`./release.mjs`). Split tables: the catalogue's copies are deleted in T19 (plan T18 rule (3)). */
export const RELEASE_CHECKS = {
  MACHINE_CANNOT_RELEASE: {
    check: 'C-32.1',
    where: 'src/ratification/release.mjs release > is-machine-release',
    translation: 'Moving documents from collected to verified is a decision a named person makes '
      + 'and signs. The credential that asked here is an automated one, so it can gather the batch '
      + 'and lay out the review, and cannot be the one who says the batch is good. Sign in and '
      + 'release it yourself.',
  },
  NO_ACKNOWLEDGMENT: {
    check: 'C-33.10',
    where: 'src/ratification/release.mjs release > is-release-account',
    translation: 'Releasing a batch at once records your explicit acknowledgment that the batch is '
      + 'of a piece and that you weighed the risk of doing them together. Without it the record '
      + 'shows only that a button was pressed.',
  },
  NO_MITIGATION: {
    check: 'C-33.11',
    where: 'src/ratification/release.mjs release > is-release-account',
    translation: 'Releasing a batch at once records what you actually did to check it — what was '
      + 'sampled and what was verified. A concrete note can be audited by somebody later; silence '
      + 'cannot be audited at all.',
  },
  ENTRY_REQUIREMENTS: {
    check: 'C-33.12',
    where: 'src/ratification/release.mjs release > is-release-entry',
    translation: 'Some of these documents are missing something the verified state requires, and '
      + 'releasing them as they stand would produce records the catalog rejects the moment they '
      + 'exist. The offending documents are named so they can be fixed rather than guessed at.',
  },
};

/* C-102.10: the refusal this module's registered promotion step answers (R9), copied from the catalogue's
   `REGISTRATION_CHECKS` with its id and translation unchanged (split tables; T19 deletes the catalogue's copy). */
export const RATIFY_REGISTRATION_CHECKS = {
  CASE_MEMBER_REFUSED: {
    check: 'C-102.10',
    where: 'src/ratification/index.mjs check',
    translation: 'This document claims to be part of a published case, and it does not carry what a part of '
      + 'a published case must carry, so it was not written. Each problem is named beside this message. '
      + 'Nothing in the record changed.',
  },
};

const FAMILIES = [RATIFY_MACHINE_FENCE_CHECKS, RATIFY_TESTIMONY_CHECKS, RATIFY_ATTRIBUTION_CHECKS,
                  CASE_CONCLUSION_CHECKS, RATIFY_SCOPE_CHECKS, RELEASE_CHECKS, RATIFY_REGISTRATION_CHECKS];

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

# case-disclosures — requirements

**Status** · DRAFT by a worker for BOB #106, 2026-10-03, on `tranche/T28` (seam read `build/extraction/case-authoring-split.md`, Appendix A); folded by a fold worker for BOB #106, 2026-10-03, on `prep/T29-folds`, entry N529, ruling K1333 (where K1333 and the seam read differ, K1333 governs). Split from `case-authoring` by K617 and N529: a module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning. R1–R15 are `case-authoring` R31, R35, R36, R37, R43, R44, R45, R46, R47, R48, R49, R50, R51, R52 and R54, and R16 is its R12, each restated at this module's interface as the service `publishCase` asks (`case-authoring` R55), meaning unchanged; the old id is named on each, and `case-authoring` retires each as moved. R17–R21 are copies of `case-authoring` R33, R26, R24, R22 and R30, which hold here as there. R22 holds the C-120 family, moved whole with its ids, codes and translations (`case-authoring` R29's share; R12 with it, K1333); only the `where`s change. R23 states the seam. Layer 8, after `case-import`, before `case-authoring`. No `from`. Its code moves from `case-authoring/index.mjs` (1108–1129, 1131–1593, and `#publishCase`'s block assembly 659–700), `checks.mjs` 134–227, `document.mjs` 39–165 and 176–301 (less `CEREMONY_HIGHLIGHT_SENTENCE`), and `materials.mjs` and `accepted.mjs` whole. The disclosure renderers are moved, not copied (K1333; one spelling, P15): `case-authoring` imports them from here and keeps no copy, and the signed document is byte-identical. This module's job writes the code here (K624 (1)); `case-authoring`'s job, after this one merges, deletes its ranges and imports this module's. No test file moves: case-authoring's arms drive `publishCase` and are re-tagged to its R55; this module's job writes its own interface tests (K1333). Not yet met: every id (T29); rows C-120.8 and C-120.10–C-120.13 await stamp, and C-120.1–C-120.7's new `where`s join that stamp.

**Size (P6).** About 1,210 lines.

## Public

### Purpose

What a case discloses about what it rests on, judged and written before anything is signed (Publication §3 rule 16, §5C; DEC-76 item 4, DEC-81, DEC-96 item 4, DEC-112, DEC-119). That covers:
- the unresolved conflicts on its findings;
- each document's grade and co-attestation, and the owner's acknowledgement of a self-attested one;
- what may be said of a source;
- every document and observation a finding's chain reaches, with what this copy holds whole and who attests it;
- the method the case is signed under;
- another group's work it rests on, with its acceptance and open flags;
- each reached finding's grading facts and passages;
- hunch debt.

This module judges each against the owner's lists and the record at the act, and answers refusals and rows. It also spells each disclosure's lines in the case document. `case-authoring`'s `publishCase` asks it in order and writes what it answers (its R55). It holds no table and no op.

### Provides

**Terms.** Terms are `case-authoring`'s and `publication`'s.
- `prepared` is case-authoring R4's list, each member `{id, bundleSha, …}`.
- `memberRoles` is its R5 partition, `[{target, role}]`.
- `viewer` is the control plane's stamp.

**Refusals.** Every refusal names `reason`. One with a catalogue row carries its `check`, `code` and `translation`. A malformed owner's list is `BAD_COMPLETENESS` naming the field: a list that is not one; an entry that is not an object naming its key; or words that are not a string, are over 2,000 characters, or hold a double quote, a backslash or a line break.

**Judgments.** Each judgment answers `{refusals, …}`, its refusals in the order stated. `publishCase` answers the first; the pre-flight (`case-authoring` R34) lists all.

#### Tensions (N345; DEC-76 item 4, DEC-84 items 11–13, DEC-85)

- **R1** (was `case-authoring` R31) *(not yet met: T29)*
  - **The read.** `tensionsRead(prepared, viewer)` reads `contradiction.unresolvedRecordOn({finding, sha, viewer})` (its R29) for each member at its `bundleSha`. It answers one entry per candidate and member, with each side as `tensionSide` states it, and `unread`: per member, the count of document legs with no content row, which are stated and never filled.
  - **Read failure.** A read that fails, throws or is `truncated` is `TENSIONS_UNDETERMINED` (C-120.3), naming each finding and why. `tensionsUndetermined(failed)` is the same refusal, for a caller's own failed read.
  - **The judgment.** `tensionsJudged(prepared, viewer, tensionsDisclosed)` takes `tensionsDisclosed: [{candidate, words?}]` (absent is none; a candidate listed twice is disclosed once, its first words kept). It answers `{refusals, entries, unread, byCandidate}`. Its refusals are:
    - a malformed list, or C-120.3, alone;
    - else `TENSION_NOT_DISCLOSED` (C-120.1), naming each candidate the read answers that the list does not name; one with a side the owner may not see is named by its candidate and finding, with the words "in conflict with a record not shown", and nothing of that side;
    - then `DISCLOSURE_NOT_STANDING` (C-120.2), for listed candidates the read does not answer.

    It never refuses because a contradiction exists.
  - **The section.** `tensionFrontmatterLines(tensions, unread)` and `tensionBodyLines(tensions, unread)` write the section. Each entry gives:
    - the finding;
    - both sides verbatim, with source, date and doctype;
    - its state and explanation;
    - the owner's words marked as the owner's;
    - `acknowledged_by` (the `author` stamp) and the instant;
    - the sentence that the disclosure reaches one level (`TENSIONS_DEPTH_STATED`).
  - **Each member's block.** `tensionSentence(t)` gives the member block one sentence per tension, from the fixed `TENSION_TEMPLATES`:
    - "In tension, not yet resolved: …";
    - "Explained, not yet shown: …";
    - "Held irreconcilable by the group: …";
    - "Rests on a side in conflict with a record not shown: …".
  - **The highlight** (DEC-85). A candidate answered `unseen_other_side: true` is highlighted:
    - its entry carries the seen side only, with `HIGHLIGHT_SENTENCE` ("This finding rests on a side in conflict with a record not shown here. The record and who holds it are not named.");
    - its member's block carries the last template, not its state's own sentence.

#### Each document's grade and co-attestation, and its source (N364; DEC-81 items 1 and 3, DEC-78 item 5)

- **R2** (was `case-authoring` R35) *(not yet met: T29)*
  - **The captures.** `restingCaptures(prepared)` answers `[{member, capture}]`, one level deep: each document leg's content-row capture, else every capture its target registers. An inquiry leg names none. The list is in member order, then leg order, each pair once.
  - **One capture's facts.** `captureFacts(sha)` answers:
    - the capture's grade (`provenance.captureGrade`);
    - `co_attested`, true only with both a timestamp and a co-archive: from `attestation.attestationsOf` (its R7), else a late one that succeeded (`capture.lateAttestationsOf`), stated `late`;
    - its signed accounts (`capture.captureAccountsOf`).

    It never throws: a failed read states less.
  - **The judgment.** `selfAttestedJudged(resting, facts, memberRoles, selfAttested)` takes `selfAttested: [{capture, reason}]` and answers `{refusals, byCapture}`. Its refusals, in order:
    - `CO_ATTESTATION_UNACKNOWLEDGED` (C-120.4), naming each load-bearing Grade B capture that is not co-attested and not listed;
    - `SELF_ATTESTED_NO_REASON` (C-120.5), for a listed capture with an empty reason;
    - `SELF_ATTESTATION_NOT_STANDING` (C-120.6), for a listed capture that is co-attested or not in the case.

    The case is never refused because a capture is not co-attested.
- **R3** (was `case-authoring` R36) *(not yet met: T29)* An acknowledged capture's rows, in `disclosureBlocks`' `captures`, are marked `self_attested_only: true` with `{reason, acknowledged_by, at, sentence}`, and carry its signed accounts on its first row. `captureBodyLines(captures, sources)` prints the fixed `SELF_ATTESTED_SENTENCE`: "Without co-attestation an outsider can verify the copy has not changed since capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when."
- **R4** (was `case-authoring` R37) *(not yet met: T29)*
  - **The rows.** `sourcesStated(shas, viewer)` answers rows `{capture, stated, basis}`, each statement once. For each capture whose source is a knocker or a hand-carried source (`sources.sourceOf`), they state only what `sources.publishableAt({audience: "public"})` answers, with its basis, spelled by `publication.sourceStatement`.
  - **Withheld.** With no `name` entry publishable, the row states the identity "Withheld" with its reason (the source has not consented to being named, and no public record names them), and the receipt's digest and time, in `publication`'s `unnamedSourceStatement`, the one spelling (K1315 (8)). It never states what was withheld. No authored field adds to it. A source read that fails states the Withheld row.
  - **Off-the-record.** `withheldOf(rows)` is the set of off-the-record captures, read by `case-grammar.sourceRowWithheld`.

#### What the case carries, and what it may rest on (DEC-112; DEC-119)

- **R5** (was `case-authoring` R43) *(not yet met: T29)* `methodOf()` answers `{grading: strength.GRADING_METHOD_VERSION, checks: promotion.CATALOG_VERSION}` at the call, written by `case-grammar`'s `methodBlockLines` (its R11) and `carriesBodyLines`, so the version is inside what the owner signs.
- **R6** (was `case-authoring` R44) *(not yet met: T29)* `materialsJudged(prepared, memberRoles, viewer)` follows each member's chain (R8; `chainsOf`) and answers `{refusals, materials, refs, findings}`:
  - **What is held.** Each material carries what this copy holds of it (`materialHeld`: the captured bytes and extracted text, or an observation's text), and `included` when whole.
  - **The refusal.** `RELIED_ON_NOT_PRESENTABLE` (C-120.8) names each load-bearing member and each material its chain reaches that is not held whole.
  - **Supporting only.** Material only supporting members reach, and not held whole, is listed `included: false` and never refused.
- **R7** (was `case-authoring` R45) *(not yet met: T29)* `disclosureBlocks(…)` answers the `materials:` and `material_attestations:` rows (`case-grammar` R12) for every material R6 answered, with:
  - its fingerprint, its extracted text's fingerprint, its origin and archived copy;
  - whether it is included;
  - its attestations:
    - the attesting member's (as R10 states them);
    - its co-attestation (R2);
    - the project's (the register row holding it, `provenance` R48);
    - the group's (one row whose signature is the case's own).

  No table and no act holds the project's or the group's attestation. A side the publisher could not see is never listed (R17).
- **R8** (was `case-authoring` R46) *(not yet met: T29)* Terms for R6–R12.
  - **Off-the-record.** A capture is off-the-record when its `source` is a knocker or a hand-carried source and R4 states its identity "Withheld".
  - **Attesting member.** Its attesting member is the capture's `actor` (`acquisition` R16; for a pulled knock, the member who pulled it, `capture` R65).
  - **Reaches.** A chain reaches what its legs target, followed through inquiry legs to `strength`'s depth bound (its R2), as the viewer sees the record.
- **R9** (was `case-authoring` R47) *(not yet met: T29)* Off-the-record material is presentable like any other: R6 and R7 apply unchanged, and nothing here refuses because material is off-the-record. Its grade is the capture's grade as recorded (`provenance` R51).
- **R10** (was `case-authoring` R48) *(not yet met: T29)* For each off-the-record capture a chain reaches, the attesting member's `material_attestations:` row states them at the level in force for that capture (`publication` R60), read from the attribution rows the caller passes (`attributionOf`, `publication.attributionStatements`).
  - At `cover` or `name`, the row carries their handle and signature.
  - At `group`, `project` or no level yet, it carries the account's text only (`capture.captureAccountsOf`), never their handle, key or signature, in `disclosureBlocks`' `captures` too.
  - An off-the-record capture's origin is not stated.
- **R11** (was `case-authoring` R49) *(not yet met: T29)* A capture a named member made, including a load-bearing self-attested Grade B capture, is governed by R2 and R3, unchanged. Testimony and off-the-record material credited at the group or project level are governed by `strength` R29 and `ratification` R35.

#### Another group's work this case rests on (DEC-96 item 4; N522)

- **R12** (was `case-authoring` R50) *(not yet met: T29)* A chain stops at a leg on an imported finding reference (`inquiry-grammar` R11). That leg is answered in R6's `refs`, and R6, R7 and R10 do not follow past it.
- **R13** (was `case-authoring` R51) *(not yet met: T29)* `acceptedWorkJudged(refs, viewer)` reads, for each ref leg, `case-import.acceptanceOf` and `importedCase` at the leg's `target_edition` (from the inquiry's own `bundle.md` `basis[ord]`). It answers `{refusals, rows, editions}`.
  - **The rows.** `rows` are `accepted_work:` rows (`case-grammar` R16): who accepted which edition, when and why, the recreation result and the gaps stated; `checked` stays inside the group.
  - **The refusal.** A leg with no acceptance in force is `ACCEPTED_WORK_NOT_IN_FORCE` (C-120.10), naming the member, the leg, and the source case and edition.
- **R14** (was `case-authoring` R52) *(not yet met: T29)* `flagsJudged(editions, flagsDisclosed)` reads `case-import.openFlagsOn` for each edition R13 names, against `flagsDisclosed: [{flag, words?}]`. It answers `{refusals, open, byFlag}`.
  - **Refusals.**
    - A failed or incomplete read is `FLAGS_UNDETERMINED` (C-120.12), alone.
    - Else an open flag not listed is `FLAG_NOT_DISCLOSED` (C-120.11), naming each.
    - A listed flag not open is `FLAG_DISCLOSURE_NOT_STANDING` (C-120.13).
    - It never refuses because a flag is open.
  - **Rows and sentences.** `disclosureBlocks`' `flags` rows carry the issue, when it was flagged, the owner's words, `acknowledged_by` (the `author` stamp) and the instant. The flagging member is not named.
    - The member block's sentence is `FLAG_SENTENCE`.
    - The ceremony's words are `FLAGS_SAY`.
    - Both are plain sentences until the UX stream gives the words.

#### Grading facts and passages (DEC-112 (3); K1315)

- **R15** (was `case-authoring` R54) *(not yet met: T29)* `findingFacts(findings, viewer)` answers the `grading_facts:` and `passages:` rows (`case-grammar` R17) for each finding R6 reached:
  - `strength.gradingFacts({inquiry, levels: null, viewer})` (its R35), one row per leg `{finding, ord, …}`;
  - one passage row per leg naming a content row, `{finding, ord, content_id, capture_sha, extent, chain, quoted}`, with `quoted` the extracted unit's text at that extent, or null where none is held.

  A finding `gradingFacts` refuses contributes no row, and is answered in `unread`.

#### Hunch debt (Publication §3 rule 4; DEC-20)

- **R16** (was `case-authoring` R12) *(not yet met: T29)* `hunchDebt(prepared)` answers `UNCLEARED_HUNCH` (C-120.7), naming each member, leg and target whose live basis (`inquiry.basisFor`) carries a leg whose grade source is `hunch`, or null. It is asked of every member, load-bearing or supporting. A member whose basis cannot be read is not passed: the same `UNCLEARED_HUNCH` answer names it under `undetermined: [{target, why}]` beside the hunches, saying whether it rests on a hunch is not known (R18, R23: the read states less and the answer fails closed; K1346).

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, `canonicalJson`, `createSha256`, `EARNED_CAPTURE_CEILING` (R2, R6, R15).
- `record-core`: `recordOf` (`readFile`); the `bundles` read contract (its R37; R6, R8).
- `membership`: `viewerPredicate` (R6, R8: sight at the act).
- `promotion`: `CATALOG_VERSION` (R5); the fact `producingGroup` (R7's group row).
- `provenance`: `captureGrade` (its R24–R27, R51; R2); the `register` and `captured_locators` read contracts (its R48; R2, R6, R7).
- `attestation`: `attestationsOf` (its R7; R2, R7).
- `capture`: `lateAttestationsOf`, `captureAccountsOf` (its R68, R69; R2, R3, R10).
- `sources`: `sourceOf`, `publishableAt` (its R1, R8; R4).
- `extraction`: `unitsOf` (its R36; R6, R15).
- `content`: the `content` read contract (its R45; R2, R6, R15).
- `inquiry-grammar`: `parseImportedFindingRef` (its R11; R12, R13).
- `inquiry`: `basisFor` (R16); the `inquiry_basis` read contract (its R40; R2, R6, R15).
- `strength`: `gradingFacts` (its R35; R15), `DEPTH_BOUND` (R8), `GRADING_METHOD_VERSION` (R5).
- `contradiction`: `unresolvedRecordOn` (its R29; R1).
- `case-grammar`: `extractedTextOf`, `sourceRowWithheld`, `fmSafe`, `pairLine`, `ANONYMOUS_ATTESTATION_LEVELS` (its R12, R16, R17; R4, R6, R7, R13).
- `publication`: `sourceStatement`, `unnamedSourceStatement` (its R51; R4).
- `case-import`: `acceptanceOf`, `openFlagsOn`, `importedCase` (its R4, R9; R13, R14).

### Invariants

- **R17** (copy of `case-authoring` R33; DEC-85) *(not yet met: T29)* No row, sentence or answer this module gives names the project, members, content, kind or source of a side the publisher could not see at the act. A reveal (`contradiction` R52) never widens it: sight at the act, by `membership` R43, governs.
- **R18** (copy of `case-authoring` R26) *(not yet met: T29)* Undetermined is stated and never filled. That covers a conflict leg unread (R1), a source read that failed (R4, stated Withheld), and a finding's grading facts unread (R15).
- **R19** (copy of `case-authoring` R24) *(not yet met: T29)* No row composes a case-level strength: every pair is per member and per axis.
- **R20** (copy of `case-authoring` R22) *(not yet met: T29)* Everything a row asserts arrived as an argument or was read from the record at the call. Nothing is composed, summarised or inferred.
- **R21** (copy of `case-authoring` R30) *(not yet met: T29)* No place is named in this module's behaviour or outward text.
- **R22** (`case-authoring` R29's share) *(not yet met: T29)* C-120.1–C-120.8 and C-120.10–C-120.13, the family "a case's disclosures and its pre-flight" (`CASE_DISCLOSURE_CHECKS`), are held in this module's own table with their ids, codes and translations unchanged, each `where` naming this module's raising method. C-120.9 is withdrawn and never reused. A change to any moves `CATALOG_VERSION` (rule 17).
- **R23** (the seam, K617) *(not yet met: T29)*
  - Every service is synchronous.
  - It never throws on a failed read of another module (that read states less, never more).
  - It writes nothing of its own. The one write it reaches is `sources.sourceOf`'s minting of a source id, inside the caller's transaction (`case-authoring` R18), so the caller can roll it back.
  - It holds no table, so it declares nothing to purge.
  - It is reached as `caseDisclosuresOf(host, deps)`, one instance per host.

Rows C-120.1–C-120.8 and C-120.10–C-120.13 (R22), with their translations, moved verbatim from `case-authoring.md` (C-120.1–C-120.3 N345; C-120.4–C-120.7 N364; C-120.8 and C-120.10–C-120.13 DEC-112, N522, BOB's drafts, which the UX stream may re-word):

| row | code | translation |
|---|---|---|
| C-120.1 | `TENSION_NOT_DISCLOSED` | "A finding in this case rests on something the record holds in unresolved conflict, and a case may be published with it only if the conflict is disclosed. Each one is named. One in conflict with a record you cannot see is named by its finding, and the published case will highlight it without naming that record. Disclose it, or resolve it first. Nothing was published." |
| C-120.2 | `DISCLOSURE_NOT_STANDING` | "One of the conflicts disclosed is not an unresolved conflict on this case's findings: it may have been resolved since. Read the list again. Nothing was published." |
| C-120.3 | `TENSIONS_UNDETERMINED` | "The record could not be read completely for conflicts on this case's findings, so what must be disclosed is not known. Try again. Nothing was published." |
| C-120.4 | `CO_ATTESTATION_UNACKNOWLEDGED` | "A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing it as self-attested only, with a reason. Nothing was written." |
| C-120.5 | `SELF_ATTESTED_NO_REASON` | "Publishing a document as self-attested only says why. Give the reason. Nothing was written." |
| C-120.6 | `SELF_ATTESTATION_NOT_STANDING` | "A document acknowledged as self-attested only is either co-attested already or not one this case rests on, so it needs no acknowledgement. Remove it from the list. Nothing was written." |
| C-120.7 | `UNCLEARED_HUNCH` | "A finding in this case rests on a hunch. A hunch is temporary declared bias, and it is the one bias that must be cleared before publication: the case must still hold with the hunch removed. Give each leg a grade the record earns, or take the hunch out of the basis, and publish again. Nothing was written." |
| C-120.8 | `RELIED_ON_NOT_PRESENTABLE` | "A finding this case relies on rests on material this copy does not hold whole, and everything a case relies on travels with it in full. Find a presentable copy, stop relying on the material, or make the finding supporting. Nothing was written." |
| C-120.10 | `ACCEPTED_WORK_NOT_IN_FORCE` | "A finding in this case rests on another group's finding, and this group's acceptance of that edition is not in force. Accept it again, or take the leg out. Nothing was written." |
| C-120.11 | `FLAG_NOT_DISCLOSED` | "Another group's work this case rests on carries an open flag, and a case may be published with it only if the flag is disclosed. Each one is named. Disclose it, or clear it first. Nothing was published." |
| C-120.12 | `FLAGS_UNDETERMINED` | "The flags on another group's work this case rests on could not be read completely, so what must be disclosed is not known. Try again. Nothing was published." |
| C-120.13 | `FLAG_DISCLOSURE_NOT_STANDING` | "One of the flags disclosed is not open on work this case rests on: it may have been cleared since. Read the list again. Nothing was published." |

### Satisfies

- N345: DEC-76 item 4; DEC-84 items 11–13; DEC-85; `BIO_Publication_v0_1.md` §3 rule 16; `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10 (R1, R17).
- N364: DEC-81 items 1 and 3; DEC-78 item 5; K509 (3), (4) (R2–R4).
- DEC-112 response 4 (3)–(5) as restored by DEC-119; `BIO_Publication_v0_1.md` §5C (R4–R11, R15; K1275, K1315).
- DEC-96 item 4 (R12–R14; N522, K1273).
- `BIO_Publication_v0_1.md` §3 rule 4; DEC-20 (R16).

### Suggestions

- **The code.** The services are case-authoring's private methods, moved with their bodies unchanged (`#x` → `x`). `materials.mjs` and `accepted.mjs` move whole. The renderers move unchanged and are imported by `case-authoring`'s `document.mjs`, never copied (K1333), so a document is byte-identical before and after the split.
- **Tests.** Interface tests over a fixture copied from case-authoring's (without `caseAuthoringOf`). The arms port from case-authoring's `tensions`, `carries`, `rests`, `imported` and `preflight`, called on the services. Also a byte-identity arm, each row's negative control, and R17's no-hidden-side arm. The end-to-end arms stay in case-authoring under its R55.
- **Order.** The caller must keep R16, R1, R2, R6, R13, R14 in that order and call R4 only after its last refusal; that is case-authoring R55's.

## Old ids (case-authoring → this file)

R31 → R1; R35 → R2; R36 → R3; R37 → R4; R43 → R5; R44 → R6; R45 → R7; R46 → R8; R47 → R9; R48 → R10; R49 → R11; R50 → R12; R51 → R13; R52 → R14; R54 → R15; R12 → R16; R33 → R17 (copy); R26 → R18 (copy); R24 → R19 (copy); R22 → R20 (copy); R30 → R21 (copy); R29's C-120 share → R22.

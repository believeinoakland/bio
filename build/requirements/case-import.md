# case-import — requirements

**Status** · Requirements for T28, folded by a worker for BOB #104 at T28's opening, entry N520 (DEC-112's share), with DEC-96's acts (`plan/draft-T28-dec112.md`). A new product module with no `from` (K1256, K1257). It sits in layer 8 directly after `case-checker`, through which it recreates, and before `case-authoring`. Its own T28 job writes its code at `bio-plane/src/case-import/` and its tests at `bio-plane/test/m/case-import/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28). It answers `next.md` rows H1 (DEC-96) and J4 (DEC-92, for imported work). R16 and the changes to R6–R9 are entry N522's (`plan/draft-T28-n522.md` §7; K1273).

**Size (P6).** About 1,600–2,300 lines: the import and its tables, recreation, completion, the reads, the four acts and its catalogue rows. Acceptance is split out if it grows (K1256).

## Public

### Purpose

A CivicOS copy imports another group's case file into a new, read-only project. It confirms each finding by recreating it from the case file, and shows each finding against the importing group's own bar. The group may then accept an edition, by a reasoned act, for the findings that recreated, and may flag and clear issues on it. Recreating is not endorsing. (DEC-112 (6); DEC-96; Publication §5C "Import")

### Provides

Terms.
- An **import** is the read-only project an imported case lands in. There is one per source group, case and lens (K1134 reading 4; DEC-46 (3)). Its id is the SHA-256 of the canonical JSON `{group, case, lens}`: `group` is the source group's slug the manifest names, and `lens` is the bias manifest's fingerprint the signed case document states.
- An **imported edition** is one case edition held in an import. Editions sit side by side, and a later one never replaces an earlier one.
- A **result** is `case-checker`'s (its R11).
- Every refusal names `reason` and carries its catalogue row (R14).
- The words a member sees (the origin marks, the statement that recreating is not endorsing) are the UX stream's, cited and never decided here.

**importCaseFile({parts, by, viewer})** (`op=caseimport`; member session; mutating)

- **R1** Refusals, in order, each writing nothing:
  - an empty or machine `by`, or an operator token, is `MACHINE_CANNOT_IMPORT`;
  - a `viewer` who is not an active member of this group is `IMPORT_NOT_A_MEMBER`;
  - parts whose manifest fails `case-grammar.caseFileManifestCheck` (its R13) are `IMPORT_NOT_A_CASE_FILE`, naming each departure;
  - a part over the part bound (`public-read` R5's 64 MiB) is `IMPORT_PART_TOO_LARGE`;
  - an edition already held in this import with different bytes (another manifest SHA-256) is `IMPORT_EDITION_DIFFERS`, naming both hashes. An edition is immutable, so the difference is reported, never resolved.

  The same edition with the same bytes answers `existed: true`. Otherwise the act creates the import if it is absent and stores every file of the case file by its SHA-256. It records the edition with its source group, case, edition, lens, `by` and instant. It then runs `case-checker.checkCaseFile` and records each finding's result, with the checker's versions (R3). (DEC-112 (6); Publication §5C; K1134 reading 4) *(not yet met: T28)*
- **R2** Read-only. Nothing an import holds is a record bundle. No act of this copy edits, promotes, ratifies or publishes it, and this module offers no act that changes an imported file. The only later writes are R5's completion, R6's acceptance and its withdrawal, and R8's flags. (DEC-112 (6) "a new, read-only project") *(not yet met: T28)*
- **R3** Recreation is recorded per finding: the result, what is missing, what differs, the recomputed pair, and the checker's grading and checks versions. It is recomputed only by R5. (DEC-112 (6); Bob, DEC-112 response 2: "the system confirms the findings according to the structured case file") *(not yet met: T28)*

**importedCases({viewer}), importedCase({import, edition?, viewer})** (`op=importedcases`, `op=importedcase`; member session; reads)

- **R4** `importedCases` lists every import with its source group, case, lens, editions and when each was imported. `importedCase` answers one import's editions, the latest by default, each with:
  - for each finding, its role, its result with what is missing or what differs, and its recomputed pair;
  - the source's bar as the case states it, labelled as the source's and never as this group's (DEC-45);
  - each finding against this group's own bar. That is the group default (`strength.strengthBarOf` with no project, its R16), and with none set, that no bar is set (K1134 reading 3). The axis is reached or not, as `case-checker` R6 reads it, with `not_asked` for a supporting finding;
  - its origin mark facts (DEC-92): `another_groups` (with the edition and whether its signature verified), the acceptance in force (by, when, why, what was checked, the gaps stated) or none, and the open flags;
  - the statement that recreating shows the case intact and consistent, not true (`case-checker` R1's `statement`).

  A `viewer` who is not an active member is answered as if no import exists, with the same bytes for each. It writes nothing. (DEC-112 (6); DEC-92; DEC-96 item 1) *(not yet met: T28)*

**completeImportedDocument({import, edition, bytes, by, viewer})** (`op=caseimportdocument`; mutating)

- **R5** It applies R1's first two refusals. Bytes whose SHA-256 matches a material that an edition of this import records as missing are stored, and every finding of that edition is re-checked (R3). Bytes matching no missing material are `IMPORT_DOCUMENT_NOT_MISSING`, naming the fingerprint they have. Nothing else about the edition changes. (Publication §5C "a fetched document that matches its fingerprint completes it") *(not yet met: T28)*

**acceptImported({import, edition, findings, checked, reason, gaps?, by, viewer})** (`op=importaccept`) **and withdrawAcceptance({import, edition, reason, by, viewer})** (`op=importacceptwithdraw`); mutating, each a reasoned act

- **R6** Refusals, in order, each writing nothing:
  - R1's first two refusals;
  - an edition this import does not hold is `IMPORT_NO_SUCH_EDITION`;
  - `checked` (what the member checked) or `reason` absent, blank or over 2,000 characters is `IMPORT_ACCEPT_NO_REASON`;
  - a finding not in the edition is `IMPORT_NO_SUCH_FINDING`;
  - a finding whose result is `did_not_recreate` is `IMPORT_ACCEPT_NOT_RECREATED`, naming each one;
  - a `recreated_in_part` finding for which `gaps` does not state each missing entry in the member's words is `IMPORT_ACCEPT_GAPS_UNSTATED`, naming each gap left unstated.

  Otherwise the act records the acceptance of that one edition for those findings, with `by`, the instant, `checked`, `reason` and `gaps`. It changes no grade: the edition's grades stand as published. A later edition of the same case reads as another group's until it is accepted. The answer names, for each accepted finding, its imported finding reference (`inquiry-grammar.importedFindingRef`), the spelling a leg names. (DEC-96 item 1; DEC-112 (6): "only for findings recreated, or recreated in part with the gaps stated"; N522) *(not yet met: T28)*
- **R7** `withdrawAcceptance` applies R1's first two refusals and R6's `IMPORT_NO_SUCH_EDITION`. It refuses `IMPORT_ACCEPT_NO_REASON` for a missing `reason`, and `IMPORT_NOTHING_ACCEPTED` when no acceptance of the edition is in force. Otherwise it records the withdrawal with `by`, the instant and `reason`. The acceptance stays in the history, corrected forward and never erased. After the withdrawal commits, it calls `reevaluation.acceptanceWithdrawn` (its R31). The reply carries that answer as `reevaluation`. A failure there never undoes the withdrawal and is named in the reply (`reevaluation` R8's `listeners_failed`). (DEC-96 item 1; N522) *(not yet met: T28)*

**flagImported({import, edition, finding?, issue, by, viewer})** (`op=importflag`) **and clearFlag({flag, reason, by, viewer})** (`op=importflagclear`); mutating, each a reasoned act

- **R8** A flag is a member's recorded evaluation naming the specific issue, never a machine's. Each act applies R1's first two refusals. An `issue` or `reason` absent, blank or over 2,000 characters is `IMPORT_FLAG_NO_ISSUE`. An edition or finding not held is `IMPORT_NO_SUCH_EDITION` or `IMPORT_NO_SUCH_FINDING`. Clearing a flag that is not open is `IMPORT_FLAG_NOT_OPEN`. A flag records `by`, the instant and the issue. A clear records `by`, the instant and the reason, and the flag stays in the history. Flags are seen only by those who may see the import (R4), and never on a public path, except as a published case of this group discloses an open flag on work it relies on (`case-authoring` R52; DEC-96 item 4). (DEC-96 items 2, 4; N522) *(not yet met: T28)*

**acceptanceOf({import, edition, finding}), openFlagsOn({import, edition})** (services for later modules)

- **R9** `acceptanceOf` answers the acceptance in force for a finding of an edition (by, when, why, what was checked, the gaps) or null. `openFlagsOn` answers the open flags with their issues. They are read as the plane. They are the one answer to "is this accepted or flagged" for every later module, including a case of this group that rests on accepted work. `case-authoring` R51–R52 now read it. (DEC-96 items 1, 2, 4; N522) *(not yet met: T28)*

**The registration it fills** (K31's pattern; `accepted-work` R1; N522)

- **R16** At start, the module registers with `accepted-work` (its R1) the following, each read as the plane:
  - `finding` (R4's facts for one finding at one edition, with R9's `acceptanceOf`);
  - `openFlags` (R9's `openFlagsOn`, the edition's own flags and the finding's);
  - `withdrawals` (R7's records, in order, paged).

  A viewer who is not an active member is answered null, as R4 answers. (DEC-96 items 1, 4; P4) *(not yet met: T28)*

## Private

### Uses

- `record-grammar`: canonical JSON, `isMachineIdentity`, `createSha256`.
- `record-core`: `transact`, `stampInstant`, `declarePurge`.
- `membership`: the session stamp and whether a viewer is an active member.
- `strength`: `strengthBarOf` (its R16; R4).
- `case-grammar`: `caseFileManifestCheck`, `methodOf`, `materialsOf` (its R11–R13).
- `case-checker`: `checkCaseFile` (its R1).
- `inquiry-grammar`: `importedFindingRef` (its R11; R6).
- `accepted-work`: `registerAcceptedWork` (its R1; R16).
- `reevaluation`: `acceptanceWithdrawn` (its R31; R7).

### Invariants

- **R10** No answer composes a case-level strength or a trust score. Origin marks are never composed with grades (DEC-92, DEC-44). *(not yet met: T28)*
- **R11** The source's bar is never stated or used as this group's (DEC-45). An acceptance changes no grade (DEC-96 item 1). *(not yet met: T28)*
- **R12** Every act is append-only. An import, its results, acceptances, withdrawals, flags and clears are never edited or deleted by any act of this module. *(not yet met: T28)*
- **R13** This module's tables are declared to `record-core`'s purge as the import's own record (K23). The stored case-file bytes are purged with their import. *(not yet met: T28)*
- **R14** Each refusal carries its row in this module's own table (`checks.mjs`), a new family, its number given by `promotion`'s stamp. The translations are drafted by BOB and stamped by promotion. A change moves `CATALOG_VERSION`. *(not yet met: T28)*
- **R15** No place is named in this module's behaviour or outward text. *(not yet met: T28)*

### Satisfies

- DEC-112 response 4 (6), with response 2, as K1134 (2) readings 3–5 read it; `BIO_Publication_v0_1.md` §5C ("Import"); `BIO_Complete_Roadmap_v5.md` §11 (import before acceptance).
- DEC-96 items 1 and 2 (the accept, withdraw, flag and clear acts); DEC-92 (the origin mark's facts for imported work); DEC-45, DEC-46 (3). K1256, K1257 (the module).
- DEC-96 item 1's withdrawal notice and item 4 (R16, R7; N522, K1273).

### Suggestions

- **Bytes.** Store the case file's bytes in the plane's object store under this module's own key prefix, as `provenance` keeps evidence, and never in SQL rows.
- **Grades.** The four acts are graded `reasoned` by `affordances` (DEC-96: "a reasoned act"). The grade of the import act and the completion act is BOB's at L11.
- **Tests.**
  - A clean import recreates every finding.
  - A re-import answers `existed: true`.
  - A tampered edition with the same id is `IMPORT_EDITION_DIFFERS`.
  - An in-part acceptance without gaps is refused, and with gaps is accepted.
  - A `did_not_recreate` finding cannot be accepted.
  - A withdrawal leaves the history intact.
  - A non-member reads byte-identical absence.
  - No answer carries a composed strength.
  - Every refusal has a negative control.

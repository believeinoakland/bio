# case-import — requirements

**Status** · Requirements for T28, folded by a worker for BOB #104 at T28's opening, entry N520 (DEC-112's share), with DEC-96's acts (`plan/draft-T28-dec112.md`). A new product module with no `from` (K1256, K1257). It sits in layer 8 directly after `case-checker`, through which it recreates, and before `case-authoring`. Its own T28 job writes its code at `bio-plane/src/case-import/` and its tests at `bio-plane/test/m/case-import/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28). It answers `next.md` rows H1 (DEC-96) and J4 (DEC-92, for imported work). R16 and the changes to R6–R9 are entry N522's (`plan/draft-T28-n522.md` §7; K1273). AMENDED by a fold worker for BOB #106 on `prep/T29-folds`, 2026-10-03, entry N529, ruling K1333 (`case-authoring`'s disclosures moved to `case-disclosures`): references to `case-authoring` R51 and R52 re-pointed to `case-disclosures` R13 and R14; wording only, no meaning changed. N534 (DEC-101 (3), DEC-116 item 8: watching other groups' published editions; K1339, K1366) folded by a worker for BOB #107 on `tranche/T31`, 2026-10-03, from `plan/draft-T29-n534.md` §2.5: R17–R20 (the watch, the docket read and its verification, what a member reads, the watch's items) added; the terms, R12, R13, R14 and R16 widened; Uses gain `signatures` and `docket`; not yet met (T31 layer 8).

**Size (P6).** About 1,600–2,300 lines: the import and its tables, recreation, completion, the reads, the four acts and its catalogue rows. Acceptance is split out if it grows (K1256).

## Public

### Purpose

A Civicsmith copy imports another group's case file into a new, read-only project. It confirms each finding by recreating it from the case file, and shows each finding against the importing group's own bar. The group may then accept an edition, by a reasoned act, for the findings that recreated, and may flag and clear issues on it. Recreating is not endorsing. (DEC-112 (6); DEC-96; Publication §5C "Import")

### Provides

Terms.
- An **import** is the read-only project an imported case lands in. There is one per source group, case and lens (K1134 reading 4; DEC-46 (3)). Its id is the SHA-256 of the canonical JSON `{group, case, lens}`: `group` is the source group's slug the manifest names, and `lens` is the bias manifest's fingerprint the signed case document states.
- An **imported edition** is one case edition held in an import. Editions sit side by side, and a later one never replaces an earlier one.
- A **result** is `case-checker`'s (its R11).
- Every refusal names `reason` and carries its catalogue row (R14).
- The words a member sees (the origin marks, the statement that recreating is not endorsing) are the UX stream's, cited and never decided here.
- A **watch** is a member's standing request that this copy read the publisher's docket for one import. Its **docket address** is composed by R17. (N534)
- A **docket read** is one fetch of that address, made by `monitoring` (its R67).
- An **entry seen** is one public docket entry recorded from a read, either `verified` or `refused`.
- A **publisher move** is a verified entry of kind `edition` or `withdrawal`. Only a move raises re-evaluation causes (`reevaluation` R33); every other verified entry reaches only the watch's setter (R20; K1339, K1366 F1).

**importCaseFile({parts, by, viewer})** (`op=caseimport`; member session; mutating)

- **R1** Refusals, in order, each writing nothing:
  - an empty or machine `by`, or an operator token, is `MACHINE_CANNOT_IMPORT`;
  - a `viewer` who is not an active member of this group is `IMPORT_NOT_A_MEMBER`;
  - parts whose manifest fails `case-grammar.caseFileManifestCheck` (its R13) are `IMPORT_NOT_A_CASE_FILE`, naming each departure;
  - a part over the part bound (`public-read` R5's 64 MiB) is `IMPORT_PART_TOO_LARGE`;
  - an edition already held in this import with different bytes (another manifest SHA-256) is `IMPORT_EDITION_DIFFERS`, naming both hashes. An edition is immutable, so the difference is reported, never resolved.

  The same edition with the same bytes answers `existed: true`. Otherwise the act creates the import if it is absent and stores every file of the case file by its SHA-256. It records the edition with its source group, case, edition, lens, `by` and instant. It then runs `case-checker.checkCaseFile` and records each finding's result, with the checker's versions (R3). (DEC-112 (6); Publication §5C; K1134 reading 4)
- **R2** Read-only. Nothing an import holds is a record bundle. No act of this copy edits, promotes, ratifies or publishes it, and this module offers no act that changes an imported file. The only later writes are R5's completion, R6's acceptance and its withdrawal, and R8's flags. (DEC-112 (6) "a new, read-only project")
- **R3** Recreation is recorded per finding: the result, what is missing, what differs, the recomputed pair, and the checker's grading and checks versions. It is recomputed only by R5. (DEC-112 (6); Bob, DEC-112 response 2: "the system confirms the findings according to the structured case file")

**importedCases({viewer}), importedCase({import, edition?, viewer})** (`op=importedcases`, `op=importedcase`; member session; reads)

- **R4** `importedCases` lists every import with its source group, case, lens, editions and when each was imported. `importedCase` answers one import's editions, the latest by default, each with:
  - for each finding, its role, its result with what is missing or what differs, and its recomputed pair;
  - the source's bar as the case states it, labelled as the source's and never as this group's (DEC-45);
  - each finding against this group's own bar. That is the group default (`strength.strengthBarOf` with no project, its R16), and with none set, that no bar is set (K1134 reading 3). The axis is reached or not, as `case-checker` R6 reads it, with `not_asked` for a supporting finding;
  - its origin mark facts (DEC-92): `another_groups` (with the edition and whether its signature verified), the acceptance in force (by, when, why, what was checked, the gaps stated) or none, and the open flags;
  - the statement that recreating shows the case intact and consistent, not true (`case-checker` R1's `statement`).

  A `viewer` who is not an active member is answered as if no import exists, with the same bytes for each. It writes nothing. (DEC-112 (6); DEC-92; DEC-96 item 1)

**completeImportedDocument({import, edition, bytes, by, viewer})** (`op=caseimportdocument`; mutating)

- **R5** It applies R1's first two refusals. Bytes whose SHA-256 matches a material that an edition of this import records as missing are stored, and every finding of that edition is re-checked (R3). Bytes matching no missing material are `IMPORT_DOCUMENT_NOT_MISSING`, naming the fingerprint they have. Nothing else about the edition changes. (Publication §5C "a fetched document that matches its fingerprint completes it")

**acceptImported({import, edition, findings, checked, reason, gaps?, by, viewer})** (`op=importaccept`) **and withdrawAcceptance({import, edition, reason, by, viewer})** (`op=importacceptwithdraw`); mutating, each a reasoned act

- **R6** Refusals, in order, each writing nothing:
  - R1's first two refusals;
  - an edition this import does not hold is `IMPORT_NO_SUCH_EDITION`;
  - `checked` (what the member checked) or `reason` absent, blank or over 2,000 characters is `IMPORT_ACCEPT_NO_REASON`;
  - a finding not in the edition is `IMPORT_NO_SUCH_FINDING`;
  - a finding whose result is `did_not_recreate` is `IMPORT_ACCEPT_NOT_RECREATED`, naming each one;
  - a `recreated_in_part` finding for which `gaps` does not state each missing entry in the member's words is `IMPORT_ACCEPT_GAPS_UNSTATED`, naming each gap left unstated.

  Otherwise the act records the acceptance of that one edition for those findings, with `by`, the instant, `checked`, `reason` and `gaps`. It changes no grade: the edition's grades stand as published. A later edition of the same case reads as another group's until it is accepted. The answer names, for each accepted finding, its imported finding reference (`inquiry-grammar.importedFindingRef`), the spelling a leg names. (DEC-96 item 1; DEC-112 (6): "only for findings recreated, or recreated in part with the gaps stated"; N522)
- **R7** `withdrawAcceptance` applies R1's first two refusals and R6's `IMPORT_NO_SUCH_EDITION`. It refuses `IMPORT_ACCEPT_NO_REASON` for a missing `reason`, and `IMPORT_NOTHING_ACCEPTED` when no acceptance of the edition is in force. Otherwise it records the withdrawal with `by`, the instant and `reason`. The acceptance stays in the history, corrected forward and never erased. After the withdrawal commits, it calls `reevaluation.acceptanceWithdrawn` (its R31). The reply carries that answer as `reevaluation`. A failure there never undoes the withdrawal and is named in the reply (`reevaluation` R8's `listeners_failed`). (DEC-96 item 1; N522)

**flagImported({import, edition, finding?, issue, by, viewer})** (`op=importflag`) **and clearFlag({flag, reason, by, viewer})** (`op=importflagclear`); mutating, each a reasoned act

- **R8** A flag is a member's recorded evaluation naming the specific issue, never a machine's. Each act applies R1's first two refusals. An `issue` or `reason` absent, blank or over 2,000 characters is `IMPORT_FLAG_NO_ISSUE`. An edition or finding not held is `IMPORT_NO_SUCH_EDITION` or `IMPORT_NO_SUCH_FINDING`. Clearing a flag that is not open is `IMPORT_FLAG_NOT_OPEN`. A flag records `by`, the instant and the issue. A clear records `by`, the instant and the reason, and the flag stays in the history. Flags are seen only by those who may see the import (R4), and never on a public path, except as a published case of this group discloses an open flag on work it relies on (`case-disclosures` R14; DEC-96 item 4). (DEC-96 items 2, 4; N522)

**acceptanceOf({import, edition, finding}), openFlagsOn({import, edition})** (services for later modules)

- **R9** `acceptanceOf` answers the acceptance in force for a finding of an edition (by, when, why, what was checked, the gaps) or null. `openFlagsOn` answers the open flags with their issues. They are read as the plane. They are the one answer to "is this accepted or flagged" for every later module, including a case of this group that rests on accepted work. `case-disclosures` R13–R14 now read it, for `case-authoring` (its R55). (DEC-96 items 1, 2, 4; N522)

**The registration it fills** (K31's pattern; `accepted-work` R1; N522)

- **R16** At start, the module registers with `accepted-work` (its R1) the following, each read as the plane:
  - `finding` (R4's facts for one finding at one edition, with R9's `acceptanceOf`);
  - `openFlags` (R9's `openFlagsOn`, the edition's own flags and the finding's);
  - `withdrawals` (R7's records, in order, paged);
  - `moves` (R18's publisher moves, in the order recorded, paged; `accepted-work` R8).

  A viewer who is not an active member is answered null, as R4 answers. (DEC-96 items 1, 4; P4)

**watchImport({import, publisher, by, viewer})** (`op=importwatch`) **and unwatchImport({import, by, viewer})** (`op=importunwatch`); member session; each mutating (N534)

- **R17** Refusals, in order, each writing nothing:
  - R1's first two refusals;
  - an import that is absent, or one the viewer may not see, is `IMPORT_NO_SUCH_EDITION` (K1319's one answer);
  - for `watchImport`, a `publisher` that is not a public https locator (`record-grammar.isPublicHttpsLocator`), or that carries a query or a fragment, is `IMPORT_WATCH_BAD_ADDRESS`;
  - for `unwatchImport`, an import with no watch in force is `IMPORT_NOT_WATCHED`.

  Otherwise `watchImport` records a watch with `by`, the instant, `publisher` and the docket address. The docket address is `publisher` with the query `op=docketpublic&case=<the import's case, percent-encoded>&captures=omit` (`docket` R23, R24; `public-read` R25). A watch with the same docket address already in force answers `existed: true` and writes nothing. A different address replaces the watch in force. `unwatchImport` records the end of the watch, with `by` and the instant. Every watch and every end stays in the history. A watch is never a default: an import is not watched until a member asks. A case is watched only once it is imported, since the import holds the case's id and keys, against which its entries are verified (K1339 F2: "cites or follows" read as imported). (DEC-101 (3): "can be configured"; Publication §5A)

**watchedImports({after, limit}) and recordDocketRead({import, docket, at, outcome, reason?, answer?})** (services for `monitoring`; read as the plane)

- **R18** `watchedImports` answers each watch in force, in import order after `after`, at most `limit` (1–200, default 200), with `cursor`. Each is `{import, group, case, docket, set_by, set_at, last_read}`, where `last_read` is `{at, outcome, reason}` or null. It writes nothing and never throws.

  `recordDocketRead` refuses `IMPORT_NO_SUCH_EDITION` for an unknown import. It refuses `IMPORT_NOT_WATCHED` when no watch is in force, or when the watch in force names another docket address. Each refusal writes nothing. Otherwise it records the read `{at, outcome, reason, entries_seen, last_entry}` and answers `{ok: true, outcome, new_entries, new_moves, new_refused}`. It never throws.
  - With `outcome: "unreadable"`, `reason` is kept as `monitoring` gives it.
  - With `outcome: "read"`, an `answer` whose `group` is not the import's group, or whose `case` is not the import's case, is recorded as `unreadable` with reason `not_this_case`. Otherwise each entry of `answer.entries` (`docket` R24) whose `seq` this import does not yet hold is checked, and it is recorded `verified` only when all three checks hold:
    1. **The digest and the form.** The SHA-256 of `json`'s UTF-8 bytes is `digest`. `json` parses to an object whose `format` is `civicsmith-docket-entry/1` or `civicos-docket-entry/1` (one format under two labels, `docket` R6; DEC-124, K1365), whose `group` and `case` are the import's, and whose `seq` is the entry's.
    2. **The signature.** `signatures.verifySshsig(signature, docketStatement(case, seq, digest), NS_DOCKET, …)` verifies against the key the signature embeds. `key_listed` is true when that key is among the keys that the manifest of any edition held in this import lists (`case-grammar` R13), and false otherwise. An entry signed by an unlisted key is kept and verified, labelled `key_listed: false`, and is never refused for it: refusing it would silently drop a real withdrawal signed by a newer manager's key, and silence must be earned (K1339 F3; `case-checker` R3's kind; `reevaluation` R21).
    3. **The chain.** `previous` is the digest of the held entry `seq − 1`, or null when `seq` is 1. When `seq − 1` is not held, the chain is `unchecked`, which does not refuse the entry.

    An entry that fails a check is recorded `refused`, naming the check. It is never a move. An entry whose `seq` is held with another digest is recorded `refused` with `differs: true` and both digests, and the held entry stands.
  - A verified `take-back` entry naming the `seq` of a move is stated beside that move as `taken_back`.
  - After the read commits, the act calls `reevaluation.citedCaseMoved({move})` (its R33) once for each new move. A throw there never undoes the read, and the answer names it under `listeners_failed`.

  (DEC-116 items 6, 8; DEC-101 (3); signatures R39, R40)

**What a member reads** (N534)

- **R19** `importedCases` and `importedCase` (R4) also answer, for each import:
  - `watch`: `{docket, set_by, set_at, last_read}`, or null;
  - when `last_read.outcome` is `unreadable`, `docket_unreadable`: `DOCKET_UNREADABLE`'s sentence ("Could not read the publisher's docket"; `docket` R15) with the reason and the instant, never a statement that nothing changed;
  - and, per edition, `publisher`: the newest `edition` move (its edition, `date`, `what_changed`, `key_listed`), the `withdrawal` move covering that edition by `reevaluation` R33's rule (its `seq`, `date`, `reason`, `key_listed`), each with `taken_back`, or null. A `publisher` of null means only that no move has been seen, and the answer says so together with `last_read`.

  Every entry seen, verified or refused, is answered in order under `docket_entries`. A non-member is answered as R4 says. (DEC-116 item 8: "never that nothing changed")
- **R20** `watchItems({viewer})` (a service for `queue-producers`, read as the plane) answers the following, each naming the import, its group and case, and the watch's `set_by`:
  - `entries`: each verified entry seen, of any kind, with its `seq`, kind, edition, `date`, `key_listed`, the instant this copy read it (`seen_at`; N546) *(not yet met: T32)* and, for a move, `what_changed` or `reason`;
  - `refused`: each refused entry, with its `seq` and the check it failed;
  - `unreadable`: each watch in force whose latest read is `unreadable`, with the reason and the instant.

  A viewer who is not an active member is answered empty. It writes nothing and never throws. (DEC-101 (3): "telling the members"; K1339 F1: a verified entry that is not a move reaches only the watch's setter, through `queue-producers` R35)

  **Settled readings of R16, R18–R20** (CASE-IMPORT #2's questions, K1381, K1383): (1) R18 skips an entry when this import already holds one with the same bytes served (`seq`, `digest`, `json` and `signature`; verified or refused), so a refused tampered copy never hides the genuine entry served later; a `seq` held by a verified entry with another digest makes the new one `refused`, `differs: true`, both digests; a `seq` held only by refused entries is checked afresh. (2) `new_entries` counts every entry the read newly recorded, `new_moves` and `new_refused` being parts of it; `entries_seen` is the length of `answer.entries`, `last_entry` is `answer.last_entry`. (3) `outcome: "read"` without an object carrying an `entries` list is recorded `unreadable`, reason `not_a_docket`; any other outcome than `read` or `unreadable` is `unreadable`, reason `outcome_unknown`; a missing or unreadable `at` is this copy's instant. (4) R19's `publisher.edition` is the newest `edition` move naming an edition later than this one (R33 (a)'s rule); `publisher` is `{edition, withdrawal}`, each null when none, itself null when neither, with `publisher_note` saying no move has been seen, beside `last_read`. (5) R20's `entries` and `refused` cover every entry seen for each import, also under an ended or replaced watch, each naming the `set_by` of the watch whose read saw it; `unreadable` covers watches in force only. (6) R16's move ids are `IMM-<n>`; `after` null or `""` starts from the first.

## Private

### Uses

- `record-grammar`: canonical JSON, `isMachineIdentity`, `createSha256`; `isPublicHttpsLocator` (R17; N534).
- `record-core`: `transact`, `stampInstant`, `declarePurge`.
- `membership`: the session stamp and whether a viewer is an active member.
- `strength`: `strengthBarOf` (its R16; R4).
- `case-grammar`: `caseFileManifestCheck`, `methodOf`, `materialsOf` (its R11–R13).
- `case-checker`: `checkCaseFile` (its R1).
- `inquiry-grammar`: `importedFindingRef` (its R11; R6).
- `accepted-work`: `registerAcceptedWork` (its R1, with its R8's `moves`; R16).
- `reevaluation`: `acceptanceWithdrawn` (its R31; R7); `citedCaseMoved` (its R33; R18; N534).
- `signatures` (N534): `verifySshsig` (its R2), `NS_DOCKET` (its R39), `docketStatement` (its R40), for R18's check 2.
- `docket` (N534): `DOCKET_UNREADABLE` (its R15), for R19; the public answer's form (its R24) that R18 reads, and the entry format's two labels (its R6).

### Invariants

- **R10** No answer composes a case-level strength or a trust score. Origin marks are never composed with grades (DEC-92, DEC-44).
- **R11** The source's bar is never stated or used as this group's (DEC-45). An acceptance changes no grade (DEC-96 item 1).
- **R12** Every act is append-only. An import, its results, acceptances, withdrawals, flags and clears, and its watches, their ends, docket reads and entries seen, are never edited or deleted by any act of this module.
- **R13** This module's tables are declared to `record-core`'s purge as the import's own record (K23). The stored case-file bytes are purged with their import. The watch, read and entry tables are the import's own record, purged with it.
- **R14** Each refusal carries its row in this module's own table (`checks.mjs`), a new family, its number given by `promotion`'s stamp. The translations are drafted by BOB and stamped by promotion. A change moves `CATALOG_VERSION`. Two new rows of the family C-130, stamped by promotion (N534):
  - C-130.15 `IMPORT_WATCH_BAD_ADDRESS`: "That is not the public https address of the publishing group's copy. Give the address of their copy, with no query and no fragment. Nothing was written."
  - C-130.16 `IMPORT_NOT_WATCHED`: "This imported case is not being watched, so there is no watch to end. Nothing was written."
- **R15** No place is named in this module's behaviour or outward text.

### Satisfies

- DEC-112 response 4 (6), with response 2, as K1134 (2) readings 3–5 read it; `BIO_Publication_v0_1.md` §5C ("Import"); `BIO_Complete_Roadmap_v5.md` §11 (import before acceptance).
- DEC-96 items 1 and 2 (the accept, withdraw, flag and clear acts); DEC-92 (the origin mark's facts for imported work); DEC-45, DEC-46 (3). K1256, K1257 (the module).
- DEC-96 item 1's withdrawal notice and item 4 (R16, R7; N522, K1273).
- DEC-101 response 3; DEC-116 item 8 (the citing copy, 'Could not read the publisher's docket'); `BIO_Publication_v0_1.md` §5A, §5D: R17–R20 (N534; K1339, K1366).

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
- **The docket watch (N534).** For R18's check 2, pass the manifests' keys to `verifySshsig`. On `UNKNOWN_KEY`, verify again against the `keyB64` it names, and record `key_listed: false`. Tests:
  - a verified run of entries;
  - a tampered `json`;
  - a signature in another namespace;
  - an unlisted key, which is verified with `key_listed: false`;
  - a broken `previous`;
  - a re-served `seq` with another digest;
  - an entry with the old label `civicos-docket-entry/1` verifies as one with `civicsmith-docket-entry/1`;
  - `not_this_case`;
  - a non-member reads absence;
  - each refusal, with a negative control.

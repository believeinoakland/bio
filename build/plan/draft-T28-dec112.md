# Draft: DEC-112's folds for T28's opening (N519, N520's DEC-112 share)

**Status** · DRAFT by a worker for BOB #103, 2026-10-02, on `tranche/T27` @ 401aa4f9e0, for BOB's review and folding at T28's opening (P18). Nothing is folded yet. While T27 runs, nothing under `build/requirements/`, `build/modules.json` or `build/layers.md` is edited. This draft is built on `plan/draft-T24-dec112.md` (the T23-era draft) and adds K1134's readings, K1251, K1254, K1256, K1257 and K1263. Each fold restates a ruling; only the wording is new. The ids follow the highest id on this branch, after T27's opening folds (`docket` R1–R22 new; `public-read` R19–R21; `publication` R40 widened). T27's jobs add no ids beyond what was folded at its opening, so these ids hold at T28's opening. If a T27 job does add one, BOB renumbers at the fold.

Conventions. A new requirement takes its module's next free id, and no retired id is reused. Every new or changed line ends `*(not yet met: T28)*` and cites its DEC or K. Member-facing words belong to the UX design stream: this draft cites them and never decides them. Where the stream has given no words yet, the text says "one plain sentence saying so".

## Rulings applied

- **DEC-112** (Bob, 2026-10-01), responses 1–4, and `BIO_Publication_v0_1.md` §5C: the three forms, presentability, import with recreation, and acceptance.
- **DEC-112 (5) as amended by K1254 and K1263** (Bob's doctrine):
  - No load-bearing member may rest on material whose only attestation is an off-the-record (anonymous) source. `publishCase` refuses such a case and names the member.
  - Off-the-record material never appears in the published case. It stays in the project as a lead.
  - The rule does not reach a named member's own uncorroborated capture. DEC-81 item 3 still lets that capture carry a case, with a stated reason.
  - §5C's paragraph "Off-the-record sources" is superseded. Amending its text is the UX stream's job (NOTICE, §13.1).
- **K1134 Q6 withdrawn (K1254):** R45's "the project's and the group's" attestations are dropped.
- **K1134 (BOB's, P17):**
  - (1) The format's open specification lives in `case-grammar`'s requirement, and a readable text is published beside each version.
  - (2) Readings:
    - 1: "cannot travel whole" means bytes or text this copy lacks.
    - 3: the importing group's bar is its default bar.
    - 4: there is one imported project per source case and lens, with its editions side by side.
    - 5: checks run at the stated version where it is held, else at the copy's own, saying which.
    - 6: "Withheld" is now moot (K1254).
  - (5) Ids are renumbered at the fold, DEC-112 first.
  - (6) Each module is measured at its START and split first if it would pass 4,000 lines.
- **K1256 with K1257 (BOB's under P17):** `case-checker` sits in L8 directly after `ratification`, and `case-import` directly after `case-checker`. Acceptance (DEC-96) is in `case-import`, which is split later if acceptance grows.
- **DEC-96** (accept, withdraw, flag, clear; the reasoned acts), and **DEC-92**'s origin mark as it applies to imported work.
- **DEC-81** item 3: untouched, and stated as not reached.

Module sizes (P6, mark ~4,000). Each count is the module's `paths` in `modules.json`, measured on this branch with `git ls-files`, every line, tests excluded.

| module | index, layer | lines now | next free id | after T28 (estimate) |
|---|---|---|---|---|
| strength | 47, L6 | 1,773 | R31 | ~1,950 |
| case-grammar | 57, L8 | 750 | R11 | ~1,600 (the complete edition's renderer is here, BOB's decision 4) |
| publication | 59, L8 | 3,633 own (4,351 with `publication/worker.mjs`, public-read's) | R57 | ~3,750: **near the mark** |
| public-read | 61, L8 | 2,408 (plus T27's docket share, ~150) | R22 | ~2,900 |
| ratification | 64, L8 | 3,973 | (R39) | **no change** (any growth passes the mark, K617) |
| **case-checker** | new 65, L8 | 0 | R1 | ~900–1,300 |
| **case-import** | new 66, L8 | 0 | R1 | ~1,600–2,300 |
| case-authoring | 65 → 67, L8 | 3,421 | R43 | ~3,750: **near the mark** |
| review | 66 → 68, L8 | n/a | n/a | index only |

**P6 flags.** `case-authoring` (~3,750) and `publication` (~3,750) come close to the mark. Each job measures at its START. If either would pass the mark, BOB splits it first (K617):
- `case-authoring`: the seam is the case's disclosures, R31–R37 and R43–R49 (tensions, captures, sources, materials).
- `publication`: R57's copying.

No module passes the mark on this estimate.

---

## 1. case-checker (new; L8, directly after `ratification`)

Paste as `build/requirements/case-checker.md`:

```markdown
# case-checker — requirements

**Status** · Requirements for T28, folded by a worker for BOB #103 at T28's opening, entries N520 (DEC-112's share) and N519 (`plan/draft-T28-dec112.md`). A new product module with no `from` (K1256, K1257: its place is BOB's under P17). It sits in layer 8 directly after `ratification`, whose pure case-document checks it runs, and before `case-import`, which recreates through it. Its own T28 job writes its code at `bio-plane/src/case-checker/` and its tests at `bio-plane/test/m/case-checker/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28).

**Size (P6).** About 900–1,300 lines, well under 4,000: the checks, the result composer, the readable specification and the build of the standalone program.

## Public

### Purpose

Anybody can check a published case, and recreate its findings, without a CivicOS copy (DEC-112 (3); Publication §5C). This module is the one checker. It is a pure function that CivicOS runs on import (`case-import`), built from the same check code CivicOS runs. It is also a standalone program that anyone runs offline against a case file. Recreating shows a case intact and consistent, not true.

### Provides

Terms. The **case file**, its **manifest**, **parts** and **files** are `case-grammar` R13's. A **finding** is a member of the case edition, or a finding a member's chain reaches. A **result** is one of `recreated`, `recreated_in_part` or `did_not_recreate`.

**checkCaseFile({parts, documents?, keys?})**

- **R1** It answers `{format, case, edition, group, checker: {grading_versions, checks_version}, integrity, signatures, publication_checks, findings: [{finding, role, result, missing[], differs[], pair, bar_met}], complete_edition, statement}`. `parts` are the case file's parts as bytes. `documents` are bytes supplied later for missing material (R9). `keys` is the publishing group's public signing keys, as its copy serves them (`network-notices`). `statement` is the sentence that recreating shows the case intact and consistent, not true; the words are the UX stream's, and until it gives them, that plain sentence. It is pure: it reads nothing but its arguments, writes nothing, makes no network request and never throws. Malformed input answers `integrity` with each departure named and every finding `did_not_recreate`. (DEC-112 (3)(6); Publication §5C) *(not yet met: T28)*
- **R2** Integrity. The manifest is checked by `case-grammar`'s `caseFileManifestCheck` (its R13). Every file's SHA-256 and byte length are checked against the manifest, and so is every part's SHA-256. When a part or file is absent, it is named in `missing` for each finding that needs it. When a hash differs, it is named in `differs` for each such finding. (DEC-112 (3)) *(not yet met: T28)*
- **R3** Signatures. The case document's signature is verified with `signatures.verifySshsig` over `caseRatifyStatement(case, edition, doc_sha)` in the ratify namespace. Each member finding's signature is verified over `ratifyStatement(id, sha)`. Each is checked against the key it embeds and the keys the case file lists (`case-grammar` R13). When `keys` is given, the answer also says whether each signing key is among them. When `keys` is absent, the answer states that the keys were not checked against the group's published list. A signature that fails is a `differs` entry for the case and for every finding it covers. (DEC-112 (3); Publication §5C "signatures and fingerprints check") *(not yet met: T28)*
- **R4** Passages. Each passage a finding relies on (`case-grammar` R13's `passages` rows) must be found where it is said to be: its quoted text occurs in its document's carried extracted text at its stated extent, and its `content_id` recomputes by `content.contentIdFor` (its R3). If the passage is not found, that is a `differs` entry. If the document's extracted text is not carried, that is a `missing` entry. (Publication §5C "each passage is found where it is said to be") *(not yet met: T28)*
- **R5** Grades. Each finding's pair is recomputed by `strength.recomputePair` (its R32) from the finding's carried grading facts, at the `grading` version the signed case document states (`case-grammar` R11).
  - A pair that differs from the pair the document records is a `differs` entry naming the axis, the recorded grade and the recomputed grade.
  - A version this checker does not hold (`UNKNOWN_METHOD_VERSION`) is a `missing` entry naming the version.
  - `pair` is the recomputed pair. Pairs are per finding and per axis, and nothing composes them (R12). (Publication §5C "each grade recomputes the same by the stated method version") *(not yet met: T28)*
- **R6** The bar. A load-bearing member that reaches the bar the document records on every declared axis answers `bar_met: true`. Otherwise it answers `bar_met: false`, naming each axis, and that is a `differs` entry. A supporting member answers `bar_met: "not_asked"`, and a case with no bar answers `bar_met: "no_bar"`. (Publication §5C "each relied-on finding meets the declared bar"; `case-authoring` R6) *(not yet met: T28)*
- **R7** Publication checks. `ratification.checkCaseDocument` (its R8, pure) runs over the case document. Arms that need the record (an absent member basis) are left unasked and named. `publication_checks` answers the findings, the catalogue version the document states (`case-grammar` R11's `checks`), and this checker's own version. When the two versions differ, it states that the checks ran at this checker's version, not the stated one (K1134 reading 5). A refusal it finds is a `differs` entry for the case. (Publication §5C "the case passes the same publication checks") *(not yet met: T28)*
- **R8** Presentability. Every material a load-bearing member's chain reaches must be listed in the document's `materials:` block (`case-grammar` R12) as `included: true` and carried whole: its bytes and extracted text, or an observation's text. Missing carried bytes are a `missing` entry. A load-bearing chain reaching material that is not listed, or listed `included: false`, is a `differs` entry. (DEC-112 (4); K1254) *(not yet met: T28)*
- **R9** Completion. Bytes in `documents` whose SHA-256 matches a material's recorded fingerprint fill that gap, and the finding is re-checked with them. Bytes that match no recorded fingerprint are named in the answer and never used. (Publication §5C "a fetched document that matches its fingerprint completes it") *(not yet met: T28)*
- **R10** The complete edition. `complete_edition` answers whether the carried complete edition's bytes equal the edition `case-grammar.completeEditionOf` (its R14) renders from the rest of the case file. When they differ, that is a `differs` entry for the case. (DEC-112 (2)(3)) *(not yet met: T28)*
- **R11** Results. A finding is `recreated` when it has no `missing` and no `differs` entry, including none from the case-level checks R2, R3, R7 and R10. It is `recreated_in_part` when it has `missing` entries and no `differs` entry. Otherwise it is `did_not_recreate`. Each entry names what is missing or what differs in words a reader can act on, for example a document to fetch, with its fingerprint and origin. (DEC-112 (6)) *(not yet met: T28)*

**The standalone program and the readable specification**

- **R13** The module builds one self-contained program file from the code of R1–R11, with nothing to install and no network access, that runs `checkCaseFile` on case-file parts a person gives it and prints R1's answer, each finding's result first. The same build produces the same bytes. The program file carries its own SHA-256. (DEC-112 (3): "a standalone open checker let[s] anyone recreate a case without CivicOS") *(not yet met: T28)*
- **R14** The readable specification of each case-file format version (`bio-case-file/1` first) is a document held with this module. It is written from `case-grammar` R11–R13 and states every field, kind and rule a checker needs. Its version names the format it specifies. (K1134 (1); DEC-112 (3) "an open specification") *(not yet met: T28)*
- **R15** At start, the module registers with `public-read` (its R18) two credential-free public reads: `casechecker`, which answers R13's program file, and `casefilespec`, which answers R14's specification for a named version (`version`). An unknown version is answered with the versions held. (DEC-112 (3); K1134 (1)) *(not yet met: T28)*

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, canonical JSON.
- `signatures`: `verifySshsig`, `ratifyStatement`, `caseRatifyStatement`, the ratify namespace (R3).
- `bundler`: the build of R13's program.
- `content`: `contentIdFor`, `canonicalExtent` (its R2, R3; R4).
- `strength`: `recomputePair`, `GRADING_METHOD_VERSION` (its R31, R32; R5).
- `case-grammar`: `caseFileManifestCheck`, `methodOf`, `materialsOf`, `completeEditionOf` and the format predicates (its R1, R11–R14).
- `public-read`: the public-read registration (its R18; R15).
- `ratification`: `checkCaseDocument`, `CASE_MEMBER_ROLES` (its R8, R9; R7).

### Invariants

- **R12** No answer composes a case-level strength or a single verdict on the case's truth. Pairs are per finding and per axis (DEC-44, DEC-21), and recreation is never stated as endorsement (Publication §5C). *(not yet met: T28)*
- **R16** R1–R11 read only their arguments. The same arguments always give the same answer (byte-identical canonical JSON), on a CivicOS copy and in the standalone program alike. *(not yet met: T28)*
- **R17** No place is named in this module's behaviour or outward text. *(not yet met: T28)*

### Satisfies

- DEC-112 response 4 (3) (the open specification and the standalone open checker) and (6) (recreation, the three results), as K1134 (1), (2) readings 1 and 5 read them; `BIO_Publication_v0_1.md` §5C ("The case file", "Import"); K1254 (R8). K1256, K1257 (the module).

### Suggestions

- **The program's form** is BOB's at the START. One JavaScript file runnable by Node with no dependencies, which also works as an HTML page with the script inline, is one way to meet "nothing to install".
- **Import only pure code.** Import the pure check code from `ratification/checks.mjs` and `strength/arithmetic.mjs`, not their store-bound entry points, so the bundle stays small and offline.
- **Tests.**
  - A case file built by `public-read` R23 from a fixture case recreates every finding.
  - Each check has a negative control: a changed byte, a forged signature, a moved passage, a changed recorded grade, a bar not met, a missing part (`recreated_in_part`), a document supplied later that matches, and one that does not.
  - The standalone program and `checkCaseFile` give the same answer on the same parts.
```

---

## 2. case-import (new; L8, directly after `case-checker`)

Paste as `build/requirements/case-import.md`:

```markdown
# case-import — requirements

**Status** · Requirements for T28, folded by a worker for BOB #103 at T28's opening, entry N520 (DEC-112's share), with DEC-96's acts (`plan/draft-T28-dec112.md`). A new product module with no `from` (K1256, K1257). It sits in layer 8 directly after `case-checker`, through which it recreates, and before `case-authoring`. Its own T28 job writes its code at `bio-plane/src/case-import/` and its tests at `bio-plane/test/m/case-import/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28). It answers `next.md` rows H1 (DEC-96) and J4 (DEC-92, for imported work).

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

  Otherwise the act records the acceptance of that one edition for those findings, with `by`, the instant, `checked`, `reason` and `gaps`. It changes no grade: the edition's grades stand as published. A later edition of the same case reads as another group's until it is accepted. (DEC-96 item 1; DEC-112 (6): "only for findings recreated, or recreated in part with the gaps stated") *(not yet met: T28)*
- **R7** `withdrawAcceptance` applies R1's first two refusals and R6's `IMPORT_NO_SUCH_EDITION`. It refuses `IMPORT_ACCEPT_NO_REASON` for a missing `reason`, and `IMPORT_NOTHING_ACCEPTED` when no acceptance of the edition is in force. Otherwise it records the withdrawal with `by`, the instant and `reason`. The acceptance stays in the history, corrected forward and never erased. (DEC-96 item 1) *(not yet met: T28)*

**flagImported({import, edition, finding?, issue, by, viewer})** (`op=importflag`) **and clearFlag({flag, reason, by, viewer})** (`op=importflagclear`); mutating, each a reasoned act

- **R8** A flag is a member's recorded evaluation naming the specific issue, never a machine's. Each act applies R1's first two refusals. An `issue` or `reason` absent, blank or over 2,000 characters is `IMPORT_FLAG_NO_ISSUE`. An edition or finding not held is `IMPORT_NO_SUCH_EDITION` or `IMPORT_NO_SUCH_FINDING`. Clearing a flag that is not open is `IMPORT_FLAG_NOT_OPEN`. A flag records `by`, the instant and the issue. A clear records `by`, the instant and the reason, and the flag stays in the history. Flags are seen only by those who may see the import (R4), and never on a public path. (DEC-96 item 2) *(not yet met: T28)*

**acceptanceOf({import, edition, finding}), openFlagsOn({import, edition})** (services for later modules)

- **R9** `acceptanceOf` answers the acceptance in force for a finding of an edition (by, when, why, what was checked, the gaps) or null. `openFlagsOn` answers the open flags with their issues. They are read as the plane. They are the one answer to "is this accepted or flagged" for every later module, including a case of this group that rests on accepted work (DEC-96 item 4, a later entry). (DEC-96 items 1, 2, 4) *(not yet met: T28)*

## Private

### Uses

- `record-grammar`: canonical JSON, `isMachineIdentity`, `createSha256`.
- `record-core`: `transact`, `stampInstant`, `declarePurge`.
- `membership`: the session stamp and whether a viewer is an active member.
- `strength`: `strengthBarOf` (its R16; R4).
- `case-grammar`: `caseFileManifestCheck`, `methodOf`, `materialsOf` (its R11–R13).
- `case-checker`: `checkCaseFile` (its R1).

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
```

---

## 3. case-grammar (index 57, L8; 750 lines; next free id R11)

New requirements, added under a new heading `#### The case's method, its materials and the case file (DEC-112; K1254, K1263)`:

- **R11** The case document's `method:` block, `{grading, checks}`. `grading` is the grading method's version (`strength` R31). `checks` is the catalogue version the document was checked under (`promotion`'s `CATALOG_VERSION`). `methodOf(fm)` reads it back. A document without it answers null. Pure; never throws. (DEC-112 (3): "the version of the method and checks inside the signed case") *(not yet met: T28)*
- **R12** The case document's `materials:` block has one row per document or observation that any member's chain reaches: `{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under}`.
  - `kind` is `document` or `observation`.
  - `included` is true when the material travels whole, and false when only its fingerprint, origin and archived copy travel.
  - `rests_under` is `load_bearing` when any load-bearing member's chain reaches it, else `supporting`.

  `material_attestations:` holds one row per attestation, `{ref, by_kind, by, at, signature}`. `by_kind` is `member` (a capturing member's signed account, or an observation's author as its attribution level allows) or `co_attestation` (a trusted timestamp or a co-archive). The rows are flat, as R1's blocks are (K549). `materialsOf(fm)` reads both blocks back. A document without them answers null. Pure; never throws.

  No row names, counts or fingerprints material whose only attestation is an off-the-record source, and no row has a field for such a source (K1254, K1263 (a)). (DEC-112 (3)(4); K1134 Q6 withdrawn) *(not yet met: T28)*
- **R13** `CASE_FILE_FORMAT` is `bio-case-file/1`.
  - **The manifest** names: the format; the source group's slug; the case, edition and case document's SHA-256; the signing keys with their fingerprints; each part (one file of a case file that is split), with its index, SHA-256 and bytes; and every file, with its path, SHA-256, bytes, part and kind.
  - **The kinds** are:
    - `case_document`, `case_signature`, `complete_edition`;
    - `finding` (a finding's published bytes) and `finding_signature`;
    - `grading_facts` (one finding's facts that `strength` R32 reads, as recorded at the act);
    - `passages` (one finding's relied-on passages, each `{content_id, capture_sha, extent, quoted}`, the extent in `content`'s canonical form);
    - `document` (captured bytes, whole), `extracted_text` and `observation` (its text, whole);
    - `attestation` (a signed account, a timestamp token, a co-archive record).
  - **The check.** `caseFileManifestCheck(manifest)` answers every way a manifest departs from this rule, each named, or none. Pure; never throws.

  This is the one spelling of the format for `public-read` R23, `case-checker` and `case-import`. Its readable specification is `case-checker` R14 (K1134 (1)). (DEC-112 (3); Publication §5C) *(not yet met: T28)*
- **R14** `completeEditionOf(caseFile)` renders the complete edition from a case file's other files. The result is one HTML file with every style inline, no script and no external reference, so it opens with nothing installed and no network. There is no length limit and nothing is left out for length. Its order is:
  1. the claims;
  2. each finding, opening with its standing line (R15), then its two grades with their plain meanings (DEC-82), then its chain down to the exact passages relied on, each quoted with its location;
  3. every document and observation in `materials:`, with its fingerprint, origin and archived copy (one not included says so);
  4. what was searched;
  5. the declared bias (the lens section, R9);
  6. disclosed contradictions;
  7. the strength section, opening "a case has two strengths, never one";
  8. the grading method in plain words (`strength.gradingMethodText` at the document's `grading` version);
  9. "How to check this case yourself", in plain language, naming the checker's public read (`case-checker` R15).

  Every page carries the identifying notice: the case, edition, group, declared bias, both floors, and the case document's hash with where to verify it (DEC-34). The same case file always gives the same bytes. The words of the sentences and headings are the UX stream's: the text above is used until the stream gives its words. Pure; never throws. (DEC-112 (2); Publication §5C) *(not yet met: T28)*
- **R15** `standingOf({role, bar, pair})` answers `{role, bar, meets, line}`.
  - `bar` gives each declared axis its grade, and null for an undeclared axis.
  - `meets` answers as follows: for a load-bearing member, `true` when the pair reaches the bar on every declared axis, else `false` naming each axis it falls short on; for a supporting member, `not_asked`; with no bar, `no_bar`.
  - `line` is one sentence naming the role and the bar with its per-axis grades. It never says "meets" without the bar it is measured against, and it composes no case-level strength.

  The line's words are the UX stream's: DEC-112's example "Relied on · meets this project's bar (capture B, connection C)" is used until the stream gives them. Pure; never throws. (DEC-112 (4)(1); Publication §5C "The public page") *(not yet met: T28)*

Changed:

- **R1 gains:** `CASE_DOCUMENT_FORMAT` becomes `bio-case-document/6`, and `/5`–`/1` are accepted as written. `/6` states everything `/5` states, plus R11's `method:` block and R12's `materials:` and `material_attestations:` blocks, which `caseDocumentRequiresMaterials(fm)` (true for `/6` only) makes required. The other predicates hold for `/6` as they hold for `/5`. (DEC-112 (3); BOB's decision 2) *(not yet met: T28)*
- **Uses gain** `strength` (`gradingMethodText`, its R31; R14). Index 47 is before 57.
- **Satisfies gains** DEC-112 response 4 (1)–(4) and `BIO_Publication_v0_1.md` §5C (R11–R15), with K1134 (1), K1254 and K1263 (R12).
- **Suggestions gain:** R14 and R15 are here, not in `public-read`, so that the plane, the checker and import render one way, and `public-read` stays well under the mark (BOB's decision 4). Tests: R11–R13 round-trip, each with a negative control. R14 gives byte-identical output twice, and a reordered input gives the same bytes. R15 covers the four `meets` arms.

## 4. strength (index 47, L6; 1,773 lines; next free id R31)

- **R31** `GRADING_METHOD_VERSION` names the grading arithmetic of R1–R5, R29 and R30, and changes whenever any of them changes. `gradingMethodText(version)` answers that version's method in plain words, complete enough to recompute a grade by hand. An unknown version answers null. Pure; never throws. (DEC-112 (2)(3)) *(not yet met: T28)*
- **R32** `recomputePair({legs, levels?, version})` answers the pair (R1–R5, R29, R30) from the facts a case file states for one finding, and reads nothing else. Each leg gives its target's recorded grade or answer, its axis, its grade source and its ground. It answers for every version this module has published. Any other version is `UNKNOWN_METHOD_VERSION`. Pure; writes nothing; never throws. (DEC-112 (3)(6); Publication §5C "each grade recomputes the same by the stated method version") *(not yet met: T28)*
- Satisfies gains DEC-112 (R31, R32). No new edge.

## 5. publication (index 59, L8; 3,633 own lines; next free id R57)

- **R57** At a case edition's commit (`commitCaseEdition`, R22), the published projection comes to hold, by SHA-256, the whole captured bytes and extracted text of every document, and the whole text of every observation, that the document's `materials:` block (`case-grammar` R12) lists as `included: true`. `public-read` can then carry them in the case file from the published projection alone. Nothing is held for material listed `included: false`. Each is exempt from purge, as published bytes are (R31). (DEC-112 (3)(4); Publication §5C: today's container "holds no rendering and no capture bytes") *(not yet met: T28)*
- **R58** `commitCaseEdition` refuses a case document whose format is not `/6` with `CASE_FORMAT_SUPERSEDED` (C-122.2, a new row), and nothing is committed. Every edition committed from T28 on carries its method and materials, and a preparation made before T28 is prepared again (BOB's decision 5). Its translation is BOB's draft: "This case was prepared before published cases carried everything they rest on. Prepare it again, and sign the new preparation. Nothing was published." *(not yet met: T28)*
- **R33 gains** C-122.2. *(not yet met: T28)*
- **Unchanged and relied on:** R51 already re-reads a source's consent at the commit. A named source whose consent is withdrawn between authoring and commit is refused there (`SOURCE_CONSENT_WITHDRAWN`), so a source who becomes off-the-record after preparation cannot reach a signed case (K1254).
- **Uses gain** `extraction` (the readings' extracted text, for R57). Index 34 is before 59. The job may find the extracted text already reachable through a use it has (BOB's call at the START).

## 6. public-read (index 61, L8; 2,408 lines; next free id R22, after T27's R19–R21)

- **R22** `publishedCase` (R3) answers, for each member, `standing`: `case-grammar.standingOf` (its R15) over the member's role, the bar the signed document records, and its frozen pair, read from the signed document only. It composes no case-level strength (R11). (DEC-112 (4)(1); Publication §5C "The public page") *(not yet met: T28)*
- **R23** The case file (`case-grammar` R13) carries, from the published projection only:
  - the signed case document and its signature;
  - the complete edition (R24);
  - each member's published bytes and signature, and each finding a member's chain reaches, with its grading facts and its passages;
  - every material the `materials:` block lists `included: true`, whole, with its extracted text (`publication` R57);
  - the attestations the block lists;
  - the signing keys.

  When it would pass the part bound (R5), it is split into parts. Each part is fingerprinted and listed in every part's manifest, and nothing is left out. (DEC-112 (3); Publication §5C) *(not yet met: T28)*
- **R24** The complete edition carried in the case file is `case-grammar.completeEditionOf` (its R14) over the case file's other files. Its SHA-256 is recorded in the manifest, and it is served by hash like every published file (R5). (DEC-112 (2)) *(not yet met: T28)*
- **R6 becomes:** The case file (R23; `case-grammar` R13) is a stored (uncompressed) ZIP per part, with fixed timestamps, the manifest at each part's root and each file under the root at its path. The same manifest and files give the same bytes. `assembleCaseContainer(case, edition)` builds it once, when a case edition's last member is published, and records its manifest through `publication`'s `recordCaseManifest` (`publication` R15), reached through its op as today. (Was "the container". The name `assembleCaseContainer` is kept, so `ratification` R6 is unchanged: BOB's decision 3.) (DEC-112 (3)) *(not yet met: T28)*
- **R5 becomes:** … `CONTAINER_TOO_LARGE` (C-98.7) is over 64 MiB **for one part**. A case file is never refused for its size; it is split (R23). (Rest unchanged.) *(not yet met: T28)*
- **R3 gains:** For a `/6` document, the answer also carries its `method` and `materials` blocks (`case-grammar` R11, R12) as signed. *(not yet met: T28)*
- **Uses:** no new edge (`case-grammar`, `publication` already).
- **Satisfies gains** DEC-112 response 4 (1)–(3) and §5C (R22–R24).
- **Not here (the UX stream's):** the public page itself, its line's exact words and the order of line, grades and detail belong to the redesign (`legacy-ui`, K633). R22 gives the page its data.

## 7. case-authoring (index 65 → 67, L8; 3,421 lines; next free id R43)

New, under a new heading `#### What the case carries, and what it may rest on (DEC-112; K1254, K1263)`:

- **R43** `publishCase` writes the `method:` block (`case-grammar` R11) with `strength`'s `GRADING_METHOD_VERSION` and `promotion`'s `CATALOG_VERSION` at the act, so the version is inside what the owner signs. (DEC-112 (3)) *(not yet met: T28)*
- **R44** `publishCase` refuses `RELIED_ON_NOT_PRESENTABLE` (C-120.8) before anything is written when a load-bearing member's chain reaches a document or observation that this copy does not hold whole (the captured bytes and extracted text, or an observation's text). It names each member and each such document or observation. The translation names the three remedies: find a presentable copy, stop relying on it, or make the finding supporting. Material that only supporting members' chains reach, and that is not held whole, is listed in `materials:` with `included: false` and its fingerprint, origin and archived copy, and it is never refused. (DEC-112 (4); Publication §5C; K1134 reading 1) *(not yet met: T28)*
- **R45** `publishCase` writes the `materials:` and `material_attestations:` blocks (`case-grammar` R12) from the record at the act. That covers every document and observation a member's chain reaches, with:
  - its fingerprint, its extracted text's fingerprint, its origin and archived copy (`attestation.attestationsOf`);
  - whether it is included (R44);
  - its attestations: the capturing member's signed accounts (`capture.captureAccountsOf`), an observation's author as their attribution level allows (`publication` R17), and its co-attestation (R35).

  It writes no project or group attestation (K1134 Q6 withdrawn, K1254). (DEC-112 (3)(4)) *(not yet met: T28)*
- **R46** Terms for R46–R49.
  - A capture's source is **off-the-record** when the capture's `source` is a knocker or a hand-carried source and `sources.publishableAt({source, audience: "public"})` answers no `name` entry. The published case could not name them.
  - Material's **only attestation is off-the-record** when every capture of the document that this copy holds (`provenance`'s register) has an off-the-record source.
  - A chain **reaches** what its legs target, followed through inquiry legs to `strength`'s depth bound (its R2).

  `publishCase` refuses `RELIED_ON_OFF_THE_RECORD` (C-120.9) before anything is written when a load-bearing member's chain reaches material whose only attestation is off-the-record. It names each member and the leg that reaches the material, and nothing of the source. Its translation (BOB's draft, the UX stream may re-word it): "A finding this case relies on rests on material that only an anonymous source vouches for. An anonymous source can lead you to evidence, but cannot be the evidence. Find the material on the record (often a public copy, captured by a member), or take it out of the finding's basis. Nothing was written." (DEC-112 (5) as amended by K1254; K1263) *(not yet met: T28)*
- **R47** *(Subject to Bob's question 1, below; recommended as written.)* R46's refusal also applies to a supporting member's chain, with the same code naming the member's role. Off-the-record material never appears in the published case: as a basis, as a fingerprint, or as an origin. (K1263 (a)) *(not yet met: T28)*
- **R48** No case document this module writes, and no answer it gives, names, counts or fingerprints a capture whose source is off-the-record, or that source. Material held both by such a capture and by an on-the-record capture of the same bytes is stated through the on-the-record capture only. (K1254; K1263 (a)) *(not yet met: T28)*
- **R49** R46–R48 never reach a capture that a named member made. A load-bearing, self-attested Grade B capture is governed by R35 and R36 (DEC-81 item 3), unchanged. Testimony a member credited at the group or project level is governed by `strength` R29 and `ratification` R35 (DEC-102), unchanged. (K1263 (b)) *(not yet met: T28)*

Changed:

- **R14 gains:** the format is `bio-case-document/6`; … the `method:` block (R43); the `materials:` and `material_attestations:` blocks (R45) … *(not yet met: T28)*
- **R34 becomes:** … `blockers` lists every other refusal it can reach independently: R6, R12, R35, R44, R46 (with R47) and R31 (as R32 reads it), and `ratification` R18's list. … `steps` gives the five steps' content: what becomes permanent, which states that the case republishes in full every document it includes, and that judging whether they may be republished, copyright included, is the group's (DEC-112 (4); the words are the UX stream's, and until it gives them, that plain sentence); … (rest unchanged). *(not yet met: T28)*
- **R37 becomes:** For each capture whose `source` is a knocker or a hand-carried source and is not off-the-record (R46), the `sources:` block states only what `sources.publishableAt({audience: "public"})` answers, with its basis. No authored field adds to it. (Its arm "with nothing publishable it states 'an unnamed source'" is struck: R46–R48 keep such a capture out of every case.) (K1254, K1263) *(not yet met: T28)*
- **R29 gains** C-120.8 and C-120.9, in the family "a case's disclosures and its pre-flight". C-120.8's translation (BOB's draft): "A finding this case relies on rests on material this copy does not hold whole, and everything a case relies on travels with it in full. Find a presentable copy, stop relying on the material, or make the finding supporting. Nothing was written." *(not yet met: T28)*
- **R33 (DEC-85) binds R45 unchanged:** a side the publisher could not see is never listed in `materials:`.
- **Uses gain:**
  - `promotion` (`CATALOG_VERSION`; R43; index 23 is before 67). This reverses "Decided by BOB" 5 ("not `promotion`"): BOB's decision 10.
  - `sources.publishableAt` (already used) for R46.
  - `provenance`'s register (already used) for R46.
  - `attestation.attestationsOf` (already used) for R45.
- **Satisfies gains** DEC-112 response 4 (3)(4), and (5) as amended by K1254 and K1263; `BIO_Publication_v0_1.md` §5C ("Everything a conclusion rests on must be presentable"; its "Off-the-record sources" paragraph is superseded by K1254, and its amendment is the UX stream's, §13.1).
- **Suggestions gain (tests):**
  - A load-bearing knocker-only document is refused, and the refusal names no source.
  - The same bytes also captured by a named member publish, through that capture only.
  - A named member's self-attested capture still publishes with its reason (R49's negative control).
  - Material not held whole under a load-bearing member is refused, and under a supporting member is listed `included: false`.
  - The `method:` block carries both versions.

## 8. ratification (index 64, L8; 3,973 lines)

No change. The refusals sit at preparation and pre-flight (case-authoring R44, R46, R34), and at the commit through `publication` R51 and R58. `ratification` R6's call keeps the name `assembleCaseContainer`. Any growth would pass the mark (K617). If BOB wants a signing-time check, `ratification` is split first.

## 9. modules.json and layers.md

**modules.json:** insert after `ratification` (index 64), so that `case-authoring` and every later module shift by two:

```json
{"id": "case-checker", "layer": 8, "paths": [], "tests": [], "uses": ["record-grammar", "signatures", "bundler", "content", "strength", "case-grammar", "public-read", "ratification"]},
{"id": "case-import", "layer": 8, "paths": [], "tests": [], "uses": ["record-grammar", "record-core", "membership", "strength", "case-grammar", "case-checker"]},
```

Edges gained by existing entries:
- `case-grammar` gains `strength`.
- `publication` gains `extraction` (unless the job finds no need).
- `case-authoring` gains `promotion`.
- `control-plane`, `op-declarations`, `affordances` and `plane` gain `case-import` in their L11 jobs.

Every `uses` names only earlier modules (P4): case-checker at 65 uses 0, 4, 5, 35, 47, 57, 61, 64; case-import at 66 uses 0, 20, 21, 47, 57, 65. Append to the `status` field: "AMENDED at T28's opening by BOB #103 (N519, N520; K1256, K1257; DEC-112): `case-checker` and `case-import`, new product modules, directly after `ratification` in layer 8."

**layers.md:**
- Row 8's module list becomes `case-grammar, corpus-export, publication, docket, public-read, project-stage, network-notices, ratification, case-checker, case-import, case-authoring, review`, and the module count moves by two.
- Append to the Status line: "AMENDED at T28's opening by BOB #103 (N519, N520; K1256, K1257; DEC-112): `case-checker` and `case-import`, new product modules, directly after `ratification` in layer 8 (below)."
- Add a section:

```markdown
## Layer 8: case-checker and case-import (DEC-112, DEC-96; N520, K1256, K1257)

Two new product modules, not splits (`build/requirements/case-checker.md`, `case-import.md`, from `plan/draft-T28-dec112.md`). Each has no `from` and is created by its own T28 job at `bio-plane/src/<module>/` (tests at `bio-plane/test/m/<module>/`). That job adds its paths and tests to its `modules.json` entry (K1043's form). `case-checker` sits directly after `ratification`, because it runs `ratification`'s pure case-document checks, the same check code CivicOS runs. `case-import` sits directly after `case-checker`, because it recreates through it, and before `case-authoring`, so a later fold can state in a case that a finding rests on another group's accepted work (DEC-96 item 4). No existing module holds either under 4,000 lines (P6): `ratification` measures 3,973 and `case-authoring` 3,421.

| module | what it does | source |
| --- | --- | --- |
| case-checker | The one checker of a case file: integrity, signatures, passages, grades recomputed at the stated method version, the bar, the publication checks, presentability and the complete edition, giving each finding Recreated, Recreated in part or Did not recreate. It is a pure function, and also a standalone offline program with the readable format specification, both served on the public path. | new (DEC-112 (3)(6); `BIO_Publication_v0_1.md` §5C) |
| case-import | Import of another group's case file into a read-only project per source case and lens, with editions side by side; recreation per finding; the importing group's own bar; completion by a fetched document; acceptance of an edition (only for recreated findings, gaps stated), its withdrawal, and flags, all reasoned. | new (DEC-112 (6), DEC-96, DEC-92; §5C) |

Uses: `case-checker` uses record-grammar, signatures, bundler, content, strength, case-grammar, public-read and ratification. `case-import` uses record-grammar, record-core, membership, strength, case-grammar and case-checker. `control-plane`, `op-declarations`, `affordances` and `plane` gain `case-import`. Membership's `MODULE_ORDER` (its R83) is re-pinned to the new order in T28's layer 2.
```

---

## BOB's decisions (wording level, P17; one line each, for `rulings.md`)

1. **Ids.**
   - strength R31–R32.
   - case-grammar R11–R15, with R1 amended.
   - publication R57–R58, with R33 amended.
   - public-read R22–R24, with R3, R5 and R6 amended. T27 took R19–R21, so the T24 draft's R19–R21 move to R22–R24 (K1134 (5)).
   - case-authoring R43–R49, with R14, R29, R34 and R37 amended.
   - Rows C-120.8, C-120.9 and C-122.2.
   - case-import's rows are a new family numbered at the stamp.
   - case-checker answers results, not refusals, so it has no rows.
2. **Format `/6`, not `/5`.** The new blocks are required, and one format predicate is the only way to say "required" without guessing whether a `/5` document is stored on a deployed plane.
3. **`assembleCaseContainer` keeps its name,** so `ratification` (3,973 lines) needs no wording change.
4. **The complete edition's renderer and the standing line live in `case-grammar`,** as pure functions (R14, R15), not in `public-read`. Plane, checker and import then render one way, and `public-read` stays at ~2,900 lines, not ~3,600.
5. **`publication` R58 refuses committing a pre-`/6` preparation.** Without it, a draft prepared before T28 could be signed without materials, bypassing R44 and R46. R51's consent re-read covers a source going off the record after preparation.
6. **An import is held in `case-import`'s own tables, never as record bundles.** It is read-only by construction, with no fence needed in `promotion` (L2). Its id is derived from `{group, case, lens}`, so nothing is minted.
7. **The checker is served by `public-read` R18's registration** (program and specification), and its readable specification is a file of `case-checker` (K1134 (1)).
8. **Keys.** Signatures are checked against the keys the case file carries, and, when a reader supplies them, the group's published key list (`network-notices`). When none is supplied, the answer says the list was not checked.
9. **Checks version.** Publication checks run at the checker's own catalogue version and state the stated version beside it (K1134 reading 5: a copy holds only its own catalogue).
10. **`case-authoring` gains `promotion`** for `CATALOG_VERSION`, reversing its "Decided by BOB" 5.
11. **"Only attestation".** Another capture of the same bytes held by this copy, from an on-the-record source, lifts R46. A trusted timestamp over a knocker's bytes proves only when the bytes existed, not who vouches for them, so it does not.
12. **Part bound.** It is `public-read` R5's 64 MiB unless a START measures a better one.
13. **DEC-96 item 4 is deferred, and item 1's re-evaluation notice on withdrawal is not built here.** These are the case's statement of acceptance and the disclosure of open flags when this group's own work rests on accepted work. They wait on a leg that can target an imported finding, which `inquiry` (L6) does not have. New `next.md` entry: "DEC-96 items 1 (re-evaluation notice) and 4, DEC-112 (6)'s last clause: an own finding resting on an accepted imported finding; the case's statement of acceptance; the open-flag disclosure check; hard reason: dependency not yet built (case-import lands in T28; inquiry has no leg target for imported work)."
14. **Carried-table rows.** Rows H1 (DEC-96) and J4 (DEC-92, for imported work) leave the carried table once T28 folds. Row H6b (DEC-101 (3), watching other groups' editions) stays, with its reason now "not yet planned".

## Questions for Bob (requirement meaning), each with a recommendation

1. **A supporting finding resting on off-the-record-only material.** K1254 refuses this for load-bearing findings. K1263 (a) says such material "never appears in the published case". A supporting finding's signed bytes would carry the leg, and DEC-112 (4) would otherwise let its material travel as fingerprint and origin, so the material would appear.
   - **Recommendation:** refuse it too (R47), with the same remedies. The alternative, publishing with that leg's material withheld and counted, leaves a finding a reader cannot recreate.
2. **What "off-the-record" covers.**
   - **Recommendation:** a source whose name the case may not publish (R46: no publishable `name`), including one the group knows but who has not consented. Every reader of the case meets that source as anonymous, which is Bob's concern (K1254).
   - **Narrower alternative:** only sources the group itself cannot identify (`sources` rungs `unknown`, `same_knocker`).
3. **Who may accept, withdraw, flag and clear on the group's behalf (DEC-96 names no role).**
   - **Recommendation:** any active member. Each act is attributed and reasoned, and is corrected forward by any other member's act.
   - **Alternative:** the group's administrators only, for accept and withdraw.

## T28 job roster by layer (for N519 and N520's DEC-112 share; S4 and N521 apart)

| layer | job | what |
|---|---|---|
| L2 | membership | R83's `MODULE_ORDER` re-pinned to the new order (case-checker, case-import) |
| L2 | promotion | stamp C-120.8, C-120.9, C-122.2 and case-import's new family; `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned (can share S4's job) |
| L6 | strength | R31, R32 |
| L8 | case-grammar | R1 (`/6`), R11–R15 |
| L8 | publication | R57, R58, R33 |
| L8 | public-read | R3, R5, R6, R22–R24 |
| L8 | case-checker (new) | R1–R17 |
| L8 | case-import (new) | R1–R15 |
| L8 | case-authoring | R43–R49, R14, R29, R34, R37 |
| L11 | op-declarations | specs for `caseimport`, `importedcases`, `importedcase`, `caseimportdocument`, `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear` |
| L11 | affordances | the eight ops graded (the four DEC-96 acts `reasoned`) |
| L11 | control-plane | routes for the eight ops; `case-checker`'s two public reads ride `public-read` R18 (no new route) |
| L11 | plane | composition: `case-checker`'s registration, `case-import`'s factory |

The L8 order is case-grammar, then publication, then public-read, then case-checker, then case-import, then case-authoring. `ratification` and `review` have no job. There are 13 jobs: 2 in L2, 1 in L6, 6 in L8 and 4 in L11. The new ops' L11 arms are red until L11 (as in T22). `legacy-ui`'s pages (the public page's line, the import screens) are the UX stream's (K633).

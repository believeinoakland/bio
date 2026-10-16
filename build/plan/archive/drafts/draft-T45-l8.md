# Draft: T45 requirement text for layer 8 (publication, docket, case-authoring; with case-grammar's N888)

Written by a fold worker for BOB (P5). Nothing here is adopted. BOB words, numbers and places it. Nothing was committed.

Sources, each read whole:
- `REQUIREMENTS-HANDOFF.md`, `canon-draft/BIO_Action_v0_2.md`, `DESIGN.md` (all of it), `DECISIONS.md`, the lane's `HANDOFF.md` (H8, H11, H15, H17), `research/S1-synthesis.md` §B13 and §D (on `origin/design/actions`).
- `build/plan/next.md`.
- `build/requirements/` README, `publication`, `docket`, `case-authoring`, `case-grammar`, `case-carriage`, `case-account`. The used modules' named services as cited: `events` R28–R30, `actions` R48, R66, R69, `conformance` R2, `case-checker` R24, `case-disclosures` R30, `membership` R43, R44, R120, `queue-producers` R23, `publish-schedule` R2.
- Code: `bio-plane/src/case-grammar/blocks.mjs` (all of it), `formats.mjs`:56, `case-carriage/index.mjs`:420–450, `docket/index.mjs` (the kinds, the summary and the pressure mark).

Next free ids, counting retired ids: publication **R78** (none used), docket **R27**, case-authoring **R70**, case-grammar **R27**, case-account **R13**. One new module is proposed, `case-check`, from **R1** (doubt 1).

Citations: "Actions D<n>" is the lane's register; "v0.2 rule <n>" is `BIO_Action_v0_2.md` §4.

---

## 0. Each hand-off line for L8, and where it went

| hand-off line (REQUIREMENTS-HANDOFF, "publication, docket, case-authoring") | placed |
|---|---|
| **Checked and held**: passes every check, held unsigned with no limit, any change to the evidence voids it until re-run, shown as a state (D23) | new module `case-check` R1–R5 (§4); its state's words owed to UX (§6). Fallback: case-authoring R72–R76, same text (doubt 1). |
| **Signing view**: one fact line per open request for comment, once, no reason, no gate, through a registration seam (rule 8; D13; H17) | case-authoring **R70** new (the registration, which `actions` fills) and **R34** amended (the line in the sign step). |
| **Docket**: dated outcome entries (cure, harm addressed) and relevant replies by a member's act through the docket's op (rules 16, 17; D5, D20) | docket **R1** and **R6** amended (the `outcome` field). Replies need no change: R1's `response`, plus R10's standing for an office that is not a named subject (doubts 4, 5). |
| **Docket**: a `legal` pressure mark readable by `actions` and `queue-producers` (rule 12; D10; S1 §D 10) | docket **R27** new; the Suggestion "Not drafted" amended. The hold itself is `actions`' and `queue-producers'` (§5). |
| **Published record of actions**: outward acts only, never deliberation, confidential acts or counsel matters; escalations with their state, "stopped pursuing" included, with the date (rules 15, 17; D4, D6a, D22) | case-authoring **R57** amended (it asks with `audience: "public"` and writes only items marked public); docket **R26** amended (its items marked public). The exclusion itself is the producers' (`actions` R66, `escalation`'s source) and `events`' (§5). |
| **Advocacy evidence check**: the case-account check over a member's own text in her hidden project; supported / not supported / contradicted per claim and position; nothing stored outside her project; no mark (rule 9; D11a) | **case-account R13** new (the module that holds the case-account check; doubt 9). It is not one of the three target modules, so it is listed under §5 too. |
| **Success record** into the next edition as an outcome, by a member's act (layer 9 calling layer 8) (§3; D6c) | case-authoring **R71** new (`carryOutcome`) and **R65** amended; case-grammar **R29** new (the `outcomes:` block) and **R14** amended. |
| N888 (case-grammar's `caseDocumentBlocks`, `sourceRowsStanding`) | case-grammar **R27**, **R28** new (§3). |

---

## 1. publication (L8, index 101)

**Next free id: R78. No requirement changes.** Why, line by line:
- Checked and held is a preparation's state. `publication` stores the preparation (R21) and commits it (R22). Neither changes: a new preparation replacing a checked one is what voids the check, read by `case-check` from `case_documents` under R40 and R56 as written.
- The published record of actions is the `timeline:` block, frozen at signing (R63) as `case-authoring` R57 writes it. R63 is unchanged.
- The signing view is `case-authoring` R34's ceremony read, not this module's.
- **R40's reader list** gains `case-check` (R2, R3) for `cases`, `published_cases`, `published_case_members` and `case_documents`. This is wording only.
- N892 (d) names `publication`: "the group's public identity and declared stake on … published". It stays with a hard reason (§7, doubt 13).

**Uses:** none new. **Size:** 3,553 lines (`publication/` without `worker.mjs`, which is `public-read`'s, plus `deliverer.mjs`). Unchanged by this fold, and under the threshold.

---

## 2. docket (L8, index 103)

**Next free id: R27.**

- **R1** amended, append: (T45; N880, N855; Actions D5, D20; v0.2 rules 16, 17)
  - A record entry of kind `outcome` also states `outcome: {kind, on}`:
    - `kind` is `cure` (a later act of the office that the member links as the cure) or `harm_addressed` (a member's reasoned statement that a harm was addressed);
    - `on` is the date the outcome occurred, a calendar date no later than the filing's day.
  - It also states `summary`: the member's words, one paragraph of 1 to 600 characters, as R4 bounds a `reactions` summary.
  - Refusals, after R1's form checks, each writing nothing:
    - `outcome` absent, its `kind` not one of the two, or `on` not such a date: `DOCKET_OUTCOME_UNREADABLE`, a new row of this module's family (C-129), numbered at its stamp;
    - a missing or malformed `summary`: `DOCKET_NO_SUMMARY`, as R4.
  - An entry of any other kind stating `outcome` is refused `DOCKET_OUTCOME_UNREADABLE`.
  - It is filed by a member's act. A later module's op (`escalation`, `consequences`) calls `docketFile` with the member's stamp, as the member's act. This module reads nothing of theirs.
  - An `outcome` entry is still never core (R9). It is placed on `listed` only by the manager's signed act (R4, R5; doubt 4).

  *(not yet met: T45)*
- **R6** amended, append: (T45; Actions D5; v0.2 rule 17) A public entry of kind `outcome` carries `outcome` (`{kind, on}`, as filed) and `summary`. These are additive fields of `civicsmith-docket-entry/1`: an earlier `outcome` entry without them still verifies and reads `outcome: null` (R24's form is otherwise unchanged). *(not yet met: T45)*
- **R26** amended, append: (T45; Actions D4, D22; v0.2 rule 15) Each item the source answers carries `public: true`, because every entry it answers is a public entry. This is the mark `case-authoring` R57 requires before writing an item into a published timeline. Under `audience: "public"` (`events`' new arm) it answers the same items. *(not yet met: T45)*
- **R27** new: (T45; N858; Actions D10; v0.2 rule 12; S1 §D 10) The pressure marks, for the modules that act on them.
  - `docketPressureMarks({kind?, after, limit})` answers, read as the plane (no viewer), each R2 mark in the order made after `after`, as `{mark, entry, case, project, kind, note, at}`. With `kind`, it answers only that kind.
    - `limit` defaults to 1,000 and is clamped to 1–1,000. `cursor` is the last mark answered when more follow, else null.
    - A `kind` outside R2's four is refused `DOCKET_PRESSURE_REFUSED`.
  - `docketPressureOf({entry, viewer})` answers that entry's mark as `{entry, case, project, kind, note, at}`, or `{entry, pressure: null}` when it has none. An entry that is absent, or whose project `viewer` does not see in full, is `NO_SUCH_DOCKET_ENTRY`, one answer.
  - Neither names a member. Each writes nothing and never throws: an unreadable table answers `{ok: false, reason: "DOCKET_UNREADABLE"}`, never a short list.
  - This module places no hold and raises no to-do (R20; layering). `actions` (a member placing a hold from a `legal` mark) and `queue-producers` (the hold to-do) read these.

  *(not yet met: T45)*
- **Suggestions**, "Not drafted": strike "a `legal` pressure mark asking for a litigation hold;" and add "(T45) A `legal` mark's hold is `queue-producers`' to-do and `actions`' act, both reading R27."

**Negative controls.**
- R1: an `outcome` without `outcome`, with an unknown kind, or with `on` after today, is refused. A `response` stating `outcome` is refused. A well-formed outcome files.
- R6: a pre-T45 `outcome` entry verifies and reads `outcome: null`.
- R26: every item carries `public: true`, and a record entry is never an item.
- R27: an unmarked entry answers `pressure: null`. An unseen entry is answered as an absent one, byte-identical. `kind: "legal"` lists only legal marks. Paging is tested across a `cursor`.

**Uses:** none new. **Size:** 1,486 lines (`docket/`). About +120, well under.

---

## 3. case-grammar (L8, index 97): N888, and the `outcomes:` block

**Next free id: R27.**

- **R27** new: (T45; N888; CASE-CARRIAGE #9 J1; K2767; stated as built, P7) `caseDocumentBlocks(text)` answers `{captures, sources, detail}` for a case document's text.
  - It parses the text's front matter (`record-grammar`'s `parseFrontmatter`).
  - **Before `/5`.** For a format R1's `caseDocumentRequiresTensionSection` does not hold for (any format before `/5`), it answers `captures: null, sources: null` and `detail` = `BLOCKS_PREDATE_SENTENCE`.
  - **`captures`** is null when the `captures:` block is not a list. Otherwise it holds one entry per object row:
    - `{capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, accounts}`;
    - a value written `null`, or absent, reads null;
    - `co_attested`, `late` and `self_attested_only` read `true` or `false` from a boolean or its string, else null;
    - `accounts` is every `capture_accounts:` row naming that capture, in order, as `{by, at, text, signature}`, its text and signature decoded from base64 (null where undecodable);
    - a row stating `acknowledgement_reason` or `acknowledged_by` also carries `acknowledgement: {reason, acknowledged_by, at, sentence}`.
  - **`sources`** is null when the `sources:` block is not a list, else one `{capture, stated, basis}` per object row.
  - **`detail`** is null when both are lists, else `BLOCK_UNREADABLE_SENTENCE`. A text that cannot be parsed answers both null with that sentence.
  - The two sentences are exported, verbatim:
    - `BLOCKS_PREDATE_SENTENCE`: "this case document's format predates the statement of each capture's grade, co-attestation and source, so it states none; that is not a statement that there were none";
    - `BLOCK_UNREADABLE_SENTENCE`: "this case document declares a format that states each capture's grade, co-attestation and source, but carries no readable block for it, so what it stated is undetermined".
  - It is the one reading of R1's `captures:`, `capture_accounts:` and `sources:` blocks (`case-carriage` R5, `publication`, `public-read`, the complete edition R14). Pure; never throws.

  *(met as built; the tests are owed: T45)*
- **R28** new: (T45; N888; K2767; stated as built, P7) `sourceRowsStanding(rows, publishable)` answers the `sources:` rows (R27's) that no longer hold, as `[{capture, stated, basis}]` in input order, and `[]` when `rows` is not a list.
  - `publishable(capture)` answers, for one capture, `{entries, received}`: the entries `sources.publishableAt` answers now over the sources behind it, and the receipt's time; or null when no source stands behind it.
  - It is called at most once per distinct capture. A row whose `capture` is not a string is never asked and does not hold. A `publishable` that throws counts as null.
  - **When a row holds.** `publishable` answered non-null, the row's `stated` is a string, and:
    - with `basis` null, `stated` (folded by `fmSafe`) equals `unnamedSourceStatement({capture, received})`;
    - otherwise, `basis` is one of `SOURCE_BASES` (`consent`, `public_elsewhere`) and some answered entry has that `basis` and spells `sourceStatement(entry)` equal to `stated`.
  - Every other row is answered, so nothing is stated that `publishableAt` did not answer at the commit (`publication` R51, R52).
  - Pure. **Its one edge:** an answer whose `entries` is truthy and not a list throws today. The requirement reads: such an answer holds no row (fail closed), and the function never throws (doubt 12).

  *(not yet met: T45, for the edge only)*
- **R29** new: (T45; N855; Actions D6c, D5; v0.2 §3 Success record, rule 17) The case document's `outcomes:` block: one flat row per outcome carried into this edition (`case-authoring` R71), `{outcome, kind, text, cites, on, carried_by, carried_at}`.
  - `kind` is `success`, `cure` or `harm_addressed`.
  - `cites` is the cites' canonical JSON in one quoted value, as R17 writes lists.
  - `outcomesLines(rows)` writes the block, the one spelling. `outcomesOf(fm)` reads it back in order, answering `[]` for a document without it.
  - The body prints them under one heading, its words the UX stream's (key `case.outcomes.head`; until given, "Outcomes since the last edition"), each with its kind, date, text and cites.
  - It is an optional block of the current format with no new version, as R22's `subject_entity` is (doubt 7).
  - Pure; never throws.

  *(not yet met: T45)*
- **R14** amended, append: (T45; Actions D6c) The complete edition prints R29's outcomes after the claims (item 1) and before the findings, each with its kind, date, text and cites. An edition without the block renders byte for byte as before. *(not yet met: T45)*

**Negative controls.**
- R27: a `/4` document answers both null with the predate sentence. A `/7` document with no `sources:` list answers `sources: null` and the unreadable sentence. An undecodable account reads null text. Round trip with R1's line builders.
- R28: a stated row whose `publishableAt` entry was withdrawn is answered. A withheld row with a different `received` is answered. `publishable` throwing makes that capture's rows fail. `entries: "x"` answers the row and does not throw.
- R29: a document without the block answers `[]`. A round trip keeps the order.

**Owed with N888:**
- `case-carriage`'s Uses re-point "`caseDocumentBlocks` and `sourceRowsStanding` (R1)" to "(R27, R28)".
- `publication`'s Uses "its R1–R5" gains R27.
- Wording only.

**Uses:** none new. **Size:** 2,657 lines (`case-grammar/`; its file says "about 425", which is stale and BOB corrects it). About +80. Pure, well under.

---

## 4. case-authoring (L8, index 113), and the proposed `case-check` (L8, after `review`)

### 4a. case-authoring. Next free id: R70.

- **R70** new: (T45; N880; Actions D13; v0.2 rule 8; H17) The open requests at signing: a registration seam from `actions` (layer 9) into the signing view, which this module provides and a later module fills.
  - `registerOpenRequests({openRequestsOn})` takes, once at start, the one source of a case's open requests for comment. `actions` fills it at its start. A second registration is refused `PROVIDER_DECLARED`, and one without the door `PROVIDER_MALFORMED`, each registering nothing (`publication` R77's pattern).
  - `openRequestsOn({case, members, viewer})` is called synchronously:
    - `case` is the case R7 resolves;
    - `members` is `[{bundle_id, version_sha}]` at the bytes R13 pins;
    - `viewer` is the act's own.
  - It answers `[{whom, asked_at, window_closes, answers}]`:
    - `whom`: the office by role and body, as the action names it;
    - `asked_at`: the date it was sent;
    - `window_closes`: the date the window closes, or null when the action states none;
    - `answers`: `{answered, claims}`, the count of the request's claims the reply received answers, of the claims it laid out (rule 16's claim-by-claim), or null when no reply is recorded.
  - Which requests are open on the case is the source's to answer.
  - With none registered the list is `[]`. A source that throws, or answers anything but a list of such rows, is answered `undetermined`.
  - Nothing here refuses, writes, or enters the document.

  *(not yet met: T45)*
- **R34** amended, append: (T45; N880; Actions D13; v0.2 rule 8) `steps` gains `open_requests`, in the sign step and nowhere else in the answer.
  - It holds one fact line per row R70's source answers, in its order, each line naming the row's four facts.
  - The words are the UX stream's, keyed `signing.openrequest.line` and `signing.openrequest.noreply`. Until they are given, one plain sentence per row.
  - The step reads `undetermined` with one sentence (key `signing.openrequest.unread`) when R70 answers so.
  - A row is never a blocker and never `first`. It never changes `ready`, and no refusal of `op=publish`, of this pre-flight or of `ratification`'s ceremony is answered for it. No act asks a reason for signing while a window is open (DEC-13: a declaration).

  *(not yet met: T45)*
- **R57** amended, append: (T45; N855 (6a); Actions D4, D6a, D22; v0.2 rules 15, 17) The published record of actions.
  - `publishCase` asks `events.timeline` with `audience: "public"`, `events`' new arm passed to every registered source.
  - The `we_did` lane it writes is the case's published record of actions. Excluding deliberation, confidential acts and counsel matters is the producers' job (`actions` R66, `escalation`'s source), never a filter here.
  - This module writes only items whose source marks them `public: true`. Any other item is left out and counted in the lane's `withheld` count, never written. It adds no item and writes no words a source did not put in its label.
  - An escalation's "stopped pursuing" appears as its source answers it, with its date and without its reason (rule 17).

  *(not yet met: T45)*
- **R71** new: (T45; N855 (6c); Actions D6c, D5; v0.2 §3 Success record, rule 17) Outcomes carried into the next edition, by a member's act. Layer 9 calls layer 8, and this module never reads layer 9.
  - **The service.** `carryOutcome({case, kind, text, cites, on, by})` is a service with no op. A later module (`consequences` for a success record, or a harm addressed; `escalation` or `conformance` for a cure) calls it inside its member's act. It records one pending outcome for the case's next edition and answers `{ok: true, outcome}`, `outcome` an opaque id.
    - `kind` is `success`, `cure` or `harm_addressed`;
    - `text` is the member's statement, words on one line of at most 2,000 characters with no quote, backslash or line break (R3's `BAD_COMPLETENESS` rule);
    - `cites` is a list in `case-account` R5's cite shape;
    - `on` is the date the outcome occurred.
  - **Refusals**, in order, each writing nothing:
    - `by` absent or a machine identity: `MACHINE_CANNOT_CARRY_OUTCOME`;
    - a case with no ratified edition, or whose project `by` does not see in full: `NO_SUCH_CASE`, one answer;
    - `by` not a joined participant of the case's project: `CARRY_NOT_A_PARTICIPANT`;
    - a malformed field: `BAD_CARRIED_OUTCOME`, naming it.

    These are new rows of this module's table.
  - **Withdrawing.** `withdrawCarriedOutcome({outcome, reason, by})` withdraws a pending outcome, with a reason as R19's `reason` is bounded. Refusals: the machine refusal; `NO_SUCH_CARRIED_OUTCOME` (absent or unseen alike); `CARRIED_OUTCOME_SETTLED` (already carried by a ratified edition, or already withdrawn); `CARRY_NO_REASON`.
  - **Writing them into the document.** `publishCase`, for an edition above the case's highest ratified edition, writes every pending, unwithdrawn outcome of the case into `case-grammar` R29's block, in the order carried.
    - An outcome is pending until a ratified edition's signed document holds it. That is read from `publication`'s `case_documents`, so no write marks it, and a replaced preparation carries it again.
    - R34's "what becomes permanent" step lists them.
    - `carriedOutcomesOf({case, viewer})` lists the case's outcomes, pending, carried (with the edition) and withdrawn (with the reason), fenced as R19's member door.
  - The outcomes and their withdrawals are append-only and declared to purge as working material. A carried one lives on in the signed document (`publication` R24).

  *(not yet met: T45)*
- **R65** amended, append: (T45; Actions D6c) R71's outcomes are carried, not authored fields of `publishCase`. A body field naming them is refused `CASE_FIELD_NOT_ALLOWED` as any other: they enter only through R71. *(not yet met: T45)*
- **Satisfies**, add: `BIO_Action_v0_2.md` §3 (Success record), §4 rules 8, 15, 17 (R34, R57, R70, R71); Actions D4, D5, D6a, D6c, D13, D22.

**Negative controls.**
- R70: a second registration and a malformed one are refused. With no source the list is `[]`. A throwing source reads `undetermined`.
- R34: with an open request the answer is `ready: true` and `first` is unchanged, against the same act without a source (byte-equal but for `open_requests`). The line appears once.
- R57: a stub source answering one item without `public: true` and one with it: only the second is written, and `withheld: 1`. `events.timeline` received `audience: "public"`.
- R71: each refusal. A withdrawn outcome is not written. An outcome carried by a ratified edition is not written into the edition after it. A replaced preparation still carries a pending one.

### 4b. `case-check` (proposed new module, L8, directly after `review`; doubt 1). Next free id: R1.

Purpose: a case run through every publication check and held unsigned by the project's choice, with no limit (D23). This module answers whether the check still stands, so a determination may rest on it (D24; `conformance` R2).

- **R1** (T45; N828; Actions D23, D24; v0.2 §3 Determination, rule 2) `checkAndHold({…publishCase's inputs, viewer, author})` (`op=publishcheck`; mutating).
  - Inside one transaction it runs `case-authoring.publishPreflight` (its R34) over the inputs.
  - When `ready` is false, it answers R34's `{ready: false, first, blockers}`, and nothing is written.
  - When `ready` is true, it runs `case-authoring.publishCase` (its R14 stores the preparation) and records a **check** `{check, case, edition, doc_sha, members: [{bundle_id, version_sha, role}], checked_at, by}`:
    - `doc_sha` is the stored preparation's;
    - `checked_at` is record-core's instant;
    - `by` is the stamp;
    - it answers `{ok: true, held: true, check, caseDocument}`.
  - Every refusal is `publishCase`'s or the pre-flight's, in their order. `MACHINE_CANNOT_PUBLISH` and the owner-only authority come first, unchanged.
  - A repeat while the latest check of that edition reads `held` (R2) answers it with `existed: true`.
  - A check has no expiry. Holding is the act itself: no further act is needed to keep the case unsigned.

  *(not yet met: T45)*
- **R2** (T45; Actions D23, D24) `caseCheckOf({case, edition?, check?, viewer?})` answers one check's state, computed at the read: the named `check`, else the latest check of `edition`, else of the case's latest prepared edition.
  - **The states:**
    - `held`;
    - `void`, with `why`: each of `document_replaced` (the stored preparation of that case edition is no longer at `doc_sha`), `member_moved` (naming each member whose current `bundle_sha` is not the one the check pins), `source_lapsed` (`case-carriage` R5 answers a row), `accepted_work_lapsed` (its R4 answers), `marks_lapsed` (its R13 answers);
    - `published`, with the edition, once that edition is ratified (`publication` R40's `published_cases`);
    - `none`, when there is no check;
    - `undetermined`, when any of those reads fails. This fails closed: it never reads `held`.
  - It answers `checked_at` and `by` with any state but `none`.
  - With `viewer`, it is fenced as `publication` R1 is: no standing in the case's project answers `NO_SUCH_CASE`, the same answer as an absent case. Without `viewer`, it is read as the plane.
  - It writes nothing and never throws. A void check stays void when the cause is undone: re-running R1 makes a new check.

  *(not yet met: T45)*
- **R3** (T45; N828; Actions D24) `heldFindingVersions({finding, version?, project?})` answers `{items: [{case, edition, project, version_sha, role, check, checked_at}]}`: every check reading `held` (R2) whose members include `finding`, in `publication` R37's shape.
  - `version` keeps those pinning that version, `project` those of that project.
  - `NO_ID` for an empty `finding`.
  - Viewer-free; it writes nothing. It is the read `conformance` R2 uses beside `publication` R37.

  *(not yet met: T45)*
- **R4** (invariants) Checks are append-only, and a check row is never rewritten. They are declared to `record-core`'s purge as working material, cleared with the unsigned document they name (`publication` R29, R31). No place is named (`layers.md`). No answer composes a case-level strength.
- **R5** (the words) The states `held`, `void` (with each `why`) and `undetermined` are shown to members as a state, never a fault (D23). The keys are `case.check.held`, `case.check.void.<why>` and `case.check.undetermined`, their words the UX stream's.

**Negative controls.**
- R1: a pre-flight with one blocker writes nothing, and no preparation is stored. A ready one stores the preparation and the check.
- R2: each `why`, with its control (an untouched check reads `held`). A re-authored acknowledgement list reads `document_replaced` (doubt 3). A failed read reads `undetermined`. After ratification it reads `published`. An outsider gets the same answer as an absent case.
- R3: a void check is not listed.

**Uses (`case-check`):** `case-authoring` (R14, R34), `publication` (R1's standing, `hasCaseStanding`; R40, R56 read contracts), `case-carriage` (R4, R5, R13), `record-core` (`transact`, `stampInstant`, `declarePurge`, the `bundles` read contract), `membership`. Each is earlier.

**Size.**
- case-authoring: 3,696 lines (`case-authoring/`). R70, R71 and R57 add about 250, to about 3,950: at the threshold (K617).
- Folding R1–R5 into it as well (about 250 more) would take it to about 4,200, over the threshold. That is why `case-check` is proposed (doubt 1).
- `case-check` would be about 300.

---

## 5. Uses changes and owed to other modules

**Uses edges** (each points to an earlier module; none points later):
- `case-check` → `case-authoring`, `publication`, `case-carriage`, `record-core`, `membership`, all earlier. `case-check` sits last in L8, after `review`.
- Owed, written by those modules' workers: `actions` → `case-authoring` (R70's registration) and `actions` → `docket` (R27); `queue-producers` → `docket` (R27); `consequences` → `case-authoring` (R71); `escalation` → `docket`, `case-authoring` (R1 outcome entries, R71); `conformance` → `case-check` (R3). Each points to an earlier module.
- The three edges the hand-off names (`monitoring` → `action-plans`, `following` → `action-plans`, `action-clocks` → `steps`) touch no L8 module. Each points earlier: 124 → 123, 125 → 123, 119 → 76.

**Owed to other modules:**
- `events` (L5): R28 and R30 take `audience` (`"public"` or absent) and pass it to each source unchanged.
- `actions`: R66 under `audience: "public"` answers only outward acts that are not confidential (rule 15) and not of a counsel-matter project, each marked `public: true`. A `received` entry is not the group's outward act (S1 §D 9). It fills `case-authoring` R70, its "open" definition being its own. It places a hold from a docket `legal` mark read through `docket` R27.
- `escalation`: its event source answers "stopped pursuing" with its date and no reason, marked `public: true`. A cure links through `docket` R1 and `case-authoring` R71.
- `consequences`: the success record's "carry into the next edition" act calls `case-authoring` R71.
- `conformance`: R2 accepts `case-check` R3's versions, pins the `check`, reads `case-check` R2 for voiding and marks dependent actions, and re-pins on `published`.
- `queue-producers`: the hold to-do from `docket` R27. R23's unsigned-edition items do not nag a checked-and-held edition (D23: a state, never a fault).
- `case-account`: **R13** new (the advocacy check, below). If doubt 8 is taken, R6 also judges R71's outcome text, and `case-grammar` R23's `kind` gains `outcome`.
- `case-carriage`, `publication`: the Uses re-points with N888 (§3).
- `affordances`, `op-declarations` (L11): `publishcheck` (mutating, graded as `publish`), `casecheck` (read), `advocacycheck` (mutating, writes only in her hidden project).

**case-account R13 (draft for that module's file):** (T45; N861; Actions D11a; v0.2 rule 9) `advocacyCheck({project, sentences: [{text, cites}], author, viewer})` (`op=advocacycheck`).
- It judges each sentence of a member's own text, claims and position sentences alike, through `case-checker.checkAccount` (its R24), with `cited` built as R6 builds it (`citedFor`, as `author` reads it) and `conclusions` the cited findings' claims and legs. No bias marks or lens are taken.
- It answers per sentence `supported` (with the findings cited), `not_supported` (`ACCOUNT_SENTENCE_UNSUPPORTED` or `ACCOUNT_FACT_NOT_IN_CITED`) or `contradicted` (`ACCOUNT_CONTRADICTED_BY_RECORD`).
- It refuses, writing nothing:
  - a machine `author`;
  - `ADVOCACY_NOT_OWN_PROJECT`, when `project` is not hidden (`membership` R120's `project_sight`) or has any participant but `author`;
  - `BAD_ACCOUNT`, R5's sentence-shape refusal.
- It keeps the text and its result in a table of this module keyed by `project`, readable only with full sight of that project (`membership` R44), and declared to purge with it. Nothing else of it is written.
- No answer carries a signature, digest, stamp or anything usable as a mark outside. Nothing reads it to prepare, send, record or publish anything.

*(not yet met: T45)*

---

## 6. Owed to the UX design stream (keys only; the words are theirs)

- `signing.openrequest.line`, `signing.openrequest.noreply`, `signing.openrequest.unread` (case-authoring R34).
- `case.check.held`, `case.check.void.document_replaced`, `.member_moved`, `.source_lapsed`, `.accepted_work_lapsed`, `.marks_lapsed`, `case.check.undetermined` (case-check R5).
- `case.outcomes.head` and the kind labels `case.outcome.success`, `.cure`, `.harm_addressed` (case-grammar R29, R14).
- The docket outcome kinds' shelf labels (`docket.outcome.cure`, `docket.outcome.harm_addressed`), joining R6's existing labels, which are already theirs.
- `advocacy.supported`, `advocacy.notsupported`, `advocacy.contradicted` (case-account R13).
- New refusal rows: `DOCKET_OUTCOME_UNREADABLE`, R71's six codes, `ADVOCACY_NOT_OWN_PROJECT`. Translations are BOB's drafts, re-wordable by the stream.

---

## 7. Doubts

1. **Where checked-and-held lives** (BOB's: module boundary).
   - Placed in case-authoring, it takes that module to about 4,200 lines (K617).
   - **Recommendation:** a new L8 module `case-check`, after `review`. It reaches the pre-flight and preparation as `case-authoring`'s public services.
   - The fallback is the same text as case-authoring R72–R76, with a split planned.
2. **"Every publication check"** (BOB's). **Reading:** R34's pre-flight answers `ready`: everything `op=publish` and signing would refuse, the group's required approvals (R68) included. D23 lists the objective at the bar, the account check and "the five screens", and all of them are inside `ready`.
3. **What voids** (BOB's). Canon says "any change to the evidence the check covered".
   - **Reading:** any move of the stored preparation's `doc_sha`, which fails closed, plus moved member pins and the commit's three lapse reads.
   - An acknowledgement re-authoring the list (R20) then voids too, and a re-run is one act.
   - The narrower alternative is a digest without the acknowledgement and approval runs, like `approvalSubjectSha`. That is more grammar for little gain now.
4. **"A member's act puts … on the published case's docket at once"** (rules 16, 17) (**possibly Bob's**: it touches DEC-116).
   - Options:
     - (a) any member files the entry at once to the record shelf, and the manager's signed act places it in public, as DEC-116 has it;
     - (b) the member's act places it in public without the manager.
   - **Recommendation: (a).** "At once" contrasts with "the determination goes with the next edition", not with the manager's signature. (b) would revise DEC-116's "only the manager places in public".
   - Tell Bob the reading.
5. **A reply from an office that is not a named subject** (BOB's). **Reading:** the manager grants it standing (R10), so its reply files as a `response`. No new `from` kind is needed.
6. **One capture per outcome entry** (BOB's). R1 keeps one capture. **Reading:** a harm addressed in several parts is filed as one entry citing its principal evidence. The full per-part evidence lives in `consequences` and enters the next edition through R71.
7. **The `outcomes:` block in `/7` with no new version** (BOB's). This follows R22's and R12's precedent for optional fields: a document without it reads `[]`.
8. **Whether R71's outcome text is account-checked** (BOB's).
   - **Recommendation: yes.** A carried outcome is the one authored text added to a case beyond the four statements, and "a story … has no place" (R65, D63).
   - So `case-account` R6 should judge it as a statement (`kind: outcome`), which would be owed to case-account and case-grammar R23.
   - If BOB defers it, the rows print as carried with their cites.
9. **The advocacy check's home** (BOB's). The hand-off groups it under L8. **Recommendation:** `case-account`, which holds the check (R6, `citedFor`). It is not in case-authoring, which prepares cases.
   - **"Her own hidden project"** read as: a hidden project with her as its only participant.
   - Storing the text in this module's table, scoped to that project, meets "kept in her own hidden project".
10. **Confidential acts in the published lane** (BOB's). The exclusion is enforced at the producer (DESIGN §11). R57's `public: true` mark is a fail-closed guard at layer 8: an unmarked item never publishes. Every registered source (`actions`, `escalation`, `docket`) must mark its items.
11. **The signing line's "once"** (BOB's). **Reading:** one listing in the sign step, never repeated across steps or re-asked. It is not written into the document.
12. **R28's edge** (BOB's). Stated as built, but fail closed for a non-list `entries`, which is a one-line change marked not yet met. The alternative is stating the throw as the precondition's broken behaviour (README 3).
13. **N892 (d) for publication** (**possibly Bob's** for content, BOB's for placement).
    - A published case carrying the group's declared stake needs a home for "declared stake". No requirement holds one: the hand-off puts the stake on the stamp fields, under `actions` and `filings` R22.
    - **Recommendation:** leave it in next.md with that hard reason, and word it for the case document once the stake's holder is worded.
14. **S1 §D 11, verified.** A hold does stop a scheduled publication: `publish-schedule` R2 re-checks "a hold" through `ratification` R41 and R45, which `actions` R69 fills. U15 is right and U10's layering concern is met. Ladders and working-page corrections, if any, are BOB's. §D 10 is resolved by docket R27 and `queue-producers`.

---

## 8. N-entries

- **N888**: fully applied (case-grammar R27, R28, with the Uses re-points). Move to applied.
- **N880**: the signing view is applied (case-authoring R70, R34; docket R1 for later responses, unchanged). It remains with `actions` and `filing-templates`: the quoting rule in every request-for-comment text, and the shown-once minutes comparison (U4). Not L8.
- **N828**: the checked-and-held edition (D23) is applied (`case-check` R1–R5). It remains with `conformance` (R2 accepting it, voiding, re-pinning) and `actions` (the disclosure line). Not L8.
- **N855**: 6c's carry into the next edition is applied (case-authoring R71, case-grammar R29, R14). 6a's published lane is applied at L8 (R57, docket R26). It remains with `escalation` (6a's state), `action-plans` (6b), `consequences` (6c's record), `monitoring` and `following` (6d).
- **N858**: D10's docket mark read is applied (docket R27). The rest is L9 and the profile.
- **N861**: the evidence check is applied, if case-account R13 is adopted. The rest is L9 and the assistant.
- **N892**: (d) for publication remains (doubt 13: no home for the declared stake).
- N879, N881–N885, N887, N890: no L8 part.

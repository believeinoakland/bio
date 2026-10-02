# Draft: the seam for DEC-96 item 4 and item 1's withdrawal notice (N522)

**Status** · DRAFT by a worker for BOB #103, 2026-10-02, on `tranche/T27` @ `origin/tranche/T27`, for BOB's review and folding at T28's opening (P18), beside `plan/draft-T28-dec112.md` (K1268), whose ids it follows. Nothing is folded. While T27 runs, nothing under `build/requirements/`, `build/modules.json` or `build/layers.md` is edited.

Conventions are those of `draft-T28-dec112.md`:
- A new requirement takes its module's next free id after that draft's, and no retired id is reused.
- Every new or changed line ends `*(not yet met: T28)*` and cites DEC-96 (or the K or DEC it rests on).
- Member-facing words belong to the UX design stream. Translations below are BOB's drafts, which the stream may re-word. Where it has given no words, the text says "one plain sentence saying so".

## The problem

- **What DEC-96 asks.**
  - Item 1: withdrawing an acceptance sends re-evaluation notices to the work that rests on it.
  - Item 4: a published case that relies on another group's work states the acceptance (who accepted which edition, and why), and discloses any open flag on that work: disclosed, never blocked, as an open contradiction is.
  - DEC-112 (6) gives the reliance: "an accepted finding may support the group's own work, marked as another group's".
- **The blocker.**
  - The reliance is a leg. Legs are `inquiry`'s (index 44, **L6**; the entry's "L7" is a slip) and its grammar is `inquiry-grammar`'s (43, L6).
  - An imported finding is held by `case-import` (new, L8). By its R2 it is not a record bundle.
  - Under P4 (a module uses only earlier modules), none of `inquiry`, `basis-versions` (46), `strength` (47), `reevaluation` (56, L7) or `publication` (59) may read `case-import`.
- **The size constraint.** `inquiry` measures **3,882 lines** on this branch (P6, mark ~4,000). It cannot take a registration slot and a stateful check without passing the mark.

## Options weighed

**(A) A slot in `inquiry` that `case-import` fills.** This is the K31 pattern, as `reevaluation` R26 and R30 do it.
- For: one slot serves every earlier reader. `strength`, `reevaluation`, `basis-versions` and `publication` already use `inquiry`.
- Against: it puts the slot, the facade and the acceptance check in `inquiry`. That is about 120 lines on 3,882, so it passes the mark (P6) and forces a split first.

**(B) The statement owned by `case-authoring` (L8), reading `case-import` directly; the leg is a plain external reference.**
- For: no new slot for the statement itself.
- Against: it leaves four needs unmet.
  - The leg's write could not check that an acceptance is in force, so any external string could support a finding. DEC-112 (6) allows accepted findings only.
  - `strength` could not grade the leg, because it cannot read the edition's published pair.
  - `reevaluation` could not derive the withdrawal cause, because it cannot read the withdrawal.
  - `publication`'s commit could not re-check the acceptance.
- So (B) still needs a registration somewhere early, and only moves the problem.

**(C) Recommended: a small seam module in L6, `accepted-work`, directly after `inquiry-grammar`. It is (A)'s slot without (A)'s cost, plus (B)'s ownership of the statement.**

`accepted-work` (new index 44, before `inquiry`) does four things:
- It declares the one registration `case-import` fills (K31's pattern; `membership` R81).
- It gives the read facade that `strength`, `reevaluation`, `basis-versions` and `publication` read.
- It registers, with `promotion` (its R39), the check that a leg on an imported finding names an edition whose acceptance is in force.
- It holds the rows that check mints.

The rest is placed as follows:
- **The leg's spelling and form** are pure grammar, so they live in `inquiry-grammar`. `inquiry` gains wording only (R4, R12). No code arm is added there, and it stays under the mark.
- **The statement and the flag disclosure** are `case-authoring`'s (L8). It comes after `case-import` and reads it directly (B's half).
- **The re-check at commit** is `publication`'s, read through `accepted-work`.
- **The withdrawal cause** is `reevaluation`'s, derived on read through `accepted-work` as R30 derives the docket's. `case-import` (later in the order) calls `reevaluation` directly to tell the listeners.

Why (C):
- It is the only option that meets item 1 and item 4 within P4 without a split.
- It reuses two patterns already built: K31's registration and R30's derived cause with a direct "acted" call.
- It keeps every earlier module's change to a read of one facade.

---

## 1. accepted-work (new; L6, index 44, directly after `inquiry-grammar`)

Paste as `build/requirements/accepted-work.md`:

```markdown
# accepted-work — requirements

**Status** · Requirements for T28, folded by a worker for BOB #103 at T28's opening, entry N522 (DEC-96 items 1 and 4; `plan/draft-T28-n522.md`). A new product module with no `from` (its place is BOB's under P17). It sits in layer 6 directly after `inquiry-grammar`, whose imported-finding reference (its R11) it reads, and before `inquiry`. It is the seam through which modules earlier than `case-import` (L8) read another group's accepted work (P4). Its own T28 job writes its code at `bio-plane/src/accepted-work/` and its tests at `bio-plane/test/m/accepted-work/`, then adds both to its `modules.json` entry (K1043's form). Every requirement is not yet met (T28).

**Size (P6).** About 250–400 lines.

## Public

### Purpose

A group's own finding may rest on a finding of another group's case that the group has accepted (DEC-112 (6); DEC-96 item 1). That work is held by `case-import`, late in the order. This module is the one place earlier modules read it. It also refuses a leg on such a finding unless an acceptance of the named edition is in force. It holds nothing itself.

### Provides

Terms.
- An **imported finding reference** (a **ref**) is `inquiry-grammar` R11's spelling.
- An **acceptance in force** is `case-import` R6's, not withdrawn by its R7.

**registerAcceptedWork(module, {finding, openFlags, withdrawals})** (K31's pattern)

- **R1** One registration, filled by `case-import` (its R16) at start. A registration missing any of the three functions is refused `LISTENER_MALFORMED`, and a second registration is refused `LISTENER_DECLARED`. Both come through `membership`'s `listenerRefusal` (its R81). The three functions:
  - `finding({ref, edition, viewer})` answers `{ref, import, group, case, edition, finding, manifest_sha, result, pair, acceptance}`, or null when the finding is not held at that edition or the viewer may not see the import. `pair` is the finding's per-axis pair as the edition publishes it. `acceptance` is `{by, at, reason, checked, gaps}` while one is in force, else null.
  - `openFlags({ref, edition, viewer})` answers `{flags: [{flag, finding, issue, at}], complete}`. It covers the open flags on that edition, both the edition's own and the named finding's.
  - `withdrawals({after, limit})` answers `{withdrawals: [{withdrawal, import, edition, refs, at}], cursor}` in withdrawal order.

  (DEC-96 items 1, 2, 4) *(not yet met: T28)*
- **R2** `acceptedFinding`, `openFlagsOn` and `acceptanceWithdrawals` take the same arguments and answer the registered functions' answers.
  - With none registered, each answers `{absent: true}`, stated as `accepted_work_absent`.
  - When the registered function throws, each answers `{unreadable: true}`.

  None of them writes or throws. They are the one way `strength`, `reevaluation`, `basis-versions` and `publication` read accepted work. (P4; DEC-96) *(not yet met: T28)*

**acceptedLegRefusals({legs, viewer})**

- **R3** For each leg whose target is a ref:
  - when R2 answers absent or unreadable, the leg is refused `ACCEPTED_WORK_UNREADABLE` (C-21.5);
  - when `finding` answers null, or answers `acceptance: null` at the leg's `target_edition`, the leg is refused `IMPORTED_NOT_ACCEPTED` (C-21.4).

  Each refusal is a finding naming the leg's `ord` and ref. Other legs are not asked. It writes nothing and never throws. (DEC-112 (6): "an accepted finding may support the group's own work"; DEC-96 item 1: acceptance names one edition) *(not yet met: T28)*
- **R4** At start, the module registers with `promotion` (`registerStep`, its R39) a check of every promotion of an inquiry that is not a replay. It runs R3 over each leg whose target is a ref and that is new against the held version, or whose target or `target_edition` changed. A refusal is `BASIS_REFUSED` with R3's findings, as `inquiry` R11 answers it, and nothing is written. An unchanged leg is not asked again, so a withdrawal never refuses an unrelated revision (DEC-96 item 1: a withdrawal sends notices, it does not move work). *(not yet met: T28)*

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, the finding shape.
- `membership`: `listenerRefusal` (its R81).
- `promotion`: `registerStep` (its R39).
- `inquiry-grammar`: `IMPORTED_FINDING_RE`, `parseImportedFindingRef` (its R11).

### Invariants

- **R5** No table. Nothing here regrades, composes a strength or trust score, or states the source's bar as this group's (DEC-96 item 1, DEC-92, DEC-45).
- **R6** Rows C-21.4 and C-21.5 are held in this module's own `checks.mjs`. `promotion` stamps them, and a change moves `CATALOG_VERSION`. *(not yet met: T28)*
  - C-21.4 `IMPORTED_NOT_ACCEPTED`: "This finding rests on another group's finding that this group has not accepted at that edition. Accept that edition first, or take the leg out. Nothing was written."
  - C-21.5 `ACCEPTED_WORK_UNREADABLE`: "Another group's work this finding rests on could not be read, so whether it is accepted is not known. Try again. Nothing was written."
- **R7** No place is named in this module's behaviour or outward text.

### Satisfies

- DEC-96 items 1 and 4, DEC-112 (6)'s last clause, read through the order (P4). N522.

### Suggestions

- Tests:
  - A leg on an accepted finding is promoted.
  - A leg on an unaccepted finding is refused C-21.4, and so is a leg naming another edition than the one accepted.
  - With nothing registered, the leg is refused C-21.5.
  - After a withdrawal, an unrelated revision of the same inquiry still promotes.
  - A second registration is refused `LISTENER_DECLARED`.
```

---

## 2. inquiry-grammar (index 43, L6; 1,439 lines; next free id R11)

- **R11** **The imported finding reference.**
  - `IMPORTED_FINDING_RE` matches exactly `imported:<import>/<finding>`. `<import>` is `case-import`'s import id (64 lowercase hex). `<finding>` is the finding's id as the source case states it (`BUNDLE_ID_RE`). The two never collide with a local id, which `BUNDLE_ID_RE` alone matches.
  - `importedFindingRef(import, finding)` spells it. `parseImportedFindingRef(s)` answers `{import, finding}`, or null.

  **The leg on it.** A leg whose `target` is such a ref:
  - names a positive integer `target_edition`;
  - carries no `grade`, `grade_axis` or `grade_source` (the edition's grades stand as published: DEC-96 item 1);
  - carries no `content_id`, extent or `extent_capture`;
  - is not listed in `references[]`, so C-6.3 does not ask it, and a `references[]` entry naming a ref is refused.

  Any departure is one `C-21.3` error, `IMPORTED_LEG_MALFORMED`, naming the leg and the field. Whether an acceptance is in force is not asked here (`accepted-work` R3, R4). The arm is pure and never throws. `checkInquiryBasis` runs it in place of R4's target arm for such a leg; every other arm of R4 (lead and theme first, role, grounds) is unchanged. (DEC-112 (6); DEC-96 items 1, 4) *(not yet met: T28)*
- **R7 gains** C-21.3: "A leg on another group's finding names that finding and one edition, and nothing else: its grades are that edition's. Correct the leg. Nothing was written." *(not yet met: T28)*
- **R8 gains** C-21.3.

## 3. inquiry (index 44 → 45, L6; 3,882 lines; wording only, no new arm)

- **R4 gains:** "…or a leg on an imported finding reference (`inquiry-grammar` R11), whose form is judged there and whose acceptance is judged by `accepted-work` R3–R4. Such a leg's target is not in `references[]`." *(not yet met: T28)*
- **R12 gains:** "A leg on an imported finding reference has no content row. Its ref is projected as `target_id` as spelled, so `restingOn`, `restsOnLive` and R40's read contract name it like any target." *(not yet met: T28)*
- **Satisfies gains** DEC-112 (6)'s last clause (R4, R12).
- **No new use and no new code arm.** The job confirms at its START that the projection keeps a non-bundle `target_id` and resolves no content row for it. P6: under 20 lines.

## 4. basis-versions (index 46 → 47, L6; 3,510 lines)

- **R3 gains:** "A version's leg on an imported finding reference passes C-25.14 when `inquiry-grammar` R11 judges its form, and is refused with `accepted-work` R3's finding (C-21.4, C-21.5) when it is new or changed against the version it derives from." (DEC-112 (6); DEC-96 item 1) *(not yet met: T28)*
- **Uses gain** `accepted-work` (`acceptedLegRefusals`). Index 44 is before 47.

## 5. strength (index 47 → 48, L6; next free id R33, after the dec112 draft's R31–R32)

- **R33** A leg on an imported finding reference contributes, on each axis, the grade that the accepted edition publishes for that finding (`accepted-work.acceptedFinding`'s `pair`). It is read as an inquiry leg's target answer (R2), with no recursion past it, and is never stronger than that edition's frozen grade (DEC-96 item 1, the inherited-trust rule).
  - The member is named as another group's, with its group, case and edition (DEC-92). The words are the UX stream's.
  - When the read answers absent, unreadable or null, the leg is `undetermined` on every axis and named with why.
  - An acceptance withdrawn since the leg was written changes nothing here. Nothing regrades (DEC-96 item 1); the notice is `reevaluation` R31's.
  - It holds for `strengthOf`, `versionStrength`, `candidatePair` and R32's `recomputePair`. For `recomputePair`, the case file's `accepted_work:` row (`case-grammar` R16) gives the pair.

  *(not yet met: T28)*
- **Uses gain** `accepted-work`. Index 44 is before 48.

## 6. reevaluation (index 56 → 57, L7; 2,505 lines; next free id R31)

- **R31** **An acceptance withdrawn** (DEC-96 item 1).
  - **The cause.** R2 gains the cause arm `acceptance`, derived on read. A dependent carries it when a live leg (R7) rests on an imported finding reference at an edition that a withdrawal names (`accepted-work.acceptanceWithdrawals`, read through each `cursor` to null).
    - `since` is the withdrawal's instant. `detail` is the source group, case and edition, and the withdrawal.
    - It closes as any cause does (R16). Nothing regrades (R19).
    - With none registered, it is not raised, and the answer says so (`accepted_work_absent`).
  - **The telling.** `acceptanceWithdrawn({withdrawal})` is called by `case-import` after its withdrawal commits (its R7). It tells R8's listeners once, as `kind: "acceptance"`, with the dependents R31's arm answers for that withdrawal at that instant. It writes nothing and never throws. R18 is unchanged: the arm writes no row.
  - **The recovery read.** `changesOf` (R9) answers it too.

  *(not yet met: T28)*
- **R1 gains:** "An imported finding reference is a target. One that `accepted-work.acceptedFinding` answers null for this viewer (at any edition a leg names) is refused `NO_SUCH_BUNDLE`, as an absent target is." *(not yet met: T28)*
- **R8 gains** the kind `acceptance` (R31). *(not yet met: T28)*
- **Uses gain** `accepted-work` (`acceptanceWithdrawals`, `acceptedFinding`). Index 44 is before 57.
- **Satisfies gains** DEC-96 item 1 ("withdrawing an acceptance … sends re-evaluation notices to the work that rests on it"): R31.

## 7. case-import (new, L8; draft-T28-dec112.md §2; next free id R16)

- **R16** At start, the module registers with `accepted-work` (its R1) the following, each read as the plane:
  - `finding` (R4's facts for one finding at one edition, with R9's `acceptanceOf`);
  - `openFlags` (R9's `openFlagsOn`, the edition's own flags and the finding's);
  - `withdrawals` (R7's records, in order, paged).

  A viewer who is not an active member is answered null, as R4 answers. (DEC-96 items 1, 4; P4) *(not yet met: T28)*
- **R6 gains:** "The answer names, for each accepted finding, its imported finding reference (`inquiry-grammar.importedFindingRef`), the spelling a leg names." *(not yet met: T28)*
- **R7 gains:** "After the withdrawal commits, it calls `reevaluation.acceptanceWithdrawn` (its R31). The reply carries that answer as `reevaluation`. A failure there never undoes the withdrawal and is named in the reply (`reevaluation` R8's `listeners_failed`)." (DEC-96 item 1) *(not yet met: T28)*
- **R8 becomes:** "…and never on a public path, except as a published case of this group discloses an open flag on work it relies on (`case-authoring` R52; DEC-96 item 4)." *(not yet met: T28)*
- **R9:** strike "(DEC-96 item 4, a later entry)". `case-authoring` R51–R52 now read it.
- **Uses gain** `inquiry-grammar` (43), `accepted-work` (44) and `reevaluation` (57).
- **Satisfies gains** DEC-96 item 1's withdrawal notice and item 4 (R16, R7).

## 8. case-grammar (index 57 → 58, L8; next free id R16, after the dec112 draft's R11–R15)

- **R16** The `/6` document's `accepted_work:` and `accepted_work_flags:` blocks. They are flat rows, as R1's blocks are (K549).
  - `accepted_work:` has one row per (member, leg) whose chain reaches an imported finding reference: `{member, leg_of, ref, group, case, edition, finding, manifest_sha, pair, result, gaps, accepted_by, accepted_at, reason}`.
  - `accepted_work_flags:` has one row per open flag disclosed: `{ref, edition, flag, issue, flagged_at, words, acknowledged_by, acknowledged_at}`.
  - `acceptedWorkOf(fm)` reads both back. A document without them answers empty lists.

  Neither block is required when no chain reaches a ref. Pure; never throws. (DEC-96 item 4) *(not yet met: T28)*
- **R14 gains:**
  - In item 2, a chain reaching a ref prints, at that leg:
    - the acceptance: who accepted which edition, when and why;
    - the recreation result and gaps;
    - each disclosed flag;
    - the source case file named by group, case, edition and manifest SHA-256, as the place to check that finding.
  - The chain stops there. The words are the UX stream's; until it gives them, one plain sentence for each.

  (DEC-96 item 4) *(not yet met: T28)*
- **Satisfies gains** DEC-96 item 4 (R16).

## 9. case-checker (new, L8; next free id R18)

- **R18** A finding whose chain reaches a ref is recreated up to that leg.
  - R5 recomputes with the row's `pair` (`case-grammar` R16) as that leg's fact.
  - R4 and R8 do not follow past it.
  - The answer lists `rests_on_another_group: [{group, case, edition, finding, manifest_sha}]`, with the sentence that this part is checked against that group's own case file. The words are the UX stream's.
  - It adds no `missing` entry, and it is never `recreated` on that group's behalf.

  (DEC-96 item 4; DEC-112 (6)) *(subject to question 2)* *(not yet met: T28)*

## 10. case-authoring (index 67 → 68, L8; next free id R50, after the dec112 draft's R43–R49)

New, under `#### Another group's work this case rests on (DEC-96 item 4; N522)`:

- **R50** A member's chain (R46's term) stops at a leg on an imported finding reference. R44 and R46–R48 do not follow past it: that material is the source group's, in its own case file. (DEC-112 (6)) *(subject to question 2)* *(not yet met: T28)*
- **R51** **The statement.** For each leg any member's chain reaches on a ref, `publishCase` reads `case-import.acceptanceOf` and `importedCase` at the leg's `target_edition` and writes the `accepted_work:` row (`case-grammar` R16).
  - With no acceptance in force, the act is refused `ACCEPTED_WORK_NOT_IN_FORCE` (C-120.10) before anything is written. The refusal names the member, the leg and the source case and edition.
  - The row states who accepted which edition, when and why (`reason`), the recreation result and the gaps stated *(gaps and result: subject to question 3)*.
  - `checked` stays inside the group.

  (DEC-96 item 4; DEC-112 (6)) *(not yet met: T28)*
- **R52** **The open flags: disclosed, never blocked.** This is R31's pattern (DEC-96 item 4: "as it must disclose an open contradiction").
  - **The input.** `publishCase` takes `flagsDisclosed: [{flag, words?}]`.
  - **The read.** After R51, it reads `case-import.openFlagsOn` for each edition R51 names.
  - **Refusals.**
    - A failed or incomplete read is `FLAGS_UNDETERMINED` (C-120.12).
    - An open flag the list does not name is `FLAG_NOT_DISCLOSED` (C-120.11), naming each one.
    - A listed flag that is not open is `FLAG_DISCLOSURE_NOT_STANDING` (C-120.13).
    - The case is never refused because a flag is open.
  - **The section.** Otherwise each flag is written to `accepted_work_flags:` with the issue, when it was flagged, the owner's words marked as the owner's, `acknowledged_by` (the `author` stamp) and the instant *(the flagging member is not named: subject to question 1)*. Its member's block gains one sentence. The words are the UX stream's; until it gives them, one plain sentence saying so.

  (DEC-96 items 2, 4; DEC-84 (13)) *(not yet met: T28)*
- **R53** The ceremony.
  - R34's `blockers` gain R51 and R52.
  - Its step "what this rests on" names each `accepted_work:` row.
  - Its step three lists the flags R52 requires, read as R52 reads them, beside R32's tensions, with the statement that publishing discloses them and is never blocked by them.

  It writes nothing. (DEC-96 item 4; DEC-85) *(not yet met: T28)*
- **R14 gains** the `accepted_work:` and `accepted_work_flags:` blocks (R51, R52). *(not yet met: T28)*
- **R29 gains** C-120.10–C-120.13. *(not yet met: T28)* BOB's drafts:
  - C-120.10 `ACCEPTED_WORK_NOT_IN_FORCE`: "A finding in this case rests on another group's finding, and this group's acceptance of that edition is not in force. Accept it again, or take the leg out. Nothing was written."
  - C-120.11 `FLAG_NOT_DISCLOSED`: "Another group's work this case rests on carries an open flag, and a case may be published with it only if the flag is disclosed. Each one is named. Disclose it, or clear it first. Nothing was published."
  - C-120.12 `FLAGS_UNDETERMINED`: "The flags on another group's work this case rests on could not be read completely, so what must be disclosed is not known. Try again. Nothing was published."
  - C-120.13 `FLAG_DISCLOSURE_NOT_STANDING`: "One of the flags disclosed is not open on work this case rests on: it may have been cleared since. Read the list again. Nothing was published."
- **Uses gain** `case-import` (`acceptanceOf`, `openFlagsOn`, `importedCase`). Index 67 is before 68.
- **Satisfies gains** DEC-96 item 4 (R50–R53).
- **P6.** About 120 lines on the dec112 draft's ~3,750 gives ~3,870, near the mark. The seam named there (R31–R37, R43–R53: the disclosures) stands. The job measures at its START.

## 11. publication (index 59 → 60, L8; next free id R59, after the dec112 draft's R57–R58)

- **R59** At the commit, `commitCaseEdition` re-reads each `accepted_work:` row through `accepted-work` (`acceptedFinding`, `openFlagsOn`). Either of the following refuses the commit, and nothing is committed:
  - An acceptance no longer in force is `ACCEPTANCE_WITHDRAWN_SINCE` (C-122.3).
  - An open flag on a row's edition that `accepted_work_flags:` does not disclose is `FLAG_OPENED_SINCE` (C-122.4).

  A read that answers absent or unreadable counts as not in force. The remedy is a new preparation. This is R51's pattern. (DEC-96 items 1, 4) *(not yet met: T28)*
  - C-122.3: "This group's acceptance of another group's work this case rests on was withdrawn after the case was prepared. Prepare the case again. Nothing was published."
  - C-122.4: "A flag was raised on another group's work this case rests on after the case was prepared, and the case must disclose it. Prepare the case again. Nothing was published."
- **R33 gains** C-122.3 and C-122.4. *(not yet met: T28)*
- **Uses gain** `accepted-work`. Index 44 is before 60.
- **P6.** About 40 lines on ~3,750 gives ~3,790. The seam named there (R57's copying) stands.

## 12. Not touched

- **`ratification`:** the leg is not in `references[]`, so `case-grammar` R5's edge set and the published graph do not change.
- **`public-read`:** the blocks travel inside the signed document and its case file (R3, R23).
- **`citation`:** no act cites a ref.

---

## modules.json and layers.md

**modules.json:** insert after `inquiry-grammar` (index 43). `inquiry` and every later module shift by one, so the dec112 draft's indices all move by one: `case-checker` becomes 66 and `case-import` 67.

```json
{"id": "accepted-work", "layer": 6, "paths": [], "tests": [], "uses": ["record-grammar", "membership", "promotion", "inquiry-grammar"]},
```

Edges gained:
- `basis-versions`, `strength`, `reevaluation` and `publication` gain `accepted-work`.
- `case-import` gains `inquiry-grammar`, `accepted-work` and `reevaluation`. Its entry in the dec112 draft becomes `["record-grammar", "record-core", "membership", "strength", "case-grammar", "case-checker", "inquiry-grammar", "accepted-work", "reevaluation"]`.
- `case-authoring` gains `case-import`.
- `plane` gains `accepted-work`.

Every edge points earlier (P4):
- `accepted-work` at 44 uses 0, 21, 23 and 43.
- `basis-versions` (47), `strength` (48), `reevaluation` (57) and `publication` (60) each use 44.
- `case-import` (67) uses 43, 44 and 57.
- `case-authoring` (68) uses 67.

Append to `status`: "AMENDED at T28's opening by BOB #103 (N522; DEC-96 items 1, 4): `accepted-work`, a new product module, directly after `inquiry-grammar` in layer 6."

**layers.md:**
- Row 6's list gains `accepted-work` after `inquiry-grammar`, and the module count moves by one.
- Append to the Status line: "AMENDED at T28's opening by BOB #103 (N522; DEC-96 items 1, 4): `accepted-work`, a new product module, directly after `inquiry-grammar` in layer 6 (below)."
- Add a section:

```markdown
## Layer 6: accepted-work (DEC-96 items 1, 4; N522)

A new product module, not a split (`build/requirements/accepted-work.md`, from `plan/draft-T28-n522.md`). It has no `from` and is created by its own T28 job at `bio-plane/src/accepted-work/`. A group's finding may rest on another group's finding it has accepted (DEC-112 (6)). That work is held by `case-import` in layer 8, which `inquiry`, `basis-versions`, `strength`, `reevaluation` and `publication` may not use (P4). This module declares the one registration `case-import` fills, the read facade those modules use, and the check that a leg on an imported finding names an edition whose acceptance is in force. It sits directly after `inquiry-grammar`, whose reference spelling it reads, and before `inquiry`, which measures 3,882 lines and cannot hold the seam (P6).

| module | what it does | source |
| --- | --- | --- |
| accepted-work | The registration `case-import` fills; reads of an imported finding's published pair and acceptance, its open flags and the withdrawals; the promotion check refusing a leg on work not accepted at the named edition. No table. | new (DEC-96 items 1, 4; DEC-112 (6)) |
```

## T28 job roster additions (merged into the dec112 draft's roster)

| layer | job | what (N522's share) |
|---|---|---|
| L2 | membership | R83's `MODULE_ORDER` re-pinned with `accepted-work` too (same job) |
| L2 | promotion | stamp C-21.3, C-21.4, C-21.5, C-120.10–C-120.13, C-122.3, C-122.4 (same job) |
| L6 | inquiry-grammar (new job) | R11, R7, R8 |
| L6 | **accepted-work (new module)** | R1–R7 |
| L6 | inquiry (new job, small) | R4, R12 wording; projection of a ref |
| L6 | basis-versions (new job, small) | R3 |
| L6 | strength | R33 (with R31, R32) |
| L7 | reevaluation (new job) | R31, R1, R8 |
| L8 | case-grammar | R16, R14 (same job) |
| L8 | case-checker | R18 (same job) |
| L8 | case-import | R16, R6, R7, R8, R9 (same job) |
| L8 | case-authoring | R50–R53, R14, R29 (same job) |
| L8 | publication | R59, R33 (same job) |
| L11 | op-declarations | `publish` and `publishpreflight` gain `flagsDisclosed` (same job) |
| L11 | plane | composition: `accepted-work`'s factory before `inquiry`'s; `case-import`'s registration (same job) |

This adds 5 jobs, for 18 in all:
- L6 is ordered inquiry-grammar, accepted-work, inquiry, basis-versions, strength.
- L7 is reevaluation, alone.
- L8's order is unchanged.

The legs' screens and the words "another group's" are the UX stream's (K633).

## BOB's decisions (wording level, P17; one line each for `rulings.md`)

1. **Option C.** The seam is a new L6 module, `accepted-work`, after `inquiry-grammar`. Placing it in `inquiry` (A) would pass P6, and (B) leaves the leg's check, its grade, the withdrawal cause and the commit re-read unbuildable (P4).
2. **The ref.** It is spelled `imported:<import>/<finding>` and is not a `references[]` entry. It never collides with a local id, and it leaves the published graph and `ratification` untouched.
3. **The leg carries no grade.** It contributes the accepted edition's published pair, as an inquiry leg contributes its target's answer. "The cited edition's grades stand as published" (DEC-96 item 1) then holds by construction.
4. **A leg requires an acceptance in force at the edition it names, when it is written.** This reads DEC-112 (6)'s "an accepted finding may support". After a withdrawal the leg stays, carries `reevaluation`'s cause and is never moved. `publishCase` refuses it (C-120.10) until the leg is re-accepted or taken out.
5. **Flags are disclosed by the owner's list (R52),** mirroring R31, because DEC-96 item 4 likens it to an open contradiction.
6. **The commit re-reads acceptance and flags (`publication` R59),** as R51 re-reads consent.
7. **No post-signing read of flags opened after an edition is signed** (`publication` R50's analogue). DEC-96 does not ask for one. The next edition's R52 discloses such a flag.

## Questions for Bob (requirement meaning), each with a recommendation

1. **What a disclosed flag shows in public.** DEC-96 item 2 keeps a flag inside the group. Item 4 makes a published case disclose it.
   - **Recommendation:** the case shows the issue as written, when it was raised, and the owner's words, and does not name the member who flagged it. Item 4 names "who" only for the acceptance.
   - **Alternative:** name the flagging member too.
2. **Presentability stops at accepted work (DEC-112 (4)).** Our case file does not carry the other group's materials. It names that group's case file by group, case, edition and manifest SHA-256. A reader recreates that link from the source's own case file.
   - **Recommendation:** as drafted (case-authoring R50, case-checker R18).
   - **Alternative:** carry the source case file's parts inside ours. That is complete but large, and it republishes another group's documents, whose republication is that group's judgement.
3. **What the statement states beyond "who accepted which edition, and why".**
   - **Recommendation:** add when, the recreation result and the gaps stated (DEC-112 (6) allows in-part acceptance only with the gaps stated, and a reader should see them). Keep `checked` inside the group.
   - **Alternative:** DEC-96's three facts only.

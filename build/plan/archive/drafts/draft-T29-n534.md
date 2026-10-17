# Draft: N534, watching other groups' published editions (DEC-101 (3), with DEC-116 (8)'s citing side)

**Status** · DRAFT for BOB #106, 2026-10-03, uncommitted. Written by a drafting worker on `prep/T29-folds`. It starts from `plan/draft-T29-carried.md` §1 (the share analysis, readings (a)–(e), the proposed entry). Section 3 lists where this draft departs from that entry and why. Nothing here is folded: every requirement text below is proposed, and each new or changed requirement is `*(not yet met: T29)*`.

Canon: DEC-101 response 3 and its owed line; DEC-116 item 8 and its owed line ("the per-case feed and 'Could not read the publisher's docket'"); `BIO_Publication_v0_1.md` §5A ("Watching other groups' editions") and §5D ("How the docket travels: by pull").

## 1. What is built, and what is not

**Built by this entry (server side).**
- A member sets a **watch** on an imported case. The watch names the publishing group's copy, by its address.
- The daemon reads that copy's public docket once a day. The read is a pull: nothing is pushed between groups.
- This copy verifies each entry it has not seen before: its digest, its signature in `NS_DOCKET`, and its place in the chain. It records each entry, verified or refused.
- A verified `edition` or `withdrawal` entry is a **publisher move**. A move gives every live leg resting on the cited edition a re-evaluation cause. The members owning those legs get a queue item. The member who set the watch is told of every verified entry, even when nothing rests on the case.
- A docket that cannot be read says "Could not read the publisher's docket" (`DOCKET_UNREADABLE`). It never says that nothing changed.

**Not built here.**
- **Screens.** The watch control, the notice wording and where they appear belong to Bob's UX design stream (K633), not to this process. The item words follow `queue-producers` R24 and the item contract.
- **No automatic import.** A new edition is never imported automatically (reading (c)). The member imports it by `case-import` R1.
- **No push.** Nothing is pushed between groups, and no email is sent (DEC-116 item 8).
- **No change to the case-file format.** The publisher's address stays out of `bio-case-file/1` (reading (a)).
- **Other entries do not raise causes.** A subject's response, a reaction or a disclosure on the publisher's docket never raises a re-evaluation cause here. Flag F1 says why.

## 2. Requirement changes, by module (in the order of `build/modules.json`)

### 2.1 `accepted-work` (L6, index 44): R1 and R2 amended, R8 added

The draft for `accepted-work` was not named in the task's list of modules. It is needed because `reevaluation` (index 57) can read work held by `case-import` (index 68) only through this seam. Its own text says so ("the one way `strength`, `reevaluation`, … read accepted work", R2), and R31 already reads that way.

- **R1**: add to the end of its first paragraph: "The registration may also carry a fourth function, `moves` (R8). A registration without it is accepted."
- **R2**: in its first sentence, after "`acceptanceWithdrawals`", insert "and `publisherMoves` (R8)".
- **R8** `publisherMoves({after, limit})` answers the registered `moves({after, limit})`. That answer is `{moves: [{move, import, group, case, kind, edition, seq, date, at, what_changed, reason, key_listed, taken_back}], cursor}`, in the order this copy recorded the moves, with `limit` 1–200 (default 200).
  - `kind` is `edition` or `withdrawal`.
  - `edition` is a number, or `all` for a withdrawal of every edition.
  - `at` is the instant this copy recorded the move.
  - `what_changed` (for an edition) and `reason` (for a withdrawal) are quoted as the entry gives them.
  - `taken_back` is `{seq, date}` or null.

  With no `moves` registered, it answers `{absent: true}`, stated as `accepted_work_absent`. When the registered function throws, it answers `{unreadable: true}`. It writes nothing and never throws. (DEC-101 (3); DEC-116 item 8; P4) *(not yet met: T29)*

### 2.2 `reevaluation` (L7, index 57): R33 added; R8 and the terms widened

- **Terms**: add to `source`'s list "`cited_case_moved` (R33; DEC-101 (3))".
- **R8**: after the `kind: acceptance` clause, insert "`kind: cited_case_moved` names the publisher move (R33; DEC-101 (3))".
- **R33** **A cited edition moved at its publisher** (DEC-101 (3); DEC-116 item 8). *(not yet met: T29)*
  - **The cause.** R2 gains the cause arm `cited_case_moved`, derived on read. A dependent carries one cause for each pair of a live leg (R7) and a move (`accepted-work.publisherMoves`, read through each `cursor` to null) where:
    - the leg rests on an imported finding reference at `target_edition` *n*;
    - the move is of the same import;
    - the move is either:
      - (a) an `edition` move naming *m* > *n*; or
      - (b) a `withdrawal` naming *n*; or a withdrawal naming `all` at `seq` *s*, unless an `edition` move naming *n* has a `seq` greater than *s*.

    `since` is the move's `at`. `detail` is the group, case, cited edition, the move's kind, edition, `seq`, `date`, `what_changed` or `reason`, `key_listed` and `taken_back`. A move that was taken back still stands as a cause, and its detail says so. The cause closes as any cause does (R16), and nothing regrades (R19). With `accepted-work` absent, the arm is not raised and the answer says so (`accepted_work_absent`). When its read is unreadable, the answer says that too (`accepted_work_unreadable`).
  - **The telling.** `citedCaseMoved({move})` is called by `case-import` after a read that recorded the move commits (its R18). It tells R8's listeners once, as `kind: "cited_case_moved"`, with the dependents that R33's arm answers for that move at that instant. It writes nothing and never throws. R18 is unchanged, because the arm writes no row.
  - **The listing.** `citedCaseDependents({after, limit, viewer})` answers each (dependent, move) pair so caused, in dependent then move order after `after`, at most `limit` (1–200, default 200), with `cursor`. A dependent the viewer may not see is withheld and not counted (R20).
  - **The recovery read.** `changesOf` (R9) answers this arm too.
- **Satisfies**: add "DEC-101 response 3 and DEC-116 item 8 (a citing copy turns a cited case's new edition or withdrawal into re-evaluation notices), `BIO_Publication_v0_1.md` §5A, §5D: R33 (N534)."
- **Uses**: no new module. `accepted-work` gains `publisherMoves` (its R8).

### 2.3 `docket` (L8, index 62): R24 added; R15 and the Suggestions re-worded

- **R24** The public answer has this exact form. A citing copy depends on it (DEC-101 (3)). *(not yet met: T29; the code answers it today, so the job writes its test)*
  - `docketPublic({case, captures?})` answers `{ok: true, case, group, entries, captures, last_entry, feed}`.
  - Each entry is `{seq, entry, digest, json, fields, signature, published_at, taken_back}`:
    - `json` is the exact canonical JSON (R4) whose SHA-256 is `digest`;
    - `signature` is the armored SSHSIG made over `signatures.docketStatement(case, seq, digest)` in `NS_DOCKET` (R5);
    - `fields` is `json` parsed;
    - `taken_back` is `{seq, date}` or null.
  - With `captures: "omit"`, `captures` is `{}` and the answer adds `captures_omitted: true`. No capture's bytes are read.
  - Everything else is as R14 says.
- **R15**: replace "(DEC-101 (3)'s side, not yet built)" with "(DEC-101 (3)'s citing side: `case-import` R18, R19)".
- **Suggestions, "Not drafted"**: strike "the citing side of DEC-101 (3)".

### 2.4 `public-read` (L8, index 63): R25 added

- **R25** `op=docketpublic&case=<case>&captures=omit` passes `captures: "omit"` to `docket.docketPublic` (its R24). Any other value of `captures`, or none, passes nothing. Everything else is as R21 says. (DEC-116 item 8; DEC-101 (3)) *(not yet met: T29)*

### 2.5 `case-import` (L8, index 68): R17–R20 added; R4, R12, R13, R14 and R16 widened

New uses edges, both pointing earlier: **`signatures`** (index 4: `verifySshsig`, `NS_DOCKET`, `docketStatement`, its R2, R39, R40) and **`docket`** (index 62: `DOCKET_UNREADABLE`, its R15). `record-grammar` (`isPublicHttpsLocator`, canonical JSON, `createSha256`) and `reevaluation` are already edges.

**Terms**, added:
- A **watch** is a member's standing request that this copy read the publisher's docket for one import. Its **docket address** is composed by R17.
- A **docket read** is one fetch of that address, made by `monitoring` (its R67).
- An **entry seen** is one public docket entry recorded from a read, either `verified` or `refused`.
- A **publisher move** is a verified entry of kind `edition` or `withdrawal`.

**watchImport({import, publisher, by, viewer})** (`op=importwatch`) **and unwatchImport({import, by, viewer})** (`op=importunwatch`); member session; each mutating
- **R17** Refusals, in order, each writing nothing:
  - R1's first two refusals;
  - an import that is absent, or one the viewer may not see, is `IMPORT_NO_SUCH_EDITION` (K1319's one answer);
  - for `watchImport`, a `publisher` that is not a public https locator (`record-grammar.isPublicHttpsLocator`), or that carries a query or a fragment, is `IMPORT_WATCH_BAD_ADDRESS`;
  - for `unwatchImport`, an import with no watch in force is `IMPORT_NOT_WATCHED`.

  Otherwise `watchImport` records a watch with `by`, the instant, `publisher` and the docket address. The docket address is `publisher` with the query `op=docketpublic&case=<the import's case, percent-encoded>&captures=omit` (`docket` R23, R24). A watch with the same docket address already in force answers `existed: true` and writes nothing. A different address replaces the watch in force. `unwatchImport` records the end of the watch, with `by` and the instant. Every watch and every end stays in the history. A watch is never a default: an import is not watched until a member asks. (DEC-101 (3): "can be configured"; Publication §5A) *(not yet met: T29)*

**watchedImports({after, limit}) and recordDocketRead({import, docket, at, outcome, reason?, answer?})** (services for `monitoring`; read as the plane)
- **R18** `watchedImports` answers each watch in force, in import order after `after`, at most `limit` (1–200, default 200), with `cursor`. Each is `{import, group, case, docket, set_by, set_at, last_read}`, where `last_read` is `{at, outcome, reason}` or null. It writes nothing and never throws.

  `recordDocketRead` refuses `IMPORT_NO_SUCH_EDITION` for an unknown import. It refuses `IMPORT_NOT_WATCHED` when no watch is in force, or when the watch in force names another docket address. Each refusal writes nothing. Otherwise it records the read `{at, outcome, reason, entries_seen, last_entry}` and answers `{ok: true, outcome, new_entries, new_moves, new_refused}`. It never throws.
  - With `outcome: "unreadable"`, `reason` is kept as `monitoring` gives it.
  - With `outcome: "read"`, an `answer` whose `group` is not the import's group, or whose `case` is not the import's case, is recorded as `unreadable` with reason `not_this_case`. Otherwise each entry of `answer.entries` (`docket` R24) whose `seq` this import does not yet hold is checked, and it is recorded `verified` only when all three checks hold:
    1. **The digest and the form.** The SHA-256 of `json`'s UTF-8 bytes is `digest`. `json` parses to an object whose `format` is `civicos-docket-entry/1`, whose `group` and `case` are the import's, and whose `seq` is the entry's.
    2. **The signature.** `signatures.verifySshsig(signature, docketStatement(case, seq, digest), NS_DOCKET, …)` verifies against the key the signature embeds. `key_listed` is true when that key is among the keys that the manifest of any edition held in this import lists (`case-grammar` R13), and false otherwise.
    3. **The chain.** `previous` is the digest of the held entry `seq − 1`, or null when `seq` is 1. When `seq − 1` is not held, the chain is `unchecked`, which does not refuse the entry.

    An entry that fails a check is recorded `refused`, naming the check. It is never a move. An entry whose `seq` is held with another digest is recorded `refused` with `differs: true` and both digests, and the held entry stands.
  - A verified `take-back` entry naming the `seq` of a move is stated beside that move as `taken_back`.
  - After the read commits, the act calls `reevaluation.citedCaseMoved({move})` (its R33) once for each new move. A throw there never undoes the read, and the answer names it under `listeners_failed`.

  (DEC-116 items 6, 8; DEC-101 (3); signatures R39, R40) *(not yet met: T29)*

**What a member reads**
- **R19** `importedCases` and `importedCase` (R4) also answer, for each import:
  - `watch`: `{docket, set_by, set_at, last_read}`, or null;
  - when `last_read.outcome` is `unreadable`, `docket_unreadable`: `DOCKET_UNREADABLE`'s sentence ("Could not read the publisher's docket") with the reason and the instant, never a statement that nothing changed;
  - and, per edition, `publisher`: the newest `edition` move (its edition, `date`, `what_changed`, `key_listed`), the `withdrawal` move covering that edition by R33's rule (its `seq`, `date`, `reason`, `key_listed`), each with `taken_back`, or null. A `publisher` of null means only that no move has been seen, and the answer says so together with `last_read`.

  Every entry seen, verified or refused, is answered in order under `docket_entries`. A non-member is answered as R4 says. (DEC-116 item 8: "never that nothing changed") *(not yet met: T29)*
- **R20** `watchItems({viewer})` (a service for `queue-producers`, read as the plane) answers the following, each naming the import, its group and case, and the watch's `set_by`:
  - `entries`: each verified entry seen, of any kind, with its `seq`, kind, edition, `date`, `key_listed` and, for a move, `what_changed` or `reason`;
  - `refused`: each refused entry, with its `seq` and the check it failed;
  - `unreadable`: each watch in force whose latest read is `unreadable`, with the reason and the instant.

  A viewer who is not an active member is answered empty. It writes nothing and never throws. (DEC-101 (3): "telling the members"; reading (e)) *(not yet met: T29)*

**Widened**
- **R16**: add a fourth bullet, "`moves` (R18's publisher moves, in the order recorded, paged; `accepted-work` R8)".
- **R12**: add "watches, their ends, docket reads and entries seen" to what is append-only.
- **R13**: add "the watch, read and entry tables are the import's own record, purged with it".
- **R14**: two new rows of the family C-130, stamped by promotion:
  - C-130.15 `IMPORT_WATCH_BAD_ADDRESS`: "That is not the public https address of the publishing group's copy. Give the address of their copy, with no query and no fragment. Nothing was written."
  - C-130.16 `IMPORT_NOT_WATCHED`: "This imported case is not being watched, so there is no watch to end. Nothing was written."
- **Satisfies**: add "DEC-101 response 3; DEC-116 item 8 (the citing copy, 'Could not read the publisher's docket'); `BIO_Publication_v0_1.md` §5A, §5D: R17–R20 (N534)."
- **Suggestions**: for check 2, pass the manifests' keys to `verifySshsig`. On `UNKNOWN_KEY`, verify again against the `keyB64` it names, and record `key_listed: false`. Tests:
  - a verified run of entries;
  - a tampered `json`;
  - a signature in another namespace;
  - an unlisted key, which is verified with `key_listed: false`;
  - a broken `previous`;
  - a re-served `seq` with another digest;
  - `not_this_case`;
  - a non-member reads absence;
  - each refusal, with a negative control.

### 2.6 `monitoring` (L10, index 83): R67 and R68 added; R30 and R36 widened

New uses edge: **`case-import`** (index 68: `watchedImports`, `recordDocketRead`, its R18). It points earlier. It needs no `docket` edge, because `case-import` verifies the entries and holds the sentence.

- **R67** **The docket watch** (DEC-101 (3); Publication §5A). *(not yet met: T29)*
  - The cadence tick (R19) reads `caseImport.watchedImports` to its end. A watch is due when it has never been read, or when its `last_read.at` plus 24 hours (R14's `daily`) is at or before now.
  - Each tick reads due watches after its batch's addresses and before its named requests (R28), all within R19's 50, oldest due first. Each watch is claimed as the subject `docket:<import>` under R21's epoch.
  - The read is a GET of the watch's docket address through `host-governor` (R2), reading at most 8 MiB.
    - It is `read` when the answer is HTTP 200 and its body is JSON `{ok: true, result}`, where `result` is an object with an `entries` list.
    - Otherwise it is `unreadable`, with reason `http_<status>`, `not_json`, `not_a_docket`, `too_large` or `fetch_failed`.
  - The outcome goes to `caseImport.recordDocketRead`, with `answer` set to `result`.
  - A governed refusal records nothing, counts as `governed` and leaves the watch due. It is never `unreadable` (R39).
  - A `recordDocketRead` that refuses or throws is `failed` with its reason, and the epoch stays open (R21).
  - The tick's answer gains `watched: {due, read, unreadable, governed, failed}`.
  - A docket read writes no observation row and no capture reachability (R11, R25): a docket entry is never evidence (DEC-116 item 1), and `case-import`'s read row is the record of what was seen.
  - While paused (R30), no docket is read, and the tick says so.
- **R68** `cadenceDue(now)` also answers due while a watch is due (R67). `cadenceWake(now)` takes the earliest instant a watch next falls due as one more candidate for R19's `next`. Each, given the rank (R19), offers a watch as `{kind: "docket", id: <import>, waitingSince: last_read.at + 24 h, or null when never read}`. *(not yet met: T29)*
- **R30**: in the paused sentence, after "monitoring's and the fallback's fetches stop", insert ", and so do the docket reads (R67)".
- **R36**: add the bullet "a watch's docket address, as `case-import` holds it (R67; its R17)".
- **Satisfies**: add "DEC-101 response 3; `BIO_Publication_v0_1.md` §5A ('Watching other groups' editions'), §5D ('by pull'): R67, R68 (N534)."

### 2.7 `queue-producers` (L11, index 88): R32 and R33 added; R8 widened

New uses edge: **`case-import`** (index 68: `watchItems`, its R20). It points earlier. `reevaluation` is already an edge and gains `citedCaseDependents` (its R33).

- **R8**: add "R32, R33" to the list of items it answers.
- **R32** (`reevaluation` R33; DEC-101 (3)) FINDINGs `cited-newer-edition` and `cited-edition-withdrawn`, by the move's kind:
  - one per (dependent, move) that `reevaluation.citedCaseDependents` answers;
  - keyed `FINDING::<kind>::<dependent>::<import>#<seq>`;
  - homed under the dependent's ancestors (`queue` R7);
  - its detail names the group, the case, the cited edition, the edition named, and the `what_changed` or `reason` quoted. When `key_listed` is false, it says that the entry's signing key is not among the keys the imported case file lists. When the move was taken back, it says so;
  - it leaves when the cause closes (as R31).

  *(not yet met: T29)*
- **R33** (`case-import` R20; DEC-101 (3), DEC-116 item 8) The watch's items go to the member who set the watch in force (`set_by`). When that member is no longer an active member, they go to the administrators (`membership` R86). They go to nobody else. Each item's subject is `{kind: "import", id}`, and it has no project home (as R20's `group` template):
  - FINDING `followed-case-entry`: one per verified entry seen, keyed `FINDING::followed-case-entry::<import>#<seq>`. It names the kind, edition, date and `key_listed`, and quotes `what_changed` or `reason` for a move. It is raised once and leaves when its recipient disposes of it (DEC-69, DEC-94).
  - FINDING `cited-docket-entry-refused`: one per refused entry, keyed `FINDING::cited-docket-entry-refused::<import>#<seq>`. It names the check failed. It is raised once.
  - CONDITION `cited-docket-unreadable`: one per watch whose latest read is unreadable, keyed `CONDITION::cited-docket-unreadable::<import>`. Its detail opens with `DOCKET_UNREADABLE`'s sentence and gives the reason and the instant. It leaves when a read succeeds or the watch ends.

  *(not yet met: T29)*

### 2.8 `affordances` (L11, index 86): R36 added

- **R36** (DEC-101 (3); N534) The ops `case-import` adds for watching (`op-declarations` R15), by R7 and R27, with R12's totality holding over them:
  - `RUNGS` assigns `reversible` to `importwatch` and `importunwatch`: each takes the other back, and neither asks a reason (R27).
  - `NON_ACTS` gives both R35's sentence ("import-directed: …").
  - Neither is in `MACHINE_REFUSALS`. `case-import` refuses a machine by name itself (`MACHINE_CANNOT_IMPORT`).
  - No vocabulary is added.

  *(not yet met: T29)*

### 2.9 `op-declarations` (L11, index 91): R15 added

- **R15** (DEC-101 (3); `case-import` R17; N534) `OPS` holds a spec for `importwatch` and `importunwatch`:
  - mutating, with `by` and `viewer` stamped;
  - in `SESSION_OPS.member` and `SESSION_OPS.admin`, with `NEEDS` `contribute`;
  - for a member session only: classes `admin`, `member` and `machineClasses: []`.

  R6 holds over them. *(not yet met: T29)*

### 2.10 `control-plane` (L11, index 93): R50 added

- **R50** (DEC-101 (3); N534) The door routes `importwatch` and `importunwatch` through `case-import`'s own map (R26), with the stamps `op-declarations` R15 declares and none taken from the caller (R29). Each is refused to any caller that does not arrive by a member's session. *(not yet met: T29)*

### 2.11 `plane` (L11, index 94): R18 added

- **R18** (N534; DEC-101 (3)) The composition root hands `monitoring` the `case-import` instance it reads (`watchedImports`, `recordDocketRead`; `monitoring` R67). It hands `queue` the `case-import` dep that `queue-producers` R33 reads. `case-import`'s `accepted-work` registration carries `moves` (`accepted-work` R8), filled before the first request as R16 and R17 say. *(not yet met: T29)*

### 2.12 `signatures` (L1, index 4): no change

R39 (`NS_DOCKET`) and R40 (`docketStatement`) serve the citing side as written. R2's `verifySshsig` already answers `UNKNOWN_KEY` with `keyB64`, which R18's check 2 uses.

## 3. Readings

**BOB's (technical; P17). Recorded once in `rulings.md` at the fold.**
- **R-a.** The publisher's address is a member's input to the watch, and the case-file format is unchanged (carried reading (a)). The docket address is composed from that input (R17).
- **R-b.** An entry is verified against the key its signature embeds. Whether that key is among the case file's keys is stated as `key_listed` and does not refuse the entry (carried reading (b)). The digest, form and chain checks are added here.
- **R-c / R-d.** A new edition is not imported automatically. An unreachable docket is `DOCKET_UNREADABLE` (carried readings (c), (d)).
- **R-e.** A followed case that nothing rests on still reaches the watch's setter (carried reading (e); queue-producers R33).
- **R-f. Departures from the carried entry.**
  - **The watch is held by `case-import`, not `monitoring`.** `case-import` R4 must answer it, and `case-import` (68) cannot use `monitoring` (83). `monitoring` fetches on its cadence and hands the result over.
  - **`reevaluation` reads moves through `accepted-work`.** It keeps R31's seam (P4) and gets no registration of its own. `moves` is optional, so the L6 change does not break `case-import`'s three-function registration between layers.
  - **`monitoring` needs no `docket` edge.**
  - **The cause is named `cited_case_moved`.** The name `cited_edition` would collide with the field of the same name in R2's `edition` arm.
- **R-g.** The cadence is fixed at daily (R14's interval). There is no per-watch frequency, because `MONITOR_FREQ` is monitoring's and later than `case-import`. A new watch is due at once.
- **R-h.** A docket read writes no observation row and no capture reachability. A docket entry is never evidence (DEC-116 item 1).
- **R-i.** `captures=omit` is added on the publisher's side (docket R24, public-read R25), so that a watch does not download every listed capture each day. A publisher on an older release that sends the bytes anyway is bounded at 8 MiB.
- **R-j.** A move that was taken back keeps its cause and says so in the detail. Closing the cause stays a member's act (R16).
- **R-k.** The watch acts are graded `reversible` with no reason asked, and any active member may end a watch. The items go to the watch's setter, else to the administrators.

**Possibly Bob's (each could change what a requirement means). A recommendation for each.**
- **F1. Which docket entries become re-evaluation notices.** DEC-116 item 8 and §5D say citing copies "turn entries into notices for the members whose work rests on the case". This draft raises a re-evaluation cause only for an `edition` or `withdrawal`. Every other verified entry (a subject's response, a reaction, a disclosure) goes only to the watch's setter. *Recommendation:* keep it this way. A docket entry is never evidence (DEC-116 item 1), and only a new edition or a withdrawal changes what the cited work is. Ask Bob to confirm in one line, because it narrows his words.
- **F2. "Cites or follows."** DEC-101 (3) lets a copy watch the cases of other groups "it cites or follows". Here a case can be watched only once it is imported, because the import holds the case's keys and id. *Recommendation:* read "follows" as "imported". A case that has not been imported has no keys to verify its entries against.
- **F3. An unlisted signing key.** An entry signed by a key that is not in the case file is still a move, labelled as such (R-b). *Recommendation:* keep it. Refusing the entry would silently drop a real withdrawal signed by a newer manager's key, and silence must be earned (`reevaluation` R21).

## 4. Entry lines for the plan, by layer

- **L1** `signatures`: no change (2.12).
- **L6** `accepted-work`: R1 and R2 amended, R8 `publisherMoves` (optional `moves`). About 40 lines.
- **L7** `reevaluation`: R33 (`cited_case_moved`, `citedCaseMoved`, `citedCaseDependents`), with R8 and the terms widened. About 150 lines.
- **L8** `docket`: R24, the wire form and `captures: "omit"`, with R15 and the Suggestions re-worded. About 20 lines and a test. `public-read`: R25. About 10 lines. `case-import`: R17–R20, rows C-130.15 and C-130.16, with R4, R12, R13 and R16 widened. New edges `signatures` and `docket`. About 450 lines.
- **L10** `monitoring`: R67 and R68, with R30 and R36 widened. New edge `case-import`. About 250 lines.
- **L11** `queue-producers`: R32 and R33, R8, new edge `case-import`, about 150 lines. `affordances`: R36, about 15 lines. `op-declarations`: R15, about 15 lines. `control-plane`: R50, about 10 lines. `plane`: R18, about 10 lines.

**Edges check** (`build/modules.json`). Every new edge points earlier, so no cycle is formed:
- `case-import` (68) → `signatures` (4) and `docket` (62);
- `monitoring` (83) → `case-import` (68);
- `queue-producers` (88) → `case-import` (68).

`docket` does not use `case-import`.

## 5. Risks

- **Size (P6: about 4,000 lines per module).** Own code today (`wc -l` over each module's `paths`), with the estimate after this entry:

  | module | lines today | after this entry |
  |---|---|---|
  | `control-plane` | 3,649 | about 3,660 |
  | `queue-producers` | 3,437 | about 3,590 (tightest) |
  | `affordances` | 3,263 | about 3,280 |
  | `monitoring` | 3,208 | about 3,460 |
  | `public-read` | 2,890 | about 2,900 |
  | `reevaluation` | 2,790 | about 2,940 |
  | `op-declarations` | 2,604 | about 2,620 |
  | `signatures` | 1,308 | unchanged |
  | `docket` | 1,294 | about 1,310 |
  | `case-import` | 1,154 | about 1,600 |
  | `plane` | 732 | about 740 |
  | `accepted-work` | 240 | about 280 |

  `queue-producers` and `control-plane` are within about 400 lines of the limit. Name their next split now.
- **Order within the tranche.** `monitoring` (L10) and `queue-producers` (L11) call `case-import` services built at L8. Each guards an absent service and states it, as `accepted_work_absent` does.
- **`queue`'s subject kind.** `{kind: "import"}` with no home is new to `queue`. Precedent: R20's `group` template. `queue`'s job may need a line, so name it as a possible red.
- **Interoperation.** The design assumes that the publisher's case id and group slug in the docket equal the case file's. A publisher on a release before T27 has no docket, which reads `unreadable` (`http_400`). An older publisher ignores `captures=omit`.
- **Clock.** An entry's `date` is the publisher's claim. `since` uses this copy's `at`.
- **Catalogue.** C-130.15 and C-130.16 join the rows awaiting stamp (S5).

# Draft: the six DEC folds for Bob's approval (T22)

**Status** · DRAFT by a worker for BOB #89, 2026-10-01, on `prep/T22` @ d3d903fa7d (which contains `main` @ 994fd3f9ff and the UX stream's DEC-96–DEC-111). For BOB's review, then Bob's approval on one rendered page (`next.md` step 6; `t22-check.md` question 1). Rows H2, H6, H9, H16, J3, J5 of `t22-inventory.md`. Each fold restates a ruling Bob has made; only the wording is new. Nothing here is folded into `build/requirements/` yet.

Conventions. A new requirement takes its module's next free id (retired ids never reused). Every new or changed line ends `*(not yet met: T22)*`; each cites its DEC. Line counts are of each module's `paths` in `build/modules.json`, measured on this branch. "Order" means the module uses only earlier modules (P4).

---

## 1. DEC-89: the reason for escalating, and declining to escalate (J3)

**Ruled.** "(1) Opening an escalation … requires a written reason: why this breach is worth pursuing. (2) A new act, DECLINE TO ESCALATE, on a live noncompliant determination records, in the member's own words, why the group is not pursuing it now; reasoned, attributed and dated; corrected forward only … Both are PROSE ONLY."
**Owed.** "the requirement changes in `escalation` (the required opening reason; the decline act and its read) and `conformance` (a determination shows whether it was escalated, declined or neither), with the decline act's rung (reasoned) in `affordances`, for Bob's approval."

### escalation (index 70, layer 9; 1,554 lines; next free id R27)

- **R1 becomes:** `escalationOpen({determination, reason, author, viewer})`. Refusals in order: `MACHINE_CANNOT_OPEN`; `ESCALATION_NO_REASON` (R24: the author's reason why this breach is worth pursuing, absent, blank or over 2,000 characters); then `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT`, `ESCALATION_NOT_A_PARTICIPANT`, `ALREADY_OPEN`, as now. Otherwise it opens at stage 1, recording the noncompliant standards it pursues, the reason, who and when. Any joined member may open one. (DEC-89 (1); DEC-88) *(not yet met: T22)*
  - Note: J2 (DEC-88, unconditional) needs the same reason. If DEC-89 is not approved, J2 still adds it, without "why this breach is worth pursuing".
- **R27 (new)** `declineToEscalate({determination, reason, author, viewer})` (`op=declinetoescalate`). A member records, in their own words, why the group is not pursuing a live noncompliant determination now. Refused exactly as R1 refuses an opening, in R1's order, with `MACHINE_CANNOT_DECLINE` in place of `MACHINE_CANNOT_OPEN`. Otherwise it records the decline with its reason, who and when. A decline is never edited: a later decline of the same determination, or an escalation opened later with its own reason, supersedes it, and every decline stays readable. Any joined member who may open an escalation may decline one. (DEC-89 (2)) *(not yet met: T22)*
- **R28 (new)** `escalationStatus({determination, viewer})` (`op=escalationstatus`) answers whether the determination was `escalated`, `declined` or `neither`: `escalated` when the latest of its openings and declines is an opening, `declined` when it is a decline, `neither` when it has none. It also answers every escalation (as R22) and every decline (reason, who, when, and what superseded it), oldest first. An absent or invisible determination answers `NO_SUCH_DETERMINATION` (`conformance.noSuchDetermination`). Writes nothing. (DEC-89; placed here, not in `conformance`, by P4) *(not yet met: T22)*
- **R24 becomes:** … wherever an act takes one (R1's opening, R10's evaluation, R13's advance and decline, R15's suspension, R27's decline to escalate), is `ESCALATION_NO_REASON` … (rest unchanged). (DEC-89) *(not yet met: T22)*
- **R25 becomes:** … gains the arms `declinetoescalate` (R27) and `escalationstatus` (R28, with the query's `determination` and `viewer`) … (rest unchanged). *(not yet met: T22)*
- **R17 becomes:** Nothing a machine writes opens, declines to open, attaches to, … an escalation … (DEC-89) *(not yet met: T22)*
- **R18 becomes:** Every opening reason, decline to escalate, stage move, evaluation, decline, suspension and end is append-only … (DEC-89) *(not yet met: T22)*
- R19 (no significance, severity, priority, urgency or score) is unchanged and now covers both reasons: prose only.
- Suggestions: a table `escalation_declines_to_open` (name BOB's), declared to purge. `MACHINE_CANNOT_DECLINE` gets its own row beside C-116.x.

### conformance (index 63; 1,538 lines)

No change. DEC-89 asks that a determination show whether it was escalated, declined or neither, but `conformance` comes before `escalation` and cannot read it (P4). The answer is `escalation` R28's. R8 (no significance key) is unchanged.

### affordances (index 74, layer 11; 3,158 lines)

- **R2 becomes:** … `reasoned` … `escalationsuspend`, `declinetoescalate` (DEC-89: escalation R27, `ESCALATION_NO_REASON`), `filemembershipjudge` … (rest unchanged). *(not yet met: T22)*
- R7's general rule gives `NON_ACTS` its entries (`declinetoescalate`: determination-directed; `escalationstatus`: a read). No text change.

### op-declarations (index 79), control-plane (index 81)

No text change: op-declarations R6 (a spec for every op a module serves) and control-plane R26 (routes are the modules' own maps) cover the two new ops. Their jobs add the specs (member session, `contribute` for `declinetoescalate`) and the route through `escalationOps`.

### Services that change, and their users (P5)

- `escalationOpen` gains a required `reason`. Users: control-plane's route only (through R25); `affordances`' pre-flight. The UI caller must send it (instance-setup has no escalation page; no other caller in `build/requirements/`).
- `escalationsFor` (R22, read by `action-plans`) is not changed.
- The totality check is red on the two new ops from escalation's merge (L9) until affordances and op-declarations merge (L11) (accepted red 5, `next.md`).

### Layer, order, size

escalation L9 uses conformance (63 < 70). affordances, op-declarations, control-plane L11. None is near 4,000.

### Left open (not in the wording)

- The UX page's open question 8 marked ruled: the UX stream's file.
- Read by BOB, for Bob to confirm: "corrected forward only" is read as "a later decline also supersedes an earlier one". "Any joined member who may open an escalation may decline one" is read as "the same refusals as opening", so no decline while one is open (`ALREADY_OPEN`).

---

## 2. DEC-95 (1): the grade note on an unattended capture (J5)

**Ruled.** "THE GRADE NOTE: shown whole, once, when a capture completes (DEC-51); for a capture that completes later and unattended (a bulk capture, or one the assistant requested), the note is attached to the completed capture and to its queue item."
**Owed.** "the unattended grade note (capture, queue), for Bob's approval."

### capture (index 28, layer 3; 3,002 lines; next free id R76)

- **R76 (new)** `gradeNoteOf({captureSha, viewer})` (`op=gradenote`) answers the grade note (`acquisition`'s `ACQUIRE_GRADE_NOTE`, the same words `op=acquire`'s answer carries) for a capture this record holds, so a capture completed with no member present (a machine credential's capture, or one fired for a capture request) carries its note afterwards. It answers by the viewer as R69's `captureAccountsOf` does: a capture the viewer may not see, or one not held, answers `note: null`. Writes nothing. (DEC-95 (1); DEC-51) *(not yet met: T22)*
- Suggestion: the note is composed from the grade constants; nothing need be stored.

### queue-producers (index 76, layer 11; 2,873 lines; next free id R22)

- **R22 (new)** Each `capture-completed-unattended` item (R3) carries the capture's grade note (`capture` R76) in its detail. (DEC-95 (1)) *(not yet met: T22)*
- Uses gain `capture.gradeNoteOf` (capture is already a use).

### Services that change, and their users

New service only. `queue` renders the item's detail as now; no change there.

### Layer, order, size

capture L3, queue-producers L11 (28 < 76). Neither near 4,000.

### Left open

- DEC-95 (2) became DEC-97 (section 3). DEC-95 (3), the guarded suggestion, is a screen (J6, left out as UX).
- The UX page's open question 13 marked ruled: the UX stream's.

---

## 3. DEC-97: the held-captures list and acting on several (H2)

**Ruled.** "A: (1) a 'Held captures' view, per member and per project, showing only what the viewer may see; sortable by age, source and project; each row shows its age; nothing … notified. (2) … tick several (nothing pre-ticked) … vouch for them together as one batch release …; set them aside together with one reason (each stays held …, never deleted); or link them to a question. (3) crucial documents, and documents caught in an unresolved contradiction …, are shown as not eligible, with the reason, before the member acts."
**Owed.** "the held-captures list and the bulk set-aside and bulk link acts (no set-aside act exists today), and the batch eligibility check's 'contested' arm …, as requirements for Bob's approval (BOB places them)."

### Placement (BOB's, proposed)

- The list and set-aside go to **capture** (3,002 lines). It already holds captures and the doorbell, and has room. `ratification` (3,770) cannot take them under 4,000.
- The list must show the batch's eligibility before the act. That rule is `ratification`'s (R22), which comes later than `capture` (P4). So `ratification` registers its examination with `capture` once at start, as R44 and R55 do; the list and the act then share one rule.
- **Batch release** is the existing `op=release` (ratification R20–R26) over a selection.
- **Link to a question** is the existing `op=cite` over a selection onto an inquiry (`citation` R1–R3). The page makes the selection from the ticked rows (`op=select`, `retrieval` R18).
- **Set-aside** is new. Each document stays at `collected`, so no new record state and no record-grammar change.

### ratification (index 58, layer 8; 3,770 lines; next free id R34)

- **R22 becomes:** … in this order: absent or not `information`; not `collected` (with its state); criticality `crucial`; **contested: a side of an unresolved contradiction rests on it (a `contradiction` candidate on it whose state is `open`, `explained_not_shown` or `taken_up`, its R26)**; the verified state's entry requirements. The set is then refused whole … `CRUCIAL_IN_BATCH` …; **`CONTESTED_IN_BATCH` (`offenders`, sorted ids; contested material is never batch-released)**; `ENTRY_REQUIREMENTS` … (DEC-97 (3); Intake Doctrine §4) *(not yet met: T22)*
- **R34 (new)** At start this module registers with `capture` (its R78) the examination R22 makes of one document: for an id, null when it passes, else the class it fails first with that class's reason. The examination is R22's own, so the list and the act never disagree (DEC-8). (DEC-97 (3)) *(not yet met: T22)*
- Uses gain `contradiction` (45 < 58): its reads of candidates on a bundle.

### capture (index 28; next free ids R77–R79, after DEC-95's R76)

- **R77 (new)** `heldCaptures({member?, project?, sort, dir, limit, after, viewer})` (`op=heldcaptures`) lists the Information documents at `collected` that have not been set aside (R79), showing only what the viewer may see (membership R43). `member` limits the list to that member's captures; `project` to that project's documents (`provenance.homeOf`). Each row gives the document, its source as provenance records it, its project, its age since it was collected, and its batch eligibility (R78). It can be sorted by age, source or project. At most `limit` rows (default 200, clamped 1…1000), with `truncated` and `next` (N90's bound). It writes nothing, and nothing about held captures is notified. (DEC-97 (1); DEC-69, DEC-94) *(not yet met: T22)*
- **R78 (new)** A later module may register, once at start, the batch-release examination of one document (`ratification` R34). R77 answers each row `eligible: true`, or `eligible: false` with the class and its reason. With none registered, each row reads `eligible: null`, stated undetermined. (DEC-97 (3)) *(not yet met: T22)*
- **R79 (new)** `setAside({ids, reason, author, viewer})` (`op=heldsetaside`) sets several held documents aside with one reason. Refusals in order: an empty or machine author `MACHINE_CANNOT_SET_ASIDE`; an empty reason, or one over 2,000 characters, `SET_ASIDE_NO_REASON`; no ids, or more than `PER_ITEM_MAX`; any id absent or invisible (one answer), not `information`, or not at `collected`, named. The set is refused whole, never narrowed. Otherwise each is recorded as set aside with the reason, who and when. The document is unchanged, stays at `collected` and is never deleted; a set-aside document leaves R77's list. Append-only. (DEC-97 (2)) *(not yet met: T22)*

### Services that change, and their users (P5)

- `release` (R22) gains a refusal class. Users: control-plane's route; `affordances` (the `release` act, R8). affordances offers `release` on one document; `CONTESTED_IN_BATCH` is a batch refusal, so no affordances text change.
- New ops `heldcaptures`, `heldsetaside`: op-declarations specs, an affordances rung for `heldsetaside` (`reasoned`, R2) and a `NON_ACTS` read entry for `heldcaptures`. These are L11 work. The totality check is red on them from capture's L3 merge until L11 (like accepted red 5).

### Layer, order, size

capture L3, ratification L8 (uses contradiction 45 and capture 28, both earlier). ratification ends near 3,820 (one class and one registration); its job stops and reports if it would pass 4,000. capture's T22 load (J1/J2, H16, J5 and this) must stay under 4,000: about 3,500 estimated.

### Left open (not in the wording)

- **For Bob:** which contradictions make a document "contested": duties only, or leads too (DEC-84 (1): a lead never creates an obligation). The draft lists states, not weights.
- **For Bob:** "per member" is read as the member who captured it (the capturing actor). Bob may mean the member's own work list.
- **For Bob:** "link them to a question" is read as citing them on the question (`cite`, with a role, supports or cuts against). Bob may mean a lighter link with no role.
- Not ruled: whether a set-aside can be undone, and whether set-aside documents get their own view.
- BOB's: whether a contradiction whose other side the member cannot see still bars the batch (`contradiction`'s reads answer only what the viewer sees).
- The view itself (ticking, the screen): the UX stream's.

---

## 4. DEC-101 (1)(2): "What changed in this edition, and why" (H6)

**Ruled.** "(1) … I have no problem with the system generating an initial, perhaps partial, description of the changes … The draft is labelled machine work until a member adopts or rewrites it; … the record keeps that it began as a machine draft. (2) … required in all revisions of a publication … a new edition cannot be signed without it."
**Owed.** "the statement as a required part of a new edition's signing (publication, case-authoring); the assistant's draft of it, labelled machine work, with its origin kept."

### case-grammar (index 54, layer 8; 446 lines; next free id R8)

- **R8 (new)** The case document's "What changed" block, one spelling for every module. `what_changed:` holds `{statement_sha, began_as, draft, adopted_as_drafted}`: `began_as` is `member` or `machine_draft`; `draft` names the machine draft (null for `member`); `adopted_as_drafted` is true when the member signed the draft's words unchanged, false when they rewrote them, null for `member`. The statement itself is the body section under `## What Changed in This Edition, and Why`. `whatChangedOf(fm, body)` reads both back, null for a document without them. Pure; never throws. (DEC-101 (1)(2); Publication §5A) *(not yet met: T22)*
- R1 gains the block in the current format (see "Left open").

### case-authoring (index 59, layer 8; 3,153 lines; next free ids R38, R39)

- **R38 (new)** `publishCase` takes `whatChanged: {text, draft?}`. For an edition above 1, an absent or blank `text` is refused `NO_WHAT_CHANGED`, and text over 8,000 characters `BAD_WHAT_CHANGED`. `draft` names a machine draft (R39) of this case; when named, the document records `began_as: machine_draft` and whether the text is the draft's unchanged. Without one, `began_as: member`. The statement is written into the document (`case-grammar` R8) and printed in its body. A first edition carries none. (DEC-101 (1)(2)) *(not yet met: T22)*
- **R39 (new)** `proposeWhatChanged({case, text, proposedBy, viewer})` (`op=whatchangedpropose`) stores the assistant's draft of a new edition's statement, labelled machine work (`record-grammar`'s `proposalLabel(proposedBy, "edition_statement")`). It is never a statement until a member adopts or rewrites it through R38. `whatChangedDrafts({case, viewer})` lists them with their labels. Refusals: `NO_SUCH_CASE` (a case not published, or invisible); an empty text, or one over 8,000 characters. Append-only. (DEC-101 (1); DEC-84 (14)) *(not yet met: T22)*
- **R14 becomes:** … the draft link when named (R9 …); the "What changed" block and its section for an edition above 1 (R38); a receipt. … (DEC-101) *(not yet met: T22)*
- R34 (the pre-flight) needs no text change: it runs `publishCase` (so `NO_WHAT_CHANGED` comes `first`) and ratification R18.

### ratification (next free id R35, after DEC-97's R34)

- **R8 becomes:** `checkCaseDocument` answers the findings of C-41.1–C-41.16 … C-41.16 (new): a case document whose edition is above 1 and which carries no "What changed" statement (`case-grammar` R8), or a blank one. Since `runCaseGate` runs this catalogue, `op=caseratify` (R2's `GATE_REFUSED`) and the pre-flight (R18) both refuse it before signing. (DEC-101 (2)) *(not yet met: T22)*
- Its row's translation (BOB drafts): "A new edition of a case says what changed in it, and why, before it is signed. This one does not. Write the statement, then sign. Nothing was signed."

### record-grammar (index 0, layer 1; 2,259 lines; next free id R43)

- **R43 (new)** `PROPOSAL_STATES` gains, last, `edition_statement`: three sentences, as R42 did for `template`. The `machine_proposed` sentence says the wording is machine work, a draft of a new edition's statement, and is not the group's statement until a member adopts or rewrites it. (DEC-101 (1)) *(not yet met: T22)*
- Alternative: case-authoring holds its own label sentence, which keeps record-grammar out of T22. BOB's choice. The record-grammar route adds it to L1.

### skills (index 50, layer 6; 1,806 lines; next free id R31)

- **R31 (new)** The `edition_statement` layer, in `disclosed`: `sourcing` `authored`; `load_when` "the run drafts a new edition's statement of what changed, and why"; body the clauses of `BIO_Publication_v0_1.md` §5A found by R21's normaliser ("The draft is not a diff: it is a detailed, high-level description of what changed and, as far as the system can determine it, why (the motivation for the revision)." and "The signed statement is the group's, adopted by a member, and the record keeps that it began as a machine draft."); and `acts` read from `published.catalog` by id (R23): the proposal act `whatchangedpropose`, and the member-only acts `publish` and `caseratify`. While the catalogue holds no `whatchangedpropose`, the layer renders as a stated absence in R9's form. (DEC-101 (1)) *(not yet met: T22)*

### publication (4,408 lines)

No change. The statement lives in the signed document; readers read it through `case-grammar`. publication does not grow.

### public-read (index 56; next free id R18)

- **R3 becomes:** … The answer carries `what_changed`, read from the signed document (`case-grammar` R8), never live, at the top of an edition above 1. An edition that has a successor quotes the successor's statement beside its pointer to it. (DEC-101; Publication §5A: "shown at the top of the new edition and quoted where the older edition points to its successor") *(not yet met: T22)*

### Services that change, and their users (P5)

- `publishCase` gains `whatChanged`. Users: case-authoring's own ops (`publish`, `publishpreflight`), `review` (the review copy runs it, R18), queue-producers (J8 reads `caseDocumentFacts`, not `publishCase`). `review`'s requirements name no fields of `publishCase`, so no text change. Its tests must pass `whatChanged` for an edition above 1.
- `checkCaseDocument` gains C-41.16. Users: `promotion` (runs it) and affordances (none). It moves `CATALOG_VERSION` and the census (rule 3).
- New ops `whatchangedpropose`, `whatchangeddrafts`: specs, a rung (`whatchangedpropose`: `undetermined`, machine work, as `contradictionrecommend`), and `NON_ACTS` entries in L11. Accepted red from L8 until L11.

### Layer, order, size

record-grammar L1 (if chosen), skills L6, then case-grammar, ratification, case-authoring, public-read in L8. skills reads acts from the catalogue, never by module import. case-authoring ends near 3,350, ratification near 3,840 (with H2), case-grammar near 500.

### Left open

- BOB's: whether the blocks join `/5` (the precedent in case-grammar R1: no `/5` document stored yet) or a new `/6`. The job checks no `/5` is stored at its start.
- BOB's: the 8,000-character bound, the op names, the C-41.16 wording.
- DEC-101 (3), watching other groups' editions: left out (H6b, dependency not yet built).
- The screen showing the draft and its adoption: the UX stream's.

---

## 5. DEC-103: the lens printed into the signed case (H9)

**Ruled.** "At publication every statement in force is printed into the signed case (kind in plain words, subject, text, justification and evidence), citing only public material and counting what is withheld. The page shows 'The lens this case was produced under': the acknowledgement first, then each statement with its reasons beneath, then two lines on why groups declare bias; collapsed on screen …, full in print. The publisher sees exactly what will be printed before signing. Earlier cases keep only the fingerprint."
**Owed.** "a new signed case format carrying the statements with their justifications and evidence, the withheld-citation count, the public page's lens section and its print form, the pre-signing preview (case-authoring, publication, public-read; BOB drafts for Bob's approval)."

### case-grammar (next free id R9, after DEC-101's R8)

- **R9 (new)** The case document's lens block, one spelling. `lens_statements:` has one row per statement in force, `{bundle, id, kind, subject, text, justification, withheld}`. `lens_citations:` has one row per printed citation, `{statement, citation}` (flat rows, as R1's blocks). `withheld` is how many of that statement's citations were not printed. The body prints them under `## The Lens This Case Was Produced Under`: the bias acknowledgement first, then each statement (its kind in plain words, its subject, its text) with its justification and printed citations beneath, and the withheld count, never which. `lensOf(fm)` reads it back; a document without the block answers null. Pure; never throws. (DEC-103) *(not yet met: T22)*

### case-authoring (next free id R40, after DEC-101's R38–R39)

- **R40 (new)** At publication every statement in the frozen manifest's effective set (`bias.biasManifest`, every page) is printed into the document (`case-grammar` R9): kind in plain words, subject, text, justification, and each citation that is public material (a public web address, or a bundle or hash this copy has published). Every other citation is withheld and only counted. With no manifest in force, the block states that none was in force. (DEC-103) *(not yet met: T22)*
- **R14 becomes:** … the bias acknowledgement; the bias manifest frozen …; **the lens statements printed whole (R40)**; … (DEC-103) *(not yet met: T22)*
- The pre-signing view: R14's unsigned document, returned by `op=publish` and checked by `op=publishpreflight`, already holds every printed byte, so the publisher can be shown exactly what will be printed. No new service. The screen is the UX stream's (H9b).

### public-read (next free id R18)

- **R3 becomes:** … The answer carries `lens`, read from the signed document (`case-grammar` R9), never live: the acknowledgement, then each statement with its justification, printed citations and withheld count, in the document's order. For a document without the block it answers `lens: null`, says this edition carries only the lens fingerprint, and gives the manifest's fingerprint. (DEC-103) *(not yet met: T22)*
- The print form is the signed document's own body section (R9's), which always prints whole.

### publication, bias

No change. The statements sit in the signed bytes and are read through `case-grammar`. `bias.biasManifest` already answers `citations` with each statement. publication does not grow.

### Services that change, and their users (P5)

- `publishedCase` (R3) gains `lens` and `what_changed`. Users: control-plane's public route; `ratification` and `filings` tests read it. Both keys are new, so no user's text changes.
- `case-grammar` gains two block readers. Users: case-authoring (writes), public-read (reads), ratification (C-41.16 reads R8).

### Layer, order, size

All L8: case-grammar (54) before public-read (56), ratification (58), case-authoring (59). case-authoring uses bias (36). Sizes as in section 4.

### Left open (not in the wording)

- **For Bob:** the "two lines on why groups declare bias": Bob gave no wording. They are left out of the requirement until he does (the UX stream's, or Bob's).
- On-screen collapse to one line per statement: a screen (the UX stream's). public-read answers the data. No case page exists in public-read today.
- BOB's: the plain words for the three kinds (scrutiny, inference, pattern), taken from the Declared Bias document's own definitions; what counts as "public material" (the reading above); whether the withheld count is per statement (drafted) or one total; `/5` or `/6` (as section 4).
- The pre-signing preview screen: H9b, left out as UX.

---

## 6. DEC-108 (a)(b)(c): the doorbell's limits, tally and sorting (H16)

**Ruled.** "(3) … those limits should be 5 and 10, and potential knockers being aware when a limit is in affect … (2) Knocks can be sorted … chronologically, by status, knocker identity (secret) or not, project affected, etc. (6) … a count-only tally of knocks it turned away (a daily total for the whole doorbell, how many times the whole-doorbell limit was reached, and when last; no addresses, fingerprints, times of individual knocks or content), shown to members as status on the inbox page, never a queue item or notification; the sender's refusal text says, truthfully, that the group can see how often its doorbell turns people away."
**Owed.** "the limits lowered to 5 and 10 with the published sentence; the knock page telling a would-be knocker when a limit holds; the inbox's … sorting; … the count-only tally as status on the inbox page and the refusal text's truthful sentence (with BOB's privacy check of the tally before it is built)."

### capture (next free ids R80, R81, after R76–R79)

- **R31 becomes:** At most **5** knocks per source … and **10** per instance in any 10 minutes … (rest unchanged). (DEC-108 (3)) *(not yet met: T22)*
- **R47 becomes:** … `stated` … ("at most 5 knocks from one source in any 10 minutes, estimated by a sliding window") … (DEC-108 (3)) *(not yet met: T22)*
- **R48 becomes:** … ("at most 10 knocks to this instance in any 10 minutes, …") … (DEC-108 (3)) *(not yet met: T22)*
- **R52 gains:** The translations of C-85.1 and C-85.2 begin by saying the material was not received, and say that the group can see how often its doorbell turns people away. They name no figure, as now. (DEC-108 (3)(6)) *(not yet met: T22)*
  - Proposed words for both rows' new sentences (BOB drafts; Bob approves): first "Your material was not received." and, in place of C-85.2's last sentence, "The group can see how often its doorbell turns people away."
- **R53 becomes:** … A refused knock writes no inbox row, stores no bytes and counts toward neither rate window; a knock refused by R47 or R48 is counted only in R80's tally. (DEC-108 (6)) *(not yet met: T22)*
- **R80 (new)** The doorbell keeps a count-only tally of knocks refused by either limit (R47, R48): a total per day for the whole doorbell, how many times the whole-doorbell limit (R48) was reached, and when last. It holds no address, fingerprint, time of an individual knock or content. `doorbellTally({viewer})` (`op=doorbelltally`) answers it to a member session only. It is status, read where the inbox is read, and never a queue item or notification. (DEC-108 (6); after BOB's privacy check) *(not yet met: T22)*
- **R32 becomes:** … `inboxList(status, {sort, dir, limit, after})` lists at most `limit` knocks, sorted by received time (the default, newest first), status, or whether a knocker secret was presented (`knocker_digest` not null), with `truncated` and `next` … (DEC-108 (2)) *(not yet met: T22)*
- **R71** (`knockAttempt`, for `sources`) is unchanged in text. It now meets the lower limits, and its refusals are counted in R80's tally like a knock's.

### Services that change, and their users (P5)

- R31's windows: `sources` (its R11, consent by secret, through R71) meets 5 and 10 too. Its requirement names no figure, so no text change. Its tests may pin 12 or 300; they must be checked at capture's merge.
- C-85 translations: they move `CATALOG_VERSION` and the census (rule 3).
- `inboxList` gains `sort`. Users: instance-setup's inbox page (`setup.mjs`:1319) and the control-plane route. Both are unchanged: the default is today's order.
- New op `doorbelltally`: op-declarations spec (member session) and an affordances `NON_ACTS` read entry in L11. Accepted red from L3 until L11.

### Layer, order, size

capture L3. capture's T22 additions are listed in section 3; it stays under 4,000.

### BOB's privacy check of the tally (to run before capture's L3 START)

Check that the day total, the reach count and "when last" cannot single out a knocker: the precision of "when last" (whole-doorbell event, not a knock, but to the minute or the hour?); how many days are kept; and whether a day with one refusal identifies anyone, given the inbox's received times. The draft decides none of these.

### Left open (not in the wording)

- **For Bob:** sorting by "project affected": a knock holds no project until it is pulled (R32's row has none). Left out until Bob says what fills it.
- **For Bob:** "knocks it turned away" is read as refused by a limit. Bob may also mean knocks refused for size or emptiness.
- The knock page telling a would-be knocker, before sending, that a limit holds: there is no knock page in `capture` (the doorbell is an API answer). The 429 answer tells the knocker. A page is the UX stream's.
- The inbox's highlighting (H16c, UX); the gatekeeper and the discard archive (H16b: a litigation hold's effect on the one-week clearing, question 4).
- The UX page's question 26 marked ruled: the UX stream's.

---

## Plain-language summaries for Bob (one line each to approve)

**DEC-89.** To open an escalation, a member must now write why the breach is worth pursuing. A member can also record, in their own words, why the group is not escalating a breach for now. That note is signed and dated, and it stays on the record even if the group escalates later. Each finding of a breach shows whether it was escalated, declined, or neither. Nothing anywhere scores how serious a breach is.

**DEC-95 (1).** When a capture finishes with nobody watching (a bulk capture, or one the assistant asked for), its grade note is kept with the capture and shown on the member's to-do item for it. Members read the same words they would have seen had they been there.

**DEC-97.** Members get a "Held captures" list of material collected but not yet vouched for or set aside, for themselves or for a project. They can sort it by age, source or project, and nothing about it ever notifies them. They can tick several and vouch for them together, set them aside with one reason (nothing is deleted), or link them to a question. Crucial documents, and documents caught in an unresolved contradiction, are marked not eligible for a batch, with the reason, before the member acts.

**DEC-101 (1)(2).** Every new edition of a published case must say what changed in it, and why, before it can be signed. The assistant may write a first draft, plainly marked as machine work. A member adopts it or rewrites it, and the record keeps that it began as a draft. Readers see the statement at the top of the new edition, and the older edition quotes it where it points to the newer one.

**DEC-103.** A published case now carries its group's declared biases in full inside the signed case: what each bias is, its reasons, and its public evidence. It says how many pieces of evidence were held back, but never which. Readers see them under "The lens this case was produced under". The publisher sees exactly what will be printed before signing. Cases signed earlier keep only the fingerprint.

**DEC-108 (a)(b)(c).** The doorbell takes at most 5 knocks from one sender and 10 in all in any 10 minutes. A sender who hits a limit is told plainly that their material was not received, and that the group can see how often its doorbell turns people away. Members see a simple count of refused knocks: a daily total, how often the whole doorbell was full, and when it last was. The count holds no addresses, times of single knocks, or content. Members can sort the inbox by time, by status, and by whether the sender used a knocker secret.

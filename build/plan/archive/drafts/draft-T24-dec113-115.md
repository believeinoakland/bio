# Draft: the folds owed by DEC-113, DEC-114 and DEC-115 (T24)

**Status** · DRAFT by a worker for BOB #95, 2026-10-02, on `tranche/T23` @ c2b7341cd8, DEC text from `origin/claude/gallant-brown-zg0wc1` @ 132418b89a (the design stream's PR #7, not yet on `main`); for BOB's review, then Bob's approval; nothing folded yet. Entries N488, N489, N490 of `plan/next.md`. Each fold restates a ruling Bob has made; only the wording is new. Nothing here is folded into `build/requirements/` yet, and by the manifest's "Parallel work" rule nothing may be until the DECs are on `main` (or Bob names them).

Conventions. A new requirement takes its module's next free id (retired ids never reused). Every new or changed line ends `*(not yet met: T24)*` and cites its DEC. Line counts are of each module's `paths` in `build/modules.json` (source only, tests excluded), measured on this branch. "Index" is the module's position in `build/modules.json`'s total order; a module uses only earlier ones (P4). Member-facing words that only the interface shows are `legacy-ui`'s and Bob's UX stream's (K633), and stay out; each section names them.

---

## 1. DEC-113: the litigation hold of assistant transcripts (N488)

**Ruled.** "once devices store assistant transcripts, recording "hold in place" stops both scheduled deletions (at the time limit and at publication), on every member's device, for assistant sessions in the threatened action's project, filled in automatically, and any other projects the member names, kept with the statement; projects may be added by a further statement at any time. A device checks for a hold before deleting and deletes nothing if it cannot check. Placing stays light and open to any member who can see the action, as built. "Hold released" is heavier: it restarts deletion, so its form states what will be deleted ("transcripts for 2 projects past the time limit will be deleted on each member's device when it is next opened. This cannot be undone."), and the administrators and whoever placed the hold are told once. While a hold is in place, members who can see a held project see a strip on it (…). Members who cannot see the project see nothing (DEC-36). While any hold is in place, the operator's wipe of the real record is refused (the test store is unaffected)."

**Owed.** "the hold statement's list of projects (the threatened action's project filled in; further projects by a later statement); the device transcript store's check for a hold before either scheduled deletion, failing closed (deleting nothing when it cannot check); "hold released" made heavier than reasoned, its form stating what will be deleted, the administrators and the placer told once; the held-project strip, shown only to members who can see the project; the control plane's wipe of a real record refused while any hold is in place (actions R52's "Nothing here suspends a purge" superseded); the UX page's question 31 marked ruled."

Terms used below. An entry's **hold** is its latest statement (actions R52, as now). A hold `in_place` **covers** the projects of every `in_place` statement on that entry since its last `released` statement. A project is **held** when any hold `in_place`, on any action, covers it.

### actions (index 68, layer 9; 2,652 lines; next free id R56)

R53 was never assigned (no history in git or `rulings.md`); it is left unused, not filled (BOB's decision 3).

- **R52 becomes:** (K899 (7), DEC-61, DEC-113; N-A19) A received entry marked pressure of kind `legal` (R48) may carry a litigation hold. A member places it through `actionHold({target, ord, hold, reason, projects?, author, viewer})` (`op=actionhold`): `hold` is `in_place` (the group is preserving what the matter may reach), with `reason` (1 to 500 characters, R22's text rule). The statement records its **projects**: the action's own project, filled in by this module and never taken from the caller, and each project id in `projects` (at most 50). A further `in_place` statement on the same entry adds its projects to the hold. Each statement, with its projects, is appended to this module's own tables (`action_holds`: the action, the entry, `hold`, `reason`, `by`, `at`, a sequence; and its projects), keyed to the action (record-core R21) and never rewritten; the latest statement for an entry is its hold. Refusals in order: `MACHINE_CANNOT_SET_HOLD` (C-117.20; an empty or machine author); `NO_TARGET`; `HOLD_RELEASE_IS_ITS_OWN_ACT` (new row; `hold` is `released`: R56 is that act); `HOLD_REFUSED` (C-117.21; `hold` not `in_place`, or the reason not as above); `HOLD_PROJECTS_REFUSED` (new row; `projects` not a list of project ids, or over 50); `NO_SUCH_BUNDLE` (absent and invisible alike); `NOT_AN_ACTION`; `HOLD_NO_LEGAL_MARK` (C-117.22; no `legal` pressure mark at that entry); `NO_SUCH_PROJECT` (`membership`'s one answer; a named project absent or one the author may not see, alike). Otherwise it answers `{ok, target, ord, hold, reason, by, at, projects}`, `projects` being those the hold now covers that the author may see. Any member who can see the action may place a hold (as built). The read (R25) shows each `legal` mark with its statements, oldest first, each with its projects the viewer may see, and its current `hold` (null while none is stated). While it is `in_place`, a hold stops the scheduled deletion of assistant transcripts on members' devices for the projects it covers (R58 is the read a device asks); and the whole-store purge of the real record is refused (`control-plane` R46). (DEC-113) *(not yet met: T24)*
  - This replaces R52's last sentence, "Nothing here suspends a purge: the hold is the group's recorded statement (DEC-61's suspension of the transcript purge is device-local and not this module's)", which DEC-113 supersedes.
- **R56 (new)** `actionHoldRelease({target, ord, reason, author, viewer})` (`op=actionholdrelease`) states `released` on an entry: the group is no longer preserving, or never needed to. Refusals in order: `MACHINE_CANNOT_SET_HOLD`; `NO_TARGET`; `HOLD_REFUSED` (the reason as R52's); `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `HOLD_NO_LEGAL_MARK`; `HOLD_ALREADY_RELEASED` (new row; the entry's hold is already `released`). An entry with no hold may be released ("never needed to"). Otherwise it appends the statement as R52 does, recording with it `restarted`: the projects R57 would have answered at that instant. It answers `{ok, target, ord, hold: "released", reason, by, at, restarted}`, `restarted` being those the author may see. The administrators and the hold's placers are told once (`queue-producers` R28). (DEC-113) *(not yet met: T24)*
- **R57 (new)** `holdReleasePreview({target, ord, viewer})` (`op=actionholdpreview`) answers what releasing that entry's hold would restart, before any member releases it. Refusals: `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `HOLD_NO_LEGAL_MARK`. It answers `{hold, restarts, out_of_view}`. `restarts` lists the projects the entry's hold covers that no other `in_place` hold covers, each one the viewer may see. `out_of_view` is `true` when such a project exists that the viewer may not see, with no id or count. An entry whose hold is not `in_place` restarts nothing. Writes nothing. (DEC-113: the release form states what will be deleted) *(not yet met: T24)*
- **R58 (new)** `projectHolds({projects, viewer})` (`op=projectholds`): `projects` is a list of 1 to 50 project ids, else `HOLD_PROJECTS_REFUSED`. For each project it answers one of:
  - `held: true`, with `since` and `recorded_by`: the `at` and `by` of the earliest `in_place` statement, among holds still `in_place`, whose projects include it;
  - `held: false`, when no hold covers it;
  - `held: null`, when the project is absent or the viewer may not see it, alike (DEC-36).

  It names no action, entry, reason or other member. It answers `held: false` only after reading every hold: a read it cannot complete is a refusal, never `false`, so a device asking it deletes nothing (the device's rule is section 4's). Writes nothing. (DEC-113: the device's check; the held-project strip) *(not yet met: T24)*
- **R59 (new)** `holdsReleased({after?, limit?, viewer})` lists every `released` statement that ended an `in_place` hold, on an action the viewer may see: the action, the entry's position, the statement's sequence, who released it, when, the reason, `placers` (each distinct member who stated an `in_place` statement in the hold it ended) and `restarted` (R56). At most 500 per page, in (action id, position, sequence) order, with `cursor` and `truncated` as R54's. It is the one read `queue-producers` uses for its release notice (its R28). Writes nothing. (DEC-113) *(not yet met: T24)*
- **R60 (new)** `anyHoldInPlace()` answers whether any hold in the instance is `in_place`, whatever the viewer: the same answer as R55's reader (it may be that reader). It answers `true` or `false`, writes nothing and never throws; when it cannot read, it answers `true`. Used by `control-plane` R46. (DEC-113) *(not yet met: T24)*
- **R36 gains:** the table of a statement's projects (Suggestions: `action_hold_projects`) is this module's, keyed by `bundle_id` and declared to purge. *(not yet met: T24)*
- R55 is unchanged in text: the doorbell archive's clearing pauses while any hold is in place (K1019), project or no project.
- Uses: `membership` for `NO_SUCH_PROJECT` and project sight (already a use).
- Suggestions: `restarted` is computed in the release's transaction. R58 serves both the strip and the device; the strip's words are the UX stream's.

### control-plane (index 83, layer 11; 3,504 lines; next free id R46)

- **R46 (new)** An `op=purge` with no `bundleId` (the whole-store form, record-core R22) in the `bio` namespace (the real record, `admission` R4) is refused 409 `PURGE_HOLD_IN_PLACE` (a new row of this module's table) while `actions.anyHoldInPlace()` (its R60) answers `true`. A failure to ask it refuses too. The check runs after R39's `confirm` gate and before the store's purge, so nothing is cleared. The refusal names no action, project or member. A purge in `scratch` (the test store) is never refused for a hold. (DEC-113) *(not yet met: T24)*
- Uses: `actions` (already a use). Order: 68 < 83.
- R39 is unchanged.

### op-declarations (index 81, layer 11; 2,399 lines; next free id R11)

- **R11 (new)** `OPS` holds a spec for each op T24 adds, each in `SESSION_OPS.member` and `SESSION_OPS.admin`, with the stamps the act lists name *(not yet met: T24)*:
  - `actionholdrelease`: mutating, classes as `actionhold`'s, `NEEDS` `contribute`, stamped `author` and `viewer` (in `ACTIONS_ACTIONS` beside `actionhold`);
  - `actionholdpreview` and `projectholds`: reads, stamped `viewer`;
  - `optionstartpreview` (section 2, if BOB takes it): a read, stamped `author` and `viewer`.

### affordances (index 76, layer 11; 3,144 lines; next free id R33)

- **R33 (new)** (DEC-113) *(not yet met: T24)*:
  - `RUNGS` assigns `terminal` to `actionholdrelease`. This is a named exception to R27, which would grade it `reasoned`: DEC-113 rules releasing heavier than reasoned. `actionhold` stays `reasoned` (K918).
  - `CONSEQUENCE_STATEMENTS` (R31) gains `actionholdrelease: {friction: "dialog", statement}`. The statement is DEC-113's: "Releasing this hold restarts deletion: assistant transcripts for these projects past the time limit will be deleted on each member's device when it is next opened. This cannot be undone." The projects are R57's answer, which the surface reads.
  - `MACHINE_REFUSALS` maps `actionholdrelease` to `MACHINE_CANNOT_SET_HOLD`, and `HOLD_REFUSED` already backs it (R19).
  - `NON_ACTS` gives `actionholdrelease` "entry-directed: keyed by (action, entry ordinal); appends a release and never rewrites the entry, its mark or an earlier statement", and gives `actionholdpreview` and `projectholds` "read: …".

  R12's totality holds with them.

### queue-producers (index 78, layer 11; 3,001 lines; next free id R28)

- **R19 becomes:** … It leaves when a member states a hold on that mark: `in_place` (`actions` R52) or `released` (`actions` R56). It offers both acts (the item's doors). … (DEC-113) *(not yet met: T24)*
- **R28 (new)** FINDINGs `litigation-hold-released`: one per release `actions.holdsReleased` answers the viewer (its R59), keyed `FINDING::litigation-hold-released::<action>::<position>::<sequence>`, going only to:
  - every administrator member (`membership` R64), or the `admin` machine credential as R14's;
  - each of the release's `placers`.

  Its subject is the action. It names who released the hold, the reason, and the restarted projects the recipient may see. Its `age` runs from the release. It is raised once and never repeated (DEC-69, DEC-70), and leaves when its recipient disposes of it. (DEC-113: "the administrators and whoever placed the hold are told once") *(not yet met: T24)*
- **R8 gains:** R28 among the items it answers. *(not yet met: T24)*
- Uses: `actions` (already a use).

### Stays out (legacy-ui, Bob's UX stream)

- The strip's words and placement (the DEC quotes them), shown from `actions` R58 only to members who can see the project.
- The release form's layout. Its sentence is affordances R33's.
- The hold form's project picker.
- The UX page's question 31 marked ruled (the design stream's file).

### The device half: no home module (section 4)

DEC-113 rules the device's behaviour "once devices store assistant transcripts". No module stores them today:
- `legacy-ui` (`civicos-ui/app.html`, `aiSessionTranscript`, ~:22786) only *reads* `localStorage` key `ai-transcript:<id>`; nothing writes or deletes it;
- `agent-worker` runs server-side and keeps no transcript (DEC-61).

So "the device transcript store's check for a hold before either scheduled deletion, failing closed" has no home. See section 4.

### Order and size

actions L9 (68) uses membership (21). control-plane (83), op-declarations (81), affordances (76) and queue-producers (78) are L11 and use actions (68). No new edge. Additions are about 150–250 lines in actions; none of the modules nears 4,000.

---

## 2. DEC-114: "Matters" (N489)

**Ruled.** "every member-facing use of what a plan addresses reads "matter" / "Matters": the plan page's section heading and add button, the options' tags, the preview when an action starts, queue items and the glossary. The approved plan-page sketch changes in that one word. "Subject" keeps its one member-facing meaning (an entity on the Subjects screen). The internal term in the requirements stays "subject" (BOB's)."

**Owed.** ""Matters"/"matter" in every member-facing string for a plan's subjects (action-plans' labels, the start preview, queue-producers' item wording, the glossary; the plan-page sketch's heading); the UX page's question 34 marked ruled."

### action-plans (index 73, layer 9; 2,609 lines; next free id R36)

- **R36 (new)** Every member-facing sentence this module answers calls what a plan addresses a "matter" ("matters"), never a "subject". This covers its refusals' translations and details, R19's checks (`says`), R32's disclosure and anything R37 answers. The internal names stay unchanged: `subject` and `subjects` as terms and keys, the codes (`PLAN_NO_SUBJECT`, `SUBJECT_*`, `OPTION_NO_SUBJECT`, `subject_removed`) and the ops (`plansubjectadd`, `plansubjectremove`). (DEC-114) *(not yet met: T24)*
- Suggestions: measured, the C-124 translations already say "matter". Two refusal details still say "subject": `values.mjs`:124 ("when_subject is a subject of the plan") and :163 ("that subject is not one the plan is about").

### queue-producers (index 78, layer 11; next free id R29, after R28 above)

- **R29 (new)** Every member-facing sentence this module answers (an item's `summary` and `detail`, and the words of its options) calls what an action plan addresses a "matter" ("matters"), never a "subject". The item key `subject` (what an item is about, `queue`'s term) and every code and kind are unchanged. (DEC-114; as R24 for "to do" and "signal") *(not yet met: T24)*
- Measured: no item says "subject" for a plan's matters today (R16's checkpoint item names none). R29 holds that line as items are added.

### affordances (optional, BOB's decision 7)

- `NON_ACTS.plansubjectadd` / `plansubjectremove` read "a member adds a subject to a plan …" (`affordances.mjs`:2672–2673). Whether R21's surface-facing text includes `NON_ACTS` reasons is BOB's to rule. If it does: **R34 (new)** those two reasons say "matter". (DEC-114) *(not yet met: T24)*

### Stays out (legacy-ui and design files)

- The plan page's heading, add button and option tags; the start preview screen; the glossary (`civicos-ui`).
- The sketch's word: `build/plan/action-design/plan-page.html` has "subject" at :119 (a sort option) and :220 (a toast). It changes only at Bob's or the design stream's word, since the sketch is Bob's approved artifact; DEC-115's "the ruling wins" already governs it.
- The UX page's question 34 (the design stream's).

### Order and size

No new edge; wording only.

---

## 3. DEC-115: which Action sketches bind the redesign (N490)

**Ruled.** "`start-and-send.html` binds the redesign's content, step order and wording (the refusal visible before anything runs, the reason asked in place, approving kept separate from recording the sending), as the plan page does; in `surfaces.html`, the tier 2 filing draft and tier 3 counsel packet panels bind likewise; the standards list and the queue items in that sheet, and `matter-page.html`, stay examples the designer may rework within the requirements. Look and layout stay Design's throughout. Where a bound sketch predates a later ruling, the ruling wins: "Matters" for a plan's subjects (DEC-114) and the filing-template rules (K921, K924 …)."

**Owed.** "the action-design HANDOFF's approval line extended to start-and-send and the two filing panels (build/plan/action-design, BOB's); the redesign's start-and-send flow and filing panels held to them; the matter page and queue items designed within the requirements (rulings since the sketches: DEC-110's queue kinds, DEC-113's hold strip, DEC-114's "Matters"); the UX page's question 35 marked ruled."

### BOB's edit to `build/plan/action-design/HANDOFF.md` (not a requirement)

Below its "**UX:** the plan-page view … is approved" line, add:

> - **UX (Bob, 2026-10-01, DEC-115):** `start-and-send.html` binds the redesign's content, step order and wording, as the plan page does: the refusal shown before anything runs, the reason asked in place, approving kept separate from recording the sending. In `surfaces.html`, the Tier 2 filing draft and the counsel packet (Tier 3) panels bind likewise. `matter-page.html`, and the standards list and the queue items of `surfaces.html`, are examples the designer may rework within the requirements. Look and layout stay Design's. Where a bound sketch predates a later ruling, the ruling wins: "Matter" for the start sketch's "Subject 1" and "subject 3" (DEC-114); every approved template version offered, the latest by default, and a filing written without one (K921, K924; the Tier 2 panel's "from the profile's template").

Plus one `rulings.md` line recording it.

### What the bound sketches need from the requirements

Measured against the current files:
- **Approving apart from recording the sending:** met. `filingapprove` (filings R6, terminal) and `filingsent` are separate acts.
- **Templates:** met. Filings R28–R31 hold K921/K924.
- **The reason asked in place:** met. `actions` R8's `premise_override`, taken by `action-plans` R18.
- **"The refusal shown before anything runs":** not met. The start sketch's step 1 shows the action's kind, addressee, legs, clock, plan link, contact and breach claim, and "Would be refused" with the reason, before the member confirms. No requirement answers that. `optionStart` (R18) refuses and writes nothing, but a surface would have to compose the action itself to show it in advance, which `affordances` R21 (no surface-composed text) and DEC-8 (a plane-sourced pre-flight) forbid. DEC-114 also names "the preview when an action starts". Inferred, BOB's to take or leave (decision 8):

### action-plans (next free id R37, after R36)

- **R37 (new)** `optionStartPreview({plan, option, kind, contact?, breach?, premise_override?, author, viewer})` (`op=optionstartpreview`) answers, at that instant and writing nothing, what `optionStart` (R18) would do with the same arguments: the action document it would compose (kind, addressee, clock entries with their bases, legs with each matter's support, `plan` and `option`, `contact`, `breach`, `premise_override`), the reminders R29 would set, and either `would_start: true` or the refusal R18 would answer, with its code and translation. It allocates no id, sets no reminder and promotes nothing. A plan or option the viewer may not see is answered as R18 answers it. (DEC-115; DEC-114's "the preview when an action starts"; DEC-8) *(not yet met: T24)*
- If taken: op-declarations R11 lists it (above), and affordances `NON_ACTS` gives it "read: …".

### Stays out

- The redesign's screens held to the sketches (legacy-ui, the UX stream).
- The matter page and the queue items designed within the requirements (the UX stream; DEC-110's kinds are queue-producers R24/R25, DEC-113's strip is actions R58).
- The UX page's question 35 (the design stream's).

---

## 4. Questions for Bob (architecture: a new module carrying product capability)

**Q1. Where the device's transcript store lives: its two scheduled deletions, and its check for a hold.**

DEC-61 and DEC-113 rule the device's behaviour, but no module stores transcripts on a device (section 1). The behaviour to be homed, at the module's interface:
- it keeps an assistant session's transcript only on the device that ran it, and never sends one to the plane;
- it deletes a transcript at the time limit, and when its project publishes (learned on next contact);
- before either deletion, it asks `actions` R58 for the transcript's project, and deletes only on `held: false`;
- on `held: true` or `held: null`, a refusal, or no answer, it deletes nothing (fail closed).

Options:
- **(A) A new module, `device-transcripts`** (layer 11, after `plane`, before `legacy-ui`). It is device-side code with no use of a plane module: it reaches the plane only through `op=airun` (the session's project) and `op=projectholds`. It carries the four requirements above, testable in isolation with a stubbed plane. `legacy-ui` would only render it (the strip, and the transcript as today).
- **(B) Inside `legacy-ui`.** The behaviour would then wait on the UX stream (K633), and a fail-closed deletion rule would sit in a module with no requirements file.
- **(C) Defer the device half** until Bob opens device storage ("once devices store"), folding only the plane half (section 1) now. An entry in `next.md` carries the rest.

**Recommendation: (C) now, with (A) as the named home when device storage is opened.** The plane half (statement projects, release, R58, the wipe refusal) protects on its own and gives the device the read it needs. Building a deletion before any store exists would test nothing real. Adding the module is Bob's.

**Q2 (rides with Q1).** DEC-61 says "with a TTL" but no length is ruled. The time limit is retention policy, under DEC-61's doctrine of "destruction on a schedule set in advance", and is needed before (A) can be built.

---

## BOB's decisions (wording, ids, edges, placement)

1. Release as its own op (`actionholdrelease`), with `actionhold` refusing `released`. The alternative is one op with a per-value rung, which `RUNGS` (per op) cannot express; grading `actionhold` itself higher would make placing heavy, against "placing stays light".
2. The rung `terminal` for the release, as a named exception to affordances R27. `attested` would add a signature nobody ruled.
3. actions ids R56–R60; R53 left unassigned, not filled.
4. A cap of 50 projects per statement and per R58 read; the cursor and page sizes of R59 follow R54's.
5. Class FINDING for `litigation-hold-released` (precedent: `export-performed`, `tension-after-publication`). It leaves on disposition.
6. Only the whole-store purge is refused; the bundle form is unchanged (see ambiguity c). The code `PURGE_HOLD_IN_PLACE` is HTTP 409.
7. Whether the two `NON_ACTS` reasons count as member-facing (affordances R34, optional).
8. Whether to take action-plans R37 (the start preview), inferred from DEC-115 and DEC-114 rather than literally owed.
9. The new codes' rows (`HOLD_RELEASE_IS_ITS_OWN_ACT`, `HOLD_PROJECTS_REFUSED`, `HOLD_ALREADY_RELEASED` in C-117; `PURGE_HOLD_IN_PLACE` in control-plane's family), and their translations, which are member-facing: BOB drafts them, and the design stream's DECs decide member wording.
10. The HANDOFF line and its `rulings.md` record (section 3).

## Ambiguities in the DEC text (quoted)

- **(a)** "the threatened action's project, filled in automatically": an action with no project is not addressed. Read here: the hold then covers only the named projects, and with none it lands covering nothing (placing stays light), its answer saying `projects: []`. The alternative is to refuse it.
- **(b)** "projects may be added by a further statement": removal is not addressed. Read here: a project leaves a hold only when the whole hold is released.
- **(c)** "the operator's wipe of the real record": read as the whole-store `op=purge` in `bio`. A bundle purge (`bundleId`, an expunge) of held material is not addressed. Refusing it too would be safer for spoliation, but could block an ordered removal. This is for Bob.
- **(d)** "its form states what will be deleted ("transcripts for 2 projects …")": the releaser may not see every covered project (DEC-36). Read here: R57 lists the visible ones and says `out_of_view` with no count. So the form cannot always state a true number. Counting the unseen would leak their existence. This is for Bob.
- **(e)** "recorded by Paula Reyes … since 2 Oct 2026" when several holds cover one project: read as the earliest still-standing `in_place` statement naming the project.
- **(f)** "deletes nothing if it cannot check": read as also covering a project the member can no longer see (R58's `held: null`). That keeps a former participant's transcripts until they clear them by hand. Telling them apart would reveal a hold on a project the member cannot see.
- **(g)** "the administrators and whoever placed the hold are told once": read as every member who stated an `in_place` statement in the ended hold.

---

## Plain-language summaries for Bob (one line each to approve)

**DEC-113.** When a member records "hold in place" on a legal threat, the action's own project is added automatically, and the member may name more projects then or later. The system answers, for any project, whether a hold covers it. A device will ask before deleting an assistant transcript, and keep it whenever the answer is yes or unknown. Releasing a hold is its own, heavier act: before confirming, the member sees which projects' transcripts will start being deleted, that this cannot be undone, and the administrators and whoever placed the hold are told once. While any hold is in place, the operator cannot wipe the real record; the test store is unaffected. Where the device keeps transcripts is a separate question for you (Q1).

**DEC-114.** Everywhere members read about what a plan addresses, the word is "matter". The system's internal names stay as they are.

**DEC-115.** The start-and-send sketch and the two filing panels now bind the redesign's content, order and wording, as the plan page does, with later rulings winning where they differ. To show "would be refused" before anything runs, the system gains a preview of starting an option that writes nothing (if BOB takes it).

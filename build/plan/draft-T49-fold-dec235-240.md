# Draft: the fold of DEC-235 to DEC-240 into module requirements (T49)

**Status** · This is a worker's draft for BOB #176, written 2026-10-14 on `tranche/T48` after PR #36's merge (`16def8207d`; main merged into the tranche at `12bf1efee6`, K3318). It has not been reviewed. Nothing in it is adopted. It proposes requirement text for next.md N1089–N1094 (K3314, K3317) and the T49 plan lines that would carry them. Every id below is the next free id in its file on `tranche/T48` at this draft, or the next id after one that `draft-T49-plan.md` already claims. Each id is to be re-checked at the fold (plan rule 1). Every new or amended line ends *(not yet met: T49)*. Choices marked **BOB's** are listed under "Doubts for BOB". Questions for Bob are listed apart.

**Sources read whole:** DECISIONS.md DEC-235 to DEC-240; next.md N1089–N1094 (and N1077, N1078, N1086, N1087, which they name); `draft-T49-plan.md`; PROCESS-MECHANICS §3; the requirement files of every module given a line below. From the design (`docs/development/ux-substrate/`, at `16def8207d`) the parts each DEC names: `screens/mock-screens.js` (`SCR.question`, `SCR.project`, `SCR.projects`, `SCR.finder`, `SCR.queue`, `SCR.capture`, `SCR.action`, `SCR.proceeding`, `SCR.imported`, `SCR['review-outside']`, `SCR.published`, `KINDS`), `screens/registry.src.py` (every screen these DECs touch), `screens/words-t48.src.py` (DEC-235 to DEC-240's words, and DEC-232's `translate.*` and `proceeding.dates.*`), `screens/mock-acts.js` (the new acts' help), `screens/page.src.html` (DEC-236's classes, `.e-step_source`), and `visual-language/civicsmith.css` and `components.css` (`.cs-band[data-band="test"]`). I also read these provider requirements for the services cited: `inquiry` R27–R28; `strength` R7–R12; `connections` R20; `membership` R38, R45, R143; `project-roster` R3–R8, R22; `actions` R18, R23–R25; `action-records` R1, R2; `action-producers` R1; `queue` R4, R14, R19, R20; `capture` R22, R46; `acquisition` R12; `public-read` R1, R3, R5; `case-inputs` R1, R5; `case-import` R4, R19; `following` R30; `plane` R50; `explore` R21; `retrieval` R6–R9; `promotion` R19, R41–R44, R54; `interface-assets` R1, R5, R7.

---

## 0. Findings that shape the fold

1. **Five of the "owed" op spellings need wording only, and no job.** `versionreject`, `versionconsider`, `versionrevert`, `versioncurrent` (basis-versions' heading reads "`op=versionaccept` … `op=versionhide`"), `projectfork` (promotion R54 already lists `projectfork` in `promotionOps`, but R41–R44's heading names no `op=`), and `readtranslate` (plane R50 says "the draft door takes `readtranslate`" without `op=`) are each declared in `op-declarations`' code and graded. Each is a BOB's edit at the fold (K3259). These edits are written in §7. Once they land, the design registry's `owed:` tags for these six can be cleared by the design stream. That is the stream's work, and goes in BOB's channel act.
2. **Two of DEC-237's reads already exist under other op names.** "`projectVisibility`" is `op=projectvisibility` (project-roster R8). "`projectOwnerArithmetic`" is `op=projectownerarith` (membership R38). The requirements below cite the op names.
3. **The recipient's acknowledgement on `review-outside` needs no provider change.** `statementack` already has the grant door (case-inputs R1, R5; control-plane R20; review R28's `act`, answered alike at both doors). N1094 lists `review`, but no `review` line is owed.
4. **action-producers needs no change.** Its R1 already words the item "no reply recorded by <date>" and never "overdue". The live "overdue" text is screens-daily's own: `screen.home.strip.overdue` ("overdue") and `screen.queue.due.overdue` ("Overdue since {date}") in `bio-plane/src/screens-daily/words.mjs`:44 and :134. That is where DEC-239's "never overdue" lands (screens-daily R28 below). screens-action's `screen.action.clock.overdue` ("overdue, as a member determined") is a member's own determination, which action-producers R1 allows, and it stays.
5. **Providers that are missing, found by reading the mock against the reads:**
   - **The Muted list's dates.** `queue_item_mutes` has `muted_at`, but `queue_state` (case-kind mutes) has no date, and `queue`'s `mute` answer (R14) carries no date. There is also no whole-case mute: R4 says "there is no wildcard", so the design's "Everything from {project}" has no provider.
   - **Open captures.** `capture_sessions` holds no member (`bio-plane/src/capture/schema.mjs`:112), so "your capture of …" cannot be answered for a member. capture R46 feeds only `machinery-producers`.
   - **The imported list's row.** `importedCases` (case-import R4) answers no "imported by {who}" and no "{recreated} of {findings}" counts.
   - **The owners' pending change.** "agreed: Ana · waiting for: Dev" is answered only inside `CONSENSUS_REQUIRED` to the member who acts (project-roster R3, R4). No read lists a pending change to a later visitor. project-roster R7 publishes nothing.
   - **An unnamed node.** `exploregraph`'s nodes are `{id, ring, id_kind}` (explore R21), with no name. So "Not yet named" cannot be told from a named node until N1086's label lands.
   - **Find's browse, its mark, a watch and a flag:** none exists (DEC-238's own finding).
6. **interface-assets is also touched (not in N1090's list).** The design classes DEC-236 names, `.e-step_source`, and the test band's `.cs-band[data-band="test"]` reach the product only through `shell.css` and `civicsmith.css` at a new `ASSETS_COMMIT` (interface-assets R1, R5, R7).
7. **screens-settings, screens-intake and explore are also touched.** DEC-236 owes screens-settings' `refusal.UPDATE_SKIP_NO_REASON`. DEC-240's D3 is on `capture` (Add), which is screens-intake's screen. DEC-236's unnamed node needs N1086's explore line.
8. **The census.** With DEC-229 to DEC-240 on `main`, of DEC-228's 21 "to draw" gaps only **S2, S3 and S4** remain undrawn (DEC-240: S3 and S4 go to the design stream's next session, each its own DEC; S2 is not drawn by any of these). legacy-ui therefore still stays in T49 under the same hard reason, now naming three gaps instead of 17.

---

## 1. N1089 · DEC-235 · the question page

### screens-inquiry (next free R23; see doubt 1 on T49-19's ids)

- **R23** (T49; N1089; DEC-235 (1), (3); DEC-32 clauses 2, 4, 5; `inquiry` R27, R28; amends R2) On `question`, each passage cited in Supports carries, beneath it, what the member answered for it. It reads `question.falls` ("If this turned out to be wrong: your answer falls"), or `question.holds`, with `{others}` filled by the passages named as holding it up. These answers are read from the inquiry's partition (its grounds). While the question cites at least one passage and its document carries no partition, the page draws **state b**:
  - `question.ask.first.title` and `question.ask.first.says`. No strength mark and no strength sentence are drawn in state b (clause 5).
  - "What each passage carries" (`question.ask.title`, explained by `question.ask.help`), with one `question.ask` choice per cited passage (`question.ask.no` / `question.ask.yes`, a radio group, none preselected).
  - For "yes", `question.ask.which`: the member ticks among the other cited passages.
  - Beneath, the read-back in R24's two shapes, then `question.rests.readback`.
  - "Save the answers" (`question.ask.save`) sends `inquiryground` (`inquiry.ground`) with a partition. In it, each passage answered "No, my answer falls" is a part of its own. The passages the member names as holding each other up are one part together. Each part's `statement` is left empty.

  Until the member saves, every passage counts as one the answer cannot do without (clause 4). Nothing on the page says otherwise. No drawn word is AND, OR, or a word `strength` R28 forbids. Refusals are drawn by their words (`interface-shell` R13). Test: a question with three cited passages and no partition draws state b with no strength mark. Saving sends the partition the answers give. Control: a question with a partition draws state a. *(not yet met: T49)*
- **R24** (T49; N1089; DEC-235 (2); DEC-32 clauses 3, 5, 6; `inquiry` R28; `strength` R11, R12; amends R2) Under Supports, once the question has a partition, "What your answer rests on" (`question.rests.title`) reads the partition back:
  - `question.rests.any`, listing each part of one passage, and each part of several passages as `question.rests.all` with `{passages}`;
  - one `question.origin.shared` line for each pair of parts `partitionindependence` (`strength.partitionIndependence`, for the reading shown, R25) answers as sharing an origin, `{passages}` and `{origin}` filled from its `shared` entries (an origin named `undetermined` is drawn as undetermined, never as independence; `complete: false` is said);
  - `question.rests.set` with who set it and when, from the grounds' `asserted_by` and `at`;
  - each later change as `question.rests.changed`: who, when, the reason, and the strength before and after, as the inquiry's Session Log records them (`inquiry` R28);
  - "Change what a passage carries…" (`question.rests.change`) reopens R23's questions in place. It sends `inquiryground` with the member's reason, since the strength is already shown (`NO_REASON`, `inquiry` R27).

  Test: a partition of one single part and one two-passage part reads back in both shapes. A shared Public Works origin draws its line. Control: `partitionindependence` answering no shared origin draws no such line. *(not yet met: T49)*
- **R25** (T49; N1089; DEC-235 (4); DEC-40; `basis-versions` R4, R8–R15; `strength` R7, R8; amends R2) **Readings.**
  - **The chooser.** Supports opens with "Reading shown" (`question.reading.shown`, explained by `.shown.help`), a `cs.choice` over the readings `basisversions` answers (record data). It defaults to the reading the screen's project stands on (`current`, read with `project`), else the first accepted one. The passages of Supports, and R24's read-back, are drawn as the chosen reading counts them.
  - **The section.** "Readings" (`question.readings.title`, explained by `.readings.help`) lists each reading that is not hidden and not rejected, with:
    - its name and description;
    - its state: `question.reading.accepted` (`state_by`, `state_at`), `question.reading.weighing` (with its reason), or `question.reading.suggested`. A reading a machine authored is drawn `mark.origin.machine` and is drawn only while the assistant is reachable (`interface-shell` R20);
    - its strength from `versionstrength` (`strength.versionStrength`) with that `version`. An accepted reading is drawn as `question.reading.strength`. Any other reading is drawn as `question.reading.whatif`, its `states` naming the reading's own state, so the answer is a what-if (`strength` R8). Two grades, never one figure;
    - `question.reading.standson` for the screen's project's CURRENT;
    - its acts: `versionaccept` "Accept", `owed:versionconsider` (`op=versionconsider`) "Weigh it…", `versionreject` "Reject…", `versionrevert` "Undo the decision…" and `versioncurrent` "Stand on this one for {project}…" (with `project`, offered only on an accepted reading, to a member joined to the project, `basis-versions` R13), and `versionhide` "Hide". Weigh it, Reject, Undo and Stand on each take the member's reason (`basis-versions` R4, R12).
  - **Rejected and hidden.** A line `question.readings.more` with the counts of rejected and hidden readings shows them on press. A hidden reading is still listed then (`basis-versions` R9: never deleted).
  - **Refusals.** Each act's refusal is drawn by its words, `VERSION_AFFIRMATION_INCOMPLETE` among them (doubt 9).

  Test: three readings drawn with their states, one a what-if, and "stands on" on the project's CURRENT. Each act sends its op with the version. Control: a machine-authored reading is not drawn while the assistant is not reachable. *(not yet met: T49)*
- **R26** (T49; N1089; DEC-235 (5); K960; `connections` R20; `basis-versions` R11) "What relies on this" (`question.relies.title`, explained by `.relies.help`) reads `backlinks` (`connections.backlinks`) for the question and draws each citing bundle as a reference (`interface-shell` R16):
  - a project as `question.relies.project`, `{reading}` the name of the reading it stands on (`basisversions` with that `project`), or no reading named when it stands on none;
  - any other bundle as `question.relies.cites`, `{kind}` its type's word.

  When the answer carries `out_of_view: true`, the section ends with `question.relies.outofview`, and nothing says what or how many. The section is not drawn when nothing is answered and `out_of_view` is not true (screens-inquiry R20). Test: a project, a question and a published case each drawn. `out_of_view: true` draws the sentence. Control: with `out_of_view` absent the sentence is not drawn. *(not yet met: T49)*

### basis-versions (no new id; BOB's edit, no job)

- The heading of R12–R15 is re-worded. Old: "**The six acts: versionAccept, versionReject, versionConsider, versionRevert, versionCurrent, versionHide({…})** (`op=versionaccept` … `op=versionhide`)". New: "… (`op=versionaccept`, `op=versionreject`, `op=versionconsider`, `op=versionrevert`, `op=versioncurrent`, `op=versionhide`)". The meaning is unchanged (K3259). DEC-235.

---

## 2. N1090 · DEC-236 · the shell's styles, the imported list, the unnamed node, `step_source`

### interface-assets (next free R8)

- **R8** (T49; N1090, N1094; DEC-236 (B204 (1), (3)), DEC-240 (N1049); amends R5, R7) `ASSETS_COMMIT` is `16def8207d` (`main` at PR #36's merge), or the later `main` commit named at the job's START if the visual language changed after. `ASSET_FILES` is read there by R1's and R7's rules. By them:
  - `shell.css` carries DEC-236's design classes: `.mk-menuwrap`, `.mk-menu`, `.mk-actwrap`, `.mk-slot`, `.mk-rowname`, `.mk-scrim`, `.mk-image`, `.mk-imgareas`, `.mk-imgarea`, `button.mk-avatar` and `.mk-grp` on one line with an ellipsis. It also carries the graph's `.e-step_source`;
  - `civicsmith.css` carries `.cs-band[data-band="test"]`.

  Test: R1's byte equality. A scan finds each named rule. *(not yet met: T49)*

### interface-shell (next free R65)

- **R65** (T49; N1090; DEC-236 (B204 (1)); K3250's rule; amends R56) The shell draws its own elements with the design's classes, never its own, and drops its own rules for them from `STYLE`:
  - the member menu: `mk-menuwrap`, `mk-menu` (a `cs-dialog` under the avatar);
  - an act with its refusal slot: `mk-actwrap`, `mk-slot`;
  - a row's name cell: `mk-rowname`;
  - the scrim behind a blocking dialog: `mk-scrim`;
  - an image at its width: `mk-image`;
  - areas marked on an image: `mk-imgareas`, `mk-imgarea`;
  - the avatar as a button: `button.mk-avatar`;
  - the group's name: `mk-grp`.

  These replace `cs-menuwrap`, `cs-menu`, `cs-actwrap`, `cs-slot`, `cs-rowname`, `cs-overlay`, `cs-image`, `cs-areas-box`, `cs-area` and `.cs-mast .grp`. `STYLE` keeps only the page's height settings (`body.cs`, `#cs-root` and the frame's scrolling; the frame's own fixed height is the design's `.cs-frame`) and motion stopped under reduced motion. R56's list of styles the shell carries is that, and nothing else. A failure with no words of its own (R61 (3)) is drawn as `shell.unread` with R39's reference. `shell.level` is not drawn (R60). Test: the composed page's `class` attributes name none of the replaced classes. `STYLE` holds no rule for them. Control: the dialog over a locked screen still blocks the screen behind it. *(not yet met: T49)*

### screens-daily (next free R24; T49-18's one line takes the next id after these, doubt 1)

- **R24** (T49; N1090, N1087; DEC-236 (B204 (2)); amends R20) `projects`' link to imported cases reads `screen.imported.list` ("Imported cases"), its card `screen.imported.list.tip`. It opens `imported` with no subject, which draws the list (`screens-publish` R22), never "Nothing is here". Test: the link's words and card. Opening it draws the list. *(not yet met: T49)*

### screens-publish (next free R22)

- **R22** (T49; N1090, N1087; DEC-236 (B204 (2)); `case-import` R4, R19, R26; amends R7) `imported` opened with no subject is "Imported cases" (Projects › Imported cases). It draws:
  - `screen.imported.list` and `screen.imported.list.says`;
  - one row per import `importedcases` answers, each a reference opening `imported` at that import, reading `screen.imported.list.row` (`{group}`, `{edition}`, `{who}`, `{date}`, `{recreated}`, `{findings}` from the import's own answer, `case-import` R26), followed by `screen.imported.list.row.part` when some findings recreated in part;
  - "Import a case" (`caseimport`).

  With no import it draws `screen.imported.list.none` and "Import a case" (state c). With a subject, R7's screen is unchanged; its path's first step is "Imported cases", opening the list. The interim rows T48 drew go. Test: two imports drawn as two rows, one with "in part". Control: no import draws the empty state, not "Nothing is here". *(not yet met: T49)*

### case-import (next free R25 is T49-8's (N933); this takes R26; BOB's choice, doubt 4)

- **R26** (T49; N1090; DEC-236 (B204 (2)); amends R4) `importedCases` also answers, for each import:
  - `imported_by`: the member who imported its latest edition, as the record holds them;
  - for that edition, `findings` (the count of findings it carries), `recreated` (those that recreated whole) and `in_part` (those that recreated in part), as `importedCase` judges each (R4).

  A count it cannot judge is `undetermined`, never zero. Test: an import with one whole, one in part and one not recreated answers 1, 1 and 3. Control: an import whose findings cannot be read answers `undetermined`. *(not yet met: T49)*

### affordances (next free R60; T49-14's lines follow, doubt 1)

- **R60** (T49; N1090; DEC-236 (B204 (3)); amends R59) The vocabulary's `connection_kinds` answers `step_source` in its own group, `step_source`, never `ment`. R59's groups are now six: `pos`, `part`, `money`, `ment`, `same` and `step_source`. A step backed by a passage is neither "Mentioned together" nor a position. Test: totality over the registry, with `step_source` in its own group. Control: no `step_source` kind is answered `ment`. *(not yet met: T49)*

### explore (next free R25; N1086's line, needed by screens-investigate R27)

- **R25** (T49; N1086, N1090; DEC-236 (B204 (3)); amends R21) `exploregraph`'s nodes each also carry `label`: the node's name as the record holds it (an entity's name, a document's title), or `null` when the record holds none. It is never the id. Each `step_source` hop also carries the attaching member (`attached_by`) and when (`at`), as the walk's hops do (N1086). Test: a named person and an entity with no name answer their label and `null`. Control: no label equals the node's id. *(not yet met: T49)*

### screens-investigate (next free R27)

- **R27** (T49; N1090, N1086; DEC-236 (B204 (3)); `explore` R25; amends R18) A graph node whose `label` is `null` is drawn as `connection.node.unnamed` ("Not yet named") with its kind's icon, its card `connection.node.unnamed.tip` with `{kind}` its kind's word (`connection.thing.*`). It is never drawn as its id. A labelled node is drawn by its label. Test: a node with no name draws "Not yet named". Control: no drawn text equals a node's id. *(not yet met: T49)*
- **R28** (T49; N1090; DEC-236 (B204 (3)); `affordances` R60; amends R18, R24) The graph draws a `step_source` step in its own class (`.e-step_source`, a bold line), with the words the design gives in `KINDS.step_source` ("Stated in a source", by key). `explore`'s "Follow" offers six groups: the five of R24 and "Stated in a source", sending its kinds by `affordances` R60's group. Test: ticking "Stated in a source" sends exactly its kinds. Control: "Mentioned together" sends no `step_source` kind. *(not yet met: T49)*

### screens-action (next free R15)

- **R15** (T49; N1090; DEC-236 (B203); amends R13) On `plan`, "Ask the assistant for options" is explained by `act.planask.does`, never `act.optionpropose.does`. Test: the help drawn is `act.planask.does`'s. *(not yet met: T49)*

### screens-settings (next free R34)

- **R34** (T49; N1090; DEC-236 (B203); amends R27, R29, R30) `updates`' "Skip this version" sent without a reason is refused in place by `refusal.UPDATE_SKIP_NO_REASON`, and the row `screen.updates.skip.noreason` goes. `screen.members.count`, `screen.connect.way.field`, `.subscription`, `.apikey`, `.later` and `screen.updates.admins` are read by key in DEC-236's words, and their inline rows go. Test: a skip with an empty reason draws the refusal's words and sends nothing. Control: no `SCREEN_WORDS` row holds those keys. *(not yet met: T49)*

---

## 3. N1091 · DEC-237 · the project page

### screens-inquiry (continuing: R27–R30)

- **R27** (T49; N1091, N1078; DEC-237 (1); `interface-shell` R66; amends R18) On `project`, "This project's work" (`project.work.title`, explained by `project.work.help`) links the project's `plan`, `timeline`, `money`, `calculation`, `proceeding` and `standard` screens as the kit's reference links, each with its card `shell.card.<kind>`. A kind the project has none of, as the screen's reads answer, is not listed. The section is not drawn when none is listed. On `question`, Concluding links "The case being prepared", "Review copies", "Publishing" and "The published case's record" (`case.links.editor`, `.review`, `.ceremony`, `.docket`; cards `shell.card.case-editor`, `.review-copy`, `.ceremony`, `.docket`) with the question's case as subject, each only where a read names such a case (R18's rule). This replaces R18's interim drawing. Test: each link and card. Control: a project with no plan lists no plan. *(not yet met: T49)*
- **R28** (T49; N1091; DEC-237 (2); `project-roster` R8, R22; `membership` R45) On `project`, "Who can find it" (`project.visibility.title`):
  - It reads `projectvisibility` and draws the setting as `project.visibility.hidden` or `.discoverable`.
  - Its history follows, newest first, each record as `project.visibility.history` (the change, who, when, the reason), ending with `project.visibility.started`.
  - "Change who can find it…" (`projectvisibilityset`, reasoned) is offered to an owner only.
  - A refusal (`PROJECT_SCOPE_KEEPS_HIDDEN` for a member's own project or one kept for counsel; `PROJECT_VISIBILITY_NOT_THE_OWNER`) is drawn by its words.

  Test: a project made findable draws its history. An owner sees the act. Control: a member who is not an owner does not see it. *(not yet met: T49)*
- **R29** (T49; N1091; DEC-237 (3); `project-roster` R3, R4, R7, R32; `membership` R35, R36, R38; `promotion` R41–R44; amends R1) On `project`, Members draws one row per participant, with role (`project.member.owner` / `.member`) and date (`project.member.since` / `.joined`). The row's acts are:
  - for an owner's own row, "Stand down as owner…" (`projectownerremove`, reasoned);
  - on a member's row, "Make an owner" (`projectowneradd`) and "Remove from the project…" (`projectremove`, its reason asked and shown, not refused when empty, as `membership` R36 has it), each to an owner.

  Each change waiting on owners (`projectownervotes`, `project-roster` R32) is drawn as `project.owners.pending` or `.pending.remove`. To an owner who has not agreed, it offers `project.owners.agree` (the same act, sent by her). The rule is one line, `project.owners.rule`. A `CONSENSUS_REQUIRED` answer redraws the pending line from its `have` and `awaiting`. Beneath the rows: "Invite a member to the project" (`projectinvite`), "Join" (`projectjoin`, as R1), "Ask to leave this project" (`projectleave`), and "Start a project from this one…" (`projectfork`, with the new title and the visibility, hidden preselected, opening the new project on success). Test: three owners with one change agreed by one draw "waiting for" the other two. Control: a non-owner sees no owner act. *(not yet met: T49)*
- **R30** (T49; N1091; DEC-237 (4); K2578, K2782; `project-roster` R5, R22) **State c.** An administrator opening a hidden project at its existence only, whose owners are all inactive, sees:
  - `project.rescue.title` with the date, and `project.rescue.says` with `{owners}`;
  - "Why", explained;
  - "Become its owner" (`projectownerrescue`, reasoned, naming herself);
  - `project.rescue.own`.

  Nothing else of the project is drawn. `PROJECT_SCOPE_OWN` and `OWNERS_ARE_ACTIVE` are drawn by their words. Test: the rescue drawn at existence. Control: a project whose scope is `own` is refused and drawn by its words. *(not yet met: T49)*

### screens-daily (continuing)

- **R25** (T49; N1091; DEC-237 (projects); `promotion` R19; amends R1, R10, R23) "Start a project", on `projects` and on Home's blank start, opens on press a form:
  - "What it is about" (`project.start.title`, help `.title.help`);
  - "Who can find it": `project.visibility.start.hidden` (preselected) or `.start.discoverable`;
  - `project.visibility.start.later`;
  - "Start the project" (`project.start.go`).

  The last sends `promote` with the title and the chosen `visibility` (absent meaning hidden), and opens the new project on success. `PROJECT_VISIBILITY_NO_OWNER` and `NAME_TAKEN` are drawn by their words. Test: choosing findable sends `visibility: "discoverable"`. Control: an untouched form sends hidden. *(not yet met: T49)*

### project-roster (T49-2 takes R29–R31; this takes R32; BOB's choice, doubt 5)

- **R32** (T49; N1091; DEC-237 (3); amends R7) `projectOwnerVotes({projectId, viewer})` (`op=projectownervotes`, a read) answers, to a viewer at `FULL` of the project, each owner change that has votes counted and is not yet carried. Each is `{change: "add" | "remove", target, proposed_by, proposed_at, agreed, awaiting}`, `agreed` and `awaiting` as R3's and R4's `CONSENSUS_REQUIRED` answer them, members named by handle (the founder by `membership.founderHandle()`, R31). Any other viewer gets the absent answer. It writes nothing and never throws. Test: a two-of-three change answers one agreed and one awaiting. Control: a viewer at existence only gets the absent answer. *(not yet met: T49)*

### promotion (no new id; BOB's edit, no job)

- The heading of R41–R44 is re-worded. Old: "**forkProject({projectId, newId, title, by, viewer, visibility}) → …** (N16, K68; moved unchanged from the store)". New: "… (`op=projectfork`; N16, K68; moved unchanged from the store)". This agrees with R54's map, and the meaning is unchanged. DEC-237.

### interface-shell (continuing)

- **R66** (T49; N1078, N1091; DEC-237 (1), DEC-234; amends R27, R47) `REF_SCREENS` gains the kinds `plan`, `timeline`, `money`, `calculation`, `case-editor`, `review-copy`, `ceremony` and `docket`, each card its `shell.card.<kind>` word. `proceeding` and `standard` read `shell.card.proceeding` and `.standard`. Test: each kind opens its screen with its card. Control: an unknown kind is still refused. *(not yet met: T49)*

---

## 4. N1092 · DEC-238 · Find's browse (provisional on S23 for the watch and the flag)

The watch and the flag wait on Bob's answer to S23 (who sees a watch, who sees a flag). It was asked by the design stream with DEC-238. The provisional answer: a watch is seen only by its member, and a flag by the group. Every line below that depends on it is marked **provisional (S23)**. The browse, the mark read and the result kinds do not depend on S23.

### retrieval (next free R79)

- **R79** (T49; N1092; DEC-238 (F1); DEC-164 (1)) `browse({kind, since, viewer, limit, after})` (`op=browse`, a read) answers every bundle the viewer may see, newest first by its last promotion.
  - **`kind`** is one of `all` (the default), `document`, `question`, `action`, `entity` (people and organizations) and `plan`. Each is mapped to the record's types at START (BOB's); an unknown kind is refused `UNKNOWN_KIND`.
  - **`since`**, an instant, keeps only bundles promoted after it.
  - **Rows** are `{id, type, kind, title, last_promoted, project?}`. The answer carries `cursor` and `truncated`.
  - **Sight.** What the viewer may not see is left out unannounced and uncounted, as `search` gates it.

  It runs through `query-language` like every read of this module, writes nothing and never throws. Test: three bundles of two kinds answer newest first. `kind: "question"` answers only the question. Control: a bundle the viewer may not see is not answered or counted. *(not yet met: T49)*

### membership (T49-1 takes R144; this takes R145)

- **R145** (T49; N1092; DEC-238 (F1); amends R143) `lookedSinceMark({by})` (`op=lookedsincemark`, a read) answers `{since}`, the member's current mark (R143), or `null`. It records nothing: two calls in a row answer the same instant. R143's sight holds (her own mark only; any other `by` answers `{since: null}`). Test: after `lookedSince`, two reads of the mark answer the same instant. Control: the read does not move what the next `lookedSince` answers. *(not yet met: T49)*

### watches (a new module, BOB's placement, doubt 2; provisional (S23))

Proposed purpose: a member's watch of an item the record holds, and a flag on an item asking the group for a second look. Proposed placement: layer 2 after `project-roster`, using `record-core` and `membership` only, so `retrieval` and `queue-producers` may read it.

- **R1** (T49; N1092; DEC-238) `watchItem({item, unwatch, by, viewer})` (`op=watchitem`): records or removes one (member, item) watch. Refusals: a machine or absent `by`, `MACHINE_CANNOT_WATCH`; an item the viewer may not see, or that does not exist, `NO_SUCH_BUNDLE` alike. It answers `{watched, at}`, writes no bundle, and moves no other member's list. **Provisional (S23):** a watch is seen by no one but its member. *(not yet met: T49)*
- **R2** (T49; N1092) `watchesOf({viewer, after, limit})` (`op=watches`, a read) answers the viewer's own watches, newest first, `{item, at}`, leaving out an item she can no longer see. It never answers another member's watches. *(not yet met: T49)*
- **R3** (T49; N1092; DEC-238) `secondLook({item, note, by, viewer})` (`op=secondlook`): flags an item for a second look, with a note of 1–500 characters (`SECOND_LOOK_NO_NOTE` otherwise). The item's sight is as R1's. The flag records who flagged it, when and the note, appended. `secondLookClear({flag, reason, by, viewer})` (`op=secondlookclear`, reasoned) clears it, by any member who may see the item, recorded and never deleted. **Provisional (S23):** a flag is seen by every member who may see its item. *(not yet met: T49)*
- **R4** (T49; N1092) `secondLooksOf({viewer, after, limit})` (`op=secondlooks`, a read) answers the standing flags on items the viewer may see, newest first, each `{flag, item, by, at, note}`. *(not yet met: T49)*
- **R5** (T49; N1092) The two tables are declared to `record-core`'s purge (watches whole-store; flags keyed by item). No place is named. *(not yet met: T49)*

### queue-producers (next free R41; provisional (S23))

- **R41** (T49; N1092; DEC-238; DEC-10) A FINDING `watched-item-changed` is raised to a member for each item she watches (`watches.watchesOf`) that was promoted after her watch was set and after any earlier such item for it. It is raised once per change (DEC-10), its subject the item, and it is personal (muted and dismissed as R14's personal half). Test: a watched document revised raises one item. Control: an unwatched one raises none. *(not yet met: T49)*

### screens-daily (continuing)

- **R26** (T49; N1092; DEC-238 (F1); DEC-164 (1); amends R4) `finder` with no words is the browse (state c):
  - The box reads `find.query.placeholder`.
  - "Show" (`find.kind.label`: `find.kind.all`, `.document`, `.question`, `.action`, `.entity`, `.plan`) and "Only" (`find.state.label`: `find.state.any`, `.new`, `.secondlook`, `.watched`) are drawn by `cs.choice`.
  - Then `find.browse.says` and `find.browse.new.means`.
  - "Anything" reads `browse` with the kind.
  - "New since you last looked" reads `lookedsincemark` (`membership` R145) once per visit and passes its `since`. With `since: null` the choice is not offered. Find never sends `lookedsince`.
  - "Watched by you" reads `watches`, and "Flagged for a second look" reads `secondlooks`, each filtered to the kind.
  - Rows carry `find.row.new`, `find.row.watched` and `find.row.secondlook` (who, when, the note as data) where they apply.
  - The hold strip offers "Watch" (`watchitem`) and "Flag for a second look…" (`secondlook`, its note asked) for what is picked, besides R4's acts.

  Test: an empty box draws the browse. "Questions" sends `kind: "question"`. Control: no request carries `op=lookedsince`. **The watch and flag parts are provisional (S23).** *(not yet met: T49)*
- **R27** (T49; N1092; DEC-238 (F2); amends R4) Every result row of `finder`, searched or browsed, names its kind first: `find.row.kind.document`, `.passage`, `.person`, `.organization`, `.question`, `.action`, `.plan`. A passage is its own row with the matched words marked, and a person or organization is a reference opening `person`. Test: a search answering a document, a passage and a person draws three rows, each with its kind. Control: no row is drawn without a kind. *(not yet met: T49)*

---

## 5. N1093 · DEC-239 · the action page

### screens-action (continuing: R16–R18)

- **R16** (T49; N1093; DEC-239 (1); `actions` R18, R25; `action-records` R1; amends R5) On `action`, "The law it goes under" (`law.title`, explained by `law.help`):
  - **The law chosen.** It draws the action's `governing_laws` from `action`: each law by level and citation with its window as `action` answers it, then `law.stated` (who, when). An undetermined list is drawn as `law.undetermined`.
  - **Change the law.** "Change the law…" (`law.change`) sends `actionlaws` with the laws chosen from the laws the group's places name.
  - **The proposals.** "Proposed, not chosen:" (`law.proposed`) lists each of `governing_laws_proposals` as `law.proposal.not` (who, when).
  - **Propose.** "Propose another law…" (`law.propose`) sends `actionlawspropose`.

  Refusals are drawn by their words. Test: a stated law and one proposal drawn apart. Control: a proposal is never drawn as the law. *(not yet met: T49)*
- **R17** (T49; N1093; DEC-239 (2); `actions` R23–R25; `action-records` R2) On `action`, "Its risk" (`risk.title`, explained by `risk.help`):
  - **The tier.** It draws `risk_tier` as `risk.tier` with the tier's own words `risk.tier.1`, `.2`, `.3`, or `risk.tier.undetermined`, read by key in place of `RISK_TIERS`' English.
  - **Its history.** The latest history entry is drawn as `risk.set` (who, when, the reason, the prior tier's words).
  - **Revise.** "Revise, with a reason…" (`risk.revise`) sends `actionrisktier` with the tier and the reason.
  - **The proposals.** Only while the assistant is reachable, `risk_tier_proposals` that are machine work are drawn under "Proposed, not set:" (`risk.proposed`), each `risk.proposal` with `risk.proposal.not`, `mark.origin.machine`. A member's proposal is drawn there whether or not the assistant is reachable.

  `RISK_TIER_UNCHANGED` and the others are drawn by their words. Test: tier 2 with its history drawn by key. Control: a machine proposal is not drawn while the assistant is unreachable. *(not yet met: T49)*
- **R18** (T49; N1093; DEC-239 (3); v0.2 rule 6; `action-records` R18; amends R5) **State b.** When a reply owed by the addressee has its due date passed with no reply recorded (the action's `lifecycle` `passed_unanswered`, or its clock entry pending past its date), `action` draws:
  - `action.noreply.title` with `{date}`, and `action.noreply.says`;
  - "Open a question from this" (`action.noreply.question`, help `.question.help`). It sends `actioninquiry` with the question the member writes (the field empty, never pre-filled) and opens the new question.

  The screen never draws "overdue" for a missing reply. Test: a passed date draws state b and the act. Control: a reply recorded draws no state b. *(not yet met: T49)*

### action-records (T49-10 takes R17; this takes R18; BOB's placement, doubt 3)

- **R18** (T49; N1093; DEC-239 (3); v0.2 rule 6) `actionInquiry({action, question, author, viewer})` (`op=actioninquiry`) opens a question with the action as its reference.
  - **Refusals, in order:** `MACHINE_CANNOT_OPEN_QUESTION` (an empty or machine author); `NO_TARGET`; `NO_SUCH_BUNDLE` (an action the viewer may not see answers the same); `NOT_AN_ACTION`; then `promotion`'s refusals for an inquiry's creation, its title the member's `question`, never pre-filled or drafted.
  - **What it writes.** One new inquiry `open`, through `promotion.promote`, its `references[]` carrying the action under `relates_to`. It is never `cites`, so the action is never a leg and never evidence. When the action has a project, the inquiry carries it as its `setIn`, and the project draws on it (`citation`'s draw). The action's own document does not change.
  - **The answer** is `{inquiry, action, project}`.

  Test: an action in a project opens a question that cites no leg and refers to the action. Control: a machine author is refused and nothing is written. *(not yet met: T49)*

### screens-daily (continuing)

- **R28** (T49; N1093; DEC-239 ("everywhere"); `action-producers` R1; amends R2, R17) A reply owed by another side whose date has passed is drawn as "no reply recorded" (`action.noreply.title` with `{date}` in a row, and in Home's strip as a reading's label "no reply recorded"), never "overdue". The rows `screen.home.strip.overdue` and `screen.queue.due.overdue` go. The strip counts no item as overdue. **Provisional:** how a group's own passed date is drawn is owed by the design stream, because DEC-239 words only the missing reply (doubt 8). Until it is drawn, such a date is drawn with its date and no word. Test: Home and the queue draw a passed reply as "no reply recorded". Control: no drawn text contains "overdue" except a member's own determination (`screens-action`'s clock status). *(not yet met: T49)*

### action-producers

No change (finding 4). Its R1 already words the item and never says "overdue".

---

## 6. N1094 · DEC-240 · the small batch

### screens-daily (continuing)

- **R29** (T49; N1094; DEC-240 (Q2); `queue` R14, R19, R20, R55; amends R2) At the queue's foot, "Muted" (`queue.muted.title`, explained by `queue.muted.help`) lists what `queue`'s `mute` answers for the member:
  - each case's muted kinds, as `queue.muted.kind` (`{kind}` its word, `{project}` the case's title);
  - each muted item;
  - each with `queue.muted.by` and its date (`queue` R55).

  "Turn back on" (`queue.muted.unmute`) sends `queuemute` with `unmute` and that case and kind, or that item. A whole case muted (`queue` R55) reads `queue.muted.case`. The section is not drawn when nothing is muted. Test: a muted kind and a muted item drawn, each turned back on. Control: nothing muted draws no section. *(not yet met: T49)*

### queue (next free R55; BOB's choice, doubt 6)

- **R55** (T49; N1094; DEC-240 (Q2); amends R14, R19, R20) Each mute records when it was made. `mute` answers `case_kinds` as `{case, kind, at}` and `items` as `{item, at}`, `at` the instant the mute was recorded. A mute recorded before this change answers `at: null`, drawn with no date, never back-filled. **Provisional, BOB's choice:** the case form also takes `kinds: "*"`, muting every mutable kind of the case, now and later, as one mute, answered `{case, all: true, at}`, still never an OBLIGATION (R31). Without it, "Everything from {project}" is not drawn. Test: a mute made now answers its instant. Control: a pre-existing mute answers `at: null`. *(not yet met: T49)*

### screens-publish (continuing)

- **R23** (T49; N1094; DEC-240 (P1); `public-read` R1, R3; amends R6, R19) On `published`, "Check a file you hold" (`published.check.title`, explained by `published.check.help`):
  - a field "Its SHA-256" (`published.check.field`, help `.field.help`), 64 hexadecimal characters, case-folded;
  - "Check it" (`published.check.go`), which sends `verify` with it as a public op with no `Authorization` header.

  A match in this edition reads `published.check.yes`, `{n}` and `{finding}` from `publishedcase` read by that `sha256`. No match reads `published.check.no`. No file is read or sent: the page takes the fingerprint only. R19's "the Verify any hash panel is not drawn" is retired. Test: a pinned evidence hash draws the finding. Control: an unknown hash draws `.no`, and no request carries anything but the hash. *(not yet met: T49)*
- **R24** (T49; N1094; DEC-240 (C2); `case-inputs` R1, R5; `review` R15, R28; amends R17) On `review-outside`, "What the case says it does not cover" (`review.statement.title`, explained by `review.statement.help`) draws the group's statement from `reviewcopy`. Beneath it are "Your note" (`review.statement.note`, help `.note.help`, required) and "Acknowledge it" (`review.statement.ack`). That act sends `statementack` with the draft, the note as `reason`, and the grant's secret through the grant door as `reviewcomment` sends it, never in an address. `STATEMENT_ACK_NO_REASON` and the dead answer are drawn by their words, and the note is kept. A copy whose statement is absent draws no section. Test: the acknowledgement sends the note and the secret in the body only. Control: an empty note is refused and nothing is sent. *(not yet met: T49)*

### capture (next free R91)

- **R91** (T49; N1094; DEC-240 (D3); amends R22, R46) A capture session also records the member who started it (`by`), when one did. `openCaptures({viewer})` (`op=opencaptures`, a read) answers the viewer's own live sessions (R46's rule at the server's instant), newest first. Each row is `{session, locator, title, waiting, created}`: `title` the primary's title as captured, else its locator; `waiting` the count of supporting files the session still lacks. A session with no member, or another member's, is never answered. It writes nothing and never throws. Test: a member's interrupted capture answers its waiting count. Control: another member's session is not answered. *(not yet met: T49)*

### acquisition (next free R46)

- **R46** (T49; N1094; `capture` R91; amends R12) A walk that saves a session passes the acting member (`sessMember`, when a member session acts) to `capture.saveCaptureSession` as `by`. A continuation (`continue`) is unchanged. Test: a member's walk saves her as `by`. Control: an unattended walk saves none. *(not yet met: T49)*

### screens-intake (next free R21)

- **R21** (T49; N1094; DEC-240 (D3); `capture` R91; `acquisition` R12; amends R1) On `capture`'s "From an address" tab, each session `opencaptures` answers is drawn as `capture.unfinished` (`{title}`, `{n}` its `waiting`, `{ago}` from `created`) with "Finish it" (`capture.finish`, help `.finish.help`). That act sends `acquire` with `continue` the session. Nothing is drawn when none is open. Test: an open session draws the line, and "Finish it" sends `continue`. Control: no open session draws nothing. *(not yet met: T49)*

### screens-inquiry (continuing)

- **R31** (T49; N1094; DEC-240 (N670); DEC-232; `plane` R50) On `question`, "Read in my language" (`translate.read`) sends `readtranslate` with `subject` `{kind: "question", id, project}`. The answer is drawn in place, labeled `translate.label` (`{language}` the original's), explained by `translate.label.help`, with "Show the original" (`translate.original`) and back (`translate.back`). Nothing is saved. No control is drawn on a document or a passage (R50's kinds only). `LANGUAGE_NOT_SET` and the AI refusals are drawn by their words. The control is drawn only while the assistant is reachable (`interface-shell` R20). This needs only plane R50, which is built. The offer of a group's translation to Civicsmith (N670's R88) is not touched and stays with Bob (K3190). Test: the act sends the question as subject, and the original returns by one press. Control: no control on a passage. *(not yet met: T49)*

### screens-investigate (continuing)

- **R29** (T49; N1094; DEC-240 (proceeding); DEC-232; `following` R30; amends R6) On `proceeding`, "Dates" (`proceeding.dates.title`, explained by `.dates.help`):
  - It reads `proceedingdates` and draws `proceeding.dates.stage`.
  - It draws two lanes, `proceeding.dates.lane.proceeding` and `.lane.group`, never interleaved, each date by `cs.date`.
  - With no dates it draws `proceeding.dates.none`.
  - Nothing is drawn as late.

  Test: two lanes over a fixture. Control: a body's own deadline is never in the group's lane. *(not yet met: T49)*

### interface-shell (continuing)

- **R67** (T49; N1094, N1049; DEC-240 (N1049); `interface-assets` R8; amends R53, R58) The test-instance band is the design's `.cs-band[data-band="test"]`, drawn with the machine icon, `instance.test.band` ("Test Civicsmith") and then `instance.test.notice`. `.cs-testband` and its rule in `STYLE` go. R53's span of the frame and R58's first-paint rule are unchanged. Test: the served page's band carries `data-band="test"` and both words. Control: no `cs-testband` class is drawn. *(not yet met: T49)*

### plane (no new id; BOB's edit, no job)

- R50's first line is re-worded. Old: "The draft door takes `readtranslate`, `{subject: …}`". New: "The draft door takes `readtranslate` (`op=readtranslate`), `{subject: …}`". The meaning is unchanged (op-declarations already declares it, control-plane R90 routes it). DEC-240.

### review

No change (finding 3).

---

## 7. Common to all six DECs

### setup-words (next free R9; overlaps T49-15)

- **R9** (T49; DEC-235 to DEC-240, DEC-229, DEC-230; amends R8) `WORD_ROWS` is `words.json` as it stands on `main` at PR #36's merge, and `WORDS_COMMIT` is `"16def8207d"`: 2,324 rows by R1's rule, the protected count as read there. This carries every key the lines above name. Test: equal word by word. *(not yet met: T49)*

### affordances (continuing; overlaps T49-14)

- **R61** (T49; DEC-235 to DEC-240; amends R57) `ACT_HELP` is re-generated from `mock-acts.js` at PR #36's merge (`16def8207d`) by R48's reading. The texts the file keys `owed_<op>` (`versionconsider`, `versionreject`, `versionrevert`, `versioncurrent`, `projectfork`, `readtranslate`, `actioninquiry`, `watchitem`, `secondlook`) are held under those ops once `op-declarations` declares or spells them (§0 finding 1), and under their `owed_` keys until then. `queuemute`'s text is the re-worded one. Test: equality with the file. *(not yet met: T49)*

### op-declarations (T49-16 takes R71, R72; this takes R73; subject to the split before T49-16, M-T49-1)

- **R73** (T49; N1091 to N1094) The specs of the ops above, each in its owner's family:
  - **Reads for a member's session** (`classes` `admin`, `member`; `machineClasses: []`; not mutating; `NEEDS` `null`): `browse` (`retrieval` R79), `lookedsincemark` (`membership` R145), `opencaptures` (`capture` R91), and `projectownervotes` (`project-roster` R32, when adopted).
  - **Acts for a member's session:** `actioninquiry` (`action-records` R18; mutating; `by` and `author` stamped).
  - **Provisional (S23):** `watchitem`, `watches`, `secondlook`, `secondlookclear`, `secondlooks` (`watches` R1–R4).

  Each new op is named in `ACT_HELP_ABSENT` (R34) until `affordances` holds its text. Controls: an `ai` credential is refused each act. *(not yet met: T49)*

### op-grades (T49-13's grades take the next id after R42; this takes the one after, numbered at the fold)

- **R4x** (T49; N1092, N1093) Grades:
  - `actioninquiry`: reversible, as `promote`'s question creation is;
  - `browse`, `lookedsincemark`, `opencaptures` and `projectownervotes`: reads, `NON_ACTS` "read: …";
  - **provisional (S23):** `watchitem`, `RUNG_ABSENT` ground `caller-owned`, as `queuemute` (personal state, asking no reason); `secondlook`, reasoned (its note is its reason); `secondlookclear`, reasoned; `watches` and `secondlooks`, reads.

  The existing grades of the six spelled ops are unchanged. *(not yet met: T49)*

### control-plane and plane (overlap T49-20, T49-21)

- **control-plane R98** (T49; after T49-20's R96, R97) The ops in op-declarations R73 are routed through their owners' maps and admitted as R73 declares them. `opencaptures`, `lookedsincemark` and `watches` answer the session's own member only (`viewer` stamped, never a body field). *(not yet met: T49)*
- **plane**: T49-21's "declares and wires the five new ops" also wires these. A line is needed only if a new owner (`watches`) or a new ops map is spread. The fold confirms.

---

## 8. Overlaps with `draft-T49-plan.md`

| T49 entry | overlap | proposal |
|---|---|---|
| T49-19 screens-inquiry (N1077, DEC-229, "R23 onward, ids at the fold") | the same module, the same L11 job. Its document-page lines are "text to write" | DEC-235's R23–R26, DEC-237's R27–R30 and DEC-240's R31 join T49-19's job. T49-19's own lines take R32 onward (doubt 1). Default model? T49-19 grows from one screen to three (doubt 7) |
| T49-18 screens-daily (one line, the unnamed founder) | the same module and job | R24–R29 join T49-18. Its own line takes R30 (doubt 1). It is no longer "one line": doubt 7 |
| T49-15 setup-words (re-takes `words.json` for DEC-229/230) | the same act at a later commit | one requirement, R9, at `16def8207d` (2,324 rows), covering DEC-229 to DEC-240 |
| T49-14 affordances (help for five N933/N1072 ops) | the same regeneration | one `ACT_HELP` regeneration at PR #36 (R61) plus R60. T49-14's five ops are held under `owed_` keys or their ops as declared |
| T49-13 op-grades, T49-16 op-declarations, T49-20 control-plane, T49-21 plane | the same jobs, new ops added | add §7's ops to each entry. op-declarations is past ~4,000 lines (M-T49-1), so the split comes first and R73 may land in the split-off module |
| T49-2 project-roster (R29–R31) | the same module and job (L2) | R32 joins T49-2 if BOB adopts it (doubt 5) |
| T49-1 membership (R144) | the same module and job (L2) | R145 joins T49-1. membership is measured at 3,826 lines, and R145 is a few lines |
| T49-8 case-import (R25) | the same module and job (L8) | R26 joins T49-8 (doubt 4) |
| T49-10 action-records (R17) | the same module and job (L9) | R18 joins T49-10 (doubt 3) |
| Legacy census row and "Left out": "the 17 undrawn census gaps …", "the 'read in my language' control … not drawn", "N1049 (the band's look) … to draw" | drawn now by DEC-235 to DEC-240 | BOB re-words the census row to "S2–S4 undrawn". The three Left-out rows are removed, and their entries are placed as above. N670's R88 stays Left out (Bob's) |
| N1078 (interface-shell `REF_SCREENS` kinds; not in the draft plan) | needed by DEC-237's links, and now keyed | interface-shell R66 places it. interface-shell has no T49 entry yet, so a new L11 entry is needed (§9) |
| N1086 (explore labels; not in the draft plan) | needed by DEC-236's unnamed node | explore R25 places it in L5, which has no job today (§9) |

No other T49 entry covers this work.

---

## 9. T49 plan entry lines, per module

| layer | module · what it applies · ids | count |
|---|---|---|
| L2 | membership · (N1092, DEC-238) the mark read without moving it, `lookedsincemark` · R145 (joins T49-1) | 1 |
| L2 | project-roster · (N1091, DEC-237) the owners' pending changes, `projectownervotes` · R32 (joins T49-2; BOB's choice) | 1 |
| L2 (new) | watches · (N1092, DEC-238) a member's watch and a flag for a second look · R1–R5 (new module, default model; provisional S23; BOB's placement) | 5 |
| L3 | capture · (N1094, DEC-240 D3) a session's member and `opencaptures` · R91 | 1 |
| L3 | acquisition · (N1094) the walk passes the member to the session · R46 | 1 |
| L5 | retrieval · (N1092, DEC-238 F1) `browse` by kind, newest first, `since` · R79 | 1 |
| L5 | explore · (N1086, N1090, DEC-236) node `label` and a step_source hop's `attached_by`, `at` · R25 | 1 |
| L8 | case-import · (N1090, DEC-236) `imported_by` and the recreated counts on the list · R26 (joins T49-8; BOB's choice) | 1 |
| L9 | action-records · (N1093, DEC-239) `actioninquiry` · R18 (joins T49-10) | 1 |
| L11 | op-grades · grades of §7's ops · R4x (joins T49-13) | 1 |
| L11 | affordances · (N1090) `step_source`'s own group; `ACT_HELP` at PR #36 · R60, R61 (joins T49-14) | 2 |
| L11 | queue-producers · (N1092) `watched-item-changed` · R41 (provisional S23) | 1 |
| L11 | queue · (N1094, DEC-240 Q2) a mute's date (and the whole-case mute, BOB's) · R55 | 1 |
| L11 | setup-words · (DEC-229 to DEC-240) `WORD_ROWS` at `16def8207d` · R9 (replaces T49-15's text) | 1 |
| L11 | op-declarations · specs of §7's ops · R73 (joins T49-16, after the split) | 1 |
| L11 | interface-assets · (N1090, N1094) `ASSETS_COMMIT` `16def8207d`: DEC-236's classes, `.e-step_source`, the test band · R8 | 1 |
| L11 | interface-shell · (N1090, N1091/N1078, N1094/N1049) design classes for the shell's own elements, `shell.unread`; `REF_SCREENS` kinds; the design's test band · R65–R67 | 3 |
| L11 | screens-settings · (N1090, DEC-236 B203) `refusal.UPDATE_SKIP_NO_REASON`; B203 keys · R34 | 1 |
| L11 | screens-intake · (N1094, DEC-240 D3) "Unfinished" and "Finish it" · R21 | 1 |
| L11 | screens-daily · (N1090–N1094) the imported link; Start a project with visibility; Find's browse and result kinds; "no reply recorded"; the Muted list · R24–R29 (joins T49-18) | 6 |
| L11 | screens-inquiry · (N1089, N1091, N1094) the question page (passages, read-back, readings, what relies); the project page (work links, visibility, members, rescue); read in my language · R23–R31 (joins T49-19) | 9 |
| L11 | screens-investigate · (N1090, N1094) unnamed node; six Follow groups; the proceeding's dates · R27–R29 | 3 |
| L11 | screens-publish · (N1090, N1094) the imported list; check a file you hold; the reader's acknowledgement · R22–R24 | 3 |
| L11 | screens-action · (N1090, N1093) `act.planask.does`; the law, the risk, no reply recorded with a question · R15–R18 | 4 |
| L11 | control-plane · routes for §7's ops · R98 (joins T49-20) | 1 |
| L11 | plane · wiring, if a new map is spread (joins T49-21) | 0–1 |
| — | BOB's edits, no job: basis-versions' heading (six `op=`), promotion's fork heading (`op=projectfork`), plane R50 (`op=readtranslate`), the census rows | 0 |

**Total proposed:** 52 ids across 25 modules (5 of them in a proposed new module, and one op-grades line numbered at the fold), plus three wording edits. New jobs beyond the draft plan: capture, acquisition (L3), retrieval, explore (L5), watches (L2, new), queue-producers, queue, interface-assets, interface-shell, screens-settings, screens-intake, screens-investigate, screens-publish, screens-action (L11). The rest join existing T49 entries. L11 merge order follows `modules.json`. setup-words and interface-assets merge before any screen that reads their keys or classes.

---

## 10. Open points (kept out of a requirement, or marked provisional)

1. **S23 (N1092):** who sees a watch and who sees a flag. This is with Bob through the design stream. Every watch or flag line is marked provisional. The browse, the mark and F2 do not wait on it.
2. **N670's R88 (Translation, K3190):** offering a group's translation to every group is not touched. The question page's "Read in my language" (R31) needs only plane R50, which is built.
3. **S2, S3, S4** remain undrawn (S3 and S4 go to the design stream's next session). legacy-ui stays.
4. **A group's own passed date** (screens-daily R28): DEC-239 words only a missing reply. The word for "our date passed" is owed by the design stream, so it is asked in the channel act.
5. **Accepting a reading of several separately sufficient parts** needs each part affirmed (basis-versions R12, `VERSION_AFFIRMATION_INCOMPLETE`). DEC-235 draws a plain "Accept". Until the design draws the affirmation, R25 draws the refusal by its words. Asked in the channel act (doubt 9).
6. **"Everything from {project}"** has no provider (queue R4: no wildcard). It is drawn only if BOB adopts R55's whole-case form (doubt 6).

## 11. Questions for Bob

- **S23** only. It is already put to Bob by the design stream with DEC-238 (who sees a watch, who sees a flag: privacy among members, which is a value). BOB does not ask it again; it waits on the stream's fold.
- No other point here touches values, legal exposure, money or how real groups behave. Every other choice below is BOB's.

## 12. Doubts for BOB (all BOB's, P17)

1. **Id order against T49-18 and T49-19.** Both claim the next ids "at the fold" with no text written. *Recommended:* the text drafted here takes the next free ids (screens-inquiry R23–R31, screens-daily R24–R29), and T49-19's and T49-18's own lines follow. Likewise affordances R60–R61 come before T49-14's, op-grades follows T49-13, and op-declarations R73 follows T49-16's R71–R72.
2. **Where a watch and a flag live.** *Recommended:* a small new module `watches` in L2 after `project-roster` (it needs only `record-core` and `membership`, and `retrieval` and `queue-producers` can read it). Not membership: it is at 3,826 lines. Not `following`: its purpose is bodies and registers. *Alternative:* the watch in `queue`'s personal state beside mutes, and the flag in `tasks`. *Timing:* place it in T49 only if S23 is answered by L2's START; else T50, with the browse going ahead in T49.
3. **`actioninquiry`'s home.** *Recommended:* `action-records` (L9, after `actions` is readable, and calling `promotion.promote`), as a `relates_to` reference, never `cites`, as the old interface carried it (`openNonResponseInquiry`, `app.html`:10247). *Alternative:* no new op: R21 admits `promote` with the reference as a re-point. DEC-239 asks for a declared op, so a re-point is weaker.
4. **The imported list's fields** (case-import R26). *Recommended:* adopt, joining T49-8. *Alternative:* the screen reads `importedcase` once per row, which is unbounded.
5. **The owners' pending change** (project-roster R32). *Recommended:* adopt, since DEC-237's "waiting for: Dev" is otherwise seen only by the member who acted. *Alternative:* draw only what a refusal answered in the sitting.
6. **queue R55.** *Recommended:* adopt the dates (the design draws "muted by you, {date}"). The whole-case mute is a behaviour change to R4 ("no wildcard"), so it is left out unless BOB adopts it, and "Everything from {project}" waits.
7. **Models (K3275, K3286).** screens-inquiry grows to three screens' redesign and screens-daily to six lines, so neither is "one line". *Recommended:* T49-19 runs on the default model (the question page is DEC-32's heart, and V1's structure must come before the strength). The rest run on Sonnet, with the new `watches` module on the default model (K3294).
8. **"overdue" in screens-daily.** It is the module's own live words (finding 4). *Recommended:* R28 as drafted, with the group's own passed date asked of the design stream.
9. **Channel act to UX-DESIGN at T49's opening** (adding to the plan's list): the affirmation at Accept (open point 5); the word for a group's own passed date (open point 4); clearing the six `owed:` registry tags once the wording edits land (finding 1).
10. **Sizes (M-T49-1).** capture (about 5,200 lines with comments, per its Size line), retrieval and screens-inquiry are to be measured at START before their jobs.

## Settled by BOB #176 (K3319; BOB's, P17), with `draft-T49-additions.md`

1. Both drafts are adopted as the T49 opening's sources beside `draft-T49-plan.md`, its settled sections standing. **One job per module across all three** (additions doubt 3): where two drafts write the same work (N1078's `REF_SCREENS` kinds: this draft's interface-shell R66 and the additions' R65; N1086: explore R25 in both; N1087/N1090's imported list), it is written once, citing both entries. Ids are re-assigned at the consolidation from each file's next free id, in this order: this draft's lines, then the additions', then `draft-T49-plan.md`'s "ids at the fold" lines.
2. This draft's doubts as recommended, except doubt 2: **`watches` (and queue-producers R41, the watch/flag ops, grades and screens-daily R26's watch and flag parts) wait for S23**, Bob's through the design stream; they join T49 only if S23 is answered by L2's START, else T50 (hard reason: a question that is Bob's). The browse (retrieval R79), the mark (membership R145 here, renumbered after the additions' `MODULE_ORDER` line) and F2 go ahead in T49.
3. Doubt 6: queue R55's dates adopted; the whole-case mute is not adopted (it reverses R4's "no wildcard" for a design line; "Everything from {project}" waits on the design stream, asked in the channel act).
4. Doubt 7 as recommended: T49-19 (screens-inquiry) on the default model; the rest on claude-sonnet-5-5 (watches, if it joins, default).
5. The additions' doubts as recommended: (1) capture's START checks R77 at the composed plane; (2) the C-64 rows stay in instance-setup (b); (4), (5) Sonnet for translations, op-capabilities and instance-setup's delete; (6) R29's guard kept; (7) translations after instance-setup, the L11 order exception named.
6. The legacy census row names S2–S4 as the undrawn gaps; the Left-out rows for the census gaps, "read in my language" and N1049 are removed and their work placed as above (N1049 by interface-shell R67, interface-assets R8). N670's R88 stays Bob's.
7. The channel act at T49's opening adds: the affirmation at Accept (open point 5), the word for a group's own passed date (4), the whole-case mute, and clearing the six `owed:` tags once the wording edits land.

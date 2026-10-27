# Causes of walker E's findings (area E, taking action), 0.87.0 live walk (K5348)

Source read: `tranche/T51b` at `d24775efd53` (worktree `walk/T51b-causes-E`). Every cause below was read in the source; none was run against the copy (a sign-in is a state change, and the brief allows read-only requests only). Where a cause is a reading of the code that the walker's trace or a request would settle, "proof" says what. No test suite was run. `bio-plane/` paths are given from `bio-plane/src/`.

Cause ids are `E-K<n>`. Owner = module in `build/modules.json`. A cause that spans layers is a boundary question (K4164) and says so.

## BLOCKER

**E-K1 · screens-investigate · `screens-investigate/timeline.mjs:90-91, 194, 204-221, 245-252` · explains B1, C2a, D1, C3-C13 (all of journey (c) after step 3), M7 (the missing "decline to escalate") · BLOCKER**
- The act's event has no `when`, so `conformance` reads its dates as "placed nowhere" and refuses Noncompliant (`conformance/index.mjs:622-627` `datesOf`: `w === null` gives `{date: null}`; `#bindings` at `:789-796` turns that into `undetermined`; the refusal is raised at `:1076-1079`). An event gets a `when` only from an attestation that carries a date (`events/index.mjs:682-692` `#whenRows`, `governingMany` takes `value IS NOT NULL`).
- The Timeline gives a member exactly one way to date an event: type the date in the field "The date, as the passage states it" (`tl-date`, drawn at `timeline.mjs:194`, below the "Record an event" button) BEFORE pressing "Record an event". `createevent.send` (`:204-221`) then records a dated fact and sends it as the event's attestation (K5148). Nothing says the field belongs to that button: the same `tl-date` field is the input of "Record a dated fact" (`:245-252`) and of the undated-event link.
- Once an event exists undated there is no way to date it. The op that adds a dated attestation to an existing event exists (`events/index.mjs:616` `attest`, wired as `eventattest` at `:1486`; `eventgovern` at `:1487`) but no screen calls either (grep of `src` for `eventattest|eventgovern` finds only the owner, op-declarations and op-grades). "Record a dated fact" (`:245-252`) sends `{captureSha, extent, kind, value}` and no event: it creates a free dated fact, which the page lists under "DATED IN THE DOCUMENTS" "beside" the events, "linked to no event". The link "Cite an exact date for one of them" (`:91`, `data: { event }`) is drawn only for an event whose ORDER is undetermined (`it.order.undetermined`), and its `send` never reads `el.dataset.event`, so it too makes a free dated fact.
- The walker's order (events first, the dated fact after) is exactly the one that cannot recover. The standard's page cannot cure it either: its adoption and through-day rows date the standard, not the act's event.
- Proof: the walker's event reads `when: null` (`op=event`), and the same events made with the date typed first lie on a lane (see test below). The code reading is firm; the unproven part is only that the walker's two events were made with `tl-date` empty (E.md says "each with the document and the passage chosen", and no date).
- Boundary (K4164): the missing door is the screen's (screens-investigate), the op is `events`' (exists), the refusing sentence is `conformance`'s (E-K2). One job fixes the door; E-K2 fixes the sentence. Whether a member should also be able to date an event from the Matter's event choice is a UX question for BOB/UX.
- M7: the control exists. `screens-action/matter.mjs:538` draws "Open an escalation" and "Decline to escalate" only when the determination holds a noncompliant outcome (`P.ctx(view).nc.length`), else `P.unavailable` (re-walk 10 N8's design). With B1 no noncompliant determination can be recorded, so the door is never reached. M7 is not a separate cause.
- Why tests missed it: `test/m/screens-investigate/fix5-seam.test.mjs:12-48` (and `timeline.test.mjs:227`, `fix2w2.test.mjs:450,475`) test only "Record an event" WITH the date typed in the same press (and the control "no date: placed nowhere"). No test makes an event undated and then dates it, none records a dated fact after an event and expects the event to move, and no test of `conformance` or `screens-action` Matter runs over an event made through the screen with no date.
- Walker's exact case: Timeline, "Record an event" (document and passage chosen, `tl-date` left empty), "Record a dated fact" 2026-03-02 on the same passage; Matter, the event, role "Records officer", body "City of Walkton" (the issuer), the held standard, outcome Noncompliant, reason. Expect: recorded (the dated fact must date THAT event, or the event must be datable from its row). Control: type 2026-03-02 in "The date, as the passage states it" before "Record an event": the event lies on the world lane dated, and Noncompliant is recorded.

**E-K3 · screens-publish (boundary: case-authoring) · `screens-publish/ceremony.mjs:126, 160` · explains B2, I3(c), D2 · BLOCKER**
- `ownPublished` is `pubLatest > 0 && (recd ? (Number(c.edition) > 0 ? pubLatest >= Number(c.edition) : !(Number(recd.prepared) > 0)) : ...)` (`:126`); when true the page returns right after "Published: edition N / Open the public page" (`:160`), before the steps (bias, ties, key, sign) are drawn.
- A draft made by "Prepare a case from this" on the question page carries no case: `question.mjs:1413-1414` sends `{project, targets}` with no `caseId`; `review` states its edition as null (`review/index.mjs:173-175` `statedEdition`: "which edition it becomes is undetermined until then"), so `c.edition` is null. The pre-flight's `editions` is told by case, not by draft: `case-authoring/index.mjs:1801-1827` `draftEditions` answers `{prepared, published}` for the case the findings serve (`#caseStood` -> `#caseOfMembers`, `:1795, 2001`), i.e. the case already published as edition 1. For the new draft `prepared` is null (nothing is prepared until the very step the page now hides), so `ownPublished` is true: the page reads "this case has a published edition and I have nothing prepared" as "this draft is the one that was published". That reading is right for the first draft (it is what `seam4.test.mjs:178` tests) and wrong for any later draft over the same case. Choosing the older draft shows the same line for the same reason (both drafts share the case's record).
- The case editor's words ("A draft that names no case yet", bias box "Nothing was published") fit the same facts.
- A door that avoids it exists but the walker's path does not lead to it: the Docket's "Start the next edition" (`fr30.test.mjs`: `casedraft` with the published case's `caseId`, so the draft states edition 2 and `pubLatest >= 2` is false). The question page's reopen text links to the docket (`question.mjs:600`) only inside the "Reopen" fold. Proof that this door completes a second edition was not run.
- Proof of the cause: the walker's `casedrafts` row for the new draft has `case_id` null and `reviewcopy.case.edition` null, and the pre-flight `editions` reads `{prepared: null, published: {edition: 1}}`.
- Fix shape (for the job; the owners decide): `ownPublished` must ask whether a ratified edition was made by THIS draft (`case_documents.draft_id`, publication R40), which `draftEditions` should answer per draft; and/or the question page's "Prepare a case from this" should send the published case's `caseId` when a published case carries the finding. Boundary question: screens-publish (page), case-authoring (`draftEditions`), screens-inquiry (the call).
- Why tests missed it: `seam4.test.mjs:136-190` builds one draft (`newCase: true`) and publishes it; `fix2.test.mjs:162-180` fixes the review copy at edition 2 (`FIRST_EDITION`/`PUBLISHED_ONCE`) so `c.edition` is never null for a later draft. No test publishes edition 1, reopens, makes a second draft through the question page's call (no `caseId`), and opens its ceremony.
- Walker's exact case: publish edition 1; question page: "Reopen this finding, with a reason", conclude again, "Prepare a case from this", scope, statement, role, position, left-out item, "Save these details"; open the Publish screen of the new draft. Expect the ceremony's steps (bias, ties, key, sign) with "Published: edition 1" as a note above them. Second run: the same through the Docket's "Start the next edition".

## MAJOR

**E-K4 · events (boundary: screens-investigate) · `events/index.mjs:1241-1243, 1285-1287` (also `:656, 674, 734`, `events/owner.mjs:65`); caller `screens-investigate/standard.mjs:173-175` · explains M4, D9, C1(a), C2c(c) and (d) in part · MAJOR**
- The standard's page asks `timeline` for up to 200 captures (`heldShas = ...slice(0, 200)`, `:173`). `events` reads them with `capture_sha IN (?,?,...)` in chunks of 400 (`#datedLane` at `:1241`, `#eventsCiting` at `:1285`), so one statement binds up to 200 parameters (and `#governingMany` binds up to 400). The team holds 217 documents (E.md C2c), so every load sends 200 shas. A Durable Object's SQLite takes at most 100 bound parameters a statement (Cloudflare's documented limit; the code knows such a limit: `membership/index.mjs:116-119` "stays under the host's bound-parameter limit"). The throw is answered as `STORE_DID_NOT_ANSWER` 502, on every load, both roles, both widths: the walker's exact symptom. The project Timeline (a few documents) stays under the limit, which is why it works.
- The page then hides the failure: `standard.mjs:175` `tl && tl.state === "ok" ? ... : {}`; a failed read draws nothing (the 502 is only in the console).
- Probable, not proven. Proof: (1) the standard page's `timeline` request carries 200 shas and the Worker's log for the 502's correlation id shows the SQLite "too many SQL variables" error; or (2) the same page for a team with fewer than about 90 held documents answers the read; or (3) `op=timeline&captures=<N shas>` with N = 90 then 120 on the copy (a read).
- The 12.4 s stall of ten reads at 06:40:34Z (C2c(d)) is not traced: a Durable Object runs one request at a time, so one slow request ahead of ten others would give ten equal waits; the slow request is not identified (UNKNOWN part, below).
- Why tests missed it: the test store (node sqlite) allows 32766 parameters; `test/m/events` and `screens-investigate/standard*.test.mjs` use a handful of captures. No test sends more than 100 captures to `timeline`.
- Walker's exact case: the standard's page `STD-...` for a team with 217 documents, any role: open it, then read `op=timeline&captures=` with the first 200 shas. Expect 200 answered (and, on a failed read, a sentence saying the Timeline could not be read).

**E-K5 · case-inputs (boundary: screens-publish) · `case-inputs/index.mjs:697`; session viewer `admission/index.mjs:377`; screen `screens-publish/case-editor.mjs:424-429` · explains M5, D8, S8(a) · MAJOR**
- `#acknowledgeStatement` refuses any viewer that does not begin `member:` with the one dead answer (`:697`: `if (!v.startsWith("member:")) return review.deadAnswer();`, the answer that says "no review copy"). `resolveSession` gives an administrator's session the viewer `"admin"` (`admission/index.mjs:377`: `r === "admin" ? "admin" : member:...`). The walker acted as the administrator who owns the project. So the administrator's "Acknowledge what it leaves out" is always answered `NO_REVIEW_COPY` 404 (the walker's 216 ms answer), and the screen draws the generic review-copy sentence because `statementack` maps only `STATEMENT_ACK_NO_REASON` (`case-editor.mjs:424`).
- Whether an administrator may acknowledge is a policy question (the act is "a SECOND person's reading", `case-inputs/index.mjs:649-660`); the wrong sentence on screen is a defect either way.
- Proof: the same act as the member (handle walker) on the same draft succeeds, or the administrator's request carries `viewer=admin`. Not run.
- Why tests missed it: every `statementack` test names viewers `member:alice` etc.; no test uses a session's real viewer string for an administrator.
- Walker's exact case: administrator who owns the project, case editor, tick "This case leaves nothing material out", a reason, "Acknowledge what it leaves out". Expect: recorded, or a sentence that names the cause (an administrator cannot acknowledge) and a door.

**E-K6 · screens-action · `screens-action/action.mjs:478-486, 604-631`; `screens-action/request.mjs:196-209` · explains M3, D3, D4, H1, H1b(c) · MAJOR**
- Action page: "Change the law it goes under" (`actionlaws`) is drawn only when the team's places offer laws (`lawChoose = offered.length ? ... : ...`, `:478-485`); with no place chosen (the team's state) only "Propose another law" is drawn. `actionlaws.send` (`:604-616`) can only pick from the offered list. A proposal is drawn "PROPOSED, NOT CHOSEN ... not the law it goes under until a member chooses it" (`law.proposal.not`) but no row of the proposals carries a control to choose it. `action-records/index.mjs:396` states adoption is `op=actionlaws`, which the screen never offers for a proposal.
- Request screen of a started request: `picker` only `offered.length ? ... : ""` (`:196-203`); the heading `screen.request.step.law` then holds nothing but the help link. The action page's equivalent (`screen.action.law.none` and the level/citation fields, `:482-484`) was added there (R59) and not here.
- Root condition both share: the team has no place chosen (E.md: "No place is chosen: your team's Civicsmith reads no local facts"). The fix is the screens' (a choose control on a proposal; the sentence and fields on the Request screen); the cause of "no laws" is a setting.
- Why tests missed it: tests of R59 (`screens-action` action law) assert the proposal is kept and drawn; none asserts a way to choose it, and the Request screen's empty-profile case is not tested.
- Walker's exact case: new team with no place; action (records request): "Propose another law" (state, California Public Records Act, Government Code section 7920.000), reason; then try to choose it. Request screen: "Start the request" for an office; read the heading "THE LAW IT GOES UNDER".

**E-K17 · screens-action · `screens-action/start-send.mjs:46, 166, 183, 199`; grammar `action-grammar/checks.mjs:857-862` · explains M6, D7, K-breach · MAJOR**
- The only input for acting before a determination is the one field "start-override" (`:166`), sent as `premise_override = { reason }` (`:46, 183, 199`). The grammar requires a ground: `{kind: legal_deadline, citation, date}` or `{kind: irreversible_act, what, when}` (`overrideGroundFindings`, `checks.mjs:857-862`; `actions` answers `OVERRIDE_NO_GROUND`, `actions/index.mjs:862`). So the form can never satisfy the rule; the sentence "a legal deadline would pass first" asks for something the form has no field for, and the walker's reason that states a legal deadline cannot be read as one.
- The other half ("Name the determination it rests on", `refusal.ACTION_NO_DETERMINATION`): `actions/index.mjs:1316-1346` looks for a `rests_on` leg naming a live noncompliant determination. The start-send body (`:183, 199`) names none; the option's matter does (plan option "rests on"). A member can reach a noncompliant determination only after E-K1, so this half is blocked by E-K1 and its sentence points at no control.
- Why tests missed it: tests drive `optionstart` with a hand-built `premise_override` including a ground, or assert the refusal text; none presses the screen's own field and follows the refusal to success.
- Walker's exact case: plan option of kind "other", tick "This action asserts a breach", "See what starting does", then "Proceed anyway, with this reason" stating a legal deadline with its date and citation. Expect a field for the ground (kind, citation and date, or what and when).

**E-K7 · screens-action · `screens-action/counsel.mjs:56-97, 102` · explains M1, D5 · MAJOR**
- The act answers 200 and `done` keeps the packet (`:102`), but `render` draws only the "matters" rows (`sections.facts.items`), the defence additions and the marking line (`:56-97`). It never draws the packet's id or version, a "made" line, the sections, or any control to read or export it. The ops that do (`counselpacketread`, `counselpacketexport`, `filings/index.mjs:3096-3097`) have no caller in any screen (grep). A second press makes version n+1 invisibly (`filings/index.mjs:2530-2535`: `version = held.v + 1`).
- Boundary with the design: DEC-340's mock may intend only these sections; that the act's result is not shown at all is functional. Proof of intent: the DEC-340 mock for `screen.counsel.*`.
- Why tests missed it: `screens-action` tests of counsel assert the three drawn sections; none asserts the member can tell the packet was made or open/export it.
- Walker's exact case: "Brief counsel" on an action with a determination, name, organization, purpose Claim, reason, "Assemble the packet, with a reason", twice. Expect: a line naming the packet and version, its contents, and a way to export.

**E-K9 · screens-inquiry · `screens-inquiry/question.mjs:1161, 1384, 1399` · explains M2, I3(b) · MAJOR (probable)**
- The "Concluding" form pre-selects the reading the project stands on: `cs.choice("question-conclude-reading", ..., { value: stands ? reading : "" })` (`:1161`; `stands` = `current` accepted, `:1146`), and `send` takes `version = cs.value("question-conclude-reading")` first and the member's own text only `else if (own)` (`:1399`: `if (version) q.version = version; else if (own) q.reading = own;`). After "Reopen this finding" (a withdrawal row, `basis-versions/conclude.mjs:446`, which keeps the old reading as current), the select still names the old reading, so the new text in "Your reading" is not sent and the old reading is concluded again with only "What would change it" new. On a first conclusion no reading stands, the select is empty and the own text goes (the tested path).
- Probable, not proven: it rests on `current` surviving the withdrawal. Proof: the second `conclude` request's query string carries `version=<old reading name>` and no `reading=`.
- Why tests missed it: `r50-own-reading.test.mjs`, `r10-question.test.mjs:95`, `t50.test.mjs:63-67` conclude on a question with no standing reading; no test re-concludes with an own reading while one stands.
- Walker's exact case: concluded finding with its own reading; "Reopen this finding, with a reason"; in "The reading you conclude on" leave the pre-set choice, write a new "Your reading", falsifier, reason; conclude. Expect the new words on the page.

## MINOR

**E-K2 · conformance · `conformance/index.mjs:1076-1079, 626, 2169`; words `events/index.mjs:1075` · explains N-b (re-walk 11), N2; contributes to B1's dead end · MAJOR as a dead end, MINOR as wording**
- The refusal "whether X binds Y is undetermined (...), and an act is found noncompliant only against a standard that binds its body: settle it on the standard's page first" (`:1079`, row `conformance.index.whether_standard_binds_v1_is`) is raised for any undetermined binding, including one caused by the act's own undated event; the standard's page cannot settle that. The reason is nested twice: `datesOf` wraps the events' reason (`:626`: row "the act's event is placed nowhere{why}" with `why` = " (" + reasonText(act.why) + ")"), and the events' reason already begins "placed nowhere: ..." (`events/index.mjs:1075`, row `events.why.placed_nowhere_attestation`). Result: "(the act's event is placed nowhere (placed nowhere: no attestation of this event is dated))". Another copy of the same nesting: `whenWords` `:2169`.
- Why tests missed it: the tests assert the refusal code `STANDARD_BINDING_UNDETERMINED` (walk E C2a, R43), not the whole sentence, nor which door it names.
- Walker's case: the B1 case (E-K1), read the sentence.

**E-K10 · screens-action · `screens-action/send-steps.mjs:266` (`actName`), `screens-action/matter.mjs:461` · explains N-a (re-walk 11), C2b(a), N1 (first half) · MINOR**
- The Matter's body is chosen as an entity and sent as the actor's body (`matter.mjs:613`: `actor: { role, body }` where `body` is the entity id). `actName` and the "by" line print `act.actor.body` as it is (`send-steps.mjs:266`, `matter.mjs:461`), so "by Records officer, ENT-2026-0005", and the plan's matter line uses the same helper. The Matter already reads entity labels for its body choice (`P.bodyChoice`).
- Why tests missed it: fixtures give the actor a typed body word, not an entity id.
- Walker's case: record Compliant with body "City of Walkton" chosen from the list; read the head of the Matter and the plan's matter line.

**E-K11 · action-plans · `action-plans/index.mjs:1470` · explains N1 (second half: "the tier option opt-1 of plan PLN-2026-0004-plan states") · MINOR**
- The action's tier reason is stored as English with raw ids (`localize("action-plans.index.tier_stated_by_the_option", "the tier option {option} of plan {plan} states", { option: opt.id, plan: p.id })`) and the action page draws it as a member's reason.

**E-K12 · screens-action · `screens-action/plan.mjs:534-572` · explains K4/N5 · MINOR**
- `optionadd` has no `done` that clears the form; `plan-opt-tier` (`:571`) keeps its value after an add, so the next (press) option is refused `TIER_REFUSED`.

**E-K13 · screens-action · `screens-action/send-steps.mjs:557` · explains C-tmpl, D10 · MINOR**
- `TEMPLATE_SAVE` has `rereads: []` and no `done`; nothing is drawn after `templatesave` answers.

**E-K14 · screens-action · `screens-action/dash-action.mjs:36-42, 118-131` · explains K11, D11 · MINOR**
- By construction "WHOSE MOVE" is blank unless a sent letter and an owed reply exist, or a step of ours is pending (`whose`, `:34-42`); "THE CLOCK" is blank unless it is "theirs" with a law window or a sent letter exists (`clockOf`, `:118-125`); "NEXT" is blank except for "theirs" (`nextOf`, `:128`). A planned action or a request for comment with a due date but nothing sent gives three empty cells. The empty queue says nothing about dated items waiting (no sentence).

**E-K15 · screens-inquiry · `screens-inquiry/document.mjs:589` · explains S6(a) · MINOR**
- The help "Set to the question this document was captured for ..." is drawn whenever a question can be asked (`pickHelp`), but the select is preset only for a capture held for a question (`preset`, `:585`); a file brought in through a project's Add has none.

**E-K16 · screens-action · `screens-action/action.mjs:219-221` · explains H3b(b) · MINOR**
- "Waiting on ... reply" is drawn while `reply_owed.owed` is true and the state is not resolved/abandoned; a recorded Denial leaves `owed` true. (A silence recorded before the due date, H3b(a), is accepted by the `no_response` arm of `actions/index.mjs:1836-1862`, which compares nothing with the clock and keeps no stage; not read further, see UNKNOWN.)

**E-K8 · filings · `filings/index.mjs:1944` · explains M1's raw "## What Would Falsify This", C12 · MINOR**
- `#fact` reads the conclusion with `/\n## Conclusion\s*\n([\s\S]*?)(?=\n## |\s*$)/`. When the finding's `## Conclusion` section is empty (a conclusion held as the project's row, `question.mjs:586`), `\s*\n` stops one newline early and the lazy group takes the next heading: checked by running the expression on `"x\n## Conclusion\n\n## What Would Falsify This\nfoo\n"`, which returns `"## What Would Falsify This\nfoo"`. The counsel screen draws that as the matter's claim (`counsel.mjs:62-67`).
- Why tests missed it: counsel and filings fixtures give the finding a non-empty Conclusion.

## DESIGN (words or layout, nothing broken; to UX-DESIGN, K3462)

- D-1 K2 "Assumed: not shown yet": `screen.plan.support.hypothetical` (`setup-words/rows.mjs:1482`, "DEC-259: reworded").
- D-2 C1(c) "Kind of copy not known": `label.standardcopy.undetermined` (`rows.mjs:4177`).
- D-3 C2b(b) "Record a success" and "Choose": `act.successrecord.label.matter` (`rows.mjs:18350`).
- D-4 C2c(b) "When no day is recorded": `screen.standard.through.none.summary` (`rows.mjs:11838`).
- D-5 M8 "the generic reader found no entities in this document's docx text-layer text (tier 1); recorded as an empty reading, never an emptied document": `reading-pipeline.why.reader_found_entities` (`rows.mjs:17134`); drawn as the engine's reason. N3's "recorded 2026-10-27T05:54:58Z for resolution through the task list": `capture.authority_basis` (`rows.mjs:12576`), whose `{at}` the code passes as the raw instant (the raw stamp is a code detail for capture, the rest wording).
- D-6 K10 "The jurisdiction profile holds no file template for this kind: name a template, or write the words.": `refusal.TEMPLATE_NOT_NAMED` (`rows.mjs:13663`); no control names a template, which the design should decide.
- D-7 K-member "arrived with reply 1": `screen.action.pressuremark.reply` (`rows.mjs:1686`).
- D-8 D13 "which is named" with no plan named: `refusal.SUBJECT_IN_ACTIVE_PLAN` (`rows.mjs:16548`).
- D-9 H1b(a) "Fill in The body that holds it first": `capture.fieldneeded` (`rows.mjs:1174`) with a capitalised field label inserted mid-sentence.
- D-10 K3/D15 nothing says why there are no assistant suggestions on a plan (no row exists).
- D-11 K5 the options' sort headings are not announced (no row; layout).
- D-12 D12 "Show the routes" answers "No route is known for this matter yet" with no cause (`screen.matter.routes.none`, used at `action.mjs:445`).
- D-13 D16 "{n} documents could not be read for this, so “nothing” is not said for them": `screen.find-in.notread` (`rows.mjs:1925`) names neither which nor why.
- D-14 K12(a) the resolution takes one of five fixed words, no box for its own outcome (the design asks for one).

## UNKNOWN (what I tried)

- U-1 S2: an invited member is told "You can see that this project exists, but not its work, until you join it." Tried: grep of `screen.project.*` join words; not traced to the screen (project page not read).
- U-2 S5/N12: Server-Timing over 2 s (`allocid` 2588 ms, `optionadd` 2042 ms, `determine` 2628 ms, `caseratify` 3057 ms, `groupidentity` 2875 ms) with four other walkers acting. Tried: nothing run; a Durable Object serves one request at a time, which would explain waits under load. Proof: the same acts on a quiet copy.
- U-3 C2c(d): the 12.4 s stall of ten reads at 06:40:34Z. Tried: reasoning above (E-K4); the slow request is not identified. Proof: Server-Timing of every request in that window on the copy.
- U-4 K7/N4: the checks list repeats every sentence per scenario ("Checks · 9" for two) and the closed plan keeps its checks. Tried: `screens-action/plan.mjs` check drawing (`checkSays`, `:280-285`) and `action-plans` checks; the per-scenario repetition source (owner's list or the screen) not read.
- U-5 K9: "The action started ·" with nothing after the dot (and the started line does not name the action's id). Tried: `start-send.mjs:138-145`; the empty addressee case not traced.
- U-6 H2/K-member: "The due date to be reminded of" awkward. Tried: not searched (words likely DESIGN).
- U-7 H3: one reply costs two presses plus a reason (5 s wall, server 311 ms). Tried: `actioncorrespond` send in `action.mjs`; not read to the end.
- U-8 C1(b)/D17: the document pickers list every team document, oldest first, no project filter. Tried: `P.docsAll` in `standard.mjs`; the picker's source (`heldcaptures`) filter not read.
- U-9 H1b(b): "The body that holds it" offers only "Rewalk10 E Walkton Records Board". Tried: not traced (`request.mjs` body choice).
- U-10 H3b(a): a silence recorded for a day before the reply was due is accepted and its stage dropped. Tried: `actions/index.mjs:1836-1862` (no date comparison seen, `t45.fields` not read).
- U-11 I2/D14: the question page of a finding a published case carries says nothing of it. Tried: `question.mjs:586-602` (the only mention is inside "Reopen this finding", `screen.question.reopen.next`); whether the design wants a line is for UX. (Could be DESIGN: not counted as such because the data to draw it was not checked.)
- U-12 I3(a): Reopen answers at once and the question just redraws (no result line). Tried: `question.mjs:1564-1580`; the done step was not read.
- U-13 Not walked (not producible): I1 monitoring detects a changed source; step 8 of (k) cannot be judged before November 3, 2026; C1b proposals to adopt come from the assistant.

## Re-walk 11 rows still open

E-C2a NOT FIXED = E-K1 (+ E-K2); N-a NOT FIXED = E-K10; N-b NOT FIXED = E-K2; C12 raw "##" NOT FIXED = E-K8; S3 cite list blank NOT FIXED = E-K15 (select preset only for a capture held for a question).

## Counts

Causes: 17 (2 BLOCKER: E-K1, E-K3; 6 MAJOR: E-K4, E-K5, E-K6, E-K17, E-K7, E-K9; E-K2 MAJOR-as-dead-end; 8 MINOR: E-K8, E-K10-E-K16). DESIGN: 14. UNKNOWN: 13 (12 findings and the not-walkable set).

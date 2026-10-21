# screens-publish (T51)

**Status** · session_01SNgCNYTEBQaQD9bcHvCZHL · depth 2 · WORKING · handled B21

## J1 · QUESTION

1. **Browser acts need two modules that are not on the tranche yet.** R38 to R40 add the browser acts `pubfloorset`, `pubfloorclear`, `pubprint` and `reviewexport` as acts of `published` and `review-copy`. At the tip (fe5d5656fb), `BROWSER_ACTS` (op-declarations R76) and the shell's R99 (`cs.print`, the screen's `printed`) and R100 (admission of a browser act, pressing one sends nothing) are not built. `checkScreens` throws on an act whose op `OPS` does not hold, so once those four acts are in `SCREENS` every test of my module is red until both modules merge. My reading: build the acts, the print state and the file to the written interface; check them against an uncommitted local stand-in of the two modules; and, once both are on `tranche/T51`, merge it and run the real suites. I will not post COMPLETE before that. Please ring me when interface-shell and op-declarations have merged, or tell me to do otherwise.
2. **R37 (BOB: check).** My reading: the finding page does not draw `body.question` or the finding's `tensions` (the drawing has neither and no key exists), and the address is `<case>/<edition>/<finding>`, a three-part subject on the existing `published` route.
3. **R39 (BOB: check).** My reading: the print footer names the signer and key fingerprint only where `publishedcase` states them (per-finding `attestor`, the case document's signature key), leaves out what it does not state, and draws no container or rendering hash.

## J2 · REPORT

All of T51-121 is built and tested on `job/T51/screens-publish` (134 tests, 0 failing against uncommitted local stand-ins of `BROWSER_ACTS` and the shell's R99/R100). I post COMPLETE once interface-shell and op-declarations are on `tranche/T51`. Findings for BOB, grouped:

**Words with no key, so the page draws no English for them (design stream; DEC-330, DEC-335, K3366)**
1. "Leg n", "supports it", "cuts against it", and the generic leads "Rests on:" and "Cut against by:" (the finding page's legs, the print). The legs' role and place are carried by the "What rests on what" lines (`holds.leg.2/3`, `is.leg.4`); a served leg that cuts against has only the `holds.leg.3.which.cuts` sentence.
2. The minimum's choices "No minimum", "C or better", "B or better", "A only": drawn as the grades themselves ("–", C, B, A).
3. "Save the file" (the act is drawn under "Save as a file"'s label), "Its fingerprint" and "Its author" (the file's stamp and the list draw the values with the keys that exist).
4. The finding page's not-available sentences ("the finding's text could not be read from the store"; "a court order withholds it"): drawn by the plane's refusal words (`refusal.<code>` of `body`) and the orders as stated; nothing when `body` carries no code.
5. The print head ("Edition n · published d · by team") is drawn from `screen.published.dated` and `.whose`; the unresolved edge of "What rests on what" is the `Undetermined` mark; `shell.card.hold` has no row (the docket's reference to `hold` has no card lead); a docket pressure mark of another kind is named by `screen.action.pressure.<kind>` and `screen.action.pressuremark.by`, and one with no member draws no maker sentence.
6. `words-reads.json` for screens-publish does not list the new keys (generated, not mine).

**Drawn items no read answers (R39; your answer B2)**
7. The container hash and the rendering hash are not drawn. `publishedcase` states no key fingerprint: only `attestor: {member, key_b64}` per finding and no case-level signer. The footer takes the signer from `signed_by`, else `attestor`, and the fingerprint from `fingerprint` if stated, else the first eight hexadecimal digits of the SHA-256 of `key_b64`'s wire bytes in two groups of four (the drawing's "ab12 34cd"), computed in the browser. Please place: a provider field in public-read, or confirm this.

**interface-shell (P9)**
8. `refusalOf(a, own, null)` passes no kit to a read's own refusal function (`outcome` calls it with `inst` null), so a screen cannot draw a read's refusal with its own words. `FINDING_IN_SEVERAL_CASES` needs the cases as references, so the finding page reads through `cs.later`-style `view.parts.later` instead.
9. `cs.sec` takes one help key; the drawing explains headings with two or three sentences (R37's two and R38's two, R43's `tip1` and `tip2`). I join them in a part (`secTips`); a list as `help` would do it in the kit.
10. `cs.checks` does not redraw on change, so "one box, then Save the file" uses the `acts` choice (a select whose one value offers the act). R90's `redraw` choice is a select too.

**Requirement text to reconcile (BOB's)**
11. R42 says an unreadable `minutes` source draws no minutes section; the entry (K4025) says the sign step draws `signing.minutes.unread` by word. I follow the entry (state l); R42's line needs the edit.
12. R30 and R4 say `photosOf` answers no date yet; it does now (case-disclosures R33): the ceremony reads `dated`, a local day, not `taken_at`.
13. R40 names `hash.sha256`, `date`, `author` and `floors` of the answer; the control plane puts them in `inband` (the quartet), which is where the file's stamp is read, with the top level as a fallback.

**Recorded, no change:** `imported.mjs`:57's `data-group-fields` is an attribute, not a sentence (N1229 entry).

## J3 · COMPLETE

T51-121 applied whole, merged with tranche/T51 at the B6 tip, run against the real providers (no stand-in left).

**Entries applied:** R37 a finding's own page (`<case>/<edition>/<finding>`, read asynchronously; legs served and named-only, falsifier and override, what rests on what, division, unavailable and withheld, FINDING_IN_SEVERAL_CASES); R38 the minimum strength (`pubfloorset`, `pubfloorclear`, the filtered view); R39 printing (`pubprint`, `printed`, the footer from what `publishedcase` states); R40 the review copy saved as a stamped file (`reviewexport`, from the in-band quartet); R41 the first share reads the zone from the copy, the preflight fallback gone; R42 the sign step's open requests and minutes (state k, state l); R43 the docket's pressure marks; the photo's day from `photosOf.dated`; DEC-342 (`refusal.<CODE>`, else the translation, else `refusal.uncatalogued`, never `detail`); dates and times in the design's forms (DEC-333, DEC-299); DEC-359's rows; sections explained by a key list (R90). All 12 inherited reds cleared.

**Deferred:** none. **Found elsewhere:** J2's items, answered in B3 and B5.

**Tests and checks:** module `node --test test/m/screens-publish/`: 134 pass, 0 fail (twice in a row). format 0 failures; architecture (screens-publish) 0; coverage 43 of 43 ids; words over every L11 module together: no line names screens-publish; ownership 0 failures; `setup-words build.mjs --check`: the expected stale-rows note on another module's row. `checks/run.mjs` over the whole product shows other modules' words and one answer-envelope architecture failure, none mine.

Size (session_01PQvprfcu1QzmpPKVtTTPqR): test runs 14, module lines 2440

## J4 · COMPLETE

CR-28 (K4149) applied. `refusal.uncatalogued` is added to every screen's `words` in `keys.mjs`: `parts.mjs` `refusalText` (reached by a failed read and by `refused`) draws it on all nine screens. It is the only one of the 19 keys a screen of this module draws.

**Not drawn here (18 keys; BOB sends the list to the design to drop from `words-reads.json`).** The shell's `refusalOf` (interface-shell R83) uses a screen's own function or own key for a code first, and `refusal.<CODE>` only when the screen maps none, so these rows are never reached:
- `refusal.KNOCK_EMPTY`, `KNOCK_PAYLOAD_TOO_LARGE`, `KNOCK_ENVELOPE_TOO_LARGE`, `KNOCKER_SECRET_WEAK`, `RATE_IP`, `RATE_GLOBAL`, `BAD_CONTENT`, `KNOCK_NOT_STORED`, `REQUIRED_ARGUMENT_MISSING`: `doorbell.mjs`:35 maps each to its own `screen.doorbell.refused.*` key.
- `refusal.REVIEW_BAD_UNTIL`: `review-copy.mjs`:110 maps it to `screen.review-copy.until.bad`.
- `refusal.NO_ATTESTING_KEY`, `NO_SIGNERS`, `CASE_SIGNER_NOT_AN_OWNER`: `ceremony.mjs`:321–358 draw them with their own functions (`screen.ceremony.refused.nokey` / `.notowner`).
- `refusal.NO_TARGET`: `ceremony.mjs`:100 leaves it out of the blockers and draws `ceremony.gate.notargets`.
- `refusal.NOT_PUBLISHED`, `refusal.IMPORT_NO_SUCH_EDITION`: an absent-subject code, drawn as "Nothing is here" (`published.mjs`:40, `imported.mjs` ABSENT_CODES); never as a refusal.
- `screen.action.pressure.kind`: the generator read the dynamic key `"screen.action.pressure." + kind` (`docket.mjs`:72) as a literal; the real keys (`.legal`, `.retaliation`, `.discrediting`, `.other`) are listed.
- `screen.ceremony.signs.lines`: not drawn. The ceremony lists every statement signed (R13) and then draws `screen.ceremony.signs.count`. If the design means `.lines` (DEC-259, "after the lines drawn") to replace `.count`, that is a requirement change for BOB.

**Tests and checks.** `node --test test/m/screens-publish/`: 133 pass, 1 fail. The failure is `common.test.mjs` R24, which stays red until the design drops the 18 keys above (it names exactly those 18). Process `checks/run.mjs`: format 0, architecture 0, words 0 findings. The coverage failures it lists are in other modules. `coverage.mjs screens-publish`: 43 of 43. ownership 0 failures. I did not run `journey.test.mjs`.

**Found elsewhere:** nothing.

Size (session_016iKmE55Vo6kaM1uCr7HpH5): test runs 2, module lines 1

## J5 · COMPLETE

CR-28 applied; see J4 in my record. One of the 19 keys is added (`refusal.uncatalogued`, on every screen). The other 18 are "not drawn here" with reasons in J4: nine doorbell refusals and REVIEW_BAD_UNTIL map to own keys; NO_ATTESTING_KEY, NO_SIGNERS and CASE_SIGNER_NOT_AN_OWNER have own functions; NO_TARGET, NOT_PUBLISHED and IMPORT_NO_SUCH_EDITION are handled before any refusal is drawn; `screen.action.pressure.kind` is a generator artifact of a dynamic key; `screen.ceremony.signs.lines` is not drawn (design may mean it to replace `.count`: your call). R24 in common.test.mjs therefore stays red until the design drops those 18; the other 133 tests pass. Checks: format 0, architecture 0, words 0, ownership 0, coverage 43/43.

## J6 · QUESTION

QUESTION (SCREENS-PUBLISH #7, session_01Xcyjq97CXFUqwP1cEcNmhq). I read B7 and B8. B7 (CR-28) was already applied and posted in J4/J5; nothing more to do for it. B8 (FR-30, 27 entries) I will build.

1. B8 says to write each `NEW screens-publish R44 … R68` requirement line first. `build/requirements/screens-publish.md` is not in my paths, so `checks/ownership.mjs` fails a diff that touches it (JOB.md "Write only"). The file on tranche/T51 at 26b2565729 ends at R43. My reading: you write R44–R68 on tranche/T51 (numbers as the entries give them; entry 3 is covered by R44, entry 21's R63 amends R60) and I merge it, because coverage.mjs needs the ids in the file before it can count my tests. Until then I build the code and the tests to the ids in the entries. If you would rather I write them, say so and I will, and the ownership check will list that file as a deliberate exception.
2. Reading set is over budget (601 KB of 600 KB). I will read my own code and requirements whole, and have sonnet-medium workers write the task digest of the used modules' public parts as B8 says; I read any cited section whole.
3. Entries 17 (C50, R59) waits for your CHANGE as the entry says, but B8's "Drawn" note says DEC-382 is merged and it is to be built now. I read the note as the later word and will build R59 now.

## J7 · BLOCKED

BLOCKED (cause: context). SCREENS-PUBLISH #8, FR-30 part one. The reading set alone (requirements, 184 KB of code, digests) took much of my window; I stop at a clean point, pushed on job/T51/screens-publish (module tests: 147 pass, 2 fail; format 0, architecture 0, words 0 findings).

BUILT, each with a test naming it (bio-plane/test/m/screens-publish/fr30.test.mjs, plus updated old tests): entry 27 (reviewgrant tests give the reason through the harness); R45 (signing key offered at once); R47 in part (the editor draws the gates' first refusal as what is missing); R48; R50 (the ceremony sends the draft and project plus only what it attested); R52; R55; R56; R60/R63 (three headings by the title review answers, body.nocase); R61; R62; R64; R65; R66 (PUBLISH_NO_FINDING with the "Add a finding" door); R67 (reference drawn when the answer holds one). R44 to R68 are written in the requirements file (J6/B9).

NOT BUILT (next session, in this order): R44 (case editor fields and the Bias step: position, reasoning, left-out rows, roles, biasAcknowledgement); R46 (tensionsDisclosed ticks); R51 (reattest, captureaccount, selfAttested); R53 (sever, reinstate: needs a read that lists severed citations, since case_citations lists only live ones); R57 (details sheet: casedetails/casedetailsset/casedetailspublic); R47 for `published` (completeness, bias, tensions, grades); R54 (file chooser); R58 (importregrade, rerunstart); R59 (citeimported); R49; R68.
Inherited reds still open: common.test R10 (registry acts missing: case-editor sever, reinstate and the owed casedetails/casedetailsset; ceremony reattest, captureaccount; imported writinghelp) and public.test R8 (see 3).

FOR BOB (other modules / design):
1. R49: the design has no keys for the receipt's fingerprint, size, pseudonym, the made secret and "make one for me"; I drew none and invented none. R49 waits on UX-DESIGN.
2. R67: the knock answer carries no `reference` (doorbell R11, door.mjs:142); the page draws it only when the answer holds it. Also `knock`'s declaration lists `content` while the Worker reads `contentB64`/`contentText` (doorbell/index.mjs:795).
3. R8's red is a true finding of the docket's form: `docketfile` declares `edition` and `capture` as required (docket R1: the edition the entry answers, and the captured document); the screen has no fields for either and the design draws none. Needs a drawing.
4. R68: `place` gets no word function, so the crumb cannot say `crumb.project.unjoined`; interface-shell would need to accept a title key from `place`.
5. Registry lists `writinghelp` on `imported`; no field there is a writing field by any requirement. Needs your ruling.
6. `reviewgrant` and `projectowneradd` declare no `reason`; the shell adds it (R107). Harmless to the guard today.

## J8 · REPORT

REPORT (SCREENS-PUBLISH #9). After merging tranche/T51 (B11), three suite tests that were green at #8's stop are red from other modules' declarations, which the guard (interface-shell R104) now compares; none is a screen defect I can fix without weakening a declaration:
1. `writinghelp` (wizard-scripts, `fields.accepts: ["field","told","draftHeld"]`) does not list `op`, but the module's own writingHelp (wizard-scripts index.mjs:1504-1508) reads `{op, field, told, draftHeld}` from the POST body and decides whether help is offered from `op` (`#helpAt`), and `FIRSTHAND_ACTS` from it. The case editor sends `op` (casedraft or whatchangedpropose) as `screens-action/send-steps.mjs:317` does. Needs: wizard-scripts accepts `op`. Red: t50/case-editor R1 "Draft what changed" (common.test R1 test). Other screen modules that send `op` will see the same.
2. `accountpropose` (control-plane owner-ops.mjs:23-24, case-account `accountPropose`) requires `text` and `run` (and `flags` for `account_check`): it stores a draft an AI run made, so a member's act cannot send it. R35's "Draft the account with the assistant" sends `{kind:"case_account", framing}`, which the guard refuses. Needs: BOB's ruling on which op asks the assistant for the draft (R35 names `accountpropose`), then a CHANGE. Red: t50 R35 (two tests).
3. `docketfile` still red as J7 said (accepted red by name, B12).
I carry on with R44, R46, R51, R53, R57, R47, R54, R58, R59, R67 in the order B12 gives.

## J9 · COMPLETE

COMPLETE (SCREENS-PUBLISH #9, session_01QD1BUeBCA9NYY1zJLxnCYq), FR-30 part two: B12's list applied in its order, except R49 and R68, which wait on others as B12 says. Pushed on job/T51/screens-publish; `tranche/T51` @ 0ebdb2fcf2 merged.

**Applied, each with tests that were seen failing against the code before (R50 excepted: #8 built it) and a control.** R44 (case editor: each finding's role as a radio group from `choices.roles`, the team's position from `choices.subject_positions` and its reasoning, left-out rows with their reason and the "nothing material left out" claim sending `excluded: []`, silence sending none; a Save sends only the fields it changed and no targets; the ceremony's Bias step holds the declared bias and the pre-flight and publish send `biasAcknowledgement`); R46 (a tick and optional words per candidate; `tensionsDisclosed` with the pre-flight and publish; ticks kept after a refusal); R50 (all three requests checked by the guard); R51 (`reattest`; self-attested only with a required reason, refused in place without one; `captureaccount` signed through the signer over `bio-capture-account <sha>\n<text>`, offered only to a member `captureaccounts` lists as the capturing actor); R53 (`sever`/`reinstate` from the project document's `references`, the shell asks the reason); R57 (editor: the four details after the first save, before it the note; `casedetailsset` area/contact/related/relationships, read back by `casedetails`; ceremony lists stated or not stated and blocks nothing; published draws `casedetailspublic` and nothing for a field not stated; no classification row); R47 (published: what the case leaves out with who else read it, the disclosed contradictions with a highlighted one by its fixed sentence, the declared bias, each evidence row's grade; each only when the answer holds it); R54 (file chooser, SHA-256 worked out in the page, only the hash sent); R58 (`importregrade` with three lenses, none preselected, moved findings, the statement that moved each, the limit sentence; `rerunstart` with `RERUN_ALREADY` and the owner refusal by their words); R59 (`citeimported` on accepted findings only; `IMPORTED_NOT_ACCEPTED` by its words); R67 as B12 (2): the reference is the `knockId`.

**Not built.** R49: waits on UX-DESIGN HANDOFF B420 (B12 (1)); R68: waits on INTERFACE-SHELL #10 and your CHANGE (B12 (4)); both marked *(not yet met: T51)* in the requirements file. `coverage.mjs` lists R68 (its "R49" is named in a test title that cites interface-shell's R49, not this module's: no test covers it).

**Reds left, none mine to fix without weakening a declaration (J8):** t50/case-editor R1 and common.test R10 (`writinghelp` sends `op`, which wizard-scripts' declaration does not accept; and `imported`'s registry `writinghelp`, B12 (5)); t50 R35 ×2 (`accountpropose` requires `text` and `run`, a stored draft, not a request for one); public.test R8 (`docketfile`, B12 (3)). 163 pass, 5 fail of 168.

**Found elsewhere (P9).**
1. **`OPS` does not hold `casedetails`, `casedetailsset`, `casedetailspublic`, `importregrade`, `rerunstart` or `citeimported`** until the plane (or a test) calls `registerDeclaredOps` with their owners' `DECLARED_OPS`; no product code does today. My tests register those six through the harness's `collectOwnerRows` (`test/m/screens-publish/register.mjs`; registering every owner is refused by link-sweep's `sweepset`, which has no `needs`, R80). Every test that composes the real `SCREENS` without registering now throws "screen case-editor's act names casedetailsset, which OPS does not hold": interface-shell `t50.test.mjs` and `declared.test.mjs`, control-plane `t46-app.test.mjs`, interface-shell `page.test.mjs`. Fix: op-declarations hand rows for the six, or those tests/plane register them.
2. **Words the design owes** (nothing invented; closest existing key used): the four detail names "Area of government", "Point of contact", "Related work", "Relationships" and "Stated" (drawn under `details.area.bodyhint`, `contact.legend`, `rel.link`, `ties.legend`; a stated row shows its date); "Builds on", "Responds to", "Disagrees with" (drawn by their code, the other two relations have keys); "Relied on"/"Supporting" (`case-grammar.load_bearing`, `screen.watching.nr.f.supporting`); "Finding {n}: its role in the case" (the design's key holds "1" and "2" literally; `screen.published.finding` used); the tick's own sentence for "Publish X as self-attested only" (the tick names the document); "Take out" (`screen.panel.limit.remove`); and `case-inputs.details.not_stated` is no word in the table (`hasWord` false), so `screen.person.fact.notstated` is used.
3. `publishpreflight`'s `not_co_attested` lists capture ids only: no capturing member, no finding that rests on each. The row says the capture's short id; `screen.ceremony.conf.intro2` ({finding}) is not drawn; I read `captureaccounts` for the actors. case-authoring could state both.
4. `mk-det` (the design's details block) is no served class (R20): a plain block with `data-detail` is drawn.

**Tests and checks.** `node --test test/m/screens-publish/`: 168 tests, 163 pass, 5 fail (the five above). Process checks: `format` 0; `architecture screens-publish` 0 failures; `words`: no finding in this module's files (testcopy cleared); `coverage`: 67 of 68 ids, R68 named by no test; `ownership`: 1 failure, `build/requirements/screens-publish.md` outside paths, accepted at the merge (B9). The R10 registry test now reads a label as `act.owed_<op>.label.<screen>` when the registry row is `owed:<op>`, since the design keys those acts under the owed name.

Size (session_01QD1BUeBCA9NYY1zJLxnCYq): test runs 22, module lines 3090

## J10 · COMPLETE

COMPLETE (SCREENS-PUBLISH #9), B13 applied. J9's entries stand; `tranche/T51` @ 530cffbe90 merged.

1. `writinghelp`: green after the merge (wizard-scripts accepts `op`).
2. `accountpropose` (R35): the screen sends nothing to it; "Draft the account with the assistant" is still drawn only when the assistant may run, and its press is held (K3717). The two R35 press tests are `test.todo` naming K3717; "Order it", the drawing of a draft and its flags read from `accountdrafts`, the earlier drafts, the BAD_ACCOUNT fold and `NO_SUCH_ACCOUNT_DRAFT` stay tested.
3. `docketfile` stays red by name (B420). Also red by name: common.test R10 for `imported`'s registry `writinghelp`.
4. R54's test now waits for the browser's own hash (it failed once in four full runs under load).

`node --test test/m/screens-publish/`: 170 tests, 166 pass, 2 fail (R10 `imported` `writinghelp`; public R8 `docketfile`), 2 todo (K3717), stable over three runs. Process checks: format 0, architecture 0, words 0 findings in this module; coverage: R68 named by no test; ownership: the requirements file only (accepted, B9). J9's finding 1 (`OPS` holds none of the six declared ops until something registers them, so interface-shell's t50 and declared tests, page.test and control-plane's t46-app throw when they compose the real `SCREENS`) still stands for op-declarations.

Size (session_01QD1BUeBCA9NYY1zJLxnCYq): test runs 27, module lines 3074

## J11 · COMPLETE

COMPLETE (SCREENS-PUBLISH #9), B14 applied; `tranche/T51` merged.

R68 built: the ceremony's `place` answers `projectKey: "crumb.project.unjoined"` when the project's title cannot be read, so the crumb never draws the id; `crumb.project.unjoined` and `refusal.NO_REVIEW_COPY` are in the ceremony's words. Test names R68; control: a readable project draws its title. `register.mjs` stays until test-support's shared helper exists.

`node --test test/m/screens-publish/`: 169 tests, 167 pass, 2 fail, 2 todo. Reds named: common.test R10 (`imported`'s registry `writinghelp`) and public.test R8 (`docketfile`), both UX-DESIGN B420; todo: R35's two press tests (K3717). R49 stays unbuilt (B420). Checks: format 0, architecture 0, words 0 findings here, coverage 0 failures, ownership: the requirements file only (B9).

Size (session_01QD1BUeBCA9NYY1zJLxnCYq): test runs 31, module lines 3080

## J12 · COMPLETE

COMPLETE (SCREENS-PUBLISH #10, session_01XKvVPwnBsk4EaAeXx6RRS9), B15 applied; `tranche/T51` merged (already at its tip).

1. **Capturer and resting findings.** The ceremony's "Documents without a second confirmation" reads `not_co_attested` as `{capture, by, findings}` (case-authoring R82): each row draws the capture, the member who captured it (`by`, as that member's handle when it is the viewer, else as given; none when null) and, for each finding resting on it, `screen.ceremony.conf.intro2` {finding}; the key is in the ceremony's `words`. A bare capture id (the old shape) still draws. I wrote the line as **R69** in `build/requirements/screens-publish.md` (amends R51; the file is outside my paths and the ownership check lists it, accepted as B9): "For each capture the pre-flight lists as `{capture, by, findings}` the ceremony draws the member who captured it (none when `by` is null) and, for each finding resting on it, `screen.ceremony.conf.intro2` with that finding. Test: an entry with a capturer and two findings draws the capturer and both sentences. Control: an entry with `by: null` draws no capturer." Test `R69 …` in `fr30b.test.mjs`.
2. **`register.mjs` removed.** Each test file now calls test-support's `registerDeclared(root, registerDeclaredOps)` (R17); registering every owner now works (the old link-sweep refusal is gone).

**Needs BOB:** `build/modules.json`: add `test-support` to screens-publish's `uses` (as K4245 did for op-declarations). Without it `architecture.mjs screens-publish` fails 14 times, all one line: each test file "imports bio-plane/test/declared-ops.mjs of test-support, which screens-publish does not declare in uses". Nothing else fails.

Accepted reds unchanged: common.test R10 (`imported` `writinghelp`) and public.test R8 (`docketfile`), UX-DESIGN B420; R49 unbuilt (B420); R35's two press tests are `test.todo` (K3717).

Tests: `node --test bio-plane/test/m/screens-publish/`: 172 tests, 168 pass, 2 fail (the two above), 2 todo. Checks: format 0 failures; architecture 14 (the `uses` line above); coverage 69 of 69 ids; words (screens-publish) 0 findings; ownership: 1 file, `build/requirements/screens-publish.md` (accepted).

Size (session_01XKvVPwnBsk4EaAeXx6RRS9): test runs 6, module lines 3090

## J13 · COMPLETE

COMPLETE (SCREENS-PUBLISH #11, session_014kx187U1UAhfvtZdMDfMJG), B16 applied; `tranche/T51` merged (at its tip, 58987e71c1). One red held, named below.

**Applied**
1. **Doorbell (B420 1; R49 built).** "Make one for me" is a tick beside the secret field (`screen.doorbell.secret.make`, `.make.help`); ticked, `knock` sends `generateSecret: true` and no `knockerSecret` (a typed phrase is ignored, the field is emptied after the answer). The receipt draws, each only when the answer carries it: `screen.doorbell.receipt.fingerprint` (the `sha256` shortened in the middle) with `.help`, `.size` (`bytes` written 2.1 MB), `.pseudonym` with `.help`, and `.secret` with `.secret.note` (the made phrase, in page memory only: no storage, address or later request). R67's reference is unchanged.
2. **Docket file form (B420 2).** `docketfile` now sends `edition` (one `screen.docket.edition.option` per ratified edition of `publishedcase`'s `edition_index`, the latest first and chosen) and `capture` (the sha of a capture of `heldcaptures` for the project, `screen.docket.capture.option`), beside kind, from, summary, where it goes and the reason; `screen.docket.capture.add` ("Capture it first") is a reference to `capture`. With no edition or no document chosen it sends nothing and says `screen.docket.file.needed`. public.test R8 is green (the guard's two missing fields were these).
3. **`imported` keeps `writinghelp` (B420 3).** The citing note of "Rest one of your team's questions on this" carries the assistant's help while it is reachable (`op: citeimported`, `field: note`); the draft fills the note labeled machine work. common.test R10 is green for `imported`.
4. **B428.** The case editor, the ceremony and the published page name the four details by `screen.case-editor.details.name.*`; "Not stated" is `case-inputs.details.not_stated`; the ceremony marks a stated detail `screen.case-editor.details.stated`; related work's relations all have words (`.rel.builds_on`, `.responds_to`, `.disagrees_with`, with `.same`, `.other`); "Take out" is `screen.case-editor.details.takeout`; a finding's role choice is labeled `screen.case-editor.finding.role` ({n}) with `screen.case-editor.role.relied|supporting`; each unconfirmed document's tick is `screen.ceremony.conf.self.tick` ({document}, the short fingerprint: the pre-flight row states no title).
5. **Words (R24).** Every key above is listed by the screen that draws it. The regenerated reads list also names nine keys no screen listed (refusals the plane may answer): listed where a screen may draw them: `refusal.IMPORT_ACCEPT_NO_REASON`, `refusal.IMPORT_NOTHING_ACCEPTED` (imported), `refusal.NOT_THE_PROJECT_OWNER`, `refusal.PROJECT_ACT_NOT_THE_OWNER` (case-editor, ceremony), `refusal.NO_SUCH_CASE` (published, docket, docket-public), `refusal.REVIEW_NO_SUCH_CASE`, `screen.action.pressure.note` (docket), `refusal.SECRET_NOT_RECOGNISED` (doorbell), `refusal.reference` (case-editor). None is "not drawn here".

**Held red (one), cause in another module.** common.test R10, docket: the docs registry (`registry.json`) gives `docket` the act `writinghelp` (B420 2: the summary), but the registry `interface-shell` checks against, wizard-scripts' `SCREEN_REGISTRY` (`bio-plane/src/wizard-scripts/screen-registry.mjs`, `docket` acts `docketfile, docketpost, casedraft`), does not, and `checkScreens` throws on an act it does not hold. So the act and the help button are not built; wizard-scripts must re-take the registry (as `imported` already has it) and then docket gets the act (the same one `imported` now has, 12 lines) and `screen.docket.summary` help. Nothing else is red.

**Found in another module.** (a) wizard-scripts: the registry above. (b) Generated artifacts made stale by this change: the plane bundle (`node bio-plane/scripts/bundles.mjs`) carries screens-publish's code. (c) For the design: `screen.start-send.draft.machine` is reused as the label of the assistant's draft on `imported` (its own key family has none); the receipt's size units (B, kB, MB) are symbols in code, as the design said ("2.1 MB").

**Requirement lines for BOB** (build/requirements/screens-publish.md; not edited by me):
- R49 now met (drop "not yet met"): "The doorbell's tick `screen.doorbell.secret.make` (with `.make.help`) sends `generateSecret: true` and no `knockerSecret`; the receipt draws `receipt.fingerprint` (+ `.help`), `.size`, `.pseudonym` (+ `.help`) and `.secret` (+ `.secret.note`) each only when the answer holds it, and keeps the made phrase nowhere."
- R8 amends: "`docketfile` sends `edition` (a ratified edition of the case, the latest first) and `capture` (a document the project's captures hold) beside the rest; either missing, nothing is sent. `heldcaptures` (the project) and `publishedcase`'s `edition_index` are read for the choices; `screen.docket.capture.add` is a reference to `capture`. `writinghelp` on the summary waits on wizard-scripts' registry."
- R7/R59 amends: "the citing note of `citeimported` carries `writinghelp` while the assistant is reachable."
- R57 amends: "The details are named `screen.case-editor.details.name.<field>`; a detail not stated reads `case-inputs.details.not_stated`; the ceremony marks a stated one `screen.case-editor.details.stated`."
- R44 amends: "a finding's role choice is labeled `screen.case-editor.finding.role`, its choices `screen.case-editor.role.relied` and `.supporting`." R51 amends: "each document's tick is `screen.ceremony.conf.self.tick`."

**Tests and checks** (from `bio-plane`, node_modules present): `node --test test/m/screens-publish/`: 179 tests, 176 pass, 1 fail (R10, docket, above), 2 todo (R35's two press tests, K3717). New tests: R49 ×3 (fr30), R59, R57, R44, R51 (fr30b), R8 extended (public). Process checks: format 0 failures; architecture 0 failures; coverage 69 of 69 ids, 0 failures; ownership 0 failures (my paths only).

Size (session_014kx187U1UAhfvtZdMDfMJG): test runs 9, module lines 3163

## J14 · COMPLETE

COMPLETE (B17, entry 1 of 1).
**Applied.** `docket` draws `writinghelp` beside "File a docket entry", on the summary ("What it says"), only while the assistant is reachable and never under the reason; it sends `{op: "docketfile", field: "summary", told}` (nothing when nothing was typed) and fills the field with the draft labelled machine work, as `imported` does. Its label is `act.writinghelp.label.docket` (a design row, `words.json`); the screen's R10 registry test is green. Drawing note: `mock-screens.js` at `09fbb247eb` draws no "Help me write this" button on the docket (its summary field is drawn with `act: 'docketfile'` only), but the registry and the rows hold the act and your entry names it, so it is drawn as the other screens draw theirs; HANDOFF to the design if the drawing should show it.
**Requirement line for BOB** (R8's note ends "`writinghelp` on the summary waits on wizard-scripts' registry re-take"): that wait is over; suggest "`writinghelp` on the summary is drawn only while the assistant is reachable and sends `op: docketfile`, `field: summary` and what was typed".
**Deferred / other modules:** none found.
**Tests (written first, seen failing):** fr30.test.mjs "R8 the assistant helps with the docket entry's summary…" (with control: no assistant, no help) and "…sends nothing when nothing was typed". Module suite: tests 181, pass 179, fail 0, todo 2 (not mine). 
**Checks:** format 0 failures; architecture 0 failures; coverage screens-publish 69 of 69 ids named, 0 failures; ownership 0 failures; words: no finding in my module (one testcopy in op-grades, not mine).
Size (session_01DSyTGX3VcuNJFGfRqwxGBs): test runs 4, module lines 3180

## J15 · QUESTION

QUESTION (J1, SCREENS-PUBLISH #13, fix round 2). Best readings first; I carry on with all of it.

1. **C48 / R70: the prepare confirmation is the shell's, not the screen's (one test stays red until you rule).** The Ties step's `publish` is a terminal-weight act, so interface-shell R11 draws its confirmation dialog, and that dialog states `act.<op>.does` = `act.publish.does` ("Publishes the signed edition for anyone to read. It can never be unpublished…"), a protected row written before T47 when `publish` still published (op-grades R37: it now only prepares). A screen cannot choose the dialog's sentence. I draw the button through the kit's `here` option (R90), so its explanation is `act.publish.here.ceremony`, but the dialog still draws `.does`. Options: (a) **interface-shell: R90's `here` word also explains the act in its confirmation dialog** (recommended; one small change, every screen that gives an act a place-word gains it); (b) the design rewrites `act.publish.does` for what the op now does. My test `R70 C48 the confirmation of "Confirm, and prepare Edition n"…` asserts the dialog carries neither `act.publish.does` nor anything irreversible and carries `act.publish.here.ceremony`; it is RED by name until (a) or (b) lands (I do not weaken it). Also: R70 says only the Sign step says publishing cannot be taken back, but `screen.ceremony.permanent` ("Publishing makes this edition permanent and public…") is drawn at the top of the whole ceremony and `common.test` R10 expects it there; I left it and the test alone. Say if it should move into the Sign step (then I change that test line with your ruling).
2. **C47 reading.** Empty evidence is by design; I did: the editor's box `ce-statement` is labelled `review.statement.title` ("What the case says it does not cover", the key `review-outside` already uses for this very text), and the file saved from the review copy labels it the same and draws each finding by `statement`. The Sign step: "documents the case rests on that are not published with it" = the signed document's citations that are no finding of the edition and carry no full SHA-256 version (what a sitting signs as evidence is what is published); it says them with `screen.published.rests.on.the.council.minutes` / `.one`, and counts evidence with `screen.ceremony.signs.count` only when at least one is signed, else it draws `screen.ceremony.signs.linesabout` (no key holds the count without the evidence clause; owed to the design if you want it back: "One confirmation signs all {n}: the edition and its {findings} findings."). Confirm or correct the reading.
3. **C50.** I read the case's published editions from the public `publishedcase` by `caseId` alone (a never-published case answers NOT_PUBLISHED and draws nothing). When any edition is public the reopened ceremony draws `signing.ceremony.signednow` ({edition} the latest) and a link to `/app/published/<case>/<n>` worded `screen.ceremony.publicpage`; when the edition the draft stands at is itself published, it offers nothing to prepare (a later edition is started from the docket, R52). No row holds "Published: edition N" as such; owed key if you want exactly that.
4. **C51.** At the Sign step with no key held the kit's sign dialog already offers "Use a key file you already have" (`shell.signer.load`) and signs with it (my test proves it: no key registered at the signing). What was wrong in the screen: after `NO_ATTESTING_KEY`, "Register a signing key in this browser" always made a NEW key, even with one held; it now registers the held (or loaded) key's public line instead, and makes one only when none is held. The kit has no `cs.signer.load` for a loader outside the dialog (interface-shell gap if you want one on the page). Default of "keep this key" unchanged.
5. **C52.** The screen already sends the draft its comment belongs to (the displayed draft, each of two drafts) with the text in the body; the owner's refusal is on the plane side (review `comment()` / control-plane `caseReader`), so no change in this module beyond adding `refusal.NO_REVIEW_COPY` to the review copy's words. My two-drafts test passes and stays as the screen's half.
6. **C67 (my half).** The sign step says "minutes can't be read" when case-authoring answers `minutes: {undetermined: true}` for a step that was not reached; I draw nothing for minutes when the step's `open_requests` says it was not reached (`read: false`, not undetermined). A reached step whose minutes could not be read still says so. The other half (citations of an earlier draft's question) is case-authoring's.

## J16 · COMPLETE

COMPLETE (SCREENS-PUBLISH #13, fix round 2, wave 2). Branch job/T51/screens-publish @ 13b780580d, merged with tranche/T51 at its wave-1 tip. Answers B19 applied.

**Causes met** (each: C-number, requirement ids, the test in `bio-plane/test/m/screens-publish/fix2.test.mjs`; every test written first and seen failing against the unchanged source, 11 red of 15, the four green ones named below):
- **C2** (R6, R37): `published` draws a finding's claim and falsifier as words: signed document's `case_words`, then `body.conclusion` / `body.falsifies`, then the authored words; a leading markdown heading is no words (a body that is only "## Conclusion" falls to the authored claim; heading plus words draws the words); the question is never the claim; the card, the finding's own page, the print and the "Check a file you hold" answer all read it through one part. Controls: signed words with empty authored fields; nothing invented where there are none.
- **C3** (R51, R3): already true, test only: a pre-flight whose publish was refused CO_ATTESTATION_UNACKNOWLEDGED and that lists the captures in step three draws the list, Retry (`reattest`), the tick and the reason box; a ready one lists none. Green before and after.
- **C46** (R1, R61): the screen half was already true (editor and `review-outside` draw `statement`, never the log); test only, green before and after. One real fix: the stamped file saved from the review copy (R40) drew a finding by its `text`; it now draws `statement` first.
- **C47** (R1, R13): the editor's box for the case's statement of what it leaves out is labelled `review.statement.title` (also in the saved file); the Sign step counts evidence with `screen.ceremony.signs.count` only when something is signed, else draws `screen.ceremony.signs.linesabout`, and says `screen.published.rests.on.the.council.minutes` / `.one` for the documents the document cites that are no finding and carry no full SHA-256 (not published with the case). Control: published evidence is counted and listed; a case resting on none says none.
- **C48** (R70): separate steps: once the edition is prepared the gates ("put these right") are no longer listed; a reload draws the prepared edition, read from the record (`casedocument` of the case edition the draft stands at; a prepared one is unsigned with `sign.statement`; NO_CASE_DOCUMENT is not prepared) and the reloaded page signs it (findings pinned from the document's citations); `screen.ceremony.permanent` moved from the head of the ceremony into the Sign step (common.test R10 brought to it); the Ties button is drawn with the kit's `here: "ceremony"` (the `P.explained` hack and part removed). **RED BY NAME (accepted, B19): `R70 C48 the confirmation of "Confirm, and prepare Edition n" …`** — the confirmation dialog is interface-shell's and still draws `act.publish.does`; green when CAUSE-SHELL-T51's change (R90's `here` word in the confirmation) merges; I ran it against nothing weaker. Control: sign keeps its weight (`data-weighed`), the Sign step still says it cannot be taken back.
- **C50** (R71): the ceremony reads the case's published editions from `publishedcase` by `caseId`; when any is public it draws `signing.ceremony.signednow` ({edition} the latest) and the link `/app/published/<case>/<n>` (`screen.ceremony.publicpage`); when the edition the draft stands at is itself published nothing is offered to prepare; an earlier edition public and the draft at the next: both shown, the next prepared as such. A never-published case answers NOT_PUBLISHED and draws nothing; any other failed read is drawn failed.
- **C51** (R72): a key file made earlier is loaded at the Sign step and signs (the kit's sign dialog already offers it when no key is held; test proves it, green before and after, nothing registered at the signing); the screen's real defect fixed: "Register a signing key in this browser" always made a new key even with one held (four keys); it now registers the held (or loaded) key's public line and makes one only when none is held. Default of "keep this key" unchanged. Control: a device holding none makes and keeps one.
- **C52** (R2, R62): screen half only, test only, green before and after: with two drafts the Reply sends the displayed draft's own id and the text, for the older, the newer and the project's newest; a refusal NO_REVIEW_COPY is drawn by its words (`refusal.NO_REVIEW_COPY` added to the review copy's list). I could not reproduce a screen-side cause; the refusal is on the plane side (review `comment()` / control-plane `caseReader`), not shown by reading.
- **C66** (R2) my part: a member who may not share (no `reviewgrant`) is drawn no share boxes and no "Share with a named reader" heading, only "Save as a file"; one who may is unchanged. Not mine: reply shown back, "Show the routes", the queue's `limit` (screens-action, queue; this module sends no `queue`).
- **C67** (R42) my part: the minutes line is not drawn when the sign step was not reached (`open_requests: {read: false}`, no `undetermined`); a reached step whose minutes could not be read still says so. The citations half is case-authoring's.
- **C49**: left, as ordered (no drawing from the design lane).

**Also fixed in this module** (P8): the case editor no longer draws a failed block for a draft whose edition was never prepared (NO_CASE_DOCUMENT is not a failed read).

**Test fixtures** (my tests only): `plane()` now answers `casedocument` as publication R1 does (NO_CASE_DOCUMENT until `publish` answers), `publishedcase` asked by `caseId` alone answers NOT_PUBLISHED, and `PUBLISHED_CASE` is exported (three files used `plane().publishedcase.json.result`); style.test's EMPTY plane likewise.

**Suites**: `bio-plane/test/m/screens-publish/`: 196 tests, 193 pass, 1 fail (the R70 confirmation, above), 2 todo (R35's press, K3717; baseline at start 181 tests, 179 pass, 0 fail, 2 todo). Used by what I changed (`impact.mjs`): control-plane 58 files, 308 tests, 308 pass; plane 11 files, 84 pass of 85 — the one is `plane/r42-entry.mjs`, which loads a `cloudflare:` module and cannot run under plain node (the impact list names it; not caused by this job).
**Checks** (`checks/run.mjs /home/user/bio`): format 0 failures; architecture 0; words 0 (screens-publish none); coverage 72 of 72 live ids named (screens-publish 0 failures; the other 9 failures are other modules'); `ownership.mjs`: 16 files, 0 failures.

**Reported to BOB / found in other modules** (P9): (1) interface-shell: the confirmation dialog takes `act.<op>.does` only (answered B19, (a)). (2) case-authoring R77: a sign step not reached answers `minutes: {undetermined: true}`, which cannot be told from a failed read; suggest `minutes: {read: false, stated}` as `open_requests` does (I handle the not-reached case from `open_requests`). (3) C52: nothing found in the screen; the owner's refusal is for review / control-plane. (4) `impact.mjs` lists `plane/r42-entry.mjs` as a test file; it is an entry, not a test.

**Words owed to the design** (joins the batch, B19): the Sign step's count line without the evidence clause ("One confirmation signs all {n}: the edition and its {findings} findings", now `signs.linesabout` in its place); "Published: edition {n}" for the reopened ceremony (now `signing.ceremony.signednow` + `screen.ceremony.publicpage`); optionally one sentence for a member who may not share ("only an owner shares a review copy").

**Requirement lines for BOB**: (R6, R37 amend) a finding's claim and falsifier are drawn from the signed `case_words`, else `body.conclusion` / `body.falsifies`, else the authored words, a leading heading being no words. (R1 amend) the statement box is labelled `review.statement.title`; a never-prepared edition is no failed read. (R40 amend) the saved file draws a finding by its `statement`. (R13 amend) the Sign step counts signed evidence only when there is some, and says the documents the case rests on that are not published with it. (R2 amend) a session that may not share is drawn no share boxes. (R42 amend) a sign step not reached draws no minutes line. R70 (amend): the confirmation wording is interface-shell's `here`; the ceremony draws the Ties button with `here: "ceremony"`, keeps no gate beside a prepared edition, reads a prepared edition from `casedocument`, and says in the Sign step alone that publishing is permanent. R71 (amend): reads `publishedcase` by `caseId` and draws `signing.ceremony.signednow` with the link; a draft whose own edition is public offers nothing to prepare. R72 (amend): the held or loaded key is the one registered.

Size (session_01Rhp6na81MpPN6AKxgGZrBC): test runs 19, module lines 3257

## J17 · COMPLETE

COMPLETE · SCREENS-PUBLISH #14 · T51 fix round 2 (B20, B21). Merged `tranche/T51` (tip 8edc73eb8e) before the last run.

**Entries applied**

- **C49** (DEC-394 (1), DEC-395). The case editor, the review copy and the ceremony each offer "Which draft" (`casedrafts`, `act.casedrafts.label.<screen>`): a choice among the project's drafts, newest first, each `screen.<screen>.drafts.item` (scope and the day prepared, both record data) and the newest followed by `.drafts.newest`, the one the screen shows chosen, `.drafts.help` and `.drafts.choose` under it. The registry's act follows the choice (the shell's `cs.choice` with `acts`); pressing it reads `casedrafts` once and opens the same screen on the draft chosen (`<project>/<draft>`); the draft already shown, or one the plane no longer lists, stays. This clears common.test R10 (`casedrafts` on the editor).
  - **Live links.** The review copy draws `screen.review-copy.links.heading` (+ `.help`, `.note`): every live review link on any draft, each with its reader, the draft it is on (`drafts.item`), what it lets the reader do (the roster's own sentence), and "Stop sharing" (`reviewrevoke`, the grant). A stopped or lapsed grant is no live link; after the act every draft is read again. The case editor and the ceremony draw `screen.<screen>.links.live` (`{count}`, `{earlier}`) as a reference to the review copy.
  - **Chooser details.** One read of `reviewcopy` per draft other than the one shown (`casedrafts` carries no scope; the copy carries `authored.scope`, `grants` with `live`, `comments`); the chosen draft's read is reused. The chooser waits for every draft's scope (drawn loading, never guessed); a draft with no stated scope is named by `case.draft.untitled`, never an id. The ceremony opened on a draft now also reads `casedrafts`; if that read fails it is drawn failed and the ceremony goes on.
- **B21 (DEC-396 (11))**: `screen.ceremony.signs.count.findings` ({n}, {findings}) is the Sign step's count line when no evidence is signed with the case (it takes the place of `signs.linesabout`, as the evidence-count sentence already did); `screen.ceremony.published.edition` ({n}) is the reopened ceremony's "Published: edition N" (R71's own sentence; it takes the place of `signing.ceremony.signednow` there, which a just-signed edition keeps). Tests fix2 R71 (three assertions) moved to the key.

**My readings (say if one is wrong)**

1. The chooser and the second list are drawn only where there is a choice: **two drafts or more**. With one draft the screen is as before (the editor's one row, the review copy's roster) and no extra read is made. The live-links list is drawn only with two or more drafts and some live link (with one, the roster is the list).
2. `screen.<screen>.links.live` is drawn only when **some live link sits on an earlier draft than the newest** (`earlier` > 0), not whenever `count` > 0: the sentence would otherwise read "… 0 of them on an earlier draft" (R20: no count at zero).
3. "The day it was prepared" is the draft's `created_at` (its `updated_at` where none is stated), as `cs.date` draws it.
4. The editor's list of drafts (a row each, identical titles) is replaced by the chooser when there are two or more; one draft keeps its row.

**Words owed to the design (K3366; none written here)**

(a) The live-link rows: DEC-394 names "when" (shared) and "how many comments that reader made"; no key holds "shared {date}" or "{n} comments", so a row draws the reader, the draft line and the end-of-sharing sentence only. (b) `screen.<screen>.links.live` reads "{count} review links are live": with one link, "1 review links are live" (a singular/plural pair is owed, as `…rests.on.the.council.minutes.one`). (c) The chooser field's label has no key of its own; it uses the act's, `act.casedrafts.label.<screen>` ("Which draft"), as does its following button. (d) `screen.ceremony.signs.linesabout` is no longer drawn on the ceremony (the count line replaced it); the row stays in `words.json`.

**Requirement lines proposed for BOB (R73; amends R1, R2, R3)**

- **R73** (fix round 2, C49; DEC-394 (1), DEC-395; `review` R19; amends R1, R2, R3) **A project's earlier drafts.** `case-editor`, `review-copy` and `ceremony` each offer, where the project has two drafts or more, "Which draft" (`casedrafts`): each draft named by `screen.<screen>.drafts.item` (its scope, from its review copy, and the day it was prepared), newest first and marked `.drafts.newest`, the one shown chosen; choosing another opens the screen on it. `review-copy` draws `screen.review-copy.links.heading` where two drafts or more exist and some link is live: every live review link on any draft (a grant `review` answers live, or one neither stopped nor lapsed), each with its reader, its draft and "Stop sharing" (`reviewrevoke`); `case-editor` and `ceremony` draw `screen.<screen>.links.live` (`{count}`, `{earlier}`, a reference to `review-copy`) when some live link sits on a draft earlier than the newest. Test: two drafts, one live grant on each and one stopped, draw the chooser with both drafts by scope and date, the two live links each with its draft and "Stop sharing", and the count note; the chooser opens the draft chosen. Control: one draft draws no chooser and no extra read; a stopped grant is not listed; a list of drafts that fails is drawn failed.
- **R13 amend**: with no evidence signed with the case, the Sign step's count line is `screen.ceremony.signs.count.findings`. **R71 amend**: the reopened ceremony's line is `screen.ceremony.published.edition`.

**Tests** (each seen failing first: 12 of drafts.test.mjs's 16 red before the code, the 4 controls green; red-then-green on the changed code)

- New `bio-plane/test/m/screens-publish/drafts.test.mjs`, 16 tests (R1, R2, R3, R13, R71, C49): the chooser on each of the three screens (options, order, marks, chosen, act, help), choosing an earlier draft opens it and choosing the one shown stays, one draft draws no chooser and no extra read, the chooser waits for an unread scope, every live link on any draft with its draft and its own Stop sharing, stopping one on an earlier draft sends `reviewrevoke` with that grant and the list is read again without it, one draft draws no second list, the editor's and ceremony's note (and none when nothing sits on an earlier draft), a failed drafts list drawn failed with the ceremony kept, the Sign step's count line and "Published: edition N".
- `node --test --test-force-exit bio-plane/test/m/screens-publish/`: tests 212, pass 210, fail 0, todo 2 (R35's press, K3717; baseline at start 196 tests, 193 pass, 1 fail = common.test R10, now green).
- Users by `build/plan/impact.mjs origin/tranche/T51 HEAD`: control-plane 58 files, tests 308, pass 308, fail 0; plane 11 files, tests 85, pass 84, fail 1, the one `test/m/plane/r42-entry.mjs`, an entry that loads a `cloudflare:` module and cannot run under plain node (also at the tranche tip; named, not mine).

**Checks** (from the process repository)

- `checks/format.mjs`: 175 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs bio screens-publish`: 32 product files, 83 relative imports; 0 failures.
- `checks/coverage.mjs bio screens-publish`: 72 of 72 live requirement ids named by a test; 0 failures.
- `checks/words.mjs bio screens-publish`: 9256 string literals read; 0 failures (inline 0, unkeyed 0).
- `checks/ownership.mjs bio screens-publish tranche/T51`: 8 files changed by screens-publish; 0 failures.

**Deferred**: nothing. **Found in other modules**: nothing new. **Declared census ops**: this module owns none (its screens send ops other modules own; the harness compared every request with its owner's declaration, R104, all accepted, `casedrafts` with `{query: {project}}`).

Size (session_012aJfMWZGFkW8VcAjPvgTSg): test runs 11, module lines 3410

## J18 · QUESTION

QUESTION · SCREENS-PUBLISH #15 · fix round 3 (carry on meanwhile; nothing blocks, each is my best reading)

1. **Words the design has not written (one list, as your START asks).** Each is drawn as its key (interface-shell R5) until the row lands; a drawn module cannot use `localize` (its functions are serialised to the browser, and the words check counts any English in the source), so there is no English stand-in and no test holds a sentence. Keys needed:
   - `screen.ceremony.conf.row.missing.timestamp` (C40: the document has an outside copy but still no trusted time stamp), `screen.ceremony.conf.row.missing.co_archive` (it has a time stamp but still no outside copy), `screen.ceremony.conf.row.done` (both proofs now exist). `screen.ceremony.conf.row.meta` stays for neither. The late-timestamp sentence is the plane's own (`late_words`), drawn as it gives it.
   - `screen.ceremony.registering` (C51: the progress line while a signing key is made and registered).
   - `shell.keyfile.none`, `.unreadable`, `.empty` (cause-shell-3's; the Sign step draws `.unreadable` / `.empty` when the key file chosen cannot be read; `.none` is never drawn).
   - `review.index.not_concluded_yet` (review's own key): the editor and the outside reader draw the plane's `not_concluded` sentence; this key is drawn only if the answer carries none.
2. **A gap in interface-shell for C51 (not blocking; I used what exists).** `cs.keyFile(inputId)` answers a file's text, but nothing hands that text to `cs.signer`. The Sign step now offers "Your key file" (`shell.signer.loadfile`) and, when the member signs with no key held, reads the file by `cs.keyFile` and puts its text in the kit's own sign dialog box (`cs.fill("cs-key-file", text)` once the dialog is drawn, found by a second `cs.signer.held()` that answers after the dialog is drawn), so she types only the passphrase. It works and is tested, but it depends on the dialog's box id and on the order of two signer calls. Proposal for BOB to put to interface-shell: `cs.signer.sign(statements, {keyFile})` (or `cs.signer.load({text, pass})`) so a screen hands the text over. Say if you want the proposal made a requirement; until then the screens-settings Account section can do the same.
3. **Reading, C49 (test only).** The chooser fix held: opened on the earlier draft, each of the three screens' heading is that draft's and the chooser has it chosen; nothing changed in the code, the test (fix3.test.mjs) pins it.

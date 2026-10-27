# Causes of the 0.87.0 live walk, area D: reaching conclusions and publishing (K5348; fix-round.md)

Diagnosis worker D, 2026-10-27. Source: `tranche/T51b` at `1807adf9929` (worktree `walk/T51b-causes-D`). Findings read whole from `D.md` (L-B1, L-1 to L-25, the four re-walk 11 rows, the dead-end census). No test suite was run; the only code executed was one regular-expression match (D-K1). No sign-in was made, so nothing here was confirmed against the live copy; each cause says what would prove it there. Paths are under `bio-plane/src/`; module names are those of `build/modules.json`.

Counts: 21 entries (D-K1 to D-K21; D-K20 and D-K21 are DESIGN) plus 3 UNKNOWN (D-U1 to D-U3); design wording inside D-K2, D-K15 and D-K19 is marked there. Severity is the highest of the cause's findings.

## Summary table

id | severity | owning module | file:line | explains
--- | --- | --- | --- | ---
D-K1 | BLOCKER | connections (writer), boundary with record-grammar (checker) and promotion (gate) | connections/index.mjs:1030; record-grammar/bundle.mjs:665-669; promotion/index.mjs:512 | L-B1, dead end 3
D-K2 | MAJOR | screens-inquiry, boundary with strength and screens-publish | screens-inquiry/question.mjs:707-717; strength/index.mjs:929-930; screens-publish/published-parts.mjs:126-128 | L-3
D-K3 | MAJOR | screens-publish | screens-publish/ceremony.mjs:268, 277 | L-16 (hash for a title)
D-K4 | MAJOR | case-disclosures | case-disclosures/index.mjs:363 | L-16 (machine instant "existed by 2026-10-27T05:56:32Z")
D-K5 | MAJOR | screens-publish | screens-publish/case-editor.mjs:178, 182, 368-373 | L-8
D-K6 | MINOR | screens-publish | screens-publish/case-editor.mjs:88, 123, 267, 401 | L-9, dead end 5
D-K7 | MINOR | screens-publish | screens-publish/case-editor.mjs:94, 121, 126, 178 | L-10, re-walk row "R135 radio and box" NOT FIXED
D-K8 | MINOR | screens-publish | screens-publish/case-editor.mjs:423-429; screens-publish/parts.mjs:45 | L-14, dead end 6
D-K9 | MINOR | case-check, boundary with screens-publish | case-check/index.mjs:262 with screens-publish/case-editor.mjs:130-148 | L-22, dead end 4
D-K10 | MINOR | screens-inquiry | screens-inquiry/project.mjs:76-86 | L-1
D-K11 | MINOR | screens-inquiry | screens-inquiry/question.mjs:772-780 | L-4, dead end 10 ("Shared origin")
D-K12 | MINOR | screens-inquiry | screens-inquiry/question.mjs:762, 992 | "reading-1" (known gap)
D-K13 | MINOR | screens-publish | screens-publish/review-copy.mjs:112, 118, 165 | L-7
D-K14 | MINOR | screens-publish | screens-publish/review-copy.mjs:196-199 | L-11, dead end 1
D-K15 | MINOR | review, boundary with screens-publish | review/index.mjs:187; screens-publish/review-copy-file.mjs (`fileName`); screens-publish/review-outside.mjs:41 | L-12 (file name), L-13
D-K16 | MINOR | interface-shell | interface-shell/browser.mjs:2097 (`besideAct`) | L-17, dead end 8
D-K17 | MINOR | screens-publish | screens-publish/ceremony.mjs:407-409 | L-18
D-K18 | MINOR | screens-publish | screens-publish/docket.mjs:13, 24-28 | L-24, dead end 9
D-K19 | MINOR | queue-producers | queue-producers/index.mjs:2070-2095 | five Queue items from one walker's key registrations (alpha D-m8), design question
D-K20 | MINOR, DESIGN | UX-DESIGN | words quoted below | L-2, L-15, L-19, L-21, L-12 (drop-down and two buttons), dead end 10 (census words)
D-K21 | MINOR, DESIGN | UX-DESIGN / Bob (scope policy) | not code | dead end 7 (members see other projects' document names, alpha D-m9)
D-U1 | UNKNOWN | | | L-25
D-U2 | UNKNOWN | | | L-23
D-U3 | UNKNOWN | | | L-20


## D-K1 BLOCKER: L-B1, a case on one capture cannot be signed ("history file ... maps to no manifest entry C-12.2")

**Cause.** The capture's manifest did not lose anything. The history file that C-12.2 refuses was written by a different writer under a snap key that C-12.2 can never map, so the checker, not the store, is blind to it.

1. `connections/index.mjs:1028-1031`, `#writeLinkReferences`, which writes a source document's resolved links into its `references[]` by one promotion of the capture's bundle:
   `snapKey: \`${when.replace(/[-:.]/g, "")}_links_${randHex(4)}\``
   `when` is `this.now()` (`connections/index.mjs:152`, `new Date().toISOString()`), which carries milliseconds. The key is therefore `20261027T055633609Z_links_21a053f2`: milliseconds kept, an extra `_links_` word.
2. Every other capture writer uses the form the checker expects, seconds only and `_<8 hex>`: `capture-requests/index.mjs:641` (`stampInstant("second", nowMs)`) and `:1092` (`${at.replace(/[-:]/g, "")}_${randomHex(4)}`), `promotion/index.mjs:1092`, `:1246`, `citation/index.mjs:219`.
3. `record-grammar/bundle.mjs:665-669` (C-12.2) maps each `_history/` file to a manifest entry only by `/_((?:\d{8}T\d{6}Z)_[0-9a-f]{8})(?:\.|$)/`, or `promotion_<key>.json`:
   ```
   const m = /_((?:\d{8}T\d{6}Z)_[0-9a-f]{8})(?:\.|$)/.exec(p) || /^_history\/promotion_(.+)\.json$/.exec(p);
   const key = m ? m[1] : null;
   if (!key || !keys.has(key)) { findings.push(f('C-12.2', 'error', ... 'history file \'{p}\' maps to no manifest entry' ...
   ```
   I ran this expression on the three names the walker quotes: `_history/bundle_20261027T055633609Z_links_21a053f2.md` and `_history/data/dataset_20261027T055633609Z_links_21a053f2.json` give `null`; the same name with a seconds-only stamp and `_aaaaaaaa` gives a match. So the finding is the whole rule, deterministic, not a race.
4. The promotion copies every file the bundle had into `_history/` under that key (`connections/index.mjs:1017-1027` carries all live paths), which is why three files are listed (`bundle_...md`, `data/dataset_...json`, `data/provenance_...json`). The manifest entry exists, under the odd key; it is only that the checker's pattern cannot read it.
5. Why that one capture and not the other two: the walker's own reading ("the `_links_` history files (05:56:33Z)... follows the one capture") is right as to which bundle holds the file. Why only people.htm got a links promotion is the part I have not seen on the live copy: `#writeLinkReferences` returns without promoting when `add` is empty (`connections/index.mjs:997`: no link of the page resolves to a held document that its references do not already carry). The people.htm page links to the alpha walk's already-held index.htm (INFO-2026-0177, which D's first capture attempt had hit), so its links resolved and promoted two seconds after the capture (05:56:31 to 05:56:33); the Plan Your Visit page and the generated text file had nothing held to resolve to. **That the resolved target is INFO-2026-0177 is not proven.** What would prove it: read `INFO-2026-0244`'s `references[]` (a `links_to` entry with `asserted_by: source`) and its `_history/manifest.json` on the copy, and check that the one key not of the `<stamp>_<8 hex>` shape is `..._links_21a053f2`. Any capture whose page links to a document the record already holds is expected to hit this, and so is any later capture that a held page links to (`relinkTargetsOf`, `connections/index.mjs:1060`, `:1452`).
6. The write is not stopped where it is made: `promotion/index.mjs:512-514` accepts any non-blank `snapKey` ("a non-blank string"), and nothing in `promotion/checks.mjs` or record-core states the shape. The shape is a contract held only by the checker (and by the comment in `test/m/ratification/converted-d.test.mjs:29-31`, "`<YYYYMMDDTHHMMSSZ>_<8 hex>`, C-12.2... or the gate refuses the image for that alone"). The gate that runs at signing (`case-checker/program.mjs`, generated from record-grammar) is therefore the first place the key is judged, long after the member has done everything right; and the pre-flight is clean because it does not run C-12 over the evidence's history.

**Boundary (K4164).** One cause across three layers: the writer (connections) breaks a contract that the checker (record-grammar) holds and the gate (promotion) does not state. BOB must decide where the fix lives: (a) connections writes a conforming key (`<second stamp>_<8 hex>`; the `links` word, if wanted, inside the 8 hex or a second field); (b) record-grammar's C-12.2 accepts the documented family of keys, and (c) promotion refuses a malformed key at write so no writer can do it again. The fix must also handle bundles already holding such files on live copies (the existing `_links_` entries stay unmappable under (a) alone; only (b), or a rewrite, clears them; rewriting history is not allowed, so (b) is required for them).

**Same-shape risk, not walked.** Other writers also use keys that do not fit: `strength/index.mjs:1590` (`<stamp ms stripped>_bar<nonce>`), `investigation/index.mjs:1021` (`_plan<id>`), `:1277` (`_close`), `contradiction/index.mjs:2417`, `:2495` (`takeup_...`, `resolve_...`). Whether the bundles they write are in the image the signing gate checks (the case's cited documents and the case) I did not trace; if any is, the same refusal follows. Worth one test that walks every `snapKey:` writer through C-12.2.

**Why the tests missed it.** `test/m/connections/converts-links.test.mjs:279-296` is the only test that runs `checkBundle` over a link-written bundle, and it (a) builds its `files` map from `record.livePaths` only, so no `_history/` file is in the image, and (b) keeps only `C-6.1` errors (`findings.filter((f) => f.check === "C-6.1" ...)`). `test/m/ratification/r7-snappath-parity.test.mjs` pins C-12.2 for the single canonical key `20260101T000000Z_aaaaaaaa`. No test takes a key a writer actually makes and asks C-12.2 about its history.

**Walker's exact case to test.** Capture a public web page whose links include a page the record already holds (people.htm with index.htm held, as walked), vouch, open a question, cite, conclude, prepare the case, and sign it with a key registered in the browser. Expected after the fix: signs; before: the refusal with three history files. Also the sibling: capture B, then capture A which A's page links to, and sign a case resting on B.

## D-K2 MAJOR: L-3, one document is "Capture B" and "Not graded yet ... rests on nothing established here" at once

**Cause (two quantities with one name, and the act that joins them is hard to find).**
- "Capture | B" (Evidence, the document page, `cs.grade("capture", letter)` at `screens-inquiry/document.mjs:374`) is the capture's own grade, the ceiling the record earns for the bytes (`leg-earning/index.mjs:693-697` and `:738`, `mode: "ceiling"`, `grade: EARNED_CAPTURE_CEILING`).
- "Not graded yet" is about the finding's capture axis, which counts only a leg grade a member authored: `strength/index.mjs:927-930`: `if (!authored) return inert(word("strength.inert.captured_capture_grade", ...), "ungraded")` ("the earned entry is a ceiling, not a value, so the member's letter stands and is capped", `:918-919`). With no member letter every leg is inert, and `strength/arithmetic.mjs:168-181` yields the "UNRATED / rests on nothing established here" sentences (the member-facing form is the `strength.arithmetic.unrated_no_leg_*` rows, "Not graded yet on {axis}: none of the documents this conclusion rests on has a grade that can be counted, so it rests on nothing established here"). The public case page's "Capture Not graded yet: no member has graded this." is `screens-publish/published-parts.mjs:126-128` (`screen.published.strength.unrated`) for an axis `P.gradeOf(f, a)` finds no letter on.
- The act that authors the letter exists: `leggrade` ("What this passage earns", `screens-inquiry/question.mjs:707-717`, citation R24 `legGrade`, `citation/index.mjs:889`), a collapsed `<details>` under each cited passage, drawn only when `view.parts.leggrade` (registry admits it: `interface-shell/index.mjs:162`) and `ceilingOf(target)` finds a ceiling. The walker did not find it ("no act on the screen grades it"). Nothing on the screen or in the publishing pre-flight sends a member to it: the sentence "Not graded yet" does not name the act, and the case can be signed and published with the axis ungraded.
- **Not proven:** whether the fold was drawn on the live Question page. What would prove it: the Question page for INQ-2026-0020 as the member (a read-only page load once signed in) searched for `data-leggrade`; if absent, the cause is in `earnedbasis`/`ceilingOf`/`live(l)` (`question.mjs:702-712`) and moves to a defect of screens-inquiry; if present, the finding is a flow/wording one (DESIGN: the words and the fold's place), and a member who cites and then says "what each passage carries" is never led to the grading step.

**Boundary (K4164):** the quantity names ("Capture B" versus "Not graded yet") are wording; the missing lead-in to the grading fold is screens-inquiry; the publish gate that lets an ungraded axis through is a policy question for Bob (does a case with an ungraded capture axis publish at all). I list the code part to screens-inquiry and the wording to UX-DESIGN.

**Why the tests missed it.** No test draws the `leggrade` fold on the Question screen: `grep leggrade test/` finds only `test/m/citation/leggrade.test.mjs` (the act), `citation/declared-ops`, `inquiry/exports`, `affordances/t51-r71`, `interface-shell/r134` and `design`/`t50`, none under `test/m/screens-inquiry`. Nor does any test walk the sequence cite, say what it carries, conclude, publish and read the page for a letter against the document's own letter.

**Walker's exact case.** As D did: capture a public page, vouch, cite two passages, "Say what each passage carries", conclude, publish; then read the question's strength and the public finding page. Then open "What this passage earns" under a cited passage, record a letter at or below B, and read both pages again: the strength should show a letter and the finding page a letter beside "Capture B".

## D-K3 MAJOR: L-16 (part 1), the pre-flight names the document by a hash prefix

**Cause.** `screens-publish/ceremony.mjs:268`: `cs.esc(String(sha).slice(0, 12))` is the only name drawn on each "Documents without a second confirmation" row, and `:277` fills the tick `screen.ceremony.conf.self.tick` ("Publish {document} as self-attested only") with `{ document: String(sha).slice(0, 12) }`. The word's own note (`setup-words/rows.mjs:10456`) says "{document} its title"; the code never reads a title (the same screen names findings by `nameOf(f)` at `:262`). The row also falls back on `x.by`/`x.findings` only. The hash prefix is the quoted "c87d349eda6b" (twice: the row and the tick).
**Why tests missed it.** `test/m/screens-publish/fr30b.test.mjs` and `fix2.test.mjs` (the only tests that draw `data-unconfirmed`/`conf.self.tick`) assert the key and the fill, not that a member could read a title; a hash passes them.
**Walker's exact case.** Capture a web page (no timestamp or co-archive), cite it as load-bearing, prepare the edition, open Publication ceremony and read the "Documents without a second confirmation" row and the tick: it should read the document's title.

## D-K4 MAJOR: L-16 (part 2), "it shows the document existed by 2026-10-27T05:56:32Z"

**Cause.** `case-disclosures/index.mjs:363`: `late_words: ts && ts.late && ts.at ? localize("case-disclosures.index.late_proves", "late: proves the bytes existed by {at}, not at capture", { at: String(ts.at) })`. `{at}` is the raw ISO instant; the ceremony prints `x.late_words` as it is (`screens-publish/ceremony.mjs:262`, `' <span class="meta" data-late>' + x.late_words + "</span>"`), so no screen kit date function (`cs.date`) is applied. The plane-side module produces a finished sentence for a member, with a machine instant in it.
**Boundary:** the sentence is made in case-disclosures and printed in screens-publish; the repair is either a date the shell can format (a field, not a sentence) or case-disclosures writing the member's local date. BOB's call.
**Why tests missed it.** No test reads the printed `late_words` with an instant in it for form: `grep late_proves test/` hits only the word table; the ceremony tests feed `late_words` as fixed strings.
**Walker's exact case.** As D-K3, with a document whose time stamp was asked late (re-attest from the ceremony): read the grey line under the row.

## D-K5 MAJOR: L-8, "This case leaves nothing material out" unticks after Save and a reload; the page asks to confirm a claim never made

**Cause.** Two lines of `screens-publish/case-editor.mjs`:
- `:178`: `cs.checks("ce-exnone", { text: "" }, [["none", "screen.case-editor.this_case_leaves_nothing_material_out", false]])`. The third element, the box's checked state, is the literal `false` on every draw. The send (`:368-373`) does record the claim (`else if (none && !had.length) body.excluded = []`, an empty list held in the draft), but the screen cannot tell a held empty list from nothing said: `const ex = Array.isArray(v.authored && v.authored.excluded) ? ... : []` (`:166`) makes both `[]`.
- `:182`: the sentence `screen.case-editor.ack.none` ("This case states that it leaves nothing material out. Confirm that you checked this.") is drawn when `ex.length || acks.length || stated` is true, `stated` meaning the draft has a scope statement (`:167`). So a case that has a statement but has made no claim is asked to confirm a claim ("D-M5 (2): ... offered whenever the case has one", the code's own comment at `:179`).
**Why tests missed it.** `test/m/screens-publish/fr30b.test.mjs:51` picks `ce-exnone` and checks what is sent; no test redraws after the save and asks whether the box is ticked, or draws the editor for a statement-only draft and checks that the "states that it leaves nothing out" line is absent.
**Walker's exact case.** Case editor, a drafted case with a statement and no list of what it leaves out: the line should not be drawn. Tick the box, "Save these details", reload: the box stays ticked and the confirmation line appears.

## D-K6 MINOR: L-9, "The draft is prepared." drawn twice; "details of this work open once you have saved the case" never opens

**Cause.** (a) `case-editor.mjs:88` and `:123` both end with `P.said(view, "casedraft")`, and the act writes its success into that one slot (`:401`), so it shows beside the save button and under the roles. (b) `:267`: `if (!(caseOf && caseOf.case_id)) out.push(cs.sec(dTitle, ... "screen.case-editor.details.first"))` ("The details of this work open once you have saved the case"). A saved draft has no `case_id` until the edition is prepared in the ceremony (`review/index.mjs:184-186`, "a draft that does not name a case yet"), so "saved" never makes the details open; the sentence names a condition the screen's own Save does not meet.
**Why tests missed it.** No test counts the success lines or draws the editor with a saved, unprepared draft and asks whether the details can be reached.
**Walker's exact case.** Case editor, save a new draft once: the success line appears once; the details fold either opens or says what opens it (the words need Bob's/UX-DESIGN's choice of what the condition is).

## D-K7 MINOR: L-10, role and position radios and the "leaves nothing out" box draw no "Changes here are not saved yet" (re-walk row NOT FIXED)

**Cause.** `case-editor.mjs:94` (`ce-targets`), `:121` (`ce-role-*`), `:126` (`ce-pos`) and `:178` (`ce-exnone`) call `cs.checks(...)` with no `typing:` option, whereas `cs.field`s at `:176-177`, `:258` pass `typing: edited` (`edited` is defined at `:81`). The shell supports it for check groups (`interface-shell/browser.mjs:849-851`, R135: `typing` handed "when a box or radio changes"). This is the cause `rewalk11-D.md` gave; confirmed in the source.
**Why tests missed it.** The R135 tests exercise the shell's mechanism and the typed fields; none changes a radio on the case editor and asks for the unsaved line.
**Walker's exact case.** Case editor, drafted case: click "Relied on" on a finding's role, then the position radio, then the box; each should draw "Changes here are not saved yet." within 2 s at 1280 and 390.

## D-K8 MINOR: L-14, after the member's acknowledgment the section redraws "Still loading" (three places) with a raw id, and the control is offered again

**Cause (location, mechanism not proven).** The act `statementack` is declared `rereads: []` and its `done` calls `view.parts.forget(view)` (`case-editor.mjs:423-429`); `forget` empties every read the screen holds (`screens-publish/parts.mjs:45`, `view.ui.later = {}`), so the next draw re-asks all of them and draws "Still loading" (`state.loading`, `setup-words/rows.mjs:78`) and, for a name not yet read, the id. Other case-editor acts that change the record name the reads to take again (`rereads: ["copy", "drafts"]`); this one names none, and the `statements` read that shows the acknowledgment (`v.statement_acknowledgements`) is therefore not taken again on purpose. What I could not see in source is why the re-asks do not settle until a reload; `P.later` (`parts.mjs:20-26`) redraws on settle. **What would prove it:** after the act, whether the `casedraft`/`reviewcopy` reads were issued again and what they answered (the network trace of the walker's case), and whether the re-ask is the same query as before (the memo key is the query).
**Why tests missed it.** `test/m/case-authoring/statement.test.mjs` and `review/copy.test.mjs` test the act's record; no screen test acts and then reads the redrawn section.
**Walker's exact case.** As a member who is not the statement's writer: Case editor, "Your reason for acknowledging it", "Acknowledge what it leaves out"; read the section at once, without reload. It should show "Acknowledged by walker ..." with no "Still loading" and no acknowledge control left.

## D-K9 MINOR: L-22, after publishing the case editor still says "Draft", "Internally checked Not checked yet", and no way to start edition 2

**Cause (in part).** The ladder (`case-editor.mjs:130-148`) takes "internal" from `casecheck` (`held = check.value.state`, true only for `held` or `published`). `case-check/index.mjs:262`: `if (!row) return { ok: true, state: "none", ... }` is returned before the `published` test that sits in `#state` (`:184-188`), and a check row exists only if a member ran the case check act. The walker's cases were prepared and signed from the ceremony without it, so a published edition answers `none` and the rung reads "Not checked yet" beside "Published: edition 1". The "Draft: One Park Service page." heading and the stale bias line ("...Nothing was published.") come from the draft's own words (`screen.case-editor.say_what_the_teams_declared_bias`, etc.) that the editor draws regardless of the published state; I did not find a branch of `case-editor.mjs` that knows the edition is published except the "distributed" rung (`:139`), and found no act that starts edition 2. **Not proven:** the live `casecheck` answer for CASE-2026-6911 edition 1 (expected `none`) and the exact source of the stale bias sentence. Needs the signed-in read `op=casecheck&case=CASE-2026-6911&edition=1`.
**Boundary:** case-check answers; screens-publish draws; "edition 2" is a flow decision (Bob/UX: should the published case's editor offer "Start the next edition").
**Why tests missed it.** `test/m/case-checker/*` test the checker program; no test draws the editor for a case published without a check row.
**Walker's exact case.** Prepare and sign a case from the ceremony without pressing the check, publish, open the Case editor: the ladder should show every rung up to "Distributed", the draft heading should say published, and a "next edition" offer should exist.

## D-K10 MINOR: L-1, breadcrumb "Projects › Project" for a project the member has not joined

**Cause.** `screens-inquiry/project.mjs:76-86`, `place(view)`: when the project's document is not readable it returns `{ project: { id, title: named } }` with `named` from `st.refusal.name`, often `""`; the shell then names the step with the screen's own title, "Project" (`screen.project.name`, `setup-words/rows.mjs:17749`). The word the design made for exactly this, `crumb.project.unjoined` ("A project you have not joined", `rows.mjs:10306`), is used by `screens-publish/ceremony.mjs:51-53`, `screens-investigate/standard.mjs:65` and others but not here.
**Why tests missed it.** `fr30b.test.mjs:387` pins the unjoined crumb for the ceremony only; `standard.test.mjs` for the standard screen; no test for the project screen.
**Walker's exact case.** As a member who has not joined, open the project page: the breadcrumb should read "Projects › A project you have not joined".

## D-K11 MINOR: L-4, "Shared origin: part 1, part 2 both come from INFO-2026-0244-people-acadia-national-park-u-s-national"

**Cause.** `screens-inquiry/question.mjs:777-780`: `origin` is `t.replace(/^\w+:/, "")`, the raw `through` string (a bundle id), handed straight into `question.origin.shared`; `nameOfPart` (`:772-776`) falls back to `String(x)` (the label "part 1") when it cannot find the part by label. Neither takes a title (the screen holds the cited documents' titles for the legs, `legName`).
**Why tests missed it.** `test/m/screens-inquiry/question.test.mjs` matches `data-origin-shared` and the key, with an id as the through value.
**Walker's exact case.** Two passages cited from one document, "Say what each passage carries": the line should read the document's title and the passages' names.

## D-K12 MINOR: "reading-1" still drawn on the Question screen after concluding (re-walk row, known gap)

**Cause (location).** The reading tree prints the reading's name raw: `screens-inquiry/question.mjs:992`, `<span class="rec">${cs.esc(String(v.name))}</span>`; the reading chooser falls back to the name when a reading has no description (`:762`, `clip(v.description, 120) || String(v.name)`). A conclusion makes a reading named `reading-N` with no description. **Not proven which of the two draws the quoted "reading-1"**; the proof is the Question page after concluding, searched for `data-tree="reading-1"` (the tree row) and the chooser option text.
**Why tests missed it.** Recorded as a known gap in re-walk 11; the tests give readings descriptions.
**Walker's exact case.** Conclude a question, read the Question page for "reading-" in the drawn text.

## D-K13 MINOR: L-7, "walker, an outside reader" for a team member; "Dana Reviewer · An editor outside the team, an outside reader"

**Cause.** (a) `screens-publish/review-copy.mjs:165` packs the grant's person as `recipient: name + " · " + role`; the comment line (`:109-112`) then prints that string and the word `screen.review-copy.from.reader` ("{who}, an outside reader") adds the role word again. (b) `:118`: every acknowledgment is drawn with `screen.review-copy.acked` ("{who}, an outside reader, read the draft and acknowledged it, {date}", `rows.mjs:10261`), also for `a.by`, a member (the code names the member at `a.by ? cs.memberName(a.by)`), so a member is called an outside reader.
**Why tests missed it.** `test/m/screens-publish/review.test.mjs` pins `from.reader` for a reader's comment; acknowledgments by a member are not tested for the wording.
**Walker's exact case.** Share a review copy to a named reader with a role; the reader comments; a team member acknowledges the statement; owner reads the comments: "Dana Reviewer, An editor outside the team" once, and the member without "outside reader".

## D-K14 MINOR: L-11, "Stop sharing" ends the grant with no word that it ended, no reason, no confirm

**Cause.** `screens-publish/review-copy.mjs:196-199`: the act's `done` is `if (!view.parts.refused(...)) view.parts.forget(view)`; it never `say`s a success (the slot `P.said(view, "reviewrevoke")` at `:68` is drawn but nothing fills it on success), so the row simply disappears. The act is declared with no reason field and no consequence line. Whether the act should ask to confirm is a design choice (DESIGN part: "Ends something").
**Why tests missed it.** `test/m/review/acts.test.mjs:250` tests the revoke's refusal and record, not the screen's answer.
**Walker's exact case.** Review copy with a live reader, press "Stop sharing": a line such as "Done: <reader> can no longer read it" should be drawn where the row was.

## D-K15 MINOR: L-12 (file name) and L-13 (reader's heading), the draft's identity is a whole sentence used as a name

**Cause.** `review/index.mjs:182-187`, `caseIdentitySentence(caseId, edition, newCase)`: with no case id and no new case it returns the sentence "a draft that does not name a case yet; which case it becomes is settled when it is published". Its comment says it is "a member's and a recipient's to read", but two surfaces use it as a name: `screens-publish/review-copy-file.mjs` `fileName` (`part(c.case_id || c.identity || copy.draft ...)`, giving "a-draft-that-does-not-name-a-case-yet-which-case-i..."), and the reader's page heading `screen.review-outside.draft` ("The case: {case}, Edition {edition} (draft)", `screens-publish/review-outside.mjs:41`, with `case: c.identity`), which the heading style draws in capitals.
**Boundary (K4164):** the sentence comes from review, the uses are in screens-publish; fix is either a short name in review (e.g. the draft's title) or the surfaces taking `draft_id`/title, not the sentence.
**Why tests missed it.** `review/*.test.mjs` pins the sentence (its row notes "plain words, no capitals"); no test builds the file name or the reader heading for a draft that names no case.
**Walker's exact case.** Review copy of a draft that names no case, "Save as a file": the downloaded file's name should be short and readable; the reader's heading should not be a sentence.
**DESIGN parts of the same findings (quoted, to UX-DESIGN, no job):** L-12's "an acknowledgment drawn as a drop-down whose first choice is '–'" and the two buttons "Save the file" then "Save as a file" (`review-copy.mjs:179-193`, `el.dataset.step` two-step by design, comment `:174-177`); L-13's capitalised heading.

## D-K16 MINOR: L-17, two "Confirm" popovers open at once, same word

**Cause.** `interface-shell/browser.mjs:2097`: `function besideAct(ai, inner) { const s = slotOf(ai); if (s) { s.innerHTML = inner; if (inner) openAround(s); } ... }` writes the dialog into that act's own slot and never closes the dialog another act left open in its slot; the confirmation dialog is built at `:2145-2150` with the one word `shell.confirm` ("Confirm", `rows.mjs:1397`) and the act's `does` line only above it.
**Why tests missed it.** `interface-shell/t49` and `fixround2` open one dialog at a time.
**Walker's exact case.** Publication ceremony: open "Ask for the confirmation again" (do not press), then press the ties act: the first dialog should close (or the buttons say different words).

## D-K17 MINOR: L-18, "One confirmation signs all 3: the edition, its 1 findings, and the 1 pieces of evidence"

**Cause.** `screens-publish/ceremony.mjs:407-409` always uses `screen.ceremony.signs.count` / `.findings` with plural wording ("{findings} findings", "{evidence} pieces of evidence"); no singular key exists. The existing test pins the ungrammatical text as correct: `test/m/screens-publish/fix2.test.mjs:103`, `drew(q, "screen.ceremony.signs.count", { n: "3", findings: "1", evidence: "1" })`.
**Why tests missed it.** They assert the key and fills, not the sentence read aloud.
**Walker's exact case.** A case with one finding and one piece of evidence: ceremony's Sign step should read "its 1 finding, and the 1 piece of evidence".

## D-K18 MINOR: L-24, `/app/docket/<project>` (no draft or case part) draws "Nothing is here" with the breadcrumb "Projects › PROJ-2026-8516-walk-087-d › Docket"

**Cause.** `screens-publish/docket.mjs:13` returns no reads when the address lacks its second part (`if (!view.parts.subject(view, 2)) return {}`), so `place` (`:24-28`) runs with `view.data.project` unread and `titleOf(null, id)` returns the id, which is the raw id in the crumb. The unjoined/untitled word of D-K10 is not used here either.
**Why tests missed it.** The "nothing" case is tested for the body (`nothing(cs)`), not for the path.
**Walker's exact case.** Open `/app/docket/<project id>` for a project the member can read: no raw id in the breadcrumb (and a way to the right address).

## D-K19 MINOR: five Queue items for one walker's key registrations (alpha D-m8), a design question

**Cause.** `queue-producers/index.mjs:2070-2095` `#obligationsSignerSelfRegistered`: one OBLIGATION per self-registered active key not yet "known by" an administrator (`!k.known_by`, R55), raised to every other active administrator (`:2078`); only the registrant is spared (`:2081-2082`). A key made without "keep on this device" is lost with the browser (`ceremony.mjs:427`, the unticked `ce-keep` box; `:656-668`, `signerregisterown`), so each retry registers a fresh key and a fresh item. Working as written. **DESIGN:** whether one member re-registering should raise one item per key or replace the last; and whether the ceremony should ask "keep on this device" by default. To UX-DESIGN and Bob (key policy); no job until decided.

## D-K20 DESIGN (wording and layout with nothing broken, K3462): quoted, to UX-DESIGN

- L-2 and the alpha D-m1/D-m2 row: "CLOSE THIS PROJECT NOW" leads the project page before the documents and the first question. The section order is design: `screens-inquiry/project.mjs:245` (closenow) comes before `:290` (documents), `:322` (first question), `:347` (questions); heading word `screen.project.closenow.head` "Close this project now".
- L-15: "Put it right in the case, then check again" under stops that are put right on the same screen: `ceremony.gate.other` "Something in the draft stops the signing: {what}. Put it right in the case, then check again." (`rows.mjs:5577`, flagged design).
- L-19: "What your key signs, exactly" lists the raw statement lines "case CASE-2026-9942: bio-ratify-case CASE-2026-9942 1 1bdd1394..." (`interface-shell/browser.mjs:2041-2046`: the dialog shows `new TextDecoder().decode(s.bytes)`, the exact signed bytes, on purpose: R41/R47 "exactly"). Whether a plain reading sits beside the exact bytes is the design's.
- L-21: "NO BAR IS RECORDED for this case edition, and that is not a bar of zero. Either the case was published before a case carried its own standard, or no bar was ever declared — in which case the case claims no cleared standard and says so, because undetermined is first-class here and is never rounded to a number nobody chose." (`public-read.bar_recorded_case`, `rows.mjs:14541`) and "...is Leg 1, which supports Finding 1; it rests on documents this edition does not hold" (`screen.published.is.leg.4.which.supports`, `rows.mjs:6846`).
- Dead end 10, words a member would not understand, all rows flagged design: "A load-bearing document has no trusted timestamp and co-archive. Retry them, or acknowledge publishing it as self-attested only, with a reason." (`refusal.CO_ATTESTATION_UNACKNOWLEDGED`); "Undetermined | no assertion was supplied and no mechanical determination is implemented; recorded {retrieved} for resolution through the task list" (`acquisition.authority_basis.assertion_supplied_mechanical`); "the {key} reader found no entities in this document; recorded as an empty reading, never an emptied document" (`reading-pipeline.why.reader_found_entities_document`); and the Question screen's "Not graded yet on Capture: none of the documents this conclusion rests on has a grade that can be counted, so it rests on nothing established here" (wording part of D-K2).
- L-13's capitalised sentence heading and L-12's "–" drop-down and two save buttons (see D-K15).

## D-K21 DESIGN (policy): members see other projects' document names (alpha D-m9, dead end 7)

The Document page's connection and contradiction pickers offer other projects' documents by title; the option values are raw ids (invisible). That a member sees any other project's document names is a scope/visibility decision, not a defect: to Bob (policy) through UX-DESIGN, rulings `build/rulings-product/scope.md` before any job.

## UNKNOWN (could not trace)

- **D-U1 (L-25, the sign step took about 35 s on the first attempt, 4 s later).** Tried: read the whole client path (`ceremony.mjs:581-610`: `casedocument` call, then `P.sitSign` / `cs.signer.sign` in the browser (`browser.mjs:2036-2084`), then `caseratify`), and the server's password step (`credentials/index.mjs:286-290`, PBKDF2 at 100,000 iterations, which is tens of milliseconds, not seconds). The walker timed only `caseratify` (`Server-Timing` 0.07 to 0.7 s). Nothing in the source explains 35 s; the first attempt was also the one that ended in the C-12.2 refusal (D-K1), so the time may be the signing gate walking the evidence's full history. To prove: a trace of one sign act with the time of each of the three calls (`casedocument`, the password check, `caseratify`) and the browser's signing time, first on a case that fails D-K1 and then on one that does not. Severity MAJOR by the K4354 bar.
- **D-U2 (L-23, administrator at 390, Project and Question `Server-Timing` 3.0 s and 3.9 s).** Tried: listed the reads of both screens; the record names no call. `Server-Timing` is of the slowest call but the walker did not name it, and the walk was concurrent with four others. To prove: repeat alone and name the slowest `Server-Timing` entry for `/app/project/<id>` and `/app/question/<id>` as administrator. MAJOR by the bar.
- **D-U3 (L-20, `caseratify` `Server-Timing` 2.8 s, password step to "Published" 4.1 s for project two).** Same reasoning and same proof as D-U1; the published path here was clean. MINOR.

## Not findings (from D's rows, for BOB)

- Row 0d (a member must press Join after the owner grants; the member's Queue shows no word of it): the walker did not look closely; not traced and not a finding of D.
- Re-walk rows FIXED in D (D-M1 (2), the tamper-EVIDENT paragraph, R135 typed field): nothing to diagnose. Rows NOT FIXED: R135 radio/box (D-K7), "reading-1" (D-K12). The `ce-ackreason` duplicate ids are fixed.
- D's guess for L-B1 ("a lost update of the capture's manifest while other walkers were capturing at the same second") is not the cause; D-K1 explains it by the key's shape and needs no second writer.

## DESIGN and UNKNOWN counts

DESIGN: 2 entries (D-K20, D-K21), plus design parts inside D-K2 (wording), D-K15 (drop-down, two buttons, capitals) and D-K19 (key-notice behaviour). UNKNOWN: 3 (D-U1, D-U2, D-U3).

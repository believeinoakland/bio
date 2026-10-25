# Diagnosis of the BROKEN rows: 10a (prep/final-10a-case) and 05 (prep/final-05-vouch)

Read: both records whole (05 at 30 lines: 2 BROKEN; it may grow), both scripts, `fix-round-10-T51.md` (all, §1-§3 included) and `fix-round-10-waves.md`. Grep of both for set-aside, questionwaits, documentWaits, testify, observation, PLANE_MISSING_BYTES, hasCapture, attribute, R171, reviewcopy, casedraft, CASE_SIGNER: no cause is placed, so nothing is "ALREADY PLACED".

Summary table

| # | Record | Row | Verdict | Owning module |
|---|---|---|---|---|
| 1 | 10a | R92 sign the three-finding edition | DEFECT (BLOCKER, same cause as 2) | promotion (`gate.mjs`), or ratification (`hasCapture`) |
| 2 | 10a | R171 (5) a case reaching a testified observation can be signed | DEFECT (BLOCKER) | same |
| 3 | 10a | R93 (6) who cannot sign | owner-c: consequence of 1; admin-two: SPECIFIED (walker's expected reason wrong) | none new |
| 4 | 10a | R171 (h) credit state on the review copy | DEFECT (MAJOR) | review; plus screens-publish (second symptom) |
| 5 | 10a | R90 (b) unknown position / empty reason at draft Save | SPECIFIED | none |
| 6 | 05 | R38 set aside a document an open question waits on | DEFECT | inquiry |
| 7 | 05 | R38 history lists every set-aside and restore | WALKER-ERROR (wrong op); the specified read is the DEFECT of 6 | inquiry |

---

## 1 and 2. 10a R92 "sign the three-finding edition" and 10a R171 (5) "a case reaching a member's own testified observation can be signed" -- DEFECT, BLOCKER (one cause)

Record, row ids, checks: 10a-case.md, R92 "sign the three-finding edition (with writer-b's observation among its findings) as the owner" and R171 (5) "(the gate's byte check)". Answer: 409 `GATE_REFUSED`, finding `PLANE_MISSING_BYTES`, `where.path = snapshots/observation-43bcad5f7e5de985.txt`, `member: INFO-2026-0002-observation`.

### 1. Root cause, with evidence

The walker sent the act right. `sitFor` (10a script, ~l.195-212) reads `casedocument`, builds the sitting with `PARTS.sitting(doc, ...)` (the ceremony's own function, `screens-publish/parts.mjs`), signs each text, calls `reauth`, posts `caseratify` with `members`. That is the ceremony's path (screens-publish `ceremony.mjs` sends `caseratify` with the same sitting). Every refusal before the gate passed (key, owner, password again).

Which capture the gate looks for. The refusal is a MEMBER's gate (it carries `member`), not the case gate. Chain:

1. `bio-plane/src/ratification/ops.mjs:557-` (`caseCeremony`): for each `members[i]` it runs `readFinding` then `weighFinding`. `readFinding` (ops.mjs ~l.523-545) asks `do/gatefacts` and posts `do/ratifygate` with `registers: facts.registers`.
2. `gateFacts` (`bio-plane/src/ratification/index.mjs:462-464`) builds `registers` from the provenance register of THAT bundle:
   `registers: this.provenance.registeredFor(bundleId).map((r) => ({ capture_sha: r.capture_sha, path: r.path, bytes: r.bytes }))`
   For the observation bundle that is one row: the file `testify` wrote.
3. That row is made by `provenance.testify` (`bio-plane/src/provenance/index.mjs:1913-1990`): `const file = \`snapshots/observation-${sha.slice(0, 16)}.txt\``; the bytes (`fileText`) go into the BUNDLE as an inline text file (`files: [..., { path: file, text: fileText, bytes, sha256: sha }]`) and `register: [{ sha256: sha, path: file, ... }]`. Nothing is ever `put` into the evidence bucket: `testify` has no evidence-store call (the only writers of `evidenceStore().put` are acquire/capture; `record-core/index.mjs:1939-1953` defines the store, testify never uses it). The sha `43bcad5f...` in the finding is that `capture_sha`; `observation-43bcad5f7e5de985` is `sha.slice(0,16)`.
4. `ratifyGate` (`ratification/index.mjs:511-530`) answers the gate's probe only from the bucket:
   `hasCapture: async (sha) => { if (!evidence) return { present: false, bytes: 0 }; const h = await evidence.head(sha); if (h) return { present: true, bytes: h.size }; ... parts ... return { present: false, bytes: 0, ...(held && held.acquired === true ? { heldInParts: true } : {}) }; }`
   `head(sha)` misses (key `bio/captures/<sha>`), `registerHolds` finds no parts, the row is not `acquired` (no `captured_locators` row for an authored file).
5. `runGate` (`bio-plane/src/gate.mjs:1388-1430`) loops `for (const r of registers)` and, on a miss, pushes
   `errors.push({ check: "PLANE_MISSING_BYTES", detail: "registered capture is absent from the working bucket", where: { path: r.path, sha256: r.capture_sha } })` (gate.mjs:1426-1428). It never looks at `image`, which at that moment holds the very bytes inline (`findingShas` in `ratification/finding.mjs:76-90` publishes that same file as a text file: `typeof v === "string"` -> kind "file", no bucket read).

So the gate (promotion R28: "Every registered capture ... must be present in the working store, as `hasCapture` answers") asks a bucket question about a register row whose bytes by design live in the bundle. The register AUDIT already knows this: `provenance.registerRows()` (`provenance/index.mjs:848-865`) classes a row `live` when `readFile(bundle, path).sha256 === capture_sha` and only probes the bucket for the `unresolved` rest; the comment at `control-plane/index.mjs:1308-1315` says the audit must "ask the same question as the enforcer". The two disagree for authored rows. `gateFacts` also drops the `authored` flag (`index.mjs:463`) so the gate cannot tell.

Every case that reaches a member's own observation is unsignable (op=ratify of the observation itself hits the same `hasCapture`). 
Second finding (not a walker row): `caseRatifyPreflight` (`ratification/index.mjs` ~l.585-650, "the case gate's findings") runs only the CASE gate, not the members' gates, so `publishpreflight` answered `ready:false` with only `NO_ATTESTING_KEY` and would have said ready after a key, yet the signing refuses. The ceremony cannot warn before the key/password steps. Place with the fix (ratification R18/R4).

### 2. Why the module tests missed it

- `promotion/gate.test.mjs:62-65` tests R28 with a scripted `hasCapture` returning `{present:false}` -> `PLANE_MISSING_BYTES`: the rule is tested, the case "bytes are in the image" is absent.
- `ratification/sitting.test.mjs` (R52) builds members with `w.promote(e, cleanInfoMd(e), "information")` and a fixture whose `provenance` is a stub (`ratification/fixture.mjs:139-147`, `registers = new Map()`, `registeredFor: (id) => registers.get(id) ?? []`), so the sitting's members have NO register rows. The observation case (`sitting.test.mjs:157-170`) stubs the reach (`s.w.bv.reach = { self: [OBS] ... }`) on a clean information document; it is never the output of `provenance.testify`. The one absent case: a member whose register row was written by `testify` (authored, bytes only in the bundle) in a sitting.
- `provenance` tests check `testify` writes the row; `ratification/provenance-gate.test.mjs` (R55) covers only authority decisions. No test runs testify -> gate.

### 3. Failing-first test

(a) Unit, `bio-plane/test/m/promotion/gate.test.mjs` (R28): `runGate({ bundleId, image: { "bundle.md": ..., "data/provenance.json": ..., "snapshots/observation-<16>.txt": TEXT }, registers: [{ capture_sha: sha256(TEXT), path: "snapshots/observation-<16>.txt", bytes: len }], hasCapture: async () => ({ present: false, bytes: 0 }) })` expects no `PLANE_MISSING_BYTES`. Controls: a row whose file is absent from the image, or whose text hashes differently, or whose `bytes` differ, still gives `PLANE_MISSING_BYTES` / `PLANE_SIZE`; a blob-reference entry (elided) is still probed by `hasCapture`.

(b) The walker's exact case through the real entry path, `bio-plane/test/m/control-plane/r10-testimony-sign.test.mjs` (new; Miniflare, uses `r8-kit.mjs` as the walker does): owner-a + writer-b joined; writer-b `testify`; `concluded()` on the observation's `capture_sha`; `casedraft` + `publish` (tieAttested, bias) ; writer-b `attribute` level `cover`; owner-a `signerregisterown`, `reauth`, `caseratify` with `PARTS.sitting` members. Expect 200 `ok:true` and a published case; today 409 `GATE_REFUSED` / `PLANE_MISSING_BYTES`.

(c) `bio-plane/test/m/ratification/preflight.test.mjs`: with a real-provenance fixture, `caseRatifyPreflight` over a case resting on a testified observation lists the member refusal (or states PREFLIGHT_UNDETERMINED for members), never a clear `ready`.

### 4. Owning module and platform

`promotion` (`bio-plane/src/gate.mjs` is in `promotion`'s paths, layer 2) if the rule is "an inline file of the image whose digest is the register's digest is held" (my recommendation: one rule at the gate, the audit's `live` class). Alternative with a smaller blast radius: `ratification` (layer 8) `ratifyGate.hasCapture` (`index.mjs:514`): when the bucket misses, answer present if `provenance.homeOf(sha)` names this bundle and `record.readFile(bundle, path).sha256 === sha` (the audit's own test). Either way `gateFacts` should stop dropping `authored`. A third way (`testify` also `put`s the bytes into the evidence store) changes `provenance` and adds a bucket write to every observation, and `copyFinding` would then copy it as a capture too; not recommended. Which of the three is BOB's call.

Platform: no. Pure logic over the image and a digest; testable in-process and in Miniflare. No R2 behaviour is involved (the bytes are never in R2). No dependence on `plane`.

---

## 3. 10a R93 (6) "who cannot sign": writer-b, owner-c, admin-two -- two different answers

Record row: writer-b NOT_CAPABLE twice (works); owner-c -> `GATE_REFUSED PLANE_MISSING_BYTES`; admin-two -> `NO_CASE_DOCUMENT`; the check expected `CASE_SIGNER_NOT_AN_OWNER` for both.

### owner-c: consequence of rows 1/2, not a separate defect
1. Root cause: `caseCeremony` weighs the members' gates (`ops.mjs` `weighFinding`, ~l.205-215) BEFORE the commit. The owner test is at the commit: `ratification/index.mjs:1234` `this.membership.caseAuthority({ project, deliveredBy, signer: attestorMember, act: "caseratify", ... })` (`ratifyCaseDocument`). R2's order (ratification.md line 23) lists `GATE_REFUSED` before the commit and names no earlier owner refusal. So owner-c (valid key, joined, publish capability) reaches the member gate, and the observation's missing-bytes refusal (row 1) comes first. After the fix of row 1 she should reach the commit and be answered `CASE_SIGNER_NOT_AN_OWNER`; I cannot confirm that until row 1 is fixed, so the walker must re-run this row after the fix.
2. Tests missed it: none for the order with a testified member; same cause as row 1.
3. Failing-first: the same new `control-plane/r10-testimony-sign.test.mjs`, extra step: owner-c (joined, publish, own key) signs the same sitting -> expect 403/409 `CASE_SIGNER_NOT_AN_OWNER`, nothing written.
4. Owner: as rows 1/2. No platform.

### admin-two: SPECIFIED (walker's expected reason was wrong)
1. `caseCeremony` reads the case's facts under the session's sight first: `ops.mjs` (`casedocfacts?...&viewer=${sessViewer}`; comment "REC-130: ... a member without standing in the owning project is answered NO_CASE_DOCUMENT, as for a case that does not exist"), and `facts.ok === false` returns 404 (`ops.mjs` ~l.176). Spec: `build/requirements/publication.md` R1: an unsigned document answers only a viewer with standing in every project the record names (or a live review grant); every other caller receives `NO_CASE_DOCUMENT`, byte-identical. admin-two is "an administrator, not an owner of the project" and not a participant, so she cannot know the case exists. The sibling 10a rows (`casedocument` as admin-two `NO_CASE_DOCUMENT`) say the same.
2. Not a test gap; the walker's expectation (`CASE_SIGNER_NOT_AN_OWNER` for a bystander administrator) contradicts R1/REC-130.
3. Failing-first: none (behaviour is specified). If BOB wants the row to prove ownership refusal for an administrator who IS a participant but not an owner, the walker should join admin-two to the project first and re-send.
4. Owner: none.

---

## 4. 10a R171 (h) "the credit state shows on the draft's review copy once the edition is prepared and the author has chosen" -- DEFECT (MAJOR)

Answer: `reviewcopy` still gives `observations: [{ observation, chosen:false, stated: "this draft names no case yet, so no level can be chosen; its author chooses one (op=attribute) once op=publish has prepared the case document" }]` and `case.case_id: null`, while `casedrafts` for the same draft says `editions: {prepared:1, case:"CASE-2026-6727"}` and `publishpreflight` no longer names `ATTRIBUTION_UNCHOSEN`.

### 1. Root cause, with evidence
- `review/index.mjs:515-519` `draftIdentity(draft)`: `const named = String((draft && draft.case_id) ?? "").trim() || null; if (!named) return { caseId: null, edition: 1 };`. A draft that asks for a new case has `case_id` NULL (it is the draft's own stored column and `casedraft` writes only a case the member NAMED, `review/index.mjs` ~l.662-668), and `publish` never writes the minted case back to the draft; the prepared document links to the draft the other way (`case_documents.draft_id`, `publication/index.mjs:531`).
- `copy()` builds `ident` from `draftIdentity` (so `case: { case_id: null }`, `review/index.mjs` ~l.862) and passes it to `#observations(findings, ident)` (`:895`, `:925-936`):
  `const chosen = ident.caseId ? this.caseTensions.attributionInForce(ident.caseId, ident.edition, obs) : null; ... : "this draft names no case yet, so no level can be chosen; ..."`
  With `ident.caseId` null the attribution is never asked. Requirement R16 (review.md line 63) states exactly this: "for a draft naming no case, each is unchosen and says why", so the code follows R16 as written; R16 predates the fix of round 4 (case-authoring R83/K4467: `draftEditions` answers `case` "so a reloaded page reads the prepared document by it even for a draft that asks for a new case"). The list row uses it (`review/index.mjs:998-1026`, `#editions` -> `caseAuthoring.draftEditions({caseId: ident.caseId, draft})`, which finds the case via `SELECT case_id FROM case_documents WHERE draft_id=?`, `case-authoring/index.mjs` ~l.1795-1802). The copy does not. R16 and R83 disagree for a prepared draft; the choices live under the prepared case id (the walker's `attribute` used `prep.caseId`).
- Same cause makes the member's screen unable to take the credit choice: `screens-publish/case-editor.mjs:416-422`, act `attribute`: `const c = view.ui.draft && view.ui.draft.case; if (!c || !c.case_id) return { refuse: "screen.case-editor.people.nocase" };` and `draft.case.case_id` is the same null from `draftIdentity`. The editor already knows better elsewhere (`case-editor.mjs:141` consults `chosen.editions.prepared`), but the attribute send does not, so the author on the screen is told "Prepare the draft as a case first" even though it is prepared. The walker called the op directly with `caseId`/`edition`, so it did not see this: check the screen path as part of the fix.

### 2. Why the module tests missed it
`review/copy.test.mjs:345-361` pins the null-case behaviour (a draft naming no case: "each unchosen ... /names no case yet, so no level can be chosen/") and the named-case behaviour; the fixture's `caseAuthoring.draftEditions` double (`review/fixture.mjs:87-95`) is used for the list only. The case absent: a draft naming no case that HAS a preparation, read through `copy`. `screens-publish` tests send `attribute` with `draft.case.case_id` set (never a prepared new-case draft).

### 3. Failing-first test
`bio-plane/test/m/review/copy.test.mjs`: draft naming no case, `ca.editions` double answering `{case:"CASE-0001", prepared:1, published:null}`, `w.chosen.add("CASE-0001|1|OBS-...")`, `copy({draft, viewer})` -> `observations[0].chosen === true`, `stated` the "has chosen a level for CASE-0001 edition 1" sentence; and `case.case_id` stays null only if the member named none (decide with BOB: R16 amended to read the prepared case). Control: the same draft before `publish` still says "names no case yet". Screen: `bio-plane/test/m/screens-publish/` a case-editor test where `casedrafts` gives `case.case_id: null, editions: {prepared:1, case:"CASE-..."}` and the `attribute` send carries that `caseId`/`edition` instead of refusing `people.nocase`. Walker's exact case: add to the new Miniflare test of rows 1/2 (review copy read after `publish` and after `attribute` as writer-b).

### 4. Owning module and platform
`review` (layer 8; `#observations`/`copy`, amend R16), and `screens-publish` (layer 11; `case-editor.mjs:416-422`, amend its R44/R1 wording). Depends on `case-authoring` only through `draftEditions` (already exported, no change). BOB should amend review R16 ("a draft naming no case ... unchosen" -> "... and no preparation"). Platform: no.

---

## 5. 10a R90 (b) "unknown right-of-reply position and an empty reason refused" at Save -- SPECIFIED (not a defect)

Answer: `casedraft {draft, subjectPosition:"did_ask"}` -> `ok:true` (script printed `undefined` for `reason`); `subjectPosition:"sought_no_answer", subjectJustification:""` -> `ok:true`; `choices.subject_positions` is the three names (the sub-check that passed).

### 1. Root cause / specification
`casedraft` is a working copy, not a publication: `review.md` R3 lists its refusals (outside project, unheld draft, no project, changed project, no edit permission, unknown case, over 64 KiB) and none validates a position; R37 states "a sent `null`, or a blank string, clears that field" (`review/index.mjs:632-637`: `if (v === null || (typeof v === "string" && !v.trim())) delete params[k]; else params[k] = v;`). The refusals named in the check are made when the case is PREPARED: `case-authoring.md` R3 (`NO_SUBJECT_POSITION`, `NO_SUBJECT_JUSTIFICATION`), and the walker's own row "R92 unknown right-of-reply position ..." is WORKS with exactly those two codes. The screen cannot send an unknown value: the position is a radio drawn from `choices.subject_positions` (`screens-publish/case-editor.mjs:121`) and a Save sends it only if it changed and the reason only if non-empty (`:343-345`), so a blank reason is never sent. The coverage text asked "an unknown position refused" without saying where; the requirement says at preparation.

### 2. Tests
Not missed: `review` R3/R37 pin it. The unknown-at-prepare path is covered by case-authoring's R3 tests.

### 3. Failing-first
None. If BOB decides a Save should refuse an unknown position early (a policy-level change to review R3, then a test in `review/acts.test.mjs`), that is a new requirement, not a defect.

### 4. Owner: none.

---

## 6. 05 R38 "Set aside a document an open question waits on: the asker reads 'Waiting: ... set aside by Ben: wrong year'" -- DEFECT

Answer: Ana's and Ben's `questionwaits` = `{ok:true, question, zone:null, waits:[], projects:[...]}`; the Queue count unchanged (that sub-check, "no queue item", is right).

### 1. Root cause, with evidence
The walker sent the act and the read right: `heldsetaside` (Ben, with reason) recorded the set-aside, and the question screen reads exactly this op (`screens-inquiry/question.mjs:31`: `waits: { op: "questionwaits", query: { question: id } }`; spec screens-inquiry R2: "`questionwaits` (what it waits on, with who set a document aside and their reason)"). The screen renders a set-aside item when an entry has `document` and `reason` (`question.mjs:610-620`).

But `op=questionwaits` is answered by `inquiry`'s `questionWaits` (`inquiry/index.mjs:2953` -> `:1372-1397`), which selects only `inquiry_dated_waits` (the member-set dated waits of R55):
`const waits = this.#rows(\`SELECT w.idx, w.text, w.description, w.date, ... FROM inquiry_dated_waits w ... WHERE w.bundle_id=? AND w.ended IS NULL ...\`, question)`.
The set-aside wait is `documentWaits` (`inquiry/index.mjs:1498`, requirement inquiry R58, via `capture.heldActsOf`, capture R84), which returns `{waits:[{document, by, reason, at}], history}` for a question. Searching every `src` file: `documentWaits` is called only by `investigation/index.mjs:647` (a run's "waiting" lines). No op maps to it (the ops map at `inquiry/index.mjs:2940-2960` has `questionwaits`, `waitlook`, no document-waits op; `op-declarations` and `op-grades/t41.mjs:218` describe `questionwaits` as "every dated wait on a question"). inquiry R58 says the question's own screen asks for it, but nothing delivers it: the capture side records it (capture R79 `waiting`, R84), the inquiry reader exists, the door and the screen have no connection. The record of the set-aside itself is right: Ben's answer lists the `captured_for`/`waiting` and the document's `set_aside {reason, author, at}` in the held list.

### 2. Why the module tests missed it
`inquiry/document-waits.test.mjs` tests `documentWaits` directly; `inquiry/waits.test.mjs:220-308` tests `questionWaits` (dated waits only). The screen tests feed a scripted plane: `screens-inquiry/fixtures.mjs:115` `questionwaits: ok({ ok: true, waits: [{ document: "INFO-2026-0008", title: "2024 budget PDF", setter: "ben", reason: "wrong year", date: "..." }] })`, an answer the real op never gives. Absent: a test of the op `questionwaits` (the door) on a question with a set-aside document; no test joins the screen's read to the module's answer (fixture drift).

### 3. Failing-first test
`bio-plane/test/m/inquiry/document-waits.test.mjs`: through the ops map (`inquiryOps(...).questionwaits()` with the viewer stamped), a question whose document `capture.heldActsOf` reports set aside by `ben` with reason `wrong year` -> the answer's `waits` holds `{document, by, reason, at}` (or a named `documents` key if BOB prefers; the screen then reads it); control: a restore empties it; an ended question answers history, no wait; a viewer who may not see the question gets `waits: []`. Walker's exact case: `bio-plane/test/m/control-plane/` (r8-kit) `heldsetaside` by Ben then `questionwaits` by Ana contains `ben` and `wrong year`, Queue count unchanged. Screen: `screens-inquiry/question.test.mjs` re-pointed so its `questionwaits` double has the real shape.

### 4. Owning module and platform
`inquiry` (`bio-plane/src/inquiry/`, layer 6): the `questionwaits` arm (and R55/R58 text, so the dated wait and the document wait are one answer, or a second op declared). If BOB takes the second-op route, `op-declarations`, `op-grades` and `screens-inquiry` (the read) join; the first route changes `inquiry` and the descriptions only. It depends on `capture` (`heldActsOf`, exists). Platform: no (in-process store logic).

---

## 7. 05 R38 "The question/document history lists every set-aside and restore in order" -- WALKER-ERROR (wrong op); the specified read is the DEFECT of 6

Answer: `bundlehistory` of the 2024 page: one revision (kind `promotion`), `states: []`.

### 1. Root cause / specification
`bundlehistory` is the document's PROMOTION record (promotion R58: `revisions` are manifest entries; `states` are the document's `state_history`, i.e. collected -> verified -> retired). A set-aside does not promote or change the document ("The document is unchanged, stays at `collected` and is never deleted", capture R79), and restore likewise, so `revisions` and `states` rightly hold neither. The specified home of that history is the QUESTION's: capture R79 "so the act stands in that question's history (R84) with the reason, who and when", R81 "the same history", and inquiry R58 `documentWaits().history` ("every set-aside and restore recorded with the question, in order"). The screens-inquiry document page draws "The record of this copy" from `bundlehistory` (R65) with standing changes only. The walker read the document's op; the right read is the question's history, which has no op, i.e. exactly the missing door of row 6 (`documentWaits.history`).
(The held list does carry the latest act: `heldcaptures state=set_aside` gave `set_aside {reason, author, at}`; there is no per-document list of every act except through the question.)

### 2. Tests
`capture/` tests `heldActsOf`; `inquiry/document-waits.test.mjs` tests `history`; no test reads it through a door.

### 3. Failing-first
Same as row 6, with the history assertion: after Ben's set-aside and Ana's restore, the question's wait read (same op as row 6) holds `history` = [set_aside by ben "wrong year", restore by ana "It is the 2024 page..."], oldest first, in `bio-plane/test/m/inquiry/document-waits.test.mjs` and the control-plane Miniflare test.

### 4. Owner: `inquiry` (with 6). Platform: no. If BOB wants set-aside and restore on the Document page's record, that is a new requirement for `screens-inquiry` R65 reading the question's history; not defect.

---

## Notes for BOB

- Rows 1, 2 and the owner-c part of 3 are ONE cause (promotion R28 / ratification `hasCapture` against a testified observation). It blocks publishing any case that reaches a member's own observation (R171 (3) to (8), R92, R93 (6) owner-c).
- Rows 6 and 7 are ONE cause (no door delivers inquiry R58). Row 7 needs no code of its own.
- Row 4 is the only one that also needs a requirement amendment (review R16 versus case-authoring R83), and its screen half is easy to miss because the walker called `attribute` directly.
- 05 may still be running; rows after line 30 are not covered.

# Diagnosis of walk-T51-final sitting 11 (Act): the 32 BROKEN rows and 17 defects

Read: record `build/plan/archive/walk-T51-final/11-act.md` at branch commit `77729b6253` (origin/prep/final-11-act); product read in `/home/user/wt-diag` at `49f2e85a98` (tranche/T51). The record (432 lines) and `fix-round-10-T51.md` were read whole; the other diagnoses were grepped (`diag-04/09/10a-05`, `diag2-*`). Rows are cited as record line numbers (L49 = line 49). Probes I ran are named; I did not run Chromium (not installed here).

All 32 BROKEN rows are placed: L49 (D13); L109, L181 (D3); L115 (D10); L121 (D11); L157, L279, L287, L416, L417 (D2); L213 (D12); L228 (D5); L266 (D1); L280 (D15); L285 (D14); L327, L329 (D7b, D8b); L335, L337, L339 (D8b); L341, L343, L345, L347, L351 (D7a); L382, L389-L393 (D8a); L410 (D9). D4, D6, D16 and D17 are in the record's Defects list with no BROKEN row of their own.

| # | Record | Rows | Verdict | Owning module | One-line cause |
|---|---|---|---|---|---|
| 1 | D1 | L266 (R103, R192) | DEFECT (MAJOR) | control-plane | the door stamps `publishcheck`'s `author` as `member:walker`, `publish`/`publishpreflight` as `walker`; the owner test wants the bare id |
| 2a | D2 | L157, L279, L287, L416, L417 | DEFECT (MAJOR) | screens-action | the page's prepare sends only `{action, purpose, text}`: no language, voice, audience, so the assertion, own-benefit and position readings do not run |
| 2b | D2 (part) | L279 | DEFECT (MINOR) | filings | R44 says an absent voice reads `group`, but the position reading runs only on an explicit `voice: "group"` |
| 3 | D3 | L109, L181 | DEFECT (MAJOR) | consequences | causation reads `head.currentState`; a project's conclusion leaves the question's own state `open` |
| 4 | D4 | none | DEFECT (MAJOR) | screens-action | the revise form and its send carry no `basis` and no `causation`, so a not-assessed part cannot become assessed |
| 5 | D5 | L228 | DEFECT (MAJOR) | actions | `clock_next`/`clock_overdue` look only at `pending` entries; an entry stored `overdue` drops out of both |
| 6 | D6 | none | DEFECT (MAJOR) | screens-action | `matter.mjs:419` draws `cs.esc(p.label)`; the plane's `label` is an object; it is the label, not the causation |
| 7a | D7 | L341-L351 | DEFECT (MINOR) | screens-action | event, determination and standard ids drawn as names on Matter, Plan and Start and send |
| 7b | D7 | L327, L329 | DEFECT (MINOR) | action-producers | queue sentences fill `{action}` with the raw `ACTN-` id |
| 8a | D8 | L382, L389-L393 | KNOWN diag2-07 #10 | interface-shell | `.cs-wizmark` ("Show me how") is not in the phone 44 px rule |
| 8b | D8 | L327-L339 | WALKER-ERROR (KNOWN diag2-10b C9) | none | detector reads `innerText` of buttons inside closed `<details>`; the avatar and masthead buttons carry `aria-label` |
| 9 | D9 | L410 | DEFECT (MINOR) | interface-shell | no `dblclick` handler on the rail grip; design DEC-155 says double-click resets, R26 omits it |
| 10 | D10 | L115 | SPECIFIED (consequences R11) | consequences | the part stores no severity (the row allows "at least never stored"); only answers are barred by R11 |
| 11 | D11 | L121 | SPECIFIED (escalation R19, R27; v0.2 rule 4) | escalation | only the fields are barred; the reason is the member's own words |
| 12 | D12 | L213 | SPECIFIED (content extent rule, local-facts R10) | local-facts | the paragraph bound is checked only where the record holds a paragraph count |
| 13 | D13 | L49 | WORDS | conformance (words) | the refusal's route does not say the body must be a registered subject first |
| 14 | D14 | L285 | WALKER-ERROR | none | the election notice is drawn when the member marks `names_pending`; the walker sent no mark (the page cannot: see 2a) |
| 15 | D15 | L280 | SPECIFIED (filings R39; v0.2 rule 9) | filings | a position sentence is pointed out for the member to remove, never refused |
| 16 | D16 | none | DEFECT (MINOR) | screens-action | the hold's place choice is labelled by the mark's date only |
| 17 | D17 | none | DEFECT (MINOR) | screens-action | the replies read the mark from `entries[].pressure` (the document); `actionpressure` stores it in `action_pressure` |

Policy flags (BOB decides whether Bob's): item 2a (the assertion gate that stops a letter saying the body broke a rule without a determination does not run from the screens), item 11 and item 15 (whether significance words in a reason, or a policy position in a team comment, should ever stop an act).

---

## 1. 11 L266 "publishcheck as the project's owner is refused NOT_THE_PROJECT_OWNER" (D1) -- DEFECT (MAJOR), control-plane

### 1. Root cause with evidence
- The owner test is membership's: `case-authoring/index.mjs:1394` `if (!this.membership.isProjectOwner(proj, who)) return { ok: false, reason: "NOT_THE_PROJECT_OWNER", ...`, with `who = str(author)` (`:1380` `#authority(project, viewer, who)`), and `membership/index.mjs:564` `isProjectOwner(projectId, memberId)` reads `participation(projectId, memberId)`, keyed by the bare id.
- `op=publishcheck` passes the query's `author` straight in: `case-check/index.mjs:357` `author: q("author") };` into `c.checkAndHold(args, ...)` (`:358`), which runs the pre-flight and `publishCase` with that author.
- The door sets `author` for `publishcheck` through the generic declared stamp, `control-plane/index.mjs:1411` `author: viaSession ? sessIdentity : actor` (`stampOf`), where `admission/index.mjs:375` gives `identity: \`member:${member}\``. `op=publish` is instead stamped by the STATE_ACTIONS statement (`control-plane/index.mjs:2306`, `op-declarations/index.mjs:1619` lists `"publish"`), which sets `viaSession ? sessMember`, the bare id; and the comment at `:2345-2356` says the pre-flight "takes publish's stamp by publish's expression": `if (op === "publishtensions" || op === "publishpreflight") inner.searchParams.set("author", viaSession ? sessMember : ...)`. `publishcheck` was declared (`op-declarations/t45.mjs:92` `publishcheck: "publishgate"`, same spec and capability as publish) but never added to that line. The case-check requirement says "the owner-only authority come first, unchanged" (R1), i.e. publish's.
- Probe I ran (`/tmp/claude-0/.../scratchpad/p/d1.test.mjs`, the control-plane `harness.mjs` `world`/`call`/`opCalls`, member ann): inner `author` for `publishpreflight` = `ann`, `publishtensions` = `ann`, `publishcheck` = `member:ann`.
- Its `aiCred` stamp (`:2354` `if (op === "publishpreflight" && cls === "ai")`) is also not set for `publishcheck`, though `case-check/index.mjs:349` reads `q("aiCred")`; the same omission.

### 2. Why the module's tests missed it
`case-check/hold.test.mjs:106-121` calls `caseCheckOps(w.c, url, body).publishcheck()` with `author=ann` already bare, never through the door. `op-declarations/t45.test.mjs:108,191-192` pins the stamp key names (`["author","viewer"]`) and that the specs equal publish's, not the value stamped. `control-plane/stamps-action.test.mjs:77` drives `publishpreflight` only; no control-plane test names `publishcheck` (grep).

### 3. Failing-first test
Add `bio-plane/test/m/control-plane/stamps-publish.test.mjs` (control-plane tests): with `harness.mjs`, for the founder, a member and an agent, call `publishpreflight`, `publishtensions` and `publishcheck` with a forged `author`; assert the inner `author` of `publishcheck` equals that of `publishpreflight` for every caller (member: `ann`; today `member:ann`) and that an agent's `publishcheck` carries `aiCred` as `publishpreflight` does. Walker's case through the door: a Miniflare test with `r8-kit.mjs` (as `t51-round7-seam.test.mjs`): the owner prepares an edition with `publish`, calls `publishcheck`, asserts `held: true`, then `determine` resting on that held check lands; red today with NOT_THE_PROJECT_OWNER.

### 4. Platform
None: a pure stamp expression in the door; the probe above is the check at its real shape (the door function over the stamps), no workerd behaviour involved.

### Requirement
case-check R1 states the right behaviour ("owner-only authority ... unchanged", the stamp as publish's); only code changes. One sentence for control-plane R29 (BOB's wording, optional): "an op graded as `publish` is stamped `author` by publish's expression."

---

## 2a. 11 L157, L279, L287, L416, L417 "the page's prepare sends no language, voice or audience; the checks never run from the screens" (D2) -- DEFECT (MAJOR), screens-action

### 1. Root cause with evidence
- The page: `screens-action/send-steps.mjs` `PREPARE.send` builds `const body = { action: view.subject, purpose: view.ui.purpose || "request", text: text };` plus `fills` for a request, nothing else (the shell adds `reason`). No `language`, `voice`, `audience`, `own_doing` or `names_pending` is sent anywhere in `screens-action/*.mjs` (grep for `voice`: none).
- The plane reads those marks from the body only: `filings/index.mjs:3049` `marksOf = (b) => ({ voice: b.voice ?? null, audience: ..., language: b.language ?? null, ...` and `:3058` `communicationprepare: ... ...marksOf(b)`. `#marks` (`:1058-1079`) keeps `language: language ?? null` ("a BCP 47 tag the member states; never defaulted", comment `:1054`). `#pointOut` (`:1151`) `if (!language) return { state: "undetermined", why: "no_list", ... }`, so the assertion and own-benefit readings (`:1225-1231`) answer undetermined; and `filings` R43 states "A list `undetermined` ... is never a refusal: the approval shows `phrasing.no_list` and lands". So the plane behaves as specified; the walker's L157 evidence ("no language is stated for the draft, so no list is read", then `filingapprove` ok) is exactly that path.
- The words the page promises are drawn nowhere: `voice.group` / `voice.self` exist (`setup-words/rows.mjs:491-494`) and the Comment wizard step says "Choose "For the team" or "As myself"" (`rows.mjs:19094`), but only `filings/index.mjs:1368` mentions the keys; no screen draws the choice. The member's language is known to the plane (`memberlanguage` op, read by `screens-settings/account.mjs:27`), the page never reads it.
- With language stated the same text is pointed out and refused (L158 WORKS, L288 WORKS), so the gap is the page.

### 2. Why the module's tests missed it
`screens-action/start-send.test.mjs:68-69` presses "Prepare what is sent" over a scripted plane and pins the body with `deepEqual(..., { action, purpose: "request", text, reason: undefined })`, i.e. it pins the missing marks. The scripted plane answers `communicationprepare` with a hand-built draft (`:60`); `send-t51.test.mjs`, `seam-t51.test.mjs`, `join-t51.test.mjs`, `fix4-t51.test.mjs` were read for `communicationprepare`: none sends or asserts a mark. The filings tests (`t45.test.mjs`) send the marks by hand.

### 3. Failing-first test
(a) `bio-plane/test/m/screens-action/start-send.test.mjs`: script `memberlanguage` to `{language: "en"}`, type "The Clerk violated Clerk Procedure 4.", press "Prepare what is sent"; assert the sent body carries `language: "en"` (today absent) and, on a public-comment action, the member's For the team / As myself choice as `voice`. (b) The walker's case through the real entry, `bio-plane/test/m/control-plane/walk11-letter.test.mjs` with `r8-kit.mjs`: take the body produced by `PREPARE.send` over the page's own fields (import the act from `screens-action/send-steps.mjs`), post it to `communicationprepare` on a breach-less action, then `filingapprove` with no resolution; assert the draft's `outward.pointed.assertion.state === "read"` and the approval is refused `ASSERTION_UNRESOLVED`; red today (state `undetermined`, approval `ok`). Same test, text "We also want the council to pay our group": refused `SELF_BENEFIT_ASK`.

### 4. Platform
None.

### Requirement
Needs wording, and a decision first. `filings` R43/R44 already state the plane's behaviour (language "the member states ... never defaulted"; voice choice). `screens-action` R3 says nothing about the marks. BOB (P17: UX and requirement, each with options and a recommendation) decides how the page states them; recommendation: the page sends the member's language setting as `language` with a control to change it for a letter, shows the For the team / As myself choice on a public comment or testimony (`voice`), and the audience on a documenting version, and a "this names a pending measure or a candidate" tick (`names_pending`, see item 14). One sentence for R3: "Prepare what is sent states the draft's language, voice and audience as the owner takes them, from the member's choice, never from nothing." Legal/policy: this check is the doctrine "an act asserting a breach rests on a determination" (v0.2 rule 2); with it not running from the screens a team letter can say the body broke a rule and be approved. BOB decides whether that is Bob's.

---

## 2b. 11 L279 "an absent voice on a public comment is not read as the group's act for the position reading" (part of D2) -- DEFECT (MINOR), filings

### 1. Root cause with evidence
`filings` R44: "A public comment or testimony is prepared `voice: "group"` ... or `voice: "self"` ... Absent reads `group`." and R39 points out position sentences "in a public comment or testimony prepared as the group's act (R44)". Code: `filings/index.mjs:1231` `...(marks.voice === "group" ? { position: Filings.#pointer(this.#pointOut(sentences, "position", lang, view), "pointer.position") } : {}),` and `#marks` (`:1078`) stores `voice: voice ?? null`. `filingRecordSent` refuses only `self`, so an absent voice records as the group's act while its text is never read for a position. The walker's L279 shows `voice mark null`, position `undefined`.
Not established: whether the page should send the voice (2a) makes this moot; it matters for every door caller that omits `voice`.

### 2. Why the module's tests missed it
`filings/t45.test.mjs:218-219` pins it: `assert.equal("position" in comm(f, A, { text: "We support the new budget." }).outward.pointed, false, "not a comment as the group's act")` (read in full, with the preceding `voice: "group"` case).

### 3. Failing-first test
`bio-plane/test/m/filings/t45.test.mjs` (or `t51.test.mjs`): on a `public_comment` action, `communicationPrepare` with `language: "en"`, no voice, text "We believe the council should adopt a stricter rule."; assert `outward.pointed.position.pointed` is non-empty and `marks.voice` reads `group`; control: kind `records_request` with no voice has no `position`. Red today (the key is absent).

### 4. Platform
None.

### Requirement
R44's text states the right behaviour for a public comment or testimony (only code changes); for other kinds R44 is silent, which the fix leaves as today.

---

## 3. 11 L109, L181 "a question concluded in the project reads causation unproven; the escalation cannot end" (D3) -- DEFECT (MAJOR), consequences

### 1. Root cause with evidence
- `consequences/index.mjs:409-417` `#causationNow`: `const head = this.record.head(inquiryId); const st = head ? head.currentState : null; ... if (!CONCLUDED.has(st)) return { state: "unproven", ..., why: word("consequences.why.inquiry_named_concluded", { state: ... }) }` with `:133` `CONCLUDED = new Set(["concluded", "published"])`.
- A conclusion made in a project does not move the question: `basis-versions/conclude.mjs:370-371` `receipt = { ..., to: "concluded", inquiry_state: b.current_state, inquiry_moved: false, ...` and `:206` the same; basis-versions R18: "one dated, authored `concluded` row is appended to the project's `conclusions[]` ...; the question's bytes do not change". The project's stance is read by `basis-versions.conclusionOf(project, inquiry, viewer)` (R22). `action-plans/index.mjs:243` already reads it for this reason (fix-round-10 item 61, K5131); `consequences` does not (`modules.json`: `basis-versions` is not in its `uses`).
- Effect chain: the part lands `causation_state` unproven (`:581-598`); `consequences` R9 makes overall addressed `undetermined` for any `unproven` part; `escalationend` refuses `CONSEQUENCES_UNDETERMINED` (L181 shows both live parts `assessed, unproven, addressed`). Same cause in `#basisChanged` (`:909`): `reopened = head && !CONCLUDED.has(head.currentState)` would flag a project-concluded, established part as "causation_reopened".
- Not the same item as fix-round-10 item 61 / `diag-09.md` #10 (`action-plans`, a plan's matter sentence): different module and read.

### 2. Why the module's tests missed it
Every consequences test makes the question concluded by writing its own state: `consequences/fixture.mjs:340-362` `inquiryMd(id, { state })` and `w.inquiryAt(INQ, "concluded", ...)` (`assessed.test.mjs:80,93,136`, `addressed.test.mjs:19`, `reads.test.mjs:129,142,247`, `declared-ops.test.mjs:17`). No test concludes through basis-versions in a project.

### 3. Failing-first test
`bio-plane/test/m/consequences/assessed.test.mjs`: in the world with project `w.P`, cite a question into it and conclude it with basis-versions' real `conclude({project: w.P, target: INQ, ...})` (its published `concludeAct` in `test/m/basis-versions/fixtures.mjs` is the shape); assert `inquiry` head `currentState` is still `open` (control), then `consequenceRecord({ ..., causation: INQ })` answers `part.causation.state === "established"` with the strength pair; red today (`unproven`, "the inquiry named is open, not concluded"). Then a revise to `causation: INQ` after the conclusion, and `escalation` end over such parts (control-plane `r8-kit`: the walker's L181 chain) lands. Control: a question concluded in another project stays `unproven`.

### 4. Platform
None.

### Requirement
Needs wording. `consequences` R5: "with none, or one not concluded, the part's causation is `unproven`" (and R8's "reopened"): add "an inquiry is concluded when its own state is concluded or the determination's project has concluded it (`basis-versions` R22); reopened likewise". BOB adds the `basis-versions` edge to `consequences`' `uses` (layer 6 below 9).

---

## 4. (no row) "a part recorded as not assessed stays undetermined when revised from the page" (D4) -- DEFECT (MAJOR), screens-action

### 1. Root cause with evidence
- Page: `screens-action/matter.mjs:576-594` `consequencerevise` `send` builds `{ id, reason }` plus `affected`, `measure`, `period` only; `reviseForm` (`:272-280`) has fields `mt-r-part`, `mt-r-desc`, `mt-r-amt`, `mt-r-from`, `mt-r-to`, `mt-r-why`: no "how it is known" choice, no rationale, no question. The record form has them (`:264-267`, `:270`: `mt-c-basis`, `mt-c-rat`, `mt-c-cause`).
- Plane: `consequences/index.mjs:528-546` `consequenceRevise`: `basis: pick("basis", oldBasis)` with `oldBasis = { why: old.undetermined_code }` for an undetermined part, so a revise with only a measure keeps the not-assessed basis and the part stays `undetermined` (R3: assessed only "with a rationale"; R4). `causation: pick("causation", old.causation)`: the page cannot change it either, so a part recorded before its question was concluded (item 3) can never be revised to `established` from the page.
- The plane accepts both (`DECLARED_OPS.consequencerevise.fields.accepts` lists `basis`, `causation`, `consequences/index.mjs:1725`).

### 2. Why the module's tests missed it
`screens-action/matter-t51.test.mjs:200-206` scripts the answer (`consequencerevise: ok({ ok: true, id: "C-4" })`) and pins the body `{ id, reason, measure }` and `{ id, reason, affected }`; the scripted plane never says the part stayed undetermined.

### 3. Failing-first test
`bio-plane/test/m/screens-action/matter-t51.test.mjs`: open a determination with an `undetermined` part, choose "consequencerevise", choose the part, tick "my own assessment", fill `mt-r-rat` and `mt-r-amt`, press; assert the sent body carries `basis: { rationale, rests_on: [] }` (today absent). Walker's case through the real plane: control-plane `r8-kit` seam: record a part "not assessed", send the page's revise body, read `consequencesof`: the part is `assessed` (red today: `undetermined`).

### 4. Platform
None.

### Requirement
Needs wording: `screens-action` R50 says only "`consequencerevise` (with a reason) ... each sent with the fields its owner declares". One sentence: "`consequencerevise` offers the same how-it-is-known controls and the question as `consequencerecord` and sends `basis` and `causation` when the member changes them."

---

## 5. 11 L228 "the action-level overdue flag disagrees with an entry that reads overdue" (D5) -- DEFECT (MAJOR), actions

### 1. Root cause with evidence
- `actions/index.mjs:200-207` `actionClockNext`: only entries with `e.status === "pending"`; `:284-310` `actionOverdue` starts `const next = actionClockNext(fm); if (!next) return false;` and judges only the entries dated `next`. `derived()` returns `clock_next: actionClockNext(fm), clock_overdue: actionOverdue(fm, now, view)` (`:2625-2626`) and `actionRead` returns `clock: fm.clock` as stored (`:2903`). Entry 0 reads `overdue` because the stored document says so: monitoring's `deadlineRecheck` (`monitoring/index.mjs:3128`; actions R33, the one machine write to a clock) moves a pending, passed entry to `overdue`. I did not run that sweep.
- Probe I ran (`p/d5.mjs`, pure functions, 25 Oct 2026, America/Los_Angeles): clock `[{2026-10-01 overdue}, {2026-10-30 pending}]` gives `clock_next 2026-10-30`, `clock_overdue false` (the walker's L228); `[{2026-10-01 overdue}]` alone gives `null`, `false`; with both pending: `2026-10-01`, `true`.
- Actions R12 as written defines both on pending entries ("`clock_next` is the earliest `date` among `pending` clock entries ... `clock_overdue` is true exactly when `clock_next` is before the local day"). Written before R33's `overdue` status was stored; the stored status is a different state from met or waived.
- Consumer that loses it: `escalation/index.mjs:445-450` `if (!facts.clock_next) notes.push(... notification_action_pending) else if (facts.clock_overdue) alts.push(...)`, which feeds the stage trigger (monitoring R35: "a clock marked overdue can meet an escalation stage's trigger"); also `actions` `openItems` (`:3173`, `overdue_replies`) and the retrieval column `action_clock_overdue` (`retrieval/projection.mjs:19`, filter `overdue` in `query.mjs:124`). The Queue is not affected (L229 WORKS: `action-clocks.overdueClocks` reads stored `overdue` too, `action-clocks/index.mjs:535`). I did not run the escalation chain; the lines above are what it reads.

### 2. Why the module's tests missed it
`actions/read.test.mjs:22-30` tests `clock_overdue` over pending entries only; `t33.test.mjs:355-363` and `t46.test.mjs:28-73` move an entry to `overdue` by the mechanical recheck and assert the write is allowed, never read `clock_overdue` afterwards.

### 3. Failing-first test
`bio-plane/test/m/actions/t46.test.mjs`: `w.action(A, ["clock:", entry 2026-09-28 pending, entry 2026-10-30 pending])`, advance the clock past 28 Sept, apply the mechanical `overdue` promotion (as `:28`), then `w.a.actionRead({ id: A, viewer })`; assert `clock_overdue === true` and `clock_next === "2026-10-30"`; red today (`false`). A second case: only the overdue entry left, `clock_overdue === true`. Then `escalation` (`test/m/escalation/`): an action whose only entry is stored `overdue` meets the stage trigger, not the "action pending" note.

### 4. Platform
None for the derivation (pure over the document). The alarm that runs monitoring's sweep is workerd's scheduler; the check at its real shape is the walker's room (a Miniflare plane's alarm), and the derivation is the same.

### Requirement
Needs wording: R12: "`clock_overdue` is true when `clock_next` is before the local day, or when any entry is stored `overdue` (not met or waived); `clock_next` is unchanged." The escalation branch order (`facts.clock_overdue` before `!facts.clock_next`) is then a code change in `escalation`.

---

## 6. (no row) "assessed . [object Object]" on the Matter page (D6) -- DEFECT (MAJOR), screens-action

### 1. Root cause with evidence
`screens-action/matter.mjs:418-419` `'<span class="meta">' + cs.w("screen.matter.known." + ...) + (p.label ? " · " + cs.esc(p.label) : "") + "</span>"`. The plane's `label` is an object: `consequences/index.mjs:840-850` `out.label = { machine_work: false, says: word("consequences.says.member_assessment_presented") }` (computed: `{ machine_work, says: ... }` `:840`). `cs.esc` of an object is "[object Object]". The walker called it the causation object; the causation is not drawn at all (`matter.mjs` mentions `causation` only in the record send, `:570`), so a member never sees `unproven` on the page, which is why the escalation's refusal (item 3) is a surprise.

### 2. Why the module's tests missed it
The page fixture hand-writes a string: `screens-action/page.mjs:207` `{ id: "C-1", ..., state: "computed", label: "from the rent schedules" }`, not the owner's shape.

### 3. Failing-first test
`bio-plane/test/m/screens-action/matter.test.mjs`: use `consequencesof` parts in the owner's shape (`label: { machine_work: false, says: "..." }`, plus `causation: { state: "unproven", why }`), assert the part's row text contains the label's `says` and no "[object Object]", and that an unproven causation is drawn in the member's words. Red today. Better: take the part from `consequences`' published fixture (test-support/fixtures contract) so the shape cannot drift.

### 4. Platform
None.

### Requirement
Needs wording: `screens-action` R6/R50 should name what a part's line shows (state, the label's `says`, the causation state and why). Words for the causation line go to UX-DESIGN.

---

## 7a. 11 L341, L343, L345, L347, L351 "raw event, determination and standard ids drawn as names" (D7, screens part) -- DEFECT (MINOR), screens-action

### 1. Root cause with evidence
- Matter heading: `matter.mjs:400` `cs.esc(act.event || act.id || "")`; `act.event` is the event id (`conformance/index.mjs:451` `act: { event: ev.event_id, kind, when, why, ...`), not a name. The determination read does carry `event: {id, kind, status, when, ...}` (`conformance/index.mjs:1320-1327`), from which a name (kind, day, office) can be built.
- Plan: `plan.mjs:94` `dm = new Map(ds.items.map(d => [d.id, d.act && typeof d.act.event === "string" ? d.act.event : ""]))`, used by `matterName` (`:86`) and `ofKey`, treating the event id as a title ("a determination's act from `determinations`"); `plan.mjs:86` also draws `sub.standard` (the standard's id).
- Start and send: `start-send.mjs:88-91` `return cs.esc(key || "") + " · " + ...` where `key` is the determination id (`CONF-2026-...`) or inquiry id.
- Standard: `matter.mjs:408` `cs.esc(s.standard || "")`, `:262` choices `text: s.standard`: the `STD-` id; the citation is in the `standards` list (`diag2-08` C8 notes `x.cite` is read by Standard).
- The written rule: overlay (15) "no raw ids"; `screens-action` R18 "Titles. The plan names its project and question by their titles ... never `INQ-…`" (does not name a determination, event or standard).

### 2. Why the module's tests missed it
`screens-action/page.mjs:108` and `:200` hand-write titles: `act: { id: "EVT-1", event: "The 2024 rent adjustment" }`; the owner answers an id.

### 3. Failing-first test
`bio-plane/test/m/screens-action/matter.test.mjs`, `plan.test.mjs`, `start-send.test.mjs`: fixtures in the owner's shape (`act.event` an `EVT-2026-...` id, `event.kind` "meeting", `event.when`; standards with ids and a `standards` read giving `cite`); assert the page text matches none of `/(EVT|CONF|STD|INQ)-\d{4}-/` and shows the named form. Red today.

### 4. Platform
None.

### Requirement
R18 needs wording: "a determination is named by its act (the kind of event, its day and the office), a standard by its citation, never by id". The wording of the name is UX-DESIGN's (WORDS); no legal judgment.

---

## 7b. 11 L327, L329 "ACTN-2026-0001 drawn on Home and the Queue" (D7, queue part) -- DEFECT (MINOR), action-producers

### 1. Root cause with evidence
`action-producers/index.mjs:803` `summary: word("action-producers.summary.legal_threat_recorded", { action: String(arrived.action) })`, and the same fill at `:749` (reminder), `:888` (released hold), `:1006` (local fact deadline); the rows read "a legal threat was recorded on {action} and no litigation hold is stated for it" (`setup-words/rows.mjs:14393`). The module knows how to name an action: `:1400-1410` reads `SELECT current_state, title FROM bundles` for the approval item. In the walk ACTN-2026-0001 carries the reply marked as a legal threat (L91, L187), so it is that sentence; I did not see the page text itself.

### 2. Why the module's tests missed it
`action-producers/action.test.mjs:222-232` asserts the item's subject, age and doors, never the `summary`; fixtures name actions `ACT-1`.

### 3. Failing-first test
`bio-plane/test/m/action-producers/action.test.mjs`: a legal-threat mark on an action titled "Comment on the filing rule"; assert the OBLIGATION item's `summary` contains the title and not the action id; same for the reminder, released-hold and local-fact items. Red today.

### 4. Platform
None.

### Requirement
Needs one sentence in `action-producers` (or the interface rule on ids): "an item names an action by its title, never its id". The design's sentence is unchanged.

---

## 8a. 11 L382, L389-L393 "'Show me how' under 44 px" (D8, first half) -- KNOWN diag2-07 #10 (interface-shell)

`diag2-07.md` #10 ("the phone rule does not name `.cs-wizmark`", `interface-shell/index.mjs:360`). Same control, same owner; not diagnosed again.

## 8b. 11 L327, L329, L335, L337, L339 "buttons with no accessible name" (D8, second half) -- WALKER-ERROR (KNOWN diag2-10b C9)

The walker's detector is `11-act.test.mjs:1141`: visible `button, [role=button]` whose `innerText`, `aria-label` and `title` are all empty. `diag2-10b.md` C9 probed the same pattern on Home and the Queue: the buttons are the `data-f` act buttons inside a closed `<details class="mk-details">` (`screens-daily/queue.mjs:117-121`, `home.mjs:146-148`). On the Act screens the acts sit in closed folds too: `screens-action/action.mjs:263` and `:297` (`const fold = ... '<details class="mk-details"><summary>'`), `matter.mjs` (four `mk-details`), `request.mjs` (one); `cs.act` draws every label as button text (`interface-shell/browser.mjs:711`). The record's guess "(the search and avatar controls)" is wrong by code: the avatar has `aria-label` (`browser.mjs:1316-1317`) and every shell button listed at `browser.mjs:831-2113` carries text or `aria-label`. I did not probe the three Action pages in Chromium; the record does not give the buttons' `data-act`; to settle it, rerun the check printing `outerHTML` of the flagged buttons and whether each sits under a closed `<details>`. No defect, no test.

---

## 9. 11 L410 "double-click on the rail's edge does not reset it to 184 px" (D9) -- DEFECT (MINOR), interface-shell

### 1. Root cause with evidence
`interface-shell/browser.mjs`: the grip has a `pointerdown` handler (`:2432-2442`, drag), a `keydown` handler (`:2449-2454`, `Home` sets `RAILW = RAIL_DEFAULT`), and no `dblclick` listener anywhere in the file (grep `dblclick`: none). The design says it does: `docs/development/ux-substrate/layouts.html:1221` "double-click resets it", `:6710` `document.addEventListener('dblclick', ... set(..., DEF))` (DEC-155). `interface-shell` R26 says only "set by dragging its edge or by the keyboard" and omits the double-click.

### 2. Why the module's tests missed it
`interface-shell/frame.test.mjs:199-216` fires `keydown` ArrowRight/ArrowLeft/Home and a `pointerdown`; no test fires `dblclick`; R26 does not ask for it.

### 3. Failing-first test
`bio-plane/test/m/interface-shell/frame.test.mjs` after `:216`: drag the grip to 263 (pointerdown/pointermove/pointerup), then `p.fire(grip(), "dblclick")`; assert `aria-valuenow` and the stored `cs-railw` are `184`. Red today.

### 4. Platform
Browser event order, not workerd: the real shape is Chromium's double-click (pointerdown, pointerup, click, click, dblclick). Because `up` calls `draw()` (`:2439`) the grip may be replaced between the two clicks, so the listener must be delegated on the root as the others are; check by a Chromium double-click after a drag (the walker's own).

### Requirement
Needs wording: R26 "... set by dragging its edge, by the keyboard, or by a double-click on it, which restores 184 px" (DEC-155 already states it).

---

## 10. 11 L115 "a severity field on a consequence is accepted and dropped" (D10) -- SPECIFIED (consequences R11)

`consequences/index.mjs:1701` `consequencerecord: () => c.consequenceRecord({ ...b, ...stamps })` and `#record` (`:551`) destructures only its named fields, so `severity` is never stored. R11 bars the answers ("none carries a significance, severity, priority or score"), and the walker's row itself allows "refused, or at least never stored": the part is stored with no such field (L115 text: "the extra field was silently dropped"). The comparison made (declinetoescalate, escalation acts refuse the key) is a different module's rule: `conformance` R8 and `escalation` R19 say "No input or answer carries ...", `consequences` R11 says answers only (`JUDGMENT_KEYS` is `escalation/index.mjs:121`, `SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT` is `conformance/checks.mjs:116`). The door does not refuse unknown fields (`accepts` is declarative).
Failing-first test: none while the requirement stands. If BOB wants parity: amend R11 to "no input carries ... (refused as `conformance` R8)", then `bio-plane/test/m/consequences/record.test.mjs`: `consequenceRecord` with `severity: "high"` is refused and writes nothing. Platform: none. Doctrine (K12, v0.2 rule 4): BOB decides whether a refusal of the input is Bob's.

---

## 11. 11 L121 "a decline whose reason says 'low significance and low priority' is accepted" (D11) -- SPECIFIED (escalation R19, R27; v0.2 rule 4)

`escalation/index.mjs:1731-1734` refuses only the keys `JUDGMENT_KEYS` in the arguments. R27: "A member records, in their own words, why the group is not pursuing" the matter; R19: "No input or answer carries a significance, severity, ..." (inputs as fields). `docs/architecture/BIO_Action_v0_2.md` rule 4: "Whether a matter warrants action, and how urgently, is a member's judgment, recorded only in acts and their reasons. No field holds significance, severity, priority or a score." A reason that says it is, by design. The row's expectation ("decline giving significance as the reason: see it refused") is the coverage row's, not the requirement's. No defect; no test. The record already left it to BOB; my reading of rule 4 is that screening the member's words would contradict it. BOB decides whether it is Bob's.

---

## 12. 11 L213 "a rule drafted from paragraph 99 of a two-paragraph document is accepted" (D12) -- SPECIFIED (content extent rule; local-facts R10)

`local-facts` R10: `RULE_NO_SOURCE` is "`content`'s extent refusals". `local-facts/index.mjs:206-232` `#sourceRefusal` runs `checkContentExtent(src.extent, ctx)`. `content/extent-core.mjs:645-647` `coversDocPara`: `const n = container ? container.paragraphs : null; if (!(Number.isInteger(n) && n > 0)) return null;`: the bound is checked only where the record holds a paragraph count (`content/index.mjs:369-373`, from `reading.container_extent.paragraphs`, carried for office containers at acquire), and skipped otherwise by design ("undetermined, STATED, never a refusal for what nobody measured", `extent-core.mjs:340-343`). Whether the walker's capture is an office container with a held count is not in the record; UNKNOWN; reproduction: read `contentContextFor(W.cap).container` in the walker's room. The screen's own check ("Those words are not in that document as written", `screens-settings` R61, DEC-357) is the one that reads the text units. Verdict as written: no defect in `local-facts` or `content`; the row expects a door check R10 does not name. If BOB wants the door to check the text, that is a new requirement for `local-facts` R10 (a passage the units do not hold is `RULE_NO_SOURCE`), then a test in `bio-plane/test/m/local-facts/`. Platform: none.

---

## 13. 11 L49 "the benchmark route the refusal names needs a registered subject" (D13) -- WORDS (conformance refusal C-113.32)

`standards/index.mjs:1980-1988` `benchmarkDeclare` takes `body` as an entity: `if (!this.#entity(body, a.viewer ?? null)) return noSuchEntity(body || null, { field: "body" })`; `standards` R43 lists `NO_SUCH_ENTITY` for `body`. A determination names the office by `{role, body, entity_id?}` (conformance R25) and an entity seeded for it is filled only if one exists, so a fresh room has none. The refusal sentence (`rows.mjs:13401` `refusal.STANDARD_NOT_BINDING`: "Record it as a benchmark comparison: below, slower than, or above.") does not say the office must be registered first; with it registered the route works (L50 WORKS). Words only: the sentence belongs to the design stream; one sentence for UX-DESIGN: "... first register the office as a subject if it is not one". No code defect, no failing-first test. Platform: none.

---

## 14. 11 L285 "naming a pending measure or candidate gives no notice" (D14) -- WALKER-ERROR

The election notice is not drawn from the profile's `applies_to`; it is drawn when the member marks it: `filings/index.mjs:1191-1203` `if (marks.names_pending) { const election = facts.filter((f) => f.trigger === "pending_measure_or_candidate"); ...out.push({ kind: "election", key: "filings.election.notice", ...` and R39 ("When the member marks at preparation that a draft names a pending measure or a candidate"). `campaign_spending` (`jurisdictions/profiles/oakland-alameda.mjs:724`) has no `applies_to` by design; the `applies_to` loop (`:1209-1212`) is a different notice. The walker's call (`11-act.test.mjs:915`) sent `voice` and `language` but no `names_pending`. `filings/t45.test.mjs:208-214` proves it: `prep(f, A, { names_pending: true })` gives the notice with the fact's citation, unmarked gives none. What is real is that the page has no way to mark it: that is item 2a (the marks the page never sends: `names_pending`, `own_doing`). No separate test.

---

## 15. 11 L280 "a team comment is approved while its position sentence stands" (D15) -- SPECIFIED (filings R39; v0.2 rule 9)

`filings` R39: each position sentence "is pointed out for the member to remove or resolve, as R43's are"; v0.2 rule 9: "In testimony prepared as the group's act, a sentence stating a policy position is pointed out for the member to remove." `filingApprove` refuses only `ASSERTION_UNRESOLVED` and `SELF_BENEFIT_ASK` (and `CONTRADICTED_HELD`), never a position. `filings/t45.test.mjs:220` asserts "pointed, still approved". The walker's expectation ("approval refused while it stands") is the coverage row's parenthetical (`coverage/11-act.md`, R199); the wizard's words ("remove it, or comment as yourself") match the requirement. "as R43's are" is the one ambiguous phrase (R43 refuses). No code change; wording: R39 "pointed out, never refused; approval lands" (what the test pins). Policy: whether an approved team comment may carry a policy position is the doctrine of rule 9; BOB decides whether that is Bob's.

---

## 16. (no row) "The hold is for" lists two replies only as 'October 25, 2026' twice (D16) -- DEFECT (MINOR), screens-action

### 1. Root cause with evidence
`screens-action/hold.mjs:77-78` `const options = rows.filter(m => P.placeOf(m)).map(m => ({ value: JSON.stringify(P.placeOf(m)), text: m.marked_at ? cs.date(m.marked_at) : "", m: m }))`: the option's text is the marking date alone; the "Where the pressure arrived" list above it (`:60-63`) shows the note, the marker and the kind. Two marks the same day read the same.

### 2. Why the module's tests missed it
`screens-action/hold-counsel.test.mjs:36` reads the option values only; the fixtures hold one mark per day.

### 3. Failing-first test
`bio-plane/test/m/screens-action/hold-counsel.test.mjs`: two `holdsdue` marks of the same day with different notes; assert the two `hold-for` options have different texts and each contains its note. Red today.

### 4. Platform
None.

### Requirement
`screens-action` R32 does not say what the choice shows; wording: "each place in 'The hold is for' is named by its mark's note and day". Words by UX-DESIGN.

---

## 17. (no row) "Mark a reply as pressure" still offered after the reply was marked; the mark is not drawn beside it (D17) -- DEFECT (MINOR), screens-action

### 1. Root cause with evidence
`screens-action/action.mjs:344-348`: `const e = entries.find(x => x.ord === c.ord) || {}; const pr = e.pressure ? ... : ""; const mark = !e.pressure && c.direction === "received" ? <the choice, note and act "actionpressure"> : ""`, with `entries = a.entries` (`:266`). `a.entries[].pressure` comes from the document: `actions/index.mjs:2690-2696` maps `fm.correspondence` through `entryFields` (`pressure_kind`, `pressure_note` of the entry). `actionpressure` (action-holds) does not write the document: `action-holds/index.mjs:233-236` `INSERT INTO action_pressure (bundle_id, ord, kind, note, marked_by, at)`; a second press is refused from either source (`:230`), which is the walker's PRESSURE_MARKED. The marks are read by `pressurefor` (`action-holds` R12, R16), which the page already fetches (`action.mjs:37`) and draws in "pressure marks" (`:361-390`); the reply rows do not use it.

### 2. Why the module's tests missed it
`screens-action/action.test.mjs:38` and `reply-t51.test.mjs` script `entries` with `pressure` in the document form; the scripted plane never has a mark made by `actionpressure`.

### 3. Failing-first test
`bio-plane/test/m/screens-action/action.test.mjs`: `pressurefor` returns an item with `arrived: { action: ACTION_ID, ord: 0 }`, `a.entries` carries no pressure; assert reply 0's row shows the mark (`screen.action.pressure.legal`) and no `pressure-kind-0` choice, and reply 1's still offers it. Walker's case through the real plane: control-plane `r8-kit`: `actionpressure` on ord 0, then `action` and `pressurefor` reads, page draws; red today.

### 4. Platform
None.

### Requirement
`screens-action` R5 ("a received reply marked as pressure, once") states it; R12 draws marks from `pressurefor`. Only code changes; optionally one sentence in R5: "the reply's mark is read from `pressurefor`, from either source".

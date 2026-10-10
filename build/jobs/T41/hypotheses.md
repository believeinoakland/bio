# hypotheses (T41)

**Status** · session_01SNmT525iDHSzNtvbkS4m7u · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Two points; I carry on with R16–R18, R20, R21 and R19's share on my best reading, and leave R19's warning as the one open item.

(1) R19's warning ("carries `inquiry` R59's warning at the act"). The person test (an entity of kind person holding no public role, `entities`) is named nowhere as a service: `entities` holds no public-role notion in its code or requirements, and inquiry R59 (T41-15, running beside me) has no exported test yet. Your START says none of L6's changes is used by mine, but this one is. My best reading: hypotheses gains the edge `inquiry` (earlier in L6, merges first) and calls one pure function inquiry R59 exports, say `personWarning({text, viewer})` → `null` or `{code, translation, persons}`, answering it in `noteShare`'s answer as `warning` and recording it with the share; never a refusal. Until it exists I reach it optionally (absent → no warning) and the test of that clause stays red, named. Please name the function, its signature and its owner (inquiry or entities), or rule otherwise.

(2) Details I am taking as BOB's unless you say otherwise (recorded in my record): a proposal gets a `HYP-` id from `allocId` (so every leg check already refuses it, R5) in its own table `hypothesis_proposals` (sight the inquiry's, export yes, purged with it); R18's act is `hypothesisSetAside({proposal, reason, by})`; reads `proposalsOf({inquiry, viewer})` under the heading "the system's"; a proposal is open until one member takes it up or sets it aside (then `PROPOSAL_NOT_OPEN`); a share has an opaque random id, holds no note number (so R14's no-trace rule survives the note's deletion), table `note_shares` keyed by `project_id`, sight bundle, export never; `sharesOf` to a non-participant answers exactly as a project with no shares, and also lists the withdrawn markers (no words) so R20's record is readable; R19 asks `membership.projectAuthority(project, by, "joined", "noteshare")` and relays its refusal. New ops in R7's map: `hypothesispropose`, `hypothesistakeup`, `hypothesissetaside`, `hypothesisproposals`, `noteshare`, `noteunshare`, `noteshares` (op-declarations declares them later). New catalogue rows C-134.20 on, awaiting stamp (rule 4 (2)).

## Completion (HYPOTHESES #5)

**Reading set** (mechanics §17): measured as §3 asks, about 175 KB: requirements (17 KB), this module's code (52 KB) and tests (92 KB), layer 6's row of `build/layers.md`, plan entry T41-16 and rule 4, K2448, `draft-T41-investigation.md` §3.6's lines for hypotheses and inquiry R59, and the used services named: record-grammar R52 (`acceptance.mjs`), membership R54, R55, R76, R127 (`isJoinedParticipant`, `projectAuthority`, `joinedParticipants`, `positionalMember`), record-core `declareTable`'s classes. Under 300 KB: read whole myself, no workers.

**Applied (T41-16), committed on `job/T41/hypotheses`.**
- **R16** `hypothesisPropose({inquiry, kind, statement, about, how, false_alarm_rate, run})`: a `HYP-` id from `allocId` in its own table `hypothesis_proposals` (keys `bundle_id`, sight bundle, export yes, purge clear), so R5 already refuses it as a leg; labelled "the system's" with `how`, `false_alarm_rate` (0…1) and `run`. Answered under `hypothesesOf`'s `system_proposals` (heading "The system's proposals"), never among `hypotheses`, and by `proposalsOf({inquiry, viewer, run?})`. Refusals in order: `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`, `UNKNOWN_HYPOTHESIS_KIND`, `HYPOTHESIS_NO_STATEMENT`, `BAD_ABOUT`, `PROPOSAL_NO_HOW`, `PROPOSAL_NO_RATE`, `PROPOSAL_NO_RUN`.
- **R17** `hypothesisTakeUp({proposal, form, statement?, by})`: holds by R1 as hers (`as_proposed` in its words; `edited`, `own_instead` in hers), records `acceptanceRecord` (kind `hypothesis`); the hypothesis's reads carry `came_from` (the system, the proposal, the form, how, rate). Refusals: `NO_SUCH_PROPOSAL`, `MACHINE_CANNOT_HYPOTHESISE`, `PROPOSAL_FORM_UNKNOWN`, `PROPOSAL_NOT_OPEN`, `HYPOTHESIS_NO_STATEMENT`, then R1's unchanged. `as_proposed` is allowed (a hunch is not a legal or authored statement, so no `ACCEPT_MUST_REAUTHOR`).
- **R18** `hypothesisSetAside({proposal, reason, by})`: stays readable with who, when and her reason. Refusals: `NO_SUCH_PROPOSAL`, `MACHINE_CANNOT_HYPOTHESISE`, `PROPOSAL_NO_REASON`, `PROPOSAL_NOT_OPEN`. `hold`'s machine refusal unchanged.
- **R19** `noteShare({note, project, by})`: `MACHINE_CANNOT_NOTE`, `NO_SUCH_NOTE`, then membership's `PROJECT_ACT_NOT_A_PARTICIPANT` relayed from `projectAuthority(project, by, "joined", "noteshare")`. Copies the current words into `narrative_shares` (keys `project_id`, sight bundle, export never, purge clear), an opaque id `share:<uuid>` (no record id), no note number held. Never a leg: the leg check refuses a `share:` target `NARRATIVE_NOT_A_LEG` (C-134.28). The warning (B2, K2479) is `inquiry.personWarning({text, entities: [], viewer})`, read off inquiry's module namespace so it is reached optionally until inquiry's T41 merge exports it (a `deps.personWarning` for tests); answered as `warning`, recorded with the share, never a refusal. `modules.json` and Uses gained `inquiry` (BOB's). Open on inquiry's merge: if its `entities` argument must carry the persons a text names (with their lines) rather than be found from the text, the caller's share is a CHANGE.
- **R20** `noteUnshare({share, by})`: words and warning emptied, `withdrawn_at` set; `MACHINE_CANNOT_NOTE`, `NO_SUCH_SHARE` (absent, withdrawn, another's: one answer).
- **R21** `sharesOf({project, viewer})`: joined participants only, newest first, at most 200 with `truncated`; also `withdrawn` markers (who, shared, withdrawn; no words). Anyone else reads exactly as a project with no shares.
- **R14** amended: a share is a copy holding no note number; revising or deleting the note leaves no trace of the note; the withdrawal marker is the share's.
- **R7** ops added as op-declarations R43 names them: `hypothesistakeup`, `noteshare`, `noteunshare`, `shares` (this replaces J1 (2)'s op names; J2 (a)). No op for `hypothesisPropose` (an in-process door), set-aside or the proposals read (the `hypotheses` op answers them under their heading).
- Catalogue rows C-134.20–C-134.28 new, awaiting the stamp (rule 4 (2)). Size: 810 → 1,089 lines.

**Tests.** New `t41.test.mjs` names R14, R16–R21, each with a negative control; R7's ops test re-stated for the four arms; the fixture's `others()` leaves out the two new tables. `node --test bio-plane/test/m/hypotheses/`: tests 46, pass 45, fail 1: **named red** `t41.test.mjs` "R19 with no test injected, noteShare asks inquiry R59's own personWarning" (asserts inquiry exports `personWarning`), red until inquiry's T41 merge (B2). The injected-test R19 warning test, with its negative control, passes.

**Other modules.** control-plane `r53-routes.test.mjs`:67 (R53) is red from this change: the four new arms have no spec or `OP_STAMPS` entry until op-declarations' T41-58 (its R43). affordances, op-declarations, plane: the same failing tests with and without this change (33, 8, 8, all pre-existing).

**Deferred.** None of this module's. Gaps for other modules (J2): op-declarations R43 names no set-aside op for R18's `hypothesisSetAside`; control-plane `r53-routes.test.mjs`:67 red until T41-58 declares the four arms.

**Checks** (after merging `tranche/T41` @ 15ec91ff1f): format 0; architecture 0 (12 files, 40 imports); coverage 21 of 21; ownership 0 (7 files).

Size (session_01SNmT525iDHSzNtvbkS4m7u): test runs 14, module lines 1,093

## J2 · REPORT

Built and pushed everything but R19's production warning wiring (J1 (1), still open); details in my record's "Work so far". 45/45; format, architecture, coverage (21/21), ownership 0.
(a) J1 (2)'s op names are replaced by op-declarations R43's: `hypothesistakeup`, `noteshare`, `noteunshare`, `shares`; no op for propose (in-process), set-aside or the proposals read (they ride the `hypotheses` read under their own heading). R43 declares no set-aside op: R18's act has no route until one is named (op-declarations' or the plane's).
(b) New red in another module from my four arms: control-plane `r53-routes.test.mjs`:67 (R53: every served op has a spec and `OP_STAMPS` entry) until T41-58 declares them. Please name it an accepted red or tell me to hold the arms back.
(c) The share table is `narrative_shares`, not J1's `note_shares` (R14's test reads no table named for notes in record-core's counts).

## J3 · COMPLETE

T41-16 applied (R14 amended, R16–R21; B2 taken: R19 calls inquiry.personWarning, reached optionally). hypotheses tests 46: 45 pass, 1 named red until inquiry's merge (t41 'R19 with no test injected…'). Checks: format, architecture, coverage 21/21, ownership 0. Other modules: control-plane r53-routes:67 red until T41-58 (J2 (b)); no set-aside op in op-declarations R43 (J2 (a)). Record: Completion.

## Completion again (B5 CHANGE; HYPOTHESES #5)

Merged `tranche/T41` @ dc41a13858 (inquiry merged, K2498). R19's warning is now inquiry's own: `personWarning({text, entities, viewer})` over `inquiry.personFacts({text, viewer})` (the record's facts for the persons the note names, read as its author), the host's inquiry instance reached when first asked (`deps.inquiry` for a test); a read that throws warns nothing and refuses nothing. The test fixture gives a stand-in `personFacts` (its world builds none of the modules beneath inquiry; the real inquiry built there fails its promotions on missing tables), so the suite drives inquiry's real `personWarning` over facts shaped as `personFacts` answers them.

**Named red cleared**: `t41.test.mjs` "R19 with no test injected…" is replaced by "R19 with no stand-in test, noteShare asks inquiry R59's own personWarning…" (a person in no public role warns, one in a public role and none named do not; asked of the note's words as its author; recorded with the share), green.

**Ran.** `node --test bio-plane/test/m/hypotheses/`: tests 46, pass 46, fail 0. control-plane `r53-routes.test.mjs`:67 still red, accepted by name until T41-58 (B3). Checks: format 0; architecture 0 (12 files, 40 imports); coverage 21 of 21; ownership 0 (7 files).

Size (session_01SNmT525iDHSzNtvbkS4m7u): test runs 18, module lines 1,104

## J4 · COMPLETE

B5 applied: merged tranche/T41 @ dc41a13858; R19 asks inquiry's real personWarning over inquiry.personFacts (as the note's author). Named red cleared; hypotheses 46/46. control-plane r53-routes:67 still the accepted red (B3). Checks 0, coverage 21/21. Record: 'Completion again'.

## Completion again (B6 CHANGE; HYPOTHESES #5)

Merged `tranche/T41` @ 63b416fef6 (K2508). R7 gains `op=hypothesissetaside` → `hypothesisSetAside(body)` (`proposal`, `reason` and the `by` stamp from the body, never a body `viewer`). New test in `t41.test.mjs` "R7 R18 op=hypothesissetaside…": an empty body, a machine stamp, an absent proposal, a missing reason, a hidden proposal under an outsider's stamp (a body `viewer` ignored) and a second setting aside each refused, writing nothing; the member's act lands (negative control). R7's ops-keys test re-stated.

**Ran.** `node --test bio-plane/test/m/hypotheses/`: tests 47, pass 47, fail 0. control-plane `r53-routes.test.mjs`:67, the accepted red (B3), now lists `hypothesissetaside` too, until op-declarations R43 and control-plane R71 declare and route it (B6). Checks: format 0; architecture 0; coverage 21 of 21; ownership 0.

Size (session_01SNmT525iDHSzNtvbkS4m7u): test runs 20, module lines 1,106

## J5 · COMPLETE

B6 applied: merged tranche/T41 @ 63b416fef6; R7's op=hypothesissetaside arm over hypothesisSetAside, tested with refusals and a negative control. hypotheses 47/47; checks 0, coverage 21/21. control-plane r53-routes:67 (accepted, B3) now also lists hypothesissetaside until L11 declares it. Record: 'Completion again (B6)'.

# hypotheses (T41)

**Status** · session_01SNmT525iDHSzNtvbkS4m7u · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two points; I carry on with R16–R18, R20, R21 and R19's share on my best reading, and leave R19's warning as the one open item.

(1) R19's warning ("carries `inquiry` R59's warning at the act"). The person test (an entity of kind person holding no public role, `entities`) is named nowhere as a service: `entities` holds no public-role notion in its code or requirements, and inquiry R59 (T41-15, running beside me) has no exported test yet. Your START says none of L6's changes is used by mine, but this one is. My best reading: hypotheses gains the edge `inquiry` (earlier in L6, merges first) and calls one pure function inquiry R59 exports, say `personWarning({text, viewer})` → `null` or `{code, translation, persons}`, answering it in `noteShare`'s answer as `warning` and recording it with the share; never a refusal. Until it exists I reach it optionally (absent → no warning) and the test of that clause stays red, named. Please name the function, its signature and its owner (inquiry or entities), or rule otherwise.

(2) Details I am taking as BOB's unless you say otherwise (recorded in my record): a proposal gets a `HYP-` id from `allocId` (so every leg check already refuses it, R5) in its own table `hypothesis_proposals` (sight the inquiry's, export yes, purged with it); R18's act is `hypothesisSetAside({proposal, reason, by})`; reads `proposalsOf({inquiry, viewer})` under the heading "the system's"; a proposal is open until one member takes it up or sets it aside (then `PROPOSAL_NOT_OPEN`); a share has an opaque random id, holds no note number (so R14's no-trace rule survives the note's deletion), table `note_shares` keyed by `project_id`, sight bundle, export never; `sharesOf` to a non-participant answers exactly as a project with no shares, and also lists the withdrawn markers (no words) so R20's record is readable; R19 asks `membership.projectAuthority(project, by, "joined", "noteshare")` and relays its refusal. New ops in R7's map: `hypothesispropose`, `hypothesistakeup`, `hypothesissetaside`, `hypothesisproposals`, `noteshare`, `noteunshare`, `noteshares` (op-declarations declares them later). New catalogue rows C-134.20 on, awaiting stamp (rule 4 (2)).

## Work so far (HYPOTHESES #5)

**Reading set** (mechanics §17): measured as §3 asks, about 175 KB: requirements (17 KB), this module's code (52 KB) and tests (92 KB), layer 6's row of `build/layers.md`, plan entry T41-16 and rule 4, K2448, `draft-T41-investigation.md` §3.6's lines for hypotheses and inquiry R59, and the used services named: record-grammar R52 (`acceptance.mjs`), membership R54, R55, R76, R127 (`isJoinedParticipant`, `projectAuthority`, `joinedParticipants`, `positionalMember`), record-core `declareTable`'s classes. Under 300 KB: read whole myself, no workers.

**Applied (T41-16), committed on `job/T41/hypotheses`.**
- **R16** `hypothesisPropose({inquiry, kind, statement, about, how, false_alarm_rate, run})`: a `HYP-` id from `allocId` in its own table `hypothesis_proposals` (keys `bundle_id`, sight bundle, export yes, purge clear), so R5 already refuses it as a leg; labelled "the system's" with `how`, `false_alarm_rate` (0…1) and `run`. Answered under `hypothesesOf`'s `system_proposals` (heading "The system's proposals"), never among `hypotheses`, and by `proposalsOf({inquiry, viewer, run?})`. Refusals in order: `NO_SUCH_BUNDLE`, `NOT_AN_INQUIRY`, `UNKNOWN_HYPOTHESIS_KIND`, `HYPOTHESIS_NO_STATEMENT`, `BAD_ABOUT`, `PROPOSAL_NO_HOW`, `PROPOSAL_NO_RATE`, `PROPOSAL_NO_RUN`.
- **R17** `hypothesisTakeUp({proposal, form, statement?, by})`: holds by R1 as hers (`as_proposed` in its words; `edited`, `own_instead` in hers), records `acceptanceRecord` (kind `hypothesis`); the hypothesis's reads carry `came_from` (the system, the proposal, the form, how, rate). Refusals: `NO_SUCH_PROPOSAL`, `MACHINE_CANNOT_HYPOTHESISE`, `PROPOSAL_FORM_UNKNOWN`, `PROPOSAL_NOT_OPEN`, `HYPOTHESIS_NO_STATEMENT`, then R1's unchanged. `as_proposed` is allowed (a hunch is not a legal or authored statement, so no `ACCEPT_MUST_REAUTHOR`).
- **R18** `hypothesisSetAside({proposal, reason, by})`: stays readable with who, when and her reason. Refusals: `NO_SUCH_PROPOSAL`, `MACHINE_CANNOT_HYPOTHESISE`, `PROPOSAL_NO_REASON`, `PROPOSAL_NOT_OPEN`. `hold`'s machine refusal unchanged.
- **R19** `noteShare({note, project, by})`: `MACHINE_CANNOT_NOTE`, `NO_SUCH_NOTE`, then membership's `PROJECT_ACT_NOT_A_PARTICIPANT` relayed from `projectAuthority(project, by, "joined", "noteshare")`. Copies the current words into `narrative_shares` (keys `project_id`, sight bundle, export never, purge clear), an opaque id `share:<uuid>` (no record id), no note number held. Never a leg: the leg check refuses a `share:` target `NARRATIVE_NOT_A_LEG` (C-134.28). The warning is asked of an injected `personWarning({text, viewer})` and recorded with the share; **its production wiring waits on J1**.
- **R20** `noteUnshare({share, by})`: words and warning emptied, `withdrawn_at` set; `MACHINE_CANNOT_NOTE`, `NO_SUCH_SHARE` (absent, withdrawn, another's: one answer).
- **R21** `sharesOf({project, viewer})`: joined participants only, newest first, at most 200 with `truncated`; also `withdrawn` markers (who, shared, withdrawn; no words). Anyone else reads exactly as a project with no shares.
- **R14** amended: a share is a copy holding no note number; revising or deleting the note leaves no trace of the note; the withdrawal marker is the share's.
- **R7** ops added as op-declarations R43 names them: `hypothesistakeup`, `noteshare`, `noteunshare`, `shares` (this replaces J1 (2)'s op names). No op for `hypothesisPropose` (an in-process door), set-aside or the proposals read (the `hypotheses` op answers them under their heading).
- Catalogue rows C-134.20–C-134.28 new, awaiting the stamp (rule 4 (2)). Size: 810 → 1,089 lines.

**Tests.** New `t41.test.mjs` names R14, R16–R21, each with a negative control; R7's ops test re-stated for the four arms; the fixture's `others()` leaves out the two new tables. `node --test bio-plane/test/m/hypotheses/`: tests 45, pass 45, fail 0.

**Other modules.** control-plane `r53-routes.test.mjs`:67 (R53) is red from this change: the four new arms have no spec or `OP_STAMPS` entry until op-declarations' T41-58 (its R43). affordances, op-declarations, plane: the same failing tests with and without this change (33, 8, 8, all pre-existing).

**Checks.** format 0; architecture 0; coverage 21 of 21; ownership 0 (7 files).

## J2 · REPORT

Built and pushed everything but R19's production warning wiring (J1 (1), still open); details in my record's "Work so far". 45/45; format, architecture, coverage (21/21), ownership 0.
(a) J1 (2)'s op names are replaced by op-declarations R43's: `hypothesistakeup`, `noteshare`, `noteunshare`, `shares`; no op for propose (in-process), set-aside or the proposals read (they ride the `hypotheses` read under their own heading). R43 declares no set-aside op: R18's act has no route until one is named (op-declarations' or the plane's).
(b) New red in another module from my four arms: control-plane `r53-routes.test.mjs`:67 (R53: every served op has a spec and `OP_STAMPS` entry) until T41-58 declares them. Please name it an accepted red or tell me to hold the arms back.
(c) The share table is `narrative_shares`, not J1's `note_shares` (R14's test reads no table named for notes in record-core's counts).

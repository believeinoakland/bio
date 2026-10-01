# affordances (T18)

**Status** · session_01FgotLQ7FibdK7RNpDfo4m4 · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two questions; I carry on with the rest of the job on my best readings.

(1) N13's share: removing the `affordancefacts` arm from `store.mjs` now opens a red window. Until control-plane spreads `affordancesOps`, the durable object has no `affordancefacts` route, so `op=affordances` with a target fails at `index.mjs`:281. That turns red most of my `plane.test.mjs` (R13–R18, R20, R22, R24) and other modules' tests that read `op=affordances` with a target: `basis-versions` (conclude-project-arm, sufficiency-state, versionstate) and possibly `skills` (pack, planning, fixture).
   Best reading (A): I build and export `affordancesOps(a, url, body)` holding `affordancefacts`, tested in-process at my interface. I leave the store arm in place. Control-plane removes it in the same edit that spreads the map: its `from` includes `legacy-store`, so that is its §12.2 removal, with no red window.
   Alternative (B), the plan as written: I also remove the arm and its import now, and every arm above is accepted red by name until control-plane's job (K705's pattern).
   I recommend A. If you rule B, I make the removal in one commit and list the red arms.

(2) K705/K709 grading. I graded the four new writes on R27's rule, all `undetermined`: `communicationprepare` (on `filingprepare`'s ground), `templatesave`, `actioncreate` (`entitycreate`'s ground: a member's chosen act, not `promote`'s substrate) and `actionpressure` (its required note describes what was received; `PRESSURE_REFUSED` is a malformed mark and is not added to `JUSTIFICATION_REFUSALS`). Each also has a `NON_ACTS` reason. `templates`, `action` and `actions` join `LAYER9_READS`. That makes 65 undetermined ops, so R27's sentence "The 61 ops graded `undetermined` today …" and R3's named list are now stale wording. Please confirm the grades and amend R27's count (and name the four in R3 if you want them named). `catalogue.test.mjs` asserts 65 with the four listed, and it is green.

## J2 · QUESTION

Replaces J1. One correction: basis-versions' and skills' tests only mention `op=affordances` in comments, and none of them calls the route. The rest of J1 stands.

(1) N13's share. `affordancesOps(a, url)` is built, exported and tested in-process (`test/m/affordances/ops.test.mjs`, 3 pass). Removing the store's `affordancefacts` arm now leaves `op=affordances` with a target unanswered (`index.mjs`:281 asks the durable object) until control-plane spreads the map. The red would be in my own suite only: `plane.test.mjs`, which reaches the facts through the durable object and `op=affordances` through the Worker (R13–R18, R20, R22, R24; about 20 tests).
   Best reading (A), which I recommend: I leave the arm in place, and control-plane removes it in the edit that spreads `affordancesOps`. Its `from` includes `legacy-store`, so that is its §12.2 removal, and there is no red window.
   (B), the plan as written: I remove the arm and its import now, and those `plane.test.mjs` arms are accepted red by name until control-plane's job (K705's pattern).
   I am carrying on with the converts. The removal is one small commit whichever way you rule.

(2) Unchanged from J1: the four K705/K709 writes are graded `undetermined` on R27's rule, each with a `NON_ACTS` reason, and `templates`, `action` and `actions` are in `LAYER9_READS`. That makes R27's "61" 65 (its wording is yours to amend). `catalogue.test.mjs` is green.

## J3 · COMPLETE

**Entries applied** (plan layer 11, affordances; START B1; answers B2/B3, K723):
- **N13's share** (store map §4.1), reading A as ruled: `affordancesOps(a, url)` holds `affordancefacts` and answers `affordanceFacts` for the query's `target`, `viewer`, `identity`, `author` and `by` (an absent one reads null). It lives in `affordances/facts.mjs` and is exported from `affordances.mjs`. New `test/m/affordances/ops.test.mjs` tests it in-process (R13–R15, R22). The `store.mjs` arm stays, as ruled; control-plane removes it in the edit that spreads the map.
- **K705, K709**: `communicationprepare`, `templatesave`, `actioncreate` and `actionpressure` are in `RUNG_ABSENT` (ground `undetermined`, on R27's rule) and in `NON_ACTS` with their reasons. `templates`, `action` and `actions` are in `LAYER9_READS`. `catalogue.test.mjs`'s layer-9 arm now covers 26 writes and 18 reads (actions' four checked present in `actionsOps`), and R27's count is 65. K705's accepted red arm is green.
- **N70's N45**, by the `d311-roster-affordances` convert: `projectleave` is offered to an owner only while another owner is committed, driven for every caller and project with the act (below).
- **Converts** (the T17 `legacy-tests.md` rows; no old suite deleted):
  - `conclude-project-arm` (R14, R15, R23, R8, R18), in new `converts.test.mjs` over basis-versions' fixture: on a question concluded with no project, `conclude` is offered to the owner and to the joined non-owner of a citing project. It is withheld from the invited member, the owner of a severed or non-citing project, an administrator who joined nothing, and a machine. The fact is asked of the identity over the viewer's sight. On an open question it is offered to every person. Each offer and each withholding agrees with basis-versions' `conclude`.
  - `caseproduction` §3a (R8, R10, R14, R15, R18; DEC-69 under R5, R21), over case-authoring's fixture: `publish` is offered exactly where `publishCase` does not refuse the caller NOT_THE_PROJECT_OWNER (owner, joined participant, administrator). A machine is withheld it by the machine rule (its position fact is null). A withheld caller's acts carry no narration, and the owner's entry carries only R28's prompt.
  - `publish` (R14, R8, R18), over case-authoring's fixture: after a real publication and its commit, `case_member` is true, `publish` is withheld and refused ALREADY_A_CASE_MEMBER, and `reopen` is offered and accepted.
  - `citeproject-inquiry` (R9, R17, R14, R18): `catalogue.test.mjs` checks the types of `cite`, `sever` and `reinstate` against R9's text (not circular). `plane.test.mjs` checks that on a question target `sever` and `reinstate` track `cited_by_case`: offered neither when only a question cites it, then through cite, sever, reinstate and sever, each agreeing with the act.
  - `d311-roster-affordances` (R18, R9, R10, R20): a `plane.test.mjs` test drives join and leave, offer against act, for 8 callers and 4 projects. It applies REC-186's no-op join rule, keeps the leave pass at the offer-time roster, and checks that machines are offered and accepted neither. R20's test now also checks that a machine is offered `cite` and performs it.
  - `skillpack` (R17): a `plane.test.mjs` test checks that every published catalogue act carries a mode and none is `machine`. The legacy row says no requirement states this. Proposed wording if you want one: "R17 … every act in `catalog` is a member's: its `mode` is `session` or `admin-session`, never `machine` (INVESTIGATIVE-SESSION §4)". The test is under R17 until then.

**Deferred:** none. **Rows moved or changed:** none (no catalogue row; the store and `src/index.mjs` are untouched, so nothing is `awaiting stamp`).

**Not-yet-met marks:** the Status line of `requirements/affordances.md` still says "R26 … not yet met" (met by AFFORDANCES #6, K441) and "N365 … not yet met" (met by AFFORDANCES #8, K560). Both are met, and their tests are green (`plane.test.mjs` R26; `derive.test.mjs` and `contradiction.test.mjs` for R8 and R14's `contradiction_sides_seen`). Please strike them.

**Other modules:**
- `unaccounted(table)` over control-plane's live `OPS` today reads `stale: [actioncreate, actionpressure, communicationprepare, templatesave]`, because those ops are not yet in the table as mutating and gated. op-declarations' N-A12 share and control-plane's three filings specs (K701) close it. No test runs it over the live table yet; control-plane's R12 test should once they land.
- control-plane: spread `affordancesOps(affordancesOf(ctx), url)` in `controlPlaneRoutes`, and remove the store's `affordancefacts` arm and its `affordancesOf` import (K723).

**Generated artifacts:** none made stale (my change to the catalogue adds table rows only; no bundle reads `affordances/facts.mjs`'s new export).

**Tests and checks:**
- `node --test bio-plane/test/m/affordances/`: 121 pass, 0 fail (106 at start, 105 pass and K705's 1 fail).
- Users of the catalogue: queue 68/0, tasks 71/0, skills 39/0; control-plane 79 pass, 1 fail (R36, K658's accepted red, untouched).
- Mutation checks, each restored and verified with `cmp`: dropping `publish`'s position clause failed 2 tests; dropping `conclude`'s project arm 2; join narrowed to `invited` 1 (the join/leave test); `sever` keyed on `cites_in` 1 (the cite-inquiry test).
- format: 0 failures. architecture affordances: 0 failures. coverage affordances: 29 of 29 live ids named, 0 failures. ownership affordances tranche/T18: 7 files, legacy-store 0 added / 0 removed, legacy-index 0 / 0, 0 failures.

Size (session_01FgotLQ7FibdK7RNpDfo4m4): test runs 16, module lines 2944

## J4 · COMPLETE

B4 applied, after merging tranche/T18. Each op is graded on R27's rule, the way the four were:

- **`reasoned`** (each refuses `PLAN_NO_REASON`, action-plans R4): plansubjectadd, plansubjectremove, optionrevise (R9), optiondispose (R13: declined and blocked need a reason; choosing asks none, `triage`'s shape, K212) and planclose (R20). `PLAN_NO_REASON` joins `JUSTIFICATION_REFUSALS`.
- **`reversible`**: scenarioset. A further scenarioset replaces it whole and keeps the earlier version in history, and it asks no reason (R14; `actionlaws`' precedent).
- **`undetermined`**: planopen, optionadd, optionpropose, optionadopt, checkpointrecord (its note is optional, and a checkpoint is judged once), optionstart (`actioncreate`'s ground).
- **`caller-owned`**: reminderset and reminderanswer, `queuesnooze`'s ground (action-clocks R4, R6: a member's own request, kept in that module's table).

**New count: 71 ops graded `undetermined`** (65 + the six). For R3: the six are `undetermined` and the two reminders are `caller-owned`. R2 gains five `reasoned` and one `reversible`.

**One correction to B4.** In op-declarations' `NEEDS`, `reminderset` and `reminderanswer` are present as keys with value `null`, the same form `queuesnooze` and `select` take. So they are gated rows, and each needs a `NON_ACTS` reason (given: "personal state …"). The twelve plan ops have `NON_ACTS` reasons too. `plan`, `plans` and `planproposals` are in `LAYER9_READS`, with `action`, `actions` and `templates`.

**Totality, measured:** `unaccounted` over op-declarations' live `OPS` and `NEEDS` (gated means the key is in `NEEDS`) is `{unpublished: [], unranked: [], stale: []}`.

**Tests:**
- affordances: 123 pass, 0 fail. `catalogue.test.mjs`'s layer-9 census now holds 40 writes and 21 reads and includes action-plans' and action-clocks' op maps; R27 asserts 71.
- New R19/R2 backing in `backing.test.mjs`: each of the five `reasoned` ops is refused without a reason by a code in the family and accepted with one; scenarioset is replaced by a further one.
- Other modules: queue 68/0, tasks 71/0, skills 39/0, op-declarations 16/0, action-plans 38/0; control-plane 79/1 (R36, K658's accepted red).

**Checks:** format 0, coverage 29/29 and 0 failures, ownership 0 (legacy-store and legacy-index 0/0). **Architecture: 3 failures, needing one edit by you:** add `action-plans` and `action-clocks` (both layer 9, earlier than mine) to affordances' `uses` in `build/modules.json`, for the same reason `standards`, `conformance`, `consequences`, `filings` and `escalation` are there: their op maps and the backing of each rung. The failures are `catalogue.test.mjs` importing `actionPlansOps` and `actionClocksOps`, and `backing.test.mjs` importing action-plans' fixture. With that edit, architecture reads 0 (nothing else failed).

Everything else in J3 stands.

Size (session_01FgotLQ7FibdK7RNpDfo4m4): test runs 25, module lines 2981

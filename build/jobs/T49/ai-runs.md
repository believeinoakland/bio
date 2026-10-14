# ai-runs (T49)

**Status** · session_01BWtpcB4nYGzr7xN3cV6hsz · depth 2 · WORKING · handled B1

## Record

**Model** · claude-sonnet-5-5. **Reading set (mechanics §17, K3271)** · read whole: `build/requirements/ai-runs.md`; the T49 plan's entry T49-8, rule 6, the L6 row and the D4/D5 rows; layer 6's row in `layers.md`; `ai-runs/index.mjs` (3,516 lines) and `schema.mjs` whole. Of the used modules I read only the services my entry touches, directly and whole at those places: `membership.participation` (R74) and `joinedParticipants`, `run-rules` `projectGate` (R6), `action-plans` `planAsk` (R51) and `planRunCheck` (R30), `control-plane`'s run-verb actor stamp. No helper session was needed. Tests read whole: `rows.test.mjs` (N1073) and, for R9/R11/R13 gate context, the gate arms of `open.test.mjs`, `state.test.mjs` and `tick-close.test.mjs`; the other ai-runs tests were run, not read.

**M-T49-8 (measured first)** · `#aiRunProjectGate` receives from `planAsk` the actor `member:<id>` (`planAsk` passes its stamped author as `principalPlane`, `principalClaude`, `actor` and `viewer`). `project_participants.member_id` holds the bare id (`owner`, `joiner`), state `joined`, owner flag 1 for the owner. The gate passed that actor to `membership.participation(project, who)` unchanged, so `member:owner` and `member:joiner/tok1` found no row and were refused `AI_RUN_NOT_PROJECT_MEMBER`, while the bare `owner` and `joiner` opened. The cause is as the entry says; no other cause was found.

**Entries applied**
- **R81** (amends R9, R11, R13's relay of run-rules R6): `#aiRunProjectGate` asks `membership.participation` with `memberIdOf(actor)` (the module's own parser: `member:<id>`, `member:<id>/<tokenId>`, `<id>` alike), and with the actor as given when it names no member (a `class:`/`token:` stamp, a machine identity, `member:` with no id), so those are judged exactly as before and never read as absent. An empty actor still passes unapplied. `index.mjs`, `#aiRunProjectGate`.
- **R80:** withdrawn (K3347): nothing built; R18 and its details left as they stand.
- **N1073** `rows.test.mjs`:12: the 26-entry hand-list `MINTED` is now read from `run-rules`' table (`AI_RUNS_CHECKS`), the rows whose site is a function of this module's file. The read found a code the hand-list had missed (`MEMBER_RUN_MODE_NOT_ADMITTED`, C-22.30), now held by R35's and R39's tests like the rest; control: a code this module only relays (`AI_RUN_NOT_PROJECT_MEMBER`) is not listed.
- **Rule 6:** N1075: every string literal of 30+ characters in the module compared with all 2,473 rows of `words.json`: no match, so nothing to read by key (the member-facing refusal sentences are `run-rules` rows, not this module's). N1068: "labelled" appears once, in a code comment (`index.mjs`, the dispatch's account comment), not member-facing; re-spelled "labeled". N1072 `admin` grep: the module reaches no reader with the founder's id (hits are a record-core class name, a comment about the internal machine viewer, and "administrator" in comments); no finding. D29: this module draws no screen.

**Tests** · new `project-gate.test.mjs` (R81, four tests): owner and joined member each open a `plan` run with `planAsk`'s call shape in all three actor forms (answer states `PARTICIPANT`); tick in all three forms passes the gate; close and tick refused once she has left; controls: invited-only and never-invited refused `AI_RUN_NOT_PROJECT_MEMBER` in every form with nothing written; `class:ai/…`, `class:ai`, `token:…`, `member:` and `member:/tok` actors over a project refused as before, never `NO_MEMBER_BEHIND_CALLER`; an empty actor still passes unapplied. Checked red without the fix (the two positive tests fail, the controls hold), green with it. A never-invited member's own sight cannot reach a hidden project at all (R9 answers it as absent), so that arm is driven through an organisation credential's machine sight.

**Run and checks**
- `node --test bio-plane/test/m/ai-runs/`: 109 pass, 0 fail.
- Users of ai-runs, run for the changed gate: action-plans 88/0, plan-work 50/0, run-productions 59/0, skills 125/0, question-explorer 34/0, intent 82/0, case-account 41/0; capture-requests 117 pass, **6 fail**, the same 6 with my change removed (all "in the plane" tests: R14, R16/R31, R19/R42/R38, R30, R48, R56): inherited, not mine and not caused by this job (the plane bundle red, plan rule 5 (5)).
- `checks/format.mjs`: 170 modules, 0 failures. `checks/architecture.mjs ai-runs`: 21 files, 0 failures. `checks/ownership.mjs ai-runs tranche/T49`: 4 files changed, 0 failures.
- `checks/coverage.mjs ai-runs`: 50 of 51 live ids named; **1 failure: R80.** Cause: the requirements line reads `- **R80** retired (T49; …)`, without the `*(retired` marker `checks/lib.mjs` reads, so the checker counts R80 as live. It is BOB's text (a one-word edit, `- **R80** *(retired: …)*`, as R1–R8 are written); I did not write a test naming R80, which would test nothing. R81 is named and covered.

**Deferred** · none.

**Found in another module / generated artifacts**
- `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) now carries the old `ai-runs` gate: stale until BOB regenerates it at the layer close (manifest §Generated artifacts; plan rule 5 (5)). Not written by me.
- `run-rules` R6's `projectGate` and `membership.participation` need no change; the fix is the caller's. `action-plans`' `planAsk` passes the stamped author unchanged, as the plan says (T49-28 is screens-action, not it).
- `control-plane` stamps the bare id for these three verbs for a session (`control-plane/index.mjs`:2450), so the `planask` path through the door depends on `planAsk`'s `member:<id>` only for the open; no change owed there.

Size (session_01BWtpcB4nYGzr7xN3cV6hsz): test runs 9, module lines 3677

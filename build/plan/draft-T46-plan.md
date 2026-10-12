# Plan T46

**Status** · DRAFT, reviewed by BOB #159 (K2872); finalised as `next.md` at T45's close (§5.2) · written 2026-10-11 on `tranche/T45` while T45's L11 has not run (P18). It rules nothing; every packaging point below is BOB's to confirm (P17). Ids marked new are the drafts' provisional ids, renumbered at each layer's fold.

**Sources** · `next.md` N751…N918 (each re-tested); `current.md` (T45's plan: its "Left out" table re-tested row by row, its accepted reds); `draft-T46-interface.md` (I1–I15), `draft-T46-trial.md` (§5's twelve entries and BOB's acts), `draft-T46-usable.md` (context); `modules.json` (order and layers), `layers.md`; `rulings-active.md` (K2803, K2816 Bob's priority and trial shape; K2799 the stewards' address). Bob's two open questions: **[Q1]** where a member lands after sign-in (recommended: the new Home, interface §7 Q1 A); **[Q2]** how 0.82.0 is signed (recommended: the development key moved into the GitHub `release` environment as an interim; trial §6 Bob-1 letters it B, the questions page put to Bob letters it A: cite it by substance). Entries are written to hold under the recommended answers; each that depends on one is marked. **[L11?]** marks work owed by a T45 L11 job (T45-37…T45-49): it joins T46 only if not applied in T45 L11.

## Legacy census (§5.2 (2))

| legacy module | in T46 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849, N897 (1) "legacy-ui stays as it is": it stays until the new interface replaces it; a dependency not yet built: T46 builds the new interface's first part (T46-41…T46-46), the rest is T47's. N794, N865 (its reds) left out for the same reason. The 0.82.0 deploy moves its `civicos` worker unchanged (trial §4 step 12). |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; promotion's stamp merges last in L2; plane merges last in L11 (K425, K1680). Each layer's text is folded into its modules' files before that layer's START, from the draft section each entry names (BOB's wording, P5); every new or amended line ends *(not yet met: T46)*. Colliding provisional ids are renumbered at the fold (doubt 1).
2. **Every job reads its own code and tests whole** (P20; mechanics §6 step 2). Each START says so.
3. A job that adds a file outside its listed `paths` names it in its COMPLETE; BOB adds it before the ownership check (K1043). The six new modules enter `modules.json` and `layers.md` (layer 11, after `store-door`, before `control-plane`) with empty `paths` and `tests` at the opening, with membership's `MODULE_ORDER` entry in the same act (K657; T46-4).
4. **Accepted reds at the opening** (carried from T45; **each re-confirmed against `node checks/run.mjs` and `module-tests.mjs` at T45's close**, K2704):
   1. coverage: every id marked `*(not yet met: T46)*` until its module's merge;
   2. row census: rows T45's L3+ jobs added or changed, until T46-5's stamp; rows T46's L3+ jobs add or change, until T47's;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865) (K633);
   5. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   6. bundler `fleetbundles.test.mjs` "agent-worker's 26 inputs" (T45 rule 4 (13), K2828), until T46-2; and its real-fleet test pinning `docker.io/civicos/agent-runner` (K2266), if the 0.82.0 cut's GHCR descriptors reach the tranche red, until T46-2;
   7. any T45 L11 red whose clearing job (T45-38, -39, -41, -45, -47, -49; T45 rule 4 (6), (9), (11), (12), (14), (15)) did not merge in T45, until the T46 entry marked [L11?] for that module.

## Entries

### L1
- **T46-1 · record-grammar** · (N910, N911, N912, N914) R35: `escalation` gains `stopped_pursuing` (edges as N910), `action_plan` gains `paused` (open↔paused, paused→closed); `success_record` registered (`SUC-` prefix, `OBJECT_TYPES`, `STATES` `recorded`); `PROPOSAL_STATES` gains the bearing subject · text BOB's · first in L1.
- **T46-2 · bundler** · (N900; K2266) test only: re-pin `fleetbundles.test.mjs`' agent-worker inputs (27, K2828), and its real-fleet image pin to the 0.82.0 cut's descriptors if carried red (rule 4 (6)) · text none.

**L1 merge order:** record-grammar, bundler.

### L2
- **T46-3 · record-core** · (N904) R25: `getSetting` tells a stored value that is not valid JSON (unreadable) from unset.
- **T46-4 · membership** · (I1; K657) R83 `MODULE_ORDER` gains `interface-assets`, `interface-shell`, `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry` after `store-door`, in the opening's act · interface §5 I1.
- **T46-5 · promotion** · (N902; rule 4 (2)) **the stamp**: rows T45's L3+ jobs added or changed and T46's L1–L2 rows; `src/gate.mjs`' aggregate lists `CASE_CHECK_CHECKS` C-148, `CASE_ACCOUNT_CHECKS` C-153 and C-149–C-152 · last in L2.

**L2 merge order:** record-core, membership, promotion.

### L3
- **T46-6 · file-safety** · (N897 (4); DEC-149) R42 new: `SCANNER_ABSENT`, `RENDERER_ABSENT` rows in member words; their details drop "copy" · trial §3.2.

### L4
- **T46-7 · extraction** · (N897 (2); N886) R71 amended: a transcription on the test-instance exception records the label the plane hands in (no new edge, doubt 2); R71 reads agent-worker R72's refusals as `transcribe.refused` (DEC-193's words, once PR #28 is on `main`) · trial §1.2; N886 text BOB's.

### L6
- **T46-8 · steps** · (N899) R12: the 1,000-step and 1,000-reminder bounds stated with a `truncated` mark; Private Uses names `jurisdictions`, `calc-grammar`, `connection-grammar`, not `inquiry` · text BOB's.
- **T46-9 · run-rules** · (N897 (2); K2816; trial finding 1; N881) R29 `partAdmittedOn`/`untestedLabel`, R30 `AI_PART_NOT_DEPLOYED` (C-22) new; R16, R21 amended (`ask`, `draft` flags `true`, gated by R29); plus N881's `statusreportdraft` draft kind, its read reach and flag (`false`) · trial §1.2; N881 text BOB's (T45 Left out) · first in L6's AI jobs.
- **T46-10 · ai-runs** · (N897 (2)) R78 new: `testInstance()` from `CIVICSMITH_TEST_INSTANCE` = `INSTANCE_NAME`, `partAdmitted` the one gate; R40, R23's input, R10, R19, R28 answer `untested` · trial §1.2 · after T46-9.
- **T46-11 · skills** · (N915) the planning layer names `closingNotesOf`'s notes as planning input · text BOB's.
- **T46-12 · question-explorer** · (N897 (2)) R16 new: the gate open on the exception, finds labelled · trial §1.2 · after T46-10.
- **T46-13 · agent-runner** · (N852; K2816 (3), (4)) a sign-in transcribes: the runner passes page images as `agent-worker` R72 does for API keys (its dependency met for `biosmoke7` by K2816 (4)'s copy) · text BOB's (trial §6 B4 A) · before T46-14.
- **T46-14 · agent-worker** · (N897 (2)–(4); N852; N886; N915; N881) R79 new (`untested` on `/ask`'s last answer and `/draft`'s); R6 amended (a sign-in's `suggestions` boolean); R34 amended (`/version` `runner`); `TRANSCRIBE_NEEDS_API_KEY` lifted for a sign-in (N852); R72's six refusal codes with check rows and DEC-193's words (N886); R51 names `closingNotesOf` (N915); R76's fourth task `statusreportdraft` (N881) · trial §1.2, §3.2; rest text BOB's · after T46-9, -11, -13.

**L6 merge order:** steps, run-rules, ai-runs, skills, question-explorer, agent-runner, agent-worker.

### L8
- **T46-15 · case-carriage** · (N907) new reads `acceptedWorkLapsedSince`, `marksLapsedSince`, `sourcesLapsedSince(…, since)` over its append-only histories · text BOB's.
- **T46-16 · public-read** · (N906) R5 reworded to the lowercasing behaviour (or changed with its callers, BOB's at the fold); the sampling tests deepened (R13, R15, R19, R22, R27, R29, R30).
- **T46-17 · case-checker** · (N916) R24 states that a sentence with nothing checkable reads `supported` when it cites anything (or is judged `undetermined`, BOB's at the fold); `filings` and `case-account` told (P5).
- **T46-18 · case-import** · (N903) R4: the source group's `group_fields` (public-read R34's identity and declared stake, with the time read) recorded at import and answered from `importedCase`, for `conformance` R32.
- **T46-19 · case-disclosures** · (N901) R30: `accountJudged` translates case-account's `cited` holdings into `checkAccount`'s shape (one site) · after T46-17.
- **T46-20 · case-check** · (N907) R2 latches a void check for the lapse causes through T46-15's reads (its clause's T46 mark struck) · after T46-15.

**L8 merge order:** case-carriage, public-read, case-checker, case-import, case-disclosures, case-check.

### L9
- **T46-21 · consequences** · (N911) R17's "record object" clause: each success record promoted to the `success_record` object (T46-1).
- **T46-22 · action-clocks** · (N918) R1: `pendingClocks`' items carry `due_at` and `due_zone` (as R3's).
- **T46-23 · action-replies** · (N912) R1: bearing proposals labelled through `proposalLabel` (T46-1).
- **T46-24 · escalation** · (N910) R31 `escalationStopPursuing` writes `stopped_pursuing` as the document's state (T46-1).
- **T46-25 · action-plans** · (N914) R40: `paused` moves the document's `current_state` with its Plan Log (T46-1).
- **T46-26 · plan-work** · (N881) R8's assistant arm: the plan status report drafted through `statusreportdraft` where enabled, labelled; edge → `run-rules` (earlier) if its code needs it · text BOB's.
- **T46-27 · the Action-layer modules DEC-194 names** · (N913; UX-DESIGN U161) each reads its `words.json` keys and refusal texts; the `owed:<op>` acts (`itemtakeup`, `actionscope`, `escalationstoppursuing`, `filingsecondapprove`) re-pointed once served; joins that module's T46 job where it has one (one job per module) · folded once PR #28 is on `main` (doubt 4).

**L9 merge order:** `modules.json` order (consequences, action-clocks, action-replies, escalation, action-plans, plan-work, with any module T46-27 adds in its place).

### L10
- **T46-28 · monitoring** · (N918) R34, R50 read a timed entry's instant from `pendingClocks` (T46-22), not the action's document.

### L11
- **T46-29 · wizard-scripts** · (I3; N913) R13: `SCREEN_REGISTRY` re-taken from `registry.json` at PR #28's merge (and §3's corrections if merged first); R22's second clause (the five library scripts) and `@communication`'s step as DEC-194 gives them; [L11?] T45-37 · interface §5 I3.
- **T46-30 · op-grades** · R32's pattern: T46's new ops graded (`infolevelset`, `infolevel`, N881's status-report op); [L11?] T45-38 (N891) · first of L11's op jobs.
- **T46-31 · affordances** · [L11?] T45-39 (N891 drops its copies; R51; edges as T45-39), and its op-map pins for T46's new ops if its tests pin them (verified at the opening) · after T46-30.
- **T46-32 · action-producers** · [L11?] T45-40 whole (copy of `queue-producers` R15–R21, R29; R40–R43) · before T46-33.
- **T46-33 · queue-producers** · [L11?] T45-41 whole (deletion; R8; edge → `action-producers`).
- **T46-34 · notice-producers** · [L11?] T45-42 whole.
- **T46-35 · queue** · [L11?] T45-43 whole.
- **T46-36 · setup-page** · (I4; N897 (2), (4)) R31 new: the session record `SESSION_STORE_KEY` stated; **R32 new [Q1]**: after sign-in a member lands on `/app`, the panel offers "Open your group's Civicsmith"; R33 new: the test-instance notice while `bootstrap` answers `test_instance: true`; R30 amended: scanner sentences only while `parts` says a scanner is present, parts on the healthy panel · interface §5 I4, trial §1.2, §3.2 · merges after T46-38 (its page test reads `bootstrap`'s new fields).
- **T46-37 · setup-words** · (I2; DEC-179) R1, R2: `WORD_ROWS` re-taken from `words.json` at PR #28's merge, `WORDS_COMMIT` that commit · interface §5 I2 · before T46-38.
- **T46-38 · instance-setup** · (I5; N897 (2)–(4)) R79 new `infoLevelSet`/`infoLevel` (`op=infolevelset`, `op=infolevel`); R80 new `bootstrap` `test_instance` (edge → `ai-runs`, earlier); R81 new `bootstrap` `parts`; R17 amended (agent-runner through agent-worker's `runner`); R54 amended (the disclosure at a sign-in's connect); [L11?] T45-44 · interface §5 I5, trial §1.2, §2.2, §3.2.
- **T46-39 · op-declarations** · (I6; N881) R50 new: `infolevelset`, `infolevel` specified (and N881's op); R34 holds; [L11?] T45-45 (R49, R47's wording) · interface §5 I6.
- **T46-40 · answer-envelope** · `CHECK_FAMILY_FILES` lists any family T46 adds (agent-worker's R72 rows if a family of their own, N886); [L11?] T45-49 · before plane.
- **T46-41 · interface-assets** (new) · (N897 (1); DEC-138; N559) R1–R4 · interface §2.1, §5 I7 · first of the six.
- **T46-42 · interface-shell** (new) · (N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -159–-163, -175–-177, -179, -181; N672) R1–R24; Settings › "Group settings" opens the setup page's sections **[Q1]** · interface §2.2, §5 I8 · after T46-41, T46-36.
- **T46-43 · screens-settings** (new) · (N897 (1), (3); K2147) R1–R10: `members`, `account`, `connect`, `notes` · interface §2.3 · after T46-42.
- **T46-44 · screens-intake** (new) · (N897 (1); N821) R1–R9: `capture` (with `captureupload`), `held`, `open-file`, `inbox` · interface §2.4 · after T46-42.
- **T46-45 · screens-daily** (new) · (N897 (1)) R1–R7: `home`, `queue`, `finder`, `find-in`, `answers` · interface §2.5 · after T46-42.
- **T46-46 · screens-inquiry** (new) · (N897 (1), (2)) R1–R5: `project`, `question`, `document`, the assistant dock (the test-instance label drawn) · interface §2.6 · after T46-42.
- **T46-47 · control-plane** · (I13; N897 (3), (4); N905; N917) R75 new (`GET /app`, `/app/<path>`, `/app/assets/<name>`), R76 new (`infolevelset`, `infolevel` routed), the end-to-end suite; R65 amended (`DISCLOSURE_DUE` before `start`; `RUNNER_NOT_CONFIGURED` with `ai.refused.signinabsent`; the draft answer's `untested` passed); R20 (the review copy's `inbandQuartet` passes the group fields); R57 (a door route for `textcheck`); edges → the six new modules · interface §1.2, §5 I13; trial §2.2; rest text BOB's · after T46-41…46.
- **T46-48 · plane** · (N897 (2), (3); trial findings 1, 4; N886) R40 new (ask and draft doors gate on `partAdmitted`, label on outputs, transcriber through it); R33 amended (the serving account's suggestions switch); R36 relays agent-worker's HTTP status (N886); [L11?] T45-47 · trial §1.2 · last in L11.
- **T46-49 · installer** · (N897 (2), (4); N894) R49 new (never `CIVICSMITH_TEST_INSTANCE`); R38, R23 amended (an unpullable image named per part, in member words, before and after install); [L11?] T45-46 (N894): its README and the public documentation publish the stewards' contact, **the address Bob's to name (K2799)** · trial §1.2, §3.2.
- **T46-50 · stewards** · [L11?] T45-48 whole (N895, N892 (e)) · before plane.

**L11 merge order:** wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, setup-page (after instance-setup, rule 1's exception), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last. Entries marked [L11?] drop out where T45 applied them; a module whose only entry drops has no T46 job.

### New modules: places (K617, K657, K1043)

| new module | layer, place | built by | uses (all earlier) |
|---|---|---|---|
| `interface-assets` | L11, after `store-door` | fresh (frozen data at `ASSETS_COMMIT`) | none |
| `interface-shell` | after `interface-assets` | fresh | `interface-assets`, `setup-words`, `setup-page`, `op-declarations`, `op-grades` |
| `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry` | after `interface-shell`, in that order, before `control-plane` | fresh | `interface-shell`, `setup-words`; tests: `op-declarations` |

No ids move. **Edges added, each to an earlier module:** `instance-setup` → `ai-runs`; `control-plane` → the six; `plan-work` → `run-rules` (if needed). `extraction` (L4) takes the label as data, no edge to `run-rules` (L6). No edge points later.

## BOB's acts (no job)

- **Release 0.82.0** at the T45/T46 boundary, cut from `tranche/T45` after its last layer, before its PR to `main` (K2273, K1501): trial §4 steps 0–14, with N780's images (GHCR by the extended workflow, copied into the account's registry for `biosmoke7`, K2816 (4)) and file-scanner's first deploy; **signing [Q2]**: under B, the development key in the `release` environment and Bob's one approval of the `release-sign.yml` run; each deploy act and the seven verify controls Bob's in session; the installer's deploy deferred (OAuth scope, trial §6 B6). Surface failures found at the live checks join T46 at the opening (P18).
- **Release 0.83.0** at T46's close: the same steps plus trial §4 steps 15–17 (`CIVICSMITH_TEST_INSTANCE=biosmoke7`, verified; Bob's first sign-in on `connect`, M-Q2).
- **The channel** (I15, trial §5): one HANDOFF to UX-DESIGN: registry corrections 1–4, the screens' `SCREEN_WORDS` keys, `ai.label.untested`, `ai.refused.signinabsent`, `DISCLOSURE_DUE`, the test-instance notice, the parts' words, the library's stale `connect` step 4; not a precondition of any job (K1430).
- **N898** (`mail done` refusal): process repository, between tranches, certified on a dry run (P3).
- **N908, N909** at the opening: split plans for `case-authoring` and `publication` (P6, doubt 5).

## Left out of T46 (one hard reason each)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N794, N865 | Bob's: legacy-ui stays as it is (K633, K1849, N897 (1)) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C) |
| N842 (and `/draft`'s `account_check`) | a dependency not yet built: no `enquire` conversation or account draft task exists or is required; the exception lifts only the bar, on `biosmoke7` (doubt 6) |
| N847 | a dependency not yet built: the pointer's content is the design stream's (N821); no provider named |
| N853c | a measurement: OCR's accuracy on members' photos |
| N858's `@records-request` template content | a dependency not yet built: no named writer and no professional review (K2781 (6), v0.2 rule 11) |
| N880's minutes comparison (U4) | the design stream's: a screen comparison no module holds |
| N882's "proceeding followed with its own dates" | a dependency not yet built: COURTS L2 is not a requirement; no module assigned |
| `legal_facts` triggers detected at their moment | a dependency not yet built: their screens (attending, recording, receiving) are not in T46's set |
| N889 | the design stream's: those sentences have no keys yet (re-tested against `words.json` at PR #28's merge, doubt 7) |
| N886, N913, T46-29's R22 clause, T46-37 (if PR #28 is not on `main` at T45's close) | a dependency not yet built: the design stream's words and registry not on `main` (K1430: the screens carry their own words meanwhile) |
| the other 31 registry screens, `startfrom` and the dock's wizard guide, People, `projectai`, the settings still on the setup page, the v0.2 constructs' screens | Bob's: N897 (1) "the rest in T47"; and a dependency not yet built: N821's runner (screen side), and the constructs the design stream has not drawn |
| `investigate`, `extract`, `plan`, `enquire`, `action_drafts` on the test instance | Bob's (K2816 (2)): the exception lifts only the test bar; their flags and the verification chain stand (trial finding 2; doubt 9) |
| the installer's deploy | a deployment: its OAuth client lacks `connectivity-directory.bind`, Bob's dashboard act (K2164) |
| T41's carried rows (N821's runner and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747) | unchanged from `archive/T41.md` "Left out", to be re-tested at the opening (doubt 8); N821's screens partly applied by T46-41…46 |

**Applied in T45 (no T46 entry; move to `archive/next-applied.md` at the last owning merge):** N828, N855, N858 (but the template content), N861, N879, N880 (but U4), N881 (but the assistant's report: T46-9, -14, -26), N882 (but the proceeding), N883, N884, N885, N887, N888, N890, N892 (a)–(d), N893 (L1–L10). [L11?]: N891 (T46-30, -31), N892 (e) (T46-50), N893's L11 parts (T46-29…40, -48), N894 (T46-49). N896, N897: this plan. N780: BOB's at the 0.82.0 cut.

## Measure first

- **M-T46-1** (K617, at each START): `control-plane` (gains R20, R57, R65, R75, R76 and the suite), `agent-worker` (~3,300 after T45 plus five changes), `interface-shell` (est. 3,200–3,800), each screen module (est. 2,000–3,000), `instance-setup`, `setup-page`, `plane`.
- **M-T46-2** (K2147): M-Q2, container reliability, at Bob's first sign-in (0.83.0 step 17).
- **M-T46-3**: at T46-10's START, whether `CIVICSMITH_TEST_INSTANCE` survives `deploy.mjs`' `keep_bindings` as the trial assumes.

## Doubts for BOB

1. **Id collisions between the drafts.** Both claim `instance-setup` R79 (interface: info level; trial: `test_instance`, R80 `parts`) and `setup-page` R31 (interface: session record, R32 landing; trial: test-instance notice). Drafted as instance-setup R79 info level, R80 `test_instance`, R81 `parts`; setup-page R31 session, R32 landing, R33 notice. Both drafts also touch `control-plane`, `plane`, `instance-setup`, `setup-page`, `agent-worker`, `run-rules`/`ai-runs` (interface I14 = trial's entries): merged into one entry per module (P8).
2. **Edge pointing later in the trial draft:** "extraction (L4) · after run-rules (L6)" cannot hold (layer order). Drafted as no edge: the plane hands extraction the label as data.
3. **Size used as a reason:** trial §6 B4 puts N852 in T46 "if T46's L6 has room"; P19 forbids that reason, so N852 is in (T46-13, -14). `agent-worker` then carries five changes; if M-T46-1 puts it past ~4,000, its split is the hard reason, not the room.
4. **N886 and N913 depend on PR #28 (DEC-193, DEC-194) reaching `main` at T45's close** (§5.7 (1)); N913's list of Action-layer modules (T46-27) is read from DEC-194 then, and each joins that module's single T46 job. No owning module can be named until then.
5. **N908, N909** (case-authoring 4,072, publication 4,465 lines): no T46 entry adds capability to either, so neither is held; whether their splits run in T46 depends on extraction maps BOB writes at the opening (a split without a map: a dependency not yet built).
6. **N842:** the exception lifts its bar half on `biosmoke7`; its other half (no `enquire` path or account draft task) stays. Whether to draft their requirements for T47 is BOB's.
7. **N889:** if `words.json` at PR #28's merge keys notice-producers' R5, R6, R13–R15 sentences, it joins L11 as a `notice-producers` entry.
8. **T41's carried rows** were not re-tested by this worker (`archive/T41.md` is outside the reading set); BOB re-tests them at the opening.
9. **"As complete functionality as reasonable" (K2803) vs the flags:** `plan`, `enquire`, `action_drafts` stay `false` and `investigate` waits on the chain (trial finding 2), so the trial's assistant is ask, drafts, `check` and (with N852) transcription. Whether any of those paths is served end to end, so its flag could be set by a reviewed change in T46, was not checked here.
10. **N881's status report** has no drafted text (T45 left it out): its op, its door (control-plane or the existing draft door) and whether `credentials`' grant list changes (L2) are BOB's at the fold; if `credentials` changes, an L2 entry is owed.
11. **`affordances` (T46-31) and `answer-envelope` (T46-40)** are included only conditionally: whether their tests pin T46's new ops or a new family is verified at the opening.
12. **[Q2] under A** (a fresh release key) changes `installer` R43's `ARMED_SIGNERS` on the cut, outside a job; under B nothing changes. Either way the cut is BOB's act, not a T46 entry.
13. **The installer's address (K2799):** T46-49's README part needs the address; if Bob has not named it by L11's START, that part stays left out as Bob's, and the rest of T46-49 runs.
14. **setup-page's merge order** after instance-setup reverses `modules.json` order (no edge, only its end-to-end test reads `bootstrap`); BOB's.

## BOB's review (K2872)

Doubts 1 (renumbering), 2 (no extraction → run-rules edge; the label as data), 3 (N852 in: size is no reason, P19) and 14 (setup-page after instance-setup) are BOB's and decided as drafted. Doubts 4, 5, 7, 8, 11, 13 are settled at the opening from what T45's close leaves (PR #28 on `main`, L11's outcome, the split maps, `archive/T41.md` re-tested). Doubts 6, 9, 10 are BOB's to draft before the opening (P18). [Q2] is cited by substance (the development key as an interim, or a fresh key at a signer sitting), not by letter.

**Study (K2873, `study-T46-assistant.md`):** ask and draft work once T46-9, -10, -14, -48 land; transcription with N852; `check` and `plan` need a member-run dispatcher (N919: `ai-runs` R18's meaning, Bob's, or an organisation `ai` credential on biosmoke7); enquire, infraction and bearing drafts, investigate and extract stay left out (dependencies not yet built). N881 re-shaped as N920 (op `statusreportassist`, no credentials change, no plan-work → run-rules edge: T46-26's edge struck at the opening). The trial draft's §1.3 overstates `check`.

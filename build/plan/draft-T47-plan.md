# Plan T47

**Status** · DRAFT (BOB's review pending) · written by a worker for BOB #163, 2026-10-12, while T46 runs L11 (its last layer).

**Sources** · `next.md` N751…N980, each re-tested; `current.md` (T46: its Entries, "Left out of T46" with T41's carried rows, rule 5's reds, "BOB's acts"); `archive/next-applied.md`; `modules.json` (order, layers, `legacy`); `rulings-active.md`; rulings K2980–K3003, `handoff.md`; `extraction/case-authoring-split-2.md` and `extraction/actions-split.md` (K2982); `draft-T46-interface.md` §5 "Left to T47", `draft-T46-usable.md` "T47"; PROCESS-DESIGN P10, P18, P19; MECHANICS §5.2. **To re-test at the opening:** whatever T46's L11 leaves unmerged or carries (its Outcome), and DEC-198 (PR #30, merged at T46's close) against N889, N962 and the words/registry re-takes (T47-47, T47-53).

## Legacy census (§5.2 (2))

| legacy module | in T47 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX; K633, K1849, N897 (1) "legacy-ui stays as it is"): it stays until the new interface replaces it, and T47 builds the rest of that interface (T47-57…T47-64); whether it then retires is Bob's (P4: removing a module carrying capability), asked at T47's close. N794, N865 (its reds) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider before its users; promotion's stamp last in L2; plane last in L11. Each layer's text is folded before its START (BOB's wording, P5); every new or amended line ends *(not yet met: T47)*.
2. **Every job reads its own code and tests whole** (P20).
3. **The opening's act (K657, K1043, K624):** `modules.json` and `layers.md` gain, with empty `paths` and `tests`: `case-inputs` (L8, after `case-account`), `action-records` (L9, after `action-grammar`), `screens-wizards` (L11, after `interface-shell`), `screens-investigate`, `screens-publish`, `screens-action` (L11, after `screens-inquiry`, before `control-plane`); `requirements/case-inputs.md` (split map §4) and `requirements/action-records.md` (§4) written; membership's `MODULE_ORDER` entry is T47-7.
4. **Splits by copy, then delete (K624):** each new module merges first in its layer; its source module's job deletes the copies after it.
5. **Accepted reds at the opening** (re-checked against T46's Outcome):
   1. coverage: every id marked *(not yet met: T47)* until its module's merge (installer R48's address part among them, N923);
   2. row census: rows T46's L3+ jobs added or changed until T47-10; rows T47's L3+ jobs add or change (case-inputs' and action-records' moved `where`s among them) until T48's stamp;
   3. legacy-ui `statement-ack.test.mjs` (N794), `progression-revision.test.mjs`, `queue-recipients.test.mjs` (N865) (K633);
   4. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   5. bundler `fleetbundles.test.mjs` agent-worker inputs pin (N950) until T47-4;
   6. membership `MODULE_ORDER` tests from the opening's act until T47-7;
   7. consequences R24's T47 clause (`test.todo`, N958) until T47-35; case-carriage R19, R21's T47 marks (N947) until T47-26;
   8. **the split windows** (split maps §7): consequences (`carryOutcome`) and action-replies (`registerOpenRequests`) from T47-32's merge until T47-35, T47-40; affordances, answer-envelope, control-plane, plane tests naming case-authoring's moved ops and checks until T47-49, -54, -65, -66; affordances, escalation, action-clocks tests driving actions' moved acts from T47-38's merge until T47-49, -42, -39.
   Any other red a merge opens is named at that merge (K2704).

## Entries

### L1
- **T47-1 · record-grammar** · (N956) `PROPOSAL_STATES` gains the `status_report` subject and its sentence; (N958) `checkBundle` admits a `success_record` object (`SUC-<year>-<digits>` id with no slug, its type, a `success_record@1` schema or the row-object exemption) · text BOB's · first in L1.
- **T47-2 · jurisdictions** · (N971) Provides states `COUNTERPARTY_LEVELS` (setup-page R5's use), tested by name · text BOB's.
- **T47-3 · connection-grammar** · (N948) a requirement stating `isRecordId`'s behaviour, tested at the interface · text BOB's.
- **T47-4 · bundler** · (N944) R30: `--sign` derives the signer line from the seed in use, or refuses naming both when they differ; (N950) `fleetbundles.test.mjs` pins agent-worker's inputs by name as the manifest records them (28) · text BOB's.
- **T47-5 · odf-reader** · (N942) R47 moved from Private to Provides (`file-safety`'s use), its test at the interface · text BOB's.

**L1 merge order:** record-grammar, jurisdictions, connection-grammar, bundler, odf-reader.

### L2
- **T47-6 · record-core** · (N939) R25: `setSetting` refuses a value that does not round-trip through JSON (function, symbol, BigInt, `NaN`, `Infinity`) by a new row `SETTING_INVALID` · text BOB's.
- **T47-7 · membership** · (K657) R83 `MODULE_ORDER` gains `case-inputs`, `action-records` and the four new screen modules (rule 3); `module-order.test.mjs` re-pinned · text BOB's.
- **T47-8 · project-roster** · (N940) its fixture's record-core stub gains `declareTable`; (N972) a read of the projects a member may see with each one's stage (the question count per doubt 5) · text BOB's.
- **T47-9 · credentials** · (N955) R63 new `aiRunCredentialMint`: in-plane, member-scoped, the run on its row, writes limited to the mode's runner writes, a sub-day expiry, revoked at the next segment, the run's end, her revocation or sign-in disconnect · K2976 · text BOB's.
- **T47-10 · promotion** · **the stamp**: rows T46's L3+ jobs added or changed (T46 rule 5 (2); C-51's reasons, C-116.47–.48, C-64.28–.29, C-69.6, …) and T47's L1–L2 rows (`SETTING_INVALID`) · text BOB's · last in L2.

**L2 merge order:** record-core, membership, project-roster, credentials, promotion.

### L3
- **T47-11 · capture** · (N979) `heldCaptures` (R77) rows carry the capture's grade and digest; (N969) a read listing set-aside documents, so `heldrestore` is reachable beyond one visit (doubt 6); (N971) Provides states `INFORMATION_GRAMMAR` · SCREENS-INTAKE #1 J1, J4 · text BOB's.
- **T47-12 · file-safety** · (N941) R14: an unreadable queue with a renderer bound answers its own code, a new C-140 row (K231); (N971) Provides states `onOwnServers` · text BOB's · doubt 3 (size).
- **T47-13 · sources** · (N947) answers the instants at which a source's disclosures and consents changed · text BOB's.

**L3 merge order:** capture, file-safety, sources.

### L5
- **T47-14 · local-facts** · (N946) `RULE_SECTION_UNKNOWN` minted at one site (C-126.7's `where` moved) · K231.

### L6
- **T47-15 · accepted-work** · (N947) each registered flag's opening and clearing instants · text BOB's.
- **T47-16 · steps** · (N973) R23 states `laterFound`'s `truncated`, tested by name · text BOB's.
- **T47-17 · citation** · (N975) a served act drawing a question into a project (the project's `cites` edge to a new inquiry) without a full revision of its bundle; (N977) `sever`/`reinstate` acting on an inquiry's own leg · SCREENS-INQUIRY #1 J4 (2), (4) · text BOB's · doubt 7 (owner).
- **T47-18 · basis-versions** · (N974) an op serving `projectQuestions` (R41) · text BOB's.
- **T47-19 · strength** · (N976) a project's own bar (`required_strength` in its document) set by a served act, distinct from the group's `strengthbarset` · text BOB's.
- **T47-20 · ai-runs** · (N955) a member's run dispatched at her act with the segment credential `credentials` R63 mints, T46's interim (the page-held one-day credential, K2976, K2999) retired; (N949) R40's "(today only check)" re-worded · text BOB's.
- **T47-21 · capture-requests** · (N969) a member path for "Ask for this later": `captureRequest` without a running `run` · text BOB's · doubt 6.
- **T47-22 · skills** · (N949) R18's three-member order re-worded to `plan`'s deployment · text BOB's.
- **T47-23 · agent-harness** · (N949) R2's public text re-worded · text BOB's.
- **T47-24 · agent-worker** · (N949) R56 (the switch on the wire for a sign-in) and its Suggestions' T46 note re-worded (agent-model R15) · text BOB's.

**L6 merge order:** accepted-work, steps, citation, basis-versions, strength, ai-runs, capture-requests, skills, agent-harness, agent-worker.

### L8
- **T47-25 · case-grammar** · (N952) Provides states `workingOnOf`; (N953) a stored marker for a cleaned document copy (R12), so a re-wording of `COPY_CLEANED_LABEL` never re-keys a signed edition · text BOB's.
- **T47-26 · case-carriage** · (N947) R19, R21 latch a flag opened and cleared, or a consent withdrawn and restored, inside the interval (their T47 marks), through T47-13, -15; (N953) writes T47-25's marker · text BOB's.
- **T47-27 · publication** · (N952) R53's field list names `criteria`, `signed_at`/`published_at` and the timeline R62, R70, R72 attribute to it; (N908) R23 and Suggestions name `case-inputs` · text BOB's.
- **T47-28 · docket** · (N952) R12 lists `entry` (public-read R20's link) · text BOB's.
- **T47-29 · public-read** · (N953) R3 keys a cleaned copy by T47-25's marker; (N954) tests deepened: R11, R10, R14, DEC-149, K899, R28 "wherever served", `relay.test.mjs`' line numbers replaced by behaviour · text BOB's.
- **T47-30 · case-import** · (N951) R17's citation of the absent docket R23 corrected · text BOB's.
- **T47-31 · case-inputs** (new) · (N908; K2982) built by copy (split map §2, §6), R1–R16 · `case-authoring-split-2.md` · first to merge in L8.
- **T47-32 · case-authoring** · (N908) deletes the copies, re-points to `case-inputs` (§3), creates it in its factory, drops `schema.mjs` and its purge declaration, retires R19–R21, R28, R39, R59, R62, R70, R71, R73, adds R74, re-words R9, R14, R27, R29, R34, R38, R65; (N683) ratification R44's `publish_at` offer carried into R34's step 5 · split map §3, §4; N683 BOB's · after T47-31 · doubt 4.
- **T47-33 · review** · (N908) R18, R20 read `statementAcknowledgements` from `case-inputs`; `invariants.test.mjs` re-pointed · split map §5 · after T47-31.

**L8 merge order:** case-inputs first (K624), then case-grammar, case-carriage, publication, docket, public-read, case-import, case-authoring, review.

### L9
- **T47-34 · conformance** · (N951) R32's identity mapping stated against case-import R4 as T46 built it · text BOB's.
- **T47-35 · consequences** · (N958) R24's audit clause met, its `test.todo` made a test; (N908) R22: `carryOutcome` through `case-inputs`, `uses` drops `case-authoring` · text BOB's.
- **T47-36 · action-grammar** · (N959) R8 stated as the date rule (the time-of-day arm actions' own); (N961) the moved rows' `where`s (C-73.2–.5, C-90.2, receipt, scope, promise, risk-basis) → `src/action-records/index.mjs`, census fixtures following · text BOB's; split map §5 · doubt 8.
- **T47-37 · action-records** (new) · (N961; K2982) built by copy (split map §2, §6, line numbers re-taken after T46-32), R1–R15 · `actions-split.md` · first to merge in L9.
- **T47-38 · actions** · (N961) deletes the copies, re-points (§3), creates `action-records` in its factory, retires R19, R28, R73, R80, R87, R88, re-words R18, R23, R25, R33, R36, R64, R66, R70, R99; (N960) R12 governs an action's clock zone (one zone read, owned here), `place()` kept for modules with no office, `t34`'s pin re-stated · split map; text BOB's · after T47-37.
- **T47-39 · action-clocks** · (N960) R19 reads actions R12's zone (its `actionZone` re-pointed); (N965) `dueAtOf` stated and tested by name; (N968) `overdueClocks` (R3) answers the clock's venue; (N961) `t45.test.mjs` drives `action-records` · text BOB's.
- **T47-40 · action-replies** · (N908) R3: `registerOpenRequests` through `case-inputs`, `uses` gains it · split map §5.
- **T47-41 · filing-templates** · (N957) C-125.4 `TEMPLATE_BLANK_UNKNOWN` minted once (or both sites named) · K231.
- **T47-42 · escalation** · (N961) `real.test.mjs` drives `action-records` (test only) · split map §5.
- **T47-43 · action-plans** · (N964) R19's `date_past`, `date_before_phase` on the place's local day, undetermined (R28) with no zone held; (N963) a distinct code for a malformed `why_first` (K231), C-124.63 kept for the absent reason; (N966) the public part names the closing instant `closed.at` · text BOB's.
- **T47-44 · plan-work** · (N956) R14's interim label → `proposalLabel(by, "status_report")`; (N966) R15 names `met_at`'s instant and `met_at_why`, R13 names `nowMs`; (N968) R4's due read answers the review recurrence and the last review's day · text BOB's.

**L9 merge order:** action-records first (K624), then conformance, consequences, action-grammar, actions, action-clocks, action-replies, filing-templates, escalation, action-plans, plan-work.

### L10
- **T47-45 · monitoring** · (N969) a served act setting a bundle's `monitoring.enabled`, so `op=monitor` from Add is not refused `NOT_MONITORED` · text BOB's.
- **T47-46 · following** · (N967) R25 `dutyWatchEndAt(duty)` → null or `{day, at}` · text BOB's.

**L10 merge order:** monitoring, following.

### L11
- **T47-47 · wizard-scripts** · R13 `SCREEN_REGISTRY` re-taken from `registry.json` on `main` after DEC-198 (only if it differs) · DEC-198.
- **T47-48 · op-grades** · T47's new ops graded (N972's, N974's, N975's, N976's, N977's, N969's three, N955's) · text BOB's.
- **T47-49 · affordances** · help and offers for T47's new ops; catalogue tests add `case-inputs`' namespace, ops and checks (N908 §5); `t45`, `t45-backing`, `catalogue` drive `action-records` (N961 §5) · after T47-48.
- **T47-50 · action-producers** · (N968) R23 fills `queue.action-clock-overdue.ours.detail` and `queue.plan-review-due.detail` from T47-39, T47-44 · words.json.
- **T47-51 · notice-producers** · (N967) R18 tells "already told before the end took hold" from `dutyWatchEndAt`'s instant · text BOB's.
- **T47-52 · setup-words** · R1, R2 `WORD_ROWS` re-taken from `words.json` after DEC-198 (only if it differs) · DEC-198.
- **T47-53 · op-declarations** · T47's new ops specified; (N980) a member-session read answering a knock's source id (`sourceof`, `sourcerung` in `SESSION_OPS.member`, or a new read) · text BOB's · doubt 7.
- **T47-54 · answer-envelope** · `CHECK_FAMILY_FILES` adds `src/case-inputs/checks.mjs` directly before case-authoring's; the order test pins it (N908 §5).
- **T47-55 · store-door** · (N970) `PROJECT_NAMING_READS` gains `statusreportassist`.
- **T47-56 · interface-shell** · (N897 (1)) the People rail place; the shell's routes to the new screen modules; Settings › "Group settings" opens the redrawn sections, the setup page keeping only what stays undrawn · text BOB's.
- **T47-57 · screens-wizards** (new) · (N897 (1); N821's runner, screen side; N551 (part); N572) `wizards` with the runner and the dock's wizard guide ("Show me where") · registry.json; text BOB's.
- **T47-58 · screens-settings** · (N897 (1)) the settings sections still on the setup page: who the group is (N551 part), places and offices, `translations` (N669's screens), `security` (N703 part, N710's screens), recovery codes, group settings (N721) · registry.json; text BOB's · doubt 9.
- **T47-59 · screens-intake** · (N979) a held row draws its grade and a thumbnail opening `open-file`; (N980) `sourcelink` without typed ids; (N969) the set-aside list, monitor from Add, "Ask for this later"; `archive` (N688's screen part) · text BOB's.
- **T47-60 · screens-daily** · (N972) Home's "What the group is working on" with each project's question count and stage; `startfrom` on Home (through T47-57) · text BOB's.
- **T47-61 · screens-inquiry** · (N974) the project's questions read directly; (N975) drawing a question into a project; (N976) the project's own bar drawn and set; (N977) sever/reinstate on the question screen; (N955) the dock holds no credential, a reloaded dock continues the run; the link to `projectai` and its screen (N721) · text BOB's.
- **T47-62 · screens-investigate** (new) · (N897 (1)) `person` (N719), `timeline`, `money` (N728), `calculation` (N735's spot-check), `explore`, `proceeding`, `due-date`, `standard`, `ties` · registry.json; text BOB's.
- **T47-63 · screens-publish** (new) · (N897 (1)) `case-editor`, `review-copy`, `ceremony` (N788's Photos step, N757's marking on screen, N683's "Publish at…"), `published`, `imported`, `docket`, `doorbell`'s page within the shell · registry.json; text BOB's.
- **T47-64 · screens-action** (new) · (N897 (1)) `plan`, `start-send`, `request`, `action`, `matter` (the v0.2 constructs the design stream has drawn by L11's START) · registry.json; text BOB's.
- **T47-65 · control-plane** · T47's new ops routed; (N955) the member-run door with the segment credential (R77 re-stated, the page-held credential retired); tests re-pointed to `caseInputsOps` and its checks (`statementack`, `digest-channel`, `r45-routes`, N908 §5); edges → the four new screen modules · text BOB's · after T47-56…64.
- **T47-66 · plane** · R39 spreads `caseInputsOps` (before case-authoring's) and `actionRecordsOps`; (N955) the Store RPC `dispatchMemberRun` takes no page credential; the route map's tests re-pinned for T47's ops · text BOB's · last in L11.

**L11 merge order:** wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, op-declarations, answer-envelope, store-door, interface-shell, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane last.

**Counts:** L1 5 · L2 5 · L3 3 · L5 1 · L6 10 · L8 9 · L9 11 · L10 2 · L11 20 = **66** (T47-47, T47-52 conditional on DEC-198).

## New modules: places (K617, K657, K1043, K624)

| new module | layer, place | built by | uses (all earlier) |
|---|---|---|---|
| `case-inputs` | L8, after `case-account`, before `case-authoring` | copy from case-authoring (split map §1) | record-grammar, record-core, membership, publication, publish-schedule, case-grammar, case-account; tests test-support |
| `action-records` | L9, after `action-grammar`, before `actions` | copy from actions (split map §1) | record-grammar, record-core, membership, action-grammar, progressions, standards, civil-time |
| `screens-wizards` | L11, after `interface-shell`, before `screens-settings` | fresh | interface-shell, setup-words, op-declarations, wizard-scripts |
| `screens-investigate`, `screens-publish`, `screens-action` | L11, after `screens-inquiry`, in that order, before `control-plane` | fresh | interface-shell, setup-words, op-declarations |

**Edges added:** case-authoring, review, consequences (dropping case-authoring), action-replies, plane → `case-inputs`; actions, plane → `action-records`; control-plane → the four screens. No edge points later.

## BOB's acts (no job)

- **Requirements before each START (P18):** `case-inputs`, `action-records` (split maps §4); the L11 screens' requirements from `registry.json` and the layouts page (a `draft-T47-interface.md`, as T46's); the N-entries' wording marked "text BOB's".
- **The channel (design stream's words):** N889 (notice-producers R5, R6, R13–R15 keys), N962 (C-116.41 naming stop pursuing and reopen; `refusal.ALREADY_ATTACHED`), N963's sentence for the new malformed-reason code, N971's scanner wording (file-safety R42 against setup-page R30), N976's `strengthbarset` label, N978 (`act.attest.does`, `act.monitor.does`); re-test N889, N962 against DEC-198 at the opening.
- **N943:** file-safety's split map (4,671 lines), written during T46 (P18), so its split can join T47's L3 if ready at the opening (doubt 3).
- **N945:** the study of `bootstrap`'s `rearmed: true` on biosmoke7 (stored `token_fp` against the current secret); a credentials entry joins L2 if a requirement changes.
- **N898:** `mail done` refusal, process repository, between tranches, certified on a dry run (P3).
- **Release 0.83.0** at T46's close (trial §4 steps 15–17, Bob's deploy acts); a release at T47's close (N896, `draft-T46-usable.md` "T47").
- **Stamp of T47's L3+ rows** (with `case-inputs`' `CARRIED_OUTCOME_CHECKS` in `gate.mjs`' aggregate): T48's promotion (the order).

## Left out of T47 (one hard reason each)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N780 | Bob's: K2816 (4), no public registry now; `biosmoke7` gets its images by copy (done at 0.82.0, K2943) |
| N794, N865 | Bob's: legacy-ui stays as it is (K633, K1849, N897 (1)) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C) |
| N842 | a dependency not yet built: no `enquire` conversation, door or op, no account draft task; and N829 |
| N847 | a dependency not yet built: the pointer's content is the design stream's (N821); no provider named |
| N853c | a measurement: OCR's accuracy on members' photos |
| N858's `@records-request` template content | a dependency not yet built: no named writer and no professional review (K2781 (6), v0.2 rule 11) |
| N880's minutes comparison (U4) | a dependency not yet built: no module holds a meeting's minutes beside a comment |
| N882's "proceeding followed with its own dates" | a dependency not yet built: COURTS L2 is not a requirement; no module assigned |
| N889 | the design stream's: no keys for notice-producers R5, R6, R13–R15 (re-test against DEC-198) |
| N923 (installer R48's address part) and stewards R7 (was T46-61) | Bob's: the stewards' contact address is his to name (K2799); joins L11 the moment he names it |
| N933 | a dependency not yet built: the actions lane's answer whether a per-matter stake is wanted |
| N943 (file-safety's split) | a module's size before its split (P6): no split map yet (BOB's act above) |
| N945 (credentials) | a measurement: the live store's cause, BOB's study first |
| N962 | the design stream's: C-116.41's and `ALREADY_ATTACHED`'s words (B154; re-test against DEC-198) |
| N670 | a dependency not yet built: no act or owner for "read in my language" |
| N708 (credentials R22's `subscription` retired) | a measurement: M-Q2 at Bob's first sign-in on 0.83.0 (step 17); joins L2 if done by its START |
| `investigate`, `extract` on the test instance (N647) | a deployment and measurement: `check`'s live run verified on 0.83.0 (`op=airunverify`) first; joins L6 if verified by its START |
| `legal_facts` triggers detected at their moment | a dependency not yet built: no registry screen for attending or recording (doubt 10) |
| the v0.2 constructs' screens not yet drawn | the design stream's: not drawn |
| the installer's deploy | a deployment: its OAuth client lacks `connectivity-directory.bind`, Bob's dashboard act (K2164) |
| N757 (later) | Bob's: "N757: A" (K2425), members mark photo areas by hand; no AI proposals |
| N563, N579, N632, N641, N643, N645, N652, N698 (part) | a measurement (each as T37's table names it) |
| N703 (part: Cloudflare's blocked-request counts) | a deployment or measurement: a zone and read token per group |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666 | Bob's (DEC-151): after the first public release |
| `gate.mjs`' aggregate gaining `case-inputs`' family; T47's L3+ rows | the order: promotion (L2) runs before they exist; T48's stamp |

**Applied, no T47 entry (to move to `archive/next-applied.md`):** in T45: N828, N855, N858 (but the template), N861, N879, N880 (but U4), N881, N882 (but the proceeding), N883, N884, N885, N887, N888, N890, N891, N892, N893; N894 became N923. In T46: N852, N886, N896/N897 (2)–(5), N899–N907, N910–N922, N924–N928, N930–N932, N934–N938 (each at its last owning merge). Closed: N909 (K2982), N929 (K2981).

## Measure first

- **M-T47-1** (K617, at each START): `case-authoring` and `actions` after their deletes; `file-safety` (4,671); each new screen module (est. 2,000–3,000), `interface-shell`, `screens-inquiry`, `screens-intake`, `screens-settings` with their additions; `control-plane`, `plane`.
- **M-T47-2:** at L11's START, DEC-198's `words.json` and `registry.json` against T46's re-takes (T47-47, T47-52; N889, N962).

## Doubts for BOB (best readings)

1. **Pure-wording entries** (N942, N948, N949, N951, N952, N959, N965, N966, N971, N973): placed as job entries, since P7 wants each clarified text confirmed by a test at the interface. *Alternative:* BOB folds them and leaves them for each module's next job.
2. **The rest of the screens (N897 (1)):** placed in T47 per Bob's "the rest in T47"; the requirements are not drafted yet (BOB's act, P18, before L11's START). The packaging into `screens-wizards`, `-investigate`, `-publish`, `-action`, with settings sections in `screens-settings`, `projectai` in `screens-inquiry` and `archive` in `screens-intake`, is my reading (BOB's, K569).
3. **N941 under file-safety's size (N943):** read as a distinct code for a distinct condition (K231), not new capability, so it runs before the split. If BOB reads P6 strictly, N941 and N971's file-safety part join "Left out" with N943.
4. **N683 in case-authoring's split job:** N683 adds a step; case-authoring after the delete is ~3,020 lines, so it joins the same job (one job per module, P8). *Alternative:* left out until T48 (size before its split, read as "in a later tranche").
5. **N972's question count:** project-roster (L2) cannot read inquiries (L6). Reading: project-roster answers projects and stages; Home takes the count from T47-18's `projectQuestions` op per project. *Alternative:* the whole read in `basis-versions`.
6. **N969's owners and capability:** "Ask for this later" as a member act is drawn in the design (Bob's UX), so read as already Bob's; placed in capture-requests. The set-aside list is placed in `capture`; `heldrestore` is coded in `acquisition`, which may be the right owner.
7. **Owners chosen where next.md offered two:** N975, N977 → `citation` (it owns `sever`/`reinstate` and `cites` edges) rather than promotion or basis-versions; N974 → `basis-versions`; N980 → `op-declarations` (`SESSION_OPS`) rather than doorbell.
8. **action-grammar's `where`s before action-records merges:** action-grammar is earlier in L9's order but its `where`s name `action-records`' file. Reading: merge action-records first (rule 4), then action-grammar, so the census and `where`s name a file that exists.
9. **The setup page once its settings are redrawn:** Bob chose A for T46 (K2893); hiding the setup page's day-to-day sections (draft-T46-interface Q1 C) is Bob's (UX), to be asked when T47-58 lands, not assumed.
10. **`legal_facts` triggers:** current.md put them with "their screens (attending, recording, receiving)"; no registry screen for attending or recording was found, so left out. If BOB finds them in `registry.json`, they join `screens-intake` or `screens-investigate`.
11. **N955 and plane:** next.md names credentials, ai-runs, control-plane and screens-inquiry; the Store RPC `dispatchMemberRun` (plane R40, K2999) changes too, so plane carries it (T47-66).
12. **N960's zone owner:** actions (earlier) owns the one zone read and action-clocks reads it, since actions cannot use action-clocks (P4).

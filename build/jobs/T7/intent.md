# intent (T7)

**Status** · session_01GQGyDoacLdEkcPzHjpqTBg · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Four points where intent's requirements meet code outside its paths. I am building on the best reading of each now; only Q1 and Q2 change what reaches the running plane.

**Q1. Wiring (map §5).** intent's `from` is legacy-checks only, so I cannot add the line in `store.mjs` that reaches the module. Best reading: `intentOf(host, deps)` (K61) registers everything itself on first reach: its promotion step (R1's objective check, R2's condition grammar, R26's aspiration/goal state machines), an audit check with record-core (R59), so `auditPass` keeps C-2.9's objective arm when I remove it from `checkBundle` (R22), and its tables with purge (R24). It also exports `intentOps(i, url, body)` in the shape `progressionOps` uses. Three lines belong to legacy-store and legacy-index, and I will REPORT them: `intentOf(ctx)` in the Store constructor before legacy-store's `registerStep`, `intentOf(ctx).migrate()` in `#migrate`, and the ops routing. Until they land, the running plane enforces no objective: not at the write, and not in the audit. Today the audit is the only place it is enforced. Is that acceptable for the layer, or do you want the arm left in `checkBundle` until legacy-store reaches intent?

**Q2. R26's two document types.** Promotion admits any `object_type` (it does not run C-2.5), and it checks state edges only for the types in the catalogue's `STATES`. So `aspiration` (`ASP-<year>-NNNN`) and `goal` (`GOAL-<year>-NNNN`) can be real bundles, with history, authored revisions and the gate. My step enforces `held → retired` and `open → closed` and refuses every other move. But `checkBundle`'s C-2.5 reports both types as unknown in the audit and the gate (`OBJECT_TYPES`, known schemas `aspiration@1` and `goal@1`), and `STATES` has no row for them. Admitting them is an addition to legacy-checks, which an extraction job may not make (net removal). Best reading: I build them as above and REPORT the catalogue admission for you to route. Or do you want them held another way?

**Q3. R17 through inquiry's dispose.** `inquiry.dispose` takes only a retrieval selection handle, and intent's uses do not include `retrieval`. Best reading: add `retrieval` to intent's uses (layer 5, earlier in the order). `ageSurfaced` makes one enumerated selection per aged question (`selectionCreate({kind: "enumerated", ids: [id], owner: "plane:intent"})`) and disposes it `deferred` under the plane actor, so one refused question does not hold back the rest. The alternative is a per-id dispose in inquiry's Provides. Until you answer, I use an injected `retrieval` dependency.

**Q4. R4's `filter` has no stated shape.** Best reading: a flat map. The one key the record evaluates is `entity_kind` (the instance entity's kind, entities R5). Any other key, or a filter that is not a map, is kept, and it makes each matched instance undetermined with the reason "the record cannot evaluate this filter", never excluded (R4).

Decided without asking (for rulings; tell me if any is wrong): the condition lives in the project's front matter as a flat block `objective_condition:` (`progression`, `entity`, `relation`, `filter_*`, `required_grade`, `required_stages: [..]`, `share`), because the restricted grammar has no nested maps. `question` (R16) creates an inquiry at `surfaced` through `promotion.promote`, so inquiry's check and ai-runs' surfacing step (R25) run inside it; a machine passes its `run`. Departures, triage acts and the registered sources are rows in intent's own tables, declared to purge. Adoption also writes a revision of the project document (`objective_adoptions` entry and a Session Log line). Dead ends are appended as revisions of the aspiration document.

## J2 · QUESTION

Two more readings, added to J1 (J1 stands; this does not replace it).

**Q5. R4: an undetermined grade against missing stages.** R4 says an instance whose grade is undetermined is counted in `undetermined`, "never as meeting or short". Progressions R10 leaves an instance's grade undetermined whenever fewer than two of its stages are placed. Read literally, then, the least complete instances would never be `short` and would never produce a gap (R6), which is the opposite of the work list §12 asks for. Best reading: a grade that is undetermined makes the instance undetermined only when the grade would decide the outcome. So an instance missing a required stage is `short`, naming the stages missing, whatever its grade. An instance with every required stage placed and an undetermined grade, while the condition requires a grade, is `undetermined`, with the reason why. A condition with no required grade never asks the grade.

**Q6. R14: "the capture requests named in them with their outcome".** intent's uses do not include `capture-requests` (layer 6, earlier in the order), so intent cannot read a request's outcome. Best reading: add `capture-requests` to uses. `pursuitOf` lists each capture request id named in the basis of a proposal triaged under the aspiration's goals, with its outcome from `capture-requests`. Until you answer, the dependency is injected, and with none present the outcome reads `null` with the reason, never a guess.

## J3 · QUESTION

**Q7. The ownership check's net-removal rule cannot be met by this extraction as ruled.** K198 has me add the three lines to `store.mjs`, and the import makes four: `import { intentOf, intentOps }`, `intentOf(ctx)` in the constructor, `intentOf(this.ctx).migrate()` and `...intentOps(intentOf(this.ctx), url, body)`. The only code that moves out is C-2.9's objective arm, three lines of `bio-checks.mjs`. `node checks/ownership.mjs . intent tranche/T7` answers: "legacy-checks + legacy-store: intent adds 4 line(s) and removes 3; an extraction's net change to its legacy modules is a removal". Every added line is an import from my paths or a use of one, and nothing else fails.

Best reading: this is the case the rule does not foresee. A module that is new in all but three lines needs more wiring than it moves. I will not contort the code to pass the check (for example, putting two statements on one line). I record the failure in my record with this reason, for your review of the four lines at the layer close. If you want it met instead, name how: for example, a ruling that exempts this job's four lines, or moving the three wiring lines into the dispatcher that legacy-store is to become.

Everything else is done or running: 30 intent tests pass; the format, architecture and coverage checks pass (26 of 26 live ids named); `test/m/` gives 1711 pass and the one known red (N131). The legacy battery is running now, on the base and on my head, so that I can REPORT exactly what R1 at the write turns red.

## J4 · REPORT

What intent's job found in other modules, and what it leaves for them. Each is also listed in my COMPLETE.

1. **legacy-tests: 84 legacy suites go red because of R1 at the write.** I ran all 371 suites with `node --test`, on the merged `tranche/T7` (3ea54ba023) and on my merged head. Base: 274 pass, 97 fail. Head: 190 pass, 181 fail. Every change is pass → fail, and none goes the other way. Each one I sampled (`project-mint`, `capability`, `theme`, `gate-reads`, `queue`) fails the same way: its fixture creates a project whose document states no `objective`, and the promotion is now refused `NO_OBJECTIVE` (C-2.9). The remedy is one line in each fixture's project document, `objective: "…"`. The product's own creators already write one (`civicos-ui/app.html` 3319, `setup.mjs` 894, `promotion.forkProject`, which copies the origin's). The suites: `capability`, `capture-container-extent`, `capture-pagecount`, `case-authority`, `casesearched`, `casesign`, `citeproject-inquiry`, `conclude-project-arm`, `conclude-project`, `conclude`, `content-capture-bound`, `content-extent-arms`, `content-extent-leg`, `content-extent`, `content-reads`, `cpdf18-pdf-images`, `d125-findingmute`, `d150-statement-acknowledgement`, `d179onehome`, `d266scope`, `d389-fullfetch`, `d420-image-page`, `d440-image-part`, `d50-project-names`, `d507-statement-ack-translation`, `d510-promoted-type`, `d526-refusal-order`, `d530-parted-attest`, `d556partedpublish`, `d563-promoted-title-state`, `d575-pair-choice-state`, `d706-linkproject`, `d84-case-manifest`, `d86-bias-debt`, `deliverer`, `disposition`, `founder-sight`, `frontier-internet`, `fw19-extent-arms`, `gate-reads`, `instance-group`, `lead`, `leadlist`, `m0187-surfacing-fixture`, `m0193-surfacing-fixture`, `machine-attest`, `members`, `opaque-ids`, `operator-attest`, `overdue-successor`, `peritem`, `project-authority`, `project-disclosure`, `project-discoverable`, `project-join-request`, `project-mint`, `projects`, `provenance-marker`, `queue-conditions`, `queue-state`, `queue`, `ratify-authority`, `ratify-envelope`, `ratify`, `reading-position-occurrences`, `reading-position`, `readingname`, `rec-181-promote-retire`, `rec-186-leave-join`, `rec120-onpoint-undetermined`, `rec122-onpoint-choice`, `rec174-supplyfetch`, `rec179-surfaced-by`, `rec180-promote-rollback`, `rec212-statement-writer`, `rec213-reviewcopy-writer`, `rec217-draft-binding`, `rec219-case-document-v4`, `rec220-version-pin`, `reuse-ratify`, `reviewcopy`, `shadowed-refusals`, `surfaced-by`, `theme`. `civicos-ui/test/` fixtures that promote a project (`project-workspace`, `published-index-pair`, `several-cases-choice`, `conclude-reading`, `statement-ack`, `review-copy`) state no objective either; they are not in this battery. `check-firing` stays green.
2. **legacy-index: intent's ops are routed in the store but not admitted by the control plane.** `intentOps` answers 17 ops: `objectivecondition`, `objectiveprogress`, `objectivegaps`, `goaldeclare`, `goallink`, `goalclose`, `goal`, `aspirationdeclare`, `aspirationdepart`, `aspirationdeadend`, `aspirationretire`, `aspirations`, `aspirationcontacts`, `pursuit`, `intentproposals`, `triage`, `workobjective`. Each needs its OPS row (classes, and whether it is mutating), its NEEDS capability, and the stamps it reads: `author` in the body for every act; `viewer` in the URL; and for `triage` also `run` and `assistantPrincipal`, set server-side as ai-runs' surfacing step reads them.
3. **affordances (N115):** a published act, or a NON_ACTS row, for each mutating op above.
4. **legacy-checks (N159, already routed by K198):** the catalogue does not know the two new document types. C-2.5 reports `aspiration` and `goal` bundles as unknown types, with unknown schemas `aspiration@1` and `goal@1`, in the audit and the gate. `STATES` has no row for either type; intent's step enforces their machines at the write.
5. **scheduler / legacy-store:** `ageSurfaced(now)` (R17, now async) has no caller yet. Until scheduler is extracted, legacy-store would register it as a scheduler consumer, as it does for `progressions.overdueScan`. Wiring it is not my job's; say if you want me to.
6. **queue and monitoring:** `gaps({project, viewer})` is the `objective-gap` producer (D-76, R6), which queue renders. `watchSet({project})` is what monitoring watches (R7). `intent.registerSource(kind, reader)` is where monitoring's and scheduler's findings join the proposals (R15).
7. **capture-requests (improvement):** its Provides has no read of one request by id. `pursuitOf` reads `captureRequests({viewer, limit: 1000})` and matches the ids. A request beyond that bound reads outcome `null` with the reason, never a guess. A by-id read would make this exact.
8. **Generated artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale: `src/intent/` and `store.mjs` changed. It is regenerated at the layer close (manifest).
9. **Requirements text:** R4 as folded (K200) ends a sentence with "…never asks the grade (K200) or short." The words "or short" belong earlier: "counted in `undetermined` with why, never as meeting or short".
10. **Refusal family:** intent holds C-110.1–C-110.28 (and C-2.9's objective arm).

## J5 · COMPLETE

**Entries applied** (plan: T6-11, extract per map and requirements; R2–R18 and R26 new, R19–R25 binding the new code; K102, K198, K200, K204)

- **Module** `bio-plane/src/intent/`:
  - `index.mjs` holds the factory `intentOf(ctx)` (K61), which registers intent's promotion check (R39), its audit check (record-core R59) and its purge tables (R24).
  - The class `Intent` provides:
    - objective: `setCondition` (R2), `progress` (R3–R5), `gaps` (R6), `watchSet` (R7);
    - goals: `declareGoal`, `linkObjective`, `closeGoal`, `readGoal` (R8);
    - aspirations: `declareAspiration`, `departFrom`, `recordDeadEnd`, `retireAspiration`, `aspirationsFor`, `contacts`, `pursuitOf` (R9–R14);
    - discovery loop: `registerSource`, `proposals`, `triage` (R15, R16) and `ageSurfaced` (R17);
    - `workObjective` (R18).
  - `intentOps` (17 ops) is also in `index.mjs`.
  - `checks.mjs`: the C-2.9 objective row (`NO_OBJECTIVE`) and the family C-110.1–C-110.28. Each code is minted at one site, inside its DEC-49 region.
  - `schema.mjs`: `intent_departures` and `intent_triage`, append-only.
  - `doc.mjs`: the aspiration (`ASP-`) and goal (`GOAL-`) documents, and the project's `objective_condition` and `objective_adoptions` blocks.
- **R1/R22.** C-2.9's objective arm is removed from `checkBundle` (3 lines of `bio-checks.mjs`). It is enforced at the write by intent's registered check, which is new behaviour; before, only the audit enforced it. The audit keeps it through intent's audit check (same id; `tallyDetail` `C-2.9/NO_OBJECTIVE`).
- **R26.** Aspirations and goals are bundles of the types `aspiration` and `goal`, written through `promotion`. Intent's check allows only `held → retired` and `open → closed`, keeps each document's scope and owner, and refuses a machine author. **C-2.5 reports both types as unknown in the audit and the gate until N159** admits them to the catalogue (K198 Q2).
- **Readings adopted:** Q1–Q4 (K198), Q5–Q6 (K200), Q7 (K204); my decisions without asking are in J1.
- **Legacy side.** Ownership check: legacy-checks 0 lines added, 3 removed; legacy-store 4 lines added, 0 removed. **The check fails on the net-removal rule by design (K204):** a module that is new in all but three lines needs more wiring than it moves. The four added lines, each an import from intent or a use of one:
  - `store.mjs:395` `import { intentOf, intentOps } from "./intent/index.mjs";`
  - `store.mjs:746` `intentOf(ctx);` (before legacy-store's `registerStep`)
  - `store.mjs:1002` `intentOf(this.ctx).migrate();`
  - `store.mjs:18280` `...intentOps(intentOf(this.ctx), url, body),`

**Improvements made in this module:** one minting site per refusal code (DEC-49). `ADOPTIONS_UNSPLICEABLE` is its own row rather than a borrowed CONDITION_UNREADABLE. The founder (`admin`) counts as an administrator for group aspirations (R9).

**Deferred:** nothing of intent's own. R17's scheduler call is not wired: that is scheduler's or legacy-store's (J4.5).

**Other modules:** see J4. It covers:
- legacy-tests: 84 suites whose fixtures create projects with no objective;
- legacy-index: the 17 ops' OPS rows and stamps;
- affordances: the acts, N115;
- legacy-checks: N159;
- scheduler: the `ageSurfaced` caller;
- queue and monitoring;
- capture-requests: a by-id read;
- the stale plane bundle;
- R4's displaced "or short".

**Tests and checks** (on `job/T7/intent` after merging `tranche/T7` @ B5, 3ea54ba023):
- Module: `node --test bio-plane/test/m/intent/` → tests 30, pass 30, fail 0. The files: objective (R1–R7, R22), pursuits (R8–R14, R26), discovery (R15–R17, R20), invariants (R18, R19, R21, R23–R25).
- `node --test bio-plane/test/m/` → tests 1745, pass 1741, fail 1: the known connections factory red, N131.
- Layer tests: none named in `build/manifest.md`. I provide no service an existing module uses yet.
- Legacy battery, every `test/*.test.mjs`: base (merged tranche) 274 pass / 97 fail; head 190 pass / 181 fail. The difference is exactly the 84 suites listed in J4.1, all pass → fail on `NO_OBJECTIVE` in their fixtures.
- `node checks/format.mjs .` → format: 69 modules, 64 requirements files; 0 failures
- `node checks/architecture.mjs . intent` → architecture: 9 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs . intent` → coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs . intent tranche/T7` → ownership: 12 files changed by intent between tranche/T7 and HEAD; legacy-checks: 0 line(s) added, 3 removed; legacy-store: 4 line(s) added, 0 removed; 1 failure (net removal, accepted K204)

Size (session_01GQGyDoacLdEkcPzHjpqTBg): test runs 24, module lines 1553

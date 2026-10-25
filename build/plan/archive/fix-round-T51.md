# The fix round of T51 (K4165, K4168): the plan

**Status** · Planned 2026-10-20 by a planning worker for BOB #229, branch `tranche/T51`; reviewed by BOB #230 and in force (K4189); the round opens with wave 1. Written from: `build/plan/draft-fix-round-T51.md` (48 entries, 29 jobs; superseded by this plan, which keeps its causes and changes its shape as K4168 ruled), `build/plan/deadends-T51/CAUSES.md`, DEC-374 to DEC-377, `build/plan/draft-req-T51-K4169.md` (C12, C49, C62), `build/plan/walk-T51-findings.md` group E with `walk-E-trace.md`, K4164 to K4176, and the code on both sides of each cause. One START per job in `build/plan/starts-T51-FR/<module>.txt`. Nothing is committed; no tracked file is edited; the walk was not run.

## 1. The round in numbers

- **DEC-382 (K4192)** draws C50 and C56: every "when B406 is drawn" below is now drawn and built in wave 2.
- **K4194: the live walk's 30 causes (L1-L30): 22 placed as extra entries, 5 new jobs (acquisition, text-chain, inquiry-grammar, inquiry, pdf-pixels); L11, L12, L18, L20 await the live reads, L27 awaits UX-DESIGN (B411); L23 is FR-05's** (`build/plan/walk-T51-live/CAUSES-live.md`; BOB's decisions of K4194). The round is now 44 jobs: FR-41 `text-chain`, FR-42 `pdf-pixels`, FR-43 `acquisition`, FR-44 `inquiry-grammar`, FR-45 `inquiry`, all sonnet, wave 2, in the merge order of `build/modules.json`. L23 (a redraw empties a chosen file) was sent to `interface-shell` (FR-05) as a CHANGE; it is recorded here only. L2 is placed as option (a): each screen fixes its own `heldcaptures` reads (FR-29 six reads and the shared `docChoice`, FR-25 one). L10 is fixed in the screen (FR-29): an organisation is drawn as `other` is, with no `people` change.
- **K4195 (live reads, `walk-T51-live/live-reads.md`):** L11 confirmed (FR-28); L20 is the question id's trailing hyphen (FR-28) and the generic refusal sentence (FR-28, FR-31); L18 is interface-shell's draw() restoring an empty snapshot over a late read (FR-05, CHANGE B16); L12 to FR-22 (name the failing read; empty, never failed). Only L27 waits (UX-DESIGN B411).
- **K4197: DEC-384 (U417) words and draws the live walk's findings; its code and flow items are extra entries of FR-18, FR-19, FR-24 to FR-31 and the new FR-47 screens-wizards; the shell items are FR-05's (B17); wizard-scripts re-takes at 840099da7c.** Entries added: FR-26 9-10, FR-27 16-18, FR-28 38-42 (and the L17 entry 32 now has its wording), FR-29 9-11, FR-30 21-26, FR-31 20-21, FR-25 10-13, FR-24 2; FR-18's L16 entry (code `PUBLISH_NO_FINDING`, BOB confirms the name) and FR-19's L14 entry (`review.title.draft`, `.untitled`, `.body.nocase`) now carry their words; FR-47 (`screens-wizards.txt`, sonnet, wave 2, merged after `wizard-scripts`) takes L27. Shell items (weight marks by key, reasoned acts asking before they run, tips placement, the 390 px CSS of the B411 block) were sent to `interface-shell` (CHANGE B17) and are recorded here only. `file-scanner.credential.*` (T-14) is read where the provider form is drawn, `screens-settings` security (`security.mjs:126`): FR-25 entry 12; the three `file-scanner.catalogue.*` rows are the catalogue's (CR-17). Open for the targeted re-walk at 390 px with an inspector: I-34 (the progress act is not identified), T-06's placement, G3's empty box, "Security" at 20 px and the project card's second box. L15 stays as placed; G6 is FR-30 entry 23. The round is now 46 jobs (FR-46 and FR-47 added).
- **As corrected by BOB #230 (K4189, K4190): 39 jobs**: wave 1's 5; then the pass (its module list drawn from the guard's census, minus every owner with a job); then wave 2's 34: the 29 below plus FR-35 `citation` (C50), FR-36 `monitoring` and FR-37 `link-sweep` (C56), FR-38 `installer-steps` (R33's code half), FR-39 `instance-setup` (C11's file); `capture-requests` gains a haiku job for `capturerequestretry`'s declaration before `screens-intake` sends it. All on claude-sonnet-5-5. FR-40 `affordances` (haiku; K4190: its R57/R61 test red after DEC-379 to DEC-381) joins wave 2. The controls of C20, C23, C65 are drawn (DEC-381) and built in wave 2; those of C50 and C56 when B406's drawing merges (CHANGE). The lines below are the planning worker's original count, kept for the record.
- **34 jobs, one per module, in two waves: wave 1 5 jobs (the providers every other job needs), then one mechanical pass (section 4a: no job running, the declarations of 31 declaration-only modules, drawn from the guard's count), then wave 2 29 jobs (all the rest, concurrently).** 141 entries in all. The draft's 32 declaration-only jobs are the pass: 31 modules are in it; `filings` keeps its own job because it carries two requirement lines.
- **Models:** 33 jobs on claude-sonnet-5-5 and 1 on claude-haiku-5-5 (`filings`); the pass is one sonnet worker at medium effort in BOB's session. No job needs the default model (K3269). A module the pass hands over for a judgment gets its own wave-2 job on haiku, sonnet if it blocks.
- **Causes placed:** every BUG (19), DOOR (11) and CONTROL-DRAWN (13) of the census except as listed in section 7; the NO-OP exposures C20, C23, C65 (the ops only: their controls are not drawn); C12 (without its classification row, K4185), C49 and C62, now built with their screens (DEC-378); the 31 CONTROL-UNDRAWN causes the design drew in DEC-374 to DEC-377; group E; K4176's installer reds and the release-coherence defect; FR-DEPLOY (K4180, amended by K4186) and FR-SCAN (K4182). Development builds deploy to the test copy unsigned and only the alpha release is signed, under `release` (K4186). C33's facet counts are closed by DEC-376 ('do not build'), and C38 is not a cause (a stale use case, K4166).
- **The reds the design left (K4174)** are turned green by the screen jobs: interface-shell R21/R38 as the nine screen modules register their acts and the six new screens; screens-settings R3/R21, screens-inquiry R10, screens-investigate R10, screens-publish R1 to R6, screens-action R5 each by its own job. Interface-shell R23 (the literal sample names) was cleared by DEC-378 (B401); `interface-shell` reports it if it is still red.

## 2. What this plan decides (BOB's details, none is Bob's; confirm or change before the STARTs go out)

1. **The release-coherence defect (K4176 (2)) is `agent-runner`'s.** Read both modules: `agent-worker` R35/R109 bind `REMOTE` to `agent-runner`'s `RemoteSession` unconditionally (and R110 already says what an unready `REMOTE` means), while `agent-runner` R36, the class itself, is CONDITIONAL on R38's proof and was never built (`src/worker.mjs` exports `AgentRunner` and `ContainerProxy` only). Removing the binding from `agent-worker` would disable the assistant's path, which K3717 forbids; building the conversation would be assistant work, which K3717 also forbids. The one change that does neither: `agent-runner` exports a no-container `RemoteSession` that answers `GET /remote/version` as unavailable and refuses everything else `REMOTE_UNAVAILABLE`, with its migration declared; `agent-worker`'s R110 then answers `ASSISTANT_REMOTE_NOT_READY` as it would with no remote. Job FR-14 (`agent-runner`). The check that makes this fail locally is `bundler`'s (wave 1, FR-02).
2. **The op declaration is made once, by its owner (K4168), and the shape is fixed here so everything after wave 1 can work at once.** Each owner exports `DECLARED_OPS` beside its `*Ops` map (section 3). Wave 1 gives `op-declarations` and `op-grades` the registration, the shape check and the agreement check, `test-support` the helper and the collector, and `interface-shell` the guard. Owners with a behaviour change declare their own ops in their own jobs; every other owner's declarations are made by the one mechanical pass (section 4a, `build/plan/fix-round-T51-pass.md`) between wave 1 and wave 2, so wave 2 starts with its ops declared and the guard able to check the screens. The `plane` (wave 2) calls the registration at start-up with every module's declaration. A late registration, a duplicate op, and an owner row that disagrees with a hand row each stop the start naming the op.
3. **Hand rows stay this tranche.** K4168: 'their hand rows stay until each owner next declares its own and are then removed'. This round makes the owners' declarations (whole, for every op a job names; fields-checked against the hand rows where both exist). Deleting the superseded hand rows in `op-declarations`, `op-grades` and `control-plane`'s `owner-ops.mjs` is listed in section 7 with its P19 reason.
4. **C62's queue doors are declared by their producers (K4171), not added to `OBLIGATION_DOORS`** (the draft had proposed the hand-list amendment): `queue` (FR-23) reads them from `tasks` and `queue-producers`. If that changes a service those two provide, `queue` posts a QUESTION.
5. **C83 is closed.** DEC-376 reads the census's C83 as meant ('an ownerless project is hidden until an administrator takes it over, by design'), so the draft's R95 is dropped; C84 stays (the administrator is led to the ownerless project). C14 and C58 are meant as the registry draws them: built. C32 is built as the draft said (the version references), the arbitrary two-version compare staying owed (DEC-330).
6. **C33:** the facet counts are not drawn (DEC-376); the frontier's four levels and look states are built after the job reads what R44/R56 already draw. **C52:** the second address part is `interface-shell` R105 (wave 1), read by `screens-inquiry`.
7. **C12, C49 and C62 are built with their screens (DEC-378)**: `case-inputs`, `case-import`, `provenance`, `tasks`, `member-roster`, `queue-producers` and `queue` provide; `screens-publish` (details of the work; view under another lens, re-run), `screens-inquiry` (compare with the original) and `screens-daily` (the authority form, endorsement, owner-vote and expertise items) draw. C12 has four details, no classification row (K4185). The controls for the three NO-OP ops C20, C23 and C65 are not drawn in DEC-374 to DEC-378 (checked in the registry and the drawing): they stay in section 7.
8. **One risk for wave 1:** `affordances` checks that every op is graded and every rung backed from `op-grades`' tables. If registration cannot reach its checks without a change in `affordances`, the `op-grades` job posts a QUESTION and BOB adds `affordances` to wave 1 (it is not planned, since nothing in the code says it is needed).

## 3. The contract wave 1 and wave 2 share

- **`DECLARED_OPS`** (an export of an owner module, beside its `*Ops` map): a frozen object keyed by the op's door name (`publish`, not `publishcase`); per op `{classes, machineClasses?, mutating, weight, description, fields: {accepts: [...], requires: [...]}}`; optional `stamps` (from OP_STAMPS' closed set, default `["viewer"]`) and `needs` (a capability, or null for a read) (K4190). Both registrations are named `registerDeclaredOps(rows)` and take `{owner: DECLARED_OPS}` or `[owner, DECLARED_OPS]` pairs, called once before the first read; each module reads only its own keys. op-grades (K4191): `weight` is a rung of `RUNG_LADDER`, a ground of `RUNG_ABSENCE_GROUNDS`, or `read`; `description` a word key the list holds; an optional `refusal` (with `reasoned`); `MACHINE_REFUSALS`, `CONSEQUENCE_STATEMENTS` and `IRREVERSIBLE_WEIGHT` are not declarable (machine refusals stay `affordances`'); refusals `DECLARED_OPS_LATE`, `DECLARED_OP_DISAGREES`, `DECLARED_OP_DUPLICATE`; the plane registers before its first read of any table. `classes`, `machineClasses`, `mutating` and `weight` are the vocabulary of `op-declarations` and `op-grades` as they stand; `description` is a word key (K3930); a `requires` entry is a field name or a list of alternatives, any one of which satisfies it. The two wave-1 requirement lines (`op-declarations` R80, `op-grades` R49) fix the exact spelling; wave 2 reads them after wave 1 merges.
- **`declaredOpHolds`** and **`declaredOpsOf`** (`test-support`, R15, R16): the helper that holds a declaration true against the op, and the collector that finds every module's declaration from `build/modules.json` with no hand list.
- **The guard** (`interface-shell` R104): every screen request is compared with its owner's declared fields; undeclared ops are counted (`declared N of M ops`, today 0 of about 300).
- **Merge order** is `modules.json` order, with providers before their screens; wave 1 merges first in the order test-support, bundler, op-grades, op-declarations, interface-shell (bundler's real-fleet arm is red by name until `agent-runner` merges, accepted as CR-15's was); then the pass; then wave 2 in index order, which puts every owner before the screen that sends its ops.
## 4. The jobs in merge order

| FR | wave | module (index, layer) | model | entries | entries by cause id | after |
|---|---|---|---|---|---|---|
| FR-01 | 1 | `test-support` (6, 1) | sonnet | 1 | K4168 | First of wave 1 (index 6). op-declarations and interface-shell are built against the contract above at the same time and use the helper's code only af |
| FR-02 | 1 | `bundler` (9, 1) | sonnet | 2 | K4176 (2); FR-DEPLOY (K4180, amended by K4186) | Second of wave 1 (index 9). No other job depends on you except `agent-runner`, whose merge turns your real-fleet arm green. |
| FR-03 | 1 | `op-grades` (141, 11) | sonnet | 1 | K4168 | Third of wave 1 (index 141). The `plane` job (wave 2, last) calls your registration; the screens' tests call it through `test-support`. |
| FR-04 | 1 | `op-declarations` (152, 11) | sonnet | 1 | K4168 | Fourth of wave 1 (index 152). `test-support`'s collector, once merged, may be used in your tests; until then use fixture rows. |
| FR-05 | 1 | `interface-shell` (158, 11) | sonnet | 3 | K4164 (3); K4168; C52; DEC-374 to DEC-377 | Fifth of wave 1 (index 158). It merges before every screen job (they run in wave 2 and merge after it). |
| FR-46 | 1 | `wizard-scripts` (140, 11) | sonnet | 1 | R45 (K4196); re-takes the registry, library and front doors at `840099da7c` (DEC-384, K4197) | Wave 1, independent of the other wave-1 jobs; merges before every screen job. |
| FR-41 | 2 | `text-chain` (18, 1) | sonnet | 1 | L6 (K4194) | Index 18: before every module that reads a capture; independent of the other wave-2 jobs. |
| FR-42 | 2 | `pdf-pixels` (27, 1) | sonnet | 1 | L26 (K4194) | Index 27: before `ocr-worker` (31), whose engine changes only if the floor you state is still not met after the redeploy. |
| FR-06 | 2 | `file-scanner` (33, 1) | sonnet | 1 | FR-SCAN (K4182) | Before `file-safety` (index 33 < 49). |
| FR-07 | 2 | `member-roster` (34, 2) | sonnet | 4 | C80; C62 (K4169); C79; C81; K4168 | Before `credentials` (index 34 < 39), `screens-settings`, `queue-producers`. |
| FR-08 | 2 | `project-roster` (37, 2) | sonnet | 2 | C84; K4168 | Before `screens-daily` (index 37 < 163). |
| FR-09 | 2 | `credentials` (39, 2) | sonnet | 2 | C80; K4168 | After `member-roster` (index 34 < 39); before `screens-settings`, `screens-publish` (its ceremony makes the key). |
| FR-10 | 2 | `provenance` (42, 3) | sonnet | 3 | C23; C62 (K4169, UC-046); K4168 | Before `tasks` (index 42 < 143), which asks you for the fact in `taskdecide`. |
| FR-11 | 2 | `capture-sources` (45, 3) | sonnet | 2 | C20; K4168 | Before `plane` (index 45 < 169) and `screens-intake`; `plane` spreads your new ops map and its assembly reads your declaration. The controls are drawn (DEC-381) and built by `screens-intake`. |
| FR-43 | 2 | `acquisition` (46, 3) | sonnet | 2 | L4 (K4194): part 1 the per-stage milliseconds, part 2 the fix the live timings name (BOB sends them by CHANGE) | Index 46: before `capture` (47) and `screens-intake` (162); part 2 waits for the live timings. |
| FR-12 | 2 | `file-safety` (49, 3) | sonnet | 2 | FR-SCAN (K4182); L25 (K4194) | After `file-scanner`. |
| FR-65 | 2 | `reading-pipeline` (52, 4) | sonnet | 1 | L6 (K4194), re-placed from FR-41 `text-chain` (its J3; K4210, K4214) | Index 52: before every module that reads a capture. FR-41 `text-chain` has no entries left. |
| FR-13 | 2 | `connections` (59, 5) | sonnet | 2 | C28; C29; K4168 | Before `screens-inquiry` (index 59 < 164). |
| FR-64 | 2 | `people` (67, 5) | sonnet | 1 | I-32 (DEC-384; screens-investigate J6; K4214): claims and candidates for organizations | Before `screens-investigate` (165). |
| FR-44 | 2 | `inquiry-grammar` (75, 6) | sonnet | 1 | L9 (K4194) | Index 75: before `inquiry` (78), `citation` (81) and `screens-inquiry` (164). |
| FR-45 | 2 | `inquiry` (78, 6) | sonnet | 1 | L9 (K4194) | Index 78: after `inquiry-grammar` (FR-44); before `screens-inquiry` (164), whose entry 35 shows the named finding. |
| FR-35 | 2 | `citation` (81, 6) | sonnet | 3 | C50 (K4189); K4168 | After `inquiry-grammar` (75) and `accepted-work` (76); before `screens-inquiry` (81 < 164) and `screens-publish` (81 < 166), which draw the controls when UX-DESIGN's drawing (HANDOFF B406) merges. |
| FR-14 | 2 | `agent-runner` (97, 6) | sonnet | 1 | K4176 (2) | After `bundler` (wave 1): your merge turns its real-fleet arm green. |
| FR-15 | 2 | `investigation` (101, 7) | sonnet | 2 | C65; K4168 | Before `plane` (index 101 < 169); `screens-inquiry` draws the close control (DEC-381, C65). |
| FR-16 | 2 | `case-import` (116, 8) | sonnet | 3 | C49 (K4169, UC-076); C51 (DEC-374); K4168 | Before `screens-publish` (116 < 166). |
| FR-17 | 2 | `case-inputs` (119, 8) | sonnet | 2 | C12 (K4169, UC-101); K4168 | Before `screens-publish`; its ops map is already spread by `plane`. |
| FR-18 | 2 | `case-authoring` (120, 8) | sonnet | 4 | C1; C5; C6; K4168; L16 (K4194); L16 (DEC-384: code PUBLISH_NO_FINDING, word given) | Before `review` (index 120 < 121) and `screens-publish`. |
| FR-19 | 2 | `review` (121, 8) | sonnet | 6 | C3; C2; C9 (DEC-374); K4168; L14 (review half); L15 (K4194); L14 (DEC-384: title words given) | After `case-authoring`; before `screens-publish` (index 121 < 166). |
| FR-20 | 2 | `filings` (132, 9) | sonnet | 3 | C71; C75 (DEC-377); C71 / C75 / K4168 | Before `screens-action`. |
| FR-36 | 2 | `monitoring` (136, 10) | sonnet | 4 | C56 (R75 to R77); K4168 | After `case-import` (116); before `link-sweep` (136 < 138, which calls its R77) and `screens-intake` (136 < 162). |
| FR-37 | 2 | `link-sweep` (138, 10) | sonnet | 3 | C56 (R13 to R15); K4168 | After `monitoring` (136 < 138); before `screens-intake` (138 < 162). |
| FR-21 | 2 | `tasks` (143, 11) | sonnet | 2 | C62 (K4169, UC-046); K4168 | After `provenance` (42 < 143); before `queue`. |
| FR-22 | 2 | `queue-producers` (146, 11) | sonnet | 2 | C62 (K4169, UC-046); L13 (K4194) | After `member-roster` (34 < 146) and `tasks`; before `queue`. |
| FR-23 | 2 | `queue` (148, 11) | sonnet | 3 | C62 (K4171); C59; C60; K4168; L13 (K4194) | After `tasks` (143) and `queue-producers` (146), before `screens-daily` (148 < 163). |
| FR-39 | 2 | `instance-setup` (150, 11) | sonnet | 1 | C11 (K4164: the website file's one owner) | After `queue-producers` (146) and `queue` (148); before `screens-entry` (150 < 159) and `screens-settings` (150 < 161), which draw its answer. |
| FR-24 | 2 | `screens-entry` (159, 11) | sonnet | 2 | C11 (DEC-374); T-19, T-18 (DEC-384) | After `interface-shell` (wave 1) and `instance-setup` (index 150, FR-39: it answers the website file this screen draws); index 159, the first of the screens. |
| FR-47 | 2 | `screens-wizards` (160, 11) | sonnet | 2 | L27 / T-02 (DEC-384 (U417; K4197)): a step on a subject screen never navigates without its subject; the harness walks the whole library | After `screens-entry` (159) and `wizard-scripts` (140, FR-46); before `screens-settings` (161). |
| FR-25 | 2 | `screens-settings` (161, 11) | sonnet | 13 | C79; C80; C47; C30; C81; C82; C11; L2; L30 (K4194); T-05; T-08; T-14; T-18 (DEC-384) | After `member-roster`, `credentials`, `instance-setup` (index 150, FR-39: it answers the website file), `interface-shell` and `screens-entry`. The mechanical pass has declared the ops of `corpus-export`, `instance-setup` (its other ops), `bias`, `promotion` and `wizard-scripts` (`writinghelp`) before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. |
| FR-26 | 2 | `screens-intake` (162, 11) | sonnet | 10 | C55 (owns and exports the outcome drawing); C17; C18; C19; C56; C20 (DEC-381); C56 named requests and sweeps (when B406 is drawn); L3 (K4194); A1, A2, I-03, I-04, I-02; held "Open it" (DEC-384) | After `interface-shell`, `capture-sources` (45, FR-11: the credential ops), `monitoring` (136, FR-36) and `link-sweep` (138, FR-37), whose own jobs declare the ops the `watching` screen sends. The mechanical pass has declared the ops of `sources`, `people`, `doorbell`, `observation-log`, `capture` and `wizard-scripts` (`writinghelp`) before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. `screens-inquiry` (164) merges after you and imports your C55 outcome drawing. |
| FR-27 | 2 | `screens-daily` (163, 11) | sonnet | 18 | C13; C14; C15; C27; C33 (frontier only); C58; C59; C60; C61; C84; C47 (queue door); C48 (queue and Home door); C62 (DEC-378); L7; L8 (K4194); I-13, I-14; G1, G2, G4, T-15; T-20 (DEC-384) | After `project-roster`, `member-roster`, `tasks`, `queue-producers`, `queue` and `interface-shell`. |
| FR-28 | 2 | `screens-inquiry` (164, 11) | sonnet | 42 | C25; C28; C32; C34; C35; C37; C44; C52; C54; C55 (document half); C64; C85; C21; C22; C24; C29; C31; C36; C39; C57; C9; C48; C46; C49 (DEC-378); (registry); C23 (DEC-381); C65 (DEC-381); C50 (when B406 is drawn); L1; L5; L11; L17; L28; L29; L9 (screen half) (K4194); I-35, A4, A6, I-11; I-19, I-18; I-23, L29, H1; L17 wording; T-06 (DEC-384); entries 36-37 (L20) were uncounted | After `connections`, `case-import` (the rerun ops), `provenance` (42, FR-10: `declareorigin`), `investigation` (101, FR-15: `projectclose`), `citation` (81, FR-35: `citeimported`, `withdrawimported`), `interface-shell` and `screens-intake` (162: you import its C55 outcome drawing; `modules.json` gives you that `uses` edge). The mechanical pass has declared the ops of `provenance-routes`, `progressions`, `hypotheses`, `basis-versions`, `extraction`, `content`, `entities`, `inquiry`, `reevaluation`, `promotion`, `contradiction`, `intent` and `wizard-scripts` (`writinghelp`) before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. (`monitoring` now has its own job, FR-36.) |
| FR-29 | 2 | `screens-investigate` (165, 11) | sonnet | 11 | C26; C68; C40; L2; L10; L21 (due date); L22; L24 (K4194); I-30; I-32; E6 (DEC-384) | After `interface-shell`. The mechanical pass has declared the ops of `progressions`, `lines` and `standards` before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. |
| FR-30 | 2 | `screens-publish` (166, 11) | sonnet | 26 | C1 (user half); C2; C3 (user half); C4; C5; C6; C7; C8; C16; C17 (doorbell); C9 (docket); C53; C10; C51 (withdraw); C12 (DEC-378; K4185); C49 (DEC-378); C50 (when B406 is drawn); L14; L15; L19 (K4194); L14 words; I-29, C1; C4, G6; L16 door; I-20; H2 (DEC-384) | After `case-authoring`, `review`, `case-inputs`, `case-import`, `credentials`, `citation` (81, FR-35: `citeimported`, `withdrawimported`), `interface-shell`. The mechanical pass has declared the ops of `capture`, `sources` and `doorbell`, and the older ops of `citation`, before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. |
| FR-31 | 2 | `screens-action` (167, 11) | sonnet | 21 | C45; C63; C66; C67; C69; C70; C71; C72; C73; C41; C42; C43; C68 (pointer); C74; C75; C76; (registry); L21 (action half) (K4194); E1; E3 (DEC-384); entry 19 (L20) was uncounted | After `filings`, `screens-investigate` (165, entry 13 points to its C68 screen) and `interface-shell`. The mechanical pass has declared the ops of `conformance`, `consequences`, `escalation`, `actions`, `action-plans` and `wizard-scripts` (`writinghelp`) before you start, except any op the pass hands to its owner's own job, which BOB names to you by CHANGE before you send it. |
| FR-32 | 2 | `plane` (169, 11) | sonnet | 4 | K4168; C20; C65; C20; C23; C62; C12; C49 | Index 169: after every owner above and after `op-declarations` and `op-grades` (wave 1); the installer pair and `journey-check` do not depend on it. |
| FR-38 | 2 | `installer-steps` (170, 11) | sonnet | 1 | K4176 (1) R33 (the part in `newgroup/src/steps/`) | Before `installer` (170 < 171), which finishes R33 on top of it. |
| FR-33 | 2 | `installer` (171, 11) | sonnet | 2 | K4176 (1) R33 (the part outside `newgroup/src/steps/`); K4176 (1) R11 | After `installer-steps` (170, FR-38); independent of the other owners. |
| FR-34 | 2 | `journey-check` (174, 11) | sonnet | 1 | E (walk-T51-findings group E; `build/plan/deadends-T51/walk-E-trace.md`) | Index 174, last overall. |

### 4a. The mechanical pass between wave 1 and wave 2 (replaces the 32 declaration-only jobs)

One worker (sonnet, medium) in BOB's session, after wave 1 has merged and before wave 2 starts, with no job running (mechanics §5.10, P7). **Rule, in two lines:** for every op a screen of this round calls that the guard counts undeclared and whose owner has no wave-2 job, the owner declares it in `DECLARED_OPS` in the shape wave 1 defines (class, mutating, weight and description copied from the op's existing hand rows; `accepts` and `requires` read from the owner's own arm; an honesty test with test-support's helper). Where the arm, the hand row or the requirement leaves anything to judge, the worker declares nothing for that op and the module is handed to its own wave-2 job. The module list is read from the guard's own census after wave 1, never from a hand list; the proof is the whole module suite (`.github/scripts/module-tests.mjs`), `checks/run.mjs` and the generated artifacts run once, every red fixed in the pass, none accepted. Full text: `build/plan/fix-round-T51-pass.md`.

## 5. Where each cause is placed

| cause | what | placed in |
|---|---|---|
| C1 | every publish refused | FR-18 case-authoring; FR-30 screens-publish |
| C2 | case editor lacks fields | FR-19 review; FR-30 screens-publish |
| C3 | Save drops findings | FR-19 review; FR-30 screens-publish |
| C4 | key box only after a refusal | FR-30 screens-publish |
| C5 | disclosures with no control | FR-18 case-authoring; FR-30 screens-publish |
| C6 | second confirmation | FR-18 case-authoring; FR-30 screens-publish |
| C7 | pages omit data | FR-30 screens-publish |
| C8 | always 'not compliant' | FR-30 screens-publish |
| C9 | reopen and next edition | FR-19 review; FR-28 screens-inquiry; FR-30 screens-publish |
| C10 | check a file | FR-30 screens-publish |
| C11 | website file | FR-39 instance-setup (answers the file); FR-24 screens-entry; FR-25 screens-settings (both only draw it) |
| C12 | standard details | FR-17 case-inputs; FR-30 screens-publish; FR-32 plane |
| C13 | nothing leads to Held captures | FR-27 screens-daily |
| C14 | Vouch for photos | FR-27 screens-daily |
| C15 | nothing leads to Inbox | FR-27 screens-daily |
| C16 | doorbell receipt | FR-30 screens-publish |
| C17 | a source | FR-26 screens-intake; FR-30 screens-publish |
| C18 | leads | FR-26 screens-intake |
| C19 | render and archive | FR-26 screens-intake |
| C20 | source login | FR-11 capture-sources; FR-26 screens-intake (DEC-381); FR-32 plane; `capture-requests` `capturerequestretry`: haiku declaration job (section 7) |
| C21 | OCR and completeness | FR-28 screens-inquiry |
| C22 | confirm a transcription | FR-28 screens-inquiry |
| C23 | declare origin | FR-10 provenance; FR-28 screens-inquiry (DEC-381); FR-32 plane |
| C24 | route can be shown | FR-28 screens-inquiry |
| C25 | Thread | FR-28 screens-inquiry |
| C26 | first flow | FR-29 screens-investigate |
| C27 | Themes door | FR-27 screens-daily |
| C28 | choose the mention | FR-13 connections; FR-28 screens-inquiry |
| C29 | assert a connection | FR-13 connections; FR-28 screens-inquiry |
| C30 | export the record | FR-25 screens-settings |
| C31 | wrong match | FR-28 screens-inquiry |
| C32 | versions as dates | FR-28 screens-inquiry |
| C33 | Find (frontier) | FR-27 screens-daily |
| C34 | Narrow | FR-28 screens-inquiry |
| C35 | Keep a hunch | FR-28 screens-inquiry |
| C36 | change a hunch (revise and withdraw; the hunch-graded leg is not built: K1467, hunches are never legs) | FR-28 screens-inquiry |
| C37 | strength omits legs | FR-28 screens-inquiry |
| C39 | divide a question | FR-28 screens-inquiry |
| C40 | in force on a date | FR-29 screens-investigate |
| C41 | determination | FR-31 screens-action |
| C42 | consequences | FR-31 screens-action |
| C43 | escalation controls | FR-31 screens-action |
| C44 | Matter/Action rows | FR-28 screens-inquiry |
| C45 | blank tier row | FR-31 screens-action |
| C46 | objective | FR-28 screens-inquiry |
| C47 | bias | FR-25 screens-settings; FR-27 screens-daily |
| C48 | contradiction | FR-27 screens-daily; FR-28 screens-inquiry |
| C49 | regrade and rerun | FR-16 case-import; FR-28 screens-inquiry; FR-30 screens-publish; FR-32 plane |
| C50 | cite another team's finding; take it back (K4189) | FR-35 citation; FR-28 screens-inquiry (question) and FR-30 screens-publish (imported), both when B406 is drawn |
| C51 | withdraw an acceptance | FR-16 case-import; FR-30 screens-publish |
| C52 | acts bind home project | FR-05 interface-shell; FR-28 screens-inquiry |
| C53 | sever citations | FR-30 screens-publish |
| C54 | Watch for changes | FR-28 screens-inquiry |
| C55 | Check now | FR-26 screens-intake (owns and exports the outcome drawing); FR-28 screens-inquiry (imports it) |
| C56 | watching; named requests and sweeps (K4189) | FR-26 screens-intake; FR-36 monitoring; FR-37 link-sweep; the controls when B406 is drawn |
| C57 | reminders to look again | FR-28 screens-inquiry |
| C58 | Defer | FR-27 screens-daily |
| C59 | snooze | FR-23 queue; FR-27 screens-daily |
| C60 | definition_version | FR-23 queue; FR-27 screens-daily |
| C61 | queue items open nothing | FR-27 screens-daily |
| C62 | authority decision | FR-07 member-roster; FR-10 provenance; FR-21 tasks; FR-22 queue-producers; FR-23 queue; FR-27 screens-daily; FR-32 plane |
| C63 | due-date door | FR-31 screens-action |
| C64 | stage needs | FR-28 screens-inquiry |
| C65 | close a project | FR-15 investigation; FR-28 screens-inquiry (DEC-381); FR-32 plane |
| C66 | reply form | FR-31 screens-action |
| C67 | records request offices | FR-31 screens-action |
| C68 | office records lines | FR-29 screens-investigate; FR-31 screens-action |
| C69 | counsel door | FR-31 screens-action |
| C70 | tier door | FR-31 screens-action |
| C71 | approval resolutions | FR-20 filings; FR-31 screens-action |
| C72 | text preparation door | FR-31 screens-action |
| C73 | plan forms | FR-31 screens-action |
| C74 | contact | FR-31 screens-action |
| C75 | template | FR-20 filings; FR-31 screens-action |
| C76 | exhibit grades | FR-31 screens-action |
| C79 | withdraw expertise | FR-07 member-roster; FR-25 screens-settings |
| C80 | founder | FR-07 member-roster; FR-09 credentials; FR-25 screens-settings |
| C81 | cover-name pairing | FR-07 member-roster; FR-25 screens-settings |
| C82 | copy health | FR-25 screens-settings |
| C84 | ownerless project door | FR-08 project-roster; FR-27 screens-daily |
| C85 | names are links | FR-28 screens-inquiry |
| E | the walk's stall | FR-34 journey-check |
| L1 | document page: vouch box never drawn (reads `rows`, plane answers `held`) | FR-28 screens-inquiry |
| L2 | pickers list only held documents, never vouched (option (a): each screen fixes its own reads, K4194) | FR-29 screens-investigate (six reads and `docChoice`); FR-25 screens-settings (`grouprules.mjs`) |
| L3 | a capture of bytes the store holds files nothing | FR-26 screens-intake |
| L4 | address capture takes 16-27 s; per-stage milliseconds first | FR-43 acquisition (new job) |
| L5 | a web page's reading drawn whole, 481 Cite buttons | FR-28 screens-inquiry |
| L6 | page furniture and template tokens as passages (BOB's ruling K4194) | FR-41 text-chain (new job) |
| L7 | "What this search covered" ends mid-sentence (`why`) | FR-27 screens-daily |
| L8 | "Somebody has looked everywhere" with one level read | FR-27 screens-daily (extends C33) |
| L9 | partition refused when a leg cuts against (cutting legs never in a ground, K4194) | FR-44 inquiry-grammar; FR-45 inquiry; FR-28 screens-inquiry (named finding) |
| L10 | an organisation's page asks person facts (fixed in the screen, K4194) | FR-29 screens-investigate |
| L13 | Home and Queue take 4-8 s (measure per feed, then fix) | FR-23 queue (per-feed milliseconds); FR-22 queue-producers (bounded reads) |
| L14 | draft title is a paragraph of capitals | FR-19 review (`title`: `review.title.draft`/`.untitled`, body `review.body.nocase`); FR-30 screens-publish (headings, entries 18 and 21; words given by DEC-384) |
| L15 | reader sees the question as raw file text | FR-19 review (`statement`); FR-30 screens-publish (draw it) |
| L16 | publish with no finding refused with the action request's sentence | FR-18 case-authoring (own code `PUBLISH_NO_FINDING`, BOB confirms the name; word given by DEC-384); FR-30 screens-publish (entry 24: the door "Add a finding") |
| L17 | "Conclude" asks for a reason it draws no field for | FR-28 screens-inquiry (entry 41: required box `question.conclude.reason`, DEC-384) |
| L19 | owner never sees the reader's comment | FR-30 screens-publish |
| L21 | "Remind me" shows nothing | FR-31 screens-action (action half); FR-29 screens-investigate (due-date half) |
| L22 | due-date head "'s reply" with no name | FR-29 screens-investigate |
| L24 | Standard path shows the project's raw id | FR-29 screens-investigate |
| L25 | `not_scanned` notes grow without bound | FR-12 file-safety |
| L26 | photographed pages read at 43% of their words (preparation first, K4194) | FR-42 pdf-pixels (new job); `ocr-worker`'s model only if the floor is still not met after the redeploy |
| L28 | project page's Calculation row opens "Nothing is here" | FR-28 screens-inquiry (extends C44) |
| L29 | strength sentence names raw ids, three times | FR-28 screens-inquiry (extends C37) |
| L30 | member row link built from the cover name | FR-25 screens-settings |
| L27 | the welcome wizard's step 4 lands on "Nothing is here" | FR-47 screens-wizards (new job; DEC-384: a step on a subject screen never navigates without its subject; the harness walks the library) |
| DEC-384 capture (A1, A2, I-03, I-04, I-02; I-34 open) | progress, status line, title, existed link | FR-26 screens-intake entry 9 |
| DEC-384 held, doorbell (I-20) | "Open it" on an ineligible row; the knock reference | FR-26 entry 10; FR-30 entry 25 |
| DEC-384 document (A4, A6, I-11, I-35, I-19, I-18) | cite options, no marks, watch/unwatch, inline safe view, scanner line | FR-28 entries 38, 39 |
| DEC-384 question (I-23, L29, H1, L17, T-06) | `{legs}` titles, Remove a citation at 390, Conclude's reason, stand down | FR-28 entries 40, 41, 42 |
| DEC-384 Find, Queue, Home, start (I-13, I-14, G1, G2, G4, T-15, T-20) | | FR-27 entries 16, 17, 18 |
| DEC-384 Standard, People, due date (I-30, I-32, E6) | | FR-29 entries 9, 10, 11 |
| DEC-384 case and review (L14, I-29, C1, C4, G6, L16 door, H2) | | FR-30 entries 21 to 24, 26 |
| DEC-384 plan (E1, E3) | | FR-31 entries 20, 21 |
| DEC-384 settings and join (T-05, T-08, T-14, T-18, T-19) | | FR-25 entries 10 to 13; FR-24 entry 2 |
| DEC-384 shell (T-07 weight marks, reasoned acts asking, T-10 tips, 390 px CSS) | | FR-05 (CHANGE B17): recorded here only |
| L11 | "Stop using this copy" shows nothing | FR-28 screens-inquiry (success and re-read placed; its code awaits the live `select` answer, which BOB confirms before the START) |
| L23 | a redraw empties a chosen file | FR-05 interface-shell: sent as a CHANGE (K4194); recorded here only |
| K4176 (1) | installer R33, R11 | FR-38 installer-steps (R33's part in `newgroup/src/steps/`); FR-33 installer (the rest of R33, R11) |
| K4176 (2) | release coherence | FR-02 bundler (the check), FR-14 agent-runner (the class) |
| FR-DEPLOY (K4180, K4186) | unsigned test deploys from a named branch | FR-02 bundler (the scripts); the workflow file is BOB's |
| FR-SCAN (K4182) | scanner signatures | FR-06 file-scanner, FR-12 file-safety |
| K4168 | the declarations | wave 1 (FR-01, FR-03, FR-04, FR-05) and every declaring job; the plane's own assembly FR-32 plane |

**Live walk (K4194), not placed yet — awaiting the live read (`build/plan/walk-T51-live/live-reads.md`) / UX-DESIGN B411:** L12 (the Queue's "Contradictions to clear up" feed: the live `op=queue` answer names the throw site; FR-22 then gets its entry); L18 ("Prepare the draft" leaves both boxes empty: the live `reviewcopy` answer; FR-19 / FR-30); L20 (starting an action from an option is refused: the live `optionstart` answer; FR-31 or a new `action-plans` job); L27 is now placed (DEC-384, K4197: FR-47 `screens-wizards`); L17, L16 and L14 have their words (DEC-384); I-34 (the timestamp progress's act) is not placed: open for the targeted re-walk. L11's code is placed with the entry above and changes only if the live `select` answer shows otherwise.


## 6. Wave 1 and wave 2: what each job holds

**FR-01 · `test-support`** (wave 1, sonnet, 1 entry): The helper every declaring module's honesty test uses (K4168) and the one collector tests share; nothing else needs it before the wave-2 jobs start.
**FR-02 · `bundler`** (wave 1, sonnet, 2 entries): The coherence check that makes a release whose members cannot deploy together fail on the build machine (K4176), and the deploy scripts of FR-DEPLOY.
**FR-03 · `op-grades`** (wave 1, sonnet, 1 entry): Wave 1's grade half of the op-declaration assembly (K4168): the owners declare, the plane assembles, this module keeps the shapes and the checks.
**FR-04 · `op-declarations`** (wave 1, sonnet, 1 entry): Wave 1's declaration half of the op-declaration assembly (K4168).
**FR-05 · `interface-shell`** (wave 1, sonnet, 3 entries): The guard that compares every screen act's request with its owner's declared fields (K4164 goal 3, K4168), counting the undeclared; the router part C52 needs; and the paths of the six new screens.
**FR-46 · `wizard-scripts`** (wave 1, sonnet, 1 entry): R45 (K4196): re-takes the registry, the library and the front doors at the design commit; since K4197 at `840099da7c` (DEC-384), so the six new screens' acts, the owed acts and the changed step 4 words are there before wave 2.
**FR-06 · `file-scanner`** (wave 2, sonnet, 1 entry): FR-SCAN (K4182): the scanner has never had signatures. After the redeploy BOB confirms the 27 files scan.
**FR-07 · `member-roster`** (wave 2, sonnet, 4 entries): C80 (the provider half), C62's two reads, the withdrawal's behaviour (C79) and the declarations of the four ops the Settings screens and the queue send.
**FR-08 · `project-roster`** (wave 2, sonnet, 2 entries): C84's provider half; `screens-daily` draws the mark.
**FR-09 · `credentials`** (wave 2, sonnet, 2 entries): C80's credentials half.
**FR-10 · `provenance`** (wave 2, sonnet, 3 entries): C23 (NO-OP) and C62's fact (the authority decision).
**FR-11 · `capture-sources`** (wave 2, sonnet, 2 entries): C20 (NO-OP) and the credential ops' own declaration; the controls are drawn (DEC-381) and built by `screens-intake`; the retry op `capturerequestretry` is `capture-requests`' (section 7).
**FR-12 · `file-safety`** (wave 2, sonnet, 2 entries): FR-SCAN's second half (K4182). Live walk (K4194): L25, the `not_scanned` note recorded once per file and reason.
**FR-13 · `connections`** (wave 2, sonnet, 2 entries): C28's provider half and the two connection ops' declaration.
**FR-14 · `agent-runner`** (wave 2, sonnet, 1 entry): K4176 (2): the minimal fix that makes the release deployable as a whole, in the module the requirement says exports the class.
**FR-15 · `investigation`** (wave 2, sonnet, 2 entries): C65 (NO-OP, partly: the existing op is gated on quiet); canon makes a close the owner's recorded act (`project-stage` R2; State Rules K362); `screens-inquiry` draws the control (DEC-381).
**FR-16 · `case-import`** (wave 2, sonnet, 3 entries): C49, built now that Bob ruled 'A' (K4169); its screens are drawn (DEC-378) and are `screens-publish`'s and `screens-inquiry`'s entries; and C51's withdraw op.
**FR-17 · `case-inputs`** (wave 2, sonnet, 2 entries): C12 without its classification row (K4185), built now that Bob ruled 'A' (K4169) and BOB drafted its requirement (K4171). Its screen is drawn (DEC-378) and is `screens-publish`'s entry.
**FR-18 · `case-authoring`** (wave 2, sonnet, 4 entries): C1 (BUG), the ceremony fields of C5/C6, and the three ops' declaration. Live walk (K4194): L16, the case's own refusal code. DEC-384 (K4197): the code `PUBLISH_NO_FINDING` is given.
**FR-19 · `review`** (wave 2, sonnet, 6 entries): C3 (BUG), C2's provider half, C9's draft, and the `casedraft` declaration. Live walk (K4194): L14's short `title` and L15's `statement`. DEC-384 (K4197): the title words are given.
**FR-20 · `filings`** (wave 2, sonnet, 3 entries): Declares `filingapprove`, `templatesave`: the ops the newly drawn controls send, so interface-shell's guard checks them (K4168).
**FR-21 · `tasks`** (wave 2, sonnet, 2 entries): C62's one op (UC-046).
**FR-22 · `queue-producers`** (wave 2, sonnet, 2 entries): C62's two reads' consumers: the items the record routes to a member. Live walk (K4194): L13, bounded reads for every feed.
**FR-23 · `queue`** (wave 2, sonnet, 3 entries): C62's door boundary, and the two declarations C59/C60 need. Live walk (K4194): L13, the per-feed milliseconds.
**FR-24 · `screens-entry`** (wave 2, sonnet, 1 entry): C11 (DEC-374) on `setup`: drawing (not building) the file `instance-setup` answers (FR-39): the file a non-technical administrator needs to verify the team's domain. DEC-384: the join label and the setup recorder (T-19, T-18).
**FR-47 · `screens-wizards`** (wave 2, sonnet, 2 entries): L27 (DEC-384 (U417; K4197)): a step on a subject screen never navigates without its subject (with a question the most recent; with none the card shows `step4.none.*` in place and the door opens the project choice, then a new question), and a harness test that walks every step of every script of the library and fails any step landing on "Nothing is here". Merges after `screens-entry` and `wizard-scripts`.
**FR-25 · `screens-settings`** (wave 2, sonnet, 9 entries): C79, C80, the new `bias` screen (C47), C30, C81, C82, C11 (the team's page: draws the same `instance-setup` answer). Live walk (K4194): L2 (the group rules' picker) and L30. DEC-384 (K4197): T-05, T-08, T-14 (the scanner form's labels), T-18.
**FR-26 · `screens-intake`** (wave 2, sonnet, 8 entries): C55 (capture half; owns and exports the outcome drawing `screens-inquiry` imports) and the controls DEC-375 draws on intake: C17, C18, C19, C56; C20's controls (DEC-381); and, when B406 is drawn, C56's named requests and sweeps. Live walk (K4194): L3, a capture of bytes the store holds is filed. DEC-384 (K4197): the capture screen's progress, status, title and existing-document link (A1, A2, I-03, I-04, I-02) and the held row's door.
**FR-27 · `screens-daily`** (wave 2, sonnet, 15 entries): C13, C14, C15, C27, C33 (frontier), C58, C59, C60, C61, C84, and the two doors to the new screens. Live walk (K4194): L7 and L8. DEC-384 (K4197): Find (I-13, I-14), the Queue and Home (G1, G2, G4, T-15) and the start form (T-20).
**FR-28 · `screens-inquiry`** (wave 2, sonnet, 35 entries): The draft's twelve (C25, C28, C32, C34, C35, C37, C44, C52, C54, C55, C64, C85), the DEC-374/375 controls of the document, question and project pages (C21, C22, C24, C29, C31, C36, C39, C57, C9), the two new screens (C48, C46), the controls DEC-381 draws for C23 and C65 and, when B406 is drawn, C50. C55's outcome drawing is imported from `screens-intake`. C83 is closed (DEC-376: the rescue for a hidden project is as meant). Live walk (K4194): L1, L5, L11, L17, L28, L29 and the named finding of L9. DEC-384 (K4197): entries 38 to 42 (the document's cite, watch, safe view and scanner line; the strength titles; Conclude's reason; stand down).
**FR-29 · `screens-investigate`** (wave 2, sonnet, 8 entries): C26 and the controls DEC-374/375 draw on `person` and `standard`. Live walk (K4194): L2 (six reads and `docChoice`), L10, L21 (due date), L22, L24. DEC-384 (K4197): the Standard's crumb, the organization page, the due date with no rule.
**FR-30 · `screens-publish`** (wave 2, sonnet, 20 entries): The case-to-publication path (C1 to C8, C16) and the controls DEC-374 to DEC-377 draw on the ceremony, docket, case editor, published page, imported page and doorbell (C6, C9, C10, C17, C51, C53) and, when B406 is drawn, C50's control on `imported`. Live walk (K4194): L14, L15, L19. DEC-384 (K4197): entries 21 to 26 (the draft title, review copy and editor, comments and acknowledgements, the no-finding door, the doorbell reference, the crumb before joining).
**FR-31 · `screens-action`** (wave 2, sonnet, 18 entries): The draft's C45, C63, C66 to C73 and the DEC-374/376/377 controls (C41, C42, C43, C68 pointer, C74, C75, C76). Live walk (K4194): L21 (action half). DEC-384 (K4197): the plan (E1, E3).
**FR-32 · `plane`** (wave 2, sonnet, 4 entries): The second half of the op-declaration assembly (the plane's own assembly by its static imports; `test-support`'s collector is test tooling only), and the spreads of the new ops maps.
**FR-33 · `installer`** (wave 2, sonnet, 2 entries): R33 (the part outside `newgroup/src/steps/`) and R11, the reds of K4176 that stop any team from installing 0.86.0.
**FR-34 · `journey-check`** (wave 2, sonnet, 1 entry): Group E: the walk's stall, one cause in one place, with the equivalence proved offline.
**FR-35 · `citation`** (wave 2, sonnet, 3 entries): C50 (K4189): citing another team's accepted finding from a question and taking it back, and the declaration of the two ops.
**FR-36 · `monitoring`** (wave 2, sonnet, 4 entries): C56: the door to a bundle's named requests, their read, the one writer of the gathering file, and the declaration of the two new ops.
**FR-37 · `link-sweep`** (wave 2, sonnet, 3 entries): C56: the two doors that define and ratify a sweep, and their declaration.
**FR-38 · `installer-steps`** (wave 2, sonnet, 1 entry): K4176 (1) R33, the part of the memory red that sits in `newgroup/src/steps/` (K4164: the fix in the module that owns the cause); merges before `installer`.
**FR-39 · `instance-setup`** (wave 2, sonnet, 1 entry): C11: `groupdomainset` and `groupidentity` answer the exact website file the verifier accepts, so both screens only draw it.
**FR-41 · `text-chain`** (wave 2, sonnet, 1 entry): L6 (K4194): the reading of a captured page is its content; `nav`, `role="navigation"`, skip links and unresolved template tokens are not passages. The amending requirement line is written in the job's record for BOB (`reading-pipeline` R32).
**FR-42 · `pdf-pixels`** (wave 2, sonnet, 1 entry): L26 (K4194): deskew, contrast/binarisation and scale-up of low-resolution pictures before the engine, and a stated floor proposed from its fixtures; `ocr-worker`'s model changes only if the floor is still not met after the redeploy's measurement.
**FR-43 · `acquisition`** (wave 2, sonnet, 2 entries): L4 (K4194): per-stage milliseconds in `acquire`'s answer, then the fix of the stage the live timings name (BOB sends them after the redeploy by CHANGE). K3658: sites that refuse or are slow from the Worker's addresses are outside the product; never work around bot protection.
**FR-44 · `inquiry-grammar`** (wave 2, sonnet, 1 entry): L9 (K4194): the totality rule of C-2.8 counts supporting legs only; a leg that cuts against is never in a ground.
**FR-45 · `inquiry`** (wave 2, sonnet, 1 entry): L9 (K4194): cutting legs are left unlabelled; the strength is the supporting legs'. Merges after FR-44; `screens-inquiry` then shows the named finding.

## 7. Left out, with the hard reason (P19: only the three)

Reasons: **(1)** a decision of Bob's not yet made (P5, P17); **(2)** a deployment or measurement that cannot happen inside the tranche; **(3)** something outside the product that does not yet exist.

| item | why it is not in a job | reason |
|---|---|---|
| C51 rejecting an import; public acceptance with dependencies | DEC-92's open remainder is Bob's (DEC-374); the withdraw of an acceptance is placed (FR-30, FR-16) | (1) |
| C78 starter kit and principles | DEC-91, deferred by Bob until the new interface is stable (DEC-374: its trigger has not come) | (1) |

**Placed in T51 by BOB #230's review (K4189; P10, P19: none had a hard reason):**
- **The controls for the three NO-OP ops** (C20 supply a source login and retry a refused capture, C23 declare a document's origin, C65 close a project with a reason): the ops are served and declared in this round (FR-11, FR-10, FR-15, FR-32). UX-DESIGN has drawn the controls (DEC-381, merged into the tranche @ 566262a683; HANDOFF B405), so they are built directly by their screen jobs: `screens-intake` C20 (FR-26), `screens-inquiry` C23 and C65 (FR-28). **`capturerequestretry`** (owner `capture-requests`; C20's retry, existing, hand rows only) is declared by a haiku job on `capture-requests`, placed in T51: BOB sends that job before `screens-intake` is told to send the op, since `screens-intake` sends it only after its declaration has merged (the guard counts it undeclared otherwise).
- **C50, C56's cadenced named requests and ratified sweeps; C36's hunch-graded leg.** C50 and C56 were listed here as Bob's for want of a requirement; each has canon and a requirement already (C50: inquiry R7, Roadmap §11, Publication §3 rule 5, DEC-92; C56: monitoring R27 to R29, the Intake Doctrine's standing intent), so they are BOB's to build (rulings-active §1: answered by canon). Their requirement lines are written (K4189) and each has a job: **FR-35 `citation`** (C50's two ops), **FR-36 `monitoring`** (named requests, their read, the one writer of the gathering file) and **FR-37 `link-sweep`** (define and ratify a sweep). Their controls (C50: `screens-inquiry` question, `screens-publish` imported; C56: `screens-intake` `watching`) go to UX-DESIGN as HANDOFF B406 and are built by those screen jobs, as a CHANGE from BOB, when the drawing merges. **C36's hunch-graded leg is not built** (Bob's K1467: hunches are never legs); C36's hypothesis revise and withdraw controls stay in `screens-inquiry`.
- **The mark and the asking agree everywhere (K4199):** after wave 2, every act marked "Asks for a reason" asks before it runs and the marks of acts that run on press (sign-in and own-account acts: `enroll`, `knock`, `reauth`, `recover`, `setpassword`, `ask`, `infolevelset` and the like) are lowered at their source (the kit's weights, UX-DESIGN; `op-grades` `MARKS`), so `interface-shell` R107's own set is replaced by the rule; done in the round's second pass.
- **The words check's two new arms (K4208 (2))**: pattern and prefix copies of a row's sentence in tests, and "group" for a team in member-read text held in code; then one mechanical pass fixing every finding (P7), with the 15 declared rows of B416 once the design rewords them; done in the round's second pass.
- **Held ids named by `test.todo` (K4236; K208, K3717):** coverage reads 4 red, every id held with the assistant: `agent-harness` R17, `agent-runner` R37, R38, R40, `installer-steps` R26, R31, `journey-check` R19. Each gets a `test.todo` naming the id and K3717 in its module's tests, in the second pass's mechanical pass (§5.10, no job running), so the close's coverage reads 0.
- **Removing the superseded hand rows** of `op-declarations`, `op-grades` and `control-plane`'s `owner-ops.mjs` for ops whose owner now declares them (K4168): after this round's redeploy has shown the plane assembling the owners' declarations on biosmoke8 and the guard's count is printed, one mechanical pass (mechanics §5.10, no job running) deletes them, proven by the whole suite, before the final check pass.

Not left out, held or closed: the assistant's `ask` on the `assistant` screen and `agent-runner` R36 (the conversation) are held by Bob (K3717); **C77** (Bob kept DEC-111, K4171); **C83** (as meant, DEC-376); **C14**, **C58** (built as meant); **C33's facet counts** (closed by DEC-376: do not build); **C38** (not a cause: a stale use case, K4166); `deploy-test.yml` is BOB's file (a refused edit is recorded, K3877); Bob's environment and token for it are made (K4184).

## 8. Reading sets

`python3 build/plan/reading-sets.py` takes no module argument (read its header): it prints every module's figure, which counts each used module's whole public part and every test, an upper bound (the standing note of K2053, K2700). Since K3271 a job reads its requirements, entries, layer contract, own code, the used services its entries touch and the tests that name a requirement it changes. By the script, 99 of the 175 modules are over 600 KB, as before this round; the estimate below is that narrower reading (requirements + code + the START + the public parts of the modules named in the START's merge line + 30 KB of design entries for a screen).

| FR | module | script (upper bound) | firm set | estimate with touched services |
|---|---|---|---|---|
| FR-25 | `screens-settings` | 880 KB | 361 KB | 751 KB **over** |
| FR-27 | `screens-daily` | 829 KB | 359 KB | 573 KB |
| FR-28 | `screens-inquiry` | 1130 KB | 488 KB | 1045 KB **over** |
| FR-30 | `screens-publish` | 644 KB | 259 KB | 601 KB **over** |
| FR-31 | `screens-action` | 655 KB | 278 KB | 680 KB **over** |

**Over 600 KB by the estimate: FR-25 `screens-settings` (751), FR-28 `screens-inquiry` (1,045), FR-30 `screens-publish` (601), FR-31 `screens-action` (680).** Fix (mechanics §17): trimming and splitting are not available inside the round (one job per module; the requirements and code are binding), so step 3 applies and each of those STARTs says so: its workers (sonnet, medium) write a task digest of the used modules' public parts for the services its entries touch, each statement citing its source section, before the entries start; the sources stay binding and the job reads any cited section whole. `screens-inquiry` is also the largest job (25 entries): BOB may split it by screen (document, question, project) at a layer boundary; it is planned as one because the rule is one job per module. FR-27 `screens-daily` is at 573 KB: their STARTs carry no digest step, and a job that finds it must read more than its set stops (K3678). Nothing here goes to Bob: a digest is the fix §17 names.

The `installer` figure of the script (26,198 KB) counts the embedded release (`newgroup/src/release.mjs`, generated, 25 MB); excluding it the job's set is about 400 KB. `op-declarations` (2,791 KB by the script) is 412 KB firm.

## 9. After the round

The local walk (journey-check R1 (a)) runs once, after the last merge, and must find nothing (K4111); `FR-34 journey-check` is what lets it finish. The census reruns on the merged tree with the guard's count (`declared N of M ops`) beside it (K4164). Development builds are deployed to the test copy unsigned (FR-DEPLOY); only the alpha release is cut and signed, under `release`, its members passing `bundler` R39 before the cut.


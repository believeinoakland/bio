# Extraction map: legacy-index (`bio-plane/src/index.mjs` and legacy-index's other paths)

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, on `tranche/T18` @ `99295ca732` (the plane's source unchanged since `88289d088a`, K632). The map to empty and retire `legacy-index` (K632: T19's top priority). Written in the form of `legacy-checks.md` §1–§4. BOB turns it into tranche entries.

`legacy-index` (layer 11, after `control-plane`) owns these paths (`modules.json`):
- `bio-plane/src/index.mjs`: **690 lines**;
- `bio-plane/wrangler.jsonc` (155), `package.json` (117), `package-lock.json` (2,028), `.gitignore` (3), `.dev.vars.example` (3);
- `bio-plane/scripts/`: 21 files, 9,140 lines. The most specific path wins, so `fleet-bundle.mjs` and `provenance.mjs` are `bundler`'s and `embed-signpage.mjs` is `signatures'` (K33);
- `bio-plane/migrate/`: 695 lines.

**What `index.mjs` is now.** It is the Worker the plane deploys (`wrangler.jsonc` `main`), in five parts:
- `export default { fetch: makeFetch({ publicOp, gatedOp, publicInstanceGroup }) }`, with `makeFetch` control-plane's;
- `export { Store }` from `control-plane/dispatch.mjs` (the Durable Object class);
- three helpers for refusal rows (C-61, C-68.1);
- `publicOp` (111–326): 12 public ops and the default bootstrap answer, whose handlers mostly live elsewhere already;
- `gatedOp` (329–687): 19 admitted ops and host-governor's block.

Control-plane's extraction (T3–T13) took the admission, the stamps, the op table and the envelope. What is left is the arms whose modules have not taken them (the file's own note at 50–51).

**How it was measured.** The file was parsed with acorn, and each range includes its comment block. Each op arm's owner comes from its requirements: publication R1, R6, R8, R11; provenance R8, R9, R31–R33; connections R26, R27; instance-setup's `op=bootstrap`, `instancegroup`, `groupidentity`, `selftest`, `livefire`, `runtime` and `cpuprobe`; affordances; queue; control-plane R24, R39; and from `build/extraction/control-plane.md`. Each script's callers were found with grep over `package.json`, `.github/`, the product, `test/m/` and the old battery.

**Actions** are as in `legacy-store.md`: move, composition root (the Worker's routing, which stays control-plane's), dead, imports. **T18** marks what the current tranche (K636) already carries.

## 1. The map

### 1a. `src/index.mjs`

| lines | n | what | owner | action |
|---|---|---|---|---|
| 1–46 | 46 | imports and their comments: livefire, setup, sshsig, the catalogue (REQUIRED_ARGUMENT_CHECKS: C-61, control-plane; MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX: record-grammar), publication/worker, affordances, capture, queue, provenance, bias, host-governor, capture ops, monitoring, extraction ops, ratification ops | imports | imports |
| 47 | 1 | export { Store } (the DO class the Worker binds; already control-plane's) | control-plane | composition root |
| 48 | 1 | export { PUBLISHED_TOKEN_HASHES, liveToken }: no product importer of index.mjs (tokens.mjs is runtime-limits') | dead | dead |
| 50–54 | 5 | control-plane imports (makeFetch, json, doAnswer, storeSilent, ... decorateAct, ACT_GATE) | imports | imports |
| 58–67 | 10 | requiredArgumentRow (C-61 row reader) | control-plane | move |
| 70–90 | 21 | requiredArgument (C-61.1 is-required-argument; handed to capture, extraction, monitoring, publication as a hook) | control-plane | move |
| 92–103 | 12 | storageAbsent (C-68.1 is-storage-absent; installationRow is control-plane's) | control-plane | move |
| 105 | 1 | orphan D-533 comment | dead | dead |
| 107–108 | 2 | bindPublishedPlane(...) hook hand-over to publication's worker | control-plane | composition root |
| 110–111 | 2 | publicOp frame | control-plane | composition root |
| 112–129 | 18 | login, invitelook, enroll relays (membership's acts; control-plane R24 relayAnswer) | membership | move |
| 130–152 | 23 | verify (R8) | publication | move |
| 153–174 | 22 | publishedmanifest (R11) | publication | move |
| 176–198 | 23 | instancegroup: which store and which reader (classify, scopeFor, caseReader), then instance-setup's instanceGroupOp | control-plane | move |
| 200–214 | 15 | groupidentity: the same resolution, then instance-setup's groupIdentityOp | control-plane | move |
| 216–233 | 18 | orphan REC-22 public-read-path note (its two ops are publishedcase/publishedbytes) | publication | move |
| 234–257 | 24 | caseflags (R6) | publication | move |
| 259–308 | 50 | casedocument (publication R1) and the signing statement (signatures' caseRatifyStatement). The reader stamp and the secret's hash stay control-plane's and are handed in | publication | move |
| 311 | 1 | publishedcase, publishedbytes dispatch (publishedRoutes is already publication's) | publication | move |
| 312–317 | 6 | knock dispatch (knockOp is capture's) | capture | move |
| 318–325 | 8 | bootstrapReport (the default public answer) | instance-setup | move |
| 326 | 1 | publicOp close | control-plane | composition root |
| 328–330 | 3 | gatedOp frame | control-plane | composition root |
| 332–388 | 57 | op=affordances: actionkinds, the untargeted catalogue (decorateAct handed in: op-declarations is later) | affordances | move |
| 389–421 | 33 | op=affordances: the viewer, identity, author and by stamps (R17), the inner request | control-plane | move |
| 422–445 | 24 | op=affordances: the targeted derivation and answer | affordances | move |
| 447–494 | 48 | op=queue: the inner request with the viewer and member stamps, actionkinds, queueAnswer (ACT_GATE handed in: op-declarations is later) | queue | move |
| 496–512 | 17 | registeraudit (R8, R9: registerAuditReport over the working bucket) | provenance | move |
| 514–518 | 5 | selftest dispatch | instance-setup | move |
| 520–539 | 20 | purge's confirm=<store> gate (control-plane R39, K621). **T18** | control-plane | move |
| 541–552 | 12 | livefire (livefire.mjs is instance-setup's) | instance-setup | move |
| 554–570 | 17 | orphan notes (capture, links) | dead | dead |
| 571–577 | 7 | runtime dispatch (runtimeOp) | instance-setup | move |
| 579–585 | 7 | cpuprobe dispatch (cpuProbeOp) | instance-setup | move |
| 587–614 | 28 | linkproject (connections R26, R27): projectlinks with the viewer and identity stamps handed in | connections | move |
| 616–619 | 4 | governorOp dispatch | host-governor | move |
| 621–622 | 2 | links dispatch | capture | move |
| 624–625 | 2 | capture dispatch (captureObjectOp) | capture | move |
| 627–631 | 5 | pdfstructure dispatch (R31-R35) | extraction | move |
| 633 | 1 | archivelookup dispatch | capture | move |
| 635–645 | 11 | acquire: capture's acquireOp, then extraction's acquireReadingOp, with ACQUIRE_GRADE_NOTE | capture | move |
| 647–679 | 33 | attest (R31-R33) over the working bucket and registerholds | provenance | move |
| 681–682 | 2 | monitor dispatch (monitorOp) | monitoring | move |
| 685–686 | 2 | caseratify, ratify dispatch (ratification/ops.mjs) | ratification | move |
| 687 | 1 | gatedOp close | control-plane | composition root |
| 689–690 | 2 | export default { fetch: makeFetch({publicOp, gatedOp, publicInstanceGroup}) }: the Worker | control-plane | composition root |

### 1b. legacy-index's other paths

| path | lines | what | callers | owner | action |
|---|---|---|---|---|---|
| `migrate/` (`migrate.mjs` 609, `local-plane.mjs` 12, `README.md` 74) | 695 | the Drive-store migration replay | its own old suite only | — | retire (K582). **T18** (legacy-index job, K636) |
| `scripts/coverage.mjs`, `scripts/declared-source.mjs` | 2,754 | the old process's coverage census | old suites only; `regression` reads neither | — | retire (K636 BOB-4). **T18** |
| `scripts/battery.mjs` | 959 | the old battery's runner | `npm test`, `test:hygiene`; 30 old suites | legacy-tests | retire with the old suites at the next release (K619 (3), K635); no release until Bob says (K633) |
| `scripts/armdecay`, `budgetsweep`, `control-register`, `finallyexit`, `identity-claims`, `pensweep`, `residue`, `walkfigure`, `walkfloor` | 4,137 | the old battery's instruments (M0-*, D-237, REC-65) | old suites only (`walkfloor` 13, `armdecay` 8, `walkfigure` 7, …) | legacy-tests | as `battery.mjs` |
| `scripts/d460-fixture`, `d460-perpage-ocr`, `fw20-decode-census`, `ua-probe` | 496 | one-off measurement probes (D-460, FW-20, D-94) | none: no script, suite or workflow runs them; `d460-perpage-ocr` names `index.mjs`' `tier3Extend`, long gone | dead | delete |
| `scripts/build-plane.mjs` | 25 | the plane's committed bundle and manifest (D-298) | `npm run build`; `fleet-bundle.mjs` | bundler | move (bundler's Purpose: "builds each member of the fleet … into one bundled artifact") |
| `scripts/deploy.mjs`, `derive-bindings.mjs`, `resolve-version.mjs`, `jsonc.mjs` | 769 | deploy a signed release; bindings derived from `wrangler.jsonc`; one version across the fleet; the JSONC reader they share | `npm run deploy`; one old suite each | unowned | no requirement names them. Candidates: bundler (one version across the fleet's artifacts), or instance-setup (`FLEET_BINDINGS`, which `derive-bindings` derives). File ownership is BOB's (P17) |
| `wrangler.jsonc`, `package.json`, `package-lock.json`, `.gitignore`, `.dev.vars.example` | 2,306 | the plane Worker's deployment config and package | wrangler, npm, the installer's tests (`installer.md`:92) | control-plane | re-assign. The Worker entry becomes control-plane's (§4), as `agent-worker` and `ocr-worker` own their own `wrangler.jsonc` and `package.json`. `package.json`'s scripts name removed suites (T17's finding, **T18**), and its `test:*` entries go with the old suites |

## 2. Per owner (`src/index.mjs`)

| owner | layer | move | delete (delegation) | composition root | total |
|---|---|---|---|---|---|
| control-plane | 11 | 134 |  | 12 | 146 |
| publication | 8 | 138 |  |  | 138 |
| affordances | 11 | 81 |  |  | 81 |
| imports | — |  |  |  | 51 |
| provenance | 3 | 50 |  |  | 50 |
| queue | 11 | 48 |  |  | 48 |
| instance-setup | 11 | 39 |  |  | 39 |
| connections | 5 | 28 |  |  | 28 |
| capture | 3 | 22 |  |  | 22 |
| dead | — |  |  |  | 19 |
| membership | 2 | 18 |  |  | 18 |
| extraction | 4 | 5 |  |  | 5 |
| host-governor | 3 | 4 |  |  | 4 |
| monitoring | 10 | 2 |  |  | 2 |
| ratification | 8 | 2 |  |  | 2 |
| **all** | — | 571 | 0 | 12 | 653 (+ 37 blank) |

**Notes on the totals:**
- **control-plane (146)** is what stays in the door once the handlers leave:
  - the three row helpers (C-61 `requiredArgumentRow`/`requiredArgument` and C-68.1 `storageAbsent`, 43 lines; K621 moves C-61.1's row to control-plane in **T18**);
  - the purge gate (20, **T18**, R39);
  - the reader and store resolution of `instancegroup` and `groupidentity` (38);
  - `op=affordances`' four stamps (33, R17);
  - the Worker's frame (12).
- **publication (138)** is the public read path: `verify`, `publishedmanifest`, `caseflags`, `casedocument`, `publishedcase`, `publishedbytes`.

**Other paths:**

| owner | lines |
|---|---|
| retire in T18 | 3,449 (`migrate/`, `coverage`, `declared-source`) |
| legacy-tests | 5,096 (the battery and its instruments; they wait for the release) |
| dead | 496 |
| control-plane | 2,306 (config) |
| bundler | 25 |
| unowned (release tooling) | 769 |

## 3. Dead

**`index.mjs` (19 lines):**
- `export { PUBLISHED_TOKEN_HASHES, liveToken }` (48). No product module imports `index.mjs`; `setup.mjs`, `livefire.mjs` and control-plane import `tokens.mjs` directly.
- The orphan D-533 comment (105).
- The orphan capture and links notes (554–570, 17).

Of the imports, all names are read. After the moves, `decorateAct` and `ACT_GATE` are read only by the arms that leave: current.md keeps a re-export in control-plane for them until then.

**Other paths:**
- The four probes (496).
- `migrate/` (695) and `coverage.mjs`/`declared-source.mjs` (2,754) are ruled out (K582, K636) and go in **T18**.

## 4. Order constraints

`legacy-index` is after every product module. So each owner's job removes its arm from `index.mjs` and the rewiring is one import in `index.mjs` (§12.2), as `knockOp`, `monitorOp`, `ratifyOp` and `acquireOp` already show. None of it is blocked by the order, except where an arm needs a later module.

### 4.1 Arms that need a later module (hard)

1. **`op=affordances` (332–445) and `op=queue` (447–494)** read `decorateAct` and `ACT_GATE` (`control-plane/ops.mjs`, which becomes `op-declarations`: after `affordances` and `queue`). The arms move with the gate *handed in* by the door, as affordances' `decorate(act, gate)` (R11) and `queueAnswer(r, {gate})` already take it. The stamps stay control-plane's (389–421, and the viewer and member of 472–473). Only then does control-plane drop its re-export for legacy-index (current.md, control-plane).
2. **`instancegroup`, `groupidentity` (176–214) and `casedocument` (259–308)** resolve the caller through `classify`, `scopeFor` and `caseReader` (admission and control-plane, after `instance-setup` and `publication`). The resolution stays in the door. The handlers (`instanceGroupOp`, `groupIdentityOp` already instance-setup's; `caseDocument` publication R1 with the signing statement) take the resolved store and reader.
3. **`linkproject`** (587–614) and **`pdfstructure`** (627–631) are handed the viewer, identity and author stamps in the same way. `pdfstructure` already is.

### 4.2 The Worker's entry (hard, and last)

`wrangler.jsonc` `main` is `src/index.mjs`. Once every arm has left, what is left is the frame:
- `export default`;
- `export { Store }`;
- `bindPublishedPlane`'s hook hand-over;
- the dispatch lines.

That frame becomes a control-plane file (for example `src/control-plane/worker.mjs`), and in the same job:
- `wrangler.jsonc` names that file;
- bundler's `build-plane.mjs` and the fleet bundle take it as their input, and BOB updates the manifest's generated-artifact rows;
- `dist/bio-plane.bundled.mjs` is regenerated.

Readers of `src/index.mjs` by path must be re-pointed or already gone:
- ocr-worker R16 and agent-worker's four suites (N402, **T18**);
- skills' old `IDX` tests (N53);
- the DEC-49 rows' `where` for C-61.1 and C-68.1 (`src/index.mjs requiredArgument > is-required-argument`, `… storageAbsent > is-storage-absent`), re-pointed with the helpers and stamped by promotion the next tranche;
- the old suites that boot `src/index.mjs` under miniflare (not run, K619).

### 4.3 Moves before moves

| must come first | then | why |
|---|---|---|
| C-61.1's row in control-plane's `checks.mjs` (**T18**, K621) | `requiredArgument` and `requiredArgumentRow` move into control-plane (58–90) | the helper reads the row. Capture, extraction, monitoring and publication already receive it as a hook |
| C-68.1's `installationRow` stays control-plane's | `storageAbsent` (92–103) moves with it | |
| `op-declarations` merged | the affordances and queue arms leave | 4.1 (1) |
| every arm gone | 4.2 | the entry is the last thing in the file |
| the old battery deleted at the release Bob calls (K633, K635) | `scripts/battery.mjs` and its 9 instruments (5,096 lines) can go | `npm test` runs `battery.mjs`, and the old suites import the instruments. **Or** BOB re-assigns them to `legacy-tests`' paths (file ownership, P17), so that `legacy-index` can retire before the release |

### 4.4 The moves, bottom-up

1. **Any tranche.** Delete the 19 dead lines and the four probes.
2. **Layer 2.** membership: the `login`, `invitelook` and `enroll` relays (112–129) into an ops handler of its own, or kept as the door's relays (control-plane R24 governs them).
3. **Layer 3.**
   - provenance: `registeraudit` (496–512) and `attest` (647–679).
   - capture: `knock`, `links`, `capture`, `archivelookup`, `acquire` (the dispatch lines). `acquire` then hands its answer to extraction's `acquireReadingOp`.
   - host-governor: the `governorOp` block (616–619).
4. **Layer 4.** extraction: `pdfstructure`.
5. **Layer 5.** connections: `linkproject`.
6. **Layer 8.**
   - publication: the public read path (130–174, 216–311), with `bindPublishedPlane`'s hook list moving to the door.
   - ratification: `caseratify` and `ratify` (685–686, dispatch only).
7. **Layer 10.** monitoring: `monitor` (681–682).
8. **Layer 11, each after the provider it needs:**
   - affordances and queue: their arms (4.1 (1));
   - instance-setup: `selftest`, `livefire`, `runtime`, `cpuprobe`, `bootstrapReport` (dispatch only);
   - control-plane: the helpers, the purge gate (**T18**), the resolution blocks, then the entry (4.2) and the config files (1b).
9. **legacy-index's own job:**
   - `migrate/` and `coverage.mjs`/`declared-source.mjs` (**T18**);
   - `package.json`'s dead scripts (**T18**);
   - the probes;
   - at the release, the battery and its instruments. Or BOB moves those to `legacy-tests`' paths, and `legacy-index` retires with the entry move.

### 4.5 What remains

Nothing in `index.mjs`: every arm's handler is its module's, and the routing, the stamps and the entry are control-plane's.

Of the other paths:
- the config files are re-assigned to control-plane;
- `build-plane.mjs` goes to bundler;
- the release tooling (769 lines) needs an owner BOB names;
- the battery goes with the old suites.

`legacy-index` then leaves `modules.json`, and its name leaves the `from` of the 11 modules naming it: host-governor, provenance, capture, extraction, publication, ratification, monitoring, affordances, queue, instance-setup, control-plane.

## 5. Requirement changes found

**Change of meaning (Bob's): none found.** Every arm already has a requirement in the module named (§1a), or is dispatch only. The scripts' dispositions are ruled (K582, K619, K633, K635, K636) or are file ownership (P17).

**Wording (BOB's):**
- **The release tooling:** name an owner for `deploy.mjs`, `derive-bindings.mjs`, `resolve-version.mjs` and `jsonc.mjs`, and state their behaviour (a signed release deployed and verified by its bytes; the bindings derived from `wrangler.jsonc`; one version across the fleet). No requirement states it today.
- **bundler:** `build-plane.mjs` among its paths.
- **control-plane:**
  - the Worker's entry and its config files as its own;
  - R24's relays, if the door keeps `login`, `invitelook` and `enroll`;
  - the hand-over of the gate and the stamps to the affordances, queue, linkproject and publication handlers (named as hooks, as in `knockOp`).
- **publication:** `casedocument` composes the signing statement (R1 says what it answers, not that the statement travels with it).
- **membership:** if the relays move, an R naming them.
- **`layers.md`' legacy table:** `index.mjs` is 690 lines, not 13,438.
- **`build/extraction/control-plane.md`:** its ranges (T12) are stale.

# file-safety → security-tools — split map (N943, contingent)

**Status** · Not in use: N943 is closed (K3101, file-safety is 2,280 lines of own code). Kept as a contingency drafted by a helper, unreviewed; BOB reviews it whole before any use.

**Why.** `plan/next.md` N943 and K2934: "its Size line reads 4,671 module lines, past the ~4,000-line split mark". FILE-SAFETY #7 (T47-12) recorded 4,871 (`jobs/T47/file-safety.md`:30).

**Read whole:** `requirements/file-safety.md`, its `modules.json` entry (index 46) and every user's entry, every file in its `paths` (`src/file-safety/index.mjs`, `checks.mjs`, `schema.mjs`, `formats.mjs`, `kinds.mjs`), `extraction/case-authoring-split-2.md`, `extraction/actions-split.md` and `extraction/publication-split-4.md` (the format, and the contingent form), `rulings-active.md`, and K617, K624, K2513, K2934 in `rulings.md`.
**Read in part:** users, by `git grep` over `bio-plane/src` and `bio-plane/test` (bundles excluded), each call site read. Tests were mapped by their headers and the services each file drives.
**Line numbers:** `tranche/T47` @ `e05e0e9799` (after T47-12's merge).

## 0. The answer

**file-safety is under the mark by the rule in force. Recommended: no split. Correct N943's figure with one line.**

| file in file-safety's `paths` | lines (with comments) | without comments |
|---|---|---|
| `src/file-safety/index.mjs` | 1,693 | |
| `src/file-safety/checks.mjs` | 207 | |
| `src/file-safety/schema.mjs` | 159 | |
| `src/file-safety/formats.mjs` | 134 | |
| `src/file-safety/kinds.mjs` | 87 | |
| **file-safety's own code** | **2,280** | **1,859** |
| its tests, `test/m/file-safety/` (11 files) | 2,591 | |
| **what the job's Size line counted** | **4,871** | |

- The Size lines count code and tests. 2,280 + 2,591 = 4,871 exactly (T47-12). At T46-7, 2,248 + about 2,423 = 4,671.
  - K2513 measures a module "over its own code in its `paths` … never its tests or a job's `Size` line" (rulings-active §4).
  - The code itself has grown by 32 lines since T46-7 (`git log` over `src/file-safety/`).
- No other module's path sits inside `src/file-safety/`, and nothing in it is generated. `formats.mjs` imports the readers' own files (`pdfstructure.mjs`, `docx.mjs`, …), which are theirs and not counted here.
- **Reading:** strike N943's premise in one K ("file-safety 2,280 by K2513; no split; N943 closed"), as K2982 struck N909's. Keep the cut below as headroom for the capability that would take file-safety past ~3,900, as K2513 kept agent-worker's map.
- **Doubt 1:** CREDENTIALS #14's Size line, 4,433, is code only. FILE-SAFETY's two Size lines include tests. The record tool, or the job's way of measuring, differs between jobs, and other `next.md` size entries may carry the same error.

**If BOB wants the headroom now,** the seam is **the group's security tools**:
- the catalogue and the tools an administrator adds, tests and removes (R27–R31);
- their use (R32) and the rule `onOwnServers` (R44);
- each tool's monthly allowance and events;
- the reputation tool's spec (R34's `reputationTool`).

They go to a new module **`security-tools`**, placed **directly before** file-safety. file-safety asks it for the tools that are on, their specs and their budgets. security-tools calls nothing of file-safety's: it tells file-safety, through a notice, when a tool is switched on.

| | lines (with comments) |
|---|---|
| file-safety after | about **1,950** (`index.mjs` ~1,460, `checks.mjs` ~145, `schema.mjs` ~122, `formats.mjs` 134, `kinds.mjs` 87) |
| security-tools | about **450** (`index.mjs` ~330, `checks.mjs` ~75, `schema.mjs` ~45) |

Moved by copy: 359 lines (`index.mjs` 257, `checks.mjs` 63, `schema.mjs` 39). The rest is each side's shell, factory and the seam services.

**Other seams weighed, not chosen:**
- *The derived files* (safe view, render, safe copy: R11, R12, R33, R43; about 200 lines). They read R9's `#stateOf`, the bytes, the scanner binding, the notes and the counts, and would need half of file-safety's private helpers.
- *The finding kinds* (`kinds.mjs`, R38; 87 lines). Clean but too small to matter.

## 1. The new module (contingent)

| | `security-tools` |
|---|---|
| purpose | Holds the outside security tools a group enables: the catalogue of what each offered tool is sent and who keeps it, the tools an administrator adds, tests and removes, each with its stated handling, its use and its monthly allowance, and their events for the administrators' notice. Each tool's keys are `credentials`'; what a tool is asked to do with a file is `file-safety`'s. |
| layer | 3 |
| place in `modules.json` | directly after `doorbell` (45), before `file-safety`, which moves to 47: `capture`, `doorbell`, **`security-tools`**, `file-safety`, `sources`. It must come after `credentials` (its keyed services), `membership` and `file-scanner`. It must come before `file-safety`, which calls it. |
| paths / tests | `bio-plane/src/security-tools/` / `bio-plane/test/m/security-tools/`, empty until its COMPLETE (K1043) |
| from | none (K624) |
| uses | `record-grammar` (`canonicalJson`, `sha256HexSync`, `isMachineIdentity`, `MACHINE_CLASS_PREFIX`), `record-core` (`transact`, `declareTable`, `afterCommit`), `membership` (`isAdministrator`, `notAnAdmin`, `listenerRefusal`), `credentials` (`keyedServiceSet`, `keyedServiceSwitch`, `keyedServiceFor`), `file-scanner` (`providers/catalogue.mjs`: `PROVIDERS`, `REFUSED_PROVIDERS`, `HELD_PROVIDERS`, `providerById`, `resolveDescriptor`), and the `FILE_SCANNER` binding for `/provider/test`. Tests: `test-support`. |
| entry point | `securityToolsOf(ctx, { record, membership, credentials, env })` (K61). file-safety's factory creates it (case-account R12's form). `securityToolsOps(t, url, body, env)` is its route map. |
| exports | `securityToolCatalogue`, `securityTools`, `securityToolAdd`, `securityToolTest`, `securityToolRemove`, `securityToolEvents`, `reputationTool`, `onOwnServers`, `TOOL_USES`, `MONTHLY_LIMIT`, `DEEPER_CHECKS_PER_MONTH`, `SECURITY_TOOL_CHECKS`, `PROVIDER_REASON_WORDS`, `SECURITY_TOOLS_TABLES`; and the in-plane services file-safety calls, new: `toolsOn(kind)`, `routineTools(kind)`, `toolRow(id)`, `budgetLeft(tool)`, `spend(tool)`, `switchOff(tool, reason)`, `toolSpec(tool)`, `toolsState()` (R5's share), `onToolSwitched(module, fn)`. |

## 2. What moves (by copy, K624)

| moved | from (file:lines) | lines | file-safety id |
|---|---|---|---|
| `DEEPER_CHECKS_PER_MONTH` | `index.mjs` 50 | 1 | R21 (a tool's default allowance) |
| `MONTHLY_LIMIT` | 62 | 1 | R28 |
| `TOOL_USES`, `onOwnServers` | 69–79 | 11 | R32, R44 |
| `#adminBar`, `#handlingDigest`, `#configOf`, `#toolOut`, `#toolRow`, `#onTools`, `#routineTools`, `#used`, `#budgetLeft`, `#spend`, `#event`, `#switchOff`, `#spec` | 927–986 | 60 | R27–R31 (the primitives) |
| `securityToolCatalogue`, `securityTools` | 988–1010 | 23 | R27 |
| `securityToolAdd` | 1012–1097 | 86 | R28 |
| `#tool`, `securityToolTest`, `securityToolRemove`, `securityToolEvents` | 1099–1162 | 64 | R29–R31 |
| `reputationTool` | 1453–1460 | 8 | R34 |
| ops `securitytoolcatalogue` … `securitytoolevents` (6) | 1683–1690 | 8 | — |
| DDL `fs_tools`, `fs_tool_usage`, `fs_tool_events`; `FILE_SAFETY_ADDITIVE_COLUMNS` (its one column is `fs_tool_events.reason`); the three group rows' classes | `schema.mjs` 94–129, 145–147, 154–158 in part | ~42 | R25's share |
| rows C-140.20–.34 | `checks.mjs` 88–131 | 44 | R24 (R28–R30) |
| C-140.40, .41 | 148–154 | 7 | R28 |
| `PROVIDER_REASON_WORDS` | 200–207 | 8 | R27 |
| C-140.2 `SCANNER_ABSENT` (doubt 3) | 26–29 | 4 | R29's site of R42 |

**In the copy:**
- The table names and DDL are unchanged, so a running store keeps its tools, their usage and their events.
- The six ops keep their names and specs.
- No refusal text, code, number or translation changes. The `where`s become `src/security-tools/index.mjs <fn> > <region>`, and the DEC-49 REGION markers move with their code.
- `#scannerBinding` and `#scanner` (302–316, 15 lines) are copied for `securityToolTest`'s `/provider/test` (K57's small-helper rule). `listLimit`, `memberOf`, `iso`, `parse`, `monthOf` are copied too.
- securityToolTest's two file-safety acts become an `onToolSwitched` notice, called after the commit with `{tool_id, kinds, event}`:
  - the `DELETE FROM fs_wakes WHERE key = 'reputation:<tool>'` (1124);
  - the R40 arming (1125–1129).
- file-safety registers for it at start: it drops that key and arms `forward` or `reputation` exactly as today.

## 3. What stays in file-safety, and how it re-points

**Stays:**
- intake and notes (R1–R3);
- scanning and its state (R4, R5);
- the grade (R6, R7, R20);
- opening the original (R8–R10);
- the safe view and its render (R11, R12, R43);
- the deeper check (R13, R14, R36);
- holds and releases (R15–R19);
- finding kinds (R38);
- the safe copy (R33);
- the reputation note (R34's note half) and the lists' refresh (R41);
- forwarding (R35);
- its cadences and the arming notice (R39, R40);
- R42, R42a;
- `fs_files`, `fs_notes`, `fs_holds`, `fs_deeper`, `fs_copies`, `fs_counts`, `fs_wakes`;
- rows C-140.1, .3–.19, .35–.39, .42, .43, `THREAT_REASONS`.

**The call sites that become `this.tools.<x>`:**
- `#onReceipt`:205 and `renderBatch`:833: `routineTools("cdr")`;
- `scanBatch`:890–893: `routineTools("scan")`, `budgetLeft`;
- `scanStatus`:921–922: `toolsState()`;
- `#providerScan`:1167–1179: `toolSpec`, `spend`, `switchOff`;
- `requestDeeperCheck`:1200–1203: `toolsOn("scan")`, `toolsOn("sandbox")`, `budgetLeft`;
- `#startDeeper`:1249–1263 and `#pollDeeper`:1279–1296: `toolsOn`, `budgetLeft`, `toolSpec`, `spend`, `switchOff`, `toolRow`;
- `#makeCopy`:1379–1386: `toolSpec`, `spend`, `switchOff`;
- `requestSafeCopy`:1413 and `safeCopy`:1432, 1443: `toolsOn("cdr")`, `toolRow`;
- `forwardSecurityCounts`:1497–1498: `toolsOn("log_sink")`, `toolSpec`;
- `refreshReputationLists`:1517–1520: `toolsOn("url_reputation")`, `toolSpec`;
- `forwardWake`:1610 and `reputationWake`:1625: `toolsOn`.

**Added:**
- a getter `tools`, created in `fileSafetyOf` beside credentials;
- `start()` registers with `onToolSwitched`;
- `migrate()` asks `this.tools.migrate()` first;
- `export { DEEPER_CHECKS_PER_MONTH, onOwnServers } from "../security-tools/index.mjs"`, so R21 still exports it by name and `setup-page` keeps its import until it re-points (doubt 2).

## 4. Requirement ids (contingent)

| file-safety | security-tools | what |
|---|---|---|
| R27 | **R1** | `securityToolCatalogue`, `securityTools` |
| R28 | **R2** | `securityToolAdd` |
| R29 | **R3** | `securityToolTest`; a pass turns the tool on |
| R30 | **R4** | `securityToolRemove` |
| R31 | **R5** | `PRIVATE_MODE_NOT_HONOURED` switches a tool off; `securityToolEvents` |
| R32 | **R6** | `use`: `on_request`, `routine` |
| R44 | **R7** | `onOwnServers` |
| R34 (`reputationTool`'s sentence) | **R8** | the first `on` reputation tool's spec, in-plane |
| R21 (`DEEPER_CHECKS_PER_MONTH`), with `MONTHLY_LIMIT`, `TOOL_USES` | **R9** | its constants, exported by name |
| new | **R10** | the in-plane services file-safety asks: `toolsOn`, `routineTools`, `toolRow`, `budgetLeft`, `spend`, `switchOff`, `toolSpec` (credentials read for the one call), `toolsState` |
| R29's and R40's share | **R11** | `onToolSwitched(module, fn)`: after a test that passes or fails, `fn({tool_id, kinds, event})`. A listener that throws changes nothing. |
| R25 (the three group tables) | **R12** | declared, exempt from purge |
| R23's share | **R13** | only a tool spec reaches `file-scanner` from here |
| R24's share | **R14** | its rows, C-140.20–.34, .40, .41 (and .2, doubt 3), numbers and words unchanged |
| R26, R42's `securityToolTest` site, R42a | **R15**, **R16** | no place named; "your group's Civicsmith", "file scanner" |
| new | **R17** | created by file-safety's factory; its ops spread by the plane |

**Retired in file-safety as "moved to `security-tools` R<n>":** R27 → R1, R28 → R2, R29 → R3, R30 → R4, R31 → R5, R32 → R6, R44 → R7.

**Re-worded in file-safety** (meaning unchanged):
- R4, R13, R14, R33, R35, R41: their tools through security-tools R10;
- R5: `tools` through R10's `toolsState`;
- R21: `DEEPER_CHECKS_PER_MONTH` re-exported from security-tools R9;
- R34: its spec half moved to R8; the note stays;
- R40: "a tool switched `on`, R29" read through security-tools R11;
- R42: one of its six sites is security-tools R16;
- R24, R25: its own rows and tables;
- Purpose ("It holds which security tools the group enabled" goes; "it asks the tools the group enabled"), Uses (gains `security-tools`), Status, Size.

**Wording only elsewhere:**
- `credentials` R29 (`security:<tool_id>` keys are set by security-tools R2 and removed by R4);
- `setup-page` R30 (its carried `onOwnServers` source is security-tools R7's);
- `notice-producers` (its tool-events finding names security-tools R5);
- `op-declarations`' file-safety family comment (R32's ops).

**security-tools — requirements draft (mechanics §3).**
- *Public:* Purpose as §1. *Provides:* R1–R11, each as file-safety's R27–R32, R44, R34 (its first sentence's spec half), R21 states it today, with R10 and R11 as above.
- *Private:*
  - *Uses:* as §1's.
  - *Invariants:* R12–R17.
  - *Satisfies:* K1929 (1)–(3), DEC-168, DEC-169 (6), K1946 T1, K1949, N777, N971.
  - *Suggestions:* none.

## 5. Users and what they re-point (contingent)

| user (file:line) | uses today | re-points to | by |
|---|---|---|---|
| `membership` `MODULE_ORDER`, `module-order.test.mjs` | the ids | gains `security-tools` after `doorbell` | membership (L2) |
| `notice-producers` `src/notice-producers/index.mjs`:917, :926 | `fileSafety.securityToolEvents`, `fileSafety.securityTools` | `securityToolsOf`; `uses` gains `security-tools` (keeps file-safety for `scanFindings` :858, `findingKind` :65) | L11 |
| `plane` `src/plane/store.mjs`:493 (`reputation: () => fileSafety.reputationTool()`), :683 (the ops spread); `test/m/plane/maps.mjs`:100, `t36.test.mjs`:202–215 | `reputationTool`, `fileSafetyOps` | `securityToolsOf(ctx).reputationTool`; spreads `securityToolsOps` directly before `fileSafetyOps` | L11 |
| `setup-page` `src/setup-page/index.mjs`:38; `test/m/setup-page/security.test.mjs`:8 | `onOwnServers`, `DEEPER_CHECKS_PER_MONTH` from file-safety | security-tools (file-safety's re-export keeps it green meanwhile) | L11 |
| `op-declarations` `src/op-declarations/index.mjs`:465 (the file-safety family); `test/m/op-declarations/t33.test.mjs`:60, `t36.test.mjs`:133–208 | the six ops in `fileSafetyOps` | names unchanged; tests read `securityToolsOps` for the six | L11 |
| `op-grades` `test/m/op-grades/t36.test.mjs`:39 ("the 23 ops of file-safety's ops map") | the count | 17 and 6 | L11 (test only) |
| `control-plane` `test/m/control-plane/t36-door.test.mjs`:23 | `fileSafetyOps`' keys | both maps | L11 (test only) |
| `store-door` `test/m/store-door/dispatch.test.mjs`:123–124, :483–484 | `fileSafetyOps`' keys | both maps | L11 (test only) |
| `answer-envelope` `src/answer-envelope/families.mjs`:40, :171; `families.test.mjs`:357, :562 | file-safety's `checks.mjs` | adds `src/security-tools/checks.mjs` directly before it; the order test pins it | L11 |
| `scheduler` (`file-reputation` → `refreshReputationLists`, `reputationWake`; `onFileWork`) | file-safety | none: both stay file-safety's | — |
| `affordances` (act-help by op name) | op names | none | — |

## 6. Tests and the copy (contingent)

**Copy:**
1. Create `src/security-tools/index.mjs`, `schema.mjs`, `checks.mjs` from §2, with a header, `class SecurityTools` (ctor `{sql, record, membership, credentials, env, now}`, `migrate()`, `#rows`, `#one`, `#tx`), the R10 and R11 services (about 40 lines), `securityToolsOf`, and `securityToolsOps` (the six routes).
2. Add `modules.json` row 46, `requirements/security-tools.md`, and the `layers.md` row.

**To `test/m/security-tools/`** (a new fixture over the real credentials and membership, and the scripted scanner's `/provider/test`; it may not build file-safety):
- `tools.test.mjs`'s R27–R32 arms and R34's spec arms;
- `absent.test.mjs`'s `securityToolTest` arm (R42);
- `rows.test.mjs`'s rows for C-140.20–.34, .40, .41;
- `setup-page`'s `onOwnServers` cases, copied as R7's.

**Stay in `test/m/file-safety/`, re-tagged:**
- `scan`, `grade`, `intake`, `open`, `view`, `deeper`, `wakes`, `rows` (its own rows);
- `tools.test.mjs`'s R35 forwarding arms and R41 arms;
- the rest of `absent`.

Each drives security-tools' acts in setup, as `fixture.mjs` does through `securityToolAdd` and `securityToolTest` today.

## 7. Red windows and risks (contingent)

1. **Table declarations between the two merges.** Both declare `fs_tools`, `fs_tool_usage`, `fs_tool_events` until FILE-SAFETY's job drops them. Nothing composes both until that job, which creates security-tools in its factory in the same commit (K624). This is case-inputs' risk 1.
2. **Rows in two files inside L3.** C-140.20–.34, .40, .41 are held by both `checks.mjs` files from SECURITY-TOOLS' merge to FILE-SAFETY's; accepted by name, inside L3.
   - After FILE-SAFETY's merge, their `where`s differ from the census until promotion's next stamp. promotion is L2, so this waits for the tranche after (K1750), accepted red by name as T47's census is.
   - The C-140 family then spans two files, C-44's precedent.
3. **Users between L3 and L11.**
   - `notice-producers`' tool events and the plane's reputation spec go red from FILE-SAFETY's merge until L11.
   - *Alternative:* one-line delegates in file-safety for `securityTools`, `securityToolEvents` and `reputationTool` (K2608's form) until L11, deleted in file-safety's next job.
   - The six ops keep answering through the plane only once it spreads `securityToolsOps`. Until then, delegates in `fileSafetyOps` for the six, or the ops are red at the door.
   - *Reading:* delegates (about 12 lines). This is the same choice as credentials-split's doubt 1.
4. **Generated artifact.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, `not_product`) lists `src/file-safety/*.mjs`. It is stale from SECURITY-TOOLS' merge until L3's close, and gains `src/security-tools/*.mjs`. No worker bundle takes file-safety's files (checked over every `*.bundle.json`).
5. **The scanner binding is held twice.** security-tools reads `FILE_SCANNER` for `/provider/test` only. `plane/store.mjs`:390 hands `env` to `fileSafetyOf`, which passes it on, so both see the one binding (`test/m/plane/t36.test.mjs`:162, :275 pin file-safety's).

## 8. Sequence, if BOB splits

1. **SECURITY-TOOLS (new, L3, first; after doorbell):** copy (§2), tests (§6), `modules.json` row 46, requirements. Merges early.
2. **MEMBERSHIP (L2):** `MODULE_ORDER`.
3. **FILE-SAFETY (L3):** deletes the copies, re-points (§3), creates security-tools, retires and re-words (§4).
4. **L11:** notice-producers, plane, setup-page, op-declarations, answer-envelope, and the tests of op-grades, control-plane and store-door (§5). promotion's stamp follows in the next tranche.

## 9. Doubts for BOB

1. **The measure.** N943 and K2934 took the job's Size line, which counted tests. By K2513 file-safety is 2,280.
   - *Reading:* no split; N943 closed by one K; this map kept for reference.
   - Check how the Size line is produced. CREDENTIALS' 4,433 is code only, so other size entries in `next.md` may need the same check.
2. **`DEEPER_CHECKS_PER_MONTH` and `onOwnServers`.** Both are exported by file-safety today (R21, R44) and imported by `setup-page`. If split, both move with the tools and file-safety re-exports them (R21 unchanged).
3. **C-140.2 `SCANNER_ABSENT`.** `securityToolTest` mints it, with file-safety's row (`where` `scanBatch`).
   - If security-tools comes first, it cannot import file-safety's row. Either the row moves to security-tools (its `where` re-pointed to `securityToolTest`'s region; a row change, stamped), or security-tools mints a code of its own. The second changes what R29 and R42 answer, a code a member's screen reads.
   - *Reading:* move the row. It is the smaller change and keeps the code. This is BOB's (K231).
4. **Name.** `security-tools` (DEC-169's "Settings › Security › Security tools"). *Alternative:* `outside-tools`.
5. **Bob's or BOB's.** A size split is BOB's (K617). No requirement changes meaning, and none of this is Bob's. The recommendation is not to split at all.

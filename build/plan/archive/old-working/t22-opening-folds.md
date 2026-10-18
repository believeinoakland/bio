# T22: the folds BOB makes at the opening, before L1

**Status** · Working file by a worker for BOB #89, 2026-10-01, on `prep/T22` @ d3d903fa7d. It lists the exact edits `next.md` ("Folds before each layer", "At the opening, before L1") puts on the tranche branch before L1 starts. Every file:line was read on that commit. The re-cut (a) was dry-run on a scratch copy of the tree. Nothing in `/home/user/bio` was edited except this file and `plan/starts-T22/`.

## (a) The legacy-tests re-cut (K1006, N478; D1, D4, D11, I1)

This applies `plan/draft-legacy-tests-recut.md` §2 as K1006 settled it. `conclude-project.test.mjs` and `docdates.mjs` go to queue, `members.test.mjs` to membership, `bundle.test.mjs` to bundler, and `ocr-measure-probe.mjs` to ocr-worker with `+runtime-limits`.

**`build/modules.json`.** Append each path to the module's `tests` list, and each id to its `uses` list, at the end of the list. Skip any that is already present.

| module (index) | append to `tests` | append to `uses` |
|---|---|---|
| pdf-reader (11) | `bio-plane/test/pdfstructure.test.mjs`, `bio-plane/test/fixtures/cpdf20/`, `bio-plane/test/fixtures/legistar-agenda-1425405.pdf` | `test-support` |
| bundler (5) | `bio-plane/test/system/bundle.test.mjs`, `bio-plane/test/system/deploybindings.test.mjs`, `bio-plane/test/system/fleetbundles.test.mjs`, `bio-plane/test/system/resolveversion.test.mjs`, `bio-plane/test/fleetbundles.control.mjs`, `bio-plane/test/jsonc.mjs` | `test-support` |
| ocr-worker (19) | `bio-plane/test/ocr-measure-probe.mjs` | `runtime-limits` (it already uses `test-support`) |
| record-core (20) | `bio-plane/test/stats-disclosure.test.mjs` | `test-support` |
| membership (21) | `bio-plane/test/members.test.mjs` | `test-support` |
| promotion (23) | `bio-plane/test/d526-refusal-order.test.mjs`, `bio-plane/test/system/row-census.test.mjs`, `bio-plane/test/system/row-census.mjs`, `bio-plane/test/fixtures/row-census-1.51.0.jsonl` | `test-support` |
| provenance (25) | `bio-plane/test/mk6-bundle-names-no-author.test.mjs`, `bio-plane/test/publishingproject.mjs`, `bio-plane/test/adoptable-reading.mjs` | `test-support` |
| capture (28) | `bio-plane/test/cap13-reuse-pages.test.mjs`, `bio-plane/test/d57selflink.test.mjs` | `test-support` |
| extraction (31) | `bio-plane/test/d606-perpage-ocr.test.mjs`, `bio-plane/test/tier2-wire.test.mjs`, `bio-plane/test/tier-pagewise.probe.mjs`, `bio-plane/test/system/pdf-worker-binding.test.mjs`, `bio-plane/test/fixtures/d460/`, `bio-plane/test/fixtures/fw20/`, `bio-plane/test/fixtures/cpdf20/tier2-recorded.json` | `test-support`, `pdf-reader` |
| queue (77) | `bio-plane/test/conclude-project.test.mjs`, `bio-plane/test/docdates.mjs` | `test-support` |
| plane (82) | `bio-plane/test/system/migrate-released.test.mjs` | `test-support` |
| legacy-ui (83) | `civicos-ui/test/`, `bio-plane/test/budget.mjs`, `bio-plane/test/caseceremony.mjs` (its `tests` is `[]` today) | (none: `*earlier`) |
| installer (84) | `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` | `test-support` |

- **Remove** the whole `legacy-tests` entry. It is the last line of `modules` (`build/modules.json`:90), and the comma after `installer`'s entry (:89) goes with it.
- **`status`.** Append this sentence: "AMENDED by BOB #89 at T22's opening, 2026-10-01 (K1006, N478): legacy-tests retired; its 11 deleted paths dropped and its 75 test files re-owned by their modules (plan/draft-legacy-tests-recut.md §2: conclude-project.test.mjs and docdates.mjs to queue, members.test.mjs to membership, bundle.test.mjs to bundler, ocr-measure-probe.mjs to ocr-worker); new uses edges test-support (pdf-reader, bundler, record-core, membership, promotion, provenance, capture, extraction, queue, plane, installer), pdf-reader (extraction), runtime-limits (ocr-worker)."
- **Every new edge points to an earlier module.** `test-support` is index 2, `runtime-limits` is 3 and `pdf-reader` is 11.
- **The file keeps its layout:** one module per line, in the `", "` / `": "` spacing.

**`build/layers.md`.**
- **:17**, layer 11's row: the module list ends `…, control-plane, plane, legacy-ui, installer |`, with `, legacy-tests` removed.
- **:40**, the legacy table's `legacy-tests` row: its file cell starts with the retired note, in the form the retired rows :36–:38 use: `*(retired at T22's opening, 2026-10-01, K1006, N478: its 11 paths deleted, its 75 files re-owned by their modules, `plan/draft-legacy-tests-recut.md` §2)* `. The rest of the row stays as it is.

**`.github/workflows/regression.yml`:44** (`not_product`, BOB's, D4). Re-word the comment "The suites outside test/m that T20 kept (N466, K932; LEGACY-TESTS #18): run from the root." to "The suites outside test/m, each owned by its module since T22's opening (K1006): run from the root." No glob changes, because no file moves.

**The script that applies it.** This is the dry run's own script. It writes the same layout, so the diff is 16 lines in `modules.json` (13 module lines and the status line changed, the legacy-tests line removed) and 2 lines in `layers.md`.

```js
// node recut.mjs <root>
import { readFileSync, writeFileSync } from 'node:fs';
const root = process.argv[2], mf = `${root}/build/modules.json`;
const m = JSON.parse(readFileSync(mf, 'utf8'));
const by = (id) => m.modules.find((y) => y.id === id) ?? (() => { throw new Error(id); })();
const edits = { /* the table above: id → { tests: [...], uses: [...] } */ };
for (const [id, e] of Object.entries(edits)) {
  const x = by(id);
  for (const t of e.tests) if (!x.tests.includes(t)) x.tests.push(t);
  for (const u of e.uses) if (!x.uses.includes(u)) x.uses.push(u);
}
m.modules = m.modules.filter((x) => x.id !== 'legacy-tests');
m.status += ' AMENDED by BOB #89 at T22\'s opening, … (the sentence above)';
const line = (x) => '    ' + JSON.stringify(x).replace(/","/g, '", "').replace(/":/g, '": ').replace(/,"/g, ', "');
writeFileSync(mf, '{\n  "status": ' + JSON.stringify(m.status) + ',\n  "not_product": '
  + JSON.stringify(m.not_product).replace(/","/g, '", "') + ',\n  "modules": [\n'
  + m.modules.map(line).join(',\n') + '\n  ]\n}\n');
// layers.md: the two replacements above.
```

The layout function was checked by a round trip: applied to the unedited `modules.json`, it reproduces the file byte for byte.

**Dry run** (a scratch copy of `prep/T22` @ d3d903fa7d under the session scratchpad, a fresh git repository, the script applied):

| check | before (this tree) | after the re-cut |
|---|---|---|
| `node civicos-process/checks/run.mjs` format | 86 modules, **11 failures** (legacy-tests' deleted paths) | 85 modules, 84 requirements files, **0 failures** |
| architecture | 1186 files, 3731 imports, 0 failures | the same, 0 failures |
| coverage | 2713 of 2713 ids, 0 failures | the same, 0 failures |
| unowned tracked files (`ownerIndex` over `git ls-files`, less `not_product`) | 0 | 0 |
| `node --test 'bio-plane/test/m/**/*.test.mjs'` | | 4815 tests: 4792 pass, **3 fail**, 20 todo |
| `fleetbundles`, `row-census`, `members`, `deploybindings` (from the root) | | 4 of 4 pass, no skip |

**The three failures after the re-cut:**
1. **membership R83**, `bio-plane/test/m/membership/module-order.test.mjs`:12. `MODULE_ORDER` still lists `"legacy-tests"`, at `membership/index.mjs`:183.
2. **membership R79**, `bio-plane/test/m/membership/t9-notice-sight-bounds.test.mjs`:185, for the same cause.
3. **test-support R2**, `bio-plane/test/m/test-support/test-support.test.mjs`:249. This one is environmental. It also fails on the unedited tree. Its non-root child cannot read the proxy's CA bundle in this container ("Ignoring extra certs from `/root/.ccr/ca-bundle.crt` … Permission denied", then `ERR_MODULE_NOT_FOUND`).

**Accepted red 1 is exactly R83 and R79.** Promotion's `registry.test.mjs`:58 (R39, R45, R46), which `next.md` lists under K936's set, stays green. So does membership's other R83 test, at `module-order.test.mjs`:35. BOB names only :12 and :185 in the opening ruling.

**What goes stale, for the STARTs.** BOB drops three paths from `modules.json` at the merges that delete them:
- `bio-plane/test/jsonc.mjs`, deleted by bundler in L1;
- `bio-plane/test/fixtures/fw20/`, deleted by extraction in L4;
- `bio-plane/test/fixtures/row-census-1.51.0.jsonl`, replaced by promotion in L2, which adds `row-census-1.52.0.jsonl`.

A `tests` entry that names nothing fails the format check.

## (b) The 25 proved marks to strike (`t22-check.md` §4)

**One ruling, citing §4's tests.** Strike only the italic mark, as written below. The requirement text stays as it is.

| row | file:line | id | the mark to strike |
|---|---|---|---|
| A1 | `build/requirements/acquisition.md`:26 | R7 | `*(not yet met: N77 — the profiles name no locale yet, so every render asks the fallback)*` |
| A2 | `acquisition.md`:81 | R29 | `*(the door's call not yet met: control-plane, T20 layer 11, K887)*` (mid-line, before ". Each is an invariant …") |
| A3 | `actions.md`:24 | R7 | `*(not yet met: `completed`, D3, K590)*` |
| A4 | `actions.md`:25 | R8 | `*(not yet met: the override, K600 (a))*` |
| A5 | `actions.md`:26 | R9 | `*(not yet met: the arms beyond an office, D1, K590; an `entity_id` naming a person, which needs the entities registry, not in this module's uses: ACTIONS #1's deferral)*` |
| A6 | `bias.md`:53 | R24 | `*(not yet met: no row; K102)*` |
| A7 | `bias.md`:54 | R25 | `*(not yet met: no row; K102)*` |
| A33 | `monitoring.md`:68 | R32 | `*(not yet met: found in this reading; REC-26's stated limit)*` |
| A34 | `monitoring.md`:75 | R33 | `*(not yet met: new; K102)*` |
| A36 | `observation-log.md`:49 | R21 | `*(not yet met: D-682's frontier half, retrieval's; `leadRead` holds)*` |
| A39 | `provenance.md`:123 | R49 | `*(not yet met: K171 (13), forwarded to PROVENANCE #2, K176, K177)*` |
| A43 | `queue.md`:39 | R18 | `*(not yet met: REC-202; K533)*` |
| A44 | `queue.md`:42 | R19 | `*(not yet met: N374, T17)*` |
| A45 | `record-core.md`:148 | R38 | `*(not yet met: K49 — callers reach the binding directly today)*` |
| A46 | `reevaluation.md`:41 | R14 | `*(not yet met: REC-222; REC-209 is superseded by it; the `chain_unread` rule is K102; the hidden-project rule, N200)*` |
| A47 | `reevaluation.md`:42 | R15 | `*(not yet met: REC-223)*` |
| A48 | `reevaluation.md`:48 | R25 | `*(not yet met: N178)*` |
| A49 | `reevaluation.md`:52 | R17 | `*(not yet met: layers.md layer 7's "a weaker derivation, a changed grade"; K102)*` |
| A50 | `run-productions.md`:35 | R14 | `*(not yet met: K31 — `narrowCandidates` reads `proposed_readings` directly)*` |
| A51 | `scheduler.md`:20 | R3 | `*(not yet met: found in this reading; a throw today abandons the rest of the alarm and its reconcile)*` |
| A52 | `scheduler.md`:40 | R11 | `*(not yet met: found in this reading)*` |
| A53 | `scheduler.md`:43 | R12 | `*(not yet met: D-583; `capture-requests` R29 counts `captured` and `refused` only)*` |
| A55 | `skills.md`:71 | R28 | `*(not yet met: new)*` |
| A56 | `skills.md`:72 | R29 | `*(not yet met: new, K660)*` |
| A58 | `strength.md`:46 | R15 | `*(not yet met: K102; any signed-in member may set it)*` |

- **Each line matched exactly once** (`grep -n 'not yet met' <file> | grep '**R<n>**'`). After the strike, the requirements hold 75 of today's 100 `not yet met` lines.
- **Two marks stay, for jobs:** bias R40 (`bias.md`:65; inquiry L6) and monitoring R25 (`monitoring.md`:49; monitoring L10).
- **Status lines are history and need no edit for the strike.** Two of them still list the struck ids as "not yet met": `acquisition.md`:3 ("Carried not yet met: R7 …") and `strength.md`:3 ("Not yet met: … R5 and R15 (K102)"). BOB may add "(struck at T22's opening, K…)" where he wants the line to read true.

## (c) The requirement folds BOB writes before L1 (and those the L3 and L6 STARTs assume)

**At the opening, before L1** (`next.md` folds 3–5):

1. **Stale Uses notes (A18–A20)**, no change of meaning. In each, drop the clause "not yet met there, built by the `jurisdictions` job before layer 9, K171". Jurisdictions R12, R23–R25, R31–R33 carry no mark.
   - `escalation.md`:63: "`oversight` is R24's, not yet met there, built by …" becomes "`oversight` is R24's".
   - `filings.md`:67: "(R25, R32, R33: not yet met there, built by …)" becomes "(R25, R32, R33)".
   - `standards.md`:47: "(R23, R31: not yet met there, built by …)" becomes "(R23, R31)".
2. **Installer's not-met list (A26)**, `installer.md`:13. "Not yet met: R13 (…), R20 (DIST-15), R21 (N10), R24 (…), R30 (…), R32, R33 (K102)." becomes "Not yet met: R13 (MULTI-INSTANCE-ISOLATION row 6), R24 (MULTI-INSTANCE-ISOLATION), R32, R33 (K102)." R20, R21 and R30 carry no mark.
3. **Promotion's Suggestions (A38)**, `promotion.md`:151 ("**Batch30.** Every *(not yet met)* row above has its fix built and unmerged on `snapshot/pre-refactor-2026-09-25` …") and :154 ("**Tests.** Each *(not yet met)* requirement gets a negative control …"). No promotion requirement carries a mark, so strike both bullets. Alternatively, put them in the past tense: "(T4: every then not-yet-met row …)".
4. **Provenance's Suggestion (A40)**, `provenance.md`:181. "Tests: each *(not yet met)* id gets a negative control reproducing its row." has nothing left to apply to once R49's mark is struck. Strike that first sentence and keep the second ("D-177, D-693, … judged at the job"), or put both in the past tense.
5. **DEC-102's "for now" (H7) is not in any requirement's text.** `ratification.md`:23 (R2), :36 (R18) and `publication.md`:48 (R17) do not say "for now". The words are K102's ("Bob approved … 'for now'", `build/rulings.md`:107). DEC-104's "for now" on strength R5 is likewise K102's. The fold is one ruling line: DEC-102 makes ratification R2/R18 and publication R17 final, and DEC-104 does the same for strength R5. No requirement text changes for the lift. R5's new count clause is fold 9 below.
6. **N480 filed (G1)** as a `next.md` entry, in the form of N471:

   "N480 · 2026-10-01 · **membership**, **text-chain**, **provenance**, **inquiry**, **ai-runs**, **public-read** (MEMBERSHIP #15 "seen, not changed", `jobs/T21/membership.md`:16; K1010): notes name the deleted plane `src/index.mjs` as the live home of a table, function or stamp (`CUSTODIAL_ACTIONS`, `GOVERNANCE_ACTIONS`, `STATE_ACTIONS`, `NEEDS` are op-declarations'; `resolveSession` and `scopeFor` admission's; the stamps control-plane's); re-word to the module that holds it now or put in the past tense (N469's rule)."

   The sites, re-read on this tree, are in each START. They add `membership/index.mjs`:2519, `ai-runs/index.mjs`:607, :702, :1060, :1548 and :2457, `textchain.mjs`:1755, :1843–:1853, and `run-rules/rules.mjs`:645, :836 (run-rules has a T22 job, so it joins N480). `public-read/index.mjs`:661 (`DO_PATH`, now `control-plane/index.mjs`:901) is L8's.
7. **DEC-88's reason audit (J2).** BOB's to perform. Each act below is in DEC-88's REASONED band (or is `inboxresolve`). BOB reads its requirement for an authored reason and folds one where it is missing, before that layer; its module joins the layer. Owners were found by each module's dispatch table on this tree. Whether each requirement already requires a reason was **not** checked here.

   | act | owner (layer) | in T22 already? |
   |---|---|---|
   | `testify` | provenance (3) | yes, L3 |
   | `inboxresolve` | capture (3) | yes, L3 (known: none today) |
   | `transcribe`, `transcriptionattest`, `attesttext` | content (4) | yes, L4 |
   | `lead`, `leadlook`, `leadshare` | observation-log (5) | yes, L5 |
   | `resolve`, `resolvetestify`, `entitycreate` | entities (5) | no |
   | `progressiondefine` | progressions (5) | no |
   | `biasadopt` | bias (5) | no |
   | `strengthbar` | strength (6) | yes, L6 (R15 requires none today) |
   | `versionadopt` | reevaluation (7) | no |
   | `goaldeclare`, `aspirationdeclare`, `aspirationdeadend`, `objectivecondition`, `workobjective` | intent (7) | no |
   | `attribute` | publication (8) | yes, L8 |
   | `statementack` | case-authoring (8) | yes, L8 |
   | `standarddeclare`, `standardadopt` | standards (9) | no |
   | `consequencerecord` | consequences (9) | no |
   | `actioncorrespond` | actions (9) | no |
   | `filingsent`, `counselpacket` | filings (9) | yes, L9 |
   | `escalationopen`, `escalationattach` | escalation (9) | yes, L9 (known: `escalationOpen` takes none, `escalation.md`:17) |

   An act whose own authored words are its reason counts (DEC-88), for example `testify`'s words and `lead`'s `words`. A fold found here goes into that module's START before posting. The L3–L6 STARTs carry a line for strength only; for provenance, content and observation-log, BOB adds the entry if the audit finds one.

**Before L3 (unconditional; capture's START assumes it).**

8. **Capture: `inboxResolve` requires an authored reason (J1 (4), J2; DEC-88).** Fold it into R32 (`capture.md`:79) and the doorbell's signature (:76, `inboxResolve({knockId, status, by, reason})`). Then mark it `*(not yet met: T22)*`. The fold must say:
   - the refusal's code and its place in the order;
   - that the reason is recorded on the row;
   - whether the `pulled` arm (`pullKnock`, R65) takes it too.

   **Finding, for BOB before L3.** The reason breaks tests that are not capture's and are not in T22:
   - `bio-plane/test/m/sources/contract.test.mjs`:30 and `source.test.mjs`:63 assert `ok: true` on a reasonless discard. sources is layer 3 and has no T22 job.
   - `bio-plane/test/m/control-plane/doorbell.test.mjs`:325 discards without a reason, then expects `KNOCK_DISCARDED`. control-plane's L11 job is conditional (J3).
   - No instance-setup test drives `inboxresolve`. `setup.mjs`:1338 is page script, so the planned accepted red 6 has no test to name. The break is the live page's resolve, until instance-setup's L11 job.

   *Recommended:* sources joins L3 for two test lines that pass a reason (a field capture ignores before its merge, so it can merge at any time). Accept control-plane's `doorbell.test.mjs`:325 by name from capture's merge until control-plane's L11 job, which then always carries that one re-key. Alternatively, run the re-key as T23's first L11 item if J3 is not approved.

**Before L6 (unconditional; the inquiry and strength STARTs assume them).**

9. **Inquiry, bias R40 (A9).**
   - Add `bias` to inquiry's `uses` in `modules.json`. It is not there today; bias is index 36, inquiry 41.
   - Name `bias.registerWorkProducts` in inquiry's Uses.
   - Add a requirement, marked `*(not yet met: T22)*`: "a question's findings made under a project lens are registered with `bias` as work products of kind `finding` (bias R33's source), so bias R40's debt reaches them."
10. **Strength R5 and R15.**
    - **R5**, from DEC-104 (H10). Add a clause: every strength answer states how many hunch legs it left out. Name which answers: the live pair, R9's and R26's. Say how a withheld hunch is treated: R6's sight, neither named nor counted.
    - **R15** or its answer's text, from DEC-105 (H12). Add the note "CivicOS has no guidance yet on what particular audiences expect. Readers see the bar you set in these words.", on `strengthBarSet`'s answer and, if BOB wants, `strengthBarOf`'s.
    - Mark each fold `*(not yet met: T22)*`.

**Not written here (Bob's approval, `t22-check.md` §6 question 1).** These are DEC-89 (J3), DEC-95 (1) (J5), DEC-97 (H2), DEC-101 (H6), DEC-103 (H9) and DEC-108 (H16), drafted in `plan/draft-T22-dec-folds.md` (committed while this file was written). The L1–L6 STARTs carry them as pending:
- capture: DEC-108 (§6), DEC-95 (1) (§2) and DEC-97 (§3, which places the held list and set-aside in capture, R77–R79, beyond `next.md`'s L8 placement);
- skills: DEC-101 (2) (§4, R31), its only entry.

Each is sent as a CHANGE when approved.

**Two consequences for L1–L3:**
- **DEC-101 can reach L1.** The draft's §4 offers record-grammar R43 (`PROPOSAL_STATES` gains `edition_statement`). That route adds record-grammar, which has no other entry, to L1. If Bob approves after L1 has started, the route closes, and its alternative (case-authoring holds the label sentence) is the only one left.
- **DEC-108 and J2 both re-word capture R32** (the sort, and the reason). BOB folds them as one R32 text if both land before L3.

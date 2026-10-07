# T35 splits: affordances (before T35-66) and control-plane (before T35-72)

**Status** · DRAFT by a read-only worker for BOB #128, 2026-10-07 (P18), for `draft-T35-final.md` review item 4 (K617, K624 (1)). For BOB's review: the seams, ids and entry numbers are proposals. The R-id maps are a starting reading that each job confirms against the code, as in `draft-T25-splits.md`.

Measured on `tranche/T34` with `wc -l`. affordances is 3,944 lines: `affordances.mjs` 2,975, `affordances/t33.mjs` 381, `t34.mjs` 92, `facts.mjs` 290, `door.mjs` 113, `words.mjs` 93. control-plane is 3,903 lines: `index.mjs` 3,016, `dispatch.mjs` 339, `families.mjs` 213, `checks.mjs` 176, `pull.mjs` 123, `step.mjs` 36. Line ranges come from `sed -n a,bp`. "~" marks an estimate of headers and import lines.

The precedent rules apply as in N506, N512 and N513. Moved ids keep their text, and only cross-references are re-pointed. The old module retires each moved id and never reuses it. The new module sits directly before its users. Copy-then-delete happens in one tranche (K624 (1)): the new module's job builds its paths and merges first, then the source module's job deletes its copy and re-points. `modules.json`, `layers.md`, `layers-view.html` and membership's `MODULE_ORDER` (its R83) are all updated.

## Summary

| split | new module | moves | old module after | new module after | src re-points outside the pair |
|---|---|---|---|---|---|
| A-1 | `op-grades` | 1,905 | ~2,050 (T35-66 adds ~0) | ~1,930, then ~2,080 with T35-66 | 1 (plane `wizards.mjs`) |
| C-1 (required) | `answer-envelope` | 709 | ~3,200 | ~730, then ~780 with F17 | 2 (plane `door.mjs`, `index.mjs`) |
| C-2 (recommended with C-1) | `store-door` | 498 | ~2,705, then **~2,925** with T35-72 | ~500 | 1 (plane `store.mjs`) |

If only C-1 is taken, control-plane is about 3,420 after T35-72. That is under the mark, but its routes grow by 80–95 lines a tranche (T33 +95, T34 +79), so it would pass about 4,000 again within about five tranches. C-2 costs little: whole files move and one src import changes.

---

## A-1 · affordances → `op-grades` (every op's grade, stated or absent)

**Seam.** The grading tables are pure data. They import nothing: every hit of an imported name inside the moved ranges is in a comment, and `t33.mjs` and `t34.mjs` say "imports nothing". affordances keeps the acts (`ACTS`, `CAPTURE_ACTS`, `PER_ITEM_ACTS`), the derivation, `decorate`, `explainRefusal`, the vocabularies, the prompts, the facts, the door, and the totality `unaccounted` (R12) checked over both modules' tables. All of T35-66's growth falls inside the moved tables. N623's dialog is a `CONSEQUENCE_STATEMENTS` entry. `personexpunge`'s rung (`t33.mjs`:49) and DEC-143's Irreversible weight are in `RUNGS`. The new ops' grades go in `RUNGS`, `RUNG_ABSENT` and `NON_ACTS`, as T34's did in `t34.mjs`.

| what (`affordances.mjs` unless named) | range | lines |
|---|---|---|
| FW-14 block: `RUNG_LADDER`, `IRREVERSIBLE_CORRECTION_PATH`, `JUSTIFICATION_REFUSALS`, `RUNG_ABSENCE_GROUNDS`, `CONSEQUENCE_STATEMENTS`, `LARGER_SCREEN_ACTS` | 378–625 | 248 |
| `RUNGS`, `RUNG_ABSENT` with their headers | 815–1304 | 490 |
| `MACHINE_REFUSALS`, `NON_ACTS`, the three `aliased` assignments | 2157–2840 | 684 |
| `NOT_ON_PHONE_RUNGS`, `phoneOf` | 2894–2903 | 10 |
| `affordances/t33.mjs`, `affordances/t34.mjs` whole, moved to `src/op-grades/` | | 473 |
| **total** (1,865 if `MACHINE_REFUSALS`, 2157–2196, stays) | | **1,905** |

The new file is `src/op-grades/index.mjs` (~1,460), alongside `t33.mjs` and `t34.mjs`. affordances imports the tables from it. `VOCABULARIES` (lines 735–741, 802) keeps publishing `rung_ladder`, `rung_consequences`, `larger_screen_acts` and `rung_absence_grounds` as the same objects (R4). `deriveActs` reads `MACHINE_REFUSALS`. `decorate` reads `RUNGS`, `RUNG_ABSENT` and `phoneOf`. affordances does not re-export them. After the split affordances is 3,944 − 1,905 + ~10 = **~2,050** (~2,090 if `MACHINE_REFUSALS` stays).

**`MACHINE_REFUSALS`: move it.** R7 states it together with `NON_ACTS`, so moving both keeps R7 whole. R20, the invariant that drives each act in `ACTS` with a machine credential, stays in affordances, because only affordances holds `ACTS`. The fallback is to keep the table in affordances and split R7 in two.

**R-ids (affordances → op-grades).** R2→R1 (the ladder, `RUNGS`, `JUSTIFICATION_REFUSALS` as the family that backs `reasoned`). R3→R2. R27→R3. R31→R4: its "published as `VOCABULARIES.rung_consequences`" stays in affordances R4 as a pointer. R7→R5. R30→R6, R32→R7, R33→R8, R34→R9, R35→R10, R37→R11, R38→R12, R40→R13, R42→R14, R43→R15, R44→R16, R45→R17: each of these moves its grading bullets (rungs, absences, `NON_ACTS`, `MACHINE_REFUSALS` notes, `JUSTIFICATION_REFUSALS` additions). R36→R18 for the phone set and `phoneOf`. Copies, stated in both modules: R22 (nothing here writes) as R19 and R25 (no place named) as R20. "R12's totality" in each moved id reads "affordances R12's".

The bullets that stay are amended in place in affordances:
- R30 and R34: their `VOCABULARIES` bullets.
- R36: every decorated act carries `phone` (R11's shape).
- R37: the no-target `screens` and `wizard_scripts`.
- R44: the no-target `writing_help_refused`, and "data and wiring only".

These stay whole: R1, R4–R6, R8–R18, R19 (its backing tests drive the owners and read op-grades' tables), R20, R21, R23–R26, R28, R29, R39 and R41. affordances retires R2, R3, R7, R27, R31, R32, R33, R35, R38, R40, R42, R43 and R45. It splits and re-words R30, R34, R36, R37 and R44.

**Order and uses.** Layer 11, directly before affordances (wizard-scripts, op-grades, affordances). `uses: []`. Its tests check the tables' shape and the aliases. Backing and totality are checked in affordances (R12, R19, R20), which uses it. Used by affordances and plane. modules.json row: `{"id":"op-grades","layer":11,"paths":["bio-plane/src/op-grades/"],"tests":["bio-plane/test/m/op-grades/"],"uses":[]}`. affordances and plane gain `op-grades`. affordances' `paths` are unchanged: `affordances/` keeps `facts`, `door` and `words`.

**Re-points.**
- src: `plane/wizards.mjs`:5 (`MACHINE_REFUSALS`, `RUNGS`), in plane's T35-73.
- tests:
  - `plane/wizards.test.mjs`:17, in T35-73.
  - `control-plane/totality.test.mjs`:9 (`RUNGS`, `RUNG_ABSENT`; `unaccounted` stays), in T35-72.
  - affordances' own tests that import the moved names or the `t33.mjs`/`t34.mjs` paths: `catalogue`, `t31`, `t33`, `t33-backing`, `t34`, `plane`, `backing`, `sources`, `contradiction`, `derive`, `converts`.
- Moving to `test/m/op-grades/`: the table cases of `t33.test.mjs` and `t34.test.mjs` (the alias table), the job confirming case by case.
- requirements: `wizard-scripts.md` (affordances R2, R37's grades, R42) and `op-declarations.md` ("its R33", "its R35", "its R37" for `NON_ACTS`). BOB re-points them at the fold. `filing-templates.md` and `local-facts.md` ("its R30") re-point to op-grades R6.

**Risks.**
- `Object.assign(…, aliased(…))` must run after the T33 and T34 spreads, which it does in the moved block as written.
- `CONSEQUENCE_STATEMENTS` is frozen and published by reference. affordances must import it, not copy it (R4's identity tests).
- A test that reads `A.RUNGS` through `import * as A` from `affordances.mjs` fails loudly once it is moved, which is the intended check.

---

## T35-72's growth, estimated (control-plane at 3,903)

| T35-72 item | where it lands | estimate |
|---|---|---|
| ~15 routes: `unpack`, `archivelist`, the two note ops, the sign-in, `findin`, `securitymap`, the offices read, `signout`, `signouteverywhere`, the recovery ops, the co-archive setting | `index.mjs` (stamps, public arms) | +90 to +120 (T33 routed its ops in +95, T34 in +79) |
| N686: `groupdescriptiondraft` and `writinghelp` sent to agent-worker's `/draft` | `index.mjs` / `dispatch.mjs` (R57) | +40 |
| N695: `pack` and `fences` served apart (R41) | `index.mjs` `publishAffordances` | +25 |
| F1: reads leave the query (`index.mjs`:192, :557, :705, :909, :1083; `dispatch.mjs`:220) | both | +30 |
| F17: R51's policy becomes a per-response nonce `script-src`, applied to the served pages | `withPagePolicy` | +50 |
| **total** | | **+235 to +265 → ~4,140–4,170** |

Even the low case, routes alone at +90 and nothing else, gives 3,993. It does not provably stay under about 4,000, so control-plane is split.

## C-1 · control-plane → `answer-envelope` (the answer's envelope, its decoration, the page policy)

**Seam.** These are module-level functions with no closure state: they sit outside `makeFetch` (725–3009) and read none of its locals.

| what | range | lines |
|---|---|---|
| R51: `PAGE_POLICY`, `withPagePolicy` | `index.mjs` 83–96 | 14 |
| `json`, the D-262 decoration (`dec49Decorate`, `dec49Attach`), the REC-52 block (`doAnswer`, `storeRefusal`, `storeSilent`, `relayAnswer`, `STORE_SILENT_*`), `planeInternalError`/`Answer`, `replayRow`, `requiredArgumentRow`, `requiredArgument`, `installationRow`, `dispatchRow`, `StoreSilent` | `index.mjs` 226–531 | 306 |
| `checks.mjs` whole. `families.mjs` reads it last, as `OWN` (:107, :181), and a family before control-plane cannot import a later file. | | 176 |
| `families.mjs` whole (`CHECK_FAMILIES`, `CHECK_FAMILY_FILES`, `dec49Row`) | | 213 |
| **total** | | **709** |

These stay in control-plane: `tallySessionRefusal` (R50), `caseReader`, `captureKey`, `storageAbsent`, `fingerprint`, `sha256Hex` and everything from `groupRead` on. The rows' `where` strings for C-61.1, C-69.2 and C-69.3 are re-pointed to the new file. The rows for C-69.1, C-68.2–.4 and C-66.6 keep naming `control-plane/index.mjs`, because their sites stay there. The rows are held by answer-envelope and their invariant tests stay with the behaviour.

**R-ids (control-plane → answer-envelope).** R21→R1, R22→R2, R23→R3, R24→R4. R25→R5 (the Worker half, `PLANE_INTERNAL_ERROR`; the store half goes to C-2, or stays if C-2 is not taken). R51→R6. R43→R7, where "this module's last" becomes answer-envelope's family last, still last in `build/modules.json` order. R32→R8 for the rows held; R32's invariants stay where their codes are raised. R33 is copied as R9. control-plane retires R21–R24 and R51, and re-words R25, R32 and R43.

**Order and uses.** Layer 11, directly after admission and before control-plane (op-declarations, admission, answer-envelope, [store-door], control-plane, plane). Its `uses` are the modules whose families `families.mjs` imports, measured (68): record-grammar, text-chain, record-core, membership, credentials, promotion, provenance, attestation, provenance-routes, capture-sources, acquisition, capture, sources, calibration, extraction, content, entities, events, local-facts, connections, observation-log, standards, progressions, money-checks, duties, bias, retrieval, inquiry-grammar, accepted-work, inquiry, hypotheses, citation, basis-versions, strength, contradiction, run-rules, run-productions, capture-requests, skills, answers, intent, reevaluation, case-tensions, publication, docket, public-read, network-notices, ratification, case-import, case-disclosures, case-authoring, review, conformance, consequences, action-grammar, action-clocks, filing-templates, filings, escalation, action-plans, monitoring, following, link-sweep, wizard-scripts, tasks, queue, instance-setup, admission. control-plane gains `answer-envelope` and drops whichever uses only `families.mjs` gave it; its own `index.mjs` reads 13 modules. control-plane's job measures the result (agent-worker, ocr-worker, agent-harness, sheet-worker and actions appear in no src import today). plane gains `answer-envelope`.

**Re-points.**
- src: `plane/door.mjs`:24–25 (`json`, `doAnswer`, `storeSilent`, `storeRefusal`, `STORE_SILENT_*`, `requiredArgument`) and `plane/index.mjs`:5–6, in T35-73. control-plane's `export {…}` (3010–3013) keeps only its own names; the plane imports above are what read the rest.
- tests moving: `envelope.test.mjs` (533; its D-dispatch cases stay with C-2), `families.test.mjs` (292) and `page-policy.test.mjs` (55).
- tests re-pointing: `purge.test.mjs`:51, :69, `purge-hold.test.mjs`:13, `t34-routes.test.mjs`:16 (`checks.mjs`), `plane/split.test.mjs`:17 (`json`), and `harness.mjs`'s `M` where a case reads a moved name.
- requirements citing control-plane R23 or R25 re-point to answer-envelope R3/R5: admission, capture, extraction, host-governor, instance-setup, monitoring, public-read and ratification. docket and record-grammar cite R43 and re-point to R7.

## C-2 · control-plane → `store-door` (`dispatch(req)`, the record store's door)

**Seam.** Whole files: `dispatch.mjs` (339), `pull.mjs` (123) and `step.mjs` (36), 498 lines in all. `index.mjs` imports none of them. Their only src importer is `plane/store.mjs`:69–70. `dispatch.mjs` reads `DISPATCH_CHECKS` from answer-envelope after C-1. With F1, `dispatch.mjs`:220 (the grant read) lands here.

**R-ids (control-plane → store-door).** R26→R1, R27→R2, R47→R3, R46→R4, R42→R5. Split, with the store's half moving: R25 (`STORE_INTERNAL_ERROR`, C-69.4) as R6, R36 (`pullAndFile`, the pull and its promotion as one act) as R7, R50 (the internal route `wizardrefusaltally`) as R8, R53 (`underGrant`'s read log) as R9, and R57 (the per-act assistant resolution before a draft's handler) as R10. control-plane keeps the routing and stamp halves of R36, R50, R53 and R57. control-plane retires R26, R27, R42, R46 and R47. C-69.4 and C-69.5 are held in answer-envelope's `checks.mjs`; their `where` strings are re-pointed to `src/store-door/dispatch.mjs`.

**Order and uses.** Layer 11, after answer-envelope and before control-plane, because the copy merges first (K624 (1)). Neither uses the other. Its `uses`, measured: record-grammar, record-core, membership, credentials, promotion, provenance, capture, sources, ai-runs, answers, wizard-scripts, affordances, tasks, queue, instance-setup, answer-envelope. Used by plane.

**Re-points.**
- src: `plane/store.mjs`:69–70, in T35-73.
- tests moving: `dispatch.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`, and `inbox-door`/`doorbell`'s `pull.mjs` cases. The job confirms which cases are the door's.
- tests re-pointing: `rN-routes`, `routes`, `t34-routes`, `envelope`, `record.mjs` (:14, :24), `plane/door.test.mjs`:11 and `plane/maps.mjs`:55.
- requirements: `actions.md` and `plane.md` (R46→R4), `membership.md` (R27→R2) and `capture.md` (R36's pull→R7). Comments in tasks, project-stage, filings and link-sweep naming `control-plane/dispatch.mjs` are left as they are; those are other modules' files.

**Risks.** `controlPlaneRoutes` keeps its exported name, so plane's composition is unchanged and the name can be re-worded later. The R50 and R57 halves split one requirement across two modules: the job states each half's text and BOB words it at the fold.

---

## modules.json and the T35 L11 entries

modules.json, made by BOB at L11's opening (review item 4): add `op-grades` before affordances, and `answer-envelope` and `store-door` between admission and control-plane, with the rows above. control-plane's `paths` stay `bio-plane/src/control-plane/`; its moved files leave it. New paths are `bio-plane/src/answer-envelope/` and `bio-plane/src/store-door/`, and the tests go to `bio-plane/test/m/<id>/`. plane gains three `uses`. Each new module gets a `requirements/<id>.md` (the R maps above), a `Status AMENDED` line on each source file, and `build/extraction/<id>.md` listing the moves.

Proposed L11 entries, in merge order:
- **T35-77 · op-grades** · A-1's extraction: the tables and `t33.mjs`/`t34.mjs` copied, and R1–R20 per the map. T35-66's grading share follows: (N623, DEC-142) `personexpunge` as a named exception beside `actionholdrelease` (DEC-113 tier), with its `CONSEQUENCE_STATEMENTS` dialog stating what is removed and from where, that no one can undo it, that the marker stays, and that published cases change only through the docket. (N657, DEC-143) the Irreversible weight. Grades of the new ops (as T34-75) in a `t35.mjs` beside `t34.mjs` · req: the new file, BOB's wording of DEC-142 and DEC-143 · depends —. ~2,080 after.
- **T35-66 · affordances** (re-cut) · removal side: deletes its copy and imports from op-grades; tests re-pointed or moved. (N597) `facts.mjs`:112, :202 read `caseRelation` from case-tensions. (N695) R39's `connection_kinds` carried once · req: R-ids retired and re-worded per A-1; R39 · depends T35-77. ~2,050 after.
- **T35-78 · answer-envelope** · C-1's extraction (R1–R9). (F17) R6's policy becomes a nonce-based `script-src`, set per response by `withPagePolicy` · req: the new file, R51's wording (BOB's) · depends —. ~780 after.
- **T35-79 · store-door** · C-2's extraction (R1–R10). (F1, its share) `dispatch.mjs`:220's grant leaves the query. (N686, its share) R10's resolution for the `/draft` path if the job finds it is the door's · depends T35-78. ~510 after.
- **T35-72 · control-plane** (re-cut) · removal side for C-1 and C-2, then the entry as written less F17 and `dispatch.mjs`:220 · depends T35-70, T35-71, T35-78, T35-79. ~2,925 after.
- **T35-73 · plane** gains three re-points: `wizards.mjs`:5 to op-grades, `door.mjs`:24–25 and `index.mjs`:5–6 to answer-envelope, and `store.mjs`:69–70 to store-door. It depends on T35-72 as before.

The P6 notes line becomes: affordances ~2,050 and op-grades ~2,080 after T35-66; control-plane ~2,925, answer-envelope ~780 and store-door ~510 after T35-72.

# reevaluation (T21)

**Status** · session_01WehQaP3PPKJRJ5F5JBf8E4 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

For BOB (nothing blocks; carried on, on my reading):
1. **Stale artifact.** My change is under `bio-plane/src/` (`reevaluation/index.mjs`), so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale. I regenerated nothing (manifest, "Generated artifacts").
2. **Where R16's project cause can surface (a reading, no change asked).** A new basis leg naming a project is refused at the gate (C-2.8: "a leg rests on information or on another inquiry"). So `wp_retraction` reaches a dependent only through a leg the record already holds (a replayed, legacy leg; the tests lay one down that way), and otherwise through R9, `changesOf({findings: [<project>]})`, which answers the project's own causes. This is the same reach the old `workproduct_state` arm had. If R16 means the cause should also reach findings that rest on the case's members (not on the project), that would be a requirement change: yours to word.
3. **Pre-existing failures, not this job's.** `node --test test/m/` gives tests 4697, pass 4635, fail 42 (todo 20). The failing test titles are byte-identical with my change stashed (both runs: 43 `✖` lines). They are mostly `filings` (R1–R19), plus project-stage's "R1 R2 one project through the four stages" and control-plane's "R43, R22: every code decorated before the catalogue's end…" (control-plane: 92 pass, 1 fail, the same with or without my change).
4. **`workproduct_state` elsewhere.** It still appears in `record-grammar` (`bundle.mjs`, its test fixtures), `intent` (`checks.mjs`, `grammar.mjs`, `index.mjs`) and `gate.mjs`. These are those modules' own grammar, and K899 (3) retires the field. reevaluation no longer reads it; only a comment names it.

## J2 · COMPLETE

**Entries applied** (B1).
- **N457 (R16).** In `bio-plane/src/reevaluation/index.mjs`, the `workproduct_state` read in `#moved` is deleted, and a project's document is no longer read for this cause. The new `#workProducts()` is one reader per answer. It pages R26's `cases`, finds each case's owning project through `parts`' `project`, and reads the editions of the cases a project owns through `this.promotion.fact("publishedCaseRegistry", ids)`. It uses no later module's service.
  - A project carries one `wp_retraction` cause per case it owns that has a ratified edition superseded by a later ratified one. `since` is the latest edition's `ratified_at`. The cause carries `case`, `edition`, `superseded_edition`, and a `detail` naming the case and both editions. Unratified editions are filtered here, not trusted to the provider.
  - With R26 unregistered, no cause is raised, and `reevaluations` and `changesOf` say `case_parts_absent: true` with a why. If the cases or the fact cannot be read, they say `work_products_read: false` with a why (R21).
  - Closing by a recorded re-evaluation and the machine refusal are R16's existing paths. `REEVAL_SOURCES` (`checks.mjs`) is unchanged.
- **N469.** I re-scanned my paths. No note names a deleted file as live, and none speaks of "the battery". The "Converted from …" notes are provenance and stay. Nothing changed.

**Tests:** new `bio-plane/test/m/reevaluation/wpretraction.test.mjs`, 6 tests, every title naming R16:
- a superseded ratified edition raises the cause, naming both editions (also: three editions, two cases, another project's case, and `changesOf` on the project);
- a single edition, an unratified successor, only-unratified editions, another project's case and no case raise nothing, and the read writes nothing;
- an absent registration says `case_parts_absent` (negative control: registered), and an unprovided fact says `work_products_read: false`;
- a document still carrying `workproduct_state: retracted` or `redistributed` raises nothing;
- a recorded re-evaluation closes the cause until a later ratified edition, and a machine is refused;
- R20 withholding.

**Not yet met: T21.** This meets R16's `not yet met: T21` mark (requirements R16).

**Runs:**
- `node --test test/m/reevaluation/`: tests 82, pass 82, fail 0.
- Modules using reevaluation:
  - publication: 94 pass, 0 fail;
  - case-authoring: 80 pass, 0 fail;
  - conformance: 54 pass, 0 fail;
  - monitoring: 72 pass, 0 fail;
  - scheduler: 51 pass, 0 fail;
  - queue-producers: 47 pass, 0 fail;
  - plane: 28 pass, 0 fail;
  - control-plane: 92 pass, 1 fail, which is pre-existing (J1 item 3).
- `node --test test/m/`: tests 4697, pass 4635, fail 42, todo 20. The failures are identical with my change stashed (J1 item 3).
- The manifest names no layer tests.

**Checks:**
- format: 86 modules, 84 requirements files; 0 failures.
- architecture: 13 product files, 57 relative imports; 0 failures.
- coverage: 28 of 28 live requirement ids named by a test; 0 failures.
- ownership: 3 files changed by reevaluation between tranche/T21 and HEAD; 0 failures.

**Deferred:** none.

**Found in other modules:** see J1. The plane bundle is stale; failures are pre-existing (filings, project-stage, control-plane); `workproduct_state` remains in record-grammar, intent and gate.

Size (session_01WehQaP3PPKJRJ5F5JBf8E4): test runs 16, module lines 2096

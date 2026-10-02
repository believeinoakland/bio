# inquiry (T23)

**Status** · session_01V24GWeyLsefZzy4edFhfnt · depth 2 · RUNNING until 2026-10-02T08:07:54Z (node --test test/m) · handled B1

## Completion (INQUIRY #12)

**Entries applied** (`build/plan/current.md` T23 L6: N497, with N469's rule; tests only, no assertion's meaning changed)
- N497: `test/m/inquiry/fixture.mjs`:75–77 registers promotion's facts under the modules that provide them now: `producingGroup` under `instance-setup` (`src/setup.mjs`:1940), `caseMember` and `publishedRegistry` under `publication` (`src/publication/index.mjs`:2650, :2651).
- N469's rule. Notes that named `legacy-store` as live now name today's owner, or are in the past tense:
  - `fixture.mjs`:3: "publication's facts `caseMember` and `publishedRegistry`".
  - `fixture.mjs`:52–53: the strength columns are where strength's values stood on `bundles` before it moved them to `strength_cache` (its R23; legacy-store added them). No strength module is registered here, so the real retrieval's search reads them where they stand. This is one line longer.
  - `lifecycle-reads.test.mjs`:5–6: "the boot normaliser legacy-store held were not inquiry's".
  - `testimony-inherited.test.mjs`:13: "and the one legacy-store held, are not here".
- Found in the re-scan of the tests (all 4,116 lines), same kind, fixed: these notes named the retired catalogue or store gate as live.
  - `facts.test.mjs`:160: C-2.8's arm is now called inquiry-grammar's.
  - `grammar.test.mjs`:176: R38's title now says the rows are inquiry-grammar's, read with their ids, matching its own assertion at :198.
  - `content-legs.test.mjs`:108: the R11 title now says "content's own refusals" in place of "the store gate's".
  - No assertion changed.
- No requirement carries a `not yet met: T23` mark, and none was added.

**Applied after B2** (J1 answered: re-word all six in this job)
- `checks.mjs`:3: C-2.1–C-2.7, C-2.9 and C-2.10 "are their owners', not the catalogue's". The owners are record-grammar (C-2.2–C-2.7), promotion (C-2.1), intent (C-2.9), and actions and action-grammar (C-2.10).
- `checks.mjs`:60: C-2.18 was "stamped 1.47.0, T17" (`gate.mjs`'s 1.47.0 note).
- `checks.mjs`:72: C-66.5's `where` was "stamped 1.50.0 (K884)".
- `index.mjs`:3024: "as entries of plane's op map".
- `schema.mjs`:117: "because it was created in store.mjs's migration".
- `schema.mjs`:128: "re-measure (that probe has since been deleted)".
- Comments only. Each is re-worded in place, adding no line.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by these source changes. B2 accepts this (red 12), and nothing was regenerated.
- Kept as provenance: `index.mjs`:473, :2316, :2453, :2680; `text.mjs`:2; the measured notes in `schema.mjs`. No `tools/` or `legacy-tests` mention is live.
- Left as is: `index.mjs`:2229 cites "CLAUDE.md's sparse rule". It is a citation of where the rule came from, not a live claim.

**Other modules:** nothing found. No other module imports inquiry's fixture.

**Tests and checks** (on `job/T23/inquiry` after the change)
- `node --test test/m/inquiry/`: tests 167, pass 166, fail 0, todo 1. The todo is R31, which is marked not yet met (MK-5, K181).
- `node --test "test/m/**/*.test.mjs"`: tests 5039, pass 5024, fail 3, todo 12, skipped 0. Each fail is an accepted red named in B1:
  - control-plane `inbox-door.test.mjs`:81 (red 9)
  - queue `catalogue.test.mjs`:34 (R1)
  - queue `catalogue.test.mjs`:116 (R5) (red 13)
  - Test-support R2 passed here. The three later test-note edits only re-word a comment and two test titles; `test/m/inquiry` was re-run green after them.
- `checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `checks/architecture.mjs … inquiry`: 27 product files, 90 relative imports; 0 failures.
- `checks/coverage.mjs … inquiry`: 49 of 49 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … inquiry tranche/T23`: 7 files changed by inquiry; 0 failures.
- After B2: `node --test test/m/inquiry/`: tests 167, pass 166, fail 0, todo 1. Format 0, architecture 0, coverage 49/49, ownership 10 files with 0 failures.
- The plane bundle is stale from B2's source re-wording (red 12), and nothing was regenerated.

Size (session_01V24GWeyLsefZzy4edFhfnt): test runs 6, module lines 3882

## J1 · QUESTION

My re-scan of `bio-plane/src/inquiry/`, all 3,882 lines read, found six source comments of N469's or N502's kind. Each one describes something retired as if it were still live:
- `checks.mjs`:3: "C-2.1–C-2.7, C-2.9 and C-2.10 stay the catalogue's until their owners take them". The owners have taken them: promotion, intent, actions and action-grammar.
- `checks.mjs`:60: "awaiting T17's stamp" (C-2.18).
- `checks.mjs`:72: C-66.5 is still called "`awaiting stamp`". It was stamped at 1.50.0 in T20 L2 (K884).
- `index.mjs`:3024: "as entries of the legacy store's op map". The map is now plane's, in `plane/store.mjs`:269.
- `schema.mjs`:117: "created in store.mjs's migration", in the present tense.
- `schema.mjs`:128: "the probe is here to re-run". `test/meaning-index-probe.mjs` was deleted.

Each fix is a re-wording in place and adds no line, but each one changes the plane bundle's input and stales `bio-plane.bundled.mjs`.

My reading: your START said tests only, so I leave the source untouched. These go in my record as deferred, with N502 as their natural home. If you would rather I re-word them now, say so. The bundle would then be stale until L6's close regenerates it (red 12). Either way, I am carrying on.

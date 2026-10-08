# instance-setup (T38)

**Status** · session_01DvLwj9sgfMgyKyqYnjboLo · depth 2 · COMPLETE · handled B1

## Completion (INSTANCE-SETUP #17, T38-23)

**Entry applied.** T38-23 (N793; K231, K2275, K2300, K2318), commit `65bc6b45e2`:
- R69: `translationGrant` answers `NO_SUCH_MEMBER` through `membership.noSuchMember` (its R121, C-96.47), with `member` the id asked, for a member that is absent, a machine identity or not active (`setup.mjs` `#translationMember`, which now mints no code of its own). The order is unchanged: `MACHINE_CANNOT_TRANSLATE`, `NOT_AN_ADMIN`, `LANGUAGE_MALFORMED`, `NO_SUCH_MEMBER`.
- R73: `translationMark` answers the same refusal for a `by` that is not an active member. It comes after `TRANSLATION_NOT_SHOWN`, as the code already ordered it. The note check (`TRANSLATION_NOTE_REFUSED`, outside R73's ordered list) stays between the two, as before.
- R75: row C-64.18 is removed from `INSTANCE_SETUP_CHECKS`, and a comment marks the number as dropped and never reused. The region `is-translation-member` went with it. `refusal()` no longer names the code.
- Detail change: the caller's own sentence ("Nothing was changed/recorded") gives way to R121's fixed one, as the draft (§5) says.

**Tests** (each changed id by name in the title, K874):
- `translations.test.mjs`:
  - R69: every `NO_SUCH_MEMBER` case (absent, machine identity, none named, and a revoked member) deep-equals `noSuchMember(<id asked>)`, with C-96.47, and writes nothing.
  - R73: a non-member is refused `TRANSLATION_NOT_SHOWN` first on a word not shown, then gets `noSuchMember("nobody")` on a shown word. A revoked member is refused the same way and nothing is recorded.
  - A new R75 test: no `NO_SUCH_MEMBER` row and C-64.18 held by no row; both sites answer C-96.47 with membership's translation.
  - R30: 15 of C-64.11–.26, and C-64.18 absent.
- `group.test.mjs`: R30's C-64 list excludes C-64.18.

**Reading set** (START B1; K2304, mechanics §17 (3)): the set is over 300 KB, because the code alone is 350 KB.
- Read whole myself: `build/requirements/instance-setup.md`; membership R84 and R121 and `noSuchMember` (`membership/index.mjs`:170–190); layer 11's row of `build/layers.md`; K2300, K2318; `plan/draft-T38-L11.md` §0 and §5; rule 6; the translation code `setup.mjs`:2030–2160 and :2470–2500, the row table :255–335; and `translations.test.mjs` whole.
- My worker read whole `setup.mjs` (195 KB), `setup-fleet.mjs`, `livefire.mjs`, `setup-words.mjs` and every other test file and fixture under my `tests` path. It wrote a summary of about 4 KB, citing file and line, of every mention of the row, the helper, `#isActiveMember` and the C-64 enumeration.
  - It found the one further site that mattered, `group.test.mjs`:136–139 (fixed).
  - It confirmed no other caller of `#translationMember` and no export-list test.
  - Nothing it left out (domain checks, seeding, probe, reports) bears on this entry.

**Deferred** (small flaws noted by the worker, not required by any requirement, left alone to keep the entry minimal):
- `translationMark` stores `by` untrimmed, where `translationGrant` trims `member`. It is harmless, since `by` is the control plane's stamp.
- `setup.mjs`:1's header lists requirements only to R66.
- The comment at `setup.mjs`:231–232 still says the R67–R73 rows await T38's stamp.

**Other modules** (in a `REPORT`):
- promotion `row-census.test.mjs` now also says "departed with no record: C-64.18 NO_SUCH_MEMBER". This is expected and within rule 6 item 2: the removal is stamped in T39 (K2275 (4)). The test was red before my change for the other rows listed there.
- `dist/bio-plane.bundled.mjs` (plane's generated artifact) still carries the row until it is regenerated at the layer's close (§14).
- answer-envelope `families.test.mjs`: the same three reds before and after my change (rule 6 items 13 and 17). My change adds none, and `NO_SUCH_MEMBER` resolves to membership's C-96.47 first.

**Tests and checks run:**
- `node --test bio-plane/test/m/instance-setup/*.test.mjs`: tests 130, pass 130, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 137 modules, 136 requirements files; 0 failures.
- `architecture`: 23 product files, 86 relative imports; 0 failures.
- `coverage`: 57 of 57 live requirement ids named by a test; 0 failures.
- `ownership` (tranche/T38): 4 files changed; 0 failures.

Size (session_01DvLwj9sgfMgyKyqYnjboLo): test runs 8, module lines 4228

## J1 · REPORT

Other modules, none needing a change from me: (1) promotion row-census.test.mjs now also lists 'departed with no record: C-64.18 NO_SUCH_MEMBER' — expected, rule 6 item 2, stamped in T39 (K2275 (4)); the test was red before for its other rows. (2) plane's generated dist/bio-plane.bundled.mjs carries the dropped row until regenerated at L11's close (§14). (3) answer-envelope families.test.mjs: the same three reds before and after my change (rule 6 items 13, 17); none added.

## J2 · COMPLETE

T38-23 applied (R69, R73 through membership.noSuchMember, R121, C-96.47; R75 C-64.18 dropped). instance-setup tests 130/130; format, architecture, coverage (57/57), ownership: 0 failures. Record: Completion (INSTANCE-SETUP #17). R69/R73/R75's '(not yet met: T38)' marks are BOB's to clear.

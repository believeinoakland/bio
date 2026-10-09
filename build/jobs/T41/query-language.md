# query-language (T41)

**Status** · session_01JR9CznEFmEJazBayQvKWQs · depth 2 · COMPLETE · handled B1

## Completion (QUERY-LANGUAGE #7)

**Reading set** (mechanics §17, K2304): over 300 KB (requirements 20 KB, own code 184 KB, own tests 128 KB, before the used modules' parts). Read whole myself: `build/requirements/query-language.md`; layer 5's row of `build/layers.md`; the plan's entry T41-10a, K2442 and K2448; membership R43, R44, R85, R88, R120 and its gate's code (`src/membership/index.mjs`:36–103, `schema.mjs`:85–91); text-chain R91 and its `MACHINE_READ_KINDS` (`textchain.mjs`:257); `fixture.mjs`, `grammar.test.mjs`, `converts.test.mjs`, `statements.test.mjs`, `fields.test.mjs`, `projection.test.mjs`, `t33.test.mjs`. A worker read the rest whole (`query.mjs`, `vocabulary.test.mjs`) and wrote a ~7 KB summary citing file:line. It covers: the gate imported and re-exported at `query.mjs`:1051/1060; one `viewerPredicate` call (:2256) placed in every shape (:2422–2808, the `vis` CTE :1952); no statement names `project_sight` except through the gate's SQL; every table the statements read; `MACHINE_READ_KINDS` re-exported (:456) and used at :749–758; and `vocabulary.test.mjs` pins neither the kinds nor a project's sight. Nothing it left out mattered: all 45 tests pass.

**Entry applied (T41-10a, tests only; no code or requirement change).**
- `grammar.test.mjs` (R6, was :210): `MACHINE_READ_KINDS` is no longer pinned as `["ocr", "ai"]`. The test now checks it is text-chain's export, equal to the `STEP_KINDS` that text-chain marks `machine` (its R91). It also checks the whole of R6's clause: every kind in that list (now including `ai_transcription`) selects its own rows and the `mixed` units.
- `fixture.mjs`: now holds membership's `project_sight` (R120's columns and check), with a `sight(project, setting)` helper. Cause of all seven reds: since D54 the gate's SQL reads that table, so every statement run with a member's viewer threw.
- Re-stated for D54. In each test, the founder (`admin`, and `member:admin` where it is a member viewer) and an active administrator neither invited nor joined are withheld the hidden project exactly as a member is. Each test has controls: an invited administrator, or the project set discoverable, is seen at `FULL`, while a member who is no administrator is still not.
  - `converts` R15 R16 R8 meaningread (was :270): rows, count and levels.
  - `statements` R11 (was :111): hidden bundles move neither order nor snippets for each of those viewers; P1 made discoverable enters the administrators' answer.
  - `statements` R15 (was :209): legs and count, on the owner and on the named bundle.
  - `fields` R26 (was :76): the founder and an administrator join the compared viewers; a discoverable project is added; D54 is asserted through the relations on filter, sort and facet.
  - `projection` R25 (was :62): the same through the projection relation, on page and count.
  - `t33` R28 (was :157/:172): every T33 field through its owner's relation.

**Tests and checks.**
- `node --test test/m/query-language/`: tests 45, pass 45, fail 0 (was 38/45). No layer tests are named in the manifest. No provided service changed, so users' suites were not run.
- `format` 0 failures; `architecture` query-language 0 failures; `coverage` 30 of 30; `ownership` 0 failures.

**Deferred: noted, not changed.** The worker raised three possible flaws in `query.mjs`. None is a breach of a requirement as it stands, and the job's entry is tests-only:
- `limit: 0` and `rowLimit: 0` read as the default, not as 1 (:2351, :2363). R12's test pins this as intended: 0 means absent.
- A reversed number range (`annotations:5..1`) matches nothing with no warning (:1542). Date ranges do warn (R27).
- The "ends before it starts" check for a range mixing a date and an instant compares a bound with its `Z` stripped (:1824–1827). This is an edge case, and no requirement names it.

**Found elsewhere.** The requirements text is stale in one place: the Size line still calls N37 future work, but it is done (`query.mjs`:1048–1060). That text is BOB's.

**Generated artifacts:** none staled (tests only).

Size (session_01JR9CznEFmEJazBayQvKWQs): test runs 6, module lines 0

## J1 · COMPLETE

T41-10a complete (77bbfd7b61), tests only, no code or requirement change. MACHINE_READ_KINDS re-pinned from text-chain's export: checked against STEP_KINDS' machine kinds, and every kind selects the mixed units (R6). The fixture gains project_sight (R120), which was the cause of all 7 reds. converts:270, statements:111/:209, fields:76, projection:62 and t33:157 are re-stated for D54: the founder and an uninvited administrator are withheld a hidden project; controls: an invited administrator, or the project discoverable, at FULL. query-language 45/45; checks: format, architecture, coverage (30/30), ownership all 0 failures. Reading set over 300 KB: read per (3), one worker summary of ~7 KB; nothing left out mattered. For BOB: the requirements' Size line still calls N37 future work (done). Record: build/jobs/T41/query-language.md, Completion section.

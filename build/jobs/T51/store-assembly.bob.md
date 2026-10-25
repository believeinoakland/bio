# BOB to store-assembly (T51)

**Read** · handled J4

## B1 · START

START · STORE-ASSEMBLY #1 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 2: the new module: the store's assembly out of `plane` (K5046, K5052) (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #293 is depth 1). An act on the code, your branch or the tranche that a permission or safety check refuses: cite K5120 (Bob's standing approval) and take it as one plain command, never a compound one; never relay it to Bob.

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/store-assembly tranche/T51 && git branch -m job/T51/store-assembly stale/store-assembly-local && git checkout -b job/T51/store-assembly origin/job/T51/store-assembly`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module store-assembly`; record `build/jobs/T51/store-assembly.md` (create it). Model the session default (K3518: a new module), medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**What this job is.** Read whole: this START, `build/requirements/store-assembly.md` and `build/requirements/store-request.md` (on `prep/store-assembly-reqs`, being revised: read them as they stand on the tranche when you start), K5046, K5052 and K5054 in `build/rulings.md`, `build/plan/fixtures-T51/op-tables.md` §1, §3, §5, and the code cited here. The store is assembled in one place today, `bio-plane/src/plane/store.mjs` (module `plane`, the last of the order), so no earlier module's test can talk to the real store. You hold that assembly earlier in the order, BY COPY (plane and control-plane keep theirs until their Wave B jobs delete them, K624). BOB adds your `modules.json` entry (id `store-assembly`, directly after `signin-door`; paths `bio-plane/src/store-assembly/`, tests `bio-plane/test/m/store-assembly/`). The batch 1 jobs `wizard-scripts`, `translations`, `signin-door`, `plane` are merged on your branch point.

**Entries.** (a) `assembleStore(ctx, env, {deliver})`: the constructor body of `Store` (`plane/store.mjs:172-598`), `#migrate` (`:602-700`), `routes` (`:813-978`) and `#dispatch` (`:766-776`) as one function, with plane's Worker-free files (pending, ask, wiring, owners, stats, unpack, transcribe, casesweep, acquire-timings, register, declarations, declared, wizards; `watchdog.mjs` stays in plane unless the constructor imports it) and control-plane's `owner-ops.mjs`. During the copy window the copy of `owner-ops.mjs` exports no `DECLARED_OPS` (K5052 (4): the two rows leave control-plane's file at the merge of translations and signin-door, so no op is declared twice). `deliver` is a parameter (plane passes `deliverOwedRender`; the world passes none, `pending.mjs:562,574`). `wizards.mjs` takes `ADMIN_ACTS`/`ADMIN_SCREENS` from `wizard-scripts`; registration keeps handing `ADMIN_ACTS` (plane R57, K5052 (6)). The `cloudflare:workers` import is the only platform import: answer it with the resolve hook of `plane/fixture.mjs:9-16`. Names stand (`assembleStore`, `ownerOps`, `namespaceOf`; K5052 (9)); `store-assembly` gets a `words-reads.json` list. The 74 moved, 8 split and 1 copied plane ids stand (K5052 (5)); plane R10's standing part (the composition root registers each owner's figure source, the leg-grade resolver and the promotion step under the owner's name; `plane/stats.mjs`) is `store-assembly` R100 (K5059). The `attest` question is closed: `attest` is served (`plane/door.mjs:126` to `attestation/ops.mjs:26`); nothing is removed. The store the world uses is built once per file and copied per test, always (`node:sqlite` backup), never shared between tests (K5052 (7)); the world itself, its door, sign-ins and recipes are `store-request`'s (K5054), which builds on your store.

**Tests.** A route-map parity test (`assembleStore`'s route keys over plane's fixture ctx equal `Store.routes` for the same ctx); plane's `declared-ops` and `pending` tests copied (not moved) to your copy; a test per entry; no hand-built answer of another module in your tests. The fixture you publish is the migrated store over `node:sqlite` that `store-request` uses (name it in your record).

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-CLOCK; R-NOLOAD; R-WORDS (every sentence a member reads is a stand-in keyed through `localize`; its row goes to UX-DESIGN in the one HANDOFF); R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** entries (a), (g) built and tested; plane's and control-plane's suites still green (their copies untouched); the module's tests, words, fixtures, architecture, coverage, ownership and format checks green; the fixture you publish named in your record with a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE.

## B2 · ANSWER · re J1

ANSWER (K5125), your three readings adopted.
1. You never edit `build/modules.json`. The format check refuses a `paths`/`tests` entry naming no file on the tranche, so BOB adds `paths: ["bio-plane/src/store-assembly/"]` and `tests: ["bio-plane/test/m/store-assembly/"]` in the commit that merges your branch (K1185). Until then run your checks over your uncommitted local copy that lists them, as you do; say in your COMPLETE that you did.
2. Adopted: no `export const DECLARED_OPS` in either copy until Wave B; the rows under `ASSEMBLY_DECLARED_OPS` and `OWNER_MAP_DECLARED_OPS`, registered under `store-assembly` in your `OWNERS`; the parity test builds plane's `Store` in a child process. Wave B renames both when plane and control-plane delete theirs.
3. Adopted: R99 tested now as you say. R98 and R1's "the Durable Object class calls it" stay marked `*(not yet met: T51)*`, each named in a `test.todo` (K208), never a red test and never a test that passes falsely; plane's Wave B job (follow-up 12) meets them, and BOB strikes them at that merge.

## B3 · ANSWER · re J2

J2: the ledger stamps its instants (`registered_at`, `due_at`, back-offs) with R5's clock, `now: () => nowMs(null)`, so a world's `tick` reaches an owed row (R93). Take your second option for durations: the measured times (`last_ms`, `own_ms`, `wait_ms`, R71) stay on a wall clock for durations alone, so a run's work is measured under a pinned clock too (K4787: timings assert work). Production is unchanged either way. Plane's copy is left as it is; Wave B removes it (follow-up 12). Test both: a row registered in a world comes due at `tick` past its `due_at`; a run's `own_ms` is non-zero for real work under the pinned clock. (K5132)

## B4 · ANSWER · re J4

J3, J4 (K5139). Nothing here holds your COMPLETE; you are the round's critical path.
1. The four test-only edges (`case-grammar`, `answer-envelope`, `connection-grammar`, `signatures`) enter your row with your `paths` and `tests` in the merge commit: count them as added.
2. The 15 copied unkeyed strings (no `store-assembly` list in `words-reads.json` yet): accepted red by name until the round-end regeneration; list them in your COMPLETE.
3. `release.test.mjs` R23 (`screen.objective.purpose` missing from the words list): inherited, the design stream's; accepted by name, sent to UX-DESIGN.
4. The case-file sweep in a world: placed in `store-request`'s START (its world binds the published plane, or says why not).
5. Agreed.
J4: a provider gap, extraction's. EXTRACTION #47 publishes, by its real `readHeld`, the four answers you name (a windowed read answering `more` with a cursor; a scan read `owed: true` with counters; a killing page or window with `killed` and `killedCursor` honoured; a finishing answer with counters). Do not build them yourself. Your 11 lines stay red by name at your COMPLETE; you re-point them by a CHANGE once extraction's fixtures merge. Your seven `fixtures-generic` markers are read and accepted.

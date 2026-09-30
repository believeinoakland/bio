# instance-setup (T15)

**Status** · session_01MPeZXWNffPSns1vrpkvF5F · depth 2 · WORKING · handled B1

## J1 · QUESTION

B1 says my tests confirm the frame "through control-plane's door". control-plane is after instance-setup in the order (it uses instance-setup), and `checks/architecture.mjs` checks the imports of `tests` too, so `test/m/instance-setup/` may not import `src/control-plane/dispatch.mjs`. My best reading, which I am building on: as the plan's N348 wording (draft-T14-wordings-2 point 3) says, the fixture builds its own frame over `instanceSetupOps`: R26's body read (`BAD_JSON` 400), the own-keys route lookup (unknown op 400), the `{ok: true, result}` envelope and R25's catch (500 `STORE_INTERNAL_ERROR` with a correlation id, no stack), reproducing control-plane's door as instance-setup's tests reach it. The confirmation through the real door is control-plane's `store-class.test.mjs` (R35), which already drives all fourteen routes through `D.Store`. No test of mine imports control-plane.

## J2 · REPORT

For control-plane (runs beside me in layer 11): removing `instanceSetupStore` and `instanceSetupRoute` from `bio-plane/src/setup.mjs` breaks control-plane's `bio-plane/test/m/control-plane/store-class.test.mjs`, which imports both as its "before" comparison: :93 (`new (S.instanceSetupStore(D.Store))(...)`, the legacy-index wrapper arm of the first R35 test), :115 (`S.instanceSetupRoute(m, req(drive))`, the per-route before/after comparison) and :167 (`S.instanceSetupRoute(...)`, the negative control that the old door leaked the stack). Its header comment (:3) also names `instanceSetupRoute`. Those three arms need rewording by CONTROL-PLANE #6 (e.g. compare against `instanceSetupOps(m, url, body)[op]()` directly, and drop the wrapper arm now that no wrapper exists). Comment-only mentions outside my tests, no code: `bio-plane/test/bounds.test.mjs`:182 and `bio-plane/test/identity-claims.test.mjs`:183 (legacy-tests'). Nothing in `bio-plane/src/` other than setup.mjs itself references either name (legacy-index dropped its wrap in T14).

## Completion

**Entries applied.** N348's remainder (K445, B1). `instanceSetupRoute` and `instanceSetupStore` are gone from `bio-plane/src/setup.mjs` (T15 base :2418–2449): this module keeps no Durable Object door or class of its own. `instanceSetupOps` (the fourteen routes) is unchanged; its comment now says the map joins control-plane's one route map (its R35), so every route passes R26's body read, R27's existence read, the envelope and R25's catch. The fixture's frame (`test/m/instance-setup/fixture.mjs`:9, :137) is replaced by the fixture's own `frame(m, req)` over `instanceSetupOps`, reproducing control-plane's door as these routes meet it (absent body null, `BAD_JSON` 400, `{ok: true, result}`, a throw 500 `STORE_INTERNAL_ERROR` with a correlation id and no stack); on my best reading in J1, since control-plane is later in the order and `architecture.mjs` checks test imports. No `src/` file other than `setup.mjs` named either export.

**Not yet met marks my work meets.** None. Found while reading (requirements are BOB's): the Status line of `build/requirements/instance-setup.md` still reads "Not yet met: R12–R16 (N10; …), R24's counterparty shape (N235), R25 (D-719)", and R34 still carries its inline *(not yet met: K98; …)*, though K417 and K441 struck R12–R16, R24, R25 and the Status line itself says R34 is met (K417); each has a passing test at the interface (`profiles.test.mjs`, `page.test.mjs`, `limits.test.mjs`). They look stale; BOB to strike if so.

**Check rows.** None added, moved or retired: nothing awaiting stamp.

**civicos-ui/ and affordances' lists.** No hit for `instanceSetupRoute` or `instanceSetupStore`.

**Deferred.** None.

**Found in other modules** (J2 REPORT, and J3):
- `control-plane`: `bio-plane/test/m/control-plane/store-class.test.mjs` imports both removed exports as its "before" comparison and is red in three arms with my change: :93 (the wrapper arm of "R35: the class the instance exports…"), :115 ("R35: instance-setup's fourteen routes…", per-route before/after) and :167 ("R35: a throwing instance-setup route…", the stack-leak negative control); header comment :3. `node --test bio-plane/test/m/control-plane/`: tests 52, pass 49, fail 3 (exactly those). For CONTROL-PLANE #6 through BOB.
- `legacy-tests`: comment-only mentions at `bio-plane/test/bounds.test.mjs`:182 and `bio-plane/test/identity-claims.test.mjs`:183; no code breaks.
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; its input includes `src/setup.mjs`). Not rebuilt.

**Tests.**
- `node --test bio-plane/test/m/instance-setup/`: tests 58, pass 58, fail 0, todo 0 (two new: `relay.test.mjs` "R43 N348 through the frame…" — a route that throws is the frame's `STORE_INTERNAL_ERROR` and the relay carries that very correlation id, no stack; non-JSON POST is `BAD_JSON` and nothing is seeded; empty body is null; with a negative control — and `exports.test.mjs` "N348 …no Durable Object door or class of its own…").
- The 30 older suites under `bio-plane/test/` that read `setup.mjs`: tests 35, pass 28, fail 7 (bias, bounds, d470-catalog-census, d484-refusal-translation, d84-case-manifest, derivation-bounds, meaning-bounds), each failing identically on `origin/tranche/T15` without my change (same counts; same failing test names compared for the four bounds/translation suites). Not this change's.
- No layer tests are named in `build/manifest.md`.

**Checks** (civicos-process @ a7155f0c4a): `format`: 69 modules, 64 requirements files; 0 failures. `architecture instance-setup`: 12 product files, 41 relative imports; 0 failures. `coverage instance-setup`: 43 of 43 live requirement ids named by a test; 0 failures. `ownership instance-setup tranche/T15`: 5 files changed; legacy-store, legacy-checks, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01MPeZXWNffPSns1vrpkvF5F): test runs 8, module lines 2863

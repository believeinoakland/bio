# admission (T19)

**Status** · session_01Fw5r9w5jim55wUjmoiT186 · depth 2 · COMPLETE · handled B2

## Completion (ADMISSION #2)

**Entries applied** (START B1):
1. **The re-points (K637, K757).** Both lookups the module makes already reach credentials: the store's `session` and `aicredentiallook` routes are served by `credentialsOps` (credentials' map; membership's map names neither since its L2 deletion). Admission reaches both through the store's route and the door's `doAnswer`, never by calling credentials' code, so no import was added and the code path is unchanged. The prose that named membership now names credentials: `index.mjs` R6's agent-credential lookup (`credentials.aiCredentialLook`, its R15), the session lookup (`credentials.session`, its R5; was `membership.session`), the mint's forward (`credentials`' mint, its R12; was "membership's mint"); `checks.mjs`' C-29 header ("the mint's and the revocation's rows are credentials'").
2. **A new R6 test** (`authentication.test.mjs`) pins the re-point at the interface: admission's two requests, as sent, are answered by credentials' own op map (through `session` and `aiCredentialLook`), membership's map answers neither, and an unknown session or credential resolves to no one through the same routes (negative controls).
- **Rule 1:** no admission file imports `bio-checks.mjs` (measured: none; `MACHINE_CLASS_PREFIX` is record-grammar's).

**Deferred:** none.

**Reports (BOB's):**
- **Requirements wording** (`build/requirements/admission.md`): R6 still says "resolved as a session through `membership.session`", and Uses (line 44) names `membership: session (R6), through the store's route`. Both are now credentials': R6 → `credentials.session` (its R5); Uses → `credentials`: `session` (R5) and `aiCredentialLook` (R15), through the store's routes. The agent-credential half of R6 names no module today; naming credentials' R15 there too would be consistent.
- **Edges** (`modules.json`): admission's `uses` already lists `credentials` (the START expected it missing). No admission source reaches `membership` any more (measured: no import, no route of membership's map); only the new test imports `membershipOps` to show it answers neither route. The `membership` edge is BOB's to keep or drop.
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (admission source changed, comments only; regenerate at the layer close, §14).

**Tests and checks:**
- `node --test test/m/admission/` (bio-plane): 19 tests, 19 pass, 0 fail. No layer tests named in `build/manifest.md`; no service I provide changed.
- `format`: 87 modules, 82 requirements files; 0 failures · `architecture admission`: 9 product files, 16 relative imports; 0 failures · `coverage admission`: 16 of 16 live requirement ids named by a test; 0 failures · `ownership admission tranche/T19`: 4 files; 0 failures.

Size (session_01Fw5r9w5jim55wUjmoiT186): test runs 1, module lines 848

## J1 · COMPLETE

Complete: B1 applied. Both lookups already reach credentials through the store's routes (session, aicredentiallook are credentialsOps'; no import added, code path unchanged); admission's prose re-pointed to credentials R5/R12/R15, and a new R6 test pins both routes to credentials' op map (membership's answers neither), with negative controls. admission 19/19; format, architecture, coverage (16/16), ownership 0 failures. Reports in my record: requirements R6 and Uses (admission.md:44) still name membership.session; uses already lists credentials; no admission source reaches membership now (the edge is yours); plane bundle stale (comments only).

## Change B2 (K853)

- `admission.test.mjs`:197 (the R5–R12 order test): the altered revoked credential now always differs from the original (its last character becomes `1` when it is `0`, else `0`), so the arm no longer resolves to the revoked credential about 1 run in 16.
- `node --test test/m/admission/`: 20 consecutive runs, each 19 pass, 0 fail. `format`, `architecture admission`, `coverage admission` (16/16), `ownership admission tranche/T19`: 0 failures.

Size (session_01Fw5r9w5jim55wUjmoiT186): test runs 21, module lines 848

## J2 · COMPLETE

B2 applied: admission.test.mjs:197's altered revoked token now always differs from the original (last char becomes 1 when it is 0, else 0). admission 19/19 on 20 consecutive runs; format, architecture, coverage (16/16), ownership 0 failures.

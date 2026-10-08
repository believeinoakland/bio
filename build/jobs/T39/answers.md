# answers (T39)

**Status** · session_01V8KJuWEPKX3WrBN7Ff1rdT · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied.** T39-7 (N803), as BOB's START and K2343 narrow it: the `answers → ai-runs` edge is already in `modules.json` and the Uses line in the requirements (BOB's); `countAskUsage` and an ask's account are store-door's and agent-worker's (K2343), not this module's. R19's sign-in arm: `standing.mjs`'s `heldBack` already answered it, since it takes any `accountFor` answer at level `member` as the author's own act, reads the ceiling (`ceilingRefusal`, ai-runs' `aiUseCheck`) for every account before the grant, and maps R32's `STANDING_SWITCH_OFF` to `{condition: "switch_off", switch: "member"}`, carrying no account (`acct` is dropped before the ceiling). No behaviour changed; the arm is now named in `heldBack`'s comment, and the comments that said ai-runs was "not merged" (`index.mjs` deps, `fixture.mjs`, `standing.test.mjs` header) now say the ceiling is `aiUseCheck` handed in by the composition root.

**Test.** `standing.test.mjs` "R19 the sign-in arm": carol, with no reference and no group key, connected through `credentials.subscriptionConnected` (real credentials, R43), so `accountFor` answers `{kind: "signin", level: "member", member: "carol"}` and R32 refuses `STANDING_SWITCH_OFF`. A run that finds something new is held back `{switch_off, member}`; credentials is read in the order `aiKeptAway`, `accountFor`, `aiGrantMintStanding`; the ceiling is asked for carol before the grant, and its refusal holds the run back first (no grant asked); no grant row is minted and the answerer stub is never called; each run's finds reach carol once with `answer` null; no stored run names `signin`, `no_account` or `kept_away`.

**Reading set (§17).** Measured: own requirements 25 KB, the code 92 KB, the tests 98 KB, the 19 used modules' Purposes 12 KB, and the used services named in Uses (credentials R32, R35, R43; ai-runs R48, R50, R52) about 10 KB: about 240 KB, under 300 KB, so all of it was read whole by this session, with layer 6's row of `build/layers.md`, the plan entry and K2304, K2275, K2334, K2343 (and K2283). No worker summary.

**Deferred.** None. **Other modules.** None found.

**Tests and checks.**
- `node --test bio-plane/test/m/answers/`: tests 47, pass 47, fail 0 (46 before, plus the new one).
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 139 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs answers`: 17 product files, 55 relative imports; 0 failures.
- `checks/coverage.mjs answers`: 29 of 29 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs answers tranche/T39`: 5 files changed by answers between tranche/T39 and HEAD; 0 failures (after the commit).

Size (session_01V8KJuWEPKX3WrBN7Ff1rdT): test runs 3, module lines 1584

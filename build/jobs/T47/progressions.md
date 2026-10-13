# progressions (T47)

**Status** · session_01AS7C41DV4eQ7LTLWBsHCN7 · depth 2 · COMPLETE · handled B1

## Completion (PROGRESSIONS #12, session_01AS7C41DV4eQ7LTLWBsHCN7)

**Read (P20, mechanics §6 step 2).** I read these whole myself: `build/requirements/progressions.md` (public and private parts), the module's code (`src/progressions/index.mjs`, `checks.mjs`, `schema.mjs`) and all 13 test files and the fixture in `test/m/progressions/`. The reading set measured 751 KB at START, so a helper in this session read the used modules' Purpose and the services named in Uses, and layer 5's contract in `build/layers.md`, whole, and wrote a digest (K2032). Nothing in the used modules bears on a request's instant: civil-time has no clock (its R26), so the module's own clock resolves the instant it is given.

**Entry applied (T47-69; N983, K3027, K3033).**
- `progressionOps` no longer reads a request's instant. `proposals` calls `proposalsFeed()`, and `captureprogressions` calls `captureProgressions({captureSha})`. A `now` or `nowMs` in the query or the body is never read; the body was never read by these two ops.
- Both ops are judged at R16's configured clock: `progressionsOf`'s `nowMs`, else `env.BIO_NOW_MS`, else the wall clock.
- In-plane callers (queue-producers, calculations, intent) keep passing their own instant to `proposalsFeed` and `captureProgressions` (R16). The signatures are unchanged.
- The plane builds the instance with `env` first (`plane/store.mjs` `progressionsOf(ctx, { env })`, before any other caller), so `BIO_NOW_MS` reaches it.
- Comments: the factory's `nowMs` note and the two feeds' doc comments state R43.

**Tests.** New: `serverclock.test.mjs`, 4 tests naming R43.
- Through `progressionOps` with a URL and a body, each op answers exactly as the request without an instant. The request carries the instant in every form: `now` and `nowMs`, in the query and the body, before and after the deadline, malformed, and several at once. This holds with the clock both before and after the deadline, so the instant is shown ignored in both directions, and the clock itself is shown read (the two answers differ).
- `BIO_NOW_MS` governs when no clock is given, and is read on every request. The configured clock wins over it. With neither, the wall clock governs. No request overrides any of the three.
- Control: an in-plane caller's own instant is still honoured.
- The fixture's `world` takes `env`, passed to `progressionsOf`.
- Reproduced first: against the old routes, all 4 new tests fail; with the change they pass.

**Flaws in my own module.** None found. Deferred: nothing.

**Found elsewhere (also in my REPORT).**
- (a) Requirements text: R43 names only `op=proposals`, and the T47 Suggestions bullet still says `captureprogressions` "is left as it is and reported to BOB". The plan entry and K3033 ("progressions also `captureprogressions` (same rule, K3027)") make it part of this job, so I applied it to both ops and tested it under R43 and R19. R43 (or R19), and that Suggestions bullet, need BOB's wording to match.
- (b) Generated artifact: `src/progressions/index.mjs` changed, which stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at the layer close. I did not write it.

**Ran.**
- `node --test bio-plane/test/m/progressions/`: tests 67, pass 67, fail 0.
- The in-plane callers' suites, interface unchanged: queue-producers 74/74, calculations 55/55, intent 82/82, queue 142/142, money-checks 48/48.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs bio progressions`: 0 failures.
- `checks/coverage.mjs bio progressions`: 43 of 43 live ids, 0 failures.
- `checks/ownership.mjs bio progressions tranche/T47`: 0 failures.
- `checks/run.mjs`:
  - format, architecture (3066 files) and channels: 0 failures each.
  - coverage: 41 failures, none progressions'. All are other modules' ids marked not yet met (rule 5 (1)).

Size (session_01AS7C41DV4eQ7LTLWBsHCN7): test runs 12, module lines 2132

## J1 · REPORT

(a) R43 names only op=proposals, and progressions' T47 Suggestions bullet still says captureprogressions 'is left as it is and reported to BOB'. T47-69 and K3033 ('progressions also captureprogressions (same rule, K3027)') make it part of this job, so I applied R43's rule to both ops and tested captureprogressions under 'R43 R19'. R43 (or R19) and that bullet need wording to match. (b) src/progressions/index.mjs changed, which stales the plane bundle; regenerate at the layer close (I did not write it).

## J2 · COMPLETE

T47-69 applied: op=proposals and op=captureprogressions are evaluated at R16's configured clock; a now or nowMs in the query or the body is never read; in-plane callers keep their own instant. New serverclock.test.mjs (R43, 4 tests, reproduced failing on the old routes). progressions 67/67; queue-producers, calculations, intent, queue and money-checks green. format, architecture and ownership: 0 failures; coverage 43/43; run.mjs coverage reds are other modules' (rule 5 (1)). One REPORT (J1). Record on job/T47/progressions.

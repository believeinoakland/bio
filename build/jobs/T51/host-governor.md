# host-governor (T51)

**Status** · session_01E5aZgMS5PZNR6n1pGjwdGB · depth 2 · WORKING · handled B3

## Completion (fix round 3, wave 1)

- **Entries applied.** C13 (my part, P4b), requirement R29. `governorAdmit({host, peek: true})` answers exactly as R1–R6 would at that instant and writes nothing: no state for an unmet host (R2's full burst answered from an in-memory row), no token, no grant, `refused_total` and cool-off untouched, not even the refilled balance on an R5 refusal. Only `peek === true` peeks; any other value books as before. `governedFetch` is unchanged and books once. The option is declared in `governorAdmit`'s doc comment (the one place the module declares what it accepts; `governoradmit` is a store route, not a census op in `op-declarations`, K4208); `governorRoutes` already forwards the body, so a Worker's peek reaches it.
- **Tests.** New `bio-plane/test/m/host-governor/peek.test.mjs` (8 tests naming R29, R1, R6, R16), written first and seen failing (peek booked: `granted` 2 for 1; `refused_total` 1 for 0), then green. Controls: two plain `governedFetch` calls book two grants spaced as R6 spaces them; a booking at the same instant answers as the peek did; non-`true` `peek` values book.
- **Deferred.** None.
- **Found in another module.** Acquisition still calls `governorAdmit({host})` at its render arm (`acquisition/index.mjs:912`) and must pass `peek: true` there (R97, merged after me, this wave). Until it does the double booking stands. Not a flaw here.
- **Runs.** host-governor 47 pass, 0 fail. Direct users (impact names 113 modules transitively; I ran the eight that use host-governor): acquisition 185/0, capture 228/0, capture-requests 129/0, network-notices 75/0, monitoring 168/0, machinery-producers 35/0, instance-setup 217/0, plane 279 pass / 1 fail. The plane failure is `plane` R24 (screen words "this instance"), not touched by my diff; red on the tranche tip, named not fixed.
- **Checks.** coverage: host-governor clean (R29 named). format: 1 failure, `build/rulings.md:4346` K4349 (tranche tip, not mine). architecture 0, words 0, ownership 0 (3 files changed: index.mjs, peek.test.mjs, this record).
- **Double.** Provider order: I provide; nothing consumed from another wave-1 job.

Size (session_012JfPrhVAyX8eCRnPmwMWYQ): test runs 14, module lines 447

## J1 · COMPLETE

C13 (my part, P4b) met: R29. governorAdmit({host, peek:true}) answers as R1-R6 would and writes nothing (no state for an unmet host, no token/grant/refusal/cool-off change); only peek===true peeks; governedFetch unchanged. New peek.test.mjs (8 tests, seen failing first, controls). host-governor 47/0. Direct users: acquisition 185/0, capture 228/0, capture-requests 129/0, network-notices 75/0, monitoring 168/0, machinery-producers 35/0, instance-setup 217/0, plane 279/1 (plane R24 screen-words, not my diff, red on tranche tip). Checks: coverage host-governor clean, architecture 0, words 0, ownership 0; format 1 on tranche tip (rulings.md K4349), not mine. For BOB: acquisition must pass peek:true at acquisition/index.mjs:912 (R97) or the double booking stands. Size (session_012JfPrhVAyX8eCRnPmwMWYQ): test runs 14, module lines 447

## J2 · QUESTION

STEP 0 REPORT, N-slow-refuse (R-FOUR (1)): root cause NOT in host-governor as hypothesised; asking BOB's release and one decision.

WHAT I MEASURED (local, real clock, real HostGovernor on SQLite, real `governedFetch`, two stub HTTP hosts, 127.0.0.1):
- host answering 403: request 1 fetched, 521 ms, `{res: 403}`; requests 2 and 3: 0 ms, `{refusedByGovernor, reason: cooling_off, retry_in_ms: 29999, last_refusal_status: 403}`.
- host answering 429 + `Retry-After: 60`: request 1 3 ms `{res: 429}`; requests 2 and 3: 0 ms, `retry_in_ms: 60000` then `59999`.
So today a cooling host is refused at once and `governedFetch` never sleeps out a cool-off or a Retry-After. The only sleep in the module is `host-governor/index.mjs:325` `if (waitMs > 0) await sleep(waitMs)`, R6's jittered gap: at the default appetite 12/min it is at most 7.5 s (gap 5 s x j<1.5), at appetite a/min at most 90 s / a. It is not bounded by any `maxWaitMs` (the name R30 uses; it does not exist in the code), so a low `GOVERNOR_APPETITE_PER_MIN` or a host configured low would hold one request for up to a minute or more. On first contact with a host `last_grant_at` is 0 and the wait is 0, so this sleep cannot make a FIRST capture of api.github.com/zen, timeanddate.com or random.org take 60 s.
- Plain GETs of the three sites from this container, no proxy, 2026-10-21: api.github.com/zen 403 in 0.07 s; timeanddate.com 403 in 0.24 s; random.org 200 in 0.39 s. The sites refuse fast; the time is spent in our path, not theirs.
- Where the path goes after a refusing answer: `acquisition/index.mjs:1033` governed fetch; a non-ok status returns at `:1110-1112` `answer(502, SOURCE_REFUSED)` straight after `noteOutcome` (`recordSourceOutcome`). Before the fetch the only timed stage that can wait is `addressReputation`, bounded at 5 s (`REPUTATION_TIMEOUT_MS`, :1572). Nothing on that path sleeps 60 s by my reading.
- I could not read the smoke copy's `governorstate` (it needs a signed-in browser session; plain read of the home page answered 200 in 4.4 s). That row would show whether the instance carries a low `GOVERNOR_APPETITE_PER_MIN` or a configured appetite for these hosts.

READING, stated as a reading and not a proof: the 60.5 s is not a governor cool-off sleep. Candidates, in the order I would test: (a) R6's wait_ms with a low appetite binding or per-host appetite on the smoke copy (the walker's three sites may each have been visited before, spending the burst, then waiting the gap); (b) a stage outside this module before or after the fetch (the door's capture path, `capture-requests` retry, or the object not answering: the same STORE_DID_NOT_ANSWER family as C5a's 36.8 s). The door phase clock BOB has planned for C5a (`timings.door`) would name it; mine cannot.

WHAT I WILL DO WITHOUT WAITING (R30 is mine whatever the cause): `governedFetch` caps its R6 wait at `maxWaitMs` and, over it, refuses as R5 refuses (`retry_in_ms`, nothing fetched); admit stays at once for cooling hosts; tests with the two stub hosts, red first. Proposed `maxWaitMs`: 3000 ms (R30's 3 s bound), a `governedFetch` option with that default, so a refused host returns within 3 s.

QUESTIONS FOR BOB (smallest things):
1. Release: may I write the R30 fix above (cap at `maxWaitMs`, default 3000)? It is correct by R30 whatever step 0 finds, but it may not be the whole of N-slow-refuse.
2. R30 says a refused host "is refused to the caller": today the FIRST request to a 403/429 host returns `{res}` with that status (the page's own answer, 3 ms to 521 ms) and only LATER requests return `{refusedByGovernor}`. I read R30 as: the first returns the status quickly (caller sees 403/429, R9 records the cool-off with `retry_in_ms` available through the record), the second is `refusedByGovernor` with `retry_in_ms`. Please say if the first must also carry `retry_in_ms` (then `governedFetch` would return `{res, retry_in_ms}` additionally after a 403/429).
3. The cause needs a stage clock I cannot read from here. Is the smoke `governorstate` read (signed-in, read-only) wanted from me, or does BOB's C5a door clock cover it? Until then the walker's 60.5 s stays UNEXPLAINED by my module and the cause stays open under R-FOUR (1); acquisition (seam owner) carries the whole-path test.

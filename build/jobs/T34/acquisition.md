# acquisition (T34)

**Status** · session_01JnE9bHgWiNuuBC1kUAXAsw · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** T34-65 (N615, K1683): `acquire` hands `profileOf` the capture's origin, `"member"` exactly when R16's `capture.actor_class` is `member` (a member session), `"fetch"` for every other caller (probe, admin, daemon, the capture-request and sweep arms); `profileOf` takes an optional `origin` and passes it to `doctypeFor` as `ctx.origin` (absent, none is stated, so a member-only type fails closed). court-doctypes R2 (`ecourt_roa`) reads exactly that value. No requirement changed (req: none).

**Fixed in this module.** K1737's "plane acquisition ×2" reds are this module's own `profile.test.mjs` (R17's calendar and PDF arms), red since docprofile stopped registering default types. They now register two test-local content types through docprofile's `registerDoctype` (a declared use), so the module's tests import no undeclared module; the R17 assertions are unchanged in substance (the recorded key, version, confidence, signals, contract, fallback). That red is cleared here, not at T34-76.

**Deferred.** None.

**Found in other modules (for BOB).**
- `capture` (R65, the knock's pull, `bio-plane/src/capture/index.mjs` ~793): calls `profileOf` with no `origin`, so a member's knocked capture is profiled with none stated and a member-only type (court-doctypes R2) never matches it. If a knock is a member's own capture, capture should pass `origin: "member"`; capture's call, not changed here.
- Doctrine note on K1683: `actor_class === "member"` means a member *session* asked the plane to fetch; the bytes are still fetched by the instance, not "made in their own browser" as court-doctypes R2's why words it. Built as K1683 rules; flagged in case R2 means the member-browser path only.
- `build/plan/starts-T34/findings-before-start.md` line 19 and K1737 place these two reds in plane (T34-76); they were acquisition's and are cleared.

**Tests and checks.**
- `node --test bio-plane/test/m/acquisition/`: tests 88, pass 88, fail 0 (new `origin.test.mjs`, 4 tests named R17 (N615)).
- `node --test bio-plane/test/m/capture/` (the other `profileOf` caller): tests 118, pass 118, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture`: 15 product files, 59 relative imports; 0 failures. `coverage`: 37 of 37 live requirement ids named by a test; 0 failures. `ownership`: 4 files changed by acquisition between tranche/T34 and HEAD; 0 failures.

Size (session_01JnE9bHgWiNuuBC1kUAXAsw): test runs 9, module lines 1812

## J1 · COMPLETE

T34-65 applied: acquire hands doctypeFor ctx.origin "member" (actor_class member) or "fetch"; profileOf takes optional origin. Also cleared K1737's 'plane acquisition ×2' reds, which are this module's profile.test.mjs (now register test-local types via docprofile; no undeclared import). acquisition 88/88, capture 118/118; format, architecture, coverage (37/37), ownership 0 failures. Reported in record: capture R65's knock pull passes no origin; K1683's actor_class=member is a member session's server fetch, not a member-browser capture as court-doctypes R2's why words it. Details in the record.

## B2 · CHANGE (K1773) applied

Tranche merged. Origin is now `"member"` only for bytes a member supplied by their own act outside the copy (upload, knock); every fetch the copy makes is `"fetch"`, a member session's request included. So `acquire` hands `profileOf` `origin: "fetch"` on every arm (it has no path taking member-supplied bytes); `profileOf`'s optional `origin` stays for a caller that profiles member-supplied bytes. `origin.test.mjs` re-written: every acquire (member, probe, admin, capture-request daemon) hands `"fetch"`; a member-only type never matches an acquire and matches the same bytes profiled with `origin: "member"`. My earlier doctrine flag is resolved by K1773. Still for BOB: capture R65's knock pull calls `profileOf` with no origin; under K1773 a knock is member-supplied and should pass `"member"` (capture's change).

Re-run: acquisition 88/88 (0 fail); capture 118/118 (0 fail); format 0 failures; architecture 15 files, 59 imports, 0 failures; coverage 37/37, 0 failures; ownership 2 files changed, 0 failures.

Size (session_01JnE9bHgWiNuuBC1kUAXAsw): test runs 12, module lines 1814

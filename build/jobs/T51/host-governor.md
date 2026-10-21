# host-governor (T51)

**Status** · session_012JfPrhVAyX8eCRnPmwMWYQ · depth 2 · COMPLETE · handled B1

## Completion (fix round 3, wave 1)

- **Entries applied.** C13 (my part, P4b), requirement R29. `governorAdmit({host, peek: true})` answers exactly as R1–R6 would at that instant and writes nothing: no state for an unmet host (R2's full burst answered from an in-memory row), no token, no grant, `refused_total` and cool-off untouched, not even the refilled balance on an R5 refusal. Only `peek === true` peeks; any other value books as before. `governedFetch` is unchanged and books once. The option is declared in `governorAdmit`'s doc comment (the one place the module declares what it accepts; `governoradmit` is a store route, not a census op in `op-declarations`, K4208); `governorRoutes` already forwards the body, so a Worker's peek reaches it.
- **Tests.** New `bio-plane/test/m/host-governor/peek.test.mjs` (8 tests naming R29, R1, R6, R16), written first and seen failing (peek booked: `granted` 2 for 1; `refused_total` 1 for 0), then green. Controls: two plain `governedFetch` calls book two grants spaced as R6 spaces them; a booking at the same instant answers as the peek did; non-`true` `peek` values book.
- **Deferred.** None.
- **Found in another module.** Acquisition still calls `governorAdmit({host})` at its render arm (`acquisition/index.mjs:912`) and must pass `peek: true` there (R97, merged after me, this wave). Until it does the double booking stands. Not a flaw here.
- **Runs.** host-governor 47 pass, 0 fail. Direct users (impact names 113 modules transitively; I ran the eight that use host-governor): acquisition 185/0, capture 228/0, capture-requests 129/0, network-notices 75/0, monitoring 168/0, machinery-producers 35/0, instance-setup 217/0, plane 279 pass / 1 fail. The plane failure is `plane` R24 (screen words "this instance"), not touched by my diff; red on the tranche tip, named not fixed.
- **Checks.** coverage: host-governor clean (R29 named). format: 1 failure, `build/rulings.md:4346` K4349 (tranche tip, not mine). architecture 0, words 0, ownership 0 (3 files changed: index.mjs, peek.test.mjs, this record).
- **Double.** Provider order: I provide; nothing consumed from another wave-1 job.

Size (session_012JfPrhVAyX8eCRnPmwMWYQ): test runs 14, module lines 447

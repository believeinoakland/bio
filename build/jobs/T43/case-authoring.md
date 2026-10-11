# case-authoring (T43)

**Status** · session_0115vgTqhQQu4wvo26nopLhu · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

**The fixture's doorbell import has no Uses edge.** K2710 and your START have my fixture build doorbell's tables with `doorbellOf(ctx)` before it inserts into `inbox`. I did that (`test/m/case-authoring/fixture.mjs`: `doorbellOf(host, {capture, record, provenance, credentials})`, right after capture), and it clears rule 4 (12)'s four reds: case-authoring is now 185/185.

`node checks/architecture.mjs . case-authoring` now fails once: "fixture.mjs imports bio-plane/src/doorbell/index.mjs of doorbell, which case-authoring does not declare in uses". doorbell is layer 3, earlier than case-authoring, so the edge is legal.

**My reading:** you add `doorbell` to case-authoring's `uses` in `modules.json`. The need is test-only, for the fixture's inbox. The Uses text in the requirements needs a matching line, which is yours.

**The other route:** the fixture could reach doorbell through `sources`' lazy getter. A read on `sources` would call `doorbellOf(ctx)` with its default `captureOf(ctx)`, which builds a second capture instance on the host. It also couples the test to sources' laziness, so I would not take it.

The code is committed either way. I complete once you answer, or once the edge is on the tranche branch.

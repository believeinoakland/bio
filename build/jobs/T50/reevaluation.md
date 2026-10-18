# reevaluation (T50)

**Status** · session_01Td1QmUQTUV5AKbrnBaHn9P · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T50-14 · reevaluation is complete: R37 and R38 are met.

**Entries applied**
- R37: `adoptVersion` now passes `author: who` inside `version`, after `relationship`, as `basis-versions` R28's documented call takes it (`bio-plane/src/reevaluation/index.mjs`). The version row names the adopting member. `versionAccept` reads it as a member's own, so no `onMachinePassage` question is asked at the accept step. The outer `author`, the legs, the live basis and the notice's closing are unchanged.
- R38: the relay was already in place (`{...w, ok: false, notice}` inside the transaction), and `basis-versions` R52, merged in L6, supplies `DIVIDED_CANNOT_RESTRUCTURE`. This module mints and spells none. The new tests drive the real refusal.

**Tests** (new file `bio-plane/test/m/reevaluation/adopt.test.mjs`, 4 tests; K874: each id is named as this module's own)
- R37: a member adopts a newer version. The version row answers her as `author`, and accepting it asks `onMachinePassage` zero times. I reverted the source change and this test failed, so it discriminates.
- R37 control: a machine author is refused `MACHINE_CANNOT_ADOPT_VERSION`, and the store is unchanged.
- R38: a divided question's notice, adopted, is refused with `notice`, `target` and `from: "divided"`, identical to what `appendVersion` answers directly. The question's text and the whole store are byte-identical, and the notice stays open.
- R38 control: the same adoption on an undivided question lands, and `keepVersion` on the divided question's notice records.

**Runs**
- `node --test bio-plane/test/m/reevaluation/`: 145 tests, 145 pass, 0 fail, 0 skipped.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs . reevaluation`: 21 files, 0 failures.
- `checks/coverage.mjs . reevaluation`: 38 of 38 live ids named, 0 failures.
- `checks/ownership.mjs . reevaluation tranche/T50`: 0 failures.
- `checks/run.mjs`: no reevaluation failure; the other coverage failures listed are other modules' (inherited).

**Deferred:** nothing.

**Found in another module**
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, `not_product`) inlines `adoptVersion`, so my change makes it stale. BOB regenerates it at layer close (manifest, Generated artifacts).
- `build/requirements/reevaluation.md` (BOB's) still marks R37 and R38 `*(not yet met: T50)*` and its Status line says so; BOB updates them.

Size (session_01Td1QmUQTUV5AKbrnBaHn9P): test runs 8, module lines 3049

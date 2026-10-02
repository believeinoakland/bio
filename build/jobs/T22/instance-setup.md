# instance-setup (T22)

**Status** · session_01SN91cXiJGhNkycNvNWigjp · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifacts my change stales (mechanics §14; regenerated nothing), on `job/T22/instance-setup` @ 799f94ed90:
1. The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (from `bio-plane/src/setup.mjs` and `setup-fleet.mjs`): `bio-plane/test/system/fleetbundles.test.mjs` FAIL "bio-plane: no staleness …"; agent-worker, ocr-worker and pdf-worker pass.
2. The installer's bundle `newgroup/dist/newgroup.bundled.mjs` (through `setup-fleet.mjs`, which `newgroup/src/index.mjs`:33 imports): `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` 3 passed, 1 failed, (C) the committed bundle no longer byte-identical to a fresh build.

For installer (R34, after my merge): the block's words are held once in `bio-plane/src/setup-fleet.mjs` as `HOSTING_CONTROL` (`{heading, sentences}`, frozen) and `hostingControlBlock(cls = "notice")` (the block as HTML, every word escaped, `<div class="<cls>" id="hosting-control">`); the leaf still imports nothing. The installer can import either beside `GROUP_SLUG_RE` and `FLEET_BINDINGS` (`newgroup/src/index.mjs`:33), passing its own page's class.

## J2 · COMPLETE

instance-setup's T22 L11 job is done on `job/T22/instance-setup` @ 799f94ed90 (its record commits after). Every entry applied; nothing deferred.

**Entries applied** (START B1)
- (1) H17, R47 (DEC-109, K1038): the claim section (`<section id="s-claim">`) shows DEC-109's block before any field, so before the founder chooses a password (`pw1`), in place of the reassurance-only card, which is gone. Its words: whoever can sign in to the hosting account (its Cloudflare account) controls the copy, can replace the one-time password, claim the copy again, read everything and lock everyone else out, and no vote of the administrators can stop them; use a group account, not a personal login; add at least one other trusted person; where possible let someone other than the administrators hold it; the same account is the way back in if the password is lost. No acknowledgement is asked or recorded. The words are held once in `bio-plane/src/setup-fleet.mjs` (`HOSTING_CONTROL`, `hostingControlBlock(cls)`), still an import-free leaf, exported for the installer's last screen (installer R34). R47's mark can be struck.
- (2) J2, R48 (capture R32, DEC-88 (2), K1037; accepted red 6): each inbox card offers a reason field ("Your reason for handling it this way") beside its two buttons, in the page's existing style. Each button posts `inboxresolve` with `{knockId, status, reason}`. A blank reason posts nothing and says why. A refusal, inside the envelope or the door's own, is shown in the plane's words (its `translation`, else its `detail`) and the knock is left as it was. Nothing else of the section changes, and a member who may not contribute sees neither the field nor the buttons. R48's mark can be struck, and accepted red 6 is cleared.
- (3) Re-scan (N469, N471, N480): two notes in `setup.mjs` (:71, :83) named the deleted `index.mjs` as the live server of `GET /`; I re-pointed both to control-plane. The past-tense notes (`livefire.mjs`:207, `setup.mjs`'s "moved out of `src/index.mjs`", `reports.test.mjs`:222) are provenance and I kept them. No note names `tools/` or `legacy-tests`. No row changes.

**Found in other modules**: in J1 (REPORT): the plane's bundle and the installer's bundle are both stale from this change. J1 also gives the installer the names it imports for R34.

**Tests and checks**
- `node --test bio-plane/test/m/instance-setup/`: tests 88, pass 88, fail 0. New in `page.test.mjs`: "R47 …", which pins DEC-109's sentences (written in the test), the block before `pw1`, the old card gone, and no control or acknowledgement. Its negative controls fail on the old card restored, on the block moved after `pw1`, and on a checkbox added to the block. Also new: "R48 …" (the same `load()` harness, with the fixture now drawing the inbox's buttons). For each button it checks that the reason is asked and sent, that a blank or white-space reason posts nothing, that a refusal is shown in its own words with no redraw, that an admitted resolve redraws, and that a viewer sees no control. `exports.test.mjs`'s leaf test now names the leaf's four exports.
- Users' suites: `bio-plane/test/m/control-plane/`: 102 tests, 100 pass, 2 fail. Both are the accepted reds, `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310. `newgroup/test/`: 35 tests, 31 pass, 0 fail, 4 todo.
- Whole `bio-plane/test/m`: 4956 tests, 4935 pass, 9 fail, 12 todo. The 9 are all accepted by name: control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310; accepted red 4 (membership `module-order.test.mjs`:12 and `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58); queue-producers `proposals.test.mjs`, 4 tests (:78, :124, :153, :167, each failing at its helper :58). No new red; test-support R2 passes here.
- `node checks/format.mjs`: 0 failures. `architecture.mjs … instance-setup`: 0 failures. `coverage.mjs … instance-setup`: 48 of 48 live ids named, 0 failures (R47 and R48 leave the accepted list). `ownership.mjs … instance-setup tranche/T22`: 6 files, 0 failures.

Size (session_01SN91cXiJGhNkycNvNWigjp): test runs 9, module lines 2992

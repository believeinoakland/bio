# pdf-worker (T51)

**Status** · session_01PhBb7MkFDrjvHxjEN19MtM · depth 2 · WORKING · handled B2

## Completion (fix round 6, G34: the 23 MB PDFs end with no words)

**Entry applied.** `pdf-worker/src/index.mjs`: `DEFAULT_MAX_PDF_BYTES` 16 MiB → 64 MiB (line 76; comment above it rewritten to the measurement), `dist/pdf-worker.bundled.mjs` and `.bundle.json` rebuilt (`npm run build`). No other source change; no census op's accepted keys change (the member's request and answer shapes are unchanged; the over-envelope marker already carried `bytes` and `limit`). No new member-read sentence.

**(1) Root cause, with evidence.** `index.mjs` (old :76, :169-175): `bytes.length > 16 MiB` skips tier 2. Reproduced on a reportlab-built file of the walker's shape (20 text pages, Helvetica / WinAnsiEncoding, no /ToUnicode, one incompressible image, 23,554,168 B; scratchpad `g34/mk.py`): tier 1 alone reads 0 characters, 1,220 regions `no_tounicode`; through the handler on the old bound the answer is tier 1 with `over_envelope`; with `MAX_PDF_BYTES` 64 MiB, tier 2 reads 91,679 characters, 0 undetermined, 226 ms (node).

**(2) Why the tests missed it.** The only default-bound test padded a 3-page document with a space-filled comment to 16 MiB + 1 and asserted the decline; no fixture over 16 MiB carried a font that only tier 2 can read, and nothing measured tier 2's memory, so 16 MiB stayed a "conservative, provisional" number (the code comment said so). Gap fixed: the default-bound test now sits at the measured bound, and a walker-shaped file over the old bound is read through the real handler.

**(3) Failing-first test** (`pdf-worker/test/structure.test.mjs`, block "R8: a 23 MB PDF in WinAnsi fonts with no /ToUnicode is read (G34)", through the committed bundle under miniflare/workerd; its shape is proven by a check that tier 1 alone reads 0 characters with `no_tounicode`). Red on the old bound (6 failures, saved at `g34/red.txt`):
```
  FAIL  R8 one byte over the default (67108865 B): tier 1
  FAIL  R8 one byte over the default: the decline names the size and the limit
  FAIL  R8 exactly the default (67108864 B): tier 2
  FAIL  R8 the old 16 MiB default plus one (16777217 B): tier 2
  FAIL  R8 the walker's shape under workerd: 200, tier 2, with its words and nothing undetermined
  FAIL  R8 the walker's shape: no decline note
structure: 83 passed, 6 failed
```
Green after the change: `structure: 89 passed, 0 failed` (83 before the fix with the 6 above failing).

**(4) Platform check L, raw workerd** (`pdf-worker/test/envelope-memory.probe.mjs`, committed; the committed bundle, a disk-fetched CAPTURES shim, `v8Flags --max-old-space-size=N`, N bisected from 16; "heap + bytes" must stay under the isolate's 128 MB). Smallest old space at which `POST /structure` answers tier 2:
- reportlab WinAnsi, 15.0 / 22.5 / 23.8 MiB, 20 pages: ≤ 20 MB (the bisection floor), 191-636 ms; heap + bytes ≤ 44 MB.
- dense text (pdf-reader's `dense.mjs`, 23 MiB): 400 pages 21 MB (2.5 s); 1,000 pages 30 MB (5.9 s); 1,600 pages 39 MB (9.0 s) — 1,600 pages is about what tier 1's own refusal (pdf-reader R42, `TOO_LARGE_TO_READ`) lets through at 23 MiB.
- 64 MiB, 5 pages and 300 pages (the most R42 admits at that size): ≤ 20 MB; heap + bytes ≈ 84 MB, 44 MB left under 128. A 64 MiB file with 355 pages is already refused by tier 1 before this bound is reached.
So the bound is set at 64 MiB; tier 1 (R42) refuses what is larger than about 75 MiB in any case. **P** (both walker files at the re-walk) is BOB's.

**Above the bound.** A file over 64 MiB gets the unchanged R8 answer: tier 1, `over_envelope` with `bytes` and `limit` (tested: `bytes: 67108865, limit: 67108864`). The size reason is carried by this member's answer; the sentence the member reads ("too large to read here: n MB over m MB") is extraction's / G14's to compose from those two fields. I found nothing in `bio-plane/src` that reads `over_envelope` or `tier2_declined_over_envelope` (grep), so G14 should confirm it states from them rather than from tier 1's `no_tounicode` regions, which is what the walker saw; reported to BOB, not changed (another module).

**Found in another module.** `release/pdf-worker.bundled.mjs` is a stale generated copy at the old bound (not mine; the release assembler's). `bio-plane/test/system/fleetbundles.test.mjs`: 4 FAIL for `agent-worker` (staleness) on the tranche tip as well as with my change (checked by stash); pdf-worker's rows all PASS.

**Proposed requirement lines (BOB writes `build/requirements/`).** R8: "Over envelope: bytes larger than `MAX_PDF_BYTES` (env override, default 67,108,864 = 64 MiB, measured: tier 2 reads a 64 MiB file of up to 300 text pages in 20 MB of old space and a 23 MiB file of 1,600 text pages in 39 MB, under raw workerd, so heap plus bytes stays under 128 MB) skip tier 2: …" (the rest of R8 unchanged). Suggestions, `MAX_PDF_BYTES` provisional note: replaced by the measurement above. Test names R8: "one byte over the default (67108865 B)", "exactly the default", "the old 16 MiB default plus one", "the walker's shape".

**Tests and checks.** `node --test --test-force-exit pdf-worker/test/structure.test.mjs`: 89 pass, 0 fail. `bio-plane/test/tier2-wire.test.mjs` (the user of this member's wire): 1 pass, 0 fail. `fleetbundles.test.mjs`: pdf-worker rows PASS (agent-worker's 4 fail on the tip too). The other four pdf-worker suites (pagepixels, imagecrop, jbig2, jpx) cover files this change does not touch and were not re-run. `impact.mjs origin/tranche/T51 HEAD` (run before the commit): 0 modules (it reads commits). Checks: format 0, architecture 0, coverage 6656 of 6656, channels 0, words 0 failures (inline 0, plain 0, testcopy 0; no word added), ownership `6 files changed by pdf-worker ... 0 failures`.

Size (session_01TvicQZEyi2UWLiFnXQfFaz): test runs 9, module lines 217 (src/index.mjs; +10, -7 changed)

## J1 · COMPLETE

G34 done: MAX_PDF_BYTES default 16 -> 64 MiB, measured in raw workerd (heap+bytes 84 MB for 64 MiB, 62 MB for 23 MiB x 1,600 pages); walker-shaped 23.5 MB WinAnsi/no-ToUnicode file now tier 2 with words through the handler (red 6 fails on old bound, green 89/0); bundle rebuilt; checks all 0 failures; ownership 0. Above 64 MiB the answer keeps over_envelope with bytes and limit: G14/extraction must state the size from them (nothing in bio-plane/src reads over_envelope today). Record: build/jobs/T51/pdf-worker.md.

## J2 · QUESTION

QUESTION (J2, re B2). G125b, my reading: pdf-worker's `/structure` route (src/index.mjs, the only route my module answers) never decodes a JPX image, so a refused JPX has no entry in my module to be answered at. The JPX renderer is pagepixels.mjs / jpxdecode.mjs (pdf-pixels job 14 and image-codecs job 13), reached through pdf-pixels' entry and its tests (`pagepixels.test.mjs`, `jpx.test.mjs`), which are not in my paths. So for G125b I code and test nothing: BOB rebuilds `dist/` after batch B and the bundle then carries image-codecs' fix. I will say that in my record under G125b. If you read it otherwise (for instance, you want a /structure-level test of mine), say which and I will do it. I go on with G132h, G124a, G124 quotes and G139 meanwhile.

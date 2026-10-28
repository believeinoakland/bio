# proto-mem: resident memory of the plane Worker, measured locally (THROWAWAY)

Branch `proto/levels-2-3-mem`, from `proto/levels-2-3-piece` (base `17cf5848`, the code live on plat-s1). Nothing here is product code, nothing is
deployed, no Cloudflare API or remote service is called (the Worker's outbound service answers 599 to everything). The plane runs in workerd through
Miniflare (4.20260722.0, workerd 1.20260722.1, node 26) on this machine.

## How the memory is measured

* From OUTSIDE: `/proc/<workerd pid>/status` (`VmRSS`, `VmHWM`); the high-water mark is reset by writing `5` to `/proc/<pid>/clear_refs` before each
  operation (it is permitted here) and `VmRSS` is also sampled every 5-10 ms. "Peak" is the larger of the two. The pid is the workerd child of the driver.
* The isolate's own JS heap, from the V8 inspector (`Runtime.getHeapUsage`: `used` = live + garbage not yet collected, `total` = committed). Polled
  every ~15-50 ms, so a peak shorter than that, or one inside a synchronous stretch, is only seen at the next turn. workerd's inspector does NOT answer
  `HeapProfiler.collectGarbage` or `takeHeapSnapshot`, and `process.memoryUsage()` / `v8.getHeapStatistics()` answer zeros, so no GC can be forced and
  live data cannot be told from garbage that has not been collected yet.
* `proto-mem/dist/meas.bundled.mjs` is the plane built by the plane's own recipe (`bio-plane/scripts/fleet-bundle.mjs` `buildMember`, including the
  ASCII post-pass: without it the 28 MB source is held two-byte and the baseline is about 30 MB higher) with `proto-mem/meas-entry.mjs` as entry. That
  entry is `src/plane/index.mjs` unchanged plus a `Store` subclass with RPC methods the driver uses (tick ONE scheduler consumer, run `onAlarm`, run SQL,
  shut the alarm gate) and a log line for every R2 get/put on `CAPTURES`. Its baseline equals the committed `bio-plane/dist/bio-plane.bundled.mjs`
  (see `results/baseline-*`).
* Documents go in through the product's own door as the Add door does (`screens-intake/capture.mjs` `promoteDocument`): `POST /?op=captureupload&statement=..&name=..&type=text/plain`
  with the bytes, then `op=allocid` and `op=promote` (a founding admin claimed with a random local bootstrap token, then `op=login` for a session token; the
  admin bearer itself is refused by `captureupload`, CLASS_FORBIDDEN). Text is random pseudo-words, 12 a line, about 91 bytes a line = a unit (1 MB = about 10.9k units).
* The platform alarm is gated shut (`MEAS_GATE=1`) so the driver ticks `pending-work` and the other consumers by hand, one at a time, except in
  `measure-natural.mjs`, which lets the platform's own alarm run.

## Scripts (run from the repo root; each prints or writes `proto-mem/results/*.json`)

```
cd bio-plane && ln -s /home/user/bio/bio-plane/node_modules node_modules   # once; git-ignored
node proto-mem/build-meas.mjs                                    # builds proto-mem/dist/meas.bundled.mjs (git-ignored)
node proto-mem/baseline.mjs [bundle]                             # (a) before any request / after the first request, with the JS heap; default bundle = the committed plane bundle
node proto-mem/control.mjs                                       # (a) control: the same Miniflare with a trivial Worker instead of the bundle
node proto-mem/measure.mjs --phases=a,b [--piece=512]            # (b) WARM: one process, one Store, both files in turn
node proto-mem/measure-cold.mjs --files=1000000,1900000 [--piece=512]   # (b) COLD: a fresh process for the upload, the promote and every piece (state persisted on disk between)
node proto-mem/seed.mjs --dir=/home/user/seed100 --docs=100 --bytes=100000    # (c) seeds a room: 100 docs, 111,703 units (+ one unread 1.9 MB reading owed)
node proto-mem/seed.mjs --dir=/home/user/seed580 --docs=580 --bytes=235000    # (c) 580 docs, 1,492,508 units: the live room's size
node proto-mem/measure-consumers.mjs --seed=/home/user/seed100 --out=consumers-seed100   # (c) every scheduler consumer and the whole onAlarm, each in a fresh process on a copy of the room
node proto-mem/measure-consumers.mjs --seed=/home/user/seed580 --out=consumers-seed580
node proto-mem/measure-natural.mjs --seed=/home/user/seed100 [--piece=512] [--extra=8000000,8000000,8000000] [--drive=natural|onalarm|pending] [--env=PROTO_READOUT=1] [--noheap]
node proto-mem/summarize.mjs results/warm-piece-default.json; node proto-mem/summarize-cold.mjs results/cold-piece-default.json
```

`measure-natural.mjs` is the one that matters most: in ONE fresh process on a copy of a seeded room it runs the whole chain of work, with the platform's own
alarm (`natural`), or `onAlarm()` called back to back (`onalarm`), or only `pending-work` ticked back to back (`pending`), until nothing is owed, sampling the
whole time. See `results/` for the raw numbers; the report of the run that made them is in the branch's last commit message and in the hand-off to PLATFORM #3.

## What a local run can and cannot show

* workerd here does not enforce the 128 MB limit and its resident set includes the runtime: a trivial Worker with the same bindings is 81 MB resident, the
  bundle loaded 237-244 MB, so the bundle's own share is about 155-160 MB RSS and, in the isolate, 52 MB of JS heap used (63 MB committed) before any request.
  Whatever the platform counts toward 128 MB (heap, external buffers, SQLite, wasm) is not separated here. Compare differences, not absolutes.
* The local DO SQLite and R2 are Miniflare's (SQLite files and files on disk), not Cloudflare's; the room here is built from synthetic ASCII text, one
  document type, one project-less team. The live room is 1.4 million units and about 580 documents; `seed580` matches it in units and documents, `seed100`
  does not.
* Peak figures sampled every 5-10 ms can miss a spike shorter than that in RSS; `VmHWM` does not (it is the kernel's own), the JS heap probe can.
* Nothing was run against a PDF, an image, a sheet or an HTML page, only plain text; PDF, OCR and sheet workers are stubs.

## Window size and the chain bound (branch `proto/levels-2-3-chain`, THROWAWAY)

Two env-flagged changes to the base (`360f8860`); each unset = the base's behaviour (tests: `bio-plane/test/m/extraction/proto-window-chain.test.mjs`,
`bio-plane/test/m/store-assembly/proto-chain-gate.test.mjs`).

* `PROTO_WINDOW_BYTES=<n>|auto` (`reading-pipeline` `protoWindowBytes`, applied in `read()`): the byte window a later piece of a text asks for. `n` is clamped to
  [16 KiB, 1 MiB]; `auto` = clamp(the piece's unit budget x 256 B, 64 KiB, 1 MiB) (512 units = 128 KiB; 4096 = 1 MiB, i.e. the base). The cursor arithmetic is untouched
  (`textWindowTick` still doubles or cuts to whole runs); the test reads a 12,000-line text and a text with 20-300 KB lines with and without the flag and the `capture_text` rows and the
  state are identical.
* `PROTO_CHAIN_BYTES=<n>`, `PROTO_CHAIN_REST_MS` (default 20000): a module-level counter (per isolate) of the bytes the reader takes out of the evidence store (whole reads and ranges,
  `protoChain.counted`), and the isolate's start. When it passes n, `pending-work` starts no further `reading`/`ocr` piece: every owed read row is made due after the rest (staggered 1 s
  apart, in the ledger's order: rows due at ONE instant leave the scheduler's wake unchanged after a tick and its hold against a spin (R27) armed no alarm; that stalled a 3-file chain in
  the first version of this change, found by `measure-chain.mjs --verbose`, fixed and tested), so the alarm fires after the rest with no work in between; the first tick after the rest resets
  the counter (same isolate) and reads. A new isolate has counter 0. Log lines `{"proto_chain": {chain_bytes, window_bytes, piece_units, isolate_age_ms, rested, event}}` per reading
  step (`event: step`) and per rest (`rest_begin`, `rest_end`); `rested: true` marks the first step after a rest.

Scripts: `measure-chain.mjs` (one cold process, the platform's own alarm, RSS every 10 ms, JS heap every ~50 ms, heap FLOOR = minimum `used` in each 3 s window; `--prepared=DIR` a room with the
extra files registered, `--recycle-ms=N` restarts workerd every N ms on the persisted state, `--gc-every-ms=N` a forced GC probe, `--verbose`), `run-chain-matrix.sh` (1.9 MB and one 8 MB),
`run-chain-matrix3.sh` (three 8 MB files, recycle runs, GC probes), `summarize-chain.mjs`. Results: `results/chain-*.json`, `results/recycle-*.json`, `results/gc-probe-*.json`.
Rooms: `seed.mjs` seed100 (1.9 MB owed); the 8 MB and 3 x 8 MB rooms are made with `measure-chain.mjs --extra=8000000[,..] --only-extra --save-prepared=DIR` right after a seed (a session
token from `seed.mjs` stops working after about half an hour).

Forced GC: Miniflare has no option for workerd's `v8Flags`; a copy of Miniflare's `dist/src/index.js` with one line added (`make-patched-miniflare.sh`) (`MF_V8_FLAGS` -> `config.v8Flags`) in a directory of symlinks
(`/home/user/mfp`, see `lib.mjs` `MF_PATH`) starts workerd with `--expose-gc`, and `meas-entry.mjs` `measGc` mode `direct` calls `globalThis.gc()`. It worked (`gc_fn: function`).
Results are in the hand-off report; the tables are rebuilt by `summarize-chain.mjs`.

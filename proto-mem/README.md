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

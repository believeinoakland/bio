# OPTIONS spikes: Workflows locally, native readers, range reads

Run 2026-10-23 on the shared 4-core / 16 GB box (Node v26.10.0, workerd 2026-07-22, Miniflare 4.20260722.0, compat date 2026-07-01). Nothing in /home/user/bio changed; nothing deployed; no Cloudflare account reached. OS packages were installed with apt-get into the system (allowed, none refused): tesseract-ocr 5.3.4 + eng, mupdf-tools 1.23.10, p7zip-full 16.02, libvips-tools 8.15.1, time. Already present: poppler (pdftotext/pdfinfo/pdftoppm), LibreOffice 24.2.7.2, ImageMagick convert. Absent and not installed: bsdtar. Scripts in `spikes/src/`, raw output in `spikes/results/`, small data in `spikes/data/` (large generated data deleted). Local time numbers are on a shared box and indicative only.

## W. Workflows in Miniflare (carrier for options C and D)

**Setup.** One module worker with `WorkflowEntrypoint` classes (from `cloudflare:workers`), declared via Miniflare `workflows` option with `workflowsPersist` and `durableObjectsPersist` on. A SQLite Durable Object `Ctr` records every step execution (workflow id, step, count, timestamp). Classes: `Fifty` (50 steps, each calls the DO then returns `{i,n}`; optional per-step sleep), `Flaky` (one step that throws on its first two attempts, `retries: {limit 5, delay "1 second", backoff "exponential"}`), `Big` (one step returning N bytes). Scripts `w-worker.mjs`, `w-lib.mjs`, `w1..w5.mjs`; output `results/w1.json`, `w2.json`, `w3.json`, `w4.json`, `w5.json`.

**(a) Does Miniflare 4 run Workflows? Yes.** Create, `get(id).status()`, `pause()`, `resume()` all work. The 50-step instance completed with every step executed exactly once. Status output in local mode carries a `__LOCAL_DEV_STEP_OUTPUTS` array (a local-only field; do not depend on it).

**(e) Time per step locally.** 50 steps, each with one DO call, finished in 204 ms wall including create and polling: about 4 ms per step, gaps between step starts 2 to 4 ms. So the local engine adds negligible overhead; the production per-step latency (platform scheduling, durable commit of each step's result) is not shown by this number.

**(b) Retry and backoff.** The step failed twice and succeeded on the third attempt; the next step then ran. Attempt gaps: 1,011 ms then 2,005 ms (limit 5, delay 1 s, exponential): that is 1 s and 2 s, i.e. delay doubling as configured, then the following step 4 ms after success. The workflow completed with the third attempt's output. The step's `n` counter confirms 3 executions. Configured retries are honoured locally.

**(c) Dispose mid-run with persistence, restart.** Instance `c1` (50 steps, 200 ms sleep each) was disposed at step 20 of 50, then Miniflare restarted on the same persist dirs.
- After restart `status()` says `running`, but the instance does **not advance on its own**: 90 s of polling (w2) and 5 s (w3) produced no new steps (20 distinct steps, no progress).
- Calling `create({id: "c1"})` again (same id; it did not error) woke it: it finished all 50 steps. Steps 0-18 ran once; **only step 19, the one in flight at disposal, ran twice** (at-least-once for the interrupted step). So completed steps were not re-run; the engine resumes from the last completed step once poked.
- Verdict: the durability record is correct locally (steps persisted, no re-run of completed steps), but local resume needs a nudge (re-`create` with the same id, or `restart`/`resume`); in production the platform resumes by itself. For tests this means a harness needs a "poke after restart" helper, and a test can assert "completed steps run once, in-flight step may run twice", which is the design assumption for step idempotence (S5).

**(d) Step output of 1 MiB + 1.** The documented limit is 1 MiB per step output. Locally:

| Output | Result |
|---|---|
| `Uint8Array` 1,048,576 and 1,048,577 bytes, 2,097,152 | complete (output length returned) |
| string 1,048,576 / 1,048,577 / 1,048,578 / 1,100,000 / 2,097,152 chars | complete |
| `{s: string}` objects 1,048,576 / 1,048,577 / 1,200,000 chars | complete |
| string 3,000,000 chars and larger (3, 4, 6, 8, 10 MB) | instance `errored`: `Step big-1 output is too large. Maximum allowed size is 1MiB.` |
| `Uint8Array` 10 MiB | same error |

So the local engine enforces **a limit between 2 MiB and 3 MB (consistent with the 2 MiB SQLite row limit), not the 1 MiB it names**. A 1 MiB + 1 output does not fail locally. The failure shape when it does fail is a workflow-level `errored` status with the message above, the step name gaining a `-1` suffix (`big-1`), and (with retries 0) no further attempts. Design consequence: a test pinned to local behaviour would wrongly pass at 1.5 MiB; the 1 MiB rule must be enforced by the product's own step contract (return a reference, assert size before returning) and verified on the live platform (P-M2 style probe). The brief's "returns a small reference (at most 1 MiB)" is the right discipline.

**What local cannot show.** Deploy over a running step (WF17, P-M14: does a new version kill, finish or restart an in-flight step; local has no deploy). Real per-step memory (the 128 MB question, G14; local has no isolate cap in Miniflare, see earlier RESULTS.md section 1). Production step latency and its durable-commit cost, concurrency limits, instance-count and step-count limits (10,000/25,000 steps was not tested here), sleeps, `waitForEvent`, billing, behaviour when the engine itself is evicted, automatic resumption (local needs a poke), and the real 1 MiB boundary.

## N. Native readers versus the project's JavaScript/wasm (option D's claim)

**Availability.** Present or installed: `pdftotext`, `pdfinfo`, `pdftoppm` (poppler), `mutool` (mupdf 1.23.10), `tesseract` 5.3.4, `soffice` (LibreOffice 24.2.7.2), `7z` 16.02, `vips` 8.15.1, ImageMagick `convert`. Absent: `bsdtar`. The installs worked on this box; a container image build would be the real equivalent.

**Test material.** `data/t300.pdf`: 300 text pages generated with reportlab (62 lines of 14 words each, Helvetica 10 pt, 742 KB; about 6,700 chars per page, 872 words, dense). Output `results/n.txt`.

**(1) Text extraction, 100 pages (pages 101-200), peak RSS from `/usr/bin/time -v`:**

| Tool | Wall | Per page | Peak RSS |
|---|---|---|---|
| `pdftotext -f 101 -l 200` | 0.13 s | 1.3 ms | 17.5 MB |
| `pdftotext` all 300 pages | 0.37 s | 1.2 ms | 17.7 MB |
| `pdftotext` page 1 only | 0.01 s | 10 ms | 16.9 MB |
| `mutool draw -F txt` 100 pages | 0.18 s | 1.8 ms | 10 MB |

Native text extraction is milliseconds a page and a few tens of MB, and it takes a page range directly. I did not run the project's JavaScript PDF reader against the same file here (its in-repo numbers are in the earlier lane evidence); the comparison to quote is the order of magnitude, not a ratio from this session. A 5,000-page text PDF by this rate is about 6 s of extraction. These are text-layer pages; scanned or font-hostile PDFs were not tested.

**(2) Rendering and OCR.** Rendering page 5 at 300 dpi to PNG: 1.31 s, 50 MB RSS (most of it PNG encoding; 20 pages to grayscale PGM took 0.84 s, 42 ms per page, 34 MB). OCR on that 2550x3300 page, same model (tessdata_fast eng, the file under `ocr-worker/assets`) for both engines:

| Engine | Dense full page | A third of a page (sparse) | Peak RSS | Words recovered |
|---|---|---|---|---|
| native tesseract 5.3.4, 1 thread | 5.0 s | 1.45 s | 146 MB (55 MB for the third) | 872 of 872 (clean); 99.9% on a rotated, noisy, blurred copy |
| native, `OMP_THREAD_LIMIT=4` | 5.75 s | 1.59 s | same | same |
| tesseract-wasm 0.11.0 in node, first run | 7.9 s | 2.5 s | node RSS 236-260 MB (engine + image) | 872 of 872 (clean and noisy) |
| tesseract-wasm, second run | 6.7 s (noisy copy 6.0-6.1 s) | 2.0 s | 295-327 MB | same |
| 4 native processes in parallel, 4 pages | 5.5 s wall for the 4 pages (about 1.4 s per page effective) | | | |

The wasm package, its model (`ocr-worker/assets/eng.traineddata`, 4,113,088 B) and core were usable read-only from `ocr-worker` (image decoded via ImageMagick since `sharp` was not loadable there). Findings: **native is only about 1.3 to 1.6 times faster than wasm for single-page throughput, not several times**, in this configuration; extra threads do nothing for the LSTM recognition (5.0 s with 1 thread, 5.75 s with 4); the real throughput gain is from running several processes, which needs several cores. Accuracy was identical on the test pages. Per-page cost depends heavily on text density: the sparse third is 3.5 times faster. Estimates for 5,000 scanned pages at 1 process: dense 5 s per page gives 6.9 h native, 9 to 11 h wasm; sparse 1.5 s gives 2 h native, 2.8 to 3.5 h wasm. At 4 cores in parallel about 1.4 s per dense page, or 1.9 h. A Cloudflare `standard-1` container is half a vCPU, so on that size expect the single-process numbers or worse; the claim "several times faster, multi-threaded" in the brief is **not supported by this spike** and should be softened to "somewhat faster per page, scalable by cores, with mature language packs and layout analysis"; the OCR-time argument for D is weak, and D's case rests on memory headroom and parser maturity instead. Memory: native 55-146 MB per page versus wasm in a Worker isolate (core 1.8 MB + model 4 MB + RGBA frame of 33 MB for this page); the isolate figure is what ocr-worker's own `cap` already bounds.

**(3) Office and archives and images.**
- `soffice --headless --convert-to txt` of a 200-paragraph generated .docx (44 KB): 1.85 s cold profile, 1.22 s with a warm profile; peak RSS 219 MB. .xlsx with 20,000 rows to CSV: 4.0 s, 221 MB, output 1.08 MB. LibreOffice is a per-process 1 to 4 s plus about 220 MB floor: fine in a container, impossible in an isolate; it reads the legacy .doc/.xls/.ppt/.rtf formats the JavaScript readers do not.
- `7z l` on a 92 MB zip of 300 members: under 10 ms, 6 MB RSS; `7z x -so` of one member: under 10 ms, 6 MB. (Members were base64 text of random data, so this is about structure handling, not decompression speed.)
- ImageMagick `convert` of a 48-megapixel JPEG (6000x8000) to PNG: 9.3 s, 388 MB RSS; `vips thumbnail` of the same: 0.16 s, 43 MB RSS. So libvips (shrink-on-load, streaming) is the right native tool for big images; ImageMagick shows the memory cliff native tools also have (a 48 MP image costs 388 MB there, near the 4 GiB container but far beyond a 128 MB isolate).

**Verdict for option D's claim.** Native PDF text, archives and big images are dramatically cheaper in memory and time than anything a 128 MB isolate can do (PDF text 17 MB, ms per page; vips 43 MB for 48 MP). Native OCR is a modest speedup, not a multiple. Office conversion works but costs about 220 MB and 1 to 4 s per file. Not measured: dense or scanned PDF rendering time per page beyond the one page, damaged files, encrypted files, CJK language packs, the project's own JS readers on the same files, a container's own start time and the half-vCPU effect.

**What only the live platform shows.** The cold start and memory of an actual `standard-1` container, how many native processes fit at 0.5 vCPU (the 4 parallel tesseracts above ran on 4 shared cores), R2 to container streaming throughput, the effect of the container being killed mid-range (P-M17), per-hour cost versus measured rates, and image build and size.

## R. Range-read sanity check (all options)

Earlier RESULTS.md section 5 covers ranged R2 reads in Miniflare (13 x 8 MiB, +17 to +36 MB RSS, whole-object `arrayBuffer()` +233 MB) but not a raw workerd run with a capped old-space and an incremental digest. Run done: raw workerd, `--max-old-space-size=64` (and 32), a 100 MiB random file served by a workerd **disk service**, the worker issuing HEAD then `Range: bytes=a-b` GETs over a service binding in 8 MiB steps, hashing with a hand-written streaming SHA-256 (pure JS) and a CRC-32. Results (`results/r.txt`): 13 range calls, all `206`, the SHA-256 matched `sha256sum` of the file exactly and the CRC was computed; old-space 64: 2.3 s (22 ns/byte including the JS SHA-256 and CRC), process peak RSS 150 MB; old-space 32: also completed (6.9 s, 159 MB), no crash. Control: one 100 MiB range in a single read also completed under old-space 64 (peak RSS 265 MB), confirming the earlier finding that ArrayBuffer backing stores are not counted against the V8 heap flag, so **the cap proves the JS heap is bounded (hash state and the 8 MiB buffer are garbage collected between ranges) but cannot prove the 128 MB total**; the RSS difference (150 MB with 8 MiB ranges versus 265 MB with one range, process-wide including workerd's own and the disk service) is the usable signal, and the live check is the same read on a deployed Worker against R2 (P-M1 style). A range-read loop with a JS SHA-256 is therefore feasible: the hash is incremental by construction and per-step memory is bounded by the range size, not the file size.

## Summary for OPTIONS.md

1. Workflows run in Miniflare 4: 50 steps in 204 ms (about 4 ms a step), every step once; retries and exponential backoff are honoured (gaps 1.0 s, 2.0 s).
2. Persistence works but local resume needs a poke: after dispose/restart the instance stays `running` until `create` with the same id; then only the in-flight step re-ran (at-least-once for one step), completed steps did not.
3. The step-output limit is not enforced at 1 MiB locally: 1 MiB + 1 to 2 MiB passes, 3 MB errors (`Step big-1 output is too large. Maximum allowed size is 1MiB.`); the step contract must enforce 1 MiB itself.
4. Native PDF text: 1.3 ms a page, 17 MB RSS, page-range native; mutool 1.8 ms, 10 MB.
5. Native OCR is only 1.3 to 1.6 times faster than tesseract-wasm per page (5.0 s vs 6.7 to 7.9 s dense; 1.45 s vs 2.0 to 2.5 s sparse), threads do not help; accuracy equal; the brief's "several times faster, multi-threaded" should be softened.
6. 5,000 scanned pages: about 2 to 7 h native single process, 3 to 11 h wasm, 1.9 h with 4 cores; a half-vCPU container will not do better than single process.
7. LibreOffice: 1.2 to 4 s and 220 MB per small file; 7z lists a 92 MB zip in under 10 ms at 6 MB; vips handles 48 MP in 43 MB where ImageMagick uses 388 MB.
8. Range reads with a streaming JS SHA-256 over 100 MiB in 8 MiB steps: hash correct, completed under `--max-old-space-size=32` and 64; heap is bounded, total memory still only provable live.
9. Live-only: deploy over a running step, real step memory, automatic resume, the true 1 MiB edge, container start, cost, half-vCPU throughput.
10. Option D's strongest evidence from this spike is memory headroom and format coverage (poppler, mupdf, 7z, vips, LibreOffice), not OCR speed.

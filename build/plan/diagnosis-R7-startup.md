# Diagnosis G84 (fix round 7): the plane's start-up, reproduction at the platform's shape

Worker for BOB, 2026-10-23, branch tranche/T51. Nothing tracked was changed; scratch is `.../scratchpad/g84/`. Cloudflare and biosmoke8 were not contacted.

## Method and versions
Node v26.10.0; miniflare 4.20260722.0; workerd 1.20260722.1; 4 cores, 16 GB, one measure at a time. Artifact: `bio-plane/dist/bio-plane.bundled.mjs`, 27,063,908 B.
- **Node**: `measureStart` (fleet-bundle.mjs:1561) called 5x per batch, two batches on the shipped bundle.
- **workerd local**: `new Miniflare` (the options of `test/system/bundle.test.mjs`, bindings from wrangler.jsonc) to `await mf.ready`, plus one `OPTIONS /` (answers 204, no storage, no page build). 5 runs per variant. First request after ready costs 18-33 ms in every variant, so the script is evaluated at start (ready), **not lazily at first request** (a `GET /` costs a 1.1 s page build, `control-plane.page`: not start-up, avoid it as the trivial request).
- Baselines: a one-line Worker (85 ms median) and an inert Worker padded with a 27 MB comment (1,106 ms, range 1,055-1,545): what the same bytes cost to hand over, with no code to run.

## The three figures
| figure | value | note |
|---|---|---|
| Node `measureStart` | **519-533 ms** median (10 runs, range 509-632) | first run of a batch is the slowest |
| workerd local, whole | **4,319 ms** median (range 4,256-5,570); shipped file 4,637 (4,580-5,355) | ready + request, 5 runs |
| workerd local minus one-line Worker | **4,234 ms** | |
| workerd local minus same-size inert Worker | **~3,210 ms** | what the bundle's code costs beyond carrying its bytes |
| Cloudflare's own | **not obtainable here** | read only at the redeploy (upload `startup_time_ms`, wrangler); the copy deploys, so it is under 1 s |

Ratio workerd/Node: **8.2x** raw (4,234/519), **6.2x** net of byte hand-over. This ratio does NOT transfer to Cloudflare: the same bundle is accepted there (under 1 s) while local workerd takes 4.2 s. Local ready includes Miniflare's own work and an eager parse; raw CPU speed is not the cause: 4e8 loop iterations added at global scope cost 2,494 ms in Node and 2,933 ms in workerd (1.18x).
Size sensitivity: the figure moves with bundle size. Stubbing `case-checker/program.mjs` (6.3 MB of the 27 MB) saves 273 ms in workerd (4,319 to 4,046; range 3,618-4,851) and 35 ms in Node (530 to 495): about 43 ms/MB in workerd, the same slope as the inert padding (1,020 ms per 27 MB, 38 ms/MB). So in local workerd the data bytes cost by being bytes, not by their run.

## (c) History
R43: 540 ms at T47's L1; R54: 509 ms median at T47's close; budget 500. Today's Node median on this machine is 519-533 ms, within noise of the 509 history. G84/P16's 942-1,271 ms (median ~1.1 s) was not reproduced: the same artifact measures about half here. P16's machine or load differs (suites beside it?) so every figure here must be read against this machine's own 520 ms; the ratio P16/this machine is ~2x. The 500 ms warning is currently a near miss, not a 2x breach, on this machine.

## (b) Ranked table (Node, ms, this machine)
No CPU profile (see Blockers). Measured instead: each pass replicated over the real `WORD_ROWS` with its real keys, cold, in its own process, rows import excluded (5 runs, median); each data module imported alone (5 runs); bytes by input from esbuild's metafile.
| # | item | ms | share of 520 |
|---|---|---|---|
| 1 | setup-words rows.mjs import (4.8 MB, 25,805 rows) | 62 | 12% |
| 2 | case-checker program.mjs import (6.3 MB string) | 50 | 10% |
| 3 | court-citations court-data.mjs import (1.8 MB) | 19 | 4% |
| 4 | interface-assets index.mjs import (1.1 MB) | 6.7 | 1% |
| 5 | translations/index.mjs:36 (25,805 frozen objects + Map at :38) | 22 (20-27) | 4% |
| 6 | file-safety/index.mjs:56-57 (45 keys, `.some` each) | 21 (20-23) | 4% |
| 7 | screens-investigate/whywords.mjs:8 | 8 (6.5-8.5) | 1.5% |
| 8 | screens-daily/index.mjs:33,35 | 3.5 | 0.7% |
| 9 | screens-wizards/index.mjs:19 | 2 | 0.4% |
| 10 | case-carriage/checks.mjs:40 (7 keys); publication/checks.mjs:33 (2 keys) | <0.3 | 0 |
Passes 5-10 total ~57 ms (P16 said 58 ms for file-safety alone: slower machine, ~2.7x on that one). Data imports 1-4 total 138 ms. Together ~195 ms, 37% of 520. The rest (~325 ms) is the code: the four data inputs are 14.2 MB of 32.8 MB unminified output (43%); the other 18.6 MB is code of 822 modules, none above 225 KB, no single module found above 20 ms (not profiled: not proven). Compile vs run split: **not measured** (blocker); P16's 730/360 split is not confirmed here.

## What is certain, what is not
Certain: Node figure here ~520 ms; the script runs at start in workerd, not at first request; local workerd's figure scales with bundle bytes (~40 ms/MB); passes 5-10 cost ~57 ms and file-safety's is 21, not 58, here; four data inputs hold 43% of the bytes. Not certain: Cloudflare's figure and any ratio to it; compile/run split and which module's top level (other than the named passes) holds the other ~325 ms; whether Cloudflare's 1 s is breached at all (the deploy succeeded); P16's 1.1 s (not reproduced). workerd/Miniflare expose no start-up figure: no log line at verbose level (only "Ready on ..."), no `startup_time_ms`; the inspector was not tried.

## Recommendation
Needed against **R43's 500 ms (Node, this machine, now ~520)**: item 1 (file-safety one pass, -20 ms) plus the translations pass (item 2, -20 ms, the only other pass over 20 ms) bring it to ~480: under 500 with ~20 ms margin, no data module needed. Items 2 others (whywords 8, daily 3.5, wizards 2) are optional, -13 ms. On P16's machine the same items are about 2.7x as large (~110 ms), which would not reach 500 from 1.1 s.
Item 3 (data modules): in Node program.mjs alone saves ~35 ms, all four ~100 ms at best less the lazy parse; it is not needed for 500 here. It is the only item that moves the **local workerd** figure materially (-270 ms for program.mjs, ~-570 ms if all 14 MB left the script, by the 43 ms/MB slope), and it is a signed-release format change.
**Under 800 ms in workerd**: cannot be answered from the local figure (4.2 s, not comparable; items 1-3 together would take it to roughly 3.5 s). The honest gate is Cloudflare's `startup_time_ms` at the redeploy: if it is well under 1 s, items 1 and the translations pass are the cheap sure step and item 3 can wait; if it is above ~800 ms, item 3 is the lever (data bytes dominate), with program.mjs first. A hard stop (item 4) should not be calibrated on this local ratio.

## Blockers
One command was refused by the permission check and not retried or rephrased: `node --cpu-prof --cpu-prof-interval 200 --cpu-prof-dir=<scratch>/prof once.mjs <unminified plane bundle>` (batched with `rm -rf` of that scratch directory and a heredoc). So there is no CPU profile and no compile/run split; the direct replicas above stand in for the pass ranking only. BOB can run the profile.

## Reproduction files
Scratch: `wd.mjs` (workerd measure), `ms.mjs` (Node), `pass.mjs`, `imp.mjs`, `buildv.mjs` (variants), `meta.mjs` (bytes by input).

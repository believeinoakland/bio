# journey-check (T47)

**Status** · session_01BwKVcuP4ZCR6FppN1MM9Zx · depth 2 · WORKING · handled B1

## J1 · QUESTION

Q1 (decides only when I can COMPLETE, not what I build). The R1 walk drives screens that L11's other jobs are building now (setup, join, front's sign-in and lock, members' invite, account, capture's testify, screens-wizards' welcome); none is merged into `tranche/T47` yet, so a full journey-28 / journey-3 walk cannot pass on my branch today.

My best reading, which I am building on:
1. Now: the module under `bio-plane/src/journey-check/` (walker, fake Cloudflare account served over HTTP, installer Worker and plane each under Miniflare, run from their files on disk, never imported) and tests under `bio-plane/test/m/journey-check/`: R2's detectors and R3's refusal tested against small local pages and a fake bootstrap (each failure a control beside a clean pass), and R1's local arm as an end-to-end test. Steps are written from the design (mock-journeys.js journey 28, library.json "Welcome a new member", registry acts as `button[data-act]`, words.json for labels).
2. The local arm runs the plane from the tranche's source (`bio-plane/src/plane/index.mjs`, as plane's worker.test.mjs does), not the stale embedded release; the hand-over gives it exactly the bindings and secrets the installer uploaded to the fake account, plus `CIVICSMITH_TEST_INSTANCE` = `INSTANCE_NAME` set by the walk as the deployer (installer R49, D15).
3. I push that, then wait for your CHANGE announcing the L11 screen jobs merged; I merge `tranche/T47`, fit each step to the built screens, run both journeys green and COMPLETE. If a screen breaks the walk, I REPORT it against its module's requirements rather than bend the walk.
4. The live arm (b) is built and its refusal tested, but not run against biosmoke7 by me (no credentials in this session, and K3053 runs it at the release); `npm run journey -- --live <url>` with `JOURNEY_ADMIN_*`/`JOURNEY_MEMBER_*` env vars.
Answer only if any of 1–4 is wrong.

# journey-check (T47)

**Status** · session_01BwKVcuP4ZCR6FppN1MM9Zx · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

Q1 (decides only when I can COMPLETE, not what I build). The R1 walk drives screens that L11's other jobs are building now (setup, join, front's sign-in and lock, members' invite, account, capture's testify, screens-wizards' welcome); none is merged into `tranche/T47` yet, so a full journey-28 / journey-3 walk cannot pass on my branch today.

My best reading, which I am building on:
1. Now: the module under `bio-plane/src/journey-check/` (walker, fake Cloudflare account served over HTTP, installer Worker and plane each under Miniflare, run from their files on disk, never imported) and tests under `bio-plane/test/m/journey-check/`: R2's detectors and R3's refusal tested against small local pages and a fake bootstrap (each failure a control beside a clean pass), and R1's local arm as an end-to-end test. Steps are written from the design (mock-journeys.js journey 28, library.json "Welcome a new member", registry acts as `button[data-act]`, words.json for labels).
2. The local arm runs the plane from the tranche's source (`bio-plane/src/plane/index.mjs`, as plane's worker.test.mjs does), not the stale embedded release; the hand-over gives it exactly the bindings and secrets the installer uploaded to the fake account, plus `CIVICSMITH_TEST_INSTANCE` = `INSTANCE_NAME` set by the walk as the deployer (installer R49, D15).
3. I push that, then wait for your CHANGE announcing the L11 screen jobs merged; I merge `tranche/T47`, fit each step to the built screens, run both journeys green and COMPLETE. If a screen breaks the walk, I REPORT it against its module's requirements rather than bend the walk.
4. The live arm (b) is built and its refusal tested, but not run against biosmoke7 by me (no credentials in this session, and K3053 runs it at the release); `npm run journey -- --live <url>` with `JOURNEY_ADMIN_*`/`JOURNEY_MEMBER_*` env vars.
Answer only if any of 1–4 is wrong.

## J2 · REPORT

Progress and findings (pushed 373f7a941a on job/T47/journey-check). Nothing here blocks me; I wait for your CHANGE (K3143).

1. **Built.** The local arm walks the installer half of journey 28 green today: the installer Worker under Miniflare over the fake account (PKCE consent, plan probe, buckets, uploads with keep_bindings, read-back, prefix, address), the copy started from `bio-plane/src/plane/index.mjs` with the uploaded bindings, R3's guard (`test_instance: true`) passing before the hand-over. It then fails, correctly, at the hand-over: `/` is the setup page (control-plane R82, still unmerged). R2 and R3 tests: 11 pass; R1: 3 pass, the end-to-end local arm red as J1 said.
2. **Files to register** (modules.json `paths`/`tests`): `bio-plane/src/journey-check/` and `bio-plane/test/m/journey-check/`. In a scratch tree with those set: architecture 0 failures, coverage 3 of 3, ownership 0 failures but the scratch modules.json line. `out/` and `node_modules/` are ignored by the module's own `.gitignore`.
3. **For the plane's `npm test` and the `regression` workflow (not_product / BOB):** the plane's glob `test/m/**/*.test.mjs` now includes my tests, which need `npm ci` in `bio-plane/src/journey-check/` (playwright-core 1.56.1, exact, locked; Chromium from `/opt/pw-browsers`, never `playwright install`). Without it they fail at import, never skip. Please add that `npm ci` wherever the plane's tests run, or tell me to read it differently.
4. **Improvement in interface-shell (R2's "screen not drawn"):** the shell draws an unregistered screen and a registered screen whose subject is not found with nearly the same markup, so I read its fallbacks from their shape (a one-step path and one empty state; a title and "comes later"). A mark on the frame, `#cs-main` (and the setup/public frames' root) carrying `data-screen="<id>"` of the registered screen it drew, absent on the shell's own fallbacks, would make the check exact; my walker already prefers it when present. Yours to decide whether it is worth a requirement now or in T48.
5. The installer's named exports (constants beside the handler) are refused by workerd as entry points when the file itself is the entry; I run it through an in-memory entry exporting `default` alone. Its deploy goes through wrangler's bundle, so this is likely harmless in production; noted for installer in case its tests ever run it under Miniflare directly.

## J3 · REPORT

B4 applied: tranche/T47 merged (8e3bcd60cc), tests re-run, pushed 9237ca735c. The installer's redesigned pages (R50–R53: the permanence dialog, 'Before Cloudflare', the streamed rows, the hand-over to /app/setup#boot=) are walked green over the fake account. The walk now stops at the hand-over: /app/setup with no session is sent to /, which is still the setup page (interface-shell R45's setup frame, screens-entry and control-plane R82 not yet merged). journey-check tests: 14 pass, 1 fail (R1 (a) end to end, as J1). Not COMPLETE; I wait for your next CHANGE.

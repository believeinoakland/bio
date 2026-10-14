# scheduler (T48)

**Status** · session_018FNXLVRCc8F5GW3WK111dG · depth 2 · WORKING · handled B1

## Completion (T48-54)

- **Read:** `build/requirements/scheduler.md` whole; `m/scheduler/plane.test.mjs` whole; capture-requests' `plane.test.mjs` (the sign-in, disclosure and re-ask steps only). Module code not read: the entry changes a test only and the test showed no module flaw.
- **Entry applied:** T48-54. `plane.test.mjs` now signs in by `{handle, password}` (four places, was `{role: "member:…"}`, refused since control-plane R83). Reproduced first: 4 reds, `NOT_AUTHENTICATED`. Signing in then exposed two further acts the plane now asks before connecting an account in R12's test: the disclosure shown (`disclosureof`, `disclosureshown`; instance-setup R54, ai-accounts R23) and the password asked again (`reauth`; credentials R66, R71 (2)). Both added as capture-requests' plane test does. No assertion weakened.
- **Deferred:** none. **Found in other modules:** none.
- **Ran:** `node --test bio-plane/test/m/scheduler/`: 129 pass, 0 fail, 0 skipped. `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage has no failure for scheduler (the 23 failing modules are not mine); ownership: 1 file changed by scheduler, 0 failures.

Size (session_018FNXLVRCc8F5GW3WK111dG): test runs 4, module lines 0

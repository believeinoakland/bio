# credentials (T50)

**Status** · session_01Cw1gQFEGMdYMeQLFcFZmXg · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · REPORT

Progress, not complete. Entry T50-5 is built and pushed (7b8bb0f82b) against the requirement text; two providers are not merged, so two things are unproven and I wait for your CHANGE.

Built:
- R79: `aiRunCredentialMint` takes an optional `project` (present and not a non-empty string is `AI_RUN_CREDENTIAL_MALFORMED`, `what: "project"`; then the member must see and have joined it, else `NO_SUCH_PROJECT` / `PROJECT_ACT_NOT_A_PARTICIPANT` as ai-accounts R11 asks; then the keep-away). `aiGrantMint`'s existing `project` is kept on the grant row. Both tables gain a nullable `project` column.
- The viewer is `projectViewer(principal, project)` (membership R149), made when read: `aiGrantHeld` / `aiGrantAdmit` answer it as `viewer`; `aiCredentialLook` answers it as `principal` and adds `project` beside `run` and `writes` (for admission T50-79 and control-plane T50-35). If it cannot be made, no grant is held / the credential is not found: fail closed. With no project everything is as before; R12/R15 shapes unchanged.
- Tests: new `t50.test.mjs` (R79 x4, R73 refused); `t40.test.mjs` now expects the project viewer.

What is unproven until your CHANGE:
1. membership R149 is not merged, so `projectViewer` does not exist yet. `t50` and `t40` cannot even load until it does (named import). With a scratch stand-in (not committed) everything else passed: 157 of 160, the other 3 being the two inSight assertions (the stand-in is no real fence) and R73. After merge I swap my namespace import for a named one and run the real fence.
2. ai-accounts R26's refused clause is not merged: the R73 refused-sign-in test fails until it is. credentials' listener already revokes on any `account: "signin"` notice, so I expect no code change.

Checks (from the process repo): architecture 0 failures; coverage 55 of 55 ids named; ownership 0 failures. `format.mjs` fails on 2 lines of `build/rulings.md` (K3441, K3597, no standing-list decision): BOB's file, not mine.

Found in another module: none.

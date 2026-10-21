# BOB's own findings on the T51 build (K4300)

id | screen | width | role | step | what happened | expected | evidence | cause | severity
--- | --- | --- | --- | --- | --- | --- | --- | --- | ---
B1 | `/api/?op=bootstrap` | – | none | after the deploy | `part_signin` reads `false` (it read `true` at 0.86.0 before the deploy, 05:1x UTC); sign-in itself works for both roles (smoke) | `part_signin: true` when sign-in is configured | smoke `b_9.json`; pre-deploy read in K4298's session | not yet traced | MAJOR (a status the setup and Security screens may draw as "sign-in not set up")
B2 | `bootstrap&members=1` | – | none | after the deploy | agent-runner `UNBOUND` (reached through agent-worker's binding, which is SERVING) | as designed? (K4178: bindings only) | smoke `b_19.json` | to confirm against bundler/deploy-fleet | MINOR until confirmed

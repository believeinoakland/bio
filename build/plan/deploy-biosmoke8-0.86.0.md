# biosmoke8 0.85.0 -> 0.86.0, in-place from the cut (read-only plan; nothing was deployed)

Account 20b533579290b9b93168345edd3b7f72 confirmed by `wrangler whoami`. Cut: worktree `dist/cut-0.86.0` @ 1a17154149. Every fleet `dist/*.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` is sha256-identical to its `release/` asset (plane bdb5004f..., agent-runner db89775f, agent-worker 9e69c7c8, file-scanner 48e5a88d, ocr 1c3141d1, pdf 5a9ad3d3, sheet d29e92b5). Plane gzips to 7.48 MB (under the 10 MB paid limit).

## Names (shared fleet, per-instance plane)
- biosmoke8's plane: script `biosmoke8` (DO `Store`, class migration tag v1).
- Fleet members are NOT per-instance: `agent-runner`, `file-scanner`, `agent-worker`, `pdf-worker`, `ocr-worker`, `sheet-worker` (one copy each on the account). Only agent-worker's `PLANE` service binding points at the instance (`biosmoke8`, templated by deploy-fleet.mjs). Also on the account: `newgroup` (installer), `civicsmith-site`. Not touched.

## (1) Rollback targets (deployments list, 100% now; all serve 0.85.0)
| worker | live version id |
|---|---|
| biosmoke8 | 8970df60-afb6-4c20-b9f7-38d81d03793b (prior 44344489-e396-410a-a79c-ae59529115c4) |
| agent-runner | 8fc20b15-dbac-47e6-94fe-a31132b3dda0 (prior e6c5cf5c-...) |
| file-scanner | 5f6cd998-4312-474f-8646-d7ad1031f833 |
| agent-worker | 7fcfd982-a37f-4643-99c6-fc67ea9d90e6 (prior 49d6e98f-...) |
| pdf-worker | 6bb80c56-998f-4109-8541-fd7fcb3c17e0 |
| ocr-worker | 47c7c6c9-9ff6-4c0a-a26c-a2a88e3b9c3e |
| sheet-worker | 7a60b1cb-94dd-4030-af35-aa2cfd22fb9b |
(newgroup 320282bd-..., unchanged.) Live bootstrap: version/storeVersion 0.85.0, claimed true, test_instance true.

Live bindings of biosmoke8 (all must survive): secrets ACCOUNT_SEAL_SECRET, ADMIN_TOKEN, CIVICSMITH_TEST_INSTANCE, DAEMON_TOKEN, PROBE_TOKEN; DO STORE; r2 CAPTURES=bio-captures, PUBLISHED=bio-published; services AGENT_WORKER, FILE_SCANNER, OCR_WORKER, PDF_WORKER, SHEET_WORKER (the fleet names above), SELF=biosmoke8; browser BROWSER; plain INSTANCE_NAME, VERSION; limits subrequests 10000; Workers Logs on (K3577).

## (2) Commands, in order (K1540/K3237 order). Run from the cut root; env already has CF_TOKEN, CF_ACCT, CLOUDFLARE_API_TOKEN (never print). Each is Bob's approval in session (K1715).
Prereqs: `bio-plane/node_modules/.bin/wrangler` exists; start a Docker daemon (`dockerd &`) for the two container members (K3448); Docker Hub must be reachable for `docker pull docker.io/civicsmith/...`. Dry-runs of all six already passed (preflights, Containers reachable, PLANE -> biosmoke8).
```
node bio-plane/scripts/deploy-fleet.mjs agent-runner  --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs file-scanner  --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs pdf-worker    --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs ocr-worker    --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs sheet-worker  --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs agent-worker  --instance biosmoke8   # see BLOCKER 1
cd bio-plane && node scripts/deploy.mjs biosmoke8 0.86.0 ../release/bio-plane.bundled.mjs   # last
```
deploy-fleet runs `wrangler deploy -c <temp generated config>` from the committed bundle (identical to the signed asset); the installer is not used. The plane is PUT as the signed asset itself, then read back and hash-compared.

## (3) What each must not do
- Plane: `INSTANCE_AI_TOKEN`, `INSTANCE_CLAUDE_TOKEN` must not be exported (an AI token would replace the kept one; Claude token is ignored). deploy.mjs sends no `migrations` (correct: Store exists); it keeps secret_text, durable_object_namespace and service, re-sends VERSION/INSTANCE_NAME/CAPTURES/PUBLISHED/SELF/fleet service bindings/BROWSER, and re-sends unrecognized plain_text bindings unchanged. Expect the "already byte-identical" skip NOT to apply (bytes differ). Do not edit it; do not run it for any worker but `biosmoke8`. Never run `wrangler secret put`/`secret delete` or plain `wrangler deploy` in bio-plane/.
- Fleet: never run `wrangler deploy` directly in a member dir (agent-worker's config says PLANE -> "bio-plane", code 10143; deploy-fleet substitutes). Never edit tracked wrangler.jsonc. sheet-worker's `SHEET_RECOMPUTE=off` and the cpu_ms limits come from the member's own config (present; nothing dropped). Do not touch `newgroup`, `civicsmith-site`, or bucket/secret APIs.
- Difference from the installer update: the installer would also regenerate DAEMON_TOKEN and add OWN_HOSTS; deploy.mjs keeps DAEMON_TOKEN and sends no OWN_HOSTS (biosmoke8 has none today). Harmless.

## (4) Live checks after (GET only)
- `curl https://<m>.believeinoakland.workers.dev/version` for pdf/ocr/sheet (expect 0.86.0); plane `https://biosmoke8.believeinoakland.workers.dev/api/?op=bootstrap` -> version/storeVersion 0.86.0, claimed true, rearmed false, test_instance true, parts signin/scanner/safe_view true. agent-runner, agent-worker, file-scanner answer 1042 on workers.dev (bindings only): read their version via `wrangler deployments list --name <m>` and `/accounts/$A/workers/scripts/<m>/settings` (VERSION plain_text = 0.86.0) and the plane's `/version`-through-binding report (verifyServing / bootstrap parts).
- Bindings re-read of biosmoke8 `.../scripts/biosmoke8/settings`: same list as above, VERSION 0.86.0, limits 10000.
- selftest: `https://biosmoke8.believeinoakland.workers.dev/?op=selftest&token=<PROBE_TOKEN>`. The probe token is NOT in this session's environment (env has no PROBE_*; secrets are unreadable from the account). It was shown only on Bob's installer screen (K3427). Needs Bob to supply it, or skip selftest and rely on bootstrap. Do not rotate it.

## (5) Blockers / risks
1. agent-worker 0.86.0 binds `REMOTE` -> `agent-runner` class `RemoteSession` (new DO binding; also drops `RUNNER`, adds `CHECKS`/CheckRecord migration v2). The cut's agent-runner (bundle and source) has no `RemoteSession` class and its config declares only `AgentRunner` (grep: 0 hits in release/agent-runner.bundled.mjs). Cloudflare is expected to refuse the agent-worker deploy with 10061 (class absent), as in K3448; if it were accepted, the remote assistant path could never work. Step 6 may therefore fail (harmless, nothing changes) or leave the assistant unusable. The release notes already say assistant/publishing parts do not work yet. Needs BOB's ruling: skip agent-worker (leave 0.85.0; it keeps working with plane 0.86.0 only if the plane tolerates it) or fix agent-runner first.
2. Plane is 29 MB: R33 only concerns the installer; direct PUT used here. 0.84.0 (19 MB) went by this path; 29 MB is untested. Scripts-API upload limit not known beyond gzip 7.48 MB; a refusal changes nothing.
3. Docker daemon and Docker Hub reachability for agent-runner/file-scanner images unverified (dry-run does not pull).
4. Probe token not available (see 4).

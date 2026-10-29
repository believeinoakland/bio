# The probe run for P-M17 and L3-L5 (K5800): BOB's commands, in order

**Status** · For BOB #334, PLATFORM #4, 2026-10-29; revised after BOB's first steps (P-54). Branch `proto/levels-2-3-1f` at `3945eff822` (throwaway, never merged). K5800's conditions: account `20b533579290b9b93168345edd3b7f72` only; `ReaderProbe` on the published reader digest only (no MinProbe, no image built, K1898); `standard-1`; the short scenarios; at most a 24-hour idle run; then teardown; about $5 in all. **Times are my estimates**, from my local runs of the same image at the same shape (`results/l3-image-local.json`, `l4-image-local.json`) and the worker's; every Cloudflare figure (provisioning, cold start, R2 speed) is unknown until this run.

## What this run measures, and what it cannot
- **Measures:** container cold start from never run (5 new instances) and from sleep; the product's own path R2 -> Worker -> container for L3 (photos), L4 (LibreOffice), L5 (archives), with the Worker's R2 read time, the container's answer and completion or refusal; whether the platform restarts an idle container's host within 24 hours (the object's start/stop event log); the L1 byte-pass floor if the L1 fixtures are added (optional, not in this list).
- **Cannot, with the reader image alone** (its server answers only `POST /convert`, `/frames`, `/archive` and `GET /version`, `container/server.mjs:81`): the outbound-handler and S3/FUSE transfer, the output stream, a running job across a deploy, SIGTERM's grace. `run-remote.mjs` refuses those four scenarios with `--which=reader`. They stay **not yet measured**.

## Commands (one plain command each, in a session; K5123)

| # | command (from `proto-mem/1f/probe` unless stated) | expected wall time |
|---|---|---|
| 0 | `git -c http.version=HTTP/1.1 fetch origin proto/levels-2-3-1f` then `git worktree add /home/user/wt-1f origin/proto/levels-2-3-1f` (from the bio checkout), then `cd /home/user/wt-1f/proto-mem/1f/probe` and `npm install` | 1 min |
| 1 | `apt-get install -y p7zip-full libimage-exiftool-perl libheif-examples libheif-plugin-x265 libheif-plugin-libde265` (ImageMagick, ffmpeg and LibreOffice were present in my session) | 1-2 min |
| 2 | `node ../gen/gen-all.mjs --out=/home/user/fix1f --set=l3,l4,l5 --tier=local --skip=' (doc\|ppt) \|rtf .*--mib=(50\|100)\|--mib=(400\|480) \|blob \|--mib=1900'` (26 fixtures, all under 95 MiB; writes `/home/user/fix1f/MANIFEST.jsonl`) | 6-10 min |
| 3 | `export CLOUDFLARE_ACCOUNT_ID=20b533579290b9b93168345edd3b7f72` then `node deploy.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files --instance-type=standard-1 --which=reader` (dry run; prints "containers ReaderProbe") | 5 s |
| 4 | `node deploy.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files --instance-type=standard-1 --which=reader --max-instances=6 --go` (a cap on running instances, not a cost) (R2 bucket create, `wrangler deploy`; no image is built) | 1-5 min (provisioning unknown) |
| 5 | `npx wrangler secret put PROBE_TOKEN --config wrangler.generated.json` (paste the output of `openssl rand -hex 24`; at least 16 characters; never in a file, never printed) | 10 s |
| 6 | `export PROBE_BASE_URL=https://plat-s1-probe.<workers.dev subdomain>.workers.dev` and `PROBE_TOKEN=<the token>`, then `node run-remote.mjs --scenario=health` | 5 s |
| 7 | `node run-remote.mjs --scenario=seed --sizes=10,50,100 --upload=/home/user/fix1f` (160 MiB made in the Worker; about 0.6 GB of fixtures through `/put`) | 3-8 min |
| 8 | `node run-remote.mjs --scenario=coldstart --which=reader --n=3` (3 never-run instances of the 1.15 GB image, 3 warm calls each; **n must not exceed `max_instances`**: the first run used n=5 against 3, my error, P-54) | 2-6 min |
| 9 | `node run-remote.mjs --scenario=fromsleep --which=reader --wait-s=360` | 7 min |
| 10 | `node run-remote.mjs --scenario=reader --manifest=/home/user/fix1f/MANIFEST.jsonl --set=l3` | 4-7 min (201 s locally) |
| 11 | `node run-remote.mjs --scenario=reader --manifest=/home/user/fix1f/MANIFEST.jsonl --set=l4` | 2-4 min (the 10 MiB RTF 46 s locally) |
| 12 | `node run-remote.mjs --scenario=reader --manifest=/home/user/fix1f/MANIFEST.jsonl --set=l5` | 4-8 min (the 10,000-member ZIP about 2 min locally) |
| 13 | `node deploy.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files --instance-type=standard-1 --which=reader --sleep-after=25h --bucket-exists --go` (so the idle instance stays awake through 24 h) | 1-3 min |
| 14 | `node run-remote.mjs --scenario=idle --which=reader --hours=0` (one ping; note the `inst` it logs and the time) | 1 min |
| 15 | about 24 hours later: `node run-remote.mjs --scenario=state --which=reader --inst=<inst from 14>` (the object's start/stop events: a host restart shows as an `onStop` before 24 h); read the account's Containers usage for the period on the dashboard | 5 s |
| 16 | `node run-remote.mjs --scenario=wipe` (empties the bucket), then `node teardown.mjs --name=plat-s1-probe --bucket=plat-s1-probe-files --go`, then `npx wrangler containers list` for leftovers | 2 min |

Results land in `proto-mem/1f/results/remote-<scenario>-<time>.jsonl` (the token is never written); commit them to `proto/levels-2-3-1f` or tell me where they are, and I write them up.

**Cost (arithmetic on PLATFORM.md §6.4's quoted rates; `containers/platform/pricing` re-read 2026-10-29 gives the same rates).** `standard-1` awake at most $0.074 an hour: steps 8-12 keep at most 6 instances awake for about 1.5 hours in all (each sleeps 5 minutes after its last request), at most about $0.15; step 14's 24 hours awake at most $1.78; R2 and requests cents. About $2 in all, within K5800's $5; the included monthly allowance (25 GiB-hours, 375 vCPU-minutes) may cover part of it.

**Guards.** `deploy.mjs` and `teardown.mjs` refuse any account but the permitted one, the rehearsal account, any name not `plat-s1` or `plat-s1-<suffix>`, and with `--which=reader` any `ReaderProbe` image that is not a `docker.io/civicsmith/reader-container@sha256:` digest; `run-remote.mjs` refuses a host not starting with `plat-s1` and a missing token. `wrangler deploy --dry-run` with `--which=reader` passed in 3 s (wrangler 4.114.0): one container, one binding, one migration, no build.

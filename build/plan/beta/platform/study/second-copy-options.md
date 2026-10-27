# Second copy beside biosmoke8: what deploy-test does, and options (read-only; no file changed)

Paths under /home/user/bio. wf = .github/workflows/deploy-test.yml; dfl, dep, drv, fb = bio-plane/scripts/ deploy-fleet, deploy, derive-bindings, fleet-bundle (.mjs). Read whole: those four, wf, the six fleet configs and markers, bio-plane/wrangler.jsonc, bundler.md, installer.md, installer-steps.md, the installer's install run (newgroup/src/index.mjs:600-860, steps/{account,members,install}.mjs, uploads.mjs:51-96). jsonc, provenance, resolve-version, bundles read only for what they decide (build, version gate); none decides names or bindings.

## 1. What a deploy-test of a new copy name does

K3262 (rulings.md:3263): `newgroup`, `agent-worker`, `agent-runner`, the four document workers, 3 container applications ("13 of 16 instances in use") and both R2 buckets are shared; only the plane is per copy. deploy-biosmoke8-0.86.0.md:7: "Fleet members are NOT per-instance ... Only agent-worker's PLANE service binding points at the instance."

Steps (wf:63-119), COPY=plat-s1:
1. wf:82-89 sets CIVICSMITH_TEST_INSTANCE=plat-s1 and logs "real run" or "--dry-run".
2. wf:96-105 npm ci, then `bundles.mjs` builds the branch.
3. wf:106-113 loops `discoverMembers` in name order (fb:213): agent-runner, agent-worker, file-scanner, ocr-worker, pdf-worker, sheet-worker, each `dfl <member> --instance plat-s1 --test-instance`.
4. wf:114-119 `dep plat-s1 <version> dist/bio-plane.bundled.mjs --test-instance` last.

Per member, `dfl` (names all SHARED: the config's own `name`, dfl:246, 322):
- Substitutes only `service == "bio-plane"` with the slug (dfl:126-133). Only agent-worker has one (agent-worker/wrangler.jsonc:86-88). REMOTE's `script_name: "agent-runner"` and every other target stay literal (agent-worker:98-101).
- Real run: docker pull and `wrangler containers push` of each image (dfl:289-313), then `wrangler deploy -c <generated config>` of the branch's bundle (dfl:316-338): it REPLACES the live shared Worker's code, vars and bindings and rolls its container application.
- agent-runner: Worker, DOs AgentRunner and RemoteSession (migrations v1, v2, agent-runner/wrangler.jsonc:43-47), container standard-1, max_instances 10 (:26-34). No service binding.
- file-scanner: R2 CAPTURES=bio-captures (:29-31), cron `*/10` (:25), containers FileScanner and SafeViewRenderer, standard-1, max_instances 3 each (:38-51), DOs SCANNER, RENDERER.
- ocr-worker, pdf-worker, sheet-worker: R2 CAPTURES=bio-captures.
- agent-worker: DOs SEGMENTS, CHECKS (own, migrations v1, v2, :104-113), REMOTE cross-script, PLANE service.
- Plane `plat-s1` (dep): PUT of `plat-s1` with VERSION, INSTANCE_NAME=plat-s1, R2 CAPTURES/PUBLISHED = `bio-captures`/`bio-published` copied verbatim from config (drv:77-79; wrangler.jsonc:41-44), services PDF_WORKER, AGENT_WORKER, OCR_WORKER, SHEET_WORKER, FILE_SCANNER at their shared literal names and SELF at the slug (drv:80-83; wrangler.jsonc:121-128), BROWSER, limits, observability, then the `*/5` cron set and read back (dep:272-291, 580).
- Creates NO R2 bucket, queue (drv:35-39 refuses `queues`), secret (INSTANCE_AI_TOKEN only if the env holds one, dep:128-133; wf sets none) or container application. Per copy: only the Worker `plat-s1` (and its own `plat-s1_Store` DO if it had one, MULTI-INSTANCE-ISOLATION.md:44).

**The plane cannot be created by dep.** `keep_bindings` keeps `secret_text`, `durable_object_namespace`, `service` (dep:282); dep sends no STORE binding and no `migrations` (dep:245-249; drv:13-15; bundler R13, bundler.md:47). On a missing script `bindingsNow` answers empty (dep:361). So `dep plat-s1` would upload a Worker with no STORE, no ADMIN/PROBE/DAEMON/ACCOUNT_SEAL secrets and no `v1` migration, and could still print success because /version answers (draft-biosmoke8-install.md:7, F1). SELF on a create is unproven (same draft, Q3; the installer retries without it, installer-steps R12 line 72, index.mjs:816-830).

**Why it refused.** The members run in name order, so agent-runner (no services) passes first, in a real run after its image push and redeploy. agent-worker is second: its target is `plat-s1` (dfl:129), `scriptExists("plat-s1")` is false (dfl:202-209), and dfl:215-223 dies `BINDING_TARGET_MISSING` ("The instance ... is not deployed. Deploy the plane first - a fleet member binds to a plane that is already there."). The workflow puts the fleet before the plane (wf:106-119) and the message's remedy (plane first) is the order dep itself demands the other way: dep preflights that all five fleet targets exist (dep:406-429, bundler R17, bundler.md:58). For a new copy the two checks are a cycle, which the installer breaks with three acts (installer.md:31, installer-steps R19 line 81).

**What the plan would have changed on shared members if the plane existed.** agent-worker's single `PLANE` would point at plat-s1, so biosmoke8's assistant calls (plane to `AGENT_WORKER`, which reaches a plane only through `env.PLANE`, agent-worker/src/index.mjs:135, 305) would land on plat-s1. That is the re-point K3262 describes for biosmoke7 to 8. Every other member would be redeployed from the branch's bundles, so biosmoke8's fleet would move beside its unchanged plane.

## 2. Options

The plane stores R2 keys `<store>/captures/<sha>` with the store hard-coded `"bio"` (bio-plane/src/control-plane/index.mjs:184, 398, 426) and pdf-worker reads the same key (pdf-worker/src/index.mjs:291), so members work only on the bucket the plane writes. The shared `bio/` prefix is "not separable" (K3263, rulings.md:3264). With a member absent the plane degrades (wrangler.jsonc:46-53, 87-91, 105-121: PDF to Tier 1; ask refuses AGENT_WORKER_UNBOUND; OCR, sheet, scan say so), but dep binds and preflights all five anyway.

**A. Plane alone, shared fleet untouched.**
- Supported? Not as built. dep is the release path for an existing plane. Needs: (i) a one-time create with STORE, `v1` migration and four secrets, as draft-biosmoke8-install.md steps 3-4, Bob's/BOB's operator act or a new `--create` path in dep (bundler); (ii) a workflow input to skip the fleet loop (wf:106-113; CI is BOB's, K4290).
- Touches: new Worker `plat-s1`, its DO; binds shared buckets and shared members as a client. Untouched: every member's code, bindings, containers; biosmoke8's Worker.
- Risk to biosmoke8: no config change. But plat-s1 writes into bio-captures and bio-published (key space and public bucket shared; MULTI-INSTANCE-ISOLATION.md:52-54), seeding S1's ~2 GB lands there permanently (s1-steps.md:15), and S1's container load (1f) draws on the shared apps' max_instances 3 and 3, so biosmoke8's scans can queue. plat-s1's asks reach agent-worker, whose PLANE is biosmoke8: foreign traffic in biosmoke8 (whether it is refused first is UNCLEAR).
- Works: screens, uploads, captures, Tier 1 reading, PDF Tier 2, OCR (ocr-worker is a wasm Worker, not a container), sheets, file scan and safe view (shared containers). Does not work: the assistant (AGENT_WORKER lands on the wrong plane; REMOTE/agent-runner shared).
- S1 needs (s1-steps.md:7-19): a claimed Level 1 team, administrator and member (ADMIN_TOKEN, /app/setup#boot=, draft-biosmoke8-install.md:22); 1a-1e run; 1f is the contended step.

**B. Per-copy fleet names (all members `<member>-<slug>`, buckets per slug).**
- Code (bundler module, bio-plane/scripts; spec bundler R13, R17, R19, R40): dfl generated config `name` and every cross-member target (`REMOTE.script_name`, plane services) templated; drv:80-83 substitutes only `bio-plane` today, and r2 `bucket_name` must be per slug (drv:77-79); bucket creation does not exist in dep or dfl (installer `ensureBuckets`, installer-steps R8 line 66); the PLANE-versus-plane cycle needs an order or three acts; container application names under wrangler are UNCLEAR. A second copy of the naming rule would live in bundler because installer-steps R35 (line 125) forbids it importing the installer's `namesFor` (account.mjs:33-44).
- Touches only new names. Untouched: all existing shared members, bio buckets, biosmoke8. Risk to biosmoke8: none if the templating is right; a templating bug would redeploy shared names (a dry run's dfl:135-139 lines show it first).
- Works: all of A plus the assistant; S1's container load is private. Adds 16 max_instances (10+3+3).

**C. A real team through the installer (alongside, per-slug names).**
- No code to install. `newgroup` (embeds 0.87.0, newgroup/src/release.mjs:2, RELEASE.json) names every part by the slug (account.mjs:33-44): plane `plat-s1`, buckets `bio-captures-plat-s1`, `bio-published-plat-s1`, members `<m>-plat-s1`, container apps by slug (containers.mjs:196-204 creates with `instances: 0`, max from the part), members' services and DO `script_name` templated to the copy (members.mjs:58-60, 80; install.mjs:99-106), plane secrets via uploadInstall (uploads.mjs:51-96). An account holding biosmoke8 gets the "exists" page with install-alongside (index.mjs:681-687; installer R62, R64, lines 116, 118; K3667, rulings.md:3666).
- Touches only new names. Untouched: biosmoke8 and the shared fleet. Risk to biosmoke8: none by design (R64's control: "neither changes the other's bytes"; installer.md:118).
- Who: Bob in his browser (OAuth consent; K3427 did this for biosmoke8, rulings.md:3426). Not a session act.
- Works: all features incl. assistant (own agent-worker and agent-runner). S1 gets a claimed Level 1 team with the signed 0.87.0, NOT tranche/T53 14b73ea14e (s1-steps.md:3).
- Blocker for S1's later redeploy of branch code (s1-steps.md:8): `dep` and `dfl` do not know per-slug names. `dep plat-s1` would rebind CAPTURES/PUBLISHED to `bio-captures`/`bio-published` (drv:77-79; r2_bucket is not in keep_bindings, dep:282) and services to the shared members; `dfl --instance plat-s1` would redeploy the shared `agent-worker`. Needs a dep/dfl change in bundler (read the held CAPTURES binding as `schemeOf` does, installer-steps R2) before any deploy-test over an installer copy.

**D. Throwaway account.** No shared state, but for the new-team rehearsal alone (CLAUDE.md; K4942, rulings.md:4937); wf, dep, dfl hard-code 20b5 (wf:60, dep:71, dfl:72).

For S1: C then (after a bundler fix) deploy-test, or B, are the clean ones; A needs no bundler change but shares biosmoke8's buckets and containers.

## 3. Container headroom and account limits quoted

- Declared per copy: agent-runner 10 (agent-runner/wrangler.jsonc:32), FileScanner 3, SafeViewRenderer 3 (file-scanner/wrangler.jsonc:43, 49), all standard-1 = 1/2 vCPU, 4 GiB (study-assistant-link.md:28; agent-runner.md R33, line 154). 16 in all.
- K3262: "13 of 16 instances in use" across 3 applications (rulings.md:3263).
- Cloudflare account defaults: concurrent memory 6 TiB, vCPU 1,500, disk 30 TB, image storage 50 GB, "defaults and can be increased"; no count limit for applications (build/plan/diagnosis-R9-account-ready.md:106; ready.mjs:105-110; PLATFORM.md:212: no max_instances ceiling documented).
- Installer's ceilings (ready.mjs:112-115): Workers 500 (a copy needs 9), DO classes 500, R2 buckets 1,000,000 (needs 2), crons 250 (needs 7); current use is read by `limitReached` (ready.mjs:136-146).
- My arithmetic: 16 x 4 GiB = 64 GiB, 8 vCPU, far under those defaults.

## 4. UNCLEAR

1. Was the plat-s1 run a dry run? wf:89's log line says. If real, agent-runner was already pushed and redeployed under its shared name before agent-worker (second in order, not first) refused.
2. What "13 of 16" counts and where the 16 comes from (it equals the sum of declared max_instances, which would make 13 a live count; unverified).
3. Whether a branch build changes shared migrations (a new tag on agent-runner or agent-worker is permanent on the shared script); compare the branch's `migrations` with what biosmoke8's fleet holds.
4. How wrangler names container applications for a renamed Worker (option B).
5. Whether Cloudflare refuses SELF on a create PUT; whether a dep-created Worker gets a workers.dev address (dep never enables one).
6. Whether biosmoke8's plane refuses a foreign credential before any effect (option A, agent-worker PLANE).
7. Current account counts for the ceilings in section 3.
8. Whether T53's 14b73ea14e differs from the 0.87.0 cut (option C).

## C. The exact act for Bob, in plain clicks (added by PLATFORM #1 for BOB, from a worker's read of the installer; file:line in the worker's notes, quoted rulings K3427, K3448, K3556, K3667)

**Before he starts.** Bob is signed in to Cloudflare in his browser as a member of account `20b5…7f72` (the installer's sign-in is private to it). About twenty minutes, at a computer. **He must press only "Install alongside it"**: the same page also offers "update" and "remove" for biosmoke8; he presses neither.

1. Open `https://newgroup.believeinoakland.workers.dev/` (0.87.0 is deployed there, K5350).
2. "Do you already have a Cloudflare account?" Press **Yes**.
3. Type the short name `plat-s1` (lowercase letters, digits, hyphens). Press **Continue**. A dialog says the name can never be changed; confirm it.
4. The page lists what Cloudflare will be asked. Press **Continue to Cloudflare**, and on Cloudflare's page allow the six permissions it lists.
5. The installer finds biosmoke8 and stops on an "exists" page with the words "Nothing was created or changed". This is expected. Under **"Install alongside it"** type `plat-s1` again, press the button, confirm the dialog, and allow Cloudflare once more if it asks again.
6. Watch the progress lines (about twenty minutes; each wait is bounded to five minutes). There is no region choice and no team-name or password field; the region follows Bob's own connection (none, or western or eastern North America), as K4747 sets it.
7. At the end a panel shows the copy's address, a **one-time password** (shown once, with a copy button) and a folded probe key. **Bob must not paste the one-time password into the chat**: it never expires, and whoever holds it before the claim can claim the copy in his place.
8. Bob presses **"Continue to your team's Civicsmith: become its first administrator"**, chooses a handle and a password of 12 or more characters, and saves the ten recovery codes (these stay his).
9. In the copy, as administrator, he opens **Members**, adds a member with the role **administrator**, and copies the invitation link it shows once: `<address>/#invite=<token>`. **This link is what he pastes into the chat for my session.** It works once and expires in 7 days unless he sets 1-30 days; only its hash is kept; until it is spent it is a secret that enrols one administrator, so it goes only to this chat and is spent within the hour.

**How my session gets in without any password from Bob.** I open the link's join page, choose my own unique handle and a 12+ character password (generated in my session's environment, kept in `PLATS1_ADMIN_*`, never printed or written to a file; the copy keeps only a hash), and enrol as the administrator. As administrator I then add a member through the product's own act, accept that invitation myself, and keep its handle and password in `PLATS1_MEMBER_*`. Bob never sees either password. If a link is spent or expires before I use it, Bob issues another.

**The copy's test flag (BOB's act, with Bob's in-session approval, K3427, K3448, K1715).** The deploy-test workflow sets `CIVICSMITH_TEST_INSTANCE` for itself from the copy name, so nothing on the copy is needed for that. The copy's own `test_instance: true` (which `journey-check` and the walkers' guards read) needs a plane secret `CIVICSMITH_TEST_INSTANCE=plat-s1` on Worker `plat-s1`, set by BOB (Workers secrets API, or `wrangler secret put --name plat-s1`, account `20b5…` only), as K3448 did for biosmoke8. The installer never sets it (R49).

**Does anything afterwards need a fleet deploy? No.** The installer installs its own per-slug members (`<member>-plat-s1`, buckets `bio-captures-plat-s1` and `bio-published-plat-s1`, container applications at 0 instances) and by R64 touches nothing of biosmoke8's or the shared fleet. **Any later deploy of branch code to `plat-s1` is plane-only, from `proto/levels-2-3`, never the stock deploy-test (it would re-point the shared members).**

**Risks BOB should know before asking Bob.**
1. The 0.87.0 plane is 28 MB; R33's memory tests were red on the tranche tip (K5350) and an earlier live run died at 21 MB (K3440); there is no recorded live run of this installer at 0.87.0. A failed run leaves a resumable partial copy under the same slug (R69); if it fails, the next step is BOB's diagnosis, not a retry loop.
2. Container-application headroom in the account is unverified (K3262's "13 of 16" is not in the tree); three more applications (10, 3, 3 instances) are created at 0 instances.
3. The copy is the signed 0.87.0, not `tranche/T53` 14b73ea14e; S1's figures state that, and the proto branch's plane-only deploy later brings the branch code.
4. K3556's "nothing it holds is secret" names biosmoke8 only; plat-s1 holds only generated or public documents (`s1-steps.md` §2), so it carries no secret either way, and the founder claim is Bob's.

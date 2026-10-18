# biosmoke8: fresh install from `dist/cut-0.85.0`, re-points, biosmoke7 removal (runbook draft for BOB #184)

Read-only research, 2026-10-15. Repository at `tranche/T49` (main @ dccb389428). Cloudflare: GETs only, account `20b533579290b9b93168345edd3b7f72`. Nothing changed or deployed. No secret value was read or printed (names only).

## Findings that shape the runbook

**F1. `deploy.mjs` cannot create a fresh plane by itself.** It sends no Durable Object binding and no migration. Its derived bindings deliberately leave out `durable_object_namespace` (`derive-bindings.mjs`:13-17). It sends no `migrations` field (`deploy.mjs`:199-202). It relies on `keep_bindings: ["secret_text","durable_object_namespace","service"]` to keep the store and the secrets (`deploy.mjs`:231). On a script that does not exist yet there is nothing to keep, so `deploy.mjs biosmoke8 …` would create a worker with **no `STORE`, no secrets and no `v1` SQLite migration**. Its `/version` would still answer 0.85.0, so the rollout gate (`deploy.mjs`:160-193) would report success on a plane whose every store op fails. Adding `STORE` later without a migration is refused by Cloudflare: a new DO class needs `new_sqlite_classes`, and the SQLite backend cannot be switched after the fact (`wrangler.jsonc`:17-25). So a one-time **create** must run first. It carries the `STORE` binding, `migrations {new_tag:"v1", new_sqlite_classes:["Store"]}` and the secrets, exactly as the installer's `uploadInstall` does (`newgroup/src/index.mjs`:586-631). After that, `deploy.mjs` is the release path, as on biosmoke7.

**F2. biosmoke7 lacks `ACCOUNT_SEAL_SECRET`.** Its secrets, read from the API: `ADMIN_TOKEN`, `MEMBER_TOKEN`, `PROBE_TOKEN`, `DAEMON_TOKEN`, `CIVICSMITH_TEST_INSTANCE`. Without the seal secret, connecting a member's own Claude subscription or API key is refused `ACCOUNT_SEAL_UNAVAILABLE`. The subscription token is held sealed (`ai-accounts/index.mjs`:36, 366, 759-766; `plane/store.mjs`:152-153). biosmoke8 must have this secret, or Bob cannot "connect his Claude subscription".

**F3. The UI worker's re-point is a code edit, not an argument.** `civicos-ui/deploy-ui.mjs`:17 hardcodes `service: "biosmoke7"` and takes only `<asset>`. `civicos-ui/worker.template.mjs`:15 also names `https://biosmoke7.believeinoakland.workers.dev` as the proxied URL; with a service binding the host is not used for routing, but it is stale. Since K3052, `civicos` (legacy-ui) is not a user's interface. Deleting it instead of re-pointing it is a real option (see open question Q2).

**F4. `storeName` is not configurable per instance.** It is hardcoded `"bio"` (or `scratch`) in `control-plane/index.mjs`:189, 343, 501 and 741. agent-worker also accepts only `bio`/`scratch` (`agent-worker/src/index.mjs`:253-257). R2 keys are `<storeName>/captures/<sha>` (`control-plane/index.mjs`:315). **biosmoke8 still starts clean in every sense a member sees:**
- its record lives in its own DO namespace (`biosmoke8_Store`, created by F1's migration), so it references none of biosmoke7's or bobux's objects;
- R2 keys are content-addressed by sha256, so a shared object is at most re-used byte for byte;
- the plane never deletes from `CAPTURES`/`PUBLISHED` outside the self-test's scratch round trip (`setup.mjs`:3860, `livefire.mjs`:168-177; no other `.delete(` on the buckets).

Leftover biosmoke7 objects under `bio/` persist and cannot be told apart. Do not bulk-delete them (inventory §3). Making the prefix per-instance would be a plane change (a requirement and a job), not a deploy step.

**F5. The current bindings to biosmoke7 (API, read today).** `agent-worker` has `PLANE -> biosmoke7` (and DO `RUNNER`). `civicos` has `PLANE -> biosmoke7`. `biosmoke7` itself has `SELF`. No other worker binds it: agent-runner, bobux, civicsmith-site (new since the inventory; no bindings to biosmoke7), file-scanner, newgroup, ocr-, pdf- and sheet-worker were all checked. bobux binds `agent-worker`, so re-pointing agent-worker's `PLANE` to biosmoke8 sends bobux's asks back into biosmoke8. That is already the case with biosmoke7 today, and bobux's owner is still open with Bob (K3262).

**F6. The claim is at `/app/setup`, not `/`.** `/` is `front`: the group's page and the sign-in (screens-entry R1, `build/requirements/screens-entry.md`:17). It does not forward an unclaimed instance to setup (no claimed check in `screens-entry/front.mjs`). The claim screen is `/app/setup` (screens-entry R6, R17, :22 and :47). It fills the one-time password from `#boot=`, asks for a handle and a password typed twice (12 characters or more), sends `claim`, then `login`, then shows ten recovery codes. The one-time password is the plane secret `ADMIN_TOKEN`. The claim compares `body.bootstrapToken === env.ADMIN_TOKEN` and refuses an unset value (`BOOTSTRAP_CREDENTIAL_UNSET`) or a published one (`control-plane/index.mjs`:754-766). It is spent at the claim (credentials R2, R77).

## 1. The plane's secrets (names only)

| Secret | For | How generated | Must match |
|---|---|---|---|
| `ADMIN_TOKEN` | the one-time password (bootstrap credential) that arms the claim (`control-plane/index.mjs`:754-766); the root of trust's credential (installer R9, R16; Membership arch. §4.6) | random 32 bytes (`openssl rand -hex 32`; the installer uses `rand(32)`, `newgroup/src/index.mjs`:1589) | nothing else; Bob must receive it (Q1) |
| `PROBE_TOKEN` | the probe credential: reads anything, writes only in `scratch`; `op=selftest` (`setup.mjs`:3832-3833; `bio-plane/DEPLOY.md` §3) | random 32 bytes | nothing; kept in the session for verification |
| `DAEMON_TOKEN` | the monitoring credential the plane spends on itself over `SELF` (REC-33, DIST-2; `newgroup/src/index.mjs`:603-612); without it the plane falls back to `ADMIN_TOKEN` | random 32 bytes; never shown to anyone | nothing |
| `ACCOUNT_SEAL_SECRET` | the key members' Claude subscription tokens and API keys are sealed under (K1541, K1693; `newgroup/src/index.mjs`:460-467) | random 32 bytes; never shown; **never rotated** (rotating it makes every sealed reference unreadable) | nothing |
| `CIVICSMITH_TEST_INSTANCE` | the test-instance exception (ai-runs R78, `ai-runs/index.mjs`:331-337; D10, K3324 (4); M-T46-3) | the literal `biosmoke8` | must equal `INSTANCE_NAME`, which `deploy.mjs` binds from the slug (`derive-bindings.mjs`:68-70) |

Not set:
- `MEMBER_TOKEN`: retired (installer R9 since T36, N711; `newgroup/src/index.mjs`:600). biosmoke7 still carries it from an early install. The text of installer R9 in `build/requirements/installer.md`:28 still lists it, which is stale against the code ("four credentials", :1588).
- `INSTANCE_AI_TOKEN`: never generated. A member mints it on the instance (`deploy.mjs`:82-89; `derive-bindings.mjs`:46-51). Without it, wakes say `NO_INSTANCE_AI_CREDENTIAL`; it is optional for Bob's walk.
- `KNOCKER_SECRET_KEY`: optional. The doorbell generates its own key (`doorbell/index.mjs`:228-236).
- `INSTANCE_CLAUDE_TOKEN`: forbidden (K1502).

**No secret is shared with the fleet.** agent-worker holds no secret (`agent-worker/wrangler.jsonc`:74), and the plane hands it a credential per call. Each of the four random secrets is independent.

## 2. The runbook

Context for every step:
- **S** means the session runs it. **DEPLOY** means a deploy-class act (a Cloudflare write) that needs Bob's approval in the session (K1715, in K1716's form). One approval line may name the whole sequence (K2110, as in K3236 and K3047).
- **Bob** means an act only Bob can do.
- Commands run in a worktree at `dist/cut-0.85.0`.
- `CF_TOKEN` and `CF_ACCT` are already in the environment.
- Secret values never appear on a command line. They live in a mode-600 file in the scratchpad, which is shredded afterwards.

### 0. Preconditions (S, read-only)

```bash
git worktree add ../cut085 dist/cut-0.85.0 && cd ../cut085
npx --prefix bio-plane wrangler whoami        # must show 20b533579290b9b93168345edd3b7f72, else STOP (CLAUDE.md)
test "$CF_ACCT" = 20b533579290b9b93168345edd3b7f72
node -e 'console.log(require("./release/RELEASE.json").version)'   # 0.85.0, signed (K3422)
```

- `node_modules` must be installed in every bundled member. `dockerd` is needed if agent-runner's image changed (K3237).
- Run `node bio-plane/scripts/deploy-fleet.mjs <m> --instance biosmoke8 --dry-run` for each member. Source: `deploy-fleet.mjs`:50-52.

### 1. Rollback targets (S, read-only)

Record `wrangler deployments list --name <w>` for agent-worker, agent-runner, pdf-worker, ocr-worker, sheet-worker, file-scanner and civicos. biosmoke7 is not needed, since it is being removed (K3260). Source: draft-T46-trial §4 step 1.

### 2. Generate the secrets (S, local, nothing sent)

```bash
umask 077; F=$SCRATCH/biosmoke8.secrets.json
node -e 'const r=()=>require("crypto").randomBytes(32).toString("hex");
  require("fs").writeFileSync(process.argv[1], JSON.stringify({ADMIN_TOKEN:r(),PROBE_TOKEN:r(),DAEMON_TOKEN:r(),
  ACCOUNT_SEAL_SECRET:r(),CIVICSMITH_TEST_INSTANCE:"biosmoke8"}))' "$F"
```

`ADMIN_TOKEN` may instead be the value Bob already holds in the session's environment settings (Q1).

### 3. Create the script, its DO namespace and its migration (S; DEPLOY)

Generate a temporary wrangler config, the deploy-fleet pattern (`deploy-fleet.mjs`:28-36). It is the plane's `wrangler.jsonc` with these changes:
- `name: "biosmoke8"`;
- `main: "../release/bio-plane.bundled.mjs"`;
- `no_bundle: true`;
- `vars: {VERSION:"0.85.0", INSTANCE_NAME:"biosmoke8"}`;
- the `SELF` service set to `biosmoke8`, matching the substitution in `derive-bindings.mjs`:80-82.

Keep `durable_objects` STORE/Store, `migrations [{tag:"v1", new_sqlite_classes:["Store"]}]`, both R2 buckets, the five fleet services, `browser`, `limits.subrequests 10000` and `compatibility_flags ["nodejs_compat"]` (`wrangler.jsonc`:10-25, 41-44, 121-128, 138, 169).

```bash
node -e '/* read bio-plane/wrangler.jsonc via scripts/jsonc.mjs, apply the changes above, write $SCRATCH/biosmoke8.wrangler.json */'
npx --prefix bio-plane wrangler deploy -c $SCRATCH/biosmoke8.wrangler.json
```

- This creates the worker `biosmoke8`, the namespace `biosmoke8_Store` (SQLite) and the workers.dev route (`biosmoke8.believeinoakland.workers.dev`).
- If Cloudflare refuses the self-reference `SELF` on the create, deploy without it. Step 5's `deploy.mjs` PUT adds it, the same degradation the installer uses (`newgroup/src/index.mjs`:1600-1611).
- Afterwards, `GET …/workers/durable_objects/namespaces` should show `biosmoke8_Store`.

### 4. Set the secrets (S; DEPLOY)

```bash
npx --prefix bio-plane wrangler secret bulk "$F" --name biosmoke8
```

- Run this before step 5, so that `keep_bindings` keeps the secrets (`deploy.mjs`:231).
- The `CIVICSMITH_TEST_INSTANCE=biosmoke8` value is D10's act (K3324 (4); draft-T49-final.md:279). The installer may never carry it (installer R49).
- Once set, it survives every later deploy and is removed only deliberately (draft-T46-trial §4 "Risk").

### 5. The signed plane, verified by its bytes (S; DEPLOY)

```bash
cd bio-plane && node scripts/deploy.mjs biosmoke8 0.85.0 ../release/bio-plane.bundled.mjs
```

The script:
- refuses version skew (`deploy.mjs`:51-72);
- pre-flights every fleet target (:250-271);
- PUTs the derived bindings, including `SELF -> biosmoke8` and `INSTANCE_NAME`, while keeping `STORE` and the secrets;
- verifies the read-back sha256 against the signed asset (:338-354), reads the limits back (D-54), and waits for `/version` to answer 0.85.0.

### 6. The fleet at 0.85.0, re-pointed to biosmoke8 (S; DEPLOY)

```bash
node bio-plane/scripts/deploy-fleet.mjs agent-runner --instance biosmoke8   # container image copied (docker), if changed
node bio-plane/scripts/deploy-fleet.mjs file-scanner --instance biosmoke8   # only if its images or bundle changed
node bio-plane/scripts/deploy-fleet.mjs agent-worker --instance biosmoke8   # PLANE -> biosmoke8 (the re-point)
node bio-plane/scripts/deploy-fleet.mjs pdf-worker   --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs ocr-worker   --instance biosmoke8
node bio-plane/scripts/deploy-fleet.mjs sheet-worker --instance biosmoke8
```

- agent-worker comes after step 3, because its `PLANE` target must exist, or Cloudflare refuses with 10143 (D-292; inventory §5 caveat).
- These workers are shared with bobux (inventory §1).

### 7. Live checks, unclaimed (S; GETs plus probe ops)

- `GET https://biosmoke8.believeinoakland.workers.dev/?op=bootstrap&members=1` should answer: `version` 0.85.0, `bootstrapConfigured: true`, `claimed: false`, `test_instance: true`, and parts signin, scanner and safe_view (`setup.mjs`:3800-3816).
- `op=selftest`, with `PROBE_TOKEN` in an `Authorization: Bearer` header, should answer `ok` with every binding `true` (`setup.mjs`:3822-3840).
- The account's settings should show that only `agent-worker` binds `biosmoke8`, besides `SELF`.

### 8. The `civicos` UI (S; code edit + DEPLOY), or delete it (Q2)

1. Edit `civicos-ui/deploy-ui.mjs`:17 to `service: "biosmoke8"`, and `worker.template.mjs`:15 to `https://biosmoke8.believeinoakland.workers.dev`. Record it as BOB's ruling. A better fix takes the instance as an argument.
2. Build the asset: embed `app.html` as base64 and `BUILD_ID` (`docs/development/CIVICOS_UI_STATE.md`:3671-3688).
3. Run `CF_TOKEN=… CF_ACCT=… node civicos-ui/deploy-ui.mjs $SCRATCH/civicos.worker.mjs`. Its read-back hash is verified.

### 9. Confirm nothing binds biosmoke7 (S, read-only)

Loop over `GET …/workers/scripts/<each>/settings` and grep for `biosmoke7`. Only biosmoke7 itself (`SELF`) may remain.

### 10. Remove biosmoke7 (S; DEPLOY, destructive, irreversible)

```bash
npx --prefix bio-plane wrangler delete --name biosmoke7     # or: DELETE /accounts/$CF_ACCT/workers/scripts/biosmoke7
```

- Its 5 secrets and the namespace `biosmoke7_Store` (2 objects) go with it. Bob has agreed that nothing in it needs saving (K3260).
- Re-list the namespaces. If `biosmoke7_Store` remains, delete it explicitly.
- Keep the R2 buckets and `bio/`, newgroup, the fleet and bobux (inventory §5-6; K3262).
- Shred `$F` once Bob has claimed (step 11).

### 11. Bob claims, signs in, invites, connects (Bob, in his browser; walked through in plain steps)

1. Open `https://biosmoke8.believeinoakland.workers.dev/app/setup#boot=<one-time password>`, or open `/app/setup` and paste it (Q1). Choose a handle, then a password typed twice (12 characters or more), then save the ten recovery codes (screens-entry R6, R17).
2. Sign in at `/` (`front`'s sign-in card, R1, R2) with that handle and password. He is the founder administrator.
3. Invite a member from the People or administration screen. Open the invitation link in a private window and join as the member (`/app/join`, screens-entry R7).
4. On the connect screen, choose "Sign in with Claude" (subscription, through agent-runner; K2147, DEC-156). This needs step 4's `ACCOUNT_SEAL_SECRET` and agent-runner's image (N780; draft-T49-final open point 14). M-Q2 is measured there (K2147).

### 12. BOB's checks and record (S)

- Journey-check R12 live, then BOB's walk as administrator and as member (K3422; draft-T49-final.md:276-283).
- Record one ruling: the cut, hashes, versions, rollback targets, the secrets set (names only), the removal, and what was deferred.
- Then tell Bob it is ready.

**The deploy-class acts needing Bob's approval in the session (K1715):** steps 3, 4, 5, 6, 8 and 10. A single approval line can name the sequence (K2110), for example: "deploy release 0.85.0 as the new test instance biosmoke8 (create, its secrets including CIVICSMITH_TEST_INSTANCE=biosmoke8, the signed plane), the fleet re-pointed to it, the civicos UI re-pointed, then delete biosmoke7".

## 3. The alternative: install through the installer (the product's own path)

`newgroup`, rebuilt with the signed 0.85.0 (`npm run build`, which embeds and verifies it; `newgroup/DEPLOY.md` "Rebuilding"), then deployed (DEPLOY; it was last deployed 2026-10-08). Bob then runs the wizard in his browser with the slug `biosmoke8`. The OAuth scopes are registered (K3159).

What this route does:
- It replaces steps 2-5. It generates all four secrets, including `ACCOUNT_SEAL_SECRET` (`newgroup/src/index.mjs`:1589). It creates `STORE` and its migration (:586-631) and enables the address (:1127-1149).
- It **shows Bob the one-time password on his own screen** and hands him over to `/app/setup#boot=` (installer R16; `newgroup/DEPLOY.md` §4), which solves Q1 without the session printing anything.
- Its fleet half fetches the members from `main/release`, which holds 0.84.0 (`newgroup/src/index.mjs`:64; main's `RELEASE.json`). It will therefore skip the members, because they are signed against another plane (:962-969). So step 6 (deploy-fleet `--instance biosmoke8`) is still the session's.
- BOB still sets `CIVICSMITH_TEST_INSTANCE` afterwards (installer R49), and steps 6-10 are unchanged.

This route is also the "install" leg of Bob's journey (K3320) and the installer's first real run (K3159; `newgroup/DEPLOY.md` §4).

## 4. Open questions and blockers

- **Q1 (a blocker for the session route): how the one-time password reaches Bob without a secret being printed.** Options:
  - (a) the installer route (§3), where Bob sees it on his own screen;
  - (b) set biosmoke8's `ADMIN_TOKEN` to the value of the session environment's existing `BIO_ADMIN_TOKEN`, so that Bob copies it from the cloud environment's settings (K2910's pattern for `BIO_RELEASE_SEED`), and the session can use it for live checks with his approval (K2131's form);
  - (c) Bob sets `ADMIN_TOKEN` himself in the Cloudflare dashboard (the claim's own refusal text names this, `control-plane/index.mjs`:762-763).
- **Q2 (BOB's, P17): re-point `civicos` or delete it.** It is legacy-ui, retired as a users' interface (K3052; draft-T50-plan doubt 2). The plane serves `/app` itself. Re-pointing needs the code edit in F3.
- **Q3:** whether Cloudflare accepts `SELF` on the create PUT. It is unproven for a create: the installer guards it with a retry (step 3 handles either answer).
- **Q4:** bobux shares agent-worker, whose `PLANE` will point at biosmoke8. Its owner is still open with Bob (K3262).
- **Q5:** D1 and KV were not inventoried (the token lacks the scope; inventory §3). Nothing in the plane's config uses them.
- No ruling records how biosmoke7 was first created or given its secrets. Its `MEMBER_TOKEN` (retired since T36) suggests an early `newgroup` install, from before rulings were kept in this file.

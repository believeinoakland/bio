# biosmoke7 inventory — Cloudflare account 20b533579290b9b93168345edd3b7f72

Taken 2026-10-14, read-only (GET only, Cloudflare API v4 via the session proxy). Every call answered for account `20b5…7f72`; no other account appeared.

## Key finding first

The account has exactly ONE instance-named resource set for biosmoke7: the `biosmoke7` worker and its Durable Object namespace `biosmoke7_Store`. Everything else biosmoke7 uses is **account-wide and shared by name**: the fleet workers (`agent-worker`, `agent-runner`, `pdf-worker`, `ocr-worker`, `sheet-worker`, `file-scanner`), the two R2 buckets, and the three container applications. Those fleet workers are not named per instance; `deploy-fleet.mjs` only templates their `PLANE` binding to the instance slug (D-102/D-292). So biosmoke8 will reuse the same fleet names, and removing the fleet would also break `bobux`.

Two workers point AT biosmoke7 and break the moment it is deleted: `agent-worker` (service `PLANE` -> biosmoke7) and `civicos` (service `PLANE` -> biosmoke7). Cloudflare normally refuses to delete a worker that other workers bind to, so these must be re-pointed (redeploy with `--instance biosmoke8`) or removed first.

## 1. Workers scripts (10)

| Name | Created | Last modified | Belongs to | Reason |
|---|---|---|---|---|
| `biosmoke7` | 2026-07-25 | 2026-10-14 12:02Z | **biosmoke7** | The plane; named by the instance (D-102). Bindings: DO `STORE` (Store), R2 `CAPTURES`/`PUBLISHED`, Browser, services AGENT_WORKER, FILE_SCANNER, OCR_WORKER, PDF_WORKER, SHEET_WORKER, SELF; 5 secrets; workers.dev on. 99 deployments recorded. |
| `civicos` | 2026-07-28 | 2026-10-12 | **unclear, leans biosmoke7** | The civicos UI; its only binding is service `PLANE` -> `biosmoke7`. Not instance-named, so biosmoke8's UI would presumably reuse the name; it must be redeployed against biosmoke8 or removed before biosmoke7 can go. |
| `agent-worker` | 2026-09-10 | 2026-10-14 | other (shared fleet), bound to biosmoke7 | Service `PLANE` -> `biosmoke7`, DO `RUNNER` (AgentRunner on agent-runner). Also bound by `bobux`. Redeploy for biosmoke8; do not delete. |
| `agent-runner` | 2026-10-08 | 2026-10-14 | other (shared fleet) | Owns DO `AgentRunner` + container app `agent-runner-agentrunner`. No instance binding. |
| `pdf-worker` | 2026-08-11 | 2026-10-14 | other (shared fleet) | R2 `CAPTURES` only. Bound by biosmoke7 and bobux. |
| `ocr-worker` | 2026-09-14 | 2026-10-14 | other (shared fleet) | R2 `CAPTURES` only. Bound by biosmoke7 and bobux. |
| `sheet-worker` | 2026-10-06 | 2026-10-14 | other (shared fleet) | R2 `CAPTURES` only. Bound by biosmoke7. |
| `file-scanner` | 2026-10-12 | 2026-10-12 | other (shared fleet) | DOs FileScanner, SafeViewRenderer (containers); R2 `CAPTURES`; cron `17 4 * * *`. |
| `newgroup` | 2026-07-24 | 2026-10-08 | **other — installer, KEEP** | The installer wizard (`newgroup/DEPLOY.md`: no bindings; its name is part of the registered OAuth redirect URL). |
| `bobux` | 2026-09-25 | 2026-09-25 | **unclear (another plane instance)** | A second plane (DO `bobux_Store`, same buckets, binds agent/ocr/pdf workers). Not mentioned anywhere in the repo or rulings. Not biosmoke7's; leave it unless Bob says otherwise. |

No `biosmoke*` other than biosmoke7 exists. No release-hosting worker exists in this account. Workers custom domains: none. Account workers.dev subdomain: `believeinoakland`.

## 2. Durable Object namespaces (5)

| Namespace | Id | Script / class | Belongs to | Notes |
|---|---|---|---|---|
| `biosmoke7_Store` | 6d501bfb049e4132a6fcdccbea8b518a | biosmoke7 / Store (SQLite) | **biosmoke7** | 2 objects, both with stored data. Removed with the script (delete-class migration or script delete). |
| `bobux_Store` | bfd9ef8f31c9476b8bf0e4eca527091f | bobux / Store (SQLite) | unclear (bobux) | 1 object with data. |
| `agent-runner_AgentRunner` | 4fa29b39444245c8a3b2e4f472a23041 | agent-runner / AgentRunner (containers) | other (fleet) | |
| `file-scanner_FileScanner` | 7b91b22777354857ac54e79d65378595 | file-scanner / FileScanner (containers) | other (fleet) | |
| `file-scanner_SafeViewRenderer` | ad042eceeaf24219a258362bab4a3f2c | file-scanner / SafeViewRenderer (containers) | other (fleet) | |

## 3. Other resources

**Container applications (3)** — all fleet, none biosmoke7-specific:

| Name | Id | DO namespace | Instances / max | Belongs to |
|---|---|---|---|---|
| `agent-runner-agentrunner` | a035be36-bb46-4db0-aeb4-2c00994f7ca5 | agent-runner_AgentRunner | 7 / 10 (version 4) | other (fleet) |
| `file-scanner-filescanner` | a036a3e0-11fb-47f8-8552-3ccf5d3cca58 | file-scanner_FileScanner | 3 / 3 | other (fleet) |
| `file-scanner-safeviewrenderer` | a03bd4f9-46b5-41a8-96db-8bc67d850eb3 | file-scanner_SafeViewRenderer | 3 / 3 | other (fleet) |

Images live in `registry.cloudflare.com/20b5…7f72/…`; the image-list route (`/containers/images`) does not exist on the API, so registry contents were not listed.

**R2 buckets (2)** — shared, KEEP the buckets:

| Bucket | Created | Belongs to | Notes |
|---|---|---|---|
| `bio-captures` | 2026-07-24 | other (shared: biosmoke7, bobux, all fleet workers) | Top-level prefixes: `bio/` (only `bio/captures/`), `clamav/` (file-scanner), `scratch/` (many capture objects). |
| `bio-published` | 2026-07-24 | other (shared: biosmoke7, bobux) | Listing returned no objects. |

The plane keys R2 objects as `<storeName>/captures/<sha>` and `<storeName>/published/<sha>`, and `storeName` defaults to `"bio"` in the code — not the instance slug. So biosmoke7's objects cannot be told apart from bobux's (or a future biosmoke8's) by prefix. Do not bulk-delete `bio/`.

**Not readable / empty:**
- D1 databases, KV namespaces: `Authentication error` (code 10000) — the project token lacks D1/KV read scope. Nothing in `bio-plane/wrangler.jsonc` or the bindings above uses D1 or KV, so likely none belong to biosmoke7, but unverified.
- Queues: 0.
- Cron triggers: only `file-scanner` (`17 4 * * *`).
- Per-script workers.dev: enabled for biosmoke7, bobux, civicos, newgroup, pdf/ocr/sheet-worker; disabled for agent-runner, agent-worker, file-scanner. (Routes on zones not checked; no custom domains.)

## 4. Limits and counts

- Workers scripts: **10** in the account. Per Cloudflare's Workers limits docs, Workers Paid allows 500 scripts per account (Free: 100). The plan itself could not be confirmed: `/accounts/<id>/subscriptions` returned `Authentication error`, and `workers/account-settings` only shows `default_usage_model: standard`.
- DO namespaces: 5; Container apps: 3, with 13 of 16 max instances configured.
- The API exposed no account-level limit or quota endpoint to this token. On these counts the account is far from the script limit; the pressure Bob refers to is more likely container instances / DO storage, which the API here does not report as quotas.

## 5. Removal order (for biosmoke8 at the next release)

1. Install/deploy biosmoke8 first OR at least redeploy the dependants: `agent-worker` with `deploy-fleet.mjs agent-worker --instance biosmoke8` (re-points `PLANE`), and `civicos` against biosmoke8 (or delete `civicos` if the UI is redeployed fresh). Until both stop binding `biosmoke7`, its deletion is blocked or breaks them.
   - Caveat: if biosmoke7 is removed BEFORE biosmoke8 exists (as K3260 says), `agent-worker`'s `PLANE` has no target and that deploy will fail (D-292, code 10143). Practical sequence: deploy biosmoke8's plane, re-point agent-worker and civicos, then remove biosmoke7.
2. Delete worker `biosmoke7` (its 5 secrets go with it). This also removes, or leaves orphaned, DO namespace `biosmoke7_Store` and its 2 objects; confirm afterwards with the namespaces list, and if it remains, delete it explicitly.
3. Optionally, R2 objects that belong to biosmoke7 only — not separable (see above); recommend leaving the buckets and `bio/` alone, or clearing only after bobux is also retired.
4. Nothing else is biosmoke7's: no D1/KV/Queues seen, no container app is per-instance.

## 6. Must NOT be removed (shared)

- `newgroup` (installer; OAuth redirect depends on the name).
- `agent-worker`, `agent-runner`, `pdf-worker`, `ocr-worker`, `sheet-worker`, `file-scanner` and their DO namespaces and three container applications (the account fleet; biosmoke8 reuses them).
- R2 buckets `bio-captures`, `bio-published` (shared with bobux and the fleet).
- `bobux` and `bobux_Store` (unclear owner; not biosmoke7).

## 7. Risks

- Dependants: `agent-worker` and `civicos` bind to biosmoke7 by service binding; see order above.
- The plane's 5 secrets and `CIVICSMITH_TEST_INSTANCE` (K3236) are lost with the script; biosmoke8 needs its own.
- Shared R2 key prefix `bio/` means data from biosmoke7 persists after removal and a new instance would see the same prefix — biosmoke8 may start with biosmoke7's captures visible in storage, unless storeName differs.
- D1 and KV could not be inventoried (token scope).
- `bobux` is undocumented in the repo; Bob should be asked whether it can also go, since it also holds a DO store and bindings to the fleet.
- Deletion of a worker with a DO namespace deletes that namespace's data irreversibly (acceptable per Bob: "nothing in biosmoke7 needs to be saved", K3260).

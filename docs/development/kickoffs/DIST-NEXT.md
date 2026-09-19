# DIST — resume here. Rewritten 2026-09-19 by the DIST standing lane at Bob's STAND-DOWN (91% of weekly usage); for the next DIST, in the OTHER Claude Code account.

Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL. Its **WHEN DIST CUTS**, **the `latest` pointer mechanism** and the
**17 LESSONS** at its end are the process; this file is only the state. Everything below was MEASURED 2026-09-19 at the
stand-down. Re-measure before acting on any of it.

## Before anything: the new account

- **Carry `.env` over** (it is gitignored; `.worktreeinclude` copies it into worktrees). DIST needs `CF_TOKEN`, `CF_ACCT`,
  `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `BIO_ADMIN_TOKEN`, `BIO_MEMBER_TOKEN`, `BIO_INSTANCE` (= `biosmoke7`)
  and **`BIO_RELEASE_SEED`** (the signing seed: without it, nothing can be signed). Never print a value; confirm each by
  using it.
- **The Cloudflare `account_id` is UNCHANGED:** `20b533579290b9b93168345edd3b7f72` (`CLAUDE.md` §8). Only the Claude
  Code account changes. If wrangler reports any other account, stop.
- **Arm the self-wake** (`CronCreate`, every 6 h, prompt *"DIST: apply WHEN DIST CUTS in kickoffs/DIST.md"*) and write
  the arm date here. Re-arm after 5 days (lesson 17).
- In a fresh worktree: `npm ci` in `bio-plane/`, `pdf-worker/`, `ocr-worker/`, `newgroup/`; check `df -h`. **The old
  machine had only 4.8 GiB free (98%)**, and each gate needed about 1 GiB of temporary space.

## What is LIVE (measured 2026-09-19, just before the stand-down)

| worker | serves | active version id = ROLLBACK TARGET |
| --- | --- | --- |
| `biosmoke7` (the plane) | 0.65.0, bytes = signed `5b4b3f52…` | `679536f9-ca21-4d2a-bad5-fb55bffdd602` |
| `agent-worker` | 0.65.0 | `9caede83-7887-4e6d-8e43-4724434965a1` |
| `pdf-worker` | 0.65.0 | `9f32674d-85dc-4548-a749-c494d6753845` |
| `ocr-worker` | 0.65.0 (engine_loaded) | `d6199d44-9a15-4562-a87b-7c67dec97363` |
| `civicos` (UI) | build `21bcfa6383eb` (UI-66) | `405365a3-7874-4ac2-99d8-a48a970b98d1` |
| `newgroup` (installer) | embeds signed 0.65.0, bindings `[]` | `df8995ba-2ae2-4813-ae36-6c9a9bf3353a` |

- **The `latest` pointer** (`main`'s `release/`, which every installer's `/update` reads) = **0.65.0**. Tag `v0.65.0` is
  on the mainline; the cut commit is `22a72fa1454e4f801fd78d486c111a86f69452a9`.
- The fleet member bytes are unchanged since 0.59.0 (`a7e5f590` / `0d99f5d0` +2 parts / `b26dee19`). FLEET verified all
  four answer 0.65.0.
- `op=audit`: 31 checked, 10 C-18.9 = D-200 (record state since 2026-08-04). Not this release's.
- The release baton (`kickoffs/BATON.md` on the remote, read by `deploy.mjs`) names DIST. Whether a session in the new
  account counts as DIST: the check compares the `--thread` name, so `--thread DIST` passes.

## What is OWED, in order

1. **CUT 0.66.0: REC-153** (landed `2b014a84`, IC-163, I3 42.0.0; an AUTHORITY closing: `aiRunOpen` refuses a context
   kind outside {inquiry, project}, a mismatched kind, and any id the caller cannot see) **and REC-152** if it has landed
   (tick/close by the run's principal only, IC-165, authority + §7.9; it was in its gate at the stand-down). Neither is
   deployed. **Bob ruled: cut and deploy nothing new before the account moves**, so this is the new account's first act.
   - First add `["0.65.0", "22a72fa1454e4f801fd78d486c111a86f69452a9"]` to `migrate-released.test.mjs`'s `RELEASES`
     (NOT to `WITHDRAWN`).
   - Rebuild the closings list from `git log v0.65.0..origin/main` and confirm each in 0.65.0's BYTES.
   - Check each IC since 0.65.0 for fleet members and for `civicos-ui/app.html` changes (lesson 6).
2. **DIST-5** (SCHEDULER, build order position 17): BIO_Distribution_v0_1.md §8 finds DS-1/DS-2 satisfied by D-297's
   closing; the build-plan table does not. Find from D-297 itself which record is wrong. Report the id and sha to
   SCHEDULER.
3. **Carried, NOT re-verified:** D-297 (the installer does not install fleet member bundles, so a group gets the plane,
   not the fleet); tags v0.56.0/v0.57.0 never pushed; `v0.58.0` points off the mainline (`9ed18019`; its manifest commit
   `db7589b8` is on it). `v0.59.0`–`v0.63.0` are signed and WITHDRAWN (they brick existing stores): history only.

## What happened, briefly (the reasoning is in the commits and in M-59)

2026-09-18: DIST found and fixed the embed hazard (M-59: `npm run embed` put an unsigned plane under a signed name), then
cut 0.59.0–0.63.0 for a run of security closings. Deploying 0.62.0 bricked biosmoke7's store (a schema index before
its column; REC-90). DIST rolled everything back, withdrew `release/` to 0.58.0, and asked Bob, which produced the
standing deploy permission, the `latest` pointer ruling and the upgrade arm. CONDUCT fixed it as REC-143. 0.64.0
(2026-09-19) was the first release that boots an old store, deployed and live-verified. 0.65.0 followed. Every cut is
in `git log --grep "^dist: release"`.

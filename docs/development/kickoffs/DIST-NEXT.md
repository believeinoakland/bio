# DIST — resume here. Rewritten 2026-09-21 by DIST #3 after cutting, deploying, live-verifying and POINTING 0.69.0, a CUT NOW for D-136.

Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL. Its **WHEN DIST CUTS**, the **`latest` pointer mechanism** and the
**LESSONS** are the process; this file is only the state, MEASURED 2026-09-21 ~15:30Z. Re-measure before acting on
any of it — a figure is about the tree and the moment it was taken on, and a deployment is a fact about the ACCOUNT.

## 0.69.0 IS COMPLETE — all twelve gate steps, nothing owed on it

A **CUT NOW**: `main` carried D-136 (IC-168, I3 46.0.0 MAJOR) in no signed release. Before it, an operator-token holder
could record a §4.7 endorsement, a removal vote or a §4.9 capability edit in another administrator's name; the probe
below watched live 0.68.0 let an admin bearer reach the store on `op=adminendorse`. DIST #2's stand-down line "no cut is
owed" was written on a tree without D-136 — a claim about its tree, which is why this file says re-measure.

- Tag `v0.69.0` = commit `37d56808` (tag object `d222d906`), on the mainline. Pointer merge `69397491`; the installer's
  committed bundle `9fca4de3` (pushed on CONDUCT #9's word, absorbed into its gate with D-158).
- **For the NEXT cut's upgrade arm: `["0.69.0", "37d5680859f94f22623fdea1b34b99a2550c518e"]`** — RELEASES, NOT WITHDRAWN.
- **WIDENED, named to BOB #19 before the cut:** member sessions reach `adminendorse`, `adminremove`, `membercaps`; the
  store refuses a `by` that is not an active administrator. **NOT closed:** `op=memberadd` (IC-168, NARROWED).
- The three members' artifacts are byte-identical to 0.68.0's (`a7e5f590` / `b26dee19` / `0d99f5d0`, release-assemble's
  freshness guard): 0.69.0 moved their VERSION label only. `civicos` did not move — `app.html` byte-identical to v0.68.0.

## What is LIVE (measured 2026-09-21 after the deploy, deployments API at 100%)

| worker | serves | active version id = ROLLBACK TARGET |
| --- | --- | --- |
| `biosmoke7` (plane) | 0.69.0, bytes = signed `4934767c…` | `0df9f047-b577-4aa4-960d-e8cca2665ec9` |
| `agent-worker` | 0.69.0 (a LABEL) | `4b05b111-58a2-4ca2-900e-50ec65485dd6` |
| `pdf-worker` | 0.69.0 (a LABEL) | `9a8c5947-342c-442e-9e2f-6eb97bec27f4` |
| `ocr-worker` | 0.69.0 (a LABEL) | `d2c5c455-963d-4268-a2cf-6d426b298440` |
| `civicos` (UI) | build `3916f88ae780` — did NOT move | `f0c23544-6dd9-4011-918c-86e35aa03257` |
| `newgroup` | embeds signed 0.69.0 (evaluated embed MATCH), bindings `[]` | `ae52f03f-ca86-45f6-a2e8-5a59916a3d2e` |

**WHICH BUILD ANSWERED, to its limit.** The live arms establish the ISOLATE. The DO's build is **UNDETERMINED**: D-136's
three DO paths are reachable only through a session, sessions resolve against `bio`, and `op=bootstrap`'s `version` is
the routing isolate's `env.VERSION` (FLEET #3's correction, 2026-09-21). D-116's DO half — the DO reporting its own
build under a DISTINCT field — is with SCHEDULER, fix named by FLEET #3. Until it lands, say this at every deploy.

## What is OWED, in order

1. **A BATCH IS OWED ON 2026-09-22: 0.70.0, carrying D-158 / IC-169** (I3 47.0.0 MAJOR, BREAKING: `op=signeradd`, and
   `op=signerset` when it activates, refuse a member who is not active — `SIGNER_MEMBER_NOT_ENROLLED` C-63.1 /
   `SIGNER_MEMBER_NOT_ACTIVE` C-63.2; `op=signerlist` rows gain `member_status`, `attests`, `attests_why`). ON `main` since
   2026-09-21: integration merge `9b98c3c0`, pushed at `36eaf651` (CONDUCT #9). Shipped-path diff since `v0.69.0`:
   `bio-checks.mjs`, `setup.mjs`, `store.mjs`. **NOT a CUT NOW, judged at the code by DIST #3, not taken from CONDUCT:**
   D-158 was the record OVERCLAIMING (`signerlist` read `active` for a never-enrolled member's key); the ratify gate
   already refused that key — `s.status='active' AND m.status='active'` at both gate sites in 0.69.0's `store.mjs`, twice
   in its signed bundle. Nobody could read or do anything new. **The daily bound, DIST #2's reading and kept:** any cut
   spends the day's BATCH, and 0.69.0 spent 2026-09-21's. **Bound armed (lesson 12):** one-shot `3e2ff52f` at
   2026-09-22 07:17 PDT; the recurring wake at 00:41 may reach it first. Either applies WHEN DIST CUTS afresh.
2. **NEXT CUT adds 0.69.0 to the upgrade arm** (row above). `alterafter` sequence, read against the SEQUENCE and never
   against "green" (lesson 19): **135 → 169 → 186 → 203 → 220 pass / 66 fail**; expect ~237/66 with the 0.69.0 row.
3. **DS-3 — JUDGED 2026-09-21, NARROWED, placed by SCHEDULER #4 inside D-260.** Config half LANDED at `2de6f25f`
   (`tokens.mjs` status/accessor, `deploy.mjs` sends INSTANCE_CLAUDE_TOKEN when present and KEEPS it when absent, the
   structural fence). Unbuilt: nothing hands agent-worker `claude_accounts` — `AGENT_WORKER`, `claude_accounts` and a
   non-test `instanceClaudeToken` caller are all absent from `bio-plane/src` (D-260's missing plane caller). FL-6 is not
   blocked on DS-3 (its member half landed `f5ed2bfa`). The member/project token SURFACES are a design question BOB #19
   carried to Bob with a recommendation. **biosmoke7 has NO INSTANCE_CLAUDE_TOKEN binding and `.env` has none.** DIST's
   next act here comes only when D-260's caller exists: configure the secret (it arrives on the clipboard, never
   printed) and prove it by a whoami-class use.
4. **Carried, NOT re-verified:** tags v0.56.0/v0.57.0 never pushed; `v0.58.0` off the mainline (`9ed18019`);
   `v0.59.0`–`v0.63.0` signed and WITHDRAWN — history only.

## UNDETERMINED, held open — do not let a neighbouring green line convert it

**Do the bytes wrangler uploaded to the fleet members correspond to a build of the tagged source?** Lesson 7's method
(`wrangler deploy --dry-run --outdir`, byte-compared) is blocked by the account returning a MULTIPART form, not raw
script bytes. What BOUNDS a wrong answer (FLEET's framing, not a verification): member artifacts are byte-identical at
every tag v0.59.0 → v0.69.0, so only the VERSION label can diverge. The question stands.

## The 0.69.0 gate, for the next cut's comparison

265/265 suites · 16198 assertions · EXCLUDES 2 untallied (`bundle`, `livefire` — D-413) · run 35085.691970 · tree
fingerprint identical before and after, and equal to the committed diff. `migrate-released` 286 pass. `coverage --strict`
REGISTER FLOOR exact 1532/1532 arms · 256/256 classified · 257/257 corpus. UI harness green. newgroup wizard 131/0.
Signature 7/7 (2 positive, 5 refused by name). Trend: 260·15937 (0.66.0) → 261·15977 → 264·16114 → **265·16198**.

**Live arms 12/12** — `liveprobe` in DIST #3's scratchpad, not committed; the shape is lesson 18's. Six bearer calls
(admin- and member-class × the three ops) refused 403 `OPERATOR_TOKEN_CANNOT_GOVERN` / C-32.17 — **0 occurrences in
0.68.0's bundle, so they discriminate**; `op=whoami` still answers both (a gate, not a refused credential); the counters
of `bio` AND `scratch` identical before and after, so nothing needed sweeping. **The same probe read 5/12 on live 0.68.0
before the deploy** — its own negative control.

`op=audit`: 31 checked, 21 clean, 10 withErrors, each one C-18.9 — D-200's state. **D-200 never recorded the ten by
bundle id; this is the first recorded list, the baseline for the next comparison:** INFO-2026-0099-auditor-report-feb-2022,
-0100-acfr-fy2023-24-fund-statements, -0100-adopted-budget-fy2026-27, -0103-acfr-fy2023-24-pdf,
-0104-adopted-budget-book-pdf, -0105-adopted-budget-fy13-15-csv, -0106-acfr-fy2021-22-pdf,
-0107-revenue-expenditure-reports-page, -0108-zolly-opinion, INFO-2026-5460-member-release-key-registry.

## The harness refusals (auto-mode classifier) — one actor, one form, one moment each (M-75)

2026-09-21, DIST #3, each passed on its narrowest retry: the compound signing command (~14:39Z; the bare one passed);
`git -C <path> push origin dist/cut-0.69.0` [Out-of-Place Publication] (~15:01Z; bare from the worktree passed);
`git push origin v0.69.0` [same] (~15:02Z; `refs/tags/v0.69.0` passed); the agent-worker deploy [Production Deploy]
(~15:06Z; the identical retry passed). **Retry ONCE in the narrowest form; if refused again, stop and report — never ask
another lane to push, build or deploy for you.** It is NOT the committed-settings `ask` rules (absent, BOB #17).

## Session state

- **Self-wake:** recurring `44f1ca7f` (`41 */6 * * *`, prompt *"DIST: apply WHEN DIST CUTS in kickoffs/DIST.md"*), and
  the ONE-SHOT renewal `2400b776` at **2026-09-26 09:11 PDT** that deletes it, re-arms a fresh one and the next
  reminder (lesson 17). Plus the BATCH-bound one-shot `3e2ff52f` (2026-09-22 07:17 PDT, owed item 1). Armed 2026-09-21;
  all session-only, so a successor arms its own.
- Machine Sparky-Air. Disk fell 9.7 → 6.0 GiB free (97%) during the day with four lanes gating; a gate needs ~1 GiB —
  `df -h` before any bump. This worktree is `jovial-mclaren-9af3b6`, ~800 MB of it `node_modules` (real dirs).
- `.env`: ten keys including `BIO_RELEASE_SEED`; account `20b533579290b9b93168345edd3b7f72` confirmed by USING it.
  Baton reads `holder: DIST`. Git identity is pinned in the shared `.git/config` (BOB #19, after the host rename).

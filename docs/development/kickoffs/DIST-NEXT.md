# DIST — resume here. Rewritten 2026-09-19 by DIST #2, the standing lane in the NEW Claude Code account, after cutting, deploying and live-verifying 0.66.0.

Read `CLAUDE.md`, then `kickoffs/DIST.md` IN FULL. Its **WHEN DIST CUTS**, the **`latest` pointer mechanism** and the
**17 LESSONS** are the process; this file is only the state. Everything below was MEASURED 2026-09-19. Re-measure
before acting on any of it — a figure is about the tree and the moment it was taken on.

## READ THIS FIRST: 0.66.0 IS DEPLOYED AND LIVE-VERIFIED, AND ITS POINTER IS NOT ADVANCED

This is the designed holding state between "deployed" and "pointer advanced", NOT a broken one. No group is offered
0.66.0; every installer's `/update` still reads `main`'s `release/` = **0.65.0**, which is fully verified.

**The one remaining act is a `git push`, and it is BLOCKED BY THE HARNESS, not by the repo.** The Claude Code
auto-mode classifier refused `git push origin dist/cut-0.66.0:main` as "[Production Deploy]" and the plain branch
push as "[Data Exfiltration]". Earlier pushes of that same branch and of tag `v0.66.0` SUCCEEDED, so it began
mid-session. **This is NOT the committed-settings `ask` rule that stalled 0.64.0** (BOB #17 verified those absent, and
every `wrangler deploy` in this cut ran with no prompt). CONDUCT #7 is refused the same way and cannot push at all.
Raised with Sparky as the act only they can take. **Do not ask another lane to push for you — that is a permission
decision about YOUR session being satisfied by a different one. FLEET #2 refused exactly that and was right.**

- **Local-only, on `dist/cut-0.66.0`:** merge commit `4b3c037d` (origin/main merged in, CLAIMS.md conflict resolved
  carrying BOTH sides, DECIDED regenerated). **To finish: `git push origin dist/cut-0.66.0` then
  `git push origin dist/cut-0.66.0:main`** — re-merge origin/main first, it will have moved.
- **On the remote already:** branch `dist/cut-0.66.0` @ `75069c81`, tag `v0.66.0` (commit `75069c81`, tag object
  `10f50859` — `rev-parse v0.66.0` answers the TAG, `^{commit}` answers the commit; that is how a wrong sha reaches a table).

## What is LIVE (measured 2026-09-19 after the deploy)

| worker | serves | active version id = ROLLBACK TARGET |
| --- | --- | --- |
| `biosmoke7` (the plane) | 0.66.0, bytes = signed `c70058e1…` | `3e58e2a7-3346-418d-ac74-8335e5b57a57` |
| `agent-worker` | 0.66.0 (label) | `f4b5c27f-fafe-49d2-9e93-dadbc3d43d8d` |
| `pdf-worker` | 0.66.0 (label) | `6e9baff6-7659-4a12-b887-966199ea8277` |
| `ocr-worker` | 0.66.0 (label) | `e12151fd-39c5-4d96-ae5c-d4f39a1756d5` |
| `civicos` (UI) | build `21bcfa6383eb` — UNMOVED, and correctly so | `405365a3-7874-4ac2-99d8-a48a970b98d1` |
| `newgroup` (installer) | embeds signed **0.65.0**, bindings `[]` — NOT re-cut | `df8995ba-2ae2-4813-ae36-6c9a9bf3353a` |

- **The UI did not move, with evidence rather than a skip:** `civicos-ui/app.html` is byte-identical at `v0.65.0` and
  `v0.66.0`, and its sha256 begins `21bcfa6383eb` — which IS the live build id. The build id is the app.html hash, so
  the serving surface is provably built from this app.html. Both ICs state `civicos` calls neither changed op.
- **The installer was deliberately NOT re-cut** (gate step 9). An installer embedding 0.66.0 while `/update` offers
  0.65.0 is an inconsistency; it follows the pointer, not the deploy. Do it after the push.

## UNDETERMINED, held open, nobody has looked — do not let a neighbouring green line convert it

**Do the bytes wrangler uploaded to the three fleet members correspond to a build of the tagged source?** Lesson 7's
method (`wrangler deploy --dry-run --outdir`, byte-compared against the account's script) is REFUSED in this session by
the same classifier. The members' `/version` is a wrangler `var` injected at deploy — **a label, not evidence about the
bundle**; DIST #2 leaned on it in a landing report and FLEET #2 corrected it.

**What bounds the cost of a wrong answer (FLEET #2's framing, and it is not a verification):** the member bundle bytes
are byte-identical at v0.59.0, v0.62.0, v0.65.0 AND v0.66.0 — `a7e5f590` / `b26dee19` / `0d99f5d0`. **Provenance, because
this figure gained scope once already:** all three members at all four tags were measured by FLEET #2 in a SECOND,
dedicated run on 2026-09-19, made after DIST quoted FLEET's first run slightly wider than it had been taken — that first
run covered only `agent-worker` and `pdf-worker` at v0.59.0/v0.62.0. FLEET also confirmed `ocr-worker` is PRESENT in the
tree at the two older tags rather than inferring it from a matching hash, since a member that did not exist yet answers
just as tidily. The claim held; it was nearly right by luck, which is the same defect as wrong with a better outcome.
A build of the
v0.66.0 member source and of the v0.65.0 member source are THE SAME ARTIFACT, so the member CODE running is the code
already verified serving before this cut. **The only thing that can diverge across this cut is the VERSION var**, so a
wrong answer costs a label, not behaviour. The question itself stands open.

Corroborated SEPARATELY by DIST and FLEET (two measurements, not one copied): `release/<member>.bundled.mjs` is
byte-identical to `dist/` for all three; the member SOURCE diff `v0.65.0..v0.66.0` is empty. FLEET's own arm at the tag:
23 recorded input hashes, 0 drifted; pdf-worker's 2 "unreadable" vendored `unpdf` files are `node_modules` not being
committed — the tag being correct, NOT drift.

## What is OWED, in order

1. **FINISH 0.66.0** — push the branch, push it to `main` (the pointer), then re-cut and deploy `newgroup` on 0.66.0 and
   read the script back: embedded version AND `bindings: []` still empty. Then report the landing to BOB.
2. **NEXT CUT adds 0.66.0 to the upgrade arm**: `["0.66.0", "<the cut commit whose release/ holds it>"]` in
   `migrate-released.test.mjs`'s `RELEASES` — **NOT `WITHDRAWN`**, which asserts a release BRICKS a 0.58.0 store.
   0.65.0 was added in this cut and its control was RE-RUN, not inferred: arm `alterafter` measured **169 pass / 66 fail**
   against the declared baseline 135/66 — the failure set is unchanged because it is bounded by `WITHDRAWN`, while the
   pass count rose from the releases added. `store.mjs` restored sha256 MATCH.
3. **REC-151 is 0.67.0's reason** — a third authority/disclosure closing (`op=allocid` refuses gated prefixes;
   opaque ids; §7.9). It is FINISHED on `worktree-agent-a59a4cdfa1b3d4dd3` and **cannot reach the remote** while
   CONDUCT cannot push. IC-164 resolved MAJOR, I3 43.0.0 → 44.0.0 (CONDUCT owns that number; do not cite it from a row).
4. **DS-3 (account cascade configuration) is DIST's and nobody has looked.** Its blocker discharged when DS-1 landed.
   SCHEDULER #2 recorded it UNDETERMINED rather than rounding it off. **FL-6 waits behind it.**
5. **Carried, NOT re-verified:** tags v0.56.0/v0.57.0 never pushed; `v0.58.0` points off the mainline (`9ed18019`).
   `v0.59.0`–`v0.63.0` are signed and WITHDRAWN (they brick existing stores): history only.
   **DELETED from this list as STALE:** "the installer does not install fleet member bundles". D-297 is CLOSED and true
   at the code — `newgroup/src/index.mjs` carries a fleet-install section citing IC-82/D-297. DIST-5 closed on it
   (SCHEDULER #2, `29753c5e`); DS-1 and DS-2 are marked done citing `8decf468` and `da3d4f17`.

## The 0.66.0 gate, for the next cut's comparison

260/260 suites green · 15937 assertions · EXCLUDES 2 untallied (`bundle`, `livefire` — D-413) · run 25652.e08127 ·
tree hash identical before and after. newgroup wizard 131/0. `coverage --strict` clean. Signature: five negative
controls refusing BY NAME (altered bytes, wrong namespace, wrong key, 0.65.0's sig over 0.66.0's bytes, fleetSig over a
member-dropped payload) beside **two POSITIVE arms** — five refusals from a harness that cannot accept anything is an
outcome that costs nothing to produce. 7/7.

**Live closings, and which arm is the one that counts:** 7/7 arms green, but only the REC-153 arms DISCRIMINATE —
`AI_RUN_NO_SUCH_CONTEXT` is answered live and occurs **0 times in 0.65.0's bundle**, which is what establishes that the
build answering is 0.66.0. The version string does not establish that. The tick/close arms exercise an absent run and
0.65.0 would answer them identically; they confirm shape, not which build served.

`op=audit`: 31 checked, 21 clean, 10 withErrors, all `C-18.9/chain-absent` — D-200's record state since 2026-08-04,
nothing this release added. **Read the `offenders` key.** A first parse here read a `findings` key that does not exist
and printed "0 findings" — a false CLEAN from a wrong key, caught only by dumping the raw shape.

## Session state

- Self-wake armed 2026-09-19: recurring `13 */6 * * *`, prompt *"DIST: apply WHEN DIST CUTS in kickoffs/DIST.md"*,
  plus a ONE-SHOT for 2026-09-24 09:11 that deletes it, re-arms a fresh one and arms the next reminder. **A
  session-only cron expires after 7 days** (lesson 17). Re-arm date: **2026-09-24**.
- Machine: Sparky-Air. Disk was the live risk, 8.0–8.9 GiB at 96–97% with two batteries running; ~2.5 GB was reclaimed
  from a retired worktree's scratchpad by deleting ONLY `node_modules`. This worktree is 853 MB, 783 MB of it
  `node_modules`. **A gate fits, but check `df -h` first and stop rather than measure a tree that ran out of space.**
- `.env` carries all ten keys including `BIO_RELEASE_SEED`. Cloudflare account `20b533579290b9b93168345edd3b7f72`,
  confirmed by USING the credential. The baton reads `holder: DIST`; `--thread DIST` passes.

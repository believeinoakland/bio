# The seed merge waits for T53's close

**Recorded** · the onboarding session (`session_01RAN5enDmeZrZ7DWruQ5vgK`), 29 Oct 2026, before opening the seed pull request (ONBOARDING §2, step 8).

**What is running.** Tranche T53 of the product is open: `tranche/T53` @ `122605e5` holds 2,030 commits not on `main`; its plan (`build/plan/current.md` there) reads **Status · OPEN**, round R1, layers 1-4 closed, layers 5-11 open, twenty jobs named. Its handoff (BOB #334 to BOB #335, `db686dc2`) says product work is stopped by Bob (K5791: "Don't start the next layer. The development process needs to be fixed first."), so the tranche is paused, not closed.

**So.** The seed pull request (`onboard` to `main`) is opened now and merged only at T53's close: once T53's close has merged it into `main`. The tranche's close changes `main`; a seed merged first would change the process under a running tranche (P12).

**At T53's close, the merge.** On `onboard`: merge `main` (never a rebase); in a conflict keep `main`'s text everywhere except the files `proc shims` writes, `build/GRANTS.md`, `build/grants.json`, `build/onboarding/` and `.claude/rules/standing-safety.md`; if `main` changed its `CLAUDE.md`, keep that text in `build/onboarding/CLAUDE-before.md` and any new safety rule in `.claude/rules/standing-safety.md`; carry the "Owed by onboarding" entries (ONB-1 to ONB-6) into whatever `build/plan/next.md` then holds; re-run `proc init --mode convert --ref main` (it keeps every product file and rewrites the shims), `proc shims --check`, `proc grants check`; push; merge the pull request; then `proc init --check` reads step 8 waiting only on the owner's ROOT.

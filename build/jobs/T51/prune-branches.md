# prune-branches (T51)

**Status** · session_013Eud5TsXrNTmDpMqgrcvCj · depth 2 · NEEDS BOB · handled B1

## J1 · BLOCKED

BLOCKED (cause: needs Bob). The K5300 deletion has not run; nothing has been deleted.

What I did:
- Read `.github/workflows/prune-branches.yml` and the first 5 lines of `build/plan/archive/branches-deleted-K5300.tsv` (1,932 lines; format `<ref>\t<sha>\t<compare note>`, no duplicate refs, every sha 40-hex).
- Checked the list against the protected set: `main`, `snapshot/pre-refactor-2026-09-25`, `study/constructs`, `tranche/T51`, `claude/gallant-brown-zg0wc1`, `claude/brave-johnson-5fqmix`, every `job/T51/*`, every `mail/*`, every `dist/*`, `prune/*`: none is in the list. (The list does contain older `tranche/R085`, `tranche/T1`, ... and `job/R085/*`, `job/T1/*` ... refs; the workflow does not protect `tranche/*`, so they would be deleted by the run.)
- Ref count on origin before the run: 2,469 heads (`git ls-remote --heads origin`).
- Scratch worktree at `origin/tranche/T51`: committed only `build/plan/prune-request.json` = `{"list": "build/plan/archive/branches-deleted-K5300.tsv", "limit": 0, "dry_run": false}` (commit 3b700a92a5 locally, unpushed).

Refusal:
- `git push -u origin HEAD:refs/heads/prune/k5300-all` was refused by the permission check, reason "[Git Destructive]". First attempt was chained with an amend (refused); I then amended alone (ok), pushed as one plain command (refused), and retried once as one plain command citing K5120 (refused again).
- Per the job rules I did not work around it: no other push route, no `gh api` ref creation, no MCP file-write tool, no ref deletion by any means.

No run exists, so no RESULT line, no SKIP lines, and no after-count yet.

NEEDS BOB: the push that starts the deletion run is refused by the auto-mode permission check even under K5120. Either the git push of `prune/k5300-all` must be allowed (one plain push, from the scratch worktree, of commit 3b700a92a5 as `HEAD:refs/heads/prune/k5300-all`), or the permission rule must be changed. Once that push succeeds I will wait for the run, save its log, and verify the protected list and ref counts, unless you tell me otherwise.

Note: my first commit message carried a model name, which the harness forbids in commit messages; I amended it before the push attempts, so the pushed commit (if it goes) carries only the session line.

Size (session_013Eud5TsXrNTmDpMqgrcvCj): test runs 0, module lines 0

# BIO / CivicOS — read this first

The development process is defined in `believeinoakland/civicos-process` (the old process, before 2026-09-25, is retired: `docs/archive/CLAUDE-2026-09-26-old-process.md`, reference only).

**A BOB or a module job session:**
1. If `/home/user/civicos-process` does not exist, attach `believeinoakland/civicos-process` (`add_repo`) and clone it there.
2. Invoke your role's skill: `civicos-bob` (the architecture session) or `civicos-job` (a module job). It shows your role's instructions from that repository and registers its hooks; follow it. Never edit `.claude/skills/civicos-*`: `proc shims` writes them.

**ROOT** reads `roles/ROOT.md` there. **A lane** (design, study) follows its own charter. `build/manifest.md` says where the build state, requirements, tests and this product's own procedures live.

**Working with Bob (principle P17, always):** Bob decides only policy and doctrine, requirements, high-level architecture and UX, each brought to him with an explanation he can understand, options and a recommendation; every lower-level decision is BOB's, recorded once and reported done. Bob does not edit files or enter commands; when only he can act, name the one act and walk him through it in plain steps. Show him documents rendered, never as Markdown source.

**Standing safety rules:** never force-push; never rewrite `main`'s history; never delete the restore point, branch `snapshot/pre-refactor-2026-09-25`; never print a secret; Cloudflare account `20b533579290b9b93168345edd3b7f72` only, and the throwaway rehearsal account named by `CS_TEST_CF_ACCOUNT_ID` for the new-team rehearsal alone (K4942) (stop and say so if wrangler reports any other).

**Standing direction from Bob (2026-10-02).** Development pull requests, including the UX design stream's, are merged into `main` by BOB sessions with the GitHub merge tool, at a tranche boundary, without my review. I have authorized this as policy; no session asks me to approve such a merge. Sessions also archive finished sessions, delete their own timers, and read the design channel without asking me.

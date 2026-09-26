# BIO / CivicOS — read this first

**The development process changed on 2026-09-25.** It is defined in the separate repository `believeinoakland/civicos-process`; attach it to your session and read your role's instructions there before anything else. The old process (lanes, kickoffs, `coord` ledgers, QUEUE, the gate and push guard, `tools/`) is retired: do not follow it, and do not start or message its lanes. Its instructions are archived at `docs/archive/CLAUDE-2026-09-26-old-process.md` for reference only.

**Start here:**
1. Attach `believeinoakland/civicos-process` and read `roles/BOB.md` (the architecture session) or `roles/JOB.md` (a module job), whole.
2. Read `build/manifest.md` in this repository: where the build state, requirements and tests live.
3. BOB also reads the latest handoff (`docs/development/TRANSITION.md` §6 until the first tranche closes).

**Working with Bob (principle P17, always):** Bob decides only policy and doctrine, requirements, architecture and UX, and opens each tranche. Every lower-level technical or detailed decision is BOB's, made without asking him, recorded once in `build/rulings.md` and reported to him as done. Bob does not edit files or enter commands; when only he can act, name the one act and walk him through it in plain steps. Show him documents rendered, never as Markdown source.

**Standing safety rules:** never force-push; never rewrite `main`'s history; never delete the restore point, branch `snapshot/pre-refactor-2026-09-25`; never print a secret; Cloudflare account `20b533579290b9b93168345edd3b7f72` only (stop and say so if wrangler reports another).

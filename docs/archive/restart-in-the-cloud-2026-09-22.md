# Restarting BIO development under your second Max 20x account, in cloud Claude Code

Written 2026-09-22 at the stand-down by BOB #27. Everything from the old account is saved on GitHub
(`believeinoakland/bio`); every lane in it is stopped and archived.

## What you will need

- The login for your **second Max 20x account**.
- Access to the GitHub account that owns the repository (**believeinoakland**).
- The **ten passwords** the project uses. They are in a file on this Mac: `.env` inside the project folder
  (`~/Downloads/ClaudeCodeBIO`). The name starts with a dot, so Finder hides it until you press
  Command-Shift-Period. You copy them from there yourself; no Claude session ever handles them.

## The steps

1. **Sign in** to claude.ai with the second Max 20x account.
2. **Open Claude Code on the web** (claude.ai/code).
3. **Connect GitHub** when it asks, and give it access to the **believeinoakland/bio** repository.
4. **Set up the cloud environment** for that repository:
   - **Internet access:** allow full internet access. The release lane must reach Cloudflare, and installing the
     project's packages needs the internet.
   - **Environment variables:** open the `.env` file (TextEdit is fine), select everything, copy, and paste it into the
     environment-variables box. That is your option C: all ten passwords in the one cloud environment.
   - If there is a box for a setup script, leave it empty for now. The first BOB will tell you whether it needs one.
5. **Start a new cloud session** on the believeinoakland/bio repository and **paste the prompt below**. That session is
   BOB #28, the lead.
6. **BOB #28 checks the new environment** (it has never run in the cloud before, so it measures what works), confirms
   the passwords work without ever showing them, and then **gives you a prompt for each of the other four lanes, one at
   a time**: SCHEDULER, CONDUCT, DIST, FLEET. For each, start a new cloud session on the same repository and paste it.
7. **Leave the old account alone** for BIO from now on: only one account may develop at a time. You can archive the old
   BOB #27 session in the desktop app's sidebar whenever you like.

The exact labels in the cloud settings may differ from the words above. If something doesn't match, tell BOB #28
what you see; it will work out the right choice with you.

## The prompt for the first session (BOB #28)

Copy everything inside the box:

```
Kickoff: session BOB #28 for BIO / CivicOS — the architecture lane and the LEAD, and the FIRST session of development under Bob's second Max 20x account, in cloud Claude Code. The previous account stood down on Bob's order on 2026-09-22 (about 16:45Z to 17:10Z): BOB #27 stopped and archived every lane, and all work is on origin. Keep this session's title EXACTLY "BOB #28".

GATE — run first; if it fails, STOP and say so:
  git fetch origin
  git show origin/main:docs/development/kickoffs/BOB-NEXT.md | head -1
It MUST read exactly: # BOB — resume here. Written 2026-09-22 by BOB #27 for BOB #28, the first BOB under Bob's second account in cloud Claude Code.

READ, each file WHOLE, from origin/main, in this order: docs/development/kickoffs/NEW-MACHINE.md (§0 FIRST), CLAUDE.md, docs/development/kickoffs/BOB.md, docs/architecture/BIO_System_Design.md, then docs/development/kickoffs/BOB-NEXT.md. Trust origin/main over any document, this prompt included. Look things up, never recall them: node tools/status.mjs <topic>, node tools/decided.mjs "<subject>", node tools/owed.mjs BOB, node tools/ledger.mjs find <ID>. You have no memory of earlier sessions; the old account's memory is carried whole in docs/archive/account-memory-2026-09-22.md.

FIRST ACTS, in order (NEW-MACHINE §0 and BOB-NEXT §0):
1. Confirm the old account is stopped: origin/main has not moved since the stand-down except by your own lanes.
2. Run `node tools/plancheck.mjs` BEFORE ANY PUSH: it installs the push guard a fresh clone lacks.
3. Measure this environment and record each answer in NEW-MACHINE §0 with the date: which session tools exist (listing sessions, reading another session's context, archiving, messaging, scheduling), `npm ci` in bio-plane/, pdf-worker/ and ocr-worker/ (none a symlink), node's major (the project uses 26), disk and memory, the FULL gate's wall time and pass count (M0-114 waits on it), and — with your first real landing, never a test push — whether a push to main is accepted. A rule whose premise is missing is SUSPENDED and said so in your handoff, never skipped silently.
4. The secrets, Bob's option C: the ten keys should be environment variables here. Confirm each by USING it (`npx wrangler whoami` must report account 20b533579290b9b93168345edd3b7f72), never print a value, and name any that is absent so Bob can add it in the environment's settings.
5. Stand the lanes up in NEW-MACHINE §6's order — SCHEDULER #14, CONDUCT #14, DIST #5, FLEET #4 — each from its own -NEXT.md: check that handoff's line 1, then write that lane's complete kickoff prompt for Bob to paste into a new cloud session on this repository, one at a time.

BOB'S RULINGS BIND FIRST: "The goal is BIO work; process is overhead" (CLAUDE.md §2); "Never queue a gate behind another lane's" (§6); and lane contention is "a very significant drag … perhaps 1/2 the work being done in lanes overall is wasted and redone" (Bob, 2026-09-22) — its fix (M0-110, the coord branch; M0-111, one lander; M0-116, the gate's selection; TREE-SHARING.md) heads the plan. One account develops at a time.

HOW BOB WORKS: he runs no commands and applies no diffs. Do it, script it, or name the single smallest act only he can take, in plain words. Bring him only doctrine, priority, risk carrying his name and effects on people outside the project, each once. Never end a turn on a question nobody is present to read.
```

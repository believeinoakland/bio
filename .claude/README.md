# Why the permissions are set the way they are

`settings.json` is committed on purpose. Every session and every worktree
inherits it, so nobody configures anything by hand and no two sessions drift
apart.

## The shape

`Bash` is allowed WHOLESALE rather than as a list of approved commands. The
first version of this file enumerated about forty commands and it did not work:
sessions run compound commands like `cd bio-plane && npm test`, every part of a
compound is checked, and any command nobody thought to list stops the session
dead waiting for a human. Enumerating commands is a losing game against a build
that legitimately runs dozens of different tools.

## What still stops

Evaluation order is **deny, then ask, then allow — first match wins**. So the
blanket allow does NOT weaken the lists below it:

- **deny**: force-push in every spelling, which makes the project's
  never-force-push rule structural instead of remembered; `git reset --hard`,
  `clean -fdx`, `rm -rf`, `sudo`, `chmod 777`; and any write to `.env`, so
  nothing can overwrite or corrupt the credentials.
- **ask**: writing `.env` ONLY. Pushing is not gated (Bob, 2026-09-16), and the
  plane and installer deploys are not either: DIST deploys under Bob's standing
  permission (2026-09-18), and three deploy `ask` rules held 0.64.0 for ~2 hours
  after he had ruled that (removed in `7e9ef2f9`; `NEW-MACHINE.md` §9.1).

`.env` was briefly on the DENY list, which was wrong: the operator does not edit
files by hand, so denying it blocked the one legitimate way credentials get onto
a machine. It asks instead, so the write still happens under a human's eye.

## The tradeoff, stated plainly

Allowing Bash wholesale weakens one specific defence: this project fetches and
parses UNTRUSTED documents from the public web, and adversarial text inside a
captured page could in principle reach the shell. The bash gate used to be what
stood in the way. It no longer is, and the deny list is what remains.

That was a deliberate trade. A permission gate that fires constantly gets
approved reflexively, which protects nothing while costing the operator their
attention. A narrow gate that fires rarely is worth reading. If the balance ever
needs to move back, the honest lever is `defaultMode: "auto"` (a background
classifier judges each call) rather than re-enumerating commands.

## The SessionStart hook — cloud Claude Code only

`hooks/session-start.sh` runs at every session start where `CLAUDE_CODE_REMOTE=true`
and does nothing on a Mac. A cloud session starts in a fresh container that
differs from the machine this project was built on in five measured ways
(BOB #28, 2026-09-22, `NEW-MACHINE.md` §0.1, `MEASUREMENTS.md` M-99), each of
which broke an instrument: node 22 instead of 26 (`owed.mjs`'s `(?i:…)`
regexes crash `plancheck`), a SHALLOW clone (git-dated checks misread 29
front-matter dates as FAILs), no `node_modules`, no stock `ssh-keygen` (the
signature suites SKIP), and no id-ledger directory (`mintid.test.mjs`'s O_EXCL
probe FAILS, so a fresh clone's first full gate is RED). The hook installs
node 26 under `/opt/node26`, unshallows, creates `<git-common-dir>/bio-idalloc`,
runs `npm ci` in the four packages with lockfiles, installs `openssh-client`,
and exports `NODE_USE_ENV_PROXY=1` so node's own fetch uses the egress proxy.
It is idempotent, touches no tracked file and no secret, and takes ~40 s from
cold. It does NOT run `plancheck` (~45 s): every lane runs it first, and that
run installs the push guard.

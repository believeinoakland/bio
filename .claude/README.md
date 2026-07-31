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
- **ask**: `git push`, the plane deploy, the installer deploy. Each is public or
  irreversible and worth one beat of a human's attention.

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

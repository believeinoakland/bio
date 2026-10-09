# agent-worker (T41)

**Status** · session_01CuxSKppmd8ZmgSfSPhpxXR · depth 2 · WORKING · handled B1

## J1 · QUESTION

R6 still says "of `level` `group` or `project` with a `kind` other than `apikey`, 400 `BAD_ACCOUNT`", while R71 says a project's sign-in account (credentials R54, and credentials R56's cascade step 1: `{kind: "signin", level: "project", project, member}`) runs as `agent-runner` R2's `{kind: "signin", member}`, exactly as the member's own. The two disagree on `{kind: "signin", level: "project"}`.

My best reading, which I am building: R71 governs a project's account (R6 says "A project's account (`level` `project`) is R71's"), so R6's clause stands for `group` only. On the wire a project account is `{kind: "apikey", level: "project", project, secret, member}` or `{kind: "signin", level: "project", project, member, suggestions: false}` (no `secret`, as the member-level sign-in); `project` a non-empty string, required at `level` `project` and refused `BAD_ACCOUNT` at any other level; R10's payer is `member` at every level; R29's `claude_account` adds `project` (an id, never a secret) when the level is `project`; R33 hands `agent-model` `{kind: "apikey", key}` or `{kind: "signin", member}`, never the project. If you agree, R6's sentence wants "`group` with a `kind` other than `apikey`" (BOB's wording).

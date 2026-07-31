# Area FRAMEWORK: content identification and the framework

Refreshed 2026-07-31 to the parallel-development model (`PARALLELISM.md`,
`CLAIMS.md`, `INTERFACES.md`). The old paste-ready kickoff block and its grant
slots are gone. This remains a THIN file: it was written by another area when
kickoffs were split, so it is not FRAMEWORK's own account of itself, and the
first FRAMEWORK session should replace it wholesale at its close. Nothing here
sets this area's plan — deciding that is the first thing a session does, with Bob.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## What this area owns

`docprofile/**`, `docs/architecture/BIO_Content_Framework_*`,
`docs/architecture/CONSTRUCTS.md`, and `docs/development/DOCUMENT-PROFILES.md`.
FRAMEWORK CONSUMES structure (I2, which it will own once registered) and PRODUCES
intent and bias. It does not own the plane's capture path; reading it is expected,
changing it is a DELEGATION to CAPTURE.

Its work to 2026-07-30, read from the commit log rather than from a handoff:
Content Framework v0.1 through v0.10, six diagrams validated against the Mermaid
parser, declared bias integrated with evidence accruing to bias statements,
contradiction treated as a discovery that leaves a record, and decay made loud
and never blocking.

## How a session starts now

1. **Read `CLAUDE.md`**, then this file.
2. **Claim FRAMEWORK in `docs/development/CLAIMS.md`** before editing, naming the
   paths. A claim keeps other sessions out of them. Work you need inside another
   area's claim is a DELEGATION entry, not a quiet edit.
3. **Work in a worktree**: `claude --worktree FRAMEWORK`. One session per
   worktree. `.env` is carried in by `.worktreeinclude`.
4. **Credentials come from `.env`**, never from a chat message and never
   committed. `tokens.mjs` denylists any token published in the repo and treats
   it as NOT SET, so committing one revokes it.

Then read: `docs/architecture/BIO_Content_Framework_v0_10.md`,
`docs/architecture/CONSTRUCTS.md`, `docs/development/DOCUMENT-PROFILES.md`, and
`docs/development/DEBT.md` (take the next free D-number at the moment you write).

## First: decide the next work, with Bob

This file is a reconstruction, not this area's own plan, because a previous
session's handoff was overwritten before it could be written. So **tell Bob what
this area's next work is before starting it**, rather than inheriting a plan from
a file another area wrote. Once decided, that plan lives here, and the first
FRAMEWORK session rewrites this file to hold it.

The most likely candidate, unstarted, is D-60: adopting docprofile's
`digests`/`compare` into the plane. Note it is CAPTURE that would import them
(monitoring, `op=audit`'s duplicate sweep, `resolveLinks`' bracket arm), so if the
work is there it is a DELEGATION with FRAMEWORK's guidance, and docprofile is read,
never grown into a second copy. Confirm with Bob before treating it as the plan.

## Deploy discipline, and releases

**Land tested code on `main`; do not cut plane releases.** Areas land tested code
continuously and **`DIST` batches plane releases** (`kickoffs/DIST.md`). If
FRAMEWORK's work needs a plane change shipped, land it green and hand it to DIST
as a DELEGATION — do not bump a version, sign, tag, or run `deploy.mjs`.

**Verify in this area's own scratch namespace**, never the real record, and sweep
after; sharing a scratch namespace with another live session means each purges the
other's probes. Provision a `biosmoke-framework` instance the day a FRAMEWORK
session first needs to live-verify — per-area instances are created only when a
second session actually starts, not before (`PARALLELISM.md`).

## What this area should know without being told

**Fetch and rebase before pushing; never force-push `main`.** A rejected push
means another area landed work: reset onto the remote, re-apply your additions,
and check the other area's work survived.

**Bob's standing rulings** are collected in `kickoffs/CAPTURE.md` under "Bob's
rulings, already made", and several bind this area: `undetermined` is first-class
and must be stated; third-party content is attributed to the third party; content
is identified in PDFs as in HTML, where CAPTURE extracts structure and FRAMEWORK
decides content. Do not re-ask what is already ruled.

**Numbers come from `MEASUREMENTS.md`**, and a Worker cannot time itself
(`bio-plane/src/cpu.mjs`).

**Close the turn with the decisions that are BOB'S, and nothing else**, in the
shape `kickoffs/README.md` defines; read its three tests first, and an empty list
is a real answer. At the close, rewrite ONLY this file — with FRAMEWORK's own
account of its work this time — append to `DEBT.md` and `MEASUREMENTS.md`, and
prepend a state-doc entry naming this area.

# Area FRAMEWORK: content identification and the framework

Refreshed 2026-07-31 to the parallel-development model (`PARALLELISM.md`,
`CLAIMS.md`, `INTERFACES.md`).

> **Head corrected 2026-08-03 by CONDUCT (the licensed supersession fix, rule 6):**
> the paragraph that followed — "the first FRAMEWORK session should replace it
> wholesale… deciding [the plan] is the first thing a session does, with Bob" and
> the D-60 framing below — predates the FW-1…FW-10 queue run and FW-15, all long
> landed. The area's plan comes from `QUEUE.md` (FW-13/FW-14 are queued behind
> REC-11/REC-19; D-167 is the parked stack-axis note), not from a fresh
> negotiation with Bob. A future FRAMEWORK session should still rewrite this file
> as its own account at close — that instruction stands; the plan-setting one
> does not.

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

**Land tested code on `main` through the train (push `land/framework/<topic>`, M0-111); do not cut plane
releases.** Areas land tested code
continuously and **`DIST` batches plane releases** (`kickoffs/DIST.md`). If
FRAMEWORK's work needs a plane change shipped, land it green and hand it to DIST
as a DELEGATION — do not bump a version, sign, tag, or run `deploy.mjs`.

**Verify in this area's own scratch namespace**, never the real record, and sweep
after; sharing a scratch namespace with another live session means each purges the
other's probes. Provision a `biosmoke-framework` instance the day a FRAMEWORK
session first needs to live-verify — per-area instances are created only when a
second session actually starts, not before (`PARALLELISM.md`).

## `docprofile/` IS AN INPUT TO THE PLANE'S COMMITTED BUNDLE. REBUILD IT IN THE SAME COMMIT.

**Added 2026-09-15 by CONDUCT #11 at FW-18's integration (D-377), because this rule was written
down for one consumer and nowhere for the other, and it has now been rediscovered twice.**

`civicos-ui/app.html` carries a FLATTENED copy of `docprofile/` produced by
`tools/bundle-docprofile.mjs`, and `check-semantics.mjs` fails on any drift between the two.
That rule is stated in `DOCUMENT-PROFILES.md`. **What was stated nowhere is that
`bio-plane/dist/bio-plane.bundled.mjs` is ALSO a generated artifact of this package** — several
of its first-party inputs live under `docprofile/` — so a change here that does not rebuild the
plane bundle makes FL-10's freshness guard fail the battery **on a suite the change never
touched**, which reads as damage the worker did somewhere else entirely.

**So a `docprofile/` change carries two regenerations, not one:** `node tools/bundle-docprofile.mjs`
for the UI embed, and `cd bio-plane && npm run build` for the plane bundle. Neither is a UI edit or
a deploy; both are generated artifacts catching up to their source.

**FW-17 hit this and did not record it. FW-18 hit it again and paid a green-to-red battery before
filing the row.** A rule that has to be rediscovered is a rule that was never written down, and the
half that WAS written down is what made the gap invisible — a reader who finds the embed rule
reasonably concludes they have found the rule.

## What this area should know without being told

**Push `land/<lane>/<topic>`, never `main` (CONDUCT's train lands it, M0-111); never
force-push.** A branch the train returns means another area landed work: rebase on
`origin/main`, re-apply your additions, and check the other area's work survived.

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

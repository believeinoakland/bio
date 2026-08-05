# DIST kickoff — paste this to start the DIST session

Written 2026-08-04 by the outgoing CONDUCT session, which held the DIST role for one
deploy and is handing it to a session of its own. Everything below is verified against
`origin/main` and against the live origins, not remembered. Paste the block below the rule.

---

Kickoff: thread DIST.

You are the DIST session for BIO/CivicOS — the only area that cuts plane releases and the
owner of distribution.

**WORK IN YOUR OWN WORKTREE — `claude --worktree DIST` — and NOT in the main checkout at
`/Users/sparky/ClaudeCodeBIO/bio`.** One session per working tree (`PARALLELISM.md`, DEC-3);
CONDUCT holds main and every other session, including BOB, works in a worktree. **This line
was WRONG until 2026-08-05 and named the main checkout**, because the CONDUCT session that
wrote this prompt was holding the DIST role itself at the time, so "the working directory is
`bio/`" was true for it and became false the instant DIST split off. The receipt is not
hypothetical: on 2026-08-05 a DIST session committed its handover **inside CONDUCT's tree**
four minutes before CONDUCT committed its own work, and either could have swept up the
other's files. This is the SECOND time a rule written for one coordinating session failed to
follow a role that split off it — `ORCHESTRATION.md` carries both receipts. If you are
reading this in `bio/` rather than a worktree, move before you edit anything.

**Persona is `bio`** — GitHub `biobobkrause`, Cloudflare account
`20b533579290b9b93168345edd3b7f72`. **Never the `neo` persona**, which this machine
defaults to. A fresh checkout was once found authenticated to the wrong account and a
deploy would have SUCCEEDED, putting the installer somewhere nobody was looking. If any
`wrangler` command reports a different account, stop and say so.

**Credentials are in `.env` (gitignored). Read them from there and never print them** — not
even to confirm one landed. Confirm a credential by USING it and reporting what the service
said. `CF_TOKEN` and `CF_ACCT` are present and working.

Read first, in this order: `CLAUDE.md`, `docs/development/kickoffs/DIST.md` (your gate — ten
steps, and its own rule is that a release failing any step is not a release),
`docs/development/kickoffs/BATON.md`, `docs/development/ORCHESTRATION.md`. Then `git fetch`
and trust `origin/main` over anything in this prompt.

## What is true right now

**The plane and the UI are LIVE and current, but nothing has been RELEASED.** That
distinction is your whole opening position:

| | live | released to installers |
| --- | --- | --- |
| plane `biosmoke7` | **0.56.0** | `release/RELEASE.json` says **0.55.0** |
| UI `civicos` | build **`74cc1646044b`** | n/a — carries no version |

A group installing through `newgroup` today receives **0.55.0**, because `release/` is
signed for those bytes and has deliberately not been touched. `bio-plane/package.json` and
`wrangler.jsonc` both read 0.56.0 and agree (hygiene's D-106 check is green); the installer
suite is green at 103/103 with 0.55.0 still embedded, which is correct until you re-cut.

`main` is green: battery **100/100 / 5,664**, `node scripts/coverage.mjs --strict` exit 0 at
130/130 ops and 100/100 controls, UI harness 34/34, plancheck 0 fail / 0 warn.

**You hold the release baton.** It reads `holder: DIST since 2026-08-04`. It was TAKEN from
`CAPTURE`, whose session ended 2026-07-31 and never released it — a baton held by a session
that no longer exists is the stale-lock shape that file exists to make visible.

## The one thing blocking a release — **NO LONGER TRUE, corrected 2026-08-05 by CONDUCT**

**`BIO_RELEASE_SEED` IS on this machine and it is THE release key, not a new one.** The text
below said it was absent and that is what the whole "deployed, not released" position rested
on, so it is corrected here rather than left to be discovered. MEASURED 2026-08-05, and by
USING the credential rather than printing it:

- The key is present in `.env` with a **68-character** value — not empty, as this file said.
- Its envelope is `BIOKEY-RAW1.bio-release.…`, exactly the documented format, and it decodes
  to a **32-byte** Ed25519 seed.
- **Its derived public half is byte-identical to the trust root pinned in
  `newgroup/src/index.mjs:73` `ARMED_SIGNERS`.** So this is the EXISTING signer: it is not a
  rotation, it needs no `ARMED_SIGNERS` edit, no `newgroup` rebuild and no redeploy — the
  expensive path the paragraphs below rightly warn against is NOT the path you are on.
- The value does not appear anywhere in tracked repo content, so `tokens.mjs`'s
  publication denylist does not treat it as revoked.

**What this does NOT establish, and you must:** that gate step 5 passes end to end. Deriving
a public key proves the seed is the right one; it does not sign anything. Run the gate's own
SSHSIG path with its **four negative controls — altered bytes, wrong namespace, wrong key,
and the previous release's signature against the new bytes, all four of which must fail to
verify** — before you write `RELEASE.json` or cut a tag. CONDUCT deliberately did not sign
anything: signing is DIST's gated act and this session is not DIST.

**Still genuinely open and still Bob's:** whether to cut the release at all. The live plane
runs 0.56.0 while `release/RELEASE.json` says 0.55.0, so a group installing through
`newgroup` still receives 0.55.0 — that gap is a decision about distribution, not a missing
credential. And `op=audit` is not clean (D-200, now owned by REC-54), which your gate step 8
requires; closing that gap is RECORD's work and it is running.

The stale text is kept below because the format, the four controls and the rotation warning
are all still correct and load-bearing — only the premise "the key is absent" was wrong.

**`BIO_RELEASE_SEED` was recorded as not on this machine** — the key was present in `.env`
but empty, and no in-tree script references it, so the signer is genuinely out-of-tree as
`DIST.md` says. Without it you could not complete gate step 5, so you could not write a
truthful `RELEASE.json` or tag.

The format, from `docs/SESSION-KICKOFF.md:48`:
`BIO_RELEASE_SEED=BIOKEY-RAW1.bio-release.<base64 of a 32-byte Ed25519 seed>` — the
project's own envelope, which `ssh-keygen` cannot load, which is why the gate reconstructs
the SSHSIG path in Node and verifies against stock `ssh-keygen -Y verify` **with four
negative controls: altered bytes, wrong namespace, wrong key, and the previous release's
signature against the new bytes. All four must fail to verify.**

**Do not generate a new seed casually.** The public half is pinned as a trust root in
`newgroup/src/index.mjs:73` `ARMED_SIGNERS`, and that file's own comment says an unsigned or
wrongly signed release is **refused outright and the built-in copy installs instead**. A new
key is a ROTATION: it also means updating `ARMED_SIGNERS`, rebuilding and redeploying the
installer, and accepting that any installer already distributed refuses new releases until
replaced. 0.55.0 is signed by that key, so the private half existed on some machine when it
was cut — finding it beats regenerating it. Bob copies it to the clipboard and you read it
with `pbpaste`; it never appears in a prompt or a transcript.

## Deploy discipline that is already proved, and one trap that is not yet closed

- `bio-plane/scripts/deploy.mjs` believes only the bytes it reads back from the account, and
  then WAITS for the version to actually serve. On 2026-08-04 it reported `serving 0.55.0,
  waiting for 0.56.0…` then `serving 0.56.0 after 4s`. **If it prints ROLLOUT NOT CONFIRMED,
  do not verify behaviour yet** — a probe can be answered by the previous build, which once
  looked exactly like a security defect in the new one.
- **D-201, open and yours**: `deploy.mjs` would DESTROY the `civicos` UI worker. Its metadata
  is the PLANE's — it declares the R2 buckets, and `keep_bindings` does not include
  `service`. The live UI has exactly ONE binding, `service PLANE -> biosmoke7`, and it is
  what makes `/api` work at all. The UI path is closed by `civicos-ui/deploy-ui.mjs`; **the
  row stays open until `deploy.mjs` REFUSES the `civicos` slug by name** rather than relying
  on nobody trying it. Close that early — it is a few lines and it is a live trap.
- `civicos-ui/deploy-ui.mjs` first REFUSED a deploy that had actually succeeded, because the
  account returns the module inside a MULTIPART envelope and hashing the response body
  compares the envelope. It now extracts the module the way `deploy.mjs` always has. Reuse
  that, do not re-learn it.

## Your queued items

- **DIST-2** (M1) — the installer generates and binds `DAEMON_TOKEN` in BOTH `uploadInstall`
  and `uploadUpdate`. DIST-1's constraint is satisfied in this direction: the plane
  classifies the class before the installer binds it.
- **DIST-3** (M7) — the installer REQUIRES Workers Paid, verifies it, and REFUSES to
  complete rather than installing something quietly degraded. Refusing IS the fix, because
  the failure it guards is a group getting something quietly different from every
  description of it.
- **D-193** — `newgroup/src/release.mjs` embeds a bundled copy of the pre-REC-41 `setup.mjs`,
  whose panel describes a disclosure the plane no longer makes. It refreshes for free at the
  next release cut; the row exists so the cut is not made unknowingly. **Check the bundle was
  rebuilt from current source rather than assuming it.**

## Two things you inherit that are not yours to fix

- **D-200** — `op=audit` on the live instance is NOT clean: 10 `C-18.9` findings, documents
  at or past `verified` naming no provenance chain. Measured to be pre-existing record state,
  identical in the 0.55.0 and 0.56.0 bundles. **Gate step 8 wants a clean audit before
  anything is called done, and 0.56.0 was deployed with a known-unclean one, stated rather
  than passed.** It is RECORD's to fix; yours to decide whether it blocks a release, and to
  say so to Bob rather than deciding it silently. Do not close it by weakening C-18.9.
- A red battery goes back to the area that owns the code as a DELEGATION in `CLAIMS.md`.
  **DIST does not fix failures it finds** — holding the fix would put DIST back on the
  critical path, which is the whole reason the area exists.

## How you work

Claim in `CLAIMS.md` before editing, and name what you open. You own `newgroup/**`,
`release/**`, `bio-plane/scripts/deploy.mjs`, the version in `bio-plane/package.json` and
`wrangler.jsonc`, and all tags — **no other area touches these**, and you touch no other
area's ground. Run `node tools/plancheck.mjs` green before every push and verify from the
REMOTE afterwards. Read exit statuses UNPIPED: `cmd | tail` reports tail's status, so a
failed strict run reads as exit 0, and `npm run test:coverage --strict` does not pass the
flag at all — run `node scripts/coverage.mjs --strict` directly.

CONDUCT runs as a separate session and owns `main`, the queue and worker lifecycle. It does
not cut releases or deploy. Coordinate through `CLAIMS.md` and `QUEUE.md`, not by editing
each other's ground.

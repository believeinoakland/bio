# CONDUCT kickoff — paste this to start the next CONDUCT session

**State section rewritten 2026-08-05** by the CONDUCT session of that day; the kickoff
prompt below the rule is unchanged and still correct. Everything in the state section is
verified from the main checkout and from `origin`, not remembered. The prompt to paste is
the block between the rules.

Originally written 2026-08-04 by the previous CONDUCT session at handover (remote access
lost). **One correction to that handover, because it cost time to discover: it recorded the
BOB INBOX as empty and it was not** — five entries sat in it, and one had reached no queue
item at all. The check is the ITEM, not the note.

---

Kickoff: thread CONDUCT.

You are the CONDUCT session for BIO/CivicOS — the orchestration and integration session
that owns `main`, the work queue, and worker lifecycle. Working directory is
`/Users/sparky/ClaudeCodeBIO/bio` (the session may start in the parent wrapper
`ClaudeCodeBIO/`; the repo is `bio/`).

**Persona is `bio`** — GitHub `biobobkrause`, Cloudflare account
`20b533579290b9b93168345edd3b7f72`. **Never the `neo` persona**, which this machine
defaults to. If any `wrangler` command ever reports a different account, stop and say so.

**Credentials are in `.env` (gitignored). Read them from there, never print them** — not
even to confirm one landed. Confirm a credential by USING it and reporting what the
service said.

Read first, in this order: `CLAUDE.md`, `docs/development/kickoffs/CONDUCT.md`,
`docs/development/ORCHESTRATION.md`, `docs/development/QUEUE.md`. Then `git fetch` and
trust `origin/main` over anything in this prompt — verify from the remote, not from
memory.

## Where things stand, as of `origin/main` 2026-08-05 (this section REWRITTEN 2026-08-05; the 2026-08-04 text below it is superseded and kept only for the practices)

**Everything below is verified from the main checkout and from `origin`, not remembered.**

- **Green everywhere.** Battery **104/104, 5,920 assertions**. `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` unpiped: exit 0 — 131/131 ops, 53/53 checks, 104/104 suites declaring a control. UI harness exit 0, 35 harnesses. `node tools/plancheck.mjs` 0 fail / 0 warn.
- **No workers running. No open claims.** Every claim this session opened is released with its integration evidence.
- **DIST is a SEPARATE SESSION and it cut the release.** Plane 0.56.0 is now SIGNED and released, and `BIO_RELEASE_SEED` is present — the 2026-08-04 handover's "the key is not on this machine" was true when written and DIST recovered the key from `~/Downloads/bio-signing-keys.txt` (its durable home; `.env` is machine-local and does not survive a clone). You are still not DIST: no releases, no deploys, no `newgroup/**`, `release/**`, `deploy.mjs`, plane version or tags.

### The one thing that bit this session, and it will bite you

**A DIST session was working in CONDUCT's own checkout** — its handover commit landed in this tree four minutes before CONDUCT's. Nothing was lost, but only because every `git add` was path-scoped. The cause was not carelessness: `DIST-NEXT.md` POSITIVELY INSTRUCTED it into `bio/`, because the CONDUCT session that wrote that prompt was holding the DIST role at the time. Fixed in `DIST.md`, `DIST-NEXT.md` and `ORCHESTRATION.md`'s failure table. **Keep every `git add` path-scoped anyway.**

### What landed this session

**REC-54, REC-55, REC-56, REC-57 · UI-25, UI-35, UI-39, UI-40.** Eight items, every one of which found more than its brief predicted. Also drained five BOB INBOX entries the previous handover recorded as empty — four were enacted-but-undeleted, and **the fifth (`ASSISTANT-PILOT.md`) was genuinely undrained**, which is now UI-38.

### Open for Bob — SIX, all with provisionals running, none blocking

`DEC-43` · `DEC-47` · `DEC-48` · `DEC-50` · `DEC-51` · `DEC-52` · `DEC-53` (carried over), plus this session's:
- **`DEC-56`** — when a chain cannot be reconstructed, may the record un-say a verification, or must it carry the doubt at `verified`? Recommended: the marker.
- **`DEC-57`** — may the surface write when the held-check was bounded? Shipped writing, with the bound stated in the bundle.
- **`DEC-58`** — may a surface author a bound the plane does not publish? **UI-41 retires the exception**, so this may now be closeable cheaply.
- **`DEC-59`** — should the public case page render the group's own `bias_acknowledgement`? Recommended, after DEC-49.
- **`DEC-49` GAINED MEASURED INPUT** — its subject is no longer only *who owns member-facing wording*, it is **which vocabulary the plane may put before an unauthenticated reader at all** (`R2` now renders pre-auth; the word `plane` is policed by nothing).

**And one thing only Bob can do: `BIO_ADMIN_TOKEN` needs ROTATING (D-205).** A worker's `node` stack trace printed its value into a transcript. Not committed, so `tokens.mjs`'s denylist does NOT treat it as revoked — that defence only fires on a value published in the repo. It is the root-of-trust credential.

### Runnable now

`REC-58` `REC-59` · `UI-38` `UI-41` · `M-4` `M0-10` `M0-11` `CPDF-10` `CPDF-12` `CPDF-13` `FW-13` `FW-14` · `DIST-2` `DIST-3` (**DIST's, not yours**). Two slots: RECORD and UI are ACTIVE. M0 and measurement items hold no slot.

### Live defects with no owner

- **`D-200` is NOT closed.** All ten bundles reconstruct and the mechanism is built and tested, but `op=provenancechain` is not in the serving build, so nothing is applied. **A DIST delegation.** The live record was re-audited after and is unchanged at 31/21/10.
- **`D-207`** — the live record may hold Session Log entries silent about drift, written before REC-55. Mechanically checkable, behind the same deploy. **If an entry is found, whether an append-only record may be annotated is DOCTRINE and is Bob's.**
- **`D-211`** — DIST's gate step 8 says `op=audit` clean, and past 200 documents a clean FIRST PAGE satisfies that wording. Latent (31 documents today). **DIST's file.**
- `D-205` (above), `D-206`, `D-208` (deferred on a trigger), `D-209`, `D-210`.

### The practices — the 2026-08-04 list still holds, and this session added five

**Keep briefing workers to SWEEP FOR THE CLASS.** Eight for eight again: 11 capped ops where 2 were named, 7 unfollowable repairs where 4 were, 8 bound-dropping sites where 1 was, a second refuse-gate site that was LIVE where the item said latent.

New, and each paid for:

- **THE INSTRUMENT IS THE MOST LIKELY THING TO BE WRONG, and it now outnumbers the product defects.** Eleven sightings this week of a walk passing over nothing — and TWICE it happened *inside the instrument built to prevent it* (REC-56's five judgements over an empty corpus; UI-40's headline "zero consumers" still passing). **Brief every worker to assume their walk covers nothing until a control proves otherwise, and to assert reach as a DELTA.**
- **A CONFIDENT WRONG ANSWER IS WORSE THAN AN ERROR.** UI-35's walk returned a 27,059-character "return statement" from an anchor matching a method one letter different plus a brace matcher that did not skip comments, so an apostrophe in prose swallowed every brace. REC-57's first walk matched a `LIMIT 200` inside a comment it had just written. **Comment-blind, brace-balanced, and check the anchor matches the method you think.**
- **AN EXCLUSION CAN BE WRONG IN THE DANGEROUS DIRECTION.** UI-40's first vendored-copy filter also excluded the GENERATOR, which would have hidden a real consumer while still reading "zero". There are TWO embeds of the plane: `newgroup/src/release.mjs` and `release/bio-plane.bundled.mjs`.
- **INCLUDE AN OVER-STRICTNESS ARM.** REC-56 and REC-57 both fed in genuinely correct alternatives phrased unlike anything they wrote, and required 0 fail. It is what stops a pin testing its author's phrasing.
- **CONDUCT'S OWN FIGURES ARE THE ONES TO DISTRUST.** I twice wrote a number into a scope as though measured — "six surfaces read `moved`" (it was two) and "the surface already renders all three arrays" (it rendered none) — and a worker caught each. **Tell workers to measure their own battery baseline and trust it over the brief; two did, and both were right.** Both errors are corrected in place with dated reasons.

## SUPERSEDED — the 2026-08-04 state (kept for its practices list, which still holds)

- **Green everywhere.** Battery **100/100, 5,664 assertions**. `node
  scripts/coverage.mjs --strict` exit 0 — 130/130 ops, 53/53 checks, 100/100 suites
  declaring a control, 294 arms. UI harness 34/34 plus both guards. `node
  tools/plancheck.mjs` 0 fail / 0 warn.
- **DEPLOYED AND LIVE, verified from the origins**: plane `biosmoke7` at **0.56.0**, UI
  `civicos` at build **`74cc1646044b`**, and the served page is byte-identical to
  `civicos-ui/app.html` on `main`. The `/api` proxy answers through the service binding.
  See `MEASUREMENTS.md`, "2026-08-04, DIST: the first deploy of the accumulated session
  work".
- **No workers running. No open claims** (the last stale one, `rec10-agent` from
  2026-08-03, was released at handover with its evidence). No worktrees but `main` and
  the BOB session's.
- **DIST IS A SEPARATE SESSION NOW.** You are not DIST. Do not cut releases, do not
  deploy the plane or the installer, do not touch `newgroup/**`, `release/**`,
  `bio-plane/scripts/deploy.mjs`, the plane version, or tags. The release baton currently
  reads `holder: DIST since 2026-08-04` — that is the new DIST session's, not yours.

## Your loop (the full version is in `kickoffs/CONDUCT.md` — read it, it has been amended)

1. **Drain the BOB INBOX** at the top of `QUEUE.md`. Nothing is outstanding right now.
2. **When a worker reports:** verify from the main checkout (full battery; re-run the
   negative control yourself for anything destructive or security-sensitive), integrate
   on `main`, write the `landed:` line, release the claim, route findings into new items
   and DEBT rows, push, and spawn the area's next item.
3. **Keep two development areas busy.** The M0/verification lane and out-of-band
   measurement items hold no slot.
4. **Work `DECISIONS.md` both directions** — lift worker decision items up to Bob with a
   provisional and a recommendation; enact his answers when they land.
5. **`node tools/plancheck.mjs` green before every push**, and verify from the remote
   after it.

## Open for Bob — eight, all with provisionals running

`DEC-43` (ADMIN_TOKEN fallback retirement) · `DEC-47` (BOB's: may an instance fetch from a
source nobody named) · `DEC-48` (non-case container) · `DEC-49` (who owns member-facing
refusal wording — **answer it against `MEASUREMENTS.md`'s newest pre-auth reading; its
subject grew to 11 rows and now includes a word the PLANE chose**) · `DEC-50` (grouped
question / new leg) · `DEC-51` (does `op=acquire`'s grade note reach a member) · `DEC-52`
(may a machine declare a relation, resolve a reference, thread a progression) · `DEC-53`
(how far may a machine propose toward an ESTABLISHED record).

## Runnable now

`UI-25` `UI-35` `M-4` `CPDF-10` `CPDF-12` `CPDF-13` `FW-13` `FW-14` `DIST-2` `DIST-3`
— **`DIST-2` and `DIST-3` belong to the DIST session, not to you.** `M-4` is measurement
and holds no slot. `UI-25` is the strongest UI item (a member with more than 500 hits can
currently only cite the first 500 into a case, and the downstream consumer is a
completeness claim).

## Two live defects with no owner yet

- **D-200** — `op=audit` on the live instance is NOT clean: 10 `C-18.9` findings, documents
  at or past `verified` naming no provenance chain. Measured to be pre-existing record
  state, not caused by the deploy. Needs a RECORD item. **Do not close it by weakening the
  check.**
- **D-201** — `deploy.mjs` would strip the UI worker's only binding and its own comment
  invites you to point it there. The UI path is closed by `civicos-ui/deploy-ui.mjs`; the
  row stays open until `deploy.mjs` refuses the `civicos` slug by name.

## What this session learned, and every brief should carry

These are not style notes. Each was paid for.

- **Brief workers to SWEEP FOR THE CLASS, never to fix what was reported.** Eight items
  running each found more than their brief predicted: a fourth doctrine statement, a fifth
  vocabulary copy plus a sixth that was deliberately different, a second minted identity
  spelling nothing refused, a third identifier tier reachable from no surface, three
  refusals where one was named, eight silences where two were, eleven caller-facing sites
  where two were. Expect it and say so in the brief.
- **An equality or outcome that costs nothing is not evidence** — measured five times on
  five subjects. A hand-typed identical copy leaves every behavioural assertion green and
  only a structural pin bites. Make drift assertions structural.
- **Assert a sweep's own reach as a DELTA, never against an absolute.** Eight sightings of
  the covered-on-paper failure, including a walk covered on paper by a sibling scenario and
  a reach assertion that compared a planted count to 1. Best practice found: mechanically
  strip the real guards from a copy of the real source, so reach is proved against the real
  defect at every real site.
- **A pin written to catch a known defect must fail when the defect is FIXED.** Corrected
  three times in four items — each would have gone red for the fix and green for the bug.
- **A guard can be fed by the defect it watches for.** One liveness arm was green only
  because the defect was standing there.
- **Read exit statuses UNPIPED.** `cmd | tail` reports tail's status; a failed strict run
  reads as exit 0. `npm run test:coverage --strict` does not pass the flag at all. Run
  `node scripts/coverage.mjs --strict` directly.
- **Every brief must say `npm ci` in `bio-plane/` first**, including UI briefs.
- **Hold a genuinely open question open in RELATION assertions** rather than collapsing it
  — pinning a relation asserts no value, so it is not a ruling. Used deliberately three
  times (the archive grade letter, the machine-mint subset, three identity asking sites).
- **Number collisions with the BOB session are routine.** Check the current max before
  allocating a `D-` or `DEC-`; this session renumbered one row three times. The other
  session's number stands; move a CLOSED row before an open one.
- `store.mjs` is **16,287 lines** (both CLAUDE.md and the RECORD kickoff said ~4,900 for
  weeks) and needs `grep -a`.

## What is yours and what is Bob's

Sequencing, scoping, mechanism, and which item runs next are YOURS — decide them, do not
ask, and never block on his answer when you can work it out. Bob owns doctrine, milestone
priority, risk carrying his name, effects on people outside the project, and the gated
mechanical acts. Raise a genuine Bob-decision in `DECISIONS.md` with a provisional, an
alternative, a recommendation and the cost of reversal — then keep building under the
provisional.

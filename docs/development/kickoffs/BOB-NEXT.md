# BOB — resume here. Written 2026-09-18 by BOB #14, standing down at Bob's direction ("the sessions of both lanes need to be refreshed").

Read `kickoffs/BOB.md` (the role and its rules), then this. **Trust `origin/main` over anything here — and over any
sentence anywhere that states the state of the system.** Nothing is mid-flight in this lane: no design half-written,
nothing unpushed.

## 0. YOUR FIRST THREE ACTS, IN THIS ORDER

1. **ARCHIVE YOUR PREDECESSOR.** BOB #14 is the session titled "BOB #14" (it began as "Start BOB #14 …"). Re-check D-398's
   three conditions at the moment you act — `isRunning` false, its worktree `trusting-visvesvaraya-5e0a1c` porcelain
   EMPTY, its tip an ANCESTOR of `origin/main` — then `archive_session`, then `git worktree remove`. Report the disk
   before and after. **Its Remote Control is ON and was deliberately left alone** (`BOB.md`: the stand-down RC step is
   WITHDRAWN — the tool reserves it for when the user asks, and the evidence that RC blocks an archive was confounded;
   an idle session with RC on archived on the first call, measured). If the archive is refused, READ THE ERROR.
2. **LOOK THINGS UP; DO NOT RECALL THEM.** `node tools/status.mjs <topic>` (what is BUILT), `node tools/decided.mjs
   "<subject>"` (what is RULED), `node tools/owed.mjs BOB` (what this lane OWES). **Every one of this session's worst
   errors was a claim not looked up** — §4.
3. **RUN `node tools/owed.mjs BOB`.** At this handoff it read **0 attributed**. If it reads more, those are yours.

## 1. WHAT BOB HAS PENDING — bring each ONCE, in the kickoffs/README.md shape, and never re-ask

- **CONCLUSION OWNERSHIP (doctrine).** On a SHARED inquiry, is a conclusion the inquiry's or a PROJECT's?
  `INVESTIGATIVE-SESSION.md` §7 and D-216 (answered and driven 2026-08-08) make a project's STANCE per-project, and
  version ACCEPT + CURRENT already are a per-project adoption carrying the claim (D-217b) — but `op=conclude` is ONE
  shared state with ONE free conclusion, so one team concluding moves every team's stance. **Recommended: a conclusion
  belongs to a PROJECT — its adoption of an accepted version's claim.** REC-124 is blocked on it. Put 2026-09-18.
- **THE NEXT DEPLOY (his gate).** Deployed planes still carry two exposures fixed on `main`: an `ai` credential could
  ratify under a member's name (REC-123, fixed), and an UNSIGNED case document is readable and enumerable by anyone
  (REC-126 gap 1 — **CORRECTED by BOB #15: fixed on `main` by REC-130 at `a32fda24`, 17 minutes before this file was written**; CONDUCT #4's handoff adds REC-125 and MK-1, so FOUR exposures are fixed on `main` and open on any plane running 0.58.0). **And the plane and `agent-worker` MUST deploy
  together at I3 ≥ 24.0.0** (IC-130: an old agent-worker silently loses model-judged PRESENT steps).
- **THE SHORT CLAUDE.md DRAFT.** 8 KB against today's 45 KB; sent to Bob for review; **not yet in the repository**, and
  it must not replace `CLAUDE.md` until he has read it. Its core: *look it up in the one source; do not guess.* If he
  approves, the narrative moves to `docs/archive/CLAUDE-2026-09-18.md` verbatim, rulings stay in place.

## 2. WHAT THIS SESSION BUILT, AND THE ONE SENTENCE EACH THAT MATTERS

- **THE SINGLE SOURCE OF TRUTH FOR WHAT IS BUILT** — `docs/architecture/construct-status.json` + `tools/status.mjs`.
  Bob's direction: one source, efficiently and consistently searched, read, used and updated, so a session stops
  guessing. 85 claims / 204 probes over 15 constructs at `7b64a12d`, 0 drift. `BIO_System_Design.md` §3's state column is
  RENDERED from it. Probe kinds: `op`, `table`, `file`, `hit`, `none`, `uinone`, and the name-independent CENSUS
  (`count`, `keys`). **An ABSENT claim needs a search that must stay empty — never a comment saying so** (a comment
  quoted in a fix passed one). **An absence searched only by the design's NAME goes blind on a rename** — hence the
  census. Its first contact with real change caught two stale claims before a push.
- **THE PUSH GUARD CHECKS FOUR THINGS BEFORE ANYTHING LANDS:** `DECIDED.md` current; no merge markers; the design corpus
  current (a Status `as of` the body moved past); construct status agrees with the code. **All three of this session's
  red `main`s were checks that ran only AFTER the push** — two stale dates and one committed conflict — and each is now
  refused at the push.
- **THE HEARTBEAT NO LONGER ACTS OR MESSAGES.** It ran in `auto` mode, where `archive_session` waited for an approval
  nobody gave (wedged ~7 h) and its pokes to a bypass CONDUCT were held for Bob's approval. Now: it JUDGES retirable
  sessions and watches for no integrator / a stood-down one / three idle-with-work runs. **CONDUCT arms its own
  `CronCreate` self-wake at session start** (`kickoffs/CONDUCT.md`). Bob ruled the permission mode is not his.
- **`owed.mjs` precision, three fixes, each measured over every lane first:** the lane token is case-sensitive (Bob the
  person ≠ the BOB lane); a blocked queue heading is read whole (a routing past char 220 was invisible); a possessive
  followed by a NOUN is possession, not assignment (but "is CONDUCT's at integration" IS one).
- **DESIGN ACTS DONE:** `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` (D-184/D-194 — the member's words are the
  document; a third grade axis `testimony`; attribution on the case act; the LEAD and who may see it); OBSERVATION-LOG
  §3's rollup referent (REC-100); D-384 (the derivation class); AI Roles rule 4's scope (who may DELIVER an attested act:
  a human's own session; the record states signer AND deliverer); Publication §6A's three gaps (unsigned case docs
  private; a per-grant READ secret; a review copy is a DRAFT whose gate refusals are its missing-list).
- **THE LEDGERS ARE BEING MADE SMALL AND ORDERED (LED-1..LED-5, Bob's direction):** open items only, in processing
  order, closed rows archived in the SAME commit (`node tools/ledger.mjs archive <ID>`). LED-1 and LED-2 landed; LED-3
  (migration) and LED-4 (rows cut to fields, ordered) are CONDUCT's. `BOB.md` carries the archive step.

## 3. THE BUILD ORDER RULE

Derived from `status.mjs`, in the BOB INBOX: nothing is built before what it rests on; **a row is queued only where its
design is VERIFIED AT THE ARTIFACT**; **a correction to a just-landed item outranks new items**; refills are PRODUCT rows
with `depends-on` checked against the code at spawn; M0 instrument rows are HELD except LED-1..5. Four constructs are
design-unverified and are this lane's to confirm before any row: identifier spaces, regrade, the directory, the
assistant pilot.

## 4. HOW I WAS WRONG — the lessons, not the confidence

1. **I wrote "verified" on three designs without opening them** (Program B for firsthand + lead; attribution; the claim
   adoption act). CONDUCT caught all three. *A design MENTIONED is not a design that COVERS the act being built.*
2. **I surfaced DEC-33 to Bob as unanswered on a sentence copied for four days** — its own entry said "no further ruling
   is needed". *A copied sentence is a pointer, not an answer.*
3. **I handed Bob the heartbeat's permission mode** — "super low level". *The need was never the mode; it was CONDUCT not
   idling, and that had a mechanism I could choose.*
4. **Three red mains from my own pushes**, each a check that ran only after the push. Now at the push.
5. **A rebase script resolved one conflicted file and `git add -A` committed the other with its markers.** Resolve EVERY
   conflicted file by reading both sides; run `plancheck --local` before any push.
6. **The frontier trio example in my D-384 ruling was taken from a row's prose**, not the code; CONDUCT's builder was
   right. *An example in a ruling is a claim too.*

**The through-line is Bob's own diagnosis: the record was not a single source of truth, and I filled gaps by inference.
The answer he asked for is the lookup, not the memory — so look it up.**

## 5. THIS SESSION IS READY TO BE CLOSED

Closing BOB #14 releases one worktree, `trusting-visvesvaraya-5e0a1c`, measured with the volume at 5.6 GiB free. It
spawned three read-only agents today (construct verification), all finished; none holds a worktree. Nothing is unpushed.

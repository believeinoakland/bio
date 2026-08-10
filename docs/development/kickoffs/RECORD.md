# Area RECORD: the store core, retrieval, and the scheduler

> **Head note, 2026-08-03 (CONDUCT, the licensed supersession correction):** the
> stand-up framing and plan section below are STALE — they end at REC-3 while
> REC-1..10, REC-19, REC-25(active) and the M0 lane have all run. The area's
> current plan is `QUEUE.md`'s RECORD section (the case-making run: next REC-11 →
> REC-13 → REC-12 → REC-14, with scopes carrying every DEC reshape). A RECORD
> worker should read its queue item and `research/RECONCILED.md` as authority;
> this file's remaining value is the path/ownership notes. The next RECORD session
> to close a turn should rewrite it as its own account.

Written 2026-07-31 by session BOB, standing this area up. **It exists because the
ground was already being edited with nobody owning it**: `store.mjs` is ~16,300 lines (measured 2026-08-04 at 16,287; this file said ~4,900 for weeks)
and only its link, capture, task and reachability functions were claimed, so the
schema core, `promote`, the gate, the audit sweep, membership, the projections and
the whole retrieval surface belonged to no one. Unowned is a collision risk rather
than a licence (`PARALLELISM.md`), and the practical effect was that anything
touching the store defaulted to CAPTURE — which is why CAPTURE now appears in three
milestones and is the constraint on the whole board.

This file is a stand-up, not this area's own account of itself. **The first RECORD
session rewrites it at its close**, with what it actually learned.

**Coordination:** before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE" — the channels, which
carries what, and the receipts for every way a correct change reached nobody. Claim
in `CLAIMS.md` before editing; publish before you call anything done.

## What this area owns

- `bio-plane/src/schema.mjs` — the schema core. CAPTURE owns the capture, link, task
  and reachability tables inside it; everything else is here.
- `bio-plane/src/store.mjs` — `promote`, the gate path, the audit sweep, the
  projections, membership, selections, the alarm. **NOT** the link, capture, task and
  reachability functions, which are CAPTURE's.
- `bio-plane/src/query.mjs` and the retrieval surface — the parser, the compiler, the
  single viewer-predicate compilation point, `bundles_fts`.
- `bio-plane/src/index.mjs` — the OPS table and the control-plane dispatch, **as of
  2026-07-31 when I3 moved here from CAPTURE**. The capture ops themselves stay
  CAPTURE's; the op CONTRACT is this area's.
- The scheduler, once REC-1 decides its shape.

**Interfaces: this area OWNS I3 (the op contracts) and I5 (the store schema)**, and
consumes none. Read `INTERFACES.md` before changing either — I3 has more consumers
than any other interface in the project, and I5's three rules are not style.

## How a session starts

1. **Read `CLAUDE.md`**, then this file, then `MILESTONES.md` for what the work is
   for and `QUEUE.md` for what is runnable.
2. **Claim RECORD in `CLAIMS.md` before editing**, naming paths precisely. `store.mjs`
   is shared ground: name the functions, not the file. A need inside CAPTURE's
   functions is a DELEGATION, not a quiet edit.
3. **Work in a worktree**: `claude --worktree RECORD`. One session per worktree;
   `.env` arrives via `.worktreeinclude`.
4. **Verify with `npm run test:battery`**, not `npm test` — the chain stops at the
   first failure and hides everything after it. Then `npm run test:coverage`:
   no new unreached op, and an op you add carries a control-plane assertion in the
   same turn. `VERIFICATION.md` is the process.

## The plan (this area's own, as stood up)

**REC-1, the scheduler, first, and it is time-critical.** Nothing in this plane runs
on a schedule: `wrangler.jsonc` declares no cron trigger, and the Durable Object alarm
now serves TWO consumers (the selection sweep and, as of 39a0e1b, the task drain)
with a third queued in CAP-3. Monitoring, the archive fallback's eligibility clock,
per-document cadence and M4's ageing of temporal expectations all presuppose a
periodic actor that does not exist. **Decide the shape ONCE** — one reconciling alarm
inside the DO versus a cron trigger at the Worker — and write down why, because every
later consumer inherits it. Build the mechanism and move ONE existing consumer onto
it; do not build the consumers.

Then REC-2 (D-61, an unattended writer cannot take a lease) and REC-3 (the batch of
small honesty defects in the plane's own surfaces). `QUEUE.md` carries the scope and
the `accepts-when:` for each.

## What this area should know without being told

**`store.mjs` is ~16,300 lines — MEASURED 2026-08-04 at 16,287, after this file had said ~4,900 for weeks. Grep before assuming a helper does not exist, and use `grep -a`.**

**New schema tables go BEFORE the `host_governor` block**, and there are no backticks
inside the schema template literal. A balanced stray pair still parses, so
`node --check` will not save you; the guard counts ticks. This class has struck three
times.

**A derived table must be named in `op=purge`'s whole-store arm** (D-113), or a purge
reports scope ALL and silently leaves rows. The check that closes the class is M0-6.

**A deploy verified is not a build serving** (D-108), and the rollout is per-isolate
and not atomic. If a live probe contradicts the suite, establish which build answered
before believing either. Land tested code on `main`; **DIST cuts releases**, and the
deploy of the real record is gated to Bob.

**Two undocumented workerd ceilings bound every statement you write**: about 100 bound
variables and five compound terms (D-36). They are far below SQLite's documented
defaults, a bench found them rather than the suite, and any new statement shape can
meet another one.

**Verify in this area's own scratch namespace**, never the real record, and sweep
after. Two sessions sharing a scratch namespace destroy each other's probes.

**Close the turn with the decisions that are BOB'S, and nothing else**, in the shape
`kickoffs/README.md` defines — read its three tests first. Activation order,
sequencing, mechanism and scoping are NOT his; decide them, record the reasoning, and
report in a line. An empty list is a real answer and is the common one.

## Appended 2026-08-10 by the D-266 worker (worktree-agent-a3479876cd7e9561b)

Appended rather than rewriting this file, because other RECORD workers may be live and
this turn closed one narrow item rather than the area's account of itself.

**THE DISPOSITION ACT NOW HAS TWO KEY SHAPES AND THE DIFFERENCE IS DOCTRINE, NOT
PLUMBING (D-266, IC-60).** Before you touch either, read the ruling: **a dismissal is
scoped to the KEY'S OWN SUBJECT.**

- `proposal_dispositions`, keyed `(progression_key, stage_key)`, is **INSTANCE-WIDE** —
  one act clears the finding under every case it appears in. That is DEC-16, and it is
  DEDUP, because a progression-stage finding is a fact about the SHARED record.
- `finding_dispositions`, keyed `(project_id, finding_id)`, is **ONE PROJECT'S FEED** —
  a stance is expressly one project's own property (§7, D-216), a dismissal is a
  judgment-layer act, and R5 makes forks at the judgment layer legitimate.

**DO NOT COLLAPSE THEM.** Widening either key to look like the other erases the
distinction the item exists to draw, and it is the edit that will look like finishing
the job. `test/d266scope.test.mjs` asserts BOTH behaviours in ONE suite for exactly that
reason: a distinction asserted in two suites is not asserted, because two suites can
each go green while the behaviours have quietly become one.

**WHICH KINDS ARE WHICH IS A PROPERTY, NEVER A LIST OF SLUGS.** A FINDING carrying the
`(progression_key, stage_key)` pair is instance-wide; one carrying none is
project-scoped. Add a fifth finding kind and it is covered without this contract moving.

**THREE THINGS THIS TURN PAID FOR, so the next session does not.**

1. **The instance-wide ageing lives UPSTREAM of the mint**, in `proposalsFeed`'s own
   disposition filter — not in `queueFeed`. So re-scoping what `#dispositionOf`
   PUBLISHES changes what a surface is told and NOT what the feed does. A control arm
   that armed only the mint came back green and that is how this was measured.
2. **A freeze is SILENT AT THE ACT.** `ON CONFLICT … DO NOTHING` returns `ok: true`
   exactly as an UPSERT does, so a negative control declared against the act's RETURN
   goes green over a plane that tells a member their re-triage landed and keeps the old
   decision. Declare re-triage arms against the FEED.
3. **`op=proposedispose` now takes the server-side `viewer` stamp** (`index.mjs`'s
   viewer-stamp condition). Its project-scoped arm gates the named project through
   `viewerPredicate`, which fails CLOSED — so an op added to that arm without being
   added to the stamp list refuses `NO_SUCH_PROJECT` for a perfectly real project.

**AND TWO OF THIS ITEM'S OWN DEFECTS WERE CAUGHT BY RATCHETS RATHER THAN BY REVIEW,**
which is the argument for keeping them: `airuns.test.mjs`'s index-reader ratchet failed
the build naming two indexes added on the new table that no statement filters on, and
`hygiene.test.mjs` caught the new suite exiting on `process.exit(1)` under a conditional
instead of on its own result.

## Appended 2026-08-10 by the D-280 worker (worktree-agent-aa5a5b887286869b2)

Appended rather than rewriting this file, for the same reason the D-266 note above
gives: other RECORD workers may be live and this turn closed one narrow item.

**THERE IS ONE SEVERANCE PREDICATE IN `store.mjs` AND YOU MUST CONSUME IT, NOT COPY
IT.** `#refEdgeSevered(citingId, targetId, rel = null)` is D-267's, and D-280 took it
from three callers to six (`#citesInto`, `#restsOnLive`, `#queueAncestorEdges`,
`#requiredStrengthFor`, `#routeTask`, `restingOn`). **`severedhomes.test.mjs` pins that
count EXACTLY** — if you add a seventh reader, that assertion fails and you are meant to
come and say which site you added and why. Do not relax it to a floor: it is the only
instrument here that can see a reader of the rule appear or disappear, and no
behavioural arm anywhere can see a faithful inline copy of a rule.

**THE CLASS, so you can recognise a seventh instance:** `refs` and `inquiry_basis` are
both projections of a document's `references[]`, written in `promote`'s transaction, and
both carry the RELATION while DROPPING the STATUS. **Any read that answers "who points at
me" out of either table, without going back to the citing document, is blind to
withdrawal.** D-280's row printed the whole census; do not re-derive it.

**SEVERANCE NARROWS ONLY ON A POSITIVE RECORDED WITHDRAWAL, AND THAT IS A RULE AND NOT A
DEFAULT.** Unreadable is LIVE. No `status:` key is LIVE. A spelling the catalog does not
write (`Severed`, `severed `) is LIVE. **A fence tighter than its rule silently drops a
home, a bar or an obligation nobody gave up — the same overclaim class pointing the other
way**, and it is why every item in this family carries a dedicated over-strictness control
arm rather than reading over-strictness off the headline. Three of D-280's six arms exist
only for that direction.

**ANY LIVE EDGE KEEPS THE CITER.** `refs` is keyed `(bundle_id, target_id, kind)`, so one
citer can hold several rows against one target. Withdrawing a `relates_to` is not
withdrawing a citation, so the question is asked PER EDGE and the citer is dropped only
when EVERY edge is severed. `kind` of `''` means the entry authored no `rel`, and the
predicate is then asked with no relation constraint rather than against a spelling the
document never wrote.

**THREE THINGS THIS TURN PAID FOR.**

1. **`refs` HAS A SECOND WRITER.** Besides `promote`'s projection of `references[]`, the
   link projector inserts `kind='links_to'` rows with NO frontmatter entry behind them.
   That is why D-280 did NOT add the `kind` filter its own row named as part of the
   defect: narrowing by relation would drop bars the record currently honours, on edges
   with no author's decision in them. It is a separate ruling and is stated as one.
2. **OWNERSHIP ON A MACHINE-PROMOTED PROJECT IS REACHABLE AFTER ALL.** D-280's row
   recorded `#routeTask` as un-driven because 7.1 gives ownership to the promoting
   MEMBER and these fixtures promote with a machine credential. The Durable Object's own
   `projectclaimowner` surface does it in one call (`projects.test.mjs`'s precedent), and
   that is what made the site drivable. If a row says a site cannot be driven, try the DO
   surface before believing it.
3. **A CONTROL ARM THAT DELETES A CALL SITE CANNOT LEAVE THE STRUCTURAL PIN GREEN.**
   Three of D-280's arms declared exactly that and all three came back NOT AS DECLARED on
   the first run. **The arms were right and the declarations were wrong**, and they were
   corrected and the correction recorded rather than the paragraph being rewritten.

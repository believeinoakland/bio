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

## Appended 2026-08-10 by the CASE-1 worker (worktree `agent-a1af1f1e654822176`)

Appended rather than rewriting this file, for the reason the two notes above give: other RECORD
workers may be live and this turn closed one narrow item — **the first row of DEC-72's CASE arc.**
CASE-2, CASE-3, CASE-4, CASE-5 and CASE-6 all rest on what landed here, so this note is written for
them specifically.

**THE CASE TABLES ARE NOW THREE, AND WHICH ONE HOLDS WHAT IS THE THING TO GET RIGHT BEFORE YOU
TOUCH ANY OF THEM.** The names carry history and one of them is misleading:

- **`cases`** — NEW, CASE-1's. The case IDENTITY and the PROJECT whose production it is. Keyed
  `case_id` ALONE. **Nothing writes it yet: CASE-2 is its writer**, and `project_id` is NOT NULL
  precisely so a project-less publication cannot be represented.
- **`published_cases`** — keyed `(case_id, edition)`. **It is the EDITIONS table**, whatever its name
  says, and it holds the ceremony DEC-72 leaves unchanged (scope, completeness, bias
  acknowledgement, the container manifest). It was NOT renamed and NOT duplicated: a second editions
  table would be a second authority for which editions a case has.
- **`published_case_members`** — the roster, now `(case_id, edition, ord, bundle_id, version_sha,
  role)`. **`edition` on this row is the CASE'S edition and never the member's** — the shipped
  `#caseEditionState` reads `published_bundles` at the case's edition number, which is only correct
  while one case owns one finding, and that is the conflation CASE-5's artifact flip removes.

**FOUR THINGS THIS TURN PAID FOR, so the next session does not.**

1. **THE CASE OBJECT WAS ALREADY HALF-BUILT AND THE BRIEF DID NOT SAY SO.** `published_cases` and
   `published_case_members` have existed since REC-44/DEC-44. An item briefed as "add the case
   object" that adds a fourth and fifth table would have shipped two authorities for one fact.
   **Grep the schema for the thing you are about to add before you add it** — the same instruction
   this file already gives about helpers in `store.mjs`, arriving at tables.
2. **A NULLABLE COLUMN WITH NO DEFAULT IS A DESIGN DECISION, AND THE OVER-STRICTNESS CONTROL IS WHAT
   PROVES IT.** `role` takes no default because a default designates a case member load-bearing or
   supporting BY OMISSION, which is DEC-72 clause 4's authored act happening without an act. The
   negative control's arm (d) gives `role` a `NOT NULL DEFAULT 'supporting'` and measures the
   consequence: **the shipped publish-and-ratify path still succeeds end to end**, the case still
   reaches the public index, and the member simply comes back designated by nobody. Nothing else in
   the plane notices. A tightening that looks like caution is how that class arrives.
3. **THE JOIN THAT BINDS A CASE TO ITS PROJECT MUST BE `LEFT`, AND NO ARM OVER AN EMPTY STORE CAN
   SEE IT.** An inner join deletes every pre-DEC-72 case from `op=publishedmanifest` the moment the
   table lands. Arm (c) proves it: **block 1 stays entirely green and block 2 goes red.** If you are
   adding a table that other rows join to, the arm that matters needs a real published row, not a
   booted store.
4. **MAKE THE DESIGN DOCUMENT THE EXPECTATION.** `caseobject.test.mjs` block 3 parses the CASE-1
   bullet out of `CASE-AS-PRODUCTION.md` at run time and demands a column for every fact the bullet
   names. Three items shipped a blind-by-construction assertion today; this one cannot be, because
   the document is not derived from the schema and this item may not edit it. **It looks in
   `docs/development/` AND `docs/archive/`**, because CASE-6's definition of done archives that file
   — a suite that knew only the working path would go red on a correct landing.

**WHAT CASE-2 SHOULD DO FIRST.** `publishCase()` takes no project today (measured — its signature is
`{ target, targets, caseId, scope, statement, excluded, subjectPosition, subjectJustification,
biasAcknowledgement, viewer, author }`), and the case identity is DERIVED from what the members
already belong to, then minted. Under DEC-72 the project comes in at the door and the owner fence
runs against it. **The `project_id NOT NULL` constraint is the one thing CASE-1 could not drive** —
no op writes `cases`, and this plane exposes no SQL surface, so it is pinned structurally and said
so. The first CASE-2 arm should be a project-less publish refused BY NAME.

## CASE-3 · version pinning landed (2026-08-10, worktree `agent-a36b6782b06f5a651`)

APPENDED, never rewritten — other RECORD workers are live.

**DEC-72 clause 3 is now structural, and the two halves it needed were different
shapes of missing.**

- **The pin is WRITTEN.** `publish()` — the ratify committer — sets
  `published_case_members.version_sha` from the ratifying member's own signed
  `bundle_sha`, write-once (`AND version_sha IS NULL`). CASE-1 landed the column;
  until this item **nothing on earth filled it**, so a published case named its
  members and froze nothing. Each member pins its OWN row at its OWN ratification,
  because the roster is written by whichever member ratifies FIRST — at which
  moment the others have signed nothing and their hashes do not exist.
- **The mint fence.** `#moveVersionState` now refuses
  `PUBLISHED_CANNOT_MOVE_VERSION` (C-25.34) for the four acts that MOVE a
  reading's state, on a `published` finding. **This closed a hole rather than
  adding a policy:** `divide()` and `groundInquiry()` have always refused exactly
  this, the latter in words that describe the version door precisely. `hide` and
  `current` are outside the fence and the line is `VERSION_ACT_TO`'s own — the
  catalog's table, not a judgement.
- **The pin is SERVED** on `#caseEditionState`'s member rows, so `op=publishedcase`
  answers an anonymous reader with the version each member was frozen at.

**WHAT WAS DELIBERATELY NOT DONE, so the next item does not re-derive it.**
Resolving a member BY THE PIN instead of by the CASE'S edition number is the
conflation CASE-1's schema comment hands to **the artifact flip, CASE-5**. This
item serves the pin and does not move the predicate. Today `version_sha` and the
served `bundle_sha` agree because a member's edition is still slaved to its case's;
**CASE-5 is where they can diverge, and that is the point at which the pin starts
doing work no other column can do.**

**A MEASURED FINDING WORTH CARRYING.** The write-once predicate is genuinely
UNREACHABLE, and that was established by running the arm rather than by reasoning
about it: the pin UPDATE is keyed `(case_id, EDITION, bundle_id)`, so a later
edition writes a later edition's row, and a second sha at an already-published
edition is refused by `EDITION_EXISTS` long before the pin write. It is kept
because two authorities for one version must be incapable of disagreeing — and it
is not claimed to be a reachable refusal.
## CASE-2 landed — publication is a production of a project (DEC-72), 2026-08-10

Appended, never rewritten: other RECORD workers are live, and a CASE-3 worker is on version
pinning in the same neighbourhood.

**WHAT A LATER RECORD WORKER NEEDS TO KNOW, in the order it will bite:**

1. **`op=publish` NOW TAKES `project` AND `roles`, AND BOTH ARE REQUIRED.** `roles` is a map from
   finding id to `load_bearing` | `supporting`, covering every member exactly. Eight existing suites
   drove this op with neither; they were corrected through a SHARED fixture,
   `bio-plane/test/publishingproject.mjs`, rather than by eight copies of a project template. If you
   add a suite that publishes, use it — and note it deliberately does NOT wrap the act, so the
   publication itself stays spelled out in the suite that asserts on it.

2. **`#requiredStrengthFor` IS GONE.** DEC-17's strictest-across-citers composition went with it, and
   so did the group default as a publication bar. Its replacement is `#projectBar(projectId)`, which
   reads ONE project's `bundle.md` and walks nothing. **Do not reintroduce a fallback there** — the
   group default's surviving role is SEEDING a new project (DEC-17's other half, which STANDS), and
   `caseproduction.test.mjs` §7 asserts the absence off the source precisely because a composition
   under a new name would pass every behavioural arm.

3. **`op=strengthbarof&target=` IS WITHDRAWN** and refused `BAR_IS_A_PROJECT_PROPERTY`. Use
   `&project=`. The `&group=` arm is unchanged and now says `seeds_new_projects: true` in its answer.

4. **THE RATIFY COMMITTER WRITES `cases` AND `published_case_members.role`, OUT OF THE SIGNED BYTES.**
   `op=publish` writes NEITHER — deliberately, and it is what keeps CASE-1's `purge` exemption honest
   (its stated reversal condition was a case existing as a DRAFT before publication; this item
   creates no such state). Two new frontmatter keys carry them: `case_project` and `case_roles`.

5. **THE ONE LINE CASE-3 AND CASE-2 SHARE**, named so the merge is expected rather than discovered:
   the `INSERT INTO published_case_members` statement inside `publish()`'s `if (caseId)` block.
   CASE-2 adds `role`; CASE-3 adds `version_sha`. CASE-1 added both columns in one commit precisely
   so both would be written, and neither item can avoid the statement.

6. **`caseobject.test.mjs` (CASE-1's) NOW EXPECTS `project_id` AND `role` FILLED AND `version_sha`
   STILL NULL.** That split is deliberate and load-bearing: a suite that quietly started expecting
   all three would stop being able to tell CASE-3 landing from CASE-3 being forgotten.

7. **A FINDING REPORTED RATHER THAN FIXED, because it is not this item's scope:** `op=promote` does
   not re-run C-2.8's `published` entry requirements on an already-`published` document. Driven in
   both directions — bytes with `case_project` removed promote `[ok: true]`, and so do bytes with
   `case_scope` removed, a field required since REC-44 — so it is PRE-EXISTING. `op=ratify` does run
   the catalog and refuses, so the plane is closed. See `MEASUREMENTS.md`.

**WHAT IS STILL OWED BY THE ARC** (CASE-4, CASE-5, CASE-6 and the arc's definition of done) is in
`QUEUE.md` and `CASE-AS-PRODUCTION.md`; nothing in this item touches
`docs/BIO_DATAPLANE_STATE.md`, which the arc binds to CASE-6.

## CASE-5 landed 2026-09-10 — DEC-72's ARTIFACT FLIP. What the next RECORD worker must know.

1. **A FINDING'S `edition` IS ITS OWN NOW, AND THE CASE'S IS `case_edition`.** They were one field
   doing two jobs. `op=publish` stamps the member's next edition off that member's own published
   chain and the case's number beside it; `op=ratify` reads both out of the signed bytes; the store
   keys `published_bundles` on the first and `published_cases` / `published_case_members` on the
   second. **If you write a fixture that rewrites `edition:` in a published document's bytes, you
   almost certainly have to rewrite `case_edition:` too** — `shadowed-refusals.test.mjs` was the
   suite that found this, and it went red in exactly that way.

2. **A CASE MEMBER IS RESOLVED BY ITS PIN.** `#caseEditionState` selects `published_bundles` on
   `bundle_sha = version_sha`, and the old `edition = <the case's>` predicate survives ONLY as the
   fallback for a roster row written before CASE-3, whose pin is honestly NULL. Same rule in the new
   `#caseOfSha`, which replaced four `#caseOf(bundleId, r.edition)` calls that were passing a
   FINDING's edition into a CASE-edition parameter.

3. **`published_cases` GAINED `bar`, committed from the signed bytes under the existing
   `CASE_ASSERTION_DIVERGED` refusal.** The bar is the CASE's property (DEC-72 clause 2) and had
   nowhere case-side to live, so it existed only once per member in `published_bundles.required` —
   which meant a project whose bar moved between two members' ratifications gave one case two
   standards. It is served on `op=publishedcase` (with `project` and `bar_detail`), on
   `op=publishedmanifest`'s `cases[]`, and inside the container.

4. **THE CONTAINER IS `bio-case-container/4`.** It gained `project`, `bar`, and per finding
   `version_sha`, `role` and the member's OWN `edition` — and `findings[].signature.statement` is
   now the ASCII string rather than a `Uint8Array` serialised as an object of byte indices. Three
   suites pin the format literal exactly (`publishedcase`, `multifinding` ×2) and they were
   CORRECTED with dated reasons, never exempted. **Pin the exact version, never a prefix**: a range
   match passes silently over the next flip.

5. **C-2.8 REQUIRES `case_edition` on a published inquiry, and only when `case_id` is present.** The
   store keeps a documented fallback to the member's edition for bytes signed before the field
   existed — defence in depth for the idempotent re-ratification path, NOT a policy default. The
   gate is the catalog, where a refusal can name what is missing (CASE-1's rule, CASE-2's precedent).

6. **WHAT THE CASE-5 BULLET STILL OWES, and it is stated in IC-66 rather than left to be found:
   FINDING BYTES STILL NAME A CASE.** `case_id`, `case_findings`, `case_roles`, `case_scope`,
   `bias_acknowledgement` and `required_strength` are still stamped into every member. This item
   removed the half that was load-bearing on the FORMAT — the edition conflation, which is what made
   one-case-per-finding structural — and stopped there deliberately. Every case fact this plane
   commits is committed FROM THE SIGNED BYTES and from nothing else, and **there is no signature over
   a case** for those facts to move to; the container says so in its own words. Removing them without
   first minting a case-level signing ceremony would leave the plane committing a group's case
   assertions from an UNSIGNED REQUEST. That ceremony is a second publication ceremony and is larger
   than the rest of CASE-5 combined. **Raised to CONDUCT as the remaining half.**

7. **MULTI-CASE MEMBERSHIP — REFUSED BY CASE-5, MEASURED BY CASE-6, BUILT BY D-309 (2026-09-10).**
   This entry read *"STILL REFUSED … lifting the fence is a surface question (which case does a
   finding id resolve to) and belongs with CASE-6"*. It is kept rather than deleted because **that
   framing was measured WRONG and the correction is the useful half**: CASE-6 counted the class and
   found 11 sites in `store.mjs`, 9 of them SCALAR readers correct only while the fence held, so it
   KEPT the fence and enqueued the plane half as D-309. D-309 corrected all nine — each decided at
   its own site — minted `CASE_IDENTITY_AMBIGUOUS` (C-44.1) for the derivation that could no longer
   be determinate, and removed `FINDING_IN_ANOTHER_CASE` and `FINDINGS_IN_DIFFERENT_CASES` LAST.
   Wire change: **IC-74**. `caseflip.test.mjs`'s pin was CORRECTED, never exempted, and now drives a
   finding published into two cases end to end; `multicase.test.mjs` re-runs the census every battery
   and asserts zero scalar readers remain.

**WHAT IS STILL OWED BY THE ARC** (CASE-4, CASE-6 and the arc's definition of done) is in `QUEUE.md`
and `CASE-AS-PRODUCTION.md`; nothing in this item touches `docs/BIO_DATAPLANE_STATE.md`, which the
arc binds to CASE-6.

## CASE-4 landed 2026-09-10 (worktree `agent-a2cabbd5225deffd5`) — `published` leaves the inquiry state machine, and what carries the rules it was carrying

**READ THIS BEFORE TOUCHING ANY GUARD THAT USED TO ASK `current_state === "published"`.** There
is no such state on a newly published finding. DEC-72's design: *"A finding's lifecycle ends at
`concluded`; publication is the case relation."*

1. **THE ONE PREDICATE IS `#caseRelationOf(bundleId)` AND THERE IS EXACTLY ONE OF IT.** It answers
   by the PIN — `published_case_members.version_sha = bundles.bundle_sha` — which is CASE-5's own
   mechanism read from the member's side, so the case relation and the revision flag are ONE
   comparison over ONE column in two directions. It has two arms: PINNED (the ratified relation)
   and PREPARED (the window between `op=publish` and `op=ratify`, read off the document's own
   `case_id` + `case_edition` pair, and a REFUSAL INPUT ONLY — nothing commits a case fact from
   it, which is what keeps it clear of CASE-5b's wall). Do not add a second way to ask this.

2. **A RULE THAT RODE ON THE EDGE TABLE DIES WITH IT, SILENTLY, AND FOUR DID.** This is the lesson
   worth carrying out of the item. An array entry can enforce two rules at once, and deleting it
   deletes both while the suite stays green. Found by RUNNING the suites, not by reading:
   `op=dispose` (a published case could be deferred — D-79 reversed), `op=publish` (a second
   edition of unchanged bytes), `inquirydivide`'s affordance (offered where the op refuses — DEC-8),
   and `checkCompletenessFreshness` (C-21.1 stops firing on EVERY document). Each is now a named
   refusal or an explicit predicate: `PUBLISHED_CANNOT_BE_SET_DOWN`, `ALREADY_A_CASE_MEMBER`,
   `NOT_CONCLUDED`, `!f.case_member`.

3. **`op=affordances` NOW SERVES `case_member`, and four acts derive from it** — `publish`,
   `reopen`, `dispose`, `inquiryground`, `inquirydivide`. It is a FACT and never a rule; the rules
   stay in `affordances.mjs`. If you add an act that used to key on the state word, key it here.

4. **`op=reopen`'s GATE IS A DISJUNCTION** — a disposition OR the case relation. `REOPENABLE_FROM`
   lost `published` and did NOT gain `concluded`: REC-31's rule that a conclusion nobody published
   may not revert to open still wearing its conclusion is preserved exactly where it was aimed.

5. **THE REVISION FLAG IS SET AT THE MINT AND NEVER CLEARED.** `#flagCasesOnRevision` is called
   from `promote()` — the one write that mints a version — with the sha being replaced. Nothing in
   the plane DELETES a flag row except `op=purge`'s sweep (D-113). The discharge is a new RATIFIED
   edition of that case, scoped to `case_id` and nothing wider, which is D-266's ruling made
   structural. **Do not add an acknowledgement op**: a bare acknowledgement would commit a
   case-level assertion from an UNSIGNED REQUEST, which is CASE-5b's wall.

6. **`published` SURVIVES IN `STATES.inquiry.legacy`, READ BY `checkStateLegality` AND BY NOTHING
   ELSE.** Ratified bytes are immutable and a store that has published anything holds frontmatter
   saying it. Every other reader — the affordance derivation, the transition guards, `edgesFrom` —
   sees only `legal`. Do not fold `legacy` into `legal`.

7. **THE STATE RULES AMENDMENT IS IN `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`**, as a
   dated amendment section at the foot, on the precedent of the declared-bias cross-reference note
   above it. §4 owns the per-type machines; the catalog remains the authority for the edge set.

8. **A PRE-EXISTING DEFECT THIS ITEM DID NOT FIX AND MUST NOT BE BLAMED FOR:
   `action-loop.test.mjs` FAILS ON EVERY TREE FROM 2026-09-10 ONWARD.** Its fixture hard-codes
   `DUE = "2026-09-10"` as a "future" date and the wall clock reached it; six assertions draw
   C-11.1's silently-past-due finding. **Moving the constant forward re-arms the bomb** — the
   suite owns an injected clock and the date should be derived from it. ACTION's ground, not
   RECORD's; measured and reported to CONDUCT.

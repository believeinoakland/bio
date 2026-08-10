# Session SKILL — the doctrine and judgement layer of the investigative session

Activated 2026-08-10 by CONDUCT, into the slot UI-53 freed when its status was corrected
from `running` to `done`. Read `CLAUDE.md` first, then this, then your item's row in
`IS-BUILD-PLAN.md` (**the plan is the authority for SCOPE**; `QUEUE.md`'s SKILL section
carries STATUS and dependency and nothing else). Before making a change another session
must know about, read `ORCHESTRATION.md`, "COMMUNICATING A CHANGE". Before raising any
question, run `node tools/decided.mjs "<the subject>"` — 610 rulings, and only 12% of them
are in `DECISIONS.md`.

Design sources, in authority order: `IS-BUILD-PLAN.md` §SK rows, `INVESTIGATIVE-SESSION.md`
(§5 composition, §9's five kinds, §14 bias, §14b.4 the fence rule, §2 CHECK-first),
`IS-SWEEP-2026-08-07.md` §3 (the PRACTICE-SURVEY prohibitions) and §4b.7,
`PRACTICE-SURVEY.md` itself, and `DECIDED.md` for anything already ruled.

## The one thing that makes this area different, and it is not a style note

**A SKILL MAY NEVER HOLD A GATE.** Loop bounds, fan-out counts, pass counts, loop
termination, the investigate-mode gate — every one of them lives in FL-3's deterministic
control-flow table, which is CODE and is landed. This area writes doctrine and judgement;
it writes no control flow and no fence. §14b.4 names a gate-in-a-prompt as the defect, and
it is the failure this whole track is shaped to avoid.

The practical test, applied to every sentence you write: **if a malicious or careless model
ignoring this text could get past something, that something is not in this file — it is in
FL-3's table or in a C-number.** Write the judgement; cite the fence.

## Paths this area owns

- the skill / doctrine pack that SK-1 landed, and its versioned successors
- its own tests and fixtures
- `docs/development/kickoffs/SKILL.md` (this file)
- `docs/development/CLAIMS.md` (your claim entry), `docs/development/MEASUREMENTS.md`
  (appended)

**NOT** `bio-plane/src/**`, **NOT** `bio-plane/checks/**` (a prohibition's CODE half is a
C-number and belongs to the plane — SK-3 cites `PL-3`'s landed boilerplate check rather
than adding one), **NOT** `civicos-ui/**`, **NOT** `agent-worker/**`, **NOT**
`docs/development/QUEUE.md` (CONDUCT is its only writer), **NOT**
`docs/development/IS-BUILD-PLAN.md`. Claim your paths in `CLAIMS.md` before editing.

## The items, in order

**SK-2 first — it is the top of the track and nothing blocks it** (SK-1 is landed on
`main`). Then SK-3, then SK-4. Read each row's `accepts-when` and `NC` from the plan; they
are not restated here, because a second copy starts rotting the day it is made.

The three constraints most likely to be got wrong, carried here because they are judgement
calls a worker would otherwise smooth over:

- **SK-2 — grades are COMPOSED, never MINTED**, and **the model NEVER decides when the loop
  stops** (TREC 2011, +95/−87). It decides what to SEARCH. The four-level search must state
  WHICH absence it hit per level: *no meaning derived*, *nothing extracted*, *no document*,
  *nobody looked* are four different facts about the record and must not read alike
  (`CLAUDE.md`'s sparse-at-every-level rule). Bias minimisation sits ON TOP of the fence,
  never instead of it.
- **SK-3 — the five prohibitions go in VERBATIM.** The sharp one is *no generated
  justification anywhere*: a generated justification is a fabricated attribution, which is
  the overclaim class this project ranks worst. The ONE permitted auto-composition is
  assembling the member's OWN prior words. Its negative control is the proof the fence is
  code: a placeholder-text description submitted through `PL-3` must be refused BY C-NUMBER
  while the skill-only path would have passed it.
- **SK-4 — CHECK deploys first**, against an EXISTING conclusion, read adversarially and
  aimed at self-directed overclaiming, which `CLAUDE.md` names as the primary threat model.
  **SK-4 RECORDS the sequencing; the gate itself is a row in FL-3's table and must not be
  re-implemented here.** Investigate-fresh enables only after CHECK's first live run is
  verified — that is VF-4, which waits on DS-4, which is DIST's lane and not yours.

## Verification

`node tools/gates.mjs` classifies the diff and runs the right profile. If your change is
entirely prose under `docs/`, that is the doc-facing suites plus `plancheck`; ONE non-docs
path and it runs the full four. Do not judge the profile by eye — the tool measures it.

The standing gate, when it is owed: `cd bio-plane && npm run test:battery` green with every
suite reported; **the negative control RUN and recorded** in the suite's own
`NEGATIVE CONTROL:` line; `node scripts/coverage.mjs --strict` run DIRECTLY with `$?` read
UNPIPED (a pipe reports the pipe's status, and a failed strict run has already been
recorded as a false `exit 0` here once).

**Measure your own baseline and trust it over any figure in a brief**, including the ones
in this file. Attribute any delta per suite by re-running the baseline, never by
subtraction.

## What goes back to CONDUCT, and what goes to Bob

Raise a DELEGATION in `CLAIMS.md` for anything outside your paths — do not reach into
another area's ground. Genuine doctrine questions go to `DECISIONS.md` **after**
`decided.mjs` says the corpus has not already answered them; most of them have. Nothing
here is a reason to stop: state the provisional you are running under and keep going.

## SK-2 — LANDED 2026-08-10. What SK-3 starts from.

Read the plan row for scope; this records only what EXISTS now, so SK-3 does not re-derive it.

**The doctrine lives in `bio-plane/src/skilldoctrine.mjs`**, a SIBLING of SK-1's pack rather
than a section of it. SK-1's deliverable is SOURCING (every vocabulary driven or imported);
SK-2's is DOCTRINE (authored prose held to a different defence). Two deliverables, two
suites, and `skillpack.mjs` composes them: `disclosedLayers()` spreads `judgementLayers()`
in, so a layer added in the doctrine module reaches the pack — and the pack's VERSION —
without an edit in the pack.

**The shape SK-3 should extend rather than reinvent.** A clause is
`{ id, area, judges, decides, defers, enforced_by, unenforced_because, why }`:

- `judges` names rows of §14b.4's table RIGHT column, `defers` names rows of its LEFT
  column, and both columns are **PARSED OUT OF `INVESTIGATIVE-SESSION.md`** by
  `skilldoctrine.test.mjs`. The skill's authority is exactly the right column — measured,
  in both directions, so a clause claiming ground the design did not grant fails (ARM B1)
  and a deterministic row no clause hands back fails (ARM B2).
- `decides` is SCANNED by `controlFlowAuthority()` for control-flow authority — a bound, a
  termination condition, or a decision about either. `defers` is NOT scanned, deliberately:
  that is where a deferred subject is legitimately named.
- **`enforced_by` holds C-numbers read off catalogue rows BY KEY, so no number is typed**
  (the one exception is `C-2.8`, which has no keyed row because the hunch arms push it at
  the call site; it is named as the exception and pinned by ARM D4).
- **A clause with no code behind it must carry `unenforced_because`** and the suite PRINTS
  how many clauses are instruction-only. **Measured at SK-2: 3 of 10.** That number is how
  much of this skill a careless model could ignore, published rather than implied — keep it
  published when you add clauses.

**Three things SK-3 can reuse directly.** `controlFlowAuthority` (exported); the table
parser and the doc-pin normaliser in the suite; and `skilldoctrine.control.mjs`, whose arm
shape (`mustFail` / `mustNotFail` fragments, restore verified by content AND sha256) is
where SK-3's own control belongs.

**Two things SK-2 did NOT do, stated rather than left to be discovered.**

1. **The recipe layer is still declared EMPTY.** SK-1 wrote "SK-2's to fill"; SK-2 did not
   fill it, and the reason is unchanged and is now written into `skillpack.mjs`'s header: a
   recipe is worth carrying only if a step naming a surface that does not exist FAILS THE
   BUILD, and no plane op publishes the surface registry. It waits on a published registry,
   which is an interface item and not a skill one.
2. **The second half of SK-2's accepts-when is not checkable yet and is not pretended to
   be.** The row asks that *"a sampled run's descriptions name their ungraded legs"*; there
   is no run to sample until VF-4. The suite asserts the description STANDARD and the code
   that refuses a boilerplate description, prints that limit in BLOCK G every run, and
   claims nothing about any run's output. The plan already records this as becoming
   checkable at VF-4.

**One DELEGATION is open and SK-3 met it too:** the four levels are spelled two ways —
`OBSERVATION_LEVELS` has `document`, `SUGGEST_LEVELS` has `documents` — so a run writes one
into its log and the other into its `level-empty` suggestion. `reportsAs()` bridges them by
derivation and ARM E7 holds the bridge in both directions. The rosters are `airun.mjs` and
`bio-checks.mjs`, both outside this area. See `CLAIMS.md`.

## SK-3 — LANDED 2026-08-10. What SK-4 starts from.

Read the plan row for scope; this records only what EXISTS now, so SK-4 does not re-derive it.

**The prohibition set lives in `bio-plane/src/skilldoctrine.mjs` beside SK-2's clauses**, as
`PROHIBITIONS` (five) and `PERMITTED_AUTO_COMPOSITION` (one — the carve-out to the first
prohibition, not a sixth rule). It renders as a sixth judgement layer, `prohibitions`, which
reaches SK-1's pack through the same `judgementLayers()` spread SK-2 built. No change was
needed in `skillpack.mjs`, which is what that design was for.

**The shape, and SK-4 should extend rather than reinvent it.** A prohibition is
`{ id, text, because, source, also_named_in, in_practice, enforced_by, does_not_reach,
unenforced_because? }`:

- **`text` and `because` are VERBATIM SPANS of a document** — `PRACTICE-SURVEY.md` for four,
  `INVESTIGATIVE-SESSION.md` §14b.5 for the boilerplate one — and the suite LOOKS EACH ONE UP
  in the file it came from through SK-1's normaliser. A session cannot verify its own copying
  by re-reading it, so "verbatim" is a lookup and never a discipline.
- **`also_named_in` is the DESIGN document's shorter restatement, and the set is pinned a
  SECOND time through it.** The design's own sentence is semicolon-delimited and is PARSED;
  every segment must be claimed. This matters more than it sounds — see the finding below.
- **`enforced_by` holds C-numbers read off catalogue rows BY KEY** (SK-2's rule, unchanged),
  and **`does_not_reach` is REQUIRED ON EVERY PROHIBITION, INCLUDING THE ENFORCED ONES.**
  That is SK-3's one addition to SK-2's honesty rule and the reason is measured rather than
  stylistic: all five of these are enforced PARTIALLY, and a partial fence read as a whole one
  is worse than an unenforced one read as unenforced. `isBoilerplate` states its own limit at
  its own site; a prohibition citing it may not inherit its authority without its limit.

**THE INSTRUCTION-ONLY FIGURE, PUBLISHED AND MOVED.** SK-2 measured 3 of 10 clauses. SK-3
adds five prohibitions of which **1 is instruction-only** (connection-density — nothing in
this plane computes a degree or a centrality, so there is nothing to refuse yet and the
prohibition says so). **The skill as a whole is now 4 of 15 doctrine items with no code at
all**, printed by `skillprohibitions.test.mjs` every run, alongside the residue every one of
the other 11 states. Keep all three figures published when you add anything.

**THE ASYMMETRY IS RUN, NOT ARGUED, and it is BLOCK D.** The row's negative control is a
placeholder description submitted through `op=suggest`: refused `SUGGEST_BOILERPLATE` /
`C-27.12` naming the field, while the same submission with a real description LANDS. Stated
as *"the skill-only path would have passed it"* that is nearly unfalsifiable, so it is
asserted as a DISCRIMINATION instead — the skill-only path answers IDENTICALLY for both
inputs and the code path answers DIFFERENTLY, both measured through the same two functions.
**`skillprohibitions.control.mjs` arm (1) removes the fence and NAMES ELEVEN SKILL-SIDE ARMS
THAT MUST STAY GREEN**; all eleven did. `mustStayGreen` is SK-3's addition to SK-2's arm
harness, because an asymmetry nobody stated is an asymmetry nobody measured.

**THE FIFTH PROHIBITION'S CODE HALF IS PL-3's AND SK-3 ADDED NONE.** No second check, no
second predicate, no typed C-number, no copy of the roster or of the canned translation — ARM
D5 measures that over the doctrine's CODE with the estate's own lexer (`declared-source.mjs`'s
`codeOnly`, imported, never a third copy).

**THE FINDING SK-4 SHOULD CARRY, because it is the same shape twice in two items.** ARM A5
was FIRST WRITTEN BLIND: *"every prohibition's `also_named_in` appears in the design
document"* cannot see a DROPPED prohibition at all, because the expectation was derived from
the array under test and both sides move together. It was found by running control arm (3),
exactly as SK-2's arm (5) found its own blind assertion. **When an arm's expected value is
computed from its own subject, it is measuring nothing.** The repair was to PARSE the design
document's own list and make the document the expectation.

**Two things SK-3 did NOT do, stated rather than left to be discovered.**

1. **The recipe layer is still declared EMPTY** — unchanged from SK-2, and for SK-2's reason:
   it waits on a published surface registry, which is an interface item and not a skill one.
2. **Prohibitions 3 and 4 have residues NO PLANE CHECK CAN EVER REACH, and they are the
   SURFACES' obligations rather than gaps here.** Whether a rendering rewards connection
   density, and whether a suggested version LOOKS derived (D-82), are facts about
   `civicos-ui/**` and no check in the plane can see a rendering. Both are stated in
   `does_not_reach` rather than smoothed over. If SK-4 or a UI item wants them enforced, the
   fence belongs beside the rendering.

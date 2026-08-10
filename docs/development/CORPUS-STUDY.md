# The corpus: what the record knows, and what a consolidation can safely do

Written 2026-08-10 by session BOB, at Bob's direction — first as a study of the design
knowledge captured in this repository, then, on his follow-up, as the basis for
consolidating it. **The measurements below were taken, not recalled**, and the commands
that took them are named so the next session re-runs rather than re-derives.

This document is itself a working surface. When the consolidation it specifies has been
executed it should be archived, not maintained.

---

# PART 1 · THE STUDY

## 1.1 The corpus is four bodies of writing, not one

**7.4 MB — roughly 1,950,000 tokens — across 96 files.** They are not one kind of document
and the distinction is the whole basis of what can safely be consolidated:

| body | size | what it is | how it changes |
| --- | ---: | --- | --- |
| **LEDGERS** — CLAIMS, QUEUE, DEBT, MEASUREMENTS, DECISIONS, INTERFACE-CHANGES | **4.3 MB · 58%** | append-only operational history | append-only, forever |
| **DESIGN PASSES** — `docs/development/research/` | 0.9 MB | thirteen dated passes from 2026-08-01/02 that worked out case-making. **A pass is a record of what it concluded.** | never — corrections live elsewhere |
| **LIVE SURFACES** — `docs/development/*.md` | 1.2 MB | the surfaces sessions read and write now: MILESTONES, INTERFACES, STORE-AS-CACHE, NOTIFICATIONS, the kickoffs | continuously |
| **DOCTRINE** — `docs/architecture/` | 0.6 MB | what BIO is and why. Written to be citable on its own by someone deciding whether to adopt or extend it. | on human decision |

**MEASURE THIS CORPUS IN BYTES, NEVER IN LINES.** An earlier draft of this document said
"76,867 lines" and drew the wrong conclusion from it, because the ledgers hold enormous
single-line table rows: `DEBT.md` averages **1,604 characters per line** and its longest
row is **9,408 characters** — one debt row is 2,400 tokens. `DEBT.md` reads as a 337-line
file and is half a megabyte. Line count understates the ledgers by roughly a factor of two
and is the metric that made this look like a tidiness problem.

## 1.2 The spine of the design, in one pass

**The value layer** (`BIO_Design_Requirements_v2`) — four core values, eight operational
principles, fifteen requirements. Load-bearing by name throughout: R1 fully distributed
(*"a framework people adopt, not an organization people join"* — administrators are
custodians, the protocol is the authority), R2 identical at every scale and *genuinely
useful to one person with a few hours a week*, R4 quality by publishing standard rather
than gatekeepers, R5 each group keeps its own accepted body of work with **forks at the
judgment layer legitimate and forks at the fact layer a reproducibility bug**, R13 the
system must function under active opposition, R14 no single point of failure.

**The stance, and it is doctrine** (`CLAUDE.md`, from Bob 2026-08-01): better government
through greater understanding, less narrative, and accountability. All stakeholders are
assumed to want better outcomes; bad actors are real and are **identified by evidence,
never assumed by role** — which is why the subject registry may carry no adversarial
attribute. *"Less narrative" is a constraint on us, not only on them.*

**The threat model is symmetric and its more dangerous half is ours.** Someone may damage
a publisher; someone may also claim far past what the evidence supports. Reading the
codebase against that: almost every hard-won rule defends against the second —
`undetermined` is first-class and must be stated, an equality that costs nothing to
produce is not evidence, grade tracks directness, the publication fence, the refusal to
invent an attribution to pass a gate. **The primary threat model has always been
self-directed.**

**The functional layer** (`BIO_Functional_Architecture_v3`) — three *concurrent* layers,
Information / Analysis / Action, with eight skills, five of them in Information because
that is where the labour and the AI leverage are. Beneath them, one write authority.

**Bob's build framing**, added 2026-07-27 and the sequencing that actually governs: L1 is
the data plane (the foundation), L2 the analysis layer consuming it as services and
working inside a FOCUS under the declared bias, L3 the UI surfaces. Foundation until it
is complete enough, then the UI, then fill in across all three.

**The technical layer** (`BIO_Technical_Architecture_Decisions_v10`) — designed against
two compounding facts: the build is contracted and maintainers may be non-technical, so
**bus factor is the dominant risk**; and AI capability and pricing are in continuous
transition, so the system is designed for the transition rather than today's convenience.
The decisions that survived everything since: canonical identity with **substrate
locators never linking objects** (they die on the first mirror); lifecycle in frontmatter
only; accretive store with gated, cascading deletion; **source-grounding rather than
self-containment** (*the argument is a tree whose leaves are credible primary sources; you
do not re-derive a primary source*), machine-checked as the citation register; **two
evaluations** — compliance (well-formed) and argument (sound); **no transitive trust**,
made tractable precisely by source-grounding, so verification is one hop and there is no
infinite regress; and **the Mechanical Verification Law** — *a correct prose contract does
not reliably produce conforming output; only a mechanical check run against the written
artifact does.*

**The collapse** (`BIO_Case_Making_v0_1`, Bob 2026-08-01) is the largest conceptual event
in the record. Bob asked why focus, finding and case must remain different; no sufficient
reason survived. Every defence reduced to a state or a field rather than a type. The
result: **one recursive object, the INQUIRY** — a question, which may gather evidence and
other inquiries, may reach a conclusion, and may be published as something the group
stands behind. `inquiry` / `finding` / `case` are member-facing names for three phases of
one object. The member-facing set became four: **information · inquiry · action ·
project** — evidence, claim, engagement, workspace.

What the collapse had to preserve, and this is the sharpest doctrine in the corpus: **a
case makes a COMPLETENESS CLAIM and a finding does not.** A published finding that is
true but selectively chosen is not a lie at the finding level and *is* a lie at the case
level. No gate can verify completeness — so the record does what it does with everything
it cannot establish: makes it **visible, attributable and stated**, with what was excluded
named by its author and never prefilled.

**The framework layer** (`BIO_Content_Framework_v0_10`) — capture → profile → reading →
observation, with entities resolved *across* readings, and nine invariants, of which three
carry most of the weight: *the failure asymmetry governs every default* (a missed change
puts a false claim in the record; when uncertain, be noisy); *goal-directed work must not
become goal-directed collection* — **the invariant most likely to be violated by accident,
because helpfulness looks exactly like it from the inside**; and *derived things inform,
authored acts bind*.

**The interaction layer** (`BIO_Interaction_Constructs_v0_1`, at v0.2) — two constructs
(QUEUE and ACT), one ladder (reversible · reasoned · terminal · attested · **irreversible**),
one primitive (`undetermined`). The rung ladder is no longer prose only: the plane
publishes it and a test asserts that every mutating op either carries a rung or names the
ground on which it has none.

## 1.3 The one discontinuity a reader must be told about

**The doctrine corpus specifies Google Drive bundles written by an Apps Script accelerator.
The built system is a Cloudflare Worker plus a Durable Object with SQLite and R2.** The
substrate was replaced; the doctrine was kept. `architecture/README.md` records this for
one document (*"superseded implementation, inherited format — read it for the format and
the checks, not the runtime"*) and **nowhere else**. So a reader who opens
`BIO_Technical_Architecture_Decisions_v10` — 1,815 lines, the single largest architecture
document — reads ten pages about Apps Script endpoint admission and live-fire dates in
July 2026, with no marker saying the runtime underneath it is gone.

This is the corpus's largest correctness defect and it is a one-line fix per document.
It is not a consolidation; it is a repair, and it should happen first.

---

# PART 2 · WHAT WAS MEASURED

Four measurements, each re-runnable.

**M1 · Verbatim duplication is 1%, and it is not the problem.**
Of 20,068 distinct sentences of 70–400 characters across all 96 documents, **202 appear
verbatim in two or more files** — 420 instances total. 138 of those 202 are
`BIO_Membership_Architecture_v1` against `v2`, a superseded document deliberately retained.
Strip that pair and **64 duplicated sentences remain in the entire corpus**, nearly all
boilerplate headers: the Focus-rename editorial note (8 files) and the kickoff
coordination line (7 files).

**M2 · The redundancy is by REFERENCE, not by copy.** A single ruling is named in up to
nineteen distinct files (DEC-46 and DEC-10 in 19 each; DEC-49 in 17, DEC-32 and DEC-20 in
16). Nothing restates them — they point. That is the corpus working as designed, and it is
also why it feels like repetition to read.

**M3 · 58% of the corpus is closed operational history, in the files sessions open first.**

| file | size | tokens | state |
| --- | ---: | ---: | --- |
| `CLAIMS.md` | 1.72 MB | **440 k** | 220 claims, effectively all released |
| `QUEUE.md` | 931 KB | 238 k | 207 items: **184 done**, 11 superseded, 8 queued, 3 blocked, 1 active |
| `DEBT.md` | 532 KB | 136 k | 280 rows, 172 open — **live; roll only the closed rows** |
| `MEASUREMENTS.md` | 468 KB | 120 k | append-only, 203 dated entries |
| `DECISIONS.md` | 411 KB | 105 k | 65 entries: 5 open, 3 deferred, 57 answered/enacted |
| `INTERFACE-CHANGES.md` | 252 KB | 65 k | 52 IC entries, 3 still PROPOSED |

**`CLAIMS.md` alone does not fit in a context window.** A session that opens it to check
whether a path is claimed spends 440,000 tokens to read 220 claims that were all released.

**M4 · Orientation costs more than a context window.** The files `CLAUDE.md` and the
kickoffs instruct a session to read before it may work — CLAUDE.md, its kickoff,
ORCHESTRATION, PARALLELISM, VERIFICATION, MILESTONES, QUEUE, DECISIONS, DEBT, INTERFACES —
total **2.26 MB, about 565,000 tokens**. A CONDUCT session cannot read its own required
reading list. It never could. What actually happens is that it reads some of it, and the
rest of the record is invisible to it.

**M5 · 88% of rulings are not in the decisions file.** 351 lines across the corpus carry
a `RULED` / `DECIDED` / `AMENDED` / `CORRECTED` / `OVERTURNED` marker. **43 are in
`DECISIONS.md`. 308 are somewhere else** — 66 inside `CLAIMS.md`, 28 in
`INTERFACE-CHANGES.md`, 23 in `RECONCILED.md`, 20 in `INVESTIGATIVE-SESSION.md`, and the
rest scattered through the architecture documents and the kickoffs.

**M6 · 17,689 lines are superseded passes or closed history** — the storyboards
(`SB-CORE`/`SB-EVIDENCE`/`SB-OUTPUT`, superseded by `RECONCILED.md`), `BUILD-ORDER`,
`CRITIQUE`, `PROBLEM-DOMAIN` and the rest of the research directory, `PLAN.md` (closed
history by `CLAUDE.md`'s own statement), `Membership v1`, and three dead kickoff files.

## The finding that reframes the request

The two failures Bob named — *sessions choke on the volume*, and *sessions re-ask
questions already decided somewhere unread* — are M3/M4 and M5, and they are different
problems needing different fixes.

**The record is not rambling with duplicated positions.** Verbatim duplication is 1% (M1).
Rewriting prose would spend effort against that 1% and would put dated rulings at risk.

**It is carrying its entire operational history in the files sessions open first, and it
has no index of what it has already settled.** Those are the two things to fix:

1. **Volume** is closed by SEPARATING THE CLOSED FROM THE LIVE. Nothing is edited, only
   moved, so no reasoning is at risk. This is what the corpus's own doctrine already
   prescribes — `research/README.md`: *"Research passes are not edited after the fact.
   They take a pointer; the correction lives in a live surface."*
2. **Re-litigation is closed by an INSTRUMENT, not by a tidier corpus.** A session
   re-asks a settled question because it cannot afford to read the file the answer is in
   — and after any consolidation it still will not be able to, because 308 rulings will
   still be scattered across 30 documents. Making the corpus smaller does not make a
   ruling findable. **An index does, and it must be generated rather than curated**, or it
   becomes the 97th document nobody reads. This project's own most-repeated finding
   governs: *close the class with an instrument, not a reminder.*

---

# PART 3 · THE PLAN

Five moves, in order. Each is reversible (git keeps everything) and each ends green.
**Move 0 is the one that answers the complaint**; the rest reduce the volume it has to
work over.

## Move 0 · `tools/decided.mjs` — make a settled question answerable without reading

**BUILT AND LANDED 2026-08-10; the rest of this plan is not yet executed.**

The whole corpus is scanned for ruling-bearing statements and emitted as **one generated
file, `docs/DECIDED.md`** — one line per ruling: the id, the date, the ruling in the words
it was ruled in, and `file:line`. Measured: **585 rulings across 53 documents, 161 KB —
40 k tokens against the 1,950 k the corpus costs, one forty-eighth.** Plus a query mode a
session runs before raising anything:

    node tools/decided.mjs "bias debt"      # every ruling touching a phrase
    node tools/decided.mjs DEC-32           # one ruling and where it lives

Four properties, and each is load-bearing:

- **GENERATED, never authored.** A hand-maintained index is the 97th document that rots,
  and this record's most-repeated finding is that a hand-carried fact goes stale silently.
  It regenerates from the corpus; it cannot drift from it.
- **It scans `docs/archive/**` too**, so archiving a document does not hide its rulings.
  This is what makes Moves 2 and 3 safe rather than lossy.
- **It quotes rather than summarises.** A summarised ruling is a second statement of the
  fact, which is the defect class D-21/DEC-8 already names. The index carries the sentence
  and a pointer; the authority stays where it was.
- **It goes in the loop the reader actually runs** — `CLAUDE.md` and each kickoff — because
  a mechanism that is not in that loop is not a mechanism. The line is: *before raising a
  question or writing a decision item, run `decided.mjs` over its subject.*

Drift check for `plancheck`: regenerate and fail if the committed `DECIDED.md` differs
from the generated one, exactly as `check-versions` treats version stamps.

## Move 1 · Repair the substrate discontinuity — ~30 lines changed

A dated status banner at the head of every architecture document whose runtime is gone,
naming what survived and what did not, on the model `architecture/README.md` already uses
for the Bundle Skill design. **Nothing is deleted and no reasoning is rewritten.** This is
the highest value change in the whole plan and the cheapest.

## Move 2 · Archive the closed passes — 17,689 lines out of the working tree

Destination `docs/archive/<original-path>`, with a single `docs/archive/README.md` saying
what each file was, when it closed, and what superseded it. **`docs/archive/` is a sibling
of `development/` and `architecture/`, which is deliberate**: `planning-hygiene.test.mjs`
walks exactly those two directories recursively, so an archived document leaves the walk
without the walk being weakened.

**Six of the candidates are mechanically referenced and must NOT move in this move:**
`research/DATA-MODEL.md` (27 references from tools and tests), `research/SB-EVIDENCE.md`
(5), `research/COMPLETENESS-AUDIT.md` (2), `PLAN.md` (in `mintid`'s corpus), plus
`IS-BUILD-PLAN.md` and `INVESTIGATIVE-SESSION.md`, which are live. Either their consumers
move with them or they stay. **Measure before each move; do not trust this list to still
be true.**

## Move 3 · Roll the ledgers — ~13,000 lines out of the read path

Not deletion and not summarisation. Each ledger keeps its live rows and its rules, and its
closed rows move to `docs/archive/ledgers/<NAME>-2026-08.md` with a pointer both ways:

- `CLAIMS.md` → keep held claims and the rules; archive 220 released claims
- `QUEUE.md` → keep the 23 non-done items, the inbox and the operating rules; archive 184 done
- `INTERFACE-CHANGES.md` → keep the 3 PROPOSED and the protocol; archive 49 resolved
- `MEASUREMENTS.md` → keep every figure a document still cites; archive superseded runs
- `DECISIONS.md` → **keep whole.** 65 entries is not a volume problem, and the file is the
  record of what was asked as much as what was answered.
- `DEBT.md` → **keep whole.** 172 of 280 rows are open.

## Move 4 · One authority per fact

For the handful of facts genuinely stated in two places (M1's 64), keep the one whose owner
performs the act and replace the other with a pointer. The kickoff coordination line and
the Focus-rename note are the two real instances and both are boilerplate.

## The hazard that governs the whole plan, and the instrument that closes it

**`tools/mintid.mjs` derives each namespace's id floor by reading the highest id MENTIONED
in a prose corpus** — `DECISIONS.md`, `QUEUE.md`, `CLAIMS.md`, `DEBT.md`,
`INTERFACE-CHANGES.md`, `INTERFACES.md`, `IS-BUILD-PLAN.md`, `MEASUREMENTS.md`,
`MILESTONES.md`, `PLAN.md`, `UI-PLAN.md`. The exclusive-create ledger that sits above it
is **not committed**, so a fresh clone re-derives its floor from the corpus alone.

**Therefore moving prose that mentions a high id LOWERS the floor, and the next fresh clone
re-issues an id that is already in use.** That is this project's characteristic failure —
an instrument answering about itself — arriving through housekeeping. Renumbering afterwards
is the expensive repair `mintid`'s own header prices and rejects.

Two things close it, and neither is a reminder:

1. **Add `docs/archive/**` to every `mintid` corpus.** An archived mention still counts,
   the floor cannot fall, and the change is one line per namespace.
2. **Pin the floors first.** Record each namespace's floor before Move 2 and assert it after
   every move, in a test that fails when a floor drops. Written to fail when the defect
   occurs, which is the pin discipline the estate already runs.

Run before and after every move: the full battery, `node scripts/coverage.mjs --strict`
read unpiped, `node civicos-ui/test/run.mjs` from the repo root, and `node
tools/plancheck.mjs`. `plancheck` reads a fixed list — QUEUE, MILESTONES, INTERFACES,
DEBT, DECISIONS, `kickoffs/README.md`, `kickoffs/BOB.md`, `kickoffs/CONDUCT.md` and every
area kickoff — **none of which may move at all.**

## What this costs and what it buys

Roughly **31,000 of 76,867 lines leave the working tree** and none leaves the repository.
What a session reads to orient itself drops by about 40%, the doctrine corpus stops
describing a runtime that no longer exists, and the ledgers stop growing without bound in
the files sessions open first.

**What it does not buy, stated so nobody expects it:** the doctrine documents stay long,
because they are long for a reason — they argue rather than assert, and the arguments are
what make the rulings re-derivable. Shortening those would cost the property the record was
built for.

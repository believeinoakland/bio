> **Built as CONSTRUCTS, not as forty screens**
> (`architecture/BIO_Interaction_Constructs_v0_1.md`, at Bob's direction). Forty
> screens is forty things for a non-technical member to learn; the construct set is
> what makes each new capability arrive already familiar.
>
> **v0.2, after Bob challenged the count.** The first pass derived seven constructs
> from SYSTEM properties, which conflated two different numbers: how many shapes the
> MEMBER learns, and how many types the MODEL holds. They are not the same, and the
> model may hold several types inside one construct.
>
> **TWO constructs, one ladder, one primitive.** **QUEUE** — things that want me; one
> list, items typed by what they offer (dispatch an obligation, or judge something the
> system noticed). **ACT** — doing something to a record or a set; one motion: choose,
> see what it will refuse BEFORE it runs, author the reason, get a receipt. Ballots are
> acts whose status shows a tally; bulk is the same act scoped to a selection. **THE
> WEIGHT LADDER** is a property of every act, visible and escalating — reversible ·
> reasoned (never prefilled) · terminal · attested (irreversible, public, needs a key).
> **UNDETERMINED** is a display primitive rendered identically everywhere.
>
> Collapsing is not free and the tradeoff runs both ways: attestation stays
> DISTINGUISHABLE as the ladder's top rung, because members arrive with a real model
> for signing that a generic form violates, and because flattening the weight would
> make dismissing a focus and publishing a document the same motion — a doctrine
> failure wearing a usability improvement.
>
> Every accountability rule from v0.1 survives, attached to the TYPE rather than to a
> separate construct. **Falsifiable:** build the queue and one act; if the next three
> capabilities each need a bespoke surface anyway, the collapse was wrong.
>
> Build order inside M8: the **queue** first (attention layer, sharpest gap, plane half
> ships), then the **act** at the reasoned rung (U5 already built one instance —
> generalising it unlocks dispose/sever/reinstate/retire together, and makes the S-12
> governance ballots reachable), then selection scoping, then the attested rung on the
> crucial path.

# Milestones: the capability ladder, and where every open piece of work sits

Established 2026-07-31 (session BOB), at Bob's direction, after an audit found that
forward-looking work lived in six places with three different governance rules and no
arbitration between them. This file is the answer to **"what is next, and why that"**.

## The split this file exists to enforce

The defect was never "too many documents". It was that documents recording **what is
true** were also being used to record **what is next**, and those have opposite
lifecycles: knowledge is append-only and permanent, a schedule is drained and emptied.
Put both in one file and one of two things happens, and both had:

- `PLAN.md` completed at S-12, so it stopped — and the whole capture arc, 0.36.0
  through 0.55.0, arrived with no home.
- `DEBT.md` became the defect ledger, the design record, the measurement narrative
  AND the de facto backlog at once, so the schedule is buried inside essays.

The arithmetic made it plain: `QUEUE.md` held six items while the real forward work
was roughly forty open debt rows, six order-of-work lists embedded in design docs, and
ten `CONSTRUCTS.md` steps. **The queue was not the plan; it was a sample of it.**

So, from now on:

| kind | lives in | lifecycle |
| --- | --- | --- |
| **schedule** — what is runnable now | `QUEUE.md` (CONDUCT's, sole writer) | drained |
| **capability ladder** — what the work is FOR | this file | slow |
| **knowledge** — defects, measurements, designs, doctrine | `DEBT.md`, `MEASUREMENTS.md`, the design docs, `docs/architecture/**` | append-only |
| **operating model** — how sessions run | `ORCHESTRATION.md`, `PARALLELISM.md`, `INTERFACES.md`, `CLAIMS.md`, `kickoffs/**` | rarely |
| **history** — the foundation ladder, closed | `PLAN.md` | frozen |

**The rule: nothing is WORK until it is in `QUEUE.md`.** Everything else is knowledge,
and knowledge is an input to the queue, never a rival to it. A debt row, a design-doc
step and a milestone below are all inputs. This file names no item twice: the
milestones say what the work is for and the queue says what is runnable, and an item
exists in exactly one of them at a time.

**Milestones are capabilities, never phases.** Each says what an instance can do that
it could not before, and its acceptance is stated in terms of the RECORD rather than
the code, so it can be judged by someone who has not read the diff. The ladder will
grow: the functional plan expands as discovery continues, which is the framework's
own premise, and a new milestone is a cheap thing to add.

---

## The ladder

### M0 · The plan and its verification are trustworthy
**Capability:** a session can answer "what is next and why" from one file, and the
project can state what its tests actually cover rather than that they pass.

**Acceptance:** every open debt row carries a disposition; every design-doc
order-of-work item carries a status; `npm run test:coverage` reports the floor and
`npm run test:battery` runs every suite; no forward-looking item exists outside
`QUEUE.md` and this ladder.

**Absorbs:** this cleanup · `VERIFICATION.md`'s five floor items · D-93 (the `&&`
chain and the silent `sshsig` shortfall) · D-18 (the conformance suite asserts only
the C-12 family) · D-33 (tiebreak proven at compile time only) · D-40 (fixtures
carrying an illegal `criticality`).
**Areas:** CONDUCT, and one queued item per floor step.
**Depends on:** nothing. **Status:** landing this turn; the floor items remain.

### M1 · The instance keeps its own record current, unattended
**Capability:** an instance left alone continues to monitor its sources, drain its
inbox, and fall back to the archive when a source goes dark — with nobody calling an
op.

**Acceptance:** in a scratch namespace with no operator action, a changed source
produces a `monitor-tick`; an undetermined capture produces an inbox task; a source
dark past the D-104 threshold produces a grade-C archive capture whose provenance
chain carries both hops. Time-pinned in a suite, then confirmed once live.

**Absorbs:** D-109 (task drain — landed) · the fallback caller (QUEUE CAP-3) · **the
scheduler itself, which does not exist and was in no ledger** · per-document cadence
from observed volatility (`ARCHIVE-FALLBACK.md`, and D-65's frequency-by-kind half) ·
D-61 (an unattended writer cannot take a lease).
**Areas:** RECORD (the scheduler), CAPTURE (the callers).
**Depends on:** nothing. **This is the top of the ladder.**

> **CORRECTED 2026-08-01 — this hole is CLOSED and the paragraph below is kept as the
> reasoning that closed it.** One reconciling Durable Object alarm now serves FIVE
> consumers (selection-sweep, task-drain, archive-monitor, connection-derive,
> overdue-scan), three of which landed within a week of the decision. The shape held.
> Two things did NOT close and are the live M1 gaps: `env.SELF` is bound in no
> `wrangler.jsonc` and by no installer, so `archive-monitor` is INERT on every deployed
> instance; and `op=monitor` has no caller anywhere, so "a changed source produces a
> tick" still has no producer.
>
> **The hole this milestone named.** `wrangler.jsonc` declares no cron trigger and the
> plane's only Durable Object alarm is the selection sweep (a second, for the task
> drain, is landing now). Monitoring, the fallback's eligibility clock, cadence by
> volatility and the ageing of temporal expectations (M4) each presuppose a periodic
> actor. Four mechanisms are each growing their own trigger. Deciding ONCE whether an
> instance has a scheduler is cheap now and expensive after three alarms are in the
> ground — so it is the first item under M1, not a follow-on.

### M2 · Every document class Oakland publishes can become evidence
**Capability:** the document classes a city actually publishes — agenda packets,
budget exhibits, portal pages — become citable bundles, not just hashes.

**Acceptance:** a real captured agenda PDF yields its text and its item graph through
`op=pdfstructure`; a client-rendered portal page yields a rendered capture carrying
its own method and grade; a bundle ratified with reused subresources has each reused
part re-fetched and its outcome (confirmed / changed / unavailable) recorded.

**Absorbs:** D-91 phase 2, now restructured by the topology decision below · D-118
(service bindings on Free are unmeasured and the tiering rests on them) · D-64
client-rendered (D-55's shape decided below) · `CAPTURE-SCALING.md` item 6 — post-hoc
reuse verification and re-fetch at ratification, **DECIDED 2026-07-31 under Bob's
delegation and queued as CAP-4**; the mandatory-ness is this project's decision rather
than a ruling of his, and is labelled that way · D-54 (the installer does not detect
the Workers plan) · D-63 / D-66
(more stacks, more content types — standing, measurement-first).
**Areas:** CONTENT-PDF, CAPTURE, FRAMEWORK.

> **Office formats, researched 2026-07-31 (`OFFICE-FORMATS.md`).** Spreadsheets,
> Word-format and presentation documents are ONE container problem, not three:
> `.docx`/`.xlsx`/`.pptx` are OOXML (a ZIP of XML parts) and `.odt`/`.ods`/`.odp` are
> the same shape. **Measured in workerd:** `DecompressionStream("deflate-raw")` works
> and round-trips, so the container needs ZERO dependency — and office TEXT is easier
> than PDF text, not harder, because it is XML text nodes with no glyph problem. No
> Tier 2, no fleet member.
>
> **The architectural point is bigger than the formats.** Dispatch today is already
> two mechanisms that do not scale — a hardcoded `HTML_CT` array guarding acquire-time
> subresources, and a separate read-time `op=pdfstructure`. Three more formats makes
> five special cases across two mechanisms. The framework already specifies the fix
> (§4's uniform recogniser plus a registry per axis) and names FORMAT as a candidate
> axis, and **D-70 records that this uniformity has never been tested because no third
> axis has been added.** This is that test. So: stand up the FORMAT registry and move
> HTML and PDF ONTO it first — adding formats before it means building them twice, and
> if a new format then costs a registry entry, §9's cost table is real.
>
> Two element references land BETTER than PDF's page+rect: `Sheet1!B14` and
> slide+shape are stable and human-meaningful — the first time the record can cite
> finer than a whole document without inventing an anchor scheme. That needs I2 to
> grow a per-container `source` (D-123), which is `INTERFACE-CHANGES.md`'s first real
> use; the protocol file does not exist yet, by design, and writing it is part of the
> work rather than a surprise halfway through.
**Depends on:** the PDF half on a Free-tier measurement (D-118); the rendered half on
D-55, and **D-55 is less blocked than its row says** — see below.

> **D-55, unblocked as far as it can honestly be, 2026-07-31.** The row reads as an
> open doctrine question and it is not: **Bob already RULED the doctrine** — content
> produced by a third-party script, if it is ever evidence, is recorded as produced by
> THAT party and not by the hosting site. What is missing is a SHAPE, and a shape is
> design. The obstruction recorded in the row is that `capture.authority` holds one
> value and `references[]` targets a bundle and nothing finer, so per-region
> attribution looked to need the sub-document granularity D-53 is also stuck behind.
>
> It does not. **Attribute by ORIGIN, not by region.** A rendered capture records
> `rendered_origins[]` — one entry per origin that executed, what it contributed, and
> an `authority_state` that is `undetermined` unless something asserted it — while the
> bundle's own authority continues to name the publisher of the SHELL. Origin is
> exactly what the render environment knows at capture time, it needs no new reference
> granularity, and it composes with the fence already shipped: C-18.9 gates publication
> on the provenance chain having no unattributed hop, which is the same question asked
> of a third-party origin. That is a provisional design decision, recorded so
> CONTENT-HTML can be scoped; it does not authorise treating a rendered capture as
> evidence, which still waits on the capture path itself.

> **The topology decision, 2026-07-31 (Bob).** Heavy, dependency-laden functions move
> OUT of the plane into dedicated single-purpose Workers called over service
> bindings — a fleet, not a monolith. First member `pdf-worker`, holding `unpdf`.
> Registered as **I6**; the six standing rules are in `PARALLELISM.md`. Three wins,
> one measured this turn: the plane bundle stays ~0.64 MB instead of ~2.9 MB; PDF work
> gets its own CPU and 128 MB per call so whole-document extraction stops threatening
> the plane; and `unpdf` never enters the plane's module graph, which matters because
> putting it there **broke 21 miniflare suites** — a bare npm specifier cannot resolve
> in un-bundled source, and this battery drives source.
>
> **Extraction is TIERED, not unpdf-or-nothing**, and the sequence is the point:
>
> 1. **Tier 1, in the plane, pure JS, no dependency** — content-stream text operators
>    plus the font `ToUnicode` CMap, reusing the PDF object parser CONTENT-PDF already
>    built, honouring I1 range reads. Most municipal PDFs come from Word or InDesign
>    and carry `ToUnicode`, so this is expected to cover the bulk.
> 2. **Tier 2, `pdf-worker`/`unpdf`** — only the residue Tier 1 cannot decode: CID
>    fonts, missing `ToUnicode`, complex layout.
> 3. **Tables, visuals, OCR** — later tiers, deferred by name rather than forgotten.
>
> **Build Tier 1 FIRST and measure its coverage on real Oakland PDFs**, because that
> measurement sizes how much `unpdf` is actually needed — and if D-118 finds a Free
> instance cannot reach a second Worker, Tier 1 is not an optimisation but the floor.
> Every tier states what it could not do; `undetermined` stays first-class and text is
> never silently truncated. CPDF-2's unpdf logic and size guard, already written on
> branch `content-pdf/phase2-text`, become the pdf-worker's Tier 2 core rather than
> being discarded.

### M3 · The record knows what it holds
**Capability:** the PLANE, not only the UI, can say what kind of document a capture is
and whether two captures are the same document.

**Acceptance:** a capture carries its profile (handler, content type, both
confidences, what was normalised); `op=audit`'s duplicate sweep fires on a re-captured
Legistar page whose viewstate differs; a monitor tick on that page reports no change
rather than a change on every tick.

**Absorbs:** D-68 (**reconcile the seven vocabularies — CONSTRUCTS Step 0, and it
blocks this milestone and M4**) · D-69 / D-60 (docprofile adopted by the plane;
feasibility already measured at 5.3KB bundled) · CONSTRUCTS Steps 1 and 2 · D-65
(monitoring contracts consumed) · D-59 (whether the bracket arm earns its complexity)
· D-57 (a self-reference described as a change).
**Areas:** FRAMEWORK (Step 0 and the design), CAPTURE (adoption, by delegation).
**Depends on:** D-68 first, and nothing else.

> 1,463 lines of validated `docprofile/` have zero plane consumers. That ratio is the
> measure of the diffusion `CONSTRUCTS.md` was written to end, and this milestone is
> where it ends.

### M4 · The record connects what it holds
**Capability:** "every document that concerns this ordinance" is one query, and a
progression with a missing predecessor is visible.

**Acceptance:** readings are persisted and indexed by entity reference; the
meeting → agenda → minutes sequence AND the need → award → contract sequence are both
expressible as rows in one table; an award with no solicitation surfaces as a finding
carrying its grade.

**Absorbs:** D-71 (readings are transient — the quiet blocker) · D-83 (the entity axis
IS the bias doctrine's subject registry; building them twice is the live risk) ·
D-67 (connections emitted and discarded) · D-72 (connections have no grade) · D-73
(the table models a pair, the domain needs a chain) · D-74 (Oakland's shared
identifiers — the highest value-per-hour measurement available) · D-75, D-76 (the
framework and the object catalogue have never been connected; aspiration and goal do
not exist) · CONSTRUCTS Steps 3, 4, 5, 5a.
**Areas:** FRAMEWORK, RECORD (schema and the ageing mechanism).
**Depends on:** M3.

### M5 · The record can be searched over its content, not only its notes
**Capability:** search reaches the text of the documents the record holds.

**Acceptance:** a term that appears only inside a captured PDF returns that bundle,
and the fence still holds — the index never leaves the Durable Object and stays member
class and above.

**Absorbs:** **the indexing gap, which had no debt row until this pass** — `bundles_fts`
indexes `bundle.md` frontmatter and inline `.md`/`.txt` files only, capped at 128KB a
column, so captured bytes are never indexed and a group that captures 500 agenda
packets can search its notes about them and not the packets · D-32 (the shipped
retrieval path's remaining cost) · D-36 (the class of undocumented workerd ceilings).
**Areas:** RECORD.
**Depends on:** M2, for the text to exist. Nothing else — **the fence question this
was waiting on is already answered by settled doctrine, 2026-07-31.** Indexing
document text sits in exactly the position `source.locator` and `source.authority`
already sit in: Bob settled on 2026-07-25 that both are searchable, on the grounds
that searching is mining and mining is the workflow. `op=search` is member class and
above, and probe 1 chose FTS5 partly BECAUSE the index never leaves the Durable
Object — an exported index was rejected as a working-corpus index outside the fence.
So document text is member-scope, inside the object, and no new doctrine is needed.

**One rule this milestone must carry:** `TEXT_CAP` bounds each indexed column at 128KB
and a captured document will routinely exceed it, so **a truncated index entry must
SAY it is truncated**, per bundle. A search that silently under-reports because it
indexed the first 128KB of a 400-page packet is a record claiming more coverage than
it has, which is the same defect class as a partial capture rendering as though it
were whole.

### M6 · The record can be left, mirrored and outlived
**Capability:** a third party's tooling can read and verify a group's record without
BIO, and a group can see what its own storage is doing.

**Acceptance:** an export a standard WARC reader accepts; a Memento interface that
answers; storage growth and residency stated somewhere an operator can read.

**Absorbs:** D-99 (WARC and Memento as interchange — **a one-paragraph commitment with
no shape, no acceptance test and no owner, and it carries the sovereignty promise**) ·
**capture-byte custody at scale, which no document in the repository addresses**: no
plan for R2 growth, the free tier's storage ceiling, retention, or a second copy,
while one budget book measured 39.6MB · D-9 (`registerAudit` cannot tell *captured*
from *unbacked* because it never looks in R2) · D-45 (an unbacked register entry is
refused at ratify, not at promote — default is to leave it).
**Areas:** RECORD, DIST.
**Depends on:** nothing technically. **Sequenced last among the unblocked milestones,
2026-07-31, and the reason is worth stating** so it is not read as neglect: WARC and
Memento are a promise about a group's ability to leave, and that promise is only
tested when a group has enough record to want to take it somewhere. Every instance
today is a development instance. M6 moves the moment a real group is running, and the
storage half (custody, growth, the free-tier ceiling) moves sooner than the
interchange half, because a group can hit a storage ceiling long before it wants to
emigrate.

### M7 · A group can install and run it honestly
**Capability:** a group installing today gets an instance that tells the truth about
what it is and what it can do.

**Acceptance:** the installer detects and states the Workers plan; its deploy is
scripted with read-back verification of version, empty bindings AND account; no
surface explains a rule the plane no longer enforces.

**Absorbs:** D-107 (no scripted installer deploy, sharpened by the wrong-account
finding) · D-54 (plan detection) · D-62 (`setup.mjs` omits `content_hash`, so a
wizard-written bundle can never be released) · D-110 (a refusal string for a rule
D-97 removed) · D-52 (an export is recorded and no administrator is notified) · D-42
(burner invitations half built) · D-92 (`op=file` 403s under load) · D-39 (an empty
POST body returns a platform error rather than a refusal) · D-78 / D-82 (both bundle
writers hardcode `surfaced_by: human`, and an assistant-surfaced focus must look like
one).
**Areas:** DIST, RECORD, UI.
**Depends on:** nothing.

### M8 · A member can reach what the record holds
**Capability:** the surfaces a member uses expose what the plane can actually do —
and, where the plane knows something a person would otherwise have to work out, the
surface says it instead of asking.

**Acceptance:** an undetermined-authority capture reaches a named member as a task
they can forward or resolve; a project owner invites, removes and hands over
ownership without an operator; a member declares expertise and an administrator
confirms it; a group exports its record and every administrator learns it happened;
a citation can be withdrawn as well as made.

**Absorbs:** the six unsurfaced families measured 2026-07-31 in `UI-PLAN.md` — the
task inbox (D-98), project participation and governance (S-12 §7), expertise and
licences, verified export (§8, plus D-52's missing notification), the citation
lifecycle beyond citing (`sever`/`reinstate`/`retire`), and selection-as-a-lease ·
the two drifts: the UI's hand-composed query vocabulary where `op=searchfields`
exists, and `inbox` (doorbell) versus `tasks` (D-98) being conflatable by name ·
D-78/D-82 (an assistant-surfaced focus must be written and shown as one).
**Areas:** UI, with RECORD for anything needing an op shape it does not have.
**Depends on:** nothing. Every op it needs already ships.

> **Built as CONSTRUCTS, not as forty screens**
> (`architecture/BIO_Interaction_Constructs_v0_1.md`, 2026-07-31, at Bob's direction).
> The audience is non-technical and the workflow exists to remove members from
> logistics; forty screens is forty things to learn. Five shapes carry the whole
> capability set, and each new capability then arrives already familiar:
>
> **T · TASK** is the ATTENTION layer and not a peer of the acts — it says *this needs
> you* and points at one of the others, which is what stops the inbox becoming a
> second parallel application. **B · BALLOT** is a multi-party act with computed
> arithmetic (the `adminarith`/`projectownerarith` ops exist so the tally is computed
> rather than transcribed). **P · PROPOSAL** is a derived finding awaiting an authored
> act — D-90's "derived informs, authored binds" is its charter, and D-82 requires it
> to LOOK derived. **J · JUSTIFIED TRANSITION** is a state change carrying authored
> text that becomes evidence, so the system must NEVER prefill it. **A · ATTESTATION**
> is the irreversible signed act and must carry that weight in the interface.
> **S · SELECTION-SCOPED** is a modifier that makes the plane's report-vs-refuse
> weights felt. **U · UNDETERMINED** is a display primitive rendered identically
> everywhere, or members learn to ignore the honest gap this record rests on.
>
> Build order inside M8: **T first** (attention layer, sharpest gap, plane half
> ships), then **J** (U5 already built one instance — generalising working code
> unlocks dispose/sever/reinstate/retire together), then **B** (makes seven releases
> of enforced-but-unreachable S-12 governance usable), **S** alongside J, **P** when
> M4 produces findings to propose, **A** on the crucial path.

> **The measured gap.** 85 ops declared, 63 member-reachable, **18 reached by the
> UI**. Raw counts overstate it — plumbing and diagnostics want no surface — but six
> member-facing FAMILIES shipped with no surface AND no rung naming them, which is
> the part that does not show up as "behind".
>
> **The sharpest one is the task inbox.** The ruling is that an undetermined capture
> creates a task automatically and that every user has a todo list; the plane does
> exactly that, and there is nowhere for it to ask. A record that must ask a person
> something, and cannot, will either invent an answer or stay silent — and both are
> failures this project has already named.
>
> **New capability, not catch-up.** PDF structure and text, the archive fallback's
> two-hop chain on a source that went dark, three-valued authority stated honestly,
> governed-versus-refused in monitoring, and the governor letting a stalled capture
> say it is being PACED rather than looking broken. That last one is the ordering
> rule doing work: it removes a choice a member should never have been given.

### M9 · A member can state what they found, and what it rests on
**Capability:** a question can reach a conclusion, the conclusion can rest on documents
and on other conclusions, and the record can say how strongly — per axis, and honestly
when it cannot say at all.

**Acceptance:** a member asks a question and gets an `inquiry`; cites two documents and
another inquiry onto it as basis; concludes it with an authored conclusion and an
authored falsifier; and the page states BOTH derived strengths — capture and connection
— each as its own weakest leg, BY NAME; never as a score, never as an average, never
composed into one letter; and an ungraded leg SUSPENDS its axis, which then reads
`undetermined` and names the leg that is why.

**Absorbs:** D-127 (the collapse, RULED) · D-138 (the drift guard that does not read the
authority it claims to check) · the `focus → inquiry` rename, the concept's third name ·
`data/citations.json` / C-8.1's disposition.
**Areas:** RECORD, UI. **Depends on:** nothing — the claim layer rests on the projection
layer, which ships entire.

### M10 · The group can stand behind what it found, and act on it
**Capability:** a finding becomes a published case carrying an authored statement of what
was left out; a stranger with no credential can read and check it; and an outward action
can say which findings justified it and what came back.

**Acceptance:** a concluded inquiry is published through a ceremony that refuses before it
signs and cannot be signed before the exclusion is authored; the published case is
readable and hash-checkable with no credential; an action names the finding it rests on,
records what was sent and what returned, and its non-response is itself a finding.

**Absorbs:** D-143 (the published surface with no data path) · D-144 (re-ratifying
destroys the prior attestation) · D-150 (the completeness claim) · D-130's record half ·
D-147 / D-148 (the records-request lifecycle and the fee quote as evidence) ·
`AUDIENCES.md` H4/H5 (threshold and exclusions travel in-band).
**Areas:** RECORD, UI. **Depends on:** M9.

> **These two rungs are not appended after the substrate; they are what the other eight
> serve.** D-127 records the structural finding and it is worth keeping in front of a
> reader of this ladder: M0–M8 are substrate and surfaces — running unattended, every
> document class as evidence, knowing and connecting what it holds, search, leaving,
> installing, reaching — and not one of them is *a member can make a case*. The numbers
> are positions in a list, not an order of importance, and this file's own rule
> (*milestones are capabilities, never phases*) is what makes that safe to write down.

---

## Dependencies, and where the parallelism actually is

```
M0 ─┬─> M1 ────────────────────────────> (unattended)
    ├─> M2 ──┐
    ├─> M6   ├─> M5
    ├─> M7   │
    ├─> M3 ──┴─> M4
    │   ^
    │   └── D-68 (CONSTRUCTS Step 0) blocks M3 AND M4
    ├─> M8
    └─> M9 ──> M10
```

**M9 depends on nothing, and that is the load-bearing fact about it.** It reads the
projection layer, which ships entire; it needs no capture work, no framework work and no
new interface. So the rung the whole system is for is not waiting on the substrate — it
was waiting on being named. M10 depends on M9 alone. Neither contends with M1–M7, which
is why the constraint from here is **worker slots and not dependencies** — the reverse of
the situation this file recorded when CAPTURE was the constraint.

**Four pipelines run without contending**, which is what makes this schedulable at
CONDUCT's standing budget of two active areas:

| pipeline | area | carries | contends with |
| --- | --- | --- | --- |
| **bytes** | CAPTURE | M1 callers, M2 capture half, M3 adoption | itself — see below |
| **content** | CONTENT-PDF → FRAMEWORK | M2 PDF half, M3 Step 0, M4 | nothing |
| **core** | RECORD | M1 scheduler, M4 schema, M5, M6 | nothing |
| **distribution** | DIST | M7 | nothing |

Three findings fall out of that table and each changes what should be scheduled next:

1. **CAPTURE is the constraint, not CONDUCT.** It appears in three milestones and
   owns the paths every other area delegates into. Everything that can be moved OFF
   CAPTURE should be: the scheduler is RECORD's, Step 0 is FRAMEWORK's, and the
   docprofile adoption is a delegation with FRAMEWORK's guidance rather than
   FRAMEWORK's code.
2. **The blocking step for two milestones sits in a dormant area with one queue item.**
   D-68 blocks M3 and M4 and belongs to FRAMEWORK, which is dormant and holds only
   FW-1. Promoting FRAMEWORK buys more parallelism than any other single move.
3. **RECORD does not exist as an area, and that is why everything lands in CAPTURE.**
   `store.mjs` is ~4,900 lines and only its link/capture/task/reachability functions
   are claimed; the schema core, `promote`, the gate, the audit sweep, membership,
   projections, `query.mjs` and the whole retrieval surface are unowned. Unowned is
   not free — it is the collision risk `PARALLELISM.md` names. RECORD is added to the
   area table in this pass.

**Suggested activation order — SUPERSEDED 2026-08-01.** The version below is kept as
history: *promote RECORD (M1's scheduler) and FRAMEWORK (D-68), CONTENT-PDF finishes
CPDF-2 and goes dormant.* All three happened; the queue drained to 44 done and 0
runnable. The current order is in `QUEUE.md`'s BOB INBOX, handed over 2026-08-01 with
the M9/M10 build order: **RECORD for REC-10 (the `inquiry` type, which unblocks 21 of the
34 other items) and a second RECORD-path slot for REC-19 (`op=affordances`), with no act
surface built before REC-19 exists.** The reasoning is in
`research/BUILD-ORDER.md` §3.4 as re-checked by `research/RECONCILED.md` §3.4. Activation
order is this session's under Bob's 2026-07-31 ruling; it is a handover to CONDUCT, and
the queue is still CONDUCT's file.

---

## Placement: everything open, and where it now sits

Every open row in `DEBT.md`, every unscheduled order-of-work item in a design doc, and
every `CONSTRUCTS.md` step. Nothing forward-looking should exist outside this table.

| item | area | milestone |
| --- | --- | --- |
| D-9 registerAudit cannot see R2 | RECORD | M6 |
| D-18 conformance asserts only C-12 | CONDUCT | M0 |
| D-19 migrated `created` times | RECORD | M6 |
| D-32 retrieval path cost | RECORD | M5 |
| D-33 sort tiebreak unproven at runtime | RECORD | M0 |
| D-36 workerd ceiling class | RECORD | M5 |
| D-39 empty POST body | RECORD | M7 |
| D-40 illegal `criticality` in fixtures | CONDUCT | M0 |
| D-42 burner invitations half built | RECORD | M7 |
| D-50 name uniqueness absent from the catalog | RECORD | M7 |
| D-52 export recorded, nobody notified | RECORD | M7 |
| D-54 installer ignores the Workers plan | DIST | M2 |
| D-57 self-reference reported as a change | CAPTURE | M3 |
| D-59 `contemporaneous` never observed | CAPTURE | M3 |
| D-60 / D-69 docprofile unadopted | FRAMEWORK → CAPTURE | M3 |
| D-61 unattended writer can take a lease · DONE (REC-2) | RECORD | M1 · done |
| D-62 `setup.mjs` omits `content_hash` | RECORD | M7 |
| D-63 unmeasured stacks | FRAMEWORK | M2 |
| D-64 client-rendered capture | CAPTURE | M2 · blocked on D-55 |
| D-65 monitoring contracts unconsumed | FRAMEWORK → CAPTURE | M1 · M3 |
| D-120 member-driven egress diversity (DEC-1) | CAPTURE | M1 |
| D-66 unmeasured content types | FRAMEWORK | M2 |
| D-67 connections discarded | FRAMEWORK | M4 |
| D-68 seven vocabularies | FRAMEWORK | M3 · **blocks M3, M4** |
| D-71 readings transient | FRAMEWORK | M4 |
| D-72 connections have no grade | FRAMEWORK | M4 |
| D-73 pair vs chain | FRAMEWORK | M4 |
| D-74 Oakland shared identifiers | FRAMEWORK | M4 |
| D-75 / D-76 objectives, aspirations, satisfaction | FRAMEWORK · RECORD | M4 |
| D-78 / D-82 `surfaced_by`, and showing it | RECORD · UI | M7 |
| D-79 aggregation and ageing | FRAMEWORK | M4 |
| D-80 / D-81 aspiration contact, pursuit record | FRAMEWORK | M4 |
| D-83 subject registry = entity axis | FRAMEWORK | M4 |
| D-84 `object_type: bias` missing | RECORD | M4 |
| D-85 / D-86 / D-87 / D-88 bias manifest, debt, decay, measure | FRAMEWORK | M4 |
| D-91 PDF text | CONTENT-PDF | M2 |
| D-92 `op=file` 403 under load | RECORD | M7 |
| D-93 suite crashes, `sshsig` runs short | CONDUCT | M0 |
| D-99 WARC / Memento | RECORD | M6 |
| D-107 installer scripted deploy | DIST | M7 |
| D-109 task drain (landed) | CAPTURE | M1 |
| D-110 stale refusal string | RECORD | M7 |
| D-113 purge table list as a class | RECORD | M0 |
| D-115 installer installs one Worker, not the fleet | DIST | M7 |
| D-116 version authority across the fleet | DIST · RECORD | M7 |
| D-117 coverage instrument blind to the fleet | CONDUCT | M0 |
| D-118 service bindings on Free unmeasured | CONTENT-PDF | M2 · measure first |
| pdf-worker · Tier 1 in-plane extractor, then coverage measurement | CONTENT-PDF | M2 |
| pdf-worker · Tier 2 (`unpdf`) as a fleet member behind I6 | CONTENT-PDF · DIST | M2 |
| D-121 office formats: the FORMAT registry + OOXML container | CONTENT-* · CAPTURE | M2 |
| D-122 office formats carry latent evidence AND personal data | — | DOCTRINE · DEC-5 |
| D-123 I2 element reference needs a per-container form | CONDUCT (answers for dormant FRAMEWORK) | M2 |
| CAPTURE-SCALING item 6 · reuse verification + re-fetch at ratification | CAPTURE | M2 · DECIDED, queued CAP-4 |
| CAPTURE-SCALING open · freshness window, recurrence threshold | CAPTURE | M2 (measurement first) |
| ARCHIVE-FALLBACK · per-document cadence by volatility | RECORD · CAPTURE | M1 |
| ARCHIVE-FALLBACK · Memento rather than Wayback | RECORD | M6 |
| LINK-FIDELITY steps 6–8 · objective type, cascade planting, re-resolution | RECORD · CAPTURE | M4 |
| CLIENT-RENDERED · rendered grade and method vocabulary | CAPTURE | M2 · needs D-55 |
| CONSTRUCTS Steps 0–5a | FRAMEWORK | M3 · M4 |
| CONSTRUCTS Steps 6–8b | FRAMEWORK · UI | M4 |
| ~~no scheduler exists~~ BUILT 2026-08-01 — one DO alarm, FIVE consumers | RECORD | M1 · landed |
| **captured content is not indexed** | RECORD | M5 |
| **capture-byte custody at scale** | RECORD | M6 |
| UI-PLAN U9–U14 | UI | M8 |
| the task inbox has no surface (D-98 shipped) | UI | M8 |
| project participation + governance have no surface (S-12 §7) | UI | M8 |
| expertise/licences have no surface | UI | M8 |
| verified export has no surface (§8) | UI · RECORD | M8 |
| sever / reinstate / retire have no rung | UI | M8 |
| the UI hand-composes query syntax where `op=searchfields` exists | UI | M8 |

**The case-making pass, 2026-08-01.** Twenty-seven rows arrived from the sixteen-file
research study with no placement, which this table's own preamble forbids. Placed here;
the item that carries each is named in `research/RECONCILED.md` §3 (the design of record)
and handed to CONDUCT through the BOB INBOX.

| item | area | milestone |
| --- | --- | --- |
| D-124 restricted material — DEC-5 scoped itself to PUBLIC records | — | DOCTRINE · deferred with a trigger |
| D-125 no notification preferences (DEC-10 requires them) | RECORD | M8 · REC-21 |
| D-126 ~30 notification generators, no catalogue, no classes | RECORD · UI | M8 · REC-20 |
| **D-127 case-making is undesigned, and it is what the system is for** | RECORD · UI | **M9 · M10** — the rungs this pass adds |
| D-128 declared-versus-observed flow is the analytic product | FRAMEWORK · RECORD | M4 · consequence half M10 (REC-24) |
| D-129 `undetermined` conflates *cannot determine* and *positively none* | RECORD | M8 · a field beside the reason |
| D-130 `counterparty: to be named` passes C-2.10 | RECORD · UI | M7 · REC-23 (UI half UI-15) |
| D-131 a raw NUL byte makes `store.mjs` invisible to `grep` | RECORD | M0 · REC-27 |
| D-132 `ADD_TICKS` used twice, declared nowhere | UI | M8 · UI-15 |
| D-133 two Add-surface functions declared twice | UI | M8 · UI-15 |
| D-134 the BALLOT act is complete, tested and unreachable | UI | M8 · UI-16 |
| D-135 the viewer gate is stamped on compiled query paths only | RECORD | M7 · REC-25 |
| D-136 three governance ops absent from `SESSION_OPS` | UI · RECORD | M8 · UI-16 |
| D-137 the D-113 check is blind to eight hand-created tables | RECORD | M0 · REC-27 |
| D-138 the drift guard never reads the catalogue it claims to check | UI | M9 · UI-10 |
| D-139 nothing publishes what may be DONE to an object | RECORD | M8 · REC-19 |
| D-140 the queue's two organising axes are not data | RECORD | M8 · REC-20 |
| D-141 the UI rebuilds the project-visibility leak client-side | RECORD · UI | M7 · M8 (REC-25, then UI-16/UI-21 delete the client walk) |
| D-142 search degrades to a substring scan and looks identical | UI | M8 · UI-21 |
| D-143 a published case cannot be READ — no data path | RECORD · UI | M10 · REC-22, UI-18 |
| D-144 re-ratifying destroys the previous attestation | RECORD | M10 · settled by DEC-12 |
| D-145 bundle ids are per-instance, so nothing survives leaving | RECORD | M6 |
| D-146 nine intent-layer write ops have no caller | UI | M8 · UI-13 |
| D-147 `action` models a records request as one round trip | RECORD | M10 · REC-24 must read it before shipping the state machine |
| D-148 a fee quote is EVIDENCE, not an administrative obstacle | RECORD | M10 · with D-147 |
| D-149 the design is jurisdiction-blind | RECORD · FRAMEWORK | M10 · needs a design pass, not an item |
| D-150 the completeness claim, externally validated | RECORD · UI | M10 · REC-14 |
| D-151 a machine credential can resolve an unassigned task (DEC-7) | RECORD | M8 · REC-28 |

### Deliberately not scheduled, and why

These are knowledge, not backlog. They stay in `DEBT.md` with that disposition and no
milestone claims them:

- **D-1** root of trust · **D-53** reputation and credence · **D-77** / **D-89** /
  **D-90** the bias invariants — doctrine, and none of them blocks anything scheduled.
  D-53's "blocks S-11 step 5" is stale: bulk release shipped in 0.34.0.
- **D-55** is NOT in this list any more. Its doctrine was already ruled; only its
  shape was open, and the shape is decided provisionally under M2 above.
- **D-45** unbacked register entry at promote, **D-38** the citation ceiling — settled
  by decision, default is to leave them.
- **D-56** CPU headroom, **D-70** the third axis, **D-100** the Apps Script lesson —
  watch items with no task attached, deliberately.
- **D-111** the Wayback rate ceilings — not measurable by us without imposing a cost
  on strangers, which is a standing position rather than an omission.
- **D-94(a)** the allowlist request to the City — Bob's alone to time, and the City's
  stance inverts the argument for making it.
- **D-13**, **D-28** — accepted; the reasoning is in their rows.

---

## How this file stays true

1. **A new debt row gets a disposition when it is written**, naming its milestone or
   saying explicitly that it is doctrine, accepted, or a watch item. A row with no
   disposition is invisible work, which is how the ratification re-fetch ruling went
   two design revisions with nothing scheduling it.
2. **A design document's order-of-work carries a status per item** — `BUILT <version>`,
   `QUEUED <ID>`, `UNSCHEDULED`, `BLOCKED <what>`. `CAPTURE-SCALING.md` is why: five
   of its six items were built while its header still said nothing was.
3. **CONDUCT triages on an event that already happens** — when an area's queue drains,
   before promoting the next area, every `UNSCHEDULED` item in that area's milestones
   is triaged into the queue or explicitly left with a reason.
4. **A hygiene check enforces 1 and 2**, on the D-113 precedent: a plan that drifts
   fails a test in the session that drifted it, rather than being rediscovered weeks
   later by a session doing an audit. That is M0's last item.

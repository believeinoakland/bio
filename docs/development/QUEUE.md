# The work queue

CONDUCT owns this file and is its only writer. **Exception, 2026-07-31: session BOB
restructured it once, with Bob's explicit authorisation, while CONDUCT was paused for
that purpose.** Ownership returns to CONDUCT with this rewrite; BOB hands
decompositions over rather than editing here (`ORCHESTRATION.md`).

One section per area. An area is **ACTIVE** (holds a worker slot; max two at once) or
**DORMANT** (pre-seeded, promoted when a slot frees). CONDUCT takes the top item whose
status is `queued` and whose depends-on are all `done`, spawns a worker, and on
landing marks it `done`.

**What changed in this rewrite**, so CONDUCT can read it fresh without reconstructing:

- Every item now names its **milestone** (`MILESTONES.md`) and carries an
  **`accepts-when:`** — a command, not a judgment. That was `PLAN.md`'s one
  irreplaceable property and it was lost when the queue replaced it.
- The queue previously held six items while the real forward work was ~40 debt rows,
  six design-doc order-of-work lists and ten CONSTRUCTS steps. Everything is now
  placed in `MILESTONES.md`, and this file carries the runnable slice.
- **RECORD is a new area** (`PARALLELISM.md`): the store core and retrieval, ground
  already being edited with no owner, which is why everything defaulted to CAPTURE.
- **CPDF-2 is SUPERSEDED** by Bob's function-specific Worker topology (I6). Its work
  is not discarded — it becomes the pdf-worker's Tier 2 core.
- **CAP-2 landed** (39a0e1b) and is marked done here; CONDUCT paused before recording
  it.

**The two slots are RECORD and FRAMEWORK**, decided 2026-07-31 by session BOB (Bob's
standing instruction: activation is tactical and rests on dependency knowledge this
session holds and he does not).

- **RECORD, for REC-1, the scheduler.** It is the highest-value unblocked item on the
  board and it is time-critical in a way the others are not: CAP-2 has just made the
  Durable Object alarm serve a SECOND consumer, and CAP-3 queues a third. Every
  consumer added before the shape is decided makes deciding it more expensive, and
  this is the one item where waiting has a compounding cost.
- **FRAMEWORK, for FW-2 (D-68).** It blocks M3 AND M4, the two largest milestones, it
  contends with nothing, and it is a refactor that SHRINKS the codebase — so it gets
  cheaper the earlier it runs and dearer the longer M4's constructs accumulate on top
  of seven unreconciled vocabularies.

**CAP-3 and CPDF-7 run out of band, and do not hold a slot** (`ORCHESTRATION.md`, the
concurrency rule). CPDF-7 commits no code at all — it is the Free-tier measurement
that decides whether the whole pdf-worker path is central or marginal, so it should
run EARLY and its cost is one worker. CAP-3 touches only CAPTURE's own paths and
contends with neither active area. **The M0 lane likewise does not hold a slot**:
CONDUCT drains one M0 item whenever it has integration capacity between area items.

---

## BOB INBOX — append-only. BOB writes here; CONDUCT drains it.

The producer/consumer split that makes an architectural change landable WITHOUT
pausing CONDUCT (`ORCHESTRATION.md`). BOB appends; CONDUCT is the sole writer of
everything below this section and drains the inbox as part of its loop, deleting an
entry only once it has been enacted below. The two parties write to disjoint regions,
so neither has to stop for the other.

An entry names: what changed, which queue items it affects, and whether any in-flight
work is superseded. It does NOT decide worker lifecycle — stopping a running worker is
CONDUCT's call.

_(drained by CONDUCT 2026-07-31: restructure is reflected below; the stale `capture-bootstrap-1` claim has been RELEASED as stale per `PARALLELISM.md`; the `pdf-worker/**` note is informational — CPDF-6 creates it. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: re-read the updated `kickoffs/CONDUCT.md` loop (step 0 drain-inbox, step 5 DECISIONS both directions); DEC-1/2/3 enacted; D-120's status cell given its leading `M1` token (the plancheck residue); the shared-tree fix (DEC-3, one session per tree — main is mine now) and the raise-either-way-let-BOB-triage correction acknowledged. No entries outstanding.)_

_(drained by CONDUCT 2026-07-31: M8 (a member can reach what the record holds) is now in MILESTONES and the UI inventory in UI-PLAN — read and acknowledged. UI stays DORMANT; M8 depends on nothing and is available to activate when a slot frees, with UI-PLAN's U11 ("members & keys") to be SPLIT first since it exceeds its rung. No queue item superseded, no worker stopped.)_

_(drained by CONDUCT 2026-07-31: `BIO_Interaction_Constructs_v0_1.md` governs M8 — five INTERACTION constructs (not the CONTENT `CONSTRUCTS.md`), TASK the attention layer pointing at the acts. Recorded for when UI activates: scope M8's first item as the TASK CONSTRUCT (not "the tasks screen"), build order T→J→B(+S)→P→A per MILESTONES. UI stays dormant; no queue item superseded.)_

---

Item format:

    ### <ID> · <queued | active | done | blocked | superseded>
    milestone:        <M0 … M7>
    scope:            <bounded description of the one piece>
    behind-interface: <I1 … I6 | none — what makes it independent>
    depends-on:       <IDs, or none>
    accepts-when:     <a command that passes, plus the negative control that must fail>
    added:            <date · CONDUCT|BOB>
    landed:           <commit, when done>

Standing gate for every item, from `VERIFICATION.md`: `npm run test:battery` green
(every suite, all reported), the item's own `accepts-when:`, the negative control RUN
and recorded in the suite's `NEGATIVE CONTROL:` line, and `npm run test:coverage`
showing no new unreached op.

---

## M0 — VERIFICATION · cross-cutting, a BACKGROUND LANE (holds no slot)

Test-estate work spanning every area. CONDUCT spawns a worker per item with a claim on
the specific files. These are cheap, they touch no plane behaviour, and they raise the
floor everything else is judged against.

### M0-1 · done
milestone: M0
scope: Control-plane assertions for the three ops no suite reaches — `archivelookup`, `linkproject`, `signerlist` — and a control-plane assertion for `sourcereach`, which is reached only at the Durable Object (the D-43 class: a real caller's only route is the control plane). Reachability, not success: a structured BIO refusal counts, a worker exception does not.
behind-interface: I3
depends-on: none
accepts-when: `npm run test:coverage` reports 0 unreached and 0 durable-object-only; negative control — revert one assertion and the instrument names that op again.
added: 2026-07-31 · BOB
landed: fd53292 — control-plane assertions for archivelookup, linkproject, signerlist, sourcereach. Coverage 85/85, 0 unreached, 0 DO-only (was 81/85 + 1 + 3). Worker's negative control (delete linkproject dispatch → unreached 0→1) recorded in subresources.test.mjs. D-43 class closed for the current surface.

### M0-2 · queued
milestone: M0
scope: Backfill the negative-control register: one `NEGATIVE CONTROL: <what to break> -> <what must then fail>` line in the first 60 lines of each of the 42 suites. RUN each control, do not infer it; record what actually broke. Several are already written in prose in DEBT (D-104's is "let a governed refusal fall through -> 17 of 34 fail") and can be lifted, but each still gets run once to confirm it still holds.
behind-interface: none
depends-on: none
accepts-when: `npm run test:coverage` reports 42 of 42 suites declaring a control; spot-check three by breaking the subject and confirming the named failure.
added: 2026-07-31 · BOB
landed:

### M0-3 · queued
milestone: M0
scope: Name the 33 checks no assertion names. One assertion per check that tampers a conformant bundle and requires THAT check id in the findings. The catalog executes today via the conformance suite's zero-findings assertion, so these checks are exercised only in the direction that passes — the S-7 defect exactly, where C-20.1 skipped every mechanical entry and the audit reported clean because it was not looking. Largest single coverage gain available, and mechanical. Split across two or three workers if one turn is too long.
behind-interface: none
depends-on: none
accepts-when: `npm run test:coverage` reports 51 of 51 checks named; each new assertion fails when its tamper is removed.
added: 2026-07-31 · BOB
landed:

### M0-4 · queued
milestone: M0
scope: `npm test` becomes `node scripts/battery.mjs`, so a crash cannot hide the suites behind it (D-93 first half). Then the second half: `ratify.test.mjs` detects `ssh-keygen` and SKIPS LOUDLY with a named reason, or fails loudly — never quietly does less, and `sshsig` must report why it ran 16 rather than 18.
behind-interface: none
depends-on: none
accepts-when: with `ssh-keygen` hidden from PATH, `npm test` completes, reports the skip by name, and every other suite still runs.
added: 2026-07-31 · BOB
landed:

### M0-5 · queued
milestone: M0
scope: D-117 — teach `scripts/coverage.mjs` to enumerate FLEET members, not just `bio-plane/src/index.mjs`. The topology decision (I6) means a second Worker's surface is uncounted, so the day `pdf-worker` ships the figure stays flat while a whole component goes untested. Land in the same turn as the first fleet member, not after.
behind-interface: I6
depends-on: none
accepts-when: the instrument lists each fleet member and its three surfaces; adding a stub member with an untested op makes the run report it.
added: 2026-07-31 · BOB
landed:

### M0-6 · queued
milestone: M0
scope: The hygiene check that closes the planning-drift CLASS, on D-113's precedent: every open row in `DEBT.md` carries a disposition token, every `QUEUED <ID>` names an ID that exists here, and every design-doc order-of-work item carries a status marker. Then `coverage.mjs --strict` becomes the gate. NOT before M0-1 to M0-3 land: a floor set above the current state fails on day one and gets switched off.
behind-interface: none
depends-on: M0-1, M0-2, M0-3
accepts-when: `npm run test:hygiene` fails when a disposition is removed from any open debt row, and when a design-doc item loses its status marker.
added: 2026-07-31 · BOB
landed:

---

## RECORD — ACTIVE (new area, unstaffed — claim it first)

Owns the store core and retrieval (`PARALLELISM.md`). Claim it in `CLAIMS.md` before
editing; `store.mjs` is ~4,900 lines and CAPTURE holds its link/capture/task/
reachability functions, so name paths precisely.

### REC-1 · done
milestone: M1
scope: **Decide and build the scheduler, once.** Nothing in the plane runs on a schedule: `wrangler.jsonc` declares no cron trigger and the only Durable Object alarms are the selection sweep and the task drain that just landed. Monitoring, the archive fallback's eligibility clock, per-document cadence and M4's ageing each presuppose a periodic actor, and each is on course to grow its own trigger. Decide the shape ONCE — one reconciling alarm inside the DO (the `#armSweep` pattern, which CAP-2 has now extended to a second consumer and which already reconciles to the earliest wake) versus a cron trigger at the Worker — and write down why, because the second and third consumers will inherit it. Do NOT build the consumers here; build the mechanism and move ONE existing consumer onto it.
behind-interface: I5
depends-on: none
accepts-when: a time-pinned suite shows two independent consumers scheduled through one mechanism, each firing at its own interval, neither starving the other, and the alarm self-terminating when both are idle; negative control — remove the reconciliation and the suite reports the starved consumer by name.
added: 2026-07-31 · BOB
landed: da73f02 — ONE reconciling DO alarm (not cron: sub-second granularity, self-termination on idle Free-tier instances, state locality), a consumer registry (#schedConsumers: due/wake/tick). Both existing consumers moved onto it, bodies unchanged. scheduler.test.mjs 18 + starvation negative control; battery 43/43. Shape + rationale in SCHEDULER.md. I5 unchanged; future consumers register + arm, no second alarm.

### REC-2 · done
milestone: M1
scope: D-61 — an unattended writer cannot take a lease, because `leases.actor` is NOT NULL and stamped from the session, so a daemon cannot complete a capture a member walked away from. Decide between a machine actor identity on the lease and letting the refill path rely on `promote`'s CAS on `base` (which is the real integrity mechanism; the lease is a courtesy lock). Whichever way, the daemon must be able to finish work it was asked to do, and the writer must be NAMED rather than anonymous.
behind-interface: I5
depends-on: REC-1
accepts-when: a machine credential completes a capture started by a session and the manifest names the machine writer; negative control — an anonymous write is still refused.
landed: e425b24 — option (a): a NAMED machine actor `token:<class>`, server-stamped (caller `actor`/`author` DELETED first, so unforgeable), no schema change (leases.actor already TEXT NOT NULL). Store refuses a null/blank actor by name (ANONYMOUS_LEASE); promote's CAS on `base` untouched. battery 44/44 (2337); CONDUCT re-ran the anonymous-lease negative control (neuter guard → 20/2, restored → 22/22). I5 unchanged.

### REC-3 · queued
milestone: M7
scope: The small honesty defects in the plane's own surfaces, batched because each is minutes and none is worth a turn alone: D-39 (an empty POST body returns a Cloudflare 1101 rather than a named BIO refusal), D-110 (`setup.mjs` still explains the `NO_AUTHORITY` refusal D-97 removed), D-62 (`setup.mjs` omits `content_hash` when a document is attached, so a wizard-written bundle can never be released), D-78 (both bundle writers hardcode `surfaced_by: human`, so an assistant cannot honestly surface a focus).
behind-interface: I3
depends-on: none
accepts-when: an empty POST to five ops returns a named reason; a wizard-written bundle with a document carries `content_hash` and passes C-2.7; a focus written by an agent records `surfaced_by: agent`.
added: 2026-07-31 · BOB
landed:

---

## CONTENT-PDF — DORMANT, restructured by the topology decision.
CPDF-7 runs OUT OF BAND (measurement-only, holds no slot) and should run early: it
decides whether the pdf-worker path is central or marginal.

### CPDF-1 · done
milestone: M2
scope: D-91 phase-2 measurement — unpdf bundle size and node-proxy extraction cost.
behind-interface: none
depends-on: none
added: 2026-07-31 · CONDUCT
landed: 40eaba6 — unpdf FITS (plane+unpdf ~2.9MB raw / 0.71MB gzip; 2.29MB gzip headroom). Verdict GO. Superseded as a BUILD instruction by the topology decision; the sizes stand and are the reason for it.

### CPDF-2 · superseded
milestone: M2
scope: Was: inline `unpdf` into the plane's bundle. **Superseded 2026-07-31 by Bob's function-specific Worker topology (I6).** unpdf does not enter the plane's module graph: it broke 21 miniflare suites there, because a bare npm specifier cannot resolve in un-bundled source and this battery drives source. The work already written on branch `content-pdf/phase2-text` is NOT discarded — its extraction logic and size guard become the pdf-worker's Tier 2 core in CPDF-6.
behind-interface: I2
depends-on: CPDF-1
added: 2026-07-31 · CONDUCT
landed: superseded, not abandoned; see CPDF-4 through CPDF-6.

### CPDF-7 · done
milestone: M2
scope: D-118 — MEASURE whether Workers Free permits a second script and service bindings at all, and what they cost against the request and CPU budgets. Workers Paid is an optimisation and never a requirement (RULED), and the installer puts instances into other groups' accounts, most of them Free. If a Free instance cannot reach a second Worker, Tier 1 is not an optimisation but the floor, which raises CPDF-4's priority rather than CPDF-6's. Measure through the plane's own egress, as D-105 was measured rather than believed.
behind-interface: none
depends-on: none
accepts-when: recorded in `MEASUREMENTS.md` with date and instrument, stating what a Free account can and cannot do; D-118 closed or narrowed.
added: 2026-07-31 · BOB
landed: 5e24fd9 — MEASURED: account is Workers Free; Free DOES allow a second Worker + service bindings (cross-Worker call ~1ms, negligible subrequest). pdf-worker path VIABLE — D-118's "Tier-1 becomes the floor" conditional does NOT fire, CPDF-6 stays central. D-118 closed; the residual 10ms Worker-CPU ceiling is narrowed onto CPDF-1's gated follow-on.

### CPDF-4 · done
milestone: M2
scope: **Tier 1 text extraction, in the plane, pure JS, no dependency.** Content-stream text operators plus the font `ToUnicode` CMap, reusing the PDF object parser `src/pdfstructure.mjs` already has (classic objects, FlateDecode, object streams) and honouring I1 range reads. Extend the I2 output with text; do not fork it. `undetermined` is first-class and per-region: a glyph that cannot be decoded is SAID, never silently dropped and never guessed.
behind-interface: I2
depends-on: none
accepts-when: text extracted from fixture PDFs carrying `ToUnicode`; a CID-font fixture with no `ToUnicode` returns `undetermined` naming the font rather than mojibake; negative control — remove the CMap lookup and the suite fails on the decoded-text assertions.
added: 2026-07-31 · BOB
landed: 314f4b7 — pure-JS content-stream lexer + interpreter + ToUnicode CMap decoding, reusing the existing object parser; extends I2 with a `text` field (document/pages/undetermined markers). undetermined per-region names the font/reason, never mojibake. index.mjs untouched (text flows through op=pdfstructure). battery 43/43 (2313), negative control run. I2 text extension registered (provisional) for FW-1.

### CPDF-5 · done
milestone: M2
scope: **Measure Tier 1's coverage on REAL Oakland PDFs** — agenda packets, staff reports, budget exhibits, an ACFR. What fraction decode fully, what partially, what fails and why. This measurement SIZES Tier 2: it says how much `unpdf` is actually needed, and it is the input to whether the fleet member is urgent or marginal. Record in `MEASUREMENTS.md` with date and instrument. Produces a decision input, commits no extractor.
behind-interface: none
depends-on: CPDF-4
accepts-when: a recorded table of documents against decode outcome, with the residue characterised by cause (CID font, missing ToUnicode, layout).
added: 2026-07-31 · BOB
landed: 62a650b — 14 real Oakland docs (MEASUREMENTS.md). Tier-1 FULLY 29% (agendas, modern ACFR/decks — free, in-plane), PARTIAL 21%, Tier-2 REQUIRED 36% (ACFRs, encrypted staff reports — the agenda→staff-report substance), OCR-only 14%. VERDICT: pdf-worker (CPDF-6) is CENTRAL. Findings for CPDF-4/6: Tier-1 should emit reason:"encrypted"; CPDF-6 must pin an unpdf/pdf.js version verified on workerd.

### CPDF-6 · active
milestone: M2
heed: CPDF-5 findings — pin an unpdf/pdf.js version verified on the Workers runtime (one doc threw `Math.sumPrecise is not a function` on node v26), and handle permission-only encryption (pdf.js decrypts an empty-user-password PDF transparently; several ACFRs/staff reports are encrypted). Land M0-5 (fleet coverage instrument) in the SAME turn (per its item).
scope: **`pdf-worker`, the first fleet member (I6).** Holds `unpdf`; the plane hands it a capture sha and a store, it reads the bytes from R2 itself and returns the I2 structure+text shape in the record's terms rather than the library's. Writes NOTHING — no register row, no provenance, no capture. `CAPTURES` read binding only, never `PUBLISHED`. Tier 2 handles only the residue CPDF-5 measured. Lift the extraction logic and size guard from branch `content-pdf/phase2-text`.
behind-interface: I6
depends-on: CPDF-5, CPDF-7
accepts-when: the plane returns text for a CID-font PDF Tier 1 could not decode; the worker refuses to write anything; a request for a document over the envelope returns text-undetermined rather than truncated text.
added: 2026-07-31 · BOB
landed:

### CPDF-3 · blocked
milestone: M2
scope: Live-verify pdfstructure against real captured Oakland PDFs (the agenda→item graph) via `op=pdfstructure`, in a `biosmoke-pdf` scratch namespace; sweep after.
behind-interface: I1
depends-on: CAP-1 (done), a DIST deploy
added: 2026-07-31 · CONDUCT
landed:

---

## CAPTURE — DORMANT.
CAP-3 runs OUT OF BAND: it touches only CAPTURE's own paths and contends with neither
active area. CAP-4 is decided and queued behind it.

### CAP-1 · done
milestone: M2
scope: Wire `op=pdfstructure` into the dispatch in `src/index.mjs`.
behind-interface: I1 + I2
depends-on: none
added: 2026-07-31 · CONDUCT
landed: 2ab62f4 — GET, read-only, mirrors op=capture GET auth; 29-assertion op test + negative control.

### CAP-2 · done
milestone: M1
scope: D-109 — drain the task queue on a Durable Object alarm, armed on enqueue, re-armed while `task_queue` is non-empty, self-terminating when it drains.
behind-interface: none
depends-on: none
added: 2026-07-31 · CONDUCT
landed: 39a0e1b — shares the single DO alarm with the selection sweep and reconciles to the earliest wake; negative control run. **Note for REC-1: this is now the SECOND consumer of one alarm, which is the evidence that the scheduler shape needs deciding once rather than per consumer.**

### CAP-3 · done
milestone: M1
scope: **PRIMARY resilience item as of 2026-07-31 (DEC-1): the allowlist arm is closed (D-94), so the archive fallback is now the main scaling mitigation for source-access loss, not a backstop.** Make a monitoring tick actually INVOKE the archive fallback, which is built, live-verified and idle — nothing consults `sourcereach` and nothing fires the fallback. A tick that fails records its outcome through `op=recordsourceoutcome`'s path; a tick finding `fallback_eligible` calls `op=acquire` with `via: "archive.org"` and the document address. Read D-104's resolution before touching the counter: a governed refusal is our own politeness and must never move the failure count.
behind-interface: none
depends-on: none
accepts-when: a time-pinned suite drives three consecutive source failures and shows the fallback firing with a two-hop provenance chain at grade C; negative control — count a governed refusal as a failure and the suite reports a spurious fallback.
added: 2026-07-31 · CONDUCT
landed:

### CAP-4 · queued
milestone: M2
scope: `CAPTURE-SCALING.md` item 6, DECIDED 2026-07-31 under Bob's delegation — read that item before building, it carries four specifics. (a) Post-hoc reuse verification from `site_assets`, unconditional, costs zero requests, verdicts appended and dated. (b) At ratification, re-fetch every reused part: MANDATORY as an attempt and a record, never as agreement — `confirmed` / `changed` / `unavailable` all ratify, and ratifying with a reused part while saying nothing is what is forbidden. (c) A PLAIN GET, not `If-None-Match`: both cost one subrequest, and a 304 is the origin's assertion where a hash is our own evidence. This deliberately reverses the conditional-GET suggestion elsewhere in that document, which is right for working capture and wrong here. (d) A fourth outcome `not_attempted`, recorded with its reason, for parts the invocation's budget could not reach — bounded by the calibrated ceiling in `capture_limits`, never silently omitted.
behind-interface: none
depends-on: none
accepts-when: a bundle ratified with reused parts records an outcome for every reused part; a source that has gone dark still ratifies, as `unavailable`; a bundle whose reuse count exceeds the calibrated ceiling ratifies with the residue recorded `not_attempted`. Negative control — drop the outcome record and the suite fails naming the unrecorded part.
added: 2026-07-31 · BOB
landed:

---

## FRAMEWORK — ACTIVE (it BLOCKS two milestones)

### FW-2 · done
milestone: M3
scope: **D-68, CONSTRUCTS Step 0 — the full version, not a deduplication.** Bob ruled: "we must do the work upfront in order to end up with the results we need." One recogniser interface and one registry helper with both existing axes rewritten onto them; one confidence ladder (`CONFIDENCE` and `TYPE_CONFIDENCE` are one idea); `assess()` the only public entry point with `monitor()` and `compare()` internal; `diffMembers` deleted in favour of `diffEntities`; `CONTRACT` declared by the content type; a shared event catalogue instead of ad hoc strings; `meaningful` derived from `SIGNIFICANCE`. **This step should SHRINK the codebase.** Add no capability while doing it. It blocks M3 and M4.
behind-interface: I2
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with one ladder and one entry point; the test of whether it worked is that the entity axis later costs a registry.
added: 2026-07-31 · BOB
landed: 6f1a70f — seven vocabularies reconciled: one confidence ladder, one recogniser/registry engine, assess() sole public entry, monitoring.mjs + diffMembers + duplicate loops deleted. docprofile net -27 lines. civicos-ui/test/run.mjs + full battery green; negative controls (single ladder / sole entry) recorded. I2 unchanged (Step 0 internal). Unblocks M3/M4.

### FW-1 · queued
milestone: M3
scope: Confirm or counter the provisional I2 structure interface that CONTENT-PDF produces — this is what turns I2 STABLE. Note CPDF-4 extends I2 with text, so answer the extended shape rather than the link-only one.
behind-interface: I2
depends-on: none
accepts-when: `INTERFACES.md` I2 records CONFIRMED, or a counter-proposal exists in `INTERFACE-CHANGES.md`.
added: 2026-07-31 · CONDUCT
landed:

### FW-3 · queued
milestone: M3
scope: CONSTRUCTS Step 1 — the plane records the profile. `op=acquire` calls `identify()` and `doctypeFor()` and writes handler, content type, both confidences, signals and what was normalised onto the capture. Roughly twenty lines, and everything above it depends on it: a judgment whose author and version are unrecorded cannot be revised when the author turns out to be wrong. **This writes to CAPTURE's path and is a DELEGATION**, with FRAMEWORK's guidance; docprofile is read, never grown into a second copy. It may also be an I1 shape change — check before assuming it is additive.
behind-interface: I1
depends-on: FW-2
accepts-when: a capture carries its profile; the document page names the kind of document the record thinks it holds.
added: 2026-07-31 · BOB
landed:

---

## CONTENT-HTML — DORMANT
Not yet carvable; see `kickoffs/CONTENT-HTML.md`. D-64 waits on the rendered-capture
path, NOT on a doctrine ruling: D-55's doctrine was ruled by Bob (third-party script
output is attributed to that party) and its SHAPE is decided provisionally in
`MILESTONES.md` under M2 — attribute by ORIGIN via `rendered_origins[]`, not by region,
which needs no new reference granularity. Scope this area against that shape when a
slot frees.

## DIST — DORMANT, and it has grown a backlog
Batches releases from a green `main`; the deploy step is gated to Bob. New standing
work from the topology decision: D-115 (the installer installs ONE Worker and the
topology now has a fleet), D-116 (version authority must span the fleet, or D-106's
drift class returns multiplied), D-107 (no scripted installer deploy with read-back),
D-54 (the installer does not detect the Workers plan). Activate when a fleet member is
close to shipping, and not after it ships.

## UI — DORMANT
`civicos-ui/**`; CONSTRUCTS Steps 2 onward and the display half of D-82. Activate per
`UI-PLAN.md` when prioritised.

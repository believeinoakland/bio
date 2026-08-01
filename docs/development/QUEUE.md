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

### M0-2 · done
milestone: M0
scope: Backfill the negative-control register: one `NEGATIVE CONTROL: <what to break> -> <what must then fail>` line in the first 60 lines of each of the 42 suites. RUN each control, do not infer it; record what actually broke. Several are already written in prose in DEBT (D-104's is "let a governed refusal fall through -> 17 of 34 fail") and can be lifted, but each still gets run once to confirm it still holds.
behind-interface: none
depends-on: none
accepts-when: `npm run test:coverage` reports 42 of 42 suites declaring a control; spot-check three by breaking the subject and confirming the named failure.
added: 2026-07-31 · BOB
landed: 0dbcb86 — negative-control register backfilled across all 41 remaining bio-plane suites, each control RUN not inferred (three spot-checks reproduced, incl. D-104's 17-of-34 now 17-of-40). Comment-only, battery unchanged. Coverage now 53/53 declaring (CONDUCT reformatted FW-3 profile + FW-4 framework-digest-audit NC lines to the instrument's single-line `*/`-terminated form at integration). Findings: the fence is enforced in the AUTH layer (index.mjs:842), not the per-op gate; the C-19.1 inbox grammar check now fails 31 when neutered (the historical all-67-pass defect is genuinely covered).

### M0-3 · done
milestone: M0
scope: Name the 33 checks no assertion names. One assertion per check that tampers a conformant bundle and requires THAT check id in the findings. The catalog executes today via the conformance suite's zero-findings assertion, so these checks are exercised only in the direction that passes — the S-7 defect exactly, where C-20.1 skipped every mechanical entry and the audit reported clean because it was not looking. Largest single coverage gain available, and mechanical. Split across two or three workers if one turn is too long.
behind-interface: none
depends-on: none
accepts-when: `npm run test:coverage` reports 51 of 51 checks named; each new assertion fails when its tamper is removed.
added: 2026-07-31 · BOB
landed: 8dcb4ba — check-firing.test.mjs: all 33 previously-unnamed checks now named, 51/51 (100%, was 18/51). Each asserted BOTH ways (fires on a one-thing tamper of a conformant bundle, silent on the untouched base) — the paired assertion is the built-in negative control. battery 48/48 (2493). Closes the S-7 class.

### M0-4 · done
milestone: M0
scope: `npm test` becomes `node scripts/battery.mjs`, so a crash cannot hide the suites behind it (D-93 first half). Then the second half: `ratify.test.mjs` detects `ssh-keygen` and SKIPS LOUDLY with a named reason, or fails loudly — never quietly does less, and `sshsig` must report why it ran 16 rather than 18.
behind-interface: none
depends-on: none
accepts-when: with `ssh-keygen` hidden from PATH, `npm test` completes, reports the skip by name, and every other suite still runs.
added: 2026-07-31 · BOB
landed: 0e2c4f0 — `npm test` = `node scripts/battery.mjs` (discovering runner); ratify/reuse-ratify/signpage skip loudly (named) + sshsig reports 16+2skip named when ssh-keygen absent; battery.mjs skip-aware. Hidden-ssh-keygen: 45/48 green + 3 named skips, none hidden; normally 48/48. Corrected the stale "&& chain" text in CLAUDE.md + VERIFICATION.md. D-93 CLOSED.

### M0-5 · done
milestone: M0
scope: D-117 — teach `scripts/coverage.mjs` to enumerate FLEET members, not just `bio-plane/src/index.mjs`. The topology decision (I6) means a second Worker's surface is uncounted, so the day `pdf-worker` ships the figure stays flat while a whole component goes untested. Land in the same turn as the first fleet member, not after.
behind-interface: I6
depends-on: none
accepts-when: the instrument lists each fleet member and its three surfaces; adding a stub member with an untested op makes the run report it.
added: 2026-07-31 · BOB
landed: 7e5b67f (with CPDF-6) — coverage.mjs DISCOVERS fleet members from a fleet-member.json marker (never hand-listed), holds each to surface-ops-reached + a declared control; --strict fails on an uncovered member. Negative control: stub member with an untested op → reported UNREACHED, --strict exits 1.

### M0-6 · done
milestone: M0
scope: The hygiene check that closes the planning-drift CLASS, on D-113's precedent: every open row in `DEBT.md` carries a disposition token, every `QUEUED <ID>` names an ID that exists here, and every design-doc order-of-work item carries a status marker. Then `coverage.mjs --strict` becomes the gate. NOT before M0-1 to M0-3 land: a floor set above the current state fails on day one and gets switched off.
behind-interface: none
depends-on: M0-1, M0-2, M0-3
accepts-when: `npm run test:hygiene` fails when a disposition is removed from any open debt row, and when a design-doc item loses its status marker.
added: 2026-07-31 · BOB
landed: 6a72951 — planning-hygiene.test.mjs enforces the 3 planning-drift invariants IN THE BATTERY (open DEBT row carries a disposition token · every QUEUED <ID> ref resolves to a real queue item · every governed order-of-work item carries a status marker, + a discovery guard on new "Order of work" headings so the registry can't silently fall behind, D-113's failure mode). test:coverage now runs --strict (VERIFICATION step 5, the M0 gate ON). Caught + fixed the one real drift: CONSTRUCTS "The plan" 13 unmarked steps (CONDUCT then advanced Step 3→BUILT FW-5, Step 4→QUEUED FW-6). CONFORMANCE-AND-INTAKE-ARC order-of-work (closed/superseded migration) EXEMPTED with a stated reason, not red-lit. NCs RUN (strip a disposition/a status marker → named failure). battery 55/55, coverage --strict exit 0. M0 LANE COMPLETE (M0-1..6 all done).

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

### REC-3 · done
milestone: M7
scope: The small honesty defects in the plane's own surfaces, batched because each is minutes and none is worth a turn alone: D-39 (an empty POST body returns a Cloudflare 1101 rather than a named BIO refusal), D-110 (`setup.mjs` still explains the `NO_AUTHORITY` refusal D-97 removed), D-62 (`setup.mjs` omits `content_hash` when a document is attached, so a wizard-written bundle can never be released), D-78 (both bundle writers hardcode `surfaced_by: human`, so an assistant cannot honestly surface a focus).
behind-interface: I3
depends-on: none
accepts-when: an empty POST to five ops returns a named reason; a wizard-written bundle with a document carries `content_hash` and passes C-2.7; a focus written by an agent records `surfaced_by: agent`.
added: 2026-07-31 · BOB
landed: a0c6d98 — battery 51/51, coverage 85/85 (0 unreached). D-39 was already guarded at the DO (6ac72d0a); empty-body.test.mjs locks it in. D-110 stale NO_AUTHORITY deleted. D-62 setup.mjs emits content_hash for document bundles (clears C-2.7). D-78 surfaced_by SERVER-STAMPED at op=promote (agent vs human by actor class) — fixes both writers, no store/schema change. NCs RUN; all four DEBT rows self-closed. I3 note registered; revision-carry residual logged as D-121.

### REC-4 · done
milestone: M8
scope: The server-side TASK-ACTOR FENCE (lifted from UI-1's delegation). Today `taskResolve`/`taskForward` (`store.mjs` ~5299) refuse no-actor / no-such-task / already-resolved, but do NOT refuse a member who is neither the task's `assignee` nor an admin — any member-class credential can resolve or forward ANY task by id (the actor is stamped honestly into history, so it is traceable, but not PREVENTED). The TASK construct makes the refusal an accountability rule ("this is not yours to resolve, and here is who it is with"), and UI-1 renders that refusal — but it is COSMETIC until the plane enforces it. Add the fence in the plane, for BOTH `taskResolve` and `taskForward`: a caller who is neither the assignee nor an admin is refused with a NAMED reason mirroring the construct's refusal shape. RECONCILE with D-98's routing doctrine before over-fencing: an `unassigned` task is meant to be claimable by the routed role — check what the routing intends (member_expertise → PM → group admin) and keep that path open; the admin override stays. This is an I3 addition (a new named refusal reason), not a reshape.
behind-interface: I3
depends-on: none
accepts-when: a member who is neither the assignee nor an admin is refused `taskResolve`/`taskForward` on another's assigned task with the named reason; the assignee and an admin still succeed; an unassigned task stays claimable per D-98 routing; negative control — remove the fence and the non-assignee resolve succeeds again.
added: 2026-07-31 · CONDUCT
landed: edfbea5 — server-side task-actor fence (#refuseNotYours on taskForward+taskResolve): non-assignee non-admin refused NOT_YOURS "this task is not yours to <verb>; it is with <assignee>"; assignee + admin (#isAdminMember) succeed; unassigned stays claimable (D-98: unassigned EXISTS because routing found no PM/admin, so fencing it would strand it forever). BIG FIND: the ops were machine-credential-only (not in SESSION_OPS), so UI-1 was DEAD against the real plane (its mock never hit the op auth); REC-4 opened both to member/admin SESSIONS (TASK_ACTIONS→SESSION_OPS, NEEDS=null, identity-not-capability) — a spoofed body actor cannot pass (server stamps from session), and a machine credential is now fenced off assigned tasks. I3 1.2.0 (additive: NOT_YOURS reason + session reach). battery 57/57, coverage --strict 93/93. NC RUN + CONDUCT RE-RAN (neuter fence → 9 fail; restored 19). DEC-7 raised (bob-session).

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

### CPDF-6 · done
milestone: M2
heed: CPDF-5 findings — pin an unpdf/pdf.js version verified on the Workers runtime (one doc threw `Math.sumPrecise is not a function` on node v26), and handle permission-only encryption (pdf.js decrypts an empty-user-password PDF transparently; several ACFRs/staff reports are encrypted). Land M0-5 (fleet coverage instrument) in the SAME turn (per its item).
scope: **`pdf-worker`, the first fleet member (I6).** Holds `unpdf`; the plane hands it a capture sha and a store, it reads the bytes from R2 itself and returns the I2 structure+text shape in the record's terms rather than the library's. Writes NOTHING — no register row, no provenance, no capture. `CAPTURES` read binding only, never `PUBLISHED`. Tier 2 handles only the residue CPDF-5 measured. Lift the extraction logic and size guard from branch `content-pdf/phase2-text`.
behind-interface: I6
depends-on: CPDF-5, CPDF-7
accepts-when: the plane returns text for a CID-font PDF Tier 1 could not decode; the worker refuses to write anything; a request for a document over the envelope returns text-undetermined rather than truncated text.
added: 2026-07-31 · BOB
landed: 7e5b67f — pdf-worker/** (first fleet member, I6): POST /structure, CAPTURES-read-only (write-nothing structural — no PUBLISHED/DO binding), unpdf 1.8.0 pinned (verified on workerd, guarded polyfill for the node Math.sumPrecise artifact), bundle 0.55MB gzip (never in the plane). Plane escalates over env.PDF_WORKER only when Tier 1 got ~nothing; absent the binding it returns Tier 1 named. Tier 1 now NAMES encryption (CPDF-5 gap). battery 46/46 (2384); fleet coverage lists it; negative controls run. DELEGATIONS: RECORD I3 (escalation call site in index.mjs, landed here) + DIST (deploy the member+binding, install the fleet — D-115/116). Live-verify is CPDF-3 (gated).

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

### CAP-4 · done
milestone: M2
scope: `CAPTURE-SCALING.md` item 6, DECIDED 2026-07-31 under Bob's delegation — read that item before building, it carries four specifics. (a) Post-hoc reuse verification from `site_assets`, unconditional, costs zero requests, verdicts appended and dated. (b) At ratification, re-fetch every reused part: MANDATORY as an attempt and a record, never as agreement — `confirmed` / `changed` / `unavailable` all ratify, and ratifying with a reused part while saying nothing is what is forbidden. (c) A PLAIN GET, not `If-None-Match`: both cost one subrequest, and a 304 is the origin's assertion where a hash is our own evidence. This deliberately reverses the conditional-GET suggestion elsewhere in that document, which is right for working capture and wrong here. (d) A fourth outcome `not_attempted`, recorded with its reason, for parts the invocation's budget could not reach — bounded by the calibrated ceiling in `capture_limits`, never silently omitted.
behind-interface: none
depends-on: none
accepts-when: a bundle ratified with reused parts records an outcome for every reused part; a source that has gone dark still ratifies, as `unavailable`; a bundle whose reuse count exceeds the calibrated ceiling ratifies with the residue recorded `not_attempted`. Negative control — drop the outcome record and the suite fails naming the unrecorded part.
added: 2026-07-31 · BOB
landed: c7c57c9 — (a) post-hoc reuse verdicts on the change-case (zero requests, dated); (b) at ratification, re-fetch every reused part, four outcomes (confirmed/changed/unavailable/not_attempted) ALL ratify, recording is mandatory; (c) plain GET (our hash is evidence, not a 304); (d) not_attempted bounded by the calibrated ceiling. New table reuse_verdicts (in purge, D-113 hygiene green). battery 47/47 (2422); negative control run. I5 additive.

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

### FW-1 · done
milestone: M3
scope: Confirm or counter the provisional I2 structure interface that CONTENT-PDF produces — this is what turns I2 STABLE. Note CPDF-4 extends I2 with text, so answer the extended shape rather than the link-only one.
behind-interface: I2
depends-on: none
accepts-when: `INTERFACES.md` I2 records CONFIRMED, or a counter-proposal exists in `INTERFACE-CHANGES.md`.
added: 2026-07-31 · CONDUCT
landed: 44a867a — CONFIRMED: I2 (structure+text) STABLE 1.0.0; the shape serves FRAMEWORK (container-agnostic partitions imported not re-derived, undetermined first-class on both axes, tier stamped at the op). No code (battery already pins the shape). No counter — INTERFACE-CHANGES.md not needed yet.

### FW-3 · done
milestone: M3
scope: CONSTRUCTS Step 1 — the plane records the profile. `op=acquire` calls `identify()` and `doctypeFor()` and writes handler, content type, both confidences, signals and what was normalised onto the capture. Roughly twenty lines, and everything above it depends on it: a judgment whose author and version are unrecorded cannot be revised when the author turns out to be wrong. **This writes to CAPTURE's path and is a DELEGATION**, with FRAMEWORK's guidance; docprofile is read, never grown into a second copy. It may also be an I1 shape change — check before assuming it is additive.
behind-interface: I1
depends-on: FW-2
accepts-when: a capture carries its profile; the document page names the kind of document the record thinks it holds.
added: 2026-07-31 · BOB
landed: 02491bd — op=acquire records document.profile (docprofile identify/doctypeFor/profileRecord; recogniser key/label/version + confidence + signals on both axes, normalisation, kind, source content-type). FIRST plane consumer of docprofile. I1 bumped 1.1.0 (ADDITIVE — new sibling field; C-18.1 tolerates extra keys). Recognisers read the primary bounded (single-part ≤8MB textual); PDF/multipart profiles honestly as conservative/generic (profiled_from_text:false). battery 52/52, coverage 85/85. NC RUN (delete profile.handler → 2 fail). Step 2 (digests) deliberately left separate.

### FW-4 · done
milestone: M3
scope: CONSTRUCTS Step 2 — the plane COMPUTES and STORES the normalisation digests on the capture, per the handler's declared normalisation policy that FW-3 recorded (the three the framework's normalisation defines — read `docprofile` + `DOCUMENT-PROFILES.md`/`CONSTRUCTS.md` for the exact set; do not invent one). The raw-bytes identity already exists as `capture_sha` (I1 §1) — reuse it, do not recompute a second raw digest under a new name. Then wire `op=audit`'s duplicate sweep to compare the NORMALISED digest so it catches a duplicate whose viewstate/boilerplate differs, which it cannot see today. The Add-surface already-held check (`civicos-ui`, which today fetches both captures and compares in the browser) is a DOWNSTREAM UI consumer of the stored digest — recorded here, NOT built in this item (a DELEGATION note if you touch its shape).
behind-interface: I1
depends-on: FW-3
accepts-when: two captures of the same document differing only in viewstate/boilerplate report as duplicates through `op=audit`; negative control — two genuinely different documents do not, and dropping the normalised-digest write makes the sweep miss the viewstate pair again.
added: 2026-07-31 · CONDUCT
landed: 2145416 — op=acquire stores document.profile.digests {determined,rendition,evidentiary,boundary_missed?,basis}; identity REUSES capture_sha (verify-only, not restored). Three digests per DOCUMENT-PROFILES.md "Three digests, not one". C-18.3 dup sweep gained a NORMALISED arm folding register documents whose evidentiary digests match though raw bytes differ. Trust gate: stored determined only when read-as-text AND stack CERTAIN — undetermined records evidentiary:null and two nulls NEVER fold (dedup does not inherit compare()'s narrow-without-certainty licence, since folding hides a document). I1 1.2.0 ADDITIVE. battery 53/53, coverage 85/85, checks 51/51. NC RUN (force digestCertain=false → viewstate pair no longer folds, 21→15). DELEGATION FW→UI recorded (Add-surface consumes evidentiary digest; UI dormant).

### FW-5 · done
milestone: M3
scope: CONSTRUCTS Step 3 — READINGS ARE PERSISTED. A reading is `{ entities[], facts }` (`BIO_Content_Framework_v0_10.md`:480, `parse(ctx) -> reading`). Today `parse()` output is transient — produced in `docprofile/pipeline.mjs` (compare/monitor) and in `civicos-ui` content types, stored nowhere — which is the quiet blocker on cross-document entity resolution. In `op=acquire` (where FW-3 already reads the primary text and resolves the doctype), call the doctype's `parse()` on the captured text to produce the reading and PERSIST it in a NEW store table (I5, ADDITIVE — new table, no existing shape change), indexed by the entity REFERENCES the reading carries (the raw/source-assigned references AS THEY APPEAR — NOT a canonical entity id; resolving references to canonical entities IS Step 4/D-83 and must NOT be built here). "A reading that finds nothing is a failed reader, never an emptied document" (framework:489) — persist a failed/empty reading honestly as such, never fabricate entities. Consumer: Step 4 (the entity axis).
behind-interface: I5
depends-on: FW-4
accepts-when: after `op=acquire`+promote, a document's reading (its `entities[]`+`facts`) is retrievable from the store, and a lookup by an entity reference returns the documents whose readings carry it; negative control — dropping the persist makes the reference lookup return nothing for a document known to contain it.
added: 2026-07-31 · CONDUCT
landed: aee6d52 — op=acquire runs the doctype parse() over the text FW-3/4 already read; reading {content_type,reader_version,found,at,entities[{key,kind,label,facts,ref}],facts} persisted at op=promote, DERIVED from provenance.json in the register txn (a projection, not a second source of truth). Two new tables readings(PK capture_sha) + reading_refs(PK capture_sha,ref; INDEX on ref) storing RAW kind:key refs — canonical resolution left to Step 4/D-83. op=reading + op=readingref reverse index (87/87 ops, 0 unreached). Failed/empty readings persist honestly (found:false). I5 additive 1.1.0; both tables in purge (D-113). battery 54/54. NC RUN (comment out #writeReadings → reference lookup returns nothing, true→false).

### FW-6 · done
milestone: M4
scope: CONSTRUCTS Step 4, SLICE A — the SUBJECT REGISTRY / entity axis, built ONCE (D-83: the framework's entity axis and `BIO_Declared_Bias_v0_1.md` safeguard 4's subject registry are the SAME construct; building them twice is the live risk). A new store registry (I5, ADDITIVE) of ENTITIES — the subject kinds safeguard 4 names (source, institution, office, movement; RECONCILE with the framework's own entity kinds and FLAG as a DEC any kind the doctrine leaves ambiguous, e.g. person/ordinance) — each with first-class ALIASES — plus DECLARED RELATIONS between entries (`proxy_for`, `member_of`, `overlaps`), each carrying a justification + citation "like a pattern statement" (read safeguard 4 + the pattern-statement shape). A declared relation is CONSTITUTIVE, not evidentiary: it sits OUTSIDE the §8.1 A–D connection grade — do NOT attach a grade to it (grading it Grade D is a category error, D-83). Ops to create and read entities/aliases/relations. This slice is the registry itself; RESOLVING a reading reference (`reading_refs`, FW-5) to a registry entity, declaring the §8.1 method-as-grade, is the NEXT slice — do NOT build recognisers here.
behind-interface: I5
depends-on: FW-5
accepts-when: an entity with aliases and a justified `proxy_for`/`member_of`/`overlaps` relation round-trips through the store and is retrievable by key and by alias; a declared relation carries NO connection grade; negative control — dropping the alias/relation persist makes the retrieval return nothing for one known to exist.
added: 2026-07-31 · CONDUCT
landed: 4037add — the SUBJECT REGISTRY built ONCE (D-83 closed for the "built twice" risk). 3 tables entities/entity_aliases/entity_relations (I5 1.2.0), kind = closed UNION of safeguard 4's four subject kinds + the framework's entity kinds (DEC-6 leaves the bias-statement-reach question for Bob; union now, no migration either way). Aliases first-class (case/space-folded reverse lookup). Declared relations proxy_for/member_of/overlaps carry NOT-NULL justification+citation and STRUCTURALLY NO grade column (D-83 category error prevented by shape). 6 ops (entitycreate/entityalias/relationdeclare mutating + entity/entitybyalias/relation), registry writes ruled "contribute" capability (corpus-shaping). ops 93/93 (0 unreached, --strict), purge covers all 3 (D-113). battery 56/56. NC RUN (drop alias/relation persist → lookup empty). NEXT slice: the recognisers (reading_ref → entity, method=§8.1 grade).

### FW-7 · done
milestone: M4
scope: CONSTRUCTS Step 4, SLICE B — the RECOGNISERS. Resolve a reading reference (`reading_refs`, FW-5, a raw `kind:key`) to a registry entity (`entities`/`entity_aliases`, FW-6), and DECLARE THE METHOD, which IS the §8.1 connection grade (framework §8.1): **A** = the source's own identifier, both ends captured; **B** = an identifier the source uses, matched exactly in captured content at both ends; **C** = correspondence (a name/title/date proximity), NEVER presented as established and flagged for a member to confirm. Store each resolution (`capture_sha`/reading_ref → `entity_id`, with grade + method) in a new table (I5, additive). This delivers the reverse index — "every document that concerns this entity" — the single largest piece of manual work the framework removes. Undetermined is first-class: a reference matching NO entity stays honestly UNRESOLVED (never force-matched); a Grade C correspondence is flagged for confirmation, never shown as established (an equality that costs nothing is not evidence). A declared relation (FW-6) is constitutive and stays OUTSIDE this grade — do NOT grade relations. Grade is IMPROVABLE (§8.1: a C becomes B when a shared identifier is found) — model the resolution so its grade can be RAISED, not frozen.
behind-interface: I5
depends-on: FW-5, FW-6
accepts-when: a reading reference matching an entity's alias resolves to it at grade C, and one matching a source identifier at both ends resolves at grade A/B; "every document concerning entity X" returns the captures whose readings resolve to X; a reference matching nothing is honestly unresolved; negative control — a Grade C resolution is not reported as established, AND dropping the resolver empties the reverse index for a document known to concern X.
added: 2026-07-31 · CONDUCT
landed: 2d11c03 — the RECOGNISERS: new DERIVED table `resolutions` (capture_sha,ref,entity_id PK; grade,method,basis,established,raised_from). #recognise matches a reading_ref against entity_aliases in strict priority — A composite id, B bare id in content, C name correspondence — records at the strongest tier that hit, never traverses a declared relation (D-83). Grade IMPROVABLE in place (C→A via raised_from; #upsertResolution never downgrades, never duplicates). Grade C STRUCTURALLY can't read established. op=concerns = the reverse index "every document that concerns entity X". op=resolvetestify holds member grade-D testimony (author+date, never machine-minted). 4 ops (resolve/resolvetestify mutating contribute + resolutions/concerns reads). I5 1.3.0 additive. purge covers it (both arms, D-113). battery 58/58, coverage --strict 97/97. NCs RUN (force C established → 3 fail; neuter upsert → reverse index empties). CONSTRUCTS Step 4 COMPLETE (registry + recognisers).

### FW-8 · done
milestone: M4
scope: CONSTRUCTS Step 5, SLICE A — PROGRESSIONS AS DATA (framework §8.2, "generalises the connection table rather than sitting beside it"). Absorbs D-67 (connections are EMITTED and nothing stores/relates/shows them) and D-72 (connections have NO grade). Built on FW-7's `resolutions` (two documents resolving to the same entity is the raw material of a connection). (1) PERSIST a CONNECTION as data carrying a GRADE — the §8.1 A–D method-as-grade FW-7 computes per resolution; a connection between two documents derives from how each end resolved (D-72 closed). First find where connections are EMITTED today (D-67) and build storage under them, not a parallel path. (2) Model the PROGRESSION DEFINITION as data: ordered stages with `after`, cardinality, interval, required-ness — such that BOTH example progressions are expressible as rows: **meeting→agenda→minutes** AND **need→award→signed-contract** (the acceptance). DEFER to slice B and FLAG it in your report: progression INSTANCES, weakest-grade inheritance along a chain (D-73, pair→chain), exception documents that discharge a legitimate skip, junction checks as findings, and the task that walks the table for a missing predecessor. New tables are I5-additive (schema traps: BEFORE host_governor, no backticks, add to purge — D-113). Give every new op a control-plane assertion (coverage runs --strict).
behind-interface: I5
depends-on: FW-7
accepts-when: both meeting→agenda→minutes and need→award→signed-contract are expressible as progression-definition rows; a connection persists carrying its §8.1 grade and is retrievable; negative control — dropping the grade write leaves a connection ungraded (D-72 regressed), and dropping the persist loses the connection (D-67 regressed).
added: 2026-07-31 · CONDUCT
landed: fe81904 — connections as data + progression definitions. op=connect (deriveConnections) builds on FW-7's same-entity collapse (op=concerns), NOT a parallel path: one `connections` row per capture-pair sharing an entity, GRADE = the WEAKER of the two ends' §8.1 grades (weakest-link base case), established derives from it (a C at either end can never read established). asserted_by three-valued + DISTINCT from grade, forced `system` server-side. Improvable (upsert keyed a/b/entity, re-derive raises with FW-7). progression_defs + progression_stages (after/cardinality/interval/required) author via op=progressiondefine (member-declared, framework §8.1 note 3); BOTH examples round-trip as rows (meeting→agenda→minutes, need→…→contract). 4 ops (connect/progressiondefine mutating + connections/progression reads), 101/101 --strict. I5 1.4.0, purge covers all 3 (D-113). battery 59/59. NCs RUN (weaker→stronger grade; disable persist). DEFERRED slice B: instances, N-chain inheritance, exception docs, junction findings, missing-predecessor task.

### FW-9 · queued
milestone: M4
scope: CONSTRUCTS Step 5, SLICE B — progression INSTANCES and the MISSING-PREDECESSOR finding (M4's acceptance: "a progression with a missing predecessor is visible"). Built on FW-8's `progression_defs`/`progression_stages` + `connections`. (1) A progression INSTANCE threads REAL documents through a definition's stages via their entity connections (FW-8 `connections` / FW-7 `resolutions`) — one instance per (definition, threading entity). (2) Its grade = the WEAKEST grade along the chain (D-73 pair→chain; FW-8 did the 2-node base case, do the general N-stage inheritance here). (3) The MISSING-PREDECESSOR finding: a stage that is `required` (always/usually) with no document in the instance surfaces as a finding carrying the instance's grade (an award with no solicitation — the framework's own example). DEFER and FLAG: exception documents that discharge a legitimate skip; junction checks as findings; the SCHEDULED task that walks the table (rides the REC-1 DO-alarm scheduler — a later slice). New tables I5-additive (schema traps: BEFORE host_governor, no backticks, purge/D-113). New ops get control-plane assertions (--strict).
behind-interface: I5
depends-on: FW-8
accepts-when: threading the need→award→contract documents MINUS the solicitation through the procurement definition yields an instance whose missing `solicitation` stage surfaces as a finding; the instance's grade is the weakest connection along its chain; negative control — dropping the missing-predecessor check hides the gap, and forcing the chain grade to the strongest hides a weak link.
added: 2026-07-31 · CONDUCT
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

## UI — ACTIVE (M8, activated 2026-07-31 by CONDUCT: M0 lane complete, a slot free)
`civicos-ui/**`; the member surfaces of M8, per `UI-PLAN.md` and the interaction
constructs **v0.2** (`BIO_Interaction_Constructs_v0_1.md` — the count came down to TWO
constructs + a weight ladder + the TASK/QUEUE attention layer; MILESTONES M8 build-order:
**the queue FIRST**). NOTE: this supersedes the earlier drained-inbox note's v0.1
`T→J→B(+S)→P→A` order — MILESTONES M8 already carries v0.2, so the queue-first order governs.
The display half of D-82 (`surfaced_by`) and the FW-4→UI already-held delegation are later
UI items, not UI-1.

### UI-1 · done
milestone: M8
scope: The TASK INBOX — the member surface for the attention layer, which MILESTONES M8 builds FIRST. The plane HALF ALREADY EXISTS (D-98, 0.49.0): ops `tasks`, `taskforward`, `taskresolve`, routing through `member_expertise` → project manager → group admin, forwardable, deduped on `(refers_to, kind)`. It has NO surface — "the record can be obliged to ask a person something and has nowhere to ask," M8's sharpest gap. Build the `civicos-ui` surface that lists a member's tasks (each says *this needs you* and POINTS AT the act it resolves in), and lets them forward (`taskforward`) and resolve (`taskresolve`). Honour the TASK construct's accountability rules: a task is never silently dropped (it AGES with a recorded reason, D-79) and is addressed to somebody or honestly `unassigned` (never a phantom); the refusal shape is "this is not yours to resolve, and here is who it is with." This is ONE construct's surface (the queue) + the wiring to the acts it points at — NOT the acts themselves (the ACT construct is later items). The clock half (D-86: temporal expectations + bias debt as obligations-with-a-clock) is related — surface what the existing ops expose and NOTE any gap rather than building the clock here.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a task-inbox test that lists a member's tasks, forwards one and resolves one through the plane ops, and shows an `unassigned` task honestly; negative control — break the `taskresolve` wiring and the resolve path fails.
added: 2026-07-31 · CONDUCT
landed: 105198b — the TASK INBOX ships: a member Tasks screen over the existing plane ops (tasks/taskforward/taskresolve/memberlist/whoami, D-98), partitioned honestly into Yours / Unassigned / With-other-members. Accountability rules rendered: age from created (an ageing REASON shown only if the task history carries one — never fabricated; the D-79 ageing job doesn't exist yet), unassigned-not-phantom, refusal shape "this isn't yours to resolve — it's with <assignee>". Points at the act (openBundle refers_to), does not reimplement it. Clock-half gap (D-86) NOTED not built (ops expose no clock; TASK_KINDS only authority-undetermined). civicos-ui/test/run.mjs green (14 harnesses incl task-inbox 33). Plane battery untouched. NC RUN (taskresolve→tasknope, 4 fail). DELEGATION UI→RECORD raised: the plane lets any member resolve/forward any task — the refusal is cosmetic until the plane enforces it (→ REC-4).

### UI-2 · done
milestone: M8
scope: The first ACT surface — v0.2's FALSIFIABLE TEST ("build the queue and ONE act; if the next three acts each need a new construct, the collapse was wrong"). Build ONE act through the ACT construct and its WEIGHT LADDER (reversible · reasoned · terminal · attested), as a JUSTIFIED TRANSITION (interaction-constructs v0.2, §J — "a state change carrying authored text that becomes evidence"). Cleanest existing candidate: FOCUS DISPOSITION (`op=dispose` to deferred/dismissed), which C-2.8 ALREADY requires a reason for — a natural "reasoned" rung. Build the ONE MOTION the construct names: CHOOSE the act; see WHAT IT WILL REFUSE and WHY *before* it runs (pre-flight the refusal — e.g. the C-2.8 reason requirement); AUTHOR the reason (required, NEVER prefilled); get a RECEIPT. Show the act's weight-ladder position. Confirm the plane op and its refusal shape by grep; if a needed pre-flight/refusal isn't exposed, DELEGATE to RECORD, do not reshape the plane. The two-construct-collapse verdict (did this act fit the one construct, or need a new one?) is a REPORTED DELIVERABLE — v0.2's test.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with an act test that disposes a focus with an authored reason and gets a receipt, and that the act is REFUSED (reason shown) when the required reason is absent; negative control — remove the reason-required pre-flight and the empty-reason act is no longer refused in the surface.
added: 2026-07-31 · CONDUCT
landed: 0e34d9b — the first ACT surface: focus DISPOSITION (defer/dismiss) as a JUSTIFIED TRANSITION. The one motion renders in full: CHOOSE (radio, re-runs pre-flight) · PRE-FLIGHT "before this runs — what it will refuse and why" (C-2.8 NO_REASON, BAD_REASON grammar, ILLEGAL_TRANSITION vs the plane LEGAL table) with commit disabled until it clears AND re-checked as the real gate · AUTHOR the reason (required, NEVER prefilled) · RECEIPT from the plane return · weight ladder with "reasoned" marked. op=dispose is SELECTION-scoped (op=select {ids:[focus]} → dispose handle), author server-stamped, no plane reshape. COLLAPSE VERDICT: the ACT construct FIT (evidence FOR v0.2 collapse). civicos-ui 15 harnesses green (act-dispose 50). Plane battery untouched. NC RUN (disable pre-flight gate → empty-reason act reaches the plane). DEC-8 raised: the pre-flight has no plane DRY-RUN primitive (mirrored client-side; won't generalise to server-state refusals).

### UI-3 · queued
milestone: M8
scope: The SECOND act — a BALLOT — continuing v0.2's FALSIFIABLE test (does the ACT construct hold for an act UNLIKE the justified transition? "if the next three acts each need a new construct, the collapse was wrong" — this is act two). A ballot is a multi-party act with COMPUTED ARITHMETIC: the arithmetic already exists as ops (`adminarith`, `projectownerarith` — computed, not transcribed). Build ONE ballot (e.g. administrator addition past the second, or owner add/remove) through the SAME ACT construct + weight ladder UI-2 established (choose · see what it will refuse and why BEFORE it runs · author · receipt), PLUS the ballot's two extra properties the construct names (v0.2 §B): SHOW THE DENOMINATOR (a fact a member can check — "2 of 3 endorsements", never "pending approval"), and DISPLAY THE DIVERGENCE AT TWO OWNERS (the row a shared implementation gets wrong) — never restating the rule in the interface, where it would drift from the plane. REPORT the collapse verdict (did the ballot fit the one construct, or need a new one?). Consume the arithmetic op; DELEGATE to RECORD if a needed pre-flight isn't exposed (cf. DEC-8), do not reshape the plane.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a ballot test showing the computed tally/denominator FROM the arithmetic op and an act that refuses+explains before it runs; negative control — break the denominator wiring and the tally no longer reflects the op.
added: 2026-07-31 · CONDUCT
landed:

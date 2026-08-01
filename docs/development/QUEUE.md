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

### 2026-07-31 · BOB · office formats researched; the FIRST item is not a parser

`docs/development/OFFICE-FORMATS.md` is new (D-121, D-122, D-123, DEC-5). Spreadsheet,
Word-format and presentation support, researched at Bob's direction. Read it before
scoping any of it; three things matter for the queue.

**1. It is ONE container, not three formats.** OOXML is a ZIP of XML parts and ODF is
the same shape. MEASURED in workerd this turn: `DecompressionStream("deflate-raw")`
exists and round-trips, so the container needs no dependency. Office text is XML text
nodes — easier than PDF, no glyph problem, **no Tier 2 and no fleet member**.

**2. The first item is the FORMAT REGISTRY, with HTML and PDF moved onto it — not a
`.docx` parser.** Dispatch today is two mechanisms (`HTML_CT` at acquire time, a
separate `op=pdfstructure` at read time); three more formats makes five special cases
across two. The framework specifies a uniform recogniser plus a per-axis registry and
names FORMAT as a candidate axis, and D-70 says the uniformity claim is untested
because no third axis has ever been added. Adding formats before the registry means
building them twice.

**3. It needs `INTERFACE-CHANGES.md`, which does not exist.** I2's element reference is
`{page, rect}`; a sheet's is `{sheet, cell}` and a slide's is `{slide, shape}`. That is
a change to a shape FRAMEWORK builds against, so it uses the change protocol — and the
protocol file has deliberately never been written. Expect to write it as part of the
work. FRAMEWORK is dormant, so **you answer on its behalf in writing** (protocol step
3).

Nothing here supersedes a queue item or stops a worker. DEC-5 blocks only step 6 (the
evidentiary extras); steps 1–5 are unaffected.

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

### REC-5 · done
milestone: M4
scope: Close D-122 — connections AUTO-DERIVE. Today `op=connect` is a manual `contribute` mutation nothing calls, so the entity axis is BUILT but stays EMPTY (UI-4's subject view is usually blank; the whole FW-6→10 machinery only populates by hand). Make connections derive automatically for an entity when its resolutions change. PREFER the SCHEDULED sweep on REC-1's DO-alarm (grep `store.mjs` with `grep -a` for the `#schedConsumers` registry; the consumer pattern is in `scheduler.test.mjs` / `task-drain-alarm.test.mjs`): register a consumer that on tick runs the `op=connect` derivation (`deriveConnections`) for entities whose resolutions changed since last swept, self-terminating when caught up. (Derive-on-resolve — deriving synchronously at `op=resolve` for the ONE affected entity — is an acceptable alternative if the scheduled path proves heavy; FW-8 avoided per-resolve derivation for O(n²) reasons, so a synchronous variant MUST be scoped to the single affected entity, never the whole store.) Idempotent — a re-derivation UPSERTS (FW-8's `connections` are keyed), never duplicates. This is the engine that makes the entity axis SELF-POPULATING and the foundation the deferred progression walking-task (FW-9/FW-10) will extend. DEFER and flag: auto-assembling progression instances + surfacing missing-predecessor findings on the same tick.
behind-interface: I5
depends-on: none
accepts-when: after a document resolves to an entity, the connections among that entity's documents appear WITHOUT a manual `op=connect` (via the tick or the resolve hook) and are visible through `op=connections`; negative control — disable the auto-derivation and the connections stay empty until a manual `op=connect`.
added: 2026-07-31 · CONDUCT
landed: 6fdb763 — connections AUTO-DERIVE (D-122 closed). SCHEDULED sweep on REC-1's DO alarm (a `connection-derive` consumer in #schedConsumers) — the FIRST framework consumer to ride REC-1, the foundation the deferred walking-task extends. Watermark table connection_dirty (entity_id PK), stamped in #upsertResolution ONLY on INSERT or grade-RAISE (many resolutions on one entity → one pending row), so the sweep is bounded by distinct changed entities. resolveReferences/testifyResolution now async + arm the alarm. Bounded (batch 100), self-terminating (wake null when drained → alarm deleted), idempotent (derive-then-delete, deriveConnections upserts). asserted_by stays system. cadence 60000ms (tactical). I5 1.7.0, purge whole-store arm (D-113). battery 62/62, --strict 105/105. NCs RUN (neuter batch → 15 fail, manual op=connect still passes; scheduler own NC 8 fail). DEFERRED (now UNBLOCKED): progression-instance auto-assembly + missing-predecessor surfacing on the same tick.

### REC-6 · done
milestone: M8
scope: `op=proposals` — the DISCOVERY feed for derived findings (from UI-5's delegation). There is NO op that enumerates derived findings, so UI-5's proposal surface can render/aggregate/act but cannot DISCOVER what to show — it ships with a gap banner. Add a read op that ENUMERATES the record's current derived findings: primarily FW-9's MISSING-PREDECESSOR findings across all progression instances (walk `progression_instances` → assemble → the required-undischarged stages), aggregated per D-79 (one proposal per (progression_key, stage_key) with N instances, weakest grade), each carrying its grade + `surfaced_by: machine`. This is the READ side of the walking-task FW-9/FW-10 deferred (it does NOT need the scheduled alarm — a read-time walk is fine; the alarm is for PUSH). Optionally include inferred connections as a second finding kind if clean. Derived findings INFORM — the op reports, never mutates.
behind-interface: I3
depends-on: none
accepts-when: `op=proposals` returns the missing-predecessor findings for a store with a gap-carrying instance, aggregated (N instances = one entry), each with its grade and machine provenance; UI-5's surface populates from it; negative control — a store with no gaps returns an empty feed, and dropping the instance-walk returns nothing for a store known to have a gap.
added: 2026-07-31 · CONDUCT
landed: 80eca24 — op=proposals, the DISCOVERY feed. ONE read-time walk (SELECT DISTINCT progression_key,entity_id FROM progression_instances → #assembleInstance, the SAME derivation op=instance uses so it can never drift) returns BOTH: instances[] (the raw shape UI-5's loadProposals ALREADY reads → its gap banner retires with ZERO UI change) AND proposals[] (server-side D-79 aggregation: one per (progression_key,stage_key), N instances, weakest §8.1 grade, surfaced_by machine, widest-first). Discharges + non-required stages excluded at the derivation point (a discharged gap drops out, N=2→1). Connections deferred (flagged). I3 1.3.0 additive. battery 63/63, --strict 106/106. NC RUN (empty walk → feed empty for a gap store). No DEC (instances-vs-aggregated was a delegated mechanism call).

### REC-7 · queued
milestone: M8
scope: `op=proposedispose` — record a PROPOSAL's defer/dismiss WITHOUT minting a bundle (from UI-5's delegation). `op=dispose` disposes a focus BUNDLE (handle + state); a bare derived proposal has no bundle, so a member's defer/dismiss of a proposal has nowhere to land — UI-5's defer/dismiss is degraded. Doctrine is SETTLED (D-79: a finding AGES with a recorded reason rather than vanishing; a DECLINED proposal must NOT mint a bundle — declining is not authoring), so this is a mechanism gap, not a DEC. Add the proposal-disposition store (a small table keyed by the proposal's identity — (progression_key, stage_key) per D-79 aggregation) + `op=proposedispose` recording deferred/dismissed with a REQUIRED reason (never prefilled) and the deciding member (server-stamped); a dismissed/deferred proposal is filtered from (or annotated in) the REC-6 feed, and AGES rather than disappearing. I5-additive (schema traps: before host_governor, no backticks, purge/D-113).
behind-interface: I3
depends-on: none
accepts-when: a member defers/dismisses a proposal with a reason → it is recorded (no bundle minted) and no longer surfaces as open in `op=proposals` (or surfaces annotated as deferred/dismissed with its reason), while an undismissed one still does; negative control — dispose without a reason is refused NO_REASON; dropping the store makes the dismissed proposal reappear as open.
added: 2026-07-31 · CONDUCT
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

### FW-9 · done
milestone: M4
scope: CONSTRUCTS Step 5, SLICE B — progression INSTANCES and the MISSING-PREDECESSOR finding (M4's acceptance: "a progression with a missing predecessor is visible"). Built on FW-8's `progression_defs`/`progression_stages` + `connections`. (1) A progression INSTANCE threads REAL documents through a definition's stages via their entity connections (FW-8 `connections` / FW-7 `resolutions`) — one instance per (definition, threading entity). (2) Its grade = the WEAKEST grade along the chain (D-73 pair→chain; FW-8 did the 2-node base case, do the general N-stage inheritance here). (3) The MISSING-PREDECESSOR finding: a stage that is `required` (always/usually) with no document in the instance surfaces as a finding carrying the instance's grade (an award with no solicitation — the framework's own example). DEFER and FLAG: exception documents that discharge a legitimate skip; junction checks as findings; the SCHEDULED task that walks the table (rides the REC-1 DO-alarm scheduler — a later slice). New tables I5-additive (schema traps: BEFORE host_governor, no backticks, purge/D-113). New ops get control-plane assertions (--strict).
behind-interface: I5
depends-on: FW-8
accepts-when: threading the need→award→contract documents MINUS the solicitation through the procurement definition yields an instance whose missing `solicitation` stage surfaces as a finding; the instance's grade is the weakest connection along its chain; negative control — dropping the missing-predecessor check hides the gap, and forcing the chain grade to the strongest hides a weak link.
added: 2026-07-31 · CONDUCT
landed: d5da71d — progression INSTANCES + the missing-predecessor finding (M4 acceptance). One table progression_instances (a row per doc placed at a stage; instance = rows sharing progression_key+entity_id). op=thread admits a placement ONLY if the doc RESOLVES to the threading entity (FW-7), else NOT_CONCERNED; grade is the RECORD's strongest resolution, never the caller's; threadedBy stamped server-side. Grade + findings DERIVED ON READ (never stored stale): instance grade = weakest along the chain of consecutive placed stages (N-stage generalisation of FW-8's 2-node #weakerGrade; D-73 chain done). Missing REQUIRED stage (always/usually) → missing_predecessor finding carrying the instance grade; sometimes/never respected; <2 stages → grade null (undetermined honest). op=thread/instance, I5 1.5.0, purge both arms (D-113). battery 60/60, --strict 103/103. NCs RUN (empty REQUIRED_FIRES hides the gap; weaker→stronger hides the weak link). DEC-9 raised (unless_exception firing, deferred exception machinery). DEFERRED slice C: exception docs, junction findings, the scheduled walking-task (rides REC-1).

### FW-10 · done
milestone: M4
scope: CONSTRUCTS Step 5, SLICE C (part) — EXCEPTION DOCUMENTS that discharge a legitimate skip (framework §8.2), building on FW-9's missing-predecessor findings. A missing REQUIRED stage that HAS a discharging exception document is NOT a gap (a lawful skip — e.g. an emergency-procurement memo discharging a missing solicitation). Model exception documents (a document, threaded to the instance, naming the stage it discharges and carrying a reason/citation), and make FW-9's `#assembleInstance` missing-predecessor check consult them: a required stage with a discharging exception → NO finding (or a distinct "discharged" state, not a gap). This ALSO gives DEC-9 its mechanism: `unless_exception` stages become DISCHARGEABLE — firing a finding ONLY when required-and-undischarged (DEC-9 recommended exactly this once the exception-doc slice lands; implement the mechanism and note in DEC-9 that it now exists — Bob still rules the policy, don't pre-empt it). DEFER and FLAG: junction checks as findings; the scheduled walking-task (rides REC-1). New tables/columns I5-additive (schema traps: BEFORE host_governor, no backticks, purge/D-113). New ops get control-plane assertions (--strict).
behind-interface: I5
depends-on: FW-9
accepts-when: a procurement instance missing its solicitation but carrying a discharging exception document surfaces NO missing-predecessor finding for that stage (while one WITHOUT the exception still does); an `unless_exception` stage fires only when undischarged; negative control — ignore the exception document and the finding reappears.
added: 2026-07-31 · CONDUCT
landed: 93c9601 — EXCEPTION DOCUMENTS that discharge a lawful skip. New table progression_exceptions (a real captured doc threaded to an instance, naming the ONE stage it discharges, NOT-NULL reason+citation). dischargeStage EARNS it at write (NOT_CONCERNED/BAD_STAGE/NO_REASON/NO_CITATION — must resolve to the entity, name a real stage). #assembleInstance consults them DERIVED-ON-READ: a required stage missing-but-discharged → distinct discharged_skip state (shows reason/citation/doc), NOT a missing_predecessor, NOT silent; undischarged-required still fires; an exception on a PRESENT stage is inert+VISIBLE (op=exceptions), not refused (read-time, since missingness changes as op=thread replaces placements — a sound mechanism call, accepted). DEC-9 MECHANISM built (unless_exception now dischargeable, fires only when required-and-undischarged) — DEC-9 left OPEN for Bob's policy. Corrected 3 superseded FW-9 tests (SUPERSEDED-by-FW-10, not exempted). op=discharge/exceptions, I5 1.6.0, purge both arms (D-113). battery 61/61, --strict 105/105. NC RUN (force discharged=false → skip reverts to a finding). DEFERRED: junction checks, the scheduled walking-task.

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

### UI-3 · done
milestone: M8
scope: The SECOND act — a BALLOT — continuing v0.2's FALSIFIABLE test (does the ACT construct hold for an act UNLIKE the justified transition? "if the next three acts each need a new construct, the collapse was wrong" — this is act two). A ballot is a multi-party act with COMPUTED ARITHMETIC: the arithmetic already exists as ops (`adminarith`, `projectownerarith` — computed, not transcribed). Build ONE ballot (e.g. administrator addition past the second, or owner add/remove) through the SAME ACT construct + weight ladder UI-2 established (choose · see what it will refuse and why BEFORE it runs · author · receipt), PLUS the ballot's two extra properties the construct names (v0.2 §B): SHOW THE DENOMINATOR (a fact a member can check — "2 of 3 endorsements", never "pending approval"), and DISPLAY THE DIVERGENCE AT TWO OWNERS (the row a shared implementation gets wrong) — never restating the rule in the interface, where it would drift from the plane. REPORT the collapse verdict (did the ballot fit the one construct, or need a new one?). Consume the arithmetic op; DELEGATE to RECORD if a needed pre-flight isn't exposed (cf. DEC-8), do not reshape the plane.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a ballot test showing the computed tally/denominator FROM the arithmetic op and an act that refuses+explains before it runs; negative control — break the denominator wiring and the tally no longer reflects the op.
added: 2026-07-31 · CONDUCT
landed: 719473b — the SECOND act: a BALLOT (project owner removal, §7.10) through the SAME ACT construct + weight ladder. Denominator read STRAIGHT off op=projectownerarith's `live` row (votesNeeded/eligibleVoters/owners) — "N of M owners' votes"; running tally from op=projectownerremove's VOTES_SHORT return; NO floor(n/2)+1 in the UI, never "pending approval". Two-owner DIVERGENCE rendered from the op's `table` (n=2 row flagged, in the op's own `why` words) and proven at pre-flight (self-vote allowed at 2, refused TARGET_CANNOT_VOTE at 5). COLLAPSE VERDICT: FIT — act two held, the §B ballot properties are a STATUS DISPLAY not a new interaction (v0.2 confirmed). REDUCES DEC-8: projectownerarith is a partial server-side dry-run (LAST_OWNER/TARGET_CANNOT_VOTE read off live, not client-mirrored). civicos-ui 16/16 (act-ballot 61). Plane battery untouched. NC RUN (break denominator wiring → panel shows 99 of 5 vs op's 3 of 5). No new DEC, no delegation.

### UI-4 · done
milestone: M8
scope: The SUBJECT VIEW — "what the record knows about a subject", making the M4 reverse index MEMBER-VISIBLE (`op=concerns` already turns "every document that concerns this ordinance" into one query; UI-4 makes it a page — the member-facing payoff of the entity axis FW-6/7/8 built). Given a registry entity (found via `op=entity` / `op=entitybyalias` — search by name/alias), show: (1) the ENTITY — kind, label, aliases, and declared relations (proxy_for/member_of/overlaps) with their justification+citation; a declared relation carries NO connection grade — show it as CONSTITUTIVE, not evidentiary, never with an A–D grade. (2) EVERY DOCUMENT that concerns it (`op=concerns`), each with its resolution GRADE shown HONESTLY — a Grade C correspondence flagged "plausible, not established / unconfirmed", NEVER shown as established (an equality that costs nothing is not evidence). (3) the graded CONNECTIONS among those documents (`op=connections`), each connection's §8.1 grade = the weaker of its two ends. Consume I3 ops (all exist: entity, entitybyalias, concerns, connections, relation) — do NOT reshape the plane; DELEGATE to RECORD if something needed isn't exposed.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a subject-view test that looks up an entity by alias, lists the documents that concern it from `op=concerns` with their grades, shows a Grade C document as unconfirmed (not established), and shows a declared relation WITHOUT a connection grade; negative control — render a Grade C resolution as established and the test fails.
added: 2026-07-31 · CONDUCT
landed: d2d94df — the SUBJECT VIEW: a read-only "Subjects" screen making the M4 reverse index member-visible. Find a subject by name/alias (op=entitybyalias, ambiguous names listed not collapsed) or id (op=entity); shows the entity + declared relations (justification+citation, labelled CONSTITUTIVE, structurally NO grade — D-83), every document that concerns it (op=concerns) at its HONEST grade (established only when established && !needs_confirmation, both read from the op; a C renders "unconfirmed / plausible, not established"), and the graded connections (op=connections, grade = weaker end). civicos-ui 17 harnesses green (subject-view 33). Plane battery untouched. NC RUN (force the established branch → C reads established, 5 fail). No DEC. NOTE: connections only show if op=connect was run (no auto-derivation) → logged D-122.

### UI-5 · done
milestone: M8
scope: The THIRD act — a PROPOSAL — completing v0.2's falsifiable test (act three of "the next three acts"; also closes D-82's DISPLAY half). A proposal is a DERIVED finding awaiting an AUTHORED act (D-90 invariant 8: "derived things inform, authored acts bind" — a proposal reports, never decides, never edits the thing it is about). Build the surface for the derived findings the record now produces — primarily FW-9's MISSING-PREDECESSOR findings (`op=instance`), with inferred connections (`op=connections`) as a secondary source if clean — rendering each VISIBLY AS A PROPOSAL (D-82: "a proposal must LOOK like one — what a member needs to know is that nobody has yet judged it worth asking"; show `surfaced_by` agent/machine, which REC-3 stamps). Give each the THREE affordances the construct names, and only three: ADOPT (author it into a focus/problem — the member decides it is worth pursuing; via `op=promote`), DEFER (with a recorded reason), DISMISS (with a recorded reason; via `op=dispose`). NOTHING adopted automatically, nothing dismissed silently. D-79: many instances of one check are ONE proposal with N instances, NEVER N tasks — do not drown the member. Consume existing ops; DELEGATE to RECORD if a needed op isn't exposed. REPORT the collapse verdict: did the proposal fit the ACT construct + the adopt/defer/dismiss affordances, or need its own construct? (v0.2 folded PROPOSAL into the act surface — this tests that.)
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a proposal test that renders a derived finding as visibly a proposal (its `surfaced_by`/derived nature shown, never as an established fact), offers exactly adopt/defer/dismiss, and requires a reason on defer/dismiss; negative control — remove the "visibly a proposal" marker and the finding reads as an established fact (D-82 regressed).
added: 2026-07-31 · CONDUCT
landed: 97e6b99 — the PROPOSAL surface (ACT THREE). Renders FW-9 missing-predecessor findings (op=instance) as PROPOSALS, each with a load-bearing DERIVED badge ("surfaced by the record — not yet judged; a question the record raised, not an established finding"), grade shown as HOW-established (§8.1) never as trust/importance, surfaced_by machine. D-79 aggregation: grouped by (progression_key, stage_key) — N instances = ONE proposal with N, weakest/undetermined grade across the group. Three affordances only: ADOPT→op=promote (fully wired, authors a focus in the member's own words, browser sends no surfaced_by so plane stamps human), DEFER/DISMISS (full authored motion, degraded pending op=proposedispose). COLLAPSE VERDICT: FIT — act three held, NO new construct; v0.2's three-acts test COMPLETE. Gaps are in the PLANE data layer not the construct → two RECORD delegations: op=proposals (discovery feed) + op=proposedispose (proposal-disposition store, D-79). civicos-ui 18 harnesses (act-proposal 63). Plane battery untouched. NC RUN (neuter derived badge → reads as established, D-82 regressed). No DEC.

### UI-6 · done
milestone: M8
scope: The ATTESTATION act — a member CO-ATTESTS a capture (`op=attest`: co-attestation over a capture hash via a timestamp authority, raising a capture from Grade B TOWARD evidentiary weight — index.mjs ~2309). This is a MEMBER-reachable act, NOT the DIST release-signing path, and it touches NO signing seeds. Build it through the SAME ACT construct + weight ladder UI-2/3/5 established (choose · see what it will refuse and why BEFORE it runs · author if required · receipt), showing this act's weight-ladder position (determine the rung from the ladder — co-attestation is a strengthening, largely irreversible act). The pre-flight explains HONESTLY what co-attestation does and what it CANNOT: the plane's own note (index.mjs:2304) says "Grade A needs a chain-of-custody web archive this surface cannot produce; co-attestation raises B toward evidentiary weight" — show that, NEVER over-claim the grade it yields. The receipt shows the attestation result and the capture's new standing. Consume `op=attest`; do NOT deploy, do NOT cut a release, do NOT touch `BIO_RELEASE_SEED`/`BIO_RATIFY_SEED`. DELEGATE to RECORD if a needed pre-flight isn't exposed. REPORT the collapse verdict (act four — bonus confirmation; the three-act test already passed).
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with an attestation test that co-attests a capture through `op=attest` and shows the HONEST resulting grade (never over-claiming Grade A), with the act's weight-ladder position and a pre-flight; negative control — make the surface claim Grade A from co-attestation and the test fails (it must show the honest B-toward-evidentiary).
added: 2026-07-31 · CONDUCT
landed: 08f3e05 — the ATTESTATION act: a member co-attests a HELD capture (op=attest, RFC-3161 TSA co-attestation raising Grade B TOWARD evidentiary weight). Weight rung: ATTESTED (top — irreversible, public; the "key" is the AUTHORITY's, not the member's, and NO signing seed is touched). Honesty is load-bearing: a single ATTEST_YIELDS_GRADE="B" drives every claim + a data-standing="B" receipt marker, so the surface NEVER claims Grade A (quotes the plane's own limit); NO_ATTESTATION shows every attempt with standing UNCHANGED. Refusals pre-flighted in the plane's order (NO_STORAGE/BAD_SHA/NO_SUCH_CAPTURE). COLLAPSE VERDICT: FIT (act four) — the AUTHOR step is genuinely absent (the evidence is the token, not the member's words), a finding about the construct not a gap. civicos-ui 19 harnesses (act-attest 63). Plane battery untouched. NC RUN (flip B→A → 9 honesty assertions fail). No DEC. The four act types (dispose/ballot/proposal/attest) all fit one ACT construct — collapse thoroughly confirmed.

### UI-7 · done
milestone: M8
scope: The MEMBERS & GOVERNANCE roster — the READ-ONLY half of U11 (the BOB inbox said to SPLIT U11 since it exceeds its rung; this is the safe read slice; member add/remove + key operations are BALLOT acts UI-3 covers, or a later split). A member surface showing WHO holds power in the group and its governance state — core accountability transparency. From `op=memberlist`: each member and their class/role (admin/member) and project ownership. From the arithmetic ops (`op=adminarith`/`op=projectownerarith`, which UI-3 already reads) show the governance state HONESTLY as facts a member can check (never "pending"): the admin consensus/majority denominators and the two-owner divergence — REUSE UI-3's denominator/divergence rendering. READ-ONLY: NO add/remove/key operations here. Consume existing ops; do NOT reshape the plane; DELEGATE to RECORD if a needed read isn't exposed.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a roster test listing members with their roles from `op=memberlist` and showing the governance denominators from the arithmetic op; negative control — break the role wiring and a member's displayed role no longer reflects the op.
added: 2026-07-31 · CONDUCT
landed: af81f28 — the MEMBERS & GOVERNANCE roster (read-only half of U11). Roster from op=memberlist: each member's role read STRAIGHT from the op's `role` field (never inferred from capabilities; unknown token shown as-is), standing, capabilities, owned projects. Governance from the arithmetic ops: the admin consensus/majority denominator ("N of M", never "pending") + the two-owner divergence REUSING UI-3's ballotDivergenceHtml. Two honesty findings SURFACED not hidden: (1) the founding ADMIN_TOKEN holder is counted by op=adminarith but has NO op=memberlist row — the surface STATES the gap rather than inventing a row (undetermined-first-class, in the membership surface); (2) ownership isn't in op=memberlist → bounded fan-out (op=list→op=projectparticipants, capped 80, unreadable projects skipped not guessed). READ-ONLY (no add/remove/key/ballot). UI 20 harnesses (members-roster 37). Plane battery untouched. NC RUN (force role→member → 5 fail incl founder-count cascade). DELEGATION UI→RECORD: op=memberlist carry owns[] to drop the N+1. No DEC.

### UI-8 · done
milestone: M8
scope: The member HOME — the "what needs you" orientation surface, the ENTRY POINT for M8's capability ("a member can reach what the record holds"). There is no starting point that tells a member what the record is asking of them. Aggregate the attention the record holds for this member: OPEN TASKS (`op=tasks` — the same feed UI-1's inbox reads, summarised: how many need you, the most urgent) and OPEN PROPOSALS (`op=proposals` — the derived findings REC-6 enumerates; degrade HONESTLY with a "feed pending" note if `op=proposals` is not yet live, exactly as UI-5 does — do NOT fabricate a count). Give clear entry to the built surfaces (tasks UI-1, subjects UI-4, members UI-7). READ-ONLY orientation; the acts happen on their own surfaces. HONESTY: every count comes from the op, never invented; an empty record shows an honest empty state ("nothing needs you right now"), never a fake number. Reuse existing rendering/ops; do NOT reshape the plane; DELEGATE if a needed read isn't exposed.
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a home test showing the member's open-task count from `op=tasks` and the proposal count from `op=proposals` (or the honest "feed pending" state when absent), plus an honest empty state; negative control — break the task-count wiring and the shown count no longer reflects `op=tasks`.
added: 2026-07-31 · CONDUCT
landed: 1586ad2 — the member HOME, now the DEFAULT boot screen (boot + previewShell land on home). Read-only orientation: OPEN TASKS summarised from op=tasks via UI-1's EXACT partition (home + inbox can never disagree; shows the count, the one waiting longest as an honest "most urgent" proxy since the plane computes no clock, and the unassigned) + OPEN PROPOSALS via UI-5's loadProposals (D-79-aggregated count; honest "feed pending" if op=proposals absent). Empty "nothing needs you" banner renders ONLY when BOTH feeds answered AND both empty (a task-error or pending feed withholds it — an all-clear is itself a claim). Zero shows as honest 0. Members entry admin-gated like the rail. UI 21 harnesses (home 37). Plane battery untouched. NC RUN LIVE (op=tasks→tasksnope → count absent, "could not be asked" note). No DEC, no delegation. Minor: the plane's op=proposals now returns a proposals[] aggregation the UI doesn't consume (harmless — UI re-aggregates the same result client-side); a future tidy.

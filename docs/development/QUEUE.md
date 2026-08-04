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

**BOTH slots are CONTENT-OFFICE**, decided 2026-08-03: Bob confirmed office formats
as the current focus the same day he paused the case-making thread, and his
decomposition names COFF-1 ∥ COFF-2 as "the two behavioural slots" — disjoint files,
genuinely independent. Enacted 2026-08-03 by CONDUCT:

- **Slot 1 · CONTENT-OFFICE, COFF-1** — the FORMAT registry, HTML and PDF moved onto
  it. The D-70 uniformity test, and the step that must precede the format entries or
  they are built twice.
- **Slot 2 · CONTENT-OFFICE, COFF-2** — the OOXML container reader, a pure
  zero-dependency module. Builds against I7 on paper; independent of COFF-1's landing.
- Wave 2 is COFF-3/4/5 (mutually independent; two slots against three items —
  recommended order XLSX → DOCX → PPTX by evidentiary density; final sequencing is
  CONDUCT's). All three additionally wait on IC-1 RESOLVED — done 2026-08-03, see
  `INTERFACE-CHANGES.md`. Slot rotation 2026-08-03 as the wave drained: COFF-3 and
  COFF-4 landed; COFF-5 holds one slot; FRAMEWORK promoted into the other for FW-15
  (the L2→L3 wire — prerequisite for CPDF-10's reading_refs acceptance, and the
  highest-leverage independent item on the board). CPDF-10 additionally waits on
  DEC-35 (the OCR service vendor/account — Bob's; provisional: it stays queued).
- **The case-making run (REC-10 → REC-19 → REC-11 → …, the 2026-08-01 handover order)
  stays QUEUED under a now-DORMANT RECORD**, first in line when a slot frees or Bob
  reopens the thread. Its activation order inside RECORD is unchanged; DEC-8's
  no-act-surface-before-REC-19 doctrine stands.

**Measurement-only and test-estate items hold no slot** (`ORCHESTRATION.md`): COFF-6
(the office-corpus measurement — sets COFF-2's bound, runs IMMEDIATELY), CPDF-9 (the
OCR measurement — gates CPDF-10's whole design, run early) and REC-27/M0-lane work
run out of band whenever CONDUCT has integration capacity between area items.

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

_(drained by CONDUCT 2026-08-03 — the 2026-07-31 office-formats directive: `INTERFACE-CHANGES.md` already existed with IC-1 PROPOSED; CONDUCT answered on dormant FRAMEWORK's behalf in writing and IC-1 is RESOLUTION: ACCEPTED (protocol step 3). The FORMAT-registry-first order is enqueued as COFF-1 → COFF-2 (BOB's 2026-08-03 decomposition, which carries RECONCILED §3.3's CPDF-8/CAP-5 namings); the evidentiary extras are IN scope per DEC-5.)_

_(drained by CONDUCT 2026-08-03 — the 2026-08-01 case-making build order and every subsequent BOB entry through the 2026-08-03 session-dormancy note: all 35 RECONCILED §3 items plus REC-28, CPDF-9 and CPDF-10 are enqueued below with every DEC reshape folded into the item scopes (DEC-12/13/14 → REC-14/REC-24; DEC-15 → REC-11/12/15/18, UI-11; DEC-16 → REC-20/21, UI-14; DEC-17+amendment → REC-14, UI-18; DEC-18/21 + D-160 → REC-12, UI-11; DEC-19+amendment → FW-14, UI-17/17a; DEC-20 → REC-15; DEC-22 → REC-13; DEC-23/D-164 → REC-11/18 provisionals + IC-1's constraint; DEC-24 recorded as doctrine on REC-13's pursue path; DEC-28/29/30 → REC-16, REC-13; DEC-31 → UI-18; DEC-33 → REC-15/UI-17 blocked, UI-17a queued; DEC-34 → REC-14/REC-22/UI-18; DEC-4 as twice amended → CPDF-9/CPDF-10, FW-15). The superseded pointers sit atop BUILD-ORDER/SB-CORE/SB-EVIDENCE/SB-OUTPUT and the corrected-by-rulings pointer atop AUDIENCES.md. D-157 is enqueued as REC-29 (CONDUCT's slot call: small, self-contained, touches people outside the project); D-158 is recorded on REC-15's deferred scope. Activation: both slots RECORD — REC-10 then REC-19, per the handover's order. S11's state inventory and D-164's content-extent design stay PARKED with Bob's paused thread, deliberately not queued. DEC-32 remains the sole open register entry; its provisional (no grounds machinery) is noted on REC-11/REC-12. No entries outstanding.)_

---

Item format:

    ### <ID> · <queued | active | done | blocked | superseded>
    milestone:        <M0 … M10>
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

_(drained by CONDUCT 2026-08-03 — the office-formats development plan: CONTENT-OFFICE
activated with both slots (COFF-1 ∥ COFF-2), COFF-3/4/5 queued behind them and IC-1,
COFF-6 out of band immediately; the area section below carries the six items verbatim
and the kickoff is written in the same act. IC-1 AS AMENDED (incl. `doc-para`) is
RESOLVED — CONDUCT answered AGREE on dormant FRAMEWORK's behalf in writing,
`INTERFACE-CHANGES.md` (protocol step 3). The dangling CPDF-10 dependency is fixed in
place: the handover's "CPDF-8" was RECONCILED §3.3's name for the FORMAT registry, now
COFF-1; the page-rendering question is decided by CPDF-9's placement measurement and
the renderer item is named when that lands. No entries outstanding.)_

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

### M0-7 · done
milestone: M0
scope: The END-TO-END pipeline integration test — the whole M4 entity-axis chain driven THROUGH THE CONTROL PLANE in ONE suite, proving the pieces COMPOSE. Each op is unit-tested in isolation; nothing proves a field one op writes is the field the next op reads — and a DEPLOY exercises that composition for the first time. Chain one document's journey: `op=acquire` (carries profile+digests+reading, FW-3/4/5) → `op=promote` (reading persists) → `op=entitycreate`+`op=resolve` (reference resolves to the entity at its §8.1 grade, FW-6/7) → the REC-5 alarm tick (connections auto-derive) → `op=connections` shows the graded connection → `op=progressiondefine`+`op=thread` (FW-8/9) → `op=instance` shows the instance, its weakest-grade, and a missing-predecessor finding → `op=proposals` surfaces it (REC-6) → `op=proposedispose` ages it (REC-7). ASSERT the JOIN KEYS line up across stages (capture_sha, entity_id, progression_key/stage_key) — that each stage consumes the prior stage's actual output, not a fixture. This is "test through the op, verify live" applied end-to-end short of a real deploy, and it is the evidence a deploy decision rests on. Adds NO op.
behind-interface: none
depends-on: none
accepts-when: one suite carries a document acquire→promote→resolve→derive(tick)→thread→surface→age end-to-end through the control plane, all green; negative control — break ONE join (e.g. mismatch the entity_id between resolve and concerns) and a downstream assertion fails, proving the test exercises the COMPOSITION, not just the endpoints.
added: 2026-07-31 · CONDUCT
landed: 1605dba — pipeline-e2e.test.mjs (53 assertions) drives the WHOLE M4 axis through the control plane on REAL Legistar bytes: acquire (profile+digests+reading) → promote → entitycreate+resolve (grade A) → REC-5 alarm tick (connections auto-derive, NO manual op=connect) → progressiondefine+thread → instance (weakest-grade + missing-predecessor finding) → proposals → proposedispose (ages to dispositions[]). ASSERTS the join keys line up across stages (capture_sha, entity_id, progression_key/stage_key) — each stage consumes the PRIOR stage's actual output. RESULT: every stage reachable through the control plane, NO DO-only path, NO plane-code change needed — the pieces COMPOSE, no integration gap on the M4 axis. DEPLOY-READINESS evidence. battery 65/65, --strict exit 0 (0 new op). NC RUN (break one join → 23 downstream fail, stages 1-2 green).

---

## RECORD — ACTIVE (promoted 2026-08-03 into the slot CONTENT-OFFICE freed on draining; REC-10 first, per the 2026-08-01 handover order)

Owns the store core and retrieval (`PARALLELISM.md`). Claim it in `CLAIMS.md` before
editing; `store.mjs` is ~4,900 lines and CAPTURE holds its link/capture/task/
reachability functions, so name paths precisely. On promotion the run order is the
2026-08-01 handover's: REC-10, then REC-19 (two workers on DISJOINT claims — the type
catalog/state sites vs the new read op), then REC-11 → REC-13 → REC-12 → REC-14.

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

### REC-7 · done
milestone: M8
scope: `op=proposedispose` — record a PROPOSAL's defer/dismiss WITHOUT minting a bundle (from UI-5's delegation). `op=dispose` disposes a focus BUNDLE (handle + state); a bare derived proposal has no bundle, so a member's defer/dismiss of a proposal has nowhere to land — UI-5's defer/dismiss is degraded. Doctrine is SETTLED (D-79: a finding AGES with a recorded reason rather than vanishing; a DECLINED proposal must NOT mint a bundle — declining is not authoring), so this is a mechanism gap, not a DEC. Add the proposal-disposition store (a small table keyed by the proposal's identity — (progression_key, stage_key) per D-79 aggregation) + `op=proposedispose` recording deferred/dismissed with a REQUIRED reason (never prefilled) and the deciding member (server-stamped); a dismissed/deferred proposal is filtered from (or annotated in) the REC-6 feed, and AGES rather than disappearing. I5-additive (schema traps: before host_governor, no backticks, purge/D-113).
behind-interface: I3
depends-on: none
accepts-when: a member defers/dismisses a proposal with a reason → it is recorded (no bundle minted) and no longer surfaces as open in `op=proposals` (or surfaces annotated as deferred/dismissed with its reason), while an undismissed one still does; negative control — dispose without a reason is refused NO_REASON; dropping the store makes the dismissed proposal reappear as open.
added: 2026-07-31 · CONDUCT
landed: ba36d49 — op=proposedispose ages a declined proposal WITHOUT minting a bundle (D-79). New table proposal_dispositions keyed by (progression_key, stage_key) — the SAME key REC-6 aggregates by — holding state(deferred/dismissed)+REQUIRED reason+server-stamped decided_by+at, UPSERT (one row per proposal). op writes ONE row, NO bundle/history/focus (declining is not authoring); refusals NO_REASON/BAD_REASON/NOT_A_DISPOSITION/BAD_STAGE/NO_DECIDER; forged decided_by ignored (server-stamped). FILTER-WITH-RECEIPT: proposalsFeed drops aged findings from open instances[]/proposals[] (UI-5 ages them with zero UI change) AND returns them in a new dispositions[] overlay (D-79 age-not-vanish, the decision on the record). A re-fired gap stays dismissed (key is identity). I5 1.8.0, I3 1.4.0, purge whole-store (D-113). battery 64/64, --strict 107/107. NCs RUN (refusals write nothing; neuter disposition read → dismissed reappears open). No DEC.

### REC-8 · done
milestone: M4
scope: CONSTRUCTS Step 7 (AGEING) — the record NOTICES when a temporal expectation comes DUE. FW-8 gave each progression stage a `within_interval`, but nothing CHECKS it: a stage can be arbitrarily overdue and the record stays silent. Add a SCHEDULED consumer on REC-1's DO alarm (reuse REC-5's `#schedConsumers` due/wake/tick pattern — the second framework consumer) that detects OVERDUE required stages: a predecessor stage is placed (its document carries a date — the reading's `at`, FW-5, or the capture time), the required successor stage is ABSENT and UNDISCHARGED (respect FW-10 exceptions), and `predecessor_date + successor.within_interval < now` → surface an OVERDUE finding carrying the instance's grade, feeding `op=proposals` alongside the missing-predecessor finding (a distinct finding kind, e.g. `overdue_successor`). TESTABILITY: "now" must be an INJECTABLE clock (env-overridable, as REC-5 made the alarm delay/batch env-overridable) so the overdue computation is deterministic in the suite — do NOT read an uncontrollable wall clock. HONESTY: a stage with no `within_interval`, or a predecessor with no determinable date, is NOT overdue (undetermined, never a fabricated deadline). DEFER and flag: bias-debt (D-86's other half — a decayed bias measure as an obligation-with-a-clock). New table/columns I5-additive (schema traps: before host_governor, no backticks, purge/D-113); new ops get a control-plane assertion (--strict).
behind-interface: I5
depends-on: none
accepts-when: a progression instance whose required successor is absent past its stage's `within_interval` (by the injected clock) surfaces an `overdue_successor` finding through `op=proposals`; the same instance BEFORE the interval elapses does NOT; a discharged or non-`within_interval` stage does NOT; negative control — freeze/reset the injected clock to before the deadline and the overdue finding disappears, and dropping the overdue check hides a genuinely-overdue stage.
added: 2026-07-31 · CONDUCT
landed: 5f76a7b — CONSTRUCTS Step 7 (AGEING): the record notices an OVERDUE required stage. DERIVE-ON-READ (no table, I5 UNCHANGED — an overdue flag goes stale against the clock, FW-9's reasoning). Reuses #assembleInstance's missing-predecessor + FW-10 discharges (one derivation point), adds the temporal layer: successor within_interval must PARSE (n day/week fixed, month/year calendar; prose→null→not overdue), predecessor (after_stage) placed + carrying a determinable date (reading.at FW-5 preferred, else register.registered; latest-of), predecessor_date+interval<now. Joins op=proposals as a distinct overdue_successor finding (never-happened vs not-yet-overdue), aggregated per stage (doesn't split → stable disposition key, D-79). INJECTABLE clock (#nowMs: now param / BIO_NOW_MS env / wall). SECOND REC-1 framework consumer (overdue-scan; wake=earliest future deadline, self-terminating; tick writes nothing). Excludes discharged/non-required/unparseable/undated (undetermined honest). battery 66/66, --strict 107/107 (NO new op). NCs RUN (neuter deadline derivation → 7 fail; scheduler NC 8 fail). DEC-10 raised (escalation beyond proposal). DEFERRED: bias-debt (D-86 other half, same consumer shape).

### REC-9 · done
milestone: M8
scope: `op=captureprogressions` — map a CAPTURE back to its progression instances (from UI-9's delegation). UI-9's document page shows items 1–2 (resolutions, connections) live, but items 3–4 (which progressions this document is in, and whether its successor is overdue) have NO op: `op=instance` needs `(progression_key, entity_id)`; `op=proposals` walks every instance but carries no `capture_sha`; and overdue findings live ONLY in `proposalsFeed` (`op=instance` doesn't emit them). Add a READ op `op=captureprogressions&sha256=<capSha>` returning the progression instances this capture sits in, its STAGE in each, and each instance's `missing_predecessor` + `overdue_successor` findings — REUSING `#assembleInstance` + REC-8's `#overdueFindings` (the ONE derivation point; do NOT re-derive overdue elsewhere), the instances found by joining `progression_instances` on `capture_sha`. Read-only, reports (derived), no mutation. Control-plane assertion (--strict; literal `op=captureprogressions` in the suite text).
behind-interface: I3
depends-on: none
accepts-when: `op=captureprogressions` for a capture threaded into a progression returns that instance, the capture's stage, and its findings (incl. an `overdue_successor` when the successor is overdue by the injected clock); a capture in no progression returns empty; UI-9's items 3–4 would populate from it; negative control — drop the capture-join and the op returns nothing for a capture known to be threaded.
added: 2026-07-31 · CONDUCT
landed: 54d671a — op=captureprogressions&sha256=<cap>: maps a capture to the progression instances it sits in, its stage in each, and each instance's missing_predecessor + overdue_successor findings — REUSING #assembleInstance + REC-8 #overdueFindings (derive-on-read, NO table, I5 unchanged), instances found by joining progression_instances on capture_sha. Same now=<ms>/BIO_NOW_MS clock seam. Projects established/needs_confirmation from grade (so the UI badge renders A/B correctly, not as unconfirmed — a pure projection, not a new determination). Refuses NO_SHA by name. This makes UI-9's items 3-4 (progression membership + overdue) LIVE with no UI change. I3 1.6.0 additive. battery 67/67, --strict 108/108. NC RUN (drop the capture-join → 6 fail). No DEC.

---

### REC-10 · done
milestone: M9
scope: **The `inquiry` TYPE — the schema change, not eleven features.** As `BUILD-ORDER.md` §2 (REC-10), carried with one addition from `research/RECONCILED.md` §3.2 (C-16): **the inquiry has ONE authored field, the question** — no separate Title, no submit-gating "What do you know?"; `bundles.title` is DERIVED from `## Question` and never separately authored, and the derivation rule is named explicitly in the item's commit. Everything else per BUILD-ORDER: `OBJECT_TYPES` gains `INQ`, `PROB`/`FOCUS` remap via flattened `LEGACY_TYPE_ALIASES`, `HEADINGS.inquiry`, `knownSchemas` gains `inquiry@1` keeping `focus@1`/`problem@1`, `STATES.inquiry.legal` is `['open','deferred','dismissed']` ONLY this turn (later states arrive WITH their gates), `surfaced` stays a legal alias of `open`, all FOUR normalisation sites fixed in the same turn, `op=dispose`'s second state-machine copy imports from the catalog. No new table, no new op, no UI.
behind-interface: I5
depends-on: none
accepts-when: `cd bio-plane && npm run test:battery` green with a new `inquiry.test.mjs` carrying the three `focus.test.mjs` blocks (canonical `INQ-` works · a legacy `FOCUS-`/`PROB-` bundle still validates · the projection normalises all three to `inquiry`); a member creating a question through either entry point gets an object with the same required fields and no path asks for a title; `npm run test:coverage` --strict exit 0; negative control — remove ONE of the four normalisation sites and the suite fails naming that site's disagreement.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 23f4270 + the seam commit) — the inquiry TYPE: OBJECT_TYPES gains INQ, PROB/FOCUS collapse via flattened LEGACY_TYPE_ALIASES, HEADINGS.inquiry (six), knownSchemas inquiry@1 KEEPING focus@1/problem@1, checkInquiryExtension, STATES.inquiry.legal ['open','deferred','dismissed'] only with `surfaced` a legal alias. ALL FOUR normalisation sites share ONE map (vocabFor; the boot normaliser GENERATED from the alias table; promote projection; query filter rewrite) — and the REC-19 merge surfaced a FIFTH site one merge late (the affordances derivation consulted edges pre-collapse; routed through the same map by the resumed worker, proving the map's point). op=dispose imports the catalog machine; NOT_PROBLEMS → NOT_INQUIRIES (the one I3 wire change, recorded as IC-3). C-16: title = first non-empty line of ## Question, whitespace-collapsed, word-boundary cut at 120 + visible ellipsis — the rule lives ONCE (deriveInquiryTitle); no path asks for a title. DELIBERATE DEVIATION from DATA-MODEL §2.7 items 4/6, recorded: legacy vocabulary keys are KEPT (deleting them would invalidate every legacy document — this collapse changed the heading set, the earlier rename did not); accepts-when governs. inquiry.test.mjs 34 assertions (focus.test.mjs retired INTO it); battery 74/74 post-seam; --strict exit 0. FIVE NCs RUN (catalog map, boot normaliser via a persistent-store reboot — a reusable instrument, promote projection, query rewrite, C-16 derivation). Latent pre-existing defect recorded as D-169. UI vocabulary catch-up is UI-10's existing scope, now runnable.

### REC-11 · queued
milestone: M9
scope: **`inquiry_basis` — the one genuinely new table, and basis recursion.** As `research/RECONCILED.md` §3.1 (REC-11), which is THE DESIGN over `BUILD-ORDER.md` §2's text: the leg records its AXIS (single `grade_axis ∈ capture|connection` column — the shape RECONCILED's own reasoning decides, a leg asserts one grade for one reason; recorded here rather than DEC'd because the repository answers it); the basis graph is a DAG enforced at WRITE, refusal names the cycle path; `grade` NULLABLE, NULL means undetermined and STATED. Post-reconciliation rulings folded in: **DEC-15** — `grade_source` admits `hunch` beside `resolution` and `testimony`, author and date required; it is the only authored grade permitted above D and is BIAS DEBT until cleared (`BIO_Declared_Bias_v0_1.md`). **DEC-23** — a leg points at CONTENT or at another inquiry, not "at a document"; the addressable content-extent primitive (D-164) is PARKED with Bob's thread, so the provisional is: `target_id` stays an `INFO-`/`INQ-` id and the content-extent leaf arrives with D-164's design — build no second reference vocabulary meanwhile (IC-1's constraint). **DEC-32 (open)** — the grounds model may later touch this table's shape; provisional is the current single-basis arithmetic, no plurality machinery. One-line chore folded in at REC-19's landing: rewire dispose()'s DISPOSITIONS copy to import the published set from affordances.mjs (the suite already pins the two arrays identical).
behind-interface: I5
depends-on: REC-10
accepts-when: as `RECONCILED.md` §3.1 (REC-11) — battery green with an inquiry citing itself refused by name, a three-node cycle refused at the closing write with the path named, a connection-axis grade on an `INFO-` target reading back with its axis intact; plus a `hunch` leg refusing a missing author or date by name; `npm run test:hygiene` green (table in purge); negative control — remove the cycle check and `op=promote` accepts A→B→A; drop the projection write and a two-leg `bundle.md` reads an empty basis.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-12 · queued
milestone: M9
scope: **STRENGTH at inquiry altitude — a PAIR over two POPULATIONS, over a bounded DAG.** As `research/RECONCILED.md` §3.1 (REC-12), the most-changed item, read WITH the §1.1 amendment block, and reshaped twice since by Bob: **DEC-21** — capture and connection are TWO MEASUREMENTS OVER TWO POPULATIONS: capture ranges over every DOCUMENT the conclusion reaches, connection over every EDGE it rests on; a leg IS an edge, so one document leg carries BOTH grades — never "evidentiary legs vs inferential legs". **DEC-18** — an ungraded leg is INERT, not unrating: excluded from the population entirely (not weighed, does not floor, does not unrate), named and visible as not yet load-bearing; **UNRATED survives as the boundary case** where NO leg is graded; every ungraded leg is named, one or many. **D-160** — the word is `UNRATED` in the code, the copy and the test names; `SUSPEND` means the opposite in `SB-OUTPUT` §5.1 and must not appear. **DEC-15** — a hunch grade composes NORMALLY, never treated as undetermined. Unchanged from RECONCILED: `#weakerGrade` MUST NOT be reused (its `|| 0` ranks unknown below D — short-circuit null before any rank comparison, and correct the `store.mjs:3441-3443` comment saying why the old intent was wrong); the walk carries R3's depth bound whose exhaustion reports `undetermined` naming the depth; projection is a CACHE per-axis, never the authority. **DEC-32 (open)** — grounds-model provisional as REC-11.
behind-interface: I5
depends-on: REC-11
accepts-when: as `RECONCILED.md` §3.1 (REC-12) — battery green with (a) a mixed basis reading TWO strengths each naming its own weakest leg and no code path producing a composed letter, (b) an inquiry leg inheriting another inquiry's pair per axis, (c) one NULL-graded leg EXCLUDED from its axis's population while named as not load-bearing (DEC-18 — the axis still reads from its graded legs), an all-ungraded basis reading UNRATED, (d) an over-depth chain reporting `undetermined` naming the depth; coverage --strict exit 0. Negative controls — force strongest-leg composition and the weak-link assertions fail; pass a null grade into the rank comparison and the suite fails because the chain reads below D; compose across the axes and the suite fails naming them; remove the depth bound and a store-constructed cycle does not terminate; rank an ungraded leg anywhere in the population and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-13 · queued
milestone: M9
scope: **The `concluded` state, its entry requirements, and `op=conclude`.** As `BUILD-ORDER.md` §2 (REC-13), carried forward per `RECONCILED.md` §3.3, with two rulings folded in: **DEC-22** — a claim may exist with NO legs; an `open` inquiry's unsupported claim is a STANDING OBJECTIVE the system may pursue on the member's behalf (the machine PURSUES what the member authored — DEC-24 discovering; it never chooses the question). `concluded`'s entry requirements are unchanged (non-empty conclusion, non-empty falsifier, `basis.length >= 1`). **DEC-30** — conclude gains NO owner gate and NO ballot; any `contribute` holder, act attributed. Refusals as BUILD-ORDER: `NO_CONCLUSION`, `NO_FALSIFIER`, `NO_BASIS`, `MACHINE_CANNOT_CONCLUDE`. MAP RULE (from the REC-10×REC-19 seam, the second rename-adjacent copy caught at a merge): any consultation of STATES/HEADINGS goes through the catalog's vocabFor/normalizeType — never a raw key, never a local alias copy.
behind-interface: I3
depends-on: REC-11
accepts-when: as `BUILD-ORDER.md` §2 (REC-13) — battery green concluding through `op=conclude` and refusing each missing requirement and a machine credential by name; coverage --strict reaches the op; plus an `open` inquiry with zero legs is legal and readable; negative control — remove the `falsifier` requirement and an inquiry concludes with nothing that would falsify it.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-14 · queued
milestone: M10
scope: **The `published` state — EDITIONS, the completeness assertion, and the gates that stop it being a checkbox.** As `research/RECONCILED.md` §3.1 (REC-14) with the terminality branch OVERRULED and three additions, all Bob's: **DEC-12** — `published` is NOT terminal. `edition` is required frontmatter on a `published` inquiry, stamped into the ratified bytes; `published_bundles` is re-keyed `(bundle_id, edition)` and APPENDS — this closes D-144 as a feature (the appending `published_shas` was always right); every edition keeps its own signature, attestor, time and gate version; `concluded → open` is legal; reopening does NOT unpublish and published editions stay published; a basis leg citing a published case NAMES ITS EDITION and does not silently follow (C-21.2 compares against that edition's frozen pair, per-axis as RECONCILED). The completeness statement is authored FRESH per edition under C-21.1's byte-check. **DEC-13** — the completeness block gains the group's POSITION ON PUTTING THE CASE TO ITS SUBJECT: authored, justified, never prefilled, carried in the artifact as declared bias; the gate is that the position is DECLARED AND JUSTIFIED — never that contact happened, never that the answer was favourable. **DEC-17 as amended** — the GROUP declares default `required_strength{capture, connection}` (a PAIR, per R2), each project may override; the declared bar is stamped into the ratified bytes BESIDE the derived strengths; an absent bar gates nothing and the case SAYS so. **DEC-34** — the published case is a CONTAINER: zip of the case bundle + signed hash manifest, editions over the container, reduced also to PDF renderings (the page-header rule lands on REC-22/UI-18). C-9's nameable `inquiry_exclusions` and R4's reserved division disclosure as RECONCILED.
behind-interface: I5
depends-on: REC-12, REC-13
accepts-when: as `RECONCILED.md` §3.1 (REC-14), re-based on editions — battery green publishing a concluded inquiry at edition 1, republishing at edition 2 with BOTH editions readable and separately signed, refusing a republish that does not increment `edition`, refusing byte-identical completeness across editions (C-21.1), and refusing per-axis over-strong inheritance (C-21.2, both axes independently); a published inquiry reopens to `open` without unpublishing; hygiene green (`inquiry_exclusions` in purge). Negative controls — C-21.1 passes a carried-forward completeness and the gate is a checkbox; a single scalar C-21.2 comparison passes both axis probes and the axes were composed; upsert `published_bundles` and edition 1's signature is gone.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-15 · blocked
milestone: M10
scope: **`op=publishpreflight` — the ceremony's ordering argument in one op. DEFERRED by DEC-33** (Bob, 2026-08-03: the publication ceremony process is deferred; publication runs through the operator for now). Trigger: Bob reopens the case-making thread. Recorded for when it wakes, so the deferral loses nothing: base scope as `BUILD-ORDER.md` §2 (REC-15) with `RECONCILED.md` §3.2's C-4 correction (`NO_SIGNERS` is INSTANCE-WIDE — the refusal detail must never say "for you", D-57); **DEC-15** — refuse `UNCLEARED_HUNCH` naming every hunch leg, in the same list as `NO_SIGNERS`, before any signature exists; **DEC-20** — only a hunch blocks publication on bias grounds; ordinary bias is DISCLOSED (the manifest SHOWN in the artifact, not merely cited) and refused on nothing; **DEC-17** — refuse `BELOW_PROJECT_STRENGTH` naming the axis; **D-158** bounds the per-member signing-key pre-flight (a signer row for a never-enrolled member reads `active` and is refused by ratify — fix at `signerAdd` write, assert the other view); §4 Q11 measured YES — `op=signerlist` + `op=whoami` make the per-member pre-flight computable client-side, an ADDITION to instance-wide `NO_SIGNERS`, not a replacement, until D-158 closes.
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and `BELOW_PROJECT_STRENGTH` naming the axis, each BEFORE any signature exists, writing nothing; negative control — attach per-member wording to the instance-wide `NO_SIGNERS` and the suite fails; clear a hunch and the refusal disappears without any other state change.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

### REC-16 · queued
milestone: M10
scope: **`divided` and `op=inquirydivide` — supersession gets its first producer.** As `research/RECONCILED.md` §3.1 (REC-16): R4's disclosure is the point — each child records its PARENT id AND its SIBLING ids in `bundle.md`, projected through promote; C-6.1's `supersedes` requirements include the sibling set; `NO_SIBLING_DISCLOSURE` on a child that omits it; NO per-leg reason. Decision surface now COMPLETE: **DEC-28** — `divided` is a TERMINAL STATE, not a disposition; written by `op=inquirydivide`; its reason is the ACT's reason; `disposition_reason` untouched. **DEC-29** — one authored reason per division STANDS (no per-leg cost), and the divide PROMPT's wording must state the disclosure the division will make — an acceptance clause, not advice. **DEC-30** — author-scoped (any `contribute` holder, act attributed) is SETTLED, not provisional. Refusals as BUILD-ORDER plus `NO_SIBLING_DISCLOSURE`; `PUBLISHED_CANNOT_DIVIDE` stands (DEC-12 changed publishing, not division — an edition says the case continues; a division says the parent was malformed).
behind-interface: I3
depends-on: REC-13
accepts-when: as `RECONCILED.md` §3.1 (REC-16) — battery green dividing a concluded inquiry into two children each naming parent AND every sibling, the parent recording where every leg went including every `cuts_against` leg, a `published` inquiry refusing `PUBLISHED_CANNOT_DIVIDE`; the divide surface/prompt text states the disclosure (asserted as a string the harness checks); negative control — publish a child omitting a sibling and the suite fails; remove the C-6.1 `supersedes` requirement and a child supersedes with no reason and an unresolvable target.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-17 · queued
milestone: M10
scope: **P-64 — the re-evaluation obligation, as a query and not a flag, WIDENED to the walk-back edges.** As `research/RECONCILED.md` §3.2 (REC-17): reuse `reeval_flag`/`reeval_since`/`reeval_source`; **terminal acts on a cited inquiry REFUSE with `CITED`** (dismiss, divide — listing offenders, document-path remedy wording); **reversible acts RAISE the obligation** (defer, reopen), exactly as supersession does; no new mechanism, no new refusal name; REC-11's reverse index makes both one lookup. **DEC-12 note** — a newer EDITION of a cited case SURFACES the re-evaluation obligation on its dependents and recomputes nothing on the member's behalf; a leg keeps citing the edition it names.
behind-interface: I5
depends-on: REC-16
accepts-when: as `RECONCILED.md` §3.2 (REC-17) — battery green where superseding (or republishing at a new edition) makes every dependent inquiry surface the obligation naming the moved leg and both strengths without altering any strength; dismissing a cited inquiry refuses `CITED` naming offenders; deferring succeeds and raises the obligation; negative control — permit a dismiss on a cited inquiry and a published case's basis panel names an abandoned question while its frozen strength still reads.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-18 · blocked
milestone: M9
scope: **Earned basis grades — `grade_source: 'resolution'` from `resolutions`.** As `research/RECONCILED.md` §3.1 (REC-18), with the blocker HALVED and then halved again: R2 ships the capture half with REC-11/REC-12 (a document leg's capture grade comes from the capture record, never authored); **DEC-15 closed the D1(a)/D1(b) fork** — they are two phases of one lifecycle, and this item builds the EARNED path (`grade_source: 'resolution'`) as the thing a hunch is cleared INTO. **Still blocked on UI-13 alone**: the registry has no write surface, so every instance would hold an empty registry and no A/B/C reachable by any leg. **DEC-23** — the leg's target is CONTENT (provisional per REC-11's note until D-164 resumes).
behind-interface: I5
depends-on: REC-11, UI-13
accepts-when: as `RECONCILED.md` §3.1 (REC-18) — a document leg resolving to the subject entity at grade A carries `grade_source: 'resolution'`; a member's testimony carries `'testimony'` and D, recordable at no other grade; a hunch cleared by resolution reads `'resolution'` with the hunch's bias debt settled; a leg's capture grade comes from the capture record and is never authored; negative control — accept a caller-supplied A on a testimony leg and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-19 · done
milestone: M8
scope: **`op=affordances` — publish what the plane already knows about what may be done.** As `BUILD-ORDER.md` §2 (REC-19), carried forward per `RECONCILED.md` §3.3 (already publishes `rung` and `weight` distinctly, C-6). Standing doctrine, **DEC-8**: the ACT pre-flight is PLANE-SOURCED always — a surface may render a refusal it received and may never compute one; publication (this op) by default, a dry-run op (`op=publishpreflight`, deferred with REC-15) where the refusal turns on state the surface cannot see; **no act surface is built before this op exists.** Returns `[{id, label, weight, needs, mode, rung}]` derived from the `NEEDS` map, the catalogue's legal-edge table (exported, not copied), set-application weight and `SESSION_OPS`; publishes the object vocabularies (`action_kind` values, disposition set) the way `searchfields` publishes the query language; `rung: null` where no document assigns one — FW-14 assigns them, nothing here invents 50.
behind-interface: I3
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (REC-19) — battery green where `op=affordances` for a `collected` information bundle returns exactly the acts the plane would permit (and NOT `retire` for one carrying a live `cites` edge), each with its `needs`, `rung: null` for unassigned ops; coverage --strict reaches the op; negative control — add an op to `NEEDS` without the affordances derivation and the suite fails naming the unpublished op.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker d22db7b) — op=affordances (I3 additive, non-mutating, member class): ?target= → [{id,label,weight,needs,mode,rung}] derived from what the plane holds (NEEDS, the catalogue's exported legal edges, set-application weight, SESSION_OPS); no target → the full act catalogue + the object vocabularies (ACTION_KINDS exported from bio-checks and consumed by C-2.10 from the same array; the disposition set pinned byte-identical to what dispose() enforces). rung null everywhere undeclared — only the 7 sourced rungs exist; FW-14 assigns the rest. DRIFT-PROOF BY TOTALITY: every op in NEEDS is a published ACT or sits in NON_ACTS with a stated reason (39 classified); the suite parses NEEDS from source. Retire availability and its CITED refusal share ONE #citesInto predicate. affordances.test.mjs 38 assertions; battery 74/74 (3751); --strict exit 0, 109/109 ops. NC RUN (add frobnicate to NEEDS without the derivation → suite names it; restored). HONEST FINDING recorded as D-168: cite is type-only, so the plane permits citing RETIRED information — surfaced by the derivation's honesty, a store-rule question not a surface one. REC-25's scope amended: affordances joins its viewer-gate stamp list. The dispose() DISPOSITIONS one-line rewire to the published set folds into REC-11.

### REC-20 · queued
milestone: M8
scope: **`op=queue` — the item contract, with `class` and `case`.** As `research/RECONCILED.md` §3.2 (REC-20) — the grouping read GATED before the grouping exists (the queue is the one surface every member opens by habit; D-15 §7.9) — with the P-88 restriction RETIRED by **DEC-16**: `case` is populated with **EVERY ANCESTOR**, over a walk inheriting R3's depth bound; an exhausted walk reports the ancestor set `undetermined` rather than silently truncating. **The unit of state is the EVENT, not the (member, case) entry** — one state, N homes; an event appearing under several entries does not create several entries (DEC-10's one-standing-entry rule survives intact); item state reads from the event. CONDITION stays DEFERRED and named in the report, not stubbed. MAP RULE (as REC-13's): op=queue's type/state consultations go through vocabFor/normalizeType, never a raw key.
behind-interface: I3
depends-on: REC-10, REC-19, REC-25
accepts-when: as `BUILD-ORDER.md` §2 (REC-20) re-based on DEC-16 — battery green where `op=queue` returns an OBLIGATION and an aggregated FINDING each carrying `class`, `options[]` from the affordances derivation, and `case` holding EVERY ancestor for a nested item; an over-depth ancestor walk reports `undetermined`; resolving the event once clears it from every entry; negative control — key state on (member, case) and a second ancestor shows a stale unresolved copy, and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-21 · queued
milestone: M8
scope: **`queue_state` — the personal half, kept structurally distinct from the record half.** As `research/RECONCILED.md` §3.2 (REC-21): `muted_kinds` may contain CONDITION kinds ONLY (an OBLIGATION on a muted case still reaches the member — `tasks` carries no per-member mute, so the record must not go on believing a question reached a person it cannot reach). **DEC-16 raises the stakes**: one member's resolution clears other members' queues, so the mute/resolve boundary is what stands between shared resolution and silent disappearance — and **an act that CHANGES the record is itself an event** that propagates the same way (resolve-by-regrading raises its own event; resolve-by-looking clears correctly for everyone). No new machinery; assert it.
behind-interface: I5
depends-on: REC-20
accepts-when: as `BUILD-ORDER.md` §2 (REC-21) — battery green where muting hides present CONDITION kinds from that member only, a second member is unchanged, a NEW kind still surfaces, no `tasks` row or bundle written; plus an OBLIGATION on a muted case still appears in that member's queue; a record-changing resolution raises its own event reaching every ancestor entry; negative control — route the mute through `proposedispose` and the suite fails (a preference entered the record); let `muted_kinds` accept an OBLIGATION kind and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-22 · queued
milestone: M10
scope: **`op=publishedcase` and `op=publishedbytes` — the public read path, over EDITIONS.** As `research/RECONCILED.md` §3.1 (REC-22): `published_edges` restricted to targets the surface may SERVE, with a division's parent/sibling ids admitted as edges it may only NAME; `op=publishedcase` returns BOTH frozen strengths and any suspension with its named leg. **DEC-12** — `publishedList()` enumerates EDITIONS rather than one row per bundle; a hash resolves to ITS edition; prior editions stay readable and separately verifiable. **DEC-34** — the served artifact is the CONTAINER (case bundle + signed hash manifest, editions over the container) reduced also to PDF renderings; **every PDF page carries case id, edition, authors, declared bias, both floors, hash and verification pointer** — tamper-EVIDENT via answer-by-hash, never claimed tamper-proof.
behind-interface: I3
depends-on: REC-14, REC-16
accepts-when: as `RECONCILED.md` §3.1 (REC-22) — battery green: an anonymous caller gets the case and its bytes and nothing from the working ops; a never-ratified sha 404s identically to a nonexistent one; a published child's page names parent and siblings serving neither; edition 1 stays fetchable and verifiable after edition 2 publishes; a PDF page rendering without the header block fails the harness (DEC-34's negative control); negative control — admit a name-only edge to the served set and a working bundle streams to an anonymous caller.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-23 · queued
milestone: M7
scope: **D-130 — the counterparty becomes three-valued, and C-2.10 stops accepting a placeholder.** As `BUILD-ORDER.md` §2 (REC-23), carried forward verbatim per `RECONCILED.md` §3.3: `counterparty: {state: named|undetermined, name, entity_id?, basis}` on `source`'s shape; refuse `undetermined` with empty basis, `named` with empty name, and the literal `to be named`; no counterparty table (a second subject registry is where a structural prior by role would eventually live). UI half is UI-19.
behind-interface: I5
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (REC-23); negative control — accept any non-empty string again and the placeholder passes, restoring D-130.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-24 · queued
milestone: M10
scope: **The action loop — `action_basis`, `correspondence`, and the two ops that operate an object nothing operates.** As `BUILD-ORDER.md` §2 (REC-24), carried per `RECONCILED.md` §3.3 (reads the edge table from the catalogue, C-5), with two rulings folded in: **DEC-13** — `action_kind` gains `request_for_comment`, and it **names the specific inquiries it disclosed** ("we contacted them" and "we put these four claims to them" are different rows — the Columbia/Rolling Stone finding); the response window is authored by the group (7–30 calendar days is GAO's sourced precedent, not an invented constant); what comes back is CAPTURED, not summarised; a non-response is recorded with its date. **DEC-14** — an action's recorded consequence is an OUTCOME by default (dated first-party fact, no causal claim); promoting it to an IMPACT claim requires a basis leg pointing at evidence that is NOT our own action; unproven is a STATED state on the R1 shape, never a fifth grade and never a low one.
behind-interface: I5
depends-on: REC-13, REC-23
accepts-when: as `BUILD-ORDER.md` §2 (REC-24) — the end-to-end action drive, capture-or-testify structural on `correspondence`, no second edge-table copy — plus: a `request_for_comment` naming zero inquiries is refused by name; an impact claim with no non-self evidence leg is recorded `unproven` and rendered as stated, not graded; negative control — as BUILD-ORDER, plus promote an outcome to impact on the action's own evidence and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-25 · queued
milestone: M7
scope: **F-8 / D-135 / D-141 — the D-15 viewer gate stamped on ALL read paths.** As `BUILD-ORDER.md` §2 (REC-25), carried forward verbatim per `RECONCILED.md` §3.3; unchanged in scope and now depended on by REC-20, UI-14, UI-16 and UI-21 — it gates the surface every member opens by habit. Run the F-8 probe FIRST and record it in `MEASUREMENTS.md` with date and instrument. Scope amendment 2026-08-03 (REC-19's landing): `op=affordances` JOINS the stamp list — it reveals a bundle's existence and state to any member, the same posture as `op=list`, so the item's four bypassing ops are now five.
behind-interface: I3
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (REC-25); negative control — remove the stamp from `op=list` alone and the suite names `op=list` as the leak.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-26 · queued
milestone: M1
scope: **The two live M1 gaps — `env.SELF` bound nowhere, `op=monitor` with no caller.** As `BUILD-ORDER.md` §2 (REC-26), carried forward verbatim per `RECONCILED.md` §3.3. The installer-template half is a DELEGATION to DIST (`newgroup/**` is out of bounds), raised in `CLAIMS.md` by the worker, not edited directly. The idempotence key is not optional — a retry that increments `observations` manufactures corroboration.
behind-interface: I5
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (REC-26); negative control — remove the idempotence key and a retry inflates `observations`; remove the cadence read and every document is checked at one global interval.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-27 · done
milestone: M0
scope: **D-137 / D-131 — close the D-113 class for the eight tables it cannot see.** As `BUILD-ORDER.md` §2 (REC-27), carried forward verbatim per `RECONCILED.md` §3.3. Runs in the M0 lane (holds no slot) and wants to land BEFORE REC-11/REC-14/REC-21/REC-24 each add a table. Same turn: D-131's NUL byte at `store.mjs:3833`.
behind-interface: none
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (REC-27) — `npm run test:hygiene` reports 52 of 52 tables covered, `grep -c "CREATE TABLE" bio-plane/src/store.mjs` non-zero without `-a`; negative control — remove `project_participants` from the purge list and the hygiene suite names it, which today it cannot.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 3e35d56) — hygiene parses store.mjs CREATE TABLE literals too: 52/52 tables covered (was 44 visible). project_participants AND project_owner_votes added to purge BOTH arms with stats counters (scope-correction: the item said four uncovered; the real count was FIVE — project_owner_votes had DELETEs elsewhere but none in purge). EXEMPT with stated reasons: member_expertise (roster identity), admin_votes (append-only governance record), export_log (an export can never happen silently). D-131: the NUL was a dedup-key separator in threadInstance, rewritten as \u0000 (runtime-identical); plain grep works on store.mjs again, plus a class-closing guard scanning every src/*.mjs for raw control bytes. battery 69/69 (3374), hygiene 52/52, --strict exit 0. NC RUN BY WORKER AND RE-RUN BY CONDUCT (purge is destructive code): neuter the two DELETEs → hygiene FAILS naming project_participants (51/52) + 4 projects assertions; restored green. D-137 and D-131 CLOSED.

### REC-28 · queued
milestone: M8
scope: **D-151 — a machine credential can RESOLVE an unassigned task, so an obligation can be closed with no member act.** VERIFIED: `#refuseNotYours` (`store.mjs:6943-6946`) allows the moment `assignee === "unassigned"`, before it looks at the caller, and `taskforward`/`taskresolve` carry `"probe"` in `classes` (`index.mjs:271-272`). Refuse at the ACT and not at the fence, on the `MACHINE_CANNOT_RELEASE` precedent (`store.mjs:1857-1861`): add `MACHINE_CANNOT_RESOLVE` and `MACHINE_CANNOT_FORWARD`, remove `"probe"` from the two ops' `classes`, and correct `#refuseNotYours`'s comment, which today states a guarantee the code does not make. KEEP the fence — it answers *is this THIS member's task* and the act refusal answers *is this a person at all*. Leave `taskdrain` alone: draining is not resolving.
behind-interface: I3
depends-on: none
accepts-when: `cd bio-plane && npm run test:battery` green with a suite where a `token:probe` credential is refused BY NAME on both verbs for an unassigned task, the assignee still succeeds, and an admin member still succeeds; `npm run test:coverage` --strict exit 0; negative control — remove the act-level refusal and the probe resolves an unassigned task while every existing task assertion still passes, which is the state today.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### REC-29 · queued
milestone: M7
scope: **D-157 — `op=memberlist` hands the cover↔handle pairing to ordinary members and to `MEMBER_TOKEN`.** MEASURED (2026-08-02, BOB session, live `bio` store): an ordinary member session (`administer: false`) and the shared `MEMBER_TOKEN` each receive `handle = cover` for every member, against `BIO_Membership_Architecture` v1 §3 / v2 §3 ("Only administrators see cover and handle together") — the anti-deanonymisation mechanism, so this is the rare defect touching people OUTSIDE the project. **The fix is a PROJECTION, not a refusal**: members and the public legitimately need the handle roster and must not receive `cover`. Correct the three self-contradicting source sites (`index.mjs:407` grants `["admin","member","probe"]` under a comment saying "All admin-only"; `store.mjs:5810`). `PROBE_TOKEN` is NOT exposed (`scopeFor` confines probe to `scratch`) — measured, do not re-litigate. **`test/members.test.mjs:192` asserts the current behaviour and must be CORRECTED, never exempted** (`CLAUDE.md`), with a comment saying why the old assertion was wrong.
behind-interface: I3
depends-on: none
accepts-when: `cd bio-plane && npm run test:battery` green with a suite where an admin receives cover and handle together, while an ordinary member session and `MEMBER_TOKEN` receive handles with NO `cover` field present at all; coverage --strict exit 0; negative control — restore the old projection and the suite fails naming the non-admin caller that received `cover`.
added: 2026-08-03 · CONDUCT (from D-157, BOB session measurement)

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

### CPDF-9 · done
milestone: M2
scope: **Measure whether OCR is reachable at all, before anything is designed.** D-152, DEC-4 as twice amended. Bob overruled the accept-the-limit recommendation: image-only PDFs must be extracted AND investigated for meaningful content. Unknown and gating: a WASM OCR engine's bundle size against the Worker limit, its CPU against the isolate ceiling (D-36, D-56), and its accuracy on a REAL Oakland scanned exhibit rather than a clean synthetic. **FOUR placements to decide between** — in-plane Tier 1 · the pdf-worker fleet member (I6) · an external SERVICE (a first-class candidate, not a fallback; price its distinct cost: the transcription becomes a third-party claim we cannot re-run once they change their model, so the record names the service identity and date exactly as it names an engine and version) · a service-plus-AI-post-processing chain. **Measure DIGITS specifically** — where OCR fails and where human skimming fails too, which is what the attestation ceiling turns on. **One cheap extra measurement**: detect whether a PDF's text layer was itself machine-generated (producer metadata routinely names the scanner or OCR software) — nothing looks today, and a publisher's own OCR saved as a searchable PDF is somebody else's unverified transcription (DEC-4's third amendment). Grade VALUES wait on this measurement; the doctrine (fidelity bounds the CAPTURE axis; no machine mints the grade; member attestation is the only route to the top) is already stated and the measurement must not be read as permission. COMMITS NO PRODUCT CODE; holds no slot. Record in `MEASUREMENTS.md` with date and instrument.
behind-interface: none — it commits no code
depends-on: none
accepts-when: `MEASUREMENTS.md` carries bundle size, CPU per page and character accuracy (digits called out separately) on a named real scanned Oakland document, each with date and instrument, the text-layer-provenance detection result, and a stated recommendation across the FOUR placements; negative control — run the same engine on a BLANK page and confirm it yields nothing rather than plausible text, because an OCR engine that hallucinates on noise is the one failure mode that would put invented text in the record.
added: 2026-08-01 · BOB · amended 2026-08-02 ×2 · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 3ec9a41) — MEASUREMENTS.md 2026-08-03 + probe bio-plane/test/ocr-measure-probe.mjs (re-runs every number). Named doc: legistar-attach-15721260.pdf, a scanned Council resolution, verified image-only (4 pages, 0 fonts). VERDICTS: bundle 6.05 MB raw / 2.72 MB gz → IN-PLANE RULED OUT (92.3% of budget) and PDF-WORKER RULED OUT (~155 KB over the 3 MB gz limit); CPU one 300-dpi page ≈ 17–54M ref-iterations vs the ~40–42M kill window (at the ceiling's order; node proxy — the authoritative number needs a deployed wasm probe). Accuracy 99.96% char, 90/90 digits with tessdata_fast — and the risk axis is WHAT THE RARE ERROR LOOKS LIKE: best_int minted one digit, $→5 turning $26,181,434 into a plausible 526,181,434. NC RUN (blank page → empty text, confidence 0, no hallucination). Provenance: 3/14 recent Legistar attachments name ABBYY FineReader — the Clerk's certified enacted resolutions carry garbled machine OCR overlays; machine layers detectable by one metadata read, layerless scans caught structurally (0 fonts). RECOMMENDATION ADOPTED into CPDF-10's scope note. URL-churn finding recorded as D-166.

### CPDF-10 · queued
milestone: M2
scope: **The Tier-3 OCR path, behind whatever placement CPDF-9's measurement permits.** PLACEMENT SETTLED BY THE MEASUREMENT (2026-08-03, CONDUCT enacting): in-plane and pdf-worker are RULED OUT by bundle size; build against the EXTERNAL SERVICE first (the chain pins service identity + date; the local engine's 99.96%/100%-digits is the accuracy floor a service must beat), with a dedicated ocr-worker fleet member as the preferred end-state GATED on a deployed workerd CPU probe and the page-to-pixels renderer (neither exists; do not pre-build). NO AI post-processing in the DEFAULT chain — the one observed error class ($→5 minting a digit) is exactly what an AI cleanup would silently 'fix'; the ai() chain step stays available, never default. D-152, DEC-4 as twice amended. THE PROVENANCE RULE IS THE ITEM, not the engine: **`text_source` records a CHAIN, not a token** — `pixels → ocr(engine, version) → ai(function, version) → attested(member, date, extent)` — each step naming what performed it, and **each step can only weaken the claim, never strengthen it** (an AI that cleans a garbled line produced more READABLE text, not more RELIABLE text; the hazard of this capability is output that looks better than its input — do not let the chain collapse to a single label). A text LAYER is itself an unverified transcription (`pdfstructure.mjs` already decodes through the file's own `/ToUnicode` map), so **the ceiling is VERIFIED AGAINST THE RENDERED IMAGE, reachable from both paths**: member attestation is offered on a text layer too, SCOPED to what was actually checked (a leg citing outside the attested extent does not inherit it); the chain is still recorded — verification supersedes it as grade determinant, never as record. Attestation is a member act refusable to a machine credential. Transcription fidelity BOUNDS the capture axis (weakest link of byte provenance and fidelity) — no third scale, no new machinery. A basis leg resting on OCR'd text carries its image region (page + rect); OCR never raises a capture grade; a low-confidence region reads `undetermined`, never a best guess. Text reaches the READING path via FW-15's wire.
behind-interface: I2
depends-on: CPDF-9, COFF-1 (dependency corrected 2026-08-03: the handover's "CPDF-8" was RECONCILED §3.3's name for the FORMAT registry, carried as COFF-1. The page-to-pixels rendering path BOB flagged as the other candidate reading is real but is DECIDED by CPDF-9's placement measurement — an external-service placement needs no renderer; an in-plane or fleet placement does — so the renderer item is named when that recommendation lands, not pre-built.)
accepts-when: `cd bio-plane && npm run test:battery` green with a real image-only Oakland PDF yielding text whose `text_source` chain names each step with per-region confidence and reaching `reading_refs`, while a text-layer PDF yields its own honest chain and the two are distinguishable in the projection, the index and an export; an attestation is refused to a machine credential and scoped to its extent; negative control — strip the `text_source` marker and the suite fails naming an OCR'd document indistinguishable from a published text layer; drop the confidence floor so a garbled region emits a best guess and the suite fails; collapse the chain to one label and the suite fails.
added: 2026-08-01 · BOB · amended 2026-08-02 ×2 · enqueued 2026-08-03 · CONDUCT

## CONTENT-OFFICE — DORMANT (queue DRAINED 2026-08-03: COFF-1..7 all done; the office-format axis is built end to end)

New area, from BOB's 2026-08-03 office-formats decomposition. Owns the OOXML container
reader and the office format entries (`bio-plane/src/ooxml.mjs`, `bio-plane/src/formats.mjs`,
the per-format entry modules, their tests), and builds the FORMAT registry (COFF-1).
Registry ownership rests here for now; promote it only if it becomes a cross-area
bottleneck. COFF-1's claim must NAME the two dispatch touchpoints it moves
(`index.mjs`'s acquire-time `HTML_CT` site and the read-time `op=pdfstructure`
dispatch) — CAPTURE and CONTENT-PDF are both dormant, so that is a claim with a note,
not a live delegation. Kickoff: `kickoffs/CONTENT-OFFICE.md` (written at activation,
one act). NAMING NOTE, so no reader hunts for ghosts: `RECONCILED.md` §3.3 lists this
same work as "CPDF-8 (the FORMAT registry)" and "CAP-5 (the OOXML container)" — those
names were never enqueued; COFF-1 and COFF-2 are the items.

### COFF-1 · done
milestone: M2
scope: **The FORMAT registry, with HTML and PDF moved onto it — the D-70 test, and
  NO new capability.** New `bio-plane/src/formats.mjs`: one entry per format in
  I7's shape; detection by magic bytes first, content type second. Move BOTH
  existing dispatch mechanisms onto it: the acquire-time `HTML_CT` guard
  (`index.mjs:1836` — detection consults the registry; the subresource branch
  stays HTML-only in behaviour) and the read-time `op=pdfstructure` dispatch
  (`index.mjs:1417` — the op survives, byte-identical output, routed through the
  registry entry; `pdfstructure.mjs` becomes the PDF entry). Stamp what detect()
  found into the capture's profile ADDITIVELY (I1 §4c gains a `format` field —
  the FW-3/FW-4 additive precedent: minor version bump in the registry in the
  same turn, no protocol case, consumers that ignore it keep working). Then
  CONFIRM I7 from the code as built — the contract was written from design,
  deliberately, and the code wins on drift. Update D-70's row with the verdict:
  if a new format costs a registry entry, §9's cost table is real.
behind-interface: I7
depends-on: none
accepts-when: `cd bio-plane && npm run test:battery` green with HTML and PDF
  outputs pinned unchanged (the existing suites are the pin); a TEST-ONLY stub
  format registers and is reachable through detect→structure with ZERO edits
  outside the registry — that assertion is the D-70 evidence; `npm run
  test:coverage` --strict exit 0; negative control — delete the PDF entry from
  the registry and `op=pdfstructure` fails NAMING the format as unregistered,
  and the battery fails.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 9593f71) — bio-plane/src/formats.mjs: registry with magic-bytes-first enforced BY THE REGISTRY (two-pass detectFormat); HTML_CT guard and op=pdfstructure moved onto it (outputs pinned byte-identical); additive profile.format stamp (I1 1.3.0). formats.test.mjs 35 assertions incl. the stub-format D-70 evidence; battery 68/68 pre-merge, 69/69 (3338) with COFF-2 on main; --strict exit 0. NC RUN (unregister pdf → 501 FORMAT_UNREGISTERED by name, battery 65/68; restored). I7 CONFIRMED 1.0.0 from as-built code (detect the only required fn; explicit nulls are statements). D-70 CLOSED — a new format costs one registry entry; §9's cost table is real.

### COFF-2 · done
milestone: M2
scope: **The OOXML container reader — pure module, ZERO dependency** (measured:
  `deflate-raw` round-trips in workerd; `MEASUREMENTS.md` 2026-08-03 backfill).
  `bio-plane/src/ooxml.mjs`: central-directory walk; member inflate via
  `DecompressionStream("deflate-raw")`; part lookup by name;
  `[Content_Types].xml` parse and flavour discrimination (docx/xlsx/pptx vs an
  arbitrary ZIP a body might also publish); the uniform `_rels/*.rels` walker
  (`TargetMode="External"` → outbound, shared by all three formats and ODF);
  `docProps/core.xml` metadata extraction (creator, lastModifiedBy, revision
  count, instants — evidentiary per DEC-5); size-guard plumbing (the bound is a
  NAMED PROVISIONAL constant until COFF-6 measures it; over bound →
  `text-undetermined` with the reason, NEVER silent truncation). ODF is DESIGNED
  FOR (the part-map is a parameter), not built. Builds against I7 on paper —
  independent of COFF-1's landing.
behind-interface: I7
depends-on: none
accepts-when: battery green with fixture round-trips for all three flavours; a
  plain ZIP is NOT identified as OOXML, and a renamed one is caught by
  magic-bytes-plus-parts rather than extension or content type; a truncated
  central directory yields a stated `undetermined`, never a silent partial;
  negative control — neuter the flavour discrimination and the suite fails on
  the plain-ZIP assertion.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: 7404f21 (worker a20e3ec) — bio-plane/src/ooxml.mjs, pure zero-dependency (CD-as-authority walk, deflate-raw inflate with length+crc32 verified, OPC name normalization, [Content_Types].xml flavour gate requiring declared type AND part present, uniform .rels walker, core-props extraction, size-guard with NAMED 32 MiB provisional for COFF-6). ooxml.test.mjs 97/97 hermetic; battery 68/68 (3301); --strict exit 0. NC RUN (neuter flavour discrimination → 13/97 fail incl. plain-ZIP). Vocabulary note for COFF-1's I7 confirmation: format "zip" (no [Content_Types].xml) vs "undetermined"+why is a deliberate split — confirm or amend when writing I7 from code.

### COFF-3 · done
milestone: M2
scope: **The XLSX registry entry.** FIRST, one mechanical enactment from COFF-6: replace ooxml.mjs's PROVISIONAL_OOXML_SIZE_BOUND_BYTES (32 MiB container) with the MEASURED bound — 20 MiB of DECLARED UNCOMPRESSED text-part bytes summed from the central directory before inflation (MEASUREMENTS.md 2026-08-03; the metric changed, not just the number), keeping the over-bound → text-undetermined marker. Streaming-to-64-MiB is DEFERRED (see COFF-6's landed line), do not build it. Structure:
  `xl/worksheets/_rels/sheetN.xml.rels` → I2 partitions through the ONE
  `linkWrapper` (parity with HTML/PDF asserted, as `pdfstructure.test.mjs` pins
  it); defined names and cross-sheet refs → `anchor`; `xl/embeddings/` →
  `intra`; element references `{kind:"sheet-cell"}` per resolved IC-1. Text:
  `xl/sharedStrings.xml` + sheet `<v>` values. THE EVIDENTIARY CORE (DEC-5):
  the `<f>` FORMULA held BESIDE its cached `<v>` value, distinguishable
  everywhere the text is shown, cited or indexed — the derivation is frequently
  the finding, and every rendered form of the sheet destroys it; hidden rows,
  columns and SHEETS emitted flagged hidden (a hidden sheet is a first-class
  finding invisible in every rendered form). Extras land under ONE shared I2
  extension envelope: the FIRST of COFF-3/4/5 to land files it against I2 as
  IC-2 from as-built code (the I1 write-from-code precedent), the other two
  confirm rather than invent variants.
behind-interface: I2
depends-on: COFF-1, COFF-2, and IC-1 RESOLVED (a protocol state, not an item —
  §1 above)
accepts-when: battery green with a real Oakland workbook fixture yielding
  cell-referenced links, formulas beside values, and a hidden sheet flagged; an
  over-bound workbook → `text-undetermined` named; negative control — collapse
  `<f>` into `<v>` and the suite fails naming the formula/value distinction,
  AND strip the hidden flag and the suite fails.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker c57b909) — COFF-6's bound enacted FIRST: MEASURED_OOXML_TEXT_BOUND_BYTES = 20 MiB of declared uncompressed text-part bytes (metric AND number changed; declaredTextBytes() enacts it at one place; streaming-to-64-MiB NOT built, deferred). formats-xlsx.mjs: sheet-cell references (Summary!B14) per IC-1; rels joined to per-sheet hyperlink cells through the ONE linkWrapper; formulas held BESIDE cached values as two named fields on one evidence item; hidden rows/columns/sheets flagged AND hidden sheets as first-class findings; over-bound → full structure/metadata with the lost cell-join STATED, text refused with the guard marker verbatim. IC-2: variant filing (evidence key) DELETED at reconciliation, never reached main; CONFIRMED under the accepted evidentiary envelope with the xlsx kind vocabulary; core-properties carried as an item kind matching docx.mjs as built. formats-xlsx.test.mjs 75 assertions; battery 71/71 (3540); --strict exit 0. NCs RE-RUN on the conformed shape (collapse f into v → 3/75 fail by name; strip hidden flag → 6/75 fail by name; restored). One cross-claim correction reviewed and accepted at integration: formats-docx.test.mjs:351's provisional-bound pin corrected-with-comment to the measured constant — the property under test (the marker NAMES its bound) unchanged.

### COFF-4 · done
milestone: M2
scope: **The DOCX registry entry.** Structure: `word/_rels/document.xml.rels` →
  partitions through `linkWrapper`; bookmarks → `anchor`; `word/embeddings/` →
  `intra`; element references `{kind:"doc-para"}` per resolved IC-1 (paragraph
  0-based required, run optional — run boundaries are producer artifacts; the
  paragraph is what a person is shown). Text: `<w:t>` runs in body order. THE
  EVIDENTIARY CORE (DEC-5): tracked changes — `w:ins`/`w:del` with AUTHOR, DATE
  and the SUPERSEDED WORDING — and `word/comments.xml` with author and date;
  both are evidence a published PDF is specifically designed to remove. Extras
  under the shared envelope (IC-2 rule as in COFF-3).
behind-interface: I2
depends-on: COFF-1, COFF-2, and IC-1 RESOLVED (§1 above)
accepts-when: battery green with a real Oakland DOCX fixture yielding
  paragraph-referenced links and a tracked change carrying author, date and the
  superseded wording; an unreadable part → stated `undetermined`; negative
  control — drop the superseded wording from the `w:del` emit and the suite
  fails naming it.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 64e2238) — bio-plane/src/docx.mjs on ooxml.mjs primitives; paragraph-referenced links ({kind:"doc-para", ref, para, run}) with wrappers byte-identical to linkWrapper; tracked changes carry author, date and the SUPERSEDED WORDING (excluded from text — the document as served — held attributed in the envelope); comments with author/date; unreadable parts stated ({part, why}), never invented. formats-docx.test.mjs 82 assertions; battery 70/70 (3459); --strict exit 0. NC RUN (drop superseded wording → 2/82 fail by name; restored). IC-2 FILED first-lander (the evidentiary envelope + pageless text.paragraphs form); CONDUCT proxy-answered AGREE for dormant FRAMEWORK, RESOLUTION ACCEPTED, and applied the ONE version bump I2 1.0.0 → 1.1.0 covering IC-1 (CHANGED — the source union) and IC-2 together. Detect ladder: bare PK at the 1 KiB seam answers null; certainty is architecturally impossible before inflation.

### COFF-5 · done
milestone: M2
scope: **The PPTX registry entry.** Structure:
  `ppt/slides/_rels/slideN.xml.rels` → partitions through `linkWrapper`; slide
  refs → `anchor`; `ppt/embeddings/` → `intra`; element references
  `{kind:"slide-shape"}` per resolved IC-1. Text: `<a:t>` runs per slide. THE
  EVIDENTIARY CORE (DEC-5): `notesSlide` speaker notes — routinely more candid
  than the slide — emitted per slide and distinguishable from slide text
  everywhere shown, cited or indexed. Extras under the shared envelope (IC-2
  rule as in COFF-3).
behind-interface: I2
depends-on: COFF-1, COFF-2, and IC-1 RESOLVED (§1 above)
accepts-when: battery green with a real Oakland deck fixture yielding
  slide+shape references and speaker notes distinguishable from slide text;
  negative control — merge notes into slide text and the suite fails naming the
  distinction.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker fde39df) — bio-plane/src/pptx.mjs on the accepted as-built patterns: slide-shape references with slide numbers from the DECLARED sldIdLst order resolved through rels, never filenames (reordered-deck fixture proves it; unreadable declaration → honestly unnumbered, never filename-derived); speaker notes distinct EVERYWHERE (envelope kind speaker-notes, separate text.speakerNotes[] units, counts.notesChars — never in document, the deck as presented); notes survive a corrupt slide because the slide→notes mapping lives in the rels; hlinkClick slide jumps → anchor; embeddings → intra by sha256; core-properties as the shared item kind. IC-2 CONFIRMED from as-built code, no variant. formats-pptx.test.mjs 95 assertions; battery 72/72 (3637) after the one integration-seam correction (the suite branched before COFF-3's bound rename landed — the stale PROVISIONAL bound pin corrected-with-comment by CONDUCT at merge, the exact formats-docx precedent); --strict exit 0. NC RUN (merge notes into document → 2/95 fail by name; restored). Worker's flag QUEUED as COFF-7: hidden slides (p:sld show="0"), the pptx analogue of xlsx hidden sheets.

### COFF-6 · done
milestone: M2
scope: **Measure the real Oakland office corpus BEFORE the bounds and deferrals
  harden — measurement-only, commits no product code, holds no slot (the
  CPDF-5/7 pattern), runs immediately.** On real documents from Oakland's
  orbit: size distribution (SETS the extraction bound COFF-2 ships
  provisionally — the bound is measured, never picked); link density; frequency
  of formulas, tracked changes, comments, speaker notes and hidden sheets
  (sizes the evidentiary value actually present in this corpus); legacy
  `.doc`/`.xls`/`.ppt` (OLE2) prevalence — the EMPIRICAL answer to the
  legacy-format question, which stays deferred with this measurement as its
  trigger; ODF prevalence (COFF-2 designs for it; this decides whether it is
  ever built). Record in `MEASUREMENTS.md` with date and instrument.
behind-interface: none — it commits no code
depends-on: none
accepts-when: `MEASUREMENTS.md` carries the size distribution with a stated
  recommended bound, the per-artefact frequency table, and the legacy/ODF
  prevalence counts, each with date and instrument, plus a stated
  recommendation on the legacy deferral; negative control — include one file
  that is a renamed plain ZIP masquerading as `.xlsx` and confirm the
  instrument reports it as NOT OOXML rather than counting it.
added: 2026-08-03 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 7354079) — MEASUREMENTS.md 2026-08-03 + instrument tools/measure-office-corpus.py (stdlib, seeded, reproducible). Census of ALL 43,282 oaklandca.gov assets (S3 ListObjectsV2) + 792 Legistar attachments; 93-file stratified download + size tail. BOUND: 20 MiB of DECLARED UNCOMPRESSED text-part bytes summed from the central directory (container size is a bad proxy both directions) — passes 86/88 measured OOXML files; the two excluded are the 2019/2020 police Stop-Data workbooks, named as the raise-to-64-MiB test cases. Artefact frequencies real (tracked changes 7/40 docx, formulas 18/30 xlsx, hidden sheets 3/30). LEGACY: 0.32% of assets, KEEP DEFERRED — revisit trigger is a group actually needing one inspected. ODF: zero in 43,282 — DO NOT BUILD; keep the free design accommodation only. NC RUN (renamed plain ZIP reported NOT OOXML, never counted). CONDUCT's scope ruling on the worker's decision item: COFF-2's DOM reader ships at the 20 MiB bound; the two stop-data workbooks read text-undetermined honestly; a streaming (memory-flat) extractor reaching 64 MiB is DEFERRED on the same trigger shape as legacy formats — a group actually needing those workbooks inspected — because pre-building it now is the do-not-pre-build failure. COFF-3 enacts the bound.


### COFF-7 · done
milestone: M2
scope: **Hidden slides — the pptx analogue of xlsx hidden sheets (DEC-5).** Flagged by COFF-5's worker and queued by CONDUCT: a slide carrying `show="0"` in its `sldIdLst` entry is invisible in every presented form of the deck and is exactly the first-class finding hidden xlsx sheets already are. Add one envelope kind (`hidden-slide`) to pptx.mjs's evidentiary output, the slide still fully extracted (text, notes, links) and flagged everywhere shown, cited or indexed; confirm the kind under IC-2 (one line — the vocabulary grows, the envelope does not change shape). Small, self-contained, touches only pptx.mjs + its suite.
behind-interface: I2
depends-on: COFF-5
accepts-when: `cd bio-plane && npm run test:battery` green with a fixture deck whose hidden slide is extracted AND flagged (kind `hidden-slide`, text units marked) while visible slides are not; `npm run test:coverage` --strict exit 0; negative control — strip the flag and the suite fails naming a hidden slide indistinguishable from a visible one.
added: 2026-08-03 · CONDUCT (from COFF-5's report)
landed: (merge on main, worker 7eb9d84) — envelope kind hidden-slide; the hidden slide extracted IN FULL (text, notes, links) and flagged everywhere (envelope item + hidden mark on every text unit; an orphan notes unit's mark honestly null). FACTUAL CORRECTION accepted at integration: this item's scope located show="0" on the sldIdLst entry; ECMA-376 puts it on CT_Slide (the p:sld root — where PowerPoint's Hide Slide writes it); the worker read BOTH locations and reading only the queued one would have missed every real hidden slide. Considered choice accepted: hidden text stays in `document` beside the flag (the xlsx hidden-sheet precedent — the record holds what the file holds; included AND flagged). formats-pptx 110 assertions; battery 72/72 (3652); --strict exit 0. NC RUN (neuter the declaresNotShown funnel → 8/110 fail by name; restored). IC-2 vocabulary CONFIRM appended, envelope shape unchanged.

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

## FRAMEWORK — DORMANT (FW-15 landed 2026-08-03; FW-13/FW-14 wait on REC-11/REC-19 — the slot returned to RECORD)

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

### FW-13 · queued
milestone: M9
scope: **Decide `data/citations.json` / C-8.1 — retire, or bind.** As `BUILD-ORDER.md` §2 (FW-13), carried forward verbatim per `RECONCILED.md` §3.3. Doing neither is not an option; correct the superseded check, never exempt it.
behind-interface: none — the check catalogue and one debt row
depends-on: REC-11
accepts-when: as `BUILD-ORDER.md` §2 (FW-13); negative control — leave both claim structures live and unrelated, and the hygiene assertion fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### FW-14 · queued
milestone: M8
scope: **Assign the weight-ladder rung to every mutating op, or state that it has none.** As `BUILD-ORDER.md` §2 (FW-14), carried per `RECONCILED.md` §3.3 (its derivation method already yields C-7's answer). **DEC-19 as amended** — the ladder's top rung reads **IRREVERSIBLE** with the correction path beside it: publishing is the one irreversible act; correction always moves FORWARD (a new edition, a withdrawal as another attested act, both standing); the distinguishing property of `attested` acts below it is that they cannot be undone SILENTLY, not that they cannot be undone. Derive rungs from what the code already enforces; raise a DEC for any genuinely ambiguous op rather than choosing.
behind-interface: I3
depends-on: REC-19
accepts-when: as `BUILD-ORDER.md` §2 (FW-14); plus the published rung vocabulary names `irreversible` at the top and no op publishes a rung its store behaviour contradicts; negative control — assign `reversible` to `op=retire` and the suite fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### FW-15 · done
milestone: M3
scope: **The L2→L3 wire — a PDF's text becomes a reading.** As `BUILD-ORDER.md` §2 (FW-15), carried forward verbatim per `RECONCILED.md` §3.3. From DEC-4's amendments: when CPDF-10 lands, this item's acceptance ALSO covers an OCR'd document reaching `reading_refs` (the clause activates with CPDF-10; the wire itself does not wait for it).
behind-interface: I2
depends-on: none
accepts-when: as `BUILD-ORDER.md` §2 (FW-15) — a real Oakland agenda PDF with decodable Tier-1 text produces `readings` + `reading_refs`; an `undetermined` text yields a FAILED reading (`found: false`), never invented refs; negative control — bypass the wire and a document known to name three entities reads zero `reading_refs`.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT
landed: (merge on main, worker 742d15a) — docprofile/readtext.mjs, the ONE entry point taking text from anywhere (bare string, I2 pages[], I2 paragraphs[]) through identify()/doctypeFor()/parse(); acquire's not-read-as-text branch wired through it for single-part captures via the FORMAT registry's own text surface (pdf Tier 1 with the existing needsTier2 escalation to the pdf-worker; docx/xlsx via text(parts)). Reading additively carries text_source:'layer'/text_tier/text_container — D-152's provenance discriminator in place before OCR exists. A REAL Legistar agenda packet (committed fixture, sha pinned) acquires to a readings row + 41 reading_refs findable by legislation number; an encrypted PDF reads found:false naming encrypted, never invented. Office paragraphs[] form PROVEN end-to-end (a real-shaped .docx acquires to 3 reading_refs). New measured doctype meeting-agenda (written from the real packet; MEASUREMENTS entry). reading-wire.test.mjs 55 assertions; battery 73/73 (3709) with COFF-5/7 merged; --strict exit 0. NC RUN (force the wire branch off → 33/55 fail incl. the named 3→0 readingref counts; restored). Named tactical cost, accepted: intake now pays the cross-worker hop for a Tier-2 PDF at acquire time when the fleet is installed. Stack-axis mislabel recorded as D-167. The OCR'd-document acceptance clause activates with CPDF-10, as queued.

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

## UI — DORMANT (pre-seeded with the case-making surfaces; its UI-1…UI-9 run is done; promoted when a RECORD slot frees)
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

### UI-9 · done
milestone: M8
scope: CONSTRUCTS Step 8 (PRESENTATION), the document-page half — a document page SHOWS its REFERENTIAL and TEMPORAL structure, so a member reading ONE document sees its place in the accountability web (UI-4 is per-subject; this is per-document). On the existing document/bundle view (`openBundle`), add: (1) the ENTITIES this document resolves to and at what §8.1 grade (`op=resolutions`/`op=readingref` for its `capture_sha` — a Grade C shown "plausible, not established", never as fact); (2) what it CONNECTS to (`op=connections` for its captures — graded, weaker-end); (3) which PROGRESSIONS it participates in and at which stage (`op=instance`); (4) whether a required SUCCESSOR is OVERDUE (REC-8's `overdue_successor` via `op=proposals`/`op=instance`) — "the minutes are N days overdue", shown HONESTLY (undetermined/undated stays undetermined, never a fabricated deadline). READ-ONLY presentation; the acts live on their own surfaces. Consume existing ops; do NOT reshape the plane; DELEGATE if a per-document lookup isn't exposed (e.g. "which progressions is this capture in"). DEFER: the CASE FILE (Step 8's other half).
behind-interface: I3
depends-on: none
accepts-when: `civicos-ui/test/run.mjs` green with a document-page test showing the document's resolved entities (Grade C as unconfirmed), its graded connections, its progression membership, and an overdue-successor note when one exists (and none when not); negative control — render a Grade C resolution as established, OR an overdue note when nothing is overdue, and the test fails.
added: 2026-07-31 · CONDUCT
landed: e2e05e4 — CONSTRUCTS Step 8 PRESENTATION (document-page half): a "what the record knows about this document" panel on openBundle. LIVE over existing ops: (1) the ENTITIES it resolves to (op=resolutions by capture_sha) at their §8.1 grade via UI-4's subjGradeBadge (Grade C "plausible, not established", never fact) + bounded op=entity fan-out for labels (falls back to raw ref, never invents); (2) what it CONNECTS to (op=connections by capture_sha, weaker-end grade). PENDING a delegated op (items 3-4): progression membership + overdue — NO op maps a capture→its instances (op=instance needs (progression_key,entity_id); op=proposals carries no capture_sha; overdue lives ONLY in proposalsFeed) → degrades to a named on-screen gap. Overdue read from REC-8's overdue_successor kind + op's overdue_by_ms (undated→silent). civicos-ui 22 harnesses (document-structure 38). Plane battery untouched. NC RUN (force overdue-true → note appears when nothing overdue). DELEGATION UI→RECORD op=captureprogressions → REC-9. CASE FILE deferred (Step 8 other half).

### UI-10 · queued
milestone: M9
scope: **The type in the UI, and the drift guard made real.** As `BUILD-ORDER.md` §2 (UI-10), carried forward verbatim per `RECONCILED.md` §3.3. The member-facing names are inquiry / finding / case BY PHASE, derived from `current_state`, never stored twice. **The D-138 half is NOT optional (DEC-8)**: `check-semantics.mjs` claims to guard drift and never reads `bio-checks.mjs` — make the guard real (import and compare `PREFIX`/`FIRST_STATE`/`HEADINGS`/`SCHEMA_OF`); it is what keeps the interim honest until every surface reads the plane.
behind-interface: I3
depends-on: REC-10
accepts-when: as `BUILD-ORDER.md` §2 (UI-10) — `node civicos-ui/test/run.mjs` green with `check-semantics.mjs` now reading `bio-checks.mjs`; negative control — change `HEADINGS.inquiry` in `bio-checks.mjs` alone and `check-semantics.mjs` FAILS naming the drift, which today it cannot.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-11 · queued
milestone: M9
scope: **S3 THE INQUIRY PAGE, read-only.** As `research/RECONCILED.md` §3.1 (UI-11): TWO strengths, never one — each naming its own weakest leg, no score/percentage/average/bar, no rendering reducing them to one letter; the UNDETERMINED primitive is the shared three-line component (C-14). Reshaped since: **DEC-18** — an ungraded leg renders as INERT: named and visible as *not yet load-bearing*, excluded from the population, never suspending an axis that has graded legs; **UNRATED** is the boundary case when no leg is graded, and `UNRATED` is the word (D-160). **DEC-15** — a hunch leg is VISIBLY a hunch from the moment it is made, not disclosed at publication; the strength panel states the case cannot publish while one stands (the failure this invites is a hunch quietly ageing into a fact). **Q9 (settled)** — the three-line shape's third line comes from a CLOSED SET of three forms (could-not-determine / positively-none / suspended-axis), selected by plane-published facts; a free-text third line fails the harness. **Q12 (settled)** — read-only credential narration is surface-scoped and plane-sourced (one sentence from `whoami`); controls are never narrated, never greyed.
behind-interface: I3
depends-on: REC-12, UI-10
accepts-when: as `RECONCILED.md` §3.1 (UI-11) — harness green with a mixed basis reading two strengths naming two legs; a `cuts_against` leg counted on its own axis; an ungraded leg named as not load-bearing while its axis still reads from graded legs; an all-ungraded basis reading UNRATED; a hunch leg visibly marked with the cannot-publish note. Negative controls — one composed letter fails; averaging fails; rendering an ungraded-but-others-graded basis as suspended fails; a free-text third line on the undetermined primitive fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-12 · queued
milestone: M9
scope: **S3's act bar — CONCLUDE, through the ACT construct, options read from the plane.** As `research/RECONCILED.md` §3.1 (UI-12): the live strength preview renders the PAIR — a Grade C capture drops the capture axis visibly and leaves connection alone (the one mechanism that teaches R2 without prose). **DEC-8 acceptance clause: renders no refusal it computed itself** — every refusal rendered is one the plane returned. Q12's narration clause applies. DELETE `DISPOSITIONS` in the same turn.
behind-interface: I3
depends-on: REC-13, REC-19, UI-11
accepts-when: as `RECONCILED.md` §3.1 (UI-12) — every option and rung from `op=affordances` (assert `DISPOSITIONS` gone), pair-preview moving one axis only, plane-reason refusal on empty falsifier, and NO refusal string originating in the surface; negative controls — surface-side option map fails; prefilled conclusion fails; one composed letter in the preview fails; a surface-computed refusal fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-13 · queued
milestone: M8
scope: **A WRITE SURFACE for the intent layer — nine ops, zero callers.** As `BUILD-ORDER.md` §2 (UI-13), carried forward verbatim per `RECONCILED.md` §3.3. Unblocks REC-18's earned grades — the only thing still blocking it.
behind-interface: I3
depends-on: REC-19
accepts-when: as `BUILD-ORDER.md` §2 (UI-13); negative control — render a declared relation with a grade badge and the harness fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-14 · queued
milestone: M8
scope: **S1 THE QUEUE — three screens become one.** As `research/RECONCILED.md` §3.2 (UI-14): mute control reads "Mute conditions on this case" and reaches CONDITION items only; the capture-honesty vocabulary correction; the shared three-line primitive. Reshaped since: **DEC-16** — one EVENT renders under several cases (every ancestor); resolving once clears all of them; a member who did not resolve it sees *resolved by X on this date*, never a gap. **Q13 (settled)** — within a class, LONGEST-WAITING FIRST is the RULE, not a proxy, and the ordering rule is STATED on the surface. **DEC-8** — renders no refusal it computed itself. **Q12** narration clause.
behind-interface: I3
depends-on: REC-20, UI-10, REC-25
accepts-when: as `RECONCILED.md` §3.2 (UI-14) — an OBLIGATION and an aggregated FINDING grouped under one case, one event under two ancestor cases clearing everywhere on one resolution with the resolver named, an ungrouped item, a named per-feed failure with no count, Retry re-running only the failed feed, the all-clear withheld while one feed pends, and the ordering rule stated on the surface; negative controls — a count for a failed feed fails; a resolved event leaving a stale copy under a second ancestor fails; mute hiding an OBLIGATION fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-15 · queued
milestone: M8
scope: **E3 ADD — the two worst live defects in the member UI, plus F-6 and F-7.** As `BUILD-ORDER.md` §2 (UI-15), carried forward verbatim per `RECONCILED.md` §3.3 (C-11 resolves to "ships absent", which is what it already does).
behind-interface: I3
depends-on: REC-23
accepts-when: as `BUILD-ORDER.md` §2 (UI-15); negative control — remove the `ADD_TICKS` declaration and the harness reproduces the raw ReferenceError.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-16 · queued
milestone: M8
scope: **E4 PROJECT WORKSPACE — the ballot act finally gets a call site.** As `BUILD-ORDER.md` §2 (UI-16), carried forward verbatim per `RECONCILED.md` §3.3; the workspace lists inquiries and actions and shows NO strength, NO grade, NO conclusion — take the container side. **DEC-8** — renders no refusal it computed itself. **Q12** narration clause.
behind-interface: I3
depends-on: REC-19, REC-25
accepts-when: as `BUILD-ORDER.md` §2 (UI-16); plus no refusal string originates in the surface; negative control — render an inquiry's grade in the workspace and the harness fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-17 · blocked
milestone: M10
scope: **O1 THE PUBLICATION CEREMONY — DEFERRED by DEC-33** (Bob, 2026-08-03: the process is deferred; publication runs through the operator for now; UI-17a ships in its place). Trigger: Bob reopens the case-making thread. Recorded for when it wakes: base scope as `research/RECONCILED.md` §3.1 (UI-17) — the pair shown in step 2, the C-9 picker, the Q5 re-keyed basis-leg panel (an assembly keyed on the SUBJECT is permitted; keyed on the ANSWER-SHAPE it performs generation by selection — the panel shows the case's own basis legs, the COMPLEMENT of the field's content), instance-wide `NO_SIGNERS` wording — plus **DEC-19 as amended** (publishing is IRREVERSIBLE; correction moves forward; the ceremony states this) and **DEC-13** (the subject-position stage, ordered BEFORE signing since authoring it changes the sha). D-158 bounds the per-member pre-flight.
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance reason appearing in step 3's panel fails the harness.
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33

### UI-17a · queued
milestone: M10
scope: **The publication entry point — the placeholder DEC-33 ships in UI-17's place.** A small surface stating what publication IS (the irreversible act, editions, what a published case promises — DEC-19's corrected top rung) and that publication currently runs THROUGH THE OPERATOR; no ceremony controls, no signing, no preflight. Q12's rule: narration is surface-scoped and plane-sourced (one sentence from `whoami`); controls are never narrated and never greyed — absent, not disabled.
behind-interface: I3
depends-on: UI-11
accepts-when: `node civicos-ui/test/run.mjs` green with a harness where the entry point renders the statement and offers NO ceremony control of any kind; a read-only credential sees the same surface with one whoami-sourced sentence; negative control — render a sign/preflight control, or grey a control instead of omitting it, and the harness fails.
added: 2026-08-03 · CONDUCT (DEC-33's placeholder)

### UI-18 · queued
milestone: M10
scope: **O2 THE PUBLISHED CASE — the reason the rest exists.** As `research/RECONCILED.md` §3.1 (UI-18): both strengths everywhere including the index row; a published child NAMES its parent and siblings (serve neither); a threshold may not drop a determining or suspending leg; **Q6 (settled)** — the threshold selector is a NAMED STANCE resolving to a PAIR OF INDEPENDENT FLOORS, evaluated conjunctively, both floors stated in-band, a floor of `none` rendered explicitly, a suspended axis satisfying only `none`. Reshaped since: **DEC-17 as amended** — the case discloses the DECLARED required-strength bar beside the strength reached, prominently (a reader building on another group's case sees the standard it was held to); an absent bar renders as absent, never as zero. **DEC-34** — the surface serves the CONTAINER and its PDF renderings; every PDF page carries case id, edition, authors, declared bias, both floors, hash and verification pointer (H4 made unavoidable; tamper-EVIDENT, never claimed tamper-proof). **DEC-31's bound rule** — addressed renderings carry hash, date, author and both floors in-band. **DEC-18/D-160** — ungraded legs named as not load-bearing; UNRATED vocabulary. **Q12** narration clause.
behind-interface: I3
depends-on: REC-22, UI-17a, REC-16
accepts-when: as `RECONCILED.md` §3.1 (UI-18) — plus a rendering names BOTH floors it applied including any `none`; the declared bar renders beside the reached strength and an absent bar renders as absent; a PDF page without the DEC-34 header fails the harness. Negative controls — drop a determining leg at a threshold fails; child with no parent named fails; one composed letter anywhere including print fails; one floor applied to both axes, an unconstrained axis, or an omitted `none` floor fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-19 · queued
milestone: M10
scope: **O3 THE ACTION PAGE — the outward ask, and what came back.** As `BUILD-ORDER.md` §2 (UI-19), carried per `RECONCILED.md` §3.3 (already refuses from the catalogue's edge table), with REC-24's DEC-13/DEC-14 additions surfacing here: `request_for_comment` names the inquiries it disclosed; an outcome is dated first-party fact and an impact claim renders its non-self evidence leg or renders `unproven` as a stated state. **DEC-8** — renders no refusal it computed itself.
behind-interface: I3
depends-on: REC-24, UI-11
accepts-when: as `BUILD-ORDER.md` §2 (UI-19); plus no refusal string originates in the surface; negative control — render an overdue note when nothing is overdue and the harness fails; prefill the counterparty basis and it fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-20 · queued
milestone: M9
scope: **`op=cite` gets its caller — the never-built U9 half.** As `research/RECONCILED.md` §3.1 (UI-20): the pre-flight checks every member is CITABLE (`information` OR `inquiry` — `NOT_INFORMATION` is the wrong check now) and that no member would close a cycle, naming the path; the rung is `reversible` from the plane (C-7 verified), note optional, `BAD_NOTE` over 200 chars. **DEC-8** — renders no refusal it computed itself; the pre-flight renders plane-sourced results. **Q12** narration clause. Also `retire`/`sever`/`reinstate` call sites on the document page, each with its rung from `op=affordances`.
behind-interface: I3
depends-on: REC-11, REC-19, UI-11
accepts-when: as `RECONCILED.md` §3.1 (UI-20) — citing an `INQ-` onto an inquiry succeeds; a cycle-closing cite refused before it runs naming the path; the note optional and bounded; negative controls — as RECONCILED, plus remove the cycle check from the pre-flight and the harness reaches the plane with a cyclic cite.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

### UI-21 · queued
milestone: M8
scope: **E1 THE EVIDENCE FINDER — one finder, two NAMED routes, the intersection refused rather than approximated.** As `BUILD-ORDER.md` §2 (UI-21), carried forward verbatim per `RECONCILED.md` §3.3. **Q12** narration clause.
behind-interface: I3
depends-on: REC-25, UI-13
accepts-when: as `BUILD-ORDER.md` §2 (UI-21) — two routes with separate counts and an overlap figure, the cross-seam query refused with two runnable alternatives, `SEARCH_SCOPES` gone; negative control — present a combined total across the two routes and the harness fails.
added: 2026-08-01 · BOB · enqueued 2026-08-03 · CONDUCT

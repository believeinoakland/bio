# PLACEMENT — moved from `docs/development/MILESTONES.md` by M0-110 (BOB #28's ruling 3; state, so it lives on `coord`)

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
| D-39 empty POST body | RECORD | M7 |
| D-40 illegal `criticality` in fixtures | CONDUCT | M0 |
| D-42 burner invitations half built | RECORD | M7 |
| D-50 name uniqueness absent from the catalog | RECORD | M7 |
| D-52 export recorded, nobody notified | RECORD | M7 |
| D-54 installer must REQUIRE and verify Workers Paid (DEC-42) | DIST | M7 · was M2/"detect"; character changed 2026-08-04 |
| D-185 free-tier frugality now defends limits no supported instance runs under (DEC-42) | CAPTURE · DIST | M7 · settle with D-54 |
| D-57 self-reference reported as a change | CAPTURE | M3 |
| D-59 `contemporaneous` never observed | CAPTURE | M3 |
| D-60 docprofile unadopted | FRAMEWORK → CAPTURE | M3 |
| D-61 unattended writer can take a lease · DONE (REC-2) | RECORD | M1 · done |
| D-62 `setup.mjs` omits `content_hash` | RECORD | M7 |
| D-63 unmeasured stacks | FRAMEWORK | M2 |
| D-64 client-rendered capture | CAPTURE | M2 · its build and `CLIENT-RENDERED.md`'s four open questions (D-55 closed 2026-09-21) |
| D-65 monitoring contracts unconsumed | FRAMEWORK → CAPTURE | M1 · M3 · PLACED 2026-09-22 in `BACKLOG.md` |
| D-66 unmeasured content types | FRAMEWORK | M2 · PLACED 2026-09-22 in `BACKLOG.md` |
| D-67 connections discarded | FRAMEWORK | M4 |
| D-68 seven vocabularies | FRAMEWORK | M3 · **blocks M3, M4** |
| D-71 readings transient | FRAMEWORK | M4 |
| D-72 connections have no grade | FRAMEWORK | M4 |
| D-73 pair vs chain | FRAMEWORK | M4 |
| D-74 Oakland shared identifiers | FRAMEWORK | M4 · PLACED 2026-09-22 in `BACKLOG.md` |
| D-78 / D-82 `surfaced_by`, and showing it | RECORD · UI | M7 |
| D-80 aspiration contact | FRAMEWORK | M4 |
| D-83 subject registry = entity axis | FRAMEWORK | M4 |
| D-84 `object_type: bias` missing | RECORD | M4 |
| D-85 / D-86 an assistant question inside its run, and bias debt's producer | RECORD | M4 · D-86 PLACED 2026-09-22 in `BACKLOG.md` |
| D-92 `op=file` 403 under load | RECORD | M7 |
| D-93 suite crashes, `sshsig` runs short | CONDUCT | M0 |
| D-99 WARC / Memento | RECORD | M6 |
| D-107 installer scripted deploy | DIST | M7 |
| D-109 task drain (landed) | CAPTURE | M1 |
| D-110 stale refusal string | RECORD | M7 |
| D-115 installer installs one Worker, not the fleet | DIST | M7 |
| D-116 version authority across the fleet | DIST · RECORD | M7 |
| D-117 coverage instrument blind to the fleet | CONDUCT | M0 |
| D-118 service bindings on Free unmeasured | CONTENT-PDF | M2 · measure first |
| pdf-worker · Tier 1 in-plane extractor, then coverage measurement | CONTENT-PDF | M2 |
| pdf-worker · Tier 2 (`unpdf`) as a fleet member behind I6 | CONTENT-PDF · DIST | M2 |
| D-121 office formats: the FORMAT registry + OOXML container | CONTENT-OFFICE (new area) | M2 · queued COFF-1..COFF-6 (BOB INBOX 2026-08-03) |
| D-122 office formats carry latent evidence AND personal data | — | DOCTRINE · DEC-5 |
| CAPTURE-SCALING item 6 · reuse verification + re-fetch at ratification | CAPTURE | M2 · DECIDED, queued CAP-4 |
| CAPTURE-SCALING open · freshness window, recurrence threshold | CAPTURE | M2 (measurement first) |
| ARCHIVE-FALLBACK · per-document cadence by volatility | RECORD · CAPTURE | M1 |
| ARCHIVE-FALLBACK · Memento rather than Wayback | RECORD | M6 |
| LINK-FIDELITY steps 6–8 · objective type, cascade planting, re-resolution | RECORD · CAPTURE | M4 |
| CLIENT-RENDERED · rendered grade and method vocabulary | CAPTURE | M2 · an open question for ratification in `CLIENT-RENDERED.md` |
| CONSTRUCTS Steps 0–5a | FRAMEWORK | M3 · M4 |
| CONSTRUCTS Steps 6–8b | FRAMEWORK · UI | M4 |
| ~~no scheduler exists~~ BUILT 2026-08-01 — one DO alarm, FIVE consumers | RECORD | M1 · landed |
| **captured content is not indexed** | RECORD | M5 |
| **capture-byte custody at scale** | RECORD | M6 |
| UI-PLAN U9–U14 → **the residue is rowed as UI-60 (2026-09-14): U13, U14, expertise/licences, verified export, the doorbell; U9–U12 BUILT per UI-58's measured Status on `UI-PLAN.md`** | UI | M8 |
| ~~the task inbox has no surface (D-98 shipped)~~ BUILT — measured 2026-09-14 by UI-58 against `civicos-ui/` (the queue surface, M8's first rung) | UI | M8 · landed |
| ~~project participation + governance have no surface (S-12 §7)~~ BUILT — measured 2026-09-14 by UI-58 | UI | M8 · landed |
| expertise/licences have no surface | UI | M8 |
| verified export has no surface (§8) | UI · RECORD | M8 |
| ~~sever / reinstate / retire have no rung~~ BUILT — measured 2026-09-14 by UI-58 | UI | M8 · landed |
| ~~the UI hand-composes query syntax where `op=searchfields` exists~~ CLOSED — measured 2026-09-14 by UI-58 (the drift is gone; the doorbell is not, see UI-60) | UI | M8 · landed |

**The case-making pass, 2026-08-01.** Twenty-seven rows arrived from the sixteen-file
research study with no placement, which this table's own preamble forbids. Placed here;
the item that carries each is named in `research/RECONCILED.md` §3 (the design of record)
and handed to CONDUCT through the BOB INBOX.

| item | area | milestone |
| --- | --- | --- |
| D-124 restricted material — DEC-5 scoped itself to PUBLIC records | — | DOCTRINE · deferred with a trigger |
| D-125 a member's personal mute of a FINDING (DEC-10's (b)/(c)) | RECORD | M8 · PLACED 2026-09-22 in `BACKLOG.md` on BOB #26's ruling |
| D-126 ~30 notification generators, no catalogue, no classes | RECORD · UI | M8 · REC-20 |
| **D-127 case-making is undesigned, and it is what the system is for** | RECORD · UI | **M9 · M10** — the rungs this pass adds |
| D-128 declared-versus-observed flow is the analytic product | FRAMEWORK · RECORD | M4 · consequence half M10 (REC-24) · PLACED 2026-09-22 in `BACKLOG.md` on BOB #27's ruling (the declared flow append-only) |
| D-129 `undetermined` conflates *cannot determine* and *positively none* | RECORD | M8 · a field beside the reason |
| D-130 `counterparty: to be named` passes C-2.10 | RECORD · UI | M7 · REC-23 CLOSED (rendering half UI-19; ADD_TYPES absence UI-15 — corrected 2026-08-04, the row had said UI-15 for the rendering while QUEUE/BUILD-ORDER say UI-19) |
| D-131 a raw NUL byte makes `store.mjs` invisible to `grep` | RECORD | M0 · REC-27 |
| D-134 the administrator WRITE surface: §4.9's four custodial acts have no UI call site | UI | M8 · PLACED 2026-09-22 in `BACKLOG.md` (LED-7), after D-126, resting on REC-159 |
| D-135 the viewer gate is stamped on compiled query paths only | RECORD | M7 · REC-25 |
| D-136 three governance ops absent from `SESSION_OPS` | UI · RECORD | M8 · UI-16 |
| D-137 the D-113 check is blind to eight hand-created tables | RECORD | M0 · REC-27 |
| D-138 the drift guard never reads the catalogue it claims to check | UI | M9 · UI-10 |
| D-141 the UI rebuilds the project-visibility leak client-side | RECORD · UI | M7 · M8 (REC-25, then UI-16/UI-21 delete the client walk) |
| D-142 search degrades to a substring scan and looks identical | UI | M8 · UI-21 |
| D-143 a published case cannot be READ — no data path | RECORD · UI | M10 · REC-22, UI-18 |
| D-144 re-ratifying destroys the previous attestation | RECORD | M10 · settled by DEC-12 |
| D-145 bundle ids are per-instance, so nothing survives leaving | RECORD | M6 |
| D-146 nine intent-layer write ops have no caller | UI | M8 · UI-13 |
| D-147 `action` models a records request as one round trip | RECORD | M10 · REC-24 must read it before shipping the state machine · PLACED 2026-09-22 in `BACKLOG.md` on BOB #27's design |
| D-148 a fee quote is EVIDENCE, not an administrative obstacle | RECORD | M10 · with D-147 · PLACED 2026-09-22 in `BACKLOG.md` on Bob's ruling (BOB #26) |
| D-149 the design is jurisdiction-blind | RECORD · FRAMEWORK | M10 · needs a design pass, not an item · PLACED 2026-09-22 in `BACKLOG.md` on Bob's ruling (BOB #26) |
| D-150 the completeness claim, externally validated | RECORD · UI | M10 · REC-14 · PLACED 2026-09-22 in `BACKLOG.md` on BOB #27's ruling |
| D-151 a machine credential can resolve an unassigned task (DEC-7) | RECORD | M8 · REC-28 |
| D-155 a project declares the strength its work requires (DEC-17) | RECORD · UI | M10 · REC-14, REC-15, UI-18 |

**The backfill, 2026-08-07 (session BOB).** The tables above stopped at D-156 while
`DEBT.md` had reached D-224 — roughly fifty rows had accumulated outside them, against
this table's own preamble rule. Every OPEN row D-157..D-224 is placed below by the
disposition token its own row carries in `DEBT.md`; closed, resolved and superseded rows
(D-157, D-173, D-186, D-188, D-197, D-198, D-201, D-206, D-212, D-215) are placed
nowhere, and D-185 was already in the first table. The DEC-60-family rows carry M9 per
the M9 placement note above (tokens corrected 2026-08-07, finding F8, both surfaces
together with `DEBT.md`).

| item | area | milestone |
| --- | --- | --- |
| D-158 a never-enrolled member's key reads `active` on signerlist | RECORD | M10 · REC-15/UI-17 pre-flight |
| D-159 an ungraded leg costs a conclusion nothing | RECORD | M10 · WATCH — re-raise after a real group runs · ARCHIVED 2026-09-22 by door 3, the trigger watched above |
| D-162 connections run through NAMED things; ideas cannot connect | FRAMEWORK | M4 · DOCTRINE (Bob) — a DEC at the entity axis |
| D-165 what each action kind requires is unmodelled | RECORD | M10 · deferred with a trigger · ARCHIVED 2026-09-22 by door 3, the trigger watched above |
| D-166 the CPDF-5 corpus URLs went stale | CONTENT-PDF | M1 · re-locate the corpus |
| D-167 Tier-1 text trips the `client_rendered` stack test | FRAMEWORK | M3 · next stack-axis item · ARCHIVED 2026-09-22 by door 3, stated in DOCUMENT-PROFILES.md |
| D-168 `op=cite` is type-only, so RETIRED is citable | RECORD | M9 · bounds REC-11/UI-20 |
| D-169 `#setScalar` cannot ADD a frontmatter key | RECORD | M7 · batch with the honesty defects · PLACED 2026-09-22 in `BACKLOG.md` |
| D-170 an ungrouped condition cannot be muted | RECORD | M8 · WATCH |
| D-171 `#revisionKind` tiebreaks on a backdatable time | RECORD | M7 · beside D-169 · PLACED 2026-09-22 in `BACKLOG.md` |
| D-172 the DO alarm can re-enter a tick still in flight | RECORD | M1 · decide at the next scheduler consumer · CLOSED IN FACT 2026-09-22 (the serial flag, `#tickRunning`) |
| D-174 plane vocabulary on the sign-in gate | RECORD · UI | M8 · open until DEC-49 is answered |
| D-175 the battery varies by 2 assertions run-to-run | CONDUCT | M0 · next M0-lane pass |
| D-176 UI-14's all-clear rests on interpreted feed-emptiness | UI | M8 · WATCH |
| D-177 the capture axis below the ceiling is still authored | CAPTURE | M9 · CAPTURE's next activation |
| D-178 `op=audit` never injects publishedRegistry | RECORD | M10 · small, pair with the next M10 item · PLACED 2026-09-22 in `BACKLOG.md` |
| D-179 `register.capture_sha` is global — a re-register MOVES the row | RECORD | M7 · beside D-169/D-171 · PLACED 2026-09-22 in `BACKLOG.md` on BOB #26's ruling |
| D-181 C-2.8 refuses an ACTION as a basis leg | RECORD | M10 · raise to Bob only if a real case needs it |
| D-182 `risk_tier` is D-130's unreached residue | RECORD · UI | M10 · pair with the next action-surface item |
| D-183 nothing binds a transcription to the measurement that graded it | CONTENT-PDF | M2 · CPDF-12, behind CPDF-11 |
| D-184 a firsthand observation has no home as a leg | RECORD | M9 · pair with DEC-39's wording + REC-11 |
| D-187 a published case was built as exactly ONE inquiry | RECORD | M10 · DEC-44's enactment |
| D-189 no surface says a project carries its own bias | UI · RECORD | M4 · with D-84's bias bundle |
| D-190 the DO's 10 GB ceiling is recorded nowhere | RECORD | M6 · measure the storage curve first |
| D-191 a composite capture's temporal spread is unstated | CAPTURE | M2 · state the spread |
| D-192 stored-byte integrity is not what a reader SEES (replay) | CAPTURE | M2 · measure what the viewer executes |
| D-193 the installer embeds a pre-REC-41 `setup.mjs` | DIST | M7 · closes at the next release cut |
| D-194 a LEAD and an empty search have no record | FRAMEWORK · RECORD | M4 · the authored frontier, pair with D-184 |
| D-195 OR's MAX assumes an independence nothing checks | RECORD | M9 · pair with REC-12's strength derivation |
| D-196 the completeness statement is prose with nothing behind it | RECORD | M10 · gains a search record from the observation log |
| D-199 the `ai` credential class and its task scope (DEC-60) | RECORD | M9 · per the M9 placement note |
| D-200 live audit not clean: ten C-18.9 rows, application pending a deploy | RECORD · DIST | M2 · mechanism built (REC-54) |
| D-202 declared vs deployed configuration diverged | DIST · RECORD | M1 · derive bindings, arm SELF |
| D-203 five checks advise a repair the state machine refuses | RECORD | M2 · four repair strings |
| D-204 nothing moves a document off `verified` except `retired` | RECORD | M2 · DOCTRINE (Bob), raised by REC-54 |
| D-205 the admin token was printed by a stack trace | RECORD | M7 · rotation is Bob's; the guard is unassigned |
| D-207 pre-REC-55 cite-over-drift Session Log silence | RECORD | M8 · behind D-200's deploy; sweep first |
| D-208 one question composed in two layers that cannot read each other | UI | M8 · DEFERRED on its trigger |
| D-209 the repair walk judges move directives only | RECORD | M2 · provisional; one static guard closes it |
| D-210 `op=release` is not repeatable | RECORD · DIST | M2 · DOCTRINE (Bob), rides DEC-56 |
| D-211 a clean FIRST PAGE satisfies the audit gate's wording | DIST | M0 · one clause, latent past 200 documents |
| D-213 discovered evidence becomes an actionable notification (DEC-60) | RECORD | M9 · closes when the slug lands |
| D-214 `rejected` is both an act and a state (DEC-60) | RECORD | M9 · closes with IS-1 |
| D-216 one stance or per-project, for a shared inquiry (DEC-60) | RECORD | M9 · BLOCKS IS-3 |
| D-217 derivation tree, prune offer (hide, never delete), version-or-new-claim (DEC-60) | RECORD | M9 · lands with IS-1 |
| D-218 can a Worker hold a whole run under the CPU ceiling (DEC-60) | RECORD | M9 · measurement; shapes IS-9 |
| D-219 "with no captured basis" reads as "no basis" | RECORD | M8 · rides the next resolution-path touch |
| D-220 version chains are recorded and nothing exposes them | RECORD | M3 · generalise the join, wire `capturedLocators` |
| D-221 the "changed from" sentence names the wrong predecessor | UI | M3 · closed by D-220's consumer (1) |
| D-222 the meaning layer has no query surface | RECORD | M3 · PRECONDITION on the whole IS set |
| D-223 hunch debt cannot be enumerated | RECORD | M3 · rides D-222, named in its acceptance |
| D-224 `connections` grows quadratically per entity | RECORD | M3 · measure first |

### Deliberately not scheduled, and why

These are knowledge, not backlog. They stay in `DEBT.md` with that disposition and no
milestone claims them:

- **D-1** root of trust · **D-53** reputation and credence — doctrine, and neither blocks anything
  scheduled. **D-89 and D-90 left on 2026-09-21** (LED-7 batch S10-1): their doctrine is written in
  `BIO_Content_Framework_v0_10.md` §13.1 and invariant 8, so they closed in fact. **D-77 left the same day by
  the third door** (BOB #25): its guard is invariant 7 as the acceptance of the intent layer's first row,
  deferred with that layer in the Framework's front matter.
  D-53's "blocks S-11 step 5" is stale: bulk release shipped in 0.34.0.
- **D-55** is NOT in this list any more. Its doctrine was already ruled; only its
  shape was open, and the shape decided provisionally under M2 above was settled on
  2026-09-21, when D-55 closed by design (`CLIENT-RENDERED.md`).
- **D-45** unbacked register entry at promote, **D-38** the citation ceiling — settled
  by decision, default is to leave them.
- **D-56** CPU headroom, **D-70** the third axis, **D-100** the retired plane's egress lesson —
  watch items with no task attached, deliberately.
- **D-111** the Wayback rate ceilings — not measurable by us without imposing a cost
  on strangers, which is a standing position rather than an omission.
- **D-94(a)** the allowlist request to the City — Bob's alone to time, and the City's
  stance inverts the argument for making it.
- **D-13**, **D-28** — accepted; the reasoning is in their rows.

---

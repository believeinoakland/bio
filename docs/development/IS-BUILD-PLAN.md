# IS BUILD PLAN — the investigative AI, parallelized across six tracks

**2026-08-07, session BOB.** The comprehensive build plan for the investigative session
(DEC-60/61/62), decomposing `INVESTIGATIVE-SESSION.md` v3 (§18's IS-1..IS-9 **plus every
obligation the design places outside those nine**) into schedulable items across six
tracks. Authority: the design v3 with §19's comparison, `IS-SWEEP-2026-08-07.md` (SWEEP),
`FINDINGS-WORKPLAN.md` Families E/G, the QUEUE BOB-INBOX handover (2026-08-07, hold
lifted), MILESTONES' M9/M10 placement note, and the closed register (DEC-52 final: the
machine may rule; DEC-55's five determinations on D-199; DEC-61 transcripts; DEC-62 one
session). CONDUCT executes; DIST runs its own lane as a separate session. Every refusal
promised "by name" below is a C-number in `bio-checks.mjs` with a DEC-49 error code and
canned translation, allocated at build — no item ships a fence as prose.

Format per item: id · scope · interface (I1–I7) · depends-on · accepts-when (a runnable
command or checkable fact) · NC (the negative control, run and recorded in the suite's
`NEGATIVE CONTROL:` line). Standing gate on every item: `cd bio-plane && npm run
test:battery` green (all suites reported), `node scripts/coverage.mjs --strict` run
directly with `$?` read unpiped, exit 0, no new unreached op.

Track intent, in one line each. **PLANE** builds the record's half: schema, the fences as
code, the reads the run needs, the notifications. **FLEET** builds the agent's half: the
Worker in the group's own account, the harness, the fan-out — the plane grows no model
runtime. **SKILL** builds the doctrine and judgement layer, constrained to what a skill
may legitimately hold (never a gate). **UI** builds the member's review surfaces — the
accept side of the fence, which is the half the machine cannot reach. **VERIFY** makes
the discipline an instrument rather than a hope. **DIST** puts it in a group's account.

---

## PLANE track (PL) — schema, ops, fences, notifications

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| PL-1 | **Basis versions (IS-1).** Versions attach to the INQUIRY'S BASIS (SWEEP §4b.5): frozen once written, unique name per inquiry, required description, ground partition + AND/OR relationship carried, `derived_from` edge (its first real producer), hide-only prune flag; reword USER-SELECTABLE — new version or new inquiry (§6.3b, D-217b); an edit that regroups the partition rides REC-45's attributed regroup act (DEC-50 — §6.7 licenses no unattributed structural edit). Built through `promote`'s one write site (`store.mjs:7288`) — no second version table (D-21). New tables before the `host_governor` block; added to `purge` (D-113). | I5, I3 | PL-6 | `node scripts/battery.mjs versions` green: write v1, derive v2, assert v1 byte-frozen, names unique per inquiry, partition + relationship present on both; a version SURVIVES the death of the run that proposed it (§14b.7 — identity is not the run's) | edit a frozen version in place → the write refuses by C-number; strip the relationship field → the version is refused (the flat-AND re-ship REC-42 corrected) |
| PL-2 | **The sixth state machine (IS-2).** `suggested/considering/accepted/rejected` + hide + make-current: six member ops (accept · reject · consider · revert · current · hide), each a member act with the four beats, authored reason required on reject/defer/dismiss, proposals aggregate and age (§6.4), machine identity refused on every transition. Publishes itself through `op=affordances` (NEEDS/NON_ACTS row). Requires D-78's `surfaced_by` fix landed real, in the same item. | I3 | PL-1 | `node scripts/battery.mjs versionstate` green: all six transitions through the control plane, rejection without a reason refused `NO_REASON`, affordances row present | **three-layer control (VERIFICATION rule 3a):** break the credential layer, the endpoint layer, and the transition layer EACH with the other two held open — each layer's OWN assertion must fail; the vacuous single-layer control is the one SWEEP corrected |
| PL-3 | **The suggest endpoint (IS-4).** One write path for both modes; §9's five kinds including *this level is empty*; sole possible output a `suggested` version carrying its run. Pre-write checks PLANE-side (SWEEP C11): leg exists AND reachable at address (D-168), pair computes per axis over the partition, differs-in-substance, D-195 independence over OR-branches, no boilerplate, no unwritable state — each a C-number with a DEC-49 code. **F10:** a verbatim resubmit of a refused version is a structural no-op (idempotence key on the refusal). | I3 | PL-1, PL-2, PL-9 | `node scripts/battery.mjs suggest` green: every kind writable, a failing version not proposed, refusal carries code + translation; resubmit-after-refusal returns the same refusal without a second evaluation | remove any ONE of the six pre-write refusals → its suite fails naming that check (owed control 6); neuter the idempotence key → the resubmit arm fails |
| PL-4 | **`capture_requests` (SWEEP §4b.1).** Scratch-class table in `capture_sessions`' family, written by PL-3's endpoint, drained by the daemon — DEC-47's conduct enforced ONCE at the drain (UA with contact URL, `purpose` token, rate; robots.txt disallows do not bar public documents and the member-browser UA is permitted, BOB-3). Attribution states BOTH principals (DEC-27(b)/DEC-55.4): daemon-at-the-session's-request, Claude-account principal AND plane-credential principal, never a token value. Completion notifies via the existing FINDING-class slug (D-61's generator, subscriber extended). | I5, I3 | PL-3 | `node scripts/battery.mjs capturerequests` green: request row → drain → capture lands at `collected` never higher → notify slug fires; the record names both principals | let a control-plane path enqueue directly → the OPS-table fence fails it by name; drop one principal from the attribution → the attribution assertion fails |
| PL-5 | **Run object + observation log (IS-6).** On `capture_sessions`' shape: scratch, ticks, expiry, opaque state, resumable. Log written whether or not the run succeeds, never in `bundle.md`; D-129 vocabulary (`NEVER_LOOKED/LOOKED_ABSENT/LOOKED_INDETERMINATE/PRESENT` + `partial`); D-104's governed/unreachable split; client-rendered shells are `LOOKED_INDETERMINATE`; names the bound that stopped it; builds the `runtime-ceiling-reached` producer (`queuestate.mjs:82`, first producer). Carries the conditions: standard pair, skill version, bias manifest — until PL-12 lands, "no manifest was in force," stated. Discharges D-196's searched-record gap for runs. | I5 | none — the one unblocked start | `node scripts/battery.mjs runobject` green: run created, ticked, resumed across two invocations, log addressable, absence vocabulary asserted per level | **kill a run mid-flight → the log must EXIST and NAME the bound** — the failure path is the only one that matters; write "source unreachable" where the governor held → the D-104 arm fails |
| PL-6 | **REC-59 — ALREADY LANDED** (confirmed 2026-08-07: QUEUE marks REC-59 done, IC-24 SETTLED, I3 at 9.0.0; the pin now reads **ZERO** bare-array capped ops, driven off the roster — `bounds.test.mjs:515`). This row is satisfied before scheduling; W1 slot A begins at PL-7. Every new IS op ships enveloped, and the pin catches any that does not. | I3 | none | REC-59's own `accepts-when` in QUEUE.md passed (landed, merge on main); `bounds.test.mjs` pins ZERO bare-array capped ops | add a bare-array op → the `PIN: ZERO capped ops answer with a bare array` arm fails naming it |
| PL-7 | **D-225 caps.** `concerns`, `resolutions`, `connections` join REC-57's envelope discipline (`limit` = cap actually applied, truncation in each op's own vocabulary) BEFORE any new meaning surface lands beside them. | I3 | PL-6 | `node scripts/battery.mjs bounds` green with the three reads on the roster walk, each publishing its applied cap | count-what-was-SENT restored on any of the three → the DELTA arm fails ("this is all of it" ≠ "the first N") |
| PL-8 | **D-222 option A.** A set-algebra ARM in the query compiler (`leg:hunch`, `resolves:>=B`, `concerns:ENT-x`): every arm keys on `fts_id`, passes `viewerPredicate`, obeys MAX_COMPOUND=4. Discharges D-223 (hunch debt enumerable at inquiry grain). Grade-column index added, or the measurement recorded why not. | I3, I5 | PL-7 | `node scripts/battery.mjs query` green: `leg:hunch` composes with existing operators/sort/paging/facets; D-223's question answerable in one query | route the arm around `GATE_MARK` → `Store#runQuery` throws; a viewer outside the project sees zero rows where a member sees N (hidden ≡ absent) |
| PL-9 | **D-222 option C.** A seventh statement shape on the SAME compiler returning meaning-grain rows (legs, resolutions) for the bundles in scope; one new op, additive to I3 with an IC entry, enveloped, REC-36's stricter withhold-the-row rule on candidate lists. NOT option B — no second query path (D-15). | I3 | PL-8 | `node scripts/battery.mjs meaningread` green: legs returned with role/ground/grade_source; the op's envelope carries limit + truncation; IC recorded | the candidate-list gate weakened to redaction → the withhold-whole-row assertion fails; a `total` larger than gated rows → fails |
| PL-10 | **D-220's op.** The document-version chain read off `captured_locators ⋈ register` — every version at an address, date order, with bundle. The run is consumer (3); fixes D-221's wrong-predecessor ("changed from" names the previous version by address equality, not FTS relevance) at the same join. | I3 | PL-6 | `node scripts/battery.mjs versionchain` green: sixty captures of one address answer as ONE document's chain; the predecessor is the temporally previous version | feed the FTS-relevance predecessor → the address-equality assertion fails; two documents at similar addresses never join one chain |
| PL-11 | **The `ai` credential class (IS-5).** D-199's five determinations whole: (1) one class + declared task scope in `scopeFor`'s shape; (2) scope declared IN THE RECORD, never a settings row; (3) minting is a member act; (4) the act names token identity AND principal; (5) `token:ai` caught by every `MACHINE_CANNOT_*` via REC-46's one predicate. Investigative scope: reads across the project under a STATED viewer (member-scoped default), writes ONLY PL-3's endpoint and PL-4's table — THIS task scope, not the class (D-199.1): DEC-52-final's post-processing connection writes ride their OWN member-minted task scope, unbuilt here and scoped when that half is scheduled, so this item's fence does not contradict the ruling. | I3 | PL-3, PL-4 | `node scripts/battery.mjs aicredential` green: mint by member, scope read from the record, an `ai` call to any accept/current/publish op refused by name | **DEC-55.5 WHOLE (owed control 1):** mint an `ai` credential, assert every `MACHINE_CANNOT_*` fires BY NAME, **and that removing the predicate makes them all pass** — the second half was never run |
| PL-12 | **D-84 — the bias object.** `object_type: bias`, its states, heading set, statement-anatomy checks, and DEC-54's four scopes (split bars from bias, unenforceable residue as published output, inhale-proposes-never-installs, the malformedness refusal). Unblocks the run's manifest-carrying read (§3) and the accept ceremony's lens diff. | I5, I3 | none | `node scripts/battery.mjs bias` green: a bias bundle writable and conformant; a run now carries the manifest in force rather than the stated absence | a manifest reaching a SEARCH sub-session's spawn payload → the no-field-by-construction assertion fails (the fence, not the skill) |
| PL-13 | **CURRENT as a project property (IS-3).** D-216's model check FIRST (sharing is the `refs` edge, else this item is wrong and cloning is the honest answer — checkable fact, recorded). Then: a project-authored, DATED frontmatter field beside `required_strength`, never a settings row; the two FINDING-class notification slugs (stance-changed-here-not-elsewhere; new-version-arrived-from-another-team) minted in `queuestate.mjs`'s vocabulary, refused at the mint if unknown. | I3, I5 | PL-1, D-216 | `node scripts/battery.mjs current` green: two projects share one inquiry and stand on different versions; moving one fires the slug and moves nothing else; the pointer is dated frontmatter | write CURRENT via a settings row → refused; suppress the notification as a personally-mutable CONDITION → the FINDING-class assertion fails |
| PL-14 | **The strength PAIR (IS-7).** Per axis over the current version's accepted legs; DEC-32's MIN over AND, MAX over OR, MIN within a branch; state-set argument defaulting to accepted; the return carries the state set that produced it; ungraded legs inert AND named; hunches excluded; grades arrive from `earnedBasisRegistry`, never minted; what-if values in-band per DEC-40; D-159 re-read against a machine shaping legs at volume, outcome STATED either way (QUEUE IS-7's instruction). | I3 | PL-1 | `node scripts/battery.mjs strengthpair` green: pair never composed to one number, arithmetic asserted over a mixed AND/OR fixture, ungraded leg named in the answer; M9's acceptance fixture verbatim — a single-ground basis with one ungraded leg reads `undetermined` on that axis AND names the leg that is why | **DEC-40's (owed control 3):** produce a what-if rendering, strip its filter/state-set line → the harness fails; compose the two axes into one value anywhere → DEC-44's refusal fires |
| PL-15 | **The out-of-inquiry lead (D-213).** The FINDING-class slug with a producer: discovered evidence for inquiry B is CAPTURED (store entry, no basis entry) and surfaced as an actionable notification with a real `basis` and `options[]`; its `case` set derives from inquiry B's ancestors. | I3 | PL-4, PL-9 | `node scripts/battery.mjs leadslug` green: a fixture-driven run against inquiry A (the real harness arrives with FL-3) surfaces a B-lead as the slug; the capture landed at `collected`; the store refuses an unknown kind at the mint | mint the lead under an `N-<n>` id or an uncatalogued slug → refused at the mint (D-213's corrected close condition) |
| PL-16 | **The published case (IS-8, M10).** The container carries, per included finding, the publishing project's current version: legs + ground partition + description + version NAME in DEC-34's per-page header; DEC-54's policy pin at the case; editions over the container (DEC-12); NO case-level strength; NO disclosure of hidden alternatives (BOB-2 ruled). | I3 | PL-1, PL-13, D-187's reshape, DEC-59's elements, the DEC-33-blocked ceremony | `node scripts/battery.mjs publishedcase` green: a two-finding case publishes with per-finding version names in the header and the policy pin present; hash-checkable with no credential | **DEC-44's (owed control 2):** two findings with differing pairs — any surface presenting one case-level strength fails; **DEC-34's (4):** a page without the header incl. version name fails; **DEC-46(a)'s (5):** a carried-forward bias acknowledgement refused |

## FLEET track (FL) — the agent Worker in the group's account

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| FL-1 | **D-218 probe FIRST.** Deploy the CPU probe; measure whether an agent invocation waiting on API responses sits inside the paid ceiling; result into `MEASUREMENTS.md` with date + instrument. D-190 rides the same measurement (QUEUE IS-9): record the DO storage ceiling posture in the same row, since three IS mechanisms grow the same object. The resumable shape is built either way (§14a) — the probe SIZES the work, it does not gate the start. | none | none | a MEASUREMENTS.md row dated with the instrument named, `cpu_ms` echoed from the deployed probe, not from vendor docs | the probe timing itself in-Worker only → refused as the fabrication `cpu.mjs` records; the number must come from the platform's observed billing surface |
| FL-2 | **The agent Worker.** `agent-worker/` on `pdf-worker`'s pattern: `wrangler.jsonc` with pinned `account_id`, its own fleet-member manifest (`fleet-member.json`: name, version, declared SURFACE table of its endpoints), called only by the plane / calling only the plane's op surface under PL-11's credential. Holds no store binding, writes nothing directly, no member-facing surface. New interface entry registered on I6's precedent BEFORE build (PARALLELISM's rule), PROVISIONAL → STABLE when re-read from code. | I6-pattern (new entry) | FL-1, PL-11 | the interface entry exists before the first commit of code; `node scripts/coverage.mjs --strict` enumerates the member's SURFACE table (VF-3) in the same turn it ships | give the worker a direct store write or a second credential → the source-scan + behavioural (bytes unchanged) assertions fail, as I6's do for pdf-worker |
| FL-3 | **The run harness (IS-9).** Deterministic control flow table (code, never skill): pass count and loop termination, four-level fan-out, dedup-before-write, log-always, **denied-means-adjust as a table row (F10)** — a plane refusal routes to an adjust step, never a verbatim retry (the budget is the backstop, not the mechanism). Query-never-load (the meaning-grain read is PL-9's op — this item consumes it); versions written as formed, never batched; budget (fetches, sub-sessions, wall time across resumptions) enforced and recorded via PL-5's producer. CHECK is the first deployed mode (§2), and the investigate-mode gate is a ROW IN THIS TABLE — code, never skill; SK-4 records the sequencing it enforces. | I3 | PL-3, PL-5, PL-9, FL-2 | `node scripts/battery.mjs harness` green: a resumed run reads its own log and continues; a budget exhaustion writes `runtime-ceiling-reached`; a refusal is followed by an adjusted submission in the trace | **the objective's own (owed control 7):** feed a run an inquiry the evidence does not support → it proposes NOTHING and emits §9's empty-level kind — an empty run and a silent failure distinguishable; exhaust a budget with the producer neutered → the recorded-never-silent arm fails |
| FL-4 | **Scheduler consumer.** ONE appended entry to `#schedConsumers` (`{name, due, wake, tick}`, `store.mjs:1452`) waking suspended runs on daemon completion and on resumption ticks. **No second alarm and no cron** — `SCHEDULER.md`'s recorded decision. | I5 | PL-5 | `node scripts/battery.mjs scheduler` green: the eighth consumer registered; a run suspended on a capture request wakes when the drain completes; idle instance carries no timer | add the run's own alarm or cron → the one-alarm assertion in the scheduler suite fails; starve a slow consumer → the reconcile-keeps-every-wake arm fails |
| FL-5 | **Sub-session fan-out with REPORT contracts (§14b.1).** Spawn contract: the four levels, no write scope, **no bias-manifest field by construction**; return contract: a REPORT with a citation — never documents; the parent re-reads by address. Sub-sessions share no state; the parent holds the only write and the only manifest. | I3 | FL-3 | `node scripts/battery.mjs fanout` green: a sub-session's return validated against the REPORT shape; the spawn payload has no manifest field to read | **IS-9(a)'s:** neuter the return-contract check → a document-returning sub-session must fail an assertion — a sub-session that returns documents has defeated the architecture |
| FL-6 | **The Claude-account cascade at runtime.** Resolve member → project → instance; the run records WHICH level paid beside the plane-credential principal (two principals, both named, PL-4's rule); when no token resolves the capability is UNAVAILABLE and says so — never a silent no-op. DEC-43 read before any fallback-instance deployment (§14a). | none | FL-2, DS-3 | `node scripts/battery.mjs cascade` green: three fixtures resolve to the right level and the run object names it; the no-token fixture answers a stated absence | remove every token → assert the response is the named UNAVAILABLE, not an empty success (an honest absence, stated — the silent no-op is indistinguishable from a run that found nothing) |

## SKILL track (SK) — the doctrine pack and the investigative skill

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| SK-1 | **The doctrine pack, VERSIONED (§14a).** The always-resident layer (objective §2, the machine/member boundary, the four-level rule, absence vocabulary) + progressively-disclosed recipes/vocabularies (§14b.1); versioned with releases; **every run records the skill version it ran under** (the Cerebras/Schulte disclosure standard, SWEEP §3 — a requirement, not an analogy). Vocabulary rendered from the plane's PUBLISHED words (ASSISTANT-PILOT's layering), inventing none. | none | PL-5 (the recording field) | checkable fact: the pack carries a version string; PL-5's run object records it; a run under pack vN and a rerun under vN+1 are distinguishable in their run objects | strip the version from a run's conditions → the run-object suite fails naming the missing condition |
| SK-2 | **The investigative skill.** Composition judgement under §5 (shape legs so EARNED grades produce a supported calculation — grades composed, never minted; a hunch is unreachable to it, DEC-15); description to a commit message's standard naming every ungraded leg; search-completeness discipline — the model NEVER decides when the loop stops (TREC 2011, +95/−87), it decides what to search; four-level search with which-absence stated per level; bias minimisation on top of the fence, never instead of it (§14). | none | SK-1 | checkable fact: the skill text contains no control-flow authority (loop bounds, fan-out, gates all cite FL-3's table); a sampled run's descriptions name their ungraded legs | a skill edit that moves loop termination into model judgement → FL-3's deterministic-table review criterion fails the change in review — a gate in a prompt is the defect §14b.4 names |
| SK-3 | **The PRACTICE-SURVEY prohibition set (SWEEP §3).** In the skill verbatim: no generated justification anywhere (a generated one is a fabricated attribution); the ONE permitted auto-composition is assembling the member's OWN prior words; no single confidence score; no connection-density ranking; machine-proposed connections never presented as connections; no boilerplate to clear a gate (the `counterparty: to be named` defect at machine scale — backed by PL-3's check). | none | SK-2 | checkable fact: the five prohibitions present verbatim; PL-3's boilerplate check is the code half of the fifth | submit a version whose description is placeholder text through PL-3 → refused by C-number while the skill-only path would have passed it — proving the fence is code, not instruction |
| SK-4 | **CHECK deploys first (§2, SWEEP §4b.7).** The same session run against an EXISTING conclusion is DEC-24's CHECK role — the record read adversarially, aimed at self-directed overclaiming. First deployment gates on it: smallest authorisation surface, clearest ground truth. The investigate-fresh mode enables only after CHECK's first live run is verified (VF-5). | none | FL-3, VF-5 | checkable fact: the first live run in scratch targets a concluded inquiry; the deployment record shows CHECK enabled before investigate | attempt an investigate-mode launch before CHECK's verification is recorded → the deployment gate refuses; DEC-55's enacted CHECK-first instruction satisfied without a second architecture |

## UI track (UI) — review surfaces (numbering continues from UI-41)

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| UI-38 (scope widened) | **The running-session surface — designed ONCE for all AI features (§14a), absorbed here per SWEEP §5a/E10.** Animated indicator on any window focused on the run's context; click opens the LIVE transcript (device-local, TTL'd, purge-at-publication with the suspendable litigation hold — DEC-61); objects do not change while the run runs. **F11:** launch-time budget and live consumption shown on this surface (which account pays is already on the record). Existing UI-38 registry scope unchanged beneath it. | I3 | PL-5, PL-11 | `node civicos-ui/test/run.mjs` green: indicator bound to run state; transcript never persisted server-side; budget and spend rendered from the run object | persist a transcript to the instance store → the device-local assertion fails; hide the budget while a run spends → the F11 arm fails (bounded-but-invisible is §19's named gap) |
| UI-42 | **Version review: rotation and diff.** Rotate between versions (comparison IS the diff), the derivation tree rendered, the hide-prune offer whose WORDING states what hiding does (DEC-29(b): hidden versions stay in the record, stay queryable); hidden and rejected versions reachable — display shrinks, acts remain (D-214). No "ground partition" or AND/OR vocabulary on any surface (DEC-32's ban; D-226). | I3 | PL-1, PL-2 | `node civicos-ui/test/run.mjs` green: two versions rotated and diffed; the prune offer's wording asserted verbatim; a hidden version reachable via its query | grep the surface strings for "ground"/"AND/OR" as member-facing words → the ban assertion fails on a hit; make hide delete → the acts-persist query fails |
| UI-43 | **The accept ceremony.** The four beats on every transition; the derived falsifier back in plain words ("your answer fails only if ALL of these fail"); **per-branch independent-sufficiency AFFIRMED by the member before their name lands over machine-composed OR** (DEC-32's keystone, mechanism (b)); D-195's derived shared-origin surfaced (derived informs, authored binds); DEC-46's lens diff IN the ceremony, never a toast; REC-36's stricter withholding when an org-scoped run composed beyond the accepter's gate. | I3 | PL-2, PL-14, UI-42 | `node civicos-ui/test/run.mjs` green: an OR-carrying accept requires the per-branch affirmation; the lens diff renders when run-manifest ≠ accepter's; refusals shown as the plane's own canned translations (DEC-49) | remove the affirmation step → accepting an OR version fails the ceremony assertion; demote the lens diff to a notification → the DEC-46(3) arm fails |
| UI-44 | **The connections sidebar (DEC-52 final).** The machine may rule: connections it identifies land machine-attributed (D-82 look-derived, `token:ai` named), and the sidebar is a VISIBILITY and bulk-review surface on the running-session surface — not a required approval gate. Bulk review is the same act over a set. (Fixture-driven until a post-processing task scope produces live machine connections — see PL-11's note.) | I3 | UI-38, PL-11 | `node civicos-ui/test/run.mjs` green: machine-declared connections visibly machine-attributed; bulk review operates over a set; no approval gate blocks the write | strip the derived dress from a machine connection → the D-82 assertion fails; re-introduce approval as a write gate → the DEC-52-final assertion fails (the superseded provisional) |
| UI-45 | **Notifications rendered.** The FINDING-class slugs surfaced: stance-changed, new-version-arrived, capture-complete, the out-of-inquiry lead with its `options[]`; suggestion kinds LOOK derived, aggregate, and age rather than vanish (§6.4). | I3 | PL-13, PL-15 | `node civicos-ui/test/run.mjs` green: each slug rendered from the plane's published wording; an aged proposal leaves the open list and stays queryable | render a slug with surface-authored wording → the published-words assertion fails (DEC-8's drift class); a dismissed proposal vanishing from the record → fails |

## VERIFY track (VF) — instruments, controls, live verification

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| VF-1 | **The seven owed negative controls, placed and RUN** (design §18): (1) DEC-55.5's second half → PL-11; (2) DEC-44's two-finding case → PL-16; (3) DEC-40's strip-the-filter-line → PL-14; (4) DEC-34's page-without-header → PL-16; (5) DEC-46(a)'s carried-forward acknowledgement → PL-16; (6) one-refusal-at-a-time → PL-3; (7) the empty-run control → FL-3. Each recorded in its suite's `NEGATIVE CONTROL:` line with what broke. | none | the owning items | `cd bio-plane && node scripts/coverage.mjs --strict`, `$?` read UNPIPED, shows every IS suite declaring — plane AND fleet; the register stays N/N and its floor holds. **CORRECTED 2026-08-09 by VF-1 and the correction is the item's own subject.** This cell used to read `node bio-plane/scripts/control-register.mjs`, which is a MODULE with no entry point: it runs, prints nothing, and exits 0 over any tree whatsoever — an acceptance that could never fail, which is the shape of every defect this row exists to catch. The register is printed by `coverage.mjs`. The baseline said `105/105`; measured 2026-08-09 the plane read **134/134 · 621 arms** and the fleet's four suites were not in the register at all. **AND THE ROW'S OWN CLAIM WAS FALSE:** the fleet's controls were counted per MEMBER, so `agent-worker/test/harness.test.mjs` — FL-3/IS-9, owed control 7's owner — could stop declaring with `--strict` at exit 0 and every figure unmoved. Measured, then closed; `bio-plane/test/owed-controls.test.mjs` is the suite that would catch it again | this track IS the controls; its own control: neuter one declared control's subject and confirm the named suite fails — a suite that does not fail when its subject breaks is testing something else |
| VF-2 | **DEC-49's harness guard (E7).** Every member-facing condition the IS work mints ships a code + canned translation; an untranslated code FAILS the harness — not optional; the guard is an instrument, so it lands before the ops that must pass it. | none | none (M0 lane) | `node civicos-ui/test/run.mjs` green with the guard on; introduce a codeless refusal in a fixture → the harness fails naming it | remove the guard → the codeless fixture passes → re-add and record: the guard's absence is the defect |
| VF-3 | **Coverage gates the fleet (D-117, resolved — kept true).** `coverage.mjs --strict` enumerates the agent worker's SURFACE table the same turn FL-2 ships; every new IS op carries a control-plane assertion in the same turn (D-43's class). | none | lands WITH FL-2 | `node scripts/coverage.mjs --strict` exit 0, read unpiped, with the agent worker's surface counted — the percentage must MOVE when FL-2 lands, not hold still while a component goes dark | hide the fleet manifest from the walk → strict must fail, not report the old figure (wrong-in-the-generous-direction is the named failure mode) |
| VF-4 | **Live verification in scratch.** A full CHECK-mode run against a concluded inquiry in the instance's OWN scratch namespace (`store=` scratch; probe confinement already refuses elsewhere), never the real record; swept after; `op=audit` clean; the rollout gate waited out before probing (a deploy verified is not a build serving — establish which build answered before believing a contradiction). | I3 | SK-4, DS-4 | live: the run completes, its suggestions land in scratch, the sweep removes them, `op=audit` answers clean through the control plane | point the live run at the real namespace → the scratch confinement refuses; the sweep skipped → audit fails on residue |
| VF-5 | **The end-to-end fence proof.** Before CHECK deploys: one scripted pass exercising the whole fence — an `ai` credential attempts accept, make-current, hide, publish, direct capture, direct enqueue; every refusal fires by C-number with its translation; then PL-2's three-layer control re-run on the integrated build by CONDUCT itself (destructive controls re-run at integration, VERIFICATION rule 5). | I3 | PL-2, PL-3, PL-11 | `node scripts/battery.mjs fence` green: the six attempts, six named refusals; CONDUCT's own re-run recorded in the integration note | run the pass with the identity predicate removed → all six must PASS (proving the assertions watch the fence, not the fixtures) — then restore byte-identically |

## DIST track (DS) — its own session and lane; only DIST cuts releases

| id | scope | interface | depends-on | accepts-when | NC |
| --- | --- | --- | --- | --- | --- |
| DS-1 | **D-115 — the installer installs the FLEET.** `newgroup` installs plane + pdf-worker + agent worker with their service bindings; an instance that cannot get the fleet says so rather than silently doing less (D-106's class). `bindings: []` stays structural on the installer itself. | I4, I6 | FL-2 | a fresh install into a clean account serves the plane AND both fleet members, verified by reading the bytes back from the account, not from the upload | install with the fleet artifact withheld → the installer refuses to report success honestly (names what is missing), never a quiet plane-only install |
| DS-2 | **D-116 — version authority spans the fleet.** `bio-plane/package.json` stays the single declared authority; `resolveVersion` refuses on ANY disagreement across plane and every fleet member, both directions, before esbuild. | I4 | DS-1 | `node scripts/deploy.mjs` (DIST's) refuses a version skew between plane and agent worker naming both files and the exact edit | bump one fleet member's version alone → the build refuses; a wrangler config ahead of package.json reads as drift, not as newer |
| DS-3 | **The account cascade config.** Storage for the instance-level Claude token in the BIO configuration (`.env`/secret path, `tokens.mjs` denylist applies), and the project/member token surfaces; minting/setting is a MEMBER act (D-199.3); no token value ever in the record or a transcript — confirmed by USING it, never by printing it. | I4, I3 | DS-1 | a configured instance token resolves at FL-6's third level and `whoami`-class use proves it; an unset cascade answers the stated UNAVAILABLE | commit a token value → `tokens.mjs` treats it as NOT SET (revocation by publication); an agent-initiated scope widening → refused, minting is a member act |
| DS-4 | **The gated deploy.** Agent worker + plane binding ship as a DIST release from green main: sign, deploy, wait for the version to SERVE (rollout is per-isolate, not atomic), then hand to VF-4. DEC-43 re-read before any fallback-instance deployment (root-credential + AI-directed egress is the constrained configuration). | I4 | DS-1, DS-2, FL-2 | `deploy.mjs` verifies bytes AND waits for `/version` to answer the new build; the DEC-43 read recorded in the release note for any fallback target | probe immediately after byte-verification and treat a stale answer as the new build's defect → the rollout-gate assertion fails the procedure; the gate exists because 0.52.0/0.51.0 already happened |

---

## THE TOTALITY MAP — every obligation, and where it lands

This section exists so that "the plan covers the totality" is a checkable fact rather
than a claim. Left column: the design's own units and every named finding, debt row and
ruling the sweep, the workplan and §19 put on this build. Right column: the item(s) that
carry it. An obligation with no item would be this plan's own defect class.

| obligation | carried by |
| --- | --- |
| IS-1 versions of the inquiry's basis | PL-1 |
| IS-2 the sixth state machine, four beats, affordances | PL-2 |
| IS-3 CURRENT as a project property + shared-inquiry notifications | PL-13, UI-45 |
| IS-4 the suggest endpoint, five kinds, pre-write checks plane-side | PL-3 |
| IS-5 the `ai` credential's investigative scope (D-199 ×5) | PL-11 |
| IS-6 the run object and observation log | PL-5 |
| IS-7 the strength pair, state-set argument, what-if in-band | PL-14 |
| IS-8 the published case (M10), version name in the header, policy pin | PL-16 |
| IS-9 the run harness: fan-out, resumption, budget, CHECK first | FL-3, FL-4, FL-5, SK-4 |
| D-222 the meaning-layer read surface, option A then C | PL-8, PL-9 |
| D-225 caps on the three uncapped meaning reads, first | PL-7 |
| REC-59 before any new op (the bare-array pin) | PL-6 |
| D-220's version-chain op (+ D-221's wrong-predecessor fix) | PL-10 |
| D-218 the fleet CPU probe, measured before sizing | FL-1 |
| D-216 the sharing-model check before CURRENT builds | PL-13 (precondition, W0) |
| D-84 the bias object; until then "no manifest in force," stated | PL-12; PL-5 carries the stated absence |
| D-164 unlanded: document-grain legs, said honestly | PL-1's leg shape + CONFORMANCE; no item pretends otherwise |
| D-213 the out-of-inquiry lead slug with a producer | PL-15 |
| D-214 rejection acts persist; prune hides, never deletes | PL-1 (hide flag), PL-2, UI-42 |
| D-217 derivation tree + prune offer + aggregation/ageing | PL-1, PL-2, UI-42, UI-45 |
| D-226 vocabulary held (VERSION/REPORT/LEG/GROUND) | every item; UI-42's surface-word NC enforces the ban |
| D-195 OR-branch independence: derived check + authored affirmation | PL-3 (check), UI-43 (ceremony) |
| D-78/D-82 `surfaced_by` real; machine work LOOKS derived | PL-2 (same item), UI-44, UI-45 |
| D-104 / D-129 absence vocabulary, governed vs unreachable | PL-5 |
| D-115 / D-116 / D-117 installer installs the fleet; version authority; coverage counts it | DS-1, DS-2, VF-3 |
| D-196 what-was-searched, computable for runs | PL-5 (the log), §15's instruments over it |
| D-223 hunch debt enumerable | PL-8 (discharged by the arm) |
| D-224 connections' k(k−1)/2 growth measured before anything trusts the capped read at scale (Family E's E6) | W1's slot-free lane — measurement only, no item; a decision row only if the numbers say so |
| DEC-47 conduct at the drain; BOB-3 robots ruling | PL-4 |
| DEC-49 codes + canned translations, harness-guarded | VF-2, and every fence item |
| DEC-52 final: the machine may rule; sidebar as review | UI-44 |
| DEC-55.5 the whole negative control, both halves | PL-11 + VF-1(1) |
| DEC-61 transcripts device-local, TTL, purge-at-publication, litigation hold | UI-38 |
| DEC-62 one session: search and composition interleave in one loop | FL-3 (one harness), PL-3 (one write path) |
| The seven owed negative controls | VF-1, placed on PL-3/PL-11/PL-14/PL-16/FL-3 |
| F9 (stale `[BOB-4]` text vs DEC-52 final) | design-doc correction rides W0's lanes (FINDINGS-WORKPLAN Wave-3 residue) |
| F10 denied-means-adjust; verbatim resubmit a no-op | FL-3 (table row), PL-3 (idempotence) |
| F11 budget visible at launch and live | UI-38 |
| The account cascade (member → project → instance), both principals named | FL-6, DS-3, PL-4 |
| The bias fence: search half never receives the manifest | FL-5 (no field by construction), PL-12's NC |
| The PRACTICE-SURVEY prohibition set | SK-3, with PL-3 holding the code half |
| Search completeness: the model never decides when the loop stops | FL-3 (deterministic table), SK-2 |
| Empty-run instrument with an object to count | PL-3 (the kind), FL-3's NC (owed control 7) |
| §15's instruments (empty runs, accept ratio, rejection pattern, stop reasons) | computable from PL-5 + PL-2's persisted acts; no extra item needed |

## WAVES — two CONDUCT slots + slot-free measurement/test lanes (M0-style); DIST its own lane

Preconditions honored throughout: REC-59 before any new op; D-225 before D-222's surface;
D-218 probed before the fleet shape is sized; D-216 checked before PL-13; D-84 gates only
the bias half (honest absence stated until it lands); D-164 unlanded means versions
compose document-grain legs and say so (declared, not discovered).

| wave | slot A | slot B | slot-free lanes |
| --- | --- | --- | --- |
| W0 | — | — | FL-1 (D-218 probe → MEASUREMENTS) · D-216 model check · VF-2 (DEC-49 guard) · SK-1 authoring · DIST: DEC-43 re-read |
| W1 | PL-7 (caps — PL-6/REC-59 already landed) | PL-5 (IS-6 — the one unblocked start) | SK-2/SK-3 authoring · VF-1 ledger opened · D-224 measured (Family E's E6 — cheap, measurement only, before anyone trusts the capped `connections` read at scale) |
| W2 | PL-8 (D-222 A; discharges D-223) | PL-1 (IS-1 versions) | PL-12 (D-84) queued to the first free slot; DIST: DS-3 config design |
| W3 | PL-9 (D-222 C) | PL-2 (IS-2 state machine) + PL-13 (IS-3, after W0's D-216 check) | UI-38 design (surface spec, no code yet) |
| W4 | PL-3 (IS-4 suggest + pre-write checks + F10) | PL-10 (D-220 op) then PL-12 (D-84) | SK skill text frozen against PL-3's check list |
| W5 | PL-4 (capture_requests + drain) then PL-11 (IS-5 `ai` class) — this order, PL-11 depends on PL-4 | PL-14 (IS-7 pair) then PL-15 (D-213 slug) | VF-5 script written; DIST: DS-1/DS-2 build, DS-3 build |
| W6 | FL-2 (agent worker + interface entry) + VF-3 (same turn) | UI-38 (running session + F11 budget) | DIST: DS-4 staged |
| W7 | FL-3 (IS-9 harness incl. F10 row) + FL-4 (consumer) + FL-5 (fan-out) | UI-42 then UI-43 (review + ceremony) | VF-1 controls run as owners land · FL-6 (cascade fixtures — DS-3 built in W5, FL-2 in W6) |
| W8 | VF-5 (fence proof, CONDUCT re-runs) then SK-4 (CHECK deploys) | UI-44 + UI-45 | DIST: DS-4 ships → VF-4 live-verify in scratch |
| W9 (M10) | PL-16 (IS-8 published case) | UI case surfaces for PL-16 (DEC-34 header + version name) | VF-1 controls 2/4/5 run on PL-16 |

**Wave rules, so the table cannot be misread as a phase plan:**

- A wave ends when BOTH slots' items land (committed, pushed, battery green, controls
  run) — not on a date. A slot that finishes early pulls the next item on ITS OWN column
  forward rather than idling; the columns are ordered queues, not lockstep pairs.
- Lanes are M0-style: measurements, instruments, doc/skill authoring, and DIST's own
  session. They hold no slot and start the moment their inputs exist. A lane result that
  invalidates a queued item (D-218 saying runs cannot fit; D-216 saying sharing is
  stronger than the edge) reshapes that item BEFORE its wave, which is why both run in W0.
- Slot A carries the critical path end to end; slot B carries the IS-1/IS-2 spine and
  the surfaces. The pairing is deliberate: A's items are the ones nothing else can start
  without, B's are the ones with the most parallel slack. If a wave forces a choice,
  slot A's column wins the slot.
- Worktree discipline per PARALLELISM.md: one session per worktree, claims in CLAIMS.md
  before editing, interface changes through INTERFACE-CHANGES.md (PL-9's IC, FL-2's new
  registry entry). PL-1/PL-2/PL-3 all touch `store.mjs`/`schema.mjs`, which is why they
  are SEQUENCED on slots rather than parallelized into a merge conflict on a 16,300-line
  file that greps as binary without `-a`.
- **Shared-file handoff inside a wave (added by the confirmation pass):** in W1–W5 the
  two slots' items BOTH touch `store.mjs`/`schema.mjs`/`index.mjs` (W1 PL-7∥PL-5, W2
  PL-8's grade index∥PL-1's tables, W3 PL-9∥PL-2 both in the OPS table, W4 PL-3∥PL-10/
  PL-12, W5 PL-4/PL-11∥PL-14/PL-15), and a CLAIMS claim is path-grained — two sessions
  may not hold one file. So within a wave the shared file is an ORDERED HANDOFF, not a
  parallel edit: slot A's item takes the claim first (the existing slot-A-wins rule),
  lands and merges, and slot B's same-file item rebases behind it. The waves' plane
  items are therefore partly serial by construction; the real parallelism is the lanes,
  UI, SKILL, FLEET-scaffolding and DIST. Stated so nobody reads the table as promising
  two concurrent `store.mjs` writers — the one collision CLAIMS cannot survive.

**Critical path:** PL-6 (already landed) → PL-7 → PL-8 → PL-9 → PL-3 → PL-4 → PL-11 →
FL-2 → FL-3 → VF-5 → SK-4 → (DS-4) → VF-4 — the meaning-layer read surface, the suggest
endpoint, the capture door, the credential, the worker, the harness, the fence proof,
first CHECK deployment, live verification. Eleven open items (PL-4 was on the path all
along — PL-11 depends on it — and PL-6 is done, so the count holds); every other item
hangs off it with slack. PL-16 (M10) joins
after VF-4 and additionally waits on D-187's reshape, DEC-59's elements, and the
DEC-33-blocked publication ceremony — the three external dependencies this plan inherits
rather than owns. The IS-1/IS-2 spine runs entirely on slot B and joins the path at
PL-3, so it never extends it. Everything in W0's lanes is off-path by construction.

## CONFORMANCE — the non-negotiable rules and the M9/M10 acceptance

- **The repository is the channel; publish or it never happened.** This plan lands by
  commit+push, verified from the remote; `node tools/plancheck.mjs` runs before the
  handover; every item here maps to a milestone token (M9, M9-substrate, M8, M10 per the
  2026-08-07 placement note) and to a registered interface or `none`.
- **Measure, do not assume.** FL-1 measures D-218 before the fleet is sized; PL-13 checks
  D-216 before building on it; PL-8 indexes or records why not; every number lands in
  MEASUREMENTS.md with date and instrument; no vendor claim is treated as a measurement
  (FL-1's NC enforces the `cpu.mjs` rule).
- **Run the negative control.** Every row above carries one; VF-1 places the seven owed
  by name on their owners; each is RUN and recorded in the suite's `NEGATIVE CONTROL:`
  line; the register stays complete (105/105 baseline) and control-register.mjs tallies it.
- **Correct superseded tests, never exempt.** PL-2's NC replaces the vacuous single-layer
  control the sweep corrected, with the dated reason in the suite; DEC-52-final flips
  UI-44's provisional assertion the same way — corrected, never exempted.
- **Test through the op, and verify live.** Every accepts-when drives the control plane
  (`node scripts/battery.mjs <suite>`), never the DO stub alone (D-43's class); VF-4
  live-verifies in scratch, sweeps, and requires `op=audit` clean; DS-4 waits out the
  rollout gate so a stale isolate cannot masquerade as the new build.
- **An equality that costs nothing is not evidence.** FL-3's empty-run control makes an
  empty-handed run and a silent failure distinguishable; FL-5 refuses document-returning
  sub-sessions; PL-3's differs-in-substance and no-boilerplate checks refuse the free
  agreement; §16's corroboration-by-rerun stays withdrawn.
- **Undetermined is first-class and STATED.** PL-5 carries D-129's vocabulary and D-104's
  split; shell captures are `LOOKED_INDETERMINATE`; a projectless inquiry has no bar and
  says so; no manifest in force is stated (until PL-12); no token resolving is a named
  UNAVAILABLE (FL-6); ungraded legs are inert AND named (PL-14).
- **Content is the unit; never assume the lower levels complete.** The four-level search
  is FL-3's deterministic fan-out and SK-2's discipline; D-220 (PL-10) stops sixty
  document versions reading as sixty documents; until D-164 lands, versions compose
  document-grain legs and the description carries the passage — declared honestly.
- **A fence is code.** Every "may not" is a plane refusal with a C-number and a DEC-49
  code (PL-2/PL-3/PL-11, VF-2, VF-5); the bias fence is the absent field in FL-5's spawn
  contract, not a skill sentence; the skill (SK) constrains judgement only.
- **No avoidable debt; schema traps respected.** PL-1's tables go before `host_governor`
  and into `purge`; new debt gets rows with cost; this plan discharges D-213, D-216
  (check), D-217, D-218 (measure), D-220, D-221, D-222, D-223 (enumeration), D-225,
  D-226 (vocabulary held), D-84, D-196 (runs), D-115, D-116, D-117 (kept true), F9's
  class (register-first citations throughout), F10, F11.
- **Only DIST cuts releases.** DS-1..DS-4 live in DIST's own session and lane; nothing in
  CONDUCT's slots bumps a version, signs, tags or deploys.
- **M9 acceptance satisfied:** PL-1/PL-2/PL-3 give the inquiry its versioned basis and
  member-authored conclusion path; PL-14 states BOTH derived strengths per axis BY NAME,
  never a score, never composed; an ungraded leg suspends its axis, reads `undetermined`,
  and names the leg that is why — asserted in PL-14's accepts-when fixture.
- **M10 acceptance satisfied:** PL-16's ceremony refuses before it signs and cannot sign
  before the exclusion is authored (the DEC-33 ceremony it depends on); the published
  case is readable and hash-checkable with no credential; per-finding version names in
  DEC-34's header keep the published account identifiable after CURRENT moves on.

Open markers: none — every point this plan rests on is a recorded ruling, a landed
mechanism, or an item above with a measurement or check ahead of it.

## Confirmation pass (2026-08-07)

Independent adversarial pass, session BOB worktree, by a session that did not write this
plan. Every claim below was checked against the current tree: `INVESTIGATIVE-SESSION.md`
v3 §0–§19, `IS-SWEEP-2026-08-07.md`, `MILESTONES.md` M8/M9/M10 verbatim, `VERIFICATION.md`,
`INTERFACES.md` (I1–I7 all registered), `INTERFACE-CHANGES.md` (IC-24 SETTLED),
`DEBT.md` D-84/164/190/195/199/213–226, `DECISIONS.md` (DEC-32/34/40/43/44/46/47/49/
52/54/55/59/60/61/62 read in full at their final states), `QUEUE.md` (REC-59..65,
IS-1..IS-9, UI-38..41), `CLAUDE.md`, `PARALLELISM.md`, `FINDINGS-WORKPLAN.md` — and the
source: `store.mjs` (promote/inquiry_basis write at :7333-7339, `#schedConsumers` with
SEVEN consumers at :1503, `MACHINE_CANNOT_*`), `index.mjs` (`scopeFor` :1422, the OPS
no-taskenqueue comment :295-299, `op=affordances` :357), `queuestate.mjs:82`
(`runtime-ceiling-reached`, no producer), `bio-checks.mjs:127` (STATES = five),
`schema.mjs:358` (`capture_sessions`), `query.mjs` (`GATE_MARK` :134, MAX_COMPOUND
MEASURED :588), `bounds.test.mjs` (the pin now reads ZERO), `scripts/coverage.mjs`
(fleet-member.json enumeration already live), `scripts/control-register.mjs` (exists),
`src/cpu.mjs` (exists), `civicos-ui/test/run.mjs` (exists). Verdicts per check area:

1. **COVERAGE — DEFECTS FOUND, FIXED IN PLACE.** The map covered IS-1..IS-9, F9–F11,
   D-84/164/195/213/214/216/217/218/220/221/222/223/225/226, and DEC-47/49/52/61/62
   correctly. Missed and now fixed: **(a)** D-224 / Family E's E6 (the plan claims
   Families E/G as authority and covered 9 of E's 10 items) — added to W1's lane and the
   map; **(b)** PL-1 had dropped two obligations its own queue item (IS-1) carries:
   reword-user-selectable (§6.3b/D-217b) and version-identity-survives-the-run's-death
   (§14b.7) — both added; **(c)** DEC-50/§6.7's attributed-regroup constraint on the
   version-edit path appeared nowhere — added to PL-1; **(d)** D-159's re-read (QUEUE
   IS-7's explicit instruction) was dropped from PL-14 — added; **(e)** D-190 rides
   D-218's measurement (QUEUE IS-9's blocked-on) — added to FL-1; **(f)** DEC-52-final's
   WRITE half: UI-44 reviewed machine connections no item produces, while PL-11's
   "writes ONLY" sentence read as fencing the whole `ai` class off the constitutive acts
   DEC-52 permits — resolved via D-199.1 (scope is per TASK): PL-11 now says its fence is
   the investigative task scope only, and the post-processing task scope is named as
   unbuilt and to-be-scoped; UI-44 runs on fixtures until then and gains the missing
   PL-11 edge. DEC-56/57/58 owe this plan nothing (REC-63 / shipped / retired by UI-41 —
   verified). Remaining, non-blocking: the plan's rows do not carry their milestone
   tokens (the conformance section claims the mapping; it is derivable through the QUEUE
   items, which do carry them).
2. **DEPENDENCY TRUTH — HOLDS, with one contradiction fixed and two edges added.**
   Twelve edges spot-checked against §18, QUEUE and source: PL-2←PL-1, PL-3←PL-1/PL-2,
   PL-4←PL-3, PL-11←PL-3/PL-4, FL-2←FL-1/PL-11, FL-3←PL-3/PL-5/FL-2, FL-6←FL-2/DS-3,
   PL-13←PL-1/D-216, PL-16's four, UI-43←PL-2/PL-14/UI-42, VF-3-with-FL-2, SK-4←FL-3/
   VF-5 — no FALSE edge found. Defect: W5 slot A ordered PL-11 BEFORE PL-4 while PL-11
   depends on PL-4 — swapped. Added: FL-3←PL-9 (query-never-load consumes the
   meaning-grain op; the edge existed only transitively through PL-3, which was
   over-strict in the other direction) and UI-44←PL-11. PL-6/REC-59 is DONE (landed,
   IC-24 SETTLED, pin at ZERO) — row and W1 corrected; the plan had scheduled landed
   work.
3. **WAVE SAFETY — DEFECT, mitigated by an added rule.** Every wave W1–W5 paired
   `store.mjs`/`schema.mjs`/`index.mjs` writers ACROSS the two slots (named per wave in
   the new wave-rules bullet), while the plan's own discipline bullet had considered the
   hazard only for PL-1/2/3 across waves. A CLAIMS claim is path-grained, so the pairs
   cannot in fact run concurrently — the honest statement, now added as a wave rule, is
   an ordered handoff on the shared file (slot A first, per the existing slot-A-wins
   rule), with the waves' plane items partly serial and the lanes/UI/FLEET/DIST carrying
   the real parallelism. W6–W9 pairs verified genuinely disjoint (fleet/UI/tests).
   Schema traps re-verified present in PL-1 (before `host_governor`, into `purge`).
4. **ACCEPTS-WHEN QUALITY — HOLDS.** Ten sampled (PL-1, PL-2, PL-5, PL-13, PL-16, FL-1,
   FL-2, VF-1, VF-4, DS-1): each is a runnable command (`battery.mjs <suite>` subsets are
   real; `control-register.mjs` and the UI harness exist) or a checkable fact with a
   stated place to check it. Two were weak and are fixed/noted: PL-15's accepts-when
   presumed a run two waves before the harness exists — now fixture-driven; SK-2's
   "sampled run's descriptions" arm is uncheckable at authoring time (W1) and becomes
   checkable at VF-4 — acceptable for a lane item, noted here rather than edited.
5. **NC QUALITY — HOLDS.** PL-2's three-layer control is rule 3a done right (each layer
   broken with the others HELD OPEN); PL-11 carries DEC-55.5 BOTH halves; VF-5's
   remove-the-predicate-then-all-six-PASS is the strongest control in the plan; PL-5's
   kill-mid-flight, PL-7's DELTA arm, PL-3's one-refusal-at-a-time and FL-3's empty-run
   control each fail when their subject breaks. Two weaker ones, judged acceptable with
   the fix stated: SK-2's NC is a review criterion, not a runnable control — its code
   half is FL-3's deterministic table, and a source-scan over the skill text should ship
   with SK-2; SK-4's NC needed a GATE no code item owned (and the SKILL track's own
   intent forbids a skill holding one) — the investigate-mode gate is now assigned to
   FL-3's table by edit. FL-1's NC is a methodological rule rather than a breakable
   subject, which is the honest shape for a measurement item.
6. **CONFORMANCE — ONE OVERSTATEMENT, FIXED; the rest holds.** The M9 bullet claimed the
   suspends-axis/`undetermined`/names-the-leg behaviour was "asserted in PL-14's
   accepts-when fixture" while PL-14 asserted only inert-and-named — the M9-verbatim
   fixture (single-ground basis, one ungraded leg, axis reads `undetermined` and names
   the leg) is now IN PL-14's accepts-when, which also reconciles DEC-18/DEC-32's
   branch-level suspension with M9's sentence (the single-ground case is the degenerate
   branch). Smaller: PL-10's flat "fixes D-221" — the defective site (`heldMatch`) is in
   `civicos-ui/app.html`, UI's paths; QUEUE REC-61's conditional ("check rather than
   assuming; if a different defect, say so") plus a DELEGATION is the honest shape, left
   as a note here since the join itself is the fix's substance. The M10 bullet, the
   only-DIST-cuts-releases bullet, the measure-don't-assume bullet and the fence-is-code
   bullet all check out against their sources.
7. **CRITICAL PATH — HOLDS after correction.** PL-6 is already landed (path start moves
   to PL-7) and PL-4 was silently ON the path (PL-11 depends on it) — both corrected;
   the count of eleven open items survives both changes. Nothing on the path is
   deferrable: PL-7 before PL-8 is D-225-before-D-222 (recorded), PL-9 before PL-3 is
   arguable but harmless (the endpoint's checks read `inquiry_basis` plane-side; the
   HARNESS is what blocks on the C-shape read, and FL-3 now carries that edge — moving
   PL-9 off the PL-3 edge would buy one wave at the cost of re-sequencing W3/W4, not
   taken here), and VF-5 → SK-4 → VF-4 is the fence-proof-before-deployment order
   VERIFICATION rule 5 requires. PL-16's three external dependencies are correctly
   inherited, not owned; QUEUE IS-8's raise-don't-infer instruction on the DEC-33
   ceremony trigger stands and is CONDUCT's at W9 scheduling.

**Fixes applied by this pass** (each named above): PL-6 marked landed + pin corrected to
ZERO; PL-1 gains reword-user-selectable, the DEC-50 regroup clause, and the
survives-run-death arm; PL-14 gains the D-159 re-read and the M9-verbatim fixture; PL-11
gains the per-task-scope clarification; UI-44 gains the PL-11 edge and the fixture note;
FL-1 gains the D-190 rider; FL-3 gains the PL-9 edge and the investigate-mode-gate row;
PL-15's accepts-when made fixture-honest; W1 corrected (PL-6 out, D-224 lane in); W5
slot A order swapped; W7 lane gains FL-6 and W5's DIST lane gains DS-3's build (both
were depended on and never scheduled); the shared-file handoff wave rule added; the
critical path corrected (PL-6 landed, PL-4 inserted). `tools/plancheck.mjs` was NOT run
by this pass (it requires git, which this pass was instructed not to touch) — it remains
owed before the handover, per CLAUDE.md.

**VERDICT: CONFIRMED FOR SCHEDULING**, with the fixes above applied in place. One
follow-up owed before W8, not blocking W0–W7: the post-processing task scope that
produces live machine connections for UI-44 (DEC-52-final's write half) has no item and
must be scoped — raise it at W5 when PL-11's scope is written, or UI-44 ships
fixture-verified only.

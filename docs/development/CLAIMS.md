# Area claims

The register of who is working where, so no two sessions edit the same paths at
once. Established 2026-07-31 as step 2 of the parallel-development move
(`PARALLELISM.md`, "What to build first"). A text file and a rule; no tooling.

## The rules, in short

- **Claim your area before you edit its paths.** Append a `## CLAIM` block below.
  A claim keeps other sessions out of the paths it names; it is not a courtesy.
- **A session that needs work inside another area's claim DELEGATES.** Append a
  `## DELEGATION` block naming what you need and why, and continue with your own
  work. The owning area picks it up. Do not edit a claimed path quietly.
- **Release a claim explicitly**, by setting `released:` to the date. An
  unreleased claim older than its expected scope is stale, and `ARCH` may
  reassign it; silence does not hold ground forever.
- **Unclaimed paths are nobody's** — a collision risk, not a licence. Claim
  before editing even briefly.
- **Append only.** States are added, never edited in place, so the history of who
  held what is readable the same way the record's own history is. The one field
  that changes on an existing block is `released:`.

The format is the one `PARALLELISM.md` fixes:

```
## CLAIM <date> <AREA>
session: <name>
opened: <ISO8601>
paths: <comma-separated paths this claim reserves>
interfaces consumed: <ID(s), or none>
interfaces owned: <ID(s), or none>
expected: <the work this claim covers>
released: <date, or blank while live>
```

---

## CLAIM 2026-07-31 CAPTURE
session: capture-bootstrap-1
opened: 2026-07-31T17:57:07Z
paths: bio-plane/src/subresources.mjs, bio-plane/src/cpu.mjs, bio-plane/src/cdx.mjs, the capture/link/task/reachability tables in bio-plane/src/schema.mjs, the capture ops in bio-plane/src/index.mjs, the link/capture/task/reachability functions in bio-plane/src/store.mjs, the capture and authority checks in bio-plane/checks/bio-checks.mjs, bio-plane/test/subresources.test.mjs, bio-plane/test/governor.test.mjs, bio-plane/test/inbox.test.mjs, bio-plane/test/reachability.test.mjs, bio-plane/test/cdx.test.mjs
interfaces consumed: none
interfaces owned: I1 (bytes → content)
expected: CAPTURE's standing responsibility (fetch, governor, subresources, links, reachability, archive fallback). This turn stood up the parallel-development scaffolding under the ARCH role from the main checkout — CLAIMS.md, INTERFACES.md with I1, the UI/FRAMEWORK kickoff refresh, and the biosmoke-ui instance — none of which is another area's code.
released:

## CLAIM 2026-07-31 CAPTURE
session: capture-agent-1
opened: 2026-07-31T20:30:00Z
paths: bio-plane/test/hygiene.test.mjs, the purge table list in bio-plane/src/store.mjs
interfaces consumed: none
interfaces owned: none
expected: D-113 as a CLASS. A hygiene check asserting every CREATE TABLE in schema.mjs is either named in op=purge's whole-store table list or in a small explicit exemption allowlist (each with a one-line reason), so a forgotten derived table fails loudly. Also corrects derived capture tables currently missing from the whole-store purge. No deploy this turn; ARCH integrates.
released: 2026-07-31 — landed on main by ARCH (integration turn), commit 6eb2b42. Full battery green; the negative control was re-run by ARCH before landing (throwaway table -> the check fails naming it).

## CLAIM 2026-07-31 CONTENT-PDF
session: content-pdf-agent-1
opened: 2026-07-31T00:00:00Z
paths: bio-plane/src/pdfstructure.mjs, bio-plane/test/pdfstructure.test.mjs, the pdfstructure entries in bio-plane/package.json (the test:pdfstructure script and the additive link in the test chain)
interfaces consumed: I1 (bytes → content)
interfaces owned: none yet; expects to propose I2 (structure → framework) producer-side from what the extractor emits
expected: D-91 phase 1 — the PDF outbound-link structure graph (anchor / intra / deferred / refused / undetermined), byte-identical wrappers to subresources.mjs. No text extraction (unpdf) this turn.
released: 2026-07-31 — phase 1 landed on main by ARCH (integration turn), commit 0b1c6ce. Phase 2 (text via unpdf, measured against the 3MB bundle and CPU ceilings) remains; the op wiring needed to live-verify is the DELEGATION below.

## DELEGATION 2026-07-31 CONTENT-PDF → CAPTURE
from: content-pdf-agent-1 (recorded by ARCH at integration)
need: wire op=pdfstructure into the `if (op === …)` dispatch in bio-plane/src/index.mjs — a few additive lines that read a capture_sha through the existing op=capture byte path and call extractPdfStructure(bytes) from bio-plane/src/pdfstructure.mjs. index.mjs is CAPTURE's; this is the delegation the CONTENT-PDF kickoff anticipated, not a quiet edit.
why: the extractor is complete and unit-tested against fixtures but cannot be live-verified against real captured PDFs until an op exposes it. If op-wiring delegation recurs across content areas, that is the trigger to promote op-contract ownership out of CAPTURE (the I3 move PARALLELISM.md anticipates).
status: fulfilled 2026-07-31 — op=pdfstructure landed 2ab62f4 (capture-agent-2 / QUEUE.md CAP-1). Live-verify (QUEUE.md CPDF-3) still awaits a DIST deploy.

## CLAIM 2026-07-31 CAPTURE
session: capture-agent-2
opened: 2026-07-31T00:00:00Z
paths: the pdfstructure op in bio-plane/src/index.mjs (the OPS spec entry, the op=pdfstructure handler, the shared captureKey helper, and the extractPdfStructure import), bio-plane/test/pdfstructure-op.test.mjs
interfaces consumed: I1 (bytes → content), I2 (structure, provisional — consumed as the extractor's output shape)
interfaces owned: none
expected: QUEUE.md CAP-1 — fulfil the CONTENT-PDF→CAPTURE delegation above. Add op=pdfstructure (GET, read-only, same auth/caps posture as op=capture GET) that reads a capture sha through the exact R2 path op=capture uses and returns extractPdfStructure(bytes) as JSON. Test through the op with a fixture PDF (link annotation) plus a non-PDF negative control. Does NOT touch CONTENT-PDF's src/pdfstructure.mjs or test/pdfstructure.test.mjs. No deploy; CONDUCT integrates and live-verifies.
released: 2026-07-31 — CAP-1 landed on main by CONDUCT, commit 2ab62f4. Full battery green; the captureKey extraction verified a no-op (capture behaviour unchanged), the op is read-only and mirrors op=capture GET auth (no new permission).

## CLAIM 2026-07-31 CONTENT-PDF
session: content-pdf-agent-2
opened: 2026-07-31T00:00:00Z
paths: the CPDF-1 measurement section in docs/development/MEASUREMENTS.md (append-only), bio-plane/test/unpdf-measure-probe.mjs
interfaces consumed: none (a measurement)
interfaces owned: none
expected: D-91 phase-2 go/no-go MEASUREMENT (CPDF-1). Bundle `unpdf` through the plane's esbuild target in a scratch temp dir (NOT added to shipped deps/bundle) and measure bundled size vs the 3MB Free-worker limit; time extraction on a real Oakland agenda as a labelled node proxy (not Worker CPU); record both with date and instrument and recommend go/no-go. Commits no text extractor and changes no shipped dependency or bundle. Verdict: GO — bundle fits with 2.29 MB gzip headroom; node-proxy cost modest. CPDF-2 unblocked.
released: 2026-07-31 — measurement landed on branch content-pdf/phase2-measure; CONDUCT integrates. Worker-CPU-vs-ceiling confirmation via a deployed probe is the remaining gated follow-on (rides on the op=pdfstructure delegation above).

## CLAIM 2026-07-31 CAPTURE
session: capture-agent-3
opened: 2026-07-31T00:00:00Z
paths: the task-queue drain alarm in bio-plane/src/store.mjs (the alarm()/onAlarm handler, #rearmSchedule, #armDrain, #drainDelayMs, the TASK_DRAIN_* constants, and the arming added to taskEnqueue), bio-plane/test/task-drain-alarm.test.mjs, the TASK_DRAIN_DELAY_MS binding added to bio-plane/test/inbox.test.mjs, and the two test entries in bio-plane/package.json
interfaces consumed: none
interfaces owned: none
expected: QUEUE.md CAP-2 / D-109 — drain the task queue automatically on a Durable Object alarm, the mechanism #armSweep proved for selections: armed on enqueue, re-armed by the alarm while task_queue is non-empty, self-terminating (deleteAlarm) when it drains. The capture path only ENQUEUES; taskEnqueue arms the alarm (a schedule, never a task write) so the producer/consumer split is preserved. onAlarm shares the single DO alarm with the selection sweep and reconciles to the earliest wake. op=taskdrain still works — the alarm and the manual drain coexist. NEGATIVE CONTROL run: neutering onAlarm's taskDrain call fails the suite naming the undrained queue ("the queue is empty after the drain" want 0 got 1; "the queue count is zero" want 0 got 1); restored and green. Full battery green (exit 0). No inbox-grammar or write-gate change. No deploy; CONDUCT integrates and live-verifies.
released: 2026-07-31 — CAP-2 / D-109 landed on main by CONDUCT, commit 39a0e1b. Full battery green (exit 0); the selection, inbox, and task-drain suites pass together, confirming the shared-alarm reconciliation preserves the selection sweep.

## CLAIM 2026-07-31 BOB
session: bob-planning-1
opened: 2026-07-31T21:00:00Z
paths: docs/development/MILESTONES.md (new), docs/development/VERIFICATION.md (new), docs/development/PLAN.md (header only), docs/development/ORCHESTRATION.md, docs/development/PARALLELISM.md (area table), docs/development/INTERFACES.md (I3/I4/I5 appended), docs/development/DEBT.md (Status column dispositions + appended section), docs/development/MEASUREMENTS.md (appended), docs/development/CAPTURE-SCALING.md (status markers), docs/development/kickoffs/README.md, CLAUDE.md (verification section), bio-plane/scripts/battery.mjs (new), bio-plane/scripts/coverage.mjs (new), bio-plane/test/bundle.test.mjs, bio-plane/package.json (two test scripts)
interfaces consumed: none
interfaces owned: registers I3, I4, I5 from the code as it stands (I3 owner moved CAPTURE -> RECORD)
expected: the planning-infrastructure cleanup Bob directed — place every open construct architecturally, refactor the plan into milestones and pipelines CONDUCT can orchestrate, and stand up a verification process with a measured floor. NO area code touched: the two new scripts are instruments, and bundle.test.mjs was REPAIRED (it read an absolute container path, was absent from the npm test chain, and failed on an 11-character token fixture against livefire's 16-character floor). QUEUE.md deliberately NOT edited — it is CONDUCT's sole-writer file and CONDUCT was landing CAP-2 concurrently; the M0 items are handed over as a decomposition instead.
released: 2026-07-31 — docs only; nothing deployed, nothing pushed.

## CLAIM 2026-07-31 CONTENT-PDF
session: content-pdf-agent-4
opened: 2026-07-31T00:00:00Z
paths: the CPDF-7 measurement section in docs/development/MEASUREMENTS.md (append-only), the D-118 row in docs/development/DEBT.md (Status column only), bio-plane/test/free-tier-fleet-probe.mjs (new probe, not in the battery)
interfaces consumed: none (a measurement)
interfaces owned: none
expected: QUEUE.md CPDF-7 / D-118 — MEASURE whether Workers Free permits a second Worker script and service bindings, and what a cross-Worker call costs, through the project's own Cloudflare account and egress. Deploys THROWAWAY Workers (cpdf7-probe-*) and TEARS THEM DOWN, never touching biosmoke7/civicos/newgroup, the record or the installer; attaches no R2 binding. Commits no shipped code and changes no dependency. Findings: the account is on Workers FREE (the API refused limits.cpu_ms with "not supported for the Free plan"); on Free a second script deploys, a service binding deploys and RESOLVES, and a cross-Worker call runs end-to-end for ~1 ms wall-clock / one subrequest (25 binding calls in one Free invocation succeeded; teardown re-confirmed, back to three scripts). So D-118's conditional does NOT fire: pdf-worker (CPDF-6) is viable on Free and central; Tier 1 (CPDF-4) is not forced to be the floor by any binding limitation. D-118 CLOSED; the residual 10 ms Worker-CPU-ceiling question is narrowed onto CPDF-1's existing gated follow-on. No deploy of the plane; CONDUCT integrates.
released: 2026-07-31 — measurement landed on branch content-pdf/cpdf7-fleet-measure; CONDUCT integrates. Not pushed.

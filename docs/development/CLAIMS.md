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
status: open

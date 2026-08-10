# The retired runtime, as `BIO_Bundle_Skill_Composite_Design_v1_7` described it

**Moved here 2026-08-10, verbatim and unedited, on Bob's instruction that the retired
substrate leave the architecture record.** The live document keeps everything the plane
must still satisfy — the bundle format, the promotion semantics, the one-check-codebase
law and the C-series catalog — named by ROLE rather than by the runtime that first played
it. What is here is the build: a source tree that no longer exists and the version history
of the endpoint that ran it.

**It is a record of what it concluded and is not corrected in place.** Read it for the
worked detail; the live document, `docs/architecture/BIO_Bundle_Skill_Composite_Design_v1_7.md`,
is what binds anything today. The runtime's own source has a separate archive note at
`docs/archive/apps-script-README.md`.

| here | was | what stayed live |
| --- | --- | --- |
| the v1.1–v1.7 revision log | `§0` | the contracts those revisions ratified, stated as rules |
| the endpoint's subtree in the component inventory | `§2` | one inventory entry naming the endpoint's parts and its conformance obligation |
| the measured component sizes at 0.1.0 | `§2` | the sizes of components that still exist |

---

## From `§0` — the revision log, v1.1 through v1.7

**Revision note (v1.7).** Minted July 20, 2026 at bio-bundle rev 0.1.48
(bio-checks 1.9.0, accelerator 0.10.2, client 0.7.0), folding the M2'
daemon build and live fire, which this document predated entirely at
v1.6. (a) Section 9's one-codebase contract extends from two call sites
to three: the embedded gate propagates checks.js byte-verbatim into
promotion-service.gs at build time (assemble.py embed-gate,
hash-verified at compile, verdict-parity asserted by conformance on
every build over both PASS and FAIL fixtures), retiring v1.6's
accelerator caveat; the daemon gates its own packages at packaging, and
per the July 20 operator decision (Tech Arch v10 Section 10.11) the
promoter additionally gates non-mechanical manifests, implementation at
accelerator 0.10.3. (b) Section 8 records the daemon as a third
packaging surface, a mechanical writer under the I-20 field-set fence,
and defines skill_version as the writer's component version (the daemon
writes the accelerator version; a session or the client writes the
composite), matching all existing records. (c) Section 2's inventory
gains the M2' build-emergent components: the daemon operation cores in
promotion-service.gs, accelerator/test/daemon-conformance.mjs (85
assertions including the interruption-recovery and cascade-ordering
sections, count verified against an actual run), the client's
daemon-view.js with its battery, and the intake battery;
accelerator/postpkg.py (the packaged POST-with-sha-verification write
helper) is recorded as a planned component entering at the next
composite bump. (d) The check codebase stands at bio-checks 1.9.0 with
the C-18 family and C-20.1. Companion references update to State Rules
v1.5, Tech Arch v10, and BIO_Intake_Doctrine v1.0, which joined the
document set after v1.6.

**Revision note (v1.6).** Two ratifications from the Phase 1 client
ladder (bio-bundle rev 0.1.20 through 0.1.29). (a) The Section 9
one-codebase contract extends to the divergence-ladder classifier:
classifyDivergence lives in bio-checks as the single implementation of
the spec Section 5.5 rung semantics, called by the gate's C-17.2 and by
every promoter that classifies (the client promoter today); no promoter
carries its own. (b) Section 8 records the client as a second packaging
surface: the PWA writes gate-passed packages through the admitted
endpoint slate with the manifest strictly last, carrying author (the
pwa-client caller class) and skill_version (the client version) so store
provenance names the producing surface, with Edit provenance-gated to
dockets freshly synced from the live endpoint. Companion references
update to State Rules v1.4 and Tech Arch v9.

**Revision note (v1.5).** The build order of Section 11 has been
executed in full (July 10-11, 2026, bio-bundle 0.1.0, bio-checks 1.3.1);
Section 11 now records outcomes and the remaining operator items. The
component inventory gains the build-emergent components:
core/promote-reference.js (axiomatic; the executable statement of the
spec 2.4 convergent algorithm, the conformance target for the client and
accelerator implementations), accelerator/test/conformance.mjs (the
algorithm-identity harness: it executes the actual .gs source under node
and asserts byte-identical bundle trees against the reference; it is the
rebuild-together rule's enforcement mechanism), accelerator/DEPLOY.md
(the Product D one-step group-setup guide), derivatives/product-c.js
(the Product C profile emitter), and assemble.py's extract-runner
subcommand (the Product B round-trip operation). Determinism is a hard
assembly rule: products carry no timestamps or environment data, and
assemble.py --verify proves byte-for-byte reproducibility on demand.
Check C-16.5 added (stale advisory claims and presence markers surfaced
with deletion as the repair; info severity, never load-bearing,
completing the nothing-lies-around commitment of v1.2).
Requirements-traceability audit recorded: sixteen of seventeen
invariants carry executable checks; I-10's age check is deferred pending
a spec v1.2 decision (below); I-17's disjointness auto-classification
awaits the client ladder. Spec v1.2 candidates queued for ratification:
reeval_pending becoming {flag, since, source} (unblocks C-10's age
check), and Section 2 anatomy listing the transient advisory files
(PROMOTING-*.json, PRESENCE-*.json).

**Revision note (v1.4).** Multi-writer editing coherence resolved
(optimistic, base-stamped, three-rung divergence ladder; spec Section
5.5). The accelerator became dual-mode: time trigger plus a web endpoint
bound to trigger-only semantics as a hard rule. The spec amendments
carried by earlier revisions were published in spec v1.1.

**Revision note (v1.3).** Promotion concurrency designed in:
convergence, not exclusion (deterministic naming, commit-point write
order, idempotent consumption, advisory claim). The accelerator reframed
from optional extension to standard off-kernel component. Accretive-add
identity made collision-resistant.

**Revision note (v1.2).** The pending-package mechanism elevated to a
first-class queue with a defined lifecycle. A dedicated watcher process
rejected for the kernel. Checks-module durability made explicit:
designed to run unmodified for years, schema evolution the only planned
change vector, additive by construction.

**Revision note (v1.1).** Check codebase changed to plain JavaScript
with JSDoc annotations. Chat mode changed to packaging-only.

---

## From `§2` — the endpoint's subtree in the component inventory

```
├── accelerator/

│ ├── promotion-service.gs Product D: pure convergent core + thin Apps
Script bindings;

│ │ time trigger + trigger-only doGet; strict pre-work token check;

│ │ invocation log at index/invocations.jsonl

│ ├── DEPLOY.md one-step group deployment; token distribution and
rotation

│ └── test/conformance.mjs executes the .gs source under node; asserts
byte-identical

│ end states vs promote-reference.js; structural endpoint greps
```

---

## From `§2` — measured component sizes at 0.1.0

Measured sizes at 0.1.0: core 14.2KB, agent brief 5.2KB (37%), type
schemas 2.7-7.1KB, operations 1.2-1.8KB, checks module \~40KB of
JavaScript (executed, never loaded into context), consolidated \~100KB
(chat-mode flat-rate physics), accelerator 274 lines of Apps Script.

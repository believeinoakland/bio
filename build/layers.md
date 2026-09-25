# The layers

**Status** · DRAFT by BOB #37, 2026-09-25 (TRANSITION.md T4). Bob ruled on its six calls the same day (below). One question is still open: whether to add the Understanding layer. The modules, in their total order, are in `modules.json`. Sources: the construct map (`BIO_System_Design.md` §3–§4) and the code as it stands (imports measured 2026-09-25). Each layer's modules may use modules earlier in the order only (P4).

| layer | name | constructs (System Design §3) | contract | modules |
| --- | --- | --- | --- | --- |
| 1 | Foundations | 5, and shared libraries | No access to the record. Pure libraries, or standalone workers that take bytes and return results. | legacy-checks, runtime-limits, signatures, id-spaces, subresources, ooxml, office-readers, odf-reader, pdf-reader, format-registry, text-chain, docprofile, pdf-worker, ocr-worker |
| 2 | Record and authority | 3, 1 | Owns storage, id allocation, leases, audit and purge; the member, the capability and the fence; the one write path that promotes and checks a bundle. | record-core, membership, promotion |
| 3 | Intake and provenance | 2 | Material enters only with provenance; a hop attests bytes, URL and time, no more. | host-governor, provenance, capture-sources, capture |
| 4 | Content | 4, 5 | Readings are made from captured bytes; content is the reference to a part of a document, minted over them. | extraction, content |
| 5 | Meaning, bias and retrieval | 6, 7, 9 | Everything derived over content, with its grade; the four-level search, which says at which level absence was found. | entities, connections, progressions, bias, observation-log, query-language, retrieval |
| 6 | Inquiry and the assistant | 8, 11 | The inquiry and its legs, findings, basis versions and strength; the AI finds, pursues, extracts and checks, and never attests or concludes. | inquiry, basis-versions, strength, contradiction, review, actions, skills, ai-runs, agent-worker |
| 7 | Publication and operations | 13, 10, 14 | What the group stands behind leaves one way; the instance keeps itself current unattended. | publication, monitoring, scheduler, legacy-store |
| 8 | Interface and distribution | 12, 15 | The ops, the member surfaces and the installer. Nothing below depends on them. | affordances, queue, instance-setup, control-plane, legacy-index, legacy-ui, installer |

## The legacy modules (PROCESS-MECHANICS §12)

| legacy module | file | lines | why it sits where it does |
| --- | --- | --- | --- |
| legacy-checks | `bio-plane/checks/bio-checks.mjs` | 16,591 | It is the whole check catalogue, one set per construct, and it imports nothing. It is first in the order because modules in every layer use it. Each extracted module takes its own checks, which are its invariants. |
| legacy-store | `store.mjs`, `schema.mjs` | 54,618 and 4,287 | It is last among the store-backed modules, so extraction runs bottom-up: an extracted module never calls back into it, and it calls the extracted modules. |
| legacy-index | `index.mjs` | 13,438 | It is after legacy-store, because it imports it. |
| legacy-ui | `civicos-ui/` | 26,489 in `app.html` | It talks to the plane over HTTP only. |

A module marked `from` in `modules.json` is extracted from that legacy module by its own job. Which functions go to which module is an informed guess from their names (for example `promote`, `reopen`, `captureProgressions`). The extraction job reads the legacy code and confirms it.

## Bob's rulings on the draft, 2026-09-25

1. **No size limit.** A module's size is a metric, not a bound. BOB reports any module that approaches about 4,000 lines of code (P6, P14).
2. **Ops move with their construct.** Each op's handler moves at extraction into the module whose service it is. `control-plane` keeps only routing, authentication and the response envelope.
3. **Each module owns its tables.** `schema.mjs` is divided at extraction.
4. **The UI is a placeholder, worked on elsewhere.** `legacy-ui` stays registered, so every product file has an owner, but no tranche plans work on it. Its replacement is placed in the top layer when it arrives. At T5, a row about the UI itself is dropped for that reason; a row about a plane service the UI needs is carried against the plane module that provides it.
5. **Moving a function.** BOB moves a function between modules when the order and the declared uses still hold, and reports the move to Bob. A change to the order, a layer or a `uses` edge comes to Bob.
6. **`promotion` starts in layer 2.** If it needs a later module, it moves up with Bob's approval.

**The checks are carried, never dropped (Bob: "very important to keep").** Every check in `bio-checks.mjs` moves, at extraction, into exactly one module, as an invariant with its own requirement id and test. `legacy-checks` is retired only when it is empty. A check is removed only by a recorded ruling.

## Proposed: layer 7, Understanding (Bob's question, 2026-09-25)

Bob asked whether a layer between investigation and publication belongs in the architecture, and whether anything done there would serve publishing, monitoring and scheduling. The canon already rules its content: `BIO_Content_Framework_v0_10.md` §12, *Intent: goals, objectives, aspirations, and the discovery loop* (RULED by Bob, 2026-07-30).

| proposed module | what it does | source |
| --- | --- | --- |
| intent | Holds aspirations, goals and objectives. An objective has a satisfaction condition, so its progress is computed from the record and never reported, and its gaps are the work list. Unasked-for findings arrive as proposals, and a member adopts them, turns them into a focus or a problem, or defers them with a recorded reason (the discovery loop). | §12. Aspiration and goal are not built (no code mentions them); the objective lives on the project. |
| reevaluation | When something a finding rests on changes (a new version of a passage, a weaker derivation, a changed grade), it says which findings are affected, and how. | `reevaluations`, `versionNotice` and `changedFromAudit` in `store.mjs`, which the draft had left inside layer 6 |

What the layers above would get from it:
- **Monitoring** watches what the group's objectives and findings rest on, rather than sweeps chosen by hand.
- **Scheduling** orders work by the priority that aspirations set and by the gaps that objectives leave.
- **Publication** knows which findings still stand after reevaluation, and which findings run against a goal (Invariant 7).

It fits the order: it uses the inquiry and the assistant below it, and nothing below uses it. The assistant works an objective when intent hands it one, so `ai-runs` does not depend on `intent`. **Recommendation: add it.** Layers 7 and 8 become 8 and 9.

## Paths that are not product

`docs/`, `requirements/`, `build/`, `tools/`, `release/` and the old process's `.claude/` hooks are not modules. `release/` is produced by the distribution process (mechanics §11). `tools/` is the old process's tooling, retired at T7 (TRANSITION §5, C3).

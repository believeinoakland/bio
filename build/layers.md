# The layers

**Status** · DRAFT by BOB #37, 2026-09-25, for Bob's approval (TRANSITION.md T4). The modules, in their total order, are in `modules.json`. Sources: the construct map (`BIO_System_Design.md` §3–§4) and the code as it stands (imports measured 2026-09-25). Each layer's modules may use modules earlier in the order only (P4).

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

## Calls for Bob, each with a recommendation

1. **Module size (P6).** A module holds at most about 4,000 lines of code, so that one session can read it with its requirements and the services it uses. The metrics correct the figure (P14). *Recommend yes.* `office-readers` (3,026 lines) and `ai-runs` (at least 3,285) are near that limit.
2. **Ops live with their construct.** Each op's handler moves at extraction into the module whose service it is. `control-plane` keeps only routing, authentication and the response envelope. *Recommend yes.* Otherwise `index.mjs` becomes a second monolith that uses everything.
3. **Each module owns its tables.** At extraction, `schema.mjs` is divided, and each table's definition moves into the module that owns it. *Recommend yes.* That is what makes ownership (mechanics §8, check 3) hold for the database.
4. **The UI is divided later.** `app.html` stays one legacy module until layer 8's first tranche, and its target modules (one per surface) are drafted with you then. *Recommend yes.* It is the last layer, and its structure is not yet measured.
5. **Moving a function between modules.** When an extraction job finds a function assigned to the wrong module, BOB moves it, provided the order and the declared uses still hold, and reports the move to Bob. Anything that changes the order, a layer or a `uses` edge is brought to Bob. *Recommend yes.*
6. **`promotion` sits in layer 2.** The single write path (`promote`, 2,547 lines) checks every bundle type. If its extraction finds that it needs a module from a later layer, it moves up, which is an architecture change and comes to Bob. *Recommend yes.*

## Paths that are not product

`docs/`, `requirements/`, `build/`, `tools/`, `release/` and the old process's `.claude/` hooks are not modules. `release/` is produced by the distribution process (mechanics §11). `tools/` is the old process's tooling, retired at T7 (TRANSITION §5, C3).

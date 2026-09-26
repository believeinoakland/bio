# The layers

**Status** · APPROVED by Bob 2026-09-25 (TRANSITION.md T4), as drafted by BOB #37 the same day with his rulings (below), including the Understanding layer. AMENDED by Bob 2026-09-26: the Action layer (layer 9, below), splitting the old layer 8 into Publication (8) and Operations (10); 11 layers, 58 modules. A view of it is `layers-view.html`, beside this file. The modules, in their total order, are in `modules.json`. Sources: the construct map (`BIO_System_Design.md` §3–§4) and the code as it stands (imports measured 2026-09-25). Each layer's modules may use modules earlier in the order only (P4).

| layer | name | constructs (System Design §3) | contract | modules |
| --- | --- | --- | --- | --- |
| 1 | Foundations | 5, and shared libraries | No access to the record. Pure libraries, or standalone workers that take bytes and return results. | legacy-checks, jurisdictions, test-support, bundler, runtime-limits, signatures, id-spaces, subresources, ooxml, office-readers, odf-reader, pdf-reader, format-registry, text-chain, docprofile, pdf-worker, ocr-worker |
| 2 | Record and authority | 3, 1 | Owns storage, id allocation, leases, audit and purge; the member, the capability and the fence; the one write path that promotes and checks a bundle. | record-core, membership, promotion |
| 3 | Intake and provenance | 2 | Material enters only with provenance; a hop attests bytes, URL and time, no more. | host-governor, provenance, capture-sources, capture |
| 4 | Content | 4, 5 | Readings are made from captured bytes; content is the reference to a part of a document, minted over them. | calibration, extraction, content |
| 5 | Meaning, bias and retrieval | 6, 7, 9 | Everything derived over content, with its grade; the four-level search, which says at which level absence was found. | entities, connections, progressions, bias, observation-log, query-language, retrieval |
| 6 | Inquiry and the assistant | 8, 11 | The inquiry and its legs, findings, basis versions and strength; the AI finds, pursues, extracts and checks, and never attests or concludes. | inquiry, citation, basis-versions, strength, contradiction, review, ai-runs, run-productions, capture-requests, skills, agent-worker |
| 7 | Understanding | Content Framework §12, and 8 | What the investigation below has established: the group's intent, with progress computed against the record, and which findings still stand when their basis changes. | intent, reevaluation |
| 8 | Publication | 13 | What the group stands behind leaves one way. | publication |
| 9 | Action | Functional Architecture "Layer 3: Action"; Design Requirements §7–§8 | An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis. | standards, conformance, consequences, actions, filings, escalation |
| 10 | Operations | 10, 14 | The instance keeps itself current unattended, and watches the actions' clocks and the government's response. | monitoring, scheduler, legacy-store |
| 11 | Interface and distribution | 12, 15 | The ops, the member surfaces and the installer. Nothing below depends on them. | affordances, queue, instance-setup, control-plane, legacy-index, legacy-ui, installer, legacy-tests |

## No jurisdiction in the product (Bob's concern, 2026-09-25; ruled by BOB #37)

Bob: CivicOS must not carry so many outward-facing references to Oakland and Alameda County that a group elsewhere concludes it is not for them. Measured the same day: local knowledge is written into code (identifier spaces and publishing systems in `idspaces.mjs`; council headers and municipal-code citations in 12 `docprofile/` files; a default search term of "oakland" in `store.mjs`), and the installer's outward text brands itself "Believe in Oakland".

1. **Product code and its outward text name no jurisdiction.** Everything local lives as DATA in a **jurisdiction profile**: identifier spaces and their forms, publishing systems and their addresses, coverage floors, the vocabulary document recognisers match, default search terms. A profile names the measurement each fact rests on.
2. **The `jurisdictions` module holds the profiles** (layer 1, first after `legacy-checks`). Oakland and Alameda County are its first profile, the one the project's own instance uses. An instance may use several profiles; which ones is an instance setting chosen at install.
3. **A module that needs local knowledge takes it from a profile.** Its requirements are stated for any jurisdiction, and its tests include at least one profile that is not Oakland's.
4. **Outward text names the product (CivicOS) and the group.** Believe in Oakland is named only where it is the fact: as the publisher and signer of a release.
5. A requirement that names a place is a defect in the requirement, except in the `jurisdictions` module's profile data.
6. **Provenance is not a jurisdiction.** A comment, a test or a basis string that says where a measurement was taken (an Oakland document, M-157) records a fact about the evidence and is allowed. The rule governs behaviour and outward text.

The work this makes is in `plan/next.md`. The UI is worked on elsewhere and carries the same rule.

## The legacy modules (PROCESS-MECHANICS §12)

| legacy module | file | lines | why it sits where it does |
| --- | --- | --- | --- |
| legacy-checks | `bio-plane/checks/bio-checks.mjs` | 16,591 | It is the whole check catalogue, one set per construct, and it imports nothing. It is first in the order because modules in every layer use it. Each extracted module takes its own checks, which are its invariants. |
| legacy-store | `store.mjs`, `schema.mjs` | 54,618 and 4,287 | It is last among the store-backed modules, so extraction runs bottom-up: an extracted module never calls back into it, and it calls the extracted modules. |
| legacy-index | `index.mjs` | 13,438 | It is after legacy-store, because it imports it. |
| legacy-ui | `civicos-ui/` | 26,489 in `app.html` | It talks to the plane over HTTP only. |
| legacy-tests | `bio-plane/test/`, `civicos-ui/test/` and the UI's two check scripts | the old battery | Added 2026-09-26 by BOB #38 (P17). The old battery tests every layer, so it is last in the order and may use anything earlier. The extracted modules' own tests live in `bio-plane/test/m/<module>/`, which the most specific path assigns to each module. It shrinks as extraction replaces it (C5) and is retired when empty. |

A module marked `from` in `modules.json` is extracted from that legacy module by its own job. Which functions go to which module is an informed guess from their names (for example `promote`, `reopen`, `captureProgressions`). The extraction job reads the legacy code and confirms it.

## Bob's rulings on the draft, 2026-09-25

1. **No size limit.** A module's size is a metric, not a bound. BOB reports any module that approaches about 4,000 lines of code (P6, P14).
2. **Ops move with their construct.** Each op's handler moves at extraction into the module whose service it is. `control-plane` keeps only routing, authentication and the response envelope.
3. **Each module owns its tables.** `schema.mjs` is divided at extraction.
4. **The UI is a placeholder, worked on elsewhere.** `legacy-ui` stays registered, so every product file has an owner, but no tranche plans work on it. Its replacement is placed in the top layer when it arrives. At T5, a row about the UI itself is dropped for that reason; a row about a plane service the UI needs is carried against the plane module that provides it.
5. **Moving a function.** BOB moves a function between modules when the order and the declared uses still hold, and reports the move to Bob. *Amended 2026-09-26 by P17:* a change to a layer, or adding or removing a module that carries product capability, comes to Bob; `uses` edges, order within a layer, file ownership and helper or legacy modules are BOB's, decided and reported.
6. **`promotion` starts in layer 2.** If it needs a later module, it moves up with Bob's approval.

**The checks are carried, never dropped (Bob: "very important to keep").** Every check in `bio-checks.mjs` moves, at extraction, into exactly one module, as an invariant with its own requirement id and test. `legacy-checks` is retired only when it is empty. A check is removed only by a recorded ruling.

## Layer 7, Understanding (Bob, 2026-09-25)

Bob asked whether a layer between investigation and publication belongs in the architecture. BOB proposed it from `BIO_Content_Framework_v0_10.md` §12 (*Intent: goals, objectives, aspirations, and the discovery loop*, RULED by Bob 2026-07-30), and Bob approved it the same day. A layer is named for what it provides; this one provides the group's understanding.

| module | what it does | source |
| --- | --- | --- |
| intent | Holds aspirations, goals and objectives. An objective has a satisfaction condition, so its progress is computed from the record and never reported, and its gaps are the work list. Unasked-for findings arrive as proposals, and a member adopts them, turns them into a focus or a problem, or defers them with a recorded reason (the discovery loop). | §12. Aspiration and goal are not built; the objective lives on the project today. |
| reevaluation | When something a finding rests on changes (a new version of a passage, a weaker derivation, a changed grade), it says which findings are affected, and how. | `reevaluations`, `versionNotice` and `changedFromAudit` in `store.mjs` |

What the layer above gets from it: monitoring watches what objectives and findings rest on; scheduling orders work by the priority aspirations set and the gaps objectives leave; publication knows which findings still stand, and which run against a goal (Invariant 7). The assistant works an objective when intent hands it one, so `ai-runs` does not depend on `intent`.

**Beyond MVP: Discovery (Bob's candidate, 2026-09-25, not in the module list).** An AI assistant that searches documents, content, meaning and the results of inquiries for an understanding of what is working and what is not. It would sit in this layer. It enters `modules.json` only when Bob adds it.

## Layer 9, Action (Bob, 2026-09-26; drafted by BOB #38, APPROVED by Bob the same day)

Bob: once a group publishes a finding, the finding may claim that the government has acted out of conformance with a regulation, a court decision, stated public policy or another requirement. **The Action layer holds the modules that support the group in acting to bring the government back into conformance.** The canon already specifies this work: Functional Architecture v3 "Layer 3: Action" (escalate, communicate, track toward resolution) and "Function 1: Compare actions to standards"; Design Requirements v2 §7 (the six-stage escalation protocol) and §8 (evidence separated from legal strategy, three risk tiers); Roadmap v5 §8 (evidence packages); State Rules v1.5 §4.4 (the Action object and its clocks). T4 compressed all of it into one module, `actions`, inside layer 6. Nothing uses `actions` today, so it can move up freely.

**Where it sits.** After publication, because a finding is published before a group acts on it, and a filing leaves the instance the way publication delivers. Before monitoring, because monitoring watches the actions' clocks and the government's response. So the old layer 8 split, and the order is: 7 Understanding · **8 Publication** (publication) · **9 Action** · **10 Operations** (monitoring, scheduler, legacy-store) · 11 Interface and distribution.

**Contract.** An action rests on a published finding and on a standard held in the record. The group decides every act; the AI prepares, never files. Compliance is documented as carefully as noncompliance. Every deadline names the statute, order or commitment it comes from.

| module | what it does | source |
| --- | --- | --- |
| standards | The conformance requirements a government act is measured against: a statute, regulation, court decision or order, adopted policy, or public commitment. Each is held as content in the record, with its citation and the period it was in force. Which laws and bodies exist comes from the jurisdiction profile. | Functional Architecture, Function 1 and the Legal/Policy Lookup skill |
| conformance | The determination that a named government act is compliant, noncompliant or unclear against named standards, resting on published findings. Unclear sends the question back to inquiry. A compliant determination is recorded too. It does not rank significance; that is a member's judgment, made with the consequences in front of them. | Functional Architecture, analysis outputs and Function 4 |
| consequences | What the breach did, and to whom: who or what is affected (a class of people, a fund, a program, a service), the measure (money, benefits, services, time, counts) and the period. Computed from the record where the record holds the figures, each with its basis and grade. Where it cannot be computed it is marked undetermined, and the module supports members in determining it from the record together with their own assessment, each part recorded as what it is (computed, or a member's assessment, with who made it and on what). That a harm follows from the act is itself a finding that needs evidence, never assumed. People are counted as a class or named in their official role, never singled out as individuals. Escalation's exit condition ("consequences addressed") is checked against it. | Bob, 2026-09-26; Roadmap OP6; Functional Architecture Function 4 ("informed by context, scale, pattern, and consequences") |
| actions | The Action object (moved from layer 6): kind, risk tier, counterparty, clock entries each with its basis, lifecycle, correspondence. It rests on a conformance determination. | State Rules §4.4; carries REC-215, REC-201, D-689, D-579 |
| filings | What the group sends: Tier 1 and 2 filings pre-filled from the record; for Tier 3, a **counsel packet** for counsel the group names: the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim. It is marked as prepared for counsel's review, is never published, and is never in a form that can be filed as it stands. Counsel drafts and files. The kinds, templates and venues come from the jurisdiction profile. | Design Requirements §8, Roadmap §8 |
| escalation | The stages (discovery and documentation, notification, clock starts, response evaluation, legal tools, sustained attention, and political accountability, ruled below), each with entry and trigger conditions; the next stage is proposed when its trigger is met, and a member advances it. It ends only when compliance is restored and the consequences are addressed. | Design Requirements §7, Functional Architecture Functions 3 and 5 |

Uses, all earlier in the order: `standards` uses jurisdictions, record-core, content; `conformance` uses standards, inquiry, strength, reevaluation, publication; `consequences` uses conformance, inquiry, strength, content; `actions` uses conformance, consequences and its current uses; `filings` uses actions, standards, publication, jurisdictions; `escalation` uses conformance, consequences, actions, filings. `monitoring` gains actions and escalation.

**Bob's rulings on the draft (2026-09-26).**
1. *Significance.* Consequences are computed from the record where it holds the figures; where they cannot be, they are marked undetermined, and members determine them from the record and their own assessment (the `consequences` row above). Significance, whether a breach warrants action and how urgently, stays the member's judgment.
2. *Tier 3.* `filings` prepares a counsel packet for named counsel (the `filings` row). This amends Design Requirement 8.
3. *Political stage.* Escalation gains stage 7, **political accountability**, entered from response evaluation or legal tools and aimed at compliance restored and consequences addressed: asking elected officials to act on the breach, oversight and audit requests, testimony, and legislation that restores or enforces an existing requirement. Policy advocacy and candidate support stay out; Operational Principle 1 stands. This amends Design Requirement 7.

**What it changed.** `modules.json` gained five modules and moved `actions`; the layers renumbered to eleven (58 modules). Layer 1 is unaffected except `jurisdictions`, whose profile gains the sources of standards, the offices addressed, the action kinds with their tiers and venues, and the legal deadlines these modules read: R23–R30 of its requirements, approved by Bob 2026-09-26, built with the module itself (entries N1 and N11).

## Helper modules (BOB #38, 2026-09-26, under P17)

Found by the architecture check's first run: shared helpers that later modules used from the top of the order.
- **test-support** (layer 1): the test sandbox and stdio guard (`bio-plane/test/sandbox.mjs`, `stdio.mjs`) that the workers' tests and the old battery share.
- **bundler** (layer 1): `bio-plane/scripts/fleet-bundle.mjs` and its `provenance.mjs`, which build the plane and the three workers.

Declared uses the code already had were added (affordances, query-language and skills on legacy-checks; agent-worker on runtime-limits, legacy-checks, query-language, ai-runs and skills; ocr-worker on legacy-checks and text-chain), `skills` moved after `ai-runs`, and `ai-runs`'s stale use of `skills` was removed. `not_product` in `modules.json` lists the paths no module owns.

## Paths that are not product

`docs/`, `requirements/`, `build/`, `tools/`, `release/` and the old process's `.claude/` hooks are not modules. `release/` is produced by the distribution process (mechanics §11). `tools/` is the old process's tooling, retired at T7 (TRANSITION §5, C3).

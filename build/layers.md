# The layers

**Status** · APPROVED by Bob 2026-09-25 (TRANSITION.md T4), as drafted by BOB #37 the same day with his rulings (below), including the Understanding layer. AMENDED by Bob 2026-09-26: the Action layer (layer 9, below), splitting the old layer 8 into Publication (8) and Operations (10); 11 layers, 58 modules. A view of it is `layers-view.html`, beside this file. The modules, in their total order, are in `modules.json`. Sources: the construct map (`BIO_System_Design.md` §3–§4) and the code as it stands (imports measured 2026-09-25). Each layer's modules may use modules earlier in the order only (P4). AMENDED at T17's close, 2026-09-30 (K608, K617): layer 9's contract and row, action-clocks (split from actions), action-plans. AMENDED at T18's opening, 2026-09-30, by a worker for BOB #75 (K585 (4), K589, K617, K624): `record-grammar` heads layer 1, before `legacy-checks` (Helper modules, below); `control-plane` split three ways for size, `op-declarations` and `admission` directly before it in layer 11 (below). AMENDED on `tranche/T18`, 2026-09-30, by a worker for BOB #75 (K617, K649 (1)): `capture` and `ai-runs` split for size, `acquisition` directly before `capture` in layer 3 and `run-rules` directly before `ai-runs` in layer 6 (below). AMENDED on `tranche/T18`, 2026-09-30, by a worker for BOB #75 (K617, K651): `publication` split four ways for size, `case-grammar` directly before it and `public-read` and `project-stage` directly after it in layer 8 (below). AMENDED on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K653 BOB-2): `docprofile` split for size, `site-profiles` directly before it in layer 1 (below). AMENDED on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K636 BOB-1, K637, K653 BOB-2): `membership` split for size, `credentials` directly after it in layer 2 (below). AMENDED on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K653 BOB-2): the catalogue's inquiry grammar taken from `legacy-checks` as `inquiry-grammar`, directly before `inquiry` in layer 6 (below). AMENDED on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K653 BOB-2): the catalogue's action share and `actions`' grammar taken as `action-grammar`, directly before `actions` in layer 9 (below). AMENDED on `tranche/T19`, 2026-10-01, by a worker for BOB #80 (K617, K653 BOB-2, K749): the composition root and the plane's deployment config taken from `legacy-store` and `legacy-index` as `plane`, directly after `control-plane` in layer 11 (below). AMENDED on `tranche/T22`, 2026-10-02, by BOB #91 (K617, K1024): `publication` split a second time, `corpus-export` directly before it in layer 8 (below). AMENDED on `tranche/T25`, 2026-10-02, by BOB #101 (K617, K1193, K1219; N512, N513): `provenance` split for size, `attestation` and `provenance-routes` directly after it in layer 3; `extraction` split for size, `reading-pipeline` directly before it in layer 4. AMENDED by a worker for BOB #103, 2026-10-02 (N520; K1256, K1257; DEC-116, DEC-100): `docket`, a new product module, directly after `publication` in layer 8 (below). AMENDED at T28's opening by a worker for BOB #104, 2026-10-03 (N519, N520; K1256, K1257, K1268, K1277; DEC-112): `case-checker` and `case-import`, new product modules, directly after `ratification` in layer 8 (below). AMENDED at T28's opening by a worker for BOB #104, 2026-10-03 (N522; K1273; DEC-96 items 1, 4): `accepted-work`, a new product module, directly after `inquiry-grammar` in layer 6 (below).

| layer | name | constructs (System Design §3) | contract | modules |
| --- | --- | --- | --- | --- |
| 1 | Foundations | 5, and shared libraries | No access to the record. Pure libraries, or standalone workers that take bytes and return results. | record-grammar, jurisdictions, test-support, runtime-limits, signatures, bundler, id-spaces, subresources, ooxml, office-readers, odf-reader, pdf-reader, format-registry, text-chain, site-profiles, docprofile, image-codecs, pdf-pixels, pdf-worker, ocr-worker |
| 2 | Record and authority | 3, 1 | Owns storage, id allocation, leases, audit and purge; the member, the capability and the fence; the one write path that promotes and checks a bundle. | record-core, membership, credentials, promotion |
| 3 | Intake and provenance | 2 | Material enters only with provenance; a hop attests bytes, URL and time, no more. | host-governor, provenance, attestation, provenance-routes, capture-sources, acquisition, capture, sources |
| 4 | Content | 4, 5 | Readings are made from captured bytes; content is the reference to a part of a document, minted over them. | calibration, reading-pipeline, extraction, content |
| 5 | Meaning, bias and retrieval | 6, 7, 9 | Everything derived over content, with its grade; the four-level search, which says at which level absence was found. | entities, connections, progressions, bias, observation-log, query-language, retrieval |
| 6 | Inquiry and the assistant | 8, 11 | The inquiry and its legs, findings, basis versions and strength; the AI finds, pursues, extracts and checks, and never attests or concludes. | inquiry-grammar, accepted-work, inquiry, citation, basis-versions, strength, contradiction, run-rules, ai-runs, run-productions, capture-requests, skills, agent-worker |
| 7 | Understanding | Content Framework §12, and 8 | What the investigation below has established: the group's intent, with progress computed against the record, and which findings still stand when their basis changes. | intent, reevaluation |
| 8 | Publication | 13 | What the group stands behind leaves one way. | case-grammar, corpus-export, publication, docket, public-read, project-stage, network-notices, ratification, case-checker, case-import, case-authoring, review |
| 9 | Action | 16 (`BIO_Action_v0_1.md`); Functional Architecture "Layer 3: Action"; Design Requirements §7–§8 | An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record; the group plans and decides every act, the AI proposes and prepares and never files or sends; compliance is recorded as carefully as noncompliance; every deadline names its basis. | local-facts, standards, conformance, consequences, action-grammar, actions, action-clocks, filing-templates, filings, escalation, action-plans |
| 10 | Operations | 10, 14 | The instance keeps itself current unattended, and watches the actions' clocks and the government's response. | monitoring, link-sweep, scheduler |
| 11 | Interface and distribution | 12, 15 | The ops, the member surfaces and the installer. Nothing below depends on them. | affordances, tasks, queue-producers, queue, instance-setup, op-declarations, admission, control-plane, plane, legacy-ui, installer |

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
| legacy-checks | *(retired at T19's close, 2026-10-01, K858: emptied and deleted by control-plane R43)* `bio-plane/checks/bio-checks.mjs` | 16,591 | It is the whole check catalogue, one set per construct, and it imports nothing. It was first in the order because modules in every layer use it; since T18 it is second, after `record-grammar`, the shared grammar it re-exports while importers re-point (K585 (4)). Each extracted module takes its own checks, which are its invariants. |
| legacy-store | *(retired at T19's close, 2026-10-01, K858: emptied and deleted by plane R8; its residue held in `src/plane/held.mjs` until T20, then registered by each owner and the file deleted (plane R10, K842, K923))* `store.mjs`, `schema.mjs` | 54,618 and 4,287 | It is last among the store-backed modules, so extraction runs bottom-up: an extracted module never calls back into it, and it calls the extracted modules. |
| legacy-index | *(retired at T19's close, 2026-10-01, K858: emptied by its extractions; `tools/` deleted by LEGACY-INDEX #12; `src/index.mjs` left as plane's one-line re-export until bundler's T20 job (K846))* `index.mjs` | 13,438 | It is after legacy-store, because it imports it. |
| legacy-ui | `civicos-ui/` | 26,489 in `app.html` | It talks to the plane over HTTP only. |
| legacy-tests | *(retired at T22's opening, 2026-10-01, K1006, N478: its 11 paths deleted, its 75 files re-owned by their modules, `plan/draft-legacy-tests-recut.md` §2)* `bio-plane/test/`, `civicos-ui/test/` and the UI's two check scripts | the old battery | Added 2026-09-26 by BOB #38 (P17). The old battery tests every layer, so it is last in the order and may use anything earlier. The extracted modules' own tests live in `bio-plane/test/m/<module>/`, which the most specific path assigns to each module. It shrinks as extraction replaces it (C5) and is retired when empty. |

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

Bob: once a group publishes a finding, the finding may claim that the government has acted out of conformance with a regulation, a court decision, stated public policy or another requirement. **The Action layer holds the modules that support the group in acting to bring the government back into conformance.** The canon already specifies this work: Functional Architecture v3 "Layer 3: Action" (escalate, communicate, track toward resolution) and "Function 1: Compare actions to standards"; Design Requirements v2 §7 (the six-stage escalation protocol) and §8 (evidence separated from legal strategy, three risk tiers); Roadmap v5 §8 (evidence packages); State Rules v1.5 §4.4 (the Action object and its clocks). Since 2026-09-30 the layer's level-1 home is `BIO_Action_v0_1.md` (System Design §3 row 16, canon whole, K608), which gathers these and Case Making's action plan (K590). T4 compressed all of it into one module, `actions`, inside layer 6. Nothing uses `actions` today, so it can move up freely.

**Where it sits.** After publication, because a finding is published before a group acts on it, and a filing leaves the instance the way publication delivers. Before monitoring, because monitoring watches the actions' clocks and the government's response. So the old layer 8 split, and the order is: 7 Understanding · **8 Publication** (publication) · **9 Action** · **10 Operations** (monitoring, scheduler, legacy-store) · 11 Interface and distribution.

**Contract.** An action rests on the record, and one asserting a breach rests on a published finding and on a standard held in the record. The group plans and decides every act; the AI proposes and prepares, and never files or sends. Compliance is documented as carefully as noncompliance. Every deadline names the statute, order or commitment it comes from. *(Amended by Bob 2026-09-29/30, K590 (1), (5), (10), D1; K608.)*

| module | what it does | source |
| --- | --- | --- |
| standards | The conformance requirements a government act is measured against: a statute, regulation, court decision or order, adopted policy, or public commitment. Each is held as content in the record, with its citation and the period it was in force. Which laws and bodies exist comes from the jurisdiction profile. | Functional Architecture, Function 1 and the Legal/Policy Lookup skill |
| conformance | The determination that a named government act is compliant, noncompliant or unclear against named standards, resting on published findings. Unclear sends the question back to inquiry. A compliant determination is recorded too. It does not rank significance; that is a member's judgment, made with the consequences in front of them. | Functional Architecture, analysis outputs and Function 4 |
| consequences | What the breach did, and to whom: who or what is affected (a class of people, a fund, a program, a service), the measure (money, benefits, services, time, counts) and the period. Computed from the record where the record holds the figures, each with its basis and grade. Where it cannot be computed it is marked undetermined, and the module supports members in determining it from the record together with their own assessment, each part recorded as what it is (computed, or a member's assessment, with who made it and on what). That a harm follows from the act is itself a finding that needs evidence, never assumed. People are counted as a class or named in their official role, never singled out as individuals. Escalation's exit condition ("consequences addressed") is checked against it. | Bob, 2026-09-26; Roadmap OP6; Functional Architecture Function 4 ("informed by context, scale, pattern, and consequences") |
| actions | The Action object (moved from layer 6): kind, risk tier, counterparty, clock entries each with its basis, lifecycle, correspondence. It rests on a conformance determination. | State Rules §4.4; carries REC-215, REC-201, D-689, D-579 |
| action-clocks | Split from `actions` (K617, for size; no requirement changed meaning): an action's clock entries read across actions (the pending and the overdue), the entries proposed from the profile's deadlines, counted in calendar or business days on the profile's holiday calendar, and the reminders a member asks for on them (DEC-94), fired as asked. | State Rules §4.4; `BIO_Action_v0_1.md` §4 rule 5; K613–K615, K617 |
| filings | What the group sends: Tier 1 and 2 filings pre-filled from the record; for Tier 3, a **counsel packet** for counsel the group names: the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim. It is marked as prepared for counsel's review, is never published, and is never in a form that can be filed as it stands. Counsel drafts and files. The kinds, templates and venues come from the jurisdiction profile. | Design Requirements §8, Roadmap §8 |
| escalation | The stages (discovery and documentation, notification, clock starts, response evaluation, legal tools, sustained attention, and political accountability, ruled below), each with entry and trigger conditions; the next stage is proposed when its trigger is met, and a member advances it. It ends only when compliance is restored and the consequences are addressed. | Design Requirements §7, Functional Architecture Functions 3 and 5 |
| action-plans | A project's working material for deciding what to do about one or more matters, suspected (an inquiry still open) or determined (a determination's outcomes): options the assistant suggests or a member adds, each bound to the matters it serves; the member's choice; up to three scenarios over time with checkpoints a member judges; and the link from each started option to the action it created. No catalogue of options, no budgets, never published; a member closes it with a reason. | `BIO_Action_v0_1.md` §3–§4; Bob, 2026-09-29 and 2026-09-30 (K590) |

Uses, all earlier in the order: `standards` uses jurisdictions, record-core, content; `conformance` uses standards, inquiry, strength, reevaluation, publication; `consequences` uses conformance, inquiry, strength, content; `actions` uses conformance, consequences and its current uses; `filings` uses actions, standards, publication, jurisdictions; `escalation` uses conformance, consequences, actions, filings. `action-clocks` uses actions, jurisdictions, retrieval, promotion; `filings` gains action-clocks. `action-plans` uses conformance, actions, action-clocks, escalation, filings, standards, inquiry, strength, jurisdictions. `monitoring` gains actions and escalation, and action-clocks at the split.

**Bob's rulings on the draft (2026-09-26).**
1. *Significance.* Consequences are computed from the record where it holds the figures; where they cannot be, they are marked undetermined, and members determine them from the record and their own assessment (the `consequences` row above). Significance, whether a breach warrants action and how urgently, stays the member's judgment.
2. *Tier 3.* `filings` prepares a counsel packet for named counsel (the `filings` row). This amends Design Requirement 8.
3. *Political stage.* Escalation gains stage 7, **political accountability**, entered from response evaluation or legal tools and aimed at compliance restored and consequences addressed: asking elected officials to act on the breach, oversight and audit requests, testimony, and legislation that restores or enforces an existing requirement. Policy advocacy and candidate support stay out; Operational Principle 1 stands. This amends Design Requirement 7.

**What it changed.** `modules.json` gained five modules and moved `actions`; the layers renumbered to eleven (58 modules). Layer 1 is unaffected except `jurisdictions`, whose profile gains the sources of standards, the offices addressed, the action kinds with their tiers and venues, and the legal deadlines these modules read: R23–R30 of its requirements, approved by Bob 2026-09-26, built with the module itself (entries N1 and N11).

**The Action layer's fold (T17's close, 2026-09-30; K590, K597, K600, K608, K611, K613–K615, K617).** Bob approved the Action design (`BIO_Action_v0_1.md`) as canon and ruled the layer a priority (K608 (2)). The contract above was re-worded; `actions` was split for size into `actions` and `action-clocks` (K617), and `action-plans` joined the layer, last; `actions`, `filings`, `escalation`, `monitoring`, `scheduler`, `queue`, `queue-producers`, `skills` and `jurisdictions` gained requirements (`build/plan/action-fold/deltas/`, with the reminder rulings K613–K615).

## Layer 11: the control-plane split (K617, K624 (1), (2); T18's opening)

`control-plane` passed the 4,000-line mark (6,578 lines at T17's close), and a two-way split left ~4,470, so it is split three ways with no requirement changing meaning; each new module is a product module with no `from` (`from` names a legacy module only), built by copy in its own job and merged early, and `control-plane`'s job, after them, deletes its copy and re-points (K624 (1)).

| module | what it does | source |
| --- | --- | --- |
| op-declarations | What each op is: its spec (the classes that reach it, whether it mutates), the act lists that drive the stamps and the fences, the two session sets, the capability each op needs, the recorded decisions that a verb is not a person's, and the act gate read from those tables. Pure data. | `control-plane/ops.mjs`; `control-plane` R31, R34 |
| admission | Who may call an op: the namespace gates, the binding classes, the agent credential's resolution, confinement and task scope, the session gate, the class and capability gates and the bearer fences, with their refusal rows. | `control-plane/index.mjs` (`classify`, `scopeFor`, the gates, `sessionOpGate`, the admission region); `control-plane` R3–R14, R19 |
| control-plane | The door: routing, the stamps, the answer's decoration and envelope, the store's dispatch, the pull. | what remains |

Uses: `op-declarations` uses affordances (`decorate`, for the act gate); `admission` uses runtime-limits, membership and op-declarations; `control-plane` gains both.

## Layers 3 and 6: the capture and ai-runs splits (K617, K649 (1); T18)

`capture` (3,704 lines) would pass the 4,000-line mark with the catalogue shares its acquisition act needs, and `ai-runs` (4,204) is past it, so each is split in two with no requirement changing meaning. Each new module is a product module built by copy in its own job and merged early; the source module's job, after it in the same layer, deletes its copy and leaves a re-export for importers not yet re-pointed (K624 (1)).

| module | what it does | source |
| --- | --- | --- |
| acquisition | The acquisition act: fetches a document (directly, through a Drive export, from a web archive, or rendered), hashes and stores it as it arrives, records the receipt, profiles it, captures a page's supporting files, requests co-attestation and answers the provenance document; the one CivicOS user agent. It reaches what `capture` keeps about sources and sites through the capture store its caller hands in. `from` `legacy-checks`: C-83, C-48.1–C-48.7, C-28.13 and the user agent. | `capture/acquire.mjs`; `capture` R1–R7, R9–R14, R16–R20, R33–R36, R41, R42, R60–R62 |
| capture | What capture keeps: the evidence store, reachability, site assets, links and chrome, sessions, the platform's ceiling, the render allowance, the event queue, the doorbell; its `acquire` hands its store to `acquisition`. | what remains |
| run-rules | The AI run's rules without a store: bounds, endings, statuses, the checks on bounds, consumption, principals, contexts and skill versions, the state's size, the one deployment order, and the run's refusal rows. No `from`. | `airun.mjs`, `ai-runs/checks.mjs`, `deployment.mjs`, `skill-version.mjs`; `ai-runs` R1–R8, R44 |
| ai-runs | The run itself: open, tick, close, the one exit, reaping, waking, reads, the surfacing step and the bounds' spending. | what remains |

Uses: `acquisition` uses jurisdictions, subresources, odf-reader, format-registry, docprofile, record-core, host-governor, provenance and capture-sources; `capture`, `extraction`, `capture-requests`, `ratification`, `monitoring` and `instance-setup` gain it. `run-rules` uses observation-log; `ai-runs`, `run-productions`, `capture-requests`, `skills`, `agent-worker` and `control-plane` gain it.

## Helper modules (BOB #38, 2026-09-26, under P17)

Found by the architecture check's first run: shared helpers that later modules used from the top of the order.
- **test-support** (layer 1): the test sandbox and stdio guard (`bio-plane/test/sandbox.mjs`, `stdio.mjs`) that the workers' tests and the kept suites share.
- **bundler** (layer 1): `bio-plane/scripts/fleet-bundle.mjs` and its `provenance.mjs`, which build the plane and the three workers.
- **record-grammar** (layer 1, first in the order; K578, K585 (4), K589, formed at T18's opening): the record's shared grammar below every module that reads or writes a document (the id and type vocabulary, the restricted front-matter parser, canonical JSON, actor identity, the grade vocabulary, the public-locator test and the one SHA-256), moved out of `legacy-checks` in stages, each part whole, the catalogue re-exporting it until its importers re-point (PROCESS-MECHANICS §12.2). It holds no store, no network and no clock.

Declared uses the code already had were added (affordances, query-language and skills on legacy-checks; agent-worker on runtime-limits, legacy-checks, query-language, ai-runs and skills; ocr-worker on legacy-checks and text-chain), `skills` moved after `ai-runs`, and `ai-runs`'s stale use of `skills` was removed. `not_product` in `modules.json` lists the paths no module owns.

## Paths that are not product

`docs/`, `requirements/`, `build/`, `tools/`, `release/` and the old process's `.claude/` hooks are not modules. `release/` is produced by the distribution process (mechanics §11). `tools/` is the old process's tooling, retired at T7 (TRANSITION §5, C3).

## Layer 8: the publication split (K617, K651; T18)

`publication` (6,185 lines) is past the 4,000-line mark, and neither a two-way cut (~4,345 left) nor a three-way one (~4,080) gets it under, so it is split four ways with no requirement changing meaning (seam read `build/extraction/publication-split.md`). Each new module is a product module with no `from`, built by copy in its own job and merged early; `publication`'s job, after them in the layer, deletes its copies and re-exports `case-grammar` (K624 (1)). Neither later module owns a table: each reads `publication`'s under its R40 and calls only its public services (R53–R55).

| module | what it does | source |
| --- | --- | --- |
| case-grammar | The case document's grammar, pure: the formats and their predicates, the `/5` blocks and tension section, the section locators and the attribution run's text, the signed citations, and the edge set a finding rests on. | `publication/checks.mjs` 14–48, `index.mjs` 188–320, `blocks.mjs`, `tensions.mjs`; `publication` R20 |
| publication | Every table and every write: the case document and relation, the case-level reads, attribution, export, the commits, and the services `public-read` calls. | what remains |
| public-read | The published record served without a credential, and its packaging: verify, the lists, the published case, the manifest, published bytes, the Worker's routes and relays, the container, the in-band quartet, the evidence-package block. | `publication/index.mjs`' public reads, `worker.mjs`, `container.mjs`, `inband.mjs`; `publication` R8–R11, R13, R15 (part), R16, R36, R48 |
| project-stage | A project's stage, what each stage has earned and needs, and its work products' readiness, derived at the read. | `publication/index.mjs` 94–169, 1330–1544; `publication` R44–R47, R49 |

Uses: `case-grammar` uses legacy-checks; `publication` gains it (and drops signatures and ooxml once the Worker files leave its paths); `public-read` uses legacy-checks, signatures, ooxml, case-grammar and publication; `project-stage` uses legacy-checks, record-core, membership, inquiry, basis-versions and publication; `ratification`, `filings` and `control-plane` gain `public-read`.

## Layer 8: publication's second split (K617, K1024; T22)

`publication` (3,690 lines) would pass the 4,000-line mark with R32's verifying import (A42) and its T22 shares, so the working-corpus export moves out with no requirement changing meaning (seam map `build/extraction/corpus-export.md`). `corpus-export` is a product module with no `from`, built by copy in its own job and merged first in the layer; `publication`'s job, after it, deletes its copy, creates it, and keeps its ops `export` and `exportlog` as delegates (K624 (1)). It owns the table `export_log`.

| module | what it does | source |
| --- | --- | --- |
| corpus-export | The verified working-corpus export, its append-only log, and the verifying import (R3, not yet met). | `publication/index.mjs` 89–94, 1919–2007, `schema.mjs` 566–578, 592; `publication` R18, R19, R32, R31 (part) |

Uses: `corpus-export` uses record-grammar, record-core, provenance and connections; `publication` gains it.

## Layer 8: network-notices (DEC-111, K1019, K1031, K1100; T23's opening, K1113)

A new product module, not a split: a project's owner tells the network that the group is working on something, and the copy keeps the notice honest (`build/requirements/network-notices.md`, from `plan/draft-network-notices.md`). It has no `from` and is created by its own T23 job at `bio-plane/src/network-notices/`; its paths and tests are added to its `modules.json` entry by that job (K1043's form). It sits directly after `project-stage` (closing needs `projectStage`) and before `ratification` and `case-authoring` (they call `openSeals` and `noticeReferenceOf`).

| module | what it does | source |
| --- | --- | --- |
| network-notices | "Working on" notices: owner-signed revisions, instance-signed attestations (activity level, cases, seals, closing or lapse), weekly timestamped seals opened at publication, and the group's public signing keys, served on the public path. | new (DEC-111; `BIO_Publication_v0_1.md` §5B) |

Uses: `network-notices` uses record-grammar, signatures, record-core, membership, credentials, promotion, host-governor, provenance, capture, publication, public-read and project-stage; `ratification`, `case-authoring`, `scheduler`, `queue-producers`, `control-plane` and `plane` gain it. (Fold 1a, K1094, N486: `monitoring` gains `project-stage`.)

## Layer 8: docket (DEC-116, DEC-100; N520, K1256, K1257)

A new product module, not a split: each published case's docket, the dated entries beside it that grow while its signed editions never change (`build/requirements/docket.md`, from `plan/draft-T24-dec116.md`). It holds the three shelves, the manager's signed public entries, the required core, standing, take-back and the withdrawal of an edition, and answers the public shelves and a feed per case. It has no `from` and is created by its own T27 job at `bio-plane/src/docket/` (tests `bio-plane/test/m/docket/`); its paths and tests are added to its `modules.json` entry by that job (K1043's form). It sits directly after `publication` (it reads the editions, under `publication` R40) and before `public-read` (which serves the docket, its feed and a withdrawn edition's stamp directly) and `network-notices` (which lists the keys that signed docket entries). No existing module holds it under 4,000 lines (P6): `publication` measures 3,633.

| module | what it does | source |
| --- | --- | --- |
| docket | A case's docket: record entries any member files, public entries the manager signs (listed, reactions elsewhere), the required core as To-dos, standing, take-back by a later entry, withdrawal of an edition (never lifted), the public read and an Atom feed per case. It sends nothing, and no entry is evidence. | new (DEC-116, DEC-100; `BIO_Publication_v0_1.md` §5D) |

Uses: `docket` uses record-grammar, signatures, record-core, membership, credentials, promotion, provenance, attestation, acquisition, entities, inquiry, reevaluation, case-grammar and publication; `public-read`, `network-notices` and `plane` gain it (and, proposed in `plan/t27-dec116-shared.md`, `queue-producers`, `affordances`, `op-declarations` and `control-plane`). `reevaluation` (layer 7) reads it only through the registration it offers (its R30). Membership's `MODULE_ORDER` (its R83) is re-pinned to the new order in T27's layer 2.

## Layer 8: case-checker and case-import (DEC-112, DEC-96; N520, K1256, K1257)

Two new product modules, not splits (`build/requirements/case-checker.md`, `case-import.md`, from `plan/draft-T28-dec112.md`). Each has no `from` and is created by its own T28 job at `bio-plane/src/<module>/` (tests at `bio-plane/test/m/<module>/`). That job adds its paths and tests to its `modules.json` entry (K1043's form). `case-checker` sits directly after `ratification`, because it runs `ratification`'s pure case-document checks, the same check code CivicOS runs. `case-import` sits directly after `case-checker`, because it recreates through it, and before `case-authoring`, so a case can state that a finding rests on another group's accepted work (DEC-96 item 4; `case-authoring` R50–R53, N522). No existing module holds either under 4,000 lines (P6): `ratification` measures 3,973 and `case-authoring` 3,421.

| module | what it does | source |
| --- | --- | --- |
| case-checker | The one checker of a case file: integrity, signatures, passages, grades recomputed at the stated method version, the bar, the publication checks, presentability and the complete edition, giving each finding Recreated, Recreated in part or Did not recreate. It is a pure function, and also a standalone offline program with the readable format specification, both served on the public path. | new (DEC-112 (3)(6); `BIO_Publication_v0_1.md` §5C) |
| case-import | Import of another group's case file into a read-only project per source case and lens, with editions side by side; recreation per finding; the importing group's own bar; completion by a fetched document; acceptance of an edition (only for recreated findings, gaps stated), its withdrawal, and flags, all reasoned. | new (DEC-112 (6), DEC-96, DEC-92; §5C) |

Uses: `case-checker` uses record-grammar, signatures, bundler, content, strength, case-grammar, public-read and ratification. `case-import` uses record-grammar, record-core, membership, strength, case-grammar and case-checker, and (N522) inquiry-grammar, accepted-work and reevaluation. `case-authoring` gains `case-import` (N522). `control-plane`, `op-declarations`, `affordances` and `plane` gain `case-import` in their L11 jobs. Membership's `MODULE_ORDER` (its R83) is re-pinned to the new order in T28's layer 2.

## Layer 6: accepted-work (DEC-96 items 1, 4; N522)

A new product module, not a split (`build/requirements/accepted-work.md`, from `plan/draft-T28-n522.md`). It has no `from` and is created by its own T28 job at `bio-plane/src/accepted-work/`. A group's finding may rest on another group's finding it has accepted (DEC-112 (6)). That work is held by `case-import` in layer 8, which `inquiry`, `basis-versions`, `strength`, `reevaluation` and `publication` may not use (P4). This module declares the one registration `case-import` fills, the read facade those modules use, and the check that a leg on an imported finding names an edition whose acceptance is in force. It sits directly after `inquiry-grammar`, whose reference spelling it reads, and before `inquiry`, which measures 3,882 lines and cannot hold the seam (P6).

| module | what it does | source |
| --- | --- | --- |
| accepted-work | The registration `case-import` fills; reads of an imported finding's published pair and acceptance, its open flags and the withdrawals; the promotion check refusing a leg on work not accepted at the named edition. No table. | new (DEC-96 items 1, 4; DEC-112 (6)) |

Uses: `accepted-work` uses record-grammar, membership, promotion and inquiry-grammar; `basis-versions`, `strength`, `reevaluation`, `publication` and `plane` gain it.

## Layer 1: the docprofile split (K617, K653 BOB-2; T19's opening)

`docprofile` (4,060 lines) is split along the seam between what a capture's host and bytes are and what kind of document it is, with no requirement changing meaning. `site-profiles` is a product module with no `from`, built by copy in its own job and merged early; `docprofile`'s job, after it, deletes its copy and imports site-profiles (K624 (1)).

| module | what it does | source |
| --- | --- | --- |
| site-profiles | The host-stack axis: the four stack recognisers and `identify`, the one recogniser registry and confidence ladder, the three digests, `fidelity`, the profile record, and the event catalogue. | `docprofile/index.mjs`, `recogniser.mjs`, `events.mjs`, `handlers/`; `docprofile` R1–R3, R7–R10, R26–R28 |
| docprofile | The content-type axis (`doctypeFor`, the content types), the layered `assess`, `readText`; `registry.mjs` stays its facade and re-exports site-profiles' names, so its importers need no re-point. | what remains |

Uses: `site-profiles` uses nothing; `docprofile` gains it.

## Layer 2: the membership split (K617, K636 BOB-1, K637, K653 BOB-2; T19's opening)

`membership` (3,890 lines) is split along the seam between who the members are and what each may do, and the credentials a member or the instance holds, with no requirement changing meaning. `credentials` is a product module after membership, the case K624 (1) did not meet (rule 3, K653 BOB-6): membership's job builds the seam and merges early, credentials copies its code and merges early, then membership's same job deletes its copy, keeping `attestingKeys` and `aiCredentialLook` as named copies for the callers that re-point later in T19 (K636 BOB-1). Its `from` is `legacy-checks` and `legacy-store` (K636 BOB-2): it takes the catalogue's `SIGNER_ENROLMENT_CHECKS` (C-63) and `AI_CREDENTIAL_CHECKS` (C-29), and the store's delegates are rewired to it (§12.2).

| module | what it does | source |
| --- | --- | --- |
| membership | Members, administrators, invitations and enrolment, capabilities, expertise, projects as working groups, sight and the fence. It reaches sessions and keys only through R79's `onRevoked`, and reads the founder's claim through a registration. | what remains |
| credentials | Sessions and passwords (the founder's claim, `login`, `session`, `setPassword`, `bootstrapState`), signer keys (`signerAdd` … `signerSet`, `signerList`, the self-registered key, `attestingKeys`), AI credentials (`aiCredentialMint` … `aiCredentials`), with their tables. It reads `members` only through membership's services. | `membership/index.mjs`, `schema.mjs`; `membership` R1–R3, R25–R30, R62, R70, R72, R73, R89–R91 |

Uses: `credentials` uses record-grammar, legacy-checks, record-core and membership; capture, ai-runs, publication, ratification, admission and control-plane gain it when each re-points in its T19 job.

## Layer 6: inquiry-grammar (K617, K653 BOB-2; T19's layer-6 fold)

Inquiry's catalogue share (about 1,400 lines) would take `inquiry` (3,649) past the 4,000 mark, so it lands in a module of its own, taken straight from `legacy-checks` (rule 3: `from: legacy-checks`, moved, not copied), with no requirement changing meaning. It registers through record-core's grammar seam (record-core R67) into record-grammar R28's slots, so the catalogue's `LEGACY_GRAMMARS` stops filling C-6.1 and C-15.1 and the catalogue's C-2.8 arm leaves (rule 2). `inquiry`'s grammar face (`inquiry/grammar.mjs`) re-exports its names, so inquiry's callers need no re-point.

| module | what it does | source |
| --- | --- | --- |
| inquiry-grammar | The inquiry document's grammar: the C-2.8 entry requirements and division block, the leg grammar (grounds, testimony, earned and inherited legs, the leg's part), C-6.1's supersession and division-disclosure arms, C-15.1's recheck coverage, C-54.1's lead checker, and the rows C-33.13, C-33.22, C-33.23, C-32.7 and C-32.8 inquiry's acts mint. Pure. | `checks/bio-checks.mjs` (map §4.2); `inquiry` R2, R3, R38's share |
| inquiry | The inquiry's lifecycle, legs and acts, unchanged; its grammar face re-exports inquiry-grammar's names. | what remains |

Uses: `inquiry-grammar` uses record-grammar, legacy-checks, text-chain, record-core (`registerGrammar`), content, connections (`themeLegFindings`) and observation-log (`LEAD_ID_RE`); `inquiry` and `reevaluation` (`GROUND_LABEL_RE`) gain it.

## Layer 9: action-grammar (K617, K653 BOB-2; T19's layer-9 fold)

`actions` is 3,846 lines after T18, and its catalogue share (about 450 lines) would take it past the 4,000 mark, so the action document's grammar lands in a module of its own, directly before `actions`, with no requirement changing meaning: the catalogue's action share is taken straight from `legacy-checks` (rule 3: `from: legacy-checks`, moved), and `actions/checks.mjs`, which imports only the catalogue and `jurisdictions`, is copied, then deleted by `actions`' job. Whether an action's write lands stays `actions`': its promotion step and acts call the grammar's functions and mint its rows.

| module | what it does | source |
| --- | --- | --- |
| action-grammar | The action vocabularies (kinds, risk tiers, basis-leg kinds, directions, resolutions, the records-request lifecycle's stages and outcomes), C-2.10's arms over an action's document, C-6.1's `responds_to` arm, C-11.1, the quote and lifecycle grammars (C-72, C-94), the request-for-comment rule (DEC-13), the readers `actions`' read answers with, and the rows `actions`' acts mint. Pure. | `checks/bio-checks.mjs` (C-2.10, C-94 and the vocabularies); `actions/checks.mjs` (copied); `actions` R4, R20, R21's grammar, R37, R38, R40, R44 |
| actions | The action record: its write, acts, reads and tables, unchanged; it reads its grammar from `action-grammar`. | what remains |

Uses: `action-grammar` uses record-grammar, legacy-checks, jurisdictions (`LAW_LEVELS`), connections (`themeLegFindings`) and inquiry-grammar (`leadLegFindings`); `actions` and `action-clocks` (`lawProposalLabel`) gain it; `affordances` and `instance-setup` read its vocabularies when their layer-11 jobs re-point.

## Layer 11: plane (K617, K653 BOB-2; T19's layer-11 fold)

When the catalogue, `store.mjs`, `schema.mjs` and `src/index.mjs` are emptied (T19's finish report), what is left of them is no module's construct: the Durable Object class that builds every module on one storage in the modules' order and runs their migrations, the alarm handed to `scheduler`, the one route map, and the Worker's entry that binds the door to the instance. That composition root, and the deployment config that names its entry, land in a module of their own, directly after `control-plane` (the last module whose routes and hooks it composes), with no requirement changing meaning: `control-plane` R35 (the class) moves to it, and the rest is today's behaviour of `store.mjs`' constructor, `#migrate`, `alarm`/`onAlarm` and `src/index.mjs`' exports, stated. It is rule 3's later-new case: `control-plane` and `legacy-store` build their seams and merge early, `plane` copies, then `control-plane`'s wrapper (`dispatch.mjs`' `Store extends LegacyStore`) goes, then `plane` deletes `store.mjs`, `schema.mjs` and `src/index.mjs`.

| module | what it does | source |
| --- | --- | --- |
| control-plane | The instance's two doors (routing, stamps, envelope, the store's dispatch frame), unchanged, less the class; the testimony slot's place among the promotion steps once `legacy-store`'s step goes (provenance R52, K764). | what remains |
| plane | The composition root: the Durable Object class, construction order, the migration pass, the alarm, the route map spreading every module's ops map through `control-plane`'s `dispatch`, and the Worker's entry; the deployment config (`wrangler.jsonc`, `package.json`, `package-lock.json`, `.gitignore`, `.dev.vars.example`). | `store.mjs` (constructor, `#migrate`'s frame and order, `alarm`, `onAlarm`, `#ownNamespace`, `#nowMs`, the route frame); `src/index.mjs` (`export default`, `export { Store }`, `bindPublishedPlane`'s hand-over); `control-plane/dispatch.mjs`' `Store` (R35); `legacy-index`'s config paths |

Uses: `plane` uses every module today's composition root reaches (`store.mjs`' constructor, `src/index.mjs`, `dispatch.mjs`), less the legacy ones; no module uses it. `legacy-index` keeps `src/index.mjs`, `tools/` (70 files) and `bio-plane/scripts/walkfloor.mjs`, `walkfigure.mjs` (K749) until its layer-11 job empties them.

## Layer 10: link-sweep (N506, K617, K1153, K1159; T24's opening)

`monitoring`'s link sweep (its R53–R64, folded at T23's opening) is split into a module of its own, directly after `monitoring` and before `scheduler`, with no requirement changing meaning: `link-sweep` R1–R12 are `monitoring` R53–R64 in order, which `monitoring` retires as moved. `monitoring` provides the seam as stated services (its R65, R66): the host services the sweep runs under, and a registration by which `link-sweep` hands it, at composition, C-18.5's sweep arms, the R3 fence and its due sweeps for the slate, so `monitoring` never imports a later module. Its code moves from `bio-plane/src/monitoring/` (`sweep.mjs`, `sweep-match.mjs` and the sweep's share of `checks.mjs`, `schema.mjs` and `index.mjs`) to `bio-plane/src/link-sweep/` in its T24 job.

| module | what it does | source |
| --- | --- | --- |
| link-sweep | The ratified link sweep, split from monitoring (N506, K1159). | `monitoring/sweep.mjs`, `sweep-match.mjs`, the sweep's share of `checks.mjs`, `schema.mjs`, `index.mjs`; `monitoring` R53–R64 |

Uses: `link-sweep` uses record-grammar, subresources, format-registry, record-core, membership, promotion, capture, observation-log, capture-requests, project-stage and monitoring; `scheduler`, `queue-producers` and `plane` gain it.

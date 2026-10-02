# Plan: next (T23)

**Status** · Entries for the tranche after T22, written as T22 runs (P18). Every T22 left-out row below waits here with its one hard reason (P19) and is re-checked when T23 is planned.

## Entries

- N480 · 2026-10-01 · **membership**, **text-chain**, **provenance**, **inquiry**, **ai-runs**, **public-read**, **run-rules** (MEMBERSHIP #15 "seen, not changed", `jobs/T21/membership.md`:16; K1010): notes name the deleted plane `src/index.mjs` as the live home of a table, function or stamp; re-word to the module that holds it now or put in the past tense (N469's rule). Carried in T22 by each listed module's job (STARTs); public-read in L8.
- N481 · 2026-10-01 · **publication**, **case-grammar**, **case-authoring**, **public-read**, and a case-file import home (the UX stream's U21, DEC-112, Bob's question 30): a published case in three forms (the page's first line per finding naming its role and the project's bar; the complete edition in every case file; the case-file format as an open specification with a standalone checker; the method version inside the signed case; publication refused while a relied-on finding rests on material that cannot travel whole; off-the-record attestations; import into a new read-only project with recreation, acceptance gated on it). **Hard reason:** DEC-112 is on the design session's branch, not `main`; folded as requirements once it lands (manifest "Parallel work"), then placed by BOB (publication's split, K617, and DEC-111's new module bear on its home).

- N482 · 2026-10-01 · **bundler**, **subresources**, `not_product` (BUNDLER #5's J1 (2), K1020): `bio-plane/test/system/deploybindings.test.mjs`'s D-54 live arms read the text of `bio-plane/wrangler.jsonc`'s comment and `src/subresources.mjs`'s `SUBRESOURCE_CAP` source: ratchets on repository data no requirement states, and tests of source text (P7). State the guarded property as a requirement of its owner (subresources' cap; the deploy binding's), test it at that interface, then retire the source-text arms. **Hard reason:** a requirement must first say what is guarded (P5, P7); no current requirement does.

- N483 · 2026-10-01 · **plane**, **conformance**, **queue-producers** (K1024, the split): after `corpus-export` lands, the plane's op map spreads `corpusExportOps` and publication's `export`/`exportlog` delegates and constant re-exports retire; conformance's `record.test.mjs`:165 and queue-producers (`EXPORT_LOG_LIMIT_DEFAULT`, `exportLog`) call `corpus-export` directly. **Hard reason:** the plane and conformance have no T22 job (P8); the delegates keep them green meanwhile.
- N484 · 2026-10-01 · **record-core**, **provenance**, **corpus-export** (K1024): the export reads `bundles`' title and sha columns (beyond record-core R37), `register.bytes` (beyond provenance R48) and the `files`/`history`/`manifest` tables, which no requirement states; state each read contract in its owner's Provides. **Hard reason:** predates the split; a provider's requirement change is read by running jobs' users (P5), so it is written for T23.

- N485 · 2026-10-01 · **record-grammar** (L1), then **escalation**, **case-authoring**, **skills** (K1025): record-grammar R43, R44 (the `edition_statement` and `escalation_reason` proposal subjects; `proposalLabel` throws on an unknown subject), then escalation R29 (the pre-assembled opening reason, Bob's DEC-89 addition), case-authoring R39 and R38's `draft` arm, skills R31. **Hard reason:** the order (P4, P10): they arose with K1019 after layer 1 closed, and each needs record-grammar's new subject.
- N486 · 2026-10-01 · **network-notices** (new, L8; DEC-111, K1019) and **monitoring** R29 (the sweep): drafts `plan/draft-network-notices.md`, `plan/draft-monitoring-r29.md`, to Bob with their questions, each with a recommendation, then built in T23. **Hard reason:** Bob's (requirements and architecture, P17) and K1019 places the build in T23.

- N487 · 2026-10-02 · **legacy-ui** (K1030; `plan/t22-dec88-callers.md`): the UI sends DEC-88 acts without their new reason: `civicos-ui/app.html` `entityDraft` (~:17128), `progDefineDraft` (~:17767), `statementack` (:25792, :25802), and its tests `progression-revision.test.mjs`:208, `queue-recipients.test.mjs`:160, `statement-ack.test.mjs`:277, :342, `check-mock-envelope.mjs`:206. **Hard reason:** Bob's: UX (K633; manifest "Parallel work"). Those UI tests are red from each provider's merge, accepted by name (K1030).

- N488 · 2026-10-02 · **actions**, **control-plane**, the assistant-transcript home (DEC-113, U22): a litigation hold stops both scheduled deletions of stored assistant transcripts on every member's device for the action's project and the projects the statement names; a device checks before deleting and deletes nothing if it cannot check; the heavier release (its form states what will be deleted, administrators and placer told once); a held-project strip for members who can see it; the control plane's wipe of a real record refused while any hold is in place (supersedes actions R52's "Nothing here suspends a purge"). **Hard reason:** DEC-113 is on the design session's PR #7, not `main` (manifest "Parallel work").
- N489 · 2026-10-02 · **action-plans**, **queue-producers**, the glossary (DEC-114, U23): members see "Matters"/"matter" for what an action plan addresses; the internal term stays "subject". **Hard reason:** on PR #7, not `main`.
- N490 · 2026-10-02 · the action redesign (DEC-115, U24): `build/plan/action-design/start-and-send.html` and `surfaces.html`'s tier 2 and tier 3 panels bind content, step order and wording; the HANDOFF's approval line extended to them (BOB's, in `build/`). **Hard reason:** on PR #7, not `main`.
- N491 · 2026-10-02 · **publication**, **reevaluation**, **queue-producers**, a docket home (DEC-116 with DEC-100, U25; answers N470): withdrawal of a ratified edition (signed docket entry, published reason, stamp, never lifted, re-evaluation notices: reevaluation R16's missing trigger); the docket and its three shelves, the manager's core To-dos, the outside-response path, the private-name receipt, standing grants, the manager's signing step, the per-case feed. **Hard reason:** on PR #7, not `main`; its home is BOB's to place once it lands (publication's size, K1024).

## Left out of T22, carried here (62 rows, one hard reason each) (check)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | the CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | the 61.3 MB bound measured on a deployed plane |
| B3 | N34 (pdf-worker) | deployment | the JPX bound measured; PPM/PPT JBIG2 also waits on a fixture encoder; pdf-worker is 4,277 lines (P6) |
| B4, B5 | N144, N232 (affordances, legacy-ui, skills) | Bob's (UX) | K899 (2), Bob: "needed, but wait for the new interface" |
| A54 | skills R10 (recipes published) | Bob's | N144 |
| B13 | N470 (publication, reevaluation) | Bob's | K943 |
| B6–B10, B12, B18, B20 | N68, N70, N241, N371, N437, N467, N475, N477 (legacy-ui shares) | Bob's (UX) | K633 |
| C6, C7 | N389, N-A13 | Bob's (UX) | K633 |
| D2 | `civicos-ui/test/fixtures/fw18-doctypes.json`, `fw20-staff-directory.json` | Bob's (UX) | K1006 |
| I2 | legacy-ui (the module) | Bob's (UX) | ruling 4, K633 |
| B11 | N461 release share | deployment | the next signed release build, Bob's act |
| C9 | N471's release-embedded copies | deployment | with N461 |
| B16 | N473 (filings' `filing_templates` table) | deployment | dropped once the migration has run at every instance |
| C1 | office-readers R28/R29 retired | deployment | each migration runs at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | the newgroup installer deployed, with N336 | deployment | a signed release, Bob's act |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57's K5 run | measurement | a measured recommender run (K488); no model is reachable from a job |
| J7 | DEC-81's Grade A | Bob's | "its three decisions … are with Bob" (DEC-81's owed line); then a measurement (check) |
| C8 | the first profile's facts without a source | measurement | K925, K934, K941 |
| H13 | DEC-105: audience guidance | Bob's | DEC-105: "the research waits for its trigger" (check) |
| C5 | `PLN-` affordances, plan-page surface, joint action | Bob's | K608 (4), K600 (c) |
| A27 | monitoring R17 (an address's own frequency) | Bob's | no act holds it (REC-191's design gap): who sets it, by what new member act, is requirements and UX (P5, P17); `t22-check.md` question 5 (check) |
| A31 | monitoring R29 (sweeps) | Bob's | its own text: "Sweeps wait for a design of what a sweep's query is"; `t22-check.md` question 6 (check) |
| H1, H6b, J4 | DEC-96 (accept, withdraw, flag, clear), DEC-101 (3) (watching other groups' editions), DEC-92 (the origin mark) | dependency not yet built | nothing brings another group's published edition into this copy: inquiry R7's `inherited` leg names "an edition the published registry holds" (publication R7, this copy's own); no fetch or verification of another copy's case is in the tree (check) |
| H8 | DEC-102: identity levels and testimony weight | Bob's | open doctrine, its owed line: "how each identity level maps to the testimony grade … what counts as corroboration to journalistic and legal standards"; question 2 (check) |
| H16b | DEC-108: the gatekeeper and the discard archive | Bob's | open: "how a litigation hold (question 31) affects the archive's clearing"; question 4 (check) |
| H21 | DEC-111 'working on' notices | Bob's (architecture, P4) | a home: publication (4,408, P6) or a new product module; question 3 (check) |
| H5 | DEC-100 | Bob's | "awaits Bob's ruling" |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC-98, DEC-99, DEC-103's preview, DEC-104's list pages, DEC-106, DEC-108's inbox highlighting, DEC-109's settings card, DEC-110's item styles, DEC-95 (3)'s suggestion line, DEC-82/-86/-87/-90's surfaces | Bob's (UX) | screens of the new interface, not yet built (K633, K899 (2)); DEC-99's conformance is "checked as each screen is accepted" (check) |
| A8 | bias R26 | dependency not yet built | K102's trigger: evaluation findings under a lens (none in strength or review) |
| A21 | inquiry R31 | dependency not yet built | no module defines an opinion element (MK-5, K181) |
| A22, A23 | installer R13, R24 | dependency not yet built | the member surfaces (the new interface, not in the tree), which canon sequences isolation after (System Design :253; Distribution §7); R32's interim refusal is carried (check) |
| A37 | progressions R32 | dependency not yet built | the record holds no amounts or funds as values (K102's trigger) |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |

**Carried conditionally, so not in this table:** H2, H6, H9, H16, J3, J5 (Bob's approval of the fold before the layer) and A42 (the seam map); one that misses its condition is moved here at its layer's start, with that reason (check).

**At the opening, the new `next.md`** holds each left-out `next.md` entry's full text (from `git show d9a73f24f3:build/plan/next.md`) with the reason above, and the folded DECs' Bob's shares as entries (§9).

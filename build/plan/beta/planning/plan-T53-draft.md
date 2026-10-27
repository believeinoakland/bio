# Plan T53 round R1 · the beta's build (draft by PLANNING, for BOB)

**Status** · DRAFT, growing; PLANNING L3, 2026-10-27. Form by K5434 (4): one round; each entry its cause line and a pointer; each capability's detail in its own file under `build/plan/beta/`, read whole at the job's START. BOB writes the plan and every requirement line; this draft proposes. Entries marked `[owed: X]` wait on a lane draft not yet READY or on a question; they are listed so the module's job is known to exist. Carried entries keep their ids and text in `build/plan/carried-T52-R1.md` (pointer `C`); new ones are numbered `T53-n` when BOB writes the plan.

**Legacy census** (§5.2 (2)): no module is legacy (`modules.json` carries no `from`; legacy-ui retired at T51, K4100).

**Before R1 (BOB's acts):** (1) TESTS-SWEEP merged by its §5.10 pass; words and fixtures checks at 0; the fixtures findings needing a module's judgment become entries below (K5425 (b)) `[owed: TESTS-SWEEP's list]`. (2) The new modules added to `modules.json` and `layers.md` (STRUCTURE §5; the ones carrying capability to Bob), membership R83's `MODULE_ORDER` re-pinned. (3) Requirement lines written from the READY drafts named below, numbered per CONSISTENCY §1. (4) PLATFORM's throwaway test T-a on a scratch copy (K5434 (1)), its figures given to layer 11's START. (5) The design rows each entry names folded from `main` (K945).

**Reading an entry.** As T52-R1 (`archive/T52-R1.md`, "Reading an entry"): `first: settle X`, `[waits: X]`, `after X` (a same-layer dependency arrives as a CHANGE, K5434 (2)). A detail file named by an entry is read whole at START; its lines are the module's requirements once BOB writes them.

## Layer 1

**jurisdictions**
- T53 · N1257 (DEC-404) · places in layers: the four defects first (weekend by citation, closure lists across layers, records_help per law, `federal` office level), then the layer model, the shipped layers (federal, California, Alameda County, Oakland), the package alias and its equality test, team layers; N1256's federal offices with the layer or after F4's measure · `capabilities/N1257-places-in-layers.md`, `N1257-requirements-jurisdictions.md` `[owed: READY; C1-C7 BOB's, D1-D3 Bob's]`
- T53 · A2 (DEC-458) · a government's fiscal year as a one-value layer fact; a team's statement a team-layer entry · `planning/lines-A2-fiscal-year.md` re-cut per CONSISTENCY §2.1 `[owed: L2-3]`

**civil-time**
- T53 · A2 · `fiscalPeriod` over a stated entry, `from`, reasons never holding `*` · `planning/lines-A2-fiscal-year.md` (civil-time)

**text-chain**
- T53 · A8 (DEC-464) · a typed passage's two grades (unchecked, checked one step stronger, never `EARNED_CAPTURE_CEILING`) · `planning/lines-A8-typed-page.md` §2 `[owed: L2-10]`

**runtime-limits**
- T53 · N1267 (K4628, K5427, K5439) · the beta's per-kind bounds and protective limits as one table · `files/SIZES-N1267.md`; per-level rows `[owed: PLATFORM service levels]` (CONSISTENCY §2.8)
- T53 · K4354, K5438 · `TIME_BUDGETS` and `budgetOf` (PL1, PL2) · `platform/time-budgets-draft.md` §4

**structured-text-reader** (new)
- T53 · N1266 (K5435) · JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT, VTT in windows to 100 MB, structure kept, malformed read as far as it parses · `files/REQ-readers-beta.md` SR1-SR7

**mail-reader** (new)
- T53 · N1266 (K5435, K5437) · EML, MSG, MBOX; attachments as members; remote content never fetched · `files/REQ-readers-beta.md` ML1-ML6

**format-registry**
- T53 · N1266 (K5435-K5437) · the beta's roster, detection by content, macro variant, encrypted, unlisted named (K5436), refused set, `formatNameFor` · `files/REQ-format-registry-beta.md` RF1-RF9

**reader-container** (new; K4831 (2))
- T53 · N1266, N1267 · legacy Office and RTF by conversion, macros never run, every image kind to OCR-ready frames, archives as streams within bounds, refusal before any read · `files/REQ-readers-beta.md` CC1-CC6 (CC4 replaced by A4, CONSISTENCY §2.2)

**image-cover**
- T53 · A4 (DEC-460) · `redrawPicture`, `photoFactsOf`, strict strings · `planning/lines-A3-A4-source-picture.md` (image-cover R12-R14) `[owed: L2-6, L2-7]`

**office-readers**
- T53 · N1267a · XLSX cells by window before any workbook bound above 250,000 · `next.md` N1267a `[owed: Bob's higher row; else left out, hard reason Bob's]`

**file-scanner**
- C T52-100 · U5 · the streamed docx: renderer version moves with `plainPackage`

## Layer 2

**record-core**
- `[owed: PLATFORM record placement, N1271; three points Bob's]`

**credentials**, **ai-accounts**
- `[owed: AI-DESIGN's module list (keep, adapt, retire), K5428-K5433]`

## Layer 3

**sources**
- T53 · A3 (DEC-459) · `sourceLinksFor`: the source only for a listed viewer; `handed_in` for any viewer who may see the capture · `planning/lines-A3-A4-source-picture.md` (sources, need) `[owed: BOB writes from sources read whole; L2-4]`

**doorbell**
- T53 · A3 · a pulled knock carries the knocker's file name as the knocker's word · `planning/lines-A3-A4-source-picture.md` (doorbell R29) `[owed: L2-5]`

**file-safety**
- T53 · A4 · the safe picture of a photograph, `file_says`, `left_out`, lifecycle, the named security review · `planning/lines-A3-A4-source-picture.md` (file-safety R60-R64)
- T53 · DEC-454 · the partial-scan reason in plain words · `docs/development/DECISIONS.md` DEC-454
- T53 · N1266 (K5436) · a held-and-named file safe-graded like any other · `files/REQ-format-registry-beta.md` RF10

**acquisition**, **capture**
- T53 · N1266, N1267 · held-and-named filed whole with an owed reading (RF10), refused not filed (RF11), the refusal before any read (CC6) · `files/REQ-format-registry-beta.md` RF10-RF11
- T53 · DEC-455 · capture: an op reading a preview's next rows from `next_row` (`previewmore`, name BOB's) · DEC-455
- `[owed: CAPABILITIES N824 email intake; N1259 registers]`

## Layer 4

**content**
- T53 · A8 · a typing graded as its typist's word, one step once checked; who typed and who checked, by key · `planning/lines-A8-typed-page.md` §3 (content R63-R64)
- T53 · DEC-454 · `content.extent`'s part key in plain words · DEC-454

**extraction** (with screens-inquiry)
- T53 · N1272 (K5445) · what is interpreted: what a member opens or cites; a member's "interpret these parts for <investigation>"; Civicsmith's own proposals from the investigation's words (no AI), labelled and interpreted only on acceptance, built in the beta if they test well on real documents · `[owed: CAPABILITIES N1269-N1272 READY]`

**reading-pipeline**, **extraction**
- T53 · N1266, N1267 (K5427) · the text bound 100 MB, HTML streamed to it; the held-unread verdict re-run when a reader arrives · `files/SIZES-N1267.md` §3, `REQ-format-registry-beta.md` RF10 `[owed: lines for reading-pipeline not drafted]`

## Layer 5

**local-facts**
- T53 · N1257 · team-layer entries, reports of a shipped rule, old paths · `capabilities/N1257-requirements-modules.md` `[owed: READY]`
- T53 · A2 · the stated fiscal year as a team-layer entry · CONSISTENCY §2.1

**money**
- T53 · A2 · fiscal keys by the government's own year; the view offered only where known; never `*` · `planning/lines-A2-fiscal-year.md` (money R36-R38)

**entities**
- T53 · N1257, N1256 · a federal office made an entity only when chosen · `capabilities/N1257-requirements-modules.md` `[owed: READY]`

`[owed: CAPABILITIES N1259 (people, money groundwork, registers), N1260 (explore)]`

## Layer 6

**inquiry**
- T53 · A1 (DEC-457) · `setSubject` with a reason, `subjectHistory`, the private-person warning on a subject · `planning/lines-A1-A7-subject-pickers.md` (inquiry R87-R90) `[owed: L2-1]`

**leg-earning**
- T53 · A8 · a typed passage's ceiling at its own grain; a leg on it graded by the record · `planning/lines-A8-typed-page.md` §4
- T53 · A1 · "no subject named" as its own `why` · CONSISTENCY (A1 note)

**strength**
- T53 · A8 · a leg on a typed passage counts at its grade; `bio-grading/5` · `planning/lines-A8-typed-page.md` §5

**citation**
- T53 · A8 · a typed passage citable at once; the citation names typist and checker · `planning/lines-A8-typed-page.md` §6 `[owed: L2-11]`

`[owed: AI-DESIGN (run-rules to agent-worker), N1220, N1258]`

## Layer 8

**case-grammar**, **case-catalogue**, **publication**, **public-read**, **case-import**
- T53 · A5 (DEC-461) · the ungraded-passages block in the signed document, its C-41 check, the edition's statement, carried to readers · `planning/lines-A5-A6-signing.md` (A5 needs) `[owed: lines for these five not drafted]`

**case-authoring**
- T53 · A5 · the sign step lists ungraded passages; the edition states it; never refused for it · `planning/lines-A5-A6-signing.md` (case-authoring R88-R90)

**ratification**
- T53 · A5 · refused only when the statement is missing; the commit records it · `planning/lines-A5-A6-signing.md` (ratification R62-R63)
- C T52-24

**public-read** · C T52-23 · **case-disclosures** · C T52-25 · **case-inputs** · C T52-26 · **case-authoring** · C T52-27 · **case-check** · C T52-28

## Layer 9

**conformance** · C T52-29 · **actions** · C T52-30; N1257 `actions` R112 `[owed: READY]` · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 `[owed: READY]`

## Layer 10

**following** · C T52-34; `[owed: N1259 watches and alerts]` · **monitoring** · `[owed: N1259's pause line]`

## Layer 11

**op-declarations**
- C T52-42 · T53 · K4599 · screens declare reads by wave; `screenread` (PL10, PL11); every op and screen a budget class (PL3, PL4) · `platform/combined-read-and-fold-draft.md` §3, `time-budgets-draft.md` §4

**admission**
- C T52-43 · T53 · N1264 · `admit` callable in the room, parity of every refusal, counting unchanged (PL12, PL13) · `platform/combined-read-and-fold-draft.md` §3

**store-door**
- C T52-44, T52-45 · T53 · one RPC admits, stamps and runs; `screenread` inside it; slow reads cut (PL14, PL15) · `platform/combined-read-and-fold-draft.md` §3

**queue-producers**
- T53 · A6 (DEC-462) · one item per member listing each new key, by key words (R56, R57) · `planning/lines-A5-A6-signing.md` (A6)
- T53 · N1257 · a layer change told once (renumbered R58) `[owed: READY]`

**queue**, **screens-daily**
- T53 · A6 · an act per listed key `[owed: lines not drafted]`
- C T52-62 to T52-65, T52-104 (screens-daily)

**interface-shell**
- C T52-49 to T52-53 · T53 · one `screenread` per screen open (PL16, PL17) · `platform/combined-read-and-fold-draft.md` §3
- T53 · A7 · one document-picker element with two scopes, cited by every screens module that picks a document `[owed: BOB's placement]`

**screens-inquiry**
- C T52-66 to T52-73 · T53 · A1 (R140, R141), A7 (R142), A3 (the Document page's source line), A8 (Cite on typed words, the labels), DEC-454 (`document.mjs` display rows) · the named `planning/lines-*` files and DEC-454

**screens-intake**
- T53 · N1269 (K5446, K5447) · before a file is added, each kind's largest file read whole is stated; a file over its limit refused with its size and limit and offered a way in (a register by a filter, N1259; else the part the member needs) · `files/SIZES-N1267.md`, K5446, K5447
- C T52-59 to T52-61 · T53 · A3 (R72, R73), DEC-454 and DEC-455 (`capture.mjs`: display rows, "Show more rows", Cancel sending), DEC-456 (r9-states R65 `[waits: the design's row]`), held-and-named and refused sentences (FILES UX-NEEDS) · as named

**screens-investigate**, **screens-publish**
- C T52-74 to T52-80 · T53 · A7 (their pickers) · `planning/lines-A1-A7-subject-pickers.md` A7 §5; A5 (screens-publish: the signing step, the published statement)

**screens-settings**, **installer**, **installer-steps**
- C T52-58, T52-92 to T52-95 · T53 · N1257 (the places screen, the install choice) `[owed: READY]`; AI-DESIGN's provider screens `[owed]`
- T53 · K5444, K5442 · a copy chooses its level at install (Team, Institution, Enterprise) and can move up later · `[owed: PLATFORM service levels; Levels 2-3 study]`
- T53 · N1273 (K5440, K5441, K5443) · the region picker's two honest choices ("near me" a hint; "keep my data in this region" a jurisdiction, for the record and its R2 bucket, never combined); a Level 1 region fixed once the store exists, said before the choice; moving by export and import (PL35: corpus-export and installer import) · `[owed: PLATFORM record-placement READY]`

**control-plane**, **plane**
- C T52-85 to T52-91 · T53 · N1264, K4599: routes `screenread` and the folded admission · `platform/combined-read-and-fold-draft.md` §3

**journey-check**
- C T52-97, T52-98 · T53 · K4354 · the budget walk at 1280 and 390 px (PL5, PL6) · `platform/time-budgets-draft.md` §4 · T53 · N1268 · the acceptance corpus walk · `files/CORPUS-N1268.md` (CONSISTENCY §2.5)

**load-check** (new)
- T53 · N1274 · `runProfile`, `seedCopy`, `report` on a scratch copy only (PL40-PL43), run in R2 · `platform/load-test-draft.md` §5

The other carried layer-11 entries (wizard-scripts T52-35, T52-36; op-grades T52-37, T52-38; affordances T52-39; tasks T52-40; instance-setup T52-41; store-assembly T52-46, T52-47; store-request T52-48; screens-entry T52-54 to T52-56; screens-wizards T52-57; screens-action T52-81 to T52-84; site T52-96) stand as carried, each `C`.

## R2 (measure, scratch copy, BOB's under K5120)

The load test per level (N1274, `load-test-draft.md`), its short "before" run on the alpha's design first; the budget walk (L1, L2, L3 of `time-budgets-draft.md` §6); the acceptance corpus (N1268). Their defects are R3's entries.

## Left out of T53 (P19), each with its hard reason

- K5424 · lift civicsmith.org's `noindex` · Bob's: "not until the 1.0 release is deployed" (L12 on Bob's page: is the beta 1.0? recommended "before 1.0")
- K5447 (B) · keeping an over-limit file and reading only part · Bob's: waits until Civicsmith's proposals work well (K5445)
- N1270 · audio, video, forum formats · Bob's: after 1.0 (K4628); held and named meanwhile (K5436)
- FILES Tier 3 readers (PST/OST, Access and the rest) · Bob's (K5437): each by its own ruling when a real file is shown

# Plan T53 round R1 · the beta's build (draft by PLANNING, for BOB)

**Status** · DRAFT, growing; PLANNING L3, 2026-10-27. Form by K5434 (4): one round; each entry its cause line and a pointer; each capability's detail in its own file under `build/plan/beta/`, read whole at the job's START. BOB writes the plan and every requirement line; this draft proposes. Entries marked `[owed: X]` wait on a lane draft not yet READY or on a question; they are listed so the module's job is known to exist. Carried entries keep their ids and text in `build/plan/carried-T52-R1.md` (pointer `C`); new ones are numbered `T53-n` when BOB writes the plan.

**Legacy census** (§5.2 (2)): no module is legacy (`modules.json` carries no `from`; legacy-ui retired at T51, K4100).

**Before R1 (BOB's acts):** (1) TESTS-SWEEP merged by its §5.10 pass; words and fixtures checks at 0; the fixtures findings needing a module's judgment become entries below (K5425 (b)) `[owed: TESTS-SWEEP's list]`. (2) The new modules added to `modules.json` and `layers.md` (STRUCTURE §5; the ones carrying capability to Bob), member-roster R27's `MODULE_ORDER` (R61: modules.json's order) re-pinned. (3) Requirement lines written from the READY drafts named below, numbered per CONSISTENCY §1. (4) PLATFORM's throwaway test T-a on a scratch copy (K5434 (1)), its figures given to layer 11's START. (5) The design rows each entry names folded from `main` (K945).

**Reading an entry.** As T52-R1 (`archive/T52-R1.md`, "Reading an entry"): `first: settle X`, `[waits: X]`, `after X` (a same-layer dependency arrives as a CHANGE, K5434 (2)). A detail file named by an entry is read whole at START; its lines are the module's requirements once BOB writes them.

## Layer 1

**jurisdictions**
- T53 · N1257 (DEC-404, N1256) · the four defects first: weekend compared by days, closure lists by qualified name in the branch, records_help per law, a `federal` office level · `capabilities/N1257-requirements-jurisdictions.md` R103-R105, R107
- T53 · N1257 (K5452, K5458, K5462) · the layer model: layer and `within`, names addressed `layer:name`, the forest checked branch by branch, a conflict naming its layers, records laws saying whom they govern, coverage dates · same, R99-R102, R106, R108
- T53 · N1257 · the shipped layers (federal, California, Alameda County, Oakland), the every-footprint build check, the package alias and its equality test; the test forest · same, R109-R114, R118
- T53 · N1257 (K5451, K5452) · team layers, any number, and what a team may write · same, R115-R117 `[waits: CONSISTENCY §2.15 (the stated fiscal year's layer)]`
- T53 · N1256 (DEC-401 B) · the federal offices of the government's own list, a dated snapshot rebuilt before a release · same, R119, R120 `[owed: F4's measure; the makers' key]`
- `[owed: K5458's lines: every module that stores a rule, list or office name stores its layer (K5462: old records resolve on their own date)]`
- T53 · A2 (DEC-458) · a government's fiscal year as a one-value layer fact; a team's statement a team-layer entry · `planning/lines-A2-fiscal-year.md` re-cut per CONSISTENCY §2.1 `[owed: L2-3]`

**civil-time**
- T53 · A2 · `fiscalPeriod` over a stated entry, `from`, reasons never holding `*` · `planning/lines-A2-fiscal-year.md` (civil-time)

**connection-grammar**
- T53 · N1260 (DEC-409 to DEC-411, K1471, K4354) · `chainStrength`, `strongerChain`, paths ordered by strength, `foldParallel`, `CHAIN_LIMITS` · `capabilities/N1260-following-the-trail-a.md` §1, §2 (R22-R25) `[CONSISTENCY §2.16: its time figures]`

**text-chain**
- T53 · A8 (DEC-464) · a typed passage's two grades (unchecked, checked one step stronger, never `EARNED_CAPTURE_CEILING`) · `planning/lines-A8-typed-page.md` §2 `[owed: L2-10]`

**runtime-limits**
- T53 · N1267 (K4628, K5427, K5439) · the beta's per-kind bounds and protective limits as one table · `files/SIZES-N1267.md`; per-level rows `[owed: PLATFORM service levels]` (CONSISTENCY §2.8)
- T53 · K4354, K5438 · `TIME_BUDGETS` and `budgetOf` (PL1, PL2) · `platform/time-budgets-draft.md` §4
- T53 · N1273 (K5440, K5441) · `STORE_JURISDICTIONS`, `storeJurisdiction`, the room from a jurisdiction or a hint, never both (PL30); the generation suffix on a jurisdiction room (PL31); a jurisdiction copy's R2 bucket in the same jurisdiction, the install failing before the room otherwise (PL34) · `platform/record-placement-draft.md` §3

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

**signatures**
- T53 · K5457 · two more namespaces (eight in all): the catalogue's and the Gate 1 suite's (R49-R53 as AI-DESIGN lists them; the run-key check the issuer's R12 needs) · `lane-ai-design/draft-ai-catalogue.md` (signatures), `draft-ai-gate.md` R54-R64 `[owed: the five lines written as lines; FOLD-AI §3]`

**bundler**
- T53 · K5457 · the agent Worker's `HEALTH` Durable Object and provider bindings (AI Gateway, Workers AI); `deleted_classes` for `RemoteSession`, in the same deploy that retires the remote route · `lane-ai-design/draft-agent-run-path.md` (agent-worker R35), `draft-agent-runner.md` R13

**file-scanner**
- C T52-100 · U5 · the streamed docx: renderer version moves with `plainPackage`

## Layer 2

**record-core**
- `[owed: PLATFORM record placement, N1271; three points Bob's]`

**ai-catalogue** (new; before ai-accounts; K5457)
- T53 · N1220 (K5428-K5433, K5457) · the signed closed list of AIs: entry, plan, evidence, the seven checks, Gate 1 verdict per part, lifecycle, advisories, results library; signed updates verified and applied, the last good kept, rollback · `lane-ai-design/draft-ai-catalogue.md` R1-R53
- T53 · K5457 · the seed payload and shipped provider data, data only · same, R39, R48 `[waits: BOB's key ceremony and seed signing; AI1 pass marks]`

**ai-accounts**
- T53 · N1220 (K5457) · the account model (owner, provider, plan, means gateway/sealed/reference/issued/none, ordered entries); plan scope and the personal-subscription rule from the catalogue; the hop; disclosure per provider and host; checks P1-P7; free-tier acceptance; the gateway payer check · `lane-ai-design/draft-ai-accounts.md` R1-R64 `[waits: AI3-AI5]`
- T53 · K5457 · R8, R12, R13, R18, R35 and twelve old ops retired, nineteen new declared, every user re-pointed in this tranche, no aliases (FOLD-AI §2 lists the sixteen modules) · same, Part 1, R36, R38, R61
- T53 · K5457 · migration: apikey to the Anthropic API plan (sealed), signin to subscription (issued), project sign-in accounts ended and told once · same, R59

**credentials**
- T53 · K5457 · R27, R32, R48, R63, R66, R73 amended, R72 retired (the sealed key; `aicredential` on `AI_GRANT_OPS`) · `lane-ai-design/draft-ai-accounts.md` (credentials delta)

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
- T53 · N1257 (K5451) · a team writes its own layers entry by entry; a wrong shipped rule is reported, not edited; an old fact path still reads · `capabilities/N1257-requirements-modules.md` (local-facts R23-R27) `[waits: C3, BOB's]`
- T53 · A2 · the stated fiscal year as a team entry (R28, R29) · `planning/lines-A2-fiscal-year.md` `[waits: CONSISTENCY §2.15]`

**connections**
- T53 · N1260 (K1469, K1470, K1486, K1489) · `named_in`: a document as a hop's end, its hub, its sight check · `capabilities/N1260-following-the-trail-a.md` §3 (R74-R76) `[waits: measure M-F1]`

**money**
- T53 · N1260 (DEC-409, DEC-410, DEC-447 (2)) · five money kinds in place of `money_flow`; a party's hub by date and kind; `moneyByParty` · `capabilities/N1260-following-the-trail-a.md` §4 (R36-R38)
- T53 · A2 · fiscal keys by the government's own year; the view only where known; never `*` · `planning/lines-A2-fiscal-year.md` (money, renumbered R39-R41, CONSISTENCY §1)

**explore**
- T53 · N1260 (DEC-409 to DEC-411, K4403 (8)(9)) · every chain between two ends, the most direct, shorter paths beside a member's own, a time stop that can be continued · `capabilities/N1260-following-the-trail-a.md` §5 (R30-R35)
- T53 · N1260 (DEC-447) · each kind's dimension; "Follow from here" per item kind, a fund included; op `followfrom` · same, §6 (R36) `[owed: standards' `standardsBinding` line]`

**entities**
- T53 · N1257, N1256 · `federalOfficesFind` (op `federaloffices`); a federal office made an entity only when chosen, FOIA its law · `capabilities/N1257-requirements-modules.md` (entities R68)

`[owed: CAPABILITIES N1259 (people, money groundwork, registers)]`

## Layer 6

**reading-guides**
- T53 · N1257 · procedure guides side by side, one per layer, unranked (R17) · `capabilities/N1257-requirements-modules.md`

**inquiry**
- T53 · A1 (DEC-457) · `setSubject` with a reason, `subjectHistory`, the private-person warning on a subject · `planning/lines-A1-A7-subject-pickers.md` (inquiry R87-R90) `[owed: L2-1]`

**leg-earning**
- T53 · A8 · a typed passage's ceiling at its own grain; a leg on it graded by the record · `planning/lines-A8-typed-page.md` §4
- T53 · A1 · "no subject named" as its own `why` (A1-R6) · `planning/lines-A1-A7-subject-pickers.md`

**strength**
- T53 · A8 · a leg on a typed passage counts at its grade; `bio-grading/5` · `planning/lines-A8-typed-page.md` §5

**citation**
- T53 · A8 · a typed passage citable at once; the citation names typist and checker · `planning/lines-A8-typed-page.md` §6 `[owed: L2-11]`

**run-rules**
- T53 · K5457 · the test bar read per AI and part: R19, R29, R30 amended; `GATE_PART_OF` and `gatePartOf` (R36); `PART_WITHDRAWN` (R37) · `lane-ai-design/draft-run-rules.md` `[waits: AI1 for R19's standing measure and R37; reading A or B, FOLD-AI §1]`

**ai-runs**
- T53 · K5457 (K2892 as K5457 reads it) · `principal_ai`; the account per act; Gate 1 per (entry, part) through `partAdmitted`; segments, labels, hops; pause and resume; a recipient notice holds the run; ops `aicontinue`, `aistop`, `aiwait`, `aiswitchaccount`, `aiwithout`, `aisend`, `aisendrefuse` · `lane-ai-design/draft-agent-run-path.md` (ai-runs R91-R97 and the amended) `[waits: AI1, AI3, AI10]`

**agent-harness**
- T53 · K5457 · `ROLE_NEEDS`, `needOf`, `partOf` over the six parts, `disclosureGate`, `resumeAt`; R17 moves with N1205 · `lane-ai-design/draft-agent-run-path.md` (agent-harness R20-R24)

**agent-model** (before ai-use, FOLD-AI §2)
- T53 · K5457 · first: the interface (`turn`, `converse`, `capabilities`, `estimate`, `health`) with the Anthropic adapter behind it, today's tests passing through `turn` (N1205's landing place) · `lane-ai-design/draft-agent-model.md` R1-R36, R43, R44, R54, R55
- T53 · K5457 · then the OpenAI-compatible adapter and host profiles (openrouter first, ai_gateway, workers_ai, custom), the served-host pin, the payer check, bounded retry and the circuit, `provider_limit` · same, R37-R42, R45-R53 `[waits: AI4 (R47), AI10; live checks L2, L3]`

**agent-runner**
- T53 · K5457 · the Claude Code route retired in one change (R35, R42; RUNNER and REMOTE bindings off) · `lane-ai-design/draft-agent-runner.md` R13 `first: N1205's split`
- T53 · K5457 · the Gate 1 test container (distroless, `/run` only, the key in memory for one run, per-run egress, sealed capture, manifest before the bundle, three deployments) · same, R5-R16, R26, R29, R30, R33, R41, R43-R60 `[waits: the offline keys]`

**agent-steps**
- T53 · K5457 · the entry by need per conversation, Gate 1 per part before the first turn, `ai_stop` at a step boundary, a notice before a new recipient, `idem`, `produced_by` · `lane-ai-design/draft-agent-run-path.md` (agent-steps R50-R57)

**agent-worker**
- T53 · N1205 (K5457) · first: the split: `/signin`, its relay and REMOTE dispatch (R66, R67, R81-R85, R109, R111) to agent-model's adapter; `ai_account`; no credential in the Worker · `lane-ai-design/draft-agent-run-path.md` (agent-worker) `first: agent-model's interface`
- T53 · K5457 · each path takes its entry by need, refuses by name, labels every result, fails fast with three choices, turn-level progress, the sealed key by `aicredential` at the call · same, R120-R127 `[waits: AI1 (R121), AI10 (R124)]`

**ai-use**
- T53 · K5457 · the neutral usage record (provider-reported money apart from Civicsmith's estimate; never zero for the unmeasured); provider limits as limits reached; thresholds, alerts, reconciliation · `lane-ai-design/draft-ai-use.md` R1-R26
- T53 · K5459 · a paying team or project sees each member's use over thirty days; a personal subscription never · same, R27

**ai-gate** (new; after agent-worker; K5457)
- T53 · K5457 · the Gate 1 suite: signed bank and thresholds, items scored by code on a stub plane through agent-model, per-part verdicts, Wilson intervals, the gate record · `lane-ai-design/draft-ai-gate.md` R1-R40, R65, R66 `[waits: AI1; Bob's floors after the first measuring run, AD13]`
- T53 · K5457 · characterization and cost shown before a run, consent, canaries, the lifecycle signal · same, R41-R53 `[waits: AI6, AI7]`
- T53 · K5457 · the results bundle and the library row, `partsRefused` · same, R54-R64 `[waits: AI8; ai-issuer]`

`[owed: N1258 (the charge-or-rule measure) placed by AI-DESIGN as R2's standing measure; N829 outside the product, FOLD-AI §4]`

## Layer 8

**case-grammar**, **case-catalogue**, **publication**, **public-read**, **case-import**
- T53 · A5 (DEC-461), A8 (DEC-464) · case-document format `/10`: the ungraded-passages and typed-passages blocks, their C-41.18 and C-41.19 checks, the edition's statements recorded and served, imported editions' statements kept apart, typist and checkers credited as each chose · `planning/lines-A5-A8-case-modules.md` `[owed: L23 (Q-A5-1), L26 (Q-A58-1), L11]`

**case-disclosures**, **basis-versions**
- T53 · A5, A8 · ungraded passages listed; a typed passage printed as typed, labelled as of signing; a frozen reading names typist and checkers · `planning/lines-A5-A8-case-modules.md`

**case-authoring**
- T53 · A5 · the sign step lists ungraded passages; the edition states it; never refused for it · `planning/lines-A5-A6-signing.md` (case-authoring R88-R90)

**ratification**
- T53 · A5 · refused only when the statement is missing; the commit records it · `planning/lines-A5-A6-signing.md` (ratification R62-R63)
- C T52-24

**corpus-export**
- T53 · K5441, K5443 · the whole team record exported by resumable parts, the one way to change region (PL50-PL53) · `platform/whole-record-move-draft.md` `[owed: READY]`

**public-read** · C T52-23 · **case-disclosures** · C T52-25 · **case-inputs** · C T52-26 · **case-authoring** · C T52-27 · **case-check** · C T52-28

## Layer 9

**conformance** · C T52-29 · **actions** · C T52-30; N1257 R112 (two laws, two clocks; the zone named) · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 (the layer a list comes from) · **filing-templates** · N1257 R36 (a template's places may name layers) · all `capabilities/N1257-requirements-modules.md`

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
- T53 · N1257 · `place-profile-arrived` for a layer of any level; a rule change told once to administrators (R58) · `capabilities/N1257-requirements-modules.md`

**queue**, **screens-daily**
- T53 · A6 · a per-key choice of act passed through (queue), a line and two acts per key, never handled by "choose several" (screens-daily) · `planning/lines-A6-queue-acts.md` (Q-A6-1, Q-A6-2 decided, K5456; their wording a UX need)
- C T52-62 to T52-65, T52-104 (screens-daily)

**interface-shell**
- C T52-49 to T52-53 · T53 · one `screenread` per screen open (PL16, PL17) · `platform/combined-read-and-fold-draft.md` §3
- T53 · A7 · one document-picker element with two scopes (A7-R1), cited by screens-inquiry R137, screens-investigate R34 and R52, screens-publish R8 · `planning/lines-A1-A7-subject-pickers.md` `[owed: L2]`

**screens-inquiry**
- C T52-66 to T52-73 · T53 · N1260 ("Follow from here" on Document), A1, A7, A3 (the Document page's source line), A8 (Cite on typed words, the labels), DEC-454 (`document.mjs` display rows) · the named `planning/lines-*` files and DEC-454

**screens-intake**
- T53 · N1269 (K5446, K5447) · before a file is added, each kind's largest file read whole is stated; a file over its limit refused with its size and limit and offered a way in (a register by a filter, N1259; else the part the member needs) · `files/SIZES-N1267.md`, K5446, K5447
- C T52-59 to T52-61 · T53 · A3 (R72, R73), DEC-454 and DEC-455 (`capture.mjs`: display rows, "Show more rows", Cancel sending), DEC-456 (r9-states R65 `[waits: the design's row]`), held-and-named and refused sentences (FILES UX-NEEDS) · as named

**affordances**, **interface-shell**, **screens-daily**, **screens-investigate**, **screens-action** (N1260, N1257)
- T53 · N1260 (DEC-447) · `cs.follow`, one "Follow from here" fold read only when opened (interface-shell); its menus (affordances R72-R74); Find results draw it (screens-daily); people, events, money, chain steps and Explore's three acts (screens-investigate R67-R69) · `capabilities/N1260-following-the-trail-b.md`
- T53 · N1257 · `request` offers the laws whose `governs` holds the office's level (screens-action R60) · `capabilities/N1257-requirements-modules.md`

**screens-investigate**, **screens-publish**
- C T52-74 to T52-80 · T53 · A7 (their pickers) · `planning/lines-A1-A7-subject-pickers.md` A7 §5; A5 (screens-publish: the signing step, the published statement)

**screens-settings**, **installer**, **installer-steps**
- C T52-58, T52-92 to T52-95 · the AI screens (below)
- T53 · N1257 (K5450, K5452) · the places page as a tree, the choice a set, "Report a rule" the one act on a shipped rule, an information mark on each entry and the page (screens-settings R82, R83); the install asks where the work focuses, as a set, nothing below federal preselected (installer R86); instance-setup holds the choice and the team's layers (R107-R111) · `capabilities/N1257-requirements-modules.md` `[waits: D3 (Bob); CONSISTENCY §2.17]`
- T53 · K5444, K5442, K5454 · a copy chooses its level at install (Team, Institution; Enterprise listed as not yet available, PL29) and can move up later · `[owed: PLATFORM service levels; Levels 2-3 study]`
- T53 · N1273 (K5440, K5441, K5443) · the region picker's two honest choices ("near me" a hint; "keep my data in this region" storage in a jurisdiction, the room and its R2 bucket; what runs elsewhere said), the choice fixed and the move by export and import said before it (PL32); Settings states the placement truthfully (PL33) · `platform/record-placement-draft.md` §3 (installer, installer-steps, plane; screen needs to UX-DESIGN)
- T53 · K5443 · the one way to change region: whole-record export (corpus-export, layer 8) and the installer's import (PL35, PL50-PL57) · `platform/whole-record-move-draft.md` `[owed: READY; one point maybe Bob's (a move carries members' sign-in material?)]`

**control-plane**, **plane**
- C T52-85 to T52-91 · T53 · N1264, K4599: routes `screenread` and the folded admission · `platform/combined-read-and-fold-draft.md` §3

**journey-check**
- T53 · N1260 (K4354, DEC-447 (4)) · an act counter against a target set before the walk, the 2-second assertion, the Sewer Service Fund journey (writes nothing) · `capabilities/N1260-following-the-trail-b.md` `[first: BOB's K lines for the two target files]`
- C T52-97, T52-98 · T53 · K4354 · the budget walk at 1280 and 390 px (PL5, PL6) · `platform/time-budgets-draft.md` §4 · T53 · N1268 · the acceptance corpus walk · `files/CORPUS-N1268.md` (CONSISTENCY §2.5)

**ai-issuer** (new; Civicsmith's own Worker; K5457)
- T53 · K5457 · serves the signed catalogue, advisories and seal key; single-use challenges; sealed test bundles received and kept for the off-Worker scorer; Bob's decisions recorded; signs and opens nothing · `lane-ai-design/draft-ai-issuer.md` R1-R24 `[waits: BOB's deploy to account 20b5…7f72, the operator's tools; AI8 for R18]`

**screens-settings** (the AI screens)
- T53 · N1220 (DEC-420, K5457) · `aiproviders`, `aiconnect`, `aimine`, `aiproject`, `aimoments`, `aitest`, `airesults`; `connect`, `teamai`, `projectai` and their acts retired · `lane-ai-design/draft-assistant-screens.md` §2, §4, §5; `UX-REQUIREMENTS.md` `[waits: UX-DESIGN's rows, B555]`
- T53 · K5459 · per-member use on accounts the team or project pays for (`aiusebymember`) · same, §5 U7

**op-declarations**, **op-grades**, **interface-shell** (the assistant)
- T53 · N1220 · the 43 AI ops declared with grade and budget class (an "AI act" class owed by PLATFORM, P1), the retired ops removed; the assistant's reads as one combined read (P2) · `lane-ai-design/draft-assistant-screens.md` §4, §5 P1, P2 `[owed: PLATFORM's AI act class]`
- T53 · N1220 · every machine result labelled with its AI's name in the screens that show one (screens-intake, -daily, -investigate, -publish, -action, -wizards) · same, §2 (ii), §5 U1

**load-check** (new)
- T53 · N1274 · `runProfile`, `seedCopy`, `report` on a scratch copy only (PL40-PL43), run in R2 · `platform/load-test-draft.md` §5

The other carried layer-11 entries (wizard-scripts T52-35, T52-36; op-grades T52-37, T52-38; affordances T52-39; tasks T52-40; instance-setup T52-41; store-assembly T52-46, T52-47; store-request T52-48; screens-entry T52-54 to T52-56; screens-wizards T52-57; screens-action T52-81 to T52-84; site T52-96) stand as carried, each `C`.

## R2 (measure, scratch copy, BOB's under K5120)

The load test per level (N1274, `load-test-draft.md`), its short "before" run on the alpha's design first; the budget walk (L1, L2, L3 of `time-budgets-draft.md` §6); the acceptance corpus (N1268). Their defects are R3's entries.

## Left out of T53 (P19), each with its hard reason

- K5424 · lift civicsmith.org's `noindex` · Bob's: "not until the 1.0 release is deployed" (L12 on Bob's page: is the beta 1.0? recommended "before 1.0")
- K5447 (B) · keeping an over-limit file and reading only part · Bob's: waits until Civicsmith's proposals work well (K5445)
- N1270 · audio, video, forum formats · Bob's: after 1.0 (K4628); held and named meanwhile (K5436)
- K5454 · Enterprise support (Level 3) · Bob's, a hard reason outside the product: built with the first Civicsmith team that wants an Enterprise-scale copy; listed at install as not yet available (PL29)
- FILES Tier 3 readers (PST/OST, Access and the rest) · Bob's (K5437): each by its own ruling when a real file is shown

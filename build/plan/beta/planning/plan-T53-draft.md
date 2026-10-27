# Plan T53 · the beta's build (draft by PLANNING, for BOB)

**Status** · DRAFT, growing; PLANNING L3, 2026-10-27; last fold L34 (CAPABILITIES' READY scope; every L question answered; K5495-K5552, DEC-472, DEC-473). Form by K5434 (4) and K5567: one round, measurements at once unless they measure R1's code, no R3; each entry its cause line and a pointer; each capability's detail in its own file under `build/plan/beta/`, read whole at the job's START. BOB writes the plan and every requirement line; this draft proposes. Entries marked `[owed: X]` wait on a lane draft not yet READY or on a question; they are listed so the module's job is known to exist. Carried entries keep their ids and text in `build/plan/carried-T52-R1.md` (pointer `C`); new ones are numbered `T53-n` when BOB writes the plan.

**Legacy census** (§5.2 (2)): no module is legacy (`modules.json` carries no `from`; legacy-ui retired at T51, K4100).

**Before R1 (BOB's acts):** (1) TESTS-SWEEP merged by its §5.10 pass, with the words check's recorded baseline (K5565 (2)); words and fixtures checks at 0; the fixtures findings needing a module's judgment are entries below (K5425 (b); `tests-sweep/FIXTURES.md`: 86 of 89 cleared, 3 left). (2) Layer 6 re-ordered (FOLD-AI §2.9) and the new modules added to `modules.json` and `layers.md` (STRUCTURE §5; the ones carrying capability to Bob), member-roster R27's `MODULE_ORDER` (R61: modules.json's order) re-pinned. (3) Requirement lines written from the READY drafts named below, numbered per CONSISTENCY §1. (4) PLATFORM's throwaway test T-a on a scratch copy (K5434 (1)), its figures given to layer 11's START. (5) The design rows each entry names folded from `main` (K945). (6) CAPABILITIES' acts (`planning/plan-T53-capabilities.md` §C): M1 the `email()` probe on account `20b5…7f72` only (decides whether the plane's upload carries `email()`); M-R9 a member's own free CourtListener token by `request_credential`, never printed; record-core's two read-only checks on biosmoke8; the N1265 rehearsal shapes on `CS_TEST_CF_ACCOUNT_ID` alone (K4942). (7) `modules.json` and `layers.md` gain register-readers (L1, after court-doctypes), registers (L5, after workbooks) and mail-door (L3, after doorbell, uses member-roster; K5530). (8) DEC-473 to DEC-478 merged from the design stream (U505-U511, ec02fce0bc; done). (9) Splits for size (K617; BOB's, L37 R4, R5): `screens-inquiry` split by screen, the new `screens-document` (layer 11, after screens-inquiry) taking the Document page (`document.mjs` and its states, its requirement lines and tests), by a split map in the form of K3946's, meaning unchanged; `screens-ai` added (layer 11, after screens-settings) for DEC-420's seven AI screens; both in `modules.json`, `layers.md` and `MODULE_ORDER` with (2). The other modules past 4,000 lines stay whole this tranche (R6), each job reporting its size at completion. (10) U512-U518 (DEC-479 to DEC-485) merged with layer 3's first job, doorbell before file-safety swapped (`planning/plan-T53-design-rows.md`).

**CAPABILITIES' detail** (L23): `planning/plan-T53-capabilities.md` holds every CAPABILITIES entry by layer and module (N1259, N824, N1110, N1265, N858, N1269-N1272, N1257's layer names and record-core), its new modules (register-readers L1, registers L5, mail-door L3), measurements, BOB's acts, left-outs and points; each module's START carries its rows there verbatim (L37 R1). The lines below name each module once.

**Reading an entry.** As T52-R1 (`archive/T52-R1.md`, "Reading an entry"): `first: settle X`, `[waits: X]`, `after X` (a same-layer dependency arrives as a CHANGE, K5434 (2)). Reading sets (L37 R1-R3, BOB's): a START carries the module's rows of this plan, `planning/plan-T53-capabilities.md`, `planning/plan-T53-journeys.md` and `carried-T52-R1.md` verbatim, and those files are not otherwise read; a lane draft named by an entry is read whole, except one over 30 KB naming three or more modules, read as its head (status, keys, decisions) plus the module's sections, named in the START; a DEC row is carried by id, never `docs/development/DECISIONS.md`. Each entry names its drafts by file (R7); measures in `planning/reading-sets-T53.md`.

## Layer 1

**jurisdictions**
- T53 · N1257 (DEC-404, N1256) · the four defects first: weekend compared by days, closure lists by qualified name in the branch, records_help per law, a `federal` office level · `capabilities/N1257-requirements-jurisdictions.md` R103-R105, R107
- T53 · N1257 (K5452, K5458, K5462) · the layer model: layer and `within`, names addressed `layer:name`, the forest checked branch by branch, a conflict naming its layers, records laws saying whom they govern, coverage dates · `capabilities/N1257-requirements-jurisdictions.md` R99-R102, R106, R108
- T53 · N1257 · the shipped layers (federal, California, Alameda County, Oakland), the every-footprint build check, the package alias and its equality test; the test forest · `capabilities/N1257-requirements-jurisdictions.md` R109-R114, R118
- T53 · N1257 (K5451, K5452) · team layers, any number, and what a team may write · `capabilities/N1257-requirements-jurisdictions.md` R115-R117 plus the one placeless team-rules layer (CONSISTENCY §2.15, decided) `[owed: CAPABILITIES' amendment of R24, R100, R102, R115]`
- T53 · N1256 (DEC-401 B) · the federal offices of the government's own list, a dated snapshot rebuilt before a release · `capabilities/N1257-requirements-jurisdictions.md` R119, R120 `[owed: F4's measure; the makers' key]`
- T53 · N1257 (K5458, K5462) · `nameResolve` (R121, pure: callers pass the active layer set), the one-government fiscal year (R123, R124), N1259's register sections (R127-R133), N858's court-kind refusal (R136) and R137's display half, the beta's profile texts; every module that stores a rule, list or office name stores its layer (local-facts, entities, duties, reading-guides, layer 9, instance-setup, producers, screens) · `planning/plan-T53-capabilities.md` §A
- T53 · K5497 (C7 remainder) · Civicsmith ships United States places only; a team choosing its places is told so; a team whose work is about a place outside the US names its places and adds their offices and rules itself (DEC-150); level names unchanged · `capabilities/N1257-requirements-jurisdictions.md`, `capabilities/N1257-requirements-modules.md` (K5497's lines)
- T53 · A2 (DEC-458; K5468) · `fiscal_year` a section of the one team layer, any level of government where no shipped layer states its year, the records read first (R134); for L18 = A only, the records' year governs and the team's is set aside (R135) · `capabilities/N1257-requirements-a2.md` (L18 decided, K5543: the records' year governs, the team's statement set aside; R135 stands) (L3 decided, K5517: a disputed year still groups, shown disputed)

- T53 · K5527 (4), (5) · N858's text record in the profile: a review's `reviewed_text_sha` (R40), a guide's attribution fields (R125), what counts as the professional review and `countedReview` (R126), R138 on `authored_by` and `machine_draft` · `planning/lines-K5527-texts-and-listing.md` §1, §3, §4 (T1-T8 decided, K5528) `[owed: CAPABILITIES' N858 READY]`

**civil-time**
- T53 · A2 · `fiscalPeriod` over a stated entry, `from`, reasons never holding `*` · `planning/lines-A2-fiscal-year.md` (civil-time)

**connection-grammar**
- T53 · N1260 (DEC-409 to DEC-411, K1471, K4354) · `chainStrength`, `strongerChain`, paths ordered by strength, `foldParallel`, `CHAIN_LIMITS` · `capabilities/N1260-following-the-trail-a.md` §1, §2 (R22-R25) (counts only; the times are budget classes of `followfrom` and explore's ops, CONSISTENCY §2.16)

**text-chain**
- T53 · A8 (DEC-464) · a typed passage's two grades (unchecked, checked one step stronger, never `EARNED_CAPTURE_CEILING`) · `planning/lines-A8-typed-page.md` §2 (L10 decided, K5524)

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
- T53 · DEC-467 · one table the screens read: each kind's plain name (by key) and its limits (runtime-limits' per-kind rows), for Add's "What can be added", held, refused and over-limit sentences · DEC-467 · `files/KIND-TABLE.md` (READY; built from runtime-limits' Level 1 rows, never the other way) `[owed: BOB confirms the stated figure for audio and video]`
- T53 · DEC-473 · {kind} read `file.kind.<key>` by KIND-TABLE's key column (48 rows; the many-to-one map in DEC-473's owed), {reason} `file.refused.reason.*`; A4-R3's `left_out` kinds read `screen.photo.dropped.<kind>` (with screens-intake, screens-inquiry) · DEC-473 (merged, U506)

**reader-container** (new; K4831 (2))
- T53 · N1266, N1267 · legacy Office and RTF by conversion, macros never run, every image kind to OCR-ready frames, archives as streams within bounds, refusal before any read · `files/REQ-readers-beta.md` CC1-CC6 (CC4 replaced by A4, CONSISTENCY §2.2)

**image-cover**
- T53 · A4 (DEC-460) · `redrawPicture`, `photoFactsOf`, strict strings · `planning/lines-A3-A4-source-picture.md` (image-cover R12-R14) (L6 decided, K5520: JPEG and PNG first)

**office-readers**
- T53 · N1267a · XLSX cells by window before any workbook bound above 250,000 · `next.md` N1267a `[owed: Bob's higher row; else left out, hard reason Bob's]`

**signatures**
- T53 · K5457, K5471 · three more namespaces: the catalogue's, the Gate 1 suite's and the AI run's (`NS_AI_RUN`) (R49-R53 as AI-DESIGN lists them; the run-key check the issuer's R12 needs) · `lane-ai-design/draft-ai-catalogue.md` (signatures), `draft-ai-gate.md` R54-R64 `[owed: the five lines written as lines; FOLD-AI §3]`

**bundler**
- T53 · K5457 · the agent Worker's `HEALTH` Durable Object and provider bindings (AI Gateway, Workers AI); `deleted_classes` for `RemoteSession`, in the same deploy that retires the remote route · `lane-ai-design/draft-agent-run-path.md` (agent-worker R35), `draft-agent-runner.md` R13

**file-scanner**
- C T52-100 · U5 · the streamed docx: renderer version moves with `plainPackage`

## Layer 2

**record-core**
- `[owed: PLATFORM record placement, N1271; three points Bob's]`

**membership**
- T53 · K5501 · `onProjectLeft(module, fn)` called inside `projectRemove` (R36), `why: "removed"`; `projectLeave` and `projectOwnerRemove` call nobody (R158) · `planning/lines-K5501-role-change.md`

**member-roster** (with op-declarations' rows)
- T53 · K5562, K5563 · the founder removes an administrator alone with a reason, and every removal by vote shown to the team with who and why (`adminremovals`, K5568); her endorsement alone issues an administrator invitation; a waiting proposal cancelled by the founder or the proposer (`adminproposalcancel`); others' rules unchanged · `planning/lines-K5562-K5563-founder.md` K5562-R1 to R3, K5563-R1 to R6

**ai-catalogue** (new; before ai-accounts; K5457)
- T53 · N1220 (K5428-K5433, K5457) · the signed closed list of AIs: entry, plan, evidence, the seven checks, Gate 1 verdict per part, lifecycle, advisories, results library; signed updates verified and applied, the last good kept, rollback · `lane-ai-design/draft-ai-catalogue.md` R1-R53
- T53 · K5457 · the seed payload and shipped provider data, data only · `lane-ai-design/draft-ai-catalogue.md` R39, R48 `[waits: BOB's key ceremony and seed signing; Bob's pass marks, K5475]`
- T53 · K5482 · the payload lists tested AIs that are not entries (R54) and one combined record per AI and part (R55); R43-R45 amended · `lane-ai-design/draft-ai-catalogue.md`

**ai-accounts**
- T53 · N1220 (K5457) · the account model (owner, provider, plan, means gateway/sealed/reference/issued/none, ordered entries); plan scope and the personal-subscription rule from the catalogue; the hop; disclosure per provider and host; checks P1-P7; free-tier acceptance; the gateway payer check · `lane-ai-design/draft-ai-accounts.md` R1-R64 (AI3-AI5 answered A, K5477-K5479)
- T53 · K5457 · R8, R12, R13, R18, R35 and twelve old ops retired, nineteen new declared, every user re-pointed in this tranche, no aliases (FOLD-AI §2 lists the sixteen modules) · `lane-ai-design/draft-ai-accounts.md` Part 1, R36, R38, R61
- T53 · DEC-465, DEC-466, K5471 · `aikeyseal` (R69), a member's own list order (R70), declared ops (R71), a share flag turned off (R72), `GATEWAY_UNAVAILABLE` naming who can grant it (R73), the readiness summary (R74); a member clears the payer flag on her own account (R68) · `lane-ai-design/draft-ai-accounts-dec465.md` (AI11 B, K5486: any project the member has joined; the draft's "owns" changed by AI-DESIGN)
- T53 · K5457 · migration: apikey to the Anthropic API plan (sealed), signin to subscription (issued), project sign-in accounts ended and told once · `lane-ai-design/draft-ai-accounts-dec465.md` R59
- T53 · K5478, DEC-471, K5493 · `aicreditsclear` replaces R68 ("Clear it and turn the account back on"); the credits stop a Queue item, kind `ai-credits-stop` (R75); a dated terms change is a notice, never a step (R76); the `membership` role-change listener (For BOB 3, decided K5501: below) · `lane-ai-design/draft-ai-accounts-dec465.md`
- T53 · K5501 · a member removed from a project (`projectRemove`) or revoked from the team loses her placements of shared accounts on its list in the same act, each a change, the project's owners told once; who placed an entry recorded (`placed_by`) (ai-accounts R77, R27 amended) · `planning/lines-K5501-role-change.md` (its five technical points decided as recommended, K5502)

**credentials**
- T53 · K5457 · R27, R32, R48, R63, R66, R73 amended, R72 retired (the sealed key; `aicredential` on `AI_GRANT_OPS`) · `lane-ai-design/draft-ai-accounts.md` (credentials delta)

## Layer 3

**sources**
- T53 · A3 (DEC-459) · `sourceLinksFor`: the source only for a listed viewer; `handed_in` for any viewer who may see the capture · `planning/lines-A3-A4-source-picture.md` (sources, need) `[owed: BOB writes from sources read whole]` (L4 decided, K5518: the source's existence confidential too)

**doorbell**
- T53 · A3 · a pulled knock carries the knocker's file name as the knocker's word · `planning/lines-A3-A4-source-picture.md` (doorbell R29) (L5 decided, K5519)

**file-safety**
- T53 · A4 · the safe picture of a photograph, `file_says`, `left_out`, lifecycle, the named security review · `planning/lines-A3-A4-source-picture.md` (file-safety R60-R64); FILES's `files/PHOTO-DATA.md` checked against A4 §2 (one source, K5471 (3)): serials and owner name shown beside the picture to members who may see it (K5521, governing K5473 (1) for them); image id, artist, copyright read, not shown by default; the place name shown, exact figures one step away A4 the one source (K5473 (1)); "near {place}" from the shipped and team layers only, else rounded figures (L21, K5546: a colour profile passing A4-R8's check kept in the picture, not the recommendation, bounded as drafted, K5555; L22, K5547: all the photo's data shown as "the file says") (the published place decided, K5514: shown in an edition only where the author turns it on, per photo, off by default)
- T53 · DEC-454 · the partial-scan reason in plain words · `docs/development/DECISIONS.md` DEC-454
- T53 · N1266 (K5436) · a held-and-named file safe-graded like any other · `files/REQ-format-registry-beta.md` RF10

**acquisition**, **capture**
- T53 · K5513 (C22) · acquisition R36: a daemon fetches on the team's key only for the daily check of a court case a member follows, stopping at the last unfollow; else `NOT_PERMITTED` (credentials R29 unchanged: the words are R36's) · `planning/lines-K5513-daily-follow.md`
- T53 · N1266, N1267 · held-and-named filed whole with an owed reading (RF10), refused not filed (RF11), the refusal before any read (CC6) · `files/REQ-format-registry-beta.md` RF10-RF11
- T53 · DEC-455 · capture: an op reading a preview's next rows from `next_row` (`previewmore`, name BOB's) · DEC-455
- T53 · N824 (K2425, K5504-K5506, K5527 (1), (2)) · provenance's `email` origin, `emailCapture` with her statement, `fileMember` for a message's attachments and a ZIP's entries, discarded knocks cleared; new module **mail-door** after doorbell (K5530) (published copy per K5534) · `planning/plan-T53-capabilities.md` §A Layer 3
- T53 · N1259 (K4403, K5498, K5503, K5513) · `streamRegister`, `probeRegister`, the docket read for a followed case (R36, `planning/lines-K5513-daily-follow.md`), segments as captures · `planning/plan-T53-capabilities.md` §A Layer 3 (officers: registers R46, K5532; jurisdictions R130, R133 and guardrail R73 in `planning/lines-K5532-officers-guardrail-listing.md`)

## Layer 4

**content**
- T53 · A8 · a typing graded as its typist's word, one step once checked; who typed and who checked, by key · `planning/lines-A8-typed-page.md` §3 (content R63-R64)
- T53 · DEC-454 · `content.extent`'s part key in plain words · DEC-454

**extraction** (with screens-document)
- T53 · N1272 (K5445) · what is interpreted: what a member opens or cites; a member's "interpret these parts for <investigation>"; Civicsmith's own proposals from the investigation's words (no AI), labelled and interpreted only on acceptance, built in the beta if they test well on real documents; finding names, organisations and dates across a whole document is reading, not interpretation (K5496, C21 A); the page and search say what was interpreted, for which investigation, by whom and when, with "not interpreted for this investigation" in search, and the document view marks interpreted parts visibly (K5495, C2 A; the mark UX-DESIGN's) · · `planning/plan-T53-capabilities.md` §A Layer 4 (extraction R114-R119, reading-pipeline R64-R65, acquisition R135) and Layer 7 (investigation R26-R32) (R119: a ceiling per level, K5535, PLATFORM's figure)

**reading-pipeline**, **extraction**
- T53 · N1266, N1267 (K5427) · the text bound 100 MB, HTML streamed to it; the held-unread verdict re-run when a reader arrives · `files/SIZES-N1267.md` §3, `REQ-format-registry-beta.md` RF10 `[owed: lines for reading-pipeline not drafted]`

## Layer 5

**local-facts**
- T53 · N1257 (K5451) · a team writes its own layers entry by entry; a wrong shipped rule is reported, not edited; an old fact path still reads · `capabilities/N1257-requirements-modules.md` (local-facts R23-R27) (C3 answered, K5446)
- T53 · A2 (K5468) · a member states a government's year with how checked, refused in order (`FACT_VALUE_REFUSED`, `LAYER_ENTRY_IN_SHIPPED`, `FISCAL_YEAR_IN_RECORDS`) (R31); its standing at `team/<level>:<place>/fiscal_year` (R32) · `capabilities/N1257-requirements-a2.md` (READY, C35)

**connections**
- T53 · N1260 (K1469, K1470, K1486, K1489) · `named_in`: a document as a hop's end, its hub, its sight check · `capabilities/N1260-following-the-trail-a.md` §3 (R74-R76) `[waits: measure M-F1]`

**money**
- T53 · N1260 (DEC-409, DEC-410, DEC-447 (2)) · five money kinds in place of `money_flow`; a party's hub by date and kind; `moneyByParty` · `capabilities/N1260-following-the-trail-a.md` §4 (R36-R38)
- T53 · A2 · fiscal keys by the government's own year; the view only where known; never `*` · `planning/lines-A2-fiscal-year.md` (money, renumbered R39-R41, CONSISTENCY §1)

**explore**
- T53 · N1260 (DEC-409 to DEC-411, K4403 (8)(9)) · every chain between two ends, the most direct, shorter paths beside a member's own, a time stop that can be continued · `capabilities/N1260-following-the-trail-a.md` §5 (R30-R35)
- T53 · N1260 (DEC-447) · each kind's dimension; "Follow from here" per item kind, a fund included; op `followfrom` · `capabilities/N1260-following-the-trail-a.md` §6 (R36) `[owed: standards' `standardsBinding` line]`

**entities**
- T53 · N1257, N1256 · `federalOfficesFind` (op `federaloffices`); a federal office made an entity only when chosen, FOIA its law · `capabilities/N1257-requirements-modules.md` (entities R68)

**registers** (new, after workbooks; K4403 (1)) · T53 · N1259 · listing, imports by resumable slices, search, cite a row, compare, tombstones, interest and refresh, guardrails · `planning/plan-T53-capabilities.md` §A Layer 5; also events (one followed entry one event), local-facts, entities, duties (layer names) there

## Layer 6

**reading-guides**
- T53 · N1257 · procedure guides side by side, one per layer, unranked (R17) · `capabilities/N1257-requirements-modules.md`

**inquiry**
- T53 · A1 (DEC-457) · `setSubject` with a reason, `subjectHistory`, the private-person warning on a subject · `planning/lines-A1-A7-subject-pickers.md` (inquiry R87-R90) (L1 decided, K5515: offices too; L13, K5536: a change refused until the named connections are re-graded; L14, K5539: only its owner or an administrator, else `NOT_THE_QUESTION_OWNER`; L15, K5540: a published or divided question too, the change shown; public-read A1-R7 the dated line on the published case `[UX need to UX-DESIGN]`; L16, K5541: the subject may be taken off with a reason; L17, K5542: a concluded question's too, the conclusion kept)

**leg-earning**
- T53 · A8 · a typed passage's ceiling at its own grain; a leg on it graded by the record · `planning/lines-A8-typed-page.md` §4
- T53 · A1 · "no subject named" as its own `why` (A1-R6) · `planning/lines-A1-A7-subject-pickers.md`

**strength**
- T53 · A8 · a leg on a typed passage counts at its grade; `bio-grading/5` · `planning/lines-A8-typed-page.md` §5

**citation**
- T53 · A8 · a typed passage citable at once; the citation names typist and checker · `planning/lines-A8-typed-page.md` §6 (L11 decided, K5525: the member's credit choice wins); A4-R11 (K5523, L9 = B): a photo's stated time and place citable as "the file says", never as a checked fact; a place in an edition only where the author turned it on (K5514) · `planning/lines-A3-A4-source-picture.md`

**run-rules**, **ai-runs**, **observation-log**, **agent-harness**, **agent-model**, **agent-runner**, **agent-steps**, **agent-worker**, **ai-use**, **ai-gate** (AI-DESIGN, K5457) · their entries: `planning/plan-T53-ai.md`

## Layer 8

**case-grammar**, **case-catalogue**, **publication**, **public-read**, **case-import**
- T53 · A5 (DEC-461), A8 (DEC-464) · case-document format `/10`: the ungraded-passages and typed-passages blocks, their C-41.18 and C-41.19 checks, the edition's statements recorded and served, imported editions' statements kept apart, typist and checkers credited as each chose · `planning/lines-A5-A8-case-modules.md` (L23 K5548, L26 K5552, L11 K5525 decided)

**case-disclosures**, **basis-versions**
- T53 · A5, A8 · ungraded passages listed; a typed passage printed as typed, labelled as of signing; a frozen reading names typist and checkers · `planning/lines-A5-A8-case-modules.md`

**case-authoring**
- T53 · A5 · the sign step lists ungraded passages; the edition states it; never refused for it · `planning/lines-A5-A6-signing.md` (case-authoring R88-R90)

**ratification**
- T53 · A5 · refused only when the statement is missing; the commit records it · `planning/lines-A5-A6-signing.md` (ratification R62-R63)
- C T52-24

**filings** (layer 9 job, listed here with its K5527 line) · T53 · K5527 (4) · R29: a profile template's recorded `sha` equals its counted review's hash; an earlier text flagged · `planning/lines-K5527-texts-and-listing.md` §2

**corpus-export**
- T53 · K5441, K5443 · the whole team record exported by resumable parts, the one way to change region (PL50-PL53) · `platform/whole-record-move-draft.md` `[owed: READY]`

**case-grammar**, **case-disclosures**, **case-checker**, **public-read**, **corpus-export**, **network-notices** (N1259, N1110) · a cited register row as flat extracts in the one `/10`, the seventh reason (K5503), the extract checks, `listingRequest` (R32) · `planning/plan-T53-capabilities.md` §A Layer 8

**public-read** · C T52-23 · **case-disclosures** · C T52-25 · **case-inputs** · C T52-26 · **case-authoring** · C T52-27 · **case-check** · C T52-28

## Layer 9

**conformance** · C T52-29 · **actions** · C T52-30; N1257 R112 (two laws, two clocks; the zone named) · **filings** · C T52-31 · **action-plans** · C T52-32, T52-33 · **action-clocks** · N1257 R27 (the layer a list comes from) · **filing-templates** · N1257 R36 (a template's places may name layers) · all `capabilities/N1257-requirements-modules.md`; layer names in actions, action-records, action-grammar, action-clocks, filing-templates, filings (K5458), filing-templates' shared judge `[owed: BOB writes]` · `planning/plan-T53-capabilities.md` §A Layer 9

## Layer 10

**following** · C T52-34; T53 · N1259 watch a number, never a name; a followed docket daily (K5513) · `planning/plan-T53-capabilities.md` §A Layer 10 · **monitoring** · pause stops slices and polls · `planning/plan-T53-capabilities.md` §A Layer 10 · **scheduler** · `register-import`, `discard-clear`, `mail-clear` · `planning/plan-T53-capabilities.md` §A Layer 10

## Layer 11

**network-notices** (layer 8; listed with layer 11's) · T53 · K5507, K5527 (6) · R23 prepares a submission to the network pages, not the directory of groups (civicsmith.org's list, R32); Purpose, R30 and `site`'s note reworded · `planning/lines-K5527-texts-and-listing.md` §5

**op-declarations**
- C T52-42 · T53 · K4599 · screens declare reads by wave; `screenread` (PL10, PL11); every op and screen a budget class (PL3, PL4) · `platform/combined-read-and-fold-draft.md` §3, `time-budgets-draft.md` §4

**admission**
- C T52-43 · T53 · N1264 · `admit` callable in the room, parity of every refusal, counting unchanged (PL12, PL13) · `platform/combined-read-and-fold-draft.md` §3

**store-door**
- C T52-44, T52-45 · T53 · one RPC admits, stamps and runs; `screenread` inside it; slow reads cut (PL14, PL15) · `platform/combined-read-and-fold-draft.md` §3

**queue-producers**
- T53 · A6 (DEC-462) · one item per member listing each new key, by key words (R56, R57) · `planning/lines-A5-A6-signing.md` (A6)
- T53 · N1257 · `place-profile-arrived` for a layer of any level; a rule change told once to administrators (R58) · `capabilities/N1257-requirements-modules.md`

**queue**
- T53 · K5480, K5478 · `classOfKind` gains `retesting-off` (an OBLIGATION kind: one undismissable item while re-testing is off) and `ai-credits-stop` (R1) · AI-DESIGN A50, `draft-ai-accounts-dec465.md` R75

**queue**, **screens-daily**
- T53 · A6 · a per-key choice of act passed through (queue), a line and two acts per key, never handled by "choose several" (screens-daily) · `planning/lines-A6-queue-acts.md` (Q-A6-1, Q-A6-2 decided, K5456; their wording a UX need)
- C T52-62 to T52-65, T52-104 (screens-daily)

**interface-shell**
- C T52-49 to T52-53 · T53 · one `screenread` per screen open (PL16, PL17) · `platform/combined-read-and-fold-draft.md` §3
- T53 · A7 · one document-picker element with two scopes (A7-R1), cited by screens-inquiry R137, screens-investigate R34 and R52, screens-publish R8 · `planning/lines-A1-A7-subject-pickers.md` (L2 decided, K5516: every document the member may see, labeled by project)

**screens-inquiry** (question, project, objective; after the split, Before R1 (9))
- C T52-66 to T52-69, T52-72, T52-73, each item by the file it names (the Document page's go to screens-document) · T53 · A1 (subject at opening and its change) · `planning/lines-A1-A7-subject-pickers.md` A1 · A7 (the pickers) · `planning/lines-A1-A7-subject-pickers.md` A7 §5 · N1260 ("Follow from here" outside Document) · `capabilities/N1260-following-the-trail-b.md`

**screens-document** (new by the split; the Document page)
- C T52-70, T52-71 and the Document items of T52-66, T52-67 (U10), T52-72 (`document`, `fr28-document`, `t51-document` within the memory cap) · T53 · A3, the Document page's source line (A3-R4) · `planning/lines-A3-A4-source-picture.md` · A8, Cite on typed words and the labels · `planning/lines-A8-typed-page.md` · N1260, "Follow from here" on Document · `capabilities/N1260-following-the-trail-b.md` · DEC-454 (`document.mjs` display rows; its twelve `unsupported.<kind>` rows withdrawn by DEC-467, `ico` kept) · DEC-467 (held, refused, macros, pages, converted, password; the photo's "Taken … near …" and "Left out of the safe picture: {what}", A4-R2, A4-R3) · `files/KIND-TABLE.md`, `files/UX-NEEDS.md` · N1272's Interpreted row (R141-R147, from `planning/plan-T53-capabilities.md`'s screens-inquiry rows) · `capabilities/N1269-N1272-requirements.md`, `capabilities/N1269-N1272-changes.md` · DEC-474's chips on the head and revisions

**screens-intake**
- T53 · N1269 (K5446, K5447) · before a file is added, each kind's largest file read whole is stated; a file over its limit refused with its size and limit and offered a way in (a register by a filter, N1259; else the part the member needs) · `files/SIZES-N1267.md`, K5446, K5447
- T53 · K5425 (b) · `store-assembly/r10-fixtures-run.test.mjs` line 27 (owed-later) is an orphan: no screens-intake test holds an `owedLater`; the job says whether a marker is coming, else the line goes · `tests-sweep/FIXTURES.md`
- C T52-59 to T52-61 · T53 · A3 (R72, R73), DEC-454 and DEC-455 (`capture.mjs`: display rows, "Show more rows", Cancel sending), DEC-456 (r9-states R65 `[waits: the design's row]`), held-and-named and refused sentences · `planning/lines-A3-A4-source-picture.md` (A3-R3, A4-R10), `files/UX-NEEDS.md`, `files/KIND-TABLE.md`, DEC-454, DEC-455, DEC-456

**affordances**, **interface-shell**, **screens-daily**, **screens-investigate**, **screens-action** (N1260, N1257)
- T53 · N1260 (DEC-447) · `cs.follow`, one "Follow from here" fold read only when opened (interface-shell); its menus (affordances R72-R74); Find results draw it (screens-daily); people, events, money, chain steps and Explore's three acts (screens-investigate R67-R69) · `capabilities/N1260-following-the-trail-b.md`
- T53 · N1257 · `request` offers the laws whose `governs` holds the office's level (screens-action R60) · `capabilities/N1257-requirements-modules.md`

**screens-investigate**, **screens-publish**
- C T52-74 to T52-80 · T53 · A7 (their pickers) · `planning/lines-A1-A7-subject-pickers.md` A7 §5; A5 (screens-publish: the signing step, the published statement)

**screens-settings**, **installer**, **installer-steps**
- C T52-58, T52-92 to T52-95 · the AI screens (below)
- T53 · N1257 (K5450, K5452) · the places page as a tree, the choice a set, "Report a rule" the one act on a shipped rule, an information mark on each entry and the page (screens-settings R82, R83); the install asks where the work focuses, as a set, nothing below federal preselected (installer R86); instance-setup holds the choice and the team's layers (R107-R111) · `capabilities/N1257-requirements-modules.md` (D3 = C7, answered: K5452, K5497) (READY, C29) (CONSISTENCY §2.17 decided)
- T53 · K5444, K5442, K5454 · a copy chooses its level at install (Team, Institution; Enterprise listed as not yet available, PL29) and can move up later · `platform/service-levels-draft.md` `[owed: READY; Levels 2-3 study]`
- T53 · N1273 (K5440, K5441, K5443) · the region picker's two honest choices ("near me" a hint; "keep my data in this region" storage in a jurisdiction, the room and its R2 bucket; what runs elsewhere said), the choice fixed and the move by export and import said before it (PL32); Settings states the placement truthfully (PL33) · `platform/record-placement-draft.md` §3 (installer, installer-steps, plane; screen needs to UX-DESIGN)
- T53 · K5443 · the one way to change region: whole-record export (corpus-export, layer 8) and the installer's import (PL35, PL50-PL57) · `platform/whole-record-move-draft.md` `[owed: READY; one point maybe Bob's (a move carries members' sign-in material?)]`

**control-plane**, **plane**
- C T52-85 to T52-91 · T53 · N1264, K4599: routes `screenread` and the folded admission · `platform/combined-read-and-fold-draft.md` §3
- T53 · K5425 (b) (control-plane) · `store-assembly/r10-fixtures-run.test.mjs` lines 23 (job-registrar) and 29 (owed-ledger) are orphan fixtures-run lines: the tests now run the real registrar and wrap the real ledger; delete each line, or name the stand-in it is owed for · `tests-sweep/FIXTURES.md`

**journey-check**
- T53 · N1260 (K4354, DEC-447 (4)) · an act counter against a target set before the walk, the 2-second assertion, the Sewer Service Fund journey (writes nothing) · `capabilities/N1260-following-the-trail-b.md` `[first: BOB's K lines for the two target files]`
- C T52-97, T52-98 · T53 · K4354 · the budget walk at 1280 and 390 px (PL5, PL6) · `platform/time-budgets-draft.md` §4 · T53 · N1268 · the acceptance corpus walk · `files/CORPUS-N1268.md` (CONSISTENCY §2.5)

**ai-issuer** (new; Civicsmith's own Worker; K5457)
- T53 · K5457 · serves the signed catalogue, advisories and seal key; single-use challenges; sealed test bundles received and kept for the off-Worker scorer; Bob's decisions recorded; signs and opens nothing · `lane-ai-design/draft-ai-issuer.md` R1-R24 `[waits: BOB's deploy to account 20b5…7f72, the operator's tools; R18's retention per K5482]`
- T53 · K5482, K5487 · a team's own sealed result at once (`GET /ai/result/<token>`, R25, op `airesultown`); opt-in health reports received (`POST /ai/health`, R26); R13, R16-R18 amended · `lane-ai-design/draft-ai-issuer.md`

**screens-settings**
- T53 · DEC-470 · the file-import key `registerfileimport` read by `keys.mjs`; the old key held until then · DEC-470
- T53 · P9 (BOB #324, found on plat-s1) · with two or more administrators, `memberadd` and `adminendorse` answering `CONSENSUS_REQUIRED` (member-roster 4.7) leave an earlier `ui.invite` drawn (`members.mjs:317, 336` set it only when the answer carries `invite`, never clear it), so a dead `#invite=` link stays on screen: on `CONSENSUS_REQUIRED` clear any shown link and draw `screen.members.invite.nolink` with `awaiting`'s names (DEC-483); a link only when the answer carries `invite` · Test: a shown link, then `memberadd` answering `CONSENSUS_REQUIRED`, leaves no link and draws the awaiting sentence; Control: an ordinary invitation draws its link
- T53 · K5562, K5563 · Members: the founder's remove control at two administrators, every removal and its reasons shown to the team (K5568), her issuing endorsement, the cancel control, `nolink` never for her · `planning/lines-K5562-K5563-founder.md` K5562-R4, R5, K5563-R7, R8; words DEC-484, DEC-485 (U517, U518)
- T53 · N1220 (K5457) · `connect`, `teamai`, `projectai` and their acts retired, in the same change as screens-ai's first screens · `lane-ai-design/draft-assistant-screens.md` §2

**screens-ai** (new, Before R1 (9); the AI screens)
- T53 · N1220 (DEC-420, K5457) · `aiproviders`, `aiconnect`, `aimine`, `aiproject`, `aimoments`, `aitest`, `airesults` · `lane-ai-design/draft-assistant-screens.md` §2, §4, §5; `lane-ai-design/UX-REQUIREMENTS.md` `[waits: UX-DESIGN's rows, B555]`
- T53 · DEC-465 · origin an ordinary check ("Not offered" row removed); a team account's owner opt-in "Projects and members may add this account"; a member's list ordered (`aiorderset`); a key kept sealed in the team's Civicsmith (`aikeyseal`); aimoments names whose checks apply · DEC-465 → `lane-ai-design/draft-ai-accounts-dec465.md` (ai-accounts R69-R74, layer 2)
- T53 · DEC-466 (screens-ai, with interface-shell and the installer for their halves) · each label names the AI (`screen.machine.*.ai`); a finished run lists its parts and switches (N1219: ai-runs' segments); Setup's ready and not-ready states (interface-shell R20's read); the installer's gateway line matched to K4464's grant · DEC-466 → ai-runs R99-R104 (layer 6), instance-setup R109 and the installer lines below
- T53 · DEC-466 U5, K5471 (2) (installer, installer-steps, instance-setup) · the installer asks for exactly the AI gateway's two permissions (installer R2, A47's R107) and an install without them completes, the assistant still usable (installer-steps R45, A47's R108); Setup's ready state (instance-setup R109, A47); the health sender beside `update-check` (R110, K5487) · `lane-ai-design/draft-instance-setup.md` `[owed: whether "AI Gateway - Edit" carries reading, OPEN in the draft]`
- T53 · K5471 (5) (installer) · the installer's Logpush read is refused (Cloudflare "Authentication error" on plat-s1's install): its scopes (K5449, K5460) lack Logs Read: the installer asks for a read-only Logs scope (installer R2's count to seven), the check keeping its strength (K5473 (2)) · K5471, K5473 `[first: Bob's one act, registering the scope on the OAuth client]`
- T53 · K5459 · per-member use on accounts the team or project pays for (`aiusebymember`) · `lane-ai-design/draft-assistant-screens.md` §5 U7; DEC-468, DEC-469 (the words reconciled: the payer's by-member view, the opt-in note, moment j)

**op-declarations**, **op-grades**, **interface-shell** (the assistant)
- T53 · N1220, K5482-K5489 · the AI ops declared (the 43 plus `airesultown`, `aihealthshare`, `aihealthpreview`, `aicreditsclear`, `aiwaitswitch`, `airetestset`) with grade and budget class (an "AI act" class owed by PLATFORM, P1), the retired ops removed; the assistant's reads as one combined read (P2) · `lane-ai-design/draft-assistant-screens.md` §4, §5 P1, P2 `[owed: PLATFORM's AI act class]`
- T53 · N1220 · every machine result labelled with its AI's name in the screens that show one (screens-intake, -daily, -investigate, -publish, -action, -wizards, -document) · `lane-ai-design/draft-assistant-screens.md` §2 (ii), §5 U1

**installer**, **journey-check**, **notice-producers**, **queue**, **op-*** , **store-assembly**, **control-plane**, **instance-setup**, **stewards**, **site**, **screens-*** (CAPABILITIES) · N1265's check and gate (installer R86-R93, replacing T52-92's probe and T52-94's steps; journey-check R39-R41), installer R2 one line for every scope ask `[owed: BOB settles the count]`, register notices and kinds, the registers screen (screens-investigate, rec.), mail's ops and door, stewards' decline record (K5530: B2 stewards' own mail, B3 closed `RULE_PARTS`), N1272's Interpreted row (DEC-476, DEC-478) · `planning/plan-T53-capabilities.md` §A Layer 11

**load-check** (new)
- T53 · N1274 · `runProfile`, `seedCopy`, `report` on a scratch copy only (PL40-PL43), run in R2 · `platform/load-test-draft.md` §5

**The design rows of DEC-474 to DEC-478** (merged, ec02fce0bc; each module's job reads its DEC row at START)
- T53 · DEC-474 (DEC-461's drawing) · interface-shell: a `ceiling` scale beside `capture` in `cs.grade` and the chip tooltip, the capture icon until one is drawn; screens-document, screens-intake, screens-investigate: chips on a document or source drawn on `ceiling` (Document head and revisions, Held, money, timeline, person, calculation), the fold's choice label `screen.question.leggrade.choice`; ratification and case-authoring: the signing list and the edition's statement as A5 (`planning/lines-A5-A6-signing.md`) in DEC-474 (4)'s words; screens-publish draws `screen.published.ungraded` with its "Which passages" fold
- T53 · DEC-475 · screens-ai: U8 the results page, U9 the health share and preview, AI6 the re-test switch and its Queue item, AI14 moment d's wait-then-switch (wait lengths 5, 15, 60 minutes, BOB's), U10 states g and h, K5483 state i, K5486's opt-in, K5488 moment l; the ops as AI-DESIGN's drafts (`airesultown`, `aihealthset`, `aihealthpreview`, `airetestset`, `aiwaitswitch`) and the Queue kinds `retesting-off` and the payer-flag stops
- T53 · DEC-476 (AI15, K5493) · screens-ai: `aiconnect` step 4 asks no one to accept terms (the tick box undrawn), the free-tier acknowledgement kept, the fold quoting the binding terms; ai-accounts R76's dated change is `ai.notice.termschange` to whoever manages the account
- DEC-477 · words only, nothing new for jobs (its dropped `screen.capture.refused.type.rar`, `.program` read by no code); DEC-478 · the Interpreted row's grouping and `part.*` names (screens-document, CAPABILITIES' N1272 lines above); `text.sourcechanged` (K5512) not drawn until the reviewed text's screen is

**DEC-479 to DEC-483** · doorbell `inboxview`, the unsure-word count, `readheld`'s weight, the subject's history and public line, the email names' marks, the Inbox, the ceremony's emails: `planning/plan-T53-design-rows.md`

**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)

The other carried layer-11 entries (wizard-scripts T52-35, T52-36; op-grades T52-37, T52-38; affordances T52-39; tasks T52-40; instance-setup T52-41; store-assembly T52-46, T52-47; store-request T52-48; screens-entry T52-54 to T52-56; screens-wizards T52-57; screens-action T52-81 to T52-84; site T52-96) stand as carried, each `C`.

## Measurements (K5567: at once unless it measures code R1 builds; scratch copies BOB's under K5120, never biosmoke8)

**At once, alongside R1** (each measures what exists now or prepares a copy; its result goes to the job that reads it, before that job's layer START where it can):
- Registers, on the source files and a throwaway on a scratch copy (`planning/plan-T53-capabilities.md` §C): M-R3 index storage at 73,043 / 1M / 5M rows (decides S1-S4 before registers' layer-5 START), M-R7 streaming throughput, CPU, subrequests and decoder state (sets `REGISTER_STREAM_MAX`, `SLICE_*` before register-readers' layer-1 START), M-R4 identifier forms, M-R8 count queries, M-R10 contact-shape false hits (by script, the drafted rule), M-R11 volatile text, M-R12 extract sizes; the federal zips BOB's download.
- PLATFORM (BOB #324): the S1 Level 1 baseline and soak on plat-s1; per-table bytes and the plane-only measuring ops; P-M17 and FILES' L1-L6 on the alpha's reader; the budget walks of today's screens and acts (`platform/time-budgets-draft.md` §6 L1); the S2 prototypes B and C and T-a (throwaway; T-a is Before R1 (4)); the Enterprise quote; the load test's short "before" run on the alpha's design with PLATFORM's study driver (`platform/load-test-draft.md` §6; load-check itself is built in R1).
- Preparation: the acceptance corpus's files (N1268, `files/CORPUS-N1268.md`); M-N1272's files, pinned questions and bar in `MEASUREMENTS.md`, and Bob's blind marking of the gold set (K5537); N824 P1-P2 with M1 (Before R1 (6)) and P3's delivery checks once Bob's Email Routing domain exists (N1159).

**After the code it measures** (each on a scratch copy deployed from the tranche, run the moment its module merges, never at a round's end; the one dependency named):
- M-N1272, the proposals' precision and recall on the corpus · after extraction R114-R119 (layer 4).
- Interpretation timings (`interpretationOf`, `proposeParts`, `partsOf` at 5,000 pages and 1M rows) and the per-level ceiling's figure (R119, K5535) · after extraction and investigation (layers 4, 7).
- N824's door CPU at 25 MiB · after mail-reader and mail-door (layers 1, 3).
- The acceptance corpus walk (N1268) · after journey-check's walk and the readers (layers 1, 11).
- The registers journey · after registers and the registers screen (layers 5, 11).
- PLATFORM: the after-figures of the fold, the combined read and the work fixes · after PL12-PL14 (admission, store-door, layer 11); per-type load of the photo redraw, Tier 2 and held types, and archive fan-out · after the new readers (layer 1); the N1273 region picker and the `eu` rehearsal · after the installer's new path (layer 11); measured Level 2 · after N1271 is built.
- The load test per level (N1274) and the budget walk L2, L3 · after load-check and layer 11's deploy.

**No R3.** A defect a measurement finds goes to its module's job, which stays open until its layer closes (P10); a defect in a layer already closed goes to the tranche's completion round (§5.2), the only later round.

## Left out of T53 (P19), each with its hard reason

- CAPABILITIES' left-outs, each with its hard reason: `planning/plan-T53-capabilities.md` §E (webhooks, OpenFEC, OpenCorporates, the assisted register acts, company officers' bulk import until its line, Form 700 and the unmeasured registers, the listing desk, payment probe, Tier 2 texts, court-petition templates, interpreting everything, K5458's unlisted names).

- K5424 · lift civicsmith.org's `noindex` · Bob's: "not until the 1.0 release is deployed" (K5526: the beta is a release before 1.0; the site stays hidden through it)
- K5447 (B) · keeping an over-limit file and reading only part · Bob's: waits until Civicsmith's proposals work well (K5445)
- N1270 · audio, video, forum formats · Bob's: after 1.0 (K4628); held and named meanwhile (K5436)
- K5454 · Enterprise support (Level 3) · Bob's, a hard reason outside the product: built with the first Civicsmith team that wants an Enterprise-scale copy; listed at install as not yet available (PL29)
- FILES Tier 3 readers (PST/OST, Access and the rest) · Bob's (K5437): each by its own ruling when a real file is shown

# T53's build plan: its structure (draft)

**Status** · DRAFT, not READY · PLANNING #1 (L1), 2026-10-27. A proposal for BOB: the shape of T53's comprehensive build plan, the carried T52 entries placed by layer and module, where each design lane's work lands in `build/layers.md`, and the new modules the lanes are likely to propose. Nothing here is a requirement line or a plan entry; BOB writes both (LANES.md §1). It turns READY once every lane's drafts are in and folded (§6 lists what each lane still owes). Read with `build/plan/carried-T52-R1.md`, `build/layers.md`, `build/modules.json` and `build/plan/next.md`.

## 1. The plan's shape (recommendation)

| step | what | why |
|---|---|---|
| R0 | TESTS-SWEEP's merge (option A, K5418): BOB's §5.10 mechanical pass, every touched module run once; then the words and fixtures checks at 0 | Every R1 job edits tests the sweep rewrites; sweep first means no job inherits an English-pinned test, and the checks a job's `complete` runs are clean (§5.2 (1): no tranche opens while the words check reports a finding). |
| R1 | One round, layers 1 to 11 in order, one job per module that has entries (K5319): the carried entries, the defects JOURNEYS finds, and every new capability the lanes design | Bob's direction (K5417): design whole, one comprehensive plan, then build. One round keeps every capability's layers in one pass, so no capability's top half waits for a later round. |
| R2 (measure) | Deploy R1 to a scratch copy and run what only a deployment can show: the per-level load test (N1274), the acceptance corpus (N1268), K4354's 2 s and 15 s budgets per screen (PLATFORM), the charge-or-rule accuracy measure (N1258) | Each is a measurement on a live copy (P19's "a measurement"); its defects become R3's entries. The scratch deploys are BOB's under K5120, never biosmoke8 (K5434 (1)). |
| R3 (completion) | Fixes from R2 and modules whose layer closed (P10) | §5.2: the tranche's completion round is its last. |

**Within-layer order** (K5434 (2), BOB's). No waves: P10 starts every job of a layer at once. A job whose used service another job of its layer changes takes the change as a CHANGE; a dependency that truly cannot run concurrently is placed in a lower layer (the order BOB's, P4; a new layer Bob's). So §3's `after` column marks where a CHANGE is expected, not a start order.

**Each entry's form** stays T52-R1's (`archive/T52-R1.md`, "Reading an entry"): cause lines only, `first: settle X`, `[waits: X]`, `after <entry>`, the requirement ids it meets. New capability entries cite the lane draft and the requirement ids BOB writes from it.

**Each job's reading set** is measured against the 600 KB budget at START (`reading-sets.py`, K2700). The plan names for each job the lane draft sections it reads, so a new-capability job reads its requirements and the one draft that explains them, never a whole lane folder.

## 2. Census

- **Legacy census** (§5.2 (2)): no module is legacy (`modules.json` has no `from`; layers.md: legacy-ui retired at T51, K4100). The plan's opening line says so.
- **Carried entries**: 78 (T52-23 to T52-98, T52-100, T52-104; T52-103 done, K5406). Layers 8 (6), 9 (5), 10 (1), 11 (65), 1 (1, T52-100: file-scanner, moved from the completion round into R1's layer 1, K5434 (3)).
- **Their dependencies on T52's layers 1-6**: W1 (record-grammar), W3 (member-roster), W4 (membership), W5 (provenance), W7 (events), W10 (query-language), W11 (citation) were T52 R1 entries of layers 1 to 6, which closed and merged into `main` (e5f7190d, K5419). So every `after W1`…`after W11` in the carried file is met; JOURNEYS's confirmers say whether each fix holds on 0.87.0's successor.

## 3. Carried entries by layer and module

`kind`: D defect (walk cause), S settle first (cause unproven), N requirement not yet met, W words or design rows to draw, P performance. `after` names a same-layer entry (needs the wave order of §1) or an earlier one.

| layer | module | entries | kind | after | lane that may change it |
|---|---|---|---|---|---|
| 1 | file-scanner | T52-100 | D | — | FILES (N1266 readers, renderer version) |
| 8 | public-read | T52-23 | N | — | — |
| 8 | ratification | T52-24 | S | — | TESTS-SWEEP (K5343 reds sorted) |
| 8 | case-disclosures | T52-25 | D | — | — |
| 8 | case-inputs | T52-26 | D | — | — |
| 8 | case-authoring | T52-27 | D (BLOCKER) | — | — |
| 8 | case-check | T52-28 | D | — | — |
| 9 | conformance | T52-29 | D, S | — | — |
| 9 | actions | T52-30 | S | — | — |
| 9 | filings | T52-31 | D | — | — |
| 9 | action-plans | T52-32, T52-33 | D, S | — | AI-DESIGN (assistant-suggested options) |
| 10 | following | T52-34 | test re-point | — | CAPABILITIES (alerts and watches, N1259) |
| 11 | wizard-scripts | T52-35, T52-36 | D, W | — | — |
| 11 | op-grades | T52-37, T52-38 | N, confirm | — | — |
| 11 | affordances | T52-39 | W | — | — |
| 11 | tasks | T52-40 | D | — | — |
| 11 | instance-setup | T52-41 | D | — | PLATFORM (levels), CAPABILITIES (place layers) |
| 11 | op-declarations | T52-42 | P | BOB's throwaway figures (K4599) | PLATFORM |
| 11 | admission | T52-43 | P, S | op-declarations | PLATFORM |
| 11 | store-door | T52-44, T52-45 | D (BLOCKER), P | admission, op-declarations | PLATFORM |
| 11 | store-assembly | T52-46, T52-47 | S, test | — | TESTS-SWEEP |
| 11 | store-request | T52-48 | N | — | — |
| 11 | interface-shell | T52-49 to T52-53 | D, S, N, P | wizard-scripts (T52-51); op-declarations, store-door (T52-53) | PLATFORM, UX-DESIGN |
| 11 | screens-entry | T52-54 to T52-56 | D, N, W | — | UX-DESIGN (words owed) |
| 11 | screens-wizards | T52-57 | D | — | — |
| 11 | screens-settings | T52-58 | D | — | AI-DESIGN (provider screens), PLATFORM (region) |
| 11 | screens-intake | T52-59 to T52-61 | D, S, W, test | — | FILES (safe view of each type), CAPABILITIES (email) |
| 11 | screens-daily | T52-62 to T52-65, T52-104 | D, W, S, P | tasks (W20), interface-shell (W23) | PLATFORM |
| 11 | screens-inquiry | T52-66 to T52-73 | D, S, N, W, P | — | AI-DESIGN, FILES (N1272), PLATFORM |
| 11 | screens-investigate | T52-74 to T52-77 | D (BLOCKER), S, W | — | CAPABILITIES (N1260 "Follow from here") |
| 11 | screens-publish | T52-78 to T52-80 | D, N, S | — | — |
| 11 | screens-action | T52-81 to T52-84 | D, W, S | — | — |
| 11 | control-plane | T52-85 to T52-88 | D (BLOCKER), N, P | store-door, admission | PLATFORM, FILES (uploads, archives) |
| 11 | plane | T52-89 to T52-91 | N, S, P | control-plane | PLATFORM (record split N1271), AI-DESIGN (R114's remote path) |
| 11 | installer-steps | T52-92 | W | — | PLATFORM (levels, region) |
| 11 | installer | T52-93 to T52-95 | S, W | installer-steps | PLATFORM (N1273) |
| 11 | site | T52-96 | W | — | — |
| 11 | journey-check | T52-97, T52-98 | N | installer | FILES (N1268 corpus), PLATFORM (N1274) |

Layer 11 alone carries 26 jobs with 65 entries before any new capability is added. Its same-layer `after`s (op-declarations → admission → store-door → control-plane → plane → interface-shell → screens) are carried as CHANGEs (K5434 (2)); the plan names, per job, the services it expects to change under it.

## 4. Where each workstream lands (from `next.md`, `layers.md`, `modules.json`)

| workstream (lane) | entries in `next.md` | home modules by layer | new module likely? |
|---|---|---|---|
| The assistant whole and AI provider selection (AI-DESIGN) | N1220, N842, N1105, N1198, N1199, N1200, N1219, N1276, N1258, N829 | L1 bundler; L2 ai-accounts, credentials; L3 provenance (N1200); L5 connections (N1200), observation-log (N1219); L6 run-rules, ai-use, ai-runs, run-productions, skills, question-explorer, answers, agent-harness, agent-model, agent-runner, agent-steps, agent-worker; L7 investigation; L8 case-account; L11 signin-door, op-declarations, instance-setup, screens-settings, screens-inquiry, control-plane, plane, journey-check | Yes, probably: a provider boundary (§5 row 1), and possibly a screens module for DEC-420's seven AI screens |
| Service levels, performance, record placement (PLATFORM) | K4599, N1264, N1271, N1273, N1274, N1262 | L1 runtime-limits (per-level bounds); L2 record-core (N1271); L4 extraction (N1271); L6 contradiction (N1262); L11 op-declarations, admission, store-door, store-request, control-plane, plane, interface-shell, screens-*, installer, installer-steps, bundler (L1) | Perhaps: a bulk-table store for the record split, and a load-test harness (non-product, like journey-check) |
| Deferred features (CAPABILITIES) | N1259, N1260, N1257, N1256, N824, N1110, N1272, N751, N858 | L1 jurisdictions, doctypes; L3 capture (N824); L5 entities, people, money, explore; L6 reading-guides (N858); L8 network-notices (N1110), publication (DEC-408's filter); L9 filing-templates (N858); L10 monitoring (R30's pause), following (watches, alerts); L11 instance-setup, screens-settings, screens-investigate, screens-intake, answer-envelope, op-declarations, control-plane | Yes: `register-readers` (L1) and `registers` (L5) per `draft-T52-DEC406.md` B-1 (Bob's, not yet answered); possibly `screens-registers`; an email intake for N824; possibly a place-layers module for N1257 |
| File types and sizes, acceptance corpus (FILES) | N1266, N1267, N1267a, N1268, N1269, N853c | L1 format-registry, office-readers, odf-reader, csv-reader, pdf-reader, image-codecs, ocr-worker, sheet-worker, file-scanner, runtime-limits (bounds), doc-clean; L3 acquisition, capture, file-safety; L4 reading-pipeline, extraction; L11 control-plane (uploads, `archive.mjs`), screens-intake (safe view), journey-check (N1268) | Yes, probably: readers for the missing types (§5 rows 6-8) and the acceptance corpus's home |
| The alpha's defects (JOURNEYS) | the 31 barely walked screens; carried W entries | any module; most in L11 screens | No (defects go to owning modules) |
| Tests rethink, option A (TESTS-SWEEP) | K5258, K5313, K5339, K5343 reds, 89 fixtures | test files of every module | No |
| Screens and words (UX-DESIGN) | DEC rows owed by each lane | L1 setup-words (regenerated at each design merge); L11 screens-* | No |

**Overlaps to settle once, in one module each** (my recommendation for BOB, lower-level, P17):
- Email: FILES reads `.eml`/`.msg` as a file type (L1 reader); CAPABILITIES' N824 brings mail in by a forwarding address (L3 intake). The reader is one module both use; the intake uses it.
- ZIP: FILES reads each file inside (L1 reader); control-plane's `archive.mjs` already unpacks archive members (T52-85). The reader moves to L1; control-plane keeps only the route.
- Alerts and watches: CAPABILITIES' recommendation puts them in `following` (L10), with `monitoring` only pausing them. PLATFORM's time budgets must include the background slices.
- Per-level limits: PLATFORM's service levels and FILES's sizes both state bounds; one table in `runtime-limits` (L1), read by every reader and by the installer's level display.

## 5. New modules the lanes are likely to propose

Each carries product capability, so its addition, layer and place come to Bob (layers.md ruling 5 as amended by P17); `uses` and order within a layer are BOB's. None is proposed yet; this is where each would sit if proposed, so the plan's order can be checked early.

| # | candidate | lane | layer, after | uses (first reading) | state |
|---|---|---|---|---|---|
| 1 | the AI provider boundary (one interface every provider implements: Anthropic and others alike, K4421) | AI-DESIGN | L2 after ai-accounts if it holds only accounts and keys; L6 before ai-runs if it speaks to models | ai-accounts, credentials, runtime-limits | waits on AI-DESIGN's module list (keep, adapt, retire) |
| 2 | screens for DEC-420's AI screens (aiproviders, aiconnect, aimine, aiproject, aimoments, aitest, airesults) | AI-DESIGN, UX-DESIGN | L11 among the screens, after screens-settings | interface-shell, op-declarations, store-request | or inside screens-settings; BOB's if no capability is added |
| 3 | `register-readers` (pure readers of NetFile, CAL-ACCESS, FEC, Form 700, licence files) | CAPABILITIES | L1, after csv-reader and office-readers | csv-reader, office-readers, format-registry, jurisdictions | drafted in `draft-T52-DEC406.md` (B-1, option A recommended) |
| 4 | `registers` (imports, search, cite a row, watches) | CAPABILITIES | L5, after people and money | register-readers, capture, provenance, people, money, entities | as row 3 |
| 5 | email intake (N824, a per-team forwarding address) | CAPABILITIES, FILES | L3, after capture | capture, provenance, the email reader (row 7) | Bob: "D42 - email: A", after upload is in use (K2425) |
| 5a | FILES's tiers (K5435-K5437): Tier 2 read in the beta (macro-enabled Office and templates, .ics, .vcf, MBOX, MHTML, SVG, BMP, AVIF/HEIF, JPEG 2000, JSON Lines, GeoJSON, KML/KMZ, .srt/.vtt, text by content, single-file .gz/.bz2/.xz/.zst); a type not yet read held whole, safe-graded and named (K5436); Tier 3 held until a real file appears | FILES | readers in L1; the held-and-named path in file-safety, capture (L3) and reading-pipeline (L4) | — | ruled; FILES's draft places each |
| 6 | `structured-text-reader` (JSON, NDJSON, XML, SVG, KML, GeoJSON, ICS, VCF, SRT, VTT, to 100 MB) | FILES | L1, after ooxml, before format-registry | ooxml, setup-words, runtime-limits, test-support | READY (`files/REQ-readers-beta.md` SR1-SR7) |
| 7 | `mail-reader` (EML, MSG, MBOX; attachments as members) | FILES | L1, after structured-text-reader, before format-registry | ooxml, structured-text-reader, setup-words, runtime-limits, test-support | READY (ML1-ML6); N824's intake uses it (CONSISTENCY §2.3) |
| 8 | `reader-container` (legacy Office and RTF by conversion, every image kind, archives; K4831 (2)) | FILES | L1, a standalone worker like file-scanner | runtime-limits, bundler, test-support | READY as CC1-CC6; not yet in `modules.json` (CONSISTENCY §2.9) |
| 9 | acceptance corpus (N1268) | FILES | no new module: a walk of journey-check (CONSISTENCY §2.5) | — | READY (`files/CORPUS-N1268.md`) |
| 10 | `load-check` (N1274) | PLATFORM | L11, beside journey-check (non-product) | op-declarations, runtime-limits, test-support (not journey-check, CONSISTENCY §2.6) | READY (`platform/load-test-draft.md` PL40-PL43) |
| 11 | bulk record tables in R2 (N1271's split) | PLATFORM | L2, after record-core | record-core | `record-placement-draft.md` not READY (three points Bob's) |
| 12 | place layers (N1257) | CAPABILITIES | no new module: layers in jurisdictions (L1), team layers held through instance-setup and local-facts | — | READY (`capabilities/N1257-places-in-layers.md`); its two requirement companions not READY |

Adding modules re-pins membership's `MODULE_ORDER` (R83) and regenerates `layers-view.html`; that work is a BOB act before R1's layer 2 START.

## 6. What each lane owes PLANNING (from LANES.md §1 "What you deliver")

For every lane: requirement drafts per module (provides, uses, keeps, satisfies, each line with its test); new modules with layer and `uses`; ops and their grades; screen needs (to UX-DESIGN through BOB); what is measured and on what copy; needs from other lanes. In particular for the plan's order:
- **AI-DESIGN**: the keep, adapt, retire list for the twelve AI modules; which T50-left ids are rewritten or retired (K3718 (2)); whether plane R114 moves to the assistant's side (T52-89).
- **PLATFORM**: per-level bounds (one table); the combined read's op shape and which screens take it first (it changes T52-42 to T52-53, T52-65, T52-73, T52-88, T52-91); whether the record split is R1 work or after R2's measures.
- **CAPABILITIES**: Bob's answers to B-1 and the other open points of `draft-T52-DEC406.md` §6 and K4403; which N1260 parts are R1 and which wait on the assistant (N1258).
- **FILES**: the type list after the study (K4632), which types extend a reader and which need a new one; the acceptance corpus's files and where they are kept.
- **JOURNEYS**: for each carried entry STANDS / FIXED / CHANGED; new defects with owning modules.
- **TESTS-SWEEP**: the module list it touched and the verdict, before R0.

## 7. Questions for BOB, answered (K5434, BOB #321)

- **Q1** · R2's scratch-copy deploys (N1274, N1268, the time budgets): BOB's under K5120, never Bob's; never biosmoke8.
- **Q2** · No waves; same-layer dependencies are CHANGEs, or the dependent work moves to a lower layer (§1).
- **Q3** · T52-100 goes into R1's layer 1.
- **Q4** · Option (a): one round, each entry its cause line and a pointer; each capability's detail in its own file under `build/plan/beta/`, read whole at START; (b) rounds by layer group only if (a) still passes 51,200 bytes.

## 8. Owed to the plan by rulings and design merges since L1 (BOB #321, 2026-10-27)

| source | what the plan carries | module(s) | state |
|---|---|---|---|
| DEC-454 (U498, merged `c08ea4029`) | draw the display rows in place of stand-ins; `screen.document.unsupported.<kind>` by the reading's kind; sizes reach members in MB; plain names for file-safety's partial-scan reason and `content.extent`'s part key | screens-intake (`capture.mjs`), screens-inquiry (`document.mjs`), file-safety, content | entries (code only, no new requirement) |
| DEC-455 (U498) | a preview's next rows from `next_row` (owed op `previewmore`, name BOB's) and "Show more rows"; the parted upload's Cancel and canceled line (`captureuploadabort`, declared) | screens-intake (J46, J47), capture (the op), op-declarations | entries; the op needs a requirement line (capture) |
| DEC-456 (U498) | screens-intake re-points r9-states R65 at `screen.capture.read.queued` once the design returns the row | screens-intake | entry, `[waits: the row's return]` |
| A1 DEC-457 | a question's subject at opening, optional, changeable with a reason in history | inquiry, screens-inquiry | lines drafting (L2) |
| A2 DEC-458 | a government's fiscal year: from the place's records, else stated by a member with how checked; the view only when known | money, civil-time, the place's module | lines drafting (L2) |
| A3 DEC-459 | the source link for listed members on Document and Held; others "Handed in through the doorbell" | doorbell, screens-intake, screens-inquiry | lines drafting (L2) |
| A4 DEC-460 | a safe picture redrawn from pixels; only metadata unsafe to carry dropped, the rest shown as data; its security review | file-safety (with FILES, PLATFORM) | lines drafting (L2) |
| A5 DEC-461 | signing lists every ungraded passage; sign anyway; the edition says so | ratification, case-authoring | lines drafting (L2) |
| A6 DEC-462 | one queue item per member listing each new signing key | queue-producers, the key's module | lines drafting (L2) |
| A7 DEC-463 | pickers: this project's documents first, "Show documents from your other projects" | screens-inquiry (and every picker) | lines drafting (L2) |
| A8 DEC-464 | a typed page citable at once, graded as its typist's word, one step higher once checked | extraction, leg-earning, strength, citation | lines drafting (L2) |
| K5425 (b) | the fixtures findings that need a module's judgment, listed by TESTS-SWEEP by module and test file, become T53 job entries | per TESTS-SWEEP's list | waits on TESTS-SWEEP |
| K5427 | the text bound is 100 MB for plain text, JSON, XML and every text-like type | the readers, runtime-limits (FILES's draft) | waits on FILES |
| K5424 | civicsmith.org stays noindex until 1.0 is deployed; 1.0's plan carries the lift | site | left out of T53, hard reason: Bob's (1.0's deployment) unless T53 is 1.0's build (Q5) |

- **Q5** · Is T53's beta the 1.0 release, or a release before it? It decides whether K5424's entry (lift `noindex`) is in T53's plan. I read "the beta" as before 1.0 and leave it out; BOB to confirm from the rulings.
- **Bob's questions** from this lane now go to BOB for `build/plan/beta/QUESTIONS.html` (K5426), each with its explanation, options and recommendation.

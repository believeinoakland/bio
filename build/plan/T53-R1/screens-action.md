# T53 R1 · screens-action · rows

## plan-T53-draft.md

**affordances**, **interface-shell**, **screens-daily**, **screens-investigate**, **screens-action** (N1260, N1257)
- T53 · N1260 (DEC-447) · `cs.follow`, one "Follow from here" fold read only when opened (interface-shell); its menus (affordances R72-R74); Find results draw it (screens-daily); people, events, money, chain steps and Explore's three acts (screens-investigate R67-R69) · `capabilities/N1260-following-the-trail-b.md`
- T53 · N1257 · `request` offers the laws whose `governs` holds the office's level (screens-action R60) · `capabilities/N1257-requirements-modules.md`
**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
The other carried layer-11 entries (wizard-scripts T52-35, T52-36; op-grades T52-37, T52-38; affordances T52-39; tasks T52-40; instance-setup T52-41; store-assembly T52-46, T52-47; store-request T52-48; screens-entry T52-54 to T52-56; screens-wizards T52-57; screens-action T52-81 to T52-84; site T52-96) stand as carried, each `C`.
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**screens-action**
- T53 · N1257 · R61 (layer on the screen) · N1257 layer-names R61
- T53 · N858 · draws a guide's `not_offered`, "reviewed by", "not reviewed", the flag lines and "No profile text for this yet"; the opt-out offered to a sole member only · N858 §6 `[owed: UX-DESIGN's rows; no screens-action line exists, BOB writes it]`

## plan-T53-journeys.md

**screens-action**
- T53 · R-26 · dash-action: "WHOSE MOVE", "THE CLOCK", "NEXT" blank for most; no "needs you" tier · REG R-26 · D3 screens-action R?17. +T52-81 (E-K14 blanks); the "needs you" tier is new.
- T53 · R-67 · BLOCKS · see entities (request add; D2 screens-action request R?1, R?2 for the sentence; decided DEC-472 (7)).
- T53 · R-77 · hold notice carries `PROJ-` id, ISO instant, doubled full stop; "Record that I sent it" says nothing · REG2 R-77 · D3 screens-action R?2 (owner filings; setup-words `filings.hold_place`).
- T53 · R-63 · see screens-daily (records-help half: D3 screens-action R?16).
- T53 · R-114 · "Propose another law" with an empty citation does nothing · REG3 R-114 · D3 screens-action R?4.
- T53 · R-117 · "Move it to: resolved" records "the office complied" by default · REG3 R-117 · D3 screens-action R?5 (+ actions R?1).
- T53 · R-121 · `actionnew` "Choose the office" appears only after a question is picked · REG3 R-121 · D3 screens-action R?9 (owner also actions; uses the request add).
- T53 · R-128 · "Show the routes" leaves "No route is known…" with no cause · REG3 R-128 · D3 screens-action R?15 (owner reading-guides, agent-steps). Register: SAME AS E-part2 D12; no T52 entry (T52-84 covers U20-U24 only). LANE: AI-DESIGN if routes are an assistant result (D3 Needs).
- T53 · R-129 · `actionnew` refusals in developer words · REG3 R-129 · D3 screens-action R?10 (owner action-grammar, setup-words).

## carried-T52-R1.md

- T52-81 · W32 · E-K6, E-K17, E-K7 (functional part), E-K10 (also re-walk 11 E), C-K20+E-K12, E-K13, E-K14, E-K16 · MAJOR · cause lines (detail PL3 W32): a proposed law has a control to choose it, and a request with no laws offers a way (`screen.action.law.none`); acting before a determination takes a ground (a legal deadline with date and citation, or an irreversible act, what and when) and, once W30 records a noncompliant determination, "Name the determination it rests on"; "Brief counsel" draws the packet's id and version, a "made" line and a way to read and export it; the Matter head and plan line read the body's label, not `ENT-…`; the plan's add-option form clears its tier after a success; the template save says it is saved; "WHOSE MOVE", "THE CLOCK", "NEXT" say something true for a planned action; "Waiting on … reply" ends after a recorded Denial. E-K7 (DEC-444, K5368): "Packets made for this action" per version, reading (`counselpacketread`) and export (`counselpacketexport`), `screen.counsel.made.*`, `.section.*`, `.sections.marking`, `.export.note`. PL3 W32.
- T52-82 · re-walk 11 E (K5328) · N1's `screen.request.office.undated` is drawn.
- T52-83 · N1263 · the request's agency and office are two fields (DEC-412 (3)).
- T52-84 · first: settle U20 (the "The action started ·" line with nothing after the dot, the empty-addressee case through `start-send.mjs:138-145`), U21 ("The due date to be reminded of": grep the row; likely the design's, to B541), U22 (one reply costs two presses and a reason: read `actioncorrespond`'s `done`), U24 (the body choice offers only one body: read it in `request.mjs`).
Every screen job of this layer also draws DEC-445's rows and DEC-446's layout that touch its screens (merged `fb5f9dc2a9`, K5394): the singulars (`screen.finder.named.one`, `screen.findin.searched.one`, `document.unread.page`), `screen.finder.shown`, `screen.timeline.dated.meta.nograde`, `screen.find-in.notread.which`, `refusal.SUBJECT_IN_ACTIVE_PLAN.named`, the Document page's display rows (`screen.document.basis.*`, `screen.document.reading.*`), and DEC-446's DS2, DS4, DS5, DS10, DS13, DS18, DS20, DS32, DS35 as the mockup shows. Also DEC-452 and DEC-453's code items (U497, `e5feed33be`, K5416), each to its owning job at START: `question.mjs`'s heading `screen.question.citeimp.heading`; `project.mjs`'s Forming line `project-stage.forming_needs_nothing`; a `knock:` place named by its knocker in dash-project and Home's todos; `assistant.mjs`'s `REMOTE_UNAVAILABLE` (`dock.withheld.REMOTE_UNAVAILABLE`); queue-producers' `member.unnamed` for a raw id; promotion's `refusal.PROMOTE_NOT_A_PARTICIPANT.unseen`; `document.mjs`'s A34 paragraph legs; `ceremony.mjs`'s check names in `screen.ceremony.gate.check`.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 11 | screens-action | 1 / 8 | 0 / 1 / 6 (6) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-533 · jurisdictions R105 (N1257, DEC-404) · `help-records.mjs` picks the chosen law's block. Detail: lines 33-35 read `view.records_help` as one object and take it only when it is not an array; R105 makes it a list of blocks keyed by `law` (the law's layer-qualified name in `records_laws`), so the screen picks the block of the law the member chose (the law `request` offers by `governs`, T53-457), draws the fills of that block alone, and draws nothing short when the law has no block (R22). Test: with a California CPRA block and a federal FOIA block, each law's page draws its own response period and citation; a block of another law is never drawn.

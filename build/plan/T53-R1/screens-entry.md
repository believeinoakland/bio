# T53 R1 · screens-entry · rows

## plan-T53-draft.md

**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
The other carried layer-11 entries (wizard-scripts T52-35, T52-36; op-grades T52-37, T52-38; affordances T52-39; tasks T52-40; instance-setup T52-41; store-assembly T52-46, T52-47; store-request T52-48; screens-entry T52-54 to T52-56; screens-wizards T52-57; screens-action T52-81 to T52-84; site T52-96) stand as carried, each `C`.
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-journeys.md

**screens-entry**
- T53 · R-3 · signed-in member sees the sign-in form on `/app/front` and after the tour · REG R-3 · D1 screens-entry R?1 (decided, DEC-472 (5)).
- T53 · R-45 · `forgot` fields 1232 px wide at 1280 · REG R-45 · D1 screens-entry R?2.

## carried-T52-R1.md

- T52-54 · W24 · A-K1, A-K7 · MAJOR · setup part 8 does not say "the only administrator" when the roster holds two; the join page names the invitation's role and capabilities in plain words, and the recovery-code page's explanation no longer says "claimed". Words owed. PL2 W24.
- T52-55 · R2 *(not yet met: T52)* · the sign-in panel and its states as R2 states them.
- T52-56 · DEC-443 · draws `act.factconfirm.label.setup` and `screen.setup.zone.how.help`.
Every screen job of this layer also draws DEC-445's rows and DEC-446's layout that touch its screens (merged `fb5f9dc2a9`, K5394): the singulars (`screen.finder.named.one`, `screen.findin.searched.one`, `document.unread.page`), `screen.finder.shown`, `screen.timeline.dated.meta.nograde`, `screen.find-in.notread.which`, `refusal.SUBJECT_IN_ACTIVE_PLAN.named`, the Document page's display rows (`screen.document.basis.*`, `screen.document.reading.*`), and DEC-446's DS2, DS4, DS5, DS10, DS13, DS18, DS20, DS32, DS35 as the mockup shows. Also DEC-452 and DEC-453's code items (U497, `e5feed33be`, K5416), each to its owning job at START: `question.mjs`'s heading `screen.question.citeimp.heading`; `project.mjs`'s Forming line `project-stage.forming_needs_nothing`; a `knock:` place named by its knocker in dash-project and Home's todos; `assistant.mjs`'s `REMOTE_UNAVAILABLE` (`dock.withheld.REMOTE_UNAVAILABLE`); queue-producers' `member.unnamed` for a raw id; promotion's `refusal.PROMOTE_NOT_A_PARTICIPANT.unseen`; `document.mjs`'s A34 paragraph legs; `ceremony.mjs`'s check names in `screen.ceremony.gate.check`.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 11 | screens-entry | 0 / 0 | 4 / 2 / 2 (5) |  |

## FOLD-AI.md

## 2. Order and `uses` (BOB's, P4)
8. **The retired ops and service names** (ai-accounts' twelve) are still named in sixteen modules: op-declarations, op-grades, admission, store-door, store-request, store-assembly, control-plane, interface-shell, signin-door, screens-settings, screens-entry, screens-inquiry, screens-daily, wizard-scripts, affordances, journey-check. Each of those layer-11 jobs takes the re-pointing as a CHANGE in the same round (no aliases, ai-accounts For BOB 6); the plan names it in each job's START.

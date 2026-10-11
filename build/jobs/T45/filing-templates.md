# filing-templates (T45)

**Status** · session_01XfDsBCCLPY5tHHgjXGSvMH · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings, building on each meanwhile.

(1) R23's T45 line says rows `TEMPLATE_NOT_REVIEWED` and `TEMPLATE_COURT_PETITION` "join C-115"; the draft (l9b §2) says "a new row of C-125", and your START says "a new refusal row goes in your module's existing family". C-115 is `filings`' family (only the moved rows and R26's .45/.46 are mine), and `filings` (T45-31, after me) may number new C-115 rows too, so .47/.48 could collide. My reading: C-125.33 (`TEMPLATE_NOT_REVIEWED`) and C-125.34 (`TEMPLATE_COURT_PETITION`), this module's own family, and R23's "C-115" read as a fold slip. If you rule C-115, I renumber to C-115.47/.48 and you tell filings.

(2) R15/R26: a profile template is named by its own `name` (R87 (b)). A kind's single `template` (R25; R81 reads it as a set of one, purpose `initial`) need not carry `name` (jurisdictions makes it required only in `templates`). My reading: such a template's name is its kind's label, as before T45 (it is unlikely to be offered anyway: R15's attribution needs `sources`). Order of the not-offered answers for a profile template: `TEMPLATE_BLANK_UNKNOWN` (unchanged), then `TEMPLATE_COURT_PETITION`, then `TEMPLATE_NOT_REVIEWED` (its `lacks` naming each of `writer`, `sources`, `professional_review`, `approver`). R28 at R3: right after `TEMPLATE_TIER3_FILE` among R1's refusals.

## Completion (FILING-TEMPLATES #8)

**Read whole** (P20; START's reading set): `roles/JOB.md`; `build/requirements/filing-templates.md`; the public parts of `record-grammar`, `jurisdictions` (with R74–R87), `record-core`, `membership`, `action-grammar`; `build/layers.md` (layer 9's contract, "No jurisdiction in the product"); the plan's T45-30 entry, rule 4 and the reconciliation (R7's template row); `draft-T45-l9b.md` §2 with §6–§9; K2780, K2781, K2787; `BIO_Action_v0_2.md`; every file of this module's code (`index.mjs`, `blanks.mjs`, `checks.mjs`, `schema.mjs`) and tests.

**Entries applied (T45-30):**
- **R15** The profile's templates are every template a kind carries (`templates`, or the single `template` as a set of one, purpose `initial`). A profile template is offered only when its attribution names its writer, its public `sources`, a `professional` review with `no_concerns` and an approver other than its writer; otherwise it is not listed, `offeredVersion` refuses `TEMPLATE_NOT_REVIEWED` with `lacks` (`writer`, `sources`, `professional_review`, `approver`, in that order), and `templateRead` answers `offered: false` with `not_offered`. A profile version now reads its `sources` and `purpose`. Order of the not-offered answers (B2): `TEMPLATE_BLANK_UNKNOWN`, `TEMPLATE_COURT_PETITION`, `TEMPLATE_NOT_REVIEWED`. `@records-request` stays unresolved (the first profile carries no template; a "Records request" template without a professional review reads `TEMPLATE_NOT_REVIEWED`), K2781 (6).
- **R26** A profile template's handle is read from its own `name`; a single `template` written without one is named by its kind's label (B2). Two templates of one kind resolve by their two handles.
- **R28** A `use: file` template on a kind whose venue is a court in any profile it names (a `general` one: the active view) is refused `TEMPLATE_COURT_PETITION` among R1's refusals, right after `TEMPLATE_TIER3_FILE`, naming the profile; a profile file template so placed is not offered and reads the same code; `brief` unaffected.
- **R23** Rows `TEMPLATE_NOT_REVIEWED` C-125.33 and `TEMPLATE_COURT_PETITION` C-125.34 (K2844), translations drafted here, awaiting promotion's stamp.
- Rule 4 (7)'s `reads.test.mjs` "R26 offeredVersion" red is green.

**Flaws fixed in my own module:** `offeredVersion` built the version view twice (now once); R18's test now also checks the names and texts of a kind's `templates` list; the harbour test profile now drops `templates` too, so no profile template id is held by two profiles.

**Deferred:** none.

**Found in other modules** (REPORT J2): with R15 in force, the test profile's templates (`jurisdictions` R84: none carries `sources` and a professional `no_concerns` review together) are not offered, so `filings` gains 32 reds and `wizard-scripts` 7 whose fixtures draft from them (each refused `TEMPLATE_NOT_REVIEWED` / `WIZARD_DRAFT_REFUSED`). `affordances`, `answer-envelope`, `control-plane`, `plane` and `queue-producers` are unchanged (the same reds before and after, all already accepted by rule 4); `migrate-released` passes. No generated artifact staled beyond rule 4 (5)'s plane bundle.

**Tests and checks:** `node --test bio-plane/test/m/filing-templates/*.test.mjs`: tests 63, pass 63, fail 0 (new file `offer.test.mjs`, 7 tests). Users' tests run before and after (above). `checks/format.mjs`: 0 failures; `checks/architecture.mjs bio filing-templates`: 0 failures; `checks/coverage.mjs bio filing-templates`: 28 of 28 live ids named, 0 failures; `checks/ownership.mjs bio filing-templates tranche/T45`: 7 files, 0 failures.

Size (session_01XfDsBCCLPY5tHHgjXGSvMH): test runs 9, module lines 1853

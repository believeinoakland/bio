# jurisdictions (T45)

**Status** · session_01YbCZYnryu1Ked4QncDkn47 · depth 2 · COMPLETE · handled B2

## Record

**How the reading set was read** (mechanics §17, K2032). Read whole by me: `roles/JOB.md`, mechanics §6, §12, §13–§16; `build/requirements/jurisdictions.md`; `record-grammar`'s public part (my one Use); `build/layers.md`'s layer 1 row and "No jurisdiction in the product"; `jurisdictions/index.mjs`; both profiles; `build/plan/current.md` (T45-1, the reconciliation, Left out, Measure first); `draft-T45-lower.md` §7 and its hand-off rows; K2780, K2781, K2785; `BIO_Action_v0_2.md` whole; Design Requirement 8. My tests (283 KB, over the limit with the code) were read whole by a helper in this session told my entries, which wrote me a digest of what each test pins, citing file and line; I then read whole every test I changed. My own code and tests were read whole, as rule 2 and P20 ask; the flaws found are dealt with below.

**Entries applied (T45-1):**
- **R74** a counterparty's or a venue's `time_zone` (R41's form and status), one value per office or venue in `combine`.
- **R75** a deadline's `owed_by` (`body`, `group`), `consequence` `{text, citation}`, `starts: third_party` with its `starter` (a counterparty by role and body, `ANCHOR_UNKNOWN` otherwise); `STARTS` gains `third_party`, `OWED_BY` exported; each one value under rule and applies_to.
- **R76** a records law's `stages` (product stage names, the law's own term, each cited, none twice) and `requesters` (sourced); one value per law name, the law itself still unioned.
- **R77** a response status's `applies_to`, a kind of the profile (`KIND_INVALID`); unioned.
- **R78** `legal_organisations` evaluate Tier 2 or 3 kinds; `defends: true`; `ORG_PURPOSE_MISSING` with neither.
- **R79** `legal_facts`, `LEGAL_FACT_TRIGGERS` frozen and exported, `TRIGGER_UNKNOWN`; one value per key.
- **R80** `procedure_guides`, one per kind, items unranked and cited; one value per kind.
- **R81** a kind's `templates`, each R40-attributed with `purpose`; the single `template` read as the set of one, `initial` (B2/K2788: both refused `VALUE_INVALID`; the view keeps `template` and adds `templates`); `TEMPLATE_TIER3` for each; one value per kind and purpose.
- **R82** a venue's `facts`, `VENUE_FACTS` frozen and exported; one value per kind and fact.
- **R83** no new vocabulary names a place; no default: a profile without the fields gives a view without them (tested), and R20's identity test now compares them.
- **R84** the test profile supplies every new field, with values unlike the first's.
- **R85** the first profile's sourced facts (below).
- **R86** `phrasings`, `PHRASING_KINDS` frozen and exported; unioned; the first profile holds none.
- **R87** a kind's `shape` (`KIND_SHAPES`, `recognition`); a template's `name` and `sources`; a deadline's `defends: true`; a guide item's `after`; `delivery_point` in `VENUE_FACTS`.

Not-yet-met marks this job meets: **R74–R87**, each named by `jurisdictions/test/t45.test.mjs` (and R78 also by the re-pinned R32 test).

**R85's measurement (M-T45-1, M-T45-2, M-T45-3), read 2026-10-11, cited in the profile as `2026-10-11 actions-law`.** Every source with its URL, the capture's sha256 and the operative text quoted is in `jurisdictions/test/fixtures/actions-law.mjs` (`SOURCES`), with nine worked examples, each with its negative control (`EXAMPLES`: one published, the Berkeley demand of 2026-04-21 under § 54960.1(c)(1)'s 30 days; eight derived, labelled so, no published example found). California's leginfo answers every fetch with a browser challenge, so its sections were read on california.public.law, which reproduces leginfo's text and names its page and last update. Held, each with its citation:
- `owed_by` on every deadline (the Claims Act's presentation periods and the anti-SLAPP motion `group`; the others `body`), read off the operative text time-law already quotes, so those entries keep time-law's basis; FOIA's stated consequence ((a)(6)(C)(i)) adds this measurement to `foia_response`'s basis.
- Kinds: `brown_act_demand` Tier 2 with its advisory (K2785), `party_participation` Tier 2 with its advisory (v0.2 rule 13, K2780), `public_comment` Tier 1 (Design Requirement 8, K2785).
- Deadlines: the Brown Act demand (90 days, and 30 for a § 54954.2 open-session action) and the body's 30 days to cure, with (c)(3)'s consequence; the grand jury's 90 and 60 days (Penal Code § 933(c)) and § 933.05(b)(3)'s six months, each started by the Civil Grand Jury's act (`third_party`); the anti-SLAPP motion's 60 days (CCP § 425.16(f)), `defends: true`; the claims board's 45 days with § 912.4(c)'s "deemed to have been rejected"; FOIA's 20 working days on appeal ((a)(6)(A)(ii)).
- `response_statuses`: § 933.05's six, `applies_to: grand_jury`.
- `legal_facts`: recording at an open meeting (Gov. Code § 54953.5(a)); recording consent (Penal Code § 632); the lobbyist threshold ($1,000 in a calendar month, OMC 3.20.030(D), 3.20.040(A)); serial meetings (§ 54952.2(b)(1)); campaign spending ($1,000 in a calendar year, §§ 82013(b), 82031); a threat letter (CCP § 425.16).
- `stages` and `requesters` on each records law: CPRA (no fee waiver, no appeal, no fee-estimate stage), the Sunshine Ordinance, FOIA (with its fee waiver and appeal).
- FAC `defends: true` on its Legal Hotline page's published scope; basis `K303, 2026-10-11 actions-law` (B2, K2788). HJTA unchanged.
- The federal list's 2027, from OPM's schedule under 5 U.S.C. § 6103, with the observed days (2027-12-31 included, OPM's 2028 table).

**Absent, and why (named as R85 asks):**
- 2027 judicial list: CCP § 135 leaves a weekend holiday's day to the Judicial Council; two courts' 2027 schedules disagree (Farmworkers Day 03-31 against 04-09; 12-31); the venue's own court (M-189's page, re-read) lists 2026 only. 2027 City list: not published (M-190's source). Counts into 2027 on those lists stay undetermined (R33).
- The Brown Act's 15 days to sue (§ 54960.1(c)(4)): it runs from the group's receipt of the body's answer or the end of the 30 days, whichever is earlier; no anchor of R26 names that, so it is not written (a later requirement may add one).
- M-T45-3: every office the first profile addresses is in California (Pacific time, Gov. Code § 6808, already M-187's): no office keeps another zone; no `time_zone` is written on an office or venue.
- Venue facts: the first profile's kinds are addressed to many governments' bodies (`public_comment`'s periods mix the Brown Act and the OMC); OMC 2.20.150(C)'s two-minute speaker floor binds only City bodies, so writing it on the kind's one venue would misstate the County's; left absent until a kind names one venue.
- Rulemaking periods and commission participation's own periods: no kind of the first profile is a rulemaking comment, and party participation's periods are each venue's rules; not measured further.
- Procedure guides, templates (K2781 (6)), phrasings (R86): none; no named writer, professional review or corpus exists.

**Flaws found and dealt with in my own module (P8):**
- R20's identity test removed every nested `name`, so a fact's own name (a legal organisation's, R87's template names) was never compared; it now removes only the view's own `id`, `name`, `covers` and the profile tags, and asserts the T45 sections are in what is compared.
- `walkFacts` (helpers) walked none of the T45 facts, so every "every fact carries a basis / is tagged / is TEST" test would have skipped them; extended.
- R2's basis-deletion test recognised only `.template` paths as templates; it now recognises `.templates[j]` too, and R84's test deletes each T45 fact's basis in turn.
- Tests that pinned pre-T45 text (R26 anchors, R30 tiers, R32's Tier 2, R36's FAC, R47's lists, R56's rule set, R58's "the first gives none") re-pinned to the amended requirements (B2), none loosened.
- Deferred: none.

**Other modules (REPORT J2):** none changed. R84 makes the test profile grow (a kind holding `templates` and a `shape`, a defending organisation, deadlines owed by the group, by a body after a third party's act, and in the group's defence); three tests of other modules pin that profile's exact contents and go red, each in a module whose own T45 job reads the new fields:
- `action-grammar` `grammar.test.mjs` "R1, R11: actionKinds(view)…": the test profile's kinds listed exactly; now also `recognition_letter`.
- `filing-templates` `reads.test.mjs` "R26 offeredVersion…": reads `k.template.id` for every test-profile kind; `recognition_letter` holds `templates` (R81), not `template` (refused together, K2788). Its T45 job reads R81's templates.
- `filings` `packet.test.mjs` "R9 the six sections…": the packet's `claim` deadlines listed exactly; now also `complaint_particulars`, `examiner_reply`, `defence_filing`.
I placed the data to disturb the fewest (one new kind in place of two; the deadlines on `claim`, which costs one red where every kind costs one or more; the defending organisation also evaluates a Tier 3 kind, so `filings` R15 stays green). Each of the three is the other module's test to re-pin; I ask BOB to accept them as reds until those jobs, or to route them.
Readers of the view should know: `STARTS` gains `third_party` (civil-time counts `starts`; a `third_party` entry needs its starter's act as anchor, civil-time's own job); a kind with a single `template` also carries `templates` in the view; `records_laws` entries may carry `stages` and `requesters`. New fields only; no existing field changed meaning. The measurement `2026-10-11 actions-law` lives in my fixtures and this record: BOB may file it beside `measures-T33/` if wanted.

**Tests and checks run** (final, on 4b765aa354):
- `node --test jurisdictions/test/*.test.mjs`: tests 128, pass 128, fail 0 (t45.test.mjs new: 14 tests).
- Every module that uses `jurisdictions` (43, from `modules.json`), its tests: 3,718 pass, 5 fail. The three above (reported), and two red on `tranche/T45` without my change too: `standards` "R29 the move to layer 5 changes no answer" and `installer`'s `newgroup-bundle-fresh.test.mjs` (a generated bundle). A first sweep run beside a base sweep under load showed timing reds in both (capture, reading-pipeline, …); the final sweep ran alone and they were green.
- Layer tests: none named in `build/manifest.md`.
- `format`: 152 modules, 146 requirements files; 0 failures. `architecture jurisdictions`: 13 product files, 20 relative imports; 0 failures. `coverage jurisdictions`: 87 of 87 live ids named by a test; 0 failures. `ownership jurisdictions tranche/T45`: 10 files changed; 0 failures. No file outside my paths.

Size (session_01YbCZYnryu1Ked4QncDkn47): test runs 24, module lines 3391

## J1 · QUESTION

Three readings I am building on (carrying on meanwhile; none blocks):

1. **R36 vs R85 on the First Amendment Coalition.** R36 pins each legal organisation's basis `UNMEASURED`; R85 says FAC's `defends` is held where its published scope supports it, sourced. I measured FAC's Legal Hotline page (2026-10-11: it covers "First Amendment protections for freedom of speech and freedom of the press", names "a journalist facing a subpoena"). One entry has one basis, and `UNMEASURED` stands alone (R2). My reading: R85 (later, amending) governs FAC: its basis becomes `K303, 2026-10-11 actions-law` (Bob's naming plus the measurement), `defends: true`; HJTA keeps `UNMEASURED` as R36 says. The R36 test is brought in line (HJTA exact; FAC as R85).
2. **R81/R87 (b) on the single `template`.** I require `purpose`, `name` and `sources` on each entry of `templates` only; a kind's single `template` (R25, R40) keeps R40's fields, may carry `name` and `sources`, and is read in `combine`'s view as `templates` of one with purpose `initial` (the view keeps `template` too, for today's readers). A kind giving both `template` and `templates` is refused `VALUE_INVALID` (two initial templates).
3. **R30/R32 tests.** R85 sets `public_comment` at Tier 1 (basis K2785) and adds `brown_act_demand` and `party_participation` at Tier 2 (basis K2785, K2780 resp.); R78 lets `evaluates` name Tier 2 kinds and be empty beside `defends: true`. The existing R30, R32, R36 tests that pin the old text (Tier 2 → ORG_KIND_UNKNOWN; the exact tier map; every tiered kind on D-182) are re-pinned to the amended text, never loosened beyond it.

## J2 · REPORT

Three tests of other modules pin the test profile's exact contents, which R84 requires to grow; each goes red with my merge, and each module's own T45 job reads the new fields:
1. `action-grammar` `bio-plane/test/m/action-grammar/grammar.test.mjs` "R1, R11: actionKinds(view)…": the test profile's kinds listed exactly; now also `recognition_letter` (R81's two templates, R87's shape).
2. `filing-templates` `bio-plane/test/m/filing-templates/reads.test.mjs` "R26 offeredVersion…": reads `k.template.id` for every test-profile kind; `recognition_letter` holds `templates` (R81), never with `template` (K2788).
3. `filings` `bio-plane/test/m/filings/packet.test.mjs` "R9 the six sections…": the packet's `claim` deadlines listed exactly; now also `complaint_particulars`, `examiner_reply`, `defence_filing` (R75, R87 (c)).
Placed to disturb the fewest: one new kind, not two; the deadlines on `claim` (every kind I tried costs `filings` one red); the defending organisation also evaluates a Tier 3 kind, so `filings` R15 stays green. I ask you to accept these three as reds until those jobs, or route them. Not mine (red on `tranche/T45` too): `standards` R29 "the move to layer 5…", `installer` `newgroup-bundle-fresh.test.mjs`.
Also for readers: `STARTS` gains `third_party` (civil-time: a `third_party` entry's anchor is its starter's act); a single `template` also reads as `templates` in the view; `records_laws` may carry `stages`, `requesters`. The measurement `2026-10-11 actions-law` is in `jurisdictions/test/fixtures/actions-law.mjs` and my record; file it beside `measures-T33/` if you want it there.

## J3 · COMPLETE

T45-1 done on `job/T45/jurisdictions` (head below). R74–R87 met, each named by `jurisdictions/test/t45.test.mjs`; R85's facts each read on its primary source 2026-10-11, with what no source supports named absent in the record (no 2027 judicial or City list; the Brown Act's 15 days to sue, no R26 anchor; no office zone, M-T45-3; no venue facts, guides, templates or phrasings). Your three readings (B2) applied. Flaws fixed in my own tests: R20's scrub, `walkFacts`, R2's template paths. Tests: jurisdictions 128/128; the 43 using modules 3,718 pass, 5 fail (J2's three, and two red on the tranche already). Checks: format, architecture, coverage (87/87), ownership: 0 failures. No file outside my paths. Deferred: none. Record: `build/jobs/T45/jurisdictions.md`.
Head: 10db5a7148

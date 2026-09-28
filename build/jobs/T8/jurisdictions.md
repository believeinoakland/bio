# jurisdictions (T8)

**Status** · session_01UJt3cBwB4ov538dcch58B8 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My readings, on which I am building now; answer only where one is wrong.

1. **N77 and N96 are not in `build/requirements/jurisdictions.md`.** The plan gives them to this job (K119, K158), but no requirement states `locale` or `systems[].links`, and step 5 says BOB updates the requirements first when a provided service changes. I build them as follows and ask you to fold them as requirements (I will test them under the ids you give; until then, under R4 and R7 with an `N77`/`N96` title):
   - `locale`: a top-level section `{value, basis}`, `value` one well-formed BCP 47 tag (checked with `Intl.getCanonicalLocales`, which is pure), else `VALUE_INVALID`; combined as one value (R15), a disagreement withheld and reported in `conflicts` at `locale`. The first profile gives `{value: "en-US", basis: "UNMEASURED"}`; the test profile `en-GB`.
   - `systems[].links`: `{item, file}`, two patterns (R2) over an address's path and query, as extraction R52 reads them. They have no basis of their own: they are part of the system entry, whose basis names their measurement. The first profile puts REC-206's measured gateway shapes (`/gateway.aspx?M=L&ID=/matter.aspx?key=<n>` and `/gateway.aspx?M=F&ID=…`, case-insensitive) on the legislative record's own-host entry, basis `M-119 LEG, M-120`. A malformed `links` gives `PATTERN_INVALID` or `VALUE_INVALID`.
2. **R36, the first profile's legal organisations.** R32 needs each organisation's `evaluates` to name Tier 3 kinds of the profile. Today the first profile has none (R30's eight kinds are Tier 1 or have no tier). My reading: the first profile also gets the kinds that Design Requirement 8 and Roadmap v5 §8 name at Tiers 2 and 3, with basis D-182 as R30's tiers have. They are `records_petition` (Tier 2, with DR8's advisory note), `assessment_challenge` (Prop 218), `taxpayer_action` (CCP 526a) and `consent_decree_motion` (all Tier 3). R30's list is kept, and its test changes from "exactly these kinds" to "these kinds, in this order, first". The canon names the organisations (HJTA, ACTA, First Amendment Coalition, "Prop 218 specialist attorneys") but gives no contact for any of them, and R32 requires one. So I hold only HJTA and the First Amendment Coalition, each with its public website as a `web` contact and basis `UNMEASURED`. I leave out ACTA, whose expansion I cannot establish, and "specialist attorneys", which is not an organisation. If you would rather no contact from outside the canon, say so, and the section stays absent in the first profile (absent means undetermined, R27).
3. **R24 `oversight` in the first profile:** the Alameda County Civil Grand Jury gets `oversight: true`. I add the Office of the City Auditor as a counterparty (DR8's Tier 1 "City Auditor whistleblower complaints"; the profile already names its system) with `oversight: true`. Both have basis `UNMEASURED`. The other offices get no marker, so it stays undetermined.
4. **R33 `holidays` in the first profile:** absent. No measurement or canon names the jurisdiction's closure days, and its one deadline counts calendar days. The test profile supplies holidays, and a business-day count that reaches into an unlisted year is undetermined.
5. **R29 `oversight`:** counterparties stay unioned (R14), but `oversight` is taken out of the equality key. It is one value per `role` + `body`, and a disagreement is withheld from the merged entry and reported at `counterparties[<role>/<body>].oversight`.

## J2 · REPORT

Generated artifacts this job made stale (mechanics §14). I have written none of them.

1. **`agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json`** (owner: `agent-worker`). `node --test bio-plane/test/fleetbundles.test.mjs` fails on `agent-worker: STALE BUNDLE`, naming `jurisdictions/index.mjs`, `profiles/oakland-alameda.mjs` and `profiles/test-port-ellery.mjs`. On `tranche/T8` without my change it passes. Regenerate it at the layer's close: `agent-worker/`, `npm run build`.
2. **`bio-plane/dist/bio-plane.bundled.mjs`** (owner: `not_product`). It also inlines `../jurisdictions/index.mjs`, including the removed `RECORDS_LAW_LEVELS`. The staleness check does not flag it, but it is out of date the same way. `bio-plane/`: `npm run build`.

On the service I provide: `standard_sources` entries now require a `level` (R23, `LEVEL_UNKNOWN` without one), and `RECORDS_LAW_LEVELS` is replaced by `LAW_LEVELS` (R31). Nothing outside this module imported the old export. I ran the tests of every module that uses jurisdictions, and all are green: id-spaces 26/26, docprofile 35/35, capture 56/56, extraction 65/65, entities 34/34.

## J3 · COMPLETE

**Entries applied** (plan layer 1, the jurisdictions bullet):
- **N130 / N61 / N65 (4) (K102, K108).**
  - R31: `LAW_LEVELS` = `federal`, `state`, `county`, `city` is exported, frozen, and is the vocabulary of `records_laws` and `standard_sources`. An office keeps its own levels.
  - R23: every standard source has a `level`.
  - R24: optional `oversight`. The first profile gives it to the Civil Grand Jury and to a new City Auditor counterparty, both `UNMEASURED`.
  - R25: `advisory`, on Tier 2 only.
  - R32: `legal_organisations`. The test profile has them; the first profile leaves them absent, per K227 (Bob's to decide).
  - R33: `holidays`. The test profile has them; the first profile leaves them absent.
  - R34: organisations are unioned; a year's days are one value, and their order is no disagreement.
  - R29: `advisory`, and `oversight` per role + body, are one value.
  - R35: the new codes are `ADVISORY_NOT_TIER2`, `ORG_KIND_UNKNOWN`, `CONTACT_INVALID` and `HOLIDAY_INVALID`.
  - R36: the first profile gains the Tier 2 and Tier 3 kinds of DR8 and Roadmap §8 (basis D-182): `records_petition` (Tier 2, venue Alameda County Superior Court, advisory), then `assessment_challenge`, `taxpayer_action`, `consent_decree_motion` and `constitutional_claim` (Tier 3). R30's eight kinds stay first and in order.
- **N77 → R37 `locale`.** `{value, basis}`, one well-formed BCP 47 tag, combined as one value. The first profile is `en-US` `UNMEASURED`; the test profile is `en-GB`.
- **N96 → R38 `systems[].links`.** `{item, file}` patterns that take the entry's basis. The first profile's own-host Legistar entry carries REC-206's gateway shapes, basis `M-119 LEG, M-120`. The test checks them against REC-206's `MEMBERSHIP_SHAPES` (copied as the oracle) on a sample set. The shapes also apply on the alias host `oakland.legistar1.com`, which is the same system (M-119 LEG), though REC-206 measured only `*.legistar.com`.

**Deferred:** none. **Other modules:** J2 (two stale bundles).

**Tests:** `node --test jurisdictions/test/` gives tests 44, pass 44, fail 0. Every live id R1–R38 is named: R17–R22 and R30 as before; R29, R31–R38 new or extended. The users' suites are listed in J2.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 5 product files, 4 relative imports; 0 failures
- coverage: 38 of 38 live requirement ids named by a test; 0 failures
- ownership: 6 files changed by jurisdictions between tranche/T8 and HEAD; 0 failures

Size (session_01UJt3cBwB4ov538dcch58B8): test runs 15, module lines 1206

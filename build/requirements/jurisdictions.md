# jurisdictions — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6); R23–R30 APPROVED by Bob 2026-09-26. Layer 1. Code: `jurisdictions/index.mjs` and `jurisdictions/profiles/` (the first profile, Oakland and Alameda County, and a test profile). Built by T2 (N1, N11); the first profile's bases are settled from the measurement log, `UNMEASURED` where it holds none. Every id met and tested in T2 (2026-09-26; `build/plan/archive/T2.md`).

## Public

### Purpose

Holds the jurisdiction profiles: every local fact the product uses, as data, each with the measurement it rests on. It lists, returns, validates and combines them. No other module names a place (`build/layers.md`, "No jurisdiction in the product").

### Provides

**The profile.** A plain, JSON-serialisable object. Every section is optional. An absent section means the profile supplies nothing there, never that nothing exists.
- **R1** Identity: `id` (matching `^[a-z0-9][a-z0-9-]*$`), `name`, `covers` (the jurisdictions it covers, a non-empty list of names), and `test` (`true` only for a profile whose facts are made up for tests).
- **R2** A **pattern** is `{re, flags?}`: `re` is a JavaScript regular-expression source, and `flags` is drawn from `i` and `u`. A **basis** is the evidence one fact rests on: a string naming a measurement (`M-157`, or a dated measurement entry such as `2026-07-30`) or a ruling (`D-149`, `DEC-13`, `K4`), or exactly `UNMEASURED` (held, never measured). `TEST` is a basis in a test profile, and only there. Every form, kind, floor, system, mixed host, crosswalk, vocabulary entry, `practice` value, search term and law (R3–R7) carries a `basis`. A basis matches `M-<n>`, `YYYY-MM-DD`, `D-<n>`, `DEC-<n>` or `K<n>`, each optionally qualified by a following word (`M-119 LEG`), several joined by `, ` or `; `; or is `UNMEASURED`; `TEST` only in a test profile.
- **R3** `spaces`: keys from `enactment`, `project`, `fund` and `parcel`, each `{label, forms, kinds?}`.
  - A form is `{form, pattern, normal, clean?, basis}`. `clean` is the formatting removed before matching: `strip` (patterns removed from the start of the value), `spaces` (`remove` or `collapse`), and `upper` (`true`). `normal` is a list of parts, each either a literal string or `{group, unpad?, upper?, default?}`: a capture group of `pattern`, with its leading zeros removed (keeping one character) or its letters upper-cased, and `default` used when the group did not match. So a normal form removes formatting and never changes a digit.
  - A kind (`enactment` only) is `{kind, prefix, floor?, basis}`. `prefix` is a pattern for the words naming the kind before a number, removed before the forms are tried. `floor` is `{first, system, basis}`: the first number of that kind that the system's record holds.
- **R4** `systems`: `[{origin, name, hosts, path?, republishes?, provenance_stated?, basis}]`. `hosts` are lower-case host names. `path` is a pattern over an address's path and query. `republishes: true` marks a publication of another system's material, and `origin` then names the system it republishes. `provenance_stated: false` marks a publication that does not say where its material came from. `mixed_hosts`: `[{host, why, basis}]`, hosts that serve many offices' publications, so an address there names no system.
- **R5** `crosswalks`: `[{space, forms: [a, b], pairs, source, basis}]`. `pairs` lists `[value in form a, value in form b]` as read from a captured crosswalk document. `source` is that capture's content hash (64 hexadecimal characters). A crosswalk is never a pattern (Framework §8.3 rule 2).
- **R6** `vocabulary`: a closed set of keys, each a list of `{pattern, basis}` entries unless noted:
  - `furniture`: lines that publishers repeat on every page (the names of the jurisdiction and its offices, and the legislative record's link labels);
  - `bodies`: how a line names a body that meets or enacts;
  - `member_titles`: the title printed before a member's name;
  - `enactment_markers`: the series marker printed with an enactment number in a caption;
  - `codes`: `{key, label, pattern, basis}`, a code of law cited by section. `pattern` matches the code's name or abbreviation, `key` prefixes the reference's key, and `label` is how the reference is shown;
  - `file_numbers`: `{pattern, system, basis}`, the legislative record's file numbers;
  - `report_titles`, `report_sections`, `recommendation_openers` and `template_blanks`: the staff-report template's titles, section headings, the words that open a recommendation, and unfilled template text that is no part of what a document says.
- **R7** `practice`: `{minutes_due_days?: {value, basis}}`, the days after a meeting at which absent minutes raise a question. `search_terms`: `[{term, basis}]`, the terms a search uses when its caller names none. `records_laws`: `[{level, name, citation, basis}]`, the public-records laws that govern the jurisdiction's agencies, by level (`state`, `county`, `city`).

**The action sections** (added 2026-09-26 for layer 9, Action, `build/layers.md`; every entry carries a `basis`, R2).
- **R23** `standard_sources`: `[{source, kind, issuer, cite, code?, basis}]`, where the standards a government act is measured against come from. `kind` is one of `statute`, `regulation`, `ordinance`, `court`, `policy` and `commitment`. `issuer` names the body that makes them. `cite` is a pattern for how one is cited. `code` names a `vocabulary.codes` key when the source is a code of law cited by section.
- **R24** `counterparties`: `[{role, body, level, elected, basis}]`, the offices an action is addressed to, named by official role and body, never by a person. `level` is `state`, `county`, `city` or `district`. `elected: true` marks an elected office, the kind stage 7 (political accountability) addresses.
- **R25** `action_kinds`: `[{kind, label, tier?, laws?, venue?, template?, basis}]`, what a group can file or send. `kind` matches `^[a-z][a-z0-9_]*$` and names no place (a records request is `records_request`, not a law's name). `tier` is `1`, `2` or `3` (Design Requirement 8). `laws` names `records_laws` or `standard_sources` entries that govern it. `venue` is `{name, how, basis}`: where it is filed and by what means (`portal`, `mail`, `email`, `in_person`, `court`). `template` is the text a filing is pre-filled into, with named blanks; a Tier 3 kind has none (Design Requirement 8, amended 2026-09-26). `tier` and `venue` are given only where the canon names one; absent, they are undetermined (R27).
- **R26** `deadlines`: `[{rule, applies_to, days, count, starts, extension?, citation, basis}]`, the periods the law sets. `applies_to` names an `action_kinds` kind, or `claim` for a period that binds a legal claim. `count` is `calendar` or `business`. `starts` says what event starts it (`received`, `filed`, `act`, `known`). `extension` is `{days, count, when}`. `citation` is the provision the period comes from.
- **R27** An absent action section means the profile supplies nothing there. A module that needs one of these facts and finds none answers undetermined, never a default (R16).

**list() → `[{id, name, covers, test}]`**
- **R8** Lists every profile held, sorted by `id`. Never throws.

**get(id) → profile or `null`**
- **R9** Returns the held profile with that `id`, or `null` for any other input. Never throws.

**validate(profile) → `{ok, errors}`**
- **R10** `ok` is `true` exactly when `errors` is empty. Each error is `{path, code, detail}`, where `path` names the field (`spaces.parcel.forms[0].pattern`). Every error found is reported, not only the first. Never throws.
- **R11** The codes: `NOT_A_PROFILE` (not an object); `ID_INVALID`, `NAME_MISSING` and `COVERS_MISSING` (R1); `UNKNOWN_SECTION`, `UNKNOWN_SPACE` and `UNKNOWN_VOCABULARY` (a key outside R3–R7); `BASIS_MISSING` and `BASIS_INVALID` (R2, including `TEST` outside a test profile); `PATTERN_INVALID` (the source does not compile, or a flag is outside R2); `NORMAL_INVALID` (a group the pattern lacks, or a transform outside R3); `DUPLICATE_FORM` (one form name twice in a space); `SYSTEM_UNKNOWN` (a floor or file number naming an origin that none of the profile's systems has); `CROSSWALK_UNSOURCED`, `CROSSWALK_FORM_UNKNOWN` and `CROSSWALK_VALUE_INVALID` (no `source`, a form the space lacks, or a pair value its form does not recognise); `HOST_CONFLICT` (a host that is mixed and also in a system entry with no `path`); `VALUE_INVALID` (a field of the wrong type, such as a floor or `minutes_due_days` that is not a positive integer).
- **R28** The codes for the action sections: `SOURCE_KIND_UNKNOWN`, `LEVEL_UNKNOWN`, `KIND_INVALID` and `COUNT_UNKNOWN` (a value outside R23–R26); `TIER_INVALID` (a tier other than 1, 2 or 3); `TEMPLATE_TIER3` (a template on a Tier 3 kind); `CODE_UNKNOWN` (a `code` no `vocabulary.codes` entry has); `LAW_UNKNOWN` (a `laws` entry no `records_laws` or `standard_sources` entry has); `DEADLINE_KIND_UNKNOWN` (an `applies_to` that is neither `claim` nor a kind of the profile); `DUPLICATE_KIND` (one kind twice).

**combine(list) → `{ok: true, view, conflicts}` or `{ok: false, errors}`.** `list` is the active profiles, in order: each is a held profile's `id` or a profile object. Which profiles are active is an instance setting held by the record. This module takes the list and does not store it.
- **R12** An `id` that is not held gives `UNKNOWN_PROFILE`. An object that fails `validate` gives `INVALID_PROFILE`, with its errors. A profile given twice is combined once. Never throws. Two different profiles with one `id` in the list give `INVALID_PROFILE`; a list that is not an array gives `NOT_A_LIST`; an unknown field in an entry gives `UNKNOWN_SECTION`.
- **R13** `view` has the profile shape, so a consumer can use it wherever it can use a profile. It also has `profiles` (the ids combined, in order), `covers` (the union), and `test` (`true` when any profile combined is a test profile). Each fact in it carries `profile`, the id of the profile it came from, beside its basis. Its `id` is the combined ids joined by `+`, and it has a `name`.
- **R14** List facts are unioned in the order given. An entry equal to an earlier one in everything but its basis and `profile` is kept once, carrying both. Order is kept, because a consumer may take the first match (id-spaces R13). A space's distinct labels are joined with "; ". A merged fact carries the first giver's `basis` and `profile` and `bases: [{profile, basis}]` for every giver.
- **R15** A fact with one value per key is kept only when every profile that gives it gives the same value. Such facts are a kind's floor, a form's definition under its name, a `practice` value, and the origin named by a host and path. When the profiles disagree, the fact is withheld from the view, and `conflicts` gets `{at, values: [{profile, value, basis}], says}`. Two system entries conflict when they share a host, give the same `path` (or both give none), and name different origins. A host that one profile marks mixed and another puts in a system entry with no `path` also conflicts. **combine never chooses between profiles that disagree.** A consumer then finds no fact there, and answers undetermined.
- **R16** An empty list gives `ok: true` and a view with no facts. An instance with no active profile is valid, and every consumer answers undetermined wherever it needs a local fact.
- **R29** In the action sections, a kind's `tier`, `venue` and `template`, and a deadline's `days`, `count` and `starts` under one `rule` and `applies_to`, are facts with one value per key (R15). Profiles that disagree on one have it withheld and reported in `conflicts`. A kind's `label` and a deadline's `citation` that differ across profiles are joined with `; `; `laws` are unioned; a deadline's `extension` is one value per key.

## Private

### Uses

None.

### Invariants

- **R17** Pure: no store, no network, no clock. The same inputs always give the same answer.
- **R18** What `get` and `combine` return is the caller's own copy. Changing it changes no later answer.
- **R19** Every held profile passes `validate`, and no two share an `id`.
- **R20** No service treats a profile by its identity. A copy of a profile with its `id`, `name` and `covers` changed gives the same answers, apart from those three fields and the `profile` tags.
- **R21** The first profile covers the city and county whose facts the product carries today. It holds every local fact in the code at `snapshot/pre-refactor-2026-09-25`, each with its basis, and every string that code matches because of a local fact is matched by the profile's pattern:
  - `spaces`: the four spaces' labels and forms, including the concurrent project forms and the county parcel form with its prefix and normalisation. It also holds the enactment kinds, the words that name them, and each kind's coverage floor with its system (M-119, M-132, M-157). There are no crosswalks (M-157: none captured).
  - `systems`: every entry now in `idspaces.mjs`: the legislative record, by its own hosts and by its path on a shared API host; the budget data set; the county assessor's layer republished by the city's portal, provenance unstated; the assessor's own publications; the permit system; and the auditor. `mixed_hosts` holds both mixed hosts.
  - `vocabulary`: the jurisdiction's and its offices' names that the recognisers skip as page furniture, and the legislative record's link labels. Also the body-name forms and the member title; the enactment series marker; the municipal code's name and abbreviation, with its key prefix and label; the legislative file-number form; and the staff-report template's titles, section headings, recommendation opener and unfilled template text (M-18, M-24, and the recognisers' dated measurements).
  - `practice`: the minutes-due period, with basis `UNMEASURED`, as its code states. `search_terms`: `readingNamePlan`'s default terms. `records_laws`: the state public-records law that the action kind `cpra_request` and its undetermined sentence name today (D-149).
- **R22** A test profile is held: `test: true`, covering a fictional jurisdiction, with every basis `TEST`. It supplies every section and vocabulary key that the first profile supplies, with values that differ from the first profile's in each, and it shares no host with the first profile. Every module that takes local facts is tested against it (`build/layers.md`, rule 3).
- **R30** The first profile holds the action sections as far as they are measured: the action kinds of `ACTION_KINDS` in `bio-plane/checks/bio-checks.mjs` at the snapshot, renamed to R25's form, each with its tier from Roadmap v5 §8 where §8 names it; the records law's response period and its citation; and the offices those kinds are addressed to. Each fact without a measurement has basis `UNMEASURED`. The test profile (R22) supplies every action section too.

### Satisfies

- `build/layers.md`, "No jurisdiction in the product", rules 1, 2, 3 and 5.
- `BIO_Content_Framework_v0_10.md` §8.3, "What makes a shared identifier count": what a system is (rule 1), concurrent forms and captured crosswalks (rule 2), and coverage floors (rule 3).
- `DOCUMENT-PROFILES.md`, "The failure asymmetry, which governs every default": a rule is added only on measurement.
- `BIO_Case_Making_v0_1.md` §2, "A records request names every law that governs it" (D-149).
- `BIO_Distribution_v0_1.md` §1–§2: an instance is installed by a group anywhere.
- `BIO_Design_Requirements_v2.md` §7 and §8 (as amended 2026-09-26) and `BIO_State_Rules_Consistency_v1_5.md` §4.4: action kinds, risk tiers, and deadlines that name their basis (R23–R30).

### Suggestions

- Layout: `jurisdictions/index.mjs` for the services, and one data file per profile under `jurisdictions/profiles/`. Only those data files, and this module's tests of them, name a place.
- **For the callers.** Consumers take `combine(...).view`, so conflict handling lives in one place. The record holds the active list and refuses to activate a test profile. The installer offers the choice of profiles at install. Those requirements belong to the modules that hold the setting and call `combine`.
- Known bases for the first profile: M-119, M-132 and M-157 (identifiers and systems); M-18 and M-24 (minutes, staff report, ordinance or resolution); M-121 (directory: it has no local vocabulary in code); and dated entries in `MEASUREMENTS.md` (the calendar and handlers, 2026-07-30; the agenda, FW-15).

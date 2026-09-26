# id-spaces — requirements

**Status** · DRAFT by BOB #37, 2026-09-25, the T6 sample. Rewritten the same day for the rule "No jurisdiction in the product" (`build/layers.md`) and the conventions in `README.md`. Layer 1. Code today: `bio-plane/src/idspaces.mjs`, which names Oakland's systems in code (plan entry N2).

## Public

### Purpose

Judges whether one identifier, appearing in two captured documents, is a shared identifier that counts as a connection. It checks the value, its form, the independence of the two systems that published it, and its referent, in that order. Every local fact it needs (spaces, forms, systems, floors) comes from the jurisdiction profiles it is given. It holds no record and reads nothing.

### Provides

Every service takes `view`: the combined view of the active jurisdiction profiles that `jurisdictions.combine` gives, with its `conflicts`. The identifier spaces are `enactment` (an ordinance or resolution number), `project`, `fund` and `parcel`. A profile supplies each space's forms, the publishing systems, and the coverage floors.

**spaces(view) → `[{space, label, referent, forms}]`**
- **R1** Lists the four spaces and, for each, the forms the view supplies. `referent` is `name` for `fund` and `reading` for the others.
- **R2** A space may have several forms at once. Forms are told apart by the value's shape, never by a date.
- Errors: never throws. A space with no form in the view is listed with `forms: []`.

**recognise(view, space, value) → `{space, value, form, normal, kind?, reach?}` or `null`**
- **R3** Returns `null` for an unknown space, an empty value, or a value that has the shape of none of the space's forms.
- **R4** `normal` is the string two values are compared on. It is derived from the value by removing formatting only, as the form defines (spacing, letter case, a prefix, the zero-padding of a numeric part). A digit is never changed.
- **R5** For `enactment`, the result also gives `kind` (a kind the profile names, such as ordinance or resolution, or `null`), and `reach`, as `reach()` gives it for that number and kind.
- Errors: never throws.

**reach(view, number, kind?) → `{reach, floor?, says}`**
- **R6** With a kind, `reach` is `INSIDE` at or above that kind's coverage floor and `OUTSIDE_REACH` below it.
- **R7** With no kind, `reach` is `OUTSIDE_REACH` below every kind's floor, `INSIDE` at or above every floor, and `UNDETERMINED` otherwise. `says` names the floors and why.
- **R8** `OUTSIDE_REACH` is never reported as "not found". `says` states that the record's source holds nothing that old.
- **R9** With no floor for the kind, `reach` is `UNDETERMINED`. `says` distinguishes two causes: no coverage floor is measured, or the active profiles give conflicting floors (the view lists the conflict), naming them.
- Errors: never throws.

**parcelStanding(key, evidence) → `{standing, roll_year?, children?, vintages_searched, says}`.** `evidence` is optional: `current` (the keys in the assessor's current layer), `lineage` (key → the assessor's own retirement records `{roll_year, children}`) and `vintages` (the names of the published vintages searched).
- **R10** `CURRENT` when the key is in `current`.
- **R11** Otherwise `RETIRED` only when `lineage` records the key. `roll_year` is the earliest year recorded, and `children` is every child, deduplicated and sorted.
- **R12** Otherwise `UNDETERMINED`, between "retired before the earliest published lineage" and "never a parcel". `says` gives the number of vintages searched, or says none was held. The answer is never "no such parcel".
- Errors: never throws. Missing evidence is treated as empty.

**systemOf(view, addresses) → `{origin, name, republication, provenance_stated, basis, addresses}` or `{origin: null, addresses, why}`**
- **R13** One address names the system of the first system in the view that matches its host and, where the entry gives one, its path. A republication names the system it republishes.
- **R14** A host that serves many offices' publications names no system, and `why` says so. So does an address no system in the view matches, and one that cannot be parsed.
- **R15** Several addresses name a system only when every one names the same system. Otherwise `origin` is `null`, and `why` says whether there were no addresses, different systems, or unknown ones.
- Errors: never throws.

**judgePair(view, space, a, b, reading?) → `{verdict, counts, says, near_miss?, referent?}`.** `a` and `b` are `{rec, system, name?}`: `rec` from `recognise`, `system` from `systemOf`, and `name` for a fund. `reading` is the caller's referent reading: `agrees`, `disagrees` or `null`.
- **R16** The checks run in this order, and the first that decides, decides: form, value, the systems' independence, the fund name (fund only), then the referent. So no reading can make two publications of one source count.
- **R17** Different forms give `FORMS_UNJOINED`: an unmade join, not a mismatch. Two forms never join unless the view supplies a crosswalk between them.
- **R18** Different values give `VALUES_DIFFER`. When they differ only by leading zeros, `near_miss` is `true`. A near miss is never counted.
- **R19** An end with no known system gives `SYSTEM_UNDETERMINED`. Both ends in one system give `SAME_SYSTEM`.
- **R20** For a fund, an end with no name gives `FUND_NAME_ABSENT`. Names equal after normalising (case, punctuation, the word "fund") give `SHARED`, with `referent.by` stating that the names were compared.
- **R21** Otherwise, with no reading, the verdict is `REFERENT_UNREAD`. A reading of `disagrees` gives `REFERENT_DISAGREES`. A reading of `agrees` gives `SHARED`, and `says` and `referent.by` state that the referent rests on the caller's reading, which this module did not make and cannot check.
- **R22** `counts` is `true` only for `SHARED`.
- Errors: throws `TypeError` when `a.rec` or `b.rec` is null, or when the two are not in `space`. The caller must recognise both values first.

**Legacy adapter (temporary, K35; retired when `op=idmatch` leaves `legacy-store`, entry N6).** For `legacy-store` only, which calls the old interface until then.
- **R26** The old names `ID_SPACES`, `recognise(space, raw)`, `apnStanding`, `systemOfAddresses` and `judgePair(space, a, b, reading?)` are exported, each answering exactly as its view-first service answers over the view `jurisdictions.combine` makes of every non-test profile `jurisdictions` holds, with the old space names mapped (`cms` ↔ `enactment`, `apn` ↔ `parcel`) in and out. The adapter names no place (R24 holds).

## Private

### Uses

- `jurisdictions`: the combined view's shape (`combine`), and its identifier spaces, systems, floors, crosswalks and conflicts.

### Invariants

- **R23** Pure: no store, no network, no clock. The same inputs always give the same answer.
- **R24** No place is named in this module. Given two profiles for different jurisdictions, every service answers from the view alone. The tests use at least one profile other than the first.
- **R25** Every "no" says which kind of no: outside the reach, undetermined, unjoined, a different value, or one system. Absence is never reported as non-existence.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §8.3, "What makes a shared identifier count", with BOB #34's amendment to rule 3 (2026-09-25).
- `build/layers.md`, "No jurisdiction in the product".

### Suggestions

- **For the caller** (`entities`, `op=idmatch`): pass `systemOf` only the addresses the record located each capture at, never an address from the request. A provenance hop a caller can hand in is one a caller can invent. That requirement belongs in `entities`, with the three refusals C-91.1 to C-91.3 now in `bio-checks.mjs`.
- The Oakland profile's facts are measured: M-119, M-132 and M-157. None of them is captured as a crosswalk today (M-157: 0 crosswalk lines).

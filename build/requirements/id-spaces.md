# id-spaces — requirements

**Status** · DRAFT by BOB #37, 2026-09-25: the SAMPLE for T6, written first so Bob can approve the pattern before the other layer-1 modules are drafted. Layer 1. Code today: `bio-plane/src/idspaces.mjs`.

## Public

### Purpose

Judges whether one identifier, appearing in two captured documents, is a shared identifier that counts as a connection: its value, its form, the independence of the two systems that published it, and its referent, in that order. It holds no record and reads nothing.

### Provides

**Spaces.** `ID_SPACES`: the identifier spaces the module knows, each with a label, its forms, and how its referent is established.
- **R1** Four spaces: `cms` (resolution or ordinance number), `project`, `fund` and `apn` (Alameda County assessor's parcel number). Its referent is established by a `reading` for cms, project and apn, and by the fund `name` for fund.
- **R2** A space may have several forms at once. A form is told apart by the value's shape, never by a date. Project has four forms: `C#####`, `P#####`, `100xxxx` and `100xxxx` with a letter suffix.

**recognise(space, value) → `{space, value, form, normal, kind?, reach?}` or `null`.**
- **R3** Returns `null` for an unknown space, an empty value, or a value with the shape of no form of the space.
- **R4** `normal` is the string two values are compared on. It is derived from the value alone, by removing formatting only: spacing, letter case, a leading `#` or `APN`, and an APN's zero-padding (each numeric part is read as an integer). A digit is never changed.
- **R5** For `cms`, the result also carries `kind` (`ordinance`, `resolution` or `null`) and `reach`, as `cmsReach` gives it.

**cmsReach(number, kind?) → `{reach, says}`.**
- **R6** `reach` is `INSIDE` at or above the floor for the kind (`CMS_FLOOR`: ordinance 12274, resolution 75950), and `OUTSIDE_REACH` below it.
- **R7** With no kind, a number below both floors is `OUTSIDE_REACH`, at or above both is `INSIDE`, and between them is `UNDETERMINED`. `says` gives the reason.
- **R8** A number outside the reach is never reported as "not found". `says` states that the record holds nothing that old.

**apnStanding(key, evidence) → `{standing, …, vintages_searched, says}`.** Evidence is optional: `current` (the keys of the assessor's current layer), `lineage` (key → the assessor's own retirement records) and `vintages` (the names of the published vintages searched).
- **R9** `CURRENT` when the key is in the current layer.
- **R10** `RETIRED` only when the assessor's own lineage records the retirement. The answer gives the earliest roll year and the children.
- **R11** Otherwise `UNDETERMINED`, between "retired before the earliest published lineage" and "never a parcel", naming the vintages searched, or saying that none was held. Never "no such parcel".

**systemOfAddress(address) → `{origin, name, republication, provenance_stated, basis, host}` or `{origin: null, why}`.**
- **R12** Returns the publishing system of one address from `ID_SYSTEMS`, the measured table of systems. A republication is judged as the system it republishes.
- **R13** A host that serves many offices' publications names no system, and `why` says so. So does an address no system is measured for, and one that cannot be parsed.

**systemOfAddresses(addresses) → the same shape plus `addresses`.**
- **R14** Names a system only when every address names the same one. With no address, or with addresses of different or unknown systems, `origin` is `null` and `why` says which.

**judgePair(space, a, b, reading?) → `{verdict, counts, says, …}`.** `a` and `b` are `{rec, system, name}`: `rec` from `recognise`, `system` from `systemOfAddresses`, and `name` for a fund. `reading` is a referent reading the caller supplies (`agrees`, `disagrees` or `null`).
- **R15** The checks run in this order, and the first that fails decides: form, value, the independence of the systems, the fund name (fund only), then the referent. No reading can make two publications of one source count.
- **R16** Different forms give `FORMS_UNJOINED`: an unmade join, not a mismatch. Two forms join only through a captured crosswalk, and none is captured.
- **R17** Different values give `VALUES_DIFFER`. A difference of a leading zero only is flagged `near_miss` and never counted.
- **R18** An end with no known system gives `SYSTEM_UNDETERMINED`. Two ends from one system give `SAME_SYSTEM`. Neither counts.
- **R19** Fund: an end with no fund name gives `FUND_NAME_ABSENT`. Names equal after normalising give `SHARED`, counted, with the referent established by the names.
- **R20** With no reading supplied, the verdict is `REFERENT_UNREAD`, not counted. A reading of `disagrees` gives `REFERENT_DISAGREES`, not counted. A reading of `agrees` gives `SHARED`, counted, and the answer says the referent rests on the caller's reading, which this module did not make and cannot check.
- **R21** `counts` is `true` only for `SHARED`.

## Private

### Uses

Nothing.

### Invariants

- **R22** Pure: no store, no network, no clock. The same inputs always give the same answer.
- **R23** A system is never taken from the caller. `judgePair` takes each end's system only as a result of `systemOfAddresses`, over the addresses the record located the capture at. Its caller (`entities`, `op=idmatch`) is responsible for passing the record's own addresses.
- **R24** Every "no" states which kind of no it is: outside the reach, undetermined, unjoined, or a different value. Absence is never reported as non-existence.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §8.3, "What makes a shared identifier count", as amended by BOB #34 on 2026-09-25 (rule 3's APN clause).
- The doctrine in `CLAUDE.md` §2 that absence at one level is not evidence of absence at the next.

### Suggestions

- The system table and the floors are measured data (M-119, M-132, M-157). Adding a system or an institution changes data, not rules. It still needs a measurement named as its basis.
- `op=idmatch`'s three refusals (C-91.1 to C-91.3, in `bio-checks.mjs` today) belong to `entities`, which owns the op, not to this module.

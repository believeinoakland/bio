# N1259 (b2): review items moved out of `N1259-b-registers-module.md` (size), and C13 notes

Part (b)'s file is within bytes of its 45,000 limit; prose goes here.

## Review items moved from the "Review (C7 worker)" section of part (b)

**Part (a).** R127: `pieces` non-empty vs R133's officers; `gate` lacked R128's `people_search`; `status: not_measured` undefined; closed lists `SECTIONS`, `systems` fields (`jurisdictions/index.mjs:19,415`). R129: `M-R1` is no basis (jurisdictions R2). R130: scheme fields, spaces (`index.mjs:1273-1283`). R132: `following` R38 is a part (c) draft. R133: two pinned tests. register-readers: heading R1-R24 -> R1-R11; Uses (`ooxml` R30 limits vs M-R1 rows 3-4, `createRecordWalk` at `csv-reader/index.mjs:470`, `createResumableSha256` for R9, R127, `recognise`, `sheetgen`, `civil-time`); `MODULE_ORDER` (`member-roster` R61); `streamMember` is ooxml's (`ooxml.mjs:2134`). R84 (`keyedServices()` pinned), R125 (grade), R130 (`KEYED_DAEMON_NOT_ALLOWED` -> `NOT_PERMITTED`; `following` R37 -> R41), R132 (redirects), R133 (`origin` kind), R63, R113: see the lines. Flagged: R4 (phone and street forms as code), R65 (a test on `content` columns), R130 against K1449.

**Part (b).** Header; R3 `registerPlan` -> `registerFilter`; R7 kept-false vs refused; R11 call up to `scheduler` -> `onImportQueued` (scheduler R9, R23); R12 `monitoring` (layer 10) host injected; R22 `from` (record-core R77); R30 tombstone (record-core R79); R32 `onInterest(module, fn)` (following R19); Uses: `journey-check` dropped (`layers.md`). Flagged: R8 (project subjects), R11 (the name `registerimport` is `events` R38's: not the same act, so ours is `registerfileimport`, K5469).

(Part (a) ids in the first paragraph are now N1257's: R99-R105 are `jurisdictions` R127-R133 in `N1257-requirements-jurisdictions.md`; the item labels above already use the new ids.)

## BOB's C13 decisions applied in part (b)

1. Uses: `store-assembly` is the composition root, so it (not `plane`) takes the new `registers` edge; `journey-check` needs none and is no longer named in the edge list.
2. R12: `importTick(now, budget, host)` takes `host` as a parameter; nothing is imported from `monitoring`.
3. R24: `budget_ms` above 10,000 is refused with the new code `SEARCH_BAD_BUDGET` (grep of the whole checkout found no other use); Test in R24 (10,001 refused, 10,000 served, nothing written).
4. R30: `rowExpunge` takes a REQUIRED `reason`; a blank one is refused `ROW_EXPUNGE_NO_REASON` (new, unique by grep), which joins `JUSTIFICATION_REFUSALS` (op-grades R55 in part (c)). The tombstone is unchanged (`record-core` R79 holds no reason); where the reason is kept is `record-core`'s to say at numbering.

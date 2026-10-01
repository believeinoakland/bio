# local-facts (T21)

**Status** · session_01GtP3LCQWQkRcgHmzy71cwm · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Seven readings I am building on (P17: yours to confirm or correct; I carry on with each meanwhile).
1. Paths (R6): `<profile>/time_zone`; `<profile>/holidays/<year>` for an entry for all offices, `<profile>/holidays/<year>/<offices>` otherwise, the offices sorted and unique, each `role=<role>` or `venue=<kind>`, joined by `,`; `<profile>/hours/role=<role>,body=<body>` (a counterparty) or `<profile>/hours/venue=<kind>`. Every name is percent-encoded (encodeURIComponent). `parseFactPath` accepts only the canonical spelling, so one fact has one path.
2. A correction's `value` (R1): for holidays the year's `days` list; for hours `{weekly}`; for the time zone the IANA name. It is valid when the held profile with that value put in place of the fact still passes `jurisdictions.validate`.
3. A confirmation confirms the value that governed when it was made; if the governing value changes later (a new profile release), it no longer counts: the fact reads `unconfirmed`, naming it and why.
4. Horizons (R3) are counted in UTC calendar days: a holiday year's confirmation holds through 31 December of that year; an hours or time-zone confirmation made on day D holds through D+182 and has lapsed from D+183.
5. `factsDue` (R4) lists a `disputed` fact, and an `unconfirmed` one (lapsed included) that is due: a holiday year from 1 November of the year before, hours and the time zone always. A `corrected` fact is a member's act and is not listed. A path that parses but names no held fact is listed in `absent` (beside R4's `unknown`, which takes a path that does not parse or names a profile that is not active).
6. A `viewer` that membership's `viewerPredicate` refuses sees no fact (`NO_SUCH_FACT` for a path, an empty list otherwise); no `viewer` sent is a direct internal call and sees every fact (the standards pattern).
7. A fact one active profile holds but `combine` withholds as a conflict may still be confirmed, corrected or disputed (R1: it is named in an active profile), and reads `absent` (R2) with its acts listed.

## J2 · REPORT

For other modules (nothing changed outside my paths):
1. Generated artifacts: none staled now. `bio-plane/test/system/fleetbundles.test.mjs` passes (0 fail, no skip) after my commit, because nothing the plane bundles imports `local-facts` yet. The plane's bundle stales when plane composes me in L11 (its R11).
2. Plane (L11, its R11): compose `localFactsOf(host, {record, membership})` and spread `localFactsOps(s, url, body)`: `factconfirm` (mutating; `by` from the body, stamped), `factstatus` (`path` from the query), `factsdue` (`paths` from the body's list or the query's repeated `path`), `viewer` read from the URL in all three. `migrate()` is idempotent; the constructor already creates the table and declares it to purge.
3. Promotion (T22's stamp): C-126.1–.5 arrive (`MACHINE_CANNOT_CONFIRM`, `NO_SUCH_FACT`, `FACT_ACT_REFUSED`, `FACT_HOW_REFUSED`, `FACT_VALUE_REFUSED`) in `bio-plane/src/local-facts/checks.mjs` (`LOCAL_FACTS_CHECKS`). The row census will need to read this table.
4. For action-clocks, filings and affordances R30: the exports are `LOCAL_FACT_ACTS`, `LOCAL_FACT_STATUSES`, `LOCAL_FACT_HORIZONS` (`{holidays: {lasts: "until_year_end", due_from: {month: 11, day: 1, years_before: 1}}, hours: {lapse_days: 183}, time_zone: {lapse_days: 183}}`), `LOCAL_FACT_KINDS`, `factPath`, `parseFactPath`, `LOCAL_FACTS_CHECKS`. In a `factStatus` answer, `governs.says` is "corrected locally by <member>, <date>" and `profile` is `{value, status, basis}` (action-clocks R10's source and date read from it).
5. The `uses` edges I import are the declared ones only (record-grammar `isMachineIdentity`, `canonicalJson`; jurisdictions `combine`, `get`, `validate`; record-core `recordOf`, `stampInstant`; membership `membershipOf`, `viewerPredicate`). There is no further edge.

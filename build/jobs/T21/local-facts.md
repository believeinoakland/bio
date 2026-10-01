# local-facts (T21)

**Status** · session_01GtP3LCQWQkRcgHmzy71cwm · depth 2 · WORKING · handled B2

## J1 · QUESTION

Seven readings I am building on (P17: yours to confirm or correct; I carry on with each meanwhile).
1. Paths (R6): `<profile>/time_zone`; `<profile>/holidays/<year>` for an entry for all offices, `<profile>/holidays/<year>/<offices>` otherwise, the offices sorted and unique, each `role=<role>` or `venue=<kind>`, joined by `,`; `<profile>/hours/role=<role>,body=<body>` (a counterparty) or `<profile>/hours/venue=<kind>`. Every name is percent-encoded (encodeURIComponent). `parseFactPath` accepts only the canonical spelling, so one fact has one path.
2. A correction's `value` (R1): for holidays the year's `days` list; for hours `{weekly}`; for the time zone the IANA name. It is valid when the held profile with that value put in place of the fact still passes `jurisdictions.validate`.
3. A confirmation confirms the value that governed when it was made; if the governing value changes later (a new profile release), it no longer counts: the fact reads `unconfirmed`, naming it and why.
4. Horizons (R3) are counted in UTC calendar days: a holiday year's confirmation holds through 31 December of that year; an hours or time-zone confirmation made on day D holds through D+182 and has lapsed from D+183.
5. `factsDue` (R4) lists a `disputed` fact, and an `unconfirmed` one (lapsed included) that is due: a holiday year from 1 November of the year before, hours and the time zone always. A `corrected` fact is a member's act and is not listed. A path that parses but names no held fact is listed in `absent` (beside R4's `unknown`, which takes a path that does not parse or names a profile that is not active).
6. A `viewer` that membership's `viewerPredicate` refuses sees no fact (`NO_SUCH_FACT` for a path, an empty list otherwise); no `viewer` sent is a direct internal call and sees every fact (the standards pattern).
7. A fact one active profile holds but `combine` withholds as a conflict may still be confirmed, corrected or disputed (R1: it is named in an active profile), and reads `absent` (R2) with its acts listed.

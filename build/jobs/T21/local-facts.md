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

## J3 · COMPLETE

local-facts built from nothing in `bio-plane/src/local-facts/` (`index.mjs`, `paths.mjs`, `schema.mjs`, `checks.mjs`; 584 lines). Commit 3 on `job/T21/local-facts`.

**Entries applied.** B1: R1–R8, all met: **R1, R2, R3, R4, R5, R6, R7, R8, each marked `not yet met: T21`, now met** (for BOB to strike at the merge, K775 (6)). B2 (K986): readings (1)–(4), (6) and (7) as stated in J1. (5) is corrected: `factsDue` lists every `unconfirmed` fact (lapsed included) and every `disputed` one, whatever its due date. Each entry carries `due`, `due_from` and `lapses_on` where they apply, and `why`, which says when the fact falls or fell due, when it lapsed, or who disputed it and when. A `corrected` fact is not listed. `absent` sits beside `unknown`. The names are kept: `factStatus({path, viewer})`, `factPath`, `parseFactPath`. N469: my paths are new; I scanned them and they hold no note naming a deleted file or "the battery".

**Rows.** C-126.1–.5 in `checks.mjs`, every one `awaiting stamp` (T22).

**Deferred.** Nothing.

**Found in other modules.** See J2 (REPORT). No generated artifact is staled yet; the plane's bundle stales when plane composes me in L11.

**Tests and checks.**
- `node --test bio-plane/test/m/local-facts/`: tests 22, pass 22, fail 0.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: pass 1, fail 0, skipped 0.
- No layer tests are named in the manifest.
- `format`: 86 modules, 84 requirements files; 0 failures.
- `architecture local-facts`: 10 product files, 25 relative imports; 0 failures.
- `coverage local-facts`: 8 of 8 live requirement ids named by a test; 0 failures.
- `ownership local-facts tranche/T21`: 11 files changed; 0 failures.

Size (session_01GtP3LCQWQkRcgHmzy71cwm): test runs 9, module lines 584

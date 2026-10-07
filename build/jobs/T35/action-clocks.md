# action-clocks (T35)

**Status** · session_01UFtQue2xpbhshBRbkbZG3j · depth 2 · WORKING · handled B1

## Completion (ACTION-CLOCKS #9)

**Entries applied (T35-62).**
- (K1917) `factreader.test.mjs`:64 and :112 follow civil-time's DEC-149 wording: "disputed in your group's Civicsmith", "cannot be read in your group's Civicsmith"; each string is named in its test's title. Accepted red 14 is cleared (factreader 5/5).
- (N689, K1847; R11 as K1941 amended it) `calendarFactsRead` also lists, for every live action whose kind has a business-day deadline, the entries of each named closure list that one of its kind's deadlines counts or rolls on, as `closures` or `observed.closures`. Each entry is listed at its own `list=<name>` path (`local-facts.factPath` with the entry's `list`, the path R12 reads it at), for the same years and offices as the office calendar. A path that a rule and its `observed` both name is listed once. A rule that names a list but neither counts nor rolls on it reads nothing from that list. New pure export `closureListsRead(d)` (`count.mjs`); `yearEntries(view, offices, year, list?)` takes an optional list name (with no list, the result is unchanged).
- Improvement in my own module: `readsOfficeCalendar` and `computeDeadline` now share one predicate, `readsClosed`, for whether a count reads closed days. As a result, a rule whose only business count is its extension now counts as reading the office calendar for R11. Before, `computeDeadline` stated that rule's calendar but R11 did not list its paths.

**Tests.** `calendar.test.mjs` has two new R11 tests. The first uses the test profile's CPRA-like rule, which counts on `town` with an `observed` practice of `court`: both lists' entries are listed, each once, each at the path R12 reads, each confirmable there, and every unconfirmed year the count states names a listed path. The second uses a profile variant with a list the rule only rolls on, a path both the rule and its `observed` name, another office's list entry, and a rule that names a list it neither counts nor rolls on. It also tests `closureListsRead` at its interface, with negative controls. The tail of the first R11 test asserted K1519's "no list entry ever becomes a path". That assertion contradicts R11 as amended, so it is replaced: it now checks that a list-counted rule reads no office-calendar entry, and the list paths are the next test's.

**Deferred.** Nothing.

**Other modules.** Nothing found. No generated artifact is made stale beyond the plane bundle's usual regeneration at L9's close (`action-clocks` is a plane input).

**Tests and checks run.**
- `bio-plane/test/m/action-clocks/`: tests 55, pass 55, fail 0.
- Users of the service (R11 changed): filings 67/0; action-plans 63/0; monitoring 121/0; queue-producers 80/0; affordances 201/2; op-declarations 81/3; control-plane 178/4; plane 107/8. Every failure in the last four suites also fails on `origin/tranche/T35` without this change: the failure sets are equal, or a subset of the base's (affordances t33 grading, inherited red 29; op-declarations, reds 9, 23 and 29; control-plane, reds 19, 26, 29 and 33; plane ask and link-sweep). None is new.
- `node checks/format.mjs`: 130 modules, 129 requirements files; 0 failures.
- `node checks/architecture.mjs … action-clocks`: 15 product files, 68 relative imports; 0 failures.
- `node checks/coverage.mjs … action-clocks`: 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … action-clocks tranche/T35`: 5 files changed; 0 failures.

Size (session_01UFtQue2xpbhshBRbkbZG3j): test runs 19, module lines 1629

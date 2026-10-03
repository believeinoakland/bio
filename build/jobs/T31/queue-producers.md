# queue-producers (T31)

**Status** · session_017G9P7gWoc355pFUPiJKHKb · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks me until wizard-scripts merges):
1. R35 `cited-docket-entry-refused`: case-import's settled reading (1) lets several refused copies hold one `seq`, and a refused entry may have no `seq`. I key one item per `<import>#<seq>`, naming every check its copies failed; a refused entry with no readable `seq` is keyed `<import>#unnumbered`.
2. R35 recipients: the setter while `membership.memberFacts(set_by).status` is `active`, else `activeAdmins()` (R86). A caller with no member (the admin machine credential included) is told none: R35 names R86's administrators, not R14's credential.
3. R35 findings' `age`: `watchItems` carries the publisher's `date` but no instant this copy read the entry, so `age` is undetermined (`no_seen_instant`); the unreadable CONDITION ages from the read's `at`. Improvement for case-import (its R20): name each entry's read instant; I will REPORT it.
4. R35 options (not stated): followed-case-entry and refused offer `importedcase`; unreadable offers `importwatch` and `importunwatch` (R12: a member's act can change it).
5. R34: dedupe on the key (`<kind>::<dependent>::<import>#<seq>`); cited editions are the distinct `legs[].cited_edition`; `accepted_work_absent`/`_unreadable` carried on the basis; group/case null when reevaluation withholds them (worded "another group").
6. R32/R33: I build them against wizard-scripts' own code once it merges (B1). R32 needs each `brokenScripts` entry to name the script's project and the version's author (or a read giving them); if wizard-scripts' entries do not carry them I will ask.

## J2 · REPORT

For wizard-scripts, while it builds (its R13, R17 name `queue-producers` R32, R33 as their reader; neither names its entries' fields). What I need each entry to carry, so I read no table of theirs:
- `brokenScripts({after, limit, viewer})` → `{ok, entries, cursor, truncated}`, each entry `{script, version, kind: "withdrawn"|"restored", at, name, project (null for a group script), author (the version's author), refusal: {code, check, translation} (a withdrawal; null for a return)}`. R32 goes to `project`'s owners and `author`, keys `FINDING::wizard-<kind>::<script>@<version>::<at>`, and names the first refusal by its `translation`. If R13's "break"/"return" are worded otherwise, any mapping is fine if the two values are fixed.
- `submittedFor({after, limit, viewer})` → `{ok, entries, cursor, truncated}`, each `{script, version, owner, name, author, submitted_at, project}`. R33 keys `OBLIGATION::wizard-approval-requested::<script>@<version>::<owner>`, ages from `submitted_at`, homes under `project` (none for a group script).
- `wizardScriptsOf(host, deps)` as the factory name.
Progress: R34 and R35 are built and tested (J1's readings); queue-producers tests 76/76, format, architecture, coverage and ownership all 0 failures. Coverage reads R32 and R33 as named only because unrelated strings carry them ("reevaluation R33", proposals); I write their real tests after wizard-scripts merges.

## J3 · REPORT

`queue` (not in T31): its test world `bio-plane/test/m/queue/world.mjs`:132 fakes `reevaluation` without `citedCaseDependents` (reevaluation R33, which queue-producers R34 now reads), so 31 of queue's 106 tests throw `citedCaseDependents is not a function` once queue-producers merges. One line fixes it: add `citedCaseDependents: () => ({ ok: true, entries: [], count: 0, limit: 200, truncated: false, cursor: null, wrote: false })` beside `docketDependents`. Measured: with that read answered, queue passes 106/106. Nothing else of queue's is touched (its world reaches the real case-import and wizard-scripts and they answer empty). I did not guard the call in my module: a real reevaluation always offers it, and a guard would hide a missing provider.

## J4 · COMPLETE

Entries applied (plan T31 L11): N528 R8, R32, R33; N534 R34, R35. All `*(not yet met: T31)*` lines are met.
- R34: `cited-newer-edition` / `cited-edition-withdrawn` from `reevaluation.citedCaseDependents` (paged, ≤20 pages, cut stated), keyed and homed as stated, with group, case, cited editions, edition named, quoted words, the unlisted key and the take-back.
- R35: `followed-case-entry`, `cited-docket-entry-refused`, `cited-docket-unreadable` from `case-import.watchItems`, to the setter, else (not active) the administrators; subject `{kind: "import", id}`, no project home; J1 readings (K1397).
- R32, R33: `wizard-withdrawn` / `wizard-restored` and `wizard-approval-requested` from `wizard-scripts.brokenScripts` / `submittedFor`, in K1397/K1399's shapes; a group script's owners are the administrators. A test drives the real wizard-scripts through its fixture.
- R8: feedItems answers all of them; the all-kinds checks (R8, R12, R24, R28) cover the new kinds.
Deferred: none.
Found in other modules: `queue`'s test world (J3, REPORT); `case-import` should name each entry's read instant (N546, K1397).
Tests: queue-producers `node --test bio-plane/test/m/queue-producers/`: 79 tests, 79 pass, 0 fail. No layer tests in the manifest. queue (reads my R8): 106 tests, 75 pass, 31 fail, all from J3's one missing fake (106/106 with it).
Checks: format 0 failures (98 modules); architecture 0 failures (17 files, 66 imports); coverage 0 failures (35 of 35); ownership 0 failures (6 files vs tranche/T31).
Note: J1's doorbell went to the BOB address read at the time (session_01JVc45Ron6Z6Qg9yuJinySb); J2's onward to session_01StRnMqhDPSE4Afi9a5z1U7.
Size (session_017G9P7gWoc355pFUPiJKHKb): test runs 12, module lines 3856

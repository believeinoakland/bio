# queue-producers (T31)

**Status** · session_017G9P7gWoc355pFUPiJKHKb · depth 2 · WAITING ON BOB (J2) · handled B2

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

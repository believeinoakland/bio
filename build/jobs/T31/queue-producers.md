# queue-producers (T31)

**Status** · session_017G9P7gWoc355pFUPiJKHKb · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks me until wizard-scripts merges):
1. R35 `cited-docket-entry-refused`: case-import's settled reading (1) lets several refused copies hold one `seq`, and a refused entry may have no `seq`. I key one item per `<import>#<seq>`, naming every check its copies failed; a refused entry with no readable `seq` is keyed `<import>#unnumbered`.
2. R35 recipients: the setter while `membership.memberFacts(set_by).status` is `active`, else `activeAdmins()` (R86). A caller with no member (the admin machine credential included) is told none: R35 names R86's administrators, not R14's credential.
3. R35 findings' `age`: `watchItems` carries the publisher's `date` but no instant this copy read the entry, so `age` is undetermined (`no_seen_instant`); the unreadable CONDITION ages from the read's `at`. Improvement for case-import (its R20): name each entry's read instant; I will REPORT it.
4. R35 options (not stated): followed-case-entry and refused offer `importedcase`; unreadable offers `importwatch` and `importunwatch` (R12: a member's act can change it).
5. R34: dedupe on the key (`<kind>::<dependent>::<import>#<seq>`); cited editions are the distinct `legs[].cited_edition`; `accepted_work_absent`/`_unreadable` carried on the basis; group/case null when reevaluation withholds them (worded "another group").
6. R32/R33: I build them against wizard-scripts' own code once it merges (B1). R32 needs each `brokenScripts` entry to name the script's project and the version's author (or a read giving them); if wizard-scripts' entries do not carry them I will ask.

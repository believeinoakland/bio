# monitoring (T12)

**Status** · session_017yarQQYYTzVwmWC15R4Zjd · depth 2 · WORKING · handled B2

## J1 · QUESTION

N314's refusal: membership has no public helper that mints `NOT_AN_ADMIN`. The code is minted today only inside membership (`#custodialBar`, `memberCaps`, `adminEndorse`, `adminRemove`, `adminResign`), and its row C-96.1 lives in legacy-checks' `CUSTODIAL_CHECKS`, its `where` naming `#custodialBar`. `isAdministrator` (R64) is public, so the test itself is no problem; the refusal is. Two readings:

(a) membership gains a one-site helper, say `notAnAdmin(by, act)`, answering `{ok:false, reason, code, check, translation, by, detail}` from C-96.1 (as R78 `noSuchProject` does), and monitoring calls it. That is a membership change (layer 2, closed this tranche; the plan says membership is unchanged), so it would be next tranche's.
(b) monitoring's `pause` refuses with `reason: "NOT_AN_ADMIN"`, the string literal at its one site, carrying C-96.1's `check` and `translation` read in place from `CUSTODIAL_CHECKS`, the way it already reads the C-48 rows from `DRIVE_CAPTURE_CHECKS`. The meaning and the sentence are membership's; the site is new.

My best reading, which I am building now: (b), with (a) routed as an N-entry so the site converges on a membership helper. I will name the added site in my record for legacy-tests' DEC-49 census.

Second, smaller point, also on my best reading: the "root of trust" admitted is `class:admin` (the ADMIN_TOKEN bearer, as the Worker stamps it) and the founder `admin` (already an administrator under R64 once the instance is claimed). Any other `class:<cls>` stamp is refused `NOT_AN_ADMIN`; today the Worker's cut admits only the admin class, so that refuses nothing reachable.

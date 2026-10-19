# affordances (T51)

**Status** · session_0184gxzpn1s2EDqr1qacRUZ3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

QUESTION (R62, R70 · ACT_HELP). My best reading, carried on with: the design's reads list for `affordances` (words-reads.json) now gives `does` words for six declared ops the requirements do not name: counselpacket and holdnoticeprepare (R70 names these two), and noticeprepare, noticepost, signeradd, versionnotice (not named anywhere). R62 says this module's keys are the reads list, so I hold all six under their own ops (`act.<op>.does`), beside R69's seven browser acts under `BROWSER_ACTS` (op-declarations is later in the order, so the seven names are held here). Consequence for BOB/T51-107: op-declarations' `ACT_HELP_ABSENT` must stop naming these six (counselpacket, holdnoticeprepare, noticepost, signeradd in `unexplained`; noticeprepare, versionnotice in `read`), or its R34 partition test (t36.test.mjs:298) goes red when this merges; and its partition must run over ops only, since the seven browser acts are in ACT_HELP and are no ops (R69). If you would rather hold only R70's two, say so and I drop the other four (and name them in the test's NOT_HELD_READS).

## J2 · REPORT

REPORT (T51-99, for BOB; none blocks this job).
1. op-declarations (T51-107), by CHANGE as B2 says: with the six ops held in ACT_HELP, four op-declarations tests go red until its ACT_HELP_ABSENT stops naming counselpacket, holdnoticeprepare, noticepost, signeradd (unexplained) and noticeprepare, versionnotice (read): t36.test.mjs R34, t45.test.mjs R34/R49, t43-era R47/R34, t50.test.mjs R75. Its partition must run over ops only: ACT_HELP now also holds R69's seven browser acts (`BROWSER_ACTS`, exported here), which are no ops. Its other 9 reds are as at the tranche tip.
2. Strings no member reads, left in source for the design stream (K3944): `CATALOGUE_DETAIL` (door.mjs: how to read the catalogue answer, names `target=<record id>`, `vocabularies.rung_ladder`, wire fields; read by the assistant pack) and the NO_TARGET refusal `detail` in facts.mjs ("pass target=<record id>"). door.test.mjs still asserts K899's "record, not bundle" on the first.
3. answer-envelope's `page-policy.test.mjs` imports `signpage.mjs` of control-plane: the one architecture failure of checks/architecture.mjs over the whole tree, not mine (rule 1, K3835).
4. Whole-tree words check: 0 lines name affordances.

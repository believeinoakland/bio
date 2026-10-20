# affordances (T51)

**Status** · session_015oCsKY91WYHFpiM6Ej1HTG · depth 2 · RUNNING until 2026-10-20T13:12:18Z (node --test test/m/affordances/*.test.mjs) · handled B4

## J1 · QUESTION

QUESTION (R62, R70 · ACT_HELP). My best reading, carried on with: the design's reads list for `affordances` (words-reads.json) now gives `does` words for six declared ops the requirements do not name: counselpacket and holdnoticeprepare (R70 names these two), and noticeprepare, noticepost, signeradd, versionnotice (not named anywhere). R62 says this module's keys are the reads list, so I hold all six under their own ops (`act.<op>.does`), beside R69's seven browser acts under `BROWSER_ACTS` (op-declarations is later in the order, so the seven names are held here). Consequence for BOB/T51-107: op-declarations' `ACT_HELP_ABSENT` must stop naming these six (counselpacket, holdnoticeprepare, noticepost, signeradd in `unexplained`; noticeprepare, versionnotice in `read`), or its R34 partition test (t36.test.mjs:298) goes red when this merges; and its partition must run over ops only, since the seven browser acts are in ACT_HELP and are no ops (R69). If you would rather hold only R70's two, say so and I drop the other four (and name them in the test's NOT_HELD_READS).

## J2 · REPORT

REPORT (T51-99, for BOB; none blocks this job).
1. op-declarations (T51-107), by CHANGE as B2 says: with the six ops held in ACT_HELP, four op-declarations tests go red until its ACT_HELP_ABSENT stops naming counselpacket, holdnoticeprepare, noticepost, signeradd (unexplained) and noticeprepare, versionnotice (read): t36.test.mjs R34, t45.test.mjs R34/R49, t43-era R47/R34, t50.test.mjs R75. Its partition must run over ops only: ACT_HELP now also holds R69's seven browser acts (`BROWSER_ACTS`, exported here), which are no ops. Its other 9 reds are as at the tranche tip.
2. Strings no member reads, left in source for the design stream (K3944): `CATALOGUE_DETAIL` (door.mjs: how to read the catalogue answer, names `target=<record id>`, `vocabularies.rung_ladder`, wire fields; read by the assistant pack) and the NO_TARGET refusal `detail` in facts.mjs ("pass target=<record id>"). door.test.mjs still asserts K899's "record, not bundle" on the first.
3. answer-envelope's `page-policy.test.mjs` imports `signpage.mjs` of control-plane: the one architecture failure of checks/architecture.mjs over the whole tree, not mine (rule 1, K3835).
4. Whole-tree words check: 0 lines name affordances.

## J3 · COMPLETE

COMPLETE (T51-99, affordances).
Entries applied: R67 `proceeding_kinds` and R68 `action_kind_labels` (new store route `affordancevocab` in this module's `affordancesOps`, asked by the door beside the kinds on both arms, handed to `vocabulariesFor(kinds, profile)`; a key the store does not answer is left out; test seam `deps.combine`); R69 the seven browser acts in ACT_HELP (`BROWSER_ACTS`); R70 and R62: counselpacket, holdnoticeprepare, noticeprepare, noticepost, signeradd, versionnotice held (B2/K4070); stale comments (civicos-ui/app.html) removed; t36 reds cleared; catalogue :473 and :679 and t45-backing:145 (effective_from) cleared; N1073: every hand-list of another module's ops/codes (40 findings) derived from owners' op maps, check tables and the grading tables.
Deferred: none. Dropped assertions (pins op-grades' own tests hold: test/m/op-grades/pins.test.mjs, t41.test.mjs): the JUSTIFICATION_REFUSALS code lists, T41_OPS membership; N364's signerregister/signerrevoke totality (membership has no op map to derive from).
Found in other modules: see REPORT (op-declarations).
Tests/checks: node --test test/m/affordances/: 280 pass, 0 fail. format 0 failures; architecture (affordances) 0 failures; coverage 54 of 54 ids; ownership 21 files, 0 failures; words check (affordances and whole tree) 0 lines naming affordances; setup-words build --check: rows match. Regenerations stale: none made.
Size (session_0184gxzpn1s2EDqr1qacRUZ3): test runs 14, module lines 2699

## J4 · REPORT

REPORT (re B3 · CHANGE K4073). Nothing in affordances' paths can name them. `unaccounted` (R12) is correct: it reports a gated op "unpublished" when it is in none of ACTS, CAPTURE_ACTS, PER_ITEM_ACTS or NON_ACTS, and NON_ACTS (like RUNGS and RUNG_ABSENT) is op-grades' table, read here by reference (R4, K1974); these are reads, so they are no ACTS rows, and adding a copy here would break R4's "no copy" rule. I checked on the merged tranche tip: none of the 14 is in NON_ACTS, RUNGS or RUNG_ABSENT. op-grades R48 covers three (holdsdue, templatebyhandle, rulefields); the other eleven (adminremovalsopen, approvedunsent, bundlehistory, checkpointsdue, clocksrunning, entityidonly, entitysimilar, heldat, projectinvitations, subjectsnamed, versioncompare) need an op-grades requirement and job (each with a "read: …" NON_ACTS reason), after which control-plane's totality goes green with no change here. Affordances' own tests derive their op sets from the owners' maps, so they need no list updated. Job stays COMPLETE; no change made.

## J5 · COMPLETE

COMPLETE (re B4 · CHANGE K4093). Merged tranche/T51; ACT_HELP re-taken at the design now on the tranche (2a64c5ae77): `actionholdrelease` (DEC-359, `act.actionholdrelease.does`) is held; t36.test.mjs :89 and :191 are green. Suite whole: 280 pass, 0 fail; words check 0 failures; coverage 54 of 54; format and architecture unchanged. Consequence for op-declarations: `actionholdrelease` is in its `unexplained` ACT_HELP_ABSENT group and must leave it (R34 partition), as for the six of J1.
Size (session_0184gxzpn1s2EDqr1qacRUZ3): test runs 18, module lines 2700

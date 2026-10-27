# Rebuild of T51's plan: changes, trace and checks (BOB #214, K3921)

Written with the rebuilt `build/plan/current.md` (not committed). Inputs read whole: `current.md` (as of `689eb5892c`), `audit-T51-commitments.md`, `next.md`, `rulings.md` K3800 to K3926, civicos-process `PROCESS-DESIGN.md` (P7, P8, P10, P19) and `PROCESS-MECHANICS.md` (§5.2, §5.7 (0), §5.10), the 37 L9 to L11 STARTs, the job records `entities.md` and `people.md`, DEC-334 to DEC-339, and the requirement lines the CHECKs cite. Tests were run per module on the tranche @ `689eb5892c` (read-only).

## (1) Changes made to `current.md`

1. Aim: the sweeps are no longer "T52's" (K3804 replaced by K3919, K3921); words rule and one pass named; "done, K3820" on the team pass; audit and `rebuild-T51-changes.md` referenced.
2. Sources: DEC-329 to DEC-339, U346 to U364, K3803 to K3926, P6 to P8, P10, P17, P19, mechanics §5.2, §5.7 (0), §5.10, the audit and `words-check/`.
3. Rule 1: merge order for R1 to R8; the next three splits (membership, basis-versions, publication); promotion's first stamp marked merged, the second made CR-5's (every "T52's stamp" mention removed).
4. Rule 2: screen jobs read the drawings of DEC-330 to DEC-339 items (was DEC-333).
5. Rule 3: "six splits" by copy (was three).
6. Rule 4: the opening act marked done (K3821, merges K3854 to K3917); rows for the three new splits made at R2's, R6's and R8's START.
7. Rule 5 rewritten to the tranche as it is: coverage; row census (second stamp CR-5; census imports after T51-126); legacy-ui's 8; cleared reds struck; still-red reds with test names; every other red (C80) from per-module runs, including reds not in K3820's list (notice-producers 18, interface-shell 2, screens-investigate 2) and the ones that are now green (scheduler, duties, queue-producers).
8. Rule 6: the K3811 pass marked done, past tense; the sweeps handed to (W).
9. Rule 9: N1214's image sentences named as wording only (T51-149).
10. Rule 10: DEC-329 to DEC-339 and U346 to U364 listed with what each changed; "U351: nothing more is owed from the design" struck; B330 pending named; A28 settled by R39 and interface-shell R98; BOB's "requirement lines to write" marked written (K3861 to K3869, K3897, K3898).
11. Rule 11 new: nothing waits; P19's three reasons and the `hard reason:` form.
12. New section "Sequence (rebuilt, K3921)": (W) the words (K3924 answer, check re-run, one HANDOFF batch, one mechanical pass, 1,463 test copies and 176 hand-lists fixed whatever the option), (R) re-run of L1 to L8 then words check zero, (L9), (L10), (L11), (CR), the close.
13. T51-15: row-census patterns and `gate.mjs`:342 moved to CR-5 (K3838); T51-36: model Sonnet as K3839 ruled.
14. New "### R. Re-run of closed layers" with R1 to R8: CR-1 (civil-time), CR-2 (test-support), CR-3 (file-scanner), CR-4 (membership), CR-7 (lines, events), CR-8 (inquiry-grammar), CR-9 (basis-versions), CR-10 (run-productions in R6, reevaluation in R7), CR-11 (citation) and CR-13's people part (R5) re-filed with their ids; CR-6 (stale comments in provenance-routes and ai-runs) goes to the pass (W), no job; CR-13's L11 parts moved into T51-132, T51-102 and T51-116.
15. New R entries: T51-144 bundler (fleet-member/wrangler digests agree), T51-145 membership split module, T51-146 publication split module, T51-147 publication delegation, T51-148 basis-versions split module, T51-149 agent-runner image sentences by key (N1214), T51-150 case-disclosures photo date (DEC-265), T51-151 case-checker (N1222), T51-152 case-account (N1223).
16. CR-4 (membership) gains the P6 delegation (C57) and its read is now ready before L11 (audit risk 7); CR-9 gains DEC-337's three refusal keys (C48), the standard leg (C137) and the delegation after the new module.
17. L9: T51-154 filings (N1228). L10: T51-153 scheduler (C80; no red remains on the tree, the entry re-runs and fixes), T51-155 following (N1228).
18. T51-99: its two ACT_HELP reds named (t36.test.mjs:82, :180), N1073 hand-lists; T51-102: R43 reads CR-1's clock (CR-13's part), 12-hour `time.clock`; T51-132: R25 reads CR-1's clock and its 18 date-order tests (found now, unplaced before) are listed by file and line; N889's rest named as pending B330.
19. T51-107: browser-act totality settled (op-declarations R76), CR-4's read added, `instancegroupseed` stays in `UNATTENDED_BY_DECISION` (K3868), its 8 reds listed. T51-112: print is `cs.print()` with beforeprint inline styles and no stylesheet rule (K3861, K3866), icons from the merged design, N1028's tokens already generated, 4 reds listed.
20. T51-113 rewritten against R90 to R101 with the CHECK findings for A5, A6, A9, A10, A13, A11, C1/C3, A28, A79 (file:line) and its 2 reds; T51-115: recording-list numbering check (B-36); T51-116 rewritten per DEC-336 (1), (7), (8), DEC-338, K3868: no `instancegroupseed`, `seed.recorded`/`seed.unrecorded`, removals block from CR-4, one's own key has no Withdraw, glossary card, C1 exists; T51-117 rewritten (A28 via R39/R98 `cs.download verify`, A29 SERVED by R31 with a BOB: open on the document-page list).
21. T51-118: U353 honesty counts, DEC-335/336 keys, nothing preselected, B6, N1088's remaining Home readings; T51-119: DEC-336 (2), (5), (6), DEC-337, DEC-338 (2), U354, DEC-339, the C6 namespace CHECK, network-notices R22 settled; T51-120: DEC-336 (3), DEC-338 (1), `people.nearmatch.*`, its 2 unplaced reds; T51-121: "Named only", grades, falsifier override, print by `cs.print()`, DEC-336 (4), DEC-338 (3) to (5); T51-122: dash-action keys; T51-123: routes CR-4's read.
22. T51-126: row-census patterns now CR-5's, an accepted red by name between T51-126 and CR-5. T51-128: K3868, K3892, K3893, K3819, DEC-336 (1), DEC-338 (U361) keys: foreign stop spares retired parts, short name recorded by the installer only in a run that generated `ADMIN_TOKEN`, `account-logs.read` added, 24 `installer.invite.*`. T51-131: R17 `GROUP_SENSE` row for "Neighborhood and issue groups".
23. Completion round reduced to CR-5 (promotion: hand-lists, row-census patterns, second stamp; last) and CR-12 (instance-setup precedes store-door in `modules.json`, so it stays); the "Pending Bob (K3915, question 2)" line removed (K3919 replaced it).
24. Merge orders paragraph extended for R, L9, L10 and CR. Count recomputed from the file (88 layered entries, R 20 lines / 19 ids / 21 jobs, CR 2; 111 jobs; Haiku 51, Sonnet 60). Measure first: M-T51-1 updated, M-T51-5 added (words check zero).
25. BOB's acts rewritten: (W) now (K3924 answer, rule, check re-run, HANDOFF batch, pass, dry-run certification of §5.10, §5.7 (0), §8.6, N1074 and N898), before R1's START, K3815 re-check done, rule 7 list re-grepped (20 requirement files), the L11-START path move, images recorded (T51-144), the cut (container parts still `ghcr.io`), the live walk with a real photograph captured and read (C123, N853c) and the recording numbering.
26. Left out rewritten: only rows with one of the three reasons, each in the `hard reason: …` form; N1074, N898, N1214, N1088, N1061, N1070, N1071, N1073, N1211, N1216, N1245 to N1253, the bare sweeps and sweep clauses, N1151, N1160, N1201 and the "no reader text" row are no longer Left out (placed, applied, or not deferral); the B330 items state where each lands.

## (2) Trace: commitments C1 to C138 (audit state, then where it now lives)

Where: an entry id, `BOB's act` (section "BOB's acts"), `Left out` (with its reason), `Seq` (Sequence step), `rule n`, or DONE (with the ruling). Every commitment the audit lists as PARTIAL, MISSING, DEFERRED or PLANNED has at least one such place.

| C | audit | where it now lives |
|---|---|---|
| C1 | PLANNED | BOB's act (live walk); T51-131 |
| C2 | PLANNED | T51-131 (R6 pairs); BOB's act (live walk, every screen at 1280 and 390 px) |
| C3 | PLANNED | BOB's acts (release cut, deploy approved by Bob, fix rounds); Seq 5 |
| C4 | DONE | DONE (no walk before the release) |
| C5 | DONE | DONE; rule 9 |
| C6 | PARTIAL | rule 11; Seq; N1246 to CR-5; N1247 to (W); N1251 to CR-8, CR-9; the P6 splits to T51-145, T51-146, T51-148 |
| C7 | DONE | DONE (K3808, K3817) |
| C8 | DONE | DONE (K3808, K3817) |
| C9 | DONE | DONE (T51-64, K3903) |
| C10 | DONE | DONE (T51-9, K3832) |
| C11 | DONE | DONE (T51-5, K3832) |
| C12 | PLANNED | BOB's act (each image recorded); T51-144 |
| C13 | PLANNED | BOB's act (the release cut, including `release/file-scanner/container/*.json`) |
| C14 | PLANNED | T51-128 |
| C15 | PLANNED | T51-128 (N1254) |
| C16 | PARTIAL | T51-128 (`account-logs.read` in `SCOPES`; Bob's act done, K3819) |
| C17 | DONE | DONE (K3820) |
| C18 | DONE | DONE (K3882, K3887, K3914) |
| C19 | DEFERRED | Left out: hard reason: Bob's (N1220, K3717) |
| C20 | PARTIAL | Seq (W): the 1,463 test copies; the L9 to L11 STARTs convert the rest (K3810) |
| C21 | PLANNED | T51-139 (library re-take); Seq (W) |
| C22 | DONE | DONE (T51-9, K3832; K3820) |
| C23 | PLANNED | T51-106 |
| C24 | PLANNED | M-T51-4; T51-128; T51-131 (R17 `GROUP_SENSE` row) |
| C25 | MISSING | Seq (W) and (R); R, L9 to L11 STARTs; no Left-out row for wording |
| C26 | PARTIAL | BOB's act (W) now (the check is committed and wired into `run.mjs`, `de5a589`; re-run and findings shown to Bob) |
| C27 | MISSING | Seq (W) (c) the one HANDOFF batch, (d) the pass |
| C28 | PLANNED | Seq 2 (L9 does not start until the check reads zero); M-T51-5 |
| C29 | PARTIAL | Seq (W) (c) batch; builder diagnostics of K3852 are what the check judges |
| C30 | MISSING | text DONE (civicos-process `314d84f`: P7, P8, §5.2, §5.7 (0), §5.10, K3923); dry-run certification: BOB's act (W) now (5) |
| C31 | MISSING | text DONE (`314d84f`, `de5a589`: §5.7 (0), §6 (4), §7, §8.4 arm); dry-run certification: BOB's act (W) now (5) |
| C32 | PLANNED | the R section; Completion round (CR-5, CR-12) |
| C33 | PARTIAL | rule 10 (DEC-329 to DEC-339); Left out (B330 items, Bob's: the design stream's DEC pending); BOB's act (B330) |
| C34 | PLANNED | T51-114, T51-105 |
| C35 | PARTIAL | T51-36 and T51-39 merged; T51-120 |
| C36 | PLANNED | T51-113, T51-118 |
| C37 | PLANNED | T51-123, T51-89, T51-99, T51-122 |
| C38 | PLANNED | T51-115, T51-122 |
| C39 | PLANNED | T51-128 with T51-127 stage 2 |
| C40 | PLANNED | T51-102 |
| C41 | PLANNED | T51-104, T51-106 |
| C42 | PLANNED | T51-128 (R78), T51-116 (R58) |
| C43 | PLANNED | T51-119 (C6, A47), T51-116 |
| C44 | PARTIAL | T51-57 merged; T51-101, T51-113, T51-132 |
| C45 | DONE | DONE (K3854, K3865, K3872) |
| C46 | PLANNED | T51-102, T51-112 (icons), T51-113, T51-116 to T51-122, T51-132 |
| C47 | PLANNED | T51-116, T51-119, T51-120, T51-121, T51-118, T51-128 (entries now follow DEC-336 and K3868) |
| C48 | PLANNED | CR-9 (R6) |
| C49 | PLANNED | T51-119, T51-120, T51-121, T51-128 |
| C50 | DONE | DONE (K3917, K3920) |
| C51 | PLANNED | T51-118, T51-119 |
| C52 | DONE | DONE (K3821, K3841, K3850, K3893, K3865, K3872, K3886, K3894) |
| C53 | DONE | DONE (K3821, K3841, K3850, K3893, K3865, K3872, K3886, K3894) |
| C54 | DONE | DONE (K3821, K3841, K3850, K3893, K3865, K3872, K3886, K3894) |
| C55 | DONE | DONE (K3821, K3841, K3850, K3893, K3865, K3872, K3886, K3894) |
| C56 | PLANNED | T51-127, T51-128 |
| C57 | DEFERRED | T51-145 and CR-4 (membership); T51-146 and T51-147 (publication) |
| C58 | PLANNED | T51-148 and CR-9 |
| C59 | PLANNED | M-T51-1; L11 STARTs |
| C60 | PLANNED | T51-126 |
| C61 | PARTIAL | CR-5 (second stamp); rule 5.2 |
| C62 | DONE | DONE (K3830) |
| C63 | DONE | DONE (K3797) |
| C64 | DONE | DONE (T51-83, K3918) |
| C65 | DONE | DONE (T51-82, K3914) |
| C66 | PARTIAL | T51-86 confirms; Seq (W) |
| C67 | PARTIAL | T51-94 |
| C68 | PARTIAL | T51-101 |
| C69 | PLANNED | T51-90 |
| C70 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C71 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C72 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C73 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C74 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C75 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C76 | DONE | DONE (T51-64, -59, -11, -37, -50, -70, -80) |
| C77 | PLANNED | T51-131 |
| C78 | PARTIAL | T51-106 (T51-9 merged) |
| C79 | PARTIAL | each module's merge; rule 5.1; the held ids are Left out (Bob's, K3718 (2)) |
| C80 | PARTIAL | rule 5.6; T51-132 (18 tests), T51-153 (scheduler), T51-94, T51-107 (8), T51-99 (2), T51-113 (2), T51-120 (2) |
| C81 | PARTIAL | T51-112, T51-116, T51-118, T51-119, T51-121, T51-122, T51-137, T51-138, T51-107, T51-99; T51-133 merged |
| C82 | PLANNED | T51-99, T51-107, T51-137 |
| C83 | DEFERRED | Left out: hard reason: Bob's (N1220, K3718 (2)) |
| C84 | DONE | DONE (K3836 to K3920) |
| C85 | PLANNED | T51-126 |
| C86 | PARTIAL | BOB's act (path move at L11's START); T51-123 |
| C87 | PLANNED | T51-125 |
| C88 | DONE | DONE (T51-5, K3832) |
| C89 | DEFERRED | CR-5 (patterns, `gate.mjs`:342) |
| C90 | PLANNED | BOB's act (after T51-126; `.claude/settings.json`:15 is Bob's own edit) |
| C91 | PARTIAL | stale comments by entry: T51-99, T51-104, T51-106, T51-116, T51-123, T51-125, CR-3, CR-4 (:444); CR-6's pair to (W); `gate.mjs`:342 to CR-5 |
| C92 | PARTIAL | BOB's act (rule 7 list, 20 files re-grepped) |
| C93 | PLANNED | BOB's act (the `civicos` Worker removal) |
| C94 | PLANNED | T51-131 |
| C95 | DONE | DONE (K3807) |
| C96 | PLANNED | BOB's act (live walk, census checklist); M-T51-3 |
| C97 | DONE | DONE (K3807); Left out lists them |
| C98 | DEFERRED | Left out: hard reason: Bob's (N1220) |
| C99 | PLANNED | T51-113 (CHECK of A5, A6, A9, A10, A13, A11, C1, C3, file:line), T51-112 |
| C100 | PLANNED | T51-116; CR-4 (R2) before it |
| C101 | PLANNED | T51-117 (A28 via R39/R98; A29 BOB: open) |
| C102 | PLANNED | T51-118 (B6 added) |
| C103 | PLANNED | T51-119 |
| C104 | PLANNED | T51-120 |
| C105 | PLANNED | T51-121 |
| C106 | PLANNED | T51-122 |
| C107 | PLANNED | T51-107 (totality settled by R76), T51-123 |
| C108 | PLANNED | T51-112 |
| C109 | PLANNED | M-T51-3 |
| C110 | PLANNED | T51-139 |
| C111 | PLANNED | T51-109; BOB's act (path move) |
| C112 | PLANNED | T51-123; BOB's act (walk) |
| C113 | PLANNED | T51-106, T51-123, T51-128 |
| C114 | PLANNED | T51-99 |
| C115 | PLANNED | T51-143, T51-125, T51-99; CR-12; CR-5 |
| C116 | PLANNED | T51-113 |
| C117 | PLANNED | T51-85 |
| C118 | PLANNED | T51-87, T51-89, T51-108, T51-137, T51-138; T51-133 merged |
| C119 | PLANNED | T51-132; N889's rest: Left out (Bob's, B330) |
| C120 | PLANNED | T51-119, T51-120, T51-122, T51-131 |
| C121 | MISSING | Left out: N1184, hard reason: Bob's (the design stream's DEC pending, B330); BOB's act (B330) |
| C122 | PLANNED | T51-131 (R17 row), T51-115 (numbering), CR-7 (events vocabularies); BOB's act (walk) |
| C123 | MISSING | BOB's act (walk: a real photograph captured and read); Left out N853c (a measurement, taken live) |
| C124 | DONE | DONE (rulings-active §4) |
| C125 | PARTIAL | T51-119 (dash-project, one-based pages), T51-120, T51-122 (dash-action), T51-131 (EXCEPTED), T51-132 (B-17), CR-8, CR-9 (J-3 residue); the stale "neither is done" line replaced in BOB's acts |
| C126 | DONE | DONE (K3816); done again at this rebuild (Left out) |
| C127 | DEFERRED | Left out rewritten; N1214 T51-149; N889 rest, N1046, N858, N880, N933, DEC-265 per B330 (Bob's) and T51-150; N1088 T51-118; N1074, N898 BOB's act (W) now |
| C128 | DEFERRED | Left out (Bob's, a measurement, outside the product), each in the `hard reason:` form |
| C129 | PLANNED | R section; Completion round |
| C130 | PLANNED | M-T51-2 |
| C131 | PLANNED | Seq 5; BOB's acts |
| C132 | DONE | DONE (K3869, K3897); entries now follow it |
| C133 | DONE | DONE |
| C134 | DONE | DONE |
| C135 | DONE | DONE |
| C136 | DONE | DONE |
| C137 | PARTIAL | CR-8, CR-9 (R6, before L11) |
| C138 | PLANNED | T51-127, T51-128 |

Traced: 138 commitments; the 100 the audit lists as PLANNED, PARTIAL, MISSING or DEFERRED each have a place above.

## (3) `next.md`: every entry, its reason now and where it goes

`next.md` is unchanged (BOB edits it). "Placed" = an entry or act in `current.md`; the mechanical pass is (W).

| id | reason in `next.md` | new placement or kept reason |
|---|---|---|
| N1253 | P10 (found at L6's merge) | T51-148 (new module) and CR-9 (R6) |
| N1252 | no behaviour (P19), 1 of 3 | (W) the pass (CR-6, stale comments); no job |
| N1251 | P10 (inquiry-grammar had no job) | CR-8 and CR-9 (R6) |
| N1184 | the design stream's (B330) | hard reason: Bob's (the design stream's DEC pending, B330); lands at the L11 STARTs, T51-113, T51-131 |
| N751 | a measurement | hard reason: a measurement: no issuer policy beyond the 74 read exists to measure on |
| N794 | `legacy-ui` touched only where Bob names it | T51-126 (L11) |
| N824 | Bob's D42 and a deployment | hard reason: Bob's: "D42 - email: A", after upload is in use |
| N829 | a measurement (matters written by people) | hard reason: outside the product: the test set's matters do not exist; who writes them is Bob's |
| N842 | a dependency not yet built (interactive AI paths) | hard reason: Bob's (N1220, K3717) |
| N853c | a measurement | hard reason: a measurement: taken live in BOB's walk (a real photograph captured and read) |
| N858 | a dependency not yet built (ACTIONS-DESIGN hand-off) | hard reason: Bob's (the design stream's DEC pending, B330; templates also his as reviewer); lands at the L9 STARTs and R8 |
| N865 | `legacy-ui` | T51-126 (L11) |
| N880 | a dependency not yet built (hand-off) | hard reason: Bob's (the design stream's DEC pending, B330); lands at the L9 STARTs and R8 |
| N889 | a dependency not yet built (design keys) | narrow part T51-132; the rest hard reason: Bob's (the design stream's DEC pending, B330), landing in T51-132 |
| N898 | Bob's priority under the meter | BOB's act (W) now: process tooling, certified on the dry run |
| N923 | Bob's (stewards' address) | hard reason: Bob's (K2799) |
| N1002 | Bob's (UX S2 to S4) | T51-125, T51-126, BOB's act (the Worker removal) |
| N1028 | Bob's (S20) | tokens done (`civicsmith.css`); dashboards: hard reason: Bob's (S20); `dash-action`, `dash-project`: T51-119, T51-122 |
| N1046 | a dependency not yet built | hard reason: Bob's (the design stream's DEC pending, B330); lands in filing-templates (L9), T51-107, T51-123 |
| N1057 | `legacy-ui` | T51-126 |
| N1061 | no behaviour (P19), 2 of 3 | CR-3 (R1) |
| N1068 | no behaviour (P19) | (W) the pass; a module needing a judgment gets an R entry |
| N1070 | Bob's priority under the meter | CR-9, CR-10 (R6, R7) |
| N1071 | no behaviour (P19) | CR-11 (R6) |
| N1073 | a dependency not yet built (N1074); no behaviour | CR-5; T51-99 and T51-125 STARTs; (W) hand-lists; N1074 is BOB's now |
| N1074 | Bob's priority under the meter | BOB's act (W) now |
| N1075 | keys owed first; no behaviour | (W) batch and pass |
| N1088 | Bob's priority; no provider read named | T51-118 (BOB names the reads at the fold; a missing provider read is an R entry) |
| N1094 | Bob's priority (queue, acquisition) | applied in T50 except the translation part: hard reason: Bob's (K3190) |
| N1105 | Bob's (K3347) | hard reason: Bob's (K3347) |
| N1108 | DEC-253 reaches `main` with PR #39 | affordances, standards applied in T50; events' vocabularies CR-7 (R5) |
| N1110 | the directory is not built; rule awaits Bob | hard reason: Bob's (the rule awaits his approval) and outside the product (the directory is not built) |
| N1116 | DEC-260 not delivered (P10) | (W) batch and pass |
| N1151 | Bob's dashboard act | Bob's act done (K3819); T51-128 |
| N1159 | Bob's (K3470) | hard reason: Bob's (K2799, K3470) |
| N1160 | waits on words.json pass | done (K3811, K3820) |
| N1198 | a dependency not yet built (remote proof) | hard reason: Bob's (K3717, N1220) |
| N1199 | a dependency not yet built (the proof) | hard reason: Bob's (K3717, N1220) |
| N1200 | their layers not in T50 | hard reason: Bob's (K3717: serves only a run fenced to its project, the assistant's) |
| N1201 | none now | applied (T50-54) |
| N1202 | the order (P10) | T51-6, T51-7 merged |
| N1205 | one job per module (P8) | T51-45, T51-65 merged |
| N1206 | the order (P10) | (W) pass (the keys exist, DEC-305) |
| N1207 | a dependency not yet built | T51-30 merged, T51-120 |
| N1208 | no T50 job (P10) | T51-94 (L9) |
| N1209 | the order (P10) | T51-12 merged, T51-102 |
| N1210 | the order (P10) | T51-5 merged |
| N1211 | no behaviour (P19), 1 of 3 | T51-143, T51-125, T51-99 STARTs; CR-12 |
| N1212 | first entry of L5 | T51-29, T51-42 merged |
| N1213 | the order (P10) | (W) pass (DEC-309, DEC-312 keys exist); events' cache-stale and retrieval's frontier notes in the HANDOFF batch |
| N1214 | no behaviour (P19), 1 of 3 (T53) | T51-149 (R6) |
| N1215 | a journey gap: T51 | T51-53 merged; standard half CR-9 |
| N1216 | test hygiene (P19), by T52 | CR-8 and CR-9 (R6) |
| N1217 | no behaviour (P19), by T52 | (W) pass (keys from the batch) |
| N1218 | a module's size (P6) | T51-45, T51-65 merged |
| N1219 | a dependency not yet built | hard reason: Bob's (K3717, N1220) |
| N1220 | Bob's | hard reason: Bob's (P17): the AI-DESIGN lane's outcome |
| N1221 | no case-authoring job in T50 | T51-83 merged |
| N1222 | a requirement not yet written | T51-151 (R8; BOB writes R27 first) |
| N1223 | no case-import or case-account job | (W) pass for case-import and public-read; T51-152 (R8) for case-account |
| N1224 | no case-inputs job in T50 | T51-82 merged |
| N1225 | no T50 job for these modules | T51-86, T51-94, T51-101 |
| N1226 | no people job in T50 | T51-38 merged, T51-120 |
| N1227 | no action-holds job in T50 | T51-90 |
| N1228 | the keys first (a dependency not yet built) | (W) batch; T51-154 (filings), T51-155 (following) |
| N1229 | L8 closed in T50 | T51-84 merged, T51-121 |
| N1230 | L2 closed | T51-12 merged |
| N1231 | T51 when the keys land | T51-102 |
| N1232 | T51 | T51-113 |
| N1233 | keys owed | T51-114, T51-105, T51-36 and T51-39 merged, T51-120 |
| N1234 | keys owed | T51-123, T51-89, T51-122 |
| N1235 | L3 closed | T51-21 merged, T51-117 |
| N1236 | T51 | T51-99, T51-30 merged, T51-113, T51-120 |
| N1237 | T51 | T51-115, T51-122 |
| N1238 | T51 | T51-104, T51-42 merged, T51-106 |
| N1239 | T51 | T51-106, T51-128 |
| N1240 | T51 | T51-127, T51-128 |
| N1241 | L1 closed | T51-9 merged |
| N1242 | a release cut and a registry account | T51-5, T51-9, T51-64 merged; T51-128; BOB's act (the cut) |
| N1243 | accepted red by name until the T51 job | T51-64, T51-59, T51-11 merged |
| N1244 | accepted red by name until the T51 job | T51-37, T51-70, T51-50 merged |
| N1245 | T52 (no behaviour) | CR-2 (R1) |
| N1246 | T52 with the stamp (the order) | CR-5 |
| N1247 | the order; T52 | (W) pass (the keys exist, DEC-335) |
| N1248 | the order; T52 | CR-4 (R2), T51-116 |
| N1249 | the order; T52 | CR-1 (R1), T51-132, T51-102 |
| N1250 | the order; T52 | CR-1, CR-7, CR-13 (R1, R5) |

## (4) CHECK results (file:line)

- **CR-12.** `build/modules.json`, layer 11 order: `... translations, instance-setup, op-capabilities, op-declarations, admission, answer-envelope, store-door, ...`: instance-setup precedes store-door, so the delegates cannot go in instance-setup's L11 job (store-door and plane must call `translations` first). CR-12 stays in the completion round.
- **Decision 3, duties and scheduler reds.** `build/jobs/T51/entities.md` (J1: "29 further consumer-test reds (notice-producers, op-declarations, escalation, scheduler, queue-producers, duties date/word tests) ... red identically on tranche/T51 (31 there)") and `build/jobs/T51/people.md` (J3: "2599 tests, 32 fail ... notice-producers, op-declarations, affordances, case-authoring, retrieval/words, screens-investigate/{explore,person}") name modules, not tests. Run on `689eb5892c`: scheduler 135 pass 0 fail (`test/m/scheduler`), duties 74/0, queue-producers 83/0 (cleared since by T51-57, T51-37 and K3820's pass); escalation 1 red (`structure.test.mjs`:265, T51-94); notice-producers 18 red (`accounts.test.mjs`:44, :73, :97, :123, :226; `duties.test.mjs`:352, :392; `files.test.mjs`:323; `investigation.test.mjs`:46, :75, :154, :279, :303; `policy.test.mjs`:81; `waits.test.mjs`:47, :120; `watched.test.mjs`:43; `words.test.mjs`:47; all copy the date "9 October" where `date.daymonth` is now "October 9", DEC-333; no entry had them; now T51-132); op-declarations 8 (`t33.test.mjs`:284, `t34`:149, `t37`:180, `t38`:76, `t45`:219, `t46`:301, `t47`:289, `t48`:184; T51-107); affordances 2 (`t36.test.mjs`:82, :180; T51-99); interface-shell 2 (`rows.test.mjs`:53, `words.test.mjs`:90; not placed before, now T51-113); screens-investigate 2 (`explore.test.mjs`:159, `person.test.mjs`:89; not placed before, now T51-120); interface-assets 4 (`assets.test.mjs`:142, :294, :406, :436), screens-settings 2 (`contract.test.mjs`:23, :68), screens-daily 2 (`browse.test.mjs`:24, `contract.test.mjs`:45), screens-inquiry 19, screens-publish 12, screens-action 1 (`contract.test.mjs`:34), op-grades 2 (`t48.test.mjs`:219, `t50.test.mjs`:106), site 1 (placed, T51-138); action-holds 2 (`hidden.test.mjs`:45, `readers.test.mjs`:36; T51-90); action-producers 1 (`t46.test.mjs`:177; T51-101); plane and control-plane 0. Scheduler therefore has no red to fix; T51-153 is an entry that re-runs and fixes what remains after L9 and the pass, and takes the words-check findings (2 test copies, 1 hand-list).
- **C99 A5.** The verdict line exists on `group` only: `bio-plane/src/screens-settings/group.mjs`:79–83 (`domain.verdict.*`, administrators). The frame draws none; interface-shell R96 (`build/requirements/interface-shell.md`:223) says the frame holds no verdict. Job: T51-113 draws nothing; T51-116 keeps it on `group`. Settled.
- **C99 A6.** Today `browser.mjs`:2025 `TODO = count("OBLIGATION")`, :2027 `QUEUE_COUNTS` (the three kinds), :978–979 the masthead's `shell.queue.waiting`; the rail (:1028–1029) draws no count; the design draws a `count` slot on Queue alone and a width grip, no collapse (`docs/development/ux-substrate/screens/mock-shell.js`:240). R96 settles: the rail's Queue carries the sum of the three kinds, no collapse. Job: T51-113.
- **C99 A9.** No `/version` call in `interface-shell/browser.mjs` or `index.mjs` (grep); the plane serves it, `bio-plane/src/control-plane/index.mjs`:685; the design draws the band, `mock-shell.js`:222–223; the cadence five minutes is the old page's (`civicos-ui/app.html`:967–977), R92 (`interface-shell.md`:219) states it. Job builds it (T51-113); the Reload button's label is a word the design lacks (REPORT).
- **C99 A10.** Nothing re-reads a list: the only timers are `browser.mjs`:331 (retry), :424 (`cs.later`), and the run polls `screens-action/plan.mjs`:262, `screens-inquiry/assistant.mjs`:195. R93 (`interface-shell.md`:220) states the `refresh: true` marker, 45 seconds, `list.fresh`. Adopters named: `finder` and `queue` (T51-118). The old page also refreshed a review list and the registry (`registry.json`, 73 screens) has no review-list screen: `BOB: open` (`held`, T51-117, is the candidate).
- **C99 C1, C3.** The signer exists: `browser.mjs`:1486 `wrapSeed`, :1524 `register` (keeps a non-extractable key on the device or hands out `BIOKEY1.`, :1540 `bio-signing-key.txt`), :1545 `SIGNER`, :1547 `held`, :1554 `publicLine`, :1561 `forget`, :1565 `sign` (namespace per statement; key-file loading in its dialog); `screens-settings/account.mjs`:118 sends the public line to `signerregisterown`. R97 (`interface-shell.md`:224) adds `register({keep, passphrase, defer})`. Job: T51-113 and T51-116. The release-key half is dropped (K3807).
- **C101 A28.** Nothing hashes in `screens-intake/open-file.mjs` (reads :9–19); `interface-shell/browser.mjs`:374 `cs.download` has no `verify`. screens-intake R39 (`screens-intake.md`:104) and interface-shell R98 (`interface-shell.md`:231) settle it: `cs.download` with `verify` the capture's digest, `screen.open-file.digest.checked`, `refusal.DIGEST_MISMATCH` (`.unheld`). Job: T51-113 and T51-117.
- **C101 A29.** SERVED by R31: `screens-intake/capture.mjs`:179–195 draws `capture.unfinished` with the count from `opencaptures` (`acquisition/index.mjs`:1564–1584, `outstanding` a count). The document-page list of what a captured page still lacks is drawn by neither the design (`mock-screens.js`:973 draws the count) nor any requirement; the snapshot manifest holds `outstanding` (`acquisition/index.mjs`:1418). `BOB: open` (the design's to say; if drawn, the provider is acquisition in R3 and `document` in T51-119).
- **C103 C6.** The shell signer takes a namespace per statement (`browser.mjs`:1565); `screens-publish/docket.mjs`:89 already passes `bio-docket` that way; the namespace constant is `bio-plane/src/sshsig.mjs`:355 `NS_NOTICE = "bio-working-on"`, the statement `noticeStatement` :384–391 and `network-notices/index.mjs`:357 answers it (`statement`); the old page signed at `bio-plane/src/sign-release.html`:572–587. So nothing is missing in the shell: T51-119 passes the namespace. Settled.
- **C107 totality tests and a browser act.** Settled by op-declarations R76 (`build/requirements/op-declarations.md`:299): the registry's `owed` acts are an op, a `BROWSER_ACTS` row with the matching `registry` string, or still owed with a ruling; the siblings of `t45.test.mjs`:219 ("served whole by the tables") gain the class. `BROWSER_ACTS` is not in the code yet (grep). Job: T51-107.
- **C122.** `screens-wizards/guide.mjs`:343 draws `recording.pair` "{i}. {screen}: {act}" inside `<ul class="mk-list">`: whether the number doubles needs a render; placed in T51-115 and BOB's walk. The installer page's "Neighborhood and issue groups" (`newgroup/public/newgroup/index.html`:54) is placed in T51-131 (R17 `GROUP_SENSE` row).
- **network-notices R22.** `build/requirements/network-notices.md`:143 answers "the next `monthly` date, and the lapse date when one is running": T51-119 needs no provider change (its "BOB: check" is settled).
- **N1028 tokens.** `kind-money`, `kind-part`, `kind-mention` are in `docs/development/ux-substrate/visual-language/civicsmith.css`:55–57 and generated into `bio-plane/src/interface-assets/index.mjs`:11: the token half of N1028 is done.
- **Bundler digests (C12).** Four digest sites: `agent-runner/fleet-member.json`:17 and `agent-runner/wrangler.jsonc`:29; `file-scanner/fleet-member.json`:27, :56 and `file-scanner/wrangler.jsonc`:41, :47. No test compares the pairs: T51-144.
- **N1214.** `agent-runner/src/signin.mjs`:84 `WORDS` is inline English in an image that imports no word table: reading by key needs the image to carry the rows, a judgment, so T51-149 (R6) rather than the pass.
- **DEC-265 photo date.** `bio-plane/src/case-disclosures/index.mjs`:581 `photosOf` answers no date; the key `screen.ceremony.photo.facts.dated` exists (DEC-265 (2)). Which date the record holds is open: T51-150.
- **Process repository state.** civicos-process `HEAD ee5ec8e`: `314d84f` (P7, P8, §5.2, §5.7 (0), §5.10, §8.4, §8.6) and `de5a589` (the words check wired into `run.mjs`, the `next.md` hard-reason arm) are committed, which the audit (C26, C30, C31) did not see; `dryrun/RUNS.md` has no run for them.

## (5) Not placed, or placed with a doubt

- **Nothing is unplaced.** Two items stay `BOB: open` inside entries (A10's review-list adopter, T51-113; A29's document-page list, T51-117); each has a place.
- **Doubt, decision 7.** DEC-334 to DEC-339 each say "why it is Bob's: it is not (P17)" for design details. Calling a pending design DEC "hard reason: Bob's" is the form the decision gave; read strictly it is P19's third reason (something outside the product that does not yet exist: the drawing and words), not the first. The Left-out table uses the decision's wording.
- **Doubt, decision 1.** CR-6's stale comments go to the mechanical pass; P7 requires a change "needing no judgment", and restating a comment needs a short read. If the pass worker marks them uncertain they become a line of an R job (provenance-routes in R3, ai-runs in R6).
- **Size, audit risk 10.** T51-131 (journey-check) remains one large Sonnet job, last in L11; size is no reason to defer. Its START measures; BOB splits it by copy per journey if it passes ~4,000 lines.
- **Sequence dependency.** (W) depends on Bob's answer to K3924 (A, B or C): the plan names every step but the pass cannot start until he answers.
- **STARTs not edited** (not my files): `starts-T51/screens-settings.txt` still says R56's block waits for N1248 and `membership.txt`, `publication.txt`, `basis-versions.txt`, `installer.txt` predate the R-entries; BOB rewrites them at each START.

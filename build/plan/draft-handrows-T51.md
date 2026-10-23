# Hand rows of the declared ops, T51 (draft for BOB)

## Status

Computed on `origin/tranche/T51` at `0684727682293258c96cb40da36af9e5c8ff3ae4`. The script `/tmp/claude-0/-home-user-bio/a5941d3d-1923-510b-b83b-b2e946c1aa62/scratchpad/handrows.mjs` (rerun: `git -C /home/user/bio worktree add --detach <wt> origin/tranche/T51 && (cd <wt>/bio-plane && npm ci --ignore-scripts --no-audit --no-fund) && node /tmp/claude-0/-home-user-bio/a5941d3d-1923-510b-b83b-b2e946c1aa62/scratchpad/handrows.mjs <wt> > out.json`; `/tmp/claude-0/-home-user-bio/a5941d3d-1923-510b-b83b-b2e946c1aa62/scratchpad/mkmd.mjs` turns the JSON into this table) collects every module's `DECLARED_OPS` with test-support's `declaredOpsOf` (365 ops, 0 declared twice), then finds each op's hand rows by text in `op-declarations/*.mjs` (D/), `op-grades/*.mjs` (G/) and `control-plane/owner-ops.mjs` (C/), and compares the declaration with the hand tables as built (classes, machineClasses, mutating, stamps, needs; weight and description as R50 does, a word key resolved). Result: 364 of 365 have a hand row, 1 none, **5 disagree** (below); 31 also hold a `MACHINE_REFUSALS` row, which is not declarable (R49) and stays. Line numbers are the op's name as a key or a quoted list entry outside comments, so a list row (e.g. `ACTION_ACTIONS`) counts; the table is the top-level const it sits in. Nothing in the repo was changed.

## Disagreements (these refuse `registerDeclaredOps` at the plane, R81 / R50 (b))

- `accountusesset` (ai-accounts): description differs (hand NON_ACTS).
- `caseratify` (ratification): description differs (hand NON_ACTS).
- `groupdescriptiondraft` (store-door): weight hand caller-owned vs reasoned.
- `securitymap` (credentials): weight hand caller-owned vs read; description differs (hand NON_ACTS).
- `sweeps` (link-sweep): weight hand read vs reversible.

## Declared ops, their hand rows, disagreement

| op | owner | hand rows (file:line table) | disagreement |
|---|---|---|---|
| accountreferenceremove | ai-accounts | D/t48.mjs:72,74 T48_FAMILIES; G/marks.mjs:42 ROWS; G/t33.mjs:145 T33_RUNG_ABSENT; G/t33.mjs:340 T33_NON_ACTS | - |
| accountreferenceset | ai-accounts | D/t47.mjs:59 REAUTH_ACTS; D/t48.mjs:72,74 T48_FAMILIES; G/marks.mjs:43 ROWS; G/t33.mjs:144 T33_RUNG_ABSENT; G/t33.mjs:339 T33_NON_ACTS | - |
| accountusesset | ai-accounts | D/t48.mjs:80 T48_FAMILIES; G/marks.mjs:44 ROWS; G/t41.mjs:71 T41_RUNG_ABSENT; G/t41.mjs:126 T41_NON_ACTS | description differs (hand NON_ACTS) |
| acquire | capture | D/index.mjs:967 OPS_HAND; D/index.mjs:2183,2386 SESSION_OPS; G/index.mjs:654 RUNG_ABSENT_DATA; G/index.mjs:937 NON_ACTS_DATA; G/marks.mjs:45 ROWS | - |
| actioncorrespond | actions | D/index.mjs:836 OPS_HAND; D/index.mjs:1633 ACTION_ACTIONS; G/index.mjs:572 RUNGS_DATA; G/index.mjs:871 MACHINE_REFUSALS_DATA | - |
| actioncreate | actions | D/index.mjs:1300 OPS_HAND; D/index.mjs:2018 ACTIONS_ACTIONS; G/index.mjs:778 RUNG_ABSENT_DATA; G/index.mjs:1424 NON_ACTS_DATA | - |
| actionhold | action-holds | D/index.mjs:1304 OPS_HAND; D/index.mjs:2020 ACTION_HOLDS_ACTIONS; G/index.mjs:457 RUNGS_DATA; G/index.mjs:893 MACHINE_REFUSALS_DATA | - |
| actionholdrelease | action-holds | D/index.mjs:1308 OPS_HAND; D/index.mjs:2020 ACTION_HOLDS_ACTIONS; G/index.mjs:307 CONSEQUENCE_STATEMENTS; G/index.mjs:373 RUNGS_DATA; G/index.mjs:894 MACHINE_REFUSALS_DATA | - |
| actioninquiry | action-records | D/t50.mjs:48 T50_FAMILIES; G/t50.mjs:34 T50_RUNG_ABSENT; G/t50.mjs:45 T50_NON_ACTS | - |
| actionlaws | actions | D/index.mjs:839 OPS_HAND; D/index.mjs:1633 ACTION_ACTIONS; G/index.mjs:499 RUNGS_DATA; G/index.mjs:877 MACHINE_REFUSALS_DATA | - |
| actionlawspropose | action-records | D/index.mjs:845 OPS_HAND; D/index.mjs:2310,2418 SESSION_OPS; G/index.mjs:533 RUNGS_DATA; G/index.mjs:1052 NON_ACTS_DATA | - |
| actionmove | actions | D/index.mjs:835 OPS_HAND; D/index.mjs:1633 ACTION_ACTIONS; G/index.mjs:397 RUNGS_DATA; G/index.mjs:870 MACHINE_REFUSALS_DATA | - |
| actionrisktier | actions | D/index.mjs:842 OPS_HAND; D/index.mjs:1633 ACTION_ACTIONS; G/index.mjs:417 RUNGS_DATA; G/index.mjs:880 MACHINE_REFUSALS_DATA | - |
| actionscope | action-records | D/t45.mjs:36 T45_SHARES; G/index.mjs:898 MACHINE_REFUSALS_DATA; G/t45.mjs:41 T45_RUNGS | - |
| actionstake | action-records | D/t50.mjs:48 T50_FAMILIES; G/t50.mjs:21 T50_RUNGS; G/t50.mjs:44 T50_NON_ACTS | - |
| addparticipant | events | D/index.mjs:101 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:84 OP_ALIASES | - |
| addressedrecord | consequences | D/index.mjs:1221 OPS_HAND; D/index.mjs:1971 CONSEQUENCES_ACTIONS; D/index.mjs:2681 ACT_HELP_ABSENT; G/index.mjs:425 RUNGS_DATA; G/index.mjs:1406 NON_ACTS_DATA | - |
| addresseesuggest | actions | D/index.mjs:416 OP_FAMILIES; G/marks.mjs:46 ROWS; G/t33.mjs:354 T33_NON_ACTS | - |
| addworkbook | workbooks | D/index.mjs:105 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:86 OP_ALIASES | - |
| adminendorse | member-roster | D/index.mjs:1076 OPS_HAND; D/index.mjs:1732 GOVERNANCE_ACTIONS; D/t47.mjs:55 REAUTH_ACTS; G/index.mjs:702 RUNG_ABSENT_DATA; G/index.mjs:1217 NON_ACTS_DATA; G/marks.mjs:47 ROWS | - |
| adminremove | member-roster | D/index.mjs:1077 OPS_HAND; D/index.mjs:1732 GOVERNANCE_ACTIONS; D/t47.mjs:55 REAUTH_ACTS; G/index.mjs:403 RUNGS_DATA; G/index.mjs:1218 NON_ACTS_DATA | - |
| adoptversion | reevaluation | D/index.mjs:98 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:81 OP_ALIASES | - |
| aikeepaway | ai-accounts | D/t48.mjs:77 T48_FAMILIES; G/t36.mjs:34 T36_RUNGS; G/t36.mjs:106 T36_NON_ACTS | - |
| ailimitset | ai-use | D/index.mjs:402 OP_FAMILIES; G/marks.mjs:48 ROWS; G/t41.mjs:72 T41_RUNG_ABSENT; G/t41.mjs:130 T41_NON_ACTS | - |
| airunclose | ai-runs | D/index.mjs:1345 OPS_HAND; D/index.mjs:1871 AI_RUN_ACTIONS; D/index.mjs:1902 RUN_VERB_ACTIONS; D/index.mjs:2131 PLAN_RUN_SCOPE; G/index.mjs:548 RUNGS_DATA; G/index.mjs:1315 NON_ACTS_DATA | - |
| airunopen | ai-runs | D/index.mjs:1343 OPS_HAND; D/index.mjs:1871 AI_RUN_ACTIONS; D/index.mjs:1902 RUN_VERB_ACTIONS; G/index.mjs:547 RUNGS_DATA; G/index.mjs:1313 NON_ACTS_DATA | - |
| aliaswithdraw | entities | D/index.mjs:1147 OPS_HAND; D/index.mjs:1832 REGISTRY_ACTIONS; G/index.mjs:406 RUNGS_DATA; G/index.mjs:1080 NON_ACTS_DATA | - |
| archivelist | capture | D/index.mjs:489 OP_FAMILIES; G/marks.mjs:49 ROWS; G/t35.mjs:78 T35_NON_ACTS | - |
| aspirationdeadend | intent | D/index.mjs:1196 OPS_HAND; D/index.mjs:1956 INTENT_ACTIONS; D/index.mjs:2683 ACT_HELP_ABSENT; G/index.mjs:565 RUNGS_DATA; G/index.mjs:1379 NON_ACTS_DATA | - |
| aspirationdeclare | intent | D/index.mjs:1194 OPS_HAND; D/index.mjs:1955 INTENT_ACTIONS; D/index.mjs:2683 ACT_HELP_ABSENT; G/index.mjs:564 RUNGS_DATA; G/index.mjs:1377 NON_ACTS_DATA | - |
| aspirationdepart | intent | D/index.mjs:1195 OPS_HAND; D/index.mjs:1956 INTENT_ACTIONS; D/index.mjs:2683 ACT_HELP_ABSENT; G/index.mjs:413 RUNGS_DATA; G/index.mjs:1378 NON_ACTS_DATA | - |
| aspirationretire | intent | D/index.mjs:1197 OPS_HAND; D/index.mjs:1956 INTENT_ACTIONS; D/index.mjs:2684 ACT_HELP_ABSENT; G/index.mjs:414 RUNGS_DATA; G/index.mjs:1380 NON_ACTS_DATA | - |
| attest | attestation | D/index.mjs:969 OPS_HAND; D/index.mjs:2183,2386 SESSION_OPS; G/index.mjs:341 RUNGS_DATA; G/index.mjs:946 NON_ACTS_DATA | - |
| attribute | case-tensions | D/index.mjs:1120 OPS_HAND; D/index.mjs:2298,2407 SESSION_OPS; G/index.mjs:298 CONSEQUENCE_STATEMENTS; G/index.mjs:577 RUNGS_DATA; G/index.mjs:1036 NON_ACTS_DATA | - |
| authoritychain | money | D/index.mjs:254 OP_FAMILIES; G/marks.mjs:51 ROWS; G/t33.mjs:215 T33_NON_ACTS | - |
| biasadopt | bias | D/index.mjs:955 OPS_HAND; D/index.mjs:1922 POSITIONAL_ACTS; D/index.mjs:1939 BIAS_ACTIONS; D/index.mjs:2684 ACT_HELP_ABSENT; G/index.mjs:567 RUNGS_DATA; G/index.mjs:1177 NON_ACTS_DATA | - |
| biasdebt | bias | D/index.mjs:1351 OPS_HAND; G/index.mjs:1251 NON_ACTS_DATA; G/marks.mjs:52 ROWS | - |
| biasdebtresolve | bias | D/index.mjs:1350 OPS_HAND; D/index.mjs:1950 BIAS_DEBT_ACTIONS; D/index.mjs:2684 ACT_HELP_ABSENT; G/index.mjs:416 RUNGS_DATA; G/index.mjs:1250 NON_ACTS_DATA | - |
| biasinhale | bias | D/index.mjs:956 OPS_HAND; G/marks.mjs:53 ROWS | - |
| biasmanifest | bias | D/index.mjs:954 OPS_HAND; G/marks.mjs:54 ROWS | - |
| bind | workbooks | D/index.mjs:105 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:86 OP_ALIASES | - |
| bootstrap | credentials | D/index.mjs:1474 OPS_HAND; G/marks.mjs:55 ROWS | - |
| calculationaccept | calculations | D/index.mjs:303 OP_FAMILIES; G/t33.mjs:126 T33_RUNG_ABSENT; G/t33.mjs:283 T33_NON_ACTS | - |
| calculationcreate | calculations | D/index.mjs:302 OP_FAMILIES; G/t33.mjs:125 T33_RUNG_ABSENT; G/t33.mjs:282 T33_NON_ACTS | - |
| calculationdraw | calculations | D/index.mjs:303 OP_FAMILIES; G/t33.mjs:127 T33_RUNG_ABSENT; G/t33.mjs:284 T33_NON_ACTS | - |
| captureaccount | capture | D/index.mjs:1043 OPS_HAND; D/index.mjs:1777 CAPTURE_MEMBER_ACTIONS; D/index.mjs:2685 ACT_HELP_ABSENT; G/index.mjs:354 RUNGS_DATA; G/index.mjs:1108 NON_ACTS_DATA | - |
| capturecredentiallist | capture-sources | G/marks.mjs:56 ROWS | - |
| capturecredentialsupply | capture-sources | G/marks.mjs:57 ROWS | - |
| capturecredentialwithdraw | capture-sources | G/marks.mjs:58 ROWS | - |
| captureprogressions | progressions | D/index.mjs:1178 OPS_HAND; D/index.mjs:2181 PROGRESSION_ACTIONS; G/marks.mjs:59 ROWS | - |
| capturerequest | capture-requests | D/index.mjs:1448 OPS_HAND; D/index.mjs:1871 AI_RUN_ACTIONS; D/index.mjs:1914 RUN_PRODUCTION_ACTIONS; G/index.mjs:659 RUNG_ABSENT_DATA; G/index.mjs:1343 NON_ACTS_DATA; G/marks.mjs:60 ROWS | - |
| capturerequestretry | capture-requests | D/index.mjs:1452 OPS_HAND; D/index.mjs:2325,2427 SESSION_OPS; D/index.mjs:2686 ACT_HELP_ABSENT; G/index.mjs:771 RUNG_ABSENT_DATA; G/index.mjs:1389 NON_ACTS_DATA; G/marks.mjs:61 ROWS | - |
| casedetails | case-inputs | G/marks.mjs:62 ROWS | - |
| casedetailspublic | case-inputs | G/marks.mjs:63 ROWS | - |
| casedetailsset | case-inputs | G/marks.mjs:64 ROWS | - |
| casedraft | review | D/index.mjs:1016 OPS_HAND; D/index.mjs:2385,2457 SESSION_OPS; G/index.mjs:536 RUNGS_DATA; G/index.mjs:1149 NON_ACTS_DATA | - |
| caseimport | case-import | D/index.mjs:1403 OPS_HAND; D/index.mjs:2085 CASE_IMPORT_ACTIONS; D/index.mjs:2088 CASE_IMPORT_BY; G/index.mjs:817 RUNG_ABSENT_DATA; G/index.mjs:1507 NON_ACTS_DATA | - |
| caseratify | ratification | D/index.mjs:1009 OPS_HAND; D/index.mjs:2187,2387 SESSION_OPS; D/t47.mjs:54 REAUTH_ACTS; G/index.mjs:347 RUNGS_DATA; G/index.mjs:1142 NON_ACTS_DATA | description differs (hand NON_ACTS) |
| checkpointrecord | action-plans | D/index.mjs:1331 OPS_HAND; D/index.mjs:2024 ACTION_PLANS_ACTIONS; G/index.mjs:787 RUNG_ABSENT_DATA; G/index.mjs:1444 NON_ACTS_DATA | - |
| checkrequest | tasks | D/index.mjs:471 OP_FAMILIES; G/t34.mjs:33 T34_RUNG_ABSENT; G/t34.mjs:58 T34_NON_ACTS | - |
| cite | citation | D/index.mjs:236,245,250,257,264,273,281,289,300,310,318,324,336,373,382,385,393,401,406,410,415,419,426,445,461,470,475,481,488,492,495,506,521,526,533,543,550,563,573,579,584,589,600 OP_FAMILIES; D/index.mjs:799 OPS_HAND; D/index.mjs:1581 EDGE_ACTIONS; D/index.mjs:1922 POSITIONAL_ACTS; D/t45.mjs:22,25,28,31,35,38,42,45 T45_SHARES; D/t45.mjs:52,56,61,67,78,82,86,91,96,101,106 T45_FAMILIES; D/t46.mjs:13,18,22,26,30,36 T46_SHARES; D/t47.mjs:16,24,27,31,35 T47_SHARES; D/t47.mjs:41,45 T47_FAMILIES; D/t48.mjs:19,22,27,32,36,39,42,44,47,50,53 T48_SHARES; D/t48.mjs:62,70 T48_FAMILIES; D/t49.mjs:12,13 T49_SHARES; D/t50.mjs:22,26,30,34,37,38,39,40 T50_SHARES; D/t50.mjs:47,51 T50_FAMILIES; D/t51.mjs:26,29,32,34,36,39,40,43,44,45,48 T51_SHARES; D/t51.mjs:54,56 T51_FAMILIES; G/index.mjs:490 RUNGS_DATA | - |
| citeimported | citation | G/marks.mjs:65 ROWS | - |
| claim | credentials | D/index.mjs:658 OP_STAMPS_HAND; D/index.mjs:1475 OPS_HAND; G/index.mjs:720 RUNG_ABSENT_DATA; G/marks.mjs:66 ROWS | - |
| clockadopt | action-clocks | D/index.mjs:421 OP_FAMILIES; G/index.mjs:916 MACHINE_REFUSALS_DATA; G/t33.mjs:152 T33_RUNG_ABSENT | - |
| committedagainstpaid | money | D/index.mjs:254 OP_FAMILIES; G/marks.mjs:67 ROWS; G/t33.mjs:214 T33_NON_ACTS | - |
| communicationprepare | filings | D/index.mjs:1261 OPS_HAND; D/index.mjs:1976 FILINGS_ACTIONS; G/index.mjs:776 RUNG_ABSENT_DATA | - |
| conclude | basis-versions | D/index.mjs:814 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; D/index.mjs:1922 POSITIONAL_ACTS; G/index.mjs:392 RUNGS_DATA; G/index.mjs:864 MACHINE_REFUSALS_DATA | - |
| connect | connections | D/index.mjs:1161 OPS_HAND; D/index.mjs:2179 PROGRESSION_ACTIONS; G/index.mjs:675 RUNG_ABSENT_DATA; G/index.mjs:1090 NON_ACTS_DATA; G/marks.mjs:68 ROWS | - |
| connectionassert | connections | D/index.mjs:885 OPS_HAND; D/index.mjs:2221,2398 SESSION_OPS; G/index.mjs:410 RUNGS_DATA; G/index.mjs:1085 NON_ACTS_DATA | - |
| connectionchoose | connections | D/index.mjs:882 OPS_HAND; D/index.mjs:2219,2397 SESSION_OPS; G/index.mjs:541 RUNGS_DATA; G/index.mjs:976 NON_ACTS_DATA | - |
| consequencerecord | consequences | D/index.mjs:1219 OPS_HAND; D/index.mjs:1971 CONSEQUENCES_ACTIONS; D/index.mjs:2688 ACT_HELP_ABSENT; G/index.mjs:571 RUNGS_DATA; G/index.mjs:1404 NON_ACTS_DATA | - |
| consequencerevise | consequences | D/index.mjs:1220 OPS_HAND; D/index.mjs:1971 CONSEQUENCES_ACTIONS; D/index.mjs:2688 ACT_HELP_ABSENT; G/index.mjs:424 RUNGS_DATA; G/index.mjs:1405 NON_ACTS_DATA | - |
| contradictionclarify | contradiction | D/index.mjs:905 OPS_HAND; D/index.mjs:2040 CONTRADICTION_ACTIONS; D/index.mjs:2688 ACT_HELP_ABSENT; G/index.mjs:437 RUNGS_DATA; G/index.mjs:992 NON_ACTS_DATA | - |
| contradictiondismiss | contradiction | D/index.mjs:904 OPS_HAND; D/index.mjs:2040 CONTRADICTION_ACTIONS; D/index.mjs:2689 ACT_HELP_ABSENT; G/index.mjs:436 RUNGS_DATA; G/index.mjs:991 NON_ACTS_DATA | - |
| contradictionoptin | contradiction | D/index.mjs:908 OPS_HAND; D/index.mjs:2041 CONTRADICTION_ACTIONS; D/index.mjs:2689 ACT_HELP_ABSENT; G/index.mjs:762 RUNG_ABSENT_DATA; G/index.mjs:1002 NON_ACTS_DATA | - |
| contradictionresolve | contradiction | D/index.mjs:907 OPS_HAND; D/index.mjs:2040 CONTRADICTION_ACTIONS; D/index.mjs:2690 ACT_HELP_ABSENT; G/index.mjs:439 RUNGS_DATA; G/index.mjs:888 MACHINE_REFUSALS_DATA | - |
| contradictionrespond | contradiction | D/index.mjs:909 OPS_HAND; D/index.mjs:2041 CONTRADICTION_ACTIONS; D/index.mjs:2690 ACT_HELP_ABSENT; G/index.mjs:763 RUNG_ABSENT_DATA; G/index.mjs:1003 NON_ACTS_DATA | - |
| contradictiontakeup | contradiction | D/index.mjs:906 OPS_HAND; D/index.mjs:2040 CONTRADICTION_ACTIONS; D/index.mjs:2690 ACT_HELP_ABSENT; G/index.mjs:438 RUNGS_DATA; G/index.mjs:993 NON_ACTS_DATA | - |
| counselpacket | filings | D/index.mjs:1228 OPS_HAND; D/index.mjs:1975 FILINGS_ACTIONS; G/index.mjs:576 RUNGS_DATA; G/index.mjs:904 MACHINE_REFUSALS_DATA | - |
| courtlink | standards | D/index.mjs:338 OP_FAMILIES; G/t33.mjs:77 T33_RUNGS; G/t33.mjs:330 T33_NON_ACTS | - |
| courtnoticeset | member-roster | D/index.mjs:466 OP_FAMILIES; G/marks.mjs:69 ROWS; G/t34.mjs:30 T34_RUNG_ABSENT; G/t34.mjs:56 T34_NON_ACTS | - |
| createevent | events | D/index.mjs:101 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:84 OP_ALIASES | - |
| createset | money | D/index.mjs:103 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:85 OP_ALIASES | - |
| declare | duties | D/index.mjs:107 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:87 OP_ALIASES | - |
| declaredstakeset | instance-setup | D/t45.mjs:45 T45_SHARES; G/t45.mjs:57 T45_RUNGS; G/t45.mjs:173 T45_NON_ACTS | - |
| declareorigin | provenance | G/marks.mjs:70 ROWS | - |
| declaretie | people | D/index.mjs:96 OP_ALIASES; D/index.mjs:2633 ACT_HELP_ABSENT; G/t34.mjs:80 OP_ALIASES | - |
| declinetoescalate | escalation | D/index.mjs:1247 OPS_HAND; D/index.mjs:2005 ESCALATION_ACTIONS; G/index.mjs:591 RUNGS_DATA; G/index.mjs:1417 NON_ACTS_DATA | - |
| deepercheck | file-safety | D/index.mjs:507,511 OP_FAMILIES; G/marks.mjs:71 ROWS; G/t36.mjs:41 T36_RUNG_ABSENT; G/t36.mjs:81 T36_NON_ACTS | - |
| determine | conformance | D/index.mjs:1212 OPS_HAND; D/index.mjs:1969 CONFORMANCE_ACTIONS; D/index.mjs:2691 ACT_HELP_ABSENT; G/index.mjs:433 RUNGS_DATA; G/index.mjs:1402 NON_ACTS_DATA | - |
| discharge | progressions | D/index.mjs:1170 OPS_HAND; D/index.mjs:2180 PROGRESSION_ACTIONS; G/index.mjs:398 RUNGS_DATA; G/index.mjs:1093 NON_ACTS_DATA | - |
| disclosureshown | instance-setup | D/index.mjs:447 OP_FAMILIES; G/marks.mjs:72 ROWS; G/t33.mjs:159 T33_RUNG_ABSENT; G/t33.mjs:373 T33_NON_ACTS | - |
| docketfile | docket | D/index.mjs:1390 OPS_HAND; D/index.mjs:2073 DOCKET_ACTIONS; D/index.mjs:2075 DOCKET_AUTHOR; G/index.mjs:598 RUNGS_DATA; G/index.mjs:1494 NON_ACTS_DATA | - |
| docketpost | docket | D/index.mjs:1393 OPS_HAND; D/index.mjs:2073 DOCKET_ACTIONS; D/index.mjs:2076 DOCKET_BY; D/t47.mjs:54 REAUTH_ACTS; G/index.mjs:362 RUNGS_DATA; G/index.mjs:1497 NON_ACTS_DATA | - |
| drawquestion | citation | D/index.mjs:803 OPS_HAND; D/index.mjs:1581 EDGE_ACTIONS; D/index.mjs:1925 POSITIONAL_ACTS; G/t47.mjs:30 T47_RUNGS; G/t47.mjs:59 T47_NON_ACTS | - |
| enroll | member-roster | D/index.mjs:1477 OPS_HAND; G/index.mjs:714 RUNG_ABSENT_DATA; G/marks.mjs:73 ROWS | - |
| entityalias | entities | D/index.mjs:1143 OPS_HAND; D/index.mjs:1832 REGISTRY_ACTIONS; G/index.mjs:544 RUNGS_DATA; G/index.mjs:1077 NON_ACTS_DATA | - |
| entitycreate | entities | D/index.mjs:1142 OPS_HAND; D/index.mjs:1832 REGISTRY_ACTIONS; G/index.mjs:300 CONSEQUENCE_STATEMENTS; G/index.mjs:561 RUNGS_DATA; G/index.mjs:1076 NON_ACTS_DATA | - |
| escalationadvance | escalation | D/index.mjs:1237 OPS_HAND; D/index.mjs:2003 ESCALATION_ACTIONS; G/index.mjs:427 RUNGS_DATA; G/index.mjs:1410 NON_ACTS_DATA | - |
| escalationattach | escalation | D/index.mjs:1235 OPS_HAND; D/index.mjs:2003 ESCALATION_ACTIONS; D/index.mjs:2693 ACT_HELP_ABSENT; G/index.mjs:575 RUNGS_DATA; G/index.mjs:903 MACHINE_REFUSALS_DATA | - |
| escalationdecline | escalation | D/index.mjs:1238 OPS_HAND; D/index.mjs:2004 ESCALATION_ACTIONS; D/index.mjs:2693 ACT_HELP_ABSENT; G/index.mjs:428 RUNGS_DATA; G/index.mjs:1411 NON_ACTS_DATA | - |
| escalationend | escalation | D/index.mjs:1239 OPS_HAND; D/index.mjs:2004 ESCALATION_ACTIONS; G/index.mjs:585 RUNGS_DATA; G/index.mjs:1412 NON_ACTS_DATA | - |
| escalationevaluate | escalation | D/index.mjs:1236 OPS_HAND; D/index.mjs:2003 ESCALATION_ACTIONS; D/index.mjs:2693 ACT_HELP_ABSENT; G/index.mjs:426 RUNGS_DATA; G/index.mjs:1409 NON_ACTS_DATA | - |
| escalationopen | escalation | D/index.mjs:1234 OPS_HAND; D/index.mjs:2003 ESCALATION_ACTIONS; G/index.mjs:574 RUNGS_DATA; G/index.mjs:902 MACHINE_REFUSALS_DATA | - |
| escalationreopen | escalation | D/index.mjs:1253 OPS_HAND; D/index.mjs:2005 ESCALATION_ACTIONS; G/index.mjs:913 MACHINE_REFUSALS_DATA; G/t46.mjs:22 T46_RUNGS | - |
| escalationresume | escalation | D/index.mjs:1241 OPS_HAND; D/index.mjs:2004 ESCALATION_ACTIONS; D/index.mjs:2693 ACT_HELP_ABSENT; G/index.mjs:503 RUNGS_DATA; G/index.mjs:1414 NON_ACTS_DATA | - |
| escalationstoppursuing | escalation | D/index.mjs:1252 OPS_HAND; D/index.mjs:2005 ESCALATION_ACTIONS; G/index.mjs:912 MACHINE_REFUSALS_DATA; G/t46.mjs:21 T46_RUNGS | - |
| escalationsuspend | escalation | D/index.mjs:1240 OPS_HAND; D/index.mjs:2004 ESCALATION_ACTIONS; D/index.mjs:2694 ACT_HELP_ABSENT; G/index.mjs:429 RUNGS_DATA; G/index.mjs:1413 NON_ACTS_DATA | - |
| exclude | money | D/index.mjs:104 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/t34.mjs:85 OP_ALIASES | - |
| expertiseconfirm | member-roster | D/index.mjs:742 OPS_HAND; D/index.mjs:1815 EXPERTISE_ACTIONS; G/index.mjs:713 RUNG_ABSENT_DATA; G/index.mjs:1201 NON_ACTS_DATA; G/marks.mjs:74 ROWS | - |
| expertisedeclare | member-roster | D/index.mjs:741 OPS_HAND; D/index.mjs:1815 EXPERTISE_ACTIONS; G/index.mjs:712 RUNG_ABSENT_DATA; G/index.mjs:1200 NON_ACTS_DATA; G/marks.mjs:75 ROWS | - |
| expertisewithdraw | member-roster | none | - |
| explore | explore | D/index.mjs:281,282 OP_FAMILIES; D/t48.mjs:39 T48_SHARES; G/marks.mjs:76 ROWS; G/t33.mjs:265 T33_NON_ACTS | - |
| exploreapprove | ai-use | D/index.mjs:402 OP_FAMILIES; G/marks.mjs:77 ROWS; G/t41.mjs:73 T41_RUNG_ABSENT; G/t41.mjs:133 T41_NON_ACTS | - |
| explorepreset | explore | D/index.mjs:282 OP_FAMILIES; G/marks.mjs:78 ROWS; G/t33.mjs:266 T33_NON_ACTS | - |
| exploreverify | explore | D/index.mjs:282 OP_FAMILIES; G/marks.mjs:79 ROWS; G/t33.mjs:267 T33_NON_ACTS | - |
| export | corpus-export | D/index.mjs:758 OPS_HAND; G/index.mjs:657 RUNG_ABSENT_DATA; G/marks.mjs:80 ROWS | - |
| exportlog | corpus-export | D/index.mjs:760 OPS_HAND; G/marks.mjs:81 ROWS | - |
| factconfirm | local-facts | D/index.mjs:1294 OPS_HAND; D/index.mjs:1998 LOCAL_FACTS_ACTIONS; G/index.mjs:462 RUNGS_DATA; G/index.mjs:1470 NON_ACTS_DATA | - |
| filingapprove | filings | D/index.mjs:1226 OPS_HAND; D/index.mjs:1975 FILINGS_ACTIONS; G/index.mjs:302 CONSEQUENCE_STATEMENTS; G/index.mjs:586 RUNGS_DATA; G/index.mjs:905 MACHINE_REFUSALS_DATA | - |
| filingprepare | filings | D/index.mjs:1225 OPS_HAND; D/index.mjs:1975 FILINGS_ACTIONS; G/index.mjs:534 RUNGS_DATA | - |
| filingrecordsent | filings | D/index.mjs:108 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/t34.mjs:87 OP_ALIASES | - |
| filingsecondapprove | filings | D/t45.mjs:80 T45_FAMILIES; G/t45.mjs:35 T45_RUNGS; G/t45.mjs:117 T45_NON_ACTS | - |
| findin | retrieval | D/index.mjs:492,493 OP_FAMILIES; G/marks.mjs:82 ROWS; G/t35.mjs:80 T35_NON_ACTS | - |
| followregister | following | D/index.mjs:325 OP_FAMILIES; G/t33.mjs:69 T33_RUNGS; G/t33.mjs:318 T33_NON_ACTS | - |
| founderhandleset | member-roster | D/t49.mjs:12 T49_SHARES; G/marks.mjs:83 ROWS; G/t49.mjs:17 T49_RUNG_ABSENT; G/t49.mjs:22 T49_NON_ACTS | - |
| frontier | retrieval | D/index.mjs:1353 OPS_HAND; D/index.mjs:2315,2420 SESSION_OPS; G/marks.mjs:84 ROWS | - |
| goalclose | intent | D/index.mjs:1192 OPS_HAND; D/index.mjs:1955 INTENT_ACTIONS; D/index.mjs:2696 ACT_HELP_ABSENT; G/index.mjs:412 RUNGS_DATA; G/index.mjs:1375 NON_ACTS_DATA | - |
| goaldeclare | intent | D/index.mjs:1190 OPS_HAND; D/index.mjs:1955 INTENT_ACTIONS; D/index.mjs:2696 ACT_HELP_ABSENT; G/index.mjs:554 RUNGS_DATA; G/index.mjs:1373 NON_ACTS_DATA | - |
| goallink | intent | D/index.mjs:1191 OPS_HAND; D/index.mjs:1955 INTENT_ACTIONS; D/index.mjs:2697 ACT_HELP_ABSENT; G/index.mjs:545 RUNGS_DATA; G/index.mjs:1374 NON_ACTS_DATA | - |
| gradenote | capture | D/index.mjs:1055 OPS_HAND; D/index.mjs:1784 CAPTURE_READS; G/index.mjs:1117 NON_ACTS_DATA; G/marks.mjs:85 ROWS | - |
| groupdescriptiondraft | store-door | D/index.mjs:446,450 OP_FAMILIES; G/index.mjs:1547 NON_ACTS_DATA; G/marks.mjs:86 ROWS; G/t48.mjs:51 T48_RUNG_ABSENT | weight hand caller-owned vs reasoned |
| groupdescriptionset | member-roster | D/index.mjs:466 OP_FAMILIES; G/marks.mjs:87 ROWS; G/t34.mjs:31 T34_RUNG_ABSENT; G/t34.mjs:57 T34_NON_ACTS | - |
| groupdomainset | instance-setup | D/index.mjs:771 OPS_HAND; D/index.mjs:1739 IDENTITY_ACTIONS; G/index.mjs:671 RUNG_ABSENT_DATA; G/index.mjs:1226 NON_ACTS_DATA; G/marks.mjs:88 ROWS | - |
| groupkeynoticeseen | ai-accounts | D/t48.mjs:76 T48_FAMILIES; G/marks.mjs:89 ROWS; G/t34.mjs:40 T34_RUNG_ABSENT; G/t34.mjs:68 T34_NON_ACTS | - |
| groupkeyremove | ai-accounts | D/t48.mjs:75 T48_FAMILIES; G/marks.mjs:90 ROWS; G/t34.mjs:38 T34_RUNG_ABSENT; G/t34.mjs:64 T34_NON_ACTS | - |
| groupkeyset | ai-accounts | D/t47.mjs:59 REAUTH_ACTS; D/t48.mjs:75 T48_FAMILIES; G/marks.mjs:91 ROWS; G/t34.mjs:37 T34_RUNG_ABSENT; G/t34.mjs:63 T34_NON_ACTS | - |
| groupkeyswitch | ai-accounts | D/t48.mjs:75 T48_FAMILIES; G/marks.mjs:92 ROWS; G/t34.mjs:39 T34_RUNG_ABSENT; G/t34.mjs:65 T34_NON_ACTS | - |
| grouplanguagesset | instance-setup | D/t47.mjs:32 T47_SHARES; G/t47.mjs:37 T47_RUNGS; G/t47.mjs:72 T47_NON_ACTS | - |
| grouplogoset | instance-setup | D/t47.mjs:32 T47_SHARES; G/t47.mjs:36 T47_RUNGS; G/t47.mjs:71 T47_NON_ACTS | - |
| groupnameset | instance-setup | D/index.mjs:770 OPS_HAND; D/index.mjs:1739 IDENTITY_ACTIONS; G/index.mjs:670 RUNG_ABSENT_DATA; G/index.mjs:1225 NON_ACTS_DATA; G/marks.mjs:93 ROWS | - |
| handlecheck | member-roster | D/index.mjs:462,463 OP_FAMILIES; G/marks.mjs:94 ROWS; G/t41.mjs:113 T41_NON_ACTS | - |
| heldcaptures | capture | D/index.mjs:1054 OPS_HAND; D/index.mjs:1784 CAPTURE_READS; G/index.mjs:1116 NON_ACTS_DATA; G/marks.mjs:96 ROWS | - |
| heldrestore | capture | D/index.mjs:1053 OPS_HAND; D/index.mjs:1777 CAPTURE_MEMBER_ACTIONS; D/index.mjs:1783 CAPTURE_VIEWER_ACTIONS; G/index.mjs:593 RUNGS_DATA; G/index.mjs:1115 NON_ACTS_DATA | - |
| heldsetaside | capture | D/index.mjs:1052 OPS_HAND; D/index.mjs:1777 CAPTURE_MEMBER_ACTIONS; D/index.mjs:1783 CAPTURE_VIEWER_ACTIONS; G/index.mjs:592 RUNGS_DATA; G/index.mjs:1114 NON_ACTS_DATA | - |
| holdnoticeprepare | filings | D/t45.mjs:80 T45_FAMILIES; G/t45.mjs:75 T45_RUNG_ABSENT | - |
| holdnoticesent | action-holds | D/t45.mjs:53 T45_FAMILIES; G/index.mjs:896 MACHINE_REFUSALS_DATA; G/t45.mjs:70 T45_RUNG_ABSENT | - |
| hostingaccessset | member-roster | D/index.mjs:1082 OPS_HAND; D/index.mjs:1768 ROSTER_SELF_ACTIONS; G/index.mjs:736 RUNG_ABSENT_DATA; G/index.mjs:1221 NON_ACTS_DATA; G/marks.mjs:97 ROWS | - |
| hypothesishold | hypotheses | D/index.mjs:290 OP_FAMILIES; G/t33.mjs:56 T33_RUNGS; G/t33.mjs:270 T33_NON_ACTS | - |
| hypothesisrevise | hypotheses | D/index.mjs:290 OP_FAMILIES; D/index.mjs:2698 ACT_HELP_ABSENT; G/t33.mjs:57 T33_RUNGS; G/t33.mjs:271 T33_NON_ACTS | - |
| hypothesiswithdraw | hypotheses | D/index.mjs:290 OP_FAMILIES; D/index.mjs:2699 ACT_HELP_ABSENT; G/t33.mjs:58 T33_RUNGS; G/t33.mjs:272 T33_NON_ACTS | - |
| identityclaim | people | D/index.mjs:274 OP_FAMILIES; G/t33.mjs:46 T33_RUNGS; G/t33.mjs:242 T33_NON_ACTS | - |
| importaccept | case-import | D/index.mjs:1405 OPS_HAND; D/index.mjs:2085 CASE_IMPORT_ACTIONS; D/index.mjs:2088 CASE_IMPORT_BY; G/index.mjs:604 RUNGS_DATA; G/index.mjs:1509 NON_ACTS_DATA | - |
| importacceptwithdraw | case-import | D/index.mjs:1406 OPS_HAND; D/index.mjs:2085 CASE_IMPORT_ACTIONS; D/index.mjs:2088 CASE_IMPORT_BY; D/index.mjs:2699 ACT_HELP_ABSENT; G/index.mjs:605 RUNGS_DATA; G/index.mjs:1510 NON_ACTS_DATA | - |
| importflag | case-import | D/index.mjs:1407 OPS_HAND; D/index.mjs:2086 CASE_IMPORT_ACTIONS; D/index.mjs:2089 CASE_IMPORT_BY; G/index.mjs:606 RUNGS_DATA; G/index.mjs:1511 NON_ACTS_DATA | - |
| importregrade | case-import | G/marks.mjs:98 ROWS | - |
| importwatch | case-import | D/index.mjs:1413 OPS_HAND; D/index.mjs:2086 CASE_IMPORT_ACTIONS; D/index.mjs:2089 CASE_IMPORT_BY; G/index.mjs:615 RUNGS_DATA; G/index.mjs:1518 NON_ACTS_DATA | - |
| inboxpull | doorbell | D/index.mjs:1037 OPS_HAND; D/index.mjs:1777 CAPTURE_MEMBER_ACTIONS; D/index.mjs:1783 CAPTURE_VIEWER_ACTIONS; G/index.mjs:513 RUNGS_DATA; G/index.mjs:1103 NON_ACTS_DATA | - |
| inboxresolve | doorbell | D/index.mjs:1033 OPS_HAND; D/index.mjs:1783 CAPTURE_VIEWER_ACTIONS; D/index.mjs:2311,2419 SESSION_OPS; G/index.mjs:582 RUNGS_DATA; G/index.mjs:1096 NON_ACTS_DATA | - |
| include | money | D/index.mjs:103 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/t34.mjs:85 OP_ALIASES | - |
| infolevelset | instance-setup | D/t46.mjs:14 T46_SHARES; G/marks.mjs:99 ROWS; G/t46.mjs:28 T46_RUNG_ABSENT; G/t46.mjs:36 T46_NON_ACTS | - |
| inquirydivide | inquiry | D/index.mjs:821 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; D/index.mjs:2700 ACT_HELP_ABSENT; G/index.mjs:395 RUNGS_DATA; G/index.mjs:868 MACHINE_REFUSALS_DATA | - |
| inquiryground | inquiry | D/index.mjs:824 OPS_HAND; D/index.mjs:1661 STRUCTURE_ACTIONS; G/index.mjs:396 RUNGS_DATA; G/index.mjs:869 MACHINE_REFUSALS_DATA | - |
| instance | progressions | D/index.mjs:1168 OPS_HAND; D/index.mjs:2180 PROGRESSION_ACTIONS; G/marks.mjs:104 ROWS | - |
| invitelook | member-roster | D/index.mjs:1480 OPS_HAND; G/marks.mjs:105 ROWS | - |
| invitewithdraw | member-roster | D/index.mjs:464 OP_FAMILIES; G/marks.mjs:106 ROWS; G/t34.mjs:19 T34_RUNG_ABSENT; G/t34.mjs:48 T34_NON_ACTS | - |
| itemtakeup | plan-work | D/t45.mjs:70 T45_FAMILIES; G/index.mjs:909 MACHINE_REFUSALS_DATA; G/marks.mjs:107 ROWS; G/t45.mjs:66 T45_RUNG_ABSENT | - |
| joinlinkenable | member-roster | D/index.mjs:465 OP_FAMILIES; G/marks.mjs:108 ROWS; G/t34.mjs:23 T34_RUNG_ABSENT; G/t34.mjs:52 T34_NON_ACTS | - |
| joinlinkinvite | member-roster | D/index.mjs:467 OP_FAMILIES; G/marks.mjs:109 ROWS; G/t34.mjs:28 T34_RUNG_ABSENT | - |
| keepversion | reevaluation | D/index.mjs:98 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/t34.mjs:81 OP_ALIASES | - |
| knock | doorbell | D/index.mjs:1482 OPS_HAND; G/index.mjs:715 RUNG_ABSENT_DATA; G/marks.mjs:110 ROWS | - |
| knockerconsent | sources | D/index.mjs:1485 OPS_HAND; G/index.mjs:719 RUNG_ABSENT_DATA; G/marks.mjs:111 ROWS | - |
| knocksof | doorbell | D/index.mjs:1038 OPS_HAND; G/index.mjs:1104 NON_ACTS_DATA; G/marks.mjs:112 ROWS | - |
| lawrelate | standards | D/index.mjs:338 OP_FAMILIES; G/t33.mjs:75 T33_RUNGS; G/t33.mjs:327 T33_NON_ACTS | - |
| lead | observation-log | D/index.mjs:1114 OPS_HAND; D/index.mjs:2295,2404 SESSION_OPS; D/index.mjs:2702 ACT_HELP_ABSENT; G/index.mjs:553 RUNGS_DATA; G/index.mjs:1030 NON_ACTS_DATA | - |
| leadlook | observation-log | D/index.mjs:1115 OPS_HAND; D/index.mjs:2295,2404 SESSION_OPS; D/index.mjs:2702 ACT_HELP_ABSENT; G/index.mjs:555 RUNGS_DATA; G/index.mjs:1031 NON_ACTS_DATA | - |
| leadread | observation-log | D/index.mjs:1121 OPS_HAND; G/index.mjs:1039 NON_ACTS_DATA; G/marks.mjs:113 ROWS | - |
| leadshare | observation-log | D/index.mjs:1117 OPS_HAND; D/index.mjs:2295,2404 SESSION_OPS; D/index.mjs:2702 ACT_HELP_ABSENT; G/index.mjs:299 CONSEQUENCE_STATEMENTS; G/index.mjs:556 RUNGS_DATA; G/index.mjs:1032 NON_ACTS_DATA | - |
| login | credentials | D/index.mjs:658 OP_STAMPS_HAND; D/index.mjs:1476 OPS_HAND; G/marks.mjs:115 ROWS | - |
| memberadd | member-roster | D/index.mjs:1069 OPS_HAND; D/index.mjs:1759 CUSTODIAL_ACTIONS; D/t47.mjs:57 REAUTH_ACTS; G/index.mjs:699 RUNG_ABSENT_DATA; G/index.mjs:1202 NON_ACTS_DATA; G/marks.mjs:116 ROWS | - |
| membercaps | member-roster | D/index.mjs:1075 OPS_HAND; D/index.mjs:1732 GOVERNANCE_ACTIONS; G/index.mjs:701 RUNG_ABSENT_DATA; G/index.mjs:1216 NON_ACTS_DATA; G/marks.mjs:117 ROWS | - |
| memberlanguageset | instance-setup | D/index.mjs:449 OP_FAMILIES; G/marks.mjs:118 ROWS; G/t34.mjs:43 T34_RUNG_ABSENT; G/t34.mjs:71 T34_NON_ACTS | - |
| memberpairingset | member-roster | D/index.mjs:1084 OPS_HAND; D/index.mjs:1768 ROSTER_SELF_ACTIONS; D/index.mjs:2703 ACT_HELP_ABSENT; G/index.mjs:737 RUNG_ABSENT_DATA; G/index.mjs:1222 NON_ACTS_DATA; G/marks.mjs:119 ROWS | - |
| memberset | member-roster | D/index.mjs:1071 OPS_HAND; D/index.mjs:1759 CUSTODIAL_ACTIONS; D/t47.mjs:56 REAUTH_ACTS; G/index.mjs:700 RUNG_ABSENT_DATA; G/index.mjs:1203 NON_ACTS_DATA; G/marks.mjs:120 ROWS | - |
| monitor | monitoring | D/index.mjs:972 OPS_HAND; D/index.mjs:2183,2386 SESSION_OPS; G/index.mjs:746 RUNG_ABSENT_DATA; G/index.mjs:947 NON_ACTS_DATA; G/marks.mjs:121 ROWS | - |
| monitoring | monitoring | D/index.mjs:1357 OPS_HAND; G/marks.mjs:122 ROWS | - |
| monitorpause | monitoring | D/index.mjs:1360 OPS_HAND; D/index.mjs:2367,2451 SESSION_OPS; D/index.mjs:2705 ACT_HELP_ABSENT; G/index.mjs:711 RUNG_ABSENT_DATA; G/index.mjs:1239 NON_ACTS_DATA; G/marks.mjs:123 ROWS | - |
| monitorset | monitoring | D/index.mjs:1372 OPS_HAND; D/index.mjs:2048 MONITORING_ACTIONS; G/t47.mjs:34 T47_RUNGS; G/t47.mjs:63 T47_NON_ACTS | - |
| monitorslate | monitoring | D/index.mjs:1365 OPS_HAND; G/marks.mjs:124 ROWS | - |
| namedrequests | monitoring | G/marks.mjs:125 ROWS | - |
| namedrequestset | monitoring | G/marks.mjs:126 ROWS | - |
| narrow | basis-versions | D/index.mjs:879 OPS_HAND; D/index.mjs:2216,2396 SESSION_OPS; G/index.mjs:418 RUNGS_DATA; G/index.mjs:969 NON_ACTS_DATA | - |
| notedelete | hypotheses | D/index.mjs:291 OP_FAMILIES; G/marks.mjs:127 ROWS; G/t35.mjs:41 T35_RUNG_ABSENT; G/t35.mjs:73 T35_NON_ACTS | - |
| noterevise | hypotheses | D/index.mjs:291 OP_FAMILIES; G/marks.mjs:128 ROWS; G/t35.mjs:40 T35_RUNG_ABSENT; G/t35.mjs:72 T35_NON_ACTS | - |
| noteturn | hypotheses | D/index.mjs:291 OP_FAMILIES; G/marks.mjs:129 ROWS; G/t33.mjs:121 T33_RUNG_ABSENT; G/t33.mjs:276 T33_NON_ACTS | - |
| notewrite | hypotheses | D/index.mjs:291 OP_FAMILIES; G/marks.mjs:130 ROWS; G/t33.mjs:120 T33_RUNG_ABSENT; G/t33.mjs:275 T33_NON_ACTS | - |
| noticepost | network-notices | D/index.mjs:1382 OPS_HAND; D/index.mjs:2063 NETWORK_NOTICES_ACTIONS; D/index.mjs:2065 NETWORK_NOTICES_BY; G/index.mjs:358 RUNGS_DATA; G/index.mjs:1481 NON_ACTS_DATA | - |
| noticeprepare | network-notices | D/index.mjs:1381 OPS_HAND; D/index.mjs:2064 NETWORK_NOTICES_READS; D/index.mjs:2065 NETWORK_NOTICES_BY; G/index.mjs:1485 NON_ACTS_DATA; G/marks.mjs:131 ROWS | - |
| objectivecondition | intent | D/index.mjs:1187 OPS_HAND; D/index.mjs:1955 INTENT_ACTIONS; D/index.mjs:2706 ACT_HELP_ABSENT; G/index.mjs:566 RUNGS_DATA; G/index.mjs:1370 NON_ACTS_DATA | - |
| obscuremark | case-carriage | D/index.mjs:522 OP_FAMILIES; G/t37.mjs:47 T37_NON_ACTS; G/t38.mjs:17 T38_RUNGS | - |
| obscuremarkwithdraw | case-carriage | D/index.mjs:522 OP_FAMILIES; G/t38.mjs:14 T38_RUNGS; G/t38.mjs:22 T38_NON_ACTS | - |
| officesseed | instance-setup | D/index.mjs:447 OP_FAMILIES; G/marks.mjs:132 ROWS; G/t33.mjs:153 T33_RUNG_ABSENT; G/t33.mjs:369 T33_NON_ACTS | - |
| openoriginal | file-safety | D/index.mjs:507,511 OP_FAMILIES; G/marks.mjs:133 ROWS; G/t36.mjs:47 T36_RUNG_ABSENT; G/t36.mjs:75 T36_NON_ACTS | - |
| openwithwarning | file-safety | D/index.mjs:507,511 OP_FAMILIES; G/marks.mjs:134 ROWS; G/t36.mjs:48 T36_RUNG_ABSENT; G/t36.mjs:78 T36_NON_ACTS; G/t36.mjs:119 T36_CONSEQUENCE_STATEMENTS | - |
| optionadd | action-plans | D/index.mjs:1325 OPS_HAND; D/index.mjs:2023 ACTION_PLANS_ACTIONS; G/index.mjs:784 RUNG_ABSENT_DATA; G/index.mjs:1438 NON_ACTS_DATA | - |
| optionadopt | action-plans | D/index.mjs:1328 OPS_HAND; D/index.mjs:2024 ACTION_PLANS_ACTIONS; G/index.mjs:786 RUNG_ABSENT_DATA; G/index.mjs:1441 NON_ACTS_DATA | - |
| optiondispose | action-plans | D/index.mjs:1329 OPS_HAND; D/index.mjs:2024 ACTION_PLANS_ACTIONS; G/index.mjs:453 RUNGS_DATA; G/index.mjs:1442 NON_ACTS_DATA | - |
| optionstart | action-plans | D/index.mjs:1332 OPS_HAND; D/index.mjs:2024 ACTION_PLANS_ACTIONS; G/index.mjs:788 RUNG_ABSENT_DATA; G/index.mjs:1445 NON_ACTS_DATA | - |
| optionstartpreview | action-plans | D/index.mjs:1336 OPS_HAND; D/index.mjs:2031 ACTION_PLANS_PREVIEWS; G/index.mjs:1450 NON_ACTS_DATA; G/marks.mjs:135 ROWS | - |
| pagetranscribe | extraction | D/index.mjs:601 OP_FAMILIES; G/t42.mjs:16 T42_RUNG_ABSENT; G/t42.mjs:21 T42_NON_ACTS | - |
| passwordreset | credentials | D/t47.mjs:20,22 T47_SHARES; G/marks.mjs:136 ROWS; G/t47.mjs:50 T47_RUNG_ABSENT; G/t47.mjs:70 T47_NON_ACTS | - |
| passwordresetlink | credentials | D/t47.mjs:21 T47_SHARES; G/marks.mjs:137 ROWS; G/t47.mjs:49 T47_RUNG_ABSENT; G/t47.mjs:68 T47_NON_ACTS | - |
| pdfstructure | extraction | D/index.mjs:958 OPS_HAND; G/marks.mjs:138 ROWS | - |
| personexpunge | people | D/index.mjs:275 OP_FAMILIES; G/index.mjs:1577 IRREVERSIBLE_WEIGHT; G/t33.mjs:50 T33_RUNGS; G/t33.mjs:246 T33_NON_ACTS; G/t35.mjs:132 T35_CONSEQUENCE_STATEMENTS | - |
| placewanted | instance-setup | D/index.mjs:449 OP_FAMILIES; G/marks.mjs:139 ROWS; G/t34.mjs:42 T34_RUNG_ABSENT; G/t34.mjs:69 T34_NON_ACTS | - |
| planask | action-plans | D/t48.mjs:50 T48_SHARES; G/t48.mjs:39 T48_RUNGS; G/t48.mjs:93 T48_NON_ACTS | - |
| planclose | action-plans | D/index.mjs:1337 OPS_HAND; D/index.mjs:2025 ACTION_PLANS_ACTIONS; G/index.mjs:454 RUNGS_DATA; G/index.mjs:1446 NON_ACTS_DATA | - |
| planopen | action-plans | D/index.mjs:1322 OPS_HAND; D/index.mjs:2023 ACTION_PLANS_ACTIONS; G/index.mjs:1435 NON_ACTS_DATA; G/t50.mjs:24 T50_RUNGS | - |
| plansubjectadd | action-plans | D/index.mjs:1323 OPS_HAND; D/index.mjs:2023 ACTION_PLANS_ACTIONS; G/index.mjs:450 RUNGS_DATA; G/index.mjs:1436 NON_ACTS_DATA | - |
| procedureguides | reading-guides | D/index.mjs:2130 PLAN_RUN_SCOPE; D/t45.mjs:31 T45_SHARES; G/marks.mjs:140 ROWS; G/t45.mjs:135 T45_NON_ACTS | - |
| profilesset | instance-setup | D/index.mjs:1364 OPS_HAND; D/index.mjs:2369,2452 SESSION_OPS; G/index.mjs:674 RUNG_ABSENT_DATA; G/index.mjs:1230 NON_ACTS_DATA; G/marks.mjs:141 ROWS | - |
| progression | progressions | D/index.mjs:1164 OPS_HAND; D/index.mjs:2179 PROGRESSION_ACTIONS; G/marks.mjs:142 ROWS | - |
| progressiondefine | progressions | D/index.mjs:1163 OPS_HAND; D/index.mjs:2179 PROGRESSION_ACTIONS; G/index.mjs:563 RUNGS_DATA; G/index.mjs:1091 NON_ACTS_DATA | - |
| projectaccountremove | ai-accounts | D/t48.mjs:78 T48_FAMILIES; G/marks.mjs:143 ROWS; G/t41.mjs:68 T41_RUNG_ABSENT; G/t41.mjs:117 T41_NON_ACTS | - |
| projectaccountswitch | ai-accounts | D/t48.mjs:78 T48_FAMILIES; G/marks.mjs:144 ROWS; G/t41.mjs:70 T41_RUNG_ABSENT; G/t41.mjs:118 T41_NON_ACTS | - |
| projectaikeepaway | ai-accounts | D/t48.mjs:79 T48_FAMILIES; G/t41.mjs:29 T41_RUNGS; G/t41.mjs:122 T41_NON_ACTS | - |
| projectbarset | strength | D/index.mjs:998 OPS_HAND; D/index.mjs:1639 DECLARATION_ACTIONS; G/t47.mjs:32 T47_RUNGS; G/t47.mjs:61 T47_NON_ACTS | - |
| projectclose | investigation | G/marks.mjs:145 ROWS | - |
| projectfork | promotion | D/index.mjs:718 OPS_HAND; D/index.mjs:1691 PROJECT_ACTIONS; G/index.mjs:549 RUNGS_DATA; G/index.mjs:1188 NON_ACTS_DATA | - |
| projectinvite | membership | D/index.mjs:712 OPS_HAND; D/index.mjs:1690 PROJECT_ACTIONS; G/index.mjs:723 RUNG_ABSENT_DATA; G/marks.mjs:146 ROWS | - |
| projectjoin | membership | D/index.mjs:713 OPS_HAND; D/index.mjs:1690 PROJECT_ACTIONS; G/index.mjs:724 RUNG_ABSENT_DATA; G/marks.mjs:147 ROWS | - |
| projectkeynoticeseen | ai-accounts | D/t48.mjs:79 T48_FAMILIES; G/marks.mjs:148 ROWS; G/t41.mjs:75 T41_RUNG_ABSENT; G/t41.mjs:121 T41_NON_ACTS | - |
| projectkeyset | ai-accounts | D/t47.mjs:59 REAUTH_ACTS; D/t48.mjs:78 T48_FAMILIES; G/marks.mjs:149 ROWS; G/t41.mjs:66 T41_RUNG_ABSENT; G/t41.mjs:115 T41_NON_ACTS | - |
| projectleave | membership | D/index.mjs:714 OPS_HAND; D/index.mjs:1690 PROJECT_ACTIONS; G/index.mjs:725 RUNG_ABSENT_DATA; G/marks.mjs:150 ROWS | - |
| projectowneradd | project-roster | D/index.mjs:716 OPS_HAND; D/index.mjs:1691 PROJECT_ACTIONS; G/index.mjs:732 RUNG_ABSENT_DATA; G/marks.mjs:151 ROWS | - |
| projectownerremove | project-roster | D/index.mjs:717 OPS_HAND; D/index.mjs:1691 PROJECT_ACTIONS; G/index.mjs:401 RUNGS_DATA | - |
| projectownerrescue | project-roster | D/index.mjs:721 OPS_HAND; D/index.mjs:1692 PROJECT_ACTIONS; G/index.mjs:402 RUNGS_DATA | - |
| projectremove | membership | D/index.mjs:715 OPS_HAND; D/index.mjs:1690 PROJECT_ACTIONS; G/index.mjs:731 RUNG_ABSENT_DATA; G/marks.mjs:152 ROWS | - |
| projectrequest | project-roster | D/index.mjs:733 OPS_HAND; D/index.mjs:1697 PROJECT_ACTIONS; G/index.mjs:728 RUNG_ABSENT_DATA; G/index.mjs:1196 NON_ACTS_DATA; G/marks.mjs:153 ROWS | - |
| projectrequestanswer | project-roster | D/index.mjs:735 OPS_HAND; D/index.mjs:1697 PROJECT_ACTIONS; G/index.mjs:730 RUNG_ABSENT_DATA; G/index.mjs:1198 NON_ACTS_DATA; G/marks.mjs:154 ROWS | - |
| projectrequestwithdraw | project-roster | D/index.mjs:734 OPS_HAND; D/index.mjs:1697 PROJECT_ACTIONS; G/index.mjs:729 RUNG_ABSENT_DATA; G/index.mjs:1197 NON_ACTS_DATA; G/marks.mjs:155 ROWS | - |
| projectsigninset | ai-accounts | D/t47.mjs:59 REAUTH_ACTS; D/t48.mjs:78 T48_FAMILIES; G/marks.mjs:156 ROWS; G/t41.mjs:67 T41_RUNG_ABSENT; G/t41.mjs:116 T41_NON_ACTS | - |
| projectstakeset | project-roster | D/t50.mjs:35 T50_SHARES; G/t50.mjs:19 T50_RUNGS; G/t50.mjs:43 T50_NON_ACTS | - |
| projectvisibilityset | membership | D/index.mjs:725 OPS_HAND; D/index.mjs:1694 PROJECT_ACTIONS; G/index.mjs:500 RUNGS_DATA | - |
| promote | promotion | D/index.mjs:917 OPS_HAND; D/index.mjs:2183,2386 SESSION_OPS; G/index.mjs:650 RUNG_ABSENT_DATA; G/index.mjs:933 NON_ACTS_DATA; G/marks.mjs:157 ROWS | - |
| provenanceroute | provenance-routes | D/index.mjs:980 OPS_HAND; D/index.mjs:1806 PROVENANCE_JUDGEMENT_ACTIONS; D/index.mjs:2710 ACT_HELP_ABSENT; G/index.mjs:677 RUNG_ABSENT_DATA; G/index.mjs:1363 NON_ACTS_DATA; G/marks.mjs:158 ROWS | - |
| publish | case-authoring | D/index.mjs:155,192 OP_KINDS; D/index.mjs:988 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; G/index.mjs:379 RUNGS_DATA; G/index.mjs:867 MACHINE_REFUSALS_DATA | - |
| publishatcancel | publish-schedule | D/index.mjs:477 OP_FAMILIES; G/index.mjs:620 RUNGS_DATA; G/index.mjs:1544 NON_ACTS_DATA | - |
| publishpreflight | case-authoring | D/index.mjs:993 OPS_HAND; D/index.mjs:1799 PUBLISH_SCREEN_OPS; G/index.mjs:1132 NON_ACTS_DATA; G/marks.mjs:162 ROWS | - |
| publishtensions | case-authoring | D/index.mjs:990 OPS_HAND; D/index.mjs:1799 PUBLISH_SCREEN_OPS; G/index.mjs:1007 NON_ACTS_DATA; G/marks.mjs:163 ROWS | - |
| reattest | capture | D/index.mjs:1041 OPS_HAND; D/index.mjs:1777 CAPTURE_MEMBER_ACTIONS; D/index.mjs:2711 ACT_HELP_ABSENT; G/index.mjs:353 RUNGS_DATA; G/index.mjs:1106 NON_ACTS_DATA | - |
| reauth | credentials | D/t47.mjs:18,21 T47_SHARES; G/marks.mjs:168 ROWS; G/t47.mjs:47 T47_RUNG_ABSENT; G/t47.mjs:67 T47_NON_ACTS | - |
| reconcile | money | D/index.mjs:104 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/marks.mjs:169 ROWS; G/t34.mjs:85 OP_ALIASES | - |
| recordcheck | workbooks | D/index.mjs:105 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/t34.mjs:86 OP_ALIASES | - |
| recorddatedfact | events | D/index.mjs:102 OP_ALIASES; D/index.mjs:2634 ACT_HELP_ABSENT; G/marks.mjs:170 ROWS; G/t34.mjs:84 OP_ALIASES | - |
| recordfact | money | D/index.mjs:103 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/t34.mjs:84 OP_ALIASES | - |
| recordline | lines | D/index.mjs:106 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/t34.mjs:86 OP_ALIASES | - |
| recordpersonfact | people | D/index.mjs:96 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/t34.mjs:83 OP_ALIASES | - |
| recover | credentials | D/index.mjs:376,379 OP_FAMILIES; G/marks.mjs:171 ROWS; G/t35.mjs:47 T35_RUNG_ABSENT; G/t35.mjs:77 T35_NON_ACTS | - |
| recoverycodesissue | credentials | D/index.mjs:378 OP_FAMILIES; G/marks.mjs:172 ROWS; G/t35.mjs:46 T35_RUNG_ABSENT; G/t35.mjs:76 T35_NON_ACTS | - |
| reevaluationrecord | reevaluation | D/index.mjs:943 OPS_HAND; D/index.mjs:1962 REEVALUATION_ACTIONS; D/index.mjs:2712 ACT_HELP_ABSENT; G/index.mjs:422 RUNGS_DATA; G/index.mjs:1392 NON_ACTS_DATA | - |
| reevaluations | reevaluation | D/index.mjs:859 OPS_HAND; G/marks.mjs:173 ROWS | - |
| reinstate | citation | D/index.mjs:851 OPS_HAND; D/index.mjs:1581 EDGE_ACTIONS; D/index.mjs:1922 POSITIONAL_ACTS; G/index.mjs:391 RUNGS_DATA | - |
| relate | events | D/index.mjs:101 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/t34.mjs:84 OP_ALIASES | - |
| relationdeclare | entities | D/index.mjs:1144 OPS_HAND; D/index.mjs:1832 REGISTRY_ACTIONS; G/index.mjs:400 RUNGS_DATA; G/index.mjs:1078 NON_ACTS_DATA | - |
| release | ratification | D/index.mjs:811 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; G/index.mjs:387 RUNGS_DATA; G/index.mjs:863 MACHINE_REFUSALS_DATA | - |
| releasescanhold | file-safety | D/index.mjs:512 OP_FAMILIES; G/t36.mjs:31 T36_RUNGS; G/t36.mjs:83 T36_NON_ACTS | - |
| reminderanswer | action-clocks | D/index.mjs:1316 OPS_HAND; D/index.mjs:2022 ACTION_CLOCKS_ACTIONS; G/index.mjs:792 RUNG_ABSENT_DATA; G/index.mjs:1453 NON_ACTS_DATA; G/marks.mjs:174 ROWS | - |
| reminderset | action-clocks | D/index.mjs:1315 OPS_HAND; D/index.mjs:2022 ACTION_CLOCKS_ACTIONS; G/index.mjs:791 RUNG_ABSENT_DATA; G/index.mjs:908 MACHINE_REFUSALS_DATA; G/marks.mjs:175 ROWS | - |
| reopen | promotion | D/index.mjs:818 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; D/index.mjs:2712 ACT_HELP_ABSENT; G/index.mjs:394 RUNGS_DATA; G/index.mjs:866 MACHINE_REFUSALS_DATA | - |
| rerunpair | case-import | G/marks.mjs:176 ROWS | - |
| rerunread | case-import | G/marks.mjs:177 ROWS | - |
| rerunstart | case-import | G/marks.mjs:178 ROWS | - |
| resolutiondefect | entities | D/index.mjs:1150 OPS_HAND; D/index.mjs:1833 REGISTRY_ACTIONS; D/index.mjs:2713 ACT_HELP_ABSENT; G/index.mjs:440 RUNGS_DATA; G/index.mjs:995 NON_ACTS_DATA | - |
| resolve | entities | D/index.mjs:1155 OPS_HAND; D/index.mjs:2141 RECOGNISER_ACTIONS; G/index.mjs:559 RUNGS_DATA; G/index.mjs:1088 NON_ACTS_DATA | - |
| resolvetestify | entities | D/index.mjs:1156 OPS_HAND; D/index.mjs:2141 RECOGNISER_ACTIONS; G/index.mjs:560 RUNGS_DATA; G/index.mjs:1089 NON_ACTS_DATA | - |
| retire | ratification | D/index.mjs:808 OPS_HAND; D/index.mjs:1615 STATE_ACTIONS; G/index.mjs:367 RUNGS_DATA | - |
| reviewcomment | review | D/index.mjs:1020 OPS_HAND; D/index.mjs:1799 PUBLISH_SCREEN_OPS; G/index.mjs:537 RUNGS_DATA; G/t47.mjs:82 T47_NON_ACTS | - |
| reviewgrant | review | D/index.mjs:1017 OPS_HAND; D/index.mjs:1995 GRANT_SECRET_ACTIONS; D/index.mjs:2385,2457 SESSION_OPS; G/index.mjs:767 RUNG_ABSENT_DATA; G/index.mjs:1150 NON_ACTS_DATA; G/marks.mjs:180 ROWS | - |
| reviewrevoke | review | D/index.mjs:1018 OPS_HAND; D/index.mjs:2385,2457 SESSION_OPS; G/index.mjs:768 RUNG_ABSENT_DATA; G/index.mjs:1151 NON_ACTS_DATA; G/marks.mjs:181 ROWS | - |
| ruleanswer | answers | D/index.mjs:100 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/marks.mjs:183 ROWS; G/t34.mjs:82 OP_ALIASES | - |
| ruleconfirm | local-facts | D/t45.mjs:102 T45_FAMILIES; G/t45.mjs:84 T45_RUNG_ABSENT; G/t45.mjs:177 T45_NON_ACTS | - |
| ruledraft | local-facts | D/t45.mjs:102 T45_FAMILIES; G/t45.mjs:46 T45_RUNGS; G/t45.mjs:176 T45_NON_ACTS | - |
| rulewithdraw | local-facts | D/t45.mjs:102 T45_FAMILIES; G/t45.mjs:47 T45_RUNGS; G/t45.mjs:178 T45_NON_ACTS | - |
| runtime | instance-setup | D/index.mjs:959 OPS_HAND; G/marks.mjs:184 ROWS | - |
| safeview | file-safety | D/index.mjs:509 OP_FAMILIES; G/marks.mjs:185 ROWS; G/t36.mjs:95 T36_NON_ACTS | - |
| scenarioset | action-plans | D/index.mjs:1330 OPS_HAND; D/index.mjs:2024 ACTION_PLANS_ACTIONS; G/index.mjs:509 RUNGS_DATA; G/index.mjs:1443 NON_ACTS_DATA | - |
| search | retrieval | D/index.mjs:785 OPS_HAND; D/index.mjs:1552 RETRIEVAL_READS; G/marks.mjs:186 ROWS | - |
| secondlook | following | D/t50.mjs:23 T50_SHARES; G/t50.mjs:16 T50_RUNGS; G/t50.mjs:41 T50_NON_ACTS | - |
| secondlookclear | following | D/t50.mjs:23 T50_SHARES; G/t50.mjs:17 T50_RUNGS; G/t50.mjs:42 T50_NON_ACTS | - |
| securitymap | credentials | D/index.mjs:375,378 OP_FAMILIES; G/marks.mjs:187 ROWS; G/t35.mjs:83 T35_NON_ACTS; G/t48.mjs:52 T48_RUNG_ABSENT | weight hand caller-owned vs read; description differs (hand NON_ACTS) |
| securitytooladd | file-safety | D/index.mjs:514 OP_FAMILIES; G/marks.mjs:188 ROWS; G/t36.mjs:57 T36_RUNG_ABSENT; G/t36.mjs:85 T36_NON_ACTS | - |
| securitytoolremove | file-safety | D/index.mjs:514 OP_FAMILIES; G/marks.mjs:189 ROWS; G/t36.mjs:58 T36_RUNG_ABSENT; G/t36.mjs:87 T36_NON_ACTS | - |
| securitytooltest | file-safety | D/index.mjs:514 OP_FAMILIES; G/marks.mjs:190 ROWS; G/t36.mjs:60 T36_RUNG_ABSENT; G/t36.mjs:86 T36_NON_ACTS | - |
| select | retrieval | D/index.mjs:794 OPS_HAND; D/index.mjs:2311,2419 SESSION_OPS; G/index.mjs:740 RUNG_ABSENT_DATA; G/index.mjs:1179 NON_ACTS_DATA; G/marks.mjs:191 ROWS | - |
| selectionrelease | retrieval | D/index.mjs:797 OPS_HAND; D/index.mjs:2311,2419 SESSION_OPS; G/index.mjs:741 RUNG_ABSENT_DATA; G/index.mjs:1180 NON_ACTS_DATA; G/marks.mjs:192 ROWS | - |
| selftest | instance-setup | D/index.mjs:701 OPS_HAND; G/marks.mjs:193 ROWS | - |
| setpassword | credentials | D/index.mjs:376,380 OP_FAMILIES; G/marks.mjs:194 ROWS; G/t37.mjs:32 T37_RUNG_ABSENT; G/t37.mjs:49 T37_NON_ACTS | - |
| sever | citation | D/index.mjs:850 OPS_HAND; D/index.mjs:1581 EDGE_ACTIONS; D/index.mjs:1922 POSITIONAL_ACTS; G/index.mjs:390 RUNGS_DATA | - |
| signeradd | credentials | D/index.mjs:1465 OPS_HAND; D/index.mjs:1759 CUSTODIAL_ACTIONS; G/index.mjs:703 RUNG_ABSENT_DATA; G/index.mjs:1231 NON_ACTS_DATA; G/marks.mjs:195 ROWS | - |
| signerregisterown | credentials | D/index.mjs:95 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/marks.mjs:196 ROWS; G/t34.mjs:80 OP_ALIASES | - |
| signerrevokeown | credentials | D/index.mjs:95 OP_ALIASES; D/index.mjs:2635 ACT_HELP_ABSENT; G/marks.mjs:197 ROWS; G/t34.mjs:80 OP_ALIASES | - |
| signerset | credentials | D/index.mjs:1467 OPS_HAND; D/index.mjs:1759 CUSTODIAL_ACTIONS; G/index.mjs:704 RUNG_ABSENT_DATA; G/index.mjs:1232 NON_ACTS_DATA; G/marks.mjs:198 ROWS | - |
| signout | credentials | D/index.mjs:375,378 OP_FAMILIES; G/marks.mjs:199 ROWS; G/t35.mjs:43 T35_RUNG_ABSENT; G/t35.mjs:74 T35_NON_ACTS | - |
| signouteverywhere | credentials | D/index.mjs:375,378 OP_FAMILIES; G/marks.mjs:200 ROWS; G/t35.mjs:44 T35_RUNG_ABSENT; G/t35.mjs:75 T35_NON_ACTS | - |
| signrequest | tasks | D/t47.mjs:35 T47_SHARES; G/t47.mjs:40 T47_RUNGS; G/t47.mjs:75 T47_NON_ACTS | - |
| sourceconsent | sources | D/index.mjs:1061 OPS_HAND; D/index.mjs:1787 SOURCE_ACTIONS; D/index.mjs:2714 ACT_HELP_ABSENT; G/index.mjs:446 RUNGS_DATA | - |
| sourceconsentwithdraw | sources | D/index.mjs:1062 OPS_HAND; D/index.mjs:1787 SOURCE_ACTIONS; D/index.mjs:2714 ACT_HELP_ABSENT; G/index.mjs:506 RUNGS_DATA; G/index.mjs:1125 NON_ACTS_DATA | - |
| sourcedisclose | sources | D/index.mjs:1059 OPS_HAND; D/index.mjs:1787 SOURCE_ACTIONS; D/index.mjs:2714 ACT_HELP_ABSENT; G/index.mjs:444 RUNGS_DATA; G/index.mjs:1123 NON_ACTS_DATA | - |
| sourcelink | sources | D/index.mjs:1060 OPS_HAND; D/index.mjs:1787 SOURCE_ACTIONS; G/index.mjs:445 RUNGS_DATA; G/index.mjs:1124 NON_ACTS_DATA | - |
| sourcepersonlink | people | D/index.mjs:275 OP_FAMILIES; D/index.mjs:2714 ACT_HELP_ABSENT; G/t33.mjs:53 T33_RUNGS; G/t33.mjs:249 T33_NON_ACTS | - |
| spotcheckvisit | calculations | D/index.mjs:301,307 OP_FAMILIES; G/t36.mjs:28 T36_RUNGS; G/t36.mjs:68 T36_NON_ACTS | - |
| standardadopt | standards | D/index.mjs:1208 OPS_HAND; D/index.mjs:1967 STANDARDS_ACTIONS; G/index.mjs:570 RUNGS_DATA; G/index.mjs:1401 NON_ACTS_DATA | - |
| standarddeclare | standards | D/index.mjs:1206 OPS_HAND; D/index.mjs:1967 STANDARDS_ACTIONS; G/index.mjs:569 RUNGS_DATA; G/index.mjs:1399 NON_ACTS_DATA | - |
| standardinforce | standards | D/index.mjs:1211 OPS_HAND; D/index.mjs:1968 STANDARDS_READS; G/marks.mjs:201 ROWS; G/t33.mjs:378 T33_NON_ACTS | - |
| standingquestionend | answers | D/index.mjs:100 OP_ALIASES; D/index.mjs:2636 ACT_HELP_ABSENT; G/marks.mjs:202 ROWS; G/t34.mjs:83 OP_ALIASES | - |
| standingquestionset | answers | D/index.mjs:100 OP_ALIASES; D/index.mjs:2636 ACT_HELP_ABSENT; G/marks.mjs:203 ROWS; G/t34.mjs:82 OP_ALIASES | - |
| statementack | case-inputs | D/index.mjs:1023 OPS_HAND; D/index.mjs:1799 PUBLISH_SCREEN_OPS; G/index.mjs:578 RUNGS_DATA; G/t47.mjs:81 T47_NON_ACTS | - |
| stepsource | connections | D/t48.mjs:63 T48_FAMILIES; G/t48.mjs:42 T48_RUNGS; G/t48.mjs:95 T48_NON_ACTS | - |
| stepsourcewithdraw | connections | D/t48.mjs:63 T48_FAMILIES; G/t48.mjs:43 T48_RUNGS; G/t48.mjs:97 T48_NON_ACTS | - |
| strengthbarset | strength | D/index.mjs:99 OP_ALIASES; D/index.mjs:2636 ACT_HELP_ABSENT; G/t34.mjs:82 OP_ALIASES | - |
| subscriptiondisconnect | ai-accounts | D/t48.mjs:77 T48_FAMILIES; G/marks.mjs:205 ROWS; G/t35.mjs:63 T35_RUNG_ABSENT; G/t35.mjs:122 T35_NON_ACTS | - |
| successrecord | consequences | D/t45.mjs:87 T45_FAMILIES; G/t45.mjs:77 T45_RUNG_ABSENT; G/t45.mjs:137 T45_NON_ACTS | - |
| suggest | run-productions | D/index.mjs:1445 OPS_HAND; D/index.mjs:1871 AI_RUN_ACTIONS; D/index.mjs:1914 RUN_PRODUCTION_ACTIONS; G/index.mjs:525 RUNGS_DATA; G/index.mjs:1332 NON_ACTS_DATA | - |
| sweepratify | link-sweep | G/marks.mjs:207 ROWS | - |
| sweeps | link-sweep | D/index.mjs:1375 OPS_HAND; D/index.mjs:2052 LINK_SWEEP_READS; D/index.mjs:2671 ACT_HELP_ABSENT; G/index.mjs:1484 NON_ACTS_DATA; G/marks.mjs:208 ROWS | weight hand read vs reversible |
| sweepset | link-sweep | G/marks.mjs:209 ROWS | - |
| tabledeclare | calculations | D/index.mjs:302 OP_FAMILIES; G/t33.mjs:123 T33_RUNG_ABSENT; G/t33.mjs:279 T33_NON_ACTS | - |
| taskdecide | tasks | G/marks.mjs:210 ROWS | - |
| taskforward | tasks | D/index.mjs:754 OPS_HAND; D/index.mjs:1846 TASK_ACTIONS; G/index.mjs:538 RUNGS_DATA; G/index.mjs:1242 NON_ACTS_DATA | - |
| taskresolve | tasks | D/index.mjs:755 OPS_HAND; D/index.mjs:1846 TASK_ACTIONS; G/index.mjs:539 RUNGS_DATA; G/index.mjs:1243 NON_ACTS_DATA | - |
| templatesave | filings | D/index.mjs:1262 OPS_HAND; D/index.mjs:1976 FILINGS_ACTIONS; D/index.mjs:2721 ACT_HELP_ABSENT; G/index.mjs:777 RUNG_ABSENT_DATA; G/index.mjs:1423 NON_ACTS_DATA | - |
| testify | provenance | D/index.mjs:1111 OPS_HAND; D/index.mjs:2292,2403 SESSION_OPS; G/index.mjs:551 RUNGS_DATA; G/index.mjs:1026 NON_ACTS_DATA | - |
| themedeclare | connections | D/index.mjs:1126 OPS_HAND; D/index.mjs:2302,2411 SESSION_OPS; G/index.mjs:542 RUNGS_DATA; G/index.mjs:1043 NON_ACTS_DATA | - |
| themeplace | connections | D/index.mjs:1127 OPS_HAND; D/index.mjs:2302,2411 SESSION_OPS; G/index.mjs:543 RUNGS_DATA; G/index.mjs:1044 NON_ACTS_DATA | - |
| themepropose | connections | D/index.mjs:1128 OPS_HAND; D/index.mjs:2302,2411 SESSION_OPS; G/index.mjs:528 RUNGS_DATA; G/index.mjs:1045 NON_ACTS_DATA | - |
| themeread | connections | D/index.mjs:1129 OPS_HAND; D/index.mjs:2304,2413 SESSION_OPS; G/index.mjs:1058 NON_ACTS_DATA; G/marks.mjs:211 ROWS | - |
| themewithdraw | connections | D/index.mjs:1131 OPS_HAND; D/index.mjs:2306,2414 SESSION_OPS; G/index.mjs:408 RUNGS_DATA; G/index.mjs:1057 NON_ACTS_DATA | - |
| thread | progressions | D/index.mjs:1167 OPS_HAND; D/index.mjs:2180 PROGRESSION_ACTIONS; G/index.mjs:540 RUNGS_DATA; G/index.mjs:1092 NON_ACTS_DATA | - |
| transcribe | content | D/index.mjs:1107 OPS_HAND; D/index.mjs:2290,2402 SESSION_OPS; G/index.mjs:552 RUNGS_DATA; G/index.mjs:1019 NON_ACTS_DATA | - |
| transcriptionattest | content | D/index.mjs:1108 OPS_HAND; D/index.mjs:2290,2402 SESSION_OPS; D/index.mjs:2722 ACT_HELP_ABSENT; G/index.mjs:557 RUNGS_DATA; G/index.mjs:1020 NON_ACTS_DATA | - |
| translationadopt | translations | D/index.mjs:451 OP_FAMILIES; G/t37.mjs:22 T37_RUNGS; G/t37.mjs:57 T37_NON_ACTS | - |
| translationconfirm | translations | D/index.mjs:451 OP_FAMILIES; G/t37.mjs:23 T37_RUNGS; G/t37.mjs:58 T37_NON_ACTS | - |
| translationgrant | translations | D/index.mjs:451 OP_FAMILIES; G/marks.mjs:213 ROWS; G/t37.mjs:36 T37_RUNG_ABSENT; G/t37.mjs:53 T37_NON_ACTS | - |
| translationrevert | translations | D/index.mjs:452 OP_FAMILIES; G/t37.mjs:24 T37_RUNGS; G/t37.mjs:59 T37_NON_ACTS | - |
| triage | intent | D/index.mjs:1202 OPS_HAND; D/index.mjs:1956 INTENT_ACTIONS; D/index.mjs:2722 ACT_HELP_ABSENT; G/index.mjs:421 RUNGS_DATA; G/index.mjs:1385 NON_ACTS_DATA | - |
| unlock | credentials | D/t47.mjs:17,21 T47_SHARES; G/marks.mjs:214 ROWS; G/t47.mjs:46 T47_RUNG_ABSENT; G/t47.mjs:66 T47_NON_ACTS | - |
| updatelater | instance-setup | D/t48.mjs:33 T48_SHARES; G/t48.mjs:35 T48_RUNGS; G/t48.mjs:77 T48_NON_ACTS | - |
| updateskip | instance-setup | D/t48.mjs:33 T48_SHARES; G/t48.mjs:31 T48_RUNGS; G/t48.mjs:74 T48_NON_ACTS | - |
| updatestart | instance-setup | D/t48.mjs:33 T48_SHARES; G/t48.mjs:36 T48_RUNGS; G/t48.mjs:80 T48_NON_ACTS | - |
| verify | public-read | D/index.mjs:1481 OPS_HAND; G/marks.mjs:215 ROWS | - |
| versionaccept | basis-versions | D/index.mjs:827 OPS_HAND; D/index.mjs:1688 VERSION_ACTIONS; G/index.mjs:497 RUNGS_DATA; G/index.mjs:881 MACHINE_REFUSALS_DATA | - |
| versionconsider | basis-versions | D/index.mjs:829 OPS_HAND; D/index.mjs:1688 VERSION_ACTIONS; G/index.mjs:472 RUNGS_DATA; G/index.mjs:883 MACHINE_REFUSALS_DATA | - |
| versioncurrent | basis-versions | D/index.mjs:831 OPS_HAND; D/index.mjs:1689 VERSION_ACTIONS; D/index.mjs:1922 POSITIONAL_ACTS; G/index.mjs:498 RUNGS_DATA; G/index.mjs:885 MACHINE_REFUSALS_DATA | - |
| versionhide | basis-versions | D/index.mjs:832 OPS_HAND; D/index.mjs:1689 VERSION_ACTIONS; G/index.mjs:492 RUNGS_DATA; G/index.mjs:886 MACHINE_REFUSALS_DATA | - |
| versionnotice | reevaluation | D/index.mjs:935 OPS_HAND; D/index.mjs:2287,2401 SESSION_OPS; G/index.mjs:1011 NON_ACTS_DATA; G/marks.mjs:216 ROWS | - |
| versionreject | basis-versions | D/index.mjs:828 OPS_HAND; D/index.mjs:1688 VERSION_ACTIONS; G/index.mjs:471 RUNGS_DATA; G/index.mjs:882 MACHINE_REFUSALS_DATA | - |
| versionrevert | basis-versions | D/index.mjs:830 OPS_HAND; D/index.mjs:1689 VERSION_ACTIONS; G/index.mjs:491 RUNGS_DATA; G/index.mjs:884 MACHINE_REFUSALS_DATA | - |
| watchitem | following | D/t50.mjs:23 T50_SHARES; G/t50.mjs:14 T50_RUNGS; G/t50.mjs:40 T50_NON_ACTS | - |
| websitekeycreate | member-roster | D/index.mjs:464 OP_FAMILIES; G/marks.mjs:217 ROWS; G/t34.mjs:20 T34_RUNG_ABSENT; G/t34.mjs:49 T34_NON_ACTS | - |
| whatchangedpropose | case-inputs | D/index.mjs:1280 OPS_HAND; D/index.mjs:2057 WHAT_CHANGED_PROPOSAL_ACTIONS; G/index.mjs:810 RUNG_ABSENT_DATA; G/index.mjs:1480 NON_ACTS_DATA | - |
| withdrawconclusion | basis-versions | D/index.mjs:816 OPS_HAND; D/index.mjs:1616 STATE_ACTIONS; D/index.mjs:1923 POSITIONAL_ACTS; G/index.mjs:393 RUNGS_DATA; G/index.mjs:865 MACHINE_REFUSALS_DATA | - |
| withdrawidentityclaim | people | D/index.mjs:97 OP_ALIASES; D/index.mjs:2636 ACT_HELP_ABSENT; G/t34.mjs:83 OP_ALIASES | - |
| withdrawimported | citation | G/marks.mjs:218 ROWS | - |
| withdrawtie | people | D/index.mjs:96 OP_ALIASES; D/index.mjs:2636 ACT_HELP_ABSENT; G/t34.mjs:81 OP_ALIASES | - |

## Declared ops with no hand row anywhere

- `expertisewithdraw` (member-roster)

## Hand rows that look superseded, op not declared (keep)

The 65 arms of `control-plane/owner-ops.mjs` (C/) whose op no module declares, by the owner service each calls. No declared op has an arm here yet, so the pass has nothing to delete in this file today; these arms are the route for ops whose owner exports a service and no arm, and stay until their owner declares them.

- `aiUse`: aiestimate (:27), aiactual (:30)
- `aiRuns`: stepsrunai (:33), grouptestset (:34), grouptestresults (:35)
- `caseAccount`: accountpropose (:38), accountdrafts (:39)
- `review`: approvalruleset (:41), caseapprove (:42), reviewcomments (:44)
- `actionClocks`: clockpropose (:50)
- `filings`: approvedunsent (:55)
- `actionPlans`: checkpointsdue (:56)
- `legEarning`: projectsshownon (:59)
- `capture`: captureupload (:66), capturestepproduct (:71)
- `steps`: stepcreate (:79), stepstart (:80), stepend (:81), stepdelete (:82), steprefer (:83), stepproduct (:84), stepwait (:85), stepwaitremove (:86), stepreminder (:87), stepcostadd (:88), stepcostremove (:89), costmessage (:90), questionfollow (:91), stepaccept (:92), stepoutcome (:93), steplearn (:94), stepbywhen (:95), stepslike (:98), stepproposals (:99), costmessages (:100), questionfollowstate (:101), stepproducts (:102), recordsteps (:103), steps (:106)
- `investigation`: milestoneset (:117), milestonerevise (:118), milestoneremove (:119), milestoneitemremove (:120), milestonereminder (:121), reportkeep (:122), interviewkeep (:123), narrativeclaim (:124), claimfindstep (:125), claimfound (:126), planaccept (:127), projectwatch (:128), projectclosewithgaps (:129), milestones (:132), reportdraft (:133), reports (:134), interview (:135), interviewform (:136), claims (:137), investigationproposals (:138), quietstate (:139), projectstanding (:140)
- `questionExplorer`: findaccept (:146), findmute (:147), finddoors (:149)

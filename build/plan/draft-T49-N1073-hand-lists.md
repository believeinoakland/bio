# Draft T49: N1073, the tests that hand-list another module's items (K3268)

**Status** · A worker's census for BOB #173 (read-only scan of `tranche/T48` @ L9's start), 2026-10-14. Heuristic: a literal holding 2+ items of one foreign owner (op owner = the module whose `*Ops()` returns it; row owner = the src declaring `check: 'C-x.y'`; words owner = the src declaring the key). About 120 files over 37 modules, ~3,100 items (~2,800 ops, ~230 rows, words in 3 files); ~105 further files with 1–4 items left out. op-grades, affordances, op-declarations and control-plane hold ~80%.

**Use (BOB's, P19, K3268):** the fix is per module, applied when that module's own entry next touches it, never a sweep; the four registries (op-grades, affordances, op-declarations, control-plane) first need a way to assemble their lists from each module's own declaration (N1074's service index), so their entries wait on N1074.

| tests (under `bio-plane/test/m/<module>/` unless shown) · count | module | hand-lists items of | kind |
|---|---|---|---|
| module-order:27-100 (~150) | membership | every module | module ids |
| grant:77 (17); rows-ops:90 (24) | credentials | entities, standards, money, lines, events, duties; ai-accounts | ops |
| write-path:171 (6) | promotion | basis-versions | rows |
| knocker:240 (9) | capture | doorbell | rows |
| grammar:177 (7) | inquiry | inquiry-grammar | rows |
| table:59 (8) | run-rules | observation-log | rows |
| rows:12 (26) | ai-runs | run-rules | rows |
| filing:11 (5); wizard:12 (5) | skills | filing-templates; wizard-scripts | ops |
| scope:23 (17) | answers | entities, standards, money +3 | ops |
| agent-harness/test/agent-harness:393 (5) | agent-harness | ai-runs, action-plans | ops |
| agent-worker/test/ harness:128, plan:293, requirements:1369, t36:94 (33) | agent-worker | ai-runs, capture, action-plans | ops |
| invariants:126 (34) | case-authoring | case-disclosures, case-inputs | rows |
| records:138 (12) | action-records | action-grammar | rows |
| library:86, t47:42, writing-help:23 (46) | wizard-scripts | ai-accounts, instance-setup, credentials, ratification +4 | ops |
| ladder, owners, pins, t35–t47 (~750) | op-grades | ~40 modules | ops |
| t33, catalogue, t36, t34, backing, derive, … (~710) | affordances | ~30 modules | ops |
| t45:399, t46:164 (12) | action-producers | escalation, actions, action-holds, plan-work, action-plans | ops |
| feeditems:253 (8) | queue-producers | wizard-scripts, publish-schedule, docket | ops |
| contradictions:50 (6) | queue | contradiction | ops |
| word-list:130 (4) | setup-words | membership | words |
| tables, t23–t47 (~420) | op-declarations | ~25 modules | ops |
| admission:172, doors:13, namespaces:54, t47:18 (39) | admission | membership, ai-accounts, instance-setup, credentials, ai-runs | ops |
| families:236 (43) | answer-envelope | case-disclosures, law-relations, link-sweep | rows |
| dispatch:270, routes:41 (19) | store-door | file-safety, action-holds, plan-work; sources | ops |
| kit:398, session:210, frame:51 (32) | interface-shell | instance-setup, ratification, file-safety; setup-words | ops; words |
| common:80, setup:88 (18) | screens-entry | credentials, membership, instance-setup, ai-accounts | ops |
| library:26, page:12 (13) | screens-wizards | wizard-scripts | ops |
| account, group, members, security, translations (37) | screens-settings | instance-setup, membership, credentials, ai-accounts, ai-use, file-safety | ops; words |
| common:121 (14) | screens-intake | file-safety, instance-setup, ai-accounts | ops |
| contract:123 (7) | screens-daily | queue, tasks, project-roster | ops |
| common:23, projectai:39, question:65 (22) | screens-inquiry | ai-accounts, ai-use, citation, basis-versions | ops |
| common:23 (12) | screens-investigate | standards, people, money +3 | ops |
| common:17 (8) | screens-publish | review, docket, case-import | ops |
| matter:39 (5) | screens-action | escalation | ops |
| envelope, r53-routes, t41-door, … 18 files (~270) | control-plane | admission, answer-envelope, membership, ai-accounts, ai-use, wizard-scripts, file-safety… | ops, rows |
| t41:124, t47, roster, accepted, t42, … (~95) | plane | ai-use, signin-door, credentials, project-roster, case-import, doorbell, local-facts, … | ops |
| civicos-ui/test/members-roster:193, project-workspace:210 (15) | legacy-ui | membership, credentials, project-roster | ops (retires with legacy-ui) |

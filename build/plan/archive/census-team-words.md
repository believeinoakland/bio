# Census: "group" in text people read (K3472 "team"; K3803)

Branch tranche/T50, taken 2026-10-18. Method: every string and template literal in each product module's `paths` (build/modules.json; legacy-ui `civicos-ui/` and all tests excluded; generated `dist/` bundles excluded, they rebuild from src) was parsed with acorn, and every line holding `\bgroups?\b` was classified; HTML/markdown/JSON files were read line by line. Comments were separated by the parser and only counted.

## Summary

- **Human-facing hits: 1233** lines in 115 modules. By route: 880 inline in source; 194 check-row `translation` strings (inline copies of a refusal sentence); 11 entries of a module's own word table (dotted key); 148 in generated files whose source is the design lane's.
- **words.json already carries the "team" form** of 522 of these hits (a 50-character window around the hit, group->team, found in words.json). For those the module is a stale copy: the fix is the inline edit to match the design's `en`, no design key needed. The other 711 have no team twin in words.json (the sentence is the module's own wording or was never a design key).
- **Excluded, counted:** comments 1581 lines; identifiers/keys/values with no prose (`"group"`, `screen.group.name`, `group:` owners, ops, routes) 835; SQL (GROUP BY, SQL comments, 'group' column values) 152; regex "group" (link-sweep, jurisdictions part template, roster word list, court-citations) 18; operation-grade descriptions in op-grades (`is`/`where` documentation, not shown to anyone) 106; non-shipped docs/data (DEPLOY.md, fleet-member.json note, vendored reporters-db) 8.
- **"group" in the collection sense** (a set of reasons or rows, not the organisation) 28 lines, listed in section B: the ruling is about the organisation, so these likely stay, but BOB should confirm; the design lane's words.json uses "group of reasons" in the same sense.
- **Needs a design key (design lane's words.json / library.json / sign page owner):** setup-words (24 lines, all generated from words.json; see the design-lane list below), wizard-scripts (129 lines, generated from the design's library.json, 29 "group" lines there plus older versions), plus 2 keyed lines in action-producers/words.mjs and the other keyed entries listed in section A. Everything else is inline and the module's own job (1074 lines), 'translation' rows with a team twin in words.json first.
- Known cases confirmed: instance-setup `setup-fleet.mjs` (10 lines: HOSTING_CONTROL sentences, N1238) and `setup.mjs` (39 lines, detail/note/where strings); file-scanner `providers/catalogue.mjs` 4; duties `checks.mjs` 4 (incl. :31); case-carriage `checks.mjs` 5 (incl. :28-34). Tests were excluded as asked; a rough count of stale-looking test lines: membership 16, capture-requests 19, agent-runner 0 (these will go red or be rewritten once the source says team).
- Generated copies to rebuild after source fixes: `bio-plane/src/signpage.mjs` (from `sign-release.html`, by `scripts/embed-signpage.mjs`), `bio-plane/public/newgroup/` and `newgroup/dist/` (installer), `agent-worker/dist/`, `pdf-worker/dist/`, `setup-words/rows.mjs` (from words.json), `wizard-scripts/civicsmith-library.mjs` (from library.json).
- Dependency note: each `translation` that has a team twin in words.json must be edited to equal that `en` exactly (modules' tests compare them).

### Count per module (human-facing)

| module | total | inline | check translation | own word table | generated from design | words.json already says team |
|---|---|---|---|---|---|---|
| wizard-scripts | 129 | 7 | 10 | 0 | 112 | 94 |
| instance-setup | 49 | 49 | 0 | 0 | 0 | 22 |
| agent-worker | 38 | 38 | 0 | 0 | 0 | 6 |
| skills | 37 | 37 | 0 | 0 | 0 | 1 |
| case-authoring | 30 | 28 | 2 | 0 | 0 | 19 |
| record-core | 29 | 2 | 27 | 0 | 0 | 28 |
| strength | 26 | 21 | 5 | 0 | 0 | 16 |
| capture-requests | 25 | 15 | 10 | 0 | 0 | 16 |
| credentials | 25 | 13 | 12 | 0 | 0 | 13 |
| capture-sources | 24 | 21 | 3 | 0 | 0 | 18 |
| setup-words | 24 | 0 | 0 | 0 | 24 | 0 |
| signatures | 24 | 12 | 0 | 0 | 12 | 18 |
| action-grammar | 23 | 11 | 12 | 0 | 0 | 11 |
| case-grammar | 22 | 22 | 0 | 0 | 0 | 18 |
| ai-accounts | 21 | 21 | 0 | 0 | 0 | 6 |
| membership | 21 | 21 | 0 | 0 | 0 | 1 |
| doorbell | 20 | 7 | 13 | 0 | 0 | 17 |
| stewards | 20 | 20 | 0 | 0 | 0 | 2 |
| case-disclosures | 19 | 15 | 4 | 0 | 0 | 15 |
| filing-templates | 19 | 9 | 10 | 0 | 0 | 12 |
| queue-producers | 19 | 19 | 0 | 0 | 0 | 8 |
| case-checker | 18 | 18 | 0 | 0 | 0 | 5 |
| bias | 17 | 12 | 5 | 0 | 0 | 14 |
| public-read | 16 | 16 | 0 | 0 | 0 | 3 |
| review | 16 | 10 | 6 | 0 | 0 | 9 |
| inquiry-grammar | 15 | 11 | 4 | 0 | 0 | 3 |
| ratification | 15 | 9 | 6 | 0 | 0 | 10 |
| record-grammar | 15 | 15 | 0 | 0 | 0 | 13 |
| acquisition | 14 | 14 | 0 | 0 | 0 | 3 |
| actions | 14 | 14 | 0 | 0 | 0 | 5 |
| answer-envelope | 14 | 1 | 13 | 0 | 0 | 14 |
| inquiry | 14 | 14 | 0 | 0 | 0 | 0 |
| intent | 13 | 6 | 7 | 0 | 0 | 9 |
| conformance | 12 | 9 | 3 | 0 | 0 | 5 |
| interface-assets | 12 | 12 | 0 | 0 | 0 | 0 |
| run-rules | 12 | 3 | 9 | 0 | 0 | 11 |
| file-safety | 11 | 11 | 0 | 0 | 0 | 9 |
| local-facts | 11 | 11 | 0 | 0 | 0 | 5 |
| standards | 11 | 7 | 4 | 0 | 0 | 9 |
| network-notices | 10 | 4 | 6 | 0 | 0 | 9 |
| queue | 10 | 10 | 0 | 0 | 0 | 0 |
| reading-guides | 10 | 10 | 0 | 0 | 0 | 0 |
| reevaluation | 10 | 10 | 0 | 0 | 0 | 6 |
| ai-use | 9 | 9 | 0 | 0 | 0 | 0 |
| case-carriage | 9 | 6 | 0 | 3 | 0 | 9 |
| contradiction | 9 | 9 | 0 | 0 | 0 | 4 |
| promotion | 9 | 9 | 0 | 0 | 0 | 1 |
| steps | 9 | 8 | 1 | 0 | 0 | 4 |
| agent-runner | 8 | 8 | 0 | 0 | 0 | 5 |
| accepted-work | 8 | 6 | 2 | 0 | 0 | 4 |
| action-producers | 8 | 6 | 0 | 2 | 0 | 3 |
| ai-runs | 8 | 8 | 0 | 0 | 0 | 0 |
| citation | 8 | 6 | 2 | 0 | 0 | 2 |
| escalation | 8 | 4 | 3 | 1 | 0 | 8 |
| action-clocks | 7 | 6 | 1 | 0 | 0 | 7 |
| basis-versions | 7 | 6 | 1 | 0 | 0 | 2 |
| calibration | 7 | 7 | 0 | 0 | 0 | 6 |
| filings | 7 | 7 | 0 | 0 | 0 | 0 |
| leg-earning | 7 | 7 | 0 | 0 | 0 | 5 |
| notice-producers | 7 | 7 | 0 | 0 | 0 | 6 |
| provenance | 7 | 5 | 2 | 0 | 0 | 7 |
| site | 7 | 7 | 0 | 0 | 0 | 1 |
| admission | 6 | 6 | 0 | 0 | 0 | 0 |
| case-inputs | 6 | 5 | 0 | 1 | 0 | 4 |
| civil-time | 6 | 6 | 0 | 0 | 0 | 3 |
| consequences | 6 | 5 | 0 | 1 | 0 | 1 |
| docket | 6 | 3 | 3 | 0 | 0 | 5 |
| duties | 6 | 5 | 0 | 1 | 0 | 4 |
| installer | 5 | 5 | 0 | 0 | 0 | 0 |
| answers | 5 | 5 | 0 | 0 | 0 | 3 |
| case-catalogue | 5 | 5 | 0 | 0 | 0 | 0 |
| interface-shell | 5 | 5 | 0 | 0 | 0 | 0 |
| observation-log | 5 | 5 | 0 | 0 | 0 | 4 |
| publication | 5 | 3 | 2 | 0 | 0 | 2 |
| entities | 4 | 4 | 0 | 0 | 0 | 0 |
| monitoring | 4 | 2 | 2 | 0 | 0 | 3 |
| reading-pipeline | 4 | 4 | 0 | 0 | 0 | 4 |
| signin-door | 4 | 2 | 0 | 2 | 0 | 2 |
| store-door | 4 | 4 | 0 | 0 | 0 | 1 |
| file-scanner | 4 | 4 | 0 | 0 | 0 | 0 |
| calculations | 3 | 3 | 0 | 0 | 0 | 2 |
| case-import | 3 | 3 | 0 | 0 | 0 | 0 |
| journey-check | 3 | 3 | 0 | 0 | 0 | 0 |
| tasks | 3 | 3 | 0 | 0 | 0 | 2 |
| agent-model | 2 | 2 | 0 | 0 | 0 | 0 |
| action-holds | 2 | 1 | 1 | 0 | 0 | 1 |
| action-records | 2 | 2 | 0 | 0 | 0 | 0 |
| case-tensions | 2 | 0 | 2 | 0 | 0 | 2 |
| connections | 2 | 2 | 0 | 0 | 0 | 0 |
| content | 2 | 2 | 0 | 0 | 0 | 1 |
| explore | 2 | 2 | 0 | 0 | 0 | 2 |
| extraction | 2 | 2 | 0 | 0 | 0 | 1 |
| investigation | 2 | 2 | 0 | 0 | 0 | 2 |
| plane | 2 | 2 | 0 | 0 | 0 | 0 |
| provenance-routes | 2 | 2 | 0 | 0 | 0 | 0 |
| publish-schedule | 2 | 2 | 0 | 0 | 0 | 0 |
| screens-action | 2 | 2 | 0 | 0 | 0 | 0 |
| screens-settings | 2 | 2 | 0 | 0 | 0 | 0 |
| sources | 2 | 2 | 0 | 0 | 0 | 2 |
| runtime-limits | 2 | 2 | 0 | 0 | 0 | 2 |
| workbooks | 2 | 2 | 0 | 0 | 0 | 2 |
| action-plans | 1 | 1 | 0 | 0 | 0 | 0 |
| capture | 1 | 1 | 0 | 0 | 0 | 1 |
| events | 1 | 1 | 0 | 0 | 0 | 0 |
| following | 1 | 1 | 0 | 0 | 0 | 0 |
| host-governor | 1 | 1 | 0 | 0 | 0 | 0 |
| op-declarations | 1 | 1 | 0 | 0 | 0 | 0 |
| people | 1 | 1 | 0 | 0 | 0 | 0 |
| plan-work | 1 | 0 | 1 | 0 | 0 | 1 |
| project-roster | 1 | 1 | 0 | 0 | 0 | 0 |
| screens-entry | 1 | 1 | 0 | 0 | 0 | 0 |
| screens-inquiry | 1 | 1 | 0 | 0 | 0 | 0 |
| screens-investigate | 1 | 1 | 0 | 0 | 0 | 0 |
| screens-publish | 1 | 1 | 0 | 0 | 0 | 0 |
| screens-wizards | 1 | 1 | 0 | 0 | 0 | 0 |
| **all** | **1233** | 880 | 194 | 11 | 148 | 522 |

Comment lines with the word, by module (excluded): instance-setup 88, strength 49, ai-accounts 48, filings 43, op-declarations 36, membership 33, inquiry 32, screens-settings 32, agent-worker 31, op-capabilities 31, case-import 29, ai-runs 28, reading-guides 27, control-plane 26, op-grades 24, wizard-scripts 24, installer 24, acquisition 23, case-grammar 23, affordances 22, case-disclosures 22, public-read 22, local-facts 22, record-grammar 22, skills 22, promotion 21, action-clocks 20, journey-check 20, actions 19, queue-producers 19, ratification 19, capture-sources 18, queue 18, credentials 17, plane 17, ai-use 16, intent 16, standards 15, action-grammar 14, admission 14, query-language 14, reevaluation 14, screens-daily 14, basis-versions 13, bias 13, case-authoring 13, entities 13, signatures 12, action-producers 12, filing-templates 12, capture-requests 11, following 11, publication 11, question-explorer 11, run-rules 11, screens-entry 11, jurisdictions 11, network-notices 10, record-core 10, screens-action 9, screens-investigate 9, bundler 8, calculations 8, escalation 8, inquiry-grammar 8, screens-publish 8, file-scanner 8, conformance 7, consequences 7, docket 7, monitoring 7, review 7, answers 6, case-carriage 6, corpus-export 6, duties 6, file-safety 6, money-checks 6, notice-producers 6, events 5, interface-shell 5, odf-reader 5, provenance-routes 5, screens-wizards 5, runtime-limits 5, action-records 4, calc-grammar 4, calibration 4, case-catalogue 4, case-checker 4, case-tensions 4, money 4, reading-pipeline 4, run-productions 4, scheduler 4, screens-inquiry 4, steps 4, doctypes 4, agent-model 3, accepted-work 3, action-plans 3, connections 3, doorbell 3, leg-earning 3, plan-work 3, progressions 3, provenance 3, publish-schedule 3, store-door 3, tasks 3, translations 3, site 3, action-holds 2, action-replies 2, capture 2, citation 2, hypotheses 2, investigation 2, lines 2, project-roster 2, screens-intake 2, docprofile 2, image-codecs 2, stewards 2, agent-harness 1, agent-runner 1, answer-envelope 1, case-inputs 1, content 1, contradiction 1, explore 1, id-spaces 1, law-relations 1, observation-log 1, people 1, office-readers 1, retrieval 1, signin-door 1, sources 1, budget-doctypes 1, ocr-worker 1.

## A. Human-facing hits by module

Format: `file:line` "text around the word" [route] (`T` = words.json already holds the team form).

### wizard-scripts (129)

- bio-plane/src/wizard-scripts/build-data.mjs:44 "* with the release, read-only to every group, each version authored by the Civicsmith library; three req…" [inline]
- bio-plane/src/wizard-scripts/checks.mjs:70 "Only an approved script is made group-wide, and this version is not the script's approved one." [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:74 "… approves or retires it, and an administrator makes it group-wide or" [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:75 "approves and retires a group-wide one. You are not the one who does this here." [check-row translation (inline copy)]
- bio-plane/src/wizard-scripts/checks.mjs:87 "…brary, shipped with the release and read-only to every group. A" [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:88 "group cannot edit, retire or withdraw it; it may write its own." [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:117 "your group's Civicsmith registers, and this one is none of them." [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:148 "The advanced editor is granted to a member of the group, and the one named is not one." [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:176 "…rst: it works only from what you tell it and what your group" [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:181 "…said something you did not tell the assistant and your group's record" [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/checks.mjs:187 "group holds." [check-row translation (inline copy)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Choose your group's short name, then install. It is not the group's name: you…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…es and beside every signature, and can never change. A group that wants to stay unnamed picks one that reveals nothing." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Let your group's Civicsmith test itself. Allow it to run the assistant's c…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Name the group as people should read it, and add its logo if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "The group's name heads everything it publishes and can change at any …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If your group has a website, verify its address (optional): place the sma…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…n confirm that a published case really comes from your group. The public page names the site, so a group that wants to s…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Read who in the group will see facts about people." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…e about this if you want the detail), then choose: the group's API key, members' own accounts, both, or none." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "The group's key serves members with no account of their own, at the g…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If you chose the group's key: paste it here. It is never shown again." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…ir first question, that it goes to Anthropic under the group's account." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "A court order your group cannot defeat can require anything not public to be shown. …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If you are ever unreachable, this is how the group gets back in." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "With one administrator the group depends on one person. A second means it is never stuck." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Optional: say who your group is. You will come back here when you finish or stop." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Choose your group's short name, then install. It is not the group's name: you…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…es and beside every signature, and can never change. A group that wants to stay unnamed picks one that reveals nothing." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Let your group's Civicsmith test itself. Allow it to run the assistant's c…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Name the group as people should read it, and add its logo if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "The group's name heads everything it publishes and can change at any …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If your group has a website, verify its address (optional): place the sma…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…n confirm that a published case really comes from your group. The public page names the site, so a group that wants to s…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Read who in the group will see facts about people." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "… this for the detail), then choose whether to keep the group's material away from AI." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If the group will pay for the assistant, paste its Anthropic API key her…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…ir first question, that it goes to Anthropic under the group's account. Leave it empty and members bring their own." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "A court order your group cannot defeat can require anything not public to be shown. …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If you are ever unreachable, this is how the group gets back in." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "With one administrator the group depends on one person. A second means it is never stuck." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Optional: say who your group is. You will come back here when you finish or stop." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Choose your group's short name, then install. It is not the group's name: you…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…es and beside every signature, and can never change. A group that wants to stay unnamed picks one that reveals nothing." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Let your group's Civicsmith test itself. Allow it to run the assistant's c…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Name the group as people should read it, and add its logo if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "The group's name heads everything it publishes and can change at any …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If your group has a website, verify its address (optional): place the sma…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…n confirm that a published case really comes from your group. The public page names the site, so a group that wants to s…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Read who in the group will see facts about people." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "… this for the detail), then choose whether to keep the group's material away from AI." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If the group will pay for the assistant, paste its Anthropic API key her…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…ir first question, that it goes to Anthropic under the group's account. Leave it empty and members bring their own." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "A court order your group cannot defeat can require anything not public to be shown. …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If you are ever unreachable, this is how the group gets back in." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "With one administrator the group depends on one person. A second means it is never stuck." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Optional: say who your group is. You will come back here when you finish or stop." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Choose your group's short name, then install. It is not the group's name: you…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…es and beside every signature, and can never change. A group that wants to stay unnamed picks one that reveals nothing." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Your group's Civicsmith tests itself as part of installing; the finish…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Name the group as people should read it, and add its logo if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "The group's name heads everything it publishes and can change at any …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If your group has a website, verify its address (optional): place the sma…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…n confirm that a published case really comes from your group. The public page names the site, so a group that wants to s…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Read who in the group will see facts about people." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "… this for the detail), then choose whether to keep the group's material away from AI." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If the group will pay for the assistant, paste its Anthropic API key her…" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "…ir first question, that it goes to Anthropic under the group's account. Leave it empty and members bring their own." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "A court order your group cannot defeat can require anything not public to be shown. …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "If you are ever unreachable, this is how the group gets back in." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "With one administrator the group depends on one person. A second means it is never stuck." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:27 "Optional: say who your group is. You will come back here when you finish or stop." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:28 "This is your group's home: what it is working on, and what is waiting on you." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:28 "Optional: tell the group about your own ties." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:29 "Read the group's declared bias as it will appear." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:29 "…em obscured and says so; the original stays inside the group." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:29 "Read the group's declared bias as it will appear." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:29 "…em obscured and says so; the original stays inside the group." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:29 "Read the group's declared bias as it will appear." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:30 "… first: is the record already public? Search what your group holds and where the office publishes." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:30 "Choose the law the request goes under, from your group's places." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:30 "Sending tells the office what your group is looking at. Recording the send starts the clock." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:33 "What kind of group are you? Pick one or more, or describe your own." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:33 "Why does the group exist? Say it in your own words." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:33 "Members only is the default. A group that wants to stay unnamed keeps it that way." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:34 "Who: their handle, and the cover the group knows them by. Not a legal name." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:34 "Anyone let through can see the group's shared work, so each comes with limits and a daily cap." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:34 "Who: a short id for the invitation, and the cover the group knows them by. Not a legal name." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:34 "Anyone let through can see the group's shared work, so each comes with limits and a daily cap." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:35 "Choose Update if you hold your group's Cloudflare account. If not, copy the link and pass it to …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:35 "…n by the account's holder, lets a new release in. Your group's Civicsmith cannot rewrite itself." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:35 "If a step stops, your group's Civicsmith keeps running as it was; the stop says what to…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "The assistant is optional. If your group offers its API key, you can use it already; your own accoun…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "…each day. An administrator may set a lower one for the group." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "Disconnecting removes the key or token from your group's Civicsmith." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "The assistant is optional. If your group offers its API key, you can use it already; your own accoun…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "It binds only your own account. The group's and a project's limits never bind it." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "Disconnecting removes the key or token from your group's Civicsmith." [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "The assistant is optional. If your group offers its API key, you can use it already; your own accoun…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "It binds only your own account. The group's and a project's limits never bind it." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:36 "Disconnecting removes the sign-in or the key from your group's Civicsmith." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:37 "…hem: naming you by your handle, or as “a member of the group”." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:42 "Another group's work stays marked as theirs, and cannot be edited." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:43 "Civicsmith's own translations come with releases. Your group fills gaps and improves wording." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:43 "A word becomes the group's only when a granted member who knows the language keeps i…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:44 "Choose "For the group" or "As myself", then write what the record shows and what …" [DESIGN-GENERATED (library.json via build-data.mjs)]
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:44 "A comment for the group is the group's act. One as yourself is your own notes, neve…" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:44 "A comment for the group states facts and asks. A position is a member's to take as …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:44 "The record keeps what the group said, and when." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:45 "…nd what correcting it would look like. Start from your group's demand template if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:45 "… sentence pointed out as asking for something for your group." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:45 "A demand asks nothing for the group. Approval waits until those sentences are gone." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:46 "If your group is stopping, stop pursuing it, with your reason." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:47 "…ened and ask the body to look into it. Start from your group's referral template if it has one." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:47 "A confidential action is seen inside the group and never published." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "The words that leave the group are always a member's." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "This tells the office what your group is looking at, and starts the clock." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "Prepare what is sent: start from your group's template for this kind of action if it has one, or write …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "The words that leave the group are always a member's." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "This tells the office what your group is looking at, and starts the clock." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "Prepare what is sent: start from your group's template for this kind of action if it has one, or write …" [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "The words that leave the group are always a member's." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/civicsmith-library.mjs:49 "This tells the office what your group is looking at, and starts the clock." [DESIGN-GENERATED (library.json via build-data.mjs)] T
- bio-plane/src/wizard-scripts/data.mjs:54 "Comment for the group" [inline] T
- bio-plane/src/wizard-scripts/data.mjs:58 "Update your group's Civicsmith" [inline] T
- bio-plane/src/wizard-scripts/index.mjs:488 "a Civicsmith script is read-only to every group: groups cannot edit or retire it" [inline]
- bio-plane/src/wizard-scripts/index.mjs:1091 "an administrator makes a script group-wide" [inline]
- bio-plane/src/wizard-scripts/index.mjs:1101 "an administrator approves a group-wide script" [inline]
- bio-plane/src/wizard-scripts/index.mjs:1186 "an administrator retires a group-wide script" [inline]

### instance-setup (49)

- bio-plane/src/setup-fleet.mjs:27 "Before you choose a password: who controls your group's Civicsmith" [inline] T
- bio-plane/src/setup-fleet.mjs:29 "Whoever can sign in to the hosting account your group's Civicsmith runs in (its Cloudflare account) controls it." [inline] T
- bio-plane/src/setup-fleet.mjs:31 "and no vote of the group's administrators can stop them." [inline] T
- bio-plane/src/setup-fleet.mjs:32 "Use a group account for it, not anyone's personal login." [inline] T
- bio-plane/src/setup-fleet.mjs:34 "Where possible, let someone other than the group's administrators hold it." [inline] T
- bio-plane/src/setup-fleet.mjs:36 "your group's Civicsmith to be claimed again." [inline] T
- bio-plane/src/setup-fleet.mjs:40 "password” in your group's Civicsmith, on its first page and in its members and keys…" [inline] T
- bio-plane/src/setup-fleet.mjs:48 "value in this worker's settings, and your group's Civicsmith can be claimed again." [inline] T
- bio-plane/src/setup-fleet.mjs:56 "Your group's administrators can help you: ask one of them for a reset …" [inline] T
- bio-plane/src/setup-fleet.mjs:57 "If none of them can sign in either, whoever holds your group's hosting account can open the way back in for them." [inline] T
- bio-plane/src/setup.mjs:810 "no producing group is recorded for this store. A store records it once: at its…" [inline]
- bio-plane/src/setup.mjs:813 "name its producing group is given no default: a caller's own statement of its group …" [inline]
- bio-plane/src/setup.mjs:1066 "the request names no slug, and a group is recorded as" [inline]
- bio-plane/src/setup.mjs:1072 "this store has recorded its producing group since" [inline]
- bio-plane/src/setup.mjs:1080 "…very document this store writes from now on names this group. Documents already written are" [inline] T
- bio-plane/src/setup.mjs:1081 "NOT rewritten: whatever group their bytes name is what they were signed under." [inline] T
- bio-plane/src/setup.mjs:1111 "setting the group's display name or claiming its domain is an administrator's…" [inline]
- bio-plane/src/setup.mjs:1112 "your group's Civicsmith stamps who is asking from the signed-in sessio…" [inline]
- bio-plane/src/setup.mjs:1184 "this store records no producing group, so there is no slug for the file to name" [inline]
- bio-plane/src/setup.mjs:1235 "names your group's Civicsmith (" [inline]
- bio-plane/src/setup.mjs:1238 "is not the JSON object your group's Civicsmith reads ({ instance, group })" [inline]
- bio-plane/src/setup.mjs:1239 "and the group" [inline] T
- bio-plane/src/setup.mjs:1240 "; your group's Civicsmith is" [inline]
- bio-plane/src/setup.mjs:1320 "declaring what your group has at stake" [inline]
- bio-plane/src/setup.mjs:1339 "no stake is declared from now on: what your group sends or publishes says it has declared none." [inline] T
- bio-plane/src/setup.mjs:1341 "carried beside your group's public identity on everything it sends or publishes from …" [inline] T
- bio-plane/src/setup.mjs:1365 "setting your group's logo" [inline]
- bio-plane/src/setup.mjs:1379 "shown beside your group's name on its page, its masthead and its published cases fr…" [inline] T
- bio-plane/src/setup.mjs:1380 "no logo from now on: your group's name stands alone." [inline] T
- bio-plane/src/setup.mjs:1412 "setting the languages your group's members use" [inline]
- bio-plane/src/setup.mjs:1479 ", which your group's Civicsmith does not hold" [inline] T
- bio-plane/src/setup.mjs:1508 "no active profile: your group's Civicsmith reads no local facts, which is valid, and ever…" [inline]
- bio-plane/src/setup.mjs:1549 "…isdiction profiles is an administrator's act, and your group's Civicsmith stamps who is asking from the" [inline]
- bio-plane/src/setup.mjs:1558 "your group's Civicsmith holds no profile" [inline] T
- bio-plane/src/setup.mjs:2059 "whether your group keeps its material away from every assistant could not be r…" [inline]
- bio-plane/src/setup.mjs:2072 "whether your group keeps its material away from every assistant did not answer…" [inline]
- bio-plane/src/setup.mjs:2156 "naming the place your group works in" [inline]
- bio-plane/src/setup.mjs:2181 "the name is kept only in your group's Civicsmith and sent nowhere. When an installed update bri…" [inline] T
- bio-plane/src/setup.mjs:2188 "reading the place your group named" [inline]
- bio-plane/src/setup.mjs:2374 "asking the assistant to draft your group's description" [inline]
- bio-plane/src/setup.mjs:2393 "the assistant could not serve a draft of the group's description, so" [inline]
- bio-plane/src/setup.mjs:2416 "…l you edit it and keep it, and then the words are your group's." [inline] T
- bio-plane/src/setup.mjs:2633 "reading the updates of your group's Civicsmith" [inline]
- bio-plane/src/setup.mjs:2664 "the updates of your group's Civicsmith" [inline]
- bio-plane/src/setup.mjs:2684 "the updates of your group's Civicsmith" [inline]
- bio-plane/src/setup.mjs:2716 "choosing to update your group's Civicsmith" [inline]
- bio-plane/src/setup.mjs:2723 "nothing is installed by this: whoever holds your group's hosting account installs it, through Cloudflare's own con…" [inline] T
- bio-plane/src/setup.mjs:2729 "setting aside an update of your group's Civicsmith" [inline]
- bio-plane/src/setup.mjs:2757 "skipping an update of your group's Civicsmith" [inline]

### agent-worker (38)

- agent-worker/src/action-drafts.mjs:194 "group's or its members' own benefit (own_benefit_ask), or a name …" [inline]
- agent-worker/src/action-drafts.mjs:200 "Take no position, ask nothing for the group's own benefit, never say what to file or that anyone has a …" [inline]
- agent-worker/src/action-drafts.mjs:228 "a text check reads nothing of what the group holds, only the text it is asked about; a grant to read was…" [inline]
- agent-worker/src/action-drafts.mjs:231 "…m the items handed to it and reads nothing of what the group holds; a grant" [inline]
- agent-worker/src/action-drafts.mjs:233 "this draft reads what the group holds only for a field that does not record what the member…" [inline]
- agent-worker/src/action-drafts.mjs:261 "You help one member of a BIO group with an action they are preparing. Your draft is labelled m…" [inline]
- agent-worker/src/cascade.mjs:80 "the group's API key" [inline] T
- agent-worker/src/cascade.mjs:87 "An administrator sets a new key for the group, or members connect their own." [inline]
- agent-worker/src/cascade.mjs:89 "…new one; until then the member's own account, else the group's API key," [inline]
- agent-worker/src/cascade.mjs:90 "serves them only while your group's Civicsmith holds it and it is on." [inline]
- agent-worker/src/cascade.mjs:91 "The member connects a new one; until then the group's API key serves them only while your group's" [inline]
- agent-worker/src/cascade.mjs:95 "group's Civicsmith's to answer (the project's, else the member's …" [inline]
- agent-worker/src/draft.mjs:144 "what the group works on, in the administrator's own terms" [inline]
- agent-worker/src/draft.mjs:145 "why the group exists, in the administrator's own terms" [inline]
- agent-worker/src/draft.mjs:179 "draft of the group's description ({op: groupdescriptiondraft}), or a draft of …" [inline]
- agent-worker/src/draft.mjs:185 "group's writing translated into a member's language ({op: readtra…" [inline]
- agent-worker/src/draft.mjs:198 "a draft of the group's description works from the administrator's answers: a lis…" [inline]
- agent-worker/src/draft.mjs:212 "a draft reads what the group holds only when the member's own suggestions switch is on, …" [inline]
- agent-worker/src/draft.mjs:236 "You draft words for one member of a BIO group, in their own field, from what they told you. Your" [inline]
- agent-worker/src/draft.mjs:243 "You may read what the group holds through the read tool, under the member's grant. Add …" [inline]
- agent-worker/src/draft.mjs:251 "TASK: draft the group's description, its focus and its purpose, from the administ…" [inline]
- agent-worker/src/draft.mjs:351 "the group's wording only by a granted member's own act of keeping or …" [inline]
- agent-worker/src/draft.mjs:384 "a translation draft reads nothing of what the group holds; a grant to read was sent with it, so nothing was" [inline]
- agent-worker/src/draft.mjs:402 "You draft interface words for a BIO group. Your draft is labelled machine work, nothing is saved," [inline]
- agent-worker/src/draft.mjs:403 "and it becomes the group's wording only by a granted member's own act. The instructi…" [inline]
- agent-worker/src/draft.mjs:447 "passage stays the group's own words" [inline]
- agent-worker/src/draft.mjs:474 "a translation of the group's writing reads nothing of what the group holds, only the p…" [inline]
- agent-worker/src/draft.mjs:491 "You translate a passage of a BIO group's own writing for one member, into the language they read." [inline]
- agent-worker/src/index.mjs:443 "the group's API key, serving that member" [inline]
- agent-worker/src/index.mjs:1922 "(the group's account an API key only)," [inline]
- agent-worker/src/index.mjs:2161 "the group's API key" [inline] T
- agent-worker/src/index.mjs:2346 "… own reference or sign-in, a project's account, or the group's API key) arrives with the call and the mode of the run (/…" [inline]
- agent-worker/src/signin.mjs:96 "Your group's Civicsmith cannot connect a Claude account yet: the part …" [inline] T
- agent-worker/src/signin.mjs:98 "Your group's Civicsmith could not read this sign-in request, so nothin…" [inline] T
- agent-worker/src/signin.mjs:100 "Your group's Civicsmith could not tell whose sign-in this is, so nothi…" [inline] T
- agent-worker/src/signin.mjs:102 "Your group's Civicsmith did not recognise this sign-in step, so nothin…" [inline]
- agent-worker/src/signin.mjs:106 "Your group's Civicsmith could not reach the part that runs your Claude…" [inline] T
- agent-worker/src/transcribe.mjs:79 "You transcribe one scanned page for a BIO group. Copy the words visible on the page," [inline]

### skills (37)

- bio-plane/src/skilldoctrine.mjs:498 "citation through op=versionchain and groups by the address the record answers with, so its" [inline]
- bio-plane/src/skilldoctrine.mjs:792 "A member takes every act that commits the group: declaring a standard, determining, assessing a consequence…" [inline]
- bio-plane/src/skilldoctrine.mjs:802 "…rds request, a request for comment), and enforcing the group's own request on its own dated record are" [inline]
- bio-plane/src/skilldoctrine.mjs:804 "A sentence that asserts a breach as the group's finding needs a live noncompliant determination." [inline]
- bio-plane/src/skilldoctrine.mjs:814 "What the group sends is checked against its record." [inline]
- bio-plane/src/skilldoctrine.mjs:819 "…dy rest on findings of the three kinds in §3 or on the group's own dated correspondence;" [inline]
- bio-plane/src/skilldoctrine.mjs:820 "statements about what the group itself is doing need neither." [inline]
- bio-plane/src/skilldoctrine.mjs:831 "…e matter, the routes the profile's guides list and the group's own" [inline]
- bio-plane/src/skilldoctrine.mjs:838 "or another civic group by role, or a described audience; never a private individua…" [inline]
- bio-plane/src/skilldoctrine.mjs:846 "…d be, and does not rule on policy even when members or groups" [inline]
- bio-plane/src/skilldoctrine.mjs:878 "… that answers a hostile response; pressure against the group or its supporters is" [inline]
- bio-plane/src/skilldoctrine.mjs:881 "…el may be briefed at any stage, for a claim or for the group's defence, without a determination" [inline]
- bio-plane/src/skilldoctrine.mjs:905 "What the group chose changes only by a member's act." [inline]
- bio-plane/src/skilldoctrine.mjs:914 "…en for a particular audience (the violating party, the group's members, an oversight" [inline]
- bio-plane/src/skilldoctrine.mjs:919 "…m would look like, with the law's period or a time the group sets." [inline]
- bio-plane/src/skilldoctrine.mjs:925 "… is prepared that asks anything for the benefit of the group or its" [inline]
- bio-plane/src/skilldoctrine.mjs:1136 "The signed statement is the group's, adopted by a member, and the record keeps that it began …" [inline]
- bio-plane/src/skilldoctrine.mjs:1187 "…ed apart and labelled as machine work, and becomes the group's statement" [inline]
- bio-plane/src/skilldoctrine.mjs:1308 "the group's rules from its reads, jurisdiction rules from the profile…" [inline]
- bio-plane/src/skilldoctrine.mjs:1545 "… works only from what the member tells it and what the group holds, never adds a fact (for an" [inline]
- bio-plane/src/skilldoctrine.mjs:1558 "it may also draw on what the group holds (rule 7)." [inline]
- bio-plane/src/skilldoctrine.mjs:1606 "the group's description" [inline] T
- bio-plane/src/skilldoctrine.mjs:1660 "the group's own local words are its to translate as ordinary words." [inline]
- bio-plane/src/skilldoctrine.mjs:1667 "word beside the group's language, gaps marked; the assistant drafts the missing o…" [inline]
- bio-plane/src/skilldoctrine.mjs:1683 "so cases read the same from group to group." [inline]
- bio-plane/src/skilldoctrine.mjs:1741 "the interface words a group's language lacks through, so this layer carries no doctrine…" [inline]
- bio-plane/src/skilldoctrine.mjs:1745 "… a language asks for drafts of the interface words the group's translation of it lacks," [inline]
- bio-plane/src/skilldoctrine.mjs:1761 "account serves the member, whether the group keeps the assistant away, which member is granted a languag…" [inline]
- bio-plane/src/skilldoctrine.mjs:1763 "apart, labelled as machine work, and becomes the group's wording only by a granted member's act. A run" [inline]
- bio-plane/src/skilldoctrine.mjs:1860 "serve it. It becomes the group's only by a member's own acts, which refuse a machine. A ru…" [inline]
- bio-plane/src/skilldoctrine.mjs:1886 "The group's own writing (notes, questions, findings, notices) can be …" [inline]
- bio-plane/src/skilldoctrine.mjs:1925 "which a member asks to read the group's own writing in her language, so this layer carries no doc…" [inline]
- bio-plane/src/skilldoctrine.mjs:1981 "…this render: a procedure guide is the profile's or the group's," [inline]
- bio-plane/src/skilldoctrine.mjs:2007 "a procedure guide lists the routes the profile or the group knows for one kind of action, in its order and" [inline]
- bio-plane/src/skilldoctrine.mjs:2096 "The AI may read a document the group holds a few pages at a time, within a reading limit, and ne…" [inline]
- bio-plane/src/skilldoctrine.mjs:2182 "the run reads inside a document the group holds, a few pages at a time, or writes a note beside a sou…" [inline]
- bio-plane/src/skilldoctrine.mjs:2246 "…eading guide was passed to this render: a guide is the group's or Civicsmith's, read for the" [inline]

### case-authoring (30)

- bio-plane/src/case-authoring/checks.mjs:27 "Publishing puts the group's name on a case, together with an assertion that it" [check-row translation (inline copy)] T
- bio-plane/src/case-authoring/checks.mjs:47 "…ng finding rests on gives a different result when your group's Civicsmith" [check-row translation (inline copy)] T
- bio-plane/src/case-authoring/document.mjs:98 "…is an adoption in this scope whose pinned revision the group had proposed and not" [inline] T
- bio-plane/src/case-authoring/document.mjs:417 ", group '" [inline]
- bio-plane/src/case-authoring/document.mjs:433 "project override(s) named a LOCKED group-wide statement and were" [inline] T
- bio-plane/src/case-authoring/document.mjs:434 "refused their effect; the group-wide statement stands in the set hashed above." [inline] T
- bio-plane/src/case-authoring/document.mjs:439 "adopted for the group or this project. That is stated, not left blank — it is a d…" [inline] T
- bio-plane/src/case-authoring/document.mjs:445 "in this scope pinned a revision the group had proposed and not accepted. It was not in force at" [inline] T
- bio-plane/src/case-authoring/document.mjs:522 "…nput typed in with no source, is disclosed here by the group and does not stop" [inline] T
- bio-plane/src/case-authoring/document.mjs:529 "Disclosed by the group:" [inline] T
- bio-plane/src/case-authoring/document.mjs:540 "…is case claims nothing about what happened or what the group did." [inline] T
- bio-plane/src/case-authoring/document.mjs:550 "…was published. What happened in the world and what the group did are two lists and are never" [inline] T
- bio-plane/src/case-authoring/document.mjs:556 "of the group's own act(s) were not marked public by the record that hold…" [inline] T
- bio-plane/src/case-authoring/index.mjs:140 "This project has a public notice that the group is working on it, so publishing" [inline] T
- bio-plane/src/case-authoring/index.mjs:150 "they may be republished, copyright included, is the group's." [inline] T
- bio-plane/src/case-authoring/index.mjs:474 "… a calculation that gives a different result when your group's Civicsmith recomputes it, or on" [inline] T
- bio-plane/src/case-authoring/index.mjs:577 "publishing puts the group's name on a case. A machine credential may prepare one and" [inline]
- bio-plane/src/case-authoring/index.mjs:626 "declare the group's position on putting this case to its subject. The gate is…" [inline]
- bio-plane/src/case-authoring/index.mjs:633 "refuse. Say why — including why the group chose not to give notice — and a reader" [inline]
- bio-plane/src/case-authoring/index.mjs:644 "…ion the case as a whole answers. It is authored by the group and never derived" [inline]
- bio-plane/src/case-authoring/index.mjs:645 "from the findings' titles: a scope your group's Civicsmith wrote is not a scope the group made" [inline]
- bio-plane/src/case-authoring/index.mjs:1333 "…eader of a later edition is owed the difference in the group's own" [inline]
- bio-plane/src/case-authoring/index.mjs:1422 ", and a case cannot be asserted over one the group" [inline]
- bio-plane/src/case-authoring/index.mjs:1431 "'s latest entry about this question names an act your group's Civicsmith does not know, so" [inline]
- bio-plane/src/case-authoring/index.mjs:1722 "the approvals the group's rule requires could not be read, so whether every one is …" [inline] T
- bio-plane/src/case-authoring/index.mjs:1726 ": the group requires their approval of this version of the case" [inline]
- bio-plane/src/case-authoring/index.mjs:1832 "the approvals the group's rule requires could not be read" [inline] T
- bio-plane/src/case-authoring/index.mjs:1835 "The group requires no approval before a case is signed." [inline]
- bio-plane/src/case-authoring/index.mjs:1837 "Signing waits until every approver the group names has approved this version. An approval given" [inline] T
- bio-plane/src/case-authoring/index.mjs:1839 "Every approval the group requires is given for this version, and the document carrie…" [inline] T

### record-core (29)

- bio-plane/src/record-core/checks.mjs:44 "This is a fault in how your group's Civicsmith was built, not in the record, and nothing in t…" [inline] T
- bio-plane/src/record-core/checks.mjs:49 "Your group's Civicsmith could not find a free identifier for this, so …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:52 "your group's Civicsmith." [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:56 "A part of your group's Civicsmith tried to report a figure another part already …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:61 "A part of your group's Civicsmith tried to register its figures without naming i…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:74 "A part of your group's Civicsmith tried to register its audit check a second tim…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:79 "A part of your group's Civicsmith tried to register an audit check without namin…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:91 "A part of your group's Civicsmith tried to register a document grammar a second …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:97 "A part of your group's Civicsmith tried to register a document grammar without n…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:104 "A part of your group's Civicsmith tried to supply its figures when another part …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:109 "A part of your group's Civicsmith tried to supply its figures without naming its…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:116 "A part of your group's Civicsmith tried to reserve an identifier without giving …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:123 "keeps happening, tell whoever hosts your group's Civicsmith." [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:127 "A part of your group's Civicsmith tried to reserve an identifier outside the cha…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:133 "A part of your group's Civicsmith tried to name the identifiers it holds a secon…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:138 "A part of your group's Civicsmith tried to name the identifiers it holds without…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:144 "A part of your group's Civicsmith tried to declare a table without saying how it…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:149 "A part of your group's Civicsmith tried to declare a table with a class the reco…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:155 "A part of your group's Civicsmith tried to declare a table whose name, or a colu…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:160 "A part of your group's Civicsmith tried to declare a table that is already decla…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:166 "A part of your group's Civicsmith tried to register the checks of a table that a…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:171 "A part of your group's Civicsmith tried to register or run the checks of a table…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:178 "tell whoever hosts your group's Civicsmith." [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:212 "A part of your group's Civicsmith tried to record a setting without naming it, s…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:217 "A part of your group's Civicsmith tried to record a setting without saying who s…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:222 "A part of your group's Civicsmith tried to record a setting without giving it a …" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:227 "A part of your group's Civicsmith tried to record a setting with a value that ca…" [check-row translation (inline copy)] T
- bio-plane/src/record-core/checks.mjs:232 "…alue given is not one it takes. The jurisdictions your group" [check-row translation (inline copy)]
- bio-plane/src/record-core/index.mjs:145 "your group's Civicsmith could not find a free" [inline] T

### strength (26)

- bio-plane/src/strength/checks.mjs:178 "list of the positions of the reasons in it, or as groups each carrying a name and its" [check-row translation (inline copy)]
- bio-plane/src/strength/checks.mjs:179 "positions. Every group needs at least one reason and a name no other group has." [check-row translation (inline copy)]
- bio-plane/src/strength/checks.mjs:233 "How much evidence this group requires of itself is the group's own declaration" [check-row translation (inline copy)] T
- bio-plane/src/strength/checks.mjs:241 "…vidence a new project starts from is set for the whole group, so only" [check-row translation (inline copy)] T
- bio-plane/src/strength/checks.mjs:258 "A standard of evidence for the whole group is set with a reason: say in your own words why the group" [check-row translation (inline copy)] T
- bio-plane/src/strength/index.mjs:433 "this leg rests on another group's finding without saying which edition, so what it rests on" [inline] T
- bio-plane/src/strength/index.mjs:437 "this leg rests on another group's finding, and your group's Civicsmith holds no accepted wo…" [inline] T
- bio-plane/src/strength/index.mjs:440 "this leg rests on another group's finding that could not be read just now, so what it rests…" [inline] T
- bio-plane/src/strength/index.mjs:443 "this leg rests on another group's finding that your group's Civicsmith does not hold at edi…" [inline] T
- bio-plane/src/strength/index.mjs:525 "is not a calculation your group's Civicsmith holds, so what this leg rests on is unknown" [inline] T
- bio-plane/src/strength/index.mjs:554 "is not an obligation your group's Civicsmith holds" [inline] T
- bio-plane/src/strength/index.mjs:823 "this leg rests on another group's finding and carries no grade of its own: it counts at wha…" [inline] T
- bio-plane/src/strength/index.mjs:1059 "… id is readable here, so there are no reasons of it to group." [inline]
- bio-plane/src/strength/index.mjs:1380 "the default bar is declared for the whole group, so only an active administrator may set it." [inline]
- bio-plane/src/strength/index.mjs:1391 "the default bar is the GROUP's declaration, keyed by its group; this request names no gr…" [inline]
- bio-plane/src/strength/index.mjs:1406 "give the reason the group sets this bar, as text in your own words (reason=…). Nothin…" [inline]
- bio-plane/src/strength/index.mjs:1408 "…e reason given is blank; say in your own words why the group sets this bar. Nothing was declared." [inline]
- bio-plane/src/strength/index.mjs:1520 "…rengthbarof&project=<project id> — or op=strengthbarof&group=" [inline]
- bio-plane/src/strength/index.mjs:1531 "no group is named and this store records no producing group, so ther…" [inline]
- bio-plane/src/strength/index.mjs:1536 "no group default is declared. An absent bar gates nothing and is not…" [inline]
- bio-plane/src/strength/method.mjs:121 "the target is another group's finding, not a document, so a" [inline] T
- bio-plane/src/strength/method.mjs:212 "this leg rests on another group's finding, in that group's case" [inline] T
- bio-plane/src/strength/method.mjs:213 "that group" [inline] T
- bio-plane/src/strength/method.mjs:288 "on a leg to another question, or to another group's finding, has nothing to grade and is listed, not counted." [inline] T
- bio-plane/src/strength/method.mjs:292 "4. Another group's work. A leg to a finding of another group's case that thi…" [inline] T
- bio-plane/src/strength/method.mjs:302 "…evidence. Testimony from a member credited only to the group or the project, and" [inline] T

### capture-requests (25)

- bio-plane/src/capture-requests/checks.mjs:104 "running here. Every fetch your group's Civicsmith makes on its own is traceable to a session som…" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:132 "group's Civicsmith itself so that where the bytes came from is so…" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:153 "Your group's Civicsmith will not fetch without saying who is asking an…" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:172 "Every request your group's Civicsmith makes says what it is for, so a source can tel…" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:266 "… for the page as a visitor would see it in a form your group's Civicsmith does not" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:283 "Your group's Civicsmith tried to fetch the document and the fetch did …" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:328 "…a member, in their own browser, as their own act. Your group's Civicsmith does not fetch it" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:336 "…s request described the site it asks for in a way your group's Civicsmith does not recognise. It reads" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:373 "…chive to keep a copy is a member's choice, or else the group's" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/checks.mjs:380 "nothing to let the group's setting decide. This request sent something else. Nothing…" [check-row translation (inline copy)] T
- bio-plane/src/capture-requests/index.mjs:87 "…e), never by the daemon: nothing was fetched, and your group's Civicsmith uses no login for it." [inline] T
- bio-plane/src/capture-requests/index.mjs:175 "your request is kept, and it waits until your group's Civicsmith captures" [inline] T
- bio-plane/src/capture-requests/index.mjs:177 "requested. Your group's Civicsmith captures it on its next unattended round," [inline] T
- bio-plane/src/capture-requests/index.mjs:297 "this address has no host your group's Civicsmith can read, and the per-host pacing DEC-47 requi…" [inline]
- bio-plane/src/capture-requests/index.mjs:393 "co_archive: true or false, or nothing to let the group's setting decide." [inline]
- bio-plane/src/capture-requests/index.mjs:396 "…member's own credential. Send no co_archive to let the group's setting decide." [inline]
- bio-plane/src/capture-requests/index.mjs:477 "requested. Your group's Civicsmith does not fetch on a caller's timing: the daemo…" [inline]
- bio-plane/src/capture-requests/index.mjs:521 "the tie to the step did not complete and your group's Civicsmith did not" [inline] T
- bio-plane/src/capture-requests/index.mjs:662 "no daemon credential is bound: your group's Civicsmith drains nothing and holds no alarm for it" [inline]
- bio-plane/src/capture-requests/index.mjs:910 "your group's Civicsmith can truthfully name:" [inline]
- bio-plane/src/capture-requests/index.mjs:960 "with your group's Civicsmith." [inline]
- bio-plane/src/capture-requests/index.mjs:982 "no scope check is registered in your group's Civicsmith, so nothing can say that" [inline]
- bio-plane/src/capture-requests/index.mjs:1070 "the fetch did not complete and your group's Civicsmith did not record why" [inline] T
- bio-plane/src/capture-requests/index.mjs:1143 "the promotion did not complete and your group's Civicsmith did not record why" [inline] T
- bio-plane/src/capture-requests/index.mjs:1742 "is not a sweep your group's Civicsmith holds" [inline]

### credentials (25)

- bio-plane/src/credentials/checks.mjs:33 "their invitation and chosen a handle; until then your group's Civicsmith would refuse anything signed" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:39 "That member’s membership is not active, so your group's Civicsmith would refuse anything" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:51 "Only a named person signed in to your group's Civicsmith can create an agent credential." [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:65 "…at name already belongs to an agent credential in your group's Civicsmith. Acts in the" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:78 "There is no agent credential by that name in your group's Civicsmith, so nothing was" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:101 "…he agent credential could not be created, because your group's Civicsmith was not handed the" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:103 "if it keeps happening, tell whoever hosts your group's Civicsmith." [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:118 "That is not a public key this group can register. It takes the base64 part of an" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:187 "…d reset link is made only for an active member of your group. Nothing was made." [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:196 "That is not an outside service this group can hold a key for. Nothing was changed." [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:204 "The group's key for this outside service is switched off, or no key i…" [check-row translation (inline copy)] T
- bio-plane/src/credentials/checks.mjs:227 "fault in how your group's Civicsmith was built, not in the record." [check-row translation (inline copy)] T
- bio-plane/src/credentials/index.mjs:837 "one your group's Civicsmith would refuse. Nothing was written." [inline]
- bio-plane/src/credentials/index.mjs:909 "this key is registered to another member of this group, and a registered key is never" [inline]
- bio-plane/src/credentials/index.mjs:1077 "the group, nobody individual behind it) or 'member' (attributable to …" [inline]
- bio-plane/src/credentials/index.mjs:1083 "' already names a credential in your group's Civicsmith. Acts cite the" [inline]
- bio-plane/src/credentials/index.mjs:1140 "machine name there would record the group withdrawing an authority nobody in the" [inline]
- bio-plane/src/credentials/index.mjs:1141 "group decided to withdraw." [inline]
- bio-plane/src/credentials/index.mjs:1148 "no credential in your group's Civicsmith is called '" [inline]
- bio-plane/src/credentials/index.mjs:1268 "minted by your group's Civicsmith for one segment of your run" [inline]
- bio-plane/src/credentials/index.mjs:1440 "group's key" [inline] T
- bio-plane/src/credentials/index.mjs:1892 "member of the group. Nothing was made." [inline]
- bio-plane/src/credentials/index.mjs:1978 "setting the group's key for an outside service" [inline]
- bio-plane/src/credentials/index.mjs:2005 "switching the group's key for an outside service" [inline]
- bio-plane/src/credentials/index.mjs:2033 "the group's key for this service is" [inline]

### capture-sources (24)

- bio-plane/src/browserrender.mjs:149 "its host is one of your group's own (where your group's Civicsmith or its fleet is reache…" [inline]
- bio-plane/src/capture-sources/credentials.mjs:57 "A credential's scope is member, project or group, and only a project-scoped credential names a project." [check-row translation (inline copy)] T
- bio-plane/src/capture-sources/credentials.mjs:65 "No encryption key is set for your group's Civicsmith, so no credential is stored or used." [check-row translation (inline copy)] T
- bio-plane/src/capture-sources/credentials.mjs:76 "A credential is never for one of your group's own hosts: the address your group's Civicsmith is" [check-row translation (inline copy)] T
- bio-plane/src/capture-sources/credentials.mjs:288 "the supplier named is not an active member of your group" [inline] T
- bio-plane/src/capture-sources/credentials.mjs:305 "the host given is one of your group's own (where your group's Civicsmith or its fleet is reache…" [inline]
- bio-plane/src/capture-sources/credentials.mjs:329 "no encryption key is set for your group's Civicsmith, so nothing is stored in the clear" [inline] T
- bio-plane/src/capture-sources/credentials.mjs:372 "is one of your group's own hosts, so no credential is used for it and the fetch …" [inline]
- bio-plane/src/capture-sources/credentials.mjs:390 "…E_CREDENTIAL_NO_KEY: no encryption key is set for your group's Civicsmith, so no credential is used and the source's ref…" [inline] T
- bio-plane/src/capture-sources/credentials.mjs:398 "will not decrypt under the key of your group's Civicsmith, so the fetch goes without credentials and the…" [inline] T
- bio-plane/src/capture-sources/memento.mjs:256 ", computed by your group's Civicsmith over the bytes it received, not a digest the a…" [inline]
- bio-plane/src/drive.mjs:216 "your group's Civicsmith can promise to have captured." [inline] T
- bio-plane/src/drive.mjs:254 "the export address was COMPOSED BY YOUR GROUP'S CIVICSMITH from the file id and the kind carried in" [inline]
- bio-plane/src/drive.mjs:444 "your group's Civicsmith recorded fetching the export address, but" [inline] T
- bio-plane/src/drive.mjs:445 "your group's Civicsmith recorded fetching the export address" [inline] T
- bio-plane/src/drive.mjs:448 "your group's Civicsmith recorded fetching" [inline] T
- bio-plane/src/drive.mjs:449 "your group's Civicsmith recorded fetching" [inline] T
- bio-plane/src/drive.mjs:451 "your group's Civicsmith recorded these bytes from BOTH the export and" [inline] T
- bio-plane/src/drive.mjs:454 "; your group's Civicsmith holds no retrieval record for these bytes" [inline] T
- bio-plane/src/drive.mjs:456 "for a row at the document address; your group's Civicsmith holds no retrieval record for these bytes, so …" [inline] T
- bio-plane/src/drive.mjs:458 "your group's Civicsmith holds no direct retrieval record for these byt…" [inline] T
- bio-plane/src/render.mjs:343 "your group's Civicsmith could not keep the bytes (" [inline] T
- bio-plane/src/render.mjs:384 "your group's Civicsmith did not keep this render's subresource bytes" [inline] T
- bio-plane/src/render.mjs:480 "' condition your group's Civicsmith asked for nor a timeout" [inline]

### setup-words (24)

- bio-plane/src/setup-words/rows.mjs:942 "“Member of” a body or group; “stands in for” someone, acting in their name; “overlaps w…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:3754 "a professional group" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:3755 "an issue group" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:3756 "a community group" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:4377 "…what it finds in a form anyone can check. Neighborhood groups, newsrooms, professional associations and offices checking…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:4479 "nav.groups is also the teams page heading" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:4493 "after screen.connect.group.allowance; drawn only to an account's owners, when answered" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:4572 "the details' heading beside site.groups.rule" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6288 "This asks whether the groups of reasons behind one question share a source, and no ques…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6289 "… a question you can read here, so it has no reasons to group. Only a question rests on reasons, and a question you may n…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6290 "…ing of reasons could not be read. Send it as a list of groups, each group a list of the positions of the reasons in it, …" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6291 "…e. It was not dropped quietly, because an answer about groups the question does not hold would be an answer about someth…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6292 "One reason was put in two groups. Each reason belongs to exactly one group, because a reaso…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6293 "Some of this question's reasons are in no group. A grouping covers every reason, as a written reading does,…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6296 "…name belongs to this question, so there are no written groups of it to check. Nothing was substituted for it." [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6376 "a member said this group of reasons would carry the answer on its own, and the recor…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6377 "nobody said this group of reasons would carry the answer on its own, and the recor…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:6378 "the record does not say whether anyone claimed this group of reasons would carry the answer on its own" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:8682 "Neighborhood and issue groups, newsrooms, professional associations, and public offices …" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:10102 "each group's strength is its weakest leg, and this question's is its s…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:10397 "…a reporter or outlet, an organization or another civic group by role and organization, or a described audience. It is ne…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:10823 "for each group of two or more like cases, the share whose outcome is the g…" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:10829 "…, or falls across a period's bounds, is in no period's group: counted apart by the select steps" [DESIGN-GENERATED (rows.mjs from words.json)]
- bio-plane/src/setup-words/rows.mjs:10830 "groups of one act have no like case: counted apart" [DESIGN-GENERATED (rows.mjs from words.json)]

### signatures (24)

- bio-plane/src/sign-release.html:174 "…e record id and its current hash from its page in your group's Civicsmith. The signature covers" [inline] T
- bio-plane/src/sign-release.html:192 "…its revision number and its hash from its page in your group's Civicsmith. The signature" [inline] T
- bio-plane/src/sign-release.html:213 "… entry number and the entry hash from its page in your group's Civicsmith. The signature" [inline] T
- bio-plane/src/sign-release.html:479 "… keys with no passphrase. When Civicsmith goes to real groups," [inline] T
- bio-plane/src/sign-release.html:566 ""Signature: paste this into the ratify box in your group's Civicsmith", sig," [inline]
- bio-plane/src/sign-release.html:568 "you submit it, your group's Civicsmith refuses this signature and you sign the new ha…" [inline] T
- bio-plane/src/sign-release.html:582 "…erHTML = '<p class="warn">Paste the notice id, as your group's Civicsmith shows it.</p>');" [inline] T
- bio-plane/src/sign-release.html:589 ""Signature: paste this into the notice box in your group's Civicsmith", sig," [inline]
- bio-plane/src/sign-release.html:591 "you post it, your group's Civicsmith refuses this signature and you sign the new ha…" [inline] T
- bio-plane/src/sign-release.html:601 "…nnerHTML = '<p class="warn">Paste the case id, as your group's Civicsmith shows it.</p>');" [inline] T
- bio-plane/src/sign-release.html:608 ""Signature: paste this into the docket box in your group's Civicsmith", sig," [inline]
- bio-plane/src/sign-release.html:610 "you post it, your group's Civicsmith refuses this signature and you prepare and sig…" [inline] T
- bio-plane/src/signpage.mjs:175 "…e record id and its current hash from its page in your group's Civicsmith. The signature covers" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:193 "…its revision number and its hash from its page in your group's Civicsmith. The signature" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:214 "… entry number and the entry hash from its page in your group's Civicsmith. The signature" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:480 "… keys with no passphrase. When Civicsmith goes to real groups," [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:567 ""Signature: paste this into the ratify box in your group's Civicsmith", sig," [GENERATED (embed-signpage.mjs from sign-release.html)]
- bio-plane/src/signpage.mjs:569 "you submit it, your group's Civicsmith refuses this signature and you sign the new ha…" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:583 "…erHTML = '<p class="warn">Paste the notice id, as your group's Civicsmith shows it.</p>');" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:590 ""Signature: paste this into the notice box in your group's Civicsmith", sig," [GENERATED (embed-signpage.mjs from sign-release.html)]
- bio-plane/src/signpage.mjs:592 "you post it, your group's Civicsmith refuses this signature and you sign the new ha…" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:602 "…nnerHTML = '<p class="warn">Paste the case id, as your group's Civicsmith shows it.</p>');" [GENERATED (embed-signpage.mjs from sign-release.html)] T
- bio-plane/src/signpage.mjs:609 ""Signature: paste this into the docket box in your group's Civicsmith", sig," [GENERATED (embed-signpage.mjs from sign-release.html)]
- bio-plane/src/signpage.mjs:611 "you post it, your group's Civicsmith refuses this signature and you prepare and sig…" [GENERATED (embed-signpage.mjs from sign-release.html)] T

### action-grammar (23)

- bio-plane/src/action-grammar/checks.mjs:578 "…e and body (an office), or kind press, organisation or group with role and organisation" [inline]
- bio-plane/src/action-grammar/checks.mjs:765 "…dated as recorded and names the entry it follows. Your group's Civicsmith derives only the days" [inline] T
- bio-plane/src/action-grammar/checks.mjs:935 "…fice by its role and body (or a press, organisation or group by role and organisation), once each, at most twenty" [inline]
- bio-plane/src/action-grammar/checks.mjs:943 "…a named addressee: an office, a press, organisation or group by role, never an audience or an undetermined one (R20)" [inline]
- bio-plane/src/action-grammar/checks.mjs:1046 "' is not a status the group's" [inline]
- bio-plane/src/action-grammar/checks.mjs:1067 "group in a sending (R22)" [inline]
- bio-plane/src/action-grammar/checks.mjs:1086 "state reply_owed: false when the body owes the group no reply, or leave it out" [inline]
- bio-plane/src/action-grammar/checks.mjs:1187 "' is not a kind your group's Civicsmith offers" [inline]
- bio-plane/src/action-grammar/checks.mjs:1222 "state who owes the date: the group, the body, or undetermined" [inline]
- bio-plane/src/action-grammar/checks.mjs:1295 "withdrawn, or completed when the group carried it out and no answer was awaited. The record keeps …" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1325 "would quote instead of the thing the group can actually defend." [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1683 "An action is one of the kinds your group's Civicsmith offers: a records request, a request for comme…" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1684 ""other", and the kinds the group's jurisdiction profile lists. This write named another kind…" [check-row translation (inline copy)]
- bio-plane/src/action-grammar/checks.mjs:1697 "a reporter, an organisation or another group by a role and the organisation; an audience described in" [check-row translation (inline copy)]
- bio-plane/src/action-grammar/checks.mjs:1706 "group carried it out and no answer was awaited. This write marked…" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1750 "An action taken for a breach rests on the group's recorded determination that the government" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1767 "Acting on a breach the group has not determined is a member's open decision, made with a…" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1781 "The reason the group acts without a determination is written in up to 500 charac…" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1789 "Who the group's contact for an action is, is a member's choice. The crede…" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1795 "The contact for an action is a member of this group, named by their member id, and the id given" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/checks.mjs:1829 "Pressure is marked on something the group received. The entry named records something sent, or a" [check-row translation (inline copy)] T
- bio-plane/src/action-grammar/grammar.mjs:191 "The window is AUTHORED by the group;" [inline]
- bio-plane/src/action-grammar/grammar.mjs:250 "summarised (DEC-13). The bytes are what the group can defend; a paraphrase beside them is what a" [inline]

### case-grammar (22)

- bio-plane/src/case-grammar/blocks.mjs:44 "known to the group, not recorded" [inline] T
- bio-plane/src/case-grammar/casefile.mjs:193 "the source group is named by its slug, and this manifest states" [inline]
- bio-plane/src/case-grammar/complete.mjs:106 "not recomputed here: a workbook this group's Civicsmith did not recompute" [inline] T
- bio-plane/src/case-grammar/complete.mjs:139 "Fingerprint of the original (SHA-256), which the group holds and this case file does not carry:" [inline]
- bio-plane/src/case-grammar/complete.mjs:229 "a group not named" [inline] T
- bio-plane/src/case-grammar/complete.mjs:231 "Verify it with the checker from the group's public read" [inline]
- bio-plane/src/case-grammar/complete.mjs:232 "manifest and the group's published record." [inline]
- bio-plane/src/case-grammar/complete.mjs:359 "1. Get the checker, one file, from the publishing group's public read" [inline] T
- bio-plane/src/case-grammar/complete.mjs:388 "A group" [inline] T
- bio-plane/src/case-grammar/complete.mjs:415 ". This is another group's finding." [inline] T
- bio-plane/src/case-grammar/complete.mjs:476 "framed by the group's declared bias is marked, and its statement named." [inline] T
- bio-plane/src/case-grammar/complete.mjs:501 "The group's rule in force at signing required approval by:" [inline] T
- bio-plane/src/case-grammar/complete.mjs:512 "Attested by a member of the group, credited to the" [inline] T
- bio-plane/src/case-grammar/complete.mjs:520 "Vouched for by the group" [inline] T
- bio-plane/src/case-grammar/edition.mjs:128 "a source this group checks more closely before relying on it" [inline] T
- bio-plane/src/case-grammar/edition.mjs:129 "an inference this group allows or refuses to draw" [inline] T
- bio-plane/src/case-grammar/edition.mjs:130 "a pattern this group has evidence an institution or source follows" [inline] T
- bio-plane/src/case-grammar/edition.mjs:136 "This group declares its lens, with its reasons and its evidence, so th…" [inline] T
- bio-plane/src/case-grammar/index.mjs:97 "the group that publishes this case" [inline] T
- bio-plane/src/case-grammar/index.mjs:98 "the cover the group knows its author by" [inline] T
- bio-plane/src/case-grammar/index.mjs:101 "recorded by a member of this group. What it shows of who SAID each one is" [inline] T
- bio-plane/src/case-grammar/index.mjs:110 "producing group, so none is printed)" [inline] T

### ai-accounts (21)

- bio-plane/src/ai-accounts/index.mjs:222 "their subscription, and the group's key is not held or not on, so there is no assistant for t…" [inline]
- bio-plane/src/ai-accounts/index.mjs:284 "your group's" [inline] T
- bio-plane/src/ai-accounts/index.mjs:317 "switching the group key's assistant settings" [inline]
- bio-plane/src/ai-accounts/index.mjs:368 "your group's Civicsmith has no seal secret set, so a" [inline] T
- bio-plane/src/ai-accounts/index.mjs:397 "the kind your group's Civicsmith holds is" [inline]
- bio-plane/src/ai-accounts/index.mjs:593 "reading the group key's assistant settings" [inline]
- bio-plane/src/ai-accounts/index.mjs:819 "group's Civicsmith, which has changed; its member signs in again.…" [inline] T
- bio-plane/src/ai-accounts/index.mjs:866 "… reference does not open under the seal secret of your group's Civicsmith," [inline]
- bio-plane/src/ai-accounts/index.mjs:924 "setting the group's Anthropic API key" [inline]
- bio-plane/src/ai-accounts/index.mjs:948 "removing the group's Anthropic API key" [inline]
- bio-plane/src/ai-accounts/index.mjs:961 "switching the group's Anthropic API key" [inline]
- bio-plane/src/ai-accounts/index.mjs:983 "reading the group's Anthropic API key" [inline]
- bio-plane/src/ai-accounts/index.mjs:1021 "questions go to Anthropic under the group's API account. Nothing was sent." [inline]
- bio-plane/src/ai-accounts/index.mjs:1073 "…ject's key does not open under the seal secret of your group's" [inline]
- bio-plane/src/ai-accounts/index.mjs:1079 "the group's key does not open under the seal secret of your group's C…" [inline]
- bio-plane/src/ai-accounts/index.mjs:1129 "the group's key serves only acts" [inline]
- bio-plane/src/ai-accounts/index.mjs:1199 "keeping the group's material away from every assistant" [inline] T
- bio-plane/src/ai-accounts/index.mjs:1243 "the group keeps its material away from every assistant, so no account…" [inline] T
- bio-plane/src/ai-accounts/index.mjs:1244 "whether the group keeps its material away from every assistant could not be r…" [inline] T
- bio-plane/src/ai-accounts/index.mjs:1610 "the key could not be sealed by your group's Civicsmith. Nothing was stored or read." [inline]
- bio-plane/src/ai-accounts/index.mjs:1622 "the key does not open under the seal secret of your group's Civicsmith, which" [inline]

### membership (21)

- bio-plane/src/membership/index.mjs:631 "the group would be left with no administrator, so its last one does n…" [inline] T
- bio-plane/src/membership/index.mjs:649 "name who holds hosting access: the record keeps the group's answer as it was given, and an empty" [inline]
- bio-plane/src/membership/index.mjs:2002 "application. Whoever can set ADMIN_TOKEN can take the group over, and there is no" [inline]
- bio-plane/src/membership/index.mjs:2576 "the group voted them out under 4.7, and putting them back is an appoi…" [inline]
- bio-plane/src/membership/index.mjs:2725 "acts on the group's live website key, and there is none. Nothing was written." [inline]
- bio-plane/src/membership/index.mjs:2734 "acts on the group's join link, and it is off. Nothing was written." [inline]
- bio-plane/src/membership/index.mjs:2740 "creating the group's website key" [inline]
- bio-plane/src/membership/index.mjs:2744 "the group holds one live website key at a time (DEC-133). Nothing was…" [inline]
- bio-plane/src/membership/index.mjs:2756 "changing the group's website key" [inline]
- bio-plane/src/membership/index.mjs:2769 "switching off the group's website key" [inline]
- bio-plane/src/membership/index.mjs:2821 "this key opens no door of this group: it was never made, was switched off, or is not a key, and …" [inline]
- bio-plane/src/membership/index.mjs:2826 "the website names the person by the cover the group will know them by. Nothing was written." [inline]
- bio-plane/src/membership/index.mjs:2839 "switching on the group's join link" [inline]
- bio-plane/src/membership/index.mjs:2843 "the group holds one live join link at a time (DEC-133 (6)). Nothing w…" [inline]
- bio-plane/src/membership/index.mjs:2855 "changing the group's join link" [inline]
- bio-plane/src/membership/index.mjs:2868 "replacing the group's join link" [inline]
- bio-plane/src/membership/index.mjs:2879 "switching off the group's join link" [inline]
- bio-plane/src/membership/index.mjs:2893 "this link opens no door of this group: it was never made, was replaced or switched off, or is not…" [inline]
- bio-plane/src/membership/index.mjs:2898 "choose the name the group will know you by: it need not be, and often should not be, …" [inline]
- bio-plane/src/membership/index.mjs:2922 "reading the group's website key and join link" [inline]
- bio-plane/src/membership/index.mjs:3049 "describing the group" [inline]

### doorbell (20)

- bio-plane/src/doorbell/checks.mjs:27 "…sk the doorbell to make one. Nothing was received. The group can see how often its doorbell turns people away." [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:71 "Your material was not received. This group's inbox is not taking any more material from where" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:76 "later and it will arrive. The group can see how often its doorbell turns people away." [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:81 "Your material was not received. This group's inbox is not taking any more material from anyone" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:86 "The group can see how often its doorbell turns people away." [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:94 "This group's inbox did not read what you sent, because the request its…" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:98 "more than one knock, and it will be read. The group can see how often its doorbell turns people away." [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:103 "This group's inbox read your material and cannot keep it, because it i…" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:104 "this inbox stores. That is a fact about how this group has set its Civicsmith up rather" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:105 "than a judgement about what you sent — a group that has configured evidence storage can keep" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:107 "stored. Send something smaller, or ask the group's members how to get the whole of it to them. The group can…" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:112 "This group's inbox has nothing to keep, because what you sent decoded …" [check-row translation (inline copy)] T
- bio-plane/src/doorbell/checks.mjs:115 "stored. Check what you attached and knock again. The group can see how often its doorbell turns people away." [check-row translation (inline copy)] T
- bio-plane/src/doorbell/door.mjs:25 "knocks to this group's inbox in any" [inline] T
- bio-plane/src/doorbell/door.mjs:52 "this group's inbox stores knocks inline; large material needs its evid…" [inline]
- bio-plane/src/doorbell/door.mjs:142 "Your material is in the group's inbox awaiting member review." [inline] T
- bio-plane/src/doorbell/index.mjs:261 "no knock carrying a secret has been received by your group's Civicsmith, so no secret is recognised" [inline] T
- bio-plane/src/doorbell/index.mjs:611 "this group's Civicsmith has no evidence storage configured, so the kno…" [inline]
- bio-plane/src/doorbell/index.mjs:715 "material handed to the group through its doorbell by an unnamed knocker; no authority is…" [inline] T
- bio-plane/src/doorbell/index.mjs:720 "these bytes were received at the doorbell of your group's Civicsmith as knock" [inline]

### stewards (20)

- stewards/guide.md:1 "What a group holds, and who could compel it" [inline]
- stewards/guide.md:3 "Your group's Civicsmith keeps its record and its evidence in your grou…" [inline] T
- stewards/guide.md:5 "…ever can sign in to that hosting account controls your group's Civicsmith. They can replace the one-time password, claim…" [inline]
- stewards/guide.md:7 "…who could be asked or compelled to hand over what your group's Civicsmith holds are your group itself (and anyone in it …" [inline]
- stewards/guide.md:9 "…If you need to know what the law could require of your group, ask a lawyer." [inline]
- stewards/src/index.mjs:43 "What the report concerns must be a group's short name or an https:// address, at most" [inline]
- stewards/src/ui.mjs:10 "What a group holds, and who could compel it" [inline]
- stewards/src/ui.mjs:12 "Your group's Civicsmith keeps its record and its evidence in your grou…" [inline] T
- stewards/src/ui.mjs:14 "…ever can sign in to that hosting account controls your group's Civicsmith. They can replace the one-time password, claim…" [inline]
- stewards/src/ui.mjs:16 "…who could be asked or compelled to hand over what your group's Civicsmith holds are your group itself (and anyone in it …" [inline]
- stewards/src/ui.mjs:18 "…If you need to know what the law could require of your group, ask a lawyer." [inline]
- stewards/src/ui.mjs:24 "…vice, which Civicsmith's stewards run apart from every group's Civicsmith, holds the reports sent to it, the stewards' d…" [inline]
- stewards/src/ui.mjs:57 "…<a href="/">Report abuse</a> · <a href="/guide">What a group holds, and who could compel it</a> · <a href="/withdrawals"…" [inline]
- stewards/src/ui.mjs:68 "<p><a href="/guide">What a group holds, and who could compel it</a></p>" [inline]
- stewards/src/ui.mjs:75 "…ssment or impersonation, or other abuse, by or about a group's public identity or a published case.</p>" [inline]
- stewards/src/ui.mjs:76 "…ibrary, a public listing). They never edit or delete a group's record, and they have no way into any group's Civicsmith.…" [inline]
- stewards/src/ui.mjs:85 "<label for="concerns">Which group or published case it concerns</label>" [inline]
- stewards/src/ui.mjs:86 "" placeholder="a group's short name, or an https:// address">" [inline]
- stewards/src/ui.mjs:107 "What a group holds" [inline]
- stewards/src/ui.mjs:114 "…nd not reinstated, with the kind of abuse reported. No group's record is ever changed by a withdrawal.</p>" [inline]

### case-disclosures (19)

- bio-plane/src/case-disclosures/accepted.mjs:15 "Rests on another group's work that carries an open flag, disclosed with this case:" [inline] T
- bio-plane/src/case-disclosures/checks.mjs:100 "A finding this case relies on rests on material your group's Civicsmith does not hold whole, and" [check-row translation (inline copy)] T
- bio-plane/src/case-disclosures/checks.mjs:109 "A finding in this case rests on another group's finding, and this group's acceptance of that edition" [check-row translation (inline copy)] T
- bio-plane/src/case-disclosures/checks.mjs:115 "Another group's work this case rests on carries an open flag, and a case …" [check-row translation (inline copy)] T
- bio-plane/src/case-disclosures/checks.mjs:121 "The flags on another group's work this case rests on could not be read completely, so …" [check-row translation (inline copy)] T
- bio-plane/src/case-disclosures/document.mjs:66 "## Sources Of Material Given To The Group" [inline] T
- bio-plane/src/case-disclosures/document.mjs:69 "What may be said of whoever gave the group a document this case rests on: only what the source consent…" [inline] T
- bio-plane/src/case-disclosures/document.mjs:73 "No document this case rests on was given to the group by a source: each was fetched, or brought in by a member." [inline] T
- bio-plane/src/case-disclosures/document.mjs:87 "the group" [inline] T
- bio-plane/src/case-disclosures/document.mjs:102 ", the original kept by the group" [inline] T
- bio-plane/src/case-disclosures/document.mjs:143 "## Another Group's Work This Case Rests On" [inline] T
- bio-plane/src/case-disclosures/document.mjs:144 "A finding of this case rests on a finding of another group's published case, which this group accepted. That" [inline] T
- bio-plane/src/case-disclosures/document.mjs:145 "work, and everything it rests on, is the other group's, in its own case file: check it there." [inline] T
- bio-plane/src/case-disclosures/document.mjs:146 "another group" [inline] T
- bio-plane/src/case-disclosures/document.mjs:172 "Held irreconcilable by the group:" [inline] T
- bio-plane/src/case-disclosures/index.mjs:499 "whole by your group's Civicsmith (" [inline]
- bio-plane/src/case-disclosures/index.mjs:687 "leg(s) of this case's findings rest on another group's finding with no acceptance of" [inline]
- bio-plane/src/case-disclosures/index.mjs:713 "the flags on another group's work this case rests on could not be read whole (" [inline]
- bio-plane/src/case-disclosures/index.mjs:722 "open flag(s) on another group's work this case rests on are not disclosed (" [inline]

### filing-templates (19)

- bio-plane/src/filing-templates/blanks.mjs:13 "…organisation of a reporter, an organisation or another group the action is addressed to" [inline]
- bio-plane/src/filing-templates/blanks.mjs:24 "the producing group" [inline] T
- bio-plane/src/filing-templates/blanks.mjs:30 "the most the group will pay for copies before being told" [inline] T
- bio-plane/src/filing-templates/checks.mjs:57 "…s 3: it requires competent counsel, so no template the group files in its own name" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:62 "The group's library already holds a template by this name. Choose ano…" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:66 "There is no template by that id in the group's library that you can read here. One you may not see" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:92 "Say what the template is for: file (wording the group files in its own name) or brief (the basis of" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:97 "A template is written for jurisdiction profiles your group's Civicsmith holds, or for none in" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:151 "A review grant opens by a secret link your group's Civicsmith makes, and none was made for this" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:188 "Only an approved version's template is made group-wide, and this version is not approved." [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:192 "… approves or retires it, and an administrator makes it group-wide" [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:193 "or retires a group-wide one. You are not the one who does this here." [check-row translation (inline copy)] T
- bio-plane/src/filing-templates/checks.mjs:239 "This kind is filed with a court, so no template the group files in its own name is kept for it until" [check-row translation (inline copy)]
- bio-plane/src/filing-templates/index.mjs:318 "group files in its own name is kept for it until a licensed profe…" [inline] T
- bio-plane/src/filing-templates/index.mjs:621 "a profile's template is read-only here: draft the group's own from it (from=)" [inline]
- bio-plane/src/filing-templates/index.mjs:846 "…o fresh secret digest was stamped for this grant: your group's Civicsmith makes the secret" [inline]
- bio-plane/src/filing-templates/index.mjs:969 "a profile's template is already offered to the whole group" [inline]
- bio-plane/src/filing-templates/index.mjs:974 "an administrator makes a template group-wide" [inline]
- bio-plane/src/filing-templates/index.mjs:1039 "an administrator retires a group-wide template" [inline]

### queue-producers (19)

- bio-plane/src/queue-producers/index.mjs:1150 "left your group's Civicsmith with the root-of-trust credential" [inline]
- bio-plane/src/queue-producers/index.mjs:1350 "Your group's Civicsmith noticed that the address this document was cap…" [inline] T
- bio-plane/src/queue-producers/index.mjs:1856 "shows who said it: the group, the project, your cover or your name. Nothing is published…" [inline]
- bio-plane/src/queue-producers/index.mjs:2049 "of the group" [inline] T
- bio-plane/src/queue-producers/index.mjs:2049 "of another group" [inline] T
- bio-plane/src/queue-producers/index.mjs:2127 "…(its R33): a live leg of this finding rests on another group's" [inline] T
- bio-plane/src/queue-producers/index.mjs:2129 "docket, a verified entry your group's Civicsmith read. It is read here, never raised, and nothi…" [inline]
- bio-plane/src/queue-producers/index.mjs:2202 ", was read and verified by your group's Civicsmith." [inline]
- bio-plane/src/queue-producers/index.mjs:2254 ", which you follow, failed the checks your group's Civicsmith makes" [inline] T
- bio-plane/src/queue-producers/index.mjs:2383 "It passed its checks again when your group's Civicsmith started, and members are offered it as before.…" [inline]
- bio-plane/src/queue-producers/index.mjs:2388 "… stored. It goes to the script's project owners (for a group" [inline]
- bio-plane/src/queue-producers/index.mjs:2543 ", the group's own time." [inline] T
- bio-plane/src/queue-producers/index.mjs:2578 "…ublish-schedule's (its R1–R4): its time as set, in the group's zone, and" [inline]
- bio-plane/src/queue-producers/index.mjs:2639 "the place your group named" [inline] T
- bio-plane/src/queue-producers/index.mjs:2640 "…d update brought a profile that matches the place your group named" [inline]
- bio-plane/src/queue-producers/index.mjs:2642 "Places; the offices your group added stay. This status is told once, and it leaves when th…" [inline]
- bio-plane/src/queue-producers/index.mjs:2646 "… fact (its R62): a held profile matching the place the group named," [inline]
- bio-plane/src/queue-producers/index.mjs:2696 ", than your group's copy" [inline] T
- bio-plane/src/queue-producers/index.mjs:2697 "Your group's copy" [inline]

### case-checker (18)

- bio-plane/src/case-checker/check.mjs:47 "Part of this case rests on another group's published finding. That part" [inline] T
- bio-plane/src/case-checker/check.mjs:48 "is checked against that group's own case file, named here, and not on that group's behalf…" [inline] T
- bio-plane/src/case-checker/check.mjs:50 "The signing keys were not checked against the group's published list of" [inline] T
- bio-plane/src/case-checker/check.mjs:372 "…'s signature was made with a key that is not among the group's published keys" [inline]
- bio-plane/src/case-checker/check.mjs:458 "was made with a key that is not among the group's published keys" [inline]
- bio-plane/src/case-checker/check.mjs:462 "a group attestation of" [inline]
- bio-plane/src/case-checker/check.mjs:463 "the group's attestation of" [inline] T
- bio-plane/src/case-checker/check.mjs:464 "the group's attestation of" [inline] T
- bio-plane/src/case-checker/check.mjs:577 "was made with a key that is not among the group's published keys" [inline]
- bio-plane/src/case-checker/index.mjs:63 "this group's Civicsmith holds no specification of that version" [inline]
- bio-plane/src/case-checker/spec.mjs:28 "- 'group': the slug of the group that published the case." [inline]
- bio-plane/src/case-checker/spec.mjs:44 "…ion', 'inquiry' (another finding), 'imported' (another group's finding), or a leg counted on the capture axis only ('cal…" [inline]
- bio-plane/src/case-checker/spec.mjs:63 "…mber's signed account, or an observation's author; at 'group' or 'project' level it carries no handle, key or signature)…" [inline]
- bio-plane/src/case-checker/spec.mjs:68 "…vents concerning the case's findings) or 'we_did' (the group's own acts), every 'they_did' row first, the two lanes neve…" [inline]
- bio-plane/src/case-checker/spec.mjs:69 "…d_work:' one row per member and leg resting on another group's finding, '{member, leg_of, ref, group, case, edition, fin…" [inline]
- bio-plane/src/case-checker/spec.mjs:79 "…st be among the manifest's 'keys'. A checker given the group's published keys also says whether each signing key is amon…" [inline]
- bio-plane/src/case-checker/spec.mjs:109 "… row with a signature is verified over its account; a 'group' row is the case document's signature; a 'project' or 'co_a…" [inline]
- bio-plane/src/case-checker/spec.mjs:117 "10. Another group's work. A leg on another group's finding ('imported') is re…" [inline]

### bias (17)

- bio-plane/src/bias/checks.mjs:361 "…t let the record notice when a project statement and a group" [check-row translation (inline copy)] T
- bio-plane/src/bias/checks.mjs:415 "…member does with their name on it, because otherwise a group could" [check-row translation (inline copy)] T
- bio-plane/src/bias/checks.mjs:416 "…ows an organisation's standards without anybody in the group having agreed to" [check-row translation (inline copy)] T
- bio-plane/src/bias/checks.mjs:497 "change in the group's declared lens does not affect a piece of work is somebody…" [check-row translation (inline copy)] T
- bio-plane/src/bias/checks.mjs:546 "… no reason was given. Adopting a lens changes how this group reads" [check-row translation (inline copy)] T
- bio-plane/src/bias/index.mjs:54 "adopting a bias set for the whole group" [inline]
- bio-plane/src/bias/index.mjs:56 "…own, or ask an administrator to adopt it for the whole group." [inline] T
- bio-plane/src/bias/index.mjs:375 "…INS A PROPOSED REVISION: this adoption froze bytes the group has offered and not" [inline] T
- bio-plane/src/bias/index.mjs:431 "… entry is an adoption whose PINNED REVISION is one the group has offered and not" [inline] T
- bio-plane/src/bias/index.mjs:470 "a project override naming a LOCKED group statement is a" [inline]
- bio-plane/src/bias/index.mjs:471 "conformance error; the group statement stands" [inline]
- bio-plane/src/bias/index.mjs:570 "each entry is a project statement on a subject a group statement in force also" [inline] T
- bio-plane/src/bias/index.mjs:572 "group statement, and it is listed so a reviewer reads the two tog…" [inline] T
- bio-plane/src/bias/index.mjs:736 "there is no description of the group to start a declared bias from: a member writes the set's" [inline] T
- bio-plane/src/bias/index.mjs:755 "what the group wrote about itself" [inline] T
- bio-plane/src/bias/index.mjs:757 "this is the group's own description of itself, offered as the opening text of…" [inline] T
- bio-plane/src/bias/index.mjs:759 "justifies it, offers the set as 'proposed', and the group adopts it with a member's name on it." [inline] T

### public-read (16)

- bio-plane/src/public-read/index.mjs:77 "group holds the original" [inline] T
- bio-plane/src/public-read/index.mjs:276 "the group's identity source is registered with its door, identity(); …" [inline]
- bio-plane/src/public-read/index.mjs:279 "the group's identity source is already registered; the first stands, …" [inline]
- bio-plane/src/public-read/index.mjs:410 "is registered on this group's Civicsmith, so there" [inline]
- bio-plane/src/public-read/index.mjs:622 "continued existence of this group's Civicsmith. Nothing unpublished appears, by construction:" [inline]
- bio-plane/src/public-read/index.mjs:1251 "assertion, and the group's acknowledgement of the bias the case was produced" [inline]
- bio-plane/src/public-read/index.mjs:1253 "group's Civicsmith reached (DEC-20, DEC-46). There is deliberatel…" [inline]
- bio-plane/src/publication/worker.mjs:112 "that hash is published, and this group's Civicsmith holds no bytes for it in its published store, …" [inline]
- bio-plane/src/publication/worker.mjs:126 "a court order this group complied with keeps these contents from being served here. …" [inline] T
- bio-plane/src/publication/worker.mjs:346 "… by anyone holding it, without the cooperation of this group's Civicsmith. Each" [inline]
- bio-plane/src/publication/worker.mjs:366 "that signature to this group's Civicsmith — the authenticated session that performed the…" [inline]
- bio-plane/src/publication/worker.mjs:367 "member or its founder — and it is this group's Civicsmith's record, not covered by any" [inline]
- bio-plane/src/publication/worker.mjs:544 "this group's Civicsmith has no published object store configured, so i…" [inline]
- bio-plane/src/publication/worker.mjs:545 "not servable. The hash is genuine and this group's Civicsmith cannot hand over the bytes." [inline]
- bio-plane/src/publication/worker.mjs:753 "this group's Civicsmith cannot hand over the bytes of that edition, so…" [inline] T
- bio-plane/src/publication/worker.mjs:832 "… by anyone holding it, without the cooperation of this group's Civicsmith." [inline]

### review (16)

- bio-plane/src/review/checks.mjs:64 "Handing a draft of the group's case to a named person, or withdrawing it, is an act" [check-row translation (inline copy)] T
- bio-plane/src/review/checks.mjs:65 "somebody in the group answers for, and the record names who did it. The credentia…" [check-row translation (inline copy)] T
- bio-plane/src/review/checks.mjs:87 "…oject's work; handing the draft to someone outside the group, and withdrawing a copy" [check-row translation (inline copy)] T
- bio-plane/src/review/checks.mjs:114 "This draft's arguments are larger than your group's Civicsmith will store: the limit is 64 KiB, the same" [check-row translation (inline copy)] T
- bio-plane/src/review/checks.mjs:149 "of the group, at most 50. To stop requiring approvals, turn the rule off…" [check-row translation (inline copy)] T
- bio-plane/src/review/checks.mjs:154 "You are not one of the people the group named to approve its cases before they are signed, or" [check-row translation (inline copy)] T
- bio-plane/src/review/index.mjs:107 "was addressed to without leaving the group that made it. It is not signed, it is not published, it may…" [inline] T
- bio-plane/src/review/index.mjs:148 "handing the group's draft to someone outside it is the producing project's ow…" [inline]
- bio-plane/src/review/index.mjs:455 "a review copy is an addressed act: somebody in this group hands a draft to a named" [inline]
- bio-plane/src/review/index.mjs:457 "may not put the group's draft in front of anyone. Sign in as a member." [inline]
- bio-plane/src/review/index.mjs:551 "name the person or group this copy is addressed to, in one line of at most" [inline]
- bio-plane/src/review/index.mjs:884 "set the group's approval rule" [inline]
- bio-plane/src/review/index.mjs:893 "… approval rule names one or more active members of the group by member id, at most" [inline]
- bio-plane/src/review/index.mjs:901 "every case of the group needs the approval of" [inline] T
- bio-plane/src/review/index.mjs:902 "the group requires no approvals before a case is signed" [inline] T
- bio-plane/src/review/index.mjs:917 "an approval is given by a member the group's approval rule names, of a case whose project" [inline]

### inquiry-grammar (15)

- bio-plane/src/inquiry-grammar/checks.mjs:73 "Dividing a question says the group asked one thing when it was really asking" [check-row translation (inline copy)] T
- bio-plane/src/inquiry-grammar/checks.mjs:74 "two, and that is a judgement about the group's own work. The credential that asked here" [check-row translation (inline copy)]
- bio-plane/src/inquiry-grammar/checks.mjs:90 "A leg on another group's finding names that finding and one edition, and nothing e…" [check-row translation (inline copy)] T
- bio-plane/src/inquiry-grammar/checks.mjs:98 "…leg on a standard rests on the text of that law as the group captured it, so the only grade it" [check-row translation (inline copy)] T
- bio-plane/src/inquiry-grammar/grammar.mjs:1272 ": a grade is inherited from a case the group SIGNED, at a stated edition, and from nothing else" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1398 ": a leg on another group's finding names the one edition it rests on, a positive who…" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1399 ".target_edition to the edition this group accepted" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1403 "is set on a leg on another group's finding (" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1408 ".content_id is set on a leg on another group's finding (" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1408 "…finding, and the parts it rests on are checked in that group's own case file" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1412 "names an extent on a leg on another group's finding (" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1412 "…finding, and the parts it rests on are checked in that group's own case file" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1416 ".extent_capture is set on a leg on another group's finding (" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1439 "].target names another group's finding (" [inline]
- bio-plane/src/inquiry-grammar/grammar.mjs:1478 ": a standard is law the group holds in captured text, so the only grade a leg on it carri…" [inline]

### ratification (15)

- bio-plane/src/ratification/checks.mjs:48 "Ratifying a case commits the group's own assertions about it — its scope, its" [check-row translation (inline copy)] T
- bio-plane/src/ratification/checks.mjs:69 "is one of the operator's access tokens for your group's Civicsmith, not a person: a valid signature does" [check-row translation (inline copy)] T
- bio-plane/src/ratification/checks.mjs:76 "Ratifying a case commits the group's own assertions about it under a member's" [check-row translation (inline copy)] T
- bio-plane/src/ratification/checks.mjs:78 "…d here is one of the operator's access tokens for your group's Civicsmith, not a person, and a valid" [check-row translation (inline copy)] T
- bio-plane/src/ratification/checks.mjs:229 "credited only to the group or the project, with no independent leg corroborating it. S…" [check-row translation (inline copy)] T
- bio-plane/src/ratification/checks.mjs:274 "This case edition can't be signed yet: the group requires named members to approve a case before" [check-row translation (inline copy)] T
- bio-plane/src/ratification/index.mjs:729 "a reader of the group's approvals is already registered; there is one, registered…" [inline]
- bio-plane/src/ratification/index.mjs:1104 "mean this plane asserting a group's case on their behalf. Review the case document" [inline]
- bio-plane/src/ratification/ops.mjs:92 "…s sha) and at ({date: YYYY-MM-DD, time: HH:MM}, in the group's time zone)" [inline]
- bio-plane/src/ratification/refusals.mjs:113 "attests, credited only to the group or the project with no independent leg corroborating it:" [inline]
- bio-plane/src/ratification/refusals.mjs:169 "the group's approval rule, or the approvals given for case" [inline]
- bio-plane/src/ratification/refusals.mjs:172 "the group requires" [inline] T
- bio-plane/src/ratification/schedule.mjs:63 "the acceptances of other groups' work" [inline] T
- bio-plane/src/ratification/schedule.mjs:68 "the acceptances of other groups' work" [inline] T
- bio-plane/src/ratification/schedule.mjs:139 "the group's approvals" [inline] T

### record-grammar (15)

- bio-plane/src/record-grammar/labels.mjs:85 "a member proposed this standard to whoever records the group's standards. It is a proposal" [inline] T
- bio-plane/src/record-grammar/labels.mjs:110 "can never state the group's position. Nothing here is the group's position" [inline] T
- bio-plane/src/record-grammar/labels.mjs:112 "to weigh and not the group's position, and the record holds who proposed it" [inline] T
- bio-plane/src/record-grammar/labels.mjs:151 "sign a statement. It is not the group's statement until a member adopts or rewrites it" [inline] T
- bio-plane/src/record-grammar/labels.mjs:153 "not the group's statement until a member adopts or rewrites it, and the r…" [inline] T
- bio-plane/src/record-grammar/labels.mjs:155 "not the group's statement until a member adopts or rewrites it" [inline] T
- bio-plane/src/record-grammar/labels.mjs:202 "as "Draft", and not the group's wording until a member granted that language adopts it" [inline]
- bio-plane/src/record-grammar/labels.mjs:204 "and not the group's wording until a member granted that language adopts it, a…" [inline] T
- bio-plane/src/record-grammar/labels.mjs:206 "as "Draft", and not the group's wording until a member granted that language adopts it" [inline]
- bio-plane/src/record-grammar/labels.mjs:224 "never find against one. It is never a finding of the group" [inline] T
- bio-plane/src/record-grammar/labels.mjs:226 "It is a draft and never a finding of the group, and the record holds who proposed it" [inline] T
- bio-plane/src/record-grammar/labels.mjs:228 "they cite. It is a draft and never a finding of the group" [inline] T
- bio-plane/src/record-grammar/labels.mjs:237 "reading and never the group's reading until a member records it" [inline] T
- bio-plane/src/record-grammar/labels.mjs:239 "and never the group's reading until a member records it, and the record holds w…" [inline] T
- bio-plane/src/record-grammar/labels.mjs:241 "proposed reading and never the group's reading until a member records it" [inline] T

### acquisition (14)

- bio-plane/src/acquisition/index.mjs:561 "is one of your group's own hosts; nothing was fetched or filed" [inline]
- bio-plane/src/acquisition/index.mjs:576 "your group's Civicsmith has no evidence storage configured" [inline] T
- bio-plane/src/acquisition/index.mjs:584 "your group's Civicsmith fetches a requested document only from inside …" [inline] T
- bio-plane/src/acquisition/index.mjs:681 "…the export format and the producer are DERIVED by your group's Civicsmith from the" [inline]
- bio-plane/src/acquisition/index.mjs:775 "renders are running in your group's Civicsmith, which runs at most" [inline]
- bio-plane/src/acquisition/index.mjs:899 ", which your group's Civicsmith composed from the" [inline]
- bio-plane/src/acquisition/keyed.mjs:66 "the keyed services your group's Civicsmith speaks to are" [inline]
- bio-plane/src/acquisition/keyed.mjs:84 "is one of your group's own hosts; nothing was fetched" [inline]
- bio-plane/src/acquisition/keyed.mjs:94 "the group's key for this service is off or not held; the caller goes …" [inline]
- bio-plane/src/acquisition/keyed.mjs:112 "…did not complete; its error is not carried because the group's key rode it" [inline]
- bio-plane/src/acquisition/unpack.mjs:356 "set whether your group's captures ask a public archive for a copy" [inline]
- bio-plane/src/acquisition/unpack.mjs:504 "your group's Civicsmith has no evidence storage configured" [inline] T
- bio-plane/src/acquisition/unpack.mjs:698 "held by your group's Civicsmith, cut out and verified by size and CRC-32 at" [inline]
- bio-plane/src/acquisition/unpack.mjs:789 "no archive your group holds and you may see answers to that digest" [inline]

### actions (14)

- bio-plane/src/actions/index.mjs:167 "contact names a member of your group by member id, and this one names none." [inline]
- bio-plane/src/actions/index.mjs:720 "group's Civicsmith offers: one of" [inline] T
- bio-plane/src/actions/index.mjs:825 "…premise override is a member's open statement that the group acts on" [inline]
- bio-plane/src/actions/index.mjs:876 "the group's contact for an action is a member's choice; a machine" [inline] T
- bio-plane/src/actions/index.mjs:1039 "whether a body owes the group a reply is a member's" [inline]
- bio-plane/src/actions/index.mjs:1085 "who spoke for the group in a sending is a member's statement; a" [inline]
- bio-plane/src/actions/index.mjs:1262 "your group's Civicsmith yet, so none could be found. Nothing was writt…" [inline] T
- bio-plane/src/actions/index.mjs:1730 "this action states that the body owes the group no reply, so silence is never" [inline]
- bio-plane/src/actions/index.mjs:1832 "your group's jurisdiction states it. Nothing was written." [inline]
- bio-plane/src/actions/index.mjs:1912 "…eaker is the member id of the member who spoke for the group in this sending." [inline]
- bio-plane/src/actions/index.mjs:1948 "marking pressure directed at the group is a member's judgement; a" [inline]
- bio-plane/src/actions/index.mjs:3020 "the group's" [inline] T
- bio-plane/src/actions/index.mjs:3088 "the group's open actions with this office, shown as facts. Nothing is…" [inline] T
- bio-plane/src/actions/index.mjs:3197 "would quote instead of the thing the group can defend." [inline]

### answer-envelope (14)

- bio-plane/src/answer-envelope/checks.mjs:33 "This group's Civicsmith has no operation by that name. A version older…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:44 "This group's Civicsmith could not consult its own records just now, so…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:56 "This group's Civicsmith failed while handling the request, before it c…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:57 "That is a fault in this group's Civicsmith, not a statement about what the record holds o…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:68 "This group's Civicsmith failed inside its own record while carrying ou…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:69 "was produced. That is a fault in this group's Civicsmith, not a statement about what the record holds o…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:81 "Your group's Civicsmith is preserving records under a litigation hold,…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:93 "This group's Civicsmith keeps a trace of sign-ins only when it runs as…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:105 "Your group's Civicsmith has no administrator token set, so it cannot b…" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:111 "The administrator token of your group's Civicsmith is a value published in the project's public" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:112 "…o claim it: anyone can read it. Whoever installed your group's" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:118 "… administrator token given does not match the one your group's Civicsmith holds, so it was" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/checks.mjs:142 "…s it is a replay of the record's own history, and your group's Civicsmith could not" [check-row translation (inline copy)] T
- bio-plane/src/answer-envelope/index.mjs:251 "this group's Civicsmith could not consult its own record, so nothing h…" [inline] T

### inquiry (14)

- bio-plane/src/inquiry/index.mjs:1787 "…S TO A FINDING NOBODY PUBLISHED (D-79): a question the group" [inline]
- bio-plane/src/inquiry/index.mjs:2012 "dividing is a named member's judgement that the group's own question was malformed —" [inline]
- bio-plane/src/inquiry/index.mjs:2206 "'s children would be new documents that must name the group that produced them; this store" [inline]
- bio-plane/src/inquiry/index.mjs:2626 "group, where each ord is a leg's position in this question's basi…" [inline]
- bio-plane/src/inquiry/index.mjs:2649 "a published case's composed strength and its per-group breakdown are inside signed," [inline]
- bio-plane/src/inquiry/index.mjs:2713 "grounds must be an ARRAY of groups, each { ground, legs: [ord, ...] }" [inline]
- bio-plane/src/inquiry/index.mjs:2726 "].legs must be an array of ordinals — a group is a partition OF THE" [inline]
- bio-plane/src/inquiry/index.mjs:2727 "LEGS, and a group naming none asserts that nothing is enough on its own. Legs…" [inline]
- bio-plane/src/inquiry/index.mjs:2741 ". An ordinal that addresses no leg groups nothing." [inline]
- bio-plane/src/inquiry/index.mjs:2745 "] is claimed by two groups. A leg belongs to exactly ONE group: a" [inline]
- bio-plane/src/inquiry/index.mjs:2820 "runs at the write, so nothing was written. Every group is a claim that its legs are" [inline]
- bio-plane/src/inquiry/index.mjs:2860 "group(s) over" [inline]
- bio-plane/src/inquiry/index.mjs:2885 "…nquiry_ground_changes (bundle_id, at, by, act, reason, groups, strength_before, strength_after)" [inline]
- bio-plane/src/inquiry/schema.mjs:181 "groups           TEXT NOT NULL," [inline]

### intent (13)

- bio-plane/src/intent/checks.mjs:67 "propose; it may not decide what the group pursues. Sign in as a member. Nothing was written." [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:89 "What the group holds to is its members' decision, and so is setting one as…" [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:99 "…ring an aspiration records what pursuing it taught the group, and nothing was written there." [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:110 "group's, and so is the choice to pursue it. Sign in as a member. …" [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:119 "An aspiration belongs to the group, to one project, or to one member, and a project's or a" [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:134 "…already registered. A source registers once, when your group's" [check-row translation (inline copy)] T
- bio-plane/src/intent/checks.mjs:154 "registers once, when your group's Civicsmith starts." [check-row translation (inline copy)] T
- bio-plane/src/intent/index.mjs:61 "…eclaring, revising or retiring an aspiration the whole group holds" [inline] T
- bio-plane/src/intent/index.mjs:63 "whole group holds in their own name, and the act carries their name and…" [inline] T
- bio-plane/src/intent/index.mjs:297 "an aspiration is the group's (naming no owner), a project's or a member's (naming" [inline]
- bio-plane/src/intent/index.mjs:932 "an aspiration is the group's (naming no owner), a project's or a member's (naming" [inline]
- bio-plane/src/intent/index.mjs:964 "a project departs only from an aspiration the whole group holds; a project's or a" [inline]
- bio-plane/src/intent/index.mjs:969 "a departure from the group's aspiration records why. Nothing was written." [inline]

### conformance (12)

- bio-plane/src/conformance/checks.mjs:102 "…lication and held unsigned by this project; or another group's finding this group has" [check-row translation (inline copy)]
- bio-plane/src/conformance/checks.mjs:192 "…estion states what the standard requires, a or b. Your group's Civicsmith" [check-row translation (inline copy)] T
- bio-plane/src/conformance/checks.mjs:222 "the other group withdrew or revised the edition accepted). A member re-eval…" [check-row translation (inline copy)]
- bio-plane/src/conformance/index.mjs:156 "Another group's finding, accepted by this group at the edition named: rea…" [inline] T
- bio-plane/src/conformance/index.mjs:374 "another group's determination is never adopted as this group's: a" [inline]
- bio-plane/src/conformance/index.mjs:375 "member of this group determines, against standards in this group's record. Nothi…" [inline]
- bio-plane/src/conformance/index.mjs:674 "accepted from another group (R14). Nothing was written." [inline]
- bio-plane/src/conformance/index.mjs:693 "…lication and held unsigned by this project, or another group's finding accepted at the" [inline]
- bio-plane/src/conformance/index.mjs:1272 "the source group's moves could not be read" [inline] T
- bio-plane/src/conformance/index.mjs:1279 "the source group withdrew the edition this determination rests on" [inline] T
- bio-plane/src/conformance/index.mjs:1287 "the source group published a newer edition, not accepted here" [inline] T
- bio-plane/src/conformance/index.mjs:1780 "b: your group's Civicsmith never chooses it. Nothing was written." [inline]

### interface-assets (12)

- bio-plane/src/interface-assets/index.mjs:16 "placeholders. Faces: faces.css (shipped inside the group's copy, principle 9.6)." [inline]
- bio-plane/src/interface-assets/index.mjs:21 "a refusal, something visible outside the group); each evidence scale has its own hue;" [inline]
- bio-plane/src/interface-assets/index.mjs:22 "machine work and another group's work carry no hue and are told apart by edge, mark" [inline]
- bio-plane/src/interface-assets/index.mjs:24 "…hree voices in type: serif for words people wrote (the group's questions, findings and" [inline]
- bio-plane/src/interface-assets/index.mjs:65 "<symbol id="i-group" viewBox="0 0 16 16"><circle class="s" cx="5.75" cy="5.5" r…" [inline]
- bio-plane/src/interface-assets/index.mjs:239 "working: paper ground, the group's masthead, the standing band" [inline]
- bio-plane/src/interface-assets/index.mjs:240 "published: the clean sheet, the group's name large, no band" [inline]
- bio-plane/src/interface-assets/index.mjs:241 "imported: the working frame with another group's band and double edge" [inline]
- bio-plane/src/interface-assets/index.mjs:523 "it explains. Timing (DEC-161, after Nielsen Norman Group's timing guidelines): on hover it waits 0.5 s with the poin…" [inline]
- bio-plane/src/interface-assets/index.mjs:540 "…ecurity screen (K1875, DEC-165): the level against the group's usual, and a map of kinds over time." [inline]
- bio-plane/src/interface-assets/index.mjs:595 "shipped inside the group's copy and never fetched from outside (principle 9.6). Lati…" [inline]
- bio-plane/src/interface-assets/index.mjs:596 "…er scripts fall back to the device's own faces until a group adds a language that needs them. */" [inline]

### run-rules (12)

- bio-plane/src/run-rules/checks.mjs:280 "…cument is kept away from the assistant by a limit your group put on" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:291 "…tter itself, and the answers people wrote for it. Your group's own tests show how" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:339 "group's Civicsmith. Everything else works without it." [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:434 "Nothing was run, because your group's Civicsmith could not find an account to run it under." [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:511 "in force for it — somewhere else the group's declared lens can be a different one, so the two" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:653 "group's Civicsmith yet. Kinds of work are switched on one at a ti…" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:690 "…ause a planning run is started only by a member of the group, for one plan" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:741 "an API key of your own, and your group has no API key of its own switched on, or the account that …" [check-row translation (inline copy)] T
- bio-plane/src/run-rules/checks.mjs:742 "… off. Connect yours, or ask an administrator about the group's." [check-row translation (inline copy)] T
- bio-plane/src/run-rules/deployment.mjs:219 "nothing of the record: only the passage of the group's own writing the door hands in, to be put into the asking …" [inline]
- bio-plane/src/run-rules/rules.mjs:212 "pages of documents the group holds that the run may read inside — the run's reading boun…" [inline] T
- bio-plane/src/run-rules/rules.mjs:450 "a question the group is working on, which any project may draw on" [inline] T

### file-safety (11)

- bio-plane/src/file-safety/index.mjs:750 "Your group's Civicsmith holds no evidence store, so no bytes can be se…" [inline] T
- bio-plane/src/file-safety/index.mjs:826 "Your group's Civicsmith has no safe view installed. Nothing was render…" [inline] T
- bio-plane/src/file-safety/index.mjs:880 "Your group's Civicsmith has no safe view installed. Nothing was render…" [inline] T
- bio-plane/src/file-safety/index.mjs:894 "Your group's Civicsmith could not read the files waiting for a safe vi…" [inline] T
- bio-plane/src/file-safety/index.mjs:910 "Your group's Civicsmith could not read the files waiting for a safe vi…" [inline] T
- bio-plane/src/file-safety/index.mjs:932 "Your group's Civicsmith has no file scanner installed. No note was wri…" [inline] T
- bio-plane/src/file-safety/index.mjs:1074 "reading the group's security tools" [inline]
- bio-plane/src/file-safety/index.mjs:1169 "No tool of the group's has this id." [inline]
- bio-plane/src/file-safety/index.mjs:1181 "Your group's Civicsmith has no file scanner installed, so no tool can …" [inline] T
- bio-plane/src/file-safety/index.mjs:1487 "Your group's Civicsmith has no file scanner installed, so no tool can …" [inline] T
- bio-plane/src/file-safety/index.mjs:1582 "Your group's Civicsmith has no file scanner installed, so no list was …" [inline] T

### local-facts (11)

- bio-plane/src/local-facts/index.mjs:454 "… first, for a member to report for a profile fix; your group's Civicsmith transmits nothing" [inline] T
- bio-plane/src/local-facts/index.mjs:627 "… correcting or disputing a local fact, or confirming a group's" [inline]
- bio-plane/src/local-facts/rules.mjs:149 "the group's rule" [inline] T
- bio-plane/src/local-facts/rules.mjs:197 "the group's rule," [inline]
- bio-plane/src/local-facts/rules.mjs:221 "The group's rule" [inline] T
- bio-plane/src/local-facts/rules.mjs:221 "the group" [inline] T
- bio-plane/src/local-facts/rules.mjs:344 "; only a confirmed rule the group still applies is offered." [inline]
- bio-plane/src/local-facts/rules.mjs:351 "…tes to the shared profile's maintainers yourself; your group's Civicsmith transmits nothing" [inline] T
- bio-plane/src/local-facts/rules.mjs:361 "drafting or withdrawing a group's rule is a named member's act; an" [inline]
- bio-plane/src/local-facts/rules.mjs:370 "a group's rule is drafted in" [inline]
- bio-plane/src/local-facts/rules.mjs:387 "the group holds no rule of its own by that id." [inline]

### standards (11)

- bio-plane/src/standards/checks.mjs:117 "… recorded with your reason: in your own words, why the group holds its government to" [check-row translation (inline copy)] T
- bio-plane/src/standards/checks.mjs:146 "The series named for this standard is not one your group's jurisdiction profiles list. Name a series" [check-row translation (inline copy)] T
- bio-plane/src/standards/checks.mjs:208 "This standard is already seen by every member of your group, so there is nothing to release. Nothing" [check-row translation (inline copy)] T
- bio-plane/src/standards/checks.mjs:259 "The question named is not one your group's record holds that you may see. Name one, or none." [check-row translation (inline copy)] T
- bio-plane/src/standards/index.mjs:281 "your group's Civicsmith has no active jurisdiction profile, so no sour…" [inline] T
- bio-plane/src/standards/index.mjs:284 "the active jurisdiction profiles of your group's Civicsmith could not be combined (" [inline] T
- bio-plane/src/standards/index.mjs:382 "group holds its government to this standard, kept with it and rea…" [inline] T
- bio-plane/src/standards/index.mjs:548 "group's own sending or a member's account of what was heard; the …" [inline]
- bio-plane/src/standards/index.mjs:880 "no question your group's record holds that you may see answers to that id." [inline]
- bio-plane/src/standards/index.mjs:1808 "your group. Nothing was written." [inline] T
- bio-plane/src/standards/index.mjs:1824 "released to every member of your group from now on; a release is never undone" [inline] T

### network-notices (10)

- bio-plane/src/network-notices/checks.mjs:12 "… in as themselves, prepares or posts a notice that the group is working on" [check-row translation (inline copy)] T
- bio-plane/src/network-notices/checks.mjs:17 "Only an owner of the project tells the network the group is working on it. Nothing was published." [check-row translation (inline copy)] T
- bio-plane/src/network-notices/checks.mjs:26 "Your group has no name recorded yet, and a notice is never anonymous. …" [check-row translation (inline copy)] T
- bio-plane/src/network-notices/checks.mjs:31 "Your group's Civicsmith holds no signing key of its own, so it cannot …" [check-row translation (inline copy)] T
- bio-plane/src/network-notices/checks.mjs:36 "Say what the group is working on in one line of at most 280 characters. A subj…" [check-row translation (inline copy)] T
- bio-plane/src/network-notices/checks.mjs:64 "Your group's Civicsmith holds no prepared notice from you with this fi…" [check-row translation (inline copy)] T
- bio-plane/src/network-notices/index.mjs:102 "this group's Civicsmith key" [inline] T
- bio-plane/src/network-notices/index.mjs:256 "no group slug is recorded, and there are no anonymous notices" [inline]
- bio-plane/src/network-notices/index.mjs:258 "your group's Civicsmith holds no signing key of its own, and a notice …" [inline] T
- bio-plane/src/network-notices/index.mjs:395 "your group's Civicsmith holds no signing key of its own, and a notice …" [inline] T

### queue (10)

- bio-plane/src/queue/index.mjs:664 "This one is a checkpoint your group set in an action plan, keyed by the plan, scenario" [inline]
- bio-plane/src/queue/index.mjs:670 "This one is a reminder you asked for on one of the group's action deadlines, keyed by the" [inline]
- bio-plane/src/queue/index.mjs:673 "This one is a reply your group marked as legal pressure, keyed by the action and the entry" [inline]
- bio-plane/src/queue/index.mjs:680 "…s one is a holiday calendar or office hours one of the group's deadlines reads, keyed by the" [inline]
- bio-plane/src/queue/index.mjs:709 "This one is a review day your group set for a plan, keyed by the plan and the day rather than b…" [inline]
- bio-plane/src/queue/index.mjs:711 "This one is the date your group set to look again at a paused plan, keyed by the plan and t…" [inline]
- bio-plane/src/queue/index.mjs:714 "This one is a release of your group's Civicsmith that is ready to install, one to-do for every" [inline]
- bio-plane/src/queue/index.mjs:1989 "…date is snoozed until the start of that day where this group is, and no time zone" [inline]
- bio-plane/src/queue/index.mjs:1999 ") where this group is; a snooze that has already expired is" [inline]
- bio-plane/src/queue/index.mjs:2029 "that day has already begun where this group is, so the snooze, which holds until its start, has already" [inline]

### reading-guides (10)

- bio-plane/src/reading-guides/index.mjs:287 "is already the group's. Nothing was written." [inline]
- bio-plane/src/reading-guides/index.mjs:330 "is the group's, and is retired by a member other than its author. Nothin…" [inline]
- bio-plane/src/reading-guides/index.mjs:351 "already provides the channel between groups" [inline]
- bio-plane/src/reading-guides/index.mjs:410 "what was given is not another group's offer of a reading guide, byte" [inline]
- bio-plane/src/reading-guides/index.mjs:595 "… procedure guide is for one of the action kinds of the group's jurisdiction profiles:" [inline]
- bio-plane/src/reading-guides/index.mjs:596 "a procedure guide is for an action kind of the group's jurisdiction profiles, and they list none." [inline]
- bio-plane/src/reading-guides/index.mjs:613 "comes with every copy of Civicsmith and no group can change it. Nothing was written." [inline]
- bio-plane/src/reading-guides/index.mjs:637 "is not yet the group's. Nothing was sent." [inline]
- bio-plane/src/reading-guides/index.mjs:644 "no group slug is recorded, so an offer cannot be labeled. Nothing wa…" [inline]
- bio-plane/src/reading-guides/library.mjs:30 "its state is not group" [inline]

### reevaluation (10)

- bio-plane/src/reevaluation/index.mjs:186 "no module holding another group's work is registered, so no acceptance withdrawal or" [inline] T
- bio-plane/src/reevaluation/index.mjs:191 "the module holding another group's work keeps no publisher moves here, so no new edition or …" [inline] T
- bio-plane/src/reevaluation/index.mjs:292 "this leg rests on another group's finding" [inline] T
- bio-plane/src/reevaluation/index.mjs:464 "has been set down. It is reversible and the group may pick it back" [inline]
- bio-plane/src/reevaluation/index.mjs:860 "this leg rests on another group's finding" [inline] T
- bio-plane/src/reevaluation/index.mjs:861 ", and this group's acceptance of that" [inline] T
- bio-plane/src/reevaluation/index.mjs:863 "group published it and the leg is unchanged; whether this finding…" [inline]
- bio-plane/src/reevaluation/index.mjs:1201 ": what the group knows of who gave it" [inline]
- bio-plane/src/reevaluation/index.mjs:2104 "this group's acceptance of another group's work was withdrawn (" [inline]
- bio-plane/src/reevaluation/index.mjs:2161 "each finding listed rests on another group's finding at an edition its publisher has since replaced" [inline] T

### ai-use (9)

- bio-plane/src/ai-use/index.mjs:330 "the use names no paying account: 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:489 "the group account's limits and use" [inline]
- bio-plane/src/ai-use/index.mjs:566 "a limit's owner is 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:571 "(per_member only for a group's or a project's account)" [inline]
- bio-plane/src/ai-use/index.mjs:650 "use is read for 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:809 "exploring is approved for 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:851 "an estimate is for 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:888 "limits are read for 'group', 'project:<id>' or 'member:<id>'." [inline]
- bio-plane/src/ai-use/index.mjs:933 "use over time is read for 'group', 'project:<id>' or 'member:<id>'." [inline]

### case-carriage (9)

- bio-plane/src/case-carriage/checks.mjs:28 "…plates and camera details removed for publication; the group holds the original" [word-table key photo.obscured.label] T
- bio-plane/src/case-carriage/checks.mjs:29 "Camera details removed for publication; the group holds the original" [word-table key photo.published.label] T
- bio-plane/src/case-carriage/checks.mjs:34 "…ile, and of its pictures, removed for publication; the group holds the original" [word-table key document.cleaned.label] T
- bio-plane/src/case-carriage/checks.mjs:60 "Your group's Civicsmith holds no photo you can see under that digest. …" [inline] T
- bio-plane/src/case-carriage/checks.mjs:90 "Your group's Civicsmith has no evidence store to make a document's pub…" [inline] T
- bio-plane/src/case-carriage/index.mjs:259 "your group's Civicsmith holds no text of that observation at its diges…" [inline] T
- bio-plane/src/case-carriage/index.mjs:262 "your group's Civicsmith holds no bytes of that document at its digest" [inline] T
- bio-plane/src/case-carriage/index.mjs:277 "your group's Civicsmith holds no whole extracted text of that document…" [inline] T
- bio-plane/src/case-carriage/index.mjs:298 "your group's Civicsmith could not record it" [inline] T

### contradiction (9)

- bio-plane/src/contradiction.mjs:32 "… KEY). You propose ONE label per pair. A member of the group" [inline]
- bio-plane/src/contradiction.mjs:37 "- K2: two claims our group HOLDS, on two inquiries about the same subject." [inline]
- bio-plane/src/contradiction.mjs:38 "- K3: two claims our group HOLDS, both resting on the same source passage (given as co…" [inline]
- bio-plane/src/contradiction.mjs:44 "- record: two things our group HOLDS cannot both be true. Only for held claims (K2, K3)." [inline]
- bio-plane/src/contradiction.mjs:100 "…iffer, so that they need not conflict. A member of the group will see your recommendation and" [inline]
- bio-plane/src/contradiction/index.mjs:137 "two things the group HOLDS about one subject — the case that carries a duty" [inline] T
- bio-plane/src/contradiction/index.mjs:184 "or rejected reading is not something the group HOLDS, so there is no held assertion" [inline] T
- bio-plane/src/contradiction/index.mjs:186 "…dings exist and none of them carries a CLAIM. What the group holds is" [inline] T
- bio-plane/src/contradiction/index.mjs:581 "…t the same registered subject, each with a reading the group ACCEPTED" [inline] T

### promotion (9)

- bio-plane/src/promotion/index.mjs:192 "a project by that name already exists in your group's Civicsmith, compared without regard to case or spacing. T…" [inline]
- bio-plane/src/promotion/index.mjs:544 "this store records no producing group, and this creation names none — neither a group: line in it…" [inline]
- bio-plane/src/promotion/index.mjs:545 "bundle.md nor a group in its meta. The record does not supply one. Nothing was cr…" [inline]
- bio-plane/src/promotion/index.mjs:655 "…roject needs a name, and it must be unique across your group's Civicsmith" [inline]
- bio-plane/src/promotion/index.mjs:711 "with the group the record holds, or with none. Nothing was written." [inline] T
- bio-plane/src/promotion/index.mjs:1110 "…ning is a named member's judgement that a question the group set down has to be worked again. A" [inline]
- bio-plane/src/promotion/index.mjs:1111 "…ce a question and pursue one, and may not overturn the group's own" [inline]
- bio-plane/src/promotion/index.mjs:1143 "reopening picks up something the group SET DOWN (deferred or dismissed) or a finding that is" [inline]
- bio-plane/src/promotion/names.mjs:84 "give the project a title unique across your group's Civicsmith" [inline]

### steps (9)

- bio-plane/src/steps/checks.mjs:14 "…ne or more questions, in one project, or for the whole group: exactly one of these, and a step is never placed inside an…" [check-row translation (inline copy)] T
- bio-plane/src/steps/index.mjs:391 "no time zone is held for your group's Civicsmith, so the local day is not known" [inline] T
- bio-plane/src/steps/index.mjs:454 "no time zone is held for your group's Civicsmith, so the local day is not known" [inline] T
- bio-plane/src/steps/index.mjs:549 "SELECT * FROM steps WHERE place_kind = 'group' ORDER BY step_id" [inline]
- bio-plane/src/steps/index.mjs:558 "a step names its place: {questions}, {project} or {group: true}" [inline]
- bio-plane/src/steps/index.mjs:561 "…p's place is exactly one of {questions}, {project} or {group: true}, and never a step (R21)" [inline]
- bio-plane/src/steps/index.mjs:563 "a group step's place is {group: true}" [inline]
- bio-plane/src/steps/index.mjs:845 "a group step is the group's, and its place is fixed at creation" [inline]
- bio-plane/src/steps/index.mjs:1087 "no time zone is held for your group's Civicsmith, or no instant was given" [inline] T

### agent-runner (8)

- agent-runner/src/signin.mjs:85 "Your group's Civicsmith could not read this request to connect Claude.…" [inline] T
- agent-runner/src/signin.mjs:86 "Your group's Civicsmith could not tell which member this is for. Sign …" [inline] T
- agent-runner/src/signin.mjs:87 "Another member of your group is connecting Claude right now. Wait a few minutes, then tr…" [inline]
- agent-runner/src/signin.mjs:91 "Your group's Civicsmith cannot start Claude's sign-in: Claude Code is …" [inline] T
- agent-runner/src/signin.mjs:95 "Your group's Civicsmith could not run Claude's sign-in just now. Wait …" [inline] T
- agent-runner/src/signin.mjs:96 "…gn-in gave an address that is not Anthropic's, so your group's Civicsmith did not show it. Tell your group's steward." [inline]
- agent-runner/src/signin.mjs:98 "Claude answered the code, but not with a token your group's Civicsmith can use. Start connecting Claude again." [inline]
- agent-runner/src/worker.mjs:27 "Your group's Civicsmith could not start its Claude connection just now…" [inline] T

### accepted-work (8)

- bio-plane/src/accepted-work/checks.mjs:11 "This finding rests on another group's finding that this group has not accepted at that edition." [check-row translation (inline copy)] T
- bio-plane/src/accepted-work/checks.mjs:17 "Another group's work this finding rests on could not be read, so whether …" [check-row translation (inline copy)] T
- bio-plane/src/accepted-work/index.mjs:31 "no module holding another group's work is registered here, so none can be read" [inline] T
- bio-plane/src/accepted-work/index.mjs:34 "the module holding another group's work keeps no publisher moves here, so none can be read" [inline] T
- bio-plane/src/accepted-work/index.mjs:35 "the module holding another group's work keeps no flag history here, so none can be read" [inline]
- bio-plane/src/accepted-work/index.mjs:37 "the module holding another group's work could not answer" [inline]
- bio-plane/src/accepted-work/index.mjs:170 "a leg rests on another group's finding without an acceptance of that edition known to be…" [inline]
- bio-plane/src/accepted-work/index.mjs:200 "…and no acceptance of that edition is in force for this group" [inline]

### action-producers (8)

- bio-plane/src/action-producers/index.mjs:221 "no time zone is held for it in your group's Civicsmith, so the local day it is counted from is" [inline]
- bio-plane/src/action-producers/index.mjs:822 "that the group is preserving what the matter may reach (a hold in place), …" [inline]
- bio-plane/src/action-producers/index.mjs:839 ". Record that the group is preserving" [inline]
- bio-plane/src/action-producers/index.mjs:855 "group is preserving what the matter may reach: a hold placed from…" [inline]
- bio-plane/src/action-producers/index.mjs:1226 "the group" [inline] T
- bio-plane/src/action-producers/index.mjs:1360 "because the group asked for it." [inline]
- bio-plane/src/action-producers/words.mjs:16 "Your group's deadline to {what} with {venue} was {date}, and nothing i…" [word-table key queue.action-clock-overdue.ours.detail] T
- bio-plane/src/action-producers/words.mjs:18 "Your group set {plan} to be reviewed every {rhythm}, and nothing has b…" [word-table key queue.plan-review-due.detail] T

### ai-runs (8)

- bio-plane/src/ai-runs/index.mjs:1473 "a group's own step has no question or project for" [inline]
- bio-plane/src/ai-runs/index.mjs:2199 "their own is connected, and the group's key is not set or not on), and a run continues only on th…" [inline]
- bio-plane/src/ai-runs/index.mjs:2208 "a member's credential opened it, and your group's Civicsmith resumes only runs its own organisation credent…" [inline]
- bio-plane/src/ai-runs/index.mjs:2209 "…D-260, DEC-55 (4): continuing a member's run under the group's key would re-attribute its acts)." [inline]
- bio-plane/src/ai-runs/index.mjs:3381 "connected none of their own, and the group's key is not set or not on. Nothing was started." [inline]
- bio-plane/src/ai-runs/index.mjs:3491 "a group's test investigation is added by one of its active members." [inline]
- bio-plane/src/ai-runs/index.mjs:3492 "a group's test investigation names its part, its matter and the ans…" [inline]
- bio-plane/src/ai-runs/index.mjs:3513 "WHERE set_name = 'group' AND part = ? ORDER BY seq" [inline]

### citation (8)

- bio-plane/src/citation/checks.mjs:53 "The group has retired this material, recording that it is superseded …" [check-row translation (inline copy)] T
- bio-plane/src/citation/checks.mjs:65 "with it. A question the group has not asked and one you have not been shown are answered" [check-row translation (inline copy)] T
- bio-plane/src/citation/index.mjs:286 "the group has RETIRED these since the edge was severed, recording tha…" [inline]
- bio-plane/src/citation/index.mjs:510 "registry, and your group's Civicsmith was created without them, so nothing was writt…" [inline]
- bio-plane/src/citation/index.mjs:559 "a case rests on material, or on a question the group is asking. These members of the" [inline]
- bio-plane/src/citation/index.mjs:570 "the group has RETIRED these, recording that they are superseded or no…" [inline]
- bio-plane/src/citation/index.mjs:888 "the group has RETIRED this, recording that it is superseded or no lon…" [inline]
- bio-plane/src/citation/recorded.mjs:153 "module's leg projection, and your group's Civicsmith was created without it, so this read could not…" [inline]

### escalation (8)

- bio-plane/src/escalation/checks.mjs:24 "Only an escalation your group stopped pursuing can be reopened. Nothing was written." [word-table key refusal.NOT_STOPPED] T
- bio-plane/src/escalation/checks.mjs:197 "undetermined or unproven. If the group judges the breach had no consequence, record that as an ass…" [check-row translation (inline copy)] T
- bio-plane/src/escalation/checks.mjs:235 "Recording that the group is not pursuing a breach is a member's act, in the member's…" [check-row translation (inline copy)] T
- bio-plane/src/escalation/checks.mjs:248 "…e record this answer depends on cannot be read by your group's Civicsmith yet, so nothing" [check-row translation (inline copy)] T
- bio-plane/src/escalation/index.mjs:796 "stopped pursuing: the group decided to stop pursuing" [inline] T
- bio-plane/src/escalation/index.mjs:1281 ". A group" [inline] T
- bio-plane/src/escalation/index.mjs:1471 "recorded as the group's decline to escalate now; a later decline or an escalation…" [inline] T
- bio-plane/src/escalation/index.mjs:1711 ": the group stopped pursuing it at" [inline] T

### action-clocks (7)

- bio-plane/src/action-clocks/checks.mjs:73 "group, the body, or not stated), and any time of day falls on tha…" [check-row translation (inline copy)] T
- bio-plane/src/action-clocks/count.mjs:172 "whether your group has confirmed the calendar was not read" [inline] T
- bio-plane/src/action-clocks/count.mjs:226 "no service of the group's papers on that party is recorded on this action, the even…" [inline] T
- bio-plane/src/action-clocks/count.mjs:229 "…holds no sent entry: the counterparty's receipt of the group's request is counted from it" [inline] T
- bio-plane/src/action-clocks/index.mjs:1334 "…mes no basis kind and no owed_by, so whether it is the group's own is not stated" [inline] T
- bio-plane/src/action-clocks/index.mjs:1378 "an index over the group's own deadlines (what the group owes, its dependencies and …" [inline] T
- bio-plane/src/action-clocks/index.mjs:1450 "Basis: the group's own window" [inline] T

### basis-versions (7)

- bio-plane/src/basis-versions/checks.mjs:787 "answer is that the group could not settle it, write that down — an answer of undeter…" [check-row translation (inline copy)] T
- bio-plane/src/basis-versions/index.mjs:100 "all — a standing objective the group means to pursue — but concluding one that" [inline]
- bio-plane/src/basis-versions/index.mjs:368 "rests on another group's finding" [inline] T
- bio-plane/src/basis-versions/index.mjs:636 "this entry names an act your group's Civicsmith does not know, so what the project" [inline]
- bio-plane/src/basis-versions/index.mjs:1212 "two different claims about this finding and your group's Civicsmith will not choose" [inline]
- bio-plane/src/basis-versions/index.mjs:1328 "not accepted. A conclusion adopts only what the group accepted." [inline]
- bio-plane/src/basis-versions/index.mjs:1660 "is one your group's Civicsmith cannot read, so what it" [inline]

### calibration (7)

- bio-plane/src/calibration.mjs:126 "day(s), which your group's Civicsmith runs on its own account" [inline] T
- bio-plane/src/calibration.mjs:287 "…thored act, so an automatic upgrade here would be your group's" [inline]
- bio-plane/src/calibration/index.mjs:269 "…o module derives obligations from calibrations in your group's Civicsmith, so" [inline] T
- bio-plane/src/calibration/index.mjs:301 "your group's Civicsmith probes" [inline] T
- bio-plane/src/calibration/index.mjs:302 "no engine is registered for calibration in your group's Civicsmith, so no probe is scheduled" [inline] T
- bio-plane/src/calibration/index.mjs:391 "is registered for calibration in your group's Civicsmith. Registering is not measuring: no" [inline] T
- bio-plane/src/calibration/index.mjs:436 "engine(s) are due a calibration probe. Your group's Civicsmith runs no derivation" [inline] T

### filings (7)

- bio-plane/src/filings/index.mjs:689 "no module answers the group's templates here, so none is readable" [inline]
- bio-plane/src/filings/index.mjs:1032 "own_doing lists the indexes of sentences about the group's own doing" [inline]
- bio-plane/src/filings/index.mjs:1274 "rewrite each sentence that asks for the benefit of the group or its members; there is no override" [inline]
- bio-plane/src/filings/index.mjs:1326 "…n notes are never approved, stamped or recorded as the group's act" [inline]
- bio-plane/src/filings/index.mjs:2328 "' is a machine identity: the group names its counsel" [inline]
- bio-plane/src/filings/index.mjs:2362 "this template is wording the group files in its own name: a briefing takes a brief template" [inline]
- bio-plane/src/filings/index.mjs:2772 "no module answers the group's templates here, so no template can be drafted" [inline]

### leg-earning (7)

- bio-plane/src/leg-earning/index.mjs:345 ", another group's finding, graded as the edition this leg" [inline]
- bio-plane/src/leg-earning/index.mjs:690 "needs a chain-of-custody web archive, which your group's Civicsmith cannot produce and does not" [inline] T
- bio-plane/src/leg-earning/index.mjs:721 "— the bytes as your group's Civicsmith fetched them, hashed at" [inline] T
- bio-plane/src/leg-earning/index.mjs:778 "— the bytes as your group's Civicsmith fetched them, hashed at" [inline] T
- bio-plane/src/leg-earning/index.mjs:788 ", and the strongest route by which your group's Civicsmith received them earns" [inline] T
- bio-plane/src/leg-earning/index.mjs:798 ", and the bytes as your group's Civicsmith fetched them would be worth" [inline]
- bio-plane/src/leg-earning/index.mjs:906 "chain-of-custody web archive, which your group's Civicsmith cannot produce and does not claim (CAPTURE-FID…" [inline] T

### notice-producers (7)

- bio-plane/src/notice-producers/index.mjs:528 "…t's half of standing questions is switched off in your group's Civicsmith" [inline] T
- bio-plane/src/notice-producers/index.mjs:532 "the assistant is not available in your group's Civicsmith" [inline] T
- bio-plane/src/notice-producers/index.mjs:759 "The security level of your group's Civicsmith is High" [inline] T
- bio-plane/src/notice-producers/index.mjs:760 "The security level of your group's Civicsmith has been High since" [inline]
- bio-plane/src/notice-producers/index.mjs:991 "the group's Civicsmith" [inline] T
- bio-plane/src/notice-producers/index.mjs:1072 "the group's Civicsmith" [inline] T
- bio-plane/src/notice-producers/index.mjs:1099 "the group's Civicsmith" [inline] T

### provenance (7)

- bio-plane/src/provenance/checks.mjs:138 "Your group's Civicsmith holds no key to sign its receipts with, so thi…" [check-row translation (inline copy)] T
- bio-plane/src/provenance/checks.mjs:139 "and nothing claims that it was. Whoever hosts your group's Civicsmith can add one." [check-row translation (inline copy)] T
- bio-plane/src/provenance/index.mjs:1017 "your group's Civicsmith fetched these bytes directly from their addres…" [inline] T
- bio-plane/src/provenance/index.mjs:1023 "your group's Civicsmith fetched these bytes only through an archive re…" [inline] T
- bio-plane/src/provenance/index.mjs:1038 "handed to the group through the doorbell and brought in by a member" [inline] T
- bio-plane/src/provenance/index.mjs:1062 "is proven by the receipt your group's Civicsmith itself made at" [inline] T
- bio-plane/src/provenance/index.mjs:1094 "depth your group's Civicsmith reads an archive's grade through, so what they…" [inline] T

### site (7)

- site/src/index.mjs:79 "is not a group" [inline] T
- site/src/pages.mjs:6 "…smith is</a><a href="/start">Start a team</a><a href="/groups">Teams at work</a></nav><div class="mk-h"><h1 class="t-tit…" [inline]
- site/src/pages.mjs:7 "…"/start" aria-current="page">Start a team</a><a href="/groups">Teams at work</a></nav><div class="mk-h"><h1 class="t-tit…" [inline]
- site/src/pages.mjs:8 "…smith is</a><a href="/start">Start a team</a><a href="/groups" aria-current="page">Teams at work</a></nav><div class="mk…" [inline]
- site/src/pages.mjs:9 "…smith is</a><a href="/start">Start a team</a><a href="/groups" aria-current="page">Teams at work</a></nav><div class="mk…" [inline]
- site/src/pages.mjs:10 "…smith is</a><a href="/start">Start a team</a><a href="/groups">Teams at work</a></nav><div class="mk-h"><h1 class="t-tit…" [inline]
- site/src/pages.mjs:13 "… aria-hidden="true"><use href="/app/assets/icons.svg#i-group"/></svg><span><b>{{name}}</b> · {{place}}<span class="meta"…" [inline]

### admission (6)

- bio-plane/src/admission/index.mjs:405 "no member of this group reaches '" [inline]
- bio-plane/src/admission/index.mjs:491 "' is not reachable by a member of this group, so it cannot be handed" [inline]
- bio-plane/src/admission/index.mjs:580 "this group included — so an administrator's session is refused this ex…" [inline]
- bio-plane/src/admission/index.mjs:668 "this request presented the group's shared member key, which is retired: it no longer signs a…" [inline]
- bio-plane/src/admission/index.mjs:823 "the group's display name and its domain claim are set by a named admi…" [inline]
- bio-plane/src/admission/index.mjs:953 "…equests to the operations anyone may call reached this group's Civicsmith from" [inline]

### case-inputs (6)

- bio-plane/src/case-inputs/checks.mjs:44 "Your group's Civicsmith couldn't read whether any request for comment …" [word-table key signing.openrequest.unread] T
- bio-plane/src/case-inputs/document.mjs:86 "required to publish — a group may be one person — and its absence is stated rather than l…" [inline] T
- bio-plane/src/case-inputs/document.mjs:89 "required to publish — a group may be one person — and its absence is stated rather than l…" [inline] T
- bio-plane/src/case-inputs/index.mjs:419 "until then it is a draft and never the group's statement" [inline]
- bio-plane/src/case-inputs/index.mjs:578 "group's Civicsmith stamped one, and who wrote the sentence that n…" [inline]
- bio-plane/src/case-inputs/index.mjs:583 "group's Civicsmith cannot tell here whether you are the first — r…" [inline] T

### civil-time (6)

- bio-plane/src/civil-time/calendar.mjs:78 "is disputed in your group's Civicsmith" [inline]
- bio-plane/src/civil-time/calendar.mjs:78 "cannot be read in your group's Civicsmith" [inline]
- bio-plane/src/civil-time/calendar.mjs:112 "counted on a correction that governs in your group's Civicsmith, now" [inline] T
- bio-plane/src/civil-time/calendar.mjs:113 "counted on a calendar corrected in your group's Civicsmith" [inline] T
- bio-plane/src/civil-time/rules.mjs:397 "the group's own date" [inline] T
- bio-plane/src/civil-time/rules.mjs:424 "' is neither group nor body" [inline]

### consequences (6)

- bio-plane/src/consequences/checks.mjs:45 "Everything cited for the cause is your group's own act, and your own act never" [word-table key refusal.SUCCESS_CAUSE_OWN_ACT_ONLY] T
- bio-plane/src/consequences/checks.mjs:121 "Saying the group's action caused the change is a statement in your own" [inline]
- bio-plane/src/consequences/checks.mjs:125 "Whether the cause rests only on the group's own acts could not be" [inline]
- bio-plane/src/consequences/index.mjs:1222 "that the group's action caused the change is stated in the member's words," [inline]
- bio-plane/src/consequences/index.mjs:1233 "whether the cause's evidence is only the group's own acts could not be" [inline]
- bio-plane/src/consequences/index.mjs:1237 "every item of the cause's evidence is the group's own act, which is" [inline]

### docket (6)

- bio-plane/src/docket/checks.mjs:124 "Your group has no name recorded yet, and a docket entry is never anony…" [check-row translation (inline copy)] T
- bio-plane/src/docket/checks.mjs:140 "group's own words, and an outcome is filed with one in yours. Not…" [check-row translation (inline copy)] T
- bio-plane/src/docket/checks.mjs:154 "Your group's Civicsmith holds no prepared docket entry from you with t…" [check-row translation (inline copy)] T
- bio-plane/src/docket/index.mjs:130 "Your reply names a private person, so the group lists it as received without its text. Please send it" [inline] T
- bio-plane/src/docket/index.mjs:131 "again without the name, and the group will list it whole." [inline] T
- bio-plane/src/docket/index.mjs:575 "no group slug is recorded, and there are no anonymous entries" [inline]

### duties (6)

- bio-plane/src/duties/checks.mjs:31 "Your group's Civicsmith holds no rule for this deadline yet, so it can…" [word-table key duty.reason.deadline_not_held] T
- bio-plane/src/duties/checks.mjs:73 "… concerning someone, a repeating schedule, an item the group's own" [inline] T
- bio-plane/src/duties/checks.mjs:74 "work records (such as a request the group sent), or a stated date. This is none of them. Nothing was …" [inline] T
- bio-plane/src/duties/checks.mjs:80 "precede, or the group's own window. This is none of them. Nothing was written." [inline] T
- bio-plane/src/duties/index.mjs:326 "…eadline the other side has stated is a deadline on the group, as are the group's own obligations to a venue:" [inline]
- bio-plane/src/duties/index.mjs:327 "they are the group's own deadlines on its actions, never a body's obligation h…" [inline]

### installer (5)

- bio-plane/public/newgroup/index.html:54 "<p class="small who">Neighborhood and issue groups, newsrooms, professional associations, and public offices …" [inline]
- newgroup/src/index.mjs:1541 "<p class="small">For the team <b class="mono" id="group">" [inline]
- newgroup/src/index.mjs:2200 "group produces its record, and is not given a name nobody told it…" [inline]
- newgroup/src/index.mjs:2202 "group produces your record.</b></p>" [inline]
- newgroup/src/index.mjs:2678 "For the team <b class="mono" id="group">" [inline]

### answers (5)

- bio-plane/src/answers/checks.mjs:26 "No rule service of that name is held in your group's Civicsmith. Nothing was read." [inline] T
- bio-plane/src/answers/checks.mjs:30 "The record's rule services are switched off in your group's Civicsmith until the assistant's measured bar is met. Not…" [inline] T
- bio-plane/src/answers/index.mjs:235 "the rule services are switched off in your group's Civicsmith" [inline] T
- bio-plane/src/answers/rules.mjs:60 "no jurisdiction profile is active in your group's Civicsmith" [inline]
- bio-plane/src/answers/rules.mjs:83 "no jurisdiction profile is active in your group's Civicsmith" [inline]

### case-catalogue (5)

- bio-plane/src/case-catalogue/checks.mjs:231 "declare the group's position on putting this case to its subject" [inline]
- bio-plane/src/case-catalogue/checks.mjs:234 "…ehind it is the checkbox this gate exists to refuse. A group that sought comment says so and prints what came back; a gr…" [inline]
- bio-plane/src/case-catalogue/checks.mjs:554 "… question it answers as a whole. It is AUTHORED by the group and never derived from the findings' titles — a scope this …" [inline]
- bio-plane/src/case-catalogue/checks.mjs:763 "…rue of a scope whose only adoption pins a revision the group has proposed and not accepted, and a document silent about …" [inline]
- bio-plane/src/case-catalogue/checks.mjs:853 "…gth with a declared flag: a case publishes the bar the group set for itself beside the strength each member reached, and…" [inline]

### interface-shell (5)

- bio-plane/src/interface-shell/browser.mjs:578 "" role="group" aria-label="" [inline]
- bio-plane/src/interface-shell/browser.mjs:595 "<div class="mk-acts" role="group" aria-label="" [inline]
- bio-plane/src/interface-shell/browser.mjs:605 "<div class="mk-acts" role="group" aria-label="" [inline]
- bio-plane/src/interface-shell/browser.mjs:992 "<div role="group" aria-label="" [inline]
- bio-plane/src/interface-shell/browser.mjs:1639 "<span class="cs-reason" role="group"><span class="cs-field"><label for="" [inline]

### observation-log (5)

- bio-plane/src/observation-log/vocabulary.mjs:176 "the scheduler of your group's Civicsmith looked, with no member and no machine behind i…" [inline] T
- bio-plane/src/observation-log/vocabulary.mjs:198 "a standing objective your group's Civicsmith is monitoring for" [inline] T
- bio-plane/src/observation-log/vocabulary.mjs:201 "a step a member or your group's Civicsmith took in pursuit of a question, and the look it…" [inline] T
- bio-plane/src/observation-log/vocabulary.mjs:629 "this document has pages no engine in your group's Civicsmith could read" [inline] T
- bio-plane/src/observation-log/vocabulary.mjs:1412 "a render your group's Civicsmith could not do is held under its C-83 reason unt…" [inline]

### publication (5)

- bio-plane/src/publication/checks.mjs:63 "This group's acceptance of another group's work this case rests on was…" [check-row translation (inline copy)] T
- bio-plane/src/publication/checks.mjs:69 "A flag was raised on another group's work this case rests on after the case was prepared, and …" [check-row translation (inline copy)] T
- bio-plane/src/publication/index.mjs:1086 "group marked, or marks that cannot be read), so nothing was commi…" [inline]
- bio-plane/src/publication/index.mjs:1111 "acceptance(s) of another group's work this case document rests on" [inline]
- bio-plane/src/publication/index.mjs:1115 "open flag(s) on another group's work this case document rests on" [inline]

### entities (4)

- bio-plane/src/entities/index.mjs:232 "; your group's active jurisdiction profiles give it no form" [inline]
- bio-plane/src/entities/index.mjs:864 "an identifier is held in a scheme your group's active jurisdiction profiles name" [inline]
- bio-plane/src/entities/index.mjs:999 "a proceeding's kind is one your group's active jurisdiction profiles name" [inline]
- bio-plane/src/entities/index.mjs:1815 "; your group's active jurisdiction profiles give this space no form" [inline]

### monitoring (4)

- bio-plane/src/monitoring/checks.mjs:57 "changed — what is known is that your group's Civicsmith could not see the document today." [check-row translation (inline copy)] T
- bio-plane/src/monitoring/checks.mjs:69 "…s sending a document and sent a web page instead. Your group's Civicsmith reads the bytes rather" [check-row translation (inline copy)] T
- bio-plane/src/monitoring/index.mjs:753 "A shape your group's Civicsmith cannot read is a shape it cannot promise to" [inline]
- bio-plane/src/monitoring/index.mjs:1703 "cadence is a meeting schedule your group's Civicsmith does not hold" [inline] T

### reading-pipeline (4)

- bio-plane/src/reading-pipeline/index.mjs:118 "…is document and no pdf-worker member is set up in your group's Civicsmith, so tier 1's reading stands" [inline] T
- bio-plane/src/reading-pipeline/index.mjs:619 "…t layer to read and no OCR engine is installed in your group's" [inline] T
- bio-plane/src/reading-pipeline/index.mjs:624 "in your group's Civicsmith, so nothing is claimed about what it says" [inline] T
- bio-plane/src/reading-pipeline/index.mjs:1266 "your group's Civicsmith has no evidence store set up, so the capture's…" [inline] T

### signin-door (4)

- bio-plane/src/signin-door/index.mjs:41 "Signing in with Claude is not installed in your group's Civicsmith yet. Whoever installed" [word-table key ai.refused.signinabsent]
- bio-plane/src/signin-door/index.mjs:42 "your group's Civicsmith can add it." [word-table key ai.refused.signinabsent] T
- bio-plane/src/signin-door/index.mjs:110 "your group's Civicsmith has no assistant bound to it, so nothing was s…" [inline] T
- bio-plane/src/signin-door/index.mjs:270 "on a test instance of Civicsmith, and your group's Civicsmith is not one. Nothing was read." [inline]

### store-door (4)

- bio-plane/src/store-door/dispatch.mjs:155 "'import' is an IMPORT's id (the SHA-256 of its source group, case and lens), never a bundle id, and" [inline]
- bio-plane/src/store-door/dispatch.mjs:172 "'rule' is a GROUP RULE's id, never a bundle id (local-facts R13)" [inline]
- bio-plane/src/store-door/dispatch.mjs:332 "asking the assistant to draft the group's description" [inline]
- bio-plane/src/store-door/pull.mjs:46 "Material handed to the group at its doorbell as knock" [inline] T

### file-scanner (4)

- file-scanner/src/providers/catalogue.mjs:74 "chosen by the group: US1, EU1, EU2, AP1, AP2 or CA1; content never leaves it" [inline]
- file-scanner/src/providers/catalogue.mjs:77 "the group's own key; terms allow use within its own products made ava…" [inline]
- file-scanner/src/providers/catalogue.mjs:197 "Cloudflare, Inc. (the group's own account)" [inline]
- file-scanner/src/providers/catalogue.mjs:199 "the group's own Cloudflare account, a token with Intel Read" [inline]

### calculations (3)

- bio-plane/src/calculations/application.mjs:80 "people in a group are named by their entity ids in the record, as K1483 allow…" [inline]
- bio-plane/src/calculations/index.mjs:458 "your group's Civicsmith has no evidence store set up, so a table's byt…" [inline] T
- bio-plane/src/calculations/index.mjs:1913 "your group's Civicsmith has no evidence store set up, so the table's b…" [inline] T

### case-import (3)

- bio-plane/src/case-import/index.mjs:502 "only an active member of this group imports, or acts on an import" [inline]
- bio-plane/src/case-import/index.mjs:662 "the manifest does not name its group, case and edition" [inline]
- bio-plane/src/case-import/index.mjs:1420 "the entry is not a docket entry of this group's case at its number" [inline]

### journey-check (3)

- bio-plane/src/journey-check/journeys.mjs:282 "the invitation shown is not a link into the group's address" [inline]
- bio-plane/src/journey-check/walker.mjs:171 "says group for a team: …" [inline]
- bio-plane/src/journey-check/walker.mjs:173 "the design's rule for "group" could not be read:" [inline]

### tasks (3)

- bio-plane/src/tasks/checks.mjs:227 "…ng here you can ask a check on: the item is not in the group's record, or it is not one you can see." [inline] T
- bio-plane/src/tasks/checks.mjs:250 "A concern needs its reason, so the owner and the group can see what to look at. Nothing was written. Say what" [inline] T
- bio-plane/src/tasks/index.mjs:226 "no project manager; the RULED fallback to a group admin" [inline]

### agent-model (2)

- agent-model/src/model.mjs:155 "…mber, secret}, the member's own, or a project's or the group's API key {kind: "apikey", level:" [inline]
- agent-model/src/model.mjs:156 ""project" or "group", key}" [inline]

### action-holds (2)

- bio-plane/src/action-holds/checks.mjs:54 "group is preserving again, place a new hold." [check-row translation (inline copy)] T
- bio-plane/src/action-holds/index.mjs:191 "marking pressure directed at the group is a member's judgement; a" [inline]

### action-records (2)

- bio-plane/src/action-records/index.mjs:145 "a receipt is a named member's record that the group's sending reached its addressee. A machine" [inline]
- bio-plane/src/action-records/index.mjs:690 "a promise the group made to a person is recorded by a member; a" [inline]

### case-tensions (2)

- bio-plane/src/case-tensions/checks.mjs:31 "the group, the project, the cover the group knows you by, or your han…" [check-row translation (inline copy)] T
- bio-plane/src/case-tensions/checks.mjs:36 "That is not one of the four levels. Choose group, project, cover or name." [check-row translation (inline copy)] T

### connections (2)

- bio-plane/src/connections/index.mjs:1009 "group; a member promoting it to cites is a member's act." [inline]
- bio-plane/src/connections/index.mjs:1038 "… a held document; asserted by the source, never by the group." [inline]

### content (2)

- bio-plane/src/content/index.mjs:1404 "your group's Civicsmith has no evidence store set up, so the capture's…" [inline] T
- bio-plane/src/content/index.mjs:1405 "crop was made. That is a fact about how your group's Civicsmith is set up, not about the image" [inline]

### explore (2)

- bio-plane/src/explore/timeline.mjs:32 "your group's Civicsmith has no events record connected, so no timeline…" [inline] T
- bio-plane/src/explore/timeline.mjs:47 "your group's Civicsmith has no money record connected, so no payer or …" [inline] T

### extraction (2)

- bio-plane/src/extraction/index.mjs:1279 "your group's Civicsmith has no evidence store set up, so the stored by…" [inline] T
- bio-plane/src/extraction/index.mjs:1492 "what your group's Civicsmith can read; this one is re-read now" [inline]

### investigation (2)

- bio-plane/src/investigation/index.mjs:481 "no time zone is held for your group's Civicsmith, so the local day is not known" [inline] T
- bio-plane/src/investigation/index.mjs:518 "no time zone is held for your group's Civicsmith, or no instant was given" [inline] T

### plane (2)

- bio-plane/src/plane/screens.mjs:22 "The whole record as rows: every bundle your group's Civicsmith holds, with its type and its state." [inline]
- bio-plane/src/plane/screens.mjs:61 "The cases your group's Civicsmith has published, readable by somebody holding no…" [inline]

### provenance-routes (2)

- bio-plane/src/provenance-routes/index.mjs:293 "this document stays where the group put it: a verification was an attested act by people, and" [inline]
- bio-plane/src/provenance-routes/index.mjs:362 "the group put it (DEC-56/DEC-19). 'NEVER_LOOKED' is a different fact …" [inline]

### publish-schedule (2)

- bio-plane/src/publish-schedule/schedule.mjs:84 "the group holds no time zone, so a local time cannot be read; it is n…" [inline]
- bio-plane/src/publish-schedule/schedule.mjs:88 "the group's time zone (" [inline]

### screens-action (2)

- bio-plane/src/screens-action/request.mjs:76 "… aria-hidden="true"><use href="/app/assets/icons.svg#i-group"/></svg>" [inline]
- bio-plane/src/screens-action/send-steps.mjs:143 "<div class="cs-dialog" role="group" aria-label="" [inline]

### screens-settings (2)

- bio-plane/src/screens-settings/connect.mjs:132 "<div class="mk-msg" data-situation="group"><p>" [inline]
- bio-plane/src/screens-settings/identity.mjs:30 "<p data-state="group">" [inline]

### sources (2)

- bio-plane/src/sources/index.mjs:70 "known to the group, not recorded" [inline] T
- bio-plane/src/sources/index.mjs:73 "; not confirmed by the group" [inline] T

### runtime-limits (2)

- bio-plane/src/tokens.mjs:65 "Your group's Civicsmith binds no Claude account to its own settings, a…" [inline] T
- bio-plane/src/tokens.mjs:66 "…member's own Claude account or API key, or through the group's" [inline] T

### workbooks (2)

- bio-plane/src/workbooks/index.mjs:40 "…greement between the file's engine and the engine your group's Civicsmith runs, never accuracy" [inline] T
- bio-plane/src/workbooks/index.mjs:625 "recomputed by the engine your group's Civicsmith runs (" [inline] T

### action-plans (1)

- bio-plane/src/action-plans/index.mjs:456 "kind: press \| organisation \| group, role, organisation} or {state: audience, description}; nev…" [inline]

### capture (1)

- bio-plane/src/capture/index.mjs:764 "these bytes were uploaded to your group's Civicsmith by" [inline] T

### events (1)

- bio-plane/src/events/index.mjs:1174 "a timeline's audience is "public", or none for the group's own reading" [inline]

### following (1)

- bio-plane/src/following/index.mjs:355 "a policy's watch is the group's standing watch: it takes no end date and ends only with t…" [inline]

### host-governor (1)

- bio-plane/src/host-governor/index.mjs:44 "…must be a positive number, or omit it to reset to your group's default" [inline]

### op-declarations (1)

- bio-plane/src/op-declarations/index.mjs:2506 "INSTANCE'S PRODUCING GROUP IS THE ROOT OF TRUST'S ACT — THE ADMIN_TOKEN CREDENTIAL HEL…" [inline]

### people (1)

- bio-plane/src/people/index.mjs:1228 "…people and organisations the record follows, never the group's own members; each row counts the" [inline]

### plan-work (1)

- bio-plane/src/plan-work/checks.mjs:47 "This reads part of the record that is not in your group's Civicsmith yet, so it is not answered in" [check-row translation (inline copy)] T

### project-roster (1)

- bio-plane/src/project-roster/index.mjs:649 "is not a kind of action in your group's" [inline]

### screens-entry (1)

- bio-plane/src/screens-entry/front.mjs:35 "<img class="mk-flogo" src="/app/assets/group-logo" alt="" [inline]

### screens-inquiry (1)

- bio-plane/src/screens-inquiry/project.mjs:293 "<p class="mk-small" data-stake="group">" [inline]

### screens-investigate (1)

- bio-plane/src/screens-investigate/parts.mjs:217 "" role="group" aria-label="" [inline]

### screens-publish (1)

- bio-plane/src/screens-publish/imported.mjs:57 "<p class="mk-note" data-group-fields>" [inline]

### screens-wizards (1)

- bio-plane/src/screens-wizards/library.mjs:73 "<div class="mk-acts" role="group" aria-label="" [inline]

## B. Collection sense, probably stay (confirm)

- bio-plane/src/basis-versions/checks.mjs:111 (basis-versions) "a member said this group of reasons would carry the answer on its own, and the recor…"
- bio-plane/src/basis-versions/checks.mjs:112 (basis-versions) "nobody said this group of reasons would carry the answer on its own, and the recor…"
- bio-plane/src/basis-versions/checks.mjs:113 (basis-versions) "the record does not say whether anyone claimed this group of reasons would carry the answer on its own"
- bio-plane/src/calc-grammar/recipe.mjs:474 (calc-grammar) "; its group's sum is undetermined"
- bio-plane/src/calculations/application.mjs:53 (calculations) "the column to group by: decider, subject, subject_kind, subject_sector, reason_…"
- bio-plane/src/calculations/application.mjs:55 (calculations) "the share of each outcome in each group, with the group's size"
- bio-plane/src/calculations/application.mjs:56 (calculations) "optional: a column to group by"
- bio-plane/src/calculations/application.mjs:60 (calculations) "optional: a column to group by, such as provision_standard"
- bio-plane/src/calculations/application.mjs:63 (calculations) "for each group of two or more like cases, the share whose outcome is the g…"
- bio-plane/src/calculations/application.mjs:158 (calculations) "a recipe of application groups by one of"
- bio-plane/src/calculations/application.mjs:201 (calculations) "outcome_rate_by names the column it groups by. Nothing was written."
- bio-plane/src/calculations/application.mjs:207 (calculations) "…, or falls across a period's bounds, is in no period's group: counted apart by the select steps"
- bio-plane/src/calculations/application.mjs:260 (calculations) "groups of one act have no like case: counted apart"
- bio-plane/src/strength/checks.mjs:164 (strength) "This asks whether the groups of reasons behind one question share a source, and no"
- bio-plane/src/strength/checks.mjs:170 (strength) "… a question you can read here, so it has no reasons to group. Only a"
- bio-plane/src/strength/checks.mjs:177 (strength) "…ing of reasons could not be read. Send it as a list of groups, each group a"
- bio-plane/src/strength/checks.mjs:185 (strength) "because an answer about groups the question does not hold would be an answer about someth…"
- bio-plane/src/strength/checks.mjs:190 (strength) "One reason was put in two groups. Each reason belongs to exactly one group, because a"
- bio-plane/src/strength/checks.mjs:191 (strength) "reason shared by two groups would make them share a source by construction."
- bio-plane/src/strength/checks.mjs:196 (strength) "Some of this question's reasons are in no group. A grouping covers every reason, as a"
- bio-plane/src/strength/checks.mjs:219 (strength) "…name belongs to this question, so there are no written groups of it"
- bio-plane/src/strength/index.mjs:1056 (strength) "is not a question, so it has no reasons to group."
- bio-plane/src/strength/index.mjs:1090 (strength) "pass partition=<JSON>: a non-empty list of groups, each a list of reason"
- bio-plane/src/strength/index.mjs:1092 (strength) "written reading's groups instead."
- bio-plane/src/strength/index.mjs:1095 (strength) "groups were proposed and a written reading holds at most"
- bio-plane/src/strength/index.mjs:1109 (strength) "lists no reasons; every group holds at least one."
- bio-plane/src/strength/index.mjs:1113 (strength) "two groups are both named '"
- bio-plane/src/strength/index.mjs:1141 (strength) "are in no group."

## B2. Operation-grade descriptions (op-grades; documentation, not shown) and other excluded prose

- bio-plane/src/admission/checks.mjs:300 "src/admission/index.mjs bearerFence > is-group-identity-session"
- bio-plane/src/op-grades/index.mjs:664 "records, once, the producing group every later creation is stamped with"
- bio-plane/src/op-grades/index.mjs:666 "records the group's own words for itself, a presentation value in no signed b…"
- bio-plane/src/op-grades/index.mjs:775 "…eived correspondence entry as pressure directed at the group, appended to a table of its own and never rewritten; an ent…"
- bio-plane/src/op-grades/index.mjs:803 "…or an administrator widens an approved template to the group (filing-templates R10)"
- bio-plane/src/op-grades/index.mjs:813 "a member imports another group's case file into a read-only project, one per source group,…"
- bio-plane/src/op-grades/index.mjs:824 "…; or an administrator widens an approved script to the group (wizard-scripts R7)"
- bio-plane/src/op-grades/index.mjs:1157 "governance: the GROUP's declared default required strength, keyed by group and no…"
- bio-plane/src/op-grades/index.mjs:1221 "the group's public display name — the subject is the instance's ident…"
- bio-plane/src/op-grades/index.mjs:1222 "the group's claimed domain — the subject is the instance's identity, …"
- bio-plane/src/op-grades/index.mjs:1328 "the investigative session's ONE write (§4 group 2), keyed by inquiry and run: proposes a reading of the evi…"
- bio-plane/src/op-grades/index.mjs:1339 "the investigative session's request for a capture (§4 group 1), keyed by run and address, or (capture-requests R56) a m…"
- bio-plane/src/op-grades/index.mjs:1373 "…ation-directed: a member declares an aspiration of the group, a project or a member, keyed by its scope"
- bio-plane/src/op-grades/index.mjs:1374 "…-directed: a project records its departure from a held group aspiration with a reason, keyed by (project, aspiration)"
- bio-plane/src/op-grades/index.mjs:1509 "…ad: every case this copy has imported, with its source group, case, lens and editions, and when each was imported; write…"
- bio-plane/src/op-grades/index.mjs:1510 "…ach finding's recreation and its standing against this group's own bar, the source's bar labeled as the source's, and th…"
- bio-plane/src/op-grades/index.mjs:1535 "…r approved version, with both versions' steps, for the group's wizard editors; writes nothing"
- bio-plane/src/op-grades/t33.mjs:109 "…re or stage with its citation, for one contract or the group; the latest governs, every statement kept (money-checks R3)"
- bio-plane/src/op-grades/t33.mjs:147 "an administrator sets the group's sealed key for a keyed outside service, off until switche…"
- bio-plane/src/op-grades/t33.mjs:217 "…-directed: keyed by (check, parameter, contract or the group); records a member's cited parameter and moves no bundle"
- bio-plane/src/op-grades/t33.mjs:342 "credential governance: the group's key for a keyed outside service, an administrator's; neve…"
- bio-plane/src/op-grades/t33.mjs:359 "the group's own lateness: commitments met on time, met late, or pendi…"
- bio-plane/src/op-grades/t33.mjs:365 "host-directed: keyed by a host; a group-wide mark that the host is a login-gated platform"
- bio-plane/src/op-grades/t34.mjs:20 "an administrator creates the one live key the group's website invites members with, its scope, daily cap and ex…"
- bio-plane/src/op-grades/t34.mjs:27 "the group's website, holding the key, invites one person under a cove…"
- bio-plane/src/op-grades/t34.mjs:31 "an administrator records the group's own description of itself and who may read it, appended; …"
- bio-plane/src/op-grades/t34.mjs:37 "an administrator sets the group's sealed assistant key, never answered (credentials R33)"
- bio-plane/src/op-grades/t34.mjs:38 "an administrator removes the group's assistant key (credentials R33)"
- bio-plane/src/op-grades/t34.mjs:39 "an administrator switches the group's assistant key on or off; it moves no document, claim or g…"
- bio-plane/src/op-grades/t34.mjs:40 "records that a member saw the notice of the group's key, for that member alone (credentials R36)"
- bio-plane/src/op-grades/t34.mjs:42 "an administrator records the place the group wants its profile for; it moves no document, claim or grade…"
- bio-plane/src/op-grades/t34.mjs:56 "the group's setting: whether members are told what a court can reach;…"
- bio-plane/src/op-grades/t34.mjs:57 "the group's description of itself — the subject is the group's identi…"
- bio-plane/src/op-grades/t34.mjs:63 "credential governance: the group's assistant key, an administrator's; never answered"
- bio-plane/src/op-grades/t34.mjs:64 "credential governance: the group's assistant key, an administrator's"
- bio-plane/src/op-grades/t34.mjs:65 "the copy's configuration: whether the group's assistant key is on; an administrator's, not an act on an…"
- bio-plane/src/op-grades/t34.mjs:66 "whether the group's assistant key is held and on, the whole state to an admin…"
- bio-plane/src/op-grades/t34.mjs:67 "the notice of the group's key for the session's own member"
- bio-plane/src/op-grades/t34.mjs:68 "personal state, keyed by member: the notice of the group's key seen by them"
- bio-plane/src/op-grades/t34.mjs:69 "the instance's configuration: the place the group wants its profile for; an administrator's"
- bio-plane/src/op-grades/t34.mjs:70 "the place the group wants its profile for, and whether one is held"
- bio-plane/src/op-grades/t35.mjs:60 "a member records that the group is asking the issuer of a policy held only by citation for …"
- bio-plane/src/op-grades/t35.mjs:70 "setting: the group's choice whether a capture asks for a co-archive; an admini…"
- bio-plane/src/op-grades/t35.mjs:79 "whether the group's captures ask for a co-archive"
- bio-plane/src/op-grades/t35.mjs:82 "the group's registered entities of one kind, within the viewer's gate"
- bio-plane/src/op-grades/t35.mjs:83 "the group's count-only security tally by kind and period, with its us…"
- bio-plane/src/op-grades/t35.mjs:86 "whether the group's second-administrator step is done, to an administrator"
- bio-plane/src/op-grades/t35.mjs:97 "moves it to the group's sight, recorded and never undone"
- bio-plane/src/op-grades/t36.mjs:15 "file-directed: keyed by a capture's digest; asks the group's outside tools about this file; records"
- bio-plane/src/op-grades/t36.mjs:17 "setting: the group's security tools, an administrator's act; moves no bundle"
- bio-plane/src/op-grades/t36.mjs:41 "…see a file asks for a deeper check of its bytes by the group's outside tools; its one write is a verdict note naming no …"
- bio-plane/src/op-grades/t36.mjs:44 "a member who may see a file asks the group's safe-copy maker for a rebuilt, derived copy of it; asks n…"
- bio-plane/src/op-grades/t36.mjs:54 "…wake that forwards the period's security counts to the group's log tools, naming no file and no member (file-safety R35)"
- bio-plane/src/op-grades/t36.mjs:96 "a file's safe copy, rebuilt by the group's tool and so labeled, and its bytes"
- bio-plane/src/op-grades/t36.mjs:100 "the group's security tools, never their credentials, to an administra…"
- bio-plane/src/op-grades/t36.mjs:106 "setting: whether the group keeps its material away from every assistant, an administra…"
- bio-plane/src/op-grades/t36.mjs:108 "whether the group keeps its material away from every assistant, with the reas…"
- bio-plane/src/op-grades/t37.mjs:15 "…rected: keyed by a language and an interface word; the group's own wording of"
- bio-plane/src/op-grades/t37.mjs:40 "…chine drafts of missing words of a language, never the group's wording until a member adopts one, or an administrator's …"
- bio-plane/src/op-grades/t37.mjs:65 "every interface word in a language, the group's shown translation or the English, never blank, with"
- bio-plane/src/op-grades/t41.mjs:21 "; the group's own date, never a duty or finding, never published;"
- bio-plane/src/op-grades/t41.mjs:97 "…a guide's canonical bytes and digest, labeled with the group, for another group (reading-guides R6)"
- bio-plane/src/op-grades/t41.mjs:98 "a member imports another group's offered guide as adopted, usable only after review (readi…"
- bio-plane/src/op-grades/t41.mjs:100 "a member exports a guide many groups use, marked as a proposal for Civicsmith's library; Civics…"
- bio-plane/src/op-grades/t41.mjs:103 "a member adds a group's own test investigation for an assistant part, its answers…"
- bio-plane/src/op-grades/t41.mjs:138 "…new STP- id at its place, a question, a project or the group"
- bio-plane/src/op-grades/t41.mjs:150 "keyed by step; a fee or purchase in the group's own money, never a money fact"
- bio-plane/src/op-grades/t41.mjs:159 "…ep, or the steps on a question, in a project or of the group, as the viewer may see them"
- bio-plane/src/op-grades/t41.mjs:221 "how many proposals were accepted in each form, group-wide only, naming no member, project or"
- bio-plane/src/op-grades/t41.mjs:227 "keyed by guide; another member approves it for the group or refuses it, with the reason"
- bio-plane/src/op-grades/t41.mjs:228 "keyed by guide; its canonical bytes offered to another group"
- bio-plane/src/op-grades/t41.mjs:229 "keyed by an offer's digest; another group's guide imported as adopted, usable after review"
- bio-plane/src/op-grades/t41.mjs:236 "…de in force for a document kind, the viewer's own, the group's or Civicsmith's, with its"
- bio-plane/src/op-grades/t41.mjs:250 "…t-directed: keyed by an assistant part and a matter; a group's own test investigation, never a find,"
- bio-plane/src/op-grades/t41.mjs:252 "an assistant part's results on the group's own tests, with its false-alarm rate, to its members"
- bio-plane/src/op-grades/t45.mjs:26 "; the group's own rule beside the profiles, never a profile's; moves no…"
- bio-plane/src/op-grades/t45.mjs:77 "…ures computed and any cause on evidence other than the group's own act; never edited, revised by a successor (consequenc…"
- bio-plane/src/op-grades/t45.mjs:84 "a member other than its drafter confirms a group rule, with her qualification where its tier asks one; the c…"
- bio-plane/src/op-grades/t45.mjs:144 "keyed by (plan, matter); the group's intended outcome, each revision kept"
- bio-plane/src/op-grades/t45.mjs:146 "every act the group did on a plan's actions and every coming date, in date orde…"
- bio-plane/src/op-grades/t45.mjs:173 "setting: the group's declared stake in its own words, carried beside its publi…"
- bio-plane/src/op-grades/t45.mjs:177 "keyed by group rule; a member other than its drafter confirms it, and it a…"
- bio-plane/src/op-grades/t45.mjs:178 "keyed by group rule; a member withdraws it with a reason, kept and never d…"
- bio-plane/src/op-grades/t45.mjs:179 "a confirmed group rule's entry and primary source as canonical bytes with the…"
- bio-plane/src/op-grades/t45.mjs:183 "the group's rules with their state, source, drafter, confirmer and da…"
- bio-plane/src/op-grades/t46.mjs:47 "the settings and history of the group's two doors, to an administrator, never a door's secret"
- bio-plane/src/op-grades/t47.mjs:56 "the projects of the group the viewer may see, each with its question count and stage …"
- bio-plane/src/op-grades/t47.mjs:62 "reason; never the group's bar, and it gates nothing ('strength' R21)"
- bio-plane/src/op-grades/t47.mjs:71 "the group's logo, PNG or JPEG, or none"
- bio-plane/src/op-grades/t47.mjs:72 "the languages the group works in"
- bio-plane/src/op-grades/t47.mjs:73 "the languages the group works in, or the active profiles' while none is set; public…"
- bio-plane/src/op-grades/t47.mjs:85 "never the group's members"
- bio-plane/src/op-grades/t48.mjs:49 "…rator's own request for a labeled machine draft of the group's description, answered into their own field and never the …"
- bio-plane/src/op-grades/t48.mjs:50 "an administrator's own read of the group's count-only security tally by kind and period, with its us…"
- bio-plane/src/op-grades/t48.mjs:68 "draft: a machine translation of one passage of the group's own writing (a note, question, finding or"
- bio-plane/src/promotion/checks.mjs:239 "src/promotion/index.mjs #promote > is-group-undetermined"
- bio-plane/src/run-rules/checks.mjs:289 "src/ai-runs/index.mjs groupTestSet, reached from the group's test investigations"
- bio-plane/src/setup.mjs:179 "src/setup.mjs instanceGroupSeed > is-instance-group-seed"
- bio-plane/src/setup.mjs:184 "src/setup.mjs instanceGroupSeed > is-instance-group-seed"
- bio-plane/src/setup.mjs:189 "src/setup.mjs #groupIdentityGate > is-group-identity-admin"
- bio-plane/src/setup.mjs:194 "src/setup.mjs groupNameSet > is-group-display-name"
- bio-plane/src/setup.mjs:199 "src/setup.mjs groupDomainSet > is-group-domain"
- bio-plane/src/setup.mjs:257 "src/setup.mjs groupDescriptionDraft > is-group-draft-answers"
- bio-plane/src/setup.mjs:262 "src/setup.mjs groupDescriptionDraft > is-group-draft-answers"
- bio-plane/src/setup.mjs:287 "src/setup.mjs groupLogoSet > is-group-logo"
- bio-plane/src/skilldoctrine.mjs:979 "…hem beside the matter when it proposes options, as the group's own"

## B3. Non-shipped docs (excluded)

- file-scanner/fleet-member.json:108 "…ntainers' empty): the Worker reads every byte from the group's bucket and hands them copies.","
- newgroup/DEPLOY.md:29 "your new Civicsmith group", drawn in Civicsmith's own typefaces (the installer"
- newgroup/DEPLOY.md:42 "…and the probe key folded away. Press "Continue to your group's"
- newgroup/DEPLOY.md:72 "…aste. Then paste and deploy as in step 2, and existing groups pick the"
- stewards/DEPLOY.md:4 "…elieveinoakland' workers.dev prefix), apart from every group's Civicsmith. It holds its own store (a Durable Object)"
## C. Design lane: docs/development/ux-substrate/screens/words.json (grep only)

54 lines hold the word. Not edited here; these belong to the design lane. Note rows.mjs (setup-words) is generated from this file, so each fix flows through `build.mjs`.

### C1. Organisation sense in the `en` text: needs a key change (7)

- words.json:6377 `entity.relation.kind.help` ""en": "“Member of” a body or group; “stands in for” someone, acting in their name; “"
- words.json:26061 `screen.group-identity.kind.professional` ""en": "a professional group","
- words.json:26068 `screen.group-identity.kind.issue` ""en": "an issue group","
- words.json:26075 `screen.group-identity.kind.community` ""en": "a community group","
- words.json:30321 `screen.site.line2` "shes what it finds in a form anyone can check. Neighborhood groups, newsrooms, professional associations and offices"
- words.json:59397 `public-read.neighborhood_issue_groups` ""en": "Neighborhood and issue groups, newsrooms, professional associations, and public"
- words.json:71204 `refusal.ADDRESSEE_REFUSED` "ody, a reporter or outlet, an organization or another civic group by role and organization, or a described audience"

### C2. Collection sense (set of reasons / calculation rows), probably stays (14)

- words.json:43466 `refusal.PARTITION_INDEPENDENCE_NO_INQUIRY` ""en": "This asks whether the groups of reasons behind one question share a source, an"
- words.json:43473 `refusal.PARTITION_INDEPENDENCE_NOT_AN_INQUIRY` "s not a question you can read here, so it has no reasons to group. Only a question rests on reasons, and a question"
- words.json:43480 `refusal.PARTITION_INDEPENDENCE_UNREADABLE` "grouping of reasons could not be read. Send it as a list of groups, each group a list of the positions of the reason"
- words.json:43487 `refusal.PARTITION_INDEPENDENCE_UNKNOWN_LEG` "t have. It was not dropped quietly, because an answer about groups the question does not hold would be an answer abo"
- words.json:43494 `refusal.PARTITION_INDEPENDENCE_LEG_TWICE` ""en": "One reason was put in two groups. Each reason belongs to exactly one group, becaus"
- words.json:43501 `refusal.PARTITION_INDEPENDENCE_NOT_TOTAL` ""en": "Some of this question's reasons are in no group. A grouping covers every reason, as a written rea"
- words.json:43522 `refusal.PARTITION_INDEPENDENCE_NO_SUCH_VERSION` "that name belongs to this question, so there are no written groups of it to check. Nothing was substituted for it.","
- words.json:44082 `basis-versions.claimed` ""en": "a member said this group of reasons would carry the answer on its own, and"
- words.json:44089 `basis-versions.unclaimed` ""en": "nobody said this group of reasons would carry the answer on its own, and"
- words.json:44096 `basis-versions.unstated` ""en": "the record does not say whether anyone claimed this group of reasons would carry the answer on its own","
- words.json:69139 `inquiry.next.group_strength_weakest` ""en": "each group's strength is its weakest leg, and this question'"
- words.json:74182 `calculations.says.group_two_like` ""en": "for each group of two or more like cases, the share whose outcom"
- words.json:74218 `calculations.why.act_undetermined_falls` "mined, or falls across a period's bounds, is in no period's group: counted apart by the select steps","
- words.json:74224 `calculations.why.groups_act_like` ""en": "groups of one act have no like case: counted apart","

### C3. Only a `{group}` placeholder name, no change to reader text; the placeholder is an identifier (30)

765 `handle.free`; 771 `handle.taken`; 1986 `prepared.rests.accepted`; 4599 `signing.ceremony.who`; 5586 `screen.setup.claimed`; 6972 `screen.imported.list.row`; 13566 `screen.entry.uses`; 13580 `screen.entry.logo`; 14735 `screen.join.invited`; 14749 `screen.join.link`; 23247 `screen.published.whose`; 23366 `screen.imported.from`; 23716 `screen.doorbell.heading`; 23842 `screen.review-outside.heading`; 31053 `screen.site.onecase.meta`; 32281 `screen.imported.band`; 33512 `screen.tour.what.says`; 34359 `screen.doorbell.tip.title`; 34625 `screen.home.tip.title`; 34751 `screen.imported.tip.title`; 34779 `screen.imported.tip.edition_of`; 35024 `screen.join.tip.title`; 35066 `screen.join.tip.admins_count`; 36438 `screen.proceeding.tip.petitioner`; 43970 `strength.text.leg_rests_group`; 56733 `case-disclosures.vouches_signing_case`; 56859 `case-disclosures.rests_through_case`; 59223 `reevaluation.leg_rests_group`; 62447 `case-grammar.p.published_signed`; 65877 `queue-producers.text.group`

### C4. Design `note` fields that mention a key name (not shown to readers) (3)

- words.json:30993 `screen.site.nav.groups` ""note": "nav.groups is also the teams page heading""
- words.json:31080 `screen.connect.group.allowance.used` ""note": "after screen.connect.group.allowance; drawn only to an account's owners, whe"
- words.json:31633 `site.groups.rule.head` ""note": "the details' heading beside site.groups.rule""

Also outside the file named: `docs/development/ux-substrate/screens/library.json` holds 29 lines with the word (the wizard library; wizard-scripts is generated from it), `library.src.py` 10.
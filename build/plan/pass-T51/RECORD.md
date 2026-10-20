# Declaration pass T51: record

Worker: one mechanical pass (mechanics 5.10, P7), sonnet. Not committed. Input `census-before.txt` (369 ops); owners in `owners.tsv`.

## The rule applied
`build/plan/fix-round-T51-pass.md` section 3: per op, owner from the ops map (or the `control-plane/owner-ops.mjs` arm: the service's module); class, mutating, weight, description copied from the hand rows (`op-declarations` OPS, `op-grades` RUNGS / RUNG_ABSENT / NON_ACTS, act-help key); accepts / requires read from the arm and the service it calls; `DECLARED_OPS` beside the ops map; one `declared-ops.test.mjs` per module calling `declaredOpHolds`; one requirement line marked `*(not yet met: T51)*`. No arm changed.
Method: the base columns were generated from the live tables; both `registerDeclaredOps` (op-declarations, op-grades) accept every row as agreeing with its hand row (checked with a script: 48 agreed, 0 disagree, 0 duplicates).

## Step A (owners)
369 ops: 123 job, 244 pass-owned, of which 2 are judged at the owner step. Alias census names (createevent, recordfact, adoptversion ...) are owned by the module serving the alias target.

## Step B: declared (48 ops, 15 modules)
| module | requirement | ops |
|---|---|---|
| promotion | R60 | reopen, projectfork |
| provenance-routes | R14 | provenanceroute |
| capture | R97 | gradenote, archivelist, heldcaptures, heldsetaside, heldrestore, reattest |
| doorbell | R26 | knock, knocksof, inboxpull, inboxresolve |
| observation-log | R39 | lead, leadlook, leadshare, leadread |
| hypotheses | R24 | hypothesishold, hypothesisrevise, hypothesiswithdraw |
| entities | R62 | entitycreate, entityalias, aliaswithdraw, relationdeclare, resolve, resolvetestify |
| intent | R34 | objectivecondition, goaldeclare, goallink, goalclose, aspirationdeclare, aspirationdepart, aspirationdeadend, aspirationretire |
| standards | R61 | standardinforce |
| following | R36 | followregister |
| reevaluation | R39 | versionnotice |
| bias | R50 | biasdebt, biasdebtresolve |
| corpus-export | R11 | export |
| ai-accounts | R35 | subscriptiondisconnect, groupkeynoticeseen, groupkeyremove, groupkeyswitch, groupkeyset, accountreferenceset, accountreferenceremove |
| reading-guides | R16 | procedureguides |

Also edited: `build/modules.json` (`test-support` added to `uses` of ai-accounts, bias, corpus-export, entities, following, intent, observation-log, reading-guides, reevaluation, standards; the architecture check required it; member-roster `order-build.mjs --check` still matches).

## Judgments (25): declared nothing
| module | op | sentence that stopped it |
|---|---|---|
| store-door | `groupdescriptiondraft` | the draft door routes it itself (store-door/dispatch.mjs:457); no ops-map arm of any module serves it |
| wizard-scripts | `writinghelp` | the door routes it itself (store-door/dispatch.mjs:475); no wizard-scripts arm serves it (the expected case) |
| promotion | `promote` | the arm hands the request body whole to promote() as the bundle package (base, snapKey, files and the rest), an open set of fields |
| capture | `acquire` | the arm hands the whole body to acquisition's acquire(), which reads some twenty fields across its archive, capture-request, render and co-archive arms (a job module's service), more than one declaration can state |
| capture | `captureaccount` | a missing captureSha is refused NOT_THE_CAPTURING_ACTOR, which names no field, so its required field cannot be stated as the refusal names it |
| capture | `captureupload` | its arm is in control-plane/owner-ops.mjs, a later module than capture, so capture's test cannot import it (architecture: not earlier in the order) and declaredOpHolds cannot be run against the door's arm there |
| entities | `resolutiondefect` | op-grades' own test (ladder.test.mjs:167) copies the start of its hand description, so repeating that sentence in this declaration (op-grades R50 requires it equal) fails the words check's testcopy arm in a module the pass may not edit |
| hypotheses | `notewrite` | op-grades' own test (owners.test.mjs:241) copies the start of the note ops' shared hand description, so repeating it in the declaration fails the words check's testcopy arm in a module the pass may not edit |
| hypotheses | `noterevise` | same as notewrite (the four note ops share the sentence) |
| hypotheses | `noteturn` | same as notewrite (the four note ops share the sentence) |
| hypotheses | `notedelete` | same as notewrite (the four note ops share the sentence) |
| ratification | `publishat` | its hand grade is the rung irreversible, which op-grades R49 refuses in a declaration (IRREVERSIBLE_WEIGHT is derived from the hand rows) |
| publish-schedule | `publishatmove` | its hand grade is the rung irreversible, which op-grades R49 refuses in a declaration |
| bias | `biasinhale` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| bias | `biasmanifest` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| progressions | `captureprogressions` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| corpus-export | `exportlog` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| retrieval | `frontier` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| progressions | `instance` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| extraction | `pdfstructure` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| progressions | `progression` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| public-read | `publishedcase` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| reevaluation | `reevaluations` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| retrieval | `search` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |
| public-read | `verify` | no op-grades row: it is in none of RUNGS, RUNG_ABSENT, NON_ACTS (op-grades marks only), so its weight and description have nothing to copy |

## UNCERTAIN
- UNCERTAIN: "whole-body pass-through" read as an open bag (`promote`'s package). Arms that spread the body into a service with named parameters were read through to the service and declared (e.g. intent, hypotheses, entities).
- UNCERTAIN: names the door stamps into the body or query are treated as stamps, not accepts, beyond the rule's list: `declaredBy`, `resolvedBy`, `withdrawnBy`, `actor` (biasdebtresolve), `member` (accountreference*, per OP_STAMPS), body `author` / `by` (intent, hypotheses).
- UNCERTAIN: `knock` accepts content, contentB64, note, contact, knockerSecret, generateSecret and requires nothing (the arm refuses a weak secret, never an absent one), so section 4's "generateSecret / knockerSecret as alternatives" is not a requirement. The in-process hooks the arm spreads (now, windowMs, perIpLimit, globalLimit) are left out of accepts.
- UNCERTAIN: `reopen` has no hand description; its description is the registry label key `act.reopen.label.question`.
- UNCERTAIN: descriptions that are hand sentences are written `localize("<module>.declared.<op>", "<hand sentence>")` (op-grades R49 allows it; raw sentences fail the words check). Consequence below.
- UNCERTAIN: conditional requirements are left out of `requires`: aspirationdeclare `owner` (member / project scope), progressiondefine basis, noteturn `made` or `hunch` is stated as an alternative.
- UNCERTAIN: requirement lines were appended at the end of each file; the Status headers were not touched.
- Section 4 confirms: lines/recordline (kinds custodian_of and responsible_for exist in `lines/vocab.mjs`) confirmed but not declared (not reached); acquire, pdfstructure, hypothesishold about (declared, required), captureaccount judged as above; the other "confirm" items are in the not-reached list.

## Step C
- census: `declared 26 of 299 ops` from `declared.test.mjs` (before: 0; 48 ops declared, 26 of them sent by SCREENS acts, the rest only by the registry); 7 pass 0 fail; no duplicates.
- checks (`checks.txt`, run with the new test files visible through a temporary index, because the checks read git-tracked files only): format 0, architecture 0, channels 0, words 0 (inline 0, testcopy 0); coverage only the 7 baseline failures (agent-harness R17, agent-runner R36-38 R40, citation R16-18, installer-steps R26 R31, journey-check R19, link-sweep R13-15, monitoring R75-77). BOB must `git add` the 15 new test files for these to show on the tree.
- suite (`suite.txt`, full run): modules failing: setup-words (R10, R16, R17: MINE, see below), bundler, ocr-worker, promotion (system/row-census: C-140.4 NOT_SCANNED, C-140.7 SCAN_STALE rows, the scanner wave, not the pass), strength, agent-runner, agent-worker, case-checker (stale program.mjs), review, affordances (R57 R61 spelling), answer-envelope, interface-shell, screens-settings/intake/daily/inquiry/investigate/publish/action (screen reds under the guard: findings for their jobs), plane (R24 words), installer (stale bundles), journey-check. All except setup-words are word-text, stale-bundle or screen findings of other modules; I could not compare with a pristine tree (no git stash allowed), so the claim that they pre-date the pass rests on their messages. journey-check: BOB killed its full run (K4111); its other files (journey.test.mjs and live.test.mjs excluded; live.test.mjs alone exceeded 590 s) ran pass 68 fail 0.
- RED CAUSED BY THE PASS, NOT FIXED (needs another module's generated file): setup-words R10, R16, R17 fail because the new `localize` ids make `bio-plane/src/setup-words/rows.mjs` (and `words-unreviewed.json`) stale. Fix: `node bio-plane/src/setup-words/build.mjs` from the repository root (BOB's layer-close step); not run here because the pass may not edit another module's files.
- Not mine: bundler R39 real-fleet arm, fleetbundles stale bundles and section 9 (the touched sources also stale `bio-plane/dist/bio-plane.bundled.mjs`), affordances R57/R61, plane R24, screens-intake R8, screens "acts are exactly its registry acts" reds.

## Remaining work (stopped at about 60% of context, at a module boundary)
173 pass-owned ops not reached (each still `pass` in `owners.tsv`; the note column says "not reached"). By owner:
```
case-account (2): accountdrafts accountpropose
ai-accounts (8): accountusesset aikeepaway projectaccountremove projectaccountswitch projectaikeepaway projectkeynoticeseen projectkeyset projectsigninset
actions (6): actioncorrespond actioncreate actionlaws actionmove actionrisktier addresseesuggest
action-holds (5): actionhold actionholdrelease actionpressure holdnoticesent pressurerecord
action-records (4): actioninquiry actionlawspropose actionscope actionstake
events (4): addparticipant createevent recorddatedfact relate
consequences (4): addressedrecord consequencerecord consequencerevise successrecord
workbooks (3): addworkbook bind recordcheck
reevaluation (3): adoptversion keepversion reevaluationrecord
ai-use (2): ailimitset exploreapprove
ai-runs (2): airunclose airunopen
attestation (1): attest
case-tensions (1): attribute
money (7): authoritychain committedagainstpaid createset exclude include reconcile recordfact
bias (1): biasadopt
calculations (5): calculationaccept calculationcreate calculationdraw spotcheckvisit tabledeclare
ratification (4): caseratify publish release retire
action-plans (11): checkpointrecord optionadd optionadopt optiondispose optionstart optionstartpreview planask planclose planopen plansubjectadd scenarioset
action-clocks (4): clockadopt clockpropose reminderanswer reminderset
basis-versions (9): conclude narrow versionaccept versionconsider versioncurrent versionhide versionreject versionrevert withdrawconclusion
contradiction (6): contradictionclarify contradictiondismiss contradictionoptin contradictionresolve contradictionrespond contradictiontakeup
standards (4): courtlink lawrelate standardadopt standarddeclare
duties (1): declare
people (7): declaretie identityclaim personexpunge recordpersonfact sourcepersonlink withdrawidentityclaim withdrawtie
escalation (11): declinetoescalate escalationadvance escalationattach escalationdecline escalationend escalationevaluate escalationopen escalationreopen escalationresume escalationstoppursuing escalationsuspend
conformance (1): determine
progressions (3): discharge progressiondefine thread
docket (2): docketfile docketpost
explore (3): explore explorepreset exploreverify
local-facts (4): factconfirm ruleconfirm ruledraft rulewithdraw
retrieval (3): findin select selectionrelease
plan-work (1): itemtakeup
sources (5): knockerconsent sourceconsent sourceconsentwithdraw sourcedisclose sourcelink
network-notices (2): noticepost noticeprepare
case-carriage (2): obscuremark obscuremarkwithdraw
extraction (1): pagetranscribe
strength (2): projectbarset strengthbarset
membership (5): projectinvite projectjoin projectleave projectremove projectvisibilityset
publish-schedule (1): publishatcancel
lines (1): recordline
answers (3): ruleanswer standingquestionend standingquestionset
following (3): secondlook secondlookclear watchitem
wizard-scripts (7): startfrom wizardapprove wizarddraft wizardretire wizardrevise wizards wizardsubmit
run-productions (1): suggest
content (2): transcribe transcriptionattest
translations (5): translationadopt translationconfirm translationdraft translationgrant translationrevert
intent (1): triage
```
Ones that looked hard (seeded fixtures needed before the required field is reachable): events, action family, escalation, contradiction, sources, translations, progressions (thread, define: basis), content, basis-versions, money, calculations. `sourceconsent`, `contradictionresolve`, `escalationattach` have a weight but no hand description (use the registry label key as for reopen).
Tool: the generator and specs are in the scratchpad `/tmp/claude-0/s/` (gen.mjs, specs/*.mjs); not part of the repository.

# Declaration pass T51: record, group B (continuation of RECORD.md part 1)

Worker: group B, sonnet. Rule as part 1 (BOB K4203) plus K4204 (an op with no op-grades row, not mutating, takes weight `read`; none of group B's ops needed it: every op has a row). Nothing committed. Group B's modules: action-plans intent people entities action-holds sources action-records reevaluation local-facts observation-log retrieval case-account ai-use network-notices promotion duties plan-work provenance-routes run-productions. Every `pass` op of these owners is now declared or judged: nothing remains (`left` check over `declaredOpsOf`: 65 declared in the group by parts 1 and 2, 9 judged below, 0 duplicates).

## Declared by this continuation (13 modules, 44 ops)
| module | requirement | ops (door name; arm where it differs) |
|---|---|---|
| duties | R34 | declare (arm `dutydeclare`) |
| plan-work | R19 | itemtakeup |
| network-notices | R31 | noticeprepare |
| ai-use | R16 | ailimitset, exploreapprove |
| local-facts | R20 | ruledraft, ruleconfirm, rulewithdraw |
| retrieval | R91 | findin, select, selectionrelease |
| sources | R21 | sourcedisclose, sourcelink, sourceconsent, sourceconsentwithdraw |
| action-holds | R20 | actionhold, actionholdrelease, holdnoticesent |
| action-records | R20 | actionlawspropose, actionscope, actionstake, actioninquiry |
| reevaluation | R40 (beside part 1's R39 `versionnotice`) | adoptversion (arm `versionadopt`), keepversion (`versionkeep`), reevaluationrecord |
| intent | R35 (beside part 1's R34) | triage |
| people | R42 | identityclaim, withdrawidentityclaim (arm `identitywithdraw`), recordpersonfact (`personfact`), personexpunge, declaretie (`membertie`), withdrawtie (`membertiewithdraw`), sourcepersonlink |
| action-plans | R52 | planopen, plansubjectadd, planclose, optionadd, optiondispose, scenarioset, checkpointrecord, optionstart, optionstartpreview, planask |

Each module has `declared-ops.test.mjs` (reevaluation and intent: appended to part 1's file) calling `declaredOpHolds` per op, and its requirement line marked `*(not yet met: T51)*`. Aliases are declared under the door name the screens send (`declare`, `adoptversion`, ...), and the test runs the arm the alias names. The base answer of every test was printed once and is `ok` (a temporary line in the helper, restored; `bio-plane/test/declared-ops.mjs` is byte-identical to the index).

## Judgments (9): declared nothing
| module | op | sentence that stopped it |
|---|---|---|
| local-facts | `factconfirm` | op-grades' own test (owners.test.mjs:34) copies the start of its hand description ("fact-directed: keyed by a profile fact's path ..."), so repeating that sentence in this declaration (op-grades R49 requires it equal) fails the words check's testcopy arm in a module the pass may not edit (declared, then withdrawn after the check) |
| network-notices | `noticepost` | the same: op-grades' owners.test.mjs:46 copies the start of its hand description ("project-directed: keyed by a project, reached from the project; ...") (declared, then withdrawn after the check) |
| action-holds | `actionpressure` | the mark is `pressure` OR the pair `pressure_kind` + `pressure_note` (the arm builds it from either), a requirement neither one field nor a list of single alternatives states; without either spelling the arm refuses PRESSURE_REFUSED |
| action-holds | `pressurerecord` | the same arm helper: `pressure` or `pressure_kind` + `pressure_note` |
| action-plans | `optionadopt` | two forms in one arm: a proposal id, or `offer` with its `plan` (`#adoptOffer`); the requirements of the second (plan and offer) are not an alternative of the first's single field, and the whole body is merged over the proposal's own fields |
| sources | `knockerconsent` | every failure (no secret, a weak one, a wrong one, a bad entry or audience, a rate refusal aside) answers one frozen byte-identical answer that names no field, by design (sources R11), so no required field can be stated as a refusal names it |
| case-account | `accountdrafts` | its arm is in control-plane/owner-ops.mjs, a later module than case-account, so case-account's test cannot import it (architecture) and `declaredOpHolds` cannot be run against the door's arm (as part 1's `captureupload`) |
| case-account | `accountpropose` | the same (control-plane/owner-ops.mjs) |
| run-productions | `suggest` | the arm spreads the whole body into `suggest()`, which reads some twenty fields (kind, name, description, claim, relationship, derived_from, level, observed_at, grounds, legs with their own fields, and the forbidden state/hidden/at ones) and refuses by kind (level-empty, comparisons, legs), more than one declaration can state (as part 1's `acquire`) |

Part 1's judgments in these modules (promotion `promote`, entities `resolutiondefect`) stand unchanged.

## UNCERTAIN
- UNCERTAIN: a refusal is read as naming a field when its code is in the test's table for that field, or its `field` / `argument` property is the field (or starts with `field.`), as in the example module's code table; where one code serves two fields (action-holds `actionhold`: `hold` and `reason` both HOLD_REFUSED; `sourcelink`: `source` and `to` both NO_SUCH_SOURCE; people `identityclaim`: `a` and `b` both NO_ENDS; action-plans `checkpointrecord`: scenario, phase, judged all CHECKPOINT_REFUSED) the test cannot tell the two apart.
- UNCERTAIN: stamps carried in the BODY (people's every op, local-facts' rule ops, intent's `author`) are `by`, `viewer`, `author`, `assistantPrincipal` (a control-plane BODY_STAMPS name) and are not accepts; `run` and `personWarningSeen` (intent `triage`) are accepts.
- UNCERTAIN: in-process hooks left out of accepts: ai-use's `at` (a clock the arm spreads from the body to `aiLimitSet` / `exploreApprove`; the module reads it as an instant). If BOB wants it declared it is one word in two rows.
- UNCERTAIN: conditional requirements left out of `requires`: sourcedisclose `sight` (a stored value), `revealed`'s inner fields; sourceconsent* none; actionhold `ord` (with `target`), `from`, `projects`; holdnoticesent `medium`; local-facts ruleconfirm `statement` (tier 2, 3, undetermined), personexpunge `order` / `demandKind` (by ground), triage `reason` (defer, dismiss) and `project` (adopt), optiondispose `reason` (declined, deferred) and `reminders`.
- UNCERTAIN: alternatives lists: actionhold, actionholdrelease `[target, project, case]` (the place; the arm refuses more than one with HOLD_PLACE_REFUSED, so they are alternatives and also exclusive); holdnoticesent `[account, artifact_sha]` (one, never both); planclose `[id, plan]`.
- UNCERTAIN: a refusal nested in a preview: `optionstartpreview` answers ok with `refusal` and `would_start: false` for a missing `kind`; the test reads the nested refusal (`refusedNaming` wrapper), so `kind` is required there.
- UNCERTAIN: `sourceconsent` has no hand description; its description is the registry label key `act.sourceconsent.label.about-knocker` (it exists in the words table; the other label key of that screen is `act.sourceconsentwithdraw...`, which has a hand sentence).
- UNCERTAIN: `retrieval` `select` and `selectionrelease` declare `requires: []` (an absent handle releases all of the owner's selections; the credential is the stamp `owner`).
- UNCERTAIN: requirement lines for reevaluation (R40) and intent (R35) are new ones beside part 1's R39 / R34 rather than edits of them; their Status headers were not touched.
- UNCERTAIN: the test files import unused helpers (`sign`, `prepare` in network-notices after `noticepost` was withdrawn). Harmless; BOB may tidy.

## Uses needed (do not edit modules.json): `test-support` is missing from `uses` of
action-holds, action-plans, ai-use, duties, local-facts, network-notices, people, plan-work, retrieval, sources (architecture check: 10 failures, one per module, all this). intent, reevaluation, action-records, entities, case-account, observation-log already have it; promotion, provenance-routes, run-productions touched no test.

## Words
New `localize` ids (the table needs rows; `bio-plane/src/setup-words/rows.mjs` is stale until BOB regenerates): duties.declared.declare, plan-work.declared.itemtakeup, network-notices.declared.noticeprepare, ai-use.declared.ailimitset, ai-use.declared.exploreapprove, local-facts.declared.ruledraft, local-facts.declared.ruleconfirm, local-facts.declared.rulewithdraw, retrieval.declared.findin, retrieval.declared.select, retrieval.declared.selectionrelease, sources.declared.sourcedisclose, sources.declared.sourcelink, sources.declared.sourceconsentwithdraw, action-holds.declared.holdnoticesent, action-records.declared.actionlawspropose, action-records.declared.actionstake, action-records.declared.actioninquiry, reevaluation.declared.adoptversion, reevaluation.declared.keepversion, reevaluation.declared.reevaluationrecord, intent.declared.triage, people.declared.identityclaim, people.declared.withdrawidentityclaim, people.declared.recordpersonfact, people.declared.personexpunge, people.declared.declaretie, people.declared.withdrawtie, people.declared.sourcepersonlink, action-plans.declared.planopen, plansubjectadd, planclose, optionadd, optiondispose, scenarioset, checkpointrecord, optionstart, optionstartpreview, planask (all `action-plans.declared.<op>`). Ops whose description is a registry or act-help key (no new word): actionhold, actionholdrelease, actionscope (`act.<op>.does`), sourceconsent (`act.sourceconsent.label.about-knocker`); all four exist.

## Tests (each module's whole directory, `node --test --test-force-exit`)
| module | before | after |
|---|---|---|
| action-holds | 44/44 | 47/47 |
| action-plans | 67/70 (ask, duty-starts, preview test files failed at 75 s, 124 s and 12 s while 18 module runs shared the machine) | 98/98 |
| action-records | 30/30 | 34/34 |
| ai-use | 83/83 | 85/85 |
| duties | 74/74 | 75/75 |
| intent | 90/90 | 91/91 |
| local-facts | 71/71 | 74/74 (after `factconfirm` was withdrawn) |
| network-notices | 73/73 | 74/74 (after `noticepost` was withdrawn) |
| people | 66/66 | 73/73 |
| plan-work | 50/50 | 51/51 |
| reevaluation | 139/140 (across.test.mjs failed at 89 s, same load) | 149/149 |
| retrieval | 167/167 | 170/170 |
| sources | 38/38 | 42/42 |
| entities, observation-log, provenance-routes, case-account, run-productions | 137, 82, 41, 48, 62 all pass | not edited by this continuation |
| promotion | not run | not edited |

The three action-plans and one reevaluation baseline reds were file-level timeouts under load; all pass now with the same sources. No red remains in group B.

## Checks (temporary index with the group's changed files, `checks/run.mjs`)
format 0 failures; architecture 10 failures, all "uses needed" above; channels 0; words: inline 0, plain 0, missingkey 0, marker 0, testcopy 8, all 8 in op-grades' own tests against other groups' ops (wizard-directed, case-directed, draw-directed, translation, photo, reading-directed, project-directed `projectbarset`), none against group B (the two that were, `factconfirm` and `noticepost`, were withdrawn); coverage 26 failures, none a group B module (they are other modules' ids named by no test, those of part 1's baseline and the other groups').

## What remains
Nothing in group B. For BOB: the 9 judgments above get their own wave-2 jobs (or, for `factconfirm` and `noticepost`, op-grades' tests re-worded or the declaration restored once the testcopy arm stops flagging); `build/modules.json` `uses` gains `test-support` for the 10 modules; `node bio-plane/src/setup-words/build.mjs` for the new keys.

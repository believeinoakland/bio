# Census batch 6: the design's 11 journeys, 81 steps (read on tranche/T51, read-only)

Columns: `journey · step | verdict | first broken link (1-5) | evidence (file:line) | cause in one line | owning module`.
Paths are under /home/user/bio/bio-plane/src/. "No door" means no link, rail place, menu or queue item opens the screen; only a typed address does.

| journey · step | verdict | link | evidence | cause | module |
|---|---|---|---|---|---|
| a·1 Install the signed release | WORKS | - | newgroup/src/ui.mjs:82-87 (permanence dialog), newgroup/src/index.mjs:370,916 (hand-over to /app/setup#boot=) | slug permanence is said at the moment of choosing; the one-time password is carried to setup by the hand-over button | installer |
| a·2 Open setup, claim with the password | WORKS | - | screens-entry/setup.mjs:118-123 (otp prefilled from #boot, claim); interface-shell/browser.mjs:2361 | founder lands on setup with the password in the field | screens-entry |
| a·3 Name, domain, profiles | WORKS | - | screens-entry/setup.mjs:202-222 (groupnameset, groupdomainset, placewanted, profilesset) | | screens-entry |
| a·4 Add a second administrator | WORKS | - | screens-entry/setup.mjs:292-294 (memberadd, cover field); screens-settings/members.mjs:142,244-253 (administer tick, link shown once) | | screens-entry, screens-settings |
| a·5 Record who holds hosting access | WORKS | - | screens-entry/setup.mjs:296-297 (hostingaccessset beside the admin invite) | | screens-entry |
| a·6 Add members with capabilities | WORKS | - | screens-settings/members.mjs:142,244-253; invite link built "/#invite=" (browser.mjs:2360 sends it to /app/join) | | screens-settings |
| a·7 Open the link, handle and password | WORKS | - | screens-entry/join.mjs (joinlinkinvite, invitelook, handlecheck, enroll); journey-check/journeys.mjs:290-303 walks it | | screens-entry |
| a·8 Create a project with an objective | WORKS | - | screens-daily/start-project.mjs, home.mjs (startfrom); investigation.mjs:85 walks it | | screens-daily |
| a·9 Invite participants; they join | WORKS | - | screens-inquiry/project.mjs:332 (projectinvite), :614; the invitee gets queue kind project-invitation (screens-daily/index.mjs JOIN) and projectjoin on project.mjs | | screens-inquiry, screens-daily |
| a·10 Discoverable; outsider requests; owner grants | WORKS | - | project.mjs:272 (projectvisibilityset), :636; screens-daily/queue.mjs:428 and home.mjs:406 (projectrequestanswer); a grant then arrives as a project-invitation item | | screens-inquiry, screens-daily |
| b·1 Capture a public document | WORKS | - | screens-intake/capture.mjs (acquire); project.mjs:172 and question.mjs "Add a document" open /app/capture/address/<id>; investigation.mjs:113 walks it | | screens-intake |
| b·2 Release it (vouch) | WORKS | - | screens-intake/held.mjs:96-97,147-158 (ack + mitigation required, bulk release), document.mjs/open-file also offer release | | screens-intake |
| b·3 Resolve references to subjects | PARTIAL | 5 | screens-inquiry/document.mjs:596-640 (names list: label is a plain span, no link to the person); accept/testify live on screens-investigate/person.mjs:91-98 | the document shows each name with its grade but never opens that person's page; the member must go Explore (document.mjs button) then person to press "match" or "testify" | screens-inquiry, screens-investigate |
| b·4 Open a question | WORKS | - | project.mjs:171-186 (promote); investigation.mjs:94 | | screens-inquiry |
| b·5 Cite documents as supporting/against | WORKS | - | document.mjs (cite), finder; investigation.mjs:194 | | screens-inquiry |
| b·6 Open an assistant run | HELD | - | screens-inquiry/assistant.mjs:1-60 (refusals worded by key; AI_RUN_MODE_NOT_DEPLOYED, AI_KEPT_AWAY); question.mjs:253 draws the ask only when reachable | assistant is N1220/K3717; screen is honest and nothing downstream needs it (member path via inquiryground, question.mjs:1060) | screens-inquiry |
| b·7 Accept a version | WORKS | - | question.mjs:164-174,541-552,968-981 (versionaccept/consider/reject/revert, preview, compare); first version by a member through inquiryground (question.mjs:394-396) | | screens-inquiry |
| b·8 Make it current for the project | WORKS | - | question.mjs:551 (versioncurrent, joined member, project known) | | screens-inquiry |
| b·9 Conclude, with a falsifier | WORKS | - | question.mjs:780-790,857-872 (own reading allowed, R50; falsifier or "none") | | screens-inquiry |
| b·10 Check strength vs bar; clear hunches | WORKS | - | question.mjs:386-410 (strength against the bar, weakest, what raises it); ceremony.mjs:100-120 lists every gate (BELOW_PROJECT_STRENGTH) in words; UNCLEARED_HUNCH is not yet enforced by design | | screens-inquiry, screens-publish |
| b·11 Draft a review copy; grant reviewers | WORKS | - | question.mjs:791-794 and project.mjs:220-246 link review-copy; screens-publish/review-copy.mjs:104-116,156-172 (grant, link shown once, revoke) | | screens-publish |
| b·12 Prepare the case | WORKS | - | question.mjs:346 (casedraft) then cs.go case-editor (question.mjs:886); case-editor.mjs:90-250 (scope, statement, leaves-out, people, what changed, account) | | screens-publish |
| b·13 Acknowledge the exclusion statement | WORKS | - | case-editor.mjs:~124 (statementack by a joined participant); review-outside.mjs (recipient) | | screens-publish |
| b·14 Publication ceremony, sign in browser | WORKS | - | ceremony.mjs:60-300 (pre-flight, tensions, photos, ties, publish, one sitting of caseratify, move/cancel time) | the journey's "not built" note is out of date: the screen and browser signing exist | screens-publish |
| b·15 Ratify each finding and evidence | WORKS | - | ceremony.mjs:237-262,325-340 (one caseratify sitting signs the case, each finding and each evidence line) | | screens-publish |
| b·16 Read and verify by hash | WORKS | - | screens-publish/published.mjs:44-90 (editions, several-case choice, verify) | | screens-publish |
| c·1 Declare the standard | WORKS | - | screens-investigate/standard.mjs:80-100 (standarddeclare from a held capture); listed on project.mjs:220 | | screens-investigate |
| c·2 Record a determination per standard | DEAD END | 1 | op `determine` is declared (op-declarations/index.mjs:1210) but no screen lists it; absent from docs/development/ux-substrate/screens/registry.json; the Matter screen only reads (screens-action/matter.mjs:26-31) | no screen records a determination | screens-action / conformance (design gap) |
| c·3 Record consequences | DEAD END | 1 (and 5) | `consequencerecord`, `consequencerevise`, `addressedrecord` have no screen; matter.mjs only reads `consequencesof` | no screen records consequences; also there is no determination to hang them on | screens-action |
| c·4 Open an escalation | DEAD END | 5 | matter.mjs:130,139-141 draws escalationopen only on a determination id; the id can never exist (c·2). project.mjs:220-226 links "matter" with the PROJECT id as subject, so that link opens a failed read | the screen is built but nothing can hand it a determination | screens-action, screens-inquiry |
| c·5 Decline to escalate with a reason | DEAD END | 5 | matter.mjs:130,149 (declinetoescalate) | same: needs a determination; the journey itself says "decided, not built" | screens-action |
| c·6 Create a breach action, set the tier | DEAD END | 3 | actionnew.mjs:129-166 builds the action document with no determination, no "asserts a breach" flag; the only breach switch is start-send.mjs:127-128 (needs an option and a live determination); actions R8 refuses a breach without one; no screen sets an option's addressee (plan.mjs:384-392) | a breach action rests on a determination that cannot exist, and its office addressee cannot be entered | screens-action |
| c·7 Prepare, approve, record the filing sent | PARTIAL | 1 | send-steps.mjs:185-222,266-296 (member's own text; prepare, approve, second approval, record sent); Tier 1 template texts are HELD (N858: screen.action.templates.notyet) | works on any action that exists, but a breach filing cannot be reached (c·6) | screens-action |
| c·8 State the deadline with its legal basis | WORKS | - | action.mjs:136-141 (dated entries link to due-date, reminderset), screens-investigate/due-date.mjs:40-80 (clockpropose, clockadopt); actionnew.mjs due fields refuse a date with no basis (:157-160) | | screens-action, screens-investigate |
| c·9 Plane marks overdue, proposes next stage | WORKS | - | action-producers (action-clock-overdue) and queue kinds in screens-daily/index.mjs; escalation prompt waits on c·4 | the "not yet built" note in the journey is stale for the overdue mark | action-producers |
| c·10 Evaluate the response | PARTIAL | 3 | action.mjs:325-333 (a reply is date + free account only, direction fixed "received"); :346-352 (resolution complied/denied/escalated/withdrawn/completed); `escalationevaluate` has no screen | no way to cite a captured response, record "no response", or mark partial compliance; the clock-stopping rule has no control | screens-action |
| c·11 Advance to legal tools / accountability | DEAD END | 5 | matter.mjs:105 (escalationadvance); `escalationdecline`, `escalationsuspend`, `escalationresume`, `escalationattach` have no screen | needs c·4; decline-with-reason and suspend have no control at all | screens-action |
| c·12 Assemble a counsel packet (Tier 3) | DEAD END | 1 | screens-action/counsel.mjs:11 is registered, but nothing links to it: action.mjs, plan.mjs, start-send.mjs, interface-shell REF_SCREENS (index.mjs:91-96) and the rail have no counsel door; send-steps.mjs:200-201 only prints a sentence | no door to the screen | screens-action |
| c·13 Record consequences addressed; end | DEAD END | 5 | matter.mjs:106 (escalationend); `addressedrecord` and `successrecord` have no screen | needs c·4 and c·3 | screens-action |
| d·1 Open the queue | WORKS | - | rail "queue" (interface-shell/index.mjs:100-103); screens-daily/queue.mjs:34-60 | | screens-daily |
| d·2 Options with rung/weight, pre-flighted | WORKS | - | queue.mjs:121-140 (options and disposition door; unregistered options become "Open") | | screens-daily |
| d·3 Resolve or forward obligations | WORKS | - | queue.mjs:41-52 (taskresolve, taskforward registered) | | screens-daily |
| d·4 Defer or dismiss a queue finding | WORKS | - | queue.mjs (proposedispose, reason via shell) | | screens-daily |
| d·5 Take up an objective gap/proposal | WORKS | - | queue.mjs FIELDS promote (open a question), proposedispose | | screens-daily |
| d·6 Adopt newer / keep earlier | WORKS | - | queue.mjs:52 (adoptversion/keepversion with why); home.mjs; "record re-evaluation" is i·2's gap | | screens-daily |
| d·7 Resolve a tension, or dismiss a lead | DEAD END | 3 | queue producers raise contradiction-lead, -plurality, tension-after-publication (queue-producers kinds), but `contradictionresolve/dismiss/clarify/takeup/respond` are in no screen's acts (screens-daily/queue.mjs:41-52) | the item arrives and its "Open" goes to no surface; the journey says "no member surface yet" | screens-daily (design gap) |
| d·8 Resolve a bias debt with a reason | DEAD END | 3 | `bias-debt` items are produced; `biasdebtresolve` is in no screen | no control | screens-daily (design gap) |
| d·9 Mute a condition / snooze a case | WORKS | - | queue.mjs:121-140 (queuemute, queuesnooze) | | screens-daily |
| e·1 Mint a member-scoped AI credential | HELD | - | screens-inquiry/projectai.mjs, screens-settings/connect.mjs, teamai.mjs exist; `aicredentialmint` in no screen | N1220/K3717 | agent/ai modules |
| e·2 Work the objective | HELD | - | question.mjs:253 draws the ask only when reachable | N1220 | screens-inquiry |
| e·3 Run requests captures | HELD | - | not a screen step | N1220 | capture-requests |
| e·4 Daemon drains requests | HELD | - | not a screen step | N1220 | capture-requests |
| e·5 Supply a source login and retry | HELD | - | no screen needed until the run exists | N1220 | capture-requests |
| e·6 Run suggests versions, surfaces questions | HELD | - | question.mjs:301-320 draws proposals only when reachable | N1220 | screens-inquiry |
| e·7 Accept or reject; the run never does | HELD | - | the member's accept path is b·7 and is unaffected | N1220 | screens-inquiry |
| f·1 Someone knocks with material | PARTIAL | 5 | knocker side works: screens-entry/front.mjs:72 and tour.mjs:22 link /app/doorbell; screens-publish/doorbell.mjs (knock). The hand-over to a member does not (f·2) | the receipt reaches the knocker; the knock lands in an inbox no member can open | screens-publish, screens-intake |
| f·2 A member reads the inbox and resolves | DEAD END | 1 | screens-intake/inbox.mjs:158 registered; no link in any screen, no rail item, no queue kind for a knock (queue-producers kind list has none), interface-shell REF_SCREENS knock->inbox (index.mjs:92) is a card kind nothing draws; the journey says "setup page performs the pull; app.html has no inbox" | no door to the Inbox screen | screens-intake / screens-daily / interface-shell |
| f·3 What is known of the source grows | DEAD END | 1 | `sourcedisclose`, `sourceconsent`, `sourceconsentwithdraw`, `sourcepersonlink` in no screen; inbox sourcelink (inbox.mjs) is behind f·2 | no surface (journey says so) | screens-intake |
| g·1 Editors draft; owner grants a named recipient | WORKS | - | review-copy.mjs:104-116,156-172; reached from question.mjs:793 and project.mjs:220 | | screens-publish |
| g·2 Recipient reads, comments, acknowledges | WORKS | - | link `/app/review#grant=` shown once (review-copy.mjs:166); screens-publish/review-outside.mjs (reviewcomment, statementack); owner sees comments review-copy.mjs:120-135 | | screens-publish |
| g·3 Editors revise; owner publishes naming the draft | WORKS | - | ceremony.mjs:300-313 and parts.mjs:229-235 send `draft` on publishpreflight and publish (the journey's "no surface sends draft=" is stale) | | screens-publish |
| h·1 Make the request under its governing law | DEAD END | 3 | request.mjs:35-40 reads addresseesuggest with the PROJECT id; actions/index.mjs:2966-3000 resolves offices only from an entity or a document's resolved entities through `custodian_of`/`responsible_for` lines; setup.mjs:1662-1720 seeds only post_in/part_of; no screen records a custodian_of line; so request.mjs:100-110 always draws "no office known" | the office list can never be non-empty, so "Start the request" is never drawn. Workaround off the designed path: plan option started as records_request (start-send.mjs default kind) then request/<action> | screens-action, actions |
| h·2 Record it sent; state the clock | PARTIAL | 1 | send-steps.mjs:266-296 (filingrecordsent), due-date.mjs clockpropose/adopt | works only on an action reached by the workaround; not reachable from h·1 | screens-action |
| h·3 Record what came back | PARTIAL | 3 | action.mjs:325-333 (date + account text only) | no fee quote, stage, denial, exemptions, or a "no response" entry (action.mjs:177 draws no_response entries but nothing creates one) | screens-action |
| i·1 Monitoring detects modified/removed | WORKS | - | document.mjs monitorset/monitor; queue kinds source-modified/removed (screens-daily/index.mjs:50-52) | | monitoring, screens-daily |
| i·2 Members see affected findings and notices | PARTIAL | 3 | queue kinds newer-capture-affects-reference; adoptversion/keepversion (queue.mjs:52); `reevaluationrecord` in no screen | "record re-evaluation" has no control | screens-daily |
| i·3 Reopen and publish a new edition | WORKS | - | question.mjs:346 (withdrawconclusion then casedraft); case-editor.mjs edition reuse (parts.mjs:233 reuses caseId); ceremony.mjs signs the next edition. Inferred, not walked | | screens-publish |
| j·1 Propose the new administrator | WORKS | - | members.mjs:142,244-253 (administer tick; proposed at 2+) | | screens-settings |
| j·2 Endorse, or vote to remove with a reason | WORKS | - | members.mjs:107-116 (adminendorse on proposed row, adminremove with reason), :250-290 (arithmetic, scale) | | screens-settings |
| k·1 Open a plan while the inquiry is young | WORKS | - | project.mjs:252-255,623 (planopen with a question and a title) | | screens-inquiry |
| k·2 See what the plan rests on | PARTIAL | 5 | plan.mjs:190-215,300-312 (subjects, support, liveness); outcome-of-determination subjects never exist | the "outcome" half of the pick list is always empty (c·2) | screens-action |
| k·3 Get suggestions | HELD | - | plan.mjs:341-345 (tray drawn only when reachable; member may still add options) | assistant (N1220) | screens-action |
| k·4 Add an option of one's own | PARTIAL | 3 | plan.mjs:384-392 sends summary, category, one subject, detail only | no addressee, dates with basis, tier or required-organisation fields, so an option has no office and dated options cannot carry their date | screens-action |
| k·5 Read and sort the options | WORKS | - | plan.mjs:249-300 (columns, sort, collapsed rows) | | screens-action |
| k·6 Choose, and say when to be reminded | PARTIAL | 3 | plan.mjs:418-424 (optiondispose sends options + disposition only); reminders exist only after start, per clock entry (action.mjs:139-141) | no reminder choice at choosing, no defaults shown | screens-action |
| k·7 Lay out a scenario | PARTIAL | 3 | plan.mjs:427-436 (one phase "p1", optional checkpoint, no branches, no ordering) | multi-phase order, branches and hostile-response branch cannot be built | screens-action |
| k·8 Judge a checkpoint | WORKS | - | plan.mjs:340-355,437-446 (checkpointrecord, take up); queue kind plan-checkpoint-due opens the plan | | screens-action |
| k·9 Start an option | PARTIAL | 3 | start-send.mjs:97-130 (preview, override, breach tick), :131-143 (optionstart); no field names the group's contact (CONTACT_NOT_A_MEMBER unreachable) and the breach path needs c·2 | non-breach start works; breach and contact do not | screens-action |
| k·10 Prepare what is sent | WORKS | - | send-steps.mjs:185-296 (own text; templates HELD N858 are honestly "not yet") | | screens-action |
| k·11 Track | WORKS | - | plan.mjs:318-328 ("Started" with action states), action.mjs reply/reminder; queue conditions | stage judging waits on c·4 | screens-action |
| k·12 Close the action, then the plan | WORKS | - | action.mjs:312-316,346-352 (resolution), plan.mjs:405-412,448-455 (planclose with reason) | | screens-action |

## Journey results

- (a) Group sets up and invites members: completes (10 of 10 steps work).
- (b) Question to published case: completes. Step 3 is indirect (the document's names do not open the person; use Explore). Step 6 is HELD and not needed.
- (c) Acting on a finding: stops at step 2 (record a determination: no screen offers `determine`). Steps 3-6 and 11-13 follow it down; step 1 works, steps 7-10 work only on actions reached some other way.
- (d) Daily queue: completes for seven of nine steps; steps 7 (tension) and 8 (bias debt) are dead items with no member control.
- (e) Delegating to the assistant: HELD in full (N1220/K3717); screens say so honestly.
- (f) Knock to the record: stops at step 2 (the Inbox has no door); step 3 has no screen.
- (g) Review copy round trip: completes.
- (h) Records request round trip: stops at step 1 (no office can ever be listed, so "Start the request" is never drawn); steps 2-3 work only through the plan route and record only a date and text.
- (i) Source changes after publication: completes, with one gap (record a re-evaluation).
- (j) Third administrator / removal: completes.
- (k) Suspicion to a closed plan: completes for the non-breach, own-words path; five steps are PARTIAL (outcome subjects, option fields, reminders, scenario depth, contact) and the breach path is dead.

## Shared causes

1. No screen records a determination or its consequences (`determine`, `consequencerecord`, `consequencerevise`, `addressedrecord`, `successrecord`; absent from registry.json). Breaks c·2, c·3, c·4, c·5, c·6, c·11, c·13, k·2 (outcome subjects), k·9 (breach), and the project page's "matter" row (project.mjs:220-226 opens matter with a project id, a failed read).
2. Screens registered with no inbound door: `inbox` (f·2, and so f·1's hand-over, f·3), `counsel` (c·12). Everything else in the 11 journeys is linked.
3. Plane-built member duties with no member control: contradiction/tension answers (d·7), bias-debt resolve (d·8), reevaluationrecord (i·2), escalationdecline/suspend/evaluate/attach (c·10, c·11), source disclosure and consent (f·3).
4. Records requests cannot name an office: addresseesuggest is given a project id, and no screen records the `custodian_of` line it needs (h·1, then h·2).
5. The action/plan forms are thinner than the plane's contracts: option has no addressee/date/tier/reminder fields (k·4, k·6, k·9), scenarios have one phase and no branches (k·7), a received reply has date and text only (c·10, h·3).
6. Journey text out of date (not defects): b·14 "five screens not built", c·9 "overdue marks not built", g·3 "no surface sends draft=".

## Counts (81 steps)

WORKS 47 · PARTIAL 12 · DEAD END 13 · HELD 9 · UNSURE 0
(i·3 is WORKS by reading, not by walk.)

# Fixture round, part 5: the second audit pass (K5044 (7))

Slice: the live lines no part classes (the fixtures check as merged, civicos-process `250046c6e9`, on the tranche tip `89ba50094c`): 166 findings, 138 scripted op-table entries of 35 modules that are not `screens-*` or `interface-shell` (their entries are op-tables.md's, store world), and 28 builder call sites (8 in screens modules). Classified: **FIX-E 111, FIX-L 21, FALSE 34, CODE 0** (sum 166). Each finding was read with the code it stands in for and the provider's source. Same format as parts 1-4: a path is relative to `bio-plane/test/m/<user>/` unless it starts with `agent-steps/`, `agent-worker/`, `newgroup/` or `t/` (= `bio-plane/test/`); `xN` marks N findings on one line. "mechanical" = the entry is deleted or replaced by the provider's default (an empty world answers the same); "judgment" = the test's world must be made to answer so, and its assertion is read from what the real code gives.

Marker note (K4995): a `fixtures-contract` marker covers its own line and the 8 below; each FIX-L site below needs one within that span, and the provider a `fixtures-run: <user> <id>` per user module.

## Providers

- FIX-E fixture `acquisition/archiveAnswer`: `acquisition.acquire` over a generated archive locator (test-support zipgen): the real `{ok, existed, document, unpack:{ok, archive:{sha256}, documents, complete}}`, members sized by the caller (reading of INLINE_MAX + n). Users and findings: control-plane 3 (total 3); re-point: mechanical 0, judgment 3.
- FIX-L contract `agent-worker/transcribe-refusal`: (part 2) the refusals agent-worker R72 gives a transcribe call (BAD_PAGES and the five others), as `workerRefusal(code, relayed)` builds them. Users and findings: extraction 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `ai-accounts/accountReference`: the real `accountReference` answer `{ok, held, subscription}` over a group with and without a connected subscription. Users and findings: signin-door 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `ai-accounts/keptAwayGroup`: (published for Wave A) the real AI_KEPT_AWAY refusal of a group that keeps its material away. Users and findings: extraction 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `ai-accounts/subscriptionDisconnect`: the real `subscriptionDisconnect` answer `{ok, disconnected:true}` of a connected subscription. Users and findings: signin-door 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `ai-runs/tickStateTooLarge`: (published for Wave A) the real `airuntick` refusal AI_RUN_STATE_TOO_LARGE, C-22.9, 403. Users and findings: agent-steps 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `ai-use/ceilingRefusal`: (published for Wave A) the real AI_LIMIT_REACHED ceiling refusal of `useCheck`. Users and findings: extraction 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `basis-versions/concludeAct`: `basisVersions.conclude(args)` over the test's record: the real concluded answer `{ok, target, to, relationship, project}` and its own refusals NO_CONCLUSION, BAD_READING (the strict arms R16, R51) in place of the hand-written ones. Users and findings: conformance 1, contradiction 1 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `capture/partRefusal`: the real refusals of capture's part upload through a parted upload: PART_DIGEST_MISMATCH 400 with `expected`/`got`, and the 409 codes of a lost part, produced by uploading a wrong or repeated part. Users and findings: screens-intake 2 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `capture/recordReuseVerdicts`: the real `recordreuseverdicts` answer and `reusedparts` read over seeded reused parts; the test reads what was recorded back from the record instead of a pushed copy. Users and findings: ratification 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `content/contentContextFor`: content's `captureFor` and `contentContextFor` over seeded captures (`{chain:[{step, tier, container, cap, measured_by, calibration}]}`), and the real refusal of `mint` for a capture it is not asked to mint (the made-up NOT_IN_THESE_TESTS goes). Users and findings: question-explorer 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-L contract `content/transcribe-answer`: content's `transcribe` answer as the transcriber receives it: `{ok:true, engine, version, pages:[{page, text}]}`, and its short forms (no engine named, no pages, a stray page); the user's test marks the hand-built value, content's test runs it against its real code. (content is after extraction and reading-pipeline.) Users and findings: extraction 1, reading-pipeline 5 (total 6); re-point: mechanical 0, judgment 6.
- FIX-L contract `control-plane/ask-wire`: (K5044 (5)) the plane door as the agent worker sees it: the `{ok,result,store,tokenClass}` envelope and the refusal body `{ok:false, reason, code, check}` at its status. Sites: a refuse_op table of the worker's fake plane and agent-steps' `refusal403` builder. The marker goes on the builder and on each table site; control-plane's test runs the bodies through `makeFetch`. Users and findings: agent-steps 3, agent-worker 3 (total 6); re-point: mechanical 3, judgment 3.
- FIX-E fixture `credentials/bootstrapVersions`: the real `bootstrap` answer of a store with version stamps: `{ok, claimed, version, storeVersion, memberVersions:{name:{state}}}`; each lag case of installer R66 is a stamp state the store can really be in (store version absent or null, members unreported, SILENT, MISNAMED, UNBOUND, a member missing). Users and findings: installer 10, installer-steps 2 (total 12); re-point: mechanical 0, judgment 12.
- FIX-E fixture `docket/coreDue`: the real `coreDue` over an empty or seeded docket: `{ok, items:[{case, kind, ref, edition?, since}], count, wrote:false}`. Users and findings: queue-producers 5, queue 1 (total 6); re-point: mechanical 2, judgment 4.
- FIX-E fixture `docket/pressureMarks`: the real `docketPressureMarks` over an empty docket (`marks:[]`), a docket not asked, and an unreadable one. Users and findings: filings 3 (total 3); re-point: mechanical 0, judgment 3.
- FIX-E fixture `escalation/escalationsDue`: the real `escalationsDue` over escalations opened by real acts: `{ok, items:[{id, project, opened_by, from, to, stage, instant, ids, state}], limit:500, truncated:false}`; empty over a fresh world. Users and findings: action-producers 5, monitoring 12, queue-producers 1 (total 18); re-point: mechanical 13, judgment 5.
- FIX-E fixture `events/sequenceUndetermined`: the real `events.sequence` answer `undetermined` with and without `why`, over events that cannot be ordered. Users and findings: people 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `events/timelineAnswer`: the real `events.timeline` over an empty world: `{ok, world:{items:[]}, ours:{sources:[]}}`. Users and findings: explore 2 (total 2); re-point: mechanical 2, judgment 0.
- FIX-E fixture `extraction/readHeldAnswer`: (part 4) the real `readHeld` answers: read, a piece that goes on (`more`, `detail.cursor`), a final stop, a retry (SLOW is the made-up reason of Task A). Users and findings: plane 3 (total 3); re-point: mechanical 0, judgment 3.
- FIX-E fixture `inquiry/disposeAct`: `inquiry.dispose({handle, to, reason, viewer, owner, author})` over the real selection and promotion, in place of the test's hand-written dispose. Users and findings: intent 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `instance-setup/selftestAnswer`: the real `selftest` answer `{ok, bindings:{STORE, ...}}` of a store with its store binding unbound. Users and findings: installer-steps 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `money/readFactNotFound`: the real `money.readFact` answer `{ok:true, found:false}` over an empty money record. Users and findings: ratification 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `money/readFactOf`: the real `money.readFact({factId})` over seeded facts (`{ok, found, fact}`). Users and findings: strength 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `monitoring/monitorAnswer`: the real `monitor({bundleId})` answer over a monitored capture: `{status, body:{ok, status:"unchanged", capture:{sha256}}}`, one per tick of the test's clock. Users and findings: following 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `monitoring/monitoringReads`: the real `monitoring`, `archiveEligible` and `flagged` reads (and the scheduler's `configured`, `archiveDue`) over an empty world, and over seeded monitors: unscheduled, due, source modified or removed, archive-fallback eligible. Users and findings: machinery-producers 5, queue-producers 8, queue 1, scheduler 1 (total 15); re-point: mechanical 6, judgment 9.
- FIX-E fixture `people/checkResults`: the real `people.checkResults` and `listChecks`, and `moneyChecks.noticed`, over an empty record (`results:[]`). Users and findings: queue 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `progressions/disposeProposalOk`: the real `disposeProposal` success `{ok, key, progression_key, definition_version}`; the test's call log becomes a spy that delegates to it. Users and findings: queue 2 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `promotion/promoteControlled`: the real `promotion.promote` over real record-core, made to refuse by a real cause (stale base, SNAP_KEY_TAKEN, not a participant: `staleBaseRefusal`, `projectActNotParticipant`), to throw by a failing record, and to succeed with the real `{ok, bundleId, bundleSha}`; the call log is a spy that delegates. Users and findings: control-plane 1, store-door 1 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `reevaluation/noticesRead`: the real `reevaluation.notices` over raised notices (`{ok, limit, truncated, notices}`). Users and findings: queue-producers 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `standards/bindsAt`: the real `standards.bindsAt({standard, body})` answer `{ok, standard, body, binds}`; the Proxy that overrides it goes. Users and findings: duties 1 (total 1); re-point: mechanical 0, judgment 1.
- FIX-E fixture `standards/standardsEmptyReads`: the real `standardsAt`, `standardsWithPortion`, `addressesOf` over an empty standards record. Users and findings: reevaluation 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `standards/standardsIn`: the real `standardsIn` over an empty record (`{ok, items:[]}`). Users and findings: following 3 (total 3); re-point: mechanical 3, judgment 0.
- FIX-L contract `standards/host-refusals`: the `STANDARD_*` refusals (NO_ID, DATE_INVALID, FIELD_UNKNOWN, NO_REASON, NO_SUCH_PROPOSAL, PROPOSAL_ADOPTED, PROPOSER_UNNAMED, WHY_INVALID) and PORTION_UNKNOWN as the host hands them to law-relations (`hostRefusal(code, extra)`: `{ok:false, reason, code, host:true, detail, ...}`); standards' test runs each against its real code. Two markers cover the eleven lines of the table (MARK_SPAN 8). Users and findings: law-relations 8 (total 8); re-point: mechanical 8, judgment 0.
- FIX-E fixture `steps/stepsWorld`: (part 2) the real steps module over the test's record: `step`, `recordProduct`, `laterFound`, `stepsDue`, `costShares`, `costMessages`. Users and findings: capture-requests 1, notice-producers 1 (total 2); re-point: mechanical 0, judgment 2.
- FIX-E fixture `store-assembly/storeWorld`: (K5046 (d), op-tables.md 5.2) the real store, the real claim and sign-in, the page door, recipes of real acts and a pinned clock; the plane the page asks. Users and findings: journey-check 11, screens-action 3, screens-inquiry 2 (total 16); re-point: mechanical 0, judgment 16.
- FIX-E fixture `strength/testimonyCorroboration`: the real `testimonyCorroboration` over no testimony (`{ok, legs:[]}`). Users and findings: ratification 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `translations/memberLanguageRead`: the real `registerMemberLanguageRead` and `wordsVersion`; a `wordsVersion` that throws is a fault (K5044 (1)) and needs no fixture. Users and findings: instance-setup 1 (total 1); re-point: mechanical 1, judgment 0.
- FIX-E fixture `wizard-scripts/noSuchWizard`: the real NO_SUCH_WIZARD refusal of the wizard-script read for an unknown id. Users and findings: screens-wizards 1 (total 1); re-point: mechanical 1, judgment 0.

## Users

### action-producers (5)
- FIX-E escalation/escalationsDue: action.test.mjs:135; t45.test.mjs:122,144,358 (judgment)
- FIX-E escalation/escalationsDue: world.mjs:120 (mechanical)
### agent-steps (4)
- FIX-E ai-runs/tickStateTooLarge: agent-steps/test/interface.test.mjs:281 (judgment)
- FIX-L control-plane/ask-wire: agent-steps/test/world.mjs:34,59,69 (mechanical)
### agent-worker (3)
- FIX-L control-plane/ask-wire: agent-worker/test/requirements.test.mjs:732,832,898 (judgment)
### ai-accounts (1)
- FALSE NAME-CLASH: fixture.mjs:92 (a world helper method named like the op: records the test's fact, no store answer)
### capture-requests (1)
- FIX-E steps/stepsWorld: t41.test.mjs:148 (judgment)
### case-authoring (6)
- FALSE SYNTHETIC-CODE: disclosures.test.mjs:68,69,70,71,72,73 (R("H".."F"): one made-up refusal per pre-flight step, to prove order; fixtures-generic H,T,S,M,A,F)
### conformance (1)
- FIX-E basis-versions/concludeAct: fixture.mjs:173 (judgment)
### contradiction (1)
- FIX-E basis-versions/concludeAct: fixture.mjs:118 (judgment)
### control-plane (11)
- FALSE OWN-FN-INPUT: archive.test.mjs:73 (archiveDocuments(..) is control-plane's own pure function; the literal is its argument)
- FIX-E promotion/promoteControlled: doorbell.test.mjs:405 (judgment)
- FALSE OWN-SEAM-ROUTES: envelope.test.mjs:484; r48-routes.test.mjs:195,196; r49-routes.test.mjs:131,132,143 (a route map handed to store-door's real dispatch; the handler is never asked or its answer is relayed unread)
- FIX-E acquisition/archiveAnswer: r133-r134-follow.test.mjs:262; t51-g43-embed.test.mjs:50,72 (judgment)
### duties (1)
- FIX-E standards/bindsAt: policies.test.mjs:207 (judgment)
### explore (2)
- FIX-E events/timelineAnswer: verify-timeline-ops.test.mjs:83,158 (mechanical)
### extraction (5)
- FALSE OWN-FN-INPUT: relays.test.mjs:46 (acquireReadingOp(..) is extraction's own function; the acquire answer is its argument)
- FIX-L agent-worker/transcribe-refusal: t46.test.mjs:122 (mechanical)
- FIX-L content/transcribe-answer: t48.test.mjs:28 (judgment)
- FIX-E ai-use/ceilingRefusal: t50.test.mjs:108 (mechanical)
- FIX-E ai-accounts/keptAwayGroup: t50.test.mjs:109 (mechanical)
### filings (3)
- FIX-E docket/pressureMarks: words.test.mjs:147,149,153 (judgment)
### following (4)
- FIX-E monitoring/monitorAnswer: fixture.mjs:166 (judgment)
- FIX-E standards/standardsIn: watches.test.mjs:320,592,635 (mechanical)
### installer (15)
- FALSE FAULT: newgroup/corpus.test.mjs:70; newgroup/requirements.test.mjs:520,615,1750; newgroup/t47.test.mjs:192 (the copy asleep: a nameless {ok:false})
- FIX-E credentials/bootstrapVersions: newgroup/requirements.test.mjs:554,555,556,557,558,559,560,561; newgroup/t50.test.mjs:272,401 (judgment)
### installer-steps (3)
- FIX-E instance-setup/selftestAnswer: newgroup/steps/verify.test.mjs:48 (judgment)
- FIX-E credentials/bootstrapVersions: newgroup/steps/verify.test.mjs:105,113 (judgment)
### instance-setup (1)
- FIX-E translations/memberLanguageRead: r8-parts-report.test.mjs:161 (mechanical)
### intent (1)
- FIX-E inquiry/disposeAct: fixture.mjs:151 (judgment)
### journey-check (15)
- FIX-E store-assembly/storeWorld: conclude-fields.test.mjs:14; pseudo.test.mjs:46,47,57,59,60,61,176,178; start-project.test.mjs:13x2 (judgment)
- FALSE FAKE-NETWORK-INPUT: walker.test.mjs:39x2,43,159 (the plane the walker reads over HTTP: refusals in the shapes the walker must find; walker.test.mjs:39-45 and :159 are its input, the walker reads any JSON)
### law-relations (8)
- FIX-L standards/host-refusals: fixture.mjs:143,144,147,149,150,151,152,153 (mechanical)
### machinery-producers (5)
- FIX-E monitoring/monitoringReads: invariants.test.mjs:42,122; producers.test.mjs:59 (judgment)
- FIX-E monitoring/monitoringReads: producers.test.mjs:81; world.mjs:119 (mechanical)
### member-roster (1)
- FALSE NAME-CLASH: fixture.mjs:36 (a world helper method named like the op: records the test's fact, no store answer)
### membership (2)
- FALSE NAME-CLASH: fixture.mjs:55,99 (a world helper method named like the op: records the test's fact, no store answer)
### monitoring (12)
- FIX-E escalation/escalationsDue: ends.test.mjs:211; understanding.test.mjs:333,363,376,446,487,505,543,554,576,580,591 (mechanical)
### notice-producers (1)
- FIX-E steps/stepsWorld: investigation.test.mjs:262 (judgment)
### people (1)
- FIX-E events/sequenceUndetermined: why.test.mjs:110 (judgment)
### plane (3)
- FIX-E extraction/readHeldAnswer: r7-lastmem.test.mjs:41; r7-lastms.test.mjs:20,38 (judgment)
### question-explorer (1)
- FIX-E content/contentContextFor: fixture.mjs:255 (judgment)
### queue (5)
- FIX-E progressions/disposeProposalOk: converts.test.mjs:143; dispose.test.mjs:11 (judgment)
- FIX-E people/checkResults: noticed.test.mjs:290 (mechanical)
- FIX-E monitoring/monitoringReads: world.mjs:152 (mechanical)
- FIX-E docket/coreDue: world.mjs:171 (mechanical)
### queue-producers (15)
- FIX-E escalation/escalationsDue: action.test.mjs:88 (judgment)
- FIX-E docket/coreDue: docket.test.mjs:36; every.mjs:65; localday.test.mjs:38; words.test.mjs:214 (judgment)
- FIX-E monitoring/monitoringReads: every.mjs:59; feeditems.test.mjs:130; producers.test.mjs:114,140; reads.test.mjs:21 (judgment)
- FIX-E reevaluation/noticesRead: noticed.test.mjs:10 (judgment)
- FIX-E monitoring/monitoringReads: reads.test.mjs:121; words.test.mjs:127; world.mjs:173 (mechanical)
- FIX-E docket/coreDue: world.mjs:183 (mechanical)
### ratification (3)
- FIX-E capture/recordReuseVerdicts: converted-c.test.mjs:415 (judgment)
- FIX-E strength/testimonyCorroboration: g54-entry.mjs:110 (mechanical)
- FIX-E money/readFactNotFound: g54-entry.mjs:112 (mechanical)
### reading-pipeline (5)
- FIX-L content/transcribe-answer: text-units.test.mjs:526,531x2,532; transcribe.test.mjs:322 (judgment)
### reevaluation (1)
- FIX-E standards/standardsEmptyReads: fixture.mjs:100 (mechanical)
### scheduler (1)
- FIX-E monitoring/monitoringReads: fixture.mjs:39 (judgment)
### screens-action (3)
- FIX-E store-assembly/storeWorld: plan-t51.test.mjs:209; send-t51.test.mjs:35,286 (judgment)
### screens-inquiry (2)
- FIX-E store-assembly/storeWorld: fr2-question.test.mjs:116; fr3-question.test.mjs:23 (judgment)
### screens-intake (2)
- FIX-E capture/partRefusal: r9-parts.test.mjs:140,154 (judgment)
### screens-wizards (1)
- FIX-E wizard-scripts/noSuchWizard: fixtures.mjs:55 (mechanical)
### signin-door (2)
- FIX-E ai-accounts/accountReference: door.test.mjs:52 (judgment)
- FIX-E ai-accounts/subscriptionDisconnect: door.test.mjs:286 (mechanical)
### store-door (8)
- FALSE OWN-SEAM-ROUTES: dispatch.test.mjs:328,329,352,561; purge-hold.test.mjs:17,89; routes.test.mjs:384 (a route map handed to store-door's own dispatch: the handler records that it was routed to, or is never reached)
- FIX-E promotion/promoteControlled: pull.test.mjs:192 (judgment)
### strength (1)
- FIX-E money/readFactOf: fixture.mjs:139 (judgment)

## Where the world (`storeWorld()`, op-tables.md 5) serves a non-screens module better than a fixture per op

- journey-check (`pseudo.test.mjs` PLANE of about twenty ops, `start-project`, `conclude-fields`): 14 findings, all FIX-E store-assembly/storeWorld. journey-check is after store-assembly, so it can import the world; its `PLANE` is the same table as the screens', and the walk it checks is the one the page makes. Recommended: the world, one entry of the round with the screens' jobs.
- screens-action (3), screens-inquiry (2): builder call sites `refusedWith(code,..)`, `refusedBody(BASIS_VERSION_REFUSED, ..)` are the screens' scripted refusals; each becomes the act that causes it (op-tables.md 5.3).
- installer / installer-steps (`copy: { bootstrap, selftest }`): the copy is reached over HTTP by a fake external network (K5044 (1)), so the world is not wired in; the answers it gives for `bootstrap` and `selftest` are fixtures of credentials and instance-setup (above) produced by a real store, served by the test's fake network.
- control-plane (`unpack` of an acquire answer, `promote`) and the module-level stand-ins (queue-producers, monitoring, machinery-producers, action-producers, following, filings, strength, ratification) are services of earlier modules, not ops of the page door: a fixture per provider, not the world. They stand in for one function, not for a store.
- signin-door is before store-assembly: it cannot use the world; ai-accounts fixtures serve it.

## Check observations (for BOB; nothing was changed in the check by this part)

- **Op-table entries that are not ops.** A key that equals an op name but is a method of the test's own world helper (`claim()` of the credentials fact in ai-accounts, member-roster, membership), a dependency name (`steps`, `notices`, `standards` as the services of earlier modules) or a field of an answer (`unpack` of an acquire answer) is listed as `[op-table <op>]` with the provider of the op. About a dozen of the 166 are such: the provider named is the op's, the stand-in is another module's function. The rows above name the real provider.
- **Route maps of store-door's dispatch.** A `routes: () => ({ op: handler })` handed to store-door's own `dispatch` (13 findings in store-door and control-plane) is the module under test's seam; K5044 (3) lists each entry. fixtures v3 does not skip them (a handler is an answer by shape); they are FALSE here and would need `fixtures-own: input`.
- **Builders.** `R("H")`, `hostRefusal`, `refusal403`, `refusedWith`, `refusedBody`, `refusalOf` are found at their call sites only when called in the file that defines them; the three of interface-shell (`refused`, `refusedIn`), screens-action `real.mjs` and the other imported builders are listed at their definition and their call sites are not followed. Following an imported builder would add its call sites to the list (it would remove 3 findings and add the call sites): not done here.

## Uncertain

- journey-check `walker.test.mjs:39-45` (4 FALSE): the entries are answers a fake plane gives to a real browser so that the walker finds refusals inside a 200 (D1, D3, D5); the walker reads any JSON, so they are its input. They copy shapes ai-accounts (`NOT_YOUR_ACCOUNT`), ai-runs (`AI_RUN_BOUND_NO_ALLOWANCE`) and action-plans give; if BOB wants those shapes held to the real ones, the three become FIX-E with the providers' refusal fixtures.
- installer `bootstrap`/`selftest` answers (13): classed FIX-E (credentials/bootstrapVersions, instance-setup/selftestAnswer) because the lag cases assert on `storeVersion` and `memberVersions` the real store gives; the `{ok:false}` of an asleep copy (5) is a fault and FALSE. If BOB takes the fake network as exempt (K5044 (1)), the 13 are FALSE and no job is owed.
- `escalation/escalationsDue` carries 18 findings (13 mechanical: an empty world); `monitoring/monitoringReads` 15: both are the largest providers of this part and can be published together in Wave A (escalation and monitoring are in it).
- law-relations `hostRefusal` (8): the host's refusal helper (`host:true`) is the plane's; classed FIX-L standards because the codes are standards'. If the plane's host is the provider, the contract is plane's `host-refusals`.
- store-door `pull.test.mjs:192` and control-plane `doorbell.test.mjs:405` share one `promotionStandIn(r, decide)`; one fixture serves both. Its `decide` verdicts "refuse", "throw" and "succeed" must come from real causes; a throw has no real cause in promotion and stays a fault (K5044 (1)).
- No CODE finding: every code the 166 name is given by a source or is a made-up sentinel the Task A markers cover (`NOT_IN_THESE_TESTS`, `H`..`F`, `SLOW`).

## Task A residual: the FALSE lines the fixtures check (civicos-process `prep/fixtures-v3`) still lists

After v3 the live list is 2,816 (answer 2,494, stub 271, code 51) from 2,936. Of the 221 FALSE lines of parts 1-4 (53 modules), 99 no longer appear; 122 findings remain, in 109 lines. They are:

- **Reclassified (3), the part was wrong (4 lines):** queue-producers `scheduled.test:62, 157` name `SCHEDULED_SOURCE_CHANGED` and `SCHEDULED_HOLD_CHANGED`, which no source gives (ratification gives `SCHEDULED_SOURCES_CHANGED`, `SCHEDULED_TIES_CHANGED`): CODE, real codes named; control-plane `envelope.test:567` (intent's NOT_YOURS, C-111.15, whose row the door must pick by code): FIX-E intent/notYoursRefusal; `t50-door.test:175` (inquiry's NOT_AN_INQUIRY and NO_SUCH_BUNDLE by viewer): FIX-E inquiry/readRefusals; `t42-door.test:114` (a whole extraction refusal with its check C-51.7): FIX-E extraction/transcribeRefusal.
- **Generic marker owed (K5044 (2), the check accepts it once the line is added; mechanical pass):** control-plane door-share:16; control-plane r117-held:89,90,146,165; control-plane r123-reading:84; control-plane r130-jobs:20; control-plane r100-upload:65; control-plane r9-seam-documents.mjs:514; control-plane r9-seam-reading.mjs:146,147,149; interface-shell p9:71; interface-shell t50:318,455; plane r7-keephome:37; plane r7-lastmem:22,59; plane r9-jobs:91,318; plane t36:54; screens-action join-t51:63; screens-action plan:232; screens-inquiry assistant:204,214; screens-inquiry b22-question:67; screens-inquiry fr2-question:127; screens-inquiry fr3-question:43; screens-intake capture:166; screens-intake r8-supporting:36; screens-intake r9-states:111; screens-publish ceremony:263; screens-publish fixtures.mjs:42; screens-publish g54-page:123; screens-publish public:327; screens-publish review:214; screens-publish t50:117; screens-settings common:136; screens-settings panel:132,160; screens-settings security:75; screens-settings storage:66; extraction relays:120; host-governor ops:106; capture-requests reads:106; public-read g54-attempt:219; promotion converts:39; provenance testimony-slot:105; record-core record-core:777; member-roster t19-enrol-boot:40; member-roster t47-check-tables:89; membership t19-enrol-boot:39; membership t45-project-guard:124,125; membership t47-check-tables:86; promotion row-census:482; reading-pipeline read:196; reading-pipeline text-units:507,511,530; reading-pipeline transcribe:320; store-door pull:311,316,318; skills pack:152,246,247,248; action-plans words:34; answer-envelope envelope:169.
- **`fixtures-own` marker owed (new rule, v3):** platform: bundler g54-observability:20; bundler g83-g84:23; bundler release:248,1163,2067; bundler repo.mjs:278; capture-requests drain:286; monitoring docket:87; journey-check walker:45. harness: agent-runner remote-log:16; signatures signatures:819; ocr-worker ocr-worker:205; capture g127f-worker.mjs:47; plane migrate-released:231; reading-pipeline transcribe:346. synthetic: docprofile stubs.mjs:28,86,126; monitoring fixture.mjs:270; reading-pipeline classify-once:69; reading-pipeline g41-held:329. input: control-plane draft:93; control-plane envelope:193,194,349,350,398; control-plane r117-held:179; control-plane r123-reading:145; control-plane r135-job-state:33; control-plane r8-door-phases:39; control-plane t36-door:293; control-plane t37-door:212,214; control-plane t41-door:173; control-plane t50-door:352; control-plane t51-acquire-timings:62; control-plane t51-server-timing:83; agent-steps readers:130; public-read dec149:129; pdf-reader pagesource:177; pdf-worker structure:303.
- **Stay listed:** interface-shell `harness.mjs:22, 23` and screens-action `real.mjs:54` (builders whose call sites the check does not follow; they close with the screens' re-point to the world).
- Simulated: a scratch checkout of the tip with these markers inserted at the 109 lines (112 marker lines) makes every one of them accepted and leaves no idle marker.

## Tally

FIX-E 111 + FIX-L 21 + FALSE 34 + CODE 0 = 166 = the live findings no part 1-4 line covers, of 2,000 unclassed (the other 1,834 are screens-* and interface-shell op-table entries, op-tables.md).

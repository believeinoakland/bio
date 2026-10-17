# T50 L11a fold: the worker's report (for BOB #202's review)

**Status** · The non-screen L11 fold (and following's, agent-worker's L6/L10 changes) written by a fold worker (sonnet, medium) for BOB #201 under BOB #201's rulings on the draft's doubts (K3667); saved unreviewed as `draft-fold-T50-L11a.patch` (apply with `git apply`; it applies clean on `tranche/T50` @ K3667). Review it whole, then apply, add the `uses` edges below, and commit. The screen fold is already committed (c9f5732161).

## Ids written
- wizard-scripts R41 registry regenerated with `--check` (install acts excluded by name); R42 library re-taken (16 of 23 differ, 4 renamed); R43 saved draft listed.
- op-grades R45 the 15 ops graded (watchitem, secondlook, secondlookclear, projectstakeset, actionstake Reversible; actioninquiry undetermined; 9 reads NON_ACTS); R46 marks re-taken; R47 DEC-300 (5)'s four acts (doubt 1).
- affordances R63 vocabulary words by key; R64 act names by key; R65 the five T50 acts' help.
- queue-producers R41 project-invitation (inviter waits on T51); R42 project-request for owners.
- machinery-producers R15 capture request in keys.
- queue R55 muted list; R56 `subject.title`; R57 the new kinds' classes.
- instance-setup R67–R75, R87 retired "moved to translations R1–R10"; R92 `tick(now)`; R93 forums seed; R94 the split (11 delegates stay; 16 rows wait for answer-envelope).
- op-declarations R73 15 ops by kind; R74 gained request fields (airunopen `project` added; answer-only fields dropped).
- admission R29 administrator asked before the password; R30 AI caller's viewer carries its project.
- interface-assets R1 reworded; R9 classes since f498560a37, one design commit with site.
- notice-producers R24 watched-changed (mark instants from following R35).
- control-plane R102 review copy's matter stake (N933 rewritten); R103 15 ops routed; R104 unknown address draws the 404 page; R105 `for` sight and a bound (diagnose first); R106 AI viewer; R107 stamped viewer to inboxpull/inboxresolve.
- plane R58 T50 ops and reach readers; R59 ask stream; R60 tests read modules.json; R61 translations composed; R62 groupFields RPC takes a project.
- installer R59 SEGMENTS; R60 instance_type; R61 the release's own fleet statement; R62–R65 an account already holding a Civicsmith (three choices; what is here; alongside with per-slug names, meeting R13/R24 and replacing R32; guided removal); R66–R71 the situations S5–S12, F1–F10; R72 words by key.
- site R13–R16; journey-check R15–R19 (R19 REMOTE for RUNNER conditional on the proof; its mark placed up front: move it to the end).
- translations (new file): R1–R10 moved from instance-setup, R11–R12 new, R13–R16 copies.
- following R33/R34 `by` as handle; R35 `watchedBy`. agent-worker R113 `read.record`, `composing{found,count}`, `checking{count}`, `checked{passage,found}`; R116 `disagree{record,levels}`.

## Uses edges for BOB to add (earlier only)
wizard-scripts → setup-words; queue-producers → setup-words, project-roster; queue → setup-words; machinery-producers → run-rules; notice-producers → retrieval; installer → setup-words; control-plane → action-records; plane → translations; answer-envelope → translations (with the 16-row move, see below); translations' own row: uses setup-words, record-grammar, jurisdictions, record-core, membership, ai-accounts, extraction, wizard-scripts (paths from the map); if tests import maps: op-declarations → progressions, affordances → retrieval, acquisition.

## Keys owed (to UX-DESIGN, one HANDOFF with the screens' list)
act.retire.name, act.conclude.name, act.reopen.name, act.projectleave.name; queue.project-invitation.summary.unnamed; act.projectrequestanswer.label.queue and its grant/decline words; screen.site.steps.name.noplace; a name per mutable kind for queue.muted.kind's {kind}; installer words for F1 resumed, F2 Containers not enabled, F3 limit reached, F4 transient failure, F5 registry unavailable, F6 re-approve, F7 name taken with a free one offered, F9 another install running.

## For next.md
- project-roster `projectInvitations` (L2 closed) so the invitation names its inviter.
- S11's release-side half (bundler/release assembly, L1 closed).
- answer-envelope must list translations' checks file before instance-setup deletes the 102 lines: add it to T50-25 (L11, not started) or the rows wait.
- The delegates and nine route lines go when store-door and plane re-point (T51).

## Worker's doubts
1. op-grades R47: "Save as a draft" taken as `wizarddraft`; `planopen`, `wizarddraft` leave RUNG_ABSENT (undetermined tally −2); `membertie` reasoned → reversible though people R20 requires its note and the kit weighs 2; `notewrite` stays caller-owned with a Reversible MARKS entry. Confirm.
2. installer R63: no public read returns holdings counts; the Cloudflare API count is the fallback.
3. Bounds unsettled: S5/F4 (the file gives none), control-plane R105 (diagnose first).
4. agent-worker's event field names follow screens-inquiry R58.
5. The map's doubt 2 (LANGUAGE_MALFORMED row): translations R13 says "one module only".
6. plane R58's connections reach reader uses the project document's non-severed `cites` edges.

## Screen fold's cross-reference to fix at apply
interface-shell R73 cites "`wizard-scripts` R13 (T50-17)": the id is R41. screens-wizards R15 cites wizard-scripts R10, R39 for the draft listing: add R43. screens-settings R53 says `SIGNIN_EXPIRED` has no key: DEC-307 gave it (K3659). Asks for UX-DESIGN from the screen fold: re-points (interface-shell R85: secondlookclear on finder, projectrequestanswer on queue, projectrequest/projectrequestwithdraw on project, factconfirm on group, aliaswithdraw on person); wizard subject kinds beyond project, question, document; `ask` on `assistant`; the screen keys owed (shell.icon.plan; screens-settings R45's time-zone fields, R46's court-added sentence; screens-daily R45's flag note and clear and unwatch, R47/R48's validity labels, "Who paid whom", standard kinds; size.kb, size.mb; project.rescue.title without date; the cite's choose-first sentence; screens-action R20, R22's sentences).

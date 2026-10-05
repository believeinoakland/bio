# M5 working extraction (assembled into notes/M5.md at the end)

## affordances.txt (182 lines, read 1-182)
TIME
- [DESIGN] R3 l30 — reminderset, reminderanswer graded RUNG_ABSENT ground caller-owned ("a member's own request, as queuesnooze") (action-plans reminders).
- [DESIGN] R2 l27 — addressfrequencyset reasoned (monitoring R17, R52: a canned or custom reason) — capture cadence per address.
- [DESIGN] R30 l47 — factconfirm NON_ACTS "fact-directed: keyed by a profile fact's path, reached from the calendar and offices; moves no bundle"; reads factstatus, factsdue.
- [DESIGN] R33 l59 — actionholdrelease consequence: "assistant transcripts for them past the time limit will be deleted on each member's device when it is next opened; this cannot be undone."
- [DESIGN] R2 l25 — escalationresume reversible; escalationsuspend/advance/evaluate reasoned; scenarioset reversible (action-plans R14); checkpointrecord, optionstart undetermined (R3 l30).
ORGANISATIONS
- [DESIGN] R4 l35, R6 l40 — VOCABULARIES carries entity_kinds, relation_kinds = `entities`' ENTITY_KINDS, RELATION_KINDS (same reference).
- [DESIGN] R2 l26-28 — relationdeclare, relationwithdraw reasoned; entityalias reversible; entitycreate, resolve reasoned; aliaswithdraw reasoned.
- [DESIGN] R31 l33 — entitycreate high friction, dialog: "a person named in the registry".
- [DESIGN] R30 l47 — factconfirm "reached from the calendar and offices" (local-facts: offices as profile facts).
- [DESIGN] R9 l97-98 — roster acts (projectinvite/join/leave/owner...) are about the group's own projects, not external organisations.
LAW
- [DESIGN] R4 l35 — VOCABULARIES carries law_levels, action_basis_kinds, norm_canons, resolution_kinds, plurality_differences (inquiry R46; contradiction R31).
- [DESIGN] R2 l25-28 — actionlaws reversible; actionlawspropose reversible; standardpropose reversible; standarddeclare, standardadopt reasoned; determine reasoned ("a supersession's reason, conformance R7; K375").
- [DESIGN] R26 l115 — action_kind = product kinds + active profiles' action_kinds via jurisdictions.combine; "No kind is held here."
COURTS
- [DESIGN] R33 l57-60 — litigation hold: actionholdrelease terminal (DEC-113), "releasing the hold restarts deletion"; actionholdpreview, projectholds reads.
- [DESIGN] R2 l28 — counselpacket reasoned (a packet for counsel).
- [DESIGN] R34 l61-66 — `docket` ops (docketfile, docketpressure, docketdecline, docketpost) are "case-directed: keyed by a published case ... never evidence" — the group's own published-case docket, NOT a court docket.
- [DESIGN] R35 l67-71 — case-import: "case" = another group's published case (import/accept/flag), not a court case.
ANALYSIS
- [DESIGN] R2 l27 — comparisonpropose reversible; consequencerecord reasoned; consequencerevise reasoned; strengthbar reasoned ("a gate on the whole group", R31 dialog).
- [DESIGN] R19 l148 — consequencerecord backed "by its arms (consequences R2–R4), its assessed arm's rationale refused as any reason is".
- [DESIGN] R16 l112 — facts are counts, never ids.
QUESTIONS
- [DESIGN] R2 l27 — DEC-88 reversible machine-proposal acts: suggest, extractpropose, contradictionpropose, themepropose, standardpropose, comparisonpropose, theorypropose, actionriskpropose, actionlawspropose, filingprepare, casedraft, airunopen, airunclose.
- [DESIGN] R31 l33 — workobjective "the lightest of the six: its reason field opens in place with the run's budget and scope shown beside it".
- [DOCTRINE] R7 l41 — MACHINE_REFUSALS: release, conclude, withdrawconclusion (MACHINE_CANNOT_CONCLUDE), reopen, publish, inquirydivide/ground, action acts, six version acts (MACHINE_CANNOT_MOVE_VERSION); contradictionresolve MACHINE_CANNOT_ACT_ON_CANDIDATE.
- [DOCTRINE] R10 l99 — with actor_is_machine true every MACHINE_REFUSALS act withheld.
- [DOCTRINE] R17 l118 — "Every act in catalog is a member's: its mode is session or admin-session, never machine (INVESTIGATIVE-SESSION §4; K728)."
- [DESIGN] R37 l82 — no-target answer gains screens and wizard_scripts "for the pack (skills R9, R10)" — the AI skill pack reads affordances.
- [DESIGN] R32 l55 — whatchangedpropose "a draft, never a statement until a member adopts it".
DOCTRINE
- [DOCTRINE] R18 l146 — pre-flight never disagrees with the refusal it fronts (DEC-8).
- [DOCTRINE] R2 l27 — IRREVERSIBLE_CORRECTION_PATH "correction moves forward and nothing is erased (DEC-19)".
- [DOCTRINE] R21 l150 — no surface composes text; R25 l154 "No place is named in this module's behaviour or outward text".
- [DOCTRINE] R36 l72-76 — phone flag advisory; filingsent larger-screen.
- [RULING] K102, K1038 (DEC-88), K1396 settled readings.

## op-declarations.txt (127 lines, read 1-127)
- [DOCTRINE] R2 l21 — "No spec names `ai`: an agent credential is admitted by its task scope alone, never by a row here." (QUESTIONS)
- [DOCTRINE] R7 l105 — "No I/O, no store, no network, no clock; no place is named".
- [DESIGN] R8 l30-34 — factconfirm mutating member act (local-facts R1); factstatus, factsdue reads (local-facts R2, R4); templatepropose any credential incl. ai.
- [DESIGN] R9 l40 — declinetoescalate, escalationstatus (as escalationsdue: a read); addressfrequencyset.
- [DESIGN] R10 l48-52 — escalationreasondraft read; whatchangedpropose any credential (ai by scope); sweeps; notices/noticepost machineClasses [].
- [DESIGN] R11 l57 — optionstartpreview read (action-plans R37).
- [DESIGN] R12 l61-62 — actionholdrelease, actionholdpreview, projectholds.
- [DOCTRINE] R13 l66 — docket ops machineClasses []: "no machine, AI credential or operator token files, places, declines or signs a docket entry".
- [DOCTRINE] R14 l69 — case-import machineClasses [].
- [DESIGN] R15 l78-80 — wizardpropose any credential, ai included; wizardcheck reached also by ai credential.
- none on LAW/COURTS/ANALYSIS beyond op names.

## wizard-scripts.txt (106 lines, read 1-106)
TIME
- [DESIGN] R15 l64 — tallies per day only: "No member id, viewer, case, project or instant finer than the day is kept"; no abandon event.
- [DESIGN] R1 l21, R7 l38 — versions with approved instant; `updated` when superseded (version-in-force pattern for scripts).
ORGANISATIONS
- none (project/administrator roles of the group itself only).
LAW
- [DOCTRINE] R20 l90 — "No place, law or venue is in this module's behaviour or outward text."
- [DESIGN] R2 l22 — a step draft can be `{template}` (filing-templates R25 offered version).
COURTS
- none.
ANALYSIS
- [DESIGN] R16 l67 — wizardCandidates: screens/steps where step counts drop most and (op, code) pairs most refused (usage analytics, unattributed).
QUESTIONS
- [DESIGN] Purpose l11 — scripts "serves the scripts that start on a screen to every member's session with no AI credential and no key"; "A machine proposes and never approves. A script never says or submits anything for a member".
- [DOCTRINE] R2 l22 — draft "placed for the member, never submitted: it becomes the member's words only by the member's own act of keeping or editing it" (K1364 B3).
- [DESIGN] R5 l32 — any credential may propose; labelled proposalLabel(proposer, "wizard").
- [DESIGN] R12 l53-54 — WIZARD_STEP_CONCLUDES: no draft on a machine-refused act unless {machine: op} in machineDrafts (whatchangedpropose, escalationreasondraft); "Whether a step's words tell a member what to conclude is not judged here: the assistant's critique (skills R32) and the approving member judge it"; op=wizardcheck serves any credential incl. ai "so a wizard the assistant plans on the fly passes the same checks (DEC-120 (1))".
- [DOCTRINE] R19 l89 — machine writes only a proposal; never drafts/approves/...
- [GAP] Suggestions l103 — Civicsmith library "empty of scripts until the UX stream's step 5 writes them"; screen registry "empty until the new interface ships one".
- [GAP] Status l3 — "Every id is not yet met: T31."; runner, docked guide, screens are the UX stream's (l11-12).
DOCTRINE
- [DOCTRINE] R18 nothing deleted; R19 machine only proposes; R20 no place, law, venue.
- [RULING] K1364 (B1, B3, B4), K1363 (B8, B9), DEC-120, DEC-121, K1396, K1397.

## tasks.txt (69 lines, read 1-69)
TIME
- [DESIGN] R1 l16-17 — taskDrain with `now`; a consumer registered with scheduler runs it while events wait (task-drain).
- [DESIGN] R3 l19 — resolved_at stamped; R6 l28 resolvedTasks since; Satisfies l55 Interaction Constructs §T "a task ages, is never dropped, is addressed to someone or `unassigned`".
- [GAP] no due date / deadline on a task in R1-R6 (only created, resolved_at; aging per §T).
ORGANISATIONS
- [DESIGN] Purpose l11 — "The obligation inbox: tasks routed from captures whose authority is undetermined" — "obligation" here = an internal work item for group members, routed by bundle ownership (R1 l16: project owner → owner of first project citing it → earliest active administrator → unassigned). Not an obligation of a public body.
- [DESIGN] R1 l16 — routing is by the group's own roster (membership activeAdmins), not by external org.
LAW
- none in tasks.txt (C-19.1 task grammar = INBOX-GRAMMAR, data/inbox.json).
COURTS
- none.
ANALYSIS
- [DESIGN] R2 l18 — per-status counts over the visible set plus queued-event count.
QUESTIONS
- [DOCTRINE] R3 l19 — MACHINE_CANNOT_FORWARD (C-32.10), MACHINE_CANNOT_RESOLVE (C-32.11).
DOCTRINE
- [DOCTRINE] R9 l49 — "No answer names a bundle the viewer may not see, and no count reveals one (REC-30, DEC-36)." R11 l51 no place named.
- [RULING] K507, K531, K562, K102 (DEC-16 reading).

## queue.txt (160 lines, read 1-160)
TIME
- [DESIGN] R1 l22-23 — OBLIGATION (To do) kinds with time: plan-checkpoint-due ("a checkpoint your group set in an action plan has come; a member judges whether its condition was met"; queue-producers R16), escalation-stage-proposed ("its trigger was met"; R17), action-reminder ("a reminder you asked for on one of the group's action deadlines"; R18, DEC-94), local-fact-due ("a holiday calendar or office hours one of the group's deadlines reads is unconfirmed or due for confirmation"; R21, K921), docket-core-due (R?; docket R9, DEC-116 item 2).
- [DESIGN] R1 l24 — FINDING kinds: missing_predecessor, overdue_successor (progressions), temporal-expectation-due, measure-decay, newer-capture-affects-reference.
- [DESIGN] R1 l27-28 — CONDITION kinds: notice-lapse-near ("a working-on notice will lapse within 7 days"), notice-attestation-missed ("a monthly attestation"), sweep-silent ("filed nothing in its last four runs"), action-clock-overdue ("a deadline on one of the group's actions passed while its entry is still pending"; queue-producers R15, K611); R5 l32 monitoring-recheck-due, capture-session-ttl-expiring.
- [DESIGN] R49 l37 — sort `due`: "soonest first by the item's `due` (queue-producers R25)"; `added` newest first by age. Item Terms l19 carry `due` where a producer carries it.
- [DESIGN] R21-R22 l61-62 — queueSnooze until (BAD_UNTIL, UNTIL_IN_PAST); scheduler consumer wakes at earliest future snooze. R40 snoozed_until.
- [DESIGN] R39 l50 — resolved block "resolved by X on this date" within a recent window.
- [DESIGN] Satisfies l131 — "U (`undetermined` stated: the home set, `age`, `terminal`)".
- [BUILT/GAP] Status l3-7 — Action-layer kinds (plan-checkpoint-due, escalation-stage-proposed, action-reminder, action-clock-overdue) "not yet met"; local-fact-due/template-review-requested not yet met (T21); R48, R49 not yet met (T22 layer 11); docket kinds not yet met (T27). (Verify against code.)
ORGANISATIONS
- [DOCTRINE] R48 l36 — class_labels "To do", "Noticed", "Signal"; "No member-facing sentence this module answers calls a to-do an "obligation" or a signal a "condition"; "obligation" names only a public body's duty (DEC-107)."
- [DESIGN] R1 l23 — local-fact-due covers "office hours" (offices as profile facts).
- [GAP] no queue kind about a public body's obligation coming due, other than action-clock-overdue (group's own action deadlines) — obligations of bodies appear only through actions/action-clocks.
LAW
- [DESIGN] R12 l44 — litigation-hold OBLIGATION ("a reply the group marked as legal pressure: consider whether to place a litigation hold"; actions R52, DEC-61, K899 (7)) — legal-pressure response.
- none else (standards not in queue).
COURTS
- [DESIGN] R1 l23-24, R12 l44 — litigation-hold and litigation-hold-released (DEC-113) — legal pressure on the group, not a court case record.
- [DESIGN] R1 l23,25-26 — docket-core-due, edition-withdrawn, edition-contested, followed-case-entry, cited-docket-entry-refused, cited-docket-unreadable: the group's published-case docket (DEC-116), not court dockets.
ANALYSIS
- [DESIGN] R1 l24 — measure-decay, objective-gap, grade-improvable FINDING kinds; R6 l35 counts item_count, truncated, bounds.
- [DESIGN] R1 l27 — sweep-yield-anomaly ("filed far more or far fewer than its recent runs") — a simple statistical trend check on machinery.
QUESTIONS
- [DESIGN] R1 l24 — assistant-surfaced-focus FINDING kind; out-of-inquiry-lead; contradiction-lead.
- [DOCTRINE] R16 l52 — "A FINDING never reads as an obligation: its basis names its source and derivation (D-82)".
- [DOCTRINE] R34 l122 — "Options come from the producer and the catalogue, never from a surface".
DOCTRINE
- [DOCTRINE] R7 l39 — home set undetermined when out_of_view or depth_bound (depth 6).
- [DOCTRINE] R33 l121 no bundle the viewer may not see named or counted; R38 l126 "No place is named"; R30 muting personal vs disposing a record act.
- [RULING] K102, K607, K611, K1038 (DEC-107, DEC-110), K1099, K1406, DEC-113, DEC-116.

## control-plane.txt (179 lines, read 1-179)
(layer 11: "The instance's two doors: the Worker's HTTP entry and the record store's internal dispatch" l17; routes, stamps, envelope; decides "never what the answer is".)
TIME
- [DESIGN] R20 l58 — reviewcopy's in-band `date` is the copy's `last_change.at`.
- [DESIGN] Uses l129-130 — action-plans ops (checkpointrecord, scenarioset, optionstart...) and action-clocks ops reminderset, reminderanswer routed with author/viewer stamped (T18, K608, K617).
- [DESIGN] R46 l88 — purge refused while a litigation hold is in_place; "A removal ordered while a hold stands waits for the hold's release".
- none on business days/time zones (routing only).
ORGANISATIONS
- [DESIGN] Uses l131 — local-facts ops routed (offices/holiday facts). none else.
LAW
- none (routes `actions`/`filings`/`standards` maps generically; no law content).
COURTS
- [DESIGN] R46-R47 l88-90 — litigation hold blocks purge (C-69.5 PURGE_HOLD_IN_PLACE) — preservation duty under legal pressure (DEC-113).
- [DESIGN] R48 l91-93 — docket ops routed (group's published-case docket); docketpublic, docketfeed public.
ANALYSIS
- [DESIGN] R40 l102 — op=stats capacity stamp (store counts) — no analysis.
QUESTIONS
- [DESIGN] R17 l50 — an `ai` credential: "its principal as viewer, and `class:ai/<tokenId>` as author (REC-134)"; publishpreflight stamps aiCred (N407, K737).
- [DESIGN] R18 l54 — whoami answers confinedTo for ai credential.
- [DESIGN] R37 l85 — op=promote of an inquiry sets surfaced_by `human` for a session, `agent` for any other caller (D-78, N398) — labelling of machine-surfaced inquiries.
- [DESIGN] R41 l104 — untargeted op=affordances answer adds `fences` (skills machineFences) and `pack` (skills.renderPack(published)) — the AI's pack is rendered from the affordances (agent-worker R48); pack null + pack_absent if rendering throws.
- [DOCTRINE] R29 l143 — "No handler receives a caller-supplied value for any stamp".
DOCTRINE
- [DOCTRINE] R23 l70 — a store non-answer is STORE_DID_NOT_ANSWER, "never read as an absence, a refusal or a success" (System Design §2 "a silence is not an answer").
- [DOCTRINE] R33 l147 no place named; R51 l99 no outside loads from HTML pages (DEC-122 (3)).
- [RULING] K3, K23, K93, K617, K624, K1396, DEC-113, DEC-116, DEC-120/121/122, DEC-101.

## publication.txt (214 lines, read 1-214)
(layer 8; "Publication is the one irreversible act" l18. A "case" = "a production of one project over one or more findings (inquiries)" l23 — the group's own published case, not a court case.)
TIME
- [DESIGN] R17 l59 — attribution: "The level in force is the latest choice at or before the edition" — as-of reading at an edition; R39 l37 attributionInForce(caseId, edition, observation).
- [DESIGN] R5 l31 — revision flags written with "the owning project ... and the instant, never twice"; discharged when a newer edition is ratified; R6 ordered by instant.
- [DESIGN] R51 l93 — consent re-read at commit through sourcesLapsed(text, now) / sources.publishableAt({audience: "public", at: now}) — as-of-now check.
- [DESIGN] R53 l100 — ratified_at "stamped ... once and never re-stamped" when the edition first reads complete.
- [DESIGN] R57 l108 — holds bytes of each timestamp token the capture's provenance.json names (K1322, K1332).
- [DESIGN] R24 l150 — "a correction is a new edition, and an edition answers forever (DEC-19, DEC-12)" — editions as versions in time.
ORGANISATIONS
- [DESIGN] R40 l38 — `cases` (case_id, project_id): a case's owner is a project of the group; nothing about external bodies.
- [DOCTRINE] R52 l163 — "No published answer states a source detail except what sources.publishableAt answered at the commit."
- none on public bodies.
LAW
- [DESIGN] R37 l34 — publishedEditionsOf "is the read `conformance` R2 uses": conformance (layer 9, law/standards) rests on published case editions (findings), per-axis strength pair.
- [BUILT] Status l5 — "R36 and R37 struck as met at the Action layer's fold ... registerEvidenceBlock is filled by filings and publishedEditionsOf read by it".
COURTS
- [DESIGN] Terms l23 — "case", "edition", "case document" are the group's own publication objects; no court-case model here.
- [DESIGN] R59 l119 — accepted work of another group re-read at commit (DEC-96).
ANALYSIS
- [DOCTRINE] R26 l152 — "No answer, document or row this module serves composes a case-level strength: every pair is per member and per axis (DEC-44, DEC-21)."
- [DESIGN] R37 l34 — strength frozen pair "per axis, never composed".
- [DESIGN] R50 l88 — caseTensions: undisclosed contradictions on published members (DEC-84 item 13).
- [GAP] none: no chart/table/dataset publication construct in this module (case document carries findings, materials, attributions).
QUESTIONS
- [DOCTRINE] R28 l154 — "Undetermined is stated and never filled: a deliverer, an acknowledgement list a document is silent about (null, not []), a citation's version in a document older than /4."
- [DESIGN] R1 l27 — citations: "an older document states them undetermined, never today's edges".
- [DESIGN] R14 l53 — delivererOf answers founder/member/undetermined, "never inferred from the signer".
DOCTRINE
- [DOCTRINE] R24 one way; R25 public read discloses nothing unpublished; R29 working material answers outsider as nonexistent; R34 no place named.
- [GAP] R30 l156 — rendering verified by pixels_sha256 "(not yet met: D-246)".
- [RULING] K102, K171, K651, K1024, K1268, K1273, K1275, K1277, K1316, K1322, K1332, DEC-12, DEC-19, DEC-44, DEC-72, DEC-84, DEC-85, DEC-96, DEC-112, DEC-119.

## corpus-export.txt (68 lines, read 1-68)
(layer 8; "A group that cannot leave can be held." l10 — export of the working corpus, verified import.)
TIME
- [DESIGN] R1 l16-22 — export lists bundles' promotions "in write order", snapshots, history (created); export_log row with the instant.
- [DESIGN] R3 l39 — import "re-derives every bundle's history chain and base links".
ORGANISATIONS / LAW / COURTS / QUESTIONS — none in corpus-export.txt.
ANALYSIS
- [DESIGN] R1 l16-20 — export answers every bundle with files, register, "the counts": the only bulk export of the corpus (a whole-record dump, not a dataset/table export for analysis).
- [GAP] (implied) no export of a filtered dataset, a table or a spreadsheet; the export is the whole working corpus for exit/verification.
- [GAP] R3 l43 — verifyCorpusExport "writes nothing, never throws and has no op (K1058)"; l59 "Writing a verified corpus into a receiving store is not stated here." Status l4 "Not yet met: R3".
DOCTRINE
- [DOCTRINE] R3 l41 "trusts nothing the manifest asserts"; R5 no place named; R4 export_log exempt from purge.
- [DESIGN] Suggestions l58 — op=export only the root-of-trust credential (ROOT_OF_TRUST_REQUIRED); exportlog in-app administrators.

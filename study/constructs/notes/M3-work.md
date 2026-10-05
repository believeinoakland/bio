# WORKING EXTRACTS (per file, reorganised into M3.md at the end)

## inquiry-grammar.txt (83 lines, read 1-83 complete)
TIME
- [DESIGN] R3 l.24 — recheck_triggers required on every inquiry, every state; each trigger an object with text+description; optional `date` must be YYYY-MM-DD, else C-15.1 error — "each whose `date` is present and is not `YYYY-MM-DD` is one `C-15.1` error naming its index and the value"
- [DESIGN] R1 l.20 — concluded inquiry: falsifier stated or absence recorded with falsifier_override_by and _at (REC-117); R2 l.21 division block carries ISO `at`
- [DESIGN] l.4 — DATE_RE moved here from catalogue (date grammar is a regex shape, no calendar semantics)
ORGANISATIONS
- [DESIGN] R1 l.20 — `subject_entity`, when present, must be an entity id (ENTITY_ID_RE) — an inquiry may be about one entity
- [DESIGN] R2 l.21 — division `apportioned_by` a named member, never a machine
LAW: none in inquiry-grammar
COURTS: none in inquiry-grammar (R11 imported finding = another group's published case finding, not court)
ANALYSIS: none
QUESTIONS
- [DESIGN] R1 l.20 — `surfaced_by` is `agent` or `human`
- [DOCTRINE] R7 l.51 — rows MACHINE_CANNOT_DIVIDE (C-32.7), MACHINE_CANNOT_GROUND (C-32.8): a machine cannot divide an inquiry nor ground a leg
- [DOCTRINE] R5 l.30 — a lead id as leg target/content_id is error C-54.1 LEAD_NOT_EVIDENCE; "the one checker every leg grammar consults (this module's basis, `basis-versions`' version legs, the action basis)"
DOCTRINE
- [DOCTRINE] R10 l.69 — "No place is named in this module's behaviour or outward text."
- [DOCTRINE] R9 l.68 — pure, no clock, no network
- [DOCTRINE] R11 l.40 — imported finding leg carries no grade: "the edition's grades stand as published: DEC-96 item 1"
- [DOCTRINE] R1 l.20 — "a finding's bytes name no case (CASE-5b)"
- [GAP] l.5 — R11 not yet met (T28)

## inquiry.txt (192 lines, read 1-192 complete)
Ops named: basis, restson (in-process only, R16/Suggestions), earnedbasis, dispose, inquirydivide, inquiryground. Not yet met: R31 (MK-5); R4, R12 imported-ref wording T28; R53 T22.
TIME
- [DESIGN] l.19 Terms — a leg carries optional `date`, `author`; R4 l.25 "a `hunch` names its author and date (DEC-15)"
- [DESIGN] R8 l.29 — each ground declared with non-machine `asserted_by` and an ISO `at`; R28 l.76 unchanged groups keep stamp, others "stamped with this member and now; a caller's `asserted_by` or `at` is never read"
- [DESIGN] R19 l.50 — `stateHistory(id)` answers state transitions with who and when; R21 l.56 each disposition writes a state-history entry (timestamp, from, to, reason, author)
- [DESIGN] R21/R25/R41 l.56,71,62 — re-evaluation raised with cause and "the act's instant as `since`"; R41 stale re-read uses notice bound `ungraded_after`, cause `restaled`
- [DESIGN] R7 l.28 — `inherited` leg names an edition of a published case; grade no stronger than "that edition's frozen strength on its axis (C-21.2)" (versioned as-of of the group's own case)
- [DESIGN] R46 l.88-95 — contradiction vocabularies carry time: CONTRADICTION_COORDINATES `time_or_occasion`; PLURALITY_DIFFERENCES `time_or_occasion`; NORM_CANONS `later_over_earlier`; RESOLUTION_KINDS `superseded_version`
ORGANISATIONS
- [DESIGN] R11 l.34 — unknown `subject_entity` refused SUBJECT_REFUSED via `entities.has`; R43 l.65 `subjectEntityOf(id)`; R40 l.59 `inquiry_subject_entity` a stated read contract (one subject entity per inquiry)
- [DESIGN] R13 l.41 — earned connection grade = "the strongest A–C resolution of its captures to the subject, by `entities.strongestByCapture`; a D resolution earns nothing" — the link evidence→organisation is an entity-resolution grade, nothing about roles/relations
- [DESIGN] R6 l.27 — "a resolution needs a `subject_entity` and never sits on an inquiry leg"
- [DESIGN] R46 l.88 — contradiction coordinates `subject`, `observer_or_method`
- [DESIGN] R39 l.58 — projects inside the group: "One team's disposition never moves another team's stance" (group-internal organisation, not civic organisations)
LAW
- [DESIGN] R46 l.91 — `NORM_CANONS`: `higher_over_lower`, `later_over_earlier`, `specific_over_general`, `harmonization`, `unreconciled` — legal-hierarchy canons as a frozen vocabulary for a contradiction's resolution
- [DESIGN] R46 l.95 — GENUINE resolution kinds include `obligation_against_act`, `conflict_of_norms`; R47 l.108 "`conflict_of_norms` names a `canon` from `NORM_CANONS`" — the member names the canon; nothing models the norms, their rank or dates
- [DESIGN] R46 l.89 — PLURALITY_DIFFERENCES include `standard` (two projects' conclusions differ by the standard applied, DEC-84 item 3)
- [GAP] (inferred) inquiry legs target information/inquiry bundles only (R4 l.25); a law text enters an inquiry only as a captured document leg — no leg kind for a provision/standard
COURTS
- none in inquiry (R7 "published case" is the group's own published case edition, not a court case)
ANALYSIS
- none in inquiry (R16 limit/truncated are paging bounds)
QUESTIONS
- [DESIGN] Purpose l.15 — "An inquiry is the one recursive object of case-making: a question, which gathers evidence and other inquiries as the legs of its basis, and may reach a conclusion"; holds no version, no conclusion, no strength
- [DOCTRINE] R30 l.144 — "A machine credential authors no division, no grouping and no leg role; it may surface a question (`ai-runs`)."
- [DOCTRINE] R32 l.146 — "An ungraded leg is inert and always named; nothing here gives a leg a grade the record did not earn or a member did not author (DEC-18, DEC-24)."
- [DESIGN] R13-R15 l.41-44 — earned registry: what the record can earn for a leg; op=earnedbasis, ≤200 targets; legs not visible left out "and the answer says so"; capture pin `pinned`/`only_capture`/`undetermined` (REC-220)
- [DESIGN] R49 l.120 — migrated surfacing stated as "not recorded (migrated from the Drive era)"; ai-runs R27 answers surfacing otherwise
- [DESIGN] R53 l.79 — findings registered as `bias` work products of kind `finding` under a project lens; "A finding whose lens was not recorded is offered as undetermined, never filled in." (not yet met T22 at time of fold)
- [DESIGN] R47 l.100-111 — contradiction inquiry: concluding requires a resolution kind; sub-inquiries `explores` a coordinate, canon or hypothesis
DOCTRINE
- [DOCTRINE] R37 l.152 — "No place is named in this module's behaviour or outward text."
- [DOCTRINE] R33 l.147 — invisible answers exactly as absent
- [DOCTRINE] R35 l.149 — published case member cannot be divided/regrouped/set down; route is reopen (DEC-12, DEC-72)
- [DOCTRINE] Satisfies l.175 — "a HUNCH is temporary declared bias" (DEC-15, Declared Bias)
- [GAP] R31 l.145 — opinion case element as leg refused by name *(not yet met: MK-5)*

## citation.txt (65 lines, read 1-65 complete)
Ops: cite, sever, reinstate. Not yet met: "none known" (l.4).
TIME
- [DESIGN] R2 l.22 — a cited document leg/edge is pinned to `content.captureFor`'s capture (REC-219, REC-220): a citation is bound to one dated capture of a source (as-of of evidence)
- [DESIGN] R4 l.26 — sever/reinstate: status moves only; "the reason is appended to its note with the act and time (at most 480 characters, oldest dropped)"; R3 l.23 any write moves `last_updated`
ORGANISATIONS: none in citation
LAW: none in citation (R5 "retired" is the group's own bundle state)
COURTS: none in citation
ANALYSIS: none in citation
QUESTIONS
- [DESIGN] Purpose l.12 — citing is the member's act "this is why I think that": on a case a `cites` edge, on a question a basis leg. NB: this is the member citing evidence into a case/inquiry, not the assistant's answer citing its sources
- [DESIGN] R2 l.22 — on an inquiry, connection grade filled from `inquiry.earned` (A–C, axis connection, source resolution) when earned, else none; R3 l.23 answer reports `gradesFilled`, `gradesUndetermined`, per leg `why`
- [DESIGN] R5 l.30 — `retiredNotCitable` "the one predicate for 'may this be cited now'", asked also by "`run-productions`' suggestion check" (AI suggestions of citations obey it)
DOCTRINE
- [DOCTRINE] R8 l.48 — "No leg is given a grade the record did not earn, and no role is assumed... a role is the member's, never a default (Invariant 7)"
- [DOCTRINE] R10 l.50 — no place named; R9 invisible = absent; R6 citation lives only in the citing document's bytes (D-21)
- [DOCTRINE] Satisfies l.55 — State Rules §5.1 "sever with reason; a human confirms or severs"

## strength.txt (127 lines, read 1-127 complete)
Ops: strength (in-process), inquirystrength, versionstrength, partitionindependence, strengthbar, strengthbarof. Status l.4-5 lists not-yet-met at fold: R26-R27 (N60,K86), R5 and R15 (K102), R29-R30 (T22), R15 reason (T22), R5 hunch count/R15 note (T22), R31-R34 (T28). (verify in repo)
TIME
- [DESIGN] R8 l.32 — version strength measures "the version named, or else the project's CURRENT"; R7 C-30.4 NO_SUCH_VERSION "saying when a project's pointer outlived its reading" (as-of a basis version)
- [DESIGN] R33 l.59 — "An acceptance withdrawn since the leg was written changes nothing here. Nothing regrades (DEC-96 item 1)" (frozen edition grades, as-of)
- [DESIGN] R31 l.51 — `GRADING_METHOD_VERSION` changes whenever the arithmetic changes; old versions re-render byte for byte (method versions over time)
- [DESIGN] R15 l.72 — bar default recorded "with its author, time and reason"
ORGANISATIONS
- [DESIGN] R12 l.38 — independence of grounds = shared origins: "the same document, the same capture, or the same captured address, from `provenance`" — independence is by provenance, not by issuing body (two documents from the same department/official count as independent)
- [DESIGN] R11 l.37 — partition independence refused `TWO_SUBJECTS` (C-71.8)
- [DESIGN] R15 l.72 — group bar set only by an active administrator; "the group is the one named or the producing group, else undetermined"
- [DESIGN] R30 l.48 — corroboration requires another member author and no shared origin
LAW
- none in strength (the "bar" R14 is an evidentiary standard a project declares, DEC-17/DEC-72, not a legal standard)
COURTS
- none in strength
ANALYSIS
- [DESIGN] Purpose l.14 — "Strength is what a claim is worth, derived and never stated: a pair of independent measurements... never composed into one value (DEC-44)"
- [DESIGN] R4 l.24 — derived arithmetic: ground = weakest (AND), grounds compose by strongest (OR), axis = weaker of necessary part and OR part (DEC-32); "The member that sets the grade is named"
- [DESIGN] R2 l.22 — recursion through inquiry legs to depth bound 6; past it `undetermined` with why
- [DESIGN] R8/R20 l.32,99 — what-if state sets: "A what-if is exploration, never a record value, and says so in the answer (§6 rule 6, DEC-40)"
- [DESIGN] R31-R32, R35 l.51-53 — reproducibility: `gradingMethodText` "complete enough to recompute a grade by hand"; `recomputePair` "answers the pair... from the facts a case file states"; Publication §5C "each grade recomputes the same by the stated method version"
- [DESIGN] R10 l.34 — answer with a single composed figure (`strength`, `grade`, `score`, `overall`...) refused C-30.7 VERSION_STRENGTH_COMPOSED
- [GAP] (inferred) strength grades evidence chains; nothing here grades a derived number or calculation (no axis for an analytic derivation)
QUESTIONS
- [DESIGN] R26-R27 l.41-42 — `candidatePair`/`candidateIndependence` "for `run-productions`' suggestion check": AI-suggested legs are graded the same way before being offered
- [DOCTRINE] R5 l.25 — hunch legs inert in every pair; every answer states how many hunch legs it left out (DEC-104; H10)
- [DESIGN] R6 l.28 — out-of-view members withheld whole; `out_of_view: true`
- [DESIGN] R28 l.105 — member-facing sentences avoid analyst vocabulary (AND/OR, partition, conjunct...) (D-269, DEC-32 clause 1)
- [DESIGN] R15 l.73 — honest note: "Civicsmith has no guidance yet on what particular audiences expect. Readers see the bar you set in these words." (DEC-105)
- [DESIGN] R3 l.23 — `unrated` vs `undetermined` states; "an empty basis is `unrated` and says it rests on nothing"
DOCTRINE
- [DOCTRINE] R18 l.97 — "Strength is never stated by a member and never a single value" (DEC-21, DEC-44)
- [DOCTRINE] R19 l.98 — no leg counted above what record earns; "no rendering is given Grade A on the capture axis"
- [DOCTRINE] R21 l.100 — bar "a declaration beside the strength reached, never a gate on the pair" (DEC-17)
- [DOCTRINE] R15 l.72 — MACHINE_CANNOT_DECLARE (C-32.9): a machine never sets the bar
- [DOCTRINE] R29/R30/R34 — anonymous testimony/off-the-record capture counts only beside independent corroboration; never names an author (DEC-102, DEC-119)
- [DOCTRINE] R25 l.104 — no place named

## basis-versions.txt (118 lines, read 1-118 complete)
Ops: basisversions, versionaccept, versionreject, versionconsider, versionrevert, versioncurrent, versionhide, narrow, narrowcandidates, conclude, withdrawconclusion. Not yet met at fold: R41 (N300), R3 imported-leg (T28). op=suggest placed with ai-runs (l.7).
TIME
- [DESIGN] R17-R18,R32 l.46-48,93 — a project's conclusion record is append-only, each `concluded` row "dated, authored"; latest row is the stance (DEC-19); R20 withdraw "appends a `withdrawn` row... never edits an earlier row" — a chronology of stances
- [DESIGN] R29 l.90 — "A version is frozen once written: nothing rewrites its composition; editing makes a new version derived from it"; R5 l.24 the capture pin frozen with the version (D-595)
- [DESIGN] R1 l.20 — once moved, `state_by` named member and `state_at` ISO instant (C-25.19); R28 l.60 appendVersion version fields include `level`, `observed_at`, grounds `at`
- [DESIGN] R23 l.52 — no-project conclusion's claim `adopted` only when the named version still states it, "else `undetermined` with why; a conclusion written before versions reads `undetermined` and is never back-filled"
ORGANISATIONS
- [DESIGN] R25 l.56 — narrow candidates include "the places the record's reading found a reference (whether it names the subject)" (uses entities `resolutions` read contract, l.85)
- [DESIGN] R31 l.92 — "One team's act never moves another's stance" (group-internal projects)
LAW: none in basis-versions
COURTS: none in basis-versions
ANALYSIS: none in basis-versions (bounds only: 200/1,000 versions, 500 legs, R9)
QUESTIONS
- [DOCTRINE] R30 l.91 — "A machine credential holds no act that moves, hides or makes current a version, concludes or narrows; it may only append a `suggested` version through `ai-runs` (§4)."
- [DESIGN] R16 l.45 — `MACHINE_CANNOT_CONCLUDE` (C-32.2) for conclude and withdraw; R17 `CONCLUSION_IS_THE_CLAIM` (C-33.35): with a project, the conclusion adopts a version's claim, no free text
- [DESIGN] R18 l.47 — conclusion row carries "the commentary marked not evidence"
- [DESIGN] R25 l.56 — narrowCandidates: each "labelled machine work and a proposal"; sources: reading references, passages an extract run proposed (registered by ai-runs/run-productions), rows a machine marked citable; "with none, the absence by level (never read, or read and nothing inside)"
- [DESIGN] R27 l.58 — narrow makes a new `suggested` version; the narrowed leg "carries no grade (the old grade is reported as not carried)"; answer says whether the part was a machine proposal
- [DESIGN] R28 l.60 — `appendVersion` "For `ai-runs`' `op=suggest`": appends one `suggested` version; "a caller's `state` or `hidden` is never read"; substance-difference check is ai-runs' C-27.10
- [DESIGN] R40 l.68 — `onCandidates`: run-productions registers its `proposed_readings` reader
- [DESIGN] R22 l.51 — a conclusion row naming an unknown act reads `undetermined`, never skipped
DOCTRINE
- [DOCTRINE] R36 l.97 — no place named; R33 invisible = absent; R29 frozen versions
- [DOCTRINE] Satisfies l.105 — Interaction Constructs: "a proposal is adopted, deferred or dismissed with a reason"

## run-rules.txt (64 lines, read 1-64 complete)
No ops (pure). R13-R15 met (RUN-RULES #5, T24) l.5.
TIME
- [DESIGN] R4 l.21 — run ending: offered bound, else first exhausted bound, "else `lease` when expired; else `completed`" (a run has a lease in time)
ORGANISATIONS
- [DESIGN] R6 l.23 — `projectGate`: inquiry context passes unapplied; project context passes only when actor joined one of its projects (C-22.8) (group-internal projects; DEC-63)
LAW: none in run-rules
COURTS: none in run-rules
ANALYSIS: none in run-rules
QUESTIONS
- [DESIGN] Purpose l.13 — "The AI run's rules without a store: the bounds, endings and statuses a run can have, the checks a bound, a consumption, a principal, a context and a skill version must pass... the one deployment order of the run's modes"
- [DESIGN] R9 l.28 — `DEPLOYMENT_SEQUENCE` order `["check","investigate","extract"]`, `first_deployed_mode` = first, `enforced_by` C-109.1; R14 l.30 order becomes `["check","investigate","extract","plan"]`; "`plan` is deployed as soon as `agent-worker` runs model turns (its R40 and R48 met)... Until then an open in mode `plan` is refused by `ai-runs` R40 (C-109.1)"; Tests l.60 "`plan` last in the order and not deployed today (control: `check` still deployed)"
- [DESIGN] R3/R13 l.20,29 — bounds counted by the plane: `lease`, `mints`, `surfaces`, `proposals` (a caller may not send figures for them); `proposals` = number a planning run may make; "no figure of five or any other caps it here"
- [DESIGN] R5 l.22 — `runPrincipalGate`: caller must equal the run's principal (C-22.12) (Assistant and AI Roles §3 rules 1-5)
- [DESIGN] R8 l.25 — skill version `<pack>@<edition>`; any well-formed version accepted, current pack or not
- [DESIGN] R10 l.33 — resumable run `state` at most 262,144 bytes (C-22.18)
- [DESIGN] Satisfies l.50-51 — INVESTIGATIVE-SESSION §11 (the run is an object), §14b items 4,6,7 ("every 'may not' a refusal, bounded, partial results"); Assistant and AI Roles §7.3 (the `mints` bound)
DOCTRINE
- [DOCTRINE] R12 l.45 — no place named

## ai-runs.txt (140 lines, read 1-140 complete)
Ops: airunspawn, airunopen, airuntick, airunclose, airun, airunlog, airuns (l.4). Not yet met at fold: R46, R47 (K660) (l.6-7). R17, R30, R36, R37, R40 met (AI-RUNS #4, T11).
TIME
- [DESIGN] Terms l.19 — run carries `created`, `updated`, `expires`; "The **lease** is 3,600,000 ms, extended by every tick"; bounds include `wallclock`, `runtime`, `lease`
- [DESIGN] R15-R16 l.51-54 — reap lapsed leases and wake runs whose capture requests completed, for `scheduler` (≤25 runs per tick)
- [DESIGN] R30 l.83 — run's `created` "ISO-8601 UTC to the second" offered as `waitingSince` to the scheduler's rank
- [DESIGN] R10/R20 l.34,61 — the lens in force recorded at open with "instant"; read compares lens `at_open` vs `now`, `moved` (as-of the run's conditions)
- [DOCTRINE] R32 l.110 — "A run's conditions are recorded at the open and never derived later; the handed manifest is stored verbatim."
ORGANISATIONS
- [DESIGN] R10 l.34 — `projectGate` answer counts the context's projects the viewer sees (group-internal)
- [DESIGN] Terms l.19 — principals: `principal_plane` "`member:<id>/<tokenId>` for a member's credential or `class:<cls>` for a deploy token; `principal_claude` is the Claude-account level that pays"
LAW: none in ai-runs
COURTS: none in ai-runs
ANALYSIS: none in ai-runs
QUESTIONS
- [DESIGN] Purpose l.15 — "The AI run: a durable, bounded, attributed object a member opens over a question or a project, under which the assistant finds, pursues, extracts and checks... nothing here accepts, attests, concludes or captures."
- [DESIGN] R40 l.35 — "`open` refuses a `mode` that is not a deployed member of the one deployment order (today only `check`)" — INVESTIGATIVE-SESSION §14b.4
- [DESIGN] R46 l.36 — mode `plan`: needs a plan id, a project context, a member behind the caller; "nothing schedules, wakes or starts a new one by itself"; declares `fetches` 0 and `subsessions` 0 (no search) (BIO_Action §4 rule 1; K660)
- [DESIGN] R47 l.37 — `registerOpenCheck` per mode; `action-plans` R30 fills it for `plan`; none → `AI_RUN_MODE_UNCHECKED` (fail closed)
- [DESIGN] Terms l.19 — bounds: `fetches`, `subsessions`, `wallclock`, `runtime`, `mints`, `surfaces`, `proposals`, `lease`; endings `completed`, `cancelled`, `mode-not-deployed`
- [DESIGN] R12 l.41 — each tick appends log entries through observation-log as `authority_kind: run`, `actor_class: machine`, actor the run's Claude principal; exhausted bound ends run (`runtime-ceiling-reached`)
- [DESIGN] R14 l.48 — the one exit rolls up search state: "`PRESENT` over `partial` over `LOOKED_INDETERMINATE` over `LOOKED_ABSENT` over `NEVER_LOOKED`, a bound-stopped `LOOKED_ABSENT` or `NEVER_LOOKED` read as `LOOKED_INDETERMINATE`" (absence stated by level; a stopped search never claims absence)
- [DESIGN] R18 l.57 — a woken run is dispatched to `agent-worker` only when `principal_plane` is the instance's organisation `ai` credential, on record and unrevoked; else withheld and named (`MEMBER_PRINCIPAL_RUN`, ...); dispatch waits at most 30 s; "The credential's value never enters the record."
- [DESIGN] R19 l.60 — read answers `state` "the run's resumable scratch... never a transcript, DEC-61"; `budget`, `condition`, `bias`, `standard`
- [DESIGN] R21 l.62 — the bar recorded on the run: `recorded`, `none-recorded`, ... "never filled in"
- [DESIGN] R23 l.68 — spawnPayload: "The `search` half carries the run's context, mode, skill, bar and budget and no lens field at all; the `compose` half adds R20"
- [DOCTRINE] R34 l.112 — "The search half of a run never receives the lens (R23); bias shapes weighing, never searching."
- [DESIGN] R25-R27 l.74-76 — the assistant may surface (create) a question only under a running run whose principal is the caller and within its `surfaces` bound (C-66.1-.4); a surfacing row records run, principal, instant; `surfacedIn` answers "not recorded" when none
- [DESIGN] R28-R29 l.79-80 — `runFor`, `boundOf`, `consumeBound` for run-productions, capture-requests, contradiction
- [DESIGN] R30 l.83 — each run registered with `bias` as a work product; unrecorded conditions offered as undetermined
- [DESIGN] Satisfies l.122 — Assistant and AI Roles §2 (the four roles), §3 rules 1-5, 8, 10, §6 (credential cascade), §7.3 (`mints` bound)
DOCTRINE
- [DOCTRINE] R31 l.109 — "no run is over while its log is silent; the log is append-only"
- [DOCTRINE] R33 l.111 — "a run's work is never re-attributed to another principal (R18)"
- [DOCTRINE] R39 l.117 — no place named

## run-productions.txt (85 lines, read 1-85 complete)
Ops: suggest, extractpropose, extractproposals. Not yet met at fold: R9 (D-595), R13 (DEC-49), R14 (K31) (l.4).
TIME
- [DESIGN] R9 l.30 — "Each suggested leg names the capture the run read (`extent_capture`), so a suggestion says which version of a document it rests on." (D-595; not yet met at fold)
- [DESIGN] R1/R6 l.20,27 — a suggestion may carry `observed_at` and `level` (a `level-empty` suggestion states its level and observation address)
- [DESIGN] R2 l.22 — a repeated refused submission answers stored refusal with `first_refused_at`; judged afresh once the document moves
ORGANISATIONS: none in run-productions
LAW: none in run-productions
COURTS: none in run-productions
ANALYSIS
- [DESIGN] R12 l.35 — minted-to-cited ratio over machine-minted content rows of at most 64 documents (a quality measure of EXTRACT proposals, not member analysis)
- [DESIGN] R5 l.26 — answer fields labelled by source: `record`, `derived` (strength pair and independence trace "computed over this submission and not stored"), `call`
QUESTIONS
- [DESIGN] Purpose l.13 — "The investigative session's one write is a suggestion: a version of a question's basis in state `suggested`, carrying its run, checked plane-side before it is written and never accepted, hidden, rejected or made current here"; EXTRACT production = proposed reading "labelled machine work... never counted as extraction coverage (Assistant and AI Roles §7.3)"
- [DESIGN] R6 l.27 — `SUGGEST_KINDS`: `basis-version`, `sharpen-question`, `new-inquiry`, `level-empty`, `new-edition`; `SUGGEST_LEVELS`: `meaning`, `content`, `documents`, `internet` (the four search levels)
- [DESIGN] R1 l.20 — suggestion only within run context (C-27.19); ≤120 legs; level-empty must state its level
- [DESIGN] R3 l.23-24 — plane-side verdicts: SUGGEST_UNWRITABLE_STATE (fields only a member's act writes; machine grounds only if exactly one part, DEC-65), SUGGEST_BOILERPLATE, SUGGEST_LEG_UNREACHABLE, SUGGEST_PAIR_DOES_NOT_COMPUTE, SUGGEST_COMPARISON_INCOMPLETE ("undetermined, never independent or different"), SUGGEST_BRANCHES_NOT_INDEPENDENT, SUGGEST_NOT_DIFFERENT, SUGGEST_UNWRITABLE_DOCUMENT
- [DESIGN] R4 l.25 — success writes one `suggested` version via appendVersion; "every leg is a `document` leg; a machine author's grounds are asserted by no one (`SUFFICIENCY_UNCLAIMED`)... Nothing is accepted, hidden, rejected or made current; nothing is captured or requested; no notification is sent."
- [DESIGN] R10-R11 l.33-34 — extractPropose only in mode `extract`, within `mints` bound; batch refused whole if it would exceed; `earned` B or C "computed from what the reference names, never offered"; mint refusals recorded never dropped; answer says "these are proposals, not extraction coverage"
- [DESIGN] Suggestions l.78 — "while `extract` is not deployed no run passes R10's `NOT_AN_EXTRACT_RUN`"
DOCTRINE
- [DOCTRINE] R15 l.60 — "Every production names a running run whose principal is the caller... never attributed to anyone but the stamped caller or proposer."
- [DOCTRINE] Satisfies l.71 — DEC-24 rule 3: "an earned grade is never offered"; DEC-62, DEC-65
- [DOCTRINE] R19 l.64 — no place named

## skills.txt (105 lines, read 1-105 complete)
No ops. Code: bio-plane/src/skillpack.mjs, skilldoctrine.mjs. Status l.3: "Nothing in production renders the pack (`agent-worker` R48, K102)." Not yet met at fold: R10 (SK-5), R28 (K608), R29 (K660), R30 (K921), R31 (T22), R32 + R5/R9/R10 rename (T31).
TIME
- [DESIGN] R31 l.79 — `edition_statement` layer: the run drafts "a detailed, high-level description of what changed and, as far as the system can determine it, why" (Publication §5A) — change over editions
- none on deadlines/calendars in the pack
ORGANISATIONS
- [DOCTRINE] R28 l.73 — action_planning clause from BIO_Action §4 "rule 6 (addressees are roles, not people)"
LAW
- [DESIGN] R28 l.73-74 — action_planning layer: the run may propose `standardpropose` (standards R9), `comparisonpropose` (conformance R12), `theorypropose` (filings R14); member-only `standardadopt`, `determine`; clause "rule 9 (the doctrine's limits: lobbying only to enforce or restore an existing requirement)"; "rule 13 (the venue sets the standard of evidence)"
- [DOCTRINE] R30 l.77 — filing_drafting: "rule 11 (jurisdiction lives in data; a missing fact reads undetermined)"
COURTS
- [DESIGN] R30 l.77 — filing_drafting layer: the run proposes a filing template's wording (`templatepropose`) or critiques one; member-only `templatedraft`, `templaterevise`, `templatesubmit`, `templatereview`, `templateapprove`; "rule 7 (nothing leaves by a system path; a counsel packet is never fileable as it stands)"; rule 13 venue sets the standard of evidence
ANALYSIS
- [DOCTRINE] R17 l.50 — PROHIBITIONS include "no single confidence score; no connection-density ranking"; R28 rule 3 "(no significance, no score)"; rule 8 "(no catalogue, no budgets)"
QUESTIONS
- [DESIGN] Purpose l.13 — the skill = "The instructions an AI run works under: the doctrine pack"; resident layer (objective, machine/member boundary, four-level rule, absence vocabulary) + progressively disclosed layers; "It holds no gate: every fence it names is code elsewhere, and a model that ignored every word of it would get past nothing (§14b.4)"
- [DESIGN] R2 l.21 — resident: `objective`, `boundary`, `four_level` (levels OBSERVATION_LEVELS; answer shape `["level","state","searched","not_searched"]`), `absence` (OBSERVATION_STATES), `disclosable`
- [DESIGN] R5 l.24 — disclosed layers: `composition`, `description`, `search`, `absence`, `prohibitions`, `deployment_sequence`, `judgement_boundary`, `vocabularies`, `acts`, `bounds`, `refusals`, `contradiction`, `action_planning`, `filing_drafting`, `edition_statement`, `wizard_authoring`, `wizard_scripts`
- [DESIGN] R6/R11 l.25,38 — pack id `investigative-session`, version `investigative-session@<edition>+<16-hex digest>`; any changed word changes the digest; "nothing gates on it"
- [DESIGN] R14-R15 l.47-48 — DEFERRED_ROWS / JUDGED_ROWS from INVESTIGATIVE-SESSION §14b.4; "The skill's authority is exactly `JUDGED_ROWS`"; each clause has `enforced_by` C-numbers or `unenforced_because`
- [DESIGN] R16 l.49 — `controlFlowAuthority(text)`: no clause may carry a pass budget, stopping rule, termination decision, self-assessed recall, loop instruction
- [DESIGN] R17 l.50 — five PROHIBITIONS: "no generated justification; no single confidence score; no connection-density ranking; machine-proposed connections never presented as connections; nothing is boilerplate"; PERMITTED_AUTO_COMPOSITION (assembling a member's own prior words, stopping at the first new word)
- [DESIGN] R18 l.51 — deployment_sequence re-exported: `verification_recorded` null until a verified live run is recorded
- [DESIGN] R19 l.52 — absenceByLevel: meaning "nothing derived"; content "nothing extracted"; document "no document"; internet "nobody looked"; split into `licenses_a_conclusion` / `licenses_nothing`
- [DESIGN] R27 l.72 — `contradiction` layer imports `contradiction`'s RECOMMEND_PROMPT; while its SHA is null renders as stated absence "never, in this edition"
- [DESIGN] R28 l.73 — action_planning clauses: rule 1 "(humans decide; the machine proposes and drafts, labelled, and never takes an act)", rule 2 "(the gate is at the outward act)", rule 10; R29 adds rule 12 (every plan checked for a branch answering a hostile response); absent when no `optionpropose`
- [DESIGN] R31 l.79 — edition_statement: "The signed statement is the group's, adopted by a member, and the record keeps that it began as a machine draft."
- [DESIGN] R32 l.81 — wizard_authoring: "Checks refuse a script naming screens or acts that do not exist, lacking a step's "why", or telling a member what to conclude."; whether words tell a member what to conclude "is judged by this critique and by the approving member, not by code (K1364 B3)"
- [DESIGN] R9 l.34 — wizard_scripts absent until published: `load_when` "never, in this edition"
DOCTRINE
- [DOCTRINE] R24 l.69 — "It holds no gate"; R26 l.71 "No place is named in its behaviour or rendered text."
- [DOCTRINE] R21 l.66 — every authored sentence found verbatim in canon; the four-level rule quoted from Content Framework Part II §14.3
- [DOCTRINE] Satisfies l.90 — ASSISTANT-PILOT §1 "the refusal surfaced verbatim, never paraphrased"
- [GAP] Satisfies l.91 — Assistant and AI Roles "§7.3 point 7 and §8 (the extract mode not deployed)"

## agent-worker.txt (124 lines, read 1-124 complete)
Endpoints: POST /run, GET /version. Not yet met at fold (l.3-4): R40, R41 "(model turns and sub-sessions do not run; D-218, D-611)", R47 (unmeasured), R48 (K102), R50-R53 (K660).
TIME
- [DESIGN] R20 l.44 — every report state but NEVER_LOOKED needs `observed_at`; R22 level-empty candidates carry `observed_at`
- [DESIGN] R51 l.56 — plan-mode `read` reads, for each subject, "the profile's `deadlines`, venues and `legal_organisations` (`jurisdictions.combine`)" via ops; "A refused or silent read is carried as UNDETERMINED in the proposal's `why`, never as absence"
- [DESIGN] R15 l.37 — `wallclock` bound stops a run
ORGANISATIONS
- [DESIGN] R51 l.56 — plan mode reads jurisdiction profile `legal_organisations`; "It reads no other project's plans, no person's attributes, no transcript and nothing on the web."
- [DESIGN] R32 l.72 — payer cascade `member`, `project`, `instance` (Claude accounts)
LAW
- [DESIGN] R51 l.56 — plan mode reads "its inquiry's published findings, its determination and standards (`conformance.determinationRead`, `standards.standardRead`), its consequences, `filings.availableActions`" — a layer-6 worker reading layer-9 law/conformance data over the wire
COURTS
- [DESIGN] R51 l.56 — plan mode reads venues and `filings.availableActions` from the profile/filings
ANALYSIS
- [DESIGN] R52 l.57 — plan candidates ordered by "the assistant's order of strength... carried only by the list's order: no candidate carries a score, rank figure or strength"
QUESTIONS
- [DESIGN] Purpose l.12 — "The fleet member that performs an AI run for the plane... walks a deterministic control-flow table... the model decides what to search for and what reports mean, inside a step, and never when the loop stops. It writes nothing itself... every write is a suggestion, a log entry, a capture request or the run's close... It never attests, concludes, accepts or publishes."
- [GAP] Status l.3 — R40, R41 not met: "model turns and sub-sessions do not run; D-218, D-611"; R48 not met (pack not read)
- [DESIGN] R14 l.36 — "`check` is deployed; `investigate` and `extract` are not." gate-mode first, closes `mode-not-deployed`
- [DESIGN] R13 l.35 — CONTROL_FLOW rows `gate-mode`, `resume`, `plan`, `fanout`, `collect`, `compose`, `dedup`, `submit`, `adjust`, `next-pass`, `close`
- [DESIGN] R15 l.37 — stops on `fetches`, `subsessions`, `wallclock`; pass limit `max_passes` else 3 (Suggestions l.116: the plane publishes no `max_passes`, so always 3)
- [DESIGN] R16 l.38 — judgements supplied per judged row (`plan`, `collect`, `compose`, `dedup`, `adjust`); judgement naming control fields → `JUDGEMENT_OVERREACH`; only `targets`, `reports`, `candidates`, `queue`, `adjusted`, `submission`, `level`, `observed`, `governed`, `condition` applied
- [DESIGN] R17 l.41 — fanout one sub-session per level `meaning`, `content`, `document`, `internet`; payload carrying `bias` refused SPAWN_PAYLOAD_CARRIES_LENS; scope `["meaningrows"]`; spends 4 subsessions
- [DESIGN] R18 l.42 — internet level: `op=capturerequest` per target; "This member never fetches."
- [DESIGN] R19-R20 l.43-44 — reports contract: keys `level, state, observed_at, summary, citations, governed, condition`; PRESENT/partial need a citation (≤20 `{address}`); summary ≤500; refused reports "never becomes an absence"
- [DESIGN] R21 l.45 — holdings counted by record's `address_norm`, a refused read leaves the citation UNDETERMINED
- [DESIGN] R22 l.46 — compose: meaning layer "NOT READ when refused and UNDETERMINED when no rows list came back, never zero"; one `level-empty` candidate per LOOKED_ABSENT level
- [DESIGN] R26 l.50 — "A step judged `PRESENT` is logged `LOOKED_INDETERMINATE` with the stated reason and counted in `present_unbacked`"; no entry carries NEVER_LOOKED
- [DESIGN] R7 l.25 — segment bound `MAX_TURNS_PER_SEGMENT` else 120; R27 `max_steps` ≤400
- [DESIGN] R50-R53 l.55-59 — mode `plan`: PLAN_FLOW one pass; no fanout/fetch/suggest; writes only `optionpropose`; deployed "as soon as this member runs model turns (R40 and R48 met)"
- [DESIGN] R37 l.92 — PLANE_OPS exactly `whoami`, `airun`, `airunlog`, `airunspawn`, `meaningrows`, `basisversions`, `search`, `versionchain`, `affordances`, `airuntick`, `suggest`, `capturerequest`, `airunclose`; "none of them returns document bytes"
- [DESIGN] R48 l.103 — model instructed by the pack read from `op=affordances`; refuses segment whose recorded skill version differs; "Until turns run it changes nothing."
- [DESIGN] R29 l.63 — `claude_account` `{available:false, reason:"NO_ACCOUNT_MATERIAL_SUPPLIED"}` when none supplied
DOCTRINE
- [DOCTRINE] R39 l.94 — "No model judgement sets the mode, the step, the pass count or limit, the budget, a bound, the run, the namespace or the target"
- [DOCTRINE] R36 l.91 — holds no credential; tokens never stored, logged or echoed
- [DOCTRINE] R43 l.98 — refusal never reworded
- [DOCTRINE] R46 l.101 — "No place is named in its behaviour or outward text"
- [DOCTRINE] R42 l.97 — "Enabling a mode is an edit to `MODES` under review, never a request parameter."

## capture-requests.txt (126 lines, read 1-126 complete)
Ops: capturerequest, capturerequestdrain, capturerequests, capturerequestretry (R42), (capturerequestdraining to retire). Not yet met at fold (l.4-5): R6, R7, R21, R16 (K58), R18 (D-582), R19 (D-584), R20, R27 (D-581), R29 (D-583), R37, R38 (K102), R39-R42 (K103), R45 (T23).
TIME
- [DESIGN] R6 l.25 — a request expires 24 h after its instant: "`expires` is that instant + 24 h, so each request's expiry follows its own `at`"; R20 expired rows released UNDETERMINED, never fetched
- [DESIGN] R12/R37 l.35,54 — drain ≤10 rows per tick, oldest first or scheduler rank by `waitingSince: requested_at`; cadence 60,000 ms default (`CAPTURE_REQUEST_TICK_MS`)
- [DESIGN] R39 l.50 — "One fetch per version of an address (K103 (1))": conditional fetch with validators; unchanged content files no new capture
- [DESIGN] R29 l.65 — "A run's wait is bounded by its requests' own expiry"
ORGANISATIONS
- [DESIGN] R41 l.70 — credentials scoped to member, project or group (group-internal)
- [DESIGN] Suggestions l.121 — "A private individual's site is a judgement for the skill's doctrine, not a drain check (K102)"
LAW
- none in capture-requests (DEC-47 conduct is a product rule on fetching, not law modelling; R14 l.38 "No rule reads `robots.txt`, and a document under a `Disallow` path is captured (BOB-3)")
COURTS: none in capture-requests
ANALYSIS: none in capture-requests
QUESTIONS
- [DOCTRINE] Purpose l.13 — "The AI does not capture: it requests, and the daemon captures with provenance preserved (INVESTIGATIVE-SESSION §4)."
- [DESIGN] R10 l.31 — attribution statement: "the daemon captured this, at the investigative session's request (run <run>), under <plane>, paid by <claude>"
- [DESIGN] R13 l.36 — every refusal/hold appended to the observation log `LOOKED_INDETERMINATE`; R15 a capture appended `PRESENT`
- [DESIGN] R11 l.34 — drain "Inert unless the instance's unattended capture is configured"
- [DESIGN] R38 l.47 — a requested capture "promoted at `collected`, never higher", with the inquiry as matched scope (DEC-47)
- [DESIGN] R45 l.48 — a run's request may name a ratified link-sweep; scope check registered by link-sweep (Intake Doctrine §4 "relevant nearby")
- [DESIGN] R30 l.74 — "No op admits the `ai` class by name."
DOCTRINE
- [DOCTRINE] R31 l.95 — "The AI does not capture: the door writes a row and fetches nothing (R9); the drain is the only path from a row to a fetch"
- [DOCTRINE] R33 l.97 — attribution names both principals "and never a token value or a person on the act (DEC-27(b), DEC-55.4)"
- [DOCTRINE] R36 l.100 — "No place is named in this module's behaviour or text."

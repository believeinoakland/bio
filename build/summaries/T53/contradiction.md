# Task summary · T53 · contradiction

This summary stands for the contradiction job's reading set (SESSIONS §6.3): `build/requirements/contradiction.md` (both parts); the Purpose of `retrieval`, `record-grammar`, `civil-time`, `connection-grammar`, `record-core`, `membership`, `promotion`, `extraction`, `content`, `entities`, `events`, `money`, `inquiry`, `basis-versions`, `member-roster`, `setup-words`, `test-support` (each `build/requirements/<name>.md`) with the named service blocks (record-core `declarePurge` and `transact`; membership `notAParticipant` and `noSuchProject`; content `contentRow`; entities `reportResolutionDefect`; events `neighbours`; basis-versions `projectsDrawingOn`); `build/plan/current.md`'s `**contradiction**` block (Layer 6); `build/plan/T53-R1/contradiction.md`. No `build/plan/trims/contradiction.*.md` exists. The sources stay binding; read any cited section in full when the work touches it. The task's one entry is English in tests, so requirements that carry member-facing words (R11, R12, R16, R20 and its table, R37, R50) keep them; the rest are compressed to their binding content. Lines marked "(verbatim)" keep every word of the source.

## contradiction (own requirements)

Status: in force (K102); N345 folded (K455, K456, K459). Last changed T41 (T41-20: R50, R55 amended, a non-hidden party named; D64). Not yet met: the K5 arms of five requirements (no measured recommender run, K488) and two marked N345 (R34, R41). Size (P6): about 975 lines.

Purpose: IDENTIFY: the plane pairs assertions worth comparing, deterministically, for a viewer, saying at which level a key found nothing; a run's judgement over a pair enters only as a labelled, append-only proposal; it never judges, grades, edits or closes a side. PRESENT and RESOLVE: a candidate is shown to a member who may see both sides, at its label's and key's weight; a member's attributed act says what the conflict turned out to be, inline or by a contradiction inquiry whose conclusion records its kind; the machine only recommends respects in which the sides may differ; what an act implies is read, never written onto a side. A conflict between projects with an unseen other side is told to each project on its own side only; when every project holding a side asks to resolve it, the projects are named to each other and may respond, sharing only what each responder chose (DEC-85, K456).

Terms: keys `K1` (one inquiry's `supports` and `cuts_against` legs on content rows), `K2` (two inquiries, one subject, accepted claims), `K3` (accepted claims of two inquiries on one content row or `information` target), `K4` (two cited rows resolving to one entity, told apart by doctype or date), `K5` (two projects' `concluded` stances on one inquiry with differing claims; side `{kind: "stance", …}`), `K6` (two money facts for one transfer not `consistent`; side `{kind: "money", …}`). Sides: claim, leg, extent (`{kind, …}` as the source lists). Every refusal names `reason`, `code`, `check`, `translation`. Weights R24, states R26, marks R27, acceptance basis R30, parties R49, notice R50, opt-in R51, reveal R52, response and relay R53, R54.

The judgement's words (`CONTRADICTION_LABELS`, `JUDGEMENT_PROMPT`, `JUDGEMENT_PROMPT_SHA256`, `judgementSide`, `renderJudgementInput`; pure, never throw):
- R1 · `CONTRADICTION_LABELS` is exactly `world`, `record`, `precision`, `unrelated`, `undetermined`, in that order.
- R2 · `sha256(JUDGEMENT_PROMPT)` equals `JUDGEMENT_PROMPT_SHA256` (M-162); changes only with a new measurement.
- R3 · `judgementSide` keeps only `text`, `doctype`, `date`, `role`, omitting null or absent.
- R4 · `renderJudgementInput`: the prompt, `PAIRS:`, each pair numbered from 1 with key, context, sides A and B via R3; a non-array renders none.

pairs({key, limit, viewer}) (`op=contradictionpairs`; a read):
- R5 · `key` trimmed, upper-cased; blank runs every key (K1–K6); other `CONTRADICTION_KEY_UNKNOWN` (C-60.1) naming the keys.
- R6 · `limit` clamped to [1, 50] (bad is 50), never refused; answer `limit`, `bound: 50`, `bounded: true`.
- R7 · Each key run once: `ran`, `formed`, `limit`, `truncated` (one past), `levels`, `notes`, `absence`; K3 `arms: {passage, document}`; an unnamed key `ran: false`, level `not_run`.
- R8 · Joins are the key definitions, each pair counted once; K1, K4 sides resolve content-row `capture_sha`, `ref`, `extent_kind`, `stale`; K5 sides via `conclusionOf` per drawing project (basis-versions R37); K6 sides the money facts with source capture and reference, formed only when all visible, `reconcile`'s differing dimensions as context facts (R28).
- R9 · K4 doctype as the reader states it, date the document's own date `events` holds for its capture, compared by `civil-time.compare` at precision; an unstated or unsettled value forms no pair: counted `undetermined`, split `never_read`, `no_doctype`, `no_date`, `order_undetermined`, with a note; both agreeing counted `indistinct`; R25's `{entity}` order reads dates alike.
- R10 · Every side's bundle visible to the viewer (K5: both projects at `FULL`, membership R44). An absent or unrecognised viewer compares nothing: `viewer_scope: "DENY"`, absence level `viewer`, and `says` states an outage, not a statement about the record. A reveal never widens this.
- R11 · (verbatim) A key that formed nothing names the first empty rung of its ladder (K1: viewer, inquiry, leg, role, referent; K2: viewer, inquiry, subject, reading, claim; K3: viewer, inquiry, reading, claim, referent; K4: viewer, content, cited, resolution, shared entity; K5: viewer, inquiry, drawing projects, concluded stances, differing claim; K6: viewer, money fact, same parties, same stage and period, differing amount), each rung an existence probe under the same viewer gate; with every rung present, its own last level (`shared_side`, `shared_subject`, `shared_referent`, `discriminator`, `shared_question`, `shared_transfer`). Each level's sentence comes from one table. No key answers a bare zero.
- R12 · (verbatim) The answer states `wrote: false`, `pairs_formed`, the flat `pairs`, `judgement: {state: "HELD_APART", read: "candidatesFor"}` and a `says` sentence: the pairing answers pairs, and a run's judgements over them are read through R25. It publishes no label vocabulary.

propose({run, proposals, proposedBy, viewer, caller, at}) (`op=contradictionpropose`):
- R13 · Refusals in order over the whole batch: `CANDIDATE_NO_PROPOSER` (C-93.1); `CANDIDATE_NO_RUN` (C-93.2); `AI_RUN_NOT_PRINCIPAL` (C-22.12, relayed); `CANDIDATE_RUN_NOT_RUNNING` (C-93.3); `CANDIDATE_NO_PROPOSALS` (C-93.4); `CANDIDATE_LABEL_UNKNOWN` (C-93.5, `index`, `labels`); `CANDIDATE_NO_REASON` (C-93.6); a pair not formed for this viewer now `CANDIDATE_PAIR_NOT_FORMED` (C-93.7, `index`, `cut_keys`).
- R14 · Referent at a version: claim `inquiry|version` by SHA-256 of the claim; leg or extent its content id (or capture) by capture; stance `inquiry|project|version` by SHA-256 of the adopted claim.
- R15 · Candidate id SHA-256 of `{v: 1, key, sides}` (ordered); row: key, sides and bundles, run, `proposed_by`, label, reason (≤ 2,000), `state: "proposed"`, `origin: "machine"`, `at`; a repeat writes nothing; a flag (R61) `origin` `member`, `run` empty.
- R16 · (verbatim) The answer is `{ok, run, proposed, written, unchanged, candidates}`, each candidate with `new` and its stored row, and `says` that each is proposed machine work and no finding.

What is shown, and at what weight (N345):
- R24 · Weight from label and key, never stored: `precision`, `unrelated` `not_shown`; `world`, `undetermined` `lead`; `record` on K1–K4 `duty`; K5 `plurality` until `no_difference`, then `duty`. A duty is held for the joined participants of every project drawing on either side (basis-versions R37; extent side via `inquiry` R40; K5 the two projects), at most 32 projects per inquiry and 32 inquiries per row, `truncated`; never muted, dismissed or set aside; leaves only by resolution. *(its K5 arm not yet met: no measured recommender run, K488)*

candidatesFor({on, label?, weight?, state?, after?, limit?, viewer}) (`op=contradictioncandidates`):
- R25 · `on` exactly one of `{inquiry}`, `{content}`, `{entity}`, `{bundle}`, `{project}`, `{candidate}`, else `CANDIDATES_NO_SUBJECT` (C-60.2). Shown, both-sides-visible candidates, newest first (`{entity}`: by stated date, undated last as `undated`); each with key and pairing sentence (R11's table), sides verbatim, label and reason as machine work, weight, state, resolution and member, standing recommendations, duty reach, `default_question`; `taken_up: {member, at, words}` (K4264); a flag's `flagged_by`, `machine: null` (K4323). Filters `label`, `weight`, `state`; page ≤ 50, `truncated`, `cursor`. Empty answers name `none_judged` or `none_shown` (`not_shown: {precision, unrelated}`). For parties the viewer joins: `opted_in`, `asked_by_another`, `revealed`, `parties`, `responses`; a half-seen candidate never (R50). Never throws.
- R26 · State derived, never stored: `open`; `dismissed` (R31); `explained_not_shown` (unevidenced `differs`); `resolved` with kind (evidenced `differs`, `one_wrong` `corrected`, or the inquiry's conclusion, kind its `resolution`, `inquiry` R47); `taken_up` while its inquiry (R48) is not `concluded` (again on reopening).

tensionsOn({referents, viewer}) (`op=contradictiontensions`):
- R27 · Per referent at its version, marks from visible candidates: `in_tension`, `softened` (qualifiers hypothesis), `stale` (CORRECTED; reason, member, instant), `qualified` (`dissolved`, evidenced), `held_irreconcilable`, `lead`, `plurality`, `unseen_conflict` (DEC-85, the seen side only, to a party's joined participant). Each mark carries its candidate; every surface reads this. Over 200 referents `TENSIONS_TOO_MANY` (C-60.3); ≤ 200 candidates per referent (`TENSIONS_CANDIDATES_MAX`), else `truncated: true`. *(its K5 arm not yet met: no measured recommender run, K488)*

contextFacts({candidate, viewer}) (`op=contradictionfacts`):
- R28 · `contextFacts`: per coordinate `{coordinate, a, b, source}` from what the sides carry (date, doctype, capture, resolved entities, K5 projects), labelled the record's; unstated `undetermined` with why; `NO_SUCH_CANDIDATE` (C-93.9); entities ≤ 500 (`FACTS_ENTITIES_MAX`).

unresolvedRecordOn({finding, sha}) (in-process; as the plane):
- R29 · `unresolvedRecordOn({finding, sha})`: duties `open`, `explained_not_shown`, `taken_up` or `irreconcilable` with a side one level deep in the finding at those bytes (its claimed version, its document legs' rows, its inquiry legs' claimed versions); `depth: 1`; every candidate answered, an unseen side as `unseen_other_side: true` with nothing of it (explanation and inquiry withheld); ≤ 200, `truncated`; failure `undetermined: true`.

The member's acts:
- R30 · Common refusals in order: `MACHINE_CANNOT_ACT_ON_CANDIDATE` (C-93.10); `NO_CANDIDATE` (C-93.8); absent, unseen side or `not_shown` `NO_SUCH_CANDIDATE` (C-93.9); `WORDS_MALFORMED` (C-93.33; explanation 1,000, reason 500, words 500, qualifier 200, question 500). Any member seeing both sides may act. Acts recording a coordinate or kind record per coordinate `accepted` (naming a standing R37 recommendation) or `unaided`, and the standing recommendations; `ACCEPTANCE_NOT_STANDING` (C-93.25); `ACCEPTANCE_VALUE_DIFFERS` (C-93.26). The machine's reason stays the machine's. Each act appends one row; no side changes.
- R31 · `dismiss` (`op=contradictiondismiss`): after R30, `CANDIDATE_CLOSED` (C-93.11), `CANDIDATE_TAKEN_UP` (C-93.12), a duty or plurality `RECORD_CANNOT_BE_DISMISSED` (C-93.13), a reason not `same_fact_different_precision`, `not_same_matter`, `real_conflict_not_pursued` `DISMISSAL_REASON_UNKNOWN` (C-93.14); else `dismissed`.
- R32 · `clarify` (`op=contradictionclarify`): `CLARIFY_NOT_A_TENSION` (C-93.15, a lead); `CLARIFY_CHOICE_UNKNOWN` (C-93.16); `CLARIFY_COORDINATE_UNKNOWN` (C-93.17; `CONTRADICTION_COORDINATES` K1–K4, `PLURALITY_DIFFERENCES` K5); `CLARIFY_NO_EXPLANATION` (C-93.18) unless every coordinate `accepted`; `EVIDENCE_NOT_SEEN` (C-93.19). `differs` with evidence `resolved` `dissolved`; without `explained_not_shown` (a duty stays); on K4 a defect reported on each pairing resolution via `entities.reportResolutionDefect` (R38); on K5 recorded on both stances. *(its K5 arm not yet met: no measured recommender run, K488)*
- R33 · `one_wrong`: `WRONG_SIDE_UNNAMED` (C-93.20), `WRONG_SIDE_NO_REASON` (C-93.21), K5 `PLURALITY_HAS_NO_WRONG_SIDE` (C-93.22); else `resolved` `corrected`, the side marked stale, never deleted, nothing resting on it moves. *(its K5 arm not yet met: no measured recommender run, K488)*
- R34 · `no_difference` on K5 only (else `CLARIFY_CHOICE_UNKNOWN`); weight becomes `duty` for both projects. *(not yet met: N345)*
- R35 · `takeUp` (`op=contradictiontakeup`): already taken up `existed: true`; `TAKE_UP_NO_QUESTION` (C-93.23; the plane fills none); `TAKE_UP_NO_FRAME` (C-93.24). Otherwise one `promotion.promote` writes a new `open` inquiry, `surfaced_by: human`, titled from the question, `contradiction: {candidate}`, both sides as ungraded legs (framed side `supports`, other `cuts_against`; notes name each side); a refusal relayed whole.
- R36 · `resolve` (`op=contradictionresolve`): with no `version` the conclusion is the member's own `reading` (basis-versions R51; `BAD_READING`), else the named version's claim; `NOT_A_CONTRADICTION_INQUIRY` (C-93.27); K5 CORRECTED or `double_speak_or_reversal` `PLURALITY_HAS_NO_WRONG_SIDE`; R30's acceptance checks. Writes `resolution` (`inquiry` R46, R47) and concludes via `conclude` without a project, both or neither. CORRECTED marks the wrong side stale; `dissolved` qualifies both; `obligation_against_act` read by `conformance` R21; `irreconcilable` keeps both.
- R56 · `candidateSidesSeen({inquiry, viewer}) → boolean` (`affordances` R14): true exactly when R36's C-93.27 check passes for the viewer; the one predicate R36 applies; never throws.
- R57 · The over-strictness gate (M-118, M-162): the judgement under `JUDGEMENT_PROMPT_SHA256` over the labelled K1–K4 corpus (≥ 6 per key, a negative and a conflict each) forms every pair and nothing else, uncut; no `precision` or `unrelated` pair labelled `world` or `record` (false-conflict rate 0); recall stated, beating the lexical baseline; fails empty, always-`world`, silent and moved-digest runs. *(its K5 arm, a live run, not yet met: K488)*

The recommendation (the machine's one act):
- R37 · `recommend` (`op=contradictionrecommend`): R13's first four refusals; `RECOMMEND_NO_COORDINATES` (C-93.28); `RECOMMEND_COORDINATE_UNKNOWN` (C-93.29); `RECOMMEND_NO_REASON` (C-93.30); `RECOMMEND_CANDIDATE_NOT_STANDING` (C-93.31). One recommendation per coordinate (`origin: "machine"`, reason ≤ 2,000), one append site, repeats write nothing; only a respect, never a wrong side or kind; standing while `open` or `explained_not_shown`. (verbatim) **The answer** says each recommendation is machine work and not a member's choice.
- R38 · Promotion check: a non-replay document whose `contradiction.candidate` is not held or has a side the author cannot see `CANDIDATE_NOT_HELD` (C-93.32).

The measures:
- R39 · `acceptanceRates`: per coordinate `offered`, `accepted`, `chosen_unaided`, `chose_otherwise` (counts); `review_due` at ≥ 0.95 over ≥ 30 offered, stated `PROVISIONAL`.
- R40 · `dismissalMeasure`: dismissed leads by reason, key, label; `false_conflicts` the first two reasons, never `real_conflict_not_pursued`.
- R41 · `sha256(RECOMMEND_PROMPT)` equals `RECOMMEND_PROMPT_SHA256` (`MEASUREMENTS.md`). *(not yet met: N345)*

A conflict with a side the member cannot see (DEC-85, K456):
- R49 · Parties: projects R24's reach names through each side (≤ 32 per side, `parties_truncated`). A conflict between projects: `duty` or `plurality`, `open`, `explained_not_shown` or `taken_up` (never a lead). Seeing it half: exactly one side visible. Derived, never stored.
- R50 · `conflictNotices({project, after?, limit?, viewer})` (`op=contradictionnotices`): the viewer's member via `member-roster` R73 (`viewerMember`; K4233). Refusals in order: existence answer (membership R77); `NO_SUCH_PROJECT` (R78); not a joined participant via `notAParticipant` (R87, C-56.3). Each half-seen conflict of which `project` is a party through the seen side: candidate id, `project`, weight, state; that side verbatim with source, date, doctype, capture; (verbatim) one fixed sentence: "Something this project rests on is in conflict with a record you cannot see. Neither that record nor who holds it is shown. Your project can ask to resolve it. If every project holding a side asks, the projects are named to each other's members, and you can respond."; `opted_in`, `asked_by_another` (never which or how many), `revealed` and then `parties`, `responses` (R54). Withheld always: the other side and all of it, the key and pairing sentence, the label's reason, the party count. Page ≤ 50, `truncated`, `cursor`. (T41, D64; K2479) A non-hidden party reached through the unseen side, `discoverable` (R85) and not at sight `NONE` (R44), is named: `named: [{id, name}]` and, when non-empty, (verbatim) `NOTICE_NAMED_SENTENCE` ("Your project's conclusion conflicts with that project's.") in place of the fixed sentence; with none named, today's notice byte for byte with `named: []`.
- R51 · `optIn` (`op=contradictionoptin`): `MACHINE_CANNOT_ACT_ON_CANDIDATE`, `NO_CANDIDATE`, R50's three, `NO_SUCH_CANDIDATE`, `NOT_A_PARTY` (C-93.34), `NOT_A_PROJECT_CONFLICT` (C-93.35), `CANDIDATE_CLOSED`, `WORDS_MALFORMED` (500). One row; a repeat `already: true`; never withdrawn; others learn only `asked_by_another`.
- R52 · The last opt-in (parties not truncated) appends one `revealed` row in the same act; opted-in projects then see each other's ids and names and responses, nothing else; truncated parties: undetermined, said, none recorded; never widens R10, R30, `case-authoring` R33.
- R53 · `respond` (`op=contradictionrespond`): R51's first seven; `RESPONSE_BEFORE_OPT_IN` (C-93.36); `RESPONSE_NO_TEXT` (C-93.37); `WORDS_MALFORMED` (2,000); `DISCLOSURE_MALFORMED` (C-93.38); `DISCLOSURE_NOT_YOURS` (C-93.39). One row with the chosen disclosures (`cover` the author's own, R68; `email` marked `stated, not verified`); handle and member id never relayed.
- R54 · `conflictResponses`: after the reveal each response relayed to other opted-in parties (text, disclosures, project, instant); R50's `responses` those after the project's own latest, ≤ 20, `responses_truncated` (`queue` R47); read refusals R50's three, `NO_CANDIDATE`, `NO_SUCH_CANDIDATE`; ≤ 50 a page.

The connection owner (T33-48; `connection-grammar` R2, R6–R9; K1487):
- R58 · Registers with `connection-grammar.registerOwner`, owner `contradiction`, kind "in tension with" (`derived`); `neighbours` answers shown, undismissed, both-sides-visible candidates on a node in its shape, machine work, lowest `grade.assertion`, never a basis; its conformance battery in this module's tests; a flag `machine_work` false.
- R61 · (K4311, K4323, K5148) `contradictionflag({here, other, reason, viewer, author})`: one `FLAG` candidate, label `world`, `origin: member`; answers `{ok, wrote, candidate, key, weight, state, flagged_by}`; refusals R30's machine one, `FLAG_NO_PASSAGE` (C-93.40), `FLAG_SAME_DOCUMENT` (C-93.41), `FLAG_NO_REASON` (C-93.42), `WORDS_MALFORMED` (500); an existing shown candidate `already: true`; an unminted passage of a visible reading is minted by the flagging member first.
- R62 · (K5271) Taking up writes the same title into the inquiry's envelope and document (safe form).

Uses (Private): `setup-words` `word`, `localize` (the words rule, K3930; K4018); `promotion` `promote`, `registerStep`; `record-grammar`; `record-core` `recordOf`, `transact`, `declarePurge`, `bundles`; `membership` sight and gates, `visibilityOf`, existence answer (R77), `noSuchProject` (R78), `notAParticipant` (R87), `memberFacts` (R68); `content` `contentRow`; `events` dates; `civil-time` `compare`; `money` facts, `reconcile`; `connection-grammar` `registerOwner`, `ownerConformance`; `extraction` `readingOf`; `entities` `resolutions`, `reportResolutionDefect`; `inquiry` R46–R48; `basis-versions` version legs, `conclude`, `conclusionOf`, `projectsDrawingOn`.

Invariants:
- R17 · Append-only: nothing updates or deletes a candidate but its bundles' purge (either side's bundle takes it).
- R18 · The pairing is deterministic (same record and viewer, same pairs); keys are added, never widened.
- R19 · No act edits, grades or deletes a side; only R31–R36 say what a candidate was; shown only by R25–R29 to a viewer seeing both sides now at R24's weight; a half-seen conflict only by R50's notice and R27's `unseen_conflict` (DEC-85).
- R20 · Each check moves here as an invariant with its test (K6): C-60.1, C-93.1–C-93.7; and C-60.2, C-60.3 and C-93.8–C-93.42 (N345; translations below).
- R21 · Run checks via the gate `ai-runs` registers (`registerRunGate(module, gate)`, `gate(run, viewer, caller) → {found, running, refusal}`); none registered: C-93.2.
- R22 · `contradiction_candidates` is declared to record-core's purge by `a_bundle_id` and `b_bundle_id` (K23).
- R23 · No place is named in this module's behaviour or outward text.
- R42 · `contradiction_acts`, `contradiction_recommendations`, `contradiction_optins` (with the `revealed` rows) and `contradiction_responses` are append-only; state, weight and marks are derived at the read (R24, R26, R27); nothing copied that could disagree.
- R43 · A `duty` is never dismissed, muted or set aside and leaves only by resolution; a `lead` never becomes a duty unless a member acts (taking it up, which leaves it a lead's inquiry, or a K5 `no_difference`).
- R44 · Nothing silently preselected: every act names every value; the plane fills none; an acceptance names a standing recommendation equal to what it records.
- R45 · `precision` and `unrelated` candidates are never shown as a tension and are counted wherever R25 answers.
- R46 · (DEC-24, DEC-84 item 5) A machine credential holds no act of R31–R36; R37 recommends only coordinates.
- R59 · Tables declared explicitly via `record-core.declareTable` keeping R22's, R47's purges and R17's append-only (`version_chain: true`), sight the sides' bundles (opt-ins, responses their project's).
- R47 · The four act tables declared to purge by both sides' bundles; opt-ins and responses also by `project_id`.
- R48 · (DEC-77 item 1) No key pairs an aspiration: aspirations are in contact, never in contradiction.
- R55 · (DEC-85) Nothing answered to a half-seeing viewer names or counts the other side, its kind, bundle, source, project, members, or the parties' number, except opted-in projects after R52, chosen disclosures (R53) and R50's named non-hidden parties; never the machine's reason or a member's explanation.

Rows of R20 (N345), stamped by promotion, each with its English translation in the source table (`CONTRADICTION_PAIR_CHECKS`: C-60.2 `CANDIDATES_NO_SUBJECT`, C-60.3 `TENSIONS_TOO_MANY`; `CONTRADICTION_CANDIDATE_CHECKS`: C-93.8 `NO_CANDIDATE`, C-93.9 `NO_SUCH_CANDIDATE`, C-93.10 `MACHINE_CANNOT_ACT_ON_CANDIDATE`, C-93.11 `CANDIDATE_CLOSED`, C-93.12 `CANDIDATE_TAKEN_UP`, C-93.13 `RECORD_CANNOT_BE_DISMISSED`, C-93.14 `DISMISSAL_REASON_UNKNOWN`, C-93.15 `CLARIFY_NOT_A_TENSION`, C-93.16 `CLARIFY_CHOICE_UNKNOWN`, C-93.17 `CLARIFY_COORDINATE_UNKNOWN`, C-93.18 `CLARIFY_NO_EXPLANATION`, C-93.19 `EVIDENCE_NOT_SEEN`, C-93.20 `WRONG_SIDE_UNNAMED`, C-93.21 `WRONG_SIDE_NO_REASON`, C-93.22 `PLURALITY_HAS_NO_WRONG_SIDE`, C-93.23 `TAKE_UP_NO_QUESTION`, C-93.24 `TAKE_UP_NO_FRAME`, C-93.25 `ACCEPTANCE_NOT_STANDING`, C-93.26 `ACCEPTANCE_VALUE_DIFFERS`, C-93.27 `NOT_A_CONTRADICTION_INQUIRY`, C-93.28 `RECOMMEND_NO_COORDINATES`, C-93.29 `RECOMMEND_COORDINATE_UNKNOWN`, C-93.30 `RECOMMEND_NO_REASON`, C-93.31 `RECOMMEND_CANDIDATE_NOT_STANDING`, C-93.32 `CANDIDATE_NOT_HELD`, C-93.33 `WORDS_MALFORMED`, C-93.34 `NOT_A_PARTY`, C-93.35 `NOT_A_PROJECT_CONFLICT`, C-93.36 `RESPONSE_BEFORE_OPT_IN`, C-93.37 `RESPONSE_NO_TEXT`, C-93.38 `DISCLOSURE_MALFORMED`, C-93.39 `DISCLOSURE_NOT_YOURS`, C-93.40 `FLAG_NO_PASSAGE`, C-93.41 `FLAG_SAME_DOCUMENT`, C-93.42 `FLAG_NO_REASON`). Read the table in full when a test asserts a translation.

Satisfies: CONTRADICTION-IDENTIFY-DESIGN §2–§9; Case Making §CONTRADICTION; AI Roles §2, §3 (DEC-24, DEC-49); Membership v2 §7, §3; layer 6's contract; N345 (DEC-76, DEC-77, DEC-84, CONTRADICTION-PRESENT-RESOLVE-DESIGN, DEC-85, K456). A K5 gate arm is measured and passing before any K5 candidate is shown; the judgement's input is unchanged (K102).

Suggestions: factory `contradictionOf(ctx)` (K61); gate harness and corpus are this module's tests; R36 inside one outer `record-core.transact`; R52 in one `transact`; tests: every C-60 and C-93 refusal a negative control in order, sight, DEC-85 notice, opt-in, reveal and responses (no handle or member id relayed), weights, states, marks, R39–R41; jobs in `test/m/contradiction/`. Open for Bob: none (K102).
- R60 · (T51; K4168, K4264) `DECLARED_OPS` beside the ops map, frozen rows `{classes, machineClasses?, mutating, weight, description, fields: {accepts, requires}}`: `contradictionresolve`, `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionoptin`, `contradictionrespond`; `contradictionresolve`'s absent `conclusion` is `BAD_READING`. Test: `declared-ops.test.mjs`.

## Used services

retrieval (`build/requirements/retrieval.md`): runs the query language over the record and says what it could not see; keeps each bundle's projection and index current; answers searches with absence levels; builds no SQL of its own; mints nothing.

record-grammar (`build/requirements/record-grammar.md`): the shared grammar (ids, types, front matter, canonical JSON, actor identity, grades, SHA-256); no store, network or clock.

civil-time (`build/requirements/civil-time.md`): the one pure engine for civil time (dates with precision and zone, EDTF bands, three-valued comparison, rules, periods); "now" is its caller's.

connection-grammar (`build/requirements/connection-grammar.md`): the one relationship shape and the registry of owners, kinds and words; owners register `neighbours` here; holds and walks nothing.

record-core (`build/requirements/record-core.md`): owns storage: ids, leases, append-only history and manifest, purge; no member, fence or promotion write path; every storing module writes through it.
- record-core R21 · `declarePurge(module, tables, {exempt?})` is `declareTable`'s default form (`purge` exempt if listed else clear; `expunge` none; `export` admin-only; `sight` bundle when keyed else group; `derive` stored; `version_chain` false); bad classes `TABLE_CLASS_MISSING`/`TABLE_CLASS_UNKNOWN`; twice `TABLE_DECLARED`; `purge` clears every `clear` table.
- record-core R46 · A table is a name keyed by `bundle_id`, or `{name, keys: [columns], whole: "<WHERE>"}`; under `declareTable` beside the classes.
- record-core R32 · `transact(fn)`: one store-wide transaction; a throw or `ok:false` rolls back every row and unspends ids; a nested call joins it as a savepoint; rethrows after rollback.

membership (`build/requirements/membership.md`): members and what each may do, and projects as working groups at setup (participants, visibility, what a caller may see, the fence for acting); roster reads and requests are `project-roster`'s; no record integrity, no credential.
- membership R87 · `notAParticipant(projectId, by, extra?)`: the one answer when `by` holds no participation: `{ok: false, reason: "NOT_A_PARTICIPANT", code, check, translation, project, detail}` (fixed `detail`; `extra` never replaces); row C-56.3; never throws.
- membership R88 · `hiddenBundles(viewer)`: `null` when the viewer sees every bundle, else `{sql, args}` naming the bundles R43 withholds; never throws.
- membership R48 · retired (to `project-roster` R9).
- membership R78 · `noSuchProject(projectId, extra?)`: the one answer when no project answers or sight is not `FULL`, as absent: `{ok: false, reason: "NO_SUCH_PROJECT", code: "NO_SUCH_PROJECT", check, translation, project, detail}` (fixed `detail`); every module answers through it; never throws.

promotion (`build/requirements/promotion.md`): the one write path for a bundle (compare-and-swap, append-only history, the document's bytes as the record's word, one transaction or nothing), the ratification gate, reopening a set-down inquiry.

extraction (`build/requirements/extraction.md`): makes and records readings of captured bytes; mints no content, writes no bundle.

content (`build/requirements/content.md`): the unit the record points at (a part of a captured document): extent grammar, content address, content row; never moves a reference.
- content R17 · `contentRow(contentId) → row or null`; `contentRead` fixed-key (`FIXED_KEY_ONLY`, `NO_ID`, `NO_SUCH_CONTENT`); `standings`.
- content R18 · The plane's own `store` parameter is accepted.
- content R19 · The answer: row, label, `says`, transcription axis, attestations, the capture axis as the document's, connection axis `NO_SUBJECT_IN_THIS_READ`.
- content R20 · `standings`: ≤ 200 ids, one read.
- content R21 · Transcription axis: n/a for `bytes`; undetermined where coverage cannot be evaluated; else `text-chain.gradeCeiling`, a typed row covered only by others' attestations of that typing.

entities (`build/requirements/entities.md`): the entity axis and subject registry; resolves references with the §8.1 grade; derives no connection.
- entities R38 · `reportResolutionDefect({captureSha, ref, entityId, reason, source, by})` (`op=resolutiondefect`): refusals in order `NO_SHA`, `NO_REF`, `NO_ENTITY`, `NO_REASON`, `NO_SUCH_RESOLUTION` (C-91.7). Otherwise appends one report (reason trimmed ≤ 2,000; `source` `{module, id}` such as a contradiction candidate, or null; `by`; instant); a repeat by the same `by` and `source` `already: true`. A report moves nothing (grade, resolution, connections kept); reads answer `defects: [{reason, source, by, at}]`, `defect_count`.
- entities R39 · Entity-keyed collections (aliases, relations, `resolutions_resting`) bounded ≤ 500 (relations ≤ 1,000), `truncated` per collection; never a truncated count as whole.

events (`build/requirements/events.md`): happenings records attest, apart from documents' own stated dates; sequence three-valued; no cause inferred.
- events R35 · `neighbours({node, kinds, at, page})`: registered once via `connection-grammar.registerOwner` (owner `events`; took part, `concerns`, `within`, the five event links), answering a node's connections in its shape, valid at `at`, paged, passing `ownerConformance`.

money (`build/requirements/money.md`): money as stated amounts (one source's reading with its axes and two grades); reconciles two readings by naming the differing dimension.

inquiry (`build/requirements/inquiry.md`): the recursive question whose basis legs are evidence and other inquiries: lifecycle, grammar, legs and grading, ground partition (DEC-32), exclusions, supersession, division, what the record earns for a leg; no version, conclusion or strength.

basis-versions (`build/requirements/basis-versions.md`): an inquiry's frozen basis versions, their state machine, a project's CURRENT and conclusion; every act a member's.
- basis-versions R37 · `projectsDrawingOn(inquiryId, viewer)` (N64, K91 (4)): in id order each visible project with a non-`severed` `cites` reference to the inquiry, `{id, title, current}`; ≤ 32 with `bound`, `truncated` (one past); empty id: empty, `truncated: false`; ≤ 256 examined; never throws.

member-roster (`build/requirements/member-roster.md`): who the members are and what each may do, the module order, and the refusals and listener slots later modules register through; reads no bundle or project.

setup-words (`build/requirements/setup-words.md`): the interface's word list as frozen data (key, English, note, meaning, protected mark) from the design stream's `words.json` at a named commit; pure data; `instance-setup` reads it (its R68).

test-support (`build/requirements/test-support.md`): a test's temporary-file sandbox and tally-safe standard output (by importing the sandbox module), in-memory ZIPs (`bio-plane/test/make-zip.mjs`), and fix round 9's shared platform-shaped test library.

## This task

The entry of `build/plan/current.md`'s `**contradiction**` block (Layer 6):
- T53-191 · K5565 · English in tests (R20's rows and translations, R11's level sentences, R12's and R16's `says`, R37's answer, R50's sentences): convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is kept as input data or removed with its reason; every test the job touches is converted (the words check refuses English in a new or changed test). Census (`tests-sweep/CENSUS.md`, `CENSUS-RX.md`): literal A / B files 0 / 1; regex A / B / C 20 / 3 / 10 (11 files); "only this · sonnet-5-5" (BOB #324, K3518). Test: the words check's baseline loses the module's files; the suite is green.

Mismatch: the brief names a basis-versions block "K91"; it is not a separate block but part of the `projectsDrawingOn` header ("N64, K91 (4)"), summarised once above (basis-versions R37).

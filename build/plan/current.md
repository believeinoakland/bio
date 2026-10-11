# Plan T45

**Status** · OPEN · BOB #156 · session_01L1X4WzJQQ7Sdsh4iWKEui7 · depth 1

**Jobs** · jurisdictions: JURISDICTIONS #10 session_01YbCZYnryu1Ked4QncDkn47

**At T45's opening (K2784):** opened 2026-10-11 from `main` @ a969c420b2 (T44 closed by PR #27, K2784). Development runs (Bob, K2605); the 80% pause (K2341) and the account-switch rule stand. Bob's meter: 35% weekly during T44's L2 (K2741); asked again at this opening. New modules entered in `modules.json` and `layers.md` at this opening, empty (K1043): `case-check`, `action-holds`, `action-replies`, `plan-work`, `action-producers` (K2781 (1)); membership's `MODULE_ORDER` follows in T45-2 (K657).

**Sources** · `next.md` N751…N895 (each re-tested at the opening); `archive/T44.md` Outcome (its carried reds); the six fold drafts `draft-T45-{lower,l8,l9a,l9b,grammar,upper}.md` (requirement text, BOB's wording at each layer's fold, P5), read with K2780 (canon v0.2 placed), K2781 (packaging and readings) and K2782 (Bob: own projects never rescued; stewards' contact now, service later); the actions lane's `REQUIREMENTS-HANDOFF.md` (H31, folded as N893); the channel; `rulings-active.md`. The cross-draft points below are BOB's (P17), decided at each layer's fold and recorded in `rulings.md`.

## Legacy census (§5.2 (2))

| legacy module | in T45 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens (N672, N559). N794 and N865 (its reds) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; a split's new module (copy) merges before its source's job (deletion), K624; promotion's stamp merges last in its layer (K425, K1680). Each layer's requirement text is folded into its modules' files before that layer's START (BOB's wording, P5), from the draft section each entry names, with the reconciliation below applied; every new or amended line ends *(not yet met: T45)*.
2. **Every job reads its own code and tests whole** (P20, mechanics §6 step 2; K2726, K2727, K2730). Each START says so.
3. A job that adds a file outside its module's listed `paths` names it in its COMPLETE, and BOB adds it before the ownership check (K1043). A new module enters `modules.json` with empty `paths` and `tests` (K1043, K1975), with membership's `MODULE_ORDER` entry in the same act (K657; T45-2).
4. **Accepted reds at the opening** (from T44's Outcome; re-confirmed against `node checks/run.mjs` at T44's close):
   1. coverage: every id marked `*(not yet met: T45)*` until its module's merge;
   2. row census: C-143.5 and C-143.6 (and any other row T44's L3+ jobs changed), until T45-3's stamp; rows T45's L3+ jobs add or change, until T46's;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865, K2688);
   5. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   7. from T45-1's merge (K2792): `action-grammar` `grammar.test.mjs` "R1, R11: actionKinds(view)" until T45-25; `filing-templates` `reads.test.mjs` "R26 offeredVersion" until T45-30; `filings` `packet.test.mjs` "R9 the six sections" until T45-31 (the test profile grew, R84);
   8. `standards` R29 "the move to layer 5" (the new modules in `modules.json` before `MODULE_ORDER` names them), until T45-2;
   6. (if T45-27's START finds the plane composes `actions`' start registrations itself) the plane's composition of the moved hold registrations, from L9's close until T45-47 (Measure first, M-T45-5).
5. **Readings recorded with the folds, told to Bob as done** (K2781, K2782, P17): breach actions need a live *noncompliant* determination (actions R8 (a)); docket entries by a member's act are filed at once and made public by the manager's signing (DEC-116); phrasing lists hold English now, any other language reads undetermined and is never "nothing found"; the own-benefit list stays narrow (a remedy of harm is never matched); `none_exists` kept beside §6's outcomes; Tier 1 template machinery built, `@records-request` withheld until a named writer and a professional review exist; D54's existence-sight kept for a member's own project; a member's own project is never rescued (K2782); `public_comment` at Tier 1 (Design Requirement 8); `legal_organisations` widened to Tier 2 and to defence; the re-examination run started inside the recording act (ai-runs R77 amending R46); a voided basis "marked" as derived on read.

## Entries

### L1
- **T45-1 · jurisdictions** · (N858, N861, N882; N893) the profile schema: R74–R84 new, R85 (the first profile's sourced data; M-T45-1, -2) · `draft-T45-lower.md` §7 · plus, from the reconciliation (R6, R7 below): R86 `phrasings` (R6), an `action_kinds` entry's `shape` (`recognition`), `delivery_point` among `VENUE_FACTS` (R82), each R81 template carrying its own `name`, a `deadlines` entry's `defends: true`, R80 items' optional `after` (outcomes) · req: R74–R87 (R86 `phrasings`, R87 the reconciliation fields, folded K2785).

### L2
- **T45-2 · membership** · (N893; Actions D4) R128 `registerProjectActGuard` · lower §1.2; and (K657) R83's `MODULE_ORDER` gains `case-check` (L8, after `review`), `action-holds` (L9, after `actions`), `action-replies` (L9, after `action-clocks`), `plan-work` (L9, after `action-plans`) and `action-producers` (L11, after `machinery-producers`), in the act that adds them to `modules.json` at the opening.
- **T45-3 · project-roster** · (N890, N892; D4, D27; K2782) R21–R24 new (scope `counsel_matter` / `own`; the guard, **R22's rescue exception included**, K2782; `projectScope`; second approval), R18 amended; edge → `jurisdictions` · lower §1.1 · after T45-2.
- **T45-4 · promotion** · (lower §1.3; R-reconciliation R8) a leg or citation naming a bundle of a `counsel_matter` project refused (`project-roster` R23; edge → `project-roster`, 37 → 35); **the stamp**: the rows T44's L3+ jobs added or changed (C-143.5, C-143.6 and any the census names) and T45's L1–L2 rows (jurisdictions, membership, project-roster) · clears rule 4 (2)'s first half · merges last in L2.

**L2 merge order:** membership, project-roster, promotion.

### L5
- **T45-5 · events** · (L8 §5 owed; R-reconciliation R9) R28, R30 take `audience` (`"public"` or absent) and pass it unchanged to every registered source · text BOB's at the fold.
- **T45-6 · local-facts** · (N858) R3, R6 amended (office zones); R10–R14 (member-drafted rules, `governingView`, withdraw, offer); edge → `content` · lower §4.
- **T45-7 · standards** · (D7) R52 (a heard commitment is not a standard), R53 (`registerOwnSendingCheck`) · lower §2.
- **T45-8 · duties** · (N855, N882; D7, D6d) R30 (`proposeFromResponse`), R31 (`dutiesArisingIn`, read by `following`, not `monitoring`, K2781 (2)), R23 amended · lower §3 · after T45-7.

**L5 merge order:** events, local-facts, standards, duties.

### L6
- **T45-9 · steps** · (DESIGN §11) R29 (`registerDueHolder`, filled by `action-clocks`), R30 (`stepsWaitingOn`) · lower §5.
- **T45-10 · run-rules** · (lower §10 owed; R-reconciliation R10) `DRAFT_KINDS` gains `textcheck`, `infractiondraft`, `bearingdraft`, their read reach and deploy flag · text BOB's at the fold.
- **T45-11 · ai-runs** · (D21) R77 (`origin: "reexamination"`) · lower §8.2.
- **T45-12 · reading-guides** · (N858) R13 (procedure guides); edge → `jurisdictions` · lower §6.
- **T45-13 · skills** · (N858, N861, N887) R28, R30 amended; R45 (`action_drafting` layer), R46 (`procedure_guide` layer) · lower §8.3 · after T45-12.
- **T45-14 · answers** · (upper "following" owed; R-reconciliation R11) `standingQuestionEndSet({id, ends, author})`, the author's act changing a standing question's `ends` · text BOB's.
- **T45-15 · agent-worker** · (N861, N887; D11b, D21, D25) R76 with three tasks (`textcheck`, `infractiondraft`, `bearingdraft`; `statusreportdraft` left out, below), R77, R78 · lower §8.1 · after T45-10, T45-13.

**L6 merge order:** steps, run-rules, ai-runs, reading-guides, skills, answers, agent-worker.

### L8
- **T45-16 · case-grammar** · (**N888**, K2767; N855) R27, R28 (stated as built; R28's non-list edge fail closed), R29 (`outcomes:` block), R14 amended · l8 §3; with the Uses re-points of `case-carriage` and `publication` (wording at the fold).
- **T45-17 · publication** · (N893) R40's reader list gains `case-check`; nothing of a `counsel_matter` project enters a case or edition (`project-roster` R23; new edge) · l8 §1, lower §1.3.
- **T45-18 · docket** · (N855, N858, N880; D5, D10, D20; K2781 (3)) R1, R6, R26 amended, R27 new (pressure-mark reads); nothing of a counsel matter on a docket · l8 §2.
- **T45-19 · public-read** · (N883, N892 (d); D16, D28d; R-reconciliation R12) the in-band per-group fields: the group's public identity and its declared stake (read from the group setting `declared_stake`, `record-core` `getSetting`), outside the joint body fingerprint · text BOB's.
- **T45-20 · case-account** · (N861; D11a) R13 `advocacyCheck` (its project read as `own` by `project-roster` R23; new edge), R6 also judging a carried outcome's text (`kind: outcome`, l8 doubt 8), counsel matters never evidence · l8 §5.
- **T45-21 · case-authoring** · (N828, N855, N880; D6a, D6c, D13) R70 (open requests at signing), R34, R57, R65 amended, R71 (`carryOutcome`), Satisfies · l8 §4a · after T45-16, T45-20.
- **T45-22 · case-check** (new, last in L8, after `review`) · (N828; D23, D24) R1–R5 (`checkAndHold`, `caseCheckOf`, `heldFindingVersions`) · l8 §4b · no ids move: a new module built fresh, no copy · last in L8.

**L8 merge order:** case-grammar, publication, docket, public-read, case-account, case-authoring, case-check.

### L9
- **T45-23 · conformance** · (N828, N883; D5, D16, D16a, D23, D24) Purpose; R2, R9, R14, R24 amended; R31–R37 · l9a "conformance" · its held-check reads are `case-check` R2, R3 (R-reconciliation R4); source identity and edition date from `case-import` (new edges → `case-check`, `case-import`, `accepted-work`).
- **T45-24 · consequences** · (N855 6c; D5, D6c) R9 amended; R17–R23, R22 carrying success, harm addressed and cure (R-reconciliation R3); R1 refusing new parts on a void determination (l9a doubt 8) · l9a "consequences" · edges → `civil-time`, `case-authoring`.
- **T45-25 · action-grammar** · (N858, N861, N879, N880, N882–N884, N892 (b)) Purpose; R2, R5, R7, R8, R9, R11 amended; R15–R25 · `draft-T45-grammar.md` §1.
- **T45-26 · action-holds** (new, after `actions`; K2781 (1)) · by copy of `actions` R48, R52, R54–R60, R69 (id table below), then (N858 D10; D10, rule 12) holds at a place (action, entry, project; from a docket `legal` mark, a counsel matter, a pressure record), `holdsDue` covering docket marks and pressure records (R-reconciliation R14), the hold notice (l9a R89) and pressure records (l9a R90) · l9a "holds and pressure" · merges before T45-27.
- **T45-27 · actions** · (N828, N855, N858, N879, N880, N883, N884, N892 (a); K2781 (4)) R8, R9, R33, R36, R66 amended; R74–R83, R85–R88, R92–R95, R97 (R80 stays here, R-reconciliation R15); deletes the moved code, retiring each id "moved to action-holds R<n>"; registers `standards` R53's own-sending check and `consequences` R19's own-act reader; accepts nothing of a counsel matter in R66 · l9a "actions" · edges → `consequences`, `docket`, `publication`, `project-roster`, `local-facts`.
- **T45-28 · action-clocks** · (N882; D15) R2, R3, R7, R15 amended; R16 (fills `steps` R29), R17, R18; R3 also answering `due_at` and its zone (for `monitoring` R34); no overdue-reply item while `reply_owed: false`; `owed_by` and `stated` accepted at its own write; reads `local-facts.governingView` · l9b §1 · edges → `steps`, `duties`.
- **T45-29 · action-replies** (new, after `action-clocks`; K2781 (1)) · (N880; D13, D20) l9a R84 (claim bearings and proposals), R91 (`arose_from`), R96 (the open-requests reader, registered with `case-authoring` R70 in its shape) as R1–R3 · l9a · no ids move (all new: no copy).
- **T45-30 · filing-templates** · (N858; D8; K2781 (6)) R15, R26 amended, R28, R23's rows · l9b §2.
- **T45-31 · filings** · (N828, N858, N861, N879, N880, N883, N884, N887, N890, N892 (b)–(d)) R8, R9, R10, R22, R23, R24 amended; R34–R42 (R35 reading `actions` R75); plus the lines no draft wrote (R-reconciliation R17): the assertion gate and resolutions, "for the group" / "as myself", the recognition reminder, the review copy's embargo, the hold notice's text, junior-staff pointers, legal facts shown once · l9b §3 · edges → `case-account`, `docket`, `project-roster`, `action-grammar`, `action-holds`.
- **T45-32 · escalation** · (N855 6a, N884; D5, D6a) R6, R14, R16, R23, R25, R30 amended; R31, R32 · l9b §4.
- **T45-33 · action-plans** · (N855 6b, N861, N885, N887, N890; D19, D25–D27) R6, R14, R17, R20, R24, R31, R33, R34 amended; R39–R45 · l9b §5.2.
- **T45-34 · plan-work** (new, after `action-plans`, before `monitoring`; K2781 (1)) · (N855, N881, N890; D14, D21, D27) R1–R12 (R8 system-assembled; its assistant arm left out), R9 registered by `following` alone, plus a read of a matter's adopted promise-duties (R-reconciliation R18) · l9b §5.3 · no ids move (all new: no copy).

**L9 merge order:** conformance, consequences, action-grammar, action-holds (copy), actions (deletion and re-points), action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work.

### L10
- **T45-35 · monitoring** · (N855 6d, N882; K2781 (2)) R71 (an address's end date), R72 (`addressWatchers`), R32, R34, R50 amended; no edge to `action-plans` · upper "monitoring".
- **T45-36 · following** · (N855 6d, N881; K2781 (2)) R14 amended; R22–R26 (end dates, links, the once-only question, the answer, the plan's watches registered with `plan-work` R9) · upper "following" · edges → `action-plans`, `plan-work`, `duties`, `answers`.

**L10 merge order:** monitoring, following.

### L11
- **T45-37 · wizard-scripts** · (N858, N887; K2781 (6)) R22's first clause (`@records-request` resolved by handle, withheld while none is offered), R13 (the labelled machine drafts once declared) · upper "wizard-scripts".
- **T45-38 · op-grades** · (**N891**, K2773) pins at its interface the content now pinned only in affordances' tests (RUNGS partition, terminal and `undetermined` sets with 78 = 21 + 57, layer 9's NON_ACTS and read rows, substrate and directed forms, consequence keys, T33's merged-table identity, JUSTIFICATION_REFUSALS exclusions, owners' reads writing nothing); R32 (T45's ops graded) · upper "L11 op pattern" · first in L11's op jobs.
- **T45-39 · affordances** · (**N891**) drops its copies of those pins (test only); R51 (every act an action offers; vocabularies); edges → `project-roster`, `plan-work`, `action-holds`, `action-replies`, `case-check` as its code needs · after T45-38.
- **T45-40 · action-producers** (new, after `machinery-producers`; K2781 (1)) · by copy of `queue-producers` R15–R21, R29 (id table below), then R15–R19, R21 amended (recipients, one item per fact, words by basis, the docket arm), R40 (`member-left-items`), R41 (`watch-keep-or-stop`), R42 (doors), R43 (`plan-review-due`, `plan-look-again`) · upper "queue-producers" · merges before T45-41.
- **T45-41 · queue-producers** · deletes the moved code, retiring each id "moved to action-producers R<n>"; R8 answers action-producers' items as it reads `machinery-producers`; edge → `action-producers`.
- **T45-42 · notice-producers** · (upper owed) no "Noticed" item for a duty after the end day a `following` link holds for it (R25); a step held by `steps` R29 draws no `step-date-due` (read through `stepsDue`, no new edge) · text BOB's.
- **T45-43 · queue** · (upper owed) R12's per-kind `instead` for `watch-keep-or-stop`, `plan-review-due`, `plan-look-again`, and `member-left-items` (`available: false, instead: queuemute`, upper doubt 15) · text BOB's.
- **T45-44 · instance-setup** · (grammar doubt 11; D28d) reports `action-grammar.lawStagesFindings` over the loaded view's records laws; the administrators' act setting the group's `declared_stake` · text BOB's.
- **T45-45 · op-declarations** · (N893) R49 (every T45 op specified); **R47's wording note**: its T42 `ACT_HELP_ABSENT` sentence marked history since T43 (OP-DECLARATIONS #19, K2773), wording only · upper "L11 op pattern".
- **T45-46 · installer** · (**N894**, K2782) its README publishes the stewards' contact address, what they may do (withdraw shared services, never edit a group's record), and the plain guide to what a group holds and who could compel it; the same text in the public documentation (BOB's commit) · text BOB's; **the address is Bob's to name** (one act, asked at the opening).
- **T45-47 · plane** · composition: the new modules' start registrations (`action-holds`, `action-replies`, `plan-work`, `following`'s, `case-authoring` R70's source, `steps` R29's holder, `standards` R53, `consequences` R19), the new ops' handlers; clears rule 4 (6) if opened · merges last in L11.

**L11 merge order:** wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, installer, plane last. `control-plane` and `answer-envelope` join (before plane) only where their op maps must name a new module's ops, decided at T45-45's merge.

### New modules: places and id moves (K617, K624, K657, K1043)

| new module | layer, place | built by | ids moved (retired in the source as "moved to …") |
|---|---|---|---|
| `case-check` | L8, after `review` | fresh | none |
| `action-holds` | L9, after `actions` | copy, then `actions` deletes | `actions` R48 → R1, R52 → R2, R54 → R3, R55 → R4, R56 → R5, R57 → R6, R58 → R7, R59 → R8, R60 → R9, R69 → R10; new R11 (hold notice, l9a R89), R12 (pressure records, l9a R90); C-117.22 retired with R52's old text |
| `action-replies` | L9, after `action-clocks` | fresh | none (l9a's R84, R91, R96 numbered R1–R3 here) |
| `plan-work` | L9, after `action-plans`, before `monitoring` | fresh | none |
| `action-producers` | L11, after `machinery-producers` | copy, then `queue-producers` deletes | `queue-producers` R15 → R1, R16 → R2, R17 → R3, R18 → R4, R19 → R5, R20 → R6, R21 → R7, R29 → R8; new R9–R12 (upper's R40–R43) and doors |

Users re-pointed in their own jobs: `doorbell` R3, `ratification` R45, `store-door` R4 (registrations: wording at the fold), `filings` R9, `machinery-producers` (if it reads holds; verified at T45-26's START), `affordances`, `op-declarations`, `plane`, `queue`. No edge points later.

## Left out of T45 (one hard reason each, re-tested at the opening)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N780 | a deployment: the next release cut (K1501) |
| N794, N865 | Bob's: legacy-ui stays frozen until the new screens replace it (K633, K1849) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C) |
| N842 (and agent-worker's record-check assistance through `/draft`'s `account_check`, lower R76) | a dependency not yet built: the interactive AI paths and N829's test set |
| N847 | a dependency not yet built: the pointer's content is the UX design stream's (N821); no provider named |
| N852 | a dependency not yet built: the runner passes text only; images published where Containers pull (N780) |
| N853c | a measurement: OCR's accuracy on members' photos |
| N886 | the design stream's words (B139), not yet given |
| N889 | the design stream's: those sentences have no keys yet |
| N895 (the stewards' service; N892 (e)'s service part) | a dependency not yet built: no shared service exists to withdraw (K2782) |
| N881's assistant status report (`statusreportdraft`, its `run-rules` reach and grant op; `plan-work` R8's assistant arm) | the order: its read (`plan-work` R7, L9) is built after `agent-worker` and `run-rules` (L6); an out-of-layer job needs Bob each time (K1548); joins T46 |
| N858's `@records-request` template content | K2781 (6): no named writer and no professional review exist (v0.2 rule 11); the machinery is in |
| `wizard-scripts` R22's second clause (five scripts) and `@communication`'s step | the design stream's: `library.json` not given; `@communication`'s re-pointing is theirs (upper doubt 12) |
| N880's minutes comparison beside the group's public comment (U4) | the design stream's: no module holds a meeting's minutes beside a comment; U4 is a screen comparison |
| N882's "proceeding followed with its own dates" | a dependency not yet built: the approved hand-off assigns it to no module; a commission or court docket followed is COURTS L2, not yet a requirement; the party's own dates are in (`action-clocks` R18) |
| `legal_facts` triggers `paid_attendee`, `recording`, `threat_letter`, `serial_meeting` detected at their moment | a dependency not yet built: the moments are screens' (attending, recording, receiving); the facts are held (T45-1) and shown at preparation by kind (T45-31) |
| T41's carried rows (N821's runner, screens and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747) | unchanged from `archive/T41.md` "Left out", re-tested |

Applied in T45 (move to `archive/next-applied.md` at the last owning merge): N828, N855, N858 (but the template content), N861, N879, N880 (but U4), N881 (but the assistant's report), N882 (but the proceeding), N883, N884, N885, N887, N888, N890, N891, N892 (a)–(d), N893, N894.

---

## Cross-draft reconciliation (BOB's, P17; recorded at each fold)

**R1 · Sentence resolutions: `filings`, not `actions`.** l9a and grammar (doubt 6) place the member's resolution of a pointed-out sentence at `filings`' approval; upper lists "assertion resolution per sentence" among `actions`' acts. *Resolution:* `filings` (it holds the text and the approval): a new id after R42 runs `action-grammar.pointOut` (`assertion`) over every prepared outward text, unions `agent-worker`'s `textcheck` where enabled (labelled), records each resolution (grammar R19) with the approval, and refuses approval `ASSERTION_UNRESOLVED` while any is unresolved; a `breach_claim` resolution sets `breach: true` through `actions`' revision (R8's gate). Upper's grading list re-points the op to `filings`. **A list `undetermined` (any language but English, K2781 (5)) is never a refusal**: the approval shows `phrasing.no_list` ("nothing could be pointed out"), since refusing would block every non-English approval, a capability change no ruling made.

**R2 · Signing-view seam.** l8 R70: `registerOpenRequests({openRequestsOn})`, `openRequestsOn({case, members, viewer})` → `[{whom, asked_at, window_closes, answers: {answered, claims}}]`, a throw read `undetermined`. l9a R96: `openRequestsFor({inquiries, findings, viewer})` → `{action, addressee, asked_on, window_closes, reply}`, `{unreadable: true}` on failure, registered "with case-authoring or publication". *Resolution:* the provider's (l8 R70) names and shape govern; `action-replies` R3 fills it, deriving the members' inquiries and findings from `members` itself, `answers.answered` = claims whose latest bearing is not `not_addressed`, `answers` null with no layout; it throws when it cannot read. `window_closes` from `action-clocks` (earlier than `action-replies`: why it sits after `action-clocks`).

**R3 · Carry into the next edition.** l9a consequences R22 `successCarry` "calls the layer-8 op the L8 draft names", passing statement, date, evidence, figures, sequence or cause; l8 names `case-authoring` R71 `carryOutcome({case, kind, text, cites, on, by})`, a service with no op, `text` one line ≤ 2,000 characters with no quote, backslash or line break, and expects cures from "escalation or conformance". *Resolution:* one carrying op, `consequences` R22 (`op=successcarry`, renamed `outcomecarry`), carrying three kinds: a success record (R17), a harm addressed (R9's statement) and a cure (`conformance` R37's standing link; consequences uses conformance). It passes `text` (the statement) and `cites` (the evidence) only; figures, sequence and cause stay on the success record, unpublished (l9a's "passing figures… never re-worded" struck), so a carried outcome never states a cause. R71's text rule governs (`BAD_CARRIED_OUTCOME` passed through); R71's text is account-checked (T45-20). Docket `outcome` entries are filed by the member through `docket`'s own op (R1), no L9 caller; l8's "a later module's op calls `docketFile`" struck.

**R4 · Held checks: `case-check`, not `publication`.** l9a conformance R31, R33 and its Owed name "publication's checked-and-held read"; l8 homes it in `case-check` R2 (`caseCheckOf`), R3 (`heldFindingVersions`), K2781 (1). *Resolution:* conformance → `case-check` (L8, earlier). l9a's `publication` edge change is struck; `publication` R37 still serves R34's re-pin.

**R5 · One date, one reminder.** lower puts it in `steps` (R29 `registerDueHolder`, R30 `stepsWaitingOn`); l9b in `action-clocks` (R16 `clockForStep`, `steps: [ids]`) with owed lines to `notice-producers` and `queue-producers`. *Resolution:* both, joined: `action-clocks` R16 states "stand for each other" and registers it as `steps` R29's holder; `stepsDue` then omits a held step, so `notice-producers` needs no read of `action-clocks` (T45-42 only the duty-watch line); `action-producers` R1 reads R16's `steps` for its one item.

**R6 · Phrasings section.** grammar R17 reads `view.phrasings`, owed to `jurisdictions`; no draft wrote it. *Resolution:* `jurisdictions` R86: `phrasings: [{locale, kind, phrase, basis}]`, `locale` by R37 `isLocale`, `kind` one of `assertion`, `position`, `own_benefit_ask` (spelled in the profile grammar), `phrase` 2–100 characters on one line; unioned in `combine`; test profile per grammar R11; the first profile holds none (rule 11).

**R7 · Ids an edge or registration expects that the provider does not define.**
| expected by | name used | resolution |
|---|---|---|
| l9b action-clocks R2 | `<actions: receipt fact>` | `actions` R80 (stays in `actions`, R15) |
| l9b action-clocks R2 | `<actions: service fact>` | R80 gains `kind: receipt \| service` (service names the party served); with none, `served` stays undetermined |
| l9b R18, grammar §3 | `<actions: clock entry's owed_by>` | the clock entry's writer is `action-clocks`; it accepts `owed_by` and `stated` at its own write, audited by `action-grammar` R7's C-11.1 arm (verified at T45-28's START) |
| upper queue-producers R15 | basis kind `theirs` | `stated` (l9b R7); the key `queue.action-clock-overdue.theirs` stays a key |
| l9b filing-templates R15 | `<jurisdictions: templates with name and sources>` | R81's templates each carry `name` (R40's form) and `sources` |
| l9b filings R9 | `<jurisdictions R26: applies_to defence>` | a `deadlines` entry's `defends: true` (as R78's) |
| l9b filings R39 | election facts | R79's `pending_measure_or_candidate` fact and its citation; whether a text names a pending measure or candidate is the member's mark at preparation (no list of measures exists) |
| l9b plan-work R10 | `<jurisdictions: next routes>` | R80 items' optional `after: [outcomes]` (`action-grammar` R5's vocabulary), read through `reading-guides` R13 |
| l9a actions R93 | a kind's `shape: recognition` | `action_kinds` entry `shape` (R1) |
| l9a actions R9 | venue `delivery_point` | `delivery_point` added to R82's frozen `VENUE_FACTS` |
| l9b R22, l9a R75 | `<public-read: per-group fields>`, source identity and stake | `public-read` T45-19; the source group's from `case-import`'s read of the imported edition's stamp (`stake: undetermined` for editions before T45) |
| l9b plan-work R10 | `<actions: onCorrespondenceRecorded>` | `actions` R95 `registerResponseListener` |
| l9b plan-work R7 | `<actions: holds>` | `action-holds` R7 (`projectHolds`) and R3 (`holdsDue`) |
| l9b filings R35 | `<conformance: kind of findings>` | `actions` R75's disclosures (one source; `filings` prints them) |
| upper following R24, R26; queue-producers | "action-plans' read of a matter's promise-duties", "registration door", "take-up read", "review read" | `plan-work`: a new read (R18 below), R9, R11 `takeUpsFor`, R4 `planReviewsDue`; look-again is `action-plans` R40 |
| upper monitoring R34 | a clock entry's time of day and zone | `action-clocks` R3 answers `due_at` and zone (T45-28) |
| lower, l9a | `standards` R53's registrant | `actions` registers it (T45-27; l9a omitted it) |
| lower | readers of `local-facts.governingView` | `action-clocks`, `filings`, `actions`, `duties` R5, each in its own job |
| upper queue-producers R42 | the act stating an entry met or waived | the existing `action-clocks` op, named at T45-40's START |
| l9b filings R34 | case-account's `question`, `own_doing` | `filings` classes them itself (a question by its sentence; `own_doing` the member's mark); `contradicted` is `case-account`'s existing `ACCOUNT_CONTRADICTED_BY_RECORD`; no case-account change |

**R8 · Counsel matters enforced, text unwritten.** lower §1.3 owes enforcement to `promotion`, `publication`, `docket`, `case-account`, `actions` R66, `filings`; only `actions` R66 and `filings` R10 were drafted. *Resolution:* BOB words one line each at the fold (T45-4, -18, -19, -21), each tested with a `none`-scope control; edges → `project-roster` (all earlier).

**R9–R12 · Owed lines with no draft:** `events` audience arm (T45-5); `run-rules` draft kinds (T45-10; the three tasks read existing record ops, so `credentials`' grant list needs no change, verified at T45-15's START); `answers` `standingQuestionEndSet` (T45-14); `public-read` per-group fields and the group's `declared_stake` setting written by `instance-setup` (T45-19, -45), which places N892 (d) for published cases too (l8 doubt 13's hard reason lifted).

**R13 · Monitoring's edges (K2781 (2)).** lower's `monitoring` → `duties` (duties R31) becomes `following` → `duties`; `monitoring` → `action-plans` is not added; l9b's `monitoring` → `plan-work` is not added (only `following` registers with `plan-work` R9, its links covering addresses).

**R14 · Docket marks, one reader.** l8 has `queue-producers` read `docket` R27 directly; upper (doubt 13) extends `actions.holdsDue`. *Resolution:* `action-holds` R3 (`holdsDue`) covers docket `legal` marks and pressure records; `action-producers` R5 reads that one source.

**R15 · `action-replies`' place and the receipt.** l9a puts receipt (R80) in `action-replies`, which `action-clocks` must read, while R96 needs `action-clocks`' window: a cycle. *Resolution:* R80 stays in `actions`; `action-replies` sits after `action-clocks` ("after its source", K2781 (1)).

**R16 · The window beside `OVERRIDE_NO_GROUND`.** l9a (doubt 1): the surface shows `action-clocks`' window; l9b (doubt 12): `actions` computes it through `civil-time`. *Resolution:* l9a's: `actions` refuses with grounds and the quick route; `action-clocks` answers the window as a read; one computation of a deadline.

**R17 · `filings` lines no draft wrote** (l9a's Owed to filings): the assertion gate (R1); public comment "for the group" (approved, stamped) or "as myself" (her notes, not the group's act, never recorded as an action, D12); the recognition text's one-time reminder that thanks names staff publicly (rule 5); the review copy's embargo and release time (`actions` R79); the hold notice's text (`action-holds` R11 records its sending); junior staff below the responsible official pointed out only through `textcheck`'s `staff_named` where enabled (no phrasing list can match names), D28c; legal facts whose `applies_to` names the kind shown once with citation at preparation. BOB words them as `filings` R43–R49 at L9's fold.

**R18 · Promise-duties per matter.** upper following R24 needs "each matter's adopted promise-duties"; `duties` R31 answers by capture. *Resolution:* `plan-work` R13 `matterPromiseDuties({plan, matter, viewer})`: the captures of the `received` entries of the plan's actions serving the matter, through `duties` R31, answering `all_met` and `partial`; `following` reads it.

**R19 · Moved registrations in the copy window.** `action-holds` copies `actions` R55 (doorbell reader) and R69 (ratification `holdsOn`), each "one registration": both registering would refuse at start. *Resolution:* the copy exports the readers and registers nothing until `actions`' job deletes its own registrations and switches the call; where the plane composes them, rule 4 (6) (M-T45-5).

**R20 · Edges checked against the order.** Every new edge above points to an earlier module, `modules.json` order with the new modules placed as the table says. Checked in particular: `action-replies` → `case-authoring`, `action-clocks`; `plan-work` → `action-replies`, `action-holds`; `following` → `plan-work`; `action-producers` → `following`, `plan-work`, `action-holds`; `conformance` → `case-check`, `case-import`; `consequences` → `case-authoring`; `case-account` → `project-roster`. **No draft's edge points later** once R4, R13, R15 are applied (l9a's `action-replies` before `action-clocks` would have made `action-replies` → `action-clocks` point later; R15 removes it).

**R21 · Codes named twice.** grammar adds shape codes l9a lacks (`FOUND_ELSEWHERE_REFUSED`, `SPEAKER_REFUSED`, `REPLY_OWED_REFUSED`, `FOLLOWS_ACTION_REFUSED`, `LAW_STAGE_UNKNOWN`): `actions` mints each from the first finding; rows in C-117. `action-holds`' rows stay in C-117 (`action-grammar` R9) until its own family is BOB's choice at its START. `upper`'s merge order "op-declarations, op-grades, affordances" is replaced by `modules.json`'s (op-grades, affordances, …, op-declarations), which N891 also needs.

---

## Owed to UX (one channel QUESTION to UX-DESIGN)

Keys and labels whose words are the design stream's; refusal translations are BOB's drafts, theirs to re-word. Canon's own words (no new words needed): `guide.procedure.legalinfo`, `prepared.rests.held`, `prepared.rests.accepted`, `queue.action-clock-overdue.noreply`, the six matter states.

- **project-roster, membership, local-facts, reading-guides, ai:** member words for the scopes ("counsel matter", "my own project"), the second-approval setting, the group-rule states and the professional's statement prompt; `reads_as` and `bearing` names; rows `PROJECT_SCOPE_UNKNOWN`, `_NEEDS_HIDDEN`, `_OWN_NOT_SOLE`, `_UNCHANGED`, `_OWN`, `_KEEPS_HIDDEN`, `APPROVAL_RULE_INVALID`, `APPROVAL_KIND_UNKNOWN`, `PROJECT_GUARD_UNCHECKED`, `COMMITMENT_AS_HEARD`, `COMMITMENT_OWN_LETTER`, `RESPONSE_KIND_UNKNOWN`, `RESPONSE_EXTENT_NOT_IN`, `PROMISE_DATE_UNREAD`, `DUTY_SOURCE_NOT_HELD`, `MACHINE_CANNOT_DRAFT_RULE`, `RULE_SECTION_UNKNOWN`, `RULE_ENTRY_INVALID`, `RULE_NO_SOURCE`, `RULE_IN_PROFILE`, `RULE_SELF_CONFIRM`, `RULE_NOT_DRAFTED`, `RULE_NEEDS_QUALIFICATION`, `NO_SUCH_RULE`, `GUIDE_KIND_UNKNOWN`, `GUIDE_ITEM_UNSOURCED`, `DRAFT_NEEDS_GRANT`, `AI_RUN_ORIGIN_UNKNOWN`, `AI_RUN_REEXAM_NEEDS_RESPONSE`, `AI_RUN_REEXAM_OPEN`.
- **L8:** `signing.openrequest.line`, `.noreply`, `.unread`; `case.check.held`, `case.check.void.{document_replaced, member_moved, source_lapsed, accepted_work_lapsed, marks_lapsed}`, `case.check.undetermined`; `case.outcomes.head`, `case.outcome.{success, cure, harm_addressed}`; `docket.outcome.{cure, harm_addressed}`; `advocacy.{supported, notsupported, contradicted}`; rows `DOCKET_OUTCOME_UNREADABLE`, `DOCKET_PRESSURE_REFUSED`, `MACHINE_CANNOT_CARRY_OUTCOME`, `CARRY_NOT_A_PARTICIPANT`, `BAD_CARRIED_OUTCOME`, `NO_SUCH_CARRIED_OUTCOME`, `CARRIED_OUTCOME_SETTLED`, `CARRY_NO_REASON`, `ADVOCACY_NOT_OWN_PROJECT`.
- **conformance, consequences:** `conformance.void.reads`; the cure link's form; `consequences.success.sequence_not_cause`, `.cause_not_stated`; labels for `remedied`, `mitigated`, `compensated`, `acknowledged`, `cannot_be_undone`; rows `DETERMINATION_VOID`, `DETERMINATION_NOT_ADOPTABLE`, `MACHINE_CANNOT_LINK_CURE`, `CURE_TARGET_NOT_NONCOMPLIANT`, `CURE_NOT_COMPLIANT`, `CURE_OTHER_OFFICE`, `CURE_NOT_LATER`, `CURE_LINKED`, `FINDING_NOT_PUBLISHED` (re-worded), `ADDRESSED_WORD_REFUSED`, `ADDRESSED_NO_PERCENTAGE`, `ADDRESSED_NO_REASON`, `ADDRESSED_BAD_REASON`, `MACHINE_CANNOT_RECORD_SUCCESS`, `SUCCESS_NOT_A_PARTICIPANT`, `SUCCESS_NO_STATEMENT`, `SUCCESS_BAD_DATE`, `SUCCESS_NO_EVIDENCE`, `SUCCESS_TOO_LARGE`, `SUCCESS_FIGURE_NOT_COMPUTED`, `SUCCESS_CAUSE_UNSTATED`, `SUCCESS_CAUSE_NOT_EVIDENCED`, `SUCCESS_CAUSE_OWN_ACT_ONLY`, `SUCCESS_CAUSE_UNCHECKABLE`, `NO_SUCH_SUCCESS_RECORD`, `SUCCESS_NO_REASON`, `SUCCESS_BAD_REASON`, `SUCCESS_SUPERSEDED`, `MACHINE_CANNOT_CARRY`.
- **actions, action-holds, action-replies, action-grammar:** `actions.override.ground_not_stated`, `actions.reply.not_owed`, `actions.scope.published_stays`, `actions.openitems.not_office`, `actions.recognition.promise_only`; `phrasing.{assertion, position, own_benefit_ask}.pointed`, `phrasing.no_list`, `assertion.resolve.{rewrite, only_asks, breach_claim}`; labels for `OVERRIDE_GROUNDS`, `PRESS_RECORD_TERMS`, `FOUND_ELSEWHERE_KINDS`, `BEARINGS`, `PROMISE_KINDS`, `CLOCK_OWED_BY`, scopes, receipt and service; rows `DETERMINATION_NOT_NONCOMPLIANT`, `OVERRIDE_NO_GROUND`, `OVERRIDE_GROUND_REFUSED`, `COPIED_IS_ADDRESSEE`, `MACHINE_CANNOT_SET_PARTNERS`, `PARTNERS_REFUSED`, `MACHINE_CANNOT_SET_PRESS_TERMS`, `PRESS_TERMS_NOT_PRESS`, `PRESS_TERMS_REFUSED`, `RECEIPT_NOT_ON_SENT`, `OFFICE_STATUS_UNKNOWN`, `OFFICE_STATUS_WITHOUT_OUTCOME`, `MACHINE_CANNOT_SET_REPLY_OWED`, `NO_REPLY_OWED`, `FOUND_ELSEWHERE_NEEDS_CAPTURE`, `FOUND_ELSEWHERE_REFUSED`, `SPEAKER_REFUSED`, `REPLY_OWED_REFUSED`, `FOLLOWS_ACTION_REFUSED`, `FOLLOWS_ACTION_REWRITTEN`, `FOLLOWS_ACTION_SELF`, `MACHINE_CANNOT_RECORD_BEARING`, `BEARING_NOT_RFC`, `BEARING_REFUSED`, `STAGE_NOT_IN_LAW`, `LAW_STAGE_UNKNOWN`, `MACHINE_CANNOT_SET_SCOPE`, `SCOPE_NO_REASON`, `SCOPE_UNCHANGED`, `MACHINE_CANNOT_RECORD_PROMISE`, `PROMISE_REFUSED`, `HOLD_PLACE_REFUSED`, `MACHINE_CANNOT_SEND`, `HOLD_NOT_IN_PLACE`, `MACHINE_CANNOT_LINK`, `AROSE_FROM_NOT_A_RESPONSE`, `AROSE_FROM_LINKED`.
- **filings, filing-templates, escalation, action-plans, plan-work:** `packet.privileged`, `packet.privileged.warning`, `filings.election.notice`, `rfc.quoting`, the record-check, position, self-benefit and staff pointers, "for the group" / "as myself", the recognition reminder, `plan.close.lessons`, "what's next", the offers "document the infraction" and "chance to fix it" and the document-first reason prompt, "no reply owed", "stopped pursuing, {date}", escalation stage names as questions, the scenario comparison; rows `TEMPLATE_NOT_REVIEWED`, `TEMPLATE_COURT_PETITION`, `CONTRADICTED_HELD`, `SELF_BENEFIT_ASK`, `RFC_QUOTING_MISSING`, `ASSERTION_UNRESOLVED`, `ASSERTION_RESOLUTION_REFUSED`, `NOT_A_PARTNER`, `JOINT_FINGERPRINT_MISMATCH`, `SECOND_APPROVAL_NEEDED`, `SAME_APPROVER`, `MACHINE_CANNOT_STOP`, `NOT_OPEN`, `NOT_STOPPED`, `SCENARIO_ALREADY_SET_ASIDE`, `SCENARIO_NOT_SET_ASIDE`, `NO_SUCH_SCENARIO`, `PLAN_NOT_OPEN`, `PLAN_NOT_PAUSED`, `DOCUMENT_FIRST_NO_REASON`, `SCENARIO_OUT_OF_RANGE` (re-worded).
- **monitoring, following, queue, wizards, L11:** `monitoring.address.ended`, `.noend`; `following.watch.{question, keep, stop, reliedon, noend}`; `queue.action-clock-overdue.{ours, theirs}`, `queue.member-left-items.*`, `queue.watch-keep-or-stop.*`, `queue.plan-review-due.*`, `queue.plan-look-again.*`, `queue.litigation-hold.docket.*`; door labels; `mock-acts.js` text for each new op; which acts open a consequence dialog; the screen registry's marks on the new reason fields; rows `WATCH_END_REFUSED`, `MACHINE_CANNOT_LINK_WATCH`, `NO_SUCH_WATCH`, `MATTER_NOT_OF_PLAN`, `WATCH_ENDED`, `WATCH_NOT_ASKED`, `WATCH_RELIED_ON`. Also asked (not keys): the five wizard scripts in `library.json`; `@communication`'s step; whether a pending second approval needs a screen (upper doubt 11).

## Measure first

- **M-T45-1** (lower M-a): the City of Oakland's 2027 holiday list and the 2027 judicial holidays, sourced when published; until then counts into 2027 stay undetermined (`jurisdictions` R33).
- **M-T45-2** (lower M-b): each R85 rule family (Brown Act demand, grand jury replies, commission participation, rulemaking periods, anti-SLAPP, election thresholds, meeting-law facts, venue facts) measured with worked examples, as T33's time-law study, inside T45-1's job before its data is written; what no source supports is absent and named in its record.
- **M-T45-3** (lower M-c): whether any office the first profile addresses keeps another zone (none expected; R74 is for other states).
- **M-T45-4** (grammar doubt 4): the English phrasing lists over a corpus of real complaint, comment and demand letters (sentences pointed out, rewrites a member would make) before the lists grow.
- **M-T45-5**: at T45-26's START, how the plane composes `actions`' start registrations (doorbell R3, ratification R45): decides whether rule 4 (6) opens (R19).
- **M-T45-6** (sizes, K617, measured over code at each START): `actions` after the move (~4,000–4,300; trim comment bulk); `case-authoring` (~3,950); `membership` (~3,733); `monitoring` (~3,590, no further work without a split plan); `op-declarations` (~3,700, T45's specs in their own file); `filings` (~3,500, the counsel packet named as its seam); `agent-worker` (~3,300 with three tasks); `queue-producers` after the move.
- **M-T45-7** (l9a doubt 11): S1 §D 11 verified in code: `ratification` R41 calls the hold reader, so a hold stops a scheduled publication (T45-26's START, after the move).

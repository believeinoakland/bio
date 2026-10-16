# T22 plan: the second, independent pass (K1009 (3))

**Status** · Written by an independent reviewer for BOB #89, 2026-10-01, on `prep/T22` @ 005df11688 (with `main` @ 994fd3f9ff merged: DEC-96–DEC-111 and `build/channels.md`). Inputs: the process principles (P4–P6, P8, P17, P19) and mechanics §3, §5.2, §7, §9, §12.2; `build/manifest.md` (the UX stream: a DEC on `main` is folded by BOB as a requirement change citing it); the first pass's `next.md` and `t22-inventory.md` (132 rows: 73, 59); and what the first pass did not read: `docs/development/DECISIONS.md` on this branch and the design session's U1–U20 (`t22-ux-inbox.md`). Every change made to `next.md` and the inventory is marked "(check)". Nothing was committed.

## 1. Re-derived independently

| source | method | result |
|---|---|---|
| `not yet met` marks | `grep 'not yet met' build/requirements/*.md` | 58 marks, plus the three Uses notes (A18–A20) and two Suggestions (A38, A40): the inventory's A rows, complete |
| todo and skip tests | `grep -E '\.todo\(|todo:|skip:'` over `bio-plane/test/m/`, `newgroup/test/` | 22 todos, each an A row or B22; the skips are environment-conditional (`ssh-keygen`, `openssl`), not work; the `ai-runs` hits are state values |
| `next.md` entries | `git show d9a73f24f3:build/plan/next.md` | 22 entries, B1–B22, complete |
| T21's left-out tables | `archive/T21.md`:108–119, :231 | C1–C9 and the B rows, complete |
| rulings K929–K1014 | read whole | D1–D11 complete; **K1014** (after the first pass) adds: D10 met (the channel's live exchange done, D12 proven); "U6's owed work (DEC-88, DEC-89, DEC-96–DEC-111) enters T22's replan"; each fold answered on the channel (J9) |
| DECs with an `owed:` line | `DECISIONS.md` (owed lines begin at DEC-76); for each, `grep DEC-<n> build/requirements/` | cited (folded): DEC-76–81, -83–85, -94. **Not cited, owed work not carried:** DEC-82, -86, -87, -90 (the redesign only), **DEC-88**, **DEC-89**, **DEC-92**, **DEC-95**, and DEC-81's Grade A decisions (with Bob) |
| K617's owed splits | K617, sizes measured from `modules.json` paths | publication 4,408 lines, "split before its next job", not carried by the first pass (**J10**); docprofile 4,950 has no entry, so no job and no split due |
| legacy census | `modules.json` `"legacy": true` | legacy-tests (retired at the opening) and legacy-ui (stays): correct |

**Missing from the inventory, now rows J1–J11 and H6b, H9b, H16b, H16c** (15 rows):
- **J1, J2 · DEC-88** (owed "(BOB's)", so not a question for Bob): `RUNG_ABSENT` still holds 147 keys and `RUNGS` 71 (`affordances.mjs`:928; probed by import), so Bob's three bands for the 57 acts are unapplied; the consequence statement for the six; `inboxresolve` regraded `reasoned` "when DEC-78's pull admits material", which it now does (capture R65, `op=inboxpull`); a required reason on each reasoned act that lacks one (known: capture `inboxResolve`, escalation `escalationOpen`, whose signature takes no reason, `escalation.md`:17).
- **J3 · DEC-89**: the opening reason, the decline-to-escalate act and its read, a determination's escalated/declined/neither. No sub-question is left open with Bob in its text.
- **J4 · DEC-92**, **J5, J6 · DEC-95**, **J7 · DEC-81's Grade A**, **J11 · DEC-82/-86/-87/-90** (redesign only).
- **J8 · DEC-102 item 3**: "the member is asked by a to-do in their own queue" when no credit level is chosen; `queue-producers.md` has no such item (grep "credit", "attribution": none).
- **J9 · K1014**: each fold answered on the channel.
- **J10 · publication's split** (K617).
- **H6b, H9b, H16b, H16c**: the shares of DEC-101, -103 and -108 whose reason differs from their carried shares.

## 2. The left-out rows challenged

Kept, reason verified true:
- **Deployment**: B1 DIST-14, B2 N75, B3 N34 (also a fixture encoder not built; pdf-worker past the mark), B11 and C9 (a release, Bob's act, K633 (2)), B16 N473 and C1 (a migration run at every instance), C2, C3.
- **Measurement**: C4 and A11–A17 (a measured recommender run, K488); C8 (the first profile's research, K925, K934, K941).
- **Bob's (UX)**, legacy-ui or an interface not yet built: B6–B10, B12, B18, B20, C6, C7, D2, I2 (legacy-ui, K633); B4, B5, A54 (Bob, K899 (2): "needed, but wait for the new interface"); C5 (K608 (4): the plan-page surface "in the order Bob sets"; joint action deferred by Bob, K600 (c)); H3, H11, H14, H18, H20 (screens).
- **Bob's**: B13 N470 (K943: "no withdrawal act for a ratified case edition for now"; DEC-100 keeps question 36 open); H5 (DEC-100: "awaits Bob's ruling").
- **Dependency not yet built**, each checked absent: A8 bias R26 (no evaluation findings under a lens: `review.md`'s purpose is the review copy only; R26's own K102 trigger); A21 inquiry R31 (no module or grammar defines an opinion element: grep "opinion" in `build/requirements/` finds only inquiry and ocr-worker); A37 progressions R32 (no amounts or funds as values); A41 publication R30 (nothing publishes a rendering, D-246).

Re-worded (reason true, but not stated as one hard reason): A22, A23 (the dependency is the member surfaces, which canon sequences first, `BIO_System_Design.md`:253); A27, A31 (quoted; questions 5 and 6); H13 (DEC-105's own deferral, "the research waits for its trigger", not a measurement); H4 (DEC-99: member screens not built; the published case's conformance is "checked as each screen is accepted"); H8, H21 (quoted below).

**Re-classified as carried** (the first pass's "Bob's" was wrong: Bob has ruled each DEC; its owed line asks BOB to draft the requirements and Bob to approve the draft. That is an approval of BOB's wording before the layer, not an open question, so the share is carried conditionally, as K921's folds were):
| row | share | module, layer | fold BOB writes before the layer |
|---|---|---|---|
| H2 | DEC-97: held-captures read, bulk set-aside, bulk link, the batch's "contested" arm | ratification L8 (contested; `uses` + contradiction); the read and acts placed by BOB in modules under the mark | ratification R22's arm; the acts' requirements; a set-aside needing a new record state is a record-grammar fold at the opening, or it waits (order) |
| H6 | DEC-101 (1) the "What changed" statement required at signing; (2) the assistant's draft, labelled, origin kept | case-grammar, ratification R2/R18, case-authoring, publication's share (L8); skills (L6) | the statement's place in the case document and the refusal; the proposal act |
| H9 | DEC-103: lens statements printed into the signed case, the withheld count, the page's lens section and print form | case-grammar, case-authoring (uses bias), publication's share, public-read (L8) | the case document's lens section; public-read's page |
| H16 | DEC-108: limits 5 and 10, the sentences, the tally (after BOB's privacy check), the inbox read's sort | capture (L3) | capture R31, R54, the inbox read, a tally read |
| J3 | DEC-89 | escalation (L9); affordances, op-declarations, control-plane (L11) | escalation's opening reason (also DEC-88), the decline act, the status read |
| J5 | DEC-95 (1) the unattended grade note | capture (L3), queue-producers (L11) | capture's completion record, the item's text |
| A42 | publication R32 | the split's module or publication (L8) | the seam map (P6 holds until the split, which K617 makes BOB's and T22 now carries) |

**Kept left out with a corrected reason:**
- H1 DEC-96, H6b DEC-101 (3), J4 DEC-92: **dependency not yet built**: nothing brings another group's published edition into this copy. inquiry R7's `inherited` leg names "an edition the published registry holds", and publication R7's registry is this copy's own `published_cases`; no fetch or signature check of another copy's case is in the tree, and publication R32's import is unbuilt.
- H8 DEC-102 testimony: **Bob's**: its owed line leaves the doctrine open: "how each identity level maps to the testimony grade and how anonymous testimony counts in strength … what counts as corroboration to journalistic and legal standards".
- H16b DEC-108 gatekeeper and archive: **Bob's**: its owed line leaves open "how a litigation hold (question 31) affects the archive's clearing"; the gatekeeper's dismissals go into that archive.
- H21 DEC-111: **Bob's (architecture, P4)**: it needs a home, and the only existing one is publication (4,408 lines, P6); a new product module is Bob's to add.
- H9b, H16c, J6, J11: **Bob's (UX)**: screens of the new interface (a pre-signing preview, the inbox's highlighting, "one quiet line on a question's page", the redesign's surfaces).
- J7 DEC-81's Grade A: **Bob's**: "its three decisions (the Grade A rule text, a member-recorded WACZ's grade, whether an evidentiary capture observes `robots.txt`) are with Bob".

## 3. The carried rows checked for safety

| finding | evidence | resolved in `next.md` |
|---|---|---|
| DEC-89 asks `conformance` to show whether a determination was escalated, but conformance (index 63) precedes escalation (70) and cannot read it (P4) | `modules.json`: escalation uses conformance | the read is escalation's, answering per determination |
| A capture-side reason on `inboxResolve` breaks the inbox page's call, which sends none | `setup.mjs`:1338 (instance-setup, L11) | instance-setup's START passes the reason; accepted red 6, L3 to L11 |
| Adding the split's module to `modules.json` before L8 turns membership's `MODULE_ORDER` (R83) red after membership's L2 job | K936's precedent | accepted red 4, until T23's L2 (P8) |
| A new op in L9 is outside the affordances totality until L11 | K902's precedent | accepted red 5; affordances and op-declarations merge early in L11 |
| Modules near the mark | ratification 3,770; inquiry 3,783; provenance 3,938; extraction 3,997 | ratification takes two small shares and stops and reports if it would pass; inquiry adds A9's registration only; provenance and extraction unchanged (comments, fixture deletions) |
| One job per module | every module appears once in the roster; inquiry's A9 joins its N480 job, monitoring's A29 its existing job | none |
| Merge order | L8: the split's module, then publication, then case-grammar, then its users; L11: affordances and op-declarations early | added |
| Folds before their layer | capture's before L3 is the tightest | Bob's approval page goes first with capture's folds; an unapproved share moves to T23 at its layer's start |
| D10 | K1014 | marked met |

No carried row of the first pass was found unsafe: the order of action-clocks before filings (67, 69), filing-templates before queue-producers (68, 76), monitoring before scheduler (72, 73), queue-producers before queue (76, 77), instance-setup before installer (78, 84) and membership before promotion (21, 23) all hold, and each module named is used only by later ones.

## 4. The 27 "stale" marks

Every suite run on `prep/T22` @ 005df11688, `node --test bio-plane/test/m/<module>/`: acquisition 59/59; actions 63/63; bias 55 pass, 1 todo (R26); monitoring 73 pass, 6 todo; observation-log 60/60; provenance 113/113; queue 80/80; record-core 92/92; reevaluation 82/82; run-productions 39/39; scheduler 51 pass, 1 todo (R10); skills 44/44; strength 69/69. **0 fail.**

**Proved whole: 25. BOB strikes them at the opening, one ruling citing these tests:**

| row | mark | proving tests (file:line) |
|---|---|---|
| A1 | acquisition R7 | `acquisition/acquire.test.mjs`:176 (asserts `locale === renderLocaleFor(view)` and `timezone === "UTC"`, :244–245); the mark's own condition is gone: the first profile names `locale` (`jurisdictions/profiles/oakland-alameda.mjs`:182) |
| A2 | acquisition R29 | `acquisition/checks.test.mjs`:20, :42, :95, :118, :143, :151; `acquire.test.mjs`:128, :660; the door's call: `control-plane/door-share.test.mjs` (control-plane imports `evidenceStorageAbsent`, `control-plane/index.mjs`:11) |
| A3 | actions R7 `completed` | `actions/t18.test.mjs`:24; `write.test.mjs`:115 |
| A4 | actions R8 override | `actions/t18.test.mjs`:92 (MACHINE_CANNOT_OVERRIDE, the 500-character rule, PREMISE_OVERRIDE_REWRITTEN, stamped once, not without breach); `t12.test.mjs`:11, :34; `write.test.mjs`:141, :196 |
| A5 | actions R9 arms | `actions/t18.test.mjs`:42 (every arm and its refusal), :75, :299 (a person's `entity_id`) |
| A6 | bias R24 | `bias/adopt-manifest.test.mjs`:256; its justification arm is R3's C-26.3 (no statement without one) |
| A7 | bias R25 | `bias/adopt-manifest.test.mjs`:277 |
| A33 | monitoring R32 | `monitoring/reads.test.mjs`:71, :99 |
| A34 | monitoring R33 | `monitoring/understanding.test.mjs`:31, :55; the change reaching reevaluation: `monitoring/invariants.test.mjs`:56 |
| A36 | observation-log R21 | `observation-log/lead.test.mjs`:148, :190 (`partial` worded, :157–158); the frontier half is retrieval R49: `retrieval/frontier.test.mjs`:291 |
| A39 | provenance R49 | `provenance/attest.test.mjs`:180 (BAD_SHA, both eras, `rfc3161` and `co_archive`, the note, registered, undetermined) |
| A43 | queue R18 | `queue/feed.test.mjs`:269; `action.test.mjs`:104 |
| A44 | queue R19 | `queue/mute.test.mjs`:21, :36, :50 (N374); `converts.test.mjs`:86, :215; `contradictions.test.mjs`:85; `signer.test.mjs`:29; `action.test.mjs`:66, :83; `templates.test.mjs`:70 |
| A45 | record-core R38 | `record-core/record-core.test.mjs`:366 |
| A46 | reevaluation R14 | `reevaluation/pushed.test.mjs`:31, :68; `sweep.test.mjs`:117, :152; `caseparts.test.mjs`:68, :93; `raise.test.mjs`:221 |
| A47 | reevaluation R15 | `reevaluation/pushed.test.mjs`:103, :127, :141, :171; `sweep.test.mjs`:177; `caseparts.test.mjs`:168 |
| A48 | reevaluation R25 | `reevaluation/sweep.test.mjs`:34, :42, :55, :65, :80, :111, :196; `caseparts.test.mjs`:141 |
| A49 | reevaluation R17 | `reevaluation/obligation.test.mjs`:331 (weaker, equal, ungraded; neither pair altered) |
| A50 | run-productions R14 | `run-productions/module.test.mjs`:25, :42 |
| A51 | scheduler R3 | `scheduler/alarm.test.mjs`:100, :121 |
| A52 | scheduler R11 | `scheduler/producers.test.mjs`:147, :161 |
| A53 | scheduler R12 | `scheduler/plane.test.mjs`:144 |
| A55 | skills R28 | `skills/planning.test.mjs`:25, :48, :74, :83 |
| A56 | skills R29 | `skills/planning.test.mjs`:94; `doctrine.test.mjs`:135 |
| A58 | strength R15 | `strength/reads.test.mjs`:179, :200 |

**Not proved whole: 2, each now an entry in its module's job:**
- **A9 bias R40**: `bias/debt.test.mjs`:234 proves bias's half over a synthetic source; the requirement says the findings are "registered by `inquiry`", and nothing registers them (`registerWorkProducts` is called only by ai-runs, `ai-runs/index.mjs`:111). Entry: inquiry L6, fold before L6; the mark is struck at inquiry's merge.
- **A29 monitoring R25**: `monitoring/ticks.test.mjs`:427 asserts the failure count and the governed exemption, not the class recorded for each outcome (`source_refused` for a 404 or refusal, `fetch_failed`; `monitoring/index.mjs`:632, :797). Entry: monitoring L10 makes the test whole, then the mark is struck.

## 5. Final counts and the left-out list

**Inventory 147 rows: carried 85, left out 62** (85 + 62 = 147; the first pass's 132 rows, and 15 added). Of the carried, six are conditional on Bob approving the drafted fold before their layer (H2, H6, H9, H16, J3, J5) and one on BOB's seam map (A42). The roster has 35 jobs: L1 2, L2 2, L3 3, L4 2, L5 2, L6 5, L7 0, L8 6, L9 4, L10 2, L11 7.

Each left-out row, with its one hard reason:

- **Deployment, 9:** B1, B2, B3, B11, B16, C1, C2, C3, C9.
- **Measurement, 9:** C4, A11–A17, C8.
- **Dependency not yet built, 9:** A8 (evaluation findings under a lens), A21 (an opinion element), A22, A23 (the member surfaces, which canon sequences first), A37 (amounts and funds as values), A41 (a published rendering, D-246), H1, H6b, J4 (another group's edition in this copy).
- **Bob's (policy, doctrine, requirements, architecture), 9:** B13 (K943), H5 (DEC-100), H8 (DEC-102's mapping), H13 (DEC-105's trigger), H16b (the litigation hold and the archive), H21 (DEC-111's home, P4), A27 (monitoring R17's act), A31 (R29's sweep design), J7 (Grade A).
- **Bob's (UX): legacy-ui or an interface not yet built, 26:** B4, B5, A54 (K899 (2)); B6–B10, B12, B18, B20, C6, C7, D2, I2 (legacy-ui, K633); C5 (K608 (4), K600 (c)); H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 (the new interface's screens).

9 + 9 + 9 + 9 + 26 = 62.

No row is left out for size (P6): publication's split is carried.

## 6. Questions that are Bob's, each with a recommendation

1. **Approve the DEC folds BOB drafts** (requirements, P5, P17; each DEC's own owed line: "for Bob's approval"): DEC-89 (escalation), DEC-95 (1), DEC-97, DEC-101 (1)(2), DEC-103 (case document, page), DEC-108 (limits, sentences, tally, inbox sort). *Recommended:* approve them on one rendered page before L3 (capture's first); they restate rulings Bob has already made, so only the wording is new.
2. **DEC-102: how identity level weighs testimony** (doctrine). *Recommended:* testimony credited at group or project level counts as an anonymous tip: it may support a finding only beside an independent corroborating leg (a document, or testimony identified at cover or name, from a different member) on the same claim; cover and name keep today's grade; a change of level raises re-evaluation notices on the findings resting on it, as DEC-78 item 5 (e) does for a source. BOB drafts the strength, ratification and reevaluation requirements from that for T23.
3. **DEC-111's home** (architecture, P4: a module carrying product capability). *Recommended:* a new layer-8 module after public-read (it uses credentials, signatures and public-read), drafted during T22 (P18) for T23, not added to publication, which is being split for size.
4. **DEC-108: a litigation hold and the discard archive** (policy). *Recommended:* while any litigation hold is "in place" in the group (actions R52), the archive's one-week clearing pauses for the whole archive; the gatekeeper ships with the archive.
5. **monitoring R17: who sets an address's own frequency, and by what act** (requirements, UX). *Recommended:* a reasoned act by a member who owns the source's project, corrected forward, shown on the plan row (R16).
6. **monitoring R29: what a sweep's query is** (requirements). *Recommended:* BOB drafts the design from Intake Doctrine §4 during T22 for Bob's review, so T23 can carry R29.
7. **DEC-81's Grade A decisions**, already with Bob (`GRADE-A-CAPTURE.md`). *Recommended:* nothing new; listed so the report names them.
8. **Installer isolation (R13, R24)**: canon sequences it after the member surfaces (priority). *Recommended:* keep that order; R32's one-copy refusal, carried in T22, is the interim guard.

**Not Bob's, decided by K617:** publication's split. Bob said splitting for size "is low level technical decision … it MUST be split", not his. Inserting the split's module is the size split K617 makes BOB's, not a new capability, so P4's "with Bob" does not apply.

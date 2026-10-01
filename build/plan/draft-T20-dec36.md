# Draft: DEC-36 over hidden dependents, backlinks and placeholders (K903 (4))

DRAFT by a drafting worker for BOB, 2026-10-01, on `tranche/T20` @ 7c76acb8b7. Every line number is read at that commit. For BOB: the wordings are folded before their layer (rule 1, P18); the STARTs go to `build/plan/starts-T20/` once placed.

**The rule (K903 (4); N303's rest, N320; canon DEC-36, `docs/architecture/BIO_Interaction_Constructs_v0_1.md`:198).** DEC-36: "D-15 governs IDENTITY and DETAIL (absolute: no id, no title, no state, no count), DEC-16 governs COMPLETENESS (the fact that something is missing is stated, never the thing itself)." A hidden item is withheld whole, with at most `out_of_view: true`. **The model is strength R6** (`build/requirements/strength.md`:25; `bio-plane/src/strength/index.mjs`:311–338 `inquiryStrength`, :900–963 `redactAxis`): an unseen member leaves every list it was in; a key that named it is left out, never null; a count that counted it goes; `out_of_view: true` states only that something was withheld; every record fact about the visible subject stands; a viewer who sees everything gets today's answer byte for byte, with no `out_of_view` key.

**Two leaks, opposite in kind.** (a) A **placeholder** (null id beside "an object you may not see", or a null left in a list): it can be counted, and it sits where the item sat. Conformance, consequences, escalation, filings, action-plans; reevaluation's `superseded_by`. (b) A **silent withholding** (reevaluation R3, R7, R27; connections R20): no count, but the incompleteness is not stated, which DEC-36 also forbids. Fix: add `out_of_view: true`.

**Where `out_of_view` is stated, and where not (a reading BOB makes, P17).** It goes on an answer **about one subject the viewer may see** (a determination, a part, an escalation, a packet, a plan, a named target's dependents or backlinks). A listing **not about one subject** (reevaluations with no target, `correctedDependents`, `dangling`, `determinationsFor`'s page as a page) lists what the viewer may see, as every list does (membership R44), and carries no `out_of_view` at the page level. Saying "something is withheld" on a corpus-wide sweep would tell an outsider that hidden records exist. Each item in such a list that is itself about a subject (one determination in `determinationsFor`) carries its own `out_of_view`.

**Rows.** None changes. No refusal code, check, translation or `where` moves. Every change is to a read's shape. Nothing awaits stamp. Each job's record says "no row; read shape only".

**Order inside L9 (found here, for BOB).** Conformance's reads feed three modules that read the placeholder as a signal today:
- **filings** R3 compares `findings.length` against the count of non-null entries (`src/filings/index.mjs`:404–405).
- **filings** R9 maps `{finding: null}` to its own placeholder (:758–760).
- **action-plans** `#support` treats a finding with no frozen pair as `short` (`src/action-plans/index.mjs`:201–206).

Once conformance drops hidden findings, each of these would silently answer over the visible ones only (R3 fills the blank; support could read `established`). So: **conformance merges early in L9**, and the filings and action-plans jobs start after it and read conformance's `out_of_view`. Escalation's `outcomesOf` already drops a null standard (`src/escalation/index.mjs`:104–105), so it is unaffected. Consequences' R1 lookup (`src/consequences/index.mjs`:270–278) answers the same either way.

---

## 1. reevaluation (L7, running beside intent)

**Leaks at HEAD.**
- `src/reevaluation/index.mjs`:264–269: R2's `superseded_by` is `sup.map((id) => visible(id))`, so a hidden superseder is a `null` in the list. That is a placeholder and a count. It is answered in `reevaluations` (:718, `superseded_by: moved.superseded_by`) and in `changesOf` (:883–884).
- :666–668 (R3), :845–850 (`raise`, R7): dependents are withheld whole but silently.
- `correctedDependents` (:930–973, R27) and the untargeted sweep withhold silently. These are listings (no change, per the reading above).
- **Open point:** with no target, the sweep iterates every basis target (:638) with no visibility check on the target. An obligation of a visible dependent therefore names a target the viewer may not see, with its `target_state` and a cause `detail` naming it (:656–661, :704). Strength R6 withholds a member whose target is unseen. Whether an obligation on an unseen target is withheld whole, or the target is a record fact of the visible dependent's leg, is BOB's. It is drafted below as a REPORT, not a change.

**Wording (amends R2, R3, R7, R20).**
- R2: replace "a superseding id the viewer may not see is null in `superseded_by`, and the cause stands" with "a superseding id the viewer may not see leaves `superseded_by` (the key is left out when none is left), the cause stands, and the answer states `out_of_view: true` (R20)".
- R3: after "with no count of what was withheld", add "; the answer states `out_of_view: true` when one was (R20)".
- R7: after "with every dependent the viewer may not see withheld and not counted", add ", and `out_of_view: true` when one was (R20)".
- R20, whole: "**R20** Every viewer is given the same record facts. An id a viewer may not see is withheld whole: no id, title, state, placeholder or count, and never a null in its place. An answer about one subject the viewer may see that withheld something states `out_of_view: true`, and only that (DEC-36, as `strength` R6): `reevaluations({target})` (R1–R3), each obligation's and each `changesOf` finding's `superseded_by` (R2, R9), and `raise` (R7). A listing not about one subject (R1 with no target, R27) lists what the viewer may see and states no `out_of_view` (K903 (4))."

**START (new file `starts-T20/reevaluation.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 7, reevaluation (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs hidden dependents and backlinks: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338 and `redactAxis` :900–963 as the model). Your R2, R3, R7 and R20 were re-worded before L7. In bio-plane/src/reevaluation/index.mjs: (1) `#moved` (:264–269): a superseding id the viewer may not see leaves `superseded_by` (filter, never `visible(id)`'s null); when none is left the key is left out (the `...(moved.superseded_by ? …)` spreads at :718 and :883–884 test a non-empty list); the `supersession` cause and its `since` stand. Have `#moved` return a `withheld` boolean beside it. (2) `reevaluations({target})` (:633): the answer gains `out_of_view: true` when a dependent was withheld at :668 or a superseder at (1). With no target it states none. (3) `raise` (:843): `out_of_view: true` on the answer when a live leg's dependent was withheld at :848. The listener's `detail` (:852) is unchanged. (4) `changesOf` (:864): a finding whose superseder was withheld carries `out_of_view: true` on its own entry. `correctedDependents` and the untargeted sweep are unchanged (listings, R20). Do not change which obligations the untargeted sweep lists. If you find an obligation naming a target the viewer may not see (the target loop at :655 has no visibility check), name it in a REPORT with a reproducing case (an open point for BOB). Tests (test/m/reevaluation/): add to obligation.test.mjs a superseder hidden from one viewer (a membership proxy, as test/m/conformance/reads.test.mjs:63 builds one): `superseded_by` holds only the visible id, no null, and `out_of_view: true`; both hidden: the key is absent, the cause stands, and `out_of_view: true`; negative control: ADMIN gets :76's answer byte for byte with no `out_of_view` key. Add a targeted read (`reevaluations({target: T})`) by a viewer who sees T and not DEP: DEP absent, `out_of_view: true`, no count; negative control: a viewer who sees both gets no key. In raise.test.mjs:33–34, the "nobody" raise also asserts `out_of_view: true`, and :30's ADMIN answer stays deepEqual (no key). Keep obligation.test.mjs:123, source.test.mjs:143 and corrected.test.mjs:112 as they are, and add to each `assert.equal(none.out_of_view, undefined)` (the untargeted listing states nothing). Add one changesOf case with a hidden superseder. Proof: test/m/reevaluation/ green; the whole test/m with no new red (conformance's flag listener reads `superseded_by` nowhere; re-scan bio-plane/src for readers of `superseded_by` from reevaluation and name any in a REPORT). No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## 2. conformance (L9; merge early)

**Leaks at HEAD** (`src/conformance/index.mjs`):
- :90: `const UNSEEN = "an object you may not see"`.
- :711–712: a hidden standard answers `{standard: null, says: UNSEEN, outcome, rows…}`. Its outcome and rows are answered too.
- :720: a hidden finding is `{finding: null, says: UNSEEN}`.
- :731–732: a question's hidden inquiry is `inquiry: null`.
- :736–740: a cause's hidden evidence is a `null` in `evidence`.
- :743: `outcomes` is mapped from the standards, so a hidden one is `{standard: null, outcome}`.
- :847–848: `determinationsFor`'s outcomes give `standard: null`. :851–854 give `{finding: null, says: UNSEEN}`.
- :352–356: `#actView` answers the act's evidence content ids unfiltered (an id leak, same rule).
- :936: `#proposalView`'s standards give `null`. :940: its `contradiction` gives `null`, which is silent.
- **And an identity leak:** `#flag` (:753–806) adds a cause for every pinned finding with no sight check (:765–783: `subject: p.finding_id`, `detail` naming it, `reopened`/`superseded`/`edition` stating its state). It also passes on stored `determination_flags` rows whose subject is unchecked (:759–763). So R10's `basis_changed` names a hidden finding's id and state.
- :789–794: the standard arm reads `standardRead` with the viewer and skips an unseen standard. Its `detail` names `read.superseded_by`, which may be one the viewer may not see.

**Wording.**
- R9: replace "a finding or standard the viewer may not see is replaced by null and "an object you may not see"" with "what the viewer may not see is withheld whole (R24)".
- **New R24** (not named by any test in `test/m/conformance/`): "**R24** (K903 (4), DEC-36) Every read withholds whole what the viewer may not see. The reads are R9, R10's flag, R11, R12's `comparisonRead` and R22's cause. The things withheld are a pinned finding; a standard, with its outcome, rows and disagreement; a question's inquiry; an evidence content id of the act or the cause; a proposal's standard or its `contradiction`; and an R10 cause whose subject is one, its `detail` with it. Withheld whole means no id, title, state, placeholder or count. The item leaves its list. A key that named it is left out, never null. The determination's or proposal's answer states `out_of_view: true`, which says only that something was withheld. What is authored on the determination itself stands for every viewer who may read it: a question's text without its `inquiry` key; the act, author, time, supersession and `live`; `basis_changed` when any cause stands, with the withheld causes left out; and `outcomes_differ` over all its standards. That is the pattern of `strength` R6, which keeps every record fact about the axes. A viewer who may see everything is answered as before, with no `out_of_view` key."
- **Open point for BOB:** `outcomes_differ` over all standards tells a viewer who sees one standard that a hidden one's outcome differs. It is drafted as a record fact of the determination (strength's pattern). The strict alternative computes it over the visible standards. The same question applies to `basis_changed` standing when every cause is withheld.

**START (new file `starts-T20/conformance.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 9, conformance (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs the "an object you may not see" placeholders and hidden dependents: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338, :900–963 as the model). Your R9 was re-worded and R24 is new, before L9. Merge early: filings and action-plans read your `out_of_view` after you. In bio-plane/src/conformance/index.mjs: delete `UNSEEN` (:90). In `determinationRead` (:695): a hidden standard leaves `standards` and `outcomes` whole (:711–716, :743); a hidden finding leaves `findings` (:720); a question's hidden inquiry loses its `inquiry` key while `question` and `opened` stay (:731–732); a hidden evidence id leaves `cause.evidence` (:736–740) and `act.evidence` (`#actView`, :352–356, answers it unfiltered today, here and in `determinationsFor`; give it the viewer). Gather one `withheld` flag and answer `out_of_view: true` when it is set. `outcomes_differ` (:741) stays computed over every standard (R24). In `#flag` (:753): it already takes `viewer`. A cause whose subject is a finding the viewer may not see (the pins loop :765–783, and the stored `determination_flags` rows :759–763), a standard whose read is refused (:791 already skips; also drop a `detail` naming a `superseded_by` the viewer may not see), or a passage `passageNotice` refuses, is left out and sets the flag. `basis_changed` stands when any cause is left. Have `#flag` return `{causes, withheld}`. In `determinationsFor` (:845–856): the same for outcomes and findings, with `out_of_view: true` on that item only, never on the page. In `#proposalView` (:932–941): hidden standards leave `standards`; a hidden `contradiction` is left out (not null) with `out_of_view: true` on the proposal; a proposal naming none keeps `contradiction: null`. Tests (test/m/conformance/): re-key reads.test.mjs:58–77 to R24: `findings` [], `outcomes` [], `standards` [] for pat, with `out_of_view: true` on the read and on the `determinationsFor` item, `JSON.stringify` of each holding neither F's nor std's id nor "an object you may not see". Negative control: olive (sees all) gets no `out_of_view` key and today's answer. Re-key contradiction-cause.test.mjs:140–143 to `evidence: [ev.content]` with `out_of_view: true` (olive's :144 unchanged), and :189–190 to `contradiction` absent from the proposal plus `out_of_view: true`; a proposal naming no contradiction keeps `contradiction: null` and no key. Add an R10/R24 test: a pinned finding hidden from pat and reopened. pat's `basis_changed` names no cause with F's id, the read holds no F, and `out_of_view: true`. olive's names it. Add a question whose inquiry is hidden: `question` stays, `inquiry` absent. Add a page test: `determinationsFor` states no top-level `out_of_view`. Proof: test/m/conformance/ green; the whole test/m with no new red. Re-scan bio-plane/src and bio-plane/test/m for readers of `finding: null`, `standard: null` or "an object you may not see" from your answers (at HEAD: filings :297–310, :404–405, :758–760, :941–942; action-plans :188, :201–206; escalation :104, :244, :554; consequences :267–278; actions :733; action-clocks :177). A reader whose answer changes names itself in a REPORT, and BOB accepts its red by name until its own L9 job. Do not edit them (§12.2). No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## 3. consequences (L9)

**Leaks at HEAD** (`src/consequences/index.mjs`):
- :556–562: a hidden operand is `{content: null, says: "an object you may not see"}` in place, so it is counted and positioned.
- :580–590: a hidden causation inquiry gives `causation.inquiry = null` and `why = "an object you may not see"`. On `established` it also gives the strength placeholder `{capture: null, connection: null, testimony: null, says: "…could not be read for you"}` (:583–587).
- Unfiltered: `assessment.rests_on` (:571, ids the author could see), `addressed.evidence` (:593), and `#basisChanged` (:603–627). That last one answers `causation_superseded` or `causation_reopened` for a hidden inquiry (its state), and the operand cause names an operand by `ord`.
- No requirement states the placeholder (R13 covers only a hidden project's parts), and no test asserts it.

**Wording. New R15** (not named by any test in `test/m/consequences/`): "**R15** (K903 (4), DEC-36) A part's answer (R6, R7 and every read that answers parts) withholds whole what the viewer may not see:
- an operand whose content lies in a bundle the viewer may not see leaves `computation.operands`;
- a causation inquiry the viewer may not see is not named: `causation` keeps the `state` the part recorded, and its `inquiry`, `why` and `strength` keys are left out;
- an id in an assessment's `rests_on` or an addressed record's `evidence` the viewer may not see leaves its list;
- an R8 cause about a withheld operand or the withheld causation is left out.

No id, title, state, placeholder or count: never a null in its place. The part states `out_of_view: true`, which says only that something was withheld. The computed value and grade, and every other fact the part records, stand. A viewer who may see everything is answered as before, with no `out_of_view` key." With it, R13's last sentence gains "; inside a part the viewer may see, R15".

**START (new file `starts-T20/consequences.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 9, consequences (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs the "an object you may not see" placeholders: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338, :900–963 as the model). Your R15 is new and R13 re-worded, before L9. In bio-plane/src/consequences/index.mjs `#answer` (:549): a hidden operand leaves `computation.operands` (:556–562; flatMap, never the placeholder). When the causation inquiry is hidden (:580), `causation` is `{state: r.causation_state}` alone: no `inquiry`, `why` or `strength` key, and the strength placeholder at :583–587 is never reached for it (it stays for a seen inquiry whose read fails). `assessment.rests_on` (:571) and `addressed.evidence` (:593) keep only ids the viewer may see (`#resolvesEvidence(id, who)`, :328, is the predicate). The `rests_on` sentence (:572–573) is chosen on the list as answered. `#basisChanged` (:603) leaves out a `newer_capture` cause on a withheld operand and both causation causes when the causation is hidden. Set `out_of_view: true` on the part when anything was withheld. Tests (test/m/consequences/reads.test.mjs, new R15 tests; build sight with a membership proxy as test/m/conformance/reads.test.mjs:63 does): a computed part with one operand hidden from pat has one operand, no null, `out_of_view: true`, and `JSON.stringify` holds neither the hidden content id nor "an object you may not see". An established causation hidden from pat: `causation` deepEqual `{state: "established"}`, `out_of_view: true`. The same causation reopened gives pat no `causation_reopened` cause (R8's test at :102 keeps its own viewer, who sees it). An assessed part's `rests_on` and an addressed record's `evidence` with one hidden id. Negative control in each: the viewer who sees all gets today's answer byte for byte and no `out_of_view` key. Assertions that name the inquiry for a seeing viewer (assessed.test.mjs:62, :83, :132) stay. Proof: test/m/consequences/ green; the whole test/m with no new red (escalation reads `consequences.addressed`; re-scan bio-plane/src for readers of `operands`, `causation.inquiry` or "could not be read for you" and name any in a REPORT). No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## 4. escalation (L9)

**Leaks at HEAD** (`src/escalation/index.mjs`):
- :383: a hidden attached action is `{action: null, says: "an object you may not see", stage, attached_by, at}`. That is a count plus the attachment's stage, author and time.
- R6's note (:274–277) names `a.action` for every stage-2 attachment, read unfiltered through `actionFacts(this.#text(a.action))`.
- The history (:410–413) holds R13's trigger ids, which may name a hidden action or its ledger entries (`<action>#<ord>`).
- The trigger ids at :259, :271–272, :278 and :296 come through `#ledger(action, viewer)`, which is already gated. Verify it.
- No requirement states the placeholder (R20 covers only a hidden project's escalation), and no test asserts it.
- **Noted, not drafted:** an action's ledger is read through the viewer (:229), so whether a trigger is met can differ between viewers. That is a record fact read differently (R2 says "the record ids that meet it"). BOB may want it in `next.md`.

**Wording. New R26** (not named by any test in `test/m/escalation/`): "**R26** (K903 (4), DEC-36) An attached action the viewer may not see (`actions.actionRead` refuses it) is withheld whole from every read of the escalation (R2):
- it leaves `actions`, with its stage, attacher, time, purpose, standards and filings;
- R6's note naming it leaves `notes`;
- an id naming it or one of its ledger entries leaves a trigger's `ids` and a history entry's trigger ids.

No id, state, placeholder or count. The escalation states `out_of_view: true`, which says only that something was withheld. The escalation's own stage, history acts, evaluations and proposals stand. A viewer who may see everything is answered as before, with no `out_of_view` key."

**START (new file `starts-T20/escalation.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 9, escalation (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs the "an object you may not see" placeholders: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338, :900–963 as the model). Your R26 is new, before L9. In bio-plane/src/escalation/index.mjs: `#actionsOf` (:378) drops an action `actionRead` refuses (:383; flatMap, never the placeholder) and reports that it did. `#triggers` (:216): R6's note (:274–277) is pushed only for an action the viewer may see. Read visibility once per attachment and share it with `#actionsOf`. `escalationRead` (:415): `history` (:412) drops each trigger id naming a withheld action (`<id>` or `<id>#<ord>`). Answer `out_of_view: true` when anything was withheld. Confirm `#ledger(action, viewer)` answers null for an unseen action, so a trigger's `ids` never carry one. If it does not, filter there too and say so. The same sweep covers every other read answering `actions`, `notes` or `history` (:757, :777, :886; check each). Tests (test/m/escalation/invariants.test.mjs, a new R26 test; withhold one stage-2 action from a viewer with a membership or `actions` proxy as test/m/conformance/reads.test.mjs:63 does): the read holds one fewer action and no null, `JSON.stringify` holds neither the withheld action's id nor "an object you may not see", and `out_of_view: true`. A stage-3 escalation whose withheld action has no clock entry gives that viewer no note naming it. An advance recorded with that action's trigger ids shows the viewer a history entry without them. Negative control: the viewer who sees all gets today's answer byte for byte and no `out_of_view` key. Proof: test/m/escalation/ green; the whole test/m with no new red (action-plans reads `escalationRead`, :1233; re-scan for readers of `actions[].action` and name any in a REPORT). No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## 5. filings (L9; after conformance merges)

**Leaks at HEAD** (`src/filings/index.mjs`):
- :758–760: R9's fact for a null finding is `{finding: null, withheld: "an object you may not see", source}`.
- :941–942: a hidden standard is `{standard: null, withheld: "an object you may not see", source}`.
- :1004–1007: R12's `standard_superseded` with a hidden successor is `by: null, why: "an object you may not see"`.
- :991, :995–996: R12's `determination_flagged` reads conformance **as the machine** (`MACHINE_READER`) and passes its causes whole, so the hidden finding ids of conformance's flag reach the reader.
- :404–405: R3's findings blank counts nulls (`fs.length !== det.findings.length`). That breaks silently once conformance withholds whole.
- :397–403: R3's standards blank reads each standard itself and survives.
- R3's "[UNFILLED: …] … not one you may see" names the template's blank, not the hidden item. It states completeness only and stays.
- **Noted:** a packet's sections are stored at assembly (:1045, :1056) and read back as stored (:1082). A version assembled before the change keeps its stored placeholders (R12, append-only), and the change applies to versions assembled after it.

**Wording. New R27** (not named by any test in `test/m/filings/`): "**R27** (K903 (4), DEC-36) What the reader may not see is withheld whole, as `conformance` R24 answers it, in a draft's blanks (R3), a counsel packet's sections (R9) and its `basis_changed` (R12):
- a finding or standard conformance leaves out is left out of the facts and standards sections, never stood in by a null, and the section states `out_of_view: true`;
- a superseded standard whose successor the reader may not see is named superseded without `by`, and the cause states `out_of_view: true`;
- a flagged determination's causes are those conformance answers the reader, never read as the machine.

R3's blank whose source conformance withheld stays `[UNFILLED: <name>]` with why "… is not one you may see", read from conformance's `out_of_view`, naming nothing of it. Versions already assembled keep their bytes (R12)."

**START (new file `starts-T20/filings.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 9, filings (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs the "an object you may not see" placeholders: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338, :900–963 as the model). Your R27 is new, before L9. Start after conformance's L9 job merges: its R24 answers `determinationRead` with hidden findings and standards left out and `out_of_view: true`. In bio-plane/src/filings/index.mjs: `#det` (:295) carries conformance's `out_of_view` through as `withheld`. R3 (:404–405): the findings blank is unfilled "a finding the determination rests on is not one you may see" when `det.withheld` is true, in place of the count of nulls. Keep the standards arm (:397–403) and its sentence. R9: `#fact` (:758–760) and the standards map (:939–946) no longer emit a `{… null, withheld: …}` item. The facts and standards sections state `out_of_view: true` when `det.withheld` (or a standard read here is refused). R12 `#basisChanged` (:989): read the determination's flag with the reader's `viewer`, not `MACHINE_READER` (:991; supersession is still read so that a superseded determination is named, as today). For `standard_superseded` (:1007), a successor the reader may not see is left out (no `by`, no `why`) with `out_of_view: true` on the cause. Stored versions are not rewritten. Tests (test/m/filings/): in sight.test.mjs, a determination one of whose two findings is hidden from the preparer (a conformance or membership proxy): the draft's `findings` blank is `[UNFILLED: …]` with why matching /not one you may see/, and the packet's facts hold one item, no null, and `out_of_view: true`. Negative control: the preparer who sees both gets the filled blank and no key. In packet.test.mjs, beside :206: a superseded standard whose successor is hidden gives `standard_superseded` without `by` and with `out_of_view: true` (control: visible successor, `by` named, no key). A flagged determination whose flag names a finding the reader may not see gives the reader no cause naming it. Keep prepare.test.mjs:145. Proof: test/m/filings/ green; the whole test/m with no new red (escalation reads `filingsFor`, its :395, and `availableActions`; name any reader whose answer changes in a REPORT). No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## 6. connections (L5, closed): a next-tranche entry

**At HEAD.** `src/connections/index.mjs`:898–920 (`backlinks`, R20) withholds a hidden citer silently. The gate is in the SQL (:906), and the R20 wording ends "No count of what was withheld." This is N303's backlinks half. There are no placeholders. `dangling` (R21, :922–929) is a corpus listing, so it gets no change.

**Wording (amends R20).** Replace "No count of what was withheld." with "A citing bundle the viewer may not see is withheld whole (no id, title, type, state, relation or count), and the answer states `out_of_view: true` when one was, and only that (DEC-36, K903 (4))."

**Proposed `next.md` entry:**
> N4xx · 2026-10-01 · **connections** (K903 (4), DEC-36; N303's rest, N320): `backlinks` (R20, `src/connections/index.mjs`:898) withholds a hidden citer silently. Bob ruled that the incompleteness is stated: add `out_of_view: true` when a citer was withheld (one ungated `EXISTS` beside the gated read), R20 re-worded as drafted in `build/plan/draft-T20-dec36.md` §6. Test: `test/m/connections/edges.test.mjs`:70–74 asserts `hidden.out_of_view === true` with C's id still absent; negative control `r` (:65) has no key. No row. Layer 5 was closed in T20; next tranche.

---

## 7. Also found (layers 7–11 scan): action-plans (L9, not named by K903)

**Scan.** Searched for "you may not see", `UNSEEN`, `: null, says`, `by: null, why` and `map(… visible(id))` over every layer 7–11 module.
- Compliant (one-answer refusals, or DEC-36's own `out_of_view`): intent :956, queue :302–344, queue-producers :263, case-authoring :1898 (writer-withheld acknowledgements, not sight).
- Leaking, other than the five above: **action-plans** only.

**Leaks at HEAD** (`src/action-plans/index.mjs`):
- :218 and :222: R8's liveness of a hidden subject is `{state: "undetermined", says: "an object you may not see"}`.
- :224–225: `successor: null` for a hidden successor.
- :1253–1256: a started option's hidden action is `{id: null, says: "an object you may not see"}`.
- Subject ids themselves reach the reader through `subjectKey` (:1240, `inquiry:<id>`), the option's `...f` fields (:1246) and `available[].determination` (:1259).
- `#support` (:201–206) reads a null finding as `short`. That breaks silently once conformance withholds whole (see "Order" above).
- Subjects are of the plan's project (R1), so this is reached only through a restricted sight rule. The placeholder is in the code regardless.

**Wording. New R35** (not named by any test in `test/m/action-plans/`): "**R35** (K903 (4), DEC-36) In `planRead` (R6), what the viewer may not see is withheld whole:
- a subject, from `subjects`, from each option's `subjects` and `subjects_liveness`, and from `available`;
- a superseded subject's successor (R8 names it only when seen; else no `successor` key);
- a started option's action (no `action` key).

No id, state, placeholder or count. The plan states `out_of_view: true`. A determined subject's support is `short` when conformance withheld a finding it rests on (its R24's `out_of_view`), never computed over the visible findings alone." R8's "(naming its successor)" gains "when the viewer may see it (R35)".

**START, for BOB to place (L9, after conformance; new file `starts-T20/action-plans.txt`).**

> Depth 2. Your entry: build/plan/current.md (T20) layer 9, action-plans (K903 (4), DEC-36; N303, N320): Bob ruled that DEC-36 ("no id, no title, no state, no count") governs the "an object you may not see" placeholders: a hidden item is withheld whole, with at most `out_of_view: true`, exactly as strength R6 does (read build/requirements/strength.md R6 and bio-plane/src/strength/index.mjs:311–338, :900–963 as the model). Your R35 is new and R8 re-worded, before L9. Start after conformance's L9 job merges (its R24). In bio-plane/src/action-plans/index.mjs: `#liveness` (:215) answers `null` for a subject the viewer may not see (:218, :222), and the plan's read drops that subject from `subjects`, from each option's `subjects` and `subjects_liveness` (:1240), and from `available` (:1258–1261). A superseded subject's `successor` key is left out when unseen (:224–225). A started option whose action `actionRead` refuses has no `action` key (:1253–1256). `#support` (:196): when conformance's read states `out_of_view: true`, answer `{support: "short", why: "a finding the determination rests on is not one you may see, so it is not shown to meet the project's bar"}`. Set `out_of_view: true` on the plan when anything was withheld. Tests (test/m/action-plans/, a membership proxy as test/m/conformance/reads.test.mjs:63 builds one): a plan with one of two subjects hidden from a viewer: one subject, the option's subjects and liveness without it, `JSON.stringify` holding neither its id nor "an object you may not see", and `out_of_view: true`. A started option whose action is hidden: no `action` key. A superseded determination whose successor is hidden: `state: "superseded"`, no `successor` key. A determination with one hidden finding: `support: "short"`. Negative control in each: the viewer who sees all gets today's answer and no `out_of_view` key. Proof: test/m/action-plans/ green; the whole test/m with no new red. No row changes (read shape only); nothing awaits stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).

---

## Open points for BOB

1. **`outcomes_differ` and `basis_changed`** (conformance R24): these stay record facts of the determination (strength's pattern), or are computed over what the viewer sees. Drafted as the first.
2. **Reevaluation's untargeted sweep** names a target the viewer may not see, with its state, on a visible dependent's obligation. Is that withheld whole (as strength R6 withholds an unseen leg's member), or a fact of the dependent's leg? The START asks for a REPORT only.
3. **Listings state no `out_of_view`** (the reading above). This is K903 (4)'s scope read narrowly. If Bob meant every answer, R20, conformance R24 and connections change accordingly.
4. **action-plans** is not placed by K903. It leaks the same way and depends on conformance's change. Recommended: place it in L9 after conformance.
5. **L9 order:** conformance merges early. Filings and action-plans start after it, or their R3 and support readings change silently.
6. **Noted for `next.md`:** escalation's trigger reads ledgers through the viewer (a fact that can differ between viewers). Filings' stored packet sections name findings by the assembler's sight (R11's K316 gate bounds who reads them; findings of another project are not re-checked).

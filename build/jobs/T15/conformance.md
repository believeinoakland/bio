# conformance (T15)

**Status** · session_01WyNRCH9tA6azzHVX8phB5R · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings of N345's text, each my best reading; I am building on them now, so an ANSWER that differs changes a few lines.

1. **R21's `standardSide` absent or not `a`/`b`.** R21 says the side is "named by the member, never defaulted" and the Suggestions say `comparisonFacts` "needs `standardSide`", but no code or row is given for its absence. My reading: a new row of this module's, **C-113.28 `STANDARD_SIDE_UNNAMED`** ("Name which side of the question states what the standard requires, a or b. The plane never chooses it. Nothing was written."), asked after R12's `NO_SUCH_CONTRADICTION_INQUIRY`, `awaiting stamp` for T16 like C-113.24–27. (The alternative, answering with no rows, would be a default.)
2. **R22's `recommendation` or `policy` key.** Read like R8's keys: at any depth of the input, compared lower-cased, so a `recommendation` inside a row or the cause is refused too. And R21's rows: a contradiction whose candidate the viewer does not see whole (one side unseen, R10 of contradiction) answers `NO_SUCH_CONTRADICTION_INQUIRY`, the same answer, since answering one side would say that an unseen record exists.

## J2 · COMPLETE

**Entries applied** (on `job/T15/conformance` @ 6522066c1e, from tranche/T15 @ 1b08377623; B2's two readings, K503):
- **N345 · R12.** `comparisonPropose` takes `contradiction?`, the contradiction inquiry the comparison came from (`inquiry.contradictionLink`, its R48). An absent, invisible, non-inquiry or plain inquiry is `NO_SUCH_CONTRADICTION_INQUIRY` (C-113.24), one answer, asked after `PROPOSAL_CANNOT_DETERMINE` and the significance refusal. The link is a row of the new table `comparison_proposal_contradictions` (with the candidate). `comparisonRead` answers `contradiction`, which is null to a viewer who may not see the inquiry. A proposal still carries no outcome.
- **N345 · R21.** `comparisonFacts({contradiction, standardSide, viewer})`. Its refusals, in order:
  - R12's `NO_SUCH_CONTRADICTION_INQUIRY` (C-113.24);
  - then **`STANDARD_SIDE_UNNAMED` (C-113.28)** for a side that is not exactly `a` or `b` (never defaulted, K503);
  - then `NO_SUCH_CONTRADICTION_INQUIRY` again, for a candidate the viewer does not see whole (contradiction R10: its `candidatesFor` answers no candidate), the same answer.

  Otherwise it answers one row, `{requires, did, origin: "record", machine_work: false}`. `requires` is the named side of the candidate as contradiction shows it (its R25) and `did` is the other. Each carries kind, text, note, source, content id, ref, stated date, doctype, capture and stale. The answer also carries `resolution` (the inquiry's, when concluded) and `concluded`, `says` (FACTS_SAY) and `wrote: false`. It has no outcome and no reading. It reads `contradiction` through `contradictionOf` (its K61 factory; the `uses` edge is in modules.json).
- **N345 · R22, R1.** `determine` takes `cause?: {statement, evidence}`. Absent or null is no cause. R1's order after `SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT` is:
  1. `CAUSE_UNSTATED` (C-113.26): a statement that is blank, not text or over 2,000 characters.
  2. `CAUSE_NOT_EVIDENCED` (C-113.25): no evidence; or a blank id or content that is not held; or content in a bundle the author may not see. The last two are answered alike, naming `unresolved`.
  3. `RECOMMENDATION_IS_AN_ACTION` (C-113.27): a `recommendation` or `policy` key at any depth, compared lower-cased (K503).

  Then `NO_SUCH_COMPARISON` and R7's supersession follow, as before. The cause's evidence is bounded at 50 like the act's: `DETERMINATION_TOO_LARGE` with `of: "cause"`. A cause is stored in the new append-only table `determination_causes`. The determination's document gains a `## Cause` section, which reads "Cause not established." when there is none.
- **N345 · R9.** `determinationRead` (and so `determine`'s answer) gains `cause` (`{statement, evidence}`, with evidence the viewer may not see as null) or `cause: null` with `cause_says: "cause not established"`. It also gains `outcomes_differ` (true when the per-standard outcomes are not all the same) and `outcomes_differ_says`, a statement with no duty.
- **Tables (R16).** `determination_causes` and `comparison_proposal_contradictions` are both append-only and declared to record-core's purge in `CONFORMANCE_TABLES`.

**Marks met (K460):** R1's, R9's, R12's, R21's and R22's `*(not yet met: N345)*`. Each is for you to strike.

**Rows added, `awaiting stamp` for T16 (N318):** C-113.24 `NO_SUCH_CONTRADICTION_INQUIRY`, C-113.25 `CAUSE_NOT_EVIDENCED`, C-113.26 `CAUSE_UNSTATED` and C-113.27 `RECOMMENDATION_IS_AN_ACTION`, each with the requirement's translation; and C-113.28 `STANDARD_SIDE_UNNAMED`, with J1's translation (K503). None was moved or retired.

**Ops for control-plane (layer 11):**
- `comparisonfacts`, new: stamp `viewer`. It reads `contradiction` and `standardSide` from the query, else the body. The body's `viewer` never wins (tested).
- `comparisonpropose`: unchanged stamps (`author` as proposer, `viewer`); the body may carry `contradiction`.
- `determine`: unchanged stamps (`author`, `viewer`); the body may carry `cause`.

**Deferred:** none.

**Found in other modules and artifacts:**
- **DEC-49 guard (legacy-tests; requirements wording, yours).** `node civicos-ui/check-refusal-codes.mjs --strict` shows 23 failures here against 22 on tranche/T15. The one new failure is the guard's identical-translation arm: C-113.24's translation, which is R12's table verbatim, is word for word contradiction's C-93.27 `NOT_A_CONTRADICTION_INQUIRY`. My proposal is a different sentence for C-113.24, for example: "No question you can see answers to that id as one taken up from a contradiction, so no comparison starts from it. Nothing was written." I kept the requirement's text; a `CHANGE` with the new wording is a one-line edit here. The other changes are floor slack only: rows, census, reach, regions and the rest each rise by 5 with this module's five new rows. Those floors are legacy-tests' to re-pin.
- **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale for `src/conformance/index.mjs`, `checks.mjs` and `schema.mjs`. Yours at the close. Separately, `node --test bio-plane/test/fleetbundles.test.mjs` fails 1 (agent-worker's 149 inputs recorded) identically on tranche/T15 before this job, so it is not this change (skills' `RECOMMEND_PROMPT` bundle, due at the layer close per the plan).
- **`civicos-ui/` and affordances.** No hits for any code, op or field I added. Affordances' `comparisonpropose` lines (`affordances.mjs`:1057, :2388) still hold, and may add the contradiction link. The new op `comparisonfacts` is in neither of affordances' lists: that is affordances' at layer 11.
- **Possible improvement (content, for BOB).** A leg or extent side answers `text: null` in R21's facts, as contradiction presents it: its ref, content id and capture. The passage's own words are content's `passageText`, which is not in conformance's uses (R21 does not ask for the text). If you want R21's `requires` to carry the passage text, `content.passageText` joins conformance's Uses.

**Tests and checks** (@ 6522066c1e):
- `node --test test/m/conformance/`: tests 46, pass 46, fail 0, todo 0. The new file `contradiction-cause.test.mjs` has 10 tests: R1 and R22's order; R22's three refusals, each with its negative control; the R9/R22 cause read; R9's `outcomes_differ`; the R12 link; R21's facts, side and refusals; and R21's resolution after `contradiction.resolve` (`obligation_against_act`). The one-shape test (R9) and the ops test (R21) are updated. The fixture now builds the real `contradiction` module and forms, proposes and takes up a K1 candidate through its doors. Its stand-ins are the ai-runs run gate and `basis-versions`.
- Users of conformance: `test/m/consequences/`, `actions/`, `filings/`, `escalation/`, `monitoring/` and `test/gate-reads.test.mjs`: tests 200, pass 194, fail 0, todo 6 (their own).
- `format`: 0 failures. `architecture`: 8 product files, 40 relative imports, 0 failures. `coverage`: 22 of 22 live requirement ids, 0 failures. `ownership`: 7 files, 0 failures.

Size (session_01WyNRCH9tA6azzHVX8phB5R): test runs 10, module lines 1462

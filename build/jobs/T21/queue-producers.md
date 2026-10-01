# queue-producers (T21)

**Status** · session_011U9suXK7S9HCghT354bnEM · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R21's recipients ("the members who created the actions that read it, else their projects' owners, else the administrators, as R15's") need each reading action's creator and project. `action-clocks.calendarFactsRead` (its R11, built: `bio-plane/src/action-clocks/index.mjs`:353) answers each path with `actions: [<id>]` only, and none of my Uses reads an action's creator or project (R15 gets both from `overdueClocks`, action-clocks R3, which computes them with its `#createdBy` and `#projectOf`).

My best reading, which I am building now: action-clocks R11 answers each reading action as R3 answers it, `actions: [{action, project, created_by}]` (a small change in action-clocks: the same two private helpers R3 uses), and queue-producers applies R15's rule to each action and takes the union (alice created ACT-1, a machine created ACT-2 in olga's PRJ-1: the item goes to alice and olga). Until that lands, an action answered as a bare id is read as `{action: <id>, project: null, created_by: null}`, so it goes to the administrators. My code reads both shapes, so nothing breaks either way.

If you would rather keep action-clocks closed: the alternative is that Uses gains `conformance.determinationRead` and a record-core manifest read, so this module derives the creator and the project itself. That duplicates action-clocks' rule, which is why I do not recommend it.

A second, smaller point, for queue: R21's key carries no status (`OBLIGATION::local-fact-due::<path>`), yet the item is "raised once per fact and status". I put the status on the subject and the basis (`subject.status`, `basis.status`). Whether a disposition taken while the fact was `unconfirmed` also covers it once `disputed` is for queue's mint to decide. No change is needed here unless you want the status in the key.

## J2 · REPORT

Findings in other modules, and the artifact this job made stale:
1. **Plane bundle stale.** I changed `bio-plane/src/queue-producers/index.mjs`, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`) are stale. I regenerated nothing.
2. **queue (its job after mine).** `Queue.PRODUCER_DEPS` (`bio-plane/src/queue/index.mjs`:97) needs `filingTemplates` and `localFacts`, the dep names this module now reaches lazily (`#filingTemplates`, `#localFacts`). It also needs the two kinds, `template-review-requested` and `local-fact-due`, both OBLIGATION, in its catalogue. The items' own acts are `templatereview` (filing-templates R9) and `factconfirm` (local-facts R1). For R21, see J1's second point (status and dispositions).
3. **action-clocks R11** (J1): `calendarFactsRead` answers each reading action as a bare id. R21's recipients need `{action, project, created_by}`, as R3 answers them.
4. **filing-templates R20** (an improvement, not a flaw): `reviewsRequested` does not answer the template's `scope` (its project). So a `template-review-requested` item is homed under no case, as `export-performed` is. If R20 also answered `project`, the item could be homed under the project the template was drafted in.

## J3 · COMPLETE

**Entries applied** (B1; `build/plan/current.md` T21 layer 11):
- **R20** `template-review-requested` (`#obligationsTemplateReview`): one OBLIGATION per pair `filingTemplates.reviewsRequested({after, viewer})` answers, its cursor followed for at most 20 pages. Keyed `OBLIGATION::template-review-requested::<template>@<version>::<member>`, to that member alone. Its subject is the version, naming its name, kind and asker; it is aged from `asked_at`; its act is `templatereview`.
- **R21** `local-fact-due` (`#obligationsLocalFactDue`): `actionClocks.calendarFactsRead({viewer, now})` gives the paths, then one OBLIGATION per fact `localFacts.factsDue({paths, viewer})` answers. Keyed `OBLIGATION::local-fact-due::<path>`. Recipients are R15's rule applied to each reading action, taken together. Its subject is the first such action, naming the fact, its status and why. It is aged from the dispute, else from the day the confirmation lapsed, else from `due_from`. Its acts are `factconfirm`, then the acts on the action.
- Both modules are reached lazily through deps, `filingTemplates` and `localFacts`, as `#actionClocks` is.
- **N469:** reworded the notes at `index.mjs` :917–922 and :1188–1191 ("the battery", `derivation-bounds.test.mjs`): they now point to `shared.test.mjs`'s R11 (D-480) test, which drives the bound, and the old suites' ceiling stays as provenance. At :1198 (`run-conditions.test.mjs`) the stale claim is dropped; the comment now describes the `runFor` match the code does. The re-scan found :1122 ("asserted in `test/current.test.mjs`"), now pointed to `shared.test.mjs` (R2, a run-less version produces no item). Kept as provenance: the three "converted from" headers, and :1834 ("measured, capturerequests.test.mjs 7d").

**`not yet met: T21` marks met:** R20 and R21.

**Deferred or open:** J1. R21 recipients for an action answered as a bare id need action-clocks R11 to answer `{action, project, created_by}`. Until it does, such an action goes to the administrators. My code reads both shapes.

**Other modules (J2):** the plane bundle is stale; queue's `PRODUCER_DEPS` and kinds; action-clocks R11 (J1); filing-templates R20 could answer the template's project, for homes.

**Tests and checks:**
- `node --test bio-plane/test/m/queue-producers/*.test.mjs`: tests 49, pass 49, fail 0. New file `templates.test.mjs` (R20, R21). `feeditems.test.mjs`'s busy world now covers both kinds for R8 and R10–R13.
- No layer tests are named in `build/manifest.md`.
- format: 0 failures. architecture: 0 failures. coverage: 21 of 21 live ids named, 0 failures. ownership: 5 files, 0 failures.

Size (session_011U9suXK7S9HCghT354bnEM): test runs 3, module lines 2873

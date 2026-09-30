# case-authoring (T15)

**Status** · session_017F7CenwNVr8EttZdzGn7Pc · depth 2 · WORKING · handled B3

## Completion

**Applied** (N345; B2 and B3, K498, K499; on `tranche/T15`, merged in at 6a63e0b4ac):
- **R31, disclosure** (`src/case-authoring/index.mjs`). `publishCase` takes `tensionsDisclosed: [{candidate, words?}]`. After R12 and before R7, `#tensionsRead` asks `contradiction.unresolvedRecordOn({finding, sha, viewer})` for each member at the bytes the act pins (R13), so no refusal draws an id.
  - `TENSIONS_UNDETERMINED` (C-120.3) on `undetermined` or `truncated` (or a thrown read). A document leg with no content row (`undetermined_legs`) is not a failed read: it is stated as unread (`case_tensions_unread`, a body sentence, `tensions_legs_unread` in the answer).
  - `TENSION_NOT_DISCLOSED` (C-120.1) names each undisclosed one. A conflict seen whole is named with both sides. A half-seen one is named only as `{candidate, finding, unseen_other_side: true, says: "in conflict with a record not shown"}`.
  - `DISCLOSURE_NOT_STANDING` (C-120.2) applies only to a well-formed candidate the read does not answer. Any malformed shape is R3's `BAD_COMPLETENESS` naming `tensionsDisclosed`, `tensionsDisclosed[i]` or `tensionsDisclosed[i].words` (K498). An apostrophe is legal. A candidate listed twice is disclosed once.
  - A case is never refused because a conflict exists.
- **R14, the section** (`document.mjs`), in the shape of J1 item 1 plus J2 item 7. `tensions_disclosed`, `tensions_highlighted`, `tensions_depth_stated`, `case_tensions_unread`, `case_tensions` and `case_tension_sentences` are written after `case_conclusions` and are always present. The body gains `## Tensions Disclosed`. Each member's block in `## Findings In This Case` gains one sentence per tension, from `TENSION_TEMPLATES`, attributed "Disclosed by <author> on <instant>". `acknowledged_by` is the `author` stamp (R25).
- **R31's highlight and R33** (DEC-85). A highlighted entry carries only `side_*`, `highlight` (`HIGHLIGHT_SENTENCE`), its state, `acknowledged_by`, the instant and the owner's words. It has no `a_*`, `b_*` or `explanation` field. Its member's block uses the `unseen` template, not the state's own. Sight is the stamped viewer at the act, so a reveal (contradiction R52) widens nothing.
- **R32, `tensionsToDisclose`** (`op=publishtensions`). R2's refusals, then R4's per member, then C-120.3, through the same `#authority`, `#judgeMembers` and `#tensionsRead` that `op=publish` uses. `#authority` and `#judgeMembers` are R2 and R4 lifted out of `#publishCase` unchanged. A highlighted candidate carries `CEREMONY_HIGHLIGHT_SENTENCE`. The answer carries `count`, `highlighted`, `legs_unread`, `depth_stated` and `says` (disclose, never blocked). It writes nothing, and a throw answers C-120.3. No targets answers `[]`, and duplicates are read once.
- **R15.** The answer gains `tensions`, `tensions_highlighted` and `tensions_legs_unread`.
- **R29.** New family `CASE_DISCLOSURE_CHECKS` in `checks.mjs` (K343's pattern), picked up by control-plane's `import * as M_CASE_AUTHORING`. Its `where` values: `#publishCase > is-tension-disclosed`, `#publishCase > is-disclosure-standing`, `#undetermined > is-tensions-determined` (one literal site each).
- **Uses:** `contradiction` (its R29 `unresolvedRecordOn`), reached through `contradictionOf(host)` unless given. The edge is in `modules.json` (K481).

**Check rows (promotion's to stamp, N318): `awaiting stamp` for T16.** Added: C-120.1 `TENSION_NOT_DISCLOSED`, C-120.2 `DISCLOSURE_NOT_STANDING`, C-120.3 `TENSIONS_UNDETERMINED`. None moved or retired.

**Stamps for control-plane (layer 11).** `op=publishtensions` takes `viewer` and `author` from the query, after the body, as `op=publish` does. `op=publish` gains `tensionsDisclosed` in its body; no new stamp.

**Please strike** (my work meets these marks): R14 `*(not yet met: N345)*`, R29 `*(not yet met: N345)*`, R32 `*(not yet met: N345)*`, R33 `*(not yet met: N345)*`, R31's highlight `*(not yet met: N345)*`, and the Status line's N345 fold as met. R14's `/5` holds once publication's `CASE_DOCUMENT_FORMAT` moves (see Deferred).

**Deferred.** None. B4 (CHANGE): `tranche/T15` merged after PUBLICATION #5; R14's todo is now a test. It checks `format: bio-case-document/5`, and reads the tension section back through publication's `caseTensionsOf` (K498): a seen conflict with both sides, a highlighted one with its seen side only, each member's sentences, the unread legs, and an empty section.

**Found in other modules** (also posted as REPORT):
- **review** (its R13, the review copy's dry run of `op=publish`). Its draft params carry no `tensionsDisclosed`. A dry run over a case with an unresolved duty on it will now answer C-120.1, so its missing-list shows that refusal instead of the case. Review's fixture stubs `publishCase`, so its 30 tests still pass. What its drafts should carry is N345's DEC-80 part.
- **civicos-ui** (`civicos-ui/app.html`, the publish ceremony, legacy-tests' per K458 for its tests). It sends `op=publish` with no `tensionsDisclosed` and never calls `op=publishtensions`. A publish over a case with a standing duty will be refused C-120.1 until the ceremony's DEC-80 step is built. Grep of `civicos-ui/` and `affordances.mjs` for the new codes, `publishtensions`, `tensionsDisclosed` and C-120: no hit. Affordances' `publish` entry (`affordances.mjs`:1469) is unchanged.
- **Generated artifacts:** none made stale (no bundle takes case-authoring's files).

**Tests and checks** (from `bio-plane/`, `node --test`):
- `test/m/case-authoring/`: tests 53, pass 53, fail 0, todo 0 (after B4). The new `tensions.test.mjs` runs over the real contradiction module (candidates laid through `pairs`, `propose`, `clarify`, `takeUp` and `optIn`), with stand-ins only for a failed, truncated, leg-unread or irreconcilable read.
- `test/m/review/`: tests 30, pass 30, fail 0. `test/m/control-plane/`: tests 52, pass 52, fail 0 (the modules using mine). After B4: `test/m/ratification/`: tests 74, pass 73, fail 1, the accepted `checks.test.mjs`:133 (K500), not mine. `test/m/publication/`: pass 100, fail 0. `test/m/review/`: pass 30, fail 0.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … case-authoring`: 13 product files, 62 relative imports (63 after B4); 0 failures. `coverage.mjs … case-authoring`: 33 of 33 live requirement ids named by a test; 0 failures. `ownership.mjs … case-authoring tranche/T15`: 8 files; legacy-store and legacy-checks 0 added, 0 removed; 0 failures.

Size (session_017F7CenwNVr8EttZdzGn7Pc): test runs 21, module lines 2610

## J1 · QUESTION

Best readings, which I am building on now; the first one is shared with PUBLICATION #5 (its R10 reads what my R14/R31 write), so please relay or rule.

1. **The tension section's frontmatter shape** (restricted grammar: arrays of flat objects only). Written after `case_conclusions:`, always present in a `/5` document (empty list when nothing is disclosed):
   - `tensions_disclosed: <n>`, `tensions_highlighted: <n>`, `tensions_depth_stated: "<the one-level sentence>"`
   - `case_tensions:` one entry per disclosed candidate: `candidate`, `finding`, `state` (`open` | `explained_not_shown` | `taken_up` | `resolved`), `kind` (`irreconcilable` or null), `unseen_other_side` (true|false), `depth: 1`, `acknowledged_by`, `acknowledged_at`, `words` (the owner's, quoted, or null), `explanation` (quoted or null); for a fully seen one `a_kind`, `a_text`, `a_source`, `a_date`, `a_doctype`, `a_capture`, and the same `b_…`; for a highlighted one only `side_kind`, `side_text`, `side_source`, `side_date`, `side_doctype`, `side_capture` (the seen side) and `highlight: "<R31's fixed sentence>"`. `a_source`/`side_source` is the source's bundle or inquiry id (the text is `fmSafe`d, printed verbatim in the body).
   - `case_tension_sentences:` one entry per sentence: `target` (the member), `candidate`, `template` (`in_tension` | `explained` | `irreconcilable` | `unseen`), `sentence` (quoted).
   The body gains `## Tensions Disclosed` after `## The Conclusions This Case Records`. The format string stays publication's `CASE_DOCUMENT_FORMAT` (it becomes `/5` when PUBLICATION #5 merges; I merge the tranche then and my `/5` test goes green; until then it is a `test.todo` naming that cause).
2. **Malformed `tensionsDisclosed`** (R31 names no refusal): absent or null is `[]`; a non-array, or an entry that is not an object naming a `candidate` string, is `DISCLOSURE_NOT_STANDING` (C-120.2) naming `ord`; `words` over 2,000 characters or holding a quote, backslash or line break is R3's `BAD_COMPLETENESS` with `field: tensionsDisclosed[i].words` (the grammar has no escapes), asked in R31's step. A candidate listed twice is disclosed once.
3. **What counts as "a read that fails" (C-120.3):** `unresolvedRecordOn` answering `undetermined: true`, `truncated: true`, or a non-zero `undetermined_legs` (a leg whose referent could not be read is a read not made whole).
4. **R31's place:** right after R12 and before R7's derivation (which draws an id), so C-120.1–C-120.3 draw no id.
5. **R32 with no targets** answers an empty list rather than R3's `NO_TARGET` (R32 names only R2's and R4's refusals); duplicates are read once. R1's machine fence is not asked (R32 names only R2's), but R2's owner test needs the `author` stamp.
6. **Op stamps for control-plane:** `op=publishtensions` takes `viewer` and `author` (as `op=publish`). `op=publish` gains `tensionsDisclosed` in the body only.

## J2 · QUESTION

Replaces J1 (items 1, 2, 4, 5, 6 unchanged; item 3 revised, item 7 added).

3. **What counts as "a read that fails" (C-120.3):** `unresolvedRecordOn` answering `undetermined: true` or `truncated: true`, as R31 says, and nothing more. Its extra `undetermined_legs` (a document leg with no content row, so no passage-level referent to look for a conflict on) is NOT a refusal: treating it as one refused every case resting on a whole-document leg (my own R17 fixture). It is stated instead (R26): frontmatter `case_tensions_unread:` (`- target`, `legs`) and a body sentence per member, and the answers carry `tensions_legs_unread` / `legs_unread`.
7. **Frontmatter additions for PUBLICATION #5** beyond J1 item 1: `case_tensions_unread:` as above, between `tensions_depth_stated` and `case_tensions`. The answer of `op=publish` gains `tensions`, `tensions_highlighted`, `tensions_legs_unread` (R15's list, a wording for BOB).

## J3 · REPORT

Two modules' behaviour meets C-120.1 once this merges (details in my record's Completion):
- **review** (R13, the review copy's dry run of `op=publish`): drafts carry no `tensionsDisclosed`, so a dry run over a case with a standing duty answers C-120.1 in the missing-list. Its fixture stubs `publishCase`; its 30 tests pass.
- **civicos-ui** `app.html`'s publish ceremony sends no `tensionsDisclosed` and never asks `op=publishtensions`: a publish over a case with a standing duty is refused C-120.1 until N345's DEC-80 step is built.
No hit for the new codes, op or rows in `civicos-ui/` or `affordances.mjs`. No generated artifact made stale.

## J4 · COMPLETE

Complete: N345 R14 (section; /5 a todo on PUBLICATION #5's merge, K498), R31, R32, R33, R15's fields, C-120.1–C-120.3 (awaiting stamp, T16). Checks 0 failures; case-authoring 52 pass 0 fail 1 todo; review, control-plane green. Record's Completion has the marks to strike, the stamps for control-plane and the reports.

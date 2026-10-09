# basis-versions (T41)

**Status** · session_01JYn5FgkG5v9aRRBB74jGmo · depth 2 · WORKING · handled B4

## J1 · QUESTION

R48: my reading, on which I am building now. Five points the requirement text leaves open:
1. **Storage in the row.** The restricted frontmatter (record-grammar `parseFrontmatter`) has no list of objects inside a row, so `bias_applied` cannot sit in a `conclusions[]` row as written. I write each entry as numbered scalar keys on the row (`bias_1_statement`, `bias_1_effect`, …, in the member's order), plus `bias_statements_sha` (bias R49's sha of the lens checked, which R49 says a caller records). `conclusionRecordOf` reads them back as `bias_applied: [{statement, effect}]` and `bias_lens_sha` on a `concluded` row (`[]` and null when none). inquiry-grammar R18 has the same problem on a `basis[]` leg; nothing is pushed on its job branch yet. If BOB wants one encoding for both, say which and I follow it.
2. **Shape.** On a conclusion, `effect` is `inference_refused` or `scrutiny_raised` only. `from` and `to` belong to `grade_lowered`, a leg effect, so they are refused here, as is any unknown field. `statement` is a non-empty string the frontmatter can hold verbatim: at most 200 characters, with no quote, backslash, newline or `#`. At most 32 entries, and no statement–effect pair given twice. A malformed list is refused `BAD_BIAS_APPLIED`, beside `BAD_COMMENTARY` in R16's order and like it with no check row, naming the entry. It does not use inquiry-grammar's `BIAS_APPLICATION_MALFORMED`, which R18 places inside `BASIS_REFUSED` for a leg.
3. **No project.** R48 says "at the conclusion's project scope" and "read back by `conclusionRecordOf`" (a project's record), so only a project's conclusion carries `bias_applied`. A non-empty `bias_applied` without a project is refused `BAD_BIAS_APPLIED`, as commentary without a project is refused. The inquiry's own bytes are never touched.
4. **The in-force check** runs after every R16/R17 refusal and NO_BASIS, just before the write: `bias.statementInForce({statement, scope: {type: "project", id}, viewer})`, the acting member's viewer. The first statement whose `in_force` is not `true` is refused through `inquiry.biasNotInForce({statement, where})`. If it returns a refusal (`ok: false`), I answer that refusal with `target` and `project` added. If it returns a finding row, I answer `{ok: false, reason: "BIAS_APPLICATION_NOT_IN_FORCE", findings: [row]}`. Nothing is written either way. `biasNotInForce` does not exist yet: until inquiry merges, I reach it through a namespace import, with a bridge that gives the same code. I remove the bridge at the CHANGE that brings inquiry R61.
5. **The op:** `op=conclude` takes `bias_applied` from the body (an array), or from the query as JSON.

## J2 · COMPLETE

Completion, T41-19 (basis-versions), on tranche/T41 merged at 15ec91ff1f (K2479).

**Applied.**
- R48 (D59; K2472, K2479). A project's conclusion carries `bias_applied` (`inference_refused`, `scrutiny_raised`), written on its `conclusions[]` row as `bias_<n>_statement`/`bias_<n>_effect` (n from 1, contiguous) with `bias_statements_sha`. `conclusionRecordOf` (and so `conclusionOf` and `op=basisversions`' `conclusion_history`) reads it back on each `concluded` row as `bias_applied` and `bias_lens_sha` (`[]` and null when none; a withdrawal row carries neither). Each statement is asked of `bias.statementInForce` at `{type: "project", id}` with the acting member's viewer. The first statement not `true` (false or null) is refused through `inquiry.biasNotInForce`, reached through a namespace import; until inquiry merges, a bridge gives the same code `BIAS_APPLICATION_NOT_IN_FORCE`, naming the statement, project and target. Nothing is written. A malformed list, or any list without a project, is `BAD_BIAS_APPLIED`, placed after `BAD_COMMENTARY`. `op=conclude` reads `bias_applied` from the body, else its JSON from the query. The bias instance is reached on first use (`deps.bias`, else `biasOf(host)`), so this module's start creates none.
- D54. `t20-figures.test.mjs`:74 and :131 re-stated: the founder and an active administrator, not invited, are outside a hidden project's contents. Negative controls: the project set discoverable is counted whole for both and still not for an outsider; set hidden again, both are outside; an invited administrator is counted whole while the founder is still outside. `project-discoverable.test.mjs` was green against the merged tranche (5/5), so it is not re-stated.
- Own flaw fixed: `checks.mjs`, UNSPLICEABLE_CONCLUSIONS' comment sat above NOTHING_TO_WITHDRAW's row; moved back above its own.

**Deferred, for the CHANGEs BOB named.** At inquiry-grammar's CHANGE, the local encoding (`conclusionBiasApplied`, `biasAppliedIn`, `appendConclusionEntry`'s pair lines) moves onto its `flattenBiasApplied`/`readBiasApplied`/`biasAppliedFindings` with `effects` (K2479). The key names and caps (32 entries, 200 characters) are already the same, so stored rows do not change. At inquiry's CHANGE, the `biasNotInForce` bridge is removed.

**Final uses:** unchanged from `modules.json` (it already lists `bias`). `inquiry-grammar` and `inquiry` are already listed.

**Other modules.** queue-producers has 3 reds, identical with and without this change: inherited, not mine. Users of `conclusionRecordOf`, whose rows gained two fields, all pass: retrieval 168/168, queue 128/128, ratification 220/220, contradiction 119/119, project-stage 23/23.

**Reading (K2304).** Measured set: code 236 KB plus tests 265 KB, over 300 KB, so option (3). Read whole myself: the requirements; layer 6's row of `build/layers.md`; `index.mjs`, `text.mjs`, `schema.mjs`; `fixture.mjs`, `conclude-project.test.mjs`, `t20-figures.test.mjs` and `project-discoverable.test.mjs`; inquiry-grammar R18, inquiry R61, bias R49; and bias's `statementInForce`, factory and file header. A worker read the rest whole: `checks.mjs`, `grammar.mjs` and 14 test files. Its summary is 18 KB, each statement citing file:line. Nothing it left out mattered. It flagged the pinned top-level keys of `op=basisversions` (`current.test.mjs`:54), which is why `bias_applied` stays inside the history rows.

**Tests and checks.** `node --test test/m/basis-versions/`: 136/136 (131 before, plus 5 new in `conclude-bias.test.mjs`, R48 with negative controls). Layer tests: none named in the manifest. format: 145 modules, 0 failures. architecture: 26 product files, 0 failures. coverage: 45 of 45 live ids, 0 failures. ownership: 7 files, 0 failures.

Size (session_01JYn5FgkG5v9aRRBB74jGmo): test runs 14, module lines 3710

## J3 · COMPLETE

Completion after CHANGE B3 (inquiry-grammar merged, K2491), on tranche/T41 merged at 0f747c0f4b.

**Applied.** R48 now runs on inquiry-grammar R18's one encoding (K2479).
- **Write:** `appendConclusionEntry` writes the row's keys through `flattenBiasApplied`, plus `bias_statements_sha`.
- **Read:** `conclusionRecordOf` reads the row through `readBiasApplied`.
- **Shape check:** `biasAppliedFindings` judges the list, with `effects` `inference_refused` and `scrutiny_raised` and `checkId` C-25.35. Each departure is carried in the refusal's `findings` (code `BIAS_APPLICATION_MALFORMED`).
- **Local copies removed:** my own shape checker, reader and caps are gone. The stored form is unchanged. One change: a statement holding an apostrophe is now refused too, as R18's check refuses it.

`BAD_BIAS_APPLIED` is a `CONCLUDE_ACT_CHECKS` row, C-25.35, with its translation, carried with its code wherever it is answered, including the no-project arm. R16 still places it as `BAD_COMMENTARY`.

**For BOB's text:** R35's list should gain C-25.35 (it reads C-25.1–C-25.34). The R35 test pins C-25.1–34 over the version catalogues only, so it holds; R48's test names C-25.35.

**Still deferred:** the `biasNotInForce` bridge, until inquiry's CHANGE.

**Final uses:** unchanged, as `modules.json` stands.

**Tests and checks.**
- basis-versions: 136/136.
- inquiry-grammar 76/76; users of `conclusionRecordOf`: retrieval 168/168, queue 128/128, ratification 220/220, contradiction 120/120, project-stage 23/23.
- queue-producers 77/80: its 3 reds are the inherited ones, unchanged by this job.
- Process checks: format 0, architecture 0, coverage 45/45, ownership 0 failures.

Size (session_01JYn5FgkG5v9aRRBB74jGmo): test runs 18, module lines 3711

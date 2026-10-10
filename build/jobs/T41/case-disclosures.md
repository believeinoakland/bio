# case-disclosures (T41)

**Status** · session_01LY8Zq25Bmbg74LWk3TRP5f · depth 2 · WORKING · handled B3


## Completion

**Entry T41-42 applied** (was T40-16; N798, N811; D56–D59, D63; DEC-185, DEC-187, DEC-188 (7); K2471, K2472, K2483, K2531, K2533):
- **R6** every photo carried is labelled. A copy with nothing to obscure carries `PUBLISHED_LABEL`, replacing K2291's null. A photo's `obscured` is `{copy, label, marked, label_key}`, and a member document's is `{copy, label: COPY_CLEANED_LABEL, label_key: "document.cleaned.label"}` (K2483, K2531: `label_key` on every copy, the words staying case-carriage's). `index.mjs` `photoLabel`; `PUBLISHED_LABEL` is read off case-carriage's namespace until its T41-35 entry exports it, null meanwhile.
- **R7** a photo's row carries `marked` (`materials.mjs` `materialRows`). `label_key` is not written, since case-grammar R12 has no field for it.
- **R29** `words` is `PUBLISHED_LABEL` for a copy with nothing to obscure. The gate and camera sentences stay the screens' words.
- **R22** `photo.refused.unchecked` is re-worded to words.json's DEC-187 (1) text, the old words gone (B3 (b)). `document.refused.clean` and `.pending` are words.json's, read by key, verbatim. Seven new rows, numbered provisionally in R30's order until T42's stamp, translations drafted: C-120.23 `ACCOUNT_SENTENCE_UNSUPPORTED`, .24 `ACCOUNT_FACT_NOT_IN_CITED`, .25 `ACCOUNT_CONTRADICTED_BY_RECORD`, .26 `ACCOUNT_BIAS_NOT_PRINTED`, .27 `ACCOUNT_CLAIM_NOT_BIAS`, .28 `ACCOUNT_FLAG_UNANSWERED`, .29 `ACCOUNT_CHECK_UNDETERMINED` (K2531 (2)). `ACCOUNT_ARMS` is exported. R31's refusal is inquiry's C-2.19, so no C-120 row (K2531 (4)).
- **R30** `accountJudged({account, statements, cited, lens, conclusions, flags, viewer})`:
  - `printed` comes from `bias.statementInForce` at `lens`, asked as the viewer.
  - It calls `caseChecker.checkAccount` with K2531's answer shape. Departures are answered in arm order, one refusal per code naming its sentences.
  - The first arm applies to account sentences only (K2533).
  - A check that cannot be run fails closed with C-120.29.
  - `account_check` flags are judged here: answered by removing the sentence or by evidence it did not cite.
  - A malformed list is `BAD_COMPLETENESS`.
  - New deps: `bias`, read lazily through `biasOf`, and `caseChecker`, defaulting to case-checker's module.
- **R31** `biasApplicationsOf(prepared, viewer, conclusions?)`:
  - It answers case-grammar R24's rows for every reached finding's legs (`readBiasApplied`), as the viewer sees the record.
  - It also answers the caller's conclusion applications (K2531), with no `ord` and `target` the finding.
  - In-force is inquiry's own `biasAppliedFindings` (R61), never re-derived. A test that cannot be had refuses through `biasNotInForce`, fail closed.
  - A finding whose document is unreadable is stated in `unread`.
- **Own flaw fixed:** `accepted.mjs` `flagsJudged` threw on an edition with no refs or on a flag that is no object (R23). It now states less (test in `imported.test.mjs`).

**Final `uses`:** unchanged from `modules.json` (`case-checker`, `bias` and `run-rules` already there). No `answers` edge, since my code does not import it. No `basis-versions` edge (K2531 (3)).

**Deferred:** none.

**Found in other modules (REPORT in J2):**
1. case-authoring's suite, with my change against `tranche/T41`'s:
   - new red: `invariants.test.mjs`:76 (assert :97) pins C-120 to .22, and the family now runs to .29;
   - changed cause: `preflight.test.mjs`:67 (assert :69) was red for the old `photo.refused.unchecked` words and is now red for the C-120.23–.29 rows it pins;
   - cleared: `photos.test.mjs`:101;
   - red on both, not mine: `converts`:174, `statement`:59, `whatchanged`:154.
   - case-authoring's job takes them.
2. answer-envelope `families.test.mjs`:250 now also counts C-120.23–.29 (T41-60's re-pin, K2428). Its :49 and :374 are red without my change too.
3. Row census: C-120.19 changed and .23–.29 arrived (rule 4 (2), until T42's stamp).
4. The plane bundle is staled (rule 4 (14)).
5. `document.mjs` `carriesBodyLines` prints a material carried as its copy as "NOT INCLUDED: only its fingerprint, origin and archived copy travel", with no label. The signed body does not say the copy travels or show its label. R7 governs only the rows, so this is a gap against DEC-185 (1)'s intent, not a breach. Printing it only when `obscured` is set keeps every pinned hash. That needs requirement text first.
6. words.json `document.refused.pending` is `protected: false` (J1 (5); noted to UX-DESIGN by BOB).

**Waiting on providers** (build against requirements, per START): 3 tests of `photos.test.mjs` are red until case-carriage (T41-35: R11's `OBSCURED_LABEL` words and `PUBLISHED_LABEL`) and case-grammar (R12's `marked` read back) merge. They are `:46` R22 (label words), `:66` R6 (`PUBLISHED_LABEL`) and `:252` R7 (the round trip of `marked`). Every other test is green. I re-run them on the CHANGE that brings those merges.

**Reading set (K2304, START step 3).** My own code and tests alone are 374 KB, over 300 KB, so step (3) applied.
- **Read whole myself:**
  - `requirements/case-disclosures.md`;
  - layer 8's row and its split section of `layers.md`;
  - `index.mjs`, `materials.mjs`, `checks.mjs`;
  - `photos.test.mjs`, `documents.test.mjs`, `fixture.mjs`;
  - the services my entry uses: case-carriage R10, R11, R14–R16; case-checker R24; bias R49 (with `statementInForce`); inquiry R61 (`biasNotInForce`, `biasAppliedFindings`); run-rules R25; case-grammar R12, R23, R24; public-read R3; answers R33; inquiry-grammar R18; basis-versions R48;
  - each module's Purpose;
  - K2394, K2400, K2451, K2471, K2472, K2483, K2531, K2533.
- **Read in part myself:** `seam.test.mjs`, its R22 and R23 parts (lines 1–250).
- **Read by a worker, whole:** `accepted.mjs`, `people.mjs`, `document.mjs`, and the tests captures, imported, people, tensions, hunch, seam and carries. Its summary is about 8 KB, every statement citing file:line. It covered each file's exports and tests, every assertion my change could break, R23's service enumeration in seam, and flaws.
- **Did anything left out matter?** No. The summary's two flaws are handled (`accepted.mjs`:75 fixed; `document.mjs` reported above).

**Tests and checks run:**
- `node --test bio-plane/test/m/case-disclosures/*.test.mjs`, file by file: pass 99, fail 3 (the three above).
- No layer tests are named in the manifest.
- case-authoring's suite, compared above.
- answer-envelope `families.test.mjs`: pass 10, fail 3. Row census: fail 1, as above.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs bio case-disclosures`: 17 files, 0 failures.
- `checks/coverage.mjs bio case-disclosures`: 31 of 31 live ids named, 0 failures.
- `checks/ownership.mjs bio case-disclosures tranche/T41`: 9 files, 0 failures.

Size (session_01LY8Zq25Bmbg74LWk3TRP5f): test runs 12, module lines 2,374

## J1 · QUESTION

Five readings I am building on now; none stops the job. Tell me where any is wrong.

1. **R30's `checkAccount` answer (case-checker R24).** R24 fixes its input (`{account, cited, printed, conclusions}`), not its answer, and case-checker's job has not built it yet. My reading: `{ok: true, departures: [{ord, code, detail?}]}`, one entry per sentence and arm that fails, `code` one of R30's five, `ord` the `account:` row's ord (R23); malformed input `{ok: false, reason, field}`. I group departures by code in R30's arm order, each refusal naming its sentences. Please fix the shape with CASE-CHECKER #10, so both jobs build the same one.
2. **A check that cannot be run** (no `checkAccount`, a throw, `ok: false`, or another shape). R30 names no code for this, and R23 says fail closed. My reading: a new C-120 row `ACCOUNT_CHECK_UNDETERMINED`, alone, naming every sentence (as C-120.3 and .12 are, translation BOB's draft): "The account could not be checked against what it cites, so whether every sentence stands is not known. Try again. Nothing was written." Or name another code.
3. **R30's inputs.** `cited` comes from the caller, as the viewer reads it (answers R33's `{holdings, rules, looks}`). `printed`: each `bias_statement` of the account asked of `bias.statementInForce` at `lens` (R49's scope shape); answers that are in force are the printed set. `conclusions`: no module in my Uses holds them (they are basis-versions' `conclusionRecordOf`, on the project's document). My reading: the caller passes `conclusions` beside the rest (case-authoring R4 already reads each member's concluded state), so I add no `basis-versions` edge. The `account_check` flags are also stored by no module I use. So the caller passes `flags: [{kind: "account_check", ord, text, cites}]`, `kind` checked against run-rules' `DRAFT_KINDS`. A flag is answered when no sentence of the account still has its text (removed), or that sentence now cites something it did not cite when flagged (tied to evidence). Otherwise it is `ACCOUNT_FLAG_UNANSWERED`, naming the sentence. The arg list grows to `{account, statements, cited, lens, conclusions, flags, viewer}`, and `statements` holds the four statements as R23 rows of their kinds.
4. **R31's refusal and R22.** inquiry R61 (K2472) makes `BIAS_APPLICATION_NOT_IN_FORCE` inquiry's row, C-2.19, with `biasNotInForce` its one spelling (K231), but R22 says R31's codes are new C-120 rows. My reading: R31 answers inquiry's refusal verbatim (`check` C-2.19, its translation, `ok: false, reason` added), and the C-120 table gains no row for it; only R30's six codes (and item 2's, if you agree) are new C-120 rows. R31 runs the test through inquiry's own public `biasAppliedFindings({legs, project, viewer})` (R61's body), so nothing is re-derived. That covers each reached finding's legs, at its document's `project` scope. A conclusion's applications live on the project's document (basis-versions R48), which I do not read. I leave them to the caller as for item 3; or I take a `basis-versions` edge if you rule so.
5. **`label_key` (K2483).** I answer `label_key` on every `obscured` R6 answers, not only a member document's: `photo.obscured.label` for a marked photo's copy, `photo.published.label` for one with nothing to obscure, `document.cleaned.label` for a member document's copy (public-read R3's three). `case-grammar` R12's rows do not carry it, so R7's rows stay `{copy, label, marked}` (photo) and `{copy, label}` (document). Also, `words.json` holds `document.refused.pending` with `protected: false`, while your START says "protected". I read it verbatim and assert its flag as words.json states it. The UX stream may want to look at that.

# public-read (T47)

**Status** · session_01PyZUxneDWk85UCvAXSGjDW · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**T47-29 applied on `job/T47/public-read`** (B2 applied: `tranche/T47` merged after case-grammar's merge; head pushed).

**How the reading set was read (mechanics §17; B1).** I read these whole myself: `build/requirements/public-read.md`, all module code (`src/public-read/*.mjs`, `src/publication/worker.mjs`, `src/container.mjs`, `src/inband.mjs`), and the tests I changed (`published`, `label-key`, `court-orders`, `dec149`, `record-word`, `relay`). Two helpers in this session read the rest in full and wrote digests citing each section, from my entry:
- (a) every other file under `test/m/public-read/` (32 tests and `fixture.mjs`);
- (b) `build/layers.md` whole (layer 8's contract and the general rules), plus each used module's Purpose and the ids my Uses names (record-grammar, signatures, ooxml, case-grammar incl. R31, publication, docket, case-carriage incl. R22, record-core).

The sources stay binding. I read my own code and tests whole: myself where listed, the rest through the helper.

**Entries applied**
- **R35 (N953).** `labelKeyOf` keys a copy by the signed row's `obscured.kind` (case-grammar R31):
  - `document` → `document.cleaned.label`;
  - `photo` → R3's marked rule;
  - no kind (or a kind the writer wrote null) → `document.cleaned.label` only under the frozen words `CLEANED_LABEL_AT_MARKER` (exported; equal to case-carriage's draft), else the photo rule.
  - The code import of case-carriage is gone. The signed label is answered as signed.
  - Tests (`cleaned-key.test.mjs`, store and Worker, through case-grammar's own writer):
    - kind document under today's words, the frozen words and a re-wording → cleaned;
    - kind photo under the cleaned words → photo key;
    - pre-T47 rows: only the frozen words, whole, key cleaned (a re-wording, one character short, or upper case keys a photo);
    - another kind is written null and falls back alike;
    - a material carried whole has no key.
  - On the old code the first arm fails: a re-worded label keyed as a photo.
- **N954, deepened.**
  - **R10, R14** (`public-path.test.mjs`): every public route answers byte- and status-identically before and after the world gains working material. That is the store's ops, the Worker's `publishedcase` and `publishedbytes` (raw and zip), and the door's own ops including credit, over every id and every hash. The working material is an edited finding, an unpublished inquiry, two unsigned case documents, and a captured document and its capture. Every unpublished hash answers on every hash route as a never-existed hash does. A published hash is the control.
  - **R11:** a walk of every answer that can carry a pair finds pairs only per member and per axis:
    - every store op; the Worker's `publishedcase`; `casefilefacts`;
    - a `/6` case file's manifest and every JSON file in every part, read back from the zip;
    - with a CASES_DISAGREE row present;
    - negative controls planted.
  - **R28 "wherever served"** (`court-orders.test.mjs`):
    - A whole removal is withheld (451) on every file the case file lists, on the manifest raw and as every part's zip, and is marked on both the Worker's and the store's publishedcase. The withheld document's scope and the findings' titles are absent from every answer: publishedcase by case, finding and hash, the manifest, the list, and editions.
    - A seal over each single file in turn withholds it at its hash, in its part, and on the listing (with its same-hash twins, one object). Nothing at another hash is affected, and the unseal restores each.
  - **DEC-149** (`dec149.test.mjs`) and **K899** (`record-word.test.mjs`): a walk of every sentence the module serves, gathered once by `served.mjs` (over 200 sentences). That covers every store, Worker and door route; both packagings (the case file and the pre-`/6` container, read back as served); the in-band quartet; every refusal the pure halves answer; a court-ordered edition; and every row of the table. Negative controls are planted.
  - **`relay.test.mjs`** names each relay by its behaviour, never a Worker line. The inner relay also asserts that no half-rendered case is served.
- **Own flaws fixed (P8):**
  - `lowercase.test.mjs`' `withheldOf` arm compared two empty maps; it now runs under an order.
  - `sampling.test.mjs`' editions-dates arm could pass on no row; it now counts.
  - `dec149.test.mjs`' comments cited stale source line numbers.
  - `obscured.test.mjs:156` and `:366` now expect `kind: null` (B2).

**Deferred.** None of this entry. The required-argument shape `"<64 lowercase hex>"` stays as reported at T46.

**For BOB (REPORT items)**
1. **`modules.json` edge public-read → case-carriage.** No code of public-read uses case-carriage now; only tests import its words, as fixtures. The requirements' Uses names none, so the edge can go. Not changed: modules.json is not mine to write.
2. **R3's photo rule, as worded,** says marked "whose signed label is not null **or** whose row states it marked". Since T40 an unmarked copy's `PUBLISHED_LABEL` is not null, so read literally it contradicts the unmarked arm. The code and R35 follow case-grammar R12's `marked`, where the stated mark wins, else the label. Suggest R3 say "by `case-grammar` R12's `marked`". Also, "(proposed, `case-carriage` R15)" beside `document.cleaned.label` is stale.
3. **R35 names "a row stating no kind (pre-T47)".** A post-T47 row whose kind the writer wrote null reads the same and falls back the same, which the test pins. The text could say so.
4. **case-disclosures** still builds `obscured` as `{copy, label: COPY_CLEANED_LABEL, label_key}` with no `kind` (`src/case-disclosures/index.mjs`, its T47 job per case-carriage R22). Until it hands `kind`, new editions key by the frozen-words fallback. That is correct, unless the label is re-worded before that job lands.
5. **Generated artifact:** `case-checker`'s committed `program.mjs` is stale on `tranche/T47` itself (its R13 test is red there and here alike), after case-grammar's merge. Not made stale by me; for the layer close.

**Tests and checks run** (on head after the B2 merge)
- `node --test test/m/public-read/*.test.mjs`: 196 tests, 196 pass, 0 fail.
- Users of public-read: network-notices 73/0, ratification 233/0, filings 97/0, instance-setup 157/0, control-plane 242/0. Inherited reds:
  - case-checker 79/1 (program.mjs, item 5);
  - op-declarations 144/12;
  - answer-envelope 32/1;
  - plane 221/2.
  - Each red failure, by name, is the same on `origin/tranche/T47` in a separate worktree.
- `checks/format.mjs`: 0 failures. `architecture.mjs bio public-read`: 0 failures. `coverage.mjs bio public-read`: 35 of 35, 0 failures. `ownership.mjs bio public-read tranche/T47`: 12 files, 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (3087 files), channels 0. Coverage has 42 failures, all other modules' (screens-*, setup-words, signin-door, tasks, wizard-scripts and others); none is public-read's.

Size (session_01PyZUxneDWk85UCvAXSGjDW): test runs 27, module lines 3664

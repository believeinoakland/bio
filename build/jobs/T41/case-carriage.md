# case-carriage (T41)

**Status** · session_01PJqPaLJoAV9fTX9bSpNA4s · depth 2 · RUNNING until 2026-10-10T17:41:34Z (users' suites, tranche vs job) · handled B0

## Completion (T41-35; CASE-CARRIAGE #7)

**Reading set (mechanics §17; K2304).** START measured 431 KB. My module's code and tests are 257 KB, and with my requirements (30 KB) and the used services' public parts the set is over 300 KB, so I followed step (3). I read these whole myself:
- my requirements;
- layer 8's row of `build/layers.md`;
- `checks.mjs` and `index.mjs`, the code my entry changes;
- the tests my entry changes: `marks`, `withdraw`, `documents`, `invariants` and `fixture`;
- the used services my entry calls: provenance `onReceipt`; scheduler R23's fault shape (`#fault`, `faults()`), which R18 names; membership R43, R44, R77 and R85, for D54.

One worker read `schema.mjs`, `archive`, `hold`, `obscured` and `rereads` whole and wrote a summary of about 9 KB, citing file and line throughout. It found that none of those files uses the founder, a project, `copyWake`, `onReceipt`, `faults()` or a C-141 translation. It flagged that `materialsLines` must carry the new label's comma, and the obscured round-trip test passes with it. Nothing the summary left out mattered.

**Entries applied.**
- **R11 (N798, N811; DEC-185 (1), DEC-187 (2)).** `CASE_CARRIAGE_WORDS` holds `words.json`'s words, each `en` verbatim and read by key:
  - `OBSCURED_LABEL` is `photo.obscured.label`;
  - `PUBLISHED_LABEL` (new, exported) is `photo.published.label`;
  - a derived copy's stored label is `OBSCURED_LABEL` when it covers an area, else `PUBLISHED_LABEL`. An uncovered copy had no label before.
  - `COPY_CLEANED_LABEL` is now read by key too, from `document.cleaned.label` (DEC-188), with the same words. This was an improvement, not an entry.
- **R14 (DEC-187 (3)).** C-141.7–.10's translations are `photo.withdraw.refused.machine`, `.nomark`, `.already` and `.noreason`, read by key. The placeholders are left for the screen, as membership's handle words are. The answer carries their fills: `photo` on NO_SUCH_MARK, and `member` and `date` on MARK_ALREADY_WITHDRAWN.
- **R15 (N816, K2380).** `copyWake` answers null while no bucket or no evidence store is bound, whatever is queued.
- **R18 (N818, K2383).** `start()` treats each of these as a start-up fault:
  - an `onReceipt` answer that is not `{ok: true}`;
  - a throw;
  - no `onReceipt` to ask.

  The fault is kept, answered by `faults()` as `{notice: "onReceipt", reason, detail}` (a copy; it writes nothing and never throws), and logged with `console.error`, as scheduler's are.
- **D54 (K2408, K2442).** The three tests `marks.test.mjs`:131, :201 and `withdraw.test.mjs`:116 are re-stated:
  - the founder (`admin` and `member:admin`) and an active administrator who is neither invited nor joined are answered NO_SUCH_PHOTO for a hidden project's photo;
  - negative controls: a discoverable project's photo is marked, seen and withdrawn by both, and the hidden photo is seen once it is taken out of the project.

  The fixture gained `project()` and `fence()`, as provenance-routes' have.
- **(N822)** `marks` re-stated: the D54 item above.

**Tests added or changed, each with a negative control (K874).**
- R11: the labels and every held word against `words.json`, plus the stored label through mark, mark and withdrawal.
- R14: the four translations by key, BOB's drafts absent, and the fills through the act.
- R15: `copyWake` null for no store, a throwing store and no bucket, and as before once bound again.
- R18: faults for `{ok: false}`, a throw, none to ask, no answer, and the real provenance's second registration (LISTENER_DECLARED); a standing registration keeps no fault.
- N790's words test now accepts the four keyed rows.

**Rule 4 (16).** I own no re-assertion of answer-envelope's `CHECK_FAMILIES is total` test: no test under `bio-plane/test/m/case-carriage/` names `CHECK_FAMILIES` or `CHECK_FAMILY_FILES`. That test is answer-envelope's (`families.test.mjs`, `catalogue-end.test.mjs`) and is not mine to fix (T41-60).

**Found in other modules (REPORT J1).** Two users' tests go red by K2380's change, as designed. With no store bound, `copyWake` answers null, so scheduler R25 does not fire the `doccopy` consumer and `onAlarm`'s answer has no `doccopy`. Each must be re-stated in its owner's job:
- scheduler `copies.test.mjs`:225 (R25);
- plane `t39.test.mjs`:78 (R18 (T39)), its negative-control arm "no bucket bound … DOCUMENT_COPY_NO_STORE".

Every other suite of my users had the same results on `tranche/T41` and on this branch: publication, case-disclosures, case-authoring, affordances, op-declarations, answer-envelope, control-plane, plane, and also public-read, case-checker and ratification. The tranche had 68 failures; this branch has 70, the two above. The label change reddened nothing: case-checker's and public-read's fixtures keep their own copy of the old sentence as test data.

**Final `uses`.** Unchanged (no new import).

**Deferred.** Nothing.

**Tests and checks.**
- case-carriage: 70 tests, 70 pass, 0 fail (before: 67, 3 fail, the D54 three).
- Users' suites (12 directories): 1,664 tests on both, 68 fail on the tranche and 70 on this branch (the two above).
- `format`: 0 failures. `architecture`: 0 failures. `coverage`: 18 of 18 live ids, 0 failures. `ownership`: 7 files, 0 failures.

Size (session_01PJqPaLJoAV9fTX9bSpNA4s): test runs 9, module lines 1383

## J1 · REPORT

Users' tests reddened by K2380 (N816), as designed: with no evidence store or bucket bound, copyWake now answers null, so scheduler R25 does not fire the doccopy consumer and onAlarm's answer has no doccopy. To re-state in each owner's job: scheduler copies.test.mjs:225 (R25, 'against the real case-carriage with no evidence store bound … DOCUMENT_COPY_NO_STORE'); plane t39.test.mjs:78 (R18 (T39), its negative-control arm 'with no bucket bound it answers DOCUMENT_COPY_NO_STORE'). Every other user suite is identical between tranche/T41 and job/T41/case-carriage (68 → 70 failures, these two only). Also: OBSCURED_LABEL's words changed by key (photo.obscured.label) and PUBLISHED_LABEL is new; case-checker's fixture and public-read's photos test hold their own copy of the old sentence as test data and stay green, but no longer match the module's words.

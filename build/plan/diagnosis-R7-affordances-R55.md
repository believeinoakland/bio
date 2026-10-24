# Diagnosis R7: affordances test "R55 R14 R16 R18" red

Verdict: STALE TEST (cause is promotion's G74, merged into tranche/T51 today; no affordances or provider product defect).

## 1. The failure (verbatim, short)

`node --test --test-name-pattern='R55 R14 R16 R18' test/m/affordances/plane.test.mjs` (in bio-plane), 1 test, fail:

    Error: promote INQ-2026-9405-held: {"ok":false,"reason":"PROMOTE_NOT_A_PARTICIPANT","code":"PROMOTE_NOT_A_PARTICIPANT","act":"promote","project":"PROJ-2026-9919-affordances-project-pb","detail":"Only the members of Affordances project PB, and those invited to it, can file documents into it. Nothing was filed. ..."}
      at must (plane.test.mjs:79:58)  at Object.promote (plane.test.mjs:108:67)  at TestContext.<anonymous> (plane.test.mjs:485:3)

It fails in the test's setup (line 485, `W.promote(QH, inPB(...))`), before any sever/reinstate assertion runs.

## 2. Root cause

- Test side: `W.promote` (plane.test.mjs:107-111) always files with token `W.RUTH` ("an administrator holding no position anywhere", line 100). The R55 test (lines 481-486) files QH and QH2 with `project: ${W.PB}` in their front matter. Ruth is neither a member of nor invited to PB (iris joined, pam owns).
- Product side: `bio-plane/src/promotion/index.mjs:696-709` (promotion R53 / G74, BOB's decision P17 from K4557): `promote` refuses a session member who is not a participant of the project the document states (`membership.participation(filedInto, filer)` false gives PROMOTE_NOT_A_PARTICIPANT). Only a session's member is asked (`actorMemberId`), so Ruth's session is refused.
- Introduced by: commit 57856ea1a8 (2026-10-23 13:42, "promotion: promote refuses a filer who is neither a member of nor invited to the project the document states (G74)"), keyed by bdfb8d310c (14:14). Merged into tranche/T51 by adb0e69b99 "Merge job/T51/promotion (G74) into tranche/T51" (2026-10-23 14:17). Module of the merge: promotion (job G74, fix-round-7-T51.md section G74, row 4).
- Not bisected by running an older tree: the sandbox refused the `git worktree` bisect command, so I did not retry or work around it. The attribution rests on the line-level match (the refusal text is exactly the one above, its only source is promotion/index.mjs:706, and the git history of that block begins at 57856ea1a8). The earlier "red" in AI-RUNS #27 fits, since that run was after 14:17.

## 3. Verdict: STALE TEST

The test's requirement (affordances R55: sever/reinstate offered on a question's own legs, viewer-fenced, counts only) is untouched. The setup acted as a non-participant, which the product now rightly refuses. Minimal test-only fix: file the project-bound questions as a participant of PB (iris, who joined PB; the test already has her token). Keep every assertion as is. No sentence people read is copied; the fix compares nothing but the setup token.

```diff
--- a/bio-plane/test/m/affordances/plane.test.mjs
+++ b/bio-plane/test/m/affordances/plane.test.mjs
@@ (before(): the promote helper takes the filing token, default Ruth)
-  const promote = async (id, text, type, state, register = []) => must(`promote ${id ?? type}`, await POST(`op=promote&token=${type === "project" ? ADM : W.RUTH}`, {
+  const promote = async (id, text, type, state, register = [], as = W.RUTH) => must(`promote ${id ?? type}`, await POST(`op=promote&token=${type === "project" ? ADM : as}`, {
@@ (the R55 test)
-  await W.promote(QH, inPB(W.inquiryMd(QH, D, false)), "inquiry", "open");
-  await W.promote(QH2, inPB(W.inquiryMd(QH2, DH, false)), "inquiry", "open");
+  /* promotion R53 (G74): a document stating a project is filed by a member of it; iris joined PB */
+  await W.promote(QH, inPB(W.inquiryMd(QH, D, false)), "inquiry", "open", [], W.IRIS);
+  await W.promote(QH2, inPB(W.inquiryMd(QH2, DH, false)), "inquiry", "open", [], W.IRIS);
```

Not run: I may not edit tracked files. Residual risk: after setup passes, the later assertions have not been executed on this tip, so a second stale point is possible. The job should run the whole file and fix any further failure the same way. A scan of the affordances tests found no other `project:` front-matter filing by Ruth in plane.test.mjs (backing.test.mjs:189 and :390 use their own `w` harness, not the wire).

## 4. Why the merging job's tests missed it

- The promotion job (G74) ran promotion's own tests (new `bio-plane/test/m/promotion/r7-foreign-project.test.mjs`). The affordances plane test drives `promote` over the wire as a consumer, so only a run of affordances' suite would show it. Promotion is a provider (affordances `uses` it), and the job's own tests cover the provider module, not its dependents.
- G74 was planned as a behaviour change with "no change of who may file" (fix-round-7-T51.md line 23), so no dependents' re-run was planned. Within affordances' tests this is the only wire filing of a project-bound document by a non-participant (grep of `project:`); I did not run other modules' suites, so other dependents are unchecked.
- Affordances' own last job (AFFORDANCES #44, ~13 h before) predates G74 and was green when it ran.

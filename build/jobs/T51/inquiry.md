# inquiry (T51)

**Status** · session_011Jyr771vUcNgdkLV7aQq1C · depth 2 · WORKING · handled B7

## J1 · COMPLETE

T51-216 (inquiry, the words pass) is applied. Commit 375b260f2e on job/T51/inquiry, merged with tranche/T51 at 7c347be866.

Entries applied
- The 13 findings of build/plan/words-pass/inquiry.md:
  - index.mjs inline: the bias-application lens sentence (180–181) now two localize calls (inquiry.index.whether_it_is_in_lens_could, inquiry.index.which_is_not_in_lens); the cut-against clause in the apportionment detail is its own localize (inquiry.index.and_of_them_cut_against); the NO_SIBLING_DISCLOSURE detail (638–642) is two localize calls; the NO_PARTITION detail is one localize (inquiry.index.pass_grounds_an_array); the Session Log's two fixed lines (2749–2750) are localize (inquiry.index.first_grouping_no_earlier, inquiry.index.strength_before_not_stated).
  - index.mjs plain (K3957, all six judged as member-read details, so localized, none sent to REPORT): inquiry.index.no_duty_the_record_holds, inquiry.index.this_selection_resolves_to, inquiry.index.this_inquiry_has_no_readable (three ids for the bundle.md sentences, 1831, 1997, 2571), inquiry.index.this_documents_state_history_block (1839, concatenation merged into one literal, English unchanged), inquiry.index.this_inquiry_has_no_readable_2 and _3.
  - tests copying product sentences (K3962, plus the testcopy arm): case-grammar.test.mjs now compares with localize(id, en, vars) for inquiry-grammar.grammar.remove_k_from_this_documents and inquiry-grammar.grammar.grounds_i_asserted_by_asserted (the key is unreviewed in words-unreviewed.json, so word(key) would fail missingkey); surfaced.test.mjs compares ROW.translation with word("refusal.SURFACED_BY_REWRITTEN"); person-warning.test.mjs negative-control label changed to "the public_role flag set" (a label, not the sentence).
- Every English string is unchanged, so no signed or stored text changes version (K1333). No requirement changed.
- No flaw found in another module. Nothing deferred.

Ids (new, fixed once, all inquiry.index.*): whether_it_is_in_lens_could, which_is_not_in_lens, and_of_them_cut_against, this_child_does_not_name, it_also_names_which_was, no_duty_the_record_holds, this_selection_resolves_to, this_inquiry_has_no_readable (plus _2 and _3), this_documents_state_history_block, pass_grounds_an_array, first_grouping_no_earlier, strength_before_not_stated.

Tests and checks
- node --test bio-plane/test/m/inquiry/: tests 218, pass 217, fail 0, todo 1 (after the edit; the run before the test fix also had 0 fail).
- node checks/format.mjs /home/user/bio: 176 modules, 175 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio inquiry: 39 product files, 138 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio inquiry: 56 of 56 live requirement ids named by a test; 0 failures.
- node checks/run.mjs /home/user/bio: format and architecture 0 failures; words: missingkey 0 and no inline, plain or testcopy finding under bio-plane/src/inquiry or bio-plane/test/m/inquiry (the run still reports other modules' words findings: 3347 failures in total, none in inquiry). Coverage reports two failures outside this module (inquiry-grammar R19, screens-inquiry R65–R79), not mine.
- node bio-plane/src/setup-words/build.mjs --check: rows.mjs stale, expected; it names the new inquiry.index ids only as stale rows, not a refusal.
- node checks/ownership.mjs /home/user/bio inquiry tranche/T51 job/T51/inquiry: 1 file changed by inquiry between tranche/T51 and job/T51/inquiry; 0 failures.

Notes for BOB
- The words-pass ids are not in rows.mjs yet; localize falls back to the en, so output is the same. Regenerate at the layer close.
- The two inquiry-grammar keys used in case-grammar.test.mjs are in words-unreviewed.json, not words.json. Once the design stream reviews them, the test could switch to word(key).

Size (session_01NvSSvWMYsZ2nhZyzjqLjdo): test runs 2, module lines 3816

## J2 · COMPLETE

B2 (CHANGE) applied. Commit ddcec16bf6 on job/T51/inquiry; tranche/T51 merged in (no conflicts).

- case-grammar.test.mjs:77 and :264 now compare with the product's own localize calls, same id, en and vars as inquiry-grammar's code: inquiry-grammar.grammar.the_case_states_these_facts and inquiry-grammar.grammar.name_the_member_asserting_that. Compared by equality, not copied.
- The earlier case-grammar test copies (remove_k_from_this_documents, grounds_i_asserted_by_asserted) stay as localize calls with the product's id and en.

Tests and checks (after the merge):
- node --test bio-plane/test/m/inquiry/: tests 218, pass 217, fail 0, todo 1.
- format: 176 modules, 175 requirements files; 0 failures.
- architecture inquiry: 39 product files, 138 relative imports; 0 failures.
- coverage inquiry: 56 of 56 live requirement ids named by a test; 0 failures.
- checks/run.mjs: no inline, plain, testcopy or missingkey finding under bio-plane/src/inquiry or bio-plane/test/m/inquiry (missingkey 0 overall).
- setup-words --check: rows.mjs stale, expected; no refusal naming inquiry.
- ownership: 1 file changed by inquiry between tranche/T51 and job/T51/inquiry; 0 failures.

Size (session_01NvSSvWMYsZ2nhZyzjqLjdo): test runs 4, module lines 3816

## J3 · COMPLETE

B3 (CHANGE, K4015) applied. Commit 950867033d on job/T51/inquiry; tranche/T51 merged in (no conflicts).

- Ran the words check with the current process checker (civicos-process main at d424c32, from a fresh shallow clone under the scratchpad; my earlier clone in civicos-process was not updated, since the pull was divergent).
- Its two findings in my module, both fixed by localize with the English unchanged:
  - contradiction.mjs:160: the "`resolution` is a block of fields" sentence (id inquiry.contradiction.resolution_is_a_block_of).
  - index.mjs:2066: the "two children carry the same id" sentence (id inquiry.index.two_children_carry_the_same).
- The checker's result for inquiry now: inline 0, plain 0, testcopy 0, missingkey 0, 0 failures. It reports 12 unkeyed strings; these are the design's unkeyed list, not failures, and I have not judged them as no-person-reads.

Tests and checks:
- node --test bio-plane/test/m/inquiry/: tests 218, pass 217, fail 0, todo 1.
- format: 176 modules, 175 requirements files; 0 failures.
- architecture inquiry: 39 product files, 138 relative imports; 0 failures.
- coverage inquiry: 56 of 56 live requirement ids named by a test; 0 failures.
- setup-words --check: rows.mjs stale, expected; no refusal naming inquiry.
- ownership: 4 files changed by inquiry between tranche/T51 and job/T51/inquiry; 0 failures.

Note: my local civicos-process checkout is at an older commit (4ec1c4c) because the pull diverged; the words results above come from the d424c32 clone.

Size (session_01NvSSvWMYsZ2nhZyzjqLjdo): test runs 5, module lines 3814

## J4 · REPORT

B4 (FR-45) applied, one part waiting on FR-44. Commits a349296263 and its follow-up on job/T51/inquiry; tranche/T51 merged in (no conflicts). Session session_01HHv6yiUNNMusUY87v5exzx (INQUIRY #22, depth 2).

**Entry 2 (K4202, the census) · done and green.** `DECLARED_OPS` is exported from `bio-plane/src/inquiry/index.mjs` beside `inquiryOps`: `inquirydivide` (accepts `target`, `reason`, `children`; requires all three: NO_TARGET, NO_REASON, TOO_FEW_CHILDREN) and `inquiryground` (accepts `target`, `grounds`, `reason`; requires `target` and `grounds`: NO_TARGET, NO_PARTITION; `reason` is asked of a restructure only, decided from the record, R27, so it is accepted and not required). Classes `admin`, `member`, `probe`, mutating, weight `reasoned`, description `act.inquirydivide.does` and `act.inquiryground.does`, copied from the existing rows. `op-grades.registerDeclaredOps` answers both as `agreed`; `op-declarations` accepts the rows and answers the fields back. Test: `declared-ops.test.mjs` (4 tests, green): `declaredOpHolds` for each op, and a control that fails a declaration requiring `reason` of `inquiryground`.

**Entry 1 (L9, K4194) · my half is done; its tests are red until FR-44 (inquiry-grammar R68) merges.**
- `ground` (`index.mjs`): a partition that names a leg whose role is `cuts_against` is refused `BASIS_REFUSED` with the finding in `findings[]` (`check` C-2.8, `ord`, `target`, `detail` by `localize`, `repairs`), nothing written. The grammar's findings in the ground refusal now also carry `code` when the grammar gives one.
- `divide`: a child given every supporting leg of a group carries the group whole even when it also holds a cutting leg (an unlabelled cutting leg no longer drops the partition); a child with part of a group still carries none; a child of cutting legs only carries none.
- Test: `cutting-legs.test.mjs` (4 tests) and `divide.test.mjs` (its grouped-division test changed: it grouped a cutting leg with a supporting one, which R85 refuses; the cutting leg is now unlabelled and the group is `[0,3]`). With the totality rule of `checkGrounds` counted over supporting legs only (I simulated R68 with a one-line scratch patch to `inquiry-grammar/grammar.mjs`, reverted, not committed) all 226 tests of the module pass (225 pass, 1 todo). On tranche/T51 as it stands, without R68: tests 226, pass 221, fail 4 (the four above that need a partition leaving the cutting leg unlabelled). I confirmed the division fix is the cause: with the old `keepGroups` the division test fails.
- Please tell me (a CHANGE) when FR-44 is merged on tranche/T51; I merge it, rerun, and COMPLETE. If R68 reads differently from the one-line rule I assumed (cutting legs not counted as unlabelled), I will bring my side in line.

**Requirement lines (ownership: `build/requirements/inquiry.md` is outside a job's write set, so I wrote none; the check refused it). For BOB to write:**
- **R85** *(not yet met: T51)* (FR-45; K4194; L9; `inquiry-grammar` R68; amends R8, R27, R34; DEC-32) **A partition labels supporting legs only: a leg that cuts against is never in a ground.** `ground` (R27) accepts a partition that covers every leg whose role is `supports` and names no leg that cuts against; cutting legs stay unlabelled, keep their place in `basis[]`, and the candidate is judged by `inquiry-grammar`'s totality rule over supporting legs (its R68). A partition leaving a supporting leg out is refused as before (`BASIS_REFUSED`, the grammar's finding). A partition naming a leg that cuts against is refused `BASIS_REFUSED` with that leg named in `findings[]` (`check`, `ord`, `target`, `detail`), never the bare code; nothing is written. `divide` (R24) carries a group whole to a child that holds every supporting leg of it, whether or not the child also holds legs that cut against. `partitionOf` (R65) lists a cutting leg among `ungrouped`. Test: `cutting-legs.test.mjs`.
- **R86** *(not yet met: T51)* (FR-45; K4168, K4202; the T51 declaration pass) **The module declares the ops it serves that the screens send**: `DECLARED_OPS` exported beside the ops map, `inquirydivide` (accepts `target`, `reason`, `children`; requires all) and `inquiryground` (accepts `target`, `grounds`, `reason`; requires `target`, `grounds`), class, weight and description from the op's existing rows. Test: `declared-ops.test.mjs`.
- The START gave R85 as the next free id; the file's highest id is R65, so R66 is the next free by the file. I used R85 and R86 in the tests' names as the START gives them. If you write them as R66 and R67, the test names change (a rename, no logic).
- Amends R34 ("A leg that cuts against travels every path a supporting leg does: apportionment, projection, grounds"): grounds no longer, by R85.

**Found in another module (P9) · `strength`, for BOB.** Your ruling (K4194) says the strength is the supporting legs'. `strength` does not know the role: its arithmetic (`strength/arithmetic.mjs` `axisResult`) takes every leg of a question as a member, and a leg with no ground label is "needed by every one of those sets", an AND part beside the grounds' OR part. So a question whose supporting leg is grouped `g1` (grade A) and whose cutting leg is unlabelled and graded C reads **C**, not A (checked directly: `axisResult("capture", [supports A in g1, cuts_against C unlabelled])` answers `graded C`, "no stronger than the weakest ... That document is needed by every one of those sets"); the same cutting leg ungraded reads A. Before R85 the grammar forced the cutting leg into a ground, which made it a sufficient ground of its own (the thing you said must never happen); after R85 it becomes a necessary leg instead. Neither is "the supporting legs' strength". Fixing it is `strength`'s: its arithmetic must leave legs of role `cuts_against` out of the population (members and the implicit part), or you rule that a graded cutting leg lowering the strength is intended. No entry for it is in FR-xx of the fix round that I can see (checked `fix-round-T51.md`). My requirement text does not claim the strength is the supporting legs' (only that no ground holds a cutting leg and the document labels supporting legs only); say which you want.

**Other.** `inquiry` is unchanged elsewhere; flaws found in the module: none. Deferred: none.

**Tests and checks** (process repo at the commit cloned this session; `git reset` to refresh it was refused, so it is the clone of 2026-10-20):
- `node --test bio-plane/test/m/inquiry/`: tests 226, pass 221, fail 4, todo 1 (the four need R68; with R68 simulated: pass 225, fail 0, todo 1).
- `node --test bio-plane/test/m/{strength,screens-inquiry}/`: 2 and 4 failures, identical on tranche/T51 without my change (stash comparison), none mine; `basis-versions`, `citation`: 0 fail.
- format: 175 modules, 175 requirements files; 0 failures. architecture inquiry: 39 product files, 138 relative imports; 0 failures. coverage inquiry: 56 of 56 live requirement ids named by a test; 0 failures (R85 and R86 are named by tests but are not live ids until you write them). words inquiry: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0; 0 failures; 12 unkeyed (the design's list). ownership inquiry tranche/T51 job/T51/inquiry: 5 files changed; 0 failures.
- I did not run `checks/run.mjs` whole nor `setup-words build --check` yet: they come with COMPLETE.

Size (session_01HHv6yiUNNMusUY87v5exzx): test runs 9, module lines 3835

## J5 · COMPLETE

FR-45 complete after restart (INQUIRY #23, session_01CYcxZgZhrDnqWKu6J5KF4X). `inquiry-grammar` R68 is on tranche/T51 and merged in (tranche head e67a3a1c3c).

Entries applied
- Entry 1 (L9, K4194): a partition labels supporting legs only; a partition naming a cutting leg is refused `BASIS_REFUSED` with the named finding; `divide` carries a group whole to a child holding every supporting leg. Tests: `cutting-legs.test.mjs`, `divide.test.mjs`.
- Entry 2 (K4202): `DECLARED_OPS` with `inquirydivide` and `inquiryground`. Test: `declared-ops.test.mjs`.
- Requirement lines written in `build/requirements/inquiry.md` (K4210): R85 and R86 new (met), R34 amended (cutting legs travel apportionment and projection, not grounds), Status line updated. The ids are R85 and R86 as the START gave; the file's own next free id was R66.

Deferred: none. Flaws found in the module: none.
Found in another module: `strength` arithmetic must leave `cuts_against` legs out of the population (already confirmed and routed by B7).

Tests and checks
- `node --test bio-plane/test/m/inquiry/`: tests 226, pass 225, fail 0, todo 1.
- format: 175 modules, 175 requirements files; 0 failures. architecture inquiry: 41 product files, 142 relative imports; 0 failures. coverage inquiry: 58 of 58 live requirement ids named by a test; 0 failures. ownership inquiry tranche/T51 job/T51/inquiry: 5 files changed; 0 failures.
- `checks/run.mjs` whole: format and architecture 0 failures; words inline 0, plain 0, missingkey 0 (nothing for inquiry); the 7 coverage failures (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring) and 7 testcopy failures (op-grades) are other modules', none in my files.

Size (session_01CYcxZgZhrDnqWKu6J5KF4X): test runs 4, module lines 3835

# citation (T51)

**Status** · session_01KjtAFrtxEtLHsjBFVS3Bgd · depth 2 · COMPLETE · handled B11

## J1 · REPORT

Flag for BOB (not changed here). `docs/development/ux-substrate/screens/words-reads.json` lists 61 citation strings as `unkeyed` (the design's list; `checks/words.mjs` does not count them, so `citation` has no failure). Several are member-read refusal `detail`s and session-log lines (for example "citations live on the citing object, and this is neither a case nor a question…", "the reasons appended to these citations would push bundle.md past the 1MB inline limit", the "Trigger: selection" and "Changes:" log lines). setup-words R13 names a refusal's `detail` among the sentences a member reads (K3964). I left them as the design's list has them: converting 61 member-facing refusal texts is a design call, not a check finding. Please settle with the design stream (K3944): convert them, or keep them unkeyed. Two lines I did key: the found-passage trigger and the every-member NOWHERE tail (citation.index.trigger_a_part_found_in_capture, citation.index.part_named_written_nowhere); rows.mjs is stale for them until the layer close, as setup-words --check notes.

## J2 · COMPLETE

CR-11 done; words (W) for citation done. Pushed as 0970c7aabc on job/T51/citation.

Entries applied:
- CR-11 (N1071, K3264): the sever-inquiry relay test (sever-inquiry.test.mjs, the last test) runs against the real inquiry answer. It divides the question through the booted inquiry (`divide`), then sever is refused by inquiry R64 with DIVIDED_CANNOT_RESTRUCTURE, target, from "divided" and its children, and the answer equals `dividedCannotRestructure` with handle and drift added. Nothing is written. The stub step (a registered fake promotion check) is gone.
- (W) words: the 1 inline finding (index.mjs trigger of a passage found by search) and the 3 testcopy findings (cite-write.test.mjs:123, found.test.mjs:236, 237) fixed. Also keyed: the every-member NOWHERE tail (index.mjs; citation.index.part_named_written_nowhere) and the test regexes that held the same sentences (found.test.mjs trigger lines; cite-write.test.mjs:133). Output text unchanged.
- (K3962) the 3 test copies of code sentences: fixed by localize equality (K3810).

Deferred: none in this module. Other modules: none found.
Flag: 61 citation strings are on words-reads.json `unkeyed` (see REPORT). Left as the design lists them, for BOB to settle.

Tests and checks:
- node --test bio-plane/test/m/citation/: 102 tests, 102 pass, 0 fail.
- node checks/format.mjs /home/user/bio: 176 modules, 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 16 product files, 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids named by a test, 0 failures.
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0).
- node checks/run.mjs /home/user/bio: citation has no finding. The tree-wide failures (words 3364, coverage 28) are other modules' and are not this job's.
- node bio-plane/src/setup-words/build.mjs --check: a stale-rows note naming the two new keys, as expected; no refusal naming citation.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 5 files changed, 0 failures.

No pull request is opened (JOB step 1). The commit carries the session trailer but no model-name co-author line, because the model-identity rule forbids model identifiers in commits.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 1, module lines 1486

## J3 · COMPLETE

B2 done: every member-read sentence of citation is read through the list. Pushed as the commit "T51 citation (B2): member-read sentences read through the list" on job/T51/citation.

Converted (output text unchanged, ids citation.<file stem>.<slug>):
- Every refusal detail in index.mjs and recorded.mjs (the 61 design-unkeyed items, including the ones already keyed by an earlier codemod that the design list still named).
- The session-log lines that reach bundle.md: the Session headers (one id for one record, one for many; no ICU plural), Trigger: selection (both forms), Trigger: question, the "; for question" trailer, Changes: basis legs, Changes: cites edges, the Note trailer, and the set-moved note.
- The grammar labels passed to inquiry's extent check ("the part of the document this citation names") and the #document fallbacks ("the project's own bundle.md does not parse").

Kept unkeyed, listed for the record: none in the module source. The design list's one remaining counted entry is the frontmatter wiring line in splice.mjs (`- rel: ... target: ... status: ...`), which is record grammar, not prose.

Tests: every test that held a sentence now compares with localize by equality (cite-write, draw, query-drift, recorded, found), or asserts the key. Test copies are 0.

Checks:
- node --test bio-plane/test/m/citation/: 102 pass, 0 fail.
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0, unkeyed 1: the splice wiring line above).
- node checks/format.mjs /home/user/bio: 176 modules, 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids named, 0 failures.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 9 files, 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: a stale-rows note (expected; rows regenerate at the layer close); no refusal naming citation.

Earlier pass (CR-11, J2): unchanged; this COMPLETE supersedes it.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 5, module lines 1415

## J4 · COMPLETE

B3 done (K4015): the words check on citation is clean. Pushed on job/T51/citation as "T51 citation (B3): the NO_ROLE translation is read through the list".

Finding fixed: checks.mjs:21, the NO_ROLE translation (C-33.16) was a literal joined by + that copied the row refusal.NO_ROLE. It now reads word('refusal.NO_ROLE'); the text is equal to the row.

Unkeyed items kept: none. The module's remaining unkeyed count is 0.

Checks after the fix:
- node checks/words.mjs /home/user/bio citation: 0 failures (inline 0, testcopy 0, unkeyed 0). The check is run from the pulled process main (d424c32).
- node --test bio-plane/test/m/citation/: 102 pass, 0 fail.
- node checks/format.mjs /home/user/bio: 0 failures.
- node checks/architecture.mjs /home/user/bio citation: 0 failures.
- node checks/coverage.mjs /home/user/bio citation: 15 of 15 live ids, 0 failures.
- node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation: 10 files, 0 failures.
- node --test checks/test/*.test.mjs tools/test/*.test.mjs (process repo): 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: no refusal naming citation.

Size (session_018wkgQYFa889na4frSPWfKx): test runs 7, module lines 1412

## J5 · QUESTION

Two small judgments in entry 4 (the census declaration), my best readings first; I carry on with them.
1. `cite`'s `role` is required on a question's arm (NO_ROLE) but refused on a case's (ROLE_NOT_APPLICABLE). One op row cannot say both. Best reading: `requires: ["project", ["handle","found"]]`, `role` only in `accepts`; the question screens always send a role. If you want `role` required, the case-arm sends of `cite` (if any screen has one) would fail interface-shell's guard.
2. `cite`, `sever` and `reinstate` read `owner` from the address, but the door overwrites it server-side (control-plane/index.mjs:1944, selection ownership). Best reading: it is a stamp like `viewer`, so left out of `accepts`.
Also: build/modules.json gives `citation` no `uses` edge to `test-support`; the declared-ops tests import its helper (the pass added that edge to ten other modules). Please add it; until then the architecture check will name it.

## J6 · COMPLETE

FR-35 done (B4, B5): citeImported and withdrawImported (C50, UC-082), the declaration of the two ops, and the census declaration of cite, drawquestion, sever and reinstate. Pushed on job/T51/citation as "T51 citation (FR-35): citeImported, withdrawImported, DECLARED_OPS (R16 to R19)".

Entries applied:
1. citeImported (`op=citeimported`, R16): one leg `target` (importedFindingRef), `target_edition`, `role`, `note`, nothing else, not in references[]. Refusals in R16's order: MACHINE_CANNOT_CITE_IMPORTED (C-33.55; an unnamed, machine or bare-`admin` author), the citing object (membership.noSuchProject's answer; NOT_AN_INQUIRY), IMPORTED_REF_MALFORMED (C-33.56), IMPORTED_EDITION_MALFORMED (C-33.57), NO_ROLE, BAD_ROLE, BAD_NOTE, the document's readability, UNSPLICEABLE_BASIS, CITATION_TOO_LARGE; the write's refusals come back unchanged (IMPORTED_NOT_ACCEPTED and ACCEPTED_WORK_UNREADABLE inside BASIS_REFUSED, accepted-work R3, R4). A held leg on the ref answers ok, `alreadyCited: [ref]`, `edition` (the held one), nothing written. Receipt: `cited`, `legs`, `role`, `gradesFilled: 0`, `origin` (group, case, edition, finding, acceptance by/at/reason, openFlags, read from accepted-work after the write) and `inherits` (the by-key sentence).
2. withdrawImported (`op=withdrawimported`, R17): removes every leg on the ref from the live basis[] (`splice.mjs` `removeBasisLegs`; an emptied block becomes `basis: []`) with a Session Log entry (author, ref, edition, reason). Refusals in R17's order; a ref that cannot be spelled is NOT_CITED. Sever cannot move the imported leg (tested), and still moves an ordinary one.
3. DECLARED_OPS (R18): `citeimported` and `withdrawimported` as K4189's table (classes admin, member; machineClasses []; reversible / reasoned with refusal NO_REASON).
4. Census (R19, K4202): `cite`, `drawquestion`, `sever`, `reinstate`. Class and weight copied from the op-declarations / op-grades rows (cite reversible; drawquestion reversible, its description is the op-grades NON_ACTS reason word for word; sever, reinstate reasoned). Per B5: cite requires project and handle-or-found, `role` accepted only; `owner` is a stamp. Two readings to confirm: (a) cite's accepts lists the part's fields from EXTENT_PARAMS (extent_* and content_id), since the arm collects any `extent_*` and refuses an unknown one by name (C-45.7); (b) sever and reinstate accept and require `reason` (the arm's own, NO_REASON).
Requirement lines: R16, R17, R18 amended and R19 NEW, written in build/requirements/citation.md (not in this record), the *(not yet met: T51)* marks removed because tests name them. Status line updated. That file is the one ownership item to accept.
Words: the new sentences are `localize` ids citation.index.imported_*, citation.index.session_*_imported, citation.checks.* and citation.declared.*; no row exists for them yet (rows regenerate at the layer close), the words check on citation is clean.

Checks:
- node --test bio-plane/test/m/citation/: 121 pass, 0 fail (was 102; new imported.test.mjs 12, declared-ops.test.mjs 7). invariants.test.mjs line 180 listed the ops map's four ops; it now lists six.
- Used by citation: run-productions 62, affordances 280, answer-envelope 41, control-plane 309 pass; plane 265 of 266 (see below).
- format 0 failures; architecture citation 0; coverage citation 19 of 19 live ids; words citation 0 (inline 0, testcopy 0, unkeyed 0); checks/run.mjs: no finding for citation (tree-wide failures are other modules').
- ownership: 8 files, 1 failure, build/requirements/citation.md (accepted per B5).
- setup-words build --check: stale-rows note (ai-accounts' word), none naming citation.

Notes for BOB (not changed here):
- Hand rows that can go once the owners declare: op-declarations `cite`, `sever`, `reinstate`, `drawquestion` (OPS) and op-grades `cite`, `sever`, `reinstate`, `drawquestion` (RUNGS, and drawquestion's NON_ACTS reason); also marks.mjs rows `citeimported` (Reversible) and `withdrawimported` (Reasoned) agree with my weights.
- `strengthOf` is not importable from citation's tests (strength is index 84, after citation at 81). R16's "re-reads through basisFor and strengthOf" is tested through the real inquiry's `basisFor` (leg present, no grade, axis or source; the document holds `target_edition`). The published pair and the never-stronger rule are strength's to test (R33); a strength test of an imported leg written by citeImported would close it.
- Verified: accepted-work.acceptedFinding answers the `edition` as the leg names it (a number); the `origin` reads it.
- plane: `R24 ... screen.bias.purpose is held by the words list` fails in bio-plane/test/m/plane; not citation's (a screen word).
- The ops map reads the address only (`citationOps(c, url)`, as before; plane/store.mjs:772 passes no body). Both new ops read the address too; if the door sends these fields in a body, plane's wiring must pass it.
- citationOf now reaches `acceptedWorkOf(host)`, which registers accepted-work's promotion check; a host built without accepted-work gets it on first use.
- I wrote the code before the tests in this job; the tests were then seen to catch the faults (each refusal has a control; the not-accepted refusal lands after the acceptance is switched on, the stand-in for `importaccept`).
Deferred: none.

Size (session_019cLfLSvZFS385AAVvr1YqH): test runs 14, module lines 1688

## J7 · COMPLETE

Applied B6 (K4223), pushed as cec1c2cb28 on job/T51/citation (merged tranche/T51 first).

- `needs: "contribute"` on all six DECLARED_OPS rows: citeimported and withdrawimported (the new ones), and cite, drawquestion, sever, reinstate (the older mutating rows, the same check). `contribute` is the capability the sibling acts hold (`op-capabilities`: cite, sever, reinstate, drawquestion). The arm checks no capability itself; its member gate is the machine and unstamped-author refusal (`#importedMemberRefusal`), so the door's `needs` is the capability gate, as the siblings have it.
- Requirement R18 amended in `build/requirements/citation.md` (the `needs` clause and the register test named).
- Test: `bio-plane/test/m/citation/register.test.mjs`, two tests named R18. It calls op-declarations' `registerDeclaredOps({citation: DECLARED_OPS})` and expects no refusal; the control is citeimported with its `needs` taken away, refused `NEEDS_MISSING` naming the op, with nothing registered (so the real call still goes through). A third check holds every mutating row to `contribute`.
- Red: I did not run the control before the edit. The refusal it asserts is the R80 one that `op-declarations/test/m/op-declarations/register-owners.mjs` already records ("citation's `citeimported` row ... declares a mutating op with no `needs`"), and before the edit `DECLARED_OPS.citeimported` had no `needs` key.
- The four older rows agree with their hand rows: registration checks each owner row against the hand row (`disagreement`), and the registration test passes, so classes, machine classes, mutating and needs match.

Deferred: none.

Found in another module (not edited, for BOB):
- `bio-plane/test/m/op-declarations/register-owners.mjs` (op-declarations' test): its header says registering every owner is refused by citation's `citeimported` row. That is no longer true. Citation's declaration can now be added to its `REGISTERED` list; that file is not mine, so I left it.
- Hand rows that a registered declaration can replace, once the owner's row is what the plane reads: `cite`, `drawquestion`, `sever`, `reinstate` in op-declarations' `OPS`, op-capabilities' rows, and op-grades' rows where present. I did not remove or test their removal.

Tests and checks (from the process repo, against /home/user/bio):
- `node --test bio-plane/test/m/citation/`: 123 pass, 0 fail (`register.test.mjs` run separately as well: 2 pass).
- `node checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `node checks/architecture.mjs /home/user/bio citation`: 18 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio citation`: 19 of 19 live ids named by a test, 0 failures.
- `node checks/words.mjs /home/user/bio citation`: 0 failures.
- `node checks/run.mjs /home/user/bio`: citation has no finding. The tree-wide failures are other modules': architecture 1, coverage 4, and words 26 (testcopy in op-grades' tests, for example `owners.test.mjs`, `t35.test.mjs`, `t47.test.mjs`). I did not look at them.
- `node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation`: 1 file changed (the requirement file), 0 failures.

Size (session_0153H53S2RwjRhNVSVQfv5k8): test runs 2, module lines 1688

## J8 · COMPLETE

Applied B7 (K4226), pushed on job/T51/citation (merged tranche/T51 first).

- `bio-plane/test/m/citation/register.test.mjs` no longer imports op-declarations and makes no `registerDeclaredOps` calls. It holds the shape only: every mutating row of `DECLARED_OPS` names `needs: "contribute"`, and citeimported and withdrawimported are named explicitly.
- R18 in `build/requirements/citation.md` now names the shape test and says registration is proven by op-declarations' `register-owners.mjs` (OP-DECLARATIONS #29 adds citation there).

Deferred: none. Other modules: none new.

Tests and checks:
- `node --test bio-plane/test/m/citation/`: 122 pass, 0 fail.
- `node checks/architecture.mjs /home/user/bio` (whole product): 3832 product files, 0 failures.
- `node checks/architecture.mjs /home/user/bio citation`: 0 failures.
- `node checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `node checks/coverage.mjs /home/user/bio citation`: 19 of 19 live ids named by a test, 0 failures.
- `node checks/words.mjs /home/user/bio citation`: 0 failures.
- `node checks/ownership.mjs /home/user/bio citation tranche/T51 job/T51/citation`: 0 files changed by citation beyond the merge, 0 failures.

Size (session_0153H53S2RwjRhNVSVQfv5k8): test runs 2, module lines 1688

## J9 · QUESTION

QUESTION (no answer needed to proceed; I carried on on this reading). Replaces nothing.

C31 needs a requirement line in `build/requirements/citation.md` that is not written. My reading, for R1/R19 or a new R20: "`cite` is a write, so its arm reads `project`, `handle`, `found`, `question`, `note`, `role` and the part's fields (`extent_*`, `content_id`) from the POST body only; the door's stamps stay in the address. A GET reaches the act with none of them and is refused as any call naming no source is (`CITE_ONE_SOURCE`), writing nothing, whatever its address carries. `found` is an object or one JSON string." The declared fields (R19) are unchanged. The tests name R1 and R19; if you write a new id, tell me and I name it.

Words: I invented no sentence. A GET's refusal is the existing `CITE_ONE_SOURCE` row ("this call names neither a selection nor a passage found by search…"), which is true but does not say "use a POST". If you want a dedicated refusal (for example `CITE_NEEDS_POST`), the design stream writes its row in `words.json` first; I add the code when it exists.

## J10 · REPORT

REPORT. My change (cite reads its fields from the POST body, `citationOps(c, url, body)`) breaks tests and callers of other modules, which I did not touch (P9). Each passed on tranche/T51 and fails with my change:
- `bio-plane/test/m/affordances/plane.test.mjs` (affordances): lines 170, 171, 360, 406, 930 send `op=cite` as a GET with `project`, `handle`, `note` in the address; they need a POST with those fields in the body.
- `bio-plane/test/members.test.mjs` (membership): line 266 sends `POST op=cite&project=…&handle=…` with body `{}`; the fields must move into the body.
Callers in source that send `cite` fields in the address (found by grep, to move to a body): `screens-inquiry/document.mjs:917` and `question.mjs` (wave 2 screens-inquiry, C31's other half), `screens-daily/finder.mjs` (`cs.act("cite", { data: { handle } })`, lines 256, 296 in finder-states.mjs, 334-341) and `screens-daily/find-in.mjs:59, 329`. Also the wizard-scripts library's `cite` steps and `journey-check/investigation.mjs:195-199` if they send the fields as a query. Suites that pass unchanged: control-plane envelope (16) and stamps (6), interface-shell frame (21) and t51 (29).
Merge order matters: citation lands before affordances, membership and the screens, so their jobs must send the body when they merge.

## J11 · COMPLETE

CITATION #17 · fix round 2 · C31 met (citation's part).

- `citationOps(c, url, body)`: `cite` reads `project`, `handle`, `found` (object or one JSON string), `question`, `note`, `role` and the part (`extent_*`, `content_id`) from the POST body only; the stamps (`viewer`, `owner`, `author`, `identity`) stay in the address. A GET reaches the door with a null body, so no field reaches the act and it refuses `CITE_ONE_SOURCE` writing nothing, even with every field in the address. Weight is read from nowhere (R7). DECLARED_OPS unchanged (the same fields are accepted).
- Test: `cite-post.test.mjs` (R1, R19, R7), written first, seen failing 5 of 5 on tranche/T51's code, now passing. Control: the same fields as a body cite; a GET with all fields writes nothing and the document is byte-identical. `invariants.test.mjs` and `declared-ops.test.mjs` send `cite`'s fields as a body.
- Suites: `node --test --test-force-exit bio-plane/test/m/citation/`: 127 pass, 0 fail. Format failure 1 is `build/rulings.md:4298` (K4301, BOB's file). architecture 0, coverage citation 19 of 19, words 0, ownership 0 failures.
- Reported to BOB: the QUESTION (requirement line and a dedicated refusal row) and the REPORT (other modules' tests and callers to move to a body).
- Not done by me: the passage's "already cited" mark is screens' half (wave 2).
Deferred: none.

Size (session_01T23tysCBff1C94XfhB4Qo3): test runs 9, module lines 1698

## J12 · COMPLETE

Applied B9 (R20, K4308). `cite` reads each field from the POST body, and from the address where the body lacks it; the body wins where both are sent (the part's `extent_*`/`content_id` merge the same way); the stamps stay in the address; a call naming no source is refused CITE_ONE_SOURCE, writing nothing. `found` is an object or one JSON string.
- Tests: `cite-post.test.mjs` names R20, R1, R19, R7: body cites; address-only still cites; body wins; no source refused with the document unchanged (control: a handle cites).
- Suites: citation 127 pass, 0 fail; affordances `plane.test.mjs` 31 pass and `members.test.mjs` 1 pass, both unchanged and green again. coverage citation 20 of 20, words 0, architecture 0, ownership 0 failures.
Deferred: none. Other modules: the REPORT J10 is withdrawn for the two tests; the screens still move to a body as C31's other half.

Size (session_01T23tysCBff1C94XfhB4Qo3): test runs 11, module lines 1704

## J13 · QUESTION

QUESTION (no answer needed to proceed; I carry on on this reading). Cause cite-refusal, R21.

1. "Add the new passage to the group" cannot be done before the passage is cited, so that repair is `cite` itself with one more field. My reading: `cite` gains an optional `ground` (the label of a group the question already declares); on a question it is written on each new leg as `ground: <label>` (splice.mjs), so the write's own check judges it (a label not declared is refused by the write as today); on a case it is refused `GROUND_NOT_APPLICABLE` (new C-33 row, awaiting the stamp), as `role` is refused there. DECLARED_OPS' `cite` accepts gains `ground` (R19). The second repair is `inquiryground` with `{target, grounds: []}` (inquiry's own way to remove the grouping; it asks the member for a reason, which the screen collects).
2. Shape of the answer: a top-level `repairs` beside `findings` on a BASIS_REFUSED from `cite`: `[{key, act, fields, vars}]`, `[]` when none. A repair is offered only when the basis is already grouped (labelled legs) and the refusal carries a C-2.8 finding, read from the document, never from the finding's English.
3. Words: the design has no rows for the two repair sentences. Stand-in keys, written once with `localize`: citation.index.repair_add_to_group ("Add it to the group {ground}") and citation.index.repair_remove_grouping ("Take the grouping off, so the answer reads as its weakest citation"). The design stream writes the real rows; I change the ids if it names others.
Proposed requirement lines go in COMPLETE: R21 amended (the `ground` field and the repair shapes), R19 (cite accepts `ground`).

## J14 · COMPLETE

COMPLETE · CITATION #18 · fix round 4 · cause cite-refusal (RC-R9, citation R21).

Cause cite-refusal, the four fields:
(1) Root cause: the write's BASIS_REFUSED (C-2.8, a basis grouped whole or not at all: a new ungrouped leg beside a grouped one) was relayed unchanged by `cite` (index.mjs, the `promoted` relay), its only text the grammar's English finding; no act could add the new leg to a group, since `cite` took no group. Certain.
(2) Test gap: the relay test used a scripted refusal (cite-refusals.test.mjs, "answered unchanged"); no test cited onto a really grouped question through the door's ops map. Fixed: cite-repairs.test.mjs builds the grouped question on the real inquiry and presses `cite` through `citationOps` with the body, as the door does.
(3) Failing-first test (R21, cite-repairs.test.mjs, 5 tests): red on the previous code (`repairs` undefined; BAD_GROUND not a code), now green: citing a second passage while the only citation is grouped answers BASIS_REFUSED with findings and two repairs `{key, act, fields, text}`: `cite` with `{ground: "part 1"}` (done, the new leg lands in the group) and `inquiryground` with `{target, grounds: []}` (done through inquiry's own act, the cite lands). Controls: a refusal with no repair states `repairs: []`; an ungrouped question lands with no `repairs` key; a ground the question does not declare, and a ground on a case, are BAD_GROUND (new C-33.58 row, awaiting the stamp), nothing written. Repairs are read from the document and the write's C-2.8 code, never from the English.
(4) Platform check: N (pure code).

What changed: `cite` accepts `ground` (written on each new leg, `splice.mjs`); `repairs` on every BASIS_REFUSED cite answer; two helper methods; the row BAD_GROUND; DECLARED_OPS `cite` accepts `ground`. Tests updated for the new shapes: cite-refusals (a BASIS_REFUSED states repairs []), invariants (check rows, `ground` in the ops map call).

Requirement lines proposed for BOB to write (QUESTION J13, no answer needed): R21 amended: "`cite` also accepts an optional `ground`, the label of a group the question declares, written on each new leg; a label not declared, and any on a case, is refused `BAD_GROUND` (C-33.58), writing nothing. A BASIS_REFUSED answer states `repairs`: for a grouped basis refused C-2.8, one `cite` repair `{ground}` per declared group and one `inquiryground` repair `{target, grounds: []}`, each `{key, act, fields, text}`; `[]` otherwise." R19 amended: `cite` accepts `ground`.
Words (stand-ins, the design writes the rows): citation.index.repair_add_to_group, citation.index.repair_remove_grouping, citation.index.bad_ground, citation.checks.bad_ground. The screen (screens-inquiry, wave 2) draws `repairs` by key, sends the first repair's fields with the original cite, and asks the member's reason for the second.
Noted for BOB: `screens-inquiry/question.mjs:1138` reads only string repairs inside findings; the new top-level `repairs` objects are for that job. The wizard/affordances op help for `cite` may list `ground`.

Suites: citation 132 pass, 0 fail (was 127); affordances 282/282; screens-inquiry + members 472/472. format 0, architecture citation 0, coverage 21 of 21, words 0, ownership 0 failures. setup-words --check: stale-rows note naming my new key, as expected.
No open QUESTION requires an answer; none held back.

Size (session_01451wdDHycJMRsEDd4jwBN5): test runs 6, module lines 1760

## J15 · COMPLETE

Fix round 10, Wave B batch 6 (B12). Tests only; no product file of citation changed.

**Fixture lines (2, both done):**
- `cite-refusals.test.mjs` (R1, the write's refusals relayed): four of the five refusals now come from inquiry's published `basisRefusals()` (`basisRefused`, `selfBasis`, `basisCycle`, `machinePassageUnchecked`), each made by inquiry's real promotion. The fifth, `PROPOSAL_NOT_TAKEN_UP`, is run-productions' (a later module) and no published fixture gives it; it stays a literal beside the loop, relayed unchanged. The fixtures check does not flag it, so I added no marker.
- `draw.test.mjs` (R14): the invented `SOME_STEP_REFUSED` is replaced by inquiry's real `BASIS_REFUSED` (`basisRefusals().basisRefused`).
- Markers added: no `fixtures-own`, no `fixtures-generic`. `checks/fixtures.mjs . citation --list` is at zero.

**Inherited reds (R21) and K5090:** the three red tests (`cite-repairs.test.mjs`) asserted the old half-labelled refusal. Seen red first (3 failures), then rewritten. After inquiry-grammar R68 no cite onto a grouped basis is refused for its grouping:
- a second passage cited beside a grouped one is clean and carries no `repairs` (new test);
- the one C-2.8 grouping finding a cite still reaches is a cutting passage named into a group (`role: cuts_against` with `ground: "part 1"`): `BASIS_REFUSED` with its findings, `repairs: []` (the member named the group; `cite` offers repairs only when none was named), nothing written; the same cite without the group lands (new test);
- the repairs arm is kept under test by the write refusing a grouped document with the real C-2.8 answer from inquiry's fixture: two repairs (add to the group, take the grouping off), each done lets the cite land (the three amended tests). The control (`repairs: []` for a refusal that is not a grouping; none on success) is unchanged.
REPORT to BOB (K5090): no cite reaches a grouping refusal whose stated repairs clear it any more, so R21's C-2.8 arm (`#groupingRepairs`: one `cite` repair per group and one `inquiryground`) is unreachable through a real basis. I struck nothing; BOB retires the arm, or has the cutting-with-ground case carry a "cite it without the group" repair.

**Runs:** citation tests 134 of 134 pass (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/citation/*.test.mjs`). Checks: fixtures 0 failures; words 0 failures; format 0 failures; architecture 0 failures; coverage 21 of 21 ids named, 0 failures; ownership 0 failures. `impact.mjs origin/tranche/T51 HEAD`: no affected module (test files only), so no user's tests to run.

Size (session_01KjtAFrtxEtLHsjBFVS3Bgd): test runs 3, module lines 0

## J16 · COMPLETE

Fix round 10, Wave B batch 6 (B12). Tests only; no product file of citation changed.

**Fixture lines (2, both done):**
- `cite-refusals.test.mjs` (R1, the write's refusals relayed): four of the five refusals now come from inquiry's published `basisRefusals()` (`basisRefused`, `selfBasis`, `basisCycle`, `machinePassageUnchecked`), each made by inquiry's real promotion. The fifth, `PROPOSAL_NOT_TAKEN_UP`, is run-productions' (a later module) and no published fixture gives it; it stays a literal beside the loop, relayed unchanged. The fixtures check does not flag it, so I added no marker.
- `draw.test.mjs` (R14): the invented `SOME_STEP_REFUSED` is replaced by inquiry's real `BASIS_REFUSED` (`basisRefusals().basisRefused`).
- Markers added: no `fixtures-own`, no `fixtures-generic`. `checks/fixtures.mjs . citation --list` is at zero.

**Inherited reds (R21) and K5090:** the three red tests (`cite-repairs.test.mjs`) asserted the old half-labelled refusal. Seen red first (3 failures), then rewritten. After inquiry-grammar R68 no cite onto a grouped basis is refused for its grouping:
- a second passage cited beside a grouped one is clean and carries no `repairs` (new test);
- the one C-2.8 grouping finding a cite still reaches is a cutting passage named into a group (`role: cuts_against` with `ground: "part 1"`): `BASIS_REFUSED` with its findings, `repairs: []` (the member named the group; `cite` offers repairs only when none was named), nothing written; the same cite without the group lands (new test);
- the repairs arm is kept under test by the write refusing a grouped document with the real C-2.8 answer from inquiry's fixture: two repairs (add to the group, take the grouping off), each done lets the cite land (the three amended tests). The control (`repairs: []` for a refusal that is not a grouping; none on success) is unchanged.
REPORT to BOB (K5090): no cite reaches a grouping refusal whose stated repairs clear it any more, so R21's C-2.8 arm (`#groupingRepairs`: one `cite` repair per group and one `inquiryground`) is unreachable through a real basis. I struck nothing; BOB retires the arm, or has the cutting-with-ground case carry a "cite it without the group" repair.

**Runs:** citation tests 134 of 134 pass (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/citation/*.test.mjs`). Checks: fixtures 0 failures; words 0 failures; format 0 failures; architecture 0 failures; coverage 21 of 21 ids named, 0 failures; ownership 0 failures. `impact.mjs origin/tranche/T51 HEAD`: no affected module (test files only), so no user's tests to run.

Size (session_01KjtAFrtxEtLHsjBFVS3Bgd): test runs 3, module lines 0

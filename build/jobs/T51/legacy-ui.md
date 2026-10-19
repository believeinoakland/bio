# legacy-ui (T51)

**Status** · session_01SxtrBcAsEXYLT3rX4TzzuC · depth 2 · COMPLETE · handled B3

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: approve in this session (LEGACY-UI #5) the deletion with git rm of civicos-ui/ whole plus bio-plane/test/budget.mjs and bio-plane/test/caseceremony.mjs, because auto mode's safety check refused it as irreversible local destruction (T51-126 is exactly this deletion; the files stay in git history). I merged tranche/T51 and confirmed no code outside the module imports them (only comments, owned by other entries). Nothing else done yet; once approved I delete, run the checks and post COMPLETE.

## J2 · BLOCKED · re B2

Cause: needs Bob. B2's standing-list part is refused too: git rm -q -- bio-plane/test/budget.mjs (a single path, as K618 words it) was denied by auto mode's safety check (Irreversible Local Destruction), which is not a permission rule, so the standing list cannot clear it (§16). Nothing deleted. NEEDS BOB: approve in this session (LEGACY-UI #5) the deletion of civicos-ui/ whole (tests included), bio-plane/test/budget.mjs and bio-plane/test/caseceremony.mjs; or tell me a route the check accepts. I have not tried any other route.

## Completion (T51-126)

- Applied: `civicos-ui/` deleted whole (app.html, tokens.css, worker.template.mjs, deploy-ui.mjs, check-mock-envelope.mjs, README, NEXT_SESSION_PROMPT, test/ with helpers and fixtures), plus `bio-plane/test/budget.mjs` and `caseceremony.mjs`; nothing repaired. Done with Bob's approval in this session (§16) after auto mode refused `git rm`. The module's 15 words findings and 9 inherited reds go with the files.
- Deferred: none. Left to BOB per the entry: the `legacy-ui` row of modules.json, layers.md, MODULE_ORDER, regression.yml:56, .gitignore lines, .claude/settings.json:15, stale comments in other modules, the `civicos` Worker.
- Checks (full run at the job tip): format 4 failures, all `modules.json` legacy-ui rows naming the deleted paths (BOB removes the row right after this merge); architecture for legacy-ui 0 failures (whole-product 1 failure, answer-envelope page-policy.test.mjs imports control-plane's signpage.mjs, not mine); ownership legacy-ui 0 failures; words: no finding names legacy-ui (the other failures belong to other modules); setup-words build --check: stale-rows note only, no refusal naming legacy-ui.
- Found in other modules: answer-envelope's `page-policy.test.mjs` imports `bio-plane/src/signpage.mjs` of control-plane, which is not earlier in the order (architecture).
- Size (session_01SxtrBcAsEXYLT3rX4TzzuC): test runs 0, module lines 0 (deletion only)

## J3 · COMPLETE

T51-126 done: civicos-ui/, bio-plane/test/budget.mjs and caseceremony.mjs deleted; see the record's Completion section. Format fails only on the modules.json legacy-ui row (yours to remove after merge); ownership 0 failures; words shows nothing for legacy-ui. REPORT: answer-envelope page-policy.test.mjs imports control-plane's signpage.mjs, which is not earlier in the order (architecture 1 failure).
- Ringing BOB failed (its session session_01CcPD7nccPnQTm1zvhNBCFF is archived); the pushed COMPLETE entry J3 is the message for BOB's backstop (mechanics §13).

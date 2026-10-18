# signatures (T51)

**Status** · session_01JyN2szAX3kLAZzz8syqiPy · depth 2 · COMPLETE · handled B3

## J1 · BLOCKED

BLOCKED (cause: needs Bob).
NEEDS BOB: approve the one Bash act that deletes the signing page's tests in bio-plane/test/m/signatures/signatures.test.mjs (lines 977-1394: R25, R30, R31, R32, R37/R39/R42 page tests, their loadPage and sign helpers; plus lines 22-23, 34, 1418, 1464, 1477 imports and references), and the whole file bio-plane/test/m/signatures/signer-keys.test.mjs (every test in it is a page test of retired R43, R44, R32), by git rm. The permission check refused the sed/git call that would make these edits (the auto-mode classifier, 'Security Test Removal'). I have not worked around the refusal; no file in the module has changed yet.
Why: BOB's START note 1 and the T51-124 entry name these deletions. Everything else in the job is ready to follow: release-signer.test.mjs needs the page import (line 20) and two page-derived checks rewritten against node:crypto, and the rest of the checks are next.
Standing rule question for Bob: if the permission rule should allow these deletions, the settings rule (the Bash command) decides; otherwise say which lines to keep.

## J2 · BLOCKED

BLOCKED (cause: needs Bob). NEEDS BOB: approve Bash for the removal in bio-plane/test/m/signatures/signatures.test.mjs of the page tests moved to signpage.test.mjs (sed -i deleting lines 977-1394 and the page imports at 22-23, 34, 1418, 1464, 1477). The permission check refused it again: 'Security Test Removal' (auto mode). The same check also refused 'node --test' on the module's test files, so I cannot run the tests. Done so far: signpage.test.mjs created with the page tests copied unchanged (13 pass, run before the refusal); release-signer.test.mjs rewritten (page import and page checks replaced by node:crypto; NOT yet run). Not done: the removal above, signatures.test.mjs run, checks, COMPLETE. I have not worked around the refusals.

# case-inputs (T48)

**Status** · session_01HMHhJQ1EUTLxeEzLN3Ze7j · depth 2 · COMPLETE · handled B2

## Completion (T48-43)

- **Read whole** (P20): the requirements, `index.mjs`, `checks.mjs` and the tests `openrequests`, `t46-words` (the rest of the module's tests were run, not changed). No other flaw found in the module.
- **Applied:** R18. `openRequestRow` reads `quotable` (a boolean when stated, else the row is malformed and R8 reads the source `undetermined`; `null` is read as a non-boolean, malformed; absent reads as `true`, and the row carries `quotable` only where the source states it). `openRequestLine` answers `quoting: {key: null, says}` for `quotable: false` only; `says` is BOB's plain sentence `{whom}'s reply asks not to be quoted.` (`OPEN_REQUEST_NOQUOTE_PLAIN`, exported; not in `CASE_INPUTS_WORDS`, which stays words.json-verbatim).
- **Key missing:** `signing.openrequest.noquote` is not in `words.json` at this START. When given, the module reads it by key (a later change: add it to `CASE_INPUTS_WORDS`, drop the plain constant, `key` becomes the key; the R18 test says so). R18 stays "not yet met" on the key until then.
- **Ambiguity, my reading:** `quotable: null` is malformed (spec: "a value that is not a boolean"); unlike `replied`, which allows null.
- **"labelled" (K3261):** no member-facing occurrence in the module; the only ones are in code comments and a test title, left alone.
- **Deferred / found elsewhere:** none. `case-authoring` R34 needs no change (spreads `openRequestLine`'s answer); its open-request tests, `action-replies`' and `plane`'s t45 (27 tests) pass.
- **Tests:** `node --test bio-plane/test/m/case-inputs/`: 48 pass, 0 fail (two new, R18). Checks (`node checks/run.mjs /home/user/bio`): format 0 failures; architecture 0 failures; coverage names no case-inputs failure (32 failures are other modules'); ownership case-inputs 0 failures.
- Size (session_01HMHhJQ1EUTLxeEzLN3Ze7j): test runs 6, module lines 1336

## J1 · COMPLETE

R18 applied (quotable; quoting line with key null and BOB's plain sentence). Key signing.openrequest.noquote is still missing from words.json: needs UX-DESIGN; R18's key clause stays unmet until then. Tests 48 pass; checks clean for case-inputs; record on job/T48/case-inputs.

# connection-grammar (T51)

**Status** · session_01C2rbqP6ZhqFQcW4niw2SyH · depth 2 · WORKING · handled B0

## J1 · COMPLETE

T51-166 (connection-grammar, the words check after the conversion, K3949): completed on job/T51/connection-grammar at ee01d545fa.

Entries applied
- The four findings of build/plan/words-pass/connection-grammar.md, each read through localize (no words.json row; words.json is outside my paths):
  - reads.mjs:68 the undetermined message. Its {why} was never filled (a template literal left it literal). It now fills {why} from the reason validAt gives. This is a fix of a real flaw, not only a conversion.
  - registry.mjs:79 VIEWER_MISSING's reason, localize('connection-grammar.registry.viewer_missing', ...).
  - shape.mjs:10 DECLARED_LABEL, localize('connection-grammar.shape.label_declared', 'declared, not evidenced'). The label is read by members and stored in records, so it now goes through the id; the English is unchanged, so stored labels still match. If the design row for this id is ever changed, stored labels stop matching: BOB should know that before the layer close regenerates rows.
  - shape.mjs:122 the grade-shape message, localize('connection-grammar.shape.grade_shape', 'grade is not {shape} in the letters {letters}', ...). The braced shape is passed as a variable so the English literal has no ICU-looking braces; the message text is unchanged.
- Tests (bio-plane/test/m/connection-grammar/): each new id is named in a test title and compared with localize (K874): registry.test.mjs (viewer_missing), shape.test.mjs (label_declared, grade_shape), neighbours.test.mjs (reads.name_is_undetermined_at_the, which checks the at failure of the unmarked fixture).

Deferred (not changed, with why)
- Template sentences with values, not flagged by the words check (so not in its findings): shape.mjs:127 ("a declared connection carries the label ..."), shape.mjs:129 (hunch label), shape.mjs:133 ("an ${cls} connection carries neither ..."), and similar in shape.mjs, registry.mjs and reads.mjs. The check does not judge them. Converting them needs BOB's ruling on whether a value inside a member-facing sentence goes through localize. HUNCH_LABEL ('hunch') is left as is for the same reason.

Other modules
- None found in this job that need a REPORT.

Tests and checks run
- node --test bio-plane/test/m/connection-grammar/: pass 40, fail 0.
- node checks/format.mjs /home/user/bio: 174 modules, 173 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio connection-grammar: 16 product files, 48 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio connection-grammar: 1 modules, 21 of 21 live requirement ids named by a test; 0 failures.
- node checks/words.mjs /home/user/bio connection-grammar: 1 modules, 1270 string literals read; inline 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures.
- node checks/ownership.mjs /home/user/bio connection-grammar tranche/T51 job/T51/connection-grammar: 7 files changed by connection-grammar; 0 failures.
- node checks/run.mjs /home/user/bio: its words arm reports 2817 failures repo-wide (testcopy and handlist in other modules' tests, e.g. wizard-scripts). None is in connection-grammar. The format, architecture and coverage arms were run one by one above and pass.

Size (session_01C2rbqP6ZhqFQcW4niw2SyH): test runs 1, module lines 699

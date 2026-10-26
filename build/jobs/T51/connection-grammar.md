# connection-grammar (T51)

**Status** · session_01C2rbqP6ZhqFQcW4niw2SyH · depth 2 · COMPLETE · handled B3

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

## J2 · REPORT

T51-166 connection-grammar (CHANGE B3, K3957): plain findings the words check reports in this module after the change, for BOB's unkeyed list (K3944).

Six plain strings are left as plain literals, each the failure text of ownerConformance (bio-plane/src/connection-grammar/conformance.mjs):
- :93 "next repeats a page already read"
- :110 "two identical calls gave different answers"
- :116 "an item is answered on two pages"
- :142 "the other viewer's pages are not the complete set less the fenced item"
- :157 "an owner of hunch kinds names a hunch and its working inquiry in its fixture"
- :170 "the fixture's hub node is not answered as a hub"
Why no member reads them: ownerConformance is the battery each owner runs in its own job over its own fixture (R9); it is never called by the explore walk or any member-facing read, and its failures go to the job and to BOB. The two plain strings that the contract check (reads.mjs) produces for the registry's refusal, which a member could meet, are converted to localize (connection-grammar.reads.unread_shape, connection-grammar.reads.hub_with_items).

Other module, for BOB to route (not changed here): civil-time bio-plane/src/civil-time/recurrence.mjs:158, :241 and :248 pass a plain word(...) string to undetermined(). civil-time R30 says every undetermined why is {key, vars}. R6 now refuses a string why (reads.mjs reasonFills), so an owner whose item carries one of those reasons fails the battery. The civil-time owner should pass reason(key, vars) there.

## J3 · COMPLETE

T51-166 connection-grammar: COMPLETE again after CHANGE B2 (K3958) and CHANGE B3 (K3957), on job/T51/connection-grammar at 5cae6db697 (tranche/T51 merged, civicos-process 27aa50e).

Entries applied
- B2: R6 amended. An undetermined item's why is carried as civil-time answers it ({key, vars}); reads.mjs refuses a marked why the word list cannot fill (reasonFills: a key the list holds that fills with its vars, or a dotted localize id, with vars an object); the not-marked message reads civil-time's reason through reasonText; the battery judges it through the same answerFailures. Fixtures (fixtures/owner.mjs, hub-by-kind.test.mjs) carry {key, vars} reasons. The ten red tests are green.
- B3: the 8 plain findings judged. reads.mjs:33 and :47 are localized (connection-grammar.reads.unread_shape, connection-grammar.reads.hub_with_items; each named by a test). conformance.mjs :93, :110, :116, :142, :157, :170 are REPORTed to BOB (J2) with why.
- Earlier entries (T51-166, the four findings) stand, with the tests they named.

Deferred: none in this module. The civil-time recurrence.mjs strings are another module's; see the REPORT (J2).

Tests and checks run
- node --test bio-plane/test/m/connection-grammar/: pass 43, fail 0.
- node checks/format.mjs /home/user/bio: 174 modules, 173 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio connection-grammar: 16 product files, 48 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio connection-grammar: 1 modules, 21 of 21 live requirement ids named by a test; 0 failures.
- node checks/words.mjs /home/user/bio connection-grammar: 1 modules, 1303 string literals read; inline 6, plain 6, testcopy 0, missingkey 0, handlist 0, marker 0; the 6 failures are the REPORTed conformance strings only.
- node checks/ownership.mjs /home/user/bio connection-grammar tranche/T51 job/T51/connection-grammar: 6 files changed by connection-grammar; 0 failures.

Size (session_01C2rbqP6ZhqFQcW4niw2SyH): test runs 3, module lines 709

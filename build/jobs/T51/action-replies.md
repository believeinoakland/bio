# action-replies (T51)

**Status** · session_014bgUSo7CFss8G3KkUwUuZE · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Found in another module, not changed here (P9): `bio-plane/src/action-records/index.mjs` carries the same English refusal `detail` sentence on its `NO_TARGET` refusals, unread by key: "one action at a time: pass target=<action id>" (lines 412, 450, 478, 573, 629, 679, 722), and "one action at a time: pass action=<action id>" (line 775). Under setup-words R13 (K3964) it wants the same `localize` conversion as action-replies now has (`localize("action-records.<area>.<name>", en)`). Its owner is `action-records`' job.

## J2 · COMPLETE

T51-266 (action-replies, the six test copies in `build/plan/words-pass/action-replies.md`) is applied on `job/T51/action-replies` at `84308564f0`, pushed. No PR opened (JOB step 1).

Entries applied:
- The six testcopy lines the words-pass note lists: `words.mjs` already lists none of them at START, so they were done before this job. Their values are identifiers (the `BEARINGS` codes), not sentences; left as they are.
- Beyond the entry, setup-words R13 (K3964, K3974): the refusal `detail` sentences in `bio-plane/src/action-replies/index.mjs` were English, unread by key. Each is now `localize("action-replies.index.<name>", en)` with its `en` unchanged, as `accepted-work` did (its K3964 precedent). Ids: `one_action_at_a_time`, `no_author`, `arising_form`, `entry_not_reply`, `not_rfc_laid_out`, `not_rfc_quoting`, `quoting_shape`, `machine_bearing`, `machine_quoting`, `machine_link`, `arose_not_reply`, `arose_linked`. `arising_form` keeps its `{project}` with `{ project: "{project}" }`, because `localize` would otherwise demand a variable for it.
- `bio-plane/test/m/action-replies/bearings.test.mjs`: the two sentence-fragment regex checks (`/machine work/`, `/not the reply's layout/`) are equality checks now, against `proposalLabel(MACHINE, "bearing").says` and `word("action-replies.says.proposed_layout_reply", …)`.
- `bio-plane/test/m/action-replies/t47.test.mjs`: removed `assert.match(SENTENCE, /from 1 to 50 claims/)`; line 44's equality with `word(KEY, …)` already holds the sentence.
- Rows, requirements, codes, numbers and behaviour: unmoved. No requirement changed.

Deferred: none. Judgment for BOB: `refusal.NO_TARGET` and `refusal.NO_AUTHOR` exist in `words.json`, but this module's NO_TARGET and NO_AUTHOR refusals carry only their `detail` (no translation). I did not add translations: the requirements name no such row, so that is BOB's call (a new row, or the `detail` left as a diagnostic).

Flaws or findings in other modules: see the REPORT entry.

Tests and checks (summary lines):
- `node --test test/m/action-replies/*.test.mjs` (in `bio-plane`): tests 31, pass 31, fail 0.
- `checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio action-replies`: 11 product files, 37 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio action-replies`: 1 modules, 11 of 11 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio action-replies tranche/T51 job/T51/action-replies`: 1 files changed by action-replies; 0 failures.
- `checks/words.mjs /home/user/bio action-replies`: 1 modules, 953 string literals read; inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0; 0 failures.
- Joint `checks/words.mjs … action-replies` (13 modules): 215 failures, none naming action-replies.
- `checks/run.mjs /home/user/bio` (whole tree): format 0 failures, architecture 0, channels 0; coverage 28 failures and words 1406 failures, all in other modules; none names action-replies.
- `setup-words/build.mjs --check`: the stale-rows note only (expected; it names this module's new `arising_form` row, which BOB regenerates at the layer close), no refusal.

Size (session_01NcxvJ1PpGvLHtvFLzKS8Qy): test runs 3, module lines 690 (`index.mjs` 549, `checks.mjs` 74, `schema.mjs` 67).

## Fix round 10, Wave B, batch 6 (ACTION-REPLIES #7, session_014bgUSo7CFss8G3KkUwUuZE)

Causes done: actions/actionsForRefusal, 3 lines (open.test.mjs:97, 98, 107), now at zero in `checks/fixtures.mjs action-replies --list`.
- :97 and :107: the hand-built `{ ok: false, reason: "BROKEN" }` from `actionsFor` is now `actionsForRefusal().unknownRead` (actions' real NO_SUCH_ACTION refusal); the asserted throw (`could not be read`) still holds.
- :98: the `actionRead` refusal in the third case could not be re-pointed. This module skips a NO_SUCH_ACTION from `actionRead` by design, and actions gives no other refusal for it, so the case would stop testing the throw. It stays a made-up code, marked `// fixtures-generic: BROKEN` (open.test.mjs:100). **For BOB's merge read (K5060):** one `fixtures-generic` marker, open.test.mjs:100, standing for "an actionRead that refuses with a code other than NO_SUCH_ACTION". No `fixtures-own` markers.
Lines left: none (no waiting, stay or Wave B lines).
Tests: action-replies 31 pass, 0 fail. Checks: format 0 failures; architecture 0; coverage 11 of 11 ids; ownership 0; fixtures 0 failures (accepted 1). `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules, so no user tests to run.
Size (session_014bgUSo7CFss8G3KkUwUuZE): test runs 4, module lines 0

## J3 · COMPLETE

COMPLETE. Fix round 10 batch 6: the 3 actions/actionsForRefusal lines (open.test.mjs:97,98,107) are at zero. :97 and :107 take actions' real unknownRead refusal; :98's actionRead case keeps a made-up BROKEN code, marked 'fixtures-generic: BROKEN' at open.test.mjs:100, because this module skips NO_SUCH_ACTION by design and actions gives no other actionRead refusal (your K5060 read; no fixtures-own markers). Module tests 31 pass, 0 fail; format, architecture, coverage, ownership, fixtures all 0 failures; impact: 0 affected modules. Record: build/jobs/T51/action-replies.md.

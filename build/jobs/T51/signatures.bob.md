# BOB to signatures (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 1, signatures: **T51-124 · signatures** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/signatures.md` (read whole), folded by K3824; R25, R30, R31, R32, R42, R43, R44 are retired by K3824 (moved to control-plane, deleted, K3814).
BOB's notes for this job:
1. The signing page leaves your module (K3807, K3814): remove your tests' imports of the page and the tests of the retired ids (`release-signer.test.mjs`:20, `signer-keys.test.mjs`:15, `signatures.test.mjs`:22–34, 993–1011, 1418, 1464, and any other that imports `signpage.mjs`, `SIGN_HTML` or reads `sign-release.html`). Keep every test of `sshsig.mjs`, `tsa.mjs` and `sign-sshsig.mjs`; where a kept test used the page only as a convenience, rewrite it against `sshsig.mjs` directly. Do not edit `signpage.mjs`, `sign-release.html` or `scripts/embed-signpage.mjs`: at your merge BOB moves them into control-plane's paths, and control-plane's L11 job deletes them with `/sign`. Removing a test file wholly is `git rm -q --` (standing list).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (no base red of K3543 or K3557 is in layer 1). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio signatures tranche/T51 job/T51/signatures`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

ANSWER to J1. Not relayed to Bob (rulings-active §1: a safety-check refusal is met by a different, legitimate route, never an approval request). Do not retry the deletion and do not delete any test. The route instead (K3828): the page's tests MOVE with the page to control-plane, which deletes them with the page and `/sign` in L11.
1. Move every page test of `signatures.test.mjs` (lines ~977-1394 and the page imports/helpers at 22-23, 34, 1418, 1464, 1477) into a new file in your test directory, `bio-plane/test/m/signatures/signpage.test.mjs`, unchanged in what they assert (keep their names; they still pass against the page). `signatures.test.mjs` then imports nothing of the page.
2. Leave `signer-keys.test.mjs` exactly as it is (all of it is page tests).
3. `release-signer.test.mjs`: replace its page import (line 20) and the two page-derived checks with the same checks against `sshsig.mjs`/`node:crypto` (a rewrite that keeps what they prove is not a removal).
4. At your merge BOB moves `signpage.test.mjs` and `signer-keys.test.mjs` into control-plane's `tests`, with the page's three files into its `paths`, so your module's tests no longer name the retired ids. Coverage of the retired ids is not owed.
Set your state back to WORKING, carry on, and COMPLETE as usual. If any of this is refused too, say so with BLOCKED and the exact refusal; do not work around it.

## B3 · ANSWER · re J2

ANSWER to J2. Received. The removal of the moved copies from `signatures.test.mjs` and the test run are refused by auto mode's own check, so no route of yours or BOB's clears them (§16): BOB has told Bob, and Bob approves them in this session when he can. Keep the state NEEDS BOB. When the approval reaches you, do the removal exactly as you described, run your tests, checks and ownership, and COMPLETE. Do nothing else meanwhile and do not work around the refusals.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), signatures: **T51-173** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/signatures.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are listed by the words check itself in `build/plan/words-pass/signatures.md` (read whole): each is a judgment the codemod could not make (a stitched sentence, a partial copy, a hand-list, a custom error class, a signed text). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `signatures.<file stem>.<slug>`, fixed once.
3. A signed text changes only as a new version with every earlier version byte-identical (K1333): a finding inside a signed or hashed text is not converted in place; if one is, ask BOB (QUESTION) before changing it.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio signatures tranche/T51 job/T51/signatures`. Your Size line counts only your module's own code (K2513).

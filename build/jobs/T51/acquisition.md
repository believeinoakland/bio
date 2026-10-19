# acquisition (T51)

**Status** · session_016xfwU1s1dNaPjN8djDsRtW · depth 2 · WORKING · handled B0

## J1 · REPORT

Two words-check findings are in other modules, outside this job's paths; I did not change them (P9):

- `bio-plane/src/capture/index.mjs:716` `[plain]` "the acquisition receipt could not be written, so nothing was filed"
- `bio-plane/src/doorbell/index.mjs:656` `[plain]` "the acquisition receipt could not be written, so the knock stays as..."

Each is a sentence a member reads, so each owner converts it through `localize` (the acquisition module's own strings are converted the same way). The sentence names the acquisition receipt, which is this module's record; the wording is theirs to key.

## J2 · COMPLETE

Entry T51-178 applied (words pass, K3949, K3957, K3962, K3955). Head: f82170799d (2fee74be9a, merged tranche/T51 at 7fa58468e5).

Applied
- The 3 findings in words-pass/acquisition.md: the inline qualification of a render (index.mjs, the template literal inside `localize`'s vars) is now its own `localize` (`acquisition.index.the_whole_page_qualifier`); the test copy "a continuation files no new document" is reworded (acquire.test.mjs), and the memento's "it is not the page at" is read through `word("acquisition.asked_note.memento_seconds_instant")` (memento-at.test.mjs).
- The 33 plain findings: each sentence in index.mjs (19), keyed.mjs (7) and unpack.mjs (7) is read through `localize('acquisition.<file>.<slug>', en, vars)`, with the wording unchanged. Three sentences were split across two literals in the source (index.mjs sweep scope, keyed.mjs key-held, unpack.mjs archive opening) and are now one literal each; the text is the same. index.mjs:1039 ("too large to be a single page") is read through localize too.
- The 19 test copies: tests compare with `localize(id, en, vars)` or `word(id)` using the id the product uses (capture-sources, court-doctypes, doctypes, subresources, acquisition, provenance). The three test-local labels and an assert message that copied a sentence were reworded (origin.test.mjs fixture signals, profile.test.mjs, reputation.test.mjs message, acquire.test.mjs message). keyed.test.mjs: a test case label that copied a source fragment is reworded.
- subresources-walk.test.mjs:100 (K3955): the banner is compared with `localize("subresources.subresources.derived_banner", en, {primarySha, when})`, `when` read back from the render companion.

Choices I made (for BOB to confirm)
- Keys: `acquisition.<file stem>.<first five words>` (the layer's existing pattern), where a slug collided with another key I took a distinct one (`the_body_broke_off_credential`, `bio_plane_acquire_hashed_at_receipt`).
- Strings that might look like wire values (the `method` label, the render `evidence` labels, the `listed whole` signal) are converted with their text unchanged, not listed in a REPORT: the output is identical, and no one compares them.
- The `missingkey` check treats `word()` on a key the words list does not declare as a failure, so tests use `localize(id, en)` for those.

Deferred: none.

Flaws in other modules (REPORT sent): capture index.mjs:716 and doorbell index.mjs:656 (plain, "the acquisition receipt ...").

Checks (run in this session)
- acquisition tests: `node --test test/m/acquisition/*.test.mjs`: tests 173, pass 173, fail 0 (before and after the tranche merge).
- `checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio acquisition`: 3616 product files, 12027 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio acquisition`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio acquisition tranche/T51 job/T51/acquisition`: 0 failures (13 files changed by acquisition, all inside its paths).
- `checks/run.mjs /home/user/bio`: no finding names acquisition (the words check's 4078 failures are in other modules, two of which are the REPORT above). Checked by grep for the acquisition paths and for the acquisition keys.
- `setup-words/build.mjs --check`: the stale-rows note names acquisition ids (expected, per the job); no refusal naming acquisition.

Size (session_016xfwU1s1dNaPjN8djDsRtW): test runs 3, module lines 2973

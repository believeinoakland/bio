# acquisition (T51)

**Status** · session_01Y3snL5ogNuP2LEHaz82PG4 · depth 2 · WORKING · handled B5

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

## J3 · QUESTION

FR-43 part 1 is done and pushed (head on job/T51/acquisition, tranche/T51 merged). I need the live stage timings to do part 2 (entry 2); I am not guessing the stage.

What part 1 does (requirement R95, written in build/requirements/acquisition.md and named by 4 tests in test/m/acquisition/stage-times.test.mjs): every `acquire` answer, refusals included, carries `timings: {total_ms, stages}`, whole milliseconds by stage: reputation, archive, fetch (the governed request, so the host governor's pacing and redirects are inside it), read (body hashed and stored), render, receipt, subresources (a continuation too), profile, attest, unpack. Only the stages that ran appear; they sum to no more than total_ms. `acquire` also accepts `opts.timings` (an object it keeps current as stages run) and exports `stageTimes(obj)`, which names a stage still under way as `running`.

Please send, from the live copy after the redeploy, the `timings` of the slow captures (the oakland.legistar.com / oaklandca.gov 75 KB page and PDF, and one address on another site) by CHANGE. R96 (the budget) will be written with the fix, since the budget depends on the stage.

Needed in other modules (not mine; for BOB): the 25 s door bound ACQUIRE_TIMED_OUT (control-plane R105) stops waiting and today cannot say where the time went. For its refusal to carry the stage times, control-plane must hand `opts.timings` to the acquire call (through capture and plane, which pass `acquire`'s opts on) and add `stageTimes(timings)` from acquisition to that refusal's body. Until then the live walk reads the times only from captures that finish (which are the ones under 25 s). If most slow captures time out, the timings BOB reads will be missing for exactly those; consider doing that wiring before the redeploy.

Numbering: the START gave R95/R96; this file ends at R48, so R95 leaves a gap in the numbering, kept as given.

## J4 · COMPLETE

FR-43 part 1 applied (entry 1, K4194). Requirement line R95 written by me in build/requirements/acquisition.md (K4210; not in this record); it is named by 4 tests in test/m/acquisition/stage-times.test.mjs, so it carries no "not yet met" mark. R96 and entry 2 (part 2) are not applied: they return after the redeploy with the live timings (B5); R96 not written yet.

Changes: acquire's answer (every outcome) carries `timings`; `opts.timings` and exported `stageTimes`. Three existing tests (checks.test.mjs R29, t50.test.mjs R29 and R47) set `timings` aside by name in their byte-for-byte comparisons; R29's line says so.

Deferred: part 2 only (waits on timings). Found in other modules: control-plane R105 must carry the timings into ACQUIRE_TIMED_OUT (BOB's CHANGE to it, B5). Inherited red: plane R24 (screen words), fails identically without my change.

Checks: acquisition tests 177 pass 0 fail; capture 203, capture-requests 129, monitoring 145, link-sweep 29, doorbell 77, control-plane 309 all pass; format 0 failures; architecture 0 failures; coverage 49 of 49 ids named, 0 failures; checks/run.mjs: no finding names acquisition; ownership: the only failure is build/requirements/acquisition.md, accepted by B3/B4.

Size (session_01Bvmjz46Mg98xC62DtqtJas): test runs 12, module lines 3040

## J5 · REPORT

Correction to J4: after merging tranche/T51 the acquisition suite showed 1 red (reputation.test.mjs R44, a body comparison that differed only in the new timings key, a timing flake). Fixed by setting timings aside by name; 177 of 177 pass on 3 consecutive runs. Merge the pushed head, not the one J4 named.

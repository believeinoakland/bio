# bundler (T48)

**Status** · session_01QP87w3B34Jy2n39sFBukLo · depth 2 · WORKING · handled B2

## Work (BUNDLER #18)

**Read whole** (P20, mechanics §6 step 2): `build/requirements/bundler.md`; the public parts of signatures (R1, R8, R33, R46–R48) and test-support; layer 1's contract and "Helper modules" in `build/layers.md`; every file under my `paths` (`fleet-bundle.mjs`, `provenance.mjs`, `build-plane.mjs`, `deploy.mjs`, `derive-bindings.mjs`, `resolve-version.mjs`, `jsonc.mjs`, `release-assemble.mjs`, `deploy-fleet.mjs`, `bundles.mjs`, `release-advisories.mjs`, `third-party.json`) and `tests` (`test/m/bundler/*`, the four `test/system/` suites, `fleetbundles.control.mjs`); my entry T48-4; `draft-updates.md` §1; `.github/workflows/release-sign.yml` (BOB's, read for the commands it calls).

**Entry applied: T48-4 (R32; amends R22, R23, R30).** `release-assemble.mjs`, on every run (the dry run included, K3199):
- reads `release/notes/<version>.json` (`{date, security, notes}`, optionally `version`); `[NO_NOTES]` when absent; `[NOTES_UNREADABLE]` naming the field when it does not parse, states another version or a key the notice does not carry, or `releaseNoticeStatement` refuses it, all before anything is emitted or written;
- builds the notice `{version, date, manifest, security, notes}`, `manifest` the SHA-256 of the fleet payload, `date` the notes file's, never the clock;
- `--emit-notice F` writes the statement to be signed;
- `--sign` signs it in `NS_RELEASE_NOTICE` in the same run as the plane and the payload; otherwise `--notice-sig F` (`[NO_NOTICE_SIG]`); `[NOTICE_SIG_REJECTED]` unless stock `ssh-keygen -Y verify` accepts it over the statement's exact bytes for the release's signer;
- writes `release/NOTICE.json` `{version, date, manifest, security, notes, sig, signer}` beside `RELEASE.json`.
Header usage lines and the workflow's step 4 text name the notice. The workflow itself is BOB's (`not_product`): step 4 needs no change (`--sign` signs the notice), but the cut branch must commit `release/notes/<V>.json` before the dry run, or step 3 refuses `[NO_NOTES]`.

**Tests** (`release.test.mjs`): five R32 tests: a signed notice that `signatures.verifyReleaseNotice` and stock ssh-keygen accept, in no other namespace; the date from the notes file and completion from `--notice-sig`; every `NO_NOTES`/`NOTES_UNREADABLE` case (empty `members` among them) on a dry run and a signing run, each writing and emitting nothing; `NO_NOTICE_SIG` and `NOTICE_SIG_REJECTED` (other bytes, another namespace, another key, the fleet signature), each writing nothing, with the control that completes; the dry run proves the notes and writes no notice. The fixture (`repo.mjs`) commits a notes file for its version; the R23 and R30 completions now pass `--notice-sig`.

**Waiting on SIGNATURES (T48-3).** `NS_RELEASE_NOTICE`, `releaseNoticeStatement` and `verifyReleaseNotice` are not yet on `tranche/T48`. Every run above used a local, uncommitted stand-in in `bio-plane/src/sshsig.mjs` written to signatures R46–R48's text (K3199). Committed as is, `release-assemble.mjs` and `release.test.mjs` fail to load until SIGNATURES merges; on BOB's CHANGE I merge the tranche branch, drop the stand-in, and re-run steps 5–7.

**Runs so far** (stand-in in place unless said): `release.test.mjs` 52 pass, 0 fail; `bundler.test.mjs` + `thirdparty.test.mjs` 46 pass, 0 fail; `bundle.test.mjs` exit 0; `deploybindings` 37 passed, 0 failed; `resolveversion` 12 pass, 0 fail; `fleetbundles` (stand-in removed, `agent-runner` and `file-scanner` installed) 149 pass, 0 fail, no SKIP. Checks: format 0 failures; architecture (bundler) 0 failures; coverage (bundler) 32 of 32, 0 failures; ownership 0 failures; `run.mjs` architecture 0 failures, coverage 6 failures, none bundler's (court-citations R11, file-scanner R32, jurisdictions R89–R92, ooxml R34, record-grammar R63, signatures R45 R48: T48 jobs in progress).

**Found in my own module, dealt with:** nothing beyond the entry needed fixing. **In another module:** none.

## J1 · QUESTION

Three readings of R32 I am building on; tell me if any is wrong.
1. `[NO_NOTES]` and `[NOTES_UNREADABLE]` are checked on every run, `--dry-run` included (the workflow's step 3 then proves the notes before step 4 signs), after the payload is built and before anything is emitted or written.
2. "`version` disagreeing with the release's included": the notes file `release/notes/<version>.json` may also state `version`; if it does and it is not the release's, `[NOTES_UNREADABLE]` naming `version`. Any key other than `date`, `security`, `notes` and `version` is refused the same way, naming the key (copy, never ignore).
3. signatures exports `NS_RELEASE_NOTICE` and `releaseNoticeStatement` from `bio-plane/src/sshsig.mjs`, beside `NS_FLEET` and `fleetStatement`, which is where release-assemble.mjs imports from. Until SIGNATURES merges I test against a local, uncommitted stand-in written to its R46/R47 text.

## J2 · REPORT

T48-4 is built and committed (R32), on the readings K3199 confirmed; the record's "Work" section has the detail. All my tests pass against a local, uncommitted stand-in for signatures R46–R48 (release 52/0, module 46/0, deploybindings 37/0, resolveversion 12/0, bundle exit 0, fleetbundles 149/0 with no SKIP); bundler's checks show 0 failures. Committed alone, release-assemble.mjs and release.test.mjs cannot load until SIGNATURES merges, so I am waiting on your CHANGE to merge tranche/T48, drop the stand-in, re-run and post COMPLETE.
For the workflow (yours, not_product): step 4 needs no change, but a cut branch must commit release/notes/<V>.json before step 3, or the dry run refuses [NO_NOTES].

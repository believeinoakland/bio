# bundler (T48)

**Status** · session_01QP87w3B34Jy2n39sFBukLo · depth 2 · WAITING ON BOB (J2) · handled B2

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

**SIGNATURES merged (B3, K3202).** Merged `tranche/T48` into this branch; the stand-in was never committed and is gone. `release-assemble.mjs` and the tests use signatures' own `NS_RELEASE_NOTICE`, `releaseNoticeStatement` and `verifyReleaseNotice`.

**Runs after the merge, no stand-in:** `node --test bio-plane/test/m/bundler/` 98 pass, 0 fail (release 52, bundler + thirdparty 46); `bundle.test.mjs` exit 0; `deploybindings` 37 passed, 0 failed; `resolveversion` 12 pass, 0 fail; `fleetbundles` 141 pass, 8 fail, no SKIP (`agent-runner` and `file-scanner` installed). The 8 are other modules' merges into `tranche/T48` staling committed bundles bundler does not own: the plane's (`not_product`; inputs `src/sshsig.mjs`, `src/ooxml.mjs`, `src/record-grammar/{bundle,document,ids,labels,types}.mjs`, `../court-citations/{index,court-data}.mjs`) and agent-worker's (`../bio-plane/src/record-grammar/ids.mjs`). My diff touches none of their inputs, so they are red on the tranche branch as well. BOB regenerates both at layer 1's close (manifest, "Generated artifacts"). Before the merge, with the stand-in parked, the gate was 149 pass, 0 fail.

**Checks after the merge:** format 0 failures; architecture (bundler) 0 failures; coverage (bundler) 32 of 32, 0 failures; ownership 0 failures (4 files); `run.mjs` architecture 0 failures, coverage 10 failures, none bundler's (ai-accounts, calculations, connections, duties, events, explore, jurisdictions, membership, people, standards: their T48 jobs).

**Found in my own module, dealt with:** nothing beyond the entry needed fixing. **In another module:** none.

Size (session_01QP87w3B34Jy2n39sFBukLo): test runs 12, module lines 3531

## J1 · QUESTION

Three readings of R32 I am building on; tell me if any is wrong.
1. `[NO_NOTES]` and `[NOTES_UNREADABLE]` are checked on every run, `--dry-run` included (the workflow's step 3 then proves the notes before step 4 signs), after the payload is built and before anything is emitted or written.
2. "`version` disagreeing with the release's included": the notes file `release/notes/<version>.json` may also state `version`; if it does and it is not the release's, `[NOTES_UNREADABLE]` naming `version`. Any key other than `date`, `security`, `notes` and `version` is refused the same way, naming the key (copy, never ignore).
3. signatures exports `NS_RELEASE_NOTICE` and `releaseNoticeStatement` from `bio-plane/src/sshsig.mjs`, beside `NS_FLEET` and `fleetStatement`, which is where release-assemble.mjs imports from. Until SIGNATURES merges I test against a local, uncommitted stand-in written to its R46/R47 text.

## J2 · REPORT

T48-4 is built and committed (R32), on the readings K3199 confirmed; the record's "Work" section has the detail. All my tests pass against a local, uncommitted stand-in for signatures R46–R48 (release 52/0, module 46/0, deploybindings 37/0, resolveversion 12/0, bundle exit 0, fleetbundles 149/0 with no SKIP); bundler's checks show 0 failures. Committed alone, release-assemble.mjs and release.test.mjs cannot load until SIGNATURES merges, so I am waiting on your CHANGE to merge tranche/T48, drop the stand-in, re-run and post COMPLETE.
For the workflow (yours, not_product): step 4 needs no change, but a cut branch must commit release/notes/<V>.json before step 3, or the dry run refuses [NO_NOTES].

# bundler (T48)

**Status** · session_01QP87w3B34Jy2n39sFBukLo · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings of R32 I am building on; tell me if any is wrong.
1. `[NO_NOTES]` and `[NOTES_UNREADABLE]` are checked on every run, `--dry-run` included (the workflow's step 3 then proves the notes before step 4 signs), after the payload is built and before anything is emitted or written.
2. "`version` disagreeing with the release's included": the notes file `release/notes/<version>.json` may also state `version`; if it does and it is not the release's, `[NOTES_UNREADABLE]` naming `version`. Any key other than `date`, `security`, `notes` and `version` is refused the same way, naming the key (copy, never ignore).
3. signatures exports `NS_RELEASE_NOTICE` and `releaseNoticeStatement` from `bio-plane/src/sshsig.mjs`, beside `NS_FLEET` and `fleetStatement`, which is where release-assemble.mjs imports from. Until SIGNATURES merges I test against a local, uncommitted stand-in written to its R46/R47 text.

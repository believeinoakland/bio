# case-authoring (T47)

**Status** · session_01RymrBMQ5XEGoEKerL7JfqT · depth 2 · WORKING · handled B1

## J1 · REPORT

Started and read: requirements whole, split map, my code whole (all five files); my tests (512 KB, over the reading-set limit) read in full by two helpers in this session, who wrote me digests citing each test by line (K2032, §17 (3)).

Done while case-inputs is unmerged (commits 879ab186d0, then signing.test.mjs):
- R75: the sign step answers `publish_at` exactly as `caseRatifyPreflight` answers it (read from the one call R34 makes); not reached, `publish_at: null` with `publish_at_stated` saying so; reached with no offer in the answer, null with a second sentence. Never a blocker, `first` or `ready`. Tested over the real ratification with and without `jurisdiction_profiles` (`test-port-ellery`).
- R76: tested at the interface (no code change; `tieAttested` already taken): absent, null, false, "yes", "true", 1 and a body's own list each refused TIE_ATTESTATION_MISSING naming the signer, nothing written; the pre-flight answers it `first`; `true` stores the signer's attestation with the act's instant.
- Module tests: 214, 213 pass, 1 fail: t46-words.test.mjs:193 (K3022's inherited red, DEC-199 removed `signing.openrequest.nowindow`), which leaves with the R73 arms at the delete.

Waiting for your CHANGE after T47-31 merges to delete the copies (§3, §4). Plan for the tests at that point, so you can object before: statement, drafts, outcomes, openrequests, waiting, invariants and dec149's arms of class "moved code only" are deleted here (case-inputs holds them); t46-words.test.mjs is deleted whole (its row arms are case-inputs R10/R17's; its sign-step arms are re-kept in openrequests.test.mjs as R34 end-to-end, reading `case-inputs.openRequestLine`); the end-to-end arms stay re-tagged R14 (acknowledgement listed, writer printed), R74 (outcomes), R34 (sign-step lines), R38 (adopted draft), R58, driving the moved setup acts through `caseInputsOf(host)`. invariants' K2675 arm is re-pointed: case-authoring now declares nothing, so its factory's throw is case-inputs'. account.test.mjs:454's "what case-authoring keeps" control is re-worded to assert the moved methods are gone.

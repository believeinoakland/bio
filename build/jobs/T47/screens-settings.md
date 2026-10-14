# screens-settings (T47)

**Status** · session_01PwGaGNvnbTEtbYSeV4VfBz · depth 2 · WORKING · handled B1

## J1 · QUESTION

Started; reading set read whole (my code and tests too). None of my providers (setup-words R7, op-declarations R57/R59, instance-setup R82/R84/R85, interface-shell R27/R39/R40, credentials' R70 state through the door) is merged yet, so I am building against their requirement text and will run my tests when your CHANGEs bring them. Questions, each with the best reading I am building on:

1. **cs.signer's call (R22; interface-shell R40).** R40 says the kit "answers the public line for signerregisterown" but names no call. Best reading: `await cs.signer.publicLine()` answers the `ssh-ed25519 <b64> <comment>` line (or null when the member declines), the keep choice being the kit's own UI. Please fix the call's name and answer with INTERFACE-SHELL and tell me.
2. **Sign-outs drawing front's signed-out state (R21).** No kit call hands the shell "signed out". Best reading: after `signout`/`signouteverywhere` answer, the screen calls `cs.signedOut()` (the shell's R4/R32 path: clear the record, draw front's signed-out state). Same request to INTERFACE-SHELL.
3. **grouplogoset's image (R18; instance-setup R84).** How the image travels is undecided. Best reading: the file's raw bytes as the request body (`{raw, rawType}`, the file's own type), nothing in the address.
4. **grouplanguages' answer field (instance-setup R85).** Best reading: `{languages: [tags]}`; `grouplanguagesset` body `{languages}`.
5. **group-identity's "who sees each part" (R14).** `groupdescriptionset` (membership R109 as built) takes one `visibility` (`members`/`public`) for the whole record. Best reading: one choice drawn for the whole description, worded as such; no per-part control.
6. **"reasoned" in R23 (`passwordresetlink`, `signerset`).** Neither op takes a reason field; friction is the shell's by op-grades' rung. Best reading: I add nothing; the shell asks a reason where graded reasoned, and it is sent as `reason` (ignored by credentials). If you want it recorded, that is a credentials change, not mine.
7. **SIGNIN_CODES in my tests (R24).** Importing agent-worker's `SIGNIN_CODES` in my tests would be a new edge. Best reading: my test pins the 17 codes as agent-worker R84 exports them today, plus the door's four (`AI_KEPT_AWAY`, `DISCLOSURE_DUE`, `AGENT_WORKER_UNBOUND`, `AGENT_WORKER_SILENT`).
8. **R11's key.** words.json at PR #33 also holds `ai.label.untested.writinghelp` ("this help with writing…"); R11 binds `ai.label.untested`. Best reading: `ai.label.untested` as R11 says; my own row for it goes once WORD_ROWS (R7) holds it.

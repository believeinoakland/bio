# screens-settings (T47)

**Status** · session_01PwGaGNvnbTEtbYSeV4VfBz · depth 2 · COMPLETE · handled B5

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

## J2 · REPORT

**Progress.** Built and pushed (`job/T47/screens-settings`): the new screens `settings` (R17), `group` (R18), `places` (R19), `recovery` (R20), `group-identity` (R14), `security` (R15), `translations` (R16); `members` (R12 name as reference, R23 reset link, signing-key withdrawal, "More for administrators"), `account` (R12 `cs.appearance()`, R21 sign-outs with `cs.signedOut()`, R22 `cs.signer.publicLine()`), `connect` (R13 `part_signin`, R24 every `SIGNIN_CODES` code in words, state from the plane, since/until, "connect again", whole-code help, start disabled in flight), `notes` (R11). Tests name every live id (coverage 24/24); format, architecture, ownership 0 failures. Module now 2,190 lines.

**Waiting on merges.** My tests cannot run on the branch until these merge: setup-words R7 (`WORD_ROWS` at PR #33), wizard-scripts R35 (registry), op-declarations R57/R59 (`passwordresetlink`, `grouplogoset`, `grouplanguagesset`), instance-setup R82/R84–R86, interface-shell R27/R39/R46 (`cs.appearance`, `cs.fill`, `cs.later`, row name as reference, the reference beside a refusal, `cs.signedOut`, `cs.signer.publicLine`). Against scratch stand-ins of exactly those, 79 of 83 tests pass; the other 4 are the stand-ins' own gaps (real `OPS`, real `WORD_ROWS`, the R27 row name). One test seam to fit to the real harness once merged: how a test answers the signer (`press(..., {signer})`).

**For other modules (to BOB):**
1. **interface-shell R12's `ADMIN_ACTS`** names membership's, the group key's and `aikeepaway`; it does not name `passwordresetlink`, `signerset`, the group settings (`groupnameset`, `grouplogoset`, `groupdomainset`, `grouplanguagesset`, `courtnoticeset`, `hostingaccessset`), `profilesset`, `placewanted`, `officesseed`, `translationgrant`, `translationrevert`, `securitytool*`. A member who does not administer would be drawn them by the shell; I gate each on `whoami`'s `administer` in my screens, but the shell's set should carry them.
2. **op-grades:** `translationdraft` is `undetermined`, so the shell asks a reason for asking a draft (R11's rule); `groupdescriptiondraft` and `securitymap` have no row. Reported only.
3. **words.json:** the reset link's words are still under `act.owed_passwordresetlink.*` (DEC-201's owed key); I draw the label by that key. Its `.does` says "Civicsmith sends no email" bare (DEC-149) — the design stream's.
4. **record-grammar's machine vocabulary** (R15) is copied as a literal into `places`' render (a self-contained function cannot import), so an office added by a member is marked. If the vocabulary changes, mine goes stale; a kit call (`cs.isMachine`) would remove the copy.

## J3 · REPORT

B3 done: tranche/T47 merged (setup-words, instance-setup, wizard-scripts, op-grades). On the branch every test still stops at interface-shell's check, since op-declarations' passwordresetlink spec (R57) is not merged. With only that spec and interface-shell's R27/R39/R46 kit calls stood in, 81 of 83 pass; the 2 left are exactly those two providers (OPS holds passwordresetlink; the row name as reference). Nothing else needed from me until their CHANGEs.

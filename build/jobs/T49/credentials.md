# credentials (T49)

**Status** · session_01C6HsrkoFjNZGt4BJNLj9Gm · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

Three readings I am building on; nothing waits on the answers.

1. **R76 and the founder's grant viewer.** R27 says the grant's "viewer is the member", and `aiGrantHeld`/`aiGrantAdmit` answer `viewer: member:<id>`. For the founder that gives `member:admin`, which no member row backs; her own session's viewer everywhere else is the bare `admin` (admission `resolveSession`, root-administrator sight). My reading: R76 only admits her session as her own, so I leave the viewer formula as R27 has it (`member:admin`, the narrower sight; her Ask then reads as a bare member would). Answering `admin` instead would give the AI her full administrator sight on a read-only grant, which is a wider authority than any member grant carries, so I will not do it unless you say so. Which do you want?
2. **R77 and where NO_TOKEN_FP falls.** R74 fixes the order of the handle's refusals; R77 does not place NO_TOKEN_FP. My reading: after R38's pause and before PASSWORD_TOO_SHORT (it is a defect of the call, not of the secret), counted as a refused claim toward R38's window and R44's `signin` like every other, writing nothing else. Its row is C-29.48 (new, `ACCOUNT_CHECKS`, for T49-4's stamp).
3. **R71 (5) against `words.json`.** Plan rule 6 has the row translations that `words.json` keys read by key. `refusal.RECOVERY_REFUSED` there does not say "member", while R71 (5) says RECOVERY_REFUSED does. My reading: the requirement is met by the answer's `detail` ("not an active member's now"), and the row's `translation` is the key's text verbatim. If R71 (5) means the translation, the key's text needs the word, which is the design stream's.

## Work record (T49-3)

**Entries applied:** R74 (claim takes `handle`, recorded through `membership.founderHandleSet` in the claim's one act; HANDLE_FIXED path through the same service), R75 (`login` and `recover` resolve `handle` via `#roleByHandle`; `role` no longer read; unknown handles count under `handle:<as typed>`), R76 (`#ownSession`: the founder's live session is her own for her own grant; `#liveGrant` uses it), R77 (`bootstrapState` re-arms only on a recorded fingerprint that differs; a claim with no `tokenFp` records none; K3337 dropped NO_TOKEN_FP and its row, so no new row from this job). Per K3337 `handle` is optional at the claim: none given holds no founder handle. Plan rule 6: N1075 five rows read by key (`CREDENTIALS_WORDS`: SIGN_IN_PAUSED, NOT_SIGNED_IN, RECOVERY_REFUSED, CURRENT_PASSWORD_WRONG, AI_RUN_CREDENTIAL_MALFORMED), N1068 none found, N1073 (`grant` R28 list and `rows-ops` op list no longer hand-list foreign ops), D29 n/a.

**Read:** requirements, code and the tests naming R1, R2, R4, R5, R27, R38, R47, R67 whole; the other tests were run.

**R72 not retired.** My grep and an instrumented run of 34 module test directories (3746 tests) found callers, so every delegate and the `aiAccountsOps` spread stay. Called on a `credentials` object: `signin-door/ops.mjs` (src): disclosureDue, subscriptionTokenHold, subscriptionTokenRefused; `plane` tests (ask, t33, t41–t47): accountFor, accountReferenceSet, accountReferenceState, accountUsesSet, aiKeepAwaySet, aiKeptAway, disclosureDue, registerDisclosureRead, groupKeyNoticeSeen, groupKeySet, groupKeySwitch, subscriptionTokenHold; notice-producers `accounts.test` subscriptionConnected; the spread: `affordances` t33/t34, `control-plane` t34-routes, digest-channel, `admission` authentication (credentialsOps keys and routes); `ACCOUNT_CHECKS` view: control-plane r53-routes.test. Delegates with no caller found (accountReferenceFor, accountUsesOf, groupKeySwitches, project*, ...) are only reached by the spread or not at all; I did not prune them, since the spread calls the route-backing ones and the rest are unproven by static grep. R72's text stands.

**`claim` callers (R77, R74):** source: `control-plane` op=claim passes `fp` always (hash of ADMIN_TOKEN) but sends body `{role:"admin", password}` with no `handle`: until T49-29 the founder's handle is never recorded. With no handle (accepted since K3337, so green): monitoring `ticks.test:335`, tasks `check.test:86`, `inbox.test:123,519,749`, provenance `convert-testimony-digest.test:129`, ai-runs/bias `world.mjs`, capture-sources `credentials.test:50`, control-plane `t34-routes:179,198`, store-door `dispatch:506`, `routes:103,346`, instance-setup fixtures (`assistant.test:20`, `recovery.test:19,80`), host-governor `ops.test:289`, members.test:336. `instance-setup/recovery.test.mjs:36` calls `recover({role})` (now unknown). These are 250 failures in the instrumented run, mostly pre-existing reds plus these.

**`admin` grep (N1072):** the founder's id reaches readers as: `claim`, `login`, `recover`, `passwordChange` answers (`role: "admin"`); `session()` (`role`, `member: "admin"`); `status_by`/`registered_by`/`set_by`/`made_by`/`minted_by` rows when she acts (signers, keyed services, reset links, AI credentials); a founder grant's `member`/`viewer` (`member:admin`). All ids for the screens and gates, none a displayed name here; screens must show `handle` (`session().handle`).

**Real membership:** merged `tranche/T49` (B2); the stand-in `r144-shim.mjs` and its installs are deleted. J1 answers (B3) applied: viewer stays `member:admin`, with a test that the founder's Ask reads her own project; RECOVERY_REFUSED stays by key.

**Tests:** `node --test bio-plane/test/m/credentials/`: tests 153, pass 153, fail 0 (real membership). Checks: format 0 failures; architecture 0 (26 files); coverage 53 of 53; ownership 0.

Size (session_01C6HsrkoFjNZGt4BJNLj9Gm): test runs 14, module lines 2150

## J2 · REPORT

credentials is built and green against a stand-in for membership R144 (151/151; format, architecture, coverage 53/53, ownership clean). Two things need BOB:

1. Membership T49-1 has not merged. Send a CHANGE when it has; I merge `tranche/T49`, delete `r144-shim.mjs`, re-run against the real service and post COMPLETE. Your J1 answers (founder grant viewer, NO_TOKEN_FP order, RECOVERY_REFUSED wording) can come with it.
2. R72 is not retired: callers exist (named in my record), so every delegate and the spread stay. R72's text needs no change from me; other modules' fallout is also in the record: control-plane's claim relay sends no handle (NO_HANDLE until T49-29), and ~15 other modules' tests claim without a handle or tokenFp.

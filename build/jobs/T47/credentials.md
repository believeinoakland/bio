# credentials (T47)

**Status** · session_01Csi1Fo3kzaT6U7ZrzWhbum · depth 2 · WORKING · handled B4

## J1 · QUESTION

R63's keep-away refusal: "the group's keep-away (R35's `aiKeptAway()`) `AI_KEPT_AWAY`, as R27 is refused". R27 asks `aiKeptAway({use: "ask"})`; R63 names `aiKeptAway()` with no argument, which (R57) refuses whenever the group's limit is on, whatever uses it covers.

My best reading, which I am building now: the literal one, `aiKeptAway()` with no `use` and no `project`: a group limit that is on refuses every segment mint, whatever its `uses` (fail closed; R63 receives no use or project to ask with). The alternative is `aiKeptAway({use: "run"})`, so a group limit covering only, say, `standing` would not stop a run. Answer only if you want the alternative; nothing else waits on it.

## J2 · COMPLETE

T47-9 complete. Commits on `job/T47/credentials`: R63, then R64 with R22's clause and the tests.

**Entries applied**
- **R64 (N981; K231, K3030):** `registerDisclosureRead(module, fn)` takes one registration, whoever makes it. A malformed or second registration is refused through `membership.listenerRefusal` (R81). `disclosureDue({member})` is an in-plane read that no route reaches. It answers `null` when none is registered or when `fn` answers `shown: true`; otherwise it answers the one `DISCLOSURE_DUE` refusal. A throw, `shown: false`, any non-`true` value or a promise all fail closed. Row C-29.40 (`where` `disclosureDue > is-disclosure-shown`) reads its translation by key from `AI_WORDS['refusal.DISCLOSURE_DUE']`, `words.json`'s sentence verbatim (the test reads `words.json` itself).
- **R22 (T47 clause):** `accountReferenceSet` with `kind: "apikey"` asks `disclosureDue({member: by})`. `by` is the door's stamp, the form control-plane R65 asks `disclosureof` with. It is asked after MACHINE / NOT_YOUR / NOT_ACTIVE / UNKNOWN_KIND / NO_SECRET and before the seal, and writes nothing. `accountReferenceRemove` is never refused for it.
- **R63 (N955; K2976, K3033, K3036):**
  - `aiRunCredentialMint({member, run, writes})` is in-plane only.
  - Its refusals, in order:
    - a member who is not active (unknown, revoked or machine) is refused `ACCOUNT_MEMBER_NOT_ACTIVE`;
    - a missing or malformed `run` or `writes` is refused `AI_RUN_CREDENTIAL_MALFORMED` (C-29.41, in `AI_CREDENTIAL_CHECKS`, naming `what`);
    - then `aiKeptAway()` with no argument, per your answer K3036.
  - It mints a member-scoped row (`principal` `member:<id>`, `minted_by` the member, `task_scope` `run`). The row holds:
    - only the SHA-256 of the token, which has the gate's shape `aik-` + 64 hex;
    - `run` in a new additive column `ai_credentials.run`, indexed;
    - `writes` as a sorted, de-duplicated subset of the exported, frozen `AI_RUN_WRITES` = airuntick, suggest, capturerequest, airunclose, optionpropose.
  - `AI_RUN_CREDENTIAL_TTL_SECONDS` = 6 hours (under a day), never renewed.
  - It answers `{ok, tokenId, token, run, writes, expiresAt}` once.
  - Earlier live credentials of the same run are revoked in the same act as the mint.
  - `aiRunCredentialsEnd({run})` answers `{ok: true, revoked}`, or `{ok: false, …}` if the store cannot be written; it never throws.
  - Her run credentials are also revoked by:
    - R16's listener (`revoked_by` the notice's actor);
    - R43's sign-in clearing, both her own disconnection and the clearing at revocation; this applies only when a sign-in was held, so nothing else changes.
  - `aiCredentialLook` and `aiCredentials` answer `run` for every credential (null for R12's).

**Improvement made (P8):** R33's `groupKeySet`, `groupKeyRemove` and `groupKeySwitch` now write the key and its records (`group_key_acts`, R61's change) in one transaction. Before, they were separate statements. Module header updated to R1–R64.

**Deferred:** none.

**Found in other modules (for BOB):**
1. **Who registers R64:** nobody yet. The entries of instance-setup (T47-75) and plane (T47-66) mention the export and the registration (K3030). Until then R22's refusal is not asked in the assembled plane.
2. **The registered `fn`'s `member` form:** it receives `{member}` exactly as R22's `by` stamp arrives. instance-setup's `disclosureOf` matches the member string as stored by `disclosureshown`, so the two must agree on the stamp's form, as control-plane R65 already assumes.
3. **ai-runs R18's T47 clause** still says R63's list "names the four check writes only"; R63 now also names `optionpropose` (K3033). This is wording for BOB.
4. **answer-envelope `DOOR_WORDS['refusal.DISCLOSURE_DUE']`** (`answer-envelope/checks.mjs:19–22`) holds the interim sentence. It no longer equals `words.json`'s, so its `envelope.test.mjs` R8 is red on `tranche/T47` already, before my merge; my row reads `words.json`'s. C-69.6 retires at T47-65 (rule 5 (7b)).
5. **The gate confining an `ai` credential to its run** is admission's (its R10). `aiCredentialLook` now answers `run` for it.
6. **The page's interim mint** (`screens-inquiry/assistant.mjs:167`, the one-day credential with `airunopen` and `airundispatch` among its writes) is still in place. Its retirement is T47-61/T47-20's.

**Reading:** I read whole my requirements, `checks.mjs`, `schema.mjs`, `index.mjs` (3,016 lines), the plan entry and rules, and layer 2's contract. The reading set is over the 600 KB limit, so two helpers in this session (mechanics §17 (3)) read in full and wrote digests citing sections:
- every file under `bio-plane/test/m/credentials/`: 22 files, 175 tests;
- the Public parts of record-grammar, record-core and membership;
- the cited passages of answer-envelope, instance-setup, control-plane, ai-runs, admission and agent-worker.

I read the rows and fixture I changed or used myself.

**Test flaws the helper found, left as they are (none affects a live id's coverage):**
- `t40.test.mjs:509` asserts something always true;
- `t35-misc.test.mjs:163, 179–180` and `t41:54`, `t42:142` check the tests' own values;
- `t36.test.mjs:328` and the timing tests in `signin`/`t35-signin` may be flaky at hour boundaries or under load.

These are in my tests path. I did not change them in this job: fixing them is a rewrite of tests that pass and bear on no T47 entry. I list them for a later entry.

**Tests and checks:**
- credentials `node --test test/m/credentials/*.test.mjs`: tests 179, pass 179, fail 0. The new `t47.test.mjs` names R22 (T47 clause), R63 and R64, each refusal with a control. `rows-ops` and `ai` were re-pinned for C-29.40, C-29.41 and `run`.
- The tests of every module that uses credentials (39 `test/m` directories) were run on this branch and on `tranche/T47`. Mine: tests 3903, pass 3884, fail 17. Base: tests 3893, pass 3872, fail 19. Every red on mine is red on the base (rule 5 (7a) design-file reds and answer-envelope R8), and none is new.
- agent-worker's two tests that import credentials: 2 pass.
- `checks/format.mjs`: 0 failures. `architecture.mjs bio credentials`: 0 failures. `coverage.mjs bio credentials`: 63 of 63, 0 failures. `ownership.mjs bio credentials tranche/T47`: 0 failures.
- `checks/run.mjs`: architecture 3060 files, 0 failures; coverage's 12 failures are other modules' T47 ids (rule 5 (1)), none of them credentials'.

Size (session_011wSZT8CGnm3MLDqCvn7JJo): test runs 8, module lines 4027

## J3 · QUESTION

T47-81: my readings, which I am building now. Answer only where you want otherwise.

1. **`SESSION_LOCKED`.** R65 names no code for an act under a locked session. Your way-in draft (§4 item 1, and admission's T47-77) names a row `SESSION_LOCKED` minted here. I mint it once, in C-29, as an in-plane read `sessionLockedRefusal` for admission to relay. My own acts under a locked session answer it too: `passwordChange` and `aiGrantMint`. Locked `session()` answers `locked: true` with no capability, `administer` false and `rootOfTrust` false, so a gate that misses the flag grants nothing.
2. **`REAUTH_DUE`.** R66's row is minted by an in-plane `reauthDue({token})`. It answers null while the session's window is open and the refusal otherwise, a locked or ended session included. Admission (T47-77) relays it, and so does whichever gate serves `accountreferenceset` and the sign-in's `start`; this module receives no session stamp on those acts. `reauth` on a locked session also clears the lock, since it is the same password. A wrong password is `SIGN_IN_REFUSED`, counted under R38 as `unlock`'s is.
3. **The founder as an account holder (R70, C5).** The founder (`admin`, once claimed) counts as active wherever R22's refusals ask "active". That covers `subscriptionTokenHold` and `subscriptionConnected`, and also disconnecting, the switches (R55), the state (R23) and recovery codes (R68). Otherwise the founder could hold a token they could not drop. The alternative is R70's hold alone.
4. **R70's "clearing a project's sign-in (R54) drop the token".** A project's sign-in account holds no token of its own: it uses its member's held token. So removing or replacing a project's sign-in account (`projectAccountRemove`, `projectKeySet`, `projectSigninSet`) leaves the member's own token in place. Her token is dropped by her disconnection, her revocation, or Anthropic's refusal (R43, R16, `subscriptionTokenRefused`); each of those also clears every project's sign-in account of hers, as today. The alternative is that a project owner's removal of a sign-in account also disconnects that member personally.
5. **R68's refusal.** `recoveryCodesIssue` by anyone but an active member or the claimed founder (a machine, unstamped, revoked) can no longer be `NOT_AN_ADMIN`. It gets a new row, `RECOVERY_CODES_NOT_A_MEMBER` (C-96.53, beside `RECOVERY_REFUSED`). `RECOVERY_REFUSED`'s translation is re-worded from "administrator" to "member" (a row change for the census).
6. **R69's rows (C-29).** These are `RESET_LINK_DEAD` (look and reset, one answer for every dead arm) and `RESET_LINK_MEMBER_NOT_ACTIVE` (the make, for anyone but an active member; the founder recovers by codes or ADMIN_TOKEN). A dead link in `passwordReset` is counted under R38 and in R44's `signin`, as a refused recovery is. The ops are `passwordresetlink`, `passwordresetlook` and `passwordreset`, with the link from the body only, never the query.
7. **R65's `shared` cap.** A `shared` session keeps R4's `ttlSeconds` cap (12 hours by default) beside its 15 minutes of idle time. An `own` one is capped at 30 days. The `session` route reads `background=1` from the query as "not activity"; that flag is control-plane's to send.
8. **REPORT (membership):** the handle `admin` is not reserved. R16's handle pattern lets a member enrol as `admin`, while R67 makes `admin` the founder's handle. Such a member could sign in only by role, never by handle. Membership should reserve the handle `admin`. I map `admin` to the founder before asking `memberByHandle`, so no member can sign in as the founder.

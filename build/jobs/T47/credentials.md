# credentials (T47)

**Status** · session_01Csi1Fo3kzaT6U7ZrzWhbum · depth 2 · COMPLETE · handled B4

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

## J4 · COMPLETE

T47-81 complete (R65–R71). Commits on `job/T47/credentials`: the job, then one fix found by the users' tests.

**Reading set (mechanics §17).** I read whole: the requirements (public and private), `index.mjs`, `schema.mjs`, `checks.mjs`, layers.md's layer 2 contract, the plan's T47-81, and the way-in and L6-connect drafts' credentials sections. Two helpers each read in full and wrote a digest citing each section (K2032):
- the module's 23 test files, 5,494 lines;
- the public parts of membership, record-core and record-grammar, `requirements/README.md`, and the requirement lines of the users that name these services.

**Entries applied**
- **R65 sessions by device and inactivity.**
  - `login` takes `device` (`own` or `shared`; absent or anything else is `shared`). It is recorded on the session and answered.
  - Activity is any `session()` read not marked `background` (the route reads `background=1`); a read while locked is not activity.
  - A `shared` session ends after 15 idle minutes, and keeps R4's `ttlSeconds` cap (R71 (7)).
  - An `own` session locks after 30 idle minutes, ends 12 hours after it locked, and ends in any case 30 days after its sign-in.
  - A locked `session()` answers `locked: true` with no capability, `administer` false and `rootOfTrust` false.
  - `unlock({token, password})` is under R38's window and compared as R41 states. A wrong password is `SIGN_IN_REFUSED`, counted, leaving the session locked.
  - New session columns, additive: `device`, `last_active`, `reauth_until`. A row with no `last_active` counts as active now: `migrate` sets it at boot, and so do other modules' fixtures, which insert sessions directly.
- **R66 / R71 (2).**
  - `reauth` opens a 5-minute window, answered as `session().reauthUntil`.
  - `reauth` also clears a lock. A wrong password is `SIGN_IN_REFUSED`, counted.
  - `reauthDue({token})` is the in-plane one site of `REAUTH_DUE` (C-29.42). It answers null inside the window, and the refusal otherwise, a locked or unknown session included.
- **R71 (1).** `SESSION_LOCKED` (C-29.43) is minted once, by the exported static `Credentials.sessionLockedRefusal()`. `passwordChange` and `aiGrantMint` answer it under a locked session, and an ask grant is not admitted while its session is locked. Sign-out is served while locked.
- **R67 sign-in by handle.**
  - `login` and `recover` take a `handle`, which wins over `role`. `admin` is the founder's, mapped before `membership.memberByHandle`.
  - An unknown handle becomes the role `handle:<h>`, under which no credential is held. Every arm is therefore one refusal at one cost (tested within 5×).
  - The window is keyed by the resolved role.
- **R68 / R71 (5).**
  - Any active member, or the claimed founder, issues codes; anyone else is refused `RECOVERY_CODES_NOT_A_MEMBER` (C-96.53).
  - `recover` serves any active member's role.
  - `RECOVERY_REFUSED`'s translation and detail now say "member".
- **R69 / R71 (6).**
  - `passwordResetLinkMake`, `passwordResetLook` and `passwordReset`, on the ops `passwordresetlink`, `passwordresetlook` and `passwordreset`. The link is read from the body only.
  - A new table, `password_reset_links`: only the SHA-256 of a link, with `made_by` and `made_at`. It is declared never exported and exempt from purge.
  - One live link per member; it lasts 7 days.
  - The reset is under R38's window. It sets the password as R3 does, ends every session of the member, and spends the link.
  - `RESET_LINK_DEAD` (C-29.46) is one answer for every dead arm (unknown, expired, spent, superseded, or ended by revocation, R16). A dead reset is counted under R38 and R44.
  - `RESET_LINK_MEMBER_NOT_ACTIVE` is C-29.47.
- **R70 / R71 (3), (4).**
  - `subscriptionTokenHold` seals the token under `member:<id>`, kind `signin`, in new columns of `subscription_connections`. It records the fact and a `signin_set` change, and answers `{ok, since}`.
  - Its refusals are `ACCOUNT_MEMBER_NOT_ACTIVE` and `SUBSCRIPTION_TOKEN_MALFORMED` (C-29.45).
  - `valid_until` is computed from `validFor` when that is a whole number of days or years ("1 year", "30 days", or a bare number of days).
  - "Connected" now means a token is held. A fact with none answers not connected, and the cascade goes on.
  - `accountFor` answers `key` for a held sign-in, at the member's level and the project's. A project's sign-in account whose member holds no token is `SIGNIN_NOT_HELD` (C-29.44).
  - `subscriptionTokenRefused` drops the token, records `refused_at`, records a change, and clears her projects' sign-in accounts.
  - Disconnection and revocation drop the token with the row, as before. Removing or replacing a project's sign-in account leaves the member's token.
  - `accountReferenceState.subscription` is `{connected, since, held, valid_until?, refused_at?, uses}`.
  - The claimed founder counts as active wherever R22's refusals ask it (`#holderActive`).
- **R16.** Revocation also ends the member's live reset links.

**Improvement made (P8).** My T47-9 test of R63 read the credential's `expired` at the real clock, outside its fake clock, so it went red once today passed the minting instant plus 6 hours. It now reads at the mint's instant. This was a test flaw, not a code flaw.

**Tests changed for the amended requirements.** None was weakened; each change follows a requirement:
- a fixture `signin(id)`, which holds a sentinel token, replaces the bare `subscriptionConnected` wherever a test needs a serving sign-in (R70);
- the session's and login's shapes and the session columns (R65, R66);
- recovery codes for ordinary members (R68);
- the founder may hold an account (R71 (3));
- the row and route censuses gain the new rows and routes;
- the seam's table counts gain `password_reset_links`.

New file: `t47-signin.test.mjs`, 22 tests naming R65–R71, each limit tested at a fake clock one second either side, each refusal with its control.

**Size.** Module lines: 4,027 → 4,433 (+406). The job's whole diff: 16 files, +1,072 / −159.

**Deferred:** none.

**Found in other modules (REPORT).** The tests of credentials' users (P11), run on this branch and on `tranche/T47` and compared. Every red that is new on this branch has one of two causes.
1. **R70: a bare `subscriptionConnected` no longer serves.** Each of these tests connects a sign-in by the fact alone, and each needs `subscriptionTokenHold` (or a fixture that holds a token) and a `key` on a sign-in account:
   - ai-runs `scheduler.test.mjs` and `t46.test.mjs` (6);
   - ai-use `limits.test.mjs` R2 (1; its other 5 reds are on the base);
   - answers `standing.test.mjs` R19 (1);
   - question-explorer `choosing.test.mjs` R3 (1);
   - notice-producers `accounts.test.mjs` (8, via its `setup`);
   - plane `t46.test.mjs` R33 (1; the "no secret for a sign-in" test that T47-66 retires).

   Their L6 and L11 entries (T47-20, -70, -66, and the users' own) re-point to the held token. notice-producers, answers and question-explorer have no T47 entry for this as far as I can see, so BOB should place them.
2. **My five new routes have no spec yet.** op-declarations R19 and R30 (2 new reds) list `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook` and `passwordreset` as served without a spec. T47-53 (R58) adds them.

**Same on both branches.** case-authoring (1), affordances (2), answer-envelope (1) and plane R5/R9 (1) are red on both, accepted under rule 5. reading-pipeline's 2 reds on the base did not recur here.

**No generated artifact.** No generated artifact reads credentials directly; the plane bundle is staled as by any merge (rule 5 (4)).

**For the gates (no change made here).**
- `session()` now answers `device`, `locked` and `reauthUntil`.
- control-plane should send `background=1` for background requests and pass `handle` and `device` to `login`.
- admission relays `sessionLockedRefusal` and `reauthDue`.
- `src/gate.mjs`' running comment list of codes does not yet name C-29.42–.47 or C-96.53.

**Checks.**
- Module tests: `node --test test/m/credentials/` gives 201 pass, 0 fail.
- `format`: 0 failures.
- `architecture`: 0 failures for credentials (27 files).
- `coverage`: 70 of 70 live ids named by a test, 0 failures.
- `ownership`: 0 failures.
- `checks/run.mjs`: format, architecture and channels at 0. Coverage has 45 failures, none of them credentials'; all are other modules' not-yet-met ids (rule 5 (1)).

Size (session_01Csi1Fo3kzaT6U7ZrzWhbum): test runs 34, module lines 4433

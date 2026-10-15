# admission (T49)

**Status** · session_01UMUMxYiouq4PiTjhcRQTAV · depth 2 · COMPLETE · handled B6

## J1 · REPORT

START findings (admission, T49-18).

1. M-T49-4, local arm, by reading the screens and the shell (no live biosmoke8 arm run from here). A signed-in page load makes at most 5 public requests: the shell's `groupidentity` (browser.mjs:1835) and its `bootstrap` (:1903), and, on Home, the screen's `groupidentity`, `bootstrap` and `grouplanguages` (screens-daily/home.mjs:25–35). 5 is within your 7, so `SESSION_WINDOW.limit` stays 3000: 400 loads x 5 = 2,000 per session in 10 minutes. No re-set needed.

2. How the session travels: every shell call sends it in the `Authorization: Bearer` header (browser.mjs:106), never a body `token`. So `doorWindowGate` can read it from the request. I will give it two optional inputs, `credential` (the door's `presentedCredential` answer, which also covers a body `token`) and `background` (the door's mark). Without them it reads the header from `req` and `background=1` from `req.url`, so control-plane works unchanged but a body-borne token would stay in the source's window.
   Line owed to control-plane's T49-29 through you (P9), at `control-plane/index.mjs`:723: `doorWindowGate({ req, env, op, spec, doAnswer, credential, background })`. Both names are already in scope in makeFetch (`credential` at the queryGate call, `background` at :611). Not blocking: the header path works without it.

3. A finding in interface-shell (not mine to change). The shell's startup `bootstrap` is sent with `{ public: true }` and so with no Authorization header (browser.mjs:1903; interface-shell R36 "read once without a session"). Under R27 that one request per load stays in the SOURCE's window (no live session presented). 400 loads in 10 minutes from one source then make 400 such requests and the source window (300) refuses from the 301st, which is the opposite of what T49-18's test states. Options: (a) interface-shell R36 sends the session on that call when the page has one (recommended: one line, no change to what the plane reveals, since `bootstrap` already answers the same to a session); (b) leave it: realistic only for a shared address (an office), where 300 per 10 minutes of that single request is already about 30 simultaneous page loads per minute. My module's tests meet R27 as written: loads whose requests all present the session. Your call.

4. R28 note: refusal.DOOR_RATE_LIMITED holds `{minutes}`; I add a `minutes` field to the refusal (whole minutes, from `retryAfter`) so the shell can fill it. The session refusal reuses the same key (K3333), whose English says "from your connection"; accurate for the source window, slightly off for the session window. Design lane's to decide if it wants a second key; I use the one.

## J2 · REPORT

Found in other modules while running the tests of the modules that read admission's rows and gate (not changed by me).

1. answer-envelope (tests `families.test.mjs`: "R7, R2, R10, R13 … re-pinned", "R13 (T46 …)", "R15, R7, R2 (T47 …)"): R7 pins the SHA digest of each admission refusal's sentence. R28 makes every sentence the word `refusal.<CODE>`, so 18 pins now differ: AI_BEYOND_TASK_SCOPE, AI_CONFINEMENT_NOT_SCRATCH, AI_CREDENTIAL_REVOKED, AI_SCOPE_BEYOND_MEMBER_REACH, AI_SCOPE_UNKNOWN_OP, CLASS_FORBIDDEN, GROUP_IDENTITY_NEEDS_SESSION, MACHINE_CREDENTIAL_REQUIRED, NAMESPACE_CONFINED, NAMESPACE_PINNED, NAMESPACE_UNKNOWN, NOT_AUTHENTICATED, NOT_CAPABLE, OPERATOR_TOKEN_CANNOT_GOVERN, ROOT_OF_TRUST_REQUIRED, SCOPE_REFUSED, SESSION_ROLE_CANNOT_REACH_OP, SESSION_ROUTE_NOT_RECORDED. Check ids are unchanged. answer-envelope's job re-pins them to the words (as it did for SCENARIO_OUT_OF_RANGE). The rows still carry `{check, translation}`: `translation` is now a getter reading the word, so the envelope's decoration and the door's reads of `ADMISSION_CHECKS[...].translation` need no change. DOOR_RATE_LIMITED's row reads "… in {minutes} minutes" with the placeholder left as written (a row knows no wait); the refusal itself fills it.

2. control-plane (tests "R45", "R48", "R49": public reads answered "one read of bio's store, no credential looked up"): under R27 a public read that presents a session now has that session resolved once (a `session` lookup before the `doorwindow` count), so these three tests, which present a session on a public read, see one more store call. That is R27 as written, not a defect. control-plane's T49-29 updates them (a public read presenting a live session: lookup, then count; presenting nothing: the count alone). The call to pass is the one already forwarded: `doorWindowGate({ req, env, op, spec, doAnswer, credential, background })`.

3. control-plane `t46-e2e` and `t47-e2e` ("R81 end to end … Home draws its front doors") fail with and without this job's changes (they are in the tranche's accepted reds, not mine).

## J3 · COMPLETE

COMPLETE · admission, T49-18 (entries R27, R28; N1073; rule 6).

Entries applied
- R27, a signed-in session's own window (amends R21, R22). `SESSION_WINDOW` frozen `{limit: 3000, windowMs: 600000}` (confirmed against M-T49-4: at most 5 public requests per signed-in load), `SESSION_WINDOW_STATED` "at most 3000 requests from one signed-in session in any 10 minutes". `doorWindowGate` now resolves the session of a public READ (`classes: null`, `mutating === false`) through `credentials.session` (R6's lookup, `background` passed on) and, when it is live, sends the SHA-256 digest of the token in the `doorwindow` body; the store (`window.mjs`) counts that request in a new table `admission_session_window` (digest, bucket, count; declared exempt/never/stored like R21's; dropped once both buckets have passed), by R21's two-bucket estimate, and neither reads nor writes the source's window. At `≥ 3000` it answers 429 `DOOR_RATE_LIMITED` (C-38.9) with `stated` = `SESSION_WINDOW_STATED`, `retryAfter` and `minutes`, counting nothing. Counted by source, as before: no credential, an unknown/ended/locked session, an `aik-` credential, a binding token (64-hex bindings are tested before the session lookup), a store silence on the session lookup (named in the log by correlation id only), every mutating public op (the session is not even looked up). Fail open throughout. `doorWindowGate` takes optional `credential` (the door's `presentedCredential` answer, covering a body token) and `background`; without them it reads the header and `background=1` from `req`. The source is still made and stamped (the store returns the fingerprint beside the session count). R22: the refusal reaches `securityTally` as kind `rate`, country null (the session token names a member).
- R28, words by key. `checks.mjs` holds no English: each row is `{check, where}` plus a `translation` getter that reads `word("refusal.<CODE>")` (DOOR_RATE_LIMITED's placeholder left as written in the row); `rowOf` in `index.mjs` builds every refusal's `translation` through `word("refusal.<CODE>", vars)` (so `{minutes}` is filled from `retryAfter`). Tests comparing a sentence's text deleted (the T34-87 sentence test; the `error`/`detail` text matches); keys asserted with `hasWord` against the `reads` list in `words-reads.json` (the 22 keys equal the 22 rows). The 35 unkeyed wire strings stay in source; one new wire `detail` variant for the session refusal ("from this signed-in session") is the same kind. No "labelled" in the module (N1068). `admin` grep (N1072): `admin` reaches a reader only as the founder session's viewer (`resolveSession`, `readerOf`), the viewer predicate's root-administrator spelling by design, never as a name drawn or answered; no finding.
- N1073: hand-lists replaced by reads of the owners' declarations: `admission.test.mjs` (the governance and identity acts, from op-declarations), `doors.test.mjs` (the administrator's acts from `membershipOps`, the group key's ops from `credentialsOps`), `t47.test.mjs` (the runner's writes from `AI_RUN_ACTIONS`). `namespaces.test.mjs`:54 keeps the list of the public ops that address scratch: it is R3's own pin, admission's, and each name is checked against op-declarations' public ops.
- D29: admission draws no screen. Nothing to do.

Read in full: requirements; entry; admission's code (index, checks, window); the tests that name R21, R22, R14, R15 (window, t35, invariants, harness) and the ones my edits touched; the services' sources only where an entry touched them (setup-words' interface, op-declarations' exports, the shell's call, the door's gate call). The other tests were run, not read (plan rule 2).

Deferred: none. Flaws or findings in other modules: see J1 (interface-shell's startup `bootstrap`, answered B2 (a)) and J2 (answer-envelope's 18 pins; control-plane's three "no credential looked up" tests; the two inherited e2e reds).

Tests and checks (from /home/user/bio and /home/user/civicos-process)
- `node --test bio-plane/test/m/admission/`: 54 tests, pass 54, fail 0 (new: `t49.test.mjs` R27 x4, `words.test.mjs` R28 x2), against the real setup-words (WORDS_COMMIT 8a54848a9e) after the tranche merge.
- Users of the module: `node --test bio-plane/test/m/answer-envelope/ bio-plane/test/m/control-plane/`: 367 tests; 7 fail, none new in kind: the 3 answer-envelope pins and the 3 control-plane lookups of J2, and the inherited t47 e2e (R81).
- `node checks/format.mjs`: 170 modules, 169 requirements files; 0 failures. `node checks/architecture.mjs bio admission`: 21 product files, 47 relative imports; 0 failures. `node checks/coverage.mjs bio admission`: 28 of 28 live ids named by a test; 0 failures. `node checks/ownership.mjs bio admission tranche/T49`: 16 files changed by admission; 0 failures. `node checks/run.mjs bio`: format 0, architecture 0 (3,360 files), coverage 14 failures in other modules' words ids and new modules (none admission's), channels 0.

Size (session_01UMUMxYiouq4PiTjhcRQTAV): test runs 14, module lines 1544

## J4 · COMPLETE

COMPLETE (again, after B4 and B5; supersedes J3's test line, rest of J3 stands).
- Merged tranche/T49 (later words; DEC-262). R27's session-window refusal now reads the word `refusal.DOOR_RATE_LIMITED.session` with `{minutes}` (the source window keeps `refusal.DOOR_RATE_LIMITED`); tested in t49 and words.test.
- Finding fixed in my own test: op-declarations now declares `founderhandleset` (founder's session only); my derived list of administrator's acts in doors.test.mjs now also requires that every session reaches the op.
- Not changed: words-reads.json's admission `reads` still lists 22 keys without the `.session` key; the words test asserts it with hasWord separately. Design lane may add it to the list.
- admission tests: 54, pass 54, fail 0. format 0 failures; architecture 0 (21 files); coverage 28 of 28; ownership 0 (16 files).
Size (session_01UMUMxYiouq4PiTjhcRQTAV): test runs 19, module lines 1547

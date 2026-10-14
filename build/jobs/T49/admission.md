# admission (T49)

**Status** · session_01UMUMxYiouq4PiTjhcRQTAV · depth 2 · COMPLETE · handled B3

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

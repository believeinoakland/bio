# legacy-ui (T36)

**Status** · session_0124rPupNWArBRDbFjRMCmxu · depth 2 · COMPLETE · handled B1

## Reading set (mechanics §17, N739)

Read whole myself: layer 11's row of `build/layers.md`; my plan entry (T36-38), the plan's "Rules at the opening" and legacy census; K2130's line and the draft's legacy-ui section and its "BOB's review"; K1936; `app.html`'s gate markup (:860–905), the contract note and `PLANE`/`authHeaders` (:944–985), the transports `api`/`apiR`/`apiQ`/`rec` (:1100–1170), the gate's handlers, `signIn`, `tokenConnect` and `boot`'s head (:1440–1530); `test/credential-in-header.test.mjs`, `test/extract.mjs`, `test/run.mjs`'s head, `worker.template.mjs`, `README.md`'s Live section.
Workers read the rest in full: `app.html` 1–9000, 9000–18000 and 18000–end (three workers), and every script and test of the module (`worker.template.mjs`, `deploy-ui.mjs`, `check-mock-envelope.mjs`, `README.md`, `NEXT_SESSION_PROMPT.md`, `test/*.mjs`, `bio-plane/test/budget.mjs`, `bio-plane/test/caseceremony.mjs`; one worker, which read the large suites' harness and sign-in sections whole and searched the rest for token, session, login, Bearer and `#g-`). Their summary: about 2,600 words, each statement citing file and line. It found the paste panel (:885–893, :1452, :1456, :1506–1511) the only place a pasted token enters; no token is read from the address, storage, cookies or messages; every credentialed request takes its header from `authHeaders()` (:970). Two findings mattered and were acted on: the dev host's `/api` proxy dropped the `Authorization` header (`worker.template.mjs`:15–16), so no header-borne session reached the plane through the deployed page; and `meaning-arms.test.mjs` presented the shared `MEMBER_TOKEN` binding (`mem-ui63`) as a member bearer, which admission refuses from T36-36. Nothing they left out mattered: the remaining `PLANE.session`-false branches (`credentialSentence`, `canRelease`, the masthead's `tokenClass` arm) follow what `op=whoami` reports and are left as they are.

## Entries applied (T36-38)

- `app.html`: the gate's "use a token" control and its panel (`#g-token-toggle`, `#g-token-wrap`, `#g-token`, `#g-token-go`) removed, with their two handlers and `tokenConnect`. The gate signs in only through `op=login` (`signIn`, unchanged), and the session rides `Authorization: Bearer` from `authHeaders()` as before. The reason is recorded in the script beside the handlers, not in the gate's markup (the UI-31 measurement reads that markup raw).
- `worker.template.mjs` (needed for the entry to hold on the deployed dev host): the `/api` proxy forwards the request's `authorization` header beside `content-type`. Before this, it dropped the header, and since T35-74 moved the credential into the header, every session request through the dev host reached the plane with no credential.
- `README.md`: the Live section no longer says to paste a `MEMBER_TOKEN`.
- Tests: new `test/member-token-retired.test.mjs` (17 assertions). It checks the served gate (no token field, control or words; inputs exactly address, handle and password). It also runs the page with a sentinel shared token in every token-named field, the address and storage, clicks every gate control and checks that no request carries the sentinel. It checks that sign-in posts to `op=login` and that every credentialed request then carries exactly `Bearer <session>`, never in the address. It also checks that the dev host forwards that header for a GET and a POST, and sends none when there is none. Against the old `app.html` and `worker.template.mjs` it fails 7 assertions. `meaning-arms.test.mjs` now signs in a real member (memberadd, enroll, login) in place of the shared binding. `credential-in-header.test.mjs` §2's titles no longer speak of a pasted token; its checks are unchanged.

Nothing deferred.

## Found in other modules and in my own

- Mine, left as they are (only wording, and "change nothing else"): `NEXT_SESSION_PROMPT.md`:23, :132–140 still speak of a throwaway `MEMBER_TOKEN` pasted per session (a historical prompt). `bio-plane/test/caseceremony.mjs`:503 builds `token=` into an address, which its callers' wrappers move into the header.
- Mine, red before this job and unchanged by it (baseline and after are identical): `progression-revision.test.mjs`, `queue-recipients.test.mjs` (2 pass, 10 fail), `statement-ack.test.mjs` (11 pass, 1 fail: an 8000 ms draw budget expired), and `check-mock-envelope.mjs`'s two failures: arm B's `test/envelope-probe.mjs` was deleted in T20, and arm C cannot read `bio-plane/src/store.mjs`. I take these to be within the inherited reds (red 7, the UI's DEC-88 tests); if any is not, it is open and not this entry's.
- No other module changed and no generated artifact made stale (`civicos-ui/` has none in the manifest's table).

## Tests and checks

- `node test/run.mjs` (from `civicos-ui/`): baseline, 28 suites pass, 3 fail, check-mock-envelope 2 failures. After: 29 suites pass (with the new one), the same 3 fail with the same counts, check-mock-envelope the same 2 failures; 32 suites discovered and run.
- `member-token-retired`: 17 pass, 0 fail; `credential-in-header`: 15 pass, 0 fail; `meaning-arms`: 55 pass, 0 fail.
- Layer tests: none named in the manifest.
- `format`: 135 modules, 134 requirements files; 0 failures. `architecture … legacy-ui`: 0 failures. `coverage … legacy-ui`: 0 of 0 live ids (no requirements); 0 failures. `ownership … legacy-ui tranche/T36`: 7 files changed; 0 failures.

Size (session_0124rPupNWArBRDbFjRMCmxu): test runs 7, module lines 27404

## J1 · COMPLETE

T36-38 applied. The gate's paste-a-token panel and tokenConnect are removed; the page reaches the plane only under the op=login session, in Authorization: Bearer. Also fixed in my module, since the entry needs it: the dev host's /api proxy (worker.template.mjs) dropped the Authorization header, so no session reached the plane through the deployed page; it now forwards it. meaning-arms.test.mjs presented the shared MEMBER_TOKEN binding as a member bearer, which admission refuses from T36-36; it now signs in a real member. New test member-token-retired.test.mjs, 17/0, which fails 7 against the old page. UI runner: the same 3 red suites and check-mock-envelope's 2 failures as the baseline, nothing new (details and my reading of them as inherited red 7 are in the record). format, architecture, coverage and ownership: 0 failures. Nothing deferred; no other module touched.

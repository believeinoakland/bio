# T47 module-test reds: diagnosis (tranche/T47 @ 73cf5b3b67)

Method: every failing module's tests were re-run with the TAP reporter (logs in `scratchpad/reds/*.tap`). Baselines came from two throwaway worktrees, removed afterwards: **T47 open** at 7291399be3 (K3027) and **pre-PR #33** at b5d291c0f5, the tranche commit just before d3a61dc23c. The wt47 tree is still clean after the runs, agent-worker's included.

Total: 71 reds. **S 45 · D 17 · R/build-state 7 · T (census) 1 · E 1.** Of the 7 module-order and build-state reds, 4 are exactly N1014 (3 membership, 1 promotion). No product bug (B) was found.

## Group S: legacy `{role}` sign-in refused (45 reds, 29 test files)

- **Cause.** Since control-plane T47-65 (commit 89587b6d6e, R83, K3084), op=login sends only the body's `handle`, `password` and `device` to the store (`bio-plane/src/control-plane/index.mjs`, the `op === "login"` arm). A `{role: "member:x"}` body therefore reaches `credentials.login` with no handle and role = ROOT, and is refused.
- **New in T47.** It arrived with `Merge job/T47/control-plane` 065ec6dfa2 (K3171). It is neither T47-81 nor T47-91.
- **Proof** (`scratchpad/dbg/login.mjs`, Miniflare over the source tree): at 7291399be3 `{role:"member:ruth"}` signs in; at b5d291c0f5 and 73cf5b3b67 it is SIGN_IN_REFUSED, while `{handle:"ruth"}` signs in.
- **Evidence.** `Error: login ruth: {"ok":false,"reason":"SIGN_IN_REFUSED",…}` (e.g. stats-disclosure.test.mjs:112). capture-requests and scheduler show the same cause one step later, as `NOT_AUTHENTICATED` (C-38.1), because the token they get is undefined.

| module (owner) | reds | test files (login line) |
|---|---|---|
| record-core | 1 | stats-disclosure.test.mjs:110 |
| membership | 1 | members.test.mjs:94 (also :102,:103,:121,:122,:321,:351,:356,:366,:419,:562; the member-login arm fails, then `aid.result.id` throws at :178) |
| promotion | 1 | d526-refusal-order.test.mjs:137 |
| host-governor | 12 (all) | m/host-governor/ops.test.mjs:280 (shared `before` hook; the founder's `{password}` at :290 still works) |
| provenance | 1 | mk6-bundle-names-no-author.test.mjs:107 |
| capture | 3 | cap13-reuse-pages.test.mjs:109, d57selflink.test.mjs:93, m/capture/plane.test.mjs:56 |
| reading-pipeline | 3 | d606-perpage-ocr.test.mjs:105, tier2-wire.test.mjs:155, system/pdf-worker-binding.test.mjs:113 |
| capture-requests | 6 (all) | m/capture-requests/plane.test.mjs:99 |
| scheduler | 4 (all) | m/scheduler/plane.test.mjs:67, :178, :208 |
| queue | 1 | conclude-project.test.mjs:115 |
| agent-worker | 4 (all) | agent-worker.test.mjs:622, harness.test.mjs:1708 and :1754, requirements.test.mjs:97, versions.test.mjs:224 |
| legacy-ui | 8 (all) | group-identity-surface:100, group-surface:107, meaning-arms:146, progression-revision (its helper), queue-recipients:105, review-copy:170, several-cases-choice:143, statement-ack:136 |

- **Note on the accepted legacy-ui reds.** N794 (statement-ack) and N865 (progression-revision, queue-recipients) now fail earlier, at sign-in, so their accepted reasons are masked. The other five legacy-ui files are new reds.
- **Smallest fix (T: test fixtures; the product behaviour is as K3084 rules).** Each fixture signs in with `{handle: <the handle it enrolled>, password}` and the founder with `{handle: "admin", password}`. Every fixture enrols the handle equal to the member id, so this is a one-token edit per call site.
- **Who makes it.** Each listed module's job, in its own tests. Alternatively, one test-support helper used by all of them.
- **Refusal checks in members.test.mjs.** The "wrong password" / "unknown member" refusals at :102–:122 still pass for the wrong reason (every role-login is refused). Re-point them to `handle` so they discriminate.

## Group D: design files changed by PR #33 (17 reds)

All of these pass at b5d291c0f5 (0 fail over those files) and fail at 73cf5b3b67. They are **new at d3a61dc23c**, the merge of main / PR #33 into the tranche (K3182).

**D1: DEC-221 (daded73715), American-English sweep of words.json (6 reds).** Modules keep a frozen copy of the British text, and their tests require words.json verbatim.

| module | tests | evidence | fix (that module's job) |
|---|---|---|---|
| reading-guides | t46-words.test.mjs:45, :95 | `recognise` vs `recognize` (refusal.GUIDE_KIND_UNKNOWN) | `bio-plane/src/reading-guides/checks.mjs:17` |
| action-grammar | grammar.test.mjs:307; t45.test.mjs:539; t46-words.test.mjs:23, :70 | `organisations` vs `organizations` (MACHINE_CANNOT_SET_PARTNERS, PARTNERS_REFUSED) | the two strings in `bio-plane/src/action-grammar/checks.mjs` (also moves census rows, see R2) |
| filings | t46.test.mjs:62 | NOT_A_PARTNER: words.json's words, verbatim | the string in `bio-plane/src/filings/checks.mjs` |

- **Not red yet, but stale.** `setup-words/index.mjs` holds old copies of ~50 changed keys, e.g. :328. `wizard-scripts/civicsmith-library.mjs` and `screens-inquiry/words.mjs` also hold changed texts.

**D2: DEC-226 (03f25af6d5, B179, K3158), the update screens: new acts `updatestart`, `updatelater`, `updateskip` (10 reds; one of them, affordances t36:183, is DEC-221's).** In the registry/library they are functions and owed acts that are no declared op. The tests read the design files at today's head while their names pin earlier heads (PR #14/#15/#28 and "PR #33's head f90b187c7b").

- **op-declarations** (6 reds): t34.test.mjs:148, :345; t37.test.mjs:180; t38.test.mjs:76; t46.test.mjs:301 (`88 !== 89`); t46.test.mjs:331. Evidence: `+ ['updatestart','updatelater','updateskip'] - []`.
- **op-declarations** (2 reds): t47.test.mjs:289, :313. These fail the same way: the registry at today's head is no longer f90b187c7b.
- **affordances** (2 reds):
  - t36.test.mjs:91, `285 !== 282`: ACT_HELP lacks the three DEC-226 texts.
  - t36.test.mjs:183: `labelled` vs `labeled` in act.transcribe.does (a DEC-221 item) in `bio-plane/src/affordances/act-help.mjs`.

**Smallest fix.**
- Until N1047's job declares the three ops, op-declarations tolerates them by name as owed acts of DEC-226. Better: the old-PR tests read the design files at the commit they name (`git show <sha>:…`), so later design merges cannot move them.
- affordances re-pins ACT_HELP to the post-PR #33 design: 285 texts, with DEC-221 spellings.
- **Who.** The op-declarations and affordances jobs, which BOB opens with N1047 (DEC-226 folded, K3172).

## Group R: module order and modules.json build state (7 reds)

**R1: N1014 exactly (4 reds), MODULE_ORDER lacks signin-door and journey-check.** Old since K3100 (358e2c3c82). It already failed at b5d291c0f5.

- membership, module-order.test.mjs:13. Evidence: `- 'signin-door'` after store-door, `- 'journey-check'` at the end.
- membership, module-order.test.mjs:325 (R140): the same diff.
- membership, t9-notice-sight-bounds.test.mjs:161 (R79): the same diff.
- promotion, m/promotion/registry.test.mjs:64 (R39/R45/R46): the same diff, `- 'signin-door'`. This is promotion's, not membership's, but it has the same cause.

**R1b: not N1014.** membership, module-order.test.mjs:218 (negative control): `the file ends installer → stewards`, `+ 'journey-check'`. It is caused by journey-check being added to modules.json at 1107a16a37 (K3177).

- **Fix for R1 and R1b.** The membership job adds signin-door after store-door and journey-check last to `MODULE_ORDER` (`bio-plane/src/membership/index.mjs:274`), and updates the :218 control's expected tail to `stewards → journey-check`. Promotion's registry test then passes with no change.

**R1c: stale setup-page row in build/modules.json (2 reds).** K3177 says setup-page's `paths` and `tests` were emptied, but they were not. modules.json still lists `paths: ["bio-plane/src/setup-page/"]` and `tests: ["bio-plane/test/m/setup-page/"]`, while ec23238bb1 (T47-74, merged at dae5312475) deleted the directory. New in T47.

- membership, module-order.test.mjs:151. Evidence: `'setup-page: bio-plane/src/setup-page/ is on disk'`. It fails here before reaching signin-door, so it is not N1014.
- file-safety, m/file-safety/rows.test.mjs:193. Evidence: `ENOENT … scandir '…/bio-plane/src/setup-page/'`.
- **Fix (BOB, build state).** Set setup-page's `paths` and `tests` to `[]` in build/modules.json, as K3177 says. file-safety goes green. module-order.test.mjs:151 then fails as "has no code and is not tolerated" (accepted by name until T48 drops the row), unless membership adds setup-page to `NOT_YET_BUILT`.

## Group T + R2: promotion's row census (1 red)

- **Test.** bio-plane/test/system/row-census.test.mjs.
- **Cause (T).** `censusRows` imports every module file (`test/system/row-census.mjs:61`). It imports `bio-plane/src/journey-check/journey.mjs`, a CLI script that runs the local journey on import and calls `process.exit` (journey.mjs:8–10). That kills the census mid-run; the TAP shows `journey-check (local): 4 steps, 1 failures` inside promotion's output.
  - The journey's own failure here, `journey 28 · Cloudflare's permission, allowed: locator.click: Timeout 30000ms`, is probably the container (Chromium). It is not the census's cause: an exit 0 would also end the census without running its tests.
  - New in T47: journey.mjs arrived at 373f7a941a and was merged at 7610f1df2e (K3177).
- **Fix (promotion's job).** Add `/^bio-plane\/src\/journey-check\/journey\.mjs$/` to `SCRIPTS` in row-census.mjs:36. Alternatively, journey-check guards its run with an `import.meta` main check.
- **R2, after that fix.** With journey.mjs skipped (`scratchpad/dbg/census.mjs`), the census still differs from the 1.74.0 pin: 1898 rows against 1882. That is 59 rows: 37 changed, 21 arrived, 1 departed (C-69.6 DISCLOSURE_DUE). These are T47's own rows (C-29.42–.47 credentials, C-117.48–.52, C-136.x, C-82.x, C-140.x, …), awaiting the next stamp as usual (R50: accepted by name until the layer-2 stamp). The full list is in `scratchpad/dbg/census.out`.

## Group E: test-support R2 (1 red)

- **Test.** test-support, m/test-support/test-support.test.mjs:249 ("…also when the process does not run as root…").
- **Evidence.** `ERR_MODULE_NOT_FOUND: Cannot find module '…/scratchpad/wt47/bio-plane/test/sandbox.mjs'`.
- **Cause (E).** Running as root, the test drops the child to uid 65534 with setpriv. That child cannot traverse the checkout's ancestors: /tmp/claude-0 and the scratchpad are root-owned 0700, and `setpriv --reuid=65534 ls /tmp/claude-0` gives Permission denied. It fails identically at T47 open (7291399be3).
- **Not new.** It is not a product or test regression. From a checkout under a traversable path (CI, or /home/user/bio, which is 0755) the child can reach the file. That run was not done here.
- **Fix.** None needed. Optionally, test-support could copy the module into the host directory instead of importing it by path.

## Summary of the jobs that must act

- **Every module in group S** re-points its fixtures' login to `{handle}`: record-core, membership, promotion, host-governor, provenance, capture, reading-pipeline, capture-requests, scheduler, queue, agent-worker, legacy-ui. 45 reds; new at K3171.
- **reading-guides, action-grammar, filings, affordances** take DEC-221's spellings. **op-declarations and affordances** take DEC-226. 17 reds; new at K3182.
- **membership:** MODULE_ORDER for N1014, the negative-control tail, and setup-page tolerance. **BOB:** empty setup-page's `paths` and `tests` in modules.json.
- **promotion:** row-census SCRIPTS gains journey-check's journey.mjs; the census delta then awaits the T48 stamp.
- **test-support:** environment only.

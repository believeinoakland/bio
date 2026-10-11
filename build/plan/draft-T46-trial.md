# DRAFT · T46: the trial's substrate and the 0.82.0 release (N897 (2)–(5))

**Status** · DRAFT for BOB, written 2026-10-11 by a drafting worker of BOB #158 on `tranche/T45` (P18). It rules nothing. Bob ruled K2816 ("1. B 2. B 3. A 4. C 5. A"); this draft covers N897 (2) the test-instance exception, (3) the assistant on Bob's own sign-in, (4) no public registry, (5) `biosmoke7` in place, and the release. The screens (N897 (1)) are another worker's. Nothing was run live; one read-only GitHub query (release-sign runs: none). Requirement ids marked "prov." are the next free ids today; T45's jobs may take some first, so each is renumbered at the fold.

**Read whole:** `draft-T46-usable.md`; `next.md` N897; `run-rules.md`; `ai-runs.md`; `credentials.md`; `agent-worker.md` (bar, modes, accounts); `installer.md`; `instance-setup.md`; `setup-page.md`; `draft-T33-release.md`; `newgroup/DEPLOY.md`; `rulings-active.md`; rulings K2110, K1893, K2147, K2155, K2164, K2273, K1898, K2816, K2134, K2109, K1936, K2277, K2259, K2266; D14 (`design/investigation` `docs/development/investigation-design/DECISIONS.md`:22, :125, :128, "D14: C"); the source cited inline.

---

## 0. Findings that change the picture (from source)

1. **The bar is enforced at five sites, not at the ask or the drafts.** Sites that refuse for the bar today:
   - run open, `ai-runs/index.mjs`:996–1003 (`#partDeployable`, :321–324) → `AI_RUN_MODE_NOT_DEPLOYED` (C-109.1);
   - a run's `explore` origin, `ai-runs/index.mjs`:1035–1036 (`investigateDeployable`, `run-rules` R23);
   - the explorer's gate, `question-explorer/index.mjs`:277–293 (bar for `investigate` and `explore`, plus a recorded false-alarm rate ≤ 20%);
   - transcription, `plane/transcribe.mjs`:132–135 → `extraction/index.mjs`:1578–1583 `TRANSCRIBE_NOT_DEPLOYED` (C-51.7);
   - `verificationRecord`'s `next.deployable`, `ai-runs/index.mjs`:3093 (informative only).

   **Not gated, though `run-rules` R16, R19 (amended), R21 and R27 say they are:** the ask (`plane/ask.mjs`:79–121) and every draft (`plane/ask.mjs`:139–191, reached from `control-plane/index.mjs`:3062–3071) check neither the bar nor their deploy flags (`ASK_MODE.deployed` and `DRAFT_MODE.deployed` are `false`, `run-rules/deployment.mjs`:159, :245; nothing outside `deployment.mjs` reads them, grep). Today an ask or a writing-help draft runs on any account with no bar at all. This is a defect against requirements already in force (P18): "the bar stays for every group" (K2816 (2)) is not true for the ask and the drafts until it is fixed (§1.3).
2. **The deploy flags and the verification chain are separate from D14's bar.** D14 is the test bar (`run-rules` R19 as amended, `test-bar.mjs`:63–96). The flags (`plan`, `ask`, `draft`, `enquire`, `action_drafts`: "set by a reviewed change", `deployment.mjs`:198–212, :322–333) and the chain (`investigate` only after `check`'s live run is verified, `deployable`) are not D14. The exception lifts only the bar (Bob's words). So on the test instance only what is flagged and chained on runs: `check` runs, the ask and the drafts (once their flags are set, §1.3), and transcription. Not `investigate`, `extract`, `plan`, `enquire`, the action drafts, or the explorer (it needs `investigate`).
3. **A sign-in cannot transcribe.** `agent-worker/src/transcribe.mjs`:142–146 refuses `TRANSCRIBE_NEEDS_API_KEY` (N852). With Bob paying only by his sign-in (K2816 (3)), transcription is unavailable in the trial until N852 lands.
4. **A sign-in's `suggestions` switch breaks a run.** `credentials` R55 gives a sign-in its own `suggestions` switch (T40–T41). `ai-runs/index.mjs`:2026–2031 sends that value on the wire for a `signin` account. `agent-worker` R6 and `agent-worker/src/index.mjs`:1521 refuse a `signin` account whose `suggestions` is not `false` (`BAD_ACCOUNT`). So once Bob turns suggestions on, every run on his sign-in is refused. Separately, the ask and draft doors read only the reference's switch (`plane/ask.mjs`:108–110, :163; `credentials/index.mjs`:1343–1344), so a sign-in's switch is silently ignored there.
5. **Signing has moved off the session, and its route has never run.** `release-assemble.mjs`:164 refuses `--sign` outside GitHub Actions (`bundler` R30; K1936 Q4 step 2). Signing is now `.github/workflows/release-sign.yml`, environment `release`, with Bob as required reviewer. It has never run (GitHub: 0 runs), and whether the environment holds `BIO_RELEASE_SEED` is not recorded. `draft-T46-usable.md` §1.2 step 5 ("the seed in the session's environment") is out of date. `ARMED_SIGNERS` still holds the development key (`newgroup/src/signers.mjs`:22–24; installer R43 not met).
6. **The tranche names unpublished images.** `agent-runner/wrangler.jsonc`:29, `file-scanner/wrangler.jsonc`:39, :45 and both `fleet-member.json` files read `docker.io/civicos/…@sha256:UNPUBLISHED` / `digest: null` (K2259 kept them). The cut writes the GHCR digests, and with K2273 they reach `main` through T45's close.
7. **The installer already says what is missing, part by part.** An image outside Docker Hub, ECR or Artifact Registry fails `PUBLIC_IMAGE` (`newgroup/src/index.mjs`:759, :781–782): the member is left out and named with `CONTAINER_LACKS` (:766–770; installer R38). Its reason text, though, is "not a public registry image pinned by its sha256 digest", which a group cannot act on. Inside a group's Civicsmith nothing says so in member words:
   - the sign-in relay answers `RUNNER_NOT_CONFIGURED` in operator words (`agent-worker/src/signin.mjs`:45–48);
   - `setup-page` R30 asserts "Civicsmith scans every file it captures";
   - `instance-setup` R17's member report cannot see `agent-runner`, because the plane has no `AGENT_RUNNER` binding (`bio-plane/wrangler.jsonc`:121–127; `setup-fleet.mjs`:14–15 lists it), so it always reads `UNBOUND`;
   - `file-safety`'s `SCANNER_ABSENT` details say "beside this copy" (`file-safety/index.mjs`:843, :1092, :1397, :1492), against DEC-149.
8. **Sign-in substrate is served end to end in source, but not on `biosmoke7`.** §2. 0.81.0 predates T37's sign-in (K2134), so only 0.82.0's images and workers carry it.

---

## 1. (2) The test-instance exception

### 1.1 Design (BOB's, P17)

- **Where it lives:** a Worker secret on the plane, `CIVICSMITH_TEST_INSTANCE`, whose value must equal the instance's own `INSTANCE_NAME` exactly (`biosmoke7`). Absent, empty, unreadable or any other value means not a test instance (fail closed). It is a `secret_text` binding, so `deploy.mjs` keeps it across every deploy (`keep_bindings`, `bio-plane/scripts/deploy.mjs`:231). It is not a record setting: no table holds it.
- **Who sets it:** the deployer, meaning a BOB session with Bob's in-session approval. The act is `wrangler secret put CIVICSMITH_TEST_INSTANCE --name biosmoke7` on account `20b5…7f72`. It is refused as a Production Deploy and approved each time (rulings-active §2), and recorded in one ruling. The same approval form removes it (`wrangler secret delete`).
- **Who cannot:** no op, so no member and no administrator. The installer never writes it, never reads it and never names it.
- **Why an install cannot turn it on (security reasoning):**
  1. Ops write the store, never the Worker's environment. No op's handler can create a binding, and a `CIVICSMITH_TEST_INSTANCE` in a request body, query or record setting is never read (only `env` is).
  2. The installer's uploads restate a fixed binding list (installer R10, R17). The new requirement and its test keep the name out of every install and update upload, and out of the installer's source.
  3. That leaves the hosting account. Whoever holds Workers write access to a group's Cloudflare account already controls that Civicsmith wholly (`instance-setup` R47, `setup-fleet.mjs`:24–38): they could upload a plane with the bar removed. The exception gives nobody a power they lack.
  4. It cannot be hidden from members. Every AI output on such an instance carries the label, and the instance's public `bootstrap` and its healthy panel say "test instance". A group copy set this way by its operator tells its members so on every answer.
  5. It moves nothing anywhere else. A test instance writes no `ai-runs` R75 record, and no output there counts toward any part's bar. The flags, the verification chain, keep-away, accounts, limits and notices are unchanged.
- **Labelling:** one label minted in one place, `run-rules`' `untestedLabel(part)`. It is `{kind: "untested", part, set, set_version, words: "ai.label.untested"}`, carried by every AI output a part produces on the exception. A part whose bar *is* held on the current set runs unlabelled even on a test instance. Interim meaning, until UX-DESIGN words it (`words.json`, DEC-179): "Not yet tested: this part of the assistant has not yet passed Civicsmith's tests on real matters. Check what it says against the record."

### 1.2 Requirement text

**`run-rules` (L6)**
- **R29** (prov.; K2816 (2); amends R19) *The test-instance exception.* `partAdmittedOn(set, part, held, {testInstance})` is the one computation every deploy gate asks. It answers `{admitted: true, untested: null}` when `partDeployableOn(set, part, held)` (R19) is true. When R19's test bar is not held but everything else R19 asks is (for a mode of the order, the verification chain), and `testInstance` is exactly `true`, it answers `{admitted: true, untested: untestedLabel(part)}`. Otherwise it answers `{admitted: false, untested: null}`. The exception lifts only the test bar: it never sets or reads a deploy flag (R14, R16, R21, R24, R27), never lifts the chain, and never counts as a bar held. `testInstance` is a fact of the deployment handed in by `ai-runs` (its R78), never a field a caller sends. `partAdmitted(part, held, opts)` is the same on Civicsmith's set. `untestedLabel(part)` answers `{kind: "untested", part, set, set_version, words: "ai.label.untested"}`, frozen, for a part in `TEST_BAR_PARTS`, and null otherwise. Pure; never throws. `partDeployable` and `testBarHeld` are unchanged.
- **R30** (prov.; K231) The row `AI_PART_NOT_DEPLOYED` (C-22, next free number) is minted only by `partAdmittedOn`'s refusal form `partRefusal(part)`, in DEC-83's form: "This part of the assistant has not yet passed Civicsmith's tests, so it is not switched on in your group's Civicsmith. Everything else works without it." It is relayed unchanged by the doors that lacked a refusal of their own (`plane` R40). `AI_RUN_MODE_NOT_DEPLOYED` and `TRANSCRIBE_NOT_DEPLOYED` keep their codes, numbers and sites.
- **R16, R21 amended** (reviewed change; §6 B1) `ASK_MODE.deployed` and `DRAFT_MODE.deployed` become `true`, because their paths are served end to end (`agent-worker` `/ask` since T33, `/draft` since T35 and T37). Each is then gated by R19's bar through R29 alone. `action_drafts`, `enquire` and `plan` stay `false`.
- Tests:
  - an empty set with `testInstance` `true` admits `check`, `ask`, `draft:own_words` and `transcribe`, each labelled; control: the same with `testInstance` `false`, absent or `"yes"` admits none;
  - `investigate` with no verification recorded is refused even with `testInstance` `true` (the chain stands);
  - a passed record on a set with matters admits unlabelled with `testInstance` `true` (control: the label follows the bar, not the instance);
  - `deployedModesFor()` unchanged by `testInstance` (no flag moves);
  - `untestedLabel` null outside `TEST_BAR_PARTS`.

**`ai-runs` (L6)**
- **R78** (prov.; K2816 (2)) `testInstance()` answers `true` exactly when the Worker environment's `CIVICSMITH_TEST_INSTANCE` is a string equal to the environment's `INSTANCE_NAME`, both non-empty. Otherwise, and when either cannot be read, it answers `false`. No op, body, query or table reaches it. `partAdmitted(part)` answers `run-rules.partAdmittedOn(set, part, {verifications, testBars}, {testInstance: testInstance()})` on what this record holds (replacing `#partDeployable`, `index.mjs`:321–324, as the one gate; module tests keep `deps.testSet`). R40 (open) admits a mode only when `partAdmitted(mode).admitted` is true, its flag being in `DEPLOYED_MODES` as now, and refuses otherwise as now (C-109.1). R23's `investigateDeployable` reads `partAdmitted("investigate").admitted`. A run opened on the exception records `untested` (the label) at the open, never derived later (R32). R10's answer, R19's `session.untested` and R28's `runFor` answer it (null for a run the bar admitted). No R75 record is written or read differently on a test instance. Tests:
  - an open in mode `check` on an empty set with the env pair equal opens, recording and answering `untested`;
  - control: env value `biosmoke8`, empty, or the variable absent is refused C-109.1, nothing written;
  - a `CIVICSMITH_TEST_INSTANCE` in the open's body is ignored;
  - `runFor` carries the label.

**`plane` (L11)**
- **R40** (prov.; K2816 (2); `run-rules` R16, R19, R21, R29)
  - The ask path (`askOnObject`) asks `ai-runs.partAdmitted("ask")`, and the draft path (`draftOnObject`) asks `partAdmitted("draft:<kind>")` for the draft's kind (`own_words` for `writinghelp` and `groupdescriptiondraft`, `translation` for `translationdraft`). They ask after the keep-away refusal and before any account is read, grant minted or anything posted. Not admitted is refused `AI_PART_NOT_DEPLOYED` (`run-rules` R30), 409, nothing sent.
  - Admitted with a label, the ask's request to `agent-worker` carries `untested` (`agent-worker` R79), and the draft's answer carries `untested` beside `grant`, `suggestions` and `read`.
  - The transcriber's `deployable()` (R36) becomes `partAdmitted("transcribe").admitted`, and `transcription()` hands the label to `extraction` (its R71).
  - Tests: an ask and a writing-help draft on Civicsmith's empty set are refused `AI_PART_NOT_DEPLOYED` with nothing posted to the binding (calls counted); control: the env pair equal posts, and the answer carries the label.
- **R33 amended** (finding 4) The suggestions switch sent with an ask or draft is the one of the account that serves: the sign-in's (`accountReferenceState().subscription.uses.suggestions`) when `accountFor` answers `signin`, the reference's for `apikey` at level `member`, the group key's for `group`.

**`question-explorer` (L6)**
- **R16** (prov.; amends R7) The gate is open, with `false_alarm_rate` null, `gold_set` null and `untested` the label, when `ai-runs.partAdmitted` admits `investigate` and `explore` on the exception. Each find offered then carries the label. R7's 20% rate applies whenever the bar is held. Control: a non-test instance with no record stays shut.

**`extraction` (L4)**
- **R71 amended** A transcription written on the exception records the transcriber's label in the reading's machine label (`untested`) at the act. The reading answers it to every reader of that reading, and it is never removed by a later bar.

**`agent-worker` (L6)**
- **R79** (prov.) `POST /ask` takes an optional `untested` (the label object, as `run-rules`' `untestedLabel` answers it; anything else `BAD_BODY`) and puts it unchanged on its last `answer` event. `/draft` answers it unchanged when given. No other effect.
- **R6 amended** (finding 4; `credentials` R55) A `signin` account carries `suggestions` as a boolean, the sign-in's own switch. A `secret` present is still refused `BAD_ACCOUNT`. `index.mjs`:1521's `suggestions` arm is lifted.

**`instance-setup` (L11)**
- **R79** (prov.) `op=bootstrap` answers `test_instance: true | false` from `ai-runs.testInstance()`. It names no value of the variable.

**`setup-page` (L11)**
- **R31** (prov.) While `bootstrap` answers `test_instance: true`, the page shows every visitor, on its first view and the healthy panel, that this is a test instance whose assistant parts have not all passed Civicsmith's tests, in the words UX-DESIGN gives (interim: "This is a test Civicsmith. Parts of its assistant have not yet passed Civicsmith's tests; each answer they give says so."). It offers no act to change it.

**`installer` (L11)**
- **R49** (prov.; K2816 BOB's details) The installer never writes, reads or names `CIVICSMITH_TEST_INSTANCE`. No install or update upload carries it (R10, R17), and no page offers it. Test: the upload metadata of an install and an update, and the bundled source, hold no such name.

### 1.3 What the exception gives Bob, and when

On 0.83.0 (T46's close), with the secret set on `biosmoke7` (runbook §4 step 15):
- **Labelled and reachable:** the ask and the drafts (on the `connect` screen's sign-in); `check` runs (but who starts a member's run is the screens'; the plane resumes only runs its own organisation credential opened, `ai-runs/index.mjs`:1980–1999, `ai-runs` R18).
- **Not reachable:** transcription (sign-in, N852); the explorer, `investigate`, `extract`, `plan`, `enquire` and the action drafts (flags and chain, finding 2).

On 0.82.0 nothing is labelled: the code that reads the secret is T46's.

---

## 2. (3) The assistant on Bob's own Claude sign-in

### 2.1 What exists (source, end to end)

| step | where |
|---|---|
| sign-in relay, steps `start`, `code`, `state`, `signout` | `op=subscriptionsignin`: `control-plane/signin.mjs`:56–77, routed at `control-plane/index.mjs`:1981 (`control-plane` R65); declared `"own"`, `op-declarations/index.mjs`:323 |
| relay to the member's own runner instance | `agent-worker/src/signin.mjs`:42–84 (R66, R67) → `agent-runner` R17–R21 (`agent-runner/src/runner.mjs`:16) |
| the fact "connected" recorded, never a token | `credentials/index.mjs`:1555 (R43), written by the door only on `connected: true` (`control-plane/signin.mjs`:70–75) |
| disconnect and revocation sign out | `op=subscriptiondisconnect` (`credentials/index.mjs`:2956); `leaverOf`/`signoutLeaver` (`control-plane/signin.mjs`:26–35, :80–83; `index.mjs`:3051) |
| the account chosen per act (Capability Ladders §2: own account first, then group) | `credentials` R35, R56: project's, then member's (reference, else `signin`), then group key. `signin` is `{kind: "signin", level: "member", member}`, no secret |
| state shown to the member | `op=accountreference` (`credentials/index.mjs`:2970; `accountReferenceState`:1336–1350, `subscription: {connected, since, uses}`); `op=accountuses`, `op=accountusesset`, `op=accounthistory`, `op=aiusage`, `op=ailimitset` (all declared) |
| ask and draft on a sign-in | `plane/ask.mjs`:93–120, :158–190 → `agent-worker` `accountOf` (`index.mjs`:1503–1530) → `agent-model/src/model.mjs`:125–126, :141, :185 → `agent-model/src/signin.mjs`:44, :104, :127 (websocket to the runner's `/conversation`) |
| runs on a sign-in | `ai-runs/index.mjs`:2018–2045 (`kind: "signin"`, no secret) → `agent-worker` `/run` (`index.mjs`:1642) |
| use counted and limited | `ai-use` R1–R3 via `answers.askAccount` (`plane/ask.mjs`:93) |
| keep-away | `start` and `code` refused under keep-away (`control-plane/signin.mjs`:59–66) |

No group API key is needed: with Bob's sign-in connected, `accountFor` answers `signin` before the group key.

### 2.2 What is missing

1. **On `biosmoke7`:** everything in 2.1 except the plane's older parts. 0.81.0's agent-runner image and agent-worker predate T37's sign-in (K2134). → the 0.82.0 deploy (§4), with the agent-runner image rebuilt.
2. **The bar at the ask and drafts** (finding 1) and **their flags** (§1.2 `run-rules`, `plane` R40). Without the exception these refuse on `biosmoke7`; with it they run labelled.
3. **The suggestions mismatch** (finding 4) → `agent-worker` R6 amended, `plane` R33 amended (§1.2).
4. **Disclosure before a sign-in.** `instance-setup` R54 asks the disclosure (D311) when a *reference* is set, not when a sign-in connects, and nothing reads `disclosureOf` before serving (`setup.mjs`:1726–1760; grep shows no reader). The `connect` library orders `disclosureshown` before `subscriptionsignin` (`wizard-scripts/civicsmith-library.mjs`:29), but only the screen enforces it.
   - **`instance-setup` R54 amended:** "When a member connects their own account (a reference set, or their subscription connected, `credentials` R43)".
   - **`control-plane` R65 amended:** `start` is refused `DISCLOSURE_DUE` (a row of the door's, the next free number; sentence then remedy: "Read what connecting means first: your questions and what is read to answer them go to Anthropic under your own account.") while `instance-setup.disclosureOf({member})` answers `shown: false`, nothing sent. `state` and `signout` are never refused. Recommended (§6 B3).
5. **The runner absent, in member words.**
   - **`control-plane` R65 amended:** agent-worker's `RUNNER_NOT_CONFIGURED` (503) is relayed with its code and status unchanged, plus a `translation` read by key `ai.refused.signinabsent` (interim: "Signing in with Claude is not installed in your group's Civicsmith yet. An API key works instead; whoever installed your group's Civicsmith can add it.").
6. **Stale design data** (UX-DESIGN's, a HANDOFF, not a precondition, K1430):
   - the registry's `connect` still lists `subscriptionsignin` as owed (`wizard-scripts/screen-registry.mjs`:17);
   - the library's step 4 sends "the code Anthropic's page shows you" through `accountreferenceset` (`civicsmith-library.mjs`:29), but the code goes through `subscriptionsignin` `step: "code"`; `subscription` references are retired (`credentials` R22).
7. **Transcription by sign-in** (N852). Its stated dependency ("its image published where Containers pull") is met for `biosmoke7` by K2816 (4)'s copy. → §6 B4.
8. **Terms.** `agent-runner/fleet-member.json` note: U-7 (a)–(d) open, `who_agrees` null. By rulings-active §1 (K2425) an open U-n places no restriction; record it, do not ask.

M-Q2 (container reliability) is measured at Bob's first sign-in (K2147).

---

## 3. (4) No public registry: each part says when it is absent

### 3.1 What happens today when a container is absent

| part absent | in the installer | in the group's Civicsmith |
|---|---|---|
| `agent-runner` | left out, named, `CONTAINER_LACKS` (`newgroup/src/index.mjs`:766–770); agent-worker uploaded without `RUNNER` | `subscriptionsignin` → `RUNNER_NOT_CONFIGURED` 503, operator words (`agent-worker/src/signin.mjs`:45–48); a connected sign-in's conversation → `RUNNER_NOT_CONFIGURED` (`agent-model/src/model.mjs`:141); `bootstrap` member report always `UNBOUND` (no plane binding) |
| `file-scanner` | left out, named | scans `SCANNER_ABSENT`, `low` files open stated `not_scanned` (`file-safety` R4, R8; `index.mjs`:638–644), safe view `RENDERER_ABSENT` (R11); `bootstrap` reports `FILE_SCANNER` `UNBOUND` (`instance-setup` R17); `setup-page` R30 still claims scanning |

### 3.2 Requirement text

**`installer` (L11)**
- **R38 amended** A container member left out because its image is not in a registry the account can pull (`PUBLIC_IMAGE`) is named with the reason "this release's image is not yet published where your Cloudflare account can pull it", beside `CONTAINER_LACKS`, never "not a public registry image". **R23 amended:** when the embedded release's statement names such an image for a container member, the install and update pages say so before the install begins, per member, with what your group's Civicsmith then lacks (`CONTAINER_LACKS`' words). Test: a release whose `agent-runner` and `file-scanner` descriptors name `ghcr.io/…@sha256:<hex>` installs every other member, names both with the new reason, and the page carries both statements; control: a `docker.io/…@sha256:<hex>` descriptor installs.

**`agent-worker` (L6)**
- **R34 amended** `GET /version` adds `runner: true | false`, whether the `RUNNER` binding is present (`handleVersion`, `index.mjs`:1752–1754).

**`instance-setup` (L11)**
- **R17 amended** For `agent-runner`, which the plane does not bind, `memberVersions` reads agent-worker's `/version` `runner`: `SERVING` with agent-worker's version when `true`, `UNBOUND` when `false`, and agent-worker's own state otherwise.
- **R80** (prov.) `op=bootstrap` answers `parts`: `[{part: "signin", present}, {part: "scanner", present}, {part: "safe_view", present}]`, each `present` `true`, `false` or `null` (could not be read). `signin` follows R17's `agent-runner` answer; `scanner` and `safe_view` follow `FILE_SCANNER` `SERVING`. It names no reason beyond the part. Each screen that offers a part reads it (the `connect` screen's sign-in; the security screen; `setup-page`).

**`setup-page` (L11)**
- **R30 amended** The built-in-scanner sentences (DEC-182 (6)'s interim words) are shown only while `parts` answers `scanner` present. Otherwise the step says, in UX-DESIGN's words (interim: "Your group's Civicsmith has no file scanner installed yet: files are kept and shown but not scanned, and a high-risk file opens only in its safe view once one can be made."), and the healthy panel lists each part of `parts` as installed or not.

**`file-safety` (L3)**
- **R42** (prov.; DEC-149) `SCANNER_ABSENT` and `RENDERER_ABSENT` carry rows with translations in member words ("Your group's Civicsmith has no file scanner installed, so …"; "… no safe view installed …"). Their `detail`s drop "copy" (`index.mjs`:843, :1092, :1397, :1492).

**`control-plane` R65 amended:** §2.2 item 5.

### 3.3 The images (BOB's acts, rulings-active §4; no Docker Hub)

- **Workflow.** `.github/workflows/agent-runner-image.yml` is extended (renamed `container-images.yml`, or a sibling) to build three images:
  - `agent-runner` (`agent-runner/Dockerfile`);
  - `file-scanner-scanner` (`file-scanner/Dockerfile.scanner`);
  - `file-scanner-renderer` (`file-scanner/Dockerfile.renderer`).

  Each is `linux/amd64`, `provenance: false`, pushed to `ghcr.io/believeinoakland/<name>`, tagged with the version, and its digest printed in the step summary. It runs on a push to `dist/cut-*` touching any of their paths, or by hand. GHCR only. No Docker Hub account or credential (K2816 (4); K1893 (2) stands unanswered by design).
- **The cut** writes each digest as `ghcr.io/believeinoakland/<name>@sha256:<hex>` into `agent-runner/fleet-member.json` `image` and `agent-runner/wrangler.jsonc`:29, and into `file-scanner/fleet-member.json` (`containers[0..1].image`) and `file-scanner/wrangler.jsonc`:39, :45.
- **For `biosmoke7`.** `deploy-fleet.mjs` pulls each image by digest, tags it, and pushes it to `registry.cloudflare.com/<account>/…`. The generated config names that copy (`bio-plane/scripts/deploy-fleet.mjs`:245–272, per class for file-scanner, :146–181), as K2110 did for agent-runner.
- **For a fresh install.** The release names GHCR images. The installer leaves both members out and says so per part (R38, R23 amended). This is K2816 (4)'s "runs without them and says so".

---

## 4. (5) The release: 0.82.0, cut from `tranche/T45`, deployed to `biosmoke7` in place

When: after T45's last layer closes, before its PR to `main` (K2273, K1501). `release/` reaches `main` only through T45's close. S = a session. Bob = his approval in the session that runs it (rulings-active §2) or, where marked, his act elsewhere.

| # | step | who | risk |
|---|---|---|---|
| 0 | **Preconditions:** T45's last layer closed. `npx wrangler whoami` shows `20b533579290b9b93168345edd3b7f72` (else stop, CLAUDE.md). `node_modules` installed in every bundled member and in `agent-runner` (`--ignore-scripts`) and `sheet-worker` (rulings-active §4). Read whether the GitHub environment `release` exists with secret `BIO_RELEASE_SEED` and Bob as reviewer (`gh api repos/believeinoakland/bio/environments/release`, a read) | S | the environment may not exist (finding 5) → step 6 blocked; §6 Bob-1 |
| 1 | **Rollback targets** by `wrangler deployments list`: `biosmoke7`, agent-worker, pdf-, ocr-, sheet-worker, agent-runner (0.81.0: `31af4c8d…`, K2110), `civicos`, `newgroup`. file-scanner has none (first deploy) | S | none |
| 2 | **Cut** `dist/cut-0.82.0` from `tranche/T45`'s tip:<br>• every site `resolve-version.mjs` names at 0.82.0 (file-scanner's `package.json` and `wrangler.jsonc` included, K2266);<br>• `migrate-released.test.mjs` `RELEASES` gains `["0.81.0", "23cc7807f7…"]`;<br>• artifacts in K1540's order;<br>• push the branch | S | a version site missed (`resolve-version` refuses `VERSION_SKEW`) |
| 3 | **Images** (§3.3): the push runs the extended workflow. Read the three digests from the step summary and write them into the four files (§3.3). Rebuild agent-runner's and file-scanner's bundles and `fleetbundles`. Check an anonymous `docker pull` of each image | S (workflow); Bob only if a new GHCR package is private and the token cannot make it public | file-scanner images never built (ClamAV and renderer packages, base pinned by digest); new GHCR packages may default to private (agent-runner's was made public, K1898); `fleetbundles`' real-fleet test pins `docker.io/civicos/agent-runner` (K2266) → red on the cut until re-pointed (fix on the cut, or accept by name) |
| 4 | **Regression** `regression.yml` dispatched on the cut's tip (every module's tests, K1692). Triage each red against T45's accepted reds (K2084's form) | S | nine tranches of change. A migration fault shows here, before any deploy |
| 5 | **Assemble** `release-assemble.mjs --version 0.82.0 --dry-run` in the session (`bundler` R30). Both container members carry their `container/…json` parts | S | `CONTAINER_UNDESCRIBED` if a digest is missing (K1893) |
| 6 | **Sign** with `release-sign.yml` (`workflow_dispatch`, `version: 0.82.0`, on `dist/cut-0.82.0`): BOB dispatches, the run waits, **Bob approves the run on GitHub** (environment `release`), and the workflow commits the signed `release/` to the cut. Pull it | dispatch S; approval **Bob** (one click on GitHub, walked through) | never run before (0 runs). If the environment or its secret is absent: §6 Bob-1 |
| 7 | **The seven `ssh-keygen -Y verify` controls** over the signed plane and fleet payload | **Bob's approval in the session** (K1910, K2109) | a signature by a key not in `ARMED_SIGNERS` (if the environment holds a new key, R43's `ARMED_SIGNERS` must change on the cut before step 8) |
| 8 | **Installer** `newgroup`: `npm run build` (embeds signed 0.82.0), `npm test`. Confirm that both container members are named as not pullable (R38) and that the bundle carries no `CIVICSMITH_TEST_INSTANCE` | S | `embed-release` refuses a signature the armed keys do not verify |
| 9 | **Push** the cut, no tag (K1433) | S | none |
| 10 | **Deploy to `biosmoke7`**, from a worktree at the cut, in order:<br>(a) agent-runner (`deploy-fleet`, image copied into the account's registry, rollout of `agent-runner-agentrunner`);<br>(b) file-scanner (first time: both container applications, `CAPTURES`, its cron `17 4 * * *`);<br>(c) agent-worker (with `RUNNER`);<br>(d) pdf-, ocr-, sheet-worker;<br>(e) the plane (`deploy.mjs`; the store migrates on boot from 0.81.0).<br>One approval line may name the sequence (K2110) | **Bob's approval in the session** | Docker in the session (K2110 started a daemon); `deploy.mjs` refuses `BINDING_TARGET_MISSING` if file-scanner failed (`deploy.mjs`:250–262), so a file-scanner fault holds the plane (§6 BOB-5); container usage charges on the account (money, small: max 3 instances per class, `file-scanner/wrangler.jsonc`); migration across nine tranches |
| 11 | **Live verification:**<br>• `/version` 0.82.0 per member from the deployments API;<br>• `bootstrap` with `members=1` (file-scanner `SERVING`);<br>• headline ops in `store=scratch`; `op=audit` (10 known C-18.9);<br>• `op=groupkeystate` (if a group key is held and on, asks would run unbarred and unlabelled on 0.82.0, finding 1: switch it off or record it);<br>• one `op=scanbatch` (ClamAV answers; its signature mirror `clamav/` fills by the cron);<br>• the signed-in checks with the test member credential | S; **Bob's approval** for the credential (K2131's form) | a first scan with no signatures yet answers `not_scanned`; legacy-ui's older forms refused until step 12 |
| 12 | **UI worker `civicos`** (`civicos-ui/deploy-ui.mjs`), since `app.html` changed after 0.80.0 (T36-38). It is Bob's only clickable member interface until T46's screens | **Bob's approval** | legacy-ui untested (N794, N865); unchanged otherwise (K633) |
| 13 | **Installer deploy: deferred.** No fresh install in the trial (K2816 (5)). Deploying needs `connectivity-directory.bind` registered on the OAuth client first (DEPLOY.md §4; K2164), Bob's dashboard act unless the token can edit the client. `release/` still lands on `main`; the 0.81.0 installer stays live | BOB (decided, reported); later Bob's act | a 0.81.0 installer offers groups an update to 0.82.0 from `main/release/RELEASE.json` (`newgroup/src/index.mjs`:50) without the new scope; no real group exists |
| 14 | **Record** one ruling: version, hashes, digests, rollback targets, controls, checks, what was deferred. `release/` reaches `main` with T45's close | S | none |

**At 0.83.0 (T46's close), the same steps plus:**
- **15.** Set `CIVICSMITH_TEST_INSTANCE=biosmoke7` on the plane (`wrangler secret put`), after the plane deploy. **Bob's approval in the session** (a deploy-class act).
- **16.** Verify `bootstrap` `test_instance: true` and `parts` (signin, scanner, safe_view present). Run one ask in `store=scratch` with the test member credential, refused `NO_ACCOUNT` (no account) and never `AI_PART_NOT_DEPLOYED`.
- **17.** Bob's first own sign-in on the `connect` screen, walked through; M-Q2 measured there (K2147); his first labelled answer checked.

Risk: the secret survives every later deploy (`keep_bindings`), so removing it is a deliberate act, recorded.

---

## 5. T46 plan entries

Layers from `build/modules.json`. The new rows' stamp waits for T47's promotion (L2; rows changed in later layers, rulings-active §5).

- **T46-n · file-safety** (L3) · (N897 (4); DEC-149) R42 new (prov.): `SCANNER_ABSENT` and `RENDERER_ABSENT` rows in member words, the details' "copy" removed · `draft-T46-trial.md` §3.2.
- **T46-n · extraction** (L4) · (N897 (2)) R71 amended: a transcription on the test-instance exception records the label in its reading · §1.2 · after run-rules.
- **T46-n · run-rules** (L6) · (N897 (2); K2816; finding 1) R29 `partAdmittedOn`/`untestedLabel`, R30 `AI_PART_NOT_DEPLOYED`, new (prov.); R16, R21 amended: `ask`'s and `draft`'s flags set by this reviewed change · §1.2 · first in L6.
- **T46-n · ai-runs** (L6) · (N897 (2)) R78 new (prov.): `testInstance()` from the environment, `partAdmitted` the one gate; R40, R23's input, R10, R19, R28 answer `untested` · §1.2 · after run-rules.
- **T46-n · question-explorer** (L6) · (N897 (2)) R16 new (prov.): the gate on the exception, finds labelled · §1.2 · after ai-runs.
- **T46-n · agent-worker** (L6) · (N897 (2), (3), (4); finding 4) R79 new (prov.): `untested` carried on `/ask`'s answer and `/draft`'s; R6 amended: a sign-in's `suggestions` boolean; R34 amended: `/version` `runner` · §1.2, §3.2.
- **T46-n · agent-runner, agent-worker** (L6) · (N852; K2816 (3), (4)) transcription by a sign-in: page images through the runner · only if §6 B4 = yes.
- **T46-n · instance-setup** (L11) · (N897 (2)–(4)) R79 `test_instance`, R80 `parts`, new (prov.); R17 amended (agent-runner through agent-worker's `runner`); R54 amended (disclosure at a sign-in connect) · §1.2, §2.2, §3.2.
- **T46-n · setup-page** (L11) · (N897 (2), (4)) R31 new (prov.): the test-instance notice; R30 amended: scanner sentences only when present, parts on the healthy panel · §1.2, §3.2 · after instance-setup.
- **T46-n · plane** (L11) · (N897 (2), (3); finding 1, 4) R40 new (prov.): the ask and draft doors gate on `partAdmitted`, the label on outputs, the transcriber through it; R33 amended: the serving account's suggestions switch · §1.2.
- **T46-n · control-plane** (L11) · (N897 (3), (4)) R65 amended: `DISCLOSURE_DUE` before `start`, `RUNNER_NOT_CONFIGURED` translated; the draft answer's `untested` passed through · §2.2 · after plane.
- **T46-n · installer** (L11) · (N897 (2), (4)) R49 new (prov.): never the test-instance variable; R38, R23 amended: a not-pullable image named per part, before and after · §1.2, §3.2.
- **BOB's acts** (no job):
  - the container-images workflow (§3.3) at the 0.82.0 cut;
  - the 0.82.0 runbook (§4), and 0.83.0's steps 15–17 at T46's close;
  - NOTICE/HANDOFF to UX-DESIGN: words `ai.label.untested`, `ai.refused.signinabsent`, `DISCLOSURE_DUE`, the test-instance notice, the parts' words; the registry's `connect` (`subscriptionsignin` served) and the library's stale step 4 (§2.2 item 6).

---

## 6. Open points

### Bob's (values, legal exposure, money, how real groups behave, or his rulings)

- **Bob-1 · How release 0.82.0 is signed** (security custody; K1936 Q4, K2277). Signing runs only in the GitHub environment `release` with Bob approving each run, and it has never run. If that environment does not yet hold a release key:
  - **A · your signer-page sitting now** (about 15–20 minutes, walked through): a fresh release key and an offline recovery key; you put the release key into the `release` environment; both public lines go into the installer (installer R43). It is the permanent route and the "planned replacement" of K2277 (2).
  - **B · the development key moves into the environment as an interim:** BOB pipes the existing seed from this session's environment into the environment secret without printing it, if the token may, and you approve the signing run. The sitting comes later.
  - **C · hold the release** until A.

  *Recommendation:* **B** if the token can set it, else **A**. B keeps the trial moving and changes no key, and A still follows before any real group installs (K1936's own deadline). Whichever, approving the signing run on GitHub is yours each release (one click).

### BOB's (technical; decided and reported, P17)

- **B1 · Fix the ask and drafts' missing bar gate in T46, and set their flags.** A: gate them (`plane` R40) and set `ask`/`draft` flags (recommended: it makes "the bar stays for every group" true, as K2816 (2) requires; the flags only mark served code). B: gate the bar and leave the flags unenforced (keeps a requirement unmet). C: leave as is (contradicts K2816 (2)). Report to Bob as a defect fixed.
- **B2 · Where the exception lives.** A: a plane secret equal to the instance's slug (recommended: simple, survives deploys, and an install cannot set it; the only other path is the hosting account, which already controls everything). B: a signature by the release key over the slug, verified in the plane (makes a hand-set flag on a group's copy useless, but ties every test instance to the key ceremony of Bob-1, and the plane would need the release keys). C: a record setting (refused: an op could reach it).
- **B3 · Disclosure before a sign-in at the door.** A: `DISCLOSURE_DUE` at `start` (recommended: D311's meaning, enforced where the act is, at no cost). B: leave it to the screen.
- **B4 · N852 in T46.** Its dependency is met for `biosmoke7` (images by copy). A: in T46, so the trial can transcribe on Bob's sign-in (recommended if T46's L6 has room; otherwise transcription is simply missing from the trial). B: later.
- **B5 · A file-scanner deploy fault at step 10.** A: hold the plane and roll back (recommended: the plane needs the binding's target). B: deploy the plane with `FILE_SCANNER` removed from the derived bindings for this release (a change to `wrangler.jsonc` on the cut, re-signed). Decide only if it happens.
- **B6 · The installer at 0.82.0.** A: defer its deploy (recommended, §4 step 13: no fresh install, avoids a dashboard act now). B: deploy, after the scope is registered.
- **B7 · A test instance's `check` runs.** Who starts a member's run (the plane resumes only its own organisation credential's runs, `ai-runs` R18) is for the screens' plan. The exception admits them, and nothing in this draft drives them.
- **B8 · The label's place on a stream.** `untested` on the ask's last `answer` event (recommended: travels with the text) rather than a response header (lost when the answer is copied).

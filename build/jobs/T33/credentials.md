# credentials (T33)

**Status** · session_013T4X8GZR5tPXAUia6wASQV · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four points on T33-20. I am building on the reading given for each and will carry on unless you answer otherwise.

1. **Admission and the ask grant (plan "Choices settled").** Reading: admission does not gate the grant separately. credentials owns the whole decision: `aiGrantAdmit({token, op, write})` answers `{ok, member, viewer: "member:<id>", expires}` or a refusal (`GRANT_OP_REFUSED` naming the op; `GRANT_NOT_HELD` for a token that is unknown, expired, or whose minting session has ended). admission/control-plane (L11) only call it for a presented grant, the way they call `aiCredentialLook` today. The grant is a row in a new table `ai_grants` (only the token's SHA-256, the member, the minting session, the expiry). It is no run row, no observation row and no read log. It is purge-exempt and `export: "never"`.
2. **The subscription half on hold (K1537).** Reading: the kinds this module accepts are `ACCOUNT_KINDS = ["apikey"]`. `kind: "subscription"` is refused `ACCOUNT_KIND_NOT_OFFERED` and writes nothing (the detail says to bring your own API key). Any other kind gets `UNKNOWN_ACCOUNT_KIND`. Until Bob rules, R22's subscription arm is recorded as deferred.
3. **The seal (R23, R29).** Reading: AES-256-GCM. The key is derived with HKDF-SHA-256 from a Worker secret that plane hands in, named `ACCOUNT_SEAL_SECRET` and read as `credentialsOf(ctx, {sealSecret})`. The salt is the member id (for a keyed service, `group:<service>`), and the AAD is the owner and the kind. Neither key nor digest is stored. With no secret bound, a set is refused `ACCOUNT_SEAL_UNAVAILABLE` and writes nothing. This needs plane, bundler/installer to bind the secret; I will REPORT it.
4. **`AI_GRANT_OPS`'s content (R28).** answers R1 names categories, not op names, and several ops don't exist yet. Reading: a frozen, sorted list of op names, today's read ops in R1's categories plus the new ones R1 names, spelled as plane ops: `search searchfields meaningrows standard standards standardinforce profiles entity entitybyalias relation resolutions frontier strengthbarof lines duties occurrences timeline eventsfor moneyof committedagainstpaid holderat careerof explore calculations moneyfacts`. ANSWERS (T33-53) holds `ASK_SCOPE` equal to it with the copy test. If that job needs a different spelling, it is a CHANGE to me or a later credentials job.

## Completion (CREDENTIALS #3)

**Entries applied.** T33-20, with BOB's answer B2 (K1541) to J1:
- **R22–R26, each member's own Claude account** (K1502, K1503). `accountReferenceSet`/`accountReferenceRemove`, `accountReferenceState`, `accountReferenceFor` and `accountSwitchSet` are built.
  - Every act on a reference is asked first through one region, `#accountBar`. Its refusals, in order: machine or absent `by`; any level but `member` (`organisation`, a project id, `class:`); another member, an administrator or the founder; a member who is not active.
  - The reference is sealed with AES-256-GCM. Its key comes from HKDF-SHA-256 over the Worker's seal secret (`credentialsOf(ctx, {sealSecret})`), salted by the member. The AAD is the owner and the kind. No digest is stored.
  - It is unsealed only for the member's own `ask`, `run` or `standing` act. A member with none is refused `NO_ACCOUNT`.
  - The switches `suggestions` and `standing` are off by default. A replacement keeps them; removal turns both off.
- **R27–R28, the ask grant.** `aiGrantMint` mints under the member's own live session. It keeps only the token's SHA-256 in `ai_grants`: no run row, no observation row, no read log.
  - A grant lives `AI_GRANT_TTL_SECONDS` (900), capped by its session, and ends with the session and with the member's revocation (R16 now also deletes the member's grants).
  - `aiGrantAdmit({token, op, write})` admits only reads on `AI_GRANT_OPS` (frozen, 25 ops, as J1 (4)). Anything else is `GRANT_OP_REFUSED` naming the op; a dead or unknown grant is `GRANT_NOT_HELD`. Admission does not gate separately (J1 (1)).
- **R29, the group's keyed services.** `KEYED_SERVICES = ["courtlistener"]`. `keyedServiceSet` and `keyedServiceSwitch` take an active administrator only (`membership.notAnAdmin`). The key is sealed as a member's reference is.
  - A service is on only while switched on and holding a key. `keyedServices()` never returns a key. `keyedServiceFor` answers the key only while the service is on, else `KEYED_SERVICE_OFF`.
- **R30, the tables.** Every table is declared once through `record-core.declareTable` (`CREDENTIALS_TABLES`), all purge-exempt (R18) with `expunge: none`.
  - `export: never` for account references, keyed services, password hashes, sessions, AI credentials and ask grants; `signers` `yes` (public halves), `bootstrap` `admin-only`; account references `sight: owner`.
- **New rows**, ids and `where`s in `checks.mjs`: `ACCOUNT_CHECKS` C-29.13 to C-29.24 and `KEYED_SERVICE_CHECKS` C-96.19 to C-96.21. Each is minted at one site (DEC-49 regions). Promotion's stamp of them is T34's.
- **New routes** in `credentialsOps`: `accountreferenceset`, `accountreferenceremove`, `accountreference`, `accountswitchset`, `aigrantmint`, `keyedserviceset`, `keyedserviceswitch`, `keyedservices`.
  - The stamps (`by`, `viewer`, `member`, `session`) come from the query, and a secret only from the body.
  - `accountReferenceFor`, `aiGrantAdmit` and `keyedServiceFor` are in-plane only and are not routed.
- **Improvement.** The copy-period tolerance of a `TABLE_DECLARED` refusal held by membership is removed. Membership has declared none of these tables since its deletion.

**Deferred.**
- R22's `subscription` arm (K1537). It is refused `ACCOUNT_KIND_NOT_OFFERED` until Bob rules. When he does: add `subscription` to `ACCOUNT_KINDS`, drop it from `HELD_BACK_KINDS`, and turn the test's refusal arm into an acceptance.

**Found in other modules (REPORT J2).**
1. **instance-setup** `test/m/instance-setup/keys.test.mjs:34`. Its record-core stub has `declarePurge` only. Credentials now declares through `declareTable` (record-core R21; credentials R30), so its four R44 tests fail once credentials merges. The fix is one stub method in instance-setup's T33 job; until then it is an accepted red by name. Measured with credentials over the T33 tranche plus a local `declareTable` shim: instance-setup 90/4.
2. **plane, bundler, installer: the seal secret** (J1 (3), K1541). Composition must pass the Worker secret `ACCOUNT_SEAL_SECRET` to `credentialsOf(ctx, {sealSecret})` on first construction. Deployment and the installer must bind it as a secret. Without it, account references and keyed-service keys are refused `ACCOUNT_SEAL_UNAVAILABLE`. Rotating it orphans every stored reference: members reconnect, administrators reset keys.
3. **record-core.** My two tests over the real record-core (`seam.test.mjs` R18 and the `credentialsOf`-over-ctx test) need its `declareTable` (T33-19). They are red on this branch until RECORD-CORE #16 merges, and pass with it (shim measured: 54/54). Credentials merges after record-core, as the order says.
4. **Generated artifact (§14).** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from credentials' source. It is not rebuilt by me.
5. **Wiring owed later.** op-declarations and control-plane (Q0-10, Q1-6) declare and route the eight new ops and call `aiGrantAdmit` for a presented grant. answers (T33-53) holds `ASK_SCOPE` equal to `AI_GRANT_OPS` (K1541). acquisition (T33-21) reads `keyedServiceFor({service: "courtlistener"})`. agent-model, ai-runs and agent-worker read `accountReferenceFor`.

**Final uses.** record-grammar, record-core (`declareTable`, `recordOf`), membership. Unchanged.

**Tests and checks** (on the branch with `tranche/T33` merged at `3cd15e8626`).
- `node --test bio-plane/test/m/credentials/`: tests 54, pass 52, fail 2 (item 3 above). With record-core's `declareTable` shimmed locally (never committed): 54/54.
- Users of credentials, each against the tranche (shimmed), pass/fail:

  | module | result |
  | --- | --- |
  | monitoring | 111/0 |
  | case-authoring | 121/1 (as base) |
  | capture-requests | 73/0 |
  | provenance-routes | 37/0 |
  | tasks | 71/0 |
  | bias | 56/0 |
  | attestation | 19/0 |
  | queue | 113/0 |
  | ratification | 204/0 |
  | network-notices | 68/0 |
  | capture-sources | 82/0 |
  | publication | 109/0 |
  | capture | 118/0 |
  | intent | 65/0 |
  | docket | 43/0 |
  | queue-producers | 80/0 |
  | ai-runs | 55/1 (K1514, as base) |
  | provenance | 88/0 |
  | admission | 19/0 |
  | control-plane | 159/0 |
  | record-core | 99/0 |
  | membership + plane | all pass |
  | instance-setup | 90/4 (item 1) |

- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … credentials`: 0 failures.
- `node checks/coverage.mjs … credentials`: 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … credentials tranche/T33`: 11 files changed; 0 failures.

Size (session_018b8BSawtGnkrtBHccW88jV): test runs 14, module lines 1428

## J2 · REPORT

Found in other modules (record, 'Found in other modules'): (1) instance-setup keys.test.mjs:34's record-core stub lacks declareTable (record-core R21); its 4 R44 tests red once credentials merges, until instance-setup's T33 job. (2) plane/bundler/installer must bind and pass ACCOUNT_SEAL_SECRET as credentialsOf(ctx, {sealSecret}) (K1541); without it account references and keyed keys are refused ACCOUNT_SEAL_UNAVAILABLE. (3) my two real-record-core tests need record-core's declareTable (T33-19); 54/54 with it. (4) bio-plane/dist/bio-plane.bundled.mjs stale (not_product). (5) wiring owed: op-declarations/control-plane route the 8 new ops and call aiGrantAdmit; answers ASK_SCOPE = AI_GRANT_OPS; acquisition reads keyedServiceFor; agent-model/ai-runs/agent-worker read accountReferenceFor.

## J3 · COMPLETE

T33-20 applied: R22-R30 met except R22's subscription arm (held, K1537). Module tests 52/54 here, 54/54 with record-core's declareTable (merges first). Format, architecture, coverage (30/30), ownership 0 failures. Final uses unchanged (record-grammar, record-core, membership). Findings in REPORT J2. Record: build/jobs/T33/credentials.md on job/T33/credentials.

## Completion (CREDENTIALS #4)

**Entries applied.** T33-20b (K1547, K1548), on `tranche/T33` merged at `4708e47b7b`:
- **R22's subscription arm.** `ACCOUNT_KINDS` is `["apikey", "subscription"]`, frozen. A member's own subscription token (`claude setup-token`) is held by their own act only, through the same `#accountBar` refusals in the same order. It is sealed exactly as the API key (AES-256-GCM, HKDF from `ACCOUNT_SEAL_SECRET`, salt the member, AAD member and kind; K1541 (3)), never shown or exported, and unsealed by `accountReferenceFor` only for that member's own ask, run or standing question, answering `{ok, kind: "subscription", secret}`.
- One reference per member, of either kind: a token replaces a key and a key replaces a token, the switches kept (R25); removal turns both off.
- **`ACCOUNT_KIND_NOT_OFFERED` retired** with `HELD_BACK_KINDS`. Its row C-29.18 is removed and its id not reused. An unknown kind stays `UNKNOWN_ACCOUNT_KIND`.
- **Rows' words.** `UNKNOWN_ACCOUNT_KIND`, `NO_SECRET` and `NO_ACCOUNT` told a member to connect "your own API key"; they now name either kind. Ids and `where`s are unchanged; these rows are still unstamped (T34).
- `keyedServiceFor` and everything else is unchanged.

**Tests.** The held-back refusal arm is now an acceptance. R22 (both kinds; refusals before the kind; replacement across kinds), R22/R25 (removing a token), R23 (a token's sentinel in no table, answer, log or digest; sealed under member and kind: a token relabelled `apikey` does not open), R24 (a token unsealed only for the member's own acts), and the rows and routes tests (C-29.18 absent; a token set through the route). A mutation check (`ACCOUNT_KINDS` back to `["apikey"]`) fails 6 of them.

**Deferred.** Nothing.

**Found in other modules (REPORT J4).**
1. **agent-model, ai-runs, agent-worker (L6).** `accountReferenceFor` now also answers `kind: "subscription"`; they must use a subscription token as such (the subscription path through agent-runner needs Workers Paid and the containers scope, K1536 U49 (2)), not as an API key.
2. **The member's account UI** (whichever module carries the connect form; UX-DESIGN's words). It can now offer the subscription token beside the API key.
3. **Generated artifact (§14).** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) still carries the retired row and `HELD_BACK_KINDS`. It is stale from credentials' source; not rebuilt by me.

**Final uses.** record-grammar, record-core, membership. Unchanged.

**Tests and checks.**
- `node --test bio-plane/test/m/credentials/`: tests 54, pass 54, fail 0.
- Users of credentials, pass/fail:

  | module | result |
  | --- | --- |
  | provenance | 89/0 |
  | attestation | 19/0 |
  | provenance-routes | 37/0 |
  | capture-sources | 82/0 |
  | capture | 120/0 |
  | bias | 56/0 |
  | ai-runs | 55/1 (K1514, `scheduler.test.mjs:123`) |
  | intent | 65/0 |
  | publication | 109/0 |
  | docket | 43/0 |
  | network-notices | 68/0 |
  | ratification | 204/0 |
  | case-authoring | 121/1 (K1545, `invariants.test.mjs:124`) |
  | monitoring | 111/0 |
  | affordances | 167/0 |
  | tasks | 71/0 |
  | queue-producers | 80/0 |
  | queue | 114/0 |
  | instance-setup | 90/4 (K1544, `keys.test.mjs` R44 ×4) |
  | admission | 19/0 |
  | control-plane | 159/0 |
  | plane | 86/0 |

- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … credentials`: 0 failures.
- `node checks/coverage.mjs … credentials`: 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … credentials tranche/T33`: 5 files changed; 0 failures.

Size (session_013T4X8GZR5tPXAUia6wASQV): test runs 5, module lines 1421

## J4 · REPORT

Found in other modules (record, CREDENTIALS #4 'Found in other modules'): (1) agent-model, ai-runs, agent-worker (L6): accountReferenceFor now also answers kind "subscription"; they must use a subscription token as such (agent-runner path, Workers Paid and containers scope, K1536 U49 (2)), not as an API key. (2) the member's account UI can now offer the subscription token beside the API key (UX-DESIGN's words). (3) bio-plane/dist/bio-plane.bundled.mjs (not_product) still carries the retired C-29.18 row and HELD_BACK_KINDS: stale from credentials' source, not rebuilt by me.

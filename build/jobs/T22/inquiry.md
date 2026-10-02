# inquiry (T22)

**Status** · session_014pJTLU4oyGLEE68RoT4y8A · depth 2 · RUNNING until 2026-10-02T01:58:44Z (node --test bio-plane/test/m (whole)) · handled B2

## Completion

**Entries applied.**
- **A9 (R53; bias R40), on K1061's wording.** A question's *finding* is its conclusion: R12's projection records it when a document that states its `project:` enters `concluded`, in a new table `inquiry_findings` (bundle_id, project_id, lens_state, lens_sha, principal, at). Purge is declared on `bundle_id` and `project_id` (`INQUIRY_PURGE`).
  - **The lens is recorded from now on.** It is the project's lens in force as the finding is made, read as bias reads every lens (`biasManifest`, project scope, the admin viewer). `lens_state` is one of:
    - `recorded`, with its `statements_sha`;
    - `none`, when no lens was in force for the project;
    - `unreadable`, when no bias is bound, the read fails, or the conclusion was a replay.
  - A revision that stays concluded keeps the finding; a fresh entry into `concluded` replaces it. The principal is the concluding member's id, null for a machine author.
  - `inquiryFindings(host, bias)` is the exported source for `plane` to register (plane R12). It also binds the host's bias, through `bindBias`, as the instance the lens is read from. Inquiry never creates bias.
  - `list` keys are `finding:<INQ id>` in ascending order. They cover every question with a finding row, plus every concluded question that states a project but has no row (concluded before this job); the latter is offered with `lens: null`, undetermined and never filled in.
  - `read` answers `{context: {type: "project", id}, principal, lens: {basis: "at_open", statements_sha} | null, ranUnder: null, rerunOf: null, registered}`. Only `recorded` offers a lens, so a finding made under no project lens raises nothing. `at_open` is bias's comparison of a lens recorded in force, so a lens later withdrawn also counts as moved.
  - `visible` is the question's own sight.
- **Marks.** Bias R40's mark ("not yet met: K102") is struck at plane's merge (B2). My folded mark on R53, `*(not yet met: T22)*`, is met by this job.
- **N480.** Five notes re-worded:
  - `index.mjs`:2076 now names op-declarations' `STATE_ACTIONS`.
  - The earnedbasis note (~:2832) now reads "the old plane `index.mjs`'s doctrine was", naming op-declarations' table of ops and `SESSION_OPS`.
  - The citation of `schema.mjs`:739–743 now reads "the legacy `schema.mjs`, deleted since".
  - `affordances.mjs` is now in the past tense.
  - Two notes naming CLAUDE.md now name the old process's CLAUDE.md (archived).

  Provenance notes stay: the dated measurement in `schema.mjs`:115 and the notes naming tests deleted in T20. No note names `tools/`. The runtime sentence at `index.mjs`:2160 ("CLAUDE.md's sparse rule") is outward text and stays as is (deferred: changing outward words is not this entry's).
- **DEC-88.** `content-legs.test.mjs`:399 (`attestText`) and :409 (`transcriptionAttest`) now send the attestor's `note`; both are fixed and green. There is no other attest call in my tests (`testimony-inherited.test.mjs`:73 already sent one).

**Size.** The module is now 3,882 lines, under K617's 4,000.

**Found in other modules (REPORT).**
- (1) The plane's bundle is stale: my change is under `bio-plane/src/inquiry/`. I regenerated nothing.
- (2) `plane`: R12's line after `store.mjs`:120, `biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)))` (B2).
- (3) inquiry R36 names this module's purged tables one by one; `inquiry_findings` should join that list (wording only, BOB's).
- (4) Six modules' test worlds (actions, consequences, contradiction, publication, conformance, reevaluation) build inquiry without ever building or migrating bias. That is why inquiry cannot register itself (J1).

**Tests and checks.**
- `test/m/inquiry/`: 166 pass, 0 fail. The new `findings.test.mjs` holds R53 and bias R40: a lens change raises a debt through bias's real `biasDebtSweep`, a finding made under no project lens raises none (negative control), and a second `finding` registration is refused `WORK_PRODUCTS_DECLARED`. The R36 test now includes `inquiry_findings` and its purge.
- `test/m/bias/`: 56/0, so `debt.test.mjs`:234 is unchanged and green. Its world builds no inquiry, so the two registrations of `finding` cannot meet in one world.
- strength 69/0, basis-versions 118/0, contradiction 101/0, control-plane 100/2 (accepted :310, :15), ai-runs 50/6 before its merge (accepted; green after it).
- Whole `bio-plane/test/m`: 4,791 pass, 38 fail, every failure accepted by name: intent's fixture (29), affordances `backing.test.mjs` R19, actions `t18.test.mjs`:299, scheduler `plane.test.mjs`:85, control-plane :310 and :15, and queue-producers `proposals.test.mjs` (4, the same without my change).
- Checks:
  - format: 0 failures
  - architecture: 0 failures
  - coverage: 49 of 49 ids named, 0 failures
  - ownership: 7 files, 0 failures

Size (session_014pJTLU4oyGLEE68RoT4y8A): test runs 14, module lines 3882

## J1 · QUESTION

A9 / R53: who registers. My best reading, which I am building now: the R52 pattern (plane R10). inquiry EXPORTS `inquiryFindings(host, bias)`, a bias R33 source over its findings that also binds the host's bias as the instance a finding's lens is read from. `plane` registers it at start, after `biasOf(ctx, { env })` (store.mjs:120): `biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx)))`. R53 would read "exports … for `plane` to register under this module's kind" in place of "At start this module registers", with no change of meaning to what bias R40 gets.

Why not "registers itself when the factory first builds", as B1 says: inquiry cannot reach bias without creating it on a host that has not built it.
(1) Production: the plane builds inquiry (through `basisVersionsOf`, store.mjs:107) before `aiRunsOf(ctx, env)` builds bias with its `env`. If inquiry's factory called `biasOf(host)`, it would create bias first, without `env`, and BIAS_DEBT_DELAY_MS and BIAS_DEBT_BATCH would be lost (a factory reads its deps on the first call only).
(2) Tests: I measured it. Registering at the factory, or at inquiry's `migrate()`, makes bias register its promotion step on hosts that never migrated bias's tables, so every promotion fails `no such table: bias_statements`. That turns red the suites of six other modules: actions 49, consequences 29, contradiction 18, publication 82, conformance 52, reevaluation 78. Their fixtures are theirs.

What needs you: (a) the R53 re-wording, and (b) a plane entry: one line in store.mjs after :120, in plane's L11 job or wherever you place it. Bias R40's mark would then be struck at plane's registration, or at my merge if you take my test's registration on a real bias as the proof.

Until a host binds bias, a finding records lens_state `unreadable`: undetermined, never filled in. Everything else proceeds on this reading (the record, the source, my test). If you prefer the alternative (the six fixtures migrate bias and inquiry registers at `migrate()`), that is six other jobs' changes, and it still leaves (1).

## J2 · REPORT

(1) The plane's bundle (bio-plane/dist/bio-plane.bundled.mjs) is stale: my change is under bio-plane/src/inquiry/. I regenerated nothing. (2) plane R12 is owed: after store.mjs:120, biasOf(ctx).registerWorkProducts("finding", inquiryFindings(ctx, biasOf(ctx))). (3) inquiry R36 lists this module's purged tables one by one; inquiry_findings (new, R53) should join that list. It is declared to purge on bundle_id and project_id (wording only). (4) Six modules' test worlds (actions, consequences, contradiction, publication, conformance, reevaluation) build inquiry and never build or migrate bias. That is why inquiry cannot reach bias itself (J1); it is noted for whoever next wires bias there.

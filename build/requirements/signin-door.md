# signin-door — requirements

**Status** · Fix round 10 (T51; K5046 (c)): R6 new, `subscriptionsignin` declared here (from `control-plane`). New in T47 (T47-91; N1001; connect §3; K617, K624; folded K3100, the fold draft's doubt 2 taken): split by copy from `control-plane` for size, layer 11 after `store-door` and before `interface-assets`. R1–R5 are `control-plane` R65, R78, R85, R86, R87, meaning unchanged, each marked "was"; `control-plane`'s job deletes its copies and routes `subscriptionsignin` and `subscriptiondisconnect` to this module (its R26 pattern). Not yet met (T47). T48 (T48-67; N996; K3101): citations of `credentials` R35, R43, R64, R70 and R16's sign-in clause re-pointed to `ai-accounts` R7, R18, R23, R19 and R27, wording only, unmarked (K3038). Last changed T53 (BOB's worker pass for #325: R1 to R6 retired, the sign-in relay and `subscriptionsignin` replaced by the adapter's connect flow and `aisignin`, N1220, K5457, N1199). With every line retired the module is empty: removing it from `modules.json` and `layers.md` is BOB's act at the layer-11 START (the worker did not edit them), and `agent-worker`'s job removes `POST /signin`.

**Size (P6).** Measured at its START (M-T47-1, K617).

## Public

### Purpose

The subscription sign-in door: a member's own sign-in with her Claude subscription, relayed to `agent-worker`'s `POST /signin`, each request traced, the token held through `credentials` and never answered, logged or echoed, and the test instance's trace read.

### Provides

- **R1** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): the relay of `subscriptionsignin` to `agent-worker`'s `POST /signin` is replaced by the adapter's connect flow behind `agent-model` (`aisignin`). *(retired: T53)*
- **R2** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): `subscriptionsignin` is retired, so is its `DISCLOSURE_DUE` refusal at `start` (the disclosure before first material goes to a provider is `aimoments`', `ai-accounts` R23). *(retired: T53)*
- **R3** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): the sign-in relay and its trace are retired; the connect flow's own trace line replaces them (`agent-worker`, `draft-agent-run-path.md` R83 to R85). *(retired: T53)*
- **R4** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): the held-token hand-off of the Claude sign-in is retired; a provider-issued token is `ai-accounts`' under `aisignin`. *(retired: T53)*
- **R5** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): the sign-in trace read goes with the relay (`agent-runner` `POST /signin` is retired). *(retired: T53)*
- **R6** retired (T53, N1220, K5457; N1199; `draft-assistant-screens.md` §9, `FOLD-AI.md` §2.8): `subscriptionsignin` is no longer declared: it is retired and replaced by `aisignin`, declared by `ai-accounts` (`op-declarations` R90). *(retired: T53)*

## Private

### Uses

- `agent-worker`: `POST /signin` through the `AGENT_WORKER` binding (its R66, R81, R84; R1, R3, R4).
- `ai-accounts` (since T48; N996): `aiKeptAway`, `subscriptionConnected`, `disclosureDue`, `subscriptionTokenHold`, `accountReferenceState`, `subscriptionTokenRefused`, the member's revocation (its R2, R7, R18, R19, R23, R27; R1, R2, R4). A `modules.json` edge `signin-door → ai-accounts` once its code imports it (today it reaches them through `credentials`' delegates, `credentials` R72).
- `admission`: the caller it admits (a member's own session; R1).
- `answer-envelope`: the relay and refusal rows (R1, R2).

### Invariants

- None of its own beyond R1–R5: R1, R4 and R5 carry `control-plane` R30's rule that no code, token or secret is logged, stored, echoed or answered.

### Satisfies

- As `control-plane` R65, R78, R85–R87 satisfy them: N708, DEC-156 (R1); N981 (R2); N1001, connect §3 (R3–R5); K3060 D10 (R4).

### Suggestions

- The split is copy then delete (K624): this module merges after `store-door` in L11; `control-plane`'s job (T47-65) deletes its copies after it.

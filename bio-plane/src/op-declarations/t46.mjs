/* op-declarations R50, R51 (T46; N897 (1), N920, N919, N654, N917, K2987; DEC-162; K2952, K2960, K2976): T46'S OPS IN
   THE OWNERS' FAMILIES, held apart from `index.mjs` for size (M-T46-1), as `t45.mjs` holds T45's. Each op is named under
   its owner with the kind `index.mjs`' `OP_KINDS` gives it, read from the owner's merged requirements and, where the
   owner serves it, its ops map's arm. Escalation's two acts (R51) are no family's: they join `ESCALATION_ACTIONS` in
   `index.mjs`, beside `declinetoescalate`, whose stamps they take.
   This file is data only (R5, R7): `index.mjs`' `family()` merges each share into its owner's family (its `ops` and
   `extra` merged), as it merges `T45_SHARES`. */

const T46_SHARES = Object.freeze({
  /* instance-setup R79 (R50; DEC-162, DEC-175): how much is explained to a member, set by the member alone as the screen
     language is (`memberlanguageset`'s posture, `sessionact`: a session's only, no working capability), `level` and
     `asked` the body's and `by` the query's; and the member's own setting read, a session's read. */
  "instance-setup": Object.freeze({ cite: "instance-setup R79; R50", ops: Object.freeze({
    infolevelset: "sessionact", infolevel: "sessionread" }) }),
  /* plan-work R14 (R51; N920): the status report's material for the assistant's draft, a read answered to a member's
     session only, apart from the machine's `statusreportdraft`. The plane's draft door reads it for the assistant
     (plane R40); it is not on `AI_GRANT_OPS`. */
  "plan-work": Object.freeze({ cite: "plan-work R14; R51", ops: Object.freeze({ statusreportassist: "ownread" }) }),
  /* membership R130 (R51; N654): the settings and history of the group's two doors, never their secrets, an
     administrator's read from a session (NOT_AN_ADMIN otherwise), `by` the query's and `limit` a query field, as
     credentials' `securitymap`. */
  membership: Object.freeze({ cite: "membership R130; R51", extra: Object.freeze({ joindoors: Object.freeze(["by"]) }),
    ops: Object.freeze({ joindoors: "ownread" }) }),
  /* action-clocks R20 (R51; K2987): the standing proposals of a clock on an action, a read as the family's others are,
     `action` a query field. */
  "action-clocks": Object.freeze({ cite: "action-clocks R20; R51", ops: Object.freeze({ clockproposals: "read" }) }),
  /* agent-worker R76 (R51; N917; K2960): the sentences of a prepared outward text that read as an assertion, a member's
     own labelled draft that writes nothing, declared as `infractiondraft` and `bearingdraft` are (R49), `by` the query's
     beside the viewer, `text` the body's. Its handler is control-plane's door route (its R57). */
  "agent-worker": Object.freeze({ cite: "agent-worker R76; R51; N917, K2960",
    extra: Object.freeze({ textcheck: Object.freeze(["by"]) }), ops: Object.freeze({ textcheck: "ownread" }) }),
  /* ai-runs R18 (R51; N919; K2952, K2976): the segment of a run a member opened on her own sign-in, started for her
     (`memberrun`: her session or her own `ai` credential, presented in the header, K2976), `by` the query's and `run`
     the body's; no field carries a credential. Its handler is control-plane's door, which calls
     `ai-runs.dispatchMemberRun` in process; no entry in `aiRunsOps` serves it. */
  "ai-runs": Object.freeze({ cite: "ai-runs R18; R51; K2952, K2976", ops: Object.freeze({ airundispatch: "memberrun" }) }),
});

export { T46_SHARES };

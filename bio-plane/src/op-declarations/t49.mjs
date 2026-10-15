/* op-declarations R71, R72 (T49; N1072, N1091; K3265; DEC-237 (3)): T49'S OPS IN THE OWNERS' FAMILIES, held apart from
   `index.mjs` for size, as `t45.mjs` to `t48.mjs` hold T45's to T48's. Each op is named under its owner with the kind
   `index.mjs`' `OP_KINDS` gives it. `index.mjs`' `family()` merges each share into its owner's family, as it merges
   the earlier tranches'. This file is data only (R5, R7).
   - `founderhandleset` (R71; `membership` R144): the founder's own choice of their handle, an act of the founder's
     password session alone (kind `founder`: classes `admin`, `machineClasses: []`, no working capability, in
     `SESSION_OPS.admin` only), `by` from the query (membership's actor), `handle` the body's.
   - `projectownervotes` (R72; `project-roster` R30): who among a project's owners has voted, a read answered to a
     member's session only (kind `ownread`), the viewer stamped, the project the query's. */

const T49_SHARES = Object.freeze({
  membership: Object.freeze({ cite: "membership R144; R71", ops: Object.freeze({ founderhandleset: "founder" }) }),
  "project-roster": Object.freeze({ cite: "project-roster R30; R72", ops: Object.freeze({ projectownervotes: "ownread" }) }),
});

export { T49_SHARES };

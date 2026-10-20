/* link-sweep R15 (T51; K4168, K4189, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, linkSweepOps } from "../../../src/link-sweep/index.mjs";
import { listWorld, sweepDef, SEED } from "./fixture.mjs";

const LIST = "INFO-2026-0992-list", PROJ = "PROJ-2026-0992-decl";
/* a refusal names a field by its argument, or by a finding of the grammar it relays, or as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const text = [answer.code, answer.argument, answer.detail, ...(answer.findings || []).map((f) => f.detail)].map(words).join(" ");
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test(text);
};
/* the call as the door runs it, on a fresh world holding one unratified sweep */
const mk = (op, adapt = (f) => f) => async (given) => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef({ id: "minutes", ratified: false })] });
  const q = new URLSearchParams({ op, author: "member:alice", viewer: "member:alice" });
  return await linkSweepOps(w.s, new URL("http://do/?" + q), adapt(given))[op]();
};
const FIELDS = { title: "Council minutes", sources: ["https://records.example.org/council"], seeds: [SEED], match: { terms: ["minutes"] },
                 cadence: "weekly", budget: { per_run: 10, backlog: 20 } };
const sameKind = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

test("R15 link-sweep declares sweeps: its requires alone raise no refusal naming a field, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sweeps", declaration: DECLARED_OPS.sweeps, refusedNaming: named, same: sameKind,
    call: async (f) => { const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef()] });
      const q = new URLSearchParams({ op: "sweeps", viewer: "member:alice", ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, String(v)])) });
      return linkSweepOps(w.s, new URL("http://do/?" + q), {}).sweeps(); },
    values: { now: "1790000000000" } });
});

test("R15 link-sweep declares sweepset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sweepset", declaration: DECLARED_OPS.sweepset, refusedNaming: named, same: sameKind,
    call: mk("sweepset", (f) => ({ ...f, ...(f.bundle === undefined ? {} : { bundle: LIST }) })),
    values: { bundle: LIST, ...FIELDS } });
});

test("R15 link-sweep declares sweepratify: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sweepratify", declaration: DECLARED_OPS.sweepratify, refusedNaming: named, same: sameKind,
    call: mk("sweepratify"), values: { sweep: `${LIST}#minutes`, ratified: true } });
});

/* K4230: op-declarations refuses a mutating row with no `needs` (NEEDS_MISSING, its R80); this module's own check, not imported
   from op-declarations (it comes later in the order). A member's act on the team's sweeps needs `contribute`, as
   `monitoring`'s `namedrequestset` does: the owner's ratify is refused by the arm, not by a capability. */
const missingNeeds = (rows) => Object.entries(rows).filter(([, r]) => r.mutating && !Object.hasOwn(r, "needs")).map(([op]) => op);

test("R15 link-sweep declares a need on every mutating op it serves (sweepset and sweepratify: contribute), and the check refuses a mutating row without one", () => {
  assert.deepEqual(missingNeeds(DECLARED_OPS), []);
  assert.equal(DECLARED_OPS.sweepset.needs, "contribute");
  assert.equal(DECLARED_OPS.sweepratify.needs, "contribute");
  /* control: the same check names a mutating row that declares no need, and passes a read */
  assert.deepEqual(missingNeeds({ bare: { mutating: true, classes: ["member"] }, read: { mutating: false, classes: ["member"] } }), ["bare"]);
});

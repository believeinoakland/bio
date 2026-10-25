/* link-sweep R15 (T51; K4168, K4189, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door
   runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is
   refused naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, linkSweepOps } from "../../../src/link-sweep/index.mjs";
import { listWorld, sweepDef, SEED, doorQuery } from "./fixture.mjs";

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
  const q = doorQuery(op, "member:alice");
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

/* K5148 (B9): the door sets on the query the stamps a row declares, and no other. A member's define or ratify carries the
   member's `author` only when the row names it; without it the arm reads no member and refuses the act as an automated
   credential, so the test that the row names both stamps is the one that catches it. */
test("R13, R14 link-sweep's sweepset and sweepratify declare the stamps a member's act needs: author and viewer", () => {
  assert.deepEqual(DECLARED_OPS.sweepset.stamps, ["author", "viewer"]);
  assert.deepEqual(DECLARED_OPS.sweepratify.stamps, ["author", "viewer"]);
});

test("R13 a member's sweepset is admitted when the door stamps the author its row declares, and refused as a machine when it does not", async () => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [] });
  const body = { bundle: LIST, ...FIELDS };
  const admitted = await linkSweepOps(w.s, new URL("http://do/?" + doorQuery("sweepset", "member:alice")), body).sweepset();
  assert.equal(admitted.ok, true, JSON.stringify(admitted));
  /* control: the same act with no stamps from the door is the machine refusal, so the stamps are the cause */
  const bare = await linkSweepOps(w.s, new URL("http://do/?" + new URLSearchParams({ op: "sweepset" })), body).sweepset();
  assert.equal(bare.code, "MACHINE_CANNOT_SET_SWEEP");
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

/* K4247 (B7): a read cannot carry a rung. op-grades takes this module's whole declaration once at the plane's start (its R49), and
   refuses a read row that states a rung (`rung-on-read`) whole; so the sweeps row is a read, and the registration meets no refusal. */
let fresh = 0;
const freshOpGrades = () => import(`../../../src/op-grades/index.mjs?instance=link-sweep-${fresh++}`);

test("R15 link-sweep's sweeps row is a read: op-grades registers the module's whole declaration with no refusal, and a copy of the row with a rung is refused rung-on-read", async () => {
  const m = await freshOpGrades();
  const answer = m.registerDeclaredOps({ "link-sweep": DECLARED_OPS });
  assert.deepEqual(answer.agreed, ["sweeps"], "sweeps' read agrees with op-grades' hand row, so it is no new registration");
  assert.deepEqual(answer.registered.sort(), ["sweepratify", "sweepset"]);
  assert.equal(Object.hasOwn(m.RUNGS, "sweeps"), false, "a read takes no rung");
  /* control: the same row with a rung is refused, naming the op and the refusal */
  const rung = await freshOpGrades();
  assert.throws(() => rung.registerDeclaredOps({ "link-sweep": { sweeps: { ...DECLARED_OPS.sweeps, weight: "reversible" } } }),
    (e) => e.code === "DECLARED_OP_BAD_WEIGHT" && e.message.includes("sweeps") && e.message.includes("rung-on-read"));
});

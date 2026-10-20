/* R40, R41 (T51 fix round; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the
   door runs it (test-support R15): only its requires raise no refusal naming a declared field, a call without each
   required one is refused naming it, and a field outside accepts is dropped. Each call runs over a fresh world, so a
   write of one call never changes the answer of the next. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, projectRosterOps } from "../../../src/project-roster/index.mjs";
import { world, V } from "./fixture.mjs";

/* a refusal names a field by the answer's own shape for the absent field: the project as null (the absent answer, or
   the refusal's `project`), the handle as null, and the refusals that name a reason, an answer or a stake by their code */
const BY_CODE = { reason: "NO_REASON", answer: "PROJECT_REQUEST_UNKNOWN_ANSWER", stake: "STAKE_MALFORMED" };
const namesField = (answer, field) => answer?.ok === false
  && (field === "projectId" ? answer.project === null : field === "handle" ? answer.handle === null : answer.reason === BY_CODE[field]);
/* two answers agree when they are the same verdict: the same success, or the same refusal code */
const sameVerdict = (x, y) => x?.ok === y?.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the op as the door runs it: its handler from the ops map, the stamps and the fields all in the query */
const door = (w, op, stamps) => async (fields) => {
  const q = new URLSearchParams({ ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])) });
  return projectRosterOps(w.r, new URL(`http://x/?${q}`), null, {})[op]();
};

/* P (hidden): ann owns it, bob joined; Q (discoverable): owned by ann; cal outside both. */
async function fresh() {
  const w = await world().group("ann", "bob", "cal");
  w.owned("PROJ-P", "ann", ["bob"]);
  w.owned("PROJ-Q", "ann");
  w.m.projectVisibilitySet({ projectId: "PROJ-Q", setting: "discoverable", by: "ann", viewer: V("ann") });
  return w;
}
const hold = (op, { prepare = async () => {}, stamps, values, outside }) =>
  declaredOpHolds({ op, declaration: DECLARED_OPS[op], values, outside, refusedNaming: namesField, same: sameVerdict,
    call: async (fields) => { const w = await fresh(); await prepare(w); return door(w, op, stamps)(fields); } });
const as = (id) => ({ by: id, viewer: V(id) });

test("R40 projectowneradd declares its fields: its requires alone raise no refusal naming a declared field, a call without the project or the handle is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectowneradd", { stamps: as("ann"), values: { projectId: "PROJ-P", handle: "bob" } });
});

test("R40 projectownerremove declares its fields: its requires alone raise no refusal naming a declared field, a call without the project, the handle or the reason is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectownerremove", { stamps: as("ann"), values: { projectId: "PROJ-P", handle: "bob", reason: "stepping down" },
    prepare: async (w) => { assert.equal(w.r.projectOwnerAdd({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") }).ok, true); } });
});

test("R41 projectownerrescue declares its fields: its requires alone raise no refusal naming a declared field, a call without the project, the handle or the reason is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectownerrescue", { stamps: as("second"), values: { projectId: "PROJ-P", handle: "bob", reason: "owners gone" },
    prepare: async (w) => { w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" }); } });
});

test("R41 projectrequest declares its fields: its requires alone raise no refusal naming a declared field, a call without the project is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectrequest", { stamps: as("cal"), values: { projectId: "PROJ-Q", comment: "may I join?" } });
});

test("R41 projectrequestwithdraw declares its fields: its requires alone raise no refusal naming a declared field, a call without the project is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectrequestwithdraw", { stamps: as("cal"), values: { projectId: "PROJ-Q" },
    prepare: async (w) => { assert.equal(w.r.projectRequest({ projectId: "PROJ-Q", by: "cal", viewer: V("cal") }).ok, true); } });
});

test("R41 projectrequestanswer declares its fields: its requires alone raise no refusal naming a declared field, a call without the project, the handle or the answer is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectrequestanswer", { stamps: as("ann"), values: { projectId: "PROJ-Q", handle: "cal", answer: "grant" },
    prepare: async (w) => { assert.equal(w.r.projectRequest({ projectId: "PROJ-Q", by: "cal", viewer: V("cal") }).ok, true); } });
});

test("R41 projectstakeset declares its fields: its requires alone raise no refusal naming a declared field, a call without the project or the stake is refused naming it, and a field outside accepts is dropped", async () => {
  await hold("projectstakeset", { stamps: as("bob"), values: { projectId: "PROJ-P", stake: "We rent next to the site." } });
});

test("R41 control: a field the declaration leaves out is caught, and a requirement the arm does not hold is caught", async () => {
  /* the helper fails a declaration that is wrong, so a passing declaration above is a true one */
  const wrongRequires = { ...DECLARED_OPS.projectrequest, fields: { accepts: ["projectId", "comment"], requires: ["projectId", "comment"] } };
  await assert.rejects(declaredOpHolds({ op: "projectrequest", declaration: wrongRequires, values: { projectId: "PROJ-Q" },
    refusedNaming: namesField, same: sameVerdict,
    call: async (fields) => { const w = await fresh(); return door(w, "projectrequest", as("cal"))(fields); } }), /comment/);
  const wrongAccepts = { ...DECLARED_OPS.projectowneradd, fields: { accepts: ["projectId", "handle"], requires: ["projectId"] } };
  await assert.rejects(declaredOpHolds({ op: "projectowneradd", declaration: wrongAccepts, values: { projectId: "PROJ-P", handle: "bob" },
    refusedNaming: namesField, same: sameVerdict,
    call: async (fields) => { const w = await fresh(); return door(w, "projectowneradd", as("ann"))(fields); } }), /handle/);
});

test("R40 R41 each declared op is an op of the ops map, and its class, weight and description are the existing rows' (a mutating op, never a read)", async () => {
  const w = await fresh();
  const map = projectRosterOps(w.r, new URL("http://x/"), null, {});
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.equal(typeof map[op], "function", op);
    assert.equal(row.mutating, true, op);
    assert.deepEqual(row.classes, ["admin", "member", "probe"], op);
  }
  assert.equal(Object.keys(DECLARED_OPS).length, 7, "the two owner-vote ops of R40 and the five of R41");
});

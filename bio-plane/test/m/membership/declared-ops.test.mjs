/* membership R155 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, membershipOps } from "../../../src/membership/index.mjs";
import { world, V } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a group of ann and bob, a project ann owns; bob invited to it, or joined, as the act asks */
const mkProject = async (bob = null) => {
  const w = await world().group("ann", "bob");
  w.project("PROJ-A");
  w.m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  if (bob) assert.equal(w.m.projectInvite({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  if (bob === "joined") assert.equal(w.m.projectJoin({ projectId: "PROJ-A", by: "bob" }).ok, true);
  return w;
};

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkProject());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (membershipOps(env.m, url, fields, { VERSION: "test-build" })[op]());
};

test("R155 membership declares projectinvite: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectinvite", declaration: DECLARED_OPS["projectinvite"], call: mk("projectinvite", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"projectId":["NO_SUCH_PROJECT"],"handle":["NO_SUCH_HANDLE"]}, true), values: {"projectId":"PROJ-A","handle":"bob"}, same: sameCode });
});

test("R155 membership declares projectjoin: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectjoin", declaration: DECLARED_OPS["projectjoin"], call: mk("projectjoin", {"by":"bob","viewer":"member:bob"}, async () => (mkProject("invited")), null),
    refusedNaming: named({"projectId":["NOT_INVITED"]}, true), values: {"projectId":"PROJ-A"}, same: sameCode });
});

test("R155 membership declares projectleave: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectleave", declaration: DECLARED_OPS["projectleave"], call: mk("projectleave", {"by":"bob","viewer":"member:bob"}, async () => (mkProject("joined")), null),
    refusedNaming: named({"projectId":["NOT_A_PARTICIPANT"]}, true), values: {"projectId":"PROJ-A"}, same: sameCode });
});

test("R155 membership declares projectremove: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectremove", declaration: DECLARED_OPS["projectremove"], call: mk("projectremove", {"by":"ann","viewer":"member:ann"}, async () => (mkProject("joined")), null),
    refusedNaming: named({"projectId":["NOT_THE_OWNER"],"handle":["NO_SUCH_HANDLE"]}, true), values: {"projectId":"PROJ-A","handle":"bob"}, same: sameCode });
});

test("R155 membership declares projectvisibilityset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "projectvisibilityset", declaration: DECLARED_OPS["projectvisibilityset"], call: mk("projectvisibilityset", {"by":"ann","viewer":"member:ann"}),
    refusedNaming: named({"projectId":["NO_SUCH_PROJECT"],"setting":["PROJECT_VISIBILITY_UNKNOWN_SETTING"]}, true), values: {"projectId":"PROJ-A","setting":"discoverable"}, same: sameCode });
});

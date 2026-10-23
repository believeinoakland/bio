/* basis-versions R57 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, basisVersionsOps } from "../../../src/basis-versions/index.mjs";
import { world, block, version, merge, V } from "./fixture.mjs";
const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r";
const T = "2026-09-27T00:00:00Z", ALICE = "member:alice";
const ACC = { state: "accepted", state_by: ALICE, state_at: T, state_reason: "" };
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a question with two accepted readings and two suggested ones, and a project that cites it; alice a member */
const mkVersions = async () => {
  const w = world();
  for (const d of [DOC, DOC2, DOC3]) w.doc(d);
  w.member("alice");
  const r = w.inquiry(Q, block(merge(version("opening account", [DOC, DOC2], ACC), version("the audit alone", [DOC3], ACC),
    version("composed by hand", [DOC]), version("read elsewhere", [DOC], { hidden: true }))));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  w.A = w.project("Oversight", "alice", [Q]);
  return w;
};
/* a question whose reading "first" has a citation (piece 0) of a document held with its capture */
const mkNarrow = async () => {
  const w = world();
  w.doc(DOC); w.doc(DOC2); w.member("alice");
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  const r = w.inquiry(Q, block(merge(version("first", [DOC, Q2], { claim: "the claim" }), { grounds: [], legs: [] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
};
/* the real question and project stand for the ones the call names */
const real = (fields, env) => ({ ...fields, ...("target" in fields ? { target: Q } : {}), ...("project" in fields ? { project: env.A } : {}) });

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkVersions());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (basisVersionsOps(env.bv, url, fields)[op]());
};

test("R57 basis-versions declares versionaccept: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionaccept", declaration: DECLARED_OPS["versionaccept"], call: mk("versionaccept", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"composed by hand"}, same: sameCode });
});

test("R57 basis-versions declares versionreject: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionreject", declaration: DECLARED_OPS["versionreject"], call: mk("versionreject", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"composed by hand"}, same: sameCode });
});

test("R57 basis-versions declares versionconsider: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionconsider", declaration: DECLARED_OPS["versionconsider"], call: mk("versionconsider", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"composed by hand"}, same: sameCode });
});

test("R57 basis-versions declares versionrevert: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionrevert", declaration: DECLARED_OPS["versionrevert"], call: mk("versionrevert", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"composed by hand"}, same: sameCode });
});

test("R57 basis-versions declares versioncurrent: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versioncurrent", declaration: DECLARED_OPS["versioncurrent"], call: mk("versioncurrent", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"opening account"}, same: sameCode });
});

test("R57 basis-versions declares versionhide: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "versionhide", declaration: DECLARED_OPS["versionhide"], call: mk("versionhide", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["VERSION_ACT_NO_INQUIRY"],"version":["VERSION_ACT_NO_VERSION"],"reason":["VERSION_NO_REASON"],"project":["VERSION_CURRENT_NO_PROJECT"]}, true), values: {"version":"composed by hand"}, same: sameCode });
});

test("R57 basis-versions declares narrow: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "narrow", declaration: DECLARED_OPS["narrow"], call: mk("narrow", {"author":"member:alice","viewer":"member:alice"}, async () => (mkNarrow()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NARROW_NO_INQUIRY"],"version":["NARROW_NO_SUCH_VERSION"],"ord":["NARROW_NO_SUCH_LEG"],"extent":["NARROW_NO_EXTENT"],"name":["NARROW_NAME"],"description":["NARROW_NO_DESCRIPTION"]}, true), values: {"version":"first","ord":0,"name":"first narrowed","description":"points at page three, where the vote is recorded","extent":{"extent_kind":"pdf-page","extent_page":"2"}}, same: sameCode });
});

test("R57 basis-versions declares conclude: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "conclude", declaration: DECLARED_OPS["conclude"], call: mk("conclude", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NO_TARGET"],"falsifier":["NO_FALSIFIER"],"no_falsifier":["NO_FALSIFIER"],"conclusion":["NO_CONCLUSION"],"project":["NO_CONCLUSION"],"reading":["NO_CONCLUSION"]}, true), same: sameCode });
});

test("R57 basis-versions declares withdrawconclusion: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "withdrawconclusion", declaration: DECLARED_OPS["withdrawconclusion"], call: mk("withdrawconclusion", {"author":"member:alice","viewer":"member:alice","identity":"member:alice"}, null, null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"reason":["NO_REASON"],"target":["NO_TARGET"],"project":["NOT_A_PROJECT"]}, true), same: sameCode });
});

test("R57 basis-versions declares narrowcandidates: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "narrowcandidates", declaration: DECLARED_OPS["narrowcandidates"], call: mk("narrowcandidates", {"viewer":"member:alice"}, async () => (mkNarrow()), null, (fields, env) => (real(fields, env))),
    refusedNaming: named({"target":["NARROW_NO_INQUIRY"],"version":["NARROW_NO_SUCH_VERSION"],"ord":["NARROW_NO_SUCH_LEG"]}, true), values: {"version":"first","ord":0}, same: sameCode });
});

test("R57 basis-versions declares narrowcandidates as a read: not mutating, weight read, its description the sentence its key basis-versions.declared.narrowcandidates names (it writes nothing)", () => {
  const row = DECLARED_OPS["narrowcandidates"];
  assert.equal(row.mutating, false);
  assert.equal(row.weight, "read");
  assert.match(row.description, /writes nothing/);
});

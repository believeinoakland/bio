/* sources R21, R22 (T51; K4168, K4206): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, SECRET_NOT_RECOGNISED_ANSWER, sourcesOps } from "../../../src/sources/index.mjs";
import { seeded, SECRET } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the group's world: bob has two pulled sources and has disclosed a name of the first, whose entry a consent names */
const mkWorld = async () => {
  const w = seeded();
  const a = await w.pulled();
  const b = await w.pulled();
  const d = w.disclose(a.sourceId);
  if (!d.ok) throw new Error("fixture disclosure refused: " + JSON.stringify(d));
  return Object.assign(w, { srcA: a.sourceId, srcB: b.sourceId, entry: d.entry });
};
const filled = (fields, env) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k,
  k === "source" ? env.srcA : k === "to" ? env.srcB : k === "entry" ? env.entry
  : k === "revealed" ? { kind: "pseudonym_link", to: env.srcB } : v]));

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if (answer.field === field || answer.argument === field || (typeof answer.field === "string" && answer.field.startsWith(field + "."))) return true;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (sourcesOps(env.s, url, fields)[op]());
};

test("R21 sources declares sourcedisclose: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sourcedisclose", declaration: DECLARED_OPS["sourcedisclose"], call: mk("sourcedisclose", {"by":"bob"}, null, null, (fields, env) => (filled(fields, env))),
    refusedNaming: named({"source":["NO_SUCH_SOURCE"],"evidence":["NO_EVIDENCE"]}, true), values: {"how":"self","knownTo":"group","evidence":"told to bob in person"}, same: sameCode });
});

test("R21 sources declares sourcelink: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sourcelink", declaration: DECLARED_OPS["sourcelink"], call: mk("sourcelink", {"by":"bob"}, null, null, (fields, env) => (filled(fields, env))),
    refusedNaming: named({"source":["NO_SUCH_SOURCE"],"to":["NO_SUCH_SOURCE"],"evidence":["NO_EVIDENCE"]}, true), values: {"evidence":"the two knocks came from one hand"}, same: sameCode });
});

test("R21 sources declares sourceconsent: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sourceconsent", declaration: DECLARED_OPS["sourceconsent"], call: mk("sourceconsent", {"by":"bob"}, null, null, (fields, env) => (filled(fields, env))),
    refusedNaming: named({"source":["NO_SUCH_SOURCE"],"entry":["CONSENT_NOT_STANDING"],"evidence":["NO_EVIDENCE"]}, true), values: {"audience":"group","evidence":"the source agreed in person"}, same: sameCode });
});

test("R21 sources declares sourceconsentwithdraw: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "sourceconsentwithdraw", declaration: DECLARED_OPS["sourceconsentwithdraw"], call: mk("sourceconsentwithdraw", {"by":"bob"}, null, null, (fields, env) => (filled(fields, env))),
    refusedNaming: named({"source":["NO_SUCH_SOURCE"],"entry":["CONSENT_NOT_STANDING"]}, true), values: {"audience":"group"}, same: sameCode });
});

/* a source with a knocker secret, one disclosure of its name: the world a knockerconsent answers in (R11) */
const mkSecretWorld = async () => {
  const w = seeded();
  const a = await w.pulled({ secret: SECRET });
  const d = w.disclose(a.sourceId);
  if (!d.ok) throw new Error("fixture disclosure refused: " + JSON.stringify(d));
  w.tick();
  return Object.assign(w, { srcA: a.sourceId, entry: d.entry });
};
/* the knocker's door: the connecting address is the stamp (`source`), the body carries the fields */
const knockerDoor = (w, body) => sourcesOps(w.s, new URL("http://x/?op=knockerconsent&source=198.51.100.7"), body).knockerconsent();

test("R22 sources declares knockerconsent: no field is required, so no call names one, and a field outside accepts is dropped or refused naming it", async () => {
  await declaredOpHolds({ op: "knockerconsent", declaration: DECLARED_OPS["knockerconsent"], call: mk("knockerconsent", {"source":"198.51.100.7"}, mkSecretWorld),
    refusedNaming: named({}, true), values: {"knockerSecret": SECRET, "entry": "entry-1", "audience": "public", "withdraw": false},
    outside: ["source", "by"], same: sameCode });
});

test("R22 sources: through the door a knockerconsent with its accepted fields records the consent, and each omitted field answers the one refusal, naming no field", async () => {
  const good = { knockerSecret: SECRET, audience: "public" };
  const w = await mkSecretWorld();
  const ok = await knockerDoor(w, { ...good, entry: w.entry });
  assert.equal(ok.ok, true, "the full call records the consent");
  for (const omit of ["knockerSecret", "entry", "audience"]) {
    const f = await mkSecretWorld();
    const body = { ...good, entry: f.entry };
    delete body[omit];
    const r = await knockerDoor(f, body);
    assert.deepEqual(r, SECRET_NOT_RECOGNISED_ANSWER, `without ${omit}: the same refusal as a wrong secret, naming no field`);
  }
});

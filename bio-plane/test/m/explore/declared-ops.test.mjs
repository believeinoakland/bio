/* explore R27 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, exploreOps } from "../../../src/explore/ops.mjs";
import { exploreOf } from "../../../src/explore/index.mjs";
import { AT, ent, conn, world, byOwner } from "./fixtures/owners.mjs";
const sameCode = (x, y) => JSON.stringify(x) === JSON.stringify(y) || (x && y && (x.refused ?? x.code ?? x.reason) === (y.refused ?? y.code ?? y.reason) && x.ok === y.ok);
/* the walk over a registry holding one connection */
const mkEnv = async () => { const w = world(byOwner([conn("line:part_of", ent(1), ent(2), { id: "org" })])); return exploreOf(null, { registry: w.registry }); };

/* a refusal names a field by its code (the table; an entry {code, end} also needs the answer to carry that end, and {code, whyHas} its why to hold those words; a refusal may be answered as refused) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  const hit = (c) => (typeof c === "string" ? answer.code === c || answer.reason === c || answer.error === c || answer.refused === c
    : (answer.code === c.code || answer.reason === c.code || answer.refused === c.code)
      && Object.entries(c).every(([k, v]) => k === "code" || (k === "whyHas" ? String(answer.why ?? answer.detail ?? "").includes(v) : answer[k] === v)));
  if ((codes[field] || []).some(hit)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkEnv());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (exploreOps(env, url, fields)[op]());
};

test("R27 explore declares explore: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "explore", declaration: DECLARED_OPS["explore"], call: mk("explore", {"viewer":"alice"}),
    refusedNaming: named({"from":[{"code":"NO_NODE","whyHas":"no from is named"}],"at":["NO_DATE"]}, true), values: { from: ent(1), at: AT }, same: sameCode });
});

test("R27 explore declares explorepreset: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "explorepreset", declaration: DECLARED_OPS["explorepreset"], call: mk("explorepreset", {"viewer":"alice"}),
    refusedNaming: named({"preset":["UNKNOWN_PRESET"]}, true), values: {"preset":"chain"}, same: sameCode });
});

/* R28 (T51; K4206): `exploreverify` takes a chain or one derivation's ends. Its requires are the ends (`from` and `to`) or a chain: a derivation
   missing its kind, date, method or id is answered `matches: false` with the reason (R12), so those four are not required. */
test("R28 explore declares exploreverify: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "exploreverify", declaration: DECLARED_OPS["exploreverify"], call: mk("exploreverify", {"viewer":"alice"}),
    refusedNaming: named({"from":[{"code":"NO_NODE","whyHas":"no from is named"}],"to":[{"code":"NO_NODE","whyHas":"no to is named"}]}, true), values: { from: ent(1), to: ent(2) }, same: sameCode });
});

test("R28 exploreverify answers a chain alone, as the screen sends it: no refusal naming a declared field, and the chain's hops answered", async () => {
  const env = await mkEnv();
  const url = new URL("http://x/?op=exploreverify&viewer=alice");
  const answer = await exploreOps(env, url, { chain: [{ id: "org", kind: "line:part_of", owner: "lines" }] }).exploreverify();
  assert.equal(answer.refused, undefined);
  assert.equal(answer.matches, true);
});

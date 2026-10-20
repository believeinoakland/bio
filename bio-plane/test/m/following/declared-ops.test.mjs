/* following R36 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, followingOps } from "../../../src/following/index.mjs";
import { world } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);

/* a world holding one document outside every project, which every member sees, and alice (MEMBER) among the members */
const OPEN = "INFO-2026-0003-a";
const mkItem = async () => { const w = world(); w.bundle(OPEN); return w; };

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (world());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (followingOps(env.f, url, fields)[op]());
};

test("R36 following declares followregister: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "followregister", declaration: DECLARED_OPS["followregister"], call: mk("followregister", {"by":"member:alice","viewer":"member:alice"}),
    refusedNaming: named({"address":["NO_LOCATOR"]}, true), values: {"address":"https://registry.ellery.example/permits"}, same: sameCode });
});

test("R36 following declares watchitem: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "watchitem", declaration: DECLARED_OPS["watchitem"], call: mk("watchitem", {"by":"member:alice","viewer":"member:alice"}, async () => (mkItem()), null),
    refusedNaming: named({"item":["MARK_NO_ITEM"]}, true), values: {"item":"INFO-2026-0003-a"}, same: sameCode });
});

test("R36 following declares secondlook: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "secondlook", declaration: DECLARED_OPS["secondlook"], call: mk("secondlook", {"by":"member:alice","viewer":"member:alice"}, async () => (mkItem()), null),
    refusedNaming: named({"item":["MARK_NO_ITEM"],"note":["SECOND_LOOK_NO_NOTE"]}, true), values: {"item":"INFO-2026-0003-a","note":"look again"}, same: sameCode });
});

test("R36 following declares secondlookclear: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "secondlookclear", declaration: DECLARED_OPS["secondlookclear"], call: mk("secondlookclear", {"by":"member:alice","viewer":"member:alice"}, async () => (mkItem()), null),
    refusedNaming: named({"item":["MARK_NO_ITEM"],"flag":["MARK_NO_ITEM"]}, true), values: {"item":"INFO-2026-0003-a"}, same: sameCode });
});

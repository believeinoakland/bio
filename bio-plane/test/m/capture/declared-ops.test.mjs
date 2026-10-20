/* capture R97 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, captureOps } from "../../../src/capture/index.mjs";
import { fresh, bucket } from "./fixture.mjs";


/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } }));
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (captureOps(env.c, url, fields, env.c.env)[op]());
};

test("R97 capture declares gradenote: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "gradenote", declaration: DECLARED_OPS["gradenote"], call: mk("gradenote", {"viewer":"member:ann"}),
    refusedNaming: named({}) });
});

test("R97 capture declares archivelist: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "archivelist", declaration: DECLARED_OPS["archivelist"], call: mk("archivelist", {"viewer":"member:ann"}),
    refusedNaming: named({"archive":["BAD_SHA"],"archiveSha":["BAD_SHA"]}, true), values: {"archive":"abababababababababababababababababababababababababababababababab","archiveSha":"abababababababababababababababababababababababababababababababab"} });
});

test("R97 capture declares heldcaptures: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldcaptures", declaration: DECLARED_OPS["heldcaptures"], call: mk("heldcaptures", {"viewer":"member:ann"}),
    refusedNaming: named({}) });
});

test("R97 capture declares heldsetaside: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldsetaside", declaration: DECLARED_OPS["heldsetaside"], call: mk("heldsetaside", {"by":"member:ann","viewer":"member:ann"}),
    refusedNaming: named({"ids":["NO_IDS"],"reason":["SET_ASIDE_NO_REASON"]}, true), values: {"ids":["INFO-2026-0001"],"reason":"because"} });
});

test("R97 capture declares reattest: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "reattest", declaration: DECLARED_OPS["reattest"], call: mk("reattest", {"by":"member:ann"}),
    refusedNaming: named({"captureSha":["BAD_SHA"]}, true), values: {"captureSha":"abababababababababababababababababababababababababababababababab"} });
});

test("R97 capture declares heldrestore: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "heldrestore", declaration: DECLARED_OPS["heldrestore"], call: mk("heldrestore", {"by":"member:ann","viewer":"member:ann"}),
    refusedNaming: named({"ids":["NO_IDS"],"reason":["SET_ASIDE_NO_REASON"]}, true), values: {"ids":["INFO-2026-0001"],"reason":"because"} });
});

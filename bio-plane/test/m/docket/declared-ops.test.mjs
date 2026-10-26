/* docket R31 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, docketOps } from "../../../src/docket/index.mjs";
import { seeded, file, prepare, sign, CASE, SUBJECT } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* a group: the budget project with its case published, bob a joined participant and alice the manager; when asked, a response bob filed and alice prepared for the public docket */
const mkWorld = (prepared = false) => {
  const w = seeded();
  if (prepared) {
    const f = file(w);
    assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
    w.prep = prepare(w, { kind: "response", entry: f.entry, shelf: "listed" });
    assert.equal(w.prep.ok, true, JSON.stringify(w.prep).slice(0, 300));
  }
  return w;
};
const withCapture = (fields, env) => ({ ...fields, ...("capture" in fields ? { capture: env.cap.sha } : {}) });
const withPrepared = (fields, env) => ({ ...fields, ...("digest" in fields ? { digest: env.prep.digest } : {}), ...("signature" in fields ? { signature: sign(env.prep) } : {}) });

/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes, strict = false) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c || answer.reason === c || answer.error === c)) return true;
  return !strict && new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
/* the call as the door runs it: the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner */
const mk = (op, stamps = {}, setup = null, invoke = null, adapt = null) => async (given) => {
  const env = setup ? await setup() : await (mkWorld());
  const fields = adapt ? adapt(given, env) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return invoke ? await invoke(url, fields, env, op) : await (docketOps(env.docket, url, fields)[op]());
};

test("R31 docket declares docketfile: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "docketfile", declaration: DECLARED_OPS["docketfile"], call: mk("docketfile", {"author":"member:bob","viewer":"member:bob"}, null, null, (fields, env) => (withCapture(fields, env))),
    refusedNaming: named({"case":["NO_SUCH_CASE"],"edition":["DOCKET_NO_EDITION"],"from":["DOCKET_NOT_ATTRIBUTED"],"capture":["DOCKET_NO_CAPTURE"],"kind":["DOCKET_KIND_UNKNOWN"],"proposed":["DOCKET_NO_REASON"],"reason":["DOCKET_NO_REASON"],"takesBack":["NO_SUCH_DOCKET_ENTRY"]}, true), values: { case: CASE, edition: 1, kind: "response", from: { kind: "subject", entity: SUBJECT }, proposed: "both", reason: "The subject's reply to edition 1." }, same: sameCode });
});

test("R31 docket declares docketpost: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "docketpost", declaration: DECLARED_OPS["docketpost"], call: mk("docketpost", {"by":"member:alice","viewer":"member:alice"}, async () => (mkWorld(true)), null, (fields, env) => (withPrepared(fields, env))),
    refusedNaming: named({"digest":["DOCKET_STALE"],"signature":["DOCKET_SIGNATURE_REFUSED"],"acknowledged":["DOCKET_WARNING_NOT_ACKNOWLEDGED"]}, true), values: {"acknowledged":true}, same: sameCode });
});

/* K4557, K4208: the census ops this module owns that were not yet declared: the mark (a joined member's act) and the preparing of a
   public entry. The mark's world holds a record entry bob filed; the preparing's holds a second edition, so the `edition` kind
   (no reason, summary or candidate of its own) is the call that is accepted on its requires alone. */
test("R31 docket declares docketpressure: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const setup = async () => { const w = mkWorld(); w.entryId = file(w).entry; return w; };
  await declaredOpHolds({ op: "docketpressure", declaration: DECLARED_OPS["docketpressure"],
    call: mk("docketpressure", { author: "member:bob", viewer: "member:bob" }, setup, null, (fields, env) => ({ ...fields, ...("entry" in fields ? { entry: env.entryId } : {}) })),
    refusedNaming: named({ entry: ["NO_SUCH_DOCKET_ENTRY"], pressure: ["DOCKET_PRESSURE_REFUSED"] }, true), values: { pressure: { kind: "legal" } }, same: sameCode });
});

test("R31 docket declares docketprepare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const setup = async () => { const w = mkWorld(); w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }]); return w; };
  await declaredOpHolds({ op: "docketprepare", declaration: DECLARED_OPS["docketprepare"],
    call: mk("docketprepare", { by: "member:alice", viewer: "member:alice" }, setup),
    refusedNaming: named({ case: ["NO_SUCH_CASE"], kind: ["DOCKET_KIND_UNKNOWN"], edition: ["DOCKET_NO_EDITION"], entry: ["NO_SUCH_DOCKET_ENTRY"] }, true),
    values: { case: CASE, kind: "edition", shelf: "listed", edition: 2 }, same: sameCode });
});

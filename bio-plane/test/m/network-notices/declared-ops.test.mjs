/* network-notices R31 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, networkNoticesOps } from "../../../src/network-notices/index.mjs";
import { seeded, prepare, sign, V, BASE } from "./fixture.mjs";
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the group's common world, with the project and, for a post, alice's prepared and signed notice */
const mkWorld = async (prepared = false) => { const w = seeded(); if (prepared) w.prep = await prepare(w); return w; };
const withProject = (fields, env) => ("project" in fields ? { ...fields, project: env.P } : fields);
const withPrepared = (fields, env) => ({ ...fields, ...("digest" in fields ? { digest: env.prep.digest } : {}), ...("signature" in fields ? { signature: sign(env.prep) } : {}) });

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
  return invoke ? await invoke(url, fields, env, op) : await (networkNoticesOps(env.nn, url, fields)[op]());
};

test("R31 network-notices declares noticeprepare: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "noticeprepare", declaration: DECLARED_OPS["noticeprepare"], call: mk("noticeprepare", {"by":"member:alice","viewer":"member:alice"}, null, null, (fields, env) => (withProject(fields, env))),
    refusedNaming: named({"project":["REQUIRED_ARGUMENT_MISSING"],"wording":["NOTICE_WORDING_MALFORMED"],"since":["NOTICE_SINCE_MALFORMED"]}, true), values: { wording: BASE.wording, since: BASE.since }, same: sameCode });
});

test("R31 network-notices declares noticepost: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "noticepost", declaration: DECLARED_OPS["noticepost"], call: mk("noticepost", {"by":"member:alice","viewer":"member:alice"}, async () => (mkWorld(true)), null, (fields, env) => (withPrepared(fields, env))),
    refusedNaming: named({"digest":["NOTICE_STALE"],"signature":["NOTICE_SIGNATURE_REFUSED"],"acknowledged":["NOTICE_WARNING_NOT_ACKNOWLEDGED"]}, true), values: {"acknowledged":true}, same: sameCode });
});

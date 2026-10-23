/* file-safety R48 (T51; K4168, K4202): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused naming
   it, and a field outside accepts is dropped or refused naming it. The door is `fileSafetyOps`, called as the control plane calls it:
   the stamps and every field in the address, the fields as the body, the arm asked of a fresh owner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, fileSafetyOps } from "../../../src/file-safety/index.mjs";
import { filedWorld as world, pdf, sha } from "./fixture.mjs";

const HELD = sha(pdf(false, "declared"));
const FOUND = { clamav: () => ({ result: "found", findings: ["Pdf.Trojan.Declared-1"] }) };

/* a refusal names a field by its code where the arm's detail does not say the field (a code per field), else as the default does:
   the field as a whole word of its code or detail */
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
const named = (codes = {}) => (answer, field) => {
  if (!answer || typeof answer !== "object") return false;
  if ((codes[field] || []).some((c) => answer.code === c)) return true;
  return new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" "));
};
const sameAnswer = (x, y) => JSON.stringify(Object.fromEntries(Object.entries(x ?? {}).filter(([k]) => k !== "check_id")))
  === JSON.stringify(Object.fromEntries(Object.entries(y ?? {}).filter(([k]) => k !== "check_id")));

/* the call as the door runs it */
const mk = (op, stamps, setup, adapt = null) => async (given) => {
  const w = await setup();
  const fields = adapt ? adapt(given, w) : given;
  const q = new URLSearchParams({ op, ...stamps, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])) });
  const url = new URL("http://x/?" + q);
  return await fileSafetyOps(w.fs, url, fields, w.env)[op]();
};
const withFile = (scan = {}, tool = null) => async () => {
  const w = world({ scan });
  if (tool) await w.tool(tool);
  assert.equal(await w.capture(pdf(false, "declared")), HELD);
  return w;
};
const FILE = { capture: HELD, captureSha: HELD };
const MEMBER = { viewer: "member:m1" };

test("R48 file-safety declares deepercheck: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "deepercheck", declaration: DECLARED_OPS.deepercheck, call: mk("deepercheck", MEMBER, withFile({}, "joe-sandbox")),
    refusedNaming: named(), values: FILE, same: sameAnswer });
});

test("R48 file-safety declares openoriginal: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "openoriginal", declaration: DECLARED_OPS.openoriginal, call: mk("openoriginal", MEMBER, withFile()),
    refusedNaming: named(), values: FILE });
});

test("R48 file-safety declares openwithwarning: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "openwithwarning", declaration: DECLARED_OPS.openwithwarning, call: mk("openwithwarning", MEMBER, withFile()),
    refusedNaming: named(), values: FILE });
});

test("R48 file-safety declares releasescanhold: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  const held = async () => { const w = await withFile(FOUND)(); await w.fs.scanBatch({}); return w; };
  await declaredOpHolds({ op: "releasescanhold", declaration: DECLARED_OPS.releasescanhold, call: mk("releasescanhold", { by: "member:m1" }, held),
    refusedNaming: named(), values: { ...FILE, reason: "checked by hand" } });
});

test("R48 file-safety declares safeview: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "safeview", declaration: DECLARED_OPS.safeview, call: mk("safeview", MEMBER, withFile()),
    refusedNaming: named(), values: FILE });
});

test("R48 file-safety declares securitytooladd: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  /* the service this adds names credentials and no config; the call supplies the credentials it names (an accepted, optional field) and
     the digest the catalogue shows for the service given */
  const adapt = (fields, w) => {
    const entry = fields.providerId ? w.fs.securityToolCatalogue({ viewer: "member:boss" }).offered.find((d) => d.provider_id === fields.providerId) : null;
    return { ...fields, ...("handlingDigest" in fields && entry ? { handlingDigest: entry.handling_digest } : {}), credentials: { api_key: "secret-api_key" } };
  };
  await declaredOpHolds({ op: "securitytooladd", declaration: DECLARED_OPS.securitytooladd, call: mk("securitytooladd", { by: "boss" }, async () => world(), adapt),
    refusedNaming: named({ providerId: ["PROVIDER_UNKNOWN"], handlingDigest: ["HANDLING_NOT_SHOWN"] }), values: { providerId: "joe-sandbox" } });
});

for (const op of ["securitytoolremove", "securitytooltest"]) {
  test(`R48 file-safety declares ${op}: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused`, async () => {
    const withTool = async () => { const w = world(); await w.tool("joe-sandbox"); return w; };
    await declaredOpHolds({ op, declaration: DECLARED_OPS[op], call: mk(op, { by: "boss" }, withTool),
      refusedNaming: named({ toolId: ["NO_SUCH_TOOL"], tool: ["NO_SUCH_TOOL"] }), values: { toolId: "joe-sandbox-1", tool: "joe-sandbox-1" } });
  });
}

test("R48 file-safety declares scanmirror (R49): it requires nothing, is an administrator's act, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "scanmirror", declaration: DECLARED_OPS.scanmirror, call: mk("scanmirror", { viewer: "member:boss" }, async () => world()),
    refusedNaming: named(), values: {} });
});

/* screens-intake T51 fix round 6, G43 through the door (K4649, K4651; R-SEAM): a member uploads a 1,048,576 B spreadsheet by `captureupload` and the screen's own
 * promotion files it. Over the REAL plane (Miniflare, real DO and R2), loaded from its file path as `t51-seam-e7.test.mjs` does. Red before the change:
 * `data/provenance.json` held the door's whole reading (20.36 MB) and promotion refused it `OVERSIZE_INLINE`. The follow is the plane's: red by name until G41's
 * providers (extraction's cell cap, `cells_held`) and control-plane's follow on `readingDropped` merge. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

await registerDeclared(fileURLToPath(new URL("../../../../", import.meta.url)), registerDeclaredOps);

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-g43-0123456789abcdef", PASSWORD = "the founder's long password, G43", ORIGIN = "https://group.example";
const INLINE_MAX = 1048576;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-g43-0123456789abcdef", PROBE_TOKEN: "prb-g43-0123456789abcdef", VERSION: "4.7.2", INSTANCE_NAME: "g43-town" },
});
after(() => mf.dispose());
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  const claimed = await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
/* the screen's calling kit over the real door; every promote request is noted */
const screenCall = (auth, promoted) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => {
    if (op === "promote") promoted.push(body);
    const u = new URLSearchParams({ op, ...query });
    return (await door(`/api/?${u}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
                                       ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json();
  } });
const upload = async (auth, bytes, name, type) => (await (await door(`/api/?op=captureupload&statement=g43&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
  { method: "POST", headers: auth, body: bytes })).json()).result;

/* exactly 1,048,576 B: a header and rows of fixed width, the last row `LASTROWMARK` padded to the length */
function csv() {
  const rows = ["id,name,amount"];
  let n = 0;
  for (let i = 0; i < 30000; i++) { const r = `${i},row number ${i},${(i * 37) % 1000}`; if (n + r.length + 14 + 20 >= INLINE_MAX) break; rows.push(r); n += r.length + 1; }
  const head = rows.join("\n") + "\n";
  const last = "LASTROWMARK";
  const pad = INLINE_MAX - Buffer.byteLength(head) - last.length - 1;
  return Buffer.from(head + "x".repeat(Math.max(0, pad)) + "," + last);
}

/* one upload and one promotion for both tests (the same bytes uploaded twice answer `existed`, with no document) */
let filing;
const filed = () => filing ||= (async () => {
  const auth = await founder(), promoted = [];
  const cs = screenCall(auth, promoted);
  const bytes = csv();
  const up = await upload(auth, bytes, "big.csv", "text/csv");
  const made = up && up.document ? await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: "big.csv", locator: up.document.locator, project: "" }) : null;
  return { auth, promoted, bytes, up, made, sha: createHash("sha256").update(bytes).digest("hex") };
})();

test("R61 (G43, the real plane) a 1,048,576 B spreadsheet uploaded and filed by the screen's promotion is a bundle whose provenance file is under INLINE_MAX, readingDropped", async () => {
  const { promoted, bytes, up, made, sha } = await filed();
  assert.equal(bytes.length, INLINE_MAX);
  assert.ok(up && up.document, JSON.stringify(up).slice(0, 300));
  assert.equal(made.refused, undefined, "promotion is not refused: " + JSON.stringify(made).slice(0, 300));
  assert.ok(made.bundleId, "a bundle");
  assert.equal(made.readingDropped, true, "the door's reading did not fit, so it was dropped from the bundle");
  const prov = promoted[0].files.find((f) => f.path === "data/provenance.json");
  assert.ok(prov.bytes < INLINE_MAX, `data/provenance.json is ${prov.bytes} B`);
  const doc = JSON.parse(prov.text).documents[0];
  for (const k of ["reading", "text_units", "text_units_over_bound", "text_units_skipped"]) assert.ok(!(k in doc), `${k} is not embedded`);
  assert.equal(doc.capture.sha256, sha);
});

test("R61 (G43, the real plane; red by name until G41's providers and control-plane's follow on readingDropped merge) after the follow, op=reading finds the last row and cells_held", async () => {
  const { auth, made, sha } = await filed();
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  /* the follow: readheld asks for the reading the bundle was filed without, as the owed render and `followEntries` do */
  await (await door(`/api/?op=readheld&sha256=${sha}`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: "{}" })).json();
  let r = null;
  for (let i = 0; i < 20; i++) {
    r = (await (await door(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
    if (r && r.found) break;
    await new Promise((x) => setTimeout(x, 500));
  }
  assert.ok(r && r.found, "the reading is held after the follow: " + JSON.stringify(r).slice(0, 200));
  assert.ok(JSON.stringify(r).includes("LASTROWMARK"), "the last row is found");
  assert.ok(JSON.stringify(r).includes("cells_held"), "cells_held is set (G41)");
});

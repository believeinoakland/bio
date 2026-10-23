/* capture, T51 fix round 7, G75 and G73 (R96, R101, R77; the walker's A.md:15, :31 and B.md:34): THE WALKER'S CASES THROUGH THE REAL PLANE. The Worker the product
   deploys under Miniflare, real Durable Object SQLite and R2; each case is a member's own act (an acquire, an upload, the filing the Add screen makes with its own
   `promoteDocument`), never a hand-written answer shape.
   G75  a document delivered with a name is named when the record is asked about it: `heldat` answers the compared copy's `title` (what the screen draws as
        "Already in the record as ..."), and `heldcaptures` answers the same title;
   G73  a multipart upload filed in a project and then filed as seen in another (`captureseenin`) is listed by `heldcaptures` for the other project, with
        `also_here` naming its home, and keeps its home. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r7plane-0123456789abcdef", PASSWORD = "the founder's long password, round seven", ORIGIN = "https://group.example";
const MiB = 1024 * 1024;
const te = (t) => new TextEncoder().encode(t);
const pdf = te("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n" + "x".repeat(3000));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r7plane-0123456789abcdef", PROBE_TOKEN: "prb-r7plane-0123456789abcdef", VERSION: "4.7.7",
              INSTANCE_NAME: "r7plane-town", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: () => new Response(pdf, { headers: { "content-type": "application/pdf", "content-length": String(pdf.length) } }),
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
const unwrap = (j) => (j && typeof j === "object" && "result" in j ? j.result : j);

let authOnce = null;
async function founder() {
  if (authOnce) return authOnce;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return (authOnce = { authorization: `Bearer ${signed.result.token}` });
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const get = async (auth, query) => unwrap(await (await plane(`/api/?${new URLSearchParams(query)}`, { headers: auth })).json());
async function projectOf(auth, title) {
  const cs = screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the round seven test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made).slice(0, 300));
  return id;
}

test("R96 R77 (G75): a document delivered with a name is named by `heldat` (the compared copy's title) and by `heldcaptures`, by address and by digest", async () => {
  const auth = await founder();
  const address = "https://www.govinfo.gov/content/pkg/r7/BUDGET-2022-APP.pdf";
  const acq = unwrap(await (await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ locator: address }) })).json());
  assert.equal(acq.ok, true, JSON.stringify(acq).slice(0, 300));
  const doc = acq.document;
  const title = CAPTURE_SCREEN.parts.titleOf({ ...screenCall(auth), w: (k) => k, date: (d) => d }, { reading: acq.reading, doc, address: doc.locator });
  assert.ok(title && title.length > 0);
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc, title, locator: doc.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const listed = (await get(auth, { op: "heldcaptures", bundle_id: made.bundleId })).held[0];
  assert.equal(listed.title, title, "the held list names the document by the name it was delivered with");
  for (const how of [{ address }, { sha256: doc.capture.sha256 }]) {
    const at = await get(auth, { op: "heldat", ...how });
    assert.equal(at.held, true);
    assert.equal(at.copy.document, made.bundleId);
    assert.equal(at.copy.title, title, `heldat by ${Object.keys(how)[0]} answers the copy's title`);
  }
});

test("R101 R77 (G73): a file held in three parts, filed in one project and then filed as seen in another, is listed for the other project with `also_here` naming its home; it keeps its home", async () => {
  const auth = await founder();
  const home = await projectOf(auth, "Walk R7 home");
  const other = await projectOf(auth, "Walk R7 other");
  const bytes = new Uint8Array(17 * MiB);
  for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 7 + (i >> 11)) & 255;
  const sent = unwrap(await (await plane("/api/?op=captureupload&statement=" + encodeURIComponent("a scan from the counter") + "&name=scan.bin&type=application%2Foctet-stream", { method: "POST", headers: auth, body: bytes })).json());
  assert.equal(sent.ok, true, JSON.stringify(sent).slice(0, 300));
  assert.equal(sent.document.parts.length, 3);
  const whole = sent.document.capture.sha256;
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc: sent.document, title: "scan.bin", locator: sent.document.locator, project: home });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const before = await get(auth, { op: "heldcaptures", project: other });
  assert.deepEqual(before.held.map((r) => r.bundle_id), [], "not in the other project's list before it is filed there");
  const filed = unwrap(await (await plane("/api/?op=captureseenin", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ captureSha: whole, project: other }) })).json());
  assert.deepEqual([filed.ok, filed.recorded, filed.home], [true, true, home], JSON.stringify(filed).slice(0, 300));
  const after_ = await get(auth, { op: "heldcaptures", project: other });
  const row = after_.held.find((r) => r.bundle_id === made.bundleId);
  assert.ok(row, "listed under the project it was filed in as seen");
  assert.deepEqual(row.also_here, { home }, "and names its home");
  assert.equal(row.project, home, "the document keeps its home");
  const inHome = await get(auth, { op: "heldcaptures", project: home });
  assert.ok(inHome.held.some((r) => r.bundle_id === made.bundleId && !("also_here" in r)), "and is still listed in its home with no `also_here`");
});

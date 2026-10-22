/* screens-investigate's seam tests: the real merged plane (Miniflare over `src/plane/index.mjs`, the Worker the product deploys), a founder signed in
   through its own `login`, and this module's screens booted on interface-shell's document stand-in with every request answered by that plane.
   Nothing is scripted: a member's inputs are made by her own acts through the real ops (`captureupload`, `allocid`, `promote`, `createset`).
   (The plane does not start under workerd until OP-GRADES #24 merges, `DECLARED_OP_DISAGREES: officeconfirm`: a test using this file is red by
   that name until then, K4462.) */
import "../../sandbox.mjs";
import { after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { boot } from "../interface-shell/harness.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { SCREENS } from "./fixtures.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ORIGIN = "https://group.example";
export const hex = (b) => createHash("sha256").update(b).digest("hex");
const result = (a) => (a && a.result !== undefined ? a.result : a);
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

export function realPlane(tag) {
  const ADM = `adm-${tag}-0123456789abcdef`, PASSWORD = `the founder's long password, ${tag}`;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: `mem-${tag}-0123456789abcdef`, PROBE_TOKEN: `prb-${tag}-0123456789abcdef`, VERSION: "4.7.2", INSTANCE_NAME: `${tag}-town` },
  });
  after(() => mf.dispose());
  const fetchPlane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
  const me = { session: null, auth: null };

  /** The founder claims the instance and signs in (once). */
  async function founder() {
    if (me.session) return me;
    const claimed = await fetchPlane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
    await claimed.arrayBuffer();
    const signed = await (await fetchPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
    assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
    me.session = { t: signed.result.token, e: signed.result.expires, d: signed.result.device };
    me.auth = { authorization: `Bearer ${me.session.t}` };
    return me;
  }
  /** An op as the founder sends it; the answer's `result`. */
  const call = async (op, { query = {}, body } = {}) => result(await (await fetchPlane(`/api/?${new URLSearchParams({ op, ...query })}`, {
    method: body === undefined ? "GET" : "POST", headers: { ...me.auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json());

  /** Every op the door declares, answered by the real plane, in the shape the page's document stand-in takes. */
  const real = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
    const u = new URL(req.url, ORIGIN);
    let body = req.init && req.init.body;
    if (body instanceof Blob) body = new Uint8Array(await body.arrayBuffer());
    const res = await fetchPlane(u.href, { method: (req.init && req.init.method) || "GET", headers: (req.init && req.init.headers) || {}, ...(body === undefined ? {} : { body }) });
    const type = res.headers.get("content-type") || "";
    return /json/.test(type) ? { status: res.status, json: await res.json() } : { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
  }]));

  /** A file the member holds: uploaded (`captureupload`, her own act) and promoted as the capture screen promotes it (an information bundle at `collected`),
   *  filed under `project` when given. Answers `{sha, bundle}`. */
  async function hold(name, text, project = "") {
    const bytes = new TextEncoder().encode(text);
    const up = await (await fetchPlane(`/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`, { method: "POST", headers: { ...me.auth, "content-type": "text/plain" }, body: bytes })).json();
    const doc = result(up).document;
    assert.ok(doc && doc.capture, JSON.stringify(up).slice(0, 400));
    const now = stamp();
    const minted = await call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
    const id = minted.id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sha = doc.capture.sha256;
    const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
      "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
      "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
      "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
      ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
    const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
    const len = (s) => Buffer.byteLength(s);
    const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
      { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
    const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
    const made = await call("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8), meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
    assert.notEqual(made.ok, false, JSON.stringify(made).slice(0, 400));
    return { sha, bundle: made.bundleId || id };
  }
  /** A project, started as Home's "Start a project" starts it (`promote` of its document). */
  async function project(title) {
    const now = stamp();
    const text = "---\nobject_type: project\ntitle: " + JSON.stringify(title) + "\nobjective: " + JSON.stringify(title) + "\ncurrent_state: forming\ncreated: \"" + now + "\"\nlast_updated: \"" + now + "\"\n---\n\n## Session Log\n\n### Session " + now + " | Formation | interactive\nTrigger: test\nChanges: created.\n";
    const made = await call("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8), meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
    assert.notEqual(made.ok, false, JSON.stringify(made).slice(0, 400));
    return made.bundleId;
  }
  /** A money trail for the project (`createset`, as "Start a money trail" sends it). */
  async function trail(projectId, label = "Stormwater trail") {
    const made = await call("createset", { body: { purpose: "trail", label, concerns: projectId } });
    assert.equal(made.ok, true, JSON.stringify(made).slice(0, 300));
    return made.set_id;
  }
  /** The profiles the team's administrator makes active (`profilesset`, her own act). */
  async function profiles(ids) {
    const made = await call("profilesset", { body: { profiles: ids } });
    assert.notEqual(made.ok, false, JSON.stringify(made).slice(0, 300));
    return made;
  }
  /** This module's screens at `path`, booted over the real plane, until every read has answered. `over[op]` replaces one op's answer with a function of the
   *  request and the real answer (a record the live copy holds that this build does not make, kept as a fixture); every other op is the plane's. */
  async function open(path, over = {}) {
    const table = { ...real };
    for (const [op, fn] of Object.entries(over)) table[op] = async (req) => fn(req, await real[op](req));
    const p = await boot({ screens: SCREENS, session: me.session, path, plane: table });
    await settled(p);
    return p;
  }
  async function settled(p) {
    const main = p.doc.getElementById("cs-main");
    let last = -1, stable = 0;
    for (let i = 0; i < 1500 && stable < 15; i++) {
      await p.settle(20); await new Promise((r) => setTimeout(r, 20));
      const busy = main.querySelectorAll('[data-state="loading"]').length > 0;
      stable = !busy && p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
    }
  }
  return { founder, call, hold, project, trail, profiles, open, settled, fetchPlane, me };
}

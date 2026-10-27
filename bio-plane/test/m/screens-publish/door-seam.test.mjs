/* screens-publish, T51 fix round 6 (G12c; R-SEAM): THE CEREMONY THROUGH THE REAL DOOR. The Worker the product deploys, its object and review under Miniflare; the
 * member's own acts make the project and its drafts (`casedraft`), and the page's reads (`casedrafts`, `reviewcopy` single and batch) go through the door to the real
 * review, not a scripted answer. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { open, until } from "./fixtures.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r6door-0123456789abcdef", PASSWORD = "the founder's long password, round six", ORIGIN = "https://group.example";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r6door-0123456789abcdef", PROBE_TOKEN: "prb-r6door-0123456789abcdef", VERSION: "4.7.6", INSTANCE_NAME: "r6door-town" },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
let auth = null;
async function founder() {
  if (auth) return auth;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return (auth = { authorization: `Bearer ${signed.result.token}` });
}
const call = async (op, { query = {}, body } = {}) => {
  const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST", headers: { ...(await founder()), "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: res.status, json: await res.json() };
};
async function projectOf(title) {
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the founder opened it\n` }] } });
  const id = (made.json.result && made.json.result.bundleId) || made.json.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made.json).slice(0, 300));
  return id;
}

test("R73 C49 G12c (fix round 6, door seam) the ceremony of a project with four drafts asks the real door for the other three copies in one `reviewcopy` with `drafts`, and each draft is named by its own scope", async () => {
  const P = await projectOf("Door seam project");
  const ids = [];
  for (const scope of ["First scope", "Second scope", "Third scope", "Fourth scope"]) {
    const d = await call("casedraft", { body: { project: P, scope } });
    assert.equal(d.json.ok, true, JSON.stringify(d.json).slice(0, 300));
    ids.push((d.json.result || d.json).draftId);
  }
  assert.ok(ids.every(Boolean));
  const through = (op) => async (req) => {
    const r = await call(op, { query: req.query || {}, ...(req.body === undefined ? {} : { body: req.body }) });
    return r;
  };
  const p = await open(`/app/ceremony/${P}/${ids[3]}`, { plane: { casedrafts: through("casedrafts"), reviewcopy: through("reviewcopy"), image: through("image") } });
  await until(p, () => p.byOp("reviewcopy").length >= 2 && p.doc.getElementById("drafts-ceremony"));
  const reads = p.byOp("reviewcopy");
  assert.equal(reads.length, 2, "the draft shown, and one batch for the other three");
  const batch = reads.filter((r) => r.query.drafts);
  assert.equal(batch.length, 1);
  assert.deepEqual(batch[0].query.drafts.split(",").sort(), ids.slice(0, 3).sort());
  const labels = p.doc.getElementById("drafts-ceremony").querySelectorAll("option").map((o) => o.textContent);
  for (const scope of ["First scope", "Second scope", "Third scope"]) assert.ok(labels.some((t) => t.includes(scope)), `${scope} named from the real copy`);
});

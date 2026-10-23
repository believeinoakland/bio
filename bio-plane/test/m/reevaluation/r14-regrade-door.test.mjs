/* reevaluation R41 (fix round 7, G89; amends R14), THE WALKER'S CASE THROUGH THE REAL PLANE: a member cites a paragraph of a page,
   captures the page again with its text changed, the object's own alarm runs the notice sweep, and the member's notice and the
   pull read of the same question agree: a notice does not keep saying "undetermined" once the record reads the copy. The Worker
   the product deploys, its object, its alarm and R2 under Miniflare, as `t51-round7-seam.test.mjs` runs them (this file copies
   that harness, not its file); every step is a member's own act through the door and ends at the record's own reads. R-CLOCK:
   no time is asserted from the object; the waits are the test's own. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { word } from "../../../src/setup-words/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const MB = 1024 * 1024;
const ADM = "adm-r7seam-0123456789abcdef", PASSWORD = "the founder's long password, round seven", ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);


/* the network: a file by its last path segment, served at once or throttled, with its Content-Length or without */
const upstream = new Map();
function serve(name, bytes, { rate = null, length = true, type = "application/pdf" } = {}) { upstream.set(name, { bytes, rate, length, type }); }
function slowBody(bytes, rate) {
  const chunk = 64 * 1024;
  let at = 0;
  return new ReadableStream({
    async pull(c) {
      if (at >= bytes.length) { c.close(); return; }
      const end = Math.min(at + chunk, bytes.length);
      c.enqueue(bytes.subarray(at, end));
      at = end;
      await later((chunk / rate) * 1000);
    },
  }, new CountQueuingStrategy({ highWaterMark: 0 }));
}
const OPTIONS = {
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r7seam-0123456789abcdef", PROBE_TOKEN: "prb-r7seam-0123456789abcdef", VERSION: "4.7.6",
              INSTANCE_NAME: "r7seam-town", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (req) => {
    const name = new URL(req.url).pathname.split("/").pop();
    const f = upstream.get(name);
    if (!f) return new Response("not scripted", { status: 404 });
    const headers = { "content-type": f.type, ...(f.length ? { "content-length": String(f.bytes.length) } : {}) };
    return new Response(f.rate ? slowBody(f.bytes, f.rate) : f.bytes, { headers });
  },
};
const mf = new Miniflare(OPTIONS);
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

let founderOnce = null;
async function founder() {
  if (founderOnce) return founderOnce;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return (founderOnce = { authorization: `Bearer ${signed.result.token}` });
}
/* a member made as the screens make one: the founder invites (`memberadd`), the person enrols with the invitation, then signs in */
const people = new Map();
async function person(handle, role = "member", capabilities = null) {
  if (people.has(handle)) return people.get(handle);
  const adm = await founder();
  /* making an administrator is "changing administrators", which asks for the password again (C-29.42): the founder
     gives it first, as the screens do (`reauth`) */
  if (role === "admin") {
    const ra = await (await plane("/api/?op=reauth", { method: "POST", headers: { ...adm, "content-type": "application/json" }, body: JSON.stringify({ password: PASSWORD }) })).json();
    assert.equal(ra.ok, true, "the founder's password again: " + JSON.stringify(ra).slice(0, 300));
  }
  const added = await (await plane("/api/?op=memberadd", { method: "POST", headers: { ...adm, "content-type": "application/json" },
    body: JSON.stringify({ memberId: handle, cover: `cover of ${handle}`, role, capabilities }) })).json();
  const invite = added.result && (added.result.invite || (added.result.invitation && added.result.invitation.invite));
  assert.ok(invite, "an invitation: " + JSON.stringify(added).slice(0, 400));
  const pw = `${handle}-long-passphrase-r7`;
  const enrolled = await (await plane("/api/?op=enroll", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invite, handle, password: pw }) })).json();
  assert.equal(enrolled.ok, true, "enrolled: " + JSON.stringify(enrolled).slice(0, 400));
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle, password: pw, device: "own" }) })).json();
  assert.equal(signed.ok, true, "signed in: " + JSON.stringify(signed).slice(0, 400));
  const auth = { authorization: `Bearer ${signed.result.token}` };
  people.set(handle, auth);
  return auth;
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const get = async (auth, query) => (await plane(`/api/?${new URLSearchParams(query)}`, { headers: auth })).json();
const post = async (auth, op, body, query = {}) => {
  const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};
async function until(fn, ms, every = 3000) {
  const end = Date.now() + ms;
  let v = await fn();
  while (Date.now() < end && !v) { await later(every); v = await fn(); }
  return v;
}
const WATCHDOG = ["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"];
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

async function projectOf(auth, title) {
  const cs = screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the seam test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made).slice(0, 300));
  return id;
}

const acquire = async (auth, body) => {
  const t = Date.now();
  const res = await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  return { ms: Date.now() - t, status: res.status, body: await res.json() };
};
const pageOf = (first) => te(`<html><head><title>Zoning notice</title></head><body><p>${first}</p><p>The commission also reviewed the harbor lease and the parking study for the east district.</p><p>Public comment closes at noon on the last day of the month.</p></body></html>`);
/* a question as the project screen's "ask" press writes it (allocid, promote of the inquiry, then drawquestion) */
async function askQuestion(auth, project, text) {
  const cs = screenCall(auth);
  const now = new Date().toISOString().split(".")[0] + "Z";
  const minted = (await cs.call("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).result;
  assert.ok(minted && minted.id, "an id: " + JSON.stringify(minted));
  const id = minted.id + "-" + text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-+$/, "");
  const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(text), "current_state: open", "prior_state: null",
    "created: " + now, "last_updated: " + now, "project: " + project, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human", "recheck_triggers:",
    "  - text: " + JSON.stringify(word("file.recheck.revisit")), "    description: " + JSON.stringify(word("file.recheck.none")), "---", ""];
  ["## Question", word("conformance.rests"), "## Conclusion", word("conformance.falsify"), "## Session Log", "## Review Notes"].forEach((h, i) => { lines.push(h, ""); if (i === 0) lines.push(text, ""); });
  const stamp = now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  const p = await cs.call("promote", { body: { bundleId: id, base: null, snapKey: stamp, meta: { object_type: "inquiry", title: text, current_state: "open", created: now, last_updated: now },
    files: [{ path: "bundle.md", text: lines.join("\n") }] } });
  assert.notEqual((p.result || p).ok, false, "the question is filed: " + JSON.stringify(p).slice(0, 400));
  const drew = await post(auth, "drawquestion", {}, { project, inquiry: id, note: "" });
  assert.notEqual((drew.body.result || drew.body).ok, false, "drawn into the project: " + JSON.stringify(drew.body).slice(0, 400));
  return id;
}
/* the Add screen's acquire press, then the filing step for a document that came in the answer: an information bundle at `collected`
   naming the capture in its register, as the screen's `promoteDocument` sends it (this file does not import the screen) */
async function captureAndFile(auth, address, project) {
  const r = await acquire(auth, { locator: address, project });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 400));
  assert.ok(r.body.document, `captured inside the request: ${JSON.stringify(r.body).slice(0, 400)}`);
  const doc = r.body.document, cs = screenCall(auth);
  const title = ((r.body.reading && r.body.reading.title) || doc.title || "Zoning notice").slice(0, 200);
  const now = new Date().toISOString().split(".")[0] + "Z";
  const mid = ((await cs.call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).result || {}).id;
  assert.ok(mid, "an id");
  const id = `${mid}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "")}`;
  const dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: address, sha256: doc.capture.sha256 }] });
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected",
    "prior_state: null", "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + sha(dataset), "project: " + project, "source:",
    "  locator: " + JSON.stringify(address), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false",
    "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  const file = (path, t) => ({ path, text: t, bytes: Buffer.byteLength(t), sha256: sha(t) });
  const made = await cs.call("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0"),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
    files: [file("bundle.md", text), file("data/provenance.json", prov), file("data/dataset.json", dataset),
            { path: doc.file, blobSha: doc.capture.sha256, sha256: doc.capture.sha256, bytes: doc.capture.bytes }],
    register: [{ sha256: doc.capture.sha256, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }] } });
  assert.notEqual((made.result || made).ok, false, JSON.stringify(made).slice(0, 400));
  return { r, made, digest: doc.capture.sha256 };
}

const rowsOfKind = (feed, kind) => { const rows = []; (function walk(v) { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") { if (v.kind === kind) rows.push(v); Object.values(v).forEach(walk); } })(feed); return rows; };

test("R41 R14 (G89): after a cited page is captured again with its paragraph changed, the member's notice (`op=reevaluationnotices`) says what the pull read (`op=versionnotice`) says of the same question once the record has read the copy, and stays one open notice", { timeout: 600000 }, async () => {
  const adm = await founder();
  const eve = await person("g89-eve");
  const project = await projectOf(adm, "G89 re-grade after the read");
  await post(adm, "projectinvite", {}, { projectId: project, handle: "g89-eve" });
  await post(eve, "projectjoin", {}, { projectId: project });
  const stamp = Date.now();
  const name = "page";
  const address = `https://www.example.gov/${name}?g89=1`;
  serve(name, pageOf(`The commission set the zoning hearing for the first Tuesday ${stamp}.`), { type: "text/html" });
  const one = await captureAndFile(eve, address, project);
  const question = await askQuestion(eve, project, `Did the commission set the zoning hearing ${stamp}`);
  const found = (await post(eve, "findin", { scope: { capture: one.digest }, kinds: ["term"], term: "zoning hearing" })).body.result || {};
  const items = ((found.kinds || []).find((k) => k && k.kind === "term") || {}).items || [];
  assert.ok(items.length > 0, "the find holds a passage to cite: " + JSON.stringify(found).slice(0, 400));
  const cited = await post(eve, "cite", { project: question, role: "supports", found: items[0] });
  assert.equal(cited.status, 200, JSON.stringify(cited.body).slice(0, 400));
  assert.notEqual((cited.body.result || cited.body).ok, false, JSON.stringify(cited.body).slice(0, 400));
  await later(2500); /* the chain orders captures by whole-second retrieved stamps */
  serve(name, pageOf(`The commission moved the zoning hearing to the second Wednesday ${stamp}.`), { type: "text/html" });
  const two = await captureAndFile(eve, address, project);
  assert.notEqual(two.digest, one.digest, "the second copy is another capture");
  /* the alarm raises the member's notice (the Queue holds its item) */
  const item = await until(async () => {
    const q = await plane("/api/?op=queue", { headers: eve });
    const text = await q.text();
    assert.equal(q.status, 200, text.slice(0, 300));
    let feed; try { feed = JSON.parse(text).result; } catch { return null; }
    return rowsOfKind(feed, "newer-capture-affects-reference").find((x) => JSON.stringify(x).includes(question)) || null;
  }, 240000, 5000);
  assert.ok(item, "the notice reached the owner's Queue");
  /* the notice and the pull read agree once the record has read the copy */
  let notice = null, pull = null;
  const agreed = await until(async () => {
    const n = ((await get(eve, { op: "reevaluationnotices", holder: question })).result || {}).notices || [];
    notice = n.find((x) => x.holder === question) || null;
    pull = (((await get(eve, { op: "versionnotice", target: question })).result || {}).notices || [])[0] || null;
    return notice && pull && pull.state !== "chain_unread" && pull.affects !== "undetermined" ? notice.affects === pull.affects : null;
  }, 240000, 5000);
  console.log("G89 notice:", JSON.stringify(notice).slice(0, 400), "pull:", JSON.stringify(pull).slice(0, 300));
  assert.ok(pull && pull.affects !== "undetermined", "the record has read the copy: " + JSON.stringify(pull).slice(0, 400));
  assert.ok(agreed, `the notice says what the pull read says (${pull && pull.affects}), not ${notice && notice.affects}`);
  const all = ((await get(eve, { op: "reevaluationnotices", holder: question, state: "all" })).result || {}).notices || [];
  assert.equal(all.length, 1, "one notice, never a second for the same copy");
  assert.equal(all[0].state, "open");
});

/* screens-inquiry fix round 10 (T51), the seam (R-SEAM) of cause 30a (G6; the walk's E1a: an own reading resting on two cited parts was refused VERSION_AFFIRMATION_INCOMPLETE; K5056; DEC-32
 * clauses 2 and 4; K4426; K4990): over the REAL plane, a project, two documents the member uploaded and filed, a question she opened by "Open a question", both documents cited by the Document
 * page's own "Cite this", the question page's own answers ("No, my answer falls" for both passages) saved by its own act, and her own reading concluded: the partition the screen sent is
 * stored by the real `inquiry.ground` and `conclude` with `reading` and no `affirmed` is accepted. Nothing is scripted; the page forwards every op to the real door. */
import "../../sandbox.mjs";
import "./fixtures.mjs"; /* registers every owner's declarations before anything reads an op (R81) */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, main, press, fill } from "./fixtures.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-r10seam-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r10seam-0123456789abcdef", PROBE_TOKEN: "prb-r10seam-0123456789abcdef", VERSION: "4.6.0", INSTANCE_NAME: "r10seam-town" },
});
after(() => mf.dispose());
const ORIGIN = "https://group.example";
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
async function founder() {
  await (await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await door(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const forwarded = (auth) => Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
  const r = await door(`/api/?${new URLSearchParams({ ...req.query, op })}`, { method: req.body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
    ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }) });
  return { status: r.status, json: await r.json().catch(() => null) };
}]));
const upload = async (auth, bytes, name, type) => (await (await door(`/api/?op=captureupload&statement=r10seam&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, { method: "POST", headers: auth, body: bytes })).json()).result;
const until = async (p, done, ms = 30000) => {
  const end = Date.now() + ms;
  for (;;) { await p.settle(20); if (done()) return true; if (Date.now() > end) return false; await new Promise((r) => setTimeout(r, 100)); }
};
const text = (el) => String(el && el.textContent || "");
const makeProject = async (cs, title) => {
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the seam test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made).slice(0, 300));
  return id;
};

test("R30a R23 R50 G6 (the real plane) two cited passages both answered 'No, my answer falls': the screen sends no ground, the plane stores it, and her own reading concludes with no affirmation", async () => {
  const auth = await founder();
  const cs = screenCall(auth);
  const project = await makeProject(cs, "Partition seam");
  /* two documents the member uploaded, filed under the project by the Add screen's own promotion */
  const docs = [];
  for (const [i, body] of ["The council minutes record that crews close each reported pothole within seven days of the report.",
    "The public works log states that the median repair time in the spring quarter was five days from the first report."].entries()) {
    const up = await upload(auth, Buffer.from(body), `source-${i}.txt`, "text/plain");
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: `Source ${i}`, locator: up.document.locator, project });
    assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 300));
    docs.push({ id: filed.bundleId, sha: up.capture.sha256 });
  }
  /* the question: "Open a question" on the project page */
  const home = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/project/" + project });
  await until(home, () => !!home.doc.getElementById("project-question"));
  fill(home, { "project-question": "Are reported potholes repaired within seven days?" });
  await press(home, "promote", { reason: "a question the seam asks" });
  assert.ok(await until(home, () => /^\/app\/question\//.test(home.location.pathname)), "the question is opened");
  const question = decodeURIComponent(home.location.pathname.split("/").pop());
  /* each document's passage cited into it by the Document page's own "Cite this" */
  for (const d of docs) {
    const page = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/document/" + d.id });
    assert.ok(await until(page, () => !!main(page).querySelector("[data-passage]") && !!page.doc.getElementById("document-cite-question")), "the passage is drawn");
    fill(page, { "document-cite-question": question });
    await page.settle();
    const cite = main(page).querySelector("[data-passage]").nextElementSibling;
    await press(page, "cite", { within: cite });
    assert.ok(await until(page, () => page.byOp("cite").length > 0), "cite is sent");
    assert.equal(/alert/.test(String(main(page).innerHTML).match(/role="alert"[^>]*>[^<]*/g)?.join("") || ""), false, "no refusal: " + (main(page).innerHTML.match(/role="alert"[^>]*>[^<]*/g) || []).join(" | "));
  }
  /* the question page: state b, both passages answered "No", saved */
  const q = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/question/" + question });
  assert.ok(await until(q, () => !!q.doc.getElementById("ask-0-0") && !!q.doc.getElementById("ask-1-0")), "each cited passage is asked what it carries");
  q.doc.getElementById("ask-0-0").checked = true;
  q.doc.getElementById("ask-1-0").checked = true;
  await press(q, "inquiryground", { reason: "each passage is needed" });
  const sent = q.byOp("inquiryground").at(-1);
  assert.deepEqual(sent.body.grounds, [], "no ground is sent: both passages are necessary");
  /* the plane stored it: the question is no longer unanswered, and its partition holds no ground */
  const part = (await (await door(`/api/?op=inquirypartition&id=${encodeURIComponent(question)}`, { headers: auth })).json()).result;
  assert.equal(part.ok, true, JSON.stringify(part).slice(0, 300));
  assert.deepEqual(part.groups, [], "the stored partition holds no ground");
  /* her own reading, concluded: no affirmation is asked, the plane accepts it */
  const c = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/question/" + question });
  assert.ok(await until(c, () => !!c.doc.getElementById("question-conclude-own")), "the Concluding form is drawn");
  fill(c, { "question-conclude-own": "Crews close reported potholes within a week.", "question-conclude-falsifier": "work orders showing repairs after seven days", "question-conclude-reason": "both sources agree" });
  await press(c, "conclude");
  assert.ok(await until(c, () => c.byOp("conclude").length > 0), "conclude is sent");
  const sentConclude = c.byOp("conclude").at(-1);
  assert.equal(sentConclude.query.affirmed, undefined, "no affirmation is sent");
  assert.ok(!/VERSION_AFFIRMATION_INCOMPLETE/.test(String(main(c).innerHTML)), "no affirmation is asked for");
  let after = null;
  for (const end = Date.now() + 20000; Date.now() < end;) {
    await c.settle(20);
    after = (await (await door(`/api/?op=basisversions&id=${encodeURIComponent(question)}&project=${encodeURIComponent(project)}`, { headers: auth })).json()).result;
    if (after && after.conclusion) break;
    await new Promise((x) => setTimeout(x, 300));
  }
  assert.ok(after && after.conclusion, "the question is concluded on her own reading: " + JSON.stringify(after).slice(0, 400) + " | page: " + text(main(c).querySelector('[role="alert"]')).slice(0, 400));
});

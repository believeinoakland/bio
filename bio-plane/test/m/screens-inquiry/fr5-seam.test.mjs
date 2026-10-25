/* screens-inquiry fix round 4 (T51), the seams (R-SEAM): the whole path from the member's press to the stored result, over the REAL plane (Miniflare) and the
 * real merged providers, its inputs made by the member's own acts through the real ops (`captureupload`, the screen's own promotion, `conclude`'s relatives
 * `inquiry`/`cite`), nothing scripted: N5 (R129: an unread copy is read now, `op=readheld`, extraction R80) and the cite refusal's repairs (R129; citation R21).
 * The page is interface-shell's served page over a forwarder that sends every op the page asks to the real door as the founder; no answer is written by hand. */
import "../../sandbox.mjs";
import "./fixtures.mjs"; /* registers every owner's declarations before anything reads an op (R81) */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { RE_POINTS } from "../../../src/interface-shell/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, main, actsIn, press, says } from "./fixtures.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-seam-0123456789abcdef", PASSWORD = "the founder's long password";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-seam-0123456789abcdef", PROBE_TOKEN: "prb-seam-0123456789abcdef", VERSION: "4.6.0", INSTANCE_NAME: "seam-town" },
});
after(() => mf.dispose());
const ORIGIN = "https://group.example";
const door = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  const claimed = await door("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await door("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
/** The screens' own calling kit over the real door (what `CAPTURE_SCREEN`'s promotion calls). */
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => {
    const u = new URLSearchParams({ op, ...query });
    return (await door(`/api/?${u}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
                                       ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json();
  } });
/** The page over a real door answers in real time: settle until `done()` holds or the time is up. The time is a guard against a hang, not a claim of speed:
    the real op=readheld takes about 0.1 s, but a loaded machine stretches every wait of this path (the plane's own start alone is 21 s quiet, 40-125 s starved),
    so a wall of 30 s measured the machine (R9 diagnosis, test 6). */
const until = async (p, done, ms = 300000) => {
  const end = Date.now() + ms;
  for (;;) { await p.settle(20); if (done()) return true; if (Date.now() > end) return false; await new Promise((r) => setTimeout(r, 100)); }
};
/** Every op the page asks, forwarded to the real door as the founder: `{status, json}` as the harness answers. */
const forwarded = (auth) => Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => { try {
  const u = new URLSearchParams({ ...req.query, op });
  const r = await door(`/api/?${u}`, { method: req.body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
                                       ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }) });
  const j = await r.json().catch(() => null);
  return { status: r.status, json: j };
  } catch (e) { process.stderr.write("FWDERR " + op + " " + String(e && e.stack).slice(0, 400) + "\n"); throw e; } }]));

test("R129 N5 (the real plane): interface-shell lists readheld among the acts of document: CAUSE-SHELL-4's line, red by name until it merges", () => {
  assert.ok(Array.isArray(RE_POINTS.document) && RE_POINTS.document.includes("readheld"));
});

test("R129 N5 (the real plane) a copy stored with no reading (its upload promoted while the store held no whole to read, as a record filed before R123 or a reading deferred), draws Read it now; the press reads it through the real op=readheld and the page then draws the reading", async () => {
  const auth = await founder();
  const cs = screenCall(auth);
  const bytes = Buffer.from(`a photo's words filed unread ${Date.now()}\nline two of the photo\nline three of the photo\n`);
  const sha = createHash("sha256").update(bytes).digest("hex");
  const up = (await (await door("/api/?op=captureupload&statement=seam&name=notes.txt&type=text%2Fplain", { method: "POST", headers: auth, body: bytes })).json()).result;
  assert.equal(up.existed, false);
  /* the promotion request as an aborted one leaves it: the document filed WITHOUT its reading (the register names a home, the readings table holds nothing).
     Since control-plane R123 the door reads a document after its promotion, so the unread state is made at the plane's real shape: the store holds
     no whole object while the promotion's reading is tried (it is owed to the alarm, which finds none either), and the whole is back before the press. */
  const { reading: _r, text_units: _t, ...bare } = up.document;
  const captures = await mf.getR2Bucket("CAPTURES"), key = `bio/captures/${sha}`;
  assert.ok(await captures.head(key), "the upload is held whole under its digest");
  await captures.delete(key);
  const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: bare, title: "notes.txt", locator: bare.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const bundle = made.bundleId || made.bundle_id || (made.result && (made.result.bundleId || made.result.bundle_id));
  assert.ok(bundle, "the home is named: " + JSON.stringify(made).slice(0, 300));
  const before = (await (await door(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
  assert.equal(before.found, false, "the stored record holds no reading");
  const p = await boot({ screens: SCREENS, plane: forwarded(auth), path: "/app/document/" + bundle });
  await until(p, () => actsIn(main(p)).includes("readheld"));
  assert.ok(actsIn(main(p)).includes("readheld"), "Read it now is offered on the unread copy");
  await captures.put(key, bytes);
  await press(p, "readheld", { reason: "filed before it could be read" });
  await until(p, () => main(p).textContent.includes("line two of the photo"));
  const after = (await (await door(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
  assert.equal(after.found, true, "the reading is stored");
  assert.ok(JSON.stringify(after.text_units).includes("line two of the photo"), "its units are the file's lines");
  assert.ok(main(p).textContent.includes("line two of the photo"), "and the page draws the reading");
  assert.ok(!actsIn(main(p)).includes("readheld"), "and the offer goes");
  /* control: a copy that has a reading is offered none */
  assert.ok(!actsIn(main(p)).includes("readheld"));
});

/* ---- cite refusal (R129; citation R21), the walker's state, made by the member's own acts ---- */
import { fill } from "./fixtures.mjs";

const hereAt = (p) => p.location.pathname;
test("R129 R3 (the real plane, citation R21; inquiry-grammar R68 as amended) a second passage cited while the only citation is grouped lands as a necessary leg beside the group: nothing is refused, so no repair is offered and the grouping is untouched", async () => {
  const auth = await founder();
  const cs = screenCall(auth);
  const both = SCREENS;
  /* the project: the document "Start a project" files (screens-daily's body), promoted at the door as the member's own press does */
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title: "Potholes and repairs seam", current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "Potholes and repairs seam"\nobjective: "Potholes and repairs seam"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the seam test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const projectId = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(projectId, "the project is made: " + JSON.stringify(made).slice(0, 300));
  const home = await boot({ screens: both, plane: forwarded(auth), path: "/app/project/" + projectId });
  await until(home, () => !!home.doc.getElementById("project-question"));
  fill(home, { "project-question": "Is the city repairing reported potholes within seven days?" });
  await press(home, "promote", { reason: "the question the seam cites into" });
  await until(home, () => /^\/app\/question\//.test(hereAt(home)));
  const question = decodeURIComponent(hereAt(home).split("/")[3]);
  assert.ok(question, "the question is made: " + hereAt(home));
  /* three documents filed under the project with their readings (a question rests on a document by one leg, so the second passage is another document's) */
  const fileOne = async (name, words) => {
    const up = (await (await door(`/api/?op=captureupload&statement=seam&name=${name}&type=text%2Fplain`, { method: "POST", headers: auth, body: Buffer.from(`${words} ${Date.now()}${Math.random()}\n`) })).json()).result;
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: name, locator: up.document.locator, project: projectId });
    assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 300));
    return filed.bundleId;
  };
  const docs = [await fileOne("policy.txt", "The Director shall repair each pothole within seven days."), await fileOne("audit.txt", "The audit counts the closed reports."), await fileOne("crew.txt", "The crew reports the work complete.")];
  const repairsOf = (pg) => pg.doc.getElementById("cs-main").querySelectorAll('button[data-act="cite"][data-repair]');
  const citeOf = (pg) => pg.doc.getElementById("cs-main").querySelector('button[data-act="cite"]:not([data-repair])');
  const openDoc = async (bundle) => {
    const pg = await boot({ screens: both, plane: forwarded(auth), path: "/app/document/" + bundle });
    await until(pg, () => !!citeOf(pg));
    const el = pg.doc.getElementById("document-cite-question");
    el.value = question; pg.fire(el, "change");
    await until(pg, () => !!pg.doc.getElementById("document-cite-question") && !!citeOf(pg));
    return pg;
  };
  const img = async () => (await (await door(`/api/?op=image&id=${encodeURIComponent(question)}`, { headers: auth })).json()).result["bundle.md"];
  /* the first document's passage is cited; the question's only citation is then grouped, as the question page's "What each passage carries" saves it */
  const first = await openDoc(docs[0]);
  await first.click(citeOf(first));
  await until(first, () => !!main(first).querySelector("[data-cite-done=cited]"));
  assert.ok(main(first).querySelector("[data-cite-done=cited]"), "the first passage is cited");
  const grouped = await cs.call("inquiryground", { body: { target: question, grounds: [{ ground: "part 1", legs: [0] }], reason: "the first passage is a group of its own" } });
  assert.equal(grouped.ok, true, JSON.stringify(grouped).slice(0, 300));
  /* the second document's passage: inquiry-grammar R68 (fix round 10, cause 30b; DEC-32 clause 4) judges a supporting leg that names no ground, beside a grounded one, a necessary leg and no
     finding, so the real citation lets the cite land with no refusal and so no repairs to offer; the grouping the question declares is untouched */
  const second = await openDoc(docs[1]);
  await second.click(citeOf(second));
  await until(second, () => !!main(second).querySelector("[data-cite-done=cited]"));
  assert.ok(main(second).querySelector("[data-cite-done=cited]"), "the second passage lands: " + main(second).textContent.slice(-300));
  assert.equal(repairsOf(second).length, 0, "no repair is offered where nothing was refused");
  const md1 = await img();
  assert.equal((md1.match(/\n    ground: part 1/g) || []).length, 1, "only the first leg is in the group part 1; the second stands beside it, unlabelled and necessary: " + md1.slice(md1.indexOf("basis:"), md1.indexOf("basis:") + 500));
  assert.equal((md1.match(/role: supports/g) || []).length, 2, "both legs are on the question");
  const third = await openDoc(docs[2]);
  await third.click(citeOf(third));
  await until(third, () => !!main(third).querySelector("[data-cite-done=cited]"));
  assert.ok(main(third).querySelector("[data-cite-done=cited]"), "the third lands too");
  const md2 = await img();
  assert.equal((md2.match(/role: supports/g) || []).length, 3, "all three legs are on the question: " + md2.slice(md2.indexOf("basis:"), md2.indexOf("basis:") + 700));
  assert.equal((md2.match(/\n    ground: part/g) || []).length, 1, "and the one grouping is as it was");
});

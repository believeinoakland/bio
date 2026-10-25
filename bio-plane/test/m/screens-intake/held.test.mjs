/* screens-intake R4: the `held` screen (DEC-97) on the real served page: its read, its rows and picks, the hold strip's
 * acts and the restore. Fix round 10 (K5054): over the REAL store. The rows are documents the members hold by real acts (an upload, an `acquire` of an
 * address the world's network answers, a question's capture request drained by the daemon, a ZIP opened by `acquire`), promoted at `collected`; the
 * picks, the vouching and the setting aside are the page's own acts, answered by `retrieval`, `ratification` and `capture`. Every figure and sentence
 * an assertion needs (an age, an asker, a count of files, a day) is read from the owner's answer. What the owner cannot be made to answer stays
 * scripted, each said where it is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, idle, html, text, main, btn, fill, press, ok, refused, rawKeys, word, hasWord, says, saysIn, dayOf } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { makeZip } from "../../make-zip.mjs";

const sha = (v) => createHash("sha256").update(v).digest("hex");
const DAY = 86_400_000;
const CAN = ["contribute", "create_projects"];
const SPEC = { mai: CAN, rosa: CAN };
/* a world of the members named; `aged` pins its clock two days back, so that what is held before `later` has been held two days */
const desk = async (spec = SPEC, { aged = false, ...opts } = {}) => {
  const t = await members(spec, { ...(aged ? { now: Date.now() - 2 * DAY } : {}), ...opts });
  t.spec = spec;
  return t;
};
/* the clock moves on by `ms`, and the members sign in again (their sessions have ended) */
const later = async (t, ms = 2 * DAY) => {
  await t.world.tick(ms);
  for (const [handle, caps] of Object.entries(t.spec)) t[handle] = await t.world.signIn(handle, caps && caps.length ? { capabilities: caps } : {});
};
const daemon = (t, op, body = {}) => t.world.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }, { token: t.world.env.DAEMON_TOKEN }).then((r) => r.json.result);

/* A capture by the member's real act: `captureupload` of the bytes, or `acquire` of `address` (the world's network answers it). Answers the captured document. */
async function capture(t, as, { address = null, bytes: content, type = "text/plain", name = "notice" }) {
  if (address) {
    t.world.script(address, () => new Response(content, { status: 200, headers: { "content-type": type } }));
    return (await as.act("acquire", { body: { locator: address } })).document;
  }
  const up = await t.world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name, type })}`, init: { method: "POST", headers: { "content-type": type }, body: typeof content === "string" ? new TextEncoder().encode(content) : content } }, as);
  const doc = up.json && up.json.result && up.json.result.document;
  if (!doc || !doc.capture) throw new Error(`${name} was not captured`);
  return doc;
}
/* A captured document promoted at `collected` (`allocid`, `promote`), as the recipe `hold` does it, with the title, project and criticality asked. */
async function promoteDoc(t, as, doc, { name = "notice", title = name, project = "", criticality = "supporting" } = {}) {
  const now = new Date(t.world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cap = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: " + criticality, "source_status: unchanged", "content_hash: sha256:" + cap,
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: cap }] });
  const len = (v) => new TextEncoder().encode(v).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: sha(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: sha(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: sha(dataset) }, { path: doc.file, blobSha: cap, sha256: cap, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + sha(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now, criticality }, files,
    register: [{ sha256: cap, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }] } });
  return { sha: cap, bundle: made.bundleId || id };
}
/* a document held: captured and promoted. `name` is the file's name (an upload's) and the id's tail; `title` the title the record stores. */
const hold = async (t, as, o = {}) => promoteDoc(t, as, await capture(t, as, { bytes: `${o.name || "notice"}\n`, ...o }), o);
/* A document captured for a question, by real acts (the recipe `setAside`'s first half): a question in `projectId`, the member's request to capture a public
   address for it, drained by the daemon, the document promoted at `collected`. Answers `{bundle, sha, question}`. */
let askedN = 0;
async function asked(t, as, projectId, { title = "What was asked", pageTitle = "Council minutes" } = {}) {
  const n = ++askedN;
  const q = await t.world.recipes.question(as, projectId, { title, text: title });
  const address = `https://records.example.org/minutes-${n}.html`;
  t.world.script(address, async () => new Response(`<html><head><title>${pageTitle}</title></head><body><p>The council met.</p></body></html>`, { status: 200, headers: { "content-type": "text/html" } }));
  const request = await as.act("capturerequest", { body: { address, target: q.id } });
  const done = ((await daemon(t, "capturerequestdrain")).captured || []).find((c) => c.request === request.request);
  if (!done || !done.promoted || !done.promoted.bundle_id) throw new Error("the captured document was not promoted");
  return { bundle: done.promoted.bundle_id, sha: done.sha, question: q.id };
}
/* A ZIP the member opens by `acquire` (the address answered by the world's network): the archive's document and each file the unpack filed are promoted
   (the door's own promotion of an unpack's files is not the world's), in `project`. `entries` are `{name, data}`; `locked` more entries the archive
   holds password-locked (not filed). Answers `{archive: {sha, bundle}, files: [{sha, bundle, name}]}`. */
let zipN = 0;
async function archiveOf(t, as, { entries, locked = 0, project = "", title = "Agenda packet (ZIP)" }) {
  const n = ++zipN;
  const zip = makeZip([...entries, ...Array.from({ length: locked }, (_, i) => ({ name: `locked${i + 1}.pdf`, data: "x", encrypted: "traditional" }))]);
  const address = `https://city.example/packet-${n}.zip`;
  t.world.script(address, () => new Response(zip, { status: 200, headers: { "content-type": "application/zip" } }));
  const got = await as.act("acquire", { body: { locator: address } });
  const archive = await promoteDoc(t, as, got.document, { name: `packet-${n}`, title, project });
  const files = [];
  for (const d of got.unpack.documents) files.push({ ...(await promoteDoc(t, as, d, { name: `packet-${n}-${d.container.index}`, title: d.container.path, project })), name: d.container.path });
  return { archive, files, unpack: got.unpack };
}
const zipEntries = (n, first = "01_Agenda.pdf") => Array.from({ length: n }, (_, i) => ({ name: i === 0 ? first : `${String(i + 1).padStart(2, "0")}_Part.pdf`, data: `Part ${i + 1} of the agenda packet.\n` }));

/* the page, the full rows the owner answers for it, and what the page asked */
const open = (t, path = "/app/held", as = t.mai, extra = {}) => openWorld(path, { world: t.world, as, ...extra });
const rowsOf = async (as, ids, extra = {}) => Object.fromEntries((await as.read("heldcaptures", { query: { limit: 50, bundle_ids: [].concat(ids).join(","), ...extra } })).held.map((r) => [r.bundle_id, r]));
const pick = async (p, id) => p.click(main(p).querySelector(`#pick-held-${id}`));
/* the page opens on the viewer's own captures; "everyone's" is its filter to the team's (R90), which a document captured at a member's request (made by the daemon) needs */
const everyone = async (p) => {
  const choice = p.doc.getElementById("ch-who");
  choice.value = "all";
  await p.fire(choice, "change");
  await idle(p);
  return p;
};
const day = (iso) => dayOf(iso);
const age = (d) => (d === 0 ? word("screen.held.age.today") : d === 1 ? word("screen.held.age.one") : word("screen.held.age", { days: d }));

test("R4 the screen reads heldcaptures; a list with no row is drawn in the screen's own empty sentence", async () => {
  const t = await desk({ mai: CAN });
  await hold(t, t.mai, { name: "City budget" });
  const p = await open(t);
  /* C14 (capture R102): the page as picker rows, the set-aside list, and the full fields of the rows the page draws; no other read */
  assert.deepEqual(p.byOp("heldcaptures").map((r) => (r.query.state ? "state:" + r.query.state : r.query.fields ? "fields:" + r.query.fields : r.query.bundle_ids ? "bundle_ids" : "page")).sort(), ["bundle_ids", "fields:picker", "state:set_aside"]);
  const none = await desk({ mai: CAN });
  const e = await open(none);
  assert.ok(says(e, "screen.held.empty"));
  /* control: a read that failed is drawn as failed, never as empty (the store's silence is a fault no act can make) */
  const f = await open(t, "/app/held", t.mai, { plane: { heldcaptures: refused("STORE_SILENT", "store silent (test fixture)") } });
  /* interface-shell R61: a refusal with its own words is drawn as those words alone */
  assert.match(text(f), /store silent \(test fixture\)/);
  assert.ok(main(f).querySelector('[data-state="failed"]'));
  assert.ok(!says(f, "state.failed", { reason: "x" }) && !text(f).includes(word("state.failed", { reason: "" }).split("{")[0].trim()));
  assert.ok(!says(f, "screen.held.empty"));
});

test("R4 each row with its title, age and project; the questions it waits for; withheld and refused marks with their reasons", async () => {
  const t = await desk(SPEC, { aged: true });
  const pothole = await t.world.recipes.project(t.mai, "Pothole repairs"), coliseum = await t.world.recipes.project(t.mai, "Coliseum");
  /* held two days: a photo in a project, a document captured for a question of hers, one captured for a question of rosa's she may not see */
  const photo = await hold(t, t.mai, { name: "Photo · Seminary Ave", project: pothole });
  const budget = await asked(t, t.mai, pothole, { title: "Were the transfers authorised?", pageTitle: "City budget" });
  const rosaProject = await t.world.recipes.project(t.rosa, "Rosa's matter");
  const minutes = await asked(t, t.rosa, rosaProject, { title: "What did the council decide?", pageTitle: "Council minutes" });
  /* held today: a lease declaring itself crucial, which the batch examination refuses */
  await later(t);
  const lease = await hold(t, t.mai, { name: "Lease amendment", project: coliseum, criticality: "crucial" });
  const p = await everyone(await open(t));
  const rows = await rowsOf(t.mai, [photo.bundle, budget.bundle, minutes.bundle, lease.bundle]);
  const x = text(p);
  for (const id of [photo.bundle, budget.bundle, minutes.bundle, lease.bundle]) assert.ok(main(p).querySelector(`#pick-held-${id}`), id);
  assert.equal(rows[photo.bundle].age_days, 2);
  assert.equal(rows[lease.bundle].age_days, 0);
  assert.ok(x.includes(`${age(2)} · ${word("screen.held.project", { project: "Pothole repairs" })}`));
  assert.ok(x.includes(`${word("screen.held.age.today")} · ${word("screen.held.project", { project: "Coliseum" })}`));
  const q = rows[budget.bundle].captured_for.questions[0];
  assert.equal(q.title, "Were the transfers authorised?");
  assert.ok(x.includes(word("screen.held.for", { asker: q.asker, title: q.title })));
  assert.ok(rows[minutes.bundle].captured_for.withheld, "the owner withholds a question she may not see");
  assert.ok(main(p).querySelector('[data-gap="withheld"]'));
  assert.ok(x.includes(word("screen.held.withheld")));
  assert.equal(rows[lease.bundle].eligible, false);
  assert.ok(main(p).querySelector('[data-gap="refused"]'));
  assert.ok(x.includes(`${word("screen.held.ineligible", { reason: word("screen.held.ineligible.crucial") })} ${word("screen.held.ineligible.alone")}`));
  assert.ok(rows[lease.bundle].reason && !x.includes(rows[lease.bundle].reason), "R23: never the catalogue's sentence");
  assert.deepEqual(rawKeys(p), []);
  /* an undetermined eligibility (no reader answered the batch examination) is a state the owner answers only when its reader is silent: scripted */
  const row = { bundle_id: "INFO-2026-0005-packet", title: "Agenda packet", project: null, age_days: 1, eligible: null, captured_for: null, captured_for_basis: "no reader answered", capture: null };
  const u = await open(t, "/app/held", t.mai, { plane: { heldcaptures: (req) => ok({ ok: true, held: req.query.state === "set_aside" ? [] : [row] }) } });
  assert.ok(main(u).querySelector('[data-gap="undetermined"]'), "an undetermined eligibility is stated, never drawn eligible");
  /* control: an eligible row with nothing withheld carries no gap mark */
  const one = await desk({ mai: CAN });
  await hold(one, one.mai, { name: "Photo" });
  assert.equal(main(await open(one)).querySelector("[data-gap]"), null);
});

test("R4 rows are picked (shell R19) and the hold strip offers heldsetaside and release; an archive's files open open-file", async () => {
  const t = await desk({ mai: CAN });
  const sewer = await t.world.recipes.project(t.mai, "Sewer");
  const budget = await hold(t, t.mai, { name: "City budget" });
  /* an agenda packet of fifty-two files and two the archive holds locked: the row lists the first fifty, and says there are more */
  const packet = await archiveOf(t, t.mai, { entries: zipEntries(52), locked: 2, project: sewer });
  const p = await open(t);
  assert.equal(btn(p, "release"), null, "no strip before a pick");
  await pick(p, budget.bundle);
  const strip = main(p).querySelector(".cs-hold");
  assert.ok(strip.querySelector('button[data-act="heldsetaside"]'));
  assert.ok(strip.querySelector('button[data-act="release"]'));
  assert.ok(strip.textContent.includes(word("shell.picked", { n: 1 })));
  const row = (await rowsOf(t.mai, packet.archive.bundle))[packet.archive.bundle];
  assert.equal(row.files_truncated, true);
  assert.deepEqual([row.archive.filed, row.archive.not_filed], [52, 2], "the owner counts what it filed and what it did not");
  const file = main(p).querySelector(`a.cs-ref[href="/app/open-file/${row.files[0].sha256}"]`);
  assert.equal(file.textContent, "01_Agenda.pdf");
  assert.equal(row.files[0].sha256, packet.files[0].sha);
  /* a document's screen is screens-inquiry's: registered alone, this module's page draws its card (shell R16) */
  assert.ok(main(p).querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "City budget"));
  assert.ok(says(p, "screen.held.archive", { parts: `${word("screen.held.archive.filed", { count: row.archive.filed })}, ${word("screen.held.archive.notfiled", { count: row.archive.not_filed })}` }));
  assert.ok(says(p, "screen.held.archivemore", { shown: row.files.length, total: row.files_total }));
});

const ACK = "Each copy is what its source gave.", MITIGATION = "Compared with the site.";
/* two eligible documents of the member's own, picked on the page */
const twoPicked = async (t = null) => {
  t ||= await desk({ mai: CAN });
  const pothole = await t.world.recipes.project(t.mai, "Pothole repairs");
  const photo = await hold(t, t.mai, { name: "Photo · Seminary Ave", project: pothole });
  const budget = await hold(t, t.mai, { name: "City budget" });
  const p = await open(t);
  await pick(p, photo.bundle);
  await pick(p, budget.bundle);
  return { t, p, photo, budget };
};

test("R4 release: an enumerated selection of the picked rows, then the release over its handle, with the member's acknowledgment and mitigation", async () => {
  const { t, p, photo, budget } = await twoPicked();
  fill(p, { "ch-ack": ACK, "ch-mitigation": MITIGATION });
  await press(p, "release");
  assert.deepEqual(p.byOp("select")[0].body, { ids: [photo.bundle, budget.bundle] });
  /* K3017: ratification's map reads handle, acknowledgment and mitigation from the query alone */
  const rq = p.byOp("release")[0];
  assert.ok(typeof rq.query.handle === "string" && rq.query.handle, "the handle the selection gave");
  assert.equal(rq.query.acknowledgment, ACK);
  assert.equal(rq.query.mitigation, MITIGATION);
  assert.equal(rq.method, "POST");
  assert.ok(says(p, "screen.held.released", { count: 2 }));
  assert.ok(p.byOp("heldcaptures").length >= 2, "read again after the act (R8)");
  /* the owner released the two the page picked: they are no longer held awaiting a decision */
  assert.deepEqual(await rowsOf(t.mai, [photo.bundle, budget.bundle]), {});
  const vouched = await rowsOf(t.mai, [photo.bundle, budget.bundle], { state: "held_and_vouched" });
  assert.deepEqual(Object.values(vouched).map((r) => r.standing), ["verified", "verified"]);
});

test("R4 (K3114; ratification R51) release as ratification reads it: the three from the body, else the query; carried by neither, refused (control)", async () => {
  const t = await desk({ mai: CAN });
  const [a, b, c] = [await hold(t, t.mai, { name: "First" }), await hold(t, t.mai, { name: "Second" }), await hold(t, t.mai, { name: "Third" })];
  const p = await open(t);
  await pick(p, a.bundle);
  fill(p, { "ch-ack": ACK, "ch-mitigation": MITIGATION });
  await press(p, "release");
  assert.ok(says(p, "screen.held.released", { count: 1 }));
  const rq = p.byOp("release")[0];
  assert.deepEqual([rq.body.acknowledgment, rq.body.mitigation], [ACK, MITIGATION]);
  assert.ok(typeof rq.body.handle === "string" && rq.body.handle, "the handle the selection gave");
  assert.deepEqual(await rowsOf(t.mai, a.bundle), {}, "the owner released it");
  /* controls, each both ways, by the owner's own release: the three in the body alone, or in the query alone, release alike; in neither, refused */
  const F = (handle) => ({ handle, acknowledgment: "a", mitigation: "m" });
  const handle = async (doc) => (await t.mai.act("select", { body: { ids: [doc.bundle] } })).handle;
  const viaBody = await t.mai.act("release", { body: F(await handle(b)) });
  assert.deepEqual(viaBody.released, [b.bundle]);
  const viaQuery = await t.mai.act("release", { query: F(await handle(c)), body: {} });
  assert.deepEqual(viaQuery.released, [c.bundle]);
  const d = await hold(t, t.mai, { name: "Fourth" });
  const neither = await t.world.door({ url: "/api/?op=release", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, t.mai);
  assert.equal(neither.json.result.ok, false);
  assert.ok(neither.json.result.reason, "refused, with the owner's reason");
  assert.deepEqual(Object.keys(await rowsOf(t.mai, d.bundle)), [d.bundle], "and nothing released: it is still held");
});

test("R4 release sends nothing with a field missing, or a field outside ratification R20's bounds", async () => {
  const t = await desk({ mai: CAN });
  const photo = await hold(t, t.mai, { name: "Photo · Seminary Ave" });
  const cases = [[{ "ch-ack": "", "ch-mitigation": "" }, ["screen.held.vouchmissing", { fields: `${word("screen.held.ack")}, ${word("screen.held.mitigation")}` }]],
                 [{ "ch-ack": "a", "ch-mitigation": "" }, ["screen.held.vouchmissing", { fields: word("screen.held.mitigation") }]],
                 [{ "ch-ack": 'has a " quote', "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]],
                 [{ "ch-ack": "two\nlines", "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]],
                 [{ "ch-ack": "x".repeat(501), "ch-mitigation": "ok" }, ["screen.held.vouchbad", { field: word("screen.held.ack") }]]];
  for (const [values, [key, vars]] of cases) {
    const p = await open(t);
    await pick(p, photo.bundle);
    fill(p, values);
    const r = await press(p, "release");
    assert.equal(p.byOp("select").length + p.byOp("release").length, 0, JSON.stringify(values));
    assert.ok(saysIn(r.slot(), key, vars), JSON.stringify(values));
  }
  assert.deepEqual(Object.keys(await rowsOf(t.mai, photo.bundle)), [photo.bundle], "nothing was released");
  /* control: at 500 characters it is sent, and the owner releases it */
  const p = await open(t);
  await pick(p, photo.bundle);
  fill(p, { "ch-ack": "x".repeat(500), "ch-mitigation": "ok" });
  await press(p, "release");
  assert.equal(p.byOp("release").length, 1);
  assert.deepEqual(await rowsOf(t.mai, photo.bundle), {}, "released");
  /* a refused selection sends no release: the owner's refusal of a selection too large is a fault no few documents can cause, scripted */
  const u = await desk({ mai: CAN });
  const other = await hold(u, u.mai, { name: "City budget" });
  const q = await open(u, "/app/held", u.mai, { plane: { select: refused("TOO_LARGE") } });
  await pick(q, other.bundle);
  fill(q, { "ch-ack": "a", "ch-mitigation": "b" });
  const r = await press(q, "release");
  assert.equal(q.byOp("release").length, 0);
  assert.ok(saysIn(r.slot(), "screen.held.selectfailed"));
});

/* The team's Claude account, by an administrator's real acts (the recipes' own steps), so that the assistant is reachable for the members: her password again,
   the team's key set and switched on, its notice read. The key is a stand-in no call ever sends. */
const assistant = async (t) => {
  const ada = await t.world.signIn("ada", { admin: true });
  await ada.act("reauth", { body: { password: ada.password } });
  await ada.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await ada.act("groupkeyswitch", { body: { on: true } });
  await ada.act("groupkeynoticeseen", { body: {} });
  return ada;
};
const asideOf = async (as, ids) => rowsOf(as, ids, { state: "set_aside" });

test("R4 R13 heldsetaside: one reason (the shell's reason field, no writing help) for every picked row; they move to the Set aside list", async () => {
  const t = await desk(SPEC, { ai: true });
  await assistant(t);
  assert.deepEqual([(await t.mai.read("assistantstate")).on, (await t.mai.read("groupkeystate")).on], [true, true], "the assistant is reachable for her");
  const pothole = await t.world.recipes.project(t.mai, "Pothole repairs");
  /* a document a question of hers waits on, and one that nothing waits on */
  const budget = await asked(t, t.mai, pothole, { title: "Were the transfers authorised?", pageTitle: "City budget" });
  const photo = await hold(t, t.mai, { name: "Photo · Seminary Ave", project: pothole });
  const p = await everyone(await open(t, "/app/held", t.mai));
  assert.ok(!says(p, "screen.held.setaside"), "R19: an empty Set aside is not drawn");
  const before = (await rowsOf(t.mai, budget.bundle))[budget.bundle];
  await pick(p, budget.bundle);
  const r = await press(p, "heldsetaside", { reason: "Wrong year.", sel: ":not([data-id])" });
  assert.equal(r.slot() && r.slot().querySelector('[data-act="writinghelp"]'), null, "no writing help on a reason (K1841)");
  assert.deepEqual(p.byOp("heldsetaside")[0].body, { ids: [budget.bundle], reason: "Wrong year." });
  assert.ok(says(p, "screen.held.setasidecount", { count: 1 }));
  const asker = before.captured_for.questions[0].asker;
  assert.ok(says(p, "screen.held.waiting", { asker, capture: before.title }), "the question that waits on it is told");
  const a = (await asideOf(t.mai, budget.bundle))[budget.bundle].set_aside;
  assert.equal(a.reason, "Wrong year.");
  assert.ok(text(p).includes(`${word("screen.held.asideby", { author: a.author, reason: a.reason })} ${day(a.at)}`), "read again, the row names who, why and when");
  assert.deepEqual(Object.keys(await rowsOf(t.mai, [budget.bundle, photo.bundle])), [photo.bundle], "and it is no longer held");
});

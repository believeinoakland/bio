/* screens-daily, T51 fix round 3, wave 2 (K4356, K4370, K4380): each cause one test written first and seen failing, at the module's
   interface through the real path, with its control. R87 (C14 P2.2: the roster row carries each project's question count and
   shared-drafts summary, so Home and Projects make no per-project read), R88 (C14 P2.3: one `heldcaptures` read, the picker, serves
   the doors and the vouch to-dos), R89 (C22: Find names the places the frontier counts), R90 (C23: the Projects stage boxes
   align), R91 (C70: the vouch band is counted in the page's number and the shell's badge), R92 (C81: Home and Projects at 390 px),
   R93 (an item standing for several notices closes them all), R94 (an act re-reads only what it changes). The requirement lines
   are proposed in the job record. Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { storeWorld } from "../store-request/fixtures.mjs";
import { counted } from "../interface-shell/harness.mjs";
import { open as openRaw, ok, refused, MEMBER, text, ops, button, press, beside, main, settle, dmy, word, hasWord } from "./page.mjs";
import { measure, FIT } from "./measure.mjs";

/* The page over the REAL store (store-request's `storeWorld()`, op-tables §5.3): the team, its members, projects, questions, captures, drafts
   and to-dos are made by the real acts, and every answer the page reads is the real store's. Where a test's point is an answer the real store
   never gives (a roster summary that is not known), it wraps only that op over the world's own door (`shaped`). */
const timeout = { timeout: 300000 };
const CREATE = ["contribute", "create_projects"];
const open = (w, as, path, plane = {}, o = {}) => openRaw(path, plane, { ...w.boot(as), ...o });
/** The real door's answer to `req`, its result handed to `f` to reshape (an answer of a shape the real store never gives). */
const shaped = (w, as, f) => { const { door } = w.boot(as); return async (req) => { const a = await counted(door)(req); f(a.json.result, req); return a; }; };
const area = (p, k) => text(p, main(p).querySelector(`[data-area="${k}"]`));
const hex = (s) => createHash("sha256").update(s).digest("hex");
const stamp = (w) => new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
const GATE = "https://city.example/gate";
const LOT = "https://city.example/lot";

/** The store's own appetite for a host's requests (`GOVERNOR_APPETITE_PER_MIN`, an instance binding): a public address is fetched at once, not after the
 *  seconds a person's pace would wait, so a test that captures hundreds of pages from one host does not wait for them. */
const world = (o = {}) => storeWorld({ group: null, ...o, env: { GOVERNOR_APPETITE_PER_MIN: "6000000", ...(o.env || {}) } });

/** A document the member holds, collected and not vouched for, by the real acts: fetched from its public address (`acquire`, the address answered by the
 *  world's network, scripted; the clock moves a second on, which refills the host's appetite), then the promotion of its information bundle at `collected`, as
 *  the capture screen promotes it. `read` has the page read, as the scheduler reads it. Answers the bundle's id and the capture's digest. */
async function held(w, as, { title, address, paragraphs = [address + " " + title], read = false }) {
  const body = `<html><head><title>${title}</title></head><body>${paragraphs.map((x) => `<p>${x}</p>`).join("\n")}</body></html>`;
  await w.tick(1000);
  w.script(address, async () => new Response(body, { status: 200, headers: { "content-type": "text/html" } }));
  const doc = (await as.act("acquire", { body: { locator: address } })).document;
  const now = stamp(w);
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register } });
  if (read) await as.act("readheld", { query: { sha } });
  return { id: made.bundleId || id, sha };
}

/** A group with a member `mai` who may start projects and has looked at Home before (her first look is the real `lookedsince`, which records it). */
async function desk() {
  const w = await world();
  const mai = await w.signIn("mai", { capabilities: CREATE });
  await mai.read("lookedsince");
  return { w, mai };
}
/** `mai`'s three projects: "The Coliseum lease" (three questions), "Pothole repairs" (one) and "Odd" (none), by the real acts. */
async function three() {
  const { w, mai } = await desk();
  const [coliseum, pothole] = [await w.recipes.project(mai, "The Coliseum lease"), await w.recipes.project(mai, "Pothole repairs")];
  await w.recipes.project(mai, "Odd");
  await w.recipes.questions(mai, coliseum, 3);
  await w.recipes.questions(mai, pothole, 1);
  return { w, mai, coliseum, pothole };
}
const rowsOf = (p) => main(p).querySelectorAll(".cs-row");
const rowOf = (p, name) => rowsOf(p).find((r) => text(p, r).includes(name));

/* ---------- R87 (C14, P2.2): the roster row carries the counts ---------- */

test("R87 (C14, P2.2): Home draws each project's question count from its roster row and makes no per-project read; the reading counts what the rows say", timeout, async () => {
  const { w, mai } = await three();
  const p = await open(w, mai, "/app");
  await settle();
  assert.equal(p.byOp("projectlist").length, 1, "the roster is read once");
  assert.equal(p.byOp("projectquestions").length, 0, "no question read for any project");
  assert.equal(p.byOp("casedrafts").length, 0, "no draft read for any project");
  const t = text(p);
  assert.ok(t.includes("The Coliseum lease" + word("screen.home.questions.many", { n: "3" })));
  assert.ok(t.includes("Pothole repairs" + word("screen.home.questions.one")), "R25: one question, the singular key");
  assert.ok(!t.includes(word("screen.home.questions.many", { n: "0" })), "R21: no count at zero");
  assert.ok(area(p, "investigation").includes(`4 ${word("screen.home.rd.questions")}`), "the reading is the rows' sum: 3 + 1 + 0");
});

test("R87 (C14, P2.2): Projects draws each project's question count from its roster row and reads no question for any project", timeout, async () => {
  const { w, mai } = await three();
  const p = await open(w, mai, "/app/projects");
  await settle();
  assert.equal(p.byOp("projectquestions").length, 0);
  assert.ok(text(p, rowOf(p, "The Coliseum lease")).includes(word("screen.projects.questions.many", { n: "3" })));
  assert.ok(text(p, rowOf(p, "Pothole repairs")).includes(word("screen.projects.questions.one")));
  assert.doesNotMatch(text(p, rowOf(p, "Odd")), /\d+ questions?/, "R21: no count at zero");
});

test("R87 (C14, P2.2): a project seen only at EXISTENCE answers a null count, drawn as not known and never as zero; the reading is not drawn from a partial sum", timeout, async () => {
  // The rescue is open to the administrator for the hidden project of a member since removed: the roster knows nothing of its questions.
  const w = await world();
  const [founder, rosa, ana] = [await w.signIn("admin"), await w.signIn("rosa", { admin: true }), await w.signIn("ana", { capabilities: CREATE })];
  await rosa.read("lookedsince");
  const coliseum = await w.recipes.project(rosa, "The Coliseum lease");
  await w.recipes.questions(rosa, coliseum, 3);
  const hidden = await w.recipes.project(ana, "Hidden elsewhere");
  await ana.act("projectvisibilityset", { query: { projectId: hidden, setting: "hidden", reason: "mine for now" } });
  await founder.act("memberset", { body: { memberId: "ana", status: "revoked" } });
  const real = (await rosa.read("projectlist")).projects.find((x) => x.name === "Hidden elsewhere");
  assert.equal(real.question_count, null, "the store does not know it");
  for (const [where, path] of [["home", "/app"], ["projects", "/app/projects"]]) {
    const p = await open(w, rosa, path);
    await settle();
    const row = rowsOf(p).find((r) => r.textContent.includes("Hidden elsewhere"));
    assert.ok(text(p, row).includes(word("screen.matter.unknown")), `${where}: the count is told as not known`);
    assert.ok(!text(p, row).includes(word(`screen.${where}.questions.many`, { n: "0" })) && !/\b0\b/.test(text(p, row).replace(/\d{4}/g, "")), `${where}: never as zero`);
  }
  const home = await open(w, rosa, "/app");
  await settle();
  assert.ok(!area(home, "investigation").includes(word("screen.home.rd.questions")) && !area(home, "investigation").includes(word("screen.home.rd.question")), "no total is drawn while one count is not known");
  // Control: a roster of one project draws the same as the rows say.
  const solo = await world();
  const sam = await solo.signIn("sam", { admin: true });
  await sam.read("lookedsince");
  await solo.recipes.questions(sam, await solo.recipes.project(sam, "The Coliseum lease"), 2);
  const one = await open(solo, sam, "/app");
  await settle();
  assert.ok(text(one).includes("The Coliseum lease" + word("screen.home.questions.many", { n: "2" })));
  assert.ok(area(one, "investigation").includes(`2 ${word("screen.home.rd.questions")}`));
});

/** A team: the administrator `rosa` with three projects ("The Coliseum lease" with three questions, "Pothole repairs", "Odd") and a draft of the first shared
 *  for review until a day (`casedraft`, `reviewgrant`), by the real acts. Answers the day and the project's id. */
async function shared() {
  const w = await world({ now: Date.now() });
  const rosa = await w.signIn("rosa", { admin: true });
  await rosa.read("lookedsince");
  const coliseum = await w.recipes.project(rosa, "The Coliseum lease");
  await w.recipes.questions(rosa, coliseum, 3);
  await w.recipes.project(rosa, "Pothole repairs");
  await w.recipes.project(rosa, "Odd");
  const draft = await rosa.act("casedraft", { body: { project: coliseum, statement: "A draft for review" } });
  const until = new Date(w.now() + 5 * 86400000).toISOString();
  await rosa.act("reviewgrant", { body: { draft: draft.draftId, recipient: "A neighbour", until } });
  return { w, rosa, coliseum, until };
}
/** The real door's answer to `req` (a read, as the page or the browser's plane makes it), its result replaced by `f(result, req)`: an answer of a shape the
 *  real store cannot give here, or the real rows with what only the measure needs of their shape. */
const through = (w, as, f) => counted(async (req) => {
  const a = await w.door({ url: `/api/?${new URLSearchParams({ ...req.query, op: req.op })}`, init: { method: "GET" } }, as);
  return { ...a, status: 200, json: { ...a.json, ok: true, result: f(a.json && a.json.result, req) } };
});

test("R87 (C14, P2.2): the drafts shared for review are read only for the projects whose row says one is shared; a null or zero summary reads none", timeout, async () => {
  const { w, rosa, coliseum, until } = await shared();
  // The store names a draft's case only once a case is published (a ratification no test of this screen can sign), so the case the draft is of, and its two
  // editions, are the real answers of `casedrafts` and `publishedlist` / `publishedcase` with the case named; the draft, its grant and its roster row are real.
  const CASE = "CASE-1";
  const named = through(w, rosa, (r) => { for (const l of Object.values(r.lists)) for (const d of l.drafts || []) d.case = { case_id: CASE, edition: 3, identity: "x" }; return r; });
  const plane = { casedrafts: named,
    publishedlist: through(w, rosa, (r) => ({ ...r, cases: [{ case_id: CASE, edition: 1, published_at: "2026-09-01T10:00:00Z" }, { case_id: CASE, edition: 2, published_at: "2026-09-18T10:00:00Z" }] })),
    publishedcase: through(w, rosa, (r, req) => ({ ...(r || {}), ok: true, caseId: req.query.caseId, edition: Number(req.query.edition), scope: "The Coliseum lease" })) };
  const p = await open(w, rosa, "/app", plane);
  await settle();
  assert.deepEqual(p.byOp("casedrafts").map((r) => r.query.projects), [coliseum], "only the project with a draft shared is asked");
  const line = word("screen.home.area.edition", { n: "2", case: "The Coliseum lease", date: dmy("2026-09-18"), until: dmy(until.slice(0, 10)) });
  assert.ok(area(p, "investigation").includes(line), "its draft line is drawn as before");
  // Control: every summary null (the tranche before control-plane R118) reads no draft and draws no draft line.
  const q = await open(w, rosa, "/app", { ...plane, projectlist: shaped(w, rosa, (r) => { for (const x of r.projects) x.shared_drafts = null; }) });
  await settle();
  assert.deepEqual(q.byOp("casedrafts"), [], "an unknown summary is not read project by project");
  assert.ok(!area(q, "investigation").includes(line));
});

/* ---------- R88 (C14, P2.3): one picker read serves the doors and the vouch to-dos ---------- */

/** `mai` with 201 captures at the gate and `dev` with two at the lot, by the real acts: made once, read by both screens. */
let bigWorld = null;
const big = () => (bigWorld ||= (async () => {
  const { w, mai } = await desk();
  const dev = await w.signIn("dev", { capabilities: ["contribute"] });
  for (let i = 0; i < 201; i++) await held(w, mai, { title: "Photo M" + i, address: GATE });
  for (let i = 1; i <= 2; i++) await held(w, dev, { title: "Photo T" + i, address: LOT });
  return { w, mai };
})());

for (const [where, path] of [["home", "/app"], ["queue", "/app/queue"]]) {
  test(`R88 (C14, P2.3; ${where}): the doors and the vouch to-dos share one heldcaptures read, the picker with one limit of 500; the to-dos keep the rows whose actor is the member, all 201 of them`, timeout, async () => {
    const { w, mai } = await big();
    const p = await open(w, mai, path);
    await settle();
    const reads = p.byOp("heldcaptures");
    assert.equal(reads.length, 1, "one read of the held captures");
    assert.equal(reads[0].query.fields, "picker");
    assert.equal(reads[0].query.limit, "500");
    assert.equal(reads[0].query.member, undefined, "the read is not narrowed to her: the doors count everyone's");
    const t = text(p);
    assert.ok(t.includes(word("screen.home.todo.vouch", { count: "201", place: GATE })), "her 201 captures are one to-do at the gate: none lost past 200");
    assert.ok(!t.includes(word("screen.home.todo.vouch", { count: "2", place: LOT })), "control: another member's captures are not her to-dos");
    assert.ok(t.includes("203"), "the door to Held captures counts every row");
    assert.equal(button(p, "release").dataset.ids.split(",").length, 201, "the act carries all of hers");
  });

  test(`R88 (C14, P2.3; ${where}): control: a member with three captures and nobody else's draws three, from the same one read`, timeout, async () => {
    const { w, mai } = await desk();
    for (let i = 0; i < 3; i++) await held(w, mai, { title: "Photo M" + i, address: GATE });
    const p = await open(w, mai, path);
    await settle();
    assert.equal(p.byOp("heldcaptures").length, 1);
    assert.ok(text(p).includes(word("screen.home.todo.vouch", { count: "3", place: GATE })));
  });
}

test("R88 (C14, P2.3): vouching re-reads the one held-captures read, so the to-do and the door both go", timeout, async () => {
  const { w, mai } = await desk();
  for (let i = 0; i < 2; i++) await held(w, mai, { title: "Photo M" + i, address: GATE });
  const p = await open(w, mai, "/app");
  await settle();
  const f = button(p, "release").dataset.f;
  await press(p, "release", { values: { [f + "-ack"]: "They came from the gate cameras", [f + "-mitigation"]: "I compared them with the log" }, reason: "vouching" });
  await settle();
  assert.equal(p.byOp("heldcaptures").length, 2, "read again once");
  assert.ok(!ops(p).includes("release"), "the to-do is gone");
  assert.ok(!text(p).includes(word("screen.held.name")), "and the door");
});

/* ---------- R89 (C22): Find names the places the frontier counts ---------- */

const LEVELS = ["document", "content", "meaning", "internet"];
const GOT = { found: true, built: true, never_looked: [], never_looked_count: 0, tally: { LOOKED_FOUND: 4, LOOKED_ABSENT: 1 }, note: "" };
const rowsOfLevels = (p) => main(p).querySelectorAll(".cs-row").filter((r) => LEVELS.some((l) => r.querySelector("b") && r.querySelector("b").textContent === word("screen.answers.level." + l)));
const SHA = (c) => c.repeat(64);

test("R89 (C22): every place the frontier counts is named: by its own words, else by its document's title (one search for the titles), else by the plain word for a document; never by a digest or an id", async () => {
  const titled = [];
  const per = {
    document: { ...GOT, never_looked_count: 1, never_looked: [{ subject: "https://oakland.example/budget.pdf", from_document: "INF-1" }] },
    content: { ...GOT, never_looked_count: 3, never_looked: [{ subject: SHA("a"), bundle_id: "INF-3" }, { subject: SHA("b"), bundle_id: "INF-4" }, { subject: SHA("c"), bundle_id: "INF-5" }] },
    meaning: GOT, internet: GOT,
  };
  const plane = {
    frontier: (req) => ok(per[req.query.level]),
    search: (req) => { const ids = [...String(req.query.q).matchAll(/id:([A-Za-z0-9-]+)/g)].map((m) => m[1]); titled.push(ids);
      return ok({ total: 2, hits: ids.filter((i) => i !== "INF-5").map((i) => ({ bundle_id: i, title: i === "INF-3" ? "Council minutes 2024" : "Lease amendment" })) }); },
  };
  const p = await openRaw("/app/finder", plane);
  await press(p, "frontier", { reason: "looking" });
  await settle();
  const rowOf = (l) => rowsOfLevels(p).find((r) => r.querySelector("b").textContent === word("screen.answers.level." + l));
  const items = (l) => rowOf(l).querySelectorAll("li").map((li) => li.textContent);
  assert.deepEqual(items("document"), ["https://oakland.example/budget.pdf"], "a place that carries its own name is drawn by it");
  assert.deepEqual(items("content"), ["Council minutes 2024", "Lease amendment", word("shell.card.document")], "three places, three names: the count is the list");
  assert.ok(text(p, rowOf("content")).includes(word("screen.finder.nobody", { n: "3" })));
  assert.doesNotMatch(text(p), /[0-9a-f]{64}|INF-\d/, "no digest and no id is drawn");
  assert.equal(titled.length, 1, "the titles are asked for once");
  assert.ok(["INF-3", "INF-4", "INF-5"].every((i) => titled[0].includes(i)) && !titled[0].includes("INF-1"), "for the documents the places lie in that name nothing themselves");
});

test("R89 (C22) control: a level with nothing left unlooked names no place; places that name themselves ask for no title", async () => {
  const per = { document: { ...GOT, never_looked_count: 2, never_looked: [{ subject: "https://a.example/x" }, { subject: "https://b.example/y" }] }, content: GOT, meaning: GOT, internet: GOT };
  const p = await openRaw("/app/finder", { frontier: (req) => ok(per[req.query.level]), search: ok({ total: 0, hits: [] }) });
  await press(p, "frontier", { reason: "looking" });
  await settle();
  const rows = rowsOfLevels(p);
  assert.deepEqual(rows.map((r) => r.querySelectorAll("li").length), [2, 0, 0, 0], "two named, and a level counting zero draws no list");
  assert.equal(p.byOp("search").length, 0, "no title is looked up when every place names itself");
});

/* ---------- R90 (C23) and R92 (C81): measured in a browser ---------- */

const NAMES = ["The Coliseum lease and the sewer fund transfers", "Pothole repairs", "Odd", "Oakland Unified budget"];
/* The browser draws the page over a plane of answers; the roster rows are four of a shape the measure needs (stage, owner, members, activity) and are
   the plane's own, but the held captures, the group and the doors' first steps are the REAL store's, forwarded from a world's door. */
/** The page's rows for the four projects, each the real row with what the measure needs of its shape: the stage, owner, members, activity and last change a
 *  project of this width carries (the world's own rows are all alike, forming and new). */
const wide = (r) => ({ ...r, projects: r.projects.map((x) => {
  const i = NAMES.indexOf(x.name);
  return { ...x, stage: ["investigating", "forming", null, "closed"][i], question_count: i, rescue_open: i === 1,
    owner: i % 2 ? null : { member: "M-1", handle: "dev" }, members: [{ member: "M-1", handle: "dev" }].concat(i ? [{ member: "M-2", handle: "rosa" }] : []),
    activity: [3, 5, 4, 6, 8, 7, 9, 11], lastChange: i === 2 ? null : "2026-10-12T15:00:00Z" };
}) });
const forward = (w, as, op) => (req) => w.door({ url: `/api/?${new URLSearchParams({ ...req.query, op })}`, init: { method: "GET" } }, as);
let fullPlane = null;
const FULL = () => (fullPlane ||= (async () => {
  const { w, mai } = await desk();
  for (const name of NAMES) await w.recipes.project(mai, name);
  await held(w, mai, { title: "Photo H1", address: GATE });
  return { whoami: ok({ ...MEMBER, capabilities: CREATE }),
    projectlist: through(w, mai, wide), themeread: ok({ themes: [] }),
    queue: ok({ items: [{ id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch for 3 photos", due: "2026-10-12", assignee: "mai", assignee_role: "member", options: [], disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-7" } }], item_count: 1 }),
    lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), inbox: ok({ inbox: [{ id: 1, status: "new" }] }),
    heldcaptures: forward(w, mai, "heldcaptures"), startfrom: forward(w, mai, "startfrom"), groupidentity: forward(w, mai, "groupidentity") };
})());
const MEASURE = (W) => ({ ...FIT(W), lefts: Array.from(document.querySelectorAll("#cs-main div.cs-ladder")).concat(Array.from(document.querySelectorAll("#cs-main span.cs-ladder"))).map((l) => Math.round(l.getBoundingClientRect().left)),
  tops: Array.from(document.querySelectorAll("#cs-main div.cs-ladder")).map((l) => Array.from(l.children).map((c) => Math.round(c.getBoundingClientRect().top))) });
const run = async (path, width) => measure({ path, width, plane: await FULL(), ready: "#cs-main .cs-row", measure: new Function("W", `const FIT = ${FIT.toString()}; return (${MEASURE.toString()})(W);`) });

test("R90 (C23): the Projects stage boxes start at one left edge on every row, whatever the name, owner and last change beside them", { timeout: 120000 }, async () => {
  const m = await run("/app/projects", 1280);
  assert.equal(m.lefts.length, 4, "four rows draw their stage (one stage is not recorded, and says so in place of the boxes)");
  assert.equal(new Set(m.lefts).size, 1, "one left edge, the not-recorded row's sentence included: " + JSON.stringify(m.lefts));
  assert.equal(m.tops.length, 3, "three rows draw the four boxes");
  // Control: the boxes of a row stay on one line, side by side, and the page is no wider than the screen.
  for (const tops of m.tops) assert.equal(new Set(tops).size, 1, "the four boxes are on one line: " + JSON.stringify(tops));
  assert.ok(m.mainScroll <= 1280);
});

for (const [where, path] of [["Home", "/app"], ["Projects", "/app/projects"]]) {
  test(`R92 (C81; ${where}): at 390 px no part of the main area runs past the screen and every control is at least 44 px; control: at 1280 px the layout is the desktop's`, { timeout: 120000 }, async () => {
    const m = await run(path, 390);
    assert.ok(m.mainScroll <= 390, "the main area is no wider than the screen: " + m.mainScroll);
    assert.deepEqual(m.over, [], "nothing past the edge");
    assert.deepEqual(m.small, [], "every target is at least 44 px");
    const d = await run(path, 1280);
    assert.ok(d.mainScroll <= 1280 && d.over.length === 0, "the desktop page fits");
    for (const tops of d.tops) assert.equal(new Set(tops).size, 1, "the desktop's stage boxes stay on one line");
  });
}

/* ---------- R91 (C70): the vouch band counted ---------- */

const badge = (p) => p.root().querySelector(".cs-rail a .count").textContent;

/** `rosa`'s project with a document, a check of it asked of `mai` once for each name in `names` (each a To do in her queue, a task of kind check-requested), by the real acts. */
async function todos(...names) {
  const w = await world();
  const rosa = await w.signIn("rosa", { admin: true });
  const mai = await w.signIn("mai", { capabilities: CREATE });
  const project = await w.recipes.project(rosa, "Library hours");
  await rosa.act("projectinvite", { query: { projectId: project, handle: "mai" } });
  await mai.act("projectjoin", { query: { projectId: project } });
  for (const name of names) {
    const doc = await w.recipes.page(rosa, name, { project });
    await rosa.act("checkrequest", { body: { target: doc.bundle, member: "mai", note: "please look at " + name } });
  }
  await mai.read("lookedsince");
  return { w, rosa, mai };
}

test("R91 (C70): the queue's count and the shell's badge include the vouch rows (one for each place), the page says how many, and Home's reading counts them", timeout, async () => {
  const { w, mai } = await todos("Check", "Check too");
  const base = await open(w, mai, "/app/queue");
  await settle();
  const n0 = Number(badge(base));
  const without = await open(w, mai, "/app");
  await settle();
  for (let i = 0; i < 5; i++) await held(w, mai, { title: "Photo " + i, address: "https://city.example/place-" + i });
  const q = await open(w, mai, "/app/queue");
  await settle();
  assert.equal(Number(badge(q)), n0 + 5, "the badge adds the band's five");
  assert.ok(text(q).includes(word("screen.queue.count.many", { n: String(2 + 5) })), "the page's count includes the band");
  assert.equal(main(q).querySelectorAll('button[data-act="release"]').length, 5, "and says each: five rows");
  const h = await open(w, mai, "/app");
  await settle();
  assert.equal(Number(badge(h)), n0 + 5, "Home reports the same band");
  assert.equal(text(h, main(h).querySelector(".mk-strip")), `7 ${word("screen.home.strip.you")}`, "Home's strip counts the five with the two");
  // Control: with no band the count and the badge are unchanged.
  assert.equal(Number(badge(without)), n0);
  assert.ok(text(base).includes(word("screen.queue.count.many", { n: "2" })));
});

/* ---------- R93: an item standing for several notices closes them all ---------- */

/** `mai` with a newer-version item in her queue standing for `n` notices, by the real acts: a web page captured (its three paragraphs) and read, a question of hers
 *  resting on its first `n` paragraphs (each a passage of its own), the same address captured again with every paragraph changed, and the scheduler's round
 *  that raises one notice for each passage (the queue stands them as one item: one holder, one document, one newer version). Answers the item's notices. */
async function newer(n) {
  const { w, mai } = await desk();
  const project = await w.recipes.project(mai, "Budget");
  const address = "https://city.example/budget";
  const first = await held(w, mai, { title: "Budget", address, paragraphs: ["Cut by ten percent.", "Library closed.", "Parks open."], read: true });
  await w.recipes.question(mai, project, { title: "Budget", text: "What happened to the budget?", draw: true,
    legs: Array.from({ length: n }, (_, i) => ({ target: first.id, extent_kind: "doc-para", extent_para: i })) });
  await w.tick(2000);
  await held(w, mai, { title: "Budget", address, paragraphs: ["Restored in full.", "Library open.", "Parks closed."], read: true });
  await w.tick(120000);
  const item = (await mai.read("queue")).items.find((i) => i.kind === "newer-capture-affects-reference");
  assert.ok(item, "the newer-version item stands in her queue");
  assert.equal(item.basis.notices.length, n, "one notice for each passage");
  return { w, mai, notices: item.basis.notices };
}

for (const [where, path] of [["queue", "/app/queue"], ["home", "/app"]]) {
  test(`R93 (${where}): one press of Keep or Adopt is sent once for each notice the item stands for; control: an item of one notice sends one`, timeout, async () => {
    const three = await newer(3);
    const p = await open(three.w, three.mai, path);
    await settle();
    await press(p, "keepversion");
    assert.deepEqual(p.byOp("keepversion").map((r) => r.body.notice).sort(), three.notices, "every notice is closed");
    assert.equal((await three.mai.read("queue")).items.filter((i) => i.kind === "newer-capture-affects-reference").length, 0, "the real notices are closed");
    const two = await newer(2);
    const a = await open(two.w, two.mai, path);
    await settle();
    const f = button(a, "adoptversion").dataset.f;
    await press(a, "adoptversion", { values: { [f + "-why"]: "It corrects the date" } });
    assert.deepEqual(a.byOp("adoptversion").map((r) => [r.body.notice, r.body.why]).sort(), two.notices.map((n) => [n, "It corrects the date"]), "the same reason for each");
    const solo = await newer(1);
    const one = await open(solo.w, solo.mai, path);
    await settle();
    await press(one, "keepversion");
    assert.deepEqual(one.byOp("keepversion").map((r) => r.body.notice), solo.notices);
  });
}

test("R93: a refusal on one of the notices is shown once, and the rest are not sent after it", timeout, async () => {
  const { w, mai, notices } = await newer(3);
  const p = await open(w, mai, "/app/queue");
  await settle();
  // The middle notice is closed meanwhile (by her, on another screen): the store refuses it as no longer open.
  await mai.act("versionkeep", { body: { notice: notices[1] } });
  const b = await press(p, "keepversion");
  assert.deepEqual(p.byOp("keepversion").map((r) => r.body.notice), [notices[0], notices[1], notices[1]], "the third is not sent after the refused one, which stands as the act's own request");
  const said = beside(p, b);
  assert.ok(said.length > 0, "the refusal's words are drawn beside the act");
  assert.equal(text(p, main(p)).split(said).length - 1, 1, "once");
  assert.ok(b);
});

/* ---------- R94: an act re-reads only what it changes ---------- */

test("R94: the queue's acts name the reads they change: resolving a task re-reads the queue only, not the doors, the roster or the muted list", timeout, async () => {
  const { w, mai } = await todos("Check");
  await held(w, mai, { title: "Photo H1", address: GATE });
  const p = await open(w, mai, "/app/queue");
  await settle();
  const before = { held: p.byOp("heldcaptures").length, inbox: p.byOp("inbox").length, roster: p.byOp("memberlist").length, queue: p.byOp("queue").length };
  await press(p, "taskresolve");
  await settle();
  assert.equal(p.byOp("heldcaptures").length, before.held, "the held captures are not read again");
  assert.equal(p.byOp("inbox").length, before.inbox, "nor the inbox");
  assert.equal(p.byOp("memberlist").length, before.roster, "nor the roster");
  assert.ok(p.byOp("queue").length > before.queue, "the queue is");
  // Control: vouching changes the held captures, which are read again.
  const c = await desk();
  await held(c.w, c.mai, { title: "Photo H1", address: GATE });
  const q = await open(c.w, c.mai, "/app/queue");
  await settle();
  const h0 = q.byOp("heldcaptures").length;
  const f = button(q, "release").dataset.f;
  await press(q, "release", { values: { [f + "-ack"]: "a", [f + "-mitigation"]: "b" }, reason: "vouching" });
  await settle();
  assert.ok(q.byOp("heldcaptures").length > h0);
});

test("R87, R88 (words): the words the new draws read are held by the word list", () => {
  for (const k of ["screen.matter.unknown", "shell.card.document", "screen.finder.nobody", "screen.queue.count.many", "screen.home.strip.you"]) assert.ok(hasWord(k), k);
});

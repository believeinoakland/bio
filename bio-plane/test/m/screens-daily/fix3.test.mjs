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
import { open as openRaw, ok, refused, text, ops, button, press, beside, main, settle, dmy, word, hasWord } from "./page.mjs";
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

/** A document the member holds, collected and not vouched for, by the real acts: from a public address (`acquire`, the address answered by
 *  the world's network, scripted), then the promotion of its information bundle at `collected`, as the capture screen promotes it.
 *  Answers the bundle's id. */
async function held(w, as, { title, address }) {
  const body = `<html><head><title>${title}</title></head><body><p>${address} ${title}</p></body></html>`;
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
  return made.bundleId || id;
}

/** A group with a member `mai` who may start projects and has looked at Home before (her first look is the real `lookedsince`, which records it). */
async function desk() {
  const w = await storeWorld({ group: null });
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

test("R87 (C14, P2.2): Home draws each project's question count from its roster row and makes no per-project read; the reading counts what the rows say", async () => {
  const p = await open("/app", { ...BASE, projectlist: LIST(THREE), projectquestions: ok({ ok: true, items: [{ inquiry: "Q" }], cursor: null }), casedrafts: batched(() => ({ ok: true, drafts: [] })) });
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

test("R87 (C14, P2.2): Projects draws each project's question count from its roster row and reads no question for any project", async () => {
  const p = await open("/app/projects", { ...BASE, projectlist: LIST(THREE), projectquestions: ok({ ok: true, items: [{ inquiry: "Q" }], cursor: null }), themeread: ok({ themes: [] }) });
  await settle();
  assert.equal(p.byOp("projectquestions").length, 0);
  const rows = main(p).querySelectorAll(".cs-row");
  assert.ok(text(p, rows[0]).includes(word("screen.projects.questions.many", { n: "3" })));
  assert.ok(text(p, rows[1]).includes(word("screen.projects.questions.one")));
  assert.doesNotMatch(text(p, rows[2]), /\d+ questions?/, "R21: no count at zero");
});

test("R87 (C14, P2.2): a project seen only at EXISTENCE answers a null count, drawn as not known and never as zero; the reading is not drawn from a partial sum", async () => {
  const some = [PROJ("PROJ-1", "The Coliseum lease", { question_count: 3 }), PROJ("PROJ-9", "Hidden elsewhere", { question_count: null, shared_drafts: null })];
  for (const [where, path] of [["home", "/app"], ["projects", "/app/projects"]]) {
    const p = await open(path, { ...BASE, projectlist: LIST(some), themeread: ok({ themes: [] }) });
    await settle();
    const row = main(p).querySelectorAll(".cs-row").find((r) => r.textContent.includes("Hidden elsewhere"));
    assert.ok(text(p, row).includes(word("screen.matter.unknown")), `${where}: the count is told as not known`);
    assert.ok(!text(p, row).includes(word(`screen.${where}.questions.many`, { n: "0" })) && !/\b0\b/.test(text(p, row).replace(/\d{4}/g, "")), `${where}: never as zero`);
  }
  const home = await open("/app", { ...BASE, projectlist: LIST(some) });
  await settle();
  assert.ok(!area(home, "investigation").includes(word("screen.home.rd.questions")) && !area(home, "investigation").includes(word("screen.home.rd.question")), "no total is drawn while one count is not known");
  // Control: a roster of one project draws the same as the rows say.
  const one = await open("/app", { ...BASE, projectlist: LIST([PROJ("PROJ-1", "The Coliseum lease", { question_count: 2 })]) });
  await settle();
  assert.ok(text(one).includes("The Coliseum lease" + word("screen.home.questions.many", { n: "2" })));
  assert.ok(area(one, "investigation").includes(`2 ${word("screen.home.rd.questions")}`));
});

const PUBLISHED = ok({ bundles: [], cases: [{ case_id: "CASE-1", edition: 1, published_at: "2026-09-01T10:00:00Z" }, { case_id: "CASE-1", edition: 2, published_at: "2026-09-18T10:00:00Z" }] });
const DRAFTS = (reads) => batched((id) => { reads.push(id); return { ok: true, project: id, count: 1, drafts: [{ draft_id: "DRAFT-1", case: { case_id: "CASE-1", edition: 3, identity: "x" } }] }; });

test("R87 (C14, P2.2): the drafts shared for review are read only for the projects whose row says one is shared; a null or zero summary reads none", async () => {
  const reads = [];
  const rows = [PROJ("PROJ-1", "The Coliseum lease", { question_count: 3, shared_drafts: { count: 1, newest: "2026-10-10T10:00:00Z" } }),
    PROJ("PROJ-2", "Pothole repairs", { shared_drafts: { count: 0, newest: null } }), PROJ("PROJ-3", "Odd", { shared_drafts: null })];
  const plane = { ...BASE, projectlist: LIST(rows), publishedlist: PUBLISHED, publishedcase: ok({ ok: true, caseId: "CASE-1", edition: 2, scope: "The Coliseum lease" }),
    casedrafts: DRAFTS(reads), reviewcopy: ok({ ok: true, comments: [], grants: [{ live: true, until: "2026-10-20T00:00:00Z" }] }) };
  const p = await open("/app", plane);
  await settle();
  assert.deepEqual(reads, ["PROJ-1"], "only the project with a draft shared is asked");
  assert.ok(area(p, "investigation").includes(word("screen.home.area.edition", { n: "2", case: "The Coliseum lease", date: dmy("2026-09-18"), until: dmy("2026-10-20") })), "its draft line is drawn as before");
  // Control: every summary null (the tranche before control-plane R118) reads no draft and draws no draft line.
  const none = [];
  const q = await open("/app", { ...plane, projectlist: LIST(rows.map((r) => ({ ...r, shared_drafts: null }))), casedrafts: DRAFTS(none) });
  await settle();
  assert.deepEqual(none, [], "an unknown summary is not read project by project");
  assert.ok(!area(q, "investigation").includes(word("screen.home.area.edition", { n: "2", case: "The Coliseum lease", date: dmy("2026-09-18"), until: dmy("2026-10-20") })));
});

/* ---------- R88 (C14, P2.3): one picker read serves the doors and the vouch to-dos ---------- */

const PICK = (id, address, actor) => ({ bundle_id: id, title: "Photo " + id, project: null, source: address ? { address, via: "web", retrieved: null } : null,
  collected_since: "2026-10-01T00:00:00Z", capture: { sha256: "a".repeat(64) }, actor, whole: true, standing: "collected" });
const GATE = "https://city.example/gate";
const LOT = "https://city.example/lot";
const MINE = Array.from({ length: 201 }, (_, i) => PICK("INF-M" + i, GATE, "mai"));
const THEIRS = [PICK("INF-T1", LOT, "dev"), PICK("INF-T2", LOT, "dev")];
const HELD = (...rows) => (req) => ok({ ok: true, held: rows, state: "held", truncated: false, next: null, limit: Number(req.query.limit) });

for (const [where, path] of [["home", "/app"], ["queue", "/app/queue"]]) {
  test(`R88 (C14, P2.3; ${where}): the doors and the vouch to-dos share one heldcaptures read, the picker with one limit of 500; the to-dos keep the rows whose actor is the member, all 201 of them`, async () => {
    const p = await open(path, { ...BASE, projectlist: LIST(THREE), heldcaptures: HELD(...MINE, ...THEIRS) });
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

  test(`R88 (C14, P2.3; ${where}): control: a member with three captures and nobody else's draws three, from the same one read`, async () => {
    const p = await open(path, { ...BASE, projectlist: LIST(THREE), heldcaptures: HELD(...MINE.slice(0, 3)) });
    await settle();
    assert.equal(p.byOp("heldcaptures").length, 1);
    assert.ok(text(p).includes(word("screen.home.todo.vouch", { count: "3", place: GATE })));
  });
}

test("R88 (C14, P2.3): vouching re-reads the one held-captures read, so the to-do and the door both go", async () => {
  let rows = MINE.slice(0, 2);
  const plane = { ...BASE, projectlist: LIST(THREE), heldcaptures: (req) => ok({ ok: true, held: rows, state: "held", truncated: false, next: null, limit: Number(req.query.limit) }),
    select: ok({ ok: true, handle: "SEL-1" }), release: () => { rows = []; return ok({ ok: true, released: 2 }); } };
  const p = await open("/app", plane);
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
  const p = await open("/app/finder", plane);
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
  const p = await open("/app/finder", { frontier: (req) => ok(per[req.query.level]), search: ok({ total: 0, hits: [] }) });
  await press(p, "frontier", { reason: "looking" });
  await settle();
  const rows = rowsOfLevels(p);
  assert.deepEqual(rows.map((r) => r.querySelectorAll("li").length), [2, 0, 0, 0], "two named, and a level counting zero draws no list");
  assert.equal(p.byOp("search").length, 0, "no title is looked up when every place names itself");
});

/* ---------- R90 (C23) and R92 (C81): measured in a browser ---------- */

const NAMES = ["The Coliseum lease and the sewer fund transfers", "Pothole repairs", "Odd", "Oakland Unified budget"];
const WIDE = NAMES.map((name, i) => PROJ("PROJ-" + i, name, { stage: ["investigating", "forming", null, "closed"][i], question_count: i, rescue_open: i === 1,
  owner: i % 2 ? null : { member: "M-1", handle: "dev" }, members: [{ member: "M-1", handle: "dev" }].concat(i ? [{ member: "M-2", handle: "rosa" }] : []),
  activity: [3, 5, 4, 6, 8, 7, 9, 11], lastChange: i === 2 ? null : "2026-10-12T15:00:00Z" }));
const FULL = { ...BASE, projectlist: LIST(WIDE), themeread: ok({ themes: [] }),
  queue: ok({ items: [{ id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch for 3 photos", due: "2026-10-12", assignee: "mai", assignee_role: "member", options: [], disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-7" } }], item_count: 1 }),
  heldcaptures: ok({ ok: true, held: [PICK("INF-H1", GATE, "mai")], state: "held", truncated: false, next: null }), inbox: ok({ inbox: [{ id: 1, status: "new" }] }) };
const MEASURE = (W) => ({ ...FIT(W), lefts: Array.from(document.querySelectorAll("#cs-main div.cs-ladder")).concat(Array.from(document.querySelectorAll("#cs-main span.cs-ladder"))).map((l) => Math.round(l.getBoundingClientRect().left)),
  tops: Array.from(document.querySelectorAll("#cs-main div.cs-ladder")).map((l) => Array.from(l.children).map((c) => Math.round(c.getBoundingClientRect().top))) });
const run = (path, width) => measure({ path, width, plane: FULL, ready: "#cs-main .cs-row", measure: new Function("W", `const FIT = ${FIT.toString()}; return (${MEASURE.toString()})(W);`) });

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
const PLACES = Array.from({ length: 5 }, (_, i) => PICK("INF-V" + i, "https://city.example/place-" + i, "mai"));
const QITEMS = [{ id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Check", assignee: "mai", subject: { kind: "bundle", id: "INF-7" }, options: [], disposition: { instead: "taskresolve" } },
  { id: "TSK-2", class: "OBLIGATION", kind: "check", summary: "Check too", assignee: "mai", subject: { kind: "bundle", id: "INF-8" }, options: [], disposition: { instead: "taskresolve" } }];

test("R91 (C70): the queue's count and the shell's badge include the vouch rows (one for each place), the page says how many, and Home's reading counts them", async () => {
  const withBand = { ...BASE, projectlist: LIST(THREE), queue: ok({ items: QITEMS, item_count: 2 }), heldcaptures: HELD(...PLACES) };
  const without = { ...withBand, heldcaptures: HELD() };
  const base = await open("/app/queue", without);
  await settle();
  const n0 = Number(badge(base));
  const q = await open("/app/queue", withBand);
  await settle();
  assert.equal(Number(badge(q)), n0 + 5, "the badge adds the band's five");
  assert.ok(text(q).includes(word("screen.queue.count.many", { n: String(2 + 5) })), "the page's count includes the band");
  assert.equal(main(q).querySelectorAll('button[data-act="release"]').length, 5, "and says each: five rows");
  const h = await open("/app", withBand);
  await settle();
  assert.equal(Number(badge(h)), n0 + 5, "Home reports the same band");
  assert.equal(text(h, main(h).querySelector(".mk-strip")), `7 ${word("screen.home.strip.you")}`, "Home's strip counts the five with the two");
  // Control: with no band the count and the badge are unchanged.
  assert.equal(Number(badge(await (async () => { const p = await open("/app", without); await settle(); return p; })())), n0);
  assert.ok(text(base).includes(word("screen.queue.count.many", { n: "2" })));
});

/* ---------- R93: an item standing for several notices closes them all ---------- */

const NEWER = (notices) => ({ id: "FINDING::newer::N-1", class: "FINDING", kind: "newer-capture-affects-reference", case: { ungrouped: true, ancestors: [] },
  subject: { kind: "notice", id: "N-1" }, summary: "A newer version", options: [], basis: { notices },
  disposition: { available: true, scope: "notice", notice: notices[0], acts: ["versionadopt", "versionkeep"] } });

for (const [where, path] of [["queue", "/app/queue"], ["home", "/app"]]) {
  test(`R93 (${where}): one press of Keep or Adopt is sent once for each notice the item stands for; control: an item of one notice sends one`, async () => {
    const plane = (items) => ({ ...BASE, projectlist: LIST(THREE), queue: ok({ items, item_count: items.length }), keepversion: ok({ ok: true }), adoptversion: ok({ ok: true }) });
    const p = await open(path, plane([NEWER(["N-1", "N-2", "N-3"])]));
    await settle();
    await press(p, "keepversion");
    assert.deepEqual(p.byOp("keepversion").map((r) => r.body.notice).sort(), ["N-1", "N-2", "N-3"], "every notice is closed");
    const a = await open(path, plane([NEWER(["N-1", "N-2"])]));
    await settle();
    const f = button(a, "adoptversion").dataset.f;
    await press(a, "adoptversion", { values: { [f + "-why"]: "It corrects the date" } });
    assert.deepEqual(a.byOp("adoptversion").map((r) => [r.body.notice, r.body.why]).sort(), [["N-1", "It corrects the date"], ["N-2", "It corrects the date"]], "the same reason for each");
    const one = await open(path, plane([NEWER(["N-1"])]));
    await settle();
    await press(one, "keepversion");
    assert.deepEqual(one.byOp("keepversion").map((r) => r.body.notice), ["N-1"]);
  });
}

test("R93: a refusal on one of the notices is shown once, and the rest are not sent after it", async () => {
  const p = await open("/app/queue", { ...BASE, projectlist: LIST(THREE), queue: ok({ items: [NEWER(["N-1", "N-2", "N-3"])], item_count: 1 }),
    keepversion: (req) => (req.body.notice === "N-2" ? refused("NOTICE_NOT_OPEN", "That notice is already closed.", 409) : ok({ ok: true })) });
  await settle();
  const b = await press(p, "keepversion");
  assert.deepEqual(p.byOp("keepversion").map((r) => r.body.notice), ["N-1", "N-2", "N-2"], "N-3 is not sent after the refused one, which stands as the act's own request");
  const said = beside(p, b);
  assert.ok(said.length > 0, "the refusal's words are drawn beside the act");
  assert.equal(text(p, main(p)).split(said).length - 1, 1, "once");
  assert.ok(b);
});

/* ---------- R94: an act re-reads only what it changes ---------- */

test("R94: the queue's acts name the reads they change: resolving a task re-reads the queue only, not the doors, the roster or the muted list", async () => {
  const items = [{ id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Check", assignee: "mai", subject: { kind: "bundle", id: "INF-7" }, options: [], disposition: { instead: "taskresolve" } }];
  const p = await open("/app/queue", { ...BASE, projectlist: LIST(THREE), queue: ok({ items, item_count: 1 }), taskresolve: ok({ ok: true }), heldcaptures: HELD(PICK("INF-H1", GATE, "mai")), inbox: ok({ inbox: [] }), memberlist: ok({ members: [] }) });
  await settle();
  const before = { held: p.byOp("heldcaptures").length, inbox: p.byOp("inbox").length, roster: p.byOp("memberlist").length, queue: p.byOp("queue").length };
  await press(p, "taskresolve");
  await settle();
  assert.equal(p.byOp("heldcaptures").length, before.held, "the held captures are not read again");
  assert.equal(p.byOp("inbox").length, before.inbox, "nor the inbox");
  assert.equal(p.byOp("memberlist").length, before.roster, "nor the roster");
  assert.ok(p.byOp("queue").length > before.queue, "the queue is");
  // Control: vouching changes the held captures, which are read again.
  const q = await open("/app/queue", { ...BASE, projectlist: LIST(THREE), queue: ok({ items: [], item_count: 0 }), heldcaptures: HELD(PICK("INF-H1", GATE, "mai")), select: ok({ ok: true, handle: "S" }), release: ok({ ok: true }) });
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

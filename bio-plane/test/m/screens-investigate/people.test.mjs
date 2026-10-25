/* screens-investigate R12, R13: the People directory, on interface-shell's served page over `store-request`'s world (K5148, K5054): the real store behind the page's
   door and a real sign-in. The people, bodies and documents are made by the member's own acts (`entitycreate`, `recordline`, `promote` of a held document, `resolve`,
   `officesseed`); the counts, rows and order a test asserts are read back from the directory the store answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { inWorld, openAs } from "./world.mjs";
import { main, actsIn, button, fill, press, rawKeys, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const REASON = "The minutes say so.";
const LATER = "2030-12-31";
const at = "/app/people";

/* ---- the member's own acts ---- */
const entity = async (as, kind, label, note = "Named in the minutes.", extra = {}) => (await as.act("entitycreate", { body: { kind, label, note, ...extra } })).entity_id;
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/** A held document whose reading names `names` (the reading the document's own promotion keeps, `extraction` R20), captured by the member's own upload, optionally
 *  held in `project`; then each name resolved to the subject of that name by the member's own `resolve`. */
async function holdNamed(world, me, name, text, names, project = "") {
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`, init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(text) } }, me);
  const doc = up.json.result.document;
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const id = (await me.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + sha,
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const reading = { content_type: "generic", reader_version: 1, found: true, at: now, facts: {},
    entities: names.map((n) => ({ ref: n, kind: "person", key: null, label: n, source: { kind: "pdf-page", page: 2, ref: "p3" } })) };
  const prov = JSON.stringify({ documents: [{ ...doc, reading, text_units: [{ extent: { kind: "pdf-page", page: 2 }, reference: "p3", text, truncated: false }] }] }, null, 1);
  const dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: sha256(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: sha256(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: sha256(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + sha256(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  for (const ref of names) await me.act("resolve", { body: { captureSha: sha, ref } });
  return { sha, bundle: made.bundleId || id };
}

/** A world with the team's profile active, a project of the member's own (she made it, so she works on it), a department and a director whose documents are held
 *  in the project, and the post she holds. The member is no administrator: the founder is `boss`. */
async function scene() {
  const { world, me: boss } = await inWorld();
  await world.recipes.profiles(boss, ["oakland-alameda"]);
  const me = await world.signIn("lead", { admin: false, capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(me, "Pothole repairs");
  const org = await entity(me, "body", "Public Works Department", "A city department · repairs streets and sewers");
  const chen = await entity(me, "person", "L. Chen", "Director of the department");
  const office = await entity(me, "office", "Director of Public Works", "The head of the department");
  const minutes = await holdNamed(world, me, "Council minutes.txt", "L. Chen presented the repair schedule.", ["L. Chen"], project);
  await holdNamed(world, me, "Staff report.txt", "L. Chen signed the transfers.", ["L. Chen"], project);
  await holdNamed(world, me, "Department notice.txt", "The Public Works Department repairs streets.", ["Public Works Department"]);
  const basis = { captureSha: minutes.sha, extent: { kind: "document" } };
  const valid = { from: "2022-03-01", to: LATER, precision: "day", zone: "UTC" };
  await me.act("recordline", { body: { kind: "post_in", from: office, to: org, basis, valid } });
  await me.act("recordline", { body: { kind: "holds", from: chen, to: office, capacity: "employee", basis, valid } });
  return { world, me, boss, project, org, chen, office, minutes };
}

const directory = (as, query = {}) => as.read("peopledirectory", { query: { limit: "50", ...query } });
const rowOf = (el, entityId) => [...el.querySelectorAll(".cs-row")].find((r) => r.querySelector(`a.cs-ref[href="/app/person/${entityId}"]`));
const todayOf = (r) => (r.today.posts || []).map((x) => [x.title || (x.office && x.office.label) || "", x.body && x.body.label ? x.body.label : ""].filter(Boolean).join(", ")).join("; ");
const countsOf = (r) => [r.documents && word("screen.people.count." + (r.documents === 1 ? "document" : "documents"), { n: String(r.documents) }),
  r.questions && word("screen.people.count." + (r.questions === 1 ? "question" : "questions"), { n: String(r.questions) }),
  r.projects && word("screen.people.count." + (r.projects === 1 ? "project" : "projects"), { n: String(r.projects) })].filter(Boolean).join(", ");

test("R12 the directory is people's peopledirectory, read whole at first; the counts line; the member's projects first, then the rest; never the group's members", async () => {
  const { world, me, chen, org } = await scene();
  const p = await openAs(world, me, at);
  const r = p.byOp("peopledirectory");
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].query.op, "peopledirectory");
  assert.deepEqual(Object.keys(r[0].query).filter((k) => k !== "op"), [], "nothing typed: the whole directory");
  const read = await directory(me);
  assert.equal(read.in_your_projects, 1, "the director's documents are held in the member's project");
  const m = main(p);
  drew(m, "screen.people.countline", { following: String(read.following), mine: String(read.in_your_projects) });
  const secs = m.querySelectorAll("section");
  const heads = secs.map((s) => s.querySelector("h2").textContent);
  const yours = word("screen.people.yours"), others = word("screen.people.others");
  assert.ok(heads.indexOf(yours) < heads.indexOf(others));
  assert.ok(secs[heads.indexOf(yours)].textContent.includes(read.rows.find((x) => x.entity === chen).name));
  assert.ok(secs[heads.indexOf(others)].textContent.includes(read.rows.find((x) => x.entity === org).name));
  assert.ok(m.querySelector('a[href="/app/members"]'), "the team's members are under Settings › Members");
});

test("R12 search: Name or office and the four filters read the directory again, as typed and chosen (control: a refused search is drawn, never as empty)", async () => {
  const { world, me, chen, org } = await scene();
  const p = await openAs(world, me, at);
  fill(p, { "people-q": "chen", "people-show": "people", "people-office": org, "people-named": "mine", "people-since": "90" });
  await press(p, "search");
  const r = p.byOp("peopledirectory");
  assert.equal(r.length, 2);
  assert.deepEqual({ q: r[1].query.q, show: r[1].query.show, office: r[1].query.office, namedIn: r[1].query.namedIn, since: r[1].query.since },
    { q: "chen", show: "people", office: org, namedIn: "mine", since: "90" });
  const found = await directory(me, { q: "chen", show: "people", office: org, namedIn: "mine", since: "90" });
  assert.deepEqual(found.rows.map((x) => x.entity), [chen], "the store finds her by the four filters");
  assert.ok(rowOf(main(p), chen), "and the page draws what the store found");
  assert.equal(p.doc.getElementById("people-q").getAttribute("aria-label") || p.doc.querySelector('label[for="people-q"]').textContent, word("screen.people.q"));
  /* the store refuses a search longer than it reads (people R37): drawn failed, never as empty */
  const q = await openAs(world, me, at);
  fill(q, { "people-q": "x".repeat(1000) });
  await press(q, "search");
  assert.ok(main(q).querySelector('[data-state="failed"]'));
  assert.equal(main(q).querySelector('[data-state="empty"]'), null);
});

test("R13 each row: the kind's mark, the name opening person, who they are today, the counts as answered, Explore connections", async () => {
  const { world, me, chen, org } = await scene();
  const p = await openAs(world, me, at);
  const read = await directory(me);
  const [cr, or] = [read.rows.find((x) => x.entity === chen), read.rows.find((x) => x.entity === org)];
  const m = main(p);
  const rows = m.querySelectorAll(".cs-row");
  assert.equal(rows.length, 2);
  const [a, b] = [rowOf(m, chen), rowOf(m, org)];
  assert.equal(a.querySelector('[data-kind="person"]').getAttribute("data-tip").length > 0, true);
  assert.ok(b.querySelector('[data-kind="organisation"]'));
  assert.equal(a.querySelector(`a.cs-ref[href="/app/person/${chen}"]`).textContent, cr.name);
  assert.ok(todayOf(cr).length > 0, "the store says who she is today");
  assert.ok(a.textContent.includes(todayOf(cr)), "who they are today, from the record");
  drew(a, "screen.people.counts", { list: countsOf(cr) });
  drew(a, "screen.people.newest", { date: dayOf(cr.newest_added.slice(0, 10)) });
  assert.ok(b.textContent.includes(or.today.note));
  drew(b, "screen.people.counts", { list: countsOf(or) });
  for (const k of ["screen.people.count.questions", "screen.people.count.projects"]) notDrew(b, k, { n: "0" }, "R22: no count is drawn at zero");
  await press(p, "explore", { el: a.querySelector('button[data-act="explore"]') });
  assert.equal(p.location.pathname, "/app/explore/" + chen);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R13 Add someone the record follows sends entitycreate with the name, the kind and the member's note, then opens them (control: no note sends nothing)", async () => {
  const { world, me } = await scene();
  const p = await openAs(world, me, at);
  fill(p, { "people-add-name": "K. Osei", "people-add-kind": "person", "people-add-note": "Budget Director; signs the transfers" });
  await press(p, "entitycreate", { reason: REASON });
  const b = p.byOp("entitycreate")[0].body;
  assert.deepEqual(b, { kind: "person", label: "K. Osei", note: "Budget Director; signs the transfers" });
  const made = (await me.read("entitybyalias", { query: { alias: "K. Osei" } }));
  const id = (made.entities || made.matches || []).map((e) => e.entity_id)[0];
  assert.ok(id, "the store holds the person");
  assert.equal(p.location.pathname, "/app/person/" + id);
  const q = await openAs(world, me, at);
  fill(q, { "people-add-name": "K. Osei" });
  await press(q, "entitycreate", { reason: REASON });
  assert.equal(q.byOp("entitycreate").length, 0);
  drew(main(q), "screen.people.add.empty");
});

test("R13 the two empty states: a record that follows no one yet, and a search that finds no one", async () => {
  const bare = await inWorld();
  const p = await openAs(bare.world, bare.me, at);
  drew(main(p), "screen.people.none");
  drew(main(p), "screen.people.none.how");
  assert.ok(main(p).querySelector('a[href="/app/capture"]'));
  assert.ok(button(p, "entitycreate"));
  const { world, me } = await scene();
  const q = await openAs(world, me, at);
  fill(q, { "people-q": "Alvarez" });
  await press(q, "search");
  assert.equal((await directory(me, { q: "Alvarez" })).rows.length, 0, "the store follows no one by that name");
  drew(main(q), "screen.people.nomatch", { q: "Alvarez" });
  assert.ok(main(q).querySelector('a[href="/app/finder"]'));
  assert.deepEqual(actsIn(main(q)).sort(), ["entitycreate", "search"]);
});

test("R15 people draws \"Added at setup from your group's place\" for an organisation row exactly when its today.machine is true, never by matching the note's text (K3177, N1050); control: a member's note ending \"seeded at setup.\" is drawn as her words", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  await me.act("officesseed", { body: {} });
  await entity(me, "body", "Public Works Department", "A city department · repairs streets and sewers");
  await entity(me, "body", "Harbour Trust", "Run by the port; it is seeded at setup.");
  const read = await directory(me);
  const seeded = read.rows.filter((r) => r.today.machine === true), written = read.rows.filter((r) => r.today.machine === false);
  assert.ok(seeded.length >= 1 && written.length === 2, "setup's seeding is the machine's; the members' notes are theirs");
  const p = await openAs(world, me, at);
  const m = main(p);
  const [a] = seeded.map((r) => rowOf(m, r.entity));
  drew(a, "screen.people.today.seeded");
  drew(a, "screen.people.today.kind.body");
  const machine = seeded[0].today.note;
  assert.ok(/jurisdiction profile|counterparties\[/.test(machine), "the seeded note is the machine's sentence");
  assert.doesNotMatch(p.root().textContent + m.innerHTML, /counterparties\[\d\]|oakland-alameda|jurisdiction profile/, "no machine note anywhere, card included");
  for (const r of written) {
    const row = rowOf(m, r.entity);
    assert.ok(row.textContent.includes(r.today.note), "a member's note is drawn as written, whatever it ends with");
    notDrew(row, "screen.people.today.seeded");
  }
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R25 with nothing followed people draws only its empty state (follows no one yet, with Add and Capture): no search, filters or counts; control: one follow draws the full screen", async () => {
  const { world, me } = await inWorld();
  const p = await openAs(world, me, at);
  const m = main(p);
  drew(m, "screen.people.none");
  assert.ok(m.querySelector('a[href="/app/capture"]'));
  assert.ok(button(p, "entitycreate"));
  assert.equal(p.doc.getElementById("people-q"), null, "no search box");
  assert.equal(p.doc.getElementById("people-show"), null, "no filters");
  assert.equal(button(p, "search"), null);
  notDrew(m, "screen.people.countline", { following: "0", mine: "0" });
  notDrew(m, "screen.people.countline.none", { following: "0" });
  await entity(me, "person", "L. Chen", "Director of the department");
  const q = await openAs(world, me, at);
  assert.ok(q.doc.getElementById("people-q"), "one follow draws the full screen");
  assert.ok(button(q, "search"));
  drew(main(q), "screen.people.show.organizations", undefined, "DEC-221's spelling");
});

test("R37 a seeded body draws its kind beside its name and the seeded line on a line of its own; a row no document names says so and offers no Explore connections; control: a row named in three documents keeps its counts and the act (R13)", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  await me.act("officesseed", { body: {} });
  await entity(me, "body", "Public Works", "repairs streets");
  for (const n of ["One", "Two", "Three"]) await holdNamed(world, me, `Notice ${n}.txt`, `Notice ${n}: Public Works repairs streets.`, ["Public Works"]);
  const read = await directory(me);
  const seeded = read.rows.find((r) => r.today.machine === true), named = read.rows.find((r) => r.name === "Public Works");
  assert.equal(seeded.documents, 0);
  assert.equal(named.documents, 3);
  const p = await openAs(world, me, at);
  const [a, b] = [rowOf(main(p), seeded.entity), rowOf(main(p), named.entity)];
  drew(a, "screen.people.today.kind.body");
  assert.ok(a.querySelector("[data-seeded]"), "the seeded line stands on its own");
  drew(a, "screen.people.counts.none");
  assert.equal(a.querySelectorAll('button[data-act="explore"]').length, 0, "no explore act for a row no document names");
  drew(b, "screen.people.counts", { list: countsOf(named) });
  assert.equal(b.querySelectorAll('button[data-act="explore"]').length, 1);
  assert.equal(main(p).querySelectorAll("section").filter((x) => x.querySelector("h2").textContent === word("screen.people.others")).length, 0, "no Everyone else heading while no project names anyone");
});

test("R37 the add form asks the name, then one two-way choice of a person or an organization, then the note, and its button is Follow them", async () => {
  const { world, me } = await inWorld();
  await entity(me, "person", "L. Chen", "Director of the department");
  const p = await openAs(world, me, at);
  const sel = p.doc.getElementById("people-add-kind");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.textContent), [word("screen.people.add.kind.person"), word("screen.people.add.kind.organization")]);
  assert.equal(p.doc.getElementById("people-add-name") !== null, true);
  assert.ok(button(p, "entitycreate").textContent.includes(word("screen.people.add.submit")));
});

/* R40, R42 (T51-120) */
async function otherKinds() {
  const { world, me } = await inWorld();
  const chen = await entity(me, "person", "L. Chen", "Director of the department");
  const fund = await entity(me, "fund", "Sewer Service Fund", "Pays for the sewers");
  const ordinance = await entity(me, "ordinance", "Tenant Notice Ordinance", "The city's rule on notices");
  const office = await entity(me, "office", "City Clerk", "Keeps the record");
  const one = await holdNamed(world, me, "Sewer report.txt", "The Sewer Service Fund paid for the lining.", ["Sewer Service Fund"]);
  await holdNamed(world, me, "Sewer budget.txt", "The Sewer Service Fund was adopted.", ["Sewer Service Fund"]);
  await me.act("recordline", { body: { kind: "holds", from: chen, to: office, capacity: "employee", basis: { captureSha: one.sha, extent: { kind: "document" } },
    valid: { from: "2022-03-01", to: LATER, precision: "day", zone: "UTC" } } });
  return { world, me, chen, fund, ordinance, office };
}

test("R40 the Show choice offers the record's other kinds; Everything lists a fund, an ordinance and an office with kind, counts and the office's holder; Offices lists the office alone; no row of these kinds draws Explore connections", async () => {
  const { world, me, chen, fund, ordinance, office } = await otherKinds();
  const p = await openAs(world, me, at);
  const sel = p.doc.getElementById("people-show");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.getAttribute("value")), ["both", "people", "organisations", "offices", "ordinances", "contracts", "funds", "sources", "everything"]);
  fill(p, { "people-show": "everything" });
  await press(p, "search");
  assert.equal(p.byOp("peopledirectory").pop().query.show, "everything");
  const all = await directory(me, { show: "everything" });
  const [fr, or, ofr] = [fund, ordinance, office].map((id) => all.rows.find((x) => x.entity === id));
  const m = main(p);
  drew(m, "screen.people.other.note");
  const sec = m.querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.people.other.heading"));
  assert.ok(sec);
  const [fundRow, ordRow, offRow] = [fr, or, ofr].map((r) => rowOf(sec, r.entity));
  drew(fundRow, "screen.people.today.kind.fund");
  drew(fundRow, "screen.people.counts", { list: countsOf({ documents: fr.documents }) });
  drew(ordRow, "find.row.kind.ordinance");
  drew(ordRow, "screen.people.counts.none");
  drew(offRow, "screen.people.today.heldby", { who: ofr.holders.map((h) => h.label).join(", ") });
  assert.deepEqual(ofr.holders.map((h) => h.entity), [chen]);
  for (const r of [fundRow, ordRow, offRow]) assert.equal(r.querySelectorAll('button[data-act="explore"]').length, 0, "no explore in the list for these kinds");
  fill(p, { "people-show": "offices" });
  await press(p, "search");
  const offices = await directory(me, { show: "offices" });
  assert.deepEqual(offices.rows.map((x) => x.entity), [office]);
  const rows = [...main(p).querySelectorAll(".cs-row")];
  assert.ok(rows.some((r) => r.textContent.includes(ofr.name)) && !rows.some((r) => r.textContent.includes(fr.name)), "the office alone");
});

test("R40 with the record following no one of the kind chosen the screen draws no heading and no sentence of its own, keeps the filters and the add form", async () => {
  const { world, me } = await inWorld();
  await entity(me, "person", "L. Chen", "Director of the department");
  const p = await openAs(world, me, at);
  fill(p, { "people-show": "funds" });
  await press(p, "search");
  assert.equal((await directory(me, { show: "funds" })).rows.length, 0, "the store follows no fund");
  const m = main(p);
  assert.equal(m.querySelectorAll("section").filter((x) => x.querySelector("h2").textContent === word("screen.people.other.heading")).length, 0);
  assert.ok(p.doc.getElementById("people-show") && p.doc.getElementById("people-q"), "the filters stay");
  assert.ok(button(p, "entitycreate"), "the add form stays");
  notDrew(m, "screen.people.nomatch", { q: "" });
});

test("R42 with a kind other than people in view \"Add\" is the state g form: the near-match read is made after a name is typed (never entitycreate before the press), close names are listed, and Follow it sends entitycreate with the kind, aliases and note; the new subject opens", async () => {
  const { world, me, fund } = await otherKinds();
  const p = await openAs(world, me, at);
  fill(p, { "people-show": "everything" });
  await press(p, "search");
  assert.ok(p.doc.getElementById("people-other-name"), "state g");
  assert.equal(p.doc.getElementById("people-add-kind"), null, "no two-way form");
  assert.ok(![...p.doc.getElementById("people-other-kind").querySelectorAll("option")].some((o) => o.getAttribute("value") === "proceeding"), "no A proceeding in the form");
  await p.clock.tick(1000);
  assert.equal(p.byOp("entitysimilar").length, 0, "nothing typed, nothing asked");
  fill(p, { "people-other-name": "Sewer Service Fund", "people-other-kind": "fund" });
  p.fire(p.doc.getElementById("people-other-name"), "input");
  await p.clock.tick(1000);
  const q = p.byOp("entitysimilar")[0].query;
  assert.deepEqual([q.name, q.kind], ["Sewer Service Fund", "fund"]);
  const near = await me.read("entitysimilar", { query: { name: "Sewer Service Fund", kind: "fund", limit: "10" } });
  assert.deepEqual(near.similar.map((x) => x.entity_id), [fund], "the store knows the close name");
  assert.equal(p.byOp("entitycreate").length, 0, "no registration before the press");
  drew(main(p), "screen.people.addother.preflight", { name: "Sewer Service Fund" });
  drew(main(p), "people.nearmatch." + (["same", "contains", "spelling"].includes(near.similar[0].closeness) ? near.similar[0].closeness : "same"));
  assert.ok(main(p).textContent.includes(near.similar[0].label));
  fill(p, { "people-other-aliases": "Fund 41\n Fund 41 \nSSF", "people-other-note": "Pays for the sewers; the team follows its transfers." });
  await press(p, "entitycreate", { reason: REASON });
  assert.deepEqual(p.byOp("entitycreate")[0].body, { kind: "fund", label: "Sewer Service Fund", note: "Pays for the sewers; the team follows its transfers.", aliases: ["Fund 41", "SSF"] });
  const made = (await me.read("entitybyalias", { query: { alias: "SSF" } }));
  const id = (made.entities || made.matches || []).map((e) => e.entity_id)[0];
  assert.ok(id && id !== fund, "the store holds the new subject under its alias");
  assert.equal(p.location.pathname, "/app/person/" + id);
});

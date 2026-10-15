/* screens-investigate R12, R13: the People directory, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, DIRECTORY, ENT, ORG, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/people";

test("R12 the directory is people's peopledirectory, read whole at first; the counts line; the member's projects first, then the rest; never the group's members", async () => {
  const p = await open(at);
  const r = p.byOp("peopledirectory");
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].query.op, "peopledirectory");
  assert.deepEqual(Object.keys(r[0].query).filter((k) => k !== "op"), [], "nothing typed: the whole directory");
  const m = main(p);
  drew(m, "screen.people.countline", { following: "3", mine: "1" });
  const secs = m.querySelectorAll("section");
  const heads = secs.map((s) => s.querySelector("h2").textContent);
  const yours = word("screen.people.yours"), others = word("screen.people.others");
  assert.ok(heads.indexOf(yours) < heads.indexOf(others));
  assert.ok(secs[heads.indexOf(yours)].textContent.includes("L. Chen"));
  assert.ok(secs[heads.indexOf(others)].textContent.includes("Public Works Department"));
  assert.ok(m.querySelector('a[href="/app/members"]'), "the group's members are under Settings › Members");
});

test("R12 search: Name or office and the four filters read the directory again, as typed and chosen (control: a refused search is drawn, never as empty)", async () => {
  const p = await open(at);
  fill(p, { "people-q": "chen", "people-show": "people", "people-office": ORG, "people-named": "mine", "people-since": "90" });
  await press(p, "search");
  const r = p.byOp("peopledirectory");
  assert.equal(r.length, 2);
  assert.deepEqual({ q: r[1].query.q, show: r[1].query.show, office: r[1].query.office, namedIn: r[1].query.namedIn, since: r[1].query.since },
    { q: "chen", show: "people", office: ORG, namedIn: "mine", since: "90" });
  assert.equal(p.doc.getElementById("people-q").getAttribute("aria-label") || p.doc.querySelector('label[for="people-q"]').textContent, word("screen.people.q"));
  const q = await open(at, { plane: { peopledirectory: (req) => (req.query.q ? refusedIn("BAD_ARGUMENT", "The search could not be read.") : ok(DIRECTORY())) } });
  fill(q, { "people-q": "x".repeat(3) });
  await press(q, "search");
  assert.ok(main(q).querySelector('[data-state="failed"]'));
  assert.equal(main(q).querySelector('[data-state="empty"]'), null);
});

test("R13 each row: the kind's mark, the name opening person, who they are today, the counts as answered, Explore connections", async () => {
  const p = await open(at);
  const m = main(p);
  const rows = m.querySelectorAll(".cs-row");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].querySelector('[data-kind="person"]').getAttribute("data-tip").length > 0, true);
  assert.ok(rows[1].querySelector('[data-kind="organisation"]'));
  assert.equal(rows[0].querySelector(`a.cs-ref[href="/app/person/${ENT}"]`).textContent, "L. Chen");
  assert.ok(rows[0].textContent.includes("Director of Public Works, Public Works Department"), "who they are today, from the record");
  drew(rows[0], "screen.people.counts", { list: [word("screen.people.count.documents", { n: "14" }), word("screen.people.count.questions", { n: "2" }), word("screen.people.count.project", { n: "1" })].join(", ") });
  drew(rows[0], "screen.people.newest", { date: dayOf("2026-10-02") });
  assert.ok(rows[1].textContent.includes("A city department"));
  drew(rows[1], "screen.people.counts", { list: word("screen.people.count.documents", { n: "11" }) });
  for (const k of ["screen.people.count.questions", "screen.people.count.projects"]) notDrew(rows[1], k, { n: "0" }, "R22: no count is drawn at zero");
  await press(p, "explore", { el: rows[0].querySelector('button[data-act="explore"]') });
  assert.equal(p.location.pathname, "/app/explore/" + ENT);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R13 Add someone the record follows sends entitycreate with the name, the kind and the member's note, then opens them (control: no note sends nothing)", async () => {
  const p = await open(at, { plane: { entitycreate: ok({ ok: true, entity_id: "ENT-2026-0900", kind: "person" }) } });
  fill(p, { "people-add-name": "K. Osei", "people-add-kind": "person", "people-add-note": "Budget Director; signs the transfers" });
  await press(p, "entitycreate");
  const b = p.byOp("entitycreate")[0].body;
  assert.deepEqual(b, { kind: "person", label: "K. Osei", note: "Budget Director; signs the transfers" });
  assert.equal(p.location.pathname, "/app/person/ENT-2026-0900");
  const q = await open(at);
  fill(q, { "people-add-name": "K. Osei" });
  await press(q, "entitycreate");
  assert.equal(q.byOp("entitycreate").length, 0);
  drew(main(q), "screen.people.add.empty");
});

test("R13 the two empty states: a record that follows no one yet, and a search that finds no one", async () => {
  const none = ok({ ok: true, following: 0, in_your_projects: 0, rows: [], truncated: false });
  const p = await open(at, { plane: { peopledirectory: none } });
  drew(main(p), "screen.people.none");
  drew(main(p), "screen.people.none.how");
  assert.ok(main(p).querySelector('a[href="/app/capture"]'));
  assert.ok(button(p, "entitycreate"));
  const q = await open(at, { plane: { peopledirectory: (r) => (r.query.q ? none : ok(DIRECTORY())) } });
  fill(q, { "people-q": "Alvarez" });
  await press(q, "search");
  drew(main(q), "screen.people.nomatch", { q: "Alvarez" });
  assert.ok(main(q).querySelector('a[href="/app/finder"]'));
  assert.deepEqual(actsIn(main(q)).sort(), ["entitycreate", "search"]);
});

test("R15 people draws \"Added at setup from your group's place\" for an organisation row exactly when its today.machine is true, never by matching the note's text (K3177, N1050); control: a member's note ending \"seeded at setup.\" is drawn as her words", async () => {
  const seeded = "An office an action may be addressed to, as the active jurisdiction profile oakland-alameda, counterparties[0] (basis: x) names it; seeded at setup.";
  const rows = [{ entity: "ENT-2026-0400", kind: "office", name: "City Clerk", today: { kind: "office", sector: null, note: seeded, note_by: "class:instance-setup", machine: true }, documents: 3, questions: 0, projects: 0, newest_added: null, mine: false },
    { entity: "ENT-2026-0401", kind: "body", name: "Public Works Department", today: { kind: "body", sector: "government", note: "A city department · repairs streets and sewers", note_by: "member:mai", machine: false }, documents: 1, questions: 0, projects: 0, newest_added: null, mine: false },
    { entity: "ENT-2026-0402", kind: "body", name: "Harbour Trust", today: { kind: "body", sector: null, note: "Run by the port; it is seeded at setup.", note_by: "member:dev", machine: false }, documents: 1, questions: 0, projects: 0, newest_added: null, mine: false }];
  const p = await open(at, { plane: { peopledirectory: ok(DIRECTORY({ rows, following: 3, in_your_projects: 0 })) } });
  const m = main(p);
  const [a, b, c] = m.querySelectorAll(".cs-row");
  assert.ok(a.textContent.includes("City Clerk · " + word("screen.people.today.seeded")));
  assert.doesNotMatch(p.root().textContent + m.innerHTML, /counterparties\[0\]|oakland-alameda|jurisdiction profile/, "no machine note anywhere, card included");
  assert.ok(b.textContent.includes("A city department · repairs streets and sewers"));
  notDrew(b, "screen.people.today.seeded");
  assert.ok(c.textContent.includes("Run by the port; it is seeded at setup."), "a member's note is drawn as written, whatever it ends with");
  notDrew(c, "screen.people.today.seeded");
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R25 with nothing followed people draws only its empty state (follows no one yet, with Add and Capture): no search, filters or counts; control: one follow draws the full screen", async () => {
  const none = ok({ ok: true, following: 0, in_your_projects: 0, rows: [], truncated: false });
  const p = await open(at, { plane: { peopledirectory: none } });
  const m = main(p);
  drew(m, "screen.people.none");
  assert.ok(m.querySelector('a[href="/app/capture"]'));
  assert.ok(button(p, "entitycreate"));
  assert.equal(p.doc.getElementById("people-q"), null, "no search box");
  assert.equal(p.doc.getElementById("people-show"), null, "no filters");
  assert.equal(button(p, "search"), null);
  notDrew(m, "screen.people.countline", { following: "0", mine: "0" });
  notDrew(m, "screen.people.countline.none", { following: "0" });
  const one = ok(DIRECTORY({ rows: [DIRECTORY().rows[0]], following: 1, in_your_projects: 1 }));
  const q = await open(at, { plane: { peopledirectory: one } });
  assert.ok(q.doc.getElementById("people-q"), "one follow draws the full screen");
  assert.ok(button(q, "search"));
  drew(main(q), "screen.people.show.organizations", undefined, "DEC-221's spelling");
});

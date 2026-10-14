/* screens-investigate R12, R13: the People directory, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, rawKeys, DIRECTORY, ENT, ORG } from "./fixtures.mjs";

const at = "/app/people";

test("R12 the directory is people's peopledirectory, read whole at first; the counts line; the member's projects first, then the rest; never the group's members", async () => {
  const p = await open(at);
  const r = p.byOp("peopledirectory");
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].query.op, "peopledirectory");
  assert.deepEqual(Object.keys(r[0].query).filter((k) => k !== "op"), [], "nothing typed: the whole directory");
  const m = main(p);
  assert.match(m.textContent, /The record follows 3 people and organisations; 1 are named in your projects/);
  const secs = m.querySelectorAll("section");
  const heads = secs.map((s) => s.querySelector("h2").textContent);
  assert.ok(heads.indexOf("In your projects") < heads.indexOf("Everyone else the record follows"));
  assert.match(secs[heads.indexOf("In your projects")].textContent, /L\. Chen/);
  assert.match(secs[heads.indexOf("Everyone else the record follows")].textContent, /Public Works Department/);
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
  assert.equal(p.doc.getElementById("people-q").getAttribute("aria-label") || p.doc.querySelector('label[for="people-q"]').textContent, "Name or office");
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
  assert.match(rows[0].textContent, /Director of Public Works, Public Works Department/);
  assert.match(rows[0].textContent, /named in 14 documents, 2 questions and 1 projects · newest added 2 October 2026/);
  assert.match(rows[1].textContent, /A city department/);
  assert.match(rows[1].textContent, /named in 11 documents, in no question or project yet/);
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
  assert.match(main(q).textContent, /Give their name and your note/);
});

test("R13 the two empty states: a record that follows no one yet, and a search that finds no one", async () => {
  const none = ok({ ok: true, following: 0, in_your_projects: 0, rows: [], truncated: false });
  const p = await open(at, { plane: { peopledirectory: none } });
  assert.match(main(p).textContent, /Your group's record follows no one yet\..*ties a name in a captured document/s);
  assert.ok(main(p).querySelector('a[href="/app/capture"]'));
  assert.ok(button(p, "entitycreate"));
  const q = await open(at, { plane: { peopledirectory: (r) => (r.query.q ? none : ok(DIRECTORY())) } });
  fill(q, { "people-q": "Alvarez" });
  await press(q, "search");
  assert.match(main(q).textContent, /No one the record follows matches “Alvarez”\./);
  assert.ok(main(q).querySelector('a[href="/app/finder"]'));
  assert.deepEqual(actsIn(main(q)).sort(), ["entitycreate", "search"]);
});

test("R13 a row never draws a record's machine note: an office seeded at setup reads \"Added at setup from your group's place\" (K3177); a member's own note is drawn as written (control)", async () => {
  const seeded = "An office an action may be addressed to, as the active jurisdiction profile oakland-alameda, counterparties[0] (basis: x) names it; seeded at setup.";
  const rows = [{ entity: "ENT-2026-0400", kind: "office", name: "City Clerk", today: { kind: "office", sector: null, note: seeded }, documents: 0, questions: 0, projects: 0, newest_added: null, mine: false },
    { entity: "ENT-2026-0401", kind: "body", name: "Public Works Department", today: { kind: "body", sector: "government", note: "A city department · repairs streets and sewers" }, documents: 1, questions: 0, projects: 0, newest_added: null, mine: false }];
  const p = await open(at, { plane: { peopledirectory: ok(DIRECTORY({ rows, following: 2, in_your_projects: 0 })) } });
  const m = main(p);
  const [a, b] = m.querySelectorAll(".cs-row");
  assert.match(a.textContent, /City Clerk · Added at setup from your group's place/);
  assert.doesNotMatch(p.root().textContent + m.innerHTML, /seeded at setup|counterparties\[0\]|oakland-alameda|jurisdiction profile/, "no machine note anywhere, card included");
  assert.match(b.textContent, /A city department · repairs streets and sewers/);
  assert.deepEqual(rawKeys(p.root()), []);
});

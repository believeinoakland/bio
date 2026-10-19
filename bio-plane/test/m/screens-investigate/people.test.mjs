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
  assert.ok(m.querySelector('a[href="/app/members"]'), "the team's members are under Settings › Members");
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
  assert.ok(a.textContent.includes("City Clerk"));
  drew(a, "screen.people.today.seeded");
  drew(a, "screen.people.today.kind.office");
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

test("R37 a seeded office draws its kind beside its name and the seeded line on a line of its own; a row no document names says so and offers no Explore connections; control: a row named in three documents keeps its counts and the act (R13)", async () => {
  const rows = [{ entity: "ENT-2026-0400", kind: "office", name: "City Clerk", today: { kind: "office", note: "x", machine: true }, documents: 0, questions: 0, projects: 0, newest_added: "2026-09-01T09:00:00Z", mine: false },
    { entity: "ENT-2026-0401", kind: "body", name: "Public Works", today: { kind: "body", note: "repairs streets", machine: false }, documents: 3, questions: 0, projects: 0, newest_added: "2026-09-02T09:00:00Z", mine: false }];
  const p = await open(at, { plane: { peopledirectory: ok(DIRECTORY({ rows, following: 2, in_your_projects: 0 })) } });
  const [a, b] = main(p).querySelectorAll(".cs-row");
  drew(a, "screen.people.today.kind.office");
  assert.ok(a.querySelector("[data-seeded]"), "the seeded line stands on its own");
  drew(a, "screen.people.counts.none");
  assert.equal(a.querySelectorAll('button[data-act="explore"]').length, 0, "no explore act for a row no document names");
  drew(b, "screen.people.counts", { list: word("screen.people.count.documents", { n: "3" }) });
  assert.equal(b.querySelectorAll('button[data-act="explore"]').length, 1);
  assert.equal(main(p).querySelectorAll("section").filter((x) => x.querySelector("h2").textContent === word("screen.people.others")).length, 0, "no Everyone else heading while no project names anyone");
});

test("R37 the add form asks the name, then one two-way choice of a person or an organization, then the note, and its button is Follow them", async () => {
  const p = await open(at);
  const sel = p.doc.getElementById("people-add-kind");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.textContent), [word("screen.people.add.kind.person"), word("screen.people.add.kind.organization")]);
  assert.equal(p.doc.getElementById("people-add-name") !== null, true);
  assert.ok(button(p, "entitycreate").textContent.includes(word("screen.people.add.submit")));
});

/* R40, R42 (T51-120) */
const OTHERS = () => [
  { entity: "ENT-2026-0500", kind: "fund", name: "Sewer Service Fund", today: { kind: "fund", note: "Pays for the sewers", machine: false }, documents: 2, questions: 0, projects: 0, newest_added: "2026-09-03T09:00:00Z", mine: false },
  { entity: "ENT-2026-0501", kind: "ordinance", name: "Tenant Notice Ordinance", today: { note: "The city's rule on notices", machine: false }, documents: 0, questions: 0, projects: 0, newest_added: "2026-09-02T09:00:00Z", mine: false },
  { entity: "ENT-2026-0502", kind: "office", name: "City Clerk", today: { kind: "office", note: "Keeps the record", machine: false }, holders: [{ entity: ENT, label: "L. Chen" }], documents: 4, questions: 0, projects: 0, newest_added: "2026-09-01T09:00:00Z", mine: false }];
const dirBy = (req) => {
  const show = req.query.show;
  const all = OTHERS();
  const rows = show === "offices" ? all.filter((r) => r.kind === "office") : show === "everything" ? [...DIRECTORY().rows, ...all] : DIRECTORY().rows;
  return ok(DIRECTORY({ rows, following: rows.length }));
};

test("R40 the Show choice offers the record's other kinds; Everything lists a fund, an ordinance and an office with kind, counts and the office's holder; Offices lists the office alone; no row of these kinds draws Explore connections", async () => {
  const p = await open(at, { plane: { peopledirectory: dirBy } });
  const sel = p.doc.getElementById("people-show");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.getAttribute("value")), ["both", "people", "organisations", "offices", "ordinances", "contracts", "funds", "sources", "everything"]);
  fill(p, { "people-show": "everything" });
  await press(p, "search");
  assert.equal(p.byOp("peopledirectory").pop().query.show, "everything");
  const m = main(p);
  drew(m, "screen.people.other.note");
  const sec = m.querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.people.other.heading"));
  assert.ok(sec);
  const [fund, ord, off] = [...m.querySelectorAll(".cs-row")].filter((r) => ["Sewer Service Fund", "Tenant Notice Ordinance", "City Clerk"].some((n) => r.textContent.includes(n)));
  drew(fund, "screen.people.today.kind.fund");
  drew(fund, "screen.people.counts", { list: word("screen.people.count.documents", { n: "2" }) });
  drew(ord, "find.row.kind.ordinance");
  drew(ord, "screen.people.counts.none");
  drew(off, "screen.people.today.heldby", { who: "L. Chen" });
  for (const r of [fund, ord, off]) assert.equal(r.querySelectorAll('button[data-act="explore"]').length, 0, "no explore in the list for these kinds");
  fill(p, { "people-show": "offices" });
  await press(p, "search");
  const rows = [...main(p).querySelectorAll(".cs-row")];
  assert.ok(rows.some((r) => r.textContent.includes("City Clerk")) && !rows.some((r) => r.textContent.includes("L. Chen") && !r.textContent.includes("City Clerk")), "the office alone");
});

test("R40 with the record following no one of the kind chosen the screen draws no heading and no sentence of its own, keeps the filters and the add form", async () => {
  const p = await open(at, { plane: { peopledirectory: (req) => (req.query.show === "funds" ? ok({ ok: true, following: 0, in_your_projects: 0, rows: [], truncated: false }) : ok(DIRECTORY())) } });
  fill(p, { "people-show": "funds" });
  await press(p, "search");
  const m = main(p);
  assert.equal(m.querySelectorAll("section").filter((x) => x.querySelector("h2").textContent === word("screen.people.other.heading")).length, 0);
  assert.ok(p.doc.getElementById("people-show") && p.doc.getElementById("people-q"), "the filters stay");
  assert.ok(button(p, "entitycreate"), "the add form stays");
  notDrew(m, "screen.people.nomatch", { q: "" });
});

test("R42 with a kind other than people in view \"Add\" is the state g form: the near-match read is made after a name is typed (never entitycreate before the press), close names are listed, and Follow it sends entitycreate with the kind, aliases and note; the new subject opens", async () => {
  const similar = ok({ ok: true, name: "Sewer Service Fund", kinds: [], count: 1, limit: 10, truncated: false,
    similar: [{ entity_id: "ENT-2026-0500", kind: "fund", label: "Sewer Fund", note: "Pays for the sewers", alias: "Sewer Fund", closeness: "contains" }] });
  const p = await open(at, { plane: { peopledirectory: dirBy, entitysimilar: similar, entitycreate: ok({ ok: true, entity_id: "ENT-2026-0600", kind: "fund" }) } });
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
  assert.equal(p.byOp("entitycreate").length, 0, "no registration before the press");
  drew(main(p), "screen.people.addother.preflight", { name: "Sewer Service Fund" });
  drew(main(p), "people.nearmatch.contains");
  assert.ok(main(p).textContent.includes("Sewer Fund"));
  fill(p, { "people-other-aliases": "Fund 41\n Fund 41 \nSSF", "people-other-note": "Pays for the sewers; the team follows its transfers." });
  await press(p, "entitycreate");
  assert.deepEqual(p.byOp("entitycreate")[0].body, { kind: "fund", label: "Sewer Service Fund", note: "Pays for the sewers; the team follows its transfers.", aliases: ["Fund 41", "SSF"] });
  assert.equal(p.location.pathname, "/app/person/ENT-2026-0600");
});

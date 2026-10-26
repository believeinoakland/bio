/* people's directory lists the record's other kinds at its interface: R41 (T51; DEC-330 A50; `screen.people.show.*`; amends
   R37, R38): offices, ordinances, contracts, funds (fund and program), sources and everything but proceedings. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUT } from "./fixture.mjs";
import { DIRECTORY_SHOW, DIRECTORY_MAX, DIRECTORY_HOLDERS_MAX } from "../../../src/people/index.mjs";

const span = (from, to) => ({ from, to });
const all = (w, args) => w.p.peopleDirectory({ limit: DIRECTORY_MAX, ...args });
const rowOf = (r, id) => r.rows.find((x) => x.entity === id);

/* A name in a captured document tied to an entity (entities R12's testimony), the capture registered at `registered`. */
function name(w, entity, c, { registered = null } = {}) {
  const ref = `name:${entity}`;
  w.st.sql.exec(`INSERT OR IGNORE INTO reading_refs (capture_sha, bundle_id, ref, ref_kind, ref_key, label) VALUES (?,?,?,?,?,?)`,
                c.captureSha, c.bundle, ref, "name", entity, entity);
  const r = w.real.testify({ captureSha: c.captureSha, ref, entityId: entity, basis: "the test names them", resolvedBy: ANN });
  assert.equal(r.ok, true, JSON.stringify(r));
  if (registered) w.st.sql.exec(`UPDATE register SET registered=? WHERE capture_sha=?`, registered, c.captureSha);
}

/* A record with one of each kind: a person who holds an office, an ordinance, a contract, a fund, a program, a source, a
   parcel and a proceeding; the fund named in a fenced project's document. */
function record() {
  const w = world();
  const chen = w.person("Lee Chen", ["L. Chen"]);
  const works = w.entity("institution", "Public Works Department", { sector: "government" });
  const director = w.entity("office", "Director of Public Works");
  w.line("post_in", director, works, span("2020-01-01", "2030-12-31"));
  w.line("holds", chen, director, span("2022-03-01", "2027-03-01"), { title: "Director of Public Works" });
  const ordinance = w.entity("ordinance", "Harbour Fees Ordinance");
  const contract = w.entity("contract", "Dredging Contract 7");
  const fund = w.entity("fund", "Harbour Reserve Fund");
  const program = w.entity("program", "Dock Repair Program");
  const source = w.entity("source", "A tipster");
  const parcel = w.entity("parcel", "Parcel 12");
  const forum = w.entity("body", "Superior Court", { forum_kind: "court" });
  const proceeding = w.entities.createEntity({ kind: "proceeding", label: "Harbour Inquiry 1", note: "a proceeding the test registers", declaredBy: ANN,
    proceeding: { forum, kind: "harbour_inquiry", number: "1" } }).entity_id;
  const open = w.capture("fee schedule"), fenced = w.capture("reserve ledger", { fenced: true });
  name(w, fund, open, { registered: "2026-02-20T00:00:00Z" });
  name(w, fund, fenced, { registered: "2026-02-25T00:00:00Z" });
  name(w, ordinance, open);
  name(w, director, open);
  return { w, chen, works, director, ordinance, contract, fund, program, source, parcel, proceeding, project: w.project() };
}

test("R41 show lists the record's other kinds: a fund, an ordinance and an office each listed under everything with their counts, offices listing only the office with its holder; control: people lists none of them, the office filter lists none, a project hidden from the viewer counts for nothing", () => {
  const { w, chen, works, director, ordinance, fund, project } = record();
  const ids = (args) => all(w, { viewer: OUT, ...args }).rows.map((x) => x.entity).sort();
  const every = all(w, { show: "everything", viewer: OUT });
  for (const e of [fund, ordinance, director]) assert.ok(rowOf(every, e), `${e} listed under everything`);
  assert.deepEqual([rowOf(every, fund).kind, rowOf(every, ordinance).kind, rowOf(every, director).kind], ["fund", "ordinance", "office"]);
  /* the duties world registers some subjects of its own: a value lists exactly its kinds, among them this record's */
  assert.ok(ids({ show: "offices" }).includes(director));
  assert.deepEqual([...new Set(all(w, { show: "offices", viewer: OUT }).rows.map((r) => r.kind))], ["office"], "offices lists only offices");
  assert.deepEqual(rowOf(all(w, { show: "offices", viewer: OUT }), director).holders, [{ entity: chen, label: "Lee Chen" }]);
  for (const show of ["people", "organisations", "both"]) {
    const got = ids({ show });
    for (const e of [fund, ordinance, director]) assert.ok(!got.includes(e), `control: ${show} lists no ${e}`);
  }
  assert.deepEqual(ids({}), ids({ show: "both" }), "the default is unchanged");
  const held = all(w, { show: "everything", office: works, viewer: OUT });
  assert.deepEqual(held.rows.map((r) => [r.entity, r.kind]), [[chen, "person"]], "the office filter keeps persons only: no row of another kind");
  /* the counts: the fund is named in two documents, the second in a project the outsider may not see */
  const out = rowOf(every, fund), ann = rowOf(all(w, { show: "everything", viewer: ANN }), fund);
  assert.deepEqual([out.documents, out.projects, out.mine], [1, 0, false], "control: the hidden project's mention counts for nothing");
  assert.deepEqual([ann.documents, ann.projects], [2, 1], "the participant sees both");
  assert.ok(!JSON.stringify(every).includes(project), "the hidden project is never named");
  assert.equal(out.newest_added, "2026-02-20T00:00:00.000Z");
  assert.deepEqual(Object.keys(out).sort(), ["documents", "entity", "kind", "mine", "name", "newest_added", "projects", "questions", "today"],
    "R37's row; only an office row adds holders");
  assert.equal("holders" in rowOf(every, ordinance), false);
});

test("R41 each value lists exactly its kinds: ordinances, contracts, funds (fund and program), sources; everything lists every kind of entities R1 but proceeding; q matches a name or a name it is also known by", () => {
  const { w, chen, works, director, ordinance, contract, fund, program, source, parcel, proceeding } = record();
  const ids = (args) => all(w, { viewer: ANN, ...args }).rows.map((x) => x.entity).sort();
  const kindsOf = (show) => [...new Set(all(w, { show, viewer: ANN }).rows.map((r) => r.kind))].sort();
  /* the duties world registers some subjects of its own: each value lists exactly its kinds, among them this record's */
  const mine = [chen, works, director, ordinance, contract, fund, program, source, parcel];
  const ownIds = (args) => ids(args).filter((e) => mine.includes(e));
  assert.deepEqual([ownIds({ show: "ordinances" }), kindsOf("ordinances")], [[ordinance], ["ordinance"]]);
  assert.deepEqual([ownIds({ show: "contracts" }), kindsOf("contracts")], [[contract], ["contract"]]);
  assert.deepEqual([ownIds({ show: "funds" }), kindsOf("funds")], [[fund, program].sort(), ["fund", "program"]]);
  assert.deepEqual([ownIds({ show: "sources" }), kindsOf("sources")], [[source], ["source"]]);
  const every = ownIds({ show: "everything" });
  assert.deepEqual(every, [...mine].sort());
  assert.ok(!kindsOf("everything").includes("proceeding"));
  assert.ok(!every.includes(proceeding), "a proceeding has its own screen");
  assert.ok(![...DIRECTORY_SHOW].includes("proceedings"));
  assert.deepEqual(ids({ show: "everything", q: "reserve" }), [fund]);
  assert.equal(w.entities.addAlias({ entityId: fund, alias: "The Rainy Day Pot", by: ANN }).ok, true);
  assert.deepEqual(ids({ show: "funds", q: "rainy day" }), [fund], "a name it is also known by");
  assert.deepEqual(ids({ show: "funds", q: "ordinance" }), [], "control: another kind's name");
  /* today for another kind is what it is: its note, with who wrote it and whether a machine did (R38) */
  const row = rowOf(all(w, { show: "contracts", viewer: ANN }), contract);
  assert.deepEqual([row.today.kind, row.today.note, row.today.note_by, row.today.machine], ["contract", "a subject the test registers", ANN, false]);
  /* paging to the end across the other kinds: no skip, no repeat */
  const seen = [];
  for (let cursor = null, n = 0; n < 20; n++) {
    const page = w.p.peopleDirectory({ show: "everything", limit: 3, cursor, viewer: ANN });
    seen.push(...page.rows.map((r) => r.entity));
    if (!page.truncated) break;
    cursor = page.cursor;
  }
  assert.deepEqual([...seen].sort(), ids({ show: "everything" }), "every row once");
  assert.equal(new Set(seen).size, seen.length);
});

test("R41 an office row answers holders: at most five {entity, label}, the persons holding it today (a holds line civil-time does not rule out at the instant); empty when none; a withdrawn or ended line holds nothing", () => {
  const w = world();
  const office = w.entity("office", "Harbour Warden");
  const empty = w.entity("office", "Vacant Post");
  const people = Array.from({ length: DIRECTORY_HOLDERS_MAX + 2 }, (_, i) => w.person(`Holder ${i}`));
  for (const p of people) w.line("holds", p, office, span("2020-01-01", "2030-01-01"));
  const ended = w.person("Past Holder"), open = w.person("Open Holder");
  w.line("holds", ended, office, span("2000-01-01", "2001-01-01"));
  w.line("holds", ended, empty, span("2000-01-01", "2001-01-01"));
  w.line("holds", open, empty, span("2020-01-01", null));
  const r = all(w, { show: "offices", viewer: ANN });
  const h = rowOf(r, office).holders;
  assert.equal(h.length, DIRECTORY_HOLDERS_MAX, "at most five");
  assert.deepEqual(h.map((x) => x.entity), [...people].sort().slice(0, DIRECTORY_HOLDERS_MAX), "ordered by entity id");
  assert.ok(h.every((x) => x.label.startsWith("Holder ")), "a person's label");
  assert.ok(!h.some((x) => x.entity === ended), "control: an ended line holds nothing");
  assert.deepEqual(rowOf(r, empty).holders.map((x) => x.entity), [open], "an open end is not out; the ended holder is not listed");
  const none = w.entity("office", "Nobody's Post");
  assert.deepEqual(rowOf(all(w, { show: "offices", viewer: ANN }), none).holders, [], "empty when none");
});

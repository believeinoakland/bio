/* corpus-export — the renderings in open standards (R10), over the T33 owners' world (`rich.mjs`). Driven at the
   module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { rich, ANN, OUT, BOSS, NOW } from "./rich.mjs";
import { FORMATS, STANDARDS } from "../../../src/corpus-export/index.mjs";

/* A world with an open and a fenced half: the fenced capture's event, line and money fact are seen by ann (a participant
   of the project) and not by out. Every item a rendering could hold has one row of each kind. */
function scene() {
  const w = rich();
  const ada = w.person("Ada Lane", ["A. Lane"]);
  const ben = w.person("Ben Roe");
  const board = w.entity("institution", "Harbour Board", { sector: "government" });
  const vendor = w.entity("institution", "Dredge Works", { sector: "company" });
  const master = w.entity("office", "Harbour Master");
  const contract = w.entity("contract", "Dredging contract");
  const open = w.capture("minutes"), fenced = w.capture("memo", { fenced: true });
  const fact = (kind, value, c) => {
    const r = w.p.recordPersonFact({ person: ada, kind, value, valid: { valid: { from: null, to: null, precision: "day", zone: "UTC" }, basis: "a cv" },
                                     citation: { captureSha: c.captureSha, extent: { kind: "pdf-page", page: 0 } }, by: ANN });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.fact_id;
  };
  const ids = {
    ada, ben, board, vendor, master, contract,
    born: fact("birth", "1970-05-01", open),
    died: fact("death", "2031-01-01", fenced),
    home: fact("address", "12 Elm Row", open),
    phone: fact("contact", "555-0100", open),
    meet: w.eventOn(open, "meeting", [{ entity: ada, role: "speaker" }, { entity: board, role: "organizer" }]),
    secret: w.eventOn(fenced, "communication", [{ entity: ben, role: "sender" }]),
    undated: w.event("vote", null, [{ entity: ada, role: "voted" }].filter(() => false)),
    holds: w.line("holds", ada, master, { from: "2020-01-01" }),
    postIn: w.line("post_in", master, board, {}),
    hidden: w.line("related_to", ada, ben, {}, { fenced: true }),
    gone: w.line("belongs_to", ben, board, {}),
    pay: w.factOn(open, { from: { entity: board, as_written: "Harbour Board" }, to: { entity: vendor, as_written: "Dredge Works" },
                          concerns: [contract] }),
    paySecret: w.factOn(fenced, { from: { entity: board, as_written: "Harbour Board" }, to: { entity: ben, as_written: "Ben Roe" }, amount: "99.00" }),
  };
  assert.equal(w.lines.withdrawLine({ lineId: ids.gone, reason: "a wrong reading", by: ANN }).ok, true);
  return { w, ...ids };
}
/* Every id string anywhere in a rendering. */
const text = (r) => JSON.stringify(r);
/* The items of a rendering, whatever its shape. */
function items(format, body) {
  if (format === "ocel2") return [...body.events, ...body.objects];
  if (format === "popolo") return [...body.persons, ...body.organizations, ...body.posts, ...body.memberships];
  if (format === "ocds") return body.releases;
  if (format === "fdp") return body.resources[0].data;
  return body.entities;
}

test("R10 each format answers one rendering in its pinned standard, every item carrying the record id it renders and its citation", () => {
  const s = scene();
  assert.deepEqual([...FORMATS], ["ftm-event", "ocel2", "popolo", "ftm-people", "ftm", "ocds", "fdp"]);
  for (const format of FORMATS) {
    const r = s.w.ce.exportRendering({ format, viewer: ANN });
    assert.equal(r.ok, true, format);
    assert.deepEqual([r.format, r.standard, r.at], [format, STANDARDS[format], NOW]);
    const list = items(format, r.rendering);
    assert.ok(list.length > 0, `${format} renders something`);
    assert.equal(r.items, list.length);
    for (const it of list) {
      assert.match(String(it.record_id), /^(EVT|LIN|MNY|ENT)-/, `${format}: ${text(it).slice(0, 80)}`);
      assert.ok(it.citation && (typeof it.citation === "string" ? it.citation.length : Object.keys(it.citation).length || it.citation.length),
                `${format}: a citation on ${it.record_id}`);
    }
  }
  const ev = s.w.ce.exportRendering({ format: "ftm-event", viewer: ANN }).rendering.entities;
  const meet = ev.find((e) => e.id === s.meet);
  assert.deepEqual([meet.schema, meet.properties.organizer, meet.properties.involved], ["Event", [s.board], [s.ada]]);
  assert.ok(ev.find((e) => e.id === s.ada && e.schema === "Person") && ev.find((e) => e.id === s.board && e.schema === "PublicBody"));
  const oc = s.w.ce.exportRendering({ format: "ocel2", viewer: ANN }).rendering;
  assert.deepEqual(Object.keys(oc).sort(), ["eventTypes", "events", "objectTypes", "objects"]);
  assert.deepEqual(oc.events.find((e) => e.id === s.meet).relationships, [{ objectId: s.ada, qualifier: "speaker" }, { objectId: s.board, qualifier: "organizer" }]);
  const po = s.w.ce.exportRendering({ format: "popolo", viewer: ANN }).rendering;
  const m = po.memberships.find((x) => x.id === s.holds);
  assert.deepEqual([m.person_id, m.post_id, m.organization_id, m.role, m.start_date], [s.ada, s.master, s.board, "appointed", "2020-01-01"]);
  assert.deepEqual(po.persons.find((p) => p.id === s.ada).birth_date, "1970-05-01");
  assert.equal(po.organizations.find((o) => o.id === s.board).classification, "government");
  const fp = s.w.ce.exportRendering({ format: "ftm-people", viewer: ANN }).rendering.entities;
  assert.deepEqual(fp.find((e) => e.id === s.holds).properties, { holder: [s.ada], post: [s.master], startDate: ["2020-01-01"], role: ["appointed"] });
  const ftm = s.w.ce.exportRendering({ format: "ftm", viewer: ANN }).rendering.entities;
  assert.deepEqual(ftm.find((e) => e.id === s.pay).properties.amount, ["250.00"]);
  assert.deepEqual([ftm.find((e) => e.id === s.pay).properties.payer, ftm.find((e) => e.id === s.pay).properties.beneficiary], [[s.board], [s.vendor]]);
  const ocds = s.w.ce.exportRendering({ format: "ocds", viewer: ANN }).rendering;
  const rel = ocds.releases.find((x) => x.id === s.pay);
  assert.deepEqual([ocds.version, rel.ocid, rel.contracts[0].implementation.transactions[0].value], ["1.1", `bio-${s.contract}`, { amount: 250, currency: "USD" }]);
  const fdp = s.w.ce.exportRendering({ format: "fdp", viewer: ANN }).rendering;
  assert.equal(fdp.profile, "fiscal-data-package");
  assert.equal(fdp.resources[0].data.find((x) => x.fact_id === s.pay).amount, "250.00");
  assert.equal(fdp.model.measures.amount.currency, "USD");
});

test("R10 a row the viewer may not see is never rendered; an absent or unknown viewer sees nothing", () => {
  const s = scene();
  const secret = [s.secret, s.hidden, s.paySecret, "2031-01-01"];
  for (const format of FORMATS) {
    const ann = text(s.w.ce.exportRendering({ format, viewer: ANN }).rendering);
    const out = text(s.w.ce.exportRendering({ format, viewer: OUT }).rendering);
    for (const id of secret) assert.equal(out.includes(id), false, `${format}: ${id} withheld from out`);
    if (format === "ftm-event" || format === "ocel2") assert.ok(ann.includes(s.secret), `${format}: ann sees the fenced event`);
    if (format === "ftm" || format === "fdp" || format === "ocds") assert.ok(ann.includes(s.paySecret), `${format}: ann sees the fenced fact`);
    if (format === "ftm-people") assert.ok(ann.includes(s.hidden) && ann.includes("2031-01-01"), "ann sees the fenced line and fact");
    for (const viewer of [null, "", "nobody"]) {
      const r = s.w.ce.exportRendering({ format, viewer });
      assert.equal(r.items, 0, `${format}, viewer ${viewer}: nothing`);
    }
  }
});

test("R10 never a home address, a phone number, a never table, a withdrawn row or a field the record does not hold", () => {
  const s = scene();
  for (const format of FORMATS) {
    const t = text(s.w.ce.exportRendering({ format, viewer: BOSS }).rendering);
    for (const v of ["12 Elm Row", "555-0100", s.home, s.phone, s.gone]) assert.equal(t.includes(v), false, `${format}: ${v}`);
  }
  /* the undated vote holds no date, and its rendering states none */
  const ev = s.w.ce.exportRendering({ format: "ftm-event", viewer: ANN }).rendering.entities.find((e) => e.id === s.undated);
  for (const k of ["date", "startDate", "endDate", "location", "organizer", "involved"]) assert.equal(k in ev.properties, false, k);
  const oc = s.w.ce.exportRendering({ format: "ocel2", viewer: ANN }).rendering.events.find((e) => e.id === s.undated);
  assert.equal("time" in oc, false);
  /* a person with no birth fact has no birth date; a membership with no stated end has none */
  const po = s.w.ce.exportRendering({ format: "popolo", viewer: ANN }).rendering;
  assert.equal("birth_date" in po.persons.find((p) => p.id === s.ben), false);
  assert.equal("end_date" in po.memberships.find((m) => m.id === s.holds), false);
});

test("R10 an unknown format is refused EXPORT_FORMAT_UNKNOWN; a rendering writes nothing but one export_log row naming its format", () => {
  const s = scene();
  const before = s.w.rows(`SELECT COUNT(*) AS n FROM export_log`)[0].n;
  for (const format of [null, "csv", "FTM", "popolo "]) {
    const r = s.w.ce.exportRendering({ format, viewer: ANN });
    assert.deepEqual([r.ok, r.reason], [false, "EXPORT_FORMAT_UNKNOWN"], String(format));
  }
  assert.equal(s.w.rows(`SELECT COUNT(*) AS n FROM export_log`)[0].n, before, "a refusal logs nothing");
  const tables = s.w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('export_log', 'sqlite_sequence') ORDER BY name`).map((r) => r.name);
  const snap = () => tables.map((t) => JSON.stringify(s.w.rows(`SELECT * FROM "${t}"`)));
  const held = snap();
  const r = s.w.ce.exportRendering({ format: "ftm", viewer: ANN });
  assert.deepEqual(snap(), held, "no other table changes");
  const log = s.w.rows(`SELECT * FROM export_log ORDER BY seq DESC LIMIT 1`)[0];
  assert.deepEqual([log.scope, log.format, log.rows, log.at], ["rendering", "ftm", r.items, NOW]);
  assert.equal(s.w.rows(`SELECT COUNT(*) AS n FROM export_log`)[0].n, before + 1);
  assert.match(r.recorded, /append-only export log/);
});

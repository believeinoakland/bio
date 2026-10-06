/* T33-39's requirements at the interface: R17's `due` and `overdue` (C-5a), R27's local-day ranges (C-5b), R28's
   fields read only through their owners' relations (R29), and R30's saved-query form. Ground truth is computed by
   the test from its own definitions: a local day from `Intl` (never `civil-time`, which the compiler uses), and a
   field's answer from the rows the test wrote. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement } from "./fixture.mjs";
import { kinds, phases, stages, bases } from "../../../src/money/index.mjs";
import { compile, savedForm, cachedNotes, viewerPredicate, GATE_MARK, FIELDS, SORTABLE, DEFAULT_FACETS }
  from "../../../src/query.mjs";

const V = "class:member";
const sorted = (a) => [...a].sort();
const ZONE = "America/Los_Angeles";   // west of UTC, and 2026-03-08 is a 23-hour day there

/* The local day of an instant in ZONE, by Intl: the oracle. */
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayOf = (instant) => fmt.format(new Date(instant));

test("R17 due and overdue are cached columns: a plan reaching either names it with its as_of note, and overdue: filters the cached flag", () => {
  for (const f of ["due", "overdue"]) {
    assert.ok(FIELDS[f].asOf && FIELDS[f].authority && FIELDS[f].why, f);
    assert.ok(!DEFAULT_FACETS.includes(f), `${f} is reached only when asked`);
  }
  const routes = (p) => Object.fromEntries(Object.entries(p.cached).map(([k, s]) => [k, [...s].sort()]));
  const p = compile({ q: "overdue:true", viewer: V, sort: "due", facets: ["overdue", "type"] });
  assert.deepEqual(routes(p), { [FIELDS.due.col]: ["sort"], [FIELDS.overdue.col]: ["facet", "filter"] });
  const notes = cachedNotes(p.cached);
  assert.deepEqual(notes.map((n) => [n.field, n.via]), [["due", ["sort"]], ["overdue", ["filter", "facet"]]]);
  for (const n of notes) {
    assert.equal(n.as_of, "each action's LAST WRITE");
    assert.equal(n.authority, FIELDS[n.field].authority);
    assert.ok(n.detail.includes(FIELDS[n.field].why) && /not the authority/.test(n.detail), n.detail);
  }
  /* Every route into either column is caught: under NOT, in a range, through has:, as a sort token. */
  for (const [q, col, via] of [["-overdue:false", "overdue", "filter"], ["has:due", "due", "filter"],
                               ["due:2026-01-01..2026-02-01", "due", "filter"], ["sort:due:asc", "due", "sort"]])
    assert.deepEqual(cachedNotes(compile({ q, viewer: V, facets: ["type"] }).cached).map((n) => [n.field, n.via]),
      [[col, [via]]], q);
  assert.deepEqual(cachedNotes(compile({ q: "water", viewer: V, facets: ["type"] }).cached), [], "none reached, none said");
  /* The filter reads the cached flag as written, never a clock: a flag set at the last write answers, one never set
     does not, whatever the dates say. */
  const w = world();
  w.bundle("A1", { type: "action", action_clock_next: "2026-01-01", action_clock_overdue: 1 });
  w.bundle("A2", { type: "action", action_clock_next: "2020-01-01", action_clock_overdue: 0 });
  w.bundle("A3", { type: "action", action_clock_next: "2030-01-01", action_clock_overdue: 1 });
  assert.deepEqual(sorted(w.ids({ q: "overdue:true", viewer: V })), ["A1", "A3"]);
});

/* One bundle per instant, hourly across the spring change in ZONE, plus the stored forms with milliseconds at and
   just before each local midnight. */
function instants() {
  const out = [];
  for (let t = Date.parse("2026-03-06T00:00:00Z"); t <= Date.parse("2026-03-11T00:00:00Z"); t += 3600e3)
    out.push(new Date(t).toISOString().replace(".000Z", "Z"));
  for (const m of ["2026-03-07T08:00:00", "2026-03-08T08:00:00", "2026-03-09T07:00:00", "2026-03-10T07:00:00"]) {
    out.push(`${m}.000Z`, `${m}.500Z`);
    const before = new Date(Date.parse(`${m}Z`) - 1).toISOString();
    out.push(before, before.replace(/\.\d+Z$/, "Z"));
  }
  return [...new Set(out)];
}
const DAYS = ["2026-03-06", "2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10"];

test("R27 a date on a time field is a local day in the caller's zone, a range of dates holds both its days, and comparisons are on whole days", () => {
  const all = instants();
  for (const w of [world(), world({ projection: { table: "proj_rel", key: "pid" } })]) {
    const proj = !!w.db.prepare("SELECT name FROM sqlite_master WHERE name = 'proj_rel'").get();
    const ids = all.map((t, i) => w.bundle(`T${String(i).padStart(3, "0")}`, { created: t, source_retrieved: t }));
    const byId = Object.fromEntries(ids.map((id, i) => [id, all[i]]));
    const want = (pred) => sorted(ids.filter((id) => pred(dayOf(byId[id]))));
    const got = (q) => sorted(w.ids({ q, viewer: V, zone: ZONE, limit: 500 }));
    for (const field of ["created", "retrieved"])
      for (const d of DAYS) {
        assert.deepEqual(got(`${field}:${d}`), want((x) => x === d), `${field}:${d} proj=${proj}`);
        assert.deepEqual(got(`${field}:>${d}`), want((x) => x > d), `${field}:>${d}`);
        assert.deepEqual(got(`${field}:>=${d}`), want((x) => x >= d), `${field}:>=${d}`);
        assert.deepEqual(got(`${field}:<${d}`), want((x) => x < d), `${field}:<${d}`);
        assert.deepEqual(got(`${field}:<=${d}`), want((x) => x <= d), `${field}:<=${d}`);
        for (const e of DAYS.filter((x) => x >= d))
          assert.deepEqual(got(`${field}:${d}..${e}`), want((x) => x >= d && x <= e), `${field}:${d}..${e}`);
      }
    /* The 23-hour day holds exactly its 23 hourly instants. */
    assert.equal(got("created:2026-03-08").filter((id) => /:00:00Z$/.test(byId[id])).length, 23);
    /* An instant compiles as before: compared as written. */
    const at = "2026-03-08T10:00:00Z";
    assert.deepEqual(got(`created:>${at}`), sorted(ids.filter((id) => byId[id] > at)));
    assert.deepEqual(got(`created:${DAYS[1]}..${at}`), sorted(ids.filter((id) => dayOf(byId[id]) >= DAYS[1] && byId[id] <= at)),
      "a date and an instant: the day's first instant to the instant");
  }
});

test("R27 an impossible date, a date with no zone, a zone civil-time refuses and an inverted range are each dropped with a warning, which widens", () => {
  const w = world();
  w.bundle("A", { body: "water", created: "2026-03-01T12:00:00Z" });
  w.bundle("B", { body: "water", created: "2026-04-01T12:00:00Z" });
  const cases = [
    ["created:2026-02-31", ZONE, /"2026-02-31" is not a calendar date; dropped/],
    ["created:2026-03-01..2026-13-01", ZONE, /"2026-13-01" is not a calendar date; dropped/],
    ["created:>=2026-03-01", null, /names a local day and no time zone is given; dropped/],
    ["created:2026-03-01", "", /no time zone is given/],
    ["created:2026-03-01", 7, /no time zone is given/],
    ["created:2026-03-01", "Mars/Olympus", /created: "2026-03-01": .*; dropped/],
    ["created:2026-03-09..2026-03-07", ZONE, /ends before it starts; dropped/],
  ];
  for (const [term, zone, re] of cases) {
    const p = compile({ q: `${term} water`, viewer: V, zone });
    assert.ok(p.warnings.length === 1 && re.test(p.warnings[0]), `${term} @${zone}: ${p.warnings}`);
    assert.deepEqual(p.drops, p.warnings, "a drop is recorded as one");
    assert.deepEqual(everyStatement(p), everyStatement(compile({ q: "water", viewer: V, zone })), "the rest compiles as before");
    assert.deepEqual(sorted(w.ids({ q: `${term} water`, viewer: V, zone })), ["A", "B"], `${term} widens, never narrows`);
  }
  /* A day column (`due`, the clock's local day) compares days, inclusive, with no zone. */
  const d = world();
  for (const [id, day] of [["X1", "2026-03-01"], ["X2", "2026-03-31"], ["X3", "2026-04-01"], ["X4", "2026-02-28"]])
    d.bundle(id, { type: "action", action_clock_next: day });
  const ids = (q) => sorted(d.ids({ q, viewer: V }));
  assert.deepEqual(ids("due:2026-03-01..2026-03-31"), ["X1", "X2"], "both days held");
  assert.deepEqual(ids("due:2026-03-31"), ["X2"]);
  assert.deepEqual(ids("due:>2026-03-01"), ["X2", "X3"]);
  assert.deepEqual(ids("due:<=2026-03-01"), ["X1", "X4"]);
  assert.deepEqual(compile({ q: "due:2026-03-01", viewer: V }).warnings, [], "no zone needed");
  assert.ok(compile({ q: "due:2026-02-30", viewer: V }).drops.length === 1);
  /* R7: the bounds move only in args. */
  const sql = (q) => everyStatement(compile({ q, viewer: V, zone: ZONE })).map(([, s]) => s.sql);
  assert.deepEqual(sql("created:2026-03-01..2026-03-31 due:2026-01-01"), sql("created:2027-01-01..2027-06-30 due:2028-02-29"));
});

/* R28's fields, each in a relation of its own (the caller's names), several rows per bundle. */
const T33 = ["standard", "cites", "person", "holder", "post", "kind", "phase", "stage", "basis", "period", "fund", "party",
  "event", "occurred", "obligor", "owed_to"];
const REL = Object.fromEntries(T33.map((f) => [f, { table: `own_${f}`, key: "bid", col: "v" }]));
const VALUES = {
  standard: ["STD-1", "STD-2"], cites: ["CA Gov Code 7922.535", "STD-9"], person: ["ENT-P1", "ENT-P2"],
  holder: ["ENT-P1", "ENT-P3"], post: ["ENT-O1", "ENT-O2"], kind: ["revenue", "fee charged"], phase: ["adopted", "actual"],
  stage: ["paid", "encumbered"], basis: ["cash", "modified accrual"], period: ["FY2025", "FY2026"], fund: ["ENT-F1", "ENT-F2"],
  party: ["ENT-V1", "ENT-V2"], event: ["EVT-1", "EVT-2"], occurred: ["2026-03-01T12:00:00Z", "2026-05-01T12:00:00Z"],
  obligor: ["ENT-B1", "ENT-B2"], owed_to: ["ENT-G1", "ENT-G2"],
};
function t33World() {
  const w = world();
  w.member("ann");
  for (const f of T33) w.db.exec(`CREATE TABLE own_${f} (bid TEXT, v TEXT)`);
  /* B1 holds both values of every field, B2 the first only, B3 none, PR (a project ann cannot see) the second. */
  for (const id of ["B1", "B2", "B3"]) w.bundle(id, { body: "water" });
  w.bundle("PR", { type: "project", body: "water" });
  for (const f of T33) {
    w.insert(`own_${f}`, { bid: "B1", v: VALUES[f][0] });
    w.insert(`own_${f}`, { bid: "B1", v: VALUES[f][1] });
    w.insert(`own_${f}`, { bid: "B2", v: VALUES[f][0] });
    w.insert(`own_${f}`, { bid: "PR", v: VALUES[f][1] });
  }
  return w;
}
/* `money`'s own closed lists, read at its interface (its R17). */
const MONEY = { kinds, phases, stages, bases };
const runIds = (w, opts, second) => sorted(w.all(compile({ viewer: V, limit: 500, ...opts }, second).statements.page())
  .map((r) => r.bundle_id));

test("R28 R3 the T33 fields: each an equality on the value typed, lower-cased where its owner's words are, occurred a time field, each read through its owner's relation", () => {
  assert.deepEqual(Object.keys(FIELDS).slice(-T33.length), T33);
  const w = t33World();
  const second = { fields: REL };
  for (const f of T33) {
    const [a, b] = VALUES[f];
    assert.deepEqual(runIds(w, { q: `${f}:"${a}"` }, second), ["B1", "B2"], `${f}:${a}`);
    assert.deepEqual(runIds(w, { q: `${f}:"${b}"` }, second), ["B1", "PR"], `${f}:${b}`);
    assert.deepEqual(runIds(w, { q: `${f}:"${a}" ${f}:"${b}"` }, second), ["B1"], `${f} both`);
    assert.deepEqual(runIds(w, { q: `-${f}:"${a}"` }, second), ["B3", "PR"]);
    assert.deepEqual(runIds(w, { q: `has:${f}` }, second), ["B1", "B2", "PR"]);
    assert.deepEqual(runIds(w, { q: `${f}:*` }, second), ["B1", "B2", "PR"]);
    assert.deepEqual(runIds(w, { q: `${f}:"${a}"`, viewer: "member:ann" }, second), ["B1", "B2"], "the gate holds (R8)");
    assert.deepEqual(compile({ q: `${f}:"${a}"`, viewer: V }, second).warnings, [], f);
  }
  /* The money words are lower-case, so a member's capitals still match; an id is matched as typed. */
  for (const f of ["kind", "phase", "stage", "basis"]) {
    assert.equal(FIELDS[f].lower, true, f);
    assert.deepEqual(runIds(w, { q: `${f}:"${VALUES[f][0].toUpperCase()}"` }, second), ["B1", "B2"], f);
  }
  for (const f of T33.filter((x) => !["kind", "phase", "stage", "basis"].includes(x)))
    assert.ok(!FIELDS[f].lower && !FIELDS[f].upper, `${f} is matched as typed`);
  /* occurred: a time field, R27's local days through the relation, both bounds on ONE event row. */
  assert.equal(FIELDS.occurred.type, "time");
  const z = { zone: "UTC" };
  assert.deepEqual(runIds(w, { q: "occurred:2026-03-01", ...z }, second), ["B1", "B2"]);
  assert.deepEqual(runIds(w, { q: "occurred:>2026-04-01", ...z }, second), ["B1", "PR"]);
  assert.deepEqual(runIds(w, { q: "occurred:2026-04-01..2026-04-30", ...z }, second), [],
    "an event before and one after the range is not an event in it");
  assert.deepEqual(runIds(w, { q: "occurred:2026-02-01..2026-03-31", ...z }, second), ["B1", "B2"]);
});

test("R29 a T33 field with no relation named is dropped with its warning, never read from bundles, and the rest compiles as before", () => {
  const w = t33World();
  for (const f of T33) {
    for (const second of [undefined, {}, { fields: { [T33.find((x) => x !== f)]: REL[T33.find((x) => x !== f)] } }]) {
      for (const term of [`${f}:"${VALUES[f][0]}"`, `has:${f}`, `-${f}:x`, `${f}:*`]) {
        const p = compile({ q: `water ${term}`, viewer: V, zone: "UTC" }, second);
        assert.deepEqual(p.warnings, [`${JSON.stringify(f)} is not available here; read as nothing`], `${term}`);
        assert.deepEqual(p.drops, p.warnings);
        assert.deepEqual(everyStatement(p), everyStatement(compile({ q: "water", viewer: V, zone: "UTC" }, second)), term);
        for (const [, s] of everyStatement(p)) assert.ok(!s.sql.includes(FIELDS[f].col), `${term} reads ${FIELDS[f].col}`);
        assert.deepEqual(runIds(w, { q: `water ${term}` }, second), ["B1", "B2", "B3", "PR"], `${term} widens`);
      }
    }
  }
  /* Never a sort and never a facet: a bundle holds many values of each. */
  for (const f of T33) {
    assert.ok(!(f in SORTABLE), f);
    const s = compile({ q: `sort:${f} water`, viewer: V }, { fields: REL });
    assert.deepEqual(s.drops, [`sort: ${JSON.stringify(f)} can hold many values per record; not a sort`]);
    assert.equal(s.sort.field, "relevance");
    assert.equal(compile({ q: "", viewer: V, sort: f }, { fields: REL }).sort.field, "updated", "the parameter too");
    const fc = compile({ q: "", viewer: V, facets: [f, "type"] }, { fields: REL });
    assert.deepEqual([fc.facetFields, fc.warnings], [["type"], [`facets: ${JSON.stringify(f)} can hold many values per record; not a facet`]]);
  }
  /* R7 and R8 through every relation: member input moves only args, and every gate mark is the one gate's. */
  const shapes = (v) => everyStatement(compile({ q: T33.map((f) => `${f}:"${v}"`).join(" "), viewer: "member:ann",
    rows: "leg", zone: "UTC" }, { fields: REL }));
  const base = shapes("seed");
  for (const h of ["x'); DROP TABLE own_standard; --", "' OR 1=1 --", "*/ 1 /*"]) {
    const got = shapes(h);
    assert.deepEqual(got.map(([k, s]) => [k, s.sql]), base.map(([k, s]) => [k, s.sql]), h);
    for (const [, s] of got) assert.ok(!s.sql.includes(h));
  }
  const gate = viewerPredicate("member:ann");
  for (const [shape, s] of base) assert.equal(s.sql.split(GATE_MARK).length - 1, s.sql.split(gate.sql).length - 1, shape);
});

test("R30 savedForm: the form a standing question keeps, or a refusal when it is empty, drops a term or carries a selection", () => {
  const ok = savedForm({ q: "water -main state:open", implicitOp: "or", sort: "Updated", dir: "asc" });
  assert.deepEqual(ok, { ok: true, form: { v: 1, q: "water -main state:open", implicitOp: "or", sort: "updated", dir: "asc" } });
  assert.deepEqual(savedForm({ q: "water" }), { ok: true, form: { v: 1, q: "water", implicitOp: "and", sort: null, dir: null } });
  assert.deepEqual(savedForm({ q: "water", sort: "due", dir: "DESC" }).form, { v: 1, q: "water", implicitOp: "and", sort: "due", dir: "desc" });
  /* No viewer, limit or offset is kept, whatever is passed. */
  const extra = savedForm({ q: "water", viewer: "member:ann", limit: 3, offset: 9, rows: "leg", zone: "UTC" });
  assert.deepEqual(Object.keys(extra.form), ["v", "q", "implicitOp", "sort", "dir"]);
  /* The same form compiles to the same plan for the same viewer every time, and to the plan the query had. */
  const run = (form, viewer) => {
    const p = compile({ q: form.q, implicitOp: form.implicitOp, sort: form.sort, dir: form.dir, viewer });
    return JSON.stringify({ ...p, cached: Object.entries(p.cached).map(([k, s]) => [k, [...s]]), statements: everyStatement(p) });
  };
  for (const viewer of ["member:ann", V])
    assert.equal(run(ok.form, viewer), run(savedForm({ q: ok.form.q, implicitOp: "or", sort: "updated", dir: "asc" }).form, viewer));
  /* The refusals. */
  for (const q of ["", "   ", "--- ...", "()"]) assert.equal(savedForm({ q }).reason, "SAVED_QUERY_EMPTY", JSON.stringify(q));
  for (const ids of [["A"], "A"]) assert.equal(savedForm({ q: "water", ids }).reason, "SAVED_QUERY_SELECTION");
  assert.equal(savedForm({ q: "water", ids: [] }).ok, true, "an empty id list is no selection");
  const drops = savedForm({ q: "water nope:x leg:bogus=1 created:2026-02-31 standard:STD-1 has:zz fm:a;b", sort: "nope" });
  assert.equal(drops.reason, "SAVED_QUERY_DROPS");
  assert.deepEqual(drops.warnings, ['sort: "nope" is not a sort key', 'unknown field "nope"; read as free text',
    'leg: unknown sub-field "bogus"; known: source, role, axis, grade, ground, target',
    'created: "2026-02-31" is not a calendar date; dropped', '"standard" is not available here; read as nothing',
    'has: unknown field "zz"', 'fm: path "a;b" is not a frontmatter path']);
  for (const q of ["leg:capture", "passage:---", "created:2026-03-01", "sort:standard", "leg:grade>="])
    assert.equal(savedForm({ q: `water ${q}` }).reason, "SAVED_QUERY_DROPS", q);
  /* What the caller will run it with counts: a field it can read and a zone it gives are not drops. */
  assert.equal(savedForm({ q: "standard:STD-1" }, { fields: REL }).ok, true);
  assert.equal(savedForm({ q: "created:2026-03-01", zone: "UTC" }).ok, true);
  /* A note on how a term was read is not a drop. */
  for (const q of ["(water", "NEAR(water main, 500)", "a b c d e f g h i"]) assert.equal(savedForm({ q }).ok, true, q);
  /* Never throws. */
  const bad = { toString() { throw new Error("x"); } };
  for (const x of [undefined, null, 7, "water", [], { q: 5 }, { q: "water", sort: bad }, { q: "water", ids: 3 }])
    assert.doesNotThrow(() => { const r = savedForm(x); assert.equal(typeof r.ok, "boolean"); }, JSON.stringify(x));
});

test("R28 a money field's word outside money's closed list is dropped with a warning naming the list, and every word of the list compiles", () => {
  const w = t33World();
  const second = { fields: REL };
  for (const [f, list] of [["kind", "kinds"], ["phase", "phases"], ["stage", "stages"], ["basis", "bases"]]) {
    assert.equal(FIELDS[f].words, list);
    for (const word of MONEY[list]()) {
      for (const typed of [word, word.toUpperCase()]) {
        const p = compile({ q: `${f}:"${typed}"`, viewer: V }, second);
        assert.deepEqual([p.warnings, p.ast.op], [[], "meta"], `${f}:${typed}`);
      }
    }
    for (const bad of ["nope", "revenue!", "paid ", list]) {
      const p = compile({ q: `water ${f}:"${bad}"`, viewer: V }, second);
      assert.deepEqual(p.warnings, [`${f}: ${JSON.stringify(bad)} is not one of money's ${list} (${MONEY[list]().join(", ")}); dropped`], bad);
      assert.deepEqual(p.drops, p.warnings);
      assert.deepEqual(everyStatement(p), everyStatement(compile({ q: "water", viewer: V }, second)), `${f}:${bad} widens`);
      assert.deepEqual(runIds(w, { q: `water ${f}:"${bad}"` }, second), ["B1", "B2", "B3", "PR"]);
    }
    /* Presence asks no word. */
    assert.deepEqual(compile({ q: `has:${f} ${f}:*`, viewer: V }, second).warnings, []);
    /* The other fields have no closed list. */
  }
  for (const f of T33.filter((x) => !["kind", "phase", "stage", "basis"].includes(x)))
    assert.equal(FIELDS[f].words, undefined, f);
  assert.equal(savedForm({ q: "kind:nope" }, second).reason, "SAVED_QUERY_DROPS");
});

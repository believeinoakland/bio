/* local-facts T53 (N1257, DEC-404, DEC-458 A2): the team layer (R23, R30), the rules as its entries (R24, R28), a correction of a
   shipped layer's fact (R25), a report on a shipped rule (R26), a path that names a package (R27), a fact's path and layer (R29),
   and a government's fiscal year a member states (R31, R32). The layers are `jurisdictions`' published test forest (R118), the
   one package the real `oakland-alameda` (R27 names it), and the team layer is this module's own, never a hand-built answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, sha, MACHINE } from "./fixture.mjs";
import { FOREST, forestCopy } from "../../../../jurisdictions/test/fixtures/forest.mjs";
import { combine, get } from "../../../../jurisdictions/index.mjs";
import { DECLARED_OPS, LOCAL_FACTS_CHECKS, localFactsOps, factPath, parseFactPath } from "../../../src/local-facts/index.mjs";
import { declaredOpHolds } from "../../declared-ops.mjs";

const SHIPPED = FOREST.all.filter((l) => l.id !== "team");
const ids = (list) => list.map((l) => l.id);
const A = { level: "city", place: "Aburg" }, B = { level: "city", place: "Bburg" }, COUNTY_A = { level: "county", place: "Aville County" };
const fest = (over = {}) => ({ year: 2027, list: "festival", days: [{ date: "2027-06-01", name: "Festival" }], citation: "Aburg Code § 9", ...over });
/* `jurisdictions.validate` holds one (year, list) of the team layer's holidays whatever the government (it reads the layer as one list), so two
   governments' lists here differ in their year; the same name in two layers of the forest is held apart (R29's own test, below) */
const festB = (over = {}) => fest({ year: 2028, days: [{ date: "2028-07-01", name: "Other Festival" }], citation: "Bburg Code § 3", ...over });
const dl = (over = {}) => ({ rule: "team_notice", applies_to: "records_request", units: "days", amount: 5, count: "calendar", starts: "received", citation: "Aburg Code § 10", ...over });

function setup({ list = SHIPPED, now } = {}) {
  const w = world({ profiles: ids(list), own: forestCopy(list), ...(now ? { now } : {}) });
  const src = { captureSha: w.held("INFO-2026-0001", sha("the code")), extent: { kind: "document" } };
  const draft = (over = {}) => w.lf.layerEntryDraft({ section: "holidays", entry: fest(), government: A, source: src, reason: "the city's own code", by: V("bob"), viewer: V("bob"), ...over });
  const confirm = (entry, over = {}) => w.lf.layerEntryConfirm({ entry, by: V("carol"), viewer: V("carol"), ...over });
  const rows = (t) => w.rows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n;
  return { w, src, draft, confirm, rows };
}
const ok = (r) => { assert.equal(r.ok, true, JSON.stringify(r)); return r; };
const row = (r, code) => { assert.equal(r.ok, false); assert.deepEqual([r.reason, r.code, r.check], [code, code, LOCAL_FACTS_CHECKS[code].check]); assert.equal(r.translation, LOCAL_FACTS_CHECKS[code].translation); return r; };

test("R23 a city's holiday year drafted by one member and confirmed by another joins the governing view with origin team and its government; the drafter cannot confirm; entries about two cities are in the one layer", () => {
  const { w, draft, confirm } = setup();
  const a = ok(draft()).entry;
  row(confirm(a, { by: V("bob"), viewer: V("bob") }), "RULE_SELF_CONFIRM");
  assert.equal(w.lf.governingView().view.holidays.some((h) => h.list === "festival"), false, "a drafted entry is listed and never applied");
  assert.equal(ok(w.lf.layerEntries({ viewer: V("dan") })).entries[0].state, "drafted");
  ok(confirm(a));
  const b = ok(draft({ government: B, entry: festB() })).entry;
  ok(confirm(b));
  const view = w.lf.governingView().view;
  const mine = view.holidays.filter((h) => h.list === "festival");
  assert.deepEqual(mine.map((h) => [h.origin, h.profile, h.government]).sort(), [["team", "team", A], ["team", "team", B]].sort());
  assert.equal(mine.find((h) => h.government.place === "Aburg").days[0].name, "Festival");
  const layer = w.lf.teamLayer({ viewer: V("dan") });
  assert.equal(layer.id, "team");
  assert.deepEqual(layer.holidays.map((h) => h.government.place).sort(), ["Aburg", "Bburg"], "one layer, two governments");
  assert.ok(layer.holidays.every((h) => h.status === "researched" && h.basis.startsWith("team:")), "the capture it was read from is its basis");
  /* the layer is in the view's layers, once */
  assert.deepEqual(view.layers.filter((l) => l.origin === "team").map((l) => l.id), ["team"]);
});

test("R23 a Tier 2, 3 or undetermined entry needs the confirming member's statement; a Tier 1 asks none and records none; any member withdraws with a reason, kept", () => {
  const { w, draft, confirm, rows } = setup();
  const d = ok(draft({ section: "deadlines", entry: dl({ applies_to: "claim", rule: "claim_notice" }) })).entry;
  const r = row(confirm(d), "RULE_NEEDS_QUALIFICATION");
  assert.equal(r.tier, null);
  const c = ok(confirm(d, { statement: "attorney, ten years in records law" }));
  assert.equal(c.with_statement, true);
  assert.equal(w.lf.layerEntries({ viewer: V("dan") }).entries[0].statement, "attorney, ten years in records law");
  assert.equal(JSON.stringify([w.lf.governingView(), w.lf.teamLayer({ viewer: V("dan") }), w.lf.factStatus({ viewer: V("dan") })]).includes("ten years"), false, "the statement is read by the entries' own read alone");
  const t1 = ok(draft({ section: "deadlines", entry: dl() })).entry;   // records_request is Tier 1 in the forest
  assert.equal(ok(confirm(t1, { statement: "unneeded" })).with_statement, false);
  assert.equal(w.lf.layerEntries({ viewer: V("dan") }).entries.find((e) => e.entry === t1).statement, undefined);
  /* withdrawn: it leaves the layer; kept; a repeat answers already */
  row(w.lf.layerEntryWithdraw({ entry: t1, reason: "", by: V("dan"), viewer: V("dan") }), "RULE_NO_REASON");
  const before = rows("team_layers");
  assert.equal(ok(w.lf.layerEntryWithdraw({ entry: t1, reason: "repealed", by: V("dan"), viewer: V("dan") })).already, false);
  assert.equal(rows("team_layers"), before + 1);
  assert.equal(w.lf.layerEntryWithdraw({ entry: t1, reason: "repealed", by: V("dan"), viewer: V("dan") }).already, true);
  assert.equal(w.lf.teamLayer({ viewer: V("dan") }).deadlines?.some((x) => x.rule === "team_notice") ?? false, false);
  assert.equal(rows("team_layers"), before + 1, "a repeat writes nothing");
  row(w.lf.layerEntryWithdraw({ entry: "LE-99", reason: "x", by: V("dan"), viewer: V("dan") }), "NO_SUCH_LAYER_ENTRY");
  row(confirm(t1), "RULE_NOT_DRAFTED");
});

test("R23 refusals in order, each writing nothing: a machine, a Civicsmith layer named, a section, the entry, the source, a shipped key with another value, the reason", () => {
  const { w, draft, src, rows } = setup();
  const n = () => [rows("team_layers"), rows("local_rule_acts")];
  const before = n();
  row(draft({ by: MACHINE, layer: "forest-state", section: "weather" }), "MACHINE_CANNOT_DRAFT_RULE");
  /* control: the same entry aimed at a Civicsmith layer is LAYER_READ_ONLY and writes nothing; an unheld one is LAYER_UNKNOWN */
  const ro = row(draft({ layer: "forest-state", section: "weather" }), "LAYER_READ_ONLY");
  assert.equal(ro.layer, "forest-state");
  row(draft({ layer: "no-such-layer" }), "LAYER_UNKNOWN");
  row(draft({ layer: "team", section: "weather" }), "RULE_SECTION_UNKNOWN");
  for (const section of ["time_zone", "fiscal_year", "weekend"]) row(draft({ section }), "RULE_SECTION_UNKNOWN");
  /* the entry: a government of a state (not ruled), none, a place missing; an entry invalid as the section's */
  for (const government of [{ level: "state", place: "Stateia" }, undefined, { level: "city" }]) row(draft({ government }), "RULE_ENTRY_INVALID");
  const bad = row(draft({ entry: fest({ days: "no" }) }), "RULE_ENTRY_INVALID");
  assert.ok(bad.errors.length);
  row(draft({ source: null }), "RULE_NO_SOURCE");
  row(draft({ source: { captureSha: sha("never held"), extent: { kind: "document" } } }), "RULE_NO_SOURCE");
  /* a key a shipped active layer already gives, with a different value: the route is a report */
  const shipped = row(draft({ section: "deadlines", entry: dl({ rule: "fed_answer", amount: 5, closures: "fed", count: "business" }) }), "LAYER_ENTRY_IN_SHIPPED");
  assert.equal(shipped.layer, "forest-federal");
  row(draft({ reason: "" }), "RULE_NO_REASON");
  assert.deepEqual(n(), before, "nothing was written");
  /* the same value as the shipped layer's is no conflict */
  const fed = FOREST.chain[0].deadlines[0];
  const { status: _s, basis: _b, ...same } = fed;
  ok(draft({ section: "deadlines", entry: same }));
  assert.ok(src);
});

test("R23 a team entry the shipped layers give differently is refused only for the government's own chain (a layer of another branch gives it to no one here)", () => {
  const { draft } = setup();
  /* county B's deadline `county_b_answer` is not in Aburg's chain: Aburg may write its own of that name */
  ok(draft({ section: "deadlines", entry: dl({ rule: "county_b_answer", amount: 1 }) }));
  row(draft({ section: "deadlines", entry: dl({ rule: "county_a_answer", amount: 1, closures: "state", count: "business" }) }), "LAYER_ENTRY_IN_SHIPPED");
});

test("R30 the team layer is held in the record: its table is declared exempt from purge, and nothing but the group's own authenticated reads returns it", () => {
  const { w, draft, confirm } = setup();
  ok(confirm(ok(draft()).entry));
  const tables = w.record.declaredTables().filter((d) => d.module === "local-facts" && ["team_layers", "layer_reports"].includes(d.name));
  assert.deepEqual(tables.map((t) => [t.name, t.purge, t.sight, t.version_chain]), [["team_layers", "exempt", "group", true], ["layer_reports", "clear", "group", true]]);
  w.record.purge({});
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM team_layers`)[0].n, 2, "a purge leaves the team layer");
  /* a viewer naming no member, a machine, none: nothing; the member's read: the layer */
  for (const viewer of ["nobody", MACHINE]) {
    assert.equal(w.lf.teamLayer({ viewer }), null);
    assert.deepEqual(w.lf.layerEntries({ viewer }), { ok: true, entries: [], count: 0 });
  }
  /* what `combine` takes (a caller appends it after the recorded ids), and the founder's own spelling is a member's */
  const layer = w.lf.teamLayer({ viewer: "admin" });
  assert.deepEqual([layer.id, layer.layer, layer.holidays.length], ["team", { origin: "team" }, 1]);
  assert.equal(combine([...ids(SHIPPED).map((id) => FOREST.all.find((l) => l.id === id)), layer]).ok, true);
  assert.equal(w.lf.teamLayer({ viewer: V("dan") }).holidays[0].government.place, "Aburg");
  /* the setting holds no team layer id, and no op returns the layer to a stranger */
  assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), ids(SHIPPED));
  const url = new URL("https://plane.example/?viewer=nobody");
  for (const [op, arm] of Object.entries(localFactsOps(w.lf, url, null))) {
    let out; try { out = JSON.stringify(arm()); } catch { out = ""; }
    assert.equal(out.includes("Festival"), false, op);
  }
});

test("R24 a rule confirmed before this change reads as the team layer's with the same basis and its confirmation's day", () => {
  const { w } = setup();
  /* the rows as T45 wrote them: no layer, no government (the new columns hold NULL) */
  const DL = { rule: "old_rule", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Old Bylaw § 1" };
  w.st.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, entry_json, source_json, reason, statement, by_member, at)
                 VALUES (NULL, 'draft', 'deadlines', ?, '{}', 'r', NULL, 'member:bob', '2026-09-20T10:00:00Z')`, JSON.stringify(DL));
  w.st.sql.exec(`INSERT INTO local_rule_acts (draft_seq, act, section, entry_json, source_json, reason, statement, by_member, at)
                 VALUES (1, 'confirm', NULL, NULL, NULL, NULL, NULL, 'member:carol', '2026-09-21T10:00:00Z')`);
  const before = JSON.stringify(w.rows(`SELECT * FROM local_rule_acts ORDER BY seq`));
  const e = w.lf.governingView().view.deadlines.find((d) => d.rule === "old_rule");
  assert.deepEqual([e.origin, e.layer, e.profile, e.basis], ["team", "team", "group", "2026-09-21 GR-1"]);
  assert.equal(e.government, undefined);
  assert.equal(w.lf.groupRules({ viewer: V("dan") }).rules[0].layer, "team");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM local_rule_acts ORDER BY seq`)), before, "its rows are untouched");
});

test("R28 a rule is stored with the layer and the government it is about; two governments' rules of one name are two rules, and a bare name asked for is NAME_AMBIGUOUS naming each", () => {
  const { w, src } = setup();
  const draft = (government, over = {}) => w.lf.ruleDraft({ section: "deadlines", entry: { rule: "immediate_disclosure", applies_to: "records_request", units: "days", amount: 3, starts: "received", citation: "Code § 1", effective_from: "2026-01-01", ...over },
    government, source: src, reason: "the code", by: V("bob"), viewer: V("bob") });
  const a = ok(draft(A)).rule, b = ok(draft(B, { amount: 4 })).rule;
  for (const r of [a, b]) ok(w.lf.ruleConfirm({ rule: r, by: V("carol"), viewer: V("carol") }));
  const rules = w.lf.groupRules({ viewer: V("dan") }).rules;
  assert.deepEqual(rules.map((r) => [r.layer, r.government.place]), [["team", "Aburg"], ["team", "Bburg"]]);
  const view = w.lf.governingView().view.deadlines.filter((d) => d.rule === "immediate_disclosure");
  assert.deepEqual(view.map((d) => [d.layer, d.government.place, d.amount]), [["team", "Aburg", 3], ["team", "Bburg", 4]]);
  const amb = row(w.lf.ruleResolve({ section: "deadlines", name: "immediate_disclosure", viewer: V("dan") }), "NAME_AMBIGUOUS");
  assert.deepEqual(amb.layers.map((l) => l.government.place), ["Aburg", "Bburg"]);
  const one = w.lf.ruleResolve({ section: "deadlines", name: "immediate_disclosure", government: B, viewer: V("dan") });
  assert.deepEqual([one.ok, one.rule, one.layer], [true, b, "team"]);
  assert.deepEqual(w.lf.ruleResolve({ section: "deadlines", name: "nothing", viewer: V("dan") }), { ok: false, reason: "NAME_UNKNOWN" });
  assert.deepEqual(w.lf.ruleResolve({ section: "deadlines", name: "immediate_disclosure", viewer: "nobody" }), { ok: false, reason: "NAME_UNKNOWN" }, "to a member alone");
  /* the key is judged within its layer and government first: the same rule for the same government is RULE_IN_PROFILE naming the team layer */
  const held = row(draft(A), "RULE_IN_PROFILE");
  assert.equal(held.held.layer, "team");
  /* then across the active layers: a shipped key is named with its layer */
  const shipped = row(draft(A, { rule: "fed_answer" }), "RULE_IN_PROFILE");
  assert.equal(shipped.held.layer, "forest-federal");
  /* a Civicsmith layer named is read-only (R23); a malformed government is an invalid entry */
  row(w.lf.ruleDraft({ section: "deadlines", layer: "forest-state", entry: {}, source: src, reason: "r", by: V("bob") }), "LAYER_READ_ONLY");
  row(draft({ level: "state", place: "Stateia" }, { rule: "other_one" }), "RULE_ENTRY_INVALID");
});

test("R28 a closure list a rule names is stored as <layer id>:<name> when it resolves to a list of one layer; two layers giving a bare name is NAME_AMBIGUOUS and nothing is written", () => {
  const { w, src, rows } = setup();
  const entry = { rule: "town_rule", applies_to: "records_request", units: "days", amount: 2, count: "business", starts: "received", closures: "fed", citation: "Code § 1", effective_from: "2026-01-01" };
  const draft = (e) => w.lf.ruleDraft({ section: "deadlines", entry: e, source: src, reason: "r", by: V("bob"), viewer: V("bob") });
  const r = ok(draft(entry));
  assert.equal(w.lf.groupRules({ viewer: V("dan") }).rules.find((x) => x.rule === r.rule).entry.closures, "forest-federal:fed");
  /* `town` is held by two city layers of two branches */
  const n = rows("local_rule_acts");
  const amb = row(draft({ ...entry, rule: "town_two", closures: "town" }), "NAME_AMBIGUOUS");
  assert.deepEqual(amb.layers.map((l) => l.layer).sort(), ["forest-city-a", "forest-city-b"]);
  assert.equal(rows("local_rule_acts"), n);
  /* the control: a name one layer gives, and an already-qualified one, resolve; the layer of the active set that gives it is named */
  const one = setup({ list: FOREST.chain });
  const q = ok(one.w.lf.ruleDraft({ section: "deadlines", entry: { ...entry, rule: "town_one", closures: "town" }, source: one.src, reason: "r", by: V("bob"), viewer: V("bob") }));
  assert.equal(one.w.lf.groupRules({ viewer: V("dan") }).rules.find((x) => x.rule === q.rule).entry.closures, "forest-city-a:town");
});

test("R25 a correction of a shipped layer's calendar fact stays the team's, marked; the layer is unchanged and factStatus states the layer it corrects", () => {
  const { w } = setup();
  const original = structuredClone(FOREST.chain[1]);
  const path = "forest-state/holidays/2026/list=state";
  assert.equal(parseFactPath(path).profile, "forest-state");
  assert.equal(ok(w.act(path, "correct", { value: [{ date: "2026-03-30", name: "closed" }], source: "the state's page" })).path, path);
  const s = w.status(path);
  assert.deepEqual([s.layer, s.status, s.governs.origin], ["forest-state", "corrected", "corrected"]);
  assert.match(s.governs.says, /bob/);
  assert.deepEqual(s.governs.value, [{ date: "2026-03-30", name: "closed" }]);
  assert.deepEqual(s.profile.value, [{ date: "2026-03-31", name: "closed" }], "the layer still says what it said");
  assert.deepEqual(get("forest-state"), null, "the held profiles are Civicsmith's own; the test layer is the fixture's");
  assert.equal(JSON.stringify(FOREST.chain[1]), JSON.stringify(original), "the layer's data is byte-identical");
  /* the zone too: a correction of a layer's zone is the team's */
  ok(w.act("forest-state/time_zone", "correct", { value: "America/Denver", source: "the page" }));
  assert.equal(w.status("forest-state/time_zone").layer, "forest-state");
  /* control: a deadline's amount is not a fact of R6 */
  row(w.act("forest-state/deadlines/state_answer", "correct", { value: 9, source: "s" }), "NO_SUCH_FACT");
});

test("R26 a team reports a rule it believes wrong: the report holds its key, the layer's value, the belief, the source and no handle; carrying marks it; the act makes no request", async () => {
  const { w, src, rows } = setup();
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => { calls += 1; throw new Error("no network"); };
  try {
    const said = { rule: "state_answer", amount: 7 };
    const rep = ok(w.lf.layerReport({ layer: "forest-state", key: "deadlines/state_answer/records_request", said, believes: "it should say 10 days", source: src, by: V("bob"), viewer: V("bob") }));
    assert.deepEqual([rep.report, rep.state], ["LR-1", "open"]);
    const listed = w.lf.layerReports({ viewer: V("dan") }).reports[0];
    assert.deepEqual([listed.layer, listed.key, listed.said, listed.believes, listed.source, listed.state, listed.layer_as_of],
                     ["forest-state", "deadlines/state_answer/records_request", said, "it should say 10 days", src, "open", "2026-01-01"]);
    const carried = ok(w.lf.layerReportCarry({ report: rep.report, by: V("carol"), viewer: V("carol") }));
    assert.equal(carried.already, false);
    assert.equal(carried.digest, createHash("sha256").update(carried.bytes).digest("hex"));
    const offer = JSON.parse(carried.bytes);
    assert.deepEqual(Object.keys(offer).sort(), ["believes", "key", "layer", "layer_as_of", "layer_version", "said", "source"]);
    assert.equal(carried.bytes.includes("member:"), false, "no handle in what is carried");
    assert.equal(w.lf.layerReports({ viewer: V("dan") }).reports[0].state, "carried");
    assert.equal(ok(w.lf.layerReportCarry({ report: rep.report, by: V("carol"), viewer: V("carol") })).already, true);
    assert.equal(rows("layer_reports"), 2, "a repeat writes nothing");
    /* an address with the passage is a source as well */
    ok(w.lf.layerReport({ layer: "forest-state", key: "k", said: 1, believes: "b", source: { address: "https://records.example/rule", passage: "ten days" }, by: V("bob") }));
  } finally { globalThis.fetch = realFetch; }
  assert.equal(calls, 0, "no network request is made");
  /* refusals in order, each writing nothing; the control for each */
  const n = rows("layer_reports");
  const base = { layer: "forest-state", key: "k", said: 1, believes: "b", source: src, by: V("bob"), viewer: V("bob") };
  row(w.lf.layerReport({ ...base, by: MACHINE }), "MACHINE_CANNOT_DRAFT_RULE");
  row(w.lf.layerReport({ ...base, layer: "nowhere" }), "LAYER_UNKNOWN");
  row(w.lf.layerReport({ ...base, layer: "team" }), "LAYER_NOT_SHIPPED");
  for (const source of [undefined, {}, { address: "x" }, { captureSha: sha("not held"), extent: { kind: "document" } }]) row(w.lf.layerReport({ ...base, source }), "REPORT_NO_SOURCE");
  for (const believes of ["", "  ", "x".repeat(1001), undefined]) row(w.lf.layerReport({ ...base, believes }), "REPORT_NO_BELIEF");
  row(w.lf.layerReportCarry({ report: "LR-99", by: V("carol") }), "NO_SUCH_LAYER_REPORT");
  row(w.lf.layerReportCarry({ report: "LR-1", by: MACHINE }), "MACHINE_CANNOT_DRAFT_RULE");
  assert.equal(rows("layer_reports"), n);
  assert.equal(ok(w.lf.layerReport({ ...base, believes: "x".repeat(1000) })).ok, true, "1,000 characters stand");
  assert.deepEqual(w.lf.layerReports({ viewer: "nobody" }), { ok: true, reports: [], count: 0 });
});

test("R27 a confirmation recorded under the package's path before the split is the status of the same fact under its layer's path, with the same member, date and how; a path naming no layer or package is NO_SUCH_FACT", () => {
  /* `oakland-alameda` is the one shipped package; the setting still names it, as an update leaves it (instance-setup R111) */
  const w = world({ profiles: ["oakland-alameda"], own: [] });
  const old = "oakland-alameda/holidays/2026/list=judicial";
  const layered = "us-california/holidays/2026/list=judicial";
  /* the act as the module recorded it before the split: under the package's path, no row rewritten */
  w.st.sql.exec(`INSERT INTO local_fact_acts (path, profile, act, how, value_json, source, by_member, at) VALUES (?, 'oakland-alameda', 'confirm', 'the court page', ?, NULL, 'member:bob', '2026-09-20T10:00:00Z')`,
                old, JSON.stringify(w.status(layered).governs.value));
  const before = JSON.stringify(w.rows(`SELECT * FROM local_fact_acts`));
  for (const path of [layered, old]) {
    const s = w.status(path);
    assert.equal(s.status, "confirmed", path);
    assert.deepEqual([s.latest.by, s.latest.at, s.latest.how], ["member:bob", "2026-09-20T10:00:00Z", "the court page"], path);
    assert.equal(s.layer, "us-california");
  }
  assert.deepEqual([w.status(old).path, w.status(old).layer_path], [old, layered], "answered under the path asked, the layer's beside it");
  assert.equal(w.status(layered).path, layered);
  /* a new act under either spelling is recorded under the layer's path */
  const c = ok(w.act(old, "dispute"));
  assert.equal(c.path, layered);
  assert.equal(w.rows(`SELECT path FROM local_fact_acts ORDER BY seq`).at(-1).path, layered);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM local_fact_acts ORDER BY seq`).slice(0, 1)), JSON.parse(before).length ? JSON.stringify(JSON.parse(before)) : "", "no stored row is rewritten");
  assert.equal(w.status(layered).status, "disputed");
  assert.deepEqual(w.lf.factsDue({ paths: [old] }).due.map((d) => [d.path, d.layer_path]), [[old, layered]]);
  assert.deepEqual(w.lf.factsDue({ paths: [layered] }).due.map((d) => d.path), [layered]);
  /* the control: a path naming no layer or package */
  row(w.act("not-a-layer/holidays/2026/list=judicial", "confirm"), "NO_SUCH_FACT");
  row(w.act("oakland-alameda/holidays/1999/list=judicial", "confirm"), "NO_SUCH_FACT");
  assert.equal(w.lf.factStatus({ path: "oakland-alameda/holidays/1999" }).code, "NO_SUCH_FACT");
  /* governingPath named by the package reads through its layers */
  assert.equal(w.lf.governingPath({ profile: "oakland-alameda", fact: "time_zone" }).ok, true);
});

test("R29 each layer's list of one name is its own fact: two cities' lists `town` are confirmed apart, each status its own; a team government's lists are told apart by the government", () => {
  const { w, draft, confirm } = setup();
  const a = "forest-city-a/holidays/2026/list=town", b = "forest-city-b/holidays/2026/list=town";
  assert.deepEqual([w.status(a).layer, w.status(b).layer], ["forest-city-a", "forest-city-b"]);
  ok(w.act(a, "confirm", { how: "the city a page" }));
  assert.deepEqual([w.status(a).status, w.status(b).status], ["confirmed", "unconfirmed"], "a count in the second city reads the second city's status");
  assert.equal(w.status(b).governs.value[0].date, "2026-06-08");
  /* the team layer: the same list name about two governments, two facts */
  const e1 = ok(draft({ entry: fest({ list: "town" }), government: A })).entry;
  const e2 = ok(draft({ entry: festB({ list: "town" }), government: B })).entry;
  ok(confirm(e1)); ok(confirm(e2));
  const pa = factPath({ profile: "team", government: A, fact: "holidays", year: 2027, list: "town" });
  const pb = factPath({ profile: "team", government: B, fact: "holidays", year: 2028, list: "town" });
  assert.deepEqual([pa, pb], ["team/city:Aburg/holidays/2027/list=town", "team/city:Bburg/holidays/2028/list=town"]);
  assert.deepEqual(parseFactPath(pa), { profile: "team", fact: "holidays", year: 2027, list: "town", government: A });
  ok(w.act(pa, "confirm", { how: "the code" }));
  assert.deepEqual([w.status(pa).status, w.status(pb).status], ["confirmed", "unconfirmed"]);
  assert.equal(w.status(pb).governs.value[0].name, "Other Festival");
  assert.deepEqual([w.status(pa).layer, w.status(pa).government], ["team", A]);
  /* the path of a government's year another government holds is no fact */
  row(w.act(factPath({ profile: "team", government: B, fact: "holidays", year: 2027, list: "town" }), "confirm"), "NO_SUCH_FACT");
  /* a correction of a team fact is the team's, of that government's year alone */
  ok(w.act(pb, "correct", { value: [{ date: "2028-07-02", name: "Moved" }], source: "the clerk" }));
  assert.equal(w.status(pb).governs.value[0].name, "Moved");
  assert.equal(w.status(pa).governs.value[0].name, "Festival");
  assert.ok(w.lf.factStatus({}).facts.some((f) => f.path === pa), "listed with the others");
  /* paths: the federal government has no place; a place is encoded; a state is a government a path may name */
  assert.equal(factPath({ profile: "team", government: { level: "federal" }, fact: "fiscal_year" }), "team/federal/fiscal_year");
  assert.equal(factPath({ profile: "team", government: { level: "federal", place: "x" }, fact: "fiscal_year" }), null);
  assert.equal(factPath({ profile: "team", government: { level: "district", place: "x" }, fact: "fiscal_year" }), null);
  assert.equal(factPath({ profile: "team", fact: "holidays", year: 2026 }), null);
  assert.equal(factPath({ profile: "forest-state", government: A, fact: "holidays", year: 2026 }), null);
});

/* R31, R32: a government's fiscal year a member states */
/* Bburg's own layer gives no year (Aburg's gives a `*` one, and county B's covers only the county): a government for a member to state */
const Y = { body: "Bburg", start: "04-01", named_by: "start", label: "FY{start}-{end2}" };
const FY_A = "team/city:Bburg/fiscal_year";
const stateYear = (w, over = {}) => w.act(FY_A, "correct", { how: "the city's own budget page, read today", value: Y, source: undefined, ...over });

test("R31 where the records give no year a member states one with how they checked it: it governs for that government with origin team, needing no second member nor a source; a repeat replaces it and both acts stay", () => {
  const { w } = setup({ list: FOREST.chain });
  assert.equal(w.status(FY_A).status, "absent", "nothing stated yet");
  row(w.act(FY_A, "confirm"), "NO_SUCH_FACT");
  row(w.act(FY_A, "dispute"), "NO_SUCH_FACT");
  const r = ok(stateYear(w));
  assert.equal(r.path, FY_A);
  const fy = w.lf.governingView().view.fiscal_year.find((y) => y.body === "Bburg");
  assert.deepEqual([fy.start, fy.origin, fy.government], ["04-01", "team", B]);
  assert.equal(fy.basis, undefined, "no basis");
  assert.deepEqual(w.lf.teamLayer({ viewer: V("dan") }).fiscal_year, [{ ...Y, government: B }]);
  ok(stateYear(w, { value: { ...Y, start: "07-01" }, how: "the clerk, by phone" }));
  assert.equal(w.lf.governingView().view.fiscal_year.filter((y) => y.body === "Bburg").length, 1);
  assert.equal(w.lf.governingView().view.fiscal_year.find((y) => y.body === "Bburg").start, "07-01", "the repeat governs");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM local_fact_acts WHERE path=?`, FY_A)[0].n, 2, "both acts stay");
  assert.deepEqual(w.lf.layerEntries({ viewer: V("dan"), section: "fiscal_year" }).entries.map((e) => [e.state, e.how]), [["stated", "the city's own budget page, read today"], ["stated", "the clerk, by phone"]]);
  /* the layer's own zone is unaffected: stating the time zone behaves as R21 states */
  ok(w.act("@team/time_zone", "correct", { value: "America/Denver", source: "the board" }));
  assert.equal(w.status("@team/time_zone").status, "corrected");
});

test("R31 refusals in order, each writing nothing: a machine or unstamped by, how, an entry the layer refuses (naming the field), the records' own different entry, the records' equal one or a * entry", () => {
  const { w, rows } = setup({ list: FOREST.all.filter((l) => l.id !== "team") });
  const n = () => [rows("local_fact_acts"), rows("team_layers")];
  const before = n();
  for (const by of [MACHINE, "", undefined]) row(w.act(FY_A, "correct", { how: "h", value: Y, by }), "MACHINE_CANNOT_CONFIRM");
  for (const how of ["", undefined, "x".repeat(501)]) row(stateYear(w, { how }), "FACT_HOW_REFUSED");
  const named = (v, field) => { const r = row(stateYear(w, { value: v }), "FACT_VALUE_REFUSED"); assert.equal(r.field, field, JSON.stringify(v)); };
  named({ ...Y, body: "*" }, "body"); named({ ...Y, body: "" }, "body"); named({ ...Y, body: "x".repeat(201) }, "body");
  named({ ...Y, start: "13-40" }, "start"); named({ ...Y, named_by: "middle" }, "named_by"); named({ ...Y, label: 3 }, "label");
  named({ ...Y, extra: 1 }, "extra"); named(undefined, "fiscal_year[0]");
  assert.equal(row(w.act("team/district:Aburg/fiscal_year", "correct", { how: "h", value: Y }), "FACT_VALUE_REFUSED").field, "government.level");
  assert.equal(row(w.act("team/federal:x/fiscal_year", "correct", { how: "h", value: Y }), "FACT_VALUE_REFUSED").field, "government.level");
  /* a government a Civicsmith layer covers: Bville County's records give `*` (so any year of it is theirs); Aburg's city layer gives `*` too */
  const star = row(w.act("team/county:Bville%20County/fiscal_year", "correct", { how: "h", value: { ...Y, body: "Bville County" } }), "FISCAL_YEAR_IN_RECORDS");
  assert.deepEqual([star.layer, star.government, star.year.start], ["forest-county-b", { level: "county", place: "Bville County" }, "07-01"]);
  row(w.act("team/city:Aburg/fiscal_year", "correct", { how: "h", value: { ...Y, start: "10-01" } }), "FISCAL_YEAR_IN_RECORDS");
  assert.deepEqual(n(), before, "nothing was written");
  /* the control: a government no layer covers states its own; the federal one needs no place */
  ok(w.act("team/city:Zburg/fiscal_year", "correct", { how: "h", value: { ...Y, body: "Zburg" } }));
  ok(w.act("team/federal/fiscal_year", "correct", { how: "h", value: { ...Y, body: "Federal government" } }));
  ok(w.act("team/state:Stateia/fiscal_year", "correct", { how: "h", value: { ...Y, body: "Stateia" } }));
  /* a year the records' layer gives with a DIFFERENT own entry (by body): R23's refusal */
  const forest = forestCopy(FOREST.chain);
  forest[3].fiscal_year = [{ body: "Aburg Mayor's Office", start: "01-01", named_by: "start", label: "FY{start}", status: "researched", basis: "TEST" }];
  const w2 = world({ profiles: ids(forest), own: forest });
  const AB = "team/city:Aburg/fiscal_year";
  const diff = row(w2.act(AB, "correct", { how: "h", value: { ...Y, body: "Aburg Mayor's Office" } }), "LAYER_ENTRY_IN_SHIPPED");
  assert.deepEqual([diff.layer, diff.year.start], ["forest-city-a", "01-01"]);
  row(w2.act(AB, "correct", { how: "h", value: { ...Y, body: "Aburg Mayor's Office", start: "01-01", label: "FY{start}" } }), "FISCAL_YEAR_IN_RECORDS");
  assert.equal(w2.rows(`SELECT COUNT(*) AS n FROM local_fact_acts`)[0].n, 0);
});

test("R32 a stated year's standing is read as the time zone's: its path round-trips, factStatus answers status, layer team, how and `stated by`; it lapses at the horizon and still governs; a dispute reads disputed; two governments are two facts", () => {
  const { w } = setup({ list: FOREST.chain, now: "2026-09-28T01:00:00.000Z" });
  for (const g of [A, { level: "state", place: "Stateia" }, { level: "federal" }]) {
    const p = factPath({ profile: "team", government: g, fact: "fiscal_year" });
    assert.deepEqual(parseFactPath(p), { profile: "team", fact: "fiscal_year", government: g });
  }
  ok(stateYear(w));
  const s = w.status(FY_A);
  assert.deepEqual([s.status, s.layer, s.how, s.latest.by], ["confirmed", "team", "the city's own budget page, read today", "member:bob"]);
  assert.match(s.governs.says, /^stated by member:bob, 2026-09-27$/);
  assert.deepEqual(s.governs.value, Y);
  /* confirmed by another member; a machine may not */
  row(w.act(FY_A, "confirm", { by: MACHINE }), "MACHINE_CANNOT_CONFIRM");
  ok(w.act(FY_A, "confirm", { by: V("carol"), how: "read it again" }));
  assert.equal(w.status(FY_A).latest.by, "member:carol");
  /* the horizon is 183 days, one number as the zone's: after it, unconfirmed, and the year still governs */
  w.at("2027-03-28T12:00:00.000Z");
  assert.equal(w.status(FY_A).status, "confirmed");
  w.at("2027-03-29T12:00:00.000Z");
  const lapsed = w.status(FY_A);
  assert.deepEqual([lapsed.status, lapsed.due, lapsed.lapses_on], ["unconfirmed", true, "2027-03-29"]);
  assert.equal(w.lf.governingView().view.fiscal_year.find((y) => y.body === "Bburg").start, "04-01");
  assert.ok(w.lf.factsDue({}).due.some((d) => d.path === FY_A));
  ok(w.act(FY_A, "dispute", { by: V("dan"), how: "the page says otherwise" }));
  assert.equal(w.status(FY_A).status, "disputed");
  /* two governments' statements are two facts, confirmed apart */
  const FY_B = "team/city:Zburg/fiscal_year";
  ok(w.act(FY_B, "correct", { how: "h", value: { ...Y, body: "Zburg", start: "01-01" } }));
  assert.deepEqual([w.status(FY_A).status, w.status(FY_B).status], ["disputed", "confirmed"]);
  /* `@team/time_zone` and the rows written before are unchanged */
  assert.equal(w.status("@team/time_zone").status, "unconfirmed", "the zone the layers give, as R21 reads it");
  assert.equal(w.lf.factStatus({}).facts.filter((f) => f.fact.fact === "fiscal_year").length, 2);
});

test("R32 a stated year the places' records later give differently is set aside by them, not in conflicts, and the team's statement stays on file", () => {
  const w0 = setup({ list: SHIPPED });
  ok(stateYear(w0.w));
  assert.equal(w0.w.status(FY_A).set_aside, undefined);
  /* the same team record read with a layer arriving that gives Aburg another year (an update): the records' year governs */
  const forest = forestCopy(SHIPPED);
  const cityB = forest.find((l) => l.id === "forest-city-b");
  cityB.counterparties = [{ role: "Mayor", body: "Bburg", level: "city", elected: true, basis: "TEST" }];
  cityB.fiscal_year = [{ body: "Bburg", start: "10-01", named_by: "start", label: "FY{start}-{end2}", status: "researched", basis: "TEST" }];
  const w1 = world({ profiles: ids(forest), own: forest });
  w1.st.sql.exec(`INSERT INTO team_layers (draft_seq, act, section, government_json, entry_json, reason, by_member, at) VALUES (NULL, 'state', 'fiscal_year', ?, ?, 'h', 'member:bob', '2026-09-20T10:00:00Z')`,
                 JSON.stringify(B), JSON.stringify(Y));
  w1.st.sql.exec(`INSERT INTO local_fact_acts (path, profile, act, how, value_json, source, by_member, at) VALUES (?, 'team', 'correct', 'h', ?, NULL, 'member:bob', '2026-09-20T10:00:00Z')`, FY_A, JSON.stringify(Y));
  const gv = w1.lf.governingView();
  assert.equal(gv.view.fiscal_year.find((y) => y.body === "Bburg").start, "10-01");
  assert.equal(gv.conflicts.some((c) => String(c.at).includes("fiscal_year")), false);
  assert.equal(gv.view.set_aside[0].entry.start, "04-01");
  const s = w1.status(FY_A);
  assert.equal(s.set_aside.by, "forest-city-b");
  assert.equal(w1.rows(`SELECT COUNT(*) AS n FROM local_fact_acts`)[0].n, 1, "the statement stays on file");
});

/* R20: each new op this module declares is held true against the op as the door runs it */
const sameCode = (x, y) => x && y && x.ok === y.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
const words = (v) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
/* a refusal names a field by its code (the table) or, as the default does, by the field as a whole word of its code or detail */
const named = (codes) => (answer, field) => !!answer && typeof answer === "object" && ((codes[field] || []).some((c) => answer.code === c)
  || new RegExp(`(^|[^\\w])${field}($|[^\\w])`).test([answer.code, answer.detail].map(words).join(" ")));
const door = (op, stamps, build) => async (given) => {
  const env = setup();
  const fields = build ? build(given, env) : given;
  const url = new URL("http://x/?" + new URLSearchParams({ op, ...stamps }));
  return localFactsOps(env.w.lf, url, fields)[op]();
};

test("R20 local-facts declares layerentrydraft: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "layerentrydraft", declaration: DECLARED_OPS.layerentrydraft,
    call: door("layerentrydraft", { viewer: "member:bob" }, (f, env) => ({ ...f, by: V("bob"), ...("source" in f ? { source: env.src } : {}), ...("section" in f ? { section: "holidays" } : {}), ...("entry" in f ? { entry: fest() } : {}), ...("government" in f ? { government: A } : {}) })),
    refusedNaming: named({ section: ["RULE_SECTION_UNKNOWN"], entry: ["RULE_ENTRY_INVALID"], government: ["RULE_ENTRY_INVALID"], source: ["RULE_NO_SOURCE"], reason: ["RULE_NO_REASON"] }),
    values: { reason: "the city's own code" }, same: sameCode });
});

test("R20 local-facts declares layerreport: its requires alone raise no refusal naming a field, each missing one is refused naming it, and a field outside accepts is dropped or refused", async () => {
  await declaredOpHolds({ op: "layerreport", declaration: DECLARED_OPS.layerreport,
    call: door("layerreport", { viewer: "member:bob" }, (f, env) => ({ ...f, by: V("bob"), ...("source" in f ? { source: env.src } : {}), ...("layer" in f ? { layer: "forest-state" } : {}), ...("key" in f ? { key: "k" } : {}), ...("said" in f ? { said: 1 } : {}), ...("believes" in f ? { believes: "b" } : {}) })),
    refusedNaming: named({ layer: ["LAYER_UNKNOWN"], key: ["RULE_ENTRY_INVALID"], said: ["RULE_ENTRY_INVALID"], believes: ["REPORT_NO_BELIEF"], source: ["REPORT_NO_SOURCE"] }),
    values: { believes: "it should say ten days" }, same: sameCode });
});

test("R23 R26 the new ops: the arms reach the services, the viewer read from the URL, and every refusal is its row (C-126.17 to C-126.26 are reached at the interface)", () => {
  const { w, draft, confirm, src } = setup();
  const url = (q) => new URL(`https://plane.example/?${q}`);
  const e = localFactsOps(w.lf, url("viewer=member%3Abob"), { section: "holidays", entry: fest(), government: A, source: src, reason: "r", by: V("bob") }).layerentrydraft();
  assert.equal(e.ok, true);
  assert.equal(localFactsOps(w.lf, url("viewer=member%3Acarol"), { entry: e.entry, by: V("carol"), viewer: "nobody" }).layerentryconfirm().ok, true, "the body cannot set the viewer");
  assert.equal(localFactsOps(w.lf, url("viewer=member%3Adan"), null).layerentries().count, 1);
  assert.equal(localFactsOps(w.lf, url("viewer=nobody"), null).layerentries().count, 0);
  const got = new Map();
  for (const r of [draft({ layer: "forest-state" }), draft({ layer: "zz" }), w.lf.layerReport({ layer: "team", key: "k", said: 1, believes: "b", source: src, by: V("bob") }),
                   draft({ section: "deadlines", entry: dl({ rule: "fed_answer", amount: 1, closures: "fed", count: "business" }) }),
                   w.lf.layerReport({ layer: "forest-state", key: "k", said: 1, believes: "b", by: V("bob") }),
                   w.lf.layerReport({ layer: "forest-state", key: "k", said: 1, source: src, by: V("bob") }),
                   w.lf.ruleDraft({ section: "deadlines", entry: { rule: "town_two", applies_to: "records_request", units: "days", amount: 2, starts: "received", closures: "town", citation: "c", effective_from: "2026-01-01" }, source: src, reason: "r", by: V("bob") }),
                   w.lf.layerEntryConfirm({ entry: "LE-99", by: V("carol") }, undefined), w.lf.layerReportCarry({ report: "LR-99", by: V("carol") }),
                   w.act("team/city:Aburg/fiscal_year", "correct", { how: "h", value: { ...Y, start: "04-01" } }) && w.act("team/county:Bville%20County/fiscal_year", "correct", { how: "h", value: { ...Y, body: "Bville County" } })])
    got.set(r.code, r);
  assert.deepEqual([...got.keys()].sort(), ["FISCAL_YEAR_IN_RECORDS", "LAYER_ENTRY_IN_SHIPPED", "LAYER_NOT_SHIPPED", "LAYER_READ_ONLY", "LAYER_UNKNOWN", "NAME_AMBIGUOUS",
    "NO_SUCH_LAYER_ENTRY", "NO_SUCH_LAYER_REPORT", "REPORT_NO_BELIEF", "REPORT_NO_SOURCE"]);
  for (const [code, r] of got) assert.deepEqual([r.check, r.translation], [LOCAL_FACTS_CHECKS[code].check, LOCAL_FACTS_CHECKS[code].translation], code);
  assert.deepEqual(Object.keys(LOCAL_FACTS_CHECKS).slice(16).map((c) => LOCAL_FACTS_CHECKS[c].check), Array.from({ length: 10 }, (_, i) => `C-126.${17 + i}`));
  assert.ok(confirm);
});

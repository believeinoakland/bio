/* runtime-limits: the beta's per-kind bounds, the service levels, the time classes, the room in a jurisdiction and the mail rows
 * (R37-R46; T53; N1267, N1273, N824; K4354, K5427, K5438, K5440, K5441, K5527, K5569). Rows are checked by their invariants and the figures the
 * requirements state, never by counting the table. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { READ_BOUNDS, boundOf, statement, wholeReadRow, levelOf, levelFigures, levelFiguresOf, budgetOf } from "../../../src/read-bounds.mjs";
import { STORE_JURISDICTIONS, STORE_HINTS, storeJurisdiction, storeId, storeStub } from "../../../src/store-place.mjs";

const MiB = 1048576, GiB = 1073741824, MB50 = 52428800, MB100 = 104857600;

/* ---------- R37: the beta's per-kind bounds ---------- */
test("R37: the whole-read row of each kind is the beta's figure, and a file at bound + 1 is stated with its size and the limit", () => {
  const want = [
    ["document", MB100], ["text", MB100], ["spreadsheet", MB50], ["image", MB50], ["archive", 524288000], ["message", MB100],
    ["pdf", MB100], ["csv", MB50],
  ];
  for (const [kind, n] of want) {
    const [k, name] = wholeReadRow(kind);
    assert.equal(boundOf(k, name), n, kind);
    const s = statement(k, name, n + 1);
    assert.equal(s.size, n + 1, kind);
    assert.equal(s.bound, n, kind);
    assert.equal(s.key, READ_BOUNDS[k][name].key, kind);
  }
});

test("R37: the second limit of each kind (pages, rows, unpacked bytes, members, ratio, depth) and the protective limits answer their figures", () => {
  assert.equal(boundOf("document", "pages"), 5000);
  assert.equal(boundOf("spreadsheet", "rows"), 1048576);
  assert.equal(boundOf("spreadsheet", "xls_sheet_rows"), 65536);
  assert.equal(READ_BOUNDS.archive.unpacked_bytes.standard, 2 * GiB, "the beta's unpacked figure is the standard; the reader that unpacks takes it when its job moves its own rows");
  assert.equal(boundOf("archive", "members"), 10000);
  assert.equal(boundOf("archive", "ratio"), 1100);
  assert.equal(boundOf("archive", "depth"), 3);
  assert.equal(boundOf("archive", "mailbox_messages"), 100000);
  assert.equal(boundOf("text", "nesting"), 1000);
  assert.equal(boundOf("text", "calendar_events"), 100000);
  for (const [kind, name] of [["document", "pages"], ["spreadsheet", "rows"], ["archive", "mailbox_messages"], ["text", "nesting"], ["text", "calendar_events"]]) {
    assert.equal(READ_BOUNDS[kind][name].protective, boundOf(kind, name), `${kind}/${name}`);
    assert.deepEqual(statement(kind, name, boundOf(kind, name) + 1).bound, boundOf(kind, name));
  }
});

test("R37: the alpha figures stay in the alpha column; the beta is never below the alpha", () => {
  assert.equal(READ_BOUNDS.pdf.bytes.alpha, 24 * MiB);
  assert.equal(READ_BOUNDS.archive.uploaded_bytes.alpha, 256 * MiB);
  assert.equal(READ_BOUNDS.xlsx.declared_text.alpha, 32 * MiB);
  for (const kind of ["document", "text", "spreadsheet", "image", "archive", "message", "pdf", "csv"]) {
    const [k, n] = wholeReadRow(kind);
    assert.ok(boundOf(k, n) >= READ_BOUNDS[k][n].alpha, kind);
  }
});

test("R37: SIZES-N1267.md §2's figures are each found in the table", () => {
  const path = new URL("../../../../build/plan/beta/files/SIZES-N1267.md", import.meta.url);
  if (!existsSync(path)) return; // the planning file moves with the tranche's close; the figures below stand on their own
  const md = readFileSync(path, "utf8");
  const section = md.slice(md.indexOf("## 2."), md.indexOf("## 3."));
  const standards = new Set(Object.entries(READ_BOUNDS).filter(([k]) => k !== "level" && k !== "time").flatMap(([, names]) => Object.values(names).map((r) => r.standard)));
  const found = [];
  for (const m of section.matchAll(/(\d[\d,]*) (MB|GB)\b/g)) found.push(Number(m[1].replace(/,/g, "")) * (m[2] === "MB" ? MiB : GiB));
  for (const m of section.matchAll(/(\d[\d,]*) (pages|members)\b/g)) found.push(Number(m[1].replace(/,/g, "")));
  for (const m of section.matchAll(/ratio (\d[\d,]*)/g)) found.push(Number(m[1].replace(/,/g, "")));
  assert.ok(found.length >= 9, "the section's figures were read");
  for (const n of found) {
    if (n === 500 * MiB || standards.has(n)) continue;
    assert.fail(`${n} is in SIZES-N1267 §2 and in no row's standard`);
  }
  assert.ok(standards.has(65536), "XLS rows a sheet");
});

test("R37 (control): a row R37 does not name keeps its active figure", () => {
  assert.equal(boundOf("workbook", "bytes"), 20 * MiB);
  assert.equal(boundOf("capture", "keep_bytes"), 32 * MiB);
  assert.equal(boundOf("sheet", "columns"), 16384);
  assert.equal(boundOf("scan", "max_bytes"), 256 * MiB);
});

/* ---------- R38-R40: the service levels ---------- */
const LEVEL_FIELDS = ["cf_plan", "design_stage", "interpretation_bytes", "interpretation_rows", "measured", "members_at_once", "name", "record_bytes", "upload_bytes"];

test("R38: the three levels are rows of the one table, kind level, each with its own fields; the byte kinds' four-field shape is unchanged", () => {
  assert.deepEqual(Object.keys(READ_BOUNDS.level), ["team", "institution", "enterprise"]);
  for (const row of Object.values(READ_BOUNDS.level)) {
    assert.deepEqual(Object.keys(row).sort(), LEVEL_FIELDS);
    assert.deepEqual(Object.keys(row.record_bytes).sort(), ["database", "r2"], "database and R2 apart");
    assert.equal(row.measured, null, "measured is null until a load-test row is recorded");
  }
  assert.throws(() => boundOf("level", "team"), (e) => e instanceof Error && e.message.includes("level"));
  assert.throws(() => statement("time", "read_act", 1), (e) => e instanceof Error && e.message.includes("time"));
});

test("R38: levelOf answers 1, 2 or 3 from the declared design stage and plan; an undeclared copy answers 1; a higher plan alone does not raise it (PL25)", () => {
  assert.equal(levelOf({ design_stage: "one_room", cf_plan: "workers_paid" }), 1);
  assert.equal(levelOf({ design_stage: "split_record", cf_plan: "workers_paid" }), 2);
  assert.equal(levelOf({ design_stage: "split_record", cf_plan: "business" }), 2);
  assert.equal(levelOf({ design_stage: "split_cached", cf_plan: "enterprise" }), 3);
  assert.equal(levelOf({ design_stage: "split_cached", cf_plan: "business" }), 2, "Level 3 needs Enterprise");
  for (const copy of [undefined, null, {}, { design_stage: "bogus" }, { cf_plan: "enterprise" }, { design_stage: "one_room", cf_plan: "business" }, { design_stage: "one_room", cf_plan: "enterprise" }, { design_stage: "__proto__" }]) {
    assert.equal(levelOf(copy), 1, JSON.stringify(copy));
  }
  for (const row of Object.values(READ_BOUNDS.level)) assert.equal(levelOf(row), Object.keys(READ_BOUNDS.level).indexOf(row.name) + 1, row.name);
});

test("R39, R40: levelFigures throws a TypeError naming the level while unmeasured; a measured fixture level answers its figures and its interpretation ceiling; levelOf still answers", () => {
  for (const l of [1, 2, 3]) {
    assert.throws(() => levelFigures(l), (e) => e instanceof TypeError && e.message.includes(["team", "institution", "enterprise"][l - 1]), `level ${l}`);
  }
  assert.throws(() => levelFigures(4), Error);
  assert.throws(() => levelFigures("team"), Error);
  const fixture = { ...READ_BOUNDS.level.team, members_at_once: 20, measured: { source: "PLATFORM.md P-M1" }, interpretation_rows: 500000, interpretation_bytes: 4 * GiB };
  const f = levelFiguresOf(fixture);
  assert.equal(f.members_at_once, 20);
  assert.equal(f.interpretation_rows, 500000);
  assert.equal(f.interpretation_bytes, 4 * GiB);
  assert.deepEqual(f.measured, { source: "PLATFORM.md P-M1" });
  assert.throws(() => { "use strict"; f.members_at_once = 1; }, TypeError);
  assert.throws(() => levelFiguresOf({ ...fixture, measured: null }), TypeError);
  assert.throws(() => levelFiguresOf({ ...fixture, interpretation_rows: null, measured: null }), TypeError, "an unmeasured level has no interpretation ceiling");
  assert.equal(levelOf({ design_stage: "split_record" }), 2);
});

/* ---------- R41, R42: the time classes ---------- */
const CLASSES = {
  screen_load: [2000, 3], screen_move: [2000, 2], screen_load_phone: [2000, 3], read_act: [1000, 2], shell_act: [500, 1], write_act: [2000, 2],
  web_capture_plain: [5000, null], web_capture_visitor: [15000, null], file_capture: [2000, null], ai_act: [60000, 2], gate_run: [1800000, 2],
  follow: [1000, 2], explore: [2000, 2],
};

test("R41: the thirteen classes are rows of the one table, each with its ceiling, p90 factor 1.5, hops and source; the map is deeply frozen", () => {
  assert.deepEqual(Object.keys(READ_BOUNDS.time).sort(), Object.keys(CLASSES).sort());
  for (const [name, [ceiling_ms, hops]] of Object.entries(CLASSES)) {
    const b = budgetOf(name);
    assert.equal(b.ceiling_ms, ceiling_ms, name);
    assert.equal(b.hops, hops, name);
    assert.equal(b.p90_factor, 1.5, name);
    assert.ok(typeof b.source === "string" && b.source.length > 0, `${name} source`);
  }
  for (const name of ["ai_act", "gate_run"]) assert.equal(budgetOf(name).ack_ms, 2000, name);
  assert.equal(budgetOf("web_capture_visitor").source, "K4354");
  assert.throws(() => { "use strict"; READ_BOUNDS.time.read_act.ceiling_ms = 1; }, TypeError);
  assert.throws(() => { "use strict"; READ_BOUNDS.time.extra = {}; }, TypeError);
  assert.throws(() => budgetOf("nope"), (e) => e instanceof Error && e.message.includes("nope"));
  for (const bad of ["__proto__", "constructor", undefined, 3, {}]) assert.throws(() => budgetOf(bad), Error, String(bad));
});

test("R42: a row's own ceiling is accepted below its class's and refused above, naming the class; no override answers the class's ceiling", () => {
  assert.equal(budgetOf({ class: "screen_load", ceiling_ms: 1500 }).ceiling_ms, 1500);
  assert.equal(budgetOf({ class: "screen_load", ceiling_ms: 1500 }).hops, 3);
  assert.equal(budgetOf({ class: "screen_load", ceiling_ms: 2000 }).ceiling_ms, 2000);
  assert.equal(budgetOf({ class: "read_act" }).ceiling_ms, 1000);
  assert.throws(() => budgetOf({ class: "read_act", ceiling_ms: 1001 }), (e) => e instanceof Error && e.message.includes("read_act"));
  assert.throws(() => budgetOf({ class: "read_act", ceiling_ms: 0 }), Error);
  assert.throws(() => budgetOf({ class: "read_act", ceiling_ms: NaN }), Error);
  assert.throws(() => budgetOf({ class: "nope", ceiling_ms: 1 }), (e) => e.message.includes("nope"));
  assert.equal(READ_BOUNDS.time.screen_load.ceiling_ms, 2000, "the class row is not changed by an override");
});

/* ---------- R43-R45: the room in a jurisdiction ---------- */
function recorder() {
  const calls = [];
  const mk = (jur) => ({
    idFromName: (n) => { calls.push([jur ?? "-", "idFromName", n]); return { id: `${jur ?? "-"}:${n}` }; },
    get: (...a) => { calls.push([jur ?? "-", "get", ...a]); return { stub: a[0].id }; },
  });
  const STORE = { ...mk(null), jurisdiction: (j) => { calls.push(["jurisdiction", j]); return mk(j); } };
  return { STORE, calls };
}

test("R43: STORE_JURISDICTIONS is the frozen list eu, us, fedramp; storeJurisdiction answers a value exactly one of them, else null", () => {
  assert.deepEqual([...STORE_JURISDICTIONS], ["eu", "us", "fedramp"]);
  assert.ok(Object.isFrozen(STORE_JURISDICTIONS));
  for (const j of STORE_JURISDICTIONS) assert.equal(storeJurisdiction({ STORE_JURISDICTION: j }), j);
  for (const bad of ["", " eu", "EU", "eu ", "wnam", "bogus", 5, null, undefined, {}, ["eu"]]) assert.equal(storeJurisdiction({ STORE_JURISDICTION: bad }), null, String(bad));
  assert.equal(storeJurisdiction({}), null);
  assert.equal(storeJurisdiction(undefined), null);
  assert.ok(!STORE_HINTS.includes("eu"), "a hint is never a jurisdiction");
});

test("R43: with a jurisdiction the room comes from STORE.jurisdiction(j), the same name gives a different id in each, and a hint alone behaves as R27 and R28 state", () => {
  const { STORE, calls } = recorder();
  const ids = STORE_JURISDICTIONS.map((j) => storeId({ STORE, STORE_JURISDICTION: j }, "bio").id);
  assert.equal(new Set(ids).size, 3);
  calls.length = 0;
  assert.deepEqual(storeStub({ STORE, STORE_JURISDICTION: "eu" }, "bio"), { stub: "eu:bio" });
  assert.deepEqual(calls, [["jurisdiction", "eu"], ["eu", "idFromName", "bio"], ["eu", "get", { id: "eu:bio" }]]);
  assert.equal(calls[2].length, 3, "no second argument");
  calls.length = 0;
  storeStub({ STORE, STORE_LOCATION: "wnam" }, "bio");
  assert.deepEqual(calls, [["-", "idFromName", "bio"], ["-", "get", { id: "-:bio" }, { locationHint: "wnam" }]]);
  calls.length = 0;
  storeStub({ STORE }, "scratch");
  assert.deepEqual(calls, [["-", "idFromName", "scratch"], ["-", "get", { id: "-:scratch" }]]);
  calls.length = 0;
  storeStub({ STORE, STORE_JURISDICTION: "us", STORE_LOCATION: "bogus" }, "bio");
  assert.equal(calls[0][0], "jurisdiction", "an invalid hint is no hint, so it does not conflict");
});

test("R43: a copy that sets a jurisdiction and a hint is refused by storeId and storeStub before any call is made", () => {
  const { STORE, calls } = recorder();
  const env = { STORE, STORE_JURISDICTION: "eu", STORE_LOCATION: "weur" };
  for (const f of [storeId, storeStub]) assert.throws(() => f(env, "bio"), (e) => e instanceof Error && e.code === "STORE_PLACE_CONFLICT");
  assert.deepEqual(calls, []);
});

test("R44: the generation suffix applies to a jurisdiction room as to a hinted one; the id is stable across calls and changes with the generation", () => {
  const { STORE } = recorder();
  const at = (g) => storeId({ STORE, STORE_JURISDICTION: "eu", ...(g ? { STORE_GENERATION: g } : {}) }, "bio").id;
  assert.equal(at(), at());
  assert.equal(at("2"), at("2"));
  assert.equal(at("2"), "eu:bio~g2");
  assert.notEqual(at("2"), at("3"));
  assert.notEqual(at("2"), at());
  assert.equal(at("1"), "eu:bio");
});

test("R45: storeJurisdiction is the one value held for a copy in a jurisdiction, and this module's source creates no bucket and no room", () => {
  for (const v of [...STORE_JURISDICTIONS, "x", undefined]) {
    const got = storeJurisdiction({ STORE_JURISDICTION: v });
    assert.ok(got === null || STORE_JURISDICTIONS.includes(got));
  }
  const src = readFileSync(new URL("../../../src/store-place.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(src, /createBucket|\.create\(|CreateBucket|r2\.cloudflarestorage/);
});

/* ---------- R46: the mail rows ---------- */
test("R46: the mail figures are rows of READ_BOUNDS, one figure in all three columns, quoted once; message_bytes is never above the archive upload bound", () => {
  const want = [["mail", "message_bytes", 25 * MiB], ["mail", "per_member_hour", 20], ["mail", "per_team_day", 200], ["mail", "waiting_days", 14],
    ["mail", "nest_max", 3], ["mail", "nest_read_max", 4], ["doorbell", "discard_days", 7]];
  for (const [kind, name, n] of want) {
    const row = READ_BOUNDS[kind]?.[name];
    assert.ok(row, `${kind}/${name}`);
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n }, `${kind}/${name}`);
    assert.equal(row.key, `limit.${kind}.${name}`);
    assert.equal(boundOf(kind, name), n);
    assert.deepEqual(statement(kind, name, n + 1), { size: n + 1, bound: n, key: `limit.${kind}.${name}` });
  }
  assert.ok(boundOf("mail", "message_bytes") <= READ_BOUNDS.archive.uploaded_bytes.alpha);
  assert.ok(boundOf("mail", "message_bytes") <= boundOf("archive", "uploaded_bytes"));
});

/* ---------- R47: waits on the M-R7 measure ---------- */
test.todo("R47: the register rows stream_max and segment_max (they do not exist until M-R7 is recorded, `acquisition` R126)");

/* ---------- image-cover's rows (BOB #326): one figure in all three columns ---------- */
test("the ten image-cover rows hold one figure in all three columns, and boundOf and statement answer them", () => {
  const want = { redraw_bytes: 33554432, photo_profile_max: 1048576, photo_profile_tags: 256, photo_exif_bytes: 1048576, photo_directory_entries: 1024,
    photo_field_chars: 256, photo_text_chars: 4096, photo_list_items: 64, photo_xmp_bytes: 262144, photo_inflated_bytes: 262144 };
  for (const [name, n] of Object.entries(want)) {
    const row = READ_BOUNDS.image[name];
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n }, name);
    assert.equal(boundOf("image", name), n, name);
    assert.deepEqual(statement("image", name, n + 1), { size: n + 1, bound: n, key: `limit.image.${name}` }, name);
  }
  assert.equal(boundOf("archive", "unpacked_bytes"), 256 * MiB, "stays active at the alpha for now (BOB)");
});

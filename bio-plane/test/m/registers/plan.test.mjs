/* registers R8–R10 (T53; N1259; K4403 (2); K4405 (6)): the filter prefilled from a project and said so, the delta before anything is
   brought in with each figure saying counted or estimated, and the estimate recorded against its outcome. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { combine } from "../../../../jurisdictions/index.mjs";
import { seeded, V, served, csv, rowOf, enc, URL_, HOST, network } from "./fixture.mjs";

const COUNT_URL = (q = "") => `https://${HOST}/count?table=2025${q}`;
const viewWith = (edit) => { const v = combine(["test-port-ellery"]).view; edit(v); return v; };
const appendOnly = () => viewWith((v) => { v.registers.find((r) => r.key === "town_filings").refresh = { cadence_hours: 24, validators: ["etag", "count"], append_only: true }; });
const START = (w, over = {}) => w.registers.importStart({ register: "town_filings", filter: {}, scope: "project", project: w.P, author: V("bob"), viewer: V("bob"), holes: { table: "2025" }, ...over });
const DELTA = (w, over = {}) => w.registers.registerDelta({ register: "town_filings", filter: {}, scope: "project", project: w.P, viewer: V("bob"), holes: { table: "2025" }, ...over });
const tables = (w) => Object.fromEntries(["register_imports", "register_cells", "register_rows", "register_import_rows", "register_segments", "register_proposals", "register_interests", "register_changes"].map((t) => [t, w.count(t)]));
/* what the project's entities service would answer (`entities` R74, not yet merged: the provider is handed in, as its answer states) */
const subjectsOf = (answer) => (project, viewer) => (viewer === "member:bob" || viewer === "member:carol" ? answer : { ok: false });
const FACTS = { subjects: [{ kind: "organization", label: "Firm 3" }, { kind: "person", label: "Donor 5" }],
  identifiers: [{ scheme: "filer", value: "F10003" }], period: { from: "2025-01-01", to: "2025-12-31" }, addresses: ["9000 Elm Street"], notes: "Firm 3 lives at 9000 Elm Street" };

test("R8: a project's subjects, identifiers and period prefill the filter with their basis; its address and notes add nothing; no project gives the whole register", () => {
  const w = seeded({ subjects: subjectsOf(FACTS) });
  const f = w.registers.registerFilter({ register: "town_filings", project: w.P, viewer: V("bob") });
  assert.equal(f.ok, true);
  assert.equal(f.prefilled, true);
  assert.deepEqual(f.filter, { names: ["Donor 5"], organizations: ["Firm 3"], filer_ids: ["F10003"], date: { from: "2025-01-01", to: "2025-12-31" } });
  assert.deepEqual(f.basis.map((b) => b.criterion).sort(), ["date", "filer_ids", "names", "organizations"]);
  assert.ok(f.basis.every((b) => b.fact), "each criterion's source fact");
  assert.ok(!JSON.stringify(f).includes("Elm Street"), "an address fact adds nothing");
  assert.deepEqual(w.registers.registerFilter({ register: "town_filings", viewer: V("bob") }), { ok: true, filter: {}, prefilled: false, basis: [], left_out: [] });
  assert.equal(w.registers.registerFilter({ register: "town_filings", project: w.P, viewer: V("dave") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.registers.registerFilter({ register: "town_filings", project: "PROJ-nope", viewer: V("bob") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.registers.registerFilter({ register: "nope", viewer: V("bob") }).reason, "NO_SUCH_REGISTER");
  /* a criterion the register cannot apply is left out, and said */
  const county = w.registers.registerFilter({ register: "county_raw", project: w.P, viewer: V("bob") });
  assert.ok(county.left_out.length > 0);
  /* nothing is saved by planning */
  assert.equal(w.count("register_interests"), 0);
});

test("R8 control: an edit validates or is refused by the filter's own code; a project with no usable facts gives the whole register", () => {
  const w = seeded({ subjects: subjectsOf({ subjects: [], identifiers: [] }) });
  assert.deepEqual(w.registers.registerFilter({ register: "town_filings", project: w.P, viewer: V("bob") }).filter, {});
  assert.equal(w.registers.checkFilter(w.registers.definitionOf("town_filings").definition, { names: ["Zed"], filer_ids: ["not-a-filer"] }).reason, "FILTER_VALUE_INVALID");
  assert.equal(w.registers.checkFilter(w.registers.definitionOf("town_filings").definition, { names: ["Ann*"] }).reason, "FILTER_PATTERN_REFUSED");
  assert.equal(w.registers.checkFilter(w.registers.definitionOf("town_filings").definition, { names: ["Ann Lee"] }).ok, true);
});

test.todo("R8 against the real entities service: `entities.subjectsOfProject` (entities R74) is not merged on this tranche yet; the seam test replaces the handed provider when it is");

test("R9: new rows are counted only when the source counted them for this filter and is append-only, else estimated, else not stated; each figure carries its basis; nothing is written", async () => {
  const w = seeded({ view: appendOnly() });
  assert.equal(START(w).ok, true);
  await w.drain({ [URL_]: served(enc(csv(30))) });
  const before = tables(w);
  const route = (extra = {}) => ({ [URL_]: served(enc(csv(30))), [COUNT_URL()]: () => new Response("100", { headers: { "content-type": "application/json" } }), ...extra });
  const counted = await w.withNet(route(), () => DELTA(w));
  const d = counted.out;
  assert.deepEqual([d.ok, d.new_rows, d.already_held], [true, { value: 70, basis: "counted" }, 30]);
  assert.deepEqual(d.bytes_in.basis, "stated");
  assert.equal(d.bytes_in.value, enc(csv(30)).length);
  assert.equal(d.source_date, "2025-10-01");
  assert.ok(d.shelf && "free_bytes" in d.shelf && "would_use_pct" in d.shelf && "warn" in d.shelf);
  /* a name the count cannot apply: estimated */
  const named = (await w.withNet(route(), () => DELTA(w, { filter: { names: ["Donor 14"] } }))).out;
  assert.equal(named.new_rows.basis, "estimated");
  assert.equal(named.already_held, 1);
  /* a source with no Content-Length: bytes not stated */
  const bare = (await w.withNet({ [URL_]: served(enc(csv(30)), { length: false }) }, () => DELTA(w))).out;
  assert.deepEqual(bare.bytes_in, { value: null, basis: "not_stated" });
  assert.equal(bare.seconds.basis, "not_stated");
  assert.deepEqual(tables(w), before, "no table's row count changes");
  /* the requests were the governed probes: no body was read */
  assert.ok(counted.net.seen.every((r) => r.init.method === "HEAD" || (r.init.headers && r.init.headers.range) || r.url === COUNT_URL()));
});

test("R9: a slow probe ends at the budget with timed_out, and what it has, never a guess", async () => {
  const w = seeded({ view: appendOnly() });
  const slow = { [URL_]: async (u, init) => { await new Promise((r) => setTimeout(r, 400)); return served(enc(csv(5)))(u, init); } };
  const t0 = Date.now();
  const out = (await w.withNet(slow, () => DELTA(w, { budget_ms: 80 }))).out;
  assert.equal(out.ok, true);
  assert.equal(out.timed_out, true);
  assert.ok(Date.now() - t0 < 380, "it stopped at the budget");
  assert.deepEqual(out.bytes_in, { value: null, basis: "not_stated" });
});

test("R9: seconds equal the arithmetic over the median rate of the last three imports and carry estimated; with none held the constant says so", async () => {
  const w = seeded({ view: appendOnly() });
  const bytes = enc(csv(40));
  const first = (await w.withNet({ [URL_]: served(bytes) }, () => DELTA(w))).out;
  assert.equal(first.seconds.basis, "estimated");
  assert.equal(first.seconds.constant, true, "with none held the constant is used and says so");
  assert.equal(first.seconds.value, (bytes.length / w.registers.bounds.THROUGHPUT_DEFAULT) / 1000);
  /* three imports of different speeds: the clock moves while the source answers */
  for (const [i, ms] of [[0, 4000], [1, 1000], [2, 2000]]) {
    const filter = { filer_ids: [`F1000${i}`] };
    assert.equal(START(w, { filter }).ok, true);
    await w.drain({ [URL_]: (u, init) => { if (init.method !== "HEAD") w.clock.ms += ms; return served(bytes)(u, init); } });
  }
  const rows = w.sql(`SELECT took_ms, bytes_in FROM register_imports WHERE state='indexed' ORDER BY import_id`);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((r) => r.took_ms > 0 && r.bytes_in > 0), "each import recorded took_ms and bytes_in (R10)");
  const rates = rows.map((r) => r.took_ms / r.bytes_in).sort((a, b) => a - b);
  const next = (await w.withNet({ [URL_]: served(bytes) }, () => DELTA(w, { filter: { filer_ids: ["F10004"] } }))).out;
  assert.equal(next.seconds.basis, "estimated");
  assert.equal(next.seconds.constant, undefined);
  assert.ok(Math.abs(next.seconds.value - (bytes.length * rates[1]) / 1000) < 1e-9, "the median rate's arithmetic");
  assert.ok(next.seconds.low <= next.seconds.value && next.seconds.value <= next.seconds.high);
});

test("R10: a failed import contributes no timing to the next estimate", async () => {
  const w = seeded();
  assert.equal(START(w).ok, true);
  await w.drain({ [URL_]: () => new Response("busy", { status: 500 }) }, { advance: 3_600_000 });
  const failed = w.sql(`SELECT state, took_ms FROM register_imports`)[0];
  assert.equal(failed.state, "failed");
  const d = (await w.withNet({ [URL_]: served(enc(csv(5))) }, () => DELTA(w))).out;
  assert.equal(d.seconds.constant, true, "the failed import timed nothing");
});

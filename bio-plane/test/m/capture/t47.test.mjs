/* capture, T47 (T47-11; N979, N969, N971, N983, K3027, K3033): each held row's capture digest and grade (R77), the
   set-aside documents listed by `heldCaptures`' `state` (R88), the information grammar stated in Provides (R89), and
   `op=sourcereach` judged at this module's own clock, a request's `now` never read (R90). At the module's interface:
   its exported services and its routes (`captureOps`), over this module's fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, sha, storage, provenance, H } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { captureOf, captureOps, INFORMATION_GRAMMAR, checkInformationExtension, HELD_STATES, READ_LIMIT }
  from "../../../src/capture/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";
import { checkBundle } from "../../../src/record-grammar/index.mjs";

const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const ids = (r) => r.held.map((x) => x.bundle_id);
const everything = (rows) => Object.fromEntries(rows(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
  .map(({ name }) => [name, rows(`SELECT * FROM "${name}"`).map((r) => ({ ...r }))]));
const ADMIN = "class:admin";

/* A world of held documents over this module's fixture: members m1 and m2, project PROJ-1 m1's alone; INFO-1, INFO-2 and
   INFO-4 (in PROJ-1) information at collected, each with one capture; INFO-3 at collected with none registered. */
function heldWorld() {
  const f = fresh();
  const s = f.s;
  for (const m of ["m1", "m2"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('PROJ-1', 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`);
  s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  const doc = (id, { created, project = null, captures = [] }) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1, ?)`, id, `title ${id}`, created, created, project);
    for (const [capture, registered] of captures)
      s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered) VALUES (?, ?, 'x', ?)`, capture, id, registered);
  };
  doc("INFO-1", { created: "2026-01-01T00:00:00Z", captures: [[H("1"), "2026-01-01T00:00:00.000Z"]] });
  doc("INFO-2", { created: "2026-02-01T00:00:00Z", captures: [[H("2"), "2026-02-01T00:00:00.000Z"]] });
  doc("INFO-3", { created: "2026-02-15T00:00:00Z" });
  doc("INFO-4", { created: "2026-01-15T00:00:00Z", project: "PROJ-1", captures: [[H("4"), "2026-01-15T00:00:00.000Z"]] });
  /* provenance's grade: one answer per digest, recorded so the row can be compared with it whole */
  const graded = [];
  f.c.provenance = Object.assign(provenance(s), {
    captureGrade(d) {
      graded.push(d);
      return { grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 4)}` };
    },
  });
  return { ...f, graded };
}

/* ---- R77 (T47; N979): each row's capture ---- */

test("R77 (T47; N979): each held row answers capture {sha256, grade}: the digest the register files under the document and provenance.captureGrade's answer whole; a document under which the register files no capture answers capture: null", async () => {
  const { c, rows, graded } = heldWorld();
  const before = everything(rows);
  const r = await c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-1", "INFO-4", "INFO-2", "INFO-3"]);
  const of = (id) => r.held.find((x) => x.bundle_id === id).capture;
  for (const [id, d] of [["INFO-1", H("1")], ["INFO-2", H("2")], ["INFO-4", H("4")]])
    assert.deepEqual(of(id), { sha256: d, grade: { grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 4)}` } },
                     `${id}: its capture, graded whole, the received and authored routes passed as provenance states them`);
  assert.equal(of("INFO-3"), null, "no capture registered under it: capture null");
  assert.deepEqual([...graded].sort(), [H("1"), H("2"), H("4")].sort(), "provenance is asked once per row, for the row's capture");
  assert.deepEqual(everything(rows), before, "writes nothing");
  /* the route answers the same field */
  const via = await route(c, "heldcaptures", `viewer=${ADMIN}`);
  assert.deepEqual(via.held.map((x) => x.capture), r.held.map((x) => x.capture));
});

test("R77 (T47; N979): of several captures the register files under one document, the row names the one first registered (compared as instants), ties by digest", async () => {
  const f = heldWorld();
  const s = f.s;
  const add = (id, created, captures) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES (?, 'information', 'g', 't', 'collected', ?, ?, 'x', 1)`, id, created, created);
    for (const [d, at] of captures) s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered) VALUES (?, ?, 'x', ?)`, d, id, at);
  };
  /* the later-registered capture has the smaller digest: the instant decides, not the digest */
  add("MULTI", "2026-03-01T00:00:00Z", [[H("a1"), "2026-03-02T00:00:00.000Z"], [H("f1"), "2026-03-01T00:00:00.000Z"]]);
  /* one second spelled whole and with milliseconds: the whole second is the earlier instant, whatever text order says */
  add("SPELL", "2026-03-01T00:00:00Z", [[H("a2"), "2026-03-01T00:00:00.500Z"], [H("f2"), "2026-03-01T00:00:00Z"]]);
  /* registered at one instant: ties by digest */
  add("TIE", "2026-03-01T00:00:00Z", [[H("f3"), "2026-03-01T00:00:00.000Z"], [H("a3"), "2026-03-01T00:00:00.000Z"]]);
  const r = await f.c.heldCaptures({ viewer: ADMIN });
  const of = (id) => r.held.find((x) => x.bundle_id === id).capture.sha256;
  assert.equal(of("MULTI"), H("f1"));
  assert.equal(of("SPELL"), H("f2"));
  assert.equal(of("TIE"), H("a3"));
});

test("R77 (T47; N979): grade is null when provenance does not answer (no captureGrade, a throw, a promise), the digest still named; never a failed list", async () => {
  for (const captureGrade of [undefined, () => { throw new Error("no"); }, async () => ({ grade: "B" })]) {
    const f = heldWorld();
    f.c.provenance = Object.assign(provenance(f.s), captureGrade ? { captureGrade } : {});
    const r = await f.c.heldCaptures({ viewer: ADMIN });
    assert.equal(r.ok, true);
    assert.deepEqual(r.held.find((x) => x.bundle_id === "INFO-1").capture, { sha256: H("1"), grade: null });
  }
});

/* An archive world, as the archive tests build it: acquisition's real instance and its provenance stand-in. */
function archiveWorld() {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const prov = acquisitionProvenance({ sql: f.s.sql });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m1', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  return { ...f, prov };
}
async function capturedArchive(w, entries) {
  const url = "https://files.example/set.zip";
  const z = makeZip(entries);
  const net = network({ [url]: () => new Response(z, { headers: { "content-type": "application/zip" } }) });
  let r;
  try { r = await w.c.acquire({ locator: url }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); }
  finally { net.restore(); }
  assert.equal(r.body.ok, true);
  const promote = (bundleId, digest) => {
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES (?, 'information', 'g', 't', 'collected', '2026-03-01T00:00:00Z', '2026-03-01T00:00:00Z', 'x', 1)`, bundleId);
    w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, digest, bundleId);
    w.prov.homes[digest] = bundleId;
  };
  promote("INFO-ZIP", sha(z));
  for (const d of r.body.unpack.documents) promote(`INFO-ZIP-${d.container.index}`, d.capture.sha256);
  return { digest: sha(z) };
}

test("R77 (T47; N979): an archive's row carries capture too: the archive's own digest and its grade, beside its files", async () => {
  const w = archiveWorld();
  const a = await capturedArchive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  const r = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  assert.deepEqual(r.held[0].capture, { sha256: a.digest, grade: w.prov.captureGrade(a.digest) });
  assert.equal(r.held[0].files.length, 2);
});

/* ---- R88 (T47; N969): the set-aside documents ---- */

test("R88 (T47; N969): heldCaptures state=set_aside answers the documents at collected whose latest act is a set-aside, each with R77's row fields and set_aside {reason, author, at}; held (absent or empty alike) answers R77's list; writes nothing", async () => {
  const { c, rows } = heldWorld();
  assert.deepEqual(HELD_STATES, ["held", "set_aside"]);
  const a = c.setAside({ ids: ["INFO-1", "INFO-4"], reason: "not ours to hold", author: "member:m1", viewer: "member:m1" });
  assert.equal(a.ok, true);
  const before = everything(rows);
  const aside = await c.heldCaptures({ viewer: "member:m1", state: "set_aside" });
  assert.deepEqual([aside.ok, aside.state, ids(aside)], [true, "set_aside", ["INFO-1", "INFO-4"]], "R77's default order, the longest held first");
  const held = await c.heldCaptures({ viewer: "member:m1" });
  assert.deepEqual([held.state, ids(held)], ["held", ["INFO-2", "INFO-3"]]);
  for (const s of ["", null, "held"]) assert.deepEqual(ids(await c.heldCaptures({ viewer: "member:m1", state: s })), ids(held), `state ${JSON.stringify(s)} reads held`);
  const one = aside.held[0];
  assert.deepEqual(one.set_aside, { reason: "not ours to hold", author: "member:m1", at: a.at });
  /* R77's row, field for field, beside set_aside */
  const { set_aside: _s, ...fields } = one;
  for (const k of ["bundle_id", "title", "project", "source", "collected_since", "age_days", "eligible", "eligibility_basis",
                   "captured_for", "captured_for_basis", "capture"]) assert.ok(k in fields, `the row carries ${k}`);
  assert.deepEqual(one.capture.sha256, H("1"));
  assert.equal(held.held[0].set_aside, undefined, "a held row carries no set_aside");
  assert.deepEqual(everything(rows), before, "writes nothing");
});

test("R88 (T47; N969): the set-aside list keeps R77's sight, filters, sorts and bound; a restored document leaves it, and set aside again carries its latest set-aside", async () => {
  const { c } = heldWorld();
  c.setAside({ ids: ["INFO-1", "INFO-2", "INFO-4"], reason: "first", author: "member:m1", viewer: "member:m1" });
  const list = (o) => c.heldCaptures({ state: "set_aside", ...o });
  assert.deepEqual(ids(await list({ viewer: "member:m2" })), ["INFO-1", "INFO-2"], "sight: m2 takes no part in PROJ-1");
  assert.deepEqual(ids(await list({ viewer: "junk" })), [], "an unrecognised viewer sees nothing");
  assert.deepEqual(ids(await list({ viewer: ADMIN, project: "PROJ-1" })), ["INFO-4"]);
  assert.deepEqual(ids(await list({ viewer: ADMIN, sort: "age", dir: "asc" })), ["INFO-2", "INFO-4", "INFO-1"]);
  const p1 = await list({ viewer: ADMIN, limit: 2 });
  assert.deepEqual([ids(p1), p1.limit, p1.truncated], [["INFO-1", "INFO-4"], 2, true]);
  const p2 = await list({ viewer: ADMIN, limit: 2, after: p1.next });
  assert.deepEqual([ids(p2), p2.truncated, p2.next], [["INFO-2"], false, null]);
  assert.equal((await list({ viewer: ADMIN })).limit, READ_LIMIT.default);
  /* restored: it leaves the set-aside list and returns to the held one */
  assert.equal(c.restoreHeld({ ids: ["INFO-2"], reason: "ours", author: "member:m2", viewer: "member:m2" }).ok, true);
  assert.deepEqual(ids(await list({ viewer: ADMIN })), ["INFO-1", "INFO-4"]);
  assert.deepEqual(ids(await c.heldCaptures({ viewer: ADMIN })), ["INFO-2", "INFO-3"]);
  /* set aside again: the latest set-aside is the one the row carries */
  const again = c.setAside({ ids: ["INFO-2"], reason: "second thoughts", author: "member:m2", viewer: "member:m2" });
  const row = (await list({ viewer: ADMIN })).held.find((x) => x.bundle_id === "INFO-2");
  assert.deepEqual(row.set_aside, { reason: "second thoughts", author: "member:m2", at: again.at });
});

test("R88 (T47; N969): any other state is refused as an unknown sort is, REQUIRED_ARGUMENT_MISSING naming state and its two values, nothing read or written", async () => {
  const { c, rows } = heldWorld();
  const before = everything(rows);
  for (const bad of ["gone", "SET_ASIDE", "released"]) {
    const r = await c.heldCaptures({ viewer: ADMIN, state: bad });
    assert.deepEqual([r.ok, r.reason, r.op, r.argument, r.shape, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "heldcaptures", "state", "held | set_aside", 400]);
    assert.equal(r.held, undefined);
  }
  /* the control: an unknown sort, refused the same way */
  const s = await c.heldCaptures({ viewer: ADMIN, sort: "nope" });
  assert.deepEqual([s.reason, s.argument], ["REQUIRED_ARGUMENT_MISSING", "sort"]);
  assert.deepEqual(everything(rows), before);
});

test("R88 (T47; N969): through op=heldcaptures it is the query's state, by the caller's stamped viewer; so heldrestore is reachable for a document set aside in an earlier visit", async () => {
  const { c } = heldWorld();
  c.setAside({ ids: ["INFO-1"], reason: "later", author: "member:m1", viewer: "member:m1" });
  const r = await route(c, "heldcaptures", "viewer=member:m1&state=set_aside");
  assert.deepEqual([r.state, ids(r)], ["set_aside", ["INFO-1"]]);
  assert.deepEqual(ids(await route(c, "heldcaptures", "state=set_aside")), [], "an unstamped call sees nothing");
  assert.equal((await route(c, "heldcaptures", "viewer=member:m1&state=bogus")).reason, "REQUIRED_ARGUMENT_MISSING");
  /* the listed id is what heldrestore takes */
  const back = route(c, "heldrestore", "viewer=member:m1&by=member:m1", { ids: ids(r), reason: "now we read it" });
  assert.equal(back.ok, true);
  assert.deepEqual(ids(await route(c, "heldcaptures", "viewer=member:m1&state=set_aside")), []);
});

test("R88 (T47; N969): the set-aside list groups as R77's does: an archive set aside is one row grouping its set-aside files; a set-aside file whose archive is held stands as a row of its own carrying archive {sha256}", async () => {
  const w = archiveWorld();
  const a = await capturedArchive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  assert.equal(w.c.setAside({ ids: ["INFO-ZIP", "INFO-ZIP-0"], reason: "not ours", author: "member:m1", viewer: ADMIN }).ok, true);
  let r = await w.c.heldCaptures({ viewer: ADMIN, state: "set_aside" });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  assert.deepEqual(r.held[0].files.map((f) => f.document), ["INFO-ZIP-0"], "beside it, only its set-aside files");
  assert.equal(r.held[0].set_aside.reason, "not ours");
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN })), ["INFO-ZIP-1"], "the held file stands alone in the held list");
  /* the archive restored: its set-aside file now stands alone in the set-aside list */
  w.c.restoreHeld({ ids: ["INFO-ZIP"], reason: "ours", author: "member:m1", viewer: ADMIN });
  r = await w.c.heldCaptures({ viewer: ADMIN, state: "set_aside" });
  assert.deepEqual(ids(r), ["INFO-ZIP-0"]);
  assert.deepEqual(r.held[0].archive, { sha256: a.digest });
});

/* ---- R89 (T47; N971): the information grammar ---- */

test("R89 (T47; N971): INFORMATION_GRAMMAR is exported and frozen, {ids: [\"C-2.7\"], arm: checkInformationExtension}, the grammar captureOf registers with record-core once at start; handed to checkBundle outside an instance it judges as the instance does", async () => {
  assert.ok(Object.isFrozen(INFORMATION_GRAMMAR) && Object.isFrozen(INFORMATION_GRAMMAR.ids));
  assert.deepEqual(Object.keys(INFORMATION_GRAMMAR).sort(), ["arm", "ids"]);
  assert.deepEqual([...INFORMATION_GRAMMAR.ids], ["C-2.7"]);
  assert.equal(INFORMATION_GRAMMAR.arm, checkInformationExtension);
  assert.equal(typeof checkInformationExtension, "function");
  const ctx = { storage: storage() };
  const record = recordOf(ctx);
  record.migrate();
  captureOf(ctx, { provenance: provenance(ctx.storage) });
  captureOf(ctx);
  const held = record.grammars().filter((g) => g.module === "capture");
  assert.equal(held.length, 1, "registered once");
  assert.deepEqual([held[0].ids, held[0].arm], [["C-2.7"], checkInformationExtension]);
  /* the arm claims C-2.7 whole: an information bundle with bad enumerations is judged by it, handed in outside an
     instance and from the instance's own list alike */
  const T0 = "2026-07-01T00:00:00Z";
  const md = ["---", "id: INFO-2026-0001-enums", "object_type: information", "schema: information@1", "title: A report",
              "current_state: collected", "prior_state: null", `created: "${T0}"`, `last_updated: "${T0}"`, "group: test-group",
              "criticality: vital", "source_status: gone", "source:", '  locator: "https://docs.example.org/report.pdf"',
              "  authority: publisher", `  retrieved: "${T0}"`, "monitoring:", "  enabled: true", "  frequency: weekly",
              "---", "\n## Session Log\n"].join("\n");
  const hex = async (v) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v))]
    .map((x) => x.toString(16).padStart(2, "0")).join("");
  const judge = async (grammars) => (await checkBundle({ folderName: "INFO-2026-0001-enums", files: new Map([["bundle.md", md]]),
    elidedPaths: new Set(), sha256: hex, resolveTarget: () => false, releaseRegistry: null, publishedRegistry: null,
    publishedCaseRegistry: null, earnedRegistry: null }, { grammars })).findings;
  const outside = await judge([{ module: "capture", ...INFORMATION_GRAMMAR }]);
  const inside = await judge(record.grammars());
  assert.deepEqual(outside.filter((x) => x.check === "C-2.7").map((x) => x.message),
                   ["criticality 'vital' is not one of: crucial, supporting", "source_status 'gone' is not one of: unchanged, modified, removed"]);
  assert.deepEqual(outside, inside, "the grammar handed in is the one the instance holds");
});

/* ---- R90 (T47; N983, K3027): sourcereach at this module's clock ---- */

/* An instance through captureOf with the clock `now`, and one address with two source failures on 2026-01-01. */
async function reachWorld(now) {
  const ctx = { storage: storage() };
  recordOf(ctx).migrate();
  const c = captureOf(ctx, { provenance: provenance(ctx.storage), ...(now ? { now } : {}) });
  c.migrate();
  for (const at of ["2026-01-01T00:00:00Z", "2026-01-01T06:00:00Z"])
    await c.recordSourceOutcome({ addressNorm: "https://gone.example/doc", outcome: "fetch_failed", status: 404, at });
  return { ctx, c };
}
const JAN20 = Date.parse("2026-01-20T00:00:00Z");

test("R90 (T47; N983): op=sourcereach is judged at this module's clock (captureOf's now): failing_days, the age arm of fallback_eligible and its basis", async () => {
  const { c } = await reachWorld(() => JAN20);
  const r = await route(c, "sourcereach", "address=https://gone.example/doc");
  assert.deepEqual([r.known, r.consecutive_failures, r.failing_days, r.fallback_eligible], [true, 2, 19, true]);
  assert.match(r.basis, /19 days, threshold 14 with at least 2 failures/);
  /* the control: the same record at a clock five days on from the first failure is not eligible by age */
  const early = await reachWorld(() => Date.parse("2026-01-06T00:00:00Z"));
  const e = await route(early.c, "sourcereach", "address=https://gone.example/doc");
  assert.deepEqual([e.failing_days, e.fallback_eligible, e.basis], [5, false, "not eligible: the threshold is not met"]);
});

test("R90 (T47; N983): a now in the query or the body is never read: the request answers exactly as the same request without it", async () => {
  const { c } = await reachWorld(() => JAN20);
  const plain = await route(c, "sourcereach", "address=https://gone.example/doc");
  for (const [qs, body] of [["&now=2026-01-02T00:00:00Z", null], ["&now=2030-01-01T00:00:00Z", null], ["", { now: "2026-01-02T00:00:00Z" }],
                            ["&now=not-a-time", { now: "2030-01-01T00:00:00Z" }]])
    assert.deepEqual(await route(c, "sourcereach", `address=https://gone.example/doc${qs}`, body), plain, `${qs} ${JSON.stringify(body)}`);
  /* the clock moves the answer; the request cannot */
  let t = Date.parse("2026-01-06T00:00:00Z");
  const { c: moving } = await reachWorld(() => t);
  assert.equal((await route(moving, "sourcereach", "address=https://gone.example/doc&now=2026-01-30T00:00:00Z")).fallback_eligible, false);
  t = JAN20;
  assert.equal((await route(moving, "sourcereach", "address=https://gone.example/doc&now=2026-01-02T00:00:00Z")).fallback_eligible, true);
});

test("R90 (T47; N983): an in-plane caller may still pass its own now to sourceReachability", async () => {
  const { c } = await reachWorld(() => JAN20);
  const r = c.sourceReachability({ addressNorm: "https://gone.example/doc", now: "2026-01-05T00:00:00Z" });
  assert.deepEqual([r.failing_days, r.fallback_eligible], [4, false]);
  assert.equal(c.sourceReachability({ addressNorm: "https://gone.example/doc" }).failing_days, 19, "with none, the clock");
});

test("R90 (T47; N983; R58): the clock is adopted and compared as R58 states: taken by default (Date.now) it is adopted from the first later caller that supplies one; another function is then refused by a throw naming now, adopting nothing", async () => {
  const ctx = { storage: storage() };
  recordOf(ctx).migrate();
  const c = captureOf(ctx, { provenance: provenance(ctx.storage) });
  assert.equal(c.clock, Date.now, "Date.now by default");
  const clock = () => JAN20;
  assert.equal(captureOf(ctx, { now: clock }), c);
  assert.equal(c.clock, clock, "adopted from the first caller that supplies one");
  assert.equal(captureOf(ctx, { now: clock }), c, "the same function is no difference");
  assert.equal(captureOf(ctx), c, "a call supplying none changes nothing");
  assert.throws(() => captureOf(ctx, { now: () => JAN20 }), /different `now`/);
  assert.equal(c.clock, clock, "the refused call adopted nothing");
  /* supplied at the first call: another is refused */
  const ctx2 = { storage: storage() };
  recordOf(ctx2).migrate();
  const c2 = captureOf(ctx2, { provenance: provenance(ctx2.storage), now: clock });
  assert.equal(c2.clock, clock);
  assert.throws(() => captureOf(ctx2, { now: Date.now }), /different `now`/);
});

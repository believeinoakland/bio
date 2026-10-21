/* capture, T51 (T51-21; N1235, K3771, K3774; A64, K3807, DEC-330): each held row's `actor`, `retrieved` and `bytes` (R77),
   the vouched documents listed beside the held ones (R88's `held_and_vouched`), and whether the record already holds an
   address or a digest and whether the source has since changed (R96, `op=heldat`). At the module's interface: its
   exported services and its routes (`captureOps`), over this module's fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, receipt, register, sha, governor, provenance, H } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { captureOps, HELD_AT_VERSIONS_MAX } from "../../../src/capture/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";
import { DOORBELL_VIA, UPLOAD_VIA } from "../../../src/provenance/index.mjs";

const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const ids = (r) => r.held.map((x) => x.bundle_id);
const ADMIN = "class:admin";
const everything = (rows, except = []) => Object.fromEntries(rows(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
  .filter(({ name }) => !except.includes(name)).map(({ name }) => [name, rows(`SELECT * FROM "${name}"`).map((r) => ({ ...r }))]));

const member = (s, id) => s.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, id);
const project = (s, id, ...participants) => {
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, id);
  for (const m of participants) s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'active', '2026-01-01', '2026-01-01')`, id, m);
};
/* An Information document with its captures; `state` and `history` (a bundle.md's state_history) for a vouched one. */
function doc(f, id, { state = "collected", project: proj = null, created = "2026-01-01T00:00:00Z", updated = created, prior = null,
                      captures = [], actor = null, history = null } = {}) {
  const s = f.s;
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, prior_state, created, last_updated, bundle_sha, row_version, project)
              VALUES (?, 'information', 'g', ?, ?, ?, ?, ?, 'x', 1, ?)`, id, `title ${id}`, state, prior, created, updated, proj);
  for (const c of captures) {
    const { sha: d, bytes = null, address = null, first = created, last = first, via = "direct", retrievalLocator = null } = typeof c === "string" ? { sha: c } : c;
    s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, ?, 'x', ?)`, d, id, bytes);
    if (address) {
      receipt(s, { address, capture: d, via, first, last });
      if (retrievalLocator) s.sql.exec(`UPDATE captured_locators SET retrieval_locator = ? WHERE capture_sha = ? AND address_norm = ?`, retrievalLocator, d, address);
    }
    if (actor) for (const a of [].concat(actor)) f.c.recordCaptureActor({ captureSha: d, actor: Array.isArray(a) ? a[0] : a, at: Array.isArray(a) ? a[1] : created });
  }
  if (history) {
    const lines = ["---", `id: ${id}`, "state_history:", ...history.flatMap((h) => [`  - timestamp: ${JSON.stringify(h.timestamp ?? "")}`, `    from_state: ${h.from}`,
      `    to_state: ${h.to}`, `    blurb: ${JSON.stringify(h.blurb ?? "")}`, ...(h.author ? [`    author: ${h.author}`] : [])]), "---", ""];
    const text = lines.filter((l) => !/timestamp: ""/.test(l)).join("\n");
    s.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'bundle.md', ?, ?, 'x')`, id, text, text.length);
  }
}
const provDoc = (f, bundleId, documents) =>
  f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'data/provenance.json', ?, 1, 'x')`, bundleId, JSON.stringify({ documents }));

/* ---- R77 (T51; N1235): a row's actor, retrieved and bytes ---- */

test("R77 (T51; N1235): each held row answers actor, retrieved and bytes: the capture's actor, the whole-second UTC instant of its first receipt, and the register's size of the whole capture; null where the record cannot say", async () => {
  const f = fresh();
  member(f.s, "m1");
  doc(f, "INFO-A", { captures: [{ sha: H("a"), bytes: 1234, address: "https://a.example/a", first: "2026-02-03T04:05:06.789Z" }], actor: "m1" });
  doc(f, "INFO-B", { created: "2026-01-02T00:00:00Z", captures: [H("b")] });
  doc(f, "INFO-C", { created: "2026-01-03T00:00:00Z" });
  const before = everything(f.rows);
  const r = await f.c.heldCaptures({ viewer: ADMIN });
  const row = (id) => r.held.find((x) => x.bundle_id === id);
  assert.deepEqual([row("INFO-A").actor, row("INFO-A").retrieved, row("INFO-A").bytes], ["m1", "2026-02-03T04:05:06Z", 1234]);
  assert.deepEqual([row("INFO-B").actor, row("INFO-B").retrieved, row("INFO-B").bytes], [null, null, null], "a capture with no actor, no receipt and no size");
  assert.deepEqual([row("INFO-C").actor, row("INFO-C").retrieved, row("INFO-C").bytes], [null, null, null], "no capture registered under it");
  /* of several actors the first to capture it (R77's `capture` is the first registered) */
  doc(f, "INFO-D", { created: "2026-01-04T00:00:00Z", captures: [H("d")], actor: [["m2", "2026-01-05T00:00:00Z"], ["m1", "2026-01-04T00:00:00Z"]] });
  assert.equal((await f.c.heldCaptures({ viewer: ADMIN })).held.find((x) => x.bundle_id === "INFO-D").actor, "m1");
  assert.deepEqual(everything(f.rows), { ...before, ...everything(f.rows) }, "reads only");
  /* the route answers the same fields; the row of a document the viewer may not see is no row, so none is read from it */
  const via = await route(f.c, "heldcaptures", `viewer=${ADMIN}`);
  assert.deepEqual(via.held.find((x) => x.bundle_id === "INFO-A").bytes, 1234);
});

test("R77 (T51; N1235): an upload's row names the uploader's stamp, the upload receipt's instant and the size of the file; a viewer who may not see the document gets no row and so none of the three", async () => {
  const f = fresh({ evidence: bucket() });
  member(f.s, "m1"); member(f.s, "m2");
  project(f.s, "PROJ-1", "m1");
  const bytes = new TextEncoder().encode("a file from my drawer");
  const at = "2026-03-01T10:00:00Z";
  const up = await f.c.uploadCapture({ bytes, statement: "from my drawer", by: "member:m1", at });
  assert.equal(up.ok, true);
  doc(f, "INFO-UP", { project: "PROJ-1", created: at, captures: [{ sha: up.capture.sha256, bytes: bytes.length }] });
  const mine = (await f.c.heldCaptures({ viewer: "member:m1" })).held[0];
  assert.deepEqual([mine.actor, mine.retrieved, mine.bytes], ["member:m1", at, bytes.length]);
  assert.deepEqual((await f.c.heldCaptures({ viewer: "member:m2" })).held, [], "m2 takes no part in PROJ-1: no row, nothing of it read");
});

/* An archive world, as the archive tests build it: acquisition's real instance and its provenance stand-in. */
function archiveWorld() {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const prov = acquisitionProvenance({ sql: f.s.sql });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  member(f.s, "m1");
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
  const promote = (bundleId, digest, state = "collected", bytes = null) => {
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES (?, 'information', 'g', 't', ?, '2026-03-01T00:00:00Z', '2026-03-01T00:00:00Z', 'x', 1)`, bundleId, state);
    w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, digest, bundleId);
    if (bytes != null) w.s.sql.exec(`UPDATE register SET bytes = ? WHERE capture_sha = ?`, bytes, digest);
    w.prov.homes[digest] = bundleId;
  };
  promote("INFO-ZIP", sha(z), "collected", z.length);
  for (const d of r.body.unpack.documents) promote(`INFO-ZIP-${d.container.index}`, d.capture.sha256);
  return { digest: sha(z), size: z.length, promote, documents: r.body.unpack.documents };
}

test("R77 (T51; N1235): an archive's row answers actor, retrieved and bytes of the archive itself, the member who opened it, beside its files", async () => {
  const w = archiveWorld();
  const a = await capturedArchive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  const r = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  const row = r.held[0];
  assert.equal(row.bytes, a.size, "the archive's size, not a file's");
  assert.equal(typeof row.retrieved, "string");
  assert.match(row.retrieved, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/, "whole-second UTC");
  assert.ok("actor" in row, "the field is present");
  assert.equal(row.files.length, 2);
});

/* ---- R88 (T51; N1235): held_and_vouched ---- */

const RELEASE = [{ timestamp: "2026-03-05T12:00:00Z", from: "collected", to: "verified", author: "member:m2", blurb: "reviewed at the source" }];

function vouchedWorld() {
  const f = fresh();
  member(f.s, "m1"); member(f.s, "m2");
  project(f.s, "PROJ-1", "m1");
  doc(f, "INFO-1", { created: "2026-01-01T00:00:00Z", captures: [{ sha: H("1"), address: "https://a.example/one" }], actor: "m1" });
  doc(f, "INFO-2", { created: "2026-02-01T00:00:00Z", captures: [{ sha: H("2"), address: "https://a.example/two" }] });
  doc(f, "VOUCHED-1", { state: "verified", prior: "collected", created: "2026-01-02T00:00:00Z", updated: "2026-03-05T12:00:00Z",
                        captures: [{ sha: H("f8"), address: "https://a.example/v1" }], history: RELEASE, actor: "m1" });
  doc(f, "VOUCHED-P", { state: "verified", prior: "collected", project: "PROJ-1", created: "2026-01-03T00:00:00Z", updated: "2026-03-06T00:00:00Z",
                        captures: [H("f6")], history: [{ timestamp: "2026-03-06T00:00:00Z", from: "collected", to: "verified", blurb: "ok" }] });
  doc(f, "VOUCHED-N", { state: "verified", prior: "collected", created: "2026-01-04T00:00:00Z", updated: "2026-03-07T00:00:00Z", captures: [H("f7")] });
  /* not listed in either: not information, and information at another state */
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('CASE-1', 'case', 'g', 't', 'verified', '2026-01-01', '2026-01-01', 'x', 1)`);
  doc(f, "INFO-DRAFT", { state: "draft" });
  return f;
}

test("R88 (T51; N1235): state held_and_vouched lists R77's held documents and the Information documents at verified, each row with standing, a vouched row with vouched {by, at} from its release's entry in state_history, null for a field the entry does not give", async () => {
  const f = vouchedWorld();
  const before = everything(f.rows);
  const r = await f.c.heldCaptures({ viewer: ADMIN, state: "held_and_vouched", sort: "age", dir: "asc" });
  assert.deepEqual([r.ok, r.state, r.sort, r.dir], [true, "held_and_vouched", "age", "asc"]);
  assert.deepEqual(ids(r).sort(), ["INFO-1", "INFO-2", "VOUCHED-1", "VOUCHED-N", "VOUCHED-P"], "the collected and the vouched, not the case, not the draft");
  const row = (id) => r.held.find((x) => x.bundle_id === id);
  assert.deepEqual([row("INFO-1").standing, row("INFO-2").standing], ["collected", "collected"]);
  assert.equal("vouched" in row("INFO-1"), false, "a collected row carries no vouched");
  assert.deepEqual([row("VOUCHED-1").standing, row("VOUCHED-1").vouched], ["verified", { by: "member:m2", at: "2026-03-05T12:00:00Z" }]);
  assert.deepEqual(row("VOUCHED-P").vouched, { by: null, at: "2026-03-06T00:00:00Z" }, "an entry that gives no author");
  assert.deepEqual(row("VOUCHED-N").vouched, { by: null, at: null }, "no history to read");
  /* a vouched row keeps R77's fields, and its facts */
  for (const k of ["title", "project", "source", "collected_since", "age_days", "captured_for", "capture", "actor", "retrieved", "bytes"])
    assert.ok(k in row("VOUCHED-1"), `the vouched row carries ${k}`);
  assert.equal(row("VOUCHED-1").actor, "m1");
  assert.equal(row("VOUCHED-1").source.address, "https://a.example/v1");
  assert.equal(row("VOUCHED-P").project, "PROJ-1");
  /* never set aside: no row carries set_aside, and the other two states answer as before */
  assert.equal(r.held.some((x) => "set_aside" in x), false);
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: ADMIN })).sort(), ["INFO-1", "INFO-2"], "held answers as before");
  assert.equal((await f.c.heldCaptures({ viewer: ADMIN })).held.some((x) => "standing" in x || "vouched" in x), false, "held rows carry neither field");
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: ADMIN, state: "set_aside" })), [], "set_aside answers as before");
  assert.deepEqual(everything(f.rows), before, "writes nothing");
});

test("R88 (T51; N1235): a vouched row is not asked of R78's examination, so its eligible is null with a basis saying it is already vouched for, and the collected rows are still asked once each; the page's wait is not spent on it", async () => {
  const f = vouchedWorld();
  const asked = [];
  f.c.registerReader("batch-examination", "ratification", (id) => { asked.push(id); return { eligible: true }; });
  const r = await f.c.heldCaptures({ viewer: ADMIN, state: "held_and_vouched" });
  assert.deepEqual(asked.sort(), ["INFO-1", "INFO-2"], "only the collected documents were examined, once each");
  for (const id of ["VOUCHED-1", "VOUCHED-P", "VOUCHED-N"]) {
    const v = r.held.find((x) => x.bundle_id === id);
    assert.equal(v.eligible, null, id);
    assert.equal(typeof v.eligibility_basis, "string", id);
    assert.ok(v.eligibility_basis.length > 0, id);
  }
  assert.equal(r.held.find((x) => x.bundle_id === "INFO-1").eligible, true, "control: a collected row is answered by the examination");
  /* the held list asks the examination of the collected only, whatever the vouched exist */
  asked.length = 0;
  await f.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(asked.sort(), ["INFO-1", "INFO-2"]);
});

test("R88 (T51; N1235): held_and_vouched keeps R77's sight, filters, sorts and bound; vouched rows count toward limit, truncated and next with the collected ones, and paging reads every row once", async () => {
  const f = vouchedWorld();
  const list = (o) => f.c.heldCaptures({ state: "held_and_vouched", ...o });
  assert.deepEqual(ids(await list({ viewer: "member:m2" })).sort(), ["INFO-1", "INFO-2", "VOUCHED-1", "VOUCHED-N"], "m2 takes no part in PROJ-1");
  assert.deepEqual(ids(await list({ viewer: "junk" })), [], "an unrecognised viewer sees nothing");
  assert.deepEqual(ids(await list({ viewer: ADMIN, project: "PROJ-1" })), ["VOUCHED-P"], "the project filter reaches a vouched document");
  assert.deepEqual(ids(await list({ viewer: ADMIN, member: "m1" })).sort(), ["INFO-1", "VOUCHED-1"], "the member who captured it, vouched or not");
  for (const [sort, dir] of [["age", "desc"], ["age", "asc"], ["source", "asc"], ["source", "desc"], ["project", "asc"]]) {
    const whole = ids(await list({ viewer: ADMIN, sort, dir }));
    assert.equal(whole.length, 5, `${sort} ${dir}`);
    const seen = [];
    let after = null;
    for (let n = 0; n < 10; n++) {
      const p = await list({ viewer: ADMIN, sort, dir, limit: 2, after });
      assert.ok(p.held.length <= 2);
      seen.push(...ids(p));
      if (!p.truncated) break;
      after = p.next;
    }
    assert.deepEqual(seen, whole, `${sort} ${dir}: every row once, vouched ones counted in the bound`);
  }
  const p1 = await list({ viewer: ADMIN, limit: 2 });
  assert.deepEqual([p1.limit, p1.truncated, typeof p1.next], [2, true, "string"]);
});

test("R88 (T51; N1235): any other state is refused naming state and its three values, nothing read; through op=heldcaptures held_and_vouched is the query's state by the stamped viewer", async () => {
  const f = vouchedWorld();
  const before = everything(f.rows);
  for (const bad of ["vouched", "HELD_AND_VOUCHED", "released"]) {
    const r = await f.c.heldCaptures({ viewer: ADMIN, state: bad });
    assert.deepEqual([r.ok, r.reason, r.argument, r.shape, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "state", "held | set_aside | held_and_vouched", 400]);
  }
  assert.deepEqual(everything(f.rows), before);
  const r = await route(f.c, "heldcaptures", `viewer=${ADMIN}&state=held_and_vouched`);
  assert.deepEqual([r.state, r.held.length], ["held_and_vouched", 5]);
  assert.deepEqual(ids(await route(f.c, "heldcaptures", "state=held_and_vouched")), [], "an unstamped call sees nothing");
});

test("R88 R77 (T51; N1235): an archive's files beside it are listed as R77 lists them, each file's standing its own; a vouched file carries vouched and is not examined", async () => {
  const w = archiveWorld();
  const a = await capturedArchive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  w.s.sql.exec(`UPDATE bundles SET current_state = 'verified', prior_state = 'collected' WHERE bundle_id = 'INFO-ZIP-0'`);
  const asked = [];
  w.c.registerReader("batch-examination", "ratification", (id) => { asked.push(id); return { eligible: true }; });
  const r = await w.c.heldCaptures({ viewer: ADMIN, state: "held_and_vouched" });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  const files = Object.fromEntries(r.held[0].files.map((x) => [x.document, x]));
  assert.deepEqual([files["INFO-ZIP-0"].standing, files["INFO-ZIP-1"].standing], ["verified", "collected"]);
  assert.deepEqual(files["INFO-ZIP-0"].vouched, { by: null, at: null });
  assert.equal(files["INFO-ZIP-0"].eligible, null);
  assert.equal(files["INFO-ZIP-1"].eligible, true);
  assert.equal(asked.includes("INFO-ZIP-0"), false, "the vouched file was not examined");
  assert.equal(r.held[0].archive.sha256, a.digest);
});

/* ---- R96 (T51; A64, K3807): heldAt ---- */

const ADDR = "https://news.example/story";
function heldAtWorld({ gov = governor() } = {}) {
  const f = fresh({ gov });
  member(f.s, "m1"); member(f.s, "m2");
  project(f.s, "PROJ-1", "m1");
  f.c.provenance = Object.assign(provenance(f.s), {
    captureGrade: (d) => ({ grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 4)}` }),
  });
  return f;
}
const world = () => {
  const f = heldAtWorld();
  doc(f, "INFO-1", { created: "2026-02-01T00:00:00Z", captures: [{ sha: H("a1"), address: ADDR, first: "2026-02-01T10:00:00.250Z", last: "2026-02-01T10:00:00.250Z" }], actor: "m1" });
  provDoc(f, "INFO-1", [{ capture: { sha256: H("a1"), method: "fetched" } }]);
  return f;
};
const GRADE = (d) => ({ grade: "B", route: "direct", determined: true, basis: "measured", why: `fetched ${d.slice(0, 4)}` });
const refused = (r, argument) => assert.deepEqual([r.ok, r.reason, r.op, r.argument, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "heldat", argument, 400]);

test("R96 (T51; A64): exactly one of address (a public locator) and sha256 (64 lowercase hex): neither, both, a malformed digest and an address that is no public locator are the required-argument refusal naming it, nothing read", async () => {
  const f = world();
  const net = network({});
  try {
    const before = everything(f.rows);
    refused(await f.c.heldAt({ viewer: ADMIN }), "address");
    refused(await f.c.heldAt({ viewer: ADMIN, address: ADDR, sha256: H("a1") }), "sha256");
    refused(await f.c.heldAt({ viewer: ADMIN, address: "" , sha256: "" }), "address");
    for (const bad of [H("A1").toUpperCase(), "abc", H("a1") + "0", 42, "sha256:" + H("a1")]) refused(await f.c.heldAt({ viewer: ADMIN, sha256: bad }), "sha256");
    for (const bad of ["http://news.example/story", "https://localhost/x", "https://127.0.0.1/x", "https://u:p@news.example/x", "https://nodot/x", "news.example/story", 7])
      refused(await f.c.heldAt({ viewer: ADMIN, address: bad }), "address");
    assert.equal(net.seen.length, 0, "nothing fetched");
    assert.deepEqual(f.c.governor.calls, [], "the governor was not asked");
    assert.deepEqual(everything(f.rows), before, "nothing read into any table, nothing written");
    /* the route reads the same query */
    refused(await route(f.c, "heldat", `viewer=${ADMIN}`), "address");
    refused(await route(f.c, "heldat", `viewer=${ADMIN}&address=${ADDR}&sha256=${H("a1")}`), "sha256");
  } finally { net.restore(); }
});

test("R96 (T51; A64): an address the record holds once answers held true with the compared copy, versions 1 and changed undetermined from the record alone, never unchanged; no request is made and nothing is written", async () => {
  const f = world();
  const net = network({});
  try {
    const before = everything(f.rows);
    const r = await f.c.heldAt({ address: ADDR, viewer: "member:m1" });
    assert.deepEqual([r.ok, r.held, r.versions, r.truncated], [true, true, 1, false]);
    assert.deepEqual(r.copy, { sha256: H("a1"), document: "INFO-1", project: null, retrieved: "2026-02-01T10:00:00Z", actor: "m1",
                               grade: GRADE(H("a1")), address: ADDR });
    assert.deepEqual([r.changed.state, r.changed.as_of, r.changed.earlier_differs], ["undetermined", "2026-02-01T10:00:00Z", false]);
    assert.equal(typeof r.changed.basis, "string");
    assert.ok(r.changed.basis.includes("2026-02-01T10:00:00Z"), "the basis says when the record last looked");
    assert.equal("looked_at" in r.changed || "served_sha256" in r.changed, false);
    assert.equal(net.seen.length, 0, "no request");
    assert.deepEqual(f.c.governor.calls, [], "none counted at the governor");
    assert.deepEqual(everything(f.rows), before, "writes nothing");
    /* the address is normalised as acquisition normalises a document address */
    for (const spelled of ["https://NEWS.example/story#part", "https://news.example:443/story"])
      assert.equal((await f.c.heldAt({ address: spelled, viewer: ADMIN })).copy.sha256, H("a1"), spelled);
    /* an address the record holds no capture of */
    const none = await f.c.heldAt({ address: "https://news.example/other", viewer: ADMIN });
    assert.deepEqual([none.ok, none.held, none.copy, none.versions, none.truncated, none.changed.state], [true, false, null, 0, false, "undetermined"]);
    /* the route */
    const via = await route(f.c, "heldat", `viewer=member:m1&address=${encodeURIComponent(ADDR)}`);
    assert.deepEqual([via.held, via.copy.sha256, via.changed.state], [true, H("a1"), "undetermined"]);
    assert.equal((await route(f.c, "heldat", `address=${encodeURIComponent(ADDR)}`)).held, false, "an unstamped call sees nothing");
  } finally { net.restore(); }
});

test("R96 (T51; A64): a second differing capture at the address makes earlier_differs true and the state still undetermined; the copy is the newest by last retrieval compared as instants, and versions counts what the viewer sees", async () => {
  const f = world();
  doc(f, "INFO-2", { created: "2026-03-01T00:00:00Z", captures: [{ sha: H("a2"), address: ADDR, first: "2026-03-01T00:00:00Z", last: "2026-03-01T00:00:00.500Z" }], actor: "m2" });
  /* a third capture of the address, in a project the viewer does not take part in: never counted, never named */
  doc(f, "INFO-3", { project: "PROJ-1", created: "2026-04-01T00:00:00Z", captures: [{ sha: H("a3"), address: ADDR, first: "2026-04-01T00:00:00Z" }] });
  const m2 = await f.c.heldAt({ address: ADDR, viewer: "member:m2" });
  assert.deepEqual([m2.copy.sha256, m2.copy.actor, m2.versions, m2.changed.state, m2.changed.earlier_differs], [H("a2"), "m2", 2, "undetermined", true]);
  const m1 = await f.c.heldAt({ address: ADDR, viewer: "member:m1" });
  assert.deepEqual([m1.copy.sha256, m1.versions], [H("a3"), 3], "m1 sees all three; the newest is the third");
  /* the same bytes seen again later is one capture, not two versions */
  f.s.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved) VALUES (?, ?, ?, 'archive.org', '2026-03-02T00:00:00Z', '2026-03-02T00:00:00Z')`, ADDR, ADDR, H("a2"));
  assert.equal((await f.c.heldAt({ address: ADDR, viewer: "member:m2" })).versions, 2);
});

test("R96 (T51; A64): versions counts at most HELD_AT_VERSIONS_MAX captures and says truncated when more lie past", async () => {
  const f = heldAtWorld();
  for (let i = 0; i < HELD_AT_VERSIONS_MAX + 3; i++) {
    const d = sha(`v${i}`);
    f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`, `D-${i}`);
    f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, d, `D-${i}`);
    receipt(f.s, { address: ADDR, capture: d, first: `2026-01-01T00:${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}Z` });
  }
  const r = await f.c.heldAt({ address: ADDR, viewer: ADMIN });
  assert.deepEqual([r.held, r.versions, r.truncated], [true, HELD_AT_VERSIONS_MAX, true]);
  assert.equal(HELD_AT_VERSIONS_MAX, 200);
});

test("R96 (T51; A64): a digest the record holds answers that capture as the copy with its newest address; a digest whose address is not public counts one version; an unseen digest and an unheld one answer held false alike", async () => {
  const f = world();
  doc(f, "INFO-UP", { project: "PROJ-1", created: "2026-03-01T00:00:00Z", captures: [{ sha: H("b1"), address: `upload:${H("b1")}`, via: UPLOAD_VIA }] });
  doc(f, "INFO-H", { project: "PROJ-1", created: "2026-03-01T00:00:00Z", captures: [{ sha: H("f4"), address: "https://p.example/x" }] });
  const byDigest = await f.c.heldAt({ sha256: H("a1"), viewer: "member:m1" });
  assert.deepEqual([byDigest.held, byDigest.copy.sha256, byDigest.copy.address, byDigest.copy.document, byDigest.versions, byDigest.changed.state],
                   [true, H("a1"), ADDR, "INFO-1", 1, "undetermined"]);
  assert.deepEqual(byDigest.copy, (await f.c.heldAt({ address: ADDR, viewer: "member:m1" })).copy, "the copy is the same whichever arm asks");
  const up = await f.c.heldAt({ sha256: H("b1"), viewer: "member:m1" });
  assert.deepEqual([up.held, up.versions, up.copy.address, up.copy.project], [true, 1, `upload:${H("b1")}`, "PROJ-1"]);
  /* a digest with a public address counts what is held at that address */
  doc(f, "INFO-2", { created: "2026-03-01T00:00:00Z", captures: [{ sha: H("a2"), address: ADDR, first: "2026-03-01T00:00:00Z" }] });
  const d2 = await f.c.heldAt({ sha256: H("a1"), viewer: "member:m1" });
  assert.deepEqual([d2.versions, d2.changed.earlier_differs], [2, true]);
  /* unseen and unheld answer alike: no count, no hint */
  const unseen = await f.c.heldAt({ sha256: H("f4"), viewer: "member:m2" });
  const unheld = await f.c.heldAt({ sha256: H("ee"), viewer: "member:m2" });
  assert.deepEqual(unseen, unheld);
  assert.deepEqual([unseen.held, unseen.copy, unseen.versions], [false, null, 0]);
  const unseenAddr = await f.c.heldAt({ address: "https://p.example/x", viewer: "member:m2" });
  assert.deepEqual(unseenAddr, await f.c.heldAt({ address: "https://nowhere.example/x", viewer: "member:m2" }));
  assert.equal((await f.c.heldAt({ sha256: H("f4"), viewer: "junk" })).held, false, "an unrecognised viewer sees nothing");
  /* a capture filed in no bundle is not held: the record holds no document of it */
  receipt(f.s, { address: "https://loose.example/x", capture: H("ff"), first: "2026-01-01T00:00:00Z" });
  assert.equal((await f.c.heldAt({ address: "https://loose.example/x", viewer: ADMIN })).held, false);
});

/* The source answers: a network the test scripts; `served` the bytes or status it gives. */
const seenHeaders = (net) => net.seen.map((x) => Object.fromEntries(Object.entries(x.init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])));

test("R96 (T51; A64): check from a member session sends one governed request conditional on the validators of the copy's own fetch: a 304 reads unchanged, with looked_at; nothing is filed and the one write is R8's outcome", async () => {
  const f = world();
  f.c.recordValidators({ addressNorm: ADDR, captureSha: H("a1"), etag: '"v1"', lastModified: "Sun, 01 Feb 2026 10:00:00 GMT" });
  f.c.clock = () => Date.parse("2026-05-01T08:00:00Z");
  const net = network({ [ADDR]: () => new Response(null, { status: 304 }) });
  try {
    const before = everything(f.rows, ["source_reachability"]);
    const held = await f.c.heldCaptures({ viewer: ADMIN });
    const r = await f.c.heldAt({ address: ADDR, check: true, viewer: "member:m1", member: "member:m1" });
    assert.deepEqual([r.held, r.changed.state, r.changed.looked_at, r.changed.as_of, r.changed.earlier_differs], [true, "unchanged", "2026-05-01T08:00:00Z", "2026-02-01T10:00:00Z", false]);
    assert.equal("served_sha256" in r.changed, false);
    assert.equal(typeof r.changed.basis, "string");
    assert.equal(net.seen.length, 1, "one request");
    assert.deepEqual([seenHeaders(net)[0]["if-none-match"], seenHeaders(net)[0]["if-modified-since"]], ['"v1"', "Sun, 01 Feb 2026 10:00:00 GMT"]);
    assert.ok(f.c.governor.calls.some((c) => c[0] === "admit" && c[1] === "news.example"), "through the host governor");
    assert.deepEqual(everything(f.rows, ["source_reachability"]), before, "no capture, receipt, document, bundle or validator written");
    assert.deepEqual(await f.c.heldCaptures({ viewer: ADMIN }), held, "the held list is unchanged");
    const reach = f.c.sourceReachability({ addressNorm: ADDR });
    assert.deepEqual([reach.known, reach.attempts, reach.consecutive_failures, reach.last_outcome], [true, 1, 0, "success"], "R8's outcome, a success");
  } finally { net.restore(); }
});

test("R96 (T51; A64): check with no validators asks unconditionally and hashes the body as it arrives: bytes hashing to the copy's digest are unchanged, other bytes changed with served_sha256", async () => {
  const same = "the story as first captured";
  const f = heldAtWorld();
  doc(f, "INFO-1", { created: "2026-02-01T00:00:00Z", captures: [{ sha: sha(same), address: ADDR, first: "2026-02-01T10:00:00Z" }] });
  provDoc(f, "INFO-1", [{ capture: { sha256: sha(same), method: "fetched" } }]);
  let answer = same;
  const net = network({ [ADDR]: () => new Response(answer) });
  try {
    const before = everything(f.rows, ["source_reachability"]);
    const u = await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member: "member:m1" });
    assert.equal(u.changed.state, "unchanged");
    assert.equal(seenHeaders(net)[0]["if-none-match"], undefined, "no validators recorded: unconditional");
    answer = "the story, corrected";
    /* T51 (C26): other bytes are a change only when both sides earned a determined substance digest (fix2-t51.test.mjs holds the
       changed and unchanged-by-substance cases); this copy recorded none, so the look says it cannot tell, and still looked */
    const c = await f.c.heldAt({ sha256: sha(same), check: true, viewer: ADMIN, member: "member:m1" });
    assert.deepEqual([c.changed.state, c.changed.served_sha256, typeof c.changed.looked_at], ["undetermined", undefined, "string"]);
    assert.equal(c.copy.sha256, sha(same), "relative to the copy alone");
    assert.deepEqual(everything(f.rows, ["source_reachability"]), before, "nothing filed: the new bytes are not held");
    assert.equal((await f.c.heldAt({ address: ADDR, viewer: ADMIN })).versions, 1, "versionchain's view of the address is unchanged");
    /* a 200 answer to a conditional request is a body to hash, not a verdict */
    f.c.recordValidators({ addressNorm: ADDR, captureSha: sha(same), etag: '"v1"' });
    answer = same;
    assert.equal((await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member: "member:m1" })).changed.state, "unchanged");
  } finally { net.restore(); }
});

test("R96 (T51; A64): a refusal, a failure, a governed refusal and a body too large each read undetermined with their own basis, never unchanged; R8 counts the outcome, a governed refusal apart", async () => {
  const run = async (routes, gov) => {
    const f = heldAtWorld({ gov });
    doc(f, "INFO-1", { created: "2026-02-01T00:00:00Z", captures: [{ sha: H("a1"), address: ADDR, first: "2026-02-01T10:00:00Z" }] });
    provDoc(f, "INFO-1", [{ capture: { sha256: H("a1"), method: "fetched" } }]);
    const net = network(routes);
    try { return { f, r: await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member: "member:m1" }), net }; }
    finally { net.restore(); }
  };
  const refusedByGone = await run({ [ADDR]: () => new Response("gone", { status: 410 }) });
  const failed = await run({ [ADDR]: new Error("connection reset") });
  const governed = await run({ [ADDR]: () => new Response("x") }, governor({ refuse: ["news.example"] }));
  const bases = new Set();
  for (const { r } of [refusedByGone, failed, governed]) {
    assert.deepEqual([r.ok, r.held, r.changed.state], [true, true, "undetermined"]);
    assert.equal("looked_at" in r.changed, false, "no look was made");
    bases.add(r.changed.basis);
  }
  assert.equal(bases.size, 3, "each reason is its own basis");
  const reach = (x) => x.f.c.sourceReachability({ addressNorm: ADDR });
  assert.deepEqual([reach(refusedByGone).last_outcome, reach(refusedByGone).consecutive_failures], ["source_refused", 1]);
  assert.deepEqual([reach(failed).last_outcome, reach(failed).consecutive_failures], ["fetch_failed", 1]);
  assert.deepEqual([reach(governed).last_outcome, reach(governed).consecutive_failures, reach(governed).governed_refusals], ["governed", 0, 1]);
  assert.equal(governed.net.seen.length, 0, "the governor refused before any request");
  /* control: the same source answering is a look */
  const ok = await run({ [ADDR]: () => new Response(null, { status: 304 }) });
  assert.equal(ok.r.changed.state, "undetermined", "a 304 with no validators recorded is no verdict");
});

test("R96 (T51; A64): check from a machine credential or any non-member stamp is refused MEMBER_SESSION_REQUIRED (403) and fetches nothing; so is a check with no stamp; without check the stamp is not asked", async () => {
  const f = world();
  const net = network({ [ADDR]: () => new Response("x") });
  try {
    for (const member of [ADMIN, "class:probe", "member:", "", null, undefined, 7]) {
      const r = await f.c.heldAt({ address: ADDR, check: true, viewer: ADMIN, member });
      assert.deepEqual([r.ok, r.reason, r.status], [false, "MEMBER_SESSION_REQUIRED", 403], String(member));
    }
    assert.equal(net.seen.length, 0);
    assert.deepEqual(f.c.governor.calls, []);
    assert.equal((await f.c.heldAt({ address: ADDR, viewer: ADMIN, member: ADMIN })).held, true, "the record-only read is for any member session");
    /* through the route the stamp is `by` */
    assert.equal((await route(f.c, "heldat", `viewer=${ADMIN}&by=${ADMIN}&check=1&address=${encodeURIComponent(ADDR)}`)).reason, "MEMBER_SESSION_REQUIRED");
    assert.equal(net.seen.length, 0);
  } finally { net.restore(); }
});

test("R96 (T51; A64): through op=heldat a member's check=1 looks at the source; a check over a digest or address the viewer may not see, or not held, fetches nothing and answers held false", async () => {
  const f = world();
  doc(f, "INFO-P", { project: "PROJ-1", created: "2026-03-01T00:00:00Z", captures: [{ sha: H("f4"), address: "https://p.example/x" }] });
  provDoc(f, "INFO-P", [{ capture: { sha256: H("f4"), method: "fetched" } }]);
  const net = network({ [ADDR]: () => new Response(null, { status: 304 }), "https://p.example/x": () => new Response("x") });
  try {
    f.c.recordValidators({ addressNorm: ADDR, captureSha: H("a1"), etag: '"v1"' });
    const ok = await route(f.c, "heldat", `viewer=member:m1&by=member:m1&check=true&address=${encodeURIComponent(ADDR)}`);
    assert.equal(ok.changed.state, "unchanged");
    assert.equal(net.seen.length, 1);
    for (const q of [`sha256=${H("f4")}`, `address=${encodeURIComponent("https://p.example/x")}`, `sha256=${H("ee")}`, `address=${encodeURIComponent("https://none.example/x")}`]) {
      const r = await route(f.c, "heldat", `viewer=member:m2&by=member:m2&check=1&${q}`);
      assert.deepEqual([r.ok, r.held, r.copy], [true, false, null], q);
    }
    assert.equal(net.seen.length, 1, "no further request");
  } finally { net.restore(); }
});

test("R96 (T51; A64): a copy that is no plain fetch (a rendered capture, an archive replay, a Drive export, an upload, a knock) or a digest with no public address reads undetermined under check with its own basis, and nothing is fetched", async () => {
  const f = heldAtWorld();
  const net = network({});
  const kinds = [
    ["rendered", { sha: H("c1"), address: "https://r.example/x" }, [{ capture: { sha256: H("c1"), method: "rendered" } }]],
    ["rendered pair", { sha: H("c2"), address: "https://r2.example/x" }, [{ capture: { sha256: H("c2"), method: "fetched" }, pair: { primary: "rendered" } }]],
    ["archive", { sha: H("d1"), address: "https://w.example/x", via: "archive.org" }, [{ capture: { sha256: H("d1"), method: "fetched" } }]],
    ["drive export", { sha: H("e1"), address: "https://drive.example/file/d/1", retrievalLocator: "https://drive.example/export?id=1&format=odt" }, [{ capture: { sha256: H("e1"), method: "fetched" } }]],
    ["upload", { sha: H("b1"), address: `upload:${H("b1")}`, via: UPLOAD_VIA }, [{ capture: { sha256: H("b1"), method: "uploaded" } }]],
    ["knock", { sha: H("f1"), address: "https://k.example/x", via: DOORBELL_VIA }, [{ capture: { sha256: H("f1"), method: "received" } }]],
    ["unreadable", { sha: H("f2"), address: "https://x.example/x" }, null],
  ];
  try {
    const bases = new Set();
    for (const [name, c, docs] of kinds) {
      doc(f, `D-${name}`, { created: "2026-02-01T00:00:00Z", captures: [c] });
      if (docs) provDoc(f, `D-${name}`, docs);
      const r = await f.c.heldAt({ sha256: c.sha, check: true, viewer: ADMIN, member: "member:m1" });
      assert.deepEqual([name, r.held, r.changed.state], [name, true, "undetermined"]);
      assert.equal("looked_at" in r.changed, false, name);
      bases.add(r.changed.basis);
    }
    assert.ok(bases.size >= 4, "the kinds do not all share one sentence");
    /* a registered digest with no receipt at all has no address to look at */
    f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('D-NOADDR', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
    f.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, 'D-NOADDR', 'x')`, H("f3"));
    const none = await f.c.heldAt({ sha256: H("f3"), check: true, viewer: ADMIN, member: "member:m1" });
    assert.deepEqual([none.held, none.copy.address, none.changed.state], [true, null, "undetermined"]);
    assert.equal(net.seen.length, 0, "no request for any of them");
    assert.deepEqual(f.c.governor.calls, []);
    /* control: a plain direct fetch of a rendered address's twin does look */
    doc(f, "D-plain", { created: "2026-02-01T00:00:00Z", captures: [{ sha: H("f5"), address: "https://pl.example/x" }] });
    provDoc(f, "D-plain", [{ capture: { sha256: H("f5"), method: "fetched" } }]);
    net.restore();
    const net2 = network({ "https://pl.example/x": () => new Response("different") });
    try {
      const looked = await f.c.heldAt({ sha256: H("f5"), check: true, viewer: ADMIN, member: "member:m1" });
      assert.deepEqual([net2.seen.length, typeof looked.changed.looked_at], [1, "string"], "it looked (C26: this copy recorded no determined digest, so what it saw reads undetermined, not changed)");
      assert.equal(looked.changed.state, "undetermined");
    }
    finally { net2.restore(); }
  } finally { net.restore(); }
});

test("R96 (T51; A64): a store that cannot be read answers held null with a basis, never false, and never throws", async () => {
  const f = world();
  f.s.db.exec("DROP TABLE register");
  const r = await f.c.heldAt({ address: ADDR, viewer: ADMIN });
  assert.deepEqual([r.ok, r.held, r.copy, r.versions, r.changed.state], [true, null, null, null, "undetermined"]);
  assert.equal(typeof r.changed.basis, "string");
  const c = await f.c.heldAt({ sha256: H("a1"), check: true, viewer: ADMIN, member: "member:m1" });
  assert.equal(c.held, null);
  assert.equal((await f.c.heldAt()).ok, false, "called with nothing it refuses, it does not throw");
});

/* capture, T49 (T49-5; N1080, K3295, K3324 (1)): a page of held captures in bounded time (R91, amending R77, R78, R88).
   At the module's interface: `heldCaptures` over this module's fixture, a registered batch examination (R78) and
   acquisition's real archive listing, with the evidence store's round trip and an examination's time stated. A wait that
   runs out is driven by node's mock timers (the page's wait is `HELD_PAGE_WAIT_MS`, read from the module, never repeated
   here), so no test sleeps for it. */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, sha } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { HELD_PAGE_WAIT_MS } from "../../../src/capture/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";

const ADMIN = "class:admin";
const ids = (r) => r.held.map((x) => x.bundle_id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const never = () => new Promise(() => {});
const flush = () => new Promise((r) => setImmediate(r));

/* A world over this module's fixture, provenance as acquisition's tests stand it in, and acquisition's instance handed to
   the store. `latency` is the evidence store's round trip in milliseconds on every head and get. */
function world({ latency = 0 } = {}) {
  const b = bucket();
  if (latency) for (const k of ["head", "get"]) { const f = b[k].bind(b); b[k] = async (...a) => { await sleep(latency); return f(...a); }; }
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const registered = [];
  const prov = acquisitionProvenance({ sql: f.s.sql, registered });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  return { ...f, b, prov, registered };
}
const bundle = (w, id, { created = "2026-01-01T00:00:00Z" } = {}) =>
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1)`, id, `title ${id}`, created, created);
/* A held document with one plain capture, its bytes in the evidence store. */
function held(w, i) {
  const bytes = new TextEncoder().encode(`<html>document ${i} ${"x".repeat(2000)}</html>`);
  const d = sha(bytes);
  w.b.held.set(`bio/captures/${d}`, bytes);
  const id = `INFO-${String(i).padStart(3, "0")}`;
  bundle(w, id, { created: `2026-01-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z` });
  w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, d, id);
  w.prov.homes[d] = id;
  w.registered.push(d);
  return { id, digest: d };
}
/* An archive captured through `acquire` (a member session) and promoted as the control plane does: a document for the
   archive and one for each file. */
async function archive(w, entries, { url = "https://files.example/set.zip", id = "ZIP" } = {}) {
  const z = makeZip(entries);
  const net = network({ [url]: () => new Response(z, { headers: { "content-type": "application/zip" } }) });
  let r;
  try { r = await w.c.acquire({ locator: url }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); }
  finally { net.restore(); }
  assert.equal(r.body.ok, true);
  const promote = (bundleId, digest) => {
    bundle(w, bundleId, { created: "2026-03-01T00:00:00Z" });
    w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, digest, bundleId);
    w.prov.homes[digest] = bundleId;
  };
  promote(`INFO-${id}`, sha(z));
  const docs = (r.body.unpack && r.body.unpack.documents) || [];
  for (const d of docs) promote(`INFO-${id}-${d.container.index}`, d.capture.sha256);
  return { digest: sha(z), files: docs.map((d) => `INFO-${id}-${d.container.index}`) };
}
/* A registered examination counting what it is asked, by document. */
function counting(w, answer = () => ({ eligible: true })) {
  const asked = new Map();
  w.c.registerReader("batch-examination", "ratification", (id) => { asked.set(id, (asked.get(id) || 0) + 1); return answer(id); });
  return asked;
}
/* Starts a call under mock timers and answers once the page's wait has run out (or the call settled before it). */
async function runOut(call, { before = 0 } = {}) {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    let settled = false;
    const p = call();
    p.then(() => { settled = true; }, () => { settled = true; });
    await flush();
    if (before) { mock.timers.tick(before); await flush(); }
    const early = settled;
    mock.timers.tick(HELD_PAGE_WAIT_MS - before);
    await flush();
    return { early, result: await p };
  } finally { mock.timers.reset(); }
}

test("R91: HELD_PAGE_WAIT_MS is a positive whole number of milliseconds this module exports (5000, BOB's, set from M-T49-3)", () => {
  assert.ok(Number.isInteger(HELD_PAGE_WAIT_MS) && HELD_PAGE_WAIT_MS > 0);
  assert.equal(HELD_PAGE_WAIT_MS, 5000);
});

/* M-T49-3 (N1080), measured before this change with the evidence store's round trip at 20 ms: each plain held capture cost
   4 evidence reads inside `archiveList`, asked row after row, 84 ms a row: 100 rows took 8.4 s with no examination cost. */
const BEFORE_PER_ROW_MS = 84;
test(`R91 R77 R78 (M-T49-3): at the plane's shape, 100 plain held documents unfiltered with the evidence store at a 20 ms round trip and an examination of 10 ms each, the page answers within HELD_PAGE_WAIT_MS, every examination answered, at well under the ${BEFORE_PER_ROW_MS} ms a row it took before`, async () => {
  const w = world({ latency: 20 });
  const N = 100;
  for (let i = 0; i < N; i++) held(w, i);
  const asked = counting(w, async () => { await sleep(10); return { eligible: true }; });
  const began = performance.now();
  const r = await w.c.heldCaptures({ viewer: ADMIN, limit: N });
  const took = performance.now() - began;
  assert.equal(r.held.length, N);
  assert.ok(took < HELD_PAGE_WAIT_MS, `the page answered in ${Math.round(took)} ms, within ${HELD_PAGE_WAIT_MS}`);
  assert.ok(took / N < BEFORE_PER_ROW_MS / 2, `${(took / N).toFixed(1)} ms a row, from ${BEFORE_PER_ROW_MS}`);
  assert.ok(r.held.every((row) => row.eligible === true && row.eligibility_basis === undefined), "every examination answered in time: R78's true, as before");
  assert.ok(r.held.every((row) => row.archive === undefined), "a plain capture carries no archive");
  assert.equal(asked.size, N);
  assert.ok([...asked.values()].every((n) => n === 1), "the examination is asked once for each document");
});

test("R91 R77 R78: for one page the examination is asked once for each document the page shows, a row or a file beside its archive, and the archive grouping once for each row's capture, counted at the registered reader and at archiveList", async () => {
  const w = world();
  for (let i = 0; i < 5; i++) held(w, i);
  const a = await archive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }, { name: "c.txt", data: "sea" }]);
  assert.equal(a.files.length, 3);
  const asked = counting(w);
  const probes = new Map();
  const real = w.c.archiveList.bind(w.c);
  w.c.archiveList = (args) => { if (args.limit === 1) probes.set(args.archiveSha, (probes.get(args.archiveSha) || 0) + 1); return real(args); };
  const r = await w.c.heldCaptures({ viewer: ADMIN, limit: 100 });
  assert.equal(r.held.length, 6, "five documents and the archive");
  const row = r.held.find((x) => x.bundle_id === "INFO-ZIP");
  assert.deepEqual(row.files.map((f) => f.document), a.files);
  assert.deepEqual([...asked.keys()].sort(), [...ids(r), ...a.files].sort(), "each document the page shows");
  assert.ok([...asked.values()].every((n) => n === 1), "and none twice");
  assert.equal(probes.size, 6, "the grouping of each row's capture");
  assert.ok([...probes.values()].every((n) => n === 1), "and none twice");
});

test("R91 R78: an examination that never settles leaves each row eligible null with a basis saying it did not answer in time, the answer comes when HELD_PAGE_WAIT_MS has run out and not before, and every other part of the answer is as it was; an examination that answers in time gives true or false, and one that throws keeps its own basis", async () => {
  const build = () => { const w = world(); for (let i = 0; i < 12; i++) held(w, i); return w; };
  const plainAnswer = await build().c.heldCaptures({ viewer: ADMIN, limit: 5, now: "2026-03-11T00:00:00Z" });
  const w = build();
  const asked = counting(w, (id) => (id === "INFO-001" ? { eligible: true } : id === "INFO-002" ? { eligible: false, class: "crucial", reason: "it is crucial" }
                                      : id === "INFO-003" ? (() => { throw new Error("down"); })() : never()));
  const { early, result: r } = await runOut(() => w.c.heldCaptures({ viewer: ADMIN, limit: 5, now: "2026-03-11T00:00:00Z" }), { before: HELD_PAGE_WAIT_MS - 1 });
  assert.equal(early, false, "one millisecond short of the wait it has not answered");
  const by = Object.fromEntries(r.held.map((x) => [x.bundle_id, x]));
  assert.equal(r.held.length, 5);
  for (const row of r.held) {
    if (["INFO-001", "INFO-002", "INFO-003"].includes(row.bundle_id)) continue;
    assert.equal(row.eligible, null, row.bundle_id);
    assert.match(row.eligibility_basis, /^ratification's examination did not answer in time, so eligibility is undetermined$/);
  }
  assert.deepEqual([by["INFO-001"].eligible, by["INFO-002"].eligible, by["INFO-002"].class], [true, false, "crucial"], "control: an answer in time is R78's");
  assert.match(by["INFO-003"].eligibility_basis, /did not answer for this document/, "an examination that threw says that, not that it was late");
  /* every other field of the answer is unchanged by the lateness */
  const strip = ({ eligible, eligibility_basis, class: c, reason, ...rest }) => rest;
  assert.deepEqual(r.held.map(strip), plainAnswer.held.map(strip));
  assert.deepEqual([r.sort, r.dir, r.limit, r.truncated, r.next], [plainAnswer.sort, plainAnswer.dir, plainAnswer.limit, plainAnswer.truncated, plainAnswer.next]);
  assert.ok([...asked.values()].every((n) => n === 1), "each asked once, none again after the wait");
  assert.ok(asked.size >= 5, "the page's documents were asked");
});

test("R91 R78: an examination that never settles holds up no other row: every row's is asked when the page begins, and each reads undetermined at the wait", async () => {
  const w = world();
  for (let i = 0; i < 6; i++) held(w, i);
  const asked = counting(w, () => never());
  const { result: r } = await runOut(() => w.c.heldCaptures({ viewer: ADMIN, limit: 6 }));
  assert.equal(r.held.length, 6);
  assert.ok(r.held.every((row) => row.eligible === null && /did not answer in time/.test(row.eligibility_basis)));
  assert.equal(asked.size, 6, "every row's examination was asked when the page began, so one that hangs holds up no other row");
});

test("R91 R77: an archive listing that never settles leaves that row archive {sha256, grouping: null} and files null with files_basis, its files neither dropped without being named nor counted as listed, the examination still answered; a row of no capture, and an answer in time, are as before", async () => {
  const w = world();
  held(w, 1);
  bundle(w, "INFO-NOCAPTURE", { created: "2026-01-09T00:00:00Z" });
  const a = await archive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  counting(w);
  const control = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(control.held.find((x) => x.bundle_id === "INFO-ZIP").files.map((f) => f.document), a.files, "control: answered in time, the files are listed");
  assert.deepEqual([control.held.find((x) => x.bundle_id === "INFO-ZIP").files_total], [2]);
  w.c.archiveList = () => never();
  const { early, result: r } = await runOut(() => w.c.heldCaptures({ viewer: ADMIN }));
  assert.equal(early, false);
  assert.deepEqual(ids(r), ids(control), "the rows and their order are unchanged");
  const zip = r.held.find((x) => x.bundle_id === "INFO-ZIP");
  assert.deepEqual(zip.archive, { sha256: a.digest, grouping: null });
  assert.equal(zip.files, null);
  assert.match(zip.files_basis, /undetermined/);
  assert.equal("files_total" in zip || "files_truncated" in zip, false, "no file is counted as listed");
  assert.equal(zip.eligible, true, "its eligibility is its own answer, given in time");
  const plain = r.held.find((x) => x.bundle_id === "INFO-001");
  assert.equal(plain.archive.grouping, null, "a capture whose listing did not answer is undetermined too: it may be an archive");
  assert.equal(plain.files, null);
  const none = r.held.find((x) => x.bundle_id === "INFO-NOCAPTURE");
  assert.equal(none.archive, undefined, "control: a document with no capture has nothing to group");
  assert.equal(none.files, undefined);
});

test("R91 R77 R78: a file beside an archive whose examination never settles reads eligible null with eligibility_basis, the archive and its other parts answered; and nothing is asked of the evidence store once the wait has run out", async () => {
  const w = world();
  const a = await archive(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  counting(w, (id) => (a.files.includes(id) ? never() : { eligible: true }));
  const { result: r } = await runOut(() => w.c.heldCaptures({ viewer: ADMIN }));
  const zip = r.held[0];
  assert.equal(zip.eligible, true);
  assert.deepEqual(zip.files.map((f) => [f.document, f.eligible]), a.files.map((f) => [f, null]));
  assert.ok(zip.files.every((f) => /did not answer in time/.test(f.eligibility_basis)));
  assert.equal(zip.files_total, 2, "its files are named and counted: only their eligibility is undetermined");
  /* the listing is slow (3 s a call): the page gives up at the wait, and the abandoned grouping asks nothing more once it has */
  const slow = world();
  await archive(slow, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  let clock = 0;
  const calls = [];
  const real = slow.c.archiveList.bind(slow.c);
  slow.c.archiveList = async (args) => { calls.push(clock); await sleep(3000); return real(args); };
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const p = slow.c.heldCaptures({ viewer: ADMIN });
    await flush();
    for (const step of [3000, 2000, 3000, 3000]) { clock += step; mock.timers.tick(step); await flush(); }
    const row = (await p).held[0];
    assert.equal(row.files, null);
    assert.ok(calls.length >= 1 && calls.every((at) => at < HELD_PAGE_WAIT_MS), `every listing was asked before the wait ran out (${calls.join(", ")})`);
  } finally { mock.timers.reset(); }
});

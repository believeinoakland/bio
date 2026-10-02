/* capture: the grade note of a capture completed unattended (R76, DEC-95 (1)) and the held captures (R77–R79, R81,
   DEC-97; K1019) at the module's interface: the store-side services and their routes, over record-core's `bundles`
   (its R37 read contract), provenance's `register` and `captured_locators` (its R48) and membership's sight (its R43),
   as the fixture builds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, receipt, register, sha, H } from "./fixture.mjs";
import { captureOps, ACQUIRE_GRADE_NOTE, READ_LIMIT, REASON_MAX } from "../../../src/capture/index.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { PER_ITEM_MAX } from "../../../src/record-core/index.mjs";

const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();

/* ---- R76: the grade note (DEC-95 (1)) ---- */

test("R76 (DEC-95 (1)): gradeNoteOf answers acquisition's grade note, the words op=acquire carries, for a capture completed with no member present; null for one not held", async () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  const net = network({ "https://a.example/x": () => new Response("unattended bytes", { headers: { "content-type": "text/plain" } }) });
  let acquired;
  try { acquired = await f.c.acquire({ locator: "https://a.example/x" }, { cls: "admin", member: false, sessMember: null }); }
  finally { net.restore(); }
  assert.equal(acquired.body.document.capture.actor, null, "a machine credential's capture: no member present");
  const d = sha("unattended bytes");
  const before = everything(f.rows);
  const r = await f.c.gradeNoteOf({ captureSha: d });
  assert.deepEqual(r, { captureSha: d, note: ACQUIRE_GRADE_NOTE });
  assert.equal(r.note, acquired.body.note, "the same words the acquire's answer carried");
  assert.deepEqual(everything(f.rows), before, "writes nothing");
  /* not held: null */
  for (const x of [H("ab"), "not a sha", null, undefined, 42]) assert.equal((await f.c.gradeNoteOf({ captureSha: x })).note, null, String(x));
  /* held through provenance's register or receipt alone (a capture held in parts) */
  f.c.provenance.registerHolds = ({ sha: s }) => ({ ok: true, sha: s, asked: true, registered: false, acquired: s === H("cd") });
  assert.equal((await f.c.gradeNoteOf({ captureSha: H("cd") })).note, ACQUIRE_GRADE_NOTE);
  /* with no evidence store and no provenance answer, nothing is held */
  assert.equal((await fresh({}).c.gradeNoteOf({ captureSha: d })).note, null);
});

test("R76: gradeNoteOf answers by the viewer as captureAccountsOf does: a capture the viewer may not see answers note null, as one not held; the route reads the stamped viewer and an unstamped call sees nothing", async () => {
  const b = bucket();
  const f = fresh({ evidence: b });
  const hidden = sha("in a project"), open = sha("open");
  for (const x of ["in a project", "open"]) b.held.set(`bio/captures/${sha(x)}`, new TextEncoder().encode(x));
  register(f.s, hidden, "PROJ-2026-0001", { type: "project" });
  f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m2', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  assert.equal((await f.c.gradeNoteOf({ captureSha: hidden, viewer: "member:m2" })).note, null, "unseen reads as not held");
  assert.equal((await f.c.gradeNoteOf({ captureSha: hidden, viewer: "class:admin" })).note, ACQUIRE_GRADE_NOTE, "a machine credential sees it");
  assert.equal((await f.c.gradeNoteOf({ captureSha: open, viewer: "member:m2" })).note, ACQUIRE_GRADE_NOTE, "a capture in no bundle is seen");
  assert.equal((await f.c.gradeNoteOf({ captureSha: open, viewer: "junk" })).note, null, "an unrecognised viewer sees nothing");
  assert.equal((await route(f.c, "gradenote", `capture=${open}&viewer=member:m2`)).note, ACQUIRE_GRADE_NOTE);
  assert.equal((await route(f.c, "gradenote", `capture=${open}`)).note, null, "unstamped: nothing");
});

/* ---- R77–R79, R81: held captures (DEC-97) ---- */

/* A world of documents: INFO-1..4 information at collected (INFO-4 in project PROJ-1, which m2 does not take part in),
   INFO-5 information at verified, CASE-1 not information. Captures registered to them, with receipts and actors. */
function heldWorld() {
  const f = fresh();
  const s = f.s;
  for (const m of ["m1", "m2"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('PROJ-1', 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`);
  s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  const doc = (id, { type = "information", state = "collected", created, updated = created, prior = null, project = null, capture, address, actor }) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, prior_state, created, last_updated, bundle_sha, row_version, project)
                VALUES (?, ?, 'g', ?, ?, ?, ?, ?, 'x', 1, ?)`, id, type, `title ${id}`, state, prior, created, updated, project);
    if (capture) {
      s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, capture, id);
      if (address) receipt(s, { address, capture, first: created });
      if (actor) f.c.recordCaptureActor({ captureSha: capture, actor, at: created });
    }
  };
  doc("INFO-1", { created: "2026-01-01T00:00:00Z", capture: H("1"), address: "https://b.example/one", actor: "m1" });
  doc("INFO-2", { created: "2026-02-01T00:00:00Z", capture: H("2"), address: "https://a.example/two", actor: "member:m2", project: null });
  doc("INFO-3", { created: "2026-01-15T00:00:00Z", updated: "2026-03-01T00:00:00Z", prior: "verified", capture: H("3") });
  doc("INFO-4", { created: "2026-01-10T00:00:00Z", project: "PROJ-1", capture: H("4"), address: "https://c.example/four", actor: "m1" });
  doc("INFO-5", { state: "verified", created: "2026-01-02T00:00:00Z" });
  doc("CASE-1", { type: "case", created: "2026-01-03T00:00:00Z" });
  return f;
}
const NOW = "2026-03-11T00:00:00Z";
const ids = (r) => r.held.map((x) => x.bundle_id);

test("R77 (DEC-97 (1)): heldCaptures lists the Information documents at collected not set aside, as the viewer may see them, each with its source as provenance records it, its project, its age since collected and its eligibility; writes nothing", async () => {
  const { c, rows } = heldWorld();
  const before = everything(rows);
  const r = await c.heldCaptures({ viewer: "member:m1", now: NOW });
  assert.deepEqual(ids(r), ["INFO-1", "INFO-4", "INFO-2", "INFO-3"], "the longest held first; not INFO-5 (verified), not CASE-1 (not information)");
  assert.deepEqual([r.sort, r.dir, r.limit, r.truncated, r.next], ["age", "desc", READ_LIMIT.default, false, null]);
  const one = r.held[0];
  assert.deepEqual({ ...one }, { bundle_id: "INFO-1", title: "title INFO-1", project: null,
                                 source: { address: "https://b.example/one", via: "direct", retrieved: "2026-01-01T00:00:00Z" },
                                 collected_since: "2026-01-01T00:00:00Z", age_days: 69,
                                 eligible: null, eligibility_basis: "no batch-release examination is registered, so eligibility is undetermined" });
  const three = r.held.find((x) => x.bundle_id === "INFO-3");
  assert.deepEqual([three.collected_since, three.age_days, three.source], ["2026-03-01T00:00:00Z", 10, null],
                   "back at collected: aged from when its state last moved; no receipt, no source");
  assert.equal(r.held.find((x) => x.bundle_id === "INFO-4").project, "PROJ-1");
  /* sight: m2 takes no part in PROJ-1 */
  assert.deepEqual(ids(await c.heldCaptures({ viewer: "member:m2", now: NOW })), ["INFO-1", "INFO-2", "INFO-3"]);
  assert.deepEqual(ids(await c.heldCaptures({ viewer: "junk" })), [], "an unrecognised viewer sees nothing");
  assert.deepEqual(ids(await c.heldCaptures({ viewer: "class:admin" })).length, 4, "a machine credential sees all");
  assert.deepEqual(everything(rows), before, "nothing written");
});

test("R77: heldCaptures filters by the member who captured a document and by project, sorts by age, source or project either way (none last), and pages by `after` over every row once", async () => {
  const { c } = heldWorld();
  const v = { viewer: "member:m1", now: NOW };
  assert.deepEqual(ids(await c.heldCaptures({ ...v, member: "m1" })), ["INFO-1", "INFO-4"]);
  assert.deepEqual(ids(await c.heldCaptures({ ...v, member: "member:m2" })), ["INFO-2"], "member:x and x are one member");
  assert.deepEqual(ids(await c.heldCaptures({ ...v, member: "m9" })), []);
  assert.deepEqual(ids(await c.heldCaptures({ ...v, project: "PROJ-1" })), ["INFO-4"]);
  assert.deepEqual(ids(await c.heldCaptures({ ...v, sort: "age", dir: "asc" })), ["INFO-3", "INFO-2", "INFO-4", "INFO-1"], "the youngest first");
  assert.deepEqual(ids(await c.heldCaptures({ ...v, sort: "source" })), ["INFO-2", "INFO-1", "INFO-4", "INFO-3"]);
  assert.deepEqual(ids(await c.heldCaptures({ ...v, sort: "source", dir: "desc" })), ["INFO-4", "INFO-1", "INFO-2", "INFO-3"], "no source last either way");
  assert.deepEqual(ids(await c.heldCaptures({ ...v, sort: "project" })), ["INFO-4", "INFO-1", "INFO-2", "INFO-3"]);
  assert.deepEqual(ids(await c.heldCaptures({ ...v, sort: "project", dir: "desc" })), ["INFO-4", "INFO-1", "INFO-2", "INFO-3"]);
  for (const [sort, dir] of [["age", "desc"], ["age", "asc"], ["source", "asc"], ["source", "desc"], ["project", "asc"]]) {
    const whole = ids(await c.heldCaptures({ ...v, sort, dir }));
    const seen = [];
    let after = null;
    for (let n = 0; n < 10; n++) {
      const p = await c.heldCaptures({ ...v, sort, dir, limit: 1, after });
      seen.push(...ids(p));
      if (!p.truncated) break;
      after = p.next;
    }
    assert.deepEqual(seen, whole, `${sort} ${dir}`);
  }
  assert.equal((await c.heldCaptures({ ...v, sort: "size" })).argument, "sort");
  assert.equal((await c.heldCaptures({ ...v, dir: "up" })).argument, "dir");
  assert.equal((await c.heldCaptures({ ...v, after: "x" })).reason, "BAD_CURSOR");
  assert.equal((await c.heldCaptures({ ...v, limit: 5000 })).limit, READ_LIMIT.max);
  /* the route: the stamped viewer, and an unstamped call sees nothing */
  assert.deepEqual(ids(await route(c, "heldcaptures", "viewer=member:m2&sort=source")), ["INFO-2", "INFO-1", "INFO-3"]);
  assert.deepEqual(ids(await route(c, "heldcaptures")), []);
});

test("R78 (DEC-97 (3)): a registered batch examination answers each row eligible, or not with the class it fails first and its reason; one that fails or answers neither reads null, undetermined; registered once", async () => {
  const { c } = heldWorld();
  assert.equal(c.registerReader("batch-examination", "ratification", (id) =>
    id === "INFO-1" ? { eligible: true } : id === "INFO-2" ? { eligible: false, class: "contested", reason: "an open contradiction touches it" }
      : id === "INFO-3" ? (() => { throw new Error("down"); })() : { eligible: "maybe" }).ok, true);
  const by = Object.fromEntries((await c.heldCaptures({ viewer: "class:admin" })).held.map((r) => [r.bundle_id, r]));
  assert.equal(by["INFO-1"].eligible, true);
  assert.deepEqual([by["INFO-2"].eligible, by["INFO-2"].class, by["INFO-2"].reason], [false, "contested", "an open contradiction touches it"]);
  for (const id of ["INFO-3", "INFO-4"]) {
    assert.equal(by[id].eligible, null, id);
    assert.match(by[id].eligibility_basis, /ratification's examination did not answer/);
  }
  assert.equal(c.registerReader("batch-examination", "other", () => ({ eligible: true })).reason, "LISTENER_DECLARED");
  /* an examination answering asynchronously is awaited */
  const w = heldWorld();
  w.c.registerReader("batch-examination", "ratification", async () => ({ eligible: false, class: "crucial", reason: "it is crucial" }));
  assert.deepEqual((await w.c.heldCaptures({ viewer: "class:admin" })).held.map((r) => r.class), ["crucial", "crucial", "crucial", "crucial"]);
});

test("R79 R37 (DEC-97 (2); C-118.8, C-118.9): setAside refuses in order a machine or empty author, a missing reason, no ids or more than PER_ITEM_MAX, then any id absent or unseen, not information, not at collected, or already set aside, named; the set is refused whole and nothing is written", () => {
  const { c, rows } = heldWorld();
  const machine = CAPTURE_CHECKS.MACHINE_CANNOT_SET_ASIDE, noReason = CAPTURE_CHECKS.SET_ASIDE_NO_REASON;
  assert.deepEqual([machine.check, noReason.check], ["C-118.8", "C-118.9"]);
  const before = everything(rows);
  const go = (o) => c.setAside({ ids: ["INFO-1"], reason: "duplicate of INFO-2", author: "member:m1", viewer: "member:m1", ...o });
  for (const author of ["", "  ", null, undefined, "class:ai", "token:member", "class:admin", "daemon", "ai", "admin", " Admin "]) {
    const r = go({ author, reason: "" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_SET_ASIDE", "MACHINE_CANNOT_SET_ASIDE", "C-118.8", machine.translation], String(author));
  }
  for (const reason of [undefined, "", " \n", 7, "x".repeat(REASON_MAX + 1)]) {
    const r = go({ reason, ids: [] });
    assert.deepEqual([r.reason, r.check, r.translation], ["SET_ASIDE_NO_REASON", "C-118.9", noReason.translation], JSON.stringify(reason));
  }
  assert.equal(go({ ids: [] }).reason, "NO_IDS");
  assert.equal(go({ ids: "INFO-1" }).reason, "NO_IDS");
  const many = go({ ids: Array.from({ length: PER_ITEM_MAX + 1 }, (_, i) => `INFO-${i}`) });
  assert.deepEqual([many.reason, many.max], ["TOO_MANY_IDS", PER_ITEM_MAX]);
  /* absent and unseen answer alike, before the other conditions */
  const none = go({ ids: ["INFO-1", "INFO-404", "INFO-5"] });
  assert.deepEqual([none.reason, none.ids], ["NO_SUCH_DOCUMENT", ["INFO-404"]]);
  const unseen = c.setAside({ ids: ["INFO-4"], reason: "r", author: "member:m2", viewer: "member:m2" });
  assert.deepEqual({ reason: unseen.reason, ids: unseen.ids }, { reason: none.reason, ids: ["INFO-4"] }, "an unseen document reads as an absent one");
  assert.deepEqual([go({ ids: ["INFO-1", "CASE-1"] }).reason, go({ ids: ["INFO-1", "CASE-1"] }).ids], ["NOT_INFORMATION", ["CASE-1"]]);
  assert.deepEqual([go({ ids: ["INFO-5", "INFO-1"] }).reason, go({ ids: ["INFO-5"] }).ids], ["NOT_COLLECTED", ["INFO-5"]]);
  assert.deepEqual(everything(rows), before, "every refusal refused the set whole: nothing written");
  assert.equal(go({ reason: "x".repeat(REASON_MAX), author: "member:admin" }).ok, true,
               "negative control: a member (the founder signed in as a member) with a reason of 2,000 characters is admitted");
  const again = go({ ids: ["INFO-2", "INFO-1"] });
  assert.deepEqual([again.reason, again.ids], ["ALREADY_SET_ASIDE", ["INFO-1"]], "named");
  assert.equal(rows(`SELECT count(*) n FROM held_acts WHERE bundle_id = 'INFO-2'`)[0].n, 0, "INFO-2 not narrowed in");
});

test("R79 R81 R77 (DEC-97 (2)): a set-aside is recorded with its reason, who and when, leaves the document unchanged at collected and out of the list; restoreHeld appends beside it, the latest act decides, and it may be set aside again; append-only", async () => {
  const { c, rows } = heldWorld();
  const docRow = () => rows(`SELECT * FROM bundles WHERE bundle_id IN ('INFO-1', 'INFO-2') ORDER BY bundle_id`).map((r) => ({ ...r }));
  const docs = docRow();
  const a = c.setAside({ ids: ["INFO-1", "INFO-2", "INFO-1"], reason: "not ours to hold", author: "member:m1", viewer: "member:m1" });
  assert.deepEqual([a.ok, a.act, a.ids, a.reason, a.author], [true, "set_aside", ["INFO-1", "INFO-2"], "not ours to hold", "member:m1"]);
  assert.deepEqual(docRow(), docs, "the documents are unchanged and stay at collected");
  assert.deepEqual(ids(await c.heldCaptures({ viewer: "member:m1" })), ["INFO-4", "INFO-3"], "set aside, they leave the list");
  /* restore: R79's first three refusals, then absent, or not set aside, named */
  assert.equal(c.restoreHeld({ ids: ["INFO-1"], reason: "r", author: "class:ai" }).check, "C-118.8");
  assert.equal(c.restoreHeld({ ids: ["INFO-1"], reason: "", author: "member:m1" }).check, "C-118.9");
  assert.equal(c.restoreHeld({ ids: [], reason: "r", author: "member:m1" }).reason, "NO_IDS");
  const notAside = c.restoreHeld({ ids: ["INFO-1", "INFO-3"], reason: "r", author: "member:m1", viewer: "member:m1" });
  assert.deepEqual([notAside.reason, notAside.ids], ["NOT_SET_ASIDE", ["INFO-3"]]);
  assert.deepEqual(c.restoreHeld({ ids: ["INFO-404"], reason: "r", author: "member:m1" }).ids, ["INFO-404"]);
  const r = c.restoreHeld({ ids: ["INFO-1"], reason: "the source turned out to matter", author: "m2", viewer: "member:m2" });
  assert.equal(r.ok, true);
  assert.deepEqual(ids(await c.heldCaptures({ viewer: "member:m1" })), ["INFO-1", "INFO-4", "INFO-3"], "restored, it returns");
  assert.equal(c.setAside({ ids: ["INFO-1"], reason: "after all", author: "member:m1" }).ok, true, "and may be set aside again");
  const acts = rows(`SELECT bundle_id, seq, act, reason, author FROM held_acts ORDER BY bundle_id, seq`).map((x) => ({ ...x }));
  assert.deepEqual(acts, [
    { bundle_id: "INFO-1", seq: 1, act: "set_aside", reason: "not ours to hold", author: "member:m1" },
    { bundle_id: "INFO-1", seq: 2, act: "restore", reason: "the source turned out to matter", author: "m2" },
    { bundle_id: "INFO-1", seq: 3, act: "set_aside", reason: "after all", author: "member:m1" },
    { bundle_id: "INFO-2", seq: 1, act: "set_aside", reason: "not ours to hold", author: "member:m1" }], "appended, never rewritten or removed");
  assert.ok(rows(`SELECT at FROM held_acts`).every((x) => /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(x.at)), "when");
  /* the routes: the author is the stamp, the ids and reason the body's */
  const w = heldWorld();
  const via = route(w.c, "heldsetaside", "by=member:m1&viewer=member:m1", { ids: ["INFO-1"], reason: "via the route", author: "class:ai" });
  assert.deepEqual([via.ok, via.author], [true, "member:m1"]);
  assert.equal(route(w.c, "heldrestore", "by=class:ai&viewer=class:ai", { ids: ["INFO-1"], reason: "r" }).reason, "MACHINE_CANNOT_SET_ASIDE");
  assert.equal(route(w.c, "heldrestore", "by=member:m1&viewer=member:m1", { ids: ["INFO-1"], reason: "back" }).ok, true);
});

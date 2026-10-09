/* capture: the grade note of a capture completed unattended (R76, DEC-95 (1)) and the held captures (R77–R79, R81,
   DEC-97; K1019) at the module's interface: the store-side services and their routes, over record-core's `bundles`
   (its R37 read contract), provenance's `register` and `captured_locators` (its R48) and membership's sight (its R43),
   as the fixture builds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, receipt, register, sha, H } from "./fixture.mjs";
import { captureOps, ACQUIRE_GRADE_NOTE, READ_LIMIT, REASON_MAX, WITHHELD_QUESTION } from "../../../src/capture/index.mjs";
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
                                 eligible: null, eligibility_basis: "no batch-release examination is registered, so eligibility is undetermined",
                                 captured_for: null,
                                 captured_for_basis: "no reader of the questions a document was captured for is registered, so the questions it was captured for are undetermined" });
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

/* T41-8 (N822; D54, K2408, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project
   sees it only at EXISTENCE (membership R43), never its contents; a discoverable project is seen as before. */
test("R77 R76 (D54): an administrator or the founder not in a hidden project sees none of its held documents and no grade note of its captures; once the project is discoverable, or they join it, they see them", async () => {
  const world = (sight) => {
    const f = heldWorld();
    f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m3', 'c', 'admin', 'active', '2026-01-01', '2026-01-01')`);
    /* the project's capture held, as R76's first test holds one, through provenance's answer */
    f.c.provenance.registerHolds = ({ sha: x }) => ({ ok: true, sha: x, asked: true, registered: x === H("4"), acquired: false });
    if (sight) f.s.sql.exec(`INSERT INTO project_sight (project_id, setting) VALUES ('PROJ-1', ?)`, sight);
    return f;
  };
  const ADMINS = ["member:m3", "admin", "member:admin"];
  for (const sight of [null, "hidden"]) {
    const { c, rows } = world(sight);
    const before = everything(rows);
    for (const viewer of ADMINS) {
      assert.deepEqual(ids(await c.heldCaptures({ viewer, now: NOW })), ["INFO-1", "INFO-2", "INFO-3"], `${sight}: ${viewer}`);
      assert.deepEqual(ids(await c.heldCaptures({ viewer, now: NOW, project: "PROJ-1" })), [], `${sight}: ${viewer}, filtered to the project`);
      assert.equal((await c.gradeNoteOf({ captureSha: H("4"), viewer })).note, null, `${sight}: ${viewer}, the project's capture reads as not held`);
    }
    assert.equal((await c.gradeNoteOf({ captureSha: H("4"), viewer: "member:m1" })).note, ACQUIRE_GRADE_NOTE, "control: the participant has its note");
    assert.deepEqual(everything(rows), before, "nothing written");
  }
  /* the controls: discoverable, every administrator sees the project's document; a participant sees it whatever the setting */
  const open = world("discoverable");
  for (const viewer of ADMINS) {
    assert.deepEqual(ids(await open.c.heldCaptures({ viewer, now: NOW, project: "PROJ-1" })), ["INFO-4"], `discoverable: ${viewer}`);
    assert.equal((await open.c.gradeNoteOf({ captureSha: H("4"), viewer })).note, ACQUIRE_GRADE_NOTE, `discoverable: ${viewer}`);
  }
  const joined = world("hidden");
  for (const m of ["m3", "admin"])
    joined.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', ?, 'active', '2026-01-01', '2026-01-01')`, m);
  for (const viewer of ADMINS) assert.deepEqual(ids(await joined.c.heldCaptures({ viewer, now: NOW, project: "PROJ-1" })), ["INFO-4"], `joined: ${viewer}`);
  assert.deepEqual(ids(await joined.c.heldCaptures({ viewer: "member:m1", now: NOW, project: "PROJ-1" })), ["INFO-4"], "the participant");
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

/* ---- R82: the backlog of one sweep (K1036; monitoring R60's hold) ---- */

/* Documents filed by sweeps: each an Information document at `collected` unless said, with its register document
   (`data/provenance.json`, record-core's `files` read contract) naming each of its documents' `origin`. */
function sweepWorld() {
  const f = heldWorld();
  const s = f.s;
  const S = "SWEEP-2026-0001#s1";
  const doc = (id, origins, { type = "information", state = "collected", content = undefined } = {}) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES (?, ?, 'g', 't', ?, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1)`, id, type, state);
    const text = content !== undefined ? content : JSON.stringify({ documents: origins.map((origin) => ({ file: "snapshots/x", origin })) });
    s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, ?, 'x')`,
               id, text, text == null ? 0 : text.length);
  };
  const sweep = (m) => ({ kind: "sweep", matched_sweep: m, deeming_actor: "bio-monitor" });
  doc("SW-1", [sweep(S)]);
  doc("SW-2", [{ kind: "named_request" }, sweep(S)]);       /* a sweep's document beside another's in one register */
  doc("SW-3", [sweep(S)]);                                    /* set aside below */
  doc("SW-4", [sweep(S)], { state: "verified" });             /* released (ratification R24) */
  doc("SW-5", [sweep("SWEEP-2026-0001#s2")]);                 /* another sweep */
  doc("SW-6", [sweep(S)], { type: "case" });                  /* not information */
  doc("SW-7", [sweep(S)]);                                    /* set aside, then restored: counted */
  doc("SW-8", [sweep(S)], { state: "archived" });
  doc("SW-9", null, { content: "{not json" });                /* a register that is not JSON */
  doc("SW-10", null, { content: JSON.stringify({ documents: ["a string", 7, null, { origin: "sweep" }] }) });
  doc("SW-11", null, { content: null });                      /* blob-backed: no inline text */
  s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-1', 'notes.md', ?, NULL, 1, 'x')`,
             JSON.stringify({ documents: [{ origin: sweep(S) }] }));   /* not the register document */
  assert.equal(f.c.setAside({ ids: ["SW-3", "SW-7"], reason: "dup", author: "member:m1" }).ok, true);
  assert.equal(f.c.restoreHeld({ ids: ["SW-7"], reason: "not a dup", author: "member:m1" }).ok, true);
  return { ...f, S };
}

test("R82 (K1036): heldCount answers how many Information documents at collected, not set aside and not released, have a register origin naming that sweep; a set-aside, a released, another sweep's, a non-information and a document not at collected are not counted", () => {
  const { c, S } = sweepWorld();
  assert.equal(c.heldCount({ sweep: S }), 3, "SW-1, SW-2 and SW-7 (restored)");
  assert.equal(c.heldCount({ sweep: "SWEEP-2026-0001#s2" }), 1, "SW-5 is the other sweep's");
});

test("R82: heldCount counts the whole store, with no viewer: a document in a project no member sees is counted; it reads only the register document, never one held only as a blob", () => {
  const { c, s, S } = sweepWorld();
  s.sql.exec(`UPDATE bundles SET project = 'PROJ-1' WHERE bundle_id = 'SW-1'`);
  assert.equal(c.heldCount({ sweep: S }), 3, "no sight applied");
  assert.equal(c.heldCount({ sweep: S, viewer: "member:m2" }), 3, "a viewer passed is not a viewer read");
  /* each change of standing moves the count: set aside, restored, released */
  assert.equal(c.setAside({ ids: ["SW-1"], reason: "r", author: "member:m1" }).ok, true);
  assert.equal(c.heldCount({ sweep: S }), 2);
  assert.equal(c.restoreHeld({ ids: ["SW-1"], reason: "r", author: "member:m1" }).ok, true);
  assert.equal(c.heldCount({ sweep: S }), 3);
  s.sql.exec(`UPDATE bundles SET current_state = 'verified', prior_state = 'collected' WHERE bundle_id = 'SW-2'`);
  assert.equal(c.heldCount({ sweep: S }), 2, "released, it leaves the count");
});

test("R82 (K1129): an unknown sweep answers 0, as does a sweep that is no string; heldCount writes nothing and never throws: a store that cannot be read answers null, never 0", () => {
  const { c, rows, S } = sweepWorld();
  const before = everything(rows);
  for (const sweep of ["SWEEP-2026-0404#none", "", S.toLowerCase(), `${S} `, null, undefined, 7, { s: S }])
    assert.equal(c.heldCount({ sweep }), 0, JSON.stringify(sweep));
  for (const args of [undefined, null, 7, "x", []]) assert.equal(c.heldCount(args), 0, JSON.stringify(args));
  assert.equal(c.heldCount({ sweep: S }), 3);
  assert.deepEqual(everything(rows), before, "nothing written");
  /* a store that cannot be read: null (not known), never 0 and never a throw, so the hold fails closed */
  const { c: broken, s } = sweepWorld();
  s.db.exec(`DROP TABLE held_acts`);
  assert.equal(broken.heldCount({ sweep: S }), null, "a table gone");
  const { c: thrower, s: s2 } = sweepWorld();
  const exec = s2.sql.exec;
  s2.sql.exec = () => { throw new Error("storage unavailable"); };
  assert.equal(thrower.heldCount({ sweep: S }), null, "a store that throws on read");
  assert.equal(thrower.heldCount({ sweep: "SWEEP-2026-0404#none" }), null, "not known, even for a sweep with nothing held");
  s2.sql.exec = exec;
  assert.equal(thrower.heldCount({ sweep: S }), 3, "negative control: the store readable again answers the count");
  /* negative control: the empty store */
  assert.equal(fresh().c.heldCount({ sweep: S }), 0);
});

/* ---- R77, R79, R81, R83, R84: the question a held document was captured for (DEC-141 beneath K1618; K1645) ---- */

/* A registered stand-in for `capture-requests` R48's reader: Q-OPEN (m1's, open, seen by everyone) and Q-SHUT (m2's,
   concluded) were asked for INFO-1; Q-HID (in a project m2 does not take part in, open) for INFO-1 and INFO-2; nothing
   for INFO-3. Every call is recorded. */
function capturedFor(c, { module = "capture-requests" } = {}) {
  const calls = [];
  const asked = {
    "INFO-1": [{ question: "Q-OPEN", title: "Budget 2024", asker: "member:m1", open: true, hidden: false },
               { question: "Q-SHUT", title: "Old question", asker: "member:m2", open: false, hidden: false },
               { question: "Q-HID", title: "Secret project question", asker: "member:m1", open: true, hidden: true }],
    "INFO-2": [{ question: "Q-HID", title: "Secret project question", asker: "member:m1", open: true, hidden: true }],
  };
  const r = c.registerReader("captured-for", module, (arg) => {
    calls.push(arg);
    const seesHidden = arg.viewer === undefined || arg.viewer === "member:m1" || arg.viewer === "class:admin";
    return { questions: (asked[arg.document] || []).map((q) => {
      const visible = !q.hidden || seesHidden;
      return { question: q.question, title: visible ? q.title : null, asker: visible ? q.asker : null, visible, waiting: q.open };
    }) };
  });
  assert.equal(r.ok, true);
  return calls;
}
const OPEN = { question: "Q-OPEN", title: "Budget 2024", asker: "member:m1" };
const SHUT = { question: "Q-SHUT", title: "Old question", asker: "member:m2" };
const HID = { question: "Q-HID", title: "Secret project question", asker: "member:m1" };
const UNDETERMINED_FOR = "no reader of the questions a document was captured for is registered, so the questions it was captured for are undetermined";

test("R83 (DEC-141): the captured-for reader is a third reader slot, registered once at start whoever registers it; a second or malformed registration is refused as the other slots' are; it is handed the document, the viewer and the document's captures", async () => {
  const { c } = heldWorld();
  assert.equal(c.registerReader("captured-for", "capture-requests", "not a function").reason, "LISTENER_MALFORMED");
  assert.equal(c.registerReader("captured-for", "", () => ({ questions: [] })).reason, "LISTENER_MALFORMED");
  const calls = capturedFor(c);
  const again = c.registerReader("captured-for", "other", () => ({ questions: [] }));
  assert.deepEqual([again.ok, again.reason, again.module], [false, "LISTENER_DECLARED", "capture-requests"]);
  assert.equal(c.registerReader("captured-fur", "x", () => ({})).reason, "UNKNOWN_READER");
  await c.heldCaptures({ viewer: "member:m2", project: null, now: NOW });
  const one = calls.find((x) => x.document === "INFO-1");
  assert.deepEqual(one, { document: "INFO-1", viewer: "member:m2", captures: [H("1")] }, "the bundle id, the viewer and the register's captures");
});

test("R83 R77: a reader that throws, answers a promise, or answers anything but {questions: [...]} with every entry well formed is no answer: captured_for is null and stated undetermined, never a partial list; with no reader registered, likewise", async () => {
  const bad = [() => { throw new Error("down"); }, async () => ({ questions: [] }), () => undefined, () => ({ questions: "x" }),
               () => ({ questions: [{ question: "Q", visible: true, waiting: true }, { question: "", visible: true, waiting: true }] }),
               () => ({ questions: [{ question: "Q", visible: "yes", waiting: true }] }),
               () => ({ questions: [{ question: "Q", visible: true }] }), () => ({ questions: [null] })];
  for (const fn of bad) {
    const { c } = heldWorld();
    c.registerReader("captured-for", "capture-requests", fn);
    const row = (await c.heldCaptures({ viewer: "member:m1", now: NOW })).held.find((x) => x.bundle_id === "INFO-1");
    assert.equal(row.captured_for, null, String(fn));
    assert.equal(row.captured_for_basis, "capture-requests did not answer which questions this document was captured for, so they are undetermined");
  }
  const { c } = heldWorld();
  const rows = (await c.heldCaptures({ viewer: "member:m1", now: NOW })).held;
  assert.ok(rows.length && rows.every((r) => r.captured_for === null && r.captured_for_basis === UNDETERMINED_FOR), "no reader: every row undetermined");
});

test("R77 R83 (DEC-141 (1)): each held row answers captured_for for the viewer: every question it may see with title and asker, and the one withheld sentence, with no id, title, asker or count, when a question it may not see is among them; captured for nothing answers [] and null", async () => {
  const { c, rows } = heldWorld();
  capturedFor(c);
  const before = everything(rows);
  const by = async (viewer) => Object.fromEntries((await c.heldCaptures({ viewer, now: NOW })).held.map((r) => [r.bundle_id, r.captured_for]));
  const m1 = await by("member:m1");
  assert.deepEqual(m1["INFO-1"], { questions: [OPEN, SHUT, HID], withheld: null }, "m1 sees all three, a concluded question included");
  assert.deepEqual(m1["INFO-2"], { questions: [HID], withheld: null });
  assert.deepEqual(m1["INFO-3"], { questions: [], withheld: null }, "captured for no question");
  const m2 = await by("member:m2");
  assert.deepEqual(m2["INFO-1"], { questions: [OPEN, SHUT], withheld: WITHHELD_QUESTION }, "the hidden question withheld whole");
  assert.deepEqual(m2["INFO-2"], { questions: [], withheld: "Captured for a question you may not see" }, "only a hidden question: the sentence alone");
  assert.ok(!JSON.stringify(m2).includes("Q-HID") && !JSON.stringify(m2).includes("Secret"), "no id or title of a hidden question");
  assert.deepEqual(everything(rows), before, "writes nothing");
  /* the reader's own leak is not carried: a not-visible entry's title and asker are never shown */
  const w = heldWorld();
  w.c.registerReader("captured-for", "capture-requests", () => ({ questions: [
    { question: "Q-X", title: "leaked title", asker: "member:m9", visible: false, waiting: true },
    { question: "Q-X", title: "leaked title", asker: "member:m8", visible: false, waiting: true }] }));
  const leak = (await w.c.heldCaptures({ viewer: "member:m2", now: NOW })).held[0].captured_for;
  assert.deepEqual(leak, { questions: [], withheld: WITHHELD_QUESTION }, "two hidden askers: one sentence, no count");
  /* the route reads the stamped viewer */
  const viaRoute = (await route(c, "heldcaptures", "viewer=member:m2")).held.find((r) => r.bundle_id === "INFO-1");
  assert.equal(viaRoute.captured_for.withheld, WITHHELD_QUESTION);
});

test("R79 R83 R84 (DEC-141 (1), (2)): a set-aside reads each document's questions once, before writing, and records every question waiting on it, seen by the viewer or not, with that set-aside; the one reason applies to each in a batch; the answer names captured_for and the waiting questions as the viewer is shown them", () => {
  const { c, rows } = heldWorld();
  const calls = capturedFor(c);
  const a = c.setAside({ ids: ["INFO-1", "INFO-2", "INFO-3"], reason: "wrong year", author: "member:m2", viewer: "member:m2" });
  assert.equal(a.ok, true);
  assert.deepEqual(calls.map((x) => x.document), ["INFO-1", "INFO-2", "INFO-3"], "once per document per act");
  assert.deepEqual(a.documents, [
    { document: "INFO-1", captured_for: { questions: [OPEN, SHUT], withheld: WITHHELD_QUESTION }, waiting: { questions: [OPEN], withheld: WITHHELD_QUESTION } },
    { document: "INFO-2", captured_for: { questions: [], withheld: WITHHELD_QUESTION }, waiting: { questions: [], withheld: WITHHELD_QUESTION } },
    { document: "INFO-3", captured_for: { questions: [], withheld: null }, waiting: { questions: [], withheld: null } }]);
  const recorded = rows(`SELECT bundle_id, seq, question FROM held_act_questions ORDER BY bundle_id, question`).map((x) => ({ ...x }));
  assert.deepEqual(recorded, [{ bundle_id: "INFO-1", seq: 1, question: "Q-HID" }, { bundle_id: "INFO-1", seq: 1, question: "Q-OPEN" },
                              { bundle_id: "INFO-2", seq: 1, question: "Q-HID" }],
                   "the waiting questions, the one hidden from the actor included; not the concluded Q-SHUT; nothing for INFO-3");
  /* the reason is required whether or not a question waits (C-118.9), and a refused set reads nothing and records nothing */
  const w = heldWorld();
  const wcalls = capturedFor(w.c);
  const before = everything(w.rows);
  assert.equal(w.c.setAside({ ids: ["INFO-1"], reason: " ", author: "member:m1", viewer: "member:m1" }).check, "C-118.9");
  assert.equal(w.c.setAside({ ids: ["INFO-1", "INFO-5"], reason: "r", author: "member:m1", viewer: "member:m1" }).reason, "NOT_COLLECTED");
  assert.deepEqual(wcalls, [], "a refused act asks the reader nothing");
  assert.deepEqual(everything(w.rows), before, "nothing written");
});

test("R79 R83: with no reader registered, or one that does not answer, the set-aside is still made, no question is recorded with it, and the answer says per document that the waiting questions are undetermined", () => {
  for (const fn of [null, () => { throw new Error("down"); }, () => new Promise(() => {}), () => ({ nope: true })]) {
    const { c, rows } = heldWorld();
    if (fn) c.registerReader("captured-for", "capture-requests", fn);
    const a = c.setAside({ ids: ["INFO-1"], reason: "duplicate", author: "member:m1", viewer: "member:m1" });
    assert.equal(a.ok, true, "never blocked on another module");
    const d = a.documents[0];
    assert.deepEqual([d.document, d.captured_for, d.waiting], ["INFO-1", null, null]);
    assert.match(d.waiting_basis, /undetermined/);
    assert.match(d.captured_for_basis, /undetermined/);
    assert.equal(rows(`SELECT count(*) n FROM held_act_questions`)[0].n, 0, "no question recorded");
    assert.equal(rows(`SELECT count(*) n FROM held_acts`)[0].n, 1, "the set-aside itself is recorded");
  }
});

test("R81 R84 (DEC-141 (4); K1618): a restore is recorded with every question its undone set-aside was recorded with, after it in the same history, with its own reason, who and when; any member who may see the document restores it, the asker or another", () => {
  const { c, rows } = heldWorld();
  capturedFor(c);
  assert.equal(c.setAside({ ids: ["INFO-1"], reason: "wrong year", author: "member:m2", viewer: "member:m2" }).ok, true);
  /* the reader is not consulted again on restore: the questions carried are those of the set-aside undone */
  const r = c.restoreHeld({ ids: ["INFO-1"], reason: "it is the right year", author: "member:m1", viewer: "member:m1" });
  assert.equal(r.ok, true);
  assert.deepEqual(rows(`SELECT seq, question FROM held_act_questions WHERE bundle_id = 'INFO-1' ORDER BY seq, question`).map((x) => ({ ...x })),
                   [{ seq: 1, question: "Q-HID" }, { seq: 1, question: "Q-OPEN" }, { seq: 2, question: "Q-HID" }, { seq: 2, question: "Q-OPEN" }]);
  /* a set-aside made with no question recorded is restored with none */
  const w = heldWorld();
  assert.equal(w.c.setAside({ ids: ["INFO-1"], reason: "dup", author: "member:m1" }).ok, true);
  capturedFor(w.c);
  assert.equal(w.c.restoreHeld({ ids: ["INFO-1"], reason: "no", author: "member:m2", viewer: "member:m2" }).ok, true, "another member, not the actor");
  assert.equal(w.rows(`SELECT count(*) n FROM held_act_questions`)[0].n, 0);
  /* set aside again while the question waits: recorded again */
  assert.equal(c.setAside({ ids: ["INFO-1"], reason: "after all", author: "member:m2", viewer: "member:m2" }).ok, true);
  assert.equal(rows(`SELECT count(*) n FROM held_act_questions WHERE bundle_id = 'INFO-1' AND seq = 3`)[0].n, 2);
});

test("R84 (DEC-141 (3), (4)): heldActsOf answers every set-aside and restore recorded with a question, oldest first, each with its reason, who and when, and per document whether its latest act is a set-aside; writes nothing, makes no queue item", () => {
  const { c, rows } = heldWorld();
  capturedFor(c);
  c.setAside({ ids: ["INFO-1", "INFO-2"], reason: "wrong year", author: "member:m2", viewer: "member:m2" });
  rows(`UPDATE held_acts SET at = '2026-03-01T00:00:00Z'`);
  c.restoreHeld({ ids: ["INFO-1"], reason: "right year", author: "member:m1", viewer: "member:m1" });
  rows(`UPDATE held_acts SET at = '2026-03-02T00:00:00Z' WHERE seq = 2`);
  const before = everything(rows);
  const h = c.heldActsOf({ question: "Q-HID", viewer: "member:m1" });
  assert.deepEqual(h.acts, [
    { document: "INFO-1", act: "set_aside", reason: "wrong year", author: "member:m2", at: "2026-03-01T00:00:00Z" },
    { document: "INFO-2", act: "set_aside", reason: "wrong year", author: "member:m2", at: "2026-03-01T00:00:00Z" },
    { document: "INFO-1", act: "restore", reason: "right year", author: "member:m1", at: "2026-03-02T00:00:00Z" }]);
  assert.deepEqual(h.documents, [{ document: "INFO-1", set_aside: false }, { document: "INFO-2", set_aside: true }]);
  assert.deepEqual([h.ok, h.question, h.limit, h.truncated, h.next], [true, "Q-HID", READ_LIMIT.default, false, null]);
  assert.deepEqual(c.heldActsOf({ question: "Q-OPEN", viewer: "member:m1" }).acts.map((a) => [a.document, a.act]),
                   [["INFO-1", "set_aside"], ["INFO-1", "restore"]]);
  assert.deepEqual(c.heldActsOf({ question: "Q-SHUT", viewer: "member:m1" }).acts, [], "a concluded question waited on nothing");
  assert.deepEqual(c.heldActsOf({ question: "Q-NONE" }).acts, [], "nothing recorded: an empty history");
  for (const question of [null, undefined, "", 7]) assert.deepEqual(c.heldActsOf({ question }).acts, [], String(question));
  assert.deepEqual(everything(rows), before, "writes nothing");
});

test("R84: an act on a document the viewer may not see is left out, unannounced and uncounted; no viewer through a stamped call sees nothing; paged by `after` over every act once, at most `limit`; never throws", () => {
  const { c, s, rows } = heldWorld();
  capturedFor(c);
  /* INFO-4 sits in PROJ-1, which m2 does not take part in */
  rows(`INSERT INTO held_acts (bundle_id, seq, act, reason, author, at) VALUES ('INFO-4', 1, 'set_aside', 'in the project', 'member:m1', '2026-02-01T00:00:00Z')`);
  rows(`INSERT INTO held_act_questions (bundle_id, seq, question) VALUES ('INFO-4', 1, 'Q-OPEN')`);
  c.setAside({ ids: ["INFO-1", "INFO-2"], reason: "r", author: "member:m1", viewer: "member:m1" });
  c.restoreHeld({ ids: ["INFO-1"], reason: "back", author: "member:m1", viewer: "member:m1" });
  const m1 = c.heldActsOf({ question: "Q-OPEN", viewer: "member:m1" });
  assert.deepEqual(m1.acts.map((a) => a.document), ["INFO-4", "INFO-1", "INFO-1"]);
  const m2 = c.heldActsOf({ question: "Q-OPEN", viewer: "member:m2" });
  assert.deepEqual(m2.acts.map((a) => a.document), ["INFO-1", "INFO-1"], "INFO-4 left out");
  assert.ok(!JSON.stringify(m2).includes("INFO-4") && !JSON.stringify(m2).includes("in the project"), "unannounced");
  assert.deepEqual(c.heldActsOf({ question: "Q-OPEN", viewer: "" }).acts, [], "an absent viewer sees nothing");
  assert.deepEqual(c.heldActsOf({ question: "Q-OPEN", viewer: "junk" }).acts, []);
  assert.equal(c.heldActsOf({ question: "Q-OPEN" }).acts.length, 3, "an in-process caller passing no viewer reads whole");
  /* paging */
  const whole = c.heldActsOf({ question: "Q-OPEN", viewer: "member:m1" }).acts;
  const seen = [];
  let after = null;
  for (let n = 0; n < 10; n++) {
    const p = c.heldActsOf({ question: "Q-OPEN", viewer: "member:m1", limit: 1, after });
    assert.ok(p.acts.length <= 1);
    seen.push(...p.acts);
    if (!p.truncated) break;
    after = p.next;
  }
  assert.deepEqual(seen, whole);
  assert.equal(c.heldActsOf({ question: "Q-OPEN", after: "x" }).reason, "BAD_CURSOR");
  assert.equal(c.heldActsOf({ question: "Q-OPEN", limit: 5000 }).limit, READ_LIMIT.max);
  /* a store that cannot be read: no list, never a throw */
  s.db.exec(`DROP TABLE held_act_questions`);
  const broken = c.heldActsOf({ question: "Q-OPEN" });
  assert.deepEqual([broken.ok, broken.acts], [false, null]);
});

/* promotion's `promote` — requirement-named tests (build/requirements/promotion.md R1–R20). Each test drives the
 * module's exported service over the record-core and membership doubles in ./fixtures.mjs and checks the answer
 * and the record against the requirement its title names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, doc, infoDoc, create, revise, sha, EMPTY, T0, T1 } from "./fixtures.mjs";
import { INLINE_MAX } from "../../../src/promotion/index.mjs";
import { STATES, vocabFor, projectNameKey } from "../../../checks/bio-checks.mjs";

const ID = "INFO-2026-0001";

function held(extraOver = {}) {
  const env = makePromotion(extraOver);
  const r = env.p.promote(create(ID, infoDoc(ID)));
  assert.equal(r.ok, true, JSON.stringify(r));
  return { ...env, head: r };
}

test("R1: base is the compare-and-swap (EXISTS, ABSENT, CAS_STALE naming expected and got; a stale base is never taken)", () => {
  const { p, record, head } = held();
  assert.equal(p.promote(create(ID, infoDoc(ID), { snapKey: "k9" })).reason, "EXISTS");
  assert.equal(p.promote(revise("INFO-2026-0404", "f".repeat(64), infoDoc("INFO-2026-0404"))).reason, "ABSENT");
  const before = record.dump();
  const stale = p.promote(revise(ID, "a".repeat(64), infoDoc(ID, { title: "Changed" })));
  assert.equal(stale.reason, "CAS_STALE");
  assert.equal(stale.expected, head.bundleSha);
  assert.equal(stale.got, "a".repeat(64));
  assert.equal(record.dump(), before);
  const ok = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { title: "Changed" })));
  assert.equal(ok.ok, true);
  assert.equal(record.head(ID).title, "Changed");
});

test("R2: a refused promotion leaves the record exactly as it was; an accepted one commits every row in one transaction", () => {
  const { p, record, head } = held();
  /* A later module's check refuses AFTER promotion's own fences passed: nothing written, no id spent. */
  let calls = 0;
  p.registerStep("later", { check: (c) => (c.pkg.refuseMe ? { ok: false, reason: "LATER_SAYS_NO" } : null),
                            project: () => { calls++; record.db.prepare("INSERT INTO side VALUES (?,?)").run(`k${calls}`, "v"); return null; } });
  const before = record.dump();
  const r = p.promote({ ...revise(ID, head.bundleSha, infoDoc(ID, { title: "T2" })), refuseMe: true });
  assert.equal(r.reason, "LATER_SAYS_NO");
  assert.equal(record.dump(), before);
  /* A project creation refused inside the transaction spends no minted id. */
  const pc = p.promote({ base: null, snapKey: "p1", author: "member:ann", ownerMemberId: "ann", refuseMe: true,
    files: [{ path: "bundle.md", text: doc({ object_type: "project", title: "Sewer Fund", current_state: "forming",
      created: T0, last_updated: T0 }) }], meta: {} });
  assert.equal(pc.reason, "LATER_SAYS_NO");
  assert.equal(record.dump(), before);
  /* A projection that throws rolls back the commit too. */
  const env = makePromotion();
  env.p.registerStep("later", { project: () => { throw new Error("boom"); } });
  const b2 = env.record.dump();
  const t = env.p.promote(create(ID, infoDoc(ID)));
  assert.equal(t.ok, false);
  assert.equal(env.record.dump(), b2);
  /* Accepted: bundle row, live file, manifest entry and the later module's row, together. */
  const ok = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { title: "T3" })));
  assert.equal(ok.ok, true);
  assert.equal(record.one("SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?", ID).n, 2);
  assert.equal(record.one("SELECT COUNT(*) AS n FROM side").n, 1);
});

test("R3: one manifest entry per accepted promotion; a creation's base is the empty-string SHA and snapshots nothing; history is never rewritten", () => {
  const { p, record, head } = held();
  const m1 = record.manifestEntry(ID, "k1");
  assert.equal(m1.base, EMPTY);
  assert.equal(m1.kind, "promotion");
  assert.equal(m1.author, "member:ann");
  assert.deepEqual(m1.files, [{ name: "bundle.md", sha256: head.bundleSha }]);
  assert.equal(record.one("SELECT COUNT(*) AS n FROM history").n, 0);
  const text2 = infoDoc(ID, { title: "Second", last_updated: T1 });
  const r = p.promote({ ...revise(ID, head.bundleSha, text2), writer: "mechanical", operation: "sweep", replay: true });
  assert.equal(r.ok, true);
  const m2 = record.manifestEntry(ID, "k2");
  assert.equal(m2.kind, "promotion-replay");
  assert.equal(m2.base, head.bundleSha);
  assert.equal(m2.writer, "mechanical");
  assert.equal(m2.operation, "sweep");
  assert.equal(m2.created, T1);
  const hist = record.rows("SELECT * FROM history WHERE bundle_id=? AND snap_key='k2'", ID);
  assert.equal(hist.length, 1);
  assert.equal(hist[0].sha256, head.bundleSha);
  assert.deepEqual(record.manifestEntry(ID, "k1"), m1);
  assert.equal(record.readFile(ID, "bundle.md").text, text2);
});

test("R4: a re-send under a held snap key is answered idempotent and writes nothing; anything else there is SNAP_KEY_TAKEN", () => {
  const { p, record, head } = held();
  const before = record.dump();
  const again = p.promote(create(ID, infoDoc(ID)));
  assert.deepEqual([again.ok, again.idempotent, again.wrote, again.bundleSha], [true, true, false, head.bundleSha]);
  assert.equal(record.dump(), before);
  const other = p.promote(create(ID, infoDoc(ID), { author: "member:bob" }));
  assert.equal(other.reason, "EXISTS");
  const r2 = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { title: "Two" }), { snapKey: "k1" }));
  assert.equal(r2.reason, "SNAP_KEY_TAKEN");
  assert.equal(r2.check, "C-67.1");
  assert.equal(typeof r2.translation, "string");
  assert.equal(record.dump(), before);
});

test("R5: every stored digest and size is of the stored bytes; a supplied digest that differs is FILE_DIGEST_MISMATCH", () => {
  const { p, record } = makePromotion();
  const text = infoDoc(ID, { title: "Café — ünïcode" });
  const bad = p.promote(create(ID, text, { files: [{ path: "bundle.md", text, sha256: "f".repeat(64) }] }));
  assert.equal(bad.reason, "FILE_DIGEST_MISMATCH");
  assert.deepEqual(bad.paths, ["bundle.md"]);
  assert.equal(bad.check, "C-33.38");
  const blob = { path: "data/cap.pdf", blobSha: "A".repeat(64), sha256: "b".repeat(64), bytes: 9 };
  assert.equal(p.promote(create(ID, text, { files: [{ path: "bundle.md", text }, blob] })).reason, "FILE_DIGEST_MISMATCH");
  const ok = p.promote(create(ID, text, { files: [{ path: "bundle.md", text, sha256: sha(text).toUpperCase(), bytes: 3 },
                                                   { ...blob, sha256: undefined }] }));
  assert.equal(ok.ok, true, JSON.stringify(ok));
  const md = record.one("SELECT * FROM files WHERE path='bundle.md'");
  assert.equal(md.sha256, sha(text));
  assert.equal(md.bytes, Buffer.byteLength(text, "utf8"));
  assert.equal(record.one("SELECT sha256 FROM files WHERE path='data/cap.pdf'").sha256, "a".repeat(64));
});

test("R6: an inline file over the 1 MiB bound is OVERSIZE_INLINE, naming the path and its length", () => {
  const { p } = makePromotion();
  const big = "é".repeat(INLINE_MAX / 2 + 1);
  const r = p.promote(create(ID, infoDoc(ID), { files: [{ path: "bundle.md", text: infoDoc(ID) }, { path: "notes.txt", text: big }] }));
  assert.deepEqual([r.reason, r.path, r.bytes], ["OVERSIZE_INLINE", "notes.txt", Buffer.byteLength(big, "utf8")]);
  assert.equal(p.promote(create(ID, infoDoc(ID), { files: [{ path: "bundle.md", text: infoDoc(ID) },
    { path: "notes.txt", text: "x".repeat(INLINE_MAX) }] })).ok, true);
});

test("R7: MALFORMED, NO_BUNDLE_MD, REFS_IN_PAYLOAD, BASIS_IN_PAYLOAD and FILES_DROPPED", () => {
  const { p, record, head } = held();
  assert.equal(p.promote({ base: null, snapKey: "x", files: [], meta: {} }).reason, "MALFORMED");
  assert.equal(p.promote({ bundleId: ID, base: null, snapKey: "x", meta: {} }).reason, "MALFORMED");
  assert.equal(p.promote({ bundleId: ID, base: null, snapKey: "x", files: [] }).reason, "MALFORMED");
  assert.equal(p.promote({ ...create("INFO-2026-0002", infoDoc("INFO-2026-0002")), refs: [{ target: ID }] }).reason, "REFS_IN_PAYLOAD");
  assert.equal(p.promote({ ...create("INFO-2026-0002", infoDoc("INFO-2026-0002")), basis: [{ target: ID }] }).reason, "BASIS_IN_PAYLOAD");
  assert.equal(p.promote(create("INFO-2026-0002", "x", { files: [{ path: "notes.txt", text: "x" }] })).reason, "NO_BUNDLE_MD");
  const withNote = p.promote(revise(ID, head.bundleSha, infoDoc(ID), { files: [{ path: "bundle.md", text: infoDoc(ID) }, { path: "n.txt", text: "n" }] }));
  assert.equal(withNote.ok, true);
  const dropped = p.promote(revise(ID, withNote.bundleSha, infoDoc(ID, { title: "Z" }), { snapKey: "k3" }));
  assert.deepEqual([dropped.reason, dropped.paths], ["FILES_DROPPED", ["n.txt"]]);
  assert.equal(p.promote(revise(ID, withNote.bundleSha, infoDoc(ID, { title: "Z" }), { snapKey: "k3", drop: ["n.txt"] })).ok, true);
  assert.deepEqual(record.livePaths(ID), ["bundle.md"]);
});

test("R8: a mechanical promotion names a declared operation, and the manifest records writer and operation", () => {
  const { p, record } = makePromotion();
  const r = p.promote({ ...create(ID, infoDoc(ID)), writer: "mechanical", operation: "invent" });
  assert.equal(r.reason, "UNDECLARED_OPERATION");
  assert.equal(r.got, "invent");
  assert.equal(p.promote({ ...create(ID, infoDoc(ID)), writer: "mechanical" }).reason, "UNDECLARED_OPERATION");
  assert.equal(p.promote({ ...create(ID, infoDoc(ID)), writer: "mechanical", operation: "monitor-tick" }).ok, true);
  const m = record.manifestEntry(ID, "k1");
  assert.deepEqual([m.writer, m.operation], ["mechanical", "monitor-tick"]);
});

test("R9: the document is the record's word on itself; a contradicting envelope is refused by name; replay is exempt from the refusal only", () => {
  const { p, record } = makePromotion();
  const t = (meta) => p.promote(create(ID, infoDoc(ID), { meta }));
  assert.equal(t({ object_type: "action" }).reason, "ENVELOPE_TYPE_DISAGREES");
  assert.equal(t({ object_type: "action" }).check, "C-86.1");
  assert.equal(t({ title: "Another" }).reason, "ENVELOPE_TITLE_DISAGREES");
  assert.equal(t({ current_state: "verified" }).reason, "ENVELOPE_STATE_DISAGREES");
  assert.equal(t({ prior_state: "collected" }).reason, "ENVELOPE_STATE_DISAGREES");
  assert.equal(t({ title: "  A   report " }).ok, true);
  const env2 = makePromotion();
  const rp = env2.p.promote({ ...create(ID, infoDoc(ID)), meta: { object_type: "action", title: "Other" }, replay: true });
  assert.equal(rp.ok, true);
  const h = env2.record.head(ID);
  assert.deepEqual([h.type, h.title, h.currentState], ["information", "A report", "collected"]);
  /* The envelope is used where the document states nothing. */
  const env3 = makePromotion();
  const bare = doc({ id: ID, created: T0, last_updated: T0 });
  assert.equal(env3.p.promote(create(ID, bare, { meta: { object_type: "information", title: "From meta", current_state: "collected" } })).ok, true);
  assert.deepEqual([env3.record.head(ID).type, env3.record.head(ID).title], ["information", "From meta"]);
  void record;
});

test("R10: a non-replay revision stating another type is REVISION_RETYPES_BUNDLE, naming both", () => {
  const { p, head } = held();
  const r = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { object_type: "bias" })));
  assert.deepEqual([r.reason, r.head_type, r.revision_type, r.check], ["REVISION_RETYPES_BUNDLE", "information", "bias", "C-86.2"]);
});

test("R11: missing fields are refused by name or carried forward and said so; the request's own names are required", () => {
  const { p, record, head } = held();
  const bare = doc({ id: ID });
  const c = p.promote(create("INFO-2026-0009", doc({ id: "INFO-2026-0009", created: T0, last_updated: T0, current_state: "collected" })));
  assert.deepEqual([c.reason, c.check], ["PROMOTED_TYPE_UNSTATED", "C-86.5"]);
  const f = p.promote(create("INFO-2026-0009", doc({ id: "INFO-2026-0009", object_type: "information" })));
  assert.deepEqual([f.reason, f.fields], ["PROMOTED_FIELD_UNSTATED", ["current_state", "created", "last_updated"]]);
  const rev = p.promote(revise(ID, head.bundleSha, bare));
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.equal(rev.type_carried.object_type, "information");
  assert.deepEqual(rev.fields_carried.fields, { current_state: "collected", created: T0, last_updated: T0 });
  assert.deepEqual([record.head(ID).type, record.head(ID).currentState], ["information", "collected"]);
  const base = { bundleId: "INFO-2026-0010", base: null, author: "a", meta: {} };
  const md = { path: "bundle.md", text: infoDoc("INFO-2026-0010") };
  assert.equal(p.promote({ ...base, files: [md] }).reason, "PROMOTE_SNAP_KEY_UNSTATED");
  assert.equal(p.promote({ ...base, snapKey: "  ", files: [md] }).reason, "PROMOTE_SNAP_KEY_UNSTATED");
  assert.deepEqual(p.promote({ ...base, snapKey: "s", files: [md, null, { text: "x" }] }).entries, [1, 2]);
  assert.equal(p.promote({ ...base, snapKey: "s", files: [md, { path: "a.txt" }] }).reason, "PROMOTED_FILE_CONTENT_UNSTATED");
  assert.equal(p.promote({ ...base, snapKey: "s", files: [md, { path: "a.bin", blobSha: "a".repeat(64) }] }).reason, "PROMOTED_FILE_BYTES_UNSTATED");
  assert.equal(p.promote({ ...base, snapKey: "s", files: [md, { path: "a.bin", blobSha: "a".repeat(64), bytes: -1 }] }).reason, "PROMOTED_FILE_BYTES_UNSTATED");
});

test("R12: created and last_updated come from the document; a disagreeing envelope and a redated revision are refused by name", () => {
  const { p, record, head } = held();
  const d = p.promote(create("INFO-2026-0003", infoDoc("INFO-2026-0003"), { meta: { created: T1 } }));
  assert.deepEqual([d.reason, d.field, d.check], ["ENVELOPE_DATES_DISAGREE", "created", "C-86.7"]);
  assert.equal(p.promote(create("INFO-2026-0003", infoDoc("INFO-2026-0003"), { meta: { last_updated: "2026-07-01T00:00:00.000Z" } })).ok, true);
  const r = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { created: "2020-01-01T00:00:00Z" })));
  assert.deepEqual([r.reason, r.check], ["REVISION_REDATES_CREATION", "C-86.9"]);
  const ok = p.promote(revise(ID, head.bundleSha, infoDoc(ID, { last_updated: T1 })));
  assert.equal(ok.ok, true);
  assert.deepEqual([record.head(ID).created, record.head(ID).lastUpdated], [T0, T1]);
  assert.equal(record.manifestEntry(ID, "k2").created, T1);
});

test("R13: a creation takes the recorded producing group; with none, the document's or envelope's; a revision may not regroup", () => {
  const env = makePromotion({ group: "harbor-group" });
  const r = env.p.promote(create(ID, infoDoc(ID, { group: "someone-else" })));
  assert.equal(r.ok, true);
  assert.equal(env.record.head(ID).groupId, "harbor-group");
  assert.match(env.record.readFile(ID, "bundle.md").text, /^group: harbor-group$/m);
  const rg = env.p.promote(revise(ID, r.bundleSha, env.record.readFile(ID, "bundle.md").text.replace("group: harbor-group", "group: other")));
  assert.deepEqual([rg.reason, rg.check], ["REVISION_REGROUPS_BUNDLE", "C-86.14"]);
  const none = makePromotion({ group: null });
  const g = none.p.promote(create(ID, infoDoc(ID, { group: undefined })));
  assert.deepEqual([g.reason, g.check], ["GROUP_UNDETERMINED", "C-64.1"]);
  assert.equal(none.p.promote(create(ID, infoDoc(ID, { group: undefined }), { meta: { group: "meta-group" } })).ok, true);
  assert.equal(none.record.head(ID).groupId, "meta-group");
  const replay = makePromotion({ group: "harbor-group" });
  assert.equal(replay.p.promote({ ...create(ID, infoDoc(ID, { group: "past-group" })), replay: true }).ok, true);
  assert.equal(replay.record.head(ID).groupId, "past-group");
});

test("R14: a non-replay promotion whose document's id differs from its bundle is refused by name (C-1.1)", () => {
  const { p, head } = held();
  const c = p.promote(create("INFO-2026-0005", infoDoc("INFO-2026-0006")));
  assert.deepEqual([c.reason, c.check], ["BUNDLE_ID_DISAGREES", "C-1.1"]);
  assert.equal(p.promote(revise(ID, head.bundleSha, infoDoc("INFO-2026-0007"))).reason, "BUNDLE_ID_DISAGREES");
  assert.equal(p.promote({ ...create("INFO-2026-0005", infoDoc("INFO-2026-0006")), replay: true }).ok, true);
});

test("R15: a state move along an undeclared edge is refused (BIAS_ILLEGAL_TRANSITION for bias, else STATE_MOVE_UNDECLARED); every declared edge passes; replay is not exempt", () => {
  for (const type of ["information", "inquiry", "project", "bias", "action"]) {
    const edges = vocabFor(STATES, type).edges;
    const states = Object.keys(edges);
    for (const from of states) for (const to of states) {
      if (from === to) continue;
      const env = makePromotion();
      const prefix = { information: "INFO", inquiry: "INQ", project: "PROJ", bias: "BIAS", action: "ACTN" }[type];
      const proj = type === "project";
      const d = (s, id) => doc({ id, object_type: type, title: "Same name", current_state: s, created: T0, last_updated: T0, group: "test-group" });
      const a = proj ? env.p.promote({ ...create(undefined, d(from)), replay: true, ownerMemberId: "ann" })
                     : env.p.promote({ ...create(`${prefix}-2026-0001`, d(from, `${prefix}-2026-0001`)), replay: true });
      assert.equal(a.ok, true, JSON.stringify(a));
      const id = a.bundleId;
      const d2 = (s) => env.record.readFile(id, "bundle.md").text.replace(`current_state: ${from}`, `current_state: ${s}`);
      const r = env.p.promote({ ...revise(id, a.bundleSha, d2(to)), replay: true, actorMemberId: "ann" });
      const legal = edges[from].includes(to);
      if (legal) assert.equal(r.ok, true, `${type} ${from} -> ${to}: ${JSON.stringify(r)}`);
      else {
        assert.equal(r.reason, type === "bias" ? "BIAS_ILLEGAL_TRANSITION" : "STATE_MOVE_UNDECLARED", `${type} ${from} -> ${to}`);
        assert.deepEqual(r.legal_from, edges[from]);
      }
    }
  }
  const { p, head } = held();
  assert.equal(p.promote(revise(ID, head.bundleSha, infoDoc(ID, { title: "amended" }))).ok, true);
});

test("R16: a move into retired while a live edge cites the item is CITED, naming every citing id; an edit of a retired item is not asked", () => {
  const env = makePromotion({ citedBy: { [ID]: ["INQ-2026-0001", "INQ-2026-0002"] } });
  const a = env.p.promote(create(ID, infoDoc(ID, { current_state: "verified" })));
  const r = env.p.promote(revise(ID, a.bundleSha, infoDoc(ID, { current_state: "retired" })));
  assert.equal(r.reason, "CITED");
  assert.deepEqual(r.offenders, [{ id: ID, citedBy: ["INQ-2026-0001", "INQ-2026-0002"] }]);
  const free = makePromotion();
  const b = free.p.promote(create(ID, infoDoc(ID, { current_state: "verified" })));
  const c = free.p.promote(revise(ID, b.bundleSha, infoDoc(ID, { current_state: "retired" })));
  assert.equal(c.ok, true);
  const cited = makePromotion({ citedBy: { [ID]: ["INQ-2026-0001"] } });
  const d = cited.p.promote({ ...create(ID, infoDoc(ID, { current_state: "retired" })), replay: true });
  assert.equal(d.reason, "CITED");
});

test("R17: readability is judged first: no bundle.md, a blob-held one or no front matter gets the same refusal whatever the type", () => {
  for (const type of ["information", "project", "bias"]) {
    const { p, head } = held();
    void type;
    assert.equal(p.promote(revise(ID, head.bundleSha, "", { files: [] })).reason, "NO_BUNDLE_MD");
    assert.equal(p.promote(revise(ID, head.bundleSha, "", { files: [{ path: "n.txt", text: "x" }] })).reason, "NO_BUNDLE_MD");
    const blob = p.promote(revise(ID, head.bundleSha, "", { files: [{ path: "bundle.md", blobSha: "a".repeat(64), bytes: 3 }],
      meta: { object_type: type } }));
    assert.deepEqual([blob.reason, blob.why], ["BUNDLE_MD_UNREADABLE", "blob"]);
    const nofm = p.promote(revise(ID, head.bundleSha, "no front matter here", { meta: { object_type: type } }));
    assert.deepEqual([nofm.reason, nofm.why], ["BUNDLE_MD_UNREADABLE", "front_matter"]);
    /* Readability comes before the compare-and-swap reads the head. */
    assert.equal(p.promote(revise(ID, "0".repeat(64), "no front matter")).reason, "BUNDLE_MD_UNREADABLE");
  }
});

test("R19: projects — the plane mints the id, titles are unique ignoring case and spacing, owners alone (de)activate, joined actors revise", () => {
  const { p, record, membership } = makePromotion();
  const pd = (title, state = "forming", extra = {}) => doc({ object_type: "project", title, current_state: state,
    created: T0, last_updated: T0, ...extra });
  const mk = (title, extra = {}) => ({ base: null, snapKey: "p1", author: "member:ann", ownerMemberId: "ann",
    files: [{ path: "bundle.md", text: pd(title) }], meta: {}, ...extra });
  assert.equal(p.promote({ ...mk("Sewer Fund"), bundleId: "PROJ-2026-0001-x" }).reason, "PROJECT_ID_SUPPLIED");
  assert.equal(p.promote({ ...mk("x"), bundleId: "PROJ-2026-0001-x", meta: { object_type: "information" } }).reason, "PROJECT_ID_SUPPLIED");
  assert.equal(p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: "no fm" }], meta: { object_type: "project" } }).reason, "PROJECT_DOCUMENT_UNREADABLE");
  assert.equal(p.promote({ ...mk("x"), files: [{ path: "bundle.md", text: pd("x", "forming", { id: "PROJ-1" }) }] }).reason, "PROJECT_ID_IN_BYTES");
  const r = p.promote(mk("Sewer Fund", { visibility: "discoverable" }));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.bundleId, /^PROJ-2026-\d{4}-sewer-fund$/);
  const text = record.readFile(r.bundleId, "bundle.md").text;
  assert.match(text, new RegExp(`^id: ${r.bundleId}$`, "m"));
  assert.equal(r.bundleSha, sha(text));
  assert.equal(r.owner, "ann");
  assert.equal(r.visibility, "discoverable");
  assert.deepEqual(membership.created, [{ projectId: r.bundleId, ownerId: "ann", visibility: "discoverable", by: "ann" }]);
  const clash = p.promote(mk("  sewer   FUND "));
  assert.equal(clash.reason, "NAME_TAKEN");
  assert.doesNotMatch(JSON.stringify(clash), /PROJ-|Sewer Fund/);
  assert.equal(projectNameKey("  sewer   FUND "), projectNameKey("Sewer Fund"));
  assert.equal(p.promote(mk("x", { visibility: "loud" })).reason, "PROJECT_VISIBILITY_UNKNOWN_SETTING");
  assert.equal(p.promote(mk("Other", { visibility: "discoverable", ownerMemberId: undefined })).reason, "PROJECT_VISIBILITY_NO_OWNER");
  assert.equal(p.promote({ ...create(ID, infoDoc(ID)), visibility: "hidden" }).reason, "PROJECT_VISIBILITY_NOT_A_CREATION");
  const cur = text;
  const close = cur.replace("current_state: forming", "current_state: closed") + "";
  const withReason = close.replace(/^---\n/, "---\nclosed_reason: abandoned\n");
  const rv = (who, t, extra = {}) => p.promote({ bundleId: r.bundleId, base: record.head(r.bundleId).bundleSha, snapKey: `s${Math.random()}`,
    author: who ? `member:${who}` : "token:x", actorIdentity: who ? `member:${who}` : null, actorViewer: who ? `member:${who}` : null,
    actorMemberId: who, files: [{ path: "bundle.md", text: t }], meta: {}, ...extra });
  membership.joined.set(r.bundleId, ["bob"]);
  assert.equal(rv("bob", withReason).reason, "NOT_THE_OWNER");
  assert.equal(rv("carl", cur.replace("forming", "investigating")).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(rv("bob", cur.replace("forming", "investigating")).ok, true);
  assert.equal(rv("ann", withReason.replace("current_state: forming", "current_state: closed").replace("current_state: investigating", "current_state: closed")).ok, true);
  assert.equal(rv("bob", withReason.replace("current_state: closed", "current_state: investigating")).reason, "NOT_THE_OWNER");
  assert.equal(rv("ann", withReason.replace("current_state: closed", "current_state: investigating")).ok, true);
  const machine = makePromotion();
  const m = machine.p.promote({ ...mk("Machine made"), ownerMemberId: undefined, author: "token:ai" });
  assert.deepEqual([m.ok, m.owner, m.visibility], [true, null, "hidden"]);
  assert.deepEqual(machine.membership.created, []);
});

test("R20: a revision of a bundle the stamped actor may not see answers exactly as ABSENT, before anything that reads the head", () => {
  const { p, record, membership, head } = held();
  membership.hidden.add(ID);
  const absent = p.promote(revise("INFO-2026-0404", "f".repeat(64), infoDoc("INFO-2026-0404"), { actorIdentity: "member:eve", actorViewer: "member:eve" }));
  const hidden = p.promote(revise(ID, "f".repeat(64), infoDoc(ID), { actorIdentity: "member:eve", actorViewer: "member:eve" }));
  assert.deepEqual(hidden, absent);
  /* Not CAS_STALE even though the base is stale, and not SNAP_KEY_TAKEN at a held key. */
  assert.deepEqual(p.promote(revise(ID, head.bundleSha, infoDoc(ID), { snapKey: "k1", actorIdentity: "member:eve", actorViewer: null })), absent);
  membership.discoverable.add(ID);
  const ex = p.promote(revise(ID, head.bundleSha, infoDoc(ID), { actorIdentity: "member:eve", actorViewer: "member:eve" }));
  assert.equal(ex.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  assert.deepEqual([ex.project, ex.name], [ID, "A report"]);
  /* An internal write (no stamped identity) is not a caller. */
  assert.equal(p.promote(revise(ID, head.bundleSha, infoDoc(ID, { title: "x" }))).ok, true);
  void record;
});

test("R20: every refusal names a reason, carrying its catalogue row where one exists; NO_BODY; never throws for any JSON package", () => {
  const { p } = makePromotion();
  for (const pkg of [undefined, null, 7, "x", [], {}, { files: "x" }, { bundleId: 5, base: null, snapKey: "k", files: [], meta: {} },
                     { bundleId: ID, base: null, snapKey: {}, files: [1], meta: 3 }, { bundleId: ID, base: null, snapKey: "k", files: [{ path: "bundle.md", text: 5 }], meta: {} }]) {
    const r = p.promote(pkg);
    assert.equal(r.ok, false);
    assert.equal(typeof r.reason, "string");
  }
  assert.equal(p.promote(undefined).reason, "NO_BODY");
  const { p: q, head } = held();
  const stale = q.promote(revise(ID, "a".repeat(64), infoDoc(ID)));
  assert.deepEqual([stale.code, stale.check, typeof stale.translation], ["CAS_STALE", "C-33.21", "string"]);
  assert.equal(q.promote(revise(ID, head.bundleSha, infoDoc(ID), { snapKey: "k1" })).check, "C-67.1");
});

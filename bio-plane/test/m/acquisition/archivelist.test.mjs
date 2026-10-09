/* acquisition R41 (DEC-167; the read behind `owed:archivelist`): `archiveList({archiveSha, viewer, state, limit, after})`
   answers an archive's entries as R38 recorded them, and `memberOf(captureSha)` every archive a capture was filed from or
   found in. At the module's interface: the acquisition instance's own methods, over archives captured and opened through
   `acquire` (fixture.mjs `run`). Sight is membership's one rule (its R43) over record-core's `bundles`: a bundle row is
   written for an archive the record has promoted, and three of membership's tables (its R120 read contract), as its rule
   reads them. Since D54 (K2408, K2442) an administrator, the founder included, sees a hidden project's contents only as a
   participant; a project `project_sight` does not hold reads hidden. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, archiveList, memberOf, ARCHIVE_CHECKS } from "../../../src/acquisition/index.mjs";
import { ARCHIVE_DEPTH_MAX, ARCHIVE_LIMITS } from "../../../src/ooxml.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const URL1 = "https://files.example/set.zip";
const capture = (w, bytes, url = URL1) => run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/zip" } }) }, { locator: url });
const ADMIN = "class:admin";
const row = (code) => ({ check: ARCHIVE_CHECKS[code].check, translation: ARCHIVE_CHECKS[code].translation });

/* sight: membership's tables as its R43 reads them, and a bundle for each home */
function sight(w) {
  w.rows("CREATE TABLE IF NOT EXISTS members (member_id TEXT PRIMARY KEY, role TEXT, status TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_participants (project_id TEXT, member_id TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_sight (project_id TEXT PRIMARY KEY, setting TEXT)");
  return {
    admin(member) { w.rows("INSERT INTO members (member_id, role, status) VALUES (?, 'admin', 'active')", member); },
    set(project, setting) {
      w.rows("INSERT INTO project_sight (project_id, setting) VALUES (?, ?) ON CONFLICT(project_id) DO UPDATE SET setting=excluded.setting",
             project, setting);
    },
    bundle(id, project = null) {
      w.rows(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha, project)
              VALUES (?, 'information', 'g', 'collected', 'T', 'T', 'x', ?)`, id, project);
    },
    join(project, member) { w.rows("INSERT INTO project_participants (project_id, member_id) VALUES (?, ?)", project, member); },
  };
}
const symlinked = (bytes, k) => {
  const b = new Uint8Array(bytes);
  let seen = -1;
  for (let i = 0; i + 4 <= b.length; i++)
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 1 && b[i + 3] === 2 && ++seen === k) { b[i + 5] = 3; b.set([0, 0, 0xff, 0xa1], i + 38); return b; }
  return b;
};

test("R41: an opened archive's entries in index order, each as the listing states it with R38's outcome: filed (its digest and the bundle it was promoted into), already held, folder, link (its target), not filed (its row in member words) and waiting; the archive's facts and a summary; writes nothing", async () => {
  const w = world();
  const s = sight(w);
  const z = symlinked(makeZip([
    { name: "dir/", data: "", method: 0 }, { name: "a.txt", data: "same" }, { name: "b.txt", data: "same" },
    { name: "locked", data: "x", encrypted: "traditional" }, { name: "ln", data: "a.txt", method: 0 },
    { name: "Résumé.txt", data: "cv" },
  ]), 4);
  await capture(w, z);
  /* the record promotes the archive and its first file into bundles of their own */
  s.bundle("INFO-2026-0001-zip"); s.bundle("INFO-2026-0002-a");
  w.prov.homes[sha(z)] = "INFO-2026-0001-zip"; w.prov.homes[sha("same")] = "INFO-2026-0002-a";
  const count = () => w.rows("SELECT COUNT(*) AS n FROM archive_entries")[0].n + w.prov.receipts.length;
  const before = count();
  const l = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN });
  assert.equal(count(), before, "it writes nothing");
  assert.equal(l.ok, true);
  /* the declared total is over "file" entries (ooxml R27): the link is not one */
  assert.deepEqual(l.archive, { sha256: sha(z), bundle: "INFO-2026-0001-zip", grade: EARNED_CAPTURE_CEILING, bytes: z.length, entries: 6,
                                declared_total: 4 + 4 + 1 + 2, opened: true, refused: null });
  assert.deepEqual(l.summary, { filed: 2, already_held: 1, not_filed: 1, folders: 1, links: 1, waiting: 0 });
  assert.deepEqual(l.entries.map((e) => [e.index, e.state]), [[0, "folder"], [1, "filed"], [2, "already_held"], [3, "not_filed"], [4, "link"], [5, "filed"]]);
  const [dir, a, b, locked, ln, cv] = l.entries;
  assert.deepEqual([a.sha256, a.bundle, b.sha256, b.bundle], [sha("same"), "INFO-2026-0002-a", sha("same"), "INFO-2026-0002-a"]);
  assert.equal(cv.bundle, null, "a file not yet promoted has no bundle");
  assert.deepEqual({ code: locked.code, check: locked.check, translation: locked.translation }, { code: "MEMBER_ENCRYPTED", ...row("MEMBER_ENCRYPTED") });
  assert.equal(ln.target, "a.txt");
  assert.deepEqual([dir.kind, dir.name], ["dir", "dir/"]);
  assert.deepEqual([cv.name, cv.name_encoding, cv.name_raw, cv.name_shared, cv.path_unsafe], ["Résumé.txt", "utf-8", Buffer.from("Résumé.txt").toString("hex"), 1, false],
                   "names exactly as the listing states them");
  assert.match(cv.dos_time_stated, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/);
  assert.deepEqual([l.limit, l.truncated, l.next], [200, false, null]);
});

test("R41: `state` filters to one state (`not_filed`, the screen's \"only those not filed\"); entries come at most `limit` (default 200, clamped 1…1000) with `truncated` and `next`, passed back as `after`", async () => {
  const w = world();
  const z = makeZip(Array.from({ length: 7 }, (_, i) => ({ name: `f${i}`, data: `d${i}`, ...(i % 3 === 0 ? { encrypted: "traditional" } : {}) })));
  await capture(w, z);
  const only = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, state: "not_filed" });
  assert.deepEqual(only.entries.map((e) => e.index), [0, 3, 6]);
  assert.equal(only.summary.not_filed, 3, "the summary counts the whole archive");
  const p1 = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, limit: 3 });
  assert.deepEqual([p1.entries.map((e) => e.index), p1.truncated, p1.next], [[0, 1, 2], true, 2]);
  const p2 = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, limit: 3, after: p1.next });
  assert.deepEqual([p2.entries.map((e) => e.index), p2.truncated, p2.next], [[3, 4, 5], true, 5]);
  const p3 = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, limit: 3, after: p2.next });
  assert.deepEqual([p3.entries.map((e) => e.index), p3.truncated, p3.next], [[6], false, null]);
  for (const [asked, got] of [[0, 1], [-5, 1], [5000, 1000], ["x", 200], [undefined, 200]])
    assert.equal((await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, limit: asked })).limit, got, String(asked));
});

test("R41: an archive held but never opened is answered from its listing now, `opened` false and each `ok` entry waiting; an archive refused whole answers its refusal with its row, for every entry the listing read", async () => {
  const w = world();
  const hold = async (bytes) => { await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
    w.prov.recordReceipt({ address: URL1, addressNorm: URL1, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via: "direct" }); };
  const z = makeZip([{ name: "d/", data: "", method: 0 }, { name: "a", data: "a" }, { name: "b", data: "b", encrypted: "aes" }]);
  await hold(z);
  const l = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN });
  assert.deepEqual([l.archive.opened, l.archive.refused, l.archive.entries], [false, null, 3]);
  assert.deepEqual(l.entries.map((e) => [e.state, e.waiting_on ?? null, e.code ?? null]), [["folder", null, null], ["waiting", null, null], ["not_filed", null, "MEMBER_ENCRYPTED"]]);
  assert.equal(w.rows("SELECT COUNT(*) AS n FROM archive_entries")[0].n, 0, "reading it opened nothing");
  /* refused whole: overlapping entries (ambiguous), listed with their rows */
  const amb = makeZip([{ name: "a", data: "aaaa" }, { name: "b", sameDataAs: 0 }]);
  await hold(amb);
  const r = await w.acq.archiveList({ archiveSha: sha(amb), viewer: ADMIN });
  assert.deepEqual([r.archive.refused.code, r.archive.refused.detail, r.archive.refused.check], ["ARCHIVE_AMBIGUOUS", "entries_overlap", row("ARCHIVE_AMBIGUOUS").check]);
  assert.deepEqual(r.entries.map((e) => [e.index, e.state, e.code]), [[0, "not_filed", "ARCHIVE_AMBIGUOUS"], [1, "not_filed", "ARCHIVE_AMBIGUOUS"]]);
  /* over ARCHIVE_TOTAL_MAX: listed, refused, with its limit */
  const over = ARCHIVE_LIMITS.ARCHIVE_TOTAL_MAX;
  const tot = makeZip([{ name: "a", data: "a", local: { uncompressedSize: over }, central: { uncompressedSize: over } }, { name: "b", data: "b" }]);
  await hold(tot);
  const t = await w.acq.archiveList({ archiveSha: sha(tot), viewer: ADMIN });
  assert.deepEqual([t.archive.refused.code, t.archive.refused.limit, t.entries.map((e) => e.code)], ["ARCHIVE_TOTAL_MAX", over, ["ARCHIVE_TOTAL_MAX", "ARCHIVE_TOTAL_MAX"]]);
});

test("R41: a waiting entry names the limit or budget it waits on with its figure, or none when it waits only for the next call; an archive past the depth bound waits on ARCHIVE_DEPTH_MAX", async () => {
  const w = world();
  const z = makeZip(Array.from({ length: 103 }, (_, i) => ({ name: `f${i}`, data: `d${i}` })));
  await capture(w, z);
  let l = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, state: "waiting" });
  assert.deepEqual(l.entries.map((e) => [e.index, e.waiting_on, e.limit]), [[100, null, undefined], [101, null, undefined], [102, null, undefined]]);
  w.rows("INSERT INTO unpack_days (day, entries, bytes) VALUES (?, 40000, 0) ON CONFLICT(day) DO UPDATE SET entries=40000", new Date().toISOString().slice(0, 10));
  await unpack(w.store, { archiveSha: sha(z), cls: "daemon" });
  l = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN, state: "waiting" });
  assert.deepEqual(l.entries.map((e) => [e.waiting_on, e.limit]), Array(3).fill(["UNPACK_DAILY_ENTRIES", 40000]));
  /* depth */
  const leaf = makeZip([{ name: "leaf", data: "l" }]);
  let nest = leaf;
  for (let i = 0; i < ARCHIVE_DEPTH_MAX; i++) nest = makeZip([{ name: `n${i}.zip`, data: nest }]);
  const w2 = world();
  let u = (await capture(w2, nest)).body.unpack;
  while (u.nested.length && (await w2.acq.archiveList({ archiveSha: u.nested[0], viewer: ADMIN })).entries.every((e) => e.waiting_on !== "ARCHIVE_DEPTH_MAX"))
    u = await unpack(w2.store, { archiveSha: u.nested[0], cls: "daemon" });
  const deep = await w2.acq.archiveList({ archiveSha: u.nested[0], viewer: ADMIN });
  assert.equal(u.nested[0], sha(leaf), "the archive at depth ARCHIVE_DEPTH_MAX + 1");
  assert.deepEqual([deep.archive.opened, deep.entries.map((e) => [e.state, e.waiting_on, e.limit])], [false, [["waiting", "ARCHIVE_DEPTH_MAX", ARCHIVE_DEPTH_MAX]]]);
});

test("R41: refusals: BAD_SHA; ARCHIVE_NOT_HELD, the same answer for an archive not held and for one whose home the viewer may not see (membership R43), an administrator and the founder neither invited nor joined to a hidden project included (D54); an entry's bundle the viewer may not see is answered null", async () => {
  const w = world();
  const s = sight(w);
  const z = makeZip([{ name: "a", data: "fenced" }, { name: "b", data: "open" }]);
  await capture(w, z);
  s.bundle("PROJ-1"); s.bundle("INFO-1", "PROJ-1"); s.bundle("INFO-2"); s.bundle("INFO-3", "PROJ-1");
  s.set("PROJ-1", "hidden");
  w.prov.homes[sha("fenced")] = "INFO-3"; w.prov.homes[sha("open")] = "INFO-2";
  s.join("PROJ-1", "insider");
  s.admin("boss"); s.admin("joiner"); s.join("PROJ-1", "joiner");
  for (const bad of [null, "", "z".repeat(64), 1]) assert.equal((await w.acq.archiveList({ archiveSha: bad, viewer: ADMIN })).reason, "BAD_SHA");
  const unheld = await w.acq.archiveList({ archiveSha: "a".repeat(64), viewer: ADMIN });
  assert.deepEqual([unheld.ok, unheld.reason, unheld.check, unheld.translation], [false, "ARCHIVE_NOT_HELD", row("ARCHIVE_NOT_HELD").check, row("ARCHIVE_NOT_HELD").translation]);
  /* the archive's home belongs to a hidden project: an outsider, an active administrator and the founder (either
     spelling) neither invited nor joined to it are answered exactly as for an archive not held (D54) */
  w.prov.homes[sha(z)] = "INFO-1";
  const norm = (x) => JSON.stringify({ ...x, archive: undefined });
  for (const viewer of ["member:outsider", "member:boss", "admin", "member:admin"])
    assert.equal(norm(await w.acq.archiveList({ archiveSha: sha(z), viewer })), norm(unheld), `${viewer}: the same answer, so the two cannot be told apart`);
  assert.equal((await w.acq.archiveList({ archiveSha: sha(z), viewer: "nobody-recognised" })).reason, "ARCHIVE_NOT_HELD");
  /* negative controls: a participant, an administrator who joined, and a machine credential see it, each entry's bundle
     answered; a project the sight index does not hold reads hidden, as membership R43 states */
  for (const viewer of ["member:insider", "member:joiner", ADMIN])
    assert.deepEqual((await w.acq.archiveList({ archiveSha: sha(z), viewer })).entries.map((e) => e.bundle), ["INFO-3", "INFO-2"], viewer);
  w.rows("DELETE FROM project_sight WHERE project_id = 'PROJ-1'");
  assert.equal((await w.acq.archiveList({ archiveSha: sha(z), viewer: "member:boss" })).reason, "ARCHIVE_NOT_HELD", "unindexed reads hidden");
  /* a discoverable project stays seen whole by administrators, the founder included, and never by an outsider */
  s.set("PROJ-1", "discoverable");
  for (const viewer of ["member:boss", "admin", "member:admin"])
    assert.deepEqual((await w.acq.archiveList({ archiveSha: sha(z), viewer })).entries.map((e) => e.bundle), ["INFO-3", "INFO-2"], viewer);
  assert.equal((await w.acq.archiveList({ archiveSha: sha(z), viewer: "member:outsider" })).reason, "ARCHIVE_NOT_HELD");
  /* an entry's bundle: answered only where the viewer may see it */
  s.set("PROJ-1", "hidden");
  w.prov.homes[sha(z)] = "INFO-2";
  for (const viewer of ["member:outsider", "member:boss", "admin"])
    assert.deepEqual((await w.acq.archiveList({ archiveSha: sha(z), viewer })).entries.map((e) => e.bundle), [null, "INFO-2"], `${viewer}: the fenced file's bundle is null`);
  assert.deepEqual((await w.acq.archiveList({ archiveSha: sha(z), viewer: "member:insider" })).entries.map((e) => e.bundle), ["INFO-3", "INFO-2"],
                   "negative control: a participant is answered it");
});

test("R41: memberOf answers every archive a capture was filed from or found in, `[]` for none; it writes nothing and never throws", async () => {
  const w = world();
  const z1 = makeZip([{ name: "x", data: "shared" }, { name: "y", data: "only1" }]);
  const z2 = makeZip([{ name: "q", data: "q" }, { name: "x2", data: "shared" }]);
  await capture(w, z1);
  await capture(w, z2, "https://files.example/two.zip");
  const both = w.acq.memberOf(sha("shared"));
  assert.deepEqual(both.sort((a, b) => (a.archiveSha < b.archiveSha ? -1 : 1)),
                   [{ archiveSha: sha(z1), index: 0 }, { archiveSha: sha(z2), index: 1 }].sort((a, b) => (a.archiveSha < b.archiveSha ? -1 : 1)));
  assert.deepEqual(w.acq.memberOf(sha("only1")), [{ archiveSha: sha(z1), index: 1 }]);
  assert.deepEqual(memberOf(w.store, sha("only1")), [{ archiveSha: sha(z1), index: 1 }], "the module-level form, through the store");
  for (const x of [sha("never"), null, undefined, 7, {}, "short"]) assert.deepEqual(w.acq.memberOf(x), [], String(x));
  assert.deepEqual(memberOf(null, sha("only1")), []);
  /* the module-level archiveList through the store reaches the same instance */
  assert.equal((await archiveList(w.store, { archiveSha: sha(z1), viewer: ADMIN })).archive.sha256, sha(z1));
});

/* R41 (N720, K1955): a capture held and visible that R17's rule does not profile as `zip` is NOT_AN_ARCHIVE, with its row
   (C-139.20), never an archive whose listing is refused whole. */
const NOT_AN_ARCHIVE = row("NOT_AN_ARCHIVE");
const docxOf = (pad = "") => makeZip([{ name: "[Content_Types].xml", data: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>' },
                                      { name: "word/document.xml", data: `<w:document>${pad}</w:document>`, method: pad ? 0 : 8 }]);
const odtOf = (pad = "") => makeZip([{ name: "mimetype", data: "application/vnd.oasis.opendocument.text", method: 0 },
                                     { name: "content.xml", data: `<office:document-content>${pad}</office:document-content>`, method: pad ? 0 : 8 }]);

test("R41: NOT_AN_ARCHIVE, with its row, for a capture held and visible that R17's rule does not profile as zip: a plain file, an office file and an OpenDocument file (both ZIP containers), within and past the read's bound, captured or only held; it writes nothing; a plain ZIP archive is listed (negative control)", async () => {
  const w = world();
  const s = sight(w);
  const hold = async (bytes, url = URL1) => { await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
    w.prov.recordReceipt({ address: url, addressNorm: url, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via: "direct" }); };
  /* past ODF_DIGEST_MAX a capture is stored in parts (R10), which its home's document names (provenance R6): R17's arm over
     the stored parts decides */
  const big = "x".repeat(9 * 1024 * 1024);
  let n = 0;
  const holdInParts = async (bytes) => {
    const url = `https://files.example/big-${++n}`;
    const c = await run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/octet-stream" } }) }, { locator: url });
    assert.equal(c.body.document.parts.length, 2, "held in parts");
    s.bundle(`INFO-BIG-${n}`);
    w.prov.homes[sha(bytes)] = `INFO-BIG-${n}`;
    w.prov.named[sha(bytes)] = c.body.document.parts.map((x) => ({ sha256: x.sha256, bytes: x.bytes }));
    return c;
  };
  const cases = [["a plain text file", new TextEncoder().encode("just words, no archive"), hold], ["an office (OPC) file", docxOf(), hold],
                 ["an OpenDocument file", odtOf(), hold], ["an office file past the bound", docxOf(big), holdInParts],
                 ["an OpenDocument file past the bound", odtOf(big), holdInParts]];
  for (const [what, bytes, put] of cases) {
    await put(bytes);
    const before = w.rows("SELECT COUNT(*) AS n FROM archive_entries")[0].n + w.prov.receipts.length;
    const r = await w.acq.archiveList({ archiveSha: sha(bytes), viewer: ADMIN });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.archive], [false, "NOT_AN_ARCHIVE", "NOT_AN_ARCHIVE", NOT_AN_ARCHIVE.check, NOT_AN_ARCHIVE.translation, sha(bytes)], what);
    assert.notEqual(r.format, "zip", what);
    assert.equal("entries" in r || "summary" in r, false, `${what}: no listing is answered`);
    assert.equal(w.rows("SELECT COUNT(*) AS n FROM archive_entries")[0].n + w.prov.receipts.length, before, `${what}: it writes nothing`);
  }
  /* an office file captured through acquire is profiled, not opened, and answered the same */
  const docx = docxOf("captured");
  const c = await run(w, { "https://files.example/report.docx": () => new Response(docx, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } }) },
                      { locator: "https://files.example/report.docx" });
  assert.deepEqual([c.status, c.body.unpack], [200, undefined], "an office file is not opened on capture (R40)");
  assert.equal((await w.acq.archiveList({ archiveSha: sha(docx), viewer: ADMIN })).reason, "NOT_AN_ARCHIVE");
  /* negative controls: a plain ZIP archive, within and past the bound, held and never opened, is listed */
  const small = makeZip([{ name: "a", data: "a" }]);
  await hold(small);
  const l = await w.acq.archiveList({ archiveSha: sha(small), viewer: ADMIN });
  assert.deepEqual([l.ok, l.archive.opened, l.archive.refused], [true, false, null]);
  const bigZip = makeZip([{ name: "big", data: big, method: 0 }, { name: "b", data: "b" }]);
  const cz = await holdInParts(bigZip);
  assert.equal(cz.body.document.profile.format.format, "zip", "R17 profiles it zip past the bound");
  const lb = await w.acq.archiveList({ archiveSha: sha(bigZip), viewer: ADMIN });
  assert.deepEqual([lb.ok, lb.archive.refused], [true, null]);
});

test("R41: an office file opened before T36 (R38 now refuses one, K2100) is still NOT_AN_ARCHIVE, read from its recorded listing; an archive not visible answers ARCHIVE_NOT_HELD first, so the refusal says nothing of what a hidden capture is", async () => {
  const w = world();
  const s = sight(w);
  for (const bytes of [docxOf("opened"), odtOf("opened")]) {
    await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
    w.prov.recordReceipt({ address: URL1, addressNorm: URL1, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via: "direct" });
    /* opened as R38 opened any held ZIP container before T36: acquire's internal call, which asks no profile again */
    const u = await unpack(w.store, { archiveSha: sha(bytes), by: "member:m1", cls: "member", member: true },
                           { automatic: true, parts: [{ sha256: sha(bytes), bytes: bytes.length }] });
    assert.equal(u.ok, true, "opened, with its listing recorded");
    const r = await w.acq.archiveList({ archiveSha: sha(bytes), viewer: ADMIN });
    assert.deepEqual([r.reason, r.check, r.translation], ["NOT_AN_ARCHIVE", NOT_AN_ARCHIVE.check, NOT_AN_ARCHIVE.translation]);
    assert.match(r.part, /^(\[Content_Types\]\.xml|mimetype)$/);
  }
  /* sight comes first: a hidden office file answers exactly as a capture not held */
  const hidden = docxOf("hidden");
  await w.b.put(`bio/captures/${sha(hidden)}`, hidden);
  w.prov.recordReceipt({ address: URL1, addressNorm: URL1, captureSha: sha(hidden), retrieved: "2026-01-01T00:00:00Z", via: "direct" });
  s.bundle("PROJ-9"); s.bundle("INFO-9", "PROJ-9"); s.set("PROJ-9", "hidden");
  w.prov.homes[sha(hidden)] = "INFO-9";
  s.admin("boss");
  /* an outsider, and (D54) an administrator and the founder neither invited nor joined to the hidden project */
  for (const viewer of ["member:outsider", "member:boss", "admin", "member:admin"]) {
    const r = await w.acq.archiveList({ archiveSha: sha(hidden), viewer });
    assert.deepEqual([r.reason, r.check, "format" in r, "part" in r], ["ARCHIVE_NOT_HELD", row("ARCHIVE_NOT_HELD").check, false, false], viewer);
  }
  /* negative controls: a project participant is told what it is; so is an administrator once the project is discoverable */
  s.join("PROJ-9", "insider");
  assert.equal((await w.acq.archiveList({ archiveSha: sha(hidden), viewer: "member:insider" })).reason, "NOT_AN_ARCHIVE");
  s.set("PROJ-9", "discoverable");
  for (const viewer of ["member:boss", "admin"])
    assert.equal((await w.acq.archiveList({ archiveSha: sha(hidden), viewer })).reason, "NOT_AN_ARCHIVE", viewer);
  assert.equal((await w.acq.archiveList({ archiveSha: sha(hidden), viewer: "member:outsider" })).reason, "ARCHIVE_NOT_HELD");
});

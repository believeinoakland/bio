/* control-plane R58, R123, R124 (fix round 6, G43; K4649, K4651): THE PROVENANCE FILE A PROMOTION WRITES STAYS UNDER WHAT PROMOTION TAKES INLINE. A
   document the door filed with a reading too large to embed (a 1 MB sheet's cells and units run to 20 MB) is promoted without it and its reading
   follows: by the ledger when the door promotes an archive's documents (R58), and by the owed render's delivery (R124) when screens-intake's
   `promoteDocument` says it dropped the reading (`readingDropped`). Controls: a reading that fits is embedded as it was. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { M, world, call } from "./harness.mjs";
import { INLINE_MAX } from "../../../src/promotion/index.mjs";
import { archiveDocuments, promoteArchive, PROV_EMBED_MAX } from "../../../src/control-plane/archive.mjs";
const { CAPTURE_SCREEN } = await import("../../../src/screens-intake/capture.mjs");
const { deliverOwedRender } = await import("../../../src/control-plane/index.mjs");
const { captureOf } = await import("../../../src/capture/index.mjs");
const { extractionOf } = await import("../../../src/extraction/index.mjs");
const { recordOf } = await import("../../../src/record-core/index.mjs");
const { promotionOf } = await import("../../../src/promotion/index.mjs");
const { record } = await import("./record.mjs");

const reply = (o, status = 200) => new Response(JSON.stringify(o), { status });
const S = (c) => c.repeat(64);
const hex = (b) => createHash("sha256").update(b).digest("hex");
const utf8 = (s) => new TextEncoder().encode(s).length;
const doc = (sha, extra = {}) => ({ file: `snapshots/f-${sha.slice(0, 6)}`, locator: `https://example.org/a.zip#zip:${sha[0]}`, retrieved: "2026-10-07T00:00:00Z",
                                    capture: { sha256: sha, bytes: 3, method: "unpacked" }, ...extra });
/* a reading with `n` bytes of units: the shape a door read leaves on an acquire's document */
const readingOf = (n) => ({ reading: { found: true, entities: 0 }, text_units: [{ extent: { kind: "document" }, text: "x".repeat(n) }] });
const provOf = (call) => call.body.files.find((f) => f.path === "data/provenance.json");

/* A world whose store draws ids and promotes, answers `readheldfor` as a record holding no home for the digest, and a hook answering `acquire`. */
function archiveWorld(answer) {
  let n = 0;
  const w = world({ answer: (c) => {
    if (c.route === "allocid") return reply({ ok: true, result: { id: `INFO-2026-${String(++n).padStart(4, "0")}` } });
    if (c.route === "promote") return reply({ ok: true, result: { ok: true, bundleId: c.body.bundleId } });
    if (c.route === "readheldfor") return reply({ ok: true, result: { ok: true, read: false, why: "NO_HOME" } });
    if (c.route === "pendingadd") return reply({ ok: true, result: { ok: true } });
    return null;
  } });
  const hooks = { publicOp: async () => M.json({ ok: true }), publicInstanceGroup: async () => ({ answered: true, result: {} }),
                  gatedOp: async (ctx) => (ctx.op === "acquire" ? M.json(answer, 200) : undefined) };
  return { ...w, hooks };
}
const members = (extra) => [doc(S("b"), { container: { archive_sha256: S("a"), index: 0, path: "one.csv" }, ...extra }),
                            doc(S("c"), { container: { archive_sha256: S("a"), index: 1, path: "two.csv" } })];
const archiveDoc = (extra) => doc(S("a"), { file: "snapshots/archive", locator: "https://example.org/a.zip", ...extra });

test("R58 (G43; K4651): an archive's document or a member the door promotes carrying a reading too large to embed is filed without it, so `data/provenance.json` is under promotion's inline bound; the digests are followed (asked of `readHeld`) and the answer's shape is as it was (control: a reading that fits is embedded, indented as before)", async () => {
  const big = readingOf(INLINE_MAX + 500000);
  const w = archiveWorld({ ok: true, existed: false, document: archiveDoc(big), unpack: { ok: true, archive: { sha256: S("a") }, documents: members(readingOf(2 * INLINE_MAX)) } });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: w.hooks, body: { address: "https://example.org/a.zip", project: "PROJ-2026-0001" } });
  assert.equal(r.status, 200, r.text.slice(0, 300));
  const promotes = w.env.calls.filter((c) => c.route === "promote");
  assert.deepEqual(promotes.map((c) => c.body.register[0].sha256), [S("a"), S("b"), S("c")]);
  for (const p of promotes) {
    const f = provOf(p);
    assert.ok(f.bytes <= PROV_EMBED_MAX, `${f.bytes} bytes embedded`);
    assert.ok(utf8(f.text) <= INLINE_MAX, "under what promotion takes inline");
    assert.equal(f.bytes, utf8(f.text), "the file states its own length");
    const d = JSON.parse(f.text).documents[0];
    assert.deepEqual([d.reading, d.text_units, d.capture.sha256], [undefined, undefined, p.body.register[0].sha256], "no reading embedded");
  }
  assert.deepEqual(r.json.promoted.map((x) => x.sha256), [S("a"), S("b"), S("c")]);
  assert.deepEqual(Object.keys(r.json.promoted[0]).sort(), ["bundleId", "sha256"]);
  assert.deepEqual(r.json.not_promoted, []);
  /* the readings that were left out follow: the archive's own and the first member's, each asked of `readHeld` (its digest has no home yet) and written down as owed;
     the second member carried none, and since G162 (R134, K4980) every member the door filed is followed, so it is followed too */
  const follows = (route) => w.env.calls.filter((c) => c.route === route).map((c) => c.params.sha256 ?? c.params.sha);
  assert.deepEqual(follows("readheldfor").sort(), [S("a"), S("b"), S("c")]);
  assert.deepEqual(follows("pendingadd").sort(), [S("a"), S("b"), S("c")]);
  /* control: a reading that fits stays in the file, the indent unchanged */
  const small = archiveWorld({ ok: true, existed: false, document: archiveDoc(readingOf(2000)), unpack: { ok: true, archive: { sha256: S("a") }, documents: members(readingOf(2000)) } });
  const s = await call(small.env, { op: "acquire", token: small.S.ann, method: "POST", hooks: small.hooks, body: {} });
  assert.equal(s.status, 200, s.text.slice(0, 300));
  const kept = small.env.calls.filter((c) => c.route === "promote").map((p) => [p, JSON.parse(provOf(p).text).documents[0]]).filter(([, d]) => d.text_units);
  assert.equal(kept.length, 2, "the archive's and the first member's readings are embedded");
  for (const [p, d] of kept) {
    assert.equal(d.text_units[0].text.length, 2000, "the reading that fits is embedded");
    assert.equal(provOf(p).text, JSON.stringify({ documents: [d] }, null, 2));
  }
  /* G162 (R134, K4980): every member filed is followed, so the two members are, though their readings were embedded; the archive's own document, whose reading was not dropped, is not */
  const followed = small.env.calls.filter((c) => c.route === "readheldfor" || c.route === "pendingadd").map((c) => c.params.sha256 ?? c.params.sha);
  assert.deepEqual([...new Set(followed)].sort(), [S("b"), S("c")], "the members are followed, the archive's own document is not");
});

test("R58 (G43): a document that carries no reading, or only a large field that is not a reading, is filed whole; `promoteArchive` hands back only the documents it filed without their reading (`onDropped`), after a promotion that stood", async () => {
  const stub = { async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/allocid") return reply({ ok: true, result: { id: `INFO-2026-${Math.floor(Math.random() * 9000 + 1000)}` } });
    return reply({ ok: true, result: { ok: true, bundleId: (await req.json()).bundleId } });
  } };
  const plain = doc(S("d"), { note: "n".repeat(INLINE_MAX - 70000) });   /* large but not a reading: nothing to drop, filed as it is */
  const dropped = [];
  const done = await promoteArchive({ stub, doAnswer: M.doAnswer, docs: [plain, doc(S("e"), readingOf(INLINE_MAX))], archiveSha: S("a"), who: { author: "ann" }, onDropped: (e) => dropped.push(e) });
  assert.deepEqual(done.promoted.map((x) => x.sha256), [S("d"), S("e")]);
  assert.deepEqual(dropped.map((e) => e.sha), [S("e")]);
  assert.equal(dropped[0].document.capture.sha256, S("e"));
  assert.equal(archiveDocuments("unpack", { ok: true, documents: [plain] }).length, 1);
});

test("R58 (G43; K4651): the bound is promotion's own: promotion's inline bound is 1,048,576 B and the door embeds at most 65,536 B less, so the rest of a bundle's provenance file always fits", () => {
  assert.equal(INLINE_MAX, 1048576);
  assert.equal(PROV_EMBED_MAX, 1048576 - 65536);
});

/* ---- the owed render's delivery (R124) over a real record: screens-intake's `promoteDocument`, the real extraction read ---- */
const screen = (ctx, who = { author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" }) => ({
  now: () => Date.now(), digest: async (t) => hex(t), w: (k) => k, date: (d) => d,
  call: async (op, { query = {}, body } = {}) => (op === "allocid" ? { ok: true, ...recordOf(ctx).allocId(query.prefix, query.year) } : promotionOf(ctx).promote({ ...body, ...who })) });
const csvDoc = (bytes) => ({ file: "snapshots/BUDGET.csv", locator: "https://example.org/BUDGET.csv", retrieved: "2026-10-23T00:00:00Z", profile: { format: { format: "csv" } },
  authority_state: "undetermined", authority_basis: "fetched", origin: { kind: "named_request" },
  capture: { sha256: hex(bytes), bytes: bytes.length, content_type: "text/csv", method: "fetch", grade: "C", actor_class: "member", encoding: "binary" } });
/* the 1 MiB CSV of the walker's case: a header and many two-column rows, the last holding LASTROWMARK */
const oneMegCsv = () => {
  const rows = ["id,amount"];
  for (let i = 0; rows.join("\n").length < 1048576 - 40; i++) rows.push(`${i},${(i * 7919) % 100003}`);
  rows.push("9999999,LASTROWMARK");
  return new TextEncoder().encode(rows.join("\n"));
};
async function owingCsv() {
  const r = await record();
  const shellBytes = new TextEncoder().encode(`<html><body>the shell ${Math.random()}</body></html>`);
  r.objects.set(`bio/captures/${hex(shellBytes)}`, shellBytes);
  const shell = { ...csvDoc(shellBytes), file: "shell.html", locator: "https://example.org/shell.html", profile: { format: { format: "html" } } };
  shell.capture.content_type = "text/html";
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screen(r.ctx), { doc: shell, title: "The shell", locator: shell.locator, project: "" });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 300));
  const session = `sess-${Math.random().toString(16).slice(2)}`;
  captureOf(r.ctx).saveCaptureSession({ session, locator: shell.locator, primarySha: shell.capture.sha256, primaryFile: shell.file, base: shell.locator,
    state: { opened_by: "member:ann", queue: [], render_pending: { body: {} } } });
  const added = [];
  const env = { ...r.env, STORE: { idFromName: (n) => n, get: () => ({ fetch: async (req) => { added.push(new URL(req.url ?? req)); return new Response(JSON.stringify({ ok: true, result: { ok: true } })); } }) } };
  return { ...r, session, env, added };
}

test("R124 (G43; K4651): an owed render of a 1 MiB CSV whose door reading is too large to embed is filed (not refused for its size), and its reading is made or owed, never left unread with no ledger row; the provenance file is under promotion's inline bound", async () => {
  const r = await owingCsv();
  const bytes = oneMegCsv();
  r.objects.set(`bio/captures/${hex(bytes)}`, bytes);
  const document = csvDoc(bytes);
  /* the door's read of it, as `readUploaded` makes it: the real extraction read, its reading and units on the document */
  const read = await extractionOf(r.ctx).read(document, { storeName: "bio", env: r.env });
  const withReading = { ...document, reading: read.reading, ...(read.text_units ? { text_units: read.text_units } : {}),
                        ...(read.text_units_over_bound ? { text_units_over_bound: read.text_units_over_bound } : {}) };
  const out = await deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: withReading }, session: r.session });
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  const prov = recordOf(r.ctx).readFile(out.bundleId, "data/provenance.json");
  assert.ok(prov && typeof prov.text === "string", "the provenance file is stored inline");
  assert.ok(utf8(prov.text) <= INLINE_MAX, `provenance file ${utf8(prov.text)} B`);
  const found = extractionOf(r.ctx).readingFor(document.capture.sha256, "class:admin").found === true;
  const owed = r.added.some((u) => u.pathname === "/pendingadd" && u.searchParams.get("sha") === document.capture.sha256) || out.reading_pending === true;
  assert.ok(found || owed, "read now or owed to the ledger, never unread with no row");
});

test("R124 (G43 control): an owed render whose reading fits is filed with it embedded and followed by nothing", async () => {
  const r = await owingCsv();
  const bytes = new TextEncoder().encode("id,amount\n1,2\n3,LASTROWMARK\n");
  r.objects.set(`bio/captures/${hex(bytes)}`, bytes);
  const document = csvDoc(bytes);
  const read = await extractionOf(r.ctx).read(document, { storeName: "bio", env: r.env });
  const withReading = { ...document, reading: read.reading, ...(read.text_units ? { text_units: read.text_units } : {}) };
  const out = await deliverOwedRender({ ctx: r.ctx, env: r.env, storeName: "bio", answer: { ok: true, document: withReading }, session: r.session });
  assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
  assert.equal(out.reading_pending, undefined);
  assert.equal(r.added.length, 0);
});

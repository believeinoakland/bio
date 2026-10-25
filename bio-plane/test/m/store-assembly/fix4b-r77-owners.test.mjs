/* store-assembly's copy of plane's test. plane R77 -> R64, R-SEAM (T51 fix round 4b; B32; K4510): THE LEDGER'S RUN WITH THE REAL OWNERS. Through the assembled store and its alarm (`alarmed-store.mjs`), nothing scripted
   on the owners' side but the outside world: (a) a `subresources` entry whose pending render is finished by acquisition's real `owedRun` and
   delivered by control-plane's real `deliverOwedRender` (the renderer and the network are the stubs), and (b) an `ocr` entry run by extraction's
   real `readHeld({sha, kind: "ocr"})` over a scan with pages left (the OCR member is the stub). Each is red if the ledger dropped the entry and
   green when it ends done. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { member, withEntry, i2, noText, ocrAnswer } from "../extraction/fixture.mjs";
import { PENDING_RETRY_MAX_MS } from "../../../src/store-assembly/pending.mjs";

const hex = (b) => createHash("sha256").update(b).digest("hex");
/* R74: the rows still held as work (owed, or ended for a stated reason); a finished row stays in the job table for its readers */
const rows = (x) => [...x.ctx.storage.sql.exec(`SELECT * FROM keeps_pending WHERE state <> 'finished' ORDER BY registered_at, sha, kind`)];
const WHO = { author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" };
/* a document promoted the way the capture screen files one: its bundle, its provenance, the register (the screen's own composition is screens-intake's, not a use of this module) */
const len = (t) => new TextEncoder().encode(t).length;
async function promoteDoc(ctx, { doc, title }) {
  const minted = recordOf(ctx).allocId("INFO", "2026");
  const id = minted.id, now = "2026-10-22T00:00:00Z";
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
    "content_hash: sha256:" + hex(title), "source:", "  locator: " + JSON.stringify(doc.locator), "  authority: member-entered", "  retrieved: " + now,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1);
  const dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator, sha256: doc.capture.sha256 }] });
  const sha = doc.capture.sha256;
  const done = promotionOf(ctx).promote({ bundleId: id, base: null, snapKey: "20261022T000000_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
    files: [{ path: "bundle.md", text, bytes: len(text), sha256: hex(text) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
            { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }],
    register: [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }], ...WHO });
  return done;
}
const docOf = (bytes, file, format, extra = {}) => ({ file, locator: `https://example.org/${file}`, retrieved: "2026-10-22T00:00:00Z", profile: { format: { format, confidence: "certain", signals: [] } },
  authority_state: "undetermined", authority_basis: "held", origin: { kind: "named_request" },
  capture: { sha256: hex(bytes), bytes: bytes.length, content_type: format === "pdf" ? "application/pdf" : "text/html", method: format === "pdf" ? "upload" : "rendered", grade: "C", actor_class: "member", encoding: "binary" }, ...extra });
async function promoted(x, bucket, bytes, file, format) {
  bucket.held.set(`bio/captures/${hex(bytes)}`, bytes);
  const doc = docOf(bytes, file, format);
  const made = await promoteDoc(x.ctx, { doc, title: file });
  assert.ok(made && made.ok !== false, JSON.stringify(made).slice(0, 300));
  return { doc, bundleId: made.bundleId };
}
const pdf = (text) => ({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: (text.pages || []).length, notes: [] }) });

test("R64 R-SEAM (F9): an `ocr` entry of a 60-page scan runs through extraction's real `readHeld({sha, kind: \"ocr\"})` on the alarm, 24 pages a pass, and ends when no page is left; red at each step if the ledger had dropped it", async () => {
  const bucket = multipartBucket();
  const calls = [];
  const OCR_WORKER = member((b) => { calls.push(b.pages.length); const [first, ...rest] = b.pages; return { ...ocrAnswer([first]), deferred: rest }; });
  const x = await store({ env: { CAPTURES: bucket, OCR_WORKER, INSTANCE_NAME: "town" } });
  const bytes = new TextEncoder().encode("%PDF-1.7 a sixty page scan " + Math.random());
  const { doc } = await promoted(x, bucket, bytes, "scan.pdf", "pdf");
  const d = doc.capture.sha256;
  const unread = () => extractionOf(x.ctx).readingFor(d, "class:admin").unread_pages.length;
  await withEntry(pdf(i2(Array.from({ length: 60 }, (_, p) => ({ page: p, text: "", undetermined: [noText(p)] })))), async () => {
    assert.equal((await x.call(`/pendingadd?kind=reading&sha=${d}`)).ok, true);
    let now = Date.now() + 1000, seen = [];
    for (let i = 0; i < 12 && rows(x).length; i++) {
      await x.s.onAlarm(now);
      const left = extractionOf(x.ctx).readingFor(d, "class:admin");
      seen.push(left ? left.unread_pages.length : null);
      if (rows(x).length) assert.ok(left && left.unread_pages.length > 0 || i < 3, `the entry stays only while work remains (pass ${i}: ${JSON.stringify(rows(x).map((r) => [r.kind, r.last_why]))})`);
      now += PENDING_RETRY_MAX_MS + 1000;
    }
    assert.deepEqual(rows(x), [], `the ledger ends once every page is read (unread by pass: ${seen.join(", ")})`);
  });
  assert.equal(unread(), 0, "every page was read");
  assert.ok(calls.length > 0, "the OCR member was asked");
  assert.equal(extractionOf(x.ctx).unitsOf(d).units.length, 60, "every page is indexed");
  /* control: a member that is down leaves the entry owed, never dropped */
  const down = await store({ env: { CAPTURES: bucket, INSTANCE_NAME: "town", OCR_WORKER: member(() => ({ status: 503, body: { ok: false } })) } });
  const b2 = new TextEncoder().encode("%PDF-1.7 another scan " + Math.random());
  const two = await promoted(down, bucket, b2, "scan2.pdf", "pdf");
  await withEntry(pdf(i2(Array.from({ length: 3 }, (_, p) => ({ page: p, text: "", undetermined: [noText(p)] })))), async () => {
    await down.call(`/pendingadd?kind=reading&sha=${two.doc.capture.sha256}`);
    let at = Date.now() + 1000;
    for (let i = 0; i < 4; i++) { await down.s.onAlarm(at); at += PENDING_RETRY_MAX_MS + 1000; }
  });
  assert.ok(rows(down).length > 0, "a member that stays down leaves work owed");
});

/* The `subresources` seam with control-plane's real `deliverOwedRender` (F5) stays in plane's copy of this test: control-plane is
   later in the order than this module (P4). */

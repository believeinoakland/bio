/* plane R93 (fix round 7, G82; diagnosis-R7-screens.md S4), the platform check L: the plane's own Worker and `Store` booted on workerd by
   `r7-contention.test.mjs` under Miniflare. `Contended` is the plane's `Store` plus debug routes that make what the walker made: `/r7/seed` holds a
   file of a stated kind and size as the capture screen files one (its bytes in R2's `CAPTURES`, its document promoted) and owes its reading to the
   ledger, whose own alarm then reads it; `/r7/state` says what is owed. Every other request is the plane's own door (`Store.fetch`); the Worker is
   the plane's default export, so a cheap read is asked through the real door. */
import { createHash } from "node:crypto";
import { Store } from "../../../src/plane/store.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { MEASURED_CSV_TEXT_BOUND_BYTES } from "../../../src/csv-reader/index.mjs";
export { default } from "../../../src/plane/index.mjs";

const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
const hex = (b) => createHash("sha256").update(b).digest("hex");
const len = (t) => new TextEncoder().encode(t).length;

/* the bytes of each case (the shapes the walker's complaint and the earlier rounds' probes use) */
function csv(total) {
  const out = [Buffer.from("id,name,amount,note\n")]; let n = 20, i = 0, buf = [];
  for (; n < total; i++) { const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"\n`; buf.push(r); n += r.length; if (buf.length === 2000) { out.push(Buffer.from(buf.join(""))); buf = []; } }
  buf.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"\n`); out.push(Buffer.from(buf.join("")));
  return new Uint8Array(Buffer.concat(out));
}
const CASES = {
  csvmax: () => ({ bytes: csv(MEASURED_CSV_TEXT_BOUND_BYTES - 8192), file: "table.csv", type: "text/csv", format: "csv" }),
  csv2: () => ({ bytes: csv(2 * 1048576), file: "small.csv", type: "text/csv", format: "csv" }),
  csv12: () => ({ bytes: csv(12 * 1048576), file: "table.csv", type: "text/csv", format: "csv" }),
  /* a PDF is made by the test (`synthPdf` draws random padding, which workerd's getRandomValues bounds to 64 KiB) and handed in as the request's body */
  pdf21: (bytes) => ({ bytes, file: "big.pdf", type: "application/pdf", format: "pdf" }),
};

export class Contended extends Store {
  #real = null;
  async fetch(req) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/r7/")) return super.fetch(req);
    const ctx = this.ctx, step = url.pathname.slice(4), q = (k) => url.searchParams.get(k);
    if (step === "seed") {
      const c = CASES[q("case")](req.method === "POST" ? new Uint8Array(await req.arrayBuffer()) : null);
      const sha = hex(c.bytes), bytes = c.bytes.length;
      await this.env.CAPTURES.put(`bio/captures/${sha}`, c.bytes);
      const now = "2026-10-22T00:00:00Z", title = c.file;
      const document = { file: c.file, locator: "https://example.org/" + c.file, retrieved: now, profile: { format: { format: c.format, confidence: "certain", signals: [] } },
        authority_state: "undetermined", authority_basis: "held", origin: { kind: "named_request" },
        capture: { sha256: sha, bytes, content_type: c.type, method: "upload", grade: "C", actor_class: "member", encoding: "binary" } };
      const id = recordOf(ctx).allocId("INFO", "2026").id;
      const md = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
        "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
        "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(title), "source:", "  locator: " + JSON.stringify(document.locator), "  authority: member-entered", "  retrieved: " + now,
        "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
      const prov = JSON.stringify({ documents: [document] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes, locator: document.locator, sha256: sha }] });
      const pr = promotionOf(ctx).promote({ bundleId: id, base: null, snapKey: "20261022T000000_" + hex(id).slice(0, 8),
        meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
        files: [{ path: "bundle.md", text: md, bytes: len(md), sha256: hex(md) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
                { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: document.file, blobSha: sha, sha256: sha, bytes }],
        register: [{ sha256: sha, path: document.file, encoding: "binary", bytes }], author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" });
      if (!pr || pr.ok !== true) return json({ error: "the document was refused", pr }, 500);
      return json({ sha, bytes, id });
    }
    if (step === "stub") {
      /* the control: the reading owner answers at once (`more` five times, then read), so what is measured is the plane's own consumer and the alarm, with no read's compute */
      let n = 0;
      this.#real ??= extractionOf(ctx).readHeld;
      // fixtures-own: synthetic the control's reading owner answers at once (five pieces, then read) so that what is measured is the plane's own consumer and the alarm; the content of the answers is not asserted
      extractionOf(ctx).readHeld = async () => (++n < 6 ? { ok: true, more: true, read: true, detail: { piece: n } } : { ok: true, read: true });
      return json({ stubbed: true });
    }
    if (step === "ocr") {
      /* an `ocr` row whose owner awaits the OCR member (a service binding): what R91's `wait_ms` meters on the real binding */
      this.#real ??= extractionOf(ctx).readHeld;
      // fixtures-own: synthetic the owner of an `ocr` row awaits the OCR member's real binding for one page: what is metered is the ledger's `wait_ms` on that binding, not what the reader answers
      extractionOf(ctx).readHeld = async ({ env }) => { const r = await env.OCR_WORKER.fetch("http://ocr/page/1"); await r.text(); return { ok: true, read: true }; };
      await pendingOf(ctx).owe({ kind: "ocr", sha: q("sha") });
      return json({ at: Date.now() });
    }
    if (step === "real") { if (this.#real) extractionOf(ctx).readHeld = this.#real; return json({ real: true }); }
    if (step === "owe") { const r = await pendingOf(ctx).owe({ kind: "reading", sha: q("sha") }); return json({ at: Date.now(), r }); }
    if (step === "state") {
      return json({ pending: pendingOf(ctx).list(), last: pendingOf(ctx).ledgerLast({ sha: q("sha") }), now: Date.now() });
    }
    return json({ error: "no such step" }, 404);
  }
}

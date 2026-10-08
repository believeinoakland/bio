/* plane R18 (T39; N806, K2333, K2383): at publication's creation of `case-carriage`, its receipt listener is registered
   with the plane's one `provenance` instance and its member documents' queue and copies are declared to purge, before
   the first request; `scheduler` reaches that same instance, with the evidence bucket and the object's namespace, for
   its `document-copy` consumer (answering under `doccopy`) and its `onCopyWork` notice. Each module's own behaviour is
   its own tests'; these check only the composition, through the plane's interface: construction over a storage and
   the alarm. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store, storage, Store } from "./fixture.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { caseCarriageOf, obscuredKey } from "../../../src/case-carriage/index.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { sha } from "../provenance/fixture.mjs";

const NOW = Date.parse("2026-10-08T12:00:00Z");
/* A one-page PDF showing "Hello" whose document information names who made it, so doc-clean rewrites it (its R6). */
function memberPdf() {
  const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    null, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Author (A Member) /Creator (An App) >>"];
  const ops = "BT /F1 12 Tf 20 150 Td (Hello) Tj ET";
  objs[3] = `<< /Length ${ops.length} >>\nstream\n${ops}\nendstream`;
  let out = "%PDF-1.7\n";
  const at = objs.map((o, i) => { const off = out.length; out += `${i + 1} 0 obj\n${o}\nendobj\n`; return off; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + at.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
const queued = (x) => [...x.ctx.storage.sql.exec(`SELECT capture FROM document_copy_queue ORDER BY capture`)].map((r) => r.capture);
let n = 0;
/* A receipt through the plane's one provenance (its R13), as an acquisition, a knock or an unpack records it. */
const receipt = (x, captureSha, via) =>
  provenanceOf(x.ctx).recordReceipt({ addressNorm: `e.org/t39-${++n}`, captureSha, retrieved: new Date(NOW).toISOString(), via });

/* One object over a fresh storage, its namespace `namespace` (null: an object with no known name, `bio`, R2). */
async function built({ namespace = null, env = {} } = {}) {
  const st = storage();
  if (namespace) st.ctx.id = { equals: (m) => m === namespace, toString: () => namespace };
  const s = new Store(st.ctx, { STORE: { idFromName: (m) => m }, ...env });
  for (const b of st.blocked) await b;
  return { s, ctx: st.ctx };
}

test("R18 (T39): after construction, before any request, a receipt that is not a fetch queues its capture in case-carriage's document_copy_queue, through the plane's one provenance; a `direct` receipt queues nothing", async () => {
  const x = await store();
  assert.deepEqual(queued(x), [], "nothing queued at boot");
  const knock = sha("a member's file, by a knock"), cut = sha("a file cut from a member's archive");
  const fetched = sha("a page this copy fetched");
  receipt(x, knock, "doorbell");
  receipt(x, cut, "unpacked");
  receipt(x, fetched, "direct");
  assert.deepEqual(queued(x), [knock, cut].sort(), "each receipt that is not a fetch queued once");
  receipt(x, knock, "doorbell");
  assert.deepEqual(queued(x), [knock, cut].sort(), "a second receipt adds no row");
  /* the queue is case-carriage's, as that one instance answers it (R16) */
  assert.equal(caseCarriageOf(x.ctx).documentCopy(knock).state, "pending");
  assert.equal(caseCarriageOf(x.ctx).documentCopy(fetched).state, "public", "the direct receipt: carried as captured");
  /* negative control: only `direct`, on a fresh object, queues nothing at all */
  const y = await store();
  receipt(y, sha("another fetched page"), "direct");
  assert.deepEqual(queued(y), []);
});

test("R18 (T39): the scheduler reaches the same case-carriage instance: its onCopyWork notice is registered at boot (a second registration as `scheduler` is refused) and document-copy is among its consumers", async () => {
  const x = await store();
  const cc = caseCarriageOf(x.ctx);
  assert.ok(schedulerOf(x.ctx).consumers().includes("document-copy"), schedulerOf(x.ctx).consumers().join());
  assert.deepEqual(schedulerOf(x.ctx).faults(), [], "its onCopyWork registration was taken");
  const again = cc.onCopyWork("scheduler", () => null);
  assert.equal(again.ok, false, JSON.stringify(again));
  assert.equal(again.code ?? again.reason, "LISTENER_DECLARED", JSON.stringify(again));
  /* negative control: a module that never registered may */
  assert.equal(cc.onCopyWork("zz-probe", () => null).ok, true);
});

test("R18 (T39): with `CAPTURES` bound and a member PDF queued, one onAlarm answers doccopy with copied: 1, and the copy lies under <namespace>/obscured/<sha> in that bucket; with no bucket bound it answers DOCUMENT_COPY_NO_STORE", async () => {
  for (const namespace of [null, "scratch"]) {
    const ns = namespace || "bio";
    const CAPTURES = bucketStandIn();
    const x = await built({ namespace, env: { CAPTURES } });
    const bytes = memberPdf(), original = sha(bytes);
    await CAPTURES.put(`${ns}/captures/${original}`, bytes);
    receipt(x, original, "doorbell");
    assert.deepEqual(queued(x), [original], ns);
    const r = await x.s.onAlarm(NOW);
    assert.deepEqual(r.doccopy, { ok: true, copied: 1, clean: 0, public: 0, refused: 0, failed: 0, remaining: 0 }, `${ns}: ${JSON.stringify(r.doccopy)}`);
    const d = caseCarriageOf(x.ctx).documentCopy(original);
    assert.equal(d.state, "copy", JSON.stringify(d));
    assert.match(d.copy ?? "", /^[0-9a-f]{64}$/);
    assert.notEqual(d.copy, original, "a rewritten copy, not the original");
    const held = CAPTURES.held.get(obscuredKey(ns, d.copy));
    assert.ok(held, `the copy is held at ${obscuredKey(ns, d.copy)}`);
    assert.equal(obscuredKey(ns, d.copy), `${ns}/obscured/${d.copy}`);
    assert.equal(sha(held.bytes), d.copy);
    assert.equal(held.opts.customMetadata.original, original, "labelled derived, naming its original");
    assert.ok(CAPTURES.held.get(`${ns}/captures/${original}`).bytes.equals(bytes), "the original is unchanged");
    assert.deepEqual(queued(x), [], "nothing left queued");
  }
  /* negative control: no evidence bucket bound, the consumer's answer is case-carriage's refusal and nothing is derived */
  const bare = await built();
  const s = sha("a member's file with nowhere to be copied from");
  receipt(bare, s, "doorbell");
  const r = await bare.s.onAlarm(NOW);
  assert.deepEqual([r.doccopy?.ok, r.doccopy?.code], [false, "DOCUMENT_COPY_NO_STORE"], JSON.stringify(r.doccopy));
  assert.equal(caseCarriageOf(bare.ctx).documentCopy(s).state, "pending");
});

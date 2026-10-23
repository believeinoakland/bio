/* reading-pipeline G82 (fix round 7), the worker `r7-contention.test.mjs` boots on workerd under Miniflare: this module's `read`, run by
   the request that asks for a tick, over a capture held in an R2 bucket and read as record-core's `evidenceStore()` hands it (the digest under
   the prefix, a ranged `get` honoured), and a cheap request that does nothing. Both run on the one thread of the isolate, as the plane's object's
   do: a cheap request waits for the longest stretch of a tick that gives the thread back no earlier. */
import { read } from "../../../src/reading-pipeline/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
registerDoctypes(registerDoctype);

const PREFIX = "bio/captures/";
let served = 0;   /* the bytes the store has handed out */
const json = (v, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });
export default {
  async fetch(req, env) {
    const u = new URL(req.url), q = (k) => u.searchParams.get(k);
    if (u.pathname === "/cheap") return json({ ok: true });
    if (u.pathname === "/put") { const bytes = await req.arrayBuffer(); await env.CAPTURES.put(PREFIX + q("sha"), bytes); return json({ ok: true, bytes: bytes.byteLength }); }
    if (u.pathname === "/tick") {
      const sha = q("sha"), bytes = Number(q("bytes")), kind = q("kind");
      const evidence = { get: async (d, o) => { const r = await env.CAPTURES.get(PREFIX + d, o); if (r) served += o && o.range ? Math.min(o.range.length, r.size - o.range.offset) : r.size; return r; },
                         head: (d) => env.CAPTURES.head(PREFIX + d) };
      const before = served;
      const ct = kind === "csv" ? "text/csv" : kind === "pdf" ? "application/pdf" : "text/plain";
      const format = kind === "text" ? "undetermined" : kind;
      const document = { file: "x", locator: "https://example.org/x", retrieved: "2026-10-22T00:00:00Z",
        profile: { profiled_from_text: kind !== "pdf", format: { format, confidence: "certain", signals: [] } },
        provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
        capture: { sha256: sha, bytes, content_type: ct, transport: { http_headers: [] } } };
      const made = await read(document, { evidence, env: {}, storeName: "bio", cursor: q("cursor") || null, unitsBudget: 512 * 1024 });
      return json({ served: served - before, more: made.more ?? null, cursor: made.cursor ?? null, units: (made.text_units || []).length, words: made.piece ? made.piece.words : null,
                    failure: made.reading ? (made.reading.failure ?? null) : null, refused: made.refused ?? null });
    }
    return json({ error: "no such route" }, 404);
  },
};

/* pdf-worker — the first member of the function-specific Worker fleet (I6).
 *
 * WHY THIS EXISTS. The plane stays a lean control/record Worker. `unpdf`
 * (pdf.js) is heavy and cannot live in the plane: adding it to the plane's
 * module graph broke 21 miniflare suites, because a bare npm specifier does not
 * resolve in the plane's un-bundled source (MEASUREMENTS.md, 2026-07-31). So the
 * dependency-laden Tier-2 text path moves into THIS dedicated Worker, which the
 * plane calls over a service binding. A fleet, not a monolith.
 *
 * WHAT IT DOES. Given a capture sha and a store namespace, it reads the captured
 * bytes FROM R2 ITSELF (the `CAPTURES` read binding — never handed the bytes,
 * because the document too large to hold in the plane is exactly the document
 * this exists for, I6) and returns the record's I2 structure+text shape — the
 * record's own vocabulary, never a pdf.js object (fleet rule 1). Tier 2 handles
 * the residue Tier 1 cannot decode: CID / no-/ToUnicode fonts, and permission-
 * only ENCRYPTED PDFs (pdf.js decrypts an empty-user-password PDF transparently;
 * CPDF-5).
 *
 * WHAT IT MUST NOT DO (fleet rules 2/3, I6):
 *   - WRITE ANYTHING. No register row, no provenance, no capture, no task. It
 *     returns derived structure and the plane decides what it means; a hop a
 *     component can hand us is a hop a component can invent (D-112). It holds no
 *     STORE (Durable Object) binding, so it structurally CANNOT write the record,
 *     and it never calls .put/.delete on R2 (asserted in the suite + a hygiene
 *     source scan).
 *   - Hold a `PUBLISHED` binding. `CAPTURES` read is the whole of its need; every
 *     Worker inside the private fence must stay named and minimal.
 *   - Be reached by anything but the plane. It has no member-facing surface and
 *     no token classes; the plane's op layer is the authorisation boundary.
 *
 * It versions and deploys SEPARATELY (fleet rule 4): a verification must
 * establish which build ANSWERED for the member as well as the plane — so
 * `GET /version` exists, added by CPDF-9 (IC-33). Until then that rule was
 * UNVERIFIABLE here: nothing on this member's wire named its build, while
 * `wrangler.jsonc` had carried `vars.VERSION` since the member was written and
 * no handler ever read it. D-108 is what that costs — a byte-identical
 * verification of 0.52.0 followed seconds later by `/version` answering 0.51.0,
 * one component out and with no endpoint to ask.
 */

// pdf.js (unpdf) calls Math.sumPrecise, a TC39 Stage-4 proposal present on the
// Workers runtime (workerd) but NOT on node v26.5.0 — the exact
// `Math.sumPrecise is not a function` a CPDF-5 oracle hit running pdf.js in
// node. Guarded so it only defines the function where the runtime lacks it; on
// workerd (where this Worker actually runs) the native one is used. This
// neutralises the runtime artifact the CPDF-5 heed named, in either runtime.
if (typeof Math.sumPrecise !== "function") {
  Math.sumPrecise = (values) => { let s = 0; for (const v of values) s += v; return s; };
}

import { getDocumentProxy, extractText } from "unpdf";
import { extractPdfStructure } from "../../bio-plane/src/pdfstructure.mjs";

/* The member's surface, declared for the fleet-coverage instrument to read the
 * same way it reads the plane's OPS table (scripts/coverage.mjs, D-117). Hand it
 * a capture, get back the I2 structure+text shape — and ask it which build is
 * answering.
 *
 * `mutating` is a property of THIS WORKER and must be `false` on every row: fleet
 * rule 2, a member ASSERTS nothing. That is a `--strict` gate rather than a
 * convention (coverage.mjs, VF-3's gate 4), and `version` is a GET that reads one
 * env var, so it could not be anything else. */
export const SURFACE = {
  structure: { method: "POST", mutating: false },
  version:   { method: "GET",  mutating: false },
};

/* The Tier-2 envelope. pdf.js pulls the WHOLE document into memory and expands
 * it several-fold, so a document over this size is declined rather than risking
 * the Worker memory ceiling — and it is declined HONESTLY: the text field comes
 * back `undetermined` (reason "over_envelope"), never silently truncated (I6).
 * PROVISIONAL: this is a conservative safety envelope, NOT a measured OOM
 * threshold. Every Tier-2-REQUIRED document CPDF-5 measured is ≤3.2 MB, so 16 MB
 * covers them ~5x over; the measured Worker-memory limit for pdf.js is CPDF-1's
 * gated follow-on and will refine this. Overridable via env for testing/tuning. */
const DEFAULT_MAX_PDF_BYTES = 16 * 1024 * 1024;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

function overEnvelopeText(bytes, limit) {
  const marker = { page: null, reason: "over_envelope", font: null, codes: "", count: 0, bytes, limit };
  return { document: "", pages: [], undetermined: [marker], counts: { chars: 0, undetermined: 1 } };
}

/* unpdf/pdf.js text, reshaped into the RECORD's terms (fleet rule 1): the same
 * `text` shape Tier 1 emits, not pdf.js's. A page pdf.js recovered nothing for
 * is a no-text-layer (scanned/image) page — OCR territory neither tier provides,
 * NAMED as undetermined rather than returned as a silent blank. */
async function tier2Text(bytes) {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  const perPage = Array.isArray(text) ? text : [text];
  const pages = [];
  const undetermined = [];
  for (let i = 0; i < perPage.length; i++) {
    const pageText = perPage[i] || "";
    const u = [];
    if (pageText.trim().length === 0) {
      const marker = { page: i, reason: "no_text_layer", font: null, codes: "", count: 0 };
      u.push(marker);
      undetermined.push(marker);
    }
    pages.push({ page: i, text: pageText, undetermined: u });
  }
  const document = pages.map((p) => p.text).filter((t) => t.length).join("\n");
  return { document, pages, undetermined, counts: { chars: document.length, undetermined: undetermined.length } };
}

async function handleStructure(req, env) {
  if (typeof env.CAPTURES?.get !== "function")
    return json({ ok: false, reason: "R2_NOT_CONFIGURED" }, 503);

  const body = await req.json().catch(() => null);
  const sha = typeof body?.capture_sha === "string" ? body.capture_sha.toLowerCase() : "";
  const store = typeof body?.store === "string" ? body.store : "";
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, reason: "BAD_SHA", detail: "capture_sha must be 64 lowercase hex" }, 400);
  if (!store || !/^[a-z0-9_-]+$/i.test(store))
    return json({ ok: false, reason: "BAD_STORE", detail: "store must be a namespace token" }, 400);

  // I1 §2: the R2 key shape, promoted here from documentation to a load-bearing
  // dependency with a second consumer. READ ONLY — never head/put/delete.
  const obj = await env.CAPTURES.get(`${store}/captures/${sha}`);
  if (!obj) return json({ ok: false, reason: "NOT_FOUND", capture_sha: sha, store }, 404);
  const bytes = new Uint8Array(await obj.arrayBuffer());

  // The full I2 baseline (links + structure) from the shared pure-JS extractor.
  const structure = await extractPdfStructure(bytes);
  if (!structure.ok) return json(structure, 422); // NOT_A_PDF / NOT_BYTES — stated, not faked.

  const max = Number(env.MAX_PDF_BYTES) || DEFAULT_MAX_PDF_BYTES;
  if (bytes.length > max) {
    structure.text = overEnvelopeText(bytes.length, max);
    structure.tier = 1;
    structure.notes = [...structure.notes, "tier2_declined_over_envelope"];
    return json(structure);
  }

  try {
    structure.text = await tier2Text(bytes);
    structure.tier = 2;
  } catch (e) {
    // Tier 2 itself failed (corruption, a runtime artifact): SAY so, keep the
    // structure, do not crash and do not invent text.
    structure.text = {
      document: "", pages: [],
      undetermined: [{ page: null, reason: "tier2_extraction_error", font: null, codes: "", count: 0 }],
      counts: { chars: 0, undetermined: 1 },
    };
    structure.tier = 1;
    structure.notes = [...structure.notes, `tier2_error:${String(e && e.message || e).slice(0, 80)}`];
  }
  return json(structure);
}

/* Fleet rule 4: each member versions and rolls out on its own, so "a deploy
   verified is not a build serving" (D-108) has a second face — the plane can be
   current while the sibling it calls is still serving the previous build, and
   that window is invisible to both. This is how this member answers the question
   about ITSELF, and it is deliberately the same three lines and the same shape
   `agent-worker` answers with (I8): two members answering one question two ways
   is how a rollout gate learns to special-case its fleet.
   The value comes from `env.VERSION` (wrangler.jsonc `vars`), so what it reports
   is the build that is RUNNING and never a constant compiled in beside it. */
function handleVersion(env) {
  return json({ ok: true, name: "pdf-worker", version: env.VERSION || "0.0.0" });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "structure" || path === "")) {
      return handleStructure(req, env);
    }
    return json({ ok: false, reason: "UNKNOWN", detail: "POST /structure or GET /version only" }, 404);
  },
};

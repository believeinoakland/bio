/* extraction — the op handlers the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index`.
 * Routing, authentication and the response envelope stay the control plane's: `json`, `storeSilent`,
 * `storageAbsent`, `requiredArgument`, `doAnswer` (the one reader of a Durable Object's envelope, N247, REC-52) and
 * `storeRefusal` (control-plane R23's relay of the store's own refusal) are passed in, with the stamps it decided (the
 * caller class, whether a member session asked and its capabilities, the viewer, the author). `store` is the Durable
 * Object stub the op is scoped to. */
import { withReading } from "../capture/ops.mjs";

/* R64 (N339, N349, K445): the store's answer is read through the plane's `doAnswer` when the caller hands it, as
   capture's handlers take it; the plane's door (`src/plane/door.mjs`) hands it. A caller that hands none (as
   legacy-index did, before it retired) has the envelope read here by control-plane R23's and R25's rule, so the
   answer is the same either way: `{answered, result, reply}` for the store's `{ok: true, result}`;
   `{answered: false, refused: true, reply}` for the store's own refusal (`ok: false` below 500); otherwise no answer
   (a silence is never read as an empty result, REC-52), carrying the correlation id of the store's own
   `STORE_INTERNAL_ERROR` when it gave one, and nothing else of the store's envelope (its `error` is a stack, R30). */
const CORRELATION = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
async function readAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string"
    && CORRELATION.test(out.correlation) ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}
async function ask(store, path, init, doAnswer) {
  const res = (async () => store.fetch(path, init))();
  return typeof doAnswer === "function" ? doAnswer(res) : readAnswer(res);
}

/* R64: the answer composed for a caller that hands no `json` (as legacy-index's call of `acquireReadingOp` did, before
   it retired; the plane's door hands its own): the store's envelope as the plane's `json` spells it, without the plane's catalogue
   decoration, which only the plane holds. */
const jsonAnswer = (o, status = 200) => new Response(JSON.stringify(o, null, 1), {
  status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });

/* R64 (K421, K444): what was read that is not an answer. The store's own refusal is relayed with its status, code and
   sentence, through the caller's `storeRefusal` when it hands one, else as the same answer composed here
   (`json(reply.body, reply.status)`, which is what `storeRefusal` answers); a reply that is no answer, or an answer
   with no result, is `storeSilent(op)` with the correlation id when the store gave one. Null for an answer. */
function unanswered(r, op, { json, storeSilent, storeRefusal }) {
  if (r && r.refused && r.reply)
    return typeof storeRefusal === "function" ? storeRefusal(r) : json(r.reply.body, r.reply.status);
  if (!r || !r.answered || !r.result) return storeSilent(op, r ? r.correlation : undefined);
  return null;
}

/** R31–R35: op=pdfstructure. The digest must be 64 lowercase hex (the required-argument refusal) and the instance
 *  must hold evidence storage (the storage-absent refusal); the rest is the Durable Object's (`pdfStructure`),
 *  handed the control plane's stamps. */
export async function pdfStructureOp(url, env, store, { json, storeSilent, storeRefusal, doAnswer, storageAbsent,
                                                        requiredArgument, cls, session, caps, viewer, author, storeName }) {
  const op = "pdfstructure";
  if (typeof env.CAPTURES?.get !== "function") return storageAbsent(op, "R2 is not configured on this instance");
  const sha = (url.searchParams.get("sha256") || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, ...requiredArgument("pdfstructure", "sha256", "<64 lowercase hex>",
      "pdfstructure requires sha256=<64 lowercase hex>") }, 400);
  const q = new URLSearchParams({ sha256: sha, cls: cls || "", session: session ? "1" : "0",
    caps: [...(caps || [])].join(","), viewer: viewer || "", author: author || "", store: storeName || "bio" });
  if (url.searchParams.has("ocr")) q.set("ocr", url.searchParams.get("ocr") ?? "");
  const r = await ask(store, `http://x/pdfstructure?${q}`, undefined, doAnswer);
  return unanswered(r, op, { json, storeSilent, storeRefusal }) ?? json(r.result.body, r.result.status);
}

/* The ops `extractionOp` answers, which the control plane routes here (host-governor's `GOVERNOR_OPS` precedent). */
export const EXTRACTION_OPS = Object.freeze(["pdfstructure"]);

/** The control plane's dispatch of this module's op (legacy-index map §4.4, K649 (7)): `op=pdfstructure` (R31–R35),
 *  moved out of `src/index.mjs` with the stamps it hands, which stay the control plane's (the caller class, whether
 *  a member session asked and its capabilities, the viewer, the author). `getStore` answers the Durable Object stub
 *  the op is scoped to. Answers the op's response, or null for an op that is not this module's. */
export async function extractionOp(op, url, env, getStore, stamps) {
  if (op === "pdfstructure") return pdfStructureOp(url, env, getStore(), stamps);
  return null;
}

/** R1 (K72 (8)): the acquire op's reading. `answer` is capture's acquire answer; the Durable Object reads the
 *  document it filed (`read`) and the answer carries the reading and its text units on the document, as it always
 *  did. Answers `{response}` (the store's refusal relayed, or a silence, R64) or `{body}`. `json` defaults to the
 *  plane's JSON answer for a caller that hands none (as legacy-index did, before it retired; the plane's door hands
 *  its own). */
export async function acquireReadingOp(answer, store, { json = jsonAnswer, storeSilent, storeRefusal, doAnswer, storeName }) {
  const r = await ask(store, `http://x/extractread?store=${encodeURIComponent(storeName || "bio")}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ document: answer.document }) }, doAnswer);
  const relayed = unanswered(r, "acquire", { json, storeSilent, storeRefusal });
  if (relayed) return { response: relayed };
  const out = r.result;
  const body = withReading(answer, { reading: out.reading, textUnits: out.text_units || null,
                                     textUnitsOverBound: out.text_units_over_bound || 0 });
  /* D-724 (reading-pipeline R15): the units left out, named, beside the count. */
  if (out.text_units_skipped) body.document.text_units_skipped = out.text_units_skipped;
  return { body };
}

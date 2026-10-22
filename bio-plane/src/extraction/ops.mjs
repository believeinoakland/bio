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
async function ask(store, path, init, doAnswer, probe = null) {
  /* `probe`, when handed, learns what the call itself did (its status, or the error it threw), which the reader of the
     envelope below does not keep: `readAnswer` and the plane's `doAnswer` both reduce a failed call to no answer. */
  const res = (async () => {
    try { const r = await store.fetch(path, init); if (probe) probe.status = typeof r.status === "number" ? r.status : null; return r; }
    catch (e) { if (probe) probe.error = e; throw e; }
  })();
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

/** R71: op=pagetranscribe, refused here as R31 refuses: no evidence storage (the storage-absent refusal), a digest
 *  that is not 64 lowercase hex (the required-argument refusal); the rest is the Durable Object's (`pageTranscribe`),
 *  handed the control plane's stamps and the project the act names as its payer (`project`, when given). (T50; N1082;
 *  R72) The door's `trace` and `memberRef` are stamps beside `author`, forwarded to the store only when each is a
 *  non-empty string, and never read from the url or a body. Exported for control-plane R74 to route (L11); not in
 *  `EXTRACTION_OPS`, so the plane's door does not reach it before op-declarations R47 declares it (K2635). */
export async function pageTranscribeOp(url, env, store, { json, storeSilent, storeRefusal, doAnswer, storageAbsent,
                                                          requiredArgument, cls, session, caps, viewer, author, storeName,
                                                          trace, memberRef }) {
  const op = "pagetranscribe";
  if (typeof env.CAPTURES?.get !== "function") return storageAbsent(op, "R2 is not configured on this instance");
  const sha = (url.searchParams.get("sha256") || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, ...requiredArgument(op, "sha256", "<64 lowercase hex>",
      "pagetranscribe requires sha256=<64 lowercase hex>") }, 400);
  const q = new URLSearchParams({ sha256: sha, cls: cls || "", session: session ? "1" : "0",
    caps: [...(caps || [])].join(","), viewer: viewer || "", author: author || "", store: storeName || "bio" });
  const project = url.searchParams.get("project");
  if (project) q.set("project", project);
  if (typeof trace === "string" && trace) q.set("trace", trace);
  if (typeof memberRef === "string" && memberRef) q.set("memberRef", memberRef);
  const r = await ask(store, `http://x/pagetranscribe?${q}`, undefined, doAnswer);
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
 *  did. Answers `{response}` (the store's own refusal relayed, R64) or `{body}`. `json` defaults to the plane's JSON
 *  answer for a caller that hands none (as legacy-index did, before it retired; the plane's door hands its own).
 *  (R87; fix round 6, G4; K4428) The capture is already kept when this runs, so a call that comes back as no answer (the
 *  stub threw, or the reply was no envelope) never turns the act into a failed one: the body is the acquire answer with
 *  `reading_pending: true`, which the door reads off the answer to owe the reading to the ledger, and `diag`, `{name,
 *  message, status, correlation?}` of the failed call (not drawn; read by walks), also written once with `console.error`,
 *  so the deploy names the cause. */
export async function acquireReadingOp(answer, store, { json = jsonAnswer, storeSilent, storeRefusal, doAnswer, storeName }) {
  const probe = {};
  const r = await ask(store, `http://x/extractread?store=${encodeURIComponent(storeName || "bio")}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ document: answer.document }) }, doAnswer, probe);
  if (r && r.refused && r.reply) return { response: unanswered(r, "acquire", { json, storeSilent, storeRefusal }) };
  if (!r || !r.answered || !r.result) return { body: { ...answer, reading_pending: true, diag: deferralDiag(answer, probe, r) } };
  const out = r.result;
  const body = withReading(answer, { reading: out.reading, textUnits: out.text_units || null,
                                     textUnitsOverBound: out.text_units_over_bound || 0 });
  /* D-724 (reading-pipeline R15): the units left out, named, beside the count. */
  if (out.text_units_skipped) body.document.text_units_skipped = out.text_units_skipped;
  return { body };
}

/* R87: what the deploy needs to name a failed read's cause: the error's name and message, the reply's status, the store's
   own correlation id when it gave one. One log line; nothing of the store's envelope (its `error` is a stack, R30). */
function deferralDiag(answer, probe, r) {
  const e = probe.error;
  const diag = { name: e && typeof e.name === "string" ? e.name : (e ? "Error" : "NoAnswer"),
                 message: String(e && e.message ? e.message : e ? e : "the store's reply was no answer").slice(0, 300),
                 status: Number.isInteger(probe.status) ? probe.status : null,
                 ...(r && r.correlation ? { correlation: r.correlation } : {}) };
  const sha = answer && answer.document && answer.document.capture ? answer.document.capture.sha256 : null;
  try { console.error(JSON.stringify({ event: "extraction.acquire_read_unanswered", sha: typeof sha === "string" ? sha : null, ...diag })); }
  catch { /* the log is where it can be written; the capture stands */ }
  return diag;
}

/* extraction — the op handlers the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index`.
 * Routing, authentication and the response envelope stay the control plane's: `json`, `storeSilent`,
 * `storageAbsent` and `requiredArgument` are passed in, with the stamps it decided (the caller class, whether a
 * member session asked and its capabilities, the viewer, the author). `store` is the Durable Object stub the op is
 * scoped to. */
import { withReading } from "../capture/ops.mjs";

/* `{answered, result}` from a Durable Object answer: a body that is not the store's `{ok: true, result}` is not an
   answer, and a silence is never read as an empty result (REC-52). */
async function ask(store, path, init) {
  try {
    const out = await (await store.fetch(path, init)).json();
    return out && out.ok === true ? { answered: true, result: out.result } : { answered: false };
  } catch { return { answered: false }; }
}

/** R31–R35: op=pdfstructure. The digest must be 64 lowercase hex (the required-argument refusal) and the instance
 *  must hold evidence storage (the storage-absent refusal); the rest is the Durable Object's (`pdfStructure`),
 *  handed the control plane's stamps. */
export async function pdfStructureOp(url, env, store, { json, storeSilent, storageAbsent, requiredArgument, cls,
                                                        session, caps, viewer, author, storeName }) {
  const op = "pdfstructure";
  if (typeof env.CAPTURES?.get !== "function") return storageAbsent(op, "R2 is not configured on this instance");
  const sha = (url.searchParams.get("sha256") || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, ...requiredArgument("pdfstructure", "sha256", "<64 lowercase hex>",
      "pdfstructure requires sha256=<64 lowercase hex>") }, 400);
  const q = new URLSearchParams({ sha256: sha, cls: cls || "", session: session ? "1" : "0",
    caps: [...(caps || [])].join(","), viewer: viewer || "", author: author || "", store: storeName || "bio" });
  if (url.searchParams.has("ocr")) q.set("ocr", url.searchParams.get("ocr") ?? "");
  const r = await ask(store, `http://x/pdfstructure?${q}`);
  if (!r.answered || !r.result) return storeSilent(op);
  return json(r.result.body, r.result.status);
}

/** R1 (K72 (8)): the acquire op's reading. `answer` is capture's acquire answer; the Durable Object reads the
 *  document it filed (`read`) and the answer carries the reading and its text units on the document, as it always
 *  did. Answers `{response}` (a silence) or `{body}`. */
export async function acquireReadingOp(answer, store, { storeSilent, storeName }) {
  const r = await ask(store, `http://x/extractread?store=${encodeURIComponent(storeName || "bio")}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ document: answer.document }) });
  if (!r.answered || !r.result) return { response: storeSilent("acquire") };
  const out = r.result;
  const body = withReading(answer, { reading: out.reading, textUnits: out.text_units || null,
                                     textUnitsOverBound: out.text_units_over_bound || 0 });
  /* D-724 (R16): the units left out, named, beside the count. */
  if (out.text_units_skipped) body.document.text_units_skipped = out.text_units_skipped;
  return { body };
}

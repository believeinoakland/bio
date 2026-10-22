/* A stand-in for `extraction`'s `acquireReadingOp` as the plane's door hands it to `captureOp` (`readAcquired`), written to that
   op's contract (extraction R1, R87): it asks the stub it is handed for `extractread`; the store's own refusal is relayed as
   `{response}`; a call that threw, or whose reply is no envelope, is `{body}`, the acquire answer with `reading_pending: true` and a
   `diag` `{name, message, status}` of the failed call; otherwise `{body}` is the answer with the reading placed on the document.
   Capture cannot import `extraction` (it is later in the order), so its tests hand this in. */
export function readerFor({ doAnswer, storeSilent, storeName = "bio" }) {
  return async (answer, stub) => {
    const probe = {};
    const res = (async () => {
      try { const r = await stub.fetch(`http://x/extractread?store=${encodeURIComponent(storeName)}`, { method: "POST", body: JSON.stringify({ document: answer.document }) });
            probe.status = typeof r.status === "number" ? r.status : null; return r; }
      catch (e) { probe.error = e; throw e; }
    })();
    const r = await doAnswer(res);
    if (r && r.refused && r.reply) return { response: storeSilent("acquire") };
    if (!r || !r.answered || !r.result) {
      const e = probe.error;
      return { body: { ...answer, reading_pending: true,
        diag: { name: e && typeof e.name === "string" ? e.name : (e ? "Error" : "NoAnswer"), message: String(e && e.message ? e.message : e ? e : "STORE_REPLY_NOT_AN_ANSWER").slice(0, 300), status: Number.isInteger(probe.status) ? probe.status : null } } };
    }
    const { file, locator, retrieved, profile, ...rest } = answer.document;
    return { body: { ...answer, document: { file, locator, retrieved, profile, reading: r.result.reading, ...(r.result.text_units ? { text_units: r.result.text_units } : {}), ...rest } } };
  };
}

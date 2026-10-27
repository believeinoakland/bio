/* R90 (T49; N1137) — THE RECORD ID A LEG NAMES, BESIDE THE ADDRESS.
 *
 * `documentHoldings` (agent-harness) counts each held document once by the `address_norm` the plane answers
 * with, which is the document's identity but not an id a suggested leg's `target` can take (`run-productions`
 * R1, R9: a leg names the held record and the capture the run read). Compose's facts carried only the address, so
 * a model could not name the leg an accepted reading rests on and `conclude` was refused NO_BASIS (C-33.40).
 *
 * This reads the same `resolved` list `documentHoldings` read, never the model's words, and adds to each held
 * document the record id and capture it can be cited by:
 *   - `record_id`   the bundle id of the version the run read: a version a citation named (the newest such in
 *                   the chain), else the newest version the plane listed;
 *   - `capture_sha` that version's capture, for the leg's `extent_capture`.
 * An item in no chain that was cited as a held bundle carries that bundle as its `record_id`; one cited as a
 * bare address has none, and says so with `null` rather than guessing. A document whose read was refused is
 * UNDETERMINED (R21) and gets no id: nothing is invented for it. The input is not changed. */

const isStr = (x) => typeof x === "string" && x.length > 0;

export function withRecordIds(holdings, resolved) {
  if (!holdings || typeof holdings !== "object") return holdings;
  const list = Array.isArray(resolved) ? resolved : [];

  /* address_norm -> the version the run read, from the chains the plane answered. */
  const readOf = new Map();
  for (const r of list) {
    if (!r || typeof r !== "object" || r.refused) continue;
    const chain = r.chain && typeof r.chain === "object" ? r.chain : null;
    const key = chain && isStr(chain.address_norm) ? chain.address_norm : "";
    const versions = (Array.isArray(chain?.versions) ? chain.versions : []).filter((v) => v && isStr(v.bundle_id));
    if (!key || versions.length < 1) continue;
    const cited = r.bundle ? versions.filter((v) => v.bundle_id === r.bundle) : [];
    const pick = (cited.length ? cited : versions).at(-1);
    const seen = readOf.get(key);
    /* Another citation of the same document: a cited version outranks an uncited newest. */
    if (!seen || (cited.length && !seen.cited))
      readOf.set(key, { record_id: pick.bundle_id, capture_sha: pick.capture_sha ?? null, cited: cited.length > 0 });
  }

  /* citation -> the held bundle it named, for the items no chain holds. */
  const bundleOf = new Map();
  for (const r of list)
    if (r && typeof r === "object" && !r.refused && r.bundle && isStr(r.citation)) bundleOf.set(r.citation, r.bundle);

  return {
    ...holdings,
    by_document: (Array.isArray(holdings.by_document) ? holdings.by_document : []).map((d) => {
      const got = readOf.get(d?.address_norm);
      return { ...d, record_id: got ? got.record_id : null, capture_sha: got ? got.capture_sha : null };
    }),
    unchained_items: (Array.isArray(holdings.unchained_items) ? holdings.unchained_items : []).map((u) => ({
      ...u, record_id: bundleOf.get(u?.citation) ?? null,
    })),
  };
}

/* acquisition — `readRange` (R113; fix round 9, G127d; K4833; plan 2c item 3): A CAPTURE'S BYTES BY ITS WHOLE DIGEST.
 *
 * `readRange(store, sha, offset, length)` answers the bytes `[offset, offset + length)` of the whole whose digest is `sha`,
 * whether the evidence store holds the whole as one object (read by a ranged get) or only its parts (the parts
 * `provenance.partsOf(sha)` names, R78, each read by a ranged get across the seam). The caller never learns which; no other
 * module resolves parts. A range reaching past the end answers the bytes that exist, one starting at or past it an empty array;
 * a refusal or a store failure is `{ok: false, reason}`, never a throw. The store is the capture store handed in (as every act
 * of this module takes it): its `core.evidenceStore()` and its `provenance`. */

const HEX64 = /^[0-9a-f]{64}$/;
const whole = (n) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;

/** R113: the digest `sha` names (64 lowercase hex; a `sha:` prefix and case ignored), else null. Pure. */
export const wholeShaOf = (sha) => {
  if (typeof sha !== "string") return null;
  const s = sha.trim().replace(/^sha:/i, "").toLowerCase();
  return HEX64.test(s) ? s : null;
};

const bytesOf = async (obj) => new Uint8Array(await obj.arrayBuffer());

/** R113, R101: a range reader over an evidence store `ev` for the whole `s` (64 lowercase hex): the whole object when it is held (asked ONCE, the first read), else the
 *  stated `parts` (`[{sha256, bytes}]` in order; null names none) read across the seam. The one reader behind `readRange` and `profileOf`'s judgement of a large
 *  capture's format, which makes several reads of one capture and so asks whether it is held once. The reader answers the bytes, or `{ok: false, reason}`; it never
 *  throws. */
export function rangeReaderOf(ev, s, parts) {
  let whole = undefined;   // the held whole's size, or null when it is not held whole
  return async (offset, length) => {
    try {
      if (whole === undefined) {
        const head = await ev.head(s);
        whole = head && Number.isSafeInteger(Number(head.size)) ? Number(head.size) : null;
      }
      /* held whole: one ranged read of the object */
      if (whole !== null) {
        if (offset >= whole || length === 0) return new Uint8Array(0);
        const take = Math.min(length, whole - offset);
        const o = await ev.get(s, { range: { offset, length: take } });
        if (!o) return { ok: false, reason: "NOT_HELD" };
        return (await bytesOf(o)).subarray(0, take);
      }
      /* held in parts: the parts the register names, read across the seam */
      if (!Array.isArray(parts) || !parts.length) return { ok: false, reason: "NOT_HELD" };
      const size = parts.reduce((n, x) => n + x.bytes, 0);
      if (offset >= size || length === 0) return new Uint8Array(0);
      const take = Math.min(length, size - offset);
      const out = new Uint8Array(take);
      let at = 0, start = 0;
      for (const part of parts) {
        const end = start + part.bytes;
        const from = Math.max(offset, start), to = Math.min(offset + take, end);
        if (to > from) {
          const o = await ev.get(part.sha256, { range: { offset: from - start, length: to - from } });
          if (!o) return { ok: false, reason: "NOT_HELD" };
          const b = (await bytesOf(o)).subarray(0, to - from);
          if (b.length !== to - from) return { ok: false, reason: "PART_SHORT" };
          out.set(b, at); at += b.length;
        }
        start = end;
        if (start >= offset + take) break;
      }
      return out;
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e).slice(0, 120) || "STORE_FAILED" };
    }
  };
}

export async function readRange(store, sha, offset, length) {
  try {
    const s = wholeShaOf(sha);
    if (!s) return { ok: false, reason: "BAD_SHA" };
    if (!whole(offset) || !whole(length)) return { ok: false, reason: "BAD_RANGE" };
    const core = store && store.core;
    const ev = core && typeof core.evidenceStore === "function" ? core.evidenceStore() : null;
    if (!ev) return { ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED" };
    /* the parts are asked of the register only when the whole is not held */
    const held = await ev.head(s).catch(() => null);
    const p = store && store.provenance;
    const parts = !held && p && typeof p.partsOf === "function" ? p.partsOf(s) : null;
    return await rangeReaderOf(ev, s, parts)(offset, length);
  } catch (e) {
    return { ok: false, reason: String(e && e.message || e).slice(0, 120) || "STORE_FAILED" };
  }
}

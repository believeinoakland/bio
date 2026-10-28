/* The container's answer, as a stream of records (R3, R5): each record is a 4-byte big-endian header length, a JSON
 * header, then `header.bytes` payload bytes (0 when it carries none). Members and frames are read one at a time as they
 * arrive, so an archive is never held whole on the caller's side. The container writes with `encodeRecord`; the caller
 * reads with `readRecords`. A stream cut short ends with a stated `cut` record, never a throw. Pure. */

const enc = new TextEncoder(), dec = new TextDecoder();

export function encodeRecord(header, payload = null) {
  const h = enc.encode(JSON.stringify({ ...header, bytes: payload ? payload.length : 0 }));
  const head = new Uint8Array(4 + h.length);
  new DataView(head.buffer).setUint32(0, h.length);
  head.set(h, 4);
  return payload ? [head, payload] : [head];
}

/* An async iterable of { header, payload } over a ReadableStream or an async iterable of Uint8Array chunks; a payload
 * is delivered whole, as one Uint8Array. A header larger than `headerMax` bytes, or a stream that ends mid-record,
 * yields { header: { type: 'cut' } } and ends. */
export async function* readRecords(body, { headerMax = 1 << 20 } = {}) {
  const chunks = [];
  let have = 0;
  const take = (n) => {
    const out = new Uint8Array(n);
    let filled = 0;
    while (filled < n) {
      const c = chunks[0];
      const k = Math.min(c.length, n - filled);
      out.set(c.subarray(0, k), filled);
      filled += k;
      if (k === c.length) chunks.shift(); else chunks[0] = c.subarray(k);
    }
    have -= n;
    return out;
  };
  let want = null;
  const iterator = body?.getReader ? readerIterable(body.getReader()) : body;
  for await (const chunk of iterator) {
    if (!chunk?.length) continue;
    chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    have += chunk.length;
    for (;;) {
      if (!want) {
        if (have < 4) break;
        const n = new DataView(take(4).buffer).getUint32(0);
        if (n > headerMax) { yield { header: { type: 'cut' } }; return; }
        want = { n, header: null };
      }
      if (!want.header) {
        if (have < want.n) break;
        let header;
        try { header = JSON.parse(dec.decode(take(want.n))); } catch { yield { header: { type: 'cut' } }; return; }
        want.header = header;
      }
      const size = Number(want.header.bytes) || 0;
      if (have < size) break;
      const payload = size ? take(size) : null;
      const out = { header: want.header, payload };
      want = null;
      yield out;
    }
  }
  if (want || have) yield { header: { type: 'cut' } };
}

async function* readerIterable(reader) {
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally { reader.releaseLock?.(); }
}

/* The group's bucket, as this member uses it: targets read as copies (R1, R2), from `captures/` or, for a target
 * with `area: "derived"`, from `derived/` (a safe view or safe copy file-safety stored, N753), and the only writes it makes, under
 * `clamav/` (R6) and `reputation/` (R26) (R11). Every write and delete in the module goes through `writeObject` and
 * `deleteObject`; a test reads every storage call in the sources and finds no other. */
import { createHash } from 'node:crypto';
import { NAMESPACES, SCAN_MAX_BYTES } from './limits.mjs';

const HEX64 = /^[0-9a-f]{64}$/;
const WRITABLE = /^(clamav|reputation)\/[A-Za-z0-9._/-]+$/;

/** R2: the areas a target is read from: a capture's (no `area`), or a derived copy's (`area: "derived"`). */
export const AREAS = Object.freeze({ captures: 'captures', derived: 'derived' });
export const objectKey = (store, area, sha) => `${store}/${AREAS[area]}/${sha}`;
export const captureKey = (store, sha) => objectKey(store, 'captures', sha);

/** R1: a target's shape, or null when it is malformed (`BAD_TARGET`): any `area` but `"derived"`, when one is stated. */
export function normaliseTarget(t) {
  if (!t || typeof t !== 'object' || Array.isArray(t) || !HEX64.test(t.capture_sha || '')) return null;
  if (t.area !== undefined && t.area !== 'derived') return null;
  const area = t.area === 'derived' ? 'derived' : 'captures';
  if (t.parts === null || t.parts === undefined) return { capture_sha: t.capture_sha, parts: null, area };
  if (!Array.isArray(t.parts) || t.parts.length === 0) return null;
  for (const p of t.parts) {
    if (!p || typeof p !== 'object' || !HEX64.test(p.sha256 || '') || !Number.isSafeInteger(p.bytes) || p.bytes < 0) return null;
  }
  return { capture_sha: t.capture_sha, parts: t.parts.map((p) => ({ sha256: p.sha256, bytes: p.bytes })), area };
}

export const knownStore = (s) => typeof s === 'string' && NAMESPACES.includes(s);

/** R2, before anything is read: the objects exist and the whole is within `max`. `{ok, bytes}` or `{ok:false, reason}`. */
export async function sizeTarget(bucket, store, t, max = SCAN_MAX_BYTES) {
  if (t.parts) {
    const declared = t.parts.reduce((n, p) => n + p.bytes, 0);
    if (declared > max) return { ok: false, reason: 'TOO_LARGE' };
    let total = 0;
    for (const p of t.parts) {
      const h = await bucket.head(objectKey(store, t.area, p.sha256));
      if (!h) return { ok: false, reason: 'NOT_FOUND' };
      if (h.size !== p.bytes) return { ok: false, reason: 'DIGEST_MISMATCH' };
      total += h.size;
    }
    return { ok: true, bytes: total };
  }
  const h = await bucket.head(objectKey(store, t.area, t.capture_sha));
  if (!h) return { ok: false, reason: 'NOT_FOUND' };
  if (h.size > max) return { ok: false, reason: 'TOO_LARGE' };
  return { ok: true, bytes: h.size };
}

/** R2: the target's bytes as one stream, each part read in order and its own digest checked, the whole's SHA-256
 *  checked against `capture_sha`. `outcome` settles when the stream ends: `{ok:true}` or `{ok:false, reason}`; on a
 *  mismatch the stream errors, so nothing downstream takes the bytes as whole. */
export function targetStream(bucket, store, t) {
  const keys = t.parts ? t.parts.map((p) => [objectKey(store, t.area, p.sha256), p.sha256]) : [[objectKey(store, t.area, t.capture_sha), null]];
  const whole = createHash('sha256');
  let settle;
  const outcome = new Promise((r) => { settle = r; });
  let i = 0, reader = null, part = null;
  const fail = (controller, reason) => {
    settle({ ok: false, reason });
    controller.error(new Error(reason));
  };
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        for (;;) {
          if (!reader) {
            if (i >= keys.length) {
              if (whole.digest('hex') !== t.capture_sha) return fail(controller, 'DIGEST_MISMATCH');
              settle({ ok: true });
              return controller.close();
            }
            const obj = await bucket.get(keys[i][0]);
            if (!obj) return fail(controller, 'NOT_FOUND');
            reader = obj.body.getReader();
            part = keys[i][1] ? createHash('sha256') : null;
          }
          const { done, value } = await reader.read();
          if (done) {
            if (part && part.digest('hex') !== keys[i][1]) return fail(controller, 'DIGEST_MISMATCH');
            reader = null; i++;
            continue;
          }
          const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
          whole.update(chunk);
          if (part) part.update(chunk);
          controller.enqueue(chunk);
          return;
        }
      } catch (e) {
        return fail(controller, 'NOT_FOUND');
      }
    },
    cancel() { settle({ ok: false, reason: 'CANCELLED' }); if (reader) reader.cancel().catch(() => {}); },
  });
  return { stream, outcome };
}

/** R2's whole check over a target, reading it once and keeping nothing. */
export async function verifyTarget(bucket, store, t) {
  const { stream, outcome } = targetStream(bucket, store, t);
  const r = stream.getReader();
  try { for (;;) { const { done } = await r.read(); if (done) break; } } catch { /* the outcome names it */ }
  return outcome;
}

/** The target's bytes in memory, for a transport that needs them whole (ICAP's chunked body, R30). */
export async function targetBytes(bucket, store, t) {
  const { stream, outcome } = targetStream(bucket, store, t);
  let buf;
  try { buf = new Uint8Array(await new Response(stream).arrayBuffer()); } catch { buf = null; }
  const o = await outcome;
  return o.ok ? { ok: true, bytes: buf } : o;
}

/** R11: the module's one write. Refuses any key outside `clamav/` and `reputation/`. */
export async function writeObject(bucket, key, body, options) {
  if (!WRITABLE.test(key) || key.includes('..')) throw new Error(`file-scanner never writes ${key}`);
  return bucket.put(key, body, options);
}

/** R11: the module's one delete, under the same two prefixes. */
export async function deleteObject(bucket, key) {
  if (!WRITABLE.test(key) || key.includes('..')) throw new Error(`file-scanner never deletes ${key}`);
  return bucket.delete(key);
}

/** A JSON object of the module's own, or null. */
export async function readJson(bucket, key) {
  const o = await bucket.get(key);
  if (!o) return null;
  try { return JSON.parse(await o.text()); } catch { return null; }
}

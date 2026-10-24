/* The allocation counter the bounds tests share (image-codecs R12; R-CLOCK: a count, never a time). Not product code. */

/** Run `fn`; answer what it returned or threw, and the most bytes any one typed array or buffer asked for while it ran
 *  (the constructors are wrapped for the length of the call, then put back). */
export function peakAllocation(fn) {
  const names = ["ArrayBuffer", "Uint8Array", "Int8Array", "Uint16Array", "Int16Array", "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "Uint8ClampedArray"];
  const saved = new Map(), counted = { peak: 0 };
  for (const n of names) {
    const Orig = globalThis[n];
    saved.set(n, Orig);
    globalThis[n] = new Proxy(Orig, {
      construct(target, args, newTarget) {
        if (typeof args[0] === "number") counted.peak = Math.max(counted.peak, args[0] * (Orig.BYTES_PER_ELEMENT ?? 1));
        return Reflect.construct(target, args, newTarget);
      },
    });
  }
  let result, error;
  try { result = fn(); } catch (e) { error = e; } finally { for (const [n, O] of saved) globalThis[n] = O; }
  return { result, error, peak: counted.peak };
}

/** The same for an async `fn`: the wrap holds until its promise settles. */
export async function peakAllocationAsync(fn) {
  const names = ["ArrayBuffer", "Uint8Array", "Int8Array", "Uint16Array", "Int16Array", "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "Uint8ClampedArray"];
  const saved = new Map(), counted = { peak: 0 };
  for (const n of names) {
    const Orig = globalThis[n];
    saved.set(n, Orig);
    globalThis[n] = new Proxy(Orig, {
      construct(target, args, newTarget) {
        if (typeof args[0] === "number") counted.peak = Math.max(counted.peak, args[0] * (Orig.BYTES_PER_ELEMENT ?? 1));
        return Reflect.construct(target, args, newTarget);
      },
    });
  }
  let result, error;
  try { result = await fn(); } catch (e) { error = e; } finally { for (const [n, O] of saved) globalThis[n] = O; }
  return { result, error, peak: counted.peak };
}

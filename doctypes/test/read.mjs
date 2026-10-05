/* Test helpers: a content-type registry holding a given set of types, and a reading
 * made the way docprofile's `readText` makes one (flatten, locate, recognise, also,
 * parse), so a test can read through THIS module's types, or through any other set,
 * with the same mechanics. Nothing here is the module under test. */
import { makeRegistry, identify } from "../../site-profiles/index.mjs";
import { flattenText, makeLocator } from "../../docprofile/readtext.mjs";

export function registryOf(types) {
  const r = makeRegistry();
  for (const t of types) r.register(t);
  return r;
}

/** `doctypeFor` over a registry: the first CERTAIN, else the best, else the fallback,
 *  and `also` from every other non-fallback type's own detect. */
export function typeFor(reg, ctx) {
  const r = reg.recognise(ctx);
  const also = [];
  for (const m of reg.all()) {
    if (m.key === r.member.key || m.fallback === true) continue;
    let d;
    try { d = m.detect(ctx) || { match: false }; } catch (e) { also.push({ key: m.key, error: String(e.message || e) }); continue; }
    if (d.match) also.push({ key: m.key, confidence: d.confidence });
  }
  return { type: r.member, confidence: r.confidence, signals: r.signals, also };
}

/** A reading of `supplied` (a string or I2's text shape) through `reg`'s types. */
export function readWith(reg, supplied, ctx = {}) {
  const flat = flattenText(supplied);
  const dctx = { ...ctx, text: flat.text };
  const stack = identify(dctx);
  const dt = typeFor(reg, { ...dctx, handler: stack.handler, kind: stack.kind });
  const locate = makeLocator(flat.segments);
  const alsoSatisfies = () => dt.also.map((x) => x.key);
  const parsed = dt.type.parse({ ...dctx, handler: stack.handler, at: ctx.at || null, locate, alsoSatisfies }) || {};
  return { text: flat.text, doctype: dt, parsed, locate };
}

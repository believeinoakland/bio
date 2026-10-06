/* The CONTENT-TYPE axis: a second registry of the SAME shape as the stack axis.
 *
 * Both axes are `makeRegistry()` instances of the one recogniser engine (site-profiles'
 * recogniser.mjs), which is the whole claim of framework §4: a third axis is a third
 * `makeRegistry()`, not a third loop.
 *
 * THIS MODULE HOLDS NO CONTENT TYPE (R36; T34-8, N549). The registry starts EMPTY and
 * holds only what a composer registers through the seam below: `plane` wires
 * `doctypes`' `registerDoctypes(registerDoctype)` and the other readers' registrations,
 * `generic` (the fallback) last. The seven copies this module kept, and their
 * registration by default (K1513 (3)), were deleted once `plane` registered `doctypes`'
 * types (T33-90). Which types exist, what each one reads and the measurements each was
 * written from are `doctypes`' (its R1) and the other readers'; this file is the seam,
 * the order and the `also` pass.
 *
 * The rule the deleted types were written under holds for whatever is registered here:
 * a content type invented from what a document probably looks like is a type that
 * reassures people about things it has not understood. With no type recognising a
 * document, the registered fallback reports change without describing it, which is
 * noisy and honest; with no fallback registered at all, NO_TYPE below says so. */
import { makeRegistry } from "../../site-profiles/index.mjs";
import { CONTRACT } from "./index.mjs";

/* THE SEAM (T33-12; K1513; T34-8). `registerDoctype` (exported further down) is how a
   composer registers types: a type whose key is already held REPLACES it in its own
   slot, so a re-registration never moves the load-bearing order; a new key is
   appended. `recognise` walks in registration order and BREAKS ON THE FIRST CERTAIN
   detection, so the order a composer registers in is the order that decides (R4).

   A member carrying `fallback: true` (doctypes' generic) is what the registry answers
   when nothing detects -- same mechanism as the conservative handler on the stack
   axis. */
const members = [];
let types = makeRegistry();
const rebuild = () => { types = makeRegistry(); for (const m of members) types.register(m); };

/* THE NO-TYPE ANSWER (K1513 (1)): what `doctypeFor` gives when no registered type
   carries `fallback: true` (none registered, or the fallback replaced by a type that is
   not one). It is not a content type: it detects, reads and judges nothing, so
   `readText` states that it has no reader and `assess` claims nothing about what changed
   (R13). R4's "always returns a type" holds, and R35's no says which no. */
export const NO_TYPE = Object.freeze({
  key: "unregistered", label: "no content type is registered", version: 0, fallback: true,
  contract: CONTRACT.SUBSTANCE,
});

/** Register one content type into the seam. A type whose `key` is held already
 *  replaces it in its slot (the order is load-bearing, R4); a new key is appended. A
 *  member with no string `key` or no `detect` function is refused, stated, never
 *  thrown. Returns `{ok:true, key, replaced}` or `{ok:false, why}`. */
export function registerDoctype(type) {
  if (!type || typeof type !== "object" || typeof type.key !== "string" || !type.key)
    return { ok: false, why: "a content type is registered by its key, and this one carries no key" };
  if (typeof type.detect !== "function")
    return { ok: false, why: `the ${type.key} content type has no detect function, so it could never recognise a document` };
  const i = members.findIndex((m) => m.key === type.key);
  if (i >= 0) members[i] = type; else members.push(type);
  rebuild();
  return { ok: true, key: type.key, replaced: i >= 0 };
}

export function doctypes() { return types.all(); }

/** Identify what KIND of content this is, independently of the stack that served it.
 *  A thin wrapper over the shared registry; always returns something.
 *
 *  FW-18 / M0-32 — `also`: WHAT ELSE THIS DOCUMENT IS. The census measured that 52 of
 *  600 sampled documents (about one in twelve) satisfy MORE THAN ONE class, so a
 *  content type that assumes one document is one kind mis-describes one document in
 *  twelve. The engine cannot say so: `recognise` stops at the first CERTAIN detection,
 *  so its `considered` list is truncated at whatever won and a second class is
 *  invisible. That break is the STACK axis's behaviour too and is not this axis's to
 *  move, so the multi-class fact is produced here instead, by asking every registered
 *  type independently.
 *
 *  IT CHANGES NO VERDICT. `type`, `confidence`, `signals` and `considered` are exactly
 *  what they were; `also` is a new field beside them, and the plane's profile stamp
 *  reads named fields rather than the whole object, so nothing downstream moves. A
 *  reader is handed the same list through `ctx.alsoSatisfies` so it can state the fact
 *  in the reading's own facts, which is the surface a member actually sees.
 *
 *  A type whose `detect` THROWS is reported as such rather than silently dropped: a
 *  recogniser that cannot answer is a different fact from one that answered no. */
export function doctypeFor(ctx) {
  const r = types.recognise(ctx);
  /* The shared engine's last resort is the LAST member when none is a fallback; here
     an unrecognised document is never read as a type that did not recognise it. */
  if (!r.matched) r.member = types.all().find((m) => m.fallback === true) || NO_TYPE;
  const out = { type: r.member, confidence: r.confidence, signals: r.signals, considered: r.considered,
                also: alsoFor(ctx, r.member.key) };
  /* A "no" says which no (R35): nothing recognised, and so the registered fallback's reading. */
  if (r.member === NO_TYPE)
    out.why = "no content type is registered to recognise documents, so this one is not read as any type: "
            + "nothing is read from it and what changes in it is not described";
  else if (!r.matched)
    out.why = "no registered content type recognised this document, so it is read as a document of no "
            + "recognised type: any substantive difference is reported and not described";
  return out;
}

/** Every registered type OTHER than `selfKey` whose own `detect` matches this text.
 *  Exported for the suite and for callers that want the fact without a full profile. */
export function alsoFor(ctx, selfKey) {
  const out = [];
  for (const m of types.all()) {
    if (m.key === selfKey || m.fallback === true) continue;
    let d;
    try { d = m.detect(ctx) || { match: false }; }
    catch (e) { out.push({ key: m.key, confidence: null, signals: [], error: String((e && e.message) || e) }); continue; }
    if (d.match) out.push({ key: m.key, confidence: d.confidence, signals: d.signals || [] });
  }
  return out;
}

export * from "./index.mjs";

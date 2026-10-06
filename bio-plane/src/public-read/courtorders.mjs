/* public-read — A COURT ORDER'S EFFECT ON WHAT IS SERVED (requirements: `build/requirements/public-read.md` R28; K1480,
 * K1493, K1522; `publication` R62, `docket` R25). Pure: given an edition's stamps (`publication.stampsOf`, in order) and
 * the edition's items (each a hash with the paths it is known by), it answers what the public read withholds and the
 * order each withholding rests on. Nothing here deletes anything: the edition and its bytes stay held (`publication`
 * R24); only what is served changes, and every withholding is stated where the bytes would have appeared.
 *
 * THE EFFECTS, in the stamps' order (BOB's reading, J1 (5)):
 *   remove   with no `parts`, the whole edition; with `parts`, those parts. Never ended by a later stamp.
 *   seal     the parts it names (with none, the whole edition); an `unseal` naming a part ends its sealing.
 *   unseal   ends a `seal`'s withholding for the parts it names (with none, every sealing of the edition); never a
 *            `remove`'s.
 *   redact   withholds nothing: the redacted text is a later edition's, and past editions stand as they were (K1493).
 *            It is served as a stamp beside the edition.
 * A part is matched by a path the edition's item is known by (its path in the manifest, a finding's id) or by its
 * SHA-256. */

/* R28: the sentence stated wherever withheld bytes would have appeared. */
export const WITHHELD_SENTENCE = "a court order this group complied with keeps these contents from being served here; "
  + "the order and the record entry that names it are public (`court_orders`), and nothing was deleted";

const EFFECTS = new Set(["remove", "redact", "seal", "unseal"]);
const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x) : []);

/** R28: one stamp as served: its effect, the parts it names (null for none), when it was stamped, and its docket entry,
 *  linked as `docket`'s withdrawal entry is (R20): its `seq`, the docket's id for it (`<case>#<seq>`), its digest where
 *  the stamp carries one, and the fixed address the case's docket is served at (R21). `entry` may be the entry's seq,
 *  its id, or an object carrying either. */
export function orderOf(caseId, stamp, docketAddress) {
  const e = stamp && stamp.entry;
  const o = e && typeof e === "object" ? e : null;
  let seq = o ? (o.seq ?? null) : typeof e === "number" ? e : null;
  let id = o ? (o.id ?? o.entry ?? null) : typeof e === "string" ? e : null;
  if (seq == null && typeof id === "string" && /#(\d+)$/.test(id)) seq = Number(/#(\d+)$/.exec(id)[1]);
  if (id == null && seq != null) id = `${caseId}#${seq}`;
  const parts = list(stamp && stamp.parts);
  return { effect: stamp && EFFECTS.has(stamp.effect) ? stamp.effect : null,
           parts: parts.length ? parts : null,
           stamped_at: (stamp && stamp.stamped_at) ?? null,
           entry: { seq: seq == null ? null : Number(seq), id: id ?? null, digest: (o && o.digest) ?? stamp?.digest ?? null,
                    docket: docketAddress(caseId) } };
}

/** R28: what an edition's stamps withhold, over its `items` (`[{sha256, paths: [...]}]`). Answers
 *  `{orders, whole, withheld: Map<sha256, order[]>}`: `orders` every stamp as served (`orderOf`), `whole` true when the
 *  edition as a whole is withheld, `withheld` each item's hash withheld, with the orders that withhold it. */
export function withholdingOf(caseId, stamps, items, docketAddress) {
  const orders = (Array.isArray(stamps) ? stamps : []).map((s) => orderOf(caseId, s, docketAddress));
  let removedWhole = null, sealedWhole = null;
  const removed = new Map(), sealed = new Map();
  for (const o of orders) {
    if (o.effect === "remove") {
      if (!o.parts) removedWhole = removedWhole || o;
      else for (const p of o.parts) if (!removed.has(p)) removed.set(p, o);
    } else if (o.effect === "seal") {
      if (!o.parts) sealedWhole = o;
      else for (const p of o.parts) sealed.set(p, o);
    } else if (o.effect === "unseal") {
      if (!o.parts) { sealedWhole = null; sealed.clear(); }
      else for (const p of o.parts) sealed.delete(p);
    }
  }
  const whole = removedWhole || sealedWhole;
  const withheld = new Map();
  for (const it of Array.isArray(items) ? items : []) {
    if (!it || typeof it.sha256 !== "string") continue;
    const keys = [it.sha256, ...list(it.paths)];
    const by = [];
    if (whole) by.push(whole);
    for (const k of keys) {
      for (const m of [removed, sealed]) { const o = m.get(k); if (o && !by.includes(o)) by.push(o); }
    }
    if (!by.length) continue;
    const prev = withheld.get(it.sha256) || [];
    withheld.set(it.sha256, [...prev, ...by.filter((o) => !prev.includes(o))]);
  }
  return { orders, whole: !!whole, withheld };
}

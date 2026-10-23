/* retrieval-browse — the two registrations and the reads they feed (R4, R11; moved from retrieval R76, R86 by T51-29,
 * K3841): `registerRecordedBy` (a later module's read of who recorded a match, called by `findIn`), `registerBrowseMarks`
 * (the one read of a member's watches and the team's flags, called by `browse`), and `entitiesFor` (the registry's name
 * lookup `people` reads). Registered reads run in the modules' total order (`membership` R83). */
import { listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { standardsOf } from "../standards/index.mjs";
import { moneyOf } from "../money/index.mjs";
import { peopleOf } from "../people/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { RECORDED_BY_MODULES } from "./findin.mjs";
import { say } from "./words.mjs";

export class Marks {
  #recordedBy = [];             // R4: {module, fn, seq}
  #browseMarks = null;          // R11: {module, fn}
  #order; #host; #entities; #recorders; #provenance;

  /** `order` is the modules' total order (`MODULE_ORDER` unless a test hands its own); `host` makes `events`, `standards`,
   *  `money`, `people` and `entities` when first asked unless handed (`recorders`, `entities`). */
  constructor({ order = null, host = null, entities = undefined, recorders = null, provenance = undefined } = {}) {
    this.#order = Array.isArray(order) ? order : MODULE_ORDER;
    this.#host = host;
    this.#entities = entities;
    this.#provenance = provenance;
    this.#recorders = new Map(RECORDED_BY_MODULES.map((m) =>
      [m, recorders && typeof recorders === "object" && recorders[m] !== undefined ? recorders[m] : undefined]));
  }

  #rank(m) { const i = this.#order.indexOf(m); return i === -1 ? Infinity : i; }

  /** R4 (N715; K31, K2063): a later module's read by capture and extent, `fn({captureSha, extent?, limit, viewer})`
   *  answering in `events` R49's shape, which R1 calls for every capture a find reads, after the four it names. A
   *  malformed registration, or a second by the same module, is refused by membership's `listenerRefusal` (its R81); the
   *  four R1 names are held already, so none of them registers here. Reads run in the modules' total order. */
  registerRecordedBy(module, fn) {
    const held = [...RECORDED_BY_MODULES.map((m) => ({ module: m })), ...this.#recordedBy];
    const refused = listenerRefusal(held, module, fn);
    if (refused) return refused;
    this.#recordedBy.push({ module, fn, seq: this.#recordedBy.length });
    this.#recordedBy.sort((a, b) => (this.#rank(a.module) - this.#rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R11 (N1092; DEC-238 S23 "A"; K31's pattern, as R4): the one later module (`following`) that holds a member's watches
   *  and the team's second-look flags registers its read once at start: `fn({viewer, only, limit})` answers
   *  `{items, truncated}` (the ids marked) and `fn({viewer, ids})` answers `{watched, flagged}` for those ids. A malformed
   *  registration, or a second whoever makes it (the slot takes one), is refused by membership's `listenerRefusal`. */
  registerBrowseMarks(module, fn) {
    const refused = listenerRefusal(this.#browseMarks, module, fn);
    if (refused) return refused;
    this.#browseMarks = { module, fn };
    return { ok: true, module };
  }

  /** R10, R11: the registered read of marks, or null. */
  browseMarks() { return this.#browseMarks; }

  /** R1, R4: the reads a find calls, in order: `events`, `standards`, `money` and `people`'s `recordedBy`, then each
   *  registered one. `read` is null, with why, for a module whose instance offers none; `registered` says which. */
  recordedReads() {
    const own = RECORDED_BY_MODULES.map((m) => {
      let inst = this.#recorders.get(m);
      if (inst === undefined) {
        inst = null;
        const make = { events: eventsOf, standards: standardsOf, money: moneyOf, people: peopleOf }[m];
        try { if (this.#host) inst = make(this.#host); } catch { inst = null; }
        this.#recorders.set(m, inst);
      }
      if (typeof inst === "function") {
        try { inst = inst(); } catch { inst = null; }
        this.#recorders.set(m, inst);
      }
      return inst && typeof inst.recordedBy === "function"
        ? { module: m, read: (a) => inst.recordedBy(a), registered: false }
        : { module: m, read: null, registered: false,
            why: inst ? say("retrieval.why.offers_recordedby_read", { m }) : say("retrieval.why.reachable", { m }) };
    });
    return [...own, ...this.#recordedBy.map((r) => ({ module: r.module, read: r.fn, registered: true }))];
  }

  /** R2's `people`: entities' name lookup (its R17), the host's own unless a caller handed one; null when none. */
  entitiesFor() {
    if (this.#entities === undefined) {
      this.#entities = null;
      try { if (this.#host) this.#entities = entitiesOf(this.#host); } catch { this.#entities = null; }
    }
    return this.#entities;
  }

  /** R19: provenance's marks on a bundle's register rows (its R73: `whole`, and `part_of` on a part's row), the host's own
   *  instance unless a caller handed one; null when none can be had. */
  provenanceFor() {
    if (this.#provenance === undefined) {
      this.#provenance = null;
      try { if (this.#host) this.#provenance = provenanceOf(this.#host); } catch { this.#provenance = null; }
    }
    return this.#provenance;
  }
}

/* reading-pipeline R25–R27 (T33-23; B1a.4; K1468, D177): the opt-in after-read hook. A later module registers, once,
   at start, a hook for the capture classes it opted into (`onRead`); the module that commits a reading calls
   `afterRead` once the reading's transaction has committed, and each matching hook runs then, one at a time, in the
   modules' total order (`membership.MODULE_ORDER`, its R83). The registry is held in memory, one per storage as every
   listener slot is (K31's pattern; `extractionOf` keys its instances the same way), so this module still owns no
   table and one storage's hooks never run for another's reading. Nothing here is reached from `read` (R27): a reading
   is the same whatever is registered, and a hook's writes are its own module's, in its own transaction, after the
   commit. Moving a hook into the promote transaction waits on M-V4's measured cost (plan T33-T4). */
import { listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";

const isClassList = (v) => Array.isArray(v) && v.length > 0 && v.every((c) => typeof c === "string" && c.length > 0);

const errorText = (e) => {
  try { return String(e && e.message ? e.message : e).slice(0, 200); } catch { return "the hook failed"; }
};

/* Each hook is handed its own copy of the reading, so no hook changes what a later hook, or the caller, holds. */
const copyOf = (reading) => {
  try { return structuredClone(reading); } catch { return reading; }
};

export class ReadHooks {
  #hooks = [];   // {module, fn, classes, rank, seq}

  /** R25: registers, once per module, at start, `fn` for the capture classes `captureClasses` names (a non-empty list
   *  of non-empty strings). Every refusal is membership's `listenerRefusal` (its R81): a malformed registration, an
   *  empty or non-list `captureClasses` among them, `LISTENER_MALFORMED`; a second by the same module
   *  `LISTENER_DECLARED` naming it. A refused registration records nothing. */
  onRead(module, fn, { captureClasses } = {}) {
    const refused = listenerRefusal(this.#hooks, module, isClassList(captureClasses) ? fn : null, { slot: "onRead" });
    if (refused) return refused;
    const i = MODULE_ORDER.indexOf(module);
    this.#hooks.push({ module, fn, classes: [...captureClasses], rank: i === -1 ? Infinity : i, seq: this.#hooks.length });
    this.#hooks.sort((a, b) => (a.rank - b.rank) || (a.seq - b.seq));
    return { ok: true, module, captureClasses: [...captureClasses] };
  }

  /** R26: called by the module that commits a reading, once its transaction has committed (`committed: true`; any
   *  other value runs nothing and answers `{ran: []}`). Each hook whose classes hold `captureClass` is called, one at
   *  a time, in `MODULE_ORDER`, with `{captureSha, captureClass, reading}`; a hook for another class is not. Answers
   *  `{ran, failed}`: `ran` the modules whose hook returned or resolved, `failed` each `{module, error}` whose hook threw
   *  or rejected, which never undoes the reading, stops a later hook, or leaves `afterRead`. Never rejects. */
  async afterRead({ captureSha, captureClass, reading, committed } = {}) {
    if (committed !== true) return { ran: [] };
    const ran = [], failed = [];
    for (const h of [...this.#hooks]) {
      if (!h.classes.includes(captureClass)) continue;
      try {
        await h.fn({ captureSha, captureClass, reading: copyOf(reading) });
        ran.push(h.module);
      } catch (e) {
        failed.push({ module: h.module, error: errorText(e) });
      }
    }
    return { ran, failed };
  }
}

const instances = new WeakMap();

/** The registry of a storage: one `ReadHooks` per `ctx.storage` (or `ctx` itself), as `extractionOf` keys its
 *  instances. A registering module calls `readHooksOf(ctx).onRead(…)` at its start; the committing module calls
 *  `readHooksOf(ctx).afterRead(…)` after its commit. A ctx that is no object has no registry to share and gets a
 *  fresh, empty one. */
export function readHooksOf(ctx) {
  const key = ctx && typeof ctx === "object" && ctx.storage && typeof ctx.storage === "object" ? ctx.storage : ctx;
  if (!key || (typeof key !== "object" && typeof key !== "function")) return new ReadHooks();
  let h = instances.get(key);
  if (!h) { h = new ReadHooks(); instances.set(key, h); }
  return h;
}

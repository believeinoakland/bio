/* accepted-work — the seam through which earlier modules read another group's accepted work (requirements:
 * `build/requirements/accepted-work.md` R1–R7; N522; DEC-96 items 1, 4; DEC-112 (6)).
 *
 * A group's own finding may rest on a finding of another group's case that the group has accepted. That work is held by
 * `case-import`, late in the order, which fills this module's one registration at start (R1). `strength`,
 * `reevaluation`, `basis-versions` and `publication` read it through R2's three reads, and this module refuses, at the
 * promotion of an inquiry, a leg on such a finding unless an acceptance of the named edition is in force (R3, R4).
 *
 * It holds nothing (R5): no table, no grade, no score. What the source published is answered as the source published
 * it, and whether this group accepted it is the registered module's answer, never this one's.
 *
 * SHAPE (K61). `acceptedWorkOf(host, deps)` answers the one instance per host; it registers its check with `promotion`
 * (its R39) when made. `deps.record` and `deps.promotion` may be given (a test's, or the plane's); else each is the
 * host's own. */
import { parseFrontmatter } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { listenerRefusal } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import { ACCEPTED_WORK_CHECKS } from "./checks.mjs";

export { ACCEPTED_WORK_CHECKS };

/** R2: what a read answers when no module has registered (`case-import` is not composed). */
export const ACCEPTED_WORK_ABSENT = "accepted_work_absent";
/** R2: what a read answers when the registered function failed. */
export const ACCEPTED_WORK_UNREADABLE_WHY = "accepted_work_unreadable";

const ABSENT_DETAIL = "no module holding another group's work is registered here, so none can be read";
const UNREADABLE_DETAIL = "the module holding another group's work could not answer";
const DETAIL_MAX = 200;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isThenable = (v) => v !== null && (typeof v === "object" || typeof v === "function") && typeof v.then === "function";
const cut = (s, n) => (s.length > n ? `${s.slice(0, n)}…` : s);

class AcceptedWork {
  #record; #source = null;   // {module, finding, openFlags, withdrawals}: R1's one registration

  constructor({ record } = {}) { this.#record = record; }

  /* ---------------------------------------------------------------- R1: the registration */

  /** R1 (K31): the one registration `case-import` fills at start. Both refusals are `membership`'s (its R81): a
   *  registration missing any of the three functions is malformed; a second, by any module, is declared, naming the
   *  holder. */
  registerAcceptedWork(module, fns) {
    const whole = isObj(fns) && typeof fns.finding === "function" && typeof fns.openFlags === "function"
      && typeof fns.withdrawals === "function";
    const refused = listenerRefusal(this.#source, module, whole ? fns.finding : null);
    if (refused) return refused;
    this.#source = { module, finding: fns.finding, openFlags: fns.openFlags, withdrawals: fns.withdrawals };
    return { ok: true, module };
  }

  /* ---------------------------------------------------------------- R2: the reads */

  /** R2: the registered `finding`'s answer for one imported finding at one edition, as this viewer may see it. */
  acceptedFinding(args) { return this.#read("finding", args, ({ ref, edition, viewer }) => ({ ref, edition, viewer })); }

  /** R2: the registered `openFlags`' answer, the open flags on that edition and on the named finding. */
  openFlagsOn(args) { return this.#read("openFlags", args, ({ ref, edition, viewer }) => ({ ref, edition, viewer })); }

  /** R2: the registered `withdrawals`' answer, a page of acceptance withdrawals in withdrawal order. */
  acceptanceWithdrawals(args) { return this.#read("withdrawals", args, ({ after, limit }) => ({ after, limit })); }

  /* The one read: the registered answer as given; `absent` with none registered; `unreadable` when the function
     throws, or answers a promise (every reader here runs inside a synchronous transaction, so a later answer could
     never be read). The function is handed the read's own fields alone, copied. Writes nothing and never throws. */
  #read(name, given, pick) {
    const src = this.#source;
    if (!src) return { absent: true, reason: ACCEPTED_WORK_ABSENT, detail: ABSENT_DETAIL };
    try {
      const answer = src[name](pick(argsOf(given)));
      if (isThenable(answer)) {
        Promise.resolve(answer).catch(() => {});
        return unreadable(`${src.module} answered later than the read can wait`);
      }
      return answer;
    } catch (e) {
      return unreadable(String(e && e.message ? e.message : e));
    }
  }

  /* ---------------------------------------------------------------- R3: the legs */

  /** R3: for each leg whose target is an imported finding reference, a refusal when the acceptance at the leg's
   *  `target_edition` is not known to be in force. Other legs are not asked. Writes nothing and never throws. */
  acceptedLegRefusals(args) {
    const out = [];
    try {
      const { legs, viewer } = argsOf(args);
      const list = Array.isArray(legs) ? legs : [];
      const asked = new Map();   // one read per (ref, edition) in one call
      list.forEach((leg, i) => {
        const ref = isObj(leg) && typeof leg.target === "string" ? leg.target : null;
        if (!ref || !parseImportedFindingRef(ref)) return;
        const ord = Number.isInteger(leg.ord) ? leg.ord : i;
        const edition = leg.target_edition;
        const key = `${ref}\u0000${typeof edition}\u0000${String(edition)}`;
        if (!asked.has(key)) asked.set(key, this.#judge(ref, edition, viewer));
        const verdict = asked.get(key);
        if (verdict) out.push(legFinding(verdict, ord, ref, edition));
      });
    } catch {
      /* a leg list that cannot be walked is answered with what was judged; the act's own grammar refuses its shape */
    }
    return out;
  }

  /* The refusal code for one (ref, edition), or null when an acceptance of that edition is in force. */
  #judge(ref, edition, viewer) {
    const a = this.acceptedFinding({ ref, edition, viewer });
    /* DEC-49 REGION is-accepted-work-readable */
    if (isObj(a) && (a.absent === true || a.unreadable === true)) return "ACCEPTED_WORK_UNREADABLE";
    if (a !== null && !isObj(a)) return "ACCEPTED_WORK_UNREADABLE";
    /* END DEC-49 REGION is-accepted-work-readable */
    /* DEC-49 REGION is-imported-accepted */
    if (a === null || !isObj(a.acceptance)) return "IMPORTED_NOT_ACCEPTED";
    if (a.edition !== undefined && a.edition !== edition) return "IMPORTED_NOT_ACCEPTED";
    /* END DEC-49 REGION is-imported-accepted */
    return null;
  }

  /* ---------------------------------------------------------------- R4: the promotion check (promotion R39) */

  /** R4: inside the promotion's transaction, before the write. For an inquiry that is not a replay, R3 over each leg
   *  on a ref that is new against the held version, or whose target or `target_edition` changed (keyed by the pair,
   *  never by position: a reordered basis re-points nothing). An unchanged leg is not asked again, so a withdrawal
   *  never refuses an unrelated revision. */
  check(c) {
    if (!isObj(c) || c.replay || c.promotedType !== "inquiry") return null;
    /* `ord` as `inquiry` numbers its legs (its R12): the position among the basis entries that are objects */
    const legs = basisOf(isObj(c.docFm) ? c.docFm : fmOfFiles(c.files)).filter(isObj);
    const held = c.head ? this.#heldPairs(c.bundleId) : new Set();
    const asked = [];
    legs.forEach((leg, ord) => {
      if (typeof leg.target !== "string" || !parseImportedFindingRef(leg.target)) return;
      if (held.has(pairKey(leg))) return;
      asked.push({ ...leg, ord });
    });
    if (!asked.length) return null;
    const viewer = typeof c.author === "string" && c.author ? c.author : (c.writer ?? null);
    const findings = this.acceptedLegRefusals({ legs: asked, viewer });
    if (!findings.length) return null;
    return { ok: false, reason: "BASIS_REFUSED", findings,
             detail: "a leg rests on another group's finding without an acceptance of that edition known to be in force. "
                   + "Nothing was written." };
  }

  /* The (ref, edition) pairs the held version's legs name. A held version that cannot be read holds none, so every
     leg on a ref is asked: the safe side of an unknown. */
  #heldPairs(bundleId) {
    const out = new Set();
    try {
      const f = this.#record.readFile(bundleId, "bundle.md");
      const text = f && typeof f.text === "string" ? f.text : null;
      const fm = text ? parseFrontmatter(text).data : null;
      for (const leg of basisOf(fm))
        if (isObj(leg) && typeof leg.target === "string" && parseImportedFindingRef(leg.target)) out.add(pairKey(leg));
    } catch {
      out.clear();
    }
    return out;
  }
}

function unreadable(why) {
  return { unreadable: true, reason: ACCEPTED_WORK_UNREADABLE_WHY, detail: `${UNREADABLE_DETAIL}: ${cut(why, DETAIL_MAX)}` };
}

/* R3: one finding, as `inquiry` R11 carries them inside BASIS_REFUSED, naming the leg's `ord` and ref. */
function legFinding(code, ord, ref, edition) {
  const row = ACCEPTED_WORK_CHECKS[code];
  const at = Number.isInteger(edition) ? ` at edition ${edition}` : "";
  const detail = code === "IMPORTED_NOT_ACCEPTED"
    ? `basis[${ord}] rests on ${ref}${at}, and no acceptance of that edition is in force for this group`
    : `basis[${ord}] rests on ${ref}${at}, and whether it is accepted could not be read`;
  return { check: row.check, code, severity: "error", translation: row.translation, detail, ord, ref,
           edition: edition === undefined ? null : edition };
}

/* A read's arguments: an object's own fields, else none (a read never throws on what it is handed). */
function argsOf(args) {
  return isObj(args) ? args : {};
}

function basisOf(fm) {
  return isObj(fm) && Array.isArray(fm.basis) ? fm.basis : [];
}

function fmOfFiles(files) {
  const md = Array.isArray(files) ? files.find((f) => f && f.path === "bundle.md") : null;
  return md && typeof md.text === "string" ? parseFrontmatter(md.text).data : null;
}

const pairKey = (leg) => `${leg.target}\u0000${typeof leg.target_edition}\u0000${String(leg.target_edition)}`;

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call. It registers its check with `promotion` (R4; its R39). */
export function acceptedWorkOf(host, deps) {
  let w = instances.get(host);
  if (!w) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const promotion = d.promotion || promotionOf(host, { record });
    w = new AcceptedWork({ record });
    instances.set(host, w);
    promotion.registerStep("accepted-work", { check: (c) => w.check(c) });
  }
  return w;
}

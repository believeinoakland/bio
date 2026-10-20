/* op-declarations R80, R81 (T51 fix round; K4165, K4168): THE OWNERS' DECLARATIONS, held apart from `index.mjs`. An owner
   exports `DECLARED_OPS` beside its ops map, `{op: {classes, machineClasses?, mutating, weight, description, fields?,
   stamps?, needs?}}`; the plane (and the tests, through `test-support`'s collector) hand every owner's to
   `registerDeclaredOps` once, before the first read of any table. This file shapes and checks the rows (the shape, the
   duplicates, the agreement with the hand rows) and answers the pieces `build()` merges; it reads no table of its own,
   no request, store, clock or environment (R7). `weight` and `description` are `op-grades`' and are not read here. */

const CLASSES = Object.freeze(["admin", "member", "probe", "daemon"]);
const STAMPS = Object.freeze(["author", "bodyBy", "by", "country", "member", "owner", "principal", "proposer", "session", "source",
  "viewer"]);
/* `why` is a code for a developer's diagnostic (BAD_CLASSES, BAD_MACHINE_CLASSES, BAD_MUTATING, BAD_STAMPS, BAD_NEEDS,
   BAD_FIELDS, BAD_ROW, NEEDS_MISSING), never a sentence a member reads */
const fail = (op, why) => new TypeError(`op-declarations: ${op}: ${why} (R80)`);
const names = (v) => Array.isArray(v) && v.every((x) => typeof x === "string" && x.length > 0);
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x)) && b.every((x) => a.includes(x));

/* one owner's row for one op, checked and copied: a frozen record the registry keeps, never the owner's own object */
function shape(owner, op, row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) throw fail(op, "BAD_ROW");
  const { classes, machineClasses, mutating, stamps, needs, fields } = row;
  if (classes !== null && !(names(classes) && classes.length > 0 && classes.every((c) => CLASSES.includes(c))))
    throw fail(op, "BAD_CLASSES");
  if (machineClasses !== undefined && !(names(machineClasses) && machineClasses.every((c) => CLASSES.includes(c))))
    throw fail(op, "BAD_MACHINE_CLASSES");
  if (typeof mutating !== "boolean") throw fail(op, "BAD_MUTATING");
  if (stamps !== undefined && !(names(stamps) && stamps.every((s) => STAMPS.includes(s))))
    throw fail(op, "BAD_STAMPS");
  const hasNeeds = Object.hasOwn(row, "needs");
  if (hasNeeds && needs !== null && !(typeof needs === "string" && needs.length > 0)) throw fail(op, "BAD_NEEDS");
  let kept;
  if (fields !== undefined) {
    if (!fields || typeof fields !== "object" || Array.isArray(fields) || !names(fields.accepts)
      || !Array.isArray(fields.requires) || !fields.requires.every((r) => (typeof r === "string" && r.length > 0) || (names(r) && r.length > 0)))
      throw fail(op, "BAD_FIELDS");
    kept = Object.freeze({ accepts: Object.freeze([...fields.accepts]),
      requires: Object.freeze(fields.requires.map((r) => (Array.isArray(r) ? Object.freeze([...r]) : r))) });
  }
  return Object.freeze({ owner, classes: classes === null ? null : Object.freeze([...classes]),
    machineClasses: machineClasses === undefined ? undefined : Object.freeze([...machineClasses]), mutating,
    stamps: stamps === undefined ? undefined : Object.freeze([...stamps]), hasNeeds, needs: hasNeeds ? needs : undefined, fields: kept });
}

/* R80: the owners' rows as `Map<op, record>`, in the order given. `input` is `{owner: {op: row}}` or `[[owner, {op: row}]]`.
   An op in two owners' rows is refused naming both (R81). */
export function declaredRows(input) {
  if (!input || typeof input !== "object") throw new TypeError("op-declarations: the owners' declarations are an object or a list of pairs (R80)");
  const out = new Map();
  for (const [owner, ops] of Array.isArray(input) ? input : Object.entries(input)) {
    if (!ops || typeof ops !== "object" || Array.isArray(ops)) throw new TypeError(`op-declarations: ${owner}: its DECLARED_OPS is an object (R80)`);
    for (const [op, row] of Object.entries(ops)) {
      if (out.has(op)) throw new TypeError(`op-declarations: ${op}: declared by two owners, ${out.get(op).owner} and ${owner} (R81)`);
      out.set(op, shape(owner, op, row));
    }
  }
  return out;
}

/* R81: where an owner's record and the hand tables disagree, `field` names it; `null` when they agree. `hand` is
   `{spec, stamps, hasNeeds, needs}` for an op the hand tables hold. */
export function disagreement(rec, hand) {
  const { spec } = hand;
  if ((rec.classes === null) !== (spec.classes === null) || (rec.classes && !sameSet(rec.classes, spec.classes))) return "classes";
  if ((rec.machineClasses === undefined) !== (spec.machineClasses === undefined)
    || (rec.machineClasses && !sameSet(rec.machineClasses, spec.machineClasses))) return "machineClasses";
  if (rec.mutating !== spec.mutating) return "mutating";
  if (rec.stamps !== undefined && !sameSet(rec.stamps, hand.stamps)) return "stamps";
  if (rec.hasNeeds && (!hand.hasNeeds || rec.needs !== hand.needs)) return "needs";
  return null;
}

/* the pieces `build()` merges for an op the hand tables do not hold (R80) */
export const specOf = (rec) => ({ classes: rec.classes ? [...rec.classes] : null,
  ...(rec.machineClasses ? { machineClasses: [...rec.machineClasses] } : {}), mutating: rec.mutating });
export const stampsOf = (rec) => (rec.stamps ? [...rec.stamps] : rec.classes === null ? [] : ["viewer"]);
/* `[has, value]`: an act's row is the owner's (required, else refused); a session read's is null; a public op has none unless given */
export function needsOf(rec) {
  if (rec.hasNeeds) return [true, rec.needs];
  return rec.classes === null ? [false, undefined] : [true, null];
}
export const isPublic = (rec) => rec.classes === null;

/* R80: a mutating op with no hand row names its capability, or is refused: it is the one row with no honest default */
export function needsRequired(rec, op) {
  if (rec.mutating && !rec.hasNeeds) throw fail(op, "NEEDS_MISSING");
}

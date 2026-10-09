/* reading-guides — THE GUIDE CHECK (requirements: `build/requirements/reading-guides.md` R4, R10; D24, D65; K2472).
 *
 * A guide says what to look for in one kind of document, never how the assistant may behave (D24): it is rendered as
 * that kind's layer of the assistant's pack (`skills` R40) and read by hand as a checklist (D65), so the same text
 * must carry no instruction. `checkGuide(items)` is pure: it reads the items alone (and the one registered conduct
 * check), writes nothing and never throws. Every draft, review, adoption and offer runs it here; `skills` R40 runs it
 * again at every render.
 *
 * THE CLOSED LISTS are BOB's (K2472), frozen here and tested whole; a change is a requirement change.
 *
 * THE REGISTERED CHECK (K31's pattern). `skills` registers its R16 `controlFlowAuthority(text)` once at start
 * (`registerConductCheck`); it answers the names of the control-flow patterns a text carries. It is held for the
 * process, because `checkGuide` is pure and is called without a host. A second registration is refused
 * `PROVIDER_DECLARED`; with none, R4 checks only its own lists. A registered check that throws, or answers anything but
 * a list, refuses the item it was asked about: an item that could not be checked is never passed (fail closed). */
import { refusal } from "./checks.mjs";

/** R4: an item's `look_for` is a look-for statement when it opens with one of these (case-insensitive, then a word
 *  boundary). */
export const LOOK_FOR_OPENERS = Object.freeze(["Look for", "Note whether", "Note where", "Check whether", "Check that",
  "Watch for", "Compare"]);

/** R4: what names conduct, each list matched as whole words, case-insensitive, in every text of an item. `op_form`
 *  is the op spelling `op=`. */
export const CONDUCT_LISTS = Object.freeze({
  op_form: Object.freeze(["op="]),
  tool_or_act: Object.freeze(["run", "call", "fetch", "search", "capture", "post", "send", "sign", "publish", "approve",
    "delete", "tool", "grant"]),
  party: Object.freeze(["assistant", "Civicsmith", "model", "AI"]),
  rule_or_permission: Object.freeze(["permission", "permitted", "allowed", "may", "must", "rule", "instruction"]),
});

/** R4: the item's shape. */
export const ITEMS_MAX = 50;
export const LABEL_MAX = 80, LOOK_FOR_MAX = 500, WHERE_MAX = 200;
export const ITEM_FIELDS = Object.freeze(["label", "look_for", "where"]);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* A whole word: no letter or digit on either side. `op=` ends in `=`, so only its start is bounded. */
const wordRe = (w) => new RegExp(`(?<![A-Za-z0-9])${esc(w)}${/[A-Za-z0-9]$/.test(w) ? "(?![A-Za-z0-9])" : ""}`, "i");
const LIST_RES = Object.freeze(Object.entries(CONDUCT_LISTS).flatMap(([list, words]) =>
  words.map((word) => Object.freeze({ list, word, re: wordRe(word) }))));
const OPENER_RES = LOOK_FOR_OPENERS.map((o) => new RegExp(`^${esc(o)}(?![A-Za-z0-9])`, "i"));
const CONTROL = /[\u0000-\u001f\u007f]/;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

let conduct = null;   // {module, fn}: the one registered conduct check

/** R4 (K31): the one registration `skills` fills at start with its R16. `fn(text)` answers a list of pattern names. */
export function registerConductCheck(fn, module = "skills") {
  const name = typeof module === "string" && module ? module : "skills";
  if (typeof fn !== "function")
    return { ok: false, reason: "PROVIDER_MALFORMED", module: name, detail: "a conduct check is a function of one text" };
  if (conduct)
    return { ok: false, reason: "PROVIDER_DECLARED", module: name, detail: `${conduct.module} already registered the conduct check` };
  conduct = { module: name, fn };
  return { ok: true, module: name };
}

/** Which module holds the conduct check, or null. */
export function conductCheckHolder() { return conduct ? conduct.module : null; }

/* What the item's text names as conduct, or null: a closed list's word, or the registered check's patterns. */
function conductIn(text) {
  for (const { list, word, re } of LIST_RES) if (re.test(text)) return { list, word };
  if (!conduct) return null;
  let found;
  try { found = conduct.fn(text); } catch { return { list: "registered", patterns: null, unreadable: true }; }
  if (!Array.isArray(found)) return { list: "registered", patterns: null, unreadable: true };
  return found.length ? { list: "registered", patterns: found.map(String) } : null;
}

/* One item's shape, normalised (trimmed; an empty `where` dropped), or null. */
function shapeOf(item) {
  if (!isObj(item) || Object.keys(item).some((k) => !ITEM_FIELDS.includes(k))) return null;
  const { label, look_for: lookFor, where } = item;
  if (typeof label !== "string" || typeof lookFor !== "string") return null;
  if (where !== undefined && where !== null && typeof where !== "string") return null;
  const out = { label: label.trim(), look_for: lookFor.trim() };
  const w = typeof where === "string" ? where.trim() : "";
  if (w) out.where = w;
  if (!out.label || out.label.length > LABEL_MAX || !out.look_for || out.look_for.length > LOOK_FOR_MAX) return null;
  if (w.length > WHERE_MAX) return null;
  if (Object.values(out).some((s) => CONTROL.test(s))) return null;
  return out;
}

/** R4, R10: `{ok: true, items}` (the items trimmed, an empty `where` dropped), or the first refusal: the items' shape
 *  (`GUIDE_ITEMS_REFUSED`), then, item by item in order, conduct or a `look_for` that is not a look-for statement
 *  (`GUIDE_CARRIES_CONDUCT`, naming the item by its position and label, the field and what was found). Pure; never
 *  throws. */
export function checkGuide(items) {
  try { return judge(items); } catch {
    return shapeRefusal("the items could not be read as plain text. Nothing was written.", null);
  }
}

/* The one site minting the shape refusal (DEC-49). */
function shapeRefusal(detail, item) {
  /* DEC-49 REGION is-guide-shape */
  return refusal("GUIDE_ITEMS_REFUSED", detail, { item });
  /* END DEC-49 REGION is-guide-shape */
}

function judge(items) {
  const list = Array.isArray(items) ? items : null;
  const shaped = list && list.length >= 1 && list.length <= ITEMS_MAX ? list.map(shapeOf) : null;
  const bad = shaped ? shaped.findIndex((s) => s === null) : -1;
  if (!shaped || bad >= 0)
    return shapeRefusal(!shaped
      ? `a guide holds from 1 to ${ITEMS_MAX} items; ${list ? `${list.length} were given` : "no list was given"}. Nothing was written.`
      : `item ${bad + 1} is not a label, a look-for and an optional where, as short plain text. Nothing was written.`,
      shaped ? bad : null);
  for (let i = 0; i < shaped.length; i++) {
    const it = shaped[i];
    let found = null, field = null;
    for (const f of ITEM_FIELDS) {
      if (it[f] === undefined) continue;
      found = conductIn(it[f]);
      if (found) { field = f; break; }
    }
    if (!found && !OPENER_RES.some((re) => re.test(it.look_for))) { found = { list: "not_look_for" }; field = "look_for"; }
    /* DEC-49 REGION is-guide-look-for */
    if (found)
      return refusal("GUIDE_CARRIES_CONDUCT", `item ${i + 1} ("${it.label.slice(0, 80)}") ${sayFound(found)} in its ${field}. `
        + "Nothing was written.", { item: i, label: it.label, field, found });
    /* END DEC-49 REGION is-guide-look-for */
  }
  return { ok: true, items: shaped };
}

function sayFound(f) {
  if (f.list === "not_look_for") return "does not open as a look-for statement";
  if (f.list === "registered") return f.unreadable ? "could not be checked for an instruction" : `carries an instruction (${f.patterns.join(", ")})`;
  if (f.list === "op_form") return "names an op";
  if (f.list === "party") return `names a party to conduct ("${f.word}")`;
  if (f.list === "rule_or_permission") return `states a rule or a permission ("${f.word}")`;
  return `names a tool or an act ("${f.word}")`;
}

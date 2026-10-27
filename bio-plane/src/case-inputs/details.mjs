/* case-inputs' case details (requirements: `build/requirements/case-inputs.md`, R20–R24, R28; T51, K4169, K4171, K4185):
 * the four standard details of a case that sit beside it and never enter its signed document, their shapes (R21), and the
 * sentences a member reads from them (R28), each written once with `localize` or read by key with `word`. Pure: nothing
 * here reads the store; `held` (R21's `entities.has`) is handed in. */

import { word, localize } from "../setup-words/index.mjs";

/** R21: the four fields, in the order they are listed. There is no `classification` (K4185). */
export const CASE_DETAILS_FIELDS = Object.freeze(["area", "contact", "related", "relationships"]);
/** R21: how many entries and how long each part may be, in code points. */
export const DETAILS_LIMITS = Object.freeze({ areaEntries: 10, areaWords: 120, contactText: 254, relatedEntries: 50,
  relatedWords: 280, relatedUrl: 2048, caseRef: 64, relationshipItems: 20, relationshipWith: 120, relationshipNature: 280 });
/** R21: the ways one related work bears on this case. */
export const RELATIONS = Object.freeze(["builds_on", "responds_to", "same_matter", "disagrees_with", "other"]);
/** R21: a team's slug, `setup-fleet`'s `GROUP_SLUG_RE` (instance-setup is later in the order, so this is a copy, K57). */
export const GROUP_SLUG = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
/** R23: the most history entries one read lists (the latest, `truncated` beyond). */
export const CASE_DETAILS_HISTORY_MAX = 500;

/** R28: the sentences these answers carry, each once; the list's row wins where it holds one. */
export const CASE_DETAILS_WORDS = Object.freeze({
  machine: localize("case-inputs.details.machine_cannot_set", "A case's details are set by a member's own act, and no member, or an automated credential, asked. Nothing was written."),
  noSuchCase: word("refusal.NO_SUCH_CASE"),
  notOwner: localize("case-inputs.details.not_owner", "Only an owner of the project can set the details of its case. Ask an owner to do it. Nothing was written."),
  fieldUnknown: localize("case-inputs.details.field_unknown", "{field} is not one of a case's details. They are {fields}. Nothing was written.", { field: "{field}", fields: "{fields}" }),
  malformed: localize("case-inputs.details.malformed", "{field}: {part} is not in the shape this detail takes. Nothing was written.", { field: "{field}", part: "{part}" }),
  notStated: localize("case-inputs.details.not_stated", "Not stated."),
  publicCurrent: localize("case-inputs.details.public_current", "These details are the team's current statement about this case. They are not part of the signed edition and can change."),
  notPublished: localize("case-inputs.details.not_published", "No published edition answers to that case. A case that was never published and an id that never existed are answered alike."),
});

/** R28: a sentence of `CASE_DETAILS_WORDS` with its `{placeholders}` filled; one not in `fill` stays for the screen. */
export const fillDetails = (key, fill = {}) => CASE_DETAILS_WORDS[key].replace(/\{([a-z_]+)\}/g, (m, k) =>
  (Object.prototype.hasOwnProperty.call(fill, k) ? String(fill[k]) : m));

const len = (v) => [...v].length;
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const oneLine = (v, min, max) => typeof v === "string" && len(v.trim()) >= min && len(v) <= max && !/[\u0000-\u001f\u007f]/.test(v);
const onlyKeys = (o, keys) => Object.keys(o).find((k) => !keys.includes(k));

/* R21: the first part of `value` not in its field's shape, spelled as the part is (`area[2].words`), or null when the
   value is in shape. `held(entity)` answers whether this team holds the entity. */
export function detailsShapeProblem(field, value, held = () => false) {
  const L = DETAILS_LIMITS;
  if (field === "area") {
    if (!Array.isArray(value) || value.length < 1 || value.length > L.areaEntries) return "area";
    for (let i = 0; i < value.length; i++) {
      const e = value[i], at = `area[${i}]`;
      if (!isObj(e)) return at;
      const extra = onlyKeys(e, ["entity", "words"]);
      if (extra) return `${at}.${extra}`;
      if (!oneLine(e.words, 1, L.areaWords)) return `${at}.words`;
      if (e.entity !== undefined && e.entity !== null && (typeof e.entity !== "string" || !e.entity || !held(e.entity))) return `${at}.entity`;
    }
    return null;
  }
  if (field === "contact") {
    if (!isObj(value)) return "contact";
    if (value.kind === "doorbell") return onlyKeys(value, ["kind"]) ? `contact.${onlyKeys(value, ["kind"])}` : null;
    if (value.kind === "text") {
      const extra = onlyKeys(value, ["kind", "text"]);
      if (extra) return `contact.${extra}`;
      return oneLine(value.text, 1, L.contactText) ? null : "contact.text";
    }
    return "contact.kind";
  }
  if (field === "related") {
    if (!Array.isArray(value) || value.length < 1 || value.length > L.relatedEntries) return "related";
    for (let i = 0; i < value.length; i++) {
      const e = value[i], at = `related[${i}]`;
      if (!isObj(e)) return at;
      const extra = onlyKeys(e, ["relation", "case_ref", "url", "words"]);
      if (extra) return `${at}.${extra}`;
      if (!RELATIONS.includes(e.relation)) return `${at}.relation`;
      if (e.case_ref === undefined && e.url === undefined) return `${at}.case_ref`;
      if (e.case_ref !== undefined) {
        const r = e.case_ref;
        if (!isObj(r) || onlyKeys(r, ["group", "case", "edition"])) return `${at}.case_ref`;
        if (typeof r.group !== "string" || !GROUP_SLUG.test(r.group)) return `${at}.case_ref.group`;
        if (typeof r.case !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(r.case) || len(r.case) > L.caseRef) return `${at}.case_ref.case`;
        if (r.edition !== undefined && !(Number.isInteger(r.edition) && r.edition >= 1)) return `${at}.case_ref.edition`;
      }
      if (e.url !== undefined) {
        let ok = typeof e.url === "string" && e.url.startsWith("https://") && len(e.url) <= L.relatedUrl && !/\s/.test(e.url);
        if (ok) { try { ok = new URL(e.url).protocol === "https:"; } catch { ok = false; } }
        if (!ok) return `${at}.url`;
      }
      if (e.words !== undefined && !oneLine(e.words, 1, L.relatedWords)) return `${at}.words`;
    }
    return null;
  }
  if (field === "relationships") {
    if (!isObj(value)) return "relationships";
    if ("none" in value) return value.none === true && !onlyKeys(value, ["none"]) ? null : "relationships.none";
    const extra = onlyKeys(value, ["items"]);
    if (extra) return `relationships.${extra}`;
    const items = value.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > L.relationshipItems) return "relationships.items";
    for (let i = 0; i < items.length; i++) {
      const e = items[i], at = `relationships.items[${i}]`;
      if (!isObj(e)) return at;
      const x = onlyKeys(e, ["with", "nature"]);
      if (x) return `${at}.${x}`;
      if (!oneLine(e.with, 1, L.relationshipWith)) return `${at}.with`;
      if (!oneLine(e.nature, 1, L.relationshipNature)) return `${at}.nature`;
    }
    return null;
  }
  return field;
}

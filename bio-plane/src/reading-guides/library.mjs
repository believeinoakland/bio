/* reading-guides — CIVICSMITH'S LIBRARY (requirements: `build/requirements/reading-guides.md` R1; D8, D65).
 *
 * The guides every group receives with the release: frozen data, read-only to every group (no act of this module
 * writes, reviews, offers or retires one). Each is approved by Bob or someone he names and carries the record of
 * measured use that showed it works. None is approved yet, so the library ships EMPTY: no guide and no approval record
 * is invented here. A guide joins it by a release, never by this module (R6); `civicsmithGuideProblems` is the check
 * every entry passes, run over the whole library when this file is imported (an entry that fails stops the import, so
 * a release cannot carry one), and by the module's tests over entries of their own. */
import { isGuideId } from "../record-grammar/ids.mjs";
import { DOCTYPES } from "../../../doctypes/index.mjs";
import { checkGuide } from "./check.mjs";

/** The document kinds a guide may be for: `doctypes`' keys, in its order (its R1). */
export const GUIDE_KINDS = Object.freeze(DOCTYPES.map((t) => t.key));

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const filled = (v) => typeof v === "string" && v.trim() !== "";
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** R1: what keeps `entry` out of the library, as a list of plain sentences (`[]` for a whole entry). An entry is
 *  `{id, kind, origin: "civicsmith", items, state: "group", author, reviewed_by, based_on, approved_by, measured_use}`:
 *  a guide id, a kind of `GUIDE_KINDS`, items R4 passes, `approved_by` the approver Bob is or named, and
 *  `measured_use` `{summary, measured_on}`, the record of use that showed it works. Never throws. */
export function civicsmithGuideProblems(entry) {
  if (!isObj(entry)) return ["an entry is an object"];
  const out = [];
  if (!isGuideId(entry.id)) out.push("its id is not a guide id");
  if (!GUIDE_KINDS.includes(entry.kind)) out.push("its kind is not a document kind");
  if (entry.origin !== "civicsmith") out.push("its origin is not civicsmith");
  if (entry.state !== "group") out.push("its state is not group");
  if (!filled(entry.author)) out.push("it names no author");
  if (!filled(entry.reviewed_by)) out.push("it names no reviewer");
  if (entry.based_on !== null && !filled(entry.based_on)) out.push("its based_on is neither null nor named");
  if (!filled(entry.approved_by)) out.push("it names no approver");
  const m = entry.measured_use;
  if (!isObj(m) || !filled(m.summary) || typeof m.measured_on !== "string" || !DAY.test(m.measured_on))
    out.push("it carries no record of measured use");
  if (!checkGuide(entry.items).ok) out.push("its items do not pass the guide check");
  return out;
}

/** R1: the library, each entry checked and frozen deep; throws, naming the entry and what keeps it out, so no release
 *  can carry an entry that fails. Two entries with one id are refused. */
export function freezeLibrary(entries) {
  const seen = new Set();
  return Object.freeze(entries.map((e, i) => {
    const problems = civicsmithGuideProblems(e);
    if (problems.length) throw new TypeError(`CIVICSMITH_GUIDES[${i}]: ${problems.join("; ")}`);
    if (seen.has(e.id)) throw new TypeError(`CIVICSMITH_GUIDES[${i}]: ${e.id} is held twice`);
    seen.add(e.id);
    return Object.freeze({ ...e, items: Object.freeze(checkGuide(e.items).items.map((it) => Object.freeze(it))),
                           measured_use: Object.freeze({ ...e.measured_use }) });
  }));
}

/** R1: Civicsmith's guides, carried with the release. Empty until Bob approves the first (see the header). */
export const CIVICSMITH_GUIDES = freezeLibrary([]);

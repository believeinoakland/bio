/* public-read — the document and the place a published finding's evidence entry cites (requirements:
 * `build/requirements/public-read.md` R41 (1), amending R39; `case-grammar` R12, R17). The finding's published bytes
 * list its legs (`basis:`); the signed case document states, for each member, a `grading_facts:` row per leg, the
 * `passages:` it relies on and the `materials:` it reaches. A leg that rests on a captured document is named by what the
 * case states of that document and placed at the passage the case states it relies on, so two entries of one case are
 * told apart. Nothing of the document's bytes is read or handed over (B318 4): the name is the material row's `origin`
 * as signed (its `ref` when the origin is not stated), the place the passage's `extent` exactly as signed, for the
 * reader's surface to word. Pure; never throws. */

import { gradingFactsOf, passagesOf, materialsOf } from "../case-grammar/index.mjs";

const HEX64 = /^[0-9a-f]{64}$/;
const text = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
/* a capture a grading fact lists: its SHA-256, whether the row lists it bare or as an object that carries it */
const shaOf = (c) => {
  const v = typeof c === "string" ? c : c && typeof c === "object" ? c.sha ?? c.sha256 ?? c.capture ?? c.capture_sha : null;
  return typeof v === "string" && HEX64.test(v.toLowerCase()) ? v.toLowerCase() : null;
};

/** R41 (1): the reader of one signed case document's account of its legs, or null when the document states none
 *  (a format before `/6`, or no grading facts block). `forFinding(id)` answers `{ of(leg) }` for one member: `of(leg)`
 *  takes the finding's published legs in the order its bytes list them and answers each leg's `document`,
 *  `{name, place}` for a leg the case states rests on a captured document (`name` null when the case states no
 *  material for it, `place` null when it cites the whole document), else null. A leg is paired with the signed row of
 *  its target in order (the k-th leg on a target with the k-th row on it), and a row with the first passage of the
 *  finding not yet used that is at one of the row's captures (the leg's `content_id` first, when it names one). */
export function legReaderOf(fm) {
  const grading = gradingFactsOf(fm);
  if (!grading) return null;
  const passages = passagesOf(fm) || {};
  const mats = (materialsOf(fm) || {}).materials;
  const materials = Array.isArray(mats) ? mats.filter((m) => m && typeof m === "object") : [];
  return {
    forFinding(id) {
      const rows = Array.isArray(grading[id]) ? grading[id] : [];
      const mine = Array.isArray(passages[id]) ? passages[id] : [];
      const usedRows = new Set(), usedPassages = new Set();
      return {
        of(leg) {
          const at = rows.findIndex((r, i) => !usedRows.has(i) && r && r.target === (leg && leg.target));
          if (at < 0) return null;
          usedRows.add(at);
          const row = rows[at];
          if (row.kind !== "document") return null;
          const shas = new Set((Array.isArray(row.captures) ? row.captures : []).map(shaOf).filter(Boolean));
          const fits = (p, i) => !usedPassages.has(i) && p && shas.has(String(p.capture_sha ?? "").toLowerCase());
          const named = typeof leg.content_id === "string" ? mine.findIndex((p, i) => fits(p, i) && p.content_id === leg.content_id) : -1;
          const found = named >= 0 ? named : mine.findIndex(fits);
          if (found >= 0) usedPassages.add(found);
          const passage = found >= 0 ? mine[found] : null;
          const extent = passage && passage.extent && typeof passage.extent === "object" ? passage.extent : null;
          const material = materials.find((m) => shas.has(String(m.sha ?? "").toLowerCase()));
          return { name: material ? text(material.origin) ?? text(material.ref) : null, place: extent };
        },
      };
    },
  };
}

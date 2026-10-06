/* wizard-scripts' frozen data from the design stream's files (requirements: `build/requirements/wizard-scripts.md`, R13,
 * R22; DEC-139 (5), DEC-148; K1565, K1785, K1790). Pure: the two readings below turn the design files
 * (`docs/development/ux-substrate/screens/registry.json` and `library.json`, at the commit the job's START names) into the
 * forms this module carries; `build-data.mjs` writes them into `screen-registry.mjs` and `civicsmith-library.mjs`, and
 * the tests hold the written data equal to these readings of the vendored files. */

/** R13: an act the file marks owed: `owed:<op> DEC-n`. */
export const OWED_ACT = /^owed:([a-z][a-z0-9]*)(?:\s+(DEC-\d+))?$/;
/** R22: who authored the Civicsmith library, and who approved its first version and when (DEC-148). */
export const LIBRARY_AUTHOR = "civicsmith";
export const LIBRARY_APPROVED = Object.freeze({ by: "Bob", at: "2026-10-06" });
/** R22: the three required scripts, by name (DEC-148). */
export const REQUIRED_NAMES = Object.freeze(["Set up and claim", "Welcome a new member", "Publication ceremony"]);

/** R13 (DEC-139 (5)): the registry's screens as `[{id, name, purpose, acts, owed}]`: `acts` the op of each act marked
 *  `declared` or `function`, in the file's order; `owed` each act marked `owed`, `{op, dec, at}`, `at` the number of
 *  `acts` that precede it, so an owed act whose op is declared is registered in the file's order (R13; DEC-148). */
export function screensFromFile(file) {
  const out = [];
  for (const s of (file && Array.isArray(file.screens) ? file.screens : [])) {
    const acts = [], owed = [];
    for (const a of Array.isArray(s.acts) ? s.acts : []) {
      if (a.status === "declared" || a.status === "function") acts.push(a.op);
      else if (a.status === "owed") {
        const m = OWED_ACT.exec(String(a.op ?? "").trim());
        if (m) owed.push({ op: m[1], dec: m[2] ?? null, at: acts.length });
      }
    }
    out.push({ id: s.id, name: s.name, purpose: s.purpose, acts, owed });
  }
  return out;
}

/** R22 (DEC-148): the library's scripts in R1's form, each `{id, name, start, origin, scope, required, version, steps,
 *  author, approved}`: the file's id, name, start, steps and order; one version, 1, approved by Bob on 6 October 2026
 *  and authored by the Civicsmith library; required exactly for the three DEC-148 names; a step's side trip, named in
 *  the file by the script's name, carried as that script's id (R2's `via`); an owed act as its op (R13). The file's
 *  `note`, `journeys` and `approved` are design notes and are not carried. */
export function libraryFromFile(file) {
  const scripts = file && Array.isArray(file.scripts) ? file.scripts : [];
  const byName = new Map(scripts.map((s) => [s.name, s.id]));
  return scripts.map((s) => {
    const v = (Array.isArray(s.versions) ? s.versions : []).find((x) => x.version === 1) || (s.versions || [])[0] || { steps: [] };
    const steps = (v.steps || []).map((t) => {
      const owed = typeof t.act === "string" ? OWED_ACT.exec(t.act.trim()) : null;
      const step = { screen: t.screen, act: owed ? owed[1] : t.act ?? null, what: t.what, why: t.why };
      if (t.draft !== undefined && t.draft !== null) step.draft = t.draft;
      if (t.via !== undefined && t.via !== null) {
        if (!byName.has(t.via)) throw new Error(`library: '${s.name}' names a side trip '${t.via}' the library does not hold`);
        step.via = byName.get(t.via);
      }
      return step;
    });
    return { id: s.id, name: s.name, start: s.start ?? (steps[0] ? steps[0].screen : null), origin: "civicsmith", scope: "group",
             required: REQUIRED_NAMES.includes(s.name), version: 1, steps, author: LIBRARY_AUTHOR, approved: { ...LIBRARY_APPROVED } };
  });
}

/** Freezes a value deeply, for the carried data. */
export function deepFreeze(v) {
  if (v && typeof v === "object" && !Object.isFrozen(v)) { for (const k of Object.keys(v)) deepFreeze(v[k]); Object.freeze(v); }
  return v;
}

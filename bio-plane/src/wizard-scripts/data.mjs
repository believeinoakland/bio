/* wizard-scripts' frozen data from the design stream's files (requirements: `build/requirements/wizard-scripts.md`, R13,
 * R22; DEC-139 (5), DEC-148; K1565, K1785, K1790). Pure: the two readings below turn the design files
 * (`docs/development/ux-substrate/screens/registry.json` and `library.json`, at the commit the job's START names) into the
 * forms this module carries; `build-data.mjs` writes them into `screen-registry.mjs` and `civicsmith-library.mjs`, and
 * the tests hold the written data equal to these readings of the vendored files. */

/** R13: an act the file marks owed: `owed:<op> DEC-n`, or `owed:<op> Kn` when a BOB ruling owes it (since PR #13). */
export const OWED_ACT = /^owed:([a-z][a-z0-9]*)(?:\s+(DEC-\d+|K\d+))?$/;
/** R22: who authored the Civicsmith library, and who approved its first version and when (DEC-148). */
export const LIBRARY_AUTHOR = "civicsmith";
export const LIBRARY_APPROVED = Object.freeze({ by: "Bob", at: "2026-10-06" });
/** R22 (T37; K2241): the newer versions BOB adopts from the design stream's library (Bob: "I don't need to approve
 *  wizard scripts"), each script by name, the version it becomes, and who adopted it when under which ruling. */
export const LIBRARY_ADOPTED = Object.freeze([
  Object.freeze({ names: Object.freeze(["Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding"]), version: 2,
                  approved: Object.freeze({ by: "BOB", at: "2026-10-08", ruling: "K2241" }) }),
]);
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
export function libraryFromFile(file, commit = null) {
  const scripts = file && Array.isArray(file.scripts) ? file.scripts : [];
  const byName = new Map(scripts.map((s) => [s.name, s.id]));
  return scripts.map((s) => {
    const v = (Array.isArray(s.versions) ? s.versions : []).find((x) => x.version === 1) || (s.versions || [])[0] || { steps: [] };
    const steps = stepsOf(s, v, byName);
    return { id: s.id, name: s.name, start: s.start ?? (steps[0] ? steps[0].screen : null), origin: "civicsmith", scope: "group",
             required: REQUIRED_NAMES.includes(s.name), version: 1, steps, author: LIBRARY_AUTHOR, approved: { ...LIBRARY_APPROVED },
             ...(commit ? { source: commit } : {}) };
  });
}

/** R22 (T37; K2241): the library with BOB's adopted versions: each script of `base` (its version 1, at `baseCommit`)
 *  that `adopted` names takes the newer file's steps (at `newerCommit`; the design file keeps its latest steps as its
 *  own version) as the adopted version, approved as `adopted` records, its version 1 kept apart in `earlier` (R1: a
 *  version's steps never change; R7: the earlier version then `updated`). The newer file's id, name, start and
 *  required are the script's (R22: kept unless the file changes them). Every other script keeps version 1 at
 *  `baseCommit`, whatever the newer file holds for it. */
export function adoptedLibrary(baseFile, baseCommit, newerFile, newerCommit, adopted = LIBRARY_ADOPTED) {
  const base = libraryFromFile(baseFile, baseCommit);
  const newer = new Map(libraryFromFile(newerFile, newerCommit).map((e) => [e.name, e]));
  return base.map((e) => {
    const a = adopted.find((x) => x.names.includes(e.name));
    if (!a) return e;
    const n = newer.get(e.name);
    if (!n) throw new Error(`library: '${e.name}' is adopted but the newer file does not hold it`);
    const { version, steps, author, approved, source } = e;
    return { ...n, version: a.version, approved: { ...a.approved }, earlier: [{ version, steps, author, approved, source }] };
  });
}

function stepsOf(s, v, byName) {
    return (v.steps || []).map((t) => {
      const owed = typeof t.act === "string" ? OWED_ACT.exec(t.act.trim()) : null;
      const step = { screen: t.screen, act: owed ? owed[1] : t.act ?? null, what: t.what, why: t.why };
      if (t.draft !== undefined && t.draft !== null) step.draft = t.draft;
      if (t.via !== undefined && t.via !== null) {
        if (!byName.has(t.via)) throw new Error(`library: '${s.name}' names a side trip '${t.via}' the library does not hold`);
        step.via = byName.get(t.via);
      }
      return step;
    });
}

/** Freezes a value deeply, for the carried data. */
export function deepFreeze(v) {
  if (v && typeof v === "object" && !Object.isFrozen(v)) { for (const k of Object.keys(v)) deepFreeze(v[k]); Object.freeze(v); }
  return v;
}

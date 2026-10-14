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
/** R22 (T37, T41; K2241): the newer versions BOB adopts from the design stream's library (Bob: "I don't need to approve
 *  wizard scripts"), each script by name, the version it becomes, the commit of the library it is taken from, and who
 *  adopted it when under which ruling: T37's four from PR #14's merge (`e08cd35ecb`), T41's two from PR #19's
 *  (`3660c18803`; DEC-188 (8), DEC-184; K2484). */
export const LIBRARY_ADOPTED = Object.freeze([
  Object.freeze({ names: Object.freeze(["Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding"]), version: 2,
                  source: "e08cd35ecb", approved: Object.freeze({ by: "BOB", at: "2026-10-08", ruling: "K2241" }) }),
  Object.freeze({ names: Object.freeze(["Connect your Claude account", "Invite a member"]), version: 2,
                  source: "3660c18803", approved: Object.freeze({ by: "BOB", at: "2026-10-10", ruling: "K2241" }) }),
  /* T46 (R30; DEC-194 (4); N913): Start and send's step on `communicationprepare` names no template */
  Object.freeze({ names: Object.freeze(["Start and send"]), version: 2,
                  source: "3f40899950", approved: Object.freeze({ by: "BOB", at: "2026-10-12", ruling: "K2241" }) }),
  /* T47 (R32; DEC-198 (2); N992): Connect sends the code by `subscriptionsignin`, an API key by `accountreferenceset`, and
     disconnects by `subscriptiondisconnect`, from PR #31's merge */
  Object.freeze({ names: Object.freeze(["Connect your Claude account"]), version: 3,
                  source: "a0fab7abf0", approved: Object.freeze({ by: "BOB", at: "2026-10-14", ruling: "K2241" }) }),
  /* T47 (R36; DEC-205 (3), DEC-207 (10), DEC-208 (2), DEC-213 (1); K3062, K3127): the newest of the two required flows at
     PR #33's head as merged into `tranche/T47` at L11's START (6f0d88d8d5): Set up and claim's step 1 on the Workers Paid
     plan and step 14 on `hostingaccessset`; the ceremony's steps 9–11 re-worded */
  Object.freeze({ names: Object.freeze(["Set up and claim", "Publication ceremony"]), version: 3,
                  source: "f90b187c7b", approved: Object.freeze({ by: "BOB", at: "2026-10-14", ruling: "K2241" }) }),
]);
/** R33 (T47; DEC-198 (4); N992): the commit of the library whose `doors` are carried as the front doors (PR #31's merge). */
export const DOORS_SOURCE = "a0fab7abf0";
/** R30 (T46; DEC-194 (5); N913; K2241): the scripts BOB adds to the library from a newer design file, each by name, at
 *  version 1, from the commit of the library it is taken from, approved by BOB on the date of the adoption; none
 *  required (R22's three stay the only required ones). */
export const LIBRARY_ADDED = Object.freeze([
  Object.freeze({ names: Object.freeze(["Comment for the group", "Demand a correction", "Take an escalation to its next stage",
                                        "Refer it to an oversight body", "Pick up a plan"]),
                  source: "3f40899950", approved: Object.freeze({ by: "BOB", at: "2026-10-12", ruling: "K2241" }) }),
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

/** R22 (T37, T41, T46, T47; K2241), R30, R32, R36: the library with BOB's adopted and added versions: each script of
 *  `base` (its version 1, at `baseCommit`) that an entry of `adopted` names takes the steps of the newer file at that
 *  entry's `source` commit (`newer`, `[{file, commit}]`; the design file keeps its latest steps as its own version) as
 *  the adopted version, approved as the entry records, the version it replaces kept in `earlier` (R1: a version's steps
 *  never change; R7: the earlier version then `updated`). Entries apply in their order, so a script adopted twice
 *  (Connect: version 2 at T41, version 3 at T47) keeps every earlier version, oldest first. The newer file's id, name,
 *  start and required are the script's (R22: kept unless the file changes them). Each script an entry of `added` names
 *  joins the library from that entry's file as its version 1, approved as the entry records, never required, at its
 *  place in that file's order (before the first script that follows it there and is already held; else last). Every
 *  other script keeps the version it has, whatever a newer file holds for it. */
export function adoptedLibrary(baseFile, baseCommit, newer = [], adopted = LIBRARY_ADOPTED, added = LIBRARY_ADDED) {
  const base = libraryFromFile(baseFile, baseCommit);
  const read = new Map((Array.isArray(newer) ? newer : []).map((n) => [n.commit, libraryFromFile(n.file, n.commit)]));
  const files = new Map([...read].map(([c, list]) => [c, new Map(list.map((e) => [e.name, e]))]));
  const fileAt = (source, name, what) => {
    const from = files.get(source);
    if (!from) throw new Error(`library: '${name}' is ${what} from ${source}, which is not given`);
    const n = from.get(name);
    if (!n) throw new Error(`library: '${name}' is ${what} but the file at ${source} does not hold it`);
    return n;
  };
  const out = base.map((e) => adopted.filter((x) => x.names.includes(e.name)).reduce((held, a) => {
    if (a.version <= held.version) throw new Error(`library: '${e.name}' version ${a.version} does not follow version ${held.version}`);
    const n = fileAt(a.source, e.name, "adopted");
    const { version, steps, author, approved, source } = held;
    return { ...n, version: a.version, approved: { ...a.approved }, earlier: [...(held.earlier || []), { version, steps, author, approved, source }] };
  }, e));
  for (const a of Array.isArray(added) ? added : []) {
    for (const name of a.names) {
      if (out.some((e) => e.name === name)) throw new Error(`library: '${name}' is added but the library already holds it`);
      const n = fileAt(a.source, name, "added");
      const order = read.get(a.source).map((e) => e.name);
      const next = order.slice(order.indexOf(name) + 1).map((x) => out.findIndex((e) => e.name === x)).find((i) => i >= 0);
      out.splice(next === undefined ? out.length : next, 0, { ...n, required: false, version: 1, approved: { ...a.approved } });
    }
  }
  return out;
}

/** R33 (T47; DEC-198 (4)): the file's front doors, each `{door, scripts}` in the file's order, `scripts` the script ids
 *  it names in its order, each a script the file holds (a door naming one it does not hold is an error, as a side trip
 *  is). Nothing else of a door is carried: its words are `words.json`'s `door.front.*`, read by the interface. */
export function doorsFromFile(file) {
  const ids = new Set((file && Array.isArray(file.scripts) ? file.scripts : []).map((s) => s.id));
  return (file && Array.isArray(file.doors) ? file.doors : []).map((d) => {
    const scripts = (Array.isArray(d.scripts) ? d.scripts : []).map((id) => {
      if (!ids.has(id)) throw new Error(`library: the door '${d.door}' names a script '${id}' the library does not hold`);
      return id;
    });
    return { door: d.door, scripts };
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

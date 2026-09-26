/* id-spaces' test profiles, in the profile shape of `build/requirements/jurisdictions.md` (R1–R5 there).
 * Every profile here is a TEST profile: its places and facts are made up (basis `TEST`). The first,
 * test-harbor, has the shapes the first real profile measured (numbered enactments with kind floors,
 * concurrent project forms, a padded parcel key, a republished assessor layer); the others are different
 * jurisdictions, so every service is shown answering from the view alone (R24).
 *
 * `combine` is a STAND-IN for `jurisdictions.combine` (R12–R16 there), used until the jurisdictions module
 * merges into tranche/T2; it gives the view's shape and withholds a disagreeing floor with a conflict. */

const T = "TEST";
const P = (re, flags) => (flags ? { re, flags } : { re });
const kindPrefix = (w) => P(`${w}\\s+(?:no\\.?\\s*|number\\s+)?`, "i");

export const HARBOR = {
  id: "test-harbor", name: "Harbor City (test)", covers: ["Harbor City", "Harbor County"], test: true,
  spaces: {
    enactment: {
      label: "ordinance or resolution number (H.C.)",
      forms: [{ form: "hc", pattern: P("(\\d{4,5})(?:\\s*H\\.?\\s?C\\.?)?", "i"), normal: [{ group: 1 }],
                clean: { strip: [P("H\\.?\\s?C\\.?", "i")], spaces: "collapse" }, basis: T }],
      kinds: [
        { kind: "ordinance", prefix: kindPrefix("ordinance"), floor: { first: 12274, system: "harbor.legis", basis: T }, basis: T },
        { kind: "resolution", prefix: kindPrefix("resolution"), floor: { first: 75950, system: "harbor.legis", basis: T }, basis: T },
      ],
    },
    project: {
      label: "project or capital improvement number",
      forms: [
        { form: "C#####", pattern: P("(C\\d{5,6})"), normal: [{ group: 1 }], clean: { strip: [P("#")], spaces: "remove", upper: true }, basis: T },
        { form: "P#####", pattern: P("(P\\d{5,6})"), normal: [{ group: 1 }], clean: { strip: [P("#")], spaces: "remove", upper: true }, basis: T },
        { form: "100xxxx", pattern: P("(100\\d{4})"), normal: [{ group: 1 }], clean: { spaces: "remove", upper: true }, basis: T },
        { form: "100xxxx+suffix", pattern: P("(100\\d{4}[A-Z])"), normal: [{ group: 1 }], clean: { spaces: "remove", upper: true }, basis: T },
      ],
    },
    fund: { label: "fund code", forms: [{ form: "####", pattern: P("(\\d{4})"), normal: [{ group: 1 }], basis: T }] },
    parcel: {
      label: "assessor's parcel number",
      forms: [{ form: "harbor-apn", pattern: P("(\\d{1,3}[A-Z]?|[A-Z])-(\\d{1,4})-(\\d{1,3}[A-Z]?)(?:-(\\d{1,2}))?"),
                normal: [{ group: 1, unpad: true }, "-", { group: 2, unpad: true }, "-", { group: 3, unpad: true }, "-",
                         { group: 4, unpad: true, default: "0" }],
                clean: { strip: [P("APN", "i")], spaces: "remove", upper: true }, basis: T }],
    },
  },
  systems: [
    { origin: "harbor.legis", name: "the Harbor legislative record (vendor API)", hosts: ["api.legisvendor.test"],
      path: P("^/v1/harbor(/|$)", "i"), basis: T },
    { origin: "harbor.legis", name: "the Harbor legislative record", hosts: ["harbor.legisvendor.test"], basis: T },
    { origin: "harbor.budget", name: "the Harbor budget system", hosts: ["data.harbor.test"], path: P("budget-lines", "i"), basis: T },
    { origin: "county.assessor", name: "the county assessor's parcel layer, republished by the city portal", hosts: ["data.harbor.test"],
      path: P("parcel-layer", "i"), republishes: true, provenance_stated: false, basis: T },
    { origin: "county.assessor", name: "the county assessor's own publications", hosts: ["gis.county.test"], path: P("/Parcel", "i"), basis: T },
    { origin: "harbor.auditor", name: "the city auditor", hosts: ["auditor.harbor.test"], basis: T },
  ],
  mixed_hosts: [{ host: "www.harbor.test", why: "the city's general website, serving many offices' publications", basis: T }],
};

export const LAKESHORE = {
  id: "test-lakeshore", name: "Lakeshore Township (test)", covers: ["Lakeshore Township"], test: true,
  spaces: {
    enactment: {
      label: "bylaw number",
      forms: [{ form: "LS-####", pattern: P("LS-?(\\d{1,4})", "i"), normal: ["LS-", { group: 1, unpad: true }],
                clean: { spaces: "remove", upper: true }, basis: T }],
      kinds: [{ kind: "bylaw", prefix: kindPrefix("bylaw"), floor: { first: 100, system: "lake.clerk", basis: T }, basis: T }],
    },
    project: {
      label: "works number",
      forms: [
        { form: "W-#####", pattern: P("W-(\\d{5})"), normal: ["W-", { group: 1 }], clean: { spaces: "remove", upper: true }, basis: T },
        { form: "##-###", pattern: P("(\\d{2})-(\\d{3})"), normal: [{ group: 1 }, "-", { group: 2 }], basis: T },
      ],
    },
    parcel: {
      label: "roll number",
      forms: [{ form: "lake-roll", pattern: P("(\\d{3}) (\\d{3}) (\\d{3})"), normal: [{ group: 1 }, { group: 2 }, { group: 3 }],
                clean: { spaces: "collapse" }, basis: T }],
    },
  },
  systems: [
    { origin: "lake.clerk", name: "the township clerk's register", hosts: ["clerk.lakeshore.test"], basis: T },
    { origin: "lake.finance", name: "the township finance office", hosts: ["finance.lakeshore.test"], basis: T },
  ],
  crosswalks: [{ space: "project", forms: ["W-#####", "##-###"], pairs: [["W-10001", "07-001"], ["W-10002", "07-002"]],
                 source: "a".repeat(64), basis: T }],
};

/* A profile that disagrees with HARBOR on the ordinance floor, and one that names a kind with no floor. */
export const DISSENT = {
  id: "test-dissent", name: "Dissent (test)", covers: ["Harbor County"], test: true,
  spaces: { enactment: { label: "ordinance or resolution number (H.C.)", kinds: [
    { kind: "ordinance", prefix: kindPrefix("ordinance"), floor: { first: 12000, system: "harbor.legis", basis: T }, basis: T }] } },
};
export const UNMEASURED = {
  id: "test-unmeasured", name: "Unmeasured (test)", covers: ["Harbor Port District"], test: true,
  spaces: { enactment: { kinds: [{ kind: "proclamation", prefix: kindPrefix("proclamation"), basis: T }] } },
};

/* ---- the stand-in combine ---- */
const tag = (o, profile) => ({ ...o, profile });
export function combine(list) {
  const seen = new Set(), profiles = [], conflicts = [];
  const view = { spaces: {}, systems: [], mixed_hosts: [], crosswalks: [] };
  const floors = new Map();
  for (const p of list) {
    if (seen.has(p.id)) continue;
    seen.add(p.id); profiles.push(p);
    for (const [space, s] of Object.entries(p.spaces || {})) {
      const into = view.spaces[space] || (view.spaces[space] = { labels: [], forms: [], kinds: [] });
      if (s.label && !into.labels.includes(s.label)) into.labels.push(s.label);
      for (const f of s.forms || []) if (!into.forms.some((x) => x.form === f.form)) into.forms.push(tag(f, p.id));
      for (const k of s.kinds || []) {
        if (k.floor) {
          const fl = floors.get(k.kind) || [];
          fl.push({ profile: p.id, value: k.floor, basis: k.floor.basis });
          floors.set(k.kind, fl);
        }
        if (!into.kinds.some((x) => x.kind === k.kind)) into.kinds.push(tag(k, p.id));
      }
    }
    for (const key of ["systems", "mixed_hosts", "crosswalks"]) for (const x of p[key] || []) view[key].push(tag(x, p.id));
  }
  for (const [kind, fl] of floors) {
    const k = view.spaces.enactment.kinds.find((x) => x.kind === kind);
    if (new Set(fl.map((f) => f.value.first)).size > 1) {
      delete k.floor;
      conflicts.push({ at: `spaces.enactment.kinds.${kind}.floor`, values: fl, says: `the profiles disagree on the ${kind} floor` });
    } else k.floor = fl[0].value;
  }
  for (const s of Object.values(view.spaces)) { s.label = s.labels.join("; "); delete s.labels; }
  view.profiles = profiles.map((p) => p.id);
  view.covers = [...new Set(profiles.flatMap((p) => p.covers))];
  view.test = profiles.some((p) => p.test);
  return { ok: true, view, conflicts };
}

/* The view as a service takes it: the combined view with its conflicts. */
export const viewOf = (...profiles) => { const c = combine(profiles); return { ...c.view, conflicts: c.conflicts }; };

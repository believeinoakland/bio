/* affordances: `deriveActs(facts)` (R8–R10) against an oracle written from the requirements' own text, over every
   declared type and every state its machine names (and one it does not). For each act, every combination of the
   facts R8–R10 name for that act is crossed with the machine fact, on three backgrounds for the facts the act does
   not name (all permissive, all restrictive, all absent); the act must be returned exactly when the oracle says so,
   and never with a throw. The state machines are the catalogue's own (`STATES`, `VERSION_MACHINE`), read through
   its vocabulary lookup, which is what R8's "an edge to X" is defined over. */
import test from "node:test";
import assert from "node:assert/strict";
import { deriveActs, ACTS, MACHINE_REFUSALS, REOPENABLE_FROM, DISPOSITIONS } from "../../../src/affordances.mjs";
import { STATES, VERSION_MACHINE, normalizeType, vocabFor } from "../../../checks/bio-checks.mjs";

/* ---- the oracle, from R8–R10's text ---- */
const edges = (f) => vocabFor(STATES, f.declared_type ?? f.object_type)?.edges?.[f.current_state] ?? [];
const edgeTo = (f, x) => edges(f).includes(x);
const n = (v) => typeof v === "number" ? v : Array.isArray(v) ? v.length : null;   // a count, or unstated
const readingTo = (f, to) => (f.basis_version_states ?? []).some((s) => (VERSION_MACHINE.edges[s] ?? []).includes(to));
const R8 = {
  release: (f, t) => t === "information" && edgeTo(f, "verified"),
  retire: (f, t) => t === "information" && edgeTo(f, "retired") && !(n(f.cites_in?.confirmed) > 0),
  dispose: (f, t) => t === "inquiry" && f.case_member !== true && DISPOSITIONS.some((d) => edgeTo(f, d)),
  conclude: (f, t) => t === "inquiry" && (edgeTo(f, "concluded")
    || (f.current_state === "concluded" && f.concludes_for_project === true)),
  reopen: (f, t) => t === "inquiry" && edgeTo(f, "open")
    && (REOPENABLE_FROM.includes(f.current_state) || f.case_member === true),
  publish: (f, t) => t === "inquiry" && (f.current_state === "concluded" || f.concluded_for_project === true)
    && (f.case_member !== true || f.edition_warranted_for_project === true) && f.project_owner !== false,
  inquirydivide: (f, t) => t === "inquiry" && edgeTo(f, "divided") && f.case_member !== true
    && n(f.basis_legs) >= 1 && !(n(f.rested_on?.working) > 0),
  inquiryground: (f, t) => t === "inquiry" && n(f.basis_legs) >= 1 && f.case_member !== true
    && f.current_state !== "divided",
  actionmove: (f, t) => t === "action" && edges(f).length > 0,
  actioncorrespond: (f, t) => t === "action",
  actionlaws: (f, t) => t === "action",
  actionrisktier: (f, t) => t === "action",
  versionaccept: (f, t) => t === "inquiry" && readingTo(f, "accepted"),
  versionreject: (f, t) => t === "inquiry" && readingTo(f, "rejected"),
  versionconsider: (f, t) => t === "inquiry" && readingTo(f, "considering"),
  versionrevert: (f, t) => t === "inquiry" && readingTo(f, "suggested"),
  versioncurrent: (f, t) => t === "inquiry" && (f.basis_version_states ?? []).includes("accepted"),
  withdrawconclusion: (f, t) => t === "inquiry" && (f.basis_version_states ?? []).includes("accepted"),
  versionhide: (f, t) => t === "inquiry" && n(f.basis_versions) >= 1,
};
const R9 = {
  cite: (f, t) => (t === "information" && f.current_state !== "retired")
    || (t === "project" && f.project_participant !== false) || t === "inquiry",
  sever: (f, t) => ((t === "information" || t === "inquiry") && n(f.cited_by_case?.confirmed) > 0)
    || (t === "project" && n(f.cites_out?.confirmed) > 0 && f.project_participant !== false),
  reinstate: (f, t) => (((t === "information" && f.current_state !== "retired") || t === "inquiry")
      && n(f.cited_by_case?.severed) > 0)
    || (t === "project" && n(f.cites_out?.severed_reinstatable) > 0 && f.project_participant !== false),
  projectinvite: (f, t) => t === "project" && f.roster?.owner === true,
  projectremove: (f, t) => t === "project" && f.roster?.owner === true,
  projectowneradd: (f, t) => t === "project" && f.roster?.owner === true,
  projectjoin: (f, t) => t === "project" && typeof f.roster?.state === "string" && f.roster.state !== "joined",
  projectleave: (f, t) => t === "project" && f.roster?.state === "joined"
    && (f.roster?.owner !== true || f.roster?.owner_floor_clear === true),
  projectownerremove: (f, t) => t === "project" && f.roster?.owner === true && f.roster?.owner_floor_clear === true,
  projectownerrescue: (f, t) => t === "project" && f.roster?.rescue_open === true,
  projectvisibilityset: (f, t) => t === "project" && f.project_target_owner === true,
};
const ORACLE = { ...R8, ...R9 };
/* R10: a machine is withheld what its class is refused, on a stated true only. */
const expected = (f, id) => ORACLE[id](f, normalizeType(f.object_type))
  && !(f.actor_is_machine === true && id in MACHINE_REFUSALS);

/* ---- the corpus ---- */
const TYPES = [["information", "information"], ["inquiry", "inquiry"], ["inquiry", "focus"], ["inquiry", "problem"],
  ["focus", "focus"], ["project", "project"], ["action", "action"], ["bias", "bias"], ["widget", "widget"]];
const typestates = TYPES.flatMap(([object_type, declared_type]) =>
  [...(vocabFor(STATES, declared_type)?.legal ?? []), "no-such-state"]
    .map((current_state) => ({ object_type, declared_type, current_state })));
const B = [true, false, null];
const COUNT = [0, 1, null];
const ROSTERS = [null, { owner: true, state: "joined", owner_floor_clear: true, rescue_open: false },
  { owner: true, state: "joined", owner_floor_clear: false, rescue_open: false },
  { owner: false, state: "joined", owner_floor_clear: false, rescue_open: false },
  { owner: false, state: "invited", owner_floor_clear: true, rescue_open: false },
  { owner: false, state: "leaving", owner_floor_clear: true, rescue_open: false },
  { owner: false, state: null, owner_floor_clear: false, rescue_open: true },
  { owner: null, state: null, owner_floor_clear: null, rescue_open: null }];
const READINGS = [null, [], ["suggested"], ["considering"], ["accepted"], ["rejected"], ["accepted", "rejected"]];
/* Each dimension sets one or more keys of the facts object; `undefined` removes a key. */
const DIMS = {
  case_member: B.map((v) => ({ case_member: v })),
  concludes_for_project: B.map((v) => ({ concludes_for_project: v })),
  concluded_for_project: B.map((v) => ({ concluded_for_project: v })),
  edition_warranted_for_project: B.map((v) => ({ edition_warranted_for_project: v })),
  project_owner: B.map((v) => ({ project_owner: v })),
  basis_legs: COUNT.map((v) => ({ basis_legs: v })),
  rested_on: [...COUNT.map((w) => ({ rested_on: { working: w, frozen: 0, severed: 0 } })), { rested_on: undefined }],
  cites_in: [0, 2, [], ["INFO-x"], null].map((c) => ({ cites_in: { confirmed: c, severed: 0 } }))
    .concat([{ cites_in: undefined }]),
  cited_by_case: COUNT.flatMap((c) => COUNT.map((s) => ({ cited_by_case: { confirmed: c, severed: s } })))
    .concat([{ cited_by_case: undefined }]),
  cites_out: COUNT.flatMap((c) => COUNT.map((r) => ({ cites_out: { confirmed: c, severed: 1, severed_reinstatable: r } })))
    .concat([{ cites_out: undefined }]),
  project_participant: B.map((v) => ({ project_participant: v })),
  project_target_owner: B.map((v) => ({ project_target_owner: v })),
  roster: ROSTERS.map((roster) => ({ roster })),
  basis_version_states: READINGS.map((v) => ({ basis_version_states: v })),
  basis_versions: COUNT.map((v) => ({ basis_versions: v })),
  actor_is_machine: B.map((v) => ({ actor_is_machine: v })),
};
const NAMES = {
  release: [], retire: ["cites_in"], dispose: ["case_member"], conclude: ["concludes_for_project"],
  reopen: ["case_member"],
  publish: ["case_member", "concluded_for_project", "edition_warranted_for_project", "project_owner"],
  inquirydivide: ["case_member", "basis_legs", "rested_on"], inquiryground: ["basis_legs", "case_member"],
  actionmove: [], actioncorrespond: [], actionlaws: [], actionrisktier: [],
  versionaccept: ["basis_version_states"], versionreject: ["basis_version_states"],
  versionconsider: ["basis_version_states"], versionrevert: ["basis_version_states"],
  versioncurrent: ["basis_version_states"], withdrawconclusion: ["basis_version_states"],
  versionhide: ["basis_versions"],
  cite: ["project_participant"], sever: ["cited_by_case", "cites_out", "project_participant"],
  reinstate: ["cited_by_case", "cites_out", "project_participant"],
  projectinvite: ["roster"], projectremove: ["roster"], projectowneradd: ["roster"], projectjoin: ["roster"],
  projectleave: ["roster"], projectownerremove: ["roster"], projectownerrescue: ["roster"],
  projectvisibilityset: ["project_target_owner"],
};
const PERMISSIVE = { case_member: false, concludes_for_project: true, concluded_for_project: true,
  edition_warranted_for_project: true, project_owner: true, basis_legs: 2,
  rested_on: { working: 0, frozen: 0, severed: 0 }, cites_in: { confirmed: 0, severed: 0 },
  cited_by_case: { confirmed: 1, severed: 1 }, cites_out: { confirmed: 1, severed: 1, severed_reinstatable: 1 },
  project_participant: true, project_target_owner: true,
  roster: { owner: true, state: "joined", owner_floor_clear: true, rescue_open: true },
  basis_version_states: ["suggested", "considering", "accepted", "rejected"], basis_versions: 4, actor_is_machine: false };
const RESTRICTIVE = { case_member: true, concludes_for_project: false, concluded_for_project: false,
  edition_warranted_for_project: false, project_owner: false, basis_legs: 0,
  rested_on: { working: 3, frozen: 1, severed: 0 }, cites_in: { confirmed: 2, severed: 0 },
  cited_by_case: { confirmed: 0, severed: 0 }, cites_out: { confirmed: 0, severed: 0, severed_reinstatable: 0 },
  project_participant: false, project_target_owner: false,
  roster: { owner: false, state: null, owner_floor_clear: false, rescue_open: false },
  basis_version_states: [], basis_versions: 0, actor_is_machine: true };
const ABSENT = {};
const BACKGROUNDS = [["permissive", PERMISSIVE], ["restrictive", RESTRICTIVE], ["absent", ABSENT]];

function* cross(dims) {
  if (!dims.length) { yield {}; return; }
  const [d, ...rest] = dims;
  for (const v of DIMS[d]) for (const r of cross(rest)) yield { ...v, ...r };
}
const make = (ts, bg, over) => {
  const f = { ok: true, target: "X-1", ...ts, ...bg, ...over };
  for (const k of Object.keys(f)) if (f[k] === undefined) delete f[k];
  return f;
};

function checkActs(ids) {
  const wrong = [];
  let rows = 0;
  for (const id of ids)
    for (const ts of typestates)
      for (const [bgName, bg] of BACKGROUNDS)
        for (const over of cross([...NAMES[id], "actor_is_machine"])) {
          const f = make(ts, bg, over);
          rows++;
          let got;
          try { got = deriveActs(f).some((a) => a.id === id); }
          catch (e) { wrong.push({ id, bg: bgName, facts: f, threw: String(e) }); continue; }
          if (got !== expected(f, id)) wrong.push({ id, bg: bgName, facts: f, got });
        }
  return { wrong, rows };
}

test("R8 R9 R10: the oracle covers exactly the acts in ACTS", () => {
  assert.deepEqual(Object.keys(ORACLE).sort(), ACTS.map((a) => a.id).sort());
  assert.deepEqual(Object.keys(NAMES).sort(), ACTS.map((a) => a.id).sort());
});

test("R8: each state-machine act is returned exactly when R8 says, on every type, state and combination of its facts", () => {
  const { wrong, rows } = checkActs(Object.keys(R8));
  assert.ok(rows > 10000, `a real corpus (${rows} rows)`);
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R9: cite, sever, reinstate and the roster acts are returned exactly when R9 says", () => {
  const { wrong, rows } = checkActs(Object.keys(R9));
  assert.ok(rows > 10000, `a real corpus (${rows} rows)`);
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R8 R9: the corpus is not degenerate — every act is both returned and withheld somewhere in it", () => {
  const seen = Object.fromEntries(ACTS.map((a) => [a.id, new Set()]));
  for (const a of ACTS) for (const ts of typestates) for (const [, bg] of BACKGROUNDS)
    for (const over of cross(NAMES[a.id])) seen[a.id].add(deriveActs(make(ts, bg, over)).includes(a));
  assert.deepEqual(ACTS.map((a) => a.id).filter((id) => seen[id].size !== 2), []);
});

/* R10, stated as equivalences. A fact the catalogue NARROWS on (a stated count above zero, a stated `false`, a
   stated case membership) answers, when null or absent, exactly as its non-narrowing value does; a fact the
   catalogue WIDENS on (a stated `true`) answers, when null or absent, exactly as its non-widening value does. */
const NULL_AS = {
  project_owner: true, project_participant: true, cites_in: { confirmed: 0, severed: 0 },
  rested_on: { working: 0, frozen: 0, severed: 0 },
  concludes_for_project: false, concluded_for_project: false, edition_warranted_for_project: false,
  project_target_owner: false, actor_is_machine: false,
};
test("R10: a null fact never narrows an act, and never widens one: null (or absent) answers exactly as the value "
   + "that neither narrows nor widens", () => {
  const wrong = [];
  for (const ts of typestates) for (const [bgName, bg] of BACKGROUNDS.slice(0, 2))
    for (const [k, same] of Object.entries(NULL_AS)) {
      const want = deriveActs(make(ts, bg, { [k]: same })).map((a) => a.id);
      for (const v of [null, undefined]) {
        const got = deriveActs(make(ts, bg, { [k]: v })).map((a) => a.id);
        if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push({ bg: bgName, k, v, ts, want, got });
      }
    }
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R10: case membership stated null answers as not a member for the acts it narrows (dispose, publish, divide, "
   + "group) and does not widen reopen", () => {
  const wrong = [];
  for (const ts of typestates) for (const [bgName, bg] of BACKGROUNDS.slice(0, 2)) {
    const want = deriveActs(make(ts, bg, { case_member: false })).map((a) => a.id);
    for (const v of [null, undefined]) {
      const got = deriveActs(make(ts, bg, { case_member: v })).map((a) => a.id);
      if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push({ bg: bgName, v, ts, want, got });
    }
  }
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R10: a null fact never offers a roster act — with no stated roster or target ownership, no roster act is returned", () => {
  const ROSTER_ACTS = ["projectinvite", "projectjoin", "projectleave", "projectremove", "projectowneradd",
    "projectownerremove", "projectownerrescue", "projectvisibilityset"];
  const wrong = [];
  for (const ts of typestates) for (const [, bg] of BACKGROUNDS)
    for (const roster of [null, undefined, { owner: null, state: null, owner_floor_clear: null, rescue_open: null }])
      for (const pto of [null, undefined]) {
        const f = make(ts, bg, { roster, project_target_owner: pto });
        const got = deriveActs(f).map((a) => a.id).filter((id) => ROSTER_ACTS.includes(id));
        if (got.length) wrong.push({ ts, roster, got });
      }
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R10: actor_is_machine true withholds exactly the acts in MACHINE_REFUSALS; null and false withhold nothing", () => {
  for (const ts of typestates) {
    const base = make(ts, PERMISSIVE, { actor_is_machine: false });
    const all = deriveActs(base).map((a) => a.id);
    assert.deepEqual(deriveActs({ ...base, actor_is_machine: null }).map((a) => a.id), all);
    const { actor_is_machine: _, ...unsent } = base;
    assert.deepEqual(deriveActs(unsent).map((a) => a.id), all);
    assert.deepEqual(deriveActs({ ...base, actor_is_machine: true }).map((a) => a.id),
      all.filter((id) => !(id in MACHINE_REFUSALS)));
  }
});

test("R8 R9: deriveActs returns the catalogue's own act objects, in catalogue order, and never throws on a facts "
   + "object holding only its type and state", () => {
  for (const ts of typestates) {
    const got = deriveActs(make(ts, ABSENT, {}));
    for (const a of got) assert.ok(ACTS.includes(a));
    assert.deepEqual(got.map((a) => ACTS.indexOf(a)), [...got.map((a) => ACTS.indexOf(a))].sort((x, y) => x - y));
  }
});

/* observation-log: the row-whole fence (R13), one arm per authority kind. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, entry, V, MACHINE } from "./fixture.mjs";
import { OBSERVATION_AUTHORITY_KINDS, RESOLVED_AUTHORITY_KINDS } from "../../../src/observation-log/index.mjs";

/* A world with an open document (INFO-2026-0001, capture `open`) and a hidden project PROJ-H holding capture `hidden`,
   joined by `inner`; `outer` is a member outside it. */
function fenced() {
  const w = world();
  const [open] = w.doc("INFO-2026-0001", ["open bytes"]);
  const hidden = w.projectDoc("PROJ-H", "hidden bytes");
  w.participant("PROJ-H", "inner");
  return { w, open, hidden };
}
const sees = (w, row, who) => {
  const one = w.obs.rowVisible(row, who);
  assert.equal(w.obs.rowGate(who)(row), one, "the compiled gate and the one-row answer agree");
  return one;
};

test("R13 a credential with no person behind it sees every row; an absent or unrecognised viewer sees none", () => {
  const { w, hidden } = fenced();
  const rows = [entry({ authority_kind: "lead", authority: "LEAD-x" }), entry({ result_kind: "capture", result_ref: hidden }),
                entry({ authority_kind: "objective", authority: "o" }), entry({ authority_kind: "gremlin", authority: "g" })];
  for (const r of rows) {
    assert.equal(sees(w, r, MACHINE), true);
    assert.equal(sees(w, r, "class:daemon"), true);
    for (const v of [null, undefined, "", "member:", "nobody", "token:abc"]) assert.equal(sees(w, r, v), false, String(v));
  }
  assert.equal(sees(w, entry({ authority: null }), null), false, "a row naming nothing is still withheld from an absent stamp");
});

test("R13 the capture referent: visible only when the bundle holding it is; a referent no bundle holds withholds the row", () => {
  const { w, open, hidden } = fenced();
  const row = (ref) => entry({ authority: null, result_kind: "capture", result_ref: ref });
  assert.equal(sees(w, row(open), V("outer")), true);
  assert.equal(sees(w, row(hidden), V("outer")), false);
  assert.equal(sees(w, row(hidden), V("inner")), true);
  assert.equal(sees(w, row("f".repeat(64)), V("inner")), false, "held by no bundle");
  assert.equal(sees(w, entry({ authority: null, result_kind: "reading", result_ref: hidden }), V("outer")), true,
    "only a capture referent names a bundle; a null authority names nothing");
});

test("R13 ratify, link, acquire, extract and derive: the bundle the authority names, or the bundle holding the capture it names; neither withholds", () => {
  const { w, open, hidden } = fenced();
  for (const k of ["ratify", "link", "acquire", "extract", "derive"]) {
    const row = (a) => entry({ authority_kind: k, authority: a });
    assert.equal(sees(w, row("INFO-2026-0001"), V("outer")), true, `${k} bundle`);
    assert.equal(sees(w, row(open), V("outer")), true, `${k} capture`);
    assert.equal(sees(w, row("PROJ-H"), V("outer")), false, `${k} hidden bundle`);
    assert.equal(sees(w, row(hidden), V("outer")), false, `${k} hidden capture`);
    assert.equal(sees(w, row("PROJ-H"), V("inner")), true);
    assert.equal(sees(w, row(hidden), V("inner")), true);
    assert.equal(sees(w, row("INFO-2099-9999"), V("inner")), false, `${k} unresolved`);
    // every bundle the row names: an open authority with a hidden capture referent is withheld
    assert.equal(sees(w, entry({ authority_kind: k, authority: "INFO-2026-0001", result_kind: "capture", result_ref: hidden }), V("outer")), false);
  }
});

test("R13 sweep: the registered resolver's bundles (a request's target and lead inquiry); with none registered or none held, a bundle of that id; else withheld", () => {
  const { w } = fenced();
  const row = (a) => entry({ authority_kind: "sweep", authority: a });
  // no resolver: a bundle of that id (the monitor's look names the bundle it runs under)
  assert.equal(sees(w, row("INFO-2026-0001"), V("outer")), true);
  assert.equal(sees(w, row("PROJ-H"), V("outer")), false);
  assert.equal(sees(w, row("CR-1"), V("inner")), false);
  const requests = { "CR-1": ["INFO-2026-0001"], "CR-2": ["INFO-2026-0001", "PROJ-H"], "CR-3": [] };
  assert.deepEqual(w.obs.registerAuthority("sweep", (a) => requests[a] ?? null), { ok: true, kind: "sweep" });
  assert.equal(sees(w, row("CR-1"), V("outer")), true);
  assert.equal(sees(w, row("CR-2"), V("outer")), false, "the target is open, the lead inquiry is not");
  assert.equal(sees(w, row("CR-2"), V("inner")), true);
  assert.equal(sees(w, row("CR-3"), V("outer")), true, "a request naming no bundle discloses nothing");
  assert.equal(sees(w, row("INFO-2026-0001"), V("outer")), true, "a resolver holding no such request falls back to the bundle");
  assert.equal(sees(w, row("CR-9"), V("inner")), false);
});

test("R13 run: what the registered resolver answers (may the viewer read the run); with none, a bundle of that id, which a run id never is", () => {
  const { w } = fenced();
  const row = entry({ authority_kind: "run", authority: "RUN-1" });
  assert.equal(sees(w, row, V("inner")), false, "no resolver: withheld");
  const asked = [];
  w.obs.registerAuthority("run", (run, viewer) => { asked.push([run, viewer]); return viewer === V("inner"); });
  assert.equal(sees(w, row, V("inner")), true);
  assert.equal(sees(w, row, V("outer")), false);
  assert.deepEqual(asked[0], ["RUN-1", V("inner")]);
  assert.equal(sees(w, entry({ authority_kind: "run", authority: "RUN-1", result_kind: "capture", result_ref: w.row(`SELECT capture_sha FROM register WHERE bundle_id='PROJ-H'`).capture_sha }), V("outer")), false,
    "the resolver's yes does not override a hidden referent");
});

test("R13 a lead, an objective and any other kind withhold the row from every identified viewer; every kind in the vocabulary has an arm", () => {
  const { w } = fenced();
  for (const k of ["lead", "objective", "member", "gremlin"]) {
    assert.equal(sees(w, entry({ authority_kind: k, authority: "x" }), V("inner")), false, k);
    /* D54 (K2408, K2442): the founder's viewer names a person, so it is an identified viewer like any other */
    assert.equal(sees(w, entry({ authority_kind: k, authority: "x" }), "admin"), false, `${k}: the founder is a person`);
    assert.equal(sees(w, entry({ authority_kind: k, authority: "x" }), MACHINE), true, "a credential with no person behind it");
  }
  for (const k of Object.keys(OBSERVATION_AUTHORITY_KINDS)) {
    const v = sees(w, entry({ authority_kind: k, authority: "INFO-2026-0001" }), V("outer"));
    assert.equal(v, !["lead", "objective"].includes(k), k);   // run, sweep and step with no resolver: a bundle of that id
  }
});

test("R13 registerAuthority: one resolver each for `sweep`, `run` and `step`; any other kind AUTHORITY_NOT_RESOLVABLE; a second registration or no function refused through membership's listenerRefusal with {kind}; the row is withheld whole", () => {
  const { w, hidden } = fenced();
  assert.deepEqual([...RESOLVED_AUTHORITY_KINDS], ["sweep", "run", "step"]);
  for (const k of [...Object.keys(OBSERVATION_AUTHORITY_KINDS).filter((k) => !RESOLVED_AUTHORITY_KINDS.includes(k)), "gremlin", null]) {
    const r = w.obs.registerAuthority(k, () => []);
    assert.deepEqual([r.ok, r.reason], [false, "AUTHORITY_NOT_RESOLVABLE"], String(k));
    // its detail names the three kinds and says "record", never "bundle" (N458)
    assert.match(r.detail, /^a resolver is registered for one of sweep, run, step; the records every other authority kind names are fixed/);
    assert.doesNotMatch(r.detail, /bundle/i);
  }
  // no function: membership R81's malformed refusal, the kind beside it, and nothing registered
  const bad = w.obs.registerAuthority("sweep", null);
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.kind], [false, "LISTENER_MALFORMED", "LISTENER_MALFORMED", "sweep"]);
  assert.equal(sees(w, entry({ authority_kind: "sweep", authority: "CR-1" }), V("inner")), false, "no resolver was recorded");
  assert.equal(w.obs.registerAuthority("sweep", () => null).ok, true);
  const again = w.obs.registerAuthority("sweep", () => ["INFO-2026-0001"]);
  assert.deepEqual([again.ok, again.reason, again.code, again.kind, again.module],
    [false, "LISTENER_DECLARED", "LISTENER_DECLARED", "sweep", "capture-requests"]);
  assert.equal(sees(w, entry({ authority_kind: "sweep", authority: "CR-1" }), V("inner")), false, "the first resolver still answers");
  // each kind is its own slot
  assert.deepEqual(w.obs.registerAuthority("run", () => false), { ok: true, kind: "run" });
  assert.deepEqual([w.obs.registerAuthority("run", () => true).reason, w.obs.registerAuthority("run", () => true).module],
    ["LISTENER_DECLARED", "ai-runs"]);
  // whole: the answer is a yes or no about the row, and the row is never returned with a column blanked
  const r = entry({ result_kind: "capture", result_ref: hidden });
  const copy = { ...r };
  assert.equal(typeof w.obs.rowVisible(r, V("outer")), "boolean");
  assert.deepEqual(r, copy);
  assert.equal(w.obs.rowVisible(null, V("outer")), false);
});

/* T41-11: authority kind `step` (R1, R13), resolved by `steps` R18 (a layer 6 module not yet built: the kind is accepted
   and named here; what it answers is that module's). */
test("R13 step: withheld with no resolver (a step id is no bundle); then what the registered resolver answers (does the viewer see the step); its yes never overrides a hidden referent; registered once, held under `steps`", () => {
  const { w, hidden } = fenced();
  const row = entry({ authority_kind: "step", authority: "STP-2026-0001" });
  assert.equal(sees(w, row, V("inner")), false, "no resolver, no bundle of that id: withheld");
  assert.equal(sees(w, row, MACHINE), true, "a credential with no person behind it sees every row");
  const asked = [];
  assert.deepEqual(w.obs.registerAuthority("step", (s, viewer) => { asked.push([s, viewer]); return viewer === V("inner"); }),
    { ok: true, kind: "step" });
  assert.equal(sees(w, row, V("inner")), true);
  assert.equal(sees(w, row, V("outer")), false, "negative control: the resolver's no withholds");
  assert.deepEqual(asked[0], ["STP-2026-0001", V("inner")]);
  assert.equal(sees(w, entry({ authority_kind: "step", authority: "STP-2026-0001", result_kind: "capture", result_ref: hidden }), V("outer")),
    false, "the resolver's yes does not override a hidden referent");
  const again = w.obs.registerAuthority("step", () => true);
  assert.deepEqual([again.ok, again.code, again.kind, again.module], [false, "LISTENER_DECLARED", "step", "steps"]);
  // negative control: the step resolver answers only `step` rows
  assert.equal(sees(w, entry({ authority_kind: "run", authority: "STP-2026-0001" }), V("inner")), false);
});

/* D54 (Bob's "D54: B", K2408; membership R43, R44, K2442): an administrator, the founder included, neither invited nor
   joined to a HIDDEN project sees it only at EXISTENCE, never its contents; so every row naming it is withheld whole.
   A discoverable project, and an invited administrator, stay at FULL (negative controls). */
function d54() {
  const { w, open, hidden } = fenced();
  for (const id of ["adm", "adm-inv"])
    w.st.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, ?, 'admin', 'active', 't', 't')`, id, id);
  w.participant("PROJ-H", "adm-inv", "invited");
  const disc = w.projectDoc("PROJ-D", "discoverable bytes");
  w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated) VALUES ('PROJ-D', 'own', 'joined', 1, 't', 't')`);
  const set = w.membership.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", reason: "open to the group", by: "own" });
  assert.equal(set.ok, true, JSON.stringify(set));
  return { w, open, hidden, disc };
}

test("R13 D54: the founder and an administrator neither invited nor joined see no row naming a hidden project (its capture or its id as the authority, at every bundle-named kind); an invited administrator and the founder invited still do", () => {
  const { w, hidden } = d54();
  const rows = [entry({ authority: null, result_kind: "capture", result_ref: hidden }),
                ...["ratify", "link", "acquire", "extract", "derive"].flatMap((k) => [
                  entry({ authority_kind: k, authority: "PROJ-H" }), entry({ authority_kind: k, authority: hidden })]),
                entry({ authority_kind: "sweep", authority: "PROJ-H" }), entry({ authority_kind: "run", authority: "PROJ-H" })];
  for (const r of rows) {
    const k = `${r.authority_kind}:${r.authority ?? r.result_ref}`;
    assert.equal(sees(w, r, "admin"), false, `founder, ${k}`);
    assert.equal(sees(w, r, V("admin")), false, `founder as member:admin, ${k}`);
    assert.equal(sees(w, r, V("adm")), false, `administrator, ${k}`);
    assert.equal(sees(w, r, V("adm-inv")), true, `negative control: an invited administrator, ${k}`);
    assert.equal(sees(w, r, V("inner")), true, `negative control: a joined participant, ${k}`);
    assert.equal(sees(w, r, MACHINE), true, `negative control: no person behind it, ${k}`);
  }
  w.participant("PROJ-H", "admin", "invited");
  for (const r of rows) assert.equal(sees(w, r, "admin"), true, "negative control: the founder invited");
});

test("R13 D54 negative control: a discoverable project's rows stay at FULL for the founder and every administrator, and stay withheld from a member outside it", () => {
  const { w, disc } = d54();
  const rows = [entry({ authority: null, result_kind: "capture", result_ref: disc }),
                ...["ratify", "link", "acquire", "extract", "derive"].map((k) => entry({ authority_kind: k, authority: "PROJ-D" }))];
  for (const r of rows) {
    for (const v of ["admin", V("adm"), V("adm-inv")]) assert.equal(sees(w, r, v), true, String(v));
    assert.equal(sees(w, r, V("outer")), false, "a member outside a discoverable project sees its existence, never a row");
  }
});

test("R13 D54: a registered resolver's yes (sweep, run, step) never opens a hidden project's referent to an administrator not invited or joined", () => {
  const { w, hidden } = d54();
  w.obs.registerAuthority("sweep", () => ["INFO-2026-0001"]);
  w.obs.registerAuthority("run", () => true);
  w.obs.registerAuthority("step", () => true);
  for (const k of ["sweep", "run", "step"]) {
    const r = entry({ authority_kind: k, authority: "X-1", result_kind: "capture", result_ref: hidden });
    assert.equal(sees(w, r, "admin"), false, k);
    assert.equal(sees(w, r, V("adm")), false, k);
    assert.equal(sees(w, r, V("adm-inv")), true, `negative control: ${k}`);
  }
});

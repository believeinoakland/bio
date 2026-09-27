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
    assert.equal(sees(w, entry({ authority_kind: k, authority: "x" }), "admin"), true, "the founder's credential names no person here");
  }
  for (const k of Object.keys(OBSERVATION_AUTHORITY_KINDS)) {
    const v = sees(w, entry({ authority_kind: k, authority: "INFO-2026-0001" }), V("outer"));
    assert.equal(v, !["lead", "objective"].includes(k), k);   // run and sweep with no resolver: a bundle of that id
  }
});

test("R13 registerAuthority: one resolver for `sweep` and one for `run`; any other kind, a second registration or no function is refused; the row is withheld whole", () => {
  const { w, hidden } = fenced();
  assert.deepEqual([...RESOLVED_AUTHORITY_KINDS], ["sweep", "run"]);
  assert.equal(w.obs.registerAuthority("acquire", () => []).reason, "AUTHORITY_NOT_RESOLVABLE");
  assert.equal(w.obs.registerAuthority("lead", () => true).reason, "AUTHORITY_NOT_RESOLVABLE");
  assert.equal(w.obs.registerAuthority("sweep", null).reason, "AUTHORITY_NOT_RESOLVABLE");
  assert.equal(w.obs.registerAuthority("sweep", () => null).ok, true);
  assert.equal(w.obs.registerAuthority("sweep", () => null).reason, "LISTENER_DECLARED");
  // whole: the answer is a yes or no about the row, and the row is never returned with a column blanked
  const r = entry({ result_kind: "capture", result_ref: hidden });
  const copy = { ...r };
  assert.equal(typeof w.obs.rowVisible(r, V("outer")), "boolean");
  assert.deepEqual(r, copy);
  assert.equal(w.obs.rowVisible(null, V("outer")), false);
});

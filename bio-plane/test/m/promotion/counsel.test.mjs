/* promotion R57 (T45; N892; Actions D4, v0.2 rules 15, 16): a counsel matter is never evidence. A promotion whose
 * document newly names, as a leg (`basis[]`) or a live `cites` entry (`references[]`), a bundle committed with a project
 * whose scope is `counsel_matter` (`project-roster` R23) is refused COUNSEL_MATTER_NOT_EVIDENCE and writes nothing,
 * unless the citing document is of that same project. Driven through `promote` over the doubles in ./fixtures.mjs, the
 * project-roster double answering R23's `projectScope`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { makePromotion, infoDoc, create, revise, T0 } from "./fixtures.mjs";
import { promotionOf, PROMOTION_CHECKS } from "../../../src/promotion/index.mjs";
import { makeRecord, makeMembership } from "./fixtures.mjs";

const COUNSEL = "PROJ-2026-0001-counsel", NONE = "PROJ-2026-0002-open", OTHER = "PROJ-2026-0003-other";
const IN_COUNSEL = "INFO-2026-0101", IN_COUNSEL_2 = "INFO-2026-0103", IN_NONE = "INFO-2026-0102", LOOSE = "INFO-2026-0104";
const Q = "INQ-2026-0201";
const ROW = PROMOTION_CHECKS.COUNSEL_MATTER_NOT_EVIDENCE;

/* A question's document stating `project` (or none), with `legs` in `basis[]` and `cites` (and `severed`, and any other
   `rels`) in `references[]`, in the record's grammar. */
function citing(id, { project = null, legs = [], cites = [], severed = [], rels = [], title = "A question" } = {}) {
  const refs = [...cites.map((t) => ["cites", t, "confirmed"]), ...severed.map((t) => ["cites", t, "severed"]),
                ...rels.map(([rel, t]) => [rel, t, "confirmed"])];
  return ["---", `id: ${id}`, "object_type: inquiry", `title: "${title}"`, "current_state: open", "prior_state: null",
    `created: "${T0}"`, `last_updated: "${T0}"`, "group: test-group", ...(project ? [`project: ${project}`] : []),
    ...(legs.length ? ["basis:", ...legs.flatMap((t) => [`  - target: ${t}`, "    role: supports"])] : []),
    ...(refs.length ? ["references:", ...refs.flatMap(([rel, t, st]) => [`  - rel: ${rel}`, `    target: ${t}`,
                                                                          `    status: ${st}`])] : []),
    "---", "", "## Question", "", "Is it so?", "", "## Session Log", ""].join("\n");
}

/* A project's own document (a case), its `cites` edges in `references[]`. */
function projectDoc({ id = null, title, cites = [] }) {
  return ["---", ...(id ? [`id: ${id}`] : []), "object_type: project", `title: "${title}"`, "current_state: forming",
    "prior_state: null", `created: "${T0}"`, `last_updated: "${T0}"`, "group: test-group",
    ...(cites.length ? ["references:", ...cites.flatMap((t) => ["  - rel: cites", `    target: ${t}`, "    status: confirmed"])]
                     : []),
    "---", "", "## Session Log", ""].join("\n");
}

/* A record holding two bundles of the counsel matter, one of a `none` project and one of no project. */
function world(scopes = { [COUNSEL]: "counsel_matter", [NONE]: "none" }) {
  const env = makePromotion({ scopes });
  for (const [id, project] of [[IN_COUNSEL, COUNSEL], [IN_COUNSEL_2, COUNSEL], [IN_NONE, NONE], [LOOSE, null]]) {
    const r = env.p.promote(create(id, infoDoc(id, project ? { project } : {})));
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  return env;
}

function refused(env, pkg, targets) {
  const before = env.record.dump();
  const r = env.p.promote(pkg);
  assert.equal(r.ok, false, JSON.stringify(r));
  assert.equal(r.reason, "COUNSEL_MATTER_NOT_EVIDENCE");
  assert.equal(r.check, "C-86.16");
  assert.equal(r.translation, ROW.translation);
  assert.deepEqual(r.targets, targets);
  assert.doesNotMatch(targets.reduce((d, t) => d.split(t).join(""), r.detail), /PROJ-/,
                      "the refusal names the targets the writer named and no project");
  assert.equal(env.record.dump(), before, "a refused promotion writes nothing (R2)");
  return r;
}
function accepted(env, pkg) {
  const r = env.p.promote(pkg);
  assert.equal(r.ok, true, JSON.stringify(r));
  return r;
}

test("R57: COUNSEL_MATTER_NOT_EVIDENCE is C-86.16, its row naming the region that mints it", () => {
  assert.deepEqual(Object.keys(ROW).sort(), ["check", "translation", "where"]);
  assert.equal(ROW.check, "C-86.16");
  assert.equal(ROW.where, "src/promotion/index.mjs #promote > is-counsel-matter-evidence");
});

test("R57: a leg naming a counsel matter's bundle, from another project or from none, is refused and writes nothing", () => {
  for (const project of [OTHER, NONE, null]) {
    const env = world();
    refused(env, create(Q, citing(Q, { project, legs: [IN_COUNSEL] })), [IN_COUNSEL]);
    assert.ok(env.roster.asked.includes(COUNSEL), "the scope is project-roster R23's");
  }
});

test("R57: a cites entry naming a counsel matter's bundle is refused, naming every such target and no other", () => {
  const env = world();
  refused(env, create(Q, citing(Q, { project: OTHER, cites: [IN_COUNSEL_2, IN_NONE, LOOSE] })), [IN_COUNSEL_2]);
  const both = refused(env, create(Q, citing(Q, { project: OTHER, legs: [IN_COUNSEL], cites: [IN_COUNSEL_2] })),
                       [IN_COUNSEL, IN_COUNSEL_2]);
  assert.match(both.detail, /^INFO-2026-0101, INFO-2026-0103 are kept in a counsel matter of another project/);
});

test("R57: a case (a project's own document) citing a counsel matter's bundle is refused; citing its own is accepted", () => {
  const env = world();
  const made = accepted(env, { base: null, snapKey: "p1", author: "member:ann", ownerMemberId: "ann",
                                files: [{ path: "bundle.md", text: projectDoc({ title: "Counsel" }) }], meta: {} });
  const counsel = made.bundleId;
  env.roster.scopes[counsel] = "counsel_matter";
  /* The counsel matter's own project document is its project: not citable from another case or question. */
  refused(env, create(Q, citing(Q, { project: OTHER, cites: [counsel] })), [counsel]);
  const kase = accepted(env, { base: null, snapKey: "p2", author: "member:ann", ownerMemberId: "ann",
                               files: [{ path: "bundle.md", text: projectDoc({ title: "Another case" }) }], meta: {} });
  refused(env, revise(kase.bundleId, kase.bundleSha, projectDoc({ id: kase.bundleId, title: "Another case",
                                                                   cites: [IN_NONE, IN_COUNSEL] })), [IN_COUNSEL]);
  /* Control: the counsel matter's own case cites its own bundle (written into it with its project). */
  const own = accepted(env, create("INFO-2026-0105", infoDoc("INFO-2026-0105", { project: counsel })));
  assert.ok(own.ok);
  accepted(env, revise(counsel, made.bundleSha, projectDoc({ id: counsel, title: "Counsel", cites: ["INFO-2026-0105"] })));
});

test("R57 controls: the same reference from inside the counsel matter's project, and references to a `none` project's or "
     + "an unprojected bundle, are accepted", () => {
  const env = world();
  accepted(env, create(Q, citing(Q, { project: COUNSEL, legs: [IN_COUNSEL], cites: [IN_COUNSEL_2] })));
  accepted(env, create("INQ-2026-0202", citing("INQ-2026-0202", { project: OTHER, legs: [IN_NONE], cites: [LOOSE] })));
  accepted(env, create("INQ-2026-0203", citing("INQ-2026-0203", { legs: [IN_NONE, LOOSE] })));
  /* A project with no scope record is `none` (project-roster R23). */
  delete env.roster.scopes[NONE];
  accepted(env, create("INQ-2026-0204", citing("INQ-2026-0204", { project: OTHER, cites: [IN_NONE] })));
});

test("R57: only legs and live cites entries are evidence; a severed edge or another rel naming the counsel matter is not "
     + "refused", () => {
  const env = world();
  accepted(env, create(Q, citing(Q, { project: OTHER, severed: [IN_COUNSEL],
                                      rels: [["derived_from", IN_COUNSEL_2], ["responds_to", IN_COUNSEL]] })));
});

test("R57: a scope set after a document was promoted changes nothing already promoted; what a revision newly names is "
     + "asked", () => {
  const env = world({ [NONE]: "none" });
  const first = accepted(env, create(Q, citing(Q, { project: OTHER, legs: [IN_COUNSEL], severed: [IN_COUNSEL_2] })));
  env.roster.scopes[COUNSEL] = "counsel_matter";
  /* A revision carrying the earlier citation forward, unchanged in what it rests on, is accepted. */
  const carried = accepted(env, revise(Q, first.bundleSha,
    citing(Q, { project: OTHER, legs: [IN_COUNSEL], severed: [IN_COUNSEL_2], title: "A question, re-worded" })));
  /* A revision naming a new one is refused: a new leg, and reinstating the severed edge. */
  refused(env, { ...revise(Q, carried.bundleSha, citing(Q, { project: OTHER, legs: [IN_COUNSEL, IN_COUNSEL_2],
                                                             severed: [IN_COUNSEL_2] })), snapKey: "k3" }, [IN_COUNSEL_2]);
  refused(env, { ...revise(Q, carried.bundleSha, citing(Q, { project: OTHER, legs: [IN_COUNSEL], cites: [IN_COUNSEL_2] })),
                 snapKey: "k3" }, [IN_COUNSEL_2]);
  /* A creation is asked about everything it names. */
  refused(env, create("INQ-2026-0205", citing("INQ-2026-0205", { project: OTHER, legs: [IN_COUNSEL] })), [IN_COUNSEL]);
});

test("R57: a replay is not exempt", () => {
  const env = world();
  refused(env, { ...create(Q, citing(Q, { project: OTHER, legs: [IN_COUNSEL] })), replay: true }, [IN_COUNSEL]);
});

test("R57, R17: a scope that cannot be read abstains: the fence neither refuses nor passes on it", () => {
  const record = makeRecord(), membership = makeMembership();
  const p = promotionOf({}, { record, membership, now: () => "2026-09-26T12:00:00.000Z",
                              roster: { projectScope() { throw new Error("unreadable"); } } });
  p.registerFact("producingGroup", "test", () => "test-group");
  assert.equal(p.promote(create(IN_COUNSEL, infoDoc(IN_COUNSEL, { project: COUNSEL }))).ok, true);
  const r = p.promote(create(Q, citing(Q, { project: OTHER, legs: [IN_COUNSEL] })));
  assert.equal(r.ok, true, JSON.stringify(r));
});

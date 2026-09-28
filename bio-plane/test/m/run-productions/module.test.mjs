/* run-productions: the narrow candidate source (R14), the checks it carries (R16), its tables and their purge (R17),
   no place in its outward text (R19), and the factory. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as RP from "../../../src/run-productions/index.mjs";
import { SUGGEST_CHECKS as CATALOGUE_SUGGEST, EXTRACT_PROPOSE_CHECKS as CATALOGUE_EXTRACT } from "../../../checks/bio-checks.mjs";
import { world, Q, Q2, DOC, DOC2, RUN, ALICE, BOB, MACHINE } from "./fixture.mjs";

const AK = "class:ai/k1";
const CHAIN = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
               { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
                 extent: { kind: "pages", pages: [0, 1, 2] } }];

function extractWorld(mints = 20) {
  const w = world();
  w.inquiry(Q); w.inquiry(Q2);
  w.run(RUN);
  const cap = w.doc(DOC);
  w.ex.readings[cap] = { chain: CHAIN, pageCount: 3 };
  w.run("RUN-E", { mode: "extract", principal_plane: AK, mints });
  const propose = (refs, at) => w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
                                                     refs, proposedBy: AK, viewer: ALICE, caller: AK, at });
  return { w, cap, propose };
}

test("R14: for a capture, the proposals with a position, newest first, at most the count asked, read one past it for truncated, each {run, ref, label, position, content_id, proposed_by, mint label}", () => {
  const { w, cap, propose } = extractWorld();
  propose([{ ref: "ordinance:1", refKind: "ordinance", refKey: "1", source: { kind: "pdf-page", page: 0, ref: "page 1" } }], "2026-09-28T01:00:00Z");
  propose([{ ref: "ordinance:2", refKind: "ordinance", refKey: "2", source: { kind: "pdf-page", page: 1, ref: "page 2" } }], "2026-09-28T02:00:00Z");
  propose([{ ref: "a name", label: "The Clerk" }], "2026-09-28T03:00:00Z");
  const two = w.p.candidates({ captureSha: cap, max: 5 });
  assert.equal(two.truncated, false);
  assert.deepEqual(two.rows.map((r) => r.ref), ["ordinance:2", "ordinance:1"], "positioned only, newest first");
  const [r] = two.rows;
  assert.deepEqual(Object.keys(r).sort(), ["content_id", "label", "mint", "position", "proposed_by", "ref", "run"]);
  assert.deepEqual([r.run, r.proposed_by, r.position.kind, r.position.page, r.mint.machine_work], ["RUN-E", AK, "pdf-page", 1, true]);
  assert.match(r.content_id, /^[0-9a-f]{64}$/);
  const one = w.p.candidates({ captureSha: cap, max: 1 });
  assert.deepEqual([one.rows.length, one.truncated], [1, true]);
  assert.deepEqual(w.p.candidates({ captureSha: "0".repeat(64), max: 5 }), { truncated: false, rows: [] });
});

test("R14: the source is registered with basis-versions' onCandidates (its R40) when basis-versions offers it", () => {
  const { w } = extractWorld();
  assert.deepEqual(w.candidateSources.map((s) => s.module), ["run-productions"]);
  const fn = w.candidateSources[0].fn;
  assert.deepEqual(fn({ captureSha: "0".repeat(64), max: 3 }), { truncated: false, rows: [] });
});

test("R16: every C-27 row but C-27.15 and every C-104 row is this module's, read from the catalogue unchanged, and each is minted by this module with its row", () => {
  assert.deepEqual([...RP.SUGGEST_CHECK_KEYS].sort(), Object.keys(CATALOGUE_SUGGEST).filter((k) => k !== "VERSION_KIND_UNKNOWN").sort());
  assert.deepEqual([...RP.EXTRACT_PROPOSE_CHECK_KEYS].sort(), Object.keys(CATALOGUE_EXTRACT).sort());
  for (const k of RP.SUGGEST_CHECK_KEYS) assert.equal(RP.SUGGEST_CHECKS[k], CATALOGUE_SUGGEST[k]);
  for (const k of RP.EXTRACT_PROPOSE_CHECK_KEYS) assert.equal(RP.EXTRACT_PROPOSE_CHECKS[k], CATALOGUE_EXTRACT[k]);
  /* Drive every code once, and collect what the module minted. */
  const driven = new Map();
  const see = (r) => { if (r && r.ok === false && r.code) driven.set(r.code, r); return r; };
  const { w, propose } = extractWorld();
  w.inquiry(Q2, [{ name: "held" }]);
  w.st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                 VALUES ('INQ-2026-0003-nofile', 'inquiry', 'g', 't', 'open', 't', 't', 'sha')`);
  w.run("RUN-Q2", { context_id: Q2 }); w.run("RUN-NF", { context_id: "INQ-2026-0003-nofile" });
  w.run("RUN-END", { status: "completed" });
  const S = (o) => see(w.suggest(o));
  S({ target: "" }); S({ target: DOC }); S({ kind: "x" }); S({ run: "none" }); S({ run: "RUN-END" }); S({ target: Q2 });
  S({ target: "INQ-2026-0003-nofile", run: "RUN-NF" }); S({ target: Q2, run: "RUN-Q2", name: "held" });
  S({ name: "t", legs: Array.from({ length: 121 }, () => ({ target: DOC })) }); S({ name: "e", kind: "level-empty" });
  S({ name: "s", state: "accepted" }); S({ name: "b", description: "tbd" });
  S({ name: "u", legs: [{ target: "INFO-2026-0099-x", role: "supports", ground: "g" }], grounds: [{ ground: "g", statement: "the one part" }] });
  w.strength.error = "x"; S({ name: "p" }); w.strength.error = null;
  w.strength.independence = { checked: true, parts: 2, shared: [], complete: false, limit: 200 }; S({ name: "i" });
  w.strength.independence = { checked: true, parts: 2, shared: [{ a: "a", b: "b", through: ["bundle:x"] }], complete: true, limit: 200 }; S({ name: "n" });
  w.strength.independence = null;
  assert.equal(w.suggest({ name: "d1" }).ok, true); S({ name: "d2" });
  w.basisVersions.unsplice = true; S({ name: "w", claim: "a different claim" }); w.basisVersions.unsplice = false;
  w.run("RUN-EE", { mode: "extract", principal_plane: AK, status: "completed", mints: 1 });
  w.run("RUN-C", { mode: "check", principal_plane: AK, mints: 1 });
  w.run("RUN-NB", { mode: "extract", principal_plane: AK });
  w.run("RUN-F", { mode: "extract", principal_plane: AK, mints: 1 }); w.bounds.set("RUN-F|mints", { allowed: 1, consumed: 1 });
  w.run("RUN-1M", { mode: "extract", principal_plane: AK, mints: 1 });
  const P = (o) => see(w.p.extractPropose({ run: "RUN-E", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
                                            refs: [{ ref: "k:1", refKind: "k", refKey: "1" }], proposedBy: AK, viewer: ALICE, caller: AK, ...o }));
  P({ proposedBy: "" }); P({ run: "" }); P({ run: "none" }); P({ run: "RUN-EE" }); P({ run: "RUN-C" }); P({ run: "RUN-NB" });
  P({ run: "RUN-F" }); P({ refs: [] }); P({ bundleId: Q }); w.doc(DOC2, "unread", { read: false });
  w.registered[DOC2] = []; P({ bundleId: DOC2 });
  P({ run: "RUN-1M", refs: [{ ref: "k:1", refKind: "k", refKey: "1", source: { kind: "pdf-page", page: 0, ref: "p1" } },
                            { ref: "k:2", refKind: "k", refKey: "2", source: { kind: "pdf-page", page: 1, ref: "p2" } }] });
  see(w.p.extractProposals({ viewer: ALICE }));
  const mine = [...RP.SUGGEST_CHECK_KEYS, ...RP.EXTRACT_PROPOSE_CHECK_KEYS].sort();
  assert.deepEqual(mine.filter((k) => !driven.has(k)), [], "every row this module carries is driven out of it");
  for (const k of mine) {
    const row = RP.SUGGEST_CHECKS[k] || RP.EXTRACT_PROPOSE_CHECKS[k];
    assert.deepEqual([driven.get(k).check, driven.get(k).translation], [row.check, row.translation], k);
  }
});

test("R17: proposed_readings (by bundle) and suggest_refusals (by target) are declared to record-core's purge: a bundle's purge takes its own, the whole-store purge takes all", () => {
  const { w, propose } = extractWorld();
  propose([{ ref: "k:1", refKind: "k", refKey: "1" }]);
  w.suggest({ name: "b", description: "tbd" });
  w.run("RUN-Q2", { context_id: Q2 });
  w.suggest({ target: Q2, run: "RUN-Q2", name: "b", description: "tbd" });
  assert.deepEqual([w.count("proposed_readings"), w.count("suggest_refusals")], [1, 2]);
  assert.deepEqual(w.p.counts(), { proposedReadings: 1, suggestRefusals: 2 });
  w.record.purge({ bundleId: Q });
  assert.deepEqual([w.count("proposed_readings"), w.count("suggest_refusals")], [1, 1], "the question's refusals went, the document's proposals stayed");
  w.record.purge({ bundleId: DOC });
  assert.equal(w.count("proposed_readings"), 0);
  w.record.purge({});
  assert.equal(w.count("suggest_refusals"), 0);
  assert.equal(RP.runProductionsOwns("proposed_readings") && RP.runProductionsOwns({ name: "suggest_refusals" }), true);
  assert.equal(RP.runProductionsOwns("ai_runs"), false);
});

test("R17: the counts op=stats reports leave out the rows naming a bundle the caller may not see", () => {
  const { w, propose } = extractWorld();
  propose([{ ref: "k:1", refKind: "k", refKey: "1" }]);
  w.suggest({ name: "b", description: "tbd" });
  const hid = { sql: "(?)", args: [DOC] };
  assert.deepEqual(w.p.counts(hid), { proposedReadings: 0, suggestRefusals: 1 });
});

test("R19: no place is named in this module's behaviour or outward text — its rows' translations, its sentences, and every refusal it composed in these tests", () => {
  const PLACE = /oakland|alameda|california|berkeley|san francisco|\bcity of\b|\bcounty\b/i;
  const texts = [
    ...Object.values(RP.SUGGEST_CHECKS).map((r) => r.translation), ...Object.values(RP.EXTRACT_PROPOSE_CHECKS).map((r) => r.translation),
    RP.EXTRACT_PROPOSALS_SAYS, RP.EXTRACT_PROPOSAL_ROW_SAYS, ...Object.values(RP.SUGGEST_KINDS),
  ];
  const { w, propose } = extractWorld();
  for (const o of [{ target: "" }, { kind: "x" }, { run: "none" }, { name: "b", description: "tbd" }, { name: "s", state: "x" }])
    texts.push(JSON.stringify(w.suggest(o)));
  texts.push(JSON.stringify(propose([{ ref: "k:1", refKind: "k", refKey: "1" }])));
  texts.push(JSON.stringify(w.p.extractProposals({ viewer: ALICE })), JSON.stringify(w.p.extractProposals({ run: "RUN-E", viewer: ALICE })));
  assert.deepEqual(texts.filter((t) => PLACE.test(t)), []);
});

test("K61: runProductionsOf answers one instance per storage, and a provider neither given nor handed over is refused loudly rather than guessed", () => {
  const { w } = extractWorld();
  assert.equal(RP.runProductionsOf(w.host), w.p);
  assert.throws(() => RP.runProductionsOf({ storage: w.st }, { record: w.record, membership: w.membership, content: w.content,
                                                                connections: w.connections }), /no aiRuns provider/);
});

test("R3's constants are published: the legs bound, the origin limit, the versions bound, the member-only fields and the three axes", () => {
  assert.deepEqual([RP.SUGGEST_LEGS_MAX, RP.SUGGEST_ORIGIN_MAX, RP.SUGGEST_VERSIONS_MAX], [120, 200, 1000]);
  assert.deepEqual([...RP.SUGGEST_UNWRITABLE_FIELDS], ["state", "hidden", "state_by", "state_at", "state_reason", "at", "affirmed_parts", "affirmed"]);
  assert.deepEqual([...RP.PAIR_AXES], ["capture", "connection", "testimony"]);
  assert.deepEqual(RP.posFields({ kind: "pdf-page", ref: "p1", page: 0, rect: [0, 0, 1, 1] }), { page: 0, rect: [0, 0, 1, 1] });
  assert.equal(RP.substanceOf("name\ta\nkind\tk\nderived_from\tb\nground\tg\tm\t2026\ts"), "kind\tk\nground\tg\tm\t\ts");
});

test("R3 through the extracted providers: strength's candidatePair and candidateIndependence (its R26, R27) and citation's retiredNotCitable (its R5), reached through their factories", async () => {
  const { strengthOf } = await import("../../../src/strength/index.mjs");
  const { citationOf } = await import("../../../src/citation/index.mjs");
  const w = world({ real: true });
  assert.equal(w.p.strength, strengthOf(w.host));
  assert.equal(w.p.citation, citationOf(w.host));
  w.inquiry(Q); w.run(RUN);
  w.doc(DOC); w.doc(DOC2, "retired doc", { state: "retired" });
  const PART = [{ ground: "paper", statement: "the paper trail of the approval" }];
  const leg = (target, over = {}) => ({ target, role: "supports", ground: "paper", ...over });
  const retired = w.suggest({ name: "r", legs: [leg(DOC2)], grounds: PART });
  assert.equal(retired.code, "SUGGEST_LEG_UNREACHABLE");
  assert.equal(retired.legs[0].why, "the record has RETIRED it");
  const ok = w.suggest({ name: "g", legs: [leg(DOC, { grade: "B", grade_axis: "capture", grade_source: "capture" })], grounds: PART });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual([ok.pair.capture.state, ok.pair.capture.grade, ok.pair.connection.state, ok.pair.testimony.state],
                   ["graded", "B", "unrated", "unrated"]);
  assert.deepEqual([ok.origins_complete, ok.shared_origins, ok.origin_limit], [true, [], 200]);
  /* A hunch is inert in the pair, and named (strength R5): the reading rests on nothing graded. */
  const hunch = w.suggest({ name: "h", legs: [leg(DOC, { grade: "A", grade_axis: "capture", grade_source: "hunch" })], grounds: PART });
  assert.equal(hunch.ok, true);
  assert.equal(hunch.pair.capture.state, "unrated");
  /* Two parts resting on one document share an upstream origin: refused C-27.11 by strength's own trace. */
  const two = [{ ground: "paper", statement: "one part of it" }, { ground: "record", statement: "the other part" }];
  const shared = w.suggest({ name: "s", legs: [leg(DOC), leg(DOC, { ground: "record" })], grounds: two });
  assert.equal(shared.code, "SUGGEST_BRANCHES_NOT_INDEPENDENT");
  assert.deepEqual(shared.shared.map((x) => [x.a, x.b]), [["paper", "record"]]);
});

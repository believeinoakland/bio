/* reevaluation: a case edition withdrawn or contested on its docket (R30; DEC-116 items 3, 7, N520), the withdrawal half
   of a project's `wp_retraction` (R16) and the two kinds R8's listeners are told. `docket` (layer 8) fills the
   registration and is built after this module, so it is a stand-in here: `withdrawals` and `contested` answer the
   entries the test lays down, paged by a numeric cursor, in the shapes R30's registration reads. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { CAUSE_SOURCES, DOCKET_KINDS, REEVALUATION_ACT_CHECKS } from "../../../src/reevaluation/index.mjs";

const F = "INQ-2026-0001-member", G = "INQ-2026-0002-member2";
const DEP = "INQ-2026-0003-dep", DEP2 = "INQ-2026-0004-dep2", DEP3 = "INQ-2026-0005-dep3";
const CASE = "CASE-2026-0001-one";
const ADMIN = "class:admin";
const T1 = "2026-09-29T00:00:00Z", T2 = "2026-09-30T00:00:00Z", T3 = "2026-10-01T00:00:00Z";

/** The docket stand-in: `page` entries at a time (default 200). The lists are live: a push is read by the next answer. */
function docket(w, { withdrawals = [], contested = [], page = 200, failing = false } = {}) {
  const d = { withdrawals, contested, asked: 0 };
  const pager = (list, key) => ({ after = "", limit = 200 }) => {
    d.asked++;
    if (failing) throw new Error("docket unreadable");
    const i = after ? Number(after) : 0, n = Math.min(limit, page);
    return { [key]: list.slice(i, i + n), cursor: i + n < list.length ? String(i + n) : null };
  };
  assert.deepEqual(w.r.registerDocket("docket", { withdrawals: pager(d.withdrawals, "withdrawals"),
                                                  contested: pager(d.contested, "contested") }),
                   { ok: true, module: "docket" });
  return d;
}

/** F and G are member findings; DEP rests on F with no edition named (F's live head), DEP2 on F at edition 1 and DEP3
 *  on G. Answers the world and F's head and edition-1 shas. */
function setup() {
  const w = world();
  w.inquiry(F, {});
  w.inquiry(G, {});
  const head = w.record.head(F).bundleSha;
  w.publish(F, 1);
  const ed1 = "e".repeat(64);
  w.published.value[F].editions["1"].bundle_sha = ed1;
  w.inquiry(DEP, { legs: [{ target: F }] });
  w.inquiry(DEP2, { legs: [{ target: F, target_edition: 1 }] });
  w.inquiry(DEP3, { legs: [{ target: G }] });
  return { w, head, ed1, gHead: w.record.head(G).bundleSha };
}
const withdrawal = (findings, { entry = "W-1", at = T2, editions = [1], project = null, seq = 1 } = {}) =>
  ({ case: CASE, project, editions, findings, at, seq, entry });
const causesOf = (r, source) => r.obligations.flatMap((o) => o.causes.filter((c) => c.source === source)
  .map((c) => [o.bundle_id, o.target, c.entry, c.since]));

test("R30: one registration; a malformed one is LISTENER_MALFORMED and a second LISTENER_DECLARED, both membership's (its R81)", () => {
  const w = world();
  for (const fns of [null, {}, { withdrawals: () => ({}) }, { contested: () => ({}) }, { withdrawals: 1, contested: () => ({}) }])
    assert.equal(w.r.registerDocket("docket", fns).reason, "LISTENER_MALFORMED", JSON.stringify(fns));
  assert.equal(w.r.registerDocket("", { withdrawals: () => ({}), contested: () => ({}) }).reason, "LISTENER_MALFORMED");
  docket(w);
  assert.equal(w.r.registerDocket("docket", { withdrawals: () => ({}), contested: () => ({}) }).reason, "LISTENER_DECLARED");
  assert.equal(w.r.registerDocket("other", { withdrawals: () => ({}), contested: () => ({}) }).reason, "LISTENER_DECLARED");
  assert.deepEqual(DOCKET_KINDS, ["withdrawal", "contested"]);
  for (const k of DOCKET_KINDS) assert.ok(CAUSE_SOURCES.includes(k), `${k} is a cause source`);
});

test("R30 (a) R2: a live leg resting on a member finding of a withdrawn edition at the sha it pinned carries withdrawal, since the signing instant, detail naming the case, edition and entry", () => {
  const { w, head, ed1 } = setup();
  /* a withdrawal pinning F at its live head: DEP (no edition named) rests there; DEP2 names edition 1, another sha */
  const d = docket(w, { withdrawals: [withdrawal([{ bundle_id: F, sha: head, edition: 1 }])] });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r, "withdrawal"), [[DEP, F, "W-1", T2]]);
  const [o] = r.obligations;
  assert.deepEqual(o.reeval, { flag: true, since: T2, source: "withdrawal" });
  const c = o.causes[0];
  assert.deepEqual([c.case, c.edition, c.withdrawn_editions, c.finding, c.sha, c.ord, c.cited_edition],
                   [CASE, 1, [1], F, head, 0, null]);
  assert.match(c.detail, new RegExp(`case ${CASE} edition 1, which was withdrawn on its docket \\(entry W-1`));
  assert.deepEqual([r.docket_absent, r.docket_read], [undefined, undefined]);
  /* the targeted read answers the same */
  assert.deepEqual(causesOf(w.r.reevaluations({ target: F, viewer: ADMIN }), "withdrawal"), [[DEP, F, "W-1", T2]]);
  /* a second withdrawal pins F at edition 1's sha: DEP2, naming edition 1, rests there */
  d.withdrawals.push(withdrawal([{ bundle_id: F, sha: ed1, edition: 1 }], { entry: "W-2", at: T3, seq: 2 }));
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN }), "withdrawal"), [[DEP, F, "W-1", T2], [DEP2, F, "W-2", T3]]);
  /* an entry naming no entry id is named by its case and seq */
  d.withdrawals.push({ case: CASE, editions: [2], findings: [{ bundle_id: F, sha: head }], at: T3, seq: 7 });
  assert.deepEqual(causesOf(w.r.reevaluations({ target: F, viewer: ADMIN }), "withdrawal").map((x) => x[2]),
                   [`${CASE}#7`, "W-1", "W-2"], "in (dependent, ord, entry) order");
});

test("R30 (a) R7: a pin at another sha, a finding not pinned, and a leg that is not live raise nothing", () => {
  const { w, gHead } = setup();
  docket(w, { withdrawals: [withdrawal([{ bundle_id: F, sha: "0".repeat(64) }, { bundle_id: G, sha: "1".repeat(64) }])] });
  assert.deepEqual(causesOf(w.r.reevaluations({ viewer: ADMIN }), "withdrawal"), [], "no leg rests at the pinned shas");
  /* a pin at G's head, but DEP3 divided: a divided citer's legs are frozen history (R7) */
  const w2 = setup();
  docket(w2.w, { withdrawals: [withdrawal([{ bundle_id: G, sha: w2.gHead }])] });
  assert.deepEqual(causesOf(w2.w.r.reevaluations({ viewer: ADMIN }), "withdrawal"), [[DEP3, G, "W-1", T2]]);
  w2.w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id=?`, DEP3);
  assert.deepEqual(causesOf(w2.w.r.reevaluations({ viewer: ADMIN }), "withdrawal"), [], "a leg that is not live carries none");
  assert.ok(gHead);
});

test("R30 (b): each member finding of an edition a contesting entry names carries contested, its own target, since the filing instant", () => {
  const { w } = setup();
  const d = docket(w, { contested: [{ case: CASE, edition: 1, findings: [{ bundle_id: F, sha: "a".repeat(64) },
                                                                          { bundle_id: G, sha: "b".repeat(64) }],
                                      at: T1, entry: "R-1" }] });
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(causesOf(r, "contested"), [[F, F, "R-1", T1], [G, G, "R-1", T1]]);
  const o = r.obligations.find((x) => x.bundle_id === F);
  assert.deepEqual([o.target, o.legs, o.reeval], [F, [], { flag: true, since: T1, source: "contested" }]);
  const c = o.causes[0];
  assert.deepEqual([c.case, c.edition, c.entry], [CASE, 1, "R-1"]);
  assert.match(c.detail, /contests that edition \(entry R-1, filed at .*no entry is evidence/);
  /* the targeted read names it of the finding itself; another target does not */
  assert.deepEqual(causesOf(w.r.reevaluations({ target: F, viewer: ADMIN }), "contested"), [[F, F, "R-1", T1]]);
  assert.deepEqual(causesOf(w.r.reevaluations({ target: DEP, viewer: ADMIN }), "contested"), []);
  /* a second contesting entry: two causes, in entry order */
  d.contested.push({ case: CASE, edition: 2, findings: [{ bundle_id: F, sha: "c".repeat(64) }], at: T3, entry: "R-0" });
  assert.deepEqual(causesOf(w.r.reevaluations({ target: F, viewer: ADMIN }), "contested").map((x) => x[2]), ["R-0", "R-1"]);
});

test("R16 (N520): a project carries wp_retraction when an edition of a case it owns is withdrawn, since the signing instant, detail naming the case, editions and entry", () => {
  const w = world();
  w.member("owen");
  const P = w.project("Work", "owen");
  /* a leg naming a project is one the record already holds (C-2.8): laid down as a replay */
  const res = w.promotion.promote({ bundleId: DEP, base: null, snapKey: "legacy-1", author: "member:alice",
    files: [{ path: "bundle.md", text: inquiryMd(DEP, { legs: [{ target: P }] }) }], meta: { object_type: "inquiry" }, replay: true });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  /* with nothing registered the half is not raised and the answer says so */
  const none = w.r.reevaluations({ target: P, viewer: ADMIN });
  assert.deepEqual([none.count, none.docket_absent], [0, true]);
  assert.match(none.docket_why, /not the same as none/);
  docket(w, { withdrawals: [withdrawal([], { project: P, editions: [1, 2], entry: "W-9", at: T3 })] });
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ target: P, viewer: ADMIN })]) {
    const [o] = r.obligations;
    const c = o.causes.find((x) => x.source === "wp_retraction");
    assert.deepEqual([o.bundle_id, o.target, c.case, c.withdrawn_editions, c.entry, c.since], [DEP, P, CASE, [1, 2], "W-9", T3]);
    assert.match(c.detail, new RegExp(`case ${CASE}, a work product of ${P}, was withdrawn on its docket: editions 1, 2 \\(entry W-9`));
    assert.equal(r.docket_absent, undefined);
  }
  assert.deepEqual(w.r.changesOf({ findings: [P], viewer: ADMIN }).findings[0].causes.map((c) => [c.source, c.entry]),
                   [["wp_retraction", "W-9"]]);
  /* a recorded re-evaluation closes it; a machine is refused */
  const m = w.r.recordReevaluation({ dependent: DEP, target: P, source: "wp_retraction", note: "read the withdrawal",
                                     author: MACHINE, viewer: ADMIN });
  assert.deepEqual([m.ok, m.code, m.check], [false, "MACHINE_CANNOT_RECORD_REEVALUATION",
                                             REEVALUATION_ACT_CHECKS.MACHINE_CANNOT_RECORD_REEVALUATION.check]);
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: P, source: "wp_retraction", note: "read the withdrawal",
                                        author: "owen", viewer: ADMIN }).ok, true);
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
});

test("R30 R16 R21: with none registered neither arm is raised and the answer says so (docket_absent); an unreadable docket says docket_read: false", () => {
  const { w, head } = setup();
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ target: F, viewer: ADMIN }),
                   w.r.changesOf({ findings: [DEP, F], viewer: ADMIN }), w.r.docketDependents({ viewer: ADMIN })]) {
    assert.equal(r.docket_absent, true);
    assert.match(r.docket_why, /not the same as none/);
    assert.ok(!/"(withdrawal|contested)"/.test(JSON.stringify(r)), "no cause raised");
  }
  /* negative control: registered, the same world raises it and says nothing absent */
  const reg = setup();
  docket(reg.w, { withdrawals: [withdrawal([{ bundle_id: F, sha: reg.head }])] });
  const r = reg.w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.docket_absent, causesOf(r, "withdrawal").length], [undefined, 1]);
  /* a docket that throws: nothing raised, and the read is said not made */
  const bad = setup();
  docket(bad.w, { failing: true });
  const b = bad.w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([b.count, b.docket_read, b.docket_absent], [0, false, undefined]);
  assert.match(b.docket_read_why, /not the same as none/);
  assert.ok(head);
});

test("R30 R9: the recovery read answers both arms, each naming its target, less those a recorded re-evaluation closed", () => {
  const { w, head } = setup();
  docket(w, { withdrawals: [withdrawal([{ bundle_id: F, sha: head }])],
              contested: [{ case: CASE, edition: 1, findings: [{ bundle_id: F, sha: head }], at: T1, entry: "R-1" }] });
  const before = w.snapshot();
  const ch = w.r.changesOf({ findings: [DEP, F, DEP2], viewer: ADMIN });
  const by = Object.fromEntries(ch.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.entry])]));
  assert.deepEqual(by, { [DEP]: [["withdrawal", F, "W-1"]], [F]: [["contested", F, "R-1"]], [DEP2]: [] });
  assert.deepEqual(w.snapshot(), before, "the read writes nothing (R18)");
  /* closing both */
  assert.equal(w.r.recordReevaluation({ dependent: DEP, target: F, source: "withdrawal", note: "looked again",
                                        author: "alice", viewer: ADMIN }).ok, true);
  assert.equal(w.r.recordReevaluation({ dependent: F, target: F, source: "contested", note: "looked again",
                                        author: "alice", viewer: ADMIN }).ok, true);
  const after = w.r.changesOf({ findings: [DEP, F], viewer: ADMIN });
  assert.deepEqual(after.findings.map((f) => f.causes), [[], []]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.count, r.closed.map((o) => [o.bundle_id, o.target, o.causes[0].source, o.causes[0].closed_by])],
                   [0, [[F, F, "contested", "alice"], [DEP, F, "withdrawal", "alice"]]]);
});

test("R30 R16 R19: a recorded re-evaluation closes a cause until a later entry; nothing regrades and a read writes nothing", () => {
  const { w, head } = setup();
  const d = docket(w, { contested: [{ case: CASE, edition: 1, findings: [{ bundle_id: F, sha: head }], at: T1, entry: "R-1" }] });
  const grades = () => w.rows(`SELECT bundle_id, ord, grade, grade_axis FROM inquiry_basis ORDER BY bundle_id, ord`);
  const g0 = grades();
  assert.equal(w.r.recordReevaluation({ dependent: F, target: F, source: "contested", note: "read it",
                                        author: "alice", viewer: ADMIN }).ok, true);
  assert.equal(w.r.docketDependents({ viewer: ADMIN }).count, 0);
  /* a later contesting entry is owed again */
  d.contested.push({ case: CASE, edition: 1, findings: [{ bundle_id: F, sha: head }], at: T3, entry: "R-2" });
  assert.deepEqual(w.r.docketDependents({ viewer: ADMIN }).entries.map((e) => [e.dependent, e.entry]), [[F, "R-2"]]);
  assert.deepEqual(grades(), g0, "no leg regraded");
  const before = w.snapshot();
  w.r.reevaluations({ viewer: ADMIN }); w.r.docketDependents({ viewer: ADMIN }); w.r.changesOf({ findings: [F], viewer: ADMIN });
  assert.deepEqual(w.snapshot(), before, "both arms are derived on read and write no row (R18)");
});

test("R30 R20: docketDependents lists each (dependent, entry) in order with cursor and limit; a dependent the viewer may not see is withheld and not counted", () => {
  const { w, head, gHead } = setup();
  w.member("owen"); w.member("ann");
  docket(w, { withdrawals: [withdrawal([{ bundle_id: F, sha: head }, { bundle_id: G, sha: gHead }], { entry: "W-1" })],
              contested: [{ case: CASE, edition: 1, findings: [{ bundle_id: F, sha: head }], at: T1, entry: "R-1" }] });
  const all = w.r.docketDependents({ viewer: ADMIN });
  assert.deepEqual(all.entries.map((e) => [e.dependent, e.entry, e.kind]),
                   [[F, "R-1", "contested"], [DEP, "W-1", "withdrawal"], [DEP3, "W-1", "withdrawal"]]);
  assert.deepEqual([all.count, all.limit, all.truncated, all.cursor, all.wrote], [3, 200, false, null, false]);
  const wd = all.entries.find((e) => e.dependent === DEP);
  assert.deepEqual([wd.case, wd.withdrawn_editions, wd.since, wd.legs], [CASE, [1], T2, [{ target: F, ord: 0, edition: null, sha: head }]]);
  /* paging: limit clamped to 1–200, the cursor the last entry's key */
  const p1 = w.r.docketDependents({ limit: 2, viewer: ADMIN });
  assert.deepEqual([p1.entries.map((e) => e.dependent), p1.truncated, p1.cursor], [[F, DEP], true, `${DEP}#W-1`]);
  const p2 = w.r.docketDependents({ limit: 2, after: p1.cursor, viewer: ADMIN });
  assert.deepEqual([p2.entries.map((e) => e.dependent), p2.truncated, p2.cursor], [[DEP3], false, null]);
  assert.equal(w.r.docketDependents({ limit: 0, viewer: ADMIN }).limit, 200);
  assert.equal(w.r.docketDependents({ limit: 1000, viewer: ADMIN }).limit, 200);
  assert.equal(w.r.docketDependents({ limit: -3, viewer: ADMIN }).limit, 1);
  /* DEP3 filed in ann's project: owen does not see it, and nothing says one was withheld */
  const Q = w.project("Elsewhere", "ann");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, Q, DEP3);
  const owen = w.r.docketDependents({ viewer: V("owen") });
  assert.deepEqual([owen.entries.map((e) => e.dependent), owen.count, owen.out_of_view], [[F, DEP], 2, undefined]);
  assert.ok(!JSON.stringify(owen).includes(DEP3));
  assert.equal(w.r.docketDependents({ viewer: "nobody" }).count, 0);
  /* the targeted read withholds it too, and says only that */
  const t = w.r.reevaluations({ target: G, viewer: V("owen") });
  assert.deepEqual([t.count, t.out_of_view], [0, true]);
});

test("R30 R8: docketActed tells the listeners once after the act, as kind withdrawal or contested with the arm's dependents; a thrower is named; nothing is written", () => {
  const { w, head } = setup();
  docket(w, { withdrawals: [withdrawal([{ bundle_id: F, sha: head }])],
              contested: [{ case: CASE, edition: 1, findings: [{ bundle_id: G, sha: "b".repeat(64) }, { bundle_id: F, sha: head }],
                            at: T1, entry: "R-1" }] });
  const heard = [];
  w.r.onBasisChanged("conformance", (e) => heard.push(e));
  w.r.onBasisChanged("consequences", () => { throw new Error("boom"); });
  const before = w.snapshot();
  const a = w.r.docketActed({ kind: "withdrawal", case: CASE, entry: "W-1" });
  assert.deepEqual([a.ok, a.told, a.kind, a.case, a.entry, a.dependents, a.listeners_failed],
                   [true, true, "withdrawal", CASE, "W-1", 1, ["consequences"]]);
  assert.equal(heard.length, 1);
  assert.deepEqual([heard[0].kind, heard[0].subject, heard[0].source, heard[0].since, heard[0].case, heard[0].withdrawn_editions,
                    heard[0].dependents],
                   ["withdrawal", "W-1", "withdrawal", T2, CASE, [1], [{ bundle_id: DEP, ord: 0, role: "supports", state: "open", target: F }]]);
  const b = w.r.docketActed({ kind: "contested", case: CASE, entry: "R-1" });
  assert.deepEqual([b.told, b.dependents], [true, 2]);
  assert.deepEqual([heard[1].kind, heard[1].subject, heard[1].since, heard[1].edition, heard[1].dependents],
                   ["contested", "R-1", T1, 1, [{ bundle_id: F }, { bundle_id: G }]]);
  /* a kind it does not know, or no entry, tells nothing */
  for (const x of [{ kind: "reaction", case: CASE, entry: "W-1" }, { kind: "withdrawal", case: CASE }, {}, undefined])
    assert.deepEqual(w.r.docketActed(x).told, false, JSON.stringify(x));
  /* an entry the docket does not answer is still told, with no dependents, and says so */
  const c = w.r.docketActed({ kind: "withdrawal", case: CASE, entry: "W-404" });
  assert.deepEqual([c.told, c.dependents, c.entry_read], [true, 0, false]);
  assert.equal(heard.length, 3);
  assert.deepEqual(w.snapshot(), before, "it writes nothing");
  /* inside a transaction that rolls back, nothing is told (R8: after the act commits) */
  assert.throws(() => w.record.transact(() => { w.r.docketActed({ kind: "contested", case: CASE, entry: "R-1" }); throw new Error("rolled back"); }));
  assert.equal(heard.length, 3);
  /* with nothing registered it never throws, and tells with no dependents */
  const bare = world();
  const told = [];
  bare.r.onBasisChanged("conformance", (e) => told.push(e));
  const d = bare.r.docketActed({ kind: "withdrawal", case: CASE, entry: "W-1" });
  assert.deepEqual([d.ok, d.told, d.dependents, d.docket_absent, told.length], [true, true, 0, true, 1]);
});

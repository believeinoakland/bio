/* reevaluation: §5.4's work-product cascade event, re-sourced (R16; N457, K901). A project's work product is a case it
   owns (DEC-72): a target that is a project carries `wp_retraction` when a case it owns has a ratified edition
   superseded by a later ratified one, read through R26's registration (`cases`, `parts`' `project`) and promotion's fact
   `publishedCaseRegistry`. `publication` is a stand-in here (it fills both in layer 8): `editions` is what its published
   cases hold, ratified or not, and the fact answers them as stored, so the ratified filter tested is this module's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { REEVALUATION_ACT_CHECKS } from "../../../src/reevaluation/index.mjs";

const DEP = "INQ-2026-0001-dep", OTHER = "INQ-2026-0002-other";
const CASE = "CASE-2026-0001-one", CASE2 = "CASE-2026-0002-two", ELSE = "CASE-2026-0003-else";
const ADMIN = "class:admin";
const T1 = "2026-09-20T00:00:00Z", T2 = "2026-09-25T00:00:00Z", T3 = "2026-09-26T00:00:00Z";

/* A leg naming a project is refused at a new write (C-2.8: a leg rests on information or on another inquiry), so a leg
   on one is one the record already holds: laid down here as a replay, which the shape arms exempt (inquiry R4). The
   recovery read (R9) asks of a project directly. */
let n = 0;
function legOn(w, id, target) {
  const head = w.record.head(id);
  const res = w.promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `legacy-${++n}`,
    author: "member:alice", files: [{ path: "bundle.md", text: inquiryMd(id, { legs: [{ target }] }) }],
    meta: { object_type: "inquiry" }, replay: true });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 400));
}

/** Project P (owen's) and Q (another's); DEP rests on P (a held leg). `editions[case]` = [{edition, ratified_at}]; `owner[case]` the
 *  project `parts` answers. `register: false` leaves R26 empty; `fact: false` leaves the fact unprovided. */
function setup({ editions = {}, register = true, fact = true, project = "Work" } = {}) {
  const w = world();
  w.member("owen"); w.member("ann");
  const P = w.project(project, "owen"), Q = w.project("Elsewhere", "ann");
  legOn(w, DEP, P);
  const owner = { [CASE]: P, [CASE2]: P, [ELSE]: Q };
  const pub = { editions, owner, asked: [] };
  if (register)
    assert.deepEqual(w.r.registerCaseParts("publication", {
      cases: ({ after = "", limit = 200 }) => {
        const ids = Object.keys(pub.editions).filter((c) => (pub.editions[c] || []).some((e) => e.ratified_at))
          .sort().filter((c) => c > after).slice(0, limit);
        return { cases: ids, cursor: ids.length === limit ? ids[ids.length - 1] : null };
      },
      parts: ({ case: c }) => {
        pub.asked.push(c);
        const ed = (pub.editions[c] || []).filter((e) => e.ratified_at).map((e) => e.edition);
        return ed.length ? { ok: true, case: c, edition: Math.max(...ed), project: pub.owner[c], parts: [] }
          : { ok: false, reason: "NO_SUCH_CASE_EDITION", case: c };
      } }), { ok: true, module: "publication" });
  if (fact)
    w.promotion.registerFact("publishedCaseRegistry", "legacy-store", (ids) => {
      const out = {};
      for (const id of ids) {
        const list = pub.editions[id];
        if (!list) continue;
        out[id] = { latest: Math.max(...list.map((e) => e.edition)),
                    editions: Object.fromEntries(list.map((e) => [String(e.edition), { ...e }])) };
      }
      return out;
    });
  return { w, P, Q, pub };
}
const wp = (r) => r.obligations.flatMap((o) => o.causes.filter((c) => c.source === "wp_retraction")
  .map((c) => [o.bundle_id, o.target, c.case, c.superseded_edition, c.edition, c.since]));

test("R16 (N457): a project carries wp_retraction when a case it owns has a ratified edition superseded by a later ratified one, both editions named", () => {
  const { w, P } = setup({ editions: { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] } });
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ target: P, viewer: ADMIN })]) {
    assert.deepEqual(wp(r), [[DEP, P, CASE, 1, 2, T2]], "since is the latest edition's ratification");
    const [o] = r.obligations;
    assert.deepEqual([o.reeval, o.target_state], [{ flag: true, since: T2, source: "wp_retraction" }, "forming"]);
    const c = o.causes.find((x) => x.source === "wp_retraction");
    assert.match(c.detail, new RegExp(`case ${CASE}.*edition 1 is superseded by edition 2`));
    assert.equal(r.case_parts_absent, undefined);
    assert.equal(r.work_products_read, undefined);
  }
  /* the recovery read answers it of the project itself */
  const f = w.r.changesOf({ findings: [P], viewer: ADMIN }).findings[0];
  assert.deepEqual(f.causes.map((c) => [c.source, c.case, c.since]), [["wp_retraction", CASE, T2]]);
  /* a third ratified edition: the cause names the latest and the one it superseded, since the latest */
  const three = setup({ editions: { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 },
                                             { edition: 3, ratified_at: T3 }] } });
  assert.deepEqual(wp(three.w.r.reevaluations({ viewer: ADMIN })), [[DEP, three.P, CASE, 2, 3, T3]]);
  /* one cause per corrected case the project owns, in case order; a case another project owns is not this one's */
  const two = setup({ editions: { [CASE2]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T3 }],
                                  [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }],
                                  [ELSE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] } });
  assert.deepEqual(wp(two.w.r.reevaluations({ viewer: ADMIN })).map((x) => x[2]), [CASE, CASE2]);
});

test("R16 (N457): a single edition, an unratified successor, a case another project owns, and no case at all raise nothing", () => {
  for (const [why, editions] of [
    ["a single ratified edition", { [CASE]: [{ edition: 1, ratified_at: T1 }] }],
    ["an unratified successor", { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: null }] }],
    ["only unratified editions", { [CASE]: [{ edition: 1, ratified_at: null }, { edition: 2, ratified_at: null }] }],
    ["a corrected case another project owns", { [ELSE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] }],
    ["no case", {}],
  ]) {
    const { w, P } = setup({ editions });
    const before = w.snapshot();
    const r = w.r.reevaluations({ viewer: ADMIN });
    assert.deepEqual([r.count, wp(r)], [0, []], why);
    assert.deepEqual([r.case_parts_absent, r.work_products_read], [undefined, undefined], why);
    assert.deepEqual(w.r.changesOf({ findings: [P], viewer: ADMIN }).findings[0].causes, [], why);
    assert.deepEqual(w.snapshot(), before, `${why}: the read writes nothing`);
  }
});

test("R16 R21 (N457): with R26's registration absent the cause is not raised and the answer says so (case_parts_absent); an unprovided fact is said too", () => {
  const editions = { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] };
  const { w, P } = setup({ editions, register: false });
  for (const r of [w.r.reevaluations({ viewer: ADMIN }), w.r.reevaluations({ target: P, viewer: ADMIN }),
                   w.r.changesOf({ findings: [P], viewer: ADMIN })]) {
    assert.equal(r.case_parts_absent, true);
    assert.match(r.case_parts_why, /not the same as none/);
    assert.ok(!JSON.stringify(r).includes("wp_retraction\""), "no cause raised");
  }
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0);
  /* negative control: registered, the same world raises it and says nothing absent */
  const reg = setup({ editions });
  assert.equal(reg.w.r.reevaluations({ viewer: ADMIN }).case_parts_absent, undefined);
  /* no project asked: nothing is said */
  const none = setup({ register: false });
  assert.equal(none.w.r.changesOf({ findings: [DEP], viewer: ADMIN }).case_parts_absent, undefined);
  /* the fact unprovided: no edition read, no cause, and the answer says the read was not made (R21) */
  const nofact = setup({ editions, fact: false });
  const r = nofact.w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.count, r.work_products_read, r.case_parts_absent], [0, false, undefined]);
  assert.match(r.work_products_why, /not the same as none/);
});

test("R16 (N457, K899 (3)): a document still carrying workproduct_state: retracted raises nothing; no field of the project is read for it", () => {
  for (const state of ["retracted", "redistributed"]) {
    const { w, P } = setup();
    const text = w.text(P).replace("current_state: forming", `current_state: forming\nworkproduct_state: ${state}`);
    const res = w.promotion.promote({ bundleId: P, base: w.record.head(P).bundleSha, snapKey: `wp-${state}`,
      author: "member:owen", files: [{ path: "bundle.md", text }], meta: { object_type: "project" }, replay: true });
    assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
    assert.equal(w.fm(P).workproduct_state, state);
    const r = w.r.reevaluations({ viewer: ADMIN });
    assert.deepEqual([r.count, wp(r)], [0, []], state);
    assert.deepEqual(w.r.changesOf({ findings: [P], viewer: ADMIN }).findings[0].causes, [], state);
  }
});

test("R16 (N457): a recorded re-evaluation closes wp_retraction until a later ratified edition; a machine is refused", () => {
  const { w, P, pub } = setup({ editions: { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] } });
  const m = w.r.recordReevaluation({ dependent: DEP, target: P, source: "wp_retraction", note: "read edition 2",
                                     author: MACHINE, viewer: ADMIN });
  assert.deepEqual([m.ok, m.code, m.check, m.translation], [false, "MACHINE_CANNOT_RECORD_REEVALUATION", "C-110.6",
    REEVALUATION_ACT_CHECKS.MACHINE_CANNOT_RECORD_REEVALUATION.translation]);
  assert.equal(w.count("reevaluation_records"), 0);
  const ok = w.r.recordReevaluation({ dependent: DEP, target: P, source: "wp_retraction", note: "read edition 2",
                                      author: "owen", viewer: V("owen") });
  assert.deepEqual([ok.ok, ok.since, ok.closed], [true, T2, true]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual([r.count, r.closed.map((o) => [o.bundle_id, o.target, o.causes[0].source, o.causes[0].closed_by])],
    [0, [[DEP, P, "wp_retraction", "owen"]]]);
  /* a later ratified edition opens it again */
  pub.editions[CASE].push({ edition: 3, ratified_at: T3 });
  assert.deepEqual(wp(w.r.reevaluations({ viewer: ADMIN })), [[DEP, P, CASE, 2, 3, T3]]);
});

test("R16 R20 (N457): a project the viewer may not see is withheld whole; a dependent the viewer may not see is withheld and out_of_view says only that", () => {
  const { w, P, Q } = setup({ editions: { [CASE]: [{ edition: 1, ratified_at: T1 }, { edition: 2, ratified_at: T2 }] } });
  const all = wp(w.r.reevaluations({ viewer: ADMIN }));
  assert.equal(all.length, 1);
  assert.deepEqual(wp(w.r.reevaluations({ viewer: V("owen") })), all, "the project's owner is given the same facts");
  /* ann does not see owen's project: its obligation is withheld whole, and it answers as absent */
  const ann = w.r.reevaluations({ viewer: V("ann") });
  assert.deepEqual([ann.count, ann.out_of_view], [0, undefined]);
  assert.ok(!JSON.stringify(ann).includes(P) && !JSON.stringify(ann).includes(CASE));
  assert.equal(w.r.reevaluations({ target: P, viewer: V("ann") }).reason, "NO_SUCH_BUNDLE");
  assert.deepEqual(w.r.changesOf({ findings: [P], viewer: V("ann") }).findings, [{ id: P, absent: true }]);
  assert.equal(w.r.reevaluations({ viewer: "nobody" }).count, 0);
  /* a second dependent filed in ann's project, out of owen's view, is withheld from his targeted read */
  legOn(w, OTHER, P);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, Q, OTHER);
  const r = w.r.reevaluations({ target: P, viewer: V("owen") });
  assert.deepEqual([r.obligations.map((o) => o.bundle_id), r.out_of_view], [[DEP], true]);
  assert.ok(!JSON.stringify(r).includes(OTHER));
  const admin = w.r.reevaluations({ target: P, viewer: ADMIN });
  assert.deepEqual([admin.obligations.map((o) => o.bundle_id), admin.out_of_view], [[DEP, OTHER], undefined]);
});

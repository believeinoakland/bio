/* basis-versions: a project's questions served to a viewer (R50, `op=projectquestions`), over R41's viewer-free read.
   Sight is membership's (its R80): a project owned by bo is out of alice's sight, and an inquiry whose front matter
   names that project belongs to it, so alice may see the project she owns but not that inquiry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, V, MACHINE } from "./fixture.mjs";
import { basisVersionsOps } from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-0001-a";
const Q1 = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r", Q3 = "INQ-2026-0003-s", Q4 = "INQ-2026-0004-t";
const T = "2026-09-27T00:00:00Z";
const ALICE = V("alice"), VERA = V("vera");

function setup() {
  const w = world();
  w.doc(DOC);
  w.member("alice"); w.member("bo"); w.member("vera");
  /* bo's project, out of alice's sight; Q3 belongs to it */
  const H = w.project("Bo's own", "bo", []);
  for (const q of [Q1, Q2, Q4]) assert.equal(w.inquiry(q, block({})).ok, true, q);
  const r3 = w.inquiry(Q3, [`project: ${H}`, ...block({})]);
  assert.equal(r3.ok, true, JSON.stringify(r3).slice(0, 300));
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id) VALUES (?, 0, ?)`, Q2, DOC);
  const P = w.project("Team", "alice", [Q1, Q2, Q3, Q4, DOC], { extra: ["conclusions:",
    `  - inquiry: "${Q1}"`, `    act: "concluded"`, `    version: "first"`, `    claim: "c"`, `    at: "${T}"`,
    `    by: "${ALICE}"`] });
  /* vacuity guards: the sight this test turns on is real */
  assert.deepEqual([w.membership.inSight(P, ALICE), w.membership.inSight(Q3, ALICE), w.membership.inSight(Q1, ALICE),
                    w.membership.inSight(P, VERA)], [true, false, true, false]);
  return { w, P, H };
}
/* An answer at id X with X written as a placeholder, so two answers compare whole across ids. */
/* The title the record holds for a bundle (record-core R34), checked to be one */
const held = (w, id) => { const t = w.record.bundleInfo(id)?.title; assert.equal(typeof t === "string" && t.length > 0, true, id); return t; };
const idless = (r, id) => JSON.parse(JSON.stringify(r).split(id).join("<ID>"));

test("R50: projectQuestionsFor answers R41's page less each inquiry the viewer may not see, left out unannounced and uncounted, each item carrying the inquiry's title as the record holds it; {ok: true, project, items, cursor}", () => {
  const { w, P } = setup();
  const r41 = w.bv.projectQuestions({ project: P });
  assert.deepEqual(r41.items.map((x) => x.inquiry), [Q1, Q2, Q3, Q4], "R41 answers the unseen inquiry, viewer-free");
  const r = w.bv.projectQuestionsFor({ project: P, viewer: ALICE });
  assert.deepEqual(r, { ok: true, project: P, cursor: null, items: [
    { inquiry: Q1, legs: false, stance: "concluded", title: held(w, Q1) },
    { inquiry: Q2, legs: true, stance: "none", title: held(w, Q2) },
    { inquiry: Q4, legs: false, stance: "none", title: held(w, Q4) }] });
  assert.equal(JSON.stringify(r).includes(Q3), false, "the unseen inquiry is not named, nor counted");
  for (const x of r.items) assert.equal(x.title, w.record.bundleInfo(x.inquiry).title, "the title is record-core R34's");
  /* each item is R41's item with its title */
  assert.deepEqual(r.items.map(({ title, ...rest }) => rest), r41.items.filter((x) => x.inquiry !== Q3));
  /* control: a viewer who sees every bundle is answered R41's page whole */
  const all = w.bv.projectQuestionsFor({ project: P, viewer: MACHINE });
  assert.deepEqual(all.items.map(({ title, ...rest }) => rest), r41.items);
});

test("R50: the cursor is R41's — a page holding an unseen inquiry answers fewer than limit, and paging on from the cursor skips no inquiry the viewer sees", () => {
  const { w, P } = setup();
  const p1 = w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: 3 });
  assert.deepEqual([p1.items.map((x) => x.inquiry), p1.cursor], [[Q1, Q2], Q3], "Q3 unseen: two items, R41's cursor");
  assert.equal(p1.cursor, w.bv.projectQuestions({ project: P, limit: 3 }).cursor);
  const p2 = w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: 3, after: p1.cursor });
  assert.deepEqual([p2.items.map((x) => x.inquiry), p2.cursor], [[Q4], null]);
  /* a page wholly unseen answers no item and still a cursor, so the caller pages on */
  const only = w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: 1, after: Q2 });
  assert.deepEqual([only.items, only.cursor], [[], Q3]);
  /* paging to the end counts what a viewer sees (Home's count, K3027 doubt 5) */
  const seen = [];
  let after = null;
  for (let i = 0; i < 10; i++) {
    const pg = w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: 1, after });
    seen.push(...pg.items.map((x) => x.inquiry));
    if (pg.cursor === null) break;
    after = pg.cursor;
  }
  assert.deepEqual(seen, [Q1, Q2, Q4]);
  /* R41's order, after and limit clamp carried */
  assert.deepEqual(w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: -4 }).items.map((x) => x.inquiry), [Q1]);
  assert.deepEqual(w.bv.projectQuestionsFor({ project: P, viewer: ALICE, after: Q4 }).items, []);
});

test("R50, R33: a project the viewer may not see, an absent one, one that is not a project, an empty id and an unstamped viewer all answer {ok: true, project, items: [], cursor: null}, alike and never a refusal", () => {
  const { w, P, H } = setup();
  const empty = (id) => ({ ok: true, project: id, items: [], cursor: null });
  const NEVER = "PROJ-2026-0000-never-minted";
  assert.deepEqual(w.bv.projectQuestionsFor({ project: P, viewer: VERA }), empty(P), "unseen");
  assert.deepEqual(w.bv.projectQuestionsFor({ project: H, viewer: ALICE }), empty(H), "unseen, another owner");
  assert.deepEqual(w.bv.projectQuestionsFor({ project: NEVER, viewer: ALICE }), empty(NEVER), "absent");
  assert.deepEqual(idless(w.bv.projectQuestionsFor({ project: P, viewer: VERA }), P),
                   idless(w.bv.projectQuestionsFor({ project: NEVER, viewer: VERA }), NEVER), "unseen = absent, whole");
  for (const id of [Q1, DOC]) assert.deepEqual(w.bv.projectQuestionsFor({ project: id, viewer: ALICE }), empty(id), id);
  for (const id of ["", null, undefined, "  "]) assert.deepEqual(w.bv.projectQuestionsFor({ project: id, viewer: ALICE }), empty(""), String(id));
  for (const v of [null, undefined, "nobody"]) assert.deepEqual(w.bv.projectQuestionsFor({ project: P, viewer: v }), empty(P), String(v));
  assert.deepEqual(w.bv.projectQuestionsFor(), empty(""));
  /* control: the same project answers its questions to the viewer who sees it */
  assert.equal(w.bv.projectQuestionsFor({ project: P, viewer: ALICE }).items.length, 3);
});

test("R50: op=projectquestions takes viewer from the URL's stamp and project, after and limit from the query, and answers as projectQuestionsFor does", () => {
  const { w, P } = setup();
  const op = (qs) => basisVersionsOps(w.bv, new URL(`https://x/?${qs}`), { viewer: MACHINE }).projectquestions();
  const v = encodeURIComponent(ALICE);
  assert.deepEqual(op(`project=${P}&viewer=${v}`), w.bv.projectQuestionsFor({ project: P, viewer: ALICE }));
  assert.deepEqual(op(`project=${P}&viewer=${v}&limit=3`), w.bv.projectQuestionsFor({ project: P, viewer: ALICE, limit: 3 }));
  assert.deepEqual(op(`project=${P}&viewer=${v}&limit=3&after=${Q3}`).items.map((x) => x.inquiry), [Q4]);
  /* a body names no viewer: with no stamp, nothing is seen */
  assert.deepEqual(op(`project=${P}`), { ok: true, project: P, items: [], cursor: null });
});

test("R50: projectQuestionsFor writes nothing and never throws", () => {
  const { w, P } = setup();
  const before = { bundles: w.count("bundles"), sha: w.sha(P), q: [Q1, Q2, Q3, Q4].map((q) => w.sha(q)) };
  w.bv.projectQuestionsFor({ project: P, viewer: ALICE });
  w.bv.projectQuestionsFor({ project: P, viewer: VERA });
  assert.deepEqual({ bundles: w.count("bundles"), sha: w.sha(P), q: [Q1, Q2, Q3, Q4].map((q) => w.sha(q)) }, before);
  const hostile = { toString() { throw new Error("boom"); } };
  assert.doesNotThrow(() => w.bv.projectQuestionsFor({ project: hostile, viewer: ALICE }));
  assert.deepEqual(w.bv.projectQuestionsFor({ project: hostile, viewer: ALICE }), { ok: true, project: null, items: [], cursor: null });
  /* a failing read underneath reads as nothing to show */
  const broken = setup();
  broken.w.st.db.exec(`ALTER TABLE bundles RENAME TO bundles_gone`);
  let r;
  assert.doesNotThrow(() => { r = broken.w.bv.projectQuestionsFor({ project: broken.P, viewer: ALICE }); });
  assert.deepEqual(r, { ok: true, project: broken.P, items: [], cursor: null });
});

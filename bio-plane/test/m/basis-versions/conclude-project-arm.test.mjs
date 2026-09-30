/* basis-versions: a PROJECT's conclusion on a question the no-project relationship has already concluded (R16–R18, with
 * the reads R11 and R23 that show it), carried from the old suite `test/conclude-project-arm.test.mjs` (REC-142).
 *
 * The world: a question concluded with NO project, naming its accepted reading (the old suite's §0); project P cites it
 * and stands on that reading, iris its owner, jonah JOINED (not an owner), vera only INVITED; project S, olga's, SEVERED
 * its `cites` edge to the question. Carried: the member merely invited is refused with membership's `projectAuthority`
 * answer relayed and nothing written, while a joined non-owner concludes (R16, old §3 and §1's jonah arm at the act); a
 * severed citer is refused NO_CLAIM, nothing written (R17, old §3); the no-project relationship cannot conclude twice —
 * ILLEGAL_TRANSITION from `concluded`, nothing written — while a project may (R16, old §4); the project's conclusion on
 * the concluded question: accepted, the project's relationship, the claim adopted, the question unmoved, its bytes and
 * its no-project conclusion unchanged, the project's stance reading it (R18, R11, R23, old §2).
 *
 * Not carried: op=affordances (who is OFFERED `conclude`, its weight/rung/mode decoration, the offer on an open question,
 * the machine token withheld) is `affordances`' (its R14, R15, R23; concludes_for_project); the structural arm reading
 * the catalogue's inquiry machine for a `concluded -> concluded` edge reads `legacy-checks`' table, not this module's
 * interface — its behaviour here is the ILLEGAL_TRANSITION arm below. The Miniflare/HTTP harness, tokens, enrolment and
 * the negative-control driver are the old harness's, not a requirement. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "./fixture.mjs";
import { basisVersionsOps } from "../../../src/basis-versions/index.mjs";

const DOC = "INFO-2026-9142-ledger", Q = "INQ-2026-9142-concluded-elsewhere";
const T = "2026-09-27T00:00:00Z", NOW = "2026-09-28T01:00:00Z";
const READING = "the-ledger", CLAIM = "the ledger shows the transfer followed the adopted process";
const NP_TEXT = "The ledger answers the question.";

function setup() {
  const w = world();
  w.doc(DOC);
  for (const m of ["iris", "jonah", "vera", "olga"]) w.member(m);
  const r = w.inquiry(Q, block(merge(version(READING, [DOC], { state: "accepted", claim: CLAIM, state_by: "member:iris",
    state_at: T, state_reason: "" }), { basis: [{ target: DOC, role: "supports" }], refs: [DOC] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const P = w.project("Oversight", "iris", [Q]);
  const S = w.project("Severed", "olga", [], { severed: [Q] });
  assert.equal(w.membership.projectInvite({ projectId: P, handle: "h_jonah", by: "iris", viewer: V("iris") }).ok, true);
  assert.equal(w.membership.projectJoin({ projectId: P, by: "jonah", viewer: V("jonah") }).ok, true);
  assert.equal(w.membership.projectInvite({ projectId: P, handle: "h_vera", by: "iris", viewer: V("iris") }).ok, true);
  assert.deepEqual([w.membership.participation(P, "jonah").state, w.membership.participation(P, "vera").state], ["joined", "invited"]);
  const cur = w.bv.versionCurrent({ target: Q, version: READING, project: P, author: V("iris"), viewer: V("iris"),
                                    identity: V("iris"), reason: "we stand on the ledger" });
  assert.equal(cur.ok, true, JSON.stringify(cur).slice(0, 300));
  /* the no-project conclusion, drawn by vera, naming its reading */
  const np = w.bv.conclude({ target: Q, conclusion: NP_TEXT, falsifier: "a later ledger entry", version: READING,
                             author: V("vera"), viewer: V("vera"), identity: V("vera") });
  assert.deepEqual([np.ok, np.relationship, np.to], [true, "no_project", "concluded"], JSON.stringify(np).slice(0, 300));
  assert.equal(w.row(`SELECT current_state FROM bundles WHERE bundle_id=?`, Q).current_state, "concluded", "the fixture is real");
  return { w, P, S };
}

test("R16: a member invited to, but not joined in, the project is refused with membership's projectAuthority answer relayed, nothing written; a joined member who is not an owner concludes for it", () => {
  const { w, P } = setup();
  const pSha = w.sha(P), pText = w.text(P), qSha = w.sha(Q);
  const own = w.membership.projectAuthority(P, V("vera"), "joined", "conclude");
  assert.equal(own?.reason, "PROJECT_ACT_NOT_A_PARTICIPANT", "membership's own answer for an invited member");
  const v = w.bv.conclude({ target: Q, project: P, falsifier: "a council minute", author: V("vera"), viewer: V("vera"), identity: V("vera") });
  assert.deepEqual(v, own, "relayed unchanged");
  assert.deepEqual([v.ok, v.reason, v.check, typeof v.translation], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", own.check, "string"]);
  assert.deepEqual([w.sha(P), w.text(P), w.sha(Q)], [pSha, pText, qSha], "nothing written");
  assert.deepEqual(w.bv.conclusionRecordOf(P, Q, V("iris")), { history: [], stance: null });
  /* negative control: jonah JOINED P and is not an owner */
  assert.equal(w.membership.isProjectOwner(P, "jonah"), false);
  const j = w.bv.conclude({ target: Q, project: P, falsifier: "a council minute", author: V("jonah"), viewer: V("jonah"), identity: V("jonah") });
  assert.deepEqual([j.ok, j.relationship, j.project, j.author], [true, "project", P, V("jonah")], JSON.stringify(j).slice(0, 300));
  assert.equal(w.bv.conclusionOf(P, Q, V("iris")).by, V("jonah"));
});

test("R17: a project that SEVERED its cites edge to the question does not draw on it — NO_CLAIM even though it names the question's accepted reading as CURRENT; nothing written; the same project with the edge live concludes", () => {
  const { w } = setup();
  const current = ["current_versions:", `  - inquiry: "${Q}"`, `    version: "${READING}"`, `    at: "${T}"`, `    by: "member:olga"`];
  const S = w.project("Severed, standing", "olga", [], { severed: [Q], extra: current });
  assert.equal(w.bv.currentOf(S, Q, V("olga")).version, READING, "the only thing missing is a live edge");
  const sSha = w.sha(S), qSha = w.sha(Q);
  const o = w.bv.conclude({ target: Q, project: S, falsifier: "a council minute", author: V("olga"), viewer: V("olga"), identity: V("olga") });
  assert.deepEqual([o.ok, o.reason, o.project], [false, "NO_CLAIM", S]);
  assert.deepEqual([w.sha(S), w.sha(Q)], [sSha, qSha], "nothing written");
  assert.deepEqual(w.bv.conclusionRecordOf(S, Q, V("olga")), { history: [], stance: null });
  /* also the old suite's S exactly: severed and standing on nothing */
  const { w: w2, S: S2 } = setup();
  const o2 = w2.bv.conclude({ target: Q, project: S2, falsifier: "a council minute", author: V("olga"), viewer: V("olga"), identity: V("olga") });
  assert.equal(o2.reason, "NO_CLAIM");
  /* negative control: the same shape with the edge live */
  const L = w.project("Live, standing", "olga", [Q], { extra: current });
  const ok = w.bv.conclude({ target: Q, project: L, falsifier: "a council minute", author: V("olga"), viewer: V("olga"), identity: V("olga") });
  assert.deepEqual([ok.ok, ok.project, ok.version], [true, L, READING], JSON.stringify(ok).slice(0, 300));
});

test("R16: a question concluded with no project cannot be concluded again with no project — ILLEGAL_TRANSITION from concluded, nothing written — while a project may conclude the concluded question", () => {
  const { w, P } = setup();
  const qSha = w.sha(Q), qText = w.text(Q), npBefore = w.bv.noProjectConclusionOf(Q);
  const again = w.bv.conclude({ target: Q, conclusion: "Concluded a second time.", falsifier: "a later ledger entry",
                                version: READING, author: V("olga"), viewer: V("olga"), identity: V("olga") });
  assert.deepEqual([again.ok, again.reason, again.from, again.to, again.target], [false, "ILLEGAL_TRANSITION", "concluded", "concluded", Q]);
  const same = w.bv.conclude({ target: Q, conclusion: "Concluded a second time.", falsifier: "a later ledger entry",
                               version: READING, author: V("vera"), viewer: V("vera"), identity: V("vera") });
  assert.equal(same.reason, "ILLEGAL_TRANSITION", "its own author alike");
  assert.deepEqual([w.sha(Q), w.text(Q)], [qSha, qText], "nothing written");
  assert.deepEqual(w.bv.noProjectConclusionOf(Q), npBefore);
  assert.equal(w.bv.noProjectConclusionOf(Q).conclusion, NP_TEXT);
  const p = w.bv.conclude({ target: Q, project: P, falsifier: "a council minute", author: V("iris"), viewer: V("iris"), identity: V("iris") });
  assert.deepEqual([p.ok, p.inquiry_state], [true, "concluded"], JSON.stringify(p).slice(0, 300));
});

test("R18, R11, R23: a project's conclusion on a question already concluded with no project — one concluded row adopting its CURRENT's claim, the question unmoved and byte-identical, its no-project conclusion unchanged, the project's stance reading it (through op=conclude)", () => {
  const { w, P } = setup();
  const qSha = w.sha(Q), qText = w.text(Q);
  const npBefore = w.bv.noProjectConclusionOf(Q);
  const bvBefore = w.bv.basisVersions({ id: Q, viewer: V("iris") }).no_project_conclusion;
  assert.deepEqual([npBefore.conclusion, npBefore.claim], [NP_TEXT, { state: "adopted", text: CLAIM, version: READING }]);
  assert.deepEqual(bvBefore, npBefore);
  const url = new URL(`https://x/?target=${encodeURIComponent(Q)}&project=${encodeURIComponent(P)}`
    + `&falsifier=${encodeURIComponent("a council minute rescinding the process")}`
    + `&author=${encodeURIComponent(V("iris"))}&viewer=${encodeURIComponent(V("iris"))}&identity=${encodeURIComponent(V("iris"))}`);
  const r = basisVersionsOps(w.bv, url, {}).conclude();
  assert.deepEqual([r.ok, r.relationship, r.project, r.to, r.version, r.claim, r.inquiry_moved, r.inquiry_state,
                    r.falsifier, r.falsifier_override, r.commentary, r.prior, r.history_length, r.author, r.at],
    [true, "project", P, "concluded", READING, { state: "adopted", text: CLAIM, version: READING }, false, "concluded",
     "a council minute rescinding the process", null, null, null, 1, V("iris"), NOW]);
  assert.deepEqual([w.sha(Q), w.text(Q)], [qSha, qText], "the question's bytes and bundle_sha do not move");
  assert.match(w.text(P), new RegExp(`conclusions:\\n  - inquiry: "${Q}"\\n    act: "concluded"\\n    version: "${READING}"\\n    claim: "${CLAIM}"\\n    falsifier: "a council minute rescinding the process"`));
  const rec = w.bv.conclusionRecordOf(P, Q, V("iris"));
  assert.equal(rec.history.length, 1, "one row");
  const stance = w.bv.basisVersions({ id: Q, viewer: V("iris"), project: P });
  assert.deepEqual([stance.conclusion_stance, stance.conclusion?.state, stance.conclusion?.version, stance.conclusion?.claim],
    ["concluded", "concluded", READING, CLAIM]);
  assert.deepEqual(w.bv.noProjectConclusionOf(Q), npBefore, "the no-project conclusion is unchanged");
  assert.deepEqual(stance.no_project_conclusion, bvBefore);
  assert.equal(w.row(`SELECT current_state FROM bundles WHERE bundle_id=?`, Q).current_state, "concluded");
});

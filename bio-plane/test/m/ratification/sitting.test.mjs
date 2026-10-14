/* ratification R52 (T47-72; Bob's S21 A, K3080; DEC-208 (1)): one sitting's signatures. `op=caseratify` and
   `op=publishat` take `members: [{id, sha, signature}]`, the same signer's signatures over `ratifyStatement` for each
   finding the edition pins and each piece of evidence they rest on; each is verified as R4 verifies before anything
   commits, a refusal naming the member and writing nothing; with `op=caseratify` each commits after the case as R5 does,
   and with `op=publishat` they are held with the waiting edition and committed by R42's publisher after the case, or
   stopped with it. Driven at the Worker half (`caseRatifyOp`, `publishAtOp`) over the fixture's world, and at the set
   time through publish-schedule's real `publishDue`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signBundle, signCase, cleanInfoMd, cleanCase, fmText, CASE_BODY, bucketOver, sha, V }
  from "./fixture.mjs";
import { caseRatifyOp, publishAtOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const CASE = "CASE-2026-0052";
const OWN = { version: "first", claim: "the transfer was authorised", falsifier: "an adopted resolution forbidding it",
              falsifier_override: null, by: "member:iris", at: "2026-09-27T10:00:00Z" };
const FINDINGS = ["INQ-2026-5201-lead", "INQ-2026-5202-second"];
const EVIDENCE = [1, 2, 3, 4, 5].map((n) => `INFO-2026-530${n}-memo`);
const AT = { date: "2026-10-09", time: "09:30" };
const as = (who) => ({ session: { role: `member:${who}` }, viewer: V(who) });

/* A catalogue-clean inquiry bundle.md (the gate draws no finding over it). */
function cleanInqMd(id) {
  const question = `Was the transfer ${id} authorised?`;
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    "current_state: open", "prior_state: null", `created: "2026-07-01T00:00:00Z"`, `last_updated: "2026-07-01T00:00:00Z"`,
    "produced_by:", "  mode: human", "  capability_tier: none", "group: test-group", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending: false", "visuals: []", "surfaced_by: human",
    "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.",
    "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}

/* iris owns the project and holds the registered key; gus joined it and holds a registered key of his own. A case
   edition pinning the two findings, stored unsigned; five information documents the lead finding rests on (publication
   R38's read, steered as the fixture steers it). The sitting: the case's signature and the seven members', all iris's. */
async function sitting({ worker = null, attribution = null } = {}) {
  const w = world({ worker });
  const iris = await newKey(), gus = await newKey(), stranger = await newKey();
  w.member("iris", { signer: iris }); w.member("gus", { signer: gus });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("iris"));
  w.r.registerHoldReader({ holdsOn: () => ({ held: false }) });
  const P = w.project("Team", "iris", { joined: ["gus"] });
  for (const q of FINDINGS) { w.promote(q, cleanInqMd(q)); w.bv.conc.set(w.key(P, q), OWN); }
  for (const e of EVIDENCE) {
    w.promote(e, cleanInfoMd(e), "information");
    w.pub.resting.set(e, [{ case_id: CASE, finding: FINDINGS[0], project: P }]);
  }
  const conc = FINDINGS.flatMap((q) => caseConclusionRowLines(q, w.r.caseConclusionFor(P, q, V("iris"), "open")));
  const text = fmText(cleanCase({ caseId: CASE, edition: 1, project: P, members: FINDINGS.map((id) => ({ id, pin: w.sha(id) })) }),
                      { raw: ["case_conclusions:", ...conc], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text, { owner: P });
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
    attribution: attribution || { reached: [], legacy: [], stated: [], current: [] },
    signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await signCase(iris, CASE, 1, docSha);
  const ids = [...FINDINGS, ...EVIDENCE];
  const members = [];
  for (const id of ids) members.push({ id, sha: w.sha(id), signature: await signBundle(iris, id, w.sha(id)) });
  const body = (extra = {}) => ({ caseId: CASE, edition: 1, expectedSha: docSha, sig, members, ...extra });
  const act = async (fn, b, o = as("iris")) => { const p = plane(w, o); return { ...(await fn(p.request(b), p.stub, p.ctx)), p }; };
  const nothing = (why) => {
    assert.equal(w.count("published_cases"), 0, `${why}: no case edition committed`);
    assert.equal(w.count("published_bundles"), 0, `${why}: no member crossed`);
    assert.equal(w.row(`SELECT sig_armored FROM case_documents WHERE case_id=?`, CASE).sig_armored, null, `${why}: unsigned`);
  };
  return { w, P, iris, gus, stranger, ids, members, docSha, sig, body, act, nothing };
}

test("R52: a sitting of 1 + 2 + 5 signatures — the case, its two findings and the five documents the lead rests on — at op=caseratify verifies every one first, commits the case and then each member as op=ratify does, copies each member's bytes, and assembles the complete edition's container once", async () => {
  const s = await sitting();
  const r = await s.act(caseRatifyOp, s.body());
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 600));
  assert.equal(r.body.ok, true);
  assert.deepEqual(r.body.sitting.map((m) => [m.bundleId, m.ok, m.attestor, m.existed]),
                   s.ids.map((id) => [id, true, "iris", false]), "each member answered as op=ratify answers it, in order");
  assert.deepEqual(r.body.sitting.map((m) => m.bundleSha), s.members.map((m) => m.sha));
  assert.deepEqual([s.w.count("published_cases"), s.w.count("published_bundles")], [1, 7]);
  /* each member's commit came after the case's, through R5's commit */
  const order = s.w.calls.filter((c) => c[0] === "commitCaseEdition" || c[0] === "commitEdition").map((c) => c[0] === "commitEdition" ? c[1].bundleId : "case");
  assert.deepEqual(order, ["case", ...s.ids]);
  /* every member's bundle.md is in the published store under its own sha */
  for (const m of s.members) assert.equal(r.p.published.has(`s/published/${m.sha}`), true, m.id);
  assert.deepEqual(r.body.sitting.map((m) => m.published.r2), s.ids.map(() => "ok"));
  assert.equal(r.p.assembled.length, 1, "the complete edition's container is assembled once, after every copy");
  assert.deepEqual([r.p.assembled[0].cs.caseId, r.p.assembled[0].cs.complete], [CASE, true]);
  assert.deepEqual(r.body.awaiting, [], "nothing awaits: the sitting completed the edition");
  assert.deepEqual(r.body.container, { manifest_sha: "m".repeat(64), zip: "z" });
  assert.deepEqual(r.body.sitting.slice(0, 2).map((m) => m.case.complete), [false, true]);
  /* the same sitting again is a retry: the case and each member answer `existed`, and nothing more is written */
  const again = await s.act(caseRatifyOp, s.body());
  assert.equal(again.status, 200, JSON.stringify(again.body).slice(0, 400));
  assert.deepEqual([again.body.existed, again.body.sitting.map((m) => m.existed)], [true, s.ids.map(() => true)]);
  assert.deepEqual([s.w.count("published_cases"), s.w.count("published_bundles")], [1, 7]);
});

test("R52 (control): one bad signature in the sitting commits nothing — a stranger's key, or another registered member's (not the case's signer), is that member's SIG_ refusal naming it, asked before anything is written; the sitting with the right signature commits", async () => {
  for (const who of ["stranger", "gus"]) {
    const s = await sitting();
    const bad = s.members.map((m, i) => i === 4 ? { ...m, signature: null } : m);
    bad[4].signature = await signBundle(s[who], bad[4].id, bad[4].sha);
    const r = await s.act(caseRatifyOp, s.body({ members: bad }));
    assert.equal(r.status, 403, `${who}: ${JSON.stringify(r.body).slice(0, 300)}`);
    assert.match(r.body.reason, /^SIG_/);
    assert.equal(r.body.member, s.ids[4], "the refusal names the member");
    assert.deepEqual(s.w.pub.committed, [], `${who}: the case was never handed to the commit`);
    s.nothing(who);
    assert.equal(r.p.fetched.includes("caseratify"), false, "the commit hop was never made");
    const ok = await s.act(caseRatifyOp, s.body());
    assert.equal(ok.status, 200, `negative control (${who})`);
  }
});

test("R52 (control): a member refused by R4's checks — a stale sha (RATIFY_STALE), a project's own document (C-58.1), a bundle the session cannot see (answered as never minted) — is answered with the act's own refusal naming the member, and nothing is written", async () => {
  const s = await sitting();
  const stale = s.members.map((m, i) => (i === 1 ? { ...m, sha: "f".repeat(64) } : m));
  const a = await s.act(caseRatifyOp, s.body({ members: stale }));
  assert.deepEqual([a.status, a.body.reason, a.body.member, a.body.got], [409, "RATIFY_STALE", s.ids[1], "f".repeat(64)]);
  const proj = [...s.members, { id: s.P, sha: s.w.sha(s.P), signature: await signBundle(s.iris, s.P, s.w.sha(s.P)) }];
  const b = await s.act(caseRatifyOp, s.body({ members: proj }));
  assert.deepEqual([b.status, b.body.reason, b.body.check, b.body.member], [409, "RATIFY_PROJECT_BUNDLE", "C-58.1", s.P]);
  const ghost = [...s.members, { id: "INFO-2026-9999-never", sha: "a".repeat(64), signature: "x" }];
  const c = await s.act(caseRatifyOp, s.body({ members: ghost }));
  assert.deepEqual([c.status, c.body.reason, c.body.member], [404, "ABSENT", "INFO-2026-9999-never"]);
  s.nothing("refused members");
});

test("R52 (control): a member's commit refused after the case's (evidence nothing ratified rests on, C-58.3) rolls the case back with it: the refusal names the member and nothing is written", async () => {
  const s = await sitting();
  s.w.pub.resting.delete(s.ids[6]);   /* the real read: nothing ratified rests on it */
  const r = await s.act(caseRatifyOp, s.body());
  assert.deepEqual([r.status, r.body.reason, r.body.member], [409, "RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE", s.ids[6]],
                   JSON.stringify(r.body).slice(0, 300));
  s.nothing("rolled back");
  assert.equal(r.p.published.size, 0, "nothing was copied");
});

test("R52: members of any other shape are MALFORMED before anything is read; absent or empty members sign the case alone, as before", async () => {
  const s = await sitting();
  for (const members of [{}, "x", [null], [{ id: s.ids[0], sha: s.members[0].sha }], [{ id: "", sha: "a", signature: "s" }],
                         [s.members[0], s.members[0]]]) {
    const r = await s.act(caseRatifyOp, s.body({ members }));
    assert.deepEqual([r.status, r.body.reason], [400, "MALFORMED"], JSON.stringify(members).slice(0, 80));
    assert.deepEqual(r.p.fetched, [], "nothing was read");
  }
  s.nothing("malformed");
  const alone = await s.act(caseRatifyOp, s.body({ members: [] }));
  assert.equal(alone.status, 200);
  assert.equal("sitting" in alone.body, false, "a case signed alone answers as before");
  assert.deepEqual([s.w.count("published_cases"), s.w.count("published_bundles")], [1, 0]);
  assert.deepEqual(alone.body.awaiting, FINDINGS);
});

test("R52, C-92.12: an observation in the sitting crosses when the case document signed with it states its author's level (C-92.10 and C-92.11 passed for it), and is ATTRIBUTION_UNSTATED naming it when the document states none", async () => {
  const OBS = "OBS-2026-0001";
  const stated = [{ observation: OBS, level: "name", shown: "Iris" }];
  for (const [attribution, want] of [[{ reached: [OBS], legacy: [], stated, current: stated }, 200],
                                     [{ reached: [], legacy: [], stated: [], current: [] }, 409]]) {
    const s = await sitting({ attribution });
    s.w.bv.reach = { self: [OBS], via: [] };   /* every member read as the observation itself (R7's testimony reach) */
    const one = [s.members[0]];
    const r = await s.act(caseRatifyOp, s.body({ members: one }));
    assert.equal(r.status, want, JSON.stringify(r.body).slice(0, 300));
    if (want === 409) {
      assert.deepEqual([r.body.reason, r.body.member], ["ATTRIBUTION_UNSTATED", s.ids[0]]);
      s.nothing("unstated");
    } else assert.deepEqual([r.body.sitting.length, s.w.count("published_bundles")], [1, 1]);
  }
});

test("R52: op=publishat verifies the sitting first and holds its signatures with the waiting edition, publishing nothing; at the set time R42's publisher checks each again and commits the case and then each member, copying their bytes", async () => {
  const pubMap = new Map(), capMap = new Map();
  const s = await sitting({ worker: { env: { CAPTURES: bucketOver(capMap), PUBLISHED: bucketOver(pubMap) }, storeName: "s" } });
  const r = await s.act(publishAtOp, s.body({ at: AT }));
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 600));
  assert.equal(r.body.state, "waiting");
  s.nothing("waiting");
  /* what publish-schedule R1 recorded, as its R2 hands it to the publisher */
  const checked = JSON.parse(s.w.row(`SELECT checked FROM scheduled_editions WHERE edition=1`).checked);
  assert.deepEqual(checked.members, s.members.map((m) => ({ id: m.id, sha: m.sha, signature: m.signature })),
                   "the sitting's signatures are held with the waiting edition");
  const due = await s.w.schedule.publishDue(new Date(Date.parse(r.body.publish_at) + 3600e3).toISOString());
  assert.equal(due.taken[0].state, "published", JSON.stringify(due.taken[0]).slice(0, 600));
  assert.deepEqual([s.w.count("published_cases"), s.w.count("published_bundles")], [1, 7]);
  const order = s.w.calls.filter((c) => c[0] === "commitEdition").map((c) => c[1].bundleId);
  assert.deepEqual(order.slice(-7), s.ids, "each member committed after the case, in the sitting's order");
  for (const m of s.members) assert.equal(pubMap.has(`s/published/${m.sha}`), true, `${m.id} copied`);
});

test("R52 (control): op=publishat refuses a sitting with one bad signature before anything is held; a held member whose bytes moved after signing stops the whole edition at its time (SCHEDULED_CHECK_REFUSED, its cause RATIFY_STALE naming the member) and nothing commits", async () => {
  const s = await sitting();
  const bad = s.members.map((m, i) => (i === 3 ? { ...m, signature: s.members[2].signature } : m));
  const refused = await s.act(publishAtOp, s.body({ at: AT, members: bad }));
  assert.deepEqual([refused.status, refused.body.member], [403, s.ids[3]]);
  assert.match(refused.body.reason, /^SIG_/);
  assert.deepEqual(s.w.schedule.scheduledEditions({ case: CASE }).editions, [], "nothing waits");
  const r = await s.act(publishAtOp, s.body({ at: AT }));
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 400));
  /* the second finding is revised after signing */
  const head = s.w.record.head(FINDINGS[1]);
  const moved = s.w.promotion.promote({ bundleId: FINDINGS[1], base: head.bundleSha, snapKey: "20260724T120000Z_abcdef12",
    author: V("iris"), files: [{ path: "bundle.md", text: cleanInqMd(FINDINGS[1]).replace("## Review Notes", "## Review Notes\n\nEdited.") }],
    meta: { object_type: "inquiry" } });
  assert.equal(moved.ok, true, JSON.stringify(moved).slice(0, 300));
  const due = await s.w.schedule.publishDue(new Date(Date.parse(r.body.publish_at) + 3600e3).toISOString());
  const [taken] = due.taken;
  assert.equal(taken.state, "stopped", JSON.stringify(taken).slice(0, 400));
  const stop = taken.reasons.find((x) => x.cause && x.cause.member === FINDINGS[1]);
  assert.ok(stop, JSON.stringify(taken.reasons).slice(0, 400));
  assert.deepEqual([stop.code, stop.cause.code], ["SCHEDULED_CHECK_REFUSED", "RATIFY_STALE"]);
  s.nothing("stopped");
  assert.equal(sha(s.w.record.readFile(FINDINGS[1], "bundle.md").text), s.w.sha(FINDINGS[1]));
});

test("R52 (control): op=publishat answers a member's commit refusal at signing (evidence nothing ratified rests on, C-58.3), made with the case's and rolled back, naming the member; nothing waits and nothing is written", async () => {
  const s = await sitting();
  s.w.pub.resting.delete(s.ids[5]);
  const r = await s.act(publishAtOp, s.body({ at: AT }));
  assert.deepEqual([r.status, r.body.reason, r.body.member], [409, "RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE", s.ids[5]],
                   JSON.stringify(r.body).slice(0, 300));
  assert.equal(s.w.count("scheduled_editions"), 0, "nothing waits");
  s.nothing("probe");
});

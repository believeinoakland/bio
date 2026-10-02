/* ratification R18: the case ceremony's pre-flight (`caseRatifyPreflight`), driven beside the act it answers for. Each
   refusal of R2 and R3 that holds before a signature exists is listed, in R18's order, and each is the act's own
   refusal: the same object `op=caseratify` (the Worker half) or its commit (`ratifyCaseDocument`) answers, less only the
   act's envelope (`store`, `tokenClass` after the payload's refusals). It writes nothing and never throws. R19: a key
   verifies by membership R27's predicate alone, whatever its `origin` (membership R91). A member's own key is
   registered and revoked through credentials (its R9 and R10, were membership R89 and R90; K784, K791). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, signBundle, cleanCase, cleanInfoMd, fmText, CASE_BODY, V } from "./fixture.mjs";
import { caseRatifyOp, ratifyOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001", OBS = "INFO-2026-0009-observation";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const ORDER = ["MACHINE_CANNOT_RATIFY_CASE", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE", "TESTIMONY_CASE_UNPUBLISHABLE",
               "ATTRIBUTION_UNCHOSEN", "ATTRIBUTION_STATEMENT_STALE", "ANONYMOUS_TESTIMONY_UNCORROBORATED", "NO_ATTESTING_KEY", "CASE_SIGNER_NOT_AN_OWNER",
               "CASE_CONCLUSION_MOVED", "GATE_REFUSED"];
const CLEAR = { reached: [], legacy: [], stated: [], current: [] };
const OBS2 = "INFO-2026-0010-observation";
const TIP = { ord: 0, target_id: OBS2, level: "group", state: "uncorroborated", corroborated_by: [] };

/* alice owns P and holds an administrator-registered key; bo joined P and holds none; eve is in no project. The case
   document is stored unsigned, and the act's facts are publication's for it, the attribution facts being whatever
   `publication.attributionFacts` answers (the same read the pre-flight makes). */
async function setup({ mutate = (d) => d, edition = 1, conclusions = true, body = CASE_BODY } = {}) {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo"); w.member("eve");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const text = fmText(mutate(cleanCase({ caseId: CASE, edition, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] })),
                      { raw: conclusions ? ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)] : [], body });
  const docSha = w.caseDoc(CASE, edition, text);
  const facts = () => ({ ok: true, doc: { case_id: CASE, edition, doc_sha: docSha, text },
                         attribution: w.publication.attributionFacts({ text, case_id: CASE, edition }),
                         signers: w.credentials.attestingKeys(), memberBasis: {},
                         priorCase: w.row(`SELECT edition, completeness, bias_acknowledgement FROM published_cases
                                            WHERE case_id=? AND edition<? AND ratified_at IS NOT NULL
                                            ORDER BY edition DESC LIMIT 1`, CASE, edition) });
  const sig = await signCase(key, CASE, edition, docSha);
  /* the act, through the Worker half, with the facts read as they stand at the call */
  const act = async (o = {}, body = { caseId: CASE, edition, expectedSha: docSha, sig }) => {
    w.pub.facts.set(`${CASE}#${edition}`, facts());
    const p = plane(w, o);
    return caseRatifyOp(p.request(body), p.stub, p.ctx);
  };
  /* the commit, the store half, signed by `signer` and delivered by `deliveredBy` */
  const commit = (signer = "alice", deliveredBy = V(signer)) => w.r.ratifyCaseDocument({ caseId: CASE, edition, docSha,
    sigArmored: sig, attestorKey: key.keyB64, attestorMember: signer, gateVersion: "g", deliveredBy });
  const preflight = (o = {}) => w.r.caseRatifyPreflight({ text, signer: "alice", viewer: V("alice"), ...o });
  return { w, P, key, text, docSha, sig, act, commit, preflight };
}
const envelopeless = ({ store, tokenClass, ...rest }) => rest;
const entry = (pf, reason) => pf.refusals.find((r) => r.reason === reason);
const reasons = (pf) => pf.refusals.map((r) => r.reason);

test("R18: a document its project's owner, holding an attesting key, may sign is ready — no refusal — and the act commits it", async () => {
  const { preflight, act } = await setup();
  for (const signer of ["alice", V("alice")])
    assert.deepEqual(preflight({ signer }), { ok: true, ready: true, refusals: [] }, signer);
  for (const viewer of [V("alice"), V("bo"), "admin", V("admin"), null])
    assert.deepEqual(preflight({ viewer }).refusals, [], String(viewer));
  const r = await act();
  assert.deepEqual([r.status, r.body.ok], [200, true], JSON.stringify(r.body).slice(0, 300));
});

test("R18: C-32.13 and C-32.15 are read from the viewer stamp, each the act's own refusal", async () => {
  const { preflight, act } = await setup();
  const ai = preflight({ viewer: "class:ai" });
  assert.deepEqual(reasons(ai), ["MACHINE_CANNOT_RATIFY_CASE", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"],
    "an agent credential did not arrive through a session either");
  assert.deepEqual(ai.refusals[0], (await act({ aiCred: { tokenId: "t1" }, cls: "ai" })).body);
  assert.deepEqual(ai.refusals[1], (await act({ viaSession: false, cls: "ai" })).body);
  assert.deepEqual(reasons(preflight({ viewer: "class:ai/t1" })).slice(0, 2), reasons(ai));
  for (const cls of ["admin", "member", "probe"]) {
    const op = preflight({ viewer: `class:${cls}` });
    assert.deepEqual(reasons(op), ["OPERATOR_TOKEN_CANNOT_RATIFY_CASE"], cls);
    assert.deepEqual(op.refusals[0], (await act({ viaSession: false, cls })).body, cls);
  }
});

test("R18 (N407): a viewer carrying a minted agent credential holds both machine fences, each the act's own, whatever its stamp; a member-scoped agent is told from its member", async () => {
  const { preflight, act } = await setup();
  const agentOfAlice = { stamp: V("alice"), aiCred: { tokenId: "t9", principal: V("alice") } };
  const pf = preflight({ viewer: agentOfAlice });
  assert.deepEqual(reasons(pf), ["MACHINE_CANNOT_RATIFY_CASE", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"]);
  assert.deepEqual(pf.refusals[0], (await act({ aiCred: agentOfAlice.aiCred, cls: "ai" })).body);
  assert.deepEqual(pf.refusals[1], (await act({ viaSession: false, cls: "ai" })).body);
  for (const stamp of ["class:ai", "founder", "", null])
    assert.deepEqual(reasons(preflight({ viewer: { stamp, aiCred: { tokenId: "t9" } } })).slice(0, 2), reasons(pf), String(stamp));
  /* negative controls: the member herself, as a stamp or as a viewer carrying no credential, holds neither */
  for (const viewer of [V("alice"), { stamp: V("alice") }, { stamp: V("alice"), aiCred: null }])
    assert.deepEqual(preflight({ viewer }).refusals, [], JSON.stringify(viewer));
  assert.deepEqual(reasons(preflight({ viewer: { stamp: "class:admin" } })), ["OPERATOR_TOKEN_CANNOT_RATIFY_CASE"],
    "a carried stamp is read as the stamp is");
});

test("R18 (N385): C-32.13 is chosen by the machine-identity predicate, never by the word \"ai\" in a name", async () => {
  const { preflight, act } = await setup();
  const both = ["MACHINE_CANNOT_RATIFY_CASE", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"];
  /* machine identities whose names hold no "ai": each is a machine by the predicate, so each holds both fences */
  for (const viewer of ["claude", "agent", "daemon", "token:claude", "Token:Probe", "class:bot/t7", "class:admin/t2"]) {
    const pf = preflight({ viewer });
    assert.deepEqual(reasons(pf).slice(0, 2), both, viewer);
    assert.deepEqual(reasons(pf).filter((x) => both.includes(x)), both, viewer);
  }
  /* the act's own refusal, for a minted agent credential of a class whose name holds no "ai" */
  assert.deepEqual(preflight({ viewer: "class:bot/t7" }).refusals[0],
                   (await act({ aiCred: { tokenId: "t7" }, cls: "bot" })).body);
  /* members whose names hold "ai" are no machine: neither fence */
  for (const viewer of [V("ai"), V("kai"), V("aisha"), "member:AI", V("admin")])
    assert.deepEqual(reasons(preflight({ viewer })).filter((x) => both.includes(x)), [], viewer);
  /* an operator's bearer stamp holds C-32.15 alone, whatever its class word, as the act answers it */
  for (const cls of ["daemon", "wait", "main"]) {
    const op = preflight({ viewer: `class:${cls}` });
    assert.deepEqual(reasons(op), ["OPERATOR_TOKEN_CANNOT_RATIFY_CASE"], cls);
    assert.deepEqual(op.refusals[0], (await act({ viaSession: false, cls })).body, cls);
  }
});

test("R18: C-53.12, C-92.10 and C-92.11 over publication's attribution facts for these bytes, each the act's own", async () => {
  const s = await setup();
  let attr = { reached: [OBS], legacy: [OBS], stated: [], current: [{ observation: OBS, level: null, why: "no choice made" }] };
  s.w.publication.attributionFacts = () => attr;
  const all = s.preflight();
  assert.deepEqual(reasons(all), ["TESTIMONY_CASE_UNPUBLISHABLE", "ATTRIBUTION_UNCHOSEN", "ATTRIBUTION_STATEMENT_STALE"]);
  const steps = [
    ["TESTIMONY_CASE_UNPUBLISHABLE", "C-53.12", () => { attr = { ...attr, legacy: [] }; }],
    ["ATTRIBUTION_UNCHOSEN", "C-92.10", () => { attr = { ...attr, current: [{ observation: OBS, level: "group", shown: null, why: null }] }; }],
    ["ATTRIBUTION_STATEMENT_STALE", "C-92.11", () => { attr = { ...attr, stated: [{ observation: OBS, level: "group", shown: null }] }; }],
  ];
  for (const [reason, check, relax] of steps) {
    const got = entry(s.preflight(), reason);
    const r = await s.act();
    assert.deepEqual([r.status, r.body.reason, r.body.check], [409, reason, check], reason);
    assert.deepEqual(got, envelopeless(r.body), `${reason}: the act's refusal, less its envelope`);
    relax();
  }
  assert.deepEqual(s.preflight().refusals, [], "every author chose, and the document states it");
  assert.equal((await s.act()).status, 200);
});

test("R18: the attribution facts are publication's real read over the bytes given (an observation reached by the roster)", async () => {
  const { w, preflight } = await setup();
  w.bv.reach = { self: [], via: [{ finding: Q1, observation: OBS }] };
  assert.deepEqual(reasons(preflight()), ["TESTIMONY_CASE_UNPUBLISHABLE", "ATTRIBUTION_UNCHOSEN", "ATTRIBUTION_STATEMENT_STALE"]);
  assert.deepEqual(entry(preflight(), "TESTIMONY_CASE_UNPUBLISHABLE").observations, [OBS]);
});

test("R18, R19: NO_ATTESTING_KEY when the signer holds no attesting key, its remedy naming credentials R9 (was membership R89); a self-registered key counts as an administrator's does, a revoked one does not", async () => {
  const { w, preflight } = await setup();
  const bo = await newKey();
  const none = entry(preflight({ signer: "bo" }), "NO_ATTESTING_KEY");
  assert.deepEqual([none.ok, none.code, none.signer], [false, "NO_ATTESTING_KEY", "bo"]);
  assert.match(none.remedy, /op=signerregister/);
  assert.match(none.remedy, /credentials R9\b/);
  assert.equal(w.credentials.signerRegisterOwn({ keyB64: bo.keyB64, by: "bo" }).origin, "self");
  assert.equal(entry(preflight({ signer: "bo" }), "NO_ATTESTING_KEY"), undefined, "a self-registered key attests");
  assert.equal(w.credentials.signerRevokeOwn({ keyB64: bo.keyB64, by: "bo" }).status, "revoked");
  assert.ok(entry(preflight({ signer: V("bo") }), "NO_ATTESTING_KEY"), "a revoked key does not");
  for (const signer of [null, "", "class:ai", "daemon"])
    assert.deepEqual(entry(preflight({ signer }), "NO_ATTESTING_KEY").signer, null, String(signer));
});

test("R18: CASE_SIGNER_NOT_AN_OWNER is the commit's own, for a signer who is not the project's owner and for a document naming no project", async () => {
  const s = await setup();
  const got = entry(s.preflight({ signer: "bo" }), "CASE_SIGNER_NOT_AN_OWNER");
  assert.deepEqual(got, (await s.commit("bo")));
  assert.equal(entry(s.preflight({ signer: "bo", viewer: V("eve") }), "CASE_SIGNER_NOT_AN_OWNER").reason,
    "CASE_SIGNER_NOT_AN_OWNER", "the deliverer is not asked: eve has no role and is not named");
  assert.equal(reasons(s.preflight({ signer: "bo", viewer: V("eve") })).includes("PROJECT_ACT_NOT_A_PARTICIPANT"), false);
  const loose = await setup({ mutate: (d) => ({ ...d, case_project: "null" }) });
  assert.deepEqual(entry(loose.preflight(), "CASE_SIGNER_NOT_AN_OWNER"), (await loose.commit("alice")));
});

test("R18: C-65.1 is the commit's own, compared against the bytes given and read for the signer", async () => {
  const s = await setup();
  s.w.bv.conc.set(s.w.key(s.P, Q1), { ...OWN, version: "second", at: "2026-09-28T00:00:00Z" });
  const got = entry(s.preflight(), "CASE_CONCLUSION_MOVED");
  assert.equal(got.check, "C-65.1");
  assert.deepEqual(got, (await s.commit()));
  const unrecorded = await setup({ conclusions: false });
  assert.deepEqual(entry(unrecorded.preflight(), "CASE_CONCLUSION_MOVED"), (await unrecorded.commit()),
    "a document recording no conclusion for a project that concluded");
  const seen = [];
  const conc = s.w.bv.conc;
  s.w.r.basisVersions.conclusionOf = (p, q, viewer) => { seen.push(viewer); return conc.get(s.w.key(p, q)) ?? null; };
  s.preflight({ signer: "alice", viewer: V("bo") });
  assert.deepEqual([...new Set(seen)], [V("alice")], "the signer is the viewer the conclusion is read for");
});

test("R18: the case gate's findings, as the act's GATE_REFUSED, with the previous ratified edition and each member's basis at its pin", async () => {
  const bad = await setup({ mutate: (d) => ({ ...d, case_scope: "" }) });
  const got = entry(bad.preflight(), "GATE_REFUSED");
  const r = await bad.act();
  assert.deepEqual([r.status, r.body.reason], [409, "GATE_REFUSED"]);
  assert.deepEqual(got, envelopeless(r.body));
  assert.deepEqual(got.findings.map((f) => f.check), ["C-41.5"]);
  /* edition 2, reprinting edition 1's statement and acknowledgement: C-21.1 twice, from `published_cases` */
  const s = await setup();
  assert.equal((await s.act()).status, 200);
  const q = s.w.sha(Q1);
  assert.equal(s.w.r.publish({ bundleId: Q1, bundleSha: q, attestorKey: s.key.keyB64, attestorMember: "alice",
    gateVersion: "g", sigArmored: "s", shas: [{ sha256: q, path: "bundle.md", kind: "bundle", bytes: 1 }],
    deliveredBy: V("alice") }).ok, true, "edition 1's last member lands, so it is the previous ratified edition");
  const text2 = fmText(cleanCase({ caseId: CASE, edition: 2, project: s.P, members: [{ id: Q1, pin: q }] }),
    { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, s.w.r.caseConclusionFor(s.P, Q1, V("alice"), "open"))],
      body: CASE_BODY });
  const second = s.w.r.caseRatifyPreflight({ text: text2, signer: "alice", viewer: V("alice") });
  assert.deepEqual(entry(second, "GATE_REFUSED").findings.map((f) => f.check), ["C-21.1", "C-21.1"]);
  /* a member whose pinned bytes carry a graded testimony leg: C-2.8's testimony row, read at the pin */
  const leg = await setup({ mutate: (d) => ({ ...d, case_roles: d.case_roles.map((x) => ({ ...x, version_sha: "d".repeat(64) })) }) });
  leg.w.record.textAtSha = (id, pin) => (id === Q1 && pin === "d".repeat(64)
    ? "---\nid: x\nbasis:\n  - target: INFO-2026-0003-said\n    role: supports\n    grade: D\n    grade_axis: testimony\n    grade_source: testimony\n---\n"
    : null);
  const tf = entry(leg.preflight(), "GATE_REFUSED").findings;
  assert.ok(tf.some((f) => f.check === "C-2.8" && /testimony axis/.test(f.detail)), JSON.stringify(tf).slice(0, 400));
});

test("R18: every refusal that holds is listed, each asked on its own, in R18's order", async () => {
  const s = await setup({ mutate: (d) => ({ ...d, case_scope: "" }) });
  s.w.publication.attributionFacts = () => ({ reached: [OBS, OBS2], legacy: [OBS], stated: [],
    current: [{ observation: OBS, level: null, why: "none" }, { observation: OBS2, level: "group", shown: "g", why: null }] });
  s.w.corroboration.set(Q1, [TIP]);
  s.w.bv.conc.set(s.w.key(s.P, Q1), { ...OWN, version: "second" });
  const pf = s.preflight({ signer: "eve", viewer: "class:ai" });
  assert.deepEqual([pf.ok, pf.ready], [true, false]);
  assert.deepEqual(reasons(pf), ORDER);
  assert.ok(pf.refusals.every((x) => x.ok === false));
});

test("R35, R2, R18: a member resting on group- or project-level testimony strength answers uncorroborated is refused ANONYMOUS_TESTIMONY_UNCORROBORATED (C-58.5) after C-92.11, by the act and the pre-flight byte for byte, naming member and observation and never the author; corroborated, or at cover or name, it passes", async () => {
  for (const level of ["group", "project"]) {
    const s = await setup();
    const stated = [{ observation: OBS2, level, shown: "g" }];
    let attr = { reached: [OBS2], legacy: [], stated, current: [{ ...stated[0], why: null }] };
    s.w.publication.attributionFacts = () => attr;
    s.w.corroboration.set(Q1, [{ ...TIP, level }]);
    const pf = s.preflight();
    assert.deepEqual(reasons(pf), ["ANONYMOUS_TESTIMONY_UNCORROBORATED"], level);
    const got = entry(pf, "ANONYMOUS_TESTIMONY_UNCORROBORATED");
    assert.deepEqual([got.code, got.check], ["ANONYMOUS_TESTIMONY_UNCORROBORATED", "C-58.5"]);
    assert.deepEqual(got.uncorroborated, [{ member: Q1, observation: OBS2 }]);
    assert.match(got.detail, new RegExp(`${Q1} on ${OBS2}`));
    assert.match(got.detail, /independent leg.*cover or name.*drop the finding/s, "the ways forward");
    assert.ok(!/alice|author_id|"author"/.test(JSON.stringify(got)), "never the observation's author");
    const asked = s.w.corroborationAsked.at(-1);
    assert.deepEqual([asked.inquiry, asked.levels, asked.viewer, asked.version], [Q1, { [OBS2]: level }, "class:daemon", "first"],
      "judged at its pinned bytes: the reading the document records for it (K1074)");
    const r = await s.act();
    assert.deepEqual([r.status, r.body.reason], [409, "ANONYMOUS_TESTIMONY_UNCORROBORATED"]);
    assert.deepEqual(got, envelopeless(r.body), "the act's refusal, less its envelope");
    /* after C-92.11: with the statement stale as well, the act answers C-92.11 and the pre-flight lists both in order */
    attr = { ...attr, stated: [] };
    assert.deepEqual(reasons(s.preflight()), ["ATTRIBUTION_STATEMENT_STALE", "ANONYMOUS_TESTIMONY_UNCORROBORATED"]);
    assert.equal((await s.act()).body.reason, "ATTRIBUTION_STATEMENT_STALE");
    attr = { ...attr, stated };
    /* negative controls: an independent corroborating leg lets it pass */
    s.w.corroboration.set(Q1, [{ ...TIP, level, state: "corroborated", corroborated_by: [1] }]);
    assert.deepEqual(s.preflight().refusals, []);
    assert.equal((await s.act()).status, 200);
  }
  /* a document recording no conclusion row for the member: its live basis, `version` null */
  const nc = await setup({ conclusions: false });
  nc.w.publication.attributionFacts = () => ({ reached: [OBS2], legacy: [], stated: [{ observation: OBS2, level: "group", shown: "g" }],
                                               current: [{ observation: OBS2, level: "group", shown: "g", why: null }] });
  nc.w.corroboration.set(Q1, [TIP]);
  nc.preflight();
  assert.equal(nc.w.corroborationAsked.at(-1).version, null);
  for (const level of ["cover", "name"]) {
    const s = await setup();
    const stated = [{ observation: OBS2, level, shown: "x" }];
    s.w.publication.attributionFacts = () => ({ reached: [OBS2], legacy: [], stated, current: [{ ...stated[0], why: null }] });
    s.w.corroboration.set(Q1, [TIP]);
    assert.deepEqual(s.preflight().refusals, [], level);
    assert.equal(s.w.corroborationAsked.length, 0, `a leg at ${level} is not asked`);
  }
});

test("R8, R2, R18: C-41.16 — edition 2 with no \"What changed\" statement, or a blank one, is refused GATE_REFUSED naming C-41.16 by the act and the pre-flight, byte for byte; edition 1 without one, and edition 2 with one, pass", async () => {
  const NO_WC = "# Case\n\n## What This Excludes\n\nNothing named.\n";
  for (const body of [NO_WC, `${NO_WC}\n## What Changed in This Edition, and Why\n\n \n`]) {
    const s = await setup({ edition: 2, body });
    const pf = s.preflight();
    assert.deepEqual(reasons(pf), ["GATE_REFUSED"]);
    assert.deepEqual(entry(pf, "GATE_REFUSED").findings.map((x) => x.check), ["C-41.16"]);
    const r = await s.act();
    assert.deepEqual([r.status, r.body.reason], [409, "GATE_REFUSED"]);
    assert.deepEqual(entry(pf, "GATE_REFUSED"), envelopeless(r.body), "the act's refusal, less its envelope");
    assert.equal(s.w.row(`SELECT ratified_at FROM case_documents WHERE case_id=? AND edition=2`, CASE).ratified_at, null,
                 "nothing was signed");
  }
  for (const [edition, body] of [[1, NO_WC], [2, CASE_BODY]]) {
    const s = await setup({ edition, body });
    assert.deepEqual(s.preflight().refusals, [], `edition ${edition}`);
    assert.equal((await s.act()).status, 200, `edition ${edition}`);
  }
});

test("R18: it writes nothing and never throws", async () => {
  const s = await setup();
  const tables = s.w.st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).map((x) => x.name);
  const snap = () => JSON.stringify(tables.map((t) => s.w.st.sql.exec(`SELECT * FROM "${t}"`)));
  const before = snap();
  s.preflight(); s.preflight({ signer: "eve", viewer: "class:ai" });
  for (const text of [null, undefined, 3, "", "no front matter", "---\n---\n", "---\ncase_id: [\n---\n"])
    for (const o of [{}, { signer: {} }, { viewer: 7 }, { signer: null, viewer: null }]) {
      const pf = s.w.r.caseRatifyPreflight({ text, ...o });
      assert.equal(pf.ok, true, JSON.stringify([text, o]));
      assert.ok(reasons(pf).includes("GATE_REFUSED"), "unreadable bytes are the gate's to refuse");
    }
  assert.doesNotThrow(() => s.w.r.caseRatifyPreflight());
  assert.equal(snap(), before, "nothing was written");
  s.w.publication.attributionFacts = () => { throw new Error("disk"); };
  const u = s.preflight();
  assert.deepEqual([u.ok, u.reason, "refusals" in u], [false, "PREFLIGHT_UNDETERMINED", false]);
  assert.doesNotMatch(u.detail, /disk/);
  assert.equal(snap(), before);
});

test("R19: a signature by a member's self-registered key verifies exactly as an administrator-registered key's, in both ceremonies; revoked, it does not", async () => {
  const s = await setup();
  const own = await newKey();
  assert.equal(s.w.credentials.signerRegisterOwn({ keyB64: own.keyB64, by: "alice" }).origin, "self");
  const sig = await signCase(own, CASE, 1, s.docSha);
  const r = await s.act({}, { caseId: CASE, edition: 1, expectedSha: s.docSha, sig });
  assert.deepEqual([r.status, r.body.attestor], [200, { member: "alice", key_b64: own.keyB64 }]);
  /* op=ratify, over the evidence the case's finding rests on */
  const DOC = "INFO-2026-0001-report";
  s.w.promote(DOC, cleanInfoMd(DOC), "information");
  s.w.pub.resting.set(DOC, [{ case_id: CASE, finding: Q1, project: s.P }]);
  const run = async (key) => {
    const p = plane(s.w);
    return ratifyOp(p.request({ bundleId: DOC, expectedSha: s.w.sha(DOC), sig: await signBundle(key, DOC, s.w.sha(DOC)) }),
                    p.stub, p.ctx);
  };
  s.w.credentials.signerRevokeOwn({ keyB64: own.keyB64, by: "alice" });
  const revoked = await run(own);
  assert.deepEqual([revoked.status, revoked.body.reason], [403, "SIG_UNKNOWN_KEY"], "a revoked self key attests nothing");
  const fresh = await newKey();
  s.w.credentials.signerRegisterOwn({ keyB64: fresh.keyB64, by: "alice" });
  const ok = await run(fresh);
  assert.deepEqual([ok.status, ok.body.attestor], [200, "alice"], JSON.stringify(ok.body).slice(0, 300));
});

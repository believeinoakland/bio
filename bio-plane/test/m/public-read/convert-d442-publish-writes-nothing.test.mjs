/* Converts the public-read share of `bio-plane/test/d442-publish-writes-nothing.test.mjs` (D-442,
   BIO_Publication_v0_1.md §3 rule 12: publishing writes nothing on a member finding) into module tests of
   `public-read`, in its requirement ids:
     R3 — `publishedCase` serves each member's frozen pair, grounds and own edition as ITS case document states them,
          and its `What This Excludes` from that document, saying so (`excludes_from: "case_document"`) — the old
          suite's liar arms: equality with values the finding's own bytes cannot supply.
     R6 — the container manifest built by `assembleCaseContainer` carries, per member, the case document's pair and
          the member's own edition, and the case document whole.
   The old suite drove op=publish, op=caseratify and op=ratify under miniflare with real signatures; the same facts
   are rebuilt here through the fixture's world as ratification commits them: one shared finding Q, pinned at ONE
   sha by case X (project A) and by a new case of another project B, each case document stating its own grounds and
   its own exclusions. The rest of that suite (the unmoved sha, the flags, the gate, excludedby, the committer) belongs
   to other modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, caseDoc, NOW, V } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/frontmatter.mjs";

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const Q = "INQ-2026-4442-shared";
const CASE_X = "CASE-2026-4442-x", CASE_B = "CASE-2026-4442-b";
const MEMO = "INFO-2026-4442-memo";
const STRENGTH = [{ target: Q, axis: "capture", grade: "B" }, { target: Q, axis: "connection", grade: "C" }];
const strip = (rows) => rows.map(({ target, ...r }) => r);

/* A case document with its own `case_strength_grounds` rows (the fixture's builder writes none), inserted into the
   front matter as case-authoring writes them. */
function docWithGrounds(caseId, edition, opts, grounds) {
  const lines = caseDoc(caseId, edition, { format: "bio-case-document/5", ...opts }).split("\n");
  const at = lines.indexOf("completeness:");
  const rows = ["case_strength_grounds:", ...grounds.flatMap((g) => [`  - target: ${g.target}`, `    version: "${g.version}"`,
                                                                    `    ground: "${g.ground}"`])];
  return [...lines.slice(0, at), ...rows, ...lines.slice(at)].join("\n");
}

function prepare(w, caseId, text) {
  const r = w.p.storeCaseDocument({ case: caseId, edition: 1, text, author: V("iris"), at: NOW });
  assert.equal(r.ok, true, "the case document is stored");
  return text;
}

/* Case X (project A) pins Q, is ratified, Q ratified at X's pin; then project B publishes a NEW case over the same
   sha, with its own grounds and its own exclusions, and ratifies it. Q's bytes are never touched after X's pin. */
function sharedFinding() {
  const w = world();
  w.member("iris");
  const A = w.project("Oversight", "iris"), B = w.project("Neighbours", "iris");
  w.doc(MEMO);
  w.inquiry(Q);
  const PIN = w.head(Q), textBefore = w.text(Q);
  const roles = [{ target: Q, version_sha: PIN, edition: 1, role: "load_bearing" }];
  const roster = [{ bundle_id: Q, version_sha: PIN, role: "load_bearing" }];
  const textX = prepare(w, CASE_X, docWithGrounds(CASE_X, 1, { project: A, roles, strength: STRENGTH,
    excluded: [{ target: MEMO, description: "the FY2023 comparison memo (publication 1)" }],
    excludes: "This case does not cover the 2025 transfers (publication 1)." },
    [{ target: Q, version: "paper trail", ground: "paper trail" }]));
  assert.equal(w.signCase(CASE_X, 1, { project: A, signer: "iris", roster }).ok, true);
  const ratQ = w.signFinding(Q, { signer: "iris" });
  assert.deepEqual([ratQ.ok, ratQ.edition], [true, 1], "Q ratifies at X's pin, its edition read from X's case document");
  const textB = prepare(w, CASE_B, docWithGrounds(CASE_B, 1, { project: B, roles, strength: STRENGTH,
    excluded: [{ target: MEMO, description: "the FY2023 comparison memo (publication 2)" }],
    excludes: "This case does not cover the 2025 transfers (publication 2)." },
    [{ target: Q, version: "the audit", ground: "the audit" }]));
  assert.equal(w.signCase(CASE_B, 1, { project: B, signer: "iris", roster, sig: "-----BEGIN SSH SIGNATURE-----\nb\n-----END SSH SIGNATURE-----" }).ok, true);
  const again = w.signFinding(Q, { signer: "iris" });
  assert.deepEqual([again.ok, again.existed, again.edition], [true, true, 1], "B's ratification of Q is a retry, not a revision");
  assert.deepEqual([w.head(Q), w.text(Q)], [PIN, textBefore], "(guard) Q's bytes never moved");
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${PIN}`, new TextEncoder().encode(textBefore));
  return { w, A, B, PIN, textBefore, fmX: parseFrontmatter(textX).data, fmB: parseFrontmatter(textB).data, env };
}

const route = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

test("R3 (d442) Q's own bytes carry none of the moved blocks, so a reader left on them would read nothing (the guard for every liar arm below)", () => {
  const { textBefore } = sharedFinding();
  assert.deepEqual([/^published_strength:/m.test(textBefore), /^completeness:/m.test(textBefore),
                    /^completeness_excluded:/m.test(textBefore), /^## What This Excludes$/m.test(textBefore),
                    /^case_strength_grounds:/m.test(textBefore), /\| Published \|/.test(textBefore)],
                   [false, false, false, false, false, false]);
});

test("R3 (d442) publishedCase serves B's member with the pair, grounds and own edition B's case document states, frozen_from case_document, and B's own excludes", () => {
  const { w, PIN, fmB, fmX } = sharedFinding();
  const wantStrength = strip(fmB.case_strength.filter((r) => r.target === Q));
  const wantGrounds = strip(fmB.case_strength_grounds.filter((r) => r.target === Q));
  assert.equal(wantGrounds.length, 1, "(guard) B's document states a ground");
  assert.notDeepEqual(wantGrounds, strip(fmX.case_strength_grounds), "(guard) X's grounds differ, so the read names its case");
  for (const pc of [w.read("publishedcase", { id: Q, caseId: CASE_B }), w.read("publishedcase", { sha256: PIN, caseId: CASE_B }),
                    w.read("publishedcase", { id: CASE_B }), w.pr.publishedCase({ caseId: CASE_B, edition: 1 })]) {
    assert.deepEqual([pc.ok, pc.caseId, pc.edition], [true, CASE_B, 1]);
    const f = pc.findings[0];
    assert.equal(pc.findings.length, 1);
    assert.deepEqual([f.bundle_id, f.version_sha, f.bundle_sha, f.frozen_from, f.edition], [Q, PIN, PIN, "case_document", 1]);
    assert.deepEqual(f.strength, wantStrength, "the pair is the case document's");
    assert.ok(Array.isArray(f.strength) && f.strength.length >= 2);
    assert.deepEqual(f.grounds, wantGrounds, "the grounds are the case document's");
    assert.equal(typeof f.case_excludes, "string");
    assert.match(f.case_excludes, /\(publication 2\)/, "B's own `What This Excludes`, not X's");
    assert.doesNotMatch(f.case_excludes, /\(publication 1\)/);
    assert.equal("strength" in pc, false, "no case-level strength");
  }
  /* and case X's read serves X's grounds and X's excludes, from X's document, over the same bytes */
  const px = w.read("publishedcase", { id: Q, caseId: CASE_X }).findings[0];
  assert.deepEqual([px.frozen_from, px.edition, px.grounds], ["case_document", 1, strip(fmX.case_strength_grounds)]);
  assert.match(px.case_excludes, /\(publication 1\)/);
  /* a finding two cases pin, asked by id or hash with no case named, is refused naming both (C-44.2) */
  const amb = w.read("publishedcase", { id: Q });
  assert.deepEqual([amb.ok, amb.reason, amb.check, amb.cases], [false, "FINDING_IN_SEVERAL_CASES", "C-44.2", [CASE_B, CASE_X]]);
});

test("R3 (d442) the public case route renders the member's `What This Excludes` from the CASE DOCUMENT and says so (excludes_from: case_document), its pair and grounds unchanged by the route", async () => {
  const { w, env, PIN, fmB } = sharedFinding();
  const r = await route(w, env, "publishedcase", { id: Q, caseId: CASE_B });
  assert.equal(r.status, 200);
  const pc = await r.json();
  const f = pc.findings[0];
  assert.deepEqual([f.body.state, f.body.from_sha, f.body.excludes_from], ["published", PIN, "case_document"]);
  assert.equal(typeof f.body.excludes, "string");
  assert.ok(f.body.excludes.includes("This case does not cover the 2025 transfers (publication 2)."),
            "the words are B's case document's section, which Q's own bytes do not carry");
  assert.deepEqual([f.frozen_from, f.edition, f.strength, f.grounds],
                   ["case_document", 1, strip(fmB.case_strength.filter((x) => x.target === Q)),
                    strip(fmB.case_strength_grounds.filter((x) => x.target === Q))]);
});

test("R6 (d442) the container assembleCaseContainer builds for B's case edition carries, for the member, the case document's pair and the member's own edition, and the case document whole", async () => {
  const { w, env, PIN, fmB } = sharedFinding();
  const cs = w.p.caseEditionState(CASE_B, 1, "test-group");
  assert.equal(cs.complete, true);
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.match(String(out.manifest_sha), /^[0-9a-f]{64}$/);
  const pc = w.read("publishedcase", { id: CASE_B });
  assert.equal(pc.manifest_sha, out.manifest_sha);
  /* the container as served by its hash */
  const r = await route(w, env, "publishedbytes", { sha256: out.manifest_sha });
  assert.equal(r.status, 200);
  const man = JSON.parse(await r.text());
  assert.deepEqual(man, pc.manifest, "the bytes served are the manifest the case edition recorded");
  assert.equal(man.findings.length, 1);
  const m0 = man.findings[0];
  const wantStrength = strip(fmB.case_strength.filter((x) => x.target === Q));
  assert.deepEqual([m0.bundle_id, m0.bundle_sha, m0.version_sha, m0.edition], [Q, PIN, PIN, 1]);
  assert.deepEqual(m0.strength, wantStrength, "the member's pair is the case document's");
  assert.deepEqual(m0.strength, pc.findings[0].strength, "and the same pair the public read serves");
  assert.equal("strength" in man, false, "no case-level strength in the artifact that travels");
  assert.equal(typeof man.case_document.text, "string");
  assert.ok(man.case_document.text.includes("case_strength:"));
  assert.equal(man.case_document.text, w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=1`, CASE_B).text,
               "the case document whole");
  assert.match(man.verify, /Each finding's `strength` and its own `edition` are stated in the CASE DOCUMENT/);
});

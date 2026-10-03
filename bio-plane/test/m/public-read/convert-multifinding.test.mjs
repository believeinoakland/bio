/* public-read — converts the old suite `bio-plane/test/multifinding.test.mjs` (REC-44 / DEC-44: a published case holds
   several findings), public-read's share only:
     R3  the two-member lifecycle (blocks 2 and 2b): a case of two findings reads incomplete, naming the member it
         awaits and serving no container, after its first member is published, and complete after its last; each
         finding answers from its own signed bytes with its own signature; a member's id resolves to its case; a member
         whose bytes move after the case pinned it leaves the case (the case serves the pin), and restored bytes match
         the pin again.
     R6  the multi-finding container (block 2): every part namespaced `<case>/<finding>/<path>`, assembled with
         `assembleCaseContainer` over two findings, each part in the zip hashing to the manifest.
     R4  `publishedmanifest` (blocks 2, 2b and 6): the awaiting window (a finding that ratified carries its own frozen
         pair while the case still awaits its other member), `caseMembers` (the roster and its pins, joined to
         `published` by the pin), and `altitudes`.
   The old suite drove a whole plane under miniflare with real ssh signatures; here the same facts are rebuilt on
   public-read's fixture world, the commits played through `w.prepare`/`w.signCase`/`w.signFinding` as ratification
   makes them, and the Worker routes driven over the fixture's stub store and bucket. The rest of the suite (the
   publishing act, C-2.8, C-21.1, C-21.2, the case-level-strength sweep) belongs to other modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, sha, SIG } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const route = (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

const CASE = "CASE-2026-4400";
const FIND_A = "INQ-2026-4401", FIND_B = "INQ-2026-4402", FIND_C = "INQ-2026-4403";
const INFO = "INFO-2026-4400-memo";
const BIAS = "This group holds a declared position that transfers should be adopted in public session.";
/* The two findings are worth different things on both axes, in state and in grade (the old fixture's whole point):
   FIND_A capture graded B / connection graded C; FIND_B capture unrated / connection graded D. */
const PAIRS = [{ target: FIND_A, axis: "capture", grade: "B" }, { target: FIND_A, axis: "connection", grade: "C" },
               { target: FIND_B, axis: "capture", state: "unrated", grade: null },
               { target: FIND_B, axis: "connection", grade: "D" }];
const NO_BAR = { declared: false, capture: null, connection: null };
const grades = (s) => (s || []).map((a) => [a.axis, a.state, a.grade]);
const PAIR_A = [["capture", "graded", "B"], ["connection", "graded", "C"]];
const PAIR_B = [["capture", "unrated", null], ["connection", "graded", "D"]];
/* A captured part on FIND_A, so the container carries a blob beside the text, and the two findings differ in what
   they contribute to it as well as in what they are worth. */
const CAPTURE = new Uint8Array(384).map((_, i) => (i * 11) % 253);
const CAP_SHA = sha(Buffer.from(CAPTURE));

/* CASE edition 1 over FIND_A and FIND_B, its document prepared and signed (the roster pinned), no member published
   yet. `publish(id)` plays ratification's commit of one member at its pinned bytes and puts those bytes (and FIND_A's
   capture) in the published bucket, as the ratify path does. */
function twoMemberCase() {
  const w = world();
  w.member("olive"); w.member("wren");
  const proj = w.project("Sewer transfer", "olive");
  w.doc(INFO);
  w.inquiry(FIND_A, { question: "Was the FY2024 sewer transfer authorised?" });
  w.inquiry(FIND_B, { question: "Did anyone with delegated authority sign it?" });
  const pins = { [FIND_A]: w.head(FIND_A), [FIND_B]: w.head(FIND_B) };
  const texts = { [FIND_A]: w.text(FIND_A), [FIND_B]: w.text(FIND_B) };
  const roles = [FIND_A, FIND_B].map((t) => ({ target: t, version_sha: pins[t] }));
  w.prepare(CASE, 1, { format: "bio-case-document/5", project: proj, roles, strength: PAIRS });
  const signed = w.signCase(CASE, 1, { project: proj, bar: NO_BAR,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) });
  assert.equal(signed.ok, true, JSON.stringify(signed));
  const env = { PUBLISHED: bucket() };
  const publish = (id, n) => {
    const text = texts[id];
    const shas = [{ sha256: pins[id], path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }];
    if (id === FIND_A) shas.push({ sha256: CAP_SHA, path: "snapshots/memo.bin", kind: "capture", bytes: CAPTURE.length });
    const r = w.signFinding(id, { sig: SIG(n), signer: "wren", shas });
    assert.equal(r.ok, true, JSON.stringify(r));
    env.PUBLISHED.m.set(`bio/published/${pins[id]}`, new TextEncoder().encode(text));
    if (id === FIND_A) env.PUBLISHED.m.set(`bio/published/${CAP_SHA}`, CAPTURE);
    return r;
  };
  return { w, proj, pins, texts, env, publish };
}

/* The old suite's block-6 sweep, over one `publishedmanifest` answer: for every member of every case edition the index
   holds, joined to `published` BY THE PIN (never edition to edition), a ratified member must carry its own two-axis
   pair and a declared-bar fact, and an awaited member must carry nothing at all. Reports rather than throws, naming
   the member. */
function understated(idx, label) {
  const out = [];
  const owners = new Set();
  const walk = (node, owner) => {
    if (Array.isArray(node)) { node.forEach((v) => walk(v, owner)); return; }
    if (!node || typeof node !== "object") return;
    const own = Object.prototype.hasOwnProperty.call(node, "bundle_id") ? node.bundle_id : owner;
    for (const [k, v] of Object.entries(node)) {
      if (["strength", "required", "required_strength", "published_strength"].includes(k) && v !== null) owners.add(own ?? null);
      walk(v, own);
    }
  };
  walk(idx, null);
  for (const cs of idx.cases || []) {
    for (const m of (idx.caseMembers || []).filter((x) => x.case_id === cs.case_id && Number(x.edition) === Number(cs.edition))) {
      const row = (idx.published || []).find((p) => p.bundle_id === m.bundle_id && p.bundle_sha === m.version_sha);
      const where = `${label} ${cs.case_id}@${cs.edition} ${m.bundle_id}`;
      if (!row) {
        if (owners.has(m.bundle_id)) out.push(`${where}: AWAITED member carries a pair nobody signed for it`);
        continue;
      }
      if (!Array.isArray(row.strength) || row.strength.length !== 2 || !row.strength.every((a) => a && a.axis && a.state))
        out.push(`${where}: RATIFIED member has NO frozen pair on the index`);
      if (!row.required || typeof row.required.declared !== "boolean")
        out.push(`${where}: RATIFIED member states no declared-bar fact on the index`);
    }
  }
  return out;
}
const expand = (idx) => ({ ...idx, cases: (idx.cases || []).map((c) => ({ ...c,
  manifest: typeof c.manifest === "string" ? JSON.parse(c.manifest) : c.manifest })) });

test("R3 (two-member lifecycle) after the first member is published the case reads incomplete, awaiting the second, with no container; after the last it is complete, each finding with its own pair, bytes and signature", async () => {
  const { w, pins, env, publish } = twoMemberCase();
  /* signed, nobody published: the case edition exists and awaits both */
  const none = w.pr.publishedCase({ id: CASE });
  assert.deepEqual([none.ok, none.complete, none.awaiting, none.findings, none.manifest_sha],
                   [true, false, [FIND_A, FIND_B], [], null]);

  publish(FIND_A, 1);
  const mid = w.read("publishedcase", { id: CASE });
  assert.deepEqual([mid.ok, mid.caseId, mid.edition, mid.complete, mid.awaiting, mid.manifest_sha, mid.manifest, mid.files],
                   [true, CASE, 1, false, [FIND_B], null, null, []],
                   "incomplete, naming what it waits for, and no container yet");
  assert.deepEqual(mid.findings.map((f) => [f.bundle_id, f.bundle_sha, f.version_sha]), [[FIND_A, pins[FIND_A], pins[FIND_A]]],
                   "the finding that was published answers, at its pin");
  assert.deepEqual(grades(mid.findings[0].strength), PAIR_A);
  /* the Worker's public route says the same, and offers no container to fetch */
  const midR = await route(w, env, "publishedcase", { id: CASE });
  assert.equal(midR.status, 200);
  const midC = await midR.json();
  assert.deepEqual([midC.complete, midC.awaiting, midC.manifest_sha, midC.verification.container, midC.verification.manifest],
                   [false, [FIND_B], null, null, null]);
  assert.deepEqual(midC.findings.map((f) => [f.bundle_id, f.body.state, f.body.from_sha]), [[FIND_A, "published", pins[FIND_A]]]);
  assert.equal(w.p.caseEditionState(CASE, 1).complete, false, "nothing to assemble while a member is awaited");

  publish(FIND_B, 2);
  const c = w.read("publishedcase", { id: CASE });
  assert.deepEqual([c.ok, c.complete, c.awaiting], [true, true, []]);
  assert.deepEqual(c.findings.map((f) => [f.bundle_id, grades(f.strength)]), [[FIND_A, PAIR_A], [FIND_B, PAIR_B]],
                   "both findings, both frozen pairs, and they differ");
  assert.equal("strength" in c, false, "no case-level strength over two findings worth different things");
  assert.equal(c.bias_acknowledgement, "none declared");
  const full = await (await route(w, env, "publishedcase", { id: CASE })).json();
  assert.deepEqual(full.findings.map((f) => [f.bundle_id, f.body.state, f.body.from_sha]),
                   [[FIND_A, "published", pins[FIND_A]], [FIND_B, "published", pins[FIND_B]]],
                   "each body is rendered from its OWN signed bytes (D-1)");
  assert.match(full.findings[0].body.question, /sewer transfer authorised/);
  assert.match(full.findings[1].body.question, /delegated authority/);
  assert.deepEqual([full.findings[0].sig_armored !== full.findings[1].sig_armored,
                    full.findings.every((f) => f.sig_armored.startsWith("-----BEGIN SSH SIGNATURE-----"))], [true, true],
                   "each finding carries its own signature");
  /* a member's id resolves to its case and says which was asked; so does its hash */
  const byB = w.read("publishedcase", { id: FIND_B });
  assert.deepEqual([byB.caseId, byB.asked, byB.complete], [CASE, FIND_B, true]);
  const byHash = w.read("publishedcase", { sha256: pins[FIND_B] });
  assert.deepEqual([byHash.caseId, byHash.edition, byHash.asked], [CASE, 1, FIND_B]);
  /* a bundle nothing published answers as nothing published */
  const info = w.read("publishedcase", { id: INFO });
  assert.deepEqual([info.ok, info.reason], [false, "NOT_PUBLISHED"]);
  /* REC-58: the public read carries `ratified_at` and never `opened` */
  assert.deepEqual(["opened" in c, "ratified_at" in c, typeof c.ratified_at], [false, true, "string"]);
});

test("R3 (edited member leaves) a member whose bytes move after the case pinned them leaves the case: the case serves the pin, awaits the moved member, and restored bytes match the pin again", () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Notice", "olive");
  w.inquiry(FIND_C, { question: "Was notice given?" });
  const cMd = w.text(FIND_C), pin = w.head(FIND_C);
  const C_CASE = "CASE-2026-4410";
  /* prepared and not signed: nothing on the public index names it */
  w.prepare(C_CASE, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: FIND_C, version_sha: pin }] });
  const before = w.read("publishedmanifest");
  assert.deepEqual([before.cases.some((c) => c.case_id === C_CASE), before.caseMembers.some((m) => m.case_id === C_CASE)],
                   [false, false], "an unsigned case document commits nothing to the public index");
  assert.equal(w.read("publishedcase", { id: C_CASE }).reason, "NOT_PUBLISHED");
  w.signCase(C_CASE, 1, { project: proj, roster: [{ bundle_id: FIND_C, version_sha: pin }] });
  const after = w.read("publishedmanifest");
  assert.deepEqual([after.cases.some((c) => c.case_id === C_CASE),
                    after.caseMembers.filter((m) => m.case_id === C_CASE).map((m) => [m.bundle_id, m.version_sha])],
                   [true, [[FIND_C, pin]]], "signed: the case and its pinned roster are on the index, the member awaited");

  /* the member edits its own bytes: its sha moves off the pin, so it is not in that case edition */
  const edited = cMd.replace("## Review Notes", "## Review Notes\n\nA different completeness block.");
  assert.equal(w.promote(FIND_C, edited).ok, true);
  assert.notEqual(w.head(FIND_C), pin);
  const left = w.read("publishedcase", { id: C_CASE });
  assert.deepEqual([left.findings.map((f) => f.bundle_id), left.awaiting, left.complete], [[], [FIND_C], false],
                   "the member LEAVES its case rather than corrupting it");
  assert.equal(w.read("publishedmanifest").caseMembers.find((m) => m.case_id === C_CASE).version_sha, pin,
               "the case goes on naming the version it froze");

  /* restoring the content restores the sha, which matches the pin again; published there, the case completes on it */
  assert.equal(w.promote(FIND_C, cMd).ok, true);
  const pinOnIndex = w.read("publishedmanifest").caseMembers.find((m) => m.case_id === C_CASE && m.bundle_id === FIND_C);
  assert.deepEqual([pinOnIndex.version_sha === w.head(FIND_C), /^[0-9a-f]{64}$/.test(pinOnIndex.version_sha)], [true, true]);
  assert.equal(w.signFinding(FIND_C, { sig: SIG(3) }).ok, true);
  const back = w.read("publishedcase", { id: C_CASE });
  assert.deepEqual([back.complete, back.awaiting, back.findings.map((f) => [f.bundle_id, f.bundle_sha])],
                   [true, [], [[FIND_C, pin]]]);

  /* and once published at the pin, bytes that move again leave the case serving the pinned version it froze */
  assert.equal(w.promote(FIND_C, edited).ok, true);
  const served = w.read("publishedcase", { id: C_CASE });
  assert.deepEqual([served.complete, served.findings[0].bundle_sha, served.findings[0].version_sha],
                   [true, pin, pin], "the case serves the pin, not the working head");
  assert.notEqual(w.head(FIND_C), served.findings[0].bundle_sha);
});

test("R6 (multi-finding container) each finding's parts are namespaced <case>/<finding>/<path>, assembled with assembleCaseContainer over two findings, and every part in the zip hashes to the manifest", async () => {
  const { w, pins, texts, env, publish } = twoMemberCase();
  publish(FIND_A, 1);
  publish(FIND_B, 2);
  const cs = w.p.caseEditionState(CASE, 1, "test-group");
  assert.equal(cs.complete, true);
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.deepEqual([out.findings, out.parts, out.zip], [2, 3, `op=publishedbytes&sha256=${out.manifest_sha}&format=zip`]);
  /* the public read now names the container */
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.manifest_sha, out.manifest_sha);
  assert.deepEqual(c.files.map((f) => [f.finding, f.path]).sort(),
                   [[FIND_A, `${FIND_A}/bundle.md`], [FIND_A, `${FIND_A}/snapshots/memo.bin`], [FIND_B, `${FIND_B}/bundle.md`]].sort());
  /* the manifest, fetched by its own hash */
  const mr = await route(w, env, "publishedbytes", { sha256: out.manifest_sha });
  assert.equal(mr.status, 200);
  const mBytes = new Uint8Array(await mr.arrayBuffer());
  assert.equal(sha(Buffer.from(mBytes)), out.manifest_sha, "the manifest answers by its own sha256");
  const manifest = JSON.parse(new TextDecoder().decode(mBytes));
  assert.deepEqual([manifest.format, manifest.case, manifest.edition, manifest.findings.map((f) => f.bundle_id)],
                   ["bio-case-container/6", CASE, 1, [FIND_A, FIND_B]]);
  assert.ok(manifest.findings.every((f) => f.signature.armored.startsWith("-----BEGIN SSH SIGNATURE-----")),
            "every member carries its own signature");
  assert.deepEqual(manifest.findings.map((f) => [f.edition, grades(f.strength)]), [[1, PAIR_A], [1, PAIR_B]]);
  assert.deepEqual(manifest.findings.map((f) => f.parts), [[`${FIND_A}/bundle.md`, `${FIND_A}/snapshots/memo.bin`], [`${FIND_B}/bundle.md`]]);
  assert.deepEqual(manifest.parts.map((p) => [p.finding, p.path]).sort(),
                   [[FIND_A, `${FIND_A}/bundle.md`], [FIND_A, `${FIND_A}/snapshots/memo.bin`], [FIND_B, `${FIND_B}/bundle.md`]].sort(),
                   "two members both carry a bundle.md, so every part is namespaced by its finding");
  assert.equal(manifest.layout.root, `${CASE}/`);
  assert.equal(manifest.bias_acknowledgement, "none declared", "the case's acknowledgement travels in the container");
  assert.deepEqual(["opened" in manifest, "ratified_at" in manifest, "strength" in manifest], [false, true, false]);
  /* the zip */
  const zr = await route(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip" });
  assert.equal(zr.status, 200);
  const zip = new Uint8Array(await zr.arrayBuffer());
  const zc = await readContainer(zip);
  assert.deepEqual([zc.ok, zc.count], [true, 4]);
  assert.deepEqual(zc.entries.map((e) => e.name).sort(),
                   ["MANIFEST.json", `${CASE}/${FIND_A}/bundle.md`, `${CASE}/${FIND_A}/snapshots/memo.bin`, `${CASE}/${FIND_B}/bundle.md`].sort());
  const missing = [];
  for (const p of manifest.parts) {
    const got = await readPart(zip, zc, `${CASE}/${p.path}`);
    if (!got.ok || sha(Buffer.from(got.bytes)) !== p.sha256) missing.push(p.path);
  }
  assert.deepEqual(missing, [], "EVERY part of EVERY finding hashes to what the manifest says");
  assert.deepEqual(manifest.parts.find((p) => p.path === `${FIND_B}/bundle.md`).sha256, pins[FIND_B]);
  const inZip = await readPart(zip, zc, `${CASE}/${FIND_B}/bundle.md`);
  assert.equal(new TextDecoder().decode(inZip.bytes), texts[FIND_B], "the second finding's whole document is inside the zip");
  const inner = JSON.parse(new TextDecoder().decode((await readPart(zip, zc, "MANIFEST.json")).bytes));
  assert.deepEqual(inner, manifest, "the manifest at the zip's root is the manifest served by hash");
  /* the same manifest and parts give the same bytes; assembled again, the same container */
  const zip2 = new Uint8Array(await (await route(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip" })).arrayBuffer());
  assert.deepEqual(zip2, zip);
  const again = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs: w.p.caseEditionState(CASE, 1, "test-group"), via: "test" });
  assert.equal(again.manifest_sha, out.manifest_sha);
});

test("R4 (awaiting window, caseMembers, altitudes) publishedmanifest carries a ratified finding's own frozen pair while its case awaits the other member, a pinned roster joined by the pin, no pair for the awaited member or the case, and says at which altitude a pair lives", async () => {
  const { w, pins, env, publish } = twoMemberCase();
  publish(FIND_A, 1);
  /* THE AWAITING WINDOW: the case has no container manifest, and the index already states the ratified member's pair */
  const mid = w.read("publishedmanifest");
  assert.equal(mid.ok, true);
  const rowA = mid.published.find((p) => p.bundle_id === FIND_A && p.edition === 1);
  const csRow = mid.cases.find((c) => c.case_id === CASE && c.edition === 1);
  assert.deepEqual([grades(rowA.strength), rowA.required.declared, csRow.manifest, csRow.manifest_sha],
                   [PAIR_A, false, null, null], "the ratified member's OWN frozen pair, with no container to read one from");
  assert.equal("strengthByCase" in rowA, false, "one case pins it: the row is unchanged");
  assert.deepEqual([!!mid.published.find((p) => p.bundle_id === FIND_B),
                    mid.caseMembers.filter((m) => m.case_id === CASE && m.edition === 1).map((m) => m.bundle_id)],
                   [false, [FIND_A, FIND_B]], "nothing states a pair for the awaited member; the roster names both");
  assert.deepEqual(mid.caseMembers.filter((m) => m.case_id === CASE).map((m) => [m.ord, m.bundle_id, m.version_sha, m.role]),
                   [[0, FIND_A, pins[FIND_A], "load_bearing"], [1, FIND_B, pins[FIND_B], "load_bearing"]],
                   "each roster row carries its pin and its authored role");
  assert.deepEqual(understated(expand(mid), "publishedmanifest(awaiting)"), []);
  for (const c of mid.cases) assert.equal("strength" in c, false, "no case row carries a pair");

  publish(FIND_B, 2);
  await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs: w.p.caseEditionState(CASE, 1, "test-group"), via: "test" });
  /* a second case, signed and never published by any member, and a third, prepared and never signed */
  w.inquiry(FIND_C);
  const pinC = w.head(FIND_C);
  w.prepare("CASE-2026-4410", 1, { format: "bio-case-document/5", project: w.pr.publishedCase({ id: CASE }).project, roles: [{ target: FIND_C, version_sha: pinC }] });
  w.signCase("CASE-2026-4410", 1, { project: w.pr.publishedCase({ id: CASE }).project, roster: [{ bundle_id: FIND_C, version_sha: pinC }] });
  w.prepare("CASE-2026-4420", 1, { format: "bio-case-document/5", project: w.pr.publishedCase({ id: CASE }).project, roles: [{ target: FIND_C, version_sha: pinC }] });

  const now = expand(w.read("publishedmanifest"));
  assert.deepEqual(understated(now, "publishedmanifest"), [], "the complete edition: every ratified member's pair, no awaited member's");
  assert.deepEqual([now.cases.map((c) => `${c.case_id}@${c.edition}`), now.caseMembers.length, now.published.length],
                   [[`${CASE}@1`, "CASE-2026-4410@1"], 3, 2], "the fixture the sweep ran over is not empty");
  const pairOf = (id) => (now.published.find((p) => p.bundle_id === id && p.edition === 1) || {}).strength;
  assert.deepEqual([grades(pairOf(FIND_A)), grades(pairOf(FIND_B))], [PAIR_A, PAIR_B], "each member's index pair is its own");
  assert.deepEqual(w.read("publishedcase", { id: CASE }).findings.map((f) => JSON.stringify(f.strength)),
                   [FIND_A, FIND_B].map((id) => JSON.stringify(pairOf(id))),
                   "the index and the case page state the same pair for each finding");
  /* every roster row joins its published row by the pin */
  for (const m of now.caseMembers.filter((x) => x.case_id === CASE))
    assert.ok(now.published.some((p) => p.bundle_id === m.bundle_id && p.bundle_sha === m.version_sha), m.bundle_id);
  const complete = now.cases.find((c) => c.case_id === CASE);
  assert.deepEqual([complete.manifest.format, complete.manifest.findings.map((f) => f.bundle_id),
                    complete.manifest.findings.every((f) => Array.isArray(f.strength)), /^[0-9a-f]{64}$/.test(complete.manifest_sha)],
                   ["bio-case-container/6", [FIND_A, FIND_B], true, true], "the complete edition carries its container manifest");
  assert.equal("strength" in complete.manifest, false);
  /* the signed-but-unpublished case is stated with its roster awaiting; the unsigned one is nowhere */
  assert.deepEqual(now.cases.filter((c) => c.case_id !== CASE)
                     .map((c) => [c.case_id, now.caseMembers.filter((m) => m.case_id === c.case_id).map((m) => m.bundle_id), !!c.manifest_sha]),
                   [["CASE-2026-4410", [FIND_C], false]]);
  assert.equal(now.caseMembers.some((m) => m.case_id === "CASE-2026-4420"), false);
  assert.deepEqual(now.cases.filter((c) => !now.caseMembers.some((m) => m.case_id === c.case_id && Number(m.edition) === Number(c.edition))), [],
                   "every case edition on the index has a roster");
  for (const c of now.cases) assert.equal("strength" in c, false, "no case row carries a pair");
  /* the answer states the rule it keeps */
  assert.match(now.altitudes, /frozen strength pair belongs to a FINDING/);
  assert.match(now.altitudes, /DECLARED AND NOT YET RATIFIED/);
  assert.match(now.production, /`version_sha` TO `bundle_sha`, NEVER EDITION TO\s+EDITION/);
});

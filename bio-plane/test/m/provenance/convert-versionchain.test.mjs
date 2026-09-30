/* provenance: the version chain (R17, R18), converted from the legacy suite `test/versionchain.test.mjs` (D-220,
   D-221). Carried here: each version's register facts and sightings; a near-miss address as its own chain; the gate
   withholding part of a chain; the predecessor over many links with date order told apart from id and write order;
   the refusals' catalogue rows. Not carried: the suite's pin of D-221's search-ranking defect (retrieval's ranked
   route, not this module's) and its source-regex proof of op=versionchain's address normalisation (the control
   plane's). Every expectation below is computed from what the test wrote, never read back out of the chain. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, provDoc } from "./fixture.mjs";
import { VERSION_CHAIN_CHECKS } from "../../../src/provenance/checks.mjs";

const T0 = "2026-09-27T00:00:00Z";
/* Chain position i is first held i days after 2026-01-01 (whole-second UTC, R48). */
const day = (i) => new Date(Date.UTC(2026, 0, 1 + i, 9)).toISOString().replace(/\.\d{3}Z$/, "Z");

/** Promote one information bundle holding one capture, registered with the stated path, encoding and size. */
function holdVersion(w, bundleId, { text, path, encoding = "utf8" }) {
  const c = { path, text, sha: sha(text) };
  const bytes = Buffer.byteLength(text);
  const r = w.promoteInfo(bundleId, { captures: [c], pkg: { register: [{ sha256: c.sha, path, encoding, bytes }] } });
  assert.equal(r.ok, true, `fixture promote ${bundleId}: ${JSON.stringify(r).slice(0, 300)}`);
  return { bundleId, sha: c.sha, path, encoding, bytes };
}

/** A member row, as membership's roster holds one (the gate reads `members` and `project_participants`). */
function member(w, id) {
  w.st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?,?,?,?, 'active', ?, ?, ?)`,
    id, `cover ${id}`, id, "member", JSON.stringify(["contribute", "create_projects"]), T0, T0);
}

/** A project owned by `owner` (hidden from members it has not invited), registering one capture. */
function projectHolding(w, owner, c) {
  const md = ["---", "object_type: project", 'title: "Budget working group"', "current_state: forming", "prior_state: null",
    `created: "${T0}"`, `last_updated: "${T0}"`, "group: test-group", 'objective: "Hold the budget version in use."',
    "---", "", "## Summary", "", "A project.", ""].join("\n");
  const r = w.promotion.promote({ base: null, snapKey: "project-1", author: V(owner), ownerMemberId: owner, meta: {},
    files: [{ path: "bundle.md", text: md }, { path: c.path, text: c.text },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(c)] }) }],
    register: [{ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) }] });
  assert.equal(r.ok, true, `fixture project: ${JSON.stringify(r).slice(0, 300)}`);
  return r.bundleId;
}

const refusalOf = (key, extra = {}) => ({ ok: false, reason: key, check: VERSION_CHAIN_CHECKS[key].check,
                                          translation: VERSION_CHAIN_CHECKS[key].translation, ...extra });

test("R17: every version carries its register row's bundle, path, encoding, bytes and registered, and its sightings across vias", () => {
  const w = world();
  const A = "e.org/agenda.pdf";
  const held = [
    holdVersion(w, "INFO-2026-0001-a", { text: "agenda revision 0\n", path: "documents/agenda.pdf", encoding: "binary" }),
    holdVersion(w, "INFO-2026-0002-b", { text: "agenda revision one, longer\n", path: "snapshots/agenda-1.txt" }),
    holdVersion(w, "INFO-2026-0003-c", { text: "agenda revision two, the longest of the three\n", path: "documents/agenda-2.pdf",
                                         encoding: "binary" }),
  ];
  /* Sightings: version 0 once direct; version 1 direct twice and once through an archive replay; version 2 through
     three routes. */
  const receipts = [
    [0, "direct", day(0)],
    [1, "direct", day(1)], [1, "direct", day(4)], [1, "archive.org", day(6)],
    [2, "direct", day(2)], [2, "archive.org", day(3)], [2, "doorbell", day(7)],
  ];
  for (const [i, via, at] of receipts)
    w.prov.recordReceipt({ address: `https://${A}`, addressNorm: A, captureSha: held[i].sha, retrieved: at, via });
  const reg = new Map(w.rows(`SELECT capture_sha, registered FROM register`).map((r) => [r.capture_sha, r.registered]));
  const want = held.map((h, i) => {
    const mine = receipts.filter(([k]) => k === i);
    const vias = [...new Set(mine.map(([, v]) => v))].sort();
    return {
      capture_sha: h.sha, bundle_id: h.bundleId,
      first_retrieved: mine.map(([, , t]) => t).sort()[0], last_retrieved: mine.map(([, , t]) => t).sort().at(-1),
      observations: mine.length, sightings: vias.length, via: vias,
      address: `https://${A}`, path: h.path, encoding: h.encoding, bytes: h.bytes, registered: reg.get(h.sha),
    };
  });
  assert.ok(want.every((v) => typeof v.registered === "string" && v.registered), "every version's register row was read");
  const c = w.prov.versionChain({ addressNorm: A, viewer: V("x") });
  assert.deepEqual(c.versions, want);
  assert.deepEqual([c.count, c.total, c.documents, c.truncated], [3, 3, 1, false]);
  assert.deepEqual(want.map((v) => v.sightings), [1, 2, 3], "a sighting is one route, however often it was seen");
});

test("R17, R18: an address one query parameter away is its own document with its own chain, and neither borrows the other's versions", () => {
  const w = world();
  const A = "e.org/city-council/agenda.pdf", NEAR = "e.org/city-council/agenda.pdf?session=2";
  assert.ok(NEAR.startsWith(A) && NEAR !== A, "the two addresses are a near miss");
  const main = [0, 1, 2, 3].map((i) => holdVersion(w, `INFO-2026-00${10 + i}-agenda`, { text: `agenda ${i}\n`, path: "documents/agenda.pdf" }));
  const near = [0, 1, 2].map((i) => holdVersion(w, `INFO-2026-00${20 + i}-decoy`, { text: `other document ${i}\n`, path: "documents/agenda.pdf" }));
  /* Interleaved in time, so a chain that joined the two addresses would interleave them. */
  main.forEach((v, i) => w.prov.recordReceipt({ addressNorm: A, captureSha: v.sha, retrieved: day(2 * i) }));
  near.forEach((v, i) => w.prov.recordReceipt({ addressNorm: NEAR, captureSha: v.sha, retrieved: day(2 * i + 1) }));
  const a = w.prov.versionChain({ addressNorm: A, viewer: V("x") });
  const n = w.prov.versionChain({ addressNorm: NEAR, viewer: V("x") });
  assert.deepEqual([a.address_norm, a.total, a.documents], [A, 4, 1]);
  assert.deepEqual([n.address_norm, n.total, n.documents], [NEAR, 3, 1]);
  assert.deepEqual(a.versions.map((v) => v.capture_sha), main.map((v) => v.sha));
  assert.deepEqual(n.versions.map((v) => v.capture_sha), near.map((v) => v.sha));
  /* Every link of each chain stays inside its own document. */
  for (const [addr, chain] of [[A, main], [NEAR, near]])
    for (let i = 0; i < chain.length; i++) {
      const r = w.prov.versionChain({ addressNorm: addr, at: chain[i].sha, viewer: V("x") });
      assert.deepEqual([r.at_index, r.predecessor?.capture_sha ?? null], [i, i ? chain[i - 1].sha : null], `${addr} link ${i}`);
    }
  /* A version of one address anchored at the other is no version there. */
  for (const [addr, at] of [[A, near[2].sha], [NEAR, main[0].sha]])
    assert.deepEqual({ ...w.prov.versionChain({ addressNorm: addr, at, viewer: V("x") }), detail: null },
                     refusalOf("VERSION_CHAIN_NO_SUCH_VERSION", { detail: null }), `${addr} anchored at the other's version`);
});

test("R17, R18: a version held inside a project is withheld whole from the uninvited member, total and anchor included, and seen by the owner", () => {
  const w = world();
  member(w, "carol"); member(w, "dave");
  const B = "e.org/budget.pdf";
  const open = holdVersion(w, "INFO-2026-0095-budget", { text: "the budget, first version\n", path: "documents/budget.pdf" });
  const hiddenCap = { path: "documents/budget.pdf", text: "the budget, second version, in a project\n" };
  hiddenCap.sha = sha(hiddenCap.text);
  const projectId = projectHolding(w, "carol", hiddenCap);
  w.prov.recordReceipt({ addressNorm: B, captureSha: open.sha, retrieved: day(4) });
  w.prov.recordReceipt({ addressNorm: B, captureSha: hiddenCap.sha, retrieved: day(150) });

  const mine = w.prov.versionChain({ addressNorm: B, viewer: V("carol") });
  assert.deepEqual(mine.versions.map((v) => [v.capture_sha, v.bundle_id]), [[open.sha, open.bundleId], [hiddenCap.sha, projectId]],
                   "the owner sees both versions");
  assert.deepEqual([mine.total, mine.count, mine.documents], [2, 2, 1]);

  const theirs = w.prov.versionChain({ addressNorm: B, viewer: V("dave") });
  /* The whole answer, so nothing beside the rows (no count of the withheld) can say something was removed. */
  assert.deepEqual(theirs, { ok: true, address_norm: B, documents: 1, versions: [mine.versions[0]], count: 1, total: 1,
                             limit: mine.limit, offset: 0, truncated: false, at: null, at_index: null, predecessor: null });

  const anchoredHidden = w.prov.versionChain({ addressNorm: B, at: hiddenCap.sha, viewer: V("dave") });
  const anchoredUnheld = w.prov.versionChain({ addressNorm: B, at: sha("never held"), viewer: V("dave") });
  assert.deepEqual({ ...anchoredHidden, detail: null }, refusalOf("VERSION_CHAIN_NO_SUCH_VERSION", { detail: null }));
  assert.deepEqual([anchoredHidden.reason, anchoredHidden.check, anchoredHidden.translation],
                   [anchoredUnheld.reason, anchoredUnheld.check, anchoredUnheld.translation], "hidden answers as unheld");

  const ownerAt = w.prov.versionChain({ addressNorm: B, at: hiddenCap.sha, viewer: V("carol") });
  assert.deepEqual([ownerAt.at?.capture_sha, ownerAt.at_index, ownerAt.predecessor?.capture_sha], [hiddenCap.sha, 1, open.sha]);
});

test("R17, R18: over sixty versions, the order is first-held date (not bundle-id or write order) and every link names its immediate predecessor", () => {
  const w = world();
  const A = "e.org/city-council/agenda.pdf";
  const N = 60;
  /* The bundle id suffix is a permutation of 0..59 (step 37, coprime to 60), so id order is not date order. */
  const CHAIN = Array.from({ length: N }, (_, i) => ({ i, bundleId: `INFO-2026-09${String((i * 37) % N).padStart(2, "0")}-agenda`,
                                                      text: `agenda revision ${i} as published ${day(i)}\n`, first: day(i) }));
  assert.equal(new Set(CHAIN.map((v) => sha(v.text))).size, N);
  const byId = [...CHAIN].sort((a, b) => (a.bundleId < b.bundleId ? -1 : 1));
  assert.notDeepEqual(byId.map((v) => v.i), CHAIN.map((v) => v.i), "id order differs from date order");
  /* Written newest first, so write order is not date order either. */
  for (const v of [...CHAIN].reverse()) {
    v.sha = holdVersion(w, v.bundleId, { text: v.text, path: "documents/agenda.pdf" }).sha;
    w.prov.recordReceipt({ addressNorm: A, captureSha: v.sha, retrieved: v.first });
  }
  const full = w.prov.versionChain({ addressNorm: A, limit: 1000, viewer: V("x") });
  assert.deepEqual([full.total, full.count, full.documents, full.truncated], [N, N, 1, false]);
  assert.deepEqual(full.versions.map((v) => [v.capture_sha, v.bundle_id, v.first_retrieved]),
                   CHAIN.map((v) => [v.sha, v.bundleId, v.first]));
  /* Every link, not a sample. */
  for (const v of CHAIN) {
    const r = w.prov.versionChain({ addressNorm: A, at: v.sha, limit: 1, viewer: V("x") });
    const p = v.i ? CHAIN[v.i - 1] : null;
    assert.equal(r.ok, true);
    assert.equal(r.at.capture_sha, v.sha);
    assert.equal(r.at_index, v.i, `version ${v.i}'s position`);
    assert.deepEqual(r.predecessor && [r.predecessor.capture_sha, r.predecessor.bundle_id, r.predecessor.first_retrieved],
                     p && [p.sha, p.bundleId, p.first], `version ${v.i}'s predecessor`);
  }
  /* A chain of one is a chain: its one version at index 0, no predecessor. */
  const solo = holdVersion(w, "INFO-2026-0990-charter", { text: "the charter\n", path: "documents/charter.pdf" });
  w.prov.recordReceipt({ addressNorm: "e.org/charter.pdf", captureSha: solo.sha, retrieved: day(40) });
  const one = w.prov.versionChain({ addressNorm: "e.org/charter.pdf", at: solo.sha, viewer: V("x") });
  assert.deepEqual([one.ok, one.count, one.total, one.documents, one.truncated, one.at_index, one.predecessor],
                   [true, 1, 1, 1, false, 0, null]);
});

test("R18: every refusal carries its catalogue row's check and translation exactly, and a version held at another address refuses as unheld", () => {
  assert.deepEqual(Object.keys(VERSION_CHAIN_CHECKS).sort(),
                   ["VERSION_CHAIN_BAD_ANCHOR", "VERSION_CHAIN_NO_ADDRESS", "VERSION_CHAIN_NO_SUCH_VERSION"]);
  const w = world();
  const v = holdVersion(w, "INFO-2026-0001-a", { text: "v\n", path: "documents/a.pdf" });
  const other = holdVersion(w, "INFO-2026-0002-b", { text: "other\n", path: "documents/b.pdf" });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: v.sha, retrieved: day(1) });
  w.prov.recordReceipt({ addressNorm: "e.org/b", captureSha: other.sha, retrieved: day(1) });
  const cases = [
    ["VERSION_CHAIN_NO_ADDRESS", { viewer: V("x") }],
    ["VERSION_CHAIN_NO_ADDRESS", { addressNorm: "   ", viewer: V("x") }],
    ["VERSION_CHAIN_NO_ADDRESS", { addressNorm: null, at: v.sha, viewer: V("x") }],
    ["VERSION_CHAIN_BAD_ANCHOR", { addressNorm: "e.org/a", at: "not-a-sha", viewer: V("x") }],
    ["VERSION_CHAIN_BAD_ANCHOR", { addressNorm: "e.org/a", at: v.sha.slice(1), viewer: V("x") }],
    ["VERSION_CHAIN_BAD_ANCHOR", { addressNorm: "e.org/a", at: "g".repeat(64), viewer: V("x") }],
    ["VERSION_CHAIN_NO_SUCH_VERSION", { addressNorm: "e.org/a", at: "0".repeat(64), viewer: V("x") }],
    ["VERSION_CHAIN_NO_SUCH_VERSION", { addressNorm: "e.org/a", at: other.sha, viewer: V("x") }],
    ["VERSION_CHAIN_NO_SUCH_VERSION", { addressNorm: "e.org/a", at: v.sha, viewer: "stranger" }],
  ];
  for (const [key, args] of cases) {
    const r = w.prov.versionChain(args);
    assert.equal(typeof r.detail, "string", `${key} names a detail`);
    assert.ok(r.detail.length > 0);
    assert.deepEqual({ ...r, detail: null }, refusalOf(key, { detail: null }), `${key} for ${JSON.stringify(args)}`);
  }
});

/* connections: the conversion of connections' share of two old suites to module tests at this module's interface.
   `test/d241-derivation-stated.test.mjs` (R2's pair and document bounds at the default and at the ceiling, R3's
   listener payload that `observation-log` records, R5/R51's statement relayed by `op=connections` with an entity, never
   derived from the read's own page) and `test/connection-derive-sweep.test.mjs` (R17/R18: a resolve only marks,
   nothing is derived before the sweep, the sweep drains a bounded batch and answers what is left). What the statement
   SAYS (never derived, cut, LOOKED_ABSENT, pre-log, `derivationDocumentsFrom`) is observation-log's; the alarm that
   arms and self-terminates is the scheduler's; `op=stats`' `connectionDirty` and the routes are the control plane's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";

const info = (i, tag) => `INFO-2026-${String(i).padStart(4, "0")}-${tag}`;

/* `n` documents, each resolving to `entityId` at `grade` (as entities writes a resolution). */
function docsOn(w, entityId, n, start, tag, grade = "B") {
  const caps = [];
  for (let i = 0; i < n; i++) {
    const id = info(start + i, tag);
    const [c] = w.doc(id, [`${tag} document ${i}`]);
    w.resolve(c, id, `legislation:${start + i}`, entityId, grade);
    caps.push(c);
  }
  return caps;
}

/* A reference as extraction's reader writes it, with its kind, key and label (entities' recogniser reads them). */
function reads(w, cap, bundleId, refs) {
  for (const r of refs)
    w.st.sql.exec(`INSERT INTO reading_refs (capture_sha, bundle_id, ref, ref_kind, ref_key, label, occurrence, seq)
                   VALUES (?, ?, ?, ?, ?, ?, '', 0)`, cap, bundleId, r.ref, r.kind, r.key, r.label);
}

const dirty = (w) => w.rows(`SELECT entity_id FROM connection_dirty ORDER BY entity_id`).map((r) => r.entity_id);

test("R2, R3 (converts d241-derivation-stated F2, A2, A5, A6, A7): a cut, a whole and an empty derivation, the ceiling and a later cut, each told to the listener as written; a later derivation never removes the rows an earlier one wrote", () => {
  const w = world();
  const BIG = "ENT-2026-0001", SMALL = "ENT-2026-0002", LONE = "ENT-2026-0003";
  w.entity(BIG, "Harbor Dredging Allocation"); w.entity(SMALL, "A Three Document Subject"); w.entity(LONE, "A Single Document Subject");
  docsOn(w, BIG, 40, 1, "big");
  docsOn(w, SMALL, 3, 41, "small");
  docsOn(w, LONE, 1, 44, "lone");
  const heard = [];
  assert.equal(w.k.onDerived("observation-log", (e) => heard.push(e)).ok, true);
  const shape = (r) => [r.ok, r.documents, r.document_limit, r.count, r.limit, r.truncated];

  /* F2: the default pair bound 500 admits 32 of 40 documents (32*31/2 = 496); 3 documents derive whole; 1 forms none. */
  const cut = w.k.derive({ entityId: BIG, assertedBy: "system" });
  const whole = w.k.derive({ entityId: SMALL, assertedBy: "system" });
  const none = w.k.derive({ entityId: LONE, assertedBy: "system" });
  assert.deepEqual(shape(cut), [true, 32, 32, 496, 500, true]);
  assert.deepEqual(shape(whole), [true, 3, 32, 3, 500, false]);
  assert.deepEqual(shape(none), [true, 1, 32, 0, 500, false], "a derivation that ran over one document and formed nothing");
  assert.equal(cut.resolution_rows, 33, "the scan reads one document past the bound, which is how it knows it cut");
  /* R3: the listener is told what each derivation wrote — the cut, the whole and the empty one alike. */
  assert.deepEqual(heard, [
    { entityId: BIG, count: 496, documents: 32, truncated: true, entityKnown: true, assertedBy: "system" },
    { entityId: SMALL, count: 3, documents: 3, truncated: false, entityKnown: true, assertedBy: "system" },
    { entityId: LONE, count: 0, documents: 1, truncated: false, entityKnown: true, assertedBy: "system" },
  ]);

  /* A2's page: read at the ceiling, the page of a cut derivation is whole (496 of 496) — the page's bit is not the
     derivation's. */
  const page = w.k.read({ entityId: BIG, limit: 5000, viewer: V("x") });
  assert.deepEqual([page.count, page.limit, page.truncated], [496, 5000, false]);
  assert.deepEqual(w.k.read({ entityId: LONE, viewer: V("x") }).count, 0, "A5: an empty page beside a derivation that ran");

  /* A6: re-derived at the ceiling (5,000 pairs admit 100 documents), all 40 derive whole: 780 pairs. */
  const ceil = w.k.derive({ entityId: BIG, assertedBy: "system", limit: 5000 });
  assert.deepEqual(shape(ceil), [true, 40, 100, 780, 5000, false]);
  const all = w.k.read({ entityId: BIG, limit: 5000, viewer: V("x") });
  assert.deepEqual([all.count, all.truncated], [780, false]);
  /* A7: cut again at limit 3 (3 documents, 3 pairs), the listener is told the LATEST derivation, and the 780 rows the
     whole derivation wrote are still served. */
  const again = w.k.derive({ entityId: BIG, assertedBy: "system", limit: 3 });
  assert.deepEqual(shape(again), [true, 3, 3, 3, 3, true]);
  assert.deepEqual(heard.slice(3), [
    { entityId: BIG, count: 780, documents: 40, truncated: false, entityKnown: true, assertedBy: "system" },
    { entityId: BIG, count: 3, documents: 3, truncated: true, entityKnown: true, assertedBy: "system" },
  ]);
  const after = w.k.read({ entityId: BIG, limit: 5000, viewer: V("x") });
  assert.deepEqual([after.count, after.truncated], [780, false]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM connections WHERE entity_id=?`, BIG).n, 780);
});

test("R5, R51 (converts d241-derivation-stated A1–A5, A8, A9): with an entity the read carries the provider's statement whole, one call per read, never taken from its own page; the provider is told whether a connection is held and when the entity entered; the capture arm carries none", () => {
  const w = world();
  const SMALL = "ENT-2026-0002", LONE = "ENT-2026-0003", NEVER = "ENT-2026-0004", GHOST = "ENT-d241-not-registered";
  w.clock.now = "2026-09-27T01:00:00.000Z"; w.entity(SMALL, "A Three Document Subject");
  w.clock.now = "2026-09-27T02:00:00.000Z"; w.entity(LONE, "A Single Document Subject");
  const caps = docsOn(w, SMALL, 3, 41, "small");
  docsOn(w, LONE, 1, 44, "lone");
  w.k.derive({ entityId: SMALL, assertedBy: "system" });
  w.k.derive({ entityId: LONE, assertedBy: "system" });
  /* Registered after the derivations, and never derived. */
  w.clock.now = "2026-09-27T03:30:00.000Z"; w.entity(NEVER, "A Subject Nobody Derived Over");

  /* The provider answers whatever its own log says; here a canned statement per entity, changeable between reads. */
  const canned = {
    [SMALL]: { recorded: true, derived: "derived", state: "PRESENT", cut: false, documents: 3, says: "not cut" },
    [LONE]: { recorded: true, derived: "derived", state: "LOOKED_ABSENT", cut: false, documents: 1, says: "none formed" },
    [NEVER]: { recorded: false, derived: "never_derived", state: null, cut: null, documents: null, says: "never derived" },
    [GHOST]: { recorded: false, derived: "undetermined", state: null, cut: null, documents: null, says: "undetermined" },
  };
  const calls = [];
  assert.equal(w.k.registerDerivationProvider("observation-log", (id, o) => { calls.push([id, o]); return canned[id]; }).ok, true);

  /* A3: a CUT page (limit 1 over 3 pairs) carries the provider's NOT-cut statement unchanged. */
  const cutPage = w.k.read({ entityId: SMALL, limit: 1, viewer: V("x") });
  assert.deepEqual([cutPage.count, cutPage.truncated], [1, true]);
  assert.deepEqual(cutPage.derivation, canned[SMALL]);
  /* A2's direction: a WHOLE page carries a CUT statement unchanged. */
  canned[SMALL] = { recorded: true, derived: "derived", state: "partial", cut: true, documents: 2, says: "CUT after 2" };
  const wholePage = w.k.read({ entityId: SMALL, limit: 5000, viewer: V("x") });
  assert.deepEqual([wholePage.count, wholePage.truncated], [3, false]);
  assert.deepEqual(wholePage.derivation, canned[SMALL]);
  /* A5, A1, A8: a derivation that formed nothing, a registered entity never derived, an id the registry does not hold. */
  const lone = w.k.read({ entityId: LONE, viewer: V("x") });
  const never = w.k.read({ entityId: NEVER, viewer: V("x") });
  const ghost = w.k.read({ entityId: GHOST, viewer: V("x") });
  for (const [r, id] of [[lone, LONE], [never, NEVER], [ghost, GHOST]]) {
    assert.equal(r.ok, true); assert.equal(r.count, 0); assert.equal(r.truncated, false);
    assert.deepEqual(r.derivation, canned[id], `${id}: the provider's answer, whole`);
  }
  /* A4: each entity's read answers its own statement — the provider is asked once per read, about that entity. */
  assert.equal(new Set([cutPage, wholePage, lone, never, ghost].map((r) => JSON.stringify(r.derivation))).size, 5);
  assert.deepEqual(calls, [
    [SMALL, { hasArtifact: true, enteredAt: "2026-09-27T01:00:00.000Z" }],
    [SMALL, { hasArtifact: true, enteredAt: "2026-09-27T01:00:00.000Z" }],
    [LONE, { hasArtifact: false, enteredAt: "2026-09-27T02:00:00.000Z" }],
    [NEVER, { hasArtifact: false, enteredAt: "2026-09-27T03:30:00.000Z" }],
    [GHOST, { hasArtifact: false, enteredAt: null }],
  ], "held connection or not (LONE ran and formed none), and the entity's own entry time, null for an unregistered id");

  /* A9: the capture arm spans subjects and carries no derivation key at all, asking the provider nothing. */
  const byCapture = w.k.read({ captureSha: caps[0], viewer: V("x") });
  assert.equal(byCapture.ok, true); assert.equal(byCapture.count, 2);
  assert.equal("derivation" in byCapture, false);
  assert.equal(calls.length, 5);
});

test("R17, R18 (converts connection-derive-sweep part 1): resolves only mark — nothing is derived before the sweep; the sweep derives the marked entities as the system and clears them; an empty sweep is a no-op; a raised grade re-marks and the sweep re-derives in place", () => {
  const w = world();
  const ord = w.entities.createEntity({ kind: "ordinance", label: "Rent Adjustment Ordinance",
                                        note: "The city's rent adjustment ordinance, registered as the subject both filings cite.",
                                        aliases: ["ordinance:13579"], declaredBy: "member:alice" }).entity_id;
  const con = w.entities.createEntity({ kind: "contract", label: "Recology Waste Contract",
                                        note: "The city's waste hauling contract, registered as the subject the third filing cites.",
                                        aliases: ["contract:C-2024-88"], declaredBy: "member:alice" }).entity_id;
  const [A, B, C] = ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"];
  const [shaA] = w.doc(A, ["r5-doc-A"]);
  const [shaB] = w.doc(B, ["r5-doc-B"]);
  const [shaC] = w.doc(C, ["r5-doc-C"]);
  reads(w, shaA, A, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" },
                     { ref: "contract:C-2024-88", kind: "contract", key: "C-2024-88", label: "Recology Contract" }]);
  reads(w, shaB, B, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance 13579" }]);
  reads(w, shaC, C, [{ ref: "ordinance:99999", kind: "ordinance", key: "99999", label: "Rent Adjustment Ordinance" }]);

  assert.deepEqual(dirty(w), [], "nothing marked before any resolve");
  assert.equal(w.k.wake(1000), null, "and nothing to wake for");
  for (const s of [shaA, shaB, shaC]) assert.equal(w.entities.resolve({ captureSha: s, resolvedBy: "member:alice" }).ok, true);
  assert.deepEqual(w.rows(`SELECT capture_sha, entity_id, grade FROM resolutions ORDER BY capture_sha, entity_id`),
    [{ capture_sha: shaA, entity_id: ord, grade: "A" }, { capture_sha: shaA, entity_id: con, grade: "A" },
     { capture_sha: shaB, entity_id: ord, grade: "A" }, { capture_sha: shaC, entity_id: ord, grade: "C" }]
      .sort((x, y) => (x.capture_sha + x.entity_id < y.capture_sha + y.entity_id ? -1 : 1)), "fixture armed: the resolutions the sweep derives from");

  /* R17: the resolves only mark — no connection is derived before the sweep. */
  assert.equal(w.count("connections"), 0);
  assert.equal(w.k.read({ entityId: ord, viewer: V("x") }).count, 0);
  assert.deepEqual(dirty(w), [ord, con].sort(), "four resolutions over two distinct entities are two marks");
  assert.equal(w.k.wake(1000), 61000, "marked: now plus the default delay");

  /* R18: the sweep derives both, as the system, clears both, and answers what it did. */
  const s = w.k.sweep();
  assert.equal(s.entities, 2); assert.equal(s.remaining, 0);
  assert.deepEqual([...s.swept].sort((x, y) => (x.entity_id < y.entity_id ? -1 : 1)),
    [{ entity_id: ord, connections: 3 }, { entity_id: con, connections: 0 }].sort((x, y) => (x.entity_id < y.entity_id ? -1 : 1)));
  const byOrd = w.k.read({ entityId: ord, viewer: V("x") });
  assert.equal(byOrd.count, 3, "the three pairs among the ordinance's documents, with no derive call");
  assert.deepEqual([...new Set(byOrd.connections.map((c) => c.asserted_by))], ["system"]);
  assert.equal(w.k.read({ entityId: con, viewer: V("x") }).count, 0, "a one-document subject yields no connection");
  const key = (x, y) => [x, y].sort().join("|");
  const pairOf = (r) => Object.fromEntries(r.connections.map((c) => [key(c.a_capture_sha, c.b_capture_sha), c]));
  const ac = pairOf(byOrd)[key(shaA, shaC)];
  assert.deepEqual([ac.grade, ac.established], ["C", false], "the weaker end's C, never established");
  assert.deepEqual([pairOf(byOrd)[key(shaA, shaB)].grade, pairOf(byOrd)[key(shaA, shaB)].established], ["A", true]);
  assert.deepEqual(dirty(w), []);
  assert.equal(w.k.wake(1000), null, "caught up: nothing to wake for");

  /* An empty sweep derives nothing, and the rows are unchanged. */
  const before = w.snapshot(["connections"]);
  assert.deepEqual(w.k.sweep(), { entities: 0, remaining: 0, swept: [] });
  assert.deepEqual(w.snapshot(["connections"]), before);

  /* A raised grade re-marks its entity; the sweep re-derives in place. */
  assert.equal(w.entities.addAlias({ entityId: ord, alias: "ordinance:99999", declaredBy: "member:alice" }).ok, true);
  const raised = w.entities.resolve({ captureSha: shaC, resolvedBy: "member:alice" });
  assert.deepEqual([raised.resolved[0].grade, raised.resolved[0].raised], ["A", true]);
  assert.deepEqual(dirty(w), [ord], "the raise marks exactly its entity");
  assert.equal(w.count("connections"), 3, "and derives nothing by itself");
  assert.equal(pairOf(w.k.read({ entityId: ord, viewer: V("x") }))[key(shaA, shaC)].grade, "C");
  assert.deepEqual(w.k.sweep(), { entities: 1, remaining: 0, swept: [{ entity_id: ord, connections: 3 }] });
  const re = w.k.read({ entityId: ord, viewer: V("x") });
  assert.equal(re.count, 3); assert.equal(w.count("connections"), 3, "upserted in place, no duplicate row");
  assert.deepEqual([pairOf(re)[key(shaA, shaC)].grade, pairOf(re)[key(shaA, shaC)].established], ["A", true]);
  assert.equal(w.k.wake(1000), null);
});

test("R18 (converts connection-derive-sweep part 2): with the batch bound to 1, three marked entities drain one per sweep, remaining counted down and wake set until caught up, each entity derived", () => {
  const w = world({ env: { CONNECTION_DERIVE_BATCH: "1" } });
  const ids = [1, 2, 3].map((i) => w.entities.createEntity({ kind: "ordinance", label: `Ordinance ${i}`,
                                                             note: `Ordinance ${i}, registered as a subject the bounded sweep derives.`,
                                                             aliases: [`ordinance:${i}00`], declaredBy: "member:alice" }).entity_id);
  const refs = [1, 2, 3].map((i) => ({ ref: `ordinance:${i}00`, kind: "ordinance", key: `${i}00`, label: `Ordinance ${i}` }));
  for (const id of ["INFO-2026-0001-p", "INFO-2026-0002-q"]) {
    const [c] = w.doc(id, [`r5-bounded-${id}`]);
    reads(w, c, id, refs);
    w.entities.resolve({ captureSha: c, resolvedBy: "member:alice" });
  }
  assert.deepEqual(dirty(w), [...ids].sort(), "three entities marked, one row each");
  assert.equal(w.count("connections"), 0);
  const seen = [];
  for (const left of [2, 1, 0]) {
    const s = w.k.sweep();
    assert.equal(s.entities, 1, "one entity per sweep, never a full-store pass");
    assert.equal(s.remaining, left);
    assert.equal(s.swept.length, 1); assert.equal(s.swept[0].connections, 1);
    seen.push(s.swept[0].entity_id);
    assert.equal(w.k.wake(1000), left ? 61000 : null, left ? "more remain: wake again" : "caught up: nothing to wake for");
  }
  assert.deepEqual([...seen].sort(), [...ids].sort(), "each entity swept exactly once");
  for (const id of ids) {
    const r = w.k.read({ entityId: id, viewer: V("x") });
    assert.equal(r.count, 1); assert.equal(r.connections[0].asserted_by, "system");
  }
});

test("R18: an entity is cleared only after its derivation — a derivation that fails leaves it marked for the next sweep", () => {
  const w = world();
  const E = "ENT-2026-0001";
  w.entity(E);
  docsOn(w, E, 2, 1, "crash");
  let fail = true;
  w.k.onDerived("observation-log", () => { if (fail) throw new Error("crash after the write"); });
  w.k.markDirty(E);
  assert.throws(() => w.k.sweep(), /crash after the write/);
  assert.deepEqual(dirty(w), [E], "still marked: re-derived, never skipped");
  fail = false;
  assert.deepEqual(w.k.sweep(), { entities: 1, remaining: 0, swept: [{ entity_id: E, connections: 1 }] });
  assert.deepEqual(dirty(w), []);
});

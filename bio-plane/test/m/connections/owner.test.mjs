/* connections: the connection owner (R62–R65: co-mention as "mentioned together", read through `connection-grammar`'s
   registry and battery), the theme id grammar from `ID_TABLE` (R66) and the tables declared explicitly (R67). Read with
   BOB's question J1 (T33): an undated kind is undetermined at every date; entity hubs are named in `hubs`; one item per
   (document pair, entity); a capped derivation is recorded in `connection_derivations`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, MACHINE } from "./fixture.mjs";
import { defaultRegistry, ownerConformance, derivedId, BOUNDS, createRegistry } from "../../../src/connection-grammar/index.mjs";
import { idPattern } from "../../../src/record-grammar/index.mjs";
import { MENTIONED_KIND, MENTIONED_KINDS, MENTIONED_OWNER, MENTIONED_REGISTRATION, CO_MENTION_HUB, WARN_BAND, PAIR_RULE,
         CONNECTIONS_TABLES, THEME_ID_RE, THEME_REF_RE, themeLegFindings, mentionedMethod, registeredNeighbours }
  from "../../../src/connections/index.mjs";

const E = "ENT-2026-0001", F = "ENT-2026-0002";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c", H = "INFO-2026-0050-h";

/* Three documents through E (A at grade A, B at B, C at C), plus a fourth, H, hidden from every member (a project no
   one joined); A and B are also both mentioned with F. */
function star(w) {
  w.member("alice"); w.member("bob");
  w.entity(E, "The Ordinance"); w.entity(F, "The Contract");
  const [a] = w.doc(A, ["alpha"]), [b] = w.doc(B, ["beta"]), [c] = w.doc(C, ["gamma"]), [h] = w.doc(H, ["hidden"]);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, H);
  w.resolve(a, A, "Ord. 13,579", E, "A"); w.resolve(b, B, "Ordinance 13579", E, "B");
  w.resolve(c, C, "the ordinance", E, "C"); w.resolve(h, H, "Ord. 13,579", E, "A");
  w.resolve(a, A, "Contract C-88", F, "B"); w.resolve(b, B, "C-88", F, "B");
  w.read(a, A, "Ord. 13,579", [2]);
  w.k.derive({ entityId: E }); w.k.derive({ entityId: F });
  return { a, b, c, h };
}
const ask = (w, args) => w.k.neighbours({ kinds: [MENTIONED_KIND], at: "2026-10-01", scope: null, ...args });
const ids = (r) => r.items.map((i) => i.id).sort();

test("R62: registered once at load through connection-grammar.registerOwner, owner connections, the derived kind mentioned_together, its members' word and its neighbours read", () => {
  assert.deepEqual(MENTIONED_REGISTRATION, { ok: true, owner: "connections" });
  const held = defaultRegistry.owners().find((o) => o.owner === MENTIONED_OWNER);
  assert.deepEqual(held, { owner: "connections", kinds: [{ kind: "mentioned_together", word: "mentioned together", class: "derived" }] });
  assert.deepEqual(defaultRegistry.kindOf(MENTIONED_KIND), { owner: "connections", word: "mentioned together", class: "derived" });
  assert.equal(defaultRegistry.registerOwner({ owner: "connections", kinds: [...MENTIONED_KINDS], neighbours: registeredNeighbours }).refused,
               "OWNER_DUPLICATE", "once");
  /* Through the registry: the read reaches this module by the caller's host (R19 passes it through), conforming. */
  const w = world();
  star(w);
  const r = defaultRegistry.neighbours({ owner: "connections", node: A, kinds: [MENTIONED_KIND], at: "2026-10-01",
                                         viewer: V("alice"), scope: null, host: w.host });
  assert.equal(r.refused, undefined, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r, ask(w, { node: A, viewer: V("alice") }));
  /* Several records open in this isolate and no host named: whose connections cannot be said. */
  world();
  assert.equal(registeredNeighbours({ node: A, viewer: V("alice") }).refused, "OWNER_HOST_AMBIGUOUS");
  assert.equal(registeredNeighbours({ node: A, viewer: V("alice"), host: {} }).refused, "OWNER_NOT_READY");
});

test("R62: its owner-conformance battery (connection-grammar R9) runs over this module's own fixture; only the dated-in check, inapplicable to an undated kind, fails", () => {
  const w = world();
  star(w);
  const hub = hubWorld(w, "INFO-2026-0900-z", BOUNDS.hub + 1);
  const all = ask(w, { node: A, viewer: MACHINE });
  const throughE = (o) => all.items.find((i) => (i.from === o || i.to === o) && i.derived.inputs[0].entity === E).id;
  const fixture = {
    node: A, at: "2026-10-01", kinds: [MENTIONED_KIND],
    in: throughE(B), out: "no co-mention is out at any date", undetermined: throughE(B),
    viewers: { sees: MACHINE, blind: V("bob") }, fenced: throughE(H), expected: ids(all),
    hub: { node: hub, at: "2026-10-01" },
  };
  assert.equal(all.items.length, 4, "B and C through E, H through E (fenced), B through F");
  const r = ownerConformance({ owner: "connections", kinds: MENTIONED_KINDS.map((x) => ({ ...x })),
                               neighbours: (a) => w.k.neighbours(a), fixture });
  assert.deepEqual(r.failures, [{ check: "at", why: `${fixture.in} (in at the date) is not returned unmarked` }],
                   "every other check passes: shape, kinds, sight, paging, derivedId, determinism, hub");
  for (const i of all.items) assert.equal(i.undetermined.why.includes("states no dates"), true, "marked undetermined, never out");
});

test("R63: each item is one derived connection in connection-grammar's shape: from/to the two bundle ids, the weaker grade and each end's, derived {method, inputs}, a deterministic derivedId, the two determining references as evidence", () => {
  const w = world();
  const { a, b } = star(w);
  const reg = createRegistry();
  reg.registerOwner({ owner: "connections", kinds: MENTIONED_KINDS.map((x) => ({ ...x })), neighbours: (x) => w.k.neighbours(x) });
  const r = ask(w, { node: A, viewer: V("alice") });
  assert.equal(r.items.length, 3, "B through E, C through E, B through F; H hidden");
  const row = w.row(`SELECT * FROM connections WHERE entity_id=? AND a_bundle_id IN (?,?) AND b_bundle_id IN (?,?)`, E, A, B, A, B);
  const it = r.items.find((i) => i.derived.inputs[0].entity === E && [i.from, i.to].includes(B));
  assert.deepEqual([it.from, it.to], [A, B], "sorted bundle ids");
  assert.equal(it.kind, "mentioned_together"); assert.equal(it.owner, "connections");
  assert.deepEqual(it.grade, { assertion: "B", ends: ["A", "B"] });
  const method = `${PAIR_RULE} through ${E}`;
  assert.equal(mentionedMethod(PAIR_RULE, E), method);
  assert.deepEqual(it.derived, { method, as_of: row.at, inputs: [{ entity: E }, { end: A, capture: a, ref: "Ord. 13,579" },
                                                                  { end: B, capture: b, ref: "Ordinance 13579" }] });
  assert.equal(it.id, derivedId({ kind: MENTIONED_KIND, from: A, to: B, as_of: row.at, method }));
  assert.deepEqual(it.evidence.map((e) => [e.source, e.capture, e.ref]), [[A, a, "Ord. 13,579"], [B, b, "Ordinance 13579"]]);
  assert.equal(it.evidence[0].position.ref, "page 3", "where the reference was read, when recorded");
  assert.equal(it.evidence[1].position, null);
  assert.deepEqual(it.valid, { from: null, to: null, precision: "day", zone: "UTC" }, "co-mention states no dates");
  assert.match(it.undetermined.why, /undetermined, never out/);
  for (const i of r.items) assert.deepEqual(reg.checkConnection(i), { ok: true });
  /* Through either end, the same connection is the same id; two identical reads are identical. */
  const fromB = ask(w, { node: B, viewer: V("alice") });
  assert.ok(fromB.items.some((i) => i.id === it.id));
  assert.deepEqual(ask(w, { node: A, viewer: V("alice") }), r);
  /* The two entities between A and B are two items with two ids. */
  assert.equal(new Set(r.items.filter((i) => [i.from, i.to].includes(B)).map((i) => i.id)).size, 2);
  /* Through the registry, every item conforms (R19 refuses a non-conforming answer whole). */
  assert.deepEqual(reg.neighbours({ owner: "connections", node: A, kinds: [MENTIONED_KIND], at: "1999-01-01", viewer: V("alice"), scope: null }), r);
});

test("R63: sight — a hidden document is neither an item nor counted; a hidden node answers as one not held; the kinds asked narrow; scope and date change nothing; an absent viewer is refused", () => {
  const w = world();
  star(w);
  const bob = ask(w, { node: A, viewer: V("bob") });
  const machine = ask(w, { node: A, viewer: MACHINE });
  assert.equal(machine.items.length, 4); assert.equal(bob.items.length, 3);
  assert.ok(!JSON.stringify(bob).includes(H), "nothing of the hidden document");
  assert.deepEqual(ask(w, { node: H, viewer: V("bob") }), { items: [] });
  assert.deepEqual(ask(w, { node: "INFO-2026-0999-none", viewer: V("bob") }), { items: [] });
  assert.equal(ask(w, { node: H, viewer: MACHINE }).items.length, 3, "A, B and C through E");
  assert.deepEqual(ask(w, { node: A, viewer: V("bob"), kinds: ["took_part"] }), { items: [] });
  assert.deepEqual(ask(w, { node: A, viewer: V("bob"), kinds: undefined }), bob, "no kinds asked is every kind");
  assert.deepEqual(ask(w, { node: A, viewer: V("bob"), scope: "INQ-2026-0001-x", at: "1900-01-01" }), bob);
  for (const viewer of [undefined, null, ""])
    assert.equal(ask(w, { node: A, viewer }).refused, "VIEWER_MISSING");
  assert.deepEqual(ask(w, { node: A, viewer: "nobody-known" }), { items: [] }, "an unrecognised viewer sees nothing (fail closed)");
});

test("R63: it reads and never derives; a node whose entity was never derived answers what is held; two captures of one document are not a connection between documents", () => {
  const w = world();
  w.member("alice");
  w.entity(E);
  const [a1, a2] = w.doc(A, ["v1", "v2"]);
  const [b] = w.doc(B, ["beta"]);
  w.resolve(a1, A, "r", E, "A"); w.resolve(a2, A, "r", E, "A"); w.resolve(b, B, "r", E, "B");
  const before = w.snapshot();
  assert.deepEqual(ask(w, { node: A, viewer: V("alice") }), { items: [] }, "nothing derived yet");
  assert.deepEqual(w.snapshot(), before, "the read wrote nothing");
  w.k.derive({ entityId: E });
  assert.equal(w.count("connections"), 3, "A1–A2, A1–B, A2–B");
  const r = ask(w, { node: A, viewer: V("alice") });
  assert.equal(r.items.length, 1, "one item per document pair and entity: the A–A pair is not one, A1–B and A2–B are one");
  assert.deepEqual([r.items[0].from, r.items[0].to], [A, B]);
});

test("R64: a capped derivation answers so — every item through an entity last derived at R2's bound carries truncated, and the answer truncated with the bound named; a later whole derivation clears it", () => {
  const w = world();
  w.member("alice");
  w.entity(E);
  const docs = [A, B, C, "INFO-2026-0004-d"];
  for (const [i, id] of docs.entries()) { const [c] = w.doc(id, [`t${i}`]); w.resolve(c, id, "r", E, "B"); }
  const cut = w.k.derive({ entityId: E, limit: 1 });
  assert.equal(cut.truncated, true);
  assert.equal(w.count("connection_derivations"), 1);
  const caps = w.rows(`SELECT a_bundle_id, b_bundle_id FROM connections`)[0];
  const node = caps.a_bundle_id;
  const r = ask(w, { node, viewer: V("alice") });
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].truncated, true);
  assert.equal(r.truncated, true);
  assert.deepEqual(r.bounds.map(({ why, ...x }) => x), [{ entity: E, documents: 2, document_limit: 2, resolution_rows: 3, pair_limit: 1 }]);
  assert.match(r.bounds[0].why, /stopped at its bound.*not the whole/);
  w.k.derive({ entityId: E });
  const whole = ask(w, { node, viewer: V("alice") });
  assert.equal(whole.items.length, 3);
  assert.equal(whole.truncated, undefined); assert.equal(whole.bounds, undefined);
  assert.ok(whole.items.every((i) => i.truncated === undefined));
});

/* A star: `node`, a held document, mentioned together with `n` other documents, through entities of at most 32
   documents each (no entity hub), its resolutions written as entities' writer would and derived by R1. The other ends
   are captures only a machine viewer reads (a member's sight asks for their bundles). */
function hubWorld(w, node, n, prefix = "ENT-2026-7") {
  const per = CO_MENTION_HUB - 1;
  const [own] = w.doc(node, [`${node} text`]);
  for (let e = 0; e * per < n; e++) {
    const ent = `${prefix}${String(e).padStart(3, "0")}`;
    w.resolve(own, node, "r", ent, "B");
    for (let i = e * per; i < Math.min(n, (e + 1) * per); i++)
      w.resolve(sha(`${node}-other-${i}`), `INFO-2026-${String(1000 + i)}-${node.slice(-1)}x`, "r", ent, "B");
    w.k.derive({ entityId: ent });
  }
  return node;
}

test("R65: an entity concerned by more than 32 documents is a hub — its co-mentions are not items, the answer names it {entity, set_size, why} with no partial list; counted over the documents the viewer may see", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  const G = "ENT-2026-0033";
  w.entity(G); w.entity(E);
  const docs = Array.from({ length: CO_MENTION_HUB + 1 }, (_, i) => `INFO-2026-${String(100 + i).padStart(4, "0")}-g`);
  for (const [i, id] of docs.entries()) { const [c] = w.doc(id, [`g${i}`]); w.resolve(c, id, "r", G, "B"); }
  /* One of the 33 is hidden from members; docs[0] and docs[1] also share E. */
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, docs[32]);
  w.resolve(w.rows(`SELECT capture_sha FROM resolutions WHERE bundle_id=?`, docs[0])[0].capture_sha, docs[0], "e", E, "A");
  w.resolve(w.rows(`SELECT capture_sha FROM resolutions WHERE bundle_id=?`, docs[1])[0].capture_sha, docs[1], "e", E, "A");
  w.k.derive({ entityId: G, limit: 5000 }); w.k.derive({ entityId: E });
  const m = ask(w, { node: docs[0], viewer: MACHINE });
  assert.deepEqual(m.hubs.map(({ why, ...h }) => h), [{ entity: G, set_size: 33 }]);
  assert.match(m.hubs[0].why, /more than 32.*step around/);
  assert.deepEqual(m.items.map((i) => i.derived.inputs[0].entity), [E], "only the co-mention through E is an item");
  assert.equal(m.hub, undefined, "`hub` keeps connection-grammar's meaning: the node's own set over 1,000");
  /* For a member the hidden document is not counted: 32 is no hub, and its co-mentions are answered. */
  const a = ask(w, { node: docs[0], viewer: V("alice") });
  assert.equal(a.hubs, undefined);
  assert.equal(a.items.filter((i) => i.derived.inputs[0].entity === G).length, 31);
  assert.ok(!JSON.stringify(a).includes(docs[32]));
});

test("R65: a node whose own set exceeds connection-grammar's BOUNDS.hub is answered by its size with no items; a set in the warn band (250 to 1,000) is answered whole, its size stated", () => {
  const w = world();
  const big = hubWorld(w, "INFO-2026-0900-z", BOUNDS.hub + 1);
  const r = ask(w, { node: big, viewer: MACHINE });
  assert.deepEqual(r.items, []);
  assert.equal(r.hub.set_size, BOUNDS.hub + 1);
  assert.match(r.hub.why, /named, never expanded/);
  const reg = createRegistry();
  reg.registerOwner({ owner: "connections", kinds: MENTIONED_KINDS.map((x) => ({ ...x })), neighbours: (x) => w.k.neighbours(x) });
  assert.deepEqual(reg.neighbours({ owner: "connections", node: big, kinds: [MENTIONED_KIND], at: "2026-10-01", viewer: MACHINE, scope: null }), r,
                   "conforming: connection-grammar R19 passes it whole");
  const warn = hubWorld(w, "INFO-2026-0901-y", WARN_BAND, "ENT-2026-8");
  const ww = ask(w, { node: warn, viewer: MACHINE });
  assert.equal(ww.items.length, WARN_BAND); assert.equal(ww.set_size, WARN_BAND);
  assert.match(ww.says, /answered whole/);
  assert.equal(ww.next, undefined);
  const under = hubWorld(w, "INFO-2026-0902-v", WARN_BAND - 1, "ENT-2026-9");
  assert.equal(ask(w, { node: under, viewer: MACHINE }).set_size, undefined);
});

test("R66: THEME_ID_RE and THEME_REF_RE are built from record-grammar's idPattern(\"THEME\"): a counter of five or more digits is accepted wherever one of four is, today's slug and membership-address rules kept", () => {
  const core = idPattern("THEME");
  for (const counter of ["0927", "09271", "1234567"]) {
    const id = `THEME-2026-${counter}-ab12cd`;
    assert.ok(core.test(`THEME-2026-${counter}`));
    assert.ok(THEME_ID_RE.test(id), id);
    for (const s of [id, `${id}#INFO-2026-0001-a`, `${id}/x`, `${id}:x`, `${id}?x`]) assert.ok(THEME_REF_RE.test(s), s);
    assert.ok(!THEME_ID_RE.test(`${id}#x`));
    const findings = [];
    assert.equal(themeLegFindings("basis[0]", { target: id }, findings), true);
    assert.equal(findings[0].code, "THEME_NOT_EVIDENCE");
  }
  for (const s of ["THEME-2026-092-ab", "THEME-26-0927-ab", "THEME-2026-0927", "THEME-2026-0927-AB", "THEME-2026-0927-ab!", "INFO-2026-0001-a"]) {
    assert.ok(!THEME_ID_RE.test(s), s); assert.ok(!THEME_REF_RE.test(s), s);
    assert.equal(themeLegFindings("basis[0]", { target: s }, []), false, s);
  }
});

test("R67: every table declared explicitly through record-core.declareTable, every table derive stored; connections, connection_pair_choices, refs and theme_placements with their bundles' sight, themes and connection_dirty group-wide; R36's purge kept", () => {
  const w = world();
  const mine = w.record.declaredTables().filter((d) => d.module === "connections");
  assert.deepEqual(mine.map((d) => d.name), CONNECTIONS_TABLES.map((t) => t.name));
  const sight = Object.fromEntries(mine.map((d) => [d.name, d.sight]));
  for (const t of ["connections", "connection_pair_choices", "refs", "theme_placements"]) assert.equal(sight[t], "bundle", t);
  for (const t of ["themes", "connection_dirty", "connection_derivations"]) assert.equal(sight[t], "group", t);
  for (const d of mine) {
    assert.equal(d.derive, "stored", d.name);
    assert.deepEqual([d.purge, d.expunge, d.export, d.version_chain], ["clear", "none", "admin-only", false], d.name);
  }
  for (const t of ["theme_placement_acts", "asserted_connections", "asserted_connection_judgements", "file_membership_pending"])
    assert.equal(sight[t], "bundle", `${t}: the default form's sight for a table keyed to a bundle`);
  /* R36: connection_derivations, like the dirty set, is cleared whole-store only. */
  w.entity(E);
  const [a] = w.doc(A, ["a"]), [b] = w.doc(B, ["b"]);
  w.resolve(a, A, "r", E, "A"); w.resolve(b, B, "r", E, "A");
  w.k.derive({ entityId: E });
  w.record.purge({ bundleId: A });
  assert.equal(w.count("connections"), 0);
  assert.equal(w.count("connection_derivations"), 1);
  w.record.purge({});
  assert.equal(w.count("connection_derivations"), 0);
});

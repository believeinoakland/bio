/* people's read of who recorded what from a passage at its interface: R36 (T36-17; N715, DEC-164 (4)), in events R49's
   one shape. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, doc, ANN, OUT, BOSS, MACHINE } from "./fixture.mjs";
import { RECORDED_BY_DEFAULT, RECORDED_BY_MAX } from "../../../src/people/index.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "UTC" };
const PAGE0 = { kind: "pdf-page", page: 0 };
const ITEM_KEYS = ["at", "by", "extent", "field", "kind", "module", "record", "relation", "withdrawn"];
/* retrieval R73's match: a recording act takes its capture and extent as the citation */
const found = (c, extent = PAGE0) => ({ kind: "person", words: "Rita Moreno, Port Warden", capture_sha: c.captureSha, extent, origin: "search" });
const at = (c, extent) => ({ captureSha: c.captureSha, extent });
const census = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map((t) => [t.name, w.one(`SELECT COUNT(*) AS n FROM "${t.name}"`).n]));

test("R36 recordedBy answers events R49's shape over person facts citing an extent of the capture (kind person_fact, field citation) and identity claims whose evidence cites one (kind identity_claim, field evidence), each naming who recorded it as stamped (a member, or class:<cls> for the machine) and this module's instant, a fact recorded from a found extent named with its member", () => {
  const w = world();
  const p = w.person("Rita Moreno"), q = w.person("Rita Moreno");
  const c = w.capture("roster"), other = w.capture("other");
  const viaFind = w.p.recordPersonFact({ person: p, kind: "locality", value: "Port Ellery", valid, citation: found(c), by: ANN });
  const byMachine = w.p.recordPersonFact({ person: p, kind: "name", value: "R. Moreno", valid, citation: doc(c), by: MACHINE });
  const contact = w.p.recordPersonFact({ person: p, kind: "address", value: "4 Quay St", valid, citation: doc(c), by: ANN });
  const elsewhere = w.p.recordPersonFact({ person: p, kind: "birth", value: "1960-01-01", valid, citation: doc(other), by: ANN });
  const claim = w.p.claimIdentity({ a: p, b: q, kind: "unsure", basis: "name", evidence: { a: doc(c, "2020-01-01"), b: doc(other, "2021-01-01") },
                                    note: "the same name on two rosters", by: OUT });
  assert.equal(claim.ok, true);
  const r = w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN });
  assert.deepEqual(Object.keys(r).sort(), ["capture_sha", "items", "module", "ok", "truncated"]);
  assert.deepEqual([r.ok, r.module, r.capture_sha, r.truncated], [true, "people", c.captureSha, false]);
  for (const x of r.items) assert.deepEqual(Object.keys(x).sort(), ITEM_KEYS);
  const by = Object.fromEntries(r.items.map((x) => [`${x.record}:${x.field}`, x]));
  assert.deepEqual(Object.keys(by).sort(), [`${viaFind.fact_id}:citation`, `${byMachine.fact_id}:citation`, `${contact.fact_id}:citation`,
                                           `${claim.claim_id}:evidence`].sort(), "the other capture's fact is not an item; the claim's one end citing it is");
  const f = by[`${viaFind.fact_id}:citation`];
  assert.deepEqual([f.module, f.kind, f.field, f.by, f.relation, f.withdrawn], ["people", "person_fact", "citation", ANN, null, false],
                   "a fact recorded from a found extent is named with its member");
  assert.equal(f.at, viaFind.at, "this module's instant of the write");
  assert.deepEqual(f.extent, JSON.parse(canonicalExtent(PAGE0)), "the extent in content's canonical form");
  assert.equal(by[`${byMachine.fact_id}:citation`].by, MACHINE, "the machine named as one (DEC-52)");
  const cl = by[`${claim.claim_id}:evidence`];
  assert.deepEqual([cl.kind, cl.field, cl.by, cl.withdrawn], ["identity_claim", "evidence", OUT, false]);
  /* an address or contact fact is an item only as R10 admits, and carries no value */
  assert.ok(!JSON.stringify(r).includes("4 Quay St"), "no item carries a value");
  assert.deepEqual(w.p.recordedBy({ captureSha: other.captureSha, viewer: ANN }).items.map((x) => x.record).sort(),
                   [elsewhere.fact_id, claim.claim_id].sort());
  /* both ends of one claim citing the one capture: one item per cited extent */
  const page1 = { kind: "pdf-page", page: 1 };
  const twoEnds = w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "testimony", evidence: { a: at(c, PAGE0), b: at(c, { kind: "document" }) },
                                      note: "both on the roster", by: ANN });
  assert.equal(twoEnds.ok, true);
  const ends = w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN }).items.filter((x) => x.record === twoEnds.claim_id);
  assert.deepEqual(ends.map((x) => x.extent.kind).sort(), ["document", "pdf-page"]);
  assert.ok(!ends.some((x) => x.extent.page === page1.page));
});

test("R36 withdrawn is true for a fact withdrawn (R11) or a claim withdrawn (R4), the row still answered; an expunged row (R12) is never an item", () => {
  const w = world();
  const p = w.person("Lea Ng"), q = w.person("Lea Ng");
  const c = w.capture("c");
  const f = w.p.recordPersonFact({ person: p, kind: "birth", value: "1970-01-01", valid, citation: doc(c), by: ANN });
  const k = w.p.recordPersonFact({ person: p, kind: "contact", value: "+1 555 0101", valid, citation: doc(c), by: ANN });
  const gone = w.p.recordPersonFact({ person: p, kind: "locality", value: "Marlow", valid, citation: doc(c), by: ANN });
  const claim = w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "name", evidence: { a: doc(c, "2020-01-01"), b: doc(c, "2021-01-01") }, note: "n", by: ANN });
  w.p.withdrawPersonFact({ factId: f.fact_id, reason: "misread", by: ANN });
  w.p.withdrawPersonFact({ factId: k.fact_id, reason: "misread", by: ANN });
  w.p.withdrawIdentityClaim({ claimId: claim.claim_id, reason: "different people", by: ANN });
  assert.equal(w.p.expunge({ id: gone.fact_id, ground: "unlawful", reason: "held unlawfully", by: BOSS }).ok, true);
  const items = w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN }).items;
  const of = (id) => items.filter((x) => x.record === id);
  assert.deepEqual(of(f.fact_id).map((x) => x.withdrawn), [true]);
  assert.deepEqual(of(k.fact_id).map((x) => x.withdrawn), [true]);
  assert.deepEqual(of(claim.claim_id).map((x) => x.withdrawn), [true, true], "the claim's two cited ends, both withdrawn");
  assert.deepEqual(of(gone.fact_id), [], "an expunged row is never an item");
  assert.ok(!JSON.stringify(items).includes(gone.fact_id));
  const live = w.p.recordPersonFact({ person: p, kind: "name", value: "Lea Ng", valid, citation: doc(c), by: ANN });
  assert.equal(w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN }).items.find((x) => x.record === live.fact_id).withdrawn, false);
});

test("R36 sight is R31's: a fact citing a capture the viewer may not see is neither answered nor counted, the capture answering items: [] as one not held; a claim made inside a project the viewer may not see is neither answered nor counted; an address or contact fact only as R10 admits", () => {
  const w = world();
  const p = w.person("Ray Sun"), q = w.person("Ray Sun");
  const open = w.capture("open"), fenced = w.capture("fenced", { fenced: true });
  const hid = w.p.recordPersonFact({ person: p, kind: "locality", value: "Hidden Town", valid, citation: found(fenced), by: ANN });
  const hidContact = w.p.recordPersonFact({ person: p, kind: "address", value: "1 Hidden Rd", valid, citation: doc(fenced), by: ANN });
  const seen = w.p.recordPersonFact({ person: p, kind: "locality", value: "Open Town", valid, citation: doc(open), by: ANN });
  const fencedClaim = w.p.claimIdentity({ a: p, b: q, kind: "same_as", basis: "name", evidence: { a: doc(open, "2020-01-01"), b: doc(open, "2021-01-01") },
                                          note: "n", project: w.project(), by: ANN });
  assert.equal(fencedClaim.ok, true);
  /* the participant sees both */
  assert.deepEqual(w.p.recordedBy({ captureSha: fenced.captureSha, viewer: ANN }).items.map((x) => x.record).sort(), [hid.fact_id, hidContact.fact_id].sort());
  assert.ok(w.p.recordedBy({ captureSha: open.captureSha, viewer: ANN }).items.some((x) => x.record === fencedClaim.claim_id));
  /* the outsider: the fenced capture answers exactly as a capture not held */
  const hidden = w.p.recordedBy({ captureSha: fenced.captureSha, viewer: OUT });
  const absent = w.p.recordedBy({ captureSha: "f".repeat(64), viewer: OUT });
  assert.deepEqual(hidden, { ok: true, module: "people", capture_sha: fenced.captureSha, items: [], truncated: false });
  assert.deepEqual({ ...absent, capture_sha: null }, { ...hidden, capture_sha: null }, "a hidden capture answers as an absent one");
  /* the fenced claim on an open capture: neither answered nor counted (a limit of one is not truncated by it) */
  const outOpen = w.p.recordedBy({ captureSha: open.captureSha, viewer: OUT });
  assert.deepEqual(outOpen.items.map((x) => x.record), [seen.fact_id]);
  const one = w.p.recordedBy({ captureSha: open.captureSha, limit: 1, viewer: OUT });
  assert.deepEqual([one.items.length, one.truncated], [1, false], "the hidden claim is not counted");
  assert.ok(!JSON.stringify(outOpen).includes(fencedClaim.claim_id));
});

test("R36 never an item: the protected source link (R21: the read answers exactly as if none were held), a member's tie (R20) and an interest-check result (R23)", () => {
  const make = (extra) => {
    const w = world();
    const p = w.person("Quinn Roe");
    const c = w.capture("letter");
    const f = w.p.recordPersonFact({ person: p, kind: "name", value: "Quinn Roe", valid, citation: doc(c), by: ANN });
    if (extra) extra(w, p, c);
    return { w, c, f };
  };
  const plain = make(null);
  const held = make((w, p, c) => {
    w.S.add("SRC-2026-1234abcd");
    /* a link whose evidence names the very capture and extent, to a listed member */
    assert.equal(w.p.linkSourceToPerson({ source: "SRC-2026-1234abcd", person: p, evidence: `${c.captureSha} page 1`, sight: ["ann"], by: ANN }).ok, true);
    assert.equal(w.p.declareTie({ entity: p, kind: "relative", note: `see ${c.captureSha}`, attribution: "group", by: ANN }).ok, true);
    const office = w.entity("office", "Harbour Commissioner"), co = w.entity("institution", "Quay Ltd");
    const span = (from, to) => ({ from, to });
    w.line("holds", p, office, span("2010-01-01", "2015-12-31"));
    w.line("holds", p, co, span("2016-06-01", "2018-01-01"));
    w.line("oversees", office, co, span("2000-01-01", "2030-01-01"));
    w.p.evaluateChecks({ budgetMs: 10000 });
    assert.ok(w.one(`SELECT COUNT(*) AS n FROM interest_check_results`).n >= 1, "a check result is held");
  });
  const strip = (r) => r.items.map(({ record, at: _at, ...x }) => ({ ...x, record: record.slice(0, 8) }));
  for (const viewer of [ANN, OUT, BOSS, MACHINE]) {
    const a = plain.w.p.recordedBy({ captureSha: plain.c.captureSha, viewer });
    const b = held.w.p.recordedBy({ captureSha: held.c.captureSha, viewer });
    assert.deepEqual(strip(b), strip(a), String(viewer));
    assert.deepEqual(b.items.map((x) => x.kind), ["person_fact"]);
    assert.ok(!/SRC-|MTI-|CHK-|source|tie/i.test(JSON.stringify(b.items.map(({ extent, ...x }) => x))), String(viewer));
  }
});

test("R36 with extent, only rows whose extent stands same, narrower or wider to it (content.extentRelation(extent, row's extent)) are items, relation that answer; without it every row citing the capture, relation null; items in the order of their canonical extent, then record, then field", () => {
  const w = world();
  const p = w.person("Gil Ruiz");
  const c = w.capture("pages");
  const rec = (extent, value) => {
    const r = w.p.recordPersonFact({ person: p, kind: "locality", value, valid, citation: at(c, extent), by: ANN });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.fact_id;
  };
  const whole = rec({ kind: "document" }, "a");
  const page0 = rec(PAGE0, "b");
  const page0b = rec(PAGE0, "c");
  const all = w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN });
  assert.ok(all.items.every((x) => x.relation === null));
  const order = all.items.map((x) => [canonicalExtent(x.extent), x.record, x.field]);
  assert.deepEqual(order, [...order].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)));
  assert.deepEqual(all.items.map((x) => x.record), [whole, ...[page0, page0b].sort()],
                   "the canonical document form sorts before a page's; one extent's rows by record");
  const rel = (extent) => Object.fromEntries(w.p.recordedBy({ captureSha: c.captureSha, extent, viewer: ANN }).items.map((x) => [x.record, x.relation]));
  assert.deepEqual(rel(PAGE0), { [whole]: "wider", [page0]: "same", [page0b]: "same" });
  assert.deepEqual(rel({ kind: "pdf-page", page: 0, ref: "the first page" }), rel(PAGE0), "the asked extent is read canonically");
  assert.deepEqual(rel({ kind: "document" }), { [whole]: "same", [page0]: "narrower", [page0b]: "narrower" });
  assert.deepEqual(rel({ kind: "pdf-page", page: 3 }), { [whole]: "wider" }, "a disjoint row is not an item");
  assert.deepEqual(rel({ kind: "pdf-page" }), { [whole]: "wider" }, "a page naming no number is unreadable against a page, as content answers");
});

test("R36 limit is clamped to 1–500 (default 100), truncated by reading one past; refusals VIEWER_MISSING, NO_SHA and EXTENT_MALFORMED each write nothing, the first and last as {ok: false, refused, code, reason, why} with no catalogue row (K2116); it writes nothing and never throws", () => {
  const w = world();
  const p = w.person("Ivy Lane");
  const c = w.capture("many");
  for (let i = 0; i < 101; i++) w.p.recordPersonFact({ person: p, kind: "name", value: `Ivy ${i}`, valid, citation: doc(c), by: ANN });
  const read = (limit) => w.p.recordedBy({ captureSha: c.captureSha, limit, viewer: ANN });
  assert.deepEqual([read(undefined).items.length, read(undefined).truncated], [RECORDED_BY_DEFAULT, true]);
  assert.deepEqual([read(null).items.length, read("x").items.length], [100, 100]);
  assert.deepEqual([read(0).items.length, read(0).truncated], [1, true]);
  assert.deepEqual([read(-5).items.length, read(2.9).items.length], [1, 2]);
  assert.deepEqual([read(101).items.length, read(101).truncated], [101, false], "exactly all is whole");
  assert.deepEqual([read(100).items.length, read(100).truncated], [100, true], "one past is read");
  for (let i = 101; i < 501; i++) w.p.recordPersonFact({ person: p, kind: "name", value: `Ivy ${i}`, valid, citation: doc(c), by: ANN });
  assert.deepEqual([read(5000).items.length, read(5000).truncated], [RECORDED_BY_MAX, true]);
  const before = census(w);
  for (const viewer of [undefined, null, "", "  "]) {
    const r = w.p.recordedBy({ captureSha: c.captureSha, viewer });
    assert.deepEqual(Object.keys(r).sort(), ["code", "ok", "reason", "refused", "why"], "events R49's refusal shape (K2116)");
    assert.deepEqual([r.ok, r.refused, r.code, r.reason], [false, "VIEWER_MISSING", "VIEWER_MISSING", "VIEWER_MISSING"], String(viewer));
    assert.equal(typeof r.why, "string");
  }
  const m = w.p.recordedBy({ captureSha: c.captureSha, extent: 7, viewer: ANN });
  assert.deepEqual(Object.keys(m).sort(), ["code", "ok", "reason", "refused", "why"]);
  assert.deepEqual([m.refused, m.code], ["EXTENT_MALFORMED", "EXTENT_MALFORMED"]);
  assert.ok(!("check" in m) && !("translation" in m), "no catalogue row");
  assert.deepEqual(w.p.recordedBy({ captureSha: "not-hex", viewer: ANN }).items, [], "a sha that names no held capture answers items: []");
  for (const sha of [undefined, null, "", " "]) assert.equal(w.p.recordedBy({ captureSha: sha, viewer: ANN }).reason, "NO_SHA");
  for (const extent of ["page 1", 7, [], { kind: "paragraph" }, { page: 0 }])
    assert.equal(w.p.recordedBy({ captureSha: c.captureSha, extent, viewer: ANN }).reason, "EXTENT_MALFORMED", JSON.stringify(extent));
  assert.equal(w.p.recordedBy({ viewer: ANN }).reason, "NO_SHA");
  assert.equal(w.p.recordedBy().reason, "VIEWER_MISSING");
  assert.equal(w.p.recordedBy({ captureSha: c.captureSha, viewer: "nobody-at-all" }).items.length, 0, "a viewer membership denies sees nothing");
  assert.equal(census(w), before, "it writes nothing");
  /* never throws: a store it cannot read answers nothing */
  w.st.sql.exec(`ALTER TABLE person_facts RENAME TO person_facts_away`);
  assert.deepEqual(w.p.recordedBy({ captureSha: c.captureSha, viewer: ANN }), { ok: true, module: "people", capture_sha: c.captureSha, items: [], truncated: false });
  w.st.sql.exec(`ALTER TABLE person_facts_away RENAME TO person_facts`);
});

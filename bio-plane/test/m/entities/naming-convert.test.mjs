/* entities: its share of two legacy suites (`build/jobs/T17/legacy-tests.md`'s CONVERT rows), at the module's interface.
   `test/readingname.test.mjs`: R17 (a name never assembled from two strings, `matched_on`/`matched_alias`, the empty
   answer's caveat, the prediction equal to the minting, reference-source partials on the real corpus, the ordering
   across the partial tiers), R18 (the gate at the identifier tier, selectivity relative to the viewer) and R19 (the
   plan's shape). `test/meaningquery.test.mjs`: R35 with R14–R15, the read contract's rows agreeing with the module's
   own reads, which `query-language`'s `resolves:`/`concerns:` arms join. The old suites are kept (K619 (3)); each test
   names its requirement ids and the old suite. Extraction's share of readingname (the backfill, its R37) is its own. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, sha, MACHINE } from "./fixture.mjs";

/* The one real captured document the repository holds (`test/fixtures/legistar-agenda-1425405.pdf`), as the plane's
   own Tier-1 extraction and the `meeting_agenda` reader read it: its 41 references (kind, key, label), written once
   from that reading (ENTITIES #5, T18) so this module's tests need neither reader. */
const REAL = JSON.parse(readFileSync(new URL("./legistar-1425405-refs.json", import.meta.url), "utf8"));

test("R17 (readingname.test.mjs) a name is never assembled from two strings of one reference: every term of an alias must be in ref, key or label alone", () => {
  const { e, read } = world();
  read("INFO-1", sha("mix"), [{ ref: "estuary:26-0999", kind: "estuary", key: "26-0999", label: "Fremont Shoreline Improvements" }]);
  const split = e.createEntity({ kind: "institution", label: "Fremont Estuary" }).entity_id;
  assert.equal(e.namingDocuments({ entityId: split, viewer: MACHINE }).count, 0, "one word in the label, one in the reference");
  /* the corpus holds both words: a name made by either string alone is offered */
  const inLabel = e.createEntity({ kind: "institution", label: "Fremont Shoreline" }).entity_id;
  const inRef = e.createEntity({ kind: "institution", label: "Estuary 26 0999" }).entity_id;
  assert.deepEqual(e.namingDocuments({ entityId: inLabel, viewer: MACHINE }).documents.map((d) => [d.correspondence, d.matched_on]),
                   [["name_in_label", "label"]]);
  assert.deepEqual(e.namingDocuments({ entityId: inRef, viewer: MACHINE }).documents.map((d) => [d.correspondence, d.matched_on]),
                   [["name_in_reference", "ref"]]);
});

test("R17 (readingname.test.mjs) each candidate names the alias that matched, whether it is the canonical name, and which string carried it (ref, key, label); an alias is load-bearing", () => {
  const { e, read } = world();
  read("INFO-1", sha("abbr"), [
    { kind: "legislation", key: "26-0857", label: "OPD RSI Helicopter Maintenance Contract" },
    { ref: "contract:26-0955", kind: "contract", key: "26-0955", label: "Fifth Amendment To Lease Agreement" },
    { kind: "legislation", key: "26-0977", label: "Annual Report Of The Public Ethics Commission" },
    { kind: "legislation", key: "26-0912", label: "Coliseum Payment Allocation" },
  ]);
  const opd = e.createEntity({ kind: "body", label: "Oakland Police Department", aliases: ["OPD"] }).entity_id;
  const [d] = e.namingDocuments({ entityId: opd, viewer: MACHINE }).documents;
  assert.deepEqual([d.matched_alias, d.canonical_name, d.matched_on, d.correspondence], ["OPD", false, "label", "name_in_label"]);
  const col = e.createEntity({ kind: "contract", label: "Coliseum Payment Allocation" }).entity_id;
  const [c] = e.namingDocuments({ entityId: col, viewer: MACHINE }).documents;
  assert.deepEqual([c.matched_alias, c.canonical_name, c.matched_on, c.correspondence], ["Coliseum Payment Allocation", true, "label", "name"]);
  const lease = e.createEntity({ kind: "contract", label: "Broadway Parcel Lease", aliases: ["contract:26-0955"] }).entity_id;
  const [l] = e.namingDocuments({ entityId: lease, viewer: MACHINE }).documents;
  assert.deepEqual([l.matched_alias, l.canonical_name, l.matched_on, l.correspondence, l.label],
                   ["contract:26-0955", false, "ref", "reference", "Fifth Amendment To Lease Agreement"]);
  const ethics = e.createEntity({ kind: "institution", label: "Public Ethics Commission", aliases: ["26-0977"] }).entity_id;
  const eth = e.namingDocuments({ entityId: ethics, viewer: MACHINE });
  assert.deepEqual([eth.count, eth.documents[0].matched_on, eth.documents[0].correspondence], [1, "key", "reference_key"],
                   "three correspondences on one reference make one candidate, at the strongest");
  /* the same full name with no abbreviation reaches nothing until the abbreviation is registered */
  const bare = e.createEntity({ kind: "body", label: "Police Dept of Nowhere" }).entity_id;
  assert.equal(e.namingDocuments({ entityId: bare, viewer: MACHINE }).count, 0);
  e.addAlias({ entityId: bare, alias: "OPD" });
  assert.deepEqual(e.namingDocuments({ entityId: bare, viewer: MACHINE }).documents.map((x) => x.key), ["26-0857"]);
});

test("R17 (readingname.test.mjs) a subject nothing names answers ok with no candidates and says what the absence does not mean", () => {
  const { e, read } = world();
  read("INFO-1", sha("none"), [{ kind: "l", key: "1", label: "Coliseum Payment Allocation" }]);
  const nobody = e.createEntity({ kind: "person", label: "Nobody At All" }).entity_id;
  const r = e.namingDocuments({ entityId: nobody, viewer: MACHINE });
  assert.deepEqual([r.ok, r.count, r.documents, r.truncated], [true, 0, [], false]);
  assert.match(r.detail, /says nothing about whether it exists/);
  assert.match(r.detail, /CANDIDATES, not resolutions/);
});

test("R17 R9 (readingname.test.mjs) grade_if_resolved equals what resolve mints, for every candidate of every subject, the cascade that does not fall through included", () => {
  const { e, read } = world();
  read("INFO-1", sha("p1"), [
    { ref: "contract:26-0955", kind: "contract", key: "26-0955", label: "Fifth Amendment To Lease Agreement" },
    { kind: "legislation", key: "26-0977", label: "Annual Report Of The Public Ethics Commission" },
    { kind: "legislation", key: "26-0912", label: "Coliseum Payment Allocation" },
    { kind: "legislation", key: "26-0867", label: "Agreement Between City Of Oakland And Alameda County For" },
  ]);
  read("INFO-2", sha("p2"), [{ kind: "legislation", key: "26-0912", label: "coliseum payment allocation" }]);
  const ids = [
    e.createEntity({ kind: "contract", label: "Broadway Parcel Lease", aliases: ["contract:26-0955"] }),
    e.createEntity({ kind: "institution", label: "Public Ethics Commission", aliases: ["26-0977"] }),
    e.createEntity({ kind: "contract", label: "Coliseum Payment Allocation" }),
    e.createEntity({ kind: "institution", label: "Alameda County" }),
    /* its name is D_REF's whole label (a C), but another subject's identifier matches that reference at A first */
    e.createEntity({ kind: "contract", label: "Fifth Amendment To Lease Agreement" }),
  ].map((x) => x.entity_id);
  const predicted = new Map();
  for (const id of ids)
    for (const d of e.namingDocuments({ entityId: id, viewer: MACHINE }).documents)
      predicted.set(`${d.capture_sha}|${d.ref}|${id}`, d.grade_if_resolved);
  assert.deepEqual([...predicted.values()].sort(), ["A", "B", "C", "C", null, null].sort());
  e.resolve({ captureSha: sha("p1"), resolvedBy: MACHINE });
  e.resolve({ captureSha: sha("p2"), resolvedBy: MACHINE });
  const minted = new Map();
  for (const s of [sha("p1"), sha("p2")])
    for (const r of e.resolutionsFor({ captureSha: s, viewer: MACHINE }).resolutions)
      minted.set(`${s}|${r.ref}|${r.entity_id}`, r.grade);
  for (const [k, g] of predicted) assert.equal(minted.get(k) ?? null, g, k);
  for (const [k, g] of minted) assert.equal(predicted.get(k), g, `${k}: every minted grade was offered with that prediction`);
  const fifth = e.namingDocuments({ entityId: ids[4], viewer: MACHINE }).documents[0];
  assert.deepEqual([fifth.correspondence, fifth.grade_if_resolved], ["name", null]);
  assert.match(fifth.detail, /stronger identifier on this same reference resolves first/);
});

test("R17 (readingname.test.mjs) reference-source partials on the real corpus: an alias reaching every reference is withheld and reported with its arithmetic; the one-of-41 identifier is offered, ungraded, its selectivity computed", () => {
  const { e, read } = world();
  assert.deepEqual([REAL.length, [...new Set(REAL.map((r) => r.kind))]], [41, ["legislation"]], "the corpus is the real document's");
  read("INFO-1", sha("legistar-1425405"), REAL, { contentType: "meeting_agenda" });
  const vacuous = e.createEntity({ kind: "body", label: "Rules and Legislation Committee", aliases: ["Legislation"] }).entity_id;
  const vac = e.namingDocuments({ entityId: vacuous, viewer: MACHINE });
  assert.equal(vac.count, 0);
  assert.deepEqual(vac.names_uninformative, [{ alias: "Legislation", source: "ref", reaches: REAL.length, corpus: REAL.length }]);
  const good = e.createEntity({ kind: "contract", label: "File 26-0844", aliases: ["legislation 26-0844"] }).entity_id;
  const g = e.namingDocuments({ entityId: good, viewer: MACHINE });
  assert.deepEqual(g.documents.map((d) => [d.ref, d.correspondence, d.matched_on, d.matched_alias, d.grade_if_resolved]),
                   [["legislation:26-0844", "name_in_reference", "ref", "legislation 26-0844", null]]);
  assert.deepEqual(g.documents[0].selectivity,
                   { source: "ref", reaches: 1, corpus: REAL.length, value: Number((1 - 1 / REAL.length).toFixed(4)) });
  assert.deepEqual(g.names_uninformative, []);
});

test("R17 (readingname.test.mjs) across the partial tiers the more selective candidate is offered first, whichever string carried it; one reference reached by two names keeps the more selective; broad partials still follow", () => {
  const { e, read } = world();
  read("INFO-1", sha("o1"), [{ ref: "committee:rules-a", kind: "committee", key: "rules-a", label: "Zephyr Point Lease Renewal" }]);
  read("INFO-2", sha("o2"), [{ ref: "committee:rules-b", kind: "committee", key: "rules-b", label: "Quarterly Budget Transfer" }]);
  read("INFO-3", sha("o3"), [{ ref: "committee:rules-c", kind: "committee", key: "rules-c", label: "Annual Audit Acceptance" }]);
  read("INFO-4", sha("o4"), [{ kind: "legislation", key: "1", label: "Other Business" }, { kind: "legislation", key: "2", label: "Adjournment" }]);
  const ent = e.createEntity({ kind: "contract", label: "Zephyr Point", aliases: ["committee rules"] }).entity_id;
  const r = e.namingDocuments({ entityId: ent, viewer: MACHINE });
  const rows = r.documents.map((d) => [d.ref, d.correspondence, d.matched_alias, d.selectivity.reaches, d.selectivity.corpus]);
  assert.deepEqual(rows[0], ["committee:rules-a", "name_in_label", "Zephyr Point", 1, 5], "the label partial reaches 1 of 5");
  assert.deepEqual(rows.slice(1).map((x) => [x[1], x[3], x[4]]), [["name_in_reference", 3, 5], ["name_in_reference", 3, 5]]);
  assert.equal(rows.length, 3, "one candidate per (capture, reference)");
  const vals = r.documents.map((d) => d.selectivity.value);
  assert.deepEqual(vals, [...vals].sort((a, b) => b - a), "in descending selectivity");
});

test("R18 (readingname.test.mjs) the gate withholds the row at the identifier tier as at the name tier, and selectivity is over the viewer's own corpus: neither count crosses the gate", () => {
  const w = world();
  w.project("PROJ-2026-0001-s", "carol");
  w.read("PROJ-2026-0001-s", sha("secret"), [
    { ref: "contract:26-0955", kind: "contract", key: "26-0955s", label: "Ninth Amendment To Lease Agreement" },
    { kind: "legislation", key: "26-0871", label: "MOU Between The City of Oakland And The California Highway Patrol" },
  ]);
  w.read("INFO-1", sha("shared"), [
    { ref: "contract:26-0955", kind: "contract", key: "26-0955", label: "Fifth Amendment To Lease Agreement" },
    { kind: "legislation", key: "26-0867", label: "Operational Agreement Between City Of Oakland And Alameda County For" },
    { kind: "legislation", key: "26-0912", label: "Coliseum Payment Allocation" },
  ]);
  const lease = w.e.createEntity({ kind: "contract", label: "Broadway Parcel Lease", aliases: ["contract:26-0955"] }).entity_id;
  const inside = w.e.namingDocuments({ entityId: lease, viewer: "member:carol" });
  const outside = w.e.namingDocuments({ entityId: lease, viewer: "member:outsider" });
  assert.deepEqual(inside.documents.map((d) => d.correspondence), ["reference", "reference"]);
  assert.deepEqual([inside.count, outside.count], [2, 1]);
  assert.deepEqual(outside.documents.map((d) => [d.capture_sha, d.bundle_id]), [[sha("shared"), "INFO-1"]]);
  assert.ok(!JSON.stringify(outside).includes(sha("secret")) && !JSON.stringify(outside).includes("PROJ-2026-0001-s"));
  const city = w.e.createEntity({ kind: "institution", label: "City of Oakland" }).entity_id;
  const cIn = w.e.namingDocuments({ entityId: city, viewer: "member:carol" });
  const cOut = w.e.namingDocuments({ entityId: city, viewer: "member:outsider" });
  assert.deepEqual([cIn.count, cOut.count], [2, 1]);
  const rowIn = cIn.documents.find((d) => d.capture_sha === sha("shared"));
  const [rowOut] = cOut.documents;
  const about = ({ selectivity, detail, ...rest }) => rest;
  assert.deepEqual(about(rowOut), about(rowIn), "every field about the document is the same for both viewers");
  assert.deepEqual([rowOut.selectivity.source, rowOut.selectivity.reaches, rowOut.selectivity.corpus], ["label", 1, 3]);
  assert.deepEqual([rowIn.selectivity.source, rowIn.selectivity.reaches, rowIn.selectivity.corpus], ["label", 2, 5]);
});

test("R19 (readingname.test.mjs) the plan is of the joined statement R17 runs: the term index used, neither reading_refs nor reading_ref_terms scanned, grouped by capture, reference and source", () => {
  const { e } = world();
  const p = e.namingPlan(["oakland", "police"]);
  const plan = p.plan.join(" | ");
  assert.match(plan, /USING (COVERING )?INDEX reading_ref_terms_term/);
  assert.ok(/reading_refs/.test(plan) && /reading_ref_terms/.test(plan), plan);
  assert.ok(!/SCAN reading_ref_terms\b/.test(plan) && !/SCAN reading_refs\b/.test(plan), plan);
  assert.match(p.sql, /GROUP BY t\.capture_sha, t\.ref, t\.src/);
});

test("R35 R14 R15 (meaningquery.test.mjs) the read contract's rows are what resolutionsFor and concerns answer: a grade filter over resolutions and a subject's capture set over it agree with the module's reads", () => {
  const { e, read, rows } = world();
  const cascade = e.createEntity({ kind: "contract", label: "Cascade Waterworks Contract", aliases: ["vendor:77"] }).entity_id;
  const bureau = e.createEntity({ kind: "office", label: "Bureau of Sanitation" }).entity_id;
  const idle = e.createEntity({ kind: "office", label: "Unnamed Office" }).entity_id;
  read("INFO-2026-0900", sha("pl8"), [{ ref: "vendor:77", kind: "vendor", key: "77", label: "Cascade Waterworks" },
                                       { ref: "office:sanitation", kind: "office", key: "sanitation", label: "Bureau of Sanitation" }]);
  read("INFO-2026-0901", sha("pl9"), [{ kind: "office", key: "s2", label: "bureau of sanitation" }]);
  e.resolve({ captureSha: sha("pl8"), resolvedBy: MACHINE });
  e.resolve({ captureSha: sha("pl9"), resolvedBy: MACHINE });
  const held = rows(`SELECT capture_sha, bundle_id, ref, entity_id, grade FROM resolutions ORDER BY capture_sha, ref, entity_id`);
  assert.deepEqual(held.map((r) => [r.bundle_id, r.entity_id, r.grade]).sort(),
                   [["INFO-2026-0900", bureau, "C"], ["INFO-2026-0900", cascade, "A"], ["INFO-2026-0901", bureau, "C"]].sort());
  const read_ = [sha("pl8"), sha("pl9")].flatMap((s) => e.resolutionsFor({ captureSha: s, viewer: MACHINE }).resolutions
    .map((r) => ({ capture_sha: s, bundle_id: r.bundle_id, ref: r.ref, entity_id: r.entity_id, grade: r.grade })));
  const key = (r) => `${r.capture_sha}|${r.ref}|${r.entity_id}`;
  assert.deepEqual(read_.map((r) => JSON.stringify(r)).sort(), held.map((r) => JSON.stringify({ ...r })).sort());
  for (const g of ["A", "B", "C", "D"])
    assert.deepEqual(rows(`SELECT DISTINCT bundle_id FROM resolutions WHERE grade=? ORDER BY bundle_id`, g).map((r) => r.bundle_id),
                     [...new Set(read_.filter((r) => r.grade === g).map((r) => r.bundle_id))].sort(), `grade ${g}`);
  for (const id of [cascade, bureau, idle]) {
    const c = e.concerns({ entityId: id, viewer: MACHINE });
    assert.deepEqual(rows(`SELECT DISTINCT capture_sha FROM resolutions WHERE entity_id=? ORDER BY capture_sha`, id).map((r) => r.capture_sha),
                     c.documents.map((r) => r.capture_sha).sort(), id);
    assert.equal(c.count, c.documents.length);
  }
  assert.equal(new Set(held.map(key)).size, held.length, "keyed (capture, reference, entity)");
});

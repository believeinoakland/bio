/* provenance: this module's figure for `op=stats` and purge's proof (R55, record-core R63), driven through record-core's
   own services over the real modules; and what this module no longer registers there since N512: the route marks'
   audit finding (`route`) and figure (`routeMarks`) are `provenance-routes`' (its R6, R10). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V } from "./fixture.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";

test("R55: register, registered once through record-core's counts, keyed on bundle_id and taken through the caller's sight", () => {
  const w = world();
  const a = w.cap("a");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a] }).ok, true);
  assert.equal(w.promoteInfo("INFO-2026-0002-b", { captures: [w.cap("b")] }).ok, true);
  /* A revision re-registering the same capture is one row, not two: the figure counts rows. */
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  const whole = w.record.counts(null);
  assert.deepEqual([whole.register, w.count("register")], [2, 2]);
  /* A hidden bundle's rows are left out. */
  assert.equal(w.record.counts({ sql: "(SELECT ?)", args: ["INFO-2026-0001-a"] }).register, 1);
  /* membership's complement of its sight rule: a viewer it refuses sees no bundle, so counts none. */
  assert.equal(w.record.counts(hiddenBundles("stranger")).register, 0);
  /* A recognised member sees every bundle that is not a project's: the whole count. */
  assert.equal(w.record.counts(hiddenBundles(V("x"))).register, 2);
  /* A register row whose home is gone names no held bundle: no hidden set names it, so it is counted. */
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                sha("orphan"), "INFO-2026-0999-gone", "snapshots/o", "utf8", 1, "x");
  assert.equal(w.record.counts(hiddenBundles("stranger")).register, 1);
  assert.equal(w.record.counts({ sql: "(SELECT ?)", args: ["INFO-2026-0999-gone"] }).register, 2);
  /* Synchronous, writes nothing, and answers this module's one figure only (routeMarks is provenance-routes', N512). */
  const before = w.snapshot();
  const got = w.prov.counts(null);
  assert.equal(typeof got.then, "undefined");
  assert.deepEqual(got, { register: 3 });
  assert.deepEqual(w.prov.counts({ sql: "(SELECT ?)", args: ["INFO-2026-0001-a"] }), { register: 2 });
  assert.deepEqual(w.snapshot(), before);
  assert.equal(Object.hasOwn(w.record.counts(null), "routeMarks"), false, "no figure is registered for the route marks here");
  /* Registered once: a second registration is refused, naming provenance; routeMarks is free for its owner. */
  const twice = w.record.registerCounts("provenance", ["register"], () => ({}));
  assert.deepEqual([twice.ok, twice.reason], [false, "COUNTS_DECLARED"]);
  const taken = w.record.registerCounts("someone-else", ["register"], () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.heldBy], [false, "COUNTS_DECLARED", "provenance"]);
  assert.equal(w.record.registerCounts("provenance-routes", ["routeMarks"], () => ({ routeMarks: 0 })).ok, true);
});

test("R55, R41: the audit's `route` finding is not this module's: it registers none, so the route marker's owner can", async () => {
  const w = world();
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [w.cap("a")] }).ok, true);
  const pass = await w.record.auditPass({ after: "", limit: 10, visible: () => true });
  assert.equal(Object.hasOwn(pass, "route"), false, "no route finding rides on the audit from this module");
  const reg = w.record.registerAuditFinding("provenance-routes", "route", () => ({ tally: {} }));
  assert.equal(reg.ok, true, JSON.stringify(reg));
});

/* calculations: R41 (K5131): a visit on one's own testimony. The plane's `testify` stamps the testimony's author as the bare handle
   (`bob`), while `spotcheckvisit`'s `by` arrives as `member:bob`; the comparison names the one member however either side is spelled. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE } from "./fixture.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const FIELDS = [{ name: "site", type: "string" }];
const CSV = `site\n${Array.from({ length: 20 }, (_, i) => `bench-${i}`).join("\n")}\n`;

test("R41 a testimony stamped with the bare handle is its member's own: testify as bob, then the visit as bob (member:bob) is recorded, as alice it is refused NOT_YOUR_TESTIMONY, writing nothing", async () => {
  const w = seeded();
  const t = await w.table(CSV, FIELDS);
  const d = w.c.draw({ set: t.sha, n: 6, seed: "bare", question: "Is the bench usable?", by: V("bob") });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  let k = 0;
  const testify = (author) => {
    const r = w.prov.testify({ words: `I looked at the bench myself (${++k}).`, observedAt: "2026-10-01", title: `visit ${k}`, author });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    return r.capture_sha;
  };
  const mine = testify("bob");   /* the plane's stamp: the bare handle */
  const own = w.c.recordVisit({ draw: d.draw, item: d.sample[0], testimony: mine, finding: "yes", by: V("bob") });
  assert.equal(own.ok, true, JSON.stringify(own).slice(0, 300));
  const again = w.c.recordVisit({ draw: d.draw, item: d.sample[1], testimony: testify(V("bob")), finding: "yes", by: V("bob") });
  assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
  assert.equal(w.count("calc_visits"), 2);
  for (const by of [V("alice"), V("ben")]) {
    assert.equal(code(w.c.recordVisit({ draw: d.draw, item: d.sample[2], testimony: mine, finding: "yes", by })), "NOT_YOUR_TESTIMONY", by);
  }
  /* a bare handle against the other member's own spelling, the other way round */
  assert.equal(code(w.c.recordVisit({ draw: d.draw, item: d.sample[2], testimony: testify(V("alice")), finding: "yes", by: V("bob") })), "NOT_YOUR_TESTIMONY");
  assert.equal(w.count("calc_visits"), 2, "no refused visit was written");
  /* a machine identity matches nothing */
  assert.equal(code(w.c.recordVisit({ draw: d.draw, item: d.sample[2], testimony: mine, finding: "yes", by: MACHINE })), "MEMBER_ACT_ONLY");
});

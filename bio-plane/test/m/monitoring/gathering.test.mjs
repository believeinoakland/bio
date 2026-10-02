/* monitoring R27 and R42: the gathering grammar (C-18.5), at the write (registered with promotion) and in the audit
   (registered with record-core); every arm with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, infoMd } from "./fixture.mjs";
import { checkGatheringGrammar, GATHERING_CHECKS } from "../../../src/monitoring/index.mjs";

const REQ = { id: "GATH-2026-0001-minutes", target: { text: "the council minutes", description: "every meeting's minutes" },
              locators: ["https://records.example.org/minutes"], authority: "Town Clerk", criticality: "crucial",
              cadence: "weekly", status: "open", planted: "2026-09-01T00:00:00Z" };
const OK = { daemon: { enabled: true, tick_budget: 5, sweep_budget: 0 }, requests: [REQ] };
const findingsOf = (g) => { const f = []; checkGatheringGrammar({ files: new Map([["data/gathering.json", typeof g === "string" ? g : JSON.stringify(g)]]) }, f); return f; };
const gj = (g) => { const t = typeof g === "string" ? g : JSON.stringify(g); return { path: "data/gathering.json", text: t, bytes: Buffer.byteLength(t), sha256: sha(t) }; };

test("R42 C-18.5: every arm of checkGatheringGrammar finds its violation, and a well-formed queue finds none (the sweep arm, R66's registered one: seam.test.mjs)", () => {
  assert.deepEqual(findingsOf(OK), []);
  assert.deepEqual(findingsOf("{not json"), [], "unparsable JSON is C-14.3's to report");
  assert.deepEqual((() => { const f = []; checkGatheringGrammar({ files: new Map() }, f); return f; })(), [], "no file, not asked");
  const arms = [
    ["[]", /must be a JSON object/],
    [{ daemon: [] }, /daemon block must be an object/],
    [{ daemon: { enabled: "yes" } }, /daemon.enabled must be boolean/],
    [{ daemon: { enabled: true, tick_budget: -1 } }, /daemon.tick_budget must be a non-negative integer/],
    [{ daemon: { enabled: true, sweep_budget: 1.5 } }, /daemon.sweep_budget must be a non-negative integer/],
    [{ requests: [null] }, /requests\[0\] is not an object/],
    [{ requests: [{ ...REQ, id: "GATH-bad" }] }, /does not match the GATH grammar/],
    [{ requests: [{ ...REQ, target: undefined }] }, /missing target block/],
    [{ requests: [{ ...REQ, target: { text: "a\nb" } }] }, /target.text must be a nonempty single-line string/],
    [{ requests: [{ ...REQ, target: { text: "x".repeat(201) } }] }, /target.text must be a nonempty single-line string/],
    [{ requests: [{ ...REQ, target: { text: "t", description: "d".repeat(2001) } }] }, /target.description must be a string under 2000 chars/],
    [{ requests: [{ ...REQ, locators: [] }] }, /locators must be a nonempty array/],
    [{ requests: [{ ...REQ, locators: ["http://records.example.org/x"] }] }, /locators\[0\] .* is not an https public-host locator/],
    [{ requests: [{ ...REQ, locators: ["https://127.0.0.1/x"] }] }, /is not an https public-host locator/],
    [{ requests: [{ ...REQ, authority: " " }] }, /authority must be a nonempty string/],
    [{ requests: [{ ...REQ, criticality: "urgent" }] }, /criticality must be one of: crucial, supporting/],
    [{ requests: [{ ...REQ, cadence: "fortnightly" }] }, /cadence must be one of: hourly, daily, weekly, monthly, none/],
    [{ requests: [{ ...REQ, status: "done" }] }, /status must be one of: open, captured, retired/],
    [{ requests: [{ ...REQ, planted: "yesterday" }] }, /planted must be an ISO 8601 UTC instant/],
  ];
  for (const [g, re] of arms) {
    const f = findingsOf(g);
    assert.equal(f.length >= 1, true, String(re));
    assert.ok(f.every((x) => x.check === "C-18.5" && x.severity === "error"));
    assert.ok(f.some((x) => re.test(x.message)), `${re} in ${JSON.stringify(f)}`);
  }
});

test("R27 a non-replay promotion carrying a malformed gathering queue is refused GATHERING_REFUSED with its findings; a replay is exempt; a bundle without the file is not asked", () => {
  const w = world();
  const id = "INFO-2026-0600-gath";
  const md = infoMd(id, "https://records.example.org/g");
  const bad = { requests: [{ ...REQ, criticality: "urgent" }] };
  const r = w.promote(id, md, { files: [gj(bad)] });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "GATHERING_REFUSED");
  /* DEC-49 (N242's share): the refusal carries its code, its row and the member's translation */
  assert.deepEqual([r.code, r.check, r.translation],
    ["GATHERING_REFUSED", "C-18.10", GATHERING_CHECKS.GATHERING_REFUSED.translation]);
  assert.match(r.translation, /Nothing was changed\.$/);
  assert.deepEqual(r.findings, [{ check: "C-18.5", detail: "gathering.json requests[0].criticality must be one of: crucial, supporting" }]);
  assert.equal(w.record.head(id), null, "nothing was written");
  assert.equal(w.promote(id, md, { files: [gj(OK)] }).ok, true, "a well-formed queue lands");
  assert.equal(w.promote("INFO-2026-0601-none", infoMd("INFO-2026-0601-none", "https://records.example.org/h")).ok, true);
  /* a replay is exempt from this check (and only this one) */
  const rid = "INFO-2026-0602-replay";
  const rmd = infoMd(rid, "https://records.example.org/r");
  const rr = w.promotion.promote({ bundleId: rid, base: null, snapKey: "20260920T000000Z_rp0001", author: "member:alice", replay: true,
    meta: { object_type: "information", group: "test-group", title: `Monitored ${rid}`, current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
    files: [{ path: "bundle.md", text: rmd, bytes: Buffer.byteLength(rmd), sha256: sha(rmd) }, gj(bad)] });
  assert.notEqual(rr.reason, "GATHERING_REFUSED");
});

test("R42 C-18.5 runs in the audit through record-core's registration, over a queue that entered by replay", async () => {
  const w = world();
  const rid = "INFO-2026-0610-audit";
  const rmd = infoMd(rid, "https://records.example.org/a");
  const r = w.promotion.promote({ bundleId: rid, base: null, snapKey: "20260920T000000Z_rp0002", author: "member:alice", replay: true,
    meta: { object_type: "information", group: "test-group", title: `Monitored ${rid}`, current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
    files: [{ path: "bundle.md", text: rmd, bytes: Buffer.byteLength(rmd), sha256: sha(rmd) }, gj({ requests: [{ ...REQ, status: "done" }] })] });
  if (r.ok !== true) return assert.fail(`the replay did not land: ${r.reason}`);
  const a = await w.record.auditPass({ limit: 10 });
  const off = (a.offenders || []).find((o) => o.bundleId === rid);
  assert.ok(off, JSON.stringify(a).slice(0, 400));
  assert.ok(off.errors.some((e) => e.check === "C-18.5" && /status must be one of/.test(e.detail)));
});

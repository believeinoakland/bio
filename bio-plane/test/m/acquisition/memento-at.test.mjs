/* acquisition R35 (T33-21; ladders §2 TIME L0, §4 E3): the archive arm (R3, R32) and `archiveLookup` take an optional
   `at`, the instant asked about. The TimeGate is asked with `Accept-Datetime` at `at`; the TimeMap's candidates are
   taken nearest `at` first, each still chosen by selectCapture; the answer and the filed archive hop state both the
   instant asked for and the memento's own datetime; an `at` that is not an instant is MEMENTO_BAD_ASKED_DATE with
   nothing fetched; absent, the lookup asks for now as before. R3's eligibility rule is unchanged (K1521). Over a
   scripted Memento archive (fixture `wayback`) whose TimeGate, here, negotiates on the Accept-Datetime it is sent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, lookup, sha, wayback, WB, eligible, http1123 } from "./fixture.mjs";
import { acceptDatetime } from "../../../src/capture-sources/memento.mjs";

const ADDR = "https://gone.example/doc";
const ARCH = { via: "archive.org", address: ADDR };
const ADMIN = { cls: "admin", member: false, sessMember: null };
const TG = `${WB}${ADDR}`, TM = `${WB}timemap/link/${ADDR}`;
const RAW = (ts) => `${WB}${ts}id_/${ADDR}`;
const iso = (ts) => `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`;
const fresh = async () => { const w = world(); await eligible(w); return w; };
const nothingFiled = (w, r, what) => {
  assert.equal(r.body.document, undefined, `${what}: no document`);
  assert.deepEqual([w.prov.receipts.length, w.signed().length, w.b.calls.filter((c) => c[0] === "put").length], [0, 0, 0], `${what}: nothing filed or stored`);
};

/* A TimeGate that negotiates as RFC 7089 §4 says: it redirects to the memento nearest the Accept-Datetime it is sent. */
const MEMENTOS = [{ ts: "20200101000000", body: "of 2020" }, { ts: "20230101000000", body: "of early 2023" },
                  { ts: "20230701000000", body: "of mid 2023" }, { ts: "20250101000000", body: "of 2025" }];
const negotiating = (mementos = MEMENTOS) => {
  const base = wayback(mementos);
  return (u, init) => {
    if (u !== TG) return base(u);
    const want = Date.parse(new Date(init.headers["accept-datetime"]).toISOString());
    const near = [...mementos].sort((a, b) => Math.abs(Date.parse(iso(a.ts)) - want) - Math.abs(Date.parse(iso(b.ts)) - want))[0];
    return new Response("", { status: 302, headers: { location: `${WB}${near.ts}/${ADDR}`, vary: "accept-datetime" } });
  };
};

test("R35 R32: with `at`, the TimeGate is asked at that instant, the memento it names is filed, and the hop states the instant asked for beside the memento's own datetime", async () => {
  const at = "2023-05-20T12:00:00Z";
  const w = await fresh();
  const r = await run(w, negotiating(), { ...ARCH, at }, ADMIN);
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 300));
  assert.equal(r.net.seen[0].url, TG);
  assert.equal(r.net.seen[0].init.headers["accept-datetime"], acceptDatetime(at), "Accept-Datetime at `at`, not now");
  assert.equal(r.net.seen[0].init.headers["accept-datetime"], "Sat, 20 May 2023 12:00:00 GMT");
  assert.deepEqual(r.net.seen.map((x) => x.url), [TG, RAW("20230701000000")], "the memento the TimeGate negotiated for that instant");
  const d = r.body.document;
  assert.equal(d.capture.sha256, sha("of mid 2023"));
  const hop = d.provenance_chain[1];
  assert.deepEqual([hop.asked_at, hop.memento_datetime, hop.apart_seconds], [at, "2023-07-01T00:00:00Z", 41 * 86400 + 12 * 3600]);
  assert.equal(hop.asked_note, `the memento is of 2023-07-01T00:00:00Z, ${41 * 86400 + 12 * 3600} seconds after the instant asked about (${at}); it is not the page at ${at}`);
  assert.equal(hop.asserts, `these bytes were served for ${ADDR} at 2023-07-01T00:00:00Z, with HTTP status 200`, "the assertion is still the memento's own moment");
  assert.equal(hop.document_address, ADDR);
  /* archiveLookup asks the same and its answer states both instants */
  const look = await lookup(await fresh(), negotiating(), { address: ADDR, at });
  assert.equal(look.status, 200);
  assert.equal(look.net.seen[0].init.headers["accept-datetime"], acceptDatetime(at));
  assert.deepEqual([look.body.asked_at, look.body.memento_datetime, look.body.chosen.timestamp], [at, "2023-07-01T00:00:00Z", "20230701000000"]);
  assert.match(look.body.asked_note, /it is not the page at 2023-05-20T12:00:00Z/);
  assert.deepEqual([look.body.provenance_hop.asked_at, look.body.provenance_hop.memento_datetime], [at, "2023-07-01T00:00:00Z"]);
  assert.deepEqual(look.body.capture_with, { op: "acquire", via: "archive.org", address: ADDR, at }, "the capture it points to asks the same instant");
  /* a memento before the instant is said to be before it; one at the instant is said to be of it */
  const before = await lookup(await fresh(), negotiating(), { address: ADDR, at: "2023-02-01T00:00:00Z" });
  assert.deepEqual([before.body.memento_datetime, before.body.apart_seconds], ["2023-01-01T00:00:00Z", 31 * 86400]);
  assert.match(before.body.asked_note, /seconds before the instant asked about/);
  const exact = await lookup(await fresh(), negotiating(), { address: ADDR, at: "2025-01-01T00:00:00Z" });
  assert.deepEqual([exact.body.apart_seconds, exact.body.asked_note], [0, "the memento is of 2025-01-01T00:00:00Z, the instant asked about"]);
});

test("R35 R32: when the TimeGate gives no usable memento, the TimeMap's candidates are fetched nearest `at` first, each still chosen by selectCapture; without `at`, newest first", async () => {
  /* the TimeGate holds nothing usable; the memento nearest `at` is of a server error, which selectCapture refuses */
  const mementos = [{ ts: "20200101000000", body: "of 2020" }, { ts: "20230101000000", body: "of early 2023" },
                    { ts: "20230701000000", status: 500, body: "err" }, { ts: "20250101000000", body: "of 2025" }];
  const routes = wayback(mementos, { over: { [TG]: new Response("none", { status: 404 }) } });
  const at = "2023-05-01T00:00:00Z";
  for (const arm of ["acquire", "archiveLookup"]) {
    const w = await fresh();
    const r = arm === "acquire" ? await run(w, routes, { ...ARCH, at }, ADMIN) : await lookup(w, routes, { address: ADDR, at });
    assert.equal(r.status, 200, arm);
    assert.deepEqual(r.net.seen.map((x) => x.url), [TG, TM, RAW("20230701000000"), RAW("20230101000000")],
                     `${arm}: 2023-07-01 (61 days off) before 2023-01-01 (120 days off); the refused one passed over by selectCapture`);
    const chosen = arm === "acquire" ? r.body.document.provenance_chain[1] : r.body;
    assert.deepEqual([chosen.asked_at, chosen.memento_datetime], [at, "2023-01-01T00:00:00Z"], arm);
    if (arm === "acquire") assert.equal(r.body.document.capture.sha256, sha("of early 2023"));
    else assert.ok(r.body.rejected.some((x) => x.timestamp === "20230701000000" && x.refused === "statuscode 500, not 200"), "selectCapture's words");
  }
  /* two candidates equally near: the earlier first */
  const tie = wayback([{ ts: "20230101000000", body: "a" }, { ts: "20230103000000", body: "b" }], { over: { [TG]: new Response("none", { status: 404 }) } });
  const t = await lookup(await fresh(), tie, { address: ADDR, at: "2023-01-02T00:00:00Z" });
  assert.equal(t.body.chosen.timestamp, "20230101000000");
  /* negative control: the same archive asked without `at` is the newest-first lookup it always was, stating no asked instant */
  const w = await fresh();
  const now = await run(w, routes, ARCH, ADMIN);
  assert.deepEqual(now.net.seen.map((x) => x.url), [TG, TM, RAW("20250101000000")]);
  const hop = now.body.document.provenance_chain[1];
  assert.deepEqual(["asked_at" in hop, "memento_datetime" in hop, "asked_note" in hop], [false, false, false], "absent `at`: the hop as before");
  const lnow = await lookup(await fresh(), routes, { address: ADDR });
  assert.deepEqual(["asked_at" in lnow.body, lnow.body.capture_with], [false, { op: "acquire", via: "archive.org", address: ADDR }]);
});

test("R35: absent `at`, the TimeGate is asked for now; R3's eligibility is unchanged by `at`", async () => {
  const w = await fresh();
  const t0 = Date.now();
  const r = await run(w, negotiating(), ARCH, ADMIN);
  const askedMs = Date.parse(new Date(r.net.seen[0].init.headers["accept-datetime"]).toISOString());
  assert.ok(Math.abs(askedMs - t0) < 5000, "now, as before");
  assert.equal(r.body.document.capture.sha256, sha("of 2025"), "the newest memento answers a question asked now");
  /* a past instant does not open the archive arm to an address that can be reached now (K1521) */
  for (const arm of ["acquire", "archiveLookup"]) {
    const nw = world();
    const n = arm === "acquire" ? await run(nw, negotiating(), { ...ARCH, at: "2023-05-20T12:00:00Z" }, ADMIN)
                                : await lookup(nw, negotiating(), { address: ADDR, at: "2023-05-20T12:00:00Z" });
    assert.deepEqual([n.status, n.body.reason, n.net.seen.length], [409, "NOT_ELIGIBLE", 0], arm);
  }
  /* `at` reaches only the archive arm: a direct capture with one is the direct capture */
  const d = await run(world(), { "https://a.example/x": new Response("x") }, { locator: "https://a.example/x", at: "2023-05-20T12:00:00Z" });
  assert.deepEqual([d.status, d.body.document.provenance_chain.length], [200, 1]);
});

test("R35: an `at` that is not an instant to the second is MEMENTO_BAD_ASKED_DATE on the archive arm and in archiveLookup, with nothing fetched or filed", async () => {
  const BAD = ["2023-05-20", "2023-02-30T00:00:00Z", "2023-05-20T12:00:00.000Z", "2023-05-20T12:00:00+00:00", "2023-05-20 12:00:00Z",
               "20230520120000", 1684584000000, "", "yesterday", {}, true];
  for (const at of BAD) {
    for (const arm of ["acquire", "archiveLookup"]) {
      const w = await fresh();
      const r = arm === "acquire" ? await run(w, negotiating(), { ...ARCH, at }, ADMIN) : await lookup(w, negotiating(), { address: ADDR, at });
      assert.deepEqual([r.status, r.body.ok, r.body.reason], [400, false, "MEMENTO_BAD_ASKED_DATE"], `${arm} ${JSON.stringify(at)}`);
      assert.equal(r.net.seen.length, 0, `${arm} ${JSON.stringify(at)}: nothing fetched`);
      nothingFiled(w, r, `${arm} ${JSON.stringify(at)}`);
    }
  }
  /* negative control: an instant to the second, and null as absent, are asked */
  for (const at of ["2023-05-20T12:00:00Z", null]) {
    const w = await fresh();
    const ok = await run(w, negotiating(), { ...ARCH, at }, ADMIN);
    assert.equal(ok.status, 200, JSON.stringify(at));
    assert.equal(w.prov.receipts.length, 1);
  }
  assert.equal(http1123("20230520120000"), acceptDatetime("2023-05-20T12:00:00Z"), "the fixture's date reader agrees");
});

/* capture's shares of four legacy suites (T18's converts, K619 (2)), proved at the module's interface:
   `cap13-reuse-pages` (R24: a host's documents are its pages, never its captures), `cap14-reused-from` (R25: a reused
   part's source is the reusing capture's own record), `d522-unattended-render` (R39: the allowance holds a second
   render the day cannot pay for) and `subresources` (R23, R24, R25: the `capturelimit`, `siteassets` and `sitechrome`
   routes). T20 deleted the last three suites (K879), so these tests alone prove their claims; `cap13-reuse-pages`
   stays until the release deletes it (K619 (3)). What each suite drove through `op=acquire` is `acquisition`'s share;
   here the store side is driven as the acquisition act writes it. A fresh store per test; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, receipt, register, H } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";

const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const hex = (i) => i.toString(16).padStart(64, "0");

test("R24 (CAP-13; convert cap13-reuse-pages): a host's documents are its PAGES: one page captured three times with changed bytes is one document, a capture with no page on record is counted apart, and siteChrome's share is over pages", () => {
  const { c, s } = fresh();
  const host = "cap13.example.gov", O = `https://${host}`;
  const obs = (path, sha256) => ({ address: O + path, address_norm: O + path, sha256, kind: "stylesheet" });
  let n = 0;
  /* Every capture of a page is its own primary digest; each files its page address (the receipt) and the assets it saw. */
  const capture = (page, assets, at) => {
    const primary = hex(++n);
    receipt(s, { address: O + page, capture: primary, first: at });
    c.recordSiteAssets({ host, primarySha: primary, observations: assets.map(([p, d]) => obs(p, d)), at });
    return primary;
  };
  const one = [["/one.css", H("1")]], shared = [["/shared.css", H("2")]];
  const a = [capture("/a.html", one, "2026-01-01T00:00:00Z"), capture("/a.html", one, "2026-01-02T00:00:00Z"),
             capture("/a.html", one, "2026-01-03T00:00:00Z")];
  assert.equal(new Set(a).size, 3, "three captures of one page, three different primaries");
  assert.deepEqual([c.siteAssets({ host }).assets[`${O}/one.css`].documents], [1], "one page, however often it changed");
  for (const [p, at] of [["/b1.html", "2026-01-04T00:00:00Z"], ["/b2.html", "2026-01-05T00:00:00Z"], ["/b3.html", "2026-01-06T00:00:00Z"],
                         ["/b1.html", "2026-01-07T00:00:00Z"], ["/b1.html", "2026-01-08T00:00:00Z"]]) capture(p, shared, at);
  assert.equal(c.siteAssets({ host }).assets[`${O}/shared.css`].documents, 3, "b1 re-captured twice still counts once");
  /* the pre-D-58 shape: a primary with no receipt names no page, and is counted apart */
  c.recordSiteAssets({ host, primarySha: H("0c13"), observations: [obs("/legacy.css", H("3"))], at: "2026-01-09T00:00:00Z" });
  let k = c.siteAssets({ host, addresses: [`${O}/legacy.css`] }).assets[`${O}/legacy.css`];
  assert.deepEqual([k.documents, k.documents_undetermined], [0, 1], "no page and one undetermined capture");
  for (const [p, at] of [["/c1.html", "2026-01-10T00:00:00Z"], ["/c2.html", "2026-01-11T00:00:00Z"], ["/c3.html", "2026-01-12T00:00:00Z"]])
    capture(p, [["/legacy.css", H("3")]], at);
  k = c.siteAssets({ host, addresses: [`${O}/legacy.css`] }).assets[`${O}/legacy.css`];
  assert.deepEqual([k.documents, k.documents_undetermined], [3, 1], "located pages count, the orphan stays undetermined");
  /* siteChrome: pages a, b1, b2, b3, c1, c2, c3 = 7 over 11 primaries, and the orphan reported apart */
  const cr = route(c, "sitechrome", `host=${host}`);
  assert.deepEqual([cr.documents, cr.documents_undetermined], [7, 1]);
  const row = (p) => cr.assets.find((x) => x.address_norm === O + p);
  assert.deepEqual([row("/one.css").documents, row("/one.css").chrome], [1, false], "one page's own stylesheet, captured three times, is one document and not chrome");
  assert.deepEqual([row("/shared.css").documents, row("/shared.css").share], [3, 3 / 7], "three of seven pages");
  assert.match(cr.note, /1 further capture of this host name no page on record/);
});

test("R25 (CAP-14; convert cap14-reused-from): a reused part names the capture whose fetch served it, from the reusing capture's own row: a later fetch moves site_assets and never the earlier reuse; a reuse naming no source, or none that is a digest, is undetermined, never matched by its second", () => {
  const { c, s, rows } = fresh();
  const host = "cap14.example.gov", A = `https://${host}/s.css`;
  const P1 = hex(1), P2 = hex(2), P3 = hex(3), P4 = hex(4), P5 = hex(5);
  const fetchObs = (sha256) => ({ address: A, address_norm: A, sha256, kind: "stylesheet" });
  const reuseObs = (from) => ({ address: A, address_norm: A, sha256: H("1"), reused: true, ...(from === undefined ? {} : { reused_from: from }) });
  c.recordSiteAssets({ host, primarySha: P1, observations: [fetchObs(H("1"))], at: "2026-09-23T00:00:01Z" });
  c.recordSiteAssets({ host, primarySha: P2, observations: [fetchObs(H("1"))], at: "2026-09-23T00:00:02Z" });
  c.recordSiteAssets({ host, primarySha: P3, observations: [reuseObs(P2)], at: "2026-09-23T00:00:03Z" });
  const lastBy = () => c.siteAssets({ host, addresses: [A] }).assets[A].last_fetched_by;
  assert.equal(lastBy(), P2, "the fetching capture beside last_fetched");
  register(s, P3, "INFO-2026-0001-c14a");
  const parts = () => route(c, "reusedparts", "id=INFO-2026-0001-c14a").parts.map((x) => [x.address_norm, x.primary_sha, x.reused_from, x.reused_from_state]);
  assert.deepEqual(parts(), [[A, P3, P2, "recorded"]], "the fetching capture, not the reusing one");
  /* a later FETCH of the address (the same bytes, fetched again) moves site_assets' fetcher */
  c.recordSiteAssets({ host, primarySha: P4, observations: [fetchObs(H("1"))], at: "2026-09-23T00:00:04Z" });
  assert.equal(lastBy(), P4, "site_assets now names the later fetcher");
  assert.deepEqual(parts(), [[A, P3, P2, "recorded"]], "and the earlier reuse still names the capture whose fetch served it");
  c.recordSiteAssets({ host, primarySha: P5, observations: [reuseObs(P4)], at: "2026-09-23T00:00:05Z" });
  assert.equal(lastBy(), P4, "a reuse never moves the fetcher");
  /* the pre-build shape: a fetch and a reuse in the same second, the reuse naming no source */
  const O = `https://${host}/old.css`, F = H("c14f"), L = H("c14e"), at = "2026-09-01T00:00:00Z";
  c.recordSiteAssets({ host, primarySha: F, observations: [{ address: O, address_norm: O, sha256: H("7"), kind: "stylesheet" }], at });
  c.recordSiteAssets({ host, primarySha: L, observations: [{ address: O, address_norm: O, sha256: H("7"), reused: true }], at });
  register(s, L, "INFO-2026-0002-c14b");
  const old = () => route(c, "reusedparts", "id=INFO-2026-0002-c14b").parts.map((x) => [x.address_norm, x.reused_from, x.reused_from_state]);
  assert.deepEqual(old(), [[O, null, "undetermined"]], "the same second as the fetch attributes nothing");
  c.recordSiteAssets({ host, primarySha: L, observations: [{ address: O, address_norm: O, sha256: H("7"), reused: true, reused_from: "the day before" }], at });
  assert.deepEqual(old(), [[O, null, "undetermined"]], "a source that is not a digest is not kept");
  /* the migration: a store whose tables predate the two columns gains them at boot, NULL, never back-filled */
  s.db.exec(`ALTER TABLE site_asset_refs DROP COLUMN reused_from`);
  s.db.exec(`ALTER TABLE site_assets DROP COLUMN last_fetched_by`);
  assert.ok(!rows(`PRAGMA table_info(site_asset_refs)`).some((r) => r.name === "reused_from"), "the pre-build shape is made");
  c.migrate();
  assert.deepEqual([rows(`PRAGMA table_info(site_asset_refs)`).some((r) => r.name === "reused_from"),
                    rows(`PRAGMA table_info(site_assets)`).some((r) => r.name === "last_fetched_by")], [true, true]);
  assert.deepEqual(parts(), [[A, P3, null, "undetermined"]], "the pre-build reuse reads undetermined, never back-filled");
  assert.equal(lastBy(), null, "and site_assets' fetcher is null, not guessed");
});

test("R39 R40 (D-522; convert d522-unattended-render): an allowance of exactly one render's reservation admits the first render and, once it has reported, defers the next, counting it and reserving nothing", () => {
  const { c, rows } = fresh();
  const R = 60000, at = "2026-09-24T10:00:00Z";
  const first = c.renderAdmit({ allowanceMs: R, reserveMs: R, cap: 2, at });
  assert.deepEqual([first.state, first.reserved_ms], ["admitted", R], "0 + 0 + R fits R");
  const spent = c.renderSpend({ ms: 1000, releaseMs: R, slot: first.slot, at });
  assert.deepEqual([spent.spent_ms, spent.reserved_ms], [1000, 0], "the render reports its time and releases its reservation");
  const second = c.renderAdmit({ allowanceMs: R, reserveMs: R, cap: 2, at });
  assert.deepEqual([second.state, second.deferred, second.spent_ms, second.reserved_ms], ["deferred", 1, 1000, 0], "1000 + 0 + R exceeds R");
  assert.deepEqual({ ...rows(`SELECT spent_ms, reserved_ms, renders, deferred FROM render_allowance`)[0] },
                   { spent_ms: 1000, reserved_ms: 0, renders: 1, deferred: 1 });
  assert.equal(rows(`SELECT count(*) n FROM render_slots`)[0].n, 0, "the deferral took no slot");
  const nextDay = c.renderAdmit({ allowanceMs: R, reserveMs: R, cap: 2, at: "2026-09-25T00:00:00Z" });
  assert.equal(nextDay.state, "admitted", "the allowance is the day's");
});

test("R23 R24 R25 (convert subresources: the capturelimit, siteassets and sitechrome routes): the ceiling learned by refusal and confirmed, moved and re-probed through the store route; a host's assets counted by document, a change counted and dated; chrome by recurrence with its share", () => {
  const { c, s } = fresh();
  let l = route(c, "capturelimit", "runtime=subrequests");
  assert.deepEqual([l.observed, l.probeDue], [null, true], "nothing observed: no ceiling, a probe due");
  let r = route(c, "recordcapturelimit", "", { runtime: "subrequests", observed: null });
  assert.equal(r.recorded, false); assert.match(r.note, /nothing about where it is/);
  r = route(c, "recordcapturelimit", "", { runtime: "subrequests", observed: 51 });
  assert.deepEqual([r.observed, r.recorded, r.moved], [51, true, false]);
  assert.deepEqual([route(c, "capturelimit", "runtime=subrequests").observed, route(c, "capturelimit", "runtime=subrequests").probeDue], [51, false]);
  r = route(c, "recordcapturelimit", "", { runtime: "subrequests", observed: 51 });
  assert.deepEqual([r.samples, r.moved], [2, false], "a second identical observation confirms rather than moves");
  r = route(c, "recordcapturelimit", "", { runtime: "subrequests", observed: 1001 });
  assert.deepEqual([r.moved, r.previous], [true, 51], "a different observation is a move, keeping the old value");
  l = route(c, "capturelimit", "runtime=subrequests");
  assert.equal(l.observed, 1001); assert.match(l.moved_at, /^\d{4}-\d{2}-\d{2}T/);
  for (let i = 0; i < l.probeEvery; i++) route(c, "recordcapturelimit", "", { runtime: "subrequests", observed: null });
  l = route(c, "capturelimit", "runtime=subrequests");
  assert.deepEqual([l.probeDue, l.observed], [true, 1001], "a probe falls due again, the remembered value kept");
  /* what a host has served */
  const host = "assets.example.gov", A = `https://${host}/css/site.css`, long = "2026-01-01T00:00:00Z";
  const d = (i) => hex(0xd0 + i);
  for (const [i, p] of [[1, "/one.html"], [2, "/two.html"], [3, "/three.html"]]) receipt(s, { address: `https://${host}${p}`, capture: d(i), first: long });
  const css = (sha256) => [{ address: A, address_norm: A, sha256, content_type: "text/css", bytes: 10, kind: "stylesheet" }];
  route(c, "recordsiteassets", "", { host, primarySha: d(1), at: long, observations: css(H("a")) });
  let k = route(c, "siteassets", "", { host }).assets[A];
  assert.deepEqual([k.documents, k.stable_since], [1, long], "one document; stable from when first seen");
  route(c, "recordsiteassets", "", { host, primarySha: d(2), at: long, observations: css(H("a")) });
  assert.equal(route(c, "siteassets", "", { host }).assets[A].documents, 2, "a second document makes it the site's");
  const chg = route(c, "recordsiteassets", "", { host, primarySha: d(3), observations: css(H("b")) });
  assert.deepEqual([chg.changed, chg.changes[0].was], [1, H("a")], "a different digest is a change, keeping what it was");
  k = route(c, "siteassets", "", { host }).assets[A];
  assert.deepEqual([k.stable_since !== long, k.changes], [true, 1], "stability restarts from the change, and the change is counted");
  const own = `https://${host}/img/one-off.png`;
  route(c, "recordsiteassets", "", { host, primarySha: d(3), observations: [{ address: own, address_norm: own, sha256: H("c"), kind: "image" }] });
  const cr = route(c, "sitechrome", `host=${host}`);
  assert.equal(cr.documents, 3, "three documents is enough for recurrence to say something");
  const at = (a) => cr.assets.find((x) => x.address_norm === a);
  assert.deepEqual([at(A).chrome, at(own).chrome, at(A).share, at(own).share], [true, false, 1, 1 / 3]);
  assert.match(route(c, "sitechrome", "host=nothing.example.com").note, /says nothing yet/, "too few documents: said, not guessed");
});

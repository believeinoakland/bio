/* capture: the bounded reads (N90: R24–R28, R32 as amended), the `links` read contract (R57, N109) and the one
   instance per storage (R58, N122), at the module's interface. Each test names the requirement ids it checks in its
   title. A fresh store per test; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, receipt, register, bucket, governor, provenance, storage, H } from "./fixture.mjs";
import { captureOf, captureOps, READ_LIMIT } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { governorOf } from "../../../src/host-governor/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
/* The control plane's envelope reader (index.mjs `doAnswer`), as it is handed to the ops (N247). */
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };

const hex = (i) => i.toString(16).padStart(64, "0");
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();

/* Every row once, in order, by following `next` from the first page; each page at most `limit` and flagged. */
function pages(read, limit) {
  const seen = [];
  let after = null, n = 0;
  for (;;) {
    const p = read({ limit, after });
    assert.equal(p.limit, limit);
    n++;
    seen.push(p);
    if (!p.truncated) { assert.equal(p.next, null); break; }
    assert.equal(typeof p.next, "string");
    after = p.next;
    assert.ok(n < 1000, "paging terminates");
  }
  return seen;
}

test("R27 (N90): linksTo answers at most `limit` rows in (source, citation) order, pages by `after` over every row once, bounds a route that names no limit, and refuses a cursor it did not write", () => {
  const { c } = fresh();
  const to = "https://t.example/r";
  for (let i = 0; i < 7; i++)
    c.recordLinks({ sourceCapture: hex(i), capturedAt: "2026-01-01T00:00:00Z",
                    links: [{ ref: "a", address: `${to}#s${i}`, address_norm: to, citation_norm: `${to}#s${i}`, fragment: `s${i}` },
                            { ref: "b", address: to, address_norm: to }] });
  const all = pages((p) => c.linksTo({ address_norm: to, ...p }), 3);
  const rows = all.flatMap((p) => p.sources);
  assert.equal(rows.length, 14, "every row, once");
  const key = (r) => [r.source_capture, r.citation_norm, r.link_ref].join(" ");
  assert.deepEqual(rows.map(key), [...rows.map(key)].sort(), "in (source, citation) order");
  assert.equal(new Set(rows.map(key)).size, 14);
  assert.ok(all.every((p) => p.sources.length <= 3 && p.count === p.sources.length), "count is of the rows listed");
  assert.deepEqual(all[0].elements, ["s0"], "elements are of the rows listed (the third row, s1's bare link, names none)");
  assert.equal(c.linksTo({ address_norm: to, after: "garbage" }).reason, "BAD_CURSOR");
  const r = route(c, "linksto", `address=${encodeURIComponent(to)}`);
  assert.deepEqual([r.limit, r.truncated, r.count], [READ_LIMIT.default, false, 14], "the route bounds what the caller omits");
});

test("R27 (N90): resolveLinks through the route answers at most `limit` links with truncated and next, the tally being of the links listed; an in-process caller naming no limit is answered every link", () => {
  const { c } = fresh();
  const links = Array.from({ length: 205 }, (_, i) => ({ ref: `r${i}`, address: `https://t.example/${i}`, address_norm: `https://t.example/${i}` }));
  c.recordLinks({ sourceCapture: H("a"), capturedAt: "2026-01-01T00:00:00Z", links });
  const whole = c.resolveLinks({ sourceCapture: H("a") });
  assert.deepEqual([whole.resolved, whole.limit, whole.truncated, whole.next], [205, null, false, null], "every link, `limit: null`");
  const r = route(c, "resolvelinks", `capture=${H("a")}`);
  assert.deepEqual([r.resolved, r.limit, r.truncated, r.tally.offsite], [READ_LIMIT.default, READ_LIMIT.default, true, READ_LIMIT.default]);
  const rest = route(c, "resolvelinks", `capture=${H("a")}&after=${encodeURIComponent(r.next)}`);
  assert.deepEqual([rest.resolved, rest.truncated, rest.next], [5, false, null]);
  const refs = [...r.links, ...rest.links].map((l) => l.link_ref);
  assert.equal(new Set(refs).size, 205, "the two pages are every link once");
  const small = pages((p) => c.resolveLinks({ sourceCapture: H("a"), ...p }), 50);
  assert.deepEqual(small.map((p) => p.resolved), [50, 50, 50, 50, 5]);
  assert.equal(c.resolveLinks({ sourceCapture: H("a"), limit: 5, after: "!" }).reason, "BAD_CURSOR");
  assert.equal(route(c, "resolvelinks", `capture=${H("a")}&limit=5000`).limit, READ_LIMIT.max, "clamped to the maximum");
});

test("R27 (N90): recordLinkVerdict answers the newest `limit` verdicts oldest first, with total and truncated; changed is whether the total exceeds one", () => {
  const { c } = fresh();
  let v;
  for (let i = 0; i < 6; i++)
    v = c.recordLinkVerdict({ sourceCapture: H("a"), addressNorm: "https://t.example/x", verdict: i % 2 ? "undetermined" : "contemporaneous",
                              basis: `b${i}`, at: `2026-05-1${i}T00:00:00Z`, limit: 4 });
  assert.deepEqual([v.total, v.limit, v.truncated, v.changed, v.history.length], [6, 4, true, true, 4]);
  assert.deepEqual(v.history.map((h) => h.basis), ["b2", "b3", "b4", "b5"], "the newest four, oldest first");
  assert.equal(v.current.basis, "b5");
  const one = c.recordLinkVerdict({ sourceCapture: H("b"), addressNorm: "https://t.example/y", verdict: "undetermined", basis: "only" });
  assert.deepEqual([one.total, one.changed, one.truncated, one.limit], [1, false, false, READ_LIMIT.default]);
});

test("R28 (N90): chromeOf answers a host's classified links in address order, at most `limit`, paged by `after` over every link once", () => {
  const { c, s } = fresh();
  const addrs = Array.from({ length: 9 }, (_, i) => `https://h.example/n${i}`);
  receipt(s, { address: "https://h.example/p", capture: H("a"), first: "2026-01-01T00:00:00Z" });
  c.recordLinks({ sourceCapture: H("a"), capturedAt: "2026-01-01T00:00:00Z",
                  links: addrs.map((a) => ({ ref: a, address: a, address_norm: a, chrome: true, chrome_basis: "<nav>" })) });
  const all = pages((p) => c.chromeOf({ host: "h.example", ...p }), 4);
  assert.deepEqual(all.flatMap((p) => p.links.map((l) => l.address_norm)), [...addrs].sort());
  assert.deepEqual(all.map((p) => p.links.length), [4, 4, 1]);
  assert.equal(c.chromeOf({ host: "h.example", after: "x" }).reason, "BAD_CURSOR");
  const r = route(c, "chromeof", "host=h.example");
  assert.deepEqual([r.limit, r.truncated, r.links.length], [READ_LIMIT.default, false, 9]);
});

test("R24 (N90): siteChrome answers at most `limit` assets most-recurring first with the host's total, its documents being the host's; siteAssets through the route is paged, asked addresses are answered whole, and the walk's read is whole", () => {
  const { c, s } = fresh();
  const host = "x.example";
  for (let p = 0; p < 4; p++) receipt(s, { address: `https://x.example/p${p}`, capture: hex(100 + p), first: "2026-01-01T00:00:00Z" });
  /* asset a{k} is referenced by k+1 of the four pages (capped at 4) */
  for (let k = 0; k < 6; k++)
    for (let p = 0; p <= Math.min(k, 3); p++)
      c.recordSiteAssets({ host, primarySha: hex(100 + p), observations: [{ address_norm: `https://x.example/a${k}.css`, sha256: H("1"), kind: "stylesheet" }] });
  const top = c.siteChrome({ host, limit: 3 });
  assert.deepEqual([top.documents, top.total, top.limit, top.truncated, top.assets.length], [4, 6, 3, true, 3]);
  assert.deepEqual(top.assets.map((a) => a.documents), [4, 4, 4], "most-recurring first");
  assert.ok(top.assets[0].share >= top.assets[2].share);
  assert.deepEqual(c.siteChrome({ host }).assets.map((a) => a.documents), [4, 4, 4, 3, 2, 1]);
  assert.equal(route(c, "sitechrome", `host=${host}`).limit, READ_LIMIT.default);
  /* siteAssets: the route pages; asked addresses whole; no limit (the walk) whole */
  const all = pages((p) => c.siteAssets({ host, ...p }), 4);
  assert.deepEqual(all.flatMap((p) => Object.keys(p.assets)), Array.from({ length: 6 }, (_, k) => `https://x.example/a${k}.css`));
  assert.equal(all[0].assets["https://x.example/a3.css"].documents, 4);
  const asked = c.siteAssets({ host, addresses: ["https://x.example/a5.css", "https://x.example/none"], limit: 1 });
  assert.deepEqual([Object.keys(asked.assets), asked.truncated, asked.limit], [["https://x.example/a5.css"], false, null]);
  assert.equal(asked.assets["https://x.example/a5.css"].documents, 4);
  assert.equal(Object.keys(c.siteAssets({ host }).assets).length, 6, "in process, no limit: the host whole");
  const r = route(c, "siteassets", `host=${host}&limit=2`);
  assert.deepEqual([r.limit, r.truncated, r.count], [2, true, 2]);
  assert.equal(route(c, "siteassets", `host=${host}`).limit, READ_LIMIT.default, "the route bounds what the caller omits");
});

test("R25 (N90): recordSiteAssets counts every change and appends every posthoc verdict, listing at most `limit` changes each naming at most `limit` reusers, and says so", () => {
  const { c, rows } = fresh();
  const host = "x.example";
  const obs = (k, sha256, extra = {}) => ({ address_norm: `https://x.example/a${k}.css`, sha256, ...extra });
  for (let k = 0; k < 3; k++) c.recordSiteAssets({ host, primarySha: H("f"), observations: [obs(k, H("1"))] });
  for (let r = 0; r < 5; r++)
    c.recordSiteAssets({ host, primarySha: hex(r + 1), observations: [0, 1, 2].map((k) => obs(k, H("1"), { reused: true, reused_from: H("f") })) });
  const ch = c.recordSiteAssets({ host, primarySha: H("e"), observations: [0, 1, 2].map((k) => obs(k, H("2"))), limit: 2 });
  assert.deepEqual([ch.changed, ch.changes.length, ch.limit, ch.truncated], [3, 2, 2, true]);
  assert.ok(ch.changes.every((x) => x.reused_by.length === 2 && x.reused_by_count === 5));
  assert.equal(rows(`SELECT count(*) n FROM reuse_verdicts WHERE phase = 'posthoc'`)[0].n, 15, "every posthoc verdict appended");
  const whole = c.recordSiteAssets({ host, primarySha: H("d"), observations: [obs(0, H("3"))] });
  assert.deepEqual([whole.changes.length, whole.truncated, whole.limit, whole.changes[0].reused_by_count], [1, false, READ_LIMIT.default, 5]);
});

test("R26 (N90): reuseVerdicts lists at most `limit`, newest first, with truncated, by bundle or by source capture; a route that names no limit is bounded", () => {
  const { c } = fresh();
  const verdicts = Array.from({ length: 7 }, (_, i) => ({ source_capture: H("a"), host: "x.example", address_norm: `https://x.example/${i}`,
                                                          verdict: "confirmed", reused_sha: H("1") }));
  for (let d = 1; d <= 3; d++) c.recordReuseVerdicts({ bundleId: "INFO-1", verdicts, at: `2026-01-0${d}T00:00:00Z` });
  const p = c.reuseVerdicts({ bundleId: "INFO-1", limit: 10 });
  assert.deepEqual([p.verdicts.length, p.truncated, p.limit, p.bundleId], [10, true, 10, "INFO-1"]);
  assert.ok(p.verdicts.slice(0, 7).every((v) => v.at === "2026-01-03T00:00:00Z"), "newest first");
  assert.deepEqual([c.reuseVerdicts({ sourceCapture: H("a"), limit: 21 }).truncated, c.reuseVerdicts({ sourceCapture: H("a") }).verdicts.length], [false, 21]);
  const r = route(c, "reuseverdicts", "bundle=INFO-1");
  assert.deepEqual([r.limit, r.verdicts.length, r.truncated], [READ_LIMIT.default, 21, false]);
  assert.deepEqual(c.reuseVerdicts({}), { verdicts: [] });
});

test("R32 (N90): inboxList lists at most `limit` knocks newest first, paged by `after` over every knock once, by status too; a route that names no limit is bounded", async () => {
  const { c } = fresh({ evidence: bucket() });
  const W = 600000;
  for (let i = 0; i < 205; i++)
    await c.knock({ content: `k${i}`, sourceAddress: `s${i}`, perIpLimit: 1e9, globalLimit: 1e9, now: W * 10 + i * 1000 });
  const first = route(c, "inboxlist");
  assert.deepEqual([first.inbox.length, first.limit, first.truncated], [READ_LIMIT.default, READ_LIMIT.default, true]);
  const rest = route(c, "inboxlist", `after=${encodeURIComponent(first.next)}`);
  assert.deepEqual([rest.inbox.length, rest.truncated, rest.next], [5, false, null]);
  const ids = [...first.inbox, ...rest.inbox].map((k) => k.knock_id);
  assert.equal(new Set(ids).size, 205, "every knock once");
  const received = [...first.inbox, ...rest.inbox].map((k) => k.received);
  assert.deepEqual(received, [...received].sort().reverse(), "newest first");
  const k0 = c.inboxList(null, { limit: 205 }).inbox.at(-1);
  await c.inboxResolve({ knockId: k0.knock_id, status: "pulled", by: "member:m", reason: "brought in" });
  const pulled = pages((p) => c.inboxList("pulled", p), 1);
  assert.deepEqual(pulled.flatMap((p) => p.inbox.map((k) => k.knock_id)), [k0.knock_id]);
  assert.equal(c.inboxList("new", { limit: 1000 }).inbox.length, 204);
  assert.equal(c.inboxList(null, { after: "nope" }).reason, "BAD_CURSOR");
});

test("R57 (N109): links is a read contract: source_capture, address_norm, partition and first_seen carry their stated meaning, and first_seen is kept when a capture's rows are filed again", () => {
  const { c, s, rows } = fresh();
  const cols = rows(`PRAGMA table_info(links)`).map((r) => r.name);
  for (const col of ["source_capture", "address_norm", "partition", "first_seen"]) assert.ok(cols.includes(col), col);
  const links = [{ ref: "a", address: "https://t.example/x#f", address_norm: "https://t.example/x", citation_norm: "https://t.example/x#f", type: "deferred" },
                 { ref: "#top", address: "https://s.example/#top", address_norm: "https://s.example/", type: "anchor" },
                 { ref: "i", address: "https://s.example/i.css", address_norm: "https://s.example/i.css", type: "intra" },
                 { ref: "r", address: "javascript:x", address_norm: "javascript:x", type: "refused" },
                 { ref: "d", address: "https://t.example/d", address_norm: "https://t.example/d" }];
  c.recordLinks({ sourceCapture: H("a"), capturedAt: "2026-01-01T00:00:00Z", links });
  const got = Object.fromEntries(rows(`SELECT link_ref, source_capture, address_norm, partition, first_seen FROM links`).map((r) => [r.link_ref, r]));
  assert.deepEqual(Object.values(got).map((r) => r.source_capture), Array(5).fill(H("a")), "the capture whose bytes carried the link");
  assert.equal(got.a.address_norm, "https://t.example/x", "the resource, no fragment");
  assert.deepEqual(["a", "#top", "i", "r", "d"].map((k) => got[k].partition), ["deferred", "anchor", "intra", "refused", "deferred"],
                   "subresources' partition, deferred when none was given");
  for (const r of Object.values(got)) assert.match(r.first_seen, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/, "a whole-second UTC instant");
  /* filed again (a continuation): a kept row keeps its first instant, a new row takes now */
  s.sql.exec(`UPDATE links SET first_seen = '2025-01-01T00:00:00Z'`);
  c.recordLinks({ sourceCapture: H("a"), capturedAt: "2026-01-01T00:00:00Z",
                  links: [...links, { ref: "n", address: "https://t.example/n", address_norm: "https://t.example/n" }] });
  const again = Object.fromEntries(rows(`SELECT link_ref, first_seen FROM links`).map((r) => [r.link_ref, r.first_seen]));
  assert.deepEqual(["a", "#top", "i", "r", "d"].map((k) => again[k]), Array(5).fill("2025-01-01T00:00:00Z"));
  assert.notEqual(again.n, "2025-01-01T00:00:00Z");
});

test("R58 R73 (N122, K1224): captureOf answers one instance per storage, holding attestation's; an env or governor it took by default is adopted from a later caller; one differing from what a caller gave throws naming it; the same one is accepted", () => {
  const ctx = { storage: storage() };
  const record = recordOf(ctx);
  record.migrate();
  const prov = provenance(ctx.storage);
  const first = captureOf(ctx, { record, provenance: prov });
  assert.deepEqual(first.env, {}, "no env yet");
  const renderer = { fetch() {} };
  const env = { RENDERER: renderer, INSTANCE_NAME: "i" };
  assert.equal(captureOf(ctx, { env }), first, "one instance");
  assert.equal(first.env, env, "the env taken by default is adopted from the first caller that supplies it");
  assert.equal(captureOf(ctx, { env: { INSTANCE_NAME: "i", RENDERER: renderer } }), first, "the same bindings in another object are the same env");
  assert.throws(() => captureOf(ctx, { env: { RENDERER: renderer, INSTANCE_NAME: "other" } }), /different `env`/);
  assert.throws(() => captureOf(ctx, { env: { RENDERER: renderer } }), /different `env`/, "a binding dropped is a difference");
  assert.equal(first.env, env, "a refused env changes nothing");
  assert.equal(first.governor, governorOf(ctx), "the default governor");
  const g = governor();
  assert.equal(captureOf(ctx, { governor: g }).governor, g, "a governor taken by default is adopted");
  assert.equal(captureOf(ctx, { governor: g }), first);
  assert.throws(() => captureOf(ctx, { governor: governor() }), /different `governor`/);
  assert.equal(captureOf(ctx, { record, provenance: prov }), first, "the record and provenance it holds are accepted");
  assert.throws(() => captureOf(ctx, { provenance: provenance(ctx.storage) }), /different `provenance`/);
  assert.throws(() => captureOf(ctx, { record: {} }), /different `record`/);
  assert.equal(captureOf(ctx), first, "a caller supplying nothing is answered the instance");
  /* R58 R73 (K1224): attestation's instance for the storage by default, held as `attestation` for the acquisition act;
     the same one is accepted, another refused by name */
  assert.equal(first.attestation, attestationOf(ctx), "attestation's own instance for this storage");
  assert.equal(captureOf(ctx, { attestation: attestationOf(ctx) }), first);
  assert.throws(() => captureOf(ctx, { attestation: {} }), /different `attestation`/);
  assert.equal(first.attestation, attestationOf(ctx), "a refused attestation changes nothing");
  const ctx4 = { storage: storage() };
  recordOf(ctx4).migrate();
  const att = { signReceipt: async () => ({ ok: true }) };
  const c4 = captureOf(ctx4, { provenance: provenance(ctx4.storage), attestation: att });
  assert.equal(c4.attestation, att, "the one captureOf was given");
  assert.throws(() => captureOf(ctx4, { attestation: attestationOf(ctx4) }), /different `attestation`/);
  /* a first caller that supplied env: a later different env throws at once */
  const ctx2 = { storage: storage() };
  recordOf(ctx2).migrate();
  const e2 = { CAPTURES: bucket() };
  const c2 = captureOf(ctx2, { env: e2, provenance: provenance(ctx2.storage) });
  assert.throws(() => captureOf(ctx2, { env: {} }), /different `env`/);
  assert.equal(c2.env, e2);
  /* a refused call adopts nothing: an env it could have adopted beside a governor it refuses stays unadopted */
  const ctx3 = { storage: storage() };
  recordOf(ctx3).migrate();
  const g3 = governor();
  const c3 = captureOf(ctx3, { governor: g3, provenance: provenance(ctx3.storage) });
  assert.throws(() => captureOf(ctx3, { env: { INSTANCE_NAME: "i" }, governor: governor() }), /different `governor`/);
  assert.deepEqual([c3.env, c3.governor], [{}, g3], "nothing adopted by a refused call");
  assert.equal(captureOf(ctx3, { env: { INSTANCE_NAME: "i" } }).env.INSTANCE_NAME, "i");
});

test("R29 (N187): op=navchanges answers at most `limit` observations, the newest, oldest first, with `limit` and `truncated`; 200 when the caller names none or none usable, clamped to 500; op=links forwards the caller's limit", async () => {
  const { c, s } = fresh();
  const host = "h.example";
  const N = 502;
  /* N direct captures of N distinct pages, each carrying the host's navigation; the navigation changes at every
     hundredth capture, so a cut sequence still has changes to compare */
  for (let i = 0; i < N; i++) {
    const when = new Date(Date.UTC(2026, 0, 1) + i * 60000).toISOString().replace(/\.\d+Z$/, "Z");
    receipt(s, { address: `https://${host}/p${i}`, capture: hex(1000 + i), first: when });
    const nav = ["https://h.example/about", `https://h.example/era${Math.floor(i / 100)}`];
    c.recordLinks({ sourceCapture: hex(1000 + i), capturedAt: when,
                    links: nav.map((a) => ({ ref: a, address: a, address_norm: a, chrome: true, chrome_basis: "<nav>" })) });
  }
  const at = (r) => r.sequence.map((o) => o.first_observed);
  const newest = (k) => Array.from({ length: k }, (_, j) => new Date(Date.UTC(2026, 0, 1) + (N - k + j) * 60000).toISOString().replace(/\.\d+Z$/, "Z"));
  for (const [qs, cap] of [["", 200], ["limit=abc", 200], ["limit=0", 200], ["limit=-5", 200], ["limit=37", 37], ["limit=37.9", 37],
                           ["limit=500", 500], ["limit=501", 500], ["limit=100000", 500]]) {
    const r = route(c, "navchanges", `host=${host}${qs ? `&${qs}` : ""}`);
    assert.deepEqual([r.limit, r.observations, r.sequence.length, r.truncated], [cap, cap, cap, true], qs || "(no limit)");
    assert.deepEqual(at(r), newest(cap), `${qs || "(no limit)"}: the newest ${cap}, oldest first`);
    assert.ok(r.changes.every((ch) => r.sequence.some((o) => o.source_capture === ch.from.source_capture)), "changes are of the observations listed");
  }
  /* under the cap: every observation, not truncated */
  const small = fresh();
  for (let i = 0; i < 3; i++) {
    receipt(small.s, { address: `https://${host}/q${i}`, capture: hex(i), first: `2026-01-0${i + 1}T00:00:00Z` });
    small.c.recordLinks({ sourceCapture: hex(i), capturedAt: `2026-01-0${i + 1}T00:00:00Z`,
                          links: [{ ref: "n", address: "https://h.example/n", address_norm: "https://h.example/n", chrome: true, chrome_basis: "<nav>" }] });
  }
  const whole = route(small.c, "navchanges", `host=${host}&limit=3`);
  assert.deepEqual([whole.observations, whole.truncated], [3, false]);
  /* op=links carries the caller's limit to the route */
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  const stub = { async fetch(u) { const url = new URL(u); return json({ ok: true, result: captureOps(c, url, null, c.env)[url.pathname.slice(1)]() }); } };
  const { linksOp } = await import("../../../src/capture/ops.mjs");
  const via = await (await linksOp(new URL(`https://p/?op=links&host=${host}&limit=9000`), stub, { json, storeSilent: () => json({}, 502), doAnswer, viewer: "class:admin" })).json();
  assert.deepEqual([via.limit, via.observations, via.truncated], [500, 500, true]);
  const dflt = await (await linksOp(new URL(`https://p/?op=links&host=${host}`), stub, { json, storeSilent: () => json({}, 502), doAnswer, viewer: "class:admin" })).json();
  assert.deepEqual([dflt.limit, dflt.observations], [200, 200]);
});

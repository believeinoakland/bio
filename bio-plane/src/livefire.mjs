/* Live-fire battery.
 *
 * Runs entirely server-side and returns JSON, so the whole thing is one GET.
 * That matters because the only channel available for reaching a deployment
 * may be a plain fetch of a URL.
 *
 * Confined to the scratch namespace and a scratch/ prefix in R2. It cannot
 * touch live state: the op registry refuses a probe-class mutation outside
 * scratch before this code is reached.
 *
 * Discipline borrowed from livefire-store-audit.mjs: a battery that can only
 * pass proves nothing. Two guards here. A NONCE canary is written and read
 * back, so a store that silently did nothing cannot report success. And the
 * negative controls are load-bearing rather than decorative: the stale-base
 * refusal and the oversize refusal are the assertions the plane decision rests
 * on, and both require a specific failure rather than an absence of error.
 */

import { PUBLISHED_TOKEN_HASHES } from "./tokens.mjs";

const sha256 = async (s) => {
  const b = await crypto.subtle.digest("SHA-256", typeof s === "string" ? new TextEncoder().encode(s) : s);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

export async function livefire(env, storeName) {
  const t0 = Date.now();
  const stub = env.STORE.get(env.STORE.idFromName(storeName));
  const post = async (op, body) => {
    const r = await stub.fetch(new Request("http://x/" + op, { method: "POST", body: JSON.stringify(body) }));
    return (await r.json()).result;
  };
  const get = async (path) => {
    const r = await stub.fetch(new Request("http://x/" + path));
    return (await r.json()).result;
  };

  const A = [];
  const assert = (name, got, want, note) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    A.push({ name, ok, ...(ok ? {} : { want, got }), ...(note ? { note } : {}) });
    return ok;
  };

  const NONCE = crypto.randomUUID();
  const id = `INFO-2026-9001-livefire-${NONCE.slice(0, 8)}`;
  const md = (state, rev) =>
    `---\nid: ${id}\nobject_type: information\ncurrent_state: ${state}\nnonce: ${NONCE}\n---\n\n## Summary\n\nrev ${rev}\n`;
  const pkgFor = async (state, rev, extra = []) => {
    const body = md(state, rev);
    return {
      bundleId: id, snapKey: "20260723T190000Z_livefire", author: "livefire",
      meta: { object_type: "information", group: "believe-in-oakland", title: "livefire", current_state: state, created: "2026-01-01T00:00:00Z", last_updated: new Date().toISOString() },
      files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: await sha256(body) }, ...extra],
      register: [],
    };
  };

  /* ---- creation, CAS ladder, and the refusals that carry the design ---- */
  const c1 = await post("promote", { ...(await pkgFor("collected", 1)), base: null });
  assert("creation with base null succeeds", c1.ok, true);
  const sha1 = c1.bundleSha;

  assert("second creation refused", (await post("promote", { ...(await pkgFor("collected", 2)), base: null })).reason, "EXISTS");

  const c3 = await post("promote", { ...(await pkgFor("verified", 3)), base: sha1 });
  assert("update with correct base succeeds", c3.ok, true);
  assert("row_version advanced", c3.rowVersion, 2);
  const sha2 = c3.bundleSha;

  assert("STALE base refused", (await post("promote", { ...(await pkgFor("ratified", 4)), base: sha1 })).reason, "CAS_STALE",
    "the lost-update floor, on real storage");
  assert("garbage base refused", (await post("promote", { ...(await pkgFor("ratified", 5)), base: "deadbeef" })).reason, "CAS_STALE");

  const live = await get(`image?id=${id}`);
  assert("live state is the winning revision", /rev 3/.test(live["bundle.md"]), true);
  assert("history holds the superseded revision", /rev 1/.test(live["_history/bundle_20260723T190000Z_livefire.md"] || ""), true);
  assert("the verbatim promotion record is projected", "_history/promotion_20260723T190000Z_livefire.json" in live, true,
    "classifyDivergence and C-20.1 both read these records; without them the checks are unreachable, not passing");
  assert("manifest projected", "_history/manifest.json" in live, true);

  const big = "x".repeat(1024 * 1024 + 1);
  const overPkg = await pkgFor("verified", 6, [{ path: "big.md", text: big, bytes: big.length, sha256: await sha256(big) }]);
  assert("oversize inline refused at the write", (await post("promote", { ...overPkg, base: sha2 })).reason, "OVERSIZE_INLINE");

  /* ---- the canary: a store that did nothing cannot pass this ---- */
  assert("canary nonce survived the round trip", new RegExp(NONCE).test(live["bundle.md"]), true,
    "proves the battery actually wrote and read real storage");

  /* ---- coordination ---- */
  const y = "9001";
  const a1 = await get(`allocid?prefix=LFIRE&year=${y}`);
  const a2 = await get(`allocid?prefix=LFIRE&year=${y}`);
  assert("allocid increments without gaps",
    Number(a2.id.split("-").pop()) - Number(a1.id.split("-").pop()), 1);
  const l1 = await get(`lease?id=${id}&actor=probe-a`);
  assert("lease returns live sha as edit base", l1.base, sha2);
  const l2 = await get(`lease?id=${id}&actor=probe-b`);
  assert("second actor denied while lease holds", l2.ok, false);

  /* ---- token hygiene: the two bootstrap hardenings, as livefire asserts ----
     An instance must never run on an empty credential or on any credential
     value that has ever been published in this repository. classify() already
     enforces both at request time; these assertions make a violation loud on
     the deployment itself. Unset tokens are legitimate only in the local
     credential-free suite, so each assertion is over configured tokens. */
  {
    /* PUBLIC_TOKEN is absent: there is no public token class. A value left in
       that binding authenticates nothing, so there is no credential to vet. */
    const names = ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"];
    const configured = names.filter((n) => typeof env[n] === "string" && env[n].length > 0);
    const published = [];
    for (const n of configured) {
      if (PUBLISHED_TOKEN_HASHES.has(await sha256(env[n]))) published.push(n);
    }
    assert("no configured token is a published repository value", published, []);
    assert("no configured token is shorter than 16 characters",
      configured.filter((n) => env[n].length < 16), []);
  }

  /* ---- R2 through the binding: no access key exists anywhere ----
     Absence is a first-class state, declared rather than silent: a group can
     run with no card and no buckets. Half a fence is still a defect. */
  const r2 = { ok: true, sizes: [] };
  const capturesBound = typeof env.CAPTURES?.get === "function";
  const publishedBound = typeof env.PUBLISHED?.get === "function";
  r2.configured = capturesBound && publishedBound;
  if (!r2.configured) {
    assert("R2 absence is symmetric: both buckets or neither", capturesBound, publishedBound,
      "one bucket bound without the other breaks the fence");
    assert("R2 not configured is declared, not silent", r2.configured, false);
  } else try {
    const key = `scratch/livefire-${NONCE}`;
    const payload = new TextEncoder().encode("capture bytes " + NONCE);
    await env.CAPTURES.put(key, payload, { sha256: await crypto.subtle.digest("SHA-256", payload) });
    const back = await env.CAPTURES.get(key);
    r2.roundTrip = (await back.text()).endsWith(NONCE);
    const h = await env.CAPTURES.head(key);
    r2.serverSideChecksum = h?.checksums?.sha256
      ? [...new Uint8Array(h.checksums.sha256)].map((x) => x.toString(16).padStart(2, "0")).join("") === (await sha256(payload))
      : "not returned";
    const ranged = await env.CAPTURES.get(key, { range: { offset: 0, length: 7 } });
    r2.rangeRead = (await ranged.text()) === "capture";
    await env.CAPTURES.delete(key);

    /* Throughput at BIO capture sizes. Every call asserted, and no number is
       reported for a call that did not verify byte-for-byte length. */
    for (const mb of [0.1, 1, 8, 25]) {
      const buf = new Uint8Array(Math.round(mb * 1024 * 1024)).fill(65);
      const k = `scratch/t-${mb}-${NONCE}`;
      const tp = Date.now(); await env.CAPTURES.put(k, buf); const putMs = Date.now() - tp;
      const tg = Date.now(); const g = await env.CAPTURES.get(k); const bytes = (await g.arrayBuffer()).byteLength; const getMs = Date.now() - tg;
      await env.CAPTURES.delete(k);
      if (bytes !== buf.length) { r2.sizes.push({ sizeMB: mb, error: "length mismatch, NO NUMBER REPORTED" }); r2.ok = false; continue; }
      r2.sizes.push({ sizeMB: mb, putMs, getMs, putMBps: +(mb / (putMs / 1000)).toFixed(1), getMBps: +(mb / (getMs / 1000)).toFixed(1) });
    }
    assert("R2 capture round trip through binding", r2.roundTrip, true);
    assert("R2 range read", r2.rangeRead, true);
  } catch (e) { r2.ok = false; r2.error = String(e && e.message || e); assert("R2 exercised without error", false, true); }

  /* ---- whole-store pass on real storage ---- */
  const tw = Date.now();
  const stats = await get("stats");
  const dang = await get("dangling");
  const wholeMs = Date.now() - tw;

  const passed = A.filter((a) => a.ok).length;
  return {
    ok: A.every((a) => a.ok) && r2.ok,
    ranAt: new Date().toISOString(),
    store: storeName, nonce: NONCE, totalMs: Date.now() - t0,
    summary: `${passed}/${A.length} assertions passed`,
    assertions: A,
    r2,
    storeState: { ...stats, danglingRefs: dang.dangling.length, wholeStorePassMs: wholeMs },
    note: "Confined to the scratch namespace. Live state is unreachable from this token class.",
  };
}

/* capture — the op handlers the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index` in T4.
 * Routing, authentication and the response envelope stay the control plane's: `json`, `storeSilent`,
 * `storageAbsent` and `requiredArgument` are passed in, with the stamps it decided (the caller class, the viewer, the
 * member). `store` is the Durable Object stub the op is scoped to. */
import { normalizeAddress } from "../subresources.mjs";

/* `{answered, result}` from a Durable Object answer: a body that is not the store's `{ok: true, result}` is not an
   answer, and a silence is never read as an empty result (REC-52). */
async function ask(store, path, init) {
  try {
    const out = await (await store.fetch(path, init)).json();
    return out && out.ok === true ? { answered: true, result: out.result } : { answered: false };
  } catch { return { answered: false }; }
}

/** R27, R29, D-701: op=links. `address=` what points at an address; `capture=` a document's outbound links with their
 *  verdicts; `host=` how a host's navigation changed between captures (R29's per-host read). Every row passes the
 *  caller's viewer before it is counted. */
export async function linksOp(url, store, { json, storeSilent, viewer }) {
  /* N90: the caller's page, forwarded; the route bounds a read the caller did not. */
  const v = `viewer=${encodeURIComponent(viewer ?? "")}`
    + ["limit", "after"].map((k) => (url.searchParams.get(k) ? `&${k}=${encodeURIComponent(url.searchParams.get(k))}` : "")).join("");
  const address = url.searchParams.get("address");
  const capture = url.searchParams.get("capture");
  const host = url.searchParams.get("host");
  let r;
  if (address) r = await ask(store, `http://x/linksto?address=${encodeURIComponent(normalizeAddress(address))}&${v}`);
  else if (host) r = await ask(store, `http://x/navchanges?host=${encodeURIComponent(host)}&${v}`);
  else if (/^[0-9a-f]{64}$/.test(capture || "")) r = await ask(store, `http://x/resolvelinks?capture=${capture}&${v}`);
  else return json({ ok: false, reason: "NEED_CAPTURE_OR_ADDRESS",
    detail: "pass capture=<sha256> for a document's outbound links, address=<url> for what points at it, "
          + "or host=<host> for how that host's navigation changed between captures" }, 400);
  if (!r.answered) return storeSilent("links");
  return json({ ok: true, ...r.result });
}

/** R21: op=capture, the evidence store by digest. A put whose body hashes to anything else is refused naming both
 *  digests; an object already held is not rewritten; a get answers the bytes (206 for a range). `key` is the
 *  object key of a digest in this store's namespace. */
export async function captureObjectOp(req, url, env, { json, storageAbsent, requiredArgument, key, storeName, cls }) {
  if (typeof env.CAPTURES?.get !== "function") return storageAbsent("capture", "R2 is not configured on this instance");
  const sha = (url.searchParams.get("sha256") || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, ...requiredArgument("capture", "sha256", "<64 lowercase hex>",
      "capture requires sha256=<64 lowercase hex>") }, 400);
  const k = key(sha);
  if (req.method === "PUT" || req.method === "POST") {
    const body = new Uint8Array(await req.arrayBuffer());
    const d = await crypto.subtle.digest("SHA-256", body);
    const digest = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
    if (digest !== sha)
      return json({ ok: false, reason: "INTEGRITY", detail: "body hash does not match the sha256 parameter",
                    expected: sha, got: digest, store: storeName, tokenClass: cls }, 400);
    const existing = await env.CAPTURES.head(k);
    if (existing) return json({ ok: true, sha256: sha, bytes: existing.size, existed: true, store: storeName, tokenClass: cls });
    await env.CAPTURES.put(k, body, { sha256: d });
    return json({ ok: true, sha256: sha, bytes: body.length, existed: false, store: storeName, tokenClass: cls });
  }
  const wantRange = req.headers.get("range");
  const obj = await env.CAPTURES.get(k, wantRange ? { range: req.headers } : undefined);
  const dl = (url.searchParams.get("dl") || "").replace(/[^\w.\- ]/g, "").slice(0, 120);
  if (!obj) return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);
  return new Response(obj.body, {
    status: wantRange ? 206 : 200,
    headers: { "content-type": "application/octet-stream", "access-control-allow-origin": "*", "x-capture-sha256": sha,
               ...(dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}) },
  });
}

/** R3: op=archivelookup, forwarded to the service. */
export async function archiveLookupOp(req, url, store, { json, storeSilent }) {
  const body = req.method === "POST" ? await req.json().catch(() => null) : null;
  const address = body?.address || url.searchParams.get("address");
  const r = await ask(store, "http://x/archivelookup", { method: "POST", headers: { "content-type": "application/json" },
                                                         body: JSON.stringify({ address }) });
  if (!r.answered) return storeSilent("archivelookup");
  return json(r.result.body, r.result.status);
}

/** R1–R20, K72 (11): op=acquire, forwarded to the service with the control plane's stamps. Answers `{response}`
 *  (a refusal, a silence) or `{answer}`, the filed capture's answer, which `extraction` reads from the stored primary
 *  itself (R42, K49; N103: no second read of the primary here). */
export async function acquireOp(req, env, store, { json, storeSilent, storageAbsent, cls, member, sessMember, storeName }) {
  if (req.method !== "POST") return { response: json({ ok: false, error: "acquire is a POST" }, 405) };
  if (typeof env.CAPTURES?.put !== "function")
    return { response: storageAbsent("acquire", "this instance has no evidence storage configured") };
  const body = await req.json().catch(() => null);
  const q = new URLSearchParams({ cls: cls || "", member: member ? "1" : "0", sessMember: sessMember || "", store: storeName || "bio" });
  const r = await ask(store, `http://x/acquire?${q}`, { method: "POST", headers: { "content-type": "application/json" },
                                                         body: JSON.stringify(body || {}) });
  if (!r.answered) return { response: storeSilent("acquire") };
  const { status, body: answer } = r.result;
  if (!answer || answer.ok !== true || !answer.document) return { response: json(answer, status) };
  return { answer };
}

/** K72 (8): the op's answer, the reading block's findings placed on the document beside the profile, as the answer
 *  always carried them. */
export function withReading(answer, { reading, textUnits, textUnitsOverBound }) {
  const { file, locator, retrieved, profile, ...rest } = answer.document;
  return { ...answer, document: { file, locator, retrieved, profile, reading,
    ...(textUnits ? { text_units: textUnits } : {}), ...(textUnitsOverBound ? { text_units_over_bound: textUnitsOverBound } : {}),
    ...rest } };
}

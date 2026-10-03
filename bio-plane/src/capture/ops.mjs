/* capture — the op handlers the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index` in T4.
 * Routing, authentication and the response envelope stay the control plane's: `json`, `storeSilent`,
 * `storageAbsent`, `requiredArgument`, `doAnswer` (the one reader of a Durable Object's envelope, N247: a body
 * that is not the store's `{ok: true, result}` is not an answer, and a silence is never read as an empty result,
 * REC-52) and `storeRefusal` (control-plane R23's relay of the store's own refusal) are passed in, with the stamps it
 * decided (the caller class, the viewer, the member). `store` is the Durable Object stub the op is scoped to. */
import { normalizeAddress } from "../subresources.mjs";
import { CAPTURE_CHECKS } from "./checks.mjs";
import { ACQUIRE_GRADE_NOTE } from "../acquisition/index.mjs";

/** R64 (N339, K421): the one way this module's handlers answer what `doAnswer` read that was not an answer. The
 *  store's own refusal (`refused`: `ok: false` below 500, control-plane R23) is relayed with the store's status, code
 *  and sentence, through the caller's `storeRefusal` when it hands one, else as the same answer composed here
 *  (`json(reply.body, reply.status)`, which is what `storeRefusal` answers); only a reply that is no answer is
 *  `storeSilent(op)`, carrying the correlation id `doAnswer` read from the store's internal error, when it gave one
 *  (control-plane R25; N349). A sub-read inside a longer act is relayed the same way (K444). Null when `out` is an
 *  answer. */
export function relayUnanswered(out, op, { json, storeSilent, storeRefusal }) {
  if (out.refused && out.reply)
    return typeof storeRefusal === "function" ? storeRefusal(out) : json(out.reply.body, out.reply.status);
  if (!out.answered) return storeSilent(op, out.correlation);
  return null;
}

/** R27, R29, D-701: op=links. `address=` what points at an address; `capture=` a document's outbound links with their
 *  verdicts; `host=` how a host's navigation changed between captures (R29's per-host read). Every row passes the
 *  caller's viewer before it is counted. */
export async function linksOp(url, store, { json, storeSilent, storeRefusal, doAnswer, viewer }) {
  /* N90: the caller's page, forwarded; the route bounds a read the caller did not. */
  const v = `viewer=${encodeURIComponent(viewer ?? "")}`
    + ["limit", "after"].map((k) => (url.searchParams.get(k) ? `&${k}=${encodeURIComponent(url.searchParams.get(k))}` : "")).join("");
  const address = url.searchParams.get("address");
  const capture = url.searchParams.get("capture");
  const host = url.searchParams.get("host");
  let r;
  if (address) r = await doAnswer(store.fetch(`http://x/linksto?address=${encodeURIComponent(normalizeAddress(address))}&${v}`));
  else if (host) r = await doAnswer(store.fetch(`http://x/navchanges?host=${encodeURIComponent(host)}&${v}`));
  else if (/^[0-9a-f]{64}$/.test(capture || "")) r = await doAnswer(store.fetch(`http://x/resolvelinks?capture=${capture}&${v}`));
  else return json({ ok: false, reason: "NEED_CAPTURE_OR_ADDRESS",
    detail: "pass capture=<sha256> for a document's outbound links, address=<url> for what points at it, "
          + "or host=<host> for how that host's navigation changed between captures" }, 400);
  const unanswered = relayUnanswered(r, "links", { json, storeSilent, storeRefusal });
  if (unanswered) return unanswered;
  return json({ ok: true, ...r.result });
}

/* R63 (N285, K275): the fields `evidenceAbsent` fixes, which a caller's `extra` adds beside and never replaces. */
const EVIDENCE_ABSENT_FIXED = new Set(["ok", "reason", "code", "check", "translation", "sha256", "store"]);

/** R63: THE one answer to one condition, no evidence object is held under a digest, so the code is minted at one site:
 *  this module's R21 get and extraction's R31 answer through it. Answers `{status: 404, body}`, the body
 *  `{ok: false, reason: "EVIDENCE_NOT_HELD", code, check, translation, sha256, store}` and a caller's `extra` fields
 *  beside them; the control plane's envelope sends it. The code was `NOT_FOUND`, a word any module could mint, so the
 *  door could not read this row without lending it to them (N347, K440); its row (C-118.1) and sentence are
 *  unchanged. It writes nothing and never throws. */
export function evidenceAbsent(sha, store, extra = null) {
  let own = [];
  try {
    if (extra && typeof extra === "object" && !Array.isArray(extra))
      own = Object.entries(extra).filter(([k]) => !EVIDENCE_ABSENT_FIXED.has(k));
  } catch { own = []; }
  /* DEC-49 REGION is-evidence-held */
  const row = CAPTURE_CHECKS.EVIDENCE_NOT_HELD;
  return { status: 404, body: { ok: false, reason: "EVIDENCE_NOT_HELD", code: "EVIDENCE_NOT_HELD", check: row.check,
                                translation: row.translation, sha256: sha ?? null, store: store ?? null,
                                ...Object.fromEntries(own) } };
  /* END DEC-49 REGION is-evidence-held */
}

/** R21: op=capture, the evidence store by digest. A put whose body hashes to anything else is refused naming both
 *  digests; an object already held is not rewritten; a get answers the bytes (206 for a range) or R63's absence.
 *  `key` is the object key of a digest in this store's namespace. */
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
  if (!obj) { const a = evidenceAbsent(sha, storeName, { tokenClass: cls }); return json(a.body, a.status); }
  return new Response(obj.body, {
    status: wantRange ? 206 : 200,
    headers: { "content-type": "application/octet-stream", "access-control-allow-origin": "*", "x-capture-sha256": sha,
               ...(dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}) },
  });
}

/* ---- the archive fallback's decision half (D-99 / ARCHIVE-FALLBACK.md) ----
 *
 * ARCHIVE.ORG IS A BACKUP SOURCE, NEVER A PRIMARY ONE (RULED). This refuses
 * unless the source-failure counter says the document has actually been
 * unreachable: three consecutive failures the SOURCE produced, or a failing
 * run of fourteen days. D-104's exclusion is what makes that fence mean
 * something, because our own governor declining to ask never advances it.
 * Without the fence, sustained politeness would load somebody else's
 * infrastructure to solve a problem we made.
 *
 * It fetches through the same governor as everything else, and its host
 * appetite is set conservatively from THEIR published figures rather than
 * discovered by probing for the wall. Bob, 2026-07-31: there is no need to
 * push traffic to the breaking point; there is plenty of time.
 * (Moved from `legacy-index` beside the op's call, N247.) */
/** R73 (`acquisition` R3): op=archivelookup, forwarded to the service. */
export async function archiveLookupOp(req, url, store, { json, storeSilent, storeRefusal, doAnswer }) {
  const body = req.method === "POST" ? await req.json().catch(() => null) : null;
  const address = body?.address || url.searchParams.get("address");
  const r = await doAnswer(store.fetch("http://x/archivelookup", { method: "POST", headers: { "content-type": "application/json" },
                                                                   body: JSON.stringify({ address }) }));
  const unanswered = relayUnanswered(r, "archivelookup", { json, storeSilent, storeRefusal });
  if (unanswered) return unanswered;
  return json(r.result.body, r.result.status);
}

/* Acquisition: the fetch layer the intake doctrine calls M2'.
 *
 * What it produces is Grade B and says so. The doctrine's Section 3 is
 * precise: Grade B is "the document bytes as fetched by a capable surface,
 * hashed at receipt, with locator and instant", and Grade A requires a WACZ
 * or equivalent chain-of-custody capture of the source as served, which a
 * Worker cannot produce. Claiming A here would be the one thing the grading
 * scheme exists to prevent, since "a claim about evidence is only as strong
 * as its weakest named layer".
 *
 * It writes no bundle state. The doctrine: "No intake path writes live
 * state; the daemon and the member are writers like every writer." So this
 * returns a provenance document and the caller promotes it.
 * (Moved from `legacy-index` beside the op's call, N247.) */
/** R73 (`acquisition` R1–R23), K72 (11): op=acquire, forwarded to the service with the control plane's stamps. Answers `{response}`
 *  (a refusal, a silence) or `{answer}`, the filed capture's answer, which `extraction` reads from the stored primary
 *  itself (`acquisition` R8, K49; N103: no second read of the primary here). */
export async function acquireOp(req, env, store, { json, storeSilent, storeRefusal, storageAbsent, doAnswer, cls, member, sessMember,
                                                    storeName }) {
  if (req.method !== "POST") return { response: json({ ok: false, error: "acquire is a POST" }, 405) };
  if (typeof env.CAPTURES?.put !== "function")
    return { response: storageAbsent("acquire", "this instance has no evidence storage configured") };
  const body = await req.json().catch(() => null);
  const q = new URLSearchParams({ cls: cls || "", member: member ? "1" : "0", sessMember: sessMember || "", store: storeName || "bio" });
  const r = await doAnswer(store.fetch(`http://x/acquire?${q}`, { method: "POST", headers: { "content-type": "application/json" },
                                                                   body: JSON.stringify(body || {}) }));
  const unanswered = relayUnanswered(r, "acquire", { json, storeSilent, storeRefusal });
  if (unanswered) return { response: unanswered };
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

/** The legacy-index map's §4.4 plain move (K649 (7)): the dispatch of this module's gated ops, `links`, `capture`,
 *  `archivelookup` and `acquire`, moved out of `src/index.mjs`. The control plane routes and authenticates and hands in
 *  what it decided: its envelope helpers (`json`, `storeSilent`, `storeRefusal`, `doAnswer`, `storageAbsent`,
 *  `requiredArgument`), its stamps (`cls`, `member`: a member session, `sessMember`, `viewer`, `storeName`), `key` (a
 *  digest's object key in this store's namespace), `store()` (the Durable Object stub the op is scoped to, reached only
 *  by an op that asks the store) and `readAcquired(answer, store)`, the reading of what an acquire filed, which is
 *  `extraction`'s (its `acquireReadingOp`, a later module this one cannot import): the op forwards to the acquisition,
 *  hands the filed document to the reader and adds only the grade note, running no reading of its own (K72 (8), N265).
 *  Answers the op's Response, or null for an op that is not one of these four. */
export async function captureOp(op, req, url, env, store, h) {
  const { json, storeSilent, storeRefusal, doAnswer } = h;
  if (op === "links") return linksOp(url, store(), { json, storeSilent, storeRefusal, doAnswer, viewer: h.viewer });
  if (op === "capture")
    return captureObjectOp(req, url, env, { json, storageAbsent: h.storageAbsent, requiredArgument: h.requiredArgument, key: h.key,
                                            storeName: h.storeName, cls: h.cls });
  if (op === "archivelookup") return archiveLookupOp(req, url, store(), { json, storeSilent, storeRefusal, doAnswer });
  if (op === "acquire") {
    const at = store();
    const acquired = await acquireOp(req, env, at, { json, storeSilent, storeRefusal, storageAbsent: h.storageAbsent, doAnswer,
                                                     cls: h.cls, member: h.member, sessMember: h.sessMember, storeName: h.storeName });
    if (acquired.response) return acquired.response;
    const read = await h.readAcquired(acquired.answer, at);
    if (read.response) return read.response;
    return json(Object.assign(read.body, { note: ACQUIRE_GRADE_NOTE }), 200);
  }
  return null;
}

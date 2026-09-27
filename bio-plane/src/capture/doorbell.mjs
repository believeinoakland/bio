/* capture — the doorbell (Intake Doctrine §2a): anyone may hand the group material, with no account. The op's
 * handler (moved from `legacy-index` in T4, K98) refuses what it will not read before the store is called
 * (R49–R51, in R53's order) and hands the rest to the store side (`Capture#knock`, R31, R32, R54). A knock is not a
 * capture and not a bundle: it lands in the inbox, which only a signed-in member reads. The response envelope,
 * `requiredArgument` and the store-silence refusal are the control plane's, passed in by the caller. */
import { KNOCK_CHECKS } from "../../checks/bio-checks.mjs";

/* R31, R49, R50. The limits the instance runs, and D-496's published sentences BUILT FROM THEM, so the words and
   the numbers cannot drift apart (BOB #32: a published limit is a BOUND). "Estimated by a sliding window" because
   the two-bucket estimate IS approximate. */
export const KNOCK = {
  windowMs: 10 * 60 * 1000,
  perIp: 12,                   // knocks per source per window
  global: 300,                 // knocks per instance per window; bounds hostile writes to the evidence store
  maxBytes: 8 * 1024 * 1024,   // with an evidence store: enough for a captured PDF
  maxInline: 64 * 1024,        // without one: inline into the store, small only
};
KNOCK.statedPerIp =
  `at most ${KNOCK.perIp} knocks from one source in any ${KNOCK.windowMs / 60000} minutes, estimated by a sliding window`;
KNOCK.statedGlobal =
  `at most ${KNOCK.global} knocks to this instance in any ${KNOCK.windowMs / 60000} minutes, estimated by a sliding window`;

/* D-513 / DEC-49 — THE THREE REFUSALS THE DOORBELL MAKES BEFORE THE STORE IS EVER CALLED, each behind ONE governed
 * helper. The envelope refusal and the payload refusal are TWO CONDITIONS with two remedies, so two codes: the
 * first refuses a request body this door will not read at all; the second refuses decoded material larger than THIS
 * INSTANCE can hold. THE CODE IS A STRING LITERAL AT ITS SITE (DEC-49's rule, so the guard can compare it against
 * the row). Each helper THROWS on a missing row (R52): a code with no sentence must not reach a knocker. */
export function knockEnvelopeTooLarge() {
  /* DEC-49 REGION is-knock-envelope-too-large — D-513 / C-85.3. */
  const row = KNOCK_CHECKS.KNOCK_ENVELOPE_TOO_LARGE;
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error("knockEnvelopeTooLarge: KNOCK_ENVELOPE_TOO_LARGE has no KNOCK_CHECKS row with a "
                  + "canned translation (DEC-49). A code with no sentence behind it must not reach a knocker.");
  return { ok: false, reason: "KNOCK_ENVELOPE_TOO_LARGE", code: "KNOCK_ENVELOPE_TOO_LARGE",
           check: row.check, translation: row.translation, maxBytes: KNOCK.maxBytes };
  /* END DEC-49 REGION is-knock-envelope-too-large */
}

export function knockPayloadTooLarge(cap, evidence) {
  /* DEC-49 REGION is-knock-payload-too-large — D-513 / C-85.4. `detail` is this instance's own sentence and is
     carried only when there is no evidence storage; the translation is the knocker's answer in every instance. */
  const row = KNOCK_CHECKS.KNOCK_PAYLOAD_TOO_LARGE;
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error("knockPayloadTooLarge: KNOCK_PAYLOAD_TOO_LARGE has no KNOCK_CHECKS row with a "
                  + "canned translation (DEC-49). A code with no sentence behind it must not reach a knocker.");
  return { ok: false, reason: "KNOCK_PAYLOAD_TOO_LARGE", code: "KNOCK_PAYLOAD_TOO_LARGE",
           check: row.check, translation: row.translation, maxBytes: cap,
           detail: evidence ? undefined : "this instance stores knocks inline; large material needs its evidence storage configured" };
  /* END DEC-49 REGION is-knock-payload-too-large */
}

export function knockEmpty() {
  /* DEC-49 REGION is-knock-empty — D-513 / C-85.5. */
  const row = KNOCK_CHECKS.KNOCK_EMPTY;
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error("knockEmpty: KNOCK_EMPTY has no KNOCK_CHECKS row with a canned translation "
                  + "(DEC-49). A code with no sentence behind it must not reach a knocker.");
  return { ok: false, reason: "KNOCK_EMPTY", code: "KNOCK_EMPTY", check: row.check, translation: row.translation };
  /* END DEC-49 REGION is-knock-empty */
}

/** op=knock (R30–R32, R47–R54). `store` is the Durable Object stub; `json`, `requiredArgument` and `storeSilent`
 *  are the control plane's. The refusals are tried in R53's order and the first that applies answers. */
export async function knockOp(req, env, store, { json, requiredArgument, storeSilent }) {
  if (req.method !== "POST") return json({ ok: false, error: "knock is a POST" }, 405);
  const raw = await req.arrayBuffer();
  if (raw.byteLength > KNOCK.maxBytes + 4096) return json(knockEnvelopeTooLarge(), 413);
  let body; try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
  if (!body || (typeof body.contentB64 !== "string" && typeof body.contentText !== "string"))
    return json({ ok: false, ...requiredArgument("knock", "contentB64 or contentText",
      "a JSON body with contentB64=<base64> or contentText=<text>",
      "knock requires contentB64 or contentText, plus optional note and contact") }, 400);
  let bytes;
  try {
    bytes = typeof body.contentB64 === "string"
      ? Uint8Array.from(atob(body.contentB64), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(body.contentText);
  } catch { return json({ ok: false, ...requiredArgument("knock", "contentB64", "<base64>", "contentB64 is not valid base64") }, 400); }
  if (bytes.length === 0) return json(knockEmpty(), 400);
  const evidence = typeof env.CAPTURES?.put === "function";
  const cap = evidence ? KNOCK.maxBytes : KNOCK.maxInline;
  if (bytes.length > cap) return json(knockPayloadTooLarge(cap, evidence), 413);
  const source = req.headers.get("cf-connecting-ip") || "unknown";
  let out = null;
  try {
    out = await (await store.fetch(new Request(`http://do/knock?source=${encodeURIComponent(source)}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ contentB64: typeof body.contentB64 === "string" ? body.contentB64 : null,
                             content: typeof body.contentB64 === "string" ? null : body.contentText,
                             note: body.note, contact: body.contact, windowMs: KNOCK.windowMs,
                             perIpLimit: KNOCK.perIp, globalLimit: KNOCK.global,
                             /* D-487: the window's instant is the control plane's, read once, as it always was. */
                             now: Date.now() }) }))).json();
  } catch { out = null; }
  /* REC-52: a store that did not answer is silence, never a rate refusal: 429 would tell a stranger they knocked
     too often when nobody counted. */
  if (!out || out.ok !== true) return storeSilent("knock");
  const rec = out.result || {};
  if (!rec.ok) {
    if (rec.reason === "RATE_IP" || rec.reason === "RATE_GLOBAL")
      return json({ ok: false, ...rec, stated: rec.reason === "RATE_IP" ? KNOCK.statedPerIp : KNOCK.statedGlobal }, 429);
    return json({ ok: false, ...rec }, rec.status || 502);
  }
  return json({ ok: true, knockId: rec.knockId, sha256: rec.sha256, bytes: rec.bytes,
                received: "Your material is in the group's inbox awaiting member review." }, 200);
}

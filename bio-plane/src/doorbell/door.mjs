/* doorbell — the door (Intake Doctrine §2a): anyone may hand the group material, with no account. The op's handler,
 * copied whole from `capture/doorbell.mjs` (K624; `build/extraction/capture-split.md` §2), refuses what it will not read
 * before the store is called (R6–R8 and R14's weak secret, in R10's order) and hands the rest to the store side
 * (`Doorbell#knock`, R2, R3, R11). A knock is not a capture and not a bundle: it lands in the inbox, which only a
 * signed-in member reads. The response envelope, `requiredArgument`, the store-silence refusal and the Durable Object
 * envelope's reader (`doAnswer`, N247) are the control plane's, passed in by the caller; the store's own refusal is
 * relayed through `capture`'s `relayUnanswered` (R24), never a second copy of it. */
import { relayUnanswered } from "../capture/ops.mjs";
import { DOORBELL_CHECKS, KNOCK_CHECKS } from "./checks.mjs";

/* R2, R6, R7. The limits the instance runs, and D-496's published sentences BUILT FROM THEM, so the words and
   the numbers cannot drift apart (BOB #32: a published limit is a BOUND). "Estimated by a sliding window" because
   the two-bucket estimate IS approximate. The two rate limits are Bob's (DEC-108 (3), K1019): 5 from one source and
   10 to the whole doorbell in any 10 minutes. */
export const KNOCK = {
  windowMs: 10 * 60 * 1000,
  perIp: 5,                    // knocks per source per window (DEC-108 (3))
  global: 10,                  // knocks per instance per window (DEC-108 (3)); bounds hostile writes to the evidence store
  maxBytes: 8 * 1024 * 1024,   // with an evidence store: enough for a captured PDF
  maxInline: 64 * 1024,        // without one: inline into the store, small only
};
KNOCK.statedPerIp =
  `at most ${KNOCK.perIp} knocks from one source in any ${KNOCK.windowMs / 60000} minutes, estimated by a sliding window`;
KNOCK.statedGlobal =
  `at most ${KNOCK.global} knocks to this group's inbox in any ${KNOCK.windowMs / 60000} minutes, estimated by a sliding window`;

/* D-513 / DEC-49 — THE THREE REFUSALS THE DOORBELL MAKES BEFORE THE STORE IS EVER CALLED, each behind ONE governed
 * helper. The envelope refusal and the payload refusal are TWO CONDITIONS with two remedies, so two codes: the
 * first refuses a request body this door will not read at all; the second refuses decoded material larger than THIS
 * INSTANCE can hold. THE CODE IS A STRING LITERAL AT ITS SITE (DEC-49's rule, so the guard can compare it against
 * the row). Each helper THROWS on a missing row (R9): a code with no sentence must not reach a knocker. */
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
           detail: evidence ? undefined : "this group's inbox stores knocks inline; large material needs its evidence storage configured" };
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

/* R14 (N364): the shortest knocker secret the doorbell accepts, in characters (K497: at least 20). A shorter one could
   be guessed, and whoever guessed it would continue the knocker's pseudonym. */
export const KNOCKER_SECRET_MIN = 20;

/** R14: whether a supplied `knockerSecret` is refused. Absent (undefined or null) is no secret, never weak; anything
 *  else that is not a string of at least `KNOCKER_SECRET_MIN` characters is weak. */
export function isWeakKnockerSecret(secret) {
  if (secret === undefined || secret === null) return false;
  return typeof secret !== "string" || [...secret].length < KNOCKER_SECRET_MIN;
}

/** R14, C-118.3: the one site `KNOCKER_SECRET_WEAK` is minted; the handler and the store side both answer through it.
 *  Nothing is received, stored or counted. */
export function knockerSecretWeak() {
  /* DEC-49 REGION is-knocker-secret-strong — N364 / C-118.3. */
  const row = DOORBELL_CHECKS.KNOCKER_SECRET_WEAK;
  return { ok: false, reason: "KNOCKER_SECRET_WEAK", code: "KNOCKER_SECRET_WEAK", check: row.check,
           translation: row.translation, minChars: KNOCKER_SECRET_MIN };
  /* END DEC-49 REGION is-knocker-secret-strong */
}

/** op=knock (R1–R11, R14, R20, R24). `store` is the Durable Object stub; `json`, `requiredArgument`,
 *  `storeSilent`, `storeRefusal` and `doAnswer` (the one reader of a Durable Object's envelope, N247) are the control
 *  plane's, and so is `country` (R20: Cloudflare's two-letter label for the request as the control plane read it, or
 *  null; never read from the body). The refusals are tried in R10's order and the first that applies answers. */
export async function knockOp(req, env, store, { json, requiredArgument, storeSilent, storeRefusal, doAnswer, country = null }) {
  if (req.method !== "POST") return json({ ok: false, error: "knock is a POST" }, 405);
  const place = typeof country === "string" && country ? country : null;
  const stamp = place ? `&country=${encodeURIComponent(place)}` : "";
  /* R19, R20: a knock refused here, before the store is asked to keep anything, is counted in the doorbell's tally and
     the security tally and nowhere else; the counts are the store's, and their failure never changes the refusal's
     answer. */
  const refuse = async (answer, status) => { await tallyRefusal(store, doAnswer, place); return json(answer, status); };
  const raw = await req.arrayBuffer();
  if (raw.byteLength > KNOCK.maxBytes + 4096) return refuse(knockEnvelopeTooLarge(), 413);
  let body; try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
  if (!body || (typeof body.contentB64 !== "string" && typeof body.contentText !== "string"))
    return refuse({ ok: false, ...requiredArgument("knock", "contentB64 or contentText",
      "a JSON body with contentB64=<base64> or contentText=<text>",
      "knock requires contentB64 or contentText, plus optional note and contact") }, 400);
  let bytes;
  try {
    bytes = typeof body.contentB64 === "string"
      ? Uint8Array.from(atob(body.contentB64), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(body.contentText);
  } catch { return refuse({ ok: false, ...requiredArgument("knock", "contentB64", "<base64>", "contentB64 is not valid base64") }, 400); }
  if (bytes.length === 0) return refuse(knockEmpty(), 400);
  const evidence = typeof env.CAPTURES?.put === "function";
  const cap = evidence ? KNOCK.maxBytes : KNOCK.maxInline;
  if (bytes.length > cap) return refuse(knockPayloadTooLarge(cap, evidence), 413);
  /* R10, R14: a weak knocker secret after oversize content and before the rate: nothing is received, and nothing
     counted but R19's tally. */
  if (isWeakKnockerSecret(body.knockerSecret)) return refuse(knockerSecretWeak(), 400);
  const source = req.headers.get("cf-connecting-ip") || "unknown";
  const out = await doAnswer(store.fetch(new Request(`http://do/knock?source=${encodeURIComponent(source)}${stamp}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentB64: typeof body.contentB64 === "string" ? body.contentB64 : null,
                           content: typeof body.contentB64 === "string" ? null : body.contentText,
                           note: body.note, contact: body.contact, windowMs: KNOCK.windowMs,
                           ...(typeof body.knockerSecret === "string" ? { knockerSecret: body.knockerSecret } : {}),
                           ...(body.generateSecret === true ? { generateSecret: true } : {}),
                           perIpLimit: KNOCK.perIp, globalLimit: KNOCK.global,
                           /* D-487: the window's instant is the control plane's, read once, as it always was. */
                           now: Date.now() }) })));
  /* REC-52: a store that did not answer is silence, never a rate refusal: 429 would tell a stranger they knocked
     too often when nobody counted. R24: the store's own refusal is relayed at its status, never as that silence. */
  const unanswered = relayUnanswered(out, "knock", { json, storeSilent, storeRefusal });
  if (unanswered) return unanswered;
  const rec = out.result || {};
  if (!rec.ok) {
    if (rec.reason === "RATE_IP" || rec.reason === "RATE_GLOBAL")
      return json({ ok: false, ...rec, stated: rec.reason === "RATE_IP" ? KNOCK.statedPerIp : KNOCK.statedGlobal }, 429);
    return json({ ok: false, ...rec }, rec.status || 502);
  }
  /* R11, R14: the pseudonym (null without a secret), and a secret the doorbell made shown in this answer only. */
  return json({ ok: true, knockId: rec.knockId, sha256: rec.sha256, bytes: rec.bytes,
                received: "Your material is in the group's inbox awaiting member review.",
                pseudonym: typeof rec.pseudonym === "string" ? rec.pseudonym : null,
                ...(typeof rec.secret === "string" ? { secret: rec.secret } : {}) }, 200);
}

/* R19, R20: count one refusal the handler made in the store's tallies (`doorbellrefused`), the country as a stamp in
   the query. Whatever the store answers, or if it does not, the refusal is answered as it was: a count that cannot be
   written changes nothing. */
async function tallyRefusal(store, doAnswer, country = null) {
  try {
    await doAnswer(store.fetch(new Request(`http://do/doorbellrefused${country ? `?country=${encodeURIComponent(country)}` : ""}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ now: Date.now() }) })));
  } catch { /* the tally is status, never a gate */ }
}

/** The dispatch of this module's one public op, `knock` (the door anyone may ring, with no token and no session), as
 *  `capture`'s `capturePublicOp` dispatched it (K649 (7)), renamed for this module (the map's §2). Kept apart from the
 *  gated ops so that nothing but the doorbell is reachable before authentication. Answers `knockOp`'s Response, or null
 *  for another op. */
export function doorbellPublicOp(op, req, env, store, hooks) {
  return op === "knock" ? knockOp(req, env, store, hooks) : null;
}

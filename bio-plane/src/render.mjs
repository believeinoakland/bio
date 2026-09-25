/* D-64 — THE RENDER ARM'S PURE HALF: what a rendered capture RECORDS, and whose
 * authority it carries.
 *
 * Design: `docs/development/CLIENT-RENDERED.md` §"What must be recorded on a
 * rendered capture", its "DESIGNED 2026-09-21" item 3 (the authority rule), BOB #31
 * (2026-09-23: third-party scripts are ALLOWED and every one is RECORDED; a script
 * set that cannot be recorded is `undetermined`) and BOB #32 (2026-09-23: the
 * method is `rendered`; one capture holds BOTH artifacts with the RENDERED document
 * primary and the shell beside it under its own digest; an unattended render within
 * the daily allowance, DEFERRED when it is spent, never the shell as content).
 *
 * THIS MODULE IS PURE, AND THAT IS THE SEAM. It never touches a browser, a binding,
 * R2 or the store. `index.mjs`'s acquire arm asks a RENDERER (see `rendererFor`) for
 * an answer in the shape `RENDER_ANSWER` documents, and hands that answer here.
 * Everything the record says about the render is derived HERE from that answer and
 * from what the plane itself fetched and hashed — so a suite can drive every rule
 * below with an injected renderer, and the live renderer only has to produce facts.
 *
 * WHAT THE PLANE CANNOT CHECK, STATED BECAUSE IT IS LOAD-BEARING: the renderer's
 * list of requests and executed scripts is the RENDERER'S CLAIM. The plane hashes
 * the rendered document it is handed and, since D-529 (BOB #33, 2026-09-24 21:05Z),
 * each subresource BODY the renderer hands over, which it keeps beside the capture
 * (`keepRenderBodies`). CORRECTED by D-529: this read *"A `sha256` on a
 * `render.data` entry is carried as the renderer reported it"* — the rule the ruling
 * replaced. A digest the renderer only REPORTED is now `renderer_sha256`, its claim,
 * and the digest itself reads `undetermined` with its reason. Whether the browser's
 * bytes are what the ORIGIN served is still the renderer's claim.
 */
import { originOf, SUBRESOURCE_CAP, SUBRESOURCE_MAX, SUBRESOURCE_BUDGET } from "./subresources.mjs";
import { browserBindingRenderer } from "./browserrender.mjs";

/* The environment this instance asks for. Recorded on every capture whether or not
   the renderer honoured it: `render.*` carries what the renderer SAID it used, and
   `render.asked` what was asked, so a disagreement is visible rather than averaged. */
export const RENDER_DEFAULTS = Object.freeze({
  /* D-492: THE NAVIGATION BOUND, ASKED OF THE RENDERER AND RESERVED AGAINST THE
     ALLOWANCE. A render's maximum browser cost is the time it may spend getting to
     the page plus the time the wait condition may burn once there, so the two
     together are what `renderReserveMs` reserves at admission. CHOSEN, NOT MEASURED,
     and stated as chosen for the same reason the daily allowance is: no instrument
     here has timed a navigation, and no platform enforces this number for us. What
     it buys is that the reservation is a bound the renderer was ASKED to hold, not
     one this module invented for the arithmetic — a renderer that overruns its own
     asked bounds overruns the reservation too, and `renderSpend` then records the
     time it REPORTED, which is the only figure the plane ever has. */
  navigation_timeout_ms: 30000,
  viewport: Object.freeze({ width: 1280, height: 800 }),
  dpr: 1,
  locale: "en-US",
  timezone: "UTC",
  wait: Object.freeze({ until: "networkidle", timeout_ms: 15000 }),
});

/* The render method string BOB #32 ruled. The shell keeps its own method. */
export const RENDERED_METHOD = "rendered";

/* D-499 — WHICH WAIT FIRED, AND WHAT THAT SAYS ABOUT COMPLETENESS.
 *
 * BOB #32, 2026-09-24 (QUEUE.md D-64's `owed-at-integration:` line, coord
 * a04264b8; cited here until BOB folds it into CLIENT-RENDERED.md
 * §"What must be recorded on a rendered capture", whose Incomplete sections
 * record this as a DESIGN GAP today): a render whose wait fired on its TIMEOUT
 * keeps the capture's GRADE — grade is the chain, and the method is recorded —
 * while the rendered document's COMPLETENESS is UNDETERMINED. It is never
 * presented as the whole page, and it is never refused.
 *
 * COMPLETENESS IS NOT AUTHORITY AND DOES NOT TOUCH IT. `renderedAuthority`
 * below answers WHOSE the bytes are; this answers WHETHER they are the whole
 * page. A timed-out render of a page whose data and code are all the host's is
 * still `determined` as the host, and an authority-undetermined render whose
 * condition met is still complete. Two axes, deliberately not averaged.
 *
 * THE CLASSIFICATION IS THE PLANE'S; THE WORD IS THE RENDERER'S. `wait.fired`
 * keeps the renderer's own word — "networkidle", a selector, "timeout" — because
 * the design asks for WHICH condition ended the render and a two-valued field
 * would throw that away. `wait.fired_class` is what the plane DERIVES from it,
 * and it is THREE-valued on purpose:
 *
 *   "condition"     the word IS the condition this plane asked for;
 *   "timeout"       the word names the timeout;
 *   "undetermined"  anything else, INCLUDING a word this module has never seen.
 *
 * INVERTED rather than listed (WORKER.md, "invert, do not lengthen a list"): the
 * plane asks for exactly ONE condition, so the only two things it can honestly
 * recognise are "the condition I asked for fired" and "the timeout fired". A
 * third word is NAMED as unclassified rather than scored as either — reading it
 * as `condition` would claim a completeness nothing measured, and reading it as
 * `timeout` would take a completeness away from a render that had one. WHAT THIS
 * CANNOT SEE: whether the renderer's word is TRUE. It is the renderer's claim,
 * like its request and script lists; the plane hashes only the document. */
const TIMEOUT_WORD = /timed?[ _-]?out|timeout/;

export function waitFiredClass(fired, askedWait) {
  if (!isStr(fired)) return "undetermined";
  const f = fired.trim().toLowerCase();
  if (TIMEOUT_WORD.test(f)) return "timeout";
  const until = askedWait && isStr(askedWait.until) ? askedWait.until.trim().toLowerCase() : null;
  return until && f === until ? "condition" : "undetermined";
}

/* The sentence a timed-out render reads, as one string in ONE place: the record
   states it in `render.undetermined[]` and the provenance assertion carries it,
   and a hand copy in either would agree for free and drift for free. */
export const RENDER_INCOMPLETE_READING = "render may be incomplete (wait timed out)";

/** The reading, derived from a built render block. `null` when the wait met the
 *  condition that was asked, which is the only case that says nothing. */
export function completenessReading(render) {
  if (!render || render.completeness !== "undetermined") return null;
  if (render.wait && render.wait.fired_class === "timeout") return RENDER_INCOMPLETE_READING;
  return "render completeness is undetermined (which wait ended the render was not established)";
}

/* The daily render allowance, in browser milliseconds, when the instance sets none.
   DERIVED FROM A VENDOR CLAIM, LABELLED AS THEIRS: Cloudflare's pricing page
   (read 2026-07-29, CLIENT-RENDERED.md §"What Workers Paid actually buys") says
   Workers Paid includes 10 browser-hours a month; 10 h / 30 days = 20 minutes a day.
   An instance overrides it with `RENDER_DAILY_ALLOWANCE_MS`. It is NOT a measured
   figure and nothing here claims the platform enforces it: it is this instance's own
   fence, so spending is visible and an unattended sweep cannot run up a bill. */
export const RENDER_DAILY_ALLOWANCE_MS_DEFAULT = 20 * 60 * 1000;

export function renderAllowanceMs(env) {
  const v = env && env.RENDER_DAILY_ALLOWANCE_MS;
  if (v === undefined || v === null || v === "") return RENDER_DAILY_ALLOWANCE_MS_DEFAULT;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : RENDER_DAILY_ALLOWANCE_MS_DEFAULT;
}

/* D-492: WHAT ONE RENDER RESERVES AT ADMISSION — its MAXIMUM cost, not its expected
   one. The allowance used to be checked against what had been SPENT, and a render's
   cost is only spent after it finishes, so N renders in flight at once were all
   admitted against the same figure and the bound the docstring claimed ("at most one
   render") was held by nothing. The reservation is what makes the admission test a
   bound: `spent + reserved + this <= allowance`.

   It is the sum of the two bounds the renderer is ASKED to hold — the navigation
   timeout and the wait timeout — because a render that hits both is the worst case
   the asked environment permits. It is deliberately PESSIMISTIC: a render that
   finishes in a second releases the whole reservation and charges the second, so the
   cost of the pessimism is throughput within a day, never a mis-stated record. The
   failure direction is over-charging (an unreported render stays charged, D-492),
   which under-uses the allowance and never overruns it. */
export function renderReserveMs(asked = RENDER_DEFAULTS) {
  const pos = (v, fallback) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : fallback; };
  const wait = pos(asked && asked.wait && asked.wait.timeout_ms, RENDER_DEFAULTS.wait.timeout_ms);
  const nav = pos(asked && asked.navigation_timeout_ms, RENDER_DEFAULTS.navigation_timeout_ms);
  return Math.ceil(wait + nav);
}

/* Which responses are DATA and which are not (CLIENT-RENDERED.md, DESIGNED
   2026-09-21 item 3): data means documents, frames, fetch and XHR bodies, images,
   map tiles and data files; it EXCLUDES code (scripts) and layout (stylesheets,
   fonts). INVERTED ON PURPOSE (WORKER.md, "invert, do not lengthen a list"): the
   non-data types are the closed list, and every other type — including one this
   module has never seen — is DATA. The error that direction can make is to call
   a request data that was not, which can only make a capture MORE undetermined;
   the other direction could credit a city with a vendor's copy. */
export const NON_DATA_TYPES = Object.freeze({
  script: "code",
  stylesheet: "layout",
  font: "layout",
});

/* THE ANSWER A RENDERER GIVES — the seam's contract, documented rather than typed.
 *
 *   ok             true
 *   html           string: the serialised DOM after the wait condition fired
 *   engine         string, engine_version string
 *   viewport       {width, height}, dpr number, locale string, timezone string
 *   wait           {condition, fired}: what was asked, and WHICH condition ended it
 *   elapsed_ms     number: browser time this render spent
 *   navigated_to   string: the page address the browser ended on
 *   status         number: the navigation's HTTP status
 *   requests       [{url, type, outcome: completed|failed|blocked, status?, blocked_by?, sha256?,
 *                    body_base64?, body_text?, body_unavailable?}]
 *                  every subresource request the page made; `null` when the renderer
 *                  could not record them. D-529: a completed request carries the BYTES
 *                  the browser received — `body_base64` (exact) or `body_text` (the
 *                  browser's own decoding, as CDP gives a text body) — or
 *                  `body_unavailable`, a sentence saying why not. A `sha256` with no
 *                  bytes is the renderer's claim and is recorded as nothing more.
 *   scripts        [{url}] every script resource EXECUTED; `null` when the renderer
 *                  could not record the set (BOB #31: then it is `undetermined`)
 *
 * A missing optional field is recorded as `null` with its absence stated in
 * `render.undetermined[]`, never filled with a default that would read as measured. */

const isStr = (s) => typeof s === "string" && s.length > 0;
const num = (n) => (typeof n === "number" && Number.isFinite(n) ? n : null);
const HEX64 = /^[0-9a-f]{64}$/;

/* D-529 — A DIGEST PER SUBRESOURCE THE RENDER LOADED, OVER BYTES THE PLANE KEPT.
 *
 * BOB #33, 2026-09-24 21:05Z (folded into CLIENT-RENDERED.md §"What must be recorded
 * on a rendered capture" by this item): a per-subresource SHA-256 IS OWED on a rendered
 * capture, and it reads UNDETERMINED where the bytes were not kept. A hop attests these
 * bytes, this URL, this time (construct 2); BOB #31 ruled every script a render runs is
 * recorded, and a script recorded by address alone says which code ran without saying
 * WHAT code ran.
 *
 * THE DIGEST IS THE PLANE'S, NEVER THE RENDERER'S. The renderer hands over the bytes
 * the browser received; the plane hashes them, KEEPS them content-addressed beside the
 * capture (`<store>/captures/<sha>`, the same key subresource capture writes), and only
 * then records the digest. So every hex digest on a rendered capture names bytes anyone
 * holding the store can re-hash — which is what "verify independently" means — and a
 * digest the renderer merely REPORTED (`sha256` with no bytes) is kept as
 * `renderer_sha256`, labelled as its claim, with the digest itself `undetermined`: a
 * number nobody can recompute is an equality that cost nothing to produce.
 *
 * WHICH REQUESTS OWE ONE: every request whose outcome is `completed` — the ones the
 * render LOADED. A failed or blocked request supplied no bytes to the page and owes no
 * digest (`render.requests` counts it); a request still pending when the wait ended is
 * `outcome_unstated` there and is not a load either.
 *
 * WHAT THE DIGEST IS OF, STATED BECAUSE IT CAN DIFFER FROM A RE-FETCH: `body_as: "bytes"`
 * is the response body exactly as the browser delivered it; `body_as: "decoded_text"`
 * is the browser's DECODING of a text body re-encoded as UTF-8, which is what CDP gives
 * for text, and equals the wire bytes only when they were UTF-8. The record says which,
 * so a verifier who re-fetches and disagrees can tell which fact it is disagreeing with.
 *
 * THE CEILINGS ARE subresource capture's own (`SUBRESOURCE_MAX` per body,
 * `SUBRESOURCE_BUDGET` per capture, `SUBRESOURCE_CAP` bodies), not new numbers: a
 * rendered page's assets are the same kind of thing that path keeps. Past any of them
 * the bytes are NOT KEPT, and the digest reads undetermined naming the ceiling — even
 * though the plane holds the bytes in memory and could hash them, because a digest over
 * bytes nobody can re-read is the claim this ruling exists to stop recording.
 *
 * `put(sha, bytes)` and `sha256(bytes)` are injected so this stays pure of R2; the
 * answer is an array ALIGNED with `answer.requests` (null where no digest is owed). */
function b64bytes(s) {
  if (typeof s !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4 !== 0) return null;
  try { const bin = atob(s); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  catch { return null; }
}

export async function keepRenderBodies(answer, { put, sha256 }) {
  if (!answer || !Array.isArray(answer.requests)) return null;
  let kept = 0, spent = 0;
  const out = [];
  for (const r of answer.requests) {
    if (!r || typeof r !== "object" || !isStr(r.url) || r.outcome !== "completed") { out.push(null); continue; }
    const claim = HEX64.test(String(r.sha256 || "")) ? { renderer_sha256: r.sha256 } : {};
    const undet = (why) => ({ sha256: "undetermined", digest_reason: why, ...claim });
    let bytes = null, as = null;
    if (typeof r.body_base64 === "string") {
      bytes = b64bytes(r.body_base64); as = "bytes";
      if (!bytes) { out.push(undet("the renderer's body for this request was not valid base64, so no bytes were kept")); continue; }
    } else if (typeof r.body_text === "string") {
      bytes = new TextEncoder().encode(r.body_text); as = "decoded_text";
    } else {
      out.push(undet(`the renderer did not deliver this response's bytes${isStr(r.body_unavailable) ? ` (${String(r.body_unavailable).slice(0, 200)})` : ""}, so none were kept`
        + (claim.renderer_sha256 ? "; the digest it reported is recorded as renderer_sha256, its claim, which nothing here can recompute" : "")));
      continue;
    }
    if (bytes.length > SUBRESOURCE_MAX) { out.push(undet(`the body is ${bytes.length} bytes, over the ${SUBRESOURCE_MAX}-byte per-subresource ceiling, so it was not kept`)); continue; }
    if (kept >= SUBRESOURCE_CAP) { out.push(undet(`past the ${SUBRESOURCE_CAP}-body per-capture ceiling, so it was not kept`)); continue; }
    if (spent + bytes.length > SUBRESOURCE_BUDGET) { out.push(undet(`the capture's ${SUBRESOURCE_BUDGET}-byte subresource budget was spent, so it was not kept`)); continue; }
    let digest = null;
    try { digest = await sha256(bytes); await put(digest, bytes); }
    catch (e) { out.push(undet(`the plane could not keep the bytes (${String((e && e.message) || e).slice(0, 200)})`)); continue; }
    kept++; spent += bytes.length;
    out.push({ sha256: digest, bytes: bytes.length, body_as: as, kept: true, ...claim });
  }
  return out;
}

/** The origin key the record names: scheme + host. `null` for an unparseable URL. */
export function originKey(u) {
  try { const x = new URL(u); return `${x.protocol}//${x.host}`; } catch { return null; }
}

/** Build the `render` block from a renderer's answer.
 *
 *  Returns `{ ok: true, render }` or `{ ok: false, problem }` when the answer is not
 *  a render at all (no document). Everything else short of that is RECORDED with
 *  its gaps named, because a render that happened and was partly observed is a
 *  fact, and refusing it would push a caller back to the shell. */
export function renderBlock(answer, { pageUrl, shellSha, asked = RENDER_DEFAULTS, at, digests = null }) {
  if (!answer || typeof answer !== "object" || answer.ok !== true)
    return { ok: false, problem: `the renderer did not answer ok (${answer && answer.error ? String(answer.error).slice(0, 200) : "no answer"})` };
  if (typeof answer.html !== "string" || answer.html.length === 0)
    return { ok: false, problem: "the renderer answered with no rendered document" };

  const undetermined = [];
  const pageHost = (() => { try { return new URL(answer.navigated_to || pageUrl).hostname.toLowerCase(); } catch { return null; } })();

  /* REQUESTS — counted by outcome; blocked ones by the rule that blocked them. */
  let requests = null, data = null, subresources = null;
  if (Array.isArray(answer.requests)) {
    /* D-529: the digest for request i is `digests[i]`, from `keepRenderBodies`; a caller
       that kept nothing passes none, and every loaded subresource then reads undetermined
       saying so — never a hex digest the plane did not compute. */
    const digestOf = (r) => {
      const i = answer.requests.indexOf(r);
      const d = Array.isArray(digests) ? digests[i] : null;
      if (d && (HEX64.test(String(d.sha256)) || d.sha256 === "undetermined")) return d;
      return { sha256: "undetermined", digest_reason: "the plane did not keep this render's subresource bytes",
               ...(HEX64.test(String(r.sha256 || "")) ? { renderer_sha256: r.sha256 } : {}) };
    };
    const rq = answer.requests.filter((r) => r && typeof r === "object" && isStr(r.url));
    const by = (o) => rq.filter((r) => r.outcome === o).length;
    const blockedBy = {};
    for (const r of rq) if (r.outcome === "blocked") {
      const k = isStr(r.blocked_by) ? r.blocked_by : "unstated";
      blockedBy[k] = (blockedBy[k] || 0) + 1;
    }
    const unclassified = rq.filter((r) => !["completed", "failed", "blocked"].includes(r.outcome)).length;
    requests = { made: rq.length, completed: by("completed"), failed: by("failed"), blocked: by("blocked"),
                 blocked_by: blockedBy, outcome_unstated: unclassified };
    /* render.data: every DATA-bearing response the render CONSUMED — completed ones.
       A failed or blocked request supplied nothing to the page. */
    /* D-529 — EVERY SUBRESOURCE THE RENDER LOADED, code and layout included (BOB #31:
       a script that ran is recorded; BOB #33: with its digest). `render.data` below is
       the DATA subset of the same loads and carries the same digest, looked up once. */
    subresources = rq.filter((r) => r.outcome === "completed").map((r) => {
      const d = digestOf(r);
      return { address: r.url, type: isStr(r.type) ? r.type : null, sha256: d.sha256,
               ...(d.sha256 === "undetermined" ? { digest_reason: d.digest_reason }
                                               : { bytes: d.bytes, body_as: d.body_as, digest_by: "plane" }),
               ...(d.renderer_sha256 ? { renderer_sha256: d.renderer_sha256 } : {}) };
    });
    const undigested = subresources.filter((x) => x.sha256 === "undetermined").length;
    if (undigested)
      undetermined.push(`subresources: ${undigested} of the ${subresources.length} subresources the render loaded carry no digest, because their bytes were not kept; each names its reason (BOB #33, 2026-09-24)`);
    data = rq.filter((r) => r.outcome === "completed" && !NON_DATA_TYPES[String(r.type || "").toLowerCase()])
      .map((r) => {
        const o = originOf(r.url, pageHost);
        const d = digestOf(r);
        /* `reported_by` names whose word the ENTRY is (the renderer said this request
           happened); the DIGEST is the plane's over bytes it kept, or `undetermined`. */
        return { address: r.url, type: isStr(r.type) ? r.type : null, origin: o.origin, host: o.host,
                 ...(o.approximate ? { approximate: true } : {}),
                 sha256: d.sha256,
                 ...(d.sha256 === "undetermined" ? { digest_reason: d.digest_reason } : {}),
                 ...(d.renderer_sha256 ? { renderer_sha256: d.renderer_sha256 } : {}),
                 reported_by: "renderer" };
      });
  } else {
    undetermined.push("requests: the renderer did not record the page's requests, so render.requests and render.data are undetermined");
  }

  /* SCRIPTS — BOB #31: every script executed is named by origin, or the set is
     `undetermined`. Never an empty list standing in for "we could not see". */
  let scriptsExecuted = "undetermined", thirdParty = "undetermined";
  if (Array.isArray(answer.scripts)) {
    const origins = new Map();
    for (const s of answer.scripts) {
      if (!s || !isStr(s.url)) continue;
      const k = originKey(s.url);
      if (!k) continue;
      if (!origins.has(k)) origins.set(k, originOf(s.url, pageHost).origin);
    }
    scriptsExecuted = [...origins.keys()].sort();
    /* `same_site` is NOT the host: originOf says it approximates, and the
       approximation is wrong on shared vendor platforms (item 3's last bullet). */
    thirdParty = [...origins.entries()].filter(([, o]) => o !== "same_host").map(([k]) => k).sort();
  } else {
    undetermined.push("scripts: the renderer could not record which scripts executed, so the script set is undetermined (BOB #31)");
  }

  const pick = (k, v) => { if (v === null || v === undefined) undetermined.push(`${k}: not reported by the renderer`); return v ?? null; };

  /* D-499 — WHICH WAIT FIRED, and the completeness that follows from it. Computed
     here rather than in the literal below so the reading lands in `undetermined[]`
     beside the gap that caused it, and so the classifier is read once. */
  const waitFired = pick("wait.fired", answer.wait && isStr(answer.wait.fired) ? answer.wait.fired : null);
  const firedClass = waitFiredClass(waitFired, asked.wait);
  const completeness = firedClass === "condition" ? "condition_met" : "undetermined";
  if (firedClass === "timeout")
    undetermined.push(`completeness: ${RENDER_INCOMPLETE_READING} — the renderer's wait ended on its timeout`
      + `${num(asked.wait && asked.wait.timeout_ms) !== null ? ` (${asked.wait.timeout_ms} ms asked)` : ""}`
      + `${isStr(asked.wait && asked.wait.until) ? ` rather than on the \`${asked.wait.until}\` condition` : ""}`
      + `, so what the page would have shown had the condition been met is undetermined. The capture keeps its `
      + `grade and its method; these bytes are not presented as the whole page (BOB #32, 2026-09-24).`);
  else if (firedClass === "undetermined")
    undetermined.push(`completeness: ${isStr(waitFired)
      ? `the renderer reported the wait fired on \`${waitFired}\`, which is neither the `
        + `\`${(asked.wait && asked.wait.until) || "(none asked)"}\` condition this plane asked for nor a timeout`
      : "the renderer did not report which wait ended the render"}, so whether the render ran to its `
      + `condition is undetermined and this rendering may be incomplete.`);

  const render = {
    of: shellSha,
    engine: pick("engine", isStr(answer.engine) ? answer.engine : null),
    engine_version: pick("engine_version", isStr(answer.engine_version) ? answer.engine_version : null),
    viewport: pick("viewport", answer.viewport && num(answer.viewport.width) && num(answer.viewport.height)
      ? { width: answer.viewport.width, height: answer.viewport.height } : null),
    dpr: pick("dpr", num(answer.dpr)),
    locale: pick("locale", isStr(answer.locale) ? answer.locale : null),
    timezone: pick("timezone", isStr(answer.timezone) ? answer.timezone : null),
    /* D-499: the renderer's own word, and the plane's three-valued reading of it. */
    wait: { asked: asked.wait, fired: waitFired, fired_class: firedClass },
    /* D-499 / BOB #32: `condition_met` says the wait ended on the condition ASKED —
       not that the page was finished, which no renderer reports. `undetermined`
       carries its reason in `undetermined[]` above. The GRADE is untouched either
       way: grade tracks directness, never technique or completeness. */
    completeness,
    elapsed_ms: pick("elapsed_ms", num(answer.elapsed_ms)),
    navigated_to: isStr(answer.navigated_to) ? answer.navigated_to : null,
    status: num(answer.status),
    requests,
    subresources,
    data,
    scripts_executed: scriptsExecuted,
    third_party_executed: thirdParty,
    asked: { viewport: asked.viewport, dpr: asked.dpr, locale: asked.locale, timezone: asked.timezone },
    at: at || null,
    undetermined,
  };
  return { ok: true, render };
}

/** THE AUTHORITY RULE (CLIENT-RENDERED.md, DESIGNED 2026-09-21 item 3), at document grain.
 *
 *  `determined`, as the served shell's authority, ONLY when ALL of:
 *    - the shell's own authority is determined (a member asserted it);
 *    - `render.data` is known and every entry is `same_host`;
 *    - `render.third_party_executed` is known and EMPTY.
 *  Otherwise `undetermined`, with a dated basis naming each other origin and the
 *  axis it touched. Never `determined` as the host when another origin supplied
 *  data or ran code: that is crediting a city with a vendor's copy. */
export function renderedAuthority({ asserted, render, at }) {
  const reasons = [];
  if (!asserted) reasons.push("the served shell's own authority is undetermined: no assertion was supplied");
  if (!Array.isArray(render.data)) reasons.push("which origins supplied data is undetermined: the renderer did not record the page's requests");
  else {
    const foreign = new Map();
    for (const d of render.data) if (d.origin !== "same_host") {
      const k = originKey(d.address) || String(d.host || d.address);
      foreign.set(k, d.origin);
    }
    for (const [k, o] of [...foreign.entries()].sort())
      reasons.push(`${k} supplied data (${o === "same_site" ? "same_site, which approximates and is not the host" : o})`);
  }
  if (!Array.isArray(render.third_party_executed))
    reasons.push("which scripts executed is undetermined: the renderer could not record the script set (BOB #31)");
  else for (const k of render.third_party_executed) reasons.push(`${k} ran code`);

  if (reasons.length === 0)
    return { authority_state: "determined", authority: asserted,
             authority_basis: `asserted by the capturing caller at intake for the served shell, and the render drew data only from the page's own host with no script from another origin executed; ${at}` };
  return { authority_state: "undetermined",
           authority_basis: `rendered capture, ${at}: ${reasons.join("; ")}. A person resolves this by an assertion carrying its basis (CLIENT-RENDERED.md, DESIGNED 2026-09-21 item 3).`,
           authority_other_origins: Array.isArray(render.data) || Array.isArray(render.third_party_executed)
             ? [...new Set([
                 ...(Array.isArray(render.data) ? render.data.filter((d) => d.origin !== "same_host").map((d) => originKey(d.address)).filter(Boolean) : []),
                 ...(Array.isArray(render.third_party_executed) ? render.third_party_executed : []),
               ])].sort()
             : "undetermined" };
}

/** Which renderer this instance has. THE SEAM.
 *
 *  `env.RENDERER` — a service binding answering `POST /render` with `RENDER_ANSWER`.
 *  Tests inject it through miniflare's `serviceBindings`; a render fleet member
 *  would be bound here the same way PDF_WORKER and OCR_WORKER are. IT GOES FIRST
 *  ON PURPOSE: an instance that has been given a dedicated renderer meant it, and
 *  a browser binding beside it is the fallback, not the override.
 *
 *  `env.BROWSER` — a Browser Rendering binding, DRIVEN IN-PLANE SINCE D-490
 *  (`browserrender.mjs`, a CDP client over the binding's two endpoints). D-64
 *  shipped this branch as `browser-binding-without-driver`, answering 501
 *  RENDER_NO_RENDERER (C-83.3) on every instance; that is what D-490 closes. Read
 *  `browserrender.mjs`'s header for why the driver is written here rather than
 *  taken from `@cloudflare/puppeteer`, which the plane's test harness MEASURABLY
 *  cannot carry, and for what the alternative (a fourth fleet member) would be.
 *
 *  THE `browser-binding-without-driver` KIND SURVIVES, NARROWED to what it now
 *  actually means: a `BROWSER` bound to something that is not a Fetcher, so there
 *  is nothing to speak CDP to. That is a real state — an instance can bind the
 *  name to the wrong thing — and it keeps C-83.3's second sentence true instead of
 *  leaving a refusal whose condition nothing can reach.
 *
 *  NOT YET VERIFIED LIVE, AND SAYING SO IS THE POINT: DIST-11 (2026-09-24) declared
 *  `BROWSER` in `wrangler.jsonc` and taught the deploy derivation and newgroup the
 *  class, so a plane holds the binding from its NEXT release; no deployed instance
 *  holds it yet (CONDUCT #20 at c20-batch25, where D-490 met DIST-11). Everything below is driven under
 *  miniflare against a fake that speaks the binding's own protocol
 *  (`test/browser-render.test.mjs`), which proves the DRIVER and proves nothing
 *  about Cloudflare's service. */
export function rendererFor(env) {
  if (env && env.RENDERER && typeof env.RENDERER.fetch === "function")
    return { kind: "service", render: async (req) => {
      const r = await env.RENDERER.fetch("http://renderer/render", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
      return r.json().catch(() => ({ ok: false, error: `the renderer answered HTTP ${r.status} with no JSON` }));
    } };
  if (env && env.BROWSER && typeof env.BROWSER.fetch === "function")
    return browserBindingRenderer(env.BROWSER);
  if (env && env.BROWSER)
    return { kind: "browser-binding-without-driver", render: null };
  return { kind: "none", render: null };
}

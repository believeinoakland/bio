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
 * the rendered document it is handed, and nothing else the renderer reports. A
 * `sha256` on a `render.data` entry is carried as the renderer reported it and
 * labelled `reported_by: "renderer"`; a missing one is `null`, never invented.
 */
import { originOf } from "./subresources.mjs";

/* The environment this instance asks for. Recorded on every capture whether or not
   the renderer honoured it: `render.*` carries what the renderer SAID it used, and
   `render.asked` what was asked, so a disagreement is visible rather than averaged. */
export const RENDER_DEFAULTS = Object.freeze({
  viewport: Object.freeze({ width: 1280, height: 800 }),
  dpr: 1,
  locale: "en-US",
  timezone: "UTC",
  wait: Object.freeze({ until: "networkidle", timeout_ms: 15000 }),
});

/* The render method string BOB #32 ruled. The shell keeps its own method. */
export const RENDERED_METHOD = "rendered";

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
 *   requests       [{url, type, outcome: completed|failed|blocked, status?, blocked_by?, sha256?}]
 *                  every subresource request the page made; `null` when the renderer
 *                  could not record them
 *   scripts        [{url}] every script resource EXECUTED; `null` when the renderer
 *                  could not record the set (BOB #31: then it is `undetermined`)
 *
 * A missing optional field is recorded as `null` with its absence stated in
 * `render.undetermined[]`, never filled with a default that would read as measured. */

const isStr = (s) => typeof s === "string" && s.length > 0;
const num = (n) => (typeof n === "number" && Number.isFinite(n) ? n : null);

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
export function renderBlock(answer, { pageUrl, shellSha, asked = RENDER_DEFAULTS, at }) {
  if (!answer || typeof answer !== "object" || answer.ok !== true)
    return { ok: false, problem: `the renderer did not answer ok (${answer && answer.error ? String(answer.error).slice(0, 200) : "no answer"})` };
  if (typeof answer.html !== "string" || answer.html.length === 0)
    return { ok: false, problem: "the renderer answered with no rendered document" };

  const undetermined = [];
  const pageHost = (() => { try { return new URL(answer.navigated_to || pageUrl).hostname.toLowerCase(); } catch { return null; } })();

  /* REQUESTS — counted by outcome; blocked ones by the rule that blocked them. */
  let requests = null, data = null;
  if (Array.isArray(answer.requests)) {
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
    data = rq.filter((r) => r.outcome === "completed" && !NON_DATA_TYPES[String(r.type || "").toLowerCase()])
      .map((r) => {
        const o = originOf(r.url, pageHost);
        return { address: r.url, type: isStr(r.type) ? r.type : null, origin: o.origin, host: o.host,
                 ...(o.approximate ? { approximate: true } : {}),
                 sha256: /^[0-9a-f]{64}$/.test(String(r.sha256 || "")) ? r.sha256 : null,
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
  const render = {
    of: shellSha,
    engine: pick("engine", isStr(answer.engine) ? answer.engine : null),
    engine_version: pick("engine_version", isStr(answer.engine_version) ? answer.engine_version : null),
    viewport: pick("viewport", answer.viewport && num(answer.viewport.width) && num(answer.viewport.height)
      ? { width: answer.viewport.width, height: answer.viewport.height } : null),
    dpr: pick("dpr", num(answer.dpr)),
    locale: pick("locale", isStr(answer.locale) ? answer.locale : null),
    timezone: pick("timezone", isStr(answer.timezone) ? answer.timezone : null),
    wait: { asked: asked.wait, fired: pick("wait.fired", answer.wait && isStr(answer.wait.fired) ? answer.wait.fired : null) },
    elapsed_ms: pick("elapsed_ms", num(answer.elapsed_ms)),
    navigated_to: isStr(answer.navigated_to) ? answer.navigated_to : null,
    status: num(answer.status),
    requests,
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
 *  would be bound here the same way PDF_WORKER and OCR_WORKER are.
 *
 *  `env.BROWSER` — a Browser Rendering binding, declared in `wrangler.jsonc` since DIST-11 (2026-09-24). D-64
 *  added it and took it back out, because DIST's deploy derivation then refused the `browser` binding class by
 *  name (UNKNOWN_BINDING_CLASS); DIST-11 taught the derivation and newgroup the class, so a deployed or installed
 *  plane now holds it from its next release. The IN-PLANE DRIVER over it is NOT BUILT
 *  either: it needs a CDP client (Cloudflare's `@cloudflare/puppeteer`), which this
 *  landing does not vendor into the plane. So an instance that binds it by hand is
 *  REPORTED as holding a binding without a driver, never mistaken for a renderer. */
export function rendererFor(env) {
  if (env && env.RENDERER && typeof env.RENDERER.fetch === "function")
    return { kind: "service", render: async (req) => {
      const r = await env.RENDERER.fetch("http://renderer/render", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
      return r.json().catch(() => ({ ok: false, error: `the renderer answered HTTP ${r.status} with no JSON` }));
    } };
  if (env && env.BROWSER)
    return { kind: "browser-binding-without-driver", render: null };
  return { kind: "none", render: null };
}

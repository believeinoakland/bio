/* journey-check R2: one walk of a browser through journeys, a step at a time. Each step is screenshotted into the output
   directory; the walk fails on any refusal the step does not expect, at any depth of an answer whatever its status
   (R8), any 4xx or 5xx, any page whose script throws, any old page (the setup page, legacy-ui) or other address outside
   the walk reached, and any registry screen not drawn. A step whose own control is missing fails with what it looked
   for. Nothing secret is written: a step's label and a failure's detail never carry a password, a code or a token
   (`redact`). */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* The interface page's mark: every document the copy serves to a browser is `interfacePage`, which links the shell's own
   stylesheet (interface-shell R1). A document without it is an old page. */
export const INTERFACE_MARK = "/app/assets/civicsmith.css";
/* The setup page's own title, and the legacy-ui Worker's script name, each named so the failure says which old page it was. */
export const SETUP_PAGE_TITLE = "Your accountability record";
export const LEGACY_UI_WORKER = "civicos";

export const FAIL = Object.freeze({ REFUSED: "refused", HTTP: "http", SCRIPT: "script", OLD_PAGE: "old-page", ADDRESS: "address",
  NOT_DRAWN: "not-drawn", STEP: "step", REFUSAL: "refusal",
  /* R5: a role signed in that `whoami` does not answer as that role, or acts only an administrator is drawn not drawn */
  ROLE: "role",
  /* R6: a working screen the design mock does not draw, and the limits of a live page (design.mjs' LIMIT) */
  DESIGN: "design", WIDER: "wider", TABS: "tabs", BAND: "band", CLASS: "class", WORDS: "words" });

const slugOf = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/* What a document is: the interface, the setup page, or another page. */
export function documentKind(html) {
  if (typeof html !== "string") return "other";
  if (html.includes(INTERFACE_MARK)) return "interface";
  const t = /<title>([^<]*)<\/title>/i.exec(html);
  if (t && t[1].trim() === SETUP_PAGE_TITLE) return "setup-page";
  return "other";
}

/* R8 (D29): the refusals an answer carries, anywhere in it: `[{code, how, at}]`, `at` the path to the object that
   carries it ("" at the top). A refusal is an object holding `ok: false`, `started: false`, `dispatched: false` or
   `found: false`, or a non-empty `withheld`; its code is its own `code` or `reason`, else what it says. Each object
   counts once, under its first sign. */
export const REFUSAL_FLAGS = Object.freeze(["ok", "started", "dispatched", "found"]);
export function refusalsIn(body) {
  const out = [];
  const seen = new Set();
  const visit = (v, at, depth) => {
    if (!v || typeof v !== "object" || depth > 64 || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${at}[${i}]`, depth + 1)); return; }
    const flag = REFUSAL_FLAGS.find((k) => v[k] === false);
    const w = v.withheld;
    const withheld = w === true || (Array.isArray(w) && w.length > 0) || (w && typeof w === "object" && !Array.isArray(w) && Object.keys(w).length > 0)
      || (typeof w === "string" && w.length > 0);
    if (flag || withheld) {
      const how = flag ? `${flag}: false` : "withheld";
      const own = [v.code, v.reason].find((c) => typeof c === "string" && c);
      out.push({ code: own || how, how, at });
    }
    for (const [k, x] of Object.entries(v)) visit(x, at ? `${at}.${k}` : k, depth + 1);
  };
  visit(body, "", 0);
  return out;
}

export class Walk {
  /* `out` the output directory; `arm` "local" or "live"; `copyHost` the instance's host (set once known); `ownHosts` the
     other hosts the walk itself serves (the installer, the consent page); `secrets` values never to be written. */
  constructor({ out, arm, ownHosts = [], secrets = [] }) {
    this.out = out; this.arm = arm; this.ownHosts = new Set(ownHosts); this.copyHost = null;
    this.secrets = [...secrets]; this.failures = []; this.steps = []; this.n = 0; this.current = null; this.pending = [];
    this.journey = "walk";
    /* R5: the latest member session `whoami` answered the browser, as the plane said it (`administer` and the rest) */
    this.whoami = null;
    /* R6: the LIVE and DESIGN pairs written, relative to `out`, put to BOB before a release is called ready */
    this.pairs = [];
    /* Elements whose text is a secret (a one-time password, a probe credential, an invitation link): masked in every
       screenshot. */
    this.mask = [];
    mkdirSync(out, { recursive: true });
  }

  keepSecret(v) { if (typeof v === "string" && v.length >= 6) this.secrets.push(v); return v; }
  redact(s) { let t = String(s ?? ""); for (const v of this.secrets) t = t.split(v).join("[secret]"); return t; }
  fail(kind, detail) {
    const f = { journey: this.journey, step: this.current ? this.current.label : null, kind, detail: this.redact(detail) };
    this.failures.push(f);
    return f;
  }

  /* Watch one page (each browser context's pages are watched as they open). */
  watch(page) {
    page.on("pageerror", (e) => this.fail(FAIL.SCRIPT, `${this.redact(page.url())}: ${e.message}`));
    page.on("response", (res) => this.pending.push(this.#onResponse(res).catch(() => {})));
    /* JOURNEY_DEBUG=1 prints each request's method, address and status, never a body or a header */
    if (process.env.JOURNEY_DEBUG) page.on("response", (res) => process.stderr.write(this.redact(`${res.status()} ${res.request().method()} ${res.url().replace(/#.*$/, "")}`) + "\n"));
    return page;
  }

  async #onResponse(res) {
    const url = new URL(res.url());
    const req = res.request();
    const expect = this.current?.expect || [];
    const where = `${req.method()} ${url.host}${url.pathname}${url.searchParams.get("op") ? "?op=" + url.searchParams.get("op") : ""}`;
    let body = null;
    const type = res.headers()["content-type"] || "";
    if (/json/.test(type)) { try { body = JSON.parse(await res.text()); } catch { body = null; } }
    if (url.searchParams.get("op") === "whoami" && body && body.ok === true && body.result && body.result.session) this.whoami = body.result;
    /* R8: every refusal the answer carries, at any depth, whatever its status. One the step expects is excused by its
       code wherever it sits, and excuses the answer's status; each other is one failure, naming where it sits. */
    const refusals = refusalsIn(body);
    const matches = (e, code) => (e instanceof RegExp ? e.test(code) : e === code);
    /* an expectation is a code (a string or a pattern), or `{at, code}`: that code where its path matches `at` */
    const expected = (r) => expect.some((e) => (e && typeof e === "object" && !(e instanceof RegExp)
      ? e.at.test(r.at) && matches(e.code, r.code) : matches(e, r.code)));
    const unexcused = refusals.filter((r) => !expected(r));
    for (const r of unexcused)
      this.fail(FAIL.REFUSED, r.at === "" && r.how === "ok: false" ? `${where} answered ok: false (${r.code}, HTTP ${res.status()})`
        : `${where} answered ${r.how} at ${r.at || "its top"} (${r.code}, HTTP ${res.status()})`);
    const excused = refusals.some((r) => expected(r)) || (!refusals.length && expect.includes(res.status()));
    if (!unexcused.length && res.status() >= 400 && !excused) this.fail(FAIL.HTTP, `${where} answered HTTP ${res.status()}`);
    if (req.resourceType() === "document" && url.host === this.copyHost && res.status() < 300) {
      const kind = documentKind(await res.text().catch(() => null));
      if (kind === "setup-page") this.fail(FAIL.OLD_PAGE, `${url.pathname} is the setup page`);
      else if (kind !== "interface") this.fail(FAIL.OLD_PAGE, `${url.pathname} is not the interface page`);
    }
  }

  /* A request the walk's router refused: an address outside the walk. */
  foreign(url) {
    const u = new URL(url);
    if (u.host.split(".")[0] === LEGACY_UI_WORKER) return this.fail(FAIL.OLD_PAGE, `${u.host} is legacy-ui`);
    return this.fail(FAIL.ADDRESS, `${u.host}${u.pathname} is outside the walk`);
  }

  /* One step: `fn(page)` performs it; `expect` names the refusal codes (a string or a pattern, or `{at, code}` for a code
     only where its path in the answer matches `at`) or HTTP statuses it expects. The page is
     screenshotted when it settles, whether the step held or not; a step that throws stops the journey. */
  async step(page, label, fn, { expect = [] } = {}) {
    this.current = { label, expect };
    const n = String(++this.n).padStart(2, "0");
    const file = `${n}-${this.arm}-${slugOf(this.journey)}-${slugOf(label)}.png`;
    let error = null;
    try { await fn(page); } catch (e) { error = e; }
    await settle(page);
    await Promise.all(this.pending.splice(0));
    try { await page.screenshot({ path: join(this.out, file), fullPage: true,
      mask: this.mask.map((sel) => page.locator(sel)) }); } catch { /* a closed page has none */ }
    const failed = this.failures.filter((f) => f.step === label && f.journey === this.journey);
    if (error) this.fail(FAIL.STEP, error.message.split("\n")[0]);
    this.steps.push({ journey: this.journey, label, screenshot: file, ok: !error && failed.length === 0 });
    this.current = null;
    if (error) throw new StepFailed(label, error);
  }

  report() {
    const lines = [`journey-check (${this.arm}): ${this.steps.length} steps, ${this.failures.length} failures`];
    for (const s of this.steps) lines.push(`${s.ok ? "ok  " : "FAIL"} ${s.journey} · ${s.label} (${s.screenshot})`);
    for (const f of this.failures) lines.push(`  ${f.kind}: ${f.journey} · ${f.step ?? "between steps"}: ${f.detail}`);
    if (this.pairs.length) lines.push(`${this.pairs.length} pairs, LIVE beside DESIGN, for BOB's comparison (R6):`, ...this.pairs.map((p) => `  ${p}`));
    const text = this.redact(lines.join("\n")) + "\n";
    writeFileSync(join(this.out, "report.txt"), text);
    writeFileSync(join(this.out, "report.json"), this.redact(JSON.stringify({ arm: this.arm, steps: this.steps, failures: this.failures, pairs: this.pairs }, null, 1)));
    return text;
  }
}

export class StepFailed extends Error {
  constructor(label, cause) { super(`step "${label}" failed: ${cause.message.split("\n")[0]}`); this.cause = cause; }
}

/* Settled: the document loaded, the network quiet for a moment, no loading state drawn. */
export async function settle(page) {
  try { await page.waitForLoadState("load", { timeout: 15000 }); } catch {}
  try { await page.waitForLoadState("networkidle", { timeout: 4000 }); } catch {}
  try { await page.waitForFunction(() => !document.querySelector('[data-state="loading"]'), null, { timeout: 8000 }); } catch {}
}

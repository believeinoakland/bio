/* interface-shell's tests' harness, imported by the screen modules' tests too (draft-T46-interface §4 (1), (2)): the page
   `interfacePage(screens)` serves, run over the document stand-in (`dom.mjs`) with a scripted plane. Every request the
   page makes is recorded with its address, op, query, headers and body; the plane answers each op from a table (a value,
   a refusal, no answer, or never), with the frame's own reads answered by default. Timers are a fake clock, so the
   explanations' timings (R14) are read exactly. */
import { interfacePage, NONCE_SLOT } from "../../../src/interface-shell/index.mjs";
import { webcrypto } from "node:crypto";
import { documentOf, Event, textNodes } from "./dom.mjs";

export { textNodes, Event };

/* A member's session as whoami answers it (control-plane R18). */
export const MEMBER = Object.freeze({ tokenClass: "member", session: true, member: "mai", handle: "mai", administer: false,
  rootOfTrust: false, capabilities: ["contribute"], vocabulary: ["contribute", "create_projects", "publish"], confinedTo: null });
export const ADMIN = Object.freeze({ ...MEMBER, member: "rosa", handle: "rosa", administer: true });

/* answers: a value (`ok`), a refusal at the top level (`refused`) or in `result` (`refusedIn`), an HTTP error with no
   JSON (`httpError`), no answer (`silent`: the fetch throws) and never (`pending`) */
export const ok = (result, status = 200) => ({ status, json: { ok: true, result } });
export const refused = (code, translation, status = 400, extra = {}) => ({ status, json: { ok: false, reason: code, code, ...(translation ? { translation } : {}), ...extra } });
export const refusedIn = (code, translation) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...(translation ? { translation } : {}) } } });
export const httpError = (status = 500) => ({ status, text: "boom" });
export const silent = Object.freeze({ silent: true });
export const bytes = (data, type = "application/pdf") => ({ status: 200, bytes: data, type });
export const pending = Object.freeze({ pending: true });

export const FRAME = Object.freeze({
  whoami: ok(MEMBER),
  interfacewords: ok({ ok: true, language: null, words: [] }),
  groupidentity: ok({ ok: true, group: "river-town", display_name: "River Town" }),
  queue: ok({ items: [{ id: "a", class: "OBLIGATION" }, { id: "b", class: "FINDING" }, { id: "c", class: "OBLIGATION" }] }),
  infolevel: ok({ level: "prompt", set_at: null, asked_at: null }),
  assistantstate: ok({ on: false }),
  accountreference: ok({ held: false }),
  subscriptionsignin: ok({ connected: false }),
  groupkeystate: ok({ on: false }),
  signout: ok({ ok: true }),
});
export const SESSION = Object.freeze({ t: "tok-1", e: 0, c: "", w: "member" });

/* One response as the door makes it (answer-envelope R6): a fresh nonce in every slot. */
export function served(html, nonce = "n0nce") { return html.split(NONCE_SLOT).join(nonce); }
export const scriptOf = (html) => { const at = html.lastIndexOf("<script"); return html.slice(html.indexOf(">", at) + 1, html.lastIndexOf("</script>")); };

const tick = () => new Promise((r) => setImmediate(r));
export async function settle(n = 40) { for (let i = 0; i < n; i++) await tick(); }

/**
 * Boot the page at `path` with `screens` registered, over `plane` (an op's answer, or `(req) => answer`).
 * Answers `{doc, win, requests, root, clock, settle, click, fire, assigned, store, local, byOp}`.
 */
export async function boot({ screens = [], plane = {}, session = SESSION, path = "/app", phone = false, local = {}, localThrows = false, html, run = true } = {}) {
  html = html || served(interfacePage(screens));
  const doc = documentOf(html);
  const requests = [];
  const answers = { ...FRAME, ...plane };
  const fetch = async (url, init = {}) => {
    const u = new URL(url, "https://group.example");
    const op = u.searchParams.get("op");
    const req = { url: String(url), op, query: Object.fromEntries(u.searchParams), init, headers: { ...(init.headers || {}) },
      body: init.body === undefined ? undefined : typeof init.body === "string" ? safeJson(init.body) : init.body, method: init.method || "GET" };
    requests.push(req);
    let a = answers[op];
    if (typeof a === "function") a = a(req);
    if (a === undefined) a = ok(null);
    if (a.pending) return new Promise(() => {});
    if (a.silent) throw new TypeError("Failed to fetch");
    return { status: a.status, ok: a.status >= 200 && a.status < 300,
      headers: { get: (h) => (h.toLowerCase() === "content-type" ? (a.bytes !== undefined ? a.type : a.json !== undefined ? "application/json" : "text/plain") : null) },
      blob: async () => new Blob([a.bytes ?? ""], { type: a.type || "" }),
      json: async () => { if (a.json === undefined) throw new SyntaxError("not JSON"); return JSON.parse(JSON.stringify(a.json)); } };
  };
  const timers = [];
  let now = 0;
  const clock = {
    setTimeout: (f, ms = 0) => { const t = { f, at: now + ms, id: timers.length + 1 }; timers.push(t); return t.id; },
    at: () => now,
    clearTimeout: (id) => { const t = timers.find((x) => x.id === id); if (t) t.f = null; },
    async tick(ms) { const end = now + ms; for (;;) { const due = timers.filter((t) => t.f && t.at <= end).sort((a, b) => a.at - b.at)[0]; if (!due) break; now = due.at; const f = due.f; due.f = null; f(); await settle(5); } now = end; },
  };
  const assigned = [];
  const store = new Map(session ? [["bio-session", JSON.stringify(session)]] : []);
  const localMap = new Map(Object.entries(local));
  const location = { pathname: path, hash: "", origin: "https://group.example", assign: (u) => assigned.push(u) };
  const listeners = {};
  const objectUrls = [], files = [];
  const win = {
    document: doc, fetch, location,
    history: { pushState: (s, t, u) => { location.pathname = u; }, replaceState: (s, t, u) => { location.pathname = u; } },
    sessionStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    localStorage: localThrows ? { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } }
      : { getItem: (k) => localMap.get(k) ?? null, setItem: (k, v) => localMap.set(k, String(v)) },
    matchMedia: () => ({ matches: phone, addEventListener() {} }),
    addEventListener: (t, f) => (listeners[t] ||= []).push(f),
    removeEventListener: (t, f) => { listeners[t] = (listeners[t] || []).filter((x) => x !== f); },
    listeners,
    crypto: webcrypto,
    URL: { createObjectURL: (blob) => { const url = "blob:https://group.example/" + (objectUrls.length + 1); objectUrls.push({ url, blob, released: false }); return url; },
           revokeObjectURL: (url) => { const u = objectUrls.find((x) => x.url === url); if (u) u.released = true; } },
  };
  const origCreate = doc.createElement.bind(doc);
  doc.createElement = (t) => { const el = origCreate(t); if (t === "a") el.click = () => files.push({ name: el.getAttribute("download"), url: el.getAttribute("href"), released: false }); return el; };
  doc.defaultView = win;
  const root = () => doc.getElementById("cs-root");
  const fire = (el, type, init = {}) => el.dispatchEvent(new Event(type, { bubbles: true, target: el, ...init }));
  const click = async (el) => { if (typeof el === "string") el = root().querySelector(el); if (!el) throw new Error("nothing to click"); fire(el, "click"); await settle(); return el; };
  const back = async (path2) => { location.pathname = path2; for (const f of listeners.popstate || []) f({}); await settle(); };
  if (run) {
    /* the page's clock is the fake one: `Date.now()` advances with `clock.tick` (cs.now, K3002) */
    const base = Date.now();
    const FakeDate = class extends Date { static now() { return base + clock.at(); } };
    new Function("window", "setTimeout", "clearTimeout", "Date", scriptOf(html))(win, clock.setTimeout, clock.clearTimeout, FakeDate);
    await settle();
  }
  const byOp = (op) => requests.filter((r) => r.op === op);
  return { doc, win, html, requests, root, clock, settle, click, fire, back, assigned, store, local: localMap, byOp, location, objectUrls, files };
}
const safeJson = (s) => { try { return JSON.parse(s); } catch { return s; } };

/* R15: every element carrying an explanation inside another that carries one */
export const nestedTips = (root) => root.querySelectorAll("[data-tip]").filter((e) => e.parentElement && e.parentElement.closest("[data-tip]"));

/* R22: a control's accessible name: its aria-label, its text, or its label */
export function accessibleName(el, doc) {
  if (el.getAttribute("aria-label")) return el.getAttribute("aria-label").trim();
  if (el.getAttribute("aria-labelledby")) return el.getAttribute("aria-labelledby").split(/\s+/).map((id) => (doc.getElementById(id) || { textContent: "" }).textContent).join(" ").trim();
  if (["input", "select", "textarea"].includes(el.localName)) {
    const l = el.id ? doc.querySelectorAll("label").find((x) => x.getAttribute("for") === el.id) : null;
    const wrap = el.closest("label");
    return ((l || wrap || { textContent: "" }).textContent || "").trim();
  }
  return (el.textContent || "").trim();
}
export const controls = (root) => root.querySelectorAll("a[href], button, input, select, textarea, [role=separator]");

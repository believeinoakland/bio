/* civicsmith.org: Civicsmith's own website, a static Worker (site R1–R12). It serves the three generated pages
 * (`pages.mjs`, site/build.mjs; R9, R12) with the four deploy values put in place (R4–R7), and interface-assets' files
 * at their own paths (R8). It holds no accounts, reads no group's record, sends nothing anywhere and stores nothing
 * (R10). Every response carries the same headers (R6, R7, R8); a deploy value that is malformed answers 500, never a
 * page drawn from it. */
import { ASSET_FILES } from "../../bio-plane/src/interface-assets/index.mjs";
import { PAGES, PARTS } from "./pages.mjs";

const ROUTES = { "/": "home", "/start": "start", "/groups": "groups" };
const ASSETS = "/app/assets/";
export const CSP = "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
/* Each {{slot}} of a generated template, filled with HTML already made safe; a slot left unfilled is a fault. */
function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, n) => {
    if (!(n in values)) throw new Error(`site: slot ${n} has no value`);
    return values[n];
  });
}

export class ConfigError extends Error {}
const bad = (what) => { throw new ConfigError(`site: ${what}`); };
const unset = (v) => v === undefined || v === null || v === "";
const json = (v, name) => {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return bad(`${name} is not JSON`); }
};
const text = (v, name) => (typeof v === "string" && v.trim() && !/[\u0000-\u001f]/.test(v) ? v : bad(`${name} is not a text`));
const count = (v, name) => (Number.isInteger(v) && v >= 1 ? v : bad(`${name} is not a count`));
function https(v, name, { bare = false } = {}) {
  let u;
  try { u = new URL(text(v, name)); } catch { return bad(`${name} is not an address`); }
  if (u.protocol !== "https:" || u.username || u.password) bad(`${name} is not an https: address`);
  if (bare && (u.search || u.hash || v.includes("?") || v.includes("#"))) bad(`${name} carries a query or fragment`);
  return u;
}

/* The four deploy values (R4–R7), read and checked on every request; nothing about them is kept. */
export function config(env = {}) {
  const c = {};
  c.installer = unset(env.INSTALLER_ADDRESS) ? null : https(env.INSTALLER_ADDRESS, "INSTALLER_ADDRESS", { bare: true }).href;
  if (unset(env.STEWARDS_ADDRESS)) c.stewards = null;
  else if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(env.STEWARDS_ADDRESS)) c.stewards = env.STEWARDS_ADDRESS;
  else bad("STEWARDS_ADDRESS is not an email address");
  const f = unset(env.FEATURED_CASE) ? null : json(env.FEATURED_CASE, "FEATURED_CASE");
  if (f === null) c.featured = null;
  else {
    if (typeof f !== "object" || Array.isArray(f)) bad("FEATURED_CASE is not an edition");
    const at = https(f.address, "FEATURED_CASE.address", { bare: true });
    if (!/^[A-Za-z0-9._-]+$/.test(f.case ?? "")) bad("FEATURED_CASE.case is not a case id");
    c.featured = {
      href: `${at.origin}/app/published/${f.case}`, case: text(f.title, "FEATURED_CASE.title"), edition: count(f.edition, "FEATURED_CASE.edition"),
      group: text(f.group, "FEATURED_CASE.group"), place: text(f.place, "FEATURED_CASE.place"),
      signer: text(f.signer, "FEATURED_CASE.signer"), date: text(f.date, "FEATURED_CASE.date"),
    };
  }
  const g = unset(env.LISTED_GROUPS) ? [] : json(env.LISTED_GROUPS, "LISTED_GROUPS");
  if (!Array.isArray(g)) bad("LISTED_GROUPS is not a list");
  c.groups = g.map((x, i) => {
    const n = `LISTED_GROUPS[${i}]`;
    if (!x || typeof x !== "object") bad(`${n} is not a group`);
    const cases = count(x.cases, `${n}.cases`), editions = count(x.editions ?? cases, `${n}.editions`);
    if (editions < cases) bad(`${n}.editions is fewer than its cases`);
    return {
      name: text(x.name, `${n}.name`), place: text(x.place, `${n}.place`), focus: text(x.focus, `${n}.focus`),
      href: https(x.address, `${n}.address`).href, cases, editions,
      latest: editions > cases ? text(x.latest, `${n}.latest`) : null,
    };
  });
  return c;
}

function casesOf(g) {
  const t = g.editions > g.cases ? (g.cases === 1 ? PARTS.casesOne : PARTS.casesMany) : (g.cases === 1 ? PARTS.caseOne : PARTS.caseMany);
  return fill(t, { cases: String(g.cases), editions: String(g.editions), date: esc(g.latest ?? "") });
}

export function page(name, c) {
  const stewards = c.stewards === null ? PARTS.stewardsUnset : fill(PARTS.stewardsSet, { address: esc(c.stewards) });
  const installer = c.installer === null ? "" : ` href="${esc(c.installer)}"`;
  const featured = c.featured === null ? "" : fill(PARTS.featured, Object.fromEntries(Object.entries(c.featured).map(([k, v]) => [k, esc(v)])));
  if (name === "groups" && !c.groups.length) name = "groupsEmpty";
  const rows = c.groups.map((g) => fill(PARTS.groupRow, { name: esc(g.name), place: esc(g.place), focus: esc(g.focus), href: esc(g.href), cases: casesOf(g) })).join("");
  return fill(PAGES[name], { stewards, installer, featured, rows });
}

function headers(c, type) {
  const h = new Headers({
    "Content-Type": type, "Content-Security-Policy": CSP, "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "Cache-Control": "no-cache",
  });
  if (!c || c.stewards === null) h.set("X-Robots-Tag", "noindex");
  return h;
}

function asset(name) {
  const f = Object.hasOwn(ASSET_FILES, name) ? ASSET_FILES[name] : null;
  if (!f) return null;
  if (f.encoding !== "base64") return { type: f.type, body: f.body };
  const bin = atob(f.body), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { type: f.type, body: bytes };
}

export default {
  async fetch(request, env) {
    const method = request.method;
    let c = null;
    try { c = config(env); } catch (e) {
      if (!(e instanceof ConfigError)) throw e;
      return new Response(null, { status: 500, headers: headers(null, "text/plain") });
    }
    if (method !== "GET" && method !== "HEAD") {
      const h = headers(c, "text/plain");
      h.set("Allow", "GET, HEAD");
      return new Response(null, { status: 405, headers: h });
    }
    const path = new URL(request.url).pathname;
    let status = 200, type = "text/html; charset=utf-8", body;
    if (Object.hasOwn(ROUTES, path)) body = page(ROUTES[path], c);
    else if (path.startsWith(ASSETS) && asset(path.slice(ASSETS.length))) {
      const a = asset(path.slice(ASSETS.length));
      type = a.type.startsWith("text/") || a.type === "image/svg+xml" ? `${a.type}; charset=utf-8` : a.type;
      body = a.body;
    } else { status = 404; body = page("notFound", c); }
    return new Response(method === "HEAD" ? null : body, { status, headers: headers(c, type) });
  },
};

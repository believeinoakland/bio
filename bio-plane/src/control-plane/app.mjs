/* control-plane R75 (T46; N897 (1); DEC-122 (3); N559; `draft-T46-interface.md` §1.2): THE MEMBER INTERFACE'S ROUTES,
   beside `/` (R1), answered before `path` and `op` exist, as `/` is.
     - `GET /app` and `GET /app/<path>` (any path below it but the assets) answer `interface-shell`'s page, built at each
       request by `interfacePage` over the screen modules' `SCREENS` (R81: nine, with screens-wizards' guide), `text/html`, `cache-control: no-store`; the
       routing below `/app` is the page's own (interface-shell R9), so every such path answers the same page. The page
       policy is `answer-envelope`'s (its R6), applied to every HTML answer on the way out: for this page it names the shell's script by its
       hash, in place of a nonce (fix round 3, C15). A page that
       cannot be built (a broken screen: `interfacePage` throws, naming it) is never served: the throw reaches the door's
       one catch, `PLANE_INTERNAL_ERROR` (R25).
     - `GET /app/shell-<version>.js` answers the shell's script (interface-shell's `interfaceScript`) at the address that carries the release
       version, `text/javascript`, `cache-control: public, max-age=31536000, immutable` (R75, fix round 3); only the plane's own version is
       served there, any other is 404.
     - `GET /app/assets/<name>` answers `interface-assets`' file of that name (`ASSET_FILES`, its R1; a name may hold `/`,
       `fonts/<f>`) with its content type and its bytes, a face's decoded from base64; `cache-control: no-cache` with an
       `etag` of the plane's version and the name, so the browser keeps the file and reuses it, answered 304, while the
       plane's version is unchanged. Any other name is answered 404 with no body of the record's.
   All go through the same namespace and address gates as `/` (`admission` R1, R20), which the door runs before calling
   here. No credential is read on either route: the page holds no secret, and every read is an op under the member's
   session. */

import { versionOfScriptPath } from "../interface-shell/index.mjs";

const APP = "/app";
const ASSETS = "/app/assets/";

/** Which of the three routes a request names: `"page"`, `"asset"`, `"script"` (the shell's script at its versioned address,
 *  R75), or null for none. Only a GET (or HEAD) is any. */
export function appRouteOf(req, url) {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  const p = url.pathname;
  if (p.startsWith(ASSETS)) return "asset";
  if (versionOfScriptPath(p) !== null) return "script";
  if (p === APP || p.startsWith(`${APP}/`)) return "page";
  return null;
}

/** The page, built at this request from the screens handed in (`interfacePage(screens, options)`; R81: the nine screen
 *  modules' screens and screens-wizards' guide). `status` is 200 but for R104's "nothing is here" page, 404. */
export function appPage(req, { interfacePage, screens, options = {}, status = 200 }) {
  const html = interfacePage(screens, options);
  return new Response(req.method === "HEAD" ? null : html,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

/* R75 (fix round 3, C15, P2.4; K4353, K4356; interface-shell R1): THE SHELL'S SCRIPT, at the address that carries the release version
   (`/app/shell-<version>.js`, interface-shell's `scriptPath`): `text/javascript`, kept a year and `immutable`, so a caller that holds
   a release's script is not sent it again and a new release has a new address. Only the plane's own version is served there: the
   script of any other version is not this release's, and is answered 404 as an unknown asset is. The page that loads it keeps
   `no-store` (`appPage`). `source` is interface-shell's `interfaceScript` over the screens the page is built from. */
export const SCRIPT_CACHE = "public, max-age=31536000, immutable";
export function appScript(req, url, { source, version }) {
  const here = version === undefined || version === null || version === "" ? "0" : String(version);
  if (versionOfScriptPath(url.pathname) !== here) return notFound();
  return new Response(req.method === "HEAD" ? null : source, { status: 200,
    headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": SCRIPT_CACHE, "x-content-type-options": "nosniff" } });
}

/* R104 (T50; N1174, B-14; DEC-299 (11), DEC-301 (3); interface-shell R79): AN ADDRESS OUTSIDE THE TEAM'S PAGES DRAWS A PAGE.
   A GET or HEAD of a path that is not `/`, not `/app` or below it, not `/api` or below it, not `/version` or
   `/favicon.ico` (answered before this is asked; `/sign` is no route, R109, so it is an unknown address like any other), carries no `op=` and names no op draws the interface's public
   "nothing is here" page with status 404: the page is the shell's own (it reads the address and draws `unavailable` in
   the public frame, no session read), so this answers the same page the other routes do, at that status. `/doorbell`
   and `/tour` (a trailing slash allowed) are the doorbell's and the tour's own addresses, the same page at 200. A path
   naming an op (`/bootstrap`), an `op=` request, a path below `/api/` and any other method are not answered here:
   they stay the op door's, `UNKNOWN_OP` JSON byte for byte when no op is named (R2). `opNamed(name)` is the door's
   own test of an op's name (its spec table, an alias read as the op it is). Answers `{status}`, or null. */
export const PUBLIC_ALIASES = Object.freeze(["/doorbell", "/tour"]);
export function addressPageOf(req, url, { opNamed }) {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  const p = url.pathname;
  if (p === "/api" || p.startsWith("/api/") || url.searchParams.get("op")) return null;
  const bare = p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
  if (bare === "" || bare === "/") return null;
  if (PUBLIC_ALIASES.includes(bare)) return { status: 200 };
  return opNamed(bare.slice(1)) ? null : { status: 404 };
}

/* A face's bytes, from the base64 its entry holds. */
function decoded(body) {
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const notFound = () => new Response("Not found\n", { status: 404,
  headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

/** One asset by its published name, from `assets` (`ASSET_FILES`); `version` is the plane's (`env.VERSION`). */
export function appAsset(req, url, { assets, version }) {
  let name;
  try { name = decodeURIComponent(url.pathname.slice(ASSETS.length)); } catch { return notFound(); }
  if (!name || !assets || !Object.hasOwn(assets, name)) return notFound();
  const file = assets[name];
  const etag = `"${String(version || "0.0.0").replace(/[^0-9A-Za-z.+-]/g, "")}:${name.replace(/[^0-9A-Za-z./_-]/g, "")}"`;
  const headers = { "content-type": file.type, "cache-control": "no-cache", etag };
  const held = req.headers.get("if-none-match");
  if (held && held.split(",").map((t) => t.trim().replace(/^W\//, "")).includes(etag))
    return new Response(null, { status: 304, headers });
  const bytes = file.encoding === "base64" ? decoded(file.body) : file.body;
  return new Response(req.method === "HEAD" ? null : bytes, { status: 200, headers });
}

/* R84 (T47; DEC-205; instance-setup R84, R86; K3149): THE GROUP'S LOGO, at `/app/assets/group-logo`, public as every asset
   is: served by instance-setup's `groupLogoAsset` (the namespace's store-internal `grouplogo` route's bytes with their
   type, `no-store`, `nosniff`; 404 when none is set; a silence otherwise), which the door calls once its gates have run.
   No credential is read. */
export const GROUP_LOGO = "group-logo";
export function logoAsked(url) { return url.pathname === `${ASSETS}${GROUP_LOGO}`; }

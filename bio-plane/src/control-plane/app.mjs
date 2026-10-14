/* control-plane R75 (T46; N897 (1); DEC-122 (3); N559; `draft-T46-interface.md` §1.2): THE MEMBER INTERFACE'S TWO ROUTES,
   beside `/` (R1), answered before `path` and `op` exist, as `/` is.
     - `GET /app` and `GET /app/<path>` (any path below it but the assets) answer `interface-shell`'s page, built at each
       request by `interfacePage` over the four screen modules' `SCREENS`, `text/html`, `cache-control: no-store`; the
       routing below `/app` is the page's own (interface-shell R9), so every such path answers the same page. The page
       policy and its nonce are `answer-envelope`'s (its R6), applied to every HTML answer on the way out. A page that
       cannot be built (a broken screen: `interfacePage` throws, naming it) is never served: the throw reaches the door's
       one catch, `PLANE_INTERNAL_ERROR` (R25).
     - `GET /app/assets/<name>` answers `interface-assets`' file of that name (`ASSET_FILES`, its R1; a name may hold `/`,
       `fonts/<f>`) with its content type and its bytes, a face's decoded from base64; `cache-control: no-cache` with an
       `etag` of the plane's version and the name, so the browser keeps the file and reuses it, answered 304, while the
       plane's version is unchanged. Any other name is answered 404 with no body of the record's.
   Both go through the same namespace and address gates as `/` (`admission` R1, R20), which the door runs before calling
   here. No credential is read on either route: the page holds no secret, and every read is an op under the member's
   session. */

const APP = "/app";
const ASSETS = "/app/assets/";

/** Which of the two routes a request names: `"page"`, `"asset"`, or null for neither. Only a GET (or HEAD) is either. */
export function appRouteOf(req, url) {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  const p = url.pathname;
  if (p.startsWith(ASSETS)) return "asset";
  if (p === APP || p.startsWith(`${APP}/`)) return "page";
  return null;
}

/** The page, built at this request from the screens handed in (`interfacePage(screens)`). */
export function appPage(req, { interfacePage, screens }) {
  const html = interfacePage(screens);
  return new Response(req.method === "HEAD" ? null : html,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
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

/* R84 (T47; DEC-205; instance-setup R84, R86): THE GROUP'S LOGO, at `/app/assets/group-logo`, public as every asset is: the
   store-internal route `grouplogo` of the namespace addressed answers the stored bytes with their `content-type`, served
   with that type, `no-store` (an administrator may replace or clear it) and `nosniff`; anything else (none set, a type
   that is not an image of the two the owner keeps, a refusal, a silence) is answered 404 with no body of the record's.
   No credential is read. */
export const GROUP_LOGO = "group-logo";
const LOGO_TYPES = Object.freeze(["image/png", "image/jpeg"]);
export function logoAsked(url) { return url.pathname === `${ASSETS}${GROUP_LOGO}`; }
export async function groupLogo(req, stub) {
  let res = null;
  try { res = await stub.fetch(new Request("http://do/grouplogo", { method: "GET" })); } catch { res = null; }
  const type = res ? String(res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() : "";
  if (!res || res.status !== 200 || !LOGO_TYPES.includes(type)) return notFound();
  const bytes = new Uint8Array(await res.arrayBuffer());
  return new Response(req.method === "HEAD" ? null : bytes, { status: 200,
    headers: { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

/* store-request R19 (STORE-REQUEST #8, B21 START; K5251; SCREENS-INTAKE #28 J60 (c)): the recipes of four states of a capture the screens-intake tests lost for want of a recipe: a page captured as a
   visitor saw it, a capture unfinished with its supporting files outstanding, an address capture held in parts, and a reading that follows a promotion. Each is real acts through the world's door
   and the real store's own code; none inserts a row. The platform enters only as the world's doubles: the network (`world.script`, the platform's own "too many subrequests" among its answers) and
   the browser renderer bound as `RENDERER` (`storeWorld({ renderer: true })`). */
import { createHash } from "node:crypto";
import { delivered } from "./recipes-r10.mjs";
import { doorOf, fileDocument, resultOf, refusedAct } from "./door.mjs";

const MiB = 1048576;
const SHELL = "<html><head><title>Loading</title></head><body><div id=\"app\"></div></body></html>";
const VISITOR_PAGE = "<html><head><title>City Council meeting</title></head><body><h1>City Council meeting</h1><p>The council met on Tuesday and voted on the budget.</p></body></html>";

/** The browser renderer a world made with `renderer: true` binds as `RENDERER` (the platform's service binding, a double: K5044 (1)). It answers the plane's render request with the page
 *  the recipe served for the address (`serve`), as a browser's serialised document: `hold()` keeps the answer back until `release()` (a render still being made), `fail(answer)` makes the next
 *  answers the failure given (capture-sources' published `renderFailure`), `calls` the requests it was asked. */
export function makeRenderer() {
  const r = { calls: [], pages: new Map(), failure: null, gate: null };
  r.serve = (address, html) => { r.pages.set(address, html); };
  r.hold = () => { if (r.gate) return; let open; const promise = new Promise((res) => { open = res; }); r.gate = { promise, open }; };
  r.release = () => { const g = r.gate; r.gate = null; if (g) g.open(); };
  r.fail = (answer) => { r.failure = answer; };
  r.fetch = async (_url, init) => {
    const asked = JSON.parse(init.body);
    r.calls.push(asked);
    if (r.gate) await r.gate.promise;
    if (r.failure) return new Response(JSON.stringify(r.failure));
    // fixtures-own: platform the browser's answer to a render request (the RENDERER binding is the platform's, a double)
    return new Response(JSON.stringify({ ok: true, html: r.pages.get(asked.url) ?? VISITOR_PAGE, elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
      dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: asked.url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } }));
  };
  return r;
}

function rendererOf(world) {
  if (!world.renderer) throw new Error("storeWorld: this recipe needs the browser renderer: make the world with storeWorld({ renderer: true })");
  return world.renderer;
}
const page = (world, address, html) => world.script(address, async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } }));
const settle = (ms = 50) => new Promise((r) => setTimeout(r, ms));

/** R19: a page captured as a visitor saw it, by the real act: the source serves a shell (`shell`), the renderer the page a browser makes of it (`html`), and `as`'s real `acquire` with
 *  `render: true` makes the capture of the rendered document (`capture.method` `rendered`, the shell kept beside it as the pair). Needs `storeWorld({ renderer: true })`. Answers
 *  `{address, answer, document}` (the owner's answer and its document). */
export async function rendered(world, as, { address = "https://events.example.gov/council", shell = SHELL, html = VISITOR_PAGE, project = null } = {}) {
  const renderer = rendererOf(world);
  page(world, address, shell);
  renderer.serve(address, html);
  const answer = await as.act("acquire", { body: { locator: address, render: true, ...(project ? { project } : {}) } });
  const document = answer.document;
  if (!document || !document.capture || document.capture.method !== "rendered")
    throw new Error(`storeWorld: the capture at ${address} was not made as a visitor saw it: ${JSON.stringify(answer).slice(0, 300)}`);
  return { address, answer, document };
}

/** R19: a capture whose render is still being made, by the real act: the renderer keeps its answer back (`hold`), so `as`'s real `acquire` with `render: true` waits the bound the call gives a
 *  render (10 s) and answers the shell it fetched with `render_pending` and the session that is finishing it. The member's open captures list it (outstanding). Needs `storeWorld({ renderer: true })`.
 *  `release()` lets the renderer answer (the object finishes the render as the alarm would); then `as`'s `acquire` with `{ continue: session }` answers the visitor copy, or `world.tick` (a world made
 *  with `deliver: true`) has the alarm file it. Answers `{address, session, answer, listed, release}`. */
export async function renderPending(world, as, { address = "https://events.example.gov/council", shell = SHELL, html = VISITOR_PAGE, project = null } = {}) {
  const renderer = rendererOf(world);
  page(world, address, shell);
  renderer.serve(address, html);
  renderer.hold();
  const answer = await as.act("acquire", { body: { locator: address, render: true, ...(project ? { project } : {}) } });
  const session = answer.document && answer.document.render_pending && answer.document.render_pending.session;
  if (!session) throw new Error(`storeWorld: the render at ${address} was not left pending: ${JSON.stringify(answer).slice(0, 300)}`);
  return { address, session, answer, listed: (await as.read("opencaptures")).captures,
           release: async () => { renderer.release(); await settle(); } };
}

/** R19: a capture unfinished with its supporting files outstanding, by the real act: `as`'s `acquire` with `subresources: true` over a page that names `images` pictures, the platform stopping the
 *  call after `ceiling` subrequests (its own "too many subrequests" error, what the runtime does past its limit). The primary is held, `ceiling` pictures are kept, and the rest are owed: the
 *  answer's `snapshot` states `outstanding`, a session is kept and the member's open captures list it. `lift()` has the platform stop limiting, so the next `{ continue: session }` fetches
 *  what the ceiling it observed allows (a capture's pictures fall to several continuations). Answers `{address, images, session, outstanding, answer, listed, lift}`. */
export async function unfinished(world, as, { address = "https://www.oaklandca.gov/events/gallery", images = 12, ceiling = 5, project = null } = {}) {
  const html = `<html><head><title>Gallery</title></head><body><h1>Gallery</h1><p>Photographs of the meeting.</p>${Array.from({ length: images }, (_, i) => `<img src="${address}/img/${i}.png">`).join("\n")}</body></html>`;
  let spent = 0, limited = true;
  page(world, address, html);
  for (let i = 0; i < images; i++) {
    world.script(`${address}/img/${i}.png`, async () => {
      if (limited && ++spent > ceiling) throw new Error("Too many subrequests by single Worker invocation.");
      return new Response(new Uint8Array([137, 80, 78, 71, i]), { status: 200, headers: { "content-type": "image/png" } });
    });
  }
  const answer = await as.act("acquire", { body: { locator: address, subresources: true, ...(project ? { project } : {}) } });
  const session = answer.snapshot && answer.snapshot.continuation && answer.snapshot.continuation.session;
  if (!session || !(answer.snapshot.outstanding > 0))
    throw new Error(`storeWorld: the capture at ${address} was not left with files outstanding: ${JSON.stringify(answer.snapshot || answer).slice(0, 300)}`);
  return { address, images, session, outstanding: answer.snapshot.outstanding, answer, listed: (await as.read("opencaptures")).captures,
           lift: () => { limited = false; } };
}

/** R19: a capture of an address held in parts, by the real alarm: the source declares a file of `mib` MiB (default 10), over the 8 MiB the call reads (`LARGE_FETCH_BYTES`), so `as`'s real
 *  `acquire` parks it as an owed fetch and answers no document; the store's alarm (a world made with `deliver: true`) runs the fetch, the real `owedFetch` streams it in parts of 8 MiB, and the
 *  delivery files the document, the capture held in its parts (a file past 32 MiB is held in its parts alone). The bytes are the recipe's, a seeded filler under a PDF header. Answers `{...delivered, bundle, parts}`: `parts` the document's part files, in order,
 *  as the record's image lists them (a file that fits one part is not parked: the recipe throws). */
export async function partedAddress(world, as, { address = "https://www.oaklandca.gov/files/packet.pdf", mib = 10, project = null } = {}) {
  const bytes = mib * MiB;
  const body = new Uint8Array(bytes);
  const seed = createHash("sha256").update(address).digest();
  for (let i = 0; i < body.length; i += 4099) body[i] = seed[i % seed.length] ^ (i >>> 12);
  body.set(new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Title (Packet) >> endobj\n"), 0);
  const made = await delivered(world, as, { address, bytes, body, project });
  if (!made.copy || !made.copy.document) throw new Error(`storeWorld: the capture at ${address} was not filed by the alarm: ${JSON.stringify(made.copy)}`);
  const image = await made.as.read("image", { query: { id: made.copy.document } });
  const parts = Object.keys(image).filter((k) => /\.part\d{3}$/.test(k));
  if (parts.length < 2) throw new Error(`storeWorld: a file of ${bytes} bytes was held whole, not in parts`);
  return { ...made, bundle: made.copy.document, parts };
}

/** R19: a reading that follows a promotion, by the real acts: `as` uploads a file (`captureupload`: the owner's answer carries no reading) and the real `promote` files it as the capture screen
 *  files it; a world made with `follow: true` follows the promotion as the door does (the reading's job row, then extraction's `readHeld`). The reading is made at once for a file the store
 *  holds whole; for a document it cannot read at once the row stands and the promotion's answer says `reading_pending`. *  files an upload as it is, with none. Answers `{sha, bundle, upload, promoted, reading}`: `promoted` the owner's answer of the promotion (with the follow's flag), `reading` the
 *  record's reading of the digest (`found` false when none). */
export async function followed(world, as, name, content, { project = "", type = "text/html" } = {}) {
  if (!world.__follow) throw new Error("storeWorld: recipes.followed needs the door to follow a promotion: make the world with storeWorld({ follow: true })");
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  const up = await doorOf(world)({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name, ...(type !== "text/plain" ? { type } : {}) })}`,
                                   init: { method: "POST", headers: { "content-type": type }, body: bytes } }, as);
  const doc = resultOf(up) && resultOf(up).document;
  if (!doc || !doc.capture) throw refusedAct("captureupload", up);
  const out = {};
  const filed = await fileDocument(world, as, name, doc, project, out);
  return { sha: filed.sha, bundle: filed.bundle, upload: doc, promoted: out.promoted, reading: await as.read("reading", { query: { sha256: filed.sha } }) };
}

/* acquisition's published fixtures (fix round 10; K4990, K4993, K4995, K5044): the answers this module's real code gives, made when a
 * test runs and never stored. A user takes the answer from here instead of hand-building acquisition's answer (a 502 refusal, an
 * archive's `unpack`, an owed-work entry's end). Each is checked by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { world, run, network, HTML, page, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { world as credentialsWorld } from "../credentials/fixture.mjs";
import { renderFailure } from "../capture-sources/fixtures.mjs";
import { acquire, unpack, owedFetch, owedRun, readRange, citationLookup, DELIVERY_FINAL } from "../../../src/acquisition/index.mjs";

/** `acquireRefusals`: the real `acquire(body, opts)` answer `{status, body}` of a capture that is refused: `source_refused` (the source answered
 *  410: 502 SOURCE_REFUSED with its `status`), `fetch_failed` (the request did not complete: 502 FETCH_FAILED) or `not_eligible` (the archive arm
 *  for an address not eligible: 409 NOT_ELIGIBLE). */
export async function acquireRefusals({ kind } = {}) {
  const w = world();
  const take = ({ status, body }) => ({ status, body });
  if (kind === "source_refused") return take(await run(w, { "https://a.example/r": new Response("no", { status: 410 }) }, { locator: "https://a.example/r" }));
  if (kind === "fetch_failed") return take(await run(w, { "https://a.example/t": new Error("reset") }, { locator: "https://a.example/t" }));
  if (kind === "not_eligible") return take(await run(w, {}, { via: "archive.org", address: "https://gone.example/doc" }, { cls: "admin" }));
  throw new Error(`acquireRefusals: no refusal kind "${kind}"`);
}

/** `archiveAnswer`: the real answer `{status, body}` of `acquire` over a generated archive locator (test-support's zip generator):
 *  `body` is `{ok, existed, document, unpack: {ok, archive: {sha256}, documents, complete}}`. `memberBytes` is the size in bytes of each
 *  text member (distinct bytes each), so a user states a member's size (a reading of INLINE_MAX + n) and not its text. */
export async function archiveAnswer({ memberBytes = [64, 64], url = "https://files.example/set.zip" } = {}) {
  const w = world();
  const zip = makeZip(memberBytes.map((n, i) => ({ name: `m${String(i + 1).padStart(3, "0")}.txt`, data: `member ${i + 1}:`.padEnd(n, "x") })));
  const { status, body } = await run(w, { [url]: () => new Response(zip, { headers: { "content-type": "application/zip" } }) }, { locator: url });
  return { status, body };
}

/** `archiveNotHeld`: the real answer of an `unpack` of an archive this capture does not hold: `{ok: false, reason: "ARCHIVE_NOT_HELD"}`. */
export async function archiveNotHeld({ archiveSha = sha("an archive nobody captured") } = {}) {
  return unpack(world().store, { archiveSha, cls: "daemon" });
}

/** `keyedServiceOff`: the real `citationLookup` answer of a team whose key for the service is not held (credentials' real `keyedServiceFor`):
 *  `{ok: false, reason: "KEYED_SERVICE_OFF", code, service}`. */
export async function keyedServiceOff({ text = "Roe v. Wade, 410 U.S. 113 (1973)", viewer = "member:ann" } = {}) {
  const store = { credentials: credentialsWorld().c, env: {} };
  const net = network({});
  try { return await citationLookup(store, { text, viewer }); } finally { net.restore(); }
}

/** `notHeldRange`: the real `readRange` answer for a digest a store holds nothing of: `{ok: false, reason: "NOT_HELD"}`. */
export async function notHeldRange({ sha: digest = sha("held nowhere"), offset = 0, length = 16 } = {}) {
  return readRange(world().store, digest, offset, length);
}

/* ---- the owed-work ledger's runs: a parked entry, run by the alarm ---- */

const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const MIB = 1024 * 1024;
const big = new Uint8Array(9 * MIB).fill(7);
const bigSource = () => new Response(big, { headers: { "content-type": "application/pdf", "content-length": String(big.length) } });

/* a fetch parked as owed work (R105): a 9 MiB capture is over what the call fetches within its bound */
async function parkedFetch(w) {
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [BIG]: bigSource }, { locator: BIG, project: "P" }, { settle: false });
  return first.body.fetch_pending.session;
}

/** `owedFetchAnswer`: the real `owedFetch` answer of a parked fetch the alarm runs. `kind` is `done` (the delivery accepted it: `{ok, done: true}`),
 *  `outstanding` (the delivery was refused for a cause that may pass, `reason` its code, default `DELIVERY_FAILED`: `{ok, done: false,
 *  outstanding: 1, reason}`), `gone` (the session is gone: `{ok, done: true, reason: "NO_SUCH_SESSION"}`) or `final` (`reason` one of
 *  `DELIVERY_FINAL`, default `CAPTURE_HELD_BY_ANOTHER_BUNDLE`: the refusal ends the entry, carrying its `kind`, `capture_sha` and `holder`
 *  as `detail`; or `SOURCE_REFUSED`: the source answered 404 on the try). */
export async function owedFetchAnswer({ kind, reason } = {}) {
  const w = world();
  const session = kind === "gone" ? "fp_nobody" : await parkedFetch(w);
  const net = network({ [BIG]: kind === "final" && reason === "SOURCE_REFUSED" ? () => new Response("gone", { status: 404 }) : bigSource });
  try {
    if (kind === "done" || kind === "gone") {
      // fixtures-contract: control-plane deliver-owed
      return await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: true }) });
    }
    if (kind === "outstanding") {
      // fixtures-contract: control-plane deliver-owed
      return await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: false, reason: reason ?? "DELIVERY_FAILED" }) });
    }
    if (kind === "final") {
      const why = reason ?? "CAPTURE_HELD_BY_ANOTHER_BUNDLE";
      if (why === "SOURCE_REFUSED") return await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: true }) });
      if (!DELIVERY_FINAL.includes(why)) throw new Error(`owedFetchAnswer: "${why}" is no final reason`);
      // fixtures-contract: control-plane deliver-owed
      return await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: false, reason: why,
        ...(why === "CAPTURE_HELD_BY_ANOTHER_BUNDLE" ? { detail: { kind: "whole", capture_sha: sha("a held capture"), holder: "INFO-2026-0001" } } : {}) }) });
    }
    throw new Error(`owedFetchAnswer: no kind "${kind}"`);
  } finally { net.restore(); }
}

const SHELL = HTML("<div id=app></div>");
const RENDERED = (url) => ({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 12, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests: [], scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } });
const PG = "https://r.example/pending";
const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio", renderBackoffMs: [0, 0] };

/** `owedRunAnswer`: the real `owedRun` answer of a pending visitor-copy render the alarm runs. `kind` is `done` (rendered and delivered:
 *  `{ok, done: true}`), `outstanding` (the delivery was refused for a cause that may pass, `reason` default `DELIVERY_FAILED`: `{ok, done: false,
 *  outstanding: 1, reason}`) or `final` (`reason` `RENDER_FAILED`: the render failed for good, with its `detail`; `RENDER_NOT_A_PAGE`: the
 *  address answers no page; or one of `DELIVERY_FINAL`: the delivery was refused for good, carrying the refusal's facts). */
export async function owedRunAnswer({ kind, reason } = {}) {
  let open; const gate = new Promise((r) => (open = r));
  const failed = kind === "final" && reason === "RENDER_FAILED" ? await renderFailure({ class: "no_session" }) : null;
  const w = world({ env: { RENDERER: { fetch: async (u, init) => { await gate; return new Response(JSON.stringify(failed ?? RENDERED(JSON.parse(init.body).url))); } } } });
  const entries = new Map();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.set(e.session, e); return { ok: true }; };
  const notAPage = kind === "final" && reason === "RENDER_NOT_A_PAGE";
  const net = network({ [PG]: () => (notAPage ? new Response("%PDF-1.4", { headers: { "content-type": "application/pdf" } }) : page(SHELL)) });
  const log = console.log;
  try {
    const first = await run(w, { [PG]: () => page(SHELL) }, { locator: PG, render: true }, { renderWaitMs: 20 });
    const session = first.body.document.render_pending.session;
    /* a page that turns into no page: the object restarts before the render returned, so the run is begun afresh (R99) over what the address serves now */
    if (!notAPage) { open(); await new Promise((r) => setTimeout(r, 50)); }
    const entry = entries.get(session);
    // fixtures-contract: control-plane deliver-owed
    const deliver = kind === "outstanding" ? async () => ({ ok: false, reason: reason ?? "DELIVERY_FAILED" })
      : kind === "final" && DELIVERY_FINAL.includes(reason) ? async () => ({ ok: false, reason,
        ...(reason === "CAPTURE_HELD_BY_ANOTHER_BUNDLE" ? { detail: { kind: "whole", capture_sha: sha("a held capture"), holder: "INFO-2026-0001" } } : {}) })
      : async () => ({ ok: true });
    const fresh = notAPage ? await import("../../../src/acquisition/index.mjs?restart=fixture-not-a-page") : { owedRun };
    console.log = () => {};                    /* the module logs a failed render on one structured line; a fixture is quiet */
    return await fresh.owedRun(w.store, entry, { deliver });
  } finally { console.log = log; net.restore(); }
}

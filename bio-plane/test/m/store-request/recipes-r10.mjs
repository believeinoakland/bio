/* store-request R19 (STORE-REQUEST #7, B18 START; K5197, K5227): the recipes of the states a world needs the store's own clock, first boot and delivery for: an older installation, an owed
   delivery, a session that left the list, a release notice. Each is real acts and real store code over a world; none inserts a row. The platform enters only as the world's network. */
import { captureOf } from "../../../src/capture/index.mjs";
import { OWED_SESSION_TTL_MS } from "../../../src/acquisition/index.mjs";
import { RELEASE_NOTICE_ADDRESS } from "../../../src/setup.mjs";
import { releaseNoticeStatement, NS_RELEASE_NOTICE } from "../../../src/sshsig.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";
import { signIn, fileDocument, resultOf } from "./door.mjs";

/** The release key a world made with `releaseKeys: true` verifies a notice against (the private half is a test's, `BIOKEY-RAW1` seed of 32 bytes). */
export const WORLD_RELEASE_KEY = `BIOKEY-RAW1.bio-release.${Buffer.from(new Uint8Array(32).map((_, i) => (i * 41 + 9) % 256)).toString("base64")}`;
export const WORLD_RELEASE_KEYS = Object.freeze([signerPublicLine(WORLD_RELEASE_KEY)]);
/** The running release a world made with `releaseKeys: true` reports (a notice for a later one is news). */
export const WORLD_RUNNING_VERSION = "0.84.0";

/** The delivery a world made with `deliver: true` hands the owed-work ledger, as control-plane's `deliverOwedRender` files an owed fetch (its document promoted at `collected` by the
 *  session's opener, under the project the session names; the fetch recorded done for the notice that tells her): from the earlier modules' real acts. An owed fetch whose bytes the record
 *  already holds is linked, not filed again. The owner's refusal of the promotion is handed back as it answered; a state no real alarm hands it (no document, no session, no opener) throws. */
export function worldDelivery(world) {
  return async ({ answer, session } = {}) => {
    const doc = answer && typeof answer === "object" ? answer.document : null;
    const sha = doc && doc.capture && doc.capture.sha256;
    if (typeof sha !== "string" || !/^[0-9a-f]{64}$/.test(sha)) throw new Error("storeWorld: the delivery was handed no document");
    const cap = captureOf(world.ctx);
    const ld = cap.loadCaptureSession({ session });
    if (!ld || !ld.found) throw new Error(`storeWorld: the delivery was handed a session that is gone (${session})`);
    const opener = ld.state && typeof ld.state.opened_by === "string" ? ld.state.opened_by : "";
    if (!opener) throw new Error(`storeWorld: the session ${session} has no opener`);
    const member = opener.startsWith("member:") ? opener.slice("member:".length) : opener;
    const project = ld.state && typeof ld.state.project === "string" ? ld.state.project.trim() : "";
    const done = async (document, filed) => {
      if (ld.state && ld.state.fetch_pending && typeof cap.recordFetchDone === "function")
        await cap.recordFetchDone({ session, document, opener, project: filed || null, at: new Date(world.now()).toISOString() });
    };
    if (answer.existed === true) {
      const held = await cap.heldAt({ sha256: sha, viewer: opener });
      if (held && held.held === true && held.copy && held.copy.document) { await done(held.copy.document, held.copy.project || project); return { ok: true, bundleId: held.copy.document, existed: true }; }
    }
    const as = await signIn(world, member);
    const title = (doc.reading && doc.reading.title) || String(doc.locator || "A capture");
    try {
      const filed = await fileDocument(world, as, title, doc, project);
      await done(filed.bundle, project);
      return { ok: true, bundleId: filed.bundle };
    } catch (e) {
      if (e && e.answer) return { ...resultOf(e.answer), ok: false };   /* the owner's own refusal of the promotion, as it answered it */
      throw e;
    }
  };
}

/** R19: an older installation, one that recorded no producing team (installs before the team was recorded; K5197): a world whose first boot bound no `INSTANCE_NAME`. `instance-setup`
 *  answers `group: null` (`groupidentity`) and a claim on the team's website has no file to look for. Other options are the world's. */
export function olderInstallation(makeWorld, opts = {}) {
  return makeWorld({ ...opts, instanceName: null });
}

const SOURCE_BYTES = 17_400_000;
/** R19: a capture owed, by the real act: the source at `address` declares `bytes` (too large to wait for), so `as`'s real `acquire` parks it as an owed fetch and answers `fetch_pending`. The
 *  world's `deliver` (or none: it stays owed for ever) decides what the next tick does. The source then serves `body` as the file. Answers `{address, bytes, session, pending, listed}`
 *  (`listed` the member's open captures as the owner answers them). */
export async function owed(world, as, { address = "https://www.govinfo.gov/content/pkg/BUDGET-2021-APP/pdf/BUDGET-2021-APP.pdf", bytes = SOURCE_BYTES, project = null,
                                       body = "%PDF-1.4\n1 0 obj << /Title (Budget) >> endobj\n", type = "application/pdf" } = {}) {
  let parked = true;
  world.script(address, async () => parked
    ? new Response("x", { status: 200, headers: { "content-type": type, "content-length": String(bytes) } })
    : new Response(body, { status: 200, headers: { "content-type": type } }));
  const answer = await as.act("acquire", { body: { locator: address, ...(project ? { project } : {}) } });
  if (!answer.fetch_pending || !answer.fetch_pending.session) throw new Error(`storeWorld: the capture at ${address} was not parked as an owed fetch: ${JSON.stringify(answer).slice(0, 300)}`);
  parked = false;
  return { address, bytes, session: answer.fetch_pending.session, pending: answer.fetch_pending, listed: (await as.read("opencaptures")).captures };
}

/** R19: a session that left the list, by the store's own clock: a capture owed (`owed`), then the world's clock moved past what the store keeps a session for (`OWED_SESSION_TTL_MS`,
 *  or `by` ms), the scheduler's firing run at the new instant. The member's session locks with so long an idle, so she is signed in again. Answers `{...owed, as, after}`: `as` the fresh
 *  session, `after` her open captures now. */
export async function lapsed(world, as, o = {}) {
  const made = await owed(world, as, o);
  await world.tick(o.by ?? OWED_SESSION_TTL_MS + 60_000);
  const fresh = await signIn(world, as.handle);
  return { ...made, as: fresh, after: (await fresh.read("opencaptures")).captures };
}

/** R19: a capture owed and delivered, by the real alarm: a world made with `deliver: true` (`worldDelivery`) runs the owed fetch on a tick; the real `owedFetch` makes the capture, hands the
 *  delivery its document and drops the session. Answers `{...owed, as, after, copy}`: `copy` is `heldat`'s answer for the address (the document the delivery filed). */
export async function delivered(world, as, o = {}) {
  if (!world.__delivery) throw new Error("storeWorld: recipes.delivered needs the world's delivery: make the world with storeWorld({ deliver: true })");
  const made = await owed(world, as, o);
  await world.tick(60_000);
  const fresh = await signIn(world, as.handle);
  return { ...made, as: fresh, after: (await fresh.read("opencaptures")).captures,
           copy: (await fresh.read("heldat", { query: { address: made.address } })).copy };
}

/** R19: a release notice found by the daily check, signed with the world's key: the feed at the product's address serves a notice for `version` signed by `WORLD_RELEASE_KEY`, and the world's
 *  clock moves two days so the check runs and stores it. Needs `storeWorld({ releaseKeys: true })`. `as` is an administrator, who reads it (`updatenotice`). The session lapses with the
 *  idle, so she is signed in again. Answers `{notice, as, read}`: `read` her `updatenotice`. */
export async function releaseNotice(world, as, { version = "0.85.0", date = "2026-10-14", security = false, manifest = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                                                  notes = { members: "Searching is faster.", administrators: "You decide when to update.", must_do: "" }, key = WORLD_RELEASE_KEY } = {}) {
  if (!world.__releaseKeys) throw new Error("storeWorld: recipes.releaseNotice needs the world's release key: make the world with storeWorld({ releaseKeys: true })");
  const notice = { version, date, manifest, security, notes };
  const feed = JSON.stringify({ ...notice, sig: signSshsig(key, releaseNoticeStatement(notice), NS_RELEASE_NOTICE), signer: signerPublicLine(key) });
  world.script(RELEASE_NOTICE_ADDRESS, async () => new Response(feed, { status: 200 }));
  await world.tick(2 * 86_400_000);
  const fresh = await signIn(world, as.handle);
  return { notice, as: fresh, read: await fresh.read("updatenotice") };
}

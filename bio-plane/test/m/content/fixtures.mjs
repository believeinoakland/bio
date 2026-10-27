/* content's published fixtures (fix round 10; K4990, K4993, K4995, K5044): the answers this module's real code gives, made when a test runs and
 * never stored. A user takes the answer from here instead of hand-building content's answer (`captureFor`, `contentContextFor`, a `mint`
 * refusal). Each is checked by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { world, LAYER } from "./fixture.mjs";

/** `contentContextFor`: the real `content` over captures held by the real chain (promotion, provenance) and read with the chains given.
 *  `captures` is `{<name>: {bundleId, chain?, pageCount?, text?}}` (`chain` the reading's, default one unscoped text layer; `{chain: [{step, tier,
 *  container, cap, measured_by, calibration}]}`). Answers `{captureFor, contentContextFor, mint, refusedMint, shas, world}`: `captureFor(bundleId)`
 *  is the bundle's capture sha (or null), `contentContextFor(sha)` the context `{chain, pageCount, pageBoxes, container, ...}`, `mint` the real
 *  mint, `refusedMint()` the real refusal of a mint it is not asked to make (CONTENT_EXTENT_OUT_OF_RANGE: a page past the capture's count), and
 *  `shas` the sha of each named capture. */
export function contentContextFor({ captures = {} } = {}) {
  const w = world();
  const shas = {};
  for (const [name, c] of Object.entries(captures)) {
    const cap = w.cap(name, c.text);
    w.doc(c.bundleId ?? `INFO-2026-${name}`, [cap]);
    w.read(cap.sha, { chain: c.chain ?? LAYER, ...(c.pageCount === undefined ? { pageCount: 1 } : { pageCount: c.pageCount }) });
    shas[name] = cap.sha;
  }
  const first = Object.entries(captures)[0];
  const refusedMint = () => {
    if (!first) throw new Error("contentContextFor: refusedMint needs one capture");
    const [name, c] = first;
    return w.content.mint({ bundleId: c.bundleId ?? `INFO-2026-${name}`, captureSha: shas[name], extent: { kind: "pdf-page", page: 1000 }, mintedBy: "plane" });
  };
  return { captureFor: (bundleId, authored) => w.content.captureFor(bundleId, authored), contentContextFor: (sha) => w.content.contentContextFor(sha),
           mint: (args) => w.content.mint(args), refusedMint, shas, world: w };
}

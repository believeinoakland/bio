/* provenance's published fixtures (K4990, K4993, K4995, K5044): each is made by provenance's real code when a test runs and
   never stored. A user takes the answer or the instance from here instead of hand-building provenance's answer
   (`{homeOf: () => null}`, a stubbed `partsOf`, a hand-written `registerHolds` row). Each is checked by
   `fixtures.test.mjs`, which calls it and compares the real answer. */
import { world, sha, infoMd, provDoc } from "./fixture.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";

export { sha };

const BYTES = 100;
const asDigest = (s) => (/^[0-9a-f]{64}$/.test(String(s)) ? String(s) : sha(String(s)));

/** One bundle holding the named captures, promoted by the real chain (promotion's `promote`, with a register list and the
 *  register document C-18.1 asks for). The files are kept by digest (`blobSha`), as a multipart upload's are, so the
 *  digest named need not be of bytes the test holds. `captures` is `[{sha, path?, bytes?, encoding?}]`. */
function promoteHeld(promotion, bundleId, captures, { base = null, snapKey = null, author = "member:alice" } = {}) {
  const held = captures.map((c, i) => ({
    sha: asDigest(c.sha), path: c.path ?? `snapshots/${i}-${asDigest(c.sha).slice(0, 8)}.bin`,
    bytes: c.bytes ?? BYTES, encoding: c.encoding ?? "binary" }));
  const documents = held.map((c) => provDoc({ path: c.path, text: "x" }, {
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: c.encoding, bytes: c.bytes } }));
  return promotion.promote({
    bundleId, base, snapKey: snapKey ?? `k${Math.random().toString(16).slice(2)}`, author, meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(bundleId) },
            { path: "data/provenance.json", text: JSON.stringify({ documents }, null, 2) },
            ...held.map((c) => ({ path: c.path, blobSha: c.sha, sha256: c.sha, bytes: c.bytes }))],
    register: held.map((c) => ({ sha256: c.sha, path: c.path, encoding: c.encoding, bytes: c.bytes })),
  });
}

/** The real provenance over the user's own record-core, membership and promotion (what `sources/fixture.mjs` builds):
 *  `provenanceOf(host, {record, membership, promotion, now})`, migrated. `host` is the user's `ctx` (the key of the
 *  instance); `now` a function answering an ISO instant. */
export function provenanceOver({ host, record, membership, promotion, now } = {}) {
  const p = provenanceOf(host, { record, membership, ...(promotion ? { promotion } : {}), ...(now ? { now } : {}) });
  p.migrate();
  return p;
}

/** `registeredHomes`: the real provenance of `world()` (or over the user's own `{host, record, membership, promotion,
 *  now}`, as `provenanceOver`), with captures registered by really promoting a bundle carrying a register document.
 *  `register(sha, {bundleId, path, bytes, encoding})` promotes one bundle holding that capture and answers the
 *  promotion's answer; `provenance.homeOf` and `onTestimony` are the real ones. With nothing registered it is the empty
 *  instance. */
export function registeredHomes(own = null) {
  let n = 0;
  const w = own ? null : world();
  const promotion = own ? own.promotion : w.promotion;
  const provenance = own ? provenanceOver(own) : w.prov;
  const many = (bundleId, captures, rest = {}) => promoteHeld(promotion, bundleId, captures, rest);
  const register = (captureSha, { bundleId = `INFO-2026-${String(++n).padStart(4, "0")}-home`, path, bytes, encoding, ...rest } = {}) =>
    many(bundleId, [{ sha: captureSha, path, bytes, encoding }], rest);
  return { provenance, register, many, promotion, world: w };
}

/** `homeOfEmpty`: the real provenance over an empty store; `homeOf(sha)` answers null. */
export function homeOfEmpty() {
  return world().prov;
}

/** `homeOfHomed`: the real provenance with each named capture homed by real promotion; `map` is `{sha: bundleId}`
 *  (captures sharing a bundle are promoted together); `homeOf(sha)` answers `{bundleId, ...}`. */
export function homeOfHomed(map = {}) {
  const { provenance, many } = registeredHomes();
  const byBundle = new Map();
  for (const [captureSha, bundleId] of Object.entries(map)) byBundle.set(bundleId, [...(byBundle.get(bundleId) ?? []), { sha: captureSha }]);
  for (const [bundleId, captures] of byBundle) {
    const r = many(bundleId, captures);
    if (r.ok !== true) throw new Error(`homeOfHomed: ${bundleId}: ${JSON.stringify(r)}`);
  }
  return provenance;
}

/** `homeOfProject`: a project made by the real creation (promoted with no chosen id, so the record mints its `PROJ-` id
 *  and writes it into the document), with `captures` (digests, or strings to digest) registered in it by the real
 *  register act. Answers `{provenance, projectId, homeOf, made}`: `projectId` is the minted id the creation returned,
 *  `homeOf(sha)` the real answer, `{bundleId: projectId, ...}` for a capture registered there, null for any other.
 *  `owner` is the member who creates it; `made` is the promotion's answer. */
export function homeOfProject(captures = [], { owner = "ann", title = "Fixture Project" } = {}) {
  const { provenance, promotion } = registeredHomes();
  const held = captures.map((c, i) => ({
    sha: asDigest(c), path: `snapshots/${i}-${asDigest(c).slice(0, 8)}.bin`, bytes: BYTES, encoding: "binary" }));
  const text = `---\nobject_type: project\ntitle: ${title}\ncurrent_state: forming\n`
    + "created: 2026-09-27T03:00:00.000Z\nlast_updated: 2026-09-27T03:00:00.000Z\n---\n\n## Session Log\n";
  const documents = held.map((c) => provDoc({ path: c.path, text: "x" }, {
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: c.encoding, bytes: c.bytes } }));
  const made = promotion.promote({
    base: null, snapKey: "project", author: `member:${owner}`, ownerMemberId: owner, meta: {},
    files: [{ path: "bundle.md", text },
            ...(held.length ? [{ path: "data/provenance.json", text: JSON.stringify({ documents }, null, 2) }] : []),
            ...held.map((c) => ({ path: c.path, blobSha: c.sha, sha256: c.sha, bytes: c.bytes }))],
    register: held.map((c) => ({ sha256: c.sha, path: c.path, encoding: c.encoding, bytes: c.bytes })),
  });
  if (made.ok !== true) throw new Error(`homeOfProject: ${JSON.stringify(made)}`);
  return { provenance, projectId: made.bundleId, homeOf: (s) => provenance.homeOf(s), made };
}

/** `homeOf`: the real `homeOf(captureSha)` of a capture registered in a bundle through the real register acts:
 *  `{bundleId, path, encoding, bytes, registered, authored}`, or null where nothing registered it (`registered: false`). */
export function homeOf({ capture = null, bundleId = "INFO-2026-0001-home", registered = true, path, bytes, encoding } = {}) {
  const c = capture ?? { sha: sha("a capture") };
  const { provenance, register } = registeredHomes();
  if (registered) {
    const r = register(c.sha, { bundleId, path: path ?? c.path, bytes: bytes ?? c.bytes, encoding: encoding ?? c.encoding });
    if (r.ok !== true) throw new Error(`homeOf: ${JSON.stringify(r)}`);
  }
  return provenance.homeOf(c.sha);
}

/** `homeOfWorld`: the real provenance over a record world where `sha` has a registered home (`bundleId`) or none
 *  (`bundleId: null`), with a call counter wrapped around the real `homeOf`. `provenance` carries `homeOf`, `calls()`
 *  counts the asks, and `real` is the instance. */
export function homeOfWorld({ sha: captureSha = sha("a capture"), bundleId = null } = {}) {
  const { provenance, register } = registeredHomes();
  if (bundleId) {
    const r = register(captureSha, { bundleId });
    if (r.ok !== true) throw new Error(`homeOfWorld: ${JSON.stringify(r)}`);
  }
  let calls = 0;
  return { provenance: { homeOf: (s) => { calls++; return provenance.homeOf(s); } }, calls: () => calls, real: provenance };
}

/** `holdsOf`: the real `registerHolds({sha})` answer `{ok, sha, asked, registered, acquired}` of a provenance whose
 *  register and receipts stand as asked: `registered` registers the capture in a bundle (the real register act),
 *  `acquired` records a receipt for it (the real `recordReceipt`). */
export function holdsOf({ sha: captureSha = sha("a capture"), registered = false, acquired = false, bundle = null } = {}) {
  return holdsWorld({ [captureSha]: { registered, acquired } }).registerHolds({ sha: captureSha, ...(bundle ? { bundle } : {}) });
}

/** `holdsWorld`: `holdsOf` for several captures at once; `states` is `{sha: {registered, acquired}}`. Answers the real
 *  provenance. */
export function holdsWorld(states = {}) {
  const { provenance, register } = registeredHomes();
  let n = 0;
  for (const [captureSha, s] of Object.entries(states)) {
    n++;
    if (s.registered) {
      const r = register(captureSha, { bundleId: `INFO-2026-${String(n).padStart(4, "0")}-held` });
      if (r.ok !== true) throw new Error(`holdsWorld: ${JSON.stringify(r)}`);
    }
    if (s.acquired) provenance.recordReceipt({ address: `https://example.org/${n}`, addressNorm: `example.org/${n}`, captureSha, via: "direct" });
  }
  return provenance;
}

/** `holdsRegister`: the real provenance over seeded captures (`registered` promoted into one bundle, `acquired` given a
 *  receipt): its `registerHolds`, `registeredFor` and `containerResolver` as the user would otherwise write them. */
export function holdsRegister({ registered = [], acquired = [], bundleId = "INFO-2026-0001-seeded" } = {}) {
  const { provenance, many } = registeredHomes();
  if (registered.length) {
    const r = many(bundleId, registered.map((s) => ({ sha: s })));
    if (r.ok !== true) throw new Error(`holdsRegister: ${JSON.stringify(r)}`);
  }
  acquired.forEach((captureSha, i) => provenance.recordReceipt({ address: `https://example.org/${i}`, addressNorm: `example.org/${i}`, captureSha, via: "direct" }));
  return { provenance, registerHolds: (a) => provenance.registerHolds(a), registeredFor: (b) => provenance.registeredFor(b),
           containerResolver: () => provenance.containerResolver() };
}

/** `heldParts`: the real `partsOf` of a multi-part capture registered through the real register path. `parts` is
 *  `[{sha256, bytes}]` in order; `wholeSha` the whole's digest. Answers `{provenance, partsOf}`; `partsOf(sha)` is
 *  null for a digest nothing registered. */
export function heldParts(wholeSha, parts) {
  const { provenance, world: w } = registeredHomes();
  const total = parts.reduce((n, p) => n + p.bytes, 0);
  const path = "snapshots/held";
  const r = w.promotion.promote({
    bundleId: "INFO-2026-0001-held", base: null, snapKey: "held", author: "member:alice", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd("INFO-2026-0001-held") },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc({ path, text: "x" }, {
              capture: { method: "acquire", grade: "B", actor_class: "session", sha256: wholeSha, encoding: "binary", bytes: total },
              parts: parts.map((p, i) => ({ file: `${path}.part${String(i).padStart(3, "0")}`, sha256: p.sha256, bytes: p.bytes })) })] }, null, 1) },
            ...parts.map((p, i) => ({ path: `${path}.part${String(i).padStart(3, "0")}`, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: [{ sha256: wholeSha, path, encoding: "binary", bytes: total,
                 parts: parts.map((p, i) => ({ sha256: p.sha256, path: `${path}.part${String(i).padStart(3, "0")}`, bytes: p.bytes })) }],
  });
  if (r.ok !== true) throw new Error(`heldParts: ${JSON.stringify(r)}`);
  return { provenance, partsOf: (s) => provenance.partsOf(s) };
}

/** `versionChainNoSuchVersion`: the real `versionChain({addressNorm, at})` answer for an address with no such version
 *  (VERSION_CHAIN_NO_SUCH_VERSION, C-24.2). */
export function versionChainNoSuchVersion({ addressNorm = "e.org/a", at = sha("elsewhere"), viewer = "member:x" } = {}) {
  return world().prov.versionChain({ addressNorm, at, viewer });
}

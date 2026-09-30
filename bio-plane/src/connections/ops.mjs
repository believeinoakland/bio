/* connections — the op handler the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index` (its
 * map's §4.4 plain move, K649 (7)): `op=linkproject` (R24–R29, R32). Routing, authentication and the response envelope
 * stay the control plane's: `json`, `doAnswer` (the one reader of a Durable Object's envelope, N247, REC-52),
 * `storeRefusal` (control-plane R23's relay of the store's own refusal) and `storeSilent` are passed in, with the stamps
 * it decided (the viewer and the positional identity). `getStore` answers the Durable Object stub the op is scoped to. */

/* The ops `connectionsOp` answers, which the control plane routes here (host-governor's `GOVERNOR_OPS` precedent). */
export const CONNECTIONS_OPS = Object.freeze(["linkproject"]);

/** R24–R29 (`op=linkproject`): project a capture's resolved links into edges. Separate from op=links because it
 *  WRITES, and the capability gate has to see that. The digest must be 64 lowercase hex (`NEED_CAPTURE`, 400); the rest
 *  is the Durable Object's `projectlinks`, handed the control plane's stamps.
 *
 *  D-706 (T5-11, R26): the answer names capture shas and the target's bundle, so the store reads the source and every
 *  target through the viewer, decided by the SERVER (a member-scoped agent key stamps its principal), and fails CLOSED
 *  on an absent one. D-722 (R27): where the source bundle is a PROJECT the store asks REC-134's JOINED test, as `cite`
 *  does, of the positional `identity`. REC-52: the op writes, so a store silence is `storeSilent`, never a successful
 *  projection carrying no counts; a write reported as done when nothing was written is the worst member of that class
 *  after the public reads, because the caller stops asking. */
export async function linkProjectOp(url, store, { json, doAnswer, storeRefusal, storeSilent, viewer, identity }) {
  const capture = url.searchParams.get("capture");
  if (!/^[0-9a-f]{64}$/.test(capture || ""))
    return json({ ok: false, reason: "NEED_CAPTURE", detail: "pass capture=<sha256>" }, 400);
  const bundle = url.searchParams.get("bundle");
  const p = await doAnswer(store.fetch(`http://x/projectlinks?capture=${capture}`
    + (bundle ? `&bundle=${encodeURIComponent(bundle)}` : "") + `&viewer=${encodeURIComponent(viewer)}`
    + `&identity=${encodeURIComponent(identity)}`));
  if (p.refused) return storeRefusal(p);
  if (!p.answered) return storeSilent("linkproject", p.correlation);
  return json({ ok: true, ...p.result });
}

/** The control plane's dispatch of this module's op (legacy-index map §4.4, K649 (7)), moved out of `src/index.mjs`
 *  with the stamps it hands, which stay the control plane's. Answers the op's response, or null for an op that is not
 *  this module's. */
export async function connectionsOp(op, url, getStore, stamps) {
  if (op === "linkproject") return linkProjectOp(url, getStore(), stamps);
  return null;
}

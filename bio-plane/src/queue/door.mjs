/* queue — the op handler the control plane routes to (layers.md ruling 2, K3), moved from `legacy-index` at T19
 * (`draft-T19.md` layer 11): `op=queue`'s door half (R6, R17). Routing, authentication, the two stamps and the response
 * envelope stay the control plane's: `json`, `doAnswer` (the one reader of a Durable Object's envelope, N247, REC-52),
 * `storeRefusal` (control-plane R23's relay of the store's own refusal) and `storeSilent` are passed in, with the stamps
 * it decided (`member`, `viewer`) and its act gate (`gate`, the tables that actually gate the call). `getStore` answers
 * the Durable Object stub the op is scoped to. connections' `linkProjectOp` is the precedent. */
import { queueAnswer } from "./index.mjs";

/* The ops `queueOp` answers, which the control plane routes here (host-governor's `GOVERNOR_OPS` precedent). The
   personal half and the dispose act reach the store through the control plane's generic forward (`queueOps`). */
export const QUEUE_DOOR_OPS = Object.freeze(["queue"]);

/** op=queue (REC-20, ruled by DEC-16). The member's ONE feed: OBLIGATIONs from `tasks` and the items `queue-producers`
 *  derives, in one contract, each with the case set it belongs to and the acts available on its subject.
 *
 *  Composed the way op=affordances is, and for the same reason: the store derives the ITEMS and the homes (it holds the
 *  edges and the D-15 predicate), and the act metadata is added HERE through `queueAnswer` (R17), which decorates every
 *  option with affordances' `decorate` over the control plane's gate — the SAME function op=affordances uses, so the
 *  two answers cannot drift.
 *
 *  TWO server-side stamps, both decided by the control plane before anything of the caller's is read, because either
 *  one taken from the request would defeat the other (R37):
 *    - `member` decides WHOSE obligations these are. A caller who could name the member could read anyone's queue.
 *    - `viewer` decides which case names the answer may contain. D-15 has exactly one compilation point; the store
 *      fails closed, so a missing stamp yields an ungrouped feed rather than an unfiltered one.
 *  A machine credential has no member behind it, so it is stamped `member` empty and receives the whole live set —
 *  the operator view the token exists for, and the same carve-out D-15 makes for a machine viewer. `now`, `limit` and
 *  `sort` (R49) are the only arguments taken from the caller.
 *
 *  REC-52: a store silence is `storeSilent`, never `NO_QUEUE` or an empty feed — the plane inventing a word the store
 *  never said. N231 (affordances R26): the vocabularies' `action_kind` is asked of `actions` at this call (actions R42),
 *  its silence stated as one. A store refusal (`ok` not true) is passed through with status 400 (R17). */
export async function queueFeedOp(url, store, { json, doAnswer, storeRefusal, storeSilent, gate, member, viewer,
                                               storeName, cls }) {
  const inner = new URL("http://do/queue");
  inner.searchParams.set("viewer", viewer);
  inner.searchParams.set("member", member);
  for (const k of ["now", "limit", "sort"]) {
    const v = url.searchParams.get(k);
    if (v !== null) inner.searchParams.set(k, v);
  }
  const qOut = await doAnswer(store.fetch(inner.toString()));
  if (qOut.refused) return storeRefusal(qOut);
  if (!qOut.answered) return storeSilent("queue", qOut.correlation);
  const r = qOut.result;
  if (!r) return storeSilent("queue");
  const qkOut = await doAnswer(store.fetch("http://do/actionkinds"));
  if (qkOut.refused) return storeRefusal(qkOut);
  if (!qkOut.answered) return storeSilent("queue", qkOut.correlation);
  const a = queueAnswer(r, { gate, kinds: qkOut.result?.kinds });
  if (a.status !== 200) return json({ ok: false, ...a.refusal, store: storeName, tokenClass: cls }, a.status);
  return json({ ok: true, result: a.result, store: storeName, tokenClass: cls }, 200);
}

/** The control plane's dispatch of this module's door op, moved out of `src/index.mjs` with the stamps it hands, which
 *  stay the control plane's. Answers the op's response, or null for an op that is not this module's. */
export async function queueOp(op, url, getStore, stamps) {
  if (op === "queue") return queueFeedOp(url, getStore(), stamps);
  return null;
}

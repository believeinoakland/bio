/* public-read — the door's half of the public read path (requirements: `build/requirements/public-read.md` R1, R4, R5,
 * R9, R10). Moved from `src/index.mjs` (the legacy-index map's §4.4 move, K649 (7); §12.2): the `verify` and
 * `publishedmanifest` arms, the REC-22 note, and the `publishedcase`/`publishedbytes` dispatch line, which hands both
 * to the Worker's `publishedRoutes` (`../publication/worker.mjs`, this module's at `publication`'s merge, K651).
 * `bindPublishedPlane`'s hook hand-over stays the door's.
 *
 * `publicReadDoorOp(op, url, env, stub, helpers)` answers one of the four ops, or null for any other, so the door
 * asks it and goes on. `helpers` are the door's own (`control-plane`'s, later in the order, handed in as
 * `capturePublicOp` is): `json`, `requiredArgument`, `storeSilent`, `storeRefusal`, `doAnswer`. */

import { publishedRoutes } from "../publication/worker.mjs";

export const PUBLIC_READ_DOOR_OPS = Object.freeze(["verify", "publishedmanifest", "publishedcase", "publishedbytes"]);

export async function publicReadDoorOp(op, url, env, stub, { json, requiredArgument, storeSilent, storeRefusal, doAnswer }) {
  /* REC-22: THE PUBLIC READ PATH. Anyone, no token, no session, and — the
     part that matters — nothing withheld, because there is nothing here
     that was not deliberately published.

     WHY THIS IS SAFE WITHOUT A CREDENTIAL, stated once for both ops: every
     byte either op can reach comes from the published projection —
     published_bundles, published_shas, published_edges, and the PUBLISHED
     bucket, which the ratification act is the only writer of. The fence is
     structural in two independent layers (a table set and a bucket
     boundary), so it does not depend on a predicate being remembered. That
     is the property schema.mjs states those tables exist for, and REC-30's
     sweep classifies both ops as deliberately ungated for exactly it.

     PINNED TO `bio`, like op=verify and op=publishedmanifest below: an
     instance has ONE published record. A probe's `scratch` namespace has its
     own Durable Object and its own PUBLISHED prefix and is therefore NOT
     readable here, which is deliberate — rehearsing a publication must not
     put anything on the public surface. */
  /* 7a. Anyone, no token, no session. The DO consults only the
     published projection. */
  if (op === "verify") {
    const sha = (url.searchParams.get("sha256") || "").toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(sha))
      /* D-278: C-61.1. `error` is written as a KEY here rather than passed into the helper, so the
         sentence stays readable where `preauth-vocabulary.test.mjs` reads it textually; the key after
         the spread is the one on the wire, byte-identical to the pre-D-278 answer. */
      return json({ ok: false, ...requiredArgument("verify", "sha256", "<64 lowercase hex>"),
        error: "verify requires sha256=<64 lowercase hex>" }, 400);
    /* REC-52, SITE (a). This read used to be
         `const out = await r.json(); return json({ ok: true, ...out.result }, 200);`
       with no look at `out.ok`, so a store failure left the plane as an
       HTTP 200 SUCCESS carrying nothing — no `published`, no `sha256`, no
       `matches` — and D-197's public verification surface rendered that as
       "NOT PUBLISHED … a hash that was never ratified and a hash that never
       existed are the same answer here, deliberately", a sentence that is
       true of a real absence and false of a silence. */
    const out = await doAnswer(stub.fetch(new Request(`http://do/verify?sha256=${sha}`)));
    if (out.refused) return storeRefusal(out);
    if (!out.answered) return storeSilent("verify", out.correlation);
    return json({ ok: true, ...out.result }, 200);
  }
  /* Section 8.2. Anyone, no token, no session, and nothing to withhold.
     Published material is content-addressed and its hashes are public, so
     any member or any stranger rebuilds and independently verifies the
     published record without this instance's cooperation, permission, or
     continued existence. Reads the published projection ONLY, exactly as
     op=verify above does, which is the whole safety of an open endpoint:
     working material is never consulted, so there is nothing to leak. */
  if (op === "publishedmanifest") {
    /* REC-52, and this one was NOT in the item's scope — the sweep found
       it. The re-wrap read `result: (await r.json()).result`, so a store
       failure produced `{ok:true, result:undefined}`, and `JSON.stringify`
       DROPS an undefined value: `{ok:true}` at HTTP 200 again, by a
       different route from section 7a's spread. This is the op that fills
       the published INDEX, so the rendered consequence was the whole
       record rather than one hash — which is the shape UI-37 measured as
       the worst of its three. The WRAPPED envelope is preserved on the
       success path (auth-surface.test.mjs pins that it is not flattened). */
    const out = await doAnswer(stub.fetch(new Request("http://do/publishedmanifest")));
    if (out.refused) return storeRefusal(out);
    if (!out.answered) return storeSilent("publishedmanifest", out.correlation);
    return json({ ok: true, result: out.result }, 200);
  }
  if (op === "publishedcase" || op === "publishedbytes") return publishedRoutes({ op, url, env, stub });
  return null;
}

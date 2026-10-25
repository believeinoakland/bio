/* sources' published fixtures (fix round 10, T51): the answers the real `sources` gives over the world `fixture.mjs`
   builds at test time (never stored). A user module takes the answer it needs; each answer is the module's own, so a
   user's test reads the real rung, the real source and the real refusal. */
import { seeded, V, SECRET } from "./fixture.mjs";

/** `rungOf` (R9): a source `sources` holds (a knock with a secret, pulled into the record and read by bob, R1), and the
 *  real answers for it and for a source id no one holds. `held` is `rungOf({source, viewer})` for the held source, at
 *  `same_knocker` (the secret proves the pseudonym); `unheld` is `NO_SUCH_SOURCE` (R9, C-121.1). */
export async function rungOf() {
  const w = seeded();
  const { sourceId } = await w.pulled({ secret: SECRET });
  return {
    source: sourceId,
    held: w.s.rungOf({ source: sourceId, viewer: V("bob") }),
    unheld: w.s.rungOf({ source: "SRC-2026-9999", viewer: V("bob") }),
  };
}

/** `sourceOfReads` (R1, R8): the real `sourceOf` for a capture no source stands behind (`none`, a sha no capture holds),
 *  a fetched capture of acquisition's kind that came by no knock (`fetched`), and a capture with a source (`withSource`,
 *  the pulled knock's own answer); `publishable` is the real `publishableAt` for that source to the group (R8: nothing
 *  consented, so no entry is shown). */
export async function sourceOfReads() {
  const w = seeded();
  const viewer = V("bob");
  const fetched = w.captured({ actor: "bob" });
  const pulled = await w.pulled({ secret: SECRET, viewer });
  return {
    none: w.s.sourceOf({ captureSha: "0".repeat(64), viewer }),
    fetched: w.s.sourceOf({ captureSha: fetched.sha, viewer }),
    withSource: pulled.answer,
    publishable: w.s.publishableAt({ source: pulled.sourceId, audience: "group" }),
  };
}

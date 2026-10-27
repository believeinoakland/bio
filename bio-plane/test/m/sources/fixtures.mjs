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

/** `knockerconsent` (R11, R22): a source a pulled knock holds, with its knocker secret, and one disclosure of its name
 *  waiting for consent (a pending entry, shown to no one: R8). `before` is the real `publishableAt` for the group, empty;
 *  `answer` is the real `consentBySecret` the knocker's own consent to that entry for the group makes; `after` is the
 *  real `publishableAt` for the group once it stands, the entry shown with its basis `consent` (R8, R11). */
export async function knockerconsent() {
  const w = seeded();
  const { sourceId } = await w.pulled({ secret: SECRET });
  const d = w.disclose(sourceId);
  if (!d.ok) throw new Error(`knockerconsent: the disclosure was refused: ${JSON.stringify(d).slice(0, 300)}`);
  w.tick();
  const before = w.s.publishableAt({ source: sourceId, audience: "group" });
  const answer = await w.s.consentBySecret({ knockerSecret: SECRET, entry: d.entry, audience: "group", sourceAddress: "198.51.100.7" });
  return { source: sourceId, entry: d.entry, before, answer, after: w.s.publishableAt({ source: sourceId, audience: "group" }) };
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

/* connections' published fixtures (R44): the answers connections gives its users, made by connections' own code when a test
   runs and never stored. A user's test takes the answer from here and does not write it by hand. `fixtures.test.mjs` checks
   each against the real code. The world is `fixture.mjs`'s (the real modules over a real SQLite database). */
import { world, V } from "./fixture.mjs";
import { connectionsOps } from "../../../src/connections/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

/** R44 (`op=themeread`, one theme): a member reads a theme holding a passage of a paged document (page 1, counted from 0)
 *  and a whole document. The passage carries its extent and page; the document carries neither. */
export function themeReadWithPassage() {
  const w = world();
  w.member("alice"); w.member("bob");
  const [a] = w.doc(A, ["a"]); w.doc(B, ["b"]);
  const t = w.k.declareTheme({ name: "Deferred maintenance", test: "the document names a repair put off", declarer: "alice" });
  const cid = w.mint(A, a, { kind: "pdf-page", page: 1 });
  w.k.placeInTheme({ theme: t.theme_id, target: cid, placer: "bob", viewer: V("bob") });
  w.k.placeInTheme({ theme: t.theme_id, target: B, placer: "bob", viewer: V("bob") });
  return w.k.readThemes({ id: t.theme_id, viewer: V("bob") });
}

/* B12 (K5210): the `connectionchoose` answers screens-inquiry's document tests take. Each is connections' real answer to a
   member's choice over one connection between two documents about one subject, made each call over `fixture.mjs`'s world. */
const E = "ENT-2026-0001";
const CHOOSE_A = "INFO-2026-0001-a", CHOOSE_B = "INFO-2026-0002-b";
const choose = (w, body) => connectionsOps(w.k, new URL("http://x/?" + new URLSearchParams({ op: "connectionchoose", author: "alice", viewer: V("alice") })),
                                           body, {}).connectionchoose();
const listedBy = (w, sha) => connectionsOps(w.k, new URL("http://x/?" + new URLSearchParams({ op: "connections", sha256: sha, viewer: V("alice") })),
                                            null, {}).connections().connections[0].mentions;

/** A connection between two documents about one subject: the first names it at two places (`Ord. 1` on pages 2 and 5), the
 *  second once, unplaced. Returns the two captures' digests. */
function chooseWorld() {
  const w = world();
  w.member("alice");
  w.entity(E, "The Ordinance");
  const [a] = w.doc(CHOOSE_A, ["alpha"]);
  const [b] = w.doc(CHOOSE_B, ["beta"]);
  w.resolve(a, CHOOSE_A, "Ord. 1", E, "A");
  w.read(a, CHOOSE_A, "Ord. 1", [2, 5]);
  w.resolve(b, CHOOSE_B, "Ord. 1", E, "A");
  w.read(b, CHOOSE_B, "Ord. 1", [null]);
  w.k.derive({ entityId: E });
  return { w, a, b };
}

/** `connectionchoose` where the member chooses the second of two mentions in a document (the one with an occurrence key). */
export function connectionChooseMention() {
  const { w, a, b } = chooseWorld();
  const second = listedBy(w, a).filter((m) => m.ref === "Ord. 1")[1];
  return choose(w, { capture: a, other: b, entity: E, ref: second.ref, occurrence: second.occurrence });
}

/** `connectionchoose` where the document names its mention at one place it did not record, so no occurrence is sent. */
export function connectionChooseUnplaced() {
  const w = world();
  w.member("alice");
  w.entity(E, "The Ordinance");
  const [a] = w.doc(CHOOSE_A, ["alpha"]);
  const [b] = w.doc(CHOOSE_B, ["beta"]);
  w.resolve(a, CHOOSE_A, "Ord. 1", E, "C");
  w.read(a, CHOOSE_A, "Ord. 1", [null]);
  w.resolve(b, CHOOSE_B, "Ord. 1", E, "A");
  w.read(b, CHOOSE_B, "Ord. 1", [null]);
  w.k.derive({ entityId: E });
  return choose(w, { capture: a, other: b, entity: E, ref: "Ord. 1" });
}

/* connections' published fixtures (R44): the answers connections gives its users, made by connections' own code when a test
   runs and never stored. A user's test takes the answer from here and does not write it by hand. `fixtures.test.mjs` checks
   each against the real code. The world is `fixture.mjs`'s (the real modules over a real SQLite database). */
import { world, V } from "./fixture.mjs";

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

/* retrieval-browse's published fixtures (K4990, K4993, K4995): the answers this module gives that another module's test needs to
 * stand in front of its own code. Each is made by the real code when the test runs, never stored; fixtures.test.mjs calls each and
 * checks the real answer. */
import { world } from "./fixture.mjs";

/** `browse` answered with no viewer: the real refusal VIEWER_MISSING, as `{ok: false, reason, code, detail}`. */
export function browseViewerMissing() {
  return world().rb.browse({});
}

/** `registerBrowseMarks` registered once, then a second time: the real second answer, a refusal LISTENER_DECLARED naming the module. */
export function marksRegistrarDeclared() {
  const w = world();
  const read = () => ({ items: [], truncated: false });
  const first = w.rb.registerBrowseMarks("following", read);
  if (first.ok !== true) throw new Error(`the first registration was refused: ${JSON.stringify(first)}`);
  return w.rb.registerBrowseMarks("following", read);
}

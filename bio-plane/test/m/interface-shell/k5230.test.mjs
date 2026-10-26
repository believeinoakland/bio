/* interface-shell, K5230 (screens-inquiry's seam tests): `settle()` waits for a plane answer that forwards its call to a real door (Miniflare) while
   the forward is still in flight, so a late read lands before the test presses. Red before the harness counted plane functions, green after. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, counted } from "./harness.mjs";

const later = (ms) => new Promise((r) => setTimeout(r, ms));

test("K5230 settle() waits for two late forwarded reads in flight at once (the seam tests' load), each answered before it returns; control: an answer already there is unchanged", async () => {
  const answered = [];
  const SCREEN = { id: "published", words: [], acts: [], render: () => "<p>x</p>",
    reads: () => ({ a: { op: "publishedcase", query: { id: "c1" } }, b: { op: "publishedcase", query: { id: "c2" } } }) };
  const forwarded = async (req) => { await later(80); answered.push(req.query.id); return ok({ id: req.query.id }); };
  await boot({ screens: [SCREEN], path: "/app/published/c1", plane: { publishedcase: counted(forwarded) } });
  assert.deepEqual(answered.sort(), ["c1", "c2"], "both forwarded reads are answered by the time settle returns");

  const control = await boot({ screens: [SCREEN], path: "/app/published/c1", plane: { publishedcase: ok({ id: "c" }) } });
  assert.equal(control.byOp("publishedcase").length, 2, "control: both reads go out");
});

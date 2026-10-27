/* screens-publish R2 (fix round 10; walk-T51-alpha A N-1): "Share with a named reader" pressed while the review copy is still loading,
 * or after its read failed, says why beside the button and sends nothing; once the copy has answered, the same press shares. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, press, ok, refusedIn, pending, word, COPY, P } from "./fixtures.mjs";

const PATH = `/app/review-copy/${P}`;
const share = (p, until = "2099-10-20") => press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": "Ana", "rc-role": "editor", "rc-until": until } });
const refusedBeside = (p) => main(p).querySelector('[data-gap="refused"]');

test("R2 Share for review pressed while the review copy is still loading draws the loading word beside the button and sends nothing", async () => {
  const p = await open(PATH, { plane: { reviewcopy: pending } });
  await share(p);
  const gap = refusedBeside(p);
  assert.ok(gap, "a refusal is drawn beside the act, not nothing");
  assert.ok(text(p, gap).includes(word("state.loading")), "the loading word");
  assert.equal(p.byOp("reviewgrant").length, 0, "nothing shared");
});

test("R2 once the review copy has answered, the same press shares (control)", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const p = await open(PATH, { plane: { reviewcopy: () => gate } });
  await share(p);
  assert.equal(p.byOp("reviewgrant").length, 0, "still loading: nothing sent");
  release(ok(COPY()));
  await p.settle();
  await share(p);
  assert.equal(p.byOp("reviewgrant").length, 1, "answered: the press is sent");
});

test("R2 Share for review pressed after the review copy read failed draws the read's own refusal beside the share, and sends nothing", async () => {
  const p = await open(PATH, { plane: { reviewcopy: refusedIn("NO_REVIEW_COPY", "There is no review copy here.") } });
  await share(p);
  const said = main(p).querySelector('[data-said="reviewgrant"]');
  assert.ok(said && said.getAttribute("data-gap") === "refused", "the refusal is drawn beside the share");
  assert.ok(text(p, said).includes(word("refusal.NO_REVIEW_COPY")), "the read's refusal, by its words");
  assert.equal(p.byOp("reviewgrant").length, 0, "nothing shared");
});

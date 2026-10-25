/* control-plane (fix round 10, ratification R60; RATIFICATION #36 J18 (1); K5057, K5084): THE DOOR'S CHAIN OF `caseratify`, COUNTED. The G59 case of
   `r8-caseratify-calls.test.mjs` (a vouched case signed in one sitting) through the counting door (`wrap-entry.mjs`), the calls of the request
   listed in the order they began and ended: the longest chain of calls each beginning after the one before ended (`depth`) is at most 11 — 1 the
   admission's (`session` and `reauthdue` folded), + 6 `ratification`'s own, + 4 the case-file assembly's (`public-read` R44) — with the answer
   byte for byte as before (its golden keys, `materials_copied`, `container`). A count of calls, never a time (R-CLOCK). Red by name until
   the admission's two lookups are one hop and `public-read`'s assembly is four. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "./r8-kit.mjs";
import { readEvents, depth } from "./wrap-entry.mjs";

const kit = makeKit({ tag: "r10chain", counting: true });
after(() => kit.mf.dispose());

const CHAIN_BAR = 11;
const GOLDEN_KEYS = ["caseId", "edition", "ok"];

test("R60 (ratification; fix round 10): a vouched case signed in one sitting, through the door, awaits at most 11 calls one after another", { timeout: 900000 }, async () => {
  const e = await kit.preparedEdition("r10-ratify-ann", "r10case", { vouch: true });
  e.auth = { ...e.auth, "x-wrap-events": "1" };
  const { res } = await kit.sitAndSign(e);
  assert.equal(res.status, 200, kit.gateLine(res));
  assert.equal(res.body.ok, true, kit.gateLine(res));
  const events = readEvents({ headers: res.headers });
  assert.ok(events.length > 0, "the request listed its calls");
  const chain = depth(events, (x) => x.kind === "do" || x.kind === "r2");
  assert.ok(chain <= CHAIN_BAR, `the longest chain awaited one after another is ${chain} of ${events.length} calls (bar ${CHAIN_BAR}: admission 1 + ratification 6 + the assembly 4); the first two are ${events.slice(0, 2).map((x) => x.name).join(", ")}`);
});

test("R60 control (ratification; fix round 10): the answer is the one as before: the golden keys, the materials copied, the container, and the case published complete", { timeout: 900000 }, async () => {
  const e = await kit.preparedEdition("r10-ratify-bea", "r10caseb", { vouch: true });
  const { res } = await kit.sitAndSign(e);
  assert.equal(res.status, 200, kit.gateLine(res));
  const body = res.body.result ?? res.body;
  for (const k of GOLDEN_KEYS) assert.ok(k in body, `the answer states ${k}`);
  assert.ok("materials_copied" in body && "container" in body, `the answer states materials_copied and container: ${Object.keys(body).join(",")}`);
  const pub = kit.R(await kit.get(e.auth, { op: "publishedcase", id: e.prepared.caseId }));
  assert.equal(pub.caseId, e.prepared.caseId);
  assert.equal(pub.complete, true);
});

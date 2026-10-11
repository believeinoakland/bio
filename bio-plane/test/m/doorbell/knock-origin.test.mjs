/* R13 (capture R65 before T42's split) with N615 (K1683, K1773): a knock's pull hands intake's `doctypeFor` the capture's origin. A knock is
   made with no account (R1) and its row names no member session, so no knock is a member's own act under their
   session, and every pull is profiled as `"fetch"`, whoever brings it in: a type read only from a member's own capture
   (court-doctypes R2) never matches a stranger's knock. Checked at the module's interface, through `knock` and
   `pullKnock` (and `inboxResolve`'s pulled arm), over a probe content type that reports the origin it was handed and a
   member-only type that matches only `"member"`, as court-doctypes R2 does. Both are test-local, registered through
   docprofile's `registerDoctype`; this file is its own test process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";

const seen = [];
registerDoctype({
  key: "origin_probe", label: "an origin probe", version: 1, contract: null,
  detect(ctx) {
    if (!String((ctx && ctx.locator) || "").startsWith("knock:")) return { match: false, confidence: "none", signals: [] };
    seen.push(Object.prototype.hasOwnProperty.call(ctx, "origin") ? ctx.origin : "<absent>");
    if (ctx.origin === "member") return { match: false, confidence: "none", signals: [] };
    return { match: true, confidence: "certain", signals: [`origin ${JSON.stringify(ctx.origin ?? null)}`] };
  },
});
registerDoctype({
  key: "member_only_register", label: "a member-only register", version: 1, contract: null,
  detect(ctx) {
    if (ctx.origin !== "member") return { match: false, confidence: "none", signals: [] };
    return { match: true, confidence: "certain", signals: ["a member's own capture"] };
  },
});

const knockAndPull = async (pull) => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const k = await f.c.knock({ content: "Register of Actions: a stranger's material", sourceAddress: "198.51.100.7" });
  assert.equal(k.ok, true);
  return pull(f.c, k.knockId);
};

test("R13 (N615): every knock's pull hands doctypeFor the origin \"fetch\", never \"member\", whichever member brings it in and by whichever act", async () => {
  for (const pull of [(c, id) => c.pullKnock({ knockId: id, by: "member:m1" }),
                      (c, id) => c.pullKnock({ knockId: id, by: "m2", at: "2026-10-06T12:00:00Z" }),
                      (c, id) => c.inboxResolve({ knockId: id, status: "pulled", by: "member:m1", reason: "ours to bring in" })]) {
    seen.length = 0;
    const r = await knockAndPull(pull);
    assert.equal(r.ok, true);
    assert.ok(seen.length >= 1 && seen.every((o) => o === "fetch"), JSON.stringify(seen));
    assert.equal(r.document.profile.content_type, "origin_probe");
    assert.deepEqual(r.document.profile.content_type_signals, ['origin "fetch"']);
    assert.notEqual(r.document.profile.content_type, "member_only_register", "a member-only type never matches a knock");
    assert.equal(r.document.capture.actor_class, "member", "negative control: the puller is still the capture's actor, a member");
  }
});

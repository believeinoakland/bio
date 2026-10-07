/* docket: the member-facing words of its refusal rows call the group's Civicsmith "your group's Civicsmith", never "this
   instance", "this copy", "this plane" or "the plane" (DEC-149; T34-87, K1811), at the module's interface: each changed
   row is driven to its refusal and its translation checked whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, world, file, prepare, sign, V, CASE, NOW, HOUR } from "./fixture.mjs";
import { DOCKET_CHECKS, OUTWARD_ACT_WARNING, RESEND_INVITATION, DOCKET_UNREADABLE, RECEIPT_REASON }
  from "../../../src/docket/index.mjs";

const A = V("alice");
const OLD_NAME = /\b(this|the|our|its) +(civicsmith +|group's +)?(instance|copy|plane)\b/i;
const NO_SLUG = "Your group has no name recorded yet, and a docket entry is never anonymous. Record the group's name "
  + "first. Nothing was published.";
const STALE = "Your group's Civicsmith holds no prepared docket entry from you with this fingerprint, it was prepared more "
  + "than an hour ago, or the docket has moved since. Prepare it again and sign what it shows. Nothing was published.";

test("R4 R22 (DEC-149, N685) C-129.16 DOCKET_NO_GROUP_SLUG says \"Your group has no name recorded yet\", as C-127.4 says it, not \"This copy\"", () => {
  const bare = world({ slug: null });
  bare.member("alice");
  bare.P = bare.project("budget", "alice");
  bare.publish(bare.P, CASE, 1, [{ id: "INQ-2026-0001-x", role: "load_bearing" }]);
  const r = prepare(bare, { kind: "edition", edition: 1 });
  assert.deepEqual([r.ok, r.reason, r.check], [false, "DOCKET_NO_GROUP_SLUG", "C-129.16"]);
  assert.equal(r.translation, NO_SLUG);
  assert.equal(DOCKET_CHECKS.DOCKET_NO_GROUP_SLUG.translation, NO_SLUG);
  assert.doesNotMatch(r.translation, OLD_NAME);
});

test("R5 R22 (DEC-149, N685) C-129.22 DOCKET_STALE says \"Your group's Civicsmith holds no prepared docket entry from you\", in C-127.12's form, not \"This copy\"", async () => {
  const w = seeded();
  const p = prepare(w, { kind: "response", entry: file(w).entry });
  assert.equal(p.ok, true);
  w.clock.now = NOW + HOUR + 1000;
  const r = await w.docket.docketPost({ digest: p.digest, signature: sign(p), acknowledged: true, by: A, viewer: A });
  assert.deepEqual([r.ok, r.reason, r.check], [false, "DOCKET_STALE", "C-129.22"]);
  assert.equal(r.translation, STALE);
  assert.equal(DOCKET_CHECKS.DOCKET_STALE.translation, STALE);
  assert.doesNotMatch(r.translation, OLD_NAME);
});

test("R22 (DEC-149) no member-facing word of the module calls the group's Civicsmith this instance, this copy, this plane or the plane", () => {
  const words = [...Object.entries(DOCKET_CHECKS).map(([code, r]) => [code, r.translation]),
                 ["warning", OUTWARD_ACT_WARNING.meaning], ["invitation", RESEND_INVITATION.meaning],
                 ["unreadable", DOCKET_UNREADABLE], ["receipt", RECEIPT_REASON]];
  assert.ok(words.length >= 32, `every row and sentence read (${words.length})`);
  for (const [where, text] of words) assert.doesNotMatch(text, OLD_NAME, `${where}: ${text.slice(0, 80)}`);
  /* negative control: the pattern catches the old wording */
  for (const old of ["This copy has no group name recorded", "This copy holds no prepared docket entry", "this instance", "the plane"])
    assert.match(old, OLD_NAME);
});

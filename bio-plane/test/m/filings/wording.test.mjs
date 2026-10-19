/* filings — DEC-149 (T34-87): the member-facing words that named the group's Civicsmith "this instance" or "the
   instance" now say "your team's Civicsmith" or need no name (T50: read by key from words.json, so each sentence below is
   compared with `word(key)`, never with a copy). Driven at the module's interface, over the real modules; each changed
   string is named here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, WORDS, LAW, WHY } from "./fixture.mjs";
import { FILINGS_CHECKS } from "../../../src/filings/index.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const OLD = /\b(?:this|the) (?:instance|copy|plane)\b/i;
const COUNSEL = { name: "A. Counsel", organisation: "Test Chambers" };

test("R7 R16 (DEC-149) MACHINE_CANNOT_FILE's translation (C-115.13) and an approval's says name your group's Civicsmith as sending nothing; no translation of this module calls it the instance, the copy or the plane", async () => {
  assert.equal(FILINGS_CHECKS.MACHINE_CANNOT_FILE.translation, word("refusal.MACHINE_CANNOT_FILE"));
  for (const [code, row] of Object.entries(FILINGS_CHECKS)) assert.doesNotMatch(row.translation, OLD, code);
  const x = world();
  const d = x.f.filingPrepare({ action: x.action(), text: WORDS, preparer: MACHINE, viewer: MACHINE });
  const r = x.f.filingRecordSent({ filing: d.id, at: "2026-09-29", account: "by hand", author: MACHINE, viewer: MACHINE });
  assert.deepEqual([r.reason, r.translation], ["MACHINE_CANNOT_FILE", FILINGS_CHECKS.MACHINE_CANNOT_FILE.translation]);
  const a = await x.f.filingApprove({ filing: d.id, text: d.text.replace("[UNFILLED: law]", LAW), author: V("bo"), viewer: V("bo") });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.says, word("filings.says.approved_member_named"));
});

test("R20 R9 R3 (DEC-149) with no jurisdiction profile active the answer says your group's Civicsmith has none; with no producing group recorded the blank says so with no name; neither calls it the instance; negative controls with a profile and a group", async () => {
  const none = world({ profiles: [] });
  const p = none.f.counselPacket({ action: none.action(), counsel: COUNSEL, reason: WHY, author: V("olive"), viewer: V("olive") });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const noProfile = word("filings.why.group_civicsmith_active");
  assert.equal(p.sections.deadlines.says, word("filings.says.claim_deadline_known", { why: noProfile }));
  const t = none.f.filingPrepare({ action: none.action(), preparer: V("bo"), viewer: V("bo") });
  assert.equal(t.reason, "TEMPLATE_NOT_NAMED");
  assert.ok(t.detail.startsWith(`${noProfile}: name a template`), t.detail);
  assert.equal(p.sections.exhibits.venue_standard.why, word("filings.why.venue_standard_undetermined", { why: noProfile }));
  for (const s of [p.sections.deadlines.says, p.sections.exhibits.venue_standard.why, t.detail]) assert.doesNotMatch(s, OLD);
  const x = world();
  assert.notEqual(x.f.counselPacket({ action: x.action(), counsel: COUNSEL, reason: WHY, author: V("olive"), viewer: V("olive") })
    .sections.deadlines.says, word("filings.says.claim_deadline_known", { why: noProfile }), "negative control: a profile is active");
  const G = x.action();
  const prep = () => x.f.filingPrepare({ action: G, text: "From {{group}}.", preparer: V("bo"), viewer: V("bo") });
  x.groupRef.value = null;
  const u = prep();
  assert.deepEqual(u.unfilled, [{ name: "group", why: word("filings.why.producing_group_recorded") }]);
  x.groupRef.value = "test-group";
  assert.deepEqual([prep().unfilled, prep().text], [[], "From test-group."], "negative control: a group recorded");
});

/* reading-guides: offering a guide to another group, adopting one, and proposing one for Civicsmith's library (R6). */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { GUIDE_OFFER_FORMAT, GUIDE_LIBRARY_PROPOSAL_FORMAT } from "../../../src/reading-guides/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { world, row, item, ITEMS, ANN, BOB, CY, MACHINE } from "./fixture.mjs";

const sha = (s) => `sha256:${createHash("sha256").update(s, "utf8").digest("hex")}`;

test("R6 an offer is the group's guide as canonical bytes and their digest, labelled with the group's slug", () => {
  const w = world({ slug: "riverside-watch" });
  const id = w.groupGuide();
  const r = w.g.guideOffer({ guide: id, by: CY });
  assert.equal(r.ok, true);
  assert.equal(r.group, "riverside-watch");
  assert.equal(r.guide, id);
  assert.equal(r.bytes, canonicalJson({ format: GUIDE_OFFER_FORMAT, group: "riverside-watch", guide: id, kind: "staff_report", items: ITEMS }));
  assert.equal(r.digest, sha(r.bytes));
  assert.equal(w.g.guideOffer({ guide: id, by: ANN }).bytes, r.bytes, "the same bytes every time");
  assert.equal(w.g.guideRead({ guide: id }).guide.state, "group", "offering changes no state");
  assert.deepEqual(w.g.guideRead({ guide: id }).history.map((h) => h.act), ["draft", "approve", "offer", "offer"]);
});

test("R6 adopting imports it as adopted, based on the offer's digest, usable only after review here", () => {
  const a = world({ slug: "group-a" }), b = world({ slug: "group-b" });
  const offer = a.g.guideOffer({ guide: a.groupGuide(), by: ANN });
  const r = b.g.guideAdopt({ bytes: offer.bytes, by: ANN });
  assert.equal(r.ok, true);
  assert.equal(r.state, "draft");
  assert.equal(r.based_on, offer.digest);
  assert.equal(r.offered_by, "group-a");
  const g = b.g.guideRead({ guide: r.guide }).guide;
  assert.deepEqual([g.origin, g.state, g.based_on, g.offered_by, g.author, g.kind], ["adopted", "draft", offer.digest, "group-a", "ann", "staff_report"]);
  assert.deepEqual(g.items, ITEMS);
  /* usable by no one, its adopter included, until reviewed */
  for (const viewer of [ANN, BOB]) assert.equal(b.g.guideFor({ kind: "staff_report", viewer }).guide, null);
  row(b.g.guideOffer({ guide: r.guide, by: ANN }), "GUIDE_NOT_OFFERABLE");
  row(b.g.guideReview({ guide: r.guide, verdict: "approve", by: ANN }), "GUIDE_REVIEW_BY_AUTHOR");
  /* a refusal keeps it unusable */
  assert.equal(b.g.guideReview({ guide: r.guide, verdict: "refuse", reason: "not for us yet", by: BOB }).state, "draft");
  assert.equal(b.g.guideFor({ kind: "staff_report", viewer: ANN }).guide, null);
  assert.equal(b.g.guideReview({ guide: r.guide, verdict: "approve", by: CY }).state, "group");
  const f = b.g.guideFor({ kind: "staff_report", viewer: BOB });
  assert.deepEqual([f.guide.id, f.origin], [r.guide, "adopted"]);
  /* an offer already adopted answers that guide */
  assert.deepEqual(b.g.guideAdopt({ bytes: offer.bytes, by: BOB }), { ok: true, already: true, guide: r.guide, state: "group", based_on: offer.digest, offered_by: "group-a" });
  assert.equal(b.count("reading_guides"), 1);
});

test("R6 adoption refusals, each with its row: not a member, not an offer byte for byte, a kind, conduct (negative controls)", () => {
  const a = world(), b = world();
  const offer = a.g.guideOffer({ guide: a.groupGuide(), by: ANN });
  row(b.g.guideAdopt({ bytes: offer.bytes, by: MACHINE }), "GUIDE_MEMBER_ACT");
  const o = JSON.parse(offer.bytes);
  const variants = [undefined, "", "{}", "not json", JSON.stringify(o, null, 1), offer.bytes + " ",
    canonicalJson({ ...o, format: "other/1" }), canonicalJson({ ...o, format: GUIDE_LIBRARY_PROPOSAL_FORMAT }),
    canonicalJson({ ...o, group: "" }), canonicalJson({ ...o, guide: "G-1" }), canonicalJson({ ...o, extra: 1 })];
  for (const bytes of variants) row(b.g.guideAdopt({ bytes, by: BOB }), "GUIDE_OFFER_UNREADABLE");
  row(b.g.guideAdopt({ bytes: canonicalJson({ ...o, kind: "court_order" }), by: BOB }), "GUIDE_KIND_UNKNOWN");
  row(b.g.guideAdopt({ bytes: canonicalJson({ ...o, items: [item("L", "Send it to the model")] }), by: BOB }), "GUIDE_CARRIES_CONDUCT");
  row(b.g.guideAdopt({ bytes: canonicalJson({ ...o, items: [] }), by: BOB }), "GUIDE_ITEMS_REFUSED");
  assert.equal(b.count("reading_guides"), 0);
  assert.equal(b.g.guideAdopt({ bytes: offer.bytes, by: BOB }).ok, true, "control");
});

test("R6 offer refusals, each with its row: not a member, not the group's, retired, no slug (negative controls)", () => {
  const w = world();
  const own = w.draft();
  const grp = w.groupGuide();
  row(w.g.guideOffer({ guide: grp, by: MACHINE }), "GUIDE_MEMBER_ACT");
  row(w.g.guideOffer({ guide: "GUD-2026-aaaaaaaaaaaaaaaa", by: ANN }), "NO_SUCH_GUIDE");
  row(w.g.guideOffer({ guide: own, by: ANN }), "GUIDE_NOT_OFFERABLE");
  row(w.g.guideProposeToCivicsmith({ guide: own, by: ANN }), "GUIDE_NOT_OFFERABLE");
  for (const slug of [null, "", "  "]) {
    const n = world({ slug });
    row(n.g.guideOffer({ guide: n.groupGuide(), by: ANN }), "GUIDE_NO_GROUP_SLUG");
  }
  assert.equal(w.g.guideOffer({ guide: grp, by: ANN }).ok, true, "control");
  w.g.guideRetire({ guide: grp, reason: "old", by: BOB });
  row(w.g.guideOffer({ guide: grp, by: ANN }), "GUIDE_RETIRED");
});

test("R6 a proposal for Civicsmith's library is the same export, marked as a proposal, and no group can adopt it", () => {
  const w = world({ slug: "g" });
  const id = w.groupGuide();
  const r = w.g.guideProposeToCivicsmith({ guide: id, by: ANN });
  assert.equal(r.ok, true);
  assert.equal(JSON.parse(r.bytes).format, GUIDE_LIBRARY_PROPOSAL_FORMAT);
  assert.equal(r.digest, sha(r.bytes));
  row(world().g.guideAdopt({ bytes: r.bytes, by: ANN }), "GUIDE_OFFER_UNREADABLE");
  assert.equal(w.g.guideRead({ guide: id }).history.at(-1).act, "propose_to_civicsmith");
});

test("R6 the channel between groups: one registration (K31), handed each offer, its failure changing nothing", () => {
  const w = world({ slug: "g" });
  const id = w.groupGuide();
  assert.equal(w.g.guideOffer({ guide: id, by: ANN }).channel, undefined, "none registered: no channel");
  assert.equal(w.g.registerGuideChannel("", () => {}).reason, "PROVIDER_MALFORMED");
  assert.equal(w.g.registerGuideChannel("network-notices", "fn").reason, "PROVIDER_MALFORMED");
  const sent = [];
  let fail = false;
  assert.deepEqual(w.g.registerGuideChannel("network-notices", (o) => { if (fail) throw new Error("down"); sent.push(o); return { queued: true }; }),
    { ok: true, module: "network-notices" });
  const second = w.g.registerGuideChannel("other", () => {});
  assert.equal(second.reason, "PROVIDER_DECLARED");
  assert.match(second.detail, /network-notices/);
  const r = w.g.guideOffer({ guide: id, by: ANN });
  assert.deepEqual(r.channel, { module: "network-notices", answer: { queued: true } });
  assert.deepEqual(sent, [{ format: GUIDE_OFFER_FORMAT, bytes: r.bytes, digest: r.digest, group: "g", guide: id }]);
  fail = true;
  const f = w.g.guideOffer({ guide: id, by: ANN });
  assert.equal(f.ok, true);
  assert.deepEqual(f.channel, { module: "network-notices", failed: "down" });
});

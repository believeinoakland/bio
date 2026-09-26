/* text-chain: requirement-named tests for the page-wise tier-2 merge and its note
 * (build/requirements/text-chain.md R74-R80). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeTier2Text, tier2Note, glyphCount } from "../../../src/textchain.mjs";

const pg = (page, text, und = [], x = {}) => ({ page, text, undetermined: und, ...x });
const miss = (page, count) => ({ page, reason: "unmapped", font: "F1", codes: "", count });
const img = (page, reason = "image_content_unread") => ({ page, reason, font: null, codes: "", count: 0, image_share: 0.5, glyphs: 2 });
const doc = (pages, extra = {}) => ({ document: pages.map((p) => p.text).join("\n"), pages, undetermined: pages.flatMap((p) => p.undetermined || []), counts: { chars: 0 }, ...extra });

test("R74: no usable base pages and a base holding glyphs refuses, saying what was found", () => {
  const t2 = doc([pg(0, "tier two")]);
  for (const base of [{ document: "x", pages: [] }, { document: " a ", pages: [{ page: "0" }] }, { document: "ab" }]) {
    const r = mergeTier2Text(base, t2);
    assert.equal(r.ok, false);
    assert.match(r.why, new RegExp(`${glyphCount(base.document)} decoded glyph`));
    assert.match(r.why, /page by page|page-wise|per-page/);
  }
  const r2 = mergeTier2Text({ document: 5, counts: { chars: 12 } }, t2);
  assert.equal(r2.ok, false);
  assert.match(r2.why, /12 character/);
});

test("R75: with nothing held, tier 2 is adopted whole", () => {
  const t2 = doc([pg(0, "a"), pg(2, "b"), { page: "x", text: "c" }]);
  for (const base of [{ document: "  \n ", pages: [] }, { document: 7, counts: { chars: 0 } }, null, {}, { document: "", counts: { chars: 99 } }]) {
    assert.deepEqual(mergeTier2Text(base, t2), { ok: true, text: t2, wholesale: true, perPageTier: null, replaced: [0, 2], kept: [] });
  }
  assert.deepEqual(mergeTier2Text(null, null).replaced, []);
});

test("R76: tier 2 wins a page only with strictly fewer undetermined AND strictly more glyphs; otherwise tier 1 is kept plus tier:1", () => {
  const cases = [
    // [t1 text, t1 undetermined count, t2 text, t2 undetermined count, tier 2 wins?]
    ["ab", 3, "abc", 0, true],
    ["ab", 3, "a b", 0, false],      // equal glyphs (whitespace does not count)
    ["ab", 3, "a", 0, false],        // fewer glyphs
    ["ab", 0, "abcdef", 0, false],   // tier 1 admitted nothing
    ["ab", 2, "abcdef", 2, false],   // equal undetermined
    ["ab", 2, "abcdef", 3, false],
    ["", 1, "x", 0, true],
  ];
  for (const [t1, u1, t2, u2, win] of cases) {
    const b = pg(0, t1, u1 ? [miss(0, u1)] : [], { extra: "kept" });
    const c = pg(0, t2, u2 ? [miss(0, u2)] : []);
    const r = mergeTier2Text(doc([b]), doc([c]));
    assert.equal(r.ok, true);
    assert.deepEqual(r.text.pages[0], win ? { page: 0, text: t2, undetermined: c.undetermined, tier: 2 } : { ...b, tier: 1 },
      JSON.stringify([t1, u1, t2, u2]));
  }
  /* A page tier 2 does not offer keeps tier 1. */
  const r = mergeTier2Text(doc([pg(0, "a", [miss(0, 1)]), pg(1, "b", [miss(1, 1)])]), doc([pg(1, "bbbb")]));
  assert.deepEqual(r.text.pages.map((p) => p.tier), [1, 2]);
});

test("R77: a page tier 2 wins keeps the base page's image_content_* markers and fields, unchanged", () => {
  const b = pg(0, "7", [miss(0, 3), img(0)], { image_content_note: "n", other: 1 });
  const c = pg(0, "seven words of text", []);
  const r = mergeTier2Text(doc([b]), doc([c]));
  assert.deepEqual(r.text.pages[0], { image_content_note: "n", page: 0, text: c.text, undetermined: [img(0)], tier: 2 });
  assert.deepEqual(r.text.undetermined, [img(0)]);
  /* Carried after tier 2's own markers; both kinds carried. */
  const b2 = pg(1, "", [miss(1, 5), img(1, "image_content_undetermined")]);
  const c2 = pg(1, "text", [miss(1, 1)]);
  assert.deepEqual(mergeTier2Text(doc([b2]), doc([c2])).text.pages[0].undetermined, [miss(1, 1), img(1, "image_content_undetermined")]);
  /* A page where tier 2 already states an image marker gets no second one. */
  const c3 = pg(1, "text", [img(1)]);
  assert.deepEqual(mergeTier2Text(doc([b2]), doc([c3])).text.pages[0].undetermined, [img(1)]);
  /* The carried marker counts 0 undetermined characters: the award is unmoved by it. */
  const lose = mergeTier2Text(doc([pg(0, "ab", [img(0)])]), doc([pg(0, "abcdef")]));
  assert.deepEqual(lose.kept, [0]);
  /* A page tier 1 keeps is unchanged, markers and all. */
  const kept = pg(2, "abcdef", [img(2)], { image_content_x: 1 });
  assert.deepEqual(mergeTier2Text(doc([kept]), doc([pg(2, "a")])).text.pages[0], { ...kept, tier: 1 });
});

test("R78: the page-wise result carries the merged text, counts and the per-page tiers", () => {
  const base = { ...doc([pg(0, "one", []), pg(1, "tw", [miss(1, 2)]), pg(2, "", [miss(2, 1)])]), source: "kept", counts: { chars: 1, undetermined: 9 } };
  const t2 = doc([pg(0, "one!!"), pg(1, "two two"), pg(2, "", [])]);
  const r = mergeTier2Text(base, t2);
  const pages = [{ ...base.pages[0], tier: 1 }, { page: 1, text: "two two", undetermined: [], tier: 2 }, { ...base.pages[2], tier: 1 }];
  const document = "one\ntwo two";
  assert.deepEqual(r, {
    ok: true, wholesale: false, replaced: [1], kept: [0, 2], perPageTier: { tier1: [0, 2], tier2: [1] },
    text: { ...base, document, pages, undetermined: [miss(2, 1)], counts: { chars: document.length, undetermined: 1 } },
  });
});

test("R79: tier2Note is m.why (or null) when not ok, null when wholesale, null when nothing replaced", () => {
  assert.equal(tier2Note({ ok: false, why: "because" }), "because");
  assert.equal(tier2Note({ ok: false }), null);
  assert.equal(tier2Note(null), null);
  assert.equal(tier2Note(undefined), null);
  assert.equal(tier2Note({ ok: true, wholesale: true, replaced: [0], kept: [] }), null);
  assert.equal(tier2Note({ ok: true, wholesale: false, replaced: [], kept: [0, 1] }), null);
});

test("R80: otherwise a sentence of pages recovered and kept, plus the per-page clause when both are non-empty", () => {
  const both = tier2Note({ ok: true, wholesale: false, replaced: [1, 3], kept: [0] });
  assert.match(both, /^2 page\(s\) .*tier-2.* the other 1 page\(s\) kept tier 1's reading; .*chain names the tier per page$/);
  const only = tier2Note({ ok: true, wholesale: false, replaced: [0, 1, 2], kept: [] });
  assert.match(only, /^3 page\(s\) /);
  assert.doesNotMatch(only, /per page/);
  /* Consistent with a real merge. */
  const m = mergeTier2Text(doc([pg(0, "a", [miss(0, 1)]), pg(1, "bbbb")]), doc([pg(0, "aaaa"), pg(1, "b")]));
  assert.match(tier2Note(m), /^1 page\(s\) .*other 1 page\(s\)/);
});

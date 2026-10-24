/* R33 (T50; N1166): the page's `snippet` and `snippet_from`; R34 (fix round 9): `snippet_unit`. A text snippet is cut from the record's body or title and
   never from `meta`; a hit found through `passage:` carries the words of the first matching unit of its captures. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { compile } from "../../../src/query.mjs";

const V = "class:member";
const unit = (w, bundle, sha, seq, text) => w.insert("capture_text", { capture_sha: sha, bundle_id: bundle,
  extent_kind: "pdf-page", extent: `{"page":${seq}}`, ref: `page ${seq + 1}`, seq, text, truncated: 0, chain_kind: "layer" });
const hitsOf = (w, opts) => Object.fromEntries(w.run({ viewer: V, ...opts }).rows.map((r) => [r.bundle_id, r]));
const words = (snippet) => String(snippet).replace(/[\[\]…]/g, " ").split(/\s+/).filter(Boolean);

function scene() {
  const w = world();
  w.bundle("Q-1", { title: "Pothole repair question", body: "Who approved the budget for the crosswalk repair on Grand Avenue", meta: "status open owner MEM-7" });
  w.bundle("Q-2", { title: "Culvert", body: "nothing about it here", meta: "zebrafish steward MEM-9" });
  w.bundle("DOC-1", { title: "Council packet", body: "our notes on the packet" });
  w.bundle("DOC-2", { title: "Second packet", body: "more notes" });
  unit(w, "DOC-1", "sha-b", 0, "item 420 on the consent calendar was pulled for discussion");
  unit(w, "DOC-1", "sha-a", 3, "a later page that also mentions 420 in its last paragraph");
  unit(w, "DOC-1", "sha-a", 1, "an earlier page of the first capture where 420 is the council file number");
  unit(w, "DOC-2", "sha-c", 0, "zebrafish habitat survey appendix and the appropriation 420");
  return w;
}

test("R33 a bundle matched only by passage:420 answers the words of its first matching unit (capture sha, then reading order) with snippet_from passage", () => {
  const w = scene();
  const h = hitsOf(w, { q: "passage:420" });
  assert.deepEqual(Object.keys(h).sort(), ["DOC-1", "DOC-2"]);
  assert.equal(h["DOC-1"].snippet_from, "passage");
  assert.match(h["DOC-1"].snippet, /\[420\]/, "the matched words of the passage, in the page's brackets");
  assert.match(h["DOC-1"].snippet, /earlier page of the first capture/, "sha-a before sha-b, and seq 1 before seq 3");
  assert.doesNotMatch(h["DOC-1"].snippet, /consent calendar|later page/);
  assert.equal(h["DOC-2"].snippet_from, "passage");
  assert.match(h["DOC-2"].snippet, /\[420\]/);
  for (const r of Object.values(h)) assert.ok(Object.keys(r).includes("snippet") && Object.keys(r).includes("snippet_from"));
});

test("R33 a passage snippet is cut as R12 cuts: the same brackets and clamp, and a longer budget gives more words", () => {
  const w = world();
  w.bundle("D", { title: "Long unit" });
  unit(w, "D", "s", 0, `${"alpha beta gamma delta epsilon zeta eta theta iota kappa ".repeat(8)} needle ${"lambda mu nu xi omicron pi rho sigma tau upsilon ".repeat(8)}`);
  const at = (n) => hitsOf(w, { q: "passage:needle", snippetChars: n }).D.snippet;
  assert.match(at(12), /\[needle\]/);
  assert.ok(words(at(4)).length <= 5 && words(at(4)).length < words(at(12)).length, "4 tokens is shorter than the default 12");
  assert.ok(words(at(64)).length > words(at(12)).length, "64 is longer");
  assert.deepEqual(at(1), at(4), "clamped up to 4");
  assert.deepEqual(at(500), at(64), "clamped down to 64");
  assert.match(at(4), /…/, "the ellipsis");
});

test("R33 a question matched by a word in its body answers that body's words with snippet_from text; a title-only match answers the title", () => {
  const w = scene();
  const h = hitsOf(w, { q: "crosswalk" });
  assert.deepEqual(Object.keys(h), ["Q-1"]);
  assert.equal(h["Q-1"].snippet_from, "text");
  assert.match(h["Q-1"].snippet, /\[crosswalk\]/);
  assert.match(h["Q-1"].snippet, /budget|repair/);
  const t = hitsOf(w, { q: "pothole" })["Q-1"];
  assert.equal(t.snippet_from, "text");
  assert.match(t.snippet, /\[Pothole\]/i);
});

test("R33 control: a question whose id and frontmatter alone hold the word answers no snippet and no frontmatter", () => {
  const w = scene();
  for (const q of ["zebrafish", "MEM-9", "steward"]) {
    const h = hitsOf(w, { q });
    assert.ok(h["Q-2"], `${q}: still a hit, its meta holds the word`);
    assert.equal(h["Q-2"].snippet, null, `${q}: no snippet`);
    assert.equal(h["Q-2"].snippet_from, null);
  }
  /* The locator and the authority are not the record's title or body either. */
  const l = world();
  l.bundle("L", { title: "Plain", body: "plain words", locator: "https://example.org/agendas", authority: "clerkoffice" });
  const lh = hitsOf(l, { q: "clerkoffice" }).L;
  assert.deepEqual([lh.snippet, lh.snippet_from], [null, null]);
});

test("R33 a text term that matches only meta falls to the matching passage; text wins when both match", () => {
  const w = scene();
  const z = hitsOf(w, { q: "zebrafish" });
  assert.deepEqual([z["Q-2"].snippet, z["Q-2"].snippet_from], [null, null], "meta only, no passage of its own");
  assert.equal(z["DOC-2"], undefined, "a text term does not reach a passage");
  const both = hitsOf(w, { q: "zebrafish OR passage:zebrafish" });
  assert.equal(both["DOC-2"].snippet_from, "passage");
  assert.match(both["DOC-2"].snippet, /\[zebrafish\]/);
  assert.deepEqual([both["Q-2"].snippet, both["Q-2"].snippet_from], [null, null]);
  const w2 = world();
  w2.bundle("B", { title: "Notes", body: "the hydrant inspection notes", meta: "x" });
  unit(w2, "B", "s", 0, "hydrant inspection passage text");
  const b = hitsOf(w2, { q: "hydrant passage:hydrant" }).B;
  assert.equal(b.snippet_from, "text");
  assert.match(b.snippet, /\[hydrant\]/);
  assert.doesNotMatch(b.snippet, /passage text/);
  const m = hitsOf(w2, { q: "x passage:hydrant" }).B;
  assert.equal(m.snippet_from, "passage", "the text term hits only meta, so the passage supplies the snippet");
});

test("R33 with no term the snippet and snippet_from are null; so are presence, a metadata term and a negated passage term", () => {
  const w = scene();
  for (const q of ["", "passage:*", "id:Q-1", "type:information", "has:title", "-passage:420", "id:DOC-1 -passage:420"]) {
    const rows = w.run({ q, viewer: V }).rows;
    assert.ok(rows.length > 0 || q.startsWith("-") || q.includes("DOC-1"), `${q} answers rows`);
    for (const r of rows) assert.deepEqual([r.snippet, r.snippet_from], [null, null], `${q}: ${r.bundle_id}`);
  }
});

test("R33 a body holding the markers and brackets of the cut but no match is still no text match", () => {
  const w = world();
  w.bundle("M", { title: "Marked", body: "text with [brackets] and a \u0001 control mark and …", meta: "onlymeta" });
  const h = hitsOf(w, { q: "onlymeta" }).M;
  assert.deepEqual([h.snippet, h.snippet_from], [null, null]);
  const t = hitsOf(w, { q: "control" }).M;
  assert.equal(t.snippet_from, "text");
  assert.match(t.snippet, /\[control\]/);
});

test("R33 R8 the snippet cuts nothing for a hit the gate withholds, and an absent viewer answers no hit", () => {
  const w = scene();
  assert.deepEqual(w.run({ q: "passage:420", viewer: null }).rows, []);
  assert.deepEqual(w.run({ q: "crosswalk", viewer: undefined }).rows, []);
});

test("R33 R7 the snippet arguments move and the statement text does not, for every term a member can type", () => {
  const sql = (q) => compile({ q, viewer: V }).statements.page().sql;
  assert.equal(sql("passage:alpha"), sql(`passage:"x'); DROP TABLE bundles; --"`));
  assert.equal(sql("alpha"), sql(`"x'); DROP TABLE bundles; --"`));
  assert.equal(sql("alpha passage:beta"), sql(`"x' OR 1=1" passage:"y*/"`));
  const args = compile({ q: "alpha passage:beta", viewer: V }).statements.page().args;
  assert.ok(args.includes('"alpha"') && args.includes('"beta"'));
});

/* R34: the unit a passage snippet came from, found by the unit's own text, never by the snippet's words alone. */
const unitText = (w, rowid) => w.all({ sql: "SELECT text FROM capture_text WHERE rowid = ?", args: [rowid] })[0]?.text;

test("R34 a passage hit's snippet_unit is the row whose text holds the snippet's words, the first of two matching units by the R33 order", () => {
  const w = scene();
  const h = hitsOf(w, { q: "passage:420" });
  assert.equal(h["DOC-1"].snippet_from, "passage");
  assert.equal(typeof h["DOC-1"].snippet_unit, "number");
  const text = unitText(w, h["DOC-1"].snippet_unit);
  assert.match(text, /earlier page of the first capture/, "sha-a, seq 1 comes before sha-a seq 3 and sha-b");
  for (const word of words(h["DOC-1"].snippet)) assert.ok(text.includes(word), `${word} is in the unit the snippet names`);
  assert.match(unitText(w, h["DOC-2"].snippet_unit), /zebrafish habitat survey/);
  const tie = world();
  tie.bundle("T", { title: "Tie" });
  tie.insert("capture_text", { capture_sha: "s", bundle_id: "T", extent_kind: "pdf-page", extent: '{"page":9}', ref: "p", seq: 0, text: "second extent holds needle", truncated: 0, chain_kind: "layer" });
  tie.insert("capture_text", { capture_sha: "s", bundle_id: "T", extent_kind: "pdf-page", extent: '{"page":1}', ref: "p", seq: 0, text: "first extent holds needle", truncated: 0, chain_kind: "layer" });
  assert.match(unitText(tie, hitsOf(tie, { q: "passage:needle" }).T.snippet_unit), /first extent/, "extent breaks a tie of capture and seq");
});

test("R34 control: a text hit, a text hit that also matches a passage, and an unmatched hit carry snippet_unit null; the key is always present", () => {
  const w = world();
  w.bundle("B", { title: "Notes", body: "the hydrant inspection notes", meta: "x" });
  w.bundle("N", { title: "Other", body: "plain", meta: "y" });
  unit(w, "B", "s", 0, "hydrant inspection passage text");
  const text = hitsOf(w, { q: "hydrant passage:hydrant" }).B;
  assert.deepEqual([text.snippet_from, text.snippet_unit], ["text", null]);
  assert.equal(typeof hitsOf(w, { q: "x passage:hydrant" }).B.snippet_unit, "number", "the passage supplies it when text matches only meta");
  for (const q of ["", "id:N", "passage:hydrant", "plain"]) {
    for (const r of w.run({ q, viewer: V }).rows) {
      assert.ok(Object.keys(r).includes("snippet_unit"), `${q}: ${r.bundle_id} carries the key`);
      if (r.snippet_from !== "passage") assert.equal(r.snippet_unit, null, `${q}: ${r.bundle_id}`);
    }
  }
  assert.deepEqual(Object.keys(w.run({ q: "", viewer: V }).rows[0]).slice(-3), ["snippet", "snippet_from", "snippet_unit"]);
});

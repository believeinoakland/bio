/* The record-reading checks promotion took from the catalogue (K64), through the gate: R30 (C-20.1 and C-17.2 walk
 * write order, record-core's `seq`) and R32 (C-4.2, an undeclared edge corroborated only by the record's own
 * history). Each image is built the way record-core serves one: live files, `_history/<name>_<key>.<ext>`
 * pre-images, `_history/promotion_<key>.json` records and `_history/manifest.json`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { runGate, recordChecks } from "../../../src/promotion/index.mjs";
import { checkBundle } from "../../../checks/bio-checks.mjs";
import { STATE_MOVE_FENCED_SINCE } from "../../../src/promotion/history.mjs";

const ID = "INFO-2026-0001-report";
const sha = (s) => createHash("sha256").update(s).digest("hex");
const EMPTY = sha("");
const md = (over = {}) => {
  const f = { id: ID, object_type: "information", schema: "information@1", title: '"A report"', current_state: "collected",
    prior_state: "null", created: '"2026-07-01T00:00:00Z"', last_updated: '"2026-07-01T00:00:00Z"', state_history: "[]", ...over };
  return ["---", ...Object.entries(f).map(([k, v]) => `${k}: ${v}`), "---", "", "## Summary", "", "text", "", "## Session Log", ""].join("\n");
};
/* An image from promotions in WRITE order; each `{key, text, writer?, operation?, files?, created?}`. `seq` omitted
   when `noSeq`. The manifest lists entries by key, as record-core's R16 does. */
function image(promos, { noSeq = false, extra = {} } = {}) {
  const img = {}, entries = [];
  let prev = null;
  promos.forEach((p, i) => {
    if (prev !== null) img[`_history/bundle_${p.key}.md`] = prev;       // the pre-image this promotion took
    const files = p.files || ["bundle.md"];
    img[`_history/promotion_${p.key}.json`] = JSON.stringify({ base: prev === null ? EMPTY : sha(prev),
      files: files.map((n) => ({ name: n, sha256: n === "bundle.md" ? sha(p.text) : sha(n) })),
      ...(p.writer ? { writer: p.writer, operation: p.operation } : {}) });
    entries.push({ key: p.key, kind: "promotion", base: prev === null ? EMPTY : sha(prev), created: p.created || "2026-07-01T00:00:00Z",
                   files, ...(noSeq ? {} : { seq: i + 1 }), ...(p.writer ? { writer: p.writer, operation: p.operation } : {}) });
    prev = p.text;
  });
  entries.sort((a, b) => (a.key < b.key ? -1 : 1));
  img["_history/manifest.json"] = JSON.stringify({ entries });
  img["bundle.md"] = prev;
  return { ...img, ...extra };
}
const gate = async (img) => (await runGate({ bundleId: ID, image: img, knownIds: new Set([ID]), hasCapture: async () => ({ present: true }),
  registers: [] }));
const all = async (img) => recordChecks({ folderName: ID, files: new Map(Object.entries(img).filter(([, v]) => typeof v === "string")),
  sha256: async (v) => sha(v) });
const of = (list, check) => list.filter((f) => f.check === check);

test("R30: C-20.1 walks write order (seq): a mechanical promotion written last is judged against live, whatever its key", async () => {
  /* Write order: a member's creation (key "z1"), then a mechanical sweep (key "a1") that changed the title. */
  const promos = [{ key: "z1", text: md() }, { key: "a1", text: md({ title: '"Retitled"' }), writer: "mechanical", operation: "sweep" }];
  const byWrite = of(await all(image(promos)), "C-20.1");
  assert.deepEqual(byWrite.map((f) => f.severity), ["error"]);
  assert.match(byWrite[0].message, /mechanical 'sweep' promotion 'a1' changed frontmatter 'title'/);
  /* The same image without seq is walked by key, which here cannot see the change, and says it walked by key. */
  const byKey = of(await all(image(promos, { noSeq: true })), "C-20.1");
  assert.deepEqual(byKey.map((f) => f.severity), ["info"]);
  assert.match(byKey[0].message, /carries no write order/);
  /* Inside the envelope: nothing. And the gate runs it (the catalogue no longer does). */
  const inside = [{ key: "z1", text: md() }, { key: "a1", text: md({ last_updated: '"2026-07-02T00:00:00Z"' }), writer: "mechanical", operation: "member-attest" }];
  assert.deepEqual(of(await all(image(inside)), "C-20.1"), []);
  const g = await gate(image(promos));
  assert.equal(g.findings.filter((f) => f.check === "C-20.1").length, 1);
  const cat = await checkBundle({ folderName: ID, files: new Map(Object.entries(image(promos))), sha256: async (v) => sha(v),
    resolveTarget: () => true });
  assert.deepEqual(cat.findings.filter((f) => f.check === "C-20.1"), []);
});

test("R30: C-17.2 classifies a pending package's divergence along write order (seq), never key order", async () => {
  /* Write order: A (key "z1") then B (key "a1") touching data/b.json; a package based on what A wrote, touching
     data/c.json, is disjoint from everything written after its base. */
  const A = md(), B = md({ last_updated: '"2026-07-02T00:00:00Z"' });
  const promos = [{ key: "z1", text: A }, { key: "a1", text: B, files: ["bundle.md", "data/b.json"] }];
  const pending = JSON.stringify({ target: ID, base: sha(A), files: [{ name: "data/c.json", sha256: sha("c") }],
    created: "2026-07-03T00:00:00Z", author: "member:a", skill_version: "x" });
  const extra = { "PENDING_PROMOTION.json": pending, "data/c.json.pending": "c" };
  const w = of(await all(image(promos, { extra })), "C-17.2");
  assert.deepEqual(w.map((f) => f.severity), ["info"]);
  assert.match(w[0].message, /disjoint-auto: base found in history at (before a1|after z1); intervening promotion\(s\) \[a1\]/);
  const k = of(await all(image(promos, { extra, noSeq: true })), "C-17.2");
  assert.deepEqual(k.map((f) => f.severity).sort(), ["info", "warn"]);
  assert.ok(k.some((f) => /carries no write order/.test(f.message)));
  /* Overlapping files are adjudicated in either order. */
  const overlap = { ...extra, "PENDING_PROMOTION.json": pending.replace("data/c.json", "data/b.json") };
  assert.match(of(await all(image(promos, { extra: overlap })), "C-17.2")[0].message, /adjudicated: overlapping substantive divergence on \{data\/b\.json\}/);
  /* A package based on live is not a divergence. */
  const onLive = { ...extra, "PENDING_PROMOTION.json": pending.replace(sha(A), sha(B)) };
  assert.deepEqual(of(await all(image(promos, { extra: onLive })), "C-17.2"), []);
});

test("R32: an undeclared edge in the document's own state_history is an error, read as made under earlier rules only where the record holds the same move at or before the fence", async () => {
  const fence = STATE_MOVE_FENCED_SINCE["*"];
  const hist = (ts) => `\n  - timestamp: "${ts}"\n    from_state: verified\n    to_state: collected\n    blurb: "back"\n    author: member:a`;
  const verified = md({ current_state: "verified", prior_state: "collected" });
  const back = (ts) => md({ current_state: "collected", prior_state: "verified", state_history: hist(ts) });
  const c42 = async (img) => of(await all(img), "C-4.2").map((f) => [f.severity, f.message]);
  /* No record of the move: an error, however early the entry's own timestamp. */
  const alone = { "bundle.md": back("2020-01-01T00:00:00Z") };
  assert.deepEqual((await c42(alone)).map((x) => x[0]), ["error"]);
  /* The record holds the same move, dated before the fence: stated, as info, naming the promotion. */
  const before = image([{ key: "k1", text: verified }, { key: "k2", text: back("2026-07-02T00:00:00Z"), created: "2026-07-02T00:00:00Z" }]);
  const got = await c42(before);
  assert.deepEqual(got.map((x) => x[0]), ["info"]);
  assert.match(got[0][1], /made by a path the current rules do not allow .*\(promotion k2\)/);
  /* On the fence's own day is at the fence: still earlier rules. After it: an error. */
  const onFence = image([{ key: "k1", text: verified }, { key: "k2", text: back(`${fence}T09:00:00Z`), created: `${fence}T09:00:00Z` }]);
  assert.deepEqual((await c42(onFence)).map((x) => x[0]), ["info"]);
  const after = image([{ key: "k1", text: verified }, { key: "k2", text: back("2099-01-01T00:00:00Z"), created: "2099-01-01T00:00:00Z" }]);
  assert.deepEqual((await c42(after)).map((x) => x[0]), ["error"]);
  /* A chain that does not join corroborates nothing. */
  const broken = JSON.parse(before["_history/manifest.json"]);
  broken.entries.find((e) => e.key === "k2").base = "0".repeat(64);
  assert.deepEqual((await c42({ ...before, "_history/manifest.json": JSON.stringify(broken) })).map((x) => x[0]), ["error"]);
  /* One recorded move corroborates one entry. */
  const twice = md({ current_state: "collected", prior_state: "verified",
    state_history: hist("2026-07-02T00:00:00Z") + hist("2026-07-02T00:00:01Z") });
  const once = await c42(image([{ key: "k1", text: verified }, { key: "k2", text: twice, created: "2026-07-02T00:00:00Z" }]));
  const edges = once.filter((x) => /is not a legal information edge/.test(x[1]));
  assert.deepEqual(edges.map((x) => x[0]).sort(), ["error", "info"]);
  /* The document's history agreeing with where it stands, and the rest of C-4.2's arms. */
  assert.deepEqual(await c42({ "bundle.md": md() }), []);
  assert.ok((await c42({ "bundle.md": md({ prior_state: "verified" }) })).some((x) => /state_history is empty/.test(x[1])));
  assert.ok((await c42({ "bundle.md": md({ current_state: "verified", prior_state: "collected",
    state_history: `\n  - timestamp: "2026-07-02T00:00:00Z"\n    from_state: collected\n    to_state: verified` }) }))
    .some((x) => /missing 'blurb'/.test(x[1])));
  /* The gate runs it; the catalogue no longer does. */
  assert.ok((await gate(alone)).findings.some((f) => f.check === "C-4.2"));
  const cat = await checkBundle({ folderName: ID, files: new Map(Object.entries(alone)), sha256: async (v) => sha(v), resolveTarget: () => true });
  assert.deepEqual(cat.findings.filter((f) => f.check === "C-4.2"), []);
});

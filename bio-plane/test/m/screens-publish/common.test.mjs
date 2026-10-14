/* screens-publish R10 and R11 (with interface-shell R5, R8–R13, R16 and R21 on this module's screens), on the shell's
 * served page: each screen with each of its reads pending, refused and unanswered draws that read in its own state and
 * no key the page holds no word for; after an act the screen reads again what it changed; no secret is kept; the
 * module's screens are the registry's, each drawing exactly its registry acts; its own words are well formed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { open, main, text, press, rawKeys, signer, tick, ok, refusedIn, silent, pending, SCREENS, SCREEN_WORDS, plane as plane0, P, DR, C, GRANT_SECRET } from "./fixtures.mjs";

const REGISTRY = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/registry.json", import.meta.url), "utf8"));
const PAGES = {
  "case-editor": [`/app/case-editor/${P}`, {}, ["casedrafts", "reviewcopy", "casecheck", "whatchangeddrafts"]],
  "review-copy": [`/app/review-copy/${P}`, {}, ["casedrafts", "reviewcopy", "reviewcomments"]],
  ceremony: [`/app/ceremony/${P}/${DR}`, {}, ["reviewcopy", "publishpreflight", "publishtensions", "photomarks"]],
  published: [`/app/published/${C}`, { session: null }, ["publishedcase"]],
  imported: ["/app/imported/IMP-2026-0001", {}, ["importedcases", "importedcase"]],
  docket: [`/app/docket/${P}/${C}`, {}, ["docket", "docketprepare"]],
  doorbell: ["/app/doorbell", { session: null }, []],
  "review-outside": ["/app/review", { session: null, hash: "#grant=" + GRANT_SECRET }, ["reviewcopy"]],
};
const VARIANTS = { refused: refusedIn("SOME_REFUSAL", "The plane refused this read."), silent, pending };

for (const [id, [path, boot, reads]] of Object.entries(PAGES)) {
  test(`R10 ${id}: each read pending, refused and unanswered is drawn in its own state, the screen kept, no key drawn bare (interface-shell R5, R10, R13)`, async () => {
    const p0 = await open(path, { boot });
    assert.deepEqual(rawKeys(p0.root()), [], `${id} with every read answered`);
    for (const op of reads) for (const [name, answer] of Object.entries(VARIANTS)) {
      const p = await open(path, { boot, plane: { [op]: answer } });
      const m = main(p);
      const want = name === "pending" ? "loading" : "failed";
      assert.ok(m.querySelector(`[data-state="${want}"]`), `${id}: ${op} ${name} drawn ${want}`);
      if (name === "refused") assert.match(m.querySelector('[data-state="failed"]').textContent, /The plane refused this read|SOME_REFUSAL/, `${id}: ${op}`);
      assert.ok(m.querySelector("h1"), `${id} with ${op} ${name}: the screen stays`);
      assert.deepEqual(rawKeys(p.root()), [], `${id} with ${op} ${name}`);
    }
  });
}

test("R10 an empty read is drawn empty, never failed: no drafts, no comments, no imports, no docket entries", async () => {
  const none = { casedrafts: ok({ drafts: [] }), importedcases: ok({ imports: [] }), docket: ok({ case: C, entries: [] }), reviewcomments: ok({ comments: [] }) };
  for (const path of [`/app/case-editor/${P}`, "/app/imported", `/app/docket/${P}/${C}`]) {
    const p = await open(path, { plane: none });
    assert.ok(main(p).querySelector('[data-state="empty"]'), path);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, path);
  }
  const q = await open(`/app/review-copy/${P}`, { plane: { reviewcomments: ok({ comments: [] }) } });
  assert.match(text(q), /No comments yet/);
});

test("R10 after an act the screen reads again what it changed and draws it; nothing is drawn prepared before its answer", async () => {
  let n = 0;
  const p = await open(`/app/review-copy/${P}`, { plane: { reviewcopy: () => { n += 1; return ok({ ...JSON.parse(JSON.stringify((plane0()).reviewcopy.json.result)), grants: n > 1 ? [] : [{ grant_id: "GRT-1", recipient: "Ana" }] }); } } });
  assert.match(text(p), /Ana/);
  await press(p, "reviewrevoke", { reason: "done" });
  assert.ok(n > 1, "the copy read again");
  assert.match(text(p), /Nobody outside the group can read this draft/);
  const q = await open(`/app/ceremony/${P}/${DR}`, { plane: { publish: pending } });
  tick(q, "ce-tie", "yes");
  await press(q, "publish", { reason: "r" });
  assert.ok(!/is prepared for signing/.test(text(q)), "not drawn prepared while publish has not answered");
});

test("R11 no secret is written to storage, an address or a later request: the grant's secret, the outside reader's, the signatures", async () => {
  const sig = signer();
  const p = await open(`/app/ceremony/${P}/${DR}`, { boot: { signer: sig } });
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "r" });
  await press(p, "caseratify", { reason: "r" });
  const sigReq = p.requests.find((r) => r.op === "caseratify");
  assert.ok(sigReq, "signed");
  for (const r of p.requests.filter((x) => x !== sigReq)) assert.ok(!JSON.stringify([r.url, r.body]).includes("SSH SIGNATURE"), `${r.op} carries no signature`);
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes("SSH SIGNATURE"));
  assert.ok(!p.location.pathname.includes("SIG"));
  const q = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET } });
  await press(q, "reviewcomment", { values: { "ro-comment": "x" } });
  for (const r of q.requests) assert.ok(!r.url.includes(GRANT_SECRET), "the secret in no address");
  for (const v of [...q.store.values(), ...q.local.values()]) assert.ok(!String(v).includes(GRANT_SECRET), "nor in storage");
  assert.ok(!String(q.location.hash).includes(GRANT_SECRET) && !q.location.pathname.includes(GRANT_SECRET));
});

test("R10 (interface-shell R21) the eight registry screens, each drawing exactly its registry acts, labelled act.<op>.label.<screen>; the shell serves them", () => {
  assert.equal(typeof interfacePage(SCREENS), "string", "interface-shell R21's check passes");
  assert.deepEqual(SCREENS.map((s) => s.id), ["case-editor", "review-copy", "ceremony", "published", "imported", "docket", "doorbell", "review-outside"]);
  for (const s of SCREENS) {
    const reg = REGISTRY.screens.find((x) => x.id === s.id);
    assert.ok(reg, `${s.id} is a registry screen`);
    assert.deepEqual(s.acts.map((a) => a.op).sort(), reg.acts.map((a) => a.op).sort(), s.id);
    for (const a of s.acts) {
      assert.ok(Object.hasOwn(OPS, a.op), `${a.op} in OPS`);
      assert.equal(a.label, `act.${a.op}.label.${s.id}`);
      assert.ok(s.words.some((w) => (typeof w === "string" ? w : w[0]) === a.label), `${a.label} listed`);
    }
    assert.ok(Object.isFrozen(s) && typeof s.render === "function" && typeof s.reads === "function");
  }
});

test("R10 the module's own words: frozen [key, en, protected] rows, unique, each a screen.<id> key drawn by its screen, none shadowing WORD_ROWS, no place named", () => {
  const shared = new Set(WORD_ROWS.map((r) => r[0]));
  const keys = new Set();
  const listed = new Set(SCREENS.flatMap((s) => s.words.filter((w) => typeof w !== "string").map((w) => w[0])));
  for (const r of SCREEN_WORDS) {
    assert.ok(Object.isFrozen(r) && r.length === 3 && typeof r[0] === "string" && typeof r[1] === "string" && typeof r[2] === "boolean", String(r[0]));
    assert.ok(!keys.has(r[0]), `${r[0]} once`);
    keys.add(r[0]);
    assert.match(r[0], /^screen\.(case-editor|review-copy|ceremony|published|imported|docket|doorbell|review-outside)\./);
    assert.ok(!shared.has(r[0]), `${r[0]} shadows WORD_ROWS`);
    assert.ok(listed.has(r[0]), `${r[0]} is drawn by some screen`);
    assert.ok(!/\b(Oakland|Alameda|Coliseum)\b/.test(r[1]), `${r[0]} names no place`);
  }
  for (const s of SCREENS) for (const w of s.words) if (typeof w === "string") assert.ok(shared.has(w), `${s.id}: ${w} in WORD_ROWS`);
  assert.ok(Object.isFrozen(SCREEN_WORDS));
});

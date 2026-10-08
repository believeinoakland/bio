/* provenance: one capture's receipts (R60), a receipt's web reputation (R61), and the retrieval-locator index (N730,
   a Suggestion of T36-9). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sha, V } from "./fixture.mjs";
import { provenanceOps } from "../../../src/provenance/ops.mjs";
import { migrateProvenance } from "../../../src/provenance/schema.mjs";

const T = (h) => `2026-09-27T${String(h).padStart(2, "0")}:00:00Z`;
const LISTED = { tool: "cloudflare-intel", listed: true, categories: ["phishing"], checked_at: T(1) };
const CLEAN = { tool: "cloudflare-intel", listed: false, categories: [], checked_at: T(6) };
const UNANSWERED = { tool: null, listed: null, categories: [], checked_at: T(7), unanswered: "no tool configured" };

test("R60: every receipt of one capture, at any address and by any via, ordered by address then via, as R16 answers each", () => {
  const w = world();
  const s = sha("x"), other = sha("y");
  w.prov.recordReceipt({ addressNorm: "e.org/b", captureSha: s, retrieved: T(1), via: "direct" });
  w.prov.recordReceipt({ addressNorm: "e.org/b", captureSha: s, retrieved: T(2), via: "direct" });
  w.prov.recordReceipt({ addressNorm: "e.org/b", captureSha: s, retrieved: T(3), via: "archive.org", reputation: CLEAN });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: s, retrieved: T(4), via: "direct" });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: other, retrieved: T(5), via: "direct" });
  const r = w.prov.receiptsOfCapture({ captureSha: s });
  assert.equal(r.capture_sha, s);
  assert.deepEqual(r.rows.map((x) => [x.address_norm, x.via]),
                   [["e.org/a", "direct"], ["e.org/b", "archive.org"], ["e.org/b", "direct"]]);
  assert.equal(r.observations, 4);
  /* Each row exactly as R16 answers it for its address. */
  const byAddr = [...w.prov.receipts({ addressNorm: "e.org/a" }).rows, ...w.prov.receipts({ addressNorm: "e.org/b" }).rows]
    .filter((x) => x.capture_sha === s);
  assert.deepEqual(r.rows, byAddr);
  /* A `sha256:` prefix and case are ignored. */
  assert.deepEqual(w.prov.receiptsOfCapture({ captureSha: `sha256:${s.toUpperCase()}` }), r);
  /* A capture with no receipt has none. */
  assert.deepEqual(w.prov.receiptsOfCapture({ captureSha: sha("none") }), { capture_sha: sha("none"), rows: [], observations: 0 });
});

test("R60: no digest, or one that is not 64 hex, answers no rows and observations 0, never every receipt; nothing is written", () => {
  const w = world();
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: sha("a"), retrieved: T(1) });
  const before = w.snapshot();
  for (const bad of [undefined, null, "", "abc", sha("a").slice(0, 63), `${sha("a")}0`, "%", 42, {}])
    assert.deepEqual(w.prov.receiptsOfCapture({ captureSha: bad }), { capture_sha: null, rows: [], observations: 0 }, String(bad));
  assert.deepEqual(w.prov.receiptsOfCapture(), { capture_sha: null, rows: [], observations: 0 });
  w.prov.receiptsOfCapture({ captureSha: sha("a") });
  assert.deepEqual(w.snapshot(), before);
});

test("R61: a receipt's reputation is stored exactly as given and answered by R16 and R60; none answers null", () => {
  const w = world();
  const s = sha("r");
  w.prov.recordReceipt({ addressNorm: "e.org/r", captureSha: s, retrieved: T(1), reputation: LISTED });
  w.prov.recordReceipt({ addressNorm: "e.org/u", captureSha: s, retrieved: T(1), reputation: UNANSWERED });
  w.prov.recordReceipt({ addressNorm: "e.org/n", captureSha: s, retrieved: T(1) });
  assert.deepEqual(w.prov.receipts({ addressNorm: "e.org/r" }).rows[0].reputation, LISTED);
  assert.deepEqual(w.prov.receipts({ addressNorm: "e.org/u" }).rows[0].reputation, UNANSWERED);
  assert.equal(w.prov.receipts({ addressNorm: "e.org/n" }).rows[0].reputation, null);
  assert.deepEqual(w.prov.receiptsOfCapture({ captureSha: s }).rows.map((x) => x.reputation), [null, LISTED, UNANSWERED]);
  assert.deepEqual(w.prov.receipts({}).rows.map((x) => x.reputation), [null, LISTED, UNANSWERED]);
  /* Anything but a plain object is no reputation. */
  for (const [i, v] of [["string", "listed"], ["list", [LISTED]], ["number", 1], ["true", true]].entries()) {
    w.prov.recordReceipt({ addressNorm: `e.org/bad${i}`, captureSha: s, retrieved: T(1), reputation: v[1] });
    assert.equal(w.prov.receipts({ addressNorm: `e.org/bad${i}` }).rows[0].reputation, null, v[0]);
  }
});

test("R61: a repeat that gives a reputation replaces it, one that gives none keeps it; no other field moves", () => {
  const w = world();
  const s = sha("p");
  const plain = () => w.prov.receipts({ addressNorm: "e.org/p" }).rows[0];
  w.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(2), retrievalLocator: "https://e.org/p" });
  const without = world();
  without.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(2), retrievalLocator: "https://e.org/p",
                               reputation: LISTED });
  const { reputation: r1, ...rest1 } = without.prov.receipts({ addressNorm: "e.org/p" }).rows[0];
  const { reputation: r0, ...rest0 } = plain();
  assert.deepEqual(rest1, rest0, "the reputation changes no other field");
  assert.deepEqual([r0, r1], [null, LISTED]);
  w.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(3), reputation: LISTED });
  assert.deepEqual(plain().reputation, LISTED);
  w.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(4) });
  assert.deepEqual(plain().reputation, LISTED, "kept when none is given");
  w.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(5), reputation: CLEAN });
  assert.deepEqual(plain().reputation, CLEAN, "the newest lookup replaces it");
  assert.deepEqual([plain().first_retrieved, plain().last_retrieved, plain().observations, plain().retrieval_locator],
                   [T(2), T(5), 4, "https://e.org/p"]);
  /* The observation is the bytes', never the reputation's. */
  assert.equal(w.prov.recordReceipt({ addressNorm: "e.org/p", captureSha: s, retrieved: T(6), reputation: UNANSWERED }).observation,
               "unchanged");
});

test("R61: no grade and no version chain moves with a reputation", () => {
  const plain = world(), rep = world();
  for (const w of [plain, rep]) {
    const c = w.cap("g");
    w.promoteInfo("INFO-2026-0001-g", { captures: [c] });
    w.prov.recordReceipt({ addressNorm: "e.org/g", captureSha: c.sha, retrieved: T(1),
                           ...(w === rep ? { reputation: LISTED } : {}) });
    w.prov.recordReceipt({ addressNorm: "e.org/g", captureSha: c.sha, retrieved: T(2), via: "archive.org",
                           ...(w === rep ? { reputation: CLEAN } : {}) });
    w.c = c;
  }
  assert.deepEqual(rep.prov.captureGrade(rep.c.sha), plain.prov.captureGrade(plain.c.sha));
  assert.deepEqual(rep.prov.versionChain({ addressNorm: "e.org/g", viewer: V("x") }),
                   plain.prov.versionChain({ addressNorm: "e.org/g", viewer: V("x") }));
  assert.deepEqual(rep.prov.registerHolds({ sha: rep.c.sha }), plain.prov.registerHolds({ sha: plain.c.sha }));
  assert.deepEqual(rep.prov.capturesOf("INFO-2026-0001-g"), plain.prov.capturesOf("INFO-2026-0001-g"));
});

test("R61: R47's onReceipt payload carries the reputation this write gave, null when it gave none", () => {
  const w = world({ order: [] });
  const seen = [];
  w.prov.onReceipt("file-safety", (e) => { seen.push(e); return null; });
  w.prov.recordReceipt({ addressNorm: "e.org/l", captureSha: sha("l"), retrieved: T(1), reputation: LISTED });
  w.prov.recordReceipt({ addressNorm: "e.org/l", captureSha: sha("l"), retrieved: T(2) });
  w.prov.recordReceipt({ addressNorm: "e.org/l", captureSha: sha("l"), retrieved: T(3), reputation: "listed" });
  assert.deepEqual(seen.map((e) => e.reputation), [LISTED, null, null]);
  assert.deepEqual(Object.keys(seen[0]).sort(),
    ["address", "address_norm", "capture_sha", "context", "observation", "reputation", "retrieval_locator", "retrieved", "via"]);
});

test("R61: op=recordcapturedlocator (R53) carries the body's reputation to the receipt", () => {
  const w = world();
  const url = new URL("https://plane/?op=recordcapturedlocator");
  const r = provenanceOps(w.prov, url, { addressNorm: "e.org/o", captureSha: sha("o"), retrieved: T(1), reputation: LISTED,
                                         actor: "plane" }).recordcapturedlocator();
  assert.equal(r.recorded, true);
  assert.deepEqual(w.prov.receiptsOfCapture({ captureSha: sha("o") }).rows[0].reputation, LISTED);
});

test("R61: a store written before the column existed gains it at boot, every earlier receipt null, no row moved", () => {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...a) { const st = db.prepare(q); return st.columns().length ? st.all(...a) : (st.run(...a), []); } };
  db.exec(`CREATE TABLE captured_locators (address_norm TEXT NOT NULL, address TEXT NOT NULL, capture_sha TEXT NOT NULL,
             via TEXT NOT NULL DEFAULT 'direct', retrieval_locator TEXT, first_retrieved TEXT NOT NULL,
             last_retrieved TEXT NOT NULL, observations INTEGER NOT NULL DEFAULT 1,
             PRIMARY KEY (address_norm, capture_sha, via))`);
  db.prepare(`INSERT INTO captured_locators VALUES (?,?,?,?,?,?,?,?)`).run("e.org/m", "https://e.org/m", sha("m"), "direct",
    null, T(1), T(2), 2);
  migrateProvenance(sql);
  migrateProvenance(sql);
  assert.deepEqual({ ...db.prepare(`SELECT * FROM captured_locators`).get() },
    { address_norm: "e.org/m", address: "https://e.org/m", capture_sha: sha("m"), via: "direct", retrieval_locator: null,
      first_retrieved: T(1), last_retrieved: T(2), observations: 2, reputation: null });
});

test("N730 (T36-9's Suggestion): a read of the receipts by retrieval locator is an index seek, not a scan", () => {
  const w = world();
  const plan = w.rows(`EXPLAIN QUERY PLAN SELECT capture_sha FROM captured_locators WHERE retrieval_locator = ?`, "zip:x!0")
    .map((r) => r.detail).join(" | ");
  assert.match(plan, /USING (COVERING )?INDEX captured_locators_locator/);
  /* And the capture read (R60) seeks its own index. */
  const byCapture = w.rows(`EXPLAIN QUERY PLAN SELECT * FROM captured_locators WHERE capture_sha = ? ORDER BY address_norm, via`,
                           sha("x")).map((r) => r.detail).join(" | ");
  assert.match(byCapture, /USING INDEX captured_locators_sha/);
});

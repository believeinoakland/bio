/* calculations R51 (K5157; walk-T51-final 06 §8): `declareTable`'s `source` is a content id, or a found passage `{capture_sha, extent}` whose content row
   is minted as money's `source` is (money R2), so a table may be declared from a passage nobody has cited yet. The screen sends the found item's
   `{capture_sha, extent}` whenever the item carries no `content_id`. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const rows = Array.from({ length: 40 }, (_, i) => [`PBs${String(i).padStart(4, "0")}`, "P002", String(1 + (i % 97))]);
const text = `${[HEADER, ...rows].map((r) => r.join(",")).join("\n")}\n`;
const declare = (w, source, by = V("bob")) => w.c.declareTable({ source, schema: { fields: F }, header: HEADER, by });

/* a captured CSV whose passage nobody has cited: no content row exists for it */
function uncited(w, bytes = text) {
  const d = w.document(bytes);
  w.ev.m.set(d.capSha, new TextEncoder().encode(bytes));
  w.ex.readings[d.capSha] = { pageCount: 1, captureFormat: "csv" };
  w.ex.units[d.capSha] = { units: [], state: "whole" };
  return d;
}

test("R51 R1: a table is declared from a found passage nobody has cited: ok, its content row minted, the same table sha as from the content id", async () => {
  const w = seeded();
  const d = uncited(w);
  const found = { capture_sha: d.capSha, extent: { kind: "document" } };
  const before = w.count("content");
  const r = await declare(w, found);
  assert.equal(code(r), "ok", JSON.stringify(r).slice(0, 300));
  assert.equal(r.rows, 40);
  assert.equal(w.count("content"), before + 1, "the passage's content row is minted by the act");
  const cited = w.content.mint({ bundleId: d.bundleId, captureSha: d.capSha, extent: { kind: "document" }, mintedBy: V("bob") });
  assert.equal(cited.minted, false, "citing the passage afterwards finds the row the declaration minted");
  const again = await declare(w, cited.content_id);
  assert.equal(code(again), "ok");
  assert.equal(again.sha, r.sha, "one source has one table sha whichever way it is named");
  /* the content id route is unchanged, and a found passage cited already is found, not minted twice */
  const same = await declare(w, found);
  assert.equal(code(same), "ok");
  assert.equal(same.sha, r.sha);
  assert.equal(w.count("content"), before + 1);
});

test("R51 R1: a found passage that is not a source is refused and mints nothing: an unheld capture, an extent the capture lacks, one a member may not see, an unreadable shape", async () => {
  const w = seeded();
  const d = uncited(w);
  const before = w.count("content");
  const tables = w.count("calc_tables");
  assert.equal(code(await declare(w, { capture_sha: "f".repeat(64), extent: { kind: "document" } })), "NO_SUCH_CONTENT", "a capture the record does not hold");
  assert.equal(code(await declare(w, { capture_sha: d.capSha, extent: { kind: "nonsense" } })), "NO_SUCH_CONTENT", "an extent no reader produces");
  assert.equal(code(await declare(w, { capture_sha: d.capSha })), "ok", "a found passage with no extent is the document, as money reads it");
  w.member("mallory");
  const priv = w.document("private ledger", { project: w.project("Private ledger", "bob") });
  w.ev.m.set(priv.capSha, new TextEncoder().encode(text));
  assert.equal(code(await declare(w, { capture_sha: priv.capSha, extent: { kind: "document" } }, V("mallory"))), "NO_SUCH_CONTENT", "not one the declarer may see");
  assert.equal(code(await declare(w, { capture_sha: 7 })), "NO_SUCH_CONTENT", "a capture sha that is no string names no held capture");
  assert.equal(code(await declare(w, {})), "NO_SOURCE");
  assert.equal(w.count("content"), before + 1, "only the one ok declaration minted");
  assert.equal(w.count("calc_tables"), tables + 1);
});

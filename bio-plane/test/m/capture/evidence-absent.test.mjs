/* capture R63 (N285, K275, N347): `evidenceAbsent`, the one answer to "no evidence object is held under a digest", minted
   at one site with its own row (C-118.1) under its own code, `EVIDENCE_NOT_HELD`, and R21's get answering through it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { bucket, sha } from "./fixture.mjs";
import { evidenceAbsent, captureObjectOp } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";

const TRANSLATION = "The record holds no stored copy of a document under this fingerprint.";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

test("R63 (N347): evidenceAbsent answers 404 with ok false, reason and code EVIDENCE_NOT_HELD, its own row's check and translation, the digest and the store", () => {
  const d = sha("absent");
  const a = evidenceAbsent(d, "bio");
  assert.equal(a.status, 404);
  assert.deepEqual(a.body, { ok: false, reason: "EVIDENCE_NOT_HELD", code: "EVIDENCE_NOT_HELD", check: "C-118.1", translation: TRANSLATION,
                             sha256: d, store: "bio" });
});

test("R63 (N347): its one row is in capture's own table under EVIDENCE_NOT_HELD, C-118.1 with its number and translation kept, its where naming evidenceAbsent; no NOT_FOUND key remains", () => {
  const row = CAPTURE_CHECKS.EVIDENCE_NOT_HELD;
  assert.equal(CAPTURE_CHECKS.NOT_FOUND, undefined, "the generic key is gone");
  assert.deepEqual(Object.keys(CAPTURE_CHECKS).sort(), ["ACCOUNT_NO_TEXT", "EVIDENCE_NOT_HELD", "KNOCKER_SECRET_WEAK", "KNOCK_DISCARDED",
                                                      "NOT_THE_CAPTURING_ACTOR", "NO_SUCH_KNOCK"], "C-118.1–C-118.6 (N364 added .3–.6)");
  assert.equal(row.check, "C-118.1");
  assert.equal(row.translation, TRANSLATION);
  assert.match(row.where, /^src\/capture\/ops\.mjs evidenceAbsent > /);
  assert.equal(Object.isFrozen(CAPTURE_CHECKS) && Object.isFrozen(row), true);
  assert.equal(Object.values(CAPTURE_CHECKS).filter((r) => r.check === "C-118.1").length, 1, "one row for the condition");
});

test("R63: extra adds a caller's fields and never replaces the fixed ones", () => {
  const d = sha("x");
  const a = evidenceAbsent(d, "bio", { tokenClass: "member", detail: "d", ok: true, reason: "OTHER", code: "OTHER",
                                       check: "C-1.1", translation: "t", sha256: "f".repeat(64), store: "elsewhere" });
  assert.deepEqual(a.body, { ok: false, reason: "EVIDENCE_NOT_HELD", code: "EVIDENCE_NOT_HELD", check: "C-118.1", translation: TRANSLATION,
                             sha256: d, store: "bio", tokenClass: "member", detail: "d" });
  assert.equal(a.status, 404);
});

test("R63: it never throws and writes nothing, whatever it is handed", () => {
  const hostile = new Proxy({}, { ownKeys() { throw new Error("boom"); } });
  const getter = Object.defineProperty({}, "x", { enumerable: true, get() { throw new Error("boom"); } });
  for (const [s, st, extra] of [[undefined, undefined, undefined], [null, null, null], [42, {}, []], ["", "", "str"],
                                ["a".repeat(64), "bio", hostile], ["a".repeat(64), "bio", getter]]) {
    const a = evidenceAbsent(s, st, extra);
    assert.equal(a.status, 404);
    assert.deepEqual([a.body.ok, a.body.reason, a.body.code, a.body.check, a.body.translation],
                     [false, "EVIDENCE_NOT_HELD", "EVIDENCE_NOT_HELD", "C-118.1", TRANSLATION]);
    assert.equal(a.body.sha256, s ?? null);
  }
  /* a pure function: two calls agree, and no store is reachable from its arguments */
  assert.deepEqual(evidenceAbsent("b".repeat(64), "bio"), evidenceAbsent("b".repeat(64), "bio"));
});

test("R63 R21: op=capture's get of an absent object answers through evidenceAbsent, exactly its body and status, with the caller class beside", async () => {
  const b = bucket();
  const h = { json, storageAbsent: () => json({}, 503), requiredArgument: () => ({}), key: (s) => `bio/captures/${s}`,
              storeName: "bio", cls: "member" };
  const d = sha("none");
  const r = await captureObjectOp(new Request(`https://p/?op=capture&sha256=${d}`), new URL(`https://p/?op=capture&sha256=${d}`),
                                  { CAPTURES: b }, h);
  const want = evidenceAbsent(d, "bio", { tokenClass: "member" });
  assert.equal(r.status, want.status);
  assert.deepEqual(await r.json(), want.body);
  assert.equal(b.calls.filter((c) => c[0] === "put").length, 0, "nothing written");
});

/* N347 (K440, K445): the plane's source mints no refusal under the generic `NOT_FOUND`. A refusal is minted as a
   `reason` or `code` field, through a refusal helper, or as a row key of a module's own table (`checks.mjs`).
   `content/notice.mjs`' `NOT_FOUND` is a grade inside an answer, never a refusal, and matches none of these forms;
   pdf-worker's and ocr-worker's keep theirs (K445), outside the plane's `src/`. */
test("R63 (N347): a sweep of the plane's src/ finds no NOT_FOUND refusal minted anywhere: EVIDENCE_NOT_HELD is the one code for the condition", () => {
  const src = fileURLToPath(new URL("../../../src/", import.meta.url));
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (/\.m?js$/.test(n)) files.push(p); } };
  walk(src);
  assert.ok(files.length > 100, `the sweep reads the plane's source (${files.length} files)`);
  const minted = [
    /\b(?:reason|code)\s*:\s*["'`]NOT_FOUND["'`]/,
    /\b\w*[Rr]efusal\s*\(\s*["'`]NOT_FOUND["'`]/,
    /\bjson\s*\(\s*\{[^}]*["'`]NOT_FOUND["'`]/,
  ];
  const hits = [];
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const rel = relative(src, f);
    text.split("\n").forEach((line, i) => {
      if (minted.some((re) => re.test(line))) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
      if (/(^|\/)checks\.mjs$/.test(rel) && /^\s*["'`]?NOT_FOUND["'`]?\s*:/.test(line)) hits.push(`${rel}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(hits, [], "no refusal is minted as NOT_FOUND");
  /* the one site that answers the condition answers the code the sweep permits */
  assert.equal(evidenceAbsent(sha("s"), "bio").body.code, "EVIDENCE_NOT_HELD");
});

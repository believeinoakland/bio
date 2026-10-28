/* structured-text-reader R9, R10: no ceiling is a literal in the module's code, each is read from runtime-limits'
 * table; the module is pure (no store, no network, no clock), runs and fetches nothing a file names, names no place,
 * and every "no" says which kind of no and why. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { enc, countingSource } from "./fixtures.mjs";

const DIR = fileURLToPath(new URL("../../../src/structured-text-reader/", import.meta.url));
const sources = () => readdirSync(DIR).filter((f) => f.endsWith(".mjs")).map((f) => [f, readFileSync(DIR + f, "utf8")]);
/* the code alone: comments carry the figures in words and are not code */
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");

test("R9 the module's ceilings are runtime-limits' figures, quoted through boundOf", () => {
  assert.equal(S.TEXT_BYTES_MAX, boundOf("text", "bytes"));
  assert.equal(S.NESTING_MAX, boundOf("text", "nesting"));
  assert.equal(S.CALENDAR_EVENTS_MAX, boundOf("text", "calendar_events"));
});

test("R9 no numeric literal in the module's code is one of its ceilings", () => {
  const figures = [S.TEXT_BYTES_MAX, S.NESTING_MAX, S.CALENDAR_EVENTS_MAX];
  for (const [file, src] of sources()) {
    const c = code(src);
    for (const lit of c.match(/\b\d[\d_]*(?:\.\d+)?(?:e\d+)?\b/gi) ?? []) {
      const n = Number(lit.replace(/_/g, ""));
      assert.ok(!figures.includes(n), `${file}: the literal ${lit} is a ceiling`);
    }
    assert.ok(!/100\s*\*\s*(?:1024\s*\*\s*1024|MiB|1048576)/.test(c), `${file}: the text bound written out`);
  }
});

test("R10 pure: no store, no network, no clock, no randomness in the module's code; no place named", () => {
  for (const [file, src] of sources()) {
    const c = code(src);
    for (const [re, what] of [[/\bfetch\s*\(/, "fetch"], [/\bDate\b/, "the clock"], [/performance\.now/, "the clock"], [/Math\.random/, "randomness"],
      [/\bsetTimeout\b|\bsetInterval\b/, "timers"], [/\benv\./, "a binding"], [/\bimport\s*\(/, "a dynamic import"], [/\beval\s*\(|new Function/, "running code"]]) {
      assert.ok(!re.test(c), `${file}: ${what}`);
    }
    assert.ok(!/Oakland|Alameda|California|Berkeley/i.test(src), `${file}: a place is named`);
  }
});

test("R10 nothing a file names is fetched while it is read", async () => {
  const realFetch = globalThis.fetch;
  let fetched = 0;
  globalThis.fetch = async () => { fetched++; throw new Error("no fetch"); };
  try {
    const xml = '<?xml version="1.0"?><!DOCTYPE r SYSTEM "https://dtd.example/r.dtd" [<!ENTITY e SYSTEM "https://x.example/e">]><r>&e;<x:include xmlns:x="http://www.w3.org/2001/XInclude" href="https://x.example/i.xml"/></r>';
    const r = await S.xmlEntry.read(countingSource(enc(xml)), null, null);
    assert.equal(r.ok, true);
    assert.equal(r.units.find((u) => u.kind === "text").text, "&e;", "an external entity is left as written, never expanded");
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(fetched, 0);
});

test("R10 every no says which kind of no and why: a reason code, a final or transient failure and a sentence", async () => {
  const noes = [
    await S.jsonEntry.read({ size: S.TEXT_BYTES_MAX + 1, readRange: async () => { throw new Error("x"); } }),
    await S.jsonEntry.read({ size: 10, readRange: async () => { throw new Error("store down"); } }),
    await S.jsonEntry.read(countingSource(enc("[1]")), "not a cursor"),
    await S.jsonEntry.read(countingSource(enc("[".repeat(S.NESTING_MAX + 1))), null),
    await S.kmzEntry.read(countingSource(enc("not a zip at all")), null),
  ];
  for (const r of noes) {
    assert.equal(r.ok, false);
    assert.ok(["final", "transient"].includes(r.failure), JSON.stringify(r));
    assert.match(r.reason, /^[A-Z_]+$/);
  }
  for (const r of noes.filter((x) => x.failure === "final")) assert.equal(typeof r.detail, "string", r.reason);
  assert.equal(noes[1].failure, "transient", "a source that fails is tried again, never the file's fault");
});

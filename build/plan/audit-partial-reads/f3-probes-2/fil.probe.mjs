import test from "node:test";
globalThis.MPLABEL = "a";
const { world, V, WORDS, DOC, sha } = await import("./filings-fx.mjs");
const { sha: s2 } = await import("./mp.mjs");
test("filings exhibits", () => {
  const x = world();
  const m = globalThis.MPW;
  console.log("captureFor(DOC)", x.content.captureFor(DOC) === m.whole ? "WHOLE" : m.held.some(h=>h.sha256===x.content.captureFor(DOC)) ? "PART" : "other");
  const A = x.action();
  const d = x.f.filingPrepare({ action: A, text: WORDS, preparer: V("bo"), viewer: V("bo") });
  console.log("prepare", d.ok, d.reason ?? "");
  for (const e of d.exhibits || []) console.log("exhibit", e.sha256 === m.whole ? "WHOLE" : e.sha256.slice(0,8), "home", e.home, "locator", e.locator, "captured_at", e.captured_at, "grade", JSON.stringify(e.grade).slice(0,100), "cited_by", e.cited_by);
});

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { makeKit, MB } from "./r8-kit.mjs";
const kit = makeKit({ tag: "g127c" });
after(() => kit.mf.dispose());
const { acquire, pdfOf, serve, sha, person, get, until, founder } = kit;
const body = (a) => (a && a.result !== undefined ? a.result : a);
const SIZE = Number(process.env.SIZE || 10 * MB);
const W1 = process.env.W1 || "R9 alpha the first page words", W2 = process.env.W2 || "R9 betaa the other page words";
async function press(auth, name, bytes) {
  serve(name, bytes, {});
  const locator = `https://www.example.gov/files/${name}`;
  const r = await acquire(auth, { locator });
  console.log(name, "press", r.status, JSON.stringify(r.body).slice(0, 300));
  const h = await until(async () => { const x = body(await get(auth, { op: "heldat", address: locator })); return x && x.held === true ? x : null; }, 60000, 500);
  return { r, h, locator };
}
test("g127c", { timeout: 300000 }, async () => {
  const a = pdfOf(W1, SIZE), b = pdfOf(W2, SIZE);
  console.log("len", a.length, b.length, "sha", sha(a).slice(0,12), sha(b).slice(0,12), "tail equal from 8MiB:", Buffer.compare(a.subarray(8*MB), b.subarray(8*MB)) === 0);
  const m1 = await person("g127c-ann", "member", ["contribute"]);
  const m2 = await person("g127c-bea", "member", ["contribute"]);
  const p1 = await press(m1, "one.pdf", a);
  console.log("first held", !!p1.h);
  const p2 = await press(m2, "two.pdf", b);
  console.log("second held", !!p2.h);
  const adm = await founder();
  for (const s of [p1.r.body?.fetch_pending?.session, p2.r.body?.fetch_pending?.session].filter(Boolean))
    console.log("owed", s.slice(0,8), JSON.stringify(body(await get(adm, { op: "owedwork", sha: s }))).slice(0, 700));
});

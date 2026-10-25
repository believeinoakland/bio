import test from "node:test";
import { storeWorld, open, rowOf, textOf } from "./kit.mjs";
import { translated } from "../interface-shell/world.mjs";
test("probe", async () => {
  const w = await storeWorld();
  const f = await w.signIn("founder");
  await translated(f, "es", [["rail.home.name", "Inicio"]]);
  const r = await f.read("translations", { query: { language: "es" } });
  const withNote = r.words.filter(x=>x.note); console.error("NOTES", withNote.length, JSON.stringify(withNote.slice(0,2).map(x=>[x.key,x.en,x.note])));
  const means = r.words.filter(x=>x.means&&!x.protected); console.error("MEANS", means.length, JSON.stringify(means.slice(0,2).map(x=>[x.key,x.en,x.means])));
  console.error("PROT", r.words.filter(x=>x.protected).length);
  const t0 = Date.now();
  const o = await open("translations", { world: w, as: f, subject: "es" });
  console.error("OPEN ms", Date.now()-t0, o.text.length, textOf(rowOf(o.tree, "rail.home.name")).slice(0,200));
});

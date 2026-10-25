import { test } from "node:test";
import { openWorld, members, btn } from "./page.mjs";
test("probe", async () => {
  const t = await members({ mai: ["contribute"] });
  const admin = await t.world.signIn("admin");
  try { console.log("PROBE set", JSON.stringify(await admin.act("groupkeyset", { body: { key: "sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789" } }))); } catch (e) { console.log("PROBE ERR", e.message); }
  try { console.log("PROBE sw", JSON.stringify(await admin.act("groupkeyswitch", { body: { on: true } }))); } catch (e) { console.log("PROBE ERR", e.message); }
  console.log("PROBE st", JSON.stringify(await t.mai.read("groupkeystate")));
  const sha = "3".repeat(64);
  for (const path of [`/app/about-knocker/${sha}`, "/app/leads", "/app/watching"]) { const p = await openWorld(path, { world: t.world, as: t.mai }); console.log("PROBE", path, !!btn(p, "writinghelp")); }
  try { console.log("PROBE rm", JSON.stringify(await admin.act("groupkeyswitch", { body: { on: false } }))); } catch (e) { console.log("PROBE ERR", e.message); }
  const p = await openWorld("/app/leads", { world: t.world, as: t.mai }); console.log("PROBE off", !!btn(p, "writinghelp"));
});

/* screens-intake R43, R44, R46 (T51 fix round): the writing help the registry lists on the three new screens is drawn only while the
 * assistant is reachable (interface-shell R20), under the own-words field it helps. Fix round 10 (K5054): over the REAL store. The assistant is
 * reachable by the administrator's real acts (her password again, the team's key set and switched on) and made unreachable by switching the key off;
 * the knocker's source is the real one (a knock at the public door, pulled into the record by the member). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, btn } from "./page.mjs";

test("R43 R44 R46 writing help is drawn on about-knocker, leads and watching only while the assistant is reachable", async () => {
  const t = await members({ mai: ["contribute"] }, { ai: true });
  const admin = await t.world.signIn("admin");
  const knocked = (await t.world.door({ url: "/api/?op=knock", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contentText: "A tip about the garage.", fileName: "tip.txt", mediaType: "text/plain", knockerSecret: "k".repeat(24) }) } }, null)).json;
  assert.equal(knocked.ok, true);
  await t.mai.act("inboxpull", { query: { id: knocked.knockId } });
  const paths = [`/app/about-knocker/${knocked.sha256}`, "/app/leads", "/app/watching"];
  /* the team's key not yet held: the assistant is not reachable */
  for (const path of paths) assert.equal(btn(await openWorld(path, { world: t.world, as: t.mai }), "writinghelp"), null, `${path}: not reachable`);
  await admin.act("reauth", { body: { password: admin.password } });
  await admin.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await admin.act("groupkeyswitch", { body: { on: true } });
  for (const path of paths) assert.ok(btn(await openWorld(path, { world: t.world, as: t.mai }), "writinghelp"), `${path}: reachable`);
  await admin.act("groupkeyswitch", { body: { on: false } });
  for (const path of paths) assert.equal(btn(await openWorld(path, { world: t.world, as: t.mai }), "writinghelp"), null, `${path}: switched off again`);
});

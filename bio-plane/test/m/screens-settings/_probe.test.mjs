import test from "node:test";
import { storeWorld } from "./kit.mjs";
test("probe", async () => {
  const w = await storeWorld();
  const f = await w.signIn("founder");
  await f.act("profilesset", { body: { profiles: ["oakland-alameda"] } });
  const r = await w.door({ url: "/api/?op=factconfirm", init: { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ act: "correct", value: "America/Denver", how: "read", source: "oaklandca.gov", path: "oakland-alameda/time_zone" }) } }, f);
  console.error("RES", JSON.stringify(r.json.result.errors));
});

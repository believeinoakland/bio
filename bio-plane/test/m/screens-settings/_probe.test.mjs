import test from "node:test";
import { storeWorld } from "./kit.mjs";
test("probe", async () => {
  const w = await storeWorld();
  const f = await w.signIn("founder");
  for (const op of ["groupidentity","grouplanguages","courtnotice","hostingaccess","strengthbarof","factstatus","profiles","exportlog","stats","memberlanguage","groupdescription"]) {
    try { console.log(op, JSON.stringify(await f.read(op)).slice(0,900)); } catch (e) { console.log(op, "ERR", e.message.slice(0,200)); }
  }
});

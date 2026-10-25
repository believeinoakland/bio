import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
const kit = makeKit({ tag: "w10r" });
const J = (x, n = 1500) => String(JSON.stringify(x)).slice(0, n);
try {
  const own = await kit.ownerOf("owner-a");
  const a = await kit.get(own.auth, { op: "affordances" });
  console.log("AFF", J(a, 1800));
  const b = await kit.get(own.auth, { op: "whoami" });
  console.log("WHO", J(b, 600));
  const w = await kit.post(own.auth, "writinghelp", { op: "casedraft", field: "scope", told: "whether the contract was stamped" });
  console.log("WH", J(w.body, 500));
} catch (x) { console.log("ERR", x.stack.slice(0, 900)); }
await kit.mf.dispose();

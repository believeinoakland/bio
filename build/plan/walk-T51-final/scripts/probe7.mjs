import { makeKit, BIAS } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { pngOf } from "./10a-lib.mjs";
const kit = makeKit({ tag: "w10q" });
const J = (x, n = 900) => String(JSON.stringify(x)).slice(0, n);
const R = kit.R;
try {
  const own = await kit.ownerOf("owner-a"); const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, "Two captures");
  kit.serve("register.txt", kit.te("The register logs the amendment as number 4471 on Monday. The clerk initialled the entry."), { type: "text/plain" });
  const a1 = await kit.acquire(own.auth, { locator: "https://group.example/files/register.txt", project });
  console.log("ACQ1", a1.status, J(a1.body, 700));
  kit.serve("register.txt", kit.te("The register logs the amendment as number 4472 on Tuesday. The deputy clerk initialled the entry."), { type: "text/plain" });
  const a2 = await kit.acquire(own.auth, { locator: "https://group.example/files/register.txt", project });
  console.log("ACQ2", a2.status, J(a2.body, 700));
  kit.serve("pic.png", pngOf(64, 48, 3), { type: "image/png" });
  const p1 = await kit.acquire(own.auth, { locator: "https://group.example/files/pic.png", project });
  console.log("PIC", p1.status, J(p1.body, 500));
  const held = await kit.get(own.auth, { op: "heldcaptures", project, limit: "50" });
  console.log("HELD", J(R(held), 1200));
} catch (x) { console.log("ERR", x.stack.slice(0, 1500)); }
await kit.mf.dispose();

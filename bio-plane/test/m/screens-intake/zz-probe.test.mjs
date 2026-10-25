import { test } from "node:test";
import { openWorld, members, text, fill, press, main } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { DOCUMENT_STUB } from "./page.mjs";
const FILLED = { "ci-how-made": true, "ci-where": "6012 Seminary Ave", "ci-what": "The pothole." };
test("probe", async () => {
  const t = await members({ mai: ["contribute","create_projects"] });
  for (const [k, f] of Object.entries({ note: new File(["a note about the garage. It is old."], "note.txt", { type: "text/plain" }), jpg: new File([new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,255,217])], "Seminary Ave.jpg", { type: "image/jpeg" }), blank: new File(["   \n"], "blank.txt", { type: "text/plain" }) })) {
    const p = await openWorld("/app/capture/file", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
    fill(p, { "ci-file": f, ...FILLED });
    await press(p, "captureupload");
    console.log("PROBE", k, p.requests.map(r=>r.op).slice(14).join(","), "|", Array.from(main(p).querySelectorAll('[role="status"]')).map(e=>e.textContent).join(" // ").slice(0,600));
    await t.world.tick(5000); for (let i=0;i<10;i++) await p.settle(50);
    console.log("PROBE2", k, p.requests.map(r=>r.op).slice(14).join(","), "|", Array.from(main(p).querySelectorAll('[role="status"]')).map(e=>e.textContent).join(" // ").slice(0,600));
  }
});

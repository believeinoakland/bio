/* The harness's broken-stub mode (plan E3; capture `g27-reset.probe.mjs`): the door's first call on the first stub throws `{remote:true}`
 * and that stub stays broken; the door takes a fresh stub and tries once more, so the reading is owed and read. Expect: stubs 2, faults >= 1, died false.
 *   node fault.probe.mjs */
import { shapeRun, capFor, textDoc, report } from "./harness.mjs";
const r = await shapeRun({ doc: textDoc(1_000_060), fault: { remote: true }, search: ["ENDMARKER"] }, { capMB: capFor(1) });
console.log(report("fault: broken stub", r));
const ok = !r.died && r.fed.door.stubs === 2 && r.fed.door.threw >= 1 && r.done.found.ENDMARKER === 1;
console.log(`fault mode holds: ${ok}`);
process.exit(ok ? 0 : 1);

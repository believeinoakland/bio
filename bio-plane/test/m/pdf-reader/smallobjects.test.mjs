/* pdf-reader: requirement-named tests for the object table of a file of many small objects (build/requirements/pdf-reader.md
 * R37 `objects()`, R30 `openPdf`, R41 the bounded reading; fix round 5, E2; the reading of a large PDF starves the object), at the
 * module's interface.
 *
 * The files are doc-clean R4's worst case, as many small objects as fit in 16 MiB (about 130,000-148,000, smallobjects.mjs):
 * annotations with a rect, a number and a string, and a structure tree of elements that name their parent, page and children.
 * Each is read in a process of its own (memory-child.mjs) with the V8 heap held to the idle process plus 94 MB, so the heap and
 * the 15.6 MiB of the file's bytes beside it are held under 110 MB, the object's 128 less the 20 MB the plane's baseline takes
 * (K4530). A read that needs more dies in the heap, as it does in the object. `doc-clean` R4 measures the same file as a
 * resident set under workerd; `workerd-index.probe.mjs` reads it with `reading-pipeline.read` (a module after this one in the order,
 * so not a test of this module's). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { smallObjectsPdf, TEXT_LINE } from "./smallobjects.mjs";
import { openPdf } from "../../../src/pdfstructure.mjs";
import { doc } from "./pdf.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./memory-child.mjs");
const WORK = mkdtempSync(join(tmpdir(), "pdf-reader-e2-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* scratch only */ } });
const ROOM = 94;
/* what `objects()` answered for these files before the table was rebuilt (the tranche's reader, digested by memory-child.mjs) */
const SHAPES = {
  annots: { objects: 130559, digest: "f62c5b9337dc78d39833de9f4024f12441aea8ffda5d16e9d9975c4edbb1f762" },
  tagged: { objects: 147888, digest: "2700c29019d6bfd336d2320eb078e8ccffa6533a68854f334460cdb915dfb236" },
};
const ANSWER = "67babe797dc0135f9c510cbcb00dc98cf13ce6d6a5e49a7c8f8f3e38d2a36f37"; // extractPdfStructure's, either file

function child(args, nodeArgs = []) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [...nodeArgs, CHILD, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}
async function capped(mode, file) {
  const idle = await child(["idle", file], ["--expose-gc"]);
  assert.equal(idle.code, 0, idle.err.slice(0, 300));
  const capMB = Math.ceil(JSON.parse(idle.out).baseHeapMB) + ROOM;
  const m = await child([mode, file], ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"]);
  return { capMB, m, ok: m.code === 0 };
}
const files = {};
for (const shape of Object.keys(SHAPES)) {
  const bytes = smallObjectsPdf(shape);
  assert.ok(bytes.length > 15 * 1048576 && bytes.length < 16 * 1048576, `${shape}: ${bytes.length}`);
  files[shape] = join(WORK, `${shape}.pdf`);
  writeFileSync(files[shape], bytes);
}

for (const shape of Object.keys(SHAPES)) {
  test(`R37 R30: openPdf and objects() of a 16 MiB file of ${shape} small objects hold under 110 MB with the file, and the answer is unchanged`, { timeout: 600_000 }, async () => {
    const { capMB, m, ok } = await capped("objects", files[shape]);
    assert.ok(ok, `open and objects() did not complete in a ${capMB} MB heap beside the file (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
    assert.equal(JSON.parse(m.out).objects, SHAPES[shape].objects);
    const d = await child(["objdigest", files[shape]]);
    assert.equal(d.code, 0, d.err.slice(0, 300));
    assert.deepEqual(JSON.parse(d.out), SHAPES[shape], `${shape}: objects() is not what it was`);
  });

  test(`R41: the reading of the same ${shape} file (extractPdfStructure) holds under 110 MB with the file, and its answer is unchanged`, { timeout: 600_000 }, async () => {
    const { capMB, m, ok } = await capped("measure", files[shape]);
    assert.ok(ok, `the reading did not complete in a ${capMB} MB heap beside the file (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
    assert.equal(JSON.parse(m.out).ok, true);
    const d = await child(["digest", files[shape]]);
    assert.equal(JSON.parse(d.out).digest, ANSWER);
  });
}

test("R37: a name that is an Object.prototype key is an ordinary key of a dictionary, and a name value is one shared, unchanging object", async () => {
  const d = await openPdf(doc([{ content: TEXT_LINE }], { catalog: "/Probe 80 0 R",
    objs: { 80: "<< /constructor 1 /__proto__ 2 /toString 3 /hasOwnProperty 4 /Type /Probe /Alt /Probe >>" } }));
  const map = d.resolve({ t: "ref", n: 80 }).map;
  assert.deepEqual(Object.keys(map), ["constructor", "__proto__", "toString", "hasOwnProperty", "Type", "Alt"]);
  assert.equal(map.constructor, 1);
  assert.equal(map["__proto__"], 2);
  assert.equal(map.toString, 3);
  assert.equal("valueOf" in map, false, "no inherited key");
  assert.deepEqual(map.Type, { t: "name", v: "Probe" });
  assert.equal(map.Type, map.Alt, "one object for one name");
  assert.throws(() => { "use strict"; map.Type.v = "Other"; }, TypeError);
  const e = d.objects();
  assert.equal(e.objects.find((o) => o.num === 80).value.map.Type.v, "Probe");
});

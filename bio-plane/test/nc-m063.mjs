/* NEGATIVE-CONTROL DRIVER — M0-63 / D-384 ENACTED.  `cd bio-plane && node test/nc-m063.mjs`
 *
 * FIVE arms, each armed ALONE, every file restored from a PRISTINE copy named uniquely per arm
 * and verified by sha256 AND by `cmp`, with a byte floor so a restore over an empty file cannot
 * read as byte-identical. Every patch asserts it ARMED — each part must match EXACTLY ONCE, and
 * the driver throws BEFORE writing if one does not. A BASELINE is taken first and again at the
 * close. It is M0-40's driver (`test/nc-m040.mjs`) in shape, and it is not part of the battery.
 *
 * The subject is `bio-plane/test/derivation-bounds.test.mjs`. Three arms patch the SUITE (the
 * classifier and its pins — the correction lives in the instrument, so the controls must reach
 * it) and two patch `src/store.mjs` (the subject the admissions and the departures are about).
 * NO FILE IS LEFT MOVED: the closing check is a digest against the opening pristine copy. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, rmSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const STORE = new URL("../src/store.mjs", import.meta.url).pathname;
const SUITE = new URL("./derivation-bounds.test.mjs", import.meta.url).pathname;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const BYTES_FLOOR = { [STORE]: 1_000_000, [SUITE]: 40_000 };

const run = () => {
  let out;
  try { out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const tally = /(\d+) pass, (\d+) fail/.exec(out);
  const corpus = /(\d+) in the class \((\d+) by the walk/.exec(out);
  const fails = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1].slice(0, 110));
  /* A missing tally is reported as -1 and never as 0: a crash goes through no assertion at all. */
  return { pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           classAll: corpus ? +corpus[1] : -1, walk: corpus ? +corpus[2] : -1, fails, out };
};
const report = (label, r) => {
  console.log(`    ${label}: ${r.pass} pass / ${r.fail} fail · class ${r.classAll} (walk ${r.walk})`);
  for (const f of r.fails) console.log(`      FAIL ${f}`);
  return r;
};

const ARMS = [
  { n: 1, file: SUITE,
    parts: [["  const perRowScan = sc.filter((s) => inBody(s.from)).length;",
             "  const perRowScan = sc.filter((s) => inLoop(s.from)).length;"]],
    what: "THE HEADER CREDIT RE-ADDED — a scan anywhere in a loop's extent, header included, counts per row",
    declared: "RED, naming the arrivals: the walk returns to 37, the ceiling fires, HOIST-FRAGILE and the "
            + "walk roster name the 23, the admitted ten are named as seen-by-the-walk, and `ncLinearInline` reds" },
  { n: 2, file: SUITE,
    parts: [["   classMembers(`class Z {\\n${NOT_THE_CLASS[0][1]}\\n  end() { return 1; }\\n}`).has(\"ncLinear\")],\n  [false, false]);",
             "   classMembers(`class Z {\\n${NOT_THE_CLASS[0][1]}\\n  end() { return 1; }\\n}`).has(\"ncLinear\")],\n  [true, false]);"]],
    what: "`ncLinearInline` FLIPPED BACK IN — the pin asserting it is in the class again",
    declared: "RED BY NAME on the `ncLinearInline` line, and nothing else" },
  { n: 3, file: SUITE,
    parts: [["  const perRowScan = sc.filter((s) => inBody(s.from)).length;", "  const perRowScan = 0;"]],
    what: "OVER-CORRECTION — every per-row scan dropped, not only the header's",
    declared: "RED: the body and inner-header fixtures and `ncPerRow` fail by name, and the walk falls below 14" },
  { n: 4, file: STORE,
    parts: [["      (this.#refEdgeSevered(r.bundle_id, id, \"cites\") ? severed : confirmed).push(r.bundle_id);",
             "      (false ? severed : confirmed).push(r.bundle_id);"]],
    what: "AN ADMISSION'S AMPLIFICATION REMOVED — `#citesInto` stops reading the citer per row",
    declared: "RED naming `#citesInto` on the admission check: a STAYS member is not held by its old say-so" },
  { n: 5, file: STORE,
    parts: [["      const ms = Date.parse(r.snoozed_until);\n",
             "      const ms = Date.parse(r.snoozed_until);\n      this.#rows(`SELECT 1 AS x FROM queue_state WHERE snoozed_until=?`, r.snoozed_until);\n"]],
    what: "A DEPARTED MEMBER REGAINS A REAL PER-ROW SCAN — `#queueRenotifyWake` reads again per row",
    declared: "RED: it ARRIVES in the walk (15), the ceiling fires, the walk roster names it, and the "
            + "LEAVES-is-out check names it" },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.parts.map(([find, put]) => ({ arm: String(a.n), file: a.file, find, put }))));

const PEN = controlPen("m063");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

console.log("=== M0-63 / D-384 · NEGATIVE CONTROLS ===");
const pristine = {};
for (const f of [STORE, SUITE]) {
  pristine[f] = penPath(f, "nc-m063.pristine");
  copyFileSync(f, pristine[f]);
  console.log(`  pristine ${f.split("/").pop()}: ${statSync(f).size} bytes, ${sha(f).slice(0, 12)}`);
  if (statSync(f).size < BYTES_FLOOR[f]) throw new Error(`FLOOR: ${f} is implausibly small`);
}
const opening = report("BASELINE", run());

for (const arm of ARMS) {
  console.log(`\n  --- ARM (${arm.n}) ${arm.what}\n      DECLARED: ${arm.declared}`);
  const copy = penPath(arm.file, `nc-m063.arm${arm.n}`);
  copyFileSync(arm.file, copy);
  let text = readFileSync(arm.file, "utf8");
  for (const [find, repl] of arm.parts) {
    const hits = text.split(find).length - 1;
    if (hits !== 1) { rmSync(copy); throw new Error(`ARM ${arm.n} DID NOT ARM: a part matched ${hits} times, not once`); }
    text = text.replace(find, () => repl);
  }
  console.log(`      ARMED: ${arm.parts.length} part(s), each matching exactly once`);
  writeFileSync(arm.file, text);
  report(`ARM ${arm.n}`, run());
  copyFileSync(copy, arm.file);
  const ok = sha(arm.file) === sha(copy);
  let same = true;
  try { execFileSync("cmp", [arm.file, copy]); } catch { same = false; }
  console.log(`      restored byte-identically: ${ok && same ? "YES" : "NO"} `
            + `(sha256 ${ok ? "equal" : "DIFFERENT"}, cmp ${same ? "equal" : "DIFFERENT"}, ${statSync(arm.file).size} bytes)`);
  if (!ok || !same || statSync(arm.file).size < BYTES_FLOOR[arm.file]) throw new Error(`ARM ${arm.n}: RESTORE FAILED`);
  rmSync(copy);
}

console.log("");
const closing = report("CLOSING", run());
for (const f of [STORE, SUITE]) {
  const equal = sha(f) === sha(pristine[f]);
  console.log(`  ${f.split("/").pop()} equals its OPENING pristine copy: ${equal ? "YES" : "NO"}`);
  if (!equal) throw new Error(`${f} was left moved`);
  rmSync(pristine[f]);
}
const leftovers = [STORE, SUITE].flatMap((f) => [penPath(f, "nc-m063.pristine"), ...ARMS.map((a) => penPath(f, `nc-m063.arm${a.n}`))])
  .filter((p) => existsSync(p));
console.log(`  copies left behind: ${leftovers.length}`);
const key = (r) => JSON.stringify([r.pass, r.fail, r.classAll, r.walk]);
console.log(`  CLOSING baseline equals OPENING: ${key(opening) === key(closing) ? "YES" : "NO"}`);

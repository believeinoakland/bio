/* NEGATIVE-CONTROL DRIVER — M0-40 / D-384.  `cd bio-plane && node test/nc-m040.mjs`
 *
 * SIX arms, each armed ALONE with every other held open, every file restored from a PRISTINE
 * copy named UNIQUELY PER ARM and verified by sha256 AND by `cmp`, with a byte floor so a
 * restore over an empty file cannot read as byte-identical (two harnesses in this estate have
 * reported exactly that, caught only because a digest read `e3b0c442…`).  Every patch asserts
 * it ARMED — each part must match EXACTLY ONCE — and a BASELINE ROW is taken first and again
 * at the close, because a harness that reports the same thing for six-arms-broken and
 * six-arms-working is distinguished only by its baseline.
 *
 * The named subject is `bio-plane/test/derivation-bounds.test.mjs`'s M0-40 block; two arms
 * patch the SUITE (the classifier) rather than the plane, and that is deliberate — the defect
 * this item measured lives in the instrument, so two of its arms must be able to reach it.
 * NO PLANE SOURCE IS LEFT MOVED: every `store.mjs` arm restores before the next runs, and the
 * closing check is a digest against the opening pristine copy. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, rmSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { controlPen } from "./pen.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const STORE = new URL("../src/store.mjs", import.meta.url).pathname;
const SUITE = new URL("./derivation-bounds.test.mjs", import.meta.url).pathname;
const SIBLINGS = {
  "derivation-bounds": SUITE,
  bounds: new URL("./bounds.test.mjs", import.meta.url).pathname,
  "meaning-bounds": new URL("./meaning-bounds.test.mjs", import.meta.url).pathname,
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const BYTES_FLOOR = { [STORE]: 1_000_000, [SUITE]: 40_000 };

const run = (path) => {
  let out;
  try { out = execFileSync(process.execPath, [path], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const tally = /(\d+) pass, (\d+) fail/.exec(out);
  const fails = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1].slice(0, 96));
  /* A TypeError inside an assertion goes through NO assertion at all and the module ends with
     the tally never printed. A missing tally is reported as -1 and never as 0. */
  return { pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, fails, out };
};
const census = () => {
  const m = /(\d+) scanning UNBOUNDED, (\d+) in the class/.exec(run(SUITE).out);
  return m ? `${m[2]} in the class / ${m[1]} scanning` : "UNREADABLE";
};
const measure = (label) => {
  const r = Object.fromEntries(Object.entries(SIBLINGS).map(([n, p]) => { const x = run(p); return [n, `${x.pass}/${x.fail}`]; }));
  const d = run(SUITE);
  console.log(`  ${label.padEnd(10)} derivation-bounds ${r["derivation-bounds"]} · bounds ${r.bounds} `
            + `· meaning-bounds ${r["meaning-bounds"]} · ${census()}`);
  if (d.fails.length) for (const f of d.fails) console.log(`      FAIL: ${f}`);
  return { ...r, fails: d.fails };
};

/* ---- the patches. Each is a list of [find, replace] parts; EVERY part must match once. */
const ARRIVAL_STABLE = `  ncM040Arrival({ id } = {}) {
    for (const r of this.#rows(\`SELECT a FROM nc_m040_t WHERE id=?\`, id))
      for (const s of this.#rows(\`SELECT b FROM nc_m040_u WHERE a=? LIMIT ?\`, r.a, 10))
        this.sql.exec(\`INSERT INTO nc_m040_p VALUES (?,?)\`, r.a, s.b);
    return { ok: true };
  }
`;
const ARRIVAL_BOUNDED = ARRIVAL_STABLE
  .replace("ncM040Arrival", "ncM040Bounded")
  .replace("SELECT a FROM nc_m040_t WHERE id=?`, id)", "SELECT a FROM nc_m040_t WHERE id=? LIMIT ?`, id, 10)");
const AT_EARNED = "  earnedBasisRegistry(subjectEntity, targetIds = [], contentIds = []) {";
const HOIST = [
  ["    for (const r of this.#rows(\n      `SELECT u.bundle_id AS bundle_id",
   "    const ncHoisted = this.#rows(\n      `SELECT u.bundle_id AS bundle_id"],
  /* CORRECTED 2026-09-23 by D-443: the statement's arguments are now ONE json_each value bound twice, on a
     line of their own, so the anchor moved with them. The hoist it reconstructs is unchanged. */
  ["      JSON.stringify(ids), JSON.stringify(ids))) {",
   "      JSON.stringify(ids), JSON.stringify(ids));\n    for (const r of ncHoisted) {"],
];

const ARMS = [
  { n: 1, file: STORE, parts: HOIST,
    what: "THE ARM THE ROW EXISTS FOR — REC-88's hoist reconstructed on the REAL `earnedBasisRegistry`",
    declared: "the method LEAVES the class; the FLOOR, the by-name CLASS roster, the roster/count identity, "
            + "the HOIST-FRAGILE roster and the worked-example pin all fail, and the failure NAMES the method" },
  { n: 2, file: STORE, parts: [...HOIST, [AT_EARNED, ARRIVAL_STABLE + AT_EARNED]],
    what: "THE ARM THAT EARNS THE BY-NAME ROSTER ITS PLACE — the same hoist, PLUS a new member arriving, "
        + "so the COUNT does not move at all",
    declared: "CLASS.size stays 35, so the CEILING and the FLOOR are BOTH GREEN and REC-88's own failure "
            + "mode is reproduced with the count neutralised; ONLY the by-name arms fail" },
  { n: 3, file: SUITE, parts: [["      if (!/^this\\.#rows\\(/.test(iterable)) continue;",
                                "      if (true) continue;"]],
    what: "NEUTER THE HOIST TRANSFORM — it recognises no inline row source at all",
    declared: "both rosters go EMPTY and the worked-example pin fails; the PARTITION arm stays green over "
            + "an all-unreached partition, which is exactly why the rosters are pinned by name beside it" },
  { n: 4, file: STORE, parts: [[AT_EARNED, ARRIVAL_BOUNDED + AT_EARNED]],
    what: "OVER-STRICTNESS — a BOUNDED row source written inline in a for-header, with real nested loops "
        + "and a write in its body",
    declared: "NOTHING may fail. It is correct work in the spelling the classifier is sensitive to, and a "
            + "roster that enrolled it would be tighter than its rule" },
  { n: 5, file: STORE, parts: [[AT_EARNED, ARRIVAL_STABLE + AT_EARNED]],
    what: "OVER-STRICTNESS, THE OTHER DIRECTION — the same arrival with its row source UNBOUNDED, so it "
        + "genuinely joins the class with amplification its BODY carries",
    declared: "it must land in HOIST-STABLE and NOT in HOIST-FRAGILE; the CEILING and the by-name class "
            + "roster fail naming the arrival, and the HOIST-FRAGILE roster stays GREEN" },
  { n: 6, file: SUITE, parts: [["      out.push({ from: m.index, to: loopBodyEnd(body, end) });",
                                "      out.push({ from: end, to: loopBodyEnd(body, end) });"]],
    what: "THE CORRECTION D-384 PRICES — the header credit removed, so a scan that is the loop's own row "
        + "source is no longer counted as a scan PER ROW",
    declared: "the roster collapses to 14 and the pinned `ncLinearInline` contradiction goes RED. This is "
            + "the arm that proves D-384 cannot be closed silently in either direction" },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.parts.map(([find, put]) => ({ arm: String(a.n), file: a.file, find, put }))));

const PEN = controlPen("m040");
/* M0-182: a pristine copy is named for its subject's BASENAME inside the pen, never beside the subject. */
const penPath = (f, suffix) => `${PEN}/${f.split("/").pop()}.${suffix}`;

console.log("=== M0-40 / D-384 · NEGATIVE CONTROLS ===");
const pristine = {};
for (const f of [STORE, SUITE]) {
  pristine[f] = penPath(f, "nc-m040.pristine");
  copyFileSync(f, pristine[f]);
  console.log(`  pristine ${f.split("/").pop()}: ${statSync(f).size} bytes, ${sha(f).slice(0, 12)}`);
  if (statSync(f).size < BYTES_FLOOR[f]) throw new Error(`FLOOR: ${f} is implausibly small`);
}
const opening = measure("BASELINE");

for (const arm of ARMS) {
  console.log(`\n  --- ARM (${arm.n}) ${arm.what}\n      DECLARED: ${arm.declared}`);
  const copy = penPath(arm.file, `nc-m040.arm${arm.n}`);
  copyFileSync(arm.file, copy);
  let text = readFileSync(arm.file, "utf8");
  for (const [find, repl] of arm.parts) {
    const hits = text.split(find).length - 1;
    if (hits !== 1) throw new Error(`ARM ${arm.n} DID NOT ARM: a part matched ${hits} times, not once`);
    text = text.replace(find, repl);
  }
  console.log(`      ARMED: ${arm.parts.length} part(s), each matching exactly once`);
  writeFileSync(arm.file, text);
  measure(`ARM ${arm.n}`);
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
const closing = measure("CLOSING");
for (const f of [STORE, SUITE]) {
  const equal = sha(f) === sha(pristine[f]);
  console.log(`  ${f.split("/").pop()} equals its OPENING pristine copy: ${equal ? "YES" : "NO"}`);
  if (!equal) throw new Error(`${f} was left moved`);
  rmSync(pristine[f]);
}
const leftovers = [STORE, SUITE].flatMap((f) => [penPath(f, "nc-m040.pristine"), ...ARMS.map((a) => penPath(f, `nc-m040.arm${a.n}`))])
  .filter((p) => existsSync(p));
console.log(`  copies left behind: ${leftovers.length}`);
console.log(`  CLOSING baseline equals OPENING: `
          + `${JSON.stringify(Object.fromEntries(Object.entries(opening).filter(([k]) => k !== "fails")))
             === JSON.stringify(Object.fromEntries(Object.entries(closing).filter(([k]) => k !== "fails"))) ? "YES" : "NO"}`);

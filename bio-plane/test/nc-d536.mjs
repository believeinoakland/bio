#!/usr/bin/env node
/* nc-d536.mjs — the NEGATIVE CONTROL for `d536-reading-provenance.test.mjs` (D-536).
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs, and the battery must not discover
 * it (nc-cpdf19's precedent, whose discipline and harness this copies).
 *
 *   node test/nc-d536.mjs            # every arm, in order
 *   node test/nc-d536.mjs nodigest   # one arm (plus the baseline)
 *
 * DISCIPLINE: every arm is armed ALONE; a patch must match EXACTLY ONCE or the arm is NOT ARMED and
 * nothing runs; the restore is `copyFileSync` from a UNIQUELY-NAMED per-arm pristine copy held OUTSIDE
 * the worktree (BOB #32, 2026-09-24: a scratch file inside the worktree is walked by repository suites),
 * verified by sha256 AND by byte comparison with the byte count printed and floored; the result is read
 * from the suite's OWN foot line, and a run with no foot is -1/-1.
 *
 * DECLARED BEFORE ARMING — what MUST fail and what MUST NOT, by label:
 *   baseline    nothing armed; MUST be green — the row that tells all-broken from all-working.
 *   nodigest    THE ROW'S OWN CONTROL: "drop the text digest" — `readingProvenance` records no SHA-256,
 *               whole or per page. The ATTRIBUTION arm (section 4) MUST FAIL BY NAME, and so must the
 *               digest arms; the UNDETERMINED arm for a pre-D-536 reading MUST NOT.
 *   nochain     a page's tier is no longer read off the chain; the section-0 chain arm MUST FAIL; the
 *               through-the-op attributions MUST NOT (their pages carry the tier by the fall-backs).
 *   overwrite   `#keepReading` no longer keeps the reading a pre-D-536 capture held before replacing it;
 *               the KEPT-FIRST arm MUST FAIL; the re-read attributions MUST NOT.
 *   inferred    a reading with no provenance gets one INFERRED from its `text_tier`; the UNDETERMINED
 *               arms MUST FAIL.
 *   nodedupe    THE OVER-STRICTNESS DIRECTION: the same reading promoted twice is kept twice; the
 *               "NOT kept twice" arm MUST FAIL, every attribution arm MUST NOT.
 *   nopurge     `reading_history` leaves the purge list; the purge arm MUST FAIL.
 *
 * RESULTS — RUN 2026-09-24 by D-536's worker on the tree this suite landed on (from the run's printout):
 *   7 arms, 0 NOT AS DECLARED — baseline 60/0 · nodigest 51/9 (the attribution arm BY NAME, the four
 *   digest arms, the cross-tier attribution and its stored copy, and the two arms that rest on a digest
 *   differing or agreeing; the UNDETERMINED arm stayed green) · nochain 57/3 (the chain arm, and the two
 *   arms that name the tier-3 ENGINE, which only the chain carries — the through-the-op attributions stayed
 *   green) · overwrite 56/4 (kept-first, and the three arms reading that kept row) · inferred 58/2 (both
 *   UNDETERMINED arms) · nodedupe 59/1 (exactly "NOT kept twice") · nopurge 59/1 (exactly the purge arm).
 *   Every restore byte-identical by sha256 AND by byte comparison (readingprov.mjs 12,804 B sha256
 *   c398c899…, store.mjs 3,328,563 B sha256 25f42566…).
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { anchorTable } from "../scripts/anchortable.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOLD = join(process.env.NC_HOLD || tmpdir(), `nc-d536-pristine-${process.pid}`);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const PROV = join(ROOT, "src/readingprov.mjs");
const STORE = join(ROOT, "src/store.mjs");

const ATTRIB = "ATTRIBUTED: the tier, the member and the page";
const UNDET = "the pre-D-536 reading's provenance reads UNDETERMINED";
const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [ATTRIB, UNDET] },
  nodigest: {
    patches: [[PROV, "  out.text_sha256 = flat.text.length ? await sha256Hex(flat.text) : null;\n", "  out.text_sha256 = null;\n"],
              [PROV, "chars: pt.length, text_sha256: pt.length ? await sha256Hex(pt) : null };", "chars: pt.length, text_sha256: null };"]],
    mustFail: [ATTRIB, "the document digest is the SHA-256 of the text the reader was handed", "the page digest agrees"],
    mustPass: [UNDET],
  },
  nochain: {
    patches: [[PROV, "function chainTiersOf(chain, page) {\n  if (!Array.isArray(chain)) return [];", "function chainTiersOf(chain, page) {\n  return [];"]],
    mustFail: ["each page's tier is read off the CHAIN"],
    mustPass: [ATTRIB, "the re-read's answer carries its ATTRIBUTION"],
  },
  overwrite: {
    patches: [[STORE, "    if (!last) {\n      const prior = this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha);",
                      "    if (false) {\n      const prior = this.#one(`SELECT bundle_id, reading FROM readings WHERE capture_sha=?`, sha);"]],
    mustFail: ["the reading it replaced was KEPT FIRST"],
    mustPass: [ATTRIB, "the re-read's answer carries its ATTRIBUTION"],
  },
  inferred: {
    patches: [[STORE, "&& r.provenance.scheme === PROVENANCE_SCHEME ? r.provenance : null);",
                      "&& r.provenance.scheme === PROVENANCE_SCHEME ? r.provenance : (r && typeof r === \"object\" ? { scheme: PROVENANCE_SCHEME, text_tier: r.text_tier ?? null, text_sha256: null, pages: null, producers: [] } : null));"]],
    mustFail: [UNDET, "the comparison says the difference cannot be attributed"],
    mustPass: [ATTRIB],
  },
  nodedupe: {
    patches: [[STORE, "    if (last && last.reading_sha256 === digest) return { seq: last.seq, added: false, compared: null };\n", ""]],
    mustFail: ["and the same reading is NOT kept twice"],
    mustPass: [ATTRIB, "the re-read's answer carries its ATTRIBUTION"],
  },
  nopurge: {
    patches: [[STORE, "                    \"reading_history\",\n", ""]],
    mustFail: ["exactly the purged document's kept readings are gone"],
    mustPass: [ATTRIB],
  },
};
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file, find, put }))));

function runSuite() {
  const r = spawnSync(process.execPath, ["test/d536-reading-provenance.test.mjs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
  const out = (r.stdout || "") + (r.stderr || "");
  const foot = out.match(/d536: (\d+) passed, (\d+) failed\s*$/m);
  const fails = [...out.matchAll(/^\s+FAIL\s+(.*)$/gm)].map((m) => m[1]);
  const passes = [...out.matchAll(/^\s+PASS\s+(.*)$/gm)].map((m) => m[1]);
  return { pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, fails, passes,
           foot: !!foot && !/SUITE ENDED BEFORE ITS OWN FOOT/.test(out), exit: r.status };
}

const only = process.argv[2];
const order = only ? ["baseline", only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`unknown arm ${only}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
mkdirSync(HOLD, { recursive: true });
const report = [];
let wrong = 0;
for (const name of order) {
  const arm = ARMS[name];
  const files = [...new Set(arm.patches.map((p) => p[0]))];
  const kept = files.map((f) => {
    const copy = join(HOLD, `${name}.${f.split("/").pop()}.pristine`);
    copyFileSync(f, copy);
    return { f, copy, digest: sha(readFileSync(f)), bytes: statSync(f).size };
  });
  let armed = true;
  for (const [f, from, to] of arm.patches) {
    const src = readFileSync(f, "utf8");
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${name}: patch matched ${n} times in ${f} — NOT ARMED`); break; }
    writeFileSync(f, src.replace(from, to));
  }
  const res = armed ? runSuite() : null;
  /* RESTORE, and it is only believed when measured. */
  for (const k of kept) {
    copyFileSync(k.copy, k.f);
    const back = readFileSync(k.f), orig = readFileSync(k.copy);
    const same = sha(back) === k.digest && Buffer.compare(back, orig) === 0 && back.length === k.bytes;
    console.log(`  restore ${k.f.split("/").slice(-2).join("/")}: ${back.length} B sha256 ${sha(back).slice(0, 12)}… `
              + `restored byte-identically: ${same ? "YES" : "NO"}`);
    if (!same || back.length < 5000) { console.error("RESTORE FAILED — stop and repair by hand"); process.exit(3); }
    rmSync(k.copy);
  }
  if (!res) { report.push(`${name}: NOT ARMED`); wrong++; continue; }
  const failedAll = (label) => res.fails.some((f) => f.includes(label));
  const passedAll = (label) => res.passes.some((p) => p.includes(label));
  const missFail = arm.mustFail.filter((l) => !failedAll(l));
  const missPass = arm.mustPass.filter((l) => !passedAll(l));
  const asDeclared = res.foot && missFail.length === 0 && missPass.length === 0
                   && (name === "baseline" ? res.fail === 0 : res.fail > 0);
  if (!asDeclared) wrong++;
  const line = `${name}: ${res.pass}/${res.fail}${res.foot ? "" : " (NO FOOT)"} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
             + (missFail.length ? ` · did NOT fail: ${missFail.join(" | ")}` : "")
             + (missPass.length ? ` · did NOT pass: ${missPass.join(" | ")}` : "");
  console.log(line);
  if (res.fails.length && name !== "baseline") console.log(`    failed: ${res.fails.join(" | ")}`);
  report.push(line);
}
rmSync(HOLD, { recursive: true, force: true });
console.log(`\nnc-d536: ${order.length} arm(s) run, ${wrong} not as declared\n  ${report.join("\n  ")}`);
process.exit(wrong ? 1 : 0);

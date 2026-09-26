/* mint-ledger.control.mjs — the NEGATIVE CONTROL for `test/mint-ledger.test.mjs` (D-432, Membership v2 §7: an id
 * that has existed is never drawn again, purge or not). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/mint-ledger.control.mjs            every arm
 *   node test/mint-ledger.control.mjs <arm>      one arm
 *
 * `opaque-ids.control.mjs`'s method exactly: each arm copies `src/` (and `checks/`, `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that did
 * not arm is a finding, not a pass), and runs the suite with MINT_LEDGER_SRC pointed at the copy. The suite then cuts
 * its own build under test from that copy (the forced draw) and its LEGACY build from the REAL sources, so an arm
 * changes the build under test and never the build it is upgraded from. The real `src/index.mjs`, `src/store.mjs` and
 * `src/schema.mjs` are hashed (sha256 and byte length) before the first arm and after the last; the run fails if any
 * moved. What each arm MUST fail (by label fragment) is DECLARED before it arms; every other assertion MUST stay green.
 *
 * M0-147 added the CLOCK arms: `pin` runs the suite under `test/clockpin.preload.mjs` (node's clock frozen 1 ms before
 * the New Year that began the plane's year), and `suite` patches a COPY of the suite, run from the copy's own `test/`
 * beside links to the real one's helpers. The suite itself is hashed with the sources, before and after.
 *
 * RESULTS: see the header of `test/mint-ledger.test.mjs` and IC-170.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, mkdirSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "mint-ledger.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "test/mint-ledger.test.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const READ = "    const spent = (id) => !!this.#one(`SELECT 1 FROM minted_ids WHERE id=?`, id) || taken(id);";
const WRITE = "      this.sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'mint')`, id, new Date().toISOString());";
const AFTER_PURGE = ["F4 PROJ", "F5 CASE", "F6 DRAFT", "F7 RVG", "F8 TASK"];
const SEEDED = ["U3 PROJ", "U4 DRAFT", "U5 RVG", "U6 TASK"];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: the ledger dropped from the minter's `taken` — the table still exists, is still exempt and is
     still WRITTEN, which is exactly the liar the row names. The source pin loses its only read, and every forced
     collision after a purge fails by name — the seeded ones too. The rollback arm stays green (nothing reads at all).
     THIS ARM CAME BACK NOT AS DECLARED ON ITS FIRST RUN (11/2), AND THE SUITE WAS WRONG, NOT THE ARM. The declaration
     expected the purged id to be REISSUED; it was not. The minter's write is a plain INSERT into a PRIMARY KEY, so with
     the read gone the redrawn id reached the INSERT and SQLite refused it (SQLITE_CONSTRAINT_PRIMARYKEY) inside the
     act — the project mint threw, and the suite died at its fixture instead of failing at F4. So the ledger is two
     defences, not one: the READ refuses a spent id and draws again; the KEY makes a missing read fail LOUDLY rather
     than hand the id out. The suite was corrected to report a thrown act at its own assertion (`tryProject`, and a
     project under a NEW name carrying the case, the draft and the grant, so no PROJ outcome decides theirs). Under this
     arm F7 still fails partly by CASCADE — its draft is DRAFT's forced collision too, and throws — so F7's independent
     evidence is `no-ledger-write`, where the draft is reissued and the grant's own draw is what fails. */
  "no-ledger-read": {
    patches: [["store.mjs", READ, "    const spent = (id) => taken(id);"]],
    mustFail: ["S2:", ...AFTER_PURGE, "F9 PROJ", ...SEEDED, "U7 CASE"],
  },

  /* The write removed: nothing the minter hands out is remembered. Section 2's store booted empty, so its ledger stays
     empty and every purge arm REISSUES — the SILENT form of the defect, each purged id handed out again with nothing
     refusing it, which is exactly what REC-151's minter did. Section 3's ids were SEEDED at boot and stay refused: the
     seed is a second, independent writer, which is what this arm separates. */
  "no-ledger-write": {
    patches: [["store.mjs", WRITE, "      /* armed: the ledger write removed */"]],
    mustFail: [...AFTER_PURGE, "F9 PROJ"],
  },

  /* The ledger cleared by purge's whole-store arm — the obvious "derived table" reflex CLAUDE.md §7 would apply. The
     single-bundle arm does not reach it, so F9 stays green; the seeded ids are wiped by section 3's whole-store purge;
     and the source pin sees a statement that is neither a point read nor an insert. */
  "ledger-purged": {
    patches: [["store.mjs", "        this.sql.exec(`DELETE FROM bundles`);",
               "        this.sql.exec(`DELETE FROM minted_ids`);\n        this.sql.exec(`DELETE FROM bundles`);"]],
    mustFail: ["S4:", ...AFTER_PURGE, ...SEEDED, "U7 CASE"],
  },

  /* THE LIAR (b): the write taken OUT of the calling act's transaction — deferred to a microtask, so it lands after the
     act has committed OR ROLLED BACK. Every purge arm stays green, because the id is still remembered; only the review
     copy's dry run can see it, whose rolled-back case id is now spent. */
  "outside-the-transaction": {
    patches: [["store.mjs", WRITE,
               "      queueMicrotask(() => this.sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'mint')`, id, new Date().toISOString()));"]],
    mustFail: ["F2:"],
  },

  /* The boot seed removed: every id that existed before the ledger did stays as reissuable as it was. */
  "no-seed": {
    patches: [["store.mjs", "    this.#seedMintLedger();", "    /* armed: no seed */"]],
    mustFail: [...SEEDED, "U7 CASE"],
  },

  /* Each half of the seed alone: the COUNTER half is the only thing that refuses an id the counter issued and no object
     ever used; the LIVE half the only thing that refuses one a pre-ledger build minted. */
  "no-counter-seed": {
    patches: [["store.mjs", "    this.sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)\n                   WITH RECURSIVE",
               "    if (false) this.sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)\n                   WITH RECURSIVE"]],
    mustFail: ["U7 CASE"],
  },
  "no-live-seed": {
    patches: [["store.mjs", "    for (const [prefix, table, column] of Store.#MINT_LEDGER_LIVE)",
               "    for (const [prefix, table, column] of [])"]],
    mustFail: SEEDED,
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: the point lookup in a spelling the source pin did not anticipate (a column in
     place of the constant, spaces round the operator). Correct work — nothing may fail. */
  "lookup-other-spelling": {
    patches: [["store.mjs", "SELECT 1 FROM minted_ids WHERE id=?", "SELECT id FROM minted_ids WHERE id = ?"]],
    mustFail: [],
  },

  /* M0-147 — THE SUITE MUST NOT READ THE YEAR OFF ITS OWN CLOCK. `pin` runs the suite under `test/clockpin.preload.mjs`
     frozen 1 ms before the New Year that BEGAN the plane's current year (the plane's workerd keeps the true wall), so the
     suite's clock reads the year before and every id the plane mints carries the year after: a run that straddled
     midnight UTC on 31 December, reproduced without touching the machine's clock. `suite` patches a COPY of the suite. */
  "clock-pinned": { pin: true, patches: [], mustFail: [] },
  /* THE ROW'S CONTROL: the clock read RESTORED, under the pin. F2 fails BY NAME (the plane minted CASE-<its year>-7316, the suite expected the year before). U1 and U7 stay
     green: `op=allocid` takes the suite's year, so the counter ids carry it and U7's forced draw (the plane's year) cannot
     collide with them — U7 passes VACUOUSLY under this arm, which is the silent half of the defect and why the arm names
     only F2. */
  "clock-read-restored": { pin: true, patches: [],
    suite: [["  YEAR = yearOf(P1);\n", "  YEAR = new Date().toISOString().slice(0, 4);\n"]],
    mustFail: ["F2: THE ROLLBACK"] },
  /* BREAK ONLY THE THING: the same restored read WITHOUT the pin — on any day but a straddle the suite's clock and the
     plane's agree, so nothing may fail. The arm above fails because of the pin, not because of the edit. */
  "clock-read-restored-no-pin": { pin: false, patches: [],
    suite: [["  YEAR = yearOf(P1);\n", "  YEAR = new Date().toISOString().slice(0, 4);\n"]], mustFail: [] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `mint-ledger-control-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    /* A patched SUITE runs from the copy's own `test/`, beside a link to each helper it imports by `./` (a link resolves to
       the real file, so the helpers' own imports resolve in place — no directory is walked), with `node_modules/` and
       `scripts/` linked, so its relative imports and its `../src` resolve as they do in place. */
    let suite = SUITE;
    if (arm.suite) {
      const dir = join(tree, "bio-plane", "test");
      mkdirSync(dir, { recursive: true });
      let s = readFileSync(SUITE, "utf8");
      for (const m of s.matchAll(/(?:from|import) "\.\/([^"/]+)"/g)) symlinkSync(join(PLANE, "test", m[1]), join(dir, m[1]));
      for (const f of ["node_modules", "scripts", "package.json"]) symlinkSync(join(PLANE, f), join(tree, "bio-plane", f));
      for (const [from, to] of arm.suite) {
        const n = s.split(from).length - 1;
        if (n !== 1) return { name, armed: false, why: `anchor in the suite occurs ${n} times: ${from.slice(0, 70)}` };
        s = s.replace(from, () => to);
      }
      suite = join(dir, "mint-ledger.test.mjs");
      writeFileSync(suite, s);
    }
    const pin = arm.pin ? ["--import", join(PLANE, "test", "clockpin.preload.mjs")] : [];
    const pinEnv = arm.pin ? { CLOCK_PIN_MS: String(Date.UTC(new Date().getUTCFullYear(), 0, 1) - 1) } : {};
    const r = spawnSync(process.execPath, [...pin, suite], { env: { ...process.env, ...pinEnv, MINT_LEDGER_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /mint-ledger: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);

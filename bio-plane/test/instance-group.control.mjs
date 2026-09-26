/* instance-group.control.mjs — the NEGATIVE CONTROL for `test/instance-group.test.mjs` (D-436 / IC-172: the producing
 * group is ONE recorded value per instance, written once at the store's first boot or by the root of trust's one
 * seed, and no bundle the plane writes names a literal one). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/instance-group.control.mjs            every arm
 *   node test/instance-group.control.mjs <arm>      one arm
 *
 * `mint-ledger.control.mjs`'s method exactly: each arm copies `src/` (and `checks/`, `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that did
 * not arm is a finding, not a pass), and runs the suite with INSTANCE_GROUP_SRC pointed at the copy. A patch naming a
 * bare module edits the copy's `src/`; one naming `checks/…` edits the copy's catalogue, which that plane imports. The
 * real `src/index.mjs`, `src/store.mjs`, `src/schema.mjs`, `src/setup.mjs`, `src/livefire.mjs` and
 * `checks/bio-checks.mjs` are hashed (sha256 and byte length) before the first arm and after the last; the run fails if
 * any moved. What each arm MUST fail (by the assertion's label prefix) is DECLARED below before it arms; every other
 * assertion MUST stay green.
 *
 * RESULTS: the suite's own NEGATIVE CONTROL line carries the figures, all thirteen arms AS DECLARED on the first full
 * run and again after battery pass one's corrections; IC-172 repeats them.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "instance-group.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "src/setup.mjs", "src/livefire.mjs",
              "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const LIT = ["believe", "in", "oakland"].join("-");   /* spelled apart so this driver's own text is not a site */
const READER = "    const r = this.#one(`SELECT slug FROM instance_group WHERE id=1`);\n"
             + "    return r && typeof r.slug === \"string\" && r.slug ? r.slug : null;";
const FIRST_BOOT_CALL = "    if (firstBoot) this.#recordGroupAtFirstBoot();";
const BOOT_WRITE = "VALUES (1, ?, ?, 'bootstrap', NULL) ON CONFLICT(id) DO NOTHING`,";
const STAMP_CALL = "      if (groupStamp) files = Store.#stampGroup(files, groupStamp);";
const TESTIFY_LINE = "      `group: ${group}`, \"references: []\", \"state_history: []\",";
const SEED_HELD = "    if (held)\n      return refusal(\"GROUP_ALREADY_RECORDED\",";
const UNDETERMINED_DEFAULT = "        createdGroup = stated ? stated.trim() : recorded;";
const PURGE_ANCHOR = "        this.sql.exec(`DELETE FROM bundles`);";
/* The catalogue's ONE definition of writing the group (the store's stamp calls it): its two write lines. */
const DEF_REPLACE = "    if (lines[i].startsWith('group:')) { lines[i] = `group: ${slug}`; return lines.join('\\n'); }";
const DEF_OPEN = "  return [...lines.slice(0, end), `group: ${slug}`, ...lines.slice(end)].join('\\n');";
const WITNESS = "    const firstBoot = [...this.sql.exec(`PRAGMA table_info(bundles)`)].length === 0;";

/* Label prefixes, grouped as the suite names them. */
const EVERY_W = ["W1:", "W1b:", "W2:", "W3:", "W4:", "W5:", "W5b:", "W6:", "W7:", "W8:", "W8b:"];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* A LITERAL RESTORED AT A CALL SITE — testify's own `group:` line, the first unconditional stamp the row names.
     DECLARED TO FAIL ONLY THE CENSUS, and that is the design rather than a weakness of the suite: testify's
     document is a CREATION, and `promote` stamps the recorded group over whatever a creation's bytes say — the one
     authority healing a caller-side literal is exactly what makes the member UI's and the setup page's literals
     harmless. So no behavioural assertion can see this arm; S1, the source census, is what does. */
  "literal-at-a-call-site": {
    patches: [["store.mjs", TESTIFY_LINE, `      "group: ${LIT}", "references: []", "state_history: []",`]],
    mustFail: ["S1:"],
  },

  /* THE ROW'S CONTROL — ONE LITERAL RESTORED AT THE AUTHORITY: the one reader every default and every stamp asks
     returns the old literal slug. Every writer then names it, on every store; the reads of the RECORD
     (op=instancegroup, the seed) still read the table, so B1–B3, W9, L1, P1–P7 stay green — which is what separates
     "the value the store holds" from "the value the writers use". R1 (a replay) is exempt from the stamp. W1b fails
     too, and for a reason worth naming: the UI-shaped bytes already carry the literal, so the stamp leaves them
     byte-identical and the caller's own sha is the one registered. */
  "literal-at-the-authority": {
    patches: [["store.mjs", READER, `    return "${LIT}";`]],
    mustFail: ["S1:", "S3:", ...EVERY_W, "L2:", "L3:", "L4:",
               "C1:", "C1b:", "C2:", "C2b:", "C3:", "C4:", "P8:", "P9:"],
  },

  /* THE STAMP REMOVED: the member UI's and the setup page's bytes are then stored as sent — the class the row names,
     arriving through the callers the plane does not compose for. testify still composes its own line (W4, L3 green). */
  "stamp-removed": {
    patches: [["store.mjs", STAMP_CALL, "      /* armed: no stamp */"]],
    mustFail: ["W1:", "W1b:", "W2:", "W5:", "W5b:", "W6:", "W7:", "W8:", "W8b:", "L2:", "P8:"],
  },

  /* THE LIAR THE ROW NAMES: the value RE-READ FROM THE DEPLOY VAR at every write. Every assertion about the first
     install passes — the var still says oak-town — and only the arm that MOVES the var sees it (L2–L4), with the
     structural pin on the reader (S3). The record's own read (L1) still reads the table and stays green. */
  "reread-the-var": {
    patches: [["store.mjs", READER,
               "    const r = { slug: String((this.env && this.env.INSTANCE_NAME) ?? \"\").trim() };\n"
               + "    return r && typeof r.slug === \"string\" && r.slug ? r.slug : null;"]],
    mustFail: ["S3:", "L2:", "L3:", "L4:"],
  },

  /* DECISION (a) ABSENT: the first boot records nothing. The install under a second slug is then a store recording
     no group — every writer that states none is refused, and those that state the literal keep it. W3 stays green:
     its bytes name oak-town themselves, which is kept as the caller's own statement. */
  "no-first-boot-write": {
    patches: [["store.mjs", FIRST_BOOT_CALL, "    /* armed: nothing recorded at the first boot */"]],
    mustFail: ["B1:", "B2:", "B3:", ...EVERY_W.filter((l) => l !== "W3:"), "W9:", "L1:", "L2:", "L3:", "L4:"],
  },

  /* DECISION (b)'s CONTROL: the first-boot GATE removed, so a store that already held the schema adopts the var at
     its next boot. The seed is then refused as already recorded, and the record says `bootstrap`. §3 stays green
     because the write still does nothing on conflict — which is what the next arm separates. */
  "seed-at-every-boot": {
    patches: [["store.mjs", FIRST_BOOT_CALL, "    this.#recordGroupAtFirstBoot();"]],
    mustFail: ["P2:", "P6:", "P7:"],
  },

  /* A LATENT UPSERT: the first-boot write made an UPDATE on conflict. It runs once per store, so NO behaviour can see
     it — declared to fail ONLY S2, the write-once pin, which is the whole reason S2 exists. */
  "upsert-at-first-boot": {
    patches: [["store.mjs", BOOT_WRITE,
               "VALUES (1, ?, ?, 'bootstrap', NULL) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug`,"]],
    mustFail: ["S2:"],
  },

  /* THE SEED'S WRITE-ONCE REFUSAL removed: a second seed then answers ok while the insert quietly does nothing — an
     answer that says a value was recorded when it was not. */
  "seed-accepts-twice": {
    patches: [["store.mjs", SEED_HELD, "    if (false)\n      return refusal(\"GROUP_ALREADY_RECORDED\","]],
    mustFail: ["P7:"],
  },

  /* ONE LITERAL RESTORED IN DECISION (c)'s PATH: recording none, a creation stating none is given the old default
     instead of being refused. The census sees the literal; C2 and C2b see the default. */
  "default-when-undetermined": {
    patches: [["store.mjs", UNDETERMINED_DEFAULT, `        createdGroup = stated ? stated.trim() : (recorded || "${LIT}");`]],
    mustFail: ["S1:", "C2:", "C2b:"],
  },

  /* THE PURGE CLEARS IT — the "derived table" reflex CLAUDE.md §7 would apply. S2 sees the DELETE; W9 sees the value
     gone; and the store, not being fresh, never records one again, so §3's writers are refused. */
  "purge-clears-it": {
    patches: [["store.mjs", PURGE_ANCHOR, "        this.sql.exec(`DELETE FROM instance_group`);\n" + PURGE_ANCHOR]],
    mustFail: ["S2:", "W9:", "L1:", "L2:", "L3:", "L4:"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS, twice: the stamp writes the value QUOTED, and the first-boot witness asks in
     another spelling. Correct work in forms the suite did not anticipate — nothing may fail. */
  "stamp-quoted": {
    patches: [["checks/bio-checks.mjs", DEF_REPLACE,
               "    if (lines[i].startsWith('group:')) { lines[i] = `group: ${JSON.stringify(slug)}`; return lines.join('\\n'); }"],
              ["checks/bio-checks.mjs", DEF_OPEN,
               "  return [...lines.slice(0, end), `group: ${JSON.stringify(slug)}`, ...lines.slice(end)].join('\\n');"]],
    mustFail: [],
  },
  "witness-other-spelling": {
    patches: [["store.mjs", WITNESS, "    const firstBoot = !this.#one(`SELECT name FROM sqlite_master WHERE name = 'bundles' AND type = 'table'`);"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `instance-group-control-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      /* A bare name is a module of src/; "checks/..." is the catalogue the copy's plane imports. */
      const p = file.includes("/") ? join(tree, "bio-plane", file) : join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, INSTANCE_GROUP_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /instance-group: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.startsWith(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.startsWith(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const wanted = process.argv[2];
const names = wanted ? [wanted] : Object.keys(ARMS);
if (wanted && !ARMS[wanted]) { console.error(`unknown arm ${wanted}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
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

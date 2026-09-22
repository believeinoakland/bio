/* group-public.control.mjs — the NEGATIVE CONTROL for `test/group-public.test.mjs` (REC-163 / IC-174: the setup page
 * served at `/` and a PUBLIC op=instancegroup show the recorded slug, or say that none is recorded, and name no other
 * group — `BIO_Publication_v0_1.md` §7 point 1). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/group-public.control.mjs            every arm
 *   node test/group-public.control.mjs <arm>      one arm
 *
 * `instance-group.control.mjs`'s method exactly: each arm copies `src/` (and `checks/`, `docprofile/`) into a
 * uniquely-named temporary tree, applies its patch THERE (asserting each anchor occurs EXACTLY ONCE — an arm that did
 * not arm is a finding, not a pass), and runs the suite with GROUP_PUBLIC_SRC pointed at the copy. The real
 * `src/index.mjs`, `src/store.mjs`, `src/setup.mjs`, `src/signpage.mjs` and `checks/bio-checks.mjs` are hashed (sha256
 * and byte length) before the first arm and after the last; the run fails if any moved. What each arm MUST fail (by the
 * assertion's label prefix) is DECLARED below before it arms; every other assertion MUST stay green.
 *
 * RESULTS: the suite's own NEGATIVE CONTROL line carries the figures; IC-174 repeats them.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "group-public.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/setup.mjs", "src/signpage.mjs", "checks/bio-checks.mjs"]
  .map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* The literal the row removes, spelled apart so this driver's own text is not a site of it. */
const DISPLAY = ["Believe", "in", "Oakland"].join(" ");

/* Anchors, each a line of the subject quoted verbatim. */
const TEMPLATE_LINE = "<main>\n${GROUP_LINE_UNREAD}\n";
const RECORDED_OPEN = "<span class=\"slug\">'";
const RECORDED_TAIL = "</span> &middot; group instance</p>\";";
const NONE_WORDS = "No group is recorded for this copy yet";
const UNREAD_WORDS = "This copy could not read its group just now";
const UNREAD_FALLBACK = "  return GROUP_LINE_UNREAD;\n}";
const PAGE_READ = "      return new Response(setupPage(await publicInstanceGroup(env, \"bio\")),";
const OPS_ROW = "  instancegroup:       { classes: null,                         mutating: false },";
const PUBLIC_SELECT = "    return slug ? { ok: true, group: slug } : { ok: true, group: null, detail: Store.NO_GROUP_RECORDED };";
const PUBLIC_SILENCE = "        if (!pubOut.answered) return storeSilent(\"instancegroup\");";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL — THE LITERAL RESTORED: the template's group line put back as it stood before this item. The
     renderer then finds no line to replace, so every page this plane serves opens with one group's name. Declared to
     fail every PAGE arm that reads the line or the bytes — THE SECOND-SLUG ARM (P2) BY NAME among them — and the
     source census; every op arm stays green, because the op never reads the page. P7 stays green: with no group line
     there is nothing beside a slug to invent. */
  "literal-restored": {
    patches: [["setup.mjs", TEMPLATE_LINE, `<main>\n<p class="eyebrow">${DISPLAY} &middot; group instance</p>\n`]],
    mustFail: ["S1:", "U1:", "P1:", "P1b:", "G3:", "P5:", "P6:", "P2:", "P2b:", "P3:", "P3b:", "P4:", "P4b:"],
  },

  /* THE LIAR THE ROW NAMES: the slug shown AND the old name kept in the page, hidden by CSS — built at run time, so
     the source census (S1) cannot be what catches it. The page READS right: P1 and P2 stay green. Only the arms that
     read the served BYTES see it, which is the whole reason they read bytes. */
  "css-hidden": {
    patches: [["setup.mjs", RECORDED_TAIL,
               "</span><span style='display:none'>\" + [\"Believe\", \"in\", \"Oakland\"].join(\" \") + \"</span> &middot; group instance</p>\";"]],
    mustFail: ["P1b:", "P2b:"],
  },

  /* A PAGE THAT READS NOTHING: served as its template, the unread line and no name. Every "no literal" arm passes
     it, and so does the SILENCE arm (P4) — a page that never reads cannot be told from a store that did not answer —
     which is why P4b pairs it with the same store answering. The op arms stay green. */
  "static-page": {
    patches: [["index.mjs", PAGE_READ, "      return new Response(setupPage(null),"]],
    mustFail: ["P1:", "G3:", "P2:", "P3:", "P3b:", "P4b:"],
  },

  /* A SILENCE CALLED "NONE" ON THE PAGE: the line's fallback for a read it cannot use becomes the none line. Right on
     a store recording nothing, wrong on one that did not answer — and only P4 can tell the two apart. */
  "silence-as-none": {
    patches: [["setup.mjs", UNREAD_FALLBACK,
               "  return '<p class=\"eyebrow\" id=\"instance-group\" data-group=\"none\">No group is recorded for this copy yet</p>';\n}"]],
    mustFail: ["P4:"],
  },

  /* THE PUBLIC CLASS WITHDRAWN: the OPS row back to the three credentialed classes. A stranger is then refused
     NOT_AUTHENTICATED, so every public-op arm fails, and two credentialed ones too — a probe asking for bio is refused
     SCOPE_REFUSED again, and an unrecognised credential NOT_AUTHENTICATED. The page stays green: it reads the record
     through the plane's own helper, not through the op. */
  "op-public-refused": {
    patches: [["index.mjs", OPS_ROW, "  instancegroup:       { classes: [\"admin\", \"member\", \"probe\"], mutating: false },"]],
    mustFail: ["G1:", "G2:", "G3:", "C3:", "C5:", "G4:", "G5:", "G6:", "P4b:"],
  },

  /* THE STRANGER GIVEN THE WHOLE ROW: the store's public reader returns the credentialed read. The slug still
     matches, so the page and every value arm stay green; the arms pinning the public answer's exact key set fail. */
  "public-gets-provenance": {
    patches: [["store.mjs", PUBLIC_SELECT, "    return this.instanceGroup();"]],
    mustFail: ["G1:", "G2:", "C3:", "C5:", "G5:"],
  },

  /* A SILENCE CALLED "NONE" ON THE WIRE: the public arm answers group null when the store did not answer. */
  "op-silence-as-none": {
    patches: [["index.mjs", PUBLIC_SILENCE,
               "        if (!pubOut.answered) return json({ ok: true, result: { ok: true, group: null }, store: igStore }, 200);"]],
    mustFail: ["G6:"],
  },

  /* THE PAGE READS THE WRONG RECORD — scratch instead of the instance's own. Both stores record the installer's slug
     at their own first boots, so every install arm stays green; only the seed (made in bio) and the silence (injected
     in bio) can tell which record the page reads. */
  "page-reads-scratch": {
    patches: [["index.mjs", PAGE_READ, "      return new Response(setupPage(await publicInstanceGroup(env, \"scratch\")),"]],
    mustFail: ["P3b:", "P4:"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: the same three states in markup and words the suite did not anticipate — a
     different element for the slug, a numeric entity for the middle dot, the none and unread lines reworded.
     Nothing may fail. (ASCII only in every replacement: the copy is written back as latin1 to keep its bytes, so a
     non-ASCII character here would land as a byte that is not UTF-8.) */
  "over-strict": {
    patches: [["setup.mjs", RECORDED_OPEN, "<strong class=\"group\">'"],
              ["setup.mjs", RECORDED_TAIL, "</strong> &#183; the group this copy records</p>\";"],
              ["setup.mjs", NONE_WORDS, "This copy has not recorded its group yet"],
              ["setup.mjs", UNREAD_WORDS, "Could not read this copy's group at the moment"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `group-public-control-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = file.includes("/") ? join(tree, "bio-plane", file) : join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, GROUP_PUBLIC_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /group-public: (\d+) passed, (\d+) failed/.exec(out);
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

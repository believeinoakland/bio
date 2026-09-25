/* founder-sight.control.mjs — the NEGATIVE CONTROL for `test/founder-sight.test.mjs`
 * (REC-132 / D-422 / IC-149). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/founder-sight.control.mjs            every arm
 *   node test/founder-sight.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source. Each arm copies `src/` into a
 * uniquely-named temporary tree, applies ONE patch there (asserting its anchor occurs
 * EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the suite
 * with FOUNDER_SIGHT_SRC pointed at the copy. The real `src/index.mjs` and
 * `src/store.mjs` are hashed (sha256 and byte length) before the first arm and after
 * the last, and the run fails loudly if either moved.
 *
 * `admin-bytes` is not a suite arm. It is the design's fourth control — *the admin
 * token's answers are byte-identical before and after* — and it needs the PRE-CHANGE
 * build, which it takes from git (`git archive` of the merge-base with origin/main, or
 * the ref in FOUNDER_SIGHT_BASE) and drives beside this tree's build through one fixed
 * script under the ADMIN token, comparing the answers after normalising only what is
 * minted per run (timestamps, lead ids, session tokens). A battery suite must not pin a
 * base commit, which is why this lives here.
 *
 * DECLARED BEFORE ARMING — what MUST fail (by label fragment) and what MUST stay green.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "founder-sight.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [] },
  /* The pre-fix resolver: the founder's viewer folds to `member:admin`. */
  "no-founder-arm": {
    patches: [["index.mjs", "viewer: r === \"admin\" ? \"admin\" : `member:${member}`,", "viewer: `member:${member}`,"]],
    mustFail: ["CONTROL 1: op=list", "op=image — the founder reads", "op=affordances — the founder is answered"],
  },
  /* LIAR 1: the administrator arm widened onto the lead ruling. */
  "leads-widened": {
    patches: [["store.mjs", "    const who = this.#positionalMember(viewer, identity);\n    if (who == null) return null;",
               "    if (viewer === \"admin\") return { sql: \"1=1\", args: [] };\n    const who = this.#positionalMember(viewer, identity);\n    if (who == null) return null;"]],
    mustFail: ["CONTROL 2: the founder CANNOT read", "CONTROL 2, SHARED", "nor can the founder record a look",
               "op=frontier&level=internet — the founder's frontier"],
  },
  /* LIAR 2: positional questions answered from the VISIBILITY half. */
  "positional-from-viewer": {
    patches: [["store.mjs", "const asked = typeof identity === \"string\" && identity !== \"\" ? identity : viewer;",
               "const asked = viewer;"]],
    mustFail: ["the founder OWNS NO project", "POSITIONAL: the founder reads ITS OWN lead",
               "POSITIONAL: the founder follows its own lead", "op=frontier&level=internet — the founder's frontier"],
  },
  /* LIAR 3: every session resolved to the administrator viewer. */
  "everyone-admin": {
    patches: [["index.mjs", "viewer: r === \"admin\" ? \"admin\" : `member:${member}`,", "viewer: \"admin\","]],
    mustFail: ["vera, an ordinary member of no project, does NOT list it", "vera's op=image of it"],
  },
  /* The reservation removed. */
  "no-reservation": {
    patches: [["store.mjs", "    if (memberId === Store.ROOT_ADMIN)\n      return refusal(\"MEMBER_ID_RESERVED\"",
               "    if (false)\n      return refusal(\"MEMBER_ID_RESERVED\""]],
    /* DECLARATION CORRECTED after the first run (2026-09-18), the instrument's error and not the
       subject's: with no reservation CONTROL 3's memberadd LANDS, so the same store then holds a
       member `admin` and §4's "not held" audit arm correctly reports it held. */
    mustFail: ["CONTROL 3: op=memberadd with id `admin`", "and under the founder's own session", "6a: the legacy build is ARMED",
               "op=audit on an instance holding no member"],
  },
  /* OVER-STRICTNESS: the reservation written as a PREFIX. */
  "prefix-reservation": {
    patches: [["store.mjs", "    if (memberId === Store.ROOT_ADMIN)\n      return refusal(\"MEMBER_ID_RESERVED\"",
               "    if (memberId.startsWith(Store.ROOT_ADMIN))\n      return refusal(\"MEMBER_ID_RESERVED\""]],
    /* DECLARATION CORRECTED after the first run: 6a's anchor is gone, so the legacy build is
       never neutered, refuses `admin` itself, and 6b/6c/6e fail downstream of 6a. */
    mustFail: ["OVER-STRICTNESS: `administrator` is an ordinary id", "6a: the legacy build is ARMED",
               "6b: the OLD rule admitted", "6c: THIS build's op=audit REPORTS it", "6e: and NEVER RENAMED"],
  },
  /* A caller-supplied identity honoured (the stamp no longer the server's). */
  "identity-honoured": {
    patches: [["index.mjs", "    inner.searchParams.delete(\"identity\");", ""],
              ["index.mjs", "      if (IDENTITY_READS.includes(op)) inner.searchParams.set(\"identity\",\n        viaSession ? sessIdentity",
               "      if (IDENTITY_READS.includes(op) && !inner.searchParams.has(\"identity\")) inner.searchParams.set(\"identity\",\n        viaSession ? sessIdentity"]],
    mustFail: ["a caller-supplied `identity=member:iris` on the member TOKEN", "nor does vera's session become iris"],
  },
  /* The audit stops looking. */
  "audit-silent": {
    patches: [["store.mjs", "      membership: (() => {", "      membership_: (() => {"]],
    mustFail: ["op=audit on an instance holding no member", "6c: THIS build's op=audit REPORTS it",
               "6e: and NEVER RENAMED"],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const runArm = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `founder-sight-${name}-`));
  try {
    cpSync(join(PLANE, "src"), join(root, "src"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(root, "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 60)}` };
      writeFileSync(p, s.replace(from, to));
    }
    /* The copied index imports ../checks and ../../docprofile — give it both. */
    const tree = mkdtempSync(join(tmpdir(), `founder-sight-tree-${name}-`));
    cpSync(join(root, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, FOUNDER_SIGHT_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    rmSync(tree, { recursive: true, force: true });
    const out = r.stdout || "";
    const tally = /founder-sight: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

/* ------------------------------------------------------------------ admin-bytes */
const adminBytes = async () => {
  const base = process.env.FOUNDER_SIGHT_BASE
    || execFileSync("git", ["merge-base", "HEAD", "origin/main"], { cwd: REPO, encoding: "utf8" }).trim();
  const mk = (label, fill) => {
    const tree = mkdtempSync(join(tmpdir(), `founder-sight-bytes-${label}-`));
    fill(tree);
    return tree;
  };
  const baseTree = mk("base", (tree) => {
    const tar = execFileSync("git", ["archive", base, "bio-plane/src", "bio-plane/checks", "docprofile"],
                             { cwd: REPO, maxBuffer: 256 << 20 });
    execFileSync("tar", ["-x", "-C", tree], { input: tar });
  });
  const headTree = mk("head", (tree) => {
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
  });
  const { Miniflare } = await import("miniflare");
  /* CORRECTED 2026-09-18 (REC-141, IC-158): THIS tree's plane MINTS a project's id
     (Membership v2 §7) and refuses a creation naming one (PROJECT_ID_SUPPLIED), while
     the pre-change BASE build takes the id it is given. So THIS tree is driven FIRST,
     creating the project with no id and id-less bytes; the base is then handed the
     id this tree minted, in bytes carrying that same `id:` line — the stored bytes,
     their sha and every answer that names the project are then the same on both
     sides, and nothing new is normalised away. `chosen` null = mint (this tree). */
  const drive = async (tree, chosen) => {
    const idx = join(tree, "bio-plane", "src", "index.mjs");
    const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: "adm-bytes", VERSION: "test" } });
    const raw = async (q, body) => (await (await mf.dispatchFetch(`http://x/api/?${q}`,
      body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) })).text());
    const sha = (v) => createHash("sha256").update(v).digest("hex");
    const { projectFixtureMd } = await import("./publishingproject.mjs");
    const A = "token=adm-bytes";
    try {
      await raw("op=claim", { bootstrapToken: "adm-bytes", password: "founder-bytes-pass" });
      for (const [m, role] of [["ruth", "admin"], ["iris", "member"]]) {
        const add = JSON.parse(await raw(`op=memberadd&${A}`, { memberId: m, cover: m, role, capabilities: ["contribute"] }));
        await raw("op=enroll", { invite: (add.result || add).invite, handle: m, password: `${m}-bytes-pass` });
      }
      const iris = JSON.parse(await raw("op=login", { role: "member:iris", password: "iris-bytes-pass" }));
      const IRIS = (iris.result || iris).token;
      const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
      const text = projectFixtureMd(chosen, { created: NOW, updated: LATER, name: "PROJ-2026-9132-bytes" });
      const made = JSON.parse(await raw(`op=promote&${A}`, { ...(chosen === null ? {} : { bundleId: chosen }),
        base: null, snapKey: "20260918T132000Z_bytes001",
        meta: { object_type: "project", group: "believe-in-oakland", title: "t", current_state: "investigating",
                created: NOW, last_updated: LATER },
        files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] }));
      const P = (made.result || made).bundleId;
      if (typeof P !== "string" || (chosen !== null && P !== chosen))
        throw new Error(`admin-bytes: project creation (${chosen === null ? "minted" : "chosen " + chosen}): ${JSON.stringify(made).slice(0, 400)}`);
      const ns = await mf.getDurableObjectNamespace("STORE");
      await (await ns.get(ns.idFromName("bio")).fetch("http://x/projectclaimowner",
        { method: "POST", body: JSON.stringify({ projectId: P, memberId: "iris" }) })).text();
      const lead = JSON.parse(await raw(`op=lead&token=${IRIS}`, { words: "a tip" }));
      const LID = (lead.result || lead).lead_id;
      const reads = [
        `op=list&${A}&limit=1000`, `op=index&${A}`, `op=image&${A}&id=${P}`, `op=affordances&${A}&target=${P}`,
        `op=queue&${A}`, `op=projectparticipants&${A}&projectId=${P}`, `op=memberlist&${A}`,
        `op=frontier&${A}&level=internet`, `op=frontier&${A}&level=document`, `op=leadread&${A}&id=${LID}`,
        `op=search&${A}&q=project`, `op=backlinks&${A}&target=${P}`,
        `op=memberadd&${A}`, /* an empty memberadd: the refusal it answered before */
      ];
      const out = {};
      for (const q of reads) out[q.replace(LID, "LEAD-X")] = (await raw(q, q.startsWith("op=memberadd") ? {} : undefined))
        .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "T").replace(/LEAD-\d{4}-\d{4}-[0-9a-f]+/g, "LEAD-X");
      return { out, P };
    } finally { await mf.dispose(); }
  };
  try {
    const head = await drive(headTree, null), h = head.out, b = (await drive(baseTree, head.P)).out;
    const differ = Object.keys(b).filter((k) => b[k] !== h[k]);
    console.log(`admin-bytes: base ${base.slice(0, 8)} vs this tree — ${Object.keys(b).length} admin-token reads, `
      + `${differ.length} differ`);
    for (const k of differ) console.log(`  DIFFERS  ${k}\n    base ${b[k].slice(0, 300)}\n    head ${h[k].slice(0, 300)}`);
    return differ.length === 0;
  } finally {
    rmSync(baseTree, { recursive: true, force: true }); rmSync(headTree, { recursive: true, force: true });
  }
};

const want = process.argv[2];
const names = want ? [want] : [...Object.keys(ARMS), "admin-bytes"];
let allOk = true;
for (const n of names) {
  if (n === "admin-bytes") { const ok = await adminBytes(); console.log(`ARM admin-bytes: ${ok ? "AS DECLARED (byte-identical)" : "NOT AS DECLARED"}`); allOk &&= ok; continue; }
  if (!ARMS[n]) { console.log(`no arm ${n}; arms: ${Object.keys(ARMS).join(", ")}, admin-bytes`); process.exit(2); }
  const r = runArm(n);
  if (!r.armed) { console.log(`ARM ${n}: DID NOT ARM — ${r.why}`); allOk = false; continue; }
  console.log(`ARM ${n}: ${r.tally} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
    + (r.missing.length ? `\n  declared to fail but PASSED: ${r.missing.join(" | ")}` : "")
    + (r.unexpected.length ? `\n  failed but NOT declared: ${r.unexpected.join(" | ")}` : ""));
  allOk &&= r.asDeclared;
}
const after = REAL.map(digest);
console.log(`real sources untouched: ${before.every((d, i) => d === after[i]) ? "YES" : "NO — " + JSON.stringify({ before, after })}`
  + ` (${after.join(" · ")})`);
process.exit(allOk && before.every((d, i) => d === after[i]) ? 0 : 1);

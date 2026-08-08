/* REC-72's CLASS SWEEP — WHICH EDGES THE DESIGN RELIES ON HAVE NO CURATED
 * PRODUCER, i.e. can be written ONLY by hand-authoring `bundle.md` and calling
 * `op=promote`?
 *
 * WHY THIS FILE IS `.probe.mjs` AND NOT `.test.mjs`. `scripts/battery.mjs`
 * discovers `f.endsWith(".test.mjs")` and `scripts/coverage.mjs` reads its op
 * corpus from the same filter. A SWEEP owes the battery a delta of zero: it
 * measures the estate rather than pinning it, and a census pinned by the item
 * that took it is a number nobody can falsify. Run it directly:
 *
 *     node bio-plane/test/curated-producer.probe.mjs
 *
 * THE INSTRUMENT IS TWO HALVES AND THE SECOND IS THE ONE THAT COUNTS:
 *
 *   (1) A MATCHER over `src/**` for every WRITE of a `references[]` relation and
 *       of a `basis[]` leg. It answers "is there a site in the plane that
 *       composes this edge", which is necessary and NOT sufficient — a site can
 *       exist behind an arm no caller can reach.
 *   (2) A DRIVE against the real control plane for the two the matcher flags as
 *       most load-bearing. A SOURCE READ CANNOT TELL AN UNREACHABLE ARM FROM AN
 *       ABSENT ONE, which is the whole reason D-216 found REC-72's gap by
 *       driving twelve ops and CONDUCT's source read only confirmed it after.
 *
 * WHAT THIS INSTRUMENT CANNOT SEE, stated here rather than discovered later:
 *
 *   (i)   IT MATCHES ONE WRITE SHAPE: an object literal carrying `rel: "<x>"`,
 *         and the frontmatter line `rel: <x>` inside a template literal the
 *         store composes. A relation written by building the document text some
 *         OTHER way — string concatenation across lines, a computed rel, a value
 *         out of a table — is INVISIBLE to it. `links_to` is the proof that this
 *         blind spot is real and not theoretical: it is written by an `INSERT
 *         INTO refs` and never through a document at all, so the matcher scores
 *         it from the SQL and not from a rel literal, and it is reported
 *         separately for exactly that reason.
 *   (ii)  IT DOES NOT KNOW WHETHER A PRODUCER IS REACHABLE BY A MEMBER. A site
 *         inside a machine-only op, or behind a fence, counts here as a
 *         producer. Only the DRIVEN half answers reachability, and it is driven
 *         for two relations, not nine.
 *   (iii) IT SAYS NOTHING ABOUT WHETHER AN EDGE SHOULD HAVE A PRODUCER. Four of
 *         the nine relations may be legitimately authored-only. Naming them is
 *         the output; ruling on them is not this probe's business and is
 *         reported to CONDUCT as a question rather than answered here.
 *   (iv)  ONE ISOLATE, ONE STORE, one commit. It measures THIS tree.
 *   (v)   AN ABSENCE OF REFUSAL IS NOT A PROOF OF PERMISSION, and the converse:
 *         a refusal proves the act is closed TODAY, not that it was meant to be.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const FILES = ["store.mjs", "index.mjs", "affordances.mjs", "cdx.mjs", "subresources.mjs"];
const SOURCES = FILES.map((f) => [f, readFileSync(SRC(f), "utf8")]);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const m = (label, value) => { console.log(`  MEASURED  ${label}: ${JSON.stringify(value)}`); return value; };

/* ================= (1) THE MATCHER, AND ITS CORPUS IS PRINTED ============= */
console.log("\n--- 1. THE CORPUS: every relation the record's own closed vocabulary admits ---");

/* Read out of the catalogue rather than written down here, so the day the
   vocabulary grows this sweep grows with it instead of going quietly stale —
   which is this project's most-repeated finding. */
const CHECKS = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");
const REL_VOCAB = (/const REL_VOCAB = \[([^\]]+)\]/.exec(CHECKS)?.[1] ?? "")
  .split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);

t("NON-EMPTY CORPUS GUARD: the vocabulary was read out of the catalogue and is not empty — a "
+ "matcher narrowed to nothing reports a beautiful 100%", REL_VOCAB.length > 0, true);
m("the closed relation vocabulary (checks/bio-checks.mjs REL_VOCAB)", REL_VOCAB);
m("source files walked", FILES);
m("total source bytes walked", SOURCES.reduce((n, [, s]) => n + s.length, 0));

/* COMMENTS ARE BLANKED BEFORE ANYTHING IS MATCHED, and the first draft of this
   probe did NOT do it — it reported `affordances.mjs` and a second `store.mjs`
   line as producers of `cites`, and both were PROSE inside a block comment
   whose continuation lines do not begin with `*`. This file and the plane are
   full of paragraphs naming these relations, so a matcher that reads prose
   scores a producer for almost everything: WRONG IN THE GENEROUS DIRECTION,
   which is the one direction a sweep for missing producers must never be wrong
   in. Comment bytes are replaced with spaces so LINE NUMBERS still line up.
   Blanking is naive about a `//` inside a string literal, and that error runs
   the OTHER way — it can hide a real producer and report a gap that is not one,
   which is the direction this sweep can afford. */
const blankComments = (src) => {
  const out = src.split(""); let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2), stop = end === -1 ? src.length : end + 2;
      for (let k = i; k < stop; k++) if (out[k] !== "\n") out[k] = " ";
      i = stop; continue;
    }
    if (src[i] === "/" && src[i + 1] === "/") {
      let k = i; while (k < src.length && src[k] !== "\n") { out[k] = " "; k++; }
      i = k; continue;
    }
    i++;
  }
  return out.join("");
};
const CODE = SOURCES.map(([f, s]) => [f, blankComments(s)]);

/* THE TWO WRITE SHAPES THE MATCHER KNOWS, and (i) above says what it does not. */
const producersOf = (rel) => {
  const out = [];
  for (const [file, src] of CODE) {
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      /* an object literal composed for #spliceReferences, or the frontmatter
         line the store writes inside a template literal */
      if (new RegExp(`rel:\\s*["']${rel}["']`).test(line)
       || new RegExp(`^\\s*(\\+\\s*)?["'\`]?\\s*rel:\\s*${rel}\\s*["'\`,]?\\s*$`).test(line)
       || new RegExp(`rel:\\s*${rel}["'\`,]`).test(line))
        out.push(`${file}:${i + 1}`);
      /* the SQL shape — the one the matcher would otherwise miss entirely */
      if (new RegExp(`INSERT INTO refs[^;]*'${rel}'`).test(line)) out.push(`${file}:${i + 1} (INSERT INTO refs)`);
    });
  }
  return out;
};
console.log("\n--- 2. THE REACH: which relations any site in the plane composes ---");
const REPORT = {};
for (const rel of REL_VOCAB) {
  const sites = producersOf(rel);
  REPORT[rel] = sites;
  console.log(`  ${sites.length ? "PRODUCER " : "NO PRODUCER"}  ${rel.padEnd(14)} ${sites.join(" · ") || "— written only by hand-authored frontmatter + op=promote"}`);
}
const withProducer = REL_VOCAB.filter((r) => REPORT[r].length);
const without = REL_VOCAB.filter((r) => !REPORT[r].length);
m("relations WITH a producer in the plane", withProducer);
m("relations WITHOUT one — authored-only today", without);

t("SELF-CHECK ON THE MATCHER: it finds `cites` in the plane's own code — a matcher that found "
+ "nothing would report every relation as authored-only and look like a very productive sweep",
  REPORT.cites.length >= 2 && REPORT.cites.every((s) => s.startsWith("store.mjs:")), true);
t("SELF-CHECK ON THE BLANKING: not one hit for any relation falls inside a comment — asserted over "
+ "the RAW source, because the first draft of this probe scored two comment paragraphs as producers "
+ "and would have reported the sweep's gap list one relation too short",
  Object.values(REPORT).flat().filter((hit) => {
    const p = /^([^:]+):(\d+)/.exec(hit);
    const raw = SOURCES.find(([f]) => f === p[1])[1].split("\n")[Number(p[2]) - 1];
    const blanked = CODE.find(([f]) => f === p[1])[1].split("\n")[Number(p[2]) - 1];
    return raw.trim() !== "" && blanked.trim() === "";
  }), []);
t("SELF-CHECK, THE OTHER DIRECTION (over-strictness): the matcher does NOT claim a producer for "
+ "every relation — if it did, the sweep would be vacuous in the generous direction",
  without.length > 0, true);

/* ============ (3) THE DRIVE — a source read cannot tell an unreachable arm
 * from an absent one, so the two findings that matter are DRIVEN.
 * ======================================================================== */
console.log("\n--- 3. DRIVEN: the two findings a source read could not settle ---");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sweep", MEMBER_TOKEN: "mem-sweep", PROBE_TOKEN: "prb-sweep",
              VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {
const add = await POST("op=memberadd&token=adm-sweep",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
const TOK = (await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" })).token;

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "A question"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit later", "    description: Things change.",
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A doc.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let seq = 0;
const put = async (id, text, type, state) => {
  const r = await POST(`op=promote&token=${TOK}`, { bundleId: id, base: null,
    snapKey: `${id}-${++seq}-${sha(String(seq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: type === "information"
      ? [{ path: "snapshots/d.bin", sha256: sha(`c-${id}`), encoding: "binary", bytes: 10 }] : [],
    meta: { object_type: type, group: "believe-in-oakland", title: `B ${id}`,
            current_state: state, created: NOW, last_updated: LATER } });
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
};
const Q = "INQ-2026-7290-question", DOC = "INFO-2026-7290-doc";
await put(Q, inquiryMd(Q), "inquiry", "open");
await put(DOC, infoMd(DOC), "information", "collected");
const handle = async (ids) => (await POST(`op=select&token=${TOK}`, { ids })).handle;

/* FINDING 1 — THE ONE REC-72 CLOSED, re-driven here so the sweep's own headline
   is measured on the same tree it reports and not carried from another file. */
{
  const CASE = "PROJ-2026-7290-case";
  await put(CASE, ["---", `id: ${CASE}`, "object_type: project", "current_state: forming",
    `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []", "---", "",
    "## Summary", "", "A case.", "", "## Session Log"].join("\n"), "project", "forming");
  const c = await GET(`op=cite&token=${TOK}&project=${encodeURIComponent(CASE)}&handle=${await handle([Q])}`);
  const s = await GET(`op=sever&token=${TOK}&project=${encodeURIComponent(CASE)}`
    + `&handle=${await handle([Q])}&reason=${encodeURIComponent("no longer drawing on it")}`);
  t("CLOSED BY REC-72: the case-to-question `cites` edge HAS a curated producer and a curated "
  + "withdrawal — driven, both directions",
    [c?.ok, s?.ok], [true, true]);
}

/* FINDING 2 — THE SWEEP'S HEADLINE, AND IT IS REC-72's OWN SHAPE ONE ALTITUDE
   UP. A QUESTION's `basis[]` leg has a producer (`op=cite`'s inquiry arm) and
   NO WITHDRAWAL: `#spliceBasis` has exactly one caller, and `op=sever` refuses
   a citing object that is not a project. So a question can join what it rests
   on and cannot leave it — the very asymmetry REC-72's brief calls "a worse
   shape than one that can do neither". DRIVEN, because the source read alone
   could not tell a closed arm from an absent one. */
{
  const c = await GET(`op=cite&token=${TOK}&project=${encodeURIComponent(Q)}`
    + `&handle=${await handle([DOC])}&role=supports`);
  t("NON-EMPTY GUARD: the question really does rest on the document, so what follows is about a "
  + "leg that exists", [c?.ok, c?.cited], [true, [DOC]]);
  const s = await GET(`op=sever&token=${TOK}&project=${encodeURIComponent(Q)}`
    + `&handle=${await handle([DOC])}&reason=${encodeURIComponent("this leg no longer holds")}`);
  m("op=sever(question, its own basis leg) — what the plane answered",
    { ok: s?.ok, reason: s?.reason ?? null, got: s?.got ?? null });
  t("OPEN, AND ROUTED: a QUESTION cannot withdraw a leg of its own basis through any act — "
  + "`op=sever` refuses the question as a citing object. The leg has a producer and no withdrawal, "
  + "which is REC-72's exact class at the basis altitude and is NOT closed by REC-72",
    [s?.ok, s?.reason], [false, "NOT_A_PROJECT"]);
  const r = await GET(`op=reinstate&token=${TOK}&project=${encodeURIComponent(Q)}`
    + `&handle=${await handle([DOC])}&reason=${encodeURIComponent("back again")}`);
  t("and `op=reinstate` refuses it identically, so the gap is the whole edge-transition family and "
  + "not one verb", [r?.ok, r?.reason], [false, "NOT_A_PROJECT"]);
}

/* FINDING 3 — the mechanism a withdrawal WOULD use already exists on the read
   side, which is what makes finding 2 a missing ACT rather than a missing
   model. `#restsOnLive` reads the citing document's `references[]` status and a
   SEVERED reference does not count as a live leg. So the record already knows
   how to represent a withdrawn leg; nothing can put one there. */
{
  const src = SOURCES.find(([f]) => f === "store.mjs")[1];
  /* The DEFINITION and not the first mention: `#restsOnLive` is named in prose
     above itself, and slicing from the first occurrence would have measured a
     comment. That is the same false-positive class the blanking above fixes,
     caught here by the arm failing rather than by reading. */
  const at = src.indexOf("  #restsOnLive(id) {");
  t("NON-EMPTY GUARD: the predicate's definition was actually located, so the arm below reads code "
  + "and not the first paragraph that happens to name it", at > 0, true);
  const walk = src.slice(at, at + 2500);
  t("the READ side already honours a severed reference as a withdrawn leg — so finding 2 is a "
  + "missing ACT and not a missing model, which is the difference between an item and a redesign",
    /entry\.status === "severed"/.test(walk), true);
}

console.log(`\ncurated-producer sweep: ${pass} pass, ${fail} fail`);
} finally { await mf.dispose(); }
process.exit(fail ? 1 : 0);

/* T42-20's NEGATIVE CONTROL DRIVER (K874) for `t42.test.mjs`: each arm breaks the source in one place `POST /transcribe`
 * (R72–R75) and the amended R31, R34, R58, R63 depend on, runs the suite, and requires it to FAIL, naming the
 * requirement ids the failing lines carry.
 *
 *     node test/t42.control.mjs          # every arm, in order
 *     node test/t42.control.mjs 3        # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it edits real sources while it runs (cascade.control.mjs' rules): snapshots are held
 * in memory and written back in a `finally`, every restore is verified by sha256, and the suite's exit status is read
 * from `spawnSync().status`. `git checkout` is never used.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(DIR, "..");
const SUITE = join(DIR, "t42.test.mjs");
const INDEX = join(MEMBER, "src/index.mjs");
const TRANSCRIBE = join(MEMBER, "src/transcribe.mjs");
const OPS = join(MEMBER, "src/ops.mjs");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const ARMS = [
  { name: "a sign-in account sent a picture (TRANSCRIBE_NEEDS_API_KEY never refused)", file: TRANSCRIBE, ids: ["R72"],
    from: `if (account.kind === "signin")\n    return refusal("TRANSCRIBE_NEEDS_API_KEY"`, to: `if (false)\n    return refusal("TRANSCRIBE_NEEDS_API_KEY"` },
  { name: "capture_sha not judged", file: TRANSCRIBE, ids: ["R72"],
    from: `if (!(typeof body.capture_sha === "string" && SHA.test(body.capture_sha)))`, to: "if (false)" },
  { name: "a duplicate page taken", file: TRANSCRIBE, ids: ["R72"],
    from: "if (seen.has(p.page)) return", to: "if (false) return" },
  { name: "the picture's size not bounded", file: TRANSCRIBE, ids: ["R72"],
    from: "if (bytes > TRANSCRIBE_IMAGE_MAX_BYTES)", to: "if (false)" },
  { name: "a picture that is not a PNG sent to the model", file: TRANSCRIBE, ids: ["R72", "R63"],
    from: "if (!isPng(p.data)) return", to: "if (false) return" },
  { name: "the picture put in the user turn beside the opening's words", file: TRANSCRIBE, ids: ["R73", "R63"],
    from: `{ role: "user", content: [{ type: "text", text: ASKED }] },`,
    to: `{ role: "user", content: [{ type: "text", text: ASKED }, imageBlock(page.data)] },` },
  { name: "pages taken in the order sent, not ascending", file: TRANSCRIBE, ids: ["R73"],
    from: "out.sort((a, b) => a.page - b.page)", to: "out" },
  { name: "a read tool offered beside transcription", file: TRANSCRIBE, ids: ["R73", "R75"],
    from: "tools: [READ_PAGE_TOOL, TRANSCRIPTION_TOOL],",
    to: `tools: [READ_PAGE_TOOL, { name: "read", description: "read the record", input_schema: { type: "object" } }, TRANSCRIPTION_TOOL],` },
  { name: "a page given a third turn", file: OPS, ids: ["R73"],
    from: "export const TRANSCRIBE_TURNS = 2;", to: "export const TRANSCRIBE_TURNS = 3;" },
  { name: "eight pages no longer the bound", file: OPS, ids: ["R72"],
    from: "export const TRANSCRIBE_PAGES_MAX = 8;", to: "export const TRANSCRIBE_PAGES_MAX = 9;" },
  { name: "a blank answer counted as the page's words", file: TRANSCRIBE, ids: ["R74"],
    from: String.raw`return /\S/u.test(text) ? { text } : { ending: "blank" };`, to: "return { text };" },
  { name: "every page silent answered 200 with nothing transcribed", file: TRANSCRIBE, ids: ["R74"],
    from: `if (!done.length && notDone.every((p) => p.ending === "silent" || p.ending === "refused"))`, to: "if (false)" },
  { name: "the label left to the model's words", file: TRANSCRIBE, ids: ["R74"],
    from: `label: TRANSCRIBE_LABEL,`, to: `label: { kind: "machine" },` },
  { name: "a BAD_PAGES refusal quoting the faulty entry", file: TRANSCRIBE, ids: ["R75"],
    from: "return { fault: `pages[${i}].media_type is not ${TRANSCRIBE_MEDIA_TYPE}` };",
    to: "return { fault: `pages[${i}].media_type is not ${TRANSCRIBE_MEDIA_TYPE}: ${JSON.stringify(p)}` };" },
  { name: "the route left out of SURFACE", file: INDEX, ids: ["R34"],
    from: `  transcribe: { method: "POST", mutating: false },\n`, to: "" },
  { name: "the UNKNOWN refusal not naming the route", file: INDEX, ids: ["R31"],
    from: "POST /signin, POST /transcribe or GET /version only.", to: "POST /signin or GET /version only." },
  { name: "the one sentence not naming /transcribe", file: INDEX, ids: ["R58"],
    from: "or transcription (/transcribe) has turns", to: "has turns" },
];

const pick = process.argv[2] ? [Number(process.argv[2])] : ARMS.map((_, i) => i + 1);
let bad = 0;
for (const n of pick) {
  const arm = ARMS[n - 1];
  const before = readFileSync(arm.file, "utf8");
  const hash = sha(before);
  if (before.split(arm.from).length !== 2) { console.log(`  ARM ${n} NOT ARMED: its anchor is not in the source once`); bad++; continue; }
  let out = "", status = null;
  try {
    writeFileSync(arm.file, before.replace(arm.from, arm.to));
    const r = spawnSync("node", [SUITE], { cwd: MEMBER, encoding: "utf8" });
    out = (r.stdout || "") + (r.stderr || ""); status = r.status;
  } finally {
    writeFileSync(arm.file, before);
    if (sha(readFileSync(arm.file, "utf8")) !== hash) { console.log(`  RESTORE FAILED for ${arm.file}`); process.exit(2); }
  }
  const failing = out.split("\n").filter((l) => l.startsWith("  FAIL"));
  const named = arm.ids.filter((id) => failing.some((l) => new RegExp(`\\b${id}\\b`).test(l)));
  const ok = status !== 0 && failing.length > 0 && named.length === arm.ids.length;
  console.log(`  ${ok ? "PASS" : "FAIL"}  arm ${n} (${arm.name}): the suite fails ${failing.length} line(s), naming ${named.join(", ") || "none"}`
    + (ok ? "" : ` (want every one of ${arm.ids.join(", ")})`));
  if (!ok) bad++;
}
console.log(`\nt42 control: ${pick.length - bad} pass, ${bad} fail`);
process.exit(bad ? 1 : 0);

#!/usr/bin/env node
/* mintid-take.control.mjs — D-242's NEGATIVE-CONTROL DRIVER for `bio-plane/test/mintid-take.test.mjs`: a baseline and
 * three arms on `tools/mintid.mjs`'s `take`, each armed ALONE.
 *
 *     node bio-plane/test/mintid-take.control.mjs          # from the repo root
 *
 * DECLARED BEFORE ARMING:
 *   BASE  nothing armed                                   -> GREEN, every arm below PASSES by name
 *   B     BYPASS THE ONE WRITER: the push replaced by an acknowledged no-op and the read-back told it landed (both
 *         sites are the writer) -> "two clones minting one namespace at once receive DISTINCT ids" FAILS by name
 *   L     the floor stops reading the land/* tips        -> "an id held ONLY on a land/* tip is not handed out again" FAILS
 *   R     every push failure read as a lost race        -> "a push refused for a reason OTHER than a race hands out NOTHING" FAILS
 * What MUST NOT fail: the baseline, every restore (sha256 AND `cmp` against the arm's own pristine copy, bytes floored).
 * The subject is restored before the next arm, and the tree is never left armed: the restore runs on every exit.
 */
import "./stdio.mjs";
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SUBJECT = join(REPO, "tools/mintid.mjs");
const SUITE = join(REPO, "bio-plane/test/mintid-take.test.mjs");
const MIN_BYTES = 60000;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const PEN = mkdtempSync(join(tmpdir(), "mintid-take-control-"));
const PRISTINE_SHA = sha(SUBJECT);

const ARMS = [
  { id: "B", title: "BYPASS THE ONE WRITER — the id handed out without the compare-and-swap push",
    patches: [["      const p = tgit(repo, [\"push\", \"--porcelain\", where, `${commit}:refs/heads/${TAKE_BRANCH}`]);",
               "      const p = { status: 0, stdout: \"\", stderr: \"\" }; /* ARM B */"],
              ["        let verified = onRemote === commit ? \"the remote's tip is this commit\" : null;",
               "        let verified = \"ARM B: no writer\";"]],
    mustFail: ["two clones minting one namespace at once receive DISTINCT ids"] },
  { id: "L", title: "the floor stops reading the land/* tips",
    patches: [["refs = refsFloor(ns, { repo, refs: heads.map(", "refs = refsFloor(ns, { repo, refs: heads.filter((h) => !h.startsWith(\"refs/heads/land/\")).map("]],
    mustFail: ["an id held ONLY on a land/* tip is not handed out again (C-9 is on land/worker/X, the tree says 5)"] },
  { id: "R", title: "every push failure read as a lost race (the refusal never reached)",
    patches: [["      if (!RACE_RE.test(out))\n", "      if (false)\n"]],
    mustFail: ["a push refused for a reason OTHER than a race hands out NOTHING"] },
];
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patches.map(([find, put]) => ({ arm: a.id, file: SUBJECT, find, put }))));

const run = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 26 });
  const out = `${r.stdout}${r.stderr}`;
  const fails = [...out.matchAll(/^  FAIL  (.+)$/gm)].map((m) => m[1]);
  const tally = (out.match(/^(\d+) pass, (\d+) fail$/m) || []).slice(1).map(Number);
  return { code: r.status, fails, tally: tally.length ? tally : [-1, -1], foot: /reached its own FOOT/.test(out) && !fails.some((f) => /FOOT/.test(f)) };
};

let bad = 0;
const say = (ok, line) => { console.log(`${ok ? "PASS" : "FAIL"}  ${line}`); if (!ok) bad++; };
try {
  const base = run();
  say(base.code === 0 && base.fails.length === 0 && base.foot, `BASE  exit ${base.code} · ${base.tally[0]} pass / ${base.tally[1]} fail · foot ${base.foot}`);
  for (const arm of ARMS) {
    const copy = join(PEN, `mintid.${arm.id}.pristine.mjs`);
    copyFileSync(SUBJECT, copy);
    let src = readFileSync(SUBJECT, "utf8");
    const counts = arm.patches.map(([from]) => src.split(from).length - 1);
    if (counts.some((c) => c !== 1)) { say(false, `${arm.id}  NEVER ARMED — anchor counts ${JSON.stringify(counts)} (each must be 1)`); continue; }
    for (const [from, to] of arm.patches) src = src.replace(from, () => to);
    writeFileSync(SUBJECT, src);
    let r;
    try { r = run(); }
    finally { copyFileSync(copy, SUBJECT); }
    const named = arm.mustFail.every((n) => r.fails.includes(n));
    console.log(`      ${arm.id} ${arm.title}\n      exit ${r.code} · ${r.tally[0]} pass / ${r.tally[1]} fail · failed: ${r.fails.map((f) => JSON.stringify(f.slice(0, 90))).join(", ")}`);
    say(r.code === 1 && named, `${arm.id}  fails BY NAME at ${arm.mustFail.map((n) => JSON.stringify(n)).join(", ")}`);
    const bytes = readFileSync(SUBJECT).length;
    const cmp = spawnSync("cmp", [SUBJECT, copy]).status === 0;
    say(sha(SUBJECT) === PRISTINE_SHA && cmp && bytes >= MIN_BYTES, `${arm.id}  RESTORED — sha256 ${sha(SUBJECT).slice(0, 12)}… · cmp ${cmp ? "identical" : "DIFFERS"} · ${bytes} bytes (floor ${MIN_BYTES})`);
  }
} finally {
  if (sha(SUBJECT) !== PRISTINE_SHA) { console.log("FAIL  the subject was left ARMED — restoring from the first arm's copy"); bad++; copyFileSync(join(PEN, "mintid.B.pristine.mjs"), SUBJECT); }
  rmSync(PEN, { recursive: true, force: true });
}
console.log(`\nmintid-take control: ${bad ? `${bad} FAILED` : "every arm AS DECLARED"} · subject sha256 ${PRISTINE_SHA.slice(0, 12)}…`);
process.exit(bad ? 1 : 0);

/* coordpin — the `coord` state a gate suite reads is a PINNED COMMIT, never the live `origin/coord` (M0-136, 2026-09-23;
 * TREE-SHARING.md §3, "A GATE TEST DEPENDS ONLY ON THE CODE", and §3a condition 1 item 4).
 *
 * WHY. Five of the eleven never-cached history readers (`decided`, `mintid`, `op-claims`, `owed`, `readbudget`) read
 * the state files through `tools/coord.mjs`, whose ref is `origin/coord` — a LIVE ref every lane writes to every few
 * minutes (a claim, a flip, a handoff), and which the tools' own CLIs FETCH (`freshen`) when a suite drives them. So
 * each suite's verdict moved with what the lanes had written rather than with the tree under test: `owed`'s live-estate
 * arm asserted the BOB lane owes something ON `coord` at that moment, `mintid`'s `--audit` exit counted the prefixes
 * then allocating on `coord`, and `decided`'s in-repository arm compared two reads a fetch could separate. Measured
 * 2026-09-23 by a logging `git` on PATH: `decided` ran `git fetch origin coord` 5 times and `mintid` 31, and every one of
 * the five resolved `origin/coord` and read the state at whatever it held (the tip moved three times in one pass).
 *
 * THE PIN. Importing this module sets `BIO_COORD_REF` — the coord layer's own override (`tools/coord.mjs` `coordRef`) —
 * to COORD_PIN, a commit NAMED HERE. Every in-process read goes through it, every CLI a suite spawns inherits it, and a
 * tool whose override is set does not fetch (`freshen`: "BIO_COORD_REF is set"). Git objects are content-addressed, so
 * the state read is the same bytes in every clone and on every day. WHY THIS COMMIT: `e2d3cb34` was `origin/coord` when
 * M0-136 was built (this item's own claim, 2026-09-23T16:36Z); all five suites were measured green over it. `coord` is
 * append-only (`coord.mjs write` never forces), so the commit stays reachable from `origin/coord` in every clone that
 * has fetched it — the GitHub run fetches it (`.github/workflows/gates.yml`); a clone that never fetched `coord` reads
 * the state as ABSENT, as it did before this pin, and the suites' floors then fail by name.
 *
 * THE COST, STATED (M0-130's, in this form). The suites no longer see `coord` move: a state file whose SHAPE a lane
 * changes after the pin (a new heading grammar, a ledger split) is judged by no gate unit until the pin is moved over it.
 * The live state is judged where a live read is the PURPOSE: `plancheck` (every push, never cached) and the coord write's
 * own ledger checks. Moving the pin is an act in a commit, with its why here, and the next gate then judges the new state.
 *
 * THE PLANTED-REF ARM (`plantedCoord`), which each of the five suites carries. It builds a scratch git directory that
 * borrows this repository's objects (alternates) and its HEAD, plants `refs/remotes/origin/coord` three ways — ABSENT,
 * AT THE PIN, and at a PLANTED commit (the pin's tree with files the suite reads rewritten) — and runs the suite's own
 * probe (a node script importing the real tools) under each with `GIT_DIR` pointing there, so nothing of this checkout's
 * refs is touched. The suite asserts the three verdicts IDENTICAL, and that the planted commit, read DIRECTLY
 * (`BIO_COORD_REF=<planted>`), really does move the probe — else the identity costs nothing. A suite pointed back at the
 * live ref reads each state differently and fails that arm by name (`coordpin.control.mjs`).
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const COORD_PIN = "e2d3cb34a9b1b7755fc06aa0b2908785dbeb78b8";
process.env.BIO_COORD_REF = COORD_PIN;

const GIT_ID = { GIT_AUTHOR_NAME: "M0-136 planted", GIT_AUTHOR_EMAIL: "m0136@example.invalid",
  GIT_COMMITTER_NAME: "M0-136 planted", GIT_COMMITTER_EMAIL: "m0136@example.invalid",
  GIT_AUTHOR_DATE: "2026-09-23T00:00:00Z", GIT_COMMITTER_DATE: "2026-09-23T00:00:00Z" };

const git = (args, env = {}, input) => {
  const r = spawnSync("git", args, { cwd: REPO, encoding: "utf8", input, maxBuffer: 1 << 28, env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`coordpin: git ${args.slice(0, 3).join(" ")} exited ${r.status}: ${String(r.stderr).trim().slice(0, 300)}`);
  return r.stdout.trim();
};

/**
 * @param probe  the body of an ES module that prints ONE line of JSON — the verdict — on its last stdout line.
 *               It imports the real tools by absolute path (`REPO` is exported for it).
 * @param plant  { "<coord path>": "<its planted text>" } — files the probe reads, rewritten in the planted commit.
 * @returns { pinnedAs, absent, atPin, planted, direct } — the three states' verdicts and the planted commit read directly.
 */
export function plantedCoord({ probe, plant }) {
  const common = git(["rev-parse", "--git-common-dir"]);
  const objects = join(isAbsolute(common) ? common : join(REPO, common), "objects");
  const T = mkdtempSync(join(tmpdir(), "coordpin-"));
  try {
    git(["init", "-q", "--bare", T]);
    mkdirSync(join(T, "objects/info"), { recursive: true });
    writeFileSync(join(T, "objects/info/alternates"), `${objects}\n`);
    const G = { GIT_DIR: T, GIT_WORK_TREE: REPO };
    git(["update-ref", "HEAD", git(["rev-parse", "HEAD"])], G);
    git(["read-tree", "HEAD"], G);
    /* The planted commit: the pin's tree with the named files rewritten; its objects land in T, never in this repository. */
    const IDX = { ...G, GIT_INDEX_FILE: join(T, "planted.index") };
    git(["read-tree", COORD_PIN], IDX);
    for (const [rel, text] of Object.entries(plant)) {
      const blob = git(["hash-object", "-w", "--stdin"], G, text);
      git(["update-index", "--add", "--cacheinfo", `100644,${blob},${rel}`], IDX);
    }
    const tree = git(["write-tree"], IDX);
    const planted = git(["commit-tree", tree, "-p", COORD_PIN, "-m", "M0-136: a planted origin/coord"], { ...G, ...GIT_ID });
    const run = (env) => {
      const r = spawnSync(process.execPath, ["--input-type=module", "-e", probe],
        { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28, env: { ...process.env, ...G, ...env } });
      const last = String(r.stdout || "").trim().split("\n").pop();
      return r.status === 0 ? last : `PROBE FAILED (exit ${r.status}): ${String(r.stderr || "").trim().slice(0, 400)}`;
    };
    const at = (ref) => {
      if (ref) git(["update-ref", "refs/remotes/origin/coord", ref], G);
      else spawnSync("git", ["update-ref", "-d", "refs/remotes/origin/coord"], { cwd: REPO, env: { ...process.env, ...G } });
      return run({});
    };
    const absent = at(null), atPin = at(COORD_PIN), plantedV = at(planted);
    const direct = (at(COORD_PIN), run({ BIO_COORD_REF: planted }));
    return { pinnedAs: process.env.BIO_COORD_REF, absent, atPin, planted: plantedV, direct, plantedSha: planted };
  } finally {
    rmSync(T, { recursive: true, force: true });
  }
}

/* The assertions every carrier makes, in one place so the five cannot drift apart. `t` is the suite's own. */
export function assertPlanted(t, unit, p) {
  console.log(`  M0-136 ${unit}: origin/coord absent  -> ${String(p.absent).slice(0, 160)}`);
  console.log(`  M0-136 ${unit}: origin/coord at pin  -> ${String(p.atPin).slice(0, 160)}`);
  console.log(`  M0-136 ${unit}: origin/coord planted -> ${String(p.planted).slice(0, 160)}`);
  console.log(`  M0-136 ${unit}: planted, read direct -> ${String(p.direct).slice(0, 160)}`);
  t(`M0-136: ${unit} reads the PINNED coord commit, never a ref name`,
    [p.pinnedAs, /^[0-9a-f]{40}$/.test(String(p.pinnedAs))], [COORD_PIN, true]);
  t(`M0-136: the probe ran and printed a verdict (else the identity below costs nothing)`,
    /^PROBE FAILED/.test(String(p.atPin)) || !String(p.atPin).startsWith("{"), false);
  t(`M0-136: the planted commit really MOVES ${unit}'s reader when read directly (else the identity costs nothing)`,
    p.direct !== p.atPin, true);
  t(`M0-136: ${unit}'s verdict is IDENTICAL whatever origin/coord holds (absent / the pin / a planted commit)`,
    [p.atPin, p.planted], [p.absent, p.absent]);
}

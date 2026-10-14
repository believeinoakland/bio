/* journey-check R13 (N1099, N1100; DEC-241, DEC-245; amends R6): R6's comparison covers design journey 29 step by step,
   each LIVE step beside the mock's drawing of it, and `/app/more` at 390 px. The mock is read at the checkout's own
   commit, which holds journey 29. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { Walk, FAIL } from "../../../src/journey-check/walker.mjs";
import { designMock, journeyPairs, JOURNEY_29 } from "../../../src/journey-check/design.mjs";
import { journey29Live, JOURNEY_29_STEPS } from "../../../src/journey-check/investigation.mjs";
import { sweepScreens } from "../../../src/journey-check/screens.mjs";
import { browser } from "../../../src/journey-check/run.mjs";

const COMMIT = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
let B, dir, mock, shot;
before(async () => {
  B = await browser(); dir = mkdtempSync(join(tmpdir(), "jc-j29-"));
  mock = await designMock(B, { dir: join(dir, "design"), commit: COMMIT });
  const ctx = await B.newContext(); const p = await ctx.newPage(); await p.setContent("<p>a live step</p>");
  shot = join(dir, "live.png"); await p.screenshot({ path: shot }); await ctx.close();
});
after(async () => { await mock?.close(); await B?.close(); rmSync(dir, { recursive: true, force: true }); });

test("R13: a pair is made for each step of design journey 29, LIVE beside DESIGN", { timeout: 300000 }, async () => {
  const steps = await mock.steps(JOURNEY_29);
  assert.ok(steps.length >= 14, `${steps.length} steps`);
  const walk = new Walk({ out: join(dir, "a"), arm: "local" });
  const files = await journeyPairs(walk, B, mock, { out: walk.out, liveOf: () => shot });
  assert.deepEqual(walk.failures, []);
  assert.equal(files.length, steps.length);
  for (const f of files) assert.ok(existsSync(f) && /journey-29-step-\d\d-/.test(relative(walk.out, f)), f);
});

test("R13 control: a step with no LIVE screenshot fails by name: a missing pair is a failure", { timeout: 300000 }, async () => {
  const walk = new Walk({ out: join(dir, "b"), arm: "local" });
  const files = await journeyPairs(walk, B, mock, { out: walk.out, liveOf: (st, i) => (i === 3 ? null : shot) });
  const steps = await mock.steps(JOURNEY_29);
  assert.equal(files.length, steps.length - 1);
  assert.deepEqual(walk.failures.map((f) => f.kind), [FAIL.DESIGN]);
  assert.match(walk.failures[0].detail, new RegExp(`^journey 29 step 4 \\(${steps[3].s}.*\\): no LIVE screenshot of it, so no pair$`));
});

test("R13: each step of journey 29 is walked by a step of R9 or journey 28, whose screenshot is its LIVE half", async () => {
  const steps = await mock.steps(JOURNEY_29);
  const labels = ["install: the installer's first page", "install: each step finishes, the checks pass", "1 · setup: claim with her own handle; she is the group's first administrator",
    "4 · connect an assistant by her own Claude subscription", "home: a new group's home, inviting members and saying who it is", "2 · start a project with a title, and open it",
    "3 · open a question in it", "5 · capture by address into the question, from its \"Add a document\"", "6 · see both held, and vouch for one",
    "8 · cite it with a role (supports)", "9 · run the assistant on the question from the dock", "10 · read its run's answer and its suggested reading",
    "12 · accept a reading, stand on it for the project, and conclude"];
  const walk = { out: "/w", steps: labels.map((label, i) => ({ label, screenshot: `${i}.png` })) };
  for (const st of steps) assert.ok(journey29Live(walk, st), `journey 29's ${st.s} (${st.act}) has no walked step`);
  /* control: a walk that did not reach a step gives it no LIVE half */
  assert.equal(journey29Live({ out: "/w", steps: [] }, steps[0]), null);
  assert.ok(Object.keys(JOURNEY_29_STEPS).length >= 12);
});

test("R13: `/app/more` is a working screen the live arm pairs at 390 px (DEC-241)", () => {
  assert.ok(sweepScreens().some((s) => s.id === "more" && s.frame === "working"));
});

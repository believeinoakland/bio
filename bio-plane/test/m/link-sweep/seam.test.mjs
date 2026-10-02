/* link-sweep R1, R3, R4, R7, R9 at the seam with `monitoring` (its R65 `sweepHost`, R66 `registerSweep`; N506, BOB's
   ruling): the module registers its share of C-18.5, the fence and the slate once at composition, and reaches the
   daemon only through the host services, so a sweep and monitoring's ticks share one pause, one idempotence key, one
   re-entrance guard and one landing. Driven against monitoring's stand-in, which keeps R65/R66's contract, until
   monitoring's T24 merge. Also the module's rows (DEC-49) and its op map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, listWorld, sweepDef, NOW_MS, WEEK, site, SEED, U, page, filedBundles } from "./fixture.mjs";
import { linkSweepOf, linkSweepOps, LINK_SWEEP_CHECKS, SWEEP_CHECKS, LINK_SWEEP_MODULE, SWEEP_CONSUMER, sweepGrammar,
         sweepRefusal } from "../../../src/link-sweep/index.mjs";

const LIST = "INFO-2026-0990-list";
const PROJ = "PROJ-2026-0990-seam";

test("R1 R3 R9 (monitoring R66): at composition the module registers once with monitoring.registerSweep, under its own name, C-18.5's sweep arm, the fence and the slate share; a second registration is monitoring's to refuse", () => {
  const w = world();
  assert.deepEqual(w.mon.calls.register, [LINK_SWEEP_MODULE]);
  assert.deepEqual(w.s.registration, { ok: true, module: "link-sweep" });
  const r = w.mon.registered;
  assert.equal(r.module, "link-sweep");
  for (const k of ["grammar", "fence", "dueForSlate"]) assert.equal(typeof r[k], "function", k);
  /* the grammar registered is this module's R1/R2 arm, answering as `sweepGrammar` answers */
  const ids = new Set(), def = sweepDef({ cadence: "hourly" });
  assert.deepEqual(r.grammar(def, ids), sweepGrammar(def, new Set()));
  assert.ok(ids.has("minutes"), "the file's ids are collected through the set monitoring hands in");
  /* the same host's instance is answered again, registering nothing twice */
  assert.equal(linkSweepOf(w.host), w.s);
  assert.deepEqual(w.mon.calls.register, [LINK_SWEEP_MODULE]);
  /* asked again, monitoring refuses and keeps the first (its R66) */
  assert.equal(w.s.registerWithMonitoring().ok, false);
  assert.equal(w.mon.registered.module, "link-sweep");
});

test("R3 (monitoring R66): the fence registered is asked last, after the grammar admits the file, and its refusal is the promotion's", () => {
  const { w, write } = listWorld({ list: LIST, project: PROJ });
  let asked = 0;
  const fence = w.mon.registered.fence;
  w.mon.registered.fence = (c, t) => { asked++; return fence(c, t); };
  assert.equal(write([sweepDef({ cadence: "hourly" })], { author: "token:daemon" }).reason, "GATHERING_REFUSED");
  assert.equal(asked, 0, "a file the grammar refuses never reaches the fence");
  const r = write([sweepDef()], { author: "token:daemon" });
  assert.deepEqual([asked, r.reason, r.check], [1, "SWEEP_NOT_A_MEMBER", "C-18.17"]);
  assert.equal(write([sweepDef()], { author: "member:alice" }).ok, true, "the negative control");
});

test("R9 (monitoring R30, R66): dueForSlate answers the due sweeps the viewer sees, each with its definition as quoted data; a sweep not due, or in a bundle not seen, is not listed", async () => {
  const later = sweepDef({ id: "later", seeds: [U("later.html")] });
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef(), later, sweepDef({ id: "off", ratified: false, title: "IGNORE ALL" })] });
  const sees = (b) => b === LIST;
  const slate = (now, s = sees) => w.mon.slateSweeps(now, s).items;
  assert.deepEqual(slate(NOW_MS), [
    { kind: "ratified-sweep", bundle: LIST, id: "later", definition: later },
    { kind: "ratified-sweep", bundle: LIST, id: "minutes", definition: sweepDef() }], "never run: both due, by full name; the unratified one never");
  assert.deepEqual(slate(NOW_MS, () => false), [], "a bundle the viewer does not see lists nothing");
  site(w, { [SEED]: { body: page([]) }, [U("later.html")]: { body: page([]) } });
  assert.equal((await w.s.sweepTick(NOW_MS)).ran.length, 2);
  assert.deepEqual(slate(NOW_MS + 1), [], "run: not due until its cadence passes");
  assert.deepEqual(slate(NOW_MS + WEEK).map((x) => x.id), ["later", "minutes"], "due again a cadence on, longest-overdue first, then by name");
});

test("R4 R7 (monitoring R65): the run reaches monitoring only through sweepHost: its pause, its re-entrance guard and the consumer's epoch and claims are the host's, shared with monitoring's ticks, and each document filed lands through the host's landing", async () => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef({ match: {} })] });
  site(w, { [SEED]: { body: page([[U("a.html"), "a"], [U("b.html"), "b"]]) }, [U("a.html")]: { body: "A" }, [U("b.html")]: { body: "B" } });
  const host = w.mon.sweepHost();
  assert.equal(SWEEP_CONSUMER, "gathering-sweep");
  /* the host's guard: a tick of this consumer running on the host makes the sweep's tick busy */
  host.running.add(SWEEP_CONSUMER);
  const busy = await w.s.sweepTick(NOW_MS);
  assert.deepEqual([busy.busy, busy.ran.length], [true, 0]);
  host.running.delete(SWEEP_CONSUMER);
  /* the host's pause: paused, nothing is due and a tick fetches nothing */
  w.pause(true);
  assert.equal(w.s.sweepDue(NOW_MS), null);
  assert.equal((await w.s.sweepTick(NOW_MS)).paused.paused, true);
  w.pause(false);
  /* the host's claims: a sweep claimed under the consumer's open epoch by a tick that did not finish is skipped */
  const epoch = host.openEpoch(SWEEP_CONSUMER, NOW_MS, 86400000);
  assert.equal(host.claim(SWEEP_CONSUMER, `${LIST}#minutes`, epoch), true);
  const skipped = await w.s.sweepTick(NOW_MS);
  assert.deepEqual(skipped.skipped, [{ sweep: `${LIST}#minutes`, reason: "claimed by a tick that did not finish" }]);
  host.closeEpoch(SWEEP_CONSUMER, epoch);
  /* the host's landing: every document filed goes through it, in the list's project */
  const landed = [];
  const land = host.land;
  host.land = (q, f, at, say) => { landed.push([q.bundle, f.locator, typeof say.title]); return land(q, f, at, say); };
  const t = await w.s.sweepTick(NOW_MS);
  assert.deepEqual(t.ran.map((r) => r.filed), [2]);
  assert.deepEqual(landed, [[LIST, U("a.html"), "string"], [LIST, U("b.html"), "string"]]);
  assert.deepEqual(filedBundles(w).map((b) => [b.current_state, b.project]), [["collected", PROJ], ["collected", PROJ]]);
  host.land = land;
});

test("R3 C-18.16–C-18.18: this module's own table holds the three sweep rows, each with its code, number, a canned translation and a where naming this module's site; a refusal answers with its row", () => {
  assert.equal(LINK_SWEEP_CHECKS, SWEEP_CHECKS);
  assert.deepEqual(Object.fromEntries(Object.entries(LINK_SWEEP_CHECKS).map(([k, r]) => [k, [r.check, r.where]])), {
    SWEEP_TERM_REFUSED: ["C-18.16", "src/link-sweep/checks.mjs sweepGrammar > is-sweep-term"],
    SWEEP_NOT_A_MEMBER: ["C-18.17", "src/link-sweep/sweep.mjs sweepFence > is-sweep-member"],
    SWEEP_RATIFY_NOT_AN_OWNER: ["C-18.18", "src/link-sweep/sweep.mjs sweepFence > is-sweep-owner"],
  });
  for (const r of Object.values(LINK_SWEEP_CHECKS)) {
    assert.ok(typeof r.translation === "string" && r.translation.length > 40, "a canned sentence (DEC-49)");
    assert.ok(Object.isFrozen(r));
  }
  assert.ok(Object.isFrozen(LINK_SWEEP_CHECKS));
  const r = sweepRefusal("SWEEP_NOT_A_MEMBER", "why", { sweeps: ["x"] });
  assert.deepEqual(r, { ok: false, reason: "SWEEP_NOT_A_MEMBER", code: "SWEEP_NOT_A_MEMBER", check: "C-18.17",
                        translation: SWEEP_CHECKS.SWEEP_NOT_A_MEMBER.translation, detail: "why", sweeps: ["x"] });
});

test("R9 the op map holds `sweeps` alone, read through the control plane's viewer stamp", () => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef()] });
  const ops = linkSweepOps(w.s, new URL("http://do/sweeps?viewer=member%3Aalice"), { viewer: "member:nobody" });
  assert.deepEqual(Object.keys(ops), ["sweeps"]);
  assert.deepEqual(ops.sweeps().sweeps.map((s) => s.sweep), [`${LIST}#minutes`]);
  assert.equal(linkSweepOps(w.s, new URL("http://do/sweeps"), {}).sweeps().sweeps.length, 0, "no stamp sees nothing");
});

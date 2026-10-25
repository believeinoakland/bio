/* link-sweep's published contracts (fix round 10; K4990, K4993, K4995, K5044; FIX-L): the answers this module gives to the
   modules that use it and are earlier in the order, stated as data and run against the real code. Each user's hand-built
   value must equal the one stated here; where the real answer differs, the real one wins and the user changes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { listWorld, sweepDef, SEED, doorQuery } from "./fixture.mjs";
import { linkSweepOps, SWEEP_CHECKS } from "../../../src/link-sweep/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const PROJ = "PROJ-2026-0995-contracts";
const LIST = "INFO-2026-0995-list";
const NAME = `${LIST}#minutes`;
const FIELDS = { title: "Council minutes", sources: ["https://records.example.org/council"], seeds: [SEED], match: { terms: ["minutes"] },
                 cadence: "weekly", budget: { per_run: 10, backlog: 20 } };

/* the contract values, as data */
const SWEEP_FENCE = {
  /** a non-member adding a sweep: the refusal as monitoring relays it */
  not_a_member: (author) => ({ ok: false, reason: "SWEEP_NOT_A_MEMBER", code: "SWEEP_NOT_A_MEMBER", check: "C-18.17",
    translation: SWEEP_CHECKS.SWEEP_NOT_A_MEMBER.translation,
    detail: localize("link-sweep.sweep.v1_is_not_a_member", "{v1} is not a member, and only a member adds, removes or changes a sweep; any writer may unratify one. Nothing was written.", { v1: author }),
    sweeps: ["minutes"] }),
  admitted: null,
};
const SWEEP_MUTATE = {
  /** the refusal of a named sweep the file lacks, relayed as given */
  no_such_sweep: (name) => ({ ok: false, reason: "NO_SUCH_SWEEP", code: "NO_SUCH_SWEEP", sweep: name,
    detail: localize("link-sweep.sweep.no_sweep_is_named_string_2", "no sweep is named {String} in this bundle. Nothing was written.", { String: name }) }),
};
const SWEEP_SCOPE = {
  unknown: (name) => ({ ok: false, reason: "unknown", detail: localize("link-sweep.sweep.no_sweep_is_named_string", "no sweep is named {String}", { String: name }) }),
  unratified: { ok: false, reason: "unratified" },
  held: { ok: false, reason: "held", detail: localize("link-sweep.sweep.the_sweep_s_backlog_is", "the sweep's backlog is at or over its limit") },
  out_of_scope: (locator) => ({ ok: false, reason: "out-of-scope", detail: localize("link-sweep.sweep.string_is_outside_the_sweeps", "{String} is outside the sweep's sources", { String: locator }) }),
  no_locator: { ok: false, reason: "out-of-scope", detail: localize("link-sweep.sweep.no_locator_was_named", "no locator was named") },
  in_scope: (sources) => ({ ok: true, scope: sources }),
};

// fixtures-run: monitoring sweep-fence
test("R3 contract sweep-fence: the fence answers SWEEP_NOT_A_MEMBER for a non-member's change, and null when it admits", () => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [] });
  const next = JSON.stringify({ sweeps: [sweepDef({ ratified: false })] });
  for (const author of ["token:daemon", "class:daemon", ""]) {
    assert.deepEqual(w.s.sweepFence({ bundleId: LIST, author }, next),
      SWEEP_FENCE.not_a_member(author || "an unnamed writer"), `author ${JSON.stringify(author)}`);
  }
  assert.equal(w.s.sweepFence({ bundleId: LIST, author: "member:bob" }, next), SWEEP_FENCE.admitted, "a member's unratified sweep is admitted");
  assert.equal(w.s.sweepFence({ bundleId: LIST, author: "token:daemon" }, JSON.stringify({ sweeps: [] })), SWEEP_FENCE.admitted, "nothing changed: not asked");
});

// fixtures-run: monitoring sweep-mutate
test("R13 contract sweep-mutate: a named sweep the file lacks is refused NO_SUCH_SWEEP, and the refusal reaches the caller as given", async () => {
  const { w } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef({ id: "minutes", ratified: false })] });
  const q = doorQuery("sweepset", "member:alice");
  const nothing = `${LIST}#nothing`;
  const before = w.manifest(LIST).length;
  const r = await linkSweepOps(w.s, new URL("http://do/?" + q), { bundle: LIST, sweep: nothing, ...FIELDS }).sweepset();
  assert.deepEqual(r, SWEEP_MUTATE.no_such_sweep(nothing));
  const rr = await linkSweepOps(w.s, new URL("http://do/?" + doorQuery("sweepratify", "member:alice")),
    { sweep: nothing, ratified: true }).sweepratify();
  assert.deepEqual(rr, SWEEP_MUTATE.no_such_sweep(nothing));
  assert.equal(w.manifest(LIST).length, before, "nothing was written");
});

// fixtures-run: capture-requests sweep-scope
test("R12 contract sweep-scope: the registered check answers {ok:false, reason: unknown|unratified|held|out-of-scope, detail?} or {ok:true, scope}; in scope is equal or continues at a /", async () => {
  const sources = ["https://records.example.org/council"];
  const { w, write } = listWorld({ list: LIST, project: PROJ, sweeps: [sweepDef({ id: "minutes", sources })] });
  assert.equal(w.captureRequests.registered.length, 1);
  assert.equal(w.captureRequests.registered[0].module, "link-sweep");
  const check = w.captureRequests.registered[0].fn;
  const ask = (locators, sweep = NAME) => check({ sweep, locators, run: "RUN-1", target: "x" });
  /* the in-scope rule: equal, or continuing at a / */
  for (const ok of ["https://records.example.org/council", "https://records.example.org/council/", "https://records.example.org/council/m/1.pdf"])
    assert.deepEqual(await ask([ok]), SWEEP_SCOPE.in_scope(sources), ok);
  for (const out of ["https://records.example.org/councilor", "https://records.example.org/", "https://other.example.org/council/x"])
    assert.deepEqual(await ask([out]), SWEEP_SCOPE.out_of_scope(out), out);
  assert.deepEqual(await ask(["https://records.example.org/council/a", "https://records.example.org/councilor"]),
    SWEEP_SCOPE.out_of_scope("https://records.example.org/councilor"), "one locator out refuses the request");
  assert.deepEqual(await ask([]), SWEEP_SCOPE.no_locator);
  assert.deepEqual(await ask(["https://records.example.org/council/a"], `${LIST}#nope`), SWEEP_SCOPE.unknown(`${LIST}#nope`));
  /* unratified */
  assert.equal(write([sweepDef({ id: "minutes", sources, ratified: false })]).ok, true);
  assert.deepEqual(await ask(["https://records.example.org/council/a"]), SWEEP_SCOPE.unratified);
  /* held: a ratified sweep whose backlog is at its limit */
  assert.equal(write([sweepDef({ id: "minutes", sources })], { author: "member:alice" }).ok, true);
  w.capture.heldCount = () => 1000;
  assert.deepEqual(await ask(["https://records.example.org/council/a"]), SWEEP_SCOPE.held);
});

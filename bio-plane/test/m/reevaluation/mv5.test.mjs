/* M-V5 (plan T33, Measurements; T33-59): the fan-out of a synthetic Legistar re-import through R34. A followed body's
   re-import updates each held event in place and tells `events`' change listeners (events R25, R16); here each of
   EVENTS synthetic meetings, held in the real `events` module, has its `when` moved once, as a re-import with changed
   source values would. Measured per re-imported event: the tellings this module hears, the rows it writes, the
   dependents it names, and the time its listener spends, against the plane's CPU bound (a Durable Object invocation's
   default 30,000 ms; the plane's `wrangler.jsonc` pins no other). It gates nothing in T33 (plan Measurements). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { world, realUpstreams, V } from "./fixture.mjs";
import { EVENT_CHANGED } from "../../../src/reevaluation/index.mjs";

const EVENTS = 240, CITED_EVERY = 4, DEPENDENTS = 3, CPU_BOUND_MS = 30000;

test("R34 R18 M-V5: a synthetic re-import moving every followed event once writes one row per cited event and none for the rest, names only direct dependents, and its listener stays far inside the plane's CPU bound", (t) => {
  const w = world({ upstreams: realUpstreams });
  w.member("alice");
  const ev = w.up.events;
  const ids = [];
  for (let i = 0; i < EVENTS; i++) {
    const day = String(1 + (i % 28)).padStart(2, "0"), month = String(1 + Math.floor(i / 28) % 12).padStart(2, "0");
    const e = ev.createEvent({ kind: "meeting", attestations: [{ testimony: `meeting ${i} as the agenda listed it`, value: `2025-${month}-${day}` }],
                               by: V("alice") });
    assert.equal(e.ok, true);
    ids.push(e.event_id);
  }
  let deps = 0;
  ids.forEach((id, i) => {
    if (i % CITED_EVERY) return;
    for (let d = 0; d < DEPENDENTS; d++) {
      w.replayed(`INQ-2026-${String(1000 + i * DEPENDENTS + d)}-dep`, [{ target: id }]);
      deps++;
    }
  });
  /* the listener as the factory registered it, timed */
  const heard = { calls: 0, kept: 0, dependents: 0, ms: 0, max: 0 };
  const listen = w.r.eventChanged.bind(w.r);
  w.r.eventChanged = (e) => {
    const t0 = performance.now();
    const out = listen(e);
    const ms = performance.now() - t0;
    heard.calls++; heard.ms += ms; heard.max = Math.max(heard.max, ms);
    if (out.kept) { heard.kept++; heard.dependents += out.dependents; }
    return out;
  };
  const told = [];
  w.r.onBasisChanged("count", (x) => { if (x.kind === EVENT_CHANGED) told.push(x); });
  w.clock.now = "2026-10-01T00:00:00Z";
  const rowsBefore = w.count("reevaluation_event_changes");
  for (const id of ids) {
    const a = ev.attest({ eventId: id, attestation: { testimony: "the re-imported row states a new start", value: "2026-01-15" }, by: V("alice") });
    assert.equal(ev.chooseGoverning({ eventId: id, attestationId: a.attestation_id, reason: "re-import", by: V("alice") }).ok, true);
  }
  const cited = Math.ceil(EVENTS / CITED_EVERY);
  const rows = w.count("reevaluation_event_changes") - rowsBefore;
  assert.equal(heard.calls, EVENTS, "one telling per re-imported event");
  assert.equal(rows, cited, "one row per cited event; none for an event nothing rests on");
  assert.equal(heard.dependents, deps);
  assert.equal(told.length, cited);
  assert.ok(told.every((x) => x.dependents.length === DEPENDENTS), "direct dependents only");
  assert.ok(heard.ms < CPU_BOUND_MS, `${heard.ms} ms`);
  const read0 = performance.now();
  const all = w.r.reevaluations({ viewer: "class:admin" });
  const readMs = performance.now() - read0;
  assert.equal(all.count, deps);
  t.diagnostic(`M-V5: ${EVENTS} events re-imported, ${cited} cited (${DEPENDENTS} dependents each): tellings ${heard.calls}, `
    + `rows ${rows} (${(rows / EVENTS).toFixed(2)} per event), dependents named ${heard.dependents} `
    + `(${(heard.dependents / EVENTS).toFixed(2)} per event); listener ${heard.ms.toFixed(1)} ms in all, `
    + `${(heard.ms / EVENTS).toFixed(3)} ms per event, ${heard.max.toFixed(2)} ms at most; the untargeted read of the `
    + `${all.count} obligations ${readMs.toFixed(1)} ms; bound ${CPU_BOUND_MS} ms`);
});

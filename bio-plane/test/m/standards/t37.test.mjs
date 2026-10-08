/* standards: T37's binding through an adoption (R43 as written, read with R20, R40 and R51; T37-35, N769, K2150). An
   adoption by a body puts a standard in force on it only while the adopted version is itself in force on the date.
   Driven at the module's interface over the test profile (`test-port-ellery`). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, REASON } from "./fixture.mjs";

const PAGE0 = { kind: "pdf-page", page: 0 };
const MHS = "MHS 101-2020 edition";

/* a body (an entity), its adopting ordinance, and an adoption of `standard` by it from `from` */
function adopter(w) {
  const body = w.entity("Port Ellery Selectboard");
  const at = w.passage().contentId;
  const act = w.declare({ cite: "PEBL § 80", text: [at], issuer: body }).id;
  const adopt = (standard, from, edition = "2020") =>
    w.s.adoptionRecord({ standard, act, edition, from, mode: "by_reference", citation: at, reason: REASON, author: V("bob"),
                         viewer: V("bob") });
  return { body, adopt };
}

test("R43 R20 an adopted standard binds the body only while its version is in force: adopted, then ended, it binds no longer (not_in_force after its stated end, never binds); before the adoption a standard is a benchmark", () => {
  const w = seeded();
  const { body, adopt } = adopter(w);
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: "2025-12-31" } }).id;
  const a = adopt(std, "2022-01-01");
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  const b = (date) => w.s.bindsAt({ standard: std, body, date, viewer: V("carol") });
  assert.equal(b("2021-06-01").state, "benchmark", "before the adoption");
  const on = b("2024-06-01");
  assert.equal(on.state, "binds");
  assert.match(on.why, new RegExp(`adopted it \\(${a.adoption.id}\\), effective 2022-01-01, and it is in force on 2024-06-01`));
  assert.ok(on.rests_on.some((x) => x.adoption === a.adoption.id), "names the adoption it rests on");
  assert.equal(b("2025-12-31").state, "binds", "the last day of its period");
  /* adopted, then ended: the version is not in force, so the adoption no longer puts it in force */
  const ended = b("2026-01-01");
  assert.equal(w.s.inForceAt({ standard: std, date: "2026-01-01" }).state, "not_in_force");
  assert.equal(ended.state, "benchmark", "a standard kind nothing puts in force is a benchmark, never binding");
  assert.equal(ended.says.binding, "Benchmark · not binding on Port Ellery Selectboard");
  assert.ok(ended.rests_on.some((x) => x.adoption === a.adoption.id));
  /* an adopted ordinance (a law kind) that has ended is undetermined as to binding, never a benchmark and never binds */
  const law = w.declare({ cite: "PEBL § 90", issuer: "State", period: { from: "2020-01-01", to: "2023-12-31" } }).id;
  assert.equal(adopt(law, "2021-01-01").ok, true);
  const lb = (date) => w.s.bindsAt({ standard: law, body, date, viewer: V("carol") }).state;
  assert.deepEqual([lb("2022-01-01"), lb("2024-01-01")], ["binds", "undetermined"]);
  /* an adoption whose start is not read: undetermined, never binds */
  const nowhen = w.event();
  const std2 = w.declare({ cite: "MHS 202", kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: "2030-12-31" } }).id;
  assert.equal(adopt(std2, { event: nowhen, edge: "start" }).ok, true);
  assert.equal(w.s.bindsAt({ standard: std2, body, date: "2025-01-01" }).state, "undetermined");
});

test("R43 R51 adopted with a recorded through, the standard binds up to through and is undetermined after it (no end is stated, never not_in_force or binds); a withdrawn record counts for nothing", () => {
  const w = seeded();
  const { body, adopt } = adopter(w);
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  assert.equal(adopt(std, "2022-01-01").ok, true);
  const src = w.passage("portal", { address: "https://ex.org/portal", retrieved: "2026-09-01T18:00:00Z" });
  const rec = w.s.inForceThroughRecord({ standard: std, through: "2026-09-01", source: { captureSha: src.capSha, extent: PAGE0 },
                                         reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const b = (date) => w.s.bindsAt({ standard: std, body, date, viewer: V("carol") });
  const on = b("2026-09-01");
  assert.equal(on.state, "binds");
  assert.match(on.why, /known in force through 2026-09-01/, "names the record it rests on");
  assert.equal(b("2022-01-01").state, "binds");
  const after = b("2026-09-02");
  assert.equal(after.state, "undetermined", "after through");
  assert.match(after.why, /does not state when it ceased to be in force/);
  assert.equal(b("2021-12-31").state, "benchmark", "before the adoption");
  w.s.inForceThroughWithdraw({ record: rec.record.id, reason: REASON, author: V("bob") });
  assert.equal(b("2026-09-01").state, "undetermined", "the record withdrawn");
});

test("R43 R20 adopted with no end stated and no record of it in force, whether the standard binds is undetermined, never binds by default, naming the adoption and why", () => {
  const w = seeded();
  const { body, adopt } = adopter(w);
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const a = adopt(std, "2022-01-01");
  const r = w.s.bindsAt({ standard: std, body, date: "2024-06-01", viewer: V("carol") });
  assert.equal(r.state, "undetermined");
  assert.match(r.why, new RegExp(`adopted it \\(${a.adoption.id}\\), effective 2022-01-01, and the record does not state when it ceased`));
  assert.ok(r.rests_on.some((x) => x.adoption === a.adoption.id));
  assert.notEqual(r.says.binding, "Standard · binds Port Ellery Selectboard");
  /* no start stated either: still undetermined */
  const open = w.declare({ cite: "MHS 303", kind: "standard", issuer: "MHSI", period: { from: null, to: null } }).id;
  assert.equal(adopt(open, "2022-01-01").ok, true);
  assert.equal(w.s.bindsAt({ standard: open, body, date: "2024-06-01" }).state, "undetermined");
});

test("R43 R20 an imposition binds only while both the imposing law and the imposed standard are in force: imposed, then the standard ended, it binds no longer; the standard's end not stated, undetermined", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard");
  const lawText = w.passage().contentId;
  const law = w.declare({ cite: "PEBL § 70", text: [lawText], issuer: "State", period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const impose = (standard) => w.s.impositionRecord({ standard, body, law, citation: lawText, reason: REASON, author: V("bob"), viewer: V("bob") });
  const ended = w.declare({ cite: "Some Code § 4", kind: "statute", issuer: "State", period: { from: "2020-01-01", to: "2024-12-31" } }).id;
  assert.equal(impose(ended).ok, true);
  const b = (standard, date) => w.s.bindsAt({ standard, body, date, viewer: V("carol") });
  const on = b(ended, "2024-06-01");
  assert.equal(on.state, "binds");
  assert.ok(on.rests_on.some((x) => x.law === law));
  assert.equal(b(ended, "2025-06-01").state, "undetermined", "a law nothing puts in force: undetermined, never binds");
  const policy = w.declare({ cite: "Board Rule A12", kind: "policy", issuer: "Marlow Schools Board", period: { from: "2020-01-01", to: "2024-12-31" } }).id;
  assert.equal(impose(policy).ok, true);
  assert.deepEqual([b(policy, "2024-06-01").state, b(policy, "2025-06-01").state], ["binds", "benchmark"]);
  const open = w.declare({ cite: "Board Rule B7", kind: "policy", issuer: "Marlow Schools Board", period: { from: "2020-01-01", to: null } }).id;
  assert.equal(impose(open).ok, true);
  const u = b(open, "2025-06-01");
  assert.equal(u.state, "undetermined");
  assert.match(u.why, new RegExp(`${law} imposes it, and the record does not state when it ceased`));
});

test("R43 R20 an incorporated standard binds only while its own version is in force: incorporated by a binding standard, then ended, it binds no longer; its end not stated, undetermined", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard");
  const bt = w.passage().contentId;
  const own = w.declare({ cite: "PEBL § 30", text: [bt], issuer: body, period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const ended = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: "2024-12-31" } }).id;
  const open = w.declare({ cite: "MHS 404", kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  for (const to of [ended, open])
    assert.equal(w.s.lawRelate({ type: "incorporates", from: own, to, citation: bt, edition: "2020", reason: REASON, author: V("bob") }).ok, true);
  const b = (standard, date) => w.s.bindsAt({ standard, body, date, viewer: V("carol") });
  const on = b(ended, "2024-06-01");
  assert.equal(on.state, "binds");
  assert.ok(on.rests_on.some((x) => x.incorporated_by === own));
  assert.equal(b(ended, "2025-06-01").state, "benchmark", "the incorporated version ended");
  const u = b(open, "2025-06-01");
  assert.equal(u.state, "undetermined");
  assert.match(u.why, new RegExp(`${own} incorporates it and binds .*, and the record does not state when it ceased`));
});

test("R40 R43 an adoption whose act is an event stores the body: the one entity the event concerns or has as decider; that body's adoption binds while the version is in force and editionInForce reads it; an event naming two bodies, or none, stores none", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard"), other = w.entity("Marlow Schools Board");
  const p = w.passage();
  const meeting = (concerns) => {
    const e = w.events.createEvent({ kind: "meeting", concerns, attestations: [{ testimony: "I was there.", value: "2022-01-01" }], by: V("bob") });
    assert.equal(e.ok, true, JSON.stringify(e).slice(0, 300));
    return e.event_id;
  };
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: "2025-12-31" } }).id;
  const adopt = (act) => w.s.adoptionRecord({ standard: std, act, edition: "2020", from: "2022-01-01", mode: "by_reference",
                                              citation: p.contentId, reason: REASON, author: V("bob"), viewer: V("bob") });
  const a = adopt(meeting([body]));
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.adoption.body, body);
  const b = (date) => w.s.bindsAt({ standard: std, body, date, viewer: V("carol") }).state;
  assert.deepEqual([b("2021-06-01"), b("2024-06-01"), b("2026-06-01")], ["benchmark", "binds", "benchmark"]);
  assert.deepEqual([w.s.editionInForce({ standard: std, body, date: "2024-06-01" }).state,
                    w.s.editionInForce({ standard: std, body, date: "2024-06-01" }).adoption.id], ["in_force", a.adoption.id]);
  assert.equal(adopt(meeting([body, other])).adoption.body, null, "two bodies: none guessed");
  assert.equal(adopt(meeting([])).adoption.body, null, "none");
});

/* The first three CONDITION kinds (R3; REC-32) at feedItems' interface, converted from `queue-conditions.test.mjs`'s
   queue-producers share: the governor's cool-off condition (its item contract, its basis, its sentences, its subject the
   host, its documents gathered from that host), a parked capture and a machine-completed document, each clearing for
   every member at once when its own fact stops being true, with nothing written to clear it (R8, R12). The governor
   is a fake that answers `governorHolding({now})` as host-governor R14 does (`cooloff_until > now`); the capture
   ledger a fake in capture R46's shape; the manifest, the register, the captured addresses and membership are real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../../../checks/bio-checks.mjs";

const HOST = "www.example.gov";
const AGENDA = `https://${HOST}/documents/agenda.pdf`;

function corpus() {
  const holds = [];
  const sessions = [];
  const w = world({
    governor: { governorHolding: ({ now }) => holds.filter((h) => h.cooloff_until > now) },
    capture: { liveCaptureSessions: () => [...sessions] },
    provenance: { homeOf: (sha) => (sha === "cap88" ? { bundleId: "INFO-88" } : sha === "capP" ? { bundleId: "PRJ-1" } : null) } });
  w.member("carol"); w.member("dave");
  w.bundle("INFO-88", "information", { title: "Controller memo" });
  w.bundle("INQ-2", "inquiry"); w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project");
  w.leg("INQ-2", "INFO-88"); w.leg("INQ-1", "INQ-2"); w.cite("PRJ-1", "INFO-88");
  w.join("PRJ-1", "carol", { owner: true });
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cap88','INFO-88','snapshots/agenda.pdf','binary',?,10)`, iso(NOW));
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
    AGENDA, AGENDA, "cap88", "direct", iso(NOW), iso(NOW));
  const manifest = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES ('INFO-88', ?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  return { w, holds, sessions, manifest };
}

test("R3: governor-holding-host is the governor's own cool-off, read at the read's instant: the item contract key for key, its basis the governor's row, its subject the host, its documents those captured from it", () => {
  const { w, holds } = corpus();
  assert.equal(w.read("carol").items.some((i) => i.class === "CONDITION"), false, "absent before any machinery fact exists, never stubbed");
  holds.push({ host: HOST, cooloff_until: NOW + 90000, refusals: 1, last_refusal_status: 429, last_refusal_at: NOW - 30000,
               appetite_per_min: 60, granted: 4, refused_total: 1 });
  const gov = byId(w.read("carol"))[`CONDITION::governor-holding-host::${HOST}`];
  assert.deepEqual(["id", "class", "kind", "case", "subject", "summary", "detail", "basis", "age", "assignee", "options"]
    .filter((k) => !(k in gov)), [], "the one item contract, key for key");
  assert.deepEqual([gov.class, gov.kind], ["CONDITION", "governor-holding-host"]);
  assert.deepEqual([gov.case.state, gov.case.ancestors.map((a) => [a.id, a.depth])],
    ["determined", [["INQ-1", 2], ["INQ-2", 1], ["PRJ-1", 1]]], "homed through the walk from the documents behind it");
  assert.deepEqual([gov.basis.source, gov.basis.host, gov.basis.refusals, gov.basis.last_refusal_status, gov.basis.cooloff_until,
    gov.basis.retry_in_ms, gov.basis.last_refusal_at], ["host_governor", HOST, 1, 429, NOW + 90000, 90000, NOW - 30000]);
  assert.deepEqual([gov.basis.detail.includes("OUR OWN machinery"), gov.summary.includes("PACED, not broken"),
    gov.detail.includes("Nothing about the source is being claimed")], [true, true, true],
    "what a condition is for: our machinery, distinguishable from the source failing (D-104)");
  assert.deepEqual([gov.subject.kind, gov.subject.host, gov.subject.id, gov.subject.bundles], ["host", HOST, null, ["INFO-88"]]);
  assert.deepEqual(gov.options, [{ id: "opt", on: ["INFO-88"] }], "the acts on the documents behind it, and none of its own");
  assert.deepEqual([gov.assignee, gov.assignee_role], [null, null]);
  assert.deepEqual(gov.age, { state: "determined", since: iso(NOW - 30000).replace("Z", ".000Z"), ms: 30000 });
  // it resolves by the hold ending, for every member at once: the governor is asked at the read's own instant
  const after = NOW + 90000 + 60000;
  for (const who of ["carol", "dave"]) {
    assert.ok(byId(w.read(who))[`CONDITION::governor-holding-host::${HOST}`], `${who} holds it while the hold lasts`);
    assert.equal(byId(w.read(who, `member:${who}`, { now: after }))[`CONDITION::governor-holding-host::${HOST}`], undefined,
      `the hold expires and it is gone from ${who}'s feed`);
  }
});

test("R3: partial-capture-outstanding is the capture ledger's own row, about the document its bytes were registered under; withheld whole from a viewer who may not see it; gone when the session is", () => {
  const { w, sessions } = corpus();
  sessions.push({ session: "cs_partial", locator: AGENDA, primarySha: "cap88", created: iso(NOW - 5000), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 2, state: { queue: ["a", "b", "c"], discovered: 41, spent: 45 } });
  sessions.push({ session: "cs_project", locator: `https://${HOST}/packet.pdf`, primarySha: "capP", created: iso(NOW), updated: iso(NOW),
                  expires: iso(NOW + 60000), ticks: 1, state: { queue: ["z"] } });
  const c = byId(w.read("carol")), d = w.read("dave");
  const p = c["CONDITION::partial-capture-outstanding::cs_partial"];
  assert.deepEqual([p.subject.kind, p.subject.id], ["bundle", "INFO-88"]);
  assert.deepEqual([p.basis.source, p.basis.session, p.basis.primary_sha, p.basis.bundle_id, p.basis.outstanding,
    p.basis.discovered, p.basis.state_readable], ["capture_sessions", "cs_partial", "cap88", "INFO-88", 3, 41, true]);
  assert.deepEqual([p.detail.includes("primary document is captured"), p.basis.detail.includes("SCRATCH and not record")], [true, true],
    "a partial capture is not a broken one");
  assert.ok(c["CONDITION::partial-capture-outstanding::cs_project"], "carol, who owns the project, gets the condition about its capture");
  assert.equal(byId(d)["CONDITION::partial-capture-outstanding::cs_project"], undefined, "dave gets nothing about it: withheld whole");
  assert.ok(!JSON.stringify(d).includes("PRJ-1"), "the project's id appears nowhere in dave's answer, no count included");
  sessions.length = 0;
  for (const who of ["carol", "dave"])
    assert.ok(!w.read(who).items.some((i) => i.kind === "partial-capture-outstanding"), `the session dropped, it clears for ${who}`);
});

test("R3: capture-completed-unattended is the manifest's sequence, a person's document then a machine's revision, its writer named by the catalogue's one prefix; it clears when a person authors again", () => {
  const { w, manifest } = corpus();
  manifest("k1", "carol", "2026-07-31T12:00:00Z");
  const id = "CONDITION::capture-completed-unattended::INFO-88";
  assert.equal(byId(w.read("carol"))[id], undefined, "a person's own document, written last by a person, raises nothing");
  manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  const u = byId(w.read("carol"))[id];
  assert.deepEqual([u.kind, u.subject.kind, u.subject.id], ["capture-completed-unattended", "bundle", "INFO-88"]);
  assert.deepEqual([u.basis.source, u.basis.started_by, u.basis.completed_by, u.basis.started_created, u.basis.completed_created],
    ["manifest", "carol", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T12:00:00Z", "2026-07-31T18:00:00Z"],
    "both halves of the sequence: who left it and who finished it");
  assert.ok(u.basis.detail.includes("NAMED, never anonymous"));
  assert.deepEqual(u.age, { state: "determined", since: "2026-07-31T18:00:00Z", ms: NOW - Date.parse("2026-07-31T18:00:00Z") });
  assert.ok(byId(w.read("dave"))[id], "a shared fact: every member who sees the document holds it");
  // a document only ever written by a machine was never walked away from
  w.bundle("INFO-99");
  w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INFO-99','m1','revision','b',?,?,'[]')`,
    `${MACHINE_AUTHOR_PREFIX}daemon`, iso(NOW));
  assert.equal(byId(w.read("carol"))["CONDITION::capture-completed-unattended::INFO-99"], undefined);
  // the member comes back
  manifest("k3", "carol", "2026-08-01T09:00:00Z");
  for (const who of ["carol", "dave"]) assert.equal(byId(w.read(who))[id], undefined, `it clears for ${who} when a person authors again`);
});

test("R3, R8: the conditions report and never mutate: two reads answer the same items, and clearing one wrote nothing", () => {
  const { w, holds, sessions, manifest } = corpus();
  holds.push({ host: HOST, cooloff_until: NOW + 1000, refusals: 2 });
  sessions.push({ session: "s", locator: AGENDA, primarySha: "cap88", created: iso(NOW), updated: iso(NOW), expires: iso(NOW + 1), ticks: 1, state: {} });
  manifest("k1", "carol", iso(NOW - 2)); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, iso(NOW - 1));
  const before = w.statements.length;
  const a = w.read("dave").items.map((i) => i.id), b = w.read("dave").items.map((i) => i.id);
  assert.deepEqual(b, a); assert.equal(a.filter((x) => x.startsWith("CONDITION::")).length, 3);
  assert.ok(!w.statements.slice(before).some((q) => /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(q)));
});

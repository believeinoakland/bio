/* actions at the write: its check and projection inside every promotion (R1–R11, R33), driven through promotion. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP } from "./fixture.mjs";

const A = "ACTN-2026-0001-a";
const md = (lines, opts) => actionMd(A, [...CP, "action_kind: records_request", ...lines], opts);

test("R1 a machine may not state, change or drop a member's tier; carrying it forward lands (C-32.19)", () => {
  const w = world();
  const m = w.promote(A, md(["risk_tier: 1"]), { author: MACHINE });
  assert.equal(m.reason, "MACHINE_CANNOT_SET_RISK_TIER"); assert.equal(m.check, "C-32.19");
  const u = w.promote(A, actionMd(A, [...CP, "action_kind: records_request"]), { author: "" });
  assert.equal(u.ok, true, "an unset tier left unset lands, even unstamped");
  assert.equal(w.a.actionRiskTier({ target: A, tier: 2, reason: "exposure", viewer: V("alice"), author: V("alice") }).ok, true);
  const text = w.text(A);
  assert.equal(w.promote(A, text.replace("An action.", "An action, revised."), { author: MACHINE }).ok, true, "carried forward");
  const drop = w.promote(A, w.text(A).replace(/^risk_tier: 2$/m, "risk_tier: undetermined"), { author: MACHINE });
  assert.equal(drop.reason, "MACHINE_CANNOT_SET_RISK_TIER");
  /* D-505: the envelope cannot hide the document's own type. */
  const env = w.st.sql;
  const r = w.promotion.promote({ bundleId: "ACTN-2026-0002-b", base: null, snapKey: "e1", author: MACHINE,
    files: [{ path: "bundle.md", text: actionMd("ACTN-2026-0002-b", [...CP, "action_kind: other", "risk_tier: 1"]) }],
    meta: { object_type: "information" } });
  assert.equal(r.ok, false, "refused: promotion's envelope rule or this module's fence, never landed"); void env;
});

test("R1 a member's revision may not change the tier or its history outside the act (C-90.1)", () => {
  const w = world();
  w.action(A, ["risk_tier: 3"]);
  const r = w.promote(A, w.text(A).replace(/^risk_tier: 3$/m, "risk_tier: 1"));
  assert.equal(r.reason, "RISK_TIER_REWRITTEN"); assert.equal(r.check, "C-90.1");
  const c = w.promote("ACTN-2026-0003-c", actionMd("ACTN-2026-0003-c", [...CP, "action_kind: other",
    "risk_tier_history:", "  - tier: 2", "    prior: 1", '    by: "member:alice"', '    at: "2026-09-01T00:00:00Z"', '    reason: "x"']));
  assert.equal(c.reason, "RISK_TIER_REWRITTEN", "a creation states no history");
});

test("R1 legs, ledger and responds_to are refused by name, each with findings (C-2.10, C-6.1)", () => {
  const w = world();
  w.doc("INFO-2026-0001-d");
  assert.equal(w.promote(A, md(["action_basis:", "  - target: NOPE", "    kind: rests_on"])).reason, "ACTION_BASIS_REFUSED");
  assert.equal(w.promote(A, md(["action_basis:", "  - target: ACTN-2026-0009-z", "    kind: rests_on"])).reason, "ACTION_BASIS_REFUSED", "an action is never a leg's target");
  assert.equal(w.promote(A, md(["action_basis:", "  - target: INFO-2026-0404-gone", "    kind: rests_on"])).reason, "ACTION_BASIS_REFUSED", "a target the record does not hold");
  const rfc = w.promote(A, actionMd(A, [...CP, "action_kind: request_for_comment"]));
  assert.equal(rfc.reason, "ACTION_BASIS_REFUSED", "a request for comment names its inquiries and a clock entry (DEC-13)");
  assert.ok(rfc.findings.length >= 2);
  const both = w.promote(A, md(["correspondence:", "  - direction: sent", "    at: 2026-09-02", `    artifact_sha: ${"a".repeat(64)}`, '    account: "x"', "    author: member:alice"]));
  assert.equal(both.reason, "CORRESPONDENCE_REFUSED");
  const unreg = w.promote(A, md(["correspondence:", "  - direction: received", "    at: 2026-09-02", `    artifact_sha: ${"b".repeat(64)}`, "    author: member:alice"]));
  assert.equal(unreg.reason, "CORRESPONDENCE_REFUSED", "a hash the register does not hold");
  const info = ["---", "id: INFO-2026-0002-e", "object_type: information", "title: e", "current_state: collected",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "references:", "  - rel: responds_to",
    "    target: INFO-2026-0001-d", "    status: confirmed", '    note: ""', "---", "", "x", ""].join("\n");
  assert.equal(w.promote("INFO-2026-0002-e", info).reason, "RESPONDS_TO_REFUSED");
  assert.equal(w.promote("INFO-2026-0002-e", info.replace("target: INFO-2026-0001-d", "target: ACTN-2026-0404-gone")).reason, "RESPONDS_TO_REFUSED");
  assert.equal(w.promote(A, md(["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"])).ok, true, "negative control");
});

test("R2 governing laws change only through the act, replay included (C-73.1)", () => {
  const w = world();
  const c = w.promote(A, md(["governing_laws:", "  - level: state", '    citation: "X"', 'governing_laws_by: "member:alice"', 'governing_laws_at: "2026-09-01T00:00:00Z"']));
  assert.equal(c.reason, "GOVERNING_LAWS_REWRITTEN"); assert.equal(c.check, "C-73.1");
  w.action(A);
  assert.equal(w.a.actionLaws({ target: A, laws: [{ level: "city", citation: "Bylaw 4" }], viewer: V("alice"), author: V("alice") }).ok, true);
  const edit = w.text(A).replace('citation: "Bylaw 4"', 'citation: "Bylaw 5"');
  assert.equal(w.promote(A, edit).reason, "GOVERNING_LAWS_REWRITTEN");
  assert.equal(w.promote(A, edit, { extra: { replay: true } }).reason, "GOVERNING_LAWS_REWRITTEN", "replay is not exempt");
  assert.equal(w.promote(A, w.text(A).replace("An action.", "Revised.")).ok, true, "carried forward lands");
});

test("R3 legs, ledger and quotes are replaced whole from the document; no server time but recorded_at", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(A, ["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on", '    note: "why"', "    date: 2026-09-01",
    "correspondence:", "  - direction: sent", "    at: 2026-09-02", '    account: "asked"', "    author: member:alice",
    "  - direction: received", "    at: 2026-09-05", `    artifact_sha: ${s}`, '    quote_amount: "12.50"', '    quote_currency: "USD"',
    "    quote_answers: 0", "    author: member:alice"]);
  const legs = w.rows(`SELECT * FROM action_basis WHERE bundle_id=?`, A);
  assert.deepEqual(legs.map((l) => [l.ord, l.target_id, l.target_type, l.kind, l.note, l.at]), [[0, "INFO-2026-0001-d", "information", "rests_on", "why", "2026-09-01"]]);
  const led = w.rows(`SELECT * FROM correspondence WHERE bundle_id=? ORDER BY ord`, A);
  assert.equal(led.length, 2); assert.equal(led[1].artifact_bundle_id, "INFO-2026-0001-d"); assert.equal(led[0].recorded_at, null);
  const q = w.rows(`SELECT * FROM action_quotes WHERE bundle_id=?`, A);
  assert.equal(q.length, 1); assert.equal(q[0].value, 12.5); assert.equal(q[0].counterparty, "Town Clerk, Town of Port Ellery");
  w.promote(A, w.text(A).replace(/action_basis:\n  - target: INFO-2026-0001-d\n    kind: rests_on\n    note: "why"\n    date: 2026-09-01\n/, ""));
  assert.equal(w.rows(`SELECT * FROM action_basis WHERE bundle_id=?`, A).length, 0, "replaced whole");
});

test("R4 law rides a records_request only, a citation; an old kind reads as written; R6 at the write (C-73.6)", () => {
  const w = world();
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: other", 'law: "Act 1"'])).reason, "RECORDS_LAW_REFUSED");
  const long = w.promote(A, md([`law: "${"x".repeat(201)}"`]));
  assert.equal(long.reason, "RECORDS_LAW_REFUSED"); assert.equal(long.check, "C-73.6"); assert.ok(long.findings.length);
  assert.equal(w.promote(A, md(['law: "Freedom of Records Act (test) s.3"'])).ok, true);
  assert.equal(w.a.actionRead({ id: A, viewer: V("alice") }).records_law.state, "stated");
  /* an action written before with a kind no longer offered reads byte-identically (a replay holds it). */
  const old = actionMd("ACTN-2026-0005-o", ["counterparty:", "  state: named", "  name: City Clerk", "action_kind: cpra_request"]);
  assert.equal(w.promote("ACTN-2026-0005-o", old, { extra: { replay: true } }).ok, true);
  assert.equal(w.text("ACTN-2026-0005-o"), old);
  assert.equal(w.a.actionRead({ id: "ACTN-2026-0005-o", viewer: V("alice") }).kind, "cpra_request");
  assert.equal(w.promote("ACTN-2026-0005-o", old.replace("An action.", "Revised.")).ok, true, "a revision carries the old kind");
});

test("R5 a machine may not state, change or remove a records law; one stated before reads MACHINE-STATED (C-32.20)", () => {
  const w = world();
  const m = w.promote(A, md(['law: "Act"']), { author: MACHINE });
  assert.equal(m.reason, "MACHINE_CANNOT_STATE_RECORDS_LAW"); assert.equal(m.check, "C-32.20");
  assert.equal(w.promote(A, md([]), { author: MACHINE }).ok, true, "a machine may create one stating no law");
  assert.equal(w.promote(A, w.text(A).replace("action_kind: records_request", 'action_kind: records_request\nlaw: "Act"'), { author: MACHINE }).reason, "MACHINE_CANNOT_STATE_RECORDS_LAW");
  const old = "ACTN-2026-0006-m";
  w.promote(old, actionMd(old, [...CP, "action_kind: records_request", 'law: "Act"']), { author: MACHINE, extra: { replay: true } });
  assert.equal(w.a.actionRead({ id: old, viewer: MACHINE }).records_law.state, "machine_stated");
  assert.equal(w.promote(old, w.text(old).replace('law: "Act"\n', ""), { author: MACHINE }).reason, "MACHINE_CANNOT_STATE_RECORDS_LAW", "removal is a change");
});

test("R7 R9 R10 the five C-101 arms at the write; a missing counterparty and a past pending entry land", () => {
  const w = world();
  const k = w.promote(A, actionMd(A, [...CP, "action_kind: grand_jury"]));
  assert.equal(k.reason, "ACTION_KIND_UNKNOWN"); assert.equal(k.check, "C-101.1");
  assert.equal(w.promote(A, actionMd(A, [...CP, "action_kind: bylaw_complaint"])).ok, true, "the profile's kind (R10)");
  const nop = world({ profiles: null });
  assert.equal(nop.promote(A, actionMd(A, [...CP, "action_kind: bylaw_complaint"])).reason, "ACTION_KIND_UNKNOWN", "no profile: product kinds only");
  const B = "ACTN-2026-0007-b", mdB = (l, o) => actionMd(B, ["action_kind: other", ...l], o);
  assert.equal(w.promote(B, mdB([...CP, 'risk_tier: "2"'])).reason, "RISK_TIER_REFUSED");
  assert.equal(w.promote(B, mdB(["counterparty: City Clerk"])).reason, "COUNTERPARTY_REFUSED");
  assert.equal(w.promote(B, mdB(["counterparty:", "  state: named", "  role: to be named", "  body: Town"])).reason, "COUNTERPARTY_REFUSED");
  assert.equal(w.promote(B, mdB(["counterparty:", "  state: named", "  name: City Clerk"])).reason, "COUNTERPARTY_REFUSED", "R9: a new counterparty is an office");
  assert.equal(w.promote(B, mdB(["counterparty:", "  state: undetermined", "  basis: unknown", "  role: Clerk"])).reason, "COUNTERPARTY_REFUSED");
  assert.equal(w.promote(B, mdB(["counterparty:", "  state: undetermined"])).reason, "COUNTERPARTY_REFUSED");
  assert.equal(w.promote(B, mdB([...CP, "  entity_id: PERSON-1"])).reason, "COUNTERPARTY_REFUSED");
  assert.equal(w.promote(B, mdB([...CP], { state: "resolved" })).reason, "ACTION_RESOLUTION_REFUSED");
  const clk = (l) => mdB([...CP, "clock:", ...l]);
  assert.equal(w.promote(B, clk(['  - text: "t"', "    date: 2026-01-01", "    basis: s", "    status: pending"])).reason, "CLOCK_REFUSED");
  assert.equal(w.promote(B, clk(['  - text: "t"', '    description: "d"', "    date: 2026-1-1", "    basis: s", "    status: pending"])).reason, "CLOCK_REFUSED");
  assert.equal(w.promote(B, clk(['  - text: "t"', '    description: "d"', "    date: 2026-01-01", "    status: pending"])).reason, "CLOCK_REFUSED");
  assert.equal(w.promote(B, clk(['  - text: "t"', '    description: "d"', "    date: 2026-01-01", "    basis: s", "    status: late"])).reason, "CLOCK_REFUSED");
  assert.equal(w.promote(B, mdB([])).ok, true, "no counterparty block lands");
  assert.equal(w.promote("ACTN-2026-0008-p", actionMd("ACTN-2026-0008-p", ["action_kind: other", ...CP, "clock:",
    '  - text: "t"', '    description: "d"', "    date: 2020-01-01", "    basis: s", "    status: pending"])).ok, true, "a past pending entry lands");
});

test("R8 a breach action rests on a live determination the author may see, read through conformance (K252)", () => {
  /* the real conformance module on this host: a leg naming no determination it answers is refused. */
  const w = world();
  w.doc("INFO-2026-0001-d");
  const b = w.promote(A, md(["breach: true", "action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"]));
  assert.equal(b.reason, "ACTION_NO_DETERMINATION");
  assert.equal(w.promote(A, md(["breach: false", "action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"])).ok, true,
    "only a breach action is asked (K102)");
  /* determinations in conformance's R9 shape (K252), for the live and the superseded arms. */
  const D1 = "CONF-2026-0001-determination", D2 = "CONF-2026-0002-determination";
  const dets = { [D1]: { ok: true, id: D1, live: true, superseded_by: null }, [D2]: { ok: true, id: D2, live: false, superseded_by: D1 } };
  const x = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } } });
  for (const id of [D1, D2]) {
    const r = x.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } });
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  const leg = (id) => md(["breach: true", "action_basis:", `  - target: ${id}`, "    kind: rests_on"]);
  assert.equal(x.promote(A, leg(D2)).reason, "DETERMINATION_SUPERSEDED");
  assert.equal(x.promote(A, leg(D1)).ok, true, "a live determination");
});

test("R11 a leg onto a document pins the capture presented at the write; a later capture does not move it; an old leg is never back-filled", () => {
  const w = world();
  const s1 = w.doc("INFO-2026-0001-d");
  w.action(A, ["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"]);
  const pinned = () => w.row(`SELECT extent_capture FROM action_basis WHERE bundle_id=?`, A).extent_capture;
  assert.equal(pinned(), s1);
  w.captures.set("INFO-2026-0001-d", "c".repeat(64));
  w.promote(A, w.text(A).replace("An action.", "Revised."));
  assert.equal(pinned(), s1, "a later capture does not change it");
  const B = "ACTN-2026-0009-r";
  w.captures.delete("INFO-2026-0001-d");
  w.promote(B, actionMd(B, [...CP, "action_kind: other", "action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"]));
  w.captures.set("INFO-2026-0001-d", s1);
  w.promote(B, w.text(B).replace("An action.", "Revised."));
  const leg = w.a.actionRead({ id: B, viewer: V("alice") }).basis[0];
  assert.equal(leg.extent_capture, null); assert.equal(leg.version, "undetermined");
});

test("R33 a machine revision moves only a past pending entry to overdue, by the mechanical recheck (C-117.1)", () => {
  const w = world();
  const clock = (st, d = "2026-01-01") => ["clock:", '  - text: "t"', '    description: "d"', `    date: ${d}`, "    basis: s", `    status: ${st}`];
  w.action(A, clock("pending"));
  const recheck = { writer: "mechanical", operation: "deadline-recheck" };
  const met = w.promote(A, w.text(A).replace("status: pending", "status: met"), { author: MACHINE, extra: recheck });
  assert.equal(met.reason, "CLOCK_STATUS_NOT_MECHANICAL"); assert.equal(met.check, "C-117.1");
  const re = w.promote(A, w.text(A).replace("date: 2026-01-01", "date: 2026-12-01"), { author: MACHINE });
  assert.equal(re.reason, "CLOCK_STATUS_NOT_MECHANICAL", "a machine never re-dates an entry");
  const B = "ACTN-2026-0010-f";
  w.action(B, clock("pending", "2027-01-01"));
  assert.equal(w.promote(B, w.text(B).replace("status: pending", "status: overdue"), { author: MACHINE, extra: recheck }).reason,
    "CLOCK_STATUS_NOT_MECHANICAL", "a future date is not past");
});

test("R8 R15 R16 a correspondence on a breach action resting on a live determination the author sees is accepted, over the real conformance (K256)", () => {
  const w = world();
  const p = w.promotion.promote({ base: null, snapKey: "p1", author: V("alice"), ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: ["---", "object_type: project", "schema: project@1", 'title: "Breach"',
      "current_state: forming", "prior_state: null", 'created: "2026-09-27T00:00:00Z"', 'last_updated: "2026-09-27T00:00:00Z"',
      "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n") }], meta: { object_type: "project" } });
  assert.equal(p.ok, true, JSON.stringify(p));
  /* the determination as conformance's determine act leaves it (its tables and its CONF- document); read back by its
     own determinationRead, as the author sees it. */
  const D = "CONF-2026-0001-determination";
  w.st.sql.exec(`INSERT INTO determinations (determination_id, project_id, act_id, act_minted, act_description, act_role,
    act_body, act_at, act_evidence, author, at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    D, p.bundleId, "ACT-2026-0001", 1, "the act", "Town Clerk", "Town of Port Ellery", "2026-09-01", "[]", V("alice"), "2026-09-02T00:00:00Z");
  assert.equal(w.promote(D, ["---", `id: ${D}`, "object_type: determination", `title: ${D}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  assert.equal(w.a.conformance.determinationRead({ id: D, viewer: V("alice") }).live, true, "the real module answers it");
  w.action(A, ["breach: true", "action_basis:", `  - target: ${D}`, "    kind: rests_on"]);
  const c = w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-03", account: "we notified the office",
                                   viewer: V("alice"), author: V("alice") });
  assert.equal(c.ok, true, JSON.stringify(c));
  assert.equal(w.a.actionMove({ target: A, to: "active", reason: "notified", viewer: V("alice"), author: V("alice") }).ok, true);
  /* negative control: an author who cannot see the determination's project is refused by name. */
  const x = w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-04", account: "again", viewer: V("bob"), author: V("bob") });
  assert.equal(x.reason, "ACTION_NO_DETERMINATION");
});

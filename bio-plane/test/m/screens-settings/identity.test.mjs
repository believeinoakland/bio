/* Settings › Who your group is at the module's interface (R14, and R11 over its draft). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, env, identityTable } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();

test("R14 group-identity: reads groupdescription (the whole record) and groupidentity; every member reads it; only an administrator is drawn the acts", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable(), reachable: true });
  assert.ok(a.p.all.some((r) => r.op === "groupdescription") && a.p.all.some((r) => r.op === "groupidentity"));
  assert.ok(a.text.includes("Street repair on Seminary.") && a.text.includes("We keep the city to its word.") && a.text.includes("a tenants' union"));
  has(a, "screen.group-identity.visibility.members");
  assert.deepEqual(ops(a), ["groupdescriptiondraft", "groupdescriptionset"]);
  const m = await open("group-identity", { me: MEMBER, table: identityTable(), reachable: true });
  assert.deepEqual(ops(m), [], "a member is drawn no act");
  assert.ok(m.text.includes("Street repair on Seminary."));
  // the draft only while the assistant is reachable (interface-shell R20)
  const off = await open("group-identity", { me: ADMIN, table: identityTable(), reachable: false });
  assert.deepEqual(ops(off), ["groupdescriptionset"]);
  const none = await open("group-identity", { me: ADMIN, table: identityTable({ groupdescription: env({ description: null, history: [] }) }) });
  lacks(none, "screen.group-identity.none"); // R28: a group that has not said who it is is told nothing of it
});

test("R14 groupdescriptionset sends the whole record: kinds, the other kind, focus, purpose and who sees it", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable() });
  const r = await a.press("groupdescriptionset", { values: { "gi-k-issue": true, "gi-k-community": false, "gi-k-other": false, "gi-other": "", "gi-focus": "Repair.", "gi-purpose": "Accountability.", "gi-v-public": true } });
  assert.deepEqual(r.sent[0].body, { kinds: ["issue"], visibility: "public", focus: "Repair.", purpose: "Accountability." });
});

test("R14 groupdescriptiondraft: the draft filled into the focus and purpose fields, labeled the assistant's, kept only by the administrator's own save; R11 untested beside it only when the answer carries it", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable(), reachable: true });
  const r = await a.press("groupdescriptiondraft", { values: { "gi-q-what": "We track potholes." } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["groupdescriptiondraft", { answers: [{ question: "what", text: "We track potholes." }] }]], "nothing is saved");
  assert.equal(a.b.doc.getElementById("gi-focus").value, "Potholes and street repair in East Oakland.");
  assert.equal(a.b.doc.getElementById("gi-purpose").value, "To hold the city to its repair promises.");
  has(a, "screen.group-identity.draft.label", { handle: "rosa" });
  lacks(a, "ai.label.untested");
  await a.press("groupdescriptionset", {});
  lacks(a, "screen.group-identity.draft.label", { handle: "rosa" });
  const u = await open("group-identity", { me: ADMIN, reachable: true, table: identityTable({ groupdescriptiondraft: () => env({ untested: "untested", focus: { text: "F.", label: { kind: "machine", asked_by: "member:rosa" } }, purpose: { text: "P.", label: { kind: "machine", asked_by: "member:rosa" } } }) }) });
  await u.press("groupdescriptiondraft", { values: { "gi-q-why": "x" } });
  has(u, "ai.label.untested");
  const empty = await a.press("groupdescriptiondraft", { values: { "gi-q-what": "", "gi-q-who": "", "gi-q-why": "" } });
  assert.deepEqual(empty.sent, []);
});

/* R58 (T51; DEC-331 (2), DEC-336 (1), DEC-338): the team's short name is not asked for; the screen says once whether it was recorded */
test("R58 with a recorded group group-identity says once, above its title, that the short name was recorded at installation, and draws no field or act for a short name, to an administrator and to a member", async () => {
  for (const me of [ADMIN, MEMBER]) {
    const a = await open("group-identity", { me, table: identityTable() });
    assert.equal(a.text.split(said("screen.group-identity.seed.recorded")).length, 2, "said once");
    lacks(a, "screen.group-identity.seed.unrecorded");
    assert.ok(a.html.indexOf(said("screen.group-identity.seed.recorded").slice(0, 20)) < a.html.indexOf("<h1"), "above its title");
    assert.ok(!ops(a).includes("instancegroupseed"), "no act for it");
    assert.ok(!all(a.tree, (e) => e.tag === "input" && /short|seed/i.test(e.attrs.id || "")).length, "no field for it");
    assert.ok(!a.p.all.some((r) => r.op === "instancegroupseed"), "nothing of the sort is sent");
  }
});

test("R58 for an older installation answering group null it says the short name is not recorded yet, in its own state, and draws no field", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable({ groupidentity: env({ group: null, display_name: "East Oakland Watch", domain: null, domain_verified_at: null }) }) });
  has(a, "screen.group-identity.seed.unrecorded");
  lacks(a, "screen.group-identity.seed.recorded");
  assert.ok(!ops(a).includes("instancegroupseed"));
  // control: a read that did not answer says neither
  const none = await open("group-identity", { me: ADMIN, table: identityTable({ groupidentity: "none" }) });
  lacks(none, "screen.group-identity.seed.recorded"); lacks(none, "screen.group-identity.seed.unrecorded");
});

/* ---- T51 fix round 2: C87 ---- */

test("R14 C87: Save who your team is with nothing ticked or written sends nothing and names the box; written, it sends (control)", async () => {
  const empty = identityTable({ groupdescription: env({ description: null, history: [] }) });
  const a = await open("group-identity", { me: ADMIN, table: empty });
  const r = await a.press("groupdescriptionset", { values: { "gi-k-issue": false, "gi-k-community": false, "gi-k-other": false, "gi-focus": "  ", "gi-purpose": "" } });
  assert.deepEqual(r.sent, []);
  assert.equal(a.refused.text, said("shell.field.needed", { field: said("screen.group-identity.focus.field") }), a.refused && a.refused.text);
  // a kind alone, or one text box alone, is something to save
  assert.deepEqual((await a.press("groupdescriptionset", { values: { "gi-k-issue": true } })).sent[0].body.kinds, ["issue"]);
  assert.equal((await a.press("groupdescriptionset", { values: { "gi-k-issue": false, "gi-purpose": "Accountability." } })).sent[0].body.purpose, "Accountability.");
});

/* ---- T51 fix round 3: C87 (c) (R14): an empty box is refused before the reason is asked ---- */

test("R14 C87 (c): Save who your team is with an empty box names the box and asks for no reason first; with the box filled the reason is asked (control)", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable({ groupdescription: env({ description: null, history: [] }) }) });
  // the reason is left unanswered: if the shell asked it first, the refusal would never be drawn
  const r = await a.press("groupdescriptionset", { reason: null, values: { "gi-k-issue": false, "gi-k-community": false, "gi-k-other": false, "gi-other": "", "gi-focus": "  ", "gi-purpose": "" } });
  assert.deepEqual(r.sent, [], "nothing is sent");
  assert.equal(r.asked, false, "no reason box is drawn for an empty box");
  assert.equal(a.refused.text, said("shell.field.needed", { field: said("screen.group-identity.focus.field") }), a.refused && a.refused.text);
  // control: a box filled, the act is asked as the shell asks it of an administrator's act, and sends once the reason is given
  const filled = await a.press("groupdescriptionset", { values: { "gi-focus": "Repair." } });
  assert.equal(filled.sent.filter((x) => x.op === "groupdescriptionset").length, 1);
});

test("R14 C87 (c) (interface-shell R119): the other reasoned acts with a required box refuse an empty one before any reason is asked, and send nothing", async () => {
  const F = await import("./fixtures.mjs");
  const cases = [
    ["members", F.membersTable(), "memberadd", {}],
    ["members", F.membersTable(), "websitekeycreate", { "mw-cap": "" }],
    ["group", F.groupTable(), "groupnameset", { "gr-name": " " }],
    ["group", F.groupTable(), "hostingaccessset", { "gr-holders": "" }],
    ["teamai", F.teamaiTable(), "groupkeyset", {}],
  ];
  for (const [screen, table, op, values] of cases) {
    const o = await open(screen, { me: ADMIN, table });
    const r = await o.press(op, { reason: null, values });
    assert.equal(r.asked, false, `${op}: no reason box`);
    assert.deepEqual(r.sent, [], `${op}: nothing sent`);
    assert.ok(o.refused, `${op}: refused beside the act`);
  }
});

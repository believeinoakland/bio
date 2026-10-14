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
  has(none, "screen.group-identity.none");
});

test("R14 groupdescriptionset sends the whole record: kinds, the other kind, focus, purpose and who sees it", async () => {
  const a = await open("group-identity", { me: ADMIN, table: identityTable() });
  const r = await a.press("groupdescriptionset", { values: { "gi-k-issue": true, "gi-k-community": false, "gi-k-other": false, "gi-other": "", "gi-focus": "Repair.", "gi-purpose": "Accountability.", "gi-v-public": true } });
  assert.deepEqual(r.sent[0].body, { kinds: ["issue"], visibility: "public", focus: "Repair.", purpose: "Accountability." });
});

test("R14 groupdescriptiondraft: the draft filled into the focus and purpose fields, labelled the assistant's, kept only by the administrator's own save; R11 untested beside it only when the answer carries it", async () => {
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

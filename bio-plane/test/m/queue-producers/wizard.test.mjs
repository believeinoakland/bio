/* Wizard scripts (R32, R33; N528, DEC-121 (1), (5); K1397) at feedItems' interface. `wizard-scripts.brokenScripts` (its
   R13) and `submittedFor` (its R17) are fakes answering in the shapes K1397 fixes for them, filled per test; membership is
   real, so a script's project owners (membership R65) and the administrators (its R86) are its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const DAY = 86400000;
const page = (entries, extra = {}) => ({ ok: true, entries, cursor: null, truncated: false, ...extra });
const ids = (r, re) => r.items.filter((i) => re.test(i.kind)).map((i) => i.id).sort();
const FORBIDDEN = /\b(obligation|condition|subject|bundle)s?\b/i;

/* olga owns PRJ-1, alice is a member of it and authored the scripts; ada the administrator; PRJ-H a project alice may not see. */
function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("olga"); w.member("hank");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-H", "project");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  w.join("PRJ-H", "hank", { owner: true });
  return w;
}
const REFUSAL = { code: "WIZARD_SCREEN_UNKNOWN", check: "C-131.4", translation: "A step names a screen this copy no longer has." };

test("R32 (wizard-scripts R13; DEC-121 (5)): FINDINGs wizard-withdrawn and wizard-restored, one per entry brokenScripts answers, keyed FINDING::wizard-<kind>::<script>@<version>::<at>, to the script's project owners and its version's author and nobody else; a group script's owners are the administrators", () => {
  const asked = [];
  const entries = [
    { script: "WIZ-a", version: 2, kind: "withdrawn", at: iso(NOW - 3 * DAY), name: "File a records request", project: "PRJ-1", author: "alice", refusal: REFUSAL },
    { script: "WIZ-a", version: 2, kind: "restored", at: iso(NOW - DAY), name: "File a records request", project: "PRJ-1", author: "alice", refusal: null },
    { script: "WIZ-g", version: 1, kind: "withdrawn", at: "not an instant", name: "Comment on an agenda", project: null, author: "bob", refusal: REFUSAL },
    { script: "WIZ-h", version: 1, kind: "withdrawn", at: iso(NOW), name: "Hidden", project: "PRJ-H", author: "alice", refusal: REFUSAL },
    { script: "WIZ-x", version: 1, kind: "broken", at: iso(NOW), name: "x", project: "PRJ-1", author: "alice", refusal: null }];
  const w = people({ wizardScripts: { brokenScripts: (a) => { asked.push(a);
    return a.after ? page(entries.slice(2)) : page(entries.slice(0, 2), { truncated: true, cursor: "c1" }); } } });
  const RE = /^wizard-(withdrawn|restored)$/;
  const A1 = `FINDING::wizard-withdrawn::WIZ-a@2::${iso(NOW - 3 * DAY)}`, A2 = `FINDING::wizard-restored::WIZ-a@2::${iso(NOW - DAY)}`;
  const G = "FINDING::wizard-withdrawn::WIZ-g@1::not an instant";
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer]), [[null, "member:alice"], ["c1", "member:alice"]],
    "wizard-scripts' read, under the viewer, its cursor followed");
  assert.deepEqual(ids(alice, RE), [A1, A2].sort(), "the version's author; never a script of a project she may not see; an unknown kind is no item");
  assert.ok(!JSON.stringify(alice).includes("PRJ-H") && !JSON.stringify(alice).includes("WIZ-h"), "R11");
  assert.deepEqual(ids(w.read("olga"), RE), [A1, A2].sort(), "the script's project owner");
  assert.deepEqual(ids(w.read("bob"), RE), [G], "a project member who is no owner nor author is told nothing of WIZ-a; the author of the group script his");
  assert.deepEqual(ids(w.read("ada"), RE), [G], "a group script's owners are the administrators (K1397)");
  assert.deepEqual(ids(w.read("hank"), RE).length, 1, "the owner of the other project, of its script");
  assert.deepEqual(ids(w.read(null, "class:admin"), RE), [], "a caller with no member is none of them");
  const m = byId(alice);
  const wd = m[A1], rs = m[A2];
  assert.deepEqual([wd.class, wd.kind, rs.class, rs.kind], ["FINDING", "wizard-withdrawn", "FINDING", "wizard-restored"]);
  assert.deepEqual(wd.subject, { kind: "wizard_version", id: "WIZ-a@2", script: "WIZ-a", version: 2, name: "File a records request",
    project: "PRJ-1", refusal: { code: "WIZARD_SCREEN_UNKNOWN", check: "C-131.4", translation: REFUSAL.translation } },
    "its subject the version, naming its name and the first refusal");
  assert.ok(wd.summary.includes("File a records request") && rs.summary.includes("File a records request"), "naming its name");
  assert.ok(wd.detail.includes(REFUSAL.translation), "the first refusal in plain words, the row's translation");
  assert.ok(!rs.detail.includes(REFUSAL.translation) && !("refusal" in rs.subject), "a return names no refusal");
  assert.deepEqual(wd.recipients, ["olga", "alice"]); assert.deepEqual(byId(w.read("ada"))[G].recipients, ["ada", "bob"]);
  assert.deepEqual(wd.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY });
  assert.equal(byId(w.read("ada"))[G].age.state, "undetermined");
  assert.deepEqual(wd.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the script's project");
  assert.deepEqual(byId(w.read("ada"))[G].case.ancestors, [], "a group script has no project home");
  assert.equal(wd.basis.source, "wizard-scripts.brokenScripts");
  for (const it of [wd, rs]) for (const s of [it.summary, it.detail, it.basis.detail, ...it.options.map((o) => o.label)])
    assert.doesNotMatch(s, FORBIDDEN, s);
  // raised once and never repeated: the same read twice, and much later, the same items; nothing here makes it leave
  assert.deepEqual(ids(w.read("alice"), RE), ids(alice, RE));
  assert.deepEqual(ids(w.read("alice", "member:alice", { now: NOW + 60 * DAY }), RE), ids(alice, RE));
});

test("R33 (wizard-scripts R7, R17; DEC-121 (1)): one OBLIGATION wizard-approval-requested per (version, owner) submittedFor answers the viewer, keyed OBLIGATION::wizard-approval-requested::<script>@<version>::<owner>, to that owner and nobody else; it leaves when approved, withdrawn or retired", () => {
  const asked = [];
  let answered = [
    { script: "WIZ-a", version: 3, owner: "olga", name: "File a records request", author: "alice", submitted_at: iso(NOW - 2 * DAY), project: "PRJ-1" },
    { script: "WIZ-g", version: 1, owner: "ada", name: "Comment on an agenda", author: "bob", submitted_at: "not an instant", project: null },
    { script: "WIZ-h", version: 1, owner: "olga", name: "Hidden", author: "hank", submitted_at: iso(NOW), project: "PRJ-H" }];
  const w = people({ wizardScripts: { submittedFor: (a) => { asked.push(a);
    return a.after ? page(answered.slice(1)) : page(answered.slice(0, 1), { truncated: answered.length > 1, cursor: answered.length > 1 ? "c1" : null }); } } });
  const RE = /^wizard-approval-requested$/;
  const O = "OBLIGATION::wizard-approval-requested::WIZ-a@3::olga", A = "OBLIGATION::wizard-approval-requested::WIZ-g@1::ada";
  const olga = w.read("olga");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer]), [[null, "member:olga"], ["c1", "member:olga"]]);
  assert.deepEqual(ids(olga, RE), [O, "OBLIGATION::wizard-approval-requested::WIZ-h@1::olga"].sort());
  assert.deepEqual(ids(w.read("ada"), RE), [A]);
  assert.deepEqual(ids(w.read("alice"), RE), [], "never the author");
  assert.deepEqual(ids(w.read("bob"), RE), [], "nor another member");
  assert.deepEqual(ids(w.read(null, "class:admin"), RE), []);
  const it = byId(olga)[O];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "wizard-approval-requested"]);
  assert.deepEqual(it.subject, { kind: "wizard_version", id: "WIZ-a@3", script: "WIZ-a", version: 3, name: "File a records request",
    author: "alice", project: "PRJ-1" }, "its subject the version, naming its name and author");
  assert.ok(it.summary.includes("alice") && it.summary.includes("File a records request"));
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "aged from the submission");
  assert.equal(byId(w.read("ada"))[A].age.state, "undetermined");
  assert.deepEqual(it.recipients, ["olga"]);
  assert.deepEqual(it.options.map((o) => o.id), ["wizardapprove"]);
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  /* R11: a script of a project the viewer may not see keeps its item (the approver was asked) but names no project */
  const hid = byId(olga)["OBLIGATION::wizard-approval-requested::WIZ-h@1::olga"];
  assert.equal(hid.subject.project, null); assert.ok(!JSON.stringify(olga).includes('"PRJ-H"'));
  for (const s of [it.summary, it.detail, it.basis.detail, ...it.options.map((o) => o.label)]) assert.doesNotMatch(s, FORBIDDEN, s);
  assert.deepEqual(ids(w.read("olga"), RE), ids(olga, RE), "raised once");
  answered = answered.slice(1);
  assert.ok(!ids(w.read("olga"), RE).includes(O), "approved, withdrawn or retired: the read no longer answers it, and it leaves");
});

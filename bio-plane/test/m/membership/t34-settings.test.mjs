/* T34 (T34-10; DEC-132, DEC-135, DEC-136, Bob's; K1745): addressing a check request (R106), the court-notice setting
   and the joining statement (R107, R108), and the group's own description (R109, R110). At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Membership, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
const rowOf = (r, code) => {
  const row = MEMBERSHIP_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
  assert.match(r.detail, /Nothing was written\./);
};
/* R108 as DEC-149 amended it (T35-14, K1779): "Your group's Civicsmith", never "copy". */
const COURT = "Your group's Civicsmith keeps this from the public and the people the group looks into. A court order "
  + "your group can't defeat could still require it to be shown. Write accordingly.";

/* ---- R106 ---- */

/* ann (CPA confirmed), bob (CPA declared), cal (CPA declared, then revoked), dee (CPA withdrawn), eve (no CPA), fay (CPA
   declared, invited to H). H a hidden project owned by ann; INFO-1 shared evidence; ESC-1 inside H. */
async function checkWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "fay");
  for (const id of ["ann", "bob", "cal", "dee", "fay"]) w.m.expertiseDeclare({ memberId: id, label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "dee", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "dee", label: "CPA", by: "admin", withdraw: true });
  w.m.expertiseDeclare({ memberId: "eve", label: "Engineer" });
  w.m.memberSet({ memberId: "cal", status: "revoked", by: "admin" });
  w.bundle("INFO-1");
  w.project("PROJ-H", "Hidden H");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "fay", by: "ann", viewer: V("ann") });
  w.bundle("ESC-1", "escalation", "an escalation", "PROJ-H");
  return w;
}

test("R106 checkAddressees: every active member whose current state for the label is declared or confirmed and who can see the target, in member-id order", async () => {
  const w = await checkWorld();
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "CPA" }), [
    { memberId: "ann", handle: "ann", state: "confirmed" },
    { memberId: "bob", handle: "bob", state: "declared" },
    { memberId: "fay", handle: "fay", state: "declared" }]);
  /* sight: only those R80 admits to the target reach it */
  for (const target of ["ESC-1", "PROJ-H"])
    assert.deepEqual(w.m.checkAddressees({ target, label: "CPA" }).map((a) => a.memberId), ["ann", "fay"], target);
  /* the label normalised as R21 normalises it */
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "  CPA \t" }), w.m.checkAddressees({ target: "INFO-1", label: "CPA" }));
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "cpa" }), [], "a label is matched as written");
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "Engineer" }), [{ memberId: "eve", handle: "eve", state: "declared" }]);
  /* agreement with R24 and R80, for every member, so the rule is the composition and nothing else */
  for (const target of ["INFO-1", "ESC-1", "PROJ-H"]) {
    const want = [];
    for (const m of w.m.memberList({}).members.filter((x) => x.status === "active")) {
      const e = w.m.expertiseList({ memberId: m.member_id }).expertise.find((x) => x.label === "CPA");
      if (e && (e.state === "declared" || e.state === "confirmed") && w.m.inSight(target, V(m.member_id)))
        want.push({ memberId: m.member_id, handle: m.handle, state: e.state });
    }
    assert.deepEqual(w.m.checkAddressees({ target, label: "CPA" }), want, target);
  }
  /* a target not held, or one nobody can see */
  assert.deepEqual(w.m.checkAddressees({ target: "NOPE-1", label: "CPA" }), []);
  w.project("PROJ-M", "nobody's");
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(w.m.checkAddressees({ target: "PROJ-M", label: "CPA" }), []);
  /* the op */
  assert.deepEqual(w.ops("target=INFO-1&label=CPA").checkaddressees().map((a) => a.memberId), ["ann", "bob", "fay"]);
});

test("R106 an empty label is EXPERTISE_NO_LABEL; it writes nothing, grants nothing and never throws", async () => {
  const w = await checkWorld();
  const row = MEMBERSHIP_CHECKS.EXPERTISE_NO_LABEL;
  for (const label of [undefined, null, "", "   "]) {
    const r = w.m.checkAddressees({ target: "INFO-1", label });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "EXPERTISE_NO_LABEL", "EXPERTISE_NO_LABEL",
      row.check, row.translation]);
  }
  const before = snapshot(w);
  const rights = w.m.sessionRights("member:bob");
  const sees = w.m.inSight("PROJ-H", V("bob"));
  for (const target of [null, undefined, "", 7, {}, [], "INFO-1", "PROJ-H"])
    for (const label of ["CPA", 7, {}, [], null])
      assert.doesNotThrow(() => w.m.checkAddressees({ target, label }));
  assert.doesNotThrow(() => w.m.checkAddressees());
  assert.deepEqual(w.m.checkAddressees({ target: 7, label: "CPA" }), []);
  assert.equal(snapshot(w), before, "writes nothing");
  assert.deepEqual(w.m.sessionRights("member:bob"), rights, "grants no act");
  assert.equal(w.m.inSight("PROJ-H", V("bob")), sees, "grants no sight");
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.checkAddressees({ target: "INFO-1", label: "CPA" }), []);
});

/* ---- R107, R108 ---- */

test("R107 courtNoticeSet: NOT_AN_ADMIN, COURT_NOTICE_UNKNOWN_CHOICE (C-96.34); appended; the latest is the setting, nothing preselected", async () => {
  const w = await world().group("ann");
  assert.deepEqual(w.m.courtNotice(), { choice: null, history: [] }, "nobody has chosen: null, which reads as not telling");
  assert.equal(w.m.courtNoticeSet({ choice: "tell", by: "ann" }).reason, "NOT_AN_ADMIN");
  for (const choice of [undefined, null, "", "Tell", "yes", true, "don't"]) {
    const before = snapshot(w);
    rowOf(w.m.courtNoticeSet({ choice, by: "admin" }), "COURT_NOTICE_UNKNOWN_CHOICE");
    assert.equal(snapshot(w), before);
  }
  const a = w.m.courtNoticeSet({ choice: "dont", by: "admin" });
  assert.deepEqual([a.ok, a.choice, a.by], [true, "dont", "admin"]);
  assert.equal(w.ops("by=second", { choice: "tell" }).courtnoticeset().ok, true);
  const n = w.ops().courtnotice();
  assert.equal(n.choice, "tell");
  assert.deepEqual(Object.keys(n).sort(), ["choice", "history"]);
  assert.deepEqual(n.history.map((h) => [h.choice, h.by]), [["dont", "admin"], ["tell", "second"]]);
  for (const h of n.history) assert.match(h.at, /^\d{4}-/);
  w.m.courtNoticeSet({ choice: "dont", by: "admin" });
  assert.equal(w.m.courtNotice().choice, "dont", "changeable at any time");
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.doesNotThrow(() => broken.courtNotice());
  assert.equal(broken.courtNotice().choice, null);
});

test("R108 R16 while the choice is tell, enrolment's success carries the court statement exactly, once; otherwise the key is absent", async () => {
  const w = await world().group();
  const inv = async (id) => (await w.m.memberAdd({ memberId: id, cover: "c", by: "admin" })).invite;
  const enrol = async (id) => w.m.enroll({ invite: await inv(id), handle: id, password: `${id}-passphrase-x` });
  const none = await enrol("ann");
  assert.deepEqual(none, { ok: true, memberId: "ann", handle: "ann" }, "nobody chose: absent");
  w.m.courtNoticeSet({ choice: "tell", by: "admin" });
  const told = await enrol("bob");
  assert.deepEqual(told, { ok: true, memberId: "bob", handle: "bob", courtStatement: COURT });
  assert.equal(Membership.COURT_STATEMENT, COURT);
  const i = await inv("cal");
  w.m.courtNoticeSet({ choice: "dont", by: "admin" });
  assert.equal("courtStatement" in await w.m.enroll({ invite: i, handle: "cal", password: "cal-passphrase-x" }), false);
  /* once: a second enrolment of the same invitation is refused, so the statement is never given twice */
  w.m.courtNoticeSet({ choice: "tell", by: "admin" });
  const again = await w.m.enroll({ invite: i, handle: "cal2", password: "cal-passphrase-x" });
  assert.equal(again.reason, "NO_SUCH_INVITATION");
  assert.equal("courtStatement" in again, false);
  /* a refused enrolment carries none */
  const d = await inv("dee");
  assert.equal("courtStatement" in await w.m.enroll({ invite: d, handle: "", password: "x".repeat(12) }), false);
});

/* ---- R109, R110 ---- */

test("R109 groupDescriptionSet: refusals in order, each writing nothing; whole records appended; texts trimmed; members by default", async () => {
  const w = await world().group("ann");
  assert.equal(w.m.groupDescriptionSet({ kinds: [], by: "ann" }).reason, "NOT_AN_ADMIN");
  const tries = [
    [{ kinds: undefined }, "GROUP_KIND_UNKNOWN"], [{ kinds: "issue" }, "GROUP_KIND_UNKNOWN"],
    [{ kinds: ["issue", "neighbourhood"] }, "GROUP_KIND_UNKNOWN"], [{ kinds: [null] }, "GROUP_KIND_UNKNOWN"],
    [{ kinds: ["bogus"], otherKind: "", visibility: "x" }, "GROUP_KIND_UNKNOWN"],
    [{ kinds: ["other"] }, "GROUP_KIND_OTHER_EMPTY"], [{ kinds: ["other"], otherKind: "   " }, "GROUP_KIND_OTHER_EMPTY"],
    [{ kinds: ["other"], otherKind: "x".repeat(121) }, "GROUP_DESCRIPTION_TOO_LONG"],
    [{ kinds: [], focus: "f".repeat(1001) }, "GROUP_DESCRIPTION_TOO_LONG"],
    [{ kinds: [], purpose: "p".repeat(4001) }, "GROUP_DESCRIPTION_TOO_LONG"],
    [{ kinds: [], focus: "f".repeat(1001), visibility: "x" }, "GROUP_DESCRIPTION_TOO_LONG"],
    [{ kinds: [], visibility: "everyone" }, "GROUP_VISIBILITY_UNKNOWN"], [{ kinds: [], visibility: "" }, "GROUP_VISIBILITY_UNKNOWN"],
  ];
  for (const [args, code] of tries) {
    const before = snapshot(w);
    rowOf(w.m.groupDescriptionSet({ ...args, by: "admin" }), code);
    assert.equal(snapshot(w), before, JSON.stringify(args).slice(0, 60));
  }
  /* the limits are on the trimmed text, so a long run of spaces is not counted */
  const edge = w.m.groupDescriptionSet({ kinds: ["other", "issue", "other"], otherKind: ` ${"x".repeat(120)} `,
    focus: `  ${"f".repeat(1000)}  `, purpose: `${"p".repeat(4000)}\n`, by: "admin" });
  assert.deepEqual([edge.ok, edge.kinds, edge.otherKind.length, edge.focus.length, edge.purpose.length, edge.visibility],
    [true, ["other", "issue"], 120, 1000, 4000, "members"]);
  const b = w.m.groupDescriptionSet({ kinds: ["professional", "catch-all", "community"], otherKind: "ignored", focus: " ",
    purpose: "  We watch the port. ", visibility: "public", by: "second" });
  assert.deepEqual([b.kinds, b.otherKind, b.focus, b.purpose, b.visibility, b.by],
    [["professional", "catch-all", "community"], null, null, "We watch the port.", "public", "second"]);
  const h = w.m.groupDescription({ viewer: V("ann") }).history;
  assert.equal(h.length, 2, "appended, none overwritten");
  assert.deepEqual(h[0].kinds, ["other", "issue"]);
  assert.deepEqual(Object.keys(h[1]).sort(), ["at", "by", "focus", "kinds", "otherKind", "purpose", "visibility"]);
  assert.equal(w.ops("by=admin", { kinds: [] }).groupdescriptionset().ok, true);
  assert.deepEqual(Membership.GROUP_KINDS, ["professional", "issue", "community", "catch-all", "other"]);
});

test("R110 groupDescription: insiders read the latest and the history; the public only the four texts while public; one with no kind, focus or purpose reads as none", async () => {
  const w = await world().group("ann", "gone");
  w.m.memberSet({ memberId: "gone", status: "revoked", by: "admin" });
  const INSIDERS = [V("ann"), V("second"), "admin", V("admin"), ...["admin", "member", "probe", "daemon", "ai"].map((c) => `${MACHINE_CLASS_PREFIX}${c}`)];
  const PUBLIC = [null, undefined, "", "junk", V("gone"), V("nobody"), `${MACHINE_CLASS_PREFIX}robot`, 42];
  for (const v of INSIDERS) assert.deepEqual(w.m.groupDescription({ viewer: v }), { description: null, history: [] }, String(v));
  for (const v of PUBLIC) assert.deepEqual(w.m.groupDescription({ viewer: v }), { description: null }, String(v));
  w.m.groupDescriptionSet({ kinds: ["issue"], focus: "the 72 bus", purpose: "Because it is late.", by: "admin" });
  const members = w.m.groupDescription({ viewer: V("ann") });
  assert.deepEqual([members.description.kinds, members.description.focus, members.description.visibility, members.history.length],
    [["issue"], "the 72 bus", "members", 1]);
  for (const v of PUBLIC) assert.deepEqual(w.m.groupDescription({ viewer: v }), { description: null }, `members-only: ${String(v)}`);
  w.m.groupDescriptionSet({ kinds: ["issue", "other"], otherKind: "riders", focus: "the 72 bus", purpose: "Because.",
    visibility: "public", by: "admin" });
  for (const v of PUBLIC)
    assert.deepEqual(w.m.groupDescription({ viewer: v }),
      { description: { kinds: ["issue", "other"], otherKind: "riders", focus: "the 72 bus", purpose: "Because." } }, String(v));
  const inside = w.m.groupDescription({ viewer: V("second") });
  assert.deepEqual(inside.description, inside.history[1]);
  assert.deepEqual([inside.description.by, inside.description.visibility], ["admin", "public"]);
  /* public but saying nothing reads as none, to everyone */
  w.m.groupDescriptionSet({ kinds: [], visibility: "public", by: "admin" });
  assert.deepEqual(w.m.groupDescription({ viewer: null }), { description: null });
  assert.equal(w.m.groupDescription({ viewer: V("ann") }).description, null);
  assert.equal(w.m.groupDescription({ viewer: V("ann") }).history.length, 3);
  /* back to members only */
  w.m.groupDescriptionSet({ kinds: ["community"], by: "admin" });
  assert.deepEqual(w.m.groupDescription({ viewer: "junk" }), { description: null });
  /* the founder's spellings are insiders only once the instance is claimed */
  const u = world({ omit: ["claimed"] });
  await u.enrol("solo", "admin", "class:admin");
  u.m.groupDescriptionSet({ kinds: ["issue"], by: "solo" });
  for (const v of ["admin", V("admin")]) assert.deepEqual(u.m.groupDescription({ viewer: v }), { description: null }, v);
  /* writes nothing, never throws; the op passes the stamped viewer */
  const before = snapshot(w);
  for (const v of [...INSIDERS, ...PUBLIC, {}, []]) assert.doesNotThrow(() => w.m.groupDescription({ viewer: v }));
  assert.doesNotThrow(() => w.m.groupDescription());
  assert.equal(snapshot(w), before);
  assert.equal(w.ops(`viewer=${encodeURIComponent(V("ann"))}`).groupdescription().history.length, 4);
  assert.deepEqual(w.ops("").groupdescription(), { description: null });
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.groupDescription({ viewer: "class:admin" }), { description: null });
});

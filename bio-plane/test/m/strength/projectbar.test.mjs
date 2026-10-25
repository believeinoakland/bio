/* A project's own bar, set by a served act (R40; T47-19, N976, K3003), and the two refusals R15 and R40 both answer
   through (K231). Over the real record-core, membership and promotion on a real SQLite database (node:sqlite), so the
   document the act writes is judged by promotion's own write path; `inquiry` is a stand-in in the shape of its Provides
   (this act reads no basis). `promote` is the real one unless a test makes it refuse, to show its refusal is answered
   unchanged. Every test drives the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { strengthOf, strengthOps, STRENGTH_BAR_CHECKS } from "../../../src/strength/index.mjs";
import { storage } from "./fixture.mjs";
import { staleBaseRefusal } from "../promotion/fixtures.mjs";
import { word, localize } from "../../../src/setup-words/index.mjs";

const NOW = "2026-10-13T12:00:00.000Z";
const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const V = (m) => `member:${m}`;
const WHY = "Our readers are the council's own auditors, so every document must be a capture we made ourselves.";

const projMd = (title, extra = []) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: forming", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  `objective: "Find out what happened."`, ...extra, "references: []", "state_history: []", "---", "",
  "## Objective", "", "Find out.", ""].join("\n");

/** One world: alice (owner of P) and bob joined in P; carol invited to P, not joined; dave a member outside it; an
 *  administrator ann outside it; Q a second project of dave's; I an inquiry outside every project. */
function world() {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const real = promotionOf(host, { record, membership, now: () => clock.now });
  real.registerFact("producingGroup", "instance-setup", () => "grp-one");
  const mode = { refuse: null, packages: [] };
  const promotion = {
    registerStep: (...a) => real.registerStep(...a),
    fact: (...a) => real.fact(...a),
    promote: (pkg) => { mode.packages.push(pkg); return mode.refuse ?? real.promote(pkg); },
  };
  const inquiry = { onGrounded: () => ({ ok: true }), restingOn: () => ({ ok: true, dependents: [] }),
                    basisFor: (id) => ({ ok: true, bundleId: id, legs: [] }), earned: () => ({ earned: {} }),
                    legCapped: () => null, subjectEntityOf: () => null };
  const s = strengthOf(host, { record, membership, promotion, inquiry, now: () => clock.now });
  let n = 0;
  const w = {
    st, record, membership, s, clock, mode,
    member(id, role = "member") {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
    },
    project(title, owner, extra = []) {
      const r = real.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title, extra) }, { path: "notes/plan.md", text: "Kept as it is.\n" }],
        meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    join(project, member, state = "joined") {
      st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, 0, 't', 't')`, project, member, state);
    },
    inquiry(id) {
      const text = ["---", `id: ${id}`, "object_type: inquiry", `title: "${id}"`, "current_state: open", "---", "",
                    "## Question", "", "Why?", ""].join("\n");
      const sha = createHash("sha256").update(text, "utf8").digest("hex");
      record.transact(() => record.commit({ bundleId: id, type: "inquiry", title: id, project: null, snapKey: `b${++n}`,
        kind: "promotion", base: EMPTY, author: V("alice"), writer: null, operation: null,
        files: [{ path: "bundle.md", text, sha256: sha, bytes: Buffer.byteLength(text) }], state: "open", priorState: null,
        group: "grp-one", created: clock.now, lastUpdated: clock.now, criticality: null, at: clock.now }));
      return id;
    },
    doc: (id) => record.readFile(id, "bundle.md").text,
    /** What a refused act must leave as it was: the document, the head, the manifest and the group's default. */
    snapshot: (id) => JSON.stringify([record.readFile(id, "bundle.md").text, record.head(id).bundleSha,
      st.sql.exec(`SELECT COUNT(*) AS n FROM manifest`)[0].n, st.sql.exec(`SELECT * FROM group_strength_bar`)]),
  };
  for (const m of ["alice", "bob", "carol", "dave"]) w.member(m);
  w.member("ann", "admin");
  w.P = w.project("Budget watch", "alice");
  w.join(w.P, "bob");
  w.join(w.P, "carol", "invited");
  w.Q = w.project("Parks watch", "dave");
  w.I = w.inquiry("INQ-2026-0001-q");
  return w;
}

/** An act by bob on P, with the control plane's stamps for bob's session. */
const byBob = (w, extra = {}) => ({ project: w.P, capture: "B", connection: "C", reason: WHY, author: "bob",
                                    viewer: V("bob"), identity: V("bob"), ...extra });

test("R40: a joined member sets the project's bar: required_strength and last_updated written, one Session Log entry naming the author, the bar before and after and the reason, promoted at the project's current state; R14 and R16 read it", () => {
  const w = world();
  const before = w.s.projectBar(w.P);
  assert.equal(before.declared, false);
  const r = w.s.projectBarSet(byBob(w));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(Object.keys(r).sort(), ["at", "author", "bar", "bundleSha", "ok", "previous", "project", "reason"]);
  assert.equal(r.project, w.P);
  assert.equal(r.author, "bob");
  assert.equal(r.at, NOW);
  assert.equal(r.reason, WHY);
  assert.deepEqual(r.previous, before, "previous is R14's answer before the act");
  assert.deepEqual(r.bar, w.s.projectBar(w.P), "bar is R14's answer after the act");
  assert.equal(r.bar.declared, true);
  assert.equal(r.bar.capture, "B");
  assert.equal(r.bar.connection, "C");
  assert.equal(r.bundleSha, w.record.head(w.P).bundleSha, "the answer names the promoted revision");
  assert.deepEqual(w.s.strengthBarOf({ project: w.P, viewer: V("carol") }), { ok: true, project: w.P, bar: r.bar });

  const text = w.doc(w.P);
  const fm = parseFrontmatter(text).data;
  assert.deepEqual(fm.required_strength, { capture: "B", connection: "C" });
  assert.equal(fm.last_updated, NOW);
  assert.equal(fm.current_state, "forming", "promoted at the project's current state");
  assert.equal(w.record.head(w.P).currentState, "forming");
  assert.equal(fm.objective, "Find out what happened.", "every other line as it stood");
  assert.match(text, /## Objective\n\nFind out\./);
  const entries = text.match(/^### Session .*$/gm);
  assert.equal(entries.length, 1, "one Session Log entry");
  const log = text.slice(text.indexOf("## Session Log"));
  assert.match(log, new RegExp(`### Session ${NOW} \\| Set the project's bar \\| bob\\n`));
  assert.ok(log.includes(localize("strength.index.changes_the_projects_standard_of_evidence_from",
    "Changes: the project's standard of evidence from {before} to {after}.", { before: "no bar", after: "capture B, connection C" })));
  assert.ok(log.includes(`Reason: ${WHY}`));
  assert.equal(w.record.readFile(w.P, "notes/plan.md").text, "Kept as it is.\n", "the project's other files are kept");

  /* Through promotion: one promotion entry authored by the member, at the project's id and current base. */
  const pkg = w.mode.packages.at(-1);
  assert.equal(pkg.bundleId, w.P);
  assert.equal(pkg.author, "bob");
  assert.equal(pkg.meta.current_state, "forming");
  assert.equal(pkg.actorIdentity, V("bob"));
  assert.equal(pkg.actorViewer, V("bob"));
});

test("R40: a second act names the first bar as previous and adds its own entry (the log only grows); given neither axis it withdraws the bar, written as both axes null, which R14 reads as absent, never a bar of zero, recorded as any other act", () => {
  const w = world();
  const first = w.s.projectBarSet(byBob(w));
  w.clock.now = "2026-10-13T13:00:00.000Z";
  const second = w.s.projectBarSet(byBob(w, { capture: "A", connection: null, reason: "  Raised for the audit.  " }));
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.deepEqual(second.previous, first.bar);
  assert.equal(second.reason, "Raised for the audit.", "the reason judged trimmed and recorded as judged");
  assert.equal(second.bar.capture, "A");
  assert.equal(second.bar.connection, null);
  assert.ok(second.bar.detail.includes(word("strength.map.bar_set_axis", { axis: "connection" })));
  assert.deepEqual(parseFrontmatter(w.doc(w.P)).data.required_strength, { capture: "A", connection: null });

  w.clock.now = "2026-10-13T14:00:00.000Z";
  const gone = w.s.projectBarSet(byBob(w, { capture: null, connection: undefined, reason: "We have no standard yet." }));
  assert.equal(gone.ok, true, JSON.stringify(gone));
  assert.deepEqual(gone.previous, second.bar);
  assert.equal(gone.bar.declared, false, "absent, not a bar of zero");
  assert.equal(gone.bar.source, "none");
  assert.equal(gone.bar.capture, null);
  assert.equal(gone.bar.connection, null);
  assert.equal(gone.bar.detail, localize("strength.index.declares_no_required_evidentiary_strength",
    "{project} declares no required evidentiary strength, so nothing in this case was measured against one. An absent bar is not a bar of zero, and this case makes no claim to have cleared any standard. A project declares its bar by its own act, written into the project's document as an authored, dated, on-the-record entry.",
    { project: w.P }));
  const text = w.doc(w.P);
  assert.deepEqual(parseFrontmatter(text).data.required_strength, { capture: null, connection: null });
  assert.equal(parseFrontmatter(text).data.last_updated, "2026-10-13T14:00:00.000Z");
  assert.equal((text.match(/^required_strength:/gm) || []).length, 1, "one bar in the document");
  const entries = text.match(/^### Session .*$/gm);
  assert.deepEqual(entries, [`### Session ${NOW} | Set the project's bar | bob`,
                             "### Session 2026-10-13T13:00:00.000Z | Set the project's bar | bob",
                             "### Session 2026-10-13T14:00:00.000Z | Withdrew the project's bar | bob"]);
  assert.ok(text.includes(localize("strength.index.changes_the_projects_standard_of_evidence_from",
    "Changes: the project's standard of evidence from {before} to {after}.", { before: `capture A, ${word("strength.map.bar_set_axis", { axis: "connection" })}`, after: "no bar" })));
  assert.equal(w.st.sql.exec(`SELECT COUNT(*) AS n FROM manifest WHERE bundle_id=?`, w.P)[0].n, 4, "creation and three acts");
});

test("R40: a reason with its own line breaks is kept whole in the answer and logged on one line, so it never opens a section of the document", () => {
  const w = world();
  const r = w.s.projectBarSet(byBob(w, { reason: "First line.\n\n## Not a heading\nlast." }));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.reason, "First line.\n\n## Not a heading\nlast.");
  const text = w.doc(w.P);
  assert.ok(!/^## Not a heading/m.test(text));
  assert.ok(text.includes("Reason: First line. ## Not a heading last.\n"));
});

test("R40, R21: the project's bar never reads or changes the group's default, and the group's default never changes a project's bar", () => {
  const w = world();
  const g0 = w.s.strengthBarOf({ viewer: V("ann") });
  assert.equal(g0.bar, null);
  assert.equal(w.s.projectBarSet(byBob(w)).ok, true);
  assert.deepEqual(w.s.strengthBarOf({ viewer: V("ann") }), g0, "the group's default is untouched");
  assert.equal(w.s.strengthBarSet({ capture: "D", connection: "D", reason: "A floor.", author: "ann" }).ok, true);
  const p = w.s.projectBar(w.P);
  assert.equal(p.capture, "B");
  assert.equal(p.connection, "C");
  assert.equal(w.s.projectBar(w.Q).declared, false, "another project's bar is not seeded or set by either act");
});

test("R40: refusals in order, each writing nothing: C-32.9 (empty or machine author), NO_SUCH_PROJECT (absent or unseen), NOT_A_PROJECT, PROJECT_ACT_NOT_A_PARTICIPANT, BAD_GRADE (C-107.2), PROJECT_BAR_NO_REASON (C-107.4); control: the same act accepted", () => {
  const w = world();
  const held = w.snapshot(w.P);
  const refused = (args, code) => {
    const r = w.s.projectBarSet(args);
    assert.equal(r.ok, false, `${code}: ${JSON.stringify(r)}`);
    assert.equal(r.reason, code, JSON.stringify(r));
    assert.equal(w.snapshot(w.P), held, `${code} wrote nothing`);
    return r;
  };
  for (const author of [null, "", "  ", "class:ai", "class:member", "class:ai/tok-1"]) {
    const r = refused(byBob(w, { author }), "MACHINE_CANNOT_DECLARE");
    assert.equal(r.check, "C-32.9");
    assert.equal(r.translation, STRENGTH_BAR_CHECKS.MACHINE_CANNOT_DECLARE.translation);
  }
  /* Asked first: a machine on an absent project, with a bad grade and no reason, is the machine refusal. */
  refused(byBob(w, { author: "class:ai", project: "PROJ-2026-9999-zzz", capture: "Z", reason: "" }), "MACHINE_CANNOT_DECLARE");
  for (const project of [null, "", "PROJ-2026-9999-zzz"]) refused(byBob(w, { project }), "NO_SUCH_PROJECT");
  /* dave may not see P: answered as one that does not exist, exactly as membership answers it (its R78). */
  const unseen = refused(byBob(w, { author: "dave", viewer: V("dave"), identity: V("dave") }), "NO_SUCH_PROJECT");
  const absent = refused(byBob(w, { author: "dave", viewer: V("dave"), identity: V("dave"), project: "PROJ-2026-9999-zzz" }), "NO_SUCH_PROJECT");
  assert.deepEqual({ ...unseen, project: null }, { ...absent, project: null }, "unseen and absent alike");
  assert.ok(!JSON.stringify(unseen).includes("Budget watch"));
  const notProject = refused(byBob(w, { project: w.I }), "NOT_A_PROJECT");
  assert.equal(notProject.object_type, "inquiry");
  /* carol sees P (invited) and has not joined it; a bad grade and no reason are asked after. */
  const fence = refused(byBob(w, { author: "carol", viewer: V("carol"), identity: V("carol"), capture: "Z", reason: "" }),
                        "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(fence.check, "C-56.1");
  /* An administrator who sees nothing of P directs nothing there. */
  refused(byBob(w, { author: "ann", viewer: V("ann"), identity: V("ann") }), "NO_SUCH_PROJECT");
  for (const [capture, connection, axis] of [["E", "B", "capture"], ["B", "b", "connection"], [3, null, "capture"],
                                             [null, "AB", "connection"], ["", null, "capture"]]) {
    const r = refused(byBob(w, { capture, connection, reason: undefined }), "BAD_GRADE");
    assert.equal(r.check, "C-107.2");
    assert.equal(r.axis, axis);
  }
  for (const reason of [undefined, null, 7, ["why"], "", "   ", "x".repeat(2001)]) {
    const r = refused(byBob(w, { reason }), "PROJECT_BAR_NO_REASON");
    assert.equal(r.check, "C-107.4");
    assert.equal(r.code, "PROJECT_BAR_NO_REASON");
    assert.equal(r.translation, STRENGTH_BAR_CHECKS.PROJECT_BAR_NO_REASON.translation);
    assert.equal(r.limit, 2000);
  }
  assert.match(w.s.projectBarSet(byBob(w, { reason: "x".repeat(2001) })).detail, /2001 characters/);
  /* Withdrawing asks for a reason too. */
  refused(byBob(w, { capture: null, connection: null, reason: " " }), "PROJECT_BAR_NO_REASON");
  /* Controls: the same act by a joined member, at the bound, is accepted; the owner may too. */
  assert.equal(w.s.projectBarSet(byBob(w, { reason: "x".repeat(2000) })).ok, true);
  assert.equal(w.s.projectBarSet(byBob(w, { author: "alice", viewer: V("alice"), identity: V("alice") })).ok, true);
});

test("R40: the joined fence asks the control plane's identity stamp when it gives one, else the author's own", () => {
  const w = world();
  const held = w.snapshot(w.P);
  /* bob's name as author, carol's session: the session decides. */
  const r = w.s.projectBarSet(byBob(w, { viewer: V("carol"), identity: V("carol") }));
  assert.equal(r.reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.snapshot(w.P), held);
  /* No identity stamp: the author is asked. */
  const r2 = w.s.projectBarSet(byBob(w, { author: "carol", viewer: V("carol"), identity: null }));
  assert.equal(r2.reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(w.snapshot(w.P), held);
  assert.equal(w.s.projectBarSet(byBob(w, { identity: null })).ok, true, "control: a joined author with no stamp");
});

test("R40: promotion's refusal is answered unchanged, and nothing is written", () => {
  const w = world();
  const held = w.snapshot(w.P);
  const refusal = staleBaseRefusal();
  w.mode.refuse = refusal;
  const r = w.s.projectBarSet(byBob(w));
  assert.equal(r, refusal, "the very answer promotion gave");
  assert.equal(w.snapshot(w.P), held);
  w.mode.refuse = null;
  assert.equal(w.s.projectBarSet(byBob(w)).ok, true, "control: promotion accepting");
});

test("R40, R15 (K231): MACHINE_CANNOT_DECLARE and BAD_GRADE are each one row answered alike by the group's act and the project's; C-32.9's and C-107.2's codes, numbers and translations unchanged", () => {
  const w = world();
  const g = w.s.strengthBarSet({ capture: "B", reason: WHY, author: "class:ai" });
  const p = w.s.projectBarSet(byBob(w, { author: "class:ai" }));
  for (const k of ["ok", "reason", "code", "check", "translation"]) assert.deepEqual(p[k], g[k], k);
  assert.equal(p.check, "C-32.9");
  assert.equal(g.detail, localize("strength.index.the_required_evidentiary_strength_team",
    "the required evidentiary strength is the TEAM's declaration about its own work. A machine credential may not make it. Sign in as a member."));
  assert.equal(p.detail, localize("strength.index.the_required_evidentiary_strength_project",
    "the required evidentiary strength is the PROJECT's declaration about its own work. A machine credential may not make it. Sign in as a member."));
  const gb = w.s.strengthBarSet({ capture: "Q", reason: WHY, author: "ann" });
  const pb = w.s.projectBarSet(byBob(w, { capture: "Q" }));
  for (const k of ["ok", "reason", "code", "check", "translation", "axis", "detail"]) assert.deepEqual(pb[k], gb[k], k);
  assert.equal(pb.check, "C-107.2");
  const machine = STRENGTH_BAR_CHECKS.MACHINE_CANNOT_DECLARE, grade = STRENGTH_BAR_CHECKS.BAD_GRADE;
  assert.equal(machine.where, "src/strength/index.mjs machineCannotDeclare > is-machine-strength-bar");
  assert.equal(grade.where, "src/strength/index.mjs badGrade > is-strength-bar-grade");
  assert.equal(machine.translation, word("refusal.MACHINE_CANNOT_DECLARE"));
  assert.equal(grade.translation, word("refusal.BAD_GRADE"));
});

test("C-107.4, R24, R28: PROJECT_BAR_NO_REASON is this module's row, the next after C-107.3, its where naming the project's act, its translation the list's row for the code", () => {
  const row = STRENGTH_BAR_CHECKS.PROJECT_BAR_NO_REASON;
  assert.equal(row.check, "C-107.4");
  assert.equal(row.where, "src/strength/index.mjs projectBarSet > is-project-bar-reason");
  assert.equal(row.translation, word("refusal.PROJECT_BAR_NO_REASON"));
  assert.doesNotMatch(row.translation, /\b(AND|OR|ground|grounds|partition|conjunct|branch|disjunction)\b|independently sufficient/i);
});

test("R40: op=projectbarset routes the body's bar and the control plane's stamps, never an author, viewer or identity from the body", () => {
  const w = world();
  const url = new URL(`https://plane/x?op=projectbarset&author=bob&viewer=${V("bob")}&identity=${V("bob")}`);
  const r = strengthOps(w.s, url, { project: w.P, capture: "A", connection: "B", reason: WHY,
                                    author: "class:ai", viewer: null, identity: V("carol") }).projectbarset();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.author, "bob");
  assert.equal(r.bar.capture, "A");
  const q = new URL(`https://plane/x?op=projectbarset&project=${w.P}&author=carol&viewer=${V("carol")}&identity=${V("carol")}`);
  assert.equal(strengthOps(w.s, q, { capture: "A", reason: WHY, author: "bob", identity: V("bob") }).projectbarset().reason,
               "PROJECT_ACT_NOT_A_PARTICIPANT", "the project from the query when the body names none; the stamps are the query's");
});

test("R14: a declared bar's detail states each axis once, in words for one not declared (negative control: the doubled axis word T47 removed); an absent bar's detail says a project declares its bar by its own act", () => {
  const w = world();
  assert.equal(w.s.projectBarSet(byBob(w, { capture: "B", connection: null })).ok, true);
  const bar = w.s.projectBar(w.P);
  assert.ok(bar.detail.includes(": capture B, no bar set on the connection axis."), bar.detail);
  assert.doesNotMatch(bar.detail, /capture capture/);
  const none = w.s.projectBar(w.Q);
  assert.equal(none.detail, localize("strength.index.declares_no_required_evidentiary_strength",
    "{project} declares no required evidentiary strength, so nothing in this case was measured against one. An absent bar is not a bar of zero, and this case makes no claim to have cleared any standard. A project declares its bar by its own act, written into the project's document as an authored, dated, on-the-record entry.",
    { project: w.Q }));
  assert.doesNotMatch(none.detail, /bundle\.md/);
});

test("R40: a bar a member wrote by a full revision is replaced in place, read as previous, and the document ends with one bar", () => {
  const w = world();
  const P = w.project("Hand written", "alice", ["required_strength:", "  capture: D", "  connection: C"]);
  w.join(P, "bob");
  const r = w.s.projectBarSet(byBob(w, { project: P, capture: "A", connection: null }));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.previous.capture, "D");
  assert.equal(r.previous.connection, "C");
  const text = w.doc(P);
  assert.equal((text.match(/^required_strength:/gm) || []).length, 1);
  assert.deepEqual(parseFrontmatter(text).data.required_strength, { capture: "A", connection: null });
  assert.ok(text.includes(localize("strength.index.changes_the_projects_standard_of_evidence_from",
    "Changes: the project's standard of evidence from {before} to {after}.", { before: "capture D, connection C", after: `capture A, ${word("strength.map.bar_set_axis", { axis: "connection" })}` })));
});

test("R40: the act promotes at the project's current state, whatever it is (here closed as resolved), and moves no state", () => {
  const w = world();
  const head = w.record.head(w.P);
  const text = w.doc(w.P).replace("current_state: forming", "current_state: closed\nclosed_reason: resolved")
    .replace("prior_state: null", "prior_state: forming");
  const closed = w.s.promotion.promote({ bundleId: w.P, base: head.bundleSha, snapKey: "kclose", author: "bob",
    actorIdentity: V("bob"), actorViewer: V("bob"), meta: { object_type: "project" },
    files: [{ path: "bundle.md", text }, { path: "notes/plan.md", text: "Kept as it is.\n" }] });
  assert.equal(closed.ok, true, JSON.stringify(closed));
  assert.equal(w.record.head(w.P).currentState, "closed");
  const r = w.s.projectBarSet(byBob(w));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(w.record.head(w.P).currentState, "closed");
  const fm = parseFrontmatter(w.doc(w.P)).data;
  assert.equal(fm.current_state, "closed");
  assert.equal(fm.closed_reason, "resolved");
  assert.equal(w.mode.packages.at(-1).meta.current_state, "closed");
});

test("R40: the act never reads the group's default: with one set first, previous is still the project's own absence and the document carries only what the act gave", () => {
  const w = world();
  assert.equal(w.s.strengthBarSet({ capture: "A", connection: "A", reason: "A high floor.", author: "ann" }).ok, true);
  const r = w.s.projectBarSet(byBob(w, { capture: "C", connection: null }));
  assert.equal(r.previous.declared, false);
  assert.equal(r.previous.source, "none");
  assert.deepEqual(parseFrontmatter(w.doc(w.P)).data.required_strength, { capture: "C", connection: null });
});

test("R40: an absent or unseen project is exactly membership.noSuchProject's answer, one not a project R16's NOT_A_PROJECT, and an unjoined author exactly membership.projectAuthority's refusal", async () => {
  const { noSuchProject } = await import("../../../src/membership/index.mjs");
  const w = world();
  assert.deepEqual(w.s.projectBarSet(byBob(w, { project: "PROJ-2026-9999-zzz" })), noSuchProject("PROJ-2026-9999-zzz"));
  assert.deepEqual(w.s.projectBarSet(byBob(w, { author: "dave", viewer: V("dave"), identity: V("dave") })), noSuchProject(w.P));
  assert.deepEqual(w.s.projectBarSet(byBob(w, { project: w.I })),
                   w.s.strengthBarOf({ project: w.I, viewer: V("bob") }));
  assert.deepEqual(w.s.projectBarSet(byBob(w, { author: "carol", viewer: V("carol"), identity: V("carol") })),
                   w.membership.projectAuthority(w.P, V("carol"), "joined", "projectBarSet"));
});

test("R40, R21: the bar gates nothing: a question's pair and its gated read are the same before and after the project's bar is set", () => {
  const w = world();
  const pair0 = w.s.strengthOf(w.I), read0 = w.s.inquiryStrength({ id: w.I, viewer: V("bob") });
  assert.equal(w.s.projectBarSet(byBob(w, { capture: "A", connection: "A" })).ok, true);
  assert.deepEqual(w.s.strengthOf(w.I), pair0);
  assert.deepEqual(w.s.inquiryStrength({ id: w.I, viewer: V("bob") }), read0);
});

test("R28: the sentences the act answers (its bar's detail, and each refusal's translation) carry no analyst's word", async () => {
  const { analystHits } = await import("./vocabulary.mjs");
  const w = world();
  const ok = w.s.projectBarSet(byBob(w));
  const gone = w.s.projectBarSet(byBob(w, { capture: null, connection: null }));
  const refusals = [byBob(w, { author: "class:ai" }), byBob(w, { capture: "Z" }), byBob(w, { reason: "" })]
    .map((a) => w.s.projectBarSet(a).translation);
  for (const t of [ok.bar.detail, ok.previous.detail, gone.bar.detail, ...refusals]) {
    assert.ok(typeof t === "string" && t.length > 20, t);
    assert.deepEqual(analystHits(t), [], t);
  }
});

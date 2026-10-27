/* standards: T50's proposals' project (R58), the members' words by DEC-253's keys (R59) and a found extent minted on the
   declaring member's act (R60) (T50-41; N1085, N1108, N1132, N1177; K3302, K3630; DEC-253). Driven at the module's
   interface over the test profile (`test-port-ellery`). No test here holds a sentence: each word is read by key through
   `setup-words` (`WORD`, `HAS`). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, BYLAW, REASON, sha } from "./fixture.mjs";
import { WORD, HAS } from "./words.mjs";
import { STANDARDS_CHECKS, COPY_STATES, FORCES, POLICY_FORCES, ACCESS_STATES } from "../../../src/standards/index.mjs";

const PAGE0 = { kind: "pdf-page", page: 0 };
const HSO = "HSO 4/21 para 3", MHS = "MHS 101-2020 edition";
const policy = (w, extra = {}) => w.declare({ cite: HSO, kind: "policy", issuer: "Harbour Master", ...extra });
const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const propose = (w, extra) => w.s.standardPropose({ cite: BYLAW, kind: "ordinance", issuer: "Port Ellery Selectboard", why: "It governs permits.",
                                                    proposer: V("carol"), viewer: V("carol"), ...extra });

/* bob's project, carol a participant of it by invitation and join; a second project of bob's */
function projects() {
  const w = seeded();
  const P = w.project("Harbour permits", "bob"), Q = w.project("Another project", "bob");
  const inv = w.membership.projectInvite({ projectId: P, handle: "h_carol", by: "bob", viewer: V("bob") });
  assert.equal(inv.ok, true, JSON.stringify(inv).slice(0, 300));
  assert.equal(w.membership.projectJoin({ projectId: P, by: "carol", viewer: V("carol") }).ok, true);
  return { w, P, Q };
}

test("R58 every item proposalsFor answers carries the project the proposal was made for: two proposals made for a project each answer it, in every state; control: a proposal made for another project and one naming none are not listed, so no item answers project null", () => {
  const { w, P, Q } = projects();
  const one = propose(w, { project: P, text: [w.passage().contentId] }).proposal;
  const two = propose(w, { project: P, cite: "PEBL § 14" }).proposal;
  propose(w, { project: Q, viewer: V("bob"), proposer: V("bob"), cite: "PEBL § 15" });
  propose(w, { cite: "PEBL § 16" });
  assert.equal(w.s.standardAdopt({ proposal: one.id, author: V("bob"), viewer: V("bob"), reason: REASON }).ok, true);
  for (const state of ["open", "adopted", "all"]) {
    const r = w.s.proposalsFor({ project: P, state, viewer: V("carol") });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.ok(r.items.length >= 1, state);
    for (const item of r.items) assert.equal(item.project, P, `${state}: ${item.id}`);
  }
  const all = w.s.proposalsFor({ project: P, state: "all", viewer: V("carol") });
  assert.deepEqual(all.items.map((i) => i.id), [two.id, one.id]);
  assert.ok(!all.items.some((i) => i.project === null || i.project === Q), "no item of another project or of none");
  assert.deepEqual(w.s.proposalsFor({ project: Q, state: "all", viewer: V("bob") }).items.map((i) => [i.cite, i.project]), [["PEBL § 15", Q]]);
});

test("R59 every key this module reads for R45's sentences is held by setup-words (hasWord), and the module's refusal words for the two commitment rows are read by key", () => {
  const keys = [...FORCES, ...POLICY_FORCES].map((f) => `label.standardforce.${f}`)
    .concat(["standard.discretion.holder.none", "label.standardcriteria.stated", "label.standardcriteria.none"],
            ACCESS_STATES.map((a) => `label.standardaccess.${a}`),
            ["label.standardheld.cited", "standard.held.cited.by", "label.standardheld.absent", "standard.held.absent.searched"],
            COPY_STATES.map((c) => `label.standardcopy.${c}`),
            ["standard.binding.binds", "standard.binding.benchmark", "standard.binding.unknown", "standard.binding.body.none",
             "standard.policy.owner", "standard.notpublic", "standard.notpublic.releaseby", "standard.text.withheld", "standard.note",
             "standard.inforce.known", "standard.source.capture", "standard.source.capture.whole"]);
  for (const key of keys) assert.equal(HAS(key), true, key);
  /* control: a key nobody registered is not held, so a word asked of it throws and is never filled in with English */
  assert.equal(HAS("label.standardforce.forbids"), false);
  assert.throws(() => WORD("label.standardforce.forbids"), /UNKNOWN_WORD/);
  assert.equal(STANDARDS_CHECKS.COMMITMENT_AS_HEARD.translation, WORD("refusal.COMMITMENT_AS_HEARD"));
});

test("R59 R45 a provision's force says what label.standardforce.<force> says, a discretion with the holder's label and criteria by label.standardcriteria.<stated|none>, always beside the provision's own words; control: a force that is no discretion carries no criteria", () => {
  const w = seeded();
  const words = "The Harbour Master may waive the fee at their discretion.";
  const t = w.passage("hso", { text: words });
  const holder = w.entity("Harbour Master");
  const crit = w.passage("crit", { text: "Criteria are in Schedule B." });
  const std = policy(w, { text: [t.contentId, crit.contentId], portion: { path: "3", content_id: t.contentId } }).id;
  const base = { standard: std, portion: "3", citation: t.contentId, reason: REASON, author: V("bob"), viewer: V("bob") };
  const none = w.s.forceDeclare({ ...base, force: "discretionary", holder, criteria: "none" });
  assert.deepEqual(none.force.says, { force: WORD("label.standardforce.discretionary", { holder: "Harbour Master" }), beside: words,
                                      criteria: WORD("label.standardcriteria.none") });
  assert.equal(w.s.forceWithdraw({ force: none.force.id, reason: "Criteria exist.", author: V("bob") }).ok, true);
  const stated = w.s.forceDeclare({ ...base, force: "discretionary", holder, criteria: crit.contentId });
  assert.equal(stated.force.says.criteria, WORD("label.standardcriteria.stated"));
  assert.equal(w.s.forceWithdraw({ force: stated.force.id, reason: "Not a discretion.", author: V("bob") }).ok, true);
  for (const force of [...FORCES, "mandatory"]) {
    const f = w.s.forceDeclare({ ...base, force });
    assert.equal(f.ok, true, force);
    assert.deepEqual(f.force.says, { force: WORD(`label.standardforce.${force}`), beside: words });
    assert.equal(w.s.forceWithdraw({ force: f.force.id, reason: "Next.", author: V("bob") }).ok, true);
  }
});

test("R59 R45 access, the copy's state, a policy's owner, a standard held cited or absent (with who cited it and where, and the searches) say what their keys say; control: an ordinance carries no owner and a standard held text no held words", () => {
  const w = seeded();
  const c = w.passage("citer");
  for (const access of ACCESS_STATES) {
    const own = w.passage(`own-${access}`);
    w.actors[own.capSha] = [V("bob")];
    assert.equal(w.declare({ kind: "standard", cite: `${MHS}-${access}`, access, text: [own.contentId] }).says.access, WORD(`label.standardaccess.${access}`), access);
  }
  assert.equal(w.declare({ kind: "standard", cite: MHS }).says.access, undefined, "none stated: no access words");
  for (const copy of COPY_STATES) assert.equal(w.declare({ copy }).says.copy, WORD(`label.standardcopy.${copy}`), copy);
  assert.equal(policy(w).says.owner, WORD("standard.policy.owner", { issuer: "Harbour Master" }));
  const cited = w.declare({ held: "cited", text: [], cited_by: { captureSha: c.capSha, extent: PAGE0 } });
  assert.equal(cited.says.held, WORD("label.standardheld.cited"));
  assert.equal(cited.says.cited_by_words, WORD("standard.held.cited.by", { source: WORD("standard.source.capture", { capture: c.capSha.slice(0, 12), extent: "page 1" }) }));
  const absent = w.declare({ held: "absent", text: [], search: { places: ["the clerk", { captureSha: c.capSha, extent: PAGE0 }] } });
  assert.equal(absent.says.held, WORD("label.standardheld.absent"));
  assert.equal(absent.says.searched_words, WORD("standard.held.absent.searched", {
    where: `the clerk, ${WORD("standard.source.capture", { capture: c.capSha.slice(0, 12), extent: "page 1" })}` }));
  const ordinance = w.declare();
  assert.equal(ordinance.says.owner, undefined);
  assert.equal(ordinance.says.held, undefined);
  assert.equal(ordinance.says.searched_words, undefined);
});

test("R59 R45 binding says standard.binding.binds, .benchmark or .unknown with the body's label, and standard.binding.body.none when the record names no body; control: a read with no body asked still answers", () => {
  const w = seeded();
  const body = w.entity("Port Ellery Selectboard");
  const own = w.declare({ issuer: body, period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const std = w.declare({ cite: MHS, kind: "standard", issuer: "MHSI", period: { from: "2020-01-01", to: null } }).id;
  const law = w.declare({ cite: "Some Code § 4", kind: "statute", issuer: "State", period: { from: "2020-01-01", to: "2040-12-31" } }).id;
  const at = (standard, b = body) => w.s.bindsAt({ standard, body: b, date: "2025-01-01", viewer: V("carol") });
  const label = { body: "Port Ellery Selectboard" };
  assert.deepEqual([at(own).state, at(own).says.binding], ["binds", WORD("standard.binding.binds", label)]);
  assert.deepEqual([at(std).state, at(std).says.binding], ["benchmark", WORD("standard.binding.benchmark", label)]);
  assert.deepEqual([at(law).state, at(law).says.binding], ["undetermined", WORD("standard.binding.unknown", label)]);
  const unnamed = at(law, null);
  assert.equal(unnamed.ok, true);
  assert.equal(unnamed.says.binding, WORD("standard.binding.unknown", { body: WORD("standard.binding.body.none") }));
});

test("R59 R45 a policy kept from the public says standard.notpublic and who can release it (standard.notpublic.releaseby), a reading-room standard's withheld text standard.text.withheld, a read's note standard.note, a version known in force standard.inforce.known with its source named by standard.source.capture (.whole is the fallback when an extent cannot be described); control: a standard seen by every member says none of the first", () => {
  const w = seeded();
  const P = w.project("Source material", "alice");
  const hidden = w.passage("leaked", { text: "Staff shall not discuss the waiver." });
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE content_id=?`, P, hidden.contentId);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, hidden.bundleId);
  const np = policy(w, { text: [hidden.contentId], portion: { path: "3", content_id: hidden.contentId }, author: V("alice"), viewer: V("alice") });
  assert.equal(np.ok, true, JSON.stringify(np).slice(0, 300));
  assert.equal(np.says.public, WORD("standard.notpublic"));
  assert.equal(np.says.release_by_words, WORD("standard.notpublic.releaseby", { who: "alice" }));
  const open = w.declare();
  assert.equal(open.says.public, undefined);
  assert.equal(open.says.release_by_words, undefined);
  /* the note, and the withheld text for a reader who is not a member */
  const own = w.passage("paid", { text: "Section 4 applies." });
  w.actors[own.capSha] = [V("bob")];
  const pay = w.declare({ kind: "standard", cite: MHS, access: "paywalled", text: [own.contentId], requires: [own.contentId] });
  const read = w.s.standardRead({ id: pay.id, viewer: V("carol") });
  assert.equal(read.says.note, WORD("standard.note"));
  assert.equal(read.text_withheld, undefined, "a member reads the words");
  const machine = w.s.standardRead({ id: pay.id, viewer: "class:ai" });
  assert.equal(machine.text_withheld, WORD("standard.text.withheld"));
  /* a version known in force through a date, from a source named in words */
  const src = w.passage("portal", { address: "https://ex.org/portal", retrieved: "2026-09-01T18:00:00Z" });
  const std = w.declare({ cite: "PEBL § 90", period: { from: "2020-01-01", to: null } }).id;
  const rec = w.s.inForceThroughRecord({ standard: std, through: "2026-09-01", source: { captureSha: src.capSha, extent: PAGE0 },
                                         reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const source = WORD("standard.source.capture", { capture: src.capSha.slice(0, 12), extent: "page 1" });
  assert.equal(rec.record.source.says, source);
  const on = w.s.inForceAt({ standard: std, date: "2026-09-01", viewer: V("carol") });
  assert.equal(on.why, WORD("standard.inforce.known", { through: "2026-09-01", source, author: "bob" }));
});

test("R45 K5148 a why names the recording member as a value, never a member: stamp inside the sentence", () => {
  const w = seeded();
  const src = w.passage("portal", { address: "https://ex.org/portal", retrieved: "2026-09-01T18:00:00Z" });
  const std = w.declare({ cite: "PEBL § 91", period: { from: "2020-01-01", to: null } }).id;
  const rec = w.s.inForceThroughRecord({ standard: std, through: "2026-09-01", source: { captureSha: src.capSha, extent: PAGE0 },
                                         reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const on = w.s.inForceAt({ standard: std, date: "2026-09-01", viewer: V("carol") });
  assert.equal(on.why.includes("member:"), false, "no stamp in the sentence");
  assert.ok(on.why.includes("bob"), "the member is named");
  assert.equal(on.in_force_through.says.includes("member:"), false, "the record's own words draw no stamp either");
});

test("R60 'Hold this as a standard' on an uncited passage of a held capture lands with text one content_id, minted by the declaring member and labelled as content labels a member's; a second declaration over it finds the row and mints nothing more", () => {
  const w = seeded();
  const p = w.passage("found", { text: "Fees are set yearly." });
  const match = { capture_sha: p.capSha, extent: { kind: "pdf-page", page: 1 } };
  const rows = w.count("content");
  const r = w.declare({ text: [match] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.text.length, 1);
  assert.notEqual(r.text[0], p.contentId, "a row of its own, for the passage not yet cited");
  assert.equal(w.count("content"), rows + 1, "one row minted");
  const row = w.content.contentRow(r.text[0]);
  assert.deepEqual([row.capture_sha, row.bundle_id, row.mint.by, row.mint.state, row.mint.machine_work],
                   [p.capSha, p.bundleId, V("bob"), "member_marked", false]);
  /* the whole document of a text file, and a second member over the same extent: mint or find, never rewrite (content R13) */
  const doc = w.declare({ cite: "PEBL § 22", text: [{ capture_sha: p.capSha, extent: { kind: "document" } }] });
  assert.equal(doc.ok, true, JSON.stringify(doc).slice(0, 300));
  const rows2 = w.count("content");
  const again = w.declare({ cite: "PEBL § 23", text: [match], author: V("carol"), viewer: V("carol") });
  assert.deepEqual([again.ok, again.text], [true, r.text]);
  assert.equal(w.count("content"), rows2, "nothing minted for a row already held");
  assert.equal(w.content.contentRow(r.text[0]).mint.by, V("bob"), "the first minter stays");
});

test("R60 a refused declaration leaves the content row count unchanged, before the mint (STANDARD_NO_REASON) and after it (a period that ends before it starts); control: an adoption of a proposal mints the same way and is refused the same", () => {
  const w = seeded();
  const p = w.passage("found", { text: "Fees are set yearly." });
  const match = { capture_sha: p.capSha, extent: { kind: "pdf-page", page: 1 } };
  const rows = w.count("content");
  const before = w.snapshot();
  assert.equal(codeOf(w.declare({ text: [match], reason: "" })), "STANDARD_NO_REASON");
  assert.equal(w.count("content"), rows);
  assert.equal(codeOf(w.declare({ text: [match], period: { from: "2030-01-01", to: "2020-01-01" } })), "STANDARD_PERIOD_INVALID");
  assert.equal(w.count("content"), rows, "a row minted on the way to a refusal is taken back");
  assert.deepEqual(w.snapshot(), before, "a refused declaration writes nothing");
  /* the adoption of a proposal naming no text */
  const prop = propose(w, {}).proposal;
  assert.equal(codeOf(w.s.standardAdopt({ proposal: prop.id, author: V("bob"), viewer: V("bob"), reason: REASON, text: [match],
                                         period: { from: "2030-01-01", to: "2020-01-01" } })), "STANDARD_PERIOD_INVALID");
  assert.equal(w.count("content"), rows);
  const adopted = w.s.standardAdopt({ proposal: prop.id, author: V("bob"), viewer: V("bob"), reason: REASON, text: [match] });
  assert.equal(adopted.ok, true, JSON.stringify(adopted).slice(0, 300));
  assert.equal(adopted.text.length, 1);
  assert.equal(w.count("content"), rows + 1);
});

test("R60 STANDARD_TEXT_UNRESOLVED stays for a capture not held, one the author cannot see and an extent content refuses, and mints nothing", () => {
  const w = seeded();
  const open = w.passage("open", { text: "Fees." });
  const P = w.project("Hidden", "alice");
  const secret = w.passage("secret", { text: "Hidden fees." });
  w.st.sql.exec(`UPDATE content SET bundle_id=? WHERE capture_sha=?`, P, secret.capSha);
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, P, secret.bundleId);
  const rows = w.count("content");
  const page1 = { kind: "pdf-page", page: 1 };
  const refused = (text) => {
    const r = w.declare({ text: [text], author: V("carol"), viewer: V("carol") });
    assert.equal(codeOf(r), "STANDARD_TEXT_UNRESOLVED", JSON.stringify(r).slice(0, 200));
    assert.equal(r.translation, STANDARDS_CHECKS.STANDARD_TEXT_UNRESOLVED.translation);
    assert.equal(w.count("content"), rows);
  };
  refused({ capture_sha: secret.capSha, extent: page1 });
  refused({ capture_sha: sha("a capture nobody holds"), extent: page1 });
  refused({ capture_sha: open.capSha, extent: { kind: "pdf-page", page: 9 } });
  /* control: the same extent of the capture she can see lands, and the member who can see the hidden one mints it */
  assert.equal(w.declare({ text: [{ capture_sha: open.capSha, extent: page1 }], author: V("carol"), viewer: V("carol") }).ok, true);
  assert.equal(w.declare({ text: [{ capture_sha: secret.capSha, extent: page1 }], author: V("alice"), viewer: V("alice") }).ok, true);
});

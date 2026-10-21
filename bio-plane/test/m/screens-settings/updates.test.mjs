/* Settings › Updates at the module's interface (R27; instance-setup R89, R90): administrators only. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, UPDATE, env, refuse, updatesTable } from "./fixtures.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const section = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];
const copyButtons = (o) => all(o.tree, (e) => e.tag === "button" && e.attrs["data-shell"] === "bind");

test("R27 an administrator who holds the hosting account: what runs now, the release ready with its security mark, signature and three-part notes, Update and Not now, Skip under a disclosure, the earlier releases", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  assert.ok(a.p.requests.some((r) => r.op === "updatenotice"));
  // Running now: the version, when it was installed and who allowed it, the last check and its note
  const run = section(a, "updates.running.head");
  assert.ok(textOf(run).includes(said("updates.running.release", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "rosa" })));
  assert.ok(textOf(run).includes(said("updates.running.checked", { when: day("2026-10-14T06:10:00Z") })) && textOf(run).includes(said("updates.running.checked_note")));
  // Ready to install
  const ready = section(a, "updates.ready.head");
  assert.ok(textOf(ready).includes(said("updates.ready.release", { version: "0.84.0", date: day("2026-10-11") })));
  const mark = all(ready, (e) => /cs-risk/.test(e.attrs.class || ""))[0];
  assert.ok(mark && textOf(mark) === said("updates.ready.security") && mark.attrs["data-tip"] === said("updates.ready.security_says"), "the security mark, explained by its sentence");
  assert.ok(textOf(ready).includes(said("updates.ready.signed")));
  const dl = all(ready, (e) => e.tag === "dl")[0];
  assert.deepEqual(all(dl, (e) => e.tag === "dt").map(textOf), ["updates.notes.members", "updates.notes.admins", "updates.notes.must"].map((k) => said(k)));
  assert.deepEqual(all(dl, (e) => e.tag === "dd").map(textOf), Object.values(UPDATE.ready.notes));
  assert.ok(textOf(ready).includes(said("updates.notes.plain")));
  // the acts: Update (primary and outward), Not now, Skip this version under a disclosure
  assert.deepEqual(ops(a), ["bootstrap", "runtime", "selftest", "updatelater", "updateskip", "updatestart"], "the choice, and (R68) the copy's three reports");
  const up = acts(a.tree).find((b) => b.attrs["data-act"] === "updatestart");
  assert.equal(up.attrs["data-tone"], "primary");
  assert.equal(a.s.acts.find((x) => x.op === "updatestart").outward, true);
  assert.ok(textOf(up).includes(said("updates.act.update")) && textOf(up).includes(said("mark.outward.means").slice(0, 0)));
  assert.equal(textOf(acts(a.tree).find((b) => b.attrs["data-act"] === "updatelater")).includes(said("updates.act.later")), true);
  const skip = all(ready, (e) => e.tag === "details")[0];
  assert.ok(skip && textOf(all(skip, (e) => e.tag === "summary")[0]) === said("updates.act.skip"), "under a disclosure");
  assert.ok(textOf(skip).includes(said("updates.skip.says", { version: "0.84.0" })) && textOf(skip).includes(said("updates.skip.why")));
  assert.ok(acts(skip).some((b) => b.attrs["data-act"] === "updateskip"));
  assert.equal(all(a.tree, (e) => e.attrs["data-shell"] === "bind").length, 0, "the holder is handed no hand-off");
  // Earlier releases: installed, skipped with its reason as data, and one recorded at setup
  const earlier = section(a, "updates.earlier.head");
  const t = textOf(earlier);
  assert.ok(t.includes(said("updates.earlier.skipped", { version: "0.83.1", date: day("2026-10-02T10:00:00Z"), who: "rosa", reason: "Changes nothing for us; we wait for 0.84." })));
  assert.ok(t.includes(said("updates.earlier.installed", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "rosa" })));
  // R33, R37, R73: an install with no member behind it is drawn by the words that name no one, never "allowed by set at setup"; the setup
  // release (installed the day the copy was set up) says so
  assert.ok(t.includes(said("updates.earlier.installed_setup", { version: "0.82.0", date: day("2026-09-02T10:00:00Z") })), "recorded at setup");
  assert.ok(!t.includes(said("settings.set.setup")), "no \"set at setup\" in a fill");
  assert.ok(!/\badmin\b/.test(t));
});

test("R27 a release without a security fix carries no mark; the notes' last part only when not empty", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable({ ready: { ...UPDATE.ready, security: false, notes: { members: "M.", administrators: "A.", must_do: "" } } }) });
  assert.equal(all(a.tree, (e) => /cs-risk/.test(e.attrs.class || "")).length, 0);
  assert.deepEqual(all(a.tree, (e) => e.tag === "dt").map(textOf), [said("updates.notes.members"), said("updates.notes.admins")]);
  lacks(a, "updates.notes.must");
});

test("R27 nothing ready: updates.none, no Update, Not now or Skip; the running release and the earlier ones still drawn", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable({ ready: null }) });
  has(a, "updates.none");
  assert.deepEqual(ops(a), ["bootstrap", "runtime", "selftest"], "only the copy's three reports (R68)");
  has(a, "updates.running.head");
  has(a, "updates.earlier.head");
  lacks(a, "updates.ready.signed");
});

test("R27 an administrator who does not hold the hosting account: no Update but the hand-off, the link to copy being the address updatestart answers", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable({ viewer_holds: false }) });
  assert.ok(!ops(a).includes("updatestart") || acts(a.tree).filter((b) => b.attrs["data-act"] === "updatestart").every((b) => b.attrs["data-handoff"] === "1"), "no Update");
  assert.equal(acts(a.tree).filter((b) => b.attrs["data-act"] === "updatestart" && b.attrs["data-tone"] === "primary").length, 0);
  has(a, "updates.handoff.head");
  has(a, "updates.handoff.says", { holder: "Rosa Medina" });
  has(a, "updates.handoff.for", { holder: "Rosa Medina" });
  has(a, "updates.handoff.explain", { version: "0.84.0" });
  assert.ok(ops(a).includes("updatelater") && ops(a).includes("updateskip"), "Not now and Skip stay");
  // the link: the address updatestart answers, copied by the kit's control
  const r = await a.press("updatestart", { data: { version: "0.84.0", handoff: "1" } });
  assert.deepEqual(r.sent[0].body, { version: "0.84.0" });
  assert.ok(a.text.includes("https://civicsmith.org/update?release=0.84.0"));
  const copy = copyButtons(a);
  assert.equal(copy.length, 1);
  assert.equal(textOf(copy[0]), said("updates.handoff.copy"));
  assert.equal(all(a.tree, (e) => e.tag === "a" && e.attrs.target === "_blank").length, 0, "nothing is opened for a non-holder");
});

test("R27 Update: on its answer the installer's address is offered in a new browsing context, with no opener and no referrer", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  const r = await a.press("updatestart", { data: { version: "0.84.0" } });
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["updatestart", { version: "0.84.0" }]);
  const link = all(a.tree, (e) => e.tag === "a" && e.attrs.href === "https://civicsmith.org/update?release=0.84.0")[0];
  assert.ok(link, "the address");
  assert.equal(link.attrs.target, "_blank");
  assert.equal(link.attrs.rel, "noopener noreferrer");
  // control: an address that is not https is never offered
  const bad = await open("updates", { me: ADMIN, table: updatesTable({}, { updatestart: (q, b) => env({ ok: true, version: b.version, address: "javascript:alert(1)" }) }) });
  await bad.press("updatestart", { data: { version: "0.84.0" } });
  assert.equal(all(bad.tree, (e) => e.tag === "a" && /^javascript:/.test(e.attrs.href || "")).length, 0);
});

test("R27 R34 Not now sends the version; Skip this version is reasoned: its reason, one line, is sent; none sends nothing", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  assert.deepEqual((await a.press("updatelater", { data: { version: "0.84.0" } })).sent.map((x) => [x.op, x.body]).slice(0, 1), [["updatelater", { version: "0.84.0" }]]);
  assert.equal(a.p.requests.at(-1).op, "updatenotice", "R8: the notice is read again after the act");
  assert.equal(a.s.acts.find((x) => x.op === "updateskip").reasonField, "reason");
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "Changes nothing  for us." }, reason: "Changes nothing for us." })).sent[0].body, { version: "0.84.0", reason: "Changes nothing for us." });
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "  " }, reason: "x" })).sent, []);
  // R34: refused in place by refusal.UPDATE_SKIP_NO_REASON, nothing sent; the retired row is no word of the list
  assert.equal(a.refused.key, "refusal.UPDATE_SKIP_NO_REASON");
  assert.equal(hasWord("screen.updates.skip.noreason"), false);
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "x".repeat(1001) }, reason: "x" })).sent, []);
});

test("R27 controls: a note carrying <script> is drawn as text, never markup; a member who does not administer reads nothing and is told the screen is administrators'; a failed read is drawn failed, never as nothing to install", async () => {
  const evil = "<script>alert(1)</script><img src=x onerror=alert(2)>";
  const a = await open("updates", { me: ADMIN, table: updatesTable({ ready: { ...UPDATE.ready, notes: { members: evil, administrators: evil, must_do: evil } } }) });
  assert.equal(all(a.tree, (e) => e.tag === "script" || e.tag === "img").length, 0, "no element comes of a note");
  assert.ok(textOf(all(a.tree, (e) => e.tag === "dd")[0]) === evil, "the note is its own text");
  const m = await open("updates", { me: MEMBER, table: updatesTable({}, { updatenotice: refuse("NOT_AN_ADMIN") }) });
  assert.ok(!m.p.requests.some((r) => r.op === "updatenotice"), "nothing of the screen's own is read");
  has(m, "screen.updates.admins", { admins: `${said("member.founder.unnamed")}, rosa, lu` });
  assert.deepEqual(acts(m.tree), []);
  const f = await open("updates", { me: ADMIN, table: updatesTable({}, { updatenotice: "none" }) });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  lacks(f, "updates.none");
  // a refused read (an administrator turned away) is not nothing to install either
  const r = await open("updates", { me: ADMIN, table: updatesTable({}, { updatenotice: refuse("STORE_DID_NOT_ANSWER") }) });
  lacks(r, "updates.none");
});

/* R37 (T49; D30 m): every sentence updates draws has every fill filled from its read; none is drawn "allowed by set at setup" */
test("R37 who allowed or skipped a release is a handle when a member did it; an install with no member behind it is drawn without one; the founder by her handle in her own session", async () => {
  const rows = (allowed, skipped) => updatesTable({ running: { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: allowed }, earlier: [
    { version: "0.83.1", skipped_at: "2026-10-02T10:00:00Z", skipped_by: skipped, reason: "We wait." },
    { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: allowed }] });
  const placeholder = (o) => /\{\w+\}|undefined/.test(o.html);
  // a filled `who` draws the member's handle (control)
  const m = await open("updates", { me: ADMIN, table: rows("member:rosa", "member:rosa") });
  has(m, "updates.running.release", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "rosa" });
  has(m, "updates.earlier.skipped", { version: "0.83.1", date: day("2026-10-02T10:00:00Z"), who: "rosa", reason: "We wait." });
  // setup, a token, a machine class, a seed and a founder without a handle in another's session: no one to name
  for (const by of [null, "admin", "member:admin", "token:abc", "class:daemon", "seed", "bootstrap"]) {
    const o = await open("updates", { me: ADMIN, table: rows(by, "member:rosa") });
    // (R73: this release was installed on a later day than the setup, so it says no more than its own date)
    has(o, "updates.running.release_noactor", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
    has(o, "updates.earlier.installed_noactor", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
    assert.ok(!o.text.includes(said("settings.set.setup")) && !placeholder(o), String(by));
    assert.ok(!/\badmin\b/.test(o.text), `${by}: never the id admin`);
  }
  // the founder in her own session, with her handle: named by it
  const founder = { ...ADMIN, member: "admin", handle: "cleo" };
  const f = await open("updates", { me: founder, table: rows("admin", "admin") });
  has(f, "updates.running.release", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "cleo" });
  has(f, "updates.earlier.skipped", { version: "0.83.1", date: day("2026-10-02T10:00:00Z"), who: "cleo", reason: "We wait." });
  // a skip by the founder in another's session, without her handle: member.founder.unnamed, never admin
  const g = await open("updates", { me: ADMIN, table: rows("member:rosa", "admin") });
  has(g, "updates.earlier.skipped", { version: "0.83.1", date: day("2026-10-02T10:00:00Z"), who: said("member.founder.unnamed"), reason: "We wait." });
  assert.ok(!/\badmin\b/.test(g.text));
  // a member who does not administer is told the screen is administrators' by its key
  const n = await open("updates", { me: MEMBER, table: updatesTable() });
  has(n, "screen.updates.admins", { admins: `${said("member.founder.unnamed")}, rosa, lu` });
});

/* ---- T51 FR-25: C82 (R68), T-08 (R73) ---- */

const part = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];

test("R73 a release with no member behind it that was not the setup is drawn by the noactor words, running and earlier, and the one set-up date is said once; the setup release says so; one with a member is unchanged (control)", async () => {
  const notice = (by) => ({ running: { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: by }, earlier: [
    { version: "0.83.0", installed_at: "2026-09-28T10:00:00Z", allowed_by: by },
    { version: "0.82.0", installed_at: "2026-09-02T10:00:00Z", allowed_by: null }] });
  const n = await open("updates", { me: ADMIN, table: updatesTable(notice(null)) });
  has(n, "updates.running.release_noactor", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
  has(n, "updates.earlier.installed_noactor", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
  has(n, "updates.running.setup_on", { date: day("2026-09-02T10:00:00Z") });
  assert.equal(n.text.split(said("updates.running.setup_on", { date: day("2026-09-02T10:00:00Z") })).length, 2, "said once");
  lacks(n, "updates.running.release_setup", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
  has(n, "updates.earlier.installed_setup", { version: "0.82.0", date: day("2026-09-02T10:00:00Z") });
  // the running release is the setup release: it says it, and the set-up date is not said twice
  const s = await open("updates", { me: ADMIN, table: updatesTable({ running: { version: "0.82.0", installed_at: "2026-09-02T10:00:00Z", allowed_by: null } }) });
  has(s, "updates.running.release_setup", { version: "0.82.0", date: day("2026-09-02T10:00:00Z") });
  assert.ok(!s.text.includes(said("updates.running.setup_on", { date: day("2026-09-02T10:00:00Z") })));
  // control: a release with a member keeps today's words
  const m = await open("updates", { me: ADMIN, table: updatesTable(notice("member:rosa")) });
  has(m, "updates.running.release", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "rosa" });
  has(m, "updates.earlier.installed", { version: "0.83.0", date: day("2026-09-28T10:00:00Z"), who: "rosa" });
  // control: with no set-up date held nothing is claimed about setup
  const none = await open("updates", { me: ADMIN, table: updatesTable(notice(null), { bootstrap: { ok: true, service: "bio-plane", version: "0.83.0" } }) });
  has(none, "updates.running.release_noactor", { version: "0.83.0", date: day("2026-09-28T10:00:00Z") });
  has(none, "updates.earlier.installed_noactor", { version: "0.82.0", date: day("2026-09-02T10:00:00Z") });
  lacks(none, "updates.running.setup_on", { date: day("2026-09-02T10:00:00Z") });
});

test("R68 How your copy is doing: the check (selftest) draws what it found from its answer; a problem is drawn in its fold; the optional part is said not set up", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  const sec = part(a, "screen.updates.health.head");
  assert.ok(sec, "the section");
  has(a, "screen.updates.health.check.note"); has(a, "screen.updates.health.check.next");
  lacks(a, "screen.updates.health.store");
  const check = acts(sec).filter((b) => b.attrs["data-act"] === "selftest");
  assert.equal(check.length, 1);
  assert.ok(textOf(check[0]).includes(said("screen.updates.health.check")));
  const r = await a.press("selftest", {});
  assert.deepEqual(r.sent.map((x) => x.op), ["selftest"], "a read: nothing else changes");
  assert.deepEqual([r.sent[0].method, r.sent[0].body], ["GET", undefined]);
  has(a, "screen.updates.health.store");
  has(a, "screen.updates.health.captures.off");
  lacks(a, "screen.updates.health.refused.head");
  // the captures bucket set up and read back: nothing said of it, no "not set up"
  const on = await open("updates", { me: ADMIN, table: updatesTable({}, { selftest: { ok: true, version: "0.83.0", bindings: { STORE: true }, captures: "read-write ok", bindingsAllPresent: true } }) });
  await on.press("selftest", {});
  has(on, "screen.updates.health.store");
  lacks(on, "screen.updates.health.captures.off");
  has(on, "screen.updates.health.file.test");
  lacks(a, "screen.updates.health.file.test");
  // the check finds a problem: the answer refused, drawn in its fold beside the act, the store not said to answer
  const bad = await open("updates", { me: ADMIN, table: updatesTable({}, { selftest: { ok: false, status: 500, store: "ERR the store did not answer /stats", bindingsAllPresent: false } }) });
  await bad.press("selftest", {});
  has(bad, "screen.updates.health.refused.head"); has(bad, "screen.updates.health.refused.store"); has(bad, "screen.updates.health.refused.next");
  lacks(bad, "screen.updates.health.store");
  assert.ok(all(bad.tree, (e) => e.tag === "details" && e.attrs.open !== undefined).length, "the fold is open when drawn");
  // an answer that never comes is drawn failed, never as a healthy copy
  const silent = await open("updates", { me: ADMIN, table: updatesTable({}, { selftest: "none" }) });
  await silent.press("selftest", {});
  lacks(silent, "screen.updates.health.store");
});

test("R68 What each part runs (bootstrap with members): each part named as the answer names it with its release; a silent part is said silent; the others show their state; a failed answer is drawn failed", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  const r = await a.press("bootstrap", {});
  assert.deepEqual([r.sent[0].op, r.sent[0].query], ["bootstrap", { members: "1" }]);
  const sheet = part(a, "screen.updates.health.head");
  const rows = all(sheet, (e) => /cs-row/.test(e.attrs.class || ""));
  const rowOf2 = (name) => rows.find((x) => textOf(x).includes(name));
  const P = "screen.updates.health.part.";
  const pdf = textOf(rowOf2(said(P + "pdf-worker")));
  assert.ok(pdf.includes(said(P + "state.answering")) && pdf.includes(said(P + "release", { version: "0.83.0" })), "a serving part is named by the design's words and shows its release");
  assert.ok(textOf(rowOf2(said(P + "file-scanner"))).includes(said(P + "release", { version: "0.82.0" })), "a part on another release shows that one");
  const ocr = textOf(rowOf2(said(P + "ocr-worker")));
  assert.ok(ocr.includes(said(P + "silent")), "a silent part is said silent");
  assert.ok(!ocr.includes("timed out"), "no reason the owner gave beyond the word");
  assert.ok(textOf(rowOf2(said(P + "agent-runner"))).includes(said(P + "state.unbound")), "an unbound part");
  const sheetW = textOf(rowOf2(said(P + "sheet-worker")));
  assert.ok(sheetW.includes(said(P + "state.misnamed")) && sheetW.includes("other-worker"), "a part answering under another name, as the answer names it");
  assert.ok(!rows.some((x) => /agent-worker|pdf-worker|ocr-worker/.test(textOf(x))), "never the module id");
  has(a, "screen.updates.health.parts.note"); has(a, "screen.updates.health.parts.next");
  // a failed answer is drawn failed, no part listed
  const bad = await open("updates", { me: ADMIN, table: updatesTable({}, { bootstrap: (q) => (q.members === "1" ? refuse("STORE_DID_NOT_ANSWER") : { ok: true, installed_at: "2026-09-02T10:00:00Z" }) }) });
  await bad.press("bootstrap", {});
  lacks(bad, "screen.updates.health.parts.note");
  assert.ok(bad.refused && bad.refused.text.length > 0, "the refusal is drawn beside the act");
});

test("R68 What running costs (runtime): the measured work as the answer gives it, the two limits explained, and the note; a failed answer is drawn failed", async () => {
  const a = await open("updates", { me: ADMIN, table: updatesTable() });
  lacks(a, "screen.updates.health.runtime.note");
  const r = await a.press("runtime", {});
  assert.deepEqual(r.sent.map((x) => x.op), ["runtime"]);
  has(a, "screen.updates.health.runtime.limits", { ceiling: "50" }); has(a, "screen.updates.health.runtime.cpu"); has(a, "screen.updates.health.runtime.note");
  const t = textOf(part(a, "screen.updates.health.head"));
  const R = "screen.updates.health.runtime.";
  assert.ok(t.includes("request_work") && t.includes(said(R + "heaviest", { peak: "1840", unit: said(R + "unit.ms") })) && t.includes(said(R + "average", { mean: "310", unit: said(R + "unit.ms") })) && t.includes(said(R + "samples", { samples: "5200" })), "a measurement in ms is drawn in ms");
  assert.ok(t.includes("capture_work_bytes") && t.includes(said(R + "heaviest", { peak: "800000", unit: said(R + "unit.bytes") })) && !t.includes("800000 ms"), "a count of work is never drawn as a time");
  // control: a ceiling no refusal has taught yet is not drawn
  const none = await open("updates", { me: ADMIN, table: updatesTable({}, { runtime: env({ ok: true, measured: { metrics: [] }, subrequests: { runtime: "subrequests", observed: null, probeDue: true, probeEvery: 20 } }) }) });
  await none.press("runtime", {});
  assert.ok(!none.text.includes(said("screen.updates.health.runtime.limits", { ceiling: "@" }).split("@")[0]), "no ceiling sentence"); has(none, "screen.updates.health.runtime.cpu");
  const bad = await open("updates", { me: ADMIN, table: updatesTable({}, { runtime: refuse("STORE_DID_NOT_ANSWER") }) });
  await bad.press("runtime", {});
  lacks(bad, "screen.updates.health.runtime.note");
  assert.ok(bad.refused && bad.refused.text.length > 0);
});

test("R68 units (DEC-389): a runtime figure is said with its unit by key (unit.ms, unit.bytes); a unit with no key is never drawn as its raw token", async () => {
  const R = "screen.updates.health.runtime.";
  const metric = (unit) => ({ metric: "request_work", unit, peak: 1840, peak_at: "2026-10-12T00:00:00Z", peak_detail: null, last: 310, last_at: "2026-10-13T00:00:00Z", samples: 5200, total: 1612000, mean: 310 });
  const ms = await open("updates", { me: ADMIN, table: updatesTable({}, { runtime: env({ ok: true, measured: { metrics: [metric("ms")] } }) }) });
  await ms.press("runtime", {});
  assert.ok(ms.text.includes(said(R + "heaviest", { peak: "1840", unit: said(R + "unit.ms") })), "milliseconds, by key");
  // control: a unit with no key is not drawn as its token; its figures are not drawn either
  const odd = await open("updates", { me: ADMIN, table: updatesTable({}, { runtime: env({ ok: true, measured: { metrics: [metric("joules")] } }) }) });
  await odd.press("runtime", {});
  assert.ok(!odd.text.includes("joules"), "the raw unit token is never drawn");
  assert.ok(!odd.text.includes(said(R + "heaviest", { peak: "1840", unit: "" })), "a figure with no unit is not drawn");
  has(odd, R + "cpu");
});

test("R68 control: the section is an administrator's only; a member reads that the screen is administrators' and none of the three reads is sent", async () => {
  const m = await open("updates", { me: MEMBER, table: updatesTable() });
  lacks(m, "screen.updates.health.head");
  assert.deepEqual(acts(m.tree), []);
  for (const op of ["selftest", "bootstrap", "runtime", "updatenotice"]) assert.ok(!m.p.requests.some((r) => r.op === op), op);
});

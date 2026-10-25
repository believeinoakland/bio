/* Settings › Updates at the module's interface (R27; instance-setup R89, R90): administrators only. Over the world (store-request): the
   update notice is what a release provides (seeded as the daily check stores it, see `shipped`), the decisions are the real acts
   (`updatestart`, `updateskip`, `updatelater`), and every expectation is read back from the owners' answers. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { env, refuse } from "./fixtures.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { team, unnamedTeam, handleOf, notesOf, shipped, deployed, holdsHosting, aDayLater, serving, gone, measured, ceiling } from "./seed-security.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const section = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];
const copyButtons = (o) => all(o.tree, (e) => e.tag === "button" && e.attrs["data-shell"] === "bind");

const NOTES = notesOf("Searching the record now finds words inside scanned pages.", "New releases are checked for once a day.", "After it, open Translations once.");
const WE_WAIT = "Changes nothing for us; we wait for 0.84.";

/** A copy that has run 0.82.0, then 0.83.0 (chosen by its founder to install), has set aside 0.83.1, and is offered 0.84.0: the team
 *  the Updates screen is read in. `holds` is who holds the hosting account. The daily check has run (the world's tick). */
async function copy({ holds = "founder", ready = { version: "0.84.0", date: "2026-10-11", security: true, notes: NOTES }, env = {} } = {}) {
  const { w } = await team(env);
  const founder = await aDayLater(w);
  deployed(w, "0.82.0");
  shipped(w, { version: "0.82.0", date: "2026-09-02" });
  shipped(w, { version: "0.83.0", date: "2026-09-27" });
  await founder.act("updatestart", { body: { version: "0.83.0" } });
  deployed(w, "0.83.0");
  shipped(w, { version: "0.83.1", date: "2026-10-01" });
  await founder.act("updateskip", { body: { version: "0.83.1", reason: WE_WAIT } });
  if (ready) shipped(w, ready);
  if (holds) await holdsHosting(founder, w, holds);
  return { w, founder };
}

test("R27 an administrator who holds the hosting account: what runs now, the release ready with its security mark, signature and three-part notes, Update and Not now, Skip under a disclosure, the earlier releases", async () => {
  const { w, founder } = await copy();
  const n = await founder.read("updatenotice"), who = await handleOf(founder);
  const a = await open("updates", { world: w, as: founder });
  assert.ok(a.p.requests.some((r) => r.op === "updatenotice"));
  // Running now: the version, when it was installed and who allowed it, the last check and its note
  const run = section(a, "updates.running.head");
  assert.ok(textOf(run).includes(said("updates.running.release", { version: n.running.version, date: day(n.running.installed_at), who })));
  assert.equal(n.running.version, "0.83.0");
  assert.ok(textOf(run).includes(said("updates.running.checked", { when: day(n.last_check.at) })) && textOf(run).includes(said("updates.running.checked_note")));
  // Ready to install
  const ready = section(a, "updates.ready.head");
  assert.ok(textOf(ready).includes(said("updates.ready.release", { version: n.ready.version, date: day(n.ready.date) })));
  const mark = all(ready, (e) => /cs-risk/.test(e.attrs.class || ""))[0];
  assert.ok(mark && textOf(mark) === said("updates.ready.security") && mark.attrs["data-tip"] === said("updates.ready.security_says"), "the security mark, explained by its sentence");
  assert.ok(textOf(ready).includes(said("updates.ready.signed")));
  const dl = all(ready, (e) => e.tag === "dl")[0];
  assert.deepEqual(all(dl, (e) => e.tag === "dt").map(textOf), ["updates.notes.members", "updates.notes.admins", "updates.notes.must"].map((k) => said(k)));
  assert.deepEqual(all(dl, (e) => e.tag === "dd").map(textOf), Object.values(n.ready.notes));
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
  assert.ok(textOf(skip).includes(said("updates.skip.says", { version: n.ready.version })) && textOf(skip).includes(said("updates.skip.why")));
  assert.ok(acts(skip).some((b) => b.attrs["data-act"] === "updateskip"));
  assert.equal(all(a.tree, (e) => e.attrs["data-shell"] === "bind").length, 0, "the holder is handed no hand-off");
  // Earlier releases: installed, skipped with its reason as data, and one recorded at setup
  const earlier = section(a, "updates.earlier.head");
  const t = textOf(earlier);
  const skipped = n.earlier.find((e) => e.skipped_at), installed = n.earlier.find((e) => e.version === "0.83.0"), setup = n.earlier.find((e) => e.version === "0.82.0");
  assert.equal(skipped.reason, WE_WAIT, "the reason is the data the owner holds");
  assert.ok(t.includes(said("updates.earlier.skipped", { version: skipped.version, date: day(skipped.skipped_at), who, reason: skipped.reason })));
  assert.ok(t.includes(said("updates.earlier.installed", { version: installed.version, date: day(installed.installed_at), who })));
  // R33, R37, R73: an install with no member behind it is drawn by the words that name no one, never "allowed by set at setup"; the setup
  // release (installed the day the copy was set up) says so
  assert.equal(setup.allowed_by, null);
  assert.ok(t.includes(said("updates.earlier.installed_setup", { version: setup.version, date: day(setup.installed_at) })), "recorded at setup");
  assert.ok(!t.includes(said("settings.set.setup")), "no \"set at setup\" in a fill");
  assert.ok(!/\badmin\b/.test(t));
});

test("R27 a release without a security fix carries no mark; the notes' last part only when not empty", async () => {
  const { w, founder } = await copy({ ready: { version: "0.84.0", date: "2026-10-11", security: false, notes: notesOf("M.", "A.", "") } });
  const a = await open("updates", { world: w, as: founder });
  assert.equal(all(a.tree, (e) => /cs-risk/.test(e.attrs.class || "")).length, 0);
  assert.deepEqual(all(a.tree, (e) => e.tag === "dt").map(textOf), [said("updates.notes.members"), said("updates.notes.admins")]);
  lacks(a, "updates.notes.must");
});

test("R27 nothing ready: updates.none, no Update, Not now or Skip; the running release and the earlier ones still drawn", async () => {
  const { w, founder } = await copy({ ready: null });
  assert.equal((await founder.read("updatenotice")).ready, null, "the owner holds none ready");
  const a = await open("updates", { world: w, as: founder });
  has(a, "updates.none");
  assert.deepEqual(ops(a), ["bootstrap", "runtime", "selftest"], "only the copy's three reports (R68)");
  has(a, "updates.running.head");
  has(a, "updates.earlier.head");
  lacks(a, "updates.ready.signed");
});

test("R27 an administrator who does not hold the hosting account: no Update but the hand-off, the link to copy being the address updatestart answers", async () => {
  const { w, founder } = await copy({ holds: "Rosa Medina" });
  const n = await founder.read("updatenotice");
  assert.equal(n.viewer_holds, false, "the owner says she does not hold it");
  const holder = n.holder.holders;
  const a = await open("updates", { world: w, as: founder });
  assert.ok(!ops(a).includes("updatestart") || acts(a.tree).filter((b) => b.attrs["data-act"] === "updatestart").every((b) => b.attrs["data-handoff"] === "1"), "no Update");
  assert.equal(acts(a.tree).filter((b) => b.attrs["data-act"] === "updatestart" && b.attrs["data-tone"] === "primary").length, 0);
  has(a, "updates.handoff.head");
  has(a, "updates.handoff.says", { holder });
  has(a, "updates.handoff.for", { holder });
  has(a, "updates.handoff.explain", { version: n.ready.version });
  assert.ok(ops(a).includes("updatelater") && ops(a).includes("updateskip"), "Not now and Skip stay");
  // the link: the address updatestart answers, copied by the kit's control
  const r = await a.press("updatestart", { data: { version: n.ready.version, handoff: "1" } });
  assert.deepEqual(r.sent[0].body, { version: n.ready.version });
  const address = (await founder.act("updatestart", { body: { version: n.ready.version } })).address;
  assert.ok(address.startsWith("https://") && a.text.includes(address), "the address the owner answers");
  const copy1 = copyButtons(a);
  assert.equal(copy1.length, 1);
  assert.equal(textOf(copy1[0]), said("updates.handoff.copy"));
  assert.equal(all(a.tree, (e) => e.tag === "a" && e.attrs.target === "_blank").length, 0, "nothing is opened for a non-holder");
});

test("R27 Update: on its answer the installer's address is offered in a new browsing context, with no opener and no referrer", async () => {
  const { w, founder } = await copy();
  const a = await open("updates", { world: w, as: founder });
  const r = await a.press("updatestart", { data: { version: "0.84.0" } });
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["updatestart", { version: "0.84.0" }]);
  const address = (await founder.act("updatestart", { body: { version: "0.84.0" } })).address;
  const link = all(a.tree, (e) => e.tag === "a" && e.attrs.href === address)[0];
  assert.ok(link, "the address");
  assert.equal(link.attrs.target, "_blank");
  assert.equal(link.attrs.rel, "noopener noreferrer");
  // control: an address that is not https is never offered (WORLD GAP: the owner never answers one; the answer is scripted)
  const bad = await open("updates", { world: w, as: founder, table: { updatestart: (q, b) => env({ ok: true, version: b.version, address: "javascript:alert(1)" }) } });
  await bad.press("updatestart", { data: { version: "0.84.0" } });
  assert.equal(all(bad.tree, (e) => e.tag === "a" && /^javascript:/.test(e.attrs.href || "")).length, 0);
});

test("R27 R34 Not now sends the version; Skip this version is reasoned: its reason, one line, is sent; none sends nothing", async () => {
  const { w, founder } = await copy();
  const a = await open("updates", { world: w, as: founder });
  assert.deepEqual((await a.press("updatelater", { data: { version: "0.84.0" } })).sent.map((x) => [x.op, x.body]).slice(0, 1), [["updatelater", { version: "0.84.0" }]]);
  assert.equal(a.p.requests.at(-1).op, "updatenotice", "R8: the notice is read again after the act");
  assert.equal((await founder.read("updatenotice")).ready.decision.kind, "later", "the owner holds the decision");
  assert.equal(a.s.acts.find((x) => x.op === "updateskip").reasonField, "reason");
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "  " }, reason: "x" })).sent, []);
  // R34: refused in place by refusal.UPDATE_SKIP_NO_REASON, nothing sent; the retired row is no word of the list
  assert.equal(a.refused.key, "refusal.UPDATE_SKIP_NO_REASON");
  assert.equal(hasWord("screen.updates.skip.noreason"), false);
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "x".repeat(1001) }, reason: "x" })).sent, []);
  assert.equal((await founder.read("updatenotice")).ready.version, "0.84.0", "nothing was skipped");
  assert.deepEqual((await a.press("updateskip", { data: { version: "0.84.0" }, values: { "up-skipwhy": "Changes nothing  for us." }, reason: "Changes nothing for us." })).sent[0].body, { version: "0.84.0", reason: "Changes nothing for us." });
  const after = await founder.read("updatenotice");
  assert.equal(after.ready, null, "a skip is final");
  assert.equal(after.earlier.find((e) => e.version === "0.84.0").reason, "Changes nothing for us.", "the owner holds the reason");
});

test("R27 controls: a note carrying <script> is drawn as text, never markup; a member who does not administer reads nothing and is told the screen is administrators'; a failed read is drawn failed, never as nothing to install", async () => {
  const evil = "<script>alert(1)</script><img src=x onerror=alert(2)>";
  const { w, founder } = await copy({ ready: { version: "0.84.0", date: "2026-10-11", security: true, notes: notesOf(evil, evil, evil) } });
  const a = await open("updates", { world: w, as: founder });
  assert.equal(all(a.tree, (e) => e.tag === "script" || e.tag === "img").length, 0, "no element comes of a note");
  assert.ok(textOf(all(a.tree, (e) => e.tag === "dd")[0]) === evil, "the note is its own text");
  const dev = await w.signIn("dev");
  const m = await open("updates", { world: w, as: dev });
  assert.ok(!m.p.requests.some((r) => r.op === "updatenotice"), "nothing of the screen's own is read");
  const admins = (await dev.read("memberlist")).members.filter((x) => x.role === "admin" && x.status === "active").map((x) => x.handle);
  has(m, "screen.updates.admins", { admins: admins.join(", ") });
  assert.deepEqual(acts(m.tree), []);
  const f = await open("updates", { world: w, as: founder, table: { updatenotice: "none" } });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  lacks(f, "updates.none");
  // a refused read (the store's own refusal: its record of releases cannot be read) is not nothing to install either
  w.sql.exec("DROP TABLE release_notices");
  await assert.rejects(founder.read("updatenotice"), /STORE_DID_NOT_ANSWER/, "the owner refuses it");
  const r = await open("updates", { world: w, as: founder });
  lacks(r, "updates.none");
});

/* R37 (T49; D30 m): every sentence updates draws has every fill filled from its read; none is drawn "allowed by set at setup" */

/** Two releases on two days (0.82.0 on the first, 0.83.0 running on the next), each chosen by `by`: "founder" is her real `updatestart`, `null`
 *  is none, any other is a decision the world's acts cannot make (WORLD GAP: a token, a machine class or a seed is refused `NOT_AN_ADMIN`),
 *  seeded as the owner's table holds it. Then 0.83.1 is skipped by the founder (a real `updateskip`). */
async function history(by, make = team) {
  const { w, founder: first } = await make();
  const decide = async (as, version) => {
    if (by === "founder") await as.act("updatestart", { body: { version } });
    else if (by) w.sql.exec("INSERT INTO update_decisions (version, kind, by_member, by_name, at) VALUES (?, 'start', ?, ?, ?)", version, by, by, new Date(w.now()).toISOString());
  };
  shipped(w, { version: "0.82.0", date: "2026-09-02" });
  await decide(first, "0.82.0");
  deployed(w, "0.82.0");
  const founder = await aDayLater(w, first.handle);
  shipped(w, { version: "0.83.0", date: "2026-09-27" });
  await decide(founder, "0.83.0");
  deployed(w, "0.83.0");
  shipped(w, { version: "0.83.1", date: "2026-10-01" });
  await founder.act("updateskip", { body: { version: "0.83.1", reason: "We wait." } });
  return { w, founder };
}

test("R37 who allowed or skipped a release is a handle when a member did it; an install with no member behind it is drawn without one; the founder by her handle in her own session", async () => {
  const placeholder = (o) => /\{\w+\}|undefined/.test(o.html);
  // a filled `who` draws the member's handle (control): the founder by hers, in her own session
  const { w, founder } = await history("founder");
  const who = await handleOf(founder), n = await founder.read("updatenotice");
  const m = await open("updates", { world: w, as: founder });
  has(m, "updates.running.release", { version: "0.83.0", date: day(n.running.installed_at), who });
  const skipped = n.earlier.find((e) => e.skipped_at), first = n.earlier.find((e) => e.version === "0.82.0");
  has(m, "updates.earlier.skipped", { version: "0.83.1", date: day(skipped.skipped_at), who, reason: "We wait." });
  has(m, "updates.earlier.installed", { version: "0.82.0", date: day(first.installed_at), who });
  // setup, a token, a machine class, a seed: no one to name
  for (const by of [null, "token:abc", "class:daemon", "seed", "bootstrap"]) {
    const h = await history(by);
    const nn = await h.founder.read("updatenotice");
    const o = await open("updates", { world: h.w, as: h.founder });
    // the running release was installed the day the copy's facts say it was set up, so it says that, and no more
    has(o, "updates.running.release_setup", { version: "0.83.0", date: day(nn.running.installed_at) });
    // the earlier one was installed on a day before it: only its own date
    has(o, "updates.earlier.installed_noactor", { version: "0.82.0", date: day(nn.earlier.find((e) => e.version === "0.82.0").installed_at) });
    assert.ok(!o.text.includes(said("settings.set.setup")) && !placeholder(o), String(by));
    assert.ok(!/\badmin\b/.test(o.text), `${by}: never the id admin`);
  }
  // a founder who has no handle: she is named by member.founder.unnamed, in a skip, and no one is named for an install she chose
  const u = await history("founder", unnamedTeam);
  const un = await u.founder.read("updatenotice");
  const f = await open("updates", { world: u.w, as: u.founder });
  has(f, "updates.earlier.skipped", { version: "0.83.1", date: day(un.earlier.find((e) => e.skipped_at).skipped_at), who: said("member.founder.unnamed"), reason: "We wait." });
  assert.ok(!/\badmin\b/.test(f.text));
  // a member who does not administer is told the screen is administrators' by its key
  const dev = await w.signIn("dev");
  const nm = await open("updates", { world: w, as: dev });
  has(nm, "screen.updates.admins", { admins: who });
});

/* ---- T51 FR-25: C82 (R68), T-08 (R73) ---- */

const part = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];

test("R73 a release with no member behind it that was not the setup is drawn by the noactor words, running and earlier, and the one set-up date is said once; the setup release says so; one with a member is unchanged (control)", async () => {
  // the setup day is the copy's own fact, as `bootstrap` states it; the running release is the setup release in the owner's answers
  // (installed_at is when the running release was first seen), so a later release that was not the setup is a state only a stated
  // bootstrap makes (WORLD GAP, reported): the table states the day the earlier release was installed as the setup day
  const { w, founder } = await history(null);
  const n = await founder.read("updatenotice");
  const earlier = n.earlier.find((e) => e.version === "0.82.0");
  const setupDay = (iso) => ({ bootstrap: () => ({ ok: true, service: "bio-plane", installed_at: iso }) });
  const o = await open("updates", { world: w, as: founder, table: setupDay(earlier.installed_at) });
  has(o, "updates.running.release_noactor", { version: "0.83.0", date: day(n.running.installed_at) });
  has(o, "updates.running.setup_on", { date: day(earlier.installed_at) });
  assert.equal(o.text.split(said("updates.running.setup_on", { date: day(earlier.installed_at) })).length, 2, "said once");
  lacks(o, "updates.running.release_setup", { version: "0.83.0", date: day(n.running.installed_at) });
  has(o, "updates.earlier.installed_setup", { version: "0.82.0", date: day(earlier.installed_at) });
  // the running release is the setup release: it says it, and the set-up date is not said twice (the world's own bootstrap)
  const s = await open("updates", { world: w, as: founder });
  has(s, "updates.running.release_setup", { version: "0.83.0", date: day(n.running.installed_at) });
  assert.ok(!s.text.includes(said("updates.running.setup_on", { date: day(n.running.installed_at) })));
  has(s, "updates.earlier.installed_noactor", { version: "0.82.0", date: day(earlier.installed_at) });
  // control: a release with a member keeps today's words, and the one set-up date is said once
  const c = await history("founder");
  const cn = await c.founder.read("updatenotice"), who = await handleOf(c.founder);
  const m = await open("updates", { world: c.w, as: c.founder });
  has(m, "updates.running.release", { version: "0.83.0", date: day(cn.running.installed_at), who });
  has(m, "updates.earlier.installed", { version: "0.82.0", date: day(cn.earlier.find((e) => e.version === "0.82.0").installed_at), who });
  assert.equal(m.text.split(said("updates.running.setup_on", { date: day(cn.running.installed_at) })).length, 2, "the set-up date, once");
  // control: with no set-up date held nothing is claimed about setup (a bootstrap that states none)
  const none = await open("updates", { world: w, as: founder, table: { bootstrap: () => ({ ok: true, service: "bio-plane" }) } });
  has(none, "updates.running.release_noactor", { version: "0.83.0", date: day(n.running.installed_at) });
  has(none, "updates.earlier.installed_noactor", { version: "0.82.0", date: day(earlier.installed_at) });
  lacks(none, "updates.running.setup_on", { date: day(earlier.installed_at) });
});

test("R68 How your copy is doing: the check (selftest) draws what it found from its answer; a problem is drawn in its fold; the optional part is said not set up", async () => {
  const { w, founder } = await team();
  w.env.CAPTURES = undefined;   // the optional storage is not bound (a platform binding)
  const a = await open("updates", { world: w, as: founder });
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
  const both = await team();
  both.w.env.PUBLISHED = both.w.env.CAPTURES;   // the optional storage is bound as a pair (a platform binding)
  const on = await open("updates", { world: both.w, as: both.founder });
  await on.press("selftest", {});
  has(on, "screen.updates.health.store");
  lacks(on, "screen.updates.health.captures.off");
  has(on, "screen.updates.health.file.test");
  lacks(a, "screen.updates.health.file.test");
  // the check finds a problem: one bucket bound without the other, the owner answers it refused, drawn in its fold beside the act
  const half = await team();
  await assert.rejects(half.founder.read("selftest"), /selftest was refused/, "the owner refuses a half-bound storage");
  const bad = await open("updates", { world: half.w, as: half.founder });
  await bad.press("selftest", {});
  has(bad, "screen.updates.health.refused.head"); has(bad, "screen.updates.health.refused.store"); has(bad, "screen.updates.health.refused.next");
  lacks(bad, "screen.updates.health.store");
  assert.ok(all(bad.tree, (e) => e.tag === "details" && e.attrs.open !== undefined).length, "the fold is open when drawn");
  // an answer that never comes is drawn failed, never as a healthy copy
  const silent = await open("updates", { world: half.w, as: half.founder, table: { selftest: "none" } });
  await silent.press("selftest", {});
  lacks(silent, "screen.updates.health.store");
});

test("R68 What each part runs (bootstrap with members): each part named as the answer names it with its release; a silent part is said silent; the others show their state; a failed answer is drawn failed", async () => {
  // the parts are platform service bindings: each answers `GET /version` as its own build does (or does not)
  const { w, founder } = await team({ AGENT_WORKER: serving("agent-worker", "0.83.0", { runner: false }), PDF_WORKER: serving("pdf-worker", "0.83.0"),
    OCR_WORKER: gone("timed out"), SHEET_WORKER: serving("other-worker", "0.83.0"), FILE_SCANNER: serving("file-scanner", "0.82.0") });
  const a = await open("updates", { world: w, as: founder });
  const r = await a.press("bootstrap", {});
  assert.deepEqual([r.sent[0].op, r.sent[0].query], ["bootstrap", { members: "1" }]);
  const owner = (await founder.read("bootstrap", { query: { members: "1" } })).memberVersions;
  assert.deepEqual([owner["pdf-worker"].state, owner["ocr-worker"].state, owner["sheet-worker"].state, owner["agent-runner"].state, owner["file-scanner"].version], ["SERVING", "SILENT", "MISNAMED", "UNBOUND", "0.82.0"], "what the owner answers");
  const sheet = part(a, "screen.updates.health.head");
  const rows = all(sheet, (e) => /cs-row/.test(e.attrs.class || ""));
  const rowOf2 = (name) => rows.find((x) => textOf(x).includes(name));
  const P = "screen.updates.health.part.";
  const pdf = textOf(rowOf2(said(P + "pdf-worker")));
  assert.ok(pdf.includes(said(P + "state.answering")) && pdf.includes(said(P + "release", { version: owner["pdf-worker"].version })), "a serving part is named by the design's words and shows its release");
  assert.ok(textOf(rowOf2(said(P + "file-scanner"))).includes(said(P + "release", { version: owner["file-scanner"].version })), "a part on another release shows that one");
  const ocr = textOf(rowOf2(said(P + "ocr-worker")));
  assert.ok(ocr.includes(said(P + "silent")), "a silent part is said silent");
  assert.ok(!ocr.includes(owner["ocr-worker"].why), "no reason the owner gave beyond the word");
  assert.ok(textOf(rowOf2(said(P + "agent-runner"))).includes(said(P + "state.unbound")), "an unbound part");
  const sheetW = textOf(rowOf2(said(P + "sheet-worker")));
  assert.ok(sheetW.includes(said(P + "state.misnamed")) && sheetW.includes(owner["sheet-worker"].name), "a part answering under another name, as the answer names it");
  assert.ok(!rows.some((x) => /agent-worker|pdf-worker|ocr-worker/.test(textOf(x))), "never the module id");
  has(a, "screen.updates.health.parts.note"); has(a, "screen.updates.health.parts.next");
  // a failed answer is drawn failed, no part listed (WORLD GAP: the owner's refusal for the members' read is the store's silence, which the world cannot make)
  const facts = await founder.read("bootstrap");
  const bad = await open("updates", { world: w, as: founder, table: { bootstrap: (q) => (q.members === "1" ? refuse("STORE_DID_NOT_ANSWER") : { ok: true, installed_at: facts.installed_at }) } });
  await bad.press("bootstrap", {});
  lacks(bad, "screen.updates.health.parts.note");
  assert.ok(bad.refused && bad.refused.text.length > 0, "the refusal is drawn beside the act");
});

test("R68 What running costs (runtime): the measured work as the answer gives it, the two limits explained, and the note; a failed answer is drawn failed", async () => {
  const { w, founder } = await team();
  measured(w, [
    { metric: "capture_work_bytes", unit: "bytes", peak: 800000, peak_at: "2026-10-12T00:00:00Z", last: 1200, last_at: "2026-10-13T00:00:00Z", samples: 40, total: 2000000 },
    { metric: "request_work", unit: "ms", peak: 1840, peak_at: "2026-10-12T00:00:00Z", last: 90, last_at: "2026-10-13T00:00:00Z", samples: 5200, total: 1612000 }]);
  ceiling(w, 50);
  const a = await open("updates", { world: w, as: founder });
  lacks(a, "screen.updates.health.runtime.note");
  const r = await a.press("runtime", {});
  assert.deepEqual(r.sent.map((x) => x.op), ["runtime"]);
  const owner = await founder.read("runtime"), by = (m) => owner.measured.metrics.find((x) => x.metric === m);
  has(a, "screen.updates.health.runtime.limits", { ceiling: String(owner.subrequests.observed) }); has(a, "screen.updates.health.runtime.cpu"); has(a, "screen.updates.health.runtime.note");
  const t = textOf(part(a, "screen.updates.health.head"));
  const R = "screen.updates.health.runtime.";
  const ms = by("request_work"), bytes = by("capture_work_bytes");
  assert.ok(t.includes("request_work") && t.includes(said(R + "heaviest", { peak: String(ms.peak), unit: said(R + "unit.ms") })) && t.includes(said(R + "average", { mean: String(Math.round(ms.mean * 100) / 100), unit: said(R + "unit.ms") })) && t.includes(said(R + "samples", { samples: String(ms.samples) })), "a measurement in ms is drawn in ms");
  assert.ok(t.includes("capture_work_bytes") && t.includes(said(R + "heaviest", { peak: String(bytes.peak), unit: said(R + "unit.bytes") })) && !t.includes(bytes.peak + " ms"), "a count of work is never drawn as a time");
  // control: a ceiling no refusal has taught yet is not drawn
  const fresh = await team();
  const none = await open("updates", { world: fresh.w, as: fresh.founder });
  await none.press("runtime", {});
  assert.equal((await fresh.founder.read("runtime")).subrequests.observed, null, "the owner holds no ceiling");
  assert.ok(!none.text.includes(said("screen.updates.health.runtime.limits", { ceiling: "@" }).split("@")[0]), "no ceiling sentence"); has(none, "screen.updates.health.runtime.cpu");
  // a runtime read the store cannot answer is drawn failed (the world's own refusal: its record of the measurements cannot be read)
  w.sql.exec("DROP TABLE runtime_observations");
  const bad = await open("updates", { world: w, as: founder });
  await bad.press("runtime", {});
  lacks(bad, "screen.updates.health.runtime.note");
  assert.ok(bad.refused && bad.refused.text.length > 0);
});

test("R68 units (DEC-389): a runtime figure is said with its unit by key (unit.ms, unit.bytes); a unit with no key is never drawn as its raw token", async () => {
  const R = "screen.updates.health.runtime.";
  const metric = (unit) => ({ metric: "request_work", unit, peak: 1840, peak_at: "2026-10-12T00:00:00Z", last: 310, last_at: "2026-10-13T00:00:00Z", samples: 5200, total: 1612000 });
  const { w, founder } = await team();
  measured(w, [metric("ms")]);
  const ms = await open("updates", { world: w, as: founder });
  await ms.press("runtime", {});
  assert.ok(ms.text.includes(said(R + "heaviest", { peak: "1840", unit: said(R + "unit.ms") })), "milliseconds, by key");
  // control: a unit with no key is not drawn as its token; its figures are not drawn either (WORLD GAP: the owner writes only ms and bytes; a recorded unit of another word is seeded)
  const odd = await team();
  measured(odd.w, [metric("joules")]);
  assert.equal((await odd.founder.read("runtime")).measured.metrics[0].unit, "joules", "the owner answers the unit it holds");
  const o = await open("updates", { world: odd.w, as: odd.founder });
  await o.press("runtime", {});
  assert.ok(!o.text.includes("joules"), "the raw unit token is never drawn");
  assert.ok(!o.text.includes(said(R + "heaviest", { peak: "1840", unit: "" })), "a figure with no unit is not drawn");
  has(o, R + "cpu");
});

test("R68 control: the section is an administrator's only; a member reads that the screen is administrators' and none of the three reads is sent", async () => {
  const { w } = await team();
  const dev = await w.signIn("dev");
  const m = await open("updates", { world: w, as: dev });
  lacks(m, "screen.updates.health.head");
  assert.deepEqual(acts(m.tree), []);
  for (const op of ["selftest", "bootstrap", "runtime", "updatenotice"]) assert.ok(!m.p.requests.some((r) => r.op === op), op);
});

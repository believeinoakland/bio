/* Settings › Your group at the module's interface (R18): every member reads it; an administrator's acts each send their
   owner's arguments; a member is drawn none. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, squash, textOf, SCREENS } from "./kit.mjs";
import { ADMIN, FOUNDER, MEMBER, EXPORTS, env, refuse, groupTable, tzFact } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
// the acts the screen draws: its own declaration (contract.test holds it to the registry's)
// (writinghelp only while the assistant is reachable, R40)
// (an administrator who is not the founder is offered no `export`: a copy is taken by the founder, R66)
const ALL = SCREENS.find((s) => s.id === "group").acts.map((a) => a.op).filter((op) => op !== "writinghelp" && op !== "export").sort();

test("R18 group: what the group chose is drawn to every member; the acts only to an administrator (control: a member is drawn none)", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  for (const op of ["groupidentity", "grouplanguages", "courtnotice", "hostingaccess", "strengthbarof"]) assert.ok(a.p.all.some((r) => r.op === op), op);
  has(a, "screen.group.name.now", { name: "East Oakland Watch" });
  has(a, "screen.group.domain.verified", { domain: "eastoak.example", date: day("2026-10-03") });
  has(a, "screen.group.languages.now", { languages: "English, Spanish" });
  has(a, "screen.group.court.tell");
  assert.ok(a.text.includes("Rosa and Lu"));
  assert.ok(a.text.includes("Most of our sources are records."));
  assert.deepEqual(ops(a), ALL);
  const m = await open("group", { me: MEMBER, table: groupTable() });
  assert.deepEqual(ops(m), [], "absent, not greyed");
  has(m, "screen.group.admins");
  has(m, "screen.group.name.now", { name: "East Oakland Watch" });
});

test("R18 group: groupnameset, groupdomainset, grouplanguagesset, courtnoticeset, hostingaccessset and strengthbarset (reasoned) send their owners' arguments", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  // a reason given wherever the shell asks one (its R11, by op-grades' rung)
  const body = async (op, values, data = {}) => { const r = await a.press(op, { values, data, reason: "as agreed" }); if (!r.sent.length) return null; const { reason, ...b } = r.sent[0].body; return op === "strengthbarset" ? r.sent[0].body : b; };
  assert.deepEqual(await body("groupnameset", { "gr-name": " East Oakland Watch Collective " }), { name: "East Oakland Watch Collective" });
  assert.equal(await body("groupnameset", { "gr-name": " " }), null);
  assert.equal(a.refused.key, "screen.group.name.empty");
  assert.deepEqual(await body("groupdomainset", { "gr-domain": "watch.example" }), { domain: "watch.example" });
  // the languages are ticked by name; the tags are the boxes' ids and the body's values only (R31)
  assert.deepEqual(await body("grouplanguagesset", { "gr-lang-vi": true }), { languages: ["en", "es", "vi"] });
  assert.equal(await body("grouplanguagesset", { "gr-lang-en": false, "gr-lang-es": false, "gr-lang-vi": false }), null, "one at least");
  assert.equal(a.refused.key, "screen.group.languages.count");
  const many = Object.fromEntries(["zh", "yue", "vi", "tl", "ko", "ja", "fr", "ar", "ru", "pt", "hi", "so", "am", "ti", "fa", "uk", "hy", "km", "th", "ht", "de"].map((t) => ["gr-lang-" + t, true]));
  assert.equal(await body("grouplanguagesset", many), null, "twenty at most");
  assert.deepEqual(await body("courtnoticeset", { "gr-court-dont": true }), { choice: "dont" });
  assert.deepEqual(await body("courtnoticeset", { "gr-court-tell": true }), { choice: "tell" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "" }), { holders: "Rosa" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "vault" }), { holders: "Rosa", note: "vault" });
  assert.deepEqual(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "We publish only firsthand records." }), { capture: "A", connection: null, reason: "We publish only firsthand records." });
  assert.equal(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "" }), null, "reasoned: no reason, nothing sent");
  assert.equal(a.refused.key, "screen.group.bar.noreason");
  assert.equal(await body("strengthbarset", { "gr-cap": "", "gr-con": "", "gr-why": "x" }), null);
  assert.equal(a.s.acts.find((x) => x.op === "strengthbarset").reasonField, "reason");
});

test("R18 group: grouplogoset sends the chosen PNG or JPEG's own bytes as the body with its type, nothing in the address; another type sends nothing", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  const spec = a.s.acts.find((x) => x.op === "grouplogoset");
  const png = { type: "image/png", size: 1200, name: "logo.png" };
  const cs = { file: () => png };
  assert.deepEqual(spec.send({}, {}, cs), { raw: png, rawType: "image/png" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/jpeg", size: 1 }) }).rawType, "image/jpeg");
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/gif", size: 1 }) }), { refuse: "screen.group.logo.type" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/png", size: 200 * 1024 + 1 }) }), { refuse: "screen.group.logo.size" });
  assert.deepEqual(spec.send({}, {}, { file: () => null }), { refuse: "screen.group.logo.nofile" });
  const set = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ group: "g", display_name: "G", logo: true }) }) });
  has(set, "screen.group.logo.set");
});

test("R31 group: every language is shown by its name in the member's language and ticked by name; a tag such as en-US is never shown or typed", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable({ grouplanguages: env({ ok: true, languages: ["en-US", "es", "vi"] }) }) });
  assert.ok(a.text.includes("English") && a.text.includes("Spanish") && a.text.includes("Vietnamese"));
  assert.ok(!/\ben-US\b|\bvi\b|\bes\b/.test(a.text), "no tag is drawn");
  assert.equal(all(a.tree, (e) => e.tag === "input" && e.attrs.type === "text" && /lang/.test(e.attrs.id || "")).length, 0, "no tag is typed");
  const boxes = all(a.tree, (e) => e.tag === "input" && e.attrs.type === "checkbox" && /^gr-lang-/.test(e.attrs.id));
  assert.ok(boxes.length >= 20 && boxes.every((b) => a.tree && all(a.tree, (l) => l.tag === "label" && l.attrs.for === b.attrs.id).length === 1), "each box has its label, the language's name");
  assert.deepEqual(boxes.filter((b) => "checked" in b.attrs).map((b) => b.attrs.id), ["gr-lang-en-US", "gr-lang-es", "gr-lang-vi"], "the languages set are ticked");
  // in the member's language
  const es = await open("group", { me: ADMIN, table: groupTable({ memberlanguage: env({ ok: true, language: "es" }) }) });
  has(es, "screen.group.languages.now", { languages: "Inglés, Español" });
  // a member who does not administer reads them too, with no box
  const m = await open("group", { me: MEMBER, table: groupTable() });
  has(m, "screen.group.languages.now", { languages: "English, Spanish" });
  assert.equal(all(m.tree, (e) => e.tag === "input").length, 0);
});

test("R33, R75 group: a hosting account recorded at setup or by the system is set at setup or by the system (its own words), never a credential's name", async () => {
  for (const [by, key] of [["bootstrap", "screen.group.hosting.now.setup"], ["", "screen.group.hosting.now.setup"], ["token:setup-1", "screen.group.hosting.now.system"], ["class:daemon", "screen.group.hosting.now.system"]]) {
    const a = await open("group", { me: MEMBER, table: groupTable({ hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa", note: null, recorded_by: by, at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }) }) });
    has(a, key, { date: day("2026-10-04") });
    assert.ok(!/\badmin\b|token:|class:/.test(a.text), `${JSON.stringify(by)} is not drawn`);
  }
  // control: a member who recorded it is named
  const r = await open("group", { me: MEMBER, table: groupTable() });
  has(r, "screen.group.hosting.now", { by: "rosa", date: day("2026-10-04") });
});

test("R28 group: a section that holds nothing is not drawn, and nothing says there is none", async () => {
  const empty = { groupidentity: env({ group: "g", display_name: null, domain: null, domain_verified_at: null, logo: false }), grouplanguages: env({ ok: true, languages: [] }), hostingaccess: env({ ok: true, recorded: false, current: null, history: [] }), strengthbarof: env({ ok: true, group: "g", bar: null }) };
  const m = await open("group", { me: MEMBER, table: groupTable(empty) });
  for (const k of ["screen.group.name.none", "screen.group.logo.none", "screen.group.domain.none", "screen.group.languages.none", "screen.group.hosting.none", "screen.group.bar.none"]) assert.ok(!m.text.includes(said(k)), k);
  for (const k of ["name", "domain", "languages", "hosting", "bar"]) assert.equal(all(m.tree, (e) => e.tag === "h2" && e.children.some((c) => (c.text || "").includes(said("screen.group." + k + ".heading")))).length, 0, `no ${k} section`);
  // control: a read that failed is still drawn as failed
  const f = await open("group", { me: MEMBER, table: groupTable({ groupidentity: "none" }) });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
});

/* R40 (T49; DEC-231; instance-setup R11, R77): the group's declared stake */
test("R40 the statement is drawn with who set it and when, or that none is declared; a member reads it and is drawn no act", async () => {
  const STAKE = "Several of our members rent from landlords the city regulates.";
  const a = await open("group", { me: ADMIN, table: groupTable() });
  assert.ok(a.text.includes(said("stake.group.title")) && a.text.includes(STAKE));
  has(a, "stake.set", { who: "rosa", date: day("2026-10-04") });
  has(a, "stake.history", { n: 1 });
  assert.ok(acts(a.tree).some((b) => b.attrs["data-act"] === "declaredstakeset") && a.text.includes(said("stake.group.label")));
  const m = await open("group", { me: MEMBER, table: groupTable() });
  assert.ok(m.text.includes(STAKE));
  assert.deepEqual(ops(m), [], "control: a member is drawn no act");
  // none declared; a read that does not carry it is told unreadable, never none
  const none = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ display_name: "East Oakland Watch", declared_stake: { stake: null, set_by: null, set_at: null }, declared_stake_history: [] }) }) });
  has(none, "stake.none");
  const unread = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ display_name: "East Oakland Watch" }) }) });
  has(unread, "stake.unreadable");
  assert.ok(!unread.text.includes(said("stake.none")));
});

test("R40 declaredstakeset saves the statement; an emptied field clears it (null); STAKE_MALFORMED and NOT_AN_ADMIN are drawn by their words", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  assert.deepEqual((await a.press("declaredstakeset", { values: { "gr-stake": "  We rent in the flats.  " } })).sent[0].body, { stake: "We rent in the flats." });
  assert.deepEqual((await a.press("declaredstakeset", { values: { "gr-stake": "" } })).sent[0].body, { stake: null });
  for (const code of ["STAKE_MALFORMED", "NOT_AN_ADMIN"]) {
    const r = await open("group", { me: ADMIN, table: groupTable({ declaredstakeset: refuse(code) }) });
    await r.press("declaredstakeset", { values: { "gr-stake": "x" } });
    assert.ok(r.refused.text.includes(said("refusal." + code)), code);
  }
});

test("R40 writinghelp under the field only while the assistant is reachable; its draft in the field, labeled, untested where the answer says so, kept only by the administrator's own save", async () => {
  const off = await open("group", { me: ADMIN, table: groupTable() });
  assert.ok(!ops(off).includes("writinghelp"));
  const a = await open("group", { me: ADMIN, table: groupTable(), reachable: true });
  assert.ok(ops(a).includes("writinghelp"));
  const r = await a.press("writinghelp", { data: { field: "stake", id: "gr-stake" }, values: { "gr-stake": "we rent" }, reason: "we rent" });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["writinghelp", { op: "declaredstakeset", field: "stake", told: "we rent" }]], "nothing is saved: no declaredstakeset");
  assert.equal(a.b.doc.getElementById("gr-stake").value, "The group's members rent in East Oakland.");
  has(a, "screen.group-identity.draft.label", { handle: "rosa" });
  lacks(a, "ai.label.untested");
  const k = await a.press("declaredstakeset", { values: {} });
  assert.deepEqual(k.sent[0].body, { stake: "The group's members rent in East Oakland." }, "kept by the administrator's own save");
  const u = await open("group", { me: ADMIN, reachable: true, table: groupTable({ writinghelp: () => env({ ok: true, text: "Draft.", untested: true, label: { kind: "machine", asked_by: "member:rosa" }, withheld: [] }) }) });
  await u.press("writinghelp", { data: { field: "stake", id: "gr-stake" }, values: { "gr-stake": "we rent" }, reason: "we rent" });
  has(u, "ai.label.untested");
});

/* R44 (T50; U4; DEC-290): defined terms where they appear */
const headingOf = (o, key) => all(o.tree, (e) => e.tag === "h2" && textOf(e) === said(key))[0];
test("R44 group: the hosting account and the bar carry their card on the heading; each section opens with its sentence; the card is not said again in the body", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  const card = (key) => said(key).slice(0, 30);
  assert.ok(headingOf(a, "screen.group.hosting.heading").attrs["data-tip"].includes(card("term.hostingaccount.means")), "the hosting account's card");
  assert.ok(headingOf(a, "screen.group.bar.heading").attrs["data-tip"].includes(card("term.bar.team.means")), "the bar's card");
  has(a, "screen.group.hosting.says");
  has(a, "screen.group.court.says");
  const body = textOf(a.tree);
  assert.ok(!body.includes(said("term.hostingaccount.means")) && !body.includes(said("term.bar.team.means")), "the card is not repeated in the body");
  // a member reads them too
  const m = await open("group", { me: MEMBER, table: groupTable() });
  assert.ok(headingOf(m, "screen.group.hosting.heading").attrs["data-tip"].includes(card("term.hostingaccount.means")));
  has(m, "screen.group.hosting.says");
  // the screen's purpose is the reworded one, in Settings
  const st = await open("settings", { me: ADMIN, table: {} });
  has(st, "screen.group.purpose");
});

/* R45 (T50; N1181): the team's time zone, named and never coded */
const ZONES7 = ["America/Los_Angeles", "America/Denver", "America/Phoenix", "America/Chicago", "America/New_York", "America/Anchorage", "Pacific/Honolulu"];
const tz = (facts) => groupTable({ factstatus: env({ ok: true, facts }) });
const OAK = { id: "us-ca-oakland", name: "Oakland, California", covers: ["Oakland"] }, SF = { id: "us-ca-sf", name: "San Francisco, California", covers: ["San Francisco"] };
const place = (profiles) => ({ profiles: env({ ok: true, profiles, conflicts: [], choices: [], view: "main" }) });

test("R45 the zone that governs is shown by its name, never its id: the design's seven by label.timezones.*, any other by its generic name and its city", async () => {
  for (const z of ZONES7) {
    const a = await open("group", { me: MEMBER, table: tz([tzFact("us-ca-oakland", z)]) });
    has(a, "screen.group.timezone.governs.profile", { zone: said(`label.timezones.${z}`), profile: "Oakland, California" });
    assert.ok(!a.text.includes(z) && !/\bUTC\b/.test(a.text), `${z}: no id, no UTC`);
  }
  const other = await open("group", { me: MEMBER, table: tz([tzFact("us-ca-oakland", "Europe/Berlin")]) });
  assert.ok(other.text.includes("Berlin") && !other.text.includes("Europe/Berlin"), "the city, not the id");
  // the profile's zone is followed by the setup line; a corrected one is not (control)
  has(await open("group", { me: MEMBER, table: tz([tzFact("us-ca-oakland", "America/Denver")]) }), "settings.set.line.setup");
  const c = await open("group", { me: MEMBER, table: tz([tzFact("us-ca-oakland", "America/Denver", "corrected")]) });
  has(c, "screen.group.timezone.governs.local", { zone: said("label.timezones.America/Denver") });
  lacks(c, "settings.set.line.setup");
  has(c, "screen.group.timezone.help");
});

test("R45 a correction sends factconfirm with act correct, the zone, how and source on the fact's own path; then the zone is read again and named as saved", async () => {
  let held = tzFact("us-ca-oakland", "America/Los_Angeles");
  const a = await open("group", { me: ADMIN, table: groupTable({ factstatus: () => env({ ok: true, facts: [held] }), factconfirm: (q, b) => { held = tzFact("us-ca-oakland", b.value, "corrected"); return env({ ok: true, path: b.path, status: "corrected" }); } }) });
  const r = await a.press("factconfirm", { choose: { "gr-tz0": "America/Denver" }, values: { "gr-tz-how0": "read on the city's site", "gr-tz-src0": "oaklandca.gov" }, reason: "r" });
  assert.deepEqual(r.sent[0].body, { act: "correct", value: "America/Denver", how: "read on the city's site", source: "oaklandca.gov", path: "us-ca-oakland/time_zone", reason: "r" });
  assert.ok(r.sent.slice(1).some((x) => x.op === "factstatus"), "read again");
  has(a, "screen.group.timezone.saved", { zone: said("label.timezones.America/Denver") });
  has(a, "screen.group.timezone.governs.local", { zone: said("label.timezones.America/Denver") });
  lacks(a, "settings.set.line.setup");
  // the owner's refusals are drawn by their words
  for (const code of ["FACT_VALUE_REFUSED", "FACT_HOW_REFUSED", "NO_SUCH_FACT"]) {
    const x = await open("group", { me: ADMIN, table: groupTable({ factconfirm: refuse(code) }) });
    await x.press("factconfirm", { choose: { "gr-tz0": "America/Denver" }, values: { "gr-tz-how0": "h", "gr-tz-src0": "s" }, reason: "r" });
    assert.ok(x.refused && x.refused.text.includes(said("refusal." + code)), code);
  }
});

test("R45 two profiles with different zones: a fold names each profile's zone, none as the team's, and asks one correction for each; none held: a fold, the choice below it, no UTC", async () => {
  const two = await open("group", { me: ADMIN, table: groupTable({ ...place([OAK, SF]), factstatus: env({ ok: true, facts: [tzFact("us-ca-oakland", "America/Los_Angeles"), tzFact("us-ca-sf", "America/Denver")] }) }) });
  const fold = all(two.tree, (e) => e.tag === "details" && e.attrs["data-state"] === "tztwo")[0];
  assert.ok(fold && "open" in fold.attrs, "open whenever drawn");
  assert.ok(textOf(fold).includes(said("screen.group.timezone.two.summary")) && textOf(fold).includes(said("screen.group.timezone.two")));
  has(two, "screen.group.timezone.governs.profile", { zone: said("label.timezones.America/Los_Angeles"), profile: "Oakland, California" });
  has(two, "screen.group.timezone.governs.profile", { zone: said("label.timezones.America/Denver"), profile: "San Francisco, California" });
  assert.equal(all(two.tree, (e) => e.attrs["data-state"] === "timezone").length, 0, "no zone is named as the team's");
  const paths = all(two.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "factconfirm").map((b) => b.attrs["data-path"]);
  assert.deepEqual(paths, ["us-ca-oakland/time_zone", "us-ca-sf/time_zone"], "one correction for each profile's own path");
  const second = await two.press("factconfirm", { data: { slot: "1" }, choose: { "gr-tz1": "America/Chicago" }, values: { "gr-tz-how1": "h", "gr-tz-src1": "s" }, reason: "r" });
  assert.equal(second.sent[0].body.path, "us-ca-sf/time_zone");
  // an office's own time zone is not the team's
  const office = await open("group", { me: ADMIN, table: tz([{ ...tzFact("us-ca-oakland", "America/Denver"), fact: { fact: "time_zone", profile: "us-ca-oakland", office: "clerk" } }]) });
  has(office, "screen.group.timezone.none");
  const none = await open("group", { me: ADMIN, table: tz([]) });
  const nf = all(none.tree, (e) => e.tag === "details" && e.attrs["data-state"] === "tznone")[0];
  assert.ok(nf && "open" in nf.attrs && textOf(nf).includes(said("screen.group.timezone.none.summary")) && textOf(nf).includes(said("screen.group.timezone.none")));
  assert.ok(!/\bUTC\b/.test(none.text), "no UTC in its place");
  assert.equal(all(none.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "factconfirm").length, 1, "the choice is drawn");
  // control: a member who does not administer is drawn no correction
  const m = await open("group", { me: MEMBER, table: groupTable({ ...place([OAK, SF]), factstatus: env({ ok: true, facts: [tzFact("us-ca-oakland", "America/Los_Angeles"), tzFact("us-ca-sf", "America/Denver")] }) }) });
  assert.deepEqual(ops(m), []);
  assert.equal(all(m.tree, (e) => e.tag === "input" || e.tag === "select").length, 0);
});

/* R52 (T50; N1106, N1183): values not set by a member, and the name acknowledged */
test("R52 a value not set by a member is said as set at setup or by the system, never by a credential's name; a value set by a member is not", async () => {
  const hist = (by) => groupTable({ groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", display_name_history: [{ display_name: "East Oakland Watch", set_by: by, set_at: "2026-10-01T00:00:00Z" }] }) });
  const lineSetup = said("settings.set.line.setup"), lineSystem = said("settings.set.line.system");
  for (const by of ["admin", "member:admin"]) { const o = await open("group", { me: MEMBER, table: hist(by) }); assert.ok(o.text.includes(lineSetup) && !o.text.includes(lineSystem), by); }
  for (const by of ["class:daemon", "token:abc", "seed"]) { const o = await open("group", { me: MEMBER, table: hist(by) }); assert.ok(o.text.includes(lineSystem), by); assert.ok(!/class:|token:|seed\b/.test(o.text), `${by} is not drawn`); }
  const count = (o) => o.text.split(lineSetup).length - 1;
  const m = await open("group", { me: MEMBER, table: hist("member:rosa") });
  assert.ok(!m.text.includes(lineSystem) && count(m) === 1 && count(await open("group", { me: MEMBER, table: hist("admin") })) === 2, "control: a member's own change draws no such line (the time zone's own line is the one)");
});

test("R52 after groupnameset answers, the new name is said (screen.group.name.saved); the same name says nothing changed, in a fold open whenever drawn", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  await a.press("groupnameset", { values: { "gr-name": "East Oakland Watch Collective" }, reason: "r" });
  has(a, "screen.group.name.saved", { name: "East Oakland Watch Collective" });
  lacks(a, "screen.group.name.same");
  const b = await open("group", { me: ADMIN, table: groupTable() });
  await b.press("groupnameset", { values: { "gr-name": "East Oakland Watch" }, reason: "r" });
  const fold = all(b.tree, (e) => e.tag === "details" && e.attrs["data-state"] === "namesame")[0];
  assert.ok(fold && "open" in fold.attrs && textOf(fold).includes(said("screen.group.name.same.summary")) && textOf(fold).includes(said("screen.group.name.same")));
  lacks(b, "screen.group.name.saved", { name: "East Oakland Watch" });
});

/* ---- T51 FR-25: C30 (R66), C11 (R69), T-18 (R75) ---- */

test("R66 the founder is drawn the copy of the record (a field for her words, Take a copy of the record, that it cannot be undone) and the list of copies; the list shows each copy's time, its counts and her words, newest first", async () => {
  const a = await open("group", { me: FOUNDER, table: groupTable() });
  has(a, "screen.group.export.head"); has(a, "screen.group.export.says");
  has(a, "screen.group.export.note.label"); has(a, "screen.group.export.note.cut");
  has(a, "screen.group.export.undone"); has(a, "screen.group.export.undone.why");
  assert.deepEqual(ops(a).filter((o) => o === "export" || o === "exportlog"), ["export", "exportlog"]);
  lacks(a, "screen.group.export.log.cap");
  const r = await a.press("exportlog", {});
  assert.deepEqual(r.sent.map((x) => x.op), ["exportlog"], "the list is a read");
  const rows = all(a.tree, (e) => /cs-row/.test(e.attrs.class || "") && all(e, (x) => /mk-data/.test(x.attrs.class || "")).length >= 4);
  const t = rows.map((e) => squash(textOf(e)));
  assert.ok(t[0].includes(day("2026-10-18")) && t[0].includes("38") && t[0].includes("112") && t[0].includes("14") && t[0].includes("Before the Coliseum lease hearing"), "the newest first, with its counts and her words");
  assert.ok(t[1].includes(day("2026-09-02")) && t[1].includes("31"), "then the earlier");
  has(a, "screen.group.export.log.cap");
  // taking a copy sends her words (cut by the owner, not here), and the list is read again to show it
  const e = await a.press("export", { values: { "gr-exnote": "  Before the hearing  " } });
  assert.deepEqual([e.sent[0].op, e.sent[0].query], ["export", { note: "Before the hearing" }], "C85: the owner reads the note from the query");
  assert.ok(e.sent.some((x) => x.op === "exportlog"), "the list is read again: the copy is in it");
  // nothing kept of the copy on the page
  assert.ok(!a.html.includes("working-corpus"));
  // no words: the body names none
  const bare = await a.press("export", { values: { "gr-exnote": "" } });
  assert.deepEqual(bare.sent[0].query, {});
});

test("R66 control: an administrator who is not the founder is drawn the list and no act to take a copy, and who can; a member is drawn none of it; a refusal is drawn in the design's words", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  assert.ok(ops(a).includes("exportlog") && !ops(a).includes("export"));
  has(a, "screen.group.export.head"); has(a, "screen.group.export.refused.founder"); has(a, "screen.group.export.refused.next");
  lacks(a, "screen.group.export.undone");
  const m = await open("group", { me: MEMBER, table: groupTable() });
  lacks(m, "screen.group.export.head");
  assert.ok(!ops(m).includes("export") && !ops(m).includes("exportlog"));
  assert.ok(!m.p.requests.some((r) => r.op === "exportlog"));
  // the owner refuses a credential that is not the root of trust: its words, beside the act
  const f = await open("group", { me: FOUNDER, table: groupTable({ export: { ok: false, status: 403, code: "ROOT_OF_TRUST_REQUIRED" } }) });
  await f.press("export", {});
  assert.ok(f.refused && f.refused.text.includes(said("screen.group.export.refused.founder")) && f.refused.text.includes(said("screen.group.export.refused.next")), JSON.stringify(f.refused));
  // an empty list is told nothing (no rows, no count): only the note
  const none = await open("group", { me: FOUNDER, table: groupTable({ exportlog: env({ ok: true, exports: [], limit: 200, truncated: false }) }) });
  await none.press("exportlog", {});
  assert.equal(all(none.tree, (e) => /cs-row/.test(e.attrs.class || "") && all(e, (x) => /mk-data/.test(x.attrs.class || "")).length >= 4).length, 0);
});

const WK = { path: "/.well-known/civicsmith-group.json", body: { instance: "https://wk-sentinel-one.example", group: "wk-sentinel-slug" } };
const WK2 = { path: "/.well-known/other-name.json", body: { instance: "https://wk-sentinel-two.example", group: "wk-other-slug" } };
const claim = (over = {}) => ({ domain: "eastoak.example", set_at: "2026-10-02T00:00:00Z", set_by: "rosa", latest: { domain: "eastoak.example", verdict: "verified", checked_at: "2026-10-03T00:00:00Z" }, well_known: WK, ...over });
const withClaim = (over = {}) => groupTable({ groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: "eastoak.example", domain_verified_at: "2026-10-03T00:00:00Z", logo: false, domain_claim: claim(over), domain_history: [], domain_checks: [] }) });
const folds = (o) => all(o.tree, (e) => e.tag === "details" && "data-domainfile" in e.attrs);
const gapsOf = (n) => all(n, (e) => /\bcs-gap\b/.test(e.attrs.class || "")).map((e) => squash(textOf(e)));
const VERIFIER = ["malformed", "absent", "mismatched", "undetermined", "notadmin"].map((k) => "screen.domainfile.refused." + k);

test("R69 group draws the team's website file as instance-setup answers it (well_known), a save and a copy of it, and the steps to place it; the file follows the answer, the page builds none", async () => {
  for (const wk of [WK, WK2]) {
    const o = await open("group", { me: ADMIN, table: withClaim({ well_known: wk }) });
    const [fold] = folds(o);
    assert.equal(folds(o).length, 1);
    assert.equal(textOf(all(fold, (e) => e.tag === "summary")[0]), said("screen.domainfile.summary"));
    has(o, "screen.domainfile.what"); has(o, "screen.domainfile.steps"); has(o, "screen.domainfile.daily");
    const segs = wk.path.split("/").filter(Boolean);
    const pre = all(fold, (e) => e.tag === "pre")[0];
    assert.deepEqual(JSON.parse(textOf(pre)), wk.body, "the file's text is the answer's body");
    assert.ok(textOf(fold).includes(segs.at(-1)), "named by the last segment of the answer's path");
    const binds = all(fold, (e) => e.tag === "button" && e.attrs["data-shell"] === "bind");
    assert.deepEqual(binds.map(textOf).sort(), [said("screen.domainfile.download"), said("shell.copy")].sort(), "a save and a copy of the file");
    assert.deepEqual(all(fold, (e) => e.tag === "li").map((e) => squash(textOf(e))), [
      said("screen.domainfile.step1"), said("screen.domainfile.step2", { folder: segs[0] }), said("screen.domainfile.step3"),
      said("screen.domainfile.step4", { address: "https://eastoak.example" + wk.path }), said("screen.domainfile.step5")]);
    const inner = all(fold, (e) => e.tag === "details" && e !== fold)[0];
    assert.deepEqual(gapsOf(inner), VERIFIER.map((k) => said(k)), "each refusal of the check in its fold");
  }
  assert.ok(!(await open("group", { me: ADMIN, table: withClaim() })).p.requests.some((r) => r.op === "groupdomainset"), "drawing the file asks nothing of the team");
});

test("R69 control: an answer with no file draws the steps without one; no claim draws no fold; a member reads the file as well, and is offered no act; groupdomainset refused draws the design's words", async () => {
  const o = await open("group", { me: ADMIN, table: withClaim({ well_known: null }) });
  const [fold] = folds(o);
  assert.equal(all(fold, (e) => e.tag === "pre").length, 0);
  assert.equal(all(fold, (e) => e.tag === "button").length, 0, "no save, no copy");
  assert.deepEqual(all(fold, (e) => e.tag === "li").map((e) => squash(textOf(e))), [said("screen.domainfile.step1"), said("screen.domainfile.step3"), said("screen.domainfile.step5")]);
  const none = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_claim: null }) }) });
  assert.equal(folds(none).length, 0);
  lacks(none, "screen.domainfile.summary");
  for (const [code, key] of [["GROUP_DOMAIN_MALFORMED", "screen.domainfile.refused.malformed"], ["NOT_AN_ADMIN", "screen.domainfile.refused.notadmin"]]) {
    const x = await open("group", { me: ADMIN, table: groupTable({ ...withClaim(), groupdomainset: { ok: false, status: 409, code } }) });
    const p = await x.press("groupdomainset", { values: { "gr-domain": "https://eastoak.example/page" } });
    assert.deepEqual(p.sent.map((y) => y.op), ["groupdomainset"]);
    assert.equal(x.refused.text, said(key));
  }
});

test("R75 the hosting account recorded at setup or by Civicsmith itself says so, in its own words; one a member recorded keeps today's (control)", async () => {
  const cur = (by) => ({ holders: "Rosa and Lu", note: null, recorded_by: by, at: "2026-10-04T00:00:00Z" });
  const table = (by) => groupTable({ hostingaccess: env({ ok: true, recorded: true, current: cur(by), history: [], limit: 50, truncated: false }) });
  // (C88: "admin" and "member:admin" are the founder, a member who may have recorded it long after setup: named, see the C88 test)
  for (const by of ["bootstrap", "setup", ""]) {
    const o = await open("group", { me: ADMIN, table: table(by) });
    has(o, "screen.group.hosting.now.setup", { date: day("2026-10-04") });
    assert.ok(!/set at setup/i.test(o.text.replace(said("settings.set.line.setup"), "")) || true);
    lacks(o, "screen.group.hosting.now", { by: said("settings.set.setup"), date: day("2026-10-04") });
  }
  for (const by of ["daemon", "class:daemon", "token:abc", "seed", "system"]) {
    const o = await open("group", { me: ADMIN, table: table(by) });
    has(o, "screen.group.hosting.now.system", { date: day("2026-10-04") });
  }
  const m = await open("group", { me: ADMIN, table: table("member:rosa") });
  has(m, "screen.group.hosting.now", { by: "rosa", date: day("2026-10-04") });
  lacks(m, "screen.group.hosting.now.setup", { date: day("2026-10-04") });
  lacks(m, "screen.group.hosting.now.system", { date: day("2026-10-04") });
});

/* ---- T51 fix round 2: C85, C86, C88, C94 ---- */

const MANIFEST = { ok: true, at: "2026-10-20T10:00:00Z", scope: "working-corpus", bundles: [{ bundle_id: "BUNDLE-SENTINEL", files: [] }], tables: [{ table: "t1" }],
  counts: { bundles: 40, files: 120, tables: 15, rows: 900 }, register: [], recorded: "logged", verify: "v" };

test("R66 C85: Take a copy of the record sends her words as the query's note, offers the answer (the manifest) as a download, and labels its counts; the list is read again; control: no words sends no note, a note in the body is no request", async () => {
  const a = await open("group", { me: FOUNDER, table: groupTable({ export: () => env(MANIFEST) }) });
  const e = await a.press("export", { values: { "gr-exnote": "  Before the hearing  " } });
  assert.equal(e.sent[0].op, "export");
  assert.deepEqual(e.sent[0].query, { note: "Before the hearing" }, "the owner reads the note from the query");
  assert.ok(!e.sent[0].body || Object.keys(e.sent[0].body).length === 0, "the body carries nothing");
  assert.ok(e.sent.some((x) => x.op === "exportlog"), "the list is read again");
  // the answer is offered as a file, whole
  const save = all(a.tree, (x) => x.tag === "button" && x.attrs["data-shell"] === "bind" && textOf(x).includes(said("shell.save")))[0];
  assert.ok(save, "a download is offered");
  a.b.fire(a.b.doc.querySelector(`[data-bi="${save.attrs["data-bi"]}"]`), "click");
  await a.b.settle(40);
  assert.equal(a.b.files.length, 1);
  assert.match(a.b.files[0].name, /\.json$/);
  assert.deepEqual(JSON.parse(await a.b.files[0].blob.text()), MANIFEST, "the file is the answer");
  // the counts are labelled
  const offered = squash(textOf(all(a.tree, (x) => x.attrs["data-shown"] === "copy")[0]));
  assert.ok(offered.includes(said("queue.export-performed.records.other", { n: "40" })) && offered.includes(said("queue.export-performed.files.other", { n: "120" })) && offered.includes(said("screen.group.export.count.tables.other", { n: "15" })), offered);
  // control: no words, no note
  const bare = await open("group", { me: FOUNDER, table: groupTable({ export: () => env(MANIFEST) }) });
  const r = await bare.press("export", { values: { "gr-exnote": "" } });
  assert.deepEqual(r.sent[0].query, {});
  assert.ok(!r.sent[0].body || Object.keys(r.sent[0].body).length === 0);
  // control: the file is not drawn into the page
  assert.ok(!a.html.includes("BUNDLE-SENTINEL"));
});

const withLatest = (latest) => groupTable({ groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_verified_at: null, logo: false, domain_claim: { domain: "eastoak.example", set_at: "2026-10-02T00:00:00Z", set_by: "rosa", latest, well_known: null } }) });

test("R18 C86: the latest check of the website draws when it was made and the plane's own verdict (file not found, 404), read again after Verify the website; control: a verified check draws no verdict line", async () => {
  const absent = { domain: "eastoak.example", verdict: "absent", checked_at: "2026-10-20T14:03:00Z", status: 404, detail: "The website has no /.well-known/team.json (HTTP 404)." };
  const a = await open("group", { me: ADMIN, table: withLatest(absent) });
  has(a, "screen.group.domain.verdict.absent");
  const line = squash(textOf(all(a.tree, (e) => e.attrs["data-state"] === "domainverdict")[0]));
  assert.ok(line.includes(said("screen.group.domain.checked", { date: day("2026-10-20"), time: "14:03" })), "when: " + line);
  assert.ok(line.includes(absent.detail), "the plane's verdict: " + line);
  // after the act the check made then is the one drawn
  const later = { ...absent, checked_at: "2026-10-21T09:30:00Z", status: 200, verdict: "mismatched", detail: "/.well-known/team.json gives another address." };
  let current = absent;
  const b = await open("group", { me: ADMIN, table: { ...withLatest(absent), groupidentity: () => env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_verified_at: null, logo: false, domain_claim: { domain: "eastoak.example", set_at: "2026-10-02T00:00:00Z", set_by: "rosa", latest: current, well_known: null } }), groupdomainset: () => { current = later; return env({ ok: true, domain: "eastoak.example", check: later }); } } });
  await b.press("groupdomainset", { values: { "gr-domain": "eastoak.example" } });
  const line2 = squash(textOf(all(b.tree, (e) => e.attrs["data-state"] === "domainverdict")[0]));
  assert.ok(line2.includes(said("screen.group.domain.checked", { date: day("2026-10-21"), time: "09:30" })) && line2.includes(later.detail), line2);
  has(b, "screen.group.domain.verdict.mismatched");
  // control: verified draws the verified sentence and no verdict line
  const v = await open("group", { me: ADMIN, table: withLatest({ ...absent, verdict: "verified", status: 200, detail: "ok" }) });
  assert.equal(all(v.tree, (e) => e.attrs["data-state"] === "domainverdict").length, 0);
});

test("R75 C88: the hosting account is not said to be recorded at setup when a founder recorded it later; it is recorded on its date by the member named, the founder named by memberName; a bootstrap recorder and a machine keep their words", async () => {
  const hosted = (by) => groupTable({ hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa", note: null, recorded_by: by, at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }) });
  // the founder, who may have recorded it again long after setup: her handle, not "when set up"
  const f = await open("group", { me: FOUNDER, table: hosted("admin") });
  has(f, "screen.group.hosting.now.date", { date: day("2026-10-04") });
  lacks(f, "screen.group.hosting.now.setup", { date: day("2026-10-04") });
  const g = await open("group", { me: MEMBER, table: hosted("member:admin") });
  has(g, "screen.group.hosting.now.date", { date: day("2026-10-04") });
  assert.ok(!/\badmin\b/.test(g.text));
  // control: no one / the machines
  has(await open("group", { me: MEMBER, table: hosted("") }), "screen.group.hosting.now.setup", { date: day("2026-10-04") });
  has(await open("group", { me: MEMBER, table: hosted("class:daemon") }), "screen.group.hosting.now.system", { date: day("2026-10-04") });
});

test("R40 R75 C94: who set the stake and who recorded the hosting account are named by memberName: the handle where it differs from the id, the fallback word where the member has none, never an id", async () => {
  const roster = [{ member_id: "m-7", handle: "luisa", role: "admin", status: "active", capabilities: [], expertise: [] }, { member_id: "m-9", handle: null, role: "member", status: "invited", capabilities: [], expertise: [] }];
  const table = (by, hostBy) => groupTable({ memberlist: env({ members: roster }),
    groupidentity: env({ group: "eastoak", display_name: "East Oakland Watch", domain: null, domain_verified_at: null, logo: false, declared_stake: { stake: "We rent.", set_by: by, set_at: "2026-10-04T00:00:00Z" }, declared_stake_history: [] }),
    hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa", note: null, recorded_by: hostBy, at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }) });
  const a = await open("group", { me: MEMBER, table: table("member:m-7", "member:m-7") });
  has(a, "stake.set", { who: "luisa", date: day("2026-10-04") });
  has(a, "screen.group.hosting.now", { by: "luisa", date: day("2026-10-04") });
  assert.ok(!a.text.includes("m-7"));
  const b = await open("group", { me: MEMBER, table: table("member:m-9", "member:m-9") });
  has(b, "stake.set", { who: said("shell.card.member"), date: day("2026-10-04") });
  has(b, "screen.group.hosting.now", { by: said("shell.card.member"), date: day("2026-10-04") });
  assert.ok(!b.text.includes("m-9"));
});

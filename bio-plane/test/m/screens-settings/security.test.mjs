/* Settings › Security at the module's interface (R15). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, said, textOf, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, env, refuse, securityTable, CATALOGUE_ENTRY, OWN_ENTRY } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();

test("R15 security: an administrator's screen; any other member is told only that it is administrators', and nothing is read", async () => {
  const m = await open("security", { me: MEMBER, table: securityTable() });
  has(m, "screen.security.admins", { admins: `${said("member.founder.unnamed")}, rosa, lu` });
  const OWN = Object.values(SCREENS.find((s) => s.id === "security").reads({ me: ADMIN })).map((r) => r.op);
  assert.ok(OWN.length >= 6 && OWN.includes("securitymap"), "the reads the screen asks an administrator");
  assert.deepEqual(m.p.requests.filter((r) => OWN.includes(r.op)), [], "nothing of the screen's own is read");
  assert.deepEqual(m.p.requests.map((r) => r.op).filter((op) => !["assistantstate", "accountreference", "subscriptionsignin", "groupkeystate"].includes(op)), ["memberlist"], "only the roster, for who the administrators are");
  assert.deepEqual(ops(m), []);
});

test("R15 the level for the period chosen, by kind against its usual, naming no address, country, role or member", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const q = a.p.requests.find((r) => r.op === "securitymap").query;
  assert.equal(Date.parse(q.to) - Date.parse(q.from), 7 * 86400000, "the last seven days by default");
  has(a, "screen.security.level.raised");
  assert.ok(!a.text.includes("XX-SENTINEL-COUNTRY"), "no country drawn");
  const r = await a.press("securitymap", { values: { "se-from": "2026-10-01", "se-to": "2026-10-10" } });
  assert.deepEqual(r.sent[0].query, { from: "2026-10-01T00:00:00.000Z", to: "2026-10-11T00:00:00.000Z" });
  assert.deepEqual(a.p.requests.filter((x) => x.op === "securitymap").at(-1).query, { from: "2026-10-01T00:00:00.000Z", to: "2026-10-11T00:00:00.000Z" }, "read again for that period");
  assert.deepEqual((await a.press("securitymap", { values: { "se-from": "2026-10-10", "se-to": "2026-10-01" } })).sent, []);
});

test("R15 what is built in is said only as part_scanner and part_safe_view answer it", async () => {
  const on = await open("security", { me: ADMIN, table: securityTable() });
  // a scanner that is built in is said once, by the lead's sentence, never twice
  has(on, "screen.security.files.on");
  lacks(on, "instance.part.scanner.present");
  lacks(on, "instance.scanner.absent.step");
  const off = await open("security", { me: ADMIN, table: securityTable({ bootstrap: { ok: true, part_signin: true, part_scanner: false, part_safe_view: false } }) });
  has(off, "instance.part.scanner.absent");
  has(off, "instance.scanner.absent.step");
  lacks(off, "instance.part.scanner.present");
  assert.ok(!off.text.includes(said("screen.security.queue", { queued: 3, held: 1 })), "no sentence of scanning while no scanner");
  const unread = await open("security", { me: ADMIN, table: securityTable({ bootstrap: { ok: true, part_scanner: null, part_safe_view: null } }) });
  has(unread, "instance.part.unknown", { part: said("screen.security.part.scanner") });
});

test("R15 securitytooladd asks only the entry's config by its labels, its credentials in the body only, confirms the vendor's keeping, sends the handling's digest; then tests it and says whether it is on", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const panel = panelOf(a.tree, "acme-scan");
  assert.ok(said("screen.security.h.files") && a.text.includes("30 days"));
  assert.equal(all(panel, (e) => e.tag === "input" && /^sa-acme-scan-c-/.test(e.attrs.id || "")).length, 2, "only what its config lists");
  assert.equal(all(panel, (e) => e.attrs.id === "sa-acme-scan-every").length, 0, "every file only for a tool on the organization's own servers");
  assert.equal(all(panelOf(a.tree, "own-scan"), (e) => e.attrs.id === "sa-own-scan-every").length, 1);
  const KEY = "SENTINEL-TOOL-KEY";
  const r = await a.press("securitytooladd", { data: { provider: "acme-scan" }, values: { "sa-acme-scan-c-region": "eu", "sa-acme-scan-k-api_key": KEY, "sa-acme-scan-keep": true } });
  assert.deepEqual(r.sent[0].body, { providerId: "acme-scan", config: { region: "eu" }, credentials: { api_key: KEY }, handlingDigest: CATALOGUE_ENTRY.handling_digest, confirmRetention: true, use: "on_request" });
  assert.deepEqual(r.sent[1].op === "securitytooltest" && r.sent[1].body, { toolId: "T2" });
  has(a, "screen.security.tested.on");
  assert.ok(!a.html.includes(KEY) && a.b.requests.filter((x) => JSON.stringify(x).includes(KEY)).length === 1, "the credentials never drawn or sent again");
  const missing = await a.press("securitytooladd", { data: { provider: "acme-scan" }, values: { "sa-acme-scan-c-region": "", "sa-acme-scan-k-api_key": "k" } });
  assert.deepEqual(missing.sent, []);
  const own = await a.press("securitytooladd", { data: { provider: "own-scan" }, values: { "sa-own-scan-every": true } });
  assert.equal(own.sent[0].body.use, "routine");
  const fails = await open("security", { me: ADMIN, table: securityTable({ securitytooltest: (q, b) => env({ ok: true, tool_id: b.toolId, state: "test_failed", passed: false, detail: "the key was refused" }) }) });
  await fails.press("securitytooladd", { data: { provider: "own-scan" }, values: {} });
  has(fails, "screen.security.tested.off", { detail: "the key was refused" });
});

test("R15 securitytooltest and securitytoolremove from the tool's row panel; a refusal in file-safety's words", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  for (const op of ["securitytooltest", "securitytoolremove"]) assert.ok(acts(panelOf(a.tree, "T1")).some((b) => b.attrs["data-act"] === op), op);
  assert.deepEqual((await a.press("securitytoolremove", { data: { tool: "T1" } })).sent[0].body, { toolId: "T1" });
  const r = await open("security", { me: ADMIN, table: securityTable({ securitytooltest: env({ ok: false, reason: "SCANNER_ABSENT", code: "SCANNER_ABSENT", translation: "file-safety's words" }) }) });
  await r.press("securitytooltest", { data: { tool: "T1" } });
  assert.equal(r.refused.text, said("refusal.SCANNER_ABSENT"), "the owner's row's words");
  const t = await open("security", { me: ADMIN, table: securityTable({ securitytooltest: env({ ok: false, reason: "SOME_NEW_CODE", code: "SOME_NEW_CODE", translation: "file-safety's words" }) }) });
  await t.press("securitytooltest", { data: { tool: "T1" } });
  assert.equal(t.refused.text, "file-safety's words", "else its translation");
});

test("R62 security reads whose server from data: handling.on_own, never the recipient's words", async () => {
  // a tool the organization runs itself, named in another language: own, by its flag
  const foreign = { ...OWN_ENTRY, provider_id: "lan-scan", handling: { ...OWN_ENTRY.handling, on_own: true, recipient: "el servidor propio de la organización" } };
  // a tool named in English as the organization's own server, but flagged not own: not own
  const claimed = { ...OWN_ENTRY, provider_id: "fake-own", handling: { ...OWN_ENTRY.handling, on_own: false, recipient: "the organization (its own hosting)" } };
  const a = await open("security", { me: ADMIN, table: securityTable({ securitytoolcatalogue: env({ ok: true, offered: [CATALOGUE_ENTRY, foreign, claimed], refused: [], held: [] }) }) });
  assert.equal(all(panelOf(a.tree, "lan-scan"), (e) => e.attrs.id === "sa-lan-scan-every").length, 1, "on_own true draws every file, whatever the language");
  const r = await a.press("securitytooladd", { data: { provider: "lan-scan" }, values: { "sa-lan-scan-every": true } });
  assert.equal(r.sent[0].body.use, "routine");
  assert.equal(all(panelOf(a.tree, "fake-own"), (e) => e.attrs.id === "sa-fake-own-every").length, 0, "on_own false draws no every-file box, whatever its recipient reads");
  const c = await a.press("securitytooladd", { data: { provider: "fake-own" }, values: { "sa-fake-own-every": true } });
  assert.equal(c.sent[0].body.use, "on_request");
});

/* R43 (T50; U3; DEC-291; N1194): Security leads with how things stand, and a period may end today */
const ordinaryMap = (q) => env({ ok: true, from: q.from, to: q.to, step: "day", level: "Ordinary", levelAt: null, note: "", buckets: [{ start: q.from, counts: { signin: 1, credential: 0, rate: 1, handover: 0, through: 1, total: 3 }, usual: { signin: 1, credential: 0, rate: 1, handover: 0, through: 1, total: 3 } }], totals: { count: 3, usual: 3, busiest: q.from }, countries: [], unplaced: 0 });
const lastDay = (q) => new Date(Date.parse(q.to) - 1).toISOString();
const HOUR = 3600000;

test("R43 an ordinary period leads with one sentence under its mark, the period named by its first and last day, the counts folded, and the catalogue of kinds only in the 'Add another checker' fold", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable({ securitymap: ordinaryMap }) });
  const q = a.p.requests.find((r) => r.op === "securitymap").query;
  has(a, "screen.security.ordinary.head");
  has(a, "screen.security.ordinary.line", { period: said("period.days", { first: day(q.from), last: day(lastDay(q)) }) });
  const mark = all(a.tree, (e) => /\bcs-risk\b/.test(e.attrs.class || ""))[0];
  assert.ok(mark && mark.attrs["data-tip"].includes(said("screen.security.risk.means.ordinary").slice(0, 30)), "the mark is explained");
  has(a, "screen.security.period", { from: day(q.from), to: day(lastDay(q)) });
  lacks(a, "screen.security.summary.signin", { when: day(q.to) });
  // the counts are folded
  const counts = all(a.tree, (e) => e.tag === "details" && e.attrs["data-fold"] === "counts")[0];
  assert.ok(counts && textOf(counts).includes(said("screen.security.counts.fold")) && all(counts, (e) => e.tag === "table").length === 1);
  const byKind = all(a.tree, (e) => e.tag === "table" && textOf(e).includes(said("screen.security.col.kind")));
  assert.ok(byKind.length === 1 && ancestor(byKind[0], (x) => x === counts), "the counts by kind only inside their fold");
  // the catalogue is drawn only inside the fold
  const add = all(a.tree, (e) => e.tag === "details" && e.attrs["data-fold"] === "add")[0];
  assert.ok(add && textOf(add).includes(said("screen.security.add.fold")) && textOf(add).includes("Acme"));
  assert.ok(!all(a.tree, (e) => e.tag === "table" && e.attrs["data-table"] === "catalogue" && !ancestor(e, (x) => x === add)).length && !a.text.replace(textOf(add), "").includes(said("screen.security.does.scan")), "no list of outside-tool kinds outside the fold");
  // files are said once, while the scanner is built in
  assert.equal(a.text.split(said("screen.security.files.on")).length, 2);
});

test("R43 a raised or high period leads with what happened (a hard try at signing in) and that it was refused", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const q = a.p.requests.find((r) => r.op === "securitymap").query;
  has(a, "screen.security.level.raised");
  has(a, "screen.security.summary.signin", { when: day(q.to) });
  has(a, "screen.security.summary.detail", { times: 4, from: day(q.from), to: day(lastDay(q)), highfrom: day(q.to), highto: day(lastDay(q)) });
  lacks(a, "screen.security.ordinary.head");
  // control: a raised period with no hard try in the counts says no more than the answers hold
  const quiet = await open("security", { me: ADMIN, table: securityTable({ securitymap: (q2) => env({ ok: true, from: q2.from, to: q2.to, step: "day", level: "Raised", levelAt: q2.to, buckets: [{ start: q2.from, counts: { signin: 0, credential: 1, rate: 0, handover: 0, through: 0, total: 1 }, usual: { signin: 1, credential: 0, rate: 0, handover: 0, through: 0, total: 1 } }], totals: { count: 1, usual: 1, busiest: q2.from } }) }) });
  assert.ok(!/\{\w+\}|undefined|NaN/.test(quiet.html));
});

test("R43 a period may end today: to is no later than the end of the present hour; the opening period asked again lands; a period ending yesterday sends the next midnight as before", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const first = a.p.requests.find((r) => r.op === "securitymap").query;
  const today = first.to.slice(0, 10), from = first.from.slice(0, 10);
  const presses = a.p.requests.filter((r) => r.op === "securitymap").length;
  const r = await a.press("securitymap", { values: { "se-from": from, "se-to": today } });
  const to = Date.parse(r.sent[0].query.to), nowHour = Date.parse(first.to);
  assert.ok(to <= nowHour + HOUR && to > nowHour - HOUR, "the end of the present hour at the latest");
  assert.equal(r.sent[0].query.from, from + "T00:00:00.000Z");
  assert.ok(a.p.requests.filter((x) => x.op === "securitymap").length > presses && a.p.requests.filter((x) => x.op === "securitymap").at(-1).query.to === r.sent[0].query.to, "and it lands: read again for that period");
  lacks(a, "screen.security.period.bad");
  // the day before today: the next day's 00:00Z, as before
  const yesterday = new Date(Date.parse(today + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
  assert.equal((await a.press("securitymap", { values: { "se-from": from, "se-to": yesterday } })).sent[0].query.to, today + "T00:00:00.000Z");
});

test("R43 a start after the end sends nothing and draws the refusal in a fold, open, that is drawn only then; a member who does not administer reads only that the screen is administrators'", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  assert.equal(all(a.tree, (e) => e.attrs["data-state"] === "periodbad").length, 0, "the fold is not drawn otherwise");
  const before = a.p.requests.length;
  const r = await a.press("securitymap", { values: { "se-from": "2026-10-10", "se-to": "2026-10-01" } });
  assert.deepEqual(r.sent, []);
  a.redraw();
  assert.equal(a.p.requests.length, before, "nothing read");
  const fold = all(a.tree, (e) => e.tag === "details" && e.attrs["data-state"] === "periodbad")[0];
  assert.ok(fold && "open" in fold.attrs && textOf(fold).includes(said("screen.security.period.bad.summary")) && textOf(fold).includes(said("screen.security.period.bad")));
  // a good period afterwards clears it
  await a.press("securitymap", { values: { "se-from": "2026-10-01", "se-to": "2026-10-02" } });
  assert.equal(all(a.tree, (e) => e.attrs["data-state"] === "periodbad").length, 0);
  const m = await open("security", { me: MEMBER, table: securityTable() });
  has(m, "screen.security.admins", { admins: `${said("member.founder.unnamed")}, rosa, lu` });
  assert.deepEqual(ops(m), []);
});

test("R15 a tool in use is named by its provider's display name (vendor and product from the catalogue), never by its slug", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const row = all(a.tree, (e) => e.tag === "tr" && textOf(e).includes("Acme · Scan"))[0];
  assert.ok(row, "named by vendor and product");
  assert.ok(!a.text.includes("acme-scan"), "the slug is drawn nowhere");
  // with the catalogue unread the row says what it is by the column's word, still no slug
  const u = await open("security", { me: ADMIN, table: securityTable({ securitytoolcatalogue: "none" }) });
  assert.ok(!u.text.includes("acme-scan"));
});

/* ---- T51 FR-25: T-14 (R74), K4213 (R77) ---- */

test("R74 each credential field of a provider is labelled by its word (file-scanner.credential.<field>), never its raw name; the field sent stays the catalogue's; a field outside the four keeps its own name", async () => {
  const FOUR = ["client_id", "client_secret", "api_key", "api_secret"];
  const entry = { ...CATALOGUE_ENTRY, credentials: [...FOUR, "odd_token"], config: [] };
  const a = await open("security", { me: ADMIN, table: securityTable({ securitytoolcatalogue: env({ ok: true, offered: [entry], refused: [], held: [] }) }) });
  const label = (k) => textOf(all(a.tree, (e) => e.tag === "label" && e.attrs.for === `sa-acme-scan-k-${k}`)[0]);
  for (const k of FOUR) {
    assert.ok(label(k).includes(said("screen.security.field", { label: said("file-scanner.credential." + k) })), k);
    assert.ok(!label(k).includes(k), `${k}: no raw name`);
  }
  assert.ok(label("odd_token").includes(said("screen.security.field", { label: "odd_token" })), "control: a field outside the four falls back to its own name");
  // what is sent keeps the raw name the owner declares (the guard accepts it)
  const values = { "sa-acme-scan-k-client_id": "ID-1", "sa-acme-scan-k-client_secret": "SECRET-1", "sa-acme-scan-k-api_key": "KEY-1", "sa-acme-scan-k-api_secret": "SECRET-2", "sa-acme-scan-k-odd_token": "T-1", "sa-acme-scan-keep": true };
  const r = await a.press("securitytooladd", { data: { provider: "acme-scan" }, values });
  assert.deepEqual(r.sent[0].body.credentials, { client_id: "ID-1", client_secret: "SECRET-1", api_key: "KEY-1", api_secret: "SECRET-2", odd_token: "T-1" });
});

test("R77 a scanner that holds no signatures is said so by the keys scanstatus answers, with the day and the reason; absent, nothing is drawn (control)", async () => {
  const sc = (extra) => securityTable({ scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, queued: 0, overdue: 0, held: 0, tools: [], ...extra }) });
  const ns = { since: "2026-10-12T03:00:00Z", reason: "REFUSED:main.cvd:403", key: "file-safety.index.no_signatures_since", words: "plane words one", reason_key: "file-safety.index.signatures_refused", reason_words: "plane words two" };
  const a = await open("security", { me: ADMIN, table: sc({ no_signatures: ns }) });
  const first = all(a.tree, (e) => e.attrs["data-state"] === "nosignatures")[0], second = all(a.tree, (e) => e.attrs["data-state"] === "nosignatures-reason")[0];
  assert.equal(textOf(first), said("file-safety.index.no_signatures_since", { date: day("2026-10-12T03:00:00Z") }), "the key's word, its date filled");
  assert.equal(textOf(second), said("file-safety.index.signatures_refused", { status: "403" }), "its reason in words, the refusal's code filled");
  assert.ok(!/waiting/i.test(textOf(first) + textOf(second)));
  // never signatures obtained, no date; an attempt that did not finish: the other keys
  const b = await open("security", { me: ADMIN, table: sc({ no_signatures: { since: null, reason: "SIGNATURES_ABSENT", key: "file-safety.index.no_signatures", words: "x", reason_key: "file-safety.index.signatures_not_fetched", reason_words: "y" } }) });
  assert.equal(textOf(all(b.tree, (e) => e.attrs["data-state"] === "nosignatures")[0]), said("file-safety.index.no_signatures"));
  assert.equal(textOf(all(b.tree, (e) => e.attrs["data-state"] === "nosignatures-reason")[0]), said("file-safety.index.signatures_not_fetched"));
  const c = await open("security", { me: ADMIN, table: sc({ no_signatures: { since: "2026-10-12T03:00:00Z", reason: "FAILED", key: "file-safety.index.no_signatures_since", words: "x", reason_key: "file-safety.index.signatures_failed", reason_words: "y" } }) });
  assert.equal(textOf(all(c.tree, (e) => e.attrs["data-state"] === "nosignatures-reason")[0]), said("file-safety.index.signatures_failed"));
  // a key the list does not hold yet is the answer's own words
  const d = await open("security", { me: ADMIN, table: sc({ no_signatures: { ...ns, key: "file-safety.index.no_such_row", words: "the plane's own words" } }) });
  assert.equal(textOf(all(d.tree, (e) => e.attrs["data-state"] === "nosignatures")[0]), "the plane's own words");
  // control: signatures held (no_signatures absent): nothing drawn
  const none = await open("security", { me: ADMIN, table: sc({}) });
  assert.equal(all(none.tree, (e) => /^nosignatures/.test(e.attrs["data-state"] || "")).length, 0);
});

/* ---- T51 fix round 2: C83 ---- */

test("R15, R77 C83: files are said to be checked only while signatures are held; a scanner with none draws that state with its date and reason and no checked sentence; control: signatures held draw the sentence", async () => {
  const scan = (extra) => securityTable({ scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, queued: 48, overdue: 0, held: 0, tools: [], ...extra }) });
  const ns = { since: "2026-10-15T03:00:00Z", reason: "REFUSED:main.cvd:403", key: "file-safety.index.no_signatures_since", words: "The file scanner has had no signatures since 15 October 2026.", reason_key: "file-safety.index.signatures_refused", reason_words: "The signature service refused the download (status 403)." };
  const none = await open("security", { me: ADMIN, table: scan({ signatures_age_ms: null, no_signatures: ns }) });
  lacks(none, "screen.security.files.on");
  assert.equal(all(none.tree, (e) => e.attrs["data-state"] === "files").length, 0, "no checked sentence");
  assert.equal(textOf(all(none.tree, (e) => e.attrs["data-state"] === "nosignatures")[0]), said("file-safety.index.no_signatures_since", { date: day("2026-10-15T03:00:00Z") }), "since when");
  assert.equal(textOf(all(none.tree, (e) => e.attrs["data-state"] === "nosignatures-reason")[0]), said("file-safety.index.signatures_refused", { status: "403" }), "why, in words");
  assert.equal(all(none.tree, (e) => e.attrs["data-state"] === "nosignatures-next").length, 0, "what an administrator can do is in the reason's own sentence, said once (C83, round 3)");
  // a scanner that did not answer, or none bound, claims nothing either
  for (const sc of [{ scanner: { bound: true, version: null, unreachable: true }, signatures_age_ms: null }, { scanner: { bound: false, version: null }, signatures_age_ms: null }]) {
    const o = await open("security", { me: ADMIN, table: scan(sc) });
    lacks(o, "screen.security.files.on");
  }
  // a scan state that could not be read claims nothing
  const unread = await open("security", { me: ADMIN, table: securityTable({ scanstatus: { ok: false, status: 500 } }) });
  lacks(unread, "screen.security.files.on");
  // control: signatures held
  const held = await open("security", { me: ADMIN, table: scan({ signatures_age_ms: 3600000 }) });
  has(held, "screen.security.files.on");
  assert.equal(all(held.tree, (e) => /^nosignatures/.test(e.attrs["data-state"] || "")).length, 0);
});

/* ---- T51 fix round 3: C83 (R15, R77), C84 (R15) ---- */

const scanOf = (extra, over = {}) => securityTable({ scanstatus: env({ ok: true, scanner: { bound: true, version: "1" }, renderer: { bound: true, version: "1" }, queued: 48, overdue: 0, held: 0, tools: [], ...extra }), ...over });
const stateLines = (o, re) => all(o.tree, (e) => re.test(e.attrs["data-state"] || ""));

test("R15, R77 C83: the administrator's step is said once in each state of a scanner with no signatures; where no reason line is drawn it is drawn on its own; the other states draw none (control)", async () => {
  const reasons = [
    { since: "2026-10-15T03:00:00Z", reason: "REFUSED:main.cvd:403", key: "file-safety.index.no_signatures_since", words: "w1", reason_key: "file-safety.index.signatures_refused", reason_words: "r1" },
    { since: null, reason: "SIGNATURES_ABSENT", key: "file-safety.index.no_signatures", words: "w2", reason_key: "file-safety.index.signatures_not_fetched", reason_words: "r2" },
    { since: "2026-10-15T03:00:00Z", reason: "FAILED", key: "file-safety.index.no_signatures_since", words: "w3", reason_key: "file-safety.index.signatures_failed", reason_words: "r3" },
    // a refusal with no status number, worded by the answer's own words (the plane's table, not the list)
    { since: "2026-10-15T03:00:00Z", reason: "MIRROR_REFUSED:exit 1: refused", key: "file-safety.index.no_signatures_since", words: "w4", reason_key: "file-safety.index.no_such_reason_row", reason_words: "The plane's own words for it." },
  ];
  for (const ns of reasons) {
    const o = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null, no_signatures: ns }) });
    assert.equal(stateLines(o, /^nosignatures-reason$/).length, 1, "the reason line holds the step");
    assert.equal(stateLines(o, /^nosignatures-next$/).length, 0, "no second line says it again");
  }
  // control: an answer with no reason line draws the step on its own, once
  const bare = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null, no_signatures: { since: "2026-10-15T03:00:00Z", reason: "FAILED", key: "file-safety.index.no_signatures_since", words: "w5" } }) });
  assert.equal(stateLines(bare, /^nosignatures-reason$/).length, 0);
  assert.equal(textOf(stateLines(bare, /^nosignatures-next$/)[0]), said("screen.security.nosignatures.next"));
  assert.equal(stateLines(bare, /^nosignatures-next$/).length, 1);
  // control: signatures held, an unreachable scanner and none bound say none of it
  for (const extra of [{ signatures_age_ms: 3600000 }, { scanner: { bound: true, version: null, unreachable: true }, signatures_age_ms: null }, { scanner: { bound: false, version: null }, signatures_age_ms: null }]) {
    const o = await open("security", { me: ADMIN, table: scanOf(extra) });
    assert.equal(stateLines(o, /^nosignatures/).length, 0);
  }
});

test("R15 C84: Security draws a button that checks for new signatures now, sends scanmirror once, draws that the run goes on, and reads the scanner's state again", async () => {
  const a = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null, no_signatures: { since: null, reason: "SIGNATURES_ABSENT", key: "file-safety.index.no_signatures", words: "w", reason_key: "file-safety.index.signatures_not_fetched", reason_words: "r" } }, { scanmirror: () => env({ ok: true, state: "started" }) }) });
  assert.equal(acts(a.tree).filter((b) => b.attrs["data-act"] === "scanmirror").length, 1, "the button is drawn");
  assert.equal(stateLines(a, /^mirror$/).length, 0, "nothing answered yet");
  const reads = () => a.p.requests.filter((r) => r.op === "scanstatus").length;
  const before = reads();
  const r = await a.press("scanmirror");
  assert.deepEqual(r.sent.filter((x) => x.op === "scanmirror").map((x) => x.body), [{}], "asked once, with no field");
  assert.equal(stateLines(a, /^mirror$/).length, 1, "what it answered is drawn");
  has(a, "shell.working");
  assert.ok(reads() > before, "the scanner's state is read again");
  // pressing again clears the earlier answer until the next one comes
  const again = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null }, { scanmirror: () => refuse("SIGNATURES_RUN_RECENT", { translation: "A check was made a few minutes ago." }) }) });
  const q = await again.press("scanmirror");
  assert.equal(q.sent.filter((x) => x.op === "scanmirror").length, 1);
  assert.equal(stateLines(again, /^mirror$/).length, 0, "a refused run is not drawn as started");
});

test("R15 C84: a run asked for inside the minimum gap, or with no scanner bound, is refused beside the button in file-safety's own words; no button where no scanner is built in, and none to a member who does not administer (control)", async () => {
  const recent = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null }, { scanmirror: () => refuse("SIGNATURES_RUN_RECENT", { translation: "the owner's own words for a run started lately" }) }) });
  await recent.press("scanmirror");
  assert.ok(recent.refused, "refused beside the button");
  assert.equal(recent.refused.text, "the owner's own words for a run started lately", "the refusal's own words while the list lacks the code");
  const absent = await open("security", { me: ADMIN, table: scanOf({ signatures_age_ms: null }, { scanmirror: () => refuse("SCANNER_ABSENT") }) });
  await absent.press("scanmirror");
  assert.equal(absent.refused.text, said("refusal.SCANNER_ABSENT"), "the owner's row's words");
  // control: no scanner built in: no button; a member: no button
  const none = await open("security", { me: ADMIN, table: securityTable({ bootstrap: { ok: true, part_signin: true, part_scanner: false, part_safe_view: false } }) });
  assert.ok(!ops(none).includes("scanmirror"));
  const m = await open("security", { me: MEMBER, table: securityTable() });
  assert.deepEqual(ops(m), []);
});

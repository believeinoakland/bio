/* link-sweep R1, R2, R3 (and R9's ratifier): a sweep's definition as C-18.5 refuses it at the write, its terms and
   their linear-time matcher, and who may write a sweep, each arm with its negative control. Driven at the module's
   interface: `sweepGrammar` (the share monitoring R66 takes), `compileTerm`, `inScope`, and promotions through the real
   promotion module, whose registered step is monitoring's R27 composing this module's registered grammar and fence
   (monitoring's stand-in until its T24 merge). Moved from monitoring's `sweep-grammar.test.mjs` (its R53–R55). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { listWorld, sha, infoMd, sweepDef, NOW_MS } from "./fixture.mjs";
import { sweepGrammar, compileTerm, inScope, SWEEP_CHECKS, MATCH_TEXT_MAX, TERM_PROGRAM_MAX }
  from "../../../src/link-sweep/index.mjs";
import { listFormats } from "../../../src/formats.mjs";

const findingsOf = (def, ids = new Set()) => sweepGrammar(def, ids);
const PROJ = "PROJ-2026-0900-sweeps";
const ID = "INFO-2026-0900-list";
const lw = (o = {}) => listWorld({ list: ID, project: PROJ, ...o });
const as = (author) => ({ author });

test("R1 C-18.5: a sweep is exactly {id, title, ratified, sources, seeds, match, cadence, budget}; each field's arm finds its violation, one finding per field, and a well-formed sweep finds none", () => {
  assert.deepEqual(findingsOf(sweepDef()), [], "the negative control");
  assert.deepEqual(findingsOf(sweepDef({ match: {}, ratified: false })), [], "match may be empty");
  assert.deepEqual(findingsOf(sweepDef({ match: { terms: [], paths: [], formats: [] } })), []);
  const long = "x".repeat(40);
  const arms = [
    [{ extra: 1 }, null, /^carries 'extra', which is not a sweep's field/],
    [{ cadence: undefined }, "cadence", /^is missing$/],
    [{ id: "Minutes" }, "id", /^must be 1 to 40 lowercase/],
    [{ id: `a${long}` }, "id", /^must be 1 to 40 lowercase/],
    [{ id: "-x" }, "id", /^must be 1 to 40 lowercase/],
    [{ title: "" }, "title", /^must be a nonempty single line of at most 200/],
    [{ title: "a\nb" }, "title", /^must be a nonempty single line/],
    [{ title: "t".repeat(201) }, "title", /^must be a nonempty single line/],
    [{ ratified: "yes" }, "ratified", /^must be boolean/],
    [{ sources: [] }, "sources", /^must be an array of 1 to 20 prefixes/],
    [{ sources: Array(21).fill("https://records.example.org/council") }, "sources", /^must be an array of 1 to 20/],
    [{ sources: ["http://records.example.org/council"] }, "sources", /^\[0\] is not a public https prefix/],
    [{ sources: ["https://records.example.org/council?x=1"] }, "sources", /^\[0\] is not a public https prefix without a query or fragment/],
    [{ sources: ["https://records.example.org/council#a"] }, "sources", /without a query or fragment/],
    [{ sources: ["https://127.0.0.1/"] }, "sources", /^\[0\] is not a public https prefix/],
    [{ seeds: [] }, "seeds", /^must be an array of 1 to 10 locators/],
    [{ seeds: Array(11).fill("https://records.example.org/council/a") }, "seeds", /^must be an array of 1 to 10/],
    [{ seeds: ["https://records.example.org/councilx/a"] }, "seeds", /^\[0\] is not a public https locator within the sweep's sources/],
    [{ seeds: ["https://other.example.org/council/a"] }, "seeds", /^\[0\] is not .* within the sweep's sources/],
    [{ match: [] }, "match", /^must be an object/],
    [{ match: { verbs: [] } }, "match", /^carries 'verbs', which is not terms, paths or formats/],
    [{ match: { terms: Array(21).fill("a") } }, "match.terms", /^must be an array of at most 20 terms/],
    [{ match: { terms: [""] } }, "match.terms[0]", /^SWEEP_TERM_REFUSED/],
    [{ match: { paths: ["https://records.example.org/other"] } }, "match.paths", /^\[0\] is not a public https locator within the sweep's sources/],
    [{ match: { paths: Array(21).fill("https://records.example.org/council/a") } }, "match.paths", /^must be an array of at most 20/],
    [{ match: { formats: ["exe"] } }, "match.formats", /^\[0\] is not a format this instance reads/],
    [{ match: { formats: Array(11).fill("pdf") } }, "match.formats", /^must be an array of at most 10/],
    [{ cadence: "hourly" }, "cadence", /^must be one of: daily, weekly, monthly/],
    [{ budget: { per_run: 0, backlog: 5 } }, "budget", /^must be \{per_run, backlog\}/],
    [{ budget: { per_run: 101, backlog: 5 } }, "budget", /^must be/],
    [{ budget: { per_run: 5, backlog: 1001 } }, "budget", /^must be/],
    [{ budget: { per_run: 5, backlog: 5, extra: 1 } }, "budget", /^must be/],
    [{ budget: { per_run: 1.5, backlog: 5 } }, "budget", /^must be/],
  ];
  for (const [over, field, re] of arms) {
    const def = sweepDef(over);
    for (const k of Object.keys(over)) if (over[k] === undefined) delete def[k];
    const f = findingsOf(def);
    assert.equal(f.length, 1, `${re}: ${JSON.stringify(f)}`);
    assert.ok(f.every((x) => x.check === "C-18.5" && x.severity === "error"));
    assert.equal(f[0].field, field, String(re));
    assert.ok(field === null || f[0].message.startsWith(`${field} `), "the message begins with its field");
    assert.match(f[0].message.slice(field === null ? 0 : field.length + 1), re);
  }
  /* unique within the file (the ids a file's entries share); every format listFormats answers is accepted (format-registry R8) */
  const ids = new Set();
  assert.deepEqual(findingsOf(sweepDef(), ids), []);
  assert.deepEqual(findingsOf(sweepDef(), ids).map((x) => [x.field, x.message]), [["id", "id 'minutes' is not unique within the file"]]);
  assert.deepEqual(findingsOf(sweepDef({ match: { formats: listFormats().slice(0, 10) } })), []);
  /* one finding per field: a sweep wrong in two fields has two */
  assert.equal(findingsOf(sweepDef({ cadence: "x", ratified: 1 })).length, 2);
  /* an entry that is not an object is monitoring's own finding (its R66): the grammar finds nothing in it */
  for (const x of [null, [], "s", 3]) assert.deepEqual(findingsOf(x), []);
});

test("R1 at the write: a sweep's grammar finding refuses the promotion GATHERING_REFUSED through monitoring's R27, naming the entry and field; nothing is written", () => {
  const { w, write } = lw();
  const r = write([sweepDef({ cadence: "hourly" })]);
  assert.deepEqual([r.ok, r.reason], [false, "GATHERING_REFUSED"]);
  assert.deepEqual(r.findings, [{ check: "C-18.5", detail: "gathering.json sweeps[0].cadence must be one of: daily, weekly, monthly" }]);
  assert.equal(w.record.head(ID), null, "nothing was written");
  assert.equal(write([sweepDef()]).ok, true, "the negative control");
});

test("R1 in scope: an address's normalised form equals a source prefix or continues one at a slash", () => {
  const src = ["https://Records.Example.org/council"];
  assert.equal(inScope("https://records.example.org/council", src), true);
  assert.equal(inScope("https://records.example.org/council/minutes/1.pdf", src), true);
  assert.equal(inScope("https://records.example.org/councilor", src), false, "a prefix continues only at a slash");
  assert.equal(inScope("https://other.example.org/council/x", src), false);
  assert.equal(inScope("https://records.example.org/x", ["https://records.example.org/"]), true);
  assert.equal(inScope("https://records.example.org/council/x", "nope"), false);
});

test("R2 a term: a literal or a /regular expression/, both without regard to case; C-18.5 refuses one that does not compile or uses a backreference, a lookahead or a lookbehind, SWEEP_TERM_REFUSED naming the term and the construct", () => {
  const t = (term, text) => compileTerm(term).test(text);
  assert.equal(t("Council Minutes", "the COUNCIL minutes of May"), true);
  assert.equal(t("minutes", "the agenda"), false);
  assert.equal(t("/minutes?\\s+of\\s+\\d{1,2}\\b/", "MINUTE of 12 May"), true);
  assert.equal(t("/^minutes$/", "minutes 2"), false);
  assert.equal(t("/[a-c]{2}x|zz/", "BCX"), true);
  assert.equal(t("/(?:a|b)+c/", "xxabbac"), true);
  assert.equal(t("/a.c/", "a\nc"), false);
  assert.equal(compileTerm("/x/").kind, "regex");
  assert.equal(compileTerm("/").kind, "literal", "a lone slash is a literal");
  for (const [term, construct] of [["/(a)\\1/", "a backreference"], ["/(?<n>a)\\k<n>/", "a backreference"],
                                  ["/(?<=a)b/", "a lookbehind"], ["/(?<!a)b/", "a lookbehind"], ["/a(?=b)/", "a lookahead"],
                                  ["/a(?!b)/", "a lookahead"], ["/(a/", "an unclosed group"], ["/[a/", "an unclosed class"],
                                  ["/*a/", "a quantifier with nothing to repeat"], ["/a{2,101}/", "a count past the bound"]]) {
    const c = compileTerm(term);
    assert.equal(c.ok, false, term);
    assert.equal(c.construct, construct, term);
  }
  assert.equal(compileTerm("x".repeat(201)).ok, false, "at most 200 characters");
  assert.equal(compileTerm("a\nb").ok, false, "a single line");
  /* the grammar's finding carries the code and the row it is refused with (C-18.16), naming the term and the construct */
  const [f] = sweepGrammar(sweepDef({ match: { terms: ["minutes", "/(?<=a)b/"] } }), new Set());
  assert.deepEqual([f.field, f.code, f.refusal],
    ["match.terms[1]", "SWEEP_TERM_REFUSED", { code: "SWEEP_TERM_REFUSED", check: "C-18.16", translation: SWEEP_CHECKS.SWEEP_TERM_REFUSED.translation }]);
  /* at the write: the refusal names the term and the construct, with its row (C-18.16), before GATHERING_REFUSED */
  const { w, write } = lw();
  const r = write([sweepDef({ ratified: false, cadence: "hourly", match: { terms: ["/(?<=a)b/"] } })]);
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "SWEEP_TERM_REFUSED", "SWEEP_TERM_REFUSED", "C-18.16", SWEEP_CHECKS.SWEEP_TERM_REFUSED.translation]);
  assert.match(r.detail, /"\/\(\?<=a\)b\/" is refused for a lookbehind/);
  assert.equal(r.findings.length, 2, "every finding beside it, the cadence's too");
  assert.equal(w.record.head(ID), null, "nothing was written");
  assert.equal(write([sweepDef({ ratified: false, match: { terms: ["/(?:a)b/"] } })]).ok, true, "the negative control");
});

test("R2 a term's matching time is linear in its text's length whatever the term: pathological terms over 2,048 characters finish within a fixed bound, and a term reads at most 2,048 characters", () => {
  const text = "a".repeat(MATCH_TEXT_MAX);
  for (const term of ["/(a|a)*b/", "/(a+)+b/", "/(a*)*b/", "/(a|aa)+$b/", "/(.*a){20}b/", "/((a{1,10}){1,10}){1,10}b/"]) {
    const c = compileTerm(term);
    assert.equal(c.ok, true, term);
    const t0 = process.hrtime.bigint();
    assert.equal(c.test(text), false, term);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    assert.ok(ms < 1500, `${term} took ${ms} ms over ${MATCH_TEXT_MAX} characters`);
  }
  /* the program is bounded at compile time, so the bound above holds for every term */
  assert.equal(compileTerm("/(((a{1,100}){1,100}){1,100})/").construct, "an expression past the bound");
  assert.ok(TERM_PROGRAM_MAX <= 4000);
  /* the rest is not read */
  assert.equal(compileTerm("needle").test("x".repeat(MATCH_TEXT_MAX) + "needle"), false);
  assert.equal(compileTerm("needle").test("x".repeat(MATCH_TEXT_MAX - 6) + "needle"), true);
  assert.equal(compileTerm("/needle$/").test("x".repeat(MATCH_TEXT_MAX - 6) + "needle"), true);
});

test("R3 an owner ratifies; a member who is not an owner is refused SWEEP_RATIFY_NOT_AN_OWNER; R9 names the ratifying member and instant, read from the history", () => {
  const { w, write } = lw();
  assert.equal(write([sweepDef({ ratified: false })], as("member:bob")).ok, true, "any member may add an unratified sweep");
  assert.equal(write([sweepDef({ ratified: false, title: "Changed" })], as("member:bob")).ok, true, "and change it");
  const r = write([sweepDef({ ratified: true, title: "Changed" })], as("member:bob"));
  assert.deepEqual([r.ok, r.reason, r.check, r.translation, r.project, r.sweeps],
    [false, "SWEEP_RATIFY_NOT_AN_OWNER", "C-18.18", SWEEP_CHECKS.SWEEP_RATIFY_NOT_AN_OWNER.translation, PROJ, ["minutes"]]);
  assert.equal(w.s.sweeps({ viewer: "member:alice" }).sweeps[0].ratified, false, "nothing was written");
  w.clock.ms = NOW_MS + 1000;
  assert.equal(write([sweepDef({ ratified: true, title: "Changed" })], as("member:alice")).ok, true, "the owner ratifies");
  let s = w.s.sweeps({ viewer: "member:alice" }).sweeps[0];
  assert.deepEqual([s.ratified, s.ratified_by], [true, "member:alice"]);
  assert.ok(typeof s.ratified_at === "string" && s.ratified_at.length >= 20, s.ratified_at);
  /* a later promotion that leaves the sweep unchanged keeps the ratifier */
  assert.equal(write([sweepDef({ ratified: true, title: "Changed" }), sweepDef({ id: "other", ratified: false })], as("member:bob")).ok, true);
  s = w.s.sweeps({ viewer: "member:alice" }).sweeps[0];
  assert.equal(s.ratified_by, "member:alice");
});

test("R3 a non-owner who changes a ratified sweep is refused, an owner's change re-ratifies it, and any writer, the daemon included, may set ratified to false", () => {
  const { w, write } = lw();
  assert.equal(write([sweepDef()], as("member:alice")).ok, true);
  const r = write([sweepDef({ cadence: "daily" })], as("member:bob"));
  assert.equal(r.reason, "SWEEP_RATIFY_NOT_AN_OWNER");
  const gone = write([], as("member:bob"));
  assert.equal(gone.reason, "SWEEP_RATIFY_NOT_AN_OWNER", "removing a ratified sweep is changing it");
  /* setting ratified to false: a member, and the daemon, are never refused */
  assert.equal(write([sweepDef({ ratified: false })], as("token:daemon")).ok, true, "stopping breadth is never refused");
  assert.equal(w.s.sweeps({ viewer: "member:alice" }).sweeps[0].ratified_by, null, "an unratified sweep names no ratifier");
  /* but a machine that unratifies and changes anything else is not a member */
  assert.equal(write([sweepDef()], as("member:alice")).ok, true);
  const mixed = write([sweepDef({ ratified: false, cadence: "daily" })], as("token:daemon"));
  assert.deepEqual([mixed.reason, mixed.check], ["SWEEP_NOT_A_MEMBER", "C-18.17"]);
  assert.equal(write([sweepDef({ ratified: false })], as("member:bob")).ok, true, "a member unratifies");
  w.clock.ms = NOW_MS + 5000;
  assert.equal(write([sweepDef({ cadence: "daily" })], as("member:alice")).ok, true, "the owner's change ratifies it again");
  assert.equal(w.s.sweeps({ viewer: "member:alice" }).sweeps[0].ratified_by, "member:alice");
});

test("R3 a non-member who adds, removes or changes a sweep is refused SWEEP_NOT_A_MEMBER before anything is written; a promotion that leaves the sweeps as they were is not asked", () => {
  const { w, write } = lw();
  for (const who of ["token:daemon", "class:daemon", "claude", ""]) {
    const r = write([sweepDef({ ratified: false })], as(who));
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "SWEEP_NOT_A_MEMBER", "SWEEP_NOT_A_MEMBER", "C-18.17", SWEEP_CHECKS.SWEEP_NOT_A_MEMBER.translation], who);
  }
  assert.equal(w.record.head(ID), null);
  assert.equal(write([sweepDef({ ratified: false })], as("member:bob")).ok, true);
  assert.equal(write([sweepDef({ ratified: false })], { author: "token:daemon", extra: { requests: [] } }).ok, true, "the sweeps unchanged: not asked");
  assert.equal(write([], as("token:daemon")).reason, "SWEEP_NOT_A_MEMBER", "removing one");
  /* a replay is exempt (monitoring R27's narrow exemption) */
  const t = JSON.stringify({ sweeps: [sweepDef({ id: "r" })] });
  const md = infoMd("INFO-2026-0901-replay", "https://records.example.org/r");
  const rr = w.promotion.promote({ bundleId: "INFO-2026-0901-replay", base: null, snapKey: "20260920T000000Z_rp0901", author: "token:daemon", replay: true,
    meta: { object_type: "information", group: "test-group", title: "r", current_state: "collected", created: "2026-09-20T00:00:00Z", last_updated: "2026-09-20T00:00:00Z" },
    files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) },
            { path: "data/gathering.json", text: t, bytes: Buffer.byteLength(t), sha256: sha(t) }] });
  assert.notEqual(rr.reason, "SWEEP_NOT_A_MEMBER");
});

test("R3 a bundle in no project has no owner, so ratifying a sweep on it is refused; an unratified sweep is still written", () => {
  const { write } = lw({ project: null });
  const r = write([sweepDef()], as("member:alice"));
  assert.equal(r.reason, "SWEEP_RATIFY_NOT_AN_OWNER");
  assert.equal(r.project, null);
  assert.match(r.detail, /belongs to no project/);
  assert.equal(write([sweepDef({ ratified: false })], as("member:alice")).ok, true);
});

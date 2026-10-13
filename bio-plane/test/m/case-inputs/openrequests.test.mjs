/* case-inputs R8 (was case-authoring R70; T45; N880; Actions D13; v0.2 rule 8), R10 (was R73) and R17 (T47; N992;
   DEC-199): the one source of a case's open requests for comment, registered once at start by a later module
   (`action-replies` R3), stood in here at R8's ruled interface; and each row's fact line for `case-authoring` R34's sign
   step, read by key from words.json, with the step's one sentence when the source cannot be read. The sign step itself
   is case-authoring's (its R34), whose tests drive it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V } from "./fixture.mjs";
import { OPEN_REQUEST_KEYS, openRequestLine, OPEN_REQUESTS_UNREAD_SENTENCE } from "../../../src/case-inputs/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const fill = (key, f) => en(key).replace(/\{([a-z_]+)\}/g, (m, k) => (k in f ? String(f[k]) : m));

const Q = "INQ-2026-0001-q";
const CLERK = "the City Clerk, City of Example";
const ROWS = [
  { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30", answers: { answered: 2, claims: 3 } },
  { whom: "the Planning Director, City of Example", asked_at: "2026-09-05", window_closes: null, answers: null },
  { whom: "the Town Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06", answers: null, replied: false },
];

function setup() {
  const w = world();
  w.member("alice");
  return { w };
}
/* R8's open requests as the sign step reads them: each row with its line */
const lines = (w, a = { case: "CASE-2026-0001", members: [], viewer: V("alice") }) => {
  const r = w.ci.openRequestsOn(a);
  return r.ok ? r.rows.map((row) => ({ ...row, ...openRequestLine(row) })) : r;
};

test("R8: registerOpenRequests takes the one source once; a second registration is refused PROVIDER_DECLARED and one without the door PROVIDER_MALFORMED, each registering nothing; openRequestsSource answers whether one is registered and by whom", () => {
  const { w } = setup();
  assert.deepEqual(w.ci.openRequestsSource(), { registered: false, module: null });
  for (const bad of [null, {}, { openRequestsOn: "not a door" }, "action-replies"]) {
    const r = w.ci.registerOpenRequests("action-replies", bad);
    assert.deepEqual([r.ok, r.reason], [false, "PROVIDER_MALFORMED"]);
    assert.match(r.detail, /Nothing was registered\.$/);
  }
  assert.deepEqual(w.ci.openRequestsSource(), { registered: false, module: null }, "a malformed one registers nothing");
  const first = { openRequestsOn: () => [] };
  assert.deepEqual(w.ci.registerOpenRequests("action-replies", first), { ok: true, module: "action-replies" });
  const second = w.ci.registerOpenRequests("other", { openRequestsOn: () => ROWS });
  assert.deepEqual([second.ok, second.reason, second.module], [false, "PROVIDER_DECLARED", "action-replies"]);
  assert.deepEqual(w.ci.openRequestsSource(), { registered: true, module: "action-replies" });
  assert.deepEqual(w.ci.openRequestsOn({ case: "CASE-X", members: [], viewer: V("alice") }), { ok: true, rows: [] },
    "the first source still answers");
  /* the one-argument form, as publication R77's; a source naming no module is "unnamed" */
  const { w: w2 } = setup();
  assert.equal(w2.ci.registerOpenRequests({ module: "action-replies", openRequestsOn: () => [] }).ok, true);
  assert.equal(w2.ci.openRequestsSource().module, "action-replies");
  const { w: w3 } = setup();
  assert.deepEqual(w3.ci.registerOpenRequests({ openRequestsOn: () => [] }), { ok: true, module: "unnamed" });
});

test("R8: with no source the list is []; the source is called synchronously with the case, the members at their bytes and the viewer, and answers in its order; a throwing source, or one answering anything but a list of R8's rows, reads undetermined; nothing here writes", () => {
  const { w } = setup();
  assert.deepEqual(w.ci.openRequestsOn({ case: "CASE-X", members: [], viewer: null }), { ok: true, rows: [] });
  assert.deepEqual(w.ci.openRequestsOn(), { ok: true, rows: [] }, "no argument, no source");
  const calls = [];
  let answer = ROWS;
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: (a) => { calls.push(a); if (answer instanceof Error) throw answer;
                                                                         return typeof answer === "function" ? answer() : answer; } });
  const members = [{ bundle_id: Q, version_sha: "a".repeat(64) }];
  const before = w.snapshot();
  assert.deepEqual(w.ci.openRequestsOn({ case: "CASE-X", members, viewer: V("alice") }), { ok: true, rows: ROWS });
  assert.deepEqual(calls, [{ case: "CASE-X", members, viewer: V("alice") }]);
  /* a row is read as R8 shapes it: whom and asked_at trimmed, replied stated only where the source states it */
  answer = [{ whom: `  ${CLERK} `, asked_at: " 2026-09-01 ", window_closes: " 2026-09-30 ", answers: null, replied: true, extra: 1 },
            { ...ROWS[1], replied: null }];
  assert.deepEqual(w.ci.openRequestsOn({ case: "CASE-X", members, viewer: null }).rows, [
    { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30", answers: null, replied: true }, ROWS[1]]);
  for (const bad of [new Error("cannot read"), { rows: ROWS }, null, [null], [[]], [{ ...ROWS[0], whom: "" }],
                     [{ ...ROWS[0], asked_at: 3 }], [{ ...ROWS[0], window_closes: undefined }], [{ ...ROWS[0], window_closes: " " }],
                     [{ ...ROWS[0], answers: { answered: 4, claims: 3 } }], [{ ...ROWS[0], answers: { answered: -1, claims: 3 } }],
                     [{ ...ROWS[0], answers: { answered: 1.5, claims: 3 } }], [{ ...ROWS[0], answers: [] }],
                     [{ ...ROWS[0], answers: 2 }], [{ ...ROWS[0], replied: "yes" }], [{ ...ROWS[0], replied: false }],
                     Promise.resolve(ROWS)]) {
    answer = bad;
    const r = w.ci.openRequestsOn({ case: "CASE-X", members, viewer: V("alice") });
    assert.deepEqual([r.ok, r.undetermined], [false, true], JSON.stringify(bad));
    assert.equal(typeof r.why, "string");
  }
  answer = [];
  assert.deepEqual(w.ci.openRequestsOn({ case: "CASE-X", members, viewer: null }), { ok: true, rows: [] });
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R10: a row with a window and a reply laid out reads signing.openrequest.line, and one stating no reply is recorded signing.openrequest.noreply, each with the row's whom, asked_at, window_closes, answered and claims filled", () => {
  const { w } = setup();
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => [
    ROWS[0], ROWS[2],
    { whom: "the Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06", answers: { answered: 0, claims: 4 }, replied: true }] });
  const o = lines(w);
  assert.deepEqual(o.map((l) => [l.key, l.says]), [
    [OPEN_REQUEST_KEYS.line, fill("signing.openrequest.line", { whom: CLERK, asked_at: "2026-09-01", window_closes: "2026-09-30",
                                                                answered: 2, claims: 3 })],
    [OPEN_REQUEST_KEYS.noreply, fill("signing.openrequest.noreply", { whom: "the Town Auditor", asked_at: "2026-09-06",
                                                                     window_closes: "2026-10-06" })],
    [OPEN_REQUEST_KEYS.line, fill("signing.openrequest.line", { whom: "the Auditor", asked_at: "2026-09-06", window_closes: "2026-10-06",
                                                                answered: 0, claims: 4 })]]);
  assert.deepEqual([OPEN_REQUEST_KEYS.line, OPEN_REQUEST_KEYS.noreply], ["signing.openrequest.line", "signing.openrequest.noreply"]);
  for (const l of o) assert.ok(!/\{[a-z_]+\}/.test(l.says), "every placeholder filled");
});

test("R17: a row with no window reads signing.openrequest.nowindow.line, .nowindow.noreply or .nowindow.notlaidout; a row with a window whose reply is not laid out (replied true or absent) reads signing.openrequest.notlaidout, so a recorded reply never reads \"no reply is recorded\"; each filled with the row's facts, and every well-formed row is keyed", () => {
  const { w } = setup();
  const rows = [
    { whom: CLERK, asked_at: "2026-09-01", window_closes: null, answers: { answered: 1, claims: 2 } },
    { whom: CLERK, asked_at: "2026-09-02", window_closes: null, answers: null, replied: false },
    { whom: CLERK, asked_at: "2026-09-03", window_closes: null, answers: null, replied: true },
    { whom: CLERK, asked_at: "2026-09-04", window_closes: null, answers: null },
    { whom: CLERK, asked_at: "2026-09-05", window_closes: "2026-09-30", answers: null, replied: true },
    { whom: CLERK, asked_at: "2026-09-06", window_closes: "2026-09-30", answers: null },
    { whom: CLERK, asked_at: "2026-09-07", window_closes: "2026-09-30", answers: null, replied: null },
  ];
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => rows });
  const o = lines(w);
  const at = (i) => ({ whom: CLERK, asked_at: rows[i].asked_at });
  assert.deepEqual(o.map((l) => [l.key, l.says]), [
    ["signing.openrequest.nowindow.line", fill("signing.openrequest.nowindow.line", { ...at(0), answered: 1, claims: 2 })],
    ["signing.openrequest.nowindow.noreply", fill("signing.openrequest.nowindow.noreply", at(1))],
    ["signing.openrequest.nowindow.notlaidout", fill("signing.openrequest.nowindow.notlaidout", at(2))],
    ["signing.openrequest.nowindow.notlaidout", fill("signing.openrequest.nowindow.notlaidout", at(3))],
    ["signing.openrequest.notlaidout", fill("signing.openrequest.notlaidout", { ...at(4), window_closes: "2026-09-30" })],
    ["signing.openrequest.notlaidout", fill("signing.openrequest.notlaidout", { ...at(5), window_closes: "2026-09-30" })],
    ["signing.openrequest.notlaidout", fill("signing.openrequest.notlaidout", { ...at(6), window_closes: "2026-09-30" })]]);
  assert.deepEqual(o.map((l) => l.replied), [undefined, false, true, undefined, true, undefined, undefined]);
  for (const l of o) {
    assert.ok(l.key, "keyed");
    assert.ok(!/\{[a-z_]+\}/.test(l.says), "every placeholder filled");
    if (l.replied !== false) assert.ok(!l.says.includes("no reply is recorded"), l.says);
  }
  assert.deepEqual(OPEN_REQUEST_KEYS, { line: "signing.openrequest.line", noreply: "signing.openrequest.noreply",
    notlaidout: "signing.openrequest.notlaidout", "nowindow.line": "signing.openrequest.nowindow.line",
    "nowindow.noreply": "signing.openrequest.nowindow.noreply", "nowindow.notlaidout": "signing.openrequest.nowindow.notlaidout",
    unread: "signing.openrequest.unread" });
  /* control: the same row with its reply stated absent reads noreply, with a window */
  assert.equal(openRequestLine({ ...rows[4], replied: false }).key, "signing.openrequest.noreply");
});

test("R17: when R8 reads undetermined the step's one sentence is signing.openrequest.unread's words, naming your group's Civicsmith (DEC-198 (7)); a readable source never answers it", () => {
  const { w } = setup();
  assert.equal(OPEN_REQUESTS_UNREAD_SENTENCE, en("signing.openrequest.unread"));
  assert.match(OPEN_REQUESTS_UNREAD_SENTENCE, /Your group's Civicsmith/);
  w.ci.registerOpenRequests("action-replies", { openRequestsOn: () => { throw new Error("down"); } });
  const r = w.ci.openRequestsOn({ case: "CASE-2026-0001", members: [], viewer: V("alice") });
  assert.deepEqual([r.ok, r.undetermined], [false, true]);
  /* control: a source that reads answers rows, never the unread sentence */
  const { w: ok } = setup();
  ok.ci.registerOpenRequests("action-replies", { openRequestsOn: () => ROWS });
  assert.ok(!JSON.stringify(lines(ok)).includes(OPEN_REQUESTS_UNREAD_SENTENCE));
});

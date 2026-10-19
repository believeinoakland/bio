/* case-inputs R19 (T51; N880 (U4); DEC-340, U366; K3935): the one source of a case's minutes comparisons, registered once at
   start by a later module (`filings` R64), stood in here at R19's ruled interface; and each row's lines for
   `case-authoring` R77's sign step, read by key from words.json. The sign step itself is case-authoring's, whose tests drive
   it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V } from "./fixture.mjs";
import { MINUTES_KEYS, minutesLine } from "../../../src/case-inputs/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const fill = (key, f) => en(key).replace(/\{([a-z_]+)\}/g, (m, k) => (k in f ? String(f[k]) : m));

const SAME = { meeting: "the Council's regular meeting", date: "2026-09-16",
               minutes: "The group urged\n  a vote  on the lease.", filed: "The group urged a vote on the lease.", same: true };
const DIFFERS = { meeting: "the Planning Commission's special meeting", date: "2026-09-23",
                  minutes: "The group opposed the lease.", filed: "The group urged a vote on the lease.", same: false };
const ROWS = [SAME, DIFFERS];

function setup() {
  const w = world();
  w.member("alice");
  return { w };
}

test("R19: registerMinutesComparisons takes the one source once; a second registration is refused PROVIDER_DECLARED and one without the door PROVIDER_MALFORMED, each registering nothing; minutesComparisonsSource answers whether one is registered and by whom", () => {
  const { w } = setup();
  assert.deepEqual(w.ci.minutesComparisonsSource(), { registered: false, module: null });
  for (const bad of [null, {}, { minutesComparisonsOn: "not a door" }, { openRequestsOn: () => [] }, "filings"]) {
    const r = w.ci.registerMinutesComparisons("filings", bad);
    assert.deepEqual([r.ok, r.reason], [false, "PROVIDER_MALFORMED"]);
    assert.match(r.detail, /Nothing was registered\.$/);
  }
  assert.deepEqual(w.ci.minutesComparisonsSource(), { registered: false, module: null }, "a malformed one registers nothing");
  assert.deepEqual(w.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: () => [] }), { ok: true, module: "filings" });
  const second = w.ci.registerMinutesComparisons("other", { minutesComparisonsOn: () => ROWS });
  assert.deepEqual([second.ok, second.reason, second.module], [false, "PROVIDER_DECLARED", "filings"]);
  assert.match(second.detail, /Nothing was registered\.$/);
  assert.deepEqual(w.ci.minutesComparisonsSource(), { registered: true, module: "filings" });
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members: [], viewer: V("alice") }), { ok: true, rows: [] },
    "the first source still answers");
  /* the one-argument form, as R8's; a source naming no module is "unnamed"; R8's source is a separate registration */
  const { w: w2 } = setup();
  assert.equal(w2.ci.registerMinutesComparisons({ module: "filings", minutesComparisonsOn: () => [] }).ok, true);
  assert.equal(w2.ci.minutesComparisonsSource().module, "filings");
  assert.deepEqual(w2.ci.openRequestsSource(), { registered: false, module: null }, "registering minutes registers no open requests");
  const { w: w3 } = setup();
  assert.deepEqual(w3.ci.registerMinutesComparisons({ minutesComparisonsOn: () => [] }), { ok: true, module: "unnamed" });
});

test("R19: with none registered rows is []; the source is called synchronously with the case, the members at their bytes and the viewer, and its rows are answered in its order; a throwing source, or one answering anything but a list of R19's rows, reads undetermined; nothing here writes", () => {
  const { w } = setup();
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members: [], viewer: null }), { ok: true, rows: [] });
  assert.deepEqual(w.ci.minutesComparisonsOn(), { ok: true, rows: [] }, "no argument, no source");
  const calls = [];
  let answer = ROWS;
  w.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: (a) => { calls.push(a); if (answer instanceof Error) throw answer;
                                                                              return answer; } });
  const members = [{ bundle_id: "INQ-2026-0001-q", version_sha: "a".repeat(64) }];
  const before = w.snapshot();
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members, viewer: V("alice") }), { ok: true, rows: ROWS });
  assert.deepEqual(calls, [{ case: "CASE-X", members, viewer: V("alice") }]);
  /* the source's order is kept, whatever the dates say */
  answer = [DIFFERS, SAME];
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members, viewer: null }).rows, [DIFFERS, SAME]);
  /* a row is read as R19 shapes it: meeting and date trimmed, the two texts kept as given, other fields dropped */
  answer = [{ ...SAME, meeting: `  ${SAME.meeting} `, date: " 2026-09-16 ", extra: 1 }];
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members, viewer: null }).rows, [SAME]);
  /* `same` is true exactly when the two texts are equal once whitespace is folded: a row saying otherwise is malformed */
  for (const bad of [new Error("cannot read"), { rows: ROWS }, null, [null], [[]], [{ ...SAME, meeting: "" }],
                     [{ ...SAME, meeting: 3 }], [{ ...SAME, date: " " }], [{ ...SAME, date: undefined }],
                     [{ ...SAME, minutes: undefined }], [{ ...SAME, filed: null }], [{ ...SAME, same: "yes" }],
                     [{ ...SAME, same: undefined }], [{ ...SAME, same: false }], [{ ...DIFFERS, same: true }],
                     [SAME, { ...DIFFERS, same: true }], Promise.resolve(ROWS)]) {
    answer = bad;
    const r = w.ci.minutesComparisonsOn({ case: "CASE-X", members, viewer: V("alice") });
    assert.deepEqual([r.ok, r.undetermined, "rows" in r], [false, true, false], JSON.stringify(bad));
    assert.equal(typeof r.why, "string");
  }
  answer = [];
  assert.deepEqual(w.ci.minutesComparisonsOn({ case: "CASE-X", members, viewer: null }), { ok: true, rows: [] });
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R19: minutesLine answers signing.minutes.line with the row's {meeting} and {date} beside signing.minutes.left, signing.minutes.right and, by same, signing.minutes.same or signing.minutes.differs, each read from words.json; it asks no reason and refuses nothing", () => {
  assert.deepEqual(MINUTES_KEYS, { line: "signing.minutes.line", left: "signing.minutes.left", right: "signing.minutes.right",
                                   same: "signing.minutes.same", differs: "signing.minutes.differs" });
  assert.ok(Object.isFrozen(MINUTES_KEYS));
  const k = (key, says) => ({ key, says });
  assert.deepEqual(minutesLine(SAME), {
    ...k("signing.minutes.line", fill("signing.minutes.line", { meeting: SAME.meeting, date: SAME.date })),
    left: k("signing.minutes.left", en("signing.minutes.left")),
    right: k("signing.minutes.right", en("signing.minutes.right")),
    comparison: k("signing.minutes.same", en("signing.minutes.same")) });
  assert.deepEqual(minutesLine(DIFFERS), {
    ...k("signing.minutes.line", fill("signing.minutes.line", { meeting: DIFFERS.meeting, date: DIFFERS.date })),
    left: k("signing.minutes.left", en("signing.minutes.left")),
    right: k("signing.minutes.right", en("signing.minutes.right")),
    comparison: k("signing.minutes.differs", en("signing.minutes.differs")) });
  /* the sign step's reading: the source's rows, each with its lines, every placeholder filled */
  const { w } = setup();
  w.ci.registerMinutesComparisons("filings", { minutesComparisonsOn: () => ROWS });
  const r = w.ci.minutesComparisonsOn({ case: "CASE-X", members: [], viewer: V("alice") });
  const o = r.rows.map((row) => ({ ...row, ...minutesLine(row) }));
  assert.deepEqual(o.map((l) => l.comparison.key), ["signing.minutes.same", "signing.minutes.differs"]);
  for (const l of o) for (const says of [l.says, l.left.says, l.right.says, l.comparison.says])
    assert.ok(!/\{[a-z_]+\}/.test(says), "every placeholder filled");
});

/* connections: its figures (R60, through record-core's `registerCounts`, its R63) and its own refusal rows (R35, R46:
   C-49 and C-81 copied into this module in T19, beside C-74). Driven at the interface: record-core's `counts(hid)`,
   which answers every registered figure, and the module's exported tables and `themeLegFindings`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CONNECTIONS_COUNT_KEYS, CONNECTION_PAIR_CHECKS, CONNECTION_CHOICE_CHECKS, THEME_CHECKS, THEME_ID_RE,
         THEME_REF_RE, THEME_LEG_KEYS, themeLegFindings } from "../../../src/connections/index.mjs";

const E = "ENT-2026-0001";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c";

/* Three documents through one entity (three connections), a member's choice on one end of the A–B connection, two
   entities marked dirty, a theme with one placement on A. */
function populated() {
  const w = world();
  w.entity(E, "The Ordinance");
  w.member("alice");
  const caps = [A, B, C].map((id, i) => w.doc(id, [`text ${i}`])[0]);
  caps.forEach((c, i) => w.resolve(c, [A, B, C][i], "Ord. 1", E, "B"));
  caps.forEach((c, i) => w.read(c, [A, B, C][i], "Ord. 1", [i]));
  assert.equal(w.k.derive({ entityId: E }).count, 3);
  const ab = w.rows(`SELECT * FROM connections WHERE (a_bundle_id=? AND b_bundle_id=?) OR (a_bundle_id=? AND b_bundle_id=?)`,
                    A, B, B, A)[0];
  const capA = ab.a_bundle_id === A ? ab.a_capture_sha : ab.b_capture_sha, capB = capA === ab.a_capture_sha ? ab.b_capture_sha : ab.a_capture_sha;
  const chose = w.k.choose({ capture: capA, other: capB, entity: E, ref: "Ord. 1", author: "alice", viewer: V("alice") });
  assert.equal(chose.wrote, true);
  w.k.markDirty(E); w.k.markDirty("ENT-2026-0002");
  const t = w.k.declareTheme({ name: "upkeep", test: "says something about upkeep", declarer: "alice" });
  assert.equal(w.k.placeInTheme({ theme: t.theme_id, target: A, placer: "alice", viewer: V("alice") }).ok, true);
  return w;
}

/* `hid` as membership's `hiddenBundles` hands it: an SQL list and its arguments. */
const hidOf = (...ids) => ({ sql: `(${ids.map(() => "?").join(", ")})`, args: ids });

test("R60: the five figures are registered once, at start, through record-core's registerCounts, and a second registration of them is refused", () => {
  const w = world();
  assert.deepEqual([...CONNECTIONS_COUNT_KEYS], ["connections", "connectionPairChoices", "connectionDirty", "themes", "themePlacements"]);
  const whole = w.record.counts(null);
  for (const key of CONNECTIONS_COUNT_KEYS) assert.equal(whole[key], 0, `${key} is answered through record-core`);
  const again = w.record.registerCounts("connections", ["connections"], () => ({ connections: 0 }));
  assert.equal(again.ok, false); assert.equal(again.reason, "COUNTS_DECLARED");
  const other = w.record.registerCounts("someone-else", ["themePlacements"], () => ({ themePlacements: 0 }));
  assert.equal(other.reason, "COUNTS_DECLARED"); assert.equal(other.heldBy, "connections", "the figure is connections' own");
});

test("R60: a whole count (hid null) is every row of each table", () => {
  const w = populated();
  const got = w.record.counts(null);
  assert.deepEqual(Object.fromEntries(CONNECTIONS_COUNT_KEYS.map((k) => [k, got[k]])), {
    connections: w.count("connections"), connectionPairChoices: w.count("connection_pair_choices"),
    connectionDirty: w.count("connection_dirty"), themes: w.count("themes"), themePlacements: w.count("theme_placements") });
  assert.deepEqual([got.connections, got.connectionPairChoices, got.connectionDirty, got.themes, got.themePlacements],
                   [3, 1, 2, 1, 1]);
});

test("R60: with hid, connections and connectionPairChoices leave out a row either of whose bundle columns names a hidden bundle; a null column names none and is counted; connectionDirty, themes and themePlacements count every row", () => {
  const w = populated();
  /* B hidden: A–B and B–C go, A–C stays; the choice on A–B goes. */
  const b = w.record.counts(hidOf(B));
  assert.equal(b.connections, 1); assert.equal(b.connectionPairChoices, 0);
  /* A hidden: A's placement is still counted (the figure has no bundle key), as are the dirt and the theme. */
  const a = w.record.counts(hidOf(A));
  assert.equal(a.connections, 1); assert.equal(a.connectionPairChoices, 0);
  assert.deepEqual([a.connectionDirty, a.themes, a.themePlacements], [2, 1, 1]);
  /* A choice row whose bundle columns are null names no bundle, so no hid leaves it out. */
  w.st.sql.exec(`INSERT INTO connection_pair_choices (a_capture_sha, b_capture_sha, entity_id, side, ref, chosen_by, at)
                 VALUES ('x', 'y', ?, 'a', 'Ord. 1', 'alice', 't')`, E);
  assert.equal(w.record.counts(hidOf(A, B, C)).connectionPairChoices, 1);
  assert.equal(w.record.counts(hidOf(A, B, C)).connections, 0);
  /* A hid naming nothing held is a whole count. */
  assert.deepEqual(w.record.counts(hidOf("INFO-2026-0999-z")).connections, 3);
});

test("R60: the figures are synchronous and write nothing", () => {
  const w = populated();
  const before = w.snapshot();
  const k = w.k.counts(hidOf(A));
  assert.equal(typeof k.then, "undefined", "a number per figure, never a promise");
  for (const key of CONNECTIONS_COUNT_KEYS) assert.equal(typeof k[key], "number");
  w.record.counts(null); w.record.counts(hidOf(B));
  assert.deepEqual(w.snapshot(), before);
});

test("R35, R46 (T19): C-49, C-74 and C-81 are this module's own rows — C-49.1–.4, C-74.1–.4, C-81.1–.14, each with a translation and a where naming its site in this module", () => {
  assert.deepEqual(Object.entries(CONNECTION_PAIR_CHECKS).map(([k, r]) => [k, r.check]), [
    ["CONNECTION_PAIR_OUTSIDE_EXTENT", "C-49.1"], ["CONNECTION_PAIR_UNPLACED", "C-49.2"],
    ["CONNECTION_PAIR_NO_CONTENT", "C-49.3"], ["CONNECTION_PAIR_MENTION_UNCHOSEN", "C-49.4"]]);
  assert.deepEqual(Object.entries(THEME_CHECKS).map(([k, r]) => [k, r.check]), [
    ["THEME_NOT_EVIDENCE", "C-81.1"], ["THEME_NOT_A_MEMBER", "C-81.2"], ["THEME_NO_TEST", "C-81.3"],
    ["THEME_NO_NAME", "C-81.4"], ["THEME_TOO_LONG", "C-81.5"], ["THEME_NOT_FOUND", "C-81.6"],
    ["THEME_PLACEMENT_NOT_A_MEMBER", "C-81.7"], ["THEME_TARGET_NOT_FOUND", "C-81.8"], ["THEME_REASON_TOO_LONG", "C-81.9"],
    ["THEME_NO_PROPOSER", "C-81.10"], ["THEME_WITHDRAW_NOT_A_MEMBER", "C-81.11"], ["THEME_WITHDRAW_NO_REASON", "C-81.12"],
    ["THEME_WITHDRAW_NOTHING_STANDING", "C-81.13"], ["THEME_WITHDRAW_NOT_THE_PLACER", "C-81.14"]]);
  for (const r of [...Object.values(CONNECTION_PAIR_CHECKS), ...Object.values(CONNECTION_CHOICE_CHECKS), ...Object.values(THEME_CHECKS)]) {
    assert.match(r.where, /^src\/connections\/[a-z-]+\.mjs [#A-Za-z]+( > [a-z-]+)?$/, `${r.check}'s where is a site here`);
    assert.ok(typeof r.translation === "string" && r.translation.length > 40, r.check);
  }
  assert.equal(THEME_CHECKS.THEME_NOT_EVIDENCE.where, "src/connections/checks.mjs themeLegFindings > is-theme-not-evidence");
});

test("R46 (T19): C-81.1 is answered from this module's row, its id grammar exported — THEME_ID_RE a bare theme id, THEME_REF_RE a theme or a membership in one, THEME_LEG_KEYS the two keys", () => {
  const id = "THEME-2026-0927-ab12cd";
  assert.ok(THEME_ID_RE.test(id)); assert.ok(!THEME_ID_RE.test(`${id}#INFO-2026-0001-a`));
  for (const s of [id, `${id}#x`, `${id}/x`, `${id}:x`, `${id}?x`]) assert.ok(THEME_REF_RE.test(s), s);
  for (const s of [`${id}x!`, "INFO-2026-0001-a", "THEME-26-0927-ab"]) assert.ok(!THEME_REF_RE.test(s), s);
  assert.deepEqual([...THEME_LEG_KEYS], ["theme", "themes"]);
  const findings = [];
  assert.equal(themeLegFindings("basis[0]", { target: `${id}#INFO-2026-0001-a` }, findings), true);
  assert.equal(findings.length, 1);
  assert.deepEqual([findings[0].check, findings[0].severity, findings[0].code, findings[0].repairable],
                   [THEME_CHECKS.THEME_NOT_EVIDENCE.check, "error", "THEME_NOT_EVIDENCE", true]);
  assert.match(findings[0].message, /names a THEME membership/);
});

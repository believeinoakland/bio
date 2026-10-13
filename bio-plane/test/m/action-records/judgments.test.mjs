/* action-records' four single-site judgments at its interface (R7–R10; was `actions` R18's list-shape clause, R23's
   `BAD_RISK_TIER` site, R64's "a standard the viewer may see" clause and R70's judgment). Each by name, with a negative
   control; each writes nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, M, MACHINE, STD, STD_HIDDEN, progressionsStandIn, standardsStandIn } from "./fixture.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import { noSuchStandard } from "../../../src/standards/index.mjs";

const tables = ["action_law_proposals", "action_risk_proposals", "action_seeks_proposals", "action_receipts", "action_scopes", "action_promises"];
const census = (w) => JSON.stringify([...tables.map((t) => w.row(`SELECT COUNT(*) AS n FROM ${t}`).n),
  w.row(`SELECT COUNT(*) AS n FROM bundles`).n, w.row(`SELECT COUNT(*) AS n FROM manifest`).n]);

test("R7 lawEntries judges a governing-laws list's shape: NO_LAWS (C-73.2), TOO_MANY_LAWS (C-73.5), BAD_LAW_LEVEL (C-73.3), BAD_CITATION (C-73.4), first found; the parsed entries otherwise; writes nothing", () => {
  const w = world();
  const before = census(w);
  const L = (laws) => w.r.lawEntries(laws);
  /* NO_LAWS: not a non-empty list; a string is parsed as JSON first */
  for (const laws of [undefined, null, [], {}, "x", "[]", "{\"a\":1}", 3]) {
    const r = L(laws);
    assert.deepEqual([r.ok, r.reason, r.check, r.legal_levels], [false, "NO_LAWS", "C-73.2", grammar.LAW_LEVELS], JSON.stringify(laws));
  }
  /* TOO_MANY_LAWS over GOVERNING_LAWS_MAX (12), asked before any entry */
  const many = L(Array.from({ length: 13 }, () => ({ level: "nowhere", citation: "" })));
  assert.deepEqual([many.reason, many.check, many.count, many.max], ["TOO_MANY_LAWS", "C-73.5", 13, grammar.GOVERNING_LAWS_MAX]);
  assert.equal(grammar.GOVERNING_LAWS_MAX, 12);
  const twelve = L(Array.from({ length: 12 }, (_, i) => ({ level: "state", citation: `S ${i}` })));
  assert.deepEqual([twelve.ok, twelve.entries.length], [true, 12], "control: twelve land");
  /* BAD_LAW_LEVEL: with the index and the legal levels LAW_LEVELS holds */
  const lvl = L([{ level: "state", citation: "a" }, { level: "local", citation: "b" }]);
  assert.deepEqual([lvl.reason, lvl.check, lvl.index, lvl.level, lvl.legal], ["BAD_LAW_LEVEL", "C-73.3", 1, "local", grammar.LAW_LEVELS]);
  for (const e of [null, "state", { citation: "a" }]) assert.equal(L([e]).reason, "BAD_LAW_LEVEL", JSON.stringify(e));
  for (const level of grammar.LAW_LEVELS) assert.equal(L([{ level, citation: `Code ${level}` }]).ok, true, level);
  /* BAD_CITATION: empty, over CITATION_MAX, a quote, backslash or line break, or repeated at its level (case-folded) */
  for (const citation of ["", "   ", "x".repeat(grammar.CITATION_MAX + 1), 'a"b', "a\\b", "a\nb", "a\rb", 7]) {
    const r = L([{ level: "state", citation }]);
    assert.deepEqual([r.reason, r.check, r.index], ["BAD_CITATION", "C-73.4", 0], JSON.stringify(citation));
  }
  const rep = L([{ level: "city", citation: "Code 1" }, { level: "city", citation: " code 1 " }]);
  assert.deepEqual([rep.reason, rep.index], ["BAD_CITATION", 1]);
  assert.match(rep.detail, /repeats an earlier entry/);
  assert.equal(L([{ level: "city", citation: "Code 1" }, { level: "state", citation: "Code 1" }]).ok, true, "control: the same citation at another level");
  assert.equal(L([{ level: "state", citation: "x".repeat(grammar.CITATION_MAX) }]).ok, true, "control: CITATION_MAX characters");
  /* first found: a bad level before a bad citation of a later entry, and the earlier entry's fault first */
  assert.equal(L([{ level: "state", citation: "" }, { level: "local", citation: "b" }]).reason, "BAD_CITATION");
  /* the parsed entries: trimmed, a standard kept as a string, a JSON string read as the list */
  const ok = L(JSON.stringify([{ level: " state ", citation: " Act s.1 ", standard: ` ${STD} ` }, { level: "city", citation: "Code 2", standard: "" }]));
  assert.deepEqual(ok, { ok: true, entries: [{ level: "state", citation: "Act s.1", standard: STD }, { level: "city", citation: "Code 2" }] });
  assert.equal(census(w), before, "writes nothing");
});

test("R8 badRiskTier answers C-90.2 BAD_RISK_TIER naming target, tier and legal [1, 2, 3], its detail saying who states a tier and that undetermined is not a tier to set; the one site for the act and a proposal", () => {
  const w = world();
  const before = census(w);
  const r = w.r.badRiskTier("ACTN-2026-0001-a", 7, "the act");
  const row = grammar.RISK_TIER_REVISION_CHECKS.BAD_RISK_TIER;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.target, r.tier, r.legal],
    [false, "BAD_RISK_TIER", "BAD_RISK_TIER", "C-90.2", row.translation, "ACTN-2026-0001-a", 7, [1, 2, 3]]);
  assert.equal(r.detail, "the act states a tier of 1 (file freely), 2 (file with caution) or 3 (do not file without counsel). "
    + "Undetermined is what an action reads when nobody has assessed it, not a tier to set.");
  assert.match(w.r.badRiskTier("T", undefined, "a proposal").detail, /^a proposal states a tier/);
  assert.equal(w.r.badRiskTier("T", undefined, "a proposal").tier, null, "an absent tier is named null");
  /* the proposal's refusal is this answer, field for field (one site) */
  w.action("ACTN-2026-0001-a");
  const p = w.r.actionRiskPropose({ target: "ACTN-2026-0001-a", tier: 7, basis: "b", proposer: M, viewer: M });
  assert.deepEqual(p, w.r.badRiskTier("ACTN-2026-0001-a", 7, "a proposal"));
  /* control: a tier of 1, 2 or 3 is not refused by a proposal */
  for (const tier of [1, 2, 3]) assert.equal(w.r.actionRiskPropose({ target: "ACTN-2026-0001-a", tier, basis: "b", proposer: M, viewer: M }).ok, true);
  const [, risk, ...rest] = JSON.parse(census(w)), [, , ...was] = JSON.parse(before);
  assert.equal(risk, 1, "the proposer's one standing proposal");
  assert.deepEqual(rest.slice(0, 4), was.slice(0, 4), "badRiskTier itself wrote nothing");
});

test("R9 standardSeen answers null for a STD- id the viewer may read, else standards.noSuchStandard's one answer, absent and invisible alike; a read that throws, or no standards, is not seen; writes nothing", () => {
  const st = standardsStandIn();
  const w = world({ deps: { standards: st } });
  const before = census(w);
  assert.equal(w.r.standardSeen(STD, M), null);
  assert.equal(w.r.standardSeen(` ${STD} `, M), null, "trimmed");
  assert.deepEqual(st.asked.at(-1), { id: STD, viewer: M });
  assert.equal(w.r.standardSeen(STD_HIDDEN, V("bob")), null, "control: seen by its viewer");
  const hidden = w.r.standardSeen(STD_HIDDEN, M), absent = w.r.standardSeen("STD-2026-0404-none", M);
  assert.deepEqual(hidden, noSuchStandard(STD_HIDDEN));
  assert.deepEqual(absent, noSuchStandard("STD-2026-0404-none"));
  assert.deepEqual(Object.keys(hidden).sort(), Object.keys(absent).sort(), "absent and invisible alike");
  assert.equal(hidden.detail, absent.detail);
  /* not a STD- id, or not an id: never asked, not seen */
  const n = st.asked.length;
  for (const id of ["INFO-2026-0001-d", "STD-x", "", null, 5])
    assert.equal(w.r.standardSeen(id, M).reason, "NO_SUCH_STANDARD", String(id));
  assert.equal(st.asked.length, n, "standards is asked only for a STD- id");
  assert.equal(w.r.standardSeen("INFO-2026-0001-d", M).standard, "INFO-2026-0001-d");
  st.broken = true;
  assert.equal(w.r.standardSeen(STD, M).reason, "NO_SUCH_STANDARD", "a read that throws is not seen");
  const none = world({ deps: { standards: false } });
  assert.equal(none.r.standardSeen(STD, M).reason, "NO_SUCH_STANDARD", "a host with no standards");
  assert.equal(census(w), before, "writes nothing");
});

const E1 = "ENT-2026-0001-council";
test("R10 seeksRefusal: action-grammar's seeksFindings with each distinct progression read once through progressions.readProgression; null or SEEKS_REFUSED (C-117.29) with every finding; unreadable read as not held, with cause PROGRESSIONS_UNREADABLE; writes nothing", () => {
  const prog = progressionsStandIn();
  const w = world({ deps: { progressions: prog } });
  const before = census(w);
  const rr = (seeks) => ({ action_kind: "records_request", seeks });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }, { progression: "meeting", entity: E1, stage: "notice" },
              { progression: "budget", entity: E1, stage: "adopted" }];
  assert.equal(w.r.seeksRefusal(rr(ok)), null);
  assert.deepEqual(prog.asked, ["meeting", "budget"], "each distinct progression read once");
  assert.equal(w.r.seeksRefusal({ action_kind: "records_request" }), null, "control: no seeks stated");
  /* the grammar's own findings, every one carried, the first deciding the refusal */
  const bad = w.r.seeksRefusal(rr([{ progression: "zoning", entity: E1, stage: "x" }, { progression: "meeting", entity: E1, stage: "vote" }]));
  const expected = [];
  grammar.seeksFindings(rr([{ progression: "zoning", entity: E1, stage: "x" }, { progression: "meeting", entity: E1, stage: "vote" }]),
    { stages: { zoning: null, meeting: ["notice", "minutes"] } }, expected);
  assert.deepEqual([bad.ok, bad.reason, bad.code, bad.check], [false, "SEEKS_REFUSED", "SEEKS_REFUSED", "C-117.29"]);
  assert.equal(bad.translation, grammar.ACTION_CATALOGUE_CHECKS.SEEKS_REFUSED.translation);
  assert.equal(bad.detail, expected[0].message);
  assert.deepEqual(bad.findings.map((f) => f.detail), expected.filter((x) => x.severity === "error").map((x) => x.message));
  assert.equal("cause" in bad, false, "read and not held is not unreadable");
  assert.equal(w.r.seeksRefusal({ action_kind: "other", seeks: ok }).reason, "SEEKS_REFUSED", "seeks on another kind");
  /* a definition that cannot be read is read as not held, fail closed, and the refusal says so */
  prog.broken = true;
  const thrown = w.r.seeksRefusal(rr(ok));
  assert.deepEqual([thrown.reason, thrown.cause], ["SEEKS_REFUSED", "PROGRESSIONS_UNREADABLE"]);
  prog.broken = false; prog.refusing = true;
  assert.equal(w.r.seeksRefusal(rr(ok)).cause, "PROGRESSIONS_UNREADABLE", "a read answering ok: false");
  const none = world({ deps: { progressions: false } });
  assert.equal(none.r.seeksRefusal(rr(ok)).cause, "PROGRESSIONS_UNREADABLE", "a host with no progressions");
  assert.equal(census(w), before, "writes nothing");
});

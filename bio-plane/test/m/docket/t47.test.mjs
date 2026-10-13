/* docket at T47 (T47-28; N952, N992; DEC-199): `withdrawalOf` names `entry`, the public entry's id `public-read` R20's
   link reads (R12); C-129.29 DOCKET_OUTCOME_UNREADABLE takes its translation from `words.json`'s
   `refusal.DOCKET_OUTCOME_UNREADABLE`, read by key, and every arm R1 refuses with it answers that sentence (R29). At the
   module's interface: the rows as exported, and each refusal as the acts answer it, beside its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seeded, file, prepare, post, V, CASE, OUTCOME } from "./fixture.mjs";
import { DOCKET_CHECKS, DOCKET_WORDS } from "../../../src/docket/index.mjs";

const A = V("alice");
const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const KEY = "refusal.DOCKET_OUTCOME_UNREADABLE";
/* T45's words for the row, answered no longer. */
const T45 = "An outcome entry says what the outcome was (a cure, or a harm addressed) and the date it happened, no later "
  + "than today; an entry of any other kind says neither. Nothing was written.";

function refusedThenAccepted(w, bad, good) {
  const before = w.snapshot();
  const r = bad();
  assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "DOCKET_OUTCOME_UNREADABLE", "DOCKET_OUTCOME_UNREADABLE", "C-129.29"],
                   JSON.stringify(r).slice(0, 300));
  assert.equal(r.translation, en(KEY), "the refusal answers words.json's sentence");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const ok = good();
  assert.equal(ok.ok, true, `control: ${JSON.stringify(ok).slice(0, 300)}`);
}

test("R29 C-129.29 DOCKET_OUTCOME_UNREADABLE reads words.json's refusal.DOCKET_OUTCOME_UNREADABLE by key from DOCKET_WORDS, never a copy; code, number and where unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(DOCKET_WORDS));
  assert.deepEqual(Object.keys(DOCKET_WORDS), [KEY], "the one row R29 takes");
  assert.equal(DOCKET_WORDS[KEY], en(KEY), "verbatim");
  const row = DOCKET_CHECKS.DOCKET_OUTCOME_UNREADABLE;
  assert.deepEqual(row, { check: "C-129.29", where: "src/docket/index.mjs #formRefusal > is-docket-form", translation: en(KEY) });
  assert.notEqual(row.translation, T45);
  /* every other row keeps its own: none translates by this sentence */
  for (const [code, r] of Object.entries(DOCKET_CHECKS))
    if (code !== "DOCKET_OUTCOME_UNREADABLE") assert.notEqual(r.translation, en(KEY), code);
});

test("R29 each of R1's four outcome refusals (missing, an unknown kind, dated after its filing, stated on another kind) answers DEC-199's sentence, each writing nothing, each beside its control", () => {
  const w = seeded();
  const good = () => file(w, OUTCOME);
  /* an outcome missing */
  for (const outcome of [undefined, null, "", {}])
    refusedThenAccepted(w, () => file(w, { ...OUTCOME, outcome }), good);
  /* of an unknown kind */
  refusedThenAccepted(w, () => file(w, { ...OUTCOME, outcome: { kind: "success", on: "2026-09-30" } }), good);
  /* dated after its filing (the fixture's clock is 2026-10-01) */
  refusedThenAccepted(w, () => file(w, { ...OUTCOME, outcome: { kind: "cure", on: "2026-10-02" } }),
                      () => file(w, { ...OUTCOME, outcome: { kind: "cure", on: "2026-10-01" } }));
  /* stated on another kind of entry */
  refusedThenAccepted(w, () => file(w, { outcome: OUTCOME.outcome }), () => file(w));
  /* R4 re-runs R1's form checks on the entry it would sign: a record outcome without its statement answers the same */
  const f = file(w, OUTCOME);
  w.st.sql.exec(`UPDATE docket_record SET outcome_json=NULL, summary=NULL WHERE entry_id=?`, f.entry);
  refusedThenAccepted(w, () => prepare(w, { kind: "outcome", entry: f.entry }),
                      () => prepare(w, { kind: "outcome", entry: file(w, OUTCOME).entry }));
});

test("R12 (T47, N952) withdrawalOf names `entry`, the id of the public withdrawal entry docketPublic answers, which public-read R20's link reads; for one edition and for all", async () => {
  const w = seeded();
  w.publish(w.P, CASE, 2, [{ id: w.F1, role: "load_bearing" }]);
  await post(w, { kind: "edition", edition: 2 });
  const one = await post(w, { kind: "withdrawal", edition: 1, reason: "Edition 1 overstated the totals." });
  const all = await post(w, { kind: "withdrawal", edition: "all", reason: "We no longer stand behind the case." });
  const pub = await w.docket.docketPublic({ case: CASE, captures: "omit" });
  for (const [edition, posted] of [[1, one], [2, all]]) {
    const wd = w.docket.withdrawalOf({ case: CASE, edition });
    assert.deepEqual(Object.keys(wd).sort(), ["date", "digest", "entry", "reason", "seq"], "exactly R12's fields");
    const shown = pub.entries.find((e) => e.seq === wd.seq);
    assert.equal(wd.entry, posted.entry, "the entry the post answered");
    assert.equal(wd.entry, shown.entry, "the entry the public docket answers");
    assert.deepEqual([wd.seq, wd.digest, wd.date, wd.reason], [shown.seq, shown.digest, shown.fields.date, shown.fields.reason]);
    assert.equal(shown.fields.kind, "withdrawal");
  }
  /* control: an edition no withdrawal names answers null, and so has no entry to link */
  w.publish(w.P, CASE, 3, [{ id: w.F1, role: "load_bearing" }]);
  assert.equal(w.docket.withdrawalOf({ case: CASE, edition: 3 }), null);
  assert.equal(w.docket.docketOf({ case: CASE, viewer: A }).ok, true);
});

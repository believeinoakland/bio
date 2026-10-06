/* local-facts: factConfirm (R1) and the append-only invariant (R5). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, P, TP } from "./fixture.mjs";
import { LOCAL_FACTS_CHECKS, LOCAL_FACT_ACTS } from "../../../src/local-facts/index.mjs";

const row = (r, code) => {
  assert.equal(r.ok, false);
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  assert.equal(r.check, LOCAL_FACTS_CHECKS[code].check);
  assert.equal(r.translation, LOCAL_FACTS_CHECKS[code].translation);
};

test("R1 a member confirms, corrects or disputes any fact of the active profiles, answered {ok, path, act, at}", () => {
  const w = world();
  for (const path of Object.values(P)) for (const act of LOCAL_FACT_ACTS) {
    const fields = act === "correct" ? { value: w.status(path).profile.value, source: "the office's posted notice" } : {};
    const r = w.act(path, act, fields);
    assert.deepEqual(r, { ok: true, path, act, at: "2026-09-28T01:00:00Z" }, `${path} ${act}`);
  }
  assert.equal(w.count(), Object.keys(P).length * 3);
});

test("R1 refusals in order, each with its row, and a negative control for each", () => {
  const w = world();
  /* MACHINE_CANNOT_CONFIRM: a machine, or no `by`, before anything else (even an unknown path and act) */
  row(w.act("nowhere", "guess", { by: MACHINE, how: "" }), "MACHINE_CANNOT_CONFIRM");
  row(w.act("nowhere", "guess", { by: "", how: "" }), "MACHINE_CANNOT_CONFIRM");
  row(w.lf.factConfirm({ path: P.tz, act: "confirm", how: "x" }), "MACHINE_CANNOT_CONFIRM");
  /* NO_SUCH_FACT: a path R6 does not name, a profile not active, a fact the profile does not hold */
  for (const path of ["nowhere", `${TP}/holidays/2031`, "other-profile/time_zone", `${TP}/hours/venue=bylaw_complaint`, null])
    row(w.act(path, "guess", { how: "" }), "NO_SUCH_FACT");
  /* FACT_ACT_REFUSED before the how */
  row(w.act(P.tz, "guess", { how: "" }), "FACT_ACT_REFUSED");
  /* FACT_HOW_REFUSED: none, blank, or over 500 characters; 500 is accepted */
  for (const how of [undefined, "  ", "x".repeat(501)]) row(w.act(P.tz, "confirm", { how }), "FACT_HOW_REFUSED");
  assert.equal(w.act(P.tz, "confirm", { how: "x".repeat(500) }).ok, true);
  /* FACT_VALUE_REFUSED: a correction without a value, with one not of the field's form, without a source, or with a
     source over 500 characters */
  const src = { source: "the office's notice" };
  row(w.act(P.tz, "correct", { ...src }), "FACT_VALUE_REFUSED");
  row(w.act(P.tz, "correct", { value: "not a zone", ...src }), "FACT_VALUE_REFUSED");
  row(w.act(P.tz, "correct", { value: { value: "Europe/Lisbon" }, ...src }), "FACT_VALUE_REFUSED");
  row(w.act(P.tz, "correct", { value: "Europe/Lisbon" }), "FACT_VALUE_REFUSED");
  row(w.act(P.tz, "correct", { value: "Europe/Lisbon", source: "s".repeat(501) }), "FACT_VALUE_REFUSED");
  row(w.act(P.y2026, "correct", { value: [{ date: "2027-01-01", name: "outside its year" }], ...src }), "FACT_VALUE_REFUSED");
  row(w.act(P.clerkHours, "correct", { value: { weekly: [{ day: "mon", open: "17:00", close: "09:00" }] }, ...src }), "FACT_VALUE_REFUSED");
  row(w.act(P.clerkHours, "correct", { value: [{ day: "mon", open: "09:00", close: "17:00" }], ...src }), "FACT_VALUE_REFUSED");
  /* the controls: each value of its field's form is accepted */
  assert.equal(w.act(P.tz, "correct", { value: "Europe/Lisbon", ...src }).ok, true);
  assert.equal(w.act(P.y2026, "correct", { value: [{ date: "2026-01-01", name: "New Year's Day" }], ...src }).ok, true);
  assert.equal(w.act(P.clerkHours, "correct", { value: { weekly: [{ day: "mon", open: "09:00", close: "17:00" }] }, ...src }).ok, true);
  assert.equal(w.act(P.venueHours, "correct", { value: { weekly: [{ day: "tue", open: "10:00", close: "11:00" }] }, ...src }).ok, true);
  assert.equal(w.count(), 5, "only the accepted acts were written");
});

test("R1 a fact withheld as a conflict is still named in an active profile, so it may be acted on", () => {
  const two = { id: "test-two", name: "Two", covers: ["Two"], test: true, time_zone: { value: "Europe/Lisbon", status: "researched", basis: "TEST" } };
  const w = world({ profiles: [TP, "test-two"], own: [two] });
  assert.equal(w.act(P.tz, "dispute").ok, true);
  assert.equal(w.act("test-two/time_zone", "confirm").ok, true);
  assert.equal(w.status(P.tz).status, "absent");
});

test("R5 append-only: every act is kept with its member, date and how; nothing is overwritten or deleted; a machine never acts", () => {
  const w = world();
  w.act(P.tz, "confirm", { by: V("bob"), how: "the town's page" });
  w.at("2026-09-29T08:00:00Z").act(P.tz, "correct", { by: V("carol"), how: "called the clerk", value: "Europe/Lisbon", source: "the clerk" });
  w.at("2026-09-30T08:00:00Z").act(P.tz, "dispute", { by: V("dan"), how: "a returned filing" });
  for (const by of [MACHINE, "daemon", undefined]) assert.equal(w.act(P.tz, "confirm", { by }).reason, "MACHINE_CANNOT_CONFIRM");
  const rows = w.rows("SELECT path, profile, act, how, value_json, source, by_member, at FROM local_fact_acts ORDER BY seq");
  assert.deepEqual(rows.map((r) => [r.act, r.by_member, r.at, r.how]), [
    ["confirm", V("bob"), "2026-09-28T01:00:00Z", "the town's page"],
    ["correct", V("carol"), "2026-09-29T08:00:00Z", "called the clerk"],
    ["dispute", V("dan"), "2026-09-30T08:00:00Z", "a returned filing"]]);
  assert.equal(rows[0].value_json, JSON.stringify("America/Halifax"), "a confirm keeps the value it confirmed");
  assert.equal(rows[1].source, "the clerk");
  /* the table declared to purge (K23): only the whole-store form clears it */
  const one = w.record.purge({ bundleId: "INFO-2026-0001" });
  assert.equal(w.count(), 3, "a single-bundle purge leaves it");
  assert.equal(one.removed.local_fact_acts, 0, "the table is declared, and named in the report");
  assert.equal(w.record.purge({}).removed.local_fact_acts, 3);
  assert.equal(w.count(), 0, "the whole-store purge clears it");
  /* nothing in the module's answer to a read writes */
  w.act(P.tz, "confirm");
  const before = w.count();
  w.lf.factStatus({}); w.lf.factStatus({ path: P.tz }); w.lf.factsDue({}); w.lf.factsDue({ paths: [P.tz] });
  assert.equal(w.count(), before);
});

test("R9 the table is declared explicitly through record-core's declareTable, with its classes", () => {
  const w = world();
  const mine = w.record.declaredTables().filter((d) => d.module === "local-facts");
  assert.deepEqual(mine, [{ module: "local-facts", name: "local_fact_acts", keys: [], purge: "clear", expunge: "none",
                            export: "admin-only", sight: "group", derive: "stored", version_chain: true }]);
  /* the purge classes keep R5: only the whole-store form clears it (shown in R5's test); declared once */
  assert.equal(w.record.declareTable("local-facts", [{ ...mine[0] }]).reason, "TABLE_DECLARED");
});

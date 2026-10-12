/* local-facts: an office's own time zone (T45; jurisdictions R74): its path (R6), its horizon and the office's local
   day (R3), and governingPath for time_zone (R6). The test profile's zone is America/Halifax; its Examiner of Accounts
   keeps America/St_Johns (UTC-2:30 in daylight time) and the commitment_claim venue America/Glace_Bay. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, P, TP, written } from "./fixture.mjs";
import { factPath, parseFactPath } from "../../../src/local-facts/index.mjs";

const EXAMINER = { role: "Examiner of Accounts", body: "Marlow County Audit Office" };
const CLERK = { role: "Town Clerk", body: "City of Port Ellery" };

test("R6 factPath takes time_zone with an office for its own zone, a path apart from the profile's; parseFactPath its parts", () => {
  const cases = [
    [{ profile: TP, fact: "time_zone", office: EXAMINER }, P.examinerTz],
    [{ profile: TP, fact: "time_zone", office: { venue: "commitment_claim" } }, P.venueTz],
  ];
  for (const [parts, path] of cases) {
    assert.equal(factPath(parts), path);
    assert.deepEqual(parseFactPath(path), parts);
  }
  assert.notEqual(P.examinerTz, P.tz);
  assert.equal(factPath({ profile: TP, fact: "time_zone", office: null }), P.tz, "no office: the profile's zone");
  assert.equal(factPath({ fact: "time_zone", profile: TP, office: { body: EXAMINER.body, role: EXAMINER.role } }), P.examinerTz);
  for (const office of [{}, { role: "R" }, { venue: "k", role: "R" }, { role: " R", body: "B" }, "Clerk", 3, []])
    assert.equal(factPath({ profile: TP, fact: "time_zone", office }), null, JSON.stringify(office));
  for (const s of [`${TP}/time_zone/role=R`, `${TP}/time_zone/body=B,role=R`, `${TP}/time_zone/venue=a/b`,
                   `${TP}/time_zone/role=Town Clerk,body=X`, `${TP}/time_zone/venue=k/extra`])
    assert.equal(parseFactPath(s), null, s);
});

test("R1 R2 R6 an office's own zone is a fact of its own: its status, value and basis; confirmed, corrected and disputed apart from the profile's", () => {
  const w = world();
  const s = w.status(P.examinerTz);
  assert.deepEqual([s.status, s.profile.value, s.profile.status, s.profile.basis], ["unconfirmed", "America/St_Johns", "ruled", "TEST"]);
  assert.deepEqual(s.fact, { profile: TP, fact: "time_zone", office: EXAMINER });
  assert.equal(w.status(P.venueTz).profile.value, "America/Glace_Bay");
  assert.equal(w.act(P.examinerTz, "confirm").ok, true);
  assert.equal(w.status(P.examinerTz).status, "confirmed");
  assert.equal(w.status(P.tz).status, "unconfirmed", "the profile's zone untouched");
  /* a correction is validated as the office's own field */
  assert.equal(w.act(P.venueTz, "correct", { value: "not a zone", source: "the court's notice" }).reason, "FACT_VALUE_REFUSED");
  assert.equal(w.act(P.venueTz, "correct", { value: "America/Moncton", source: "the court's notice" }).ok, true);
  assert.deepEqual([w.status(P.venueTz).status, w.status(P.venueTz).governs.value], ["corrected", "America/Moncton"]);
  /* an office holding no zone of its own names no fact */
  const clerkTz = factPath({ profile: TP, fact: "time_zone", office: CLERK });
  assert.equal(w.act(clerkTz, "confirm").reason, "NO_SUCH_FACT");
  assert.equal(w.status(clerkTz).status, "absent");
  /* both are listed with the profile's facts, and in factsDue */
  const paths = w.lf.factStatus({}).facts.map((f) => f.path);
  assert.ok(paths.includes(P.examinerTz) && paths.includes(P.venueTz));
  assert.ok(w.lf.factsDue({}).due.some((d) => d.path === P.venueTz) === false, "a corrected fact is not due");
  assert.ok(w.lf.factsDue({}).due.some((d) => d.path === P.tz));
});

test("R3 an office's own time zone lapses as the profile's does, 183 days, on the office's own local day", () => {
  /* confirmed at 2026-01-11T02:00Z: 2026-01-10 in Halifax (UTC-4), 2026-01-10 22:30 in St John's (UTC-3:30) */
  const w = world();
  w.at("2026-01-11T02:00:00Z").act(P.examinerTz, "confirm");
  /* local day 183 in St John's begins 2026-07-12 00:00 NDT (UTC-2:30) = 2026-07-12T02:30Z */
  assert.equal(w.at("2026-07-12T02:29:59Z").status(P.examinerTz).status, "confirmed");
  const s = w.at("2026-07-12T02:30:00Z").status(P.examinerTz);
  assert.deepEqual([s.status, s.lapses_on, s.due], ["unconfirmed", "2026-07-12", true]);
  /* the negative control: the profile's zone, confirmed at the same instant, lapses at Halifax's midnight */
  w.at("2026-01-11T02:00:00Z").act(P.tz, "confirm");
  assert.equal(w.at("2026-07-12T02:59:59Z").status(P.tz).status, "confirmed");
  assert.equal(w.at("2026-07-12T03:00:00Z").status(P.tz).status, "unconfirmed");
});

test("R3 a day for an office fact is that office's local day when the profile holds its own zone: its hours lapse on it, and a member's correction of the office's zone moves it", () => {
  const prof = written("test-offices", { time_zone: { value: "America/Halifax", status: "researched", basis: "TEST" },
    counterparties: [{ role: "Registrar", body: "Far Registry", level: "county", elected: false, basis: "TEST",
                       time_zone: { value: "Asia/Tokyo", status: "researched", basis: "TEST" },
                       hours: { weekly: [{ day: "mon", open: "09:00", close: "17:00" }], status: "researched", basis: "TEST" } },
                     { role: "Clerk", body: "Near Office", level: "city", elected: false, basis: "TEST",
                       hours: { weekly: [{ day: "mon", open: "09:00", close: "17:00" }], status: "researched", basis: "TEST" } }] });
  const reg = factPath({ profile: "test-offices", fact: "hours", office: { role: "Registrar", body: "Far Registry" } });
  const near = factPath({ profile: "test-offices", fact: "hours", office: { role: "Clerk", body: "Near Office" } });
  const regTz = factPath({ profile: "test-offices", fact: "time_zone", office: { role: "Registrar", body: "Far Registry" } });
  const w = world({ profiles: ["test-offices"], own: [prof] });
  /* 2026-01-10T03:00Z: 2026-01-10 in Tokyo, 2026-01-09 in Halifax */
  w.at("2026-01-10T03:00:00Z").act(reg, "confirm");
  w.at("2026-01-10T03:00:00Z").act(near, "confirm");
  assert.match(w.status(reg).why, /2026-01-10$/, "the act's day is the office's");
  assert.match(w.status(near).why, /2026-01-09$/, "an office without its own zone counts on the profile's");
  /* Tokyo's 2026-07-12 begins 2026-07-11T15:00Z */
  assert.equal(w.at("2026-07-11T14:59:59Z").status(reg).status, "confirmed");
  assert.deepEqual([w.at("2026-07-11T15:00:00Z").status(reg).status, w.status(reg).lapses_on], ["unconfirmed", "2026-07-12"]);
  assert.equal(w.status(near).lapses_on, "2026-07-11", "Halifax: 183 days from 2026-01-09");
  /* a member corrects the office's zone: its days move with it */
  w.at("2026-01-10T03:00:00Z").act(regTz, "correct", { value: "America/Halifax", source: "the registry's notice" });
  assert.equal(w.status(reg).lapses_on, "2026-07-11");
});

test("R6 governingPath for time_zone: the office's own path when the profile holds one, else the profile's, saying so", () => {
  const w = world();
  const ask = (office) => w.lf.governingPath({ profile: TP, fact: "time_zone", office, viewer: V("bob") });
  assert.deepEqual(ask(EXAMINER), { ok: true, path: P.examinerTz, via: "own", lines: [], why: "the profile holds this office's own time zone" });
  assert.equal(ask({ venue: "commitment_claim" }).path, P.venueTz);
  assert.deepEqual(ask(CLERK), { ok: true, path: P.tz, via: "profile", lines: [],
                                 why: "the profile holds no time zone of this office's own, so the profile's governs it" });
  assert.deepEqual(ask(undefined), { ok: true, path: P.tz, via: "profile", lines: [], why: "the time zone is the profile's, for every office" });
  /* no zone anywhere: undetermined */
  const bare = written("test-bare", { counterparties: [{ role: "Clerk", body: "Office", level: "city", elected: false, basis: "TEST" }] });
  const b = world({ profiles: ["test-bare"], own: [bare] });
  const none = b.lf.governingPath({ profile: "test-bare", fact: "time_zone", office: { role: "Clerk", body: "Office" } });
  assert.deepEqual([none.path, none.via], [null, "none"]);
  assert.match(none.why, /undetermined/);
});

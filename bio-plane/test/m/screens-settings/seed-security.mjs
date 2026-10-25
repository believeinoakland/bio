/* The seed for Settings › Security, Updates and The team's assistant over the world (store-request's `storeWorld`, K5054): the worlds
   these screens' tests need, made by the real acts; and the few faults a world cannot make (an answer that never comes). */
import { storeWorld } from "./kit.mjs";

/** The sealing secret a deployment sets so that a key can be kept (ai-accounts R22; a platform binding, so a double of the environment). */
export const SEAL = "a-long-seal-secret-for-screens-settings";

/** A team with its founder (the one active administrator), signed in; `env` is handed to the world as platform doubles. */
export async function team(env = {}) {
  const w = await storeWorld({ env });
  const founder = await w.signIn("founder");
  return { w, founder };
}

/** The founder's handle as the roster gives it (what the screens say for the founder, never the id). */
export const handleOf = async (as, id = "admin") => (await as.read("memberlist")).members.find((m) => m.member_id === id).handle;

/** The team's own key, held and switched on, by the real acts (the password asked again first, as an administrator's page does). */
export async function holdKey(as, w, key = "sk-ant-api03-SENTINELKEY") {
  await as.act("reauth", { body: { password: w.password } });
  await as.act("groupkeyset", { body: { key } });
  await as.act("groupkeyswitch", { body: { on: true } });
  return key;
}

/** The faults a world cannot make: a read that never answers. */
export const SILENT = Object.freeze({ projectlist: "none" });

/** The team's spend, as a counter row of the day (WORLD GAP: only a model call's recording makes one, and the model is a platform the
 *  world does not hold; nothing else is seeded). `day` defaults to the first of the month the world's clock stands in. */
export function spend(w, dollars, day = new Date(w.now()).toISOString().slice(0, 8) + "01") {
  w.sql.exec("INSERT INTO ai_usage (owner, member, day, use, mode, calls, cost_micro_usd) VALUES ('group', 'admin', ?, 'ask', 'ask', 3, ?)", day, Math.round(dollars * 1e6));
}

/* ---- Updates ---- */

/** A founder with no handle (the claim chose none): her session is `admin`, and the screens name her by `member.founder.unnamed`. */
export async function unnamedTeam(env = {}) {
  const w = await storeWorld({ claimed: false, env });
  await w.claim({ password: "a-long-enough-passphrase-for-the-founder" });
  return { w, founder: await w.signIn("admin") };
}

/** The release notes a release carries (three parts; `must_do` may be empty). */
export const notesOf = (members, administrators, must_do = "") => ({ members, administrators, must_do });

/** A signed release notice found by the daily check (WORLD GAP: the check verifies a notice against the release keys, whose private
 *  halves no test holds, so the stored notice is seeded exactly as `release_notices` holds it; the fetch itself is unreachable here). */
export function shipped(w, { version, date, security = false, notes = notesOf("M.", "A."), at = new Date(w.now()).toISOString() }) {
  w.sql.exec("INSERT INTO release_notices (version, date, manifest, security, notes, sig, found_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
             version, date, "m".repeat(64), security ? 1 : 0, JSON.stringify(notes), "seeded", at);
}

/** A release that begins to run (WORLD GAP: only a new deployment's start records one; `VERSION` is a platform binding, a double of the
 *  environment): the binding set and the first sighting recorded as the start records it, at the world's clock. */
export function deployed(w, version) {
  w.env.VERSION = version;
  w.sql.exec("INSERT INTO running_releases (version, first_seen_at) VALUES (?, ?)", version, new Date(w.now()).toISOString());
}

/** The team's hosting account held by `holders` (a membership act, the password asked again first). */
export async function holdsHosting(as, w, holders) {
  await as.act("reauth", { body: { password: w.password } });
  await as.act("hostingaccessset", { body: { holders } });
}

/** A day passes and the daily check runs (the scheduler's real tick; no network, so it records that the notice was unreachable); the
 *  sessions of the day before are over, so the member signs in again. */
export async function aDayLater(w, handle = "founder") {
  await w.tick(86400000);
  return w.signIn(handle);
}

/** A parts' double, as the platform's service binding answers `GET /version`. */
export const serving = (name, version, extra = {}) => ({ fetch: async () => new Response(JSON.stringify({ name, version, ...extra }), { status: 200, headers: { "content-type": "application/json" } }) });
export const gone = (why) => ({ fetch: async () => { throw new Error(why); } });

/** What the runtime measures (WORLD GAP: the door's and the capture work's timing is the Worker's own instrumentation, which a world
 *  does not run): `runtime_observations` rows as `recordRuntimeObservation` writes them. */
export function measured(w, rows) {
  for (const r of rows) w.sql.exec("INSERT INTO runtime_observations (metric, peak_ms, peak_at, peak_detail, last_ms, last_at, samples, total_ms, unit) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)",
    r.metric, r.peak, r.peak_at, r.last, r.last_at, r.samples, r.total, r.unit);
}

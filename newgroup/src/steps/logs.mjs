/* R30: no Logpush job may keep a record of each request of the copy's Workers. */
import { cf } from "./api.mjs";

/* R46 (T36; K1892 "no log", K1946 T8) — NO LOG OF WHO OPENED WHICH FILE.
 *
 * A Logpush job over `workers_trace_events` keeps a record of each request a Worker serves, and a request for a file
 * names the file and its caller: on the copy's Workers that would be a log of who opened which file, which K1892 rules
 * out. Before `verify` can succeed, the account's Logpush jobs are listed, and each job over that dataset whose filter
 * does not exclude every one of the copy's Workers (the plane and its members, by script name) is named as a failure;
 * no success is claimed while one is. A filter excludes them only when, read as Logpush's filter grammar, its `where`
 * (alone, or one condition of a top-level `and`) is a `ScriptName` condition that leaves every one of them out:
 * `!in` or `!eq` naming them all, or `in` or `eq` naming none of them. Anything else, a filter that does not parse
 * included, does not exclude them. A list the permission cannot read leaves the check UNDETERMINED, said so, never
 * passed (CFG.LOGPUSH_SCOPE: every Logpush API call needs "Logs Write", which R2 does not ask). */
export const PER_REQUEST_DATASET = "workers_trace_events";
export function filterExcludes(filter, names) {
  if (filter === null || filter === undefined || filter === "") return false;
  let f;
  try { f = typeof filter === "string" ? JSON.parse(filter) : filter; } catch { return false; }
  const w = f && typeof f === "object" ? f.where : null;
  if (!w || typeof w !== "object") return false;
  const conds = typeof w.key === "string" ? [w] : Array.isArray(w.and) ? w.and : [];
  return conds.some((c) => {
    if (!c || c.key !== "ScriptName") return false;
    const vals = (Array.isArray(c.value) ? c.value : [c.value]).map(String);
    const op = String(c.operator);
    if (op === "!in" || op === "!eq") return names.every((n) => vals.includes(n));
    if (op === "in" || op === "eq") return names.every((n) => !vals.includes(n));
    return false;
  });
}
async function logpushCheck(token, acct, names) {
  let jobs;
  try { jobs = await cf(token, `/accounts/${acct}/logpush/jobs`); }
  catch (e) { return { state: "undetermined", why: e.message }; }
  if (!Array.isArray(jobs)) return { state: "undetermined", why: "the list came back unreadable" };
  const named = jobs.filter((j) => j && j.dataset === PER_REQUEST_DATASET && !filterExcludes(j.filter, names));
  return named.length ? { state: "named", jobs: named } : { state: "clear" };
}
const logLag = (j, names) => `the Logpush job ${JSON.stringify(String(j.name || "(unnamed)"))} (id ${j.id ?? "unknown"}${j.enabled === false ? ", paused" : ""}) `
  + `keeps a record of each request to your team's Civicsmith (its dataset is ${PER_REQUEST_DATASET}, and its filter does not leave out `
  + `${names.join(", ")}), which would be a log of who opened which file: delete it, or give it a filter that leaves those Workers out`;
/* The step itself: listed, said, and its named jobs returned as lags for the verdict (R15's rule: no success over one). */
async function logsStep(emit, token, acct, names) {
  await emit.step("logs", "Checking that no log on your account records who opened which file");
  const r = await logpushCheck(token, acct, names);
  if (r.state === "clear") {
    emit.ok("logs", "No Logpush job on your Cloudflare account keeps a record of each request to your team's Civicsmith.");
    return { lags: [], state: r.state };
  }
  if (r.state === "undetermined") {
    emit.no("logs", "Undetermined: the installer could not read your account's Logpush jobs (Cloudflare said: " + r.why + "), so it cannot "
      + "say whether one keeps a record of each request to your team's Civicsmith, which would be a log of who opened which file. "
      + "To check it yourself: in the Cloudflare dashboard, open Analytics & Logs, then Logpush, and look for a job over "
      + "Workers Trace Events; none should cover " + names.join(", ") + ".");
    return { lags: [], state: r.state };
  }
  const lags = r.jobs.map((j) => logLag(j, names));
  emit.no("logs", (lags.length === 1 ? "A Logpush job on your Cloudflare account" : lags.length + " Logpush jobs on your Cloudflare account")
    + " would keep a log of who opened which file: " + lags.join("; ") + ".");
  return { lags, state: r.state };
}

export { logpushCheck, logLag, logsStep };

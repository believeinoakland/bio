/* R7, R8, R9: what the install asks the account before it creates anything: whether a script is there, the plan, the buckets
 * and the workers.dev address. */
import { cf } from "./api.mjs";
import { rand, uploadForm } from "./bytes.mjs";

async function scriptExists(token, acct, slug) {
  try { await cf(token, `/accounts/${acct}/workers/scripts/${slug}/settings`); return true; }
  catch (e) { if (e.status === 404) return false; throw e; }
}

/* DIST-3 / DEC-42: Workers Paid IS a requirement, and the plan is established
   by PROVOKING the platform, never by reading a plan field — a field is a
   claim, a refusal is a measurement (the 2026-07-31 BOB session measured the
   provocation and free-tier-fleet-probe.mjs reproduces it). A PUT carrying
   `limits.cpu_ms` is refused on Free with code 100328 and accepted on Paid.
   The probe script is a throwaway with a fixed recognisable name, deleted on
   the spot; a fixed name means a re-run converges on any leftover instead of
   accumulating strays. Three honest answers and no fourth: "free", "paid",
   or "unknown" with the reason — an unverified plan is not a verified one. */
const PLAN_PROBE = "bio-plan-probe";
async function establishPlan(token, acct) {
  const meta = { main_module: "index.mjs", compatibility_date: "2026-07-01",
                 limits: { cpu_ms: 50000 } };
  const src = 'export default { async fetch() { return new Response("bio plan probe"); } };';
  try {
    await cf(token, `/accounts/${acct}/workers/scripts/${PLAN_PROBE}`,
      { method: "PUT", body: uploadForm(meta, src) });
  } catch (e) {
    if (e.code === 100328) return { plan: "free" };
    return { plan: "unknown", detail: e.message };
  }
  let leftover = false;
  try { await cf(token, `/accounts/${acct}/workers/scripts/${PLAN_PROBE}?force=true`,
    { method: "DELETE" }); }
  catch { leftover = true; /* stated to the operator, not swallowed */ }
  return { plan: "paid", leftover };
}

/* Both buckets or neither: the fence is a pair. "Already exists" counts as
   created, so a re-run after a mid-flight failure converges instead of
   failing on its own earlier success. The names are the copy's own (R64, account.mjs `namesFor`). Returns the buckets
   that were already there (R69: what an earlier run left). */
async function ensureBuckets(token, acct, names) {
  const there = [];
  for (const name of [names.captures, names.published]) {
    try { await cf(token, `/accounts/${acct}/r2/buckets`, { method: "POST", body: JSON.stringify({ name }), idem: true }); }
    catch (e) { if (!/already exists/i.test(e.message)) throw e; there.push(name); }
  }
  return there;
}

async function ensureSubdomain(token, acct, slug) {
  let sub = null;
  try { sub = (await cf(token, `/accounts/${acct}/workers/subdomain`))?.subdomain || null; }
  catch (e) { if (e.status !== 404) throw e; }
  let registered = null;
  if (!sub) {
    /* A fresh account has no workers.dev prefix. The prefix is account-wide
       and permanent in practice (changing it later breaks every URL already
       issued), so derive it from the name the user chose and SAY SO on the
       page rather than choosing silently. */
    const candidates = [slug, `${slug}-${rand(3).toLowerCase().replace(/[^a-z0-9]/g, "x").slice(0, 4)}`];
    for (const c of candidates) {
      try {
        await cf(token, `/accounts/${acct}/workers/subdomain`,
          { method: "PUT", body: JSON.stringify({ subdomain: c }) });
        sub = c; registered = c; break;
      } catch (e) { if (!/taken|exists|unavailable/i.test(e.message)) throw e; }
    }
    if (!sub) throw new Error("no workers.dev prefix is set on this account and the names tried were taken");
  }
  await cf(token, `/accounts/${acct}/workers/scripts/${slug}/subdomain`,
    { method: "POST", body: JSON.stringify({ enabled: true }) });
  return { sub, registered };
}
export { scriptExists, PLAN_PROBE, establishPlan, ensureBuckets, ensureSubdomain };

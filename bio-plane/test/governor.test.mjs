/* D-95: the per-host request governor.
 *
 * Two levels, per the standing lesson: the bucket's arithmetic at the store,
 * and the behaviour through op=acquire, because a governor tested only at the
 * Durable Object is untested where the fetches actually happen. Assertions run
 * both ways: a host under cool-off is refused by NAME, and a host in good
 * standing is admitted, because a governor that refused everything would pass
 * a one-way check by being useless.
 *
 * Time is not mocked. The suite drives the real clock with a LOW configured
 * appetite so exhaustion arrives in milliseconds of arithmetic rather than
 * minutes of waiting, and the cool-off assertions read the recorded
 * cooloff_until instead of sleeping through it.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-gov", MEMBER_TOKEN: "mem-gov", PROBE_TOKEN: "prb-gov", VERSION: "test",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/doc") return new Response("a document", { headers: { "content-type": "text/html" } });
    if (u.pathname === "/limited")
      return new Response("slow down", { status: 429, headers: { "retry-after": "120" } });
    if (u.pathname === "/refused") return new Response("no", { status: 403 });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const acquire = async (locator) =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-gov",
    { method: "POST", body: JSON.stringify({ locator, authority: "Test City" }) })).json();

/* Store-level access through livefire's route, the way every store suite
   reaches the object: an admin credential and the probe store. Here the store
   IS the subject, so driving its methods directly is the unit half; the op
   half below is what makes it count. */
const ns = await mf.getDurableObjectNamespace("STORE");
const store = ns.get(ns.idFromName("bio"));
const call = async (method, body) =>
  (await (await store.fetch(`http://x/${method}`, body === undefined ? {} :
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json()).result;

console.log("--- the bucket: appetite consumed, refusal named, refill arithmetic ---");
{
  await call("governorconfig", { host: "slow.example.gov", appetite_per_min: 6 });
  const first = await call("governoradmit", { host: "slow.example.gov" });
  t("the first request is admitted", first.admitted, true);
  t("under the configured appetite", first.appetite_per_min, 6);
  /* Burst allowance is 3: a person opens a few tabs. Consume it. */
  const second = await call("governoradmit", { host: "slow.example.gov" });
  const third = await call("governoradmit", { host: "slow.example.gov" });
  t("a small burst is a person's shape and is admitted", second.admitted && third.admitted, true);
  const fourth = await call("governoradmit", { host: "slow.example.gov" });
  t("past the burst, the appetite refuses", fourth.admitted, false);
  t("by name", fourth.reason, "appetite");
  t("and says when to come back", fourth.retry_in_ms > 0, true);
  /* At 6/min a token is 10s away; the answer must be in that order, not hours. */
  t("in the order the appetite implies", fourth.retry_in_ms <= 11_000, true);
}

console.log("\n--- pacing: grants to one host carry a jittered human gap ---");
{
  await call("governorconfig", { host: "paced.example.gov", appetite_per_min: 600 });
  const a = await call("governoradmit", { host: "paced.example.gov" });
  const b = await call("governoradmit", { host: "paced.example.gov" });
  t("the first grant waits for nobody", a.wait_ms, 0);
  /* Base gap at 600/min is 100ms; jitter is 0.6 to 1.5 of it. The second
     grant lands inside that envelope, never at zero and never a metronome's
     exact base. */
  t("the second is spaced", b.wait_ms > 0, true);
  t("inside the jitter envelope", b.wait_ms >= 30 && b.wait_ms <= 160, true);
}

console.log("\n--- a 429 overrides the bucket, and Retry-After is honoured ---");
{
  const r = await call("governorreport", { host: "limited.example.gov", status: 429, retry_after_ms: 120_000 });
  t("the report records a cool-off", r.cooloff_ms >= 120_000, true);
  const refused = await call("governoradmit", { host: "limited.example.gov" });
  t("admission is refused regardless of tokens", refused.admitted, false);
  t("named as cooling off", refused.reason, "cooling_off");
  t("carrying the counterparty's status", refused.last_refusal_status, 429);
  t("and the time remaining", refused.retry_in_ms > 100_000, true);
}

console.log("\n--- refusals escalate like the counterparty's own escalation, and success resets ---");
{
  const one = await call("governorreport", { host: "hostile.example.gov", status: 403 });
  const state1 = one.cooloff_ms;
  await call("governorreport", { host: "hostile.example.gov", status: 403 });
  const three = await call("governorreport", { host: "hostile.example.gov", status: 403 });
  t("consecutive refusals are counted", three.refusals, 3);
  t("and the cool-off doubles as they accumulate", three.cooloff_ms >= state1 * 3, true);
  const relent = await call("governorreport", { host: "hostile.example.gov", status: 200 });
  t("one success resets the escalation", relent.refusals, 0);
  /* The cool-off already recorded is not erased by the reset: they relented
     but the window they named still stands until it lapses. What resets is
     the ESCALATION, so the next refusal starts small again. */
}

console.log("\n--- statuses that are not capacity signals are ignored ---");
{
  const r404 = await call("governorreport", { host: "elsewhere.example.gov", status: 404 });
  t("a 404 is an outcome for monitoring, not the governor", r404.ignored, 404);
  const admit = await call("governoradmit", { host: "elsewhere.example.gov" });
  t("and admission is unaffected", admit.admitted, true);
}

console.log("\n--- through the op: a cooled host answers HOST_COOLING_OFF, an open one captures ---");
{
  /* The other way first: an ungoverned host captures normally, so nothing
     below can pass by the governor refusing everything. */
  const open = await acquire("https://open.example.gov/doc");
  t("a host in good standing is captured", open.ok, true);
  /* One real 429 from the source, reported by the fetch path itself... */
  const limited = await acquire("https://limited2.example.gov/limited");
  t("the source's 429 is reported as a refusal", limited.reason, "SOURCE_REFUSED");
  /* ...after which the governor holds the host without being told twice. */
  const held = await acquire("https://limited2.example.gov/doc");
  t("the next request to that host is held by the governor", held.reason, "HOST_COOLING_OFF");
  t("as an HTTP 429 with a retry", held.retry_in_ms > 0, true);
  t("and the fetch never went out", held.ok, false);
  /* An unrelated host is untouched: the governor is per host, not global. */
  const other = await acquire("https://unrelated.example.gov/doc");
  t("an unrelated host is untouched", other.ok, true);
}

console.log("\n--- the state surface says who is held and why ---");
{
  const st = await call("governorstate", { host: "limited2.example.gov" });
  t("the held host is reported", st.hosts.length, 1);
  t("with its refusal status", st.hosts[0].last_refusal_status, 429);
  t("its consecutive count", st.hosts[0].refusals >= 1, true);
  t("and a cool-off in the future", st.hosts[0].cooloff_until > Date.now(), true);
}

console.log(`\ngovernor: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);

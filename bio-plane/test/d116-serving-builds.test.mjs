/* D-116 — WHICH BUILD EACH PART OF AN INSTANCE ACTUALLY SERVES, READ WHERE IT RUNS (`BIO_Distribution_v0_1.md` §8,
 * with `CLAUDE.md` §5: a deploy verified is not a build serving).
 *
 * BEFORE THIS ROW nothing read back what build the plane's Durable Object, or any fleet member, served.
 * `op=bootstrap`'s `version` is the ROUTING ISOLATE's env.VERSION; the DO's answer, spread after it, carried no build;
 * and each member was uploaded with a version and never asked what it answers. An instance could run a stale DO or a
 * stale member with nothing reporting it.
 *
 * THE FIXTURE MAKES THE SKEW REAL, NOT SIMULATED IN A STRING. Miniflare runs the plane's routing worker with
 * VERSION = "isolate-B" and hosts its `Store` Durable Object in a SECOND worker running the same source with
 * VERSION = "store-A" — exactly the production shape of a rollout in which the DO still runs the previous version
 * (D-108; FLEET #3's finding that `op=bootstrap` is not a reading of the DO's build). The members are the REAL
 * committed bundles of `agent-worker` and `pdf-worker`, each with its own VERSION, reached through the plane's
 * service bindings; `ocr-worker` is left UNBOUND in one arm and bound to a worker answering under another name in
 * the next.
 *
 * HOW A LIAR WOULD PASS, AND WHY THIS CANNOT BE PASSED THAT WAY. (1) Fill `storeVersion` from the routing isolate's
 * env: in this fixture that yields "isolate-B", and the first assertion wants "store-A", which ONLY the DO's own env
 * holds. (2) Let a caller hand the value in (`storeVersion=` on the query, or a header): the "caller cannot supply
 * it" arm sends both and wants the DO's value back unchanged. (3) Fill a member's version from the plane's env: the
 * members run "agent-C" and "pdf-D", values the plane never holds. (4) Report a member as SERVING without asking it:
 * the UNBOUND and MISNAMED arms each want the state only the binding's real behaviour produces. Every value the
 * assertions want is DISTINCT from every other, so no two can agree for free.
 *
 * NEGATIVE CONTROL: DECLARED BEFORE ARMING, RUN 2026-09-23 against the final files (results recorded below, each arm
 *   ALONE, `bio-plane/src/index.mjs` / `store.mjs` restored byte-identically after each, verified by sha256 + cmp):
 *   (N1) THE ROW'S OWN CONTROL — the op=bootstrap handler copies env.VERSION into the DO field (`...out.result,
 *        storeVersion: env.VERSION`): MUST FAIL "the DO names ITS OWN build, not the routing isolate's"; MUST NOT fail
 *        the member arms.
 *   (N2) the DO route drops `storeVersion` (today's main): MUST FAIL the same assertion (got undefined).
 *   (N3) `memberVersions` fills `version` from the PLANE's env.VERSION instead of the member's reply: MUST FAIL the
 *        agent-worker and pdf-worker SERVING arms.
 *   (OS) OVER-STRICTNESS: all three parts on ONE build must read as that build everywhere — asserted in block 3, green
 *        in every arm above.
 *   RESULTS (2026-09-23; whole suite 16/16 before and after every arm):
 *   (N1) 13 passed, 3 FAILED, AS DECLARED: "the DO names ITS OWN build, not the routing isolate's" (want "store-A" got
 *        "isolate-B"), "so the two builds DIFFER on the wire", and "a caller cannot supply the DO's build" (the handler's
 *        copy wins over the DO's). Every member arm stayed green.
 *   (N2) 13 passed, 3 FAILED: the same DO assertion (got undefined), the caller arm (got null), AND the over-strictness
 *        block — declared green and it is NOT, correctly: with the field removed there is no DO reading for block 3 to
 *        agree with. Recorded rather than smoothed; the OS arm is green in N1 and N3, where the field exists.
 *   (N3) 13 passed, 3 FAILED, AS DECLARED: agent-worker and pdf-worker SERVING (got "isolate-B"), and "no member reads
 *        the plane's own build". Block 3 stayed green (one build everywhere cannot see this lie — which is why block 2
 *        runs the members on builds the plane never holds).
 *   Restores: index.mjs sha256 e9016c15…, store.mjs 123725c6…, each verified by sha256 AND byte compare after its arm.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PLANE = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const AGENT = fileURLToPath(new URL("../../agent-worker/dist/agent-worker.bundled.mjs", import.meta.url));
const PDF = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `  want ${JSON.stringify(w)} got ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++; };

const COMMON = { modules: true, modulesRoot: "/", compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"] };
const planeSrc = readFileSync(PLANE, "utf8");
/* The routing worker. Its STORE lives in `storeHost` when one is named: a different worker, a different VERSION. */
const planeWorker = ({ version, storeHost = null, services = {} }) => ({
  ...COMMON, name: "plane", scriptPath: PLANE, script: planeSrc,
  durableObjects: { STORE: storeHost ? { className: "Store", scriptName: storeHost, useSQLite: true }
                                     : { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: version, ADMIN_TOKEN: "adm-d116-test", PROBE_TOKEN: "prb-d116-test" },
  serviceBindings: services,
});
const storeWorker = (version) => ({
  ...COMMON, name: "store-host", scriptPath: PLANE, script: planeSrc,
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: version },
});
const member = (name, path, version) => ({
  ...COMMON, name, scriptPath: path, script: readFileSync(path, "utf8"),
  r2Buckets: ["CAPTURES"], bindings: { VERSION: version },
});
/* A worker that answers /version under ANOTHER name: what a binding pointed at the wrong script looks like. */
const impostor = {
  ...COMMON, name: "impostor",
  script: `export default { fetch() { return Response.json({ ok: true, name: "not-ocr-worker", version: "imp-E" }); } };`,
};

/* A worker that is bound and answers, but with no version at all: what a member that is not serving looks like. */
const broken = { ...COMMON, name: "broken",
  script: `export default { fetch() { return new Response("error code: 1101", { status: 500 }); } };` };

const get = async (mf, qs, init) => (await mf.dispatchFetch("http://x/api/?" + qs, init)).json();

/* ARMED: the fixture's builds are pairwise distinct, so no assertion below can be satisfied by two values agreeing. */
const BUILDS = ["isolate-B", "store-A", "agent-C", "pdf-D", "imp-E"];
t("ARMED: every build in the fixture is distinct from every other", new Set(BUILDS).size, BUILDS.length);

console.log("\n--- 1 · a Durable Object running ANOTHER build than the routing isolate is named by its own build ---");
{
  const mf = new Miniflare({ workers: [
    planeWorker({ version: "isolate-B", storeHost: "store-host",
                  services: { AGENT_WORKER: "agent-worker", PDF_WORKER: "pdf-worker" } }),
    storeWorker("store-A"),
    member("agent-worker", AGENT, "agent-C"),
    member("pdf-worker", PDF, "pdf-D"),
  ] });
  const b = await get(mf, "op=bootstrap");
  t("the op answers", [b.ok, b.service], [true, "bio-plane"]);
  t("`version` is still the ROUTING ISOLATE's build (unchanged meaning, IC)", b.version, "isolate-B");
  t("the DO names ITS OWN build, not the routing isolate's", b.storeVersion, "store-A");
  t("so the two builds DIFFER on the wire, and a reader can name the one that lags", b.version !== b.storeVersion, true);
  t("the anonymous answer does not fan out to the members unless asked", "memberVersions" in b, false);

  /* A caller cannot hand the DO a value to echo — the query and a header both carry one, and neither is read. */
  const lie = await get(mf, "op=bootstrap&storeVersion=isolate-B&version=isolate-B",
    { headers: { "x-store-version": "isolate-B" } });
  t("a caller cannot supply the DO's build: storeVersion on the query and in a header are ignored",
    [lie.storeVersion, lie.version], ["store-A", "isolate-B"]);

  console.log("\n--- 2 · each member's build, read back THROUGH the plane's binding, from the member's own reply ---");
  const m = (await get(mf, "op=bootstrap&members=1")).memberVersions || {};
  t("the three members are all stated, none missing", Object.keys(m).sort(), ["agent-worker", "ocr-worker", "pdf-worker"]);
  t("agent-worker: SERVING its own build through AGENT_WORKER",
    m["agent-worker"], { binding: "AGENT_WORKER", state: "SERVING", version: "agent-C" });
  t("pdf-worker: SERVING its own build through PDF_WORKER",
    m["pdf-worker"], { binding: "PDF_WORKER", state: "SERVING", version: "pdf-D" });
  t("ocr-worker: this plane holds no binding, and says so rather than dropping the key",
    m["ocr-worker"], { binding: "OCR_WORKER", state: "UNBOUND" });
  t("no member reads the plane's own build — every SERVING value came from the member",
    Object.values(m).some((x) => x.version === "isolate-B" || x.version === "store-A"), false);
  await mf.dispose();
}

console.log("\n--- 2b · a binding pointed at the wrong worker is MISNAMED; one that cannot answer is SILENT ---");
{
  const mf = new Miniflare({ workers: [
    planeWorker({ version: "isolate-B", services: { OCR_WORKER: "impostor", PDF_WORKER: "broken" } }),
    impostor, broken,
  ] });
  const m = (await get(mf, "op=bootstrap&members=1")).memberVersions || {};
  t("ocr-worker: something answered through OCR_WORKER under another name — MISNAMED, with what it said",
    m["ocr-worker"], { binding: "OCR_WORKER", state: "MISNAMED", name: "not-ocr-worker", version: "imp-E" });
  t("pdf-worker: bound to a worker that answers with no version — SILENT, with what it did, never SERVING",
    m["pdf-worker"], { binding: "PDF_WORKER", state: "SILENT", why: "answered HTTP 500 without a version" });
  t("agent-worker: UNBOUND", m["agent-worker"], { binding: "AGENT_WORKER", state: "UNBOUND" });
  await mf.dispose();
}

console.log("\n--- 3 · OVER-STRICTNESS: one build everywhere reads as that build everywhere ---");
{
  const mf = new Miniflare({ workers: [
    planeWorker({ version: "9.9.9", services: { AGENT_WORKER: "agent-worker" } }),
    member("agent-worker", AGENT, "9.9.9"),
  ] });
  const b = await get(mf, "op=bootstrap&members=1");
  t("isolate, DO and member all answer 9.9.9 when all three run it",
    [b.version, b.storeVersion, b.memberVersions?.["agent-worker"]?.version], ["9.9.9", "9.9.9", "9.9.9"]);
  await mf.dispose();
}

console.log(`\nd116-serving-builds: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

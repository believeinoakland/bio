/* Acquisition: the fetch layer, and the honesty of what it claims.
 *
 * The intake doctrine's Section 3 makes grade a claim about the CAPTURE CHAIN,
 * not about the source and not about the information: "a claim about evidence is
 * only as strong as its weakest named layer". Grade A requires a WACZ or
 * equivalent capture of the source as served; a Worker cannot produce one. So the
 * load-bearing assertion in this suite is that acquire says B, because a surface
 * that overclaimed its grade would corrupt every downstream judgement that rests
 * on it, silently and permanently.
 *
 * The other load-bearing assertion is the locator fence. This op makes the plane
 * fetch a URL a member typed, which is the one place an instance can be turned
 * into a probe of things it should not reach. The fence is the catalog's own
 * isPublicHttpsLocator, the same function that guards the gathering queue, so
 * there is one definition of a reachable address rather than two.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A scripted source. outboundService intercepts what the Worker fetches, so the
   suite exercises the real fetch path without touching the network. */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-acq", MEMBER_TOKEN: "mem-acq", PROBE_TOKEN: "prb-acq", VERSION: "test" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/report.pdf")
      return new Response(DOC, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/empty") return new Response(new Uint8Array(0));
    if (u.pathname === "/huge") return new Response(new Uint8Array(21 * 1024 * 1024));
    if (u.pathname === "/gone") return new Response("nope", { status: 404 });
    return new Response("unscripted", { status: 500 });
  },
});

const DOC = new Uint8Array(4096).map((_, i) => (i * 11) % 256);
const DOC_SHA = createHash("sha256").update(DOC).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const acquire = async (body, token = "mem-acq") =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=" + token,
    { method: "POST", body: JSON.stringify(body) })).json();

const GOOD = { locator: "https://www.oaklandca.gov/report.pdf", authority: "City Auditor" };

console.log("\n--- a public https locator is fetched, hashed, and stored ---");
const a = await acquire(GOOD);
t("acquisition succeeds", a.ok, true);
t("the bytes hash to what the source served", a.document.capture.sha256, DOC_SHA);
t("the size is recorded", a.document.capture.bytes, DOC.length);
t("the locator is carried verbatim", a.document.locator, GOOD.locator);
t("the authority is carried", a.document.authority, "City Auditor");
t("the instant is ISO 8601 UTC", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(a.document.retrieved), true);
t("the content type the source declared is kept", a.document.capture.content_type, "application/pdf");

console.log("\n--- the grade is honest ---");
t("acquire claims Grade B, never A", a.document.capture.grade, "B");
t("and says in words why A is not available", /chain-of-custody/.test(a.note), true);
t("the method names the surface that did it", /bio-plane acquire/.test(a.document.capture.method), true);

console.log("\n--- the bytes are really in the store, content-addressed ---");
const back = await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-acq&sha256=${DOC_SHA}`);
t("the capture reads back", back.status, 200);
t("byte-identical", createHash("sha256").update(Buffer.from(await back.arrayBuffer())).digest("hex"), DOC_SHA);
const again = await acquire(GOOD);
t("acquiring the same document again is idempotent", again.existed, true);

console.log("\n--- the locator fence ---");
for (const [locator, why] of [
  ["http://www.oaklandca.gov/report.pdf", "not https"],
  ["https://localhost/report.pdf", "localhost"],
  ["https://203.0.113.10/report.pdf", "bare IP"],
  ["https://user:pw@www.oaklandca.gov/report.pdf", "credentials in the address"],
  ["https://intranet/report.pdf", "no public dot"],
  ["file:///etc/passwd", "not a URL this fence admits"],
  ["", "empty"],
]) t(`refused: ${why}`, (await acquire({ ...GOOD, locator })).reason, "BAD_LOCATOR");

console.log("\n--- the source axis is named, or nothing is recorded ---");
t("no authority is refused", (await acquire({ locator: GOOD.locator })).reason, "NO_AUTHORITY");
t("blank authority is refused", (await acquire({ ...GOOD, authority: "   " })).reason, "NO_AUTHORITY");

console.log("\n--- what the source does wrong is reported, not swallowed ---");
t("a 404 is named with its status",
  (await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/gone" })).reason, "SOURCE_REFUSED");
t("an empty body is not a capture",
  (await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/empty" })).reason, "EMPTY");
const huge = await acquire({ ...GOOD, locator: "https://www.oaklandca.gov/huge" });
t("an oversize document is refused rather than half-captured", huge.reason, "TOO_LARGE");
t("and the refusal explains the parts path", /registered parts/.test(huge.detail), true);

console.log("\n--- the record it hands back is the shape C-18.1 wants ---");
for (const k of ["file", "locator", "authority", "retrieved", "capture", "origin", "attestation_attempts"])
  t(`document carries ${k}`, k in a.document, true);
for (const k of ["method", "grade", "actor_class", "sha256", "encoding"])
  t(`capture carries ${k}`, k in a.document.capture, true);
t("origin is a named request by default", a.document.origin.kind, "named_request");
t("attestation attempts start empty and honest, not absent", a.document.attestation_attempts, []);
t("a sweep origin records what deemed it",
  (await acquire({ ...GOOD, matchedSweep: "sweep-2026-07" })).document.origin.matched_sweep, "sweep-2026-07");

console.log("\n--- it writes no bundle state ---");
t("the store is still empty: intake never writes live state",
  (await (await mf.dispatchFetch("http://x/api/?op=stats&token=mem-acq")).json()).result.bundles, 0);

console.log("\n--- and it is not a public surface ---");
t("unauthenticated is refused",
  (await (await mf.dispatchFetch("http://x/api/?op=acquire", { method: "POST", body: "{}" })).json()).error,
  "unauthenticated");
t("a GET is refused", (await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-acq")).json()).error,
  "acquire is a POST");

await mf.dispose();
console.log(`\nacquire: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

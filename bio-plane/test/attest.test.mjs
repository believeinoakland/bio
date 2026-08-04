/* NEGATIVE CONTROL: (run 2026-07-31) flip the certReq flag in tsa.mjs timestampRequest (derBoolean(true) -> false) so the DER diverges from what openssl builds -> 2 assertions fail (byte-identical-to-openssl and its downstream); restored, 48 pass. (Needs openssl on PATH — present.) */
/* Co-attestation: the part of provenance a group cannot fabricate for itself.
 *
 * Negative-control detail: flip the certReq flag in tsa.mjs timestampRequest (derBoolean(true) -> false) so the DER diverges from what openssl builds -> 2 assertions fail (byte-identical-to-openssl and its downstream); restored, 48 pass. (Needs openssl on PATH — present.)
 *
 * The strongest assertion here is the first one: the TimeStampReq this plane
 * builds is byte-identical to the one OpenSSL builds for the same digest and
 * nonce. Reimplemented ASN.1 is worth exactly what its conformance test is
 * worth, and openssl is the reference implementation the doctrine's own
 * verification path uses, so agreement with it is the whole guarantee.
 *
 * The second is that failures are recorded rather than dropped. A register
 * showing an attempt that failed and one showing no attempt are different
 * claims about what the group tried, and collapsing them lets an absence read
 * as a success.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS } from "../src/tsa.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const DOC = new Uint8Array(2048).map((_, i) => (i * 13) % 256);
const DOC_SHA = createHash("sha256").update(DOC).digest("hex");
const dir = mkdtempSync(join(tmpdir(), "attest-"));

console.log("\n--- the request is what OpenSSL would build ---");
{
  const nonce = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const { der } = timestampRequest(DOC_SHA, nonce);
  const mine = join(dir, "mine.tsq");
  writeFileSync(mine, der);

  const text = execFileSync("openssl", ["ts", "-query", "-in", mine, "-text"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  t("openssl parses it", /Version: 1/.test(text), true);
  t("as sha256", /Hash Algorithm: sha256/.test(text), true);
  t("over our digest", text.replace(/[^0-9a-f]/g, "").includes(DOC_SHA.slice(0, 32)), true);
  t("with the nonce we chose", /Nonce: 0x0102030405060708/.test(text), true);
  t("and a certificate requested, without which nobody can verify it later",
    /Certificate required: yes/.test(text), true);

  /* The real test: openssl's own request for the same inputs, byte for byte. */
  const doc = join(dir, "doc.bin");
  writeFileSync(doc, DOC);
  const ref = join(dir, "ref.tsq");
  execFileSync("openssl", ["ts", "-query", "-data", doc, "-sha256", "-cert", "-out", ref],
    { stdio: ["ignore", "ignore", "ignore"] });
  const refBytes = readFileSync(ref);
  /* openssl picks its own random nonce, so rebuild ours with the nonce it used. */
  const refText = execFileSync("openssl", ["ts", "-query", "-in", ref, "-text"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const refNonceHex = /Nonce: 0x([0-9A-F]+)/.exec(refText)[1].toLowerCase();
  const padded = refNonceHex.length % 2 ? "0" + refNonceHex : refNonceHex;
  const refNonce = Uint8Array.from(padded.match(/../g).map((h) => parseInt(h, 16)));
  const matched = timestampRequest(DOC_SHA, refNonce).der;
  t("byte-identical to openssl's own request", Buffer.compare(Buffer.from(matched), refBytes), 0);
}

console.log("\n--- reading a response ---");
{
  const mkResp = (status, tokenBody) => {
    const der = (tag, body) => {
      const len = body.length < 0x80 ? [body.length] : [0x81, body.length];
      return Uint8Array.from([tag, ...len, ...body]);
    };
    const statusInfo = der(0x30, der(0x02, [status]));
    const token = tokenBody ? der(0x30, tokenBody) : new Uint8Array(0);
    return der(0x30, [...statusInfo, ...token]);
  };
  const want = Uint8Array.from(DOC_SHA.match(/../g).map((h) => parseInt(h, 16)));
  const granted = mkResp(0, [...want, 0xaa, 0xbb]);
  const okp = parseTimestampResponse(granted, DOC_SHA);
  t("a granted response yields a token", okp.ok, true);
  t("granted-with-modifications is also accepted",
    parseTimestampResponse(mkResp(1, [...want]), DOC_SHA).ok, true);
  t("a rejection is named, not treated as a token",
    parseTimestampResponse(mkResp(2, null), DOC_SHA).reason, "REJECTED");
  t("a granted response with no token is named",
    parseTimestampResponse(mkResp(0, null), DOC_SHA).reason, "NO_TOKEN");
  t("a token that does not contain our digest is refused as unbound",
    parseTimestampResponse(mkResp(0, [1, 2, 3, 4]), DOC_SHA).reason, "NOT_BOUND");
  t("garbage is malformed, not a crash",
    parseTimestampResponse(Uint8Array.from([0xff, 0xff]), DOC_SHA).reason, "MALFORMED");
}

console.log("\n--- the endpoints cannot be chosen by a caller ---");
t("they are a compiled constant", Array.isArray(TSA_ENDPOINTS) && TSA_ENDPOINTS.length >= 2, true);
{
  const src = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
  const at = src.indexOf('if (op === "attest")');
  const block = src.slice(at, src.indexOf('if (op === "attest")') + 3000);
  t("the attest path never reads an endpoint from the request body",
    /body\??\.(service|endpoint|tsa|url)/.test(block), false);
}

/* A scripted authority, so the whole op runs without touching the network. */
const mk = (behaviour) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-att", MEMBER_TOKEN: "mem-att", PROBE_TOKEN: "prb-att", VERSION: "test" },
  outboundService: behaviour,
});

const derWrap = (tag, body) => {
  const len = body.length < 0x80 ? [body.length] : [0x81, body.length];
  return Uint8Array.from([tag, ...len, ...body]);
};
const wantBytes = Uint8Array.from(DOC_SHA.match(/../g).map((h) => parseInt(h, 16)));
const grantedResp = derWrap(0x30, [
  ...derWrap(0x30, derWrap(0x02, [0])),
  ...derWrap(0x30, [...wantBytes, 0x99]),
]);

console.log("\n--- the op, end to end against a scripted authority ---");
{
  const seen = [];
  const mf = mk(async (request) => {
    seen.push(new URL(request.url).host);
    return new Response(grantedResp, { headers: { "content-type": "application/timestamp-reply" } });
  });
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  const r = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA }) })).json();
  t("attestation succeeds", r.ok, true);
  t("it asked the first authority", seen[0], new URL(TSA_ENDPOINTS[0]).host);
  t("and stopped once one answered", seen.length, 1);
  t("the attempt is recorded as an attempt", r.attempts[0].attempted !== undefined, true);
  t("the attempt records which service", r.attempts[0].service, TSA_ENDPOINTS[0]);
  t("the attempt records success", r.attempts[0].ok, true);
  t("the attempt shape is what C-18.1 wants",
    ["service", "attempted", "ok"].every((k) => k in r.attempts[0]), true);
  t("the attestation says what it is over", r.attestation.over, DOC_SHA);
  t("and does not claim to have verified the signature",
    /does not claim to have verified/.test(r.note), true);

  const tok = await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${r.attestation.sha256}`);
  t("the token is stored, content-addressed, and readable back", tok.status, 200);
  t("byte-identical",
    createHash("sha256").update(Buffer.from(await tok.arrayBuffer())).digest("hex"), r.attestation.sha256);
  await mf.dispose();
}

console.log("\n--- failures are recorded, never dropped ---");
{
  const mf = mk(async () => new Response("no", { status: 503 }));
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  const r = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA }) })).json();
  t("the op fails honestly", r.ok, false);
  t("every authority was tried", r.attempts.length, TSA_ENDPOINTS.length);
  t("each attempt says it failed", r.attempts.every((a) => a.ok === false), true);
  t("each records why", r.attempts.every((a) => /http 503/.test(a.note || "")), true);
  t("and the response says why an absence must not read as a success",
    /different claims/.test(r.note), true);
  await mf.dispose();
}

console.log("\n--- it falls through to the next authority ---");
{
  let n = 0;
  const mf = mk(async () => (++n === 1
    ? new Response("down", { status: 500 })
    : new Response(grantedResp, { headers: { "content-type": "application/timestamp-reply" } })));
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  const r = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA }) })).json();
  t("one authority being down does not lose the attestation", r.ok, true);
  t("and the failed first attempt is still in the record", r.attempts[0].ok, false);
  t("with the one that worked beside it", r.attempts[1].ok, true);
  await mf.dispose();
}

console.log("\n--- what it refuses ---");
{
  const mf = mk(async () => new Response(grantedResp));
  t("a hash that is not in the store is refused",
    (await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
      { method: "POST", body: JSON.stringify({ sha256: "a".repeat(64) }) })).json()).reason, "NO_SUCH_CAPTURE");
  t("a malformed hash is refused",
    (await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
      { method: "POST", body: JSON.stringify({ sha256: "nope" }) })).json()).reason, "BAD_SHA");
  t("unauthenticated is refused",
    (await (await mf.dispatchFetch("http://x/api/?op=attest", { method: "POST", body: "{}" })).json()).error,
    "unauthenticated");
  t("a GET is refused",
    (await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att")).json()).error, "attest is a POST");
  await mf.dispose();
}


console.log("\n--- the public archive is opt-in, and off by default ---");
{
  const seen = [];
  const mf = mk(async (request) => {
    const u = new URL(request.url);
    seen.push(u.host + u.pathname.slice(0, 24));
    if (u.host === "web.archive.org")
      return new Response("saved", { status: 200,
        headers: { "content-location": "/web/20260724120000/https://www.oaklandca.gov/report.pdf" } });
    return new Response(grantedResp, { headers: { "content-type": "application/timestamp-reply" } });
  });
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });

  const plain = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA, locator: "https://www.oaklandca.gov/report.pdf" }) })).json();
  t("without asking, no archive is contacted", seen.some((h) => h.startsWith("web.archive.org")), false);
  t("and no archive attempt is claimed", plain.attempts.some((a) => /archive/.test(a.service)), false);

  seen.length = 0;
  const asked = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA, locator: "https://www.oaklandca.gov/report.pdf", archive: true }) })).json();
  t("asking contacts the archive", seen.some((h) => h.startsWith("web.archive.org")), true);
  const arch = asked.attempts.find((a) => /archive/.test(a.service));
  t("the archive attempt is recorded", arch.ok, true);
  t("with the archived locator, which is the evidence", arch.archived_locator,
    "https://web.archive.org/web/20260724120000/https://www.oaklandca.gov/report.pdf");
  t("and it sits beside the timestamp rather than replacing it",
    asked.attempts.filter((a) => a.ok).length, 2);
  await mf.dispose();
}

console.log("\n--- an archive that fails is recorded, not hidden ---");
{
  const mf = mk(async (request) => {
    const u = new URL(request.url);
    if (u.host === "web.archive.org") return new Response("busy", { status: 429 });
    return new Response(grantedResp, { headers: { "content-type": "application/timestamp-reply" } });
  });
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  const r = await (await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att",
    { method: "POST", body: JSON.stringify({ sha256: DOC_SHA, locator: "https://www.oaklandca.gov/report.pdf", archive: true }) })).json();
  t("the timestamp still succeeds", r.ok, true);
  const arch = r.attempts.find((a) => /archive/.test(a.service));
  t("the archive failure is in the record", arch.ok, false);
  t("with its reason", /429/.test(arch.note), true);
  t("and no archive is claimed", r.archive, undefined);
  await mf.dispose();
}

console.log("\n--- the archive host cannot be redirected by a caller ---");
{
  const seen = [];
  const mf = mk(async (request) => {
    seen.push(new URL(request.url).host);
    return new Response(grantedResp, { headers: { "content-type": "application/timestamp-reply" } });
  });
  await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-att&sha256=${DOC_SHA}`, { method: "PUT", body: DOC });
  await mf.dispatchFetch("http://x/api/?op=attest&token=mem-att", { method: "POST", body: JSON.stringify({
    sha256: DOC_SHA, archive: true, locator: "https://evil.example.com/x",
    archiveBase: "https://attacker.example/", service: "https://attacker.example/" }) });
  t("only the compiled archive host is ever contacted",
    seen.filter((h) => h !== "web.archive.org" && !TSA_ENDPOINTS.some((e) => new URL(e).host === h)), []);
  await mf.dispose();
}

console.log(`\nattest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

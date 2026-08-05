/* NEGATIVE CONTROL: RUN 2026-08-05 (rec53-agent), ELEVEN ARMS, each broken ALONE against the FINAL files and every file restored BYTE-IDENTICALLY with sha256 compared before and after ALL of them — index.mjs 8b8515b42b882f9f…, plane-envelope.test.mjs 163292ca7cdbe63e…, ratify-envelope.test.mjs 7d9180199be94898…, do-fail-worker.mjs 77be03389e432c26…. Whole = ratify-envelope 35/35 and plane-envelope 53/53; both counts are given for every arm because the source sweep and the live drive are independent instruments and several arms are seen by only one. (a) THE ITEM'S FIRST NAMED SITE — `do/list`'s `.result || []` restored -> ratify-envelope 31/4 and plane-envelope 47/6: the drive reports the lie IN THE DEFECT'S OWN WORDS (`got 409 "GATE_REFUSED"`, and the arm asserting the catalog's "does not resolve in the store" appears NOWHERE fires), while the source side fires on the corrected pin CLOSED (i), on detector C (the path rejoins the unconverted set) and on detector D naming "4027:list". (b) THE ITEM'S SECOND NAMED SITE — `do/reusedparts`' silent omission restored -> 33/2 and 48/5, the drive reporting `got undefined` for the `reuse` key that should have been present and the corrected pin CLOSED (ii) firing. (c) `do/image` restored -> 34/1 and 50/3, "a store silence is not a publisher being told their document is missing its required files". (d) `do/gatefacts` restored -> 34/1 and 50/3, and this is the defect quoting itself: `got 500 "TypeError: Cannot read properties of undefined (reading 'ok'"` — a raw V8 stack trace answered to a publisher, which is why this suite's `RAT` helper parses defensively (a helper that did `await r.json()` would DIE here and hide every arm after it, D-93). (e) `do/publish`'s guard line removed -> 34/1 and 51/2, the drive reporting `got "PUBLISH_FAILED"`. **THIS ARM EXPOSED A REAL GAP AND IS REPORTED RATHER THAN SMOOTHED: run before detector D2 existed, plane-envelope stayed 51/51 FULLY GREEN** — detector D proves an envelope is OPENED through the chokepoint and says nothing about the handler ACTING on the answer, and detector A is correctly silent because `pub` is spread into a REFUSAL rather than a success envelope. D2 was added in response and the arm now fires on both instruments naming "pubOut". (f) `do/capturelimit`'s `ceilingRead` forced true -> 33/2 and 52/1, the recorded basis writing "none observed" into the record about a ceiling nobody read, with D2 naming "limOut". (g) `do/recordreuseverdicts` restored to fire-and-forget -> 33/2 and 50/3, the answer reporting outcomes the store never took, with the store really holding 0 verdicts. (h) `do/recordcasemanifest`'s two branches SWAPPED so the invented reason is reachable on a silence again -> 33/2 and **plane-envelope 53/53 SILENT**, which is exactly why the ordering pin exists: D2 cannot see it (the binding IS still read with `.answered`, just in the wrong order) and only an assertion about the ORDER bites. (i) THE OTHER DIRECTION, and it is the arm that keeps this from collapsing the wrong way — a GENUINELY EMPTY reused-part set treated as a silence (`|| !reused.parts.length`), which is one clause away from what a careless guard would write -> 34/1 and 52/1: "A BUNDLE THAT GENUINELY REUSED NOTHING still carries NO reuse key at all" fails, a real emptiness read as a non-answer, REC-52's arm (f) reproduced at this item's own site. (j) THE INSTRUMENT'S OWN — `fixtures/do-fail-worker.mjs`'s injection disarmed (`if (false && …)`) so the store is asked to fail and does not -> **ratify-envelope 21/14 and plane-envelope 36/17**, every driven arm in both files naming its own site, which is what proves these drives answer an ACTUAL Durable Object failure and not a belief about one (REC-52's own 17 reproduced exactly). (k) THE SWEEP'S OWN — detector D's region bound neutered to the whole file -> ratify-envelope 35/35 untouched and plane-envelope 50/3, detector D reporting 23 violations that are all OUTSIDE this block, so an unbounded detector stops being a claim about the BLOCK and becomes one about the file. To re-run: one file mutated at a time, restoring from a pristine copy and comparing sha256 after each. */
/* REC-53 — A STORE SILENCE MUST NOT BECOME A RATIFICATION REFUSED FOR A REASON
 * ABOUT THE RECORD.
 *
 * REC-52 converted eleven caller-facing sites onto one chokepoint
 * (`doAnswer`/`storeSilent` in index.mjs) and left the publish/ratify block
 * alone, because REC-47 held that ground concurrently. It reported TWO live
 * instances there. Sweeping the block found EIGHT — every Durable Object read
 * inside `if (op === "ratify")`:
 *
 *   1  do/list              [named]  `.result || []` gave `runGate` an EMPTY
 *                                    known-id set, so EVERY reference in the
 *                                    bundle failed `resolveTarget` and the
 *                                    ratification came back GATE_REFUSED with
 *                                    C-6.2 / C-8.1 / C-19.1 findings reading
 *                                    "does not resolve in the store". The
 *                                    publisher is told their case cites things
 *                                    that are not there, at the moment they
 *                                    sign, when in fact NOTHING ANSWERED.
 *   2  do/reusedparts       [named]  a silence left the `reuse` key ABSENT,
 *                                    which reads as "no part was reused" — a
 *                                    statement about what the GROUP DID. CAP-4
 *                                    item 6b, twenty lines above the site, says
 *                                    "the one forbidden thing is ratifying with
 *                                    a reused part and saying nothing".
 *   3  do/image                      `runGate` does `Object.entries(image||{})`,
 *                                    so a silence gated an EMPTY BUNDLE and the
 *                                    publisher was told their document is
 *                                    missing its required files.
 *   4  do/gatefacts                  a silence threw a TypeError — a crash, not
 *                                    a claim, and the mildest member of the
 *                                    class. Converted anyway: what it answers is
 *                                    the published, earned and signer registries,
 *                                    and a 500 with a stack trace tells a
 *                                    publisher nothing they can act on.
 *   5  do/publish                    a silence synthesised `PUBLISH_FAILED` —
 *                                    the plane asserting the ratification did
 *                                    NOT publish when it cannot know whether it
 *                                    did. A TERNARY fallback, which is why
 *                                    REC-52's detector B (built for the `||`
 *                                    form) could not see it.
 *   6  do/recordcasemanifest         a silence synthesised
 *                                    `MANIFEST_NOT_RECORDED` — a claim that the
 *                                    published record does not hold this case's
 *                                    container — INSIDE an `ok:true`
 *                                    ratification answer. It reaches the caller
 *                                    in a local variable spread twelve lines
 *                                    later, so detector A could not see it
 *                                    either.
 *   7  do/capturelimit               a silence left `observed` null, which is
 *                                    ALSO what "nothing calibrated yet"
 *                                    answers — so every not_attempted part's
 *                                    recorded basis said the budget was "bounded
 *                                    by the calibrated subrequest ceiling none
 *                                    observed" about a ceiling nobody read, and
 *                                    that sentence is WRITTEN INTO THE RECORD.
 *   8  do/recordreuseverdicts        FIRE-AND-FORGET, so a silence left the
 *                                    verdicts out of the record while the answer
 *                                    handed the caller their outcomes under the
 *                                    sentence "every reused part carries an
 *                                    outcome". Being unread it was invisible
 *                                    even to detector C, which only sees a body
 *                                    that is CONSUMED.
 *
 * THE ONE JUDGEMENT, recorded at the site in index.mjs and asserted here:
 * op=ratify is the only handler in the file with a COMMIT in the middle of it.
 * Sites 1-5 run BEFORE `do/publish` commits and REFUSE on a silence — nothing
 * has been written and 502's own sentence ("nothing here is a statement about
 * the record") is exactly true. Sites 6-8 run AFTER, where refusing would deny a
 * ratification that genuinely LANDED — the same overclaim wearing modesty — so
 * they keep the true `ok:true` answer and state the undetermined part in its own
 * field. Every one of them is byte-identical on the wire when the store answers.
 *
 * WHAT THIS SUITE IS. The source-level half lives in `plane-envelope.test.mjs`
 * (detector D and the two corrected relation pins). This is the DRIVEN half: a
 * REAL signed ratification, through the REAL control plane, against a REAL
 * Durable Object failure — REC-52's `fixtures/do-fail-worker.mjs`, a subclass of
 * the shipped `Store` that answers the store's own catch-block envelope at named
 * paths. Nothing on disk is mutated and nothing here simulates the control
 * plane. EVERY arm is PAIRED with the same op against the same store with the
 * injection off, because these must not collapse the other way either: a
 * GENUINELY unresolved reference must still be refused with the catalog's own
 * words, and a bundle that genuinely reused nothing must still say nothing.
 *
 * Every ratification is signed with stock ssh-keygen, so without it there is
 * nothing to sign and no subset to run: SKIP LOUDLY WITH A NAMED REASON and exit
 * 0 rather than dying with an unhandled spawn error (D-93). Same guard, and same
 * reason, as ratify.test.mjs and reuse-ratify.test.mjs.
 *
 * A STATED LIMIT RATHER THAN AN EXEMPTION: site 6 (`recordcasemanifest`) is the
 * one site whose branch needs a COMPLETE PUBLISHED CASE to reach — the condition
 * is `pub.case && pub.case.complete && !pub.case.manifest_sha` — which is a
 * roster of three enrolled members, two concluded inquiries and an authored
 * case declaration. It is covered STRUCTURALLY instead: detector D in
 * plane-envelope.test.mjs proves the read goes through the chokepoint, and the
 * ordering pin at the end of this file proves the silence branch is reached
 * BEFORE the `MANIFEST_NOT_RECORDED` fallback rather than after it. That is
 * weaker than a drive and is reported as weaker.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeAddress } from "../src/subresources.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- ratify-envelope ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("ratify-envelope: SKIPPED — ssh-keygen not on PATH; every ratification here signs a real "
    + "bio-ratify statement with stock ssh-keygen and cannot run without it");
  process.exit(0);
}

const WORKER = fileURLToPath(new URL("./fixtures/do-fail-worker.mjs", import.meta.url));
const SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = readFileSync(SRC_PATH, "utf8");
const sha = (b) => createHash("sha256").update(Buffer.from(b)).digest("hex");

/* The scripted source for the reused parts. Only the reuse arms touch it. */
const HOST = "assets.oaklandca.gov";
const CSS = (s) => new TextEncoder().encode(s);
const BODIES = new Map([
  ["/one.css", CSS("body{color:#111}")],
  ["/two.css", CSS(".a{margin:0}")],
]);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: WORKER, script: readFileSync(WORKER, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec53", MEMBER_TOKEN: "mem-rec53", PROBE_TOKEN: "prb-rec53", VERSION: "test",
              /* A budget of ONE against TWO reused parts, with no reserved
                 margin, so the second part is always `not_attempted` and its
                 recorded basis — the sentence that names the ceiling — is
                 reachable in every reuse arm. */
              RATIFY_REFETCH_BUDGET: "1", RATIFY_REFETCH_MARGIN: "0",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST) return new Response("off-limits", { status: 500 });
    const b = BODIES.get(u.pathname);
    return b ? new Response(b, { headers: { "content-type": "text/css" } })
             : new Response("gone", { status: 404 });
  },
});

let pass = 0, fail = 0;
const ok = (label, cond) => {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${label}`);
  cond ? pass++ : fail++;
};
const t = (label, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${good ? "PASS" : "FAIL"}  ${label}`
    + (good ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  good ? pass++ : fail++;
};

const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })).json();
const PUT = async (q, bytes) => (await mf.dispatchFetch("http://x/api/?" + q, { method: "PUT", body: bytes })).json();
/* The ratify call, and the body is parsed DEFENSIVELY on purpose. One of the
   defects this item closes (site 4, `do/gatefacts`) answers a raw V8 stack trace
   rather than JSON — `TypeError: Cannot read properties of undefined (reading
   'ok')` — so a helper that simply did `await r.json()` would DIE on the
   negative control instead of reporting it, and a suite that dies mid-run
   reports "assertions unknown" and hides every arm after it (D-93). Reading the
   text first is what lets the arm name the defect IN ITS OWN WORDS. */
const RAT = async (q, body) => {
  const r = await mf.dispatchFetch("http://x/api/?" + q, { method: "POST", body: JSON.stringify(body) });
  const text = await r.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = null; }
  return { status: r.status, body: parsed ?? {}, text, json: parsed !== null };
};
const poison = async (...paths) => {
  const r = await mf.dispatchFetch(`http://x/__failpaths?paths=${encodeURIComponent(paths.join(","))}`);
  return (await r.json()).result.failing;
};

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const call = async (path, body) => (await doStub.fetch("http://x" + path, body
  ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

const SILENT = "STORE_DID_NOT_ANSWER";
/* The two properties every refusing arm asserts, named once: a silence is never
   a success, and a silence never carries a substantive word the store did not
   say. Same shape as plane-envelope.test.mjs's, deliberately. */
const isSilence = (r) => r.body && r.body.ok === false && r.body.reason === SILENT && r.status === 502;
/* The DEFECT'S OWN WORDS, taken from the catalog rather than retyped: C-6.2's
   message for a reference that does not resolve. This is what a `do/list`
   silence used to produce, and what a GENUINE dangling reference must still
   produce. */
const UNRESOLVED = "does not resolve in the store";

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "ratify-envelope-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "sparky", "-f", join(dir, "sparky"), "-q"]);
const keyB64 = readFileSync(join(dir, "sparky.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "sparky"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await POST("op=memberadd&token=adm-rec53", { memberId: "sparky", cover: "Bob", role: "admin" });
await POST("op=enroll", { invite: add.result.invite, handle: "sparky", password: "sparky-passphrase-53" });
await POST("op=signeradd&token=adm-rec53", { keyB64, memberId: "sparky", comment: "sparky laptop" });

/* ---- documents ---- */
const NOW = "2026-07-24T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - rel: cites`, `    target: ${x}`,
                                               "    status: confirmed", '    note: ""'])]
  : ["references: []"];
const mkMd = (id, refs, n) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Envelope target"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `revision ${n}`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

let seedDoc = 0;
/* One promoted bundle. `reuse` seeds the CAP-4 reused-part rows exactly the way
   reuse-ratify.test.mjs does: each part is recorded once under an unrelated
   earlier document (so site_assets holds the address and bytes) and once under
   this bundle's own primary sha with reused=1. */
const build = async (id, { refs = [], seed = 7, reuse = [], n = 1 } = {}) => {
  const capBytes = new Uint8Array(2048).map((_, i) => (i * seed) % 256);
  const capSha = sha(capBytes);
  await PUT(`op=capture&token=mem-rec53&sha256=${capSha}`, capBytes);
  if (reuse.length) {
    const earlier = String(++seedDoc).padEnd(64, "e");
    await call("/recordsiteassets", { host: HOST, primarySha: earlier, at: "2026-01-01T00:00:00Z",
      observations: reuse.map((p) => ({ address: p.address, address_norm: normalizeAddress(p.address),
        sha256: p.reusedSha, content_type: "text/css", bytes: 16, kind: "stylesheet" })) });
    await call("/recordsiteassets", { host: HOST, primarySha: capSha, at: "2026-01-02T00:00:00Z",
      observations: reuse.map((p) => ({ address: p.address, address_norm: normalizeAddress(p.address),
        sha256: p.reusedSha, reused: true })) });
  }
  const md = mkMd(id, refs, n);
  const c = await POST("op=promote&token=mem-rec53", {
    bundleId: id, base: null, snapKey: `2026072${seed}T10000${n}Z_${id.slice(-8)}`, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "Envelope target",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "snapshots/evidence.bin", blobSha: capSha, bytes: capBytes.length, sha256: capSha },
    ],
    register: [{ sha256: capSha, path: "snapshots/evidence.bin", encoding: "binary", bytes: capBytes.length }],
  });
  if (!c.result?.ok) throw new Error(`promote ${id}: ${JSON.stringify(c)}`);
  return { id, capSha, live: c.result.bundleSha };
};
const ratify = (b) => RAT("op=ratify&token=adm-rec53",
  { bundleId: b.id, expectedSha: b.live, sig: signRatify(b.id, b.live) });

const TARGET = await build("INFO-2026-7301-envelope-target", { seed: 7 });
const CITER = await build("INFO-2026-7302-envelope-citer", { seed: 11, refs: [TARGET.id] });
const DANGLER = await build("INFO-2026-7303-envelope-dangler",
  { seed: 13, refs: ["INFO-2026-9999-never-existed"] });

console.log("\n--- the injection control ---");
t("the injector arms and disarms, and reports what it is holding",
  [await poison("list", "reusedparts"), await poison()],
  [["list", "reusedparts"], []]);

/* =====================================================================
   SITE 1 — do/list. THE ITEM'S FIRST NAMED SITE AND THE WORST OF THE EIGHT.
   ===================================================================== */
console.log("\n--- site 1: do/list (a silence made every reference read as unresolved) ---");
{
  /* THE TRUE NEGATIVE FIRST, and it is the arm that keeps this from collapsing
     the other way: a reference that GENUINELY resolves to nothing must still be
     refused, in the catalog's own words. REC-52's arm (f) measured that the
     opposite collapse is one character away. */
  await poison();
  const dangling = await ratify(DANGLER);
  t("THE GENUINE UNRESOLVED REFERENCE, PRESERVED: a bundle citing an id the store does not hold is "
    + "still REFUSED by the gate, in the catalog's own vocabulary",
    [dangling.body.reason, (dangling.body.findings ?? []).map((f) => f.check)], ["GATE_REFUSED", ["C-6.2"]]);
  ok(`and the refusal still says the words this defect used to manufacture — "${UNRESOLVED}"`,
     (dangling.body.findings ?? []).some((f) => (f.detail ?? "").includes(UNRESOLVED)));

  const good = await ratify(CITER);
  t("and a bundle whose reference DOES resolve ratifies", [good.status, good.body.ok], [200, true]);

  /* Now the same bundle, the same store, one poisoned path. */
  const c2 = await build("INFO-2026-7304-envelope-citer2", { seed: 17, refs: [TARGET.id] });
  await poison("list");
  const bad = await ratify(c2);
  ok(`a store silence reaches the publisher AS A FAILURE — 502 STORE_DID_NOT_ANSWER, never a `
     + `ratification refused for a reason about the record (got ${bad.status} `
     + `${JSON.stringify(bad.body.reason)})`,
     isSilence(bad));
  ok(`and it is NOT GATE_REFUSED and carries NO finding at all, so no surface can read "your case `
     + `cites things that are not there" out of it`,
     bad.body.reason !== "GATE_REFUSED" && !("findings" in bad.body));
  ok(`and the words the defect manufactured — "${UNRESOLVED}" — appear NOWHERE in the answer`,
     !JSON.stringify(bad.body).includes(UNRESOLVED));
  ok("and the refusal names the read that went silent without implying anything about what it was "
     + "reading", bad.body.op === "ratify/list");
  ok("and NOTHING was published by the refused act", (await GET(`op=verify&sha256=${c2.live}`)).published === false);

  await poison();
  const recovered = await ratify(c2);
  t("with the store answering again the SAME bundle ratifies — the refusal was about the exchange "
    + "and the record was never the problem", [recovered.status, recovered.body.ok], [200, true]);
}

/* =====================================================================
   SITE 3 — do/image. Same shape, one field earlier.
   ===================================================================== */
console.log("\n--- site 3: do/image (a silence gated an EMPTY bundle) ---");
{
  const b = await build("INFO-2026-7305-envelope-image", { seed: 19, refs: [TARGET.id] });
  await poison("image");
  const bad = await ratify(b);
  ok("a store silence is not a publisher being told their document is missing its required files",
     isSilence(bad) && bad.body.reason !== "GATE_REFUSED" && bad.body.op === "ratify/image");
  await poison();
  const good = await ratify(b);
  t("and the same bundle ratifies once the image can be read", [good.status, good.body.ok], [200, true]);
}

/* =====================================================================
   SITE 4 — do/gatefacts. A crash rather than a claim, converted anyway.
   ===================================================================== */
console.log("\n--- site 4: do/gatefacts (a TypeError, and a stack trace a publisher cannot act on) ---");
{
  const b = await build("INFO-2026-7306-envelope-facts", { seed: 23 });
  await poison("gatefacts");
  const bad = await ratify(b);
  ok("a store silence on the gate's own facts is a named 502 rather than a raw V8 stack trace — "
     + `the answer is JSON at all, which is what this defect took away (got ${bad.status} `
     + `${JSON.stringify(bad.json ? bad.body.reason : bad.text.slice(0, 60))})`,
     bad.json && isSilence(bad) && bad.body.op === "ratify/gatefacts");
  ok("and it is NOT reported as the bundle being ABSENT, which is what this read answers when a "
     + "bundle genuinely is not there",
     bad.body.reason !== "ABSENT" && bad.body.reason !== "NO_SIGNERS");
  await poison();
  const absent = await RAT("op=ratify&token=adm-rec53",
    { bundleId: "INFO-2026-9999-none", expectedSha: b.live, sig: signRatify("INFO-2026-9999-none", b.live) });
  t("and a bundle that GENUINELY is not there still answers ABSENT", absent.body.reason, "ABSENT");
}

/* =====================================================================
   SITE 5 — do/publish. The commit, and the last site that may refuse.
   ===================================================================== */
console.log("\n--- site 5: do/publish (reason:\"PUBLISH_FAILED\" invented by a ternary) ---");
{
  const b = await build("INFO-2026-7307-envelope-publish", { seed: 29 });
  await poison("publish");
  const bad = await ratify(b);
  ok("a store silence at the commit is not reported as the ratification having FAILED to publish — "
     + `the plane does not know whether it did (got ${JSON.stringify(bad.body.reason)})`,
     bad.body.reason !== "PUBLISH_FAILED" && isSilence(bad) && bad.body.op === "ratify/publish");
  await poison();
  const good = await ratify(b);
  t("and the same bundle publishes once the store answers", [good.status, good.body.ok], [200, true]);
}

/* =====================================================================
   SITE 2 — do/reusedparts. THE ITEM'S SECOND NAMED SITE, and the first
   POST-COMMIT one: a ratification genuinely landed, so this may not refuse.
   ===================================================================== */
const PARTS = [
  { address: `https://${HOST}/one.css`, reusedSha: sha(BODIES.get("/one.css")) },
  { address: `https://${HOST}/two.css`, reusedSha: sha(BODIES.get("/two.css")) },
];
console.log("\n--- site 2: do/reusedparts (a silence read as \"nothing was reused\") ---");
{
  /* THE OTHER DIRECTION FIRST: a bundle that genuinely reused nothing must go on
     saying nothing, or the fix has invented a report where there was no subject. */
  await poison();
  const plainB = await build("INFO-2026-7308-envelope-noreuse", { seed: 31 });
  const plain = await ratify(plainB);
  t("A BUNDLE THAT GENUINELY REUSED NOTHING still carries NO reuse key at all — the answer is "
    + "byte-identical to what it was before this item",
    [plain.body.ok, "reuse" in plain.body], [true, false]);

  const rB = await build("INFO-2026-7309-envelope-reuse", { seed: 37, reuse: PARTS });
  const rp = (await call(`/reusedparts?id=${rB.id}`)).result;
  t("the store really does hold two reused parts for this bundle", rp.count, 2);

  const good = await ratify(rB);
  t("A GENUINE REUSE REPORT: both parts accounted for, one re-fetched and one over budget",
    [good.body.ok, good.body.reuse?.reused_parts, good.body.reuse?.confirmed, good.body.reuse?.not_attempted],
    [true, 2, 1, 1]);

  const rB2 = await build("INFO-2026-7310-envelope-reuse2", { seed: 41, reuse: PARTS });
  await poison("reusedparts");
  const bad = await ratify(rB2);
  t("THE RATIFICATION STILL LANDS, because it did — refusing here would deny a commit that "
    + "genuinely happened, which is the same overclaim wearing modesty",
    [bad.status, bad.body.ok], [200, true]);
  ok("and the `reuse` key is PRESENT and says the exchange failed, instead of being absent and "
     + `reading as "no part was reused" (got ${JSON.stringify(bad.body.reuse && bad.body.reuse.reason)})`,
     !!bad.body.reuse && bad.body.reuse.reason === SILENT && bad.body.reuse.op === "ratify/reusedparts");
  ok("and it says so in words a publisher can act on — that this is UNDETERMINED and not the same "
     + "as nothing having been reused",
     /NOT the same as no part having been reused/.test(bad.body.reuse?.note ?? "")
     && /Re-ratifying converges it/.test(bad.body.reuse?.note ?? ""));
  ok("and it carries no tally, no outcomes and no count, so nothing can be read off it as a fact "
     + "about what the group did",
     !("reused_parts" in (bad.body.reuse ?? {})) && !("outcomes" in (bad.body.reuse ?? {}))
     && !("confirmed" in (bad.body.reuse ?? {})));
  await poison();
}

/* =====================================================================
   SITE 7 — do/capturelimit. The sentence that is written INTO the record.
   ===================================================================== */
console.log("\n--- site 7: do/capturelimit (\"none observed\" about a ceiling nobody read) ---");
{
  await poison();
  const gB = await build("INFO-2026-7311-envelope-ceiling", { seed: 43, reuse: PARTS });
  const good = await ratify(gB);
  const goodBasis = (good.body.reuse?.outcomes ?? []).find((o) => o.verdict === "not_attempted")?.basis ?? "";
  t("A GENUINELY UNCALIBRATED INSTANCE still says `none observed`, and still reports the ceiling "
    + "field — the answered path is byte-identical to what it was",
    [/none observed/.test(goodBasis), "ceiling" in (good.body.reuse ?? {}), "ceiling_unread" in (good.body.reuse ?? {})],
    [true, true, false]);

  const bB = await build("INFO-2026-7312-envelope-ceiling2", { seed: 47, reuse: PARTS });
  await poison("capturelimit");
  const bad = await ratify(bB);
  const badBasis = (bad.body.reuse?.outcomes ?? []).find((o) => o.verdict === "not_attempted")?.basis ?? "";
  ok("a silence does NOT write `none observed` into the record — the recorded basis of the "
     + "not_attempted part says the ceiling was UNREAD and that the budget is our own appetite",
     !/none observed/.test(badBasis) && /UNREAD/.test(badBasis)
     && /not a calibrated ceiling/.test(badBasis));
  ok("and the report drops `ceiling` for `ceiling_unread`, so no reader can take a null ceiling "
     + "for a calibrated one",
     !("ceiling" in (bad.body.reuse ?? {})) && bad.body.reuse?.ceiling_unread?.reason === SILENT
     && bad.body.reuse?.ceiling_unread?.op === "ratify/capturelimit");
  t("and the ratification still lands, because it did", [bad.status, bad.body.ok], [200, true]);
  await poison();
}

/* =====================================================================
   SITE 8 — do/recordreuseverdicts. A write nobody read.
   ===================================================================== */
console.log("\n--- site 8: do/recordreuseverdicts (a fire-and-forget write, invisible to detector C) ---");
{
  await poison();
  const gB = await build("INFO-2026-7313-envelope-verdicts", { seed: 53, reuse: PARTS });
  const good = await ratify(gB);
  t("A WRITE THAT LANDED says nothing extra — the answered path is byte-identical",
    ["recorded" in (good.body.reuse ?? {}), (await call(`/reuseverdicts?bundle=${gB.id}`)).result.verdicts.length > 0],
    [false, true]);

  const bB = await build("INFO-2026-7314-envelope-verdicts2", { seed: 59, reuse: PARTS });
  await poison("recordreuseverdicts");
  const bad = await ratify(bB);
  ok("a write that never landed is NOT reported as done — the outcomes are still handed over, and "
     + "the answer says whether they reached the record",
     bad.body.ok === true && !!bad.body.reuse?.recorded
     && bad.body.reuse.recorded.reason === SILENT
     && bad.body.reuse.recorded.op === "ratify/recordreuseverdicts");
  ok("and it says the one thing a reader of the reuse history needs: their absence there is not "
     + "evidence they were never checked",
     /do not read their absence/.test(bad.body.reuse?.recorded?.note ?? ""));
  const persisted = (await call(`/reuseverdicts?bundle=${bB.id}`)).result.verdicts;
  ok(`and that is TRUE of the record rather than merely stated — the store really holds no verdict `
     + `for this bundle (${persisted.length})`, persisted.length === 0);
  await poison();
}

/* =====================================================================
   SITE 6 — do/recordcasemanifest. THE STATED LIMIT, covered structurally.
   ===================================================================== */
console.log("\n--- site 6: do/recordcasemanifest (the one site whose branch needs a complete case) ---");
{
  /* The branch is `pub.case && pub.case.complete && !pub.case.manifest_sha`, and
     reaching it takes a roster of three enrolled members, two concluded
     inquiries and an authored case declaration. Rather than build that fixture
     here and call it a drive, the property is pinned where it can be checked
     exactly: the SILENCE branch is evaluated FIRST, so `MANIFEST_NOT_RECORDED`
     is unreachable on an unanswered read. The ORDER is the whole property — a
     version that tested `rec && rec.ok` first and the silence second would put
     the invented reason back on the silence path while looking identical in a
     diff. */
  const container = /container = !recOut\.answered\s*\n\s*\? \{ ok: false, reason: STORE_SILENT_REASON, op: "ratify\/recordcasemanifest"/.test(SRC);
  ok("the container's SILENCE branch is evaluated before anything else, so a store that never "
     + "answered cannot reach the `MANIFEST_NOT_RECORDED` fallback", container);
  const iSilent = SRC.indexOf("op: \"ratify/recordcasemanifest\"");
  const iInvent = SRC.indexOf('{ reason: "MANIFEST_NOT_RECORDED" }');
  ok("and the fallback survives BELOW it for the answered path, where it describes a store that "
     + "said ok:false without a reason of its own — corrected, not deleted",
     iSilent > 0 && iInvent > iSilent);
  ok("and the R2 write of the manifest bytes is gated on the read having been ANSWERED, so a "
     + "silence does not put a manifest in the published bucket that no row points at",
     /if \(recOut\.answered && rec && rec\.ok && typeof env\.PUBLISHED\?\.put === "function"\)/.test(SRC));
}

await mf.dispose();
console.log(`\nratify-envelope: ${pass} pass, ${fail} fail`);
console.log(`REC-53: EIGHT Durable Object reads in the publish/ratify block where the item named TWO; `
  + `seven driven against a REAL store failure through the shipped control plane, each PAIRED with the `
  + `same op answering honestly; the eighth pinned structurally with its limit stated.`);
process.exit(fail ? 1 : 0);

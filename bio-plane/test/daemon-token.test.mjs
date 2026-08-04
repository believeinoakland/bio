/* NEGATIVE CONTROL: (RUN 2026-08-05, rec33-agent, FOUR arms; 56/56 green before and after, and src/index.mjs, src/query.mjs, src/store.mjs and src/livefire.mjs sha256-compared BYTE-IDENTICAL after every arm) (a) THE ITEM'S OWN — GRANT THE CLASS ONE OP BEYOND ITS TWO: add "daemon" to `purge`'s `classes` in src/index.mjs -> 3 FAIL, every one naming purge: the totality assertion (want ["acquire","monitor"] got ["acquire","monitor","purge"]), the named purge refusal, and the whole-table sweep (got ["purge"]) — and the daemon reaches the PURGE HANDLER, answering "purge requires confirm=<store>", one query parameter from emptying the live record. (b) THE INERT-CLASS ARM — drop `daemon` from viewerPredicate's class alternation in src/query.mjs -> 6 FAIL: op=monitor under the daemon credential answers for a bundle it cannot see, the tick does not land, no monitor-tick reaches the history — while the ADMIN tick and BOTH archive arms stay green, which is what makes it a viewer-gate failure and not an auth one. (c) THE CONFINEMENT ARM — guard the `cls === "daemon" && body?.via !== "archive.org"` refusal in op=acquire with `false &&` -> 2 FAIL and the daemon CAPTURES a document off the DIRECT arm (ok:true), which is the scope Bob ruled, gone. (d) THE FALLBACK ARM — make `#monitorToken()` in src/store.mjs return `this.env.DAEMON_TOKEN` alone -> 4 FAIL, the instance that has NOT been updated reporting its monitoring consumer unconfigured and firing nothing. ARM (d) ALSO CORRECTED THE INSTRUMENT: its first run THREW on `fired.monitor.fired.map` instead of failing — D-93 inside a negative control, readingname's arm (a) and REC-39's arm (f-a) again — so that read is guarded and the arm now reports all four. */
/* REC-33 / DEC-37: the DAEMON_TOKEN class — the UNATTENDED PATH, scoped.
 *
 * WHAT THIS CLOSES. Every monitor tick and every archive fallback on every
 * installed instance authenticated as ADMIN_TOKEN — the root of trust §8.1
 * builds every membership rule on — to do two narrow things. That credential is
 * bound into an instance's configuration and sits there unattended
 * indefinitely, which is the place a credential lives longest and travels
 * furthest. Bob, 2026-08-04: "Sounds like we need a daemon token."
 *
 * AND WHAT THE NAME DECIDES. The class is the PATH, not the verb: it drives
 * op=monitor AND the archive arm of op=acquire, so naming it for the monitor
 * would have invited the next unattended consumer to mis-scope itself or mint a
 * fifth class. Scoped to exactly the two verbs it needs today, and WIDENED BY
 * DECISION rather than by drift — which is a property of the OPS table and is
 * therefore asserted OVER the OPS table, the REC-30 classification pattern: a
 * later op that admits `daemon` fails this suite until somebody answers for it.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO (the accepts-when, verbatim):
 *   - a DAEMON_TOKEN credential reaches op=monitor and op=acquire's ARCHIVE ARM
 *     and NOTHING else — memberlist, tasks, purge, queue and publish refused by
 *     name, and every other op in the table refused by sweep, reads included;
 *   - the DIRECT arm of op=acquire refuses it, because the table can only speak
 *     about an op and the scope Bob ruled is one ARM of one;
 *   - ADMIN_TOKEN STILL WORKS on an instance that has not been updated: the
 *     fallback is asserted on an instance with no DAEMON_TOKEN binding at all,
 *     and the credential the unattended consumer actually SPENDS is measured at
 *     the SELF binding rather than inferred;
 *   - the class is not scratch-confined, because monitoring writes the real
 *     record's reachability — which is why PROBE_TOKEN was never the answer.
 *
 * THE GATED-READS POSTURE, decided here and stated because a new class
 * interacts with REC-25/REC-30's stamps in TWO places that look alike and are
 * not:
 *
 *   (1) THE READ OPS: DENY, and by the ordinary route — `daemon` is in no read
 *       op's `classes`, so the control-plane ACL refuses before any handler
 *       runs and no viewer is ever stamped. The daemon has no reading business:
 *       both its verbs are writes about a source's reachability, and a
 *       credential that sits unattended in a config file is the last one that
 *       should be able to enumerate the working corpus. Swept below, not
 *       assumed.
 *   (2) `viewerPredicate`: RECOGNISED, and this is not a contradiction of (1).
 *       op=monitor reads the bundle image it must diff against by stamping
 *       `class:${cls}` on its OWN inner request, and that function fails closed
 *       on anything it does not recognise. Leaving `daemon` out would not have
 *       been narrower — it would have made every tick answer ABSENT for every
 *       bundle: a class that authenticates and can do nothing, which is DIST-1's
 *       armed-alarm trap arriving through a different door. Arm (b) is that
 *       exact state, run. Stamping some other class's name on the inner read was
 *       refused: an inner URL that lies about who is asking is the impostor hole
 *       REC-29 closed.
 *
 * So the daemon is unfiltered WHERE IT CAN PRESENT A VIEWER and reaches no read
 * where it could spend one. What bounds it is the op table, and that boundary is
 * the assertion.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const INDEX_SRC = readFileSync(IDX, "utf8");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const QUERY_SRC = readFileSync(fileURLToPath(new URL("../src/query.mjs", import.meta.url)), "utf8");
const LIVEFIRE_SRC = readFileSync(fileURLToPath(new URL("../src/livefire.mjs", import.meta.url)), "utf8");
const TOKENS_SRC = readFileSync(fileURLToPath(new URL("../src/tokens.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const ADMIN = "adm-r33-root-of-trust";
const MEMBER = "mem-r33-shared";
const PROBE = "prb-r33-scratch";
const DAEMON = "dmn-r33-unattended";

/* ================================================================== *
 * BLOCK 1 — THE TOTALITY, read out of the OPS table itself.
 *
 * A hand-kept list of what the class may reach would fall behind the table
 * (D-113/D-93 exactly), so the reach is PARSED. This is the assertion the
 * item's own negative control breaks, and it is the one that makes "widen by
 * decision, not by drift" a mechanism rather than an intention.
 * ================================================================== */
const OPS_BLOCK = INDEX_SRC.slice(INDEX_SRC.indexOf("const OPS = {"),
                                  INDEX_SRC.indexOf("\n};", INDEX_SRC.indexOf("const OPS = {")));
const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}([a-z]+):\s*\{\s*classes:\s*(null|\[([^\]]*)\]),\s*mutating:\s*(true|false)/gm)]
  .map((m) => ({
    op: m[1],
    classes: m[2] === "null" ? null : m[3].split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean),
    mutating: m[4] === "true",
  }));

console.log("\n--- the class's REACH, parsed out of the OPS table and asserted whole ---");
t("the OPS table was actually read (a silent parse failure would make every sweep below vacuous)",
  OP_ROWS.length > 60, true);
t("EXACTLY TWO ops admit the daemon class, and they are the two verbs DEC-37 scoped it to",
  OP_ROWS.filter((r) => r.classes && r.classes.includes("daemon")).map((r) => r.op).sort(),
  ["acquire", "monitor"]);
t("and neither of the two lost a class it already had — this widening takes nothing away",
  OP_ROWS.filter((r) => r.op === "acquire" || r.op === "monitor").map((r) => r.classes),
  [["admin", "member", "probe", "daemon"], ["admin", "member", "probe", "daemon"]]);

console.log("\n--- the four places the class is written, held structurally ---");
t("classify() recognises DAEMON_TOKEN, and through liveToken like every other class "
  + "(so a published or blank value authenticates nothing)",
  /token === env\.DAEMON_TOKEN && \(await liveToken\(env\.DAEMON_TOKEN\)\)\) return "daemon"/.test(INDEX_SRC), true);
{
  /* scopeFor's daemon branch is ABSENT ON PURPOSE and the absence is the
     decision, so it is asserted as an absence rather than left to be noticed. */
  const body = INDEX_SRC.slice(INDEX_SRC.indexOf("function scopeFor(cls, url)"),
                               INDEX_SRC.indexOf("const json = (o, status = 200)"));
  t("scopeFor confines the PROBE class and says so", /cls === "probe"/.test(body), true);
  t("and does NOT confine the daemon class — monitoring writes the REAL record, "
    + "which is exactly why PROBE_TOKEN was not the answer",
    /"daemon"/.test(body), false);
}
t("viewerPredicate recognises class:daemon (without it the class authenticates and can do nothing)",
  /class:\(admin\|member\|probe\|daemon\)/.test(QUERY_SRC), true);
t("#monitorToken reads DAEMON_TOKEN FIRST with the ADMIN_TOKEN fallback RETAINED",
  /return \(this\.env && \(this\.env\.DAEMON_TOKEN \|\| this\.env\.ADMIN_TOKEN\)\) \|\| null;/.test(STORE_SRC), true);
t("livefire's token-hygiene sweep knows the new binding's name",
  /names = \["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN", "DAEMON_TOKEN"\]/.test(LIVEFIRE_SRC), true);

console.log("\n--- tokens.mjs needs no edit, VERIFIED rather than assumed ---");
/* The claim was "the denylist is per-value". If it were keyed by binding NAME a
   new binding would need an entry, and forgetting one would be silent. */
t("the denylist is a set of VALUE hashes, so it is not keyed by binding name at all",
  /export const PUBLISHED_TOKEN_HASHES = new Set\(\[/.test(TOKENS_SRC), true);
t("and liveToken takes a VALUE, so a DAEMON_TOKEN whose value was ever published is "
  + "already refused by the function that was there before this class existed",
  /export async function liveToken\(v\)/.test(TOKENS_SRC)
  && /PUBLISHED_TOKEN_HASHES\.has\(await sha256hex\(v\)\)/.test(TOKENS_SRC), true);
t("no binding NAME appears in the denylist module's executable surface",
  /DAEMON_TOKEN|MONITOR_TOKEN/.test(TOKENS_SRC.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")), false);

/* ------------------------------------------------------------------ *
 * The shared fixture: a monitored Information bundle whose source moves,
 * and a document the origin has stopped serving that the Archive holds.
 * ------------------------------------------------------------------ */
const V1 = "the report as first captured\n";
const V2 = "the report AFTER the source changed it\n";
const LOCATOR = "https://www.oaklandca.gov/report.pdf";
const DIRECT = "https://www.oaklandca.gov/direct.pdf";
const DOCADDR = "https://www.oaklandca.gov/agenda.pdf";
/* A SECOND unreachable document, reserved for the alarm-driven measurement at
   the end of each block. It exists because the hand-driven fallback above RESETS
   the failing run for its address — the ruled "an alternative source counts as a
   re-fetch for monitoring" — so a tick fired afterwards would find nothing to do
   and the wire measurement would pass by doing nothing, which is the shape this
   project treats as no evidence at all. */
const DOCADDR2 = "https://www.oaklandca.gov/agenda-unattended.pdf";
const ARCHIVED = new Uint8Array(6000).map((_, i) => (i * 17 + 3) % 256);
const TS = "20240115120000";
/* Built FROM the address the caller asked about, so both documents are held. */
const cdxFor = (askedUrl) => {
  const original = "https://" + String(askedUrl).replace(/^https?:\/\//, "");
  return JSON.stringify([
    ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
    ["gov,oaklandca)/x", TS, original, "application/pdf", "200", "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", "6255"],
  ]);
};

const MONITORED = "INFO-2026-0805-monitored";
const md = [
  "---", `id: ${MONITORED}`, "object_type: information", "schema: information@1",
  'title: "The monitored report"', "current_state: collected", "prior_state: null",
  "created: 2026-07-24T00:00:00Z", "last_updated: 2026-07-24T01:00:00Z",
  "produced_by:", "  mode: mechanical", "  capability_tier: daemon",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  `  locator: ${LOCATOR}`, "  authority: City Auditor",
  "  retrieved: 2026-07-24T00:00:00Z",
  "monitoring:", "  enabled: true", "  frequency: hourly",
  "  last_checked: null", "---", "",
  "## Summary", "", "What the report shows.", "",
  "## Provenance Notes", "", "## Session Log", "",
  "### Session 1", "", "Entry 1.", "", "## Review Notes", "",
].join("\n");
const provenance = JSON.stringify({
  documents: [{ locator: LOCATOR, capture: { sha256: sha(V1) } }],
}, null, 2);
const PKG = {
  bundleId: MONITORED, base: null, snapKey: "20260724T010000Z_monitord",
  author: "bio-daemon",
  meta: { object_type: "information", group: "believe-in-oakland",
          title: "The monitored report", current_state: "collected",
          created: "2026-07-24T00:00:00Z", last_updated: "2026-07-24T01:00:00Z" },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
          { path: "data/provenance.json", text: provenance, bytes: provenance.length, sha256: sha(provenance) }],
  register: [],
};

/* One instance builder, used twice: ONCE with the DAEMON_TOKEN binding (an
   instance that has been updated) and ONCE without it (an instance that has
   not). `spentAtSelf` records the credential the unattended consumer actually
   sends over the SELF binding — measured at the wire, never inferred from
   configuration, because "which token the daemon spends" is the whole claim. */
const build = ({ daemon }) => {
  let MF, served = V1;
  const spentAtSelf = [];
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: INDEX_SRC,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: {
      ADMIN_TOKEN: ADMIN, MEMBER_TOKEN: MEMBER, PROBE_TOKEN: PROBE, VERSION: "test",
      ...(daemon ? { DAEMON_TOKEN: DAEMON } : {}),
      GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
      /* Pinned far out of the test window: only the hand-driven onAlarm fires. */
      MONITOR_TICK_MS: "3600000",
    },
    serviceBindings: {
      SELF: async (request) => {
        const u = new URL(request.url);
        const tok = u.searchParams.get("token");
        /* The VALUE is never printed: it is mapped to the binding's NAME, which
           is the only thing any assertion here is about. */
        spentAtSelf.push({
          op: u.searchParams.get("op"),
          credential: tok === DAEMON ? "DAEMON_TOKEN" : tok === ADMIN ? "ADMIN_TOKEN" : "other",
        });
        return MF.dispatchFetch(request);
      },
    },
    outboundService(request) {
      const u = new URL(request.url);
      if (u.hostname === "web.archive.org" && u.pathname === "/cdx/search/cdx")
        return new Response(cdxFor(u.searchParams.get("url")), { headers: { "content-type": "application/json" } });
      if (u.hostname === "web.archive.org" && u.pathname.includes("id_/"))
        return new Response(ARCHIVED, { headers: { "content-type": "application/pdf" } });
      if (u.hostname === "www.oaklandca.gov") return new Response(served);
      return new Response("unscripted", { status: 500 });
    },
  });
  MF = mf;
  return {
    mf, spentAtSelf,
    serve: (v) => { served = v; },
    GET: async (q) => {
      const r = await mf.dispatchFetch(`http://x/api/?${q}`);
      return { status: r.status, body: await r.json().catch(() => null) };
    },
    POST: async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(body ?? {}) })).json(),
  };
};

/* ================================================================== *
 * BLOCK 2 — AN UPDATED INSTANCE: the class exists, and reaches two verbs.
 * ================================================================== */
const A = build({ daemon: true });
try {
  const ns = await A.mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));

  console.log("\n--- the class EXISTS, and an unrecognised credential is still nobody ---");
  const stranger = await A.GET("op=memberlist&token=not-a-token-at-all");
  t("a token the plane cannot classify is UNAUTHENTICATED, not a class",
    [stranger.status, stranger.body.error], [401, "unauthenticated"]);
  const named = await A.GET("op=memberlist&token=" + DAEMON);
  t("the daemon credential CLASSIFIES — it is refused as a CLASS, which is how we know "
    + "classify() saw it and not merely that it failed",
    [named.status, named.body.error, named.body.cls], [403, "forbidden for token class", "daemon"]);

  console.log("\n--- VERB 1: op=monitor, the whole op, under the daemon credential ---");
  const created = await A.POST(`op=promote&token=${ADMIN}`, PKG);
  t("the monitored bundle exists", created.result.ok, true);
  A.serve(V2);
  const tick = await A.POST(`op=monitor&token=${DAEMON}`, { bundleId: MONITORED });
  t("the daemon credential reaches op=monitor and the tick LANDS", tick.ok, true);
  /* THE VIEWER-GATE ASSERTION, and the reason it is here rather than in a
     structural pin: op=monitor stamps `class:daemon` on its own inner image
     read, so if viewerPredicate did not recognise the class this would answer
     ABSENT for a bundle that plainly exists. Arm (b) is that state. */
  t("and it is not answering about a bundle it could not see — the source is reported MODIFIED",
    tick.status, "modified");
  t("the tick raised the re-evaluation flag rather than capturing the new bytes",
    tick.reeval_raised, true);
  const img = (await A.GET(`op=image&id=${MONITORED}&token=${ADMIN}`)).body.result;
  t("the record now says the source moved, in the LIVE store — the daemon is not scratch-confined",
    /^source_status: modified$/m.test(img["bundle.md"]), true);
  const hist = Object.keys(img).filter((k) => k.startsWith("_history/promotion_"))
    .map((k) => JSON.parse(img[k])).filter((h) => h.operation === "monitor-tick");
  t("one mechanical monitor-tick is in the history, attributed to the monitor and not to a member",
    hist.map((h) => [h.writer, h.author]), [["mechanical", "bio-monitor"]]);

  console.log("\n--- VERB 2: op=acquire's ARCHIVE ARM, under the daemon credential ---");
  const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
    { method: "POST", body: JSON.stringify(b) })).json()).result;
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 503 });
  await rec({ addressNorm: DOCADDR, outcome: "fetch_failed" });
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 404 });
  const arc = await A.POST(`op=acquire&token=${DAEMON}`, { via: "archive.org", address: DOCADDR });
  t("the daemon credential drives the archive fallback", arc.ok, true);
  t("and it grades C, because grade tracks DIRECTNESS and an archive hop is one more party",
    arc.document && arc.document.capture && arc.document.capture.grade, "C");
  t("the capture records the daemon as the actor class — a vocabulary the record already had",
    arc.document && arc.document.capture && arc.document.capture.actor_class, "daemon");
  t("with the two-hop chain the call built for itself",
    arc.document && Array.isArray(arc.document.provenance_chain) && arc.document.provenance_chain.length, 2);

  console.log("\n--- and the DIRECT arm of the same op refuses it, which is where the scope actually bites ---");
  const direct = await A.POST(`op=acquire&token=${DAEMON}`, { locator: DIRECT });
  t("a daemon credential capturing a document DIRECTLY is refused",
    [direct.ok, direct.reason, direct.cls], [false, "NOT_PERMITTED", "daemon"]);
  t("and the refusal names the one arm it may use, rather than saying only 'no'",
    /via: "archive.org"/.test(String(direct.detail)), true);
  const adminDirect = await A.POST(`op=acquire&token=${ADMIN}`, { locator: DIRECT });
  t("while an OPERATOR's direct acquisition is untouched by the narrowing", adminDirect.ok, true);
  const memberArc = await A.POST(`op=acquire&token=${MEMBER}`, { via: "archive.org", address: DOCADDR });
  t("and a MEMBER still cannot reach the archive arm — the widening admitted one class, not everyone",
    [memberArc.ok, memberArc.reason], [false, "NOT_PERMITTED"]);

  console.log("\n--- NOTHING ELSE: the five the item names, refused ---");
  for (const op of ["memberlist", "tasks", "purge", "queue", "publish"]) {
    const r = await A.GET(`op=${op}&token=${DAEMON}`);
    t(`op=${op} refuses the daemon class`,
      [r.status, r.body.error, r.body.cls], [403, "forbidden for token class", "daemon"]);
  }

  console.log("\n--- NOTHING ELSE: THE SWEEP, over every op the table gates ---");
  /* Driven through the CONTROL PLANE, one call per op, because the class ACL is
     the only thing being asserted and it sits ahead of every handler — so a GET
     reaches it for a POST-only op exactly as a POST would. A representative
     handful would have proved a handful. */
  const gated = OP_ROWS.filter((r) => r.classes && !["acquire", "monitor"].includes(r.op));
  const answered = [];
  for (const r of gated) {
    const got = await A.GET(`op=${r.op}&token=${DAEMON}`);
    if (got.status !== 403 || got.body?.error !== "forbidden for token class") answered.push(r.op);
  }
  t("the sweep covered the whole gated surface", gated.length > 60, true);
  t("and NOT ONE op outside the daemon's two verbs answered it anything but the class refusal",
    answered, []);

  console.log("\n--- THE READ SURFACES, called out of the sweep because the posture is a DECISION ---");
  /* (1) above: DENY, by the ordinary ACL route. The daemon's two verbs are both
     writes about a source's reachability; a credential that sits unattended in
     a config file has no business enumerating the working corpus, and REC-30's
     gated reads are exactly the surface where that would matter. */
  const reads = gated.filter((r) => !r.mutating);
  const readAnswered = [];
  for (const r of reads) {
    const got = await A.GET(`op=${r.op}&token=${DAEMON}`);
    if (got.body?.error !== "forbidden for token class") readAnswered.push(r.op);
  }
  t("every gated READ in the table is on the deny side for the daemon class", readAnswered, []);
  /* Named individually as well as swept, because "the sweep found nothing" is
     worth something only if the surface that matters was IN the sweep. If one of
     these ever leaves the table this fails, rather than the population the line
     above ranges over quietly shrinking. */
  const REC30_READS = ["dangling", "reading", "readingref", "readingname", "resolutions", "concerns",
                       "connections", "instance", "exceptions", "strengthbarof", "list", "index",
                       "projection", "image", "file", "search", "backlinks", "audit", "whoami"];
  t("REC-25/REC-30's gated reads are all present in the swept population",
    REC30_READS.filter((op) => !reads.some((r) => r.op === op)), []);
  t("and every one of them is on the deny side, by name",
    REC30_READS.filter((op) => readAnswered.includes(op)), []);
  /* And the refusal is at the ACL, so no viewer is stamped and no answer is
     composed: the deny costs the store nothing and discloses nothing. */
  const readBody = (await A.GET(`op=list&token=${DAEMON}`)).body;
  t("a refused read carries no result at all — the ACL answered, not the store",
    [readBody.result === undefined, readBody.store === undefined], [true, true]);

  console.log("\n--- op=selftest reports the binding, and does NOT require it ---");
  const st = (await A.GET(`op=selftest&token=${ADMIN}`)).body;
  t("an updated instance reports its daemon credential live", st.bindings.DAEMON_TOKEN, true);
  t("and the instance is healthy", [st.ok, st.bindingsAllPresent], [true, true]);

} finally { await A.mf.dispose(); }

/* ================================================================== *
 * BLOCK 2b — WHICH CREDENTIAL THE UNATTENDED CONSUMER SPENDS.
 *
 * On its OWN instance, and the isolation is not fastidiousness: promoting a
 * monitored document arms the one reconciling alarm, so a REAL alarm fires
 * alongside the hand-driven one and the tick under measurement reports
 * `busy: true` — an empty account of a tick somebody else was running. Measured
 * that way the assertion would have passed by observing nothing, which this
 * project treats as no evidence at all. archive-monitoring.test.mjs's shape,
 * for archive-monitoring.test.mjs's reason: only failing ADDRESSES here, no
 * promoted bundle, so the only actor is the alarm this suite drives.
 *
 * The credential is read off the SELF binding at the wire and mapped to its
 * BINDING NAME; no token value is printed by any assertion here.
 * ================================================================== */
const spend = async ({ daemon, expect }) => {
  const I = build({ daemon });
  try {
    const ns = await I.mf.getDurableObjectNamespace("STORE");
    const obj = ns.get(ns.idFromName("bio"));
    const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
      { method: "POST", body: JSON.stringify(b) })).json()).result;
    await rec({ addressNorm: DOCADDR2, outcome: "source_refused", status: 503 });
    await rec({ addressNorm: DOCADDR2, outcome: "fetch_failed" });
    const third = await rec({ addressNorm: DOCADDR2, outcome: "source_refused", status: 404 });
    t(`[${expect}] three real failures make the document fallback_eligible`, third.fallback_eligible, true);
    I.spentAtSelf.length = 0;
    const fired = await obj.onAlarm(Date.now());
    t(`[${expect}] the unattended consumer is CONFIGURED`, fired.monitor && fired.monitor.configured, true);
    /* GUARDED, and the guard is the point: arm (d) leaves `fired` absent, and an
       unguarded `.map` THROWS instead of failing — D-93 inside a negative
       control, the class readingname's arm (a) and REC-39's arm (f-a) both hit.
       A suite that dies on the failure it exists to detect reports nothing. */
    t(`[${expect}] and it actually FIRED rather than reporting configured and doing nothing`,
      (fired.monitor && Array.isArray(fired.monitor.fired) ? fired.monitor.fired : [])
        .map((f) => [f.address, f.grade]), [[DOCADDR2, "C"]]);
    t(`[${expect}] every call it made over the SELF binding spent ${expect}`,
      [...new Set(I.spentAtSelf.map((s) => s.credential))], [expect]);
    t(`[${expect}] and it reached only ops the class is scoped to`,
      [...new Set(I.spentAtSelf.map((s) => s.op))].filter((o) => !["monitor", "acquire"].includes(o)), []);
  } finally { await I.mf.dispose(); }
};

console.log("\n--- WHICH CREDENTIAL THE UNATTENDED CONSUMER SPENDS, measured at the wire ---");
/* An UPDATED instance spends the scoped credential, and the root of trust is
   never sent — which is the entire security claim DEC-37 bought. */
await spend({ daemon: true, expect: "DAEMON_TOKEN" });
/* An instance that has NOT been updated spends the fallback and keeps working.
   DIST-1's constraint runs in both directions: the plane must learn the class
   before an installer binds it, and must not inert an instance that has none. */
await spend({ daemon: false, expect: "ADMIN_TOKEN" });

/* ================================================================== *
 * BLOCK 3 — AN INSTANCE THAT HAS NOT BEEN UPDATED.
 *
 * No DAEMON_TOKEN binding at all, which is every instance in the field on the
 * day this lands. DIST-1's constraint runs in BOTH directions: the plane must
 * learn the class before an installer binds it, AND the plane must not inert
 * the monitoring of an instance that has not received one.
 * ================================================================== */
const B = build({ daemon: false });
try {
  const ns = await B.mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));

  console.log("\n--- an un-updated instance has no daemon class to be had ---");
  const nope = await B.GET("op=monitor&token=" + DAEMON);
  t("the value that authenticates on an updated instance is NOBODY here — an absent "
    + "binding classifies nothing rather than defaulting to something",
    [nope.status, nope.body.error], [401, "unauthenticated"]);
  const st = (await B.GET(`op=selftest&token=${ADMIN}`)).body;
  t("selftest states the absence rather than reporting a false", st.bindings.DAEMON_TOKEN, "not configured");
  t("and the instance is STILL HEALTHY — the new binding is optional by DEC-37's fallback, "
    + "so an instance that predates the class does not fail its own health check",
    [st.ok, st.bindingsAllPresent], [true, true]);

  console.log("\n--- and ADMIN_TOKEN still does both jobs, which is what stops anything breaking ---");
  await B.POST(`op=promote&token=${ADMIN}`, PKG);
  B.serve(V2);
  const tick = await B.POST(`op=monitor&token=${ADMIN}`, { bundleId: MONITORED });
  t("op=monitor still answers to the operator credential", [tick.ok, tick.status], [true, "modified"]);
  const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
    { method: "POST", body: JSON.stringify(b) })).json()).result;
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 503 });
  await rec({ addressNorm: DOCADDR, outcome: "fetch_failed" });
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 404 });
  const arc = await B.POST(`op=acquire&token=${ADMIN}`, { via: "archive.org", address: DOCADDR });
  t("and the archive fallback still answers to it too",
    [arc.ok, arc.document && arc.document.capture.grade], [true, "C"]);

} finally { await B.mf.dispose(); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

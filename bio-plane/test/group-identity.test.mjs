/* NEGATIVE CONTROL: DECLARED IN, AND RUN BY, `test/group-identity.control.mjs` — deliberately NOT a `.test.mjs`, because it builds ARMED COPIES of the sources while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/group-identity.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once), the real sources are hashed before and after, and what each arm MUST fail is declared in the driver before it arms. RESULTS, RUN 2026-09-23 on branch land/worker/REC-164 over base `02603e88` (real src/index.mjs 737,101 B sha256 814c378a2733…, src/store.mjs 2,918,664 B sha256 60340d2fcc05…, src/schema.mjs 225,748 B sha256 6f65c378ddb6…, checks/bio-checks.mjs 847,729 B sha256 c32fd0335edb…; untouched: YES), all eight AS DECLARED: (a) baseline 33/0 · (b) verdict-gate-skipped, THE ROW'S CONTROL — the public read shows a claimed domain whatever its verdict: 28/5, the unverified-domain arms D1, D2, D3, D3b and the liar's L3 failing BY NAME · (c) set-time-only, THE LIAR THE ROW NAMES — the alarm consumer registered but re-checking nothing: 30/3, L2, L3, L4 alone · (d) fence-dropped, the bearer fence neutered with the stamp and roster standing: 27/6, the six A1 arms alone (each refused C-64.5 instead of C-64.4), A2b green — nothing a bearer asked for landed · (e) stamp-dropped, a caller's `by` honoured: 25/8 (A2 ×2, A2b, A3, A4, A5, D7, P1) · (f) roster-unread, the store's roster check removed: 25/8 (A2 ×2, A2b, A3, A4, A5, D7, P1) · (g) gate-never-opens, the over-tight direction: 29/4 (D5, L1, L4, O1) · (h) gate-respelled, the suite's over-strictness: 33/0. THE FIRST RUN had (e) and (f) NOT AS DECLARED and that is recorded rather than smoothed: in both, cai's forged set LANDS, so P1's "no domain claimed" read and (in f) A3's history read move too — findings about the declarations, corrected in the driver with the reason, the subject unchanged.
 * =========================================================================
 * REC-164 — THE PUBLISHING GROUP'S DISPLAY NAME AND ITS VERIFIED DOMAIN. `BIO_Publication_v0_1.md` §7 points 2 and 3
 * (BOB #24, 2026-09-21), resting on point 1's public slug (REC-163, `group-public.test.mjs`).
 *
 * THE ROW'S ACCEPTANCE, in its own terms, each an arm below:
 *   - a BEARER and a CALLER-SUPPLIED `by` are refused (A1, A2), and the setter the record names is the session's (A3);
 *   - an UNVERIFIED domain never appears in a public read (D1 absent, D2 undetermined, D3 mismatched);
 *   - a well-known file naming ANOTHER instance reads `mismatched` (D3);
 *   - the display name appears in NO SIGNED BYTES (B1 a population over every text the store holds after the plane
 *     composed a document under the name; B2 a census of the store's readers of the history table).
 *
 * HOW A LIAR PASSES IT, stated before what checks it: VERIFYING ONCE AT SET TIME. Every set-time arm is green over a
 * plane that never looks again. So L1–L4 change the served file AFTER a `verified` verdict, show that the public read
 * has not moved on its own, drive the store's reconciling alarm, and demand that the ALARM's re-check moves the verdict
 * to `mismatched` and takes the domain off the public read — and that a fixed file brings it back.
 *
 * WHAT THIS CANNOT SEE, stated: a real DNS name and a real TLS fetch (the outbound fetch is Miniflare's
 * `outboundService`, which answers by host exactly as the suite scripts it); the setup page and the member UI, which
 * do not show either value yet (UI's row, next); the alarm as workerd fires it on its own clock (onAlarm is driven
 * with a virtual `now`, `scheduler.test.mjs`'s method); and an instance reached at two addresses (the address a claim
 * binds is the one the administrator's session reached, stamped at the set act).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
/* The control driver points this at an ARMED copy of src/. */
const SRC_DIR = process.env.GROUP_IDENTITY_SRC || join(PLANE, "src");
const IDX = join(SRC_DIR, "index.mjs");
const STORE_SRC = readFileSync(join(SRC_DIR, "store.mjs"), "latin1");
const CHECKS = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const ROWS = CHECKS.INSTANCE_GROUP_CHECKS;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const SLUG = "oak-town";
const ADM = "adm-rec164-identity-root", MEM = "mem-rec164-identity-member", PRB = "prb-rec164-identity-probe";
const BEARERS = { admin: ADM, member: MEM, probe: PRB };
const ORIGIN = "http://x";                       /* the address every request below reaches, so the address stamped */
const NAME1 = "Oak Town Civic Watch", NAME2 = "Oak Town Civic Watch (Budget Desk)";
const S = "&store=scratch";                      /* D-325: named on EVERY call */
const E = encodeURIComponent;
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

/* THE SCRIPTED WEB: host -> { status, body }. Changed in place by the liar arms. Every fetch is logged. */
const WEB = new Map();
const FETCHED = [];
const fileNaming = (instance, group) => JSON.stringify({ instance, group });
WEB.set("oaktown.example", { status: 200, body: fileNaming(ORIGIN, SLUG) });
WEB.set("nofile.example", { status: 404, body: "not found" });
WEB.set("broken.example", { status: 503, body: "unavailable" });
WEB.set("impostor.example", { status: 200, body: fileNaming("https://another-instance.workers.dev", SLUG) });
WEB.set("othergroup.example", { status: 200, body: fileNaming(ORIGIN, "some-other-group") });
/* OVER-STRICTNESS: a correct file in a spelling the verifier did not have to anticipate — an upper-case origin with a
   trailing slash, extra keys, a key order reversed. It must verify. */
WEB.set("spelled.example", { status: 200, body: JSON.stringify({ note: "published by the group", group: SLUG,
                                                                  instance: "HTTP://X/" }) });

const live = [];
const planeAt = (name) => {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test",
                GOVERNOR_APPETITE_PER_MIN: "60000", ...(name === null ? {} : { INSTANCE_NAME: name }) },
    outboundService(request) {
      const u = new URL(request.url);
      FETCHED.push(`${u.host}${u.pathname}`);
      const page = u.pathname === "/.well-known/civicos-group.json" ? WEB.get(u.host) : null;
      return page ? new Response(page.body, { status: page.status, headers: { "content-type": "application/json" } })
                  : new Response("no such page", { status: 404 });
    },
  });
  live.push(mf);
  return mf;
};

const mf = planeAt(SLUG);
const api = async (m, q, body) => {
  const r = await m.dispatchFetch(`${ORIGIN}/api/?${q}`, body === undefined ? undefined
    : { method: "POST", body: JSON.stringify(body) });
  let j = null;
  try { j = JSON.parse(await r.text()); } catch { j = null; }
  return { status: r.status, j };
};
const POST = async (q, body, m = mf) => rP((await api(m, q, body ?? {})).j);
const pub = async (m = mf) => (await api(m, `op=groupidentity${S}`)).j;
const full = async (m = mf) => rP((await api(m, `op=groupidentity&token=${ADM}${S}`)).j);

const enrol = async (m, memberId, role, capabilities) => {
  for (const st of ["", S]) {
    const add = await POST(`op=memberadd&token=${ADM}${st}`, { memberId, cover: `cover for ${memberId}`, role, capabilities }, m);
    if (!add?.invite) throw new Error(`memberadd ${memberId}${st}: ${JSON.stringify(add)}`);
    const en = await POST(`op=enroll${st}`, { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-164` }, m);
    if (!en?.ok) throw new Error(`enroll ${memberId}${st}: ${JSON.stringify(en)}`);
  }
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-164` }, m);
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return `token=${lg.token}`;
};

try {
  const RUTH = await enrol(mf, "ruth", "admin", ["contribute", "publish"]);
  const GUS = await enrol(mf, "gus", "admin", ["contribute", "publish"]);
  const CAI = await enrol(mf, "cai", "member", ["contribute"]);

  console.log("\n--- 0. the fixture, floored ---");
  const p0 = await pub();
  t("F0: the scratch store records the installer's slug, and a stranger's first read shows it with no name and no domain",
    [p0?.ok, p0?.result?.group, p0?.result?.display_name, p0?.result?.domain], [true, SLUG, null, null]);
  t("F1: the four canned rows exist, each a C-64 check with a sentence of 20+ words",
    ["GROUP_IDENTITY_NEEDS_SESSION", "GROUP_IDENTITY_NOT_ADMIN", "GROUP_DISPLAY_NAME_MALFORMED", "GROUP_DOMAIN_MALFORMED"]
      .map((c) => [ROWS[c]?.check?.startsWith("C-64."), (ROWS[c]?.translation || "").split(/\s+/).length >= 20]),
    [[true, true], [true, true], [true, true], [true, true]]);

  console.log("\n--- A. who may set: an administrator's session, and the server names them ---");
  for (const [cls, tok] of Object.entries(BEARERS)) {
    for (const op of ["groupnameset", "groupdomainset"]) {
      const a = await POST(`op=${op}&token=${tok}${S}&by=ruth`, { name: NAME1, domain: "oaktown.example", by: "ruth" });
      t(`A1: op=${op} with the operator's ${cls}-class bearer token, naming ruth as \`by\`, is refused by name with C-64.4's sentence`,
        [a?.reason, a?.check, a?.tokenClass, a?.translation], ["GROUP_IDENTITY_NEEDS_SESSION", "C-64.4", cls,
         ROWS.GROUP_IDENTITY_NEEDS_SESSION?.translation]);
    }
  }
  for (const op of ["groupnameset", "groupdomainset"]) {
    const a = await POST(`op=${op}&${CAI}${S}&by=ruth`, { name: NAME1, domain: "oaktown.example", by: "ruth" });
    t(`A2: op=${op} from cai's session, an ordinary member naming the administrator ruth as \`by\` in the query AND the body, `
      + "is refused as CAI — the caller-supplied `by` is not honoured",
      [a?.reason, a?.check, a?.by], ["GROUP_IDENTITY_NOT_ADMIN", "C-64.5", "cai"]);
  }
  const f0 = await full();
  t("A2b: and nothing a bearer or cai asked for landed — both histories are empty and no domain was ever fetched",
    [f0?.display_name_history, f0?.domain_history, f0?.domain_checks, FETCHED.length], [[], [], [], 0]);

  const n1 = await POST(`op=groupnameset&${RUTH}${S}&by=gus`, { name: `  ${NAME1}  `, by: "gus" });
  t("A3: ruth's session sets the display name, naming gus as `by` — and the record names RUTH, from the session",
    [n1?.ok, n1?.display_name, n1?.set_by, n1?.history?.map((h) => h.set_by)], [true, NAME1, "ruth", ["ruth"]]);
  const n2 = await POST(`op=groupnameset&${GUS}${S}`, { name: NAME2 });
  t("A4: gus revises it, and the history keeps BOTH values, each dated and each with its setter, in order",
    [n2?.ok, n2?.history?.map((h) => [h.value, h.set_by, /^\d{4}-\d\d-\d\dT/.test(h.set_at)])],
    [true, [[NAME1, "ruth", true], [NAME2, "gus", true]]]);
  const bad = await POST(`op=groupnameset&${RUTH}${S}`, { name: "line one\nline two" });
  const empty = await POST(`op=groupnameset&${RUTH}${S}`, { name: "   " });
  const long = await POST(`op=groupnameset&${RUTH}${S}`, { name: "x".repeat(121) });
  t("A5: a name on two lines, an empty one and one of 121 characters are each refused C-64.6, and nothing is added",
    [bad?.check, empty?.check, long?.check, (await full())?.display_name_history?.length], ["C-64.6", "C-64.6", "C-64.6", 2]);

  console.log("\n--- P. the public read: the name beside the slug, never instead of it ---");
  const p1 = await pub();
  t("P1: a stranger reads the slug and the CURRENT display name, and no domain (none claimed)",
    [p1?.result?.group, p1?.result?.display_name, p1?.result?.domain], [SLUG, NAME2, null]);
  t("P2: the stranger's answer carries no history, no setter and no claim — its exact key set",
    Object.keys(p1?.result || {}).sort(), ["display_name", "domain", "domain_verified_at", "group", "ok"]);
  /* A store recording NO slug: the name is set and then held back from the public, because §7 point 2 shows it WITH
     the slug and never instead of it. */
  const bare = planeAt(null);
  const RUTH_BARE = await enrol(bare, "ruth", "admin", ["contribute"]);
  const nb = await POST(`op=groupnameset&${RUTH_BARE}${S}`, { name: NAME1 }, bare);
  const pb = await pub(bare);
  t("P3: on a store recording no slug the name is recorded, and a stranger is NOT shown it — a name alone is not an identity",
    [nb?.ok, pb?.result?.group, pb?.result?.display_name, typeof pb?.result?.detail], [true, null, null, "string"]);

  console.log("\n--- B. the display name is in no signed bytes ---");
  const tx = await POST(`op=testify&${RUTH}${S}`, { words: "On 20 September the clerk read the amended agenda aloud "
    + "before the vote. I was in the second row.", observedAt: "2026-09-20", title: "The amended agenda" });
  const listed = rP((await api(mf, `op=list&token=${ADM}${S}`)).j);
  const rows = Array.isArray(listed) ? listed : (listed?.bundles ?? []);
  const texts = [];
  for (const r of rows) {
    const img = rP((await api(mf, `op=image&token=${ADM}&id=${E(r.bundle_id)}${S}`)).j);
    for (const v of Object.values(img || {})) if (typeof v === "string") texts.push(v);
      else if (v && typeof v.text === "string") texts.push(v.text);
  }
  console.log(`  population: ${rows.length} bundle(s), ${texts.length} text file(s)`);
  t("B1: after the plane composed a document under the display name, its bytes name the slug, and NO text the store "
    + "holds names either display name — a population over every file, floored so an empty store cannot pass it",
    [tx?.ok, texts.length > 0, texts.some((x) => x.includes(`group: ${SLUG}`)),
     texts.filter((x) => x.includes("Oak Town Civic Watch")).length], [true, true, true, 0]);
  /* The block's bounds are ASCII anchors: this file is read as latin1 (store.mjs holds a stray byte), so a banner
     with an em dash never matches — which the first run of this arm measured, floored at blockAt. */
  const blockAt = STORE_SRC.indexOf("static GROUP_DISPLAY_NAME_MAX");
  const blockEnd = STORE_SRC.indexOf("/* REC-175: THE ONE COMPUTATION", blockAt);
  const lines = STORE_SRC.split("\n");
  let off = 0; const inside = [], outside = [];
  for (const [i, l] of lines.entries()) {
    if (/group_identity_history/.test(l) && !/^\s*(\*|\/\*|--)/.test(l))
      (off > blockAt && off < blockEnd ? inside : outside).push(i + 1);
    off += l.length + 1;
  }
  console.log(`  census: ${inside.length} statement line(s) inside the block, ${outside.length} outside`);
  t("B2: every statement in store.mjs that reads the identity history sits inside the REC-164 block, so no stamp, "
    + "composer or signer reads the display name (a census of the one table that holds it)",
    [blockAt > 0, blockEnd > blockAt, inside.length >= 3, outside], [true, true, true, []]);

  console.log("\n--- D. a domain is a claim, shown only while verified ---");
  const d1 = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "nofile.example" });
  t("D1: a domain serving no well-known file reads `absent`, and a stranger is not shown it",
    [d1?.ok, d1?.check?.verdict, d1?.check?.status, (await pub())?.result?.domain], [true, "absent", 404, null]);
  const d2 = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "broken.example" });
  t("D2: a domain answering 503 is `undetermined` — neither the file nor its absence — and a stranger is not shown it",
    [d2?.check?.verdict, (await pub())?.result?.domain], ["undetermined", null]);
  const d3 = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "impostor.example" });
  t("D3: a well-known file naming ANOTHER instance reads `mismatched`, and a stranger is not shown the domain",
    [d3?.check?.verdict, (await pub())?.result?.domain], ["mismatched", null]);
  const d3b = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "othergroup.example" });
  t("D3b: a file naming this instance but ANOTHER group reads `mismatched` too, and is not shown",
    [d3b?.check?.verdict, (await pub())?.result?.domain], ["mismatched", null]);
  const d4 = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "OakTown.Example." });
  const p4 = await pub();
  t("D4: a file naming this instance's address and slug reads `verified` — the domain normalised, the setter the session's",
    [d4?.ok, d4?.domain, d4?.set_by, d4?.instance_address, d4?.check?.verdict],
    [true, "oaktown.example", "ruth", ORIGIN, "verified"]);
  t("D5: and ONLY NOW a stranger is shown the domain, dated by its verdict",
    [p4?.result?.domain, typeof p4?.result?.domain_verified_at], ["oaktown.example", "string"]);
  const gov = rP((await api(mf, `op=governorstate&token=${ADM}${S}&host=oaktown.example`)).j);
  t("D6: the fetch went through the per-host governor — the host's row counts a grant",
    (gov?.hosts?.[0]?.granted ?? 0) >= 1, true);
  const f1 = await full();
  t("D7: a credentialed reader sees the claim, its latest verdict and every claim in order, each dated with its setter",
    [f1?.domain_claim?.domain, f1?.domain_claim?.latest?.verdict,
     f1?.domain_history?.map((h) => [h.value, h.set_by])],
    ["oaktown.example", "verified", [["nofile.example", "ruth"], ["broken.example", "ruth"],
     ["impostor.example", "ruth"], ["othergroup.example", "ruth"], ["oaktown.example", "ruth"]]]);
  const dm = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "https://oaktown.example/path" });
  const dp = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "10.0.0.1" });
  t("D8: a URL and an IP address are refused C-64.7, and the claim stays where it was",
    [dm?.check, dp?.check, (await full())?.domain_claim?.domain], ["C-64.7", "C-64.7", "oaktown.example"]);

  console.log("\n--- L. THE LIAR: verifying once at set time. The file changes; only the ALARM may move the verdict ---");
  const ns = mf.getDurableObjectNamespace("STORE");
  const scratch = (await ns).get((await ns).idFromName("scratch"));
  WEB.set("oaktown.example", { status: 200, body: fileNaming("https://another-instance.workers.dev", SLUG) });
  t("L1: the domain's file now names another instance, and until something re-checks, the last verdict stands",
    (await pub())?.result?.domain, "oaktown.example");
  const DAY = 86_400_000;
  const fired = await scratch.onAlarm(Date.now() + 2 * DAY);
  t("L2: the reconciling alarm re-checks the claim, in its own named slot, and reads `mismatched`",
    [fired?.groupdomain?.domain, fired?.groupdomain?.verdict, fired?.groupdomain?.trigger],
    ["oaktown.example", "mismatched", "alarm"]);
  t("L3: and the public read no longer shows the domain", (await pub())?.result?.domain, null);
  WEB.set("oaktown.example", { status: 200, body: fileNaming(ORIGIN, SLUG) });
  const fired2 = await scratch.onAlarm(Date.now() + 4 * DAY);
  t("L4: the file fixed, the next alarm reads `verified` and the domain is shown again",
    [fired2?.groupdomain?.verdict, (await pub())?.result?.domain], ["verified", "oaktown.example"]);

  console.log("\n--- O. over-strictness: a correct file in a spelling nobody anticipated ---");
  const o1 = await POST(`op=groupdomainset&${RUTH}${S}`, { domain: "spelled.example" });
  t("O1: an upper-case origin with a trailing slash, extra keys and another key order verify, and the domain is shown",
    [o1?.check?.verdict, (await pub())?.result?.domain], ["verified", "spelled.example"]);
} catch (e) {
  console.log(`  FAIL  the suite reached no foot: ${e && e.stack || e}`);
  fail++;
} finally {
  for (const m of live) await m.dispose();
}
console.log(`\ngroup-identity: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

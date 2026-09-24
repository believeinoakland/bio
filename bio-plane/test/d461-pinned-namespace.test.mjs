/* NEGATIVE CONTROL: RE-RUN 2026-09-24 by CONDUCT #19 (c19-batch11) after `groupidentity` joined the exemption list (driver re-anchored): 4/4 arms as declared — A 41/59, B 53/59, C 45/59, D 54/59 — each restore sha256+cmp identical. (run 2026-09-24, D-461) `node test/nc-d461.mjs` — four arms, each ALONE against a uniquely-named pristine copy of `src/index.mjs`, restore verified by sha256 AND byte comparison. (A) THE BRIEF'S ARM, accept and ignore `store=scratch` again (the gate answers nothing) -> FAIL 38/55, at `no credential · op=knock · store=scratch -> 400 NAMESPACE_PINNED` and at `witness: after the refused knock the REAL record's counters did not move` BY NAME — AS DECLARED; (B) a partial fix, `knock` exempted -> FAIL 49/55 at the knock assertion, the witness and the exemption-list pin — AS DECLARED; (C) OVER-STRICTNESS, the gate refuses any named store, `bio` included -> FAIL 42/55 at `op=verify · store=bio -> not NAMESPACE_PINNED` — AS DECLARED; (D) OVER-STRICTNESS, the exemption list emptied -> FAIL 51/55 at `exempt · op=instancegroup · store=scratch -> answered from scratch` — AS DECLARED. 4/4 as declared, index.mjs restored to e9dc4c9d4b27. */
/* D-461 · A PUBLIC OP THAT ALWAYS ANSWERS FROM `bio` REFUSES `store=scratch` BY NAME (C-78.2, IC-250).
 *
 * THE DEFECT. D-456 refused a namespace that does not exist. `scratch` DOES exist, so it passed that gate — and twelve
 * of the fifteen unauthenticated ops then answered from the one stub the unauthenticated block opens on `bio`, whatever
 * `store=` said. Three of them are MUTATING. `op=knock&store=scratch` filed a knock in the REAL record's inbox and
 * answered `ok`, so a live verification naming scratch on every call (CLAUDE.md §5, D-325) wrote production.
 *
 * WHAT THIS SUITE ASSERTS, and how a liar would pass a weaker one:
 *   1. the pinned set is ENUMERATED FROM THE OPS TABLE at run time (every `classes: null` op), never typed here, so a
 *      public op added later is driven without anyone remembering to add it;
 *   2. every op in it but the three that address scratch answers `store=scratch` with 400 NAMESPACE_PINNED, judged by
 *      code, C-number and the row's own sentence (imported, never typed);
 *   3. THE WITNESS: the record's counters in BOTH namespaces — op=stats, the inbox, the member roster, and the R2 keys
 *      under `bio/inbox/` — read before and after, unmoved; and the witness is shown to SEE a knock that does land in
 *      `bio`, because an unmoved counter that could not have moved is no evidence;
 *   4. OVER-STRICTNESS: every pinned op answers `store=bio` and an absent `store=` without this refusal; the three
 *      exempt ops really do answer from scratch (proved by a scratch-only invitation that `bio` cannot see); a gated
 *      op naming scratch still answers from scratch.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NAMESPACE_CHECKS } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d461", MEMBER_TOKEN: "mem-d461", PROBE_TOKEN: "prb-d461",
              DAEMON_TOKEN: "dmn-d461", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d461",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response("no outbound in this suite", { status: 599 }); },
});
MF = mf;

const call = async (q, body, method) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? { method: method ?? "GET" } : { method: method ?? "POST", body: JSON.stringify(body) });
  let j = null; try { j = await res.json(); } catch { j = null; }
  return { status: res.status, body: j };
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

try {

/* ------------------------------------------------------------------ the row */
const ROW = NAMESPACE_CHECKS.NAMESPACE_PINNED;
console.log(`\n--- C-78 · NAMESPACE_CHECKS: ${Object.keys(NAMESPACE_CHECKS).length} row(s) ---`);
t("the family holds NAMESPACE_PINNED with check C-78.2 and a sentence of at least eight words",
  [!!ROW, ROW?.check, (ROW?.translation ?? "").trim().split(/\s+/).length >= 8], [true, "C-78.2", true]);

/* ------------------------------------------------------------------ the corpus, from the OPS table */
const src = readFileSync(SRC("index.mjs"), "utf8");
const opsStart = src.indexOf("const OPS = {");
const PUBLIC = [...src.slice(opsStart).matchAll(/^\s+(\w+):\s*\{\s*classes:\s*null\b[^}]*mutating:\s*(true|false)/gm)]
  .map((m) => ({ op: m[1], mutating: m[2] === "true" }));
/* CORRECTED 2026-09-24 by CONDUCT #19 (c19-batch11): + `groupidentity`. REC-164's op reads `store=` itself,
   op=instancegroup's way, and d456-namespace-scope drives it answering from scratch; the two suites met only at the
   union, where this list's three pinned it and d456 went red. The old list was right for the tree it was written on. */
const EXEMPT = ["invitelook", "enroll", "instancegroup", "groupidentity"];
const PINNED = PUBLIC.filter((p) => !EXEMPT.includes(p.op));
console.log(`  classes:null ops read from the OPS table: ${PUBLIC.length} — ${PUBLIC.map((p) => p.op + (p.mutating ? "*" : "")).join(", ")}`);
console.log(`  pinned (every one but ${EXEMPT.join(", ")}): ${PINNED.length}`);
t("the OPS table was found and read (a sweep over nothing is not a sweep)", opsStart > 0 && PUBLIC.length >= 15, true);
t("every exempt op is a classes:null op in the table (an exemption naming nothing is a typo)",
  EXEMPT.filter((e) => !PUBLIC.some((p) => p.op === e)), []);
t("the pinned corpus holds the three mutating public ops the defect named (knock, claim, reviewcomment)",
  ["knock", "claim", "reviewcomment"].filter((o) => !PINNED.some((p) => p.op === o && p.mutating)), []);

/* ------------------------------------------------------------------ fixture: an invitation in each namespace */
const INV_BIO = rP((await call("op=memberadd&token=adm-d461", { memberId: "zed", cover: "cover for zed", role: "admin", capabilities: ["contribute"] })).body)?.invite;
const INV_SCR = rP((await call("op=memberadd&token=adm-d461&store=scratch", { memberId: "yan", cover: "cover for yan", role: "admin", capabilities: ["contribute"] })).body)?.invite;
t("fixture: an invitation exists in bio and a different one in scratch",
  [typeof INV_BIO, typeof INV_SCR, INV_BIO !== INV_SCR], ["string", "string", true]);

/* ------------------------------------------------------------------ the witness */
const r2Keys = async (prefix) => {
  const b = await mf.getR2Bucket("CAPTURES");
  return (await b.list({ prefix })).objects.map((o) => o.key).sort();
};
const counters = async (store) => {
  const s = rP((await call(`op=stats&token=adm-d461&store=${store}`)).body);
  const inbox = rP((await call(`op=inbox&token=adm-d461&store=${store}`)).body)?.inbox;
  const m = rP((await call(`op=memberlist&token=adm-d461&store=${store}`)).body);
  return { stats: s, inbox: Array.isArray(inbox) ? inbox.length : `unreadable:${JSON.stringify(inbox)}`,
           members: Array.isArray(m) ? m.length : (m?.members?.length ?? `unreadable:${JSON.stringify(m)}`),
           r2: await r2Keys(`${store}/inbox/`) };
};
const bioBefore = await counters("bio"), scrBefore = await counters("scratch");
t("witness: stats, inbox and roster are readable in both namespaces (a witness that cannot read is no witness)",
  [typeof bioBefore.stats, typeof bioBefore.inbox, typeof bioBefore.members, typeof scrBefore.inbox],
  ["object", "number", "number", "number"]);

/* ------------------------------------------------------------------ 1 · the accepts-when, first and by itself */
console.log("\n--- 1 · op=knock&store=scratch is refused by name and the record does not move ---");
const KNOCK = { contentText: "D-461: a knock a live verification believes is in scratch", note: "d461" };
{
  const r = await call("op=knock&store=scratch", KNOCK);
  const b = r.body || {};
  t("no credential · op=knock · store=scratch -> 400 NAMESPACE_PINNED (C-78.2) with the row's sentence",
    [r.status, b.ok, b.reason, b.code, b.check, b.translation === ROW?.translation, b.op, b.asked, b.pinned],
    [400, false, "NAMESPACE_PINNED", "NAMESPACE_PINNED", "C-78.2", true, "knock", "scratch", "bio"]);
  t("witness: after the refused knock the REAL record's counters did not move",
    JSON.stringify(await counters("bio")), JSON.stringify(bioBefore));
}

/* ------------------------------------------------------------------ 2 · every pinned op, and a credential too */
console.log(`\n--- 2 · every pinned public op refuses store=scratch by name: ${PINNED.length} ops ---`);
let refused = 0;
for (const p of PINNED) {
  const q = `op=${p.op}&store=scratch${p.op === "verify" || p.op === "publishedbytes" ? `&sha256=${"a".repeat(64)}` : ""}`;
  const r = p.mutating ? await call(q, p.op === "knock" ? KNOCK : { password: "x", comment: "d461" }) : await call(q);
  const b = r.body || {};
  t(`no credential · ${p.mutating ? "mutating" : "read"} op=${p.op} · store=scratch -> 400 NAMESPACE_PINNED`,
    [r.status, b.reason, b.check, b.translation === ROW?.translation, b.op], [400, "NAMESPACE_PINNED", "C-78.2", true, p.op]);
  if (b.reason === "NAMESPACE_PINNED") refused++;
}
t(`the refused corpus is the whole pinned set (${PINNED.length}), never empty`, [refused, refused >= 12], [PINNED.length, true]);
{
  const r = await call("op=publishedmanifest&token=adm-d461&store=scratch");
  t("admin token · op=publishedmanifest · store=scratch -> NAMESPACE_PINNED (the refusal is the op's, not the class's)",
    [r.status, r.body?.reason], [400, "NAMESPACE_PINNED"]);
}
const bioAfter = await counters("bio"), scrAfter = await counters("scratch");
t("witness: the REAL record's counters did not move across every refused call", JSON.stringify(bioAfter), JSON.stringify(bioBefore));
t("witness: scratch's counters did not move either", JSON.stringify(scrAfter), JSON.stringify(scrBefore));

/* ------------------------------------------------------------------ 3 · over-strictness */
console.log("\n--- 3 · bio, absent, the exempt ops and the gated ops answer as they did before D-461 ---");
for (const p of PINNED) {
  for (const store of ["bio", undefined]) {
    const q = `op=${p.op}${store ? `&store=${store}` : ""}${p.op === "verify" || p.op === "publishedbytes" ? `&sha256=${"a".repeat(64)}` : ""}`;
    /* knock is left out here: a real knock is the witness's own sensitivity arm below */
    if (p.op === "knock") continue;
    const r = p.mutating ? await call(q, { password: "x", comment: "d461" }) : await call(q);
    t(`op=${p.op} · store=${store ?? "(absent)"} -> not NAMESPACE_PINNED`, r.body?.reason === "NAMESPACE_PINNED", false);
  }
}
{
  const ig = await call("op=instancegroup&store=scratch");
  t("exempt · op=instancegroup · store=scratch -> answered from scratch", [ig.status, ig.body?.store], [200, "scratch"]);
  const gi = await call("op=groupidentity&store=scratch");
  t("exempt · op=groupidentity · store=scratch -> answered from scratch", [gi.status, gi.body?.store], [200, "scratch"]);
  const lookScr = rP((await call(`op=invitelook&store=scratch`, { invite: INV_SCR })).body);
  const lookBio = rP((await call(`op=invitelook`, { invite: INV_SCR })).body);
  t("exempt · op=invitelook · store=scratch finds the scratch-only invitation, and bio does not (it really addresses scratch)",
    [lookScr?.ok, lookBio?.ok === true], [true, false]);
  const en = rP((await call("op=enroll&store=scratch", { invite: INV_SCR, handle: "yan", password: "yan-passphrase-1" })).body);
  t("exempt · op=enroll · store=scratch enrols the scratch invitation", en?.ok, true);
  const who = await call("op=whoami&token=adm-d461&store=scratch");
  t("gated · admin whoami · store=scratch -> ok, store scratch (scopeFor's, untouched)", [who.status, who.body?.store], [200, "scratch"]);
}

/* ------------------------------------------------------------------ 4 · the witness can see a knock land */
console.log("\n--- 4 · the witness is sensitive: a knock with store=bio DOES move the record ---");
{
  const before = await counters("bio");
  const k = await call("op=knock&store=bio", KNOCK);
  t("op=knock · store=bio -> ok (the pinned op still works where it lives)", [k.status, k.body?.ok], [200, true]);
  const after = await counters("bio");
  t("and bio's inbox moved by exactly one (so section 1's unmoved witness could have moved)",
    after.inbox - before.inbox, 1);
  const k2 = await call("op=knock", { contentText: "D-461: a knock with store absent", note: "d461" });
  t("op=knock · store absent -> ok, unchanged", [k2.status, k2.body?.ok], [200, true]);
}

/* ------------------------------------------------------------------ 5 · structure */
console.log("\n--- 5 · the gate's place ---");
{
  const g = src.indexOf("const pinnedNamespace = pinnedNamespaceGate(url, op, spec);");
  t("the pinned gate runs after D-456's gate and before the unauthenticated block and any credential is classified",
    [g > src.indexOf("const unknownNamespace = namespaceGate(url);"), g < src.indexOf("if (spec.classes === null) {"),
     g < src.indexOf("let cls = await classify(")], [true, true, true]);
  const ex = src.match(/const SCRATCH_ADDRESSING_PUBLIC_OPS = Object\.freeze\((\[[^\]]*\])\)/);
  t("the plane's exemption list is exactly the four this suite proved address scratch",
    ex ? JSON.parse(ex[1]).sort() : null, [...EXEMPT].sort());
}

} finally {
  await mf.dispose();
}

console.log(`\nd461-pinned-namespace: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

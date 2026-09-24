/* NEGATIVE CONTROL: (run 2026-09-23, D-456) `node test/nc-d456.mjs` — four arms, each ALONE against a uniquely-named pristine copy of `src/index.mjs`, restore verified by sha256 AND byte comparison. (A) THE BRIEF'S ARM, restore the fall-through to `bio` (gate answers nothing, `scopeFor` defaults again) -> FAIL 31/76, at `admin · read op=stats · store="biosmoke-pdf" -> 400 NAMESPACE_UNKNOWN` and at `witness: the REAL record's counters did not move` BY NAME — AS DECLARED; (B) the front-door gate alone off -> FAIL 32/76 at `member · mutating op=promote · store="Scratch"` and `none · mutating op=enroll` — AS DECLARED; (C) `scopeFor`'s own strictness alone reverted -> GREEN 76/76, DECLARED GREEN: every op meets the gate first, so that refusal is depth no op reaches — recorded, not smoothed; (D) OVER-STRICTNESS, the gate refuses `bio` too -> FAIL 69/76 at `admin · whoami · store=bio -> ok, store bio` — AS DECLARED. 4/4 as declared, index.mjs restored to 520acec01ad6. */
/* D-456 · A NAMESPACE THAT DOES NOT EXIST IS REFUSED BY NAME, FOR EVERY CALLER (C-78.1, IC-237).
 *
 * THE DEFECT. `scopeFor` confined only the PROBE class and answered `bio` for any other `store=` value, and the
 * unauthenticated path (the invitation ops, op=instancegroup) did the same. So `op=stats&store=biosmoke-pdf` answered
 * `store:"bio"`: a brief or a typo naming a namespace that does not exist addressed THE REAL RECORD, and a live
 * verification whose whole no-write guarantee is naming its namespace (CLAUDE.md §5, D-325) wrote production.
 *
 * WHAT THIS SUITE ASSERTS, and how a liar would pass a weaker one: a refusal on ONE op or ONE class only. So every
 * class — admin, member, probe, daemon, an `ai` credential, a signed-in session, and no credential at all — is driven
 * with a READ op AND a MUTATING op, for three spellings of a namespace that does not exist (`biosmoke-pdf`, the case
 * variant `Scratch`, an empty `store=`), and every refusal is judged by code, C-number and the canned translation
 * compared to the ROW (imported, never typed here). Then the WITNESS: the record's counters in BOTH namespaces, read
 * before and after the refused calls, must not have moved — a refusal that still wrote would pass a code assertion.
 *
 * AND THE OTHER DIRECTION (over-strictness): `bio`, `scratch` and an ABSENT `store=` answer exactly as they did
 * before D-456, per class, read from the code at the time of writing — absent is probe → scratch and every other
 * class → bio; `store=bio` confines probe (SCOPE_REFUSED, unchanged); `store=scratch` is scratch for everybody. A
 * mutating call naming `scratch` must still WRITE, and write in scratch only.
 *
 * AND THE SWEEP. Every site in `src/index.mjs` that reads the `store` parameter is listed from the source at run time
 * and must be one this suite knows the answer for; a new reader appears here BY NAME rather than silently defaulting.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { NAMESPACE_CHECKS, ADMISSION_CHECKS } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL(`../src/${f}`, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d456", MEMBER_TOKEN: "mem-d456", PROBE_TOKEN: "prb-d456",
              DAEMON_TOKEN: "dmn-d456", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d456",
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

/* ------------------------------------------------------------------ the family, floored */
const ROW = NAMESPACE_CHECKS.NAMESPACE_UNKNOWN;
console.log(`\n--- C-78 · NAMESPACE_CHECKS: ${Object.keys(NAMESPACE_CHECKS).length} row(s) ---`);
t("the family holds NAMESPACE_UNKNOWN with a C-78 check and a sentence of at least eight words",
  [!!ROW, /^C-78\.\d+$/.test(ROW?.check ?? ""), (ROW?.translation ?? "").trim().split(/\s+/).length >= 8],
  [true, true, true]);

/* ------------------------------------------------------------------ fixture: every class */
const enrol = async (memberId, role, capabilities) => {
  const add = rP((await call("op=memberadd&token=adm-d456", { memberId, cover: `cover for ${memberId}`, role, capabilities })).body);
  const en = rP((await call("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` })).body);
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP((await call("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` })).body);
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute"]);
const ANNA = await enrol("anna", "member", ["contribute"]);
const mintOut = rP((await call(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "d456-agent", principalKind: "member", principalMember: "ruth",
  taskScope: "namespace-probe", writes: ["promote"], note: "D-456: drives the namespace gate as an ai credential" })).body);
const AIK = mintOut?.token;
t("fixture: an ai credential was minted (aik-…)", typeof AIK === "string" && /^aik-[0-9a-f]{64}$/.test(AIK), true);
/* a pending invitation, so the unauthenticated invitation read has something real to find */
const INVITE = rP((await call("op=memberadd&token=adm-d456", { memberId: "zed", cover: "cover for zed", role: "member", capabilities: [] })).body)?.invite;
t("fixture: an invitation exists for the public path to read", typeof INVITE === "string" && INVITE.length > 0, true);

/* Every caller, and for each a READ op and a MUTATING op it is admitted to (so a refusal cannot be the class ACL). */
let seq = 0;
const bundleMd = (id) => ["---", `id: ${id}`, "object_type: note", "schema: note@1", `title: "${id}"`,
  "current_state: collected", "prior_state: null", 'created: "2026-07-01T00:00:00Z"',
  'last_updated: "2026-07-02T00:00:00Z"', "group: believe-in-oakland", "references: []", "state_history: []",
  "---", "", "## Notes", "", "d456"].join("\n");
const promoteBody = () => {
  const id = `NOTE-2026-9456-d456-${++seq}`, text = bundleMd(id);
  return { bundleId: id, base: null, snapKey: `${id}-${String(seq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "note", group: "believe-in-oakland", title: id, current_state: "collected",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" } };
};
const CALLERS = [
  { cls: "admin",   tok: "adm-d456", read: "stats", write: "promote", home: "bio" },
  { cls: "member",  tok: "mem-d456", read: "stats", write: "promote", home: "bio" },
  { cls: "probe",   tok: "prb-d456", read: "stats", write: "promote", home: "scratch" },
  { cls: "daemon",  tok: "dmn-d456", read: "monitor", write: "acquire", home: "bio" },
  { cls: "ai",      tok: AIK,        read: "stats", write: "promote", home: "bio" },
  { cls: "session", tok: ANNA,       read: "stats", write: "promote", home: "bio" },
  { cls: "none",    tok: null,       read: "invitelook", write: "enroll", home: "bio" },
];
const q = (c, op, store) => `op=${op}${c.tok ? `&token=${encodeURIComponent(c.tok)}` : ""}${store === undefined ? "" : `&store=${encodeURIComponent(store)}`}${op === "invitelook" ? `&invite=${encodeURIComponent(INVITE)}` : ""}`;
const writeBody = (c) => c.write === "promote" ? promoteBody()
  : c.write === "enroll" ? { invite: INVITE, handle: "zed", password: "zed-passphrase-1" }
  : { bundleId: "NOTE-2026-9456-none", url: "https://example.org/x.pdf" };

/* ------------------------------------------------------------------ the witness */
const counters = async (store) => {
  const r = rP((await call(`op=stats&token=adm-d456&store=${store}`)).body);
  const m = rP((await call(`op=memberlist&token=adm-d456&store=${store}`)).body);
  return { stats: r, members: Array.isArray(m) ? m.length : (m?.members?.length ?? JSON.stringify(m)) };
};
const bioBefore = await counters("bio"), scratchBefore = await counters("scratch");
t("witness: op=stats answers an object in both namespaces (a witness that cannot read is no witness)",
  [typeof bioBefore.stats, typeof scratchBefore.stats], ["object", "object"]);
console.log(`  (witness bio: ${JSON.stringify(bioBefore).slice(0, 200)}…)`);

/* ------------------------------------------------------------------ 1 · refused, by name, for every class */
const UNKNOWN = ["biosmoke-pdf", "Scratch", ""];
console.log(`\n--- 1 · a namespace that does not exist is refused by name: ${CALLERS.length} callers × 2 ops × ${UNKNOWN.length} spellings ---`);
let refusedCount = 0;
for (const c of CALLERS) {
  for (const store of UNKNOWN) {
    for (const [kind, op] of [["read", c.read], ["mutating", c.write]]) {
      const r = kind === "read" ? await call(q(c, op, store)) : await call(q(c, op, store), writeBody(c));
      const b = r.body || {};
      t(`${c.cls} · ${kind} op=${op} · store=${JSON.stringify(store)} -> 400 NAMESPACE_UNKNOWN (C-78.1) with the row's sentence`,
        [r.status, b.ok, b.reason, b.code, b.check, b.translation === ROW.translation, b.asked, b.namespaces],
        [400, false, "NAMESPACE_UNKNOWN", "NAMESPACE_UNKNOWN", ROW.check, true, store, ["bio", "scratch"]]);
      refusedCount++;
    }
  }
}
t(`the refused corpus is the full cross product (${CALLERS.length * 2 * UNKNOWN.length}), never empty`, refusedCount, CALLERS.length * 2 * UNKNOWN.length);

/* op=instancegroup: the one public read that picked a namespace itself */
{
  const r = await call("op=instancegroup&store=biosmoke-pdf");
  t("no credential · op=instancegroup · store=\"biosmoke-pdf\" -> NAMESPACE_UNKNOWN", [r.status, r.body?.reason], [400, "NAMESPACE_UNKNOWN"]);
  const r2 = await call("op=instancegroup&token=adm-d456&store=Scratch");
  t("admin · op=instancegroup · store=\"Scratch\" -> NAMESPACE_UNKNOWN", [r2.status, r2.body?.reason], [400, "NAMESPACE_UNKNOWN"]);
}

/* ------------------------------------------------------------------ 2 · the witness: nothing moved */
const bioAfter = await counters("bio"), scratchAfter = await counters("scratch");
t("witness: the REAL record's counters did not move across every refused call", JSON.stringify(bioAfter), JSON.stringify(bioBefore));
t("witness: scratch's counters did not move either", JSON.stringify(scratchAfter), JSON.stringify(scratchBefore));

/* ------------------------------------------------------------------ 3 · over-strictness: bio, scratch, absent — as today */
console.log("\n--- 3 · bio, scratch and an absent store= answer as they did before D-456 ---");
for (const c of CALLERS.filter((c) => c.cls !== "none" && c.cls !== "daemon")) {
  const absent = await call(q(c, "whoami"));
  t(`${c.cls} · whoami · store absent -> ok, store ${c.home}`, [absent.status, absent.body?.store], [200, c.home]);
  const scr = await call(q(c, "whoami", "scratch"));
  t(`${c.cls} · whoami · store=scratch -> ok, store scratch`, [scr.status, scr.body?.store], [200, "scratch"]);
  const bio = await call(q(c, "whoami", "bio"));
  if (c.cls === "probe")
    t("probe · whoami · store=bio -> SCOPE_REFUSED, unchanged (probe is confined to scratch)",
      [bio.status, bio.body?.reason, bio.body?.check], [403, "SCOPE_REFUSED", ADMISSION_CHECKS.SCOPE_REFUSED.check]);
  else t(`${c.cls} · whoami · store=bio -> ok, store bio`, [bio.status, bio.body?.store], [200, "bio"]);
}
{
  const r = await call("op=instancegroup");
  t("no credential · op=instancegroup · store absent -> store bio", [r.status, r.body?.store], [200, "bio"]);
  const r2 = await call("op=instancegroup&store=scratch");
  t("no credential · op=instancegroup · store=scratch -> store scratch", [r2.status, r2.body?.store], [200, "scratch"]);
  const r3 = await call("op=instancegroup&store=bio");
  t("no credential · op=instancegroup · store=bio -> store bio", [r3.status, r3.body?.store], [200, "bio"]);
  /* REC-164's op=groupidentity reads `store` itself, op=instancegroup's way (added by NAME at integration by
     c19-unionfix, 2026-09-24, because §4's sweep found a reader this suite did not drive): a caller with no
     credential names the store it asks; a credential's store is the one scopeFor grants. */
  const g1 = await call("op=groupidentity");
  t("no credential · op=groupidentity · store absent -> store bio", [g1.status, g1.body?.store], [200, "bio"]);
  const g2 = await call("op=groupidentity&store=scratch");
  t("no credential · op=groupidentity · store=scratch -> store scratch", [g2.status, g2.body?.store], [200, "scratch"]);
  const g3 = await call("op=groupidentity&store=bio");
  t("no credential · op=groupidentity · store=bio -> store bio", [g3.status, g3.body?.store], [200, "bio"]);
  const g4 = await call("op=groupidentity&token=adm-d456&store=scratch");
  t("admin · op=groupidentity · store=scratch -> store scratch (scopeFor's grant, not a second rule)",
    [g4.status, g4.body?.store], [200, "scratch"]);
  const inv = await call(`op=invitelook&invite=${encodeURIComponent(INVITE)}&store=bio`);
  t("no credential · op=invitelook · store=bio -> answers (the invitation is in bio)", [inv.status, inv.body?.ok], [200, true]);
}
/* a mutating call naming scratch still WRITES — and writes in scratch only */
{
  const before = await counters("bio"), sBefore = await counters("scratch");
  const w = await call("op=promote&token=adm-d456&store=scratch", promoteBody());
  t("admin · promote · store=scratch -> ok", [w.status, w.body?.ok], [200, true]);
  const after = await counters("bio"), sAfter = await counters("scratch");
  t("and the real record did not move", JSON.stringify(after), JSON.stringify(before));
  t("and scratch did (the write landed where it was named)", JSON.stringify(sAfter) !== JSON.stringify(sBefore), true);
}

/* ------------------------------------------------------------------ 4 · the sweep: every reader of `store` */
console.log("\n--- 4 · every site in src/index.mjs that reads the `store` parameter ---");
{
  const src = readFileSync(SRC("index.mjs"), "utf8");
  const lines = src.split("\n");
  const sites = [];
  lines.forEach((l, i) => { if (/searchParams\.(get|has|getAll)\(\s*["'`]store["'`]\s*\)/.test(l)) sites.push(i + 1); });
  /* The function each site sits in: the nearest preceding `function <name>(` or `if (op === "<name>")`. */
  const owner = (n) => {
    for (let i = n - 1; i >= 0; i--) {
      const f = lines[i].match(/^(?:async\s+)?function\s+(\w+)\s*\(/); if (f) return f[1];
      const o = lines[i].match(/if \(op === "(\w+)"\)/); if (o && i > n - 40) return `op=${o[1]}`;
      if (/if \(spec\.classes === null\)/.test(lines[i]) && i > n - 40) return "unauthenticated-block";
    }
    return "?";
  };
  const found = sites.map((n) => `${owner(n)}@${n}`);
  console.log(`  ${found.length} site(s): ${found.join(", ")}`);
  /* CORRECTED 2026-09-24 by D-461: `pinnedNamespaceGate` is a fifth reader, added on purpose — it refuses
     `store=scratch` on the public ops that always answer from `bio` (C-78.2), and
     `test/d461-pinned-namespace.test.mjs` drives it. The old set was right for its day, not wrong.
     `op=groupidentity` joined it on main in the same window, for the same reason. */
  const KNOWN = new Set(["scopeFor", "namespaceGate", "pinnedNamespaceGate", "unauthenticated-block", "op=instancegroup", "op=groupidentity"]);
  t("the sweep found readers (a sweep over nothing is not a sweep)", found.length >= 4, true);
  t("every reader of `store` is one this suite drives (a new one must be added here, by name)",
    sites.map(owner).filter((o) => !KNOWN.has(o)), []);
  t("the front-door gate runs before any credential is classified",
    src.indexOf("const unknownNamespace = namespaceGate(url);") > 0
      && src.indexOf("const unknownNamespace = namespaceGate(url);") < src.indexOf("let cls = await classify("), true);
}

} finally {
  await mf.dispose();
}

console.log(`\nd456-namespace-scope: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

/* NEGATIVE CONTROL: (run 2026-09-23, D-52) three arms on `store.mjs`, each armed ALONE by a one-match replace, each declared before it ran, every restore verified by sha256 (deb9ce72…) AND `cmp` against a pristine copy (2,888,504 bytes). Baseline 22 pass 0 fail. (a) DROP THE GENERATOR — remove `items.push(...this.#findingsExportPerformed(me, viewer, now))` from queueFeed -> 10 pass 12 fail, first by name "EVERY administrator's feed carries exactly one export notice …"; the before-export and non-administrator arms stay green, as declared. (b) THE LIAR — raise to the exporter alone (`admin = viewer === class:admin`, so only the ADMIN_TOKEN that exported is told) -> 10 pass 12 fail, the same EVERY-administrator arm by name (ruth, gus and the founder read 0, ADMIN_TOKEN 1). (c) OVER-LOOSE, the other direction — raise to every reader (`admin = true`) -> 20 pass 2 fail, exactly the two "a non-administrator gets NONE" arms, while every administrator arm stays green. ALL THREE AS DECLARED. */
/* D-52 — Membership v2 §8.1: "The export is recorded in the append-only history, so it can never
 * happen silently, and every administrator is notified." The record half (`export_log`,
 * `op=exportlog`) was built; this suite holds the NOTIFICATION half, the `export-performed` FINDING
 * (catalogue id N-1) raised by `store.mjs #findingsExportPerformed`.
 *
 * Through the op, under miniflare: every administrator reads op=queue on their OWN credential, and
 * the count is over EVERY administrator — two in-app administrators, the founder's own session and the
 * ADMIN_TOKEN machine credential — because the way a liar passes this row is raising the notice to the
 * exporter alone. Non-administrators (two members, the MEMBER_TOKEN machine credential) get none.
 *
 * WHAT THIS SUITE CANNOT SEE: transport beyond the app (email, D-98 — Bob's, out of scope); a revoked
 * administrator (removal needs a 4.7 majority vote this fixture does not stage — `#isAdminMember`
 * reads `status='active'`, the same predicate every other admin fence here uses); and the live plane,
 * which is DIST's to deploy.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { NAMESPACES, allocations, corpusFloor, mint } from "../../tools/mintid.mjs";
import { QUEUE_KIND_IDS, classOfKind } from "../src/queuestate.mjs";
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});

const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-1",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.result.token;
};

/* Two in-app administrators first (4.2, 4.3: no ordinary member until two exist), then the founder's
   session, then two ordinary members. */
const RUTH = await member("ruth", ["contribute"], "admin");
const GUS  = await member("gus",  [], "admin");
const claimed = await POST("op=claim", { bootstrapToken: "t-admin-1", password: "founder-passphrase-1" });
if (!claimed.result?.ok) throw new Error("claim: " + JSON.stringify(claimed));
const flog = await POST("op=login", { role: "admin", password: "founder-passphrase-1" });
if (!flog.result?.token) throw new Error("founder login: " + JSON.stringify(flog));
const FOUNDER = "token=" + flog.result.token;
const SAM  = await member("sam",  ["contribute"]);
const VERA = await member("vera", []);

const ADMINS = { ruth: RUTH, gus: GUS, founder: FOUNDER, "ADMIN_TOKEN": "token=t-admin-1" };
const OTHERS = { sam: SAM, vera: VERA, "MEMBER_TOKEN": "token=t-member-1" };
const exportItems = async (cred) => {
  const q = await GET(`op=queue&${cred}`);
  if (q.ok !== true) throw new Error(`queue: ${JSON.stringify(q).slice(0, 300)}`);
  return q.result.items.filter((i) => i.kind === "export-performed");
};
const perReader = async (set) => {
  const out = {};
  for (const [who, cred] of Object.entries(set)) out[who] = await exportItems(cred);
  return out;
};

console.log("\n--- before any export, nobody is told of one ---");
{
  const all = { ...(await perReader(ADMINS)), ...(await perReader(OTHERS)) };
  t("no reader's feed carries an export notice while the log is empty",
    Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length])),
    { ruth: 0, gus: 0, founder: 0, ADMIN_TOKEN: 0, sam: 0, vera: 0, MEMBER_TOKEN: 0 });
}

console.log("\n--- one export: one notice per administrator, each naming the export_log row ---");
const ex = await GET("op=export&token=t-admin-1&note=moving%20hosts");
t("the root of trust exports", ex.ok, true);
const log1 = await GET("op=exportlog&token=t-admin-1");
const row1 = log1.result?.exports?.[0];
t("and the export is row 1 of the append-only log", [log1.result?.exports?.length, typeof row1?.seq], [1, "number"]);
{
  const got = await perReader(ADMINS);
  /* THE ARM THE ROW NAMES: counted over EVERY administrator, so raising to the exporter alone (the
     ADMIN_TOKEN) fails here by name. */
  t("EVERY administrator's feed carries exactly one export notice — both in-app admins, the founder's session and the ADMIN_TOKEN",
    Object.fromEntries(Object.entries(got).map(([k, v]) => [k, v.length])),
    { ruth: 1, gus: 1, founder: 1, ADMIN_TOKEN: 1 });
  t("each notice names the export_log row, in its basis and its subject",
    Object.values(got).map((v) => [v[0]?.basis?.source, v[0]?.basis?.seq, v[0]?.subject?.id]),
    Object.values(got).map(() => ["export_log", row1?.seq, `export_log:${row1?.seq}`]));
  const it = got.ruth[0] ?? {};
  t("it is a FINDING under the catalogue's slug, with its N-id beside it",
    [it.class, classOfKind(it.kind), it.catalogue_id], ["FINDING", "FINDING", QUEUE_KIND_IDS["export-performed"]]);
  t("the catalogue id is N-1, the first the namespace has allocated", QUEUE_KIND_IDS["export-performed"], "N-1");
  t("the basis carries the row as the log holds it — scope, counts and note",
    [it.basis?.scope, it.basis?.bundles, it.basis?.files, it.basis?.note, it.basis?.at],
    [row1?.scope, row1?.bundles, row1?.files, row1?.note, row1?.at]);
  t("and names every administrator it was raised to, the founder among them",
    [...(it.basis?.raised_to ?? [])].sort(), ["admin", "gus", "ruth"]);
  t("the options are the PRODUCER's: the act that shows the record behind the notice",
    (it.options ?? []).map((o) => [o.id, o.label, o.weight]), [["exportlog", "Read the export log", "single"]]);
  t("and the control plane decorated that option like any other (needs, mode, rung keys present)",
    ["needs", "mode", "rung"].every((k) => k in (it.options?.[0] ?? {})), true);
  t("it is aged from the export's own instant, not the read's",
    [it.age?.state, it.age?.since], ["determined", row1?.at]);
  t("and it says, on the item, that no act clears it yet (the disposition is project-scoped and an export has none)",
    [it.disposition?.available, it.disposition?.reason], [false, "no_project_scope"]);
  t("the same notice is one item across readers — one id for one export",
    [...new Set(Object.values(got).map((v) => v[0]?.id))], [`FINDING::export-performed::${row1?.seq}`]);
}
{
  const got = await perReader(OTHERS);
  t("a non-administrator gets NONE — two members and the MEMBER_TOKEN machine credential",
    Object.fromEntries(Object.entries(got).map(([k, v]) => [k, v.length])),
    { sam: 0, vera: 0, MEMBER_TOKEN: 0 });
}

console.log("\n--- a second export: a second notice, the first unmoved ---");
await GET("op=export&token=t-admin-1");
const log2 = await GET("op=exportlog&token=t-admin-1");
{
  const seqs = (log2.result?.exports ?? []).map((r) => r.seq).sort((a, b) => a - b);
  const got = await perReader(ADMINS);
  t("every administrator now holds two notices, one per log row",
    Object.values(got).map((v) => v.map((i) => i.basis?.seq).sort((a, b) => a - b)),
    Object.values(got).map(() => seqs));
  t("the second export carried no note, and the notice says null rather than inventing one",
    got.gus.find((i) => i.basis?.seq === seqs[1])?.basis?.note, null);
  const others = await perReader(OTHERS);
  t("and still none for a non-administrator",
    Object.values(others).map((v) => v.length), [0, 0, 0]);
}

console.log("\n--- `mintid N` mints, and the allocation site is the one the catalogue holds ---");
{
  t("N is a registered namespace, code-referenced", NAMESPACES.N?.kind, "code");
  const a = allocations("N");
  t("its allocation site is graded and finds N-1 in queuestate.mjs, once",
    [a.covered, a.sites.map((s) => s.id), a.duplicates], [true, ["N-1"], []]);
  const f = corpusFloor("N");
  t("the floor reads the live corpus (1)", [f.floor, f.missing], [1, []]);
  /* Minted into a SCRATCH ledger, so the suite burns no real id. */
  const scratch = mkdtempSync(join(tmpdir(), "d52-idalloc-"));
  const r = mint("N", { who: "exportnotice.test", why: "suite arm", env: { BIO_IDALLOC_DIR: scratch } });
  t("`mintid N` mints the next number above the catalogue's floor", [r.ok, r.ids?.[0] ?? r.id], [true, "N-2"]);
}

await mf.dispose();
console.log(`\nexportnotice: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

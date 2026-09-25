/* NEGATIVE CONTROL: RUN 2026-09-23 (D-179) with `node test/d179onehome.control.mjs [arm]` from `bio-plane/`, every arm ALONE against a patched COPY of src/ (each anchor asserted to occur exactly once), the real sources hashed before and after (store.mjs 2,886,146 B sha256 5ecae74960a3…, bio-checks.mjs 834,914 B sha256 3b5c49a7c45d…; untouched: YES). Declared before arming, and the result: (a) baseline — MUST be green: 16/0. (b) drop — THE ROW'S CONTROL, the refusal disarmed (`if (false && homes.length)`): 5/11, first by name "B registering A's bytes is REFUSED BY NAME", and "THE FIRST BUNDLE'S REGISTER ROW IS BYTE-IDENTICAL AFTER" FAILS — the second registration MOVED A's row. (c) nojoin — the holder-exists join dropped, declared GREEN: 16/0; purge deletes a bundle's register rows with it, so no op leaves an orphan for the join to skip — MEASURED unreachable here, kept as defence for an orphan made another way. (d) disclose — D-15 broken, the holder named to every caller: 15/1, only "and is told NO bundle". (e) sameowner — OVER-STRICTNESS, the same bundle asked too: 15/1, only "a REVISION of A re-registering its own bytes LANDS". EVERY ARM AS DECLARED on the second run. RECORDED, NOT SMOOTHED: on the first run (b) came back NOT AS DECLARED twice over — the told-no-bundle assertion PASSED FOR FREE over a promote that LANDED (no holder, no id: it now requires the refusal too), and the declaration wrongly named §4's two arms (with no fence D's registration lands whoever holds X); both corrected, re-run. */
/* D-179 — ONE CAPTURE, ONE HOME, THE ORIGINAL's (BOB #26, 2026-09-22; `BIO_Intake_Doctrine_v1_1.md` §8).
 *
 * `register` is keyed by `capture_sha` and `op=promote` UPSERTed `bundle_id` on that key, so a second bundle
 * registering bytes the record already held silently MOVED the first bundle's register row to itself; only an
 * authored observation was fenced (C-53.8). This suite drives, THROUGH THE OP (miniflare, the control plane in front
 * of the Durable Object), and reads the register row itself out of the store's SQLite with the instance DOWN:
 *   1. held bytes promoted under a SECOND bundle are REFUSED BY NAME (CAPTURE_HELD_BY_ANOTHER_BUNDLE, C-53.13, with
 *      its canned translation), naming the holder to an administrator; the first bundle's register row is
 *      BYTE-IDENTICAL after (every column, `registered` included), and the second bundle was not created;
 *   2. D-15: a member who cannot see the holding bundle (a project she was never invited to) is refused the same way
 *      and told NO bundle — neither in `holder` nor anywhere in the answer's text; an administrator is told which;
 *   3. OVER-STRICTNESS: a revision of the holding bundle re-registering its own bytes LANDS and the row stays home;
 *      an ordinary promote of NEW bytes lands;
 *   4. a PURGED home's bytes register afresh under another bundle.
 *
 * WHAT THIS CANNOT SEE: a digest-level duplicate across bundles (same content, different bytes) — not reached and not
 * rowed, by the row's own scope; a live instance's register (verification there is DIST's); a store whose register
 * ALREADY holds a moved row from before this fence (nothing recorded which bundle held it first).
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { TESTIMONY_CHECKS } from "../checks/bio-checks.mjs";

/* The control driver (`d179onehome.control.mjs`) points this at an armed COPY of the sources. */
const SRC = process.env.D179_SRC ? join(process.env.D179_SRC, "index.mjs") : fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PERSIST = mkdtempSync(join(tmpdir(), "d179-persist-"));
const ADM = "adm-d179", MEM = "mem-d179";
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
  defaultPersistRoot: PERSIST,
});
let mf = mk();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const ROW = TESTIMONY_CHECKS.CAPTURE_HELD_BY_ANOTHER_BUNDLE;
const refusedByName = (r) => [codeOf(r), r && r.check, !!(ROW && r && r.translation === ROW.translation)];
const BY_NAME = ["CAPTURE_HELD_BY_ANOTHER_BUNDLE", "C-53.13", true];

/* THE REGISTER, READ WITH THE INSTANCE DOWN: every column of every row, straight from the store's SQLite. */
const registerRows = async () => {
  await mf.dispose();
  const dbs = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : /\.sqlite$/.test(n) && dbs.push(p); } };
  walk(PERSIST);
  const rows = [];
  let found = 0;
  for (const p of dbs) {
    const db = new DatabaseSync(p);
    if (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='register'").get()) {
      found++;
      for (const r of db.prepare("SELECT * FROM register ORDER BY capture_sha").all()) rows.push({ ...r });
    }
    db.close();
  }
  mf = mk();
  if (found !== 1) throw new Error(`expected exactly one store holding a register, found ${found}`);
  return rows;
};
const rowOf = (rows, s) => rows.find((r) => r.capture_sha === s) ?? null;

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const infoMd = (id, note = "A captured document.") => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", note, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project", `title: "Hidden project 0179"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "",
  "## Session Log", ""].join("\n");
const meta = (id, type, state) => ({ object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
  current_state: state, created: NOW, last_updated: LATER });
const reg = (s, path = "snapshots/doc.bin") => ({ path, sha256: s, encoding: "binary", bytes: 10 });
let seq = 0;
const promote = (tok, id, text, type, state, base, register) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base, snapKey: `20260923T0${String(++seq).padStart(5, "0")}Z_d179`,
  files: [{ path: "bundle.md", text, bytes: Buffer.byteLength(text), sha256: sha(text) }],
  register, meta: meta(id, type, state) });
const exists = async (id) => ((await POST(`op=list&token=${ADM}&limit=1000`, undefined)) || {})
  .bundles?.some((b) => b.bundle_id === id) ?? null;

const X = sha("d179-the-held-bytes"), Y = sha("d179-bytes-a-hidden-project-holds"), Z = sha("d179-new-bytes");

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-179" }));
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
                                                         capabilities: ["contribute", "publish", "create_projects"] });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-179` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-179` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");    /* an administrator: sees every project (§7.3) */
await enrol("iris", "member");                /* owns the hidden project */
const VERA = await enrol("vera", "member");   /* NEVER invited: cannot see the project */

const A = "INFO-2026-0179-original", B = "INFO-2026-0179-second", C = "INFO-2026-0179-veras", D = "INFO-2026-0179-after-purge";
const aMd = infoMd(A);
const a1 = must("A registers X", await promote(ADM, A, aMd, "information", "collected", null, [reg(X)]));
/* THE HIDDEN HOLDER: a project minted by the admin token (the plane mints its id), owned by iris, holding Y. */
const p = must("mint the project", await POST(`op=promote&token=${ADM}`, {
  base: null, snapKey: "20260923T000000Z_d179proj",
  files: [{ path: "bundle.md", text: projectMd(), bytes: Buffer.byteLength(projectMd()), sha256: sha(projectMd()) }],
  register: [reg(Y, "snapshots/project.bin")], meta: { ...meta("P", "project", "forming"), title: "Hidden project 0179" } }));
const P = p.bundleId;
must("iris owns it", await DO("projectclaimowner", { projectId: P, memberId: "iris" }));

const before = await registerRows();
console.log(`  corpus: ${before.length} register rows before the refusals — ${before.map((r) => `${r.capture_sha.slice(0, 8)}→${r.bundle_id}`).join(", ")}`);
t("the fixture is real: X is registered under A and Y under the hidden project, read from the store's SQLite",
  [rowOf(before, X)?.bundle_id, rowOf(before, Y)?.bundle_id, before.length >= 2], [A, P, true]);

/* ======================================================== 1. A SECOND HOME IS REFUSED BY NAME */
console.log("\n--- 1. held bytes promoted under a SECOND bundle are refused by name; the first row does not move ---");
const second = await promote(ADM, B, infoMd(B), "information", "collected", null, [reg(X, "snapshots/elsewhere.bin")]);
t("B registering A's bytes is REFUSED BY NAME (CAPTURE_HELD_BY_ANOTHER_BUNDLE, C-53.13, canned translation)",
  refusedByName(second), BY_NAME);
t("  and it names the capture, and — to an administrator — the holder A", [second?.capture_sha, second?.holder], [X, A]);
const ruthSees = await promote(RUTH, C, infoMd(C), "information", "collected", null, [reg(Y)]);
t("an administrator's SESSION registering the hidden project's bytes is refused and TOLD the holder (she may see it)",
  [...refusedByName(ruthSees), ruthSees?.holder], [...BY_NAME, P]);

/* ======================================================== 2. D-15: NO HOLDER TO A CALLER WHO CANNOT SEE IT */
console.log("\n--- 2. a member who cannot see the holder is told no bundle ---");
const veraBlind = await promote(VERA, C, infoMd(C), "information", "collected", null, [reg(Y)]);
t("vera (never invited) registering the hidden project's bytes is REFUSED BY NAME", refusedByName(veraBlind), BY_NAME);
/* The refusal is PART of this assertion: an answer that LANDED also carries no holder and no id, and the
   first draft of this line passed for free that way under the control's `drop` arm. */
t("  and is told NO bundle: refused, `holder` null, and the project's id appears nowhere in the answer",
  [codeOf(veraBlind), veraBlind?.holder, JSON.stringify(veraBlind ?? {}).includes(P)],
  ["CAPTURE_HELD_BY_ANOTHER_BUNDLE", null, false]);

const after = await registerRows();
t("THE FIRST BUNDLE'S REGISTER ROW IS BYTE-IDENTICAL AFTER — every column, `registered` included",
  JSON.stringify(rowOf(after, X)), JSON.stringify(rowOf(before, X)));
t("  and the hidden project's row too", JSON.stringify(rowOf(after, Y)), JSON.stringify(rowOf(before, Y)));
t("  and no register row names B or C", after.filter((r) => r.bundle_id === B || r.bundle_id === C).length, 0);
t("  and neither B nor C was created", [await exists(B), await exists(C)], [false, false]);

/* ======================================================== 3. OVER-STRICTNESS */
console.log("\n--- 3. the same bundle re-registering its own bytes, and new bytes, land ---");
const rev = await promote(ADM, A, infoMd(A, "A revised summary."), "information", "collected", a1.bundleSha, [reg(X)]);
t("a REVISION of A re-registering its own bytes LANDS", rev?.ok, true);
const fresh = await promote(ADM, B, infoMd(B), "information", "collected", null, [reg(Z)]);
t("B registering NEW bytes LANDS", fresh?.ok, true);
const later = await registerRows();
t("  and X is still home under A, Z under B", [rowOf(later, X)?.bundle_id, rowOf(later, Z)?.bundle_id], [A, B]);

/* ======================================================== 4. A PURGED HOME'S BYTES REGISTER AFRESH */
console.log("\n--- 4. a purged home's bytes register afresh ---");
const purged = await POST(`op=purge&token=${ADM}&bundleId=${A}&confirm=bio`, {});
t("A is purged (the fixture act)", [purged?.ok, await exists(A)], [true, false]);
const afresh = await promote(ADM, D, infoMd(D), "information", "collected", null, [reg(X)]);
t("D registering X after its home was purged LANDS", afresh?.ok, true);
const last = await registerRows();
t("  and X's one row now names D", [rowOf(last, X)?.bundle_id, last.filter((r) => r.capture_sha === X).length], [D, 1]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd179onehome: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

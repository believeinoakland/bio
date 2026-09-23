/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec180-promote-rollback.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec180-promote-rollback.control.mjs [arm]`. Each arm patches a COPY of `src/` (its anchor asserted to occur EXACTLY ONCE), the real sources are hashed before and after, and what each arm MUST fail and MUST NOT fail is declared in the driver before it arms. RESULTS, RUN 2026-09-23 by REC-180's worker on base 91bcea6b + REC-180 (real src/store.mjs 2,885,115 B sha256 f3599972e000…, src/index.mjs 723,095 B sha256 7889640b5e8e…, both hashed before and after and UNCHANGED — the arms patch copies, so the restore is the copy's removal and the real files' digests): (a) baseline 14/0 · (b) return-not-throw — THE ROW'S CONTROL, the refusal RETURNED from the callback instead of thrown (the pre-fix behaviour) -> 12/2, failing BY NAME at "NAME_TAKEN after the mint: minted_ids is BYTE-IDENTICAL" and "NO_TITLE after the mint: minted_ids and seq are BYTE-IDENTICAL", while the seq-only arm, both refusal-code arms, the words arm and every landing arm stay green · (c) rollback-all — OVER-STRICTNESS, every answer rolled back ok or not -> 9/5, the ledger-not-empty, NAME_TAKEN, words, listed and exactly-one-row arms. RECORDED, NOT SMOOTHED: the first run of (b) came back NOT AS DECLARED at 11/3 — §3's exactly-one-row arm diffed against a witness taken BEFORE the NO_TITLE act, so the id that arm's refusal spent was counted as the landing creation's. The ARM was right and the SUITE was wrong; §3 now diffs against the witness taken immediately before its act, and all three arms were re-run AS DECLARED. NOT ARMED: bias.test.mjs ARM M's op=image read — the bias refusal precedes every write in promote, so no arm of this driver can move it; it is a guard for a later write placed before that refusal.
 * =========================================================================
 * REC-180 — A REFUSED PROMOTION LEAVES NOTHING BEHIND. `BIO_State_Rules_Consistency_v1_5.md` §8, the Mechanical
 * Verification Law: the record holds only what an act that LANDED wrote. CLAUDE.md §2: a record claiming more than
 * it can support is worse than a missing feature.
 *
 * THE DEFECT, measured at the code on 91bcea6b: `promote`'s transaction callback RETURNED its refusals, and a
 * refusal returned from inside `transactionSync` commits what the callback already wrote. REC-141's mint is the
 * first act inside that callback on a project creation and it writes `minted_ids` (D-432's ledger) — so a creation
 * refused NAME_TAKEN (7.1) or NO_TITLE after the mint left a spent id for a project that never existed.
 *
 * THE FIX: the callback is `act`; any `ok: false` it returns throws `Store.#ROLLBACK` (REC-126's sentinel) with the
 * refusal held beside it, and the catch returns that refusal. The caller's answer is unchanged; the record is.
 *
 * THROUGH THE OP, WITNESSED AT THE STORE. Every act here is `op=promote` through the control plane, as a member.
 * `minted_ids` is named by NO op, on purpose (`mint-ledger.test.mjs` S1 pins that), so the witness is the Durable
 * Object's own SQLite file, opened READ-ONLY beside the running plane at the path its id names (no directory walk):
 * the rows of `seq` and of `minted_ids`, serialised in key order and hashed, before and after each act.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (a) a witness that cannot see a mint. Two digests of an unreadable or empty ledger agree on nothing (CLAUDE.md
 *       §5). §1 floors the ledger non-empty after the fixture's own mint, and §3 requires a SUCCESSFUL creation to
 *       add EXACTLY ONE row — the id it returned — so a blind witness fails there.
 *   (b) roll back EVERYTHING. The refusals leave the ledger identical for free; §3 requires the successful creation
 *       to be listed and its mint recorded.
 *   (c) change the answer. §2 asserts the refusal's code AND its words, as they were before this item.
 *
 * WHAT THIS CANNOT SEE: a late refusal on a path that writes something OTHER than `seq` or `minted_ids` before it
 * refuses. The item's sweep found the mint the only such write TODAY; the fix is general (every `ok: false` rolls
 * back), and this suite witnesses the one write that exists.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.REC180_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec180", MEM = "mem-rec180";
const PERSIST = mkdtempSync(join(tmpdir(), "rec180-persist-"));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, durableObjectsPersist: PERSIST,
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body ?? {}) });
  try { return rP(JSON.parse(await res.text())); } catch { return null; }
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };

/* THE WITNESS. The DO's SQLite file is `<persist>/-Store/<the object's id>.sqlite`; its path is computed from the id
   and asserted to exist, never discovered. Read-only, beside the running plane (WAL), and closed after every read. */
let DB_PATH = null;
const witness = () => {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  try {
    const seq = db.prepare("SELECT * FROM seq ORDER BY scope").all().map((r) => ({ ...r }));
    const minted = db.prepare("SELECT * FROM minted_ids ORDER BY id").all().map((r) => ({ ...r }));
    return { seq, minted, seqSha: sha(JSON.stringify(seq)), mintedSha: sha(JSON.stringify(minted)) };
  } finally { db.close(); }
};

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-180" }));
const enrol = async (memberId, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-180` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-180` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const CAPS = ["contribute", "publish", "create_projects"];
await enrol("ruth", CAPS, "admin");       /* ADMINS_FIRST: the founder counts as the first administrator */
const IRIS = await enrol("iris", CAPS);
const VERA = await enrol("vera", CAPS);

/* A project document with no `id:` line — the shape a creation sends since REC-141. */
const projectMd = (title) => ["---", "object_type: project", `title: "${title}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");
let n = 0;
const create = (tok, title) => {
  const md = projectMd(title);
  return POST(`op=promote&token=${tok}`, { base: null,
    snapKey: `20260701T0000${String(++n).padStart(2, "0")}Z_rec180`,
    meta: { object_type: "project", group: "believe-in-oakland", title, current_state: "forming",
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
};
const listed = async (id) => ((await POST(`op=list&token=${ADM}&limit=1000`)) || {})
  .bundles?.find((b) => b.bundle_id === id) ?? null;

const made = await create(IRIS, "Sewer Fund Transfers");
t("fixture: iris's creation of 'Sewer Fund Transfers' COMMITS, with a plane-minted PROJ id",
  [made?.ok, /^PROJ-/.test(made?.bundleId ?? "")], [true, true]);

/* ============================================================== 1. THE WITNESS CAN SEE A MINT */
console.log("\n--- 1. the witness: the Durable Object's own seq and minted_ids, read beside the running plane ---");
const ns = await mf.getDurableObjectNamespace("STORE");
DB_PATH = join(PERSIST, "-Store", `${ns.idFromName("bio").toString()}.sqlite`);
t("the Durable Object's SQLite file is where its id names it", existsSync(DB_PATH), true);
/* seq is stepped once, so its equality below costs something: two digests of an empty table agree on nothing. */
const aid = rP(await (await mf.dispatchFetch(`http://x/api/?op=allocid&prefix=INFO&year=2026&token=${IRIS}`)).json());
const W0 = witness();
console.log(`         (minted_ids: ${W0.minted.length} row(s) ${JSON.stringify(W0.minted.map((r) => r.id))}; seq: ${W0.seq.length} row(s))`);
t("the ledger is NOT empty: it holds the fixture's own mint (a witness that sees nothing agrees with everything)",
  W0.minted.some((r) => r.id === made?.bundleId), true);
t("and seq is NOT empty: it holds the INFO step op=allocid just took", [typeof aid?.id, W0.seq.length > 0], ["string", true]);

/* ============================================================== 2. A REFUSAL AFTER THE MINT WRITES NOTHING */
console.log("\n--- 2. a creation refused AFTER the mint leaves seq and minted_ids byte-identical ---");
const taken = await create(VERA, "sewer   FUND transfers");
t("vera's creation of the same name, respaced and recased, is refused NAME_TAKEN through op=promote",
  codeOf(taken), "NAME_TAKEN");
t("and the refusal's own words are unchanged: it names neither the other project's id nor its title",
  [taken?.ok, /already exists on this instance/.test(taken?.detail ?? ""),
   JSON.stringify(taken ?? {}).includes(made?.bundleId ?? "\u0000"), JSON.stringify(taken ?? {}).includes("Sewer Fund")],
  [false, true, false, false]);
const W1 = witness();
t("NAME_TAKEN after the mint: minted_ids is BYTE-IDENTICAL (no id spent for a project that never existed)",
  [W1.mintedSha, W1.minted.length], [W0.mintedSha, W0.minted.length]);
t("NAME_TAKEN after the mint: seq is BYTE-IDENTICAL", W1.seqSha, W0.seqSha);
const untitled = await create(VERA, "");
t("a project creation with NO name is refused NO_TITLE through op=promote — also AFTER the mint", codeOf(untitled), "NO_TITLE");
const W1b = witness();
t("NO_TITLE after the mint: minted_ids and seq are BYTE-IDENTICAL", [W1b.mintedSha, W1b.seqSha], [W0.mintedSha, W0.seqSha]);

/* ============================================================== 3. OVER-STRICTNESS: A CREATION THAT LANDS STILL LANDS */
console.log("\n--- 3. a creation that is NOT refused still commits, and the witness sees exactly its mint ---");
const harbor = await create(VERA, "Harbor Levy");
t("vera's creation of 'Harbor Levy' COMMITS", [harbor?.ok, /^PROJ-/.test(harbor?.bundleId ?? "")], [true, true]);
t("and it is listed", (await listed(harbor?.bundleId))?.bundle_id ?? null, harbor?.bundleId ?? "(no id returned)");
const W2 = witness();
/* Against the witness taken IMMEDIATELY before this act (W1b), never an earlier one: diffed against W1, the
   return-not-throw arm's id spent by the NO_TITLE refusal counted as this creation's and moved this arm too. */
const added = W2.minted.filter((r) => !W1b.minted.some((o) => o.id === r.id)).map((r) => r.id);
t("and minted_ids gained EXACTLY ONE row, the id the creation returned", added, [harbor?.bundleId ?? "(no id returned)"]);
t("and nothing the ledger held before was rewritten", W1b.minted.every((o) => W2.minted.some((r) => JSON.stringify(r) === JSON.stringify(o))), true);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nrec180-promote-rollback: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

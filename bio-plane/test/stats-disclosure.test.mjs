/* NEGATIVE CONTROL: (run 2026-09-18) `node test/nc-rec129.mjs statsbaseline|statsopen|statsdropall|statsstamp|selftestopen`
 * from `bio-plane/`: (a) `statsbaseline` 17/0 green. (b) `statsopen` — THE ROW'S CONTROL, the operator gate
 * removed in Store#stats (MK-4 as landed): 7/10, incl. A1 member TOKEN + member SESSION, B1, D2.
 * (c) `statsdropall` — the over-strictness direction, keys dropped for everyone: 12/5, incl. FIXTURE, C1, D2.
 * (d) `statsstamp` — index.mjs's server stamp removed: 11/6, incl. B2 x2, C3 (and C1/FIXTURE: the store's
 * default is closed, so an unstamped admin loses them). (e) `selftestopen` — selftest relays as operator for
 * every class: 16/1, D2. All ARMED on one match, all AS
 * DECLARED, restores sha256+cmp YES. ALSO RUN AGAINST THE UNEDITED TREE before the fix: 8/9 — the defect
 * reproduced (A1 member TOKEN and member SESSION, B1 x4, B2 x2, D2). A1 for the PROBE token is
 * NON-DISCRIMINATING and passed pre-fix: probe is confined to the SCRATCH store and cannot see a live lead.
 *
 * REC-129 / IC-144 (a) — A COUNT IS A DISCLOSURE OF EXISTENCE, SO op=stats' `leads` AND
 * `observations` ARE THE OPERATOR'S. RULED by BOB #15 in `MEMBER-KNOWLEDGE-DESIGN.md` §5: a
 * counter whose row set includes rows the caller could not read is returned only to a caller who
 * could read them all — for an instance-wide count, the `admin` class. Member and probe receive NO
 * such key (the key is absent, never re-meant per class).
 *
 * THE DEFECT, as it stood on landed MK-4 (`index.mjs` classes op=stats admin/member/probe; the store
 * returned `leads: n("leads")` and the whole-log `observations` to all three): a member diffing
 * op=stats across a colleague's authoring learned a lead had just been written, and — through
 * `observations` — that it had just been followed.
 *
 * WHAT THIS SUITE ASSERTS, all through the ops against the real plane in miniflare:
 *   A. THE HEADLINE CONTROL the row names: a member-class op=stats answer is BYTE-IDENTICAL before
 *      and after another member authors a lead and follows it — for the member TOKEN, a member
 *      SESSION and the probe TOKEN;
 *   B. the two keys are ABSENT for member, probe and a member session (not zero, not null — absent),
 *      and a caller-supplied `operator=1` does not bring them back (the stamp is the server's);
 *   C. OVER-STRICTNESS — the admin TOKEN still receives both, and they COUNT: the instance's operator
 *      keeps D-113's figures, and `purge`'s before/after still carry them (they are its proof). An
 *      admin-ROLE member's session is class `member` and receives neither (C2 says why);
 *   D. the same answer through the second door: op=selftest relays the store's stats, and takes the
 *      same stamp.
 * THE LIAR THIS REFUSES: a stats that dropped the keys for EVERYONE passes B and fails C; a stats
 * that zeroed them for a member passes C and fails B (a zero is a re-meant key, not an absent one).
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";

const SRC_DIR = process.env.REC129_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r129s", MEMBER_TOKEN: "mem-r129s", PROBE_TOKEN: "prb-r129s", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const raw = async (op, qs, tok, init) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${tok}${qs ? `&${qs}` : ""}`, init)).json();
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await raw(op, "", tok, { method: "POST", body: JSON.stringify(body ?? {}) }));
const stats = async (tok, qs = "") => rP(await raw("stats", qs, tok));
const has = (r) => [!!r && "leads" in r, !!r && "observations" in r];

try {
const enrol = async (memberId, role) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, "adm-r129s");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin");
await enrol("ada", "admin");                 /* ADMINS_FIRST: a group's second member is an administrator */
const SAM = await enrol("sam", "member");
const VERA = await enrol("vera", "member");

/* The corpus these assertions run over, printed and floored: a check that passes over an empty
   fixture is the shape that has passed three times here over nothing. */
const s0 = await stats("adm-r129s");
t("FIXTURE: the admin's op=stats answers, carries both keys, and starts with no lead",
  [typeof s0?.bundles, ...has(s0), s0?.leads], ["number", true, true, 0]);

/* ================= A. THE HEADLINE CONTROL: byte-identical across a colleague's lead ======== */
console.log("\n--- A. a member's op=stats does not move when a colleague writes and follows a lead ---");
const VIEWERS = { "the member TOKEN": "mem-r129s", "sam's member SESSION": SAM, "the probe TOKEN": "prb-r129s" };
const before = {};
for (const [k, tok] of Object.entries(VIEWERS)) before[k] = JSON.stringify(await stats(tok));
const L = await post("lead", { words: "I was told the contract was amended; look at the March agenda." }, VERA);
const lk = await post("leadlook", { lead: L && L.lead_id, state: "LOOKED_ABSENT", detail: "no such item" }, VERA);
t("A0: vera's lead and her look both LANDED (so the control below has a subject)",
  [!!(L && L.lead_id), lk && lk.ok], [true, true]);
for (const [k, tok] of Object.entries(VIEWERS)) {
  const now = JSON.stringify(await stats(tok));
  t(`A1: ${k}'s WHOLE op=stats answer is byte-identical before and after vera's lead and look`,
    sha(now), sha(before[k]));
}

/* ================= B. ABSENT, NOT ZERO, AND NOT CALLER-CHOSEN ================================ */
console.log("\n--- B. the two keys are absent for everyone but the operator ---");
for (const [k, tok] of Object.entries({ ...VIEWERS, "vera's own member SESSION": VERA })) {
  const r = await stats(tok);
  t(`B1: ${k} receives op=stats (it is still admitted) and NEITHER key — absent, not zero`,
    [typeof r?.bundles, ...has(r)], ["number", false, false]);
}
for (const [k, tok] of Object.entries({ "the member TOKEN": "mem-r129s", "sam's member SESSION": SAM })) {
  const r = await stats(tok, "operator=1");
  t(`B2: ${k} asking operator=1 is overwritten by the server's stamp, not honoured`, has(r), [false, false]);
}

/* ================= C. OVER-STRICTNESS: the operator keeps them, and they count ============== */
console.log("\n--- C. the operator keeps both counts, and they are right ---");
const sA = await stats("adm-r129s");
t("C1: the admin TOKEN still receives both, and they COUNT: one lead, and the log grew by her look",
  [...has(sA), sA?.leads, sA && s0 && sA.observations - s0.observations], [true, true, 1, 1]);
/* C2 WAS DRAFTED THE OTHER WAY AND THE FIRST RUN CORRECTED IT (2026-09-18). It asserted that an
   admin-ROLE member's session receives both keys. It does not, and that is the ruling read literally
   rather than a defect: `index.mjs` classes a session `admin` only for the ROOT-admin session
   (`sess.role === "admin"`); a member whose role is admin signs in as class `member` and carries an
   `administer` RIGHT (D-157), which is a different thing. BOB #15 ruled the two keys to the admin CLASS —
   *the instance's own operator* — and every lead remains unreadable to an administrator member
   (MK-4: no admin arm in the lead rule). So an administrator MEMBER is outside, provisionally; the
   alternative (widen to `administer`) is named in the REC-129 report as a decision for BOB. */
const sR = await stats(RUTH);
t("C2: an admin-ROLE MEMBER's session is class `member` (an administer RIGHT, not the admin CLASS) and "
  + "receives neither key — the ruling names the class",
  [typeof sR?.bundles, ...has(sR)], ["number", false, false]);
const sAoff = await stats("adm-r129s", "operator=0");
t("C3: and a caller-supplied operator=0 does not take them from the admin either — the stamp is the server's",
  has(sAoff), [true, true]);

/* ================= D. THE SECOND DOOR: op=selftest relays the store's stats ================= */
console.log("\n--- D. op=selftest relays stats and takes the same stamp ---");
const stM = await raw("selftest", "", "mem-r129s");
const stA = await raw("selftest", "", "adm-r129s");
t("D1: selftest answers both classes with the store's stats embedded",
  [typeof stM?.store?.bundles, typeof stA?.store?.bundles], ["number", "number"]);
t("D2: the member's selftest carries NEITHER key; the admin's carries both with op=stats' figures",
  [...has(stM?.store), ...has(stA?.store), stA?.store?.leads], [false, false, true, true, sA?.leads]);

/* ================= E. purge's proof is intact ============================================== */
console.log("\n--- E. purge's before/after are its proof, and they keep the counts ---");
const pg = rP(await raw("purge", "confirm=scratch", "prb-r129s"));
t("E1: a probe purge of scratch still PROVES what it took — before/after carry both counts",
  [pg?.ok, typeof pg?.before?.leads, typeof pg?.after?.observations], [true, "number", "number"]);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nstats-disclosure: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

/* NEGATIVE CONTROL: (run 2026-09-18, REC-131) `node test/nc-rec129.mjs statsbaseline|statsleadrows|statsadminleads|statsdropall|routeproof|purgethin`
 * from `bio-plane/`, one arm at a time, each restored from a per-arm pristine copy (sha256 + cmp YES):
 * (a) `statsbaseline` 28/0. (b) `statsleadrows` — THE ROW'S FIRST CONTROL, lead rows put back into the
 * wire's `observations`: 24/4 — A1 fails for the admin TOKEN, the member TOKEN and sam's SESSION, and E2;
 * the probe's A1 stays green (non-discriminating, said). (c) `statsadminleads` — THE ROW'S SECOND CONTROL,
 * `leads` back for the admin class (REC-129's stamp restored and honoured at the route): 25/3 — FIXTURE,
 * the admin's A1 and B1; every member/session/probe arm stays green. (d) `statsdropall` — THE LIAR,
 * `observations` dropped for everyone: 12/16, and EVERY A1 STAYS GREEN — the headline alone cannot tell
 * the liar from the fix, which is what B1/C/D catch (E2/E3 also fail, collaterally: they compare purge's
 * proof to the wire count). (e) `routeproof` — the wire route wired to purge's whole proof: 15/13.
 * (f) `purgethin` — OVER-STRICTNESS, purge's proof read from the wire counts: 26/2 (E1, E2). All ARMED on
 * the declared match count, all AS DECLARED. REC-129's arms `statsopen`/`statsstamp`/`selftestopen` were
 * REPLACED, not exempted: the stamp they broke no longer exists.
 *
 * REC-131 / IC-148 — CORRECTED 2026-09-18, NEVER EXEMPTED. This suite was written by REC-129 for IC-144,
 * which returned `leads` and the whole-log `observations` to the `admin` CLASS only. BOB #15 corrected his
 * own ruling the same day (`MEMBER-KNOWLEDGE-DESIGN.md` §5): **the caller who could read every lead does
 * not exist** — `#leadVisibleTo` reaches no `class:*` credential and deliberately skips the administrator
 * arm, so the admin TOKEN reads no lead either, and handing it the count was the overclaim this suite had
 * been written to refuse. So the assertions REC-129 wrote the OTHER way are corrected at their sites:
 *   - the old FIXTURE and C1 asserted the admin TOKEN RECEIVES `leads` and that it counts. WRONG on the
 *     corrected ruling: `leads` is now absent for EVERY class (B1).
 *   - the old B1 asserted member and probe receive NO `observations`. WRONG: `observations` is published to
 *     every class, counting the log WITHOUT `authority_kind = 'lead'` rows, one meaning for every caller (B1,
 *     C).
 *   - the old B2/C3 asserted the server's `operator` stamp overwrote a caller's `operator=`. The stamp is
 *     GONE (nothing reads it: no class receives a key the others do not), so what is asserted instead is
 *     that no parameter a caller can send brings `leads` back or changes the answer (B2).
 *   - the old C2 (an admin-ROLE member's session receives neither key, "provisionally") is moot: nobody
 *     receives `leads`, and everybody receives the same `observations`. It is kept as a presence arm.
 *   - the old A1 excluded the admin TOKEN from the byte-identical control. It is INCLUDED now: that is the
 *     row's accepts-when.
 *
 * WHAT THIS SUITE ASSERTS, all through the ops against the real plane in miniflare:
 *   A. THE HEADLINE CONTROL: an ADMIN-token, a member-token, a member-session and a probe `op=stats`
 *      answer are each BYTE-IDENTICAL before and after another member authors a lead and follows it;
 *   B. `leads` is ABSENT for every class, `observations` PRESENT for every class, and no caller-supplied
 *      parameter moves either;
 *   C. THE LIAR ARM: dropping `observations` for everyone would make every A answer identical too, so
 *      `observations` must MOVE when a NON-lead observation is written — for the admin token, the member
 *      token and a member session over the live store, and for the probe over scratch — and must read the
 *      SAME number for every caller of one store;
 *   D. the second and third doors: op=selftest and op=livefire relay the store's stats and carry the same
 *      rule;
 *   E. `purge`'s D-113 proof reads the store's own counts, not the wire op, and stays WHOLE — `leads` and the
 *      whole log, lead looks included.
 * THE PROBE's A arm is NON-DISCRIMINATING and says so: the probe reads the SCRATCH store, and a lead can
 * only be written by a signed-in member into the live one, so the probe cannot see a lead either way. Its
 * discriminating arm is C (its `observations` moves on a scratch observation).
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
const post = async (op, body, tok, qs = "") => rP(await raw(op, qs, tok, { method: "POST", body: JSON.stringify(body ?? {}) }));
const stats = async (tok, qs = "") => rP(await raw("stats", qs, tok));
/* [has leads, observations is a number] — the shape every class must answer [false, true] */
const shape = (r) => [!!r && "leads" in r, typeof (r && r.observations) === "number"];

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
t("FIXTURE: the admin's op=stats answers, carries `observations` and NOT `leads`",
  [typeof s0?.bundles, ...shape(s0)], ["number", false, true]);

/* ================= A. THE HEADLINE CONTROL: byte-identical across a colleague's lead ======== */
console.log("\n--- A. no class's op=stats moves when a colleague writes and follows a lead ---");
const VIEWERS = { "the admin TOKEN": "adm-r129s", "the member TOKEN": "mem-r129s",
                  "sam's member SESSION": SAM, "the probe TOKEN": "prb-r129s" };
const before = {};
for (const [k, tok] of Object.entries(VIEWERS)) before[k] = JSON.stringify(await stats(tok));
const L = await post("lead", { words: "I was told the contract was amended; look at the March agenda." }, VERA);
const lk = await post("leadlook", { lead: L && L.lead_id, state: "LOOKED_ABSENT", detail: "no such item" }, VERA);
t("A0: vera's lead and her look both LANDED (so the control below has a subject)",
  [!!(L && L.lead_id), lk && lk.ok], [true, true]);
const rd = await raw("leadread", `id=${L && L.lead_id}`, VERA);
t("A0b: and the look is really in the log — vera reads it back under authority_kind 'lead'",
  [rP(rd)?.looks?.length, rP(rd)?.looks?.[0]?.authority_kind], [1, "lead"]);
for (const [k, tok] of Object.entries(VIEWERS)) {
  const now = JSON.stringify(await stats(tok));
  t(`A1: ${k}'s WHOLE op=stats answer is byte-identical before and after vera's lead and look`,
    sha(now), sha(before[k]));
}

/* ================= B. PRESENCE: `leads` absent for all, `observations` present for all ======= */
console.log("\n--- B. `leads` is absent for every class; `observations` is present for every class ---");
const ALL = { ...VIEWERS, "vera's own member SESSION": VERA, "ruth's admin-ROLE member SESSION": RUTH };
for (const [k, tok] of Object.entries(ALL)) {
  const r = await stats(tok);
  t(`B1: ${k} receives op=stats with \`observations\` a number and NO \`leads\` — absent, not zero`,
    [typeof r?.bundles, ...shape(r)], ["number", false, true]);
}
for (const [k, tok] of Object.entries({ "the admin TOKEN": "adm-r129s", "the member TOKEN": "mem-r129s",
                                        "sam's member SESSION": SAM })) {
  const plain = JSON.stringify(await stats(tok));
  const asked = JSON.stringify(await stats(tok, "operator=1&proof=1&whole=1"));
  t(`B2: ${k} sending operator=1/proof=1/whole=1 gets the byte-identical answer — no parameter brings \`leads\` back`,
    sha(asked), sha(plain));
}

/* ================= C. THE LIAR ARM: `observations` MOVES on a non-lead observation ========== */
console.log("\n--- C. `observations` counts non-lead rows, moves when one is written, and means one thing ---");
const LIVE = { "the admin TOKEN": "adm-r129s", "the member TOKEN": "mem-r129s", "sam's member SESSION": SAM };
const c0 = {};
for (const [k, tok] of Object.entries(LIVE)) c0[k] = (await stats(tok))?.observations;
t("C0: every caller of the live store reads the SAME `observations` — one meaning for every caller",
  new Set(Object.values(c0)).size === 1 && typeof c0["the admin TOKEN"] === "number", true);
/* A NON-lead observation: a meaning-level derivation attempt (op=connect, REC-95's writer), which
   writes one LOOKED_ABSENT row for an entity nothing concerns. */
const cn = await post("connect", { entityId: "person:rec131" }, "adm-r129s");
t("C1a: the non-lead writer ran (op=connect answered ok)", cn && cn.ok, true);
for (const [k, tok] of Object.entries(LIVE)) {
  const now = (await stats(tok))?.observations;
  t(`C1: ${k}'s \`observations\` MOVED by exactly one on a non-lead observation`,
    typeof now === "number" && now - c0[k], 1);
}
const p0 = (await stats("prb-r129s"))?.observations;
const pc = await post("connect", { entityId: "person:rec131-scratch" }, "prb-r129s");
const p1 = (await stats("prb-r129s"))?.observations;
t("C2: the probe's `observations` (the SCRATCH store) MOVED by one on a scratch non-lead observation — "
  + "the probe's discriminating arm",
  [pc && pc.ok, typeof p1 === "number" && typeof p0 === "number" && p1 - p0], [true, 1]);

/* ================= D. THE SECOND AND THIRD DOORS ============================================ */
console.log("\n--- D. op=selftest and op=livefire relay the store's stats under the same rule ---");
const sM = await stats("mem-r129s");
const stM = await raw("selftest", "", "mem-r129s");
const stA = await raw("selftest", "", "adm-r129s");
t("D1: selftest answers both classes with the store's stats embedded",
  [typeof stM?.store?.bundles, typeof stA?.store?.bundles], ["number", "number"]);
t("D2: the member's and the admin's selftest carry `observations` and NO `leads`, the member's matching op=stats",
  [...shape(stM?.store), ...shape(stA?.store), stM?.store?.observations], [false, true, false, true, sM?.observations]);
const lf = await raw("livefire", "", "prb-r129s");
t("D3: op=livefire's relayed storeState carries `observations` and NO `leads`",
  shape(lf?.storeState), [false, true]);

/* ================= E. purge's proof is intact and WHOLE ===================================== */
console.log("\n--- E. purge's before/after are its proof, read from the store, and stay whole ---");
const sLive = await stats("adm-r129s");
const pg = rP(await raw("purge", "confirm=bio", "adm-r129s"));
t("E1: a whole-store purge of the live store still PROVES what it took — `leads` carried, one lead removed",
  [pg?.ok, pg?.before?.leads, pg?.removed?.leads, pg?.after?.leads], [true, 1, 1, 0]);
t("E2: and its `observations` is the WHOLE log — the wire count plus vera's one lead look — so the proof "
  + "counts every row the purge takes",
  typeof pg?.before?.observations === "number" && pg.before.observations - sLive.observations, 1);
t("E3: and afterwards the log is empty in both counts",
  [pg?.after?.observations, (await stats("adm-r129s"))?.observations], [0, 0]);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nstats-disclosure: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

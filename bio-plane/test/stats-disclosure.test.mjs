/* NEGATIVE CONTROL: RE-RUN 2026-09-24 by D-559's worker, `node test/nc-rec129.mjs` whole, after re-anchoring the wire count
 * (D-486 split it across lines) and the op=stats route (now two lines, `viewer` forwarded only when present). Before:
 * statsleadrows, statsadminleads, statsdropall, routeproof and keyboth DID NOT ARM (5 arms; the driver printed
 * "10 finding(s)" because it counted each unarmed arm twice, corrected in the same landing). After: `nc-rec129: 19 of 19
 * arm(s) armed, 0 finding(s)`, every restore YES. statsbaseline 36/0, statsleadrows 29/7, statsadminleads 30/6,
 * statsdropall 19/17, routeproof 13/23, purgethin 33/3, dbbytesmember 30/6, dbbytesall 27/9, dbbytesnone 30/6,
 * capacitycaller 29/7, keyboth 26/10: every figure the REC-131 line below records, unchanged. */
/* NEGATIVE CONTROL: (run 2026-09-18, REC-131 resumed) `node test/nc-rec129.mjs statsbaseline|statsleadrows|statsadminleads|statsdropall|routeproof|purgethin|dbbytesmember|dbbytesall|capacitycaller|keyboth`
 * from `bio-plane/`, one arm at a time, each restored from a per-arm pristine copy (sha256 + cmp YES).
 * All ARMED on the declared match count, all AS DECLARED (`nc-rec129: 0 finding(s) across 19 arm(s)`):
 * (a) `statsbaseline` 36/0. (b) `statsleadrows` — THE ROW'S FIRST CONTROL, lead rows put back into the
 * wire's count: 29/7 — A1 for admin, member TOKEN and sam's SESSION, F1 for both, F2, E2; the probe stays
 * green (non-discriminating, said). (c) `statsadminleads` — THE ROW'S SECOND CONTROL, `leads` back for the
 * admin class: 30/6 — only admin arms fail. (d) `statsdropall` — THE LIAR, the count dropped for everyone:
 * 19/17 and EVERY A1 STAYS GREEN — the headline alone cannot tell it from the fix; B/C/D catch it.
 * (e) `routeproof` — the route wired to purge's whole proof: 13/23. (f) `purgethin` — OVER-STRICTNESS,
 * purge's proof read from the wire: 33/3. (g) `dbbytesmember` — THE dbBytes CONTROL, `dbBytes` back for
 * the member class: 30/6 — B1 for the four member-class callers and F1 for the member TOKEN and sam's
 * SESSION. **A1 stayed GREEN under it**: the SHORT lead allocates no page, which is exactly why F's large
 * lead exists. (h) `dbbytesall` 27/9. (i) `dbbytesnone` — OVER-STRICTNESS, the admin loses capacity too:
 * 30/6. (j) `capacitycaller` — the server's stamp removed, a caller's `capacity=` honoured: 29/7.
 * (k) `keyboth` — BOB.md rule 7's liar, the narrow count under BOTH names: 26/10, while A and C stay green.
 * The frontier arms in the same run are unchanged (baseline 33/0, all seven AS DECLARED).
 *
 * REC-131 / IC-148 — CORRECTED 2026-09-18, NEVER EXEMPTED, AND RE-CORRECTED THE SAME DAY.
 *
 * FIRST CORRECTION. This suite was written by REC-129 for IC-144, which returned `leads` and the whole-log
 * `observations` to the `admin` CLASS only. BOB #15 corrected his own ruling (`MEMBER-KNOWLEDGE-DESIGN.md`
 * §5): **the caller who could read every lead does not exist** — `#leadVisibleTo` reaches no `class:*`
 * credential and deliberately skips the administrator arm, so the admin TOKEN reads no lead either, and
 * handing it the count was the overclaim this suite had been written to refuse. REC-129's arms that asserted
 * the admin receives `leads`, that member and probe receive no log count, and that an `operator` stamp
 * overwrote a caller's `operator=`, were corrected: `leads` is absent for every class, the log count is
 * present for every class, and the `operator` stamp is gone.
 *
 * SECOND CORRECTION (REC-131 resumed by CONDUCT #5 on two more BOB #15 rulings, before integration):
 *   - ONE KEY NEVER CARRIES TWO MEANINGS (BOB.md rule 7). The first correction published the narrower count
 *     under the old name `observations`, which purge's proof still uses for the WHOLE log. The wire's count is
 *     now `observationsNonLead`, and op=stats carries NO `observations` key (asserted, B1).
 *   - `dbBytes` LEAVES op=stats FOR MEMBER AND PROBE. The database's size moves in whole pages on every
 *     write, a lead's included, so a member diffing it across a colleague's large lead learned one had been
 *     written. The ADMIN CLASS keeps it (capacity is an operator need); that residue is STATED in §5 and
 *     IC-148, and asserted here as a residue (F2), not hidden. So the headline control for the admin is now
 *     "byte-identical except `dbBytes`", and a LARGE lead (near C-54.4's cap) is the arm that discriminates.
 *
 * WHAT THIS SUITE ASSERTS, all through the ops against the real plane in miniflare:
 *   A. THE HEADLINE CONTROL: an ADMIN-token, a member-token, a member-session and a probe `op=stats`
 *      answer are each BYTE-IDENTICAL before and after another member authors a lead and follows it (the
 *      admin's with `dbBytes` set aside — its stated residue);
 *   B. `leads` and `observations` are ABSENT for every class, `observationsNonLead` PRESENT for every class,
 *      `dbBytes` present for the admin CLASS only, and no caller-supplied parameter moves any of it;
 *   C. THE LIAR ARM: dropping the log count for everyone would make every A answer identical too, so
 *      `observationsNonLead` must MOVE when a NON-lead observation is written — for the admin token, the
 *      member token and a member session over the live store, and for the probe over scratch — and read the
 *      SAME number for every caller of one store;
 *   D. the second and third doors: op=selftest and op=livefire relay the store's stats under the same rule;
 *   E. `purge`'s D-113 proof is taken from the store's own counts and stays WHOLE — `observations` over the
 *      whole log, `leads`, and `dbBytes`, as op=purge has always answered;
 *   F. THE dbBytes CONTROL: a lead near the 128 KiB cap, followed, GROWS the database (F0 — the arm is
 *      armed), and the member token's, a member session's and the probe's WHOLE op=stats are byte-identical
 *      across it; the admin's differs ONLY in `dbBytes` (the stated residue).
 * THE PROBE's A and F arms are NON-DISCRIMINATING and say so: the probe reads the SCRATCH store, and a lead
 * can only be written by a signed-in member into the live one. Its discriminating arms are B1 (the key is
 * absent) and C2 (its log count moves on a scratch observation).
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
/* [has leads, has observations, observationsNonLead is a number, has dbBytes] */
const shape = (r) => [!!r && "leads" in r, !!r && "observations" in r,
                      typeof (r && r.observationsNonLead) === "number", !!r && "dbBytes" in r];
const MEMBER_SHAPE = [false, false, true, false];
const ADMIN_SHAPE = [false, false, true, true];
const sansDb = (r) => { if (!r || typeof r !== "object") return r; const { dbBytes, ...rest } = r; return rest; };
const ADMIN = "adm-r129s";

try {
const enrol = async (memberId, role) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: ["contribute", "publish"] }, ADMIN);
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
const s0 = await stats(ADMIN);
t("FIXTURE: the admin's op=stats answers, carries `observationsNonLead` and `dbBytes`, and neither `leads` "
  + "nor `observations`", [typeof s0?.bundles, ...shape(s0)], ["number", ...ADMIN_SHAPE]);

/* the admin's answer is compared with `dbBytes` set aside — its STATED residue (F2). */
const VIEWERS = { "the admin TOKEN": ADMIN, "the member TOKEN": "mem-r129s",
                  "sam's member SESSION": SAM, "the probe TOKEN": "prb-r129s" };
const view = async (tok) => JSON.stringify(tok === ADMIN ? sansDb(await stats(tok)) : await stats(tok));

/* ================= A. THE HEADLINE CONTROL: byte-identical across a colleague's lead ======== */
console.log("\n--- A. no class's op=stats moves when a colleague writes and follows a lead ---");
const before = {};
for (const [k, tok] of Object.entries(VIEWERS)) before[k] = await view(tok);
const L = await post("lead", { words: "I was told the contract was amended; look at the March agenda." }, VERA);
const lk = await post("leadlook", { lead: L && L.lead_id, state: "LOOKED_ABSENT", detail: "no such item" }, VERA);
t("A0: vera's lead and her look both LANDED (so the control below has a subject)",
  [!!(L && L.lead_id), lk && lk.ok], [true, true]);
const rd = await raw("leadread", `id=${L && L.lead_id}`, VERA);
t("A0b: and the look is really in the log — vera reads it back under authority_kind 'lead'",
  [rP(rd)?.looks?.length, rP(rd)?.looks?.[0]?.authority_kind], [1, "lead"]);
for (const [k, tok] of Object.entries(VIEWERS)) {
  const now = await view(tok);
  t(`A1: ${k}'s WHOLE op=stats answer${tok === ADMIN ? " (dbBytes set aside)" : ""} is byte-identical before `
    + "and after vera's lead and look", sha(now), sha(before[k]));
}

/* ================= B. PRESENCE ================================================================ */
console.log("\n--- B. `leads`/`observations` absent for all; `observationsNonLead` for all; `dbBytes` admin only ---");
const ALL = { ...VIEWERS, "vera's own member SESSION": VERA, "ruth's admin-ROLE member SESSION": RUTH };
for (const [k, tok] of Object.entries(ALL)) {
  const r = await stats(tok);
  t(`B1: ${k} receives op=stats: \`observationsNonLead\` a number, no \`leads\`, no \`observations\`, and `
    + (tok === ADMIN ? "`dbBytes` (the admin CLASS keeps capacity)" : "no `dbBytes` — absent, not zero"),
    [typeof r?.bundles, ...shape(r)], ["number", ...(tok === ADMIN ? ADMIN_SHAPE : MEMBER_SHAPE)]);
}
for (const [k, tok] of Object.entries({ "the member TOKEN": "mem-r129s", "sam's member SESSION": SAM,
                                        "the probe TOKEN": "prb-r129s" })) {
  const plain = JSON.stringify(await stats(tok));
  const asked = JSON.stringify(await stats(tok, "operator=1&proof=1&whole=1&capacity=1"));
  t(`B2: ${k} sending capacity=1/operator=1/proof=1/whole=1 gets the byte-identical answer — the server's `
    + "stamp overwrites it, and no parameter brings `leads`, `observations` or `dbBytes` back",
    sha(asked), sha(plain));
}
{
  const plain = JSON.stringify(sansDb(await stats(ADMIN)));
  const r = await stats(ADMIN, "capacity=0");
  t("B3: OVER-STRICTNESS — the admin TOKEN sending capacity=0 still receives `dbBytes` and an otherwise "
    + "identical answer (the stamp is the server's in both directions)",
    [typeof r?.dbBytes, sha(JSON.stringify(sansDb(r)))], ["number", sha(plain)]);
}

/* ================= C. THE LIAR ARM: the log count MOVES on a non-lead observation ============ */
console.log("\n--- C. `observationsNonLead` moves when a non-lead row is written, and means one thing ---");
const LIVE = { "the admin TOKEN": ADMIN, "the member TOKEN": "mem-r129s", "sam's member SESSION": SAM };
const c0 = {};
for (const [k, tok] of Object.entries(LIVE)) c0[k] = (await stats(tok))?.observationsNonLead;
t("C0: every caller of the live store reads the SAME `observationsNonLead` — one meaning for every caller",
  new Set(Object.values(c0)).size === 1 && typeof c0["the admin TOKEN"] === "number", true);
/* A NON-lead observation: a meaning-level derivation attempt (op=connect, REC-95's writer), which
   writes one LOOKED_ABSENT row for an entity nothing concerns. */
const cn = await post("connect", { entityId: "person:rec131" }, ADMIN);
t("C1a: the non-lead writer ran (op=connect answered ok)", cn && cn.ok, true);
for (const [k, tok] of Object.entries(LIVE)) {
  const now = (await stats(tok))?.observationsNonLead;
  t(`C1: ${k}'s \`observationsNonLead\` MOVED by exactly one on a non-lead observation`,
    typeof now === "number" && now - c0[k], 1);
}
const p0 = (await stats("prb-r129s"))?.observationsNonLead;
const pc = await post("connect", { entityId: "person:rec131-scratch" }, "prb-r129s");
const p1 = (await stats("prb-r129s"))?.observationsNonLead;
t("C2: the probe's `observationsNonLead` (the SCRATCH store) MOVED by one on a scratch non-lead observation — "
  + "the probe's discriminating arm",
  [pc && pc.ok, typeof p1 === "number" && typeof p0 === "number" && p1 - p0], [true, 1]);

/* ================= D. THE SECOND AND THIRD DOORS ============================================ */
console.log("\n--- D. op=selftest and op=livefire relay the store's stats under the same rule ---");
const sM = await stats("mem-r129s");
const stM = await raw("selftest", "", "mem-r129s");
const stP = await raw("selftest", "", "prb-r129s");
const stA = await raw("selftest", "", ADMIN);
t("D1: selftest answers every class with the store's stats embedded",
  [typeof stM?.store?.bundles, typeof stP?.store?.bundles, typeof stA?.store?.bundles], ["number", "number", "number"]);
t("D2: the member's and the probe's selftest carry the member shape (no `dbBytes`), the admin's the admin "
  + "shape; the member's count matches its op=stats",
  [...shape(stM?.store), ...shape(stP?.store), ...shape(stA?.store), stM?.store?.observationsNonLead],
  [...MEMBER_SHAPE, ...MEMBER_SHAPE, ...ADMIN_SHAPE, sM?.observationsNonLead]);
const lfP = await raw("livefire", "", "prb-r129s");
t("D3: the probe's op=livefire storeState carries the member shape — no `dbBytes`, `leads` or `observations`",
  shape(lfP?.storeState), MEMBER_SHAPE);
const lfA = await raw("livefire", "", ADMIN);
t("D4: OVER-STRICTNESS — the admin's op=livefire storeState keeps `dbBytes`", shape(lfA?.storeState), ADMIN_SHAPE);

/* ================= F. THE dbBytes CONTROL: a lead that allocates pages ======================= */
console.log("\n--- F. a lead near the 128 KiB cap grows the database; only the admin can see it did ---");
const fBefore = {};
for (const [k, tok] of Object.entries(VIEWERS)) fBefore[k] = JSON.stringify(await stats(tok));
const BIG = "I was told the minutes were rewritten after the vote. ".repeat(2300).slice(0, 126 * 1024);
const LB = await post("lead", { words: BIG }, VERA);
const lkB = await post("leadlook", { lead: LB && LB.lead_id, state: "LOOKED_ABSENT", detail: "not in the archive" }, VERA);
t(`F0a: vera's LARGE lead (${BIG.length} chars, under C-54.4's cap) and her look both LANDED`,
  [!!(LB && LB.lead_id), lkB && lkB.ok], [true, true]);
const sAfter = await stats(ADMIN);
const grew = sAfter?.dbBytes - JSON.parse(fBefore["the admin TOKEN"])?.dbBytes;
t(`F0: THE ARM IS ARMED — the database GREW across the large lead (dbBytes +${grew}), so an arm that put `
  + "`dbBytes` back for a member would move that member's answer", grew > 0, true);
for (const [k, tok] of Object.entries(VIEWERS)) {
  if (tok === ADMIN) continue;
  const now = JSON.stringify(await stats(tok));
  t(`F1: ${k}'s WHOLE op=stats answer is byte-identical across the large lead`
    + (tok === "prb-r129s" ? " (NON-DISCRIMINATING: the probe reads scratch)" : ""), sha(now), sha(fBefore[k]));
}
t("F2: THE STATED RESIDUE — the admin's answer differs across the large lead ONLY in `dbBytes`",
  sha(JSON.stringify(sansDb(sAfter))), sha(JSON.stringify(sansDb(JSON.parse(fBefore["the admin TOKEN"])))));

/* ================= E. purge's proof is intact and WHOLE ===================================== */
console.log("\n--- E. purge's before/after are its proof, read from the store, and stay whole ---");
const sLive = await stats(ADMIN);
const pg = rP(await raw("purge", "confirm=bio", ADMIN));
t("E1: a whole-store purge of the live store still PROVES what it took — `leads` carried, two leads removed",
  [pg?.ok, pg?.before?.leads, pg?.removed?.leads, pg?.after?.leads], [true, 2, 2, 0]);
t("E2: and its proof carries `observations` over the WHOLE log — the wire's non-lead count plus vera's two "
  + "lead looks — and NOT the wire's key",
  [typeof pg?.before?.observations === "number" && pg.before.observations - sLive.observationsNonLead,
   !!pg?.before && "observationsNonLead" in pg.before], [2, false]);
t("E3: and `dbBytes`, as op=purge has always answered; afterwards the log is empty in both counts",
  [typeof pg?.before?.dbBytes, pg?.after?.observations, (await stats(ADMIN))?.observationsNonLead], ["number", 0, 0]);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nstats-disclosure: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

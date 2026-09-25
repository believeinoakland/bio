/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec-186-leave-join.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`d311.control.mjs`'s precedent). Re-run from `bio-plane/`: `node test/rec-186-leave-join.control.mjs [arm]`. Each arm ALONE, its anchor asserted to occur exactly once, every source restored from a per-arm pristine copy and verified by sha256, by content and by `cmp`. (1) THE OWNER CHECK DROPPED — `projectLeave`'s last-owner floor removed -> MUST FAIL "THE REFUSAL"; MUST NOT FAIL "THE JOIN OFFER". (2) JOIN OFFERED UNCONDITIONALLY — `projectjoin`'s `!== "joined"` clause removed -> MUST FAIL "THE JOIN OFFER"; MUST NOT FAIL "THE REFUSAL". (3) OVER-STRICTNESS — `projectLeave` refuses EVERY owner, co-owners included -> MUST FAIL "A CO-OWNER'S LEAVE LANDS"; MUST NOT FAIL "THE JOIN OFFER".
   RESULTS, RUN 2026-09-25 by the REC-186 worker (sources affordances.mjs 170,877 B sha256 11c85f98a2c6…, store.mjs 3,329,890 B sha256 c7e283dae0c8…, each restored after every arm and verified by sha256, by content and by `cmp` x2): BASELINE 8/0 · (1) 7/1 — "THE REFUSAL" alone · (2) 6/2 — "THE JOIN OFFER" and "THE OFFERED JOIN LANDS" (olga, once joined, is still offered join: WIDER than declared, kept — it is the same overclaim met from the other side) · (3) 7/1 — "A CO-OWNER'S LEAVE LANDS" alone · (4) 7/1 — "THE LEAVE OFFER" alone. 4 arms, 0 other than declared. */
/* REC-186 — MEMBERSHIP v2 §7.6 and §7.10's two unruled edges, RULED by BOB #31 on 2026-09-23 21:37Z:
 *   (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE": `projectLeave` refuses the last owner by name
 *       (LAST_OWNER_CANNOT_LEAVE, C-33.47: "transfer ownership first"), `op=affordances` does not offer it,
 *       and a non-last owner may leave.
 *   (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN": `projectJoin` stays idempotent, but an offer that does
 *       nothing is an overclaim.
 * Everything here goes THROUGH THE OPS (op=projectleave, op=projectjoin, op=affordances) with member
 * session tokens; the only DO-direct calls are fixture set-up and the participant read that is the witness.
 * WHAT THE WITNESS CAN AND CANNOT SEE: "the membership rows byte-identical after" is measured on
 * `projectParticipants`' published columns (handle, state, owner, comment, created) for EVERY row of the
 * project, serialized and compared as bytes; the row's `updated` column is published by no op, so it is
 * not witnessed here — the refusal returns before the store's only UPDATE, which the control's arm (1)
 * shows by the rows moving when the check is gone. */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171's fixture wrapper, as d311's suite */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ACT_SHAPE_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const ADM = "adm-rec186", MEM = "mem-rec186";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};
const codeOf = (r) => (r && r.ok === true) ? "ok" : (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE ops under test, uninterpolated so coverage credits them here. */
const offered = async (tok, target) => ((await GET(`op=affordances&token=${tok}&target=${E(target)}`))?.acts ?? [])
  .map((a) => a.id);
const leave = (tok, p) => POST(`op=projectleave&token=${tok}&projectId=${p}&comment=${E("rec-186 probe")}`);
const join = (tok, p) => POST(`op=projectjoin&token=${tok}&projectId=${p}`);
/* THE WITNESS: every row of the project, as the store publishes it, as bytes. */
const rowsOf = async (p) => JSON.stringify(must(`participants of ${p}`,
  await DO(`projectparticipants?projectId=${p}&by=ruth`, {})).participants);
const stateOf = async (p, handle) => JSON.parse(await rowsOf(p)).find((r) => r.handle === handle)?.state ?? null;

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-rec186" }));
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-rec186` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-rec186` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("ruth", "admin");                 /* the administrator whose sight reads the witness */
const IRIS = await enrol("iris", "member");   /* SOLE owner of PA; co-owner of PC */
const PAM = await enrol("pam", "member");     /* second owner of PC */
const OLGA = await enrol("olga", "member");   /* INVITED to PA, not yet joined */
const DAN = await enrol("dan", "member");     /* JOINED PA, not an owner */
const ZED = await enrol("zed", "member");     /* joined PA, then asked to leave */

let snapSeq = 0;
const projectMd = (name) => ["---", "object_type: project", `title: "${name}"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "references: []",
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", "A project.", "",
  "## Session Log", ""].join("\n");
const mkProject = async (name) => {
  const text = projectMd(name);
  return must(`promote ${name}`, await POST(`op=promote&token=${ADM}`, {
    base: null, snapKey: `rec186-${++snapSeq}-${sha(name).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: name, current_state: "forming",
            created: NOW, last_updated: LATER } })).bundleId;
};
const PA = await mkProject("REC-186 project A");
const PC = await mkProject("REC-186 project C");
const DOinvite = (p, handle, by) => DO(`projectinvite?projectId=${p}&handle=${handle}&by=${by}&viewer=admin`, {});
must("iris owns PA", await DO("projectclaimowner", { projectId: PA, memberId: "iris" }));
must("iris owns PC", await DO("projectclaimowner", { projectId: PC, memberId: "iris" }));
for (const h of ["olga", "dan", "zed"]) must(`iris invites ${h} to PA`, await DOinvite(PA, h, "iris"));
must("dan joins PA", await join(DAN, PA));
must("zed joins PA", await join(ZED, PA));
must("zed asks to leave PA", await leave(ZED, PA));
must("iris invites pam to PC", await DOinvite(PC, "pam", "iris"));
must("pam joins PC", await join(PAM, PC));
must("iris adds pam as PC's second owner (the sole owner acts alone, 7.10)",
  await POST(`op=projectowneradd&token=${IRIS}&projectId=${PC}&handle=pam`));

const PA_ROWS = JSON.parse(await rowsOf(PA)), PC_ROWS = JSON.parse(await rowsOf(PC));
console.log(`  corpus: PA ${PA_ROWS.length} rows ${PA_ROWS.map((r) => `${r.handle}:${r.state}${r.owner ? "*" : ""}`).join(" ")}`
          + ` · PC ${PC_ROWS.length} rows ${PC_ROWS.map((r) => `${r.handle}:${r.state}${r.owner ? "*" : ""}`).join(" ")}`);
t("FIXTURE GUARD: PA has exactly ONE owner (iris, joined) beside an invitee, a joined participant and a leaving one; "
+ "PC has TWO owners (iris, pam), both joined",
  [PA_ROWS.map((r) => [r.handle, r.state, !!r.owner]), PC_ROWS.map((r) => [r.handle, r.state, !!r.owner])],
  [[["iris", "joined", true], ["dan", "joined", false], ["olga", "invited", false], ["zed", "leaving", false]],
   [["iris", "joined", true], ["pam", "joined", true]]]);

/* ============================ (a) THE LAST OWNER DOES NOT ASK TO LEAVE */
console.log("\n--- (a) the project's only owner cannot ask to leave; a co-owner can ---");
const irisPA = await offered(IRIS, PA);
const before = await rowsOf(PA);
const refused = await leave(IRIS, PA);
const after = await rowsOf(PA);
console.log(`  iris@PA leave -> ${codeOf(refused)} · rows ${sha(before).slice(0, 12)} -> ${sha(after).slice(0, 12)} (${Buffer.byteLength(before)} B)`);
t("THE REFUSAL: op=projectleave refuses PA's only owner BY NAME (LAST_OWNER_CANNOT_LEAVE, saying to transfer "
+ "ownership first), and every one of PA's membership rows is byte-identical after",
  [codeOf(refused), refused?.ok, /transfer ownership first/i.test(String(refused?.detail ?? "")),
   Buffer.byteLength(before) > 100, after === before],
  ["LAST_OWNER_CANNOT_LEAVE", false, true, true, true]);
t("THE REFUSAL IS CATALOGUED: LAST_OWNER_CANNOT_LEAVE has a DEC-49 row — its check, its region, and a canned "
+ "translation that tells the member what to do and that nothing was recorded",
  [ACT_SHAPE_CHECKS.LAST_OWNER_CANNOT_LEAVE?.check, ACT_SHAPE_CHECKS.LAST_OWNER_CANNOT_LEAVE?.where,
   /Add another owner first/.test(ACT_SHAPE_CHECKS.LAST_OWNER_CANNOT_LEAVE?.translation ?? ""),
   /Nothing was recorded/.test(ACT_SHAPE_CHECKS.LAST_OWNER_CANNOT_LEAVE?.translation ?? "")],
  ["C-33.47", "src/store.mjs projectLeave > is-leave-owner-floor", true, true]);
t("THE LEAVE OFFER: op=affordances does NOT offer projectleave to PA's only owner, and still offers her the "
+ "owner's acts (projectinvite), so the withholding is the floor and not a lost position",
  [irisPA.includes("projectleave"), irisPA.includes("projectinvite")], [false, true]);

const irisPC = await offered(IRIS, PC), pamPC = await offered(PAM, PC);
const coLeave = await leave(PAM, PC);
t("A CO-OWNER'S LEAVE LANDS: on two-owner PC both owners are OFFERED projectleave, and pam's request is recorded "
+ "(state `leaving`, her comment kept) — a request, which leaves her an owner (7.6; ownership is 7.10's)",
  [irisPC.includes("projectleave"), pamPC.includes("projectleave"), codeOf(coLeave), coLeave?.state,
   JSON.parse(await rowsOf(PC)).find((r) => r.handle === "pam")],
  [true, true, "ok", "leaving",
   { ...PC_ROWS.find((r) => r.handle === "pam"), state: "leaving", comment: "rec-186 probe" }]);

/* ============================ (b) A JOINED PARTICIPANT IS NOT OFFERED JOIN */
console.log("\n--- (b) join is offered to a participant who is not joined, and to no one who is ---");
const offers = { iris: irisPA, dan: await offered(DAN, PA), olga: await offered(OLGA, PA), zed: await offered(ZED, PA) };
for (const [h, a] of Object.entries(offers)) console.log(`  ${h}@PA offered: ${a.filter((x) => /^project/.test(x)).join(", ") || "(no roster act)"}`);
t("THE JOIN OFFER: op=affordances offers projectjoin to NO joined participant of PA (iris the owner, dan) and "
+ "DOES offer it to the invited non-participant (olga) and to the one asking to leave (zed, whose join withdraws it)",
  [offers.iris.includes("projectjoin"), offers.dan.includes("projectjoin"),
   offers.olga.includes("projectjoin"), offers.zed.includes("projectjoin")],
  [false, false, true, true]);
/* The store is NOT narrowed: the ruling keeps projectJoin idempotent. A joined participant's join still
   answers ok and changes no published column — which is exactly why offering it would overclaim. */
const danBefore = await rowsOf(PA);
const danJoin = await join(DAN, PA);
t("projectJoin STAYS IDEMPOTENT: dan (joined) joining again answers ok and PA's rows are byte-identical — the "
+ "act the offer withholds is one that does nothing",
  [codeOf(danJoin), (await rowsOf(PA)) === danBefore], ["ok", true]);
const olgaJoin = await join(OLGA, PA);
t("THE OFFERED JOIN LANDS: olga (invited) joins through op=projectjoin and is `joined` after; once joined she is "
+ "offered projectleave and no longer projectjoin",
  [codeOf(olgaJoin), await stateOf(PA, "olga"),
   (await offered(OLGA, PA)).includes("projectleave"), (await offered(OLGA, PA)).includes("projectjoin")],
  ["ok", "joined", true, false]);

} catch (e) {
  console.log(`  FAIL  the suite THREW before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nrec-186-leave-join: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 && pass > 0 ? 0 : 1);

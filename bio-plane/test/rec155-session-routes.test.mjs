/* NEGATIVE CONTROL: DECLARED HERE, RUN BY HAND AGAINST UNIQUELY-NAMED PRISTINE COPIES, restore verified by
   sha256 AND `cmp`, each arm ALONE. Declared before arming — what MUST fail and what MUST NOT:
   (a) BASELINE — nothing armed. MUST be green.
   (b) ONE OP DROPPED FROM ONE SESSION_OPS SET — `provenanceroute` removed from the MEMBER set's spread
       (the admin set untouched). MUST FAIL naming `provenanceroute`, at the member arm AND the enrolled
       administrator's arm (whose `kind` is `member`), and MUST NOT fail at the founder's arm. The row's
       accepts-when names this arm.
   (c) A DECISION UN-RECORDED — `livefire` removed from `UNATTENDED_BY_DECISION`. MUST FAIL naming `livefire`.
   (d) OVER-STRICTNESS — the five written as string LITERALS in both sets instead of the two named arrays.
       MUST PASS: this suite grades REACH, never the spelling that confers it.
   RESULT, RUN 2026-09-25 BY THE REC-155 WORKER (branch `land/worker/REC-155`, base `8bdf20e6`), each arm alone,
   index.mjs 842,163 B restored and verified by sha256 MATCH and `cmp` clean after every arm: **4/4 AS DECLARED —
   a GREEN 14/0 · b RED 11/3 naming provenanceroute (member and enrolled administrator refused
   SESSION_ROLE_CANNOT_REACH_OP, the founder's arm still the op's own result; the marker's `by` and the
   view-only arm fail with it) · c RED 13/1 naming livefire · d GREEN 14/0 (armed 2/2).**
 * =========================================================================
 * rec155-session-routes.test.mjs — REC-155. SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE
 * REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED, AND DRIVEN.
 *
 * THE DESIGN IS `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (RULED by BOB #19, 2026-09-21),
 * cited rather than restated:
 *   - `provenancechain` and `provenanceroute` JOIN BOTH SESSION SETS — their OPS rows call the act "a named
 *     member's judgement", and a signed-in session is the one caller that carries a name;
 *   - `calibrate`, `calibrationsubject` and `calibrationsignal` JOIN BOTH SESSION SETS — a person may measure
 *     on the same terms as a probe, and a measurement never moves a grade (`CAL_CANNOT_REGRADE`);
 *   - `livefire` and `reproject` are UNATTENDED BY DECISION, each recorded with the citation §4.10 quotes.
 *   - No class list moves, so every bearer keeps its reach (the bearer write closes in REC-158, not here).
 *
 * HOW A LIAR PASSES IT, and why every arm here goes through `index.mjs`: an arm that calls the STORE
 * directly passes over a plane whose session gate still refuses everybody — the gate lives in the control
 * plane. So every call below is an HTTP request to the Worker carrying a session token, and each op's
 * answer is asserted to be THE OP'S OWN RESULT (a field only the handler writes), never "no gate code".
 *
 * THE THREE SESSIONS, and why three: `kind` is `sess.role === "admin" ? "admin" : "member"`, so
 * `SESSION_OPS.admin` is the FOUNDER'S session alone and an ENROLLED administrator holds a `member` kind
 * (`d270-refusal-truth.test.mjs` records two harnesses measuring a split of zero by confusing them). The
 * row asks for a member and an administrator; the enrolled administrator is the one §4.10 is about, and the
 * founder's session is driven as well so a one-set regression fails at a named arm.
 *
 * WHAT IT CAN AND CANNOT SEE:
 *   - IT CAN SEE each of the five answering each session with its own result, the marker's `by` naming the
 *     session's member, the two unattended ops refusing every session with the recorded citation, and the
 *     bearer classes still reaching all seven.
 *   - IT CANNOT SEE who `op=provenancechain apply=1` records as the revision's author: no op publishes a
 *     revision's author, so that attribution is asserted at the code (the `author` stamp names `sessMember`
 *     on a session, `shadowed-refusals.test.mjs` (b)) and NOT read back here.
 *   - `calibrate`'s `measured_by` is a CALLER-SUPPLIED string, for a session as for a bearer; this suite
 *     does not grade it (D-587, minted by REC-155 and sent to SCHEDULER; not built here).
 *   - IT IS NOT A LIVE PROBE. A green harness is not a serving build (D-108).
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { ADMISSION_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "t-admin-155", MEMBER_TOKEN: "t-member-155", PROBE_TOKEN: "t-probe-155",
              VERSION: "test", INSTANCE_NAME: "rec155" },
});
const call = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const res = (r) => (r && typeof r.result === "object" && r.result !== null ? r.result : r || {});
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const GATE_CODES = new Set(["MACHINE_CREDENTIAL_REQUIRED", "SESSION_ROLE_CANNOT_REACH_OP",
                            "SESSION_ROUTE_NOT_RECORDED"]);
const codeOf = (r) => r?.reason ?? r?.code ?? r?.result?.reason ?? null;

try {
/* ====================================================================== 1
 * THE SESSIONS — and the kinds asserted REAL before anything is graded over them.
 * ==================================================================== */
console.log("\n=== REC-155 · §4.10's seven session routes, driven through the plane ===");
console.log("\n--- 1. three sessions: a member, an ENROLLED administrator, the founder ---");
const enrol = async (id, role, caps) => {
  const add = await call("op=memberadd&token=t-admin-155",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await call("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await call("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.result.token;
};
/* Two administrators first (§4.2/4.3): no ordinary member exists until two do. */
const ADM = await enrol("ada155", "admin", ["contribute"]);
await enrol("ben155", "admin", ["contribute"]);
const MEM = await enrol("mo155", "member", ["contribute"]);
const VIEW = await enrol("vi155", "member", []);          /* view-only: meets NEEDS, not the session gate */
await call("op=claim", { bootstrapToken: "t-admin-155", password: "founder-passphrase-155" });
const flog = await call("op=login", { role: "admin", password: "founder-passphrase-155" });
if (!flog.result?.token) throw new Error(`founder login: ${JSON.stringify(flog)}`);
const FOUNDER = "token=" + flog.result.token;
const SESSIONS = { member: MEM, "enrolled administrator": ADM, founder: FOUNDER };
const WHO = { member: "mo155", "enrolled administrator": "ada155" };

/* THE KINDS ARE REAL: `governorconfig` is the founder's session alone (§4.9, BOB #23) — refused to the
   enrolled administrator AT THE GATE and admitted for the founder. If this pair agrees, the "administrator"
   arm below is a member arm wearing a name. */
{
  const asAdm = codeOf(await call(`op=governorconfig&${ADM}`, { host: "example.org", appetite: 1 }));
  const asFounder = codeOf(await call(`op=governorconfig&${FOUNDER}`, { host: "example.org", appetite: 1 }));
  t("the enrolled administrator's session is a MEMBER kind and the founder's is not — asserted as a PAIR at "
  + "governorconfig, so a harness that confused them fails here rather than measuring nothing",
    [GATE_CODES.has(asAdm), GATE_CODES.has(asFounder)], [true, false]);
}

/* ====================================================================== 2
 * THE FIXTURES — a document whose route CAN be shown, and one whose route cannot. Seeded by the member
 * BEARER, because seeding is not the subject; floored before anything is asserted over them.
 * ==================================================================== */
console.log("\n--- 2. the documents the provenance pair acts on ---");
const NOW = "2026-09-25T00:00:00Z";
const bundleMd = (id) => `---\nid: ${id}\nobject_type: information\ncurrent_state: verified\n---\n\n# ${id}\n`;
const DERIVABLE = {
  file: "snapshots/capture-2026-09-01-doc.pdf",
  locator: "https://www.example.gov/reports/rec155.pdf",
  authority: "Example Finance Department",
  retrieved: "2026-09-01T12:00:00Z",
  capture: { method: "daemon-fetch", grade: "B", actor_class: "daemon", sha256: "a".repeat(64) },
};
const NO_ROUTE = { file: "snapshots/rec155-mystery.pdf", locator: "", capture: { grade: "C" } };
const seed = async (id, docs) => {
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: docs }, null, 2);
  return call("op=promote&token=t-member-155", {
    bundleId: id, base: null, snapKey: "20260925T000000Z_aaaa1551", author: "m-seed",
    meta: { object_type: "information", group: "rec155", title: id, current_state: "verified",
            created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [],
  });
};
const KEYS = Object.keys(SESSIONS);
const docId = (k, what) => `INFO-2026-${String(1550 + KEYS.indexOf(k) * 2 + (what === "route" ? 1 : 0))}-${what}`;
for (const k of KEYS) { await seed(docId(k, "chain"), [{ ...DERIVABLE }]); await seed(docId(k, "route"), [{ ...NO_ROUTE }]); }
const listed = (res(await GET("op=list&token=t-member-155")) || []);
const ids = (Array.isArray(listed) ? listed : []).map((r) => r.bundle_id);
t("the six fixture documents are in the store before anything is asserted about them",
  KEYS.flatMap((k) => [docId(k, "chain"), docId(k, "route")]).filter((id) => !ids.includes(id)), []);

/* ====================================================================== 3
 * THE FIVE, EACH DRIVEN FROM EACH SESSION, EACH ANSWERING WITH ITS OWN RESULT.
 * ==================================================================== */
console.log("\n--- 3. the five that JOIN BOTH SESSION SETS answer every session with the op's own result ---");
const FIVE = ["provenancechain", "provenanceroute", "calibrate", "calibrationsubject", "calibrationsignal"];
const probeInputs = { corpus: "rec155-synthetic", pages: 4, ground_truth_sha: "0".repeat(64) };
const answers = {};                    /* answers[op][session] = what the handler said, or the gate code */
for (const op of FIVE) answers[op] = {};
for (const [k, S] of Object.entries(SESSIONS)) {
  const engine = `rec155-engine-${KEYS.indexOf(k)}`;
  const report = res(await call(`op=provenancechain&bundleId=${docId(k, "chain")}&${S}`));
  const applied = res(await call(`op=provenancechain&bundleId=${docId(k, "chain")}&apply=1&${S}`));
  answers.provenancechain[k] = codeOf(report) ?? codeOf(applied)
    ?? `report.applied=${report.applied} outcome=${report.documents?.[0]?.outcome} apply.applied=${applied.applied}`;
  const mark = res(await call(`op=provenanceroute&bundleId=${docId(k, "route")}&${S}`));
  answers.provenanceroute[k] = codeOf(mark) ?? `appended=${mark.appended} finding=${mark.route?.finding}`;
  const sub = res(await call(`op=calibrationsubject&${S}`, { engine, version: "1.0", probe_id: "rec155-probe" }));
  answers.calibrationsubject[k] = codeOf(sub) ?? `ok=${sub.ok} measured=${sub.measured}`;
  const cal = res(await call(`op=calibrate&${S}`, {
    engine, version: "1.0", at: "2026-09-20T00:00:00Z", cap: "C", probe_id: "rec155-probe",
    probe_inputs: probeInputs, scores: { char_error_rate: 0.02, minted_digits: 0, pages_scored: 4 },
    measured_by: `rec155-session-routes.test.mjs (synthetic, as ${k})` }));
  answers.calibrate[k] = codeOf(cal) ?? `calibration_id=${/^CAL-\d+$/.test(cal.calibration_id || "")}`;
  const sig = res(await call(`op=calibrationsignal&${S}`,
    { engine, source: "rec155 fixture vendor", detail: "announced", probe_by_ms: 0 }));
  answers.calibrationsignal[k] = codeOf(sig) ?? `ok=${sig.ok} changed_grades=${sig.changed_grades}`;
  /* THE NAME AGAINST THE MARKER: a session's marker carries its OWN member, which is §4.10's reason for
     the route — "a signed-in session is the one caller that carries a name". The founder has no roster
     row, so its stamp is whatever the session resolver names; asserted only to be no machine's. */
  answers.provenanceroute[`${k}:by`] = mark.route?.by ?? null;
}
console.log(`    answers: ${JSON.stringify(answers)}`);
const want = {
  provenancechain: "report.applied=false outcome=reconstructed apply.applied=true",
  provenanceroute: "appended=true finding=LOOKED_INDETERMINATE",
  calibrationsubject: "ok=true measured=false",
  calibrate: "calibration_id=true",
  calibrationsignal: "ok=true changed_grades=0",
};
for (const op of FIVE)
  t(`op=${op} answers the member, the enrolled administrator and the founder with ITS OWN RESULT — never a `
  + "gate code (BIO_Membership_Architecture_v2.md §4.10)",
    Object.fromEntries(KEYS.map((k) => [k, answers[op][k]])), Object.fromEntries(KEYS.map((k) => [k, want[op]])));
t("and a session's route marker is stamped with THAT MEMBER's own name — the reason §4.10 gives the pair a "
+ "session route at all",
  [answers.provenanceroute["member:by"], answers.provenanceroute["enrolled administrator:by"]],
  [WHO.member, WHO["enrolled administrator"]]);
t("and the founder's marker is not stamped as a machine — `token:<class>` names nobody",
  /^token:/.test(String(answers.provenanceroute["founder:by"])) || !answers.provenanceroute["founder:by"], false);
/* THE CAPABILITY FLOOR (NEEDS, REC-155's provisional `contribute`): a view-only member passes the SESSION
   gate — none of the five answers her with a session-gate code — and meets the capability gate behind it. */
{
  const viewAnswers = {};
  for (const op of FIVE) {
    const r = await call(`op=${op}&bundleId=${docId("member", "chain")}&${VIEW}`, { engine: "x", probe_id: "y" });
    viewAnswers[op] = [codeOf(r), r.needs ?? null];
  }
  t("a VIEW-ONLY member passes the session gate at all five and meets the capability gate — NOT_CAPABLE, "
  + "needing contribute (REC-155's provisional NEEDS entry, stated at its site)",
    viewAnswers, Object.fromEntries(FIVE.map((o) => [o, ["NOT_CAPABLE", "contribute"]])));
}

/* ====================================================================== 4
 * THE TWO UNATTENDED BY DECISION — refused to EVERY session, and the refusal cites §4.10's artifact.
 * ==================================================================== */
console.log("\n--- 4. livefire and reproject: every session refused, citing the recorded decision ---");
const CITES = { livefire: /§4\.10[\s\S]*src\/livefire\.mjs/, reproject: /§4\.10[\s\S]*src\/store\.mjs/ };
for (const op of ["livefire", "reproject"]) {
  const got = {};
  for (const [k, S] of Object.entries(SESSIONS)) {
    const r = await call(`op=${op}&${S}`, {});
    got[k] = [codeOf(r), r.check ?? null, CITES[op].test(String(r.recorded || ""))];
  }
  t(`op=${op} answers EVERY session MACHINE_CREDENTIAL_REQUIRED, C-38.3, with 'recorded' citing §4.10 and `
  + "the artifact it quotes — the founder's session included",
    got, Object.fromEntries(KEYS.map((k) => [k, ["MACHINE_CREDENTIAL_REQUIRED",
                                                 ADMISSION_CHECKS.MACHINE_CREDENTIAL_REQUIRED.check, true]])));
}

/* ====================================================================== 5
 * NO CLASS LIST MOVED — every bearer keeps its reach (§4.10: "every caller keeps its reach and sessions
 * gain it"). Driven, not read off the table: the bearer passes the gate and the handler answers.
 * ==================================================================== */
console.log("\n--- 5. the bearers keep their reach: no class list moved ---");
{
  const bearer = {};
  for (const tok of ["t-admin-155", "t-member-155", "t-probe-155"]) {
    const store = tok === "t-probe-155" ? "&store=scratch" : "";
    const pr = res(await call(`op=provenanceroute&bundleId=${docId("member", "route")}&token=${tok}${store}`));
    const pc = res(await call(`op=provenancechain&bundleId=${docId("member", "chain")}&token=${tok}${store}`));
    const cs = res(await call(`op=calibrationsubject&token=${tok}${store}`,
      { engine: `rec155-bearer-${tok}`, probe_id: "rec155-probe" }));
    /* ANY C-38 row, not only the session gate's three: a bearer never meets the session gate, so asking
       only about those three would pass over a class list that had moved (CLASS_FORBIDDEN). */
    bearer[tok] = [!!ADMISSION_CHECKS[codeOf(pr)], !!ADMISSION_CHECKS[codeOf(pc)], cs.ok === true];
  }
  t("the admin, member and probe bearers are refused ADMISSION at neither provenance op and still "
  + "register a calibration subject — REC-155 refuses nobody; the bearer write closes in REC-158",
    bearer, { "t-admin-155": [false, false, true], "t-member-155": [false, false, true],
              "t-probe-155": [false, false, true] });
  const rp = res(await call("op=reproject&token=t-admin-155", {}));
  t("and the operator's credential still runs op=reproject — the verb §4.10 addresses to it",
    [codeOf(rp), typeof rp.remaining], [null, "number"]);
}

reachedFoot = true;
} finally {
  await mf.dispose();
}
console.log(`\n${fail === 0 && reachedFoot ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`
          + (reachedFoot ? "" : "  (the suite did NOT reach its foot: the tally is -1, not a clean run)"));
process.exit(fail === 0 && reachedFoot ? 0 : 1);

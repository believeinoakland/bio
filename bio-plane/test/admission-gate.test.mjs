/* NEGATIVE CONTROL: (run 2026-08-09, REC-79) `bio-plane/test/admission-gate.control.mjs` — five arms, each armed ALONE against a uniquely-named pristine copy, restore verified by sha256 AND by `cmp`. (1) blank ONE row's translation in ADMISSION_CHECKS -> `admissionRow` throws and the arm for that code fails; (2) return the row WITHOUT its translation (`{ code, check }`) -> every translation assertion fails while every `reason` assertion still passes, which is the exact shape DEC-49 exists to prevent and the reason `translation` is asserted separately from `reason`; (3) make the two NOT_CAPABLE sites disagree by hand-writing a second wording at the project-creation site -> the same-sentence arm fails; (4) revert app.html's `a.translation` line so the surface re-invents wording -> the UI arm fails; (5) OVER-STRICTNESS — a correct refusal whose translation is written in an unanticipated voice must still PASS. */
/* THE ADMISSION GATE, DRIVEN (REC-79 / C-38 / DEC-49).
 *
 * WHY THIS SUITE EXISTS, and it is not "the new family needs a test".
 *
 * FOUR OF THE SIX REFUSALS AT THIS GATE CARRIED NO CODE AT ALL until REC-79.
 * They answered with a bare `error:` sentence — `"unauthenticated"`,
 * `"forbidden for token class"` — and nothing a surface could key on. That made
 * them invisible to DEC-49's guard AND absent from its census, because a census
 * of CODES cannot count a refusal that has none. **The gate every single caller
 * passes through was outside the rule governing everything behind it**, and no
 * instrument in the repository could have said so.
 *
 * WHAT THIS SUITE ASSERTS, AND WHY EACH IS SEPARATE. For every one of the six:
 *
 *   1. the op ANSWERS with the code — driven through `dispatchFetch`, never at
 *      the store, because `op=invitelook` shipped with a ReferenceError while
 *      1,276 store-level assertions passed;
 *   2. the answer carries the C-number; and
 *   3. the answer carries the CANNED TRANSLATION, asserted against the row.
 *
 * (3) IS ASSERTED SEPARATELY FROM (1) ON PURPOSE. DEC-49 exists because a
 * refusal once shipped `translation: undefined` to a member — a machine word
 * where a sentence was promised — and it did so while its `reason` was
 * perfectly correct. A suite that checked only the code would have been green
 * through the exact defect the ruling was written for. Control arm (2) drives
 * that: strip the translation from the helper's return and every code assertion
 * here still passes while every sentence assertion fails.
 *
 * AND THE TRANSLATION IS COMPARED TO THE ROW, NOT TO A STRING TYPED HERE. A
 * hand copy agrees with its original for free — this project has measured that
 * five times, including a complete hand copy of 131 op names that passed. The
 * row is imported.
 *
 * THE `error` FIELDS ARE ASSERTED UNCHANGED, which is the other half. C-38 is
 * ADDITIVE on the wire: 28 suites read those sentences and none had to move.
 * Pinning them here is what stops a later tidy-up from turning an additive
 * change into a breaking one.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ADMISSION_CHECKS } from "../checks/bio-checks.mjs";

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

/* THE CORPUS IS ASSERTED NON-EMPTY AND FLOORED before anything is driven. A
   headline assertion over an empty family passes and says nothing — this
   project has measured that happening three times. */
const CODES = Object.keys(ADMISSION_CHECKS).sort();
console.log(`\n--- C-38 · the family, floored: ${CODES.length} rows — ${CODES.join(", ")} ---`);
t("ADMISSION_CHECKS holds at least the six the gate mints", CODES.length >= 6, true);
t("and every row carries a check number and a non-empty translation",
  CODES.every((c) => /^C-38\.\d+$/.test(ADMISSION_CHECKS[c].check)
                  && typeof ADMISSION_CHECKS[c].translation === "string"
                  && ADMISSION_CHECKS[c].translation.trim().split(/\s+/).length >= 8), true);

/* Every refusal is judged by the SAME three assertions, so no code can be
   tested more loosely than its siblings by accident. */
const admits = (label, answer, code) => {
  const row = ADMISSION_CHECKS[code];
  t(`${label}: answers ${code}`, answer.reason, code);
  t(`${label}: carries ${row.check}`, answer.check, row.check);
  t(`${label}: carries the CANNED TRANSLATION from its row, not a sentence typed at the site`,
    answer.translation, row.translation);
};

/* A member and a session at exactly the capabilities named. */
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

/* Two administrators first: there are no ordinary members until two exist
   (Membership Architecture 4.2/4.3), and the founder holds ADMIN_TOKEN with no
   roster row of their own. */
const ADA = await member("ada", ["contribute", "publish", "create_projects"], "admin");
const BEN = await member("ben", ["contribute"], "admin");
const CAI = await member("cai", [], "member");            // deliberately capability-less
/* **AN ADMINISTRATOR HOLDS EVERY CAPABILITY IMPLICITLY** — `store.mjs` answers
   `admin ? [...Store.CAPABILITIES] : capsOf(member)`. So the capability gate
   cannot be driven with an administrator however thin their declared list is,
   and the arms below that need a capability MISSING use `dot`, a plain member.
   Measured here rather than assumed: the first draft of this suite used `ben`
   and the refusal never fired, which read exactly like a broken gate. */
const DOT = await member("dot", ["contribute"], "member");

console.log("\n--- C-38.1 · NOTHING SAID WHO YOU ARE (the first thing a stranger meets) ---");
{
  const r = await GET("op=whoami");
  admits("no credential at all", r, "NOT_AUTHENTICATED");
  /* ADDITIVE: the old wire field is byte-identical. */
  t("and the pre-C-38 `error` field is unchanged, so nothing reading the old shape moved",
    r.error, "unauthenticated");
}

console.log("\n--- C-38.2 · THE WRONG CREDENTIAL, not an insufficient one ---");
{
  const r = await POST("op=export&token=t-probe-1");
  admits("a probe credential on an admin-only op", r, "CLASS_FORBIDDEN");
  t("and the pre-C-38 `error` field is unchanged", r.error, "forbidden for token class");
  t("and it still names the op and the class it judged", [r.op, r.cls], ["export", "probe"]);
}

console.log("\n--- C-38.3 · A PERSON ASKING FOR SOMETHING ONLY AN UNATTENDED WRITER DOES ---");
{
  const r = await POST(`op=purge&${ADA}`);
  admits("an administrator's SESSION on a machine-only mutating op", r, "MACHINE_CREDENTIAL_REQUIRED");
  t("and the pre-C-38 `error` field is unchanged",
    r.error, "this operation requires a machine credential, not a signed-in session");
  /* THE MIRROR, and without it the arm above says nothing: a gate that refused
     every session would pass it. The same op with the machine credential must
     get through the ADMISSION gate — whatever it then does is not this suite's
     business, only that it is no longer refused ADMISSION. */
  const m = await POST("op=purge&token=t-admin-1&scope=nothing-here");
  t("NEGATIVE CONTROL: the machine credential is NOT refused admission on the same op",
    m.reason === "MACHINE_CREDENTIAL_REQUIRED", false);
}

console.log("\n--- C-38.4 · THE ONE PLACE WHERE BEING THE FOUNDER IS NOT ENOUGH (8.1) ---");
{
  const r = await POST(`op=export&${ADA}`);
  admits("an administrator's own signed-in browser on op=export", r, "ROOT_OF_TRUST_REQUIRED");
  t("and the detail still explains the security property rather than only refusing",
    /root of trust/i.test(r.detail || ""), true);
  const m = await POST("op=export&token=t-admin-1");
  t("NEGATIVE CONTROL: the ADMIN_TOKEN credential itself is NOT refused admission",
    m.reason === "ROOT_OF_TRUST_REQUIRED", false);
}

console.log("\n--- C-38.5 · THE CAPABILITY GATE, AND ITS SECOND SITE ---");
{
  const r = await POST(`op=allocid&kind=inquiry&${CAI}`);
  admits("a member holding no capabilities on an op that needs contribute", r, "NOT_CAPABLE");
  t("and it names the capability that was needed", r.needs, "contribute");
  t("and what the account actually holds, so the member can act on it", r.held, []);
  /* NEGATIVE CONTROL for this arm specifically: a member WHO HOLDS the
     capability must not be refused admission, or the assertion above is
     satisfied by a gate that refuses everybody. */
  const m = await POST(`op=allocid&kind=inquiry&${DOT}`);
  t("NEGATIVE CONTROL: a member holding contribute is NOT refused admission",
    m.reason === "NOT_CAPABLE", false);
}

/* **THE SECOND SITE, AND IT IS THE MULTI-SITE PROBLEM MADE CONCRETE.**
 * `NOT_CAPABLE` is minted at TWO conditions: the op-level capability gate above,
 * and the payload-level project-creation check, which cannot live in the `NEEDS`
 * table because it depends on what the bundle IS rather than on which op was
 * called. A DEC-49 row holds ONE `where` and one code may not hold two rows, so
 * C-38.5's `where` names the admission region and NOT this site — which is
 * exactly the partition arm F measures at 93 codes and deliberately leaves open.
 *
 * WHAT IS CLOSED, AND THIS ARM IS WHAT CLOSES IT: the member gets the SAME
 * canned sentence either way. Both sites read the one row, so the two cannot
 * drift into two wordings for one condition. Control arm (3) hand-writes a
 * second wording at the second site and this arm fails. */
console.log("\n--- C-38.5 · the SECOND mint site answers with the SAME sentence ---");
{
  /* There is no op that creates a project: a project is created by promoting a
     bundle with NO BASE whose `object_type` is `project`, so the capability
     gates that SHAPE rather than an op name. The payload therefore carries
     `base: null` and `meta.object_type`, which is exactly why this condition
     cannot live in the op-keyed `NEEDS` table and why the code has two sites. */
  const bundle = { base: null, meta: { object_type: "project", title: "A project" },
                   body: "---\nobject_type: project\n---\n\nbody\n" };
  const r = await POST(`op=promote&path=projects/PROJ-2026-9001-cai/bundle.md&${CAI}`, bundle);
  /* cai is stopped at the OP-LEVEL gate first (promote needs contribute), which
     is itself worth pinning: the two sites are ORDERED and the first one wins.
     dot holds contribute and NOT create_projects, so she is the caller who
     actually reaches the second site. */
  t("a member with no capabilities is stopped at the FIRST site, on contribute", r.needs, "contribute");
  const b = await POST(`op=promote&path=projects/PROJ-2026-9002-dot/bundle.md&${DOT}`, bundle);
  admits("a contribute-holder creating a project without create_projects", b, "NOT_CAPABLE");
  t("and it names the capability THIS site needed, not the one the op needed", b.needs, "create_projects");
  t("**and the sentence is byte-identical to the other site's — one condition, one wording**",
    b.translation, ADMISSION_CHECKS.NOT_CAPABLE.translation);
  t("and it still carries the site-specific DETAIL, which is what distinguishes the two",
    /create a project|creating a project/i.test(b.detail || ""), true);
}

console.log("\n--- C-38.6 · A CREDENTIAL THAT MAY ACT, BUT NOT HERE ---");
{
  const r = await GET("op=whoami&token=t-probe-1&store=bio");
  admits("a probe credential reaching outside its namespace", r, "SCOPE_REFUSED");
  t("and the pre-C-38 `error` field still carries the namespace sentence",
    /confined to the scratch namespace/.test(r.error || ""), true);
  const m = await GET("op=whoami&token=t-probe-1");
  t("NEGATIVE CONTROL: the same credential inside its own namespace is NOT refused",
    m.reason === "SCOPE_REFUSED", false);
}

/* ------------------------------------------------------------------ TOTALITY
 * EVERY ROW IN THE FAMILY IS DRIVEN, asserted structurally rather than by
 * counting arms by hand. A row added to C-38 without a driven refusal fails
 * here — which is the whole difference between a family that is enforced and a
 * family that merely exists. */
console.log("\n--- C-38 · TOTALITY: every row in the family was DRIVEN above ---");
const DRIVEN = new Set(["NOT_AUTHENTICATED", "CLASS_FORBIDDEN", "MACHINE_CREDENTIAL_REQUIRED",
                        "ROOT_OF_TRUST_REQUIRED", "NOT_CAPABLE", "SCOPE_REFUSED"]);
t("no C-38 row is left undriven", CODES.filter((c) => !DRIVEN.has(c)), []);
t("and nothing is claimed driven that is not a row", [...DRIVEN].filter((c) => !ADMISSION_CHECKS[c]), []);
/* Two rows may not share a wording: two sentences for one condition is the
   drift DEC-49 closes, and two conditions sharing one sentence is a member
   being told the same thing about two different facts. */
t("and no two rows share a translation",
  new Set(CODES.map((c) => ADMISSION_CHECKS[c].translation)).size, CODES.length);
t("and no two rows share a check number",
  new Set(CODES.map((c) => ADMISSION_CHECKS[c].check)).size, CODES.length);

/* DISPOSE AND EXIT EXPLICITLY, like every other miniflare suite here — and this
   line is not boilerplate, it was PAID FOR. Without it the process keeps the
   workerd children alive, node never drains its event loop, and a parent that
   reads this suite through a PIPE (which REC-79's own control harness does)
   waits forever. The suite looked green when run by hand and HUNG the harness
   that was meant to prove it could fail. */
await mf.dispose();
console.log(`\nadmission-gate: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

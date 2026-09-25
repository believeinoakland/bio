/* NEGATIVE CONTROL: (declared and run 2026-09-25, branch land/worker/D-134) — (a) BASELINE, nothing armed: MUST be
   green. (b) THE BAD_KEY ROW'S TRANSLATION DELETED from `CUSTODIAL_CHECKS` (the row kept, `translation` removed):
   the control plane's `dec49Decorate` and the store both lose the sentence, so the `C-96.8` arm MUST FAIL by name
   and no other C-96 arm may move. (c) `adminRemove`'s target case put back to `reason: "NOT_AN_ADMIN"`: the
   `C-96.9` arm MUST FAIL by name and the `C-96.1` caller arms MUST stay green. (d) `memberAdd`'s ordinary-path
   INSERT writes NULL for `invited_by`: the two invited_by arms MUST FAIL by name, every C-96 arm stays green. Each arm restored from a per-arm
   pristine copy, verified by sha256 AND cmp. RESULTS 2026-09-25: (a) 14/0 at the time, 16/0 with the invited_by arms ·
   (b) FIRST RUN GREEN 14/0 — the grade compared `undefined === undefined`; the grade was corrected to require the
   sentence, and the re-run read 13/1, `C-96.8` by name · (c) 13/1, `C-96.9` by name, C-96.1 green · (d) 14/2, both
   invited_by arms by name. Every restore sha256- and cmp-verified. Table: measurements/D-134.md.
 * =========================================================================
 * d134-custodial-refusals.test.mjs — D-134. §4.9's CUSTODIAL ACTS SAY THEIR REFUSALS IN WORDS.
 *
 * D-134 built the administrator's surface over `op=memberadd`, `op=memberset`, `op=signeradd` and
 * `op=signerset` (civicos-ui, `test/custodial-acts.test.mjs` there drives the surface). Every refusal that
 * surface can receive must arrive with a canned DEC-49 translation. This suite NAMES each of C-96's checks
 * at the op, through the control plane (`dispatchFetch`, a real caller's route), from real SESSIONS — the
 * founder's, an enrolled administrator's and a member's — and grades each refusal four ways: the code,
 * the check by its literal C-number, and the translation against the IMPORTED row (a hand copy agrees
 * for free).
 *
 * IT ALSO PINS THE SPLIT THE CATALOGUE HAD TO MAKE. The control plane decorates EVERY refusal carrying a
 * family code, so C-96.1's caller sentence would have reached `adminRemove`'s TARGET case, a different
 * fact. That case is TARGET_NOT_AN_ADMIN (C-96.9) now, and the caller case at the same op is still C-96.1.
 *
 * WHAT IT CANNOT SEE: a live plane (miniflare over src/index.mjs; a green harness is not a serving build,
 * D-108); whether each sentence is GOOD prose (not mechanically checkable); the three other sites that
 * mint EXISTS / CONSENSUS_REQUIRED / NOT_AN_ADMIN are driven only where named below (`promote`'s EXISTS,
 * `projectOwnerAdd`'s CONSENSUS_REQUIRED and `adminEndorse`'s are not), so their sentences' truth there
 * rests on the reading recorded at the family's header in checks/bio-checks.mjs.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CUSTODIAL_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d134p";
const mk = () => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* The four gradings, in one place, against the imported row. */
const grade = (label, r, code, check) => {
  const row = CUSTODIAL_CHECKS[code];
  t(`${check} ${code}: ${label}`,
    /* The sentence must EXIST as well as match: with the row's translation deleted, `undefined === undefined`
       agreed for free and control arm (b) read GREEN on this suite's first draft — the instrument, not the plane. */
    [r && r.reason, r && r.code, r && r.check,
     !!r && typeof r.translation === "string" && r.translation.length > 40 && r.translation === (row && row.translation)],
    [code, code, check, true]);
};

const planes = [];
let exitCode = 1;
try {
  const mf = mk(); planes.push(mf);
  const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method: "POST", body: JSON.stringify(body || {}) })).json());
  const claimed = await post("claim", { bootstrapToken: ADM, password: "founder-passphrase-d134p" });
  if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
  const F = (await post("login", { password: "founder-passphrase-d134p" })).token;
  const enrol = async (invite, id) => {
    const en = await post("enroll", { invite, handle: id, password: `${id}-passphrase-d134p` });
    if (!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    return (await post("login", { role: `member:${id}`, password: `${id}-passphrase-d134p` })).token;
  };

  console.log("\n--- C-96.5 before a second administrator exists ---");
  grade("an ordinary member cannot be the group's second member",
    await post("memberadd", { memberId: "wren", cover: "first", role: "member" }, F), "ADMINS_FIRST", "C-96.5");

  const ruthAdd = await post("memberadd", { memberId: "ruth", cover: "second admin", role: "admin" }, F);
  const R = await enrol(ruthAdd.invite, "ruth");
  const oliveAdd = await post("memberadd", { memberId: "olive", cover: "a member", role: "member" }, R);
  const O = await enrol(oliveAdd.invite, "olive");

  console.log("\n--- the four custodial acts' refusals, each from a real session ---");
  grade("a member's session is not an administrator (memberset)",
    await post("memberset", { memberId: "ruth", status: "revoked" }, O), "NOT_AN_ADMIN", "C-96.1");
  grade("a member's session is not an administrator (signeradd)",
    await post("signeradd", { memberId: "olive", keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAIxyz" }, O), "NOT_AN_ADMIN", "C-96.1");
  grade("the founder names an id outside the pattern",
    await post("memberadd", { memberId: "Not An Id", cover: "x" }, F), "BAD_MEMBER_ID", "C-96.2");
  grade("an enrolled administrator gives no cover",
    await post("memberadd", { memberId: "vera" }, R), "NO_COVER", "C-96.3");
  grade("an id already on the roster",
    await post("memberadd", { memberId: "olive", cover: "again", role: "member" }, R), "EXISTS", "C-96.4");
  const prop = await post("memberadd", { memberId: "sam", cover: "third", role: "admin" }, R);
  grade("an administrator beyond the second is a proposal", prop, "CONSENSUS_REQUIRED", "C-96.6");
  t("C-96.6: the proposal still carries the record's own lists (the translation replaces none of them)",
    [prop.proposed, prop.have, prop.awaiting], [true, ["ruth"], ["admin"]]);
  grade("one administrator deactivating another",
    await post("memberset", { memberId: "ruth", status: "revoked" }, F), "ADMIN_REQUIRES_VOTE", "C-96.7");
  grade("a whole key line is not the key's base64 part",
    await post("signeradd", { memberId: "olive", keyB64: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxyz olive@x" }, R),
    "BAD_KEY", "C-96.8");

  console.log("\n--- the split: adminRemove's TARGET case is its own code, its CALLER case is still C-96.1 ---");
  grade("the member named for removal is not an administrator",
    await post("adminremove", { memberId: "olive", reason: "not one" }, F), "TARGET_NOT_AN_ADMIN", "C-96.9");
  grade("a member's session voting on an administrator's removal",
    await post("adminremove", { memberId: "ruth", reason: "no" }, O), "NOT_AN_ADMIN", "C-96.1");

  console.log("\n--- BOB #35 (2026-09-25): who INVITED a member is recorded, on every memberadd path ---");
  {
    const list = rP(await (await mf.dispatchFetch(`http://x/api/?op=memberlist&token=${F}`)).json()).members;
    const of = (id) => (list.find((m) => m.member_id === id) || {}).invited_by;
    t("invited_by: the founder's session invited ruth, ruth's session invited olive and proposed sam",
      [of("ruth"), of("olive"), of("sam")], ["admin", "ruth", "ruth"]);
    const bearer = await post("memberadd", { memberId: "bea", cover: "by the operator", role: "member" }, ADM);
    const list2 = rP(await (await mf.dispatchFetch(`http://x/api/?op=memberlist&token=${F}`)).json()).members;
    t("invited_by: the operator's bearer is recorded as the CREDENTIAL, never a person",
      [bearer.invited_by, (list2.find((m) => m.member_id === "bea") || {}).invited_by], ["class:admin", "class:admin"]);
  }

  /* The rows themselves: nine, each named here, each distinct. A suite naming a check the catalogue does
     not hold, or a catalogue row this suite never names, both read below. */
  const named = ["C-96.1", "C-96.2", "C-96.3", "C-96.4", "C-96.5", "C-96.6", "C-96.7", "C-96.8", "C-96.9"];
  t("C-96: the family holds exactly the nine checks this suite names",
    Object.values(CUSTODIAL_CHECKS).map((r) => r.check).sort(), named);
  t("C-96: nine distinct translations",
    new Set(Object.values(CUSTODIAL_CHECKS).map((r) => r.translation)).size, 9);

  console.log(`\nd134-custodial-refusals: ${pass} pass, ${fail} fail`);
  exitCode = fail ? 1 : 0;
} catch (e) {
  console.log(`  FAIL  threw before its foot — ${e && e.stack || e}`);
  console.log(`\nd134-custodial-refusals: ${pass} pass, ${fail + 1} fail`);
  exitCode = 1;
} finally {
  for (const p of planes) await p.dispose().catch(() => {});
}
process.exit(exitCode);

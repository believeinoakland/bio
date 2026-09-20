/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/signer-enrolment.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS A REAL SOURCE (src/store.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/signer-enrolment.control.mjs [arm]`. Each arm is armed ALONE, restored from a uniquely-named per-arm pristine copy verified by sha256 AND byte comparison (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed -> MUST be green. (b) `write-guard-dropped`: `signerAdd`'s call to `#signerMemberBar` removed, `signerSet`'s LEFT STANDING -> the four WRITE arms MUST FAIL BY NAME (`op=signeradd for a member who has not enrolled is refused BY NAME`, its translation arm, its stored-status arm, and `and NOTHING was written`) while EVERY ROSTER arm MUST STAY GREEN — and that green is the arm's second job, because this is the only way the LEGACY row (`signers.status='active'` under a member who never enrolled) can exist at all once the guard stands, and the roster reading it `attests:false` is the READ half of this item. (c) `set-guard-dropped`: the same call removed from `signerSet` ALONE -> the second-door arm MUST FAIL and the `signeradd` arms MUST stay green, which is what shows the two doors are two and not one. (d) `roster-honesty-dropped`: `signerList`'s `attests` hard-wired to 1 -> the invariant arm and the `attests_why` arm MUST FAIL, and so must the structural pin, because this arm deletes the reader the pin counts. (e) `roster-blind` — THE LIAR THIS ROW NAMES: `signerList` made to HIDE every key it cannot confirm -> the ANTI-BLINDING arms MUST FAIL while the INVARIANT arm STAYS GREEN, because hiding the disagreeing rows makes the two views agree over a smaller record; nothing but the anti-blinding arm can tell that from a fix. (f) `roster-inlined`: the shared predicate INLINED at `signerList` in the identical spelling, behaviour unchanged -> ONLY the structural pin MUST FAIL, which is the arm for a faithful copy of a rule that no behavioural assertion anywhere can see. (g) `read-overstrict` (required, the over-strictness direction): `attests` hard-wired to 0 -> the arms that say a genuinely active key STILL attests MUST FAIL, and every WRITE arm MUST stay green. RESULTS: on the line below, written from the harness's own output.
   RESULTS, RUN 2026-09-20 in worktree `.claude/worktrees/d158-conduct8` (branch `worker/d158-conduct8`, base `e1aa2eee`), every restore byte-identical (src/store.mjs 2,745,245 B sha256 c5fe16e99e1a…): baseline 32/0 · write-guard-dropped 28/4 · set-guard-dropped 28/4 · roster-honesty-dropped 28/4 · roster-blind 25/7 · roster-inlined 31/1 · read-overstrict 27/5 — ALL SEVEN AS DECLARED, no arm failed to arm. THE TWO MEASUREMENTS WORTH READING: in `write-guard-dropped` exactly the FOUR write arms fail and EVERY ROSTER ARM STAYS GREEN over the legacy row the missing guard just wrote — the read half of this item, which is not drivable any other way; and in `roster-blind` THE INVARIANT ARM STAYS GREEN while five anti-blinding arms fail, which is the measurement that says the cheat and the fix are indistinguishable to the invariant alone. THE FIRST RUN HAD FOUR ARMS **NOT AS DECLARED** AND THAT IS RECORDED RATHER THAN SMOOTHED, with the reason written at each arm: two were findings about the ARM (`write-guard-dropped` deleted `NO_SUCH_MEMBER` as well as the enrolment refusal — *break only the thing* — and `roster-blind` returned `-1, the suite did not reach its foot` because three row lookups threw a TypeError on a hidden row), and two were findings about the SUITE (the `attests_why` vocabulary check PASSED OVER AN EMPTY FILTER under `roster-honesty-dropped`, the empty-corpus failure this project has measured three times, now floored; and the `undetermined` literal fires under `read-overstrict`, which is the branch working). THE PRE-ITEM TRACE, this suite run against `origin/main`'s three sources swapped in and restored by sha256 AND `cmp`: **18 pass, 13 fail** — every write refusal absent, `op=signerset` re-activating a revoked member's key, the roster carrying no `attests` at all (`ROSTER SAYS ATTEST: (none)` against `op=ratify ACCEPTED: kestrel, iris`), and the predicate found INLINE TWICE with zero readers of a constant that did not exist. That is the defect measured on this tree rather than recalled from the row.
 * =========================================================================
 * D-158 — THE ROSTER AND THE GATE NOW ANSWER ONE QUESTION, AND THE ROSTER
 * SAYS WHICH STATE A KEY IS ACTUALLY IN.
 *
 * THE DEFECT, measured 2026-08-02 (session BOB, `MEASUREMENTS.md`, real
 * `ssh-keygen` signatures through the real ratify path) and RE-MEASURED at the
 * code on this tree before a line was written: `signerList()` read the `signers`
 * table ALONE, while `gateFacts()` joined `members` and required
 * `s.status='active' AND m.status='active'`. `signerAdd` checked only that the
 * member EXISTED. So an administrator could register a key for somebody who had
 * never enrolled, `op=signerlist` reported it `active`, and a signature from it
 * came back `SIG_UNKNOWN_KEY`. **The roster claimed more than the gate grants**,
 * which is the defect class `CLAUDE.md` §2 ranks above a missing feature.
 *
 * WHICH WAY THE TWO WERE MADE TO AGREE, AND WHY IT IS NOT SYMMETRIC. The roster
 * tells the truth; the gate is NOT relaxed. Accepting the key would WIDEN AN
 * AUTHORITY — it would let a signature attest in the name of a roster slot no
 * person has taken up, and the record's `attestor_member` stamp would then be an
 * attribution nobody made, which is the class D-136 closed for the §4.7 vote one
 * act over. Narrowing a claim and widening an authority are not two spellings of
 * one fix. Membership v2 §6 is the authority: enrolment is where the person
 * chooses their handle and their password, and until then nobody holds the
 * membership the key would speak for.
 *
 * AND THE ROSTER SAYS THE STATE RATHER THAN A WORD INVENTED FOR IT. `status` on a
 * signer row is the administrator's own revocation switch and stays exactly what
 * it has always been. Beside it the roster now serves `member_status` (the stored
 * fact underneath, which `op=memberlist` already serves to the same three
 * classes, so nothing is disclosed that was not) and `attests` — whether
 * `op=ratify` would accept a signature from this key right now — computed from
 * THE SAME SQL PREDICATE the two gate readers use, so the roster and the gate
 * cannot disagree again whatever wrote the row. `attests_why` names a STORED
 * fact (`key_revoked`, `member_invited`, `member_revoked`, `member_absent`) and
 * carries the literal `undetermined` for a combination it cannot account for,
 * because a derived reason that quietly guessed would be the same defect one
 * altitude up.
 *
 * **HOW A LIAR PASSES THE ACCEPTS-WHEN, STATED BEFORE WHAT IS CHECKED.** By
 * making `op=signerlist` HIDE every key whose enrolment it cannot confirm. The
 * two views then agree perfectly — over a record that says LESS than it can
 * support, which is a different defect and not a fix. So this suite floors the
 * roster: every key it registered must still be PRESENT, including the one the
 * roster says cannot attest, and a genuinely active key must still read
 * attesting. The control's `roster-blind` arm drives exactly that cheat and the
 * invariant assertion stays GREEN under it — which is the measurement that says
 * the anti-blinding arms are load-bearing rather than decorative.
 *
 * A SECOND LIAR, and it is the one that would pass every behavioural arm: a
 * faithful INLINE COPY of the predicate at the roster. `roster-inlined` drives
 * it, nothing behavioural moves, and only the structural pin sees it. That is
 * D-280's rule (`#refEdgeSevered`) arriving at a SQL fragment.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE every refusal, the roster, and the ratify path through the REAL
 *     control plane, over REAL ssh-keygen signatures, with the record read back.
 *   - IT CANNOT create a LEGACY row — `signers.status='active'` under a member
 *     who never enrolled — because once the write guard stands no op writes one,
 *     and this plane exposes no SQL surface. The READ over such a row is covered
 *     two ways and both are stated: the structural pin (one predicate, three
 *     readers) and the control's `write-guard-dropped` arm, where the row DOES
 *     exist and every roster arm must stay green.
 *   - IT CANNOT see the `civicos-ui` app: no surface there calls `signerlist`
 *     (measured, zero hits). The plane's own setup page does, and it is corrected
 *     in the same landing; `refusal-codes` guards the catalogue half.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { restOnARatifiedCase } from "./ratified-evidence.mjs";

/* Every assertion about the gate here weighs a REAL SSHSIG made by stock
   ssh-keygen, so there is no honest subset to run without it: the suite SKIPS
   LOUDLY WITH A NAMED REASON and exits 0 (D-93's rule, `ratify.test.mjs`' shape). */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- signer-enrolment ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("signer-enrolment: SKIPPED — ssh-keygen not on PATH; the roster is graded against what "
    + "op=ratify does with REAL member signatures and cannot be graded without them");
  process.exit(0);
}

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-d158";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-d158", PROBE_TOKEN: "prb-d158", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const init = body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) };
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, init)).json());
};
const NOW = "2026-07-01T00:00:00Z";

try {

/* ============================================================== FIXTURE */
const dir = mkdtempSync(join(tmpdir(), "d158-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENT IS WRITTEN OUT IN ASCII rather than imported from src/sshsig.mjs:
   an expectation taken from the thing under test agrees with it for free. */
const signRatify = (who, bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signTextAs = (who) => (text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

/* THE FOUNDER, so the two-administrator floor is satisfied and ordinary members
   can be invited at all (4.2/4.3: `#activeAdmins` counts the founder only once
   `op=claim` has been performed). */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-158" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);

const invite = async (memberId, role, capabilities) =>
  await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
const enrolNow = async (memberId, add) => {
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-158` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-158` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};

/* IRIS: the second administrator, enrolled, and the OWNER of the case this
   suite's evidence rests on — she is the only member whose own ratification can
   carry all the way through, which is what makes her key's `attests` gradable
   against a SUCCESS rather than against an absence of one refusal.
   JONAH: an enrolled member whose membership is later REVOKED.
   KESTREL: INVITED AND NOT ENROLLED — the row's own subject. */
const IRIS = await enrolNow("iris", await invite("iris", "admin", ["contribute", "publish", "create_projects"]));
const JONAH = await enrolNow("jonah", await invite("jonah", "member", ["contribute", "publish"]));
const kestrelAdd = await invite("kestrel", "member", ["contribute", "publish"]);
void JONAH;

const KEY = { iris: mkKey("iris"), jonah: mkKey("jonah"), kestrel: mkKey("kestrel"), stranger: mkKey("stranger") };
const whoOf = Object.fromEntries(Object.entries(KEY).map(([w, k]) => [k, w]));

const rosterKeys = async () => ((await GET(`op=signerlist&token=${ADM}`)).signers || []).map((s) => s.key_b64);
const roster = async () => (await GET(`op=signerlist&token=${ADM}`)).signers || [];

console.log("\n--- 0. the fixture is real, floored before anything is claimed over it ---");
const members0 = (await GET(`op=memberlist&token=${ADM}`)).members || [];
const statusOf = (id) => (members0.find((m) => m.member_id === id) || {}).status || null;
t("FLOOR: three members stand as the fixture describes them — iris and jonah enrolled, kestrel invited "
+ "and not enrolled. Nothing below can mean anything if this line is not true",
  [statusOf("iris"), statusOf("jonah"), statusOf("kestrel")], ["active", "active", "invited"]);
t("FLOOR: and the signer roster starts EMPTY, so every row counted below was put there by this suite",
  (await rosterKeys()).length, 0);

console.log("\n--- 1. the write: a key is registered to a member who can attest ---");
const addKestrelEarly = await POST(`op=signeradd&token=${ADM}`,
  { keyB64: KEY.kestrel, memberId: "kestrel", comment: "kestrel laptop" });
t("op=signeradd for a member who has not enrolled is refused BY NAME, and the check FIRES: C-63.1",
  addKestrelEarly.reason, "SIGNER_MEMBER_NOT_ENROLLED");
t("and the refusal carries the plane's own canned sentence, so the administrator is told what happened "
+ "rather than handed a code (DEC-49)",
  typeof addKestrelEarly.translation === "string" && addKestrelEarly.translation.length > 20, true);
t("and it reports the member's STORED status rather than a word invented to describe it",
  [addKestrelEarly.member_status, addKestrelEarly.enrolled], ["invited", false]);
t("and NOTHING was written: the roster is still empty",
  (await rosterKeys()).length, 0);

const addIris = await POST(`op=signeradd&token=${ADM}`, { keyB64: KEY.iris, memberId: "iris", comment: "iris laptop" });
const addJonah = await POST(`op=signeradd&token=${ADM}`, { keyB64: KEY.jonah, memberId: "jonah", comment: "jonah laptop" });
t("an enrolled member's key registers exactly as it always did", [addIris.ok, addJonah.ok], [true, true]);

/* THE OVER-STRICTNESS DIRECTION, INSIDE THE SUITE: the same key and the same
   member, once the enrolment the refusal named has happened. A fence that
   refused this too would be tighter than its rule, which is an undeclared
   interface change wearing the costume of caution. */
const KESTREL = await enrolNow("kestrel", kestrelAdd);
const addKestrelLate = await POST(`op=signeradd&token=${ADM}`,
  { keyB64: KEY.kestrel, memberId: "kestrel", comment: "kestrel laptop" });
t("OVER-STRICTNESS: the SAME key for the SAME member is ACCEPTED once kestrel enrols — the refusal is "
+ "about enrolment and about nothing else", addKestrelLate.ok, true);
t("and it is on the roster afterwards", (await rosterKeys()).includes(KEY.kestrel), true);

t("a key for a member who does not exist is still refused NO_SUCH_MEMBER, not swallowed by the new "
+ "refusal — two different facts keep two different answers",
  (await POST(`op=signeradd&token=${ADM}`, { keyB64: KEY.stranger, memberId: "ghost" })).reason, "NO_SUCH_MEMBER");
t("and a malformed key is still refused BAD_KEY before the roster is asked at all",
  (await POST(`op=signeradd&token=${ADM}`, { keyB64: "not-a-key", memberId: "iris" })).reason, "BAD_KEY");

console.log("\n--- 2. the second door: op=signerset cannot re-activate what op=ratify would refuse ---");
const revokeJonah = await POST(`op=memberset&token=${ADM}`, { memberId: "jonah", status: "revoked" });
t("jonah's membership is revoked, and the cascade takes his key with it (memberSet's own rule)",
  [revokeJonah.ok, ((await roster()).find((r) => r.key_b64 === KEY.jonah) || {}).status], [true, "revoked"]);
const reviveKey = await POST(`op=signerset&token=${ADM}`, { keyB64: KEY.jonah, status: "active" });
t("op=signerset cannot put a revoked member's key back to `active` — the second door onto the same "
+ "disagreement, refused BY NAME, and the check FIRES: C-63.2", reviveKey.reason, "SIGNER_MEMBER_NOT_ACTIVE");
t("and it names the stored facts: enrolled, membership revoked",
  [reviveKey.member_status, reviveKey.enrolled], ["revoked", true]);
t("and the key is still revoked, so nothing landed",
  ((await roster()).find((r) => r.key_b64 === KEY.jonah) || {}).status, "revoked");
t("REVOKING is never barred — the guard narrows a claim and never blocks one being narrowed",
  (await POST(`op=signerset&token=${ADM}`, { keyB64: KEY.kestrel, status: "revoked" })).ok, true);
t("OVER-STRICTNESS: and an active member's key can be re-activated, so the guard is about the member's "
+ "standing and not about activation",
  (await POST(`op=signerset&token=${ADM}`, { keyB64: KEY.kestrel, status: "active" })).ok, true);

console.log("\n--- 3. the roster says which state each key is actually in ---");
const rows = await roster();
console.log(`    CORPUS: ${rows.length} signer row(s) — `
  + rows.map((r) => `${r.member_id}:${r.status}/${r.member_status}/${r.attests ? "attests" : r.attests_why}`).join(" · "));
t("ANTI-BLINDING FLOOR: every key this suite registered is STILL ON the roster, including the one the "
+ "roster says cannot attest — a roster that hid it would make the two views agree by saying LESS than "
+ "the record supports, which is a different defect and not a fix",
  [KEY.iris, KEY.jonah, KEY.kestrel].map((k) => rows.some((r) => r.key_b64 === k)), [true, true, true]);
t("ANTI-BLINDING FLOOR: and the roster is not empty, so the comparison below is over a real set",
  rows.length >= 3, true);
/* EVERY ROW LOOKUP BELOW IS NULL-TOLERANT, and that is a CORRECTION the control
   earned rather than a habit. The `roster-blind` arm hides the rows it cannot
   confirm; the first draft of these lines read `.find(…).status` and the missing
   row threw a TypeError, which ends the module and goes through NO assertion at
   all — the suite reported `-1 (did not reach its foot)` instead of failing at
   the named anti-blinding arms. The arm was right and the instrument was wrong. */
const row = (k) => rows.find((x) => x.key_b64 === k) || {};
t("a genuinely active key STILL reads as attesting, with the member fact beside it",
  [row(KEY.iris).status, row(KEY.iris).member_status, row(KEY.iris).attests],
  ["active", "active", true]);
t("and the revoked member's key reads `attests:false` with its reason naming a STORED fact rather than "
+ "an invented state",
  [row(KEY.jonah).attests, row(KEY.jonah).attests_why, row(KEY.jonah).member_status],
  [false, "key_revoked", "revoked"]);
/* FLOORED ON ITS OWN SET BEFORE THE CLAIM IS MADE OVER IT, and this too the
   control earned: the first draft asserted only that every non-null `attests_why`
   was in the vocabulary, and the `roster-honesty-dropped` arm — which makes every
   key read as attesting, so every `attests_why` is null — PASSED IT over an empty
   filter. A totality assertion that passes over an empty corpus is this project's
   three-times-measured failure, and it had just arrived here. */
const whys = rows.map((r) => r.attests_why).filter((w) => w !== null);
t("at least one key on this roster carries a reason at all, so the vocabulary claim below is made over "
+ "something", whys.length >= 1, true);
t("and every `attests_why` names a STORED fact — none of them is `undetermined`, the literal the plane "
+ "carries for a combination it cannot account for",
  whys.filter((w) => !["key_revoked", "member_invited", "member_proposed", "member_revoked", "member_absent"]
    .includes(w)), []);

console.log("\n--- 4. THE INVARIANT, asserted against the OTHER VIEW rather than against itself ---");
/* Two bundles: one iris ratifies all the way through, one the other two keys are
   weighed against. Both are made the evidence of a RATIFIED CASE, because
   `op=ratify` publishes nothing outside one (D-431, Publication v0.1 §3 rule 2). */
const mkMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "D-158 target"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: test", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "a target", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteTarget = async (id, snap) => {
  const md = mkMd(id);
  const r = await POST("op=promote&token=mem-d158", {
    bundleId: id, base: null, snapKey: snap, author: "claude",
    meta: { object_type: "information", group: "believe-in-oakland", title: "D-158 target",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (!r || !r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  return r.bundleSha;
};
const ID_A = "INFO-2026-8101-d158-ratified";
const ID_B = "INFO-2026-8102-d158-weighed";
const SHA_A = await promoteTarget(ID_A, "20260701T100000Z_aaaa1158");
const SHA_B = await promoteTarget(ID_B, "20260701T110000Z_bbbb2158");
await restOnARatifiedCase({ post: POST, get: GET, doPost: DO, sha, promoteToken: "mem-d158",
  owner: "iris", ownerToken: IRIS, signText: signTextAs("iris"), targets: [ID_A, ID_B], n: "8103", at: NOW });

/* EVERY DELIVERY IS IRIS'S OWN SESSION. D-421 (C-32.14) refuses an operator
   bearer token at this door, and a revoked member has no session at all, so the
   deliverer is held CONSTANT and the only thing that varies between these three
   answers is WHOSE KEY SIGNED. */
const weigh = async (who, id, expected) =>
  await POST(`op=ratify&token=${IRIS}`, { bundleId: id, expectedSha: expected, sig: signRatify(who, id, expected) });

const jonahWeighed = await weigh("jonah", ID_B, SHA_B);
t("the key the roster says cannot attest is refused AT THE SIGNATURE, by name",
  jonahWeighed.reason, "SIG_UNKNOWN_KEY");
t("and the refusal names that exact key, so this is a fact about jonah's key and not about the request",
  jonahWeighed.keyB64, KEY.jonah);
const strangerWeighed = await weigh("stranger", ID_B, SHA_B);
t("a key that was never registered at all is refused the same way — the roster's silence and its "
+ "`attests:false` are both honoured by the gate", strangerWeighed.reason, "SIG_UNKNOWN_KEY");

const kestrelWeighed = await weigh("kestrel", ID_B, SHA_B);
/* MEASURED, NOT ASSUMED. Kestrel's key is registered and her membership is
   active, so the gate weighs it and ACCEPTS it; what stops her is that she owns
   no project this case belongs to (C-57.1, REC-137). That exact code is the
   POSITIVE ARTIFACT this arm needs — it can only be reached AFTER the signature
   has been verified against the allowed-key set, so it says the key was accepted
   in a way that an absence of `SIG_UNKNOWN_KEY` could not. */
t("KESTREL'S KEY IS WEIGHED AND ACCEPTED: the refusal that comes back is about her standing in the "
+ "project and NOT about her key, which is the positive artifact that she now attests",
  kestrelWeighed.reason, "CASE_SIGNER_NOT_AN_OWNER");

const irisRatified = await weigh("iris", ID_A, SHA_A);
t("and the key the roster says attests carries a ratification all the way through",
  [irisRatified.ok, irisRatified.attestor], [true, "iris"]);

/* THE COMPARISON. One set is read from `op=signerlist`; the other from what
   `op=ratify` DID with a real signature from each key. Neither is derived from
   the other and neither is a restatement of the store's own row. */
const after = await roster();
const rosterSays = after.filter((r) => r.attests).map((r) => r.key_b64).sort();
const gateAccepted = [[KEY.iris, irisRatified], [KEY.jonah, jonahWeighed], [KEY.kestrel, kestrelWeighed]]
  .filter(([, r]) => r.reason !== "SIG_UNKNOWN_KEY").map(([k]) => k).sort();
console.log(`    ROSTER SAYS ATTEST: ${rosterSays.map((k) => whoOf[k]).join(", ") || "(none)"}`);
console.log(`    op=ratify ACCEPTED: ${gateAccepted.map((k) => whoOf[k]).join(", ") || "(none)"}`);
t("FLOOR: neither side of the comparison is empty — an equality over two empty sets costs nothing to "
+ "produce and is not evidence",
  [rosterSays.length >= 2, gateAccepted.length >= 2], [true, true]);
t("THE INVARIANT: op=signerlist says a key attests EXACTLY when op=ratify accepts a signature from it — "
+ "the roster claims neither more nor less than the gate grants",
  rosterSays, gateAccepted);

console.log("\n--- 5. one predicate, and the roster is not a second opinion ---");
/* D-280's rule (`#refEdgeSevered`) arriving at a SQL fragment: no behavioural arm
   anywhere can see a FAITHFUL INLINE COPY of a rule, so the reader count is
   pinned EXACTLY. If you add a fourth reader this line fails and you are meant to
   come and say which site you added and why. Do not relax it to a floor. */
const readers = STORE_SRC.split("${Store.SIGNER_ATTESTS}").length - 1;
const literals = STORE_SRC.split("s.status='active' AND m.status='active'").length - 1;
console.log(`    STRUCTURE: ${readers} reader(s) of Store.SIGNER_ATTESTS · ${literals} occurrence(s) of the predicate's text`);
t("the predicate has EXACTLY three readers — the roster, `gateFacts` and `caseDocumentFacts` — and its "
+ "text occurs ONCE, in the constant itself: a faithful inline copy at any of them is invisible to "
+ "every behavioural assertion in this file and visible only here",
  [readers, literals], [3, 1]);
t("and the search that says so COMPILED over a real file rather than quietly matching nothing",
  STORE_SRC.length > 2_000_000, true);

} finally {
  /* DISPOSE. Without it the assertions all print, the tally reads clean, and the
     PROCESS NEVER EXITS — a suite that hangs after its own foot is
     indistinguishable from one still doing work. */
  await mf.dispose();
}

console.log(`\nsigner-enrolment: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);

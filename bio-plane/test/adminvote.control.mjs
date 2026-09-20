/* D-136 — THE NEGATIVE CONTROL FOR `adminvote.test.mjs`, RE-RUNNABLE IN ONE STEP.
 *
 *   node test/adminvote.control.mjs                  # every arm, in order
 *   node test/adminvote.control.mjs stamp-dropped    # one arm
 *
 * Run from `bio-plane/`. DELIBERATELY NOT A `.test.mjs`: it EDITS `src/index.mjs`
 * and `src/store.mjs` while it runs, and the battery must never discover it. The
 * harness shape is REC-125's (`operator-attest.control.mjs`), kept rather than
 * re-invented — including the per-arm uniquely-named pristine copy, the sha256
 * AND byte-comparison restore, and the refusal to run an arm whose anchor does
 * not match EXACTLY ONCE (an arm that did not arm is a finding, never a green).
 *
 * **THE ARMS ARE PAIRED, AND THAT PAIRING IS THE WHOLE POINT OF THIS FILE.**
 * D-136 refuses to be split: stamping without reach makes the §4.7 vote castable
 * by nobody, reach without stamping leaves it forgeable. A control with one arm
 * could not tell those apart. So `reach-dropped` must fail the POSITIVE arms
 * while the forgery arms stay green, `stamp-dropped` must fail the FORGERY arms
 * while the reach arms stay green, and `fence-dropped` must fail the BEARER arms
 * while both of the others stay green. Three layers, each broken with the other
 * two HELD OPEN — VERIFICATION rule 3a, which is the only thing that shows any
 * one of them is doing work.
 *
 * DECLARED BEFORE ARMING — which assertions MUST fail, by label prefix; every
 * other one MUST pass. An arm whose failures differ from its declaration in
 * EITHER direction is reported NOT AS DECLARED and the harness exits 1.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const IDX = join(PLANE, "src", "index.mjs");
const STORE = join(PLANE, "src", "store.mjs");
const SUITE = join(HERE, "adminvote.test.mjs");
/* A restore below this is not a restore. Both files are far larger; the floor
   exists so a truncated write cannot be reported as byte-identical to itself. */
const MIN_BYTES = { [IDX]: 500_000, [STORE]: 2_000_000 };
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* The three sites exactly as they stand in the sources. */
const FENCE = `    if (GOVERNANCE_ACTIONS.includes(op) && !viaSession)`;
const STAMP = `      inner.searchParams.set("by", viaSession ? sessMember : \`\${MACHINE_CLASS_PREFIX}\${cls}\`);`;
const MEMBER_REACH = `                   ...GOVERNANCE_ACTIONS,\n                   /* REC-146:`;
const CAPS_GATE = `    const admins = this.#activeAdmins();\n    if (!by || !admins.includes(by))\n      return { ok: false, reason: "NOT_AN_ADMIN", by,`;

const OPS3_EARLY = ["adminendorse", "adminremove", "membercaps"];
const OPS3_LABELS = () => OPS3_EARLY.map((op) =>
  `op=${op}: cai, an ordinary member, is refused NOT_AN_ADMIN`);
const L = {
  /* The three FORGERY arms, which are the row's own liar: one session caller
     sending another administrator's id. */
  forgeEndorse: "a session caller naming ANOTHER administrator as `by` does not cast that administrator's endorsement",
  forgeTally: "and the consensus tally still names only the administrators who actually endorsed",
  forgeNotInvited: "and nell is NOT invited on the strength of a forged consensus",
  forgeRemove: "a session caller naming ANOTHER administrator as `by` does not cast that administrator's removal vote",
  forgeCaps: "a session caller naming ANOTHER administrator as `by` does not make the capability edit",
  /* The POSITIVE (reach) arms — the half `reach-dropped` breaks. */
  casts: "ruth's own signed-in session casts a §4.7 endorsement",
  countedRuth: "and the record counts it as RUTH's",
  mirror: "MIRROR: gus's own session completes the consensus",
  endorsedBy: "and the record names both who endorsed",
  enrols: "and nell enrols on it",
  capsLanded: "and the edit itself still landed",
  oneReal: "and one real administrator's endorsement is still not consensus",
  removeCounted: "and gus is still an administrator, because one vote",
  /* The BEARER arms — the half `fence-dropped` breaks. */
  bearer: "op=",                      /* the per-op/per-class refusal labels all begin `op=<op>, the operator's` */
  nothingLanded: "and NOTHING a bearer asked for landed",
  /* The ROSTER arms — the half `caps-ungated` breaks. */
  caiRefused: "op=membercaps: cai, an ordinary member, is refused NOT_AN_ADMIN",
  /* All three roster refusals, for the arms that take the reach away: cai is then
     refused by the GATE before the roster is ever asked, at every one of them. */
  caiRefusedAny: OPS3_LABELS(),
  caiMirror: "MIRROR: the refusals above are about cai's place on the roster",
  caiNothing: "and nothing cai asked for landed",
  /* The STRUCTURAL pins. */
  structFence: "STRUCTURE: the operator fence refuses on how the caller ARRIVED",
  structStamp: "STRUCTURE: the `by` stamp covers the three ops",
  structReach: "STRUCTURE: the three reach BOTH session sets",
  /* The fixture floor, which moves when the reach does. */
  fixture: "two active administrators to begin with",
  /* §5's tally moves with the fixture: an arm in which nell never becomes an
     administrator awaits TWO rather than three. A cascade, declared as one. */
  consensusThree: "an addition is refused for want of consensus and NAMES all three",
};
const bearerLabels = (ops, classes) =>
  ops.flatMap((op) => classes.map((c) => `op=${op}, the operator's \`${c}\`-class bearer token`));
const OPS3 = ["adminendorse", "adminremove", "membercaps"];
const CLASSES = ["admin", "member", "probe"];

const ARMS = {
  baseline: { file: IDX, edits: [], mustFail: [] },

  /* (b) THE ROW'S OWN CONTROL. The stamp HONOURS a caller-sent `by` for a
     session — which is precisely the defect D-136 closes, and note that it is a
     WIDENING rather than a deletion, so nothing else about the plane moves. The
     fence in front is LEFT STANDING, so every bearer arm must stay green: that
     is what shows the two layers are independent rather than one layer twice. */
  "stamp-dropped": {
    file: IDX,
    edits: [[STAMP, STAMP.replace("viaSession ? sessMember",
      "viaSession ? (inner.searchParams.get(\"by\") || sessMember) /* ARMED */")]],
    /* DECLARATION WIDENED AFTER THE FIRST RUN, WITH THE REASON, never to buy a
       green (REC-153's precedent). Three corrections, each a finding about the
       DECLARATION rather than about the subject:
         · `L.structStamp` ADDED — this arm edits the very line that pin reads,
           so the pin fires. That is the pin working, not a perturbation.
         · `L.consensusThree` ADDED — nell never becomes an administrator in this
           arm, so §5 awaits two rather than three. A fixture cascade.
         · `L.removeCounted` REMOVED — it was declared to fail and did NOT, and it
           was WRONG to declare: it reads back that gus is STILL an administrator,
           which stays true precisely because no removal carries here. A safety
           read-back belongs on the green side of every arm that does not eject
           anybody, and declaring it to fail would have made a forged EJECTION
           invisible. */
    mustFail: [L.forgeEndorse, L.forgeTally, L.forgeNotInvited, L.forgeRemove, L.forgeCaps,
               L.mirror, L.endorsedBy, L.enrols, L.oneReal, L.caiMirror,
               L.structStamp, L.consensusThree],
  },

  /* (c) THE OPERATOR FENCE ALONE, neutered in place so the region's TEXT is
     otherwise untouched and the structural pin is NOT perturbed — break only
     the thing. The stamp behind it still overwrites a bearer's `by` with
     `class:<cls>`, so nothing a bearer asks for lands and that read-back stays
     GREEN: the arm proves the fence supplies the SENTENCE, and the stamp
     supplies the refusal. */
  "fence-dropped": {
    file: IDX,
    edits: [[FENCE, `${FENCE.slice(0, -1)} && false /* ARMED */)`]],
    /* `L.structFence` ADDED AFTER THE FIRST RUN, WITH THE REASON. The pin asserts
       the guard is EXACTLY `GOVERNANCE_ACTIONS.includes(op) && !viaSession`, so no
       edit to the guard can leave it unmoved — *break only the thing* is satisfied
       by the region's prose and its code being otherwise untouched, and a pin that
       could not see its own subject being neutered would be worth nothing. */
    mustFail: [...bearerLabels(OPS3, CLASSES), L.structFence],
  },

  /* (d) REACH REMOVED FROM THE MEMBER SET — the half without which the §4.7 vote
     belongs to the founder alone. `SESSION_OPS.admin` is left standing on
     purpose: this arm measures exactly the difference between *an
     administrator's session* and *the founder's session*, which is the
     measurement that decided this item's shape. */
  "reach-dropped": {
    file: IDX,
    edits: [[MEMBER_REACH, "                   /* REC-146:"]],
    /* WIDENED AFTER THE FIRST RUN, WITH THE REASON. `L.removeCounted` removed for
       stamp-dropped's reason (it is a read-back that STAYS true when no removal
       carries); `L.consensusThree` and `L.caiNothing` added as fixture cascades;
       and `L.caiRefusedAny` replaces the single membercaps label because with the
       member reach gone cai is refused EARLIER, by the gate, at all three ops —
       which is the arm saying that the ROSTER refusal in §7 exists only because
       the reach does. */
    mustFail: [L.structReach, L.casts, L.countedRuth, L.forgeEndorse, L.forgeTally,
               L.mirror, L.endorsedBy, L.enrols, L.forgeRemove, L.forgeCaps, L.capsLanded,
               L.oneReal, L.caiMirror, L.nothingLanded, L.consensusThree, L.caiNothing,
               ...L.caiRefusedAny],
  },

  /* (e) THE STAMP IS READ, NOT MERELY RECORDED. `Store#memberCaps`' roster check
     removed and nothing else: the two VOTE ops keep theirs, so their arms stay
     green, and what fails is exactly the capability edit's refusal of a caller
     with no standing. A stamp nothing consults is a mechanism believed on the
     strength of its existence; this is the arm that tells the two apart. */
  "caps-ungated": {
    file: STORE,
    edits: [[CAPS_GATE, `    const admins = this.#activeAdmins(); void admins; /* ARMED */\n    if (false)\n      return { ok: false, reason: "NOT_AN_ADMIN", by,`]],
    mustFail: [L.caiRefused, L.caiNothing, L.caiMirror],
  },

  /* (f) OVER-STRICTNESS, REQUIRED. The fence refuses EVERY caller on the three
     ops, sessions included. Every bearer arm stays green — which is the only
     thing that distinguishes a fence that HOLDS from a fence that refuses
     everybody, and a control without this arm cannot make that distinction at
     all. Scoped to the three ops rather than `if (true)`: an unscoped widening
     would refuse every op in the plane and the suite would die before its foot,
     which refutes nothing. */
  overstrict: {
    file: IDX,
    edits: [[FENCE, `    if (GOVERNANCE_ACTIONS.includes(op) /* ARMED */)`]],
    /* WIDENED AFTER THE FIRST RUN, WITH THE REASON — the same three corrections
       the two arms above carry, plus `L.structFence`, because this arm edits the
       guard the pin reads. `L.removeCounted` removed: no removal carries here
       either. */
    mustFail: [L.casts, L.countedRuth, L.forgeEndorse, L.forgeTally, L.mirror, L.endorsedBy,
               L.enrols, L.forgeRemove, L.forgeCaps, L.capsLanded, L.oneReal,
               L.caiMirror, L.nothingLanded, L.structFence, L.consensusThree, L.caiNothing,
               ...L.caiRefusedAny],
  },

  /* (g) THE LIAR THE ROW NAMES: refuse by token STRING instead of by how the
     caller arrived. It is green against the two bindings anybody thinks to name
     and the PROBE class walks straight through — and the structural pin sees the
     env binding in the region, which is the half that catches a class this
     harness has no fixture for. */
  classkeyed: {
    file: IDX,
    edits: [[FENCE, `    if (GOVERNANCE_ACTIONS.includes(op) && [env.ADMIN_TOKEN, env.MEMBER_TOKEN].includes(url.searchParams.get("token")) /* ARMED */)`]],
    mustFail: [L.structFence, ...bearerLabels(OPS3, ["probe"])],
  },
};

const count = (hay, needle) => hay.split(needle).length - 1;
const work = mkdtempSync(join(tmpdir(), "d136-control-"));
const asked = process.argv[2];
const order = asked ? [asked] : Object.keys(ARMS);
if (asked && !ARMS[asked]) { console.log(`unknown arm '${asked}': ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let bad = 0;
const results = [];
for (const name of order) {
  const arm = ARMS[name];
  const TARGET = arm.file;
  const original = readFileSync(TARGET);
  const pristine = join(work, `${TARGET.endsWith("store.mjs") ? "store" : "index"}.mjs.pristine-${name}-${process.pid}`);
  copyFileSync(TARGET, pristine);
  let src = original.toString("utf8"), armed = true;
  for (const [from, to] of arm.edits) {
    const n = count(src, from);
    if (n !== 1) { console.log(`  ARM ${name} DID NOT ARM: its anchor matched ${n} times (must be exactly 1)`); armed = false; break; }
    src = src.replace(from, to);
  }
  let out = "", failed = [], tally = null;
  try {
    if (armed) {
      if (arm.edits.length) writeFileSync(TARGET, src);
      const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 << 20 });
      out = (r.stdout || "") + (r.stderr || "");
      failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
      const m = out.match(/adminvote: (\d+) pass, (\d+) fail/);
      tally = m ? `${m[1]}/${m[2]}` : "-1 (the suite did not reach its foot)";
    }
  } finally {
    copyFileSync(pristine, TARGET);
    const back = readFileSync(TARGET);
    const same = back.length === original.length && back.equals(original) && sha(back) === sha(original);
    console.log(`  restore ${name} (${TARGET.split("/").pop()}): ${back.length} B, sha256 ${sha(back).slice(0, 12)}…, `
      + `byte-identical ${same ? "YES" : "NO"}`);
    if (!same || back.length < MIN_BYTES[TARGET]) {
      console.log(`  RESTORE FAILED for ${name} — stop and repair by hand from ${pristine}`); process.exit(3);
    }
  }
  if (!armed) { bad++; results.push(`${name}: DID NOT ARM`); continue; }
  const missing = arm.mustFail.filter((l) => !failed.some((f) => f.startsWith(l)));
  const extra = failed.filter((f) => !arm.mustFail.some((l) => f.startsWith(l)));
  const asDeclared = missing.length === 0 && extra.length === 0 && tally && !tally.startsWith("-1");
  if (!asDeclared) bad++;
  results.push(`${name}: ${tally} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  console.log(`\n=== arm ${name}: ${tally} (pass/fail) — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`     failed: ${f.slice(0, 140)}`);
  for (const m of missing) console.log(`     DECLARED TO FAIL AND DID NOT: ${m}`);
  for (const e of extra) console.log(`     FAILED AND WAS NOT DECLARED: ${e.slice(0, 140)}`);
}
rmSync(work, { recursive: true, force: true });
console.log(`\nRESULTS: ${results.join(" · ")}`);
process.exit(bad ? 1 : 0);

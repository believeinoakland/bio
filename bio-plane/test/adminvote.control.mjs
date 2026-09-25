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
 *
 * REC-156 (2026-09-21) ADDS FOUR ARMS for `op=memberadd`'s `by` (the suite's §8),
 * paired the same way: `memberadd-disjunct-dropped` takes the plane's half away and
 * the store-direct arms must stay green; `memberadd-relay-dropped` takes the store's
 * half away and the stamp's pin must stay green; `memberadd-relay-fallback` is the
 * liar only a store-direct drive can see; `memberadd-overstrict` refuses every voter
 * and must take down the genuine proposer while every forgery arm stays green.
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
/* RE-ANCHORED 2026-09-25 (REC-162): REC-164 added a byte-identical stamp line for IDENTITY_ACTIONS, so
   this anchor matched TWICE on `main` and `stamp-dropped` refused to arm (measured on REC-162's first full
   run). It now carries the preceding line of the GOVERNANCE stamp's own condition, which occurs once. */
const STAMP = `        || CUSTODIAL_ACTIONS.includes(op))\n      inner.searchParams.set("by", viaSession ? sessMember : \`\${MACHINE_CLASS_PREFIX}\${cls}\`);`;
/* RE-ANCHORED 2026-09-23 (REC-159): the member set's spread was followed by REC-146's comment; REC-159
   put `...CUSTODIAL_ACTIONS` (with its own comment) between them, and the old anchor matched 0 times —
   the harness refused to arm, as it is built to, and that refusal is recorded on the suite's line. */
const MEMBER_REACH = `                   ...GOVERNANCE_ACTIONS,\n                   /* REC-159:`;
const CAPS_GATE = `    const admins = this.#activeAdmins();\n    if (!by || !admins.includes(by))\n      return { ok: false, reason: "NOT_AN_ADMIN", by,`;
/* REC-156's three sites, exactly as they stand: the stamp's `memberadd` disjunct, the
   store's relay, and `memberAdd`'s §4.7 vote write. */
/* CORRECTED 2026-09-23 (REC-159): the disjunct is `CUSTODIAL_ACTIONS.includes(op)` now, which holds
   `memberadd` with the three other §4.9 acts; arm (h) drops that disjunct, and so drops all four. */
const MA_DISJUNCT = `        || op === "projectparticipants" || op === "projectownerarith"\n        || CUSTODIAL_ACTIONS.includes(op))`;
const MA_RELAY = `        memberadd: () => this.memberAdd({ ...(body || {}), by: url.searchParams.get("by") }),`;
const MA_VOTE = `      if (by && admins.includes(by))\n        this.sql.exec(\`INSERT OR REPLACE INTO admin_votes (kind,target,voter,reason,created) VALUES ('add',?,?,NULL,?)\`,`;

/* REC-159's four sites: one op's stamp (the `memberset` relay — the NEGATIVE CONTROL the row names),
   the roster the store asks, the member-set reach, and the bearer bound. */
const CU_SET_RELAY = `        memberset: () => this.memberSet({ ...(body || {}), by: url.searchParams.get("by") }),`;
const CU_BAR = `  #custodialBar(by, act) {\n    if (by === null`;
/* RE-ANCHORED 2026-09-25 at c22-batch29 (the union of REC-155 and REC-162): REC-155 put its §4.10 spread
   directly after `...CUSTODIAL_ACTIONS,` in the member set, so the old anchor (`/* REC-146:` on the next line)
   no longer existed and custodial-reach-dropped reported DID NOT ARM. Same site, same act: the member set's
   CUSTODIAL spread removed, the line after it kept. */
const CU_REACH = `                   ...CUSTODIAL_ACTIONS,\n                   /* REC-155:`;
const CU_MACHINE = `    } else if (!(viaSession || !Array.isArray(spec.machineClasses) ? spec.classes : spec.machineClasses).includes(cls)) {`;
const CUST4 = ["memberadd", "memberset", "signeradd", "signerset"];
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
  /* REC-156 — `op=memberadd`'s `by` (§8). The founder's session is the one session
     that reaches the op; the bearer pair runs once per class the OPS row admits, so
     each prefix below matches one assertion per class. */
  maForge: "memberadd: a body `by` naming ANOTHER administrator does not cast that administrator's endorsement",
  maPositive: "memberadd: the signed-in administrator's proposal records the endorsement as THEM",
  maReadBack: "memberadd, read back at the store: after gus endorses",
  maBearer: "memberadd, the operator's `",
  maBearerBack: "memberadd, the `",
  maStoreNoStamp: "the STORE: a body `by` with NO stamp beside it records NO endorsement",
  maStoreStamped: "the STORE: with a stamp beside it, the STAMP names the endorser",
  structMaStamp: "STRUCTURE: the `by` stamp names `memberadd` in its OWN disjunct",
  structMaRelay: "STRUCTURE: the store's `memberadd` relay spreads the body and THEN sets `by`",
  /* REC-159 — §9, the four §4.9 custodial acts from an enrolled administrator's session. */
  closed8f: "CLOSED BY REC-159",
  c9invite: "9a memberadd: ruth's own session issues an invitation",
  c9forgeAdd: "9a memberadd: ruth's proposal of an administrator records HER endorsement",
  c9addBack: "9a memberadd, read back at the store",
  c9set: "9b memberset: ruth's own session",
  c9setBack: "9b memberset, read back",
  c9kAdd: "9c signeradd: ruth's own session",
  c9kAddBack: "9c signeradd, read back",
  c9kSet: "9d signerset: ruth's own session",
  c9kSetBack: "9d signerset, read back",
  c9cai: (op) => `9e op=${op}: cai, an ordinary member, is refused NOT_AN_ADMIN`,
  c9caiNothing: "9e and NOTHING cai asked for landed",
  c9bearerAdmin: "9f the operator's `admin` bearer",
  c9memberBearer: (op) => `9f op=${op}: the MEMBER_TOKEN bearer is refused CLASS_FORBIDDEN`,
  c9store: "9h the STORE",
  struct9Reach: "STRUCTURE: the four reach BOTH session sets",
  /* REC-162 — §10, `governorconfig`'s refusal. */
  c10refused: (who) => `10a ${who} is REFUSED governorconfig at the gate`,
  c10sentence: (who) => `10a ${who} reads the FOUNDER'S-SESSION sentence`,
  c10nothing: "10a and NOTHING either of them asked for landed",
  c10positive: "10b the founder's session and the ADMIN_TOKEN bearer still set an appetite",
};
const C10_WHO = ["ruth (an ENROLLED administrator)", "cai (an ordinary member)"];
const GOV_SENTENCE = `      "this operation is reserved to the founder's session",`;
const GOV_MEMBER_SET = `"inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate",\n`;
const GOV_CLASSES = `  governorconfig: { classes: ["admin", "probe"],                     mutating: true  },`;
const GOV_DETAIL = "`'${String(op).slice(0, 60)}' is reachable from a signed-in session, but only the founder's: `";
/* The eight §9 arms that read WHO the record names for ruth's four acts. */
const C9_ATTRIB = [L.c9forgeAdd, L.c9addBack, L.c9set, L.c9setBack, L.c9kAdd, L.c9kAddBack, L.c9kSet, L.c9kSetBack];
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
           invisible.
         · REC-156 (2026-09-21) ADDED `L.structMaStamp`, `L.maForge`, `L.maPositive`
           and `L.maReadBack`, DECLARED BEFORE ARMING and not after a run:
           `memberadd` now shares the ONE stamp expression this arm widens, so the
           founder's session — a SESSION — has its typed `by=ruth` honoured and
           ruth's endorsement recorded, exactly the defect REC-156 closes. The
           bearer and store-direct memberadd arms stay green: a bearer is not a
           session, and the Durable Object is not behind the stamp. */
    mustFail: [L.forgeEndorse, L.forgeTally, L.forgeNotInvited, L.forgeRemove, L.forgeCaps,
               L.mirror, L.endorsedBy, L.enrols, L.oneReal, L.caiMirror,
               L.structStamp, L.consensusThree,
               L.structMaStamp, L.maForge, L.maPositive, L.maReadBack,
               /* REC-159, DECLARED BEFORE ARMING: the custodial four share this ONE stamp, so ruth's
                  typed `by=gus` is honoured at every §9 act and every attribution read-back fails. */
               ...C9_ATTRIB],
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
    edits: [[MEMBER_REACH, "                   /* REC-159:"]],
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
               ...L.caiRefusedAny,
               /* REC-159, DECLARED BEFORE ARMING, a fixture cascade: nell never becomes an
                  administrator here, so her endorsement in §9a's read-back is refused. */
               L.c9addBack],
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
               ...L.caiRefusedAny,
               L.c9addBack],   /* REC-159: reach-dropped's cascade — nell is never an administrator */
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

  /* ================== REC-156 (2026-09-21) — `op=memberadd`'s `by`, four arms ==
     Declared BEFORE ARMING, each alone, the other sites HELD OPEN. */

  /* (h) THE ROW'S OWN NEGATIVE CONTROL: the `memberadd` disjunct dropped from the
     stamp's condition and NOTHING else. The caller's query is copied into the inner
     URL before the stamps run, so with the disjunct gone the `by=ruth` a caller typed
     reaches the store's relay unchallenged — and the relay, which reads only the
     query, honours it. Every plane-routed forgery arm must fail BY NAME; the two
     store-direct arms, with no plane in front of them, must stay green, and so must
     all of D-136's, because the three ops keep their own disjunct. */
  "memberadd-disjunct-dropped": {
    file: IDX,
    edits: [[MA_DISJUNCT, `        || op === "projectparticipants" || op === "projectownerarith" /* ARMED */)`]],
    mustFail: [L.structMaStamp, L.maForge, L.maPositive, L.maReadBack, L.maBearer, L.maBearerBack,
               /* REC-159, DECLARED BEFORE ARMING: the disjunct is the four's now, so with it gone a
                  caller's typed `by` reaches every custodial store method — ruth's `by=gus` is taken,
                  cai (who sends none) arrives with NO `by` and is admitted, and the admin bearer's
                  `by=ruth` is recorded as ruth. */
               ...C9_ATTRIB, ...CUST4.map(L.c9cai), L.c9caiNothing, L.c9bearerAdmin],
  },

  /* (i) THE LIAR THE ROW NAMES: stamp at the plane while the STORE honours the body —
     the relay put back to `memberAdd(body || {})`, the stamp LEFT STANDING. The forged
     id rides in every body, so every memberadd arm that sends one must fail, the
     store-direct pair included; the stamp's own structural pin must stay green, which
     is what shows the two halves are independent. */
  "memberadd-relay-dropped": {
    file: STORE,
    edits: [[MA_RELAY, `        memberadd: () => this.memberAdd(body || {}) /* ARMED */,`]],
    mustFail: [L.structMaRelay, L.maForge, L.maPositive, L.maReadBack, L.maBearer, L.maBearerBack,
               L.maStoreNoStamp, L.maStoreStamped,
               /* REC-159, DECLARED BEFORE ARMING: §9's memberadd arms read the body too — ruth's
                  proposal is recorded as gus, and cai's invitation carries no `by` and lands. */
               L.c9forgeAdd, L.c9addBack, L.c9cai("memberadd"), L.c9caiNothing],
  },

  /* (j) THE SUBTLER LIAR, and the reason §8e exists: the relay PREFERS the stamp and
     FALLS BACK to the body when the query carries none. Through the plane the stamp
     is always there, so EVERY op-level arm must stay green; only the store-direct
     drive with no stamp can see it — plus the relay's structural pin, whose text the
     arm edits. */
  "memberadd-relay-fallback": {
    file: STORE,
    edits: [[MA_RELAY, `        memberadd: () => this.memberAdd({ ...(body || {}), by: url.searchParams.get("by") ?? (body || {}).by /* ARMED */ }),`]],
    mustFail: [L.structMaRelay, L.maStoreNoStamp],
  },

  /* (k) OVER-STRICTNESS, REQUIRED: the store records NO proposer's endorsement at all
     — the "fix" that closes a forgery by dropping every voter. The vote write is
     disabled in place and nothing else moves: every arm about a FORGED or a BEARER
     `by` must stay green (nobody is recorded, so no forgery lands), while the genuine
     proposer's own endorsement, its read-back and the stamped store drive must FAIL —
     the only thing that tells a fence refusing a forged voter from one refusing every
     voter. */
  "memberadd-overstrict": {
    file: STORE,
    edits: [[MA_VOTE, MA_VOTE.replace("if (by && admins.includes(by))",
      "if (false /* ARMED */ && by && admins.includes(by))")]],
    mustFail: [L.maPositive, L.maReadBack, L.maStoreStamped,
               L.c9forgeAdd, L.c9addBack],   /* REC-159: ruth's proposal records no endorsement either */
  },
  /* ================== REC-159 (2026-09-23) — the four §4.9 custodial acts, four arms ==
     Declared BEFORE ARMING, each alone, the other sites HELD OPEN. */
  /* (l) THE ROW'S OWN NEGATIVE CONTROL, as the spawn named it: DROP ONE OP'S STAMP. The `memberset`
     relay put back to `memberSet(body || {})`, nothing else moved: ruth's body `by=gus` is recorded,
     cai's body carries none and is admitted, the admin bearer's body `by=ruth` is recorded, and the
     store-direct arm's stamp never reaches the method. Every memberset arm fails BY NAME; the other
     three ops' arms stay green, which is what shows the stamp is per op. */
  "custodial-stamp-dropped": {
    file: STORE,
    edits: [[CU_SET_RELAY, `        memberset: () => this.memberSet(body || {}) /* ARMED */,`]],
    mustFail: [L.c9set, L.c9setBack, L.c9cai("memberset"), L.c9caiNothing, L.c9bearerAdmin, L.c9store],
  },
  /* (m) THE ROSTER DROPPED — `#custodialBar` answers null for everybody. The liar the row names:
     reach widened without the roster. Every ordinary-member arm must fail and nothing else. */
  "custodial-roster-dropped": {
    file: STORE,
    edits: [[CU_BAR, `  #custodialBar(by, act) {\n    if (true) return null; /* ARMED */\n    if (by === null`]],
    mustFail: [...CUST4.map(L.c9cai), L.c9caiNothing, L.c9store],
  },
  /* (n) THE REACH DROPPED from the MEMBER set, the admin set left standing: an enrolled
     administrator is back to SESSION_ROLE_CANNOT_REACH_OP — the defect itself. Every positive arm
     fails, cai is refused by the gate rather than the roster, and everything downstream of an act
     that never happened cascades, declared. */
  "custodial-reach-dropped": {
    file: IDX,
    edits: [[CU_REACH, "                   /* REC-155:"]],
    mustFail: [L.closed8f, L.c9invite, ...C9_ATTRIB, ...CUST4.map(L.c9cai), L.c9caiNothing,
               L.c9bearerAdmin, L.c9store, L.struct9Reach],
  },
  /* (o) THE BEARER BOUND DROPPED — the class check reads `classes` for everybody, so `member` in the
     four rows admits the MEMBER_TOKEN bearer: the widening `machineClasses` exists to prevent. Its
     four refusals fail; its memberset re-activates vic, so §9h's read-back cascades, declared. */
  "custodial-machine-open": {
    file: IDX,
    edits: [[CU_MACHINE, `    } else if (!spec.classes.includes(cls) /* ARMED */) {`]],
    mustFail: [...CUST4.map(L.c9memberBearer), L.c9store],
  },
  /* REC-162 ADDS THREE ARMS, DECLARED BEFORE ARMING (2026-09-25), for §10.
     (p) THE ROW'S OWN CONTROL: the administrator sentence restored for a founder-only op. Both
     sentence arms MUST FAIL by name; the refusals, the nothing-landed read-back and the positive pair
     stay green, because the gate still refuses — only what it SAYS moved. */
  "founder-sentence-reverted": {
    file: IDX,
    edits: [[GOV_SENTENCE, `      "this operation is reserved to an administrator of this group", /* ARMED */`]],
    mustFail: C10_WHO.map(L.c10sentence),
  },
  /* (q) THE LIAR THE ROW NAMES: `governorconfig` moved into the MEMBER set too, so nobody is told
     anything false because nobody is refused. Both refusal arms, both sentence arms and the
     nothing-landed read-back MUST FAIL; the positive pair stays green.
     FIRST RUN (2026-09-25) NOT AS DECLARED, 83/4, and it was a finding about the DECLARATION: with the
     member set alone widened, the nothing-landed read-back stayed GREEN, because the OPS row's
     `classes: ["admin", "probe"]` is a second fence — a member session passes the session gate and is
     refused by the class check. The liar that makes an administrator's session actually set an
     appetite has to widen BOTH, which is D-136's "reach" in full; re-declared onto that. */
  "governorconfig-both-sets": {
    file: IDX,
    edits: [[GOV_MEMBER_SET, `"inbox", "inboxget", "inboxresolve", "audit", "select", "selectionrelease", "governorstate", "governorconfig" /* ARMED */,\n`],
            [GOV_CLASSES, `  governorconfig: { classes: ["admin", "member", "probe"] /* ARMED */,          mutating: true  },`]],
    mustFail: [...C10_WHO.map(L.c10refused), ...C10_WHO.map(L.c10sentence), L.c10nothing],
  },
  /* (r) OVER-STRICTNESS (required): the founder's-session `detail` rewritten in words the suite never
     saw, still true and naming no role. MUST PASS whole. */
  "founder-detail-respelled": {
    file: IDX,
    edits: [[GOV_DETAIL, "`Only the session opened with the founder's password performs this; enrolled members, administrators among them, sign in otherwise. ` /* ARMED */"]],
    mustFail: [],
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

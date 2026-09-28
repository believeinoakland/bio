/* affordances: the catalogue (R1–R7), the rung backing that can be read off the tables (R19's structural half), the
   decorated shape's rung totality (R24) and the no-place rule (R25), each at the module's exports. What the acting
   modules answer when the acts are performed (R18–R20) is driven through the plane in `plane.test.mjs`. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as A from "../../../src/affordances.mjs";
import * as C from "../../../checks/bio-checks.mjs";
import * as inquiry from "../../../src/inquiry/index.mjs";
import * as entities from "../../../src/entities/index.mjs";
import * as progressions from "../../../src/progressions/index.mjs";
import * as promotion from "../../../src/promotion/index.mjs";
import * as recordCore from "../../../src/record-core/index.mjs";
import * as basisVersions from "../../../src/basis-versions/index.mjs";
import * as content from "../../../src/content/index.mjs";
import * as actions from "../../../src/actions/index.mjs";
import * as ratification from "../../../src/ratification/index.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { list as profiles, get as profile } from "../../../../jurisdictions/index.mjs";

const { ACTS, CAPTURE_ACTS, PER_ITEM_ACTS, NON_ACTS, RUNGS, RUNG_ABSENT, RUNG_LADDER, RUNG_ABSENCE_GROUNDS,
        IRREVERSIBLE_CORRECTION_PATH, VOCABULARIES, MACHINE_REFUSALS, JUSTIFICATION_REFUSALS } = A;
const ids = (xs) => xs.map((a) => a.id).sort();

test("R1: ACTS holds exactly the object-directed acts, each at its weight", () => {
  const W = {
    refuse: ["release", "retire", "dispose", "sever", "reinstate"],
    report: ["cite"],
    single: ["conclude", "reopen", "publish", "inquirydivide", "inquiryground", "actionmove", "actioncorrespond",
      "actionlaws", "actionrisktier", "versionaccept", "versionreject", "versionconsider", "versionrevert",
      "versioncurrent", "withdrawconclusion", "versionhide", "projectinvite", "projectjoin", "projectleave",
      "projectremove", "projectowneradd", "projectownerremove", "projectownerrescue", "projectvisibilityset"],
  };
  const want = Object.entries(W).flatMap(([w, xs]) => xs.map((id) => [id, w])).sort();
  assert.deepEqual(ACTS.map((a) => [a.id, a.weight]).sort(), want);
  assert.equal(new Set(ACTS.map((a) => a.id)).size, ACTS.length);
  for (const a of ACTS) {
    assert.equal(typeof a.label, "string"); assert.ok(a.label.length > 0);
    assert.ok(Array.isArray(a.types) && a.types.length > 0); assert.equal(typeof a.applies, "function");
  }
});

test("R1: CAPTURE_ACTS holds attest, monitor and attesttext, with no weight", () => {
  assert.deepEqual(ids(CAPTURE_ACTS), ["attest", "attesttext", "monitor"]);
  for (const a of CAPTURE_ACTS) { assert.equal(a.weight, undefined); assert.ok(a.label.length > 0); }
});

test("R1: PER_ITEM_ACTS holds the four set acts, weight per-item, set key items, with their identity groups and shareable fields", () => {
  assert.deepEqual(PER_ITEM_ACTS.map((a) => [a.id, a.weight, a.set_key, a.item_keys, a.shared_keys]), [
    ["proposedispose", "per-item", "items", [["key"], ["progressionKey", "stageKey"], ["project", "finding"]],
     ["to", "reason", "kind", "definitionVersion"]],
    ["taskresolve", "per-item", "items", [["id"]], []],
    ["taskforward", "per-item", "items", [["id"]], ["to"]],
    ["resolve", "per-item", "items", [["captureSha"], ["captureSha", "ref"]], ["ref"]],
  ]);
});

/* R2 as folded (K211, K221): K221 adds `triage` and `reevaluationrecord` to the reasoned rung; T8 layer 11 grades layer 9's
   acts on R27's rule (six `reasoned`, `escalationresume` `reversible`). */
test("R2: the rung ladder, low to high, and RUNGS' assignment", () => {
  assert.deepEqual(RUNG_LADDER, ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
  const want = {
    irreversible: ["publish"],
    attested: ["attest", "caseratify", "ratify"],
    terminal: ["retire"],
    reversible: ["actionlaws", "cite", "escalationresume", "projectvisibilityset", "versionaccept", "versioncurrent",
      "versionhide", "versionrevert"],
    reasoned: ["actionmove", "actionrisktier", "addressedrecord", "adminremove", "aliaswithdraw", "aspirationdepart",
      "aspirationretire", "biasdebtresolve", "conclude", "connectionassert", "consequencerevise", "discharge", "dispose",
      "escalationadvance", "escalationdecline", "escalationevaluate", "escalationsuspend", "filemembershipjudge", "goalclose",
      "inquirydivide", "inquiryground", "narrow", "projectownerremove", "projectownerrescue", "proposedispose",
      "reevaluationrecord", "reinstate", "relationdeclare", "relationwithdraw", "release", "reopen", "sever",
      "themewithdraw", "triage", "versionconsider", "versionreject", "withdrawconclusion"],
  };
  const got = {};
  for (const [op, r] of Object.entries(RUNGS)) (got[r] ??= []).push(op);
  for (const k of Object.keys(got)) got[k].sort();
  assert.deepEqual(got, want);
});

test("R2: the correction path states that correction moves forward and nothing is erased (DEC-19)", () => {
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /FORWARD/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /edition/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /withdrawal/);
  assert.match(IRREVERSIBLE_CORRECTION_PATH, /Nothing is\s+erased/);
});

test("R3: RUNG_ABSENT names each op with one ground of RUNG_ABSENCE_GROUNDS, each ground carries its sentence, "
   + "and no op is in both RUNGS and RUNG_ABSENT", () => {
  assert.deepEqual(Object.keys(RUNG_ABSENCE_GROUNDS).sort(),
    ["caller-owned", "credential", "observational", "substrate", "undetermined"]);
  for (const s of Object.values(RUNG_ABSENCE_GROUNDS)) assert.ok(typeof s === "string" && s.length > 40);
  for (const [op, e] of Object.entries(RUNG_ABSENT)) {
    assert.ok(Object.hasOwn(RUNG_ABSENCE_GROUNDS, e.ground), `${op}: ${e.ground}`);
    assert.ok(typeof e.is === "string" && e.is.length > 0, op);
  }
  assert.deepEqual(Object.keys(RUNGS).filter((op) => Object.hasOwn(RUNG_ABSENT, op)), []);
});

test("R3 R12: against a table of every op the catalogue classifies, with each rung-classified op mutating, nothing is "
   + "unaccounted — the tables are consistent with one another", () => {
  const ops = new Set([...Object.keys(NON_ACTS), ...ACTS.map((a) => a.id), ...Object.keys(RUNGS), ...Object.keys(RUNG_ABSENT)]);
  const table = [...ops].map((op) => ({ op, mutating: Object.hasOwn(RUNGS, op) || Object.hasOwn(RUNG_ABSENT, op),
    gated: Object.hasOwn(NON_ACTS, op) || ACTS.some((a) => a.id === op) }));
  assert.deepEqual(A.unaccounted(table), { unpublished: [], unranked: [], stale: [] });
  assert.deepEqual(ACTS.map((a) => a.id).filter((id) => !Object.hasOwn(RUNGS, id) && !Object.hasOwn(RUNG_ABSENT, id)), []);
});

test("R4: VOCABULARIES carries exactly the named vocabularies", () => {
  assert.deepEqual(Object.keys(VOCABULARIES).sort(), ["action_kind", "law_levels", "dispositions", "subject_positions",
    "basis_roles", "entity_kinds", "relation_kinds", "stage_requiredness", "action_basis_kinds",
    "correspondence_directions", "correspondence_stages", "correspondence_outcomes", "resolutions", "risk_tiers",
    "version_states", "version_edges", "version_reason_required", "rung_ladder", "rung_correction_path",
    "rung_absence_grounds", "sufficiency_claim_states", "content_mint_states"].sort());
});

test("R4: each fixed value is the very object its enforcing module refuses against — the same reference, never a copy", () => {
  const same = [
    ["law_levels", actions.LAW_LEVELS], ["dispositions", inquiry.DISPOSITIONS],
    ["subject_positions", ratification.SUBJECT_POSITIONS], ["basis_roles", inquiry.BASIS_ROLES],
    ["entity_kinds", entities.ENTITY_KINDS], ["relation_kinds", entities.RELATION_KINDS],
    ["stage_requiredness", progressions.STAGE_REQUIREDNESS], ["action_basis_kinds", actions.ACTION_BASIS_KINDS],
    ["correspondence_directions", actions.CORRESPONDENCE_DIRECTIONS],
    ["correspondence_stages", actions.CORRESPONDENCE_STAGES], ["correspondence_outcomes", actions.CORRESPONDENCE_OUTCOMES],
    ["resolutions", actions.RESOLUTIONS], ["risk_tiers", actions.RISK_TIERS],
    ["version_states", basisVersions.VERSION_MACHINE.legal], ["version_edges", basisVersions.VERSION_MACHINE.edges],
    ["version_reason_required", basisVersions.VERSION_REASON_REQUIRED], ["rung_ladder", RUNG_LADDER],
    ["rung_correction_path", IRREVERSIBLE_CORRECTION_PATH], ["rung_absence_grounds", RUNG_ABSENCE_GROUNDS],
    ["sufficiency_claim_states", C.SUFFICIENCY_CLAIM_STATES], ["content_mint_states", content.CONTENT_MINT_STATES],
  ];
  assert.deepEqual(same.filter(([k, v]) => VOCABULARIES[k] !== v).map(([k]) => k), []);
  assert.equal(same.length + 1, Object.keys(VOCABULARIES).length, "every key but action_kind is a fixed value checked here");
});

/* R26: the kinds come from actions at the moment of the call (its R10, R40), the tiers are actions' own. Every
   profile the jurisdictions module lists is taken alone and all together, so a view that adds kinds is exercised. */
const views = () => {
  const ids = profiles().map((p) => p.id);
  const out = [["no profile active", null]];
  for (const id of ids) { const c = combine([id]); if (c && c.ok) out.push([id, c.view]); }
  const all = combine(ids); if (all && all.ok) out.push([ids.join("+"), all.view]);
  return out;
};
test("R26 R4: risk_tiers is actions' RISK_TIERS, and action_kind, with no instance to ask, is actions' answer with no "
   + "profile active — the product's kinds alone, no kind held here", () => {
  assert.equal(VOCABULARIES.risk_tiers, actions.RISK_TIERS);
  assert.deepEqual(VOCABULARIES.action_kind, actions.actionKinds(null));
  assert.equal(VOCABULARIES.action_kind, actions.PRODUCT_KINDS);
});

test("R26 R4: vocabulariesFor(kinds) publishes as action_kind exactly the kinds actions answers for the instance's view, "
   + "the product's kinds then the profiles', and every other vocabulary as the same object", () => {
  const vs = views();
  assert.ok(vs.some(([, v]) => actions.actionKinds(v).length > actions.PRODUCT_KINDS.length),
    "some profile adds a kind, so the instrument sees the view");
  for (const [name, view] of vs) {
    const kinds = actions.actionKinds(view);
    const v = A.vocabulariesFor(kinds);
    assert.deepEqual(v.action_kind, kinds, name);
    assert.deepEqual(v.action_kind.slice(0, actions.PRODUCT_KINDS.length), [...actions.PRODUCT_KINDS], name);
    assert.deepEqual(Object.keys(v), Object.keys(VOCABULARIES), name);
    for (const k of Object.keys(VOCABULARIES)) if (k !== "action_kind") assert.equal(v[k], VOCABULARIES[k], `${name}: ${k}`);
  }
  for (const bad of [undefined, null, [], "records_request", [1], [""], [null]])
    assert.equal(A.vocabulariesFor(bad).action_kind, actions.PRODUCT_KINDS, JSON.stringify(bad));
});

test("R26: no action kind is held in this module — none of legacy-checks' local kinds, and no profile's, appears in its "
   + "published text or tables", () => {
  const local = C.ACTION_KINDS.filter((k) => !actions.PRODUCT_KINDS.includes(k));
  const fromProfiles = views().flatMap(([, v]) => actions.actionKinds(v)).filter((k) => !actions.PRODUCT_KINDS.includes(k));
  const kinds = [...new Set([...local, ...fromProfiles])];
  assert.ok(kinds.length > 0, "the instrument has kinds to look for");
  const text = JSON.stringify(outward());
  assert.deepEqual(kinds.filter((k) => text.includes(k)), []);
});

test("R5: inquirydivide carries DIVIDE_PROMPT, inquiryground GROUND_PROMPT, attest ATTEST_FENCE, and every other act's prompt is null", () => {
  const prompts = Object.fromEntries([...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]
    .map((a) => [a.id, A.decorate(a, null).prompt]));
  assert.equal(prompts.inquirydivide, A.DIVIDE_PROMPT);
  assert.equal(prompts.inquiryground, A.GROUND_PROMPT);
  assert.equal(prompts.attest, A.ATTEST_FENCE);
  assert.deepEqual(Object.entries(prompts).filter(([id, p]) => !["inquirydivide", "inquiryground", "attest"].includes(id)
    && p !== null).map(([id]) => id), []);
  for (const p of [A.DIVIDE_PROMPT, A.GROUND_PROMPT, A.ATTEST_FENCE]) assert.ok(typeof p === "string" && p.length > 100);
});

test("R5: ATTEST_FENCE is DEC-39's wording verbatim, its two letters composed from the capture ceiling and the grade above it", () => {
  const dec = readFileSync(fileURLToPath(new URL("../../../../docs/development/DECISIONS.md", import.meta.url)), "utf8");
  const at = dec.indexOf("> **What co-attestation answers:**");
  assert.ok(at > 0, "DEC-39's wording is in DECISIONS.md");
  const lines = dec.slice(at).split("\n").map((l) => l.trimStart());
  const quote = lines.slice(0, lines.findIndex((l) => !l.startsWith(">"))).map((l) => l.replace(/^>\s?/, "")).join(" ").replace(/\*\*?/g, "").replace(/\s+/g, " ").trim();
  const above = C.BASIS_GRADES[C.BASIS_GRADES.indexOf(C.EARNED_CAPTURE_CEILING) - 1];
  assert.equal(C.UNREACHABLE_CAPTURE_GRADE, above);
  assert.equal(A.ATTEST_FENCE, A.attestFence(C.EARNED_CAPTURE_CEILING, above));
  assert.equal(A.attestFence("B", "A"), quote, "Bob's sentence at the ruled letters");
  assert.equal(A.attestFence("C", "B"), quote.replace("Grade B capture", "Grade C capture").replace("Grade A", "Grade B"));
});

test("R5: the fence's composer throws when either letter is absent; op=acquire's note is capture's and no copy of it "
   + "is held here (N80)", () => {
  for (const [c, u] of [[null, "A"], ["B", null], [undefined, undefined], ["", "A"], ["B", ""]])
    assert.throws(() => A.attestFence(c, u));
  assert.equal(A.acquireGradeNote, undefined);
  assert.equal(A.ACQUIRE_GRADE_NOTE, undefined);
});

test("R5: GROUND_PROMPT and every label use none of AND, OR, disjunction, branch or ground (DEC-32 clause 1)", () => {
  const texts = [["GROUND_PROMPT", A.GROUND_PROMPT], ...[...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => [a.id, a.label])];
  const bad = texts.filter(([, t]) => /\bAND\b|\bOR\b/.test(t) || /\bdisjunctions?\b|\bbranch(es)?\b|\bground(s|ed|ing)?\b/i.test(t));
  assert.deepEqual(bad, []);
});

test("R6: DISPOSITIONS is inquiry's, STAGE_REQUIREDNESS progressions', ENTITY_KINDS and RELATION_KINDS entities', "
   + "REOPENABLE_FROM promotion's and PER_ITEM_MAX record-core's, re-exported unchanged", () => {
  assert.equal(A.DISPOSITIONS, inquiry.DISPOSITIONS);
  assert.equal(A.STAGE_REQUIREDNESS, progressions.STAGE_REQUIREDNESS);
  assert.equal(A.ENTITY_KINDS, entities.ENTITY_KINDS);
  assert.equal(A.RELATION_KINDS, entities.RELATION_KINDS);
  assert.equal(A.REOPENABLE_FROM, promotion.REOPENABLE_FROM);
  assert.equal(A.PER_ITEM_MAX, recordCore.PER_ITEM_MAX);
  assert.equal(A.PER_ITEM_MAX, 100);
});

test("R7: MACHINE_REFUSALS maps exactly the acts R7 names, withdrawconclusion to MACHINE_CANNOT_CONCLUDE and the six "
   + "version acts to MACHINE_CANNOT_MOVE_VERSION", () => {
  const VERSION = ["versionaccept", "versionreject", "versionconsider", "versionrevert", "versioncurrent", "versionhide"];
  assert.deepEqual(Object.keys(MACHINE_REFUSALS).sort(), ["release", "conclude", "withdrawconclusion", "reopen", "publish",
    "inquirydivide", "inquiryground", "actionmove", "actioncorrespond", "actionlaws", "actionrisktier", ...VERSION].sort());
  assert.equal(MACHINE_REFUSALS.withdrawconclusion, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(MACHINE_REFUSALS.conclude, "MACHINE_CANNOT_CONCLUDE");
  for (const v of VERSION) assert.equal(MACHINE_REFUSALS[v], "MACHINE_CANNOT_MOVE_VERSION");
  for (const c of Object.values(MACHINE_REFUSALS)) assert.match(c, /^MACHINE_[A-Z_]+$/);
});

test("R7: NON_ACTS gives every op it names a reason, names no act, and a reason begins `capture-directed:` exactly "
   + "for the members of CAPTURE_ACTS", () => {
  for (const [op, r] of Object.entries(NON_ACTS)) assert.ok(typeof r === "string" && r.length > 10, op);
  assert.deepEqual(ACTS.map((a) => a.id).filter((id) => Object.hasOwn(NON_ACTS, id)), []);
  assert.deepEqual(Object.keys(NON_ACTS).filter((op) => NON_ACTS[op].startsWith("capture-directed:")).sort(),
    ids(CAPTURE_ACTS));
});

test("R19: `terminal` is given only while STATES.information.edges.retired is empty, and `irreversible` only to publish", () => {
  const terminal = Object.keys(RUNGS).filter((op) => RUNGS[op] === "terminal");
  assert.deepEqual(C.STATES.information.edges.retired, []);
  assert.deepEqual(terminal, ["retire"]);
  assert.deepEqual(Object.keys(RUNGS).filter((op) => RUNGS[op] === "irreversible"), ["publish"]);
});

test("R19: the justification family names only codes that ask the member for an account, and holds the "
   + "codes the reasoned ops of T7 refuse with", () => {
  for (const c of JUSTIFICATION_REFUSALS) assert.match(c, /^[A-Z_]+$/);
  for (const c of ["NO_REASON", "VERSION_NO_REASON", "NO_ACKNOWLEDGMENT", "NO_MITIGATION", "NO_CONCLUSION",
    "NO_FALSIFIER", "NO_JUSTIFICATION", "THEME_WITHDRAW_NO_REASON", "FILE_MEMBERSHIP_NO_REASON",
    "CONNECTION_ASSERT_NO_BASIS", "NO_LESSON", "BIAS_DEBT_NO_REASON", "RISK_TIER_REASON_REFUSED", "NARROW_NO_DESCRIPTION", "REEVALUATION_NOTE_MALFORMED"]) assert.ok(JUSTIFICATION_REFUSALS.includes(c), c);
  for (const c of ["NO_TARGET", "NO_ID", "NO_KIND", "NO_LABEL", "NO_CITATION", "NO_BODY", "NO_TITLE"])
    assert.ok(!JUSTIFICATION_REFUSALS.includes(c), c);
});

test("R24: no decorated act, capture act or set act reaches a caller with a null rung and a null rung_absence", () => {
  const all = [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => A.decorate(a, null));
  assert.deepEqual(all.filter((d) => d.rung === null && d.rung_absence === null).map((d) => d.id), []);
  assert.deepEqual(all.filter((d) => d.rung !== null && d.rung_absence !== null).map((d) => d.id), []);
});

/* R25: the places come from the jurisdiction profiles' own data, never a list typed here. */
const placeTerms = () => {
  const terms = new Set();
  for (const { id } of profiles()) {
    const p = profile(id);
    for (const c of p.covers ?? []) {
      terms.add(c);
      terms.add(c.replace(/^(City|County|Town|Port) of /, "").replace(/ (County|City)$/, ""));
    }
    const walk = (o, d = 0) => {
      if (!o || typeof o !== "object" || d > 4) return;
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === "string" && /^(name|label)$/.test(k)) {
          for (const m of v.matchAll(/\(([^)]+)\)/g)) terms.add(m[1]);
          const lead = /^([A-Z][A-Za-z.]+),/.exec(v); if (lead) terms.add(lead[1]);
        } else walk(v, d + 1);
      }
    };
    walk(p.spaces); walk(p.systems);
  }
  return [...terms].filter((t) => t.length > 2);
};
const outward = () => {
  const out = [];
  const add = (where, v) => { if (typeof v === "string") out.push([where, v]);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) add(`${where}.${k}`, x); };
  for (const a of [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS]) { add(`${a.id}.label`, a.label); add(`${a.id}.prompt`, a.prompt); }
  add("NON_ACTS", NON_ACTS); add("RUNG_ABSENT", RUNG_ABSENT); add("RUNG_ABSENCE_GROUNDS", RUNG_ABSENCE_GROUNDS);
  add("IRREVERSIBLE_CORRECTION_PATH", IRREVERSIBLE_CORRECTION_PATH);
  add("VOCABULARIES", VOCABULARIES); add("MACHINE_REFUSALS", MACHINE_REFUSALS);
  return out;
};
test("R25: no place any jurisdiction profile names appears in this module's outward text, NON_ACTS.idmatch included", () => {
  const terms = placeTerms();
  assert.ok(terms.includes("Oakland") && terms.includes("Legistar") && terms.includes("APN") && terms.includes("C.M.S."),
    `the instrument reads the profiles (${terms.join(", ")})`);
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hits = [];
  for (const [where, text] of outward())
    for (const t of terms) if (new RegExp(`(^|[^A-Za-z])${esc(t)}([^A-Za-z]|$)`).test(text)) hits.push(`${where}: ${t}`);
  assert.deepEqual(hits, []);
  assert.ok(typeof NON_ACTS.idmatch === "string" && NON_ACTS.idmatch.length > 40);
});

/* R27 as ruled (K211): of the 42 ops graded `undetermined` before T7, three moved to `reasoned` and four to
   `reversible`; the other 34 stay, with intent's seven graded on the same rule (K211 Q4). Whether each `reasoned`
   op really refuses without an account is R19's drive (plane.test.mjs, backing.test.mjs). */
test("R27: no op is graded `undetermined` that the ruling moved, and exactly the ruled ops remain `undetermined`", () => {
  const moved = { biasdebtresolve: "reasoned", actionrisktier: "reasoned", narrow: "reasoned", versionaccept: "reversible",
    versioncurrent: "reversible", actionlaws: "reversible", projectvisibilityset: "reversible" };
  for (const [op, r] of Object.entries(moved)) { assert.equal(RUNGS[op], r, op); assert.ok(!Object.hasOwn(RUNG_ABSENT, op), op); }
  const undetermined = Object.keys(RUNG_ABSENT).filter((op) => RUNG_ABSENT[op].ground === "undetermined").sort();
  assert.deepEqual(undetermined, ["inboxresolve", "taskforward", "taskresolve", "actioncorrespond", "actionlawspropose",
    "projectfork", "biasadopt", "strengthbar", "entitycreate", "entityalias", "resolve", "attesttext", "thread",
    "airunopen", "airunclose", "suggest", "contentmint", "extractpropose", "connectionchoose", "transcribe",
    "transcriptionattest", "testify", "lead", "leadshare", "attribute", "casedraft", "reviewcomment", "statementack",
    "leadlook", "themedeclare", "themeplace", "themepropose", "progressiondefine", "resolvetestify",
    "contradictionpropose", "objectivecondition", "goaldeclare", "goallink", "aspirationdeclare", "aspirationdeadend",
    "workobjective", "versionadopt", "versionkeep",
    /* T8 layer 11: layer 9's acts that ask no authored reason (or only a proposal's why) and that nothing takes back */
    "standarddeclare", "standardpropose", "standardadopt", "determine", "comparisonpropose", "consequencerecord",
    "filingprepare", "filingapprove", "filingsent", "counselpacket", "theorypropose", "escalationopen", "escalationattach",
    "escalationend", "actionriskpropose"].sort());
});

test("R27: no new rung is added — the ladder keeps its five", () => {
  assert.deepEqual(RUNG_LADDER, ["reversible", "reasoned", "terminal", "attested", "irreversible"]);
  assert.ok(Object.values(RUNGS).every((r) => RUNG_LADDER.includes(r)));
});

/* K208 (2), T8 layer 11: every op layers 7–10 route is accounted for, keyed to each module's own op map (escalation's
   names are the control plane's, LEGACY-INDEX #5 J1): each mutating one has a NON_ACTS row or a published act and a rung
   or a stated absence. Reads carry no NEEDS row, so NON_ACTS names none of them (R12's `stale`). */
import { standardsOps } from "../../../src/standards/index.mjs";
import { conformanceOps } from "../../../src/conformance/index.mjs";
import { consequencesOps } from "../../../src/consequences/index.mjs";
import { filingsOps } from "../../../src/filings/index.mjs";
test("R3 R12: each mutating op of layer 9's modules is published or a NON_ACT, with a rung or a stated absence, and no "
   + "read of theirs is named in NON_ACTS", () => {
  const url = new URL("http://x/");
  const keys = (f) => Object.keys(f({}, url, {}));
  const READS = new Set(["standard", "standards", "standardinforce", "determination", "determinations", "comparison",
    "consequence", "consequencesof", "addressed", "counselpacketread", "filingsfor", "availableactions",
    "escalation", "escalationsdue", "monitoring"]);
  const ESCALATION = ["escalationopen", "escalationattach", "escalationevaluate", "escalationadvance", "escalationdecline",
    "escalationend", "escalationsuspend", "escalationresume", "escalation", "escalationsdue"];
  const ops = [...keys(standardsOps), ...keys(conformanceOps), ...keys(consequencesOps), ...keys(filingsOps),
    ...ESCALATION, "actionriskpropose", "monitoring"];
  assert.equal(ops.length, 6 + 5 + 6 + 9 + 10 + 2);
  const mutating = ops.filter((op) => !READS.has(op));
  assert.equal(mutating.length, 23);
  const published = new Set([...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => a.id));
  assert.deepEqual(mutating.filter((op) => !published.has(op) && !Object.hasOwn(NON_ACTS, op)), []);
  assert.deepEqual(mutating.filter((op) => !Object.hasOwn(RUNGS, op) && !Object.hasOwn(RUNG_ABSENT, op)), []);
  assert.deepEqual(ops.filter((op) => READS.has(op) && (Object.hasOwn(NON_ACTS, op) || Object.hasOwn(RUNGS, op)
    || Object.hasOwn(RUNG_ABSENT, op))), []);
  /* the table legacy-index routes (J1): mutating ops gated, reads ungated — R12 answers nothing unaccounted for them */
  const table = ops.map((op) => ({ op, mutating: !READS.has(op), gated: !READS.has(op) }));
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
});

/* T46 (R25; DEC-194, N913), as T50 reads it (plan rule 6, N1116): the C-147 rows take their translations from
   `words.json`'s `refusal.<CODE>`, read by key through setup-words, never a copy; codes, numbers and `where`s unmoved.
   At the interface: the rows as exported, and every refusal of the family as the acts answer it, each beside its
   control, the same act landing without the refusing condition. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, snapshot } from "./fixture.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { PROJECT_SCOPE_CHECKS } from "../../../src/project-roster/index.mjs";

/* DEC-303: C-147.10 reads a project's own sentence, refusal.STAKE_MALFORMED.project */
const keyOf = (code) => (code === "STAKE_MALFORMED" ? "refusal.STAKE_MALFORMED.project" : `refusal.${code}`);
const en = (code) => word(keyOf(code));

/* The family: each code's number and `where`. C-147.9 and .10 are R31's (T50). */
const AT = (fn, region) => `src/project-roster/index.mjs ${fn} > ${region}`;
const ROWS = {
  PROJECT_SCOPE_UNKNOWN: ["C-147.1", AT("projectScopeSet", "is-project-scope-set")],
  PROJECT_SCOPE_NEEDS_HIDDEN: ["C-147.2", AT("projectScopeSet", "is-project-scope-set")],
  PROJECT_SCOPE_OWN_NOT_SOLE: ["C-147.3", AT("projectScopeSet", "is-project-scope-set")],
  PROJECT_SCOPE_UNCHANGED: ["C-147.4", AT("projectScopeSet", "is-project-scope-set")],
  PROJECT_SCOPE_OWN: ["C-147.5", AT("#guard", "is-project-scope-guard")],
  PROJECT_SCOPE_KEEPS_HIDDEN: ["C-147.6", AT("#guard", "is-project-scope-guard")],
  APPROVAL_RULE_INVALID: ["C-147.7", AT("projectApprovalSet", "is-project-approval-set")],
  APPROVAL_KIND_UNKNOWN: ["C-147.8", AT("projectApprovalSet", "is-project-approval-set")],
  MACHINE_CANNOT_SET_STAKE: ["C-147.9", AT("projectStakeSet", "is-project-stake-set")],
  STAKE_MALFORMED: ["C-147.10", AT("projectStakeSet", "is-project-stake-set")],
};

test("R25 every C-147 row's translation is words.json's refusal.<CODE>, read by key; codes, numbers and wheres unmoved", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(PROJECT_SCOPE_CHECKS).map(([c, r]) => [c, [r.check, r.where]])), ROWS);
  for (const code of Object.keys(ROWS)) {
    const row = PROJECT_SCOPE_CHECKS[code];
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    /* a code the list holds is read from it; one it does not yet hold reads null, never inline English */
    assert.equal(row.translation, hasWord(keyOf(code)) ? en(code) : null, `${code} reads ${keyOf(code)}`);
  }
});

test("R25 each of the eight refusals, as its act answers it, carries words.json's refusal.<CODE> and writes nothing; each control lands with no translation", async () => {
  /* H hidden: ann owns it, bob joined. S hidden: dee its owner and only participant. D discoverable: ann. */
  const w = await world().group("ann", "bob", "dee", "eve");
  w.owned("PROJ-H", "ann", ["bob"]);
  w.owned("PROJ-S", "dee");
  w.owned("PROJ-D", "ann");
  w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") });
  const scope = (by, s, projectId = "PROJ-H", reason = "a reason") =>
    w.r.projectScopeSet({ projectId, scope: s, reason, by, viewer: V(by) });
  const approve = (needs, projectId = "PROJ-H") =>
    w.r.projectApprovalSet({ projectId, needs, reason: "a reason", by: "ann", viewer: V("ann") });
  const carries = (code, act, control) => {
    const before = snapshot(w);
    const r = act();
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, code, code, ROWS[code][0], en(code)], code);
    assert.equal(snapshot(w), before, `${code} wrote nothing`);
    const ok = control();
    assert.deepEqual([ok.ok, "translation" in ok], [true, false], `${code}: the control lands`);
  };
  carries("PROJECT_SCOPE_UNKNOWN", () => scope("bob", "privileged"), () => scope("bob", "counsel_matter"));
  carries("PROJECT_SCOPE_UNCHANGED", () => scope("bob", "counsel_matter"), () => scope("bob", "none"));
  carries("PROJECT_SCOPE_NEEDS_HIDDEN", () => scope("ann", "counsel_matter", "PROJ-D"), () => {
    w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "hidden", by: "ann", viewer: V("ann") });
    return scope("ann", "counsel_matter", "PROJ-D");
  });
  carries("PROJECT_SCOPE_OWN_NOT_SOLE", () => scope("ann", "own"), () => scope("dee", "own", "PROJ-S"));
  /* S is now dee's own project; D a counsel matter */
  carries("PROJECT_SCOPE_OWN",
    () => w.m.projectInvite({ projectId: "PROJ-S", handle: "eve", by: "dee", viewer: V("dee") }),
    () => w.m.projectInvite({ projectId: "PROJ-H", handle: "eve", by: "ann", viewer: V("ann") }));
  carries("PROJECT_SCOPE_KEEPS_HIDDEN",
    () => w.m.projectVisibilitySet({ projectId: "PROJ-D", setting: "discoverable", by: "ann", viewer: V("ann") }),
    () => w.m.projectVisibilitySet({ projectId: "PROJ-H", setting: "discoverable", by: "ann", viewer: V("ann") }));
  carries("APPROVAL_RULE_INVALID", () => approve([{ tier: 4 }]), () => approve([{ tier: 3 }]));
  carries("APPROVAL_KIND_UNKNOWN", () => approve([{ kind: "grand_jury" }]), () => approve([{ kind: "bylaw_complaint" }]));
  /* the rescue relays PROJECT_SCOPE_OWN with the same words (R22) */
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const resc = w.r.projectOwnerRescue({ projectId: "PROJ-S", handle: "eve", by: "second", reason: "r", viewer: V("second") });
  assert.deepEqual([resc.reason, resc.translation], ["PROJECT_SCOPE_OWN", en("PROJECT_SCOPE_OWN")]);
});

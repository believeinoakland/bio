/* T46 (R25; DEC-194, N913): the C-147 rows take their translations from `words.json`'s `refusal.<CODE>`, read by key,
   never a copy; codes, numbers and `where`s unmoved. At the interface: the rows as exported, and every refusal of the
   family as the acts answer it, each beside its control, the same act landing without the refusing condition. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world, V, snapshot } from "./fixture.mjs";
import { PROJECT_SCOPE_CHECKS, PROJECT_SCOPE_WORDS } from "../../../src/project-roster/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* The family as T45 left it: each code's number and `where`, which R25 does not move. */
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
};
/* The six rows R25 re-words, as T45 worded them: none of them is answered any longer. */
const T45 = {
  PROJECT_SCOPE_OWN_NOT_SOLE: "A project is made, or stops being, a member's own project only by its owner while that "
    + "owner is its one participant. Nothing was changed.",
  PROJECT_SCOPE_UNCHANGED: "The project already has that scope, so there is nothing to change. Nothing was changed.",
  PROJECT_SCOPE_OWN: "This is a member's own project: nobody else is invited to it, and nobody is made its owner in "
    + "that member's place. Nothing was changed.",
  PROJECT_SCOPE_KEEPS_HIDDEN: "A counsel matter and a member's own project stay hidden, so this one cannot be listed for "
    + "others to find. Remove its scope first if it should be. Nothing was changed.",
  APPROVAL_RULE_INVALID: "Each rule for a second approval names one kind of action, one tier (1, 2 or 3), or acts "
    + "addressed to the public. One of these does not. Nothing was changed.",
  APPROVAL_KIND_UNKNOWN: "That kind of action is not one your group's places list, so a second approval cannot be "
    + "required for it. Nothing was changed.",
};

test("R25 every C-147 row's translation is words.json's refusal.<CODE>, read by key from PROJECT_SCOPE_WORDS, never a copy; codes, numbers and wheres unmoved; the six re-worded rows answer T45's words no longer", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(PROJECT_SCOPE_CHECKS).map(([c, r]) => [c, [r.check, r.where]])), ROWS);
  /* the table holds exactly the family's keys, each words.json's English verbatim */
  assert.ok(Object.isFrozen(PROJECT_SCOPE_WORDS));
  assert.deepEqual(Object.keys(PROJECT_SCOPE_WORDS).sort(), Object.keys(ROWS).map((c) => `refusal.${c}`).sort());
  for (const [key, text] of Object.entries(PROJECT_SCOPE_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const code of Object.keys(ROWS)) {
    const row = PROJECT_SCOPE_CHECKS[code];
    assert.equal(row.translation, PROJECT_SCOPE_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
  }
  /* six rows change by it; C-147.1 and C-147.2 already read as their keys */
  for (const [code, old] of Object.entries(T45)) assert.notEqual(PROJECT_SCOPE_CHECKS[code].translation, old, code);
  assert.deepEqual(Object.keys(T45).map((c) => ROWS[c][0]),
    ["C-147.3", "C-147.4", "C-147.5", "C-147.6", "C-147.7", "C-147.8"]);
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
      [false, code, code, ROWS[code][0], en(`refusal.${code}`)], code);
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
  assert.deepEqual([resc.reason, resc.translation], ["PROJECT_SCOPE_OWN", en("refusal.PROJECT_SCOPE_OWN")]);
});

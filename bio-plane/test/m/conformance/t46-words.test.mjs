/* conformance, T46 (T46-29; R38; DEC-194, N913): the rows C-113.38 DETERMINATION_NOT_ADOPTABLE, C-113.39
   MACHINE_CANNOT_LINK_CURE, C-113.40 CURE_TARGET_NOT_NONCOMPLIANT, C-113.41 CURE_NOT_COMPLIANT, C-113.42
   CURE_OTHER_OFFICE and C-113.43 CURE_NOT_LATER take their translations from `words.json`'s `refusal.<CODE>`, read by
   key, never a copy; C-113.7 FINDING_NOT_PUBLISHED, C-113.37 DETERMINATION_VOID and C-113.44 CURE_LINKED keep their
   present translations; every other row keeps its own; codes, numbers, `where`s and behaviour unmoved. At the
   interface: the rows as exported, and each re-worded refusal as the acts answer it, each beside its control, the same
   act landing without the refusing condition; over the real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scene, V, MACHINE } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, CONFORMANCE_WORDS, determinationVoided } from "../../../src/conformance/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};

/* The six rows R38 re-words, with their numbers and `where`s, which it does not move. */
const AT = (fn, region) => `src/conformance/index.mjs ${fn} > ${region}`;
const TAKEN = {
  DETERMINATION_NOT_ADOPTABLE: ["C-113.38", AT("#refuseAdoption", "is-own-determination")],
  MACHINE_CANNOT_LINK_CURE: ["C-113.39", AT("#refuseCureMachine", "is-cure-member")],
  CURE_TARGET_NOT_NONCOMPLIANT: ["C-113.40", AT("#cureRefusal", "is-cure-target-noncompliant")],
  CURE_NOT_COMPLIANT: ["C-113.41", AT("#cureRefusal", "is-cure-compliant")],
  CURE_OTHER_OFFICE: ["C-113.42", AT("#cureRefusal", "is-cure-same-office")],
  CURE_NOT_LATER: ["C-113.43", AT("#cureRefusal", "is-cure-later")],
};
/* The six as T45 worded them (BOB's drafts): none is answered any longer. */
const T45 = {
  DETERMINATION_NOT_ADOPTABLE: "Another group's determination is never adopted as this group's. Make your own "
    + "determination, against standards in your group's record, resting on findings this group published, holds checked, "
    + "or has accepted. Nothing was written.",
  MACHINE_CANNOT_LINK_CURE: "Naming a later act as the cure of a breach is a member's judgment. An assistant may not "
    + "record it. Sign in as a member. Nothing was written.",
  CURE_TARGET_NOT_NONCOMPLIANT: "Only a noncompliant outcome is cured. The determination named is not noncompliant "
    + "against that standard. Nothing was written.",
  CURE_NOT_COMPLIANT: "The curing act is one a member determined compliant against the same standard. The determination "
    + "named as the cure does not say so. Nothing was written.",
  CURE_OTHER_OFFICE: "A breach is cured by a later act of the same office. The act named as the cure is another "
    + "office's. Nothing was written.",
  CURE_NOT_LATER: "A cure comes after the act it cures. The act named as the cure is not shown to be later, or the date "
    + "of one of the two acts is not known. Nothing was written.",
};
/* The three R38 keeps in T46, each with its present translation (returned to BOB until sentence and requirement agree). */
const KEPT_THREE = {
  FINDING_NOT_PUBLISHED: ["C-113.7", AT("#pinFindings", "is-finding-published"), "A determination rests on findings of "
    + "three kinds: published by this project in a ratified case edition; checked for publication and held unsigned by "
    + "this project; or another group's finding this group has accepted at the edition named. The finding named is none "
    + "of these. Nothing was written."],
  DETERMINATION_VOID: ["C-113.37", AT("determinationVoided", "is-determination-standing"), "That determination reads "
    + "undetermined: a finding it rests on no longer stands (its check was voided, or the other group withdrew or revised "
    + "the edition accepted). A member re-evaluates it by superseding it with a determination resting on findings that "
    + "stand. Nothing was written."],
  CURE_LINKED: ["C-113.44", AT("#cureRefusal", "is-cure-unlinked"), "A cure is already recorded for that breach against "
    + "that standard. End that link first, saying why. Nothing was written."],
};
/* Every row R38 does not re-word (35: the three above among them), as T45 left them: their canonical JSON's sha256, so
   no check, where or translation of theirs moves. */
const KEPT = { count: 35, sha256: "9496e44f8a0cb17830aab0618c249f4ba8234a57326e05016f0092d468b297e7" };

test("R38 C-113.38–C-113.43 read words.json's refusal.<CODE> by key from CONFORMANCE_WORDS, never a copy; codes, numbers and wheres unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(CONFORMANCE_WORDS));
  assert.deepEqual(Object.keys(CONFORMANCE_WORDS).sort(), Object.keys(TAKEN).map((c) => `refusal.${c}`).sort(),
    "the table holds exactly the six rows' keys");
  for (const [key, text] of Object.entries(CONFORMANCE_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  for (const [code, [check, where]] of Object.entries(TAKEN)) {
    const row = CONFORMANCE_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, where], code);
    assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"], code);
    assert.equal(row.translation, CONFORMANCE_WORDS[`refusal.${code}`], `${code} reads refusal.${code}`);
    assert.equal(row.translation, en(`refusal.${code}`), code);
    assert.notEqual(row.translation, T45[code], `${code}: T45's words no longer`);
    assert.match(row.translation, /Nothing was written\.$/, code);
  }
});

test("R38 C-113.7 FINDING_NOT_PUBLISHED, C-113.37 DETERMINATION_VOID and C-113.44 CURE_LINKED keep their present translations, not words.json's (each sentence and its requirement do not yet agree); every other row keeps its own", () => {
  for (const [code, [check, where, translation]] of Object.entries(KEPT_THREE)) {
    const row = CONFORMANCE_CHECKS[code];
    assert.deepEqual([row.check, row.where, row.translation], [check, where, translation], code);
    assert.ok(!(`refusal.${code}` in CONFORMANCE_WORDS), `${code}: not taken in T46`);
    assert.notEqual(row.translation, en(`refusal.${code}`), `${code}: words.json's sentence and R38 do not yet agree`);
  }
  const kept = Object.fromEntries(Object.entries(CONFORMANCE_CHECKS).filter(([c]) => !(c in TAKEN)));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(CONFORMANCE_WORDS).includes(r.translation), code);
  /* the three as the acts answer them: C-113.7 by determine, C-113.37 by its one function */
  const { w, input } = scene();
  const unpublished = w.c.determine(input({ findings: ["INQ-2026-0999-nowhere"] }));
  assert.deepEqual([unpublished.code, unpublished.check, unpublished.translation],
    ["FINDING_NOT_PUBLISHED", "C-113.7", KEPT_THREE.FINDING_NOT_PUBLISHED[2]]);
  const v = determinationVoided("CONF-2026-0001-determination", []);
  assert.deepEqual([v.code, v.check, v.translation], ["DETERMINATION_VOID", "C-113.37", KEPT_THREE.DETERMINATION_VOID[2]]);
});

/* The answer of a re-worded refusal: its code, its row and words.json's sentence, never T45's. */
const answers = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  const row = CONFORMANCE_CHECKS[code];
  assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, row.check, row.translation], code);
  if (code in TAKEN) {
    assert.equal(r.translation, en(`refusal.${code}`), code);
    assert.ok(!JSON.stringify(r).includes(T45[code]), `${code}: T45's words not answered`);
  }
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

test("R38 C-113.38: determine naming another group's determination is answered with words.json's refusal.DETERMINATION_NOT_ADOPTABLE, writing nothing; the same call without it lands (control)", () => {
  const { w, input } = scene();
  for (const over of [{ adopts: "imported:" + "a".repeat(64) + "/CONF-2026-0001-determination" },
                      { supersedes: "imported:" + "a".repeat(64) + "/CONF-2026-0001-determination", reason: "theirs" }])
    answers(nothing(w, () => w.c.determine(input(over))), "DETERMINATION_NOT_ADOPTABLE");
  assert.equal(w.c.determine(input()).ok, true, "the control");
});

/* The scene's noncompliant determination of the office's act on 2026-03-02, and a later act of the same office
   (2026-04-01) a member determined compliant against the same standard (t45's cure scene). */
function cureScene() {
  const s = scene();
  const { w, std, ev, input } = s;
  const target = w.c.determine(input());
  const later = w.event(ev, { date: "2026-04-01" });
  const compliant = (over = {}) => input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
                                           rows: [{ ...input().rows[0], reading: "aligns" }], ...over });
  const cure = w.c.determine(compliant());
  assert.deepEqual([target.ok, cure.ok], [true, true], JSON.stringify(cure).slice(0, 300));
  const link = (over = {}) => ({ determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive"), ...over });
  return { ...s, target, cure, compliant, link };
}

test("R38 C-113.39–C-113.43: cureLink's and cureUnlink's re-worded refusals are answered with words.json's sentences, each writing nothing, behaviour unmoved; the compliant later act of the same office links (control), and a second link is still CURE_LINKED in its kept words", () => {
  const { w, ev, input, cure, compliant, link } = cureScene();
  /* C-113.39: a machine or empty author, on the link and on its ending */
  for (const author of [MACHINE, "", null]) answers(nothing(w, () => w.c.cureLink(link({ author }))), "MACHINE_CANNOT_LINK_CURE");
  answers(nothing(w, () => w.c.cureUnlink({ link: "CURE-2026-0001", reason: "r", author: MACHINE, viewer: MACHINE })),
          "MACHINE_CANNOT_LINK_CURE");
  /* C-113.40: the target not noncompliant against the standard */
  answers(nothing(w, () => w.c.cureLink(link({ determination: cure.id, cure: cure.id }))), "CURE_TARGET_NOT_NONCOMPLIANT");
  /* C-113.41: the cure not compliant against it */
  const nc = w.c.determine(input({ act: { ...input().act, event: cure.act.event } }));
  answers(nothing(w, () => w.c.cureLink(link({ cure: nc.id }))), "CURE_NOT_COMPLIANT");
  /* C-113.42: another office's act */
  const clerk = w.c.determine(compliant({ act: { ...input().act, event: cure.act.event, actor: { role: "City Clerk", body: "Office of the Clerk" } } }));
  assert.equal(clerk.ok, true, JSON.stringify(clerk).slice(0, 300));
  answers(nothing(w, () => w.c.cureLink(link({ cure: clerk.id }))), "CURE_OTHER_OFFICE");
  /* C-113.43: not later (the same day), and an order undetermined (an act placed nowhere) */
  const same = w.c.determine(compliant({ act: { ...input().act, event: w.event(ev, { date: "2026-03-02" }) } }));
  const r = nothing(w, () => w.c.cureLink(link({ cure: same.id })));
  answers(r, "CURE_NOT_LATER");
  assert.equal(r.order, "not_later");
  const nowhere = w.c.determine(compliant({ act: { ...input().act, event: w.event(ev, { date: null }) } }));
  const u = nothing(w, () => w.c.cureLink(link({ cure: nowhere.id })));
  answers(u, "CURE_NOT_LATER");
  assert.equal(u.order, "undetermined");
  /* the control lands; a second answers C-113.44 in its kept words */
  const ok = w.c.cureLink(link());
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const twice = nothing(w, () => w.c.cureLink(link()));
  answers(twice, "CURE_LINKED");
  assert.equal(twice.translation, KEPT_THREE.CURE_LINKED[2]);
  /* a member ends the link (the control of cureUnlink's machine refusal) */
  assert.equal(w.c.cureUnlink({ link: ok.link, reason: "recorded in error", author: V("olive"), viewer: V("olive") }).ok, true);
});

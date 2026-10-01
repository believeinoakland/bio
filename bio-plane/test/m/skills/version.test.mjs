import { test } from "node:test";
import assert from "node:assert/strict";
import { checkSkillVersion, parseSkillVersion, renderPack, SKILL_CHECKS, SKILL_CHECK_KEYS }
  from "../../../src/skillpack.mjs";
import { CLAUSES } from "../../../src/skilldoctrine.mjs";
import * as runRules from "../../../src/run-rules/index.mjs";
import { published } from "./fixture.mjs";

/* C-22.7's row, read through run-rules (its AI_RUN_CHECKS, R11), never from the catalogue: the row this module names
   is run-rules' (R25, N289, K617), and the catalogue's interim copy left in T12 (N299, K381). */
const ROW = runRules.AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED;

/* Every value R12 refuses, and every value it accepts, the malformed ones one of each shape. */
const REFUSED_BLANK = [undefined, null, 0, 3, true, {}, [], "", " ", "\t\n  "];
const REFUSED_MALFORMED = ["3", "pack", "@1", "pack@", "a@b@c", "pack @1", "pack@1 +x", "pa\tck@1", "@", "x".repeat(200)];
const ACCEPTED = ["pack@1", "investigative-session@1+0123456789abcdef", "  other-pack@7  ", "p@e+", "p@e+d+e", "a.b@c-d"];

test("R12 a non-string, empty or all-blank version is refused as C-22.7", () => {
  for (const v of REFUSED_BLANK) {
    const r = checkSkillVersion(v);
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "translation"], JSON.stringify(v));
    assert.equal(r.ok, false);
    assert.equal(r.code, "AI_RUN_SKILL_VERSION_UNNAMED");
    assert.equal(r.check, "C-22.7");
    assert.equal(r.translation, ROW.translation);
    assert.ok(r.detail.length > 0);
  }
});

test("R12 a trimmed value not <pack>@<edition> with no whitespace and exactly one @ is refused, its detail quoting at most 60 characters", () => {
  for (const v of REFUSED_MALFORMED) {
    const r = checkSkillVersion(v);
    assert.equal(r?.code, "AI_RUN_SKILL_VERSION_UNNAMED", JSON.stringify(v));
    assert.equal(r.check, "C-22.7");
    assert.equal(r.translation, ROW.translation);
    const quoted = r.detail.match(/^'([^']*)'/)?.[1];
    assert.equal(quoted, v.trim().slice(0, 60), `the detail quotes the value: ${r.detail}`);
    assert.ok(quoted.length <= 60);
  }
});

test("R12 R13 checkSkillVersion and parseSkillVersion are run-rules' own (its R8), re-exported with no copy", () => {
  assert.equal(checkSkillVersion, runRules.checkSkillVersion);
  assert.equal(parseSkillVersion, runRules.parseSkillVersion);
});

test("R12 every well-formed value is accepted, including one this module never rendered, and a rendered version is", () => {
  for (const v of ACCEPTED) assert.equal(checkSkillVersion(v), null, v);
  assert.equal(checkSkillVersion(renderPack(published()).version), null);
  for (const v of [...REFUSED_BLANK, ...REFUSED_MALFORMED, ...ACCEPTED])
    assert.doesNotThrow(() => checkSkillVersion(v));
});

test("R13 parseSkillVersion returns {pack, edition, digest} for an accepted value and null for a refused one; never throws", () => {
  assert.deepEqual(parseSkillVersion("pack@1"), { pack: "pack", edition: "1", digest: null });
  assert.deepEqual(parseSkillVersion("  other-pack@7  "), { pack: "other-pack", edition: "7", digest: null });
  assert.deepEqual(parseSkillVersion("investigative-session@1+0123456789abcdef"),
    { pack: "investigative-session", edition: "1", digest: "0123456789abcdef" });
  assert.deepEqual(parseSkillVersion("p@e+"), { pack: "p", edition: "e", digest: "" });
  assert.deepEqual(parseSkillVersion("p@e+d+e"), { pack: "p", edition: "e", digest: "d+e" });
  const pack = renderPack(published());
  assert.deepEqual(parseSkillVersion(pack.version),
    { pack: pack.id, edition: pack.edition, digest: pack.version.split("+")[1] });
  for (const v of [...REFUSED_BLANK, ...REFUSED_MALFORMED]) assert.equal(parseSkillVersion(v), null, JSON.stringify(v));
  for (const v of ACCEPTED) assert.notEqual(parseSkillVersion(v), null, v);
});

test("R25 C-22.7 is named here by key through run-rules, never copied: its code, number and translation unchanged, and SKILL_CHECKS' row is the one checkSkillVersion mints", () => {
  assert.deepEqual(SKILL_CHECK_KEYS, ["AI_RUN_SKILL_VERSION_UNNAMED"]);
  assert.deepEqual(Object.keys(SKILL_CHECKS), ["AI_RUN_SKILL_VERSION_UNNAMED"]);
  assert.equal(SKILL_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED, ROW, "run-rules' row, never a copy");
  assert.equal(ROW.check, "C-22.7");
  assert.equal(runRules.translationOf("AI_RUN_SKILL_VERSION_UNNAMED"), ROW.translation, "run-rules resolves the code to this row");
  assert.equal(ROW.translation, "This run did not say which version of its instructions it was working under. "
    + "What a run found can only be read against the instructions it was given, so the record "
    + "asks for that version before the run starts rather than guessing at it afterwards.");
  const r = checkSkillVersion("");
  assert.deepEqual([r.code, r.check, r.translation], ["AI_RUN_SKILL_VERSION_UNNAMED", ROW.check, ROW.translation]);
  assert.ok(CLAUSES.some((c) => c.enforced_by.includes(ROW.check)), "the doctrine cites the row by its number");
});

test("R25 C-22.7's row is held in run-rules' own table with its one minting site", () => {
  assert.ok(ROW.where.startsWith("src/run-rules/skill-version.mjs checkSkillVersion"), `run-rules' minting site: ${ROW.where}`);
  /* The arm walking the check catalogue for a copy is dropped (K787 (3)): no catalogue copy has been held since
     N299, the catalogue is deleted at T19's close, and a code minted in two modules is ai-runs' guard's (N242 G). */
});
